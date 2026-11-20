# Les règles

> **Le mapping** est l'ensemble des règles de correspondance qu'une
> migration applique pour porter les données d'une description vers une
> autre. Le concepteur les écrit pour une reprise, une règle par fichier
> de `mapping/` ([glossaire](../../glossaire.md)).

Ce fichier dit comment une règle s'écrit : son sens et sa clé, sa
description et ses formes longues, le partage entre fichiers, le
possesseur et la clé lue. Ce que la règle contrôle est dans
[les contrôles](05-controles.md). Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [Le sens et la clé](#le-sens-et-la-clé)
- [La description et les formes longues](#la-description-et-les-formes-longues)
- [Le partage entre fichiers](#le-partage-entre-fichiers)
- [Le possesseur et la clé lue](#le-possesseur-et-la-clé-lue)

## Le sens et la clé

**Le sens : de la table source vers la table cible** (D655) — chaque
table source déclare où vont ses colonnes. **La forme de la règle**
(D656) : la règle au nom de la table source — `to:` la cible (entité
ou agrégat), `parent:` le possesseur par ses champs mappés (D931),
`fields:` les expressions du langage unique, `validation:` les
contrôles de chaque ligne importée (D932), `report:` le rapport de
ses rejets (D929), `operations:` l'expression exécutée pour chaque
ligne construite. Ce mot est aussi celui des opérations d'un processus
et de la liste de ce qu'une opération lance : la même question dans
trois contextes (D1942). **La clé fonctionnelle ne se déclare pas** (D930 — `key:`
retirée) : c'est l'identité de la cible, alimentée par `fields:`.

**La construction et la clé fonctionnelle** (D654) : le mapping
construit l'enregistrement avant sa validation (D177 — converti ET
cohérent, l'écriture par le chemin standard D175) ; **la clé
fonctionnelle** (D142/D398 — l'`identity:` de la cible, que la règle
alimente par `fields:`, D930) l'identifie — le rejeu sans doublon, et
**les origines multiples se rejoignent par la clé** : la jointure
n'est pas une syntaxe, c'est la clé (D655). **Quand plusieurs règles
alimentent le même champ du même enregistrement, la dernière mise à
jour l'emporte** (D1951) : les contributions se fondent champ par
champ, dans l'ordre où les règles s'exécutent. Elle lie aussi **les
agrégats** : la ligne retrouve sa commande, l'association son
vis-à-vis.

```yaml
# mapping/customers.yml — une règle par table source
customers:
  to: sales.customer                  # la cible
  fields:
    code:    code                     # l'identité alimentée = la clé du rejeu
    name:    upper(name)
    balance: amount(bal_cts / 100)

# mapping/customer_notes.yml — la seconde origine, même cible
customer_notes:
  to: sales.customer
  fields:
    code:  customer_code              # la même identité — les contributions se rejoignent
    notes: text

# mapping/order_lines.yml — la composition par la clé
order_lines:
  to: sales.order.lines               # l'agrégat : la ligne rejoint sa commande
  parent: { order: order_no }         # le possesseur par ses champs mappés — à un champ, le raccourci
  fields:
    number:   line_no                 # l'identité de la ligne au sein du possesseur
    item:     item_code
    quantity: qty
```

*Les décisions de cet exemple : D655–D656, D654/D930, D931, D841.*

## La description et les formes longues

**La description et les formes longues (D1100/D1105).** La règle se
décrit en `description:` — ce que la documentation doit porter
s'écrit en propriété, pas en commentaire (D1100). **Une affectation
reste une formule** : `champ: formule`, qui se lit d'elle-même ;
quand elle demande un complément, **sa forme longue** — `formula:` la
formule, `description:` le complément, `message:` le texte de
l'anomalie si l'affectation échoue. **Une validation de même** : `-
expression` en forme courte, ou `rule:`, `description:`, `message:`.
La clé d'une référence composée s'écrit entre crochets, une liste de
paires : `article: [code: LCCTCODART, complement: LCCTCOMART]`. La forme
longue reste seule à s'écrire en carte (D1941).
**Le `message:` est un gabarit** (D1106) : les accolades du langage
unique (D6/D90) y citent une valeur de la source — `{LCCTCODART}`, la
colonne lue — ou une propriété de l'enregistrement construit —
`{me.unite}`, `{me.article.code}` ; le texte se résout à l'échec, et
l'anomalie garde le message résolu. Ce n'est pas l'interpolation
`${…}` de la configuration, résolue au chargement (D802). Entre les
accolades, un nom, un chemin ou une expression du langage unique ;
une valeur nulle s'écrit vide ; à la source et à l'entité, les mêmes
accolades citent la colonne lue ou le champ.

## Le partage entre fichiers

**Les champs mutualisés par la référence de fichier (D967).** Quand
plusieurs règles portent le même bloc `fields:` — les quatre règles de
l'article du cas 5, une par dérivé filtrée sur le code de gestion
(D940) —, le bloc vit une fois et chaque règle l'inclut, comme
l'entité le fait (D767/D956) : `fields: ~{articles/fields.yml}`, le
chemin relatif au fichier (D768) ; le fichier inclus n'a pas de
préfixe numérique, il est hors du pattern des règles (D806) — il
n'est pas une règle, il est inclus ; la règle ne garde que ce qui la
distingue : `to:`, `filter:`, `report:`.

```yaml
# migration/mapping/3_technique/02_fabriques.yml — la règle réduite à ce qui la distingue
ARTICLE:
  to: technique.fabrique
  filter: ARCTFATN = "01"
  fields: ~{articles/fields.yml}   # le bloc commun aux quatre règles de l'article
  report: { when: [migration], to: [bureau_etudes], by: [notification, mail] }
```

*Les décisions de cet exemple : D967.*

**Le cumul de fichiers sous une carte (D968).** Plusieurs fichiers
l'un derrière l'autre : **la liste de références, en bloc** (jamais en
flux — l'accolade y casse YAML, D956), sous toute propriété qui porte
une carte (`fields:`, `values:`, `parameters:`…) ; **la fusion dans
l'ordre** — la carte est l'union des clés ; **la même clé deux fois =
une surcharge**, le dernier l'emporte, **une alerte levée à
l'ingestion** ; **le pattern y vaut** (`- ~{articles/.*\.yml}`,
l'ordre alphabétique D665) ; **l'élément est une référence de fichier
ou une carte en ligne**, fusionnée comme un contenu de fichier — « plus
élégante… plus en lien avec des approches classiques ».

```yaml
# Les affectations, en plusieurs fichiers
fields:
  - ~{articles/commun.yml}          # un fichier — son contenu
  - ~{articles/nomenclature.yml}    # un autre, fusionné à la suite
  - actif: ARCTBLOCAG = ""          # une carte en ligne — les champs propres à cette règle
    date_creation: ARCJCRE
```

## Le possesseur et la clé lue

**`parent:` par les champs mappés du possesseur (D931).** « Les
champs clés sont les champs mappés et non les champs sources… car un
champ mappé peut être converti ou transformé avant de vérifier la
clé. » La clé du possesseur se vérifie sur les valeurs construites :
`parent:` nomme les champs de l'identité du possesseur, chacun avec
l'expression qui produit, depuis la ligne fille, la valeur telle que
la règle du possesseur l'a construite — `parent: { <possesseur>:
[<champ d'identité>: <expression>, …] }`, les paires entre crochets
(D1943). L'identité à un champ garde le
raccourci (`parent: { compte: Numero_Compte }`) : l'expression seule,
le champ implicite. **La référence par clé composée dans `fields:`
porte les mêmes paires, entre crochets** (D1941). La conversion écrite deux fois — chez le
possesseur et dans chaque `parent:` — est un risque d'entretien : la
normalisation à la source (D660/D872) fait lire aux deux règles des
colonnes déjà converties, et `parent:` ne porte alors que des colonnes
nues. **`parent:` peut nommer le parent d'une hiérarchie** (D969) :
l'identité déclarée chez le parent est partagée par ses dérivés
(D353), le moteur retrouve l'enregistrement quelle que soit sa classe
et attache la ligne à sa composition ; si l'enregistrement retrouvé ne
porte pas la composition visée, la ligne est un rejet au rapport
(D933) — le cas 5 : `parent: { article: [code: NOKTCODPF, complement:
NOKTCOMPF] }` retrouve le fabriqué, le semi-fini ou le fantôme qui
porte la nomenclature ; un acheté avec des composants se voit.

```yaml
# migration/mapping/3_technique/01_articles.yml — le possesseur construit son identité
ARTICLE:
  to: technique.article
  fields:
    code:       ARKTCODART
    complement: ARKTCOMART            # souvent vide — le nul du texte est la chaîne vide, rien à convertir
    libelle:    ARCTLIB01

# migration/mapping/3_technique/05_nomenclatures.yml — la fille présente les mêmes colonnes
NOMENC:
  to: technique.nomenclature                             # l'entité fille, comme banque.ecriture
  parent:
    article: [code: NOKTCODPF, complement: NOKTCOMPF]    # le possesseur, par ses champs mappés
  fields:
    numero:    NOKNLIGNOM
    composant: [code: NOCTCODECP, complement: NOCTCOMCPT]   # la référence par la clé composée, entre crochets
    quantite:  NOCNQTECOM
```

*Les décisions de cet exemple : D990, D931/D990, D969, D1943, D1941.*

**La conversion d'une clé se fait à la lecture (D990).** Quand
l'identité du possesseur demande une vraie conversion — une casse, un
préfixe, un cadrage —, elle ne s'écrit ni dans la règle ni dans chaque
`parent:` : **`normalize:`** sur la colonne de la source (D872 — la
fonction à la frontière, surchargeable par champ : `normalize:
right("0000" + me, 4)` ; ici, `normalize:` est un usage, ses fonctions
et ses méthodes sont au
[catalogue des fonctions](../03-langage/04-fonctions.md),
D1924) ou le calculé de la source (D660) ; la règle
et les `parent:` lisent des colonnes déjà converties, la conversion
n'est écrite qu'une fois, là où la donnée entre.
