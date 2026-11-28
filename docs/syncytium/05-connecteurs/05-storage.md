# Le storage

Le storage est la famille la plus riche : il porte le modèle et ses
données, il lit les bases étrangères d'une reprise, il écrit les
exports. Ce fichier développe son contrat, résumé dans
[les neuf familles](04-familles.md).

## Le sommaire

- [Les quatre énoncés](#les-quatre-énoncés)
- [Le contrat](#le-contrat)
- [La facette des types](#la-facette-des-types)
- [La conversion au type](#la-conversion-au-type)
- [La migration à chaud et l'orchestration](#la-migration-à-chaud-et-lorchestration)
- [Le nom stable](#le-nom-stable)
- [Les storages de format et `memory`](#les-storages-de-format-et-memory)

## Les quatre énoncés

> **Le storage** est le lien entre les données que Syncytium manipule,
> leur manipulation, son optimisation et le stockage physique. C'est une
> famille de connecteurs ; le storage du modèle porte l'instance
> ([glossaire](../../glossaire.md)).

Quatre énoncés fondent la famille (D1294–D1297) : ce que le storage
est, ce qu'il vise, ce qu'il décrit de lui-même, et ce qu'il attend des
types.

1. **La définition.** Le storage est le lien entre les données que
   Syncytium manipule, leur manipulation, son optimisation et le
   stockage physique.
2. **Les objectifs.** Il intègre aussi bien les données prises une à
   une que les données à traiter ou à lire en masse. Son traitement est
   bijectif, standardisé et harmonisé, et il reste extensible.
   Bijectif : ce qui s'écrit se relit à l'identique
   (D683). Standardisé et harmonisé : le même contrat pour tout storage,
   le même rendu pour tout type. Extensible par le format pivot (D1298).
3. **L'auto-description.** Le storage porte les règles de transcription
   entre les types de données que Syncytium manipule et le stockage
   physique. Le `describe()` en est le rendu. La règle de transcription
   sert trois fois : créer, `create_entity` ; reconnaître,
   `get_instance()` ; décrire, `describe(model)` (D1300).
4. **Les interfaces, les pivots.** Le storage influe sur le hook des
   types : il dit les propriétés ou les éléments à couvrir. À lui,
   ensuite, de faire le nécessaire pour exploiter au mieux ces données.
   Le pivot est à l'initiative du storage : il dit ce qu'il attend d'un type, la
   forme native, les gestes, l'identification, les index qu'il sait
   porter, la partition ; le type le fournit ; le storage en tire le
   meilleur parti. Un type qui ne couvre pas un élément attendu est
   refusé à l'ingestion, jamais dégradé (D1690) ; le contrat du hook de
   type est dans [les hooks du modèle](../02-modele/08-hooks.md).

Le format pivot fait l'extensibilité (D1298) : un type se décline en un
type élémentaire, booléen, entier, long, décimal, texte, ou en une liste
nommée d'élémentaires. Le nom est un texte de quarante caractères au
plus ; la quantité devient `{ valeur: decimal, unite: enum }` ;
l'énuméré se stocke en entier, l'indice, ou en texte, le code. Un
storage ne connaît que les élémentaires : un type nouveau n'oblige
aucun storage, un storage nouveau n'oblige aucun type (D1300).

## Le contrat

Le contrat parle le langage du méta-modèle, l'instance, l'entité, le
champ, jamais le vocabulaire du moteur, le schéma de SQL Server ou la
base de MySQL (D680). La mission de la classe est la conversion vers le
stockage. Ses méthodes se groupent en quatre (D629, D680–D689).

- **La transaction** : `begin`, `commit`, `rollback`, l'assise de la
  transaction tenue ouverte (D594).
- **L'instance** : `create_instance` ; `get_instance()`, l'introspection,
  qui décrit à partir du stockage un modèle à l'image du méta-modèle
  (D1299), et dont le retour est l'équivalent d'un module, les
  entités et leurs champs, la mutualisation de plusieurs colonnes en un
  champ, les contraintes, les dépendances (D684), borné aux items de
  stockage, jamais les surfaces ni les calculés (D685), et pour un
  storage source les entités de la carte `entities:` (D829) ;
  `duplicate_instance`, la structure et les données (D674) ;
  `delete_instance`. La bascule n'a pas de méthode : une version est un
  couple de pointeurs, que Syncytium tient (D2138).
- **Les entités** : `create_entity`, `update_entity`, `delete_entity`.
- **Les enregistrements** : `create`, `read`, `update`, `delete`.
  L'écriture se fait en lots : chaque méthode porte une liste, le bulk
  natif de la classe (D688). La lecture se fait au curseur : `read` rend
  un curseur qui convertit chaque ligne au fil du parcours, la masse au
  suivi de progression (D689). La taille du lot se paramètre, par
  entité (D2159, D2160) : voir
  [la taille du lot](../09-moteur/README.md#la-taille-du-lot).

La version n'a pas de méthode (D680) : c'est une entité système du
storage, définie et maintenue par Syncytium, lue et écrite par `read`
et `update`.

Toutes les classes de storage respectent ce contrat, celles qui sont
livrées comme celles qui viendront (D2136). C'est ce qui permet de
changer de connecteur, d'un type de base à un autre, sans impact sur le
fonctionnement de l'application : voir
[le changement de connecteur](../09-moteur/03-migration.md#le-changement-de-connecteur).

## La facette des types

Le connecteur porte la facette des types (D876). La description d'un
modèle lu dans un storage étranger référence des types dont le
connecteur porte la facette. Le `counter` surchargé et le champ `file`
lu par son connecteur en relèvent (D883).

## La conversion au type

Le contrat d'un type inclut ses règles de conversion vers chaque
storage, sur le patron du visiteur (D681, D682) : la classe visite le
type, le type se décrit, la classe rend la forme native, `amount` en
DECIMAL ici, en deux colonnes là. Le contrat couvre :

- **les trois gestes du champ**, la création, la modification, avec
  l'altération et le transcodage, la suppression ;
- **les fonctions de valeur**, `create`, `update`, `read` d'une valeur
  (D683) ;
- **l'identification** : le type se reconnaît à l'introspection (D684).

Les méthodes d'entité se composent des gestes des types, les méthodes
d'enregistrement des fonctions de valeur : la symétrie de la structure
et de la donnée. `get_instance` compose les reconnaissances des types.
Un storage nouveau visite tous les types sans qu'aucun ne change.

## La migration à chaud et l'orchestration

La migration à chaud enchaîne les méthodes du contrat (D631, D1974) :
`create_instance`, une nouvelle instance à côté de l'existante ; le plan de
reprise, dont les correspondances se dérivent des différences, le
mapping automatique, le concepteur n'écrit rien (D632) ; la bascule sur
validation, un changement de référence que Syncytium tient (D2136) ;
`delete_instance`, au terme de la rétention de la version antérieure.
Le mécanisme est au chapitre 9,
[la migration de version](../09-moteur/03-migration.md). Le mapping
manuel reste l'affaire des migrations déclarées, au chapitre 8, [la migration déclarée](../08-migration/02-declaration.md). Syncytium sait convertir ou
transférer d'un connecteur à l'autre, en instantané ou en différentiel ;
le différentiel rejoint la réplication passive du PCA-PRA (D606, D112,
D114).

Syncytium orchestre (D686, D687). La bascule et les files d'attente, les
écritures pendant la phase, les lectures pendant la bascule (D674,
D679), sont composées par le moteur sur les primitives du contrat :
l'accès aux données est géré et piloté par Syncytium, non par le storage
directement. L'enregistrement est un type structuré propre à
Syncytium, multi-storage ; le storage le convertit, jamais ne le
définit (D683).

## Le nom stable

> **Le nom stable** est le nom, constant d'une version à l'autre, sous
> lequel un storage publie l'instance en service, pour les lecteurs qui
> ne passent pas par Syncytium ([glossaire](../../glossaire.md)).

Une application tierce ou un outil de BI peut lire la base sans passer
par Syncytium (D1260). Or chaque version a son instance, et la bascule
change celle que Syncytium désigne. Le nom stable épargne ce changement
au lecteur (D2139) :

- **c'est une option du connecteur** : elle se déclare au connecteur
  storage, par `alias:` (D2140). Sans elle, aucun nom stable n'est
  publié ;
- **c'est une facette de la description du modèle** : les synonymes et
  les vues du nom stable se déduisent de la description, comme la forme
  de stockage. Personne ne les écrit dans la base ;
- **il suit le pointeur** : à la bascule comme à la restauration, il
  désigne l'instance en service.

`alias:` s'écrit au niveau du connecteur, à côté de `class:`, et porte
le nom stable. Aucun cas ne l'écrit ; en illustration, sur le connecteur
de l'entrepôt :

```yaml
# L'entrepôt
# La base de l'application : un schéma PostgreSQL.
entrepot:
  type: storage
  class: postgresql

  # Le nom stable
  # Le nom sous lequel l'instance en service se lit de l'extérieur ; sans cette clé, aucun nom stable n'est publié.
  alias: entrepot_bi
```

Toutes les classes ne savent pas publier un nom stable : une base
tenue en mémoire, par exemple. Écrire `alias:` sur un tel connecteur est
une erreur d'ingestion, qui nomme le connecteur et sa classe (D2171).

Le mot `alias:` couvre ici le même concept que dans une source de
migration (D2141). Syncytium crée un modèle de base de données, et lui
associe un alias pour qu'un tiers garde toujours le même lien. Sur une
entité source, l'alias est de même un nom exploitable, donné à la suite
d'un filtre appliqué sur l'élément principal : voir
[l'alias](../08-migration/03-sources.md#lalias).

Le mécanisme est au chapitre 9,
[les lecteurs externes de la base](../09-moteur/03-migration.md#les-lecteurs-externes-de-la-base).

## Les storages de format et `memory`

Un storage n'est pas toujours une base de données. Les storages de
format, comme csv ou xml, sont définis pour les exports, et servent
aussi aux imports (D636). Ces formats structurés, csv, xlsx, xml, json,
sont des classes de la famille, au contrat borné à ce que le format sait
faire. L'export écrit vers un storage de format (D445, D530) ; l'import
en lit (D234–D238). Un storage de format porte la carte des entités vers
les fichiers, `entities:` (D828, D845), montrée dans
[la déclaration](02-declaration.md).

`memory` tient le modèle en mémoire (D1045) : la base miroir d'une
reprise, `mirror:`, et le stockage de l'application en mémoire seule,
sans place sur le disque, effacé à l'arrêt, pour la démonstration de
Syncytium et le mode démo d'une application (D1508). Son ratio d'espace,
la part de la mémoire de l'hôte qu'il peut occuper, reste à préciser à
l'implémentation.
