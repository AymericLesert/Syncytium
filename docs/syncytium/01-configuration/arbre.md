# 3. L'arbre

Une configuration est un arbre de fichiers. Il part d'un seul fichier,
`syncytium.yml`, et descend jusqu'aux champs d'une entité. Chaque lien de
l'arbre s'écrit : rien ne se déduit de l'arborescence, et un fichier
qu'aucune clé ne cite est un orphelin (D765–D767, D805).

Voici l'arbre de l'entrepôt (le cas 5, `examples/05_entrepot/`) :

```text
syncytium.yml                        # le projet — language:, confidentiality:, environments:, versions:
resources/                           # les images, logos, documents invariants
environments/
├── environments.yml                 # <nom>: ~{…} — la liste des environnements
├── production/
│   ├── production.yml               # description, listen:, storage:, logging:, cleanup:, connectors:,
│   │                                # settings:, documentation:, dataset:, security_advisories: ; passive.yml : replication:
│   ├── connectors.yml               # les connecteurs de l'environnement
│   ├── logging.yml                  # la journalisation
│   ├── cleanup.yml                  # le nettoyage des fichiers — les règles de rétention
└── staging/ …
versions/
├── versions.yml                     # <statut>: ~{…} — beta, production, deprecated, forbidden, sandbox
├── beta/
│   ├── beta.yml                     # environment: staging ; versions: [le pattern]
│   └── v1.0.0.0/
│       ├── version.yml              # version, release-notes, settings:, groups:, migrations:, modules:, hooks:
│       ├── settings.yml             # la maison des types et des réglages
│       ├── groups.yml               # les groupes
│       ├── resources/               # les documents, images, logos versionnables
│       ├── <module>/
│       │   ├── <module>.yml         # name, description, allow:, entities:, menu:, dashboards, resources:
│       │   ├── resources/           # les documents, images, logos attachés au module
│       │   └── <entité>/
│       │       ├── <entité>.yml     # l'en-tête : name, identity, inheritance, history, fields:, validation:, gui:
│       │       ├── fields.yml       # les champs ; les groupes (title:, fields:)
│       │       ├── <groupe>.yml     # les champs d'un groupe, référencés par fields: ~{<groupe>.yml}
│       │       └── gui.yml          # les surfaces (lists, forms, summary, widgets…)
│       ├── hooks/                   # hooks.yml → les familles → les fiches
│       └── reprise/                 # la migration : reprise.yml, source/, mapping/
└── production/ …
```

Ce chapitre descend les quatre premiers étages : le projet, les
environnements, les versions, l'entrée d'une version. Ce que la version
contient est dans [version.md](version.md). Les décisions qui fondent
l'arbre : D346 et D1529 pour `resources/`, D603 et D617 pour les
connecteurs, D343 et D830 pour la journalisation, D1073 pour le
nettoyage, D414 pour les groupes, D803 et D1530 pour les ressources
versionnées et celles du module, D1279–D1280 pour les groupes de champs.

## 3.1 `syncytium.yml` — le projet

Le fichier d'entrée dit ce qui vaut pour toute l'application, hors des
versions : qui elle est, dans quelle langue elle parle au technicien, ce
qui se lit sans compte, où sont ses environnements et ses versions.

```yaml
# Le format de la configuration
# La version de la grammaire que parle ce projet : un moteur qui ne la connaît pas refuse le projet à la lecture de
# cette seule ligne ; un format plus ancien est converti à l'ingestion.
from: Syncytium-1.0

# Le nom du projet
name: entrepot

# La langue technique de l'instance
# Celle des journaux, des traces et des erreurs techniques, parmi les langues du core et des hooks de langue ;
# elle ne change plus.
language: fr

# Les profils de confidentialité
# Un niveau et les groupes qui voient le champ, nommés une fois et référencés au champ ; chaque profil porte son
# niveau (level) et ses groupes (groups) : confidentiality: ${confidentiality.financier}.
confidentiality:
  financier:
    level: protected
    groups: [achats, direction]

# La description du projet
description: L'entrepôt de données de l'entreprise — les données de Cegid PMI standardisées

# Ce qui se lit sans aucun compte : public, private ou promotional
visibility: promotional

# La promotionnelle
# false : l'application n'a pas de documentation promotionnelle et n'en aura pas.
promotional: true

# Le concepteur
# Celui qui a conçu l'application ; la documentation le nomme.
author: Aymeric Lesert

# Le contact
# L'adresse des demandes d'évolution et des questions sur l'application, hors de l'application.
contact: entrepot@entreprise.example

# Les droits d'auteur
# Le titulaire des droits sur la configuration.
copyright: © 2026 L'entreprise

# Les environnements d'exécution
environments: ~{environments/environments.yml}

# Les versions de l'application
versions: ~{versions/versions.yml}

# Les ressources invariantes du projet : les images, les logos, les documents
resources: ~{resources/resources.yml}
```

