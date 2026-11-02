# Le hook de connecteur

Le catalogue des classes est celui de Syncytium. Quand il manque une
classe, un dossier distant, une base que le socle ne connaît pas, un
service en ligne, le projet l'ajoute par du code : un hook de
connecteur. Ce fichier dit ce qu'une classe ajoutée livre, ce qu'elle
reçoit, comment elle se déclare. Le mécanisme commun, la maison
`hooks/`, la fiche, la description par langue, les traces, est au
chapitre 1,
[la version](../01-configuration/04-version.md#39-hooks--le-mécanisme-des-hooks).

## Le sommaire

- [Une classe dans une famille](#une-classe-dans-une-famille)
- [Ce que la classe reçoit](#ce-que-la-classe-reçoit)
- [La fiche et la déclaration](#la-fiche-et-la-déclaration)

## Une classe dans une famille

> **Une classe de connecteur** est l'implémentation d'une famille :
> `postgresql`, `ban`, `smtp_std`. Elle remplit le contrat de sa
> famille, expose ses paramètres et peut compter des propriétés propres.
> Le socle en fournit, un hook de connecteur en ajoute
> ([glossaire](../../glossaire.md)).

Un hook de connecteur ajoute une classe au catalogue (D603). La classe
entre dans une famille existante : « il n'existe pas de hook de
famille : le hook porte sur l'implémentation d'une famille » (D619).
Les neuf familles sont définies par le socle lui-même ; le concepteur
n'en ajoute pas, « sauf à faire évoluer le socle lui-même » (D1716).
Une classe ajoutée se nomme comme une classe du socle : le mot « hook »
n'apparaît jamais dans la configuration (D408).

La classe implémente deux contrats, vérifiés au chargement (D605,
D620) :

- [le socle commun](03-socle.md), les sept méthodes et les propriétés de
  tout connecteur ;
- le contrat de sa famille, dans [les neuf familles](04-familles.md).

## Ce que la classe reçoit

Toute classe reçoit sa déclaration entière à l'initialisation :

- ses `parameters:`, les valeurs des paramètres qu'elle expose, les
  secrets marqués `*` (D944, D1711) ;
- pour un storage source, la carte `entities:`, les entités vers les
  fichiers et les options de lecture, les entêtes, le fichier sans
  entête (D828, D829, D845–D848) ; les familles sans fichiers
  l'ignorent ;
- les informations système `connector.*` (D849), `connector.filename`,
  `connector.path`, `connector.line`, l'identifiant de la ligne par
  rapport à la zone lue, offertes aux sources et au mapping d'une
  reprise.

## La fiche et la déclaration

La fiche suit la forme commune du chapitre 1 (D809) : `name`,
`description`, `code`, `properties`. Les `properties:` sont les
paramètres que la classe expose, le nom, le type, la valeur par
défaut, la marque du secret (D1535, D1711). L'exemple est inventé,
aucun cas n'en porte : une classe `sftp` de la famille `file`, un
dossier distant lu par SFTP. La clé qui nomme la famille, `family:`,
est en proposition. `hooks/connectors/sftp/sftp.yml` :

```yaml
# La classe sftp
# Un dossier distant, lu et acquitté par SFTP ; la famille file, ses deux gestes files et commit.
name: sftp

# La famille
family: file

# La description
# La documentation de la classe, en Markdown, une par langue de la version.
description:
  fr: ~{documentation.fr.md}
  en: ~{documentation.en.md}

# Le code
# Le socle commun et le contrat de la famille file.
code: ~{source.txt}

# Les propriétés
# Les paramètres que la classe expose ; l'environnement en écrit les valeurs.
properties:
  host:
    mode: static
    type: text

  port:
    mode: static
    type: integer
    value: 22

  user:
    mode: static
    type: text

  password*:
    mode: static
    type: text

  directory:
    mode: static
    type: text
    value: /
```

L'environnement déclare un connecteur de cette classe comme un
connecteur du socle : `type:` sa famille, `class:` son nom,
`parameters:` les valeurs (D612, D613) :

```yaml
# Les plans des articles
# Le dossier distant des plans : la reprise y lit le fichier que la fiche article désigne.
plans:
  type: file
  class: sftp
  parameters:
    host: ${PLANS_HOST}
    user: ${PLANS_USER}
    password*: ${PLANS_PASSWORD}
    directory: /plans
```

Les classes du socle se déclarent de même. Dans le cas 4 (banque),
`environments/home/connectors.yml` :

```yaml
# Les connecteurs de l'environnement : la base, l'authentification, le mail et le dossier du legacy. Chaque connecteur
# porte sa famille (type), son implémentation (class) et, au besoin, les paramètres de l'implémentation ; quand le nom
# du connecteur est sa famille, le type ne s'écrit pas. Les chemins viennent des variables du .env de l'environnement.

# La base du foyer
# Le natif du domestique : un fichier SQLite, sans paramètre.
database:
  type: storage
  class: sqlite

# L'authentification
# Pas de secrets dans la famille : aucune.
authentication:
  class: none

# Le mail sortant
# Muet, assumé.
smtp:
  class: none

# Le legacy
# La base d'origine de la reprise : les fichiers CSV d'un dossier hors du dépôt, une entité sur un ou plusieurs fichiers
# du même format.
legacy:
  type: storage
  class: csv

  # Les paramètres du dossier
  # Le chemin, l'encodage et le séparateur des fichiers.
  parameters:
    directory: ${SYNCYTIUM_LEGACY_DIRECTORY}
    encoding: windows-1252
    separator: ";"

  # La carte des entités vers les fichiers
  # Par défaut, la première ligne du fichier porte les entêtes, qui nomment les colonnes de l'entité source ; un fichier
  # qui s'en écarte se déclare en objet — files, headers (l'entête de substitution), skipheader (sans entête). L'entité
  # budget lit deux fichiers : l'union de leurs lignes.
  entities:
    budget: [budget.txt, budget-clos.txt]
```
