# Le module `_migration` de Syncytium

Ce document décrit **le module `_migration`** : le module du socle qui
**pilote et supervise la reprise des données** — ce qu'il exécute, ce
qu'il contrôle, ce qu'il garde, ce qu'il montre, ce qu'il envoie.

- **Il est présent dans Syncytium ; ce n'est pas aux applications de
  l'exposer** (D1028) : aucune configuration ne le déclare, il naît avec
  le moteur (D666 — « le socle premier client », D408/D416) et s'active
  dès qu'une version déclare `migrations:` (D662/D711).
- **Son nom porte le préfixe `_` des modules internes** (D1029) — ses
  adresses s'écrivent `_migration.passage`, `_migration[suivi]` ; une
  application ne peut pas nommer un module par `_`.
- **Il est en lecture seule par construction** (D1030) : le moteur seul
  l'alimente ; il vit sous le menu d'administration, les administrateurs
  le consultent — un `allow:` y serait possible, il n'aurait pas
  d'intérêt.
- **Il vaut pour toute migration** (D1031) — quel que soit le connecteur
  de reprise, le système d'origine, le nombre de sources et de règles ;
  ce document reste généraliste, les illustrations vivent dans les cas
  d'usage.

[mapping.md](mapping.md) dit comment une migration **se décrit** (la
source, les règles, la couverture) ; ce document dit **comment elle
s'exécute et ce qu'il en reste**. Les décisions citées renvoient à la
[conception](conception.md). Les noms des entités et des champs du
module sont en proposition jusqu'à la documentation structurée (D1021).

## Le principe

L'application déclare ses migrations — le connecteur de la source, la
base miroir, le stockage du détail, les descriptions `source/`, les
règles `mapping/`, les opérations périodiques (D662, D943,
D1044–D1045, D1072). Le moteur les exécute : chaque `migrate` est **un
passage** (D667). Le module garde de chaque passage ce que trois
lecteurs attendent :

| qui | la question | ce qui y répond |
|---|---|---|
| **le technicien** | où en est l'analyse du système d'origine ? qu'est-ce qui cloche dans sa description ? | le modèle lu et ses versions, la complétude du schéma, les anomalies du modèle |
| **les métiers** — les destinataires que les `report:` nomment | qu'est-ce qui a été refusé, pourquoi, et comment le corriger à l'origine ? | les anomalies des enregistrements, consolidées par destinataire |
| **l'administrateur** | le passage s'est-il bien déroulé ? la qualité progresse-t-elle ? | la ligne d'exécution : l'état, les horodatages, les compteurs, les indicateurs dans le temps |

**La source fait foi** sur ce que les règles alimentent (D1038) : la
correction faite à la main dans la destination sur un champ migré cède
au passage suivant qui relit l'enregistrement — corriger durablement,
c'est corriger à l'origine ; seuls les champs `unchanged:` y échappent
(D941), comme ceux qu'aucune règle n'alimente.

## Le déroulé d'un passage

Un passage **construit la reprise dans une base miroir**, à l'image de
la destination, puis **reporte les différences** dans la base de
l'application (D1044). Les étapes :

| | l'étape | ce qu'elle fait | les décisions |
|---|---|---|---|
| a | **le modèle lu** | le connecteur lit le schéma réel ; Syncytium le compare à la version précédente et à la description `source/` | D653, D1053 |
| b | **la lecture** | par entité source : `filter:` écarte (les lignes filtrées ne sont pas conservées), `coverage:` choisit la plage relue | D663, D878–D880, D1032 |
| 1 | **la validation des données sources** | après le filtre : chaque colonne convertie du type de stockage au type de la description, puis l'identité vérifiée, puis les liens (l'orphelin) | D1040, D1042, D1053 |
| 2 | **la vérification des règles sources** | les `validation:` de l'entité source | D932, D1033 |
| 3 | **le mapping** | `fields:` construit les enregistrements de destination dans la base miroir | D654, D1033 |
| 4 | **la validation des règles du mapping** | les `validation:` de la règle, sur l'enregistrement construit (`me`) | D932, D1033 |
| 5 | **la validation des règles de destination** | après la lecture de toutes les données : les règles du modèle de destination, sur la base miroir complète — l'unicité des identités, le parent qui lit ses enfants | D933, D1033, D1046 |
| c | **la comparaison** | la base miroir face à la cible : création, modification, inchangé, suppression | D672, D878, D1037, D1052 |
| d | **la bascule** | les différences reportées dans la cible, en une transaction | D1041, D1044 |
| e | **le suivi** | la table des clés d'origine, les compteurs, les indicateurs, les anomalies, la dernière valeur parcourue | D1047–D1056 |
| f | **les rapports** | la consolidation par destinataire et l'envoi | D929, D1058, D1065 |

