# Les types composés

> **Un type composé** est un type prêt à l'emploi, bâti sur un ou
> plusieurs types de base, avec sa validation incorporée : un montant et
> sa devise, une mesure et son unité, une période et ses deux bornes.
> Syncytium le fournit, ou un hook l'ajoute
> ([glossaire](../../glossaire.md)).

Un composé reçoit les facettes communes à tous les types
([types.md](types.md)), sa validation intégrée et ses facettes propres
(D391). Trois règles valent pour tous.

- **Le nul se trie en premier.**
- **Les parties s'atteignent au point**, par des fonctions du type
  (D772, D773) : `montant.value`, `montant.currency`, les coordonnées
  d'une géolocalisation (D638), les bornes d'une période.
- **Le constructeur porte le nom du type** (D659) ; il compose la
  conversion avec les parties : `amount(montant.value / 6.55957, EUR)`.

## `amount`, le montant

Un montant est une valeur et sa devise (D391, D771, D772). La banque
porte ses écritures en euros ou en francs :

```yaml
# Le montant de l'écriture : la devise vit dans la valeur
montant:
  type: amount
  currencies: [EUR, FRF]
  required: true
  label: { fr: Montant, en: Amount, es: Importe }
  hint:
    fr: Signé — négatif pour une dépense.
    en: Signed — negative for an expense.
    es: Con signo — negativo para un gasto.
  description:
    fr: La devise vit dans la valeur ; le franc porte l'historique antérieur au passage à l'euro.
    en: The currency lives in the value; the franc carries the history before the switch to the euro.
    es: La moneda vive en el valor; el franco lleva el histórico anterior al paso al euro.
```

- **`currencies:`** restreint les devises ; par défaut, tout l'ISO.
- **Les opérateurs** : `amount + amount` à devise compatible,
  `amount * decimal` (D581).
- **Les parties** : `.value`, `.currency`.
- **La devise par défaut** se règle dans les settings, sous `field:` et
  le nom du type, `amount: { currency: EUR }` (D991, D993, D1239).
- **Le constructeur à un argument**, `amount(v)`, prend la devise du
  champ s'il en déclare une, celle des settings sinon (D359). La reprise
  de l'entrepôt lit ainsi des prix sans colonne de devise :
  `prix_moyen_pondere: amount(ARCNPMP)`.

## `percentage`, le pourcentage

Le pourcentage a ses bornes, 0..100 par défaut (D273, D274, D391). Hors
de ce cadre, sa représentation change : la jauge ne vaut que dans le
cadre.

```yaml
# Le taux du crédit : un pourcentage
taux_annuel:
  type: percentage
  label: Taux annuel
  hint: Le taux nominal du crédit — 6,187.
```

## `measure`, la mesure

Une mesure est une valeur et son unité (D975–D985). L'entrepôt en donne
le cas complet : l'unité d'un article, qui porte ses conversions.

```yaml
# L'unité de l'article : une mesure qui porte la matrice de conversion de l'article
unite:
  type: measure
  units: [U, kg]
  required: true
  label: Unité
  hint: Une unité de l'article, avec ses conversions — la plaque en pièces, en kilogrammes.
  description: >-
    La mesure « 1 × l'unité de stock », qui porte la matrice de conversion propre à l'article : les unités
    supplémentaires de l'ERP — la plaque — avec leur coefficient vers une unité connue, le poids unitaire comme la
    conversion de l'unité de stock vers le kilogramme ; la transitivité fait le reste, et la masse d'un mouvement est
    quantite.to(kg). Les quantités des niveaux de stock et des lignes de commande, en décimal dans l'unité de
    l'article, l'empruntent pour se convertir : (article.unite * quantite).to(kg). Les unités connues sont celles de la
    liste — U, la pièce, n'a que sa diagonale ; kg ouvre le bloc des poids — et la comparaison est normalisée (KG = kg).
```

### Les unités

`units:` dit les unités du champ, de trois façons :

- **statiques**, `units: [kg, g, t]` ;
- **par une table de référence**, `units: stock.unit` ;
- **libres**, le défaut.

Les unités **connues** du champ sont les standards du type, restreintes
par `units:`, et celles de sa déclaration. `units: [U]` ne garde que la
diagonale, U vers U vaut 1 : aucune unité standard, et la valeur est
valide en soi. La comparaison des unités est normalisée : `KG` vaut `kg`,
`T` vaut `t` (D983).

### Les conversions

Les conversions forment une matrice : les unités en lignes et en
colonnes, le coefficient à l'intersection (D976).

- **Les matrices standard** sont fournies par le type : kg, g, t ; mm,
  cm, m… Elles sont **en blocs** : les poids, les dimensions, les
  volumes ne se convertissent pas entre eux sans un coefficient apporté.
