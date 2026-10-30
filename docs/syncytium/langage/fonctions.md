# Le catalogue des fonctions

> **Une fonction** prend des valeurs en arguments et rend une valeur, ou
> plusieurs valeurs nommées. Le catalogue est en anglais, comme les
> mots-clés (D301, D309) ; il s'enrichit selon les besoins (D587)
> ([glossaire](../../glossaire.md)).

Chaque type emmène ses fonctions : ses parties au point, ses
constructeurs, ses conversions. Elles sont décrites à sa fiche, dans
[les types](../modele/types.md) et [les types composés](../modele/composes.md)
(D579, D838). Ce fichier décrit les autres.

## Les fonctions du texte

Le type `text` emmène ses fonctions (D579, D934). Le registre le dit :
« trim, upper, right, mid, … doivent figurer au catalogue sur un champ
texte ». Les règles du mapping, les calculés et les normalisations les
emploient.

| La fonction | Le geste |
|---|---|
| `trim(t)` | retire les blancs de tête et de fin (D870, D872) |
| `upper(t)`, `lower(t)` | change la casse (D656) |
| `left(t, n)`, `right(t, n)` | garde les n premiers ou derniers caractères, `right("0000" + me, 4)` (D870) |
| `lpad(t, n, c)`, `rpad(t, n, c)` | complète le texte à gauche ou à droite par le caractère `c`, une espace par défaut, jusqu'à `n` caractères ; un texte plus long reste tel quel, `lpad(me, 4, "0")` (D1567) |
| `mid(t, début, longueur)` | extrait la sous-chaîne (D934) |
| `length(t)` | rend la longueur (D934) |
| `t1 + t2` | concatène ; un nul y est une anomalie, comme dans toute expression (D870, D1566) |
| `t like "regex"` | compare à une expression régulière (D818) |
| `extract(t, "regex")` | extrait par l'expression régulière : la capture unique, ou plusieurs noms par les groupes nommés, lus au point (D817) |

`trim` est la normalisation par défaut des textes de l'entrepôt : les
settings l'écrivent sous `field:` et le nom du type, `text: { normalize:
trim(me) }` (D991, D1239), et un champ peut la surcharger (D872).

La reprise des articles en emploie une pour lire un code de famille :

```yaml
# L'article périssable : le quatrième caractère du code de famille
perissable:
  formula: mid(ARCTCODFAM, 4, 1) = "1"
  description: Un 4e caractère à 1 dans le code de famille marque l'article périssable.
```

Un texte trop long pour sa cible se tronque par `left`. La conversion
avec perte est refusée à l'ingestion, jamais implicite (D581, D934).

## Les fonctions libres

Une fonction libre prend des valeurs, sans collection (D576, D587) :

- `min`, `max`, `sum`, `avg`, sur deux valeurs ou plus : `max(0, total)` ;
- `ifnull(p, v)`, qui rend `p`, ou `v` quand `p` est nul (D1574) ;
- `exp`, `sin`, `cos`, `tan`, les fonctions mathématiques (D577).

Les fonctions de l'arrondi complètent le catalogue (D1587) :

- `round(x, n)` arrondit à `n` décimales, `n` valant 0 par défaut ; la moitié s'arrondit loin
  de zéro, comme dans Excel ;
- `floor(x)` et `ceil(x)` arrondissent à l'entier inférieur et à l'entier supérieur ;
- `trunc(x, n)` coupe à `n` décimales, sans arrondir ;
- `abs(x)` rend la valeur absolue.

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
