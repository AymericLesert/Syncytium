# L'écriture d'une expression

> **Un littéral** est une valeur écrite en dur dans une formule : un
> texte, un nombre, une durée, un booléen, une date
> ([glossaire](../../glossaire.md)).

Une expression combine des littéraux, des noms de champ, des opérateurs
et des fonctions. Ce fichier dit comment chacun s'écrit, puis comment une
expression choisit entre plusieurs valeurs.

## Les littéraux

Les littéraux s'écrivent ainsi (D1578, D1579) :

- **un texte**, entre guillemets ou entre apostrophes, au même sens : `"soldee"`, `'^([^.]+)\.'` ;
- **un nombre**, avec le point décimal, sans séparateur de milliers : `6.55957` ;
- **une durée**, en nombre suivi de son unité : `12m`, `180d`, `2h` ; `m` est le mois, `min` la minute ;
- **un booléen**, `true` ou `false` ; le nul, `null` ;
- **une date**, en ISO, par la fonction du type : `date("2026-01-01")` ;
- **une unité, une devise, une valeur d'énuméré**, entre guillemets, comme tout texte :
  `quantite.to("kg")`, `amount(v, "EUR")`, `statut = "soldee"` (D1578, D1581).

Une clé reste nue : celle d'un `select`, `select(EUR: …)` comme `select(thermique: …)`. Une
déclaration YAML suit l'usage du YAML : `units: [kg, g]`, `currency: EUR` (D1581).

## Les opérateurs

Les opérateurs sont des fonctions du type, à l'écriture symbolique
(D581, D838) :

- **les opérateurs numériques** : `+`, `-`, `*`, `/` la division réelle,
  `\` la division entière, `%` le modulo, `!` le factoriel, `**` la
  puissance (D577) ; `exp`, `sin`, `cos`, `tan` sont des fonctions ;
- **les comparateurs** : `=`, `!=`, `<`, `<=`, `>`, `>=`, `in`, `not in`,
  `is null`, `is not null` ; leur résultat est un booléen (D582, D1572,
  D1573) ;
- **les opérateurs logiques** : `not`, `and`, `xor`, `or` (D1571).

La priorité va du plus fort au plus faible (D581, D1571) :

1. `!` ;
2. `**` ;
3. `*`, `/`, `\`, `%` ;
4. `+`, `-` ;
5. les comparateurs ;
6. `not`, puis `and`, puis `xor`, puis `or`.

Les parenthèses changent la priorité (D1110).

Les conditions se joignent par les opérateurs logiques `and`, `or`, `xor` et `not` (D1571).
`not` lie le plus fort, puis `and`, puis `xor`, puis `or` ; tous passent après les comparaisons.
`a or b and c` se lit donc `a or (b and c)`. Le signe `!` est le factoriel, jamais la négation
(D577).

## Ce qu'un type permet

Tout type déclare ce que le langage peut faire de ses valeurs (D579–D584).
Sa signature a six parties.

- **La conversion intrinsèque** : une fonction au nom du type convertit
  une valeur, `text(x)`, `date(x)`, `integer(CLCTCECHEA)` (D579, D1568).
  C'est la seule écriture de la conversion explicite. La promotion
  implicite n'a lieu que sans perte (D581). Une conversion impossible,
  `integer("abc")`, échoue proprement, jamais en silence (D304, D312).
- **La table des opérateurs** : les combinaisons admises et le type du
  résultat, `date - date` rend une durée.
- **Les comparateurs** : l'ordre des valeurs, celui des règles de tri.
- **Le `if` suffixé et sa chaîne** : `valeur if condition else valeur if
  condition else valeur`. Les cas se lisent de gauche à droite, dans
  l'ordre ; le dernier est sans condition (D580, D1109, D1110).
- **Le `select`** : `valeur.select(cas: résultat, …)`, la table de
  correspondance d'une valeur.
- **Les fonctions dédiées** : `distance` pour la géolocalisation (D579),
  `extract` pour le texte (D817).

## Le conditionnel

Le conditionnel s'écrit `valeur if condition else autre`. Les cas
s'enchaînent par `else … if …`, lus de gauche à droite ; les parenthèses
changent la priorité ; un `if` seul vaut nul sinon (D580, D1003, D1109,
D1110). Un jeu de valeurs s'écrit `.select(clé: valeur, "...": défaut)`
sur le type (D584). Les fonctions d'agrégation acceptent un `if` suffixé (D887, D1564).

```yaml
# Le montant signé : le conditionnel natif
montant_signe: credit if credit is not null else -debit

