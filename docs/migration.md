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

[Le chapitre 8](syncytium/08-migration/README.md) dit comment une migration **se décrit** (la
source, les règles, la couverture) ; ce document dit **comment elle
s'exécute et ce qu'il en reste**. Les décisions citées renvoient à la
[conception](conception.md). Les noms des entités et des champs du
module sont en proposition jusqu'à la documentation structurée (D1021).

*Le détail du module rejoindra le chapitre 10, l'administration et
l'exploitation (D2010) : il est trop tôt pour le décrire, ses éléments ne
sont pas tous réunis, et le moteur et son fonctionnement le feront
apparaître. Le chapitre 8 ne décrit que la migration et la reprise dans
leur configuration ; l'exécution d'un passage est au
[chapitre 9](syncytium/09-moteur/04-passage.md) (D1880).*

## Le principe

L'application déclare ses migrations — le connecteur de la source, la
base miroir, le stockage du détail, les descriptions `sources/`, les
règles `mapping/`, les opérations périodiques (D662, D943,
D1044–D1045, D1072). Le moteur les exécute : chaque `migrate` est **un
passage** (D667). Le module garde de chaque passage ce que trois
lecteurs attendent :

| qui | la question | ce qui y répond |
|---|---|---|
| **le concepteur** | où en est l'analyse du système d'origine ? qu'est-ce qui cloche dans sa description ? | le modèle lu et ses versions, la complétude du schéma, les anomalies du modèle |
| **les métiers** — les destinataires que les `report:` nomment | qu'est-ce qui a été refusé, pourquoi, et comment le corriger à l'origine ? | les anomalies des enregistrements, consolidées par destinataire |
| **l'administrateur** | le passage s'est-il bien déroulé ? la qualité progresse-t-elle ? | la ligne d'exécution : l'état, les horodatages, les compteurs, les indicateurs dans le temps |

**La source fait foi** sur ce que les règles alimentent (D1038) : la
correction faite à la main dans la destination sur un champ migré cède
au passage suivant qui relit l'enregistrement — corriger durablement,
c'est corriger à l'origine ; seuls les champs `unmapped:` y échappent
(D941), comme ceux qu'aucune règle n'alimente.

## Le déroulé d'un passage, ce que le module garde

L'exécution d'un passage est décrite au chapitre 9 (D1880, D1881, D2130) :
[l'exécution d'un passage](syncytium/09-moteur/04-passage.md) — le déroulé,
les cinq phases, la base miroir et la transaction, la comparaison, le cache — et
[ce qu'un passage laisse](syncytium/09-moteur/05-suivi.md) — la table des clés
d'origine, le modèle lu, la ligne d'exécution, les compteurs, les indicateurs,
les anomalies, le détail et sa rétention, les rapports. Ce document garde le
module lui-même : son modèle, ses surfaces, ses opérations.

*Tranché à la lecture du chapitre 9* (D2164) : le détail des anomalies,
exhaustif, vit dans des fichiers du dossier interne ; les statistiques et
les indicateurs vivent en base ; la base miroir est un storage. Plus bas
dans ce document, le champ `fichier` du passage et l'en-tête de l'entité
`anomalie` disent donc un fichier, à raison ; ce n'est plus le fichier
SQLite de D1066, mais un fichier au format d'un journal, chiffré après la
migration (D2171). Le champ `buffer` de la migration déclarée, lui,
attend la relecture du modèle, au chapitre 10 (D1891, D2010).

## Le modèle

L'écriture est celle du méta-schéma ([entity.md](syncytium/02-modele/02-entite.md),
[05-types.md](syncytium/02-modele/05-types.md)) ; les noms sont miens, en proposition (D1021).

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
identity: [nom]                    # la clé de la migration dans migration.yml
history: true
fields:
  nom:       { type: 'text[..40]', required: true }
  from:      { type: 'text[..40]', required: true }   # la base d'origine — son connecteur (D1087)
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
  duree: { type: duration, formula: fin - debut if fin is not null }
```

### `passage_source` — les compteurs de l'origine

```yaml
name: passage_source
description: Le passage d'une entité source — la vérification, l'instantané, les compteurs de l'origine (D1048/D1055)
label: "{source}"
identity: [source]                 # au sein du passage
history: false
fields:
  source:     { type: 'text[..40]', required: true }  # le name: du fichier de sources/
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
  message:    { type: 'text[..400]', required: true }    # la nature de l'anomalie, le gabarit résolu (D1106)
  valeurs:    { type: text }                             # les valeurs en cause
```

## Les surfaces

Celles du catalogue ([les composants](syncytium/04-composants/README.md)) sur ces entités
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
- **la copie d'un environnement** (D1078–D1080) — `syncytium copy
  <source> <cible>` emporte les données, `_migration` et `_assistance` (D1387) ;
  le détail des passages suit, dans le module `_migration` (D1894) ;
  l'option `--with-storage` est retirée avec les fichiers de détail
  (D1893) ;
- **la sandbox** (D921–D922) — `reload` rejoue l'ingestion et la
  migration : son `_migration` repart de zéro.

## La déclaration d'une migration

Les clés que le module lit sur la migration déclarée
([la migration déclarée](syncytium/08-migration/02-declaration.md)) :

```yaml
# migration.yml — une migration déclarée (D662)
legacy_erp:
  from: legacy_db                       # la base d'origine (D1086–D1087)
  mode: relative                        # D671 — relative par défaut (D1889)
  reset: false                          # false par défaut (D1889)
  sources:
    - ~{sources/.*\.yml}
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

La base miroir ne se déclare pas dans un processus : elle sert leur
enchaînement, se déclare dans le fichier de l'environnement par
`mirror:`, et vaut un connecteur `memory` par défaut (D1889–D1892).