- **La matrice est propre au champ**, et ne se mutualise pas (D978).
- **Les unités supplémentaires arrivent par les données**, dans la
  valeur, chacune avec son coefficient vers une unité connue (D977) : la
  plaque d'un article vaut 12,5 kg.
- **Le coefficient** est une constante ou une expression (D975, D976).
  Une conversion peut demander des paramètres, comme la masse volumique
  pour passer d'un volume à un poids (D975).
- **La matrice est un graphe** (D979) : la conversion suit le chemin, dans
  les deux sens. Deux unités non standard se relient entre elles, comme
  `PL` vers `U` à 1, ou par une standard commune.
- **L'invariant**, vérifié à la validation du champ : toute unité
  présente atteint une unité connue du champ, sinon la valeur est non
  conforme (D979, D1554).
- **La matrice est visible à la saisie** (D980).

### Le constructeur et les fonctions

- **`measure(valeur, unité)`**, l'unité parmi celles du champ
  (D659, D975) : `epaisseur: measure(ARCNEPAISS, mm)`. Une unité hors de
  la liste est une erreur d'ingestion (D581).
- **`measure(valeur, unité, conversions)`**, le constructeur à trois
  paramètres (D982) : la liste des conversions apportées, chacune écrite
  `measure.convert(source, cible, coefficient)`. La reprise de
  l'entrepôt construit ainsi l'unité de l'article :

```yaml
# L'unité de l'article : l'unité de stock et ses conversions apportées par les données
unite:
  formula: >-
    measure(1, ARCTUNISTO,
      list(measure.convert(ARCTCONV1A, ARCTCONV1B, ARCNCONC01),
           measure.convert(ARCTCONV2A, ARCTCONV2B, ARCNCONC02),
           measure.convert(ARCTUNISTO, kg, ARCNPDSUNI)))
```

- **`.to(<unité>, <paramètres>)`** convertit, `quantite.to(kg)` (D975,
  D1554).
- **`.units`** rend la liste des unités connues du champ : les standards
  restreintes, les déclarées, celles des données (D983, D1007). Elle sert
  un contrôle, `me.unite in me.article.unite.units`.
- **`.value`** rend le nombre nu, sans l'unité, pour une opération hors
  de la table : `prix_unitaire * quantite.value` (D1011, D1554).

### L'unité empruntée

Un champ peut emprunter l'unité d'une référence, `unit:` (D1009, D1554) :
l'unité et la matrice sont alors celles du champ désigné. La quantité
d'un mouvement est dans l'unité de stock de son article :

```yaml
# La quantité du mouvement : une mesure qui emprunte l'unité de l'article
quantite:
  type: measure
  unit: article.unite
  required: true
  label: Quantité
  hint: Signée, dans l'unité de stock de l'article — une valeur négative est une correction.
  description: La mesure emprunte la matrice de conversion de l'article, par la référence.
```

### L'arithmétique

La table des opérateurs du type (D581, D984, D1554) :

- **`measure ± measure`**, si les unités se relient ; le résultat est
  dans l'unité de l'opérande gauche ; des unités non reliées sont une
  erreur de typage à l'ingestion ;
- **`measure * decimal`**, **`decimal * measure`**, **`measure /
  decimal`** : `article.unite * quantite` ;
- **`measure / measure`** rend un décimal, le rapport, à unités reliées ;
- **les comparaisons** se font par conversion ;
- **`measure × measure`** est hors de la table.

Les agrégats `sum`, `avg`, `min`, `max` s'appliquent aux mesures
reliées, dans l'unité du champ (D887).

### Les volumes

Sur des millions de lignes, la conversion pèse (D985). Le registre le
dit : « nous devons prévoir un mécanisme qui permette de précalculer des
valeurs pour accélérer les calculs » (D1012). La piste est à
l'implémentation : une unité canonique de stockage, `storage:
<unité>`, la valeur convertie stockée à côté de l'origine ; les agrégats
poussés au storage ; les calculés matérialisés à l'écriture (D378,
D571).

## `duration`, la durée

Une durée est un composé, comme la mesure : une valeur et son unité
(D380, D476, D838, D975–D984).

```yaml
# Le nombre de jours : une durée, la somme des intervalles
nb_jours:
  type: duration
  formula: consommations.sum(nb_jours)
  label: Nombre de jours
  hint: La durée de vie suivie — la somme des intervalles entre ravitaillements.
