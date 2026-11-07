# Le réglementaire

Le marquage des données personnelles, le registre des traitements et le bloc
`rgpd:`, l'anonymisation, la rétention, les droits des personnes.

Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md). Le texte vient des deux artefacts
préparatoires, déplacé à la réorganisation ; la réécriture suit.

## Le sommaire

- [Le RGPD (D695–D698)](#le-rgpd-d695d698)
- [Le RGPD](#le-rgpd)

## Le RGPD (D695–D698)

- **le marquage** (D695) : la facette **`rgpd:`** aux trois valeurs —
  `personal` (la donnée personnelle), `sensitive` (l'article 9 — le
  régime renforcé), `consent` (le traitement au consentement) — et une
  quatrième, **`identity`**, acquise (D1332, D1806 : l'identité civile
  de la personne — le nom, le prénom —, non un identifiant unique ;
  depuis ces champs, l'arbre de la donnée dit tout ce qui est lié à une
  personne ; l'opération `rgpd.extract(identity)` du socle, D1331/D1333, part
  d'eux) :

```yaml
fields:
  name:       { type: text, rgpd: personal }
  blood_type: { type: text, rgpd: sensitive, confidentiality: private }
  newsletter: { type: boolean, rgpd: consent }
```

- **l'effacement = l'anonymisation** (D696) : la valeur de
  remplacement est **construite par un algorithme à règle
  aléatoire, jamais dérivée de l'origine** (l'exception admise : la
  longueur de la chaîne) — ni un blanc, ni un haché ; la
  modification porte **les enregistrements et les historiques**
  (D168) — l'enregistrement demeure, la personne disparaît ; la
  provenance (D178), technique, survit ; **un fichier s'anonymise** par
  la destruction de son contenu, ses mots-clés rendus cohérents avec la
  fiche, son squelette conservé (D163) ; dédupliqué par empreinte, il
  ne s'efface qu'au dernier détenteur, toutes ses fiches anonymisées
  (D165) ;
- **`anonymize`, la dix-neuvième opération du socle** (D697) :
  l'usage limité à l'administration — et le principe posé : **chaque
  opération du socle porte un degré intrinsèque d'autorisation** (le
  plancher que la déclaration ne peut abaisser) ; l'inventaire des
  degrés est flagué ;
- **la rétention** (D698) : la donnée marquée dont la rétention
  échoit s'anonymise — par la règle de `rgpd.anonymize` que le
  concepteur déclare, jamais d'office ; sans déclaration, rien, et le
  registre dit « rétention non précisée » (D1813) — la profondeur de
  l'historique (D411) est une autre chose, de l'exploitation (D1811) ; deux
  rétentions (D1810) — celle des journaux et des
  fichiers, `cleanup.yml`, relève de l'exploitation, le chapitre 10 ;
  celle des données personnelles, l'anonymisation déclarée avec sa
  règle et sa fréquence (D1334), est de ce chapitre ; **la rétention
  d'une donnée personnelle est la durée d'une fiche sans mouvement ni
  mise à jour, au-delà de laquelle les informations personnelles ne sont
  pas à conserver ; la fiche et son historique s'anonymisent ensemble**
  (D1812) ;
- **le registre des traitements auto-documenté** (D698 —
  D333/D645) : une ligne par traitement — une opération ou une suite
  impliquant un champ `rgpd:` (D1317–D1318) —, **son responsable, un
  groupe d'utilisateurs** (D1320, `controller:` ; documentaire, aucun
  droit n'en découle, D1808), les
  champs `rgpd:`, leur confidentialité, leur rétention, leurs
  connecteurs sortants — généré, jamais rédigé ; un projet sans champ
  marqué n'est pas une anomalie (D1319).

## Le RGPD

- **Le client est responsable de traitement** (D16, §6.6) —
  l'instance chez lui ; Syncytium fournit la capacité (la rétention,
  l'anonymisation, l'export). La remontée vers l'éditeur serait un
  **opt-in strict**. Les indicateurs d'usage sont agrégés sur le
  schéma ; les acteurs identifiés ne sont que les comptes
  techniques — la surveillance des salariés est évitée par
  construction ; **la sécurité du SI reste une finalité légitime**
  pour tracer les tentatives nominatives (§6.4).
