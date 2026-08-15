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

## Le catalogue de base (D604)

| la famille (le type) | les implémentations consignées | l'acquis |
|---|---|---|
| `storage` — les bases de données | SQLServer, MySQL, PostgreSQL, Oracle… | D604/D606/D613 |
| l'annuaire | l'AD Azure — le premier visage de la passerelle d'authentification | D418/D604 |
| `file` — les fichiers | CSV, JSON… — le guetteur à `every:` | D604 |
| `location` — le géocodage | `ban` (Addok), `nominatim` | D294 |
| l'itinéraire | `osrm`, `valhalla` | D514 |
| `smtp` — le mail sortant | smtp_std | D564/D574 |
| la reprise | le connecteur de reprise — lecture seule, durée de vie administrée | D175–D179 |

Le catalogue s'étend par le hook de connecteur (D603) — le contrat de
la famille à implémenter (D605), voir [hooks.md](hooks.md).

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
```

## La migration et la transformation

- **« Syncytium peut convertir ou transférer des données d'un
  connecteur à l'autre »** (D606) — la translation déclarative, le
  primitif aux quatre usages ;
- **le `from:`** (D610) : « pour les migrations/transformations, un
  connecteur d'entrée et éventuellement un connecteur de sortie » —
  `connector: { storage: main_db, from: legacy_db }` ;
- **l'instantané ou le différentiel** (D606) — le changement de
  moteur par la translation, le différentiel rejoignant la
  réplication passive du PCA-PRA (D112–D114) ;
- **le chantier ouvert** (D610) : « le from décrit la procédure de
  migration/transformation — une configuration basée sur les éléments
  déjà vus, que nous allons étendre » (la reprise D175–D179, l'import
  D234–D238, la transaction tenue ouverte D594).

## Les points ouverts

- **le mapping du `from:`** — la configuration de la procédure (le
  chantier nommé, D610) ;
- **les contrats détaillés par famille** — les méthodes de chacune
  (D605 pose le principe) ;
- **la défaillance** — le connecteur en échec : le comportement, le
  rapport (D406 ?), la reprise après incident ;