### Les cinq phases de contrôle (D1033, D1040)

- **Chaque phase relève toutes ses erreurs** (D1057) : la phase 1
  convertit toutes les colonnes et référence chaque erreur, pas
  seulement la première ; de même toutes les règles, toutes les
  validations de la destination.
- **L'enregistrement en erreur à une phase ne passe pas à la suivante.**
  L'enregistrement qui ne respecte pas toutes ses règles n'est pas
  enregistré ; ses motifs sont conservés (D1032) et rejoués au passage
  suivant si une règle ou une donnée change.
- **La phase 1 conditionne la lecture de l'entité** : sans elle,
  l'entité n'est pas lisible. La valeur se convertit du type de stockage
  (le type de Syncytium que le connecteur lit — D876) au type de la
  description ; les deux types sont compatibles s'ils se convertissent
  l'un dans l'autre ; l'enregistrement dont la valeur ne se convertit
  pas tombe (D1053).
- **L'identité de la source se vérifie dans la phase 1** (D1042) :
  non respectée, c'est la description qui est fausse — une colonne
  manque à la clé, ou une colonne est de trop : l'entité n'est pas lue,
  les champs qui la référencent tombent, et par transitivité les
  enregistrements qui en dépendent ; le reste de la migration continue.
  Toute entité porte une identité, la sienne ou celle qu'elle hérite de
  sa racine ; son absence est une anomalie de description (D1035,
  D1039).
- **L'orphelin se détecte en phase 1** (D1040) : l'enregistrement tombe
  si une règle du mapping utilise la référence orpheline.
- **L'identité de la destination se vérifie en phase 5**, dans la base
  miroir (D1046) : de deux enregistrements de même clé, le second tombe
  et le passage continue ; au report, deux enregistrements de même clé
  sont le même enregistrement — la bascule ne s'interrompt jamais sur
  une identité.
- **La composition** (D933) : l'échec propre du parent entraîne ses
  composants ; l'échec propre d'un composant ne rejette que lui ; la
  validation du parent qui lit ses enfants s'évalue en phase 5, sur le
  parent et tous ses enfants.

### La base miroir et la transaction (D1041–D1046)

- **`buffer:`** nomme le connecteur de la base miroir (D1045) : un
  `storage` dans un schéma donné, ou un connecteur de la classe
  `memory` qui tient le modèle en mémoire ; le connecteur porte la
  facette, pas Syncytium.
- **La base miroir vit le temps de la migration** : le schéma est
  supprimé à la finalisation (D1044). Elle ne reçoit que ce que
  `coverage:` relit ; l'enregistrement non relu qu'une référence
  désigne y est recopié depuis la base de l'application.
- **La reprise est une transaction** (D1041) : la bascule s'applique en
  entier ou pas du tout ; l'erreur qui interrompt la mise à jour ramène
  toutes les données à leur valeur d'avant. Tant que le passage
  construit la base miroir, rien de l'existant n'est touché.
- **La transaction qui échoue est tracée** (D1043) : ses données ne
  sont ni prises en compte ni enregistrées — la destination, la table
  des clés d'origine et la dernière valeur parcourue restent à leur état
  d'avant ; le passage, ses horodatages, sa cause et ses anomalies
  restent consultables, sans impact sur la base cible.
- **Le dry-run** (D649/D667) s'arrête après la comparaison : il montre
  les différences sans les reporter.

### La comparaison et la suppression (D878, D1034, D1037, D1052)

- **Les cinq blocs** (D1034) : les anomalies, la création, la
  modification, l'inchangé, la suppression.
- **L'enregistrement complet se compare** (D1037) : l'enregistrement
  construit dans la base miroir, ses compositions comprises, face à la
  cible par son identité ; seuls les écarts s'écrivent (D672), en
  historique ou en remplacement selon la configuration de l'entité
  destination (D1036).
- **La suppression se joue sur la partition relue** (D1052) :
  l'enregistrement de la destination présent avant et absent après est
  supprimé — sa donnée a disparu de l'origine, ou il est tombé en
  anomalie ; la saisie à la main dans la plage relue l'est de même ;
  hors de la plage relue, rien n'est supprimé.

