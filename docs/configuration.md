# La configuration de Syncytium — la syntaxe

Ce document rassemble **la syntaxe de la configuration** — le format,
les mécanismes transverses, l'arbre des fichiers et ce que chacun
porte — telle que les décisions l'ont fixée depuis le début du projet
(Q16, le domaine 1 : D320–D346 ; les entités et les types : D356–D364 ;
les groupes et les modules : D414–D416 ; la chaîne des fichiers :
D765–D768, D805–D810 ; les mécanismes des cas d'usage : D885–D886,
D892, D944, D956, D965–D968, D991–D993). C'est le treizième artefact
préparatoire de la documentation (Q58) : **il dit la forme ; le sens de
chaque élément vit dans son artefact** — [entity.md](entity.md),
[types.md](types.md), [composants.md](composants.md),
[hooks.md](hooks.md), [connectors.md](connectors.md),
[mapping.md](mapping.md), [rights.md](rights.md),
[administration.md](administration.md), [security.md](security.md). Les
décisions citées renvoyent à la [conception](conception.md).

## 1. La nature — YAML, de petits fichiers, une seule grammaire

- **YAML, sans format personnalisé** (D320) : la description emprunte
  la syntaxe YAML et s'en tient à elle ; **le fichier est une
  enveloppe** (D327) — lu, converti en logique interne, puis inerte :
  le moteur ne réécrit jamais un fichier du technicien (D331/D332),
  les commentaires restent, le dépôt se diffe.
- **De petits fichiers plutôt qu'un seul** (D323) : la description se
  décompose en fichiers et en dossiers, **une valeur peut être le
  contenu ou la référence d'un fichier** (D320/D767) ; les redondances
  s'éliminent par les variables (D321) et les références (D956/D967).
- **La langue** : les noms de dossiers, de fichiers et les propriétés
  sont **en anglais** (D335) ; les valeurs du catalogue aussi — les
  types, `public`/`protected`/`private`, `write-once` (D358) ; **la
  sémantique métier dans la langue du modèle** — les noms d'entités et
  de champs, les libellés (`label:`, `hint:` — par langue).
- **`description:` partout** (D810) : tout élément porte sa
  description, en ligne ou par fichier — le carburant de la
  documentation générée (D333/D645).
- **Le dépôt du client est distinct du projet** (D336) ; le projet
  embarque `template/`, un « Hello world ! » clonable (D337).
- **La version du format en tête** (D322) : la description déclare la
  version du méta-schéma qu'elle parle ; un format plus récent que le
  moteur est refusé sur la seule lecture de l'en-tête (D330), un format
  antérieur est converti à l'ingestion (D331).

**Les règles d'écriture face à YAML (D892)** — la grammaire des
expressions vit dans des scalaires YAML, deux règles la protègent :

1. **les guillemets quand YAML l'exige, et seulement alors** : un
   crochet de la grammaire à l'intérieur d'une accolade ou d'un crochet
   YAML (`{ type: 'text[..100]' }`), un `: ` à l'intérieur d'une
   expression (`'sens.select(entree: quantite, sortie: -quantite)'`),
   une expression régulière — **aux guillemets simples**, qui prennent
   tout tel quel (`'^(?<prefix>[A-Z]{2})…$'`) ;
2. **la forme bloc préférée** quand la forme en flux imposerait les
   guillemets : `fields:` en bloc, `items:` en liste à tirets, la
   longue formule en scalaire bloc `>-` ; en contexte bloc, une valeur
   par ligne, la grammaire s'écrit nue (`libelle: text[..30]`).

Chaque exemple passe un analyseur YAML avant validation.

## 2. Les mécanismes transverses

### 2.1 La référence de fichier — `~{<fichier>}` (D956)

Toute valeur qui désigne un fichier de configuration s'écrit
**`~{…}`** : « la partie de la configuration sera remplacée par le
contenu du fichier correspondant. Ce fichier est chargé par la
configuration ». La valeur nue est un littéral — l'ingestion refuse un
fichier non marqué.

```yaml
fields: ~{fields.yml}                # le contenu du fichier remplace la valeur
entities:
  - ~{article/article.yml}           # dans une liste, un élément par fichier
  - ~{fabrique/fabrique.yml}
```

- **le chemin est relatif au fichier courant** (D768) : chaque fichier
  se lit seul et se déplace avec son sous-arbre ;
- **le contenu ou la référence, partout** (D767/D352) : toute
  propriété accepte l'un ou l'autre — le fichier unique léger pour le
  cas simple, l'éclatement libre pour l'entité conséquente ; **le
  nommage et l'organisation sont libres** (D807 — le fichier éponyme
  du dossier est une convention d'exemple, pas une règle) ;
