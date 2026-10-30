# Les collections, les liens, les générés

## Les collections et les plages

| le type | la nature | D |
|---|---|---|
| `list of <type simple>` | « la phrase se lit » ; **les facettes du champ s'appliquent à chaque élément** ; les énumérés (`values:`) → la multi-sélection ; **la collection est un type — elle porte les agrégats en méthodes** (`sum`, `count()`, `avg`, `min`/`max`, `first`, `last`, `any`, `exists` — l'élément en contexte implicite ; **`group(champ, …)`** le « group by », une cellule par combinaison, l'agrégat par cellule, le résultat un hypercube aux dimensions des champs — D1015 ; **`sort(champ, …)`** le tri en ligne, `first()`/`last()` sans argument sur la liste triée — D1017 ; les deux ont leur propriété déclarative sur l'association, `group:` et `sort:` — D1016/D1017) ; **la doctrine des agrégats** (D887) : l'agrégat qui porte une valeur se lit « valeur if condition » (`sum(montant if statut = "en_cours")`), celui qui n'en porte pas reçoit la condition seule (`count(nature = "composant")`, `any(…)`, `exists(…)`), `count()` nu = le tout ; **l'appartenance par l'opérateur `in`** (D888) : `<élément> in <collection>` — `me in fournisseurs` ; **la projection** (D889) : `<collection>.<champ>` = la collection des valeurs de ce champ — `me.code in fournisseurs.code`, `lignes.article` ; **`list`** (D965) — l'agrégat qui rend la liste des valeurs (`list of <type>`, la forme « valeur if condition ») ; **le constructeur `list(a, b, …)`** (D971 — la fonction au nom du type, D579/D659) : plusieurs valeurs vers une liste — **les vides tombent** (le nul, la chaîne vide), **l'ordre des arguments**, **la liste nettoyée de ses doublons** (le premier des égaux garde sa place), les arguments du même type ou la promotion sans perte (D581), le résultat `list of <ce type>` — `matieres: list(ARCTCODMA1, …, ARCTCODMA9)` ; **à la source, l'entité décrite est une collection** (D965) : un calculé lit une autre entité source par `first`/`list` (`PARAM_EMPLACEMENTS.first(PACTEXT140 if PACTEXT210 = …)` — l'entité avec son filtre, D966), le résultat mis en cache par critères le temps d'un passage — au modèle, D891 tient (jamais l'entité entière) | D296, D362, D580, D887–D889, D965–D966, D971 |
| `range of <type>` | « la déclinaison de `list of` avec 2 contraintes en nombre et en ordre » — deux valeurs, la première ≤ la seconde (la contrainte intégrée) ; **min et/ou max indéfinissables** (la plage ouverte) ; les libellés sur trois éléments (min, value, max) ; **la jauge = un cas particulier d'un range** | D497–D498 |

## Les liens