# L'état en clair : un jeu de valeurs sur le type, avec son défaut
etat_lisible: 'etat.select(brouillon: "En cours", valide: "Validée", "...": "Autre")'

# La dernière sortie : une fonction d'agrégation filtrée par un if suffixé
derniere_sortie: mouvements.max(date if sens = "sortie")
```

## Le `select`

Le `select` a deux conduites (D1002) :

- sans le cas `"..."`, une valeur hors des cas est rejetée ;
- avec le cas `"..."`, toutes les autres valeurs prennent son résultat.

La reprise de l'entrepôt emploie les deux. La langue d'un tiers n'admet
que quatre codes ; l'usage d'une adresse range tout le reste en
« autre » :

```yaml
# La langue du tiers : quatre codes, une valeur hors de la table est rejetée
langue: 'CLCTLANGUE.select(01: "fr", 03: "en", 05: "de", 07: "es")'

# L'usage de l'adresse : deux codes, tout le reste est « autre »
usage: 'ADCTTYPE.select(LIVRAISON: "livraison", FACTURATION: "facturation", "...": "autre")'
```

Le cas `null:` nomme le nul (D1551). Le nul et la chaîne vide ne se
confondent pas : `""` n'est pas un nul, et ne tombe pas dans `null:` ;
il se nomme `""`.

Sur un énuméré, les valeurs sont connues dès l'ingestion. Un `select` sans le cas `"..."`
doit donc les nommer toutes ; s'il en oublie une, c'est une erreur d'ingestion (D1569). Sur un
texte ou un nombre, la valeur hors de la table est rejetée à l'exécution.

## Le nul

Un nul stocké est légitime : une date de vente pas encore posée. Un nul
évalué dans une expression, en revanche, est une anomalie capturée, selon
l'endroit où l'expression s'emploie (D308, D310). Le langage donne deux
moyens de le prendre en compte :

Le test du nul s'écrit `a is null`, son inverse `a is not null` (D1573). Il rend toujours vrai
ou faux, jamais une anomalie : c'est la seule façon de tester un nul. `a = null` est une erreur
d'ingestion, qui indique `is null` ; `isnull` n'existe pas (D1585).

La fonction `ifnull(p, v)` rend `p`, ou `v` quand `p` est nul (D1574) : `ifnull(Credit, 0)`
remplace un crédit absent par zéro. `p` et `v` sont du même type, et `ifnull` ne lève jamais
d'anomalie (D1585).

```yaml
# La cohérence des dates : la règle ne joue que si la vente est posée
validation:
  - rule: date_vente >= date_achat if date_vente is not null
    message: La vente du {date_vente} précède l'achat du {date_achat}.
```

## La concaténation et le gabarit

Deux écritures joignent des textes (D1566). L'opérateur `+` concatène, et un nul y est
une anomalie, comme dans toute expression : `right("0000" + me, 4)`.

Le gabarit est l'autre écriture de la concaténation : `"{code} — {nom}"` compose un texte, et une valeur nulle
s'y écrit vide (D1106, D1566). `+` convient aux codes, le gabarit aux phrases et aux adresses.

Le `message:` d'une validation est un gabarit : les accolades y citent une
propriété, une colonne lue ou un champ de l'enregistrement, `{me.unite}`
(D1106). Le gabarit `{…}` n'est pas l'interpolation `${…}` de la
configuration, résolue au chargement
([les mécanismes](../configuration/mecanismes.md)).
