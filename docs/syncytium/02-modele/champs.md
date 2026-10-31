# Les champs — `fields.yml`

> **Un champ** est la plus petite donnée d'une entité. Il a un nom, un
> type et des propriétés ([glossaire](../../glossaire.md)).

Les champs d'une entité forment une carte ordonnée : le nom du champ est
la clé, l'ordre de déclaration est l'ordre d'affichage par défaut. Ils
s'écrivent sous `fields:`, en place ou dans un fichier, `fields.yml`.

## La forme courte et le bloc

Un champ sans façon s'écrit en une ligne : son nom, puis son type.

```yaml
# Le lieu d'achat, en forme courte : le type seul
lieu_achat: text[..60]
```

Dès qu'il porte une facette ou sa documentation, il s'écrit en bloc. Le
véhicule écrit ainsi ses champs, chacun avec son libellé et son aide :

```yaml
# Le lieu d'achat : le type, le libellé et l'exemple de la zone vide
lieu_achat:
  type: text[..60]
  label: Lieu d'achat
  placeholder: Garage Peugeot à Dôle

# Le kilométrage au retrait : le type, l'obligation, le libellé et l'aide
km_initial:
  type: integer[0..]
  required: true
  label: Kilométrage initial
  hint: Le compteur au retrait du véhicule — la première ligne de consommation en part.
```

## Les groupes de champs

> **Un groupe de champs** range des champs sous un titre, comme les prix
> d'un article. Il est nommé, titré par langue et ordonné ; le modèle
> reste plat, et un champ s'adresse sans son groupe
> ([glossaire](../../glossaire.md)). Il ne se confond pas avec **un
> groupe d'utilisateurs**, qui porte les droits.

Dans la même carte, une clé qui porte `fields:` sans `type:` est un
**groupe** (D1279, D1289). Il a son `title:`, par langue, et ses champs,
en place ou dans un fichier. L'entrepôt range les prix de l'article dans
un groupe :

```yaml
# Les prix : un groupe, son titre et ses champs dans un fichier
prix:
  title: Les prix
  fields: ~{prix.yml}
```

- Les champs hors groupe forment **le groupe implicite**.
- Les noms des champs restent uniques dans l'entité ; un champ s'adresse
  sans son groupe.
- Un groupe ne s'emboîte pas dans un autre.
- Un champ qui porte `type:` et `fields:` n'est pas un groupe : c'est une
  liste de valeurs composées (D115).

Le groupe est une vue (D1273) : un compartiment du diagramme, une
section de la table du dictionnaire, un onglet du formulaire par défaut.
Le groupe implicite occupe l'en-tête de l'écran, au-dessus des onglets.

## Les propriétés d'un champ

### Le type et les liens

- **`type:`** est le type du champ, pris au [catalogue](types.md), ses
  bornes au nom : `text[..40]`, `integer[0..]`, `date[yyyy-mm]` (D362,
  D366). Trois types sont des liens vers une autre entité
  ([liens.md](liens.md)) :
  - **la référence**, le nom d'une entité, `transport.revision` (D394) ;
  - **la composition**, `list of <entité>` : le parent déclare, l'enfant
    ne déclare rien, il atteint son possesseur par `owner` (D399, D760) ;
  - **l'association**, `association with <entité>[.<champ>]` (D400, D762).
- **`sort:`** et **`group:`** s'écrivent sur une association dérivée, une
  liste calculée (D405). `sort:` donne les clés de tri dans l'ordre,
  `sort: [owner.date, owner.numero]` ; `first()` et `last()` rendent alors
  l'élément de tête ou de queue (D997, D1017). `group:` donne les champs
  de regroupement, `group: [emplacement]` : l'association livre une
  cellule par combinaison, et une fonction d'agrégation s'évalue cellule par cellule
  (D1016). Les méthodes `sort(…)` et `group(…)` en sont les formes en
  ligne (D1015, D1017).
- **`filter:`** et **`check:`** s'écrivent sur une référence : le filtre
  des candidats, l'origine citée par `me.` ; le contrôle, `selection` par
  défaut, ou `immutable` (D394–D396).

### La saisie

- **`required:`** rend le champ obligatoire : le nul est retiré (D373).
  Les champs de l'identité le sont sans qu'on l'écrive (D1170).
