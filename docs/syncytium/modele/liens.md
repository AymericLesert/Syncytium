# Les collections, les liens, les générés

Un champ ne porte pas toujours une seule valeur. Il peut porter une
liste, une plage, ou pointer vers d'autres enregistrements. Il peut
aussi être produit par Syncytium : un numéro, un calcul, un statut. Ce
fichier décrit ces types, puis ceux qu'un hook ajoute.

## Les collections et les plages

> **Une liste** est un champ à plusieurs valeurs du même type,
> `list of phone`. Sur un nom d'entité, elle devient une composition
> ([glossaire](../../glossaire.md)).

### `list of <type simple>`, la liste

« La phrase se lit » : `list of text`, une liste de textes (D296, D362).

- **Les facettes du champ s'appliquent à chaque élément.**
- **Une liste d'énumérés**, avec `values:`, se saisit en multi-sélection.

**La collection est un type** : elle porte ses fonctions d'agrégation en méthodes
(D580). L'élément est le contexte implicite de chacun :

- `sum`, `count()`, `avg`, `min`, `max` ;
- `first`, `last` ;
- `any`, `all` : au moins un élément, ou tous, vérifient la condition (D1575, D1576) ;
- `list`, la fonction qui rend la liste des valeurs, `list of <type>`
  (D965) ;
- **`group(champ, …)`**, le regroupement : une cellule par combinaison,
  la fonction évaluée par cellule, le résultat un hypercube aux dimensions
  des champs (D1015) ;
- **`sort(champ, …)`**, le tri en ligne ; `first()` et `last()` sans
  argument rendent alors la tête ou la queue de la liste triée (D1017).

`group` et `sort` ont aussi leur propriété déclarative sur une
association, `group:` et `sort:` (D1016, D1017,
[champs.md](champs.md)).

**La doctrine des fonctions d'agrégation** (D887) :

- la fonction qui porte une valeur se lit « valeur if condition » :
  `sum(montant if statut = "en_cours")` ;
- la fonction qui n'en porte pas reçoit la condition seule :
  `count(nature = "composant")`, `any(…)`, `all(…)` ;
- `count()` sans argument compte le tout.

Une fonction d'agrégation s'écrit sous trois formes (D1570) :

- **la méthode de la collection**, partout où une collection est nommée : `lignes.sum(montant)` ;
- **la forme contextuelle**, dans les seules surfaces qui portent leur collection, le graphique, le
  tableau croisé, les totaux d'une liste : `sum(montant)` porte sur les enregistrements affichés
  (D517) ;
- **la fonction libre**, sur deux valeurs ou plus, sans collection : `max(0, total)` (D576, D587).

`sum(lignes.montant)` est une erreur d'ingestion, qui indique la méthode à employer.

Le véhicule calcule son kilométrage courant par deux fonctions d'agrégation :

```yaml
# Le kilométrage courant : le plus grand compteur vu, par deux fonctions d'agrégation et un if suffixé
km_courant:
  type: integer
  formula: entretiens.max(km) if entretiens.max(km) > consommations.max(total_km) else consommations.max(total_km)
  label: Kilométrage courant
  hint: Le plus grand compteur vu — consommations et entretiens confondus.
```

Deux opérateurs complètent la collection :

- **l'appartenance**, `in` (D888) : `<élément> in <collection>`,
  `me in fournisseurs` ; sa négation s'écrit `not in` (D1572) ;
- **la projection**, le point (D889) : `<collection>.<champ>` rend la
  collection des valeurs de ce champ, `me.code in fournisseurs.code`,
  `lignes.article`.

**Les opérations ensemblistes** combinent deux collections du même type (D1575). Ce sont
des méthodes, et leur résultat retire ses doublons :

- `a.union(b)`, les éléments de l'une ou de l'autre ;
- `a.intersect(b)`, les éléments communs ;
- `a.except(b)`, les éléments de `a` absents de `b` ;
- `a.xor(b)`, les éléments d'un seul des deux côtés, comme le `xor` des booléens.

```yaml
# Les articles commandés absents du dépôt : la différence de deux projections
manquants:
  type: list of technique.article
  formula: lignes.article.except(depot.niveaux.article)
```

**La liste littérale** écrit des valeurs en dur, entre crochets (D1572). Ses
valeurs sont du même type ; elle se lit telle quelle, sans retirer de doublon :

```yaml
# La ligne en retard : le statut n'est ni soldé ni terminé
en_retard:
  type: boolean
  formula: delai_expedition < context.today and statut not in ["soldee", "terminee"]
```

Une formule qui commence par `[` se met entre apostrophes, sinon le YAML la lit comme une
liste.

**Le constructeur `list(a, b, …)`** assemble plusieurs valeurs en une
liste (D971, D579, D659) :

- les vides tombent, le nul comme la chaîne vide ;
- l'ordre des arguments est gardé ;
- les doublons sont retirés, le premier des égaux garde sa place ;
- les arguments sont du même type, ou promus sans perte (D581) ;
- le résultat est une `list of <ce type>`.