## Ce que le module garde

### La table des clés d'origine (D1047–D1051)

**Le module garde les clés d'origine, pas celles de la destination** :
une ligne d'origine peut se répartir sur plusieurs entités de
destination, plusieurs entités d'origine peuvent se fondre en une seule
— la correspondance n'existe pas ligne à ligne ; la destination se
retrouve par sa propre identité, dans la cible (D1047). Par entité
source, chaque clé porte :

- **sa valeur de partition** (D1050), qui entre dans le test de la
  couverture ;
- **un hash** de la ligne lue (D1049), pour compter seulement les
  lignes modifiées et non modifiées entre deux lectures — il ne décide
  d'aucune écriture ; le risque admis : deux contenus d'une même clé au
  même hash ;
- **le statut de son traitement** au dernier passage (D1037) — sans
  erreur ou avec erreur.

`reset: true` vide les tables cibles, pas la table des clés d'origine :
les compteurs continuent (D1051). `reset_coverage` remet la dernière
valeur parcourue au départ sans rien effacer (D1030).

### Le modèle lu et ses versions (D1053)

Syncytium garde les versions du modèle que le connecteur lit ; une
nouvelle version s'écrit quand le schéma change, avec son écart. Les
écarts se traitent toujours de la même façon :

| l'écart | ce qu'il produit |
|---|---|
| une colonne du modèle, non décrite dans la configuration | une anomalie de complétude — le passage continue |
| une colonne dont le type décrit ne se convertit pas depuis le type lu | une anomalie de description |
| une colonne décrite qui disparaît de la source | une erreur de description — l'entité est illisible |
| une valeur qui ne se convertit pas | l'enregistrement tombe en phase 1 |

### Le passage — la ligne d'exécution (D1054–D1056, D1077, D1079)

- **L'état** : en cours, réussi, en erreur, refusé ou interrompu.
- **Les horodatages** : le démarrage et la fin du passage ; par entité
  source, la vérification (phases 1–2) ; par règle, le mapping et sa
  validation (phases 3–4) ; par entité de destination, la validation
  (phase 5) ; la bascule.
- **L'instantané** (D1054) : par entité source, les colonnes chargées ;
  par règle, les champs mappés et les règles de validation — le passage
  se relit tel qu'il s'est exécuté, sur le modèle de la dernière
  version.
- **Les compteurs et les indicateurs**, ci-dessous.

La ligne d'exécution, ses compteurs et ses indicateurs restent **sans
délai de rétention** (D1068) : ce sont eux qui tracent la qualité dans
le temps (D668).

### Trois jeux de compteurs, dissociés (D1048, D1055)

| le jeu | par | les compteurs |
|---|---|---|
| **l'origine** | entité source | le total de la table = les filtrées + les hors plage + les lues ; parmi les lues : les nouvelles (clé inconnue), les mises à jour (clé déjà parcourue et relue — modifiées ou non modifiées selon leur hash), les clés traitées sans erreur et avec erreur ; les supprimées (clé connue, non relue dans la plage de sa partition) |
| **la destination** | entité de destination | les nouvelles, les non modifiées, les modifiées, les supprimées |
| **la règle** | règle | les lignes traitées, les lignes en erreur |

Aucun lien d'un jeu à l'autre : l'erreur d'une règle ne se compte ni
sur l'origine ni sur la destination, elle se suit à la règle.

### Les indicateurs (D1056, D1060)

Sur la ligne d'exécution :

- **la complétude du schéma** — sur les colonnes décrites dans la
  configuration : les décrites encore présentes dans le modèle lu, au
  type compatible, rapportées aux décrites (D1060) ; une colonne que la
  configuration ne cite pas n'y entre pas — elle reste une anomalie de
  complétude ;
- **la couverture des données** — sur les compteurs de l'origine : les
  lignes lues sans erreur rapportées aux lignes lues.

Le détail se déduit du modèle gardé (D1053).

### Les anomalies (D1057–D1059)

Deux familles, deux entités :

- **les anomalies du modèle** — par entité source et par colonne : la
  complétude, la description, l'entité illisible ; peu nombreuses,
  gardées en base ;
- **les anomalies des enregistrements** — **une entrée par erreur**
  (D1057) : la clé d'origine, la phase, la colonne, la règle ou la
  validation en cause, et **un message clair** qui dit la nature de
  l'anomalie, repris tel quel par le rapport.