| le type | la nature | D |
|---|---|---|
| la référence — `<module>.<entité>` | « si le type est le nom d'une entité, c'est une référence » (le `to` inutile) ; **l'origine se lit par `me.`** dans le filtre ; `check: selection` (défaut) \| `immutable` ; l'accès retour automatique (la liste nommée) | D394–D398, D216 |
| la composition — `list of <entité>` | le lien de possession : le parent déclare, l'enfant ne déclare rien ; **l'agrégat = le grain d'écriture** (indivisible) ; **une entité peut se composer d'elle-même** — une nomenclature dont une ligne est une autre nomenclature : la récursivité est validée acyclique, l'agrégat est l'arbre entier, écrit, supprimé et verrouillé d'un bloc (D135) | D135, D399–D400, D420 |
| l'association — `association with <entité>[.<champ>]` | plusieurs, libres, inter-modules — sans cascade ; reprend les propriétés de la référence (filter/me./check, l'affichage au visage) ; **le champ de destination au point** (D761–D762 — le défaut : le champ au nom de l'entité ; `association with order.billing` à l'ambiguïté) | D400–D401, D761–D762 |
| le lien n-aire — `list of [a, b]` / `association with [a, b]` | **chaque élément = une combinaison des entités nommées**, des propriétés par entité nommée ; **une dimension de valeur typée** à côté des entités (D897 — `list of [tiers.tiers, tranche: text[1], date_application: date]` : l'hypercube de D134, le temps en dimension) ; la cellule `{ … }` porte ses champs, calculés compris (D403) — **en bloc sous `fields:`** quand elle s'enrichit (D898), l'accolade au cas court | D402, D897–D898 |
| l'association dérivée — `association with <entité> if …` | la vue navigable, jamais stockée, en lecture — la vérité reste la référence | D405 |
| l'accès montant | **`owner`** — le possesseur d'une composition (unique — D760/D761) ; l'associé s'atteint **par son champ de référence** | D760–D761 |

## Les générés et le contexte

| le type | la nature | D |
|---|---|---|
| `counter` | le compteur — attaché au champ ou **mutualisé** (`counter[mon_compteur]`) ; la réinitialisation sur la déclaration (`reset: never` défaut) ; lecture seule partout, « *(attribué à la validation)* » en création ; **surchargé par la migration** (D883) : la valeur reprise entre telle quelle, **la méthode `update(valeur)` du type** (D999 — « plus parlante ») dans les `operations:` de la règle positionne le compteur courant sur la plus grande valeur : `commande_vente.numero.update(numero)`, le champ adressé par le point (D363) ; **le compteur mutualisé par son nom au crochet** : `counter[mon_compteur].update(valeur)` (D1555) ; **l'identification des trous est le contrôle porté par la propriété du compteur** (la continuité, D154), pas une règle de la migration ; le rejeu par l'identité (D930), jamais une nouvelle allocation ; **sa place dans une identité est une identité acquise** (`identities:`, D1171) — le champ n'est pas obligatoire, l'identité ne vaut qu'une fois le compteur attribué | D154–D155, D297, D409–D410, D883, D998, D1171 |
| le champ calculé | `formula:` — l'expression D90 ; lecture seule, **recalculé dès qu'une dépendance change** ; son composant = celui de son type de résultat ; les valeurs nommées d'une fonction se lient au point (D593) | D255, D298 |
| le statut — `states:` | désigne le porteur (la hiérarchie D353 ou le champ énuméré) ; le graphe promote/demote ; un seul statut par entité | D421–D427 |
| l'entité `context` | le moteur, lecture seule — `user` (traversable), `location`, `now`, `instance`/`application`/`module`, `entity`/`field`, `file`/`page`/`pages` (au document), `settings.<nom>` (les paramètres statiques/dynamiques en cascade) ; l'entité homonyme prend le pas (le warning à l'ingestion) | D254, D588–D591 |

## Les types-hooks

Tout type ajouté suit le contrat de la famille (voir
[hooks.md](../../hooks.md)) : la signature complète (la conversion, les
opérateurs, les comparateurs, les fonctions dédiées, le tri) et **la
représentation obligatoire** — « aucun type sans visage » (D459).
L'exemple fondateur : le type `progression` (`integer[0..100]` +
`component: fuel`), le champ `avancement: progression`. **Le storage
influe sur le hook de type** (D1297) : « le storage influe le hook des
types pour définir les propriétés ou les éléments à couvrir » — la
forme native, les gestes, l'identification, les index, la partition ;
le type les fournit, le storage « fait le nécessaire pour exploiter au
mieux ces données ». **La déclinaison en types élémentaires** (D1298,
D1300 — le format pivot) : tout type Syncytium se décline **en un type
élémentaire** — booléen, entier, long, décimal, texte… — avec ses
propriétés génériques (`text[..40]` : la longueur maximale), **ou en
une liste nommée d'élémentaires** — `measure` → `{ valeur: decimal,
unite: enum }`, `amount` → `{ valeur: decimal, devise: text[3] }` (D1300) ; l'énuméré se décline en entier (l'indice) ou en texte (le
code) ; le storage ne convertit que des élémentaires. Le contrat à
l'étape 9 du rang 2.