- **un nom de fichier chargé à l'usage, pas par la configuration**, reste
  nu — les fichiers de données d'un connecteur (`entities:` d'un
  storage de fichiers, D819/D828), les journaux de `logging.yml` ;
- **jamais en collection de flux** : l'accolade y casse YAML —
  `[ ~{a.yml} ]` est une erreur ; la liste en bloc, ou les guillemets
  simples (D892).

### 2.2 Le pattern — la liste par expression régulière (D806)

Partout où une liste de fichiers se déclare, **un pattern regex peut
remplacer l'énumération** — c'est une déclaration : le standard
d'organisation et de nommage que le technicien se fixe.

```yaml
versions:
  - ~{v[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/version\.yml}   # toutes les versions du statut
mapping:
  - ~{mapping/[0-9]+_.*\.yml}        # les règles de migration
```

**L'ordre au sein d'un pattern est alphabétique** (D665) — le préfixe
numérique décrit les étapes (`001_…`, `002_…`).

### 2.3 Le cumul de fichiers sous une carte (D968)

Une propriété qui porte une carte (`fields:`, `values:`,
`parameters:`…) peut porter **une liste de références en bloc** :

```yaml
fields:
  - ~{articles/commun.yml}           # un fichier — son contenu
  - ~{articles/nomenclature.yml}     # un autre, fusionné à la suite
  - actif: ARCTBLOCAG = ""           # une carte en ligne — les champs propres
    date_creation: ARCJCRE
```

- **la fusion dans l'ordre** — la carte est l'union des clés ;
- **la même clé deux fois est une surcharge** : le dernier l'emporte,
  **une alerte est levée à l'ingestion** ;
- **le pattern y vaut** — `- ~{articles/.*\.yml}`, l'ordre alphabétique ;
- **un élément est une référence de fichier ou une carte en ligne**,
  fusionnée comme un contenu de fichier.

Le premier usage : les règles de migration de l'article du cas 5, qui
partagent un bloc de trente-huit champs par `fields:
~{articles/fields.yml}` (D967) — comme l'entité le fait depuis D767.

### 2.4 Les variables — `${…}` (D321)

`${KEY}`, ou `${KEY?défaut}` quand la clé peut manquer. `KEY` est :

- **une variable d'environnement** — `${ENTREPOT_HOST}`,
  `${SYNCYTIUM_LOG_DIRECTORY}` ;
- **un mot-clé** — `${PROJECT}`, `${VERSION}`, `${date}`,
  `${date:%Y-%m-%d}`… (la liste extensible) ;
- **un élément de la configuration, en navigation relative
  remontante** — `${name}` au même niveau, `${.name}` au niveau
  précédent, `${..name}` au parent du précédent, chaque point remonte
  d'un niveau (`${....name}` dans `logging.yml` nomme l'environnement) ;
- **l'imbrication est permise** —
  `${triggers.${environment.name}.filename}`.

**L'interpolation lit aussi les settings** (D885 — « on exploite une
capacité de la configuration ») : `confidentiality:
${settings.confidentiality.financier}` référence un profil nommé une
fois dans `settings.yml`.

### 2.5 La marque `*` — la clé confidentielle (D944)

Une clé suffixée `*` porte une information confidentielle : **sa valeur
n'est jamais lisible dans les journaux** (D703), et sa variable est
chiffrée par le wizard — **en clair dans le `.env`, elle empêche le
démarrage** (D902).

```yaml
parameters:
  user: ${ENTREPOT_USER}
  password*: ${ENTREPOT_PASSWORD}    # la marque * : confidentiel, la variable chiffrée
```

C'est la seule forme du secret : il n'existe pas de liste `secrets:`.

### 2.6 L'adressage logique — le point (D363)