### `from:` — le core, et l'amorçage

`from:` est la première clé. Elle nomme le core de Syncytium qui
interprète la description et génère sa documentation (D1083, D1361). Le
registre le dit : « La version du format est utilisée par un utilitaire
pour récupérer le core, ingérer la configuration, créer l'instance et
mettre à disposition la suite d'outils qui facilitera l'exploitation du
projet. » (D1358, D1360). `syncytium init`, hors du moteur, lit cette
clé et récupère le core. Le détail est au guide d'exploitation
([documentation.md](../../documentation.md) §17).

Le mot `from:` a un seul sens, en trois places (D1086) :

- au projet, le modèle Syncytium dont la configuration parle la langue ;
- dans une migration, la base d'origine, vers la destination qu'elle met
  à jour ;
- dans une sandbox, la version d'origine, avant l'essai.

### `language:` — la langue technique

`language:` est la langue des journaux, des traces et du catalogue des
erreurs techniques (D1460, D1531). Elle est l'une des langues du core,
ou d'un hook de langue du projet (D1467). Elle vaut pour l'instance
entière et ne change plus : hors des versions, à la racine, la clé est
immuable (D1532). Le registre le dit : « l'anglais ou le français selon
le mode d'installation de Syncytium », ou une langue apportée (D1465).
*Ma lecture* : le concepteur l'écrit, `syncytium init` la vérifie.

### `confidentiality:` — les profils de confidentialité

Un profil nomme une fois le niveau (D25) et les groupes qui voient (D26).
Les champs le référencent par l'interpolation, `${confidentiality.<profil>}`
([mecanismes.md](mecanismes.md) §2.4). Les profils ne sont pas des
settings : ils vivent ici, hors des versions, « à la racine de
Syncytium » (D885, D1536).

### `visibility:` et `promotional:` — ce qui se lit sans compte

`visibility:` dit ce qui se lit sans aucun compte (D1151, D1498) :

- `private` : rien ;
- `promotional` : la plaquette seule, construite par défaut et mise à
  disposition (D1150) ; c'est le défaut ;
- `public` : toute la documentation en mode public, sans donnée ni rien
  de confidentiel.

`promotional:` dit si la plaquette existe (D1511–D1513) : `true` par
défaut ; `false`, l'application n'a pas de promotionnelle et n'en aura
pas. Avec `promotional: false`, une visibilité `promotional`, écrite ou
laissée à son défaut, passe à `private`, et l'ingestion le dit par une
alerte (D1528).

### `author:`, `contact:`, `copyright:` — le projet nommé

- `author:` : le concepteur, celui qui a conçu l'application (D1153) ;
- `contact:` : l'adresse qui reçoit les demandes d'évolution (D1153) ;
- `copyright:` : le titulaire des droits d'auteur de la configuration
  (D1355).

La page des versions les reprend, avec les auteurs de chaque version et
les droits de chaque ressource ([documentation.md](../../documentation.md)
§26).

### `resources:` — les ressources, à trois étages

Trois dossiers `resources/` portent les images, les logos et les
documents (D1529, D1530) :

- à la racine, « des images, des logos ou des documents invariants » ;
- dans la version, « des documents, images, logos versionnables » (D803) ;
- dans le module, « des documents, images ou logos attachés au module ».

*Ma lecture, en proposition* : chaque étage se déclare par la même clé et
la même fiche, `name`, `description`, `file`, `credit` (D1384) ; par le
nom, le plus proche l'emporte, le module, puis la version, puis la
racine.

Toute image et toute icône passe par les ressources (D1625). La
configuration cite l'identifiant de la ressource, `icon: bronze` ou
`picture: logo`. Le fichier ne s'écrit qu'une fois, en `~{…}`, dans la
fiche de la ressource. L'identifiant est le nom de la fiche, cherché du
plus proche au plus lointain, puis parmi les ressources que Syncytium
fournit ; un identifiant inconnu est une erreur d'ingestion (D1626) :

