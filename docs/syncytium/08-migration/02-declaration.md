# La migration déclarée

> **Un processus de migration** est une entrée de `migration.yml`. Le
> fichier décrit et nomme les processus, un par connecteur d'origine ; ils
> s'exécutent dans l'ordre alphabétique de leurs noms
> ([glossaire](../../glossaire.md)).

Ce fichier dit ce que le concepteur déclare pour une migration : le
processus, sa forme courte, ses fichiers et leur ordre, son mode, sa base
miroir, son rythme. Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [Le processus](#le-processus)
- [La forme courte](#la-forme-courte)
- [Les fichiers et leur ordre](#les-fichiers-et-leur-ordre)
- [Le mode et la remise à zéro](#le-mode-et-la-remise-à-zéro)
- [La base miroir](#la-base-miroir)
- [Le rythme et les opérations](#le-rythme-et-les-opérations)

## Le processus

« Une migration peut faire converger plusieurs sources vers une
seule destination — le `from:` seul ne suffit pas. » **Le setting
décrit chaque migration** — le mot dit ici la configuration de la
migration, non le bloc `settings` (D1888) — : le lien { connecteur
storage source · descriptions des entités sources · mapping }.
**Un processus de migration se définit pour un connecteur
d'origine** (D1888) : `from:` le nomme, et plusieurs sources font
plusieurs processus, que `migration.yml` décrit et nomme. Une règle
peut tout de même appeler un autre connecteur que ce `from:`, par son
nom, dans une formule : le processus garde une seule origine (D1961). **Ils
s'exécutent dans l'ordre alphabétique de leurs noms** (D1888) : le
concepteur ordonne ses processus selon sa logique, qui ne se déduit
pas des données (D1905) ; avec une seule source, le nom peut être
celui du connecteur. **L'ordre des
entités sous `sources:` n'a pas d'importance** (D1903) : Syncytium
construit le graphe de dépendance des sources. La validité du graphe
se mesure à la fin de la lecture complète des entités sources du
processus (D1905), parce que les références
peuvent former des cycles, comme dans la nomenclature. La déclaration
se lit par la même logique que les règles sous `mapping:` — la liste
de haut en bas, un motif trié sur le chemin complet de ses fichiers
(D1900, D1902) —, sans que cet ordre change le passage. Le concepteur
peut numéroter ses sources pour la lisibilité ; Syncytium réordonne
les éléments de façon naturelle, par le graphe (D1904).

```yaml
# migration.yml — les migrations déclarées
migrations:
  legacy_erp:                       # l'ordre alphabétique des noms = l'ordre d'exécution
    from: legacy_db                 # la base d'origine — le connecteur storage source
    sources:
      - ~{legacy_db/sources/.*\.yml} # un fichier par entité — le regex, la référence explicite
    mapping:
      - ~{legacy_db/mapping/.*\.yml}   # un fichier par règle de migration
  old_crm:
    from: crm_db
    sources:
      - ~{old_crm/sources/.*\.yml}
    mapping:
      - ~{old_crm/mapping/.*\.yml}
```

*Les décisions de cet exemple : D662/D664, D1888, D1086–D1087, D806, D956.*

## La forme courte

**La forme courte d'un processus** (D1895, D1896) sert la reprise un
pour un. Un storage sait se décrire : `get_instance()` rend ses entités
et leurs champs (D1299) ; pour un CSV, ce sont les entités de la carte
`entities:`, et la ligne d'entête nomme les colonnes (D829, D845). Cette
description s'exploite par un mapping champ à champ. Le processus
s'écrit alors en une valeur, le nom du connecteur d'origine :

```yaml
# La migration legacy
# La reprise un pour un : le connecteur se décrit, chaque entité alimente l'entité du modèle de même nom, chaque
# colonne le champ de même nom.
legacy: fichier_csv
```

Cette forme associe toutes les entités du connecteur `fichier_csv` au
storage de l'application. Pour ne nommer que l'entité concernée par le
processus, elle s'écrit entre crochets :

```yaml
# La migration legacy
# La reprise de la seule entité client du connecteur.
legacy: fichier_csv[client]
```

Une liste d'entités se note entre les mêmes crochets, la virgule pour
séparateur (D1897) :

```yaml
# La migration legacy
# La reprise de deux entités du connecteur, client et fournisseur.
legacy: fichier_csv[client, fournisseur]
```

Dans un projet minimal, le connecteur lui-même ne se déclare pas
(D2001) : la forme courte nomme la classe, `legacy: csv[personne]`, et
le fichier porte le nom de l'entité, `personne.csv`. C'est le même
défaut que `storage: sqlite` sans bloc `connectors:`. Le dossier du
fichier vient de la variable d'environnement `SYNCYTIUM_CSV_DIRECTORY` ;
par défaut, un fichier CSV est en UTF-8, le point-virgule pour
séparateur, les entêtes en première ligne (D2002). La variable doit
être définie : absente, c'est une erreur de démarrage (D2003). C'est
l'écriture de tiny (le cas 1, `examples/01_tiny/syncytium.yml`), sous sa
version :

```yaml
      migrations:
        legacy: csv[personne]
```

Les règles de la forme courte (D1896) :

- **les deux absences sont indépendantes** : sans `sources:`, le
  connecteur se décrit ; sans `mapping:`, le mapping est champ à champ.
  Le concepteur écrit `sources:` seul pour apporter une précision, un
  `mask:` par exemple ; le processus s'écrit alors en bloc, `from:`
  nomme le connecteur — la forme courte est l'écriture courte de ce
  bloc quand il ne porte que `from:` (D1898) ;
- **la conversion** est portée par le type de destination, celui du
  champ dans le modèle ; sans `mask:`, c'est lui qui convertit la
  valeur lue ;
- **la colonne sans champ de même nom** n'est pas lue ; elle se relève
  à la complétude ; de même la colonne dont le champ de même nom est
  `unmapped:` (D1966) ;
- **le champ sans colonne de même nom** prend sa valeur par défaut sur
  une ligne nouvelle ; sur une ligne modifiée, il garde sa valeur ;
- **le champ requis sans colonne** refuse une ligne nouvelle, jamais
  une ligne modifiée ; le refus va au rapport, en `relative` comme en
  `absolute` (D1898) ;
- **l'ordre des entités** est celui des dépendances du modèle.

## Les fichiers et leur ordre

**La migration référence ses fichiers par patterns** (D664 — le
patron multi-fichiers de D320–D321) : un fichier par entité source,
un fichier par règle de migration ; l'organisation des dossiers est
libre, la déclaration fait foi. **Un fichier peut porter plusieurs
règles**, exécutées dans l'ordre où il les écrit ; un fichier par règle
reste recommandé, pour la lisibilité et la maintenabilité, et le
concepteur choisit (D1940). **Les patterns sont des regex**
(D806 — « plus de personnalisation et de contrôle ») ; le pattern
est une déclaration : le standard d'organisation et de nommage que
le concepteur se fixe — partout où une liste de fichiers se déclare,
il peut remplacer l'énumération. **La référence de fichier est
explicite** (D956) : `~{<fichier ou pattern>}` — la valeur nue est
un littéral, jamais un fichier ; en collection de flux (`[ … ]`)
l'accolade oblige les guillemets, la forme bloc s'impose (D892). **Le versionnement est plein**
(D670) : `sources/` et `mapping/` sont versionnés comme tout le
reste — l'itération d'exploration passe par le bump du build (D323),
le statut `beta/` (D340) et le dry-run qui n'engage rien (D667) ; la
version des règles est consignée à chaque passage dans le module
`migration` (D668). **L'ordre des étapes suit celui de la
déclaration** (D1900) : la liste se lit de haut en bas, et elle peut
alterner des fichiers, des descriptions et des motifs. Une description
est une carte en ligne, écrite sur place (D968, D1905). Les règles
gardent cet ordre, que Syncytium ne réordonne pas : c'est le
concepteur qui le maîtrise (D1905). **Un motif se
trie sur le chemin complet de ses fichiers**, dans l'ordre
alphanumérique, et non sur le seul nom du fichier ; les fichiers triés
s'insèrent à la position du motif dans la déclaration (D665, D1900) —
le préfixe numérique décrit les étapes de la migration :
`001_referentiels.yml`, `002_customers.yml`, `003_orders.yml`. Le tri
compare les caractères, non les nombres : `10_stock` passe avant
`2_tiers` ; pour l'inverse, le concepteur écrit `02_tiers` et
`10_stock` (D1901). Le câblage `from:` (D610) se relit comme le
raccourci du cas à une seule migration.

Une déclaration qui alterne un fichier, un motif et un fichier :

```yaml
  # Les règles
  # Trois déclarations, lues de haut en bas : un fichier, puis un motif, trié sur le chemin complet de ses fichiers
  # et inséré à sa place, puis un fichier.
  mapping:
    - ~{mapping/ouverture.yml}
    - ~{mapping/[0-9]+_.*/[0-9]+_.*\.yml}
    - ~{mapping/cloture.yml}
```

**Les fichiers se rangent par sous-dossier** (D1103–D1104) — par item
fonctionnel : `sources/<module>/<TABLE>.yml` ; **les règles, dans des
dossiers numérotés** — `mapping/<N>_<groupe>/<NN>_<nom>.yml`, les
fichiers numérotés à partir de 1 dans chaque dossier : le numéro du
dossier, puis celui du fichier, font l'ordre des étapes — l'ordre du
chemin ; le motif suit (`~{mapping/[0-9]+_.*/[0-9]+_.*\.yml}`). Au
cas 5 : `1_lieux`, `2_tiers`, `3_technique`, `4_commande`, `5_stock`.

## Le mode et la remise à zéro

Une migration a deux modes (D649) :

- **absolu** — le tout-ou-rien : valide uniquement si toutes les
  règles et transcriptions se déroulent sans erreur — **la bascule**
  d'un système A vers une application Syncytium ;
- **relatif** — **l'entrepôt** : seuls les enregistrements conformes
  sont portés, les erreurs isolées — dans une composition, l'échec du
  parent entraîne ses composants, l'échec d'un composant ne rejette
  que lui (D933) —, le rapport porté par chaque
  règle et de chaque entité source vers son destinataire (D929/D1058
  — à défaut l'administrateur, D407), et **la vue sur les
  indicateurs** — la complétude du schéma, la couverture des données
  (D1056).

La reprise (D175–D179) est le mode relatif du `from:` ; le mode
absolu en est le durcissement pour la bascule définitive — les deux
postures de D180 incarnées.

- **les options de la migration** (D669/D671) : `{ mode: absolute |
  relative, reset: true | false }` — deux propriétés orthogonales :
  `absolute` (le tout-ou-rien de la bascule) / `relative`
  (l'entrepôt — les conformes portés, les erreurs isolées au
  rapport, la composition selon D933) ; `reset: true` **efface le contenu des tables cibles
  avant l'import** (le périmètre de la migration seul — le patron de
  l'exploration répétée) ; elles se définissent par processus de
  migration, **`relative` et `false` par défaut** (D1889) ;

## La base miroir

- **la base miroir** (D1044–D1046) : `mirror:` (D1891) déclare la base
  où la reprise se construit à l'image de la destination ; sa propriété
  `storage:` en nomme le connecteur (D1892) — un storage dans un schéma
  donné, ou la classe `memory` ; les phases de contrôle
  et la comparaison s'y jouent, puis les différences se reportent dans
  la base de l'application ; la base vit le temps de la migration ;
  **elle ne se déclare pas dans un processus de migration**, parce
  qu'elle sert leur enchaînement ; elle se déclare dans le fichier de
  l'environnement (D1890) ; par défaut `storage:` vaut `memory`, la
  classe en mémoire de la famille `storage`, et il se configure pour
  une base très volumineuse (D1889, D1892) ; la clé s'écrit aussi en
  forme courte, `mirror: temporaire` ou `mirror: temporaire[5d]`, la
  rétention entre crochets (D1894) ;
- **le détail d'un passage** (D1889 — remplace `storage:` et le
  fichier SQLite de D1066–D1073) : l'état de la migration et ses
  écarts vivent dans le module `_migration`, partitionné par une
  date ; le nettoyage se fait par cette clé de partition, Syncytium
  l'assure ; la durée gardée est `retention:`, sous `mirror:`,
  quatre-vingt-dix jours par défaut (D1892), le nettoyage à chaque
  début de journée (D1894) ; la ligne d'exécution reste sans délai ;

## Le rythme et les opérations

- **`reset_coverage`** (D881, précisé par D1030/D1037 ; l'opération
  garde son nom quand la clé devient `partition:`, D1930) — l'opération
  du socle qui remet au départ la dernière valeur parcourue d'une
  entité, sans rien effacer du module : le `migrate` suivant relit la
  totalité ; planifiable par `every:` (D434), déclenchable comme
  toute opération (D428) ; le rythme type : le delta en semaine, la
  relecture complète le dimanche par un `reset_coverage` planifié
  dans la nuit de samedi — la vingtième opération du socle, au
  degré `administrator` ; **le rythme se déclare par des opérations
  périodiques** (D943 — pas une clé de la migration) : le bloc
  `operations:` de la migration déclarée porte le delta nocturne
  (`every: daily[02:00]`, `operations: [ migrate ]`) et la relecture
  complète (`every: weekly[saturday at 23:00]`, `operations: [
  reset_coverage(MVTSTO), … ]` — par entité partitionnée), le
  calendaire D434 et la composition des hooks du socle D609 ;
  **`on_running:`** (D1077–D1080) dit ce que fait l'opération quand un
  passage de la migration tourne déjà : `cancel` (le défaut — elle est
  refusée, tracée), `wait` (elle attend sa fin), `interrupt` (elle
  l'interrompt avant de se lancer — jamais pendant la bascule vers la
  cible) ;
- **`migrate`, la dix-huitième opération du socle** (D667 — complète
  D574) : elle exécute une migration déclarée (D662) et **se
  déclenche comme toute opération** (D428/D609) — le bouton
  d'administration, le `when:`, l'`every:` calendaire (le
  différentiel nocturne), l'API ; la relance = la ré-exécution, le
  rejeu sans doublon par la clé fonctionnelle (D654) ; le dry-run
  absolu (D649) = le preview de `migrate` suspendu avant commit
  (D594–D595) — la base miroir comparée, rien de reporté (D1044) ;
  **un passage à la fois** : l'interruption par l'administrateur, hors
  bascule ; le redémarrage vaut interruption, la relance est manuelle
  (D1077) ;
