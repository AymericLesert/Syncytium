# Le module `_migration` de Syncytium

Ce document décrit **le module `_migration`**, celui que le socle porte
pour suivre la mise à jour d'un entrepôt ou la reprise d'un existant :
ce qu'il stocke, ce qu'il calcule, ce qu'il montre, ce qu'il envoie.
**Le module est présent dans Syncytium ; ce n'est pas aux applications
de l'exposer** (D1028) — aucune configuration ne le déclare, il naît
avec le moteur (D666 : « le socle premier client », D408/D416) et
s'active dès qu'une version déclare `migrations:` (D662/D711). Son nom
porte **le préfixe `_` des modules internes** (D1029 : « le préfixe _
marquera les modules internes. Pour les modules d'application,
Syncytium refusera l'usage de _ comme premier caractère ») — ses
adresses s'écrivent `_migration.passage`, `_migration[suivi]`. Il ne
remplace aucun artefact : [mapping.md](mapping.md) dit comment une
migration se décrit (la source, les règles, la couverture), ce
document dit **ce qu'il en reste après chaque passage**. Les décisions
citées renvoient à la [conception](conception.md). Les noms des
entités et des champs sont, jusqu'à la documentation structurée
(D1021), en proposition.

## La doctrine

1. **Le socle premier client** (D408/D416/D666) : le module est décrit
   dans la grammaire du méta-schéma comme n'importe quel module, avec
   les mêmes types, les mêmes surfaces, le même historique — Syncytium
   se sert de lui-même. Ce qui suit est sa description, pas une
   configuration à copier.
2. **Rien à exposer, rien à confondre** (D1028/D1029) : le nom
   `_migration` est du socle, comme `_administration` et `_chat` ; une
   application ne peut pas nommer un module par `_` ; elle déclare ses migrations
   (`migrations:` dans `version.yml`, `reprise.yml` — D662) ; le module
   les observe. Ni `module.yml` à écrire, ni entité à nommer, ni
   surface à composer : tout est là, sous le menu d'administration
   (D711 — l'entrée « migrations », conditionnelle).
3. **Le rapport reste à la règle** (D929) : « chaque règle de
   migration a un report. Pas un report général. » Le module ne
   décide pas qui reçoit quoi ; il **consolide** ce que les règles ont
   déclaré (`report: { when, to, by }` — D406/D945).
4. **Les trois temps de la validation font les rejets** (D932/D1006) :
   sur la source à la lecture, sur le mapping, sur la destination —
   chaque refus est un rejet daté, situé, attribué.
5. **Trois taux, deux grains** (D861–D862) : la complétude du schéma
   et la couverture du schéma se mesurent sur les entités sources ; la
   couverture des données se mesure sur les règles ; les trois sont
   des données du modèle — consultables, filtrables, exportables — et
   historisées (D668) : la qualité se lit dans le temps.
6. **Ce qui va au technicien et ce qui va aux métiers** (D929/D945) :
   les rejets vont aux destinataires des règles (la production, le
   commercial, les achats du cas 5) ; les anomalies — le schéma,
   l'identité, les liens — vont au technicien, par le module.
7. **La lecture seule par construction** (D1030) : « le module est en
   lecture seule par construction car c'est le moteur qui alimente. Les
   utilisateurs ne peuvent pas modifier le contenu traité par ce module »
   — un `allow:` y serait possible, mais sans intérêt : l'entrée vit sous
   le menu d'administration (D711), seuls les administrateurs y accèdent.
   La migration, elle, **enrichit les tables de l'application**, et son
   propriétaire est toujours l'administrateur (D942 : l'écriture par le
   degré `administrator`, qui passe outre les `allow:` des cibles).

## Le modèle

Six entités, un module. L'écriture est celle du méta-schéma
([entity.md](entity.md), [types.md](types.md)) ; les commentaires
citent les décisions.

```yaml
# _migration/_migration.yml — le module du socle (D666/D1028), au
# préfixe des modules internes (D1029) ; aucune application ne l'écrit
name: _migration
description: Le suivi des migrations — les passages, la couverture, les rejets, les anomalies
# pas d'allow: — le module est en lecture seule par construction : le moteur
# seul l'alimente, les administrateurs le consultent (D1030)
entities:
  - ~{migration/migration.yml}
  - ~{passage/passage.yml}
  - ~{source/source.yml}
  - ~{regle/regle.yml}
  - ~{rejet/rejet.yml}
  - ~{anomalie/anomalie.yml}
```

### `migration` — la déclaration observée

```yaml
name: migration
description: Une migration déclarée — reprise.yml (D662), telle que le moteur l'a lue
label: "{nom}"
identity: [nom]                    # la clé de reprise.yml : cegid, legacy…
history: true                      # l'évolution de la qualité dans le temps (D668)
fields:
  nom:         { type: 'text[..40]', required: true }
  connector:   { type: 'text[..40]', required: true }       # le connecteur source (D617)
  mode:        { type: enum, values: { absolute: {}, relative: {} } }   # D669/D671
  reset:       { type: boolean }
  sources:     { type: list of source }                    # une par fichier de source/ (D947)
  regles:      { type: list of regle }                     # une par fichier de mapping/ (D665)
  passages:    { type: list of passage }                   # un par migrate (D667)
  # ------ Champs calculés ------
  completude_schema:  { type: percentage, formula: sources.avg(completude_schema) }   # D862
  couverture_schema:  { type: percentage, formula: sources.avg(couverture_schema) }
  couverture_donnees: { type: percentage, formula: regles.avg(couverture_donnees) }
  dernier_passage:    { type: passage, formula: passages.last() }   # le tri porté par la liste (D997/D1017)
```

### `passage` — chaque `migrate`

```yaml
name: passage
description: Une exécution de migrate (D667) — le déclencheur, l'état, les comptes, les cinq blocs
label: "{owner} — {debut}"
identity: [debut]                  # au sein de la migration (D841)
history: false                     # le passage est un fait, il ne se corrige pas
fields:
  debut:        { type: datetime, required: true }
  fin:          { type: datetime }
  declencheur:  { type: enum, required: true,
                  values: { planifie: {}, manuel: {}, api: {} } }   # every:, le bouton, l'API (D667)
  etat:         { type: enum, required: true,
                  values: { en_cours: {}, reussi: {}, en_erreur: {} } }
  # --- les comptes globaux ---
  lus:          { type: 'integer[0..]', default: 0 }
  integres:     { type: 'integer[0..]', default: 0 }
  rejetes:      { type: 'integer[0..]', default: 0 }
  # --- les cinq blocs de la comparaison (D878) ---
  anomalies:     { type: 'integer[0..]', default: 0 }
  creations:     { type: 'integer[0..]', default: 0 }
  modifications: { type: 'integer[0..]', default: 0 }
  inchanges:     { type: 'integer[0..]', default: 0 }
  suppressions:  { type: 'integer[0..]', default: 0 }
  # --- ce que le passage a produit ---
  comptes:      { type: list of compte }          # les comptes par règle — la cellule ci-dessous
  rejets:       { type: list of rejet }
  anomalies_relevees: { type: list of anomalie }
  # ------ Champs calculés ------
  duree:        { type: duration, formula: fin - debut if fin != null }   # D838
  rejets_par_destinataire:                         # la consolidation (voir plus bas)
    type: 'list of [destinataire: groupe]'
    formula: rejets.group(destinataire).count()    # le group by (D1015)
```

Le compte d'une règle pour un passage est **une cellule** : le passage
en porte une par règle (`compte`), avec les mêmes sept nombres — lus,
intégrés, rejetés, les cinq blocs. C'est le grain de la courbe par
règle ; le grain global est le passage lui-même.

### `source` — l'entité source et sa couverture

```yaml
name: source
description: Une entité source décrite (D947) — la table réelle, les colonnes, les lignes, la couverture
label: "{nom}"
identity: [nom]                    # le name: du fichier de source/ (l'alias compris — D966)
history: true                      # la complétude qui monte au fil de l'analyse (D868)
fields:
  nom:               { type: 'text[..40]', required: true }
  table:             { type: 'text[..40]', required: true }   # la table réelle (alias: — D966)
  colonnes_schema:   { type: 'integer[0..]' }   # le schéma réel (get_schema — D629/D653)
  colonnes_decrites: { type: 'integer[0..]' }   # lues et typées (D947)
  colonnes_ignorees: { type: 'integer[0..]' }   # citées ignored, avec motif (D657/D947)
  colonnes_non_lues: { type: 'integer[0..]' }   # absentes de la description — relevées (D947)
  lignes_table:      { type: 'integer[0..]' }   # les lignes de la table, hors filter: (D663)
  lignes_integrees:  { type: 'integer[0..]' }
  couverture:        { type: 'text[..80]' }     # la déclaration coverage: (D880) — MVCJMVT[month - 3]
  derniere_valeur:   { type: 'text[..40]' }     # la dernière valeur parcourue (D879)
  # ------ Champs calculés ------
  completude_schema:                          # D862 — les décrites ou ignorées sur le schéma réel
    type: percentage
    formula: (colonnes_decrites + colonnes_ignorees) / colonnes_schema
  couverture_schema:                          # D862 — les migrées seules ; les ignorées à part
    type: percentage
    formula: colonnes_decrites / colonnes_schema
```

### `regle` — la règle et sa couverture des données

```yaml
name: regle
description: Une règle de mapping (D665) — la source, la cible, le rapport, la couverture des données
label: "{fichier}"
identity: [fichier]                # 020_commandes_ventes
history: true
fields:
  fichier:      { type: 'text[..80]', required: true }
  source:       { type: source, required: true }         # la référence (D396)
  cible:        { type: 'text[..80]', required: true }     # commande.commande_vente
  filtre:       { type: 'text[..200]' }
  destinataires: { type: association with groupe }       # le to: du report: (D929/D945)
  canaux:       { type: 'list of text[..20]' }           # le by: — notification, mail
  # ------ Champs calculés ------
  couverture_donnees:                         # D861 — les intégrées sur les lignes de la source
    type: percentage
    formula: source.lignes_integrees / source.lignes_table if source.lignes_table > 0
  dernier_compte: { type: compte, formula: owner.passages.last().comptes.first(regle = me) }
```

### `rejet` — l'enregistrement refusé

```yaml
name: rejet
description: Un enregistrement que la cible refuse (D177/D932) — situé, daté, attribué
label: "{regle} — {identite}"
identity: [regle, identite, etage]             # au sein du passage
history: false
fields:
  regle:        { type: regle, required: true }
  identite:     { type: 'text[..200]', required: true }    # l'identité construite (D930), telle quelle
  etage:        { type: enum, required: true,
                  values: { source: {}, mapping: {}, destination: {} } }   # les trois temps (D1006)
  champ:        { type: 'text[..80]' }                     # le champ en cause
  message:      { type: 'text[..400]', required: true }    # ce que la validation a dit (D307)
  bloc:         { type: enum, values: { anomalie: {}, suppression: {} } }   # jamais une création (D878)
  # ------ Champs calculés ------
  destinataire: { type: groupe, formula: regle.destinataires.first() }   # hérité de la règle (D929)
  corrige:      { type: boolean, formula: owner.owner.passages.last().rejets.exists(identite = me.identite) = false }
                # absent du dernier passage : corrigé à l'origine, rejoué par l'identité (D654)
```

### `anomalie` — ce qui revient au technicien

```yaml
name: anomalie
description: Une anomalie de la source — le schéma, l'identité, le lien (D861/D871/D875)
label: "{nature} — {objet}"
identity: [nature, objet]                      # au sein du passage
history: false
fields:
  nature:
    type: enum
    required: true
    values:
      table_non_decrite:   { label: { fr: Table du schéma absente de source/ } }     # D861
      colonne_non_decrite: { label: { fr: Colonne du schéma absente de source/ } }   # D861/D947
      identite_en_doublon: { label: { fr: Identité en doublon sur les données } }    # D871
      lien_sans_cible:     { label: { fr: Lien sans cible — l'orphelin isolé } }     # D874/D875
  objet:   { type: 'text[..200]', required: true }   # la table, la colonne, l'identité, le lien
  detail:  { type: 'text[..400]' }
```

Le lieu né inactif d'un mouvement ou d'un niveau (D962/D1008) **n'est
pas une anomalie** : c'est une donnée du référentiel, née au défaut
(D941), visible dans ses listes.

## Les trois taux (D861–D862)

| le taux | le grain | la formule | ce qu'il dit |
|---|---|---|---|
| **la complétude du schéma** | la source | (décrites + ignorées) / colonnes du schéma | l'analyse a-t-elle tout regardé ? cent pour cent quand chaque colonne est décrite ou déclarée ignorée ; l'écart = les anomalies du schéma |
| **la couverture du schéma** | la source | décrites / colonnes du schéma | ce qui est migré ; les ignorées à part, « l'exclusion assumée, jamais comptée comme couverte » |
| **la couverture des données** | la règle | lignes intégrées / lignes de la source | ce qui est entré ; les rejets creusent l'écart ; le `filter:` hors taux (D663) |

Les taux d'une migration sont les moyennes de ses sources et de ses
règles ; **l'historique** (D668) en fait des courbes : la complétude
qui monte au fil de l'analyse (D868), la couverture des données qui
monte au fil des corrections à l'origine.

## La consolidation des rapports (D929/D945)

Le rapport n'est pas une entité de plus : c'est **une vue des rejets**,
groupée (D1015). Après chaque passage :

- **par destinataire** — chaque groupe nommé par un `report: to:`
  reçoit, par les canaux déclarés (`by: [notification, mail]`), les
  rejets de toutes les règles qui lui sont adressées, groupés par
  règle puis par cause : `rejets.group(destinataire, regle, message)` ;
  au cas 5, chaque matin après le `migrate` de la nuit (D943/D945) —
  la production reçoit la technique et le stock, le commercial les
  ventes et les clients, les achats les achats et les fournisseurs ;
- **par passage** — le technicien reçoit le tableau du passage : les
  comptes, les cinq blocs, les anomalies, la variation des trois taux
  depuis le passage précédent ;
- **le rejet corrigé** à l'origine disparaît du passage suivant (le
  rejeu par l'identité, D654/D930) — le calculé `corrige` le marque,
  l'historique le garde.

Le `when:` du `report:` reste celui de la règle (D406) ; le module ne
crée pas de rythme propre.

## Les surfaces

Celles du catalogue ([composants.md](composants.md)) sur ces entités
(D666), fournies par le socle sous l'entrée « migrations » du module
d'administration (D711) :

- **le tableau de bord `_migration[suivi]`** — les trois taux en `kpi`
  (D527, les seuils de couleur D467), la courbe des taux au fil des
  passages (`chart.line`, l'historique D668), les rejets du dernier
  passage par règle en `chart.bars`, le dernier passage en résumé ;
- **les listes** — les passages (l'état, les comptes, la durée), les
  rejets (la recherche par règle, par destinataire, par étage, par
  cause — le drill-down D242 depuis le tableau de bord), les
  anomalies (par nature), les sources avec leurs comptes et leurs
  deux taux, les règles avec leur couverture ;
- **les formulaires** — la consultation seule (D453) : le passage et
  ses cellules par règle, le rejet et son message.

## Les opérations

- **`migrate`** (D667) — exécute une migration déclarée ; se déclenche
  comme toute opération (le bouton, `when:`, `every:`, l'API) ; crée
  un passage ; la relance = la ré-exécution, le rejeu par l'identité ;
  le dry-run = le preview suspendu avant commit (D594) ;
- **`reset_coverage(<entité>)`** (D881/D900/D1030) — réinitialise la
  couverture d'une entité source (la dernière valeur parcourue repart du
  début) : le prochain passage la relit en entier ; « réinitialise des
  parties du module mais n'efface pas son contenu » — les passages, les
  rejets, les taux historisés restent ; le degré `administrator` ;
- en sandbox (D921–D922), `reload` rejoue l'ingestion et les passages
  repartent de zéro.

## Ce que le cas 5 donne à voir

Sur Cegid PMI ([../usecases/05_entrepot.md](../usecases/05_entrepot.md)) :
une migration, `cegid`, en mode `relative` sans `reset` ; vingt-trois
sources (seize lues, sept ignorées en bloc — les offres, le devis, les
libellés) sur trois cent trente objets du schéma ; vingt-neuf règles
en vingt-cinq étapes ; deux opérations périodiques — `delta_nocturne`
chaque nuit, `relecture_complete` le samedi ; trois destinataires —
la production, le commercial, les achats. La complétude du schéma dit
ce que l'analyse a couvert ; la couverture des données, ce que
l'entrepôt reçoit chaque matin.

## Les points ouverts

- les noms des entités et des champs — en proposition jusqu'à la
  documentation structurée (D1021) ;
- le compte par règle et par passage — une cellule du passage ici ; le
  moteur pourra préférer l'historique de la règle (D668) ;
- la forme exacte des rapports envoyés (le gabarit du mail, la
  notification) — le `template` du catalogue (D559–D564), à fixer
  avec l'architecture (D1025).