- **`mode:`** dit si le champ se modifie (D364) :
  - `editable`, le défaut ;
  - `read-only` ;
  - `write-once`, l'écriture unique : vide, la saisie est permise ;
    renseigné, elle est refusée (D153). L'administrateur garde l'écriture
    pleine, une correction tracée.

  Ce qui s'écrit se lit toujours (D73). Un calculé est en lecture seule
  par nature. Le code d'un client, saisi à la création, ne bouge plus :
  `code: { type: text, mask: "C-999999", mode: write-once }`.
- **`default:`** est la valeur de naissance ; un statut naît à son
  `default:` (D424).
- **`unchanged: true`** marque un champ que la cible possède : une
  migration ne l'écrit pas, il naît à son `default:` et garde sa valeur,
  la saisie restant libre (D941). Une règle de migration qui l'alimente
  est une erreur d'ingestion. `false` par défaut.
- **`mask:`** est le masque de saisie, `_`, `9`, les littéraux
  (D259–D265) ; il pilote aussi la lecture des sources (D820).
- **`searchable:`** déclare au modèle la capacité de recherche, `range`,
  `mutualizable[<nom>]` ; les listes la consomment (D780, D784). Sans
  `searchable:`, aucun écran ne filtre sur le champ ; une liste prend
  par défaut pour critères ses champs affichés qui le portent, et ne
  nomme en critère qu'un champ qui le porte (D1596) : un autre champ est
  une erreur d'ingestion, un nom mutualisé vaut pour les champs qui le
  déclarent (D1598). Sans déclaration,
  ni à la liste ni aux champs, la liste n'a aucun critère (D1597).
- **Les facettes propres à un type**, `currencies:`, `units:`,
  `decimals:`, sont décrites à sa fiche ([types.md](types.md),
  [composes.md](composes.md)).

### Le calcul et les valeurs

- **`formula:`** fait du champ un calculé : une expression, en lecture
  seule, recalculée dès qu'une dépendance change (D255, D298). Elle
  emploie les fonctions d'agrégation des collections, `sum`, `max`, `count`, les
  fonctions des types au point, `montant.currency`, `nb_jours.days`,
  l'accès par la clé, `owner.consommations[me.numero - 1].date` (D841),
  et les mots `owner`, `me`, `context`. Le langage est décrit dans son
  propre chapitre.
- **`values:`** porte les valeurs d'un énuméré ; chacune a son `label:`
  par langue. Sur le champ qui porte le cycle de vie, chaque valeur porte
  aussi ses droits, `allow` (D422), et ses passages, `promote:` et
  `demote:`, avec `to:` et `when:` (D426, D427).

### La documentation du champ

- **`label:`** est le libellé, par langue : les colonnes, les
  formulaires, les exports (D124, D127). Sans lui, le gabarit du socle
  `${name}`, le nom du champ (D1181) ; ce gabarit est un défaut du socle,
  porté par l'inventaire (D1175, D1239).
- **`hint:`** est la description courte, l'infobulle du « (?) » (D840) ;
  la tablette la replie près du libellé, le smartphone l'omet (D262).
- **`description:`** est la description longue, l'aide du masque
  d'explication (D209) et la matière du tutoriel.
- **`placeholder:`** est la valeur de démonstration dans la zone vide,
  `AA-999-AA`, par langue (D128) ; une image a la sienne, une icône
  (D390).

La documentation dit aussi **à quoi sert** un champ : les formules qui
le lisent, les validations, les opérations, les règles de reprise, les
rapports, les écrans (D1186, D1198). Rien ne se déclare : Syncytium le
calcule depuis les liens que l'ingestion garantit.

## L'ordre du fichier

Un fichier de champs se lit comme une page. La banque en fixe la
convention :

- **le fichier est aéré** : les accolades dépliées en bloc, une ligne
  vide entre deux champs ;
- **les champs saisis en tête, les calculés en pied**, séparés par un
  commentaire, `# Les champs calculés` ;
- **le commentaire d'un champ se place devant lui**, jamais à sa droite ;
  ce qui parle à l'utilisateur n'est pas un commentaire, c'est un
  `hint:` ou une `description:` (D258, D840).
