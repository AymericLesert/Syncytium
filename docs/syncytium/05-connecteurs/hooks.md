# Le hook de connecteur

*Ce que le projet ajoute par du code : une classe dans une famille,
jamais une famille. Le mécanisme commun est au chapitre 1,
[la version](../01-configuration/version.md#39-hooks--le-mécanisme-des-hooks).*

## Le sommaire

- [Une classe dans une famille (D603–D642)](#une-classe-dans-une-famille-d603d642)
- [La déclaration](#la-déclaration)

## Une classe dans une famille (D603–D642)

Ajoute **une classe de connecteur** — la passerelle globale, déclarée
à l'environnement (`environments/<env>.yml` — D603/D617, aucune
déclinaison). **Les neuf familles sont closes** (D619, D623, D692,
D957) : `storage` (les bases — et les formats csv/xml/json des exports
et imports, D636), `smtp`, `file` (le guetteur), `directory` (l'AD
Azure), `location` (le géocodage), `webhook` (les entrées servies),
`siren`, `llm` (le modèle de langage du module `chat`, D957),
**`authentication`** (D692 — le contrat
`challenge()`/`verify(preuve)` aux deux visages, l'utilisateur et
l'API ; les classes `local`/`azure_ad`/`sso` ; la session et le
rapprochement du compte au moteur — D82/D686) — « il n'existe pas de
hook de famille : le hook porte sur l'implémentation d'une famille »
(une classe, jamais un contrat neuf ; `route` attend une version
ultérieure du moteur).

**Le contrat par famille (D605/D620)** : « chaque famille a ses
propres méthodes et fonctions » — la famille contraint le contrat, la
conformité de la classe se vérifie au chargement. **Et le socle
commun d'abord** (D621–D630) : toute classe reçoit **sa déclaration
entière à l'initialisation** — les `parameters:` (les secrets y sont
les paramètres marqués `*`, D944) et,
pour les storages sources, **la carte `entities:`** (D828/D829 — le
mapping entités ↔ fichiers, les options de lecture D845–D848 ;
optionnelle, les familles sans fichiers l'ignorent) ; **le
connecteur porte les informations système `connector.*`** (D849) —
`connector.filename`, `connector.path`, `connector.line`
(l'identifiant de la ligne **par rapport à la zone**, la ligne
vivante — jamais la ligne réelle du fichier), la liste extensible —
offertes aux sources et au mapping ; toute classe implémente
`initialize`/`release`, `connect`/`disconnect`, `ping()` (le statut
error/initialized/disconnected/connected/closed, la fréquence à
`every:`), `onerror` (le mock ou la page de maintenance — D627) et
`describe()` (la documentation markdown/html de l'instance — D630).
Les contrats détaillés — storage (la transaction, l'instance —
`get_instance`/`duplicate_instance`/`rename_instance` —, les
entités et les enregistrements composés des types-visiteurs
(D680–D689 : l'écriture en lots, la lecture au curseur), la
migration à chaud orchestrée par le moteur), smtp (`send`), file
(`get_files`/`get_file`/`commit`), directory (la lecture seule),
location (`geocode`/`reverse`), webhook (les entrées, l'abonnement,
l'authentification obligatoire), siren (`verify`) — sont dans
[les familles](familles.md). Les propriétés paramètrent (pas de contexte — le démarrage du projet),
**les secrets par paramètre marqué `*` et variable d'environnement
chiffrée** (D603/D944), les
deux sens décrits (D606) — et **le stockage des entités est lui-même
un connecteur** (D606) : les bases du catalogue portent l'instance,
pas seulement l'échange. **La migration inter-connecteurs** (D606) :
« Syncytium peut convertir ou transférer des données d'un connecteur
à l'autre » — le changement de moteur (SQLServer → PostgreSQL…) par
la translation déclarative (le primitif aux quatre usages), **en
instantané ou en différentiel** — le différentiel rejoignant la
réplication passive du PCA-PRA (D112–D114).

## La déclaration

L'exemple — la déclaration à l'environnement, dans le fichier que
l'environnement cite (D603, D617, D342). Dans le cas 4 (banque),
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

Une classe ajoutée par un hook se déclare de même : `type:` sa famille,
`class:` son nom, `parameters:` ce qu'elle attend (D612–D613). Ce
qu'elle livre — le socle commun et le contrat de sa famille — est
dans [les familles](familles.md).