```yaml
# Les icônes du projet
icones:

  # L'icône du niveau d'entrée
  bronze:
    name: bronze

    # Le fichier que la ressource représente
    file: ~{icones/bronze.png}
```

### `description:` — en ligne ou par fichier

`description:` prend le texte en ligne ou un fichier, `description:
~{README.md}` dans la banque (D810, D1082). Aucun fichier du projet
n'échappe aux références `~{…}` : un fichier qu'aucune clé ne cite est
un orphelin.

## 3.2 `environments/` — la configuration technique commune (D325, D342)

Un environnement porte ce qui est commun à toutes les versions mais
propre à un lieu d'exécution : les connecteurs, les journaux, les
réglages techniques, la documentation. Il y en a quatre sortes (D339,
D907) :

- `staging`, le test ;
- `production`, la production active ;
- `passive`, la production passive du PCA-PRA ;
- `sandbox`, l'essai d'une description en cours (D907–D912).

Chaque environnement a son dossier. Son nom est la clé qui le référence
dans `environments.yml` (D1088).

```yaml
# La production
production: ~{production/production.yml}

# Le staging
staging: ~{staging/staging.yml}
```

```yaml
# La description de l'environnement de production
description: ~{README.md}

# L'adresse et le port servis
# Par les variables du déploiement : un changement du réseau ne fait pas une nouvelle version.
listen:
  url: ${SYNCYTIUM_URL}
  port: ${SYNCYTIUM_PORT}

# La base de l'application
# Le connecteur storage qui porte le modèle et ses données ; les autres storages de l'environnement servent la reprise.
storage: entrepot

# La journalisation
logging: ~{logging.yml}

# Le nettoyage des fichiers
cleanup: ~{cleanup.yml}

# Les connecteurs de l'environnement
connectors: ~{connectors.yml}
```

### Les clés d'un environnement

- **`description:`** : le texte de l'environnement, en ligne ou par
  fichier ; dans l'entrepôt, `~{README.md}` porte aussi le texte du
  réseau que le D.A.T. reprend (D1427, D1433).
- **`listen:`** : l'adresse et le port servis, `url:` et `port:`, par des
  variables du déploiement (D1427, acquise D1435). Le registre le dit :
  « cela relève du déploiement et cela n'est pas porté par Syncytium et
  il ne doit pas être nécessaire de changer de version si une
  configuration réseau change. » Les valeurs sont dans le fichier des
  variables, `.env` par habitude (D1428) ; `syncytium init` le crée,
  toutes les variables référencées, nommées exactement, à renseigner,
  sans gabarit (D1429) ; le D.A.T. en expose la liste.
- **`storage:`** : le nom du connecteur qui porte le modèle (D1094).
  Sans bloc `connectors:`, `storage: sqlite` désigne le connecteur
  implicite du mono-poste (D1114).
- **`logging:`** : la journalisation, `~{logging.yml}` (D343, D830). Le
  fichier porte ses clés à la racine, la clé `logging:` nomme déjà la
  section (D1092) : `level:` (`verbose`, `debug`, `info`, `warning`,
  `error`, `exception`), `output:` le fichier daté au nom du projet,
  `max_size:` et `backups:` les dimensions. Le staging est bavard, la
  production en `info`, le passif en `warning`. La rétention est une
  règle de `cleanup.yml`.
- **`cleanup:`** : le nettoyage, `~{cleanup.yml}` (D1073–D1075). Le
  fichier porte à sa racine des règles de rétention nommées,
  `journal:`, `migration_cegid:`. Chacune supprime, dans un dossier
  (`directory:`), les fichiers d'un `pattern:` qui dépassent la
  `retention:`, tous les `interval:`. La rétention est une durée, `90d`,
  ou un nombre sans unité, les n derniers fichiers (D1076). Le journal,
  les watchers et les fichiers de détail des migrations y ont leur
  règle (D1070, D1071).
- **`connectors:`** : les connecteurs de l'environnement,
  `~{connectors.yml}`, chacun par son rôle nommé (D617) : `type:` la
  famille, `class:` l'implémentation, `parameters:` avec les secrets
  marqués `*`. Le détail dans [connectors.md](../../connectors.md).
