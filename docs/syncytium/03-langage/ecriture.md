# L'écriture d'une expression

> **Un littéral** est une valeur écrite en dur dans une formule : un
> texte, un nombre, une durée, un booléen, une date
> ([glossaire](../../glossaire.md)).

Une expression combine des littéraux, des noms de champ, des opérateurs
et des fonctions. Ce fichier dit comment chacun s'écrit, puis comment une
expression choisit entre plusieurs valeurs, traite le nul et compose un
texte.

## Les littéraux

Chaque sorte de littéral a son écriture (D1578, D1579) :

- **un texte**, entre guillemets ou entre apostrophes, au même sens :
  `"soldee"`, `'^([^.]+)\.'` ;
- **un nombre**, avec le point décimal, sans séparateur de milliers :
  `6.55957` ;
- **une durée**, en nombre suivi de son unité : `12m`, `180d`, `2h` ;
  `m` est le mois, `min` la minute ;
- **un booléen**, `true` ou `false` ; le nul, `null` ;
- **une date**, en ISO, par la fonction du type : `date("2026-01-01")` ;
- **une unité, une devise, une valeur d'énuméré**, entre guillemets,
  comme tout texte : `quantite.to("kg")`, `amount(v, "EUR")`,
  `statut = "soldee"` (D1581).

Une clé reste nue, comme celle d'un `select` : `select(EUR: …)`, comme
`select(thermique: …)`. Une déclaration YAML suit l'usage du YAML :
`units: [kg, g]`, `currency: EUR` (D1581).

## Les opérateurs

> **Un opérateur** est une fonction du type à l'écriture symbolique :
> `+`, `<`, `and` ([glossaire](../../glossaire.md)).

Trois familles d'opérateurs existent (D581, D838) :

- **les opérateurs numériques** : `+`, `-`, `*`, `/` la division réelle,
  `\` la division entière, `%` le modulo, `!` le factoriel, `**` la
  puissance (D577) ;
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

`a or b and c` se lit donc `a or (b and c)`. Les parenthèses changent la
priorité (D1110). Le signe `!` est le factoriel, jamais la négation
(D577).

## La conversion

Une fonction au nom du type convertit une valeur : `text(x)`, `date(x)`,
`integer(x)` (D579, D1568). C'est la seule écriture de la conversion
explicite.

```yaml
# Le délai de livraison du fournisseur : un texte lu, converti en entier
delai_livraison: integer(CLCTJOURFO)
```

- **La promotion implicite** n'a lieu que sans perte : un entier devient
  un décimal (D581).
- **Une conversion impossible**, `integer("abc")`, échoue proprement,
  jamais en silence (D304, D312).
- **Une conversion avec perte** est refusée à l'ingestion : un texte trop
  long pour sa cible se tronque par `left` (D934).

## Ce qu'un type apporte

Tout type déclare ce que le langage peut faire de ses valeurs, sa
signature (D579–D584) :

- **sa table d'opérateurs** : les combinaisons admises et le type du
  résultat ; `date - date` rend une durée, `date + date` est une erreur ;
- **ses comparateurs** : l'ordre de ses valeurs, celui de ses règles de
  tri ;
- **ses fonctions dédiées** : `distance` pour la géolocalisation,
  `extract` pour le texte (D579, D817).

La fiche de chaque type les donne, dans [les types](../02-modele/types.md)
et [les types composés](../02-modele/composes.md).

## Le conditionnel

> **Le conditionnel** choisit une valeur selon une condition :
> `valeur if condition else autre` ([glossaire](../../glossaire.md)).

Le conditionnel s'écrit valeur d'abord, condition ensuite (D1109, D1110) :

```yaml
# Le statut du véhicule repris : clôturé si la date de fin est posée, actif sinon
statut: '"cloture" if date_fin is not null else "actif"'
```

- **Les cas s'enchaînent** par `else … if …`, lus de gauche à droite ; le
  dernier est sans condition (D1110).
- **Un `if` sans `else`** vaut nul quand la condition est fausse (D580).
- **Une sous-expression conditionnelle** se met entre parenthèses (D1109) :

```yaml
# Les kilomètres parcourus : depuis le kilométrage initial, puis depuis la ligne précédente
km:
  type: integer
  formula: total_km - (owner.km_initial if numero = 1 else owner.consommations[me.numero - 1].total_km)
