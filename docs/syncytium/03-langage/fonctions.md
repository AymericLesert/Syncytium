# Le catalogue des fonctions

> **Une fonction** prend des valeurs en arguments et rend une valeur, ou
> plusieurs valeurs nommées. Le catalogue est en anglais, comme les
> mots-clés (D301, D309) ; il s'enrichit selon les besoins (D587)
> ([glossaire](../../glossaire.md)).

Chaque type emmène ses fonctions : ses parties au point, ses
constructeurs, ses conversions. Elles sont décrites à sa fiche, dans
[les types](../02-modele/types.md) et
[les types composés](../02-modele/composes.md) (D579, D838). Ce fichier
décrit les autres : celles du texte, les fonctions libres, et les
fonctions que le concepteur ajoute.

## Les fonctions du texte

Le type `text` emmène ses fonctions (D579, D934). Le registre le dit :
« trim, upper, right, mid, … doivent figurer au catalogue sur un champ
texte ». Les règles de migration, les calculés et les normalisations les
emploient.

**Nettoyer un texte** :

- `trim(t)` retire les blancs de tête et de fin (D870, D872) ;
- `upper(t)` et `lower(t)` changent la casse (D656).

**Découper un texte** :

- `left(t, n)` et `right(t, n)` gardent les `n` premiers ou derniers
  caractères (D870) ;
- `mid(t, début, longueur)` extrait une sous-chaîne (D934) ;
- `length(t)` rend la longueur (D934).

**Compléter un texte** :

- `lpad(t, n, c)` et `rpad(t, n, c)` complètent le texte à gauche ou à
  droite par le caractère `c`, une espace par défaut, jusqu'à `n`
  caractères ; un texte plus long reste tel quel (D1567).

`lpad(me, 4, "0")` met un code sur quatre positions, comme
`right("0000" + me, 4)`.

**Comparer et extraire par une expression régulière** :

- `t like "regex"` compare le texte à l'expression (D818) :
  `Nature like "^VIREMENT-.*"` ;
- `extract(t, "regex")` extrait la capture unique, ou plusieurs valeurs
  par des groupes nommés, lues au point (D817).

```yaml
# Le dépôt et l'emplacement d'un couple « dépôt.emplacement » : deux extractions
depot:
  description: Le dépôt, lu avant le point du couple.
  formula: extract(PACTEXT210, '^([^.]+)\.')

# L'emplacement, après le point
emplacement:
  description: L'emplacement, lu après le point du couple.
  formula: extract(PACTEXT210, '\.(.+)$')
```

La reprise des articles lit un code de famille par `mid` :

```yaml
# L'article périssable : le quatrième caractère du code de famille
perissable:
  formula: mid(ARCTCODFAM, 4, 1) = "1"
  description: Un 4e caractère à 1 dans le code de famille marque l'article périssable.
```

Deux règles complètent les fonctions du texte :

- **`trim` est la normalisation par défaut** des textes de l'entrepôt : les
  settings l'écrivent sous `field:` et le nom du type,
  `text: { normalize: trim(me) }`, et un champ peut la surcharger (D872,
  D991, D1239) ;
- **un texte trop long pour sa cible se tronque par `left`** : la
  conversion avec perte est refusée à l'ingestion, jamais implicite
  (D581, D934).

La concaténation, par `+` ou par le gabarit, est décrite dans
[l'écriture d'une expression](ecriture.md).

## Les fonctions libres

Une fonction libre prend des valeurs, sans collection (D576, D587) :

- `min`, `max`, `sum`, `avg`, sur deux valeurs ou plus : `max(0, total)` ;
- `ifnull(p, v)`, qui rend `p`, ou `v` quand `p` est nul (D1574) ;
- `exp`, `sin`, `cos`, `tan`, les fonctions mathématiques (D577).

Les fonctions de l'arrondi complètent le catalogue (D1587) :

- `round(x, n)` arrondit à `n` décimales, `n` valant 0 par défaut ; la
  moitié s'arrondit loin de zéro, comme dans Excel ;
- `floor(x)` et `ceil(x)` arrondissent à l'entier inférieur et à l'entier
  supérieur ;
- `trunc(x, n)` coupe à `n` décimales, sans arrondir ;
- `abs(x)` rend la valeur absolue.

Un montant ou une mesure s'arrondit sur sa valeur, et garde son unité (D1589).

La banque arrondit son montant signé au centime :

```yaml
# Le montant signé : le crédit moins le débit, arrondi au centime
montant_signe:
  formula: round(ifnull(Credit, 0) - ifnull(Debit, 0), 2)
```

## Les valeurs nommées

Une fonction rend une valeur, par défaut, ou plusieurs valeurs nommées
(D593). Sa déclaration le dit : `result: <type>`, ou
`result: { nom: type, … }`. Les valeurs nommées se lisent au point,
après un seul appel : `extract_name(raw).prenom` (D817).

## La fonction définie

Une fonction définie calcule un champ (D571) :

- elle rend une valeur ou une liste de valeurs, aux types du modèle ;
- elle se recalcule quand un de ses paramètres change, dans l'ordre que
  fixe le graphe d'exécution ;
- elle ne déclenche aucune opération : elle est pure.

Une fonction qui n'existe pas au catalogue s'écrit en code, par un hook
de fonction ([les hooks](../../hooks.md)).
