# La déclaration et le câblage

Un connecteur se déclare une fois par environnement, sous son nom, avec
sa famille, sa classe et ses paramètres. Ce fichier dit où et comment,
ce que sont les secrets et le rythme, puis comment le socle et les hooks
trouvent le connecteur qu'ils emploient.

## Le sommaire

- [La déclaration par environnement](#la-déclaration-par-environnement)
  - [Les clés d'un connecteur](#les-clés-dun-connecteur)
  - [Les paramètres et leurs défauts](#les-paramètres-et-leurs-défauts)
  - [Les secrets](#les-secrets)
  - [Le rythme, `every:`](#le-rythme-every)
  - [La base d'origine d'une reprise](#la-base-dorigine-dune-reprise)
  - [Les classeurs : Excel et les formats voisins](#les-classeurs--excel-et-les-formats-voisins)
- [Le câblage](#le-câblage)
  - [Le socle, par le nom](#le-socle-par-le-nom)
  - [Le hook, par `uses:`](#le-hook-par-uses)
- [Les renvois](#les-renvois)

## La déclaration par environnement

> **Un environnement** est un cadre d'exécution hermétique : le staging,
> la production, le passif, chacun avec ses connecteurs, son journal et
> ses variables ([glossaire](../../glossaire.md)).

Chaque environnement porte ses connecteurs (D616, D617). Le staging a
les siens, la production les siens, le passif sa réplique ; la sandbox
prend ceux de son environnement (D911). L'ingestion vérifie que chaque
environnement décrit tous les connecteurs.

Un environnement est un dossier (D342). Son fichier cite le fichier des
connecteurs et désigne le storage du modèle (D1094). Dans le cas 5
(entrepôt), `environments/production/production.yml` :

```yaml
# La description de l'environnement de production — la vie courante de l'application
description: ~{README.md}

# L'adresse et le port servis
# Par les variables du déploiement : un changement du réseau ne fait pas une nouvelle version.
listen:
  url: ${SYNCYTIUM_URL}
  port: ${SYNCYTIUM_PORT}

# La base de l'application
# Le connecteur storage qui porte le modèle et ses données ; les autres storages de l'environnement servent la reprise.
storage: entrepot

# La base miroir
# Là où les migrations se construisent et se contrôlent, à l'image de l'entrepôt, avant d'y reporter leurs
# différences ; elle est vidée à la fin de la migration. Sans cette clé, un connecteur en mémoire et
# quatre-vingt-dix jours de rétention.
mirror:

  # Le connecteur de la base miroir
  # Un storage de l'environnement ; sans cette clé, memory, un connecteur en mémoire.
  storage: temporaire

  # La rétention
  # La durée pendant laquelle le détail des passages se garde ; sans cette clé, quatre-vingt-dix jours.
  retention: 90d

# La journalisation
# Le niveau des traces, leur format et le fichier du journal de l'environnement.
logging: ~{logging.yml}

# Le nettoyage des fichiers
# Les règles de rétention de l'environnement : le journal, les dépôts des watchers.
cleanup: ~{cleanup.yml}

# Les connecteurs
# Les bases, les services et les annuaires que l'application utilise dans cet environnement ; leurs paramètres viennent
# des variables du .env de l'environnement, les secrets y sont chiffrés.
connectors: ~{connectors.yml}
```

Le fichier des connecteurs déclare chacun sous son nom. Dans
`environments/production/connectors.yml`, la base de l'application et le
mail sortant (D1708) :

```yaml
# L'entrepôt
# La base de l'application : un schéma PostgreSQL.
entrepot:
  type: storage
  class: postgresql
  parameters:
    host: ${ENTREPOT_HOST}
    database: ${ENTREPOT_DATABASE}
    schema: entrepot
    user: ${ENTREPOT_USER}
    password*: ${ENTREPOT_PASSWORD}

  # Le réglementaire
  # Le stockage est en France.
  rgpd:
    countries: [FR]

# Le mail sortant
# Le relais de messagerie de l'entreprise : les rapports de la migration et les alertes partent par lui.
smtp:
  class: smtp_std
  parameters:
    host: ${SMTP_HOST}
    port: 587
    address_from: ${SMTP_FROM}
    password*: ${SMTP_PASSWORD}

  # Le réglementaire
  # Le relais de messagerie est en France.
  rgpd:
    countries: [FR]
```

### Les clés d'un connecteur

- **`type:`**, la famille, le contrat. Elle s'omet quand le nom du
  connecteur est sa famille, `smtp`. Elle s'écrit quand plusieurs
  connecteurs partagent une famille : `entrepot` et `cegid` sont deux
  `storage` (D612, D1093).
- **`class:`**, la classe qui remplit le contrat (D613, D615). Le mot
  « hook » ne paraît jamais dans la configuration : une classe ajoutée
  par un hook se nomme comme une classe du socle (D408).
- **`parameters:`**, les valeurs des paramètres de la classe. Les
  paramètres sont exposés par la classe, ci-dessous.
- **`rgpd: countries:`**, les pays du stockage ou de la destination, une
  liste, pour le registre des traitements (D1345).
- **`every:`**, le rythme du connecteur, ci-dessous.

Les propriétés du socle, `connection:`, `pool:`, `retry:`, `timeout:`,
`onerror:`, valent pour tout connecteur ; un cas n'écrit que ce qu'il
surcharge. Elles sont dans [le socle commun](03-socle.md).

### Les paramètres et leurs défauts

Une classe expose ses paramètres : le nom, le type, la valeur par
défaut, la marque du secret (D1535, D1711). Les défauts viennent en
cascade, « portés par l'implémentation du connecteur, par les
settings » (D1711) ; l'environnement écrit les valeurs, et le plus
proche l'emporte (D461). Les valeurs viennent des variables du `.env`
de l'environnement (D321). Tous les paramètres sont statiques : le
connecteur se définit au démarrage (D603).

Deux lectures restent en proposition : une section `connector:` des
settings, la classe puis le paramètre, sur le patron des trois niveaux
(D1239) ; et le refus à l'ingestion d'un paramètre que la classe
n'expose pas.

### Les secrets

Un paramètre confidentiel porte la marque `*` à son nom, `password*`
(D944). Le nom est celui du contrat de la classe ; la marque dit la
confidentialité. La valeur n'est jamais écrite en clair : elle est la
référence d'une variable d'environnement, `${ENTREPOT_PASSWORD}`, et la
variable est chiffrée par une clé propre à l'environnement et à la
machine (D603, D902). Un secret ne paraît jamais en clair dans un
journal. Le dépôt versionné ne porte aucune valeur en clair (D336). Un
secret laissé en clair est signalé chaque jour, `unencrypted:` (D901).

### Le rythme, `every:`

`every:` donne le rythme d'un connecteur (D604), dans la grammaire des
durées et du calendaire, `5min`, `daily[02:00]` (D434, D476). Il fixe la
fréquence du `ping()` (D621). Pour un connecteur `file`, il fixe le
rythme du thread d'écoute du dossier (D635) : un fichier détecté
déclenche l'opération déclarée par son `when:`, au chapitre 6 (D609,
D1689). Aucun cas n'en porte. Un dossier de commandes surveillé
s'écrirait :

```yaml
# Les commandes entrantes
# Le dossier surveillé : le connecteur l'écoute toutes les cinq minutes, et l'opération déclarée se déclenche.
incoming_orders:
  type: file
  class: file_std
  parameters:
    directory: ${ORDERS_DIRECTORY}
  every: 5min
```

### La base d'origine d'une reprise

La base d'origine d'une reprise est un connecteur comme les autres. Un
storage de format, `csv` ou `xlsx`, porte une carte des entités vers les
fichiers, une liste ou un motif (D828, D845, D806). Dans le cas 4
(banque), `environments/home/connectors.yml` :

```yaml
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

### Les classeurs : Excel et les formats voisins

Un classeur se lit comme une source de format, par la classe `xlsx`
(D846–D848, D1932). Derrière Excel, la même lecture vaut pour les formats
libres d'OpenOffice et pour les feuilles en ligne, comme Google Sheets :
un fichier, des feuilles, des cellules. Leurs classes restent à nommer.

La carte `entities:` dit, pour chaque entité, ses fichiers et sa lecture :

- **`files:`** : la liste ou le motif des classeurs ;
- **`range:`** : la plage, au nommage d'Excel, `FEUILLE!A3:H`. Sa première
  ligne porte les entêtes, comme pour un CSV ; `headers:` les remplace ;
- **`single: true`** : un seul enregistrement par classeur. C'est la
  feuille-formulaire, dont chaque cellule s'adresse une à une ;
- **`fields:`** : les colonnes que l'entité expose (D1933, D1936).

Une colonne de la carte porte :

- **`type:`** : son type ;
- **`reference:`** : sa cellule. C'est l'adresse d'Excel,
  `IDENTIFICATION!B1`, ou le nom d'une cellule nommée dans le classeur ;
- **`label:`** : son entête dans la plage, quand la colonne se lit dans un
  tableau.

Le connecteur expose ainsi les colonnes et leurs types par la description
de ses entités. La migration exploite cette exposition : ses `sources/`
n'ajoutent que ce que le connecteur ne porte pas, une description, une
colonne calculée. Une colonne qui n'ajoute rien ne s'écrit pas dans la
source (D1937).

Ces informations servent à lire la feuille, pour la migration, et à la
mettre à jour. La mise à jour est une faculté du storage : le classeur
se décrit comme un storage, qui lit et qui écrit (D1937). La classe
`xlsx` est de la famille `storage` : sa lecture et son écriture relèvent
du contrat du storage, sans grammaire propre (D1938).

Les adresses des cellules s'écrivent dans `connectors.yml`, donc par
environnement. C'est une limite de l'approche (D1937). Deux cas se
distinguent :

- la feuille évolue sans changer la nature de ses informations : le
  modèle du classeur ou le document change, et la description du
  connecteur suit, dans l'environnement, sans nouvelle version (D1938) ;
- la feuille embarque plus d'informations exploitables par
  l'application : la description du connecteur se met à jour, la source
  aussi s'il y en a une, et il faut une nouvelle version.

Dans le cas 3 (véhicule), `environments/home/connectors.yml` déclare une
feuille-formulaire :

```yaml
    # Les feuilles-formulaires, un enregistrement par classeur
    identification:
      files: [ '.*\.xlsx?' ]
      single: true

      # Les colonnes
      # Sept cellules de la feuille IDENTIFICATION ; l'image s'adresse à la feuille, son ancre varie d'un classeur à
      # l'autre.
      fields:

        nom:
          type: text[..40]
          reference: IDENTIFICATION!B1

        immatriculation:
          type: text[..12]
          reference: IDENTIFICATION!E1

        mode_achat:
          type: text[..40]
          reference: IDENTIFICATION!H1

        lieu_achat:
          type: text[..60]
          reference: IDENTIFICATION!H2

        date_debut:
          type: date
          reference: IDENTIFICATION!K1

        date_fin:
          type: date
          reference: IDENTIFICATION!K2

        photo:
          type: image
          reference: IDENTIFICATION
```

La borne d'une plage a trois formes (D848) :

- explicite, `A3:H100` ;
- `...`, comme `A8:G...` : l'arrêt à la première ligne vide sur toutes
  les colonnes ;
- ouverte, `A3:H` : la fin de la feuille, les lignes vides sautées.

Une liste de plages se replie sur la première qui existe (D847). Une
plage peut mêler une cellule d'un autre onglet, répétée sur chaque ligne.
Le même fichier déclare l'échéancier :

```yaml
    # L'échéancier, le même format sur deux feuilles
    # La première plage existante sert ; « ... » s'arrête à la première ligne vide.
    echeance:
      files: [ '.*\.xlsx?' ]
      range:
        - CREDIT!A8:G...
        - LOA!A3:G...

      # Les colonnes
      # La plaque, une cellule d'un autre onglet répétée sur chaque ligne, puis les colonnes de la plage.
      fields:

        immatriculation:
          type: text[..12]
          reference: IDENTIFICATION!E1

        date:
          type: date
          label: Date

        interet:
          type: decimal
          label: Intérêt

        amortissement:
          type: decimal
          label: Amortissement

        assurance:
          type: decimal
          label: Assurance

        mensualite:
          type: decimal
          label: Mensualité
```

## Le câblage

Un connecteur déclaré doit être trouvé par ce qui l'emploie. Deux
règles (D1710) : le socle lie par le nom, le hook par `uses:`.

### Le socle, par le nom

Le socle trouve ses connecteurs par le nom (D612, D1710) :

- le storage du modèle est désigné par le fichier de l'environnement,
  `storage: entrepot` (D1094) ;
- la base miroir des migrations y est désignée de même, par `storage:`
  sous `mirror:`, ici `temporaire` ; la forme courte,
  `mirror: temporaire`, dit la même chose (D1894) ; sans cette clé,
  `memory`, un connecteur en mémoire (D1889–D1892) ;
- la base d'origine d'une reprise, par `from:` dans la migration
  (D1087) ;
- le mail sortant est le connecteur `smtp`, le géocodage `location`,
  l'identité `authentication` : le connecteur nommé comme sa famille
  (D612, D1093).

Dans le cas 5 (entrepôt), `migration/migration.yml` désigne la base
d'origine :

```yaml
# La migration cegid
# La reprise des données de Cegid PMI dans l'entrepôt ; l'ordre des migrations déclarées est leur ordre d'exécution.
cegid:

  # La base d'origine
  # Le storage de PMI, lu en lecture seule.
  from: cegid
```

L'entrepôt géocode l'adresse de livraison par le constructeur
`geolocation("…")` en formule ; le connecteur `location` se trouve par
son nom (D1004).

### Le hook, par `uses:`

Le contrat d'un hook d'opération déclare dans `connectors:` les
connecteurs qu'il attend, nommés et typés (D913). La déclaration de
l'opération lie chacun à un connecteur de l'environnement par `uses:`,
toujours écrit (D914). Il n'y a aucune liaison implicite, même quand
l'environnement n'offre qu'un candidat de la famille : l'erreur
d'ingestion nomme alors l'attendu, sa famille et le candidat unique. La
surcharge locale par une propriété au nom du rôle (D611) est ce
`uses:`.

Le nom du rôle est disponible au contexte d'exécution,
`context.connector.<rôle>` (D612). Plusieurs connecteurs par item ne
sont pas exclus : « dans le cas de l'affichage d'une carte, nous pouvons
définir plusieurs connecteurs et, en fonction de l'écran, utiliser l'un
ou l'autre » (D612). Le hook de connecteur, lui, ajoute une classe à une
famille : [le hook de connecteur](06-hooks.md).

## Les renvois

Le déclenchement d'une opération par un connecteur, un fichier détecté,
un point d'entrée appelé, `when: <connecteur>` ou
`when: <connecteur>.<entrée>` (D604, D609, D641), est un déclencheur
d'opération : le chapitre 6, les opérations (D1689, D1720). Ce chapitre
garde l'écoute du connecteur `file` (D635) et les entrées servies du
`webhook`, abonnées à l'initialisation (D641).

La migration et la transformation, le mapping, ses deux maisons
`sources/` et `mapping/`, le sens de la règle, la dépréciation, le
dry-run (D646–D660), sont la reprise : le chapitre 8, par
[mapping.md](../../mapping.md) (D1721). Ce chapitre garde `from:` au
câblage et la migration à chaud du storage, `duplicate_instance` et
`rename_instance` (D631, D674).
