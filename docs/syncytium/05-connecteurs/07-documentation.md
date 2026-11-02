# Ce que le connecteur livre à la documentation

Un connecteur n'écrit rien dans la documentation fonctionnelle, ou
presque ; il est le cœur du D.A.T. et du guide d'exploitation. Ce
fichier dit ce que le connecteur livre à chaque documentation générée,
puis ce que le storage rend pour le chapitre du stockage du
dictionnaire.

## Le sommaire

- [La facette du connecteur](#la-facette-du-connecteur)
  - [La fonctionnelle](#la-fonctionnelle)
  - [La réglementation](#la-réglementation)
  - [Le projet et le support](#le-projet-et-le-support)
  - [La documentation du développeur](#la-documentation-du-développeur)
  - [Le D.A.T.](#le-dat)
  - [Le guide d'exploitation](#le-guide-dexploitation)
  - [La maintenance, les risques et les améliorations](#la-maintenance-les-risques-et-les-améliorations)
  - [La promotionnelle](#la-promotionnelle)
  - [L'information](#linformation)
- [Le `describe(model)` du storage](#le-describemodel-du-storage)

## La facette du connecteur

> **La facette documentation** d'un composant est ce qu'il livre à
> chaque documentation générée. Le connecteur livre peu à la
> fonctionnelle et beaucoup au D.A.T. et au guide d'exploitation
> ([glossaire](../../glossaire.md)).

La documentation est une facette des composants (D1158, D1159) : chaque
type de composant décline dans chaque type de document, et Syncytium
assemble. Voici ce que le connecteur livre, documentation par
documentation.

### La fonctionnelle

Presque rien : le connecteur appartient à l'environnement, non à ce que
l'utilisateur fait. Trois choses passent tout de même :

- l'authentification `none` fait écrire « un seul utilisateur, tous les
  droits » (D1176) ;
- le `smtp` conditionne la phrase du socle sur les notifications par
  mail (D1228) ; un `smtp` de classe `none` la retire ;
- le `llm` sert le chat, pas la documentation (D1226).

Les connecteurs sortants qui emportent des données personnelles se
nomment à la conformité, non à la fonctionnelle.

### La réglementation

`rgpd: { countries: [ … ] }` donne les pays du stockage pour le storage,
de la destination pour les sortants (D1345) ; le registre des
traitements en tire le lieu et les transferts hors Union (D1328). Les
connecteurs sortants, `smtp`, `webhook`, `llm`, sont les destinataires
externes des traitements qui leur passent un champ marqué (D1317), le
rapport de la reprise par mail compris, même anonymisé (D1344). Au
chapitre de la sécurité : les secrets `*` par leur nom, jamais leur
valeur (D944), `unencrypted:` signalé (D705), les origines autorisées
(D918).

### Le projet et le support

Le storage héberge les tables du module `_assistance`, les tickets et
leurs messages, comme celles de `_migration` (D1363, D1368). La page des
versions dit l'environnement qu'implique le statut, rien des
connecteurs (D1347, D1251).

### La documentation du développeur

- Le `webhook` entrant : une section par point d'entrée, la route
  versionnée, le mode, les paramètres, l'authentification, l'opération
  déclenchée, la réponse, les codes (D1415–D1419).
- Le `webhook` sortant : ce qui sort par lui, le contrat du message, le
  mécanisme d'authentification par son nom, la clé d'émission, l'état et
  la trace (D1420–D1423).
- Le storage : les formats de l'import et de l'export, le CSV pivot, le
  classeur (D1412).
- À l'inventaire, un connecteur personnalisé par sa fiche, ses
  paramètres sans secrets, ses `countries:` (D1406).

### Le D.A.T.

Le cœur de la documentation. Le schéma des connexions, par
environnement : un nœud par connecteur déclaré (D342, D616), groupé par
famille, le protocole et le port que sa classe implique, les paramètres
sans les secrets (D944), les `countries:` (D1345), les données
personnelles signalées sur le flux. Le connecteur d'une reprise est
dessiné à part, avec son rythme et son état à l'instance (D1433). Puis
les variables que ses paramètres référencent (D1428), les comptes chez
les tiers que sa classe attend, complétés à l'écrit, ses classes et
leurs pilotes aux dépendances (D1430). Le storage renvoie au chapitre du
stockage du dictionnaire.

### Le guide d'exploitation

Le cœur du guide. Par environnement, les connecteurs sans leurs
secrets ; le `ping()` et le feu tricolore (D621, D731) ; la page de
maintenance et le mock (D626, D627) ; la description de chaque variable
depuis la classe du connecteur (D1442). Les fiches : la copie d'un
environnement, la synchronisation par `replication:` (D724), les secrets
et leur rotation, les journaux connectés au puits, la supervision
externe branchée sur l'API de la santé (D1454). Le connecteur de
reprise et ses passages (D1077, D1079).

### La maintenance, les risques et les améliorations

Les usages : les appels de l'API par entrée et par compte technique
(D40). Les risques : le connecteur muet et sa page de maintenance, les
anomalies et les rejets de la reprise par connecteur et leur tendance,
le retard du passif (D731), la dernière sauvegarde et sa vérification,
ou « non disponible » (D1476, D1490). Les améliorations : les conseils
au consommateur de l'API, le cache et la lecture par lot (D45).

### La promotionnelle

La démonstration est une sandbox dont tous les connecteurs sont mockés
et dont le storage est un sqlite ou un `memory` (D1503, D1508), avec
`dataset:` pour son jeu de données (D1504). Dans la démonstration de
Syncytium, le seul connecteur réel est le `llm` qui écrit la
configuration (D1510) ; le storage `memory` se supprime à la fin
(D1506). Les familles de connecteurs sont un argument de l'ouverture
(D1509).

### L'information

Le chapitre du stockage du dictionnaire de la donnée (D1260) : « le
connecteur storage matérialise le stockage des types dans la base de
données ». Le chapitre représente les données telles qu'elles sont
stockées, pour tout outil de BI qui lit la base sans passer par
Syncytium ; c'est la facette stockage de chaque type (D683), assemblée
par le storage, ci-dessous.

## Le `describe(model)` du storage

`describe(model)` rend « la description du modèle de données couvert
par le modèle défini en paramètre, tel que les données doivent être
stockées » (D1292, D1299, D1300). La classe applique ses règles de
transcription au modèle qu'on lui donne (D1296, D1298) et rend ce
qu'elles produisent, dans son propre vocabulaire, par exception à D680,
parce que la BI lit la base sans Syncytium. C'est une fonction pure de
la configuration (D645), calculée au dépôt, la même que `create_entity`
exécute. Servie par une instance, `get_instance()` lit la base et
vérifie qu'elle correspond au modèle (D801). Cette facette reste à ce
chapitre ; le chapitre 11 y renvoie (D1722).

Par entité :

- sa table, la colonne du soft delete, les colonnes d'audit ; les
  colonnes du socle sont à étudier, « les colonnes supplémentaires sont
  liées à un type d'implémentation, mais nous pourrions adopter une
  autre approche » (D1305) ;
- la déclinaison de chaque type de composant en stockage, l'héritage
  compris, une table par dérivé ou une seule avec une colonne de type, à
  préciser à l'implémentation (D1309) ;
- l'identité technique en clé primaire (D142), l'identité fonctionnelle
  en clé unique sur les actifs (D141) ;
- la référence en clé étrangère ; la composition en table de l'enfant ;
  la structure interne en table nommée par l'entité (D1274) ; la liste
  de valeurs simples en table de liaison ou en colonne structurée ;
  l'association dérivée, rien ; l'entité historisée et sa table
  d'instantanés (D169).

Par champ de valeur : la déclinaison en élémentaires (D1298), puis sa
ou ses colonnes, le type natif, la nullité, la règle de conversion. Les
noms physiques suivent la règle du storage. Les colonnes protégées sont
marquées de leur niveau de confidentialité (D1247).

Les index, chacun avec son origine dans le modèle, « liés aux critères
de recherche et de sélection définis dans le modèle » (D1292) :
`searchable: strict | normalized | similarity | range` (D367, D371),
`mutualizable[nom]` (D780), les `searchable:` et `sort:` des listes, les
`filter:` des périmètres (D90), le champ de statut. Le storage décide la
forme physique de chaque index.

Les partitions (D1293, D1300) : déclarées à l'entité,
`partition: date_comptable[year]`, `partition: [site, statut]`, le ou
les champs dont les valeurs découpent la table, par période pour une
date. Sans déclaration, pas de partition ; le froid de l'historisation
(D169) se partitionne par période par défaut. Le storage décide la
forme ; le `describe()` la rend avec son origine.

Puis les tables de Syncytium, signalées : la version (D680), `user`
(D719), le journal et la table des associations de la reprise (D1037),
les compteurs de télémétrie (D39). Au dépôt, chaque famille de storage
déclarée rend sa forme sans connexion ; servie par une instance, celle
de son storage (D1300).