**L'anomalie est un fait daté** (D1059) : la suite des faits d'une clé
d'origine donne toutes ses alternatives et tous ses changements de
statut — acceptée, refusée pour une cause, pour une autre, de nouveau
acceptée ; « refusé puis accepté » n'en est qu'une lecture.

### Le stockage du détail (D1065–D1068, D1072–D1076)

Le détail des anomalies des enregistrements peut être très volumineux ;
il ne surcharge pas la base :

- **un fichier SQLite par exécution**, daté par son nom (D1066) — la
  migration le déclare par `storage:` (D1072) : le dossier et le nom,
  `${now:yyyy-mm-dd}` évalué à chaque exécution (D1069) ;
- **chiffré** — nativement si possible, sinon après sa création ; la
  rotation des clés (`syncytium rotate`) re-chiffre aussi les fichiers
  existants (D1067) ;
- **retenu** par une règle du `cleanup.yml` de l'environnement (D1073) —
  le mécanisme générique de rétention des fichiers (D1070–D1076) :
  `retention: 90d` par défaut, le fichier échu supprimé ; la base garde
  la ligne d'exécution et ses compteurs ;
- **les données personnelles** (D1065) : à l'échéance, le fichier est
  supprimé entier ; le rapport par mail anonymise les valeurs des champs
  marqués `rgpd:` (D696) ; les interfaces du module montrent les valeurs
  complètes, sous les droits de chacun.

## Le modèle

L'écriture est celle du méta-schéma ([entity.md](entity.md),
[types.md](types.md)) ; les noms sont miens, en proposition (D1021).

```yaml
# _migration/_migration.yml — le module du socle (D666/D1028), au
# préfixe des modules internes (D1029) ; aucune application ne l'écrit
name: _migration
description: Le pilotage et la supervision des reprises de données
# pas d'allow: — la lecture seule par construction (D1030)
entities:
  - ~{migration/migration.yml}              # la migration déclarée
  - ~{passage/passage.yml}                  # la ligne d'exécution
  - ~{passage_source/passage_source.yml}    # le passage par entité source — les compteurs de l'origine
  - ~{passage_cible/passage_cible.yml}      # le passage par entité de destination
  - ~{passage_regle/passage_regle.yml}      # le passage par règle
  - ~{cle/cle.yml}                          # la table des clés d'origine
  - ~{modele/modele.yml}                    # les versions du modèle lu
  - ~{anomalie_modele/anomalie_modele.yml}  # la famille du modèle
  - ~{anomalie/anomalie.yml}                # la famille des enregistrements — au fichier SQLite du passage
```

### `migration` — la migration déclarée

```yaml
name: migration
description: Une migration déclarée (D662), telle que le moteur l'a lue
label: "{nom}"
identity: [nom]                    # la clé de la migration dans reprise.yml
history: true
fields:
  nom:       { type: 'text[..40]', required: true }
  connector: { type: 'text[..40]', required: true }   # le connecteur de la source (D617)
  buffer:    { type: 'text[..40]', required: true }   # le connecteur de la base miroir (D1045)
  mode:      { type: enum, values: { absolute: {}, relative: {} } }   # D671
  reset:     { type: boolean }
  passages:  { type: list of passage }                # un par migrate (D667)
  cles:      { type: list of cle }                    # la table des clés d'origine (D1047)
  modeles:   { type: list of modele }                 # les versions du modèle lu (D1053)
  # ------ Champs calculés ------
  dernier_passage: { type: passage, formula: passages.last() }
```

### `passage` — la ligne d'exécution

```yaml
name: passage
description: Une exécution de migrate — l'état, les horodatages, l'instantané, les compteurs, les indicateurs
label: "{owner} — {debut}"
identity: [debut]                  # au sein de la migration (D841)
history: false                     # un fait : il ne se corrige pas
fields:
  debut:       { type: datetime, required: true }
  fin:         { type: datetime }
  bascule:     { type: datetime }                     # le report des différences (D1041)
  declencheur: { type: enum, required: true,
                 values: { planifie: {}, manuel: {}, api: {} } }
  etat:        { type: enum, required: true,
                 values: { en_cours: {}, reussi: {}, en_erreur: {}, refuse: {}, interrompu: {} } }   # D1079
  cause:       { type: 'text[..400]' }                # l'erreur, le refus, l'interruption
  version:     { type: 'text[..40]' }                 # la version de la configuration exécutée
  fichier:     { type: 'text[..200]' }                # le fichier SQLite du détail (D1066)
  sources:     { type: list of passage_source }
  cibles:      { type: list of passage_cible }
  regles:      { type: list of passage_regle }
  anomalies_modele: { type: list of anomalie_modele }
  # ------ Champs calculés — les indicateurs (D1056/D1060) ------
  completude_schema:
    type: percentage
    formula: sources.sum(colonnes_conformes) / sources.sum(colonnes_decrites) if sources.sum(colonnes_decrites) > 0
  couverture_donnees:
    type: percentage
    formula: sources.sum(sans_erreur) / sources.sum(lues) if sources.sum(lues) > 0
  duree: { type: duration, formula: fin - debut if fin != null }
```

