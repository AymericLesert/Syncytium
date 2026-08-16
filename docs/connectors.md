# Les connecteurs de Syncytium

Ce document rassemble **la nature et les exemples des échanges
consignés sur les connecteurs** — le cinquième artefact préparatoire
de la documentation (Q58, le domaine 6 — D602), après le
[glossaire](glossaire.md), les [composants](composants.md), les
[hooks](hooks.md) et les [types](types.md). Les décisions citées
renvoient à la [conception](conception.md).

## La nature

- **Une passerelle entre Syncytium et un système tiers** (D79) — une
  base de données, un annuaire, des fichiers, un géocodeur, un
  serveur de mail… ; **le connecteur décrit ses entrants et ses
  sortants** (D606) ;
- **Global** (D603/D617) : « il ne trouve pas de déclinaison dans
  les modules, ni les entités » — et **déclaré à l'environnement**
  (`environments/<env>.yml`) : « chaque environnement doit disposer
  de ses propres connecteurs » (D616), l'ingestion vérifiant que
  **tous les connecteurs sont décrits dans chaque environnement**
  (D617) ;
- **Sans contexte** (D603) : « les paramètres d'un connecteur sont
  juste les propriétés du connecteur — il se définit au démarrage du
  projet » — hors de la pile des contextes (D553), l'exception
  assumée ;
- **Le type et l'implémentation** (D613) : **le type** (`storage`,
  `smtp`, `location`, `siren`…) **est la famille — et le contrat**
  (D605 : « chaque famille a ses propres méthodes et fonctions ») ;
  **l'implémentation** (`postgresql`, `sqlserver`, `mysql`, `oracle`,
  `ban`, `smtp_std`…) le remplit — la compatibilité se juge au type ;
- **Le stockage est un connecteur** (D606) : « les entités sont liées
  à un connecteur de base de données » — les bases du catalogue
  portent l'instance, pas seulement l'échange ;
- **La sobriété** (D612) : « quelques connecteurs suffiront au bon
  fonctionnement de l'application ».

## La déclaration — `environments/<env>.yml`

La déclaration « décrit la liste des connecteurs disponibles pour le
fonctionnement de l'application » (D610/D612) — **portée par chaque
environnement** (D616–D617 : le staging les siens, la production les
siens, le passif sa réplique ; la complétude vérifiée à
l'ingestion) :

```yaml
# environments/staging.yml
connectors:
  main_db: { type: storage, class: postgresql, secrets: [db_password] }
  smtp:    { class: smtp_std }        # le simple : le nom = le type (D612)
  location:
    class: ban                        # le géocodage (D294/D604)
    parameters: { url: https://api-adresse.data.gouv.fr }
    secrets: [api_key]
  incoming_orders:
    type: file
    class: file_std
    parameters: { path: /exchange/in, format: csv }
    every: 5min                                # le guetteur (D603–D604)
```

- **`type:`** — la famille-contrat ; « pour les cas les plus simples,
  le type est le nom du connecteur » (D612) ;
- **`class:`** — la classe qui remplit le contrat (D613/D615) ; le
  mot `hook` ne paraît pas dans la configuration (D408) ;
- **`parameters:`** — les propriétés (la forme des settings — D588) ;
- **`secrets:`** — **la référence seule** : « les secrets peuvent
  faire référence à une variable d'environnement, et la variable peut
  être cryptée via une clé construite en fonction de l'environnement
  et de la machine d'exécution » (D603) — le dépôt versionné (D336)
  ne porte jamais une valeur en clair ;
- **`every:`** — la grammaire D434/D476, « pour les connecteurs qui
  ont besoin d'être régulièrement rafraîchis **ou testés** — par
  exemple un file watcher : la détection de présence d'un fichier, le
  fichier mis à jour et relu » (D604).

## Le câblage — les rôles nommés

- **Le hook nomme le type qu'il attend** (D611) : `send` → `smtp`, la
  géolocalisation → `location`, le stockage → `storage`, la
  migration → `from` (D610) ; **le nom est disponible dans le
  contexte d'exécution** — le hook lit `context.connector.<rôle>`
  (D612) ;
- **le câblage n'est pas toujours requis** (D612) — « pour des
  questions de simplicité » : le connecteur nommé comme son type se
  trouve seul ; « dans les cas les plus complexes, le câblage doit
  être explicite » à la racine :

```yaml
# syncytium.yml — la racine (D610)
connector: { storage: main_db, from: legacy_db }
```

- **la surcharge locale** (D611) : « pour l'opération `send`, le
  connecteur attendu est "smtp" — mais s'il existe une propriété
  `smtp` sur l'opération, elle peut préciser un connecteur compatible
  avec le smtp » ;
- **plusieurs connecteurs en service** (D612) — et « l'utilisation de
  plusieurs connecteurs par un item n'est pas exclue » : « dans le
  cas de l'affichage d'une carte, nous pouvons définir plusieurs
  connecteurs et, en fonction de l'écran, utiliser l'un ou l'autre ».

## Les sept familles (D623) et le catalogue de base (D604)

**Le jeu est clos** (D619) — sept familles, « route est un exemple
d'extension ultérieure » (l'extension = l'affaire du moteur, jamais
du hook) ; **la famille contraint le contrat** (D620), la conformité
d'une classe vérifiée au chargement :

