# Les hooks de Syncytium

Ce document rassemble **les échanges consignés sur les hooks** — le
mécanisme unique d'extension de Syncytium. Il prépare la documentation
à rédiger (Q58, le domaine 6 — D602) et suit le vocabulaire du
[glossaire](glossaire.md) ; les décisions citées renvoient à la
[conception](conception.md) ; les composants graphiques au
[catalogue](syncytium/04-composants/README.md).

**Cet artefact n'a pas de chapitre** (D1673) : « les hooks sont meme à
décrire à la fin de chaque chapitre où pouvons en avoir ». Le
mécanisme et la déclaration vont au chapitre 1, chaque famille à la fin
du chapitre de ses composants — les types et leurs méthodes au 2
(D1674, D1702), les composants au 4, les connecteurs au 5, les opérations au
6 (D1675) ; la lecture en cours prépare cette distribution. **Le mécanisme est écrit au chapitre 1** (D1692), [04-version.md](syncytium/01-configuration/04-version.md) § 3.9 ; **le type et ses méthodes au chapitre 2** (D1698), [02-modele/hooks.md](syncytium/02-modele/08-hooks.md) ; **le composant au chapitre 4** (D1705), [04-composants/hooks.md](syncytium/04-composants/07-hooks.md) ; la doctrine, la maison et les fiches ci-dessous restent jusqu'à la dissolution.

**Le périmètre** (D1669) : la déclaration d'un hook dans
la configuration — les familles, la chaîne des fichiers, la fiche et
ses clés, les paramètres, les traces, la description par langue, les
défauts et l'usage du nom ajouté. Ce que le code d'un hook livre, et
comment il l'écrit — le langage, la sandbox, la forme technique de la
signature, l'API appelée — relève de l'architecture (le domaine 7,
D570, D602), qui n'est pas posée : le chapitre reste partiel sur ce
point jusque-là.

## La doctrine