### `passage_source` — les compteurs de l'origine

```yaml
name: passage_source
description: Le passage d'une entité source — la vérification, l'instantané, les compteurs de l'origine (D1048/D1055)
label: "{source}"
identity: [source]                 # au sein du passage
history: false
fields:
  source:     { type: 'text[..40]', required: true }  # le name: du fichier de source/
  debut:      { type: datetime }                      # les phases 1–2
  fin:        { type: datetime }
  lisible:    { type: boolean }                       # false : l'entité n'a pas été lue (D1042/D1053)
  colonnes_chargees: { type: 'list of text[..40]' }   # l'instantané (D1054)
  colonnes_decrites:  { type: 'integer[0..]' }        # la complétude du schéma (D1060)
  colonnes_conformes: { type: 'integer[0..]' }        # décrites, présentes, au type compatible
  total:      { type: 'integer[0..]' }
  filtrees:   { type: 'integer[0..]' }
  hors_plage: { type: 'integer[0..]' }
  lues:       { type: 'integer[0..]' }
  nouvelles:  { type: 'integer[0..]' }
  modifiees:      { type: 'integer[0..]' }            # mises à jour, hash différent (D1049)
  non_modifiees:  { type: 'integer[0..]' }            # mises à jour, hash identique
  supprimees: { type: 'integer[0..]' }                # connues, non relues dans la plage (D1050)
  sans_erreur: { type: 'integer[0..]' }
  avec_erreur: { type: 'integer[0..]' }
```

### `passage_cible` et `passage_regle`

```yaml
name: passage_cible
description: Le passage d'une entité de destination — la phase 5, les compteurs de la destination (D1048)
label: "{entite}"
identity: [entite]                 # au sein du passage
history: false
fields:
  entite:        { type: 'text[..80]', required: true }   # l'adresse module.entité
  debut:         { type: datetime }                        # la phase 5
  fin:           { type: datetime }
  nouvelles:     { type: 'integer[0..]' }
  non_modifiees: { type: 'integer[0..]' }
  modifiees:     { type: 'integer[0..]' }
  supprimees:    { type: 'integer[0..]' }
```

```yaml
name: passage_regle
description: Le passage d'une règle — le mapping et sa validation, l'instantané, les lignes traitées et en erreur (D1048/D1054)
label: "{regle}"
identity: [regle]                  # au sein du passage
history: false
fields:
  regle:        { type: 'text[..80]', required: true }   # le fichier de mapping/, sans extension
  source:       { type: 'text[..40]' }
  cible:        { type: 'text[..80]' }
  debut_mapping:    { type: datetime }                    # la phase 3
  debut_validation: { type: datetime }                    # la phase 4
  fin:          { type: datetime }
  champs_mappes: { type: 'list of text[..80]' }          # l'instantané (D1054)
  validations:   { type: 'list of text[..400]' }
  traitees:     { type: 'integer[0..]' }
  en_erreur:    { type: 'integer[0..]' }
```

### `cle` — la table des clés d'origine

```yaml
name: cle
description: Une clé d'origine — sa partition, son hash, le statut de son dernier traitement (D1047–D1050)
label: "{source} — {valeur}"
identity: [source, valeur]         # au sein de la migration
history: false                     # l'histoire d'une clé = la suite de ses faits (D1059)
fields:
  source:     { type: 'text[..40]', required: true }
  valeur:     { type: 'text[..400]', required: true }    # l'identité de la ligne d'origine, telle quelle
  partition:  { type: 'text[..80]' }                     # la valeur de partition (D1050)
  hash:       { type: 'text[64]' }                       # SHA-256 de la ligne lue (D1049)
  statut:     { type: enum, values: { sans_erreur: {}, avec_erreur: {} } }
  premiere_lecture: { type: datetime }
  derniere_lecture: { type: datetime }
  changement: { type: datetime }                         # le dernier changement de statut
```

