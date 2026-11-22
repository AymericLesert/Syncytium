# Ce que la migration livre à la documentation

> **La facette documentation** est ce qu'un composant livre à chaque
> documentation générée : chaque type de composant décline dans chaque
> type de document, Syncytium assemble ([glossaire](../../glossaire.md)).

Ce que le concepteur déclare pour une migration ne sert pas qu'au
moteur : Syncytium en tire aussi la documentation. Ce fichier montre ce
que la migration déclarée donne à chacune des neuf documentations
(D1158, D1159) : la reprise d'abord, la migration de
version ensuite. La facette du module `_migration` suit le module, au
chapitre 10 (D2010). Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [La facette de la reprise](#la-facette-de-la-reprise)
  - [Les neuf documentations](#les-neuf-documentations)
  - [La fonctionnelle](#la-fonctionnelle)
  - [Le dictionnaire de la donnée](#le-dictionnaire-de-la-donnée)
  - [La réglementation](#la-réglementation)
  - [Le projet et le support](#le-projet-et-le-support)
  - [La documentation du développeur](#la-documentation-du-développeur)
  - [Le D.A.T.](#le-dat)
  - [Le guide d'exploitation](#le-guide-dexploitation)
  - [La maintenance, les risques et les améliorations](#la-maintenance-les-risques-et-les-améliorations)
  - [La promotionnelle](#la-promotionnelle)
- [La migration de version, dans les documentations](#la-migration-de-version-dans-les-documentations)

## La facette de la reprise

### Les neuf documentations

C'est la rubrique de la migration dans la matrice de
[documentation.md](../../documentation.md), § 13. Ses neuf colonnes sont
écrites. Elles se lisent ici dans l'ordre de leur rang :

| Le rang | La documentation | La colonne | Ce que la reprise y donne |
|---|---|---|---|
| 1 | la fonctionnelle | 1 | les règles qui alimentent un champ, les opérations que la reprise déclenche, les champs `unmapped:` |
| 2 | le dictionnaire de la donnée | 2 | le chapitre 4.1, « Reprise des données » |
| 3 | la réglementation | 5 | les traitements, la provenance, la rétention |
| 4 | le projet et le support | 8 | rien en propre ; les notes de version |
| 5 | la documentation du développeur | 3 | rien de propre |
| 6 | le D.A.T. | 4 | le connecteur de reprise, sur le schéma |
| 7 | le guide d'exploitation | 9 | les passages, la fiche de la relecture, les opérations périodiques |
| 8 | la maintenance, les risques et les améliorations | 7 | les risques de la famille « la reprise » |
| 9 | la promotionnelle | 6 | rien pour la reprise ; la rétro-conception, un argument pour l'adhésion |

### La fonctionnelle

La reprise n'y a pas de chapitre : le module `_migration` est au socle,
sous le menu d'administration (D711), et ses scénarios relèvent du guide
d'exploitation (D1206). Ce qui passe tout de même :

- **« à quoi sert un champ »** cite les règles de reprise qui
  l'alimentent : « repris de l'ERP » (D1198) ;
- **les opérations déclenchées par la reprise**, `when: migrated`,
  figurent dans la table des opérations de l'entité : elles transforment
  ce que l'utilisateur voit (D1209, D1227) ;
- **les champs `unmapped:`** se disent « saisis ici, jamais repris »
  (D941) ;
- **quand plusieurs règles alimentent un champ**, la documentation les
  décrit toutes, et précise que la dernière qui répond est celle que
  Syncytium retient (D1951).

### Le dictionnaire de la donnée

Le chapitre 4.1, « Reprise des données », décrit la migration déclarée
(D1259, D1302) :

| La partie | Ce qu'elle donne |
|---|---|
| les sources | par table d'origine : le périmètre, l'identité, la clé de partition de la couverture, les colonnes lues avec le type lu et le type décrit, les colonnes écartées et leur motif |
| les règles | dans l'ordre : la source, la cible, le périmètre, les champs mappés et leurs transformations, les destinataires |
| le graphe | de la source vers la cible, dans les deux sens : c'est l'index 5.1, lu depuis l'autre bout (D1198, D1186) |
| à l'instance | le modèle lu et ses versions, les passages |

La clé de partition de la couverture dit comment la source se lit (D879,
D1050). Elle se distingue de la partition de stockage (D1293). Le détail
est dans [migration.md](../../migration.md).

### La réglementation

- **les règles de reprise qui écrivent un champ marqué sont des
  traitements** du registre (D1317) : par leur source, leur cible, leur
  rapport et ses destinataires ;
- **la provenance** (D178) entre dans la mention d'information —
  « reprises de PMI » — et dans la documentation, pour le contexte
  (D1335) ;
- **la rétention du détail des passages** vient de `retention:`, sur la
  base miroir (D1065, D1334, D1892).

### Le projet et le support

Rien en propre : les règles de reprise ne sont pas des écarts (D1281).
Les notes de version disent, en clair, ce que la reprise apporte
(D1096).

### La documentation du développeur

Rien de propre : la reprise n'est pas un appel.

- le gabarit technique de l'import (D1414) est la porte du programme qui
  voudrait alimenter l'application sans reprise ;
- les règles de reprise ne sont pas des écarts du contrat (D1281).

### Le D.A.T.

Rien n'est écrit par le concepteur :

- **le connecteur de reprise** paraît sur le schéma, distinct, avec les
  opérations périodiques de la migration et son état à l'instance
  (D1433) ;
- **le flux est marqué** par les champs `rgpd:` qu'il emporte (D1426).

### Le guide d'exploitation

- **les passages de la reprise** entrent dans la supervision
  quotidienne (D1454) : les cinq états, les rapports, les rejets ;
- **la fiche de la relecture** : `reset_coverage`, `on_running`,
  l'interruption et la relance manuelle (D1077, D1079) ;
- **les opérations périodiques** paraissent au calendrier des opérations
  (D943).

### La maintenance, les risques et les améliorations

- **les risques de la famille « la reprise »** (D1490) : les anomalies
  et les rejets des passages, leur tendance, la couverture. Voir
  [migration.md](../../migration.md) ;
- **une anomalie qui dit une règle absente, ou une source qui a
  changé**, est une lecture métier : elle est servie à partir de
  `manager` (D1493).

### La promotionnelle

La reprise n'y donne rien en propre. La rétro-conception, elle, est un
argument pour l'adhésion (D2102) : elle permet de proposer une
application sur la base d'un modèle de données que les utilisateurs
connaissent peut-être déjà. Voir
[la rétro-conception](08-retro-conception.md#lintérêt).

Dans la démonstration :

- le connecteur de reprise est mocké, comme les autres (D1503) ;
- le jeu de données vient de `dataset:`, non d'un passage de la reprise
  (D1504). Ses données se génèrent de deux façons : par une extraction
  partielle des données d'origine, ou par une création (D2102).

## La migration de version, dans les documentations

La facette ci-dessus décrit la reprise. Une migration de version donne
aussi sa part :

| La documentation | Ce que la migration de version y donne |
|---|---|
| le dictionnaire de la donnée | la lignée d'un champ : « renommé depuis `abrege` » pour `nom_court`, dans l'entrepôt (D1112, D1123) ; une section du chapitre 4.1 par processus qui porte des règles d'`exchange/`, avec ses deux volets (D1302, D1990, D1992) |
| le guide d'exploitation | le rapport de migration de version ; la lecture et la validation d'un écart avant de basculer (D1993, D1994) |
| le D.A.T. | l'espace de stockage au moins double, le temps d'une migration (D1977) |
| la documentation du développeur | les anciennes versions de l'API, servies par les deux volets : elles se décrivent au chapitre des API (D11, D1996) |
| les autres documentations | rien |

Le module `_migration` et sa facette se décrivent au chapitre 10, avec
l'administration et l'exploitation (D2010).
