# 3. L'arbre

La chaîne des déclarations, du sommet à la feuille — **rien ne se
déduit de l'arborescence, chaque lien s'écrit** (D765–D767, D805 : pas
de déclaration orpheline). L'exemple du cas 5 (`examples/05_entrepot/`) :

```text
syncytium.yml                        # le projet — language:, confidentiality:, environments:, versions:
resources/                           # les images, logos, documents invariants (D346, D1529)
environments/
├── environments.yml                 # <nom>: ~{…} — la liste des environnements
├── production/
│   ├── production.yml               # description, listen:, storage:, logging:, cleanup:, connectors:,
│   │                                # settings:, documentation:, dataset:, security_advisories: ; passive.yml : replication:
│   ├── connectors.yml               # les connecteurs de l'environnement (D603/D617)
│   ├── logging.yml                  # la journalisation (D343/D830)
│   ├── cleanup.yml                  # le nettoyage des fichiers — les règles de rétention (D1073)
└── staging/ …
versions/
├── versions.yml                     # <statut>: ~{…} — beta, production, deprecated, forbidden, sandbox
├── beta/
│   ├── beta.yml                     # environment: staging ; versions: [le pattern]
│   └── v1.0.0.0/
│       ├── version.yml              # version, release-notes, settings:, groups:, migrations:, modules:, hooks:
│       ├── settings.yml             # la maison des types et des réglages (D991–D993, D1535)
│       ├── groups.yml               # les groupes (D414)
│       ├── resources/               # les documents, images, logos versionnables (D803, D1529)
│       ├── <module>/
│       │   ├── <module>.yml         # name, description, allow:, entities:, menu:, dashboards, resources:
│       │   ├── resources/           # les documents, images, logos attachés au module (D1530)
│       │   └── <entité>/
│       │       ├── <entité>.yml     # l'en-tête : name, identity, inheritance, history, fields:, validation:, gui:
│       │       ├── fields.yml       # les champs ; les groupes (title:, fields:) — D1279
│       │       ├── <groupe>.yml     # les champs d'un groupe, référencés par fields: ~{<groupe>.yml} (D1280)
│       │       └── gui.yml          # les surfaces (lists, forms, summary, widgets…)
│       ├── hooks/                   # hooks.yml → les familles → les fiches (hooks.md)
│       └── reprise/                 # la migration : reprise.yml, source/, mapping/ (mapping.md)
└── production/ …
```

## 3.1 `syncytium.yml` — le projet

```yaml
from: Syncytium-1.0                  # le core de Syncytium, la première clé (D1083, D1361)
name: entrepot
language: fr                         # la langue technique de l'instance (D1460, D1531)
confidentiality:                     # les profils de confidentialité, à la racine (D885, D1536)
  financier: { level: protected, groups: [achats, direction] }
description: L'entrepôt de données de l'entreprise — …
visibility: promotional              # public | private | promotional — ce qui se lit sans aucun droit (D1151 ; tranchée D1498 — promotional : la plaquette seule)
promotional: true                    # false : l'application n'a pas de promotionnelle et n'en aura pas (D1511, D1513)
author: Aymeric Lesert               # celui qui a conçu l'application (D1153)
contact: evolutions@example.org      # le contact des demandes d'évolution (D1153)
copyright: © 2026 L'entrepôt SAS     # le titulaire des droits d'auteur de l'application (D1355)
environments: ~{environments/environments.yml}
versions: ~{versions/versions.yml}
resources: ~{resources/resources.yml}   # les ressources invariantes (D1529 ; la déclaration, ma lecture)
```

**`visibility:` — ce qui se lit sans aucun compte** (D1151, tranchée
D1498) : `private` — rien ; `promotional` — la plaquette seule,
construite par défaut et mise à disposition (D1150), c'est le défaut ;
`public` — toute la documentation en mode public, sans donnée ni rien
de confidentiel. La clé vit au projet, à côté de `promotional:`
(D1511–D1513), qui dit si la plaquette existe : avec
`promotional: false`, une visibilité `promotional`, écrite ou laissée à
son défaut, **passe à `private`**, et l'ingestion le dit par une alerte
(D1528).

**`author:`, `contact:`, `copyright:` — le projet nommé** (D1153,
D1355) : le concepteur, celui qui a conçu l'application et reçoit les
demandes d'évolution ; le titulaire des droits d'auteur de la
configuration. La page des versions (documentation.md §26) les
reprend, avec les auteurs de chaque version et les droits de chaque
ressource.

