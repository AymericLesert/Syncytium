# Les contrôles

> **La validation** réunit les règles de refus : sur une valeur, ou sur
> la cohérence d'un enregistrement. Toute règle enfreinte refuse et
> trace ([glossaire](../../glossaire.md)).

Ce fichier dit ce qu'une reprise contrôle : la validation et son
message, les rapports, les phases de contrôle, ce que la reprise écrit
et ce qu'elle laisse. Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [La validation et son message](#la-validation-et-son-message)
- [Les rapports](#les-rapports)
- [Les phases de contrôle](#les-phases-de-contrôle)
- [Ce que la reprise écrit, ce qu'elle laisse](#ce-que-la-reprise-écrit-ce-quelle-laisse)

## La validation et son message

**Les deux formes de la validation, le message construit** (D1116–D1117).
La forme courte `- expression` et la forme longue `rule:` / `description:` /
`message:` se mêlent dans une même liste, au champ (D364), à l'entité (D404) et
à la règle. Sans `message:`, l'échec produit un message construit qui cite la
règle, les valeurs des champs qu'elle cite et les valeurs de la clé de
l'enregistrement ; la `description:` n'y entre pas, un `message:` explicite
l'emporte. Le message construit se compose d'un label par opérateur, un
gabarit du catalogue des textes du moteur : sa mise en forme, ses
traductions et sa réécriture par le projet se font sans toucher au code
de Syncytium (D1944). Le label se nomme
`_syncytium.<opérateur>.validation` ; un second,
`_syncytium.<opérateur>.description`, donne la traduction littérale
d'une règle, pour la documentation (D1945, D1948). L'opérateur s'y
écrit par son nom, `equal`, `in` ; le gabarit cite `{left}`, `{right}`,
`{left_value}` et `{right_value}` (D1949). `not`, `and`, `or` et `xor`
assemblent les messages de leurs membres, à gauche et à droite (D1947).
**Le `message:` est facultatif** dès que le catalogue couvre tous les
labels ; le concepteur peut le surcharger (D1946 — D1117 l'exigeait dès
que la version avait plusieurs langues).

```yaml
# migration/mapping/4_commande/04_lignes_achats.yml — la description, les formes longues
LCOMFOU:
  description: >-
    Les lignes des commandes d'achat, composition de l'entête : le possesseur est la révision de la commande, son
    numéro et son indice ; l'identité d'une ligne est son numéro.
  to: commande.ligne_achat
  parent:
    commande_achat: [numero: numero, indice: LCKTPSF]
  fields:
    numero:  ligne
    article: [code: LCCTCODART, complement: LCCTCOMART]     # la clé de la référence, entre crochets
    quantite_recue:
      formula: LCCNQTEEXP
      description: L'expédié de PMI, reçu chez l'acheteur.
  validation:
    - rule: me.unite in me.article.unite.units
      description: L'unité de la ligne est l'une de celles que son article connaît.
      message: L'unité {me.unite} de la ligne n'est pas une unité connue de l'article {LCCTCODART}.   # le gabarit
```

*Les décisions de cet exemple : D1105/D1106, D1941, D1106.*

## Les rapports

**Le rapport des rejets porté par la règle (D929).** « Chaque règle
de migration a un report. Pas un report général. » La règle sait sa
source, sa cible et qui corrige l'origine : elle déclare `report:`
sous la forme validée de D406 (`when:` les rythmes, `to:` le groupe
ou l'utilisateur, `by:` les canaux) pour les enregistrements qu'elle
construit et que la cible refuse (D177 — la conversion échouée, sa
propre `validation:` D932, le contrat de la cible, la référence non
résolue). Sans `report:`, le
défaut de D407 tient : à la demande, vers l'administrateur, par les
surfaces du module `_migration` (D666). Aucun rapport général — ni à
la migration déclarée (D662), ni au module ; la cascade de D407 reste
celle du modèle (les non-conformes des références, D395). **Les
anomalies du modèle** — la colonne non décrite, le type non
convertible, la colonne décrite disparue, l'identité non respectée
(D1042/D1053) — ne sont pas des rejets de règle : elles vont au
concepteur par le module `_migration` ; **celles des données de la
source** — ses phases de contrôle, le type, l'identité, l'orphelin —
vont au `report:` de l'entité source (D1058, ci-dessous).

**Le rapport de l'entité source (D1058).** « L'entité source déclare son
propre report: » — les anomalies des phases de la source (la
validation de ses données, ses propres règles) vont aux destinataires
que l'entité source déclare, sous la même forme (`when:`, `to:`, `by:`) ;
la règle garde son `report:` pour les siennes.

```yaml
# migration/mapping/3_technique/01_articles.yml — le rapport porté par la règle
ARTICLE:
  to: technique.article
  fields:
    code: ARKTCODART
    libelle: ARCTLIB01
  report:
    when: [migration]              # après chaque passage de la règle
    to: [production]               # le destinataire qui corrige l'origine
    by: [notification, mail]
```

*Les décisions de cet exemple : D929, D406/D407, D859.*

## Les phases de contrôle

**`validation:` dans les cinq phases de contrôle (D932, amendé par
D1033/D1040).** Les trois places de la même grammaire (D404) —
l'entité source, la règle, l'entité de destination — prennent leur
rang dans le déroulé d'un passage ([migration.md](../../migration.md)) :
**(1) la validation des données sources** — après le `filter:`, les
colonnes converties du type lu au type décrit, l'identité, les liens
(l'orphelin) ; **(2) la vérification des règles sources** — les
`validation:` de l'entité source, sur la ligne lue ; **(3) le
mapping** — `fields:` construit l'enregistrement dans la base miroir
(D1044) ; **(4) la validation des règles du mapping** — les
`validation:` de la règle, les colonnes source à nu, l'enregistrement
construit par `me` ; **(5) la validation des règles de destination**
— après la lecture de toutes les données, sur la base miroir
complète, avant l'enregistrement : les contraintes et les
`validation:` du modèle, avec les enfants (D933). **Chaque phase
relève toutes ses erreurs**, et l'enregistrement en erreur ne passe
pas à la phase suivante (D1057) ; chaque erreur garde un message
clair, pour le rapport — le `message:` de la forme longue quand il est écrit
(D1105). Les trois temps, redits par l'auteur (D1006)
: sur la source à la lecture — limite les enregistrements aux valeurs
valides ; sur le mapping — identifie les règles non respectées ou les
données incorrectes ; sur la destination — garantit que les règles
des données entreposées sont correctes. Une contrainte du modèle n'a
pas à être redite par la règle ; et une grandeur « à titre
indicatif » ne se valide pas, ses cas limites s'observent.

```yaml
# migration/sources/technique/NOMENC.yml — la phase 2 : les règles de la source, sur la ligne lue
NOMENC:
  validation:
    - NOCJFINVAL >= NOCJDEBVAL if NOCJFINVAL is not null and NOCJDEBVAL is not null

# migration/mapping/3_technique/05_nomenclatures.yml — la phase 4 : la source à nu, le construit par me
NOMENC:
  to: technique.ligne_nomenclature
  fields:
    nature:   nature_n                                 # le calculé de normalisation à la source
    quantite: NOCNQTEUNI
  validation:
    - me.quantite > 0 if me.nature = "composant"       # le construit
    - NOCTCODOPE is not null if me.nature = "operation"    # la source et le construit

# technique/ligne_nomenclature/ligne_nomenclature.yml — la phase 5 : sur la base miroir complète
validation:
  - composant is not null if nature = "composant"
```

*Les décisions de cet exemple : D660.*

**L'échec dans une composition (D933).** « Si un échec est vu sur le
parent, tous les composants sont en échec. Si un composant est en
erreur et pas sur le parent, le parent est créé sans le composant en
erreur. Par contre, la règle de validation sur un enregistrement du
parent vérifie le fonctionnement de son enregistrement et de ses
enfants. Et, là, c'est l'enregistrement du parent et de tous ses
enfants qui sont en échec. » Trois cas : l'échec propre du parent (sa
conversion, sa `validation:`, sa référence) entraîne ses composants ;
l'échec propre d'un composant (sa conversion, sa `validation:` à la
règle ou à l'entité, sa référence — l'orphelin D875) ne rejette que
lui, le parent entre sans lui ; la `validation:` du parent qui lit
ses enfants (`lignes.count() > 0`, une somme) s'évalue en phase 5
(D1033), sur le parent et tous ses enfants, et son échec rejette le tout. L'agrégat reste le
grain d'écriture (D420) : ce qui s'écrit est le parent avec ses
composants conformes. Au cas 5 : l'article entre sans la cellule
tarifaire fautive, ses mouvements le trouvent ; la commande sans
ligne valide tombe entière. Le rapport nomme la cause — le parent, ou
la ligne (mien).

## Ce que la reprise écrit, ce qu'elle laisse

**Ce que la reprise écrit, ce qu'elle laisse (D1964).** Le chapitre
énonce la doctrine en quatre cas ; les mécanismes gardent leur
définition dans leur chapitre, `unmapped:` et `default:` au
[modèle](../02-modele/03-champs.md), le typage au
[langage](../03-langage/README.md) :

- le champ qu'aucune règle n'alimente reste tel quel ;
- le champ `unmapped: true` n'est jamais écrit par la migration ;
- sur un champ alimenté, la source fait foi — le principe se dit ici,
  le différentiel qui l'applique est au chapitre 9 (D1966) ;
- le texte trop long pour sa cible se refuse à l'ingestion.

**Le texte trop long (D581).** Un `text[30]` de la source vers un
`text[..20]` de la cible est une conversion avec perte : le typage
statique la refuse à l'ingestion — ni troncature silencieuse, ni rejet
à l'exécution ; le concepteur l'écrit s'il la veut, `left(ARCTLIB01,
20)` (les fonctions du texte, D934).

**L'enrichissement — le champ possédé par la cible (D941).** Le
différentiel ne compare que l'enregistrement construit, donc les
seuls champs que les règles alimentent : un champ qu'aucune règle
n'alimente reste tel quel — « la doctrine est bonne » ; `reset:
false` la garde. Le champ obligatoire naît à sa valeur : « le
default: répond à ce besoin ». Et le champ qu'un écran de saisie
remplit se protège par la propriété **`unmapped: true`** (`false`
par défaut) : « pour un nouvel enregistrement, la valeur est la
valeur par défaut. Si l'enregistrement existe, la valeur du champ
reste sa valeur » — la migration ne l'écrit jamais, la saisie reste
libre (la différence avec `mode: write-once`, immuable pour tous) ;
« unchanged est lié à la migration et aux règles de migration. Une
règle qui alimente l'un de ces champs serait une erreur d'ingestion ».
La propriété s'appelait alors `unchanged:` ; elle se nomme `unmapped:`,
le champ tenu hors du mapping (D1965).
Le cas 5 : `note_interne` sur le tiers, aucune colonne PMI, née à
`""`, ouverte au commercial et aux achats par l'allow au champ
(D886/D942) — la note de l'acheteur survit à chaque nuit.