| le type (la famille) | le rôle | les classes consignées | l'acquis |
|---|---|---|---|
| `storage` | les bases de données — le stockage du modèle et les échanges ; **les formats structurés pour les exports et les imports** (D636) | postgresql, sqlserver, mysql, oracle… — **et csv, xml, json…** | D604/D606/D613/D636 |
| `smtp` | le mail sortant | smtp_std | D564/D574 |
| `file` | les fichiers — le dépôt, le guetteur, l'acquittement (le format se lit par un storage — D636) | file_std | D604/D634–D635 |
| `directory` | l'annuaire — l'authentification, les comptes | l'AD Azure | D418/D604 |
| `location` | le géocodage | ban (Addok), nominatim | D294 |
| `webhook` | **« un point d'entrée dans les différents appels d'api versionnés »** — get, put, post, delete (D609) | — | D623–D624 |
| `siren` | la vérification des identifiants | — | D611/D623 |

*(La reprise n'est pas une famille : le connecteur de reprise
(D175–D179) s'appuie sur les familles existantes — le storage en
lecture, le file, le webhook.)*

## Le socle commun du contrat (D621–D630)

**Les méthodes** — toute classe les implémente :

| la méthode | le moment, le rôle |
|---|---|
| `initialize` / `release` | le démarrage et l'arrêt de l'application (D621) |
| `connect` / `disconnect` | à l'appel du connecteur (D621) |
| `ping()` | la santé — **le statut** : `error`, `initialized`, `disconnected`, `connected`, `closed`… ; `every:` en précise la fréquence (D621) |
| `onerror` | la défaillance — retourne **un mock de résultat** (le connecteur non critique — l'écho de la dégradation D68) ou **l'appel à la page de maintenance** (le connecteur clé) (D627) |
| `describe()` | « générer de la documentation en markdown/html pour la documentation automatique de l'instance » (D630) — la règle de **tous** les hooks (D645), la doc technique assemblée version par version |

**Les propriétés du socle** : `connection: permanent | on_demand |
idle[15min]` *(en proposition — D621)*, `pool:` (le parallélisme
asynchrone — D622/D436), `retry:` et `timeout:` (la reprise sur
erreur — D625 ; l'homonymie notée : ce retry n'est pas la reprise de
données D175), `onerror:` (la page de maintenance des connecteurs
clés — D627).

**La position de sécurité** (D625–D627) : « en cas d'erreur, il faut
passer sur une page de maintenance et une alerte doit être émise »
(D626) ; et **la condition indispensable** : « l'application doit
démarrer uniquement si l'envoi de mail à l'administrateur est
possible » — le canal d'alerte avant tout, le smtp vérifié au
démarrage.

## Les contrats par famille

### `storage` (D629, D631–D632)

| le groupe | les méthodes |
|---|---|
| la transaction | `begin` · `commit` · `rollback` — l'assise de la transaction tenue ouverte (D594) |
| l'introspection | `get_schema` — le schéma, les tables, les colonnes, les contraintes, les dépendances |
| les migrations | `create_table` · `update_table` · `delete_table` |
| le schéma | `create_schema` · `delete_schema` · **`switch_schema`** — « créer l'instance automatiquement ou faire migrer silencieusement », la bascule atomique (D631) |
| les enregistrements | `create` · `read` · `update` · `delete` |

**La migration à chaud en quatre gestes** : `create_schema` → la
migration → `switch_schema` → `delete_schema` — et **le mapping est
automatique** (D632) : la translation déclarative dérive les
correspondances des deux méta-schémas, le technicien n'écrit rien
(le mapping manuel demeure l'affaire du `from:` — les systèmes
étrangers).

**Les storages de format (D636)** : « les storages "csv", "xml"… sont
définis pour les exports et exploitables pour les imports » — les
formats structurés sont **des classes de cette famille** (le contrat
borné à ce que le format sait faire) : l'export (D445/D530) écrit
vers un storage de format, l'import (D234–D238) en lit.

### `smtp` (D628)

`send(message, pièces[], destinataires[])` — **le message au format
HTML** (le template `mail` D562/D564 : le mustache + markdown rendu
en HTML fait le corps), **les pièces jointes : une liste de fichiers,
quel que soit le format** ; **l'expéditeur est configuré dans les
propriétés du connecteur**.

### `directory` (D633)

`get_users` (tous les utilisateurs de l'AD) · `get_users_from_group`
(les utilisateurs d'un groupe) · `get_groups` (tous les groupes) —
**« uniquement de la lecture », aucun pendant en écriture** : la
synchronisation des comptes et des groupes, les affectations restant
des actes d'administration (D341/D210). *(L'authentification — la
passerelle D418 — flaguée pour le chantier sécurité.)*

### `file` (D634–D635)

| la méthode | le rôle |
|---|---|
| `get_files(pattern)` | la liste des fichiers au motif |
| `get_file(filename)` | la lecture — **à la garde de stabilité** : « Syncytium doit attendre qu'un fichier en cours d'écriture soit terminé » |
| `commit(filename)` | l'acquittement — le renommage ou le déplacement, **aux méta-caractères** : un compteur, un identifiant, une date et heure… |

**Le thread d'écoute** (D635) : « `every:` est utilisé sur `connect`
ou `initialize` pour démarrer un thread dédié à l'écoute des
fichiers » — le connecteur écoute lui-même, l'événement détecté
déclenche l'opération déclarée (`when:` — D609). **Le contenu se lit
par un storage de format** (D636) : la famille `file` détecte et
acquitte, le storage csv/xml lit les enregistrements.

### `location` (D637)

`geocode(address: {}) : geolocation` · `reverse(geolocation) :
address` — les signatures typées : l'adresse (l'objet structuré) vers
le type `geolocation` du modèle (D391) et l'inverse ; **le type porte
les coordonnées longitude/latitude et/ou l'adresse postale
normalisée** (D638) — geocode rend le point ET l'adresse mise au
propre ; `ban`/`nominatim` (D294) les implémentent.

### `siren` (D639)

`verify(siren) : {}` — « retourne les informations de l'entreprise si
le SIREN est vérifié » : la vérification et l'enrichissement en un
geste, le formulaire client pré-rempli. *(Flagué : l'inventaire des
champs disponibles via l'API Sirene de l'INSEE — la dénomination, la
forme juridique, le code NAF, l'adresse du siège, les
établissements/SIRET, l'état actif/cessé… — à arrêter à
l'implémentation de la classe.)*

### `webhook` (D640–D641)

Le connecteur ne sort pas : **il déclare des entrées que Syncytium
sert**. Chaque point d'entrée porte :

- **le mode** de l'api — `get`, `put`, `post` ou `delete` ;
- **le point d'entrée** — la route versionnée
  `api/<version>/webhook/<nom du point d'entrée>` (D623–D624) ;
- **les paramètres** — « présents dans le header de l'api ou dans
  l'url de l'api ».

**Un webhook = une liste de points d'entrée** (D641) ; le moteur
monte les routes, contrôle les paramètres, reçoit. **Le
déclenchement passe par une authentification obligatoire** (D642) :
aucune entrée anonyme — la garde est d'office sur la route, le
mécanisme (clé, jeton, signature…) au chantier sécurité (D418). **Le `when:` est
un abonnement** : `when: <connecteur>` (toute entrée) ou l'entrée
précisée — posé à l'`initialize` (D621), l'appel entrant déclenche
l'opération déclarée (D609).

```yaml
connectors:
  orders_api:
    type: webhook
    class: webhook_std
    entries:
      new_order:    { mode: post, parameters: [ source, order_id ] }
      order_status: { mode: get,  parameters: [ order_id ] }
```

Le catalogue s'étend par le hook de connecteur (D603) — **une classe
dans une famille, jamais une famille neuve** : « Syncytium fournit un
nombre limité de familles ; il n'existe pas de hook de famille »
(D619) — le contrat de la famille à implémenter (D605), voir
[hooks.md](hooks.md).

## Les déclencheurs et les échanges

- **l'entrant par le fichier** (D604) : le guetteur détecte, relit —
  la porte d'entrée ;
- **le déclenchement d'opération par connecteur** (D609) : « utile
  pour traiter des webhooks ou pour déclencher automatiquement un
  process d'import » — `when: <nom du connecteur>` *(en
  proposition)* sur l'opération déclarée :

```yaml
operations:
  archive_and_notify:
    when: incoming_orders          # l'événement du connecteur (D609)
    operations: [ import, notify ] # la liste d'opérations du socle (D609)
    commit: auto
  import_order:
    when: orders_api.new_order     # l'abonnement au point d'entrée (D641)
    operations: [ import ]
    commit: auto
```

- **le `when:` en abonnement** (D641) : posé à l'initialisation de
  l'application — le connecteur et éventuellement le point d'entrée
  attendu ; l'appel entrant (webhook) ou l'événement détecté (file)
  déclenche.

## La migration et la transformation

- **les deux fonctions essentielles du mapping** (D646) : **la
  migration entre 2 versions** (à chaud — et la mécanique de la
  compatibilité ascendante/descendante, le pilier P3) et **la
  migration entre 2 schémas storage** (le système existant vers le
  nouveau — les interfaces de Syncytium offrent une vue sur les
  données migrées et validées) ;
- **« Syncytium peut convertir ou transférer des données d'un
  connecteur à l'autre »** (D606) — la translation déclarative, le
  primitif aux quatre usages ;
- **le `from:`** (D610) : « pour les migrations/transformations, un
  connecteur d'entrée et éventuellement un connecteur de sortie » —
  `connector: { storage: main_db, from: legacy_db }` ;
- **l'instantané ou le différentiel** (D606) — le changement de
  moteur par la translation, le différentiel rejoignant la
  réplication passive du PCA-PRA (D112–D114) ;
- **le mapping automatique de la migration à chaud** (D632) : entre
  deux versions du méta-schéma, la translation déclarative dérive les
  correspondances — le technicien n'écrit rien ;
- **l'écriture unifiée (D647–D649)** : **l'usage 1 est implicite**
  (le `from:` = la version précédente, porté par Syncytium ; ne
  s'écrivent que le renommage — l'ancien nom gardé —, la
  **dépréciation inscrite** sur champs/entités/modules, et le
  changement de type par **les conversions que chaque type porte**
  D579/D584 ; les règles de création/suppression D11–D13
  persistent) ; **l'usage 2 parle le même langage** : le `from:`
  tire le storage d'origine (`get_schema`), **l'exhaustivité** des
  tables, colonnes, dépendances et contraintes — tout est couvert ou
  **déclaré ignoré** (D176 étendu), la traduction par les fonctions
  et conversions du langage unique ;
- **le dry-run du `from:` à deux modes (D649)** : **absolu** —
  tout-ou-rien, la bascule d'un système A vers une application
  Syncytium ; **relatif** — l'entrepôt : les conformes portés, les
  erreurs isolées et le rapport à l'administrateur, **la vue sur le
  taux de couverture** par rapport à la source d'origine (la reprise
  D175–D179 = ce mode ; les deux postures D180 incarnées).

## Les points ouverts

- **le mapping du `from:`** — la configuration de la procédure (le
  chantier nommé, D610) ;
- **les champs de l'API Sirene** (D639) — l'inventaire à
  l'implémentation ;
- **l'authentification** (la passerelle D418, la garde du webhook
  D642) — au chantier sécurité ;