**`language:` — la langue technique de l'instance** (D1460, D1473,
D1531) : la langue des journaux, des traces et du catalogue des erreurs
techniques — `language: fr` dans `syncytium.yml` (D1531 : « Dans le
fichier d'environnement yml, language: n'est pas à sa place »), l'une
des langues du core et des hooks de langue du projet (D1467),
**immuable : hors des versions, à la racine, la clé ne change plus**
(D1532) ; « l'anglais ou le français selon le mode
d'installation de Syncytium » (D1460), ou une langue apportée (D1465).
*Ma lecture* : le concepteur l'écrit, `syncytium init` la vérifie.

**`from:` — la clé de l'amorçage, `syncytium init`** (D1358, D1360) : « La version du format
est utilisée par un utilitaire pour récupérer le core, ingérer la
configuration, créer l'instance et mettre à disposition la suite
d'outils qui facilitera l'exploitation du projet. » — `from:` porte la
version du core de Syncytium (D1361), chaque core ayant son moteur
d'interprétation et sa conversion en documentation ; `syncytium init`,
hors du moteur, lit la première clé et récupère ce core ; la
documentation générée est la sienne ; le détail au guide
d'exploitation (documentation.md §17).

**`from:` — l'origine, partout** (D1086) : un seul sens pour trois
places — **le projet** (`syncytium.yml`) : le modèle Syncytium dont la
configuration parle la langue ; **la migration** : la base d'origine,
vers la destination qu'elle met à jour ; **la sandbox** (`version.yml`)
— la version d'origine, avant l'essai.

**`confidentiality:` — les profils de confidentialité** (D885, D1536 :
« Cette section est définie à la racine de Syncytium ») : un profil
nomme une fois le niveau (D25) et les groupes qui voient (D26) ;
les champs le référencent par l'interpolation (§2.4). Les profils ne
sont pas des settings : ils vivent ici, hors des versions.

**`resources:` — les trois dossiers** (D1529, D1530) : à la racine, « des
images, des logos ou des documents invariants » ; dans la version, « des
documents, images, logos versionnables » (D803) ; dans le module, « des
documents, images ou logos attachés au module ». *Ma lecture, en
proposition* : chaque étage se déclare par la même clé et la même
fiche — `name`, `description`, `file`, `credit` (D1384) — ; par le nom,
le plus proche l'emporte : le module, puis la version, puis la racine.

**La description par fichier** (D810/D1082) : `description:` prend le
texte en ligne ou un fichier — `description: ~{README.md}` (le cas 4) ;
aucun fichier du projet n'échappe aux références `~{…}` : un fichier
qu'aucune clé ne cite est un orphelin.

## 3.2 `environments/` — la configuration technique commune (D325/D342)

**`listen:` — l'adresse et le port servis, par le `.env`** (D1427 ;
acquise à la clôture du rang 6, D1435) : « le listen:url + port est à mettre à la configuration mais
via des variables d'environnement (.env). En fait, cela relève du
déploiement et cela n'est pas porté par Syncytium et il ne doit pas être
nécessaire de changer de version si une configuration réseau change. » —
`listen: { url: ${SYNCYTIUM_URL}, port: ${SYNCYTIUM_PORT} }` dans
`environments/<env>.yml`, les valeurs dans le fichier des variables de
l'environnement — `.env` par habitude, « ce fichier pourrait être
différent » (D1428) —, hors des versions ; **`syncytium init` le crée automatiquement**, toutes
les variables référencées, nommées exactement, à renseigner — pas de
gabarit (D1429) ; le D.A.T. (documentation.md §28) expose la liste des
variables, dans la limite des confidentialités.

