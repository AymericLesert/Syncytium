# Ce qu'un passage laisse

> **La ligne d'exécution** est ce que le moteur garde de chaque
> passage : son état, ses horodatages, ses compteurs et ses
> indicateurs ([glossaire](../../glossaire.md)).

Un passage ne laisse pas seulement des données dans l'application. Il
laisse aussi de quoi répondre à trois lecteurs : le concepteur, qui
veut savoir si sa description de la source tient encore ;
l'administrateur, qui veut savoir si la nuit s'est bien passée ; et
celui qui corrige les données à l'origine, qui veut savoir ce qui a été
refusé, et pourquoi. Ce fichier suit ce que le moteur garde pour eux :
la table des clés d'origine, les versions du modèle lu, la ligne
d'exécution, ses compteurs et ses indicateurs, les anomalies, leur
détail, et les rapports. Tout cela vit dans le module `_migration`,
dont les entités et les surfaces seront décrites au chapitre 10
(D2010). Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [La table des clés d'origine](#la-table-des-clés-dorigine)
  - [Les clés de l'origine, non celles de la destination](#les-clés-de-lorigine-non-celles-de-la-destination)
  - [Ce que chaque clé porte](#ce-que-chaque-clé-porte)
  - [Ce qui la vide, ce qui ne la vide pas](#ce-qui-la-vide-ce-qui-ne-la-vide-pas)
- [Le modèle lu et ses versions](#le-modèle-lu-et-ses-versions)
- [La ligne d'exécution](#la-ligne-dexécution)
- [Les compteurs](#les-compteurs)
- [Les indicateurs](#les-indicateurs)
- [Les anomalies](#les-anomalies)
  - [Deux familles](#deux-familles)
  - [Un fait daté](#un-fait-daté)
- [Le détail et sa rétention](#le-détail-et-sa-rétention)
- [Les rapports](#les-rapports)
  - [La consolidation](#la-consolidation)
  - [Qui reçoit quoi, par défaut](#qui-reçoit-quoi-par-défaut)
  - [Le rapport général](#le-rapport-général)

## La table des clés d'origine

> **La table des clés d'origine** est ce que le moteur garde de chaque
> ligne d'une source : sa clé, sa partition, un hash, le statut de son
> dernier traitement ([glossaire](../../glossaire.md)).

### Les clés de l'origine, non celles de la destination

Une ligne d'origine peut se répartir sur plusieurs entités de
destination, et plusieurs entités d'origine peuvent se fondre en une
seule. La correspondance n'existe donc pas ligne à ligne (D1047) :

- **le moteur garde les clés d'origine**, pour distinguer les lignes
  nouvelles des autres ;
- **il ne garde pas les clés de destination** : un enregistrement se
  retrouve par sa propre identité, dans la base de l'application.

### Ce que chaque clé porte

La table est tenue par entité source. Chaque clé y porte trois choses :

| Ce qu'elle porte | À quoi cela sert |
|---|---|
| sa valeur de partition | elle entre dans le test de la suppression : une clé connue n'est comptée supprimée que si sa partition est dans la plage relue, et qu'elle n'y est pas lue (D1050) |
| un hash de la ligne lue | il compte les lignes modifiées et non modifiées entre deux lectures (D1049) |
| le statut de son dernier traitement | sans erreur, ou avec erreur (D1037) |

Le hash ne décide d'aucune écriture : la destination se compare
toujours sur l'enregistrement entier. Il sert au seul compteur, et son
risque est admis : deux contenus différents d'une même clé qui
donneraient le même hash.

### Ce qui la vide, ce qui ne la vide pas

| Le geste | Les tables de destination | La table des clés d'origine |
|---|---|---|
| `reset: true` | vidées avant l'import | gardée : les compteurs continuent (D1051) |
| `reset_coverage` | intactes | gardée : seule la dernière valeur parcourue revient au départ (D1030) |

## Le modèle lu et ses versions

Le moteur garde les versions du modèle que le connecteur lit dans la
source (D1053). Une nouvelle version ne s'écrit que lorsque le schéma a
changé, avec son écart. Le concepteur suit ainsi les modifications du
système d'origine, d'un passage à l'autre, sans avoir à les guetter.
Ce que chaque écart produit est dit avec la lecture :
[le modèle lu](04-passage.md#le-modèle-lu).

## La ligne d'exécution

Chaque passage a sa ligne d'exécution. Elle porte (D1054, D1079) :

| Ce qu'elle porte | Le détail |
|---|---|
| l'état | en cours, réussi, en erreur, refusé ou interrompu |
| les horodatages | le début et la fin du passage ; par entité source, la vérification, les phases 1 et 2 ; par règle, le mapping et sa validation, les phases 3 et 4 ; par entité de destination, la validation, la phase 5 ; la bascule |
| l'instantané | par entité source, les colonnes chargées ; par règle, les champs alimentés et les règles de validation |
| les compteurs et les indicateurs | voir plus bas |

L'instantané fait qu'un passage se relit tel qu'il s'est exécuté, sans
rechercher la version de la configuration qui valait alors (D1054).

La ligne d'exécution, ses compteurs et ses indicateurs se gardent sans
délai (D1068). Ce sont eux qui tracent la qualité dans le temps : des
indicateurs qui montent, au fil des ajustements du concepteur (D668).

## Les compteurs

Le moteur tient trois jeux de compteurs, dissociés (D1048, D1055) :

| Le jeu | Par | Ce qu'il compte |
|---|---|---|
| l'origine | entité source | le total de la table, soit les lignes filtrées, les lignes hors plage et les lignes lues ; parmi les lues, les nouvelles, les mises à jour, modifiées ou non, les clés traitées sans erreur et avec erreur ; les supprimées |
| la destination | entité de destination | les nouvelles, les non modifiées, les modifiées, les supprimées |
| la règle | règle | les lignes traitées, les lignes en erreur |

Quelques mots demandent leur sens :

- **une ligne nouvelle** a une clé que la table des clés d'origine ne
  connaît pas ;
- **une ligne mise à jour** a une clé déjà parcourue, et relue (D1049) ;
  son hash dit si elle est modifiée ou non ;
- **une ligne supprimée** a une clé connue, qui n'est plus lue dans la
  plage de sa partition (D1050) ;
- **une ligne hors plage** n'a pas été relue : `partition:` l'a laissée
  de côté.

Il n'y a aucun lien d'un jeu à l'autre. L'erreur d'une règle ne se
compte ni sur l'origine, ni sur la destination : elle se suit à la
règle. Après un `reset: true`, l'origine compte ses lignes relues, et
la destination ses lignes nouvelles : les deux jeux le disent chacun à
sa façon (D1051).

## Les indicateurs

Deux indicateurs figurent sur la ligne d'exécution (D1056) :

| L'indicateur | Ce qu'il rapporte | À quoi |
|---|---|---|
| la complétude du schéma | les colonnes décrites encore présentes dans le modèle lu, au type compatible | aux colonnes décrites (D1060) |
| la couverture des données | les lignes lues sans erreur | aux lignes lues ; ce que `filter:` écarte n'y entre pas (D861) |

La complétude se mesure sur les seules colonnes de la configuration
(D862, D1060). Prenons une table de deux cents colonnes :

- cent cinquante sont décrites, dont trente marquées `ignored` ;
- cinquante ne sont pas décrites : elles restent des anomalies de
  complétude, rendues au concepteur, et n'entrent pas dans le taux ;
- si deux colonnes décrites ont disparu, ou ne se convertissent plus,
  la complétude vaut 148 sur 150.

Le détail des deux indicateurs se déduit du modèle lu, que le moteur
garde.

## Les anomalies

### Deux familles

Le moteur range les anomalies en deux familles (D1057) :

| La famille | Ce qu'elle porte | Son volume |
|---|---|---|
| les anomalies du modèle | par entité source et par colonne : la complétude, la description, l'entité illisible | faible |
| les anomalies des enregistrements | une entrée par erreur : la clé d'origine, la phase, la colonne, la règle ou la validation en cause, et un message clair | parfois très grand |

Le message dit la nature de l'anomalie. Le rapport le reprend tel
quel.

### Un fait daté

Une anomalie est un fait daté (D1059). La suite des faits d'une clé
d'origine donne toutes ses alternatives, et tous ses changements de
statut : acceptée, refusée pour une cause, refusée pour une autre, de
nouveau acceptée. Les motifs d'un refus sont gardés pour cela (D1032) :
ils font, et refont, les rapports, et montrent ce qui a changé d'une
reprise à l'autre.

## Le détail et sa rétention

Le détail des anomalies des enregistrements peut être très volumineux.
Il vit dans le module `_migration`, partitionné par une date, et le
moteur en assure lui-même le nettoyage, par cette partition (D1889) :

| Ce qui se garde | Combien de temps |
|---|---|
| le détail des passages | le temps de `retention:`, sous `mirror:` : quatre-vingt-dix jours par défaut (D1892) |
| la ligne d'exécution, ses compteurs, ses indicateurs | sans délai (D1068) |
| la table des clés d'origine | autant que la migration |

Le nettoyage se fait à chaque début de journée (D1894). Dans
l'entrepôt, la production garde le détail quatre-vingt-dix jours :

```yaml
# La base miroir
# Là où les migrations se construisent et se contrôlent, à l'image de l'entrepôt, avant d'y reporter leurs
# différences ; elle est vidée à la fin de la migration. Sans cette clé, un connecteur en mémoire et
# quatre-vingt-dix jours de rétention.
mirror:

  # Le connecteur de la base miroir
  # Un storage de l'environnement ; sans cette clé, memory, un connecteur en mémoire.
  storage: temporaire

  # La rétention
  # La durée pendant laquelle le détail des passages se garde ; sans cette clé, quatre-vingt-dix jours.
  retention: 90d
```

Les données personnelles du détail suivent deux règles (D1065) :

- le rapport envoyé par mail anonymise les valeurs des champs marqués
  `rgpd:` (D696) ;
- les interfaces du module montrent les valeurs complètes, sous les
  droits de chacun.

## Les rapports

Le chapitre 8 dit où `report:` se déclare, et qui reçoit quoi :
[les rapports](../08-migration/05-controles.md#les-rapports). Voici ce
que le moteur en fait, après chaque passage.

### La consolidation

Un destinataire ne reçoit pas un message par règle. Le moteur réunit
ce qui lui est adressé (D929, D1058) :

- les anomalies de toutes les entités sources et de toutes les règles
  qui le nomment ;
- groupées par source ou par règle, puis par message ;
- envoyées par les canaux de `by:`, au moment que dit `when:` (D406).

Le rapport n'est pas une entité de plus : c'est une vue groupée des
anomalies, lue dans le détail du passage (D1015).

### Qui reçoit quoi, par défaut

| L'anomalie | Sans `report:` |
|---|---|
| d'une entité source | à l'administrateur, et dans la vue des migrations (D2105) |
| d'une règle | à la demande, vers l'administrateur (D407) |
| du modèle de la source | au concepteur, par le module `_migration` |

Le concepteur est un administrateur : ce qui va à l'administrateur
l'atteint aussi.

### Le rapport général

Aucun rapport ne réunit toutes les anomalies. Le rapport général porte
leur nombre, règle par règle (D2078). Il se lit toujours dans la vue
des migrations ; un processus qui déclare `report:` l'envoie en plus à
ses destinataires (D2106).