```yaml
# Les matières de l'article : neuf colonnes de la source en une liste
matieres:
  formula: >-
    list(ARCTCODMA1, ARCTCODMA2, ARCTCODMA3, ARCTCODMA4, ARCTCODMA5, ARCTCODMA6, ARCTCODMA7, ARCTCODMA8,
    ARCTCODMA9)
  description: Les neuf colonnes des matières en une liste ; les vides et les doublons tombent.
```

**À la source d'une reprise, l'entité décrite est une collection**
(D965, D966). Un calculé lit une autre entité de la source par `first`
ou `list`, avec son filtre :
`PARAM_EMPLACEMENTS.first(PACTEXT140 if PACTEXT210 = …)`. Le résultat est
mis en cache par critères, le temps d'un passage. Au modèle, la règle
reste qu'un calcul ne lit jamais une entité entière (D891).

### `range of <type>`, la plage

Le registre la définit : « la déclinaison de `list of` avec 2
contraintes en nombre et en ordre » (D497, D498).

- **Deux valeurs**, la première inférieure ou égale à la seconde.
- **Le minimum ou le maximum peut manquer** : la plage est ouverte.
- **Les libellés** portent sur trois éléments : min, value, max.
- **La jauge** est un cas particulier de plage.

## Les liens

> **Une référence** pointe vers un enregistrement d'une autre entité.
> **Une composition** est un lien de possession : les enfants naissent,
> vivent et disparaissent avec leur parent. **Une association** est un
> lien souple, sans possession : chacun vit sa vie
> ([glossaire](../../glossaire.md)).

### La référence, `<module>.<entité>`

Le registre le dit : « si le type est le nom d'une entité, c'est une
référence » (D394–D398, D216). Aucun `to:` n'est nécessaire. La ligne
de vente de l'entrepôt référence son article :

```yaml
# L'article de la ligne : une référence vers une entité d'un autre module
article:
  type: technique.article
  required: true
  label: Article
  description: >-
    La référence, résolue par sa clé à la reprise. La désignation de la ligne n'est pas reprise : elle vit dans une
    table de libellés, hors de l'exemple.
```

- **Le filtre** des candidats lit l'origine par `me.`.
- **Le contrôle**, `check:` : `selection`, le défaut, ou `immutable`.
- **L'accès retour** est automatique, par une liste nommée : l'entité
  pointée atteint ceux qui la pointent sans rien déclarer.

### La composition, `list of <entité>`

Le parent déclare ce qu'il possède ; l'enfant ne déclare rien (D399,
D400, D420). La commande de vente de l'entrepôt possède ses lignes :

```yaml
# Les lignes : la composition de la commande
lignes:
  type: list of ligne_vente
  label: Lignes
  description: La suppression de la commande les emporte ; la suppression d'un article ne les touche pas.
```

- **L'agrégat est le grain d'écriture** : le parent et ses enfants
  s'écrivent d'un bloc, indivisible.
- **Une entité peut se composer d'elle-même** (D135) : une nomenclature
  dont une ligne est une autre nomenclature. La récursivité est validée
  acyclique ; l'agrégat est l'arbre entier, écrit, supprimé et verrouillé
  d'un bloc.

### L'association, `association with <entité>[.<champ>]`

L'association relie librement, entre modules, sans cascade (D400, D401).
Elle reprend les propriétés de la référence : le filtre, `me.`,
`check:`, l'affichage au visage.

- **Le champ de destination** se nomme au point (D761, D762). Par
  défaut, c'est le champ au nom de l'entité ;
  `association with order.billing` lève une ambiguïté.

### L'association dérivée, `association with <entité> if …`

Une vue navigable, jamais stockée, en lecture seule (D405). La vérité
reste la référence. Le dépôt de l'entrepôt atteint ainsi ses niveaux et
ses mouvements :

```yaml
# Les niveaux du dépôt : l'accès retour, en vue dérivée
niveaux:
  type: association with stock.niveau if depot = me
  label: Niveaux
  description: L'accès retour aux niveaux du dépôt, nommé en vue dérivée.
```

Elle admet `sort:` et `group:` ([champs.md](champs.md)) :

```yaml
# Les mouvements par article : la vue dérivée, groupée par article
mouvements_par_article:
  type: association with stock.mouvement if emplacement = me
  group: [article]
  label: Mouvements par article
  description: >-
    Le second accès aux mouvements, la vue dérivée groupée par article : une cellule par article passé par cet
    emplacement.
```

### Le lien n-aire, `list of [a, b]`

Chaque élément est une combinaison des entités nommées (D402). Chaque
entité nommée a ses propriétés.

- **Une dimension de valeur typée** peut s'ajouter aux entités (D897) :
  `list of [tiers.tiers, tranche: text[1], date_application: date]`, le
  temps en dimension.
- **La cellule porte ses champs**, calculés compris (D403) : en bloc sous
  `fields:` quand elle s'enrichit (D898), entre accolades au cas court.

Le dépôt de l'entrepôt contrôle son stock par une matrice emplacement ×
article :