### `modele`, `anomalie_modele`, `anomalie`

```yaml
name: modele
description: Une version du modèle lu par le connecteur, pour une entité source (D1053)
label: "{source} — v{version}"
identity: [source, version]        # au sein de la migration
history: false
fields:
  source:     { type: 'text[..40]', required: true }
  version:    { type: 'integer[1..]', required: true }
  date:       { type: datetime, required: true }
  definition: { type: text, required: true }             # le schéma lu : les colonnes et leurs types
  ecart:      { type: text }                             # l'écart avec la version précédente
```

```yaml
name: anomalie_modele
description: Une anomalie du modèle — la complétude, la description, l'entité illisible (D1053/D1057)
label: "{source} — {nature}"
identity: [source, colonne, nature]   # au sein du passage
history: false
fields:
  source:  { type: 'text[..40]', required: true }
  colonne: { type: 'text[..40]' }
  nature:
    type: enum
    required: true
    values:
      completude:         { label: { fr: Colonne du modèle non décrite } }
      description:        { label: { fr: Type décrit non convertible depuis le type lu } }
      colonne_disparue:   { label: { fr: Colonne décrite disparue — entité illisible } }
      identite:           { label: { fr: Identité non respectée — entité illisible } }
  message: { type: 'text[..400]', required: true }
```

```yaml
# au fichier SQLite du passage (D1066) — pas en base : la base n'en garde
# que les comptes du passage
name: anomalie
description: Une erreur d'un enregistrement — une entrée par erreur, un message clair (D1057)
label: "{source} — {cle} — phase {phase}"
history: false
fields:
  source:     { type: 'text[..40]', required: true }
  cle:        { type: 'text[..400]', required: true }    # la clé d'origine (D1047)
  phase:      { type: 'integer[1..5]', required: true }  # les cinq phases (D1040)
  regle:      { type: 'text[..80]' }                     # phases 3–4
  entite:     { type: 'text[..80]' }                     # phase 5
  colonne:    { type: 'text[..80]' }                     # la colonne ou le champ en cause
  validation: { type: 'text[..400]' }                    # la règle de validation en cause
  message:    { type: 'text[..400]', required: true }    # la nature de l'anomalie, pour le rapport
  valeurs:    { type: text }                             # les valeurs en cause
```

## Les rapports (D929, D1058, D1065)

- **L'entité source déclare son `report:`** (D1058) — les anomalies de
  ses phases (1 et 2) vont à ses destinataires ; **la règle déclare le
  sien** (D929) — les anomalies de ses phases (3 et 4) et celles de la
  phase 5 qui portent sur ce qu'elle construit.
- **Sans `report:`**, le défaut de D407 : à la demande, vers
  l'administrateur.
- **Les anomalies du modèle** vont au technicien, par le module.
- **La consolidation** : après chaque passage, chaque destinataire
  reçoit, par ses canaux (`by:`), les anomalies de toutes les sources et
  de toutes les règles qui lui sont adressées, groupées par source ou
  par règle, puis par message ; au rythme du `when:` déclaré (D406).
- **Le rapport n'est pas une entité de plus** : une vue groupée des
  anomalies (D1015), lue dans le fichier du passage.
- **Le mail anonymise** les valeurs des champs `rgpd:` (D1065).

## Les surfaces

Celles du catalogue ([composants.md](composants.md)) sur ces entités
(D666), fournies par le socle sous l'entrée « migrations » du module
d'administration (D711) :

- **le tableau de bord `_migration[suivi]`** — par migration, le
  dernier passage (son état, sa durée), les deux indicateurs en `kpi`
  (D527), leur courbe au fil des passages (`chart.line` — la ligne
  d'exécution sans rétention), les compteurs du dernier passage par
  entité et par règle ;
- **les listes** — les passages ; dans un passage, ses entités sources,
  ses entités de destination, ses règles et leurs compteurs ; les
  anomalies du modèle ; les versions du modèle lu et leurs écarts ; la
  table des clés d'origine (la recherche par clé, par statut, par
  partition) ;
- **le détail d'un passage** — ses anomalies, lues dans son fichier à la
  demande, filtrées par source, règle, phase, message, destinataire ou
  clé, tant que le fichier est retenu ;
