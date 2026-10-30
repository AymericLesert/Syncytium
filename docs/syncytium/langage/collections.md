# Les collections

> **Une collection** est une valeur à plusieurs éléments : une liste, une
> composition, une association. **Une fonction d'agrégation** en résume
> les éléments en une valeur ; **une opération ensembliste** en combine
> deux ([glossaire](../../glossaire.md)).

Les types des collections, `list of` et `range of`, sont décrits dans
[le modèle](../modele/liens.md). Ce fichier dit ce que le langage en fait.

## Les fonctions d'agrégation et les opérations

**La collection est un type** : elle porte ses fonctions d'agrégation en méthodes
(D580). L'élément est le contexte implicite de chacun :

- `sum`, `count()`, `avg`, `min`, `max` ;
- `first`, `last` ;
- `any`, `all` : au moins un élément, ou tous, vérifient la condition (D1575, D1576) ;
  sans argument, `lignes.any()` dit que la collection n'est pas vide (D1577) ;
- `list`, la fonction qui rend la liste des valeurs, `list of <type>`
  (D965) ;
- **`group(champ, …)`**, le regroupement : une cellule par combinaison,
  la fonction évaluée par cellule, le résultat un hypercube aux dimensions
  des champs (D1015) ;
- **`sort(champ, …)`**, le tri en ligne ; `first()` et `last()` sans
  argument rendent alors la tête ou la queue de la liste triée (D1017).

`group` et `sort` ont aussi leur propriété déclarative sur une
association, `group:` et `sort:` (D1016, D1017,
[les champs](../modele/champs.md)).

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

La méthode s'écrit sur la collection des enregistrements, la valeur entre les parenthèses :
`lignes.sum(montant)`, jamais `lignes.montant.sum()` (D1585). `sum(lignes.montant)` est une
erreur d'ingestion, qui indique la méthode à employer.

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
des méthodes ; leur résultat retire ses doublons et garde l'ordre de la première collection
(D1585) :

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

## L'accès par la clé

Une collection s'adresse aussi par la clé de ses éléments, entre crochets
(D841). `collection[<expression>]` rend l'élément dont l'identité vaut
l'expression :

```yaml
# Le nombre de jours : nul sur la première ligne, la précédente atteinte par la clé
nb_jours:
  type: duration
  formula: date - owner.consommations[me.numero - 1].date if numero > 1
```

- **l'identité doit être déclarée** : la consommation porte
  `identity: [numero]`, la clé au sein de son possesseur ;
- **une clé absente rend le nul** ;
- **une clé composée** s'écrit une valeur par champ, `collection[v1, v2]`
  (D842) ;
- **une composition ne voit que ses éléments** : `owner.consommations[…]`
  ne regarde jamais un autre véhicule ;
- **l'étendue globale passe par l'entité**, la clé des parents en tête,
  `transport.consommation[…]` (D842) ;
- **une identité nommée** se cite, `factures[numero: v]` (D1550).
