# Le réglementaire

> **Un traitement**, au sens du RGPD, est une opération ou une suite
> d'opérations impliquant au moins un champ marqué `rgpd:`. L'entité qui
> porte le champ décrit le stockage de la donnée ; le module qui la porte
> est soumis au règlement ([glossaire](../../glossaire.md)).

Le règlement général sur la protection des données demande de savoir
quelles données sont personnelles, qui les traite et pourquoi, combien de
temps on les garde, et comment une personne obtient les siennes ou leur
effacement. Syncytium le sait par le modèle : le marquage des champs, le
registre des traitements généré, l'anonymisation et sa règle, l'extraction.
Ce fichier dit chacun. Les fiches de `rgpd.extract` et `rgpd.anonymize`
sont au chapitre 6 ([le catalogue](../06-operations/06-catalogue.md),
D1756). Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [Le client responsable](#le-client-responsable)
- [Le marquage](#le-marquage)
- [Le registre des traitements et le bloc rgpd](#le-registre-des-traitements-et-le-bloc-rgpd)
- [L'anonymisation](#lanonymisation)
- [La rétention](#la-rétention)
- [Les droits des personnes](#les-droits-des-personnes)
- [Vos données](#vos-données)

## Le client responsable

L'instance est chez le client, et le client est le responsable de
traitement : Syncytium fournit la capacité, le marquage, le registre,
l'anonymisation, l'extraction, jamais la décision (D16). Rien ne remonte
vers l'éditeur sans un accord explicite. Les indicateurs d'usage sont
agrégés sur le schéma, et les seuls acteurs identifiés sont les comptes
techniques : la surveillance des salariés est évitée par construction ;
la sécurité du système d'information reste une finalité légitime pour
tracer les tentatives nominatives (D43). Un projet sans aucun champ
marqué n'est pas une anomalie : Syncytium ne décide pas de ce qui est
réglementaire (D1319).

## Le marquage

La facette `rgpd:` d'un champ dit ce qui relève du règlement, en quatre
valeurs (D695, D1806) :

- `personal`, la donnée personnelle ;
- `sensitive`, la donnée de l'article 9, au régime renforcé ; ses
  lectures sont auditées d'office (D703) ;
- `consent`, le traitement au consentement, que le retrait anonymise ;
- `identity`, l'identité civile d'une personne, le nom, le prénom : le
  champ est personnel, et il est la clé d'association de l'enregistrement
  à une personne, le point de départ de l'extraction, sans unicité de
  l'enregistrement.

Le contact de l'entrepôt :

```yaml
  nom:
    type: text[..40]
    required: true
    rgpd: identity
    searchable: mutualizable[qui]
    label: Nom

  prenom:
    type: text[..40]
    rgpd: identity
    label: Prénom
```

Un type personnalisé porte le marquage, et le champ qui l'emploie en
hérite : la RGPD se généralise par le type ; il écrit l'une des quatre
valeurs, jamais une forme courte (D1178, D1807). L'écriture de la facette
est au chapitre 2 ([les types](../02-modele/05-types.md)). Dès qu'un champ
est marqué, son entité décrit le stockage de la donnée et son module est
soumis (D1317).

## Le registre des traitements et le bloc rgpd

Le registre des traitements est généré, jamais rédigé (D698, D333, D645).
Une ligne par traitement, les traitements groupés par module soumis
(D1321) : les actes du socle sur une entité marquée, les opérations
déclarées, les règles de reprise, l'import et l'export, les notifications
et les webhooks, le LLM ; l'anonymisation et le nettoyage comme
traitements d'appui, avec leur fréquence et leur règle (D1317, D1318).
Une suite d'opérations est un seul traitement, ses étapes listées
(D1329). Chaque ligne porte les champs marqués, leur confidentialité,
leur rétention, leurs connecteurs sortants, et ce que le modèle ne dit
pas : le bloc `rgpd:`, à cinq clés (D1322, D1809) :

- `controller`, le responsable du traitement, un groupe d'utilisateurs
  (D1320) ; documentaire, aucun droit n'en découle (D1808) ;
- `legal`, la base légale, six valeurs fermées, `consent`, `contract`,
  `legal_obligation`, `vital_interests`, `public_task`,
  `legitimate_interest` ; Syncytium écrit le paragraphe de chacune, dans
  chaque langue (D1326) ;
- `purpose`, la finalité, un texte par langue ;
- `contact`, l'adresse du responsable ;
- `dpo`, le délégué à la protection des données, son nom, son courriel,
  son téléphone.

Le bloc se déclare à quatre niveaux, et le plus proche l'emporte,
propriété par propriété : les settings du projet, du module, de
l'entité, et le traitement lui-même (D1323, D1324, D1325). Une propriété
absente partout est « non précisée » au registre, et la complétude la
compte ; un groupe inconnu en `controller:` est une erreur d'ingestion
(D1327). Le bloc du projet, dans `settings.yml` de l'entrepôt :

```yaml
# Le réglementaire
# Le bloc rgpd: du projet, hérité par les modules, les entités et les traitements : qui répond des traitements, sur
# quelle base, pour quelle finalité ; le contact et le délégué.
rgpd:

  # Le responsable des traitements
  # Un groupe d'utilisateurs : la direction répond de l'entrepôt.
  controller: direction

  # La base légale
  # L'intérêt légitime de l'entreprise : tenir le miroir de son ERP.
  legal: legitimate_interest

  # La finalité
  purpose: Tenir l'entrepôt de données de l'entreprise, miroir de l'ERP, pour le pilotage et la préparation

  # Le contact
  contact: direction@entreprise.example

  # Le délégué à la protection des données
  dpo:
    name: Le délégué de l'entreprise
    email: dpo@entreprise.example
```

Le bloc d'un traitement ne surcharge que ce qui lui est propre ; les
clés de la déclaration d'une opération sont au chapitre 6. Le lieu du
stockage vient du connecteur, `countries:` dans sa section `rgpd:`
(D1345) :

```yaml
  # Le réglementaire
  # Le stockage est en France.
  rgpd:
    countries: [FR]
```

## L'anonymisation

L'effacement d'une donnée personnelle est une anonymisation, jamais une
suppression physique (D137, D139, D696). La valeur de remplacement est
construite par un algorithme à règle aléatoire, jamais dérivée de
l'origine, ni un blanc, ni un haché ; la seule exception admise est la
longueur de la chaîne. L'anonymisation porte sur les fiches, les données
personnelles et l'historique : quand une fiche s'anonymise, la fiche et
son historique le sont ensemble (D168, D1812) ; l'enregistrement
demeure, la personne disparaît, la provenance de la reprise, technique,
survit (D178). Un fichier s'anonymise par la destruction de son contenu,
ses mots-clés rendus cohérents avec la fiche, son squelette conservé
(D163) ; dédupliqué par empreinte, il ne s'efface qu'au dernier
détenteur, toutes ses fiches anonymisées (D165). `rgpd.anonymize` est au
plancher `administrator` (D697, D1333) ; le rapport d'une migration
anonymise les valeurs des champs marqués avant de partir par mail
(D1065).

## La rétention

La rétention d'une donnée personnelle est la durée d'une fiche sans
mouvement ni mise à jour, au-delà de laquelle les informations
personnelles ne sont pas à conserver (D1812). Elle s'écrit dans la règle
de `rgpd.anonymize` que le concepteur déclare, avec sa fréquence
(D1334, D1813) ; l'inactivité se mesure à la date de dernière
modification de la fiche. L'entrepôt anonymise chaque mois les contacts
des tiers sortis depuis trois ans :

```yaml
# Les opérations
# L'anonymisation des contacts des tiers inactifs depuis trois ans, chaque mois : le traitement d'appui du RGPD ; le
# responsable et la base légale viennent du projet, la finalité est la sienne.
operations:

  # L'anonymisation
  anonymiser:
    every: monthly[1 at 03:00]
    actions: [ rgpd.anonymize(owner.actif = false and owner.date_modification < context.now - 3y) ]
    rgpd:
      purpose: Effacer l'identité des contacts des tiers sortis de l'ERP depuis plus de trois ans
```

Sans anonymisation déclarée, Syncytium ne fait rien, et le registre dit
« rétention non précisée » (D1813). Le registre lit la rétention dans
la règle ; quand une donnée est touchée par plusieurs traitements, sa
rétention est la plus longue période parmi eux (D1328). Deux choses sont
de l'exploitation, au chapitre 10 (D1810, D1811) : la rétention des
journaux et des fichiers, `cleanup.yml`, qui supprime entier le détail
d'une migration à son échéance (D1073), les traces de journal à
rétention paramétrable (D41) ; et la profondeur de l'historique (D411).

## Les droits des personnes

Une personne demande l'ensemble de ses données : un responsable métier
ou un administrateur exécute `rgpd.extract(identity)`, au plancher
`manager` (D1149, D1331, D1333). L'extraction part des champs `identity`,
exacts ou normalisés, présente les enregistrements trouvés, le
responsable confirme, puis Syncytium suit les références et les
compositions et réunit ce qui est lié ; le résultat est une édition à
cartouche, journalisée (D1332). L'opposition et le retrait du
consentement s'exercent par l'anonymisation des seuls champs `consent`
(D1331). La limitation s'exerce par l'état de l'entité que le concepteur
déclare, un état qui ne permet que `read` (D1172, D1331). La mention
d'information, `rgpd.notice`, se génère depuis le registre, dans chaque
langue ; le concepteur l'ancre où il veut, et la documentation notifie un
manque si rien ne l'ancre (D1335). L'entrepôt l'ancre dans sa page
d'accueil :

```markdown
# L'entrepôt de données

Les données de Cegid PMI, standardisées, harmonisées et fiabilisées, de l'opérateur aux dirigeants. L'entrepôt
est en lecture seule : la reprise de l'ERP l'alimente chaque nuit.

## Vos données

${rgpd.notice}
```