- **l'histoire d'une clé** (D1059) — la suite de ses faits, d'un
  passage à l'autre, dans les fichiers retenus ;
- **les formulaires** — la consultation seule (D453).

## Les opérations

- **`migrate`** (D667) — exécute un passage ; se déclenche comme toute
  opération (le bouton, `when:`, `every:`, l'API) ; au degré
  `administrator`, qui passe outre les `allow:` des cibles (D942) — le
  propriétaire d'une migration est toujours l'administrateur (D1030) ;
- **`reset_coverage(<entité>)`** (D881/D900) — remet la dernière valeur
  parcourue d'une entité source au départ : le passage suivant la relit
  en entier ; il n'efface rien du module (D1030) ;
- **un passage à la fois** (D1077, D1080) — l'opération qui trouve un
  passage de sa migration en cours suit `on_running:` : `cancel` (le
  défaut — elle est refusée, tracée), `wait` (elle attend sa fin),
  `interrupt` (elle l'interrompt avant de se lancer) ;
- **l'interruption** (D1077) — l'administrateur peut interrompre un
  passage tant qu'il construit la base miroir, sans toucher l'existant ;
  jamais pendant la bascule ; un redémarrage du serveur vaut
  interruption, la relance est manuelle ;
- **la copie d'un environnement** (D1078–D1080) — `syncytium copy
  <source> <cible>` emporte les données et `_migration` ;
  `--with-storage` emporte aussi les fichiers de détail, re-chiffrés
  sous les clés de la cible ;
- **la sandbox** (D921–D922) — `reload` rejoue l'ingestion et la
  migration : son `_migration` repart de zéro.

## La déclaration d'une migration

Les clés que le module lit sur la migration déclarée
([mapping.md](mapping.md)) :

```yaml
# reprise.yml — une migration déclarée (D662)
legacy_erp:
  connector: legacy_db                  # la source (D617)
  buffer: temporaire                    # la base miroir (D1044/D1045)
  storage:                              # le fichier SQLite de chaque passage (D1066/D1072)
    directory: ${SYNCYTIUM_MIGRATION_DIRECTORY}
    filename: ${now:yyyy-mm-dd}-legacy_erp.syncytium
  mode: relative                        # D671
  reset: false
  source:
    - ~{source/.*\.yml}
  mapping:
    - ~{mapping/[0-9]+_.*\.yml}
  operations:                           # les opérations périodiques (D943)
    delta:
      every: daily[02:00]
      operations: [ migrate ]
    relecture:
      every: weekly[saturday at 23:00]
      on_running: wait                  # D1080 — cancel par défaut
      operations: [ reset_coverage(orders) ]
```

```yaml
# environments/production/cleanup.yml — la rétention du détail (D1073–D1076)
migration_legacy_erp:
  interval: 1d
  directory: ${SYNCYTIUM_MIGRATION_DIRECTORY}
  pattern: '^(?<date>[0-9]{4}-[0-9]{2}-[0-9]{2})-legacy_erp\.syncytium$'
  retention: 90d
```

## Les illustrations

Ce document ne décrit aucune migration en particulier. Le cas 5,
[l'entrepôt](../usecases/05_entrepot.md), en est la première
déclinaison : ce que ses sources, ses règles, ses destinataires et ses
opérations périodiques donnent à voir dans `_migration`.

## Les points ouverts

- **les noms des entités et des champs** du module — en proposition
  jusqu'à la documentation structurée (D1021) ;
- **la suppression à la destination** (D1052) — mes lectures : elle
  inactive (D137), l'enregistrement revient s'il est reconstruit ; la
  plage se reporte sur la destination par le champ qu'alimente la
  colonne de partition ;
- **l'orphelin d'une référence qu'aucune règle n'utilise** (D1040) — ma
  lecture : l'enregistrement passe, l'orphelin reste relevé ;
- **le hash de la ligne d'origine** (D1049) — mes conditions : une forme
  canonique (les colonnes ordonnées par leur nom, chaque valeur
  délimitée, le nul distinct du vide), sur les colonnes lues ;
- **le chiffrement natif du fichier SQLite** (D1067) — à fixer avec
  l'architecture (D1025) : SQLCipher le permet sans déchiffrer le
  fichier entier avant chaque lecture ;
- **la forme exacte des rapports envoyés** — le `template` du catalogue
  (D559–D564), avec l'architecture.