`<module>.<entité>.<champ>` — **le point, jamais la barre oblique** :
le chemin logique est découplé de l'arborescence physique ; le nom
local suffit dans le même module. **`name:` porte l'espace de noms**
(D344/D396 : un doublon de nom est une erreur d'ingestion) ; les
dossiers ne sont qu'une convention, les listes de fichiers disent ce
qui est inclus.

### 2.7 Le langage d'expression dans les valeurs (D90–D92)

Un seul langage sert les calculs (`formula:`), les validations
(`validation:`), les filtres (`filter:`), les normalisations
(`normalize:`), les règles de migration (`fields:` d'une règle), les
conditions (`if`, `when:`). Ses mots à portée : **`me`** — la valeur à
l'étage du champ (`normalize: trim(me)`), l'enregistrement à l'étage
de la règle (D872/D822) ; **`owner`** — le possesseur (D760/D841) ;
**`context`** — le contexte courant (`context.now`, `context.settings`,
D575/D588) ; **`connector`** et **`cache`** dans une règle de migration
(D821/D845). Le conditionnel : `iif(condition, alors, sinon)`, le
`.select(clé: valeur, "...": défaut)` du type (D583–D584), le `if`
suffixé des agrégats (D887). **Chaque type porte ses fonctions**
(D579) — le catalogue est dans [types.md](types.md).

### 2.8 La forme courte et le bloc (D356)

`fields:` est une carte ordonnée : le nom du champ en clé, l'ordre de
déclaration = l'affichage par défaut. **Une valeur chaîne est le type,
tout au défaut** — `notes: text` ; le bloc quand une facette s'écrit :

```yaml
fields:
  notes: text                        # la forme courte — le type, tout au défaut
  code:                              # le bloc — le type et ses facettes
    type: text[..18]
    required: true
    label: { fr: Code article }
  date_creation: date_pmi            # un type dérivé (D992), la forme courte
```

## 3. L'arbre

La chaîne des déclarations, du sommet à la feuille — **rien ne se
déduit de l'arborescence, chaque lien s'écrit** (D765–D767, D805 : pas
de déclaration orpheline). L'exemple du cas 5 (`examples/05_entrepot/`) :

```text
syncytium.yml                        # le projet — environments:, versions:
resources/                           # les logos, icônes, images — partagés (D346)
environments/
├── environments.yml                 # <nom>: ~{…} — la liste des environnements
├── production/
│   ├── production.yml               # name, description, logging:, documentation:, connectors:, settings:
│   ├── connectors.yml               # les connecteurs de l'environnement (D603/D617)
│   ├── logging.yml                  # la journalisation (D343/D830)
│   ├── documentation.yml            # la génération de la documentation (D333)
│   └── settings.yml                 # les réglages propres à l'environnement (D342)
└── staging/ …
versions/
├── versions.yml                     # <statut>: ~{…} — beta, production, deprecated, forbidden, sandbox
├── beta/
│   ├── beta.yml                     # environment: staging ; versions: [le pattern]
│   └── v1.0.0.0/
│       ├── version.yml              # version, release-notes, settings:, groups:, migrations:, modules:, hooks:
│       ├── settings.yml             # la maison des types, les profils de confidentialité (D991–D993, D885)
│       ├── groups.yml               # les groupes (D414)
│       ├── <module>/
│       │   ├── <module>.yml         # name, description, allow:, entities:, menu:, dashboards
│       │   └── <entité>/
│       │       ├── <entité>.yml     # l'en-tête : name, identity, inheritance, history, fields:, validation:, gui:
│       │       ├── fields.yml       # les champs
│       │       └── gui.yml          # les surfaces (lists, forms, summary, widgets…)
│       ├── hooks/                   # hooks.yml → les familles → les fiches (hooks.md)
│       └── reprise/                 # la migration : reprise.yml, source/, mapping/ (mapping.md)
└── production/ …
```

### 3.1 `syncytium.yml` — le projet

```yaml
name: entrepot
description: L'entrepôt de données de l'entreprise — …
environments: ~{environments/environments.yml}
versions: ~{versions/versions.yml}
```

### 3.2 `environments/` — la configuration technique commune (D325/D342)

**Un dossier par environnement** : ce qui est commun à toutes les
versions mais propre à chaque environnement — les connecteurs, les
journaux, les settings techniques, la documentation. Les environnements
(D339, D907) : `staging` (le test), `production` (la production
active), `passive` (la production passive — PCA/PRA), `sandbox`
(l'essai d'une description en cours, D907–D912).

```yaml
# environments/environments.yml
production: ~{production/production.yml}
staging: ~{staging/staging.yml}

# environments/production/production.yml
name: production
description: L'environnement de production — …
logging: ~{logging.yml}
documentation: ~{documentation.yml}
connectors: ~{connectors.yml}
settings: ~{settings.yml}
```

- **`connectors.yml`** — chaque connecteur par **son rôle nommé**
  (D617) : `type:` la famille (D623/D692/D957 — storage, smtp, file,
  directory, location, webhook, siren, authentication, llm), `class:`
  l'implémentation, `parameters:` (les secrets marqués `*`) ; le
  détail dans [connectors.md](connectors.md) ;
- **`logging.yml`** (D343/D830) — le bloc `syncytium:` (le rechargement,
  le nettoyage — les valeurs de l'exemple) et la configuration de la
  journalisation (`formatters`, `handlers`, `root`), les niveaux selon
  l'environnement (staging verbose, production info, passive warning) ;
- **`documentation.yml`** — la génération de la documentation (D333) ;
  *à décrire (le domaine 6)* ;
- **`settings.yml`** de l'environnement — les réglages techniques qui
  varient d'un environnement à l'autre (D342) ; ce qui est partagé
  passe par les variables.

### 3.3 `versions/` — le contenu versionné, le cycle de vie en dossiers

**Le statut d'une version est son emplacement** (D338/D340) : quatre
dossiers — `beta/`, `production/`, `deprecated/`, `forbidden/` — et
`sandbox/` (D907) ; **déposer dans un dossier = publier pour cet
environnement** ; les transitions sont des gestes de fichier,
unidirectionnels (D344 : `beta → production`, `production → deprecated
| forbidden`, `beta → forbidden` D345 — jamais l'inverse) ; une même
version dans deux dossiers est une erreur ; les dépréciées et les
interdites sont conservées.

```yaml
# versions/versions.yml
beta: ~{beta/beta.yml}
production: ~{production/production.yml}

# versions/beta/beta.yml — le statut porte son environnement (D805)
environment: staging
versions:
  - ~{v[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/version\.yml}   # le pattern (D806)
```

**La version** : quatre nombres `<majeure>.<mineure>.<indice>.<build>`
(D324), croissants ; le moteur tient **le registre des versions
essayées** (D326) — une version en erreur n'est pas réessayée sans
incrément du build ; le format déclaré plus récent que le moteur est
refusé (D330).

### 3.4 `version.yml` — l'entrée de la version

```yaml
version: 1.0.0.0
release-notes: >                     # les évolutions de la version (D808) — l'historique par concaténation
  La première version de l'entrepôt de données — …
settings: ~{settings.yml}
groups: ~{groups.yml}
migrations: ~{reprise/reprise.yml}   # les migrations déclarées (D662)
modules:                             # la liste explicite (D415/D766)
  - ~{technique/technique.yml}
  - ~{tiers/tiers.yml}
hooks: ~{hooks/hooks.yml}            # les hooks de la version (D777)
resources: ~{resources/resources.yml}   # les ressources déclarées (D346)
from: <statut>/<version>             # en sandbox seulement : la version d'origine (D907), supprimé à la promotion (D928)
```

### 3.5 `settings.yml` — la maison des types et des réglages (D359/D360, D991–D993)

**Les paramètres par défaut d'un type se déclarent sous le nom du type
; un type dérivé se déclare de la même façon, avec `type:` sa base** :

```yaml
text:                                # un type du catalogue : ses défauts
  normalize: trim(me)                # la normalisation à la frontière (D870/D872)
date_pmi:                            # un dérivé (D359/D992) : la base et ses défauts
  type: date
  mask: "yyyymmdd"
amount:
  currency: EUR                      # la devise par défaut — amount(v) à un argument (D993)

confidentiality:                     # les profils nommés (D885)
  financier:
    level: protected
    groups: [achats, direction]
```

- la clé est le nom ; sans `type:`, elle règle les défauts d'un type du
  catalogue ; avec `type:`, elle définit un dérivé qui hérite de sa
  base et surcharge ce qu'il nomme ; le dérivé d'un dérivé se résout à
  l'ingestion (le cycle = une erreur) ; un dérivé ne redéfinit jamais
  un type du catalogue (D408) ; l'usage par la forme courte ;
- **la cascade** (D359/D360/D588) : `settings.yml` de la version
  (l'instance), `settings:` du module, `settings:` de l'entité — **le
  plus proche l'emporte** ; le champ garde le dernier mot ;
- les réglages dynamiques portent une valeur par défaut surchargeable
  par l'administration (D588 — `{ mode: dynamic | static, value: … }`).

### 3.6 `groups.yml` — les groupes (D414)

```yaml
production:
  label: { fr: Production }
  description: { fr: Les opérateurs et la préparation — … }
direction:
  label: { fr: Direction }
  groups: [production, commercial, achats]   # « un groupe est constitué d'autres groupes »
administration:
  degree: administrator                      # le degré porté par le groupe (D699/D701)
```

La hiérarchie sans lien parent, acyclique ; les affectations des
personnes vivent en base (D27/D341). Le détail dans
[rights.md](rights.md).

### 3.7 Le module — `<module>.yml` (D765, D416)

```yaml
name: technique
description: Les données techniques — …
allow:                               # la cascade de l'allow (D886) — ici, l'entrepôt en lecture seule
  create: false
  update: false
  delete: false
entities:                            # la liste explicite (D765)
  - ~{article/article.yml}
  - ~{nomenclature/nomenclature.yml}
menu: ~{menu.yml}                    # optionnel (D351) — sans lui, le défaut
settings: ~{settings.yml}            # l'étage module de la cascade (D359)
dashboards: …                        # les tableaux de bord du module (composants.md)
```

**Déclarer un module, c'est l'activer** (D350) : présent = actif,
retiré = désactivé par une nouvelle version.

### 3.8 L'entité, les champs, les surfaces

L'en-tête de l'entité (`name`, `description`, `label`, `identity`,
`inheritance`, `states`, `history`, `fields:`, `validation:`,
`operations:`, `gui:`, `allow:`) est décrit dans
[entity.md](entity.md) ; les champs et leurs facettes dans
[types.md](types.md) — dont `sort:` et `group:` sur une association
dérivée (D1016/D1017), `unit:` sur une mesure empruntée à une référence
(D1009) ; les surfaces (`lists`, `forms`, `summary`,
`widgets`, `wizards`, `templates` — et `dashboards` au module) dans
[composants.md](composants.md). Les mécanismes de ce document s'y
appliquent tels quels : `fields: ~{fields.yml}`, la forme courte, les
facettes en bloc, l'interpolation des profils de confidentialité, les
expressions.

### 3.9 `hooks/` et `reprise/`

- **`hooks/`** — `hooks.yml` déclare les familles, chaque famille ses
  fiches par pattern, chaque fiche `name`, `description` (un fichier
  md), `code` (le source), `properties` (D777/D809) :
  [hooks.md](hooks.md) ;
- **`reprise/`** (le nom est celui du cas ; l'organisation est libre)
  — `reprise.yml` déclare les migrations (D662 : `connector:`, `mode:`,
  `reset:`, `source:`, `mapping:`, `operations:`), `source/<TABLE>.yml`
  décrit chaque entité d'origine (`name`, `alias`, `filter`, `identity`,
  `coverage`, `parent`, `fields`, `validation` — D947/D966 ; une colonne
  typée `TABLE.colonne` est une référence, `TABLE[NOM].colonne` une
  référence nommée quand l'entité est visée plusieurs fois — D995,
  `A.colonne or B.colonne` une référence à l'une de deux entités —
  D996 ; les calculés de la source en `formula:` — D660),
  `mapping/NNN_<nom>.yml` chaque règle (`to`, `filter`, `distinct`,
  `parent`, `fields`, `validation`, `report`, `operations` — D656) :
  [mapping.md](mapping.md).

## 4. Les cascades — le plus proche l'emporte

| ce qui cascade | les étages | la décision |
|---|---|---|
| les settings et les types | Syncytium → la version (`settings.yml`) → le module → l'entité → le champ | D359/D360/D588, D991–D993 |
| `allow:` | l'application → le module → l'entité → le champ | D886 |
| la confidentialité | le niveau (D25) × les groupes (D26), le profil nommé aux settings, référencé au champ | D885 |
| `normalize:` | le défaut du type aux settings → le champ | D870/D872, D991 |
| le report des rejets | la règle de migration → le défaut de D407 | D929 |

## 5. L'ingestion — ce qui est refusé

La description se vérifie en entier à l'ingestion, avant de servir
(D328) ; **l'erreur d'ingestion** :

- le format déclaré plus récent que le moteur (D330) ;
- une même version dans deux dossiers de statut (D344) ; une
  transition interdite (D344/D345) ;
- un doublon de nom — entité, type, hook (D344/D396/D408) ; un cycle —
  de groupes (D414), de calculés (D592), de types dérivés (D992) ;
- une référence de fichier non marquée `~{…}` (D956), un fichier
  absent ; une clé de configuration inconnue ;
- un secret en clair dans le `.env` (D902) ;
- une conversion de type avec perte non écrite (D581 — le typage
  statique des expressions) ; une unité sans chemin vers une unité
  connue du champ (D979/D983) ;
- une règle de migration création seule en mode `relative` (D930).

**L'alerte**, pas l'erreur : la surcharge d'une clé au cumul de
fichiers (D968).

Une version en erreur rejoint le registre des versions essayées (D326)
avec sa cause ; le retry passe par l'incrément du build (D323).

## 6. Les points ouverts

- le contenu de `documentation.yml` (le domaine 6 — D333) ;
- la forme de l'en-tête qui déclare la version du format (D322 — le
  principe est acquis, la clé n'est pas écrite dans les exemples) ;
- `menu.yml` et le bloc `dashboards:` du module — décidés (D351, D439),
  sans exemple encore au dépôt.