- **Un seul mécanisme, dedans comme dehors** (D52 ; l'origine, D37 :
  une extension déployée en même temps que la description, en trois
  modes — le calcul d'un champ, la tâche, le comportement de
  l'interface) : les hooks, les
  connecteurs et les composants relèvent d'un mécanisme uniforme —
  ce que Syncytium embarque et ce que le concepteur ajoute passent
  par la même porte ;
- **« Tous les types proposés sont finalement des hooks qui
  appartiennent à Syncytium »** (D408) — **le catalogue = les hooks
  embarqués** : le socle n'est pas un cas particulier, il est le
  premier client du mécanisme ;
- **Le mot « hook » n'apparaît jamais dans la configuration**
  (D408) : un hook ajoute **un nom** au catalogue concerné (un type,
  un composant, une opération, un connecteur — quatre
  familles, D1671, D1672, D1702) — et ce
  nom s'emploie comme un nom du socle ; le doublon de nom = une
  erreur d'ingestion (D344/D396) ;
- **La première classe** (D65/D68) : un élément ajouté a les mêmes
  droits que le socle — mappable en défaut de type, surchargeable au
  champ ; **le registre est namespacé** (D52), les éléments
  partageables (AGPL — l'écosystème D68) ;
- **La dégradation** (D68) : si un hook échoue, **le repli sur le
  built-in par défaut** ;
- **Un hook de code définit une signature et un code propre au
  langage exploité par Syncytium** (D570) — le langage et la sandbox
  relèvent du domaine 7 (l'architecture technique — D602).

## La maison des hooks — `hooks/` et `hooks.yml` (D644)

Les hooks de l'application vivent **à la racine de la version** : le
dossier `hooks/`, **un sous-dossier par type de hooks** ; **la
chaîne à deux étages** (D644/D777 — le patron des modules
D765/D766) : `hooks.yml` référence **les fichiers de famille**,
chaque fichier de famille **liste ses fiches** (l'énumération ou le
pattern regex — D806), **la fiche du hook** (D809) portant `name`,
`description`, `code`, `properties`, quand il embarque des
bibliothèques `dependencies` (D1432), et quand il émet des erreurs
propres `errors`, codifiées par langue (D1458, D1461) — les chemins relatifs au
fichier courant (D768). Les hooks du socle vivent dans
l'arborescence de Syncytium — la même porte (D52), deux maisons.

```text
versions/<statut>/<version>/
├── version.yml                     # déclare hooks: — le lien (D805)
├── hooks/
│   ├── hooks.yml                   # → les fichiers de famille (D777)
│   ├── operations/operations.yml   # → les fiches (le pattern — D806)
│   │   └── <verbe>/                #   la fiche, le md, le source (D809)
│   └── types/ · components/ · connectors/
└── <modules>/
```

*(Le nommage et l'organisation restent libres — D807 : l'arbre
ci-dessus est la convention du cas 4.)*

Dans le cas 4 (banque), `hooks/hooks.yml`, l'étage des familles (D777) :

```yaml
# Les familles de hooks
# Une famille par fichier ; le projet n'a que des opérations.
operations: ~{operations/operations.yml}
```

`hooks/operations/operations.yml`, la liste des fiches par le motif (D806) :

```yaml
# Les opérations du projet
# Un dossier par opération, listés par le motif : le fichier au nom de l'opération, sa documentation et son code.
operations:
  - ~{.*/.*\.yml}
```

`hooks/operations/dupliquer/dupliquer.yml`, la fiche du hook (D809) :

```yaml
# L'opération dupliquer
# La duplication d'une écriture entre deux dates, au pas choisi.
name: dupliquer

# La description
# La documentation de l'opération, en Markdown, une par langue de la version.
description:
  fr: ~{documentation.fr.md}
  en: ~{documentation.en.md}
  es: ~{documentation.es.md}

# Le code
code: ~{source.txt}

# Les propriétés
# Aucune.
properties: { }
```

Les `properties:` sont les paramètres du hook : le mode, le nom, le
type, la valeur par défaut (D1535). Deux clés s'ajoutent à la fiche
quand le hook en a besoin (D1667) : `dependencies:`, les bibliothèques
embarquées — le nom, la version, la licence (D1432) —, et `errors:`,
les traces codifiées du hook, `~{errors.yml}` (D1461, D1463). Absentes,
le hook n'embarque aucune bibliothèque et n'émet aucune trace propre.

**Chaque hook s'accompagne d'un fichier md par langue qu'il supporte**
(D778 — la fiche le référence par `description:`, D809 ; D1403 — un md
par langue, avec les gabarits de D562 qui y insèrent les `properties` et
la déclaration du hook) décrivant son fonctionnement — la brique humaine
de la documentation générée ; Syncytium décrit ses propres hooks de
même, dans sa section `hook:`, une sous-section par famille, une par
implémentation (D1403). Un
dossier par hook ou tout dans un même fichier : l'éclatement est
libre (D767/D807/D809). **La documentation fonctionnelle reprend ce md
comme la description de l'opération** — « ce qu'elle fait », dans la
section de l'entité (D1196/D1227) ; une opération qui en enchaîne
plusieurs se décrit par la liste de ses étapes, chacune avec sa
description (D1227). Le md est une configuration : il ne cite ni
décision ni histoire du cas (D1085).

**Les traces codifiées** (D1461–D1463, la forme confirmée, D1685 — le
gabarit sur le message, la description et chaque nœud ; l'arbre en
nœuds, une analyse et des branches, acyclique par construction ; **le
raccourci selon le niveau** : une trace `debug` n'a que son code et son
message, une `error` le détail entier, l'arbre compris). L'exemple est
inventé, aucun cas n'en porte ; `hooks/operations/virer/errors.yml` :

```yaml
# Les traces du hook, par code : le détail croît avec le niveau.

# Une trace : le code, le niveau et le message suffisent.
D001:
  # Le niveau de la trace.
  level: debug

  # Le message, un gabarit par langue.
  message: { fr: "Virement de {montant} vers {compte} : les deux écritures créées" }

# Une erreur : le détail entier, l'arbre de résolution compris.
E001:
  # Le niveau de la trace ; le journal le reprend.
  level: error

  # La famille du dépannage : le démarrage, un connecteur, la reprise, une version…
  family: connector

  # La position de sécurité : l'annulation, la page de maintenance, le mode safe.
  safety: cancel

  # Rejouable telle quelle, ou à corriger avant.
  retry: true

  # Qui résout, l'administrateur, le concepteur ou l'intégrateur, et son canal.
  resolver: administrator

  # Les paramètres typés du gabarit.
  parameters: { compte: text, date: date, montant: amount }

  # Le renvoi à une fiche du guide d'exploitation, s'il y en a une.
  procedure: restaurer_enregistrement

  # Le gabarit du journal, par langue.
  message:
    fr: "Le compte cible {compte} est clos depuis le {date}"
    en: "Target account {compte} has been closed since {date}"

  # La description, facultative, par langue.
  description:
    fr: Le virement vise un compte que son titulaire a fermé.

  # L'arbre de résolution : des nœuds, acyclique ; une analyse, des branches, une action à chaque feuille.
  resolution:
    # Un nœud : une analyse, le gabarit résolu.
    check: { fr: "Le compte {compte} est-il réellement clos ?" }

    # Les cas ; une feuille porte une action.
    branches:
      oui: { action: { fr: "Choisir un autre compte cible et relancer le virement de {montant}." } }
      non: { action: { fr: "Rouvrir le compte {compte} depuis sa fiche, puis relancer." } }
```

Le niveau est celui du journal (D737), la famille celle du dépannage
(D1456), le message un gabarit du journal (D562) ; une erreur porte le
détail entier (D1464).

## Les familles

### 1. Le hook de type (D408, D459, D579–D584, D681)

Ajoute **un type** au catalogue — exploitable comme les types
standard (le chaînage possible, les types custom ne portant pas le
graphe de conversion).

**Ce qu'un type ajouté livre** (D1677) — chaque item est décrit à sa
fiche du chapitre 2 ou du chapitre 3 ; un type sans l'un d'eux est
incomplet, et l'ingestion refuse un type sans ses règles de stockage
— le refus, jamais la dégradation en colonne texte, « pour plus de
cohérence » (D1690) :

- **sa signature** (D579–D584) : la conversion au nom du type, la table
  des opérateurs, les comparateurs, le tri, ses fonctions — ses
  méthodes (D1674) — et, pour un composé, l'accès à ses parties
  (D772–D773) ; voir `02-modele/types.md`, « La signature d'un type » ;
- **sa représentation** (D458–D459) : « aucun type sans visage », le
  composant d'écran au nom du type et/ou le rendu de document ; voir
  `02-modele/types.md`, « Le composant par défaut » ;
- **ses règles de stockage** (D681–D684, D1296–D1298) : la déclinaison
  en types élémentaires, la forme pivot, l'identification, les trois
  gestes du champ dont la modification, l'altération et le transcodage
  (D647, D673) ; voir
  `02-modele/types.md`, « La conversion vers le stockage » ;
- **sa facette documentation** (D1301) : la forme en clair, la
  déclinaison, les indicateurs, l'exemple, le marquage, les mots du
  catalogue par langue, que le type ajouté apporte (D1160, D1163) ;
  voir
  `02-modele/documentation.md`, « Les cinq livraisons du hook de
  type » ;
- **ses facettes** (D368 et suivantes) : le tri et le nul, la
  recherche, le masque ; voir `02-modele/types.md`, « Les facettes
  communes ».

La collection est un type comme les autres : ses méthodes, `sum`,
`count`, `avg`, `min`, `max`, `first`, `last`, `any`, `all`, `group`,
`sort`, sont à sa fiche, `02-modele/liens.md`, et leur usage au
chapitre 3, `03-langage/collections.md` (D580, D1015–D1017, D1576).

**Le type `label`** (D585–D586) — le type-hook du socle qui montre la
voie : l'accès au catalogue des labels (D440), les gabarits nommés
paramétrables (`label(mon_nom, { prenom: …, nom: … })` — l'ordre des
mots par langue), et l'enregistrement en paramètre
(`label(mon_nom, customer)` — « le nom des champs devient les
paramètres »).

**Un dérivé ou un hook ?** Le type `progression` — « définir un type
progression… puis un champ avancement de type progression » — est un
`integer[0..100]` rendu par le composant `fuel`. Il ne demande aucun
code : c'est un type dérivé (D359, D992), déclaré dans les settings sous
`field:` (D1239) et décrit au chapitre 2
([05-types.md](syncytium/02-modele/05-types.md), « Les types dérivés »). Le
hook de type sert quand le catalogue n'a pas le type : il apporte un
type nouveau, avec sa signature complète (D1668).

**L'exemple** — un type `isbn`, l'identifiant d'un livre, que le
catalogue n'a pas (`iban`, lui, y est, D391) : la fiche
`hooks/types/isbn/isbn.yml` suit la forme de D809, comme celle de
`dupliquer` ; le code livre la signature — la conversion `isbn(x)`,
l'égalité, le tri, la clé vérifiée, les parties `.group`,
`.publisher` et `.title`, la déclinaison en `text[..17]` (D1298), le
composant `isbn` (D458) :

```yaml
# Le type isbn
# Un identifiant de livre, vérifié par sa clé ; ses parties : le groupe, l'éditeur, le titre.
name: isbn

# La description
# La documentation du type, en Markdown, une par langue de la version.
description:
  fr: ~{documentation.fr.md}
  en: ~{documentation.en.md}

# Le code
# La signature du type et son composant.
code: ~{source.txt}

# Les propriétés
# Les formes admises, à dix ou treize chiffres ; vide, les deux le sont.
properties:
  lengths:
    mode: static
    type: list of integer
    value: [ ]
```

L'usage est celui d'un type du socle (D408 : le mot hook n'apparaît
pas) ; les défauts se règlent sous `field:`, comme ceux de tout type
(D991, D1239) :

```yaml
# Les champs
field:

  # Le type isbn
  # La forme à treize chiffres seulement.
  isbn:
    lengths: [ 13 ]
```

```yaml
# L'identifiant du livre
# Son ISBN, vérifié à la saisie.
isbn: isbn
```

**Le pivot avec le storage** (D1297 — le 15/10/2026) : « Le storage
influe le hook des types pour définir les propriétés ou les éléments à
couvrir. Au storage de faire le nécessaire pour exploiter au mieux ces
données. » — le storage énonce la liste de ce qu'il attend d'un type ;
le type la couvre par sa déclinaison en types élémentaires — un
élémentaire ou une liste nommée d'élémentaires, le format pivot
(D1298) — et ses règles de transcription (D1296) ; un type qui ne
couvre pas un élément attendu est refusé à l'ingestion, jamais dégradé
(D1690) ; la forme en
clair, les indicateurs (D1288) et la règle de stockage sont les trois
facettes que le contrat du hook de type livre à la documentation — à
écrire à l'étape 9 du rang 2.

### 2. Le hook de composant (D64–D68, D452, D566)

Ajoute **un composant graphique** au catalogue — une feuille, un
conteneur, une surface (D455 : « une facette = un hook »).

**Le contrat (D69, D566.7)** : un composant est une fonction pure,
de la configuration vers une description de rendu, et le moteur
réalise le HTML — aucun accès au DOM, la technologie de rendu
interchangeable (D69, cohérente avec D1672 : le socle impose
l'affichage) ; « un objet qui se chargera de gérer le
composant **et son rendu dans les différents formats — Web, PDF,
Word, Excel, Email…** » (les destinations D564). Le composant
personnalisé est **un nœud comme les autres** (D452) — la signature
commune (l'adresse `<type>[<nom>]`, le `visible:` vivant,
l'évaluation paresseuse, les enfants déclarés, la pile de contexte —
D566–D567) — et **« l'écriture repasse toujours par les champs et
leurs règles »** : le composant ne contourne jamais le modèle.

**L'exemple** — consigné à l'ère du modèle unifié (« le champ écrit
`gauge_3d` comme il écrirait un composant du socle ») :

```yaml
# Le champ emploie le composant ajouté comme un composant du socle ; s'il échoue, le repli.
fields:
  progress_ring:
    # Le type du champ.
    type: percentage

    # Le composant, celui que le hook a enregistré au catalogue.
    component: gauge_3d
```

Le hook enregistre `gauge_3d` au catalogue des composants ; l'objet
gère le rendu Web, PDF, Word, Excel, Email (D566). L'usage est de
première classe (D65) ; si le composant échoue, le repli sur le
composant par défaut du type (D68).

### 3. Le hook d'opération (D570, D594–D601)

Ajoute **une opération** — une tâche et son déclencheur, matérialisée
en bouton (D148). L'infrastructure des tâches se décrit en deux
chapitres (D1689) : au chapitre 6, les opérations — les cinq
déclencheurs (D54), le dossier surveillé (D106), les droits de la
tâche (D53), l'écriture par un connecteur, une tâche (D87), le droit
de relance (D88) — ; au chapitre 9, l'administration — la file et ses
contrôles globaux (D61), la supervision, annuler, reporter,
reprioriser, le journal (D56), l'audit avec motif (D62). « Une
opération ne se construit pas dans
la configuration : elle se construit toujours à l'aide d'un hook de
code » (D570). Les vingt et une opérations du socle (D574, `migrate` D667,
`rgpd.anonymize` D697 et D1333, `reset_coverage` D881, `rgpd.extract`
D1331 et D1333 ; D1742) sont les hooks embarqués :
`create`, `read`, `update`, `delete`, `duplicate`, `promote`,
`demote`, `generate`, `download`, `print`, `send`, `export`,
`import`, `report`, `restore`, `notify`, `refresh`, `migrate`,
`reset_coverage` (la dernière valeur parcourue d'une
entité remise au départ — le `migrate` suivant relit la totalité,
rien du module n'est effacé, D1030), et la famille `rgpd` des opérations
réglementaires, `rgpd.extract` et `rgpd.anonymize` (D1333). **Chaque
opération porte un degré intrinsèque d'autorisation, déclaré à son
contrat** (D697/D699 — `reader` | `user` | `manager` |
`administrator`, le quatrième degré compris (D1140, D1680), le
plancher que la déclaration ne peut abaisser ; le groupe
d'utilisateurs porte le degré, l'appartenance à un groupe est
obligatoire ; `allow:` précise les groupes autorisés — D700, le plus
exigeant l'emporte).

**Le contrat — l'objet aux quatre fonctions (D595) :**

| la fonction | le rôle |
|---|---|
| `execute` | remplit **la transaction tenue ouverte** (D594) — le preview est l'exécution suspendue avant le commit |
| `confirm` | la relecture — le message-label (D597) aux valeurs nommées (`nb_creations`, `nb_updates`, `nb_deletes`… — D598), ou un formulaire nourri par la transaction (D600–D601) |
| `commit` | scelle — et **retourne l'issue** (l'écran, le téléchargement, l'impression, le message, rien — D570/D597) : le moteur lit et déclenche |
| `rollback` | défait proprement |

**Les propriétés intrinsèques du contrat** — « une opération
s'exécute et elle possède aussi des propriétés » : ce qui tient au
code, « pas exposable dans la configuration mais dans le contrat du
hook » (D699, D904–D905) ; cinq propriétés, closes jusqu'à
l'implémentation (D1743) :

| la propriété | le sens |
|---|---|
| `degree: reader \| user \| manager \| administrator` | le plancher d'autorisation (D697/D699) ; les quatre degrés, `reader` compris (D1140, D1680) |
| `execution: irreversible \| once \| repeatable`, `try:`, `delay:` | **le mode d'exécution** (D57, D1743, D1744) : `once`, le défaut — un seul essai, `try: 1`, `delay: 0` — ; `repeatable`, l'opération peut être rejouée, `try:` le nombre d'essais, `delay:` le délai entre deux essais, en millisecondes ou en secondes ; `irreversible` — « not undo » —, les effets ne se défont pas, le mail parti ne se rappelle pas, aucun rejeu, la relance manuelle depuis la supervision ; `rollback` défait la transaction, jamais les effets |
| `deterministic: true \| false` | **l'opération est déterministe ou pas — « elle ne peut pas changer sans faire changer son code »** (D59/D904) : l'assertion du code — un doublon (même opération, mêmes paramètres) dans la fenêtre reçoit **le résultat mémorisé**, sans ré-exécution ni effet répété |
| `deterministic_duration: <durée>` | **la fenêtre de mémoïsation** (D59) — « cela dépendra éventuellement de la façon dont elle sera implémentée » : le hook la porte, la configuration ne la surcharge jamais |
| `connectors: { <nom>: <famille> }` | **les connecteurs attendus pour l'exécution** (D913) — « le hook décrit les types de connecteurs utilisés (comme des paramètres d'exécution) » : nommés et typés par leur famille (`documents: file`, `mailer: smtp`) ; **la déclaration les lie par `uses:`** au connecteur de l'environnement (D617) ; l'ingestion vérifie la liaison, la famille (D613) et la complétude par environnement ; tout connecteur non attendu est hors de portée (D599) ; **aucune liaison implicite** (D914 — `uses:` s'écrit toujours, D805 ; l'erreur d'ingestion nomme le candidat unique) |

Toutes paraissent au `describe` (D645) ; les noms de juin
(`deterministe`, `determinisme_duree`) prennent la graphie anglaise
du catalogue, la sémantique intacte (D905). **Le hook déclare, le
moteur exploite** (D905) : « ces paramètres doivent être exploités
par Syncytium pour mieux gérer le déterminisme avec un cache ou
pas » — Syncytium lit le contrat et en tire sa conduite : le cache
de mémoïsation tenu pour l'opération déterministe et vidé à
l'échéance de la fenêtre, aucun cache pour la non-déterministe,
l'exécution unique sans rejeu. L'invalidation du cache
est l'acte de l'administrateur (D60 — trois grains : l'opération +
ses paramètres, l'opération, tout). **Le cooldown, lui, est un
paramètre d'administration** (D58/D904) : le défaut en setting
dynamique de l'application (`operation.cooldown`, `1min` — D588),
la surcharge `cooldown:` à la déclaration ; **l'API seule** — une
exécution par période, mesurée de la fin de l'exécution au début de
l'appel suivant, le rappel refusé et journalisé (D43). **La
rétention du résultat** de même (D55/D906 — « un paramètre
d'administration, je valide ») : `operation.retention` en setting
dynamique (`90d`), la surcharge `retention:` à la déclaration, le
résultat échu purgé. Le partage de juin est complet : quatre
propriétés au contrat, deux paramètres à l'administration.

**Les tâches** (D53–D55, D87, D88, D436, D1748) : une tâche est
l'exécution d'une opération ; toute exécution passe par la file, avec
son état, sa progression et son résultat, retenu `retention:` (D906).
`mode:` se déclare, `synchronous` par défaut, l'interface en pause avec
sa progression, `asynchronous`, enregistrée dans la file, `await[…]`, le
décalage avant le lancement (D436). Qui déclenche est dit par `allow:`
et le plancher ; le déclencheur lit le résultat ; l'opération s'exécute
avec les droits de son contrat (D53). La relance : le déclencheur pour
une opération `repeatable` en échec terminal, l'administrateur pour
tout, depuis la supervision (D88). Les effets `webhook` et `actions`
sont des tâches ; leur anomalie est tracée et notifiée au déclencheur
par son canal, in-app depuis l'interface, webhook depuis l'API (D87).
L'API déclenche et suit, le 202 et sa ressource de suivi, au
chapitre 12 (D24).

Les cinq portées (D570) : l'enregistrement, la liste, la sélection,
le module, l'application. `commit: auto | confirm` à la déclaration
(D596). L'opération voit **la pile des contextes** (D553) et peut
appeler une fonction — jamais l'inverse (D571).

**Six déclencheurs** (D54, D106, D1747) : l'acte, l'API, le calendrier
par `every:`, l'événement de données par `when:`, une expression ou un
événement nommé, l'événement de connecteur par
`when: <connecteur>[.<entrée>]`, l'enchaînement par `actions:`
ou le wizard ; `every: continuous` est un événement de données, à
chaque mise à jour (D435) ; la relance depuis la supervision est le
geste de l'administrateur, pas un déclencheur (D88). *En proposition* :
les événements nommés sont les issues des opérations du socle, au
participe, `created`, `updated`, `deleted`, `generated`, `imported`,
`migrated`, `promoted`.

**Le pont hook/déclaration (D609)** : le hook **est** l'opération ;
la déclaration (`operations:` — D432) en décrit **l'usage** — le nom,
les paramètres, le `commit:`, la garde `if` (D430), **le formulaire
d'appel** (`form:` — D775 : les champs du formulaire sont les
paramètres du hook, **la validation du formulaire est l'opération** ;
la symétrie avec le confirm D600 — le formulaire aux deux bouts), et
**le mode de déclenchement quand il n'est pas lié à l'IHM** : `when:
<expression>` (D428 ; l'événement `generated`, émis à toute
génération, D796 — `creer_releve` de la banque s'y déclenche),
`every: continuous` (D435 — sur une mise à
jour), le calendaire (D434), **l'événement de connecteur** (les
webhooks, l'import automatique à la réception d'un fichier —
`when: <connecteur>[.<point d'entrée>]`, **un abonnement posé à
l'initialisation de l'application** — D641 ; le webhook entrant
s'authentifie obligatoirement — D642). L'IHM lie sans
déclaration (le bouton, la colonne, les actions, le step, le menu).
**Et la composition déclarative** : « une opération peut être une
liste d'opérations disponibles dans le socle » (D609) ; « ne se
construit pas dans la configuration » signifie *pas de code*.
**Le vocabulaire** (D1750) : « on garde "operation:" pour la
déclaration d'une suite d'actions, "action:" pour une étape d'une
opération, "task" pour une tâche exécutée suite à un déclencheur,
"procedure" pour les fiches de procédure ». **Une opération se déclare
comme une suite d'actions** : l'exécution de son hook, puis les effets
qui diffusent le résultat (D432, D1745, D1746) — `notify`,
l'information des utilisateurs ; `document`, l'édition ; `set`, la mise
à jour de données ; `webhook`, « pour déclencher une action sur une
application distante », par un connecteur `webhook` sortant — et
d'autres opérations, « à engager après la réalisation de l'action »,
exécutées de façon asynchrone, chacune une tâche de la file (D55).
La clé de la suite est `actions:` (D1751) ; **`effects:` reste, à l'action**
(D1752) : « pour une action, nous pouvons définir un effect qui se
déclenche sur la bonne exécution de l'action ». La forme est acquise
(D1753) : l'opération porte ses propres `effects:`, ceux de son hook ;
chaque action listée porte les siens ; `notify`, `document` et `set` s'exécutent au
commit, dans la transaction tenue ouverte (D594) ; une opération
appelée en action part après le commit, dans sa transaction, avec son
`execution:` ; les valeurs nommées que l'opération rend (D598)
nourrissent les gabarits et les paramètres des actions ; une action
asynchrone qui échoue ne défait pas l'opération, la supervision la
relance (D88). `function` n'est pas une action : une fonction est une
méthode d'un type (D1702), elle s'appelle dans une formule. **Le
`notify` sans destinataire remonte à tout le monde, dans la zone des
notifications de l'application ; le relais par mail est le choix de
chacun, dans son profil** (D1228, la lecture confirmée D1685 — « tout le monde » =
ceux qui voient l'entité, D334). **La documentation** d'une opération
composée est la liste de ses étapes, chacune avec la description de
son hook (D1227).

**L'extrait, inventé, validé** (D1752, D1753) — une opération, ses
effets, ses actions et leurs effets :

```yaml
# Les opérations de la commande de vente
# Chacune est une suite d'actions ; une action porte ses effets, déclenchés sur sa bonne exécution.

# L'expédition
# Le hook expedier sort les articles du stock ; sur sa bonne exécution, la commande passe à expédiée et le bon de
# livraison s'édite ; puis la facturation s'engage, après le commit, et, sur sa bonne exécution, le client et le
# transporteur sont prévenus.
expedier:
  label: { fr: Expédier, en: Ship }
  form: expedition
  commit: confirm

  # Les effets de l'opération elle-même, sur sa bonne exécution
  effects:
    set: { statut: expediee }
    document: bon_de_livraison

  # Les actions qui suivent, après le commit, chacune avec ses effets
  actions:
    - facturer:
        effects:
          notify: { to: client, message: { fr: "Votre commande {numero} est expédiée." } }
          webhook: transporteur
```

**L'exemple** — la déclaration, dans l'entité, référence le hook par
son nom (D432, D609). Dans le cas 4 (banque),
`banque/ecriture/operations.yml` :

```yaml
# Les opérations de l'écriture. Chacune porte son libellé (label), le formulaire d'appel qui recueille ses paramètres
# (form) et son mode de validation (commit — confirm pour la relecture avant le scellé, auto sans relecture).

# La duplication entre deux dates
# Le pas et les deux dates ; la relecture affiche le nombre de créations.
dupliquer:
  label: { fr: Dupliquer, en: Duplicate, es: Duplicar }
  form: duplication
  commit: confirm

# La propagation aux similaires
# Le nouveau libellé et le nouveau montant, puis la liste, la sélection, la masse.
propager:
  label: { fr: Propager, en: Propagate, es: Propagar }
  form: propagation
  commit: confirm

# Le virement
# Le compte cible et le montant : les deux écritures liées.
virer:
  label: { fr: Virer, en: Transfer, es: Transferir }
  form: virement
  commit: confirm

# La tâche du relevé
# Déclenchée par toute génération ; elle pose la date d'impression sur les écritures générées, sans relecture.
creer_releve:
  when: generated
  commit: auto
```

Le `commit:` a une forme riche, `{ mode:, form:, message: }` (D600,
D1606) : `mode:`, `auto` ou `confirm` ; `form:`, le formulaire de la
relecture ; `message:`, un gabarit nourri des valeurs nommées que
l'opération rend (D598), `{nb_creations} factures créées`.
`commit: confirm` en est le raccourci ; sans `form:` ni `message:`, le
formulaire par défaut, `record`, s'ouvre en lecture seule (D1645). Le
wizard porte le même `commit:` (D1652). La déclaration porte encore,
au besoin, `scope:`, l'une des cinq portées (D570) ; `uses:`, les
connecteurs de l'environnement que le hook attend sous les noms de son
contrat (D913, D617) ; `cooldown:` et `retention:`, l'anti-rejeu de
l'API et la durée de consultation du résultat, dont les défauts sont
des paramètres d'administration (D904, D906). Le hook `dupliquer`
(le code) exécute dans la transaction tenue ouverte ; `confirm`
laisse le moteur présenter le formulaire et le message ; `commit`
scelle et retourne l'issue ; `rollback` défait si l'utilisateur
annule (D594–D595). `dupliquer` est le clone en hook (D776, D797).

**Le wizard, la même transaction** (D546–D547/D594) : les steps qui
portent une `operation:` s'exécutent **dans la transaction du
wizard, tenue ouverte au fil des étapes** — « la transformation
n'aura lieu qu'à la validation définitive du wizard » ; la
confirmation validée barre le retour (le cliquet — D505/D547) ;
l'abandon annule tout.

**Ce que le hook lit** : **la pile des contextes** (D553 —
l'opération au fond de la pile voit le périmètre de la liste,
l'enregistrement du formulaire, le transitoire du wizard),
**`context.`** (D589 — `user` traversable, `location`, `now`,
`instance`/`application`/`module`, `entity`/`field`,
`file`/`page`/`pages` au document) et **`context.settings.<nom>`**
(D588/D591 — `{ mode: static | dynamic, type:, value: }`, la
cascade application → module → entité, le dynamique ajusté au module
d'administration — D573). La fonction lit le contexte **en lecture
seule** (D571).

**Les déclencheurs par connecteur** — depuis connectors.md, en attente
du chapitre 6 (D1720) :

- **l'entrant par le fichier** (D604) : le guetteur détecte, relit —
  la porte d'entrée ;
- **le déclenchement d'opération par connecteur** (D609) : « utile
  pour traiter des webhooks ou pour déclencher automatiquement un
  process d'import » — `when: <nom du connecteur>` *(en
  proposition)* sur l'opération déclarée :

```yaml
# Les opérations déclenchées par un connecteur
operations:
  archive_and_notify:
    when: incoming_orders          # l'événement du connecteur
    commit: auto
    actions:
      - import                     # l'import, une tâche après le commit
      - notify                     # l'information des utilisateurs
  import_order:
    when: orders_api.new_order     # l'abonnement au point d'entrée
    commit: auto
    actions: [ import ]
```

- **le `when:` en abonnement** (D641) : posé à l'initialisation de
  l'application — le connecteur et éventuellement le point d'entrée
  attendu ; l'appel entrant (webhook) ou l'événement détecté (file)
  déclenche.

### 4. Le hook de fonction (D571, D592–D593)

**La famille n'existe plus** (D1702) : une fonction est une méthode de
son type, décrite dans la fiche du type ; la section reste jusqu'à la
dissolution.

**Porté par un type** (D1676) : « le hook de fonction est porté par le
type qui exposera ses fonctions ». Une fonction est une méthode d'un
type (D1674) ; le hook qui l'ajoute dit quel type l'expose — *en
proposition*, `type:` dans sa fiche, `text` pour `extract_name`, et un
type apporté par un hook liste ses fonctions dans sa propre fiche. La
forme de la fiche suit D809 ; l'exemple ci-dessous est conservé —
« je ne vois pas d'écart » (D1681). **Le hook de fonction se
complétera à l'implémentation** (D1684) : « ça assurera le lien entre
le socle et les composants ajoutés. En fonction de l'architecture
technique et des composants techniques, les règles peuvent être revues
et corrigées. Pour le moment, ça couvre le besoin et ça reste vrai. »
**La méthode d'un type se décrit dans la fiche du type** (D1700), sous `methods:`, une clé par méthode avec la description d'une fonction ; l'appel s'écrit `isbn.check()` ; `type:` dans une fiche de fonction (D1676) tombe. L'exemple ci-dessous, `extract_name`, reste tel quel jusqu'à la dissolution ; « le hook de fonction qui existait décrit plutôt un hook d'opérations » (D1701).

Ajoute **une fonction** — le calcul pur : une valeur (ou une liste)
aux types du modèle, ou **des valeurs nommées** (D593 — la regex à
groupes nommés nourrit plusieurs champs d'un seul appel).

**Le contrat** : les paramètres typés, le résultat déclaré (le typage
statique D581 s'y appuie), le contexte en lecture seule — **aucune
écriture, aucune opération déclenchée** (la pureté D571). Le moteur
appelle au fil du **graphe d'exécution acyclique** (D592 — le cycle =
une erreur d'ingestion), au paramètre modifié.

**Les fonctions libres** (D583/D587) complètent le monde des
fonctions : les variadiques scalaires (`min`, `max`, `sum`, `avg` —
`max(0, stock.sum(quantity))`) — `iif` est retiré au profit du
conditionnel natif `valeur if condition else autre` (D1110) —
« le catalogue s'enrichira, si besoin » : la porte des hooks de
fonction libre.

**L'exemple** — la regex aux groupes nommés (D593) :

```yaml
# La déclaration du hook : la signature, le code au langage de Syncytium.
functions:
  extract_name:
    # Les paramètres typés.
    parameters: { raw: text }

    # Le résultat : des valeurs nommées, un seul calcul nourrit plusieurs champs.
    result: { prenom: text, nom: text }
```

L'usage, un seul calcul pour deux champs :

```yaml
# Les deux champs nourris par le même appel.
fields:
  prenom: { formula: extract_name(raw).prenom }

  nom: { formula: extract_name(raw).nom }
```

### 5. Le hook de connecteur (D603–D642)

**Écrit au chapitre 5** (D1730), [05-connecteurs/hooks.md](syncytium/05-connecteurs/06-hooks.md).

### Ce qui n'est pas un hook

**Le style** (D1672) : « Les styles se déclinent pour un thème. Un
style est soit des couleurs, soit des mises en forme spécifiques ...
on pourrait décider de représenter une zone de saisie de texte
différente en fonction d'un hook de saisie. Ici, je crains que cela
soit trop compliqué à mettre en oeuvre. Par conséquent, ça oblige le
socle à imposer l'affichage des composants graphiques et à permettre
au concepteur ou aux utilisateurs de pouvoir jouer avec quelques
styles de mise en forme et/ou de couleurs. » Le style n'est donc pas
une famille de hooks (D755 amendée, D754 amendée). Le socle impose
l'affichage de ses composants graphiques ; il propose quelques styles
(D752), des couleurs ou des mises en forme, que le concepteur combine
dans un thème (D63, D753) — la couche de marque, par-dessus le rendu
par défaut — et que l'utilisateur choisit à son profil. Leurs
noms et ce qu'ils règlent se fixent au domaine 7. Le hook de
composant demeure : il ajoute un composant, avec son rendu
(D64–D68, D566).

**La langue** (D1671) : « Les langues ne me semblent pas un hook.
C'est un composant de langue porté par le socle. Le hook se fait par
le code de la langue et tous les éléments qui en dépendent pour
l'affichage, pour les commentaires, pour la documentation, ... ou
autres usages faisant intervenir du texte. » La langue apportée par
un projet (D1465) n'est donc pas une famille de hooks (D1467
amendée). Elle se déclare par son code dans `languages:` de la
version ; tout ce qui porte du texte en dépend, les libellés, les
aides, les descriptions, les md, la documentation. Son catalogue,
construit par `syncytium language fr pt` et traduit item par item
(D1465, D1466), complet sous peine d'erreur d'ingestion (D1468),
complété par la commande sur un catalogue existant (D1470), vit
*en proposition* dans `languages/<code>/` à la racine de la
version, avec ce qui est propre à la langue, le fuseau, les formats,
le sens d'écriture (D217, D1471). Elle peut être la langue
technique de l'instance (D1460, D1473). Le détail est au chapitre 1
([03-arbre.md](syncytium/01-configuration/03-arbre.md), « Une langue que
le core ne porte pas »).

### Les autres points d'extension consignés

- **les écrans et les formats CSV/Excel** (D418 — le glossaire les
  élargit) ; **les graphiques au-delà de 2 axes** (D239) ; **le
  recadrage d'image** (D263 — le patron) ; **le tracé de la route**
  (D514) ; **la comparaison du kpi** (D245) ; **la proximité en
  filtre** (D294) ; **les formats du template** (D565 — « étendu à
  d'autres formats en fonction des besoins ») ; **les fonctions
  libres** (D587 — « le catalogue s'enrichira, si besoin »).

## Les règles transversales

0. **Le hook d'interface, seul code tiers au navigateur** (D918 —
   D66/§8.2) : il ne reçoit jamais `private`, il relève de l'UX et
   jamais de la sécurité (le serveur arbitre), il est **sous la
   responsabilité du concepteur** et **listé par la documentation
   générée** (`describe`, D645) pour que l'administrateur sache quel
   code tourne chez ses utilisateurs ; la page n'autorise que les
   scripts qu'elle connaît.
1. **La librairie d'exploration** (D572/D599) : le hook lit le modèle
   « de façon transparente » (les noms logiques, jamais le stockage)
   et écrit dans la transaction — **« la librairie mise en place
   assure l'inviolabilité des règles et des droits »** : les droits
   (D196), la confidentialité (D25/D364), la validation (D307), la
   concurrence par champ (D111) ne se contournent pas — **le hook est
   un citoyen du moteur, jamais un super-utilisateur** ;
2. **Le renvoi historique « domaine 6 »** (D408/D452/D459) se relit
   (D602) : le contrat des hooks est couvert par Q60 (D570–D601) ; le
   reliquat — la sandbox, le langage du code — relève du domaine 7 ;
3. **Rien hors de la configuration** (D1440) : « les éléments de
   configuration nécessaires au fonctionnement doivent être présents
   dans le fichier de configuration et nulle part ailleurs » — un hook
   ne lit ni variable d'environnement ni fichier que sa déclaration
   (`properties`) et la configuration ne référencent ; toutes les
   variables sont présentes par construction, le fichier de
   l'amorçage les porte toutes (D1429).
3 bis. **La signature d'abord** : chaque famille déclare ce que le typage
   statique (D581) et l'ingestion (D330/D344) vérifient — l'erreur ne
   passe jamais l'ingestion.
4. **La documentation du hook est déclarée** (D1403 — amende D645/D630
   pour les textes) : **le md par langue**, avec ses gabarits, décrit le
   fonctionnement ; `describe` ne rédige plus — ce qui n'est pas un
   texte reste calculé depuis les déclarations du hook (la
   correspondance logique-physique du storage D1255/D1299, la forme en
   clair d'un type D1160) ; la documentation de l'application (celle de
   Syncytium + les hooks ajoutés) se construit **version par version** :
   la version documentée est exactement la version servie.

## La documentation — la facette du hook (D1158–D1159)

*(La rubrique de la matrice de [documentation.md](documentation.md)
§13 ; la colonne 1 — la fonctionnelle — remplie, les autres à leur
rang.)*

**Le hook d'opération, dans la fonctionnelle** : son md (`description:
~{documentation.md}`, D778/D809) **est la description de l'opération**
— « ce qu'elle fait » dans la table des opérations de la section de
l'entité (D1196, D1227) ; une opération qui en enchaîne plusieurs se
décrit par la liste de ses étapes, chacune avec sa description
(D1227) ; « ce qui la déclenche » vient de la déclaration — le bouton,
le `when:`, la période (D428/D609), le formulaire d'appel et ses champs
(D775) ; les opérations que l'utilisateur ne déclenche pas
(`migrated`, `generated`) figurent parce qu'elles transforment ce
qu'il voit (D1209) ; sans `label:`, le nom (D1181). Le md est une
configuration : ni décision ni histoire du cas (D1085, D1228).

**L'effet `notify`** sans destinataire remonte à tout le monde dans la
zone des notifications de l'application ; le relais par mail est le
choix du profil (D1228) — la section le dit ainsi.

**Le hook de type** livre la facette documentation du type — le type en
clair, ses contraintes, son exemple, dans chaque langue du moteur
(D1162) — pour le dictionnaire (D1215 : « les hooks de type devront
être adaptés ») ; le contrat s'écrit au rang 2.

**Les langues** : chaque hook porte ses textes dans les langues
attendues (D1162–D1163, D1403 — un md par langue) ; un hook ajouté à
Syncytium pour Syncytium les porte toutes ; un hook du concepteur,
celles de sa version ; une langue manquante est une erreur d'ingestion.

**Les hooks, dans le dictionnaire de la donnée** (la colonne 2 — le rang
2) : **la notion de hook n'y apparaît pas** (D1244 — « les hooks
s'intégreront au document sans que la notion de hook apparaisse ») ; le
lecteur voit ce que chaque hook livre par sa facette : **le hook de
type**, la forme en clair, la déclinaison, les indicateurs, l'exemple, le
marquage (D1301) ; **le hook d'opération**, la description de
l'opération (D1227) et son contrat au chapitre 4.3 — ce qu'elle lit, ce
qu'elle écrit, ses effets (D1262) ; **les méthodes des types**, le texte des
formules dans les règles de l'entité (D1254) ; **le hook de connecteur
storage**, le chapitre 3 par `describe(model)` (D1299) ; les hooks de
composant et de style, rien. L'inventaire des hooks câblés et comment en
écrire un vont à la documentation du développeur (D1244).

**Les hooks, dans la réglementation** (la colonne 5 — le rang 3) : **le
hook d'opération** est un traitement quand il implique un champ `rgpd:`
(D1317) — la déclaration porte le bloc `rgpd:` du traitement
(`controller`, `legal`, `purpose`, D1322) et, pour une suite, `operations:
[ … ]` fait une ligne du registre (D1318, D1329) ; **la famille `rgpd`**
des opérations du socle — `rgpd.extract(identity)`, `rgpd.anonymize`
(D1333) — ; **le hook d'interface**, seul code tiers au navigateur, est
nommé au chapitre de la sécurité (D918, D1337) ; **le hook de
composant** passe les tests du RGAA comme les composants du socle
(D1340) ; **le hook de connecteur** porte `rgpd: { countries: [ … ] }`
(D1328).

**Les hooks, dans le projet et le support** (la colonne 8 — le rang 4) :
rien de propre — les opérations ne sont pas des écarts (D1281) ; les
notifications des tickets et l'alerte du profil passent par le
mécanisme des notifications du socle (D1366, D108/D397).

**Les hooks, dans la documentation du développeur** (la colonne 3 — le
rang 5) : **l'inventaire** par famille (D1404, D1406) — la fiche, la
description par son md dans la langue du lecteur (D1403, D1405), les
propriétés `degree`, `execution`, `deterministic`, les connecteurs, les
références comptées et localisées, le code par son existence et son
emplacement ; **le hook d'opération** au contrat d'API, son md montré au
technicien (D1402), ses paramètres dont le changement est un écart
(D1401) ; **la référence** pour en écrire un, six chapitres par
famille, celle du core nommé par `from:` (D1408) ; **la skill**, la
couche du core et le complément de la version (D1409–D1410).

**Les hooks, dans le D.A.T.** (la colonne 4 — le rang 6) : **leurs
dépendances** par `dependencies:` (D1430, D1432), dans la liste des
dépendances à côté de celles du core, comparées par la veille des CVE
(D1431) ; **le hook de connecteur** personnalisé, un nœud du schéma
comme les connecteurs du socle (D1426) ; **le hook d'interface** sur le
poste informatique de l'utilisateur (D918).

**Les hooks, dans le guide d'exploitation** (la colonne 9 — le rang 7) :
**les erreurs codifiées** du hook, `errors:` (D1461) — le code, le
message à gabarit du journal, la description, l'arbre de résolution
schématisé, par langue (D1460) —, reprises au catalogue du dépannage ; le hook de connecteur dans les fiches de sa
famille ; une opération périodique au calendrier des opérations
(D943) ; les hooks du projet ne tournent qu'avec leurs `dependencies:`
installées (D1432).

**Les hooks, dans la maintenance, les risques et les améliorations** (la
colonne 7 — le rang 8) : **les usages** — les déclenchements de chaque
opération, la part de refus de validation, l'opération jamais
déclenchée (D1489) ; **les risques** — les dépendances des hooks, leur
version et leur licence (D924, D1432), les erreurs codifiées les plus
fréquentes au journal ; **les améliorations** — l'entrée composite,
l'agrégat, le champ calculé que les séquences d'appels font émerger
(D45, le volet conseil), l'opération jamais déclenchée (D1495).

**Les hooks, dans la promotionnelle** (la colonne 6 — le rang 9) : une
opération entre dans la plaquette par le scénario du persona qui la
déclenche (D1498) ; dans la démonstration (D1503), les hooks tournent
comme ailleurs, leurs connecteurs mockés ; dans la promotionnelle de
Syncytium, les quatre familles de hooks sont l'argument de l'ouverture
(D1509, D52).

**Les neuf colonnes sont écrites.**