```

- **Les unités** : `s`, `min`, `h`, `d`, `w`, `m`, `y` (D476).
- **Le masque** : la virgule note l'heure ou la minute en centièmes,
  l'heure en dix-millièmes (D380).
- **Les parties au point** : `.days`, `.months`… (D772, D773, D838).
- **Le constructeur** : `duration(valeur, unité)`, `duration(NOCNTPSOUV,
  h)` (D659, D975).
- **Les conversions**, à paramètres s'il le faut : un temps industriel
  en centièmes vers les heures et les minutes (D975).
- **La matrice des temps** suit la forme de la mesure (D976, D978,
  D982, D1554) : la matrice standard du type, la matrice propre au champ,
  les unités apportées par les données avec leur coefficient. La frappe
  d'un poste, « 20 F/H ⇒ 3 min », s'écrit `duration(v, "F",
  list(duration.convert("F", "h", 1 / 20)))`.
- **La transitivité** et le chemin obligatoire vers une unité connue du
  champ valent comme pour la mesure (D979, D983).
- **`.units`** rend les unités connues du champ (D1007).
- **La matrice est visible à la saisie** (D980).

L'arithmétique (D984, D1554) :

- `duration ± duration`, par conversion, le résultat dans l'unité de
  l'opérande gauche ;
- `duration * decimal`, `duration / decimal` ;
- `duration / duration` rend un décimal ;
- les comparaisons ;
- avec le temps (D838) : `date + duration` rend une date, `date - date`
  rend une durée, de même pour `datetime`.

Les agrégats `sum`, `avg`, `min`, `max` s'appliquent (D887) :
`temps_gamme: nomenclature.sum(temps_ouverture if nature = "operation")`.
Le tri se fait sur la valeur ; le nul vaut 0.

## `phone`, le téléphone

Le numéro national, le défaut, ou international (D391).

## `geolocation`, la géolocalisation

Une géolocalisation a quatre parties (D961) : la latitude, la longitude,
l'adresse normalisée et l'adresse saisie, au format brut.

- **La saisie** passe par le clavier, le GPS ou le géocodage (D294,
  D637). Le connecteur `location` remplit l'adresse normalisée depuis la
  brute ou les coordonnées ; sans connecteur, elle reste vide.
- **Les parties au point** (D772, D1557) : `.latitude`, `.longitude`,
  `.address`, la normalisée, `.raw`, la brute.
- **Le constructeur a trois formes** (D659, D961) :
  `geolocation(lat, lng)`, `geolocation(texte)`,
  `geolocation(lat, lng, texte)`. Le texte est l'adresse brute.
- **Le tri** se fait sur la distance à vol d'oiseau à une focale,
  `focus:` au champ ou au setting ; par défaut, la localisation courante.
- **En texte**, la géolocalisation rend l'adresse normalisée, sinon la
  brute, sinon les coordonnées standardisées.
- **Les fonctions** : `distance`, `euclide` (D579).

L'entrepôt géocode l'adresse de livraison d'une commande :

```yaml
# L'adresse de livraison : une géolocalisation calculée depuis le texte de l'adresse
adresse_livraison:
  type: geolocation
  formula: >-
    geolocation(livraison_rue1 + " " + livraison_rue2 + " " + livraison_rue3 + ", " + livraison_code_postal + " "
    + livraison_ville + ", " + livraison_pays) if livraison_ville != null
  label: Adresse de livraison
  description: >-
    Le géocodage du détail par le connecteur de localisation : la forme texte du constructeur rend les quatre parties,
    l'adresse normalisée et le point viennent du connecteur. Sans la condition, la géolocalisation refuse le texte
    vide : le calculé est nul quand la ville manque.
```

## `period`, la période

Une période a deux bornes (D391, D890).

- **Le format** est celui de la date ou de l'heure, au crochet :
  `period[yyyy-mm]`…
- **Début ≤ fin** est intégré.
- **La recherche `range`** est son usage roi.
- **Les parties** : `min` et `max`, les bornes alignées sur `range`, et
  `gap`, la durée entre elles, nulle si la période est ouverte.
- **Le constructeur** : `period(min, max)`.

## Les identifiants contrôlés

`email`, `url`, `vat_number`, `siren`, `siret`, `iban`, `bic` suivent la
règle générale : la validation intégrée suffit (D391). `url` se lit
comme un lien : un nouvel onglet, une icône après la zone, l'ellipse en
cellule (D563).

## `communication`, le fil

Un fil de messages : un canal est un champ, et ne se liste pas (D166,
D295, D393).

- `attachments: false` par défaut, ou le type des pièces jointes, à plat.
- La visibilité suit la confidentialité.
- La recherche porte sur le contenu des messages.

## `label`, le libellé nommé

L'accès au catalogue des libellés (D440, D585, D586). Le libellé nommé
se paramètre : `label(mon_nom, { prenom: … })`, ou l'enregistrement en
paramètre, `label(mon_nom, customer)`. L'ordre des mots suit la langue.
