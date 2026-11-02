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
- [Les storages de format et `memory`](#les-storages-de-format-et-memory)

## Les quatre énoncés

> **Le storage** est le lien entre les données que Syncytium manipule,
> leur manipulation, son optimisation et le stockage physique. C'est une
> famille de connecteurs ; le storage du modèle porte l'instance
> ([glossaire](../../glossaire.md)).

Quatre énoncés de l'auteur fondent la famille (D1294–D1297).

1. **La définition.** « Le storage est le lien entre les données
   manipulées par Syncytium, la manipulation, son optimisation et le
   stockage physique. »
2. **Les objectifs.** « Il intègre tant les données de façon unitaire
   que les données à traiter/lire en masse. Le traitement doit être
   bijectif, standardisé et harmonisé, tout en offrant la capacité à
   être extensible. » Bijectif : ce qui s'écrit se relit à l'identique
   (D683). Standardisé et harmonisé : le même contrat pour tout storage,
   le même rendu pour tout type. Extensible par le format pivot (D1298).
3. **L'auto-description.** « Cela porte les règles de transcription
   entre les types de données manipulées par Syncytium et le stockage
   physique. » Le `describe()` en est le rendu. La règle de transcription
   sert trois fois : créer, `create_entity` ; reconnaître,
   `get_instance()` ; décrire, `describe(model)` (D1300).
4. **Les interfaces, les pivots.** « Le storage influe le hook des types
   pour définir les propriétés ou les éléments à couvrir. Au storage de
   faire le nécessaire pour exploiter au mieux ces données. » Le pivot
   est à l'initiative du storage : il dit ce qu'il attend d'un type, la
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
  « la description d'un modèle à l'image du méta-modèle à partir du
  stockage » (D1299), dont le retour est l'équivalent d'un module, les
  entités et leurs champs, la mutualisation de plusieurs colonnes en un
  champ, les contraintes, les dépendances (D684), borné aux items de
  stockage, jamais les surfaces ni les calculés (D685), et pour un
  storage source les entités de la carte `entities:` (D829) ;
  `duplicate_instance`, la structure et les données (D674) ;
  `rename_instance`, la bascule et la restauration (D678) ;
  `delete_instance`.
- **Les entités** : `create_entity`, `update_entity`, `delete_entity`.
- **Les enregistrements** : `create`, `read`, `update`, `delete`.
  L'écriture se fait en lots : chaque méthode porte une liste, le bulk
  natif de la classe (D688). La lecture se fait au curseur : `read` rend
  un curseur qui convertit chaque ligne au fil du parcours, la masse au
  suivi de progression (D689).

La version n'a pas de méthode (D680) : c'est une entité système du
storage, définie et maintenue par Syncytium, lue et écrite par `read`
et `update`.

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

La migration à chaud enchaîne les méthodes du contrat (D631, D674) :
`duplicate_instance` ; les transformations dérivées des différences, le
mapping automatique, le concepteur n'écrit rien (D632) ; la bascule par
`rename_instance` sur validation ; `delete_instance`, ou la grâce (D675,
D678). Le mapping manuel reste l'affaire des migrations déclarées, au
chapitre 8, [mapping.md](../../mapping.md). Syncytium sait convertir ou
transférer d'un connecteur à l'autre, en instantané ou en différentiel ;
le différentiel rejoint la réplication passive du PCA-PRA (D606, D112,
D114).

Syncytium orchestre (D686, D687). La bascule et les files d'attente, les
écritures pendant la phase, les lectures pendant le renommage (D674,
D679), sont composées par le moteur sur les primitives du contrat :
« l'accès aux données est géré et piloté par Syncytium et non le storage
directement ». L'enregistrement est un type structuré propre à
Syncytium, multi-storage ; le storage le convertit, jamais ne le
définit (D683).

## Les storages de format et `memory`

« Les storages csv, xml sont définis pour les exports et exploitables
pour les imports » (D636). Les formats structurés, csv, xlsx, xml, json,
sont des classes de la famille, au contrat borné à ce que le format sait
faire. L'export écrit vers un storage de format (D445, D530) ; l'import
en lit (D234–D238). Un storage de format porte la carte des entités vers
les fichiers, `entities:` (D828, D845), montrée dans
[la déclaration](02-declaration.md).

`memory` tient le modèle en mémoire (D1045) : la base miroir d'une
reprise, `buffer:`, et le stockage de l'application en mémoire seule,
sans place sur le disque, effacé à l'arrêt, pour la démonstration de
Syncytium et le mode démo d'une application (D1508). Son ratio d'espace,
la part de la mémoire de l'hôte qu'il peut occuper, reste à préciser à
l'implémentation.