```

Une formule qui commence par un texte entre guillemets se met entre
apostrophes, sinon le YAML lit les guillemets pour lui.

## Le `select`

> **Le `select`** choisit une valeur selon une autre, comme une table de
> correspondance en ligne ([glossaire](../../glossaire.md)).

Le `select` est une fonction de la valeur, qui nomme ses cas (D584,
D1569) :

```yaml
# L'unité de consommation : un select sur l'énuméré du type de véhicule
unite:
  type: text
  formula: 'type.select(thermique: "litres", electrique: "kWh")'
```

Il a deux conduites (D1002) :

- **sans le cas `"..."`**, une valeur hors des cas est rejetée ;
- **avec le cas `"..."`**, toutes les autres valeurs prennent son
  résultat.

La reprise de l'entrepôt emploie les deux :

```yaml
# La langue du tiers : quatre codes, une valeur hors de la table est rejetée
langue: 'CLCTLANGUE.select(01: "fr", 03: "en", 05: "de", 07: "es")'

# L'usage de l'adresse : deux codes, tout le reste est « autre »
usage: 'ADCTTYPE.select(LIVRAISON: "livraison", FACTURATION: "facturation", "...": "autre")'
```

Trois règles complètent le `select` :

- **sur un énuméré**, les valeurs sont connues dès l'ingestion : un
  `select` sans `"..."` doit les nommer toutes, sinon c'est une erreur
  d'ingestion (D1569) ;
- **sur un texte ou un nombre**, la valeur hors de la table est rejetée à
  l'exécution ;
- **le cas `null:`** nomme le nul (D1551) ; la chaîne vide n'est pas un
  nul, elle se nomme `""`.

## Le nul

> **Le nul** est l'absence de valeur. Il ne se confond pas avec la chaîne
> vide ([glossaire](../../glossaire.md)).

Un nul stocké est légitime : une date de vente pas encore posée. Un nul
évalué dans une expression est une anomalie, capturée selon l'endroit où
l'expression s'emploie (D308, D310). Le langage donne deux moyens d'en
tenir compte.

**Le test du nul** s'écrit `a is null`, son inverse `a is not null`
(D1573). Il rend toujours vrai ou faux, jamais une anomalie. `a = null`
est une erreur d'ingestion, qui indique `is null` (D1585).

```yaml
# La cohérence des dates : la règle ne joue que si la vente est posée
validation:
  - rule: date_vente >= date_achat if date_vente is not null
    message: La vente du {date_vente} précède l'achat du {date_achat}.
```

**La fonction `ifnull(p, v)`** rend `p`, ou `v` quand `p` est nul (D1574).
`p` et `v` sont du même type, et `ifnull` ne lève jamais d'anomalie
(D1585) :

```yaml
# La quantité consommée : les litres, sinon la charge en kWh
quantite_n:
  formula: ifnull(nb_litres, charge)
```

## La concaténation et le gabarit

> **Un gabarit** est un texte à trous, dont les accolades citent des
> valeurs : `"{code} — {nom}"` ([glossaire](../../glossaire.md)).

Deux écritures joignent des textes (D1566) :

- **l'opérateur `+`**, pour les codes : `right("0000" + me, 4)` ; un nul y
  est une anomalie, comme dans toute expression ;
- **le gabarit**, pour les phrases et les adresses : une valeur nulle s'y
  écrit vide (D1106).

L'entrepôt assemble ainsi l'adresse de livraison, dont les lignes de rue
peuvent manquer :

```yaml
# L'adresse de livraison : un gabarit, les lignes de rue absentes s'y écrivent vides
adresse_livraison:
  type: geolocation
  formula: >-
    geolocation("{livraison_rue1} {livraison_rue2} {livraison_rue3}, {livraison_code_postal} {livraison_ville},
    {livraison_pays}") if livraison_ville is not null
```

Le `message:` d'une validation est un gabarit. Ses accolades citent une
colonne lue, un champ de l'enregistrement, ou une référence traversée
(D1106) :

```yaml
# L'unité de la ligne : connue de son article, sinon le message cite l'unité et l'article
validation:
  - rule: me.unite in me.article.unite.units
    message: L'unité {me.unite} de la ligne n'est pas une unité connue de l'article {LCCTCODART}.
```

Le gabarit `{…}` n'est pas l'interpolation `${…}` de la configuration,
résolue au chargement ([les mécanismes](../01-configuration/mecanismes.md)).