**`dataset:` — le jeu de données d'une sandbox de démonstration**
(D1503–D1505, le rang 9) : la sandbox de démonstration a **tous ses
connecteurs mockés et son storage remplacé par un sqlite** (D1503) **ou
par un storage de classe `memory`** (D1045, D1507–D1508 — en mémoire
seule, avec un ratio d'espace, rien sur le disque) ;
**`dataset:`, facultative**, lie les fichiers CSV du jeu de données —
un par entité, dans le gabarit de l'import (D1211, D1412), chargés par
son dry-run tout-ou-rien (D234) à l'initialisation et à la recharge
(D922) ; les données « inventées, réelles ou générées par l'IA … la
responsabilité du concepteur et des outils qu'il utilise » (D1504) ;
**la forme est une carte** (D1537) — chaque entité, dans l'adressage
logique du point (D363), vers son fichier, cité par `~{…}` ; l'ordre de
la carte est l'ordre de chargement, les référentiels d'abord :

```yaml
# environments/sandbox/sandbox.yml
dataset:
  technique.article: ~{demo/articles.csv}
  stock.depot: ~{demo/depots.csv}
```

**`security_advisories:` — la veille des CVE** (D1431, D1444) : à
l'environnement, « plus parlant » — `url:` l'adresse du fichier d'avis
de sécurité publié par le projet pour le core, par une variable du
déploiement, `every:` le rythme de lecture ; le bloc absent, la veille
n'est pas reliée ; présent, l'administrateur l'a autorisée :

```yaml
security_advisories:
  url: ${SYNCYTIUM_ADVISORIES_URL}    # le fichier du projet, ou un miroir interne
  every: 1d
```

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

# environments/production/production.yml — le nom est la clé de environments.yml (D1088)
description: L'environnement de production — …
storage: entrepot                    # le connecteur qui porte le modèle (D1094)
logging: ~{logging.yml}
cleanup: ~{cleanup.yml}
connectors: ~{connectors.yml}
```

- **`connectors.yml`** — chaque connecteur par **son rôle nommé**
  (D617) : `type:` la famille (D623/D692/D957 — storage, smtp, file,
  directory, location, webhook, siren, authentication, llm), `class:`
  l'implémentation, `parameters:` (les secrets marqués `*`) ; le
  détail dans [connectors.md](../../connectors.md) ;
- **`replication:`** (D724–D726, D1534) — dans `environments/passive.yml`
  seulement, le lien actif/passif du PCA-PRA (D114) : la forme courte,
  `replication: disabled`, le défaut (D725) ; la forme riche, `mode:` —
  `brut`, `differential`, `synchronous` — et `every:`, le rythme ;
  `synchronous` sans `every:`, le flux continu ; actif et passif aux
  mêmes versions et configurations (D744) ; le détail dans
  [administration.md](../../administration.md) ;
- **`cleanup.yml`** (D1073–D1075) — le fichier que la clé `cleanup:` de
  l'environnement désigne : à la racine, les règles de rétention nommées
  (la clé est le nom — `journal:`, `migration_cegid:`) — sans niveau
  `cleanup:` redondant :
  chacune supprime, dans un dossier (`directory:`),
  les fichiers d'un `pattern:` qui dépassent la `retention:` (une durée
  — `90d` ; sans unité, les n derniers fichiers par date de création,
  D1076), tous les `interval:` ; le journal, les watchers, les fichiers de détail des
  migrations y ont leur règle (D1070/D1071) ;
- **`logging.yml`** (D343/D830, la forme de D1091) — le contrat neutre
  du journal, à la racine du fichier — la clé `logging:` de
  l'environnement nomme déjà la section (D1092) : `level:` (verbose, debug, info, warning,
  error, exception — le staging plus bavard, la production en info,
  le passif en warning), `output:` (le fichier daté, au nom du projet),
  les dimensions `max_size:` et `backups:` ; la rétention est une règle
  de `cleanup.yml` (D1073) ; l'implémentation du journal relève des
  choix techniques ;
- **`documentation.yml`** — la personnalisation de la génération, en
  **quatre lieux**, selon ce qui varie (D1164) : **à l'environnement**,
  référencé par `documentation:` de `production.yml` — `output:`, où
  vont les fichiers et leurs formats, `notify:`, ce qui se notifie et à
  qui, `publish:`, ce qui se publie (D1167) ; **à la version**, référencé
  par `documentation:` de `version.yml` — `templates:` les gabarits des
  éditions, `pages:` les pages ajoutées, `scenarios:` les scénarios des
  personas (D1219 : le véhicule et la banque y écrivent leurs scénarios,
  l'entrepôt sa page du support) ; **au module**, par `documentation:` de
  son fichier — `glossary:`, `regulation:` ; **au projet**, les clés
  directement dans `syncytium.yml` — `home:`, `author:`, `contact:`,
  `accessibility:`, `skill:`, `glossary:`. Rien n'est obligatoire : sans
  ces fichiers, Syncytium génère tout avec ses défauts (D1090) ; le
  détail de chaque clé dans [documentation.md](../../documentation.md) §12 ;
- **`settings.yml`** de l'environnement, facultatif (D1095) — les
  réglages techniques qui varient d'un environnement à l'autre et valent
  pour toutes ses versions (D342) ; ce qui est partagé passe par les
  variables ; aucun des cinq cas n'en a l'usage (le cas 6 qui devait
  l'introduire est abandonné, D1518).

## 3.3 `versions/` — le contenu versionné, le cycle de vie en dossiers

**Le statut d'une version est son emplacement** (D338/D340) ; **seuls
les statuts utilisés se déclarent dans `versions.yml`** (D804) — aucun n'est obligatoire : `production` peut se déclarer sans `beta` (D1115) : quatre
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

## 3.4 `version.yml` — l'entrée de la version

```yaml
version: 1.0.0.0
languages: [fr, en]                  # les langues de la version, la première par défaut (D217/D1101)
release-notes: |                     # les évolutions de la version (D808/D1096) — l'historique par concaténation
  La première version de l'entrepôt de données — …
authors: [Aymeric Lesert]            # les personnes qui ont écrit la version (D1355)
documentation: ~{documentation.yml}  # la documentation de la version — les pages, les scénarios, les gabarits (D1219)
settings: ~{settings.yml}
groups: ~{groups.yml}
migrations: ~{reprise/reprise.yml}   # les migrations déclarées (D662)
modules:                             # la liste explicite (D415/D766)
  - ~{technique/technique.yml}
  - ~{tiers/tiers.yml}
hooks: ~{hooks/hooks.yml}            # les hooks de la version (D777)
resources: ~{resources/resources.yml}   # les ressources versionnables (D803, D1529) — chacune avec son credit: (D1384)
from: <statut>/<version>             # en sandbox seulement : la version d'origine (D907), supprimé à la promotion (D928)
```

**Les langues de la version** (D217/D219/D1101) : `languages:`, sous
`version:`, liste les langues que la version gère — de une à trois ;
la première est la langue par défaut ; ajouter ou retirer une langue
fait une nouvelle version. **Une seule langue** : `label:`, `hint:` et
`description:` s'écrivent en texte simple (`description: Le prix
d'achat.`), la forme par langue reste admise. **Plusieurs langues** :
chaque texte précise ses langues (`label: { fr: Prix, en: Price }`) —
un texte simple est une erreur d'ingestion ; **une langue de la liste
absente d'un texte est une erreur d'ingestion** (D1474 — la même règle
partout : les libellés, les aides, les descriptions, les md, les
gabarits PDF et mails, la skill, le glossaire des termes — D1475 —, les
descriptions de la reprise, règles et sources — D1517) ; une
langue du texte qui n'est plus dans la liste n'est pas une erreur :
la langue par défaut est employée (D1101). Le cas 5 parle le français seul ;
la banque (le cas 4) parle le français, l'anglais et l'espagnol.

**Une langue que le core ne porte pas** (D1465 — précise D1160–D1163,
D1101) : le projet l'apporte — le cas « ajoute » du catalogue en
couches (D1163), appliqué au catalogue du moteur. La commande
**`syncytium language fr pt`** construit le catalogue à traduire — `fr`
la langue de référence, `pt` la langue souhaitée : tous les items du
core, codifiés (D1160), avec leurs textes de référence, **et lui
seul** (D1466) — et **le concepteur le traduit item par item**. Les
textes du projet suivent la règle ci-dessus : `pt` dans `languages:`,
chaque `label:`, `hint:`, `description:` la porte comme toute langue
de la version (D1101), le repli et la complétude s'appliquent. **La langue est un hook** —
la septième famille (D1467 : « une langue a un hook aussi ») :
`hooks/languages/pt/`, sa fiche, son catalogue, et ce qui est propre
à la langue — le fuseau et les formats de D217, le sens d'écriture
(D1471) — ([hooks.md](../../hooks.md)) ;
`languages:` nomme alors une langue du core ou d'un hook de langue. **Il doit
être complet** — le niveau « pour Syncytium » de D1162 : un item
manquant est une erreur d'ingestion, strict (D1468 : « En utilisant la
commande, il a la complétude. La traduction est entre ses mains ») — la
même règle que pour les textes du projet (D1474). Un hook du core
sans cette langue suit D1163 : l'application complète ses items dans
sa couche. La référence du développeur (D1411) et la skill du core
(D1410) restent au core, lues dans sa langue par défaut. **Cette
langue peut devenir la langue technique** de l'instance (D1460) : la
commande construit aussi les erreurs, les journaux et les traces du
core. Un catalogue complet est prêt à entrer dans le core ; quand un
core le porte, le fichier du projet devient une surcharge (D1163, le
plus proche l'emporte).