- **`settings:`** : facultatif, les réglages techniques propres à
  l'environnement, valables pour toutes ses versions (D342, D1095).
  Aucun des cinq cas ne l'écrit.
- **`documentation:`** : facultatif, la personnalisation de la
  génération pour cet environnement, `output:` où vont les fichiers,
  `notify:` ce qui se notifie et à qui, `publish:` ce qui se publie
  (D1167). C'est l'un des quatre lieux de `documentation.yml` (D1164) :
  la version porte `templates:`, `pages:`, `scenarios:` (D1219), le
  module `glossary:` et `regulation:`, le projet ses clés directement
  dans `syncytium.yml`. Rien n'est obligatoire : sans ces fichiers,
  Syncytium génère tout avec ses défauts (D1090). Le détail dans
  [documentation.md](../../documentation.md) §12.
- **`replication:`** : dans `passive.yml` seulement, le lien actif/passif
  du PCA-PRA (D114, D724–D726). La forme courte, `replication: disabled`,
  est le défaut (D725). La forme riche porte `mode:`, `brut`,
  `differential` (D1534) ou `synchronous`, et `every:`, le rythme ;
  `synchronous` sans `every:` est le flux continu. Actif et passif sont
  aux mêmes versions et configurations (D744). Le détail dans
  [administration.md](../../administration.md).
- **`dataset:`** : dans la sandbox de démonstration, le jeu de données
  (D1503–D1505). Cette sandbox a tous ses connecteurs mockés et son
  storage remplacé par un sqlite (D1503) ou par un storage de classe
  `memory` (D1045, D1507–D1508). La clé est une carte, chaque entité vers
  son fichier CSV, dans le gabarit de l'import (D1211, D1412, D1537) ;
  l'ordre de la carte est l'ordre de chargement, les référentiels
  d'abord. Les fichiers sont chargés par le dry-run tout-ou-rien (D234)
  à l'initialisation et à la recharge (D922). Les données sont
  « inventées, réelles ou générées par l'IA … la responsabilité du
  concepteur et des outils qu'il utilise » (D1504).
- **`security_advisories:`** : la veille des CVE (D1431, D1444). `url:`
  est l'adresse du fichier d'avis de sécurité publié par le projet pour
  le core, par une variable du déploiement ; `every:` le rythme de
  lecture. Le bloc absent, la veille n'est pas reliée ; présent,
  l'administrateur l'a autorisée.

```yaml
# Le jeu de données de la sandbox de démonstration
# Une carte, chaque entité vers son fichier CSV ; l'ordre de la carte est l'ordre de chargement, les référentiels
# d'abord.
dataset:
  technique.article: ~{demo/articles.csv}
  stock.depot: ~{demo/depots.csv}
```

```yaml
# La veille des avis de sécurité
# L'adresse du fichier d'avis publié pour le core, par une variable du déploiement, et le rythme de lecture.
security_advisories:
  url: ${SYNCYTIUM_ADVISORIES_URL}
  every: 1d
```

## 3.3 `versions/` — le cycle de vie en dossiers

Le statut d'une version est son emplacement (D338, D340). Déposer une
version dans un dossier, c'est la publier pour l'environnement de ce
dossier. Il y a cinq dossiers possibles :

- `beta/`, sur le staging ;
- `production/`, sur la production ;
- `deprecated/`, les versions dépréciées, conservées ;
- `forbidden/`, les versions interdites, conservées ;
- `sandbox/`, l'essai d'une description en cours (D907).

Seuls les statuts utilisés se déclarent dans `versions.yml` (D804).
Aucun n'est obligatoire : `production` peut se déclarer sans `beta`
(D1115). Le statut porte son environnement, et liste ses versions par un
pattern (D805, D806).

```yaml
# Le statut beta
beta: ~{beta/beta.yml}

# Le statut production
production: ~{production/production.yml}
```

```yaml
# L'environnement qui sert les versions de ce statut
environment: staging

# Les versions du statut : tous les dossiers qui portent un numéro en quatre nombres
versions:
  - ~{v[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/version\.yml}
```

Les transitions sont des gestes de fichier, dans un seul sens (D344,
D345) :

- `beta` vers `production` ;
- `production` vers `deprecated` ou `forbidden` ;
- `beta` vers `forbidden` ;
- jamais l'inverse ; une même version dans deux dossiers est une erreur.

