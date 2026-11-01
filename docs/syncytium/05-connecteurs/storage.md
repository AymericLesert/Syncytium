# Le storage

*La famille `storage`, développée : les quatre énoncés, le contrat, la
conversion au type, la migration à chaud, les storages de format.*

## Le sommaire

- [Les quatre énoncés (D1294–D1297)](#les-quatre-énoncés-d1294d1297)
- [Le contrat (D629, D680–D689)](#le-contrat-d629-d680d689)
- [La facette des types (D876)](#la-facette-des-types-d876)
- [La conversion au type (D681–D684)](#la-conversion-au-type-d681d684)
- [La migration à chaud et l'orchestration (D631, D674, D686–D687)](#la-migration-à-chaud-et-lorchestration-d631-d674-d686d687)
- [Les storages de format (D636)](#les-storages-de-format-d636)

## Les quatre énoncés (D1294–D1297)

Les quatre énoncés de l'auteur :

1. **La définition** — « le storage est le lien entre les données
   manipulées par Syncytium, la manipulation, son optimisation et le
   stockage physique. »
2. **Les objectifs** — « Il intègre tant les données de façon unitaire
   que les données à traiter/lire en masse. Le traitement doit être
   bijectif, standardisé et harmonisé, tout en offrant la capacité à
   être extensible ... » — bijectif : ce qui s'écrit se relit à
   l'identique (la symétrie structure/donnée, D683) ; standardisé et
   harmonisé : le même contrat pour tout storage, le même rendu pour
   tout type ; **extensible par le format pivot** (D1298) : « l'usage
   d'un format pivot doit offrir l'extensibilité du modèle. Le pivot
   couvre les types et le stockage des composants élémentaires
   (booléen, entier, long, decimal, text, ...). Un type Syncytium doit
   pouvoir se décliner en type élémentaire directement accessible via
   les types élémentaires ou en liste nommée de types élémentaires. Le
   storage gère alors ces 2 cas et assure la conversion entre le type
   élémentaire et le type de stockage. Pour un type élémentaire, le
   type Syncytium fournit les propriétés génériques (pour text : min et
   max longueur, ....) » — le nom : un texte de 40 caractères au plus ;
   la quantité : `{ valeur: decimal, unite: enum }`, l'énuméré stocké en
   entier (l'indice) ou en texte (le code ISO). Un storage ne connaît
   que les élémentaires : un type nouveau n'oblige aucun storage, un
   storage nouveau n'oblige aucun type (D1300).
3. **L'auto-description** — « Cela porte les règles de transcription
   entre les types de données manipulées par Syncytium et le stockage
   physique dans une base de données ou une zone de stockage
   physique. » — le `describe()` en est le rendu ; la règle de
   transcription sert trois fois : créer (`create_entity`),
   reconnaître (`get_instance()`), décrire (`describe(model)`) (D1300).
4. **Les interfaces, les pivots** — « Le storage influe le hook des
   types pour définir les propriétés ou les éléments à couvrir. Au
   storage de faire le nécessaire pour exploiter au mieux ces
   données. » — le pivot est à l'initiative du storage : il dit ce
   qu'il attend d'un type (la forme native, les gestes, l'identification,
   les index qu'il sait porter, la partition), le type le fournit, le
   storage en tire le meilleur parti ; un type qui ne couvre pas un
   élément attendu est refusé à l'ingestion, jamais dégradé *(D1690 ;
   le contrat du hook de type,
   [les hooks du modèle](../02-modele/hooks.md))*.

## Le contrat (D629, D680–D689)

Le contrat parle le langage du méta-modèle (D680) — l'instance,
l'entité, le champ ; jamais le vocabulaire du moteur (le schema
SQLServer, la database MySQL) : **la mission de la classe est la
conversion vers le stockage**.

| le groupe | les méthodes |
|---|---|
| la transaction | `begin` · `commit` · `rollback` — l'assise de la transaction tenue ouverte (D594) |
| l'instance | `create_instance` · **`get_instance()`** (D1299 — « description d'un modèle à l'image du méta-modèle à partir du stockage » ; l'introspection — le retour est **l'équivalent d'un module** : les entités et leurs champs, la mutualisation N colonnes → 1 champ, les contraintes, les dépendances — D684 ; **borné aux items de stockage** : jamais les surfaces ni les champs calculés — D685 ; pour un storage source, les items = **les entités de la carte `entities:`** — le fichier n'est jamais un item, D829) · **`duplicate_instance`** (structure + données — D674) · **`rename_instance`** (la bascule, la restauration — D678) · `delete_instance` |
| les entités | `create_entity` · `update_entity` · `delete_entity` |
| les enregistrements | `create` · `read` · `update` · `delete` — **l'écriture en lots** (D688 : create/update/delete portent une liste — le bulk natif de la classe), **la lecture au curseur** (D689 : read() rend un curseur qui convertit chaque ligne en enregistrement au fil du parcours — le lazy loading, la masse au suivi de progression) |

**La version n'a pas de méthode** (D680) : une **entité système** du
storage — définie, construite et maintenue par Syncytium, la version
en paramètre système — lue et écrite par le `read`/`update`
standard.

## La facette des types (D876)

Le connecteur porte la facette des types : la description
d'un modèle lu dans un storage étranger référence des types dont le
connecteur porte la facette ; le `counter` surchargé et le champ `file`
lu par son connecteur en relèvent (D883).

## La conversion au type (D681–D684)

La conversion au type (le patron visiteur) : le
contrat d'un type inclut ses règles de conversion vers un storage —
la classe visite le type, le type se décrit, la classe rend la forme
native (`amount` en DECIMAL ici, en deux colonnes là) ; le contrat
couvre **les trois gestes du champ** (la création, la modification —
l'altération + le transcodage —, la suppression) **et les fonctions
de valeur** (D683 — `create`/`update`/`read` d'une valeur) ; les
méthodes d'entité **se composent des gestes des types**, les
méthodes d'enregistrement **des fonctions de valeur** — la symétrie
structure/donnée ; et **le type s'identifie à l'introspection**
(D684 — la réciproque : get_instance compose les reconnaissances
des types) ; un storage nouveau visite tous les types sans qu'aucun
ne change.

## La migration à chaud et l'orchestration (D631, D674, D686–D687)

La migration à chaud (D631/D674) : `duplicate_instance` → les
transformations dérivées des différences (D632 — le mapping
automatique, le concepteur n'écrit rien) → la bascule par
`rename_instance` sur validation → `delete_instance` (ou la grâce —
D675/D678). Le mapping manuel demeure l'affaire des migrations
déclarées (voir [mapping.md](../../mapping.md)).

**L'orchestration par Syncytium** (D686–D687) : la bascule et **les
files d'attente** (les écritures pendant la phase, les lectures
pendant le renommage — D674/D679) sont composées **par le moteur**
sur les primitives du contrat — « l'accès aux données est géré et
piloté par Syncytium et non le storage directement » ; et
**l'enregistrement est un type structuré propre à Syncytium,
multi-storage** — le storage se charge de sa conversion en stockage
(les fonctions de valeur D683) : il convertit, jamais ne définit.

## Les storages de format (D636)

Les storages de format : « les storages "csv", "xml"… sont
définis pour les exports et exploitables pour les imports » — les
formats structurés sont **des classes de cette famille** (le contrat
borné à ce que le format sait faire) : l'export (D445/D530) écrit
vers un storage de format, l'import (D234–D238) en lit.