- **Le marquage** (D695) : `rgpd: personal | sensitive | consent` — et
  `identity`, acquise (D1332, D1806 — l'identité civile, la clé d'association de l'enregistrement à une personne, sans unicité, le point de
  départ de l'extraction `rgpd.extract(identity)`, D1331/D1333) — le
  modèle sait ce qui est personnel ; le `sensitive` (l'article 9)
  audité d'office (D703).
- **L'effacement = l'anonymisation** (D137, D139, D696) : jamais une
  suppression physique — la valeur de remplacement **construite par
  un algorithme aléatoire, jamais dérivée de l'origine** (ni blanc ni
  haché), sur **les enregistrements et les historiques** ;
  l'enregistrement demeure, la personne disparaît, la provenance
  survit. `anonymize` = la dix-neuvième opération, plancher
  `administrator` (D697) ; le fichier anonymisé = le contenu détruit,
  les mots-clés cohérents (Q39).
- **La rétention** (D698, D411, D1328, D1334) : deux rétentions
  (D1810) — celle des journaux et des fichiers à l'exploitation, celle
  des données personnelles ici : la durée d'une fiche sans mouvement ni
  mise à jour, au-delà de laquelle les informations personnelles ne sont
  pas à conserver, la fiche et son historique anonymisés ensemble
  (D1812) ; le nettoyage
  (`cleanup.yml`) reste aux fichiers et aux traces ; l'anonymisation
  des enregistrements porte sa règle et sa fréquence (`rgpd.anonymize`
  avec `every:`) ; la rétention d'une donnée est la plus longue période
  parmi ses traitements, le registre fait la somme ; l'échéance de
  validité est portée par l'anonymisation — la donnée marquée dont la rétention
  échoit **s'anonymise d'office** ; les pays du stockage, `countries:` dans
  la section `rgpd:` du connecteur (D1345) ; les traces de journal à
  rétention paramétrable et anonymisation optionnelle (D41).
- **Le registre des traitements auto-documenté** (D698) : généré du
  modèle — **une ligne par traitement, c'est-à-dire par opération qui
  implique un champ `rgpd:`** (D1317 : les actes du socle, les
  opérations déclarées, les règles de reprise, l'import et l'export, les
  notifications et les webhooks, le LLM ; l'anonymisation et le
  nettoyage comme traitements d'appui, avec leur fréquence et leur
  règle) ; l'entité marquée décrit le stockage, le module marqué est le
  périmètre soumis ; les champs `rgpd:`, leur confidentialité, leur
  rétention, leurs connecteurs sortants ; **le responsable du traitement,
  un groupe d'utilisateurs, propriété du traitement** (D1320 ;
  documentaire, aucun droit n'en découle, D1808) — dans
  **le bloc `rgpd:` du traitement** (D1322 : `controller`, `legal` — la base
  légale à valeurs fermées, un paragraphe par valeur au catalogue,
  D1326 —, `purpose`… ; le même bloc dans les settings du projet, du
  module et de l'entité, D1323–D1325 — quatre niveaux, le plus proche
  l'emporte), « non précisé » au registre quand il
  manque ; **un projet sans aucun champ `rgpd:` n'est pas une anomalie :
  Syncytium ne décide pas de ce qui est réglementaire** (D1319 — amende
  D1177 : la complétude ne relève plus l'absence de marquage) ; le
  marquage se généralise par le type personnalisé qui le porte
  (`nom: { type: text[..40], rgpd: personal }`, D1178) — le registre se
  lit alors par type, puis par champ.
- **Le détail des migrations** (D1065) : les anomalies d'un passage
  portent des valeurs de la source ; leur fichier est supprimé entier
  à l'échéance de sa rétention (le `cleanup.yml` de l'environnement,
  D1073) ; le rapport par mail anonymise les valeurs des champs
  `rgpd:` (D696) ; les interfaces du module les montrent sous les
  droits de chacun.
- **Le staging porte des données réelles** (§7.3) : l'éphémérité et
  l'accès restreint sont les garde-fous, à documenter chez le
  client.