Une version a quatre nombres croissants, `<majeure>.<mineure>.<indice>.<build>`
(D324). Le moteur tient le registre des versions essayées (D326) : une
version en erreur n'est pas réessayée sans incrément du build. Un format
déclaré plus récent que le moteur est refusé (D330).

## 3.4 `version.yml` — l'entrée de la version

Le fichier d'une version nomme ce qu'elle contient : ses langues, ses
notes, ses réglages, ses groupes, ses migrations, ses modules, ses hooks,
ses ressources.

```yaml
# Le numéro de la version
version: 1.0.0.0

# Les langues de la version, la première par défaut
languages: [fr, en]

# Les notes de version
# Les évolutions de cette version ; l'historique se lit par la concaténation des notes.
release-notes: |
  La première version de l'entrepôt de données.

# Les auteurs de la version
authors: [Aymeric Lesert]

# La documentation de la version : les pages, les scénarios, les gabarits
documentation: ~{documentation.yml}

# Les réglages de la version : la maison des types et des paramètres
settings: ~{settings.yml}

# Les groupes
groups: ~{groups.yml}

# Les migrations déclarées
migrations: ~{reprise/reprise.yml}

# Les modules, en liste explicite
modules:
  - ~{technique/technique.yml}
  - ~{tiers/tiers.yml}

# Les hooks de la version
hooks: ~{hooks/hooks.yml}

# Les ressources versionnables, chacune avec son crédit
resources: ~{resources/resources.yml}
```

En sandbox seulement, une clé de plus, `from: <statut>/<version>`, nomme
la version d'origine de l'essai (D907) ; elle est supprimée à la
promotion (D928). Les décisions de ces clés : D217 et D1101 pour les
langues, D808 et D1096 pour les notes, D1355 pour les auteurs, D1219
pour la documentation, D662 pour les migrations, D415 et D766 pour la
liste des modules, D777 pour les hooks, D803, D1384 et D1529 pour les
ressources.

### Les langues de la version

`languages:` liste les langues que la version gère, de une à trois ; la
première est la langue par défaut (D217, D219, D1101). Ajouter ou
retirer une langue fait une nouvelle version.

- **Une seule langue** : `label:`, `hint:` et `description:` s'écrivent
  en texte simple, `description: Le prix d'achat.` ; la forme par langue
  reste admise.
- **Plusieurs langues** : chaque texte précise ses langues,
  `label: { fr: Prix, en: Price }`. Un texte simple est une erreur
  d'ingestion. Une langue de la liste absente d'un texte est une erreur
  d'ingestion (D1474) : la règle vaut pour les libellés, les aides, les
  descriptions, les md, les gabarits PDF et mails, la skill, le
  glossaire des termes (D1475), les descriptions de la reprise (D1517).
- Une langue d'un texte qui n'est plus dans la liste n'est pas une
  erreur : la langue par défaut est employée (D1101).

L'entrepôt parle le français seul ; la banque parle le français,
l'anglais et l'espagnol.

### Une langue que le core ne porte pas

Le projet peut apporter une langue (D1465). La commande
`syncytium language fr pt` construit le catalogue à traduire : tous les
items du core, codifiés (D1160), avec leurs textes de référence en `fr`,
et lui seul (D1466). Le concepteur le traduit item par item.

- **La langue est un hook**, la septième famille (D1467) :
  `hooks/languages/pt/`, sa fiche, son catalogue, et ce qui est propre à
  la langue, le fuseau, les formats, le sens d'écriture (D217, D1471).
  Voir [hooks.md](../../hooks.md).
- **Il doit être complet** : un item manquant est une erreur d'ingestion
  (D1468) ; la même règle que pour les textes du projet (D1474). Un hook
  du core sans cette langue est complété par l'application dans sa
  couche (D1163).
- **Les textes du projet suivent** : `pt` entre dans `languages:`, et
  chaque `label:`, `hint:`, `description:` la porte comme toute langue
  de la version.
- **Cette langue peut devenir la langue technique** de l'instance
  (D1460) : la commande construit aussi les erreurs, les journaux et les
  traces du core.
- La référence du développeur (D1411) et la skill du core (D1410)
  restent au core, lues dans sa langue par défaut. Un catalogue complet
  est prêt à entrer dans le core ; quand un core le porte, le fichier du
  projet devient une surcharge (D1163).
