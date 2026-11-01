# La déclaration et le câblage

*Où un connecteur se déclare, par environnement, avec ses paramètres et
ses secrets ; comment le socle et les hooks le trouvent.*

## Le sommaire

- [La déclaration — `environments/<env>/connectors.yml`](#la-déclaration--environmentsenvconnectorsyml)
- [Le câblage — le socle par le nom, le hook par `uses:`](#le-câblage--le-socle-par-le-nom-le-hook-par-uses)
- [Les renvois — les déclencheurs et la migration](#les-renvois--les-déclencheurs-et-la-migration)

## La déclaration — `environments/<env>/connectors.yml`

Chaque environnement porte ses connecteurs (D616, D617) : le staging les
siens, la production les siens, le passif sa réplique, la sandbox ceux
de son environnement (D911) ; l'ingestion
vérifie que tous les connecteurs sont décrits dans chaque environnement.
Un dossier par environnement (D342) : le fichier de l'environnement cite
le fichier des connecteurs et désigne le storage du modèle (D1094). Dans
le cas 5 (entrepôt), `environments/production/production.yml` :

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

# La journalisation
# Le niveau des traces, leur format et le fichier du journal de l'environnement.
logging: ~{logging.yml}

# Le nettoyage des fichiers
# Les règles de rétention de l'environnement : le journal, le détail des migrations, les dépôts des watchers.
cleanup: ~{cleanup.yml}

# Les connecteurs
# Les bases, les services et les annuaires que l'application utilise dans cet environnement ; leurs paramètres viennent
# des variables du .env de l'environnement, les secrets y sont chiffrés.
connectors: ~{connectors.yml}
```

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

- **`type:`** — la famille, le contrat ; omis quand le nom du connecteur
  est sa famille, écrit quand plusieurs connecteurs partagent une
  famille (D612, D1093) ;
- **`class:`** — la classe qui remplit le contrat (D613, D615) ; le mot
  « hook » ne paraît pas dans la configuration (D408) ;
- **`parameters:`** — les paramètres que la classe expose à son contrat,
  le nom, le type, la marque du secret (D1535, D1711) ; leurs défauts
  viennent en cascade, « portés par l'implémentation du connecteur, par
  les settings, ... » (D1711), puis l'environnement écrit les valeurs,
  par les variables du `.env` (D321) ; le plus proche l'emporte (D461) ;
  tous sont statiques, le connecteur se définit au démarrage (D603).
  *En proposition* : la section `connector:` des settings, la classe
  puis le paramètre (D1239) ; un paramètre que la classe n'expose pas
  est une erreur d'ingestion ;
- **le secret, le paramètre marqué `*`** (D944) : `password*:
  ${ENTREPOT_PASSWORD}` — le nom du paramètre est le contrat de la
  classe, la marque dit la confidentialité, jamais en clair dans un
  journal, la valeur est la référence seule d'une variable chiffrée
  (D603, D902) ; le dépôt versionné ne porte jamais une valeur en clair
  (D336) ; un secret laissé en clair, `unencrypted:`, se voit chaque
  jour (D901) ;
- **`rgpd: countries:`** — les pays du stockage ou de la destination, une
  liste (D1345) ;
- **`every:`** — le rythme du connecteur (D604 ; la grammaire des durées
  et du calendaire, D434, D476) : la fréquence du
  `ping()` (D621) et, pour un connecteur `file`, le thread d'écoute du
  dossier (D635) ; l'événement détecté déclenche l'opération déclarée par
  son `when:`, au chapitre 6 (D609, D1689). Aucun cas n'en porte ; un
  dossier de commandes surveillé s'écrirait :

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

La base d'origine d'une reprise est un connecteur comme les autres. Dans
le cas 4 (banque), `environments/home/connectors.yml`, les fichiers CSV
du legacy et la carte des entités vers les fichiers, une liste ou un
motif (D828, D845, D806) :

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

## Le câblage — le socle par le nom, le hook par `uses:`

**Le socle trouve ses connecteurs par le nom** (D612, D1710) :

- le storage du modèle est désigné par le fichier de l'environnement,
  `storage: entrepot` (D1094) ;
- la base d'origine d'une reprise, par `from:` dans la migration
  (D1087) ; dans le cas 5 (entrepôt), `reprise/reprise.yml` :

```yaml
# La migration cegid
# La reprise des données de Cegid PMI dans l'entrepôt ; l'ordre des migrations déclarées est leur ordre d'exécution.
cegid:

  # La base d'origine
  # Le storage de PMI, lu en lecture seule.
  from: cegid
```

- le mail sortant est le connecteur `smtp`, le géocodage `location`,
  l'identité `authentication` : le connecteur nommé comme sa famille
  (D612, D1093) ; l'entrepôt géocode l'adresse de livraison par le
  constructeur `geolocation("…")` en formule, et le connecteur
  `location` se trouve par son nom (D1004).

**Le hook lie par `uses:`** (D913, D914) : le contrat d'un hook
d'opération déclare dans `connectors:` les connecteurs qu'il attend,
nommés et typés ; la déclaration de l'opération lie chacun à un
connecteur de l'environnement par `uses:`, toujours écrit — aucune
liaison implicite, même quand l'environnement n'offre qu'un candidat de
la famille ; l'erreur d'ingestion nomme alors l'attendu, sa famille et
le candidat unique. La surcharge locale par une propriété au nom du
rôle (D611) est ce `uses:`. Le nom du rôle est disponible au contexte
d'exécution, `context.connector.<rôle>` (D612) ; plusieurs connecteurs
par item ne sont pas exclus, « dans le cas de l'affichage d'une carte,
nous pouvons définir plusieurs connecteurs et, en fonction de l'écran,
utiliser l'un ou l'autre » (D612). Le hook de connecteur, lui, ajoute
une classe à une famille ; la partie « Les hooks » de ce chapitre le
dit.

## Les renvois — les déclencheurs et la migration

Le déclenchement d'une opération par un connecteur — l'événement d'un
fichier détecté, l'appel d'un point d'entrée, `when: <connecteur>` ou
`when: <connecteur>.<entrée>` (D604, D609, D641) — est un déclencheur
d'opération : le chapitre 6, les opérations (D1689, D1720). Ce chapitre
garde l'écoute du connecteur `file` (D635) et les entrées servies du
`webhook`, abonnées à l'initialisation (D641).

La migration et la transformation — le mapping, ses deux maisons
`source/` et `mapping/`, le sens de la règle, la dépréciation, le
dry-run (D646–D660) — sont la reprise : le chapitre 8, par
[mapping.md](../../mapping.md) (D1721). Ce chapitre garde `from:`, au câblage,
et la migration à chaud du storage, `duplicate_instance` et
`rename_instance` (D631, D674).
