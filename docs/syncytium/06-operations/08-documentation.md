# Ce que l'opération livre à la documentation

Une opération se documente par ce que son hook en dit et par ce que sa
déclaration en montre. Ce fichier dit ce que l'opération livre à chaque
documentation générée.

## Le sommaire

- [La facette de l'opération](#la-facette-de-lopération)
  - [La fonctionnelle](#la-fonctionnelle)
  - [La réglementation](#la-réglementation)
  - [La documentation du développeur](#la-documentation-du-développeur)
  - [Le guide d'exploitation](#le-guide-dexploitation)
  - [La maintenance, les risques et les améliorations](#la-maintenance-les-risques-et-les-améliorations)
  - [La complétude](#la-complétude)
  - [Les graphes](#les-graphes)

## La facette de l'opération

> **La facette documentation** d'un composant est ce qu'il livre à
> chaque documentation générée. L'opération livre sa description et ce
> qui la déclenche à la fonctionnelle, son traitement à la
> réglementation, son contrat à l'API
> ([glossaire](../../glossaire.md)).

La documentation est une facette des composants (D1158, D1159). Voici
ce que l'opération livre, documentation par documentation.

### La fonctionnelle

Le md du hook est la description de l'opération, « ce qu'elle fait »,
dans la table des opérations de la section de l'entité (D778, D809,
D1196, D1227). Une opération composée se décrit par la liste de ses
étapes, chacune avec sa description (D1227). « Ce qui la déclenche »
vient de la déclaration : le bouton, le `when:`, le calendrier, le
formulaire d'appel et ses champs (D428, D609, D775). Les opérations que
l'utilisateur ne déclenche pas, `migrated`, `generated`, figurent parce
qu'elles transforment ce qu'il voit (D1209). Sans `label:`, le nom
(D1181). Le md est une configuration : ni décision ni histoire du cas
(D1085). La notification sans destinataire remonte à tout le monde ;
la section le dit ainsi (D1228, D1685).

### La réglementation

Une opération est un traitement quand elle implique un champ `rgpd:`
(D1317). Sa déclaration porte le bloc `rgpd:` du traitement,
`controller`, `legal`, `purpose` (D1322) ; `purpose:` tient lieu de
description (D1487). Une suite d'actions fait une ligne du registre
(D1318, D1329). La famille `rgpd` des opérations du socle,
`rgpd.extract(identity)` et `rgpd.anonymize`, y figure (D1333).

### La documentation du développeur

L'opération est au contrat d'API ; son md est montré au technicien
(D1402) ; ses paramètres sont des écarts quand ils changent (D1401).
L'inventaire des hooks d'opération donne leur fiche, `degree`,
`execution`, `deterministic`, les connecteurs attendus (D1404, D1406).
L'API déclenche et suit, le 202 et sa ressource de suivi (D24).

### Le guide d'exploitation

Une opération périodique figure au calendrier des opérations (D943).
Les tâches et leur supervision sont au chapitre 10.

### La maintenance, les risques et les améliorations

Les usages : les déclenchements de chaque opération, la part de refus
de validation, l'opération jamais déclenchée (D1489). Les
améliorations : l'opération jamais déclenchée (D1495), et ce que les
séquences d'appels font émerger (D45).

### La complétude

L'opération sans description ni md est un manque (D1478) ; la finalité
RGPD le comble (D1487).

### Les graphes

Les opérations de la fonctionnelle et les traitements du RGPD se
représentent par des graphes d'état schématiques, pour une consultation
très visuelle (D1436).
