# Ce que le connecteur livre à la documentation

*La facette documentation du connecteur, colonne par colonne, et le
`describe(model)` du storage, le chapitre du stockage du dictionnaire.*

## Le sommaire

- [La facette du connecteur (D1158–D1159)](#la-facette-du-connecteur-d1158d1159)
- [Le `describe(model)` du storage (D1292, D1299, D1300, D1722)](#le-describemodel-du-storage-d1292-d1299-d1300-d1722)

## La facette du connecteur (D1158–D1159)

*(La rubrique de la matrice de [documentation.md](../../documentation.md)
§13 ; la colonne 1 — la fonctionnelle — remplie, les autres à leur
rang.)*

**Le connecteur, dans la fonctionnelle** : presque rien — il appartient
à l'environnement, non à ce que l'utilisateur fait. Ce qui passe tout
de même : **l'authentification** `none` fait écrire « un seul
utilisateur, tous les droits » (D1176) ; **le mail** (`smtp`) conditionne
la phrase du socle sur les notifications par mail (D1228) — un `smtp`
en `none` la retire ; **le `llm`** sert le chat, pas la documentation
(D1226). Les connecteurs sortants qui emportent des données personnelles
se nomment à la conformité (§18), non à la fonctionnelle.

**Les connecteurs, dans la réglementation** (la colonne 5 — le rang 3) :
**`rgpd: { countries: [ … ] }`** — les pays du stockage pour le storage,
de la destination pour les sortants, une liste (D1345) ; le registre en tire le lieu et les
transferts hors Union (D1328) ; **les connecteurs sortants** — `smtp`,
`webhook`, `llm` — sont les destinataires externes des traitements qui
leur passent un champ marqué (D1317), le rapport de la reprise par mail
compris, même anonymisé (D1344) ; **au chapitre de la sécurité**, les
secrets `*` par leur nom, jamais leur valeur (D944), `unencrypted:`
signalé (D705), les origines autorisées (D918).

**Les connecteurs, dans le projet et le support** (la colonne 8 — le
rang 4) : **le storage héberge les tables du module `_assistance`** —
les tickets et leurs messages — comme celles de `_migration` (D1363,
D1368) ; la page des versions dit l'environnement qu'implique le
statut, rien des connecteurs (D1347, D1251).

**Les connecteurs, dans la documentation du développeur** (la colonne 3
— le rang 5) : **le `webhook` entrant** — une section par point
d'entrée, la route versionnée, le mode, les paramètres,
l'authentification, l'opération déclenchée, la réponse, les codes
(D1415–D1419) ; **le `webhook` sortant** — ce qui sort par lui, le
contrat du message, le mécanisme d'authentification par son nom, la clé
d'émission, l'état et la trace (D1420–D1423) ; **le storage**, les
formats de l'import et de l'export, le CSV pivot, le classeur (D1412) ;
à l'inventaire, un connecteur personnalisé par sa fiche, ses
paramètres sans secrets, ses `countries:` (D1406).

**Les connecteurs, dans le D.A.T.** (la colonne 4 — le rang 6), le
cœur de la documentation : **le schéma des connexions**, par
environnement — un nœud par connecteur déclaré (D342, D616), groupé par
famille, le protocole et le port que sa classe implique, les paramètres
sans les secrets (D944), les `countries:` (D1345), les données
personnelles signalées sur le flux (§18) ; **le connecteur d'une
reprise** dessiné à part, son rythme, son état à l'instance (D1433) ;
**les variables** que ses paramètres référencent (D1428) ; **les comptes
chez les tiers** que sa classe attend, complétés à l'écrit ; **ses
classes et leurs pilotes** aux dépendances (D1430) ; le storage renvoie
au chapitre 3 du dictionnaire.

**Les connecteurs, dans le guide d'exploitation** (la colonne 9 — le
rang 7), le cœur du guide : par environnement, les connecteurs sans
leurs secrets ; **le `ping()` et le feu tricolore** (D621, D731), la
page de maintenance et le mock (D626–D627) ; **la description de chaque
variable** depuis la classe du connecteur (D1442) ; **les fiches** — la
copie d'un environnement, la synchronisation par `replication:` (D724),
les secrets et la rotation, connecter les journaux au puits, brancher
la supervision externe sur l'API de la santé (D1454) ; le connecteur de
reprise et ses passages (D1077, D1079).

**Les connecteurs, dans la maintenance, les risques et les améliorations**
(la colonne 7 — le rang 8) : **les usages** — les appels de l'API par
entrée et par compte technique (D40) ; **les risques** — le connecteur
muet et sa page de maintenance, les anomalies et les rejets de la
reprise par connecteur et leur tendance, le retard du passif (D731), la
dernière sauvegarde et sa vérification, ou « non disponible » (D1476,
D1490) ; **les améliorations** — les conseils au consommateur de l'API,
le cache et la lecture par lot (D45).

**Les connecteurs, dans la promotionnelle** (la colonne 6 — le rang 9) :
**la démonstration** — une sandbox dont tous les connecteurs sont
mockés et dont le storage est un sqlite ou un `memory` (D1503,
D1507–D1508), `dataset:` pour son jeu de données (D1504) ; **la
démonstration de Syncytium** — le seul connecteur réel est le `llm` qui
écrit la configuration (D1510), le storage `memory` se supprime à la
fin (D1506) ; dans la promotionnelle de Syncytium, les familles de
connecteurs sont un argument de l'ouverture (D1509).

**Les autres colonnes** — à leur rang :
l'information — **le chapitre du stockage du dictionnaire de la donnée**
(D1260) : « le connecteur storage matérialise le stockage des types dans
la base de données » ; le chapitre représente les données telles
qu'elles sont stockées, pour tout outil de BI qui se connecte à la base
sans passer par Syncytium — la facette stockage de chaque type (D683),
assemblée par le storage.

## Le `describe(model)` du storage (D1292, D1299, D1300, D1722)

Le contenu du `describe(model)` du storage — la facette documentation du
storage, gardée à ce chapitre, le chapitre 11 y renvoie — (D1292, D1299,
D1300 : « description du modèle de données couvert par le modèle
défini en paramètre - tel que les données doivent être stockées ») : la
classe applique ses règles de transcription (D1296, D1298) au modèle
qu'on lui donne et rend ce qu'elles produisent, dans son propre vocabulaire — par exception à D680,
parce que la BI lit la base sans Syncytium : **une fonction pure de la
configuration** (D645), calculée au dépôt, la même que `create_entity`
exécute ; servi par une instance, `get_instance()` lit la base et permet
de vérifier qu'elle correspond au modèle (D801). Par entité : sa table, la colonne du soft
delete, les colonnes d'audit — **les colonnes du socle sont à étudier**
(D1305 : leur implémentation n'est pas faite, « les colonnes
supplémentaires sont liées à un type d'implémentation. Mais, nous
pourrions adopter une autre approche ») ; **la classe décline chaque
type de composant en stockage — l'héritage compris, une table par
dérivé ou une seule avec une colonne de type, à préciser à
l'implémentation** (D1309) ; par champ de valeur : sa ou ses colonnes,
le type natif, la nullité, la règle de conversion ; l'identité technique
(D142) en clé primaire, l'identité fonctionnelle en clé unique sur les
actifs (D141) ; la référence en clé étrangère ; la composition en table
de l'enfant ; la structure interne en table nommée par l'entité
(D1274) ; la liste de valeurs simples en table de liaison ou colonne
structurée ; l'association dérivée, rien ; l'entité historisée et sa
table d'instantanés (D169). **Les index, chacun avec son origine dans
le modèle** (D1292 : « liés aux critères de recherche et de sélection
définis dans le modèle ») — `searchable: strict | normalized |
similarity | range` (D367/D371), `mutualizable[nom]` (D780), les
`searchable:` et `sort:` des listes, les `filter:` des périmètres (D90),
le champ-statut ; le storage décide la forme physique de chaque index.
**Les partitions** (D1293, acquises D1300) : déclarées à
l'entité (`partition: date_comptable[year]`, `partition: [site,
statut]`), le ou les champs dont les valeurs découpent la table, par
période pour une date ; sans déclaration, pas de partition ; le froid de
l'historisation (D169) par période par défaut ; le storage décide la
forme, le `describe()` la rend avec son origine. Puis les tables de
Syncytium, signalées : la version (D680), `user`
(D719), le journal et la table des associations de la reprise (D1037),
les compteurs de télémétrie (D39). Par champ, la déclinaison en
élémentaires (D1298) puis la ou les colonnes ; les noms physiques
suivent la règle du storage ; les colonnes protégées sont marquées de
leur niveau de confidentialité (D1247) ; au dépôt, chaque famille de
storage déclarée rend sa forme sans connexion ; servi par une instance,
celle de son storage (D1300).