```yaml
# Le contrôle du stock : une matrice emplacement × article, calculée par cellule
controle_stock:
  type: 'list of [emplacement: stock.emplacement, article: technique.article]'
  formula: 'mouvements.group(emplacement, article).sum(sens.select(entree: quantite, sortie: -quantite))'
  label: Contrôle du stock par les mouvements
  description: >-
    La matrice emplacement × article : la somme des quantités entrées moins les sorties, évaluée par cellule —
    group(emplacement, article) fait une cellule par couple présent dans les mouvements. La quantité est signée par
    le sens, dans l'unité de stock de l'article ; le tableau de bord la compare aux niveaux.
```

### L'accès montant, `owner`

`owner` désigne le possesseur d'une composition ; il est unique (D760,
D761). Un associé s'atteint par son champ de référence. La consommation
du véhicule lit ainsi le kilométrage initial de son véhicule,
`owner.km_initial`.

## Les générés et le contexte

> **Un compteur** est un numéroteur automatique : jamais deux fois le
> même numéro. **Un champ calculé** a une valeur déduite d'une
> expression ; l'utilisateur ne la modifie pas
> ([glossaire](../../glossaire.md)).

### `counter`, le compteur

Le compteur est attaché à son champ, ou **mutualisé** par son nom,
`counter[mon_compteur]` (D154, D155, D297, D409, D410).

```yaml
# Le numéro de la commande : un compteur au format à six chiffres
numero:
  type: counter
  format: "{counter:000000}"
  label: Numéro
  description: Un compteur — le type est déclaré, la reprise écrit la valeur.
```

- **La réinitialisation** se déclare, `reset:` ; `never` par défaut.
- **Il est en lecture seule partout** ; en création, il s'affiche
  « *(attribué à la validation)* ».
- **La continuité** est le contrôle porté par la propriété du compteur :
  il identifie les trous (D154).
- **La migration le surcharge** (D883) : la valeur reprise entre telle
  quelle. La méthode `update(valeur)` du type, dans les `operations:` de
  la règle, positionne le compteur courant sur la plus grande valeur
  (D999) : `commande_vente.numero.update(numero)`. Le compteur mutualisé
  se nomme au crochet, `counter[mon_compteur].update(valeur)` (D1555).
- **Le rejeu** retrouve l'enregistrement par son identité, jamais par une
  nouvelle allocation (D930).
- **Dans une identité**, le compteur fait une identité acquise (D1171,
  [entite.md](entite.md)) : le champ n'est pas obligatoire, et l'identité
  ne vaut qu'une fois le compteur attribué.

### Le champ calculé, `formula:`

Une expression du langage (D255, D298). Le champ est en lecture seule et
se recalcule dès qu'une dépendance change. Son composant est celui de
son type de résultat. Les valeurs nommées d'une fonction se lient au
point (D593).

### Le statut, `states:`

`states:` désigne le porteur du cycle de vie : le champ énuméré, ou la
hiérarchie d'héritage (D353, D421–D427). Il porte le graphe des
passages, `promote:` et `demote:`. Une entité a un seul statut.

### L'entité `context`

Le moteur, en lecture seule (D254, D588–D591). Ses parties :

- `user`, l'utilisateur, traversable ;
- `location`, `now` ;
- `instance`, `application`, `module` ;
- `entity`, `field` ;
- `file`, `page`, `pages`, au document ;
- `settings.<nom>`, les paramètres statiques et dynamiques, en cascade.

Une entité de l'application nommée `context` prend le pas ; l'ingestion
le signale par un avertissement.

## Les types ajoutés par un hook

> **Un hook** prolonge Syncytium par du code, écrit contre son contrat.
> Il y en a sept familles : le type, le composant, l'opération, la
> fonction, le connecteur, le style, la langue
> ([glossaire](../../glossaire.md)).

Tout type ajouté suit le contrat de la famille, décrit dans
[les hooks](../../hooks.md).

- **La signature complète** : la conversion, les opérateurs, les
  comparateurs, les fonctions dédiées, le tri ([types.md](types.md)).
- **La représentation obligatoire** : le registre le dit, « aucun type
  sans visage » (D459).

L'exemple fondateur est le type `progression`, un `integer[0..100]`
rendu par le composant `fuel`, employé par `avancement: progression`.

**Le storage influe sur le hook de type** (D1297). Le registre le dit :
« le storage influe le hook des types pour définir les propriétés ou les
éléments à couvrir ». Le type fournit sa forme native, ses gestes, son
identification, ses index, sa partition ; le storage les exploite au
mieux.

**Tout type se décline en types élémentaires** (D1298, D1300), le format
pivot :

- **en un élémentaire** : booléen, entier, long, décimal, texte…, avec
  ses propriétés génériques ; `text[..40]` a sa longueur maximale ;
- **ou en une liste nommée d'élémentaires** : `measure` devient
  `{ valeur: decimal, unite: enum }`, `amount` devient
  `{ valeur: decimal, devise: text[3] }` ;
- **un énuméré** se décline en entier, l'indice, ou en texte, le code.

Le storage ne convertit que des élémentaires : c'est ce qui rend le
modèle extensible.