## Les illustrations

Ce document ne décrit aucune migration en particulier. Le cas 5,
[l'entrepôt](../usecases/05_entrepot.md), en est la première
déclinaison : ce que ses sources, ses règles, ses destinataires et ses
opérations périodiques donnent à voir dans `_migration`.

## Les points ouverts

- **les noms des entités et des champs** du module — en proposition
  jusqu'à la documentation structurée (D1021) ;
- **la forme exacte des rapports envoyés** — le `template` du catalogue
  (D559–D564), avec l'architecture.

## La documentation — la facette du module `_migration` (D1158–D1159)

*(La rubrique de la matrice de [documentation.md](documentation.md)
§13 ; la colonne 1 — la fonctionnelle — remplie, les autres à leur
rang.)*

**Le module `_migration`, dans la fonctionnelle** : rien — un module
interne du socle (D1029), sous le menu d'administration (D711), que les
applications n'exposent pas (D1028) ; ses surfaces et ses scénarios
relèvent du guide d'exploitation (D1206). Son effet sur la fonctionnelle
passe par les entités de l'application : les champs « repris de
l'ERP » (D1198), les opérations à `when: migrated` (D1227), les
anomalies dans la zone d'analyse d'un champ (D1216).

**Le module `_migration`, dans le dictionnaire de la donnée** (D1302 —
le rang 2, le chapitre 4.1 « Reprise des données », D1259/D1262) : six
sections, en deux parts — **le déclaré**, calculable au dépôt : la
migration déclarée (`migration.yml` — la base d'origine, la base miroir,
le mode, le rythme des passages pour la fraîcheur) ; **les sources**
(`sources/*.yml` — par table d'origine sa description, son périmètre, son
identité et sa partition, ses colonnes lues avec le type lu et le type
décrit, ses colonnes écartées avec leur motif, les colonnes non citées
relevées) ; **les règles** (`mapping/*.yml` — par règle, dans l'ordre :
la source, la cible, le périmètre, les champs mappés et leurs
transformations, le rapport et ses destinataires) ; **le graphe source →
cible dans les deux sens** (D1186 — par colonne d'origine les champs
qu'elle alimente, par champ cible « repris de … par la règle … », l'écho
de la ligne du champ en partie 2, D1198 ; le même objet que l'index 5.1
lu depuis l'autre bout, un seul calcul) ; **l'observé**, à l'instance
seulement, aux droits du lecteur (D1249) : **le modèle lu et ses
versions** (D1053 — la version courante du modèle de la source, ses
écarts, les anomalies de complétude et de description) ; **les
passages** (le dernier passage, la couverture et la complétude D862, la
table des clés d'origine par statut D1047, le refusé non enregistré et
ses motifs D1032). **Quand les modules sont fermés à l'écriture**, la
description de la reprise le met en clair : les données n'entrent que
par elle, et le chapitre des imports (4.2) y renvoie (D1312). **La
frontière** : le dictionnaire dit d'où vient la donnée et où en est la
correspondance ; le guide d'exploitation (D1206)
dit comment lancer `migrate` et `reset_coverage`, lire les rapports,
régler la rétention — les rapports ne sont pas dans le dictionnaire,
leurs comptes par statut si. Les entités du module (migration, passage,
clé, anomalie…) sont des tables de Syncytium : leur structure au
chapitre 3 (D1292), leurs données ici. Une version sans reprise n'a pas
de chapitre 4.1 ; une version à plusieurs migrations, une section par
migration.

**Le module `_migration`, dans la réglementation** (la colonne 5 — le
rang 3) : **la reprise est un traitement d'origine** du registre, par
règle, quand elle écrit un champ marqué (D1317, D1344) ; **le rapport
des anomalies par mail est un destinataire externe**, même anonymisé
(D1065, D1344) ; le détail des passages à rétention, par `retention:`
de la base miroir (D1334, D1892) ; la provenance de chaque champ marqué par le graphe source →
cible, dans la mention et dans la documentation (D1335).

**Le module `_migration`, dans le projet et le support** (la colonne 8
— le rang 4) : rien — `_assistance` est son pendant pour les tickets
(D1363, D1368) : un module interne, ses tables au storage, ses données
à l'instance (D1157).

**Le module `_migration`, dans la documentation du développeur** (la
colonne 3 — le rang 5) : rien — ses entités ne sont pas exposées à
l'API du technicien ; `migrate` et `reset_coverage` sont des commandes
du guide d'exploitation.

**Le module `_migration`, dans le D.A.T.** (la colonne 4 — le rang 6) :
emporté par la copie d'un environnement (D1078, D1387) — la relation
production vers staging du chapitre 2 (D1427) ; le détail des passages
et sa rétention, par la base miroir (D1892).

**Le module `_migration`, dans le guide d'exploitation** (la colonne 9
— le rang 7) : il donne au guide ses passages et leurs rapports
(D1302), ses commandes `migrate` et `reset_coverage`, l'état du dernier
passage au tableau de bord (D1452) ; emporté par la copie d'un
environnement (D1078).

**Le module `_migration`, dans la maintenance, les risques et les
améliorations** (la colonne 7 — le rang 8) : la famille « la reprise »
des risques (D1490) — la couverture et les compteurs, les anomalies et
les rejets des passages et leur tendance — et, dans la famille « la
version », le rapport du dernier dry-run de migration (D7–D9) ; servie à
partir de `manager` (D1493).

**Le module `_migration`, dans la promotionnelle** (la colonne 6 — le
rang 9) : rien — absent de la plaquette ; dans la démonstration, le jeu
de données entre par l'import (D1504), non par `_migration`.

**Les neuf colonnes sont écrites.**
