# La source

> **Une entité source** est une table, un fichier ou une feuille du
> système d'origine. `sources/` la décrit dans la grammaire du
> méta-modèle, colonne par colonne : lue, ou écartée avec son motif
> ([glossaire](../../glossaire.md)).

Ce fichier dit comment une reprise décrit sa source : les deux maisons
de la migration (D652, D653), la description d'une entité source, son
filtre et sa
partition. Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [Les deux maisons](#les-deux-maisons)
- [La description de la source](#la-description-de-la-source)
- [Le filtre et la partition](#le-filtre-et-la-partition)

## Les deux maisons

« La destination est décrite par le méta-modèle. La source doit être
décrite par le méta-modèle également. » À la racine de la version :

- **`sources/`** — la description du modèle d'origine, **table par
  table et colonne par colonne, dans la grammaire de description** ;
  **Syncytium s'assure de la complétude du modèle** : la description
  confrontée au schéma réel (`get_instance` — D629/D680), l'écart
  signalé. **Deux régimes** (D1907) : la reprise analysée, où la
  description est un acte du concepteur — le connecteur sert la
  comparaison, jamais l'écriture (D868) — ; la forme courte, où le
  connecteur se décrit (D1895). **La complétude se porte de la même
  façon dans les deux** : en forme courte, une colonne correspond à
  un champ d'une entité, et la complétude se mesure par les écarts
  entre les deux, d'un CSV vers une base comme d'une base vers une
  autre. Quand les noms diffèrent, comme entre PMI et l'entrepôt, le
  lien ne se fait pas sans mapping : la description de l'origine se
  mesure à la complétude de la source, pour ne rien oublier ;
- **`mapping/`** — les règles de conversion, **table par table, aux
  origines multiples possibles**.

Le typage statique (D581) vérifie les expressions des deux côtés ;
l'exhaustivité (D648) se juge entre deux descriptions du même
langage.

## La description de la source

`sources/` parle **toute** la grammaire (D652), avec trois mots
propres ; **ses `description:` — celles des sources comme celles des
règles de mapping — sont des textes par langue** comme tout texte de
la version (D1474, D1517) : à plusieurs langues, toutes ou l'erreur
d'ingestion ; la banque en porte neuf à traduire (D1502).

- **`ignored`** (D657, D1909) — l'élément **attendu** dans la source
  mais non développé, une entité ou un champ — l'écart
  **volontaire**. Ce n'est pas un type : il s'écrit en forme courte,
  `audit_log: ignored`, `ref_ext: ignored`, ou en bloc, par la
  propriété `ignored: true` — `false` par défaut. **Trois états pour une colonne comme pour une
  table** (D869/D947) : lue (typée), ignorée (citée `ignored`, son
  motif recommandé en description), **non lue** (absente de la
  description — Syncytium la relève au rapport de migration, le point
  à creuser D868) ; la complétude (D861) se mesure au schéma réel, la
  description n'a pas à citer chaque colonne. **Un fichier par entité
  d'origine, au nom de la table** (`sources/ARTICLE.yml`, `name:
  ARTICLE` — D947) — ou au nom de l'entité quand elle est un alias de
  la table (D966) ;
- **la normalisation par champ calculé** (D660) — le nettoyage, la
  casse, le transcodage s'écrivent sur la description de la source
  (`formula:`), et le mapping consomme le champ calculé comme une
  colonne ;
- **la composition, chez le possesseur** (D399, D869, D1913, D1914) :
  la table d'appartenance déclare `list of <fils>` dans un champ qui
  n'est pas une colonne ; le fils ne déclare rien. Quand la convention
  du connecteur (D876 — les colonnes d'identité aux noms identiques)
  ne trouve pas le lien, les crochets le donnent : la colonne du fils,
  puis la colonne du possesseur à laquelle elle se lie (D1915) —
  `LIGNES: 'list of LCOMCLI[LCKTNUMERO: ECKTNUMERO, LCKTPSF:
  ECKTINDICE]'`. Les deux-points obligent YAML aux guillemets autour
  de la valeur ; le champ s'écrit aussi en bloc, `type:` et
  `description:` ; un fils qui référence deux fois son possesseur se
  lie par ses colonnes, plus lisibles que le nom de la référence
  (D1916). Le `parent:` du
  fils, que D931 donnait à la source, en sort : il reste le mot des
  règles de `mapping/`. Le pré-contrôle (D874) compare les valeurs
  brutes. La référence composée se déclare
  colonne par colonne (`NOCTCODECP: ARTICLE.ARKTCODART`, la dépendance
  D648) — les colonnes qui dépendent des champs d'identité d'une même
  entité forment une référence, dans l'ordre de cette identité ;
  **la référence nommée** (D995) : quand la même entité est référencée
  plusieurs fois, chaque référence porte un nom entre crochets — un
  nom libre, sensible à la casse ; l'entrepôt garde les majuscules de
  ses entités sources (D1913) —
  (`NOKTCODPF: ARTICLE[PRODUIT].ARKTCODART`, `NOCTCODECP:
  ARTICLE[COMPOSANT].ARKTCODART`) et les colonnes du même nom forment
  une référence — « un identifiant/alias de ARTICLE qui lie les
  identifiants à fournir pour retrouver la référence » ; la référence
  unique garde la forme simple ; **la référence à l'une de deux
  entités** (D996)
  : quand la colonne peut viser l'une ou l'autre, `ARCTNOFOU1:
  FOURNIS.CLKTCODE or CLIENT.CLKTCODE` — « le premier des 2 qui
  matchent fait le lien » : le `or` sert le contrôle avant la
  migration (D874) ; à l'affectation, le premier trouvé est la valeur
  (D1913).
- **la lecture d'une autre table par un calculé** (D965) — à la
  source, **l'entité décrite est une collection** : un champ calculé
  lit une valeur ou une liste de valeurs dans une autre table par les
  agrégats, la doctrine D887 (« valeur if condition ») et la
  projection D889 inchangées — `first` rend la valeur, `list` la
  liste : ce sont les méthodes qu'une entité porte déjà au modèle,
  aucune fonction n'est inventée pour la source (D1919) ; la valeur
  est typée par la colonne
  (D581), l'absence rend le nul — un fait ; **« la lecture d'une
  entité utilise le filtre défini »** (D966) — on lit l'entité
  décrite, avec son `filter:`, jamais la table nue ; **le moteur met
  en cache** le résultat par entité, expression et valeurs des
  critères le temps d'un passage — « un cache est à prévoir pour
  rendre l'information rapide si les mêmes critères sont appelés
  régulièrement ». Le fonctionnement du cache se décrit au chapitre
  9 ; ici se disent son usage et sa déclaration (D1920). Il n'y a
  qu'un mécanisme de cache, et deux façons de l'utiliser (D1923) :
  le moteur s'en sert lui-même, pour cette lecture ; le concepteur y
  déclare une entrée, dans une règle, par `cache.push`. L'entrée se
  déclare à son premier `push` : il n'y a pas de déclaration
  explicite (D1925). D891 (jamais l'entité entière) reste entier au
  modèle : la source est lue par lots, pas affichée. Le cas 5 : la
  table PARAM « conditionne le fonctionnement de l'ERP et donc des
  données » ;
- **l'alias** (D966) — « la notion d'alias qui permet de nommer une
  entité portant sur la même source avec des filtres différents » :
  plusieurs entités source décrivent la même table, chacune sous son
  nom, avec son filtre, son identité, ses colonnes lues — `alias:
  PARAM_EMPLACEMENTS`, puis `name: PARAM` (D1918) : `alias:` porte le
  nom de l'entité, `name:` celui de la table, et l'alias s'écrit
  avant le nom pour la lisibilité. **L'identifiant de l'entité est
  son alias s'il est défini, sinon son nom** ; le fichier le porte
  (D947) ; la règle du mapping et la lecture D965 nomment l'entité
  par lui, et le filtre vient avec ; la complétude du schéma (D861)
  se mesure sur la table, toutes entités confondues ;

```yaml
# sources/stock/PARAM_EMPLACEMENTS.yml — l'alias : le paramètre 170 de PARAM
alias: PARAM_EMPLACEMENTS

# La table
name: PARAM

# Le périmètre
filter: PAKTSOC = "100" and PAKTNOPAR = "170"

# sources/ARTICLE.yml — lire l'entité depuis un calculé : le filtre 170 vient avec
fields:
  libelle_emplacement_expedition:                 # une valeur — first
    formula: PARAM_EMPLACEMENTS.first(PACTEXT140 if PACTEXT210 = ARCTCODEP + "." + ARCTCODMPL)
  emplacements_actifs:                            # une liste — list
    formula: PARAM_EMPLACEMENTS.list(PACTEXT210 if PACTEXT210 like "^" + ARCTCODEP + "\.")
```

*Les décisions de cet exemple : D966, D1918, D965, D887.*

- **le `filter:`** (D663) — la sélection des enregistrements
  parcourus par la migration (`filter: order_date >= now() - 10y`,
  `filter: company_code = "PARIS"` — le multi-instances d'une entité
  recoupant plusieurs instances) ; **le périmètre déclaré, hors taux
  de couverture** — l'exclu du filtre n'est pas un rejet.

```yaml
# sources/customers.yml — le modèle d'origine, la même grammaire
customers:
  identity: [code]                    # la contrainte d'unicité
  fields:
    code:     text[8]
    name:     text[..60]
    bal_cts:  integer                 # le solde en centimes
    fax:      ignored                 # attendue, non développée
    city_raw: text[..40]
    city:     { formula: upper(trim(city_raw)) }   # la normalisation

# sources/customer_notes.yml
customer_notes:
  fields:
    customer_code: customers.code     # la dépendance déclarée
    text:          text

# sources/audit_log.yml — l'entité attendue mais ignorée
audit_log: ignored
```

*Les décisions de cet exemple : D652, D357, D657, D660, D648/D396.*

**La colonne décrite (D1100–D1101, D1910).** Ce que la documentation
doit porter s'écrit en propriété, pas en commentaire : chaque colonne
lue porte son `type:` ; sa `description:` — le sens de la colonne dans
le système d'origine — est une recommandation, non une obligation :
elle relève de la complétude de la documentation, qui la relève quand
elle manque (D1910) ; le champ qu'elle alimente se lit dans les règles,
il ne se redit pas ; une colonne écartée s'écrit en forme courte,
`<colonne>: ignored`, ou en bloc, `ignored: true` et son motif en
description ; une table écartée de même, son nom en clé, `ignored: true`
et sa description sous lui (D1909, D1911).
**Une colonne à codes** — trois codes ou plus — **décrit ses codes en
tableau Markdown**, une ligne par code et son libellé, dans un scalaire
littéral (`description: |`) ; à deux codes, une phrase suffit (D1102).
Avec une seule langue (`languages:` de la version), la description est
un texte simple :

```yaml
# sources/customers.yml
fields:
  code:
    type: text[6]
    description: Le code du client.
  legacy_ref:
    ignored: true
    description: Une référence de l'ancien système, sans usage.

# sources/audit_log.yml — la table écartée, en bloc
audit_log:
  ignored: true
  description: Le journal d'audit de l'ancien système, hors du périmètre.
```

## Le filtre et la partition

- **le `filter:`** (D663, confirmé) : les enregistrements hors
  filtre ne sont ni des rejets ni de la couverture — le périmètre
  déclaré.
- **la lecture de l'origine**
  se règle par `partition:` sur l'entité source (D1929 — la clé
  s'appelait `coverage:`, qui se lisait comme un taux ; le mot est
  celui de l'entité du modèle, où `partition:` découpe la table,
  D1293 ; à la source, le crochet porte en plus la plage relue) —
  **la clé de la
  partition** (distincte de l'`identity:` si besoin : Syncytium
  garde, par clé d'origine, sa valeur de partition et un hash qui
  compte les lignes modifiées — D1047–D1050 —, et la dernière valeur
  parcourue, pour reprendre depuis la dernière lecture) et **la plage de valeurs** (une
  période sur une date ; sur un numéro, un nombre de valeurs
  distinctes : `LCKTNUMERO[10000]` relit les dix mille derniers
  numéros distincts, non les dix mille dernières lignes, pour ne pas
  couper une commande — D1927) ; **sans `partition:`, la totalité est relue** —
  **l'état se relit en entier, le journal se partitionne** (D1013 : le
  niveau de stock, « au plus 200 000 lignes… sans surcoût », sans
  `partition:` ni `history:`, les mouvements portant l'histoire ; les
  mouvements, « plusieurs millions de lignes », `partition:` et
  `reset_coverage` à paramétrer) ; `filter:` reste le périmètre jamais lu ; **le traitement des
  écarts se lit sur la destination** — `history:` présent, ils
  complètent et l'historique les garde ; absent, ils remplacent ;
  **la forme courte, au crochet** (D880) — la nature puis la plage
  en retrait, ou la plage seule ; la liste pour plusieurs champs
  de partition ; **la forme riche** (D879) — la carte des champs,
  chacun avec `value:` (la nature) et `range:` (la plage) —
  équivalente :

```yaml
# sources/stock/MVTSTO.yml — la forme courte
partition: MVCJMVT[month - 3]          # la partition au mois, les trois derniers relus

# sources/commande/ECOMCLI.yml
partition: ECKTNUMERO[10000]           # les dix mille derniers numéros distincts

# la forme riche, équivalente
partition:
  MVCJMVT:
    value: month
    range: 3m
```

*Les décisions de cet exemple : D880, D1927, D879.*
