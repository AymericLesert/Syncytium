# Ce que l'opération livre à la documentation

*La facette documentation de l'opération, colonne par colonne : son md est sa description, sa déclaration dit ce
qui la déclenche.*

## Le sommaire

- [La facette de l'opération](#la-facette-de-lopération)
  - [Dans la fonctionnelle](#dans-la-fonctionnelle)
  - [Dans les autres documentations](#dans-les-autres-documentations)

## La facette de l'opération

### Dans la fonctionnelle

**Le hook d'opération, dans la fonctionnelle** : son md (`description:
~{documentation.md}`, D778/D809) **est la description de l'opération**
— « ce qu'elle fait » dans la table des opérations de la section de
l'entité (D1196, D1227) ; une opération qui en enchaîne plusieurs se
décrit par la liste de ses étapes, chacune avec sa description
(D1227) ; « ce qui la déclenche » vient de la déclaration — le bouton,
le `when:`, la période (D428/D609), le formulaire d'appel et ses champs
(D775) ; les opérations que l'utilisateur ne déclenche pas
(`migrated`, `generated`) figurent parce qu'elles transforment ce
qu'il voit (D1209) ; sans `label:`, le nom (D1181). Le md est une
configuration : ni décision ni histoire du cas (D1085, D1228).

**L'effet `notify`** sans destinataire remonte à tout le monde dans la
zone des notifications de l'application ; le relais par mail est le
choix du profil (D1228) — la section le dit ainsi.

### Dans les autres documentations

- **La réglementation** : une opération est un traitement quand elle
  implique un champ `rgpd:` (D1317) ; sa déclaration porte le bloc
  `rgpd:` du traitement, `controller`, `legal`, `purpose` (D1322), et
  `purpose:` tient lieu de description (D1487) ; une suite d'actions
  fait une ligne du registre (D1318, D1329) ; la famille `rgpd` des
  opérations du socle, `rgpd.extract(identity)`, `rgpd.anonymize`
  (D1333).
- **La documentation du développeur** : l'opération au contrat d'API,
  son md montré au technicien (D1402), ses paramètres dont le changement
  est un écart (D1401) ; l'inventaire des hooks d'opération par leur
  fiche, `degree`, `execution`, `deterministic`, les connecteurs (D1404,
  D1406).
- **Le guide d'exploitation** : une opération périodique au calendrier
  des opérations (D943).
- **La maintenance, les risques et les améliorations** : les usages, les
  déclenchements de chaque opération, la part de refus de validation,
  l'opération jamais déclenchée (D1489, D1495) ; les améliorations que
  les séquences d'appels font émerger (D45).
- **La complétude** : l'opération sans description ni md est un manque
  (D1478) ; la finalité RGPD le comble (D1487).
- **Les graphes** : les opérations de la fonctionnelle et les
  traitements du RGPD se représentent par des graphes d'état
  schématiques (D1436).
