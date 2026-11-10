# Le hook de connecteur

Le catalogue des classes est celui de Syncytium. Quand il manque une
classe, un dossier distant, une base que le socle ne connaît pas, un
service en ligne, le projet l'ajoute par du code : un hook de
connecteur. Ce fichier dit ce qu'une classe ajoutée livre, ce qu'elle
reçoit, comment elle se déclare, comment elle annonce son retrait. Le
mécanisme commun, la maison `hooks/`, la fiche, la description par
langue, les traces, est au chapitre 1,
[la version](../01-configuration/04-version.md#39-hooks--le-mécanisme-des-hooks).

## Le sommaire

- [Une classe dans une famille](#une-classe-dans-une-famille)
- [Ce que la classe reçoit](#ce-que-la-classe-reçoit)
- [La fiche et la déclaration](#la-fiche-et-la-déclaration)
- [La dépréciation d'une classe de connecteur](#la-dépréciation-dune-classe-de-connecteur)

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

## La dépréciation d'une classe de connecteur

> **La dépréciation** d'un élément annonce son retrait. L'élément vit
> encore ; le bloc `deprecation:` dit ce qui le remplace, ou son abandon.
> Elle ne se confond pas avec la dépréciation d'une version, qui est
> effective ([glossaire](../../glossaire.md)).

Une classe ajoutée par un hook peut être appelée à disparaître : une
autre classe la remplace, ou le service qu'elle atteint s'arrête. La
configuration ne la retire pas d'un coup. Elle l'annonce d'abord, dans la
fiche de la classe, dans la version en service (D650, D1876). Les
connecteurs déclarés à cette classe servent comme avant.

Le connecteur déclaré, lui, ne porte pas ce bloc. Il vit dans un
environnement, non dans une version : sa dépréciation n'a pas de raison
d'être (D1875). Seule la classe, qui vit dans les hooks d'une version, se
déprécie.

**La forme courte.** Le bloc nomme la remplaçante, rien de plus (D1873).
La remplaçante est une autre classe, nommée par son nom (D1875).
L'exemple est construit, aucun cas n'en porte. Une classe `ftp` céderait
à la classe `sftp` :

```yaml
# La classe ftp
# Un dossier distant, lu par FTP.
name: ftp

# La dépréciation
# La classe sert encore dans cette version ; la classe sftp la remplace.
deprecation: sftp
```

**La forme longue.** Elle porte deux clés (D1871) :

- **`documentation:`**, le texte qui explique la dépréciation. C'est un
  texte de la version : à plusieurs langues, il les porte toutes
  (D1474) ;
- **`to:`**, la classe remplaçante.

Sans `to:`, le bloc dit l'abandon, et `documentation:` est exigée. Une
dépréciation dit toujours le remplacement ou l'abandon ; l'ingestion le
vérifie (D650). Le bloc n'a pas de `mode:` : sa présence dit l'intention
(D1872).

```yaml
# La classe ftp
# Un dossier distant, lu par FTP.
name: ftp

# La dépréciation
# La classe sert encore dans cette version ; le texte dit ce qui la remplace.
deprecation:
  documentation:
    fr: Le FTP transmet en clair ; la classe sftp le remplace.
    en: FTP transmits in clear text; the sftp class replaces it.
  to: sftp
```

**Ce que la dépréciation d'une classe touche.** Tout ce qui repose sur
elle (D1877) :

- les connecteurs déclarés à cette classe, par leur `class:`, dans chaque
  environnement ;
- le socle et les hooks qui emploient ces connecteurs ;
- les paramètres que la classe expose, que l'environnement renseigne.

**De l'intention à la suppression.** Une dépréciation se joue en trois
temps :

1. **L'intention.** Le bloc est écrit. Rien ne change : les connecteurs de
   cette classe servent comme avant (D650, D1872).
2. **La validation.** Une beta complète la dépréciation : en retirant la
   classe, elle la valide (D1870, D1875).
3. **La suppression.** Elle vient avec une version : la classe quitte les
   hooks de la version (D650).

Le mot `deprecated` nomme autre chose : le statut d'une version, déposée
dans `versions/deprecated/`. Là, la dépréciation est effective (D1869).
Sur une classe, le bloc s'écrit toujours `deprecation:` (D1871).
