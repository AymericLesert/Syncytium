# Les feuilles

> **Une feuille** est un composant qui rend un champ : la saisie d'une
> valeur, le choix ou le regard d'un objet. Le composant par défaut d'un
> type porte le nom du type ([glossaire](../../glossaire.md)).

Chaque champ du modèle ([le modèle](../02-modele/champs.md)) se montre
par une feuille. Le type du champ choisit la feuille par défaut (D458).
Le concepteur en choisit une autre par `component:`, à trois étages
(D461) :

- au type, dans les settings ;
- au champ, dans `fields:` ;
- au nœud, dans l'arbre d'une surface.

Le plus proche l'emporte. Ce fichier est le catalogue des feuilles, une
fiche par composant, dans la forme du
[modèle de fiche](README.md#le-modèle-de-fiche). Les fiches vont de la
saisie d'une valeur au regard d'un objet, puis aux textes et images
fixes, puis à la couleur et aux codes.

## La saisie d'une valeur

Les feuilles de cette partie rendent un champ simple : un booléen, un
texte, un nombre, une heure, une date, une valeur parmi un jeu fermé.

### `checkbox`

**Nom et famille.** `checkbox`, une feuille.

**Rôle.** La case à cocher. Elle montre l'état d'un booléen, vrai ou
faux, et le change d'un clic.

**Types servis.** `boolean`. C'est le composant par défaut du type. Si
le champ est optionnel, la case a trois états : faux, vrai, nul (D377).

**Contexte consommé.** Le champ, son `mode` (D364), les droits.

**Propriétés.** Rien de propre : tout se déduit. Les libellés des états
viennent des `values` du champ (D377).

**Items.** Aucun.

**Modes et déclinaisons.**

- en modification, le clic fait le tour des états : faux, puis vrai,
  puis nul, puis faux (D374) ;
- en lecture, l'état est affiché ; le survol montre le libellé (D281) ;
- en résumé, en template et en Excel, le libellé ou la valeur (D130) ;
- la case est la même sur les trois écrans.

**États et interactions.** La case est grisée si le champ est
`readonly` ou si les droits l'imposent. En recherche, la case sert le
filtre. Le tri-état vise les lignes nulles. Si le champ est obligatoire,
la position nulle dit « tous » (D375, D376).

**Décisions fondatrices.** D130, D281, D364, D374–D377.

**Exemple de configuration.** Dans le cas 5 (entrepôt),
`05_entrepot/versions/beta/v1.0.0.1/stock/depot/depot.yml` :

```yaml
# Les champs
fields:

  actif:
    type: boolean
    required: true
    default: false
    label: Actif
    description: Les paramètres sont les dépôts actifs ; né d'une autre origine, le dépôt naît inactif, à son défaut.
```

Dans le cas 3 (véhicule),
`03_vehicule/versions/beta/v1.0.0.0/transport/entretien/fields.yml`, le
booléen est optionnel : la case a trois états.

```yaml
# La révision : un booléen optionnel
revision:
  type: boolean
  label: Révision ?
  hint: La ligne est une révision — sinon, une intervention hors révision.
  description: >-
    Le booléen suffit, la référence à la règle n'avait pas d'intérêt ; les révisions faites restent des lignes du
    journal.
```

Les autres propriétés, sur un exemple. Un booléen obligatoire naît faux,
sauf `default:` (D377). Dans le formulaire, la forme explicite
`field[active]` lève l'ambiguïté entre le champ et le composant (D460).
La forme riche ouvre les propriétés du nœud (D270), dont `resources:`,
la ressource de chaque valeur (D1608).

```yaml
# Les champs : deux booléens, l'un obligatoire, l'autre optionnel
fields:

  # L'activité : obligatoire, deux états, la case simple
  active:
    type: boolean
    required: true
    # Le défaut : l'obligatoire naît faux sans lui
    default: true
    # Les libellés des deux états
    values:
      true: { label: { fr: Actif } }
      false: { label: { fr: Inactif } }

  # L'audit : optionnel, la case à trois états
  audited:
    type: boolean
    hint: { fr: "Audit réalisé ?" }

# L'interface : la liste et le formulaire
gui:

  # La liste : les deux cases en colonne, au filtre et en édition en ligne
  lists:
    main:
      columns: [code, company_name, active, audited]
      # Le filtre : le tri-état pour audited, « tous » pour active
      searchable: [active, audited]
      # L'édition en ligne : le clic fait le tour des états
      editable: [active]

  # Le formulaire : la forme explicite, puis la forme riche
  forms:
    record:
      items:
        - section:
            title: { fr: Statut }
            items:
              - field[active]
              - field[audited]:
                  readonly: true
                  # La ressource de chaque valeur : coché, vide, et le nul distinct
                  resources:
                    true: check
                    false: empty
                    null: dash
                  # La taille
                  size: 24px
```

### `toggle`

**Nom et famille.** `toggle`, une feuille.

**Rôle.** L'interrupteur. Il montre le vrai ou faux d'un booléen, et
bascule d'un geste. L'état se lit à la position.

**Types servis.** `boolean` obligatoire seulement : le champ porte
`required`, car l'interrupteur n'a jamais d'état nul (D281, D377). Il
surcharge le défaut par `component: toggle`.

**Contexte consommé.** Le champ, son `mode` (D364), les droits.

**Propriétés.** Rien de propre : tout se déduit. Les libellés des états
viennent des `values` du champ (D377) et se montrent au survol (D281).

**Items.** Aucun.

**Modes et déclinaisons.**

- en modification, la bascule au clic, ou au glissé sur tactile ;
- en lecture, la position figée ;
- en résumé, en template et en Excel, le libellé ou la valeur (D130) ;
- l'interrupteur est le même sur les trois écrans : sa cible tactile
  suffit d'elle-même.

**États et interactions.** L'interrupteur est grisé si le champ est
`readonly` ou si les droits l'imposent. En recherche, il filtre vrai ou
faux seulement. Le « tous » n'existe pas en toggle : c'est la
réinitialisation du filtre qui le désengage (D375–D377). La case à trois
états reste le composant du « tous » (D376).

**Décisions fondatrices.** D130, D281, D364, D375–D377, D461.

**Exemple de configuration.** La surcharge du défaut `checkbox` se
déclare au champ, pour toutes les surfaces, ou au nœud, pour un seul
formulaire (D461). Le toggle filtre vrai ou faux, et la réinitialisation
désengage (D375, D377).

```yaml
# Les champs : un booléen obligatoire rendu en interrupteur
fields:

  # L'automatisation : obligatoire, jamais de nul
  automated:
    type: boolean
    required: true
    default: false
    # La surcharge du défaut checkbox, au champ
    component: toggle
    # Les libellés des deux états
    values:
      true: { label: { fr: Automatisé } }
      false: { label: { fr: Manuel } }

# L'interface : la liste et le formulaire
gui:

  # La liste : l'interrupteur en colonne, au filtre et en édition en ligne
  lists:
    main:
      columns: [code, name, automated]
      # Le filtre : vrai ou faux, la réinitialisation désengage
      searchable: [automated]
      # L'édition en ligne : la bascule
      editable: [automated]

  # Le formulaire : la surcharge au nœud, pour ce formulaire seul
  forms:
    record:
      items:
        - section:
            title: { fr: Fonctionnement }
            items:
              - field[automated]:
                  component: toggle
                  size: 32px
```

### `text`

**Nom et famille.** `text`, une feuille.

**Rôle.** La zone de texte. Elle saisit et affiche un texte, du mot
court au paragraphe.

**Types servis.** `text`, dont elle est le composant par défaut (D458).
Les composés à base de texte aussi : `email`, `url`, `phone`, `siren`…
Elle en est le défaut, et la validation intégrée vient du type (D391).

**Contexte consommé.** Le champ : sa taille (D366), son masque (D260),
sa recherche (D367). Son `mode`, les droits.

**Propriétés.**

- **Les trois parties** (D271) : le libellé, la zone de saisie et la
  post-zone. La post-zone porte la devise, le `%`, une abréviation, ou
  rien. Elle vient du type (D271, D391).
- **Mono ou multi-ligne**, déduit de la taille du champ face au seuil
  de l'instance (D366). `component:` le surcharge.
- **`shortcut:`**, le raccourci du texte long (D464). Il porte `lines`,
  le nombre de lignes visibles ; `icon`, l'icône du déploiement, citée
  par l'identifiant d'une ressource (D1625) ; `label`, le libellé par
  langue, « Voir plus ». Sans `shortcut:`, le moteur applique son défaut
  traduit.
- **`style:`**, « la fonte, la taille et sa mise en forme » (D536). Le
  défaut vient du thème choisi par l'utilisateur (D752–D755). Un thème
  combine des styles du catalogue ; un style porte le HTML des types et
  le CSS3. La surcharge suit la cascade (D461) :
  `style: { font: Roboto, size: 14px, format: [bold, italic] }`. Le
  `size` intérieur est la taille de la police ; D458 départage ce
  `size` de la taille du composant (D1635).

**Items.** Aucun.

**Modes et déclinaisons.**

- en modification, la saisie, guidée par le masque s'il existe ; les
  lignes du masque font les lignes de la zone (D366) ;
- en lecture, le texte ; le multi-ligne est justifié (D447) ; le
  « voir plus » apparaît au-delà des `lines` ;
- en résumé, le « libellé pour widget » et la valeur ;
- en template et en Excel, la valeur ;
- sur smartphone, le libellé est plus petit, au-dessus (D262), ou
  remplacé par son `abbreviation:` (D265, D1619) ; l'abréviation
  s'affiche aussi partout où la place manque (D1622) ;
- sur tablette et smartphone, il n'y a pas de survol : le texte de
  `hint:` se lit par un clic sur une petite icône « ? » à côté du
  champ, ou en texte plus petit sous la zone (D1618) ; le composant
  choisit selon la place disponible (D1620).

**États et interactions.** La zone est grisée si le champ est
`readonly` ou si les droits l'imposent. Le refus de validation
s'affiche au champ (D307). En recherche, le mode vient du champ :
`strict`, `normalized`, `similarity[x]` ou `mutualizable[nom]`
(D367, D368). La boîte filtre au fil de la frappe (D228).

**Décisions fondatrices.** D222, D228, D260, D262, D265, D271, D307,
D366–D368, D391, D447, D458, D461, D464, D536, D752–D755, D1618–D1620,
D1622, D1635.

**Exemple de configuration.** Dans le cas 5 (entrepôt),
`05_entrepot/versions/beta/v1.0.0.1/stock/depot/depot.yml` :

```yaml
# Les champs
fields:

  code:
    type: text[..6]
    required: true
    label: Code

  libelle:
    type: text[..40]
    label: Libellé
    description: Connu par les paramètres seulement ; vide pour un dépôt né des mouvements ou des fiches articles.
```

Les autres propriétés, sur un exemple. `name` reste sous le seuil : une
ligne. `notes` n'a pas de taille : le multi-ligne se déduit (D366), et
`shortcut:` le replie (D464). `registration` est guidé par un masque
(D260, D366). La liste filtre au fil de la frappe (D228, D441). Le nœud
surcharge le raccourci pour ce formulaire (D461, D464).

```yaml
# Les champs : trois textes, court, long et masqué
fields:

  # Le nom : sous le seuil, une ligne
  name: text[80]

  # Les notes : sans taille, le multi-ligne se déduit
  notes:
    type: text
    # Le raccourci : quatre lignes visibles, puis l'icône et son libellé
    shortcut:
      lines: 4
      icon: next
      label: { fr: Voir plus, en: More }

  # L'immatriculation : la saisie guidée par le masque
  registration:
    type: text
    mask: "FR__ ____ [A-E]9"

# L'interface : la liste et le formulaire
gui:

  # La liste : la boîte de recherche filtre au fil de la frappe
  lists:
    main:
      columns: [name, registration]
      searchable: [name]

  # Le formulaire : le raccourci surchargé au nœud
  forms:
    record:
      items:
        - section:
            title: { fr: Identité }
            items:
              - field[name]
              - field[notes]:
                  shortcut: { lines: 6 }
              - field[registration]
```

### `number`

**Nom et famille.** `number`, une feuille.

**Rôle.** La zone numérique. Elle saisit et affiche un nombre, entier ou
décimal.

**Types servis.** `integer` et `decimal`, dont elle est le composant par
défaut. Les composés à base numérique aussi : `amount`, `percentage`,
`measure`. Elle en est le défaut, et la post-zone vient du type (D391).

**Contexte consommé.** Le champ : ses bornes (D372), ses décimales
(D373), son masque (D370), l'unité ou la devise du composé. Son `mode`,
les droits.

**Propriétés.**

- **Les trois parties** (D271, D272) : le libellé, la zone de saisie et
  la post-zone. La post-zone porte l'unité, la devise ou le `%`. Selon
  la langue, elle se place avant ou après (D272).
- **Le masque-format** : `"00 00 00"`, `"0 000.00"`. Le `0` figure un
  chiffre ; les séparateurs se rendent selon la langue (D370, D373).
- **L'alignement à droite** (D447).

**Items.** Aucun.

**Modes et déclinaisons.**

- en modification, la saisie guidée par le masque ; sur tactile, le
  clavier numérique, la calculatrice ou le clavier stylisé (D272) ; la
  calculatrice est le satellite `calculator` ; sur smartphone, elle
  remplace le clavier natif ;
- en lecture, le nombre formaté ;
- en résumé, le « libellé pour widget » et la valeur ;
- en template et en Excel, la valeur canonique : Excel reçoit le nombre,
  jamais la chaîne.

**États et interactions.** La zone est grisée si le champ est
`readonly` ou si les droits l'imposent. Le refus des bornes et des
validations s'affiche au champ (D307). En recherche, le mode vient du
champ : `strict`, `range` pour une plage, l'usage roi du nombre, ou
`mutualizable` par la forme affichée (D369, D371).

Pour `measure` et `duration`, la matrice de conversion est visible
(D980) : « la facette de saisie doit permettre de visualiser la matrice
et les règles de conversion ». À la demande, le volet du composant
montre la matrice du champ sur cet enregistrement :

- les unités connues et apportées (D978) ;
- les coefficients ;
- les chemins de transitivité (D979).

L'unité de la saisie se choisit parmi celles de la matrice. Une unité
nouvelle se déclare avec son coefficient vers une unité connue. Le volet
s'ouvre par une icône en post-zone, comme le lien d'une `url` (D563), et
montre un tableau (D1635).

**Décisions fondatrices.** D271–D273, D307, D369–D373, D391, D447,
D563, D978–D980, D1635.

**Exemple de configuration.** Dans le cas 4 (banque),
`04_banque/versions/beta/v1.0.0.0/banque/ecriture/fields.yml` :

```yaml
# Le montant : un composé, la devise dans la valeur
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

Les autres propriétés, sur un exemple. `price` est un composé : la
devise va en post-zone (D391). `weight` porte un masque, dont les
séparateurs suivent la langue (D373). La liste cherche `price` par une
plage (D371). Le nœud `weight` prend le satellite `calculator` (D461).

```yaml
# Les champs : un entier, un montant, une mesure
fields:

  # La quantité : un entier positif, aligné à droite
  quantity: integer[0..]

  # Le prix : un composé, la devise en post-zone
  price:
    type: amount
    currencies: [EUR]

  # Le poids : une mesure, le masque aux séparateurs de la langue
  weight:
    type: measure
    units: [kg, g]
    mask: "0 000.00"

# L'interface : la liste et le formulaire
gui:

  # La liste : la recherche du prix par une plage
  lists:
    main:
      columns: [quantity, price, weight]
      searchable: [price]
      editable: [quantity]

  # Le formulaire : la calculatrice au nœud du poids
  forms:
    record:
      items:
        - section:
            title: { fr: Mesures }
            items:
              - field[quantity]
              - field[price]
              - field[weight]:
                  component: calculator
```

### `calculator`

**Nom et famille.** `calculator`, une feuille, le satellite de
`number`.

**Rôle.** La calculatrice. Elle saisit un nombre au tactile, avec les
calculs élémentaires : `+`, `−`, `×`, `÷`. Le résultat alimente le
champ.

**Types servis.** Les numériques : `integer`, `decimal` et leurs
composés. Elle n'est jamais un défaut. Elle se déclare par
`component: calculator`, aux trois étages (D461). Sur smartphone et sur
tablette, elle remplace le clavier natif.

**Contexte consommé.** Le champ : ses bornes, ses décimales, son
masque. Son `mode`, les droits.

**Propriétés.** Aucune propre. Les touches et les opérations
élémentaires sont livrées. Le format vient du champ (D370, D373).

**Items.** Aucun.

**Modes et déclinaisons.**

- en modification seulement : la calculatrice est une saisie ;
- en lecture, en résumé, en template et en Excel, le rendu `number`
  standard ;
- sur le poste informatique, elle s'ouvre au clic sur une icône près
  du champ ; sur tactile, c'est le plein usage.

**États et interactions.** La calculatrice est grisée si le champ est
`readonly` ou si les droits l'imposent. Le refus des bornes s'affiche au
champ (D307).

**Décisions fondatrices.** D272, D307, D370, D373, D461.

**Exemple de configuration.** La surcharge au champ vaut partout. La
surcharge au nœud vaut pour ce formulaire seul (D461).

```yaml
# Les champs : deux numériques, l'un rendu partout en calculatrice
fields:

  # La quantité : un entier, la calculatrice au nœud seulement
  quantity: integer[1..]

  # La remise : un décimal borné, la calculatrice partout
  discount:
    type: decimal[0..100]
    decimals: 2
    component: calculator

# L'interface : le formulaire
gui:

  # Le formulaire : la surcharge au nœud de la quantité
  forms:
    record:
      items:
        - section:
            title: { fr: Ligne }
            items:
              - field[quantity]:
                  component: calculator
              - field[discount]
```

### `gauge`

**Nom et famille.** `gauge`, une feuille, le satellite des numériques
bornés. « La jauge étant un cas particulier d'un range » (D498) : le
minimum, la valeur et le maximum en une (D494).

**Rôle.** La jauge. Elle montre la valeur dans son cadre, d'un coup
d'œil : la barre qui se remplit entre les bornes.

**Types servis.** Les numériques bornés : `integer[a..b]`,
`decimal[a..b]`, l'`amount` borné, « un montant entre 0 et 10 000 € »
(D275). Le `percentage` dans son cadre 0..100 en est le choix naturel
(D274). La jauge se déclare par `component: gauge`. Les bornes sont
exigées : sans bornes, pas de jauge, une erreur d'ingestion (D344).

**Contexte consommé.** Le champ : ses bornes, ses décimales. Son
`mode`, les droits.

**Propriétés.**

- **Les trois valeurs en une** (D494, qui précise D241) : `min`,
  `value`, `max`. Le minimum et le maximum sont fixes ou dépendants,
  d'un champ ou d'une formule. Les bornes du type sont le défaut
  (D276).
- **`colors:`** (D467), sous trois formes. Le dégradé entre deux
  couleurs, `{ min: red, max: green }`, est le défaut, du rouge au
  vert. Les seuils, `{ 0: red, 50: orange, 80: green }`. La table de
  référence (D495) : une entité et ses liaisons, la colonne du seuil,
  la colonne de la couleur,
  `colors: { from: quality.threshold, threshold: level, color: tint }`
  (D1635).
- **`resources:`**, l'icône selon la valeur, aux mêmes seuils que les
  couleurs (D1609, D1611) : `resources: { 0: empty, 50: half, 80: full }`.
  Les noms viennent du catalogue des ressources. Le défaut du socle se
  surcharge par les settings ou au champ.

**Items.** Aucun.

**Modes et déclinaisons.**

- la lecture d'abord : la valeur en un regard, dans les listes, les
  résumés, les widgets ;
- en modification, le glissé est possible, mais `slider` est le
  composant de saisie dédié (D275) ;
- en template et en Excel, la valeur canonique ;
- la jauge est la même sur les trois écrans.

**États et interactions.** Le dépassement : un `percentage` hors de son
cadre change de représentation (D391). La jauge est grisée si le champ
est `readonly` ou si les droits l'imposent.

**Décisions fondatrices.** D241, D274–D276, D344, D391, D467,
D494–D495, D498, D1609, D1611, D1635.

**Exemple de configuration.** Dans le cas 3 (véhicule),
`03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/fields.yml` :

```yaml
# Le taux annuel : un pourcentage, la jauge dans son cadre
taux_annuel:
  type: percentage
  label: Taux annuel
  hint: Le taux nominal du crédit — 6,187.
```

Les autres propriétés, sur un exemple. Le `percentage` prend la jauge
naturellement (D274). L'entier borné la prend par surcharge ; ses bornes
sont exigées. En cellule de liste, la jauge se lit d'un regard.

```yaml
# Les champs : un pourcentage et un entier borné
fields:

  # La satisfaction : de 0 à 100, la jauge est le choix naturel
  satisfaction: percentage

  # La charge : un entier borné, la jauge par surcharge
  workload:
    type: integer[0..40]
    component: gauge

# L'interface : la liste et le formulaire
gui:

  # La liste : la jauge en cellule, un regard
  lists:
    main:
      columns: [name, satisfaction, workload]

  # Le formulaire
  forms:
    record:
      items:
        - section:
            title: { fr: Activité }
            items:
              - field[satisfaction]
              - field[workload]
```

### `fuel`

**Nom et famille.** `fuel`, une feuille, le cadran à aiguille, le
cousin circulaire de la jauge.

**Rôle.** Le cadran de carburant. Il montre la valeur bornée en arc,
l'aiguille pointant la position : la lecture instantanée.

**Types servis.** Les numériques bornés. Les bornes sont exigées, comme
pour `gauge`. Le cadran n'est jamais un défaut : il se déclare par
surcharge. Le type personnalisé `progression`, un `integer[0..100]`
rendu par `component: fuel`, est l'exemple fondateur de la surcharge
(D359).

**Contexte consommé.** Le champ : ses bornes, ses décimales. Son
`mode`, les droits.

**Propriétés.** L'arc se déduit des bornes. `colors:` (D467) donne le
dégradé du minimum au maximum, du rouge au vert par défaut, ou les
seuils, une couleur par valeur.

**Items.** Aucun.

**Modes et déclinaisons.**

- la lecture avant tout : les cellules, les résumés, les widgets ; le
  cadran est un affichage ;
- en modification, la saisie redevient `number` ; le cadran illustre,
  il ne saisit pas (D1635) ;
- en template et en Excel, la valeur canonique.

**États et interactions.** Le cadran est grisé si le champ est
`readonly` ou si les droits l'imposent. Le dépassement change de
représentation (D391).

**Décisions fondatrices.** D274–D275, D359, D391, D467, D1239, D1635.

**Exemple de configuration.** Le type personnalisé se déclare dans les
settings, à l'étage de la version ou du module, sous `field:` (D1239).
Le champ le cite en forme courte : le cadran vaut partout (D359).

```yaml
# Les réglages : le type personnalisé progression
field:

  # La progression : un entier de 0 à 100, rendu en cadran
  progression:
    type: integer
    min: 0
    max: 100
    component: fuel

# Les champs de la tâche : la forme courte, le cadran partout
fields:

  # Le nom
  name: text[60]

  # L'avancement : le type personnalisé
  avancement: progression

# L'interface : la liste et le formulaire
gui:

  # La liste : le cadran en cellule, la lecture instantanée
  lists:
    main:
      columns: [name, avancement]

  # Le formulaire : en modification, la saisie number, le cadran illustre
  forms:
    record:
      items:
        - section:
            title: { fr: Suivi }
            items:
              - field[avancement]
```

### `slider`

**Nom et famille.** `slider`, une feuille, le curseur, la saisie des
numériques bornés.

**Rôle.** Le curseur : « une saisie simple et sans clavier » (D275). La
poignée glisse entre les bornes, la valeur suit.

**Types servis.** Les numériques bornés. Les bornes sont exigées, dans
l'esprit de `gauge`. Le curseur n'est jamais un défaut : il se déclare
par `component: slider`, aux trois étages (D461).

**Contexte consommé.** Le champ : ses bornes, ses décimales, dont le
pas se déduit. Son `mode`, les droits.

**Propriétés.**

- le pas se déduit des décimales : `decimals: 0` donne un pas de 1 ;
- `colors:` (D467) s'applique à la piste ;
- la valeur s'affiche près de la poignée.

**Items.** Aucun.

**Modes et déclinaisons.**

- en modification, le glissé ; le tactile en premier, la cible est
  large ;
- en lecture, la piste figée et la valeur ;
- en résumé, en template et en Excel, la valeur canonique ;
- le curseur est le même sur les trois écrans ; le pas tactile
  s'élargit sur smartphone.

**États et interactions.** Le curseur est grisé si le champ est
`readonly` ou si les droits l'imposent. Au clavier du poste
informatique, les flèches ajustent d'un pas : l'accessibilité.

**Décisions fondatrices.** D275, D461, D467.

**Exemple de configuration.** La surcharge au champ, avec des seuils de
couleur sur la piste (D467).

```yaml
# Les champs : un entier borné saisi au curseur
fields:

  # La charge : la surcharge, la saisie au glissé
  workload:
    type: integer[0..40]
    component: slider
    # Les seuils de couleur de la piste
    colors: { 0: green, 30: orange, 38: red }

# L'interface : le formulaire
gui:

  # Le formulaire
  forms:
    record:
      items:
        - section:
            title: { fr: Charge }
            items:
              - field[workload]
```

### `clock`

**Nom et famille.** `clock`, une feuille.

**Rôle.** L'horloge. Elle saisit et affiche une heure : « le cadran
pour saisir ou afficher » (D277).

**Types servis.** `time`, dont elle est le composant par défaut. La
partie heure d'un `datetime` aussi, en tandem avec `calendar` : la date
et l'heure combinent le calendrier et l'horloge (D280).

**Contexte consommé.** Le champ, et la précision de son crochet :
`time[hh]` jusqu'à `time[hh:mm:ss.sss]` (D277, D383). Son `mode`, les
droits.

**Propriétés.** Rien de propre. La précision vient du type. Le format
d'affichage vient de la langue : le masque de langue par défaut (D383).

**Items.** Aucun.

**Modes et déclinaisons.**

- en modification, le cadran au tactile ; sur le poste informatique, la
  saisie directe au clavier, l'horloge au clic ;
- en lecture, l'heure formatée selon la langue ;
- en résumé, en template et en Excel, la valeur canonique à la
  précision déclarée.

**États et interactions.** L'horloge est grisée si le champ est
`readonly` ou si les droits l'imposent. Le refus s'affiche au champ
(D307). En recherche, le mode vient du champ : `strict`, `range` pour
une plage horaire, ou `mutualizable` (D381).

**Décisions fondatrices.** D277, D280, D307, D381, D383.

**Exemple de configuration.** Dans le cas 5 (entrepôt),
`05_entrepot/versions/beta/v1.0.0.1/settings.yml` :

```yaml
# Les champs
field:

  # Le type time_pmi
  # Les heures de PMI : une heure lue au masque hhmmss ; une colonne en hhmm surcharge le masque au champ.
  time_pmi:
    type: time
    mask: hhmmss
```

Les autres propriétés, sur un exemple. La précision s'écrit au crochet
(D277) ; `clock` est le défaut. La liste cherche l'ouverture par une
plage horaire (D381).

```yaml
# Les champs : deux heures à la minute
fields:

  # L'ouverture : la précision au crochet
  opening: time[hh:mm]

  # La fermeture
  closing: time[hh:mm]

# L'interface : la liste et le formulaire
gui:

  # La liste : la recherche de l'ouverture par une plage horaire
  lists:
    main:
      columns: [name, opening, closing]
      searchable: [opening]

  # Le formulaire
  forms:
    record:
      items:
        - section:
            title: { fr: Horaires }
            items:
              - field[opening]
              - field[closing]
```

### `calendar`

**Nom et famille.** `calendar`, une feuille.

**Rôle.** Le calendrier. Il saisit et affiche une date : la vue par
année, par mois ou par semaine, et les raccourcis du quotidien.

**Types servis.** `date`, dont il est le composant par défaut. La
partie date d'un `datetime` aussi, en tandem avec `clock` (D280). La
granularité s'écrit au crochet : `date[yyyy-mm-dd]`, `date[yyyy-mm]`,
`date[yyyy-ww]`, « le calendrier au bon grain » (D382).

**Contexte consommé.** Le champ : sa granularité, ses bornes ISO, le
masque de langue (D383). La langue : le numéro de semaine et le premier
jour de la semaine en dépendent (D279). Le `mode`, les droits.

**Propriétés.** Rien de propre. Les raccourcis sont livrés et
traduits : aujourd'hui, la veille, hier, le début et la fin de mois
(D278). La numérotation des semaines suit la langue (D279).

**Items.** Aucun.

**Modes et déclinaisons.**

- en modification, les steppers `[-]` et `[+]`, le jour d'avant et le
  jour d'après, au même rang que le calendrier, comme le stepper du
  nombre (D270, D785) ; aucun report de champ en post-zone (D786,
  D787) ;
- sur smartphone, le plein écran : la semaine, le mois ou l'agenda, au
  tactile ;
- sur tablette, le calendrier à proximité du champ ;
- sur le poste informatique, la saisie au clavier d'abord, le
  calendrier par l'icône ;
- en lecture, la date formatée selon la langue ;
- en template et en Excel, la valeur canonique ISO, à la granularité
  (D382).

**États et interactions.** Le calendrier est grisé si le champ est
`readonly` ou si les droits l'imposent. Le refus des bornes s'affiche
au champ (D307). En recherche, le mode vient du champ : `strict`,
`range` pour une plage de dates, l'usage roi (D381), ou `mutualizable`.

**Décisions fondatrices.** D270, D278–D280, D307, D381–D383,
D785–D787.

**Exemple de configuration.** Dans le cas 3 (véhicule),
`03_vehicule/versions/beta/v1.0.0.0/transport/consommation/fields.yml` :

```yaml
# La date : le calendrier au jour
date:
  type: date
  required: true
  label: Date
```

Dans le cas 3 (véhicule),
`03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/fields.yml`, la
granularité est le mois :

```yaml
# Le premier mois : la granularité au crochet
premier_mois:
  type: date[yyyy-mm]
  label: Premier mois
  hint: Le premier mois du financement — 2016-02, 2023-10.
```

### `dropdown`

**Nom et famille.** `dropdown`, une feuille.

**Rôle.** La liste déroulante. Elle choisit une valeur dans un jeu
fermé.

**Types servis.** `enum`, dont elle est le composant par défaut (D129,
D283). Le booléen décliné en liste énumérée, par la surcharge
`component: dropdown` (D281).

**Contexte consommé.** Le champ, et ses `values` : la clé, le `label`,
la `description` en infobulle, l'`icon` ou l'`image`, l'ordre de
déclaration (D387). Le `default`. La langue, le `mode`, les droits.

**Propriétés.** Rien de propre : tout vient des `values` du champ. La
ligne vide de l'optionnel porte le libellé de l'entrée `null:` (D388).

**Items.** Aucun.

**Modes et déclinaisons.**

- en modification, la liste déroulante ; sur smartphone, la liste en
  plein écran ; sur le poste informatique, les raccourcis clavier, et
  la saisie au début des mots, avec un délai entre deux frappes ;
- en lecture, le libellé, et l'icône si elle est déclarée ;
- en résumé, le libellé ;
- en template et en Excel, le code ou le libellé (D130).

**États et interactions.** La liste est grisée si le champ est
`readonly` ou si les droits l'imposent. En recherche, la liste de
sélection du jeu de valeurs, en multi-sélection (D388), ou
`mutualizable` par le libellé (D369).

**Décisions fondatrices.** D129, D130, D281, D283, D369, D387–D388.

**Exemple de configuration.** Dans le cas 3 (véhicule),
`03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/fields.yml` :

```yaml
# Le type de véhicule : un énuméré à deux valeurs
type:
  type: enum
  required: true
  label: Type de véhicule
  hint: Il porte l'unité de la consommation — les litres du thermique, les kWh de l'électrique.
  description: L'unité vit dans le type, pas dans la valeur.
  values:
    thermique:  { label: Thermique }
    electrique: { label: Électrique }
```

### `radios`

**Nom et famille.** `radios`, une feuille.

**Rôle.** Les boutons radios. Le jeu de valeurs est étalé sous les
yeux, un clic choisit : le choix visible, sans dérouler.

**Types servis.** `enum` aux petits jeux de valeurs. Le booléen décliné
(D281). Les radios ne sont jamais un défaut : elles se déclarent par
`component: radios` (D284, D285). Le seuil borne la surcharge (D468,
D1612) : c'est un élément de la configuration générale, à la cascade
des settings, `field: { enum: { radios: 5 } }`. Au-delà du seuil, le
champ se replie en `dropdown` (D1635).

**Contexte consommé.** Les `values` du champ : le `label`, la
`description`, l'`icon` (D387). Le `mode`, les droits.

**Propriétés.** Rien de déclaré. La disposition se déduit de la place :
les radios s'empilent sur smartphone.

**Items.** Aucun.

**Modes et déclinaisons.**

- en modification, le clic direct, tout est visible ;
- en lecture, le libellé de la valeur, sobre ;
- en template et en Excel, le code ou le libellé (D130).

**États et interactions.** Les radios sont grisées si le champ est
`readonly` ou si les droits l'imposent. En recherche, les radios ne
servent pas : le composant de recherche de l'énuméré reste la liste en
multi-sélection (D388).

**Décisions fondatrices.** D129, D130, D281, D283–D285, D387–D388,
D461, D468, D1612, D1635.

**Exemple de configuration.** La surcharge au nœud : trois valeurs
étalées, le clic direct (D461).

```yaml
# Les champs : un énuméré à trois valeurs
fields:

  # La priorité
  priority:
    type: enum
    values:
      low: { label: { fr: Basse } }
      normal: { label: { fr: Normale } }
      high: { label: { fr: Haute } }
    default: normal

# L'interface : le formulaire
gui:

  # Le formulaire : les radios au nœud
  forms:
    record:
      items:
        - section:
            title: { fr: Priorité }
            items:
              - field[priority]:
                  component: radios
```

### `icons`

**Nom et famille.** `icons`, une feuille.

**Rôle.** Le jeu d'icônes : l'énuméré en images. Chaque valeur est une
icône ; le choix se fait d'un regard et d'un clic.

**Types servis.** `enum` dont les `values` portent `icon` ou `image`
(D283, D387). Sans icônes déclarées, pas d'`icons` : c'est une erreur
d'ingestion (D1635). Le jeu d'icônes n'est jamais un défaut : il se
déclare par `component: icons`.

**Contexte consommé.** Les `values` du champ : l'`icon` ou l'`image`,
prises dans `resources/` (D346), et le `label` pour l'infobulle. Le
`mode`, les droits.

**Propriétés.** `size:`, la taille des icônes, dans le vocabulaire
unique des composants (D461). Rien d'autre : les icônes viennent des
`values`.

**Items.** Aucun.

**Modes et déclinaisons.**

- en modification, les icônes étalées, la sélection marquée ; sur
  smartphone, le choix par image prend l'écran et s'empile ;
- en lecture, l'icône de la valeur, le libellé en infobulle ;
- en template, l'icône rendue, l'image au PDF (D257) ;
- en Excel, le code ou le libellé (D130).

**États et interactions.** Le jeu est grisé si le champ est `readonly`
ou si les droits l'imposent. En recherche, la liste du jeu en
multi-sélection, icônes affichées (D388).

**Décisions fondatrices.** D130, D257, D283, D346, D387–D388, D461,
D1625, D1635.

**Exemple de configuration.** Chaque valeur cite son icône par
l'identifiant d'une ressource (D1625). La surcharge au champ vaut
partout ; la taille se règle au nœud (D461).

```yaml
# Les champs : un énuméré dont chaque valeur porte une icône
fields:

  # La catégorie : les icônes partout, par la surcharge au champ
  category:
    type: enum
    # Les valeurs : le libellé et l'identifiant d'une ressource
    values:
      bronze: { label: { fr: Bronze }, icon: bronze }
      silver: { label: { fr: Argent }, icon: silver }
      gold: { label: { fr: Or }, icon: gold }
    default: bronze
    component: icons

# L'interface : la liste et le formulaire
gui:

  # La liste : l'icône en cellule
  lists:
    main:
      columns: [code, company_name, category]

  # Le formulaire : la taille des icônes au nœud
  forms:
    record:
      items:
        - section:
            title: { fr: Classification }
            items:
              - field[category]: { size: 48px }
```

## Le choix et le regard d'un objet

Les feuilles de cette partie rendent un objet : un enregistrement
pointé, un fichier, une image, une position, un fil d'échanges, une
collection de valeurs. Elles le choisissent, et le donnent à regarder.

### `picker.record`

**Nom et famille.** `picker.record`, une feuille, de la famille des
pickers (D470).

**Rôle.** Le sélecteur d'enregistrement. Il choisit la cible d'une
référence : la liste qui cherche.

**Types servis.** La référence, dont le type est le nom de l'entité
(D396) : le sélecteur en est le défaut. L'association et la liste
d'entités aussi : leurs éléments se choisissent de la même façon
(D401). La sélection se déduit du lien : la référence est unique, la
liste et l'association sont multiples (D470, dans le vocabulaire de
D445).

**Contexte consommé.** Le champ : sa cible, son `filter`, évalué depuis
la destination avec `me.` (D395, D396). Le `title` de la cible, son
visage (D465). Les droits. À la sélection, les actifs seuls (D398).

**Propriétés.**

- **`by:`**, la présentation (D474). Le nom d'une liste de la cible
  ouvre cette liste. Le nom de son champ image ouvre la galerie des
  visages. Sans `by:`, la liste par défaut, filtrée.
- **`selection:`**, le nombre d'éléments : `one`, `multiple`, `1`, `1..`,
  `1..4`, `2..4`, `..4` (D474, D1650). Le défaut se déduit du lien (D470).
- **`anchor:`**, l'ancrage de la liste (D469) : `center`, au centre de
  l'écran ; `right`, à droite du champ ; `field`, à la place du champ.
  Le moteur a ses défauts selon l'écran ; sur smartphone, le plein
  écran.
- **`dimension:`** (D469, qui reprend D454) : le plein écran, ou le
  pourcentage en largeur et en hauteur, `dimension: 60% 80%`.

**Items.** Aucun.

**Modes et déclinaisons.**

- en modification, la liste à recherche, au début des mots, avec un
  délai entre deux frappes ; sur le poste informatique, les raccourcis
  clavier ; sur smartphone, la liste en plein écran ;
- en lecture, le titre de la cible et le lien vers sa fiche en lecture
  seule (D215) ;
- en résumé et en template, le titre ;
- en CSV, la clé fonctionnelle, jamais l'UUID (D398).

**États et interactions.** Le sélecteur est grisé si le champ est
`readonly` ou si les droits l'imposent. Le filtre restreint les
candidats (D395) ; `check: immutable` surveille ensuite. La sélection
ne propose que les actifs (D398).

**Décisions fondatrices.** D215, D284, D395–D398, D401, D445, D454,
D465, D469–D470, D474.

**Exemple de configuration.** Dans le cas 4 (banque),
`04_banque/versions/beta/v1.0.0.0/banque/ecriture/fields.yml` :

```yaml
# Le budget : une référence, le sélecteur par défaut
budget:
  type: banque.budget
  searchable: mutualizable[recherche]
  label: { fr: Budget, en: Budget, es: Presupuesto }
  description:
    fr: Le référentiel dynamique — la création directe au picker.
    en: The dynamic reference list — direct creation from the picker.
    es: El referencial dinámico — la creación directa desde el selector.
```

Les autres propriétés, sur un exemple. La référence (D396) prend le
sélecteur par défaut. Le filtre restreint les candidats (D395). Au nœud,
la présentation et la cardinalité (D474), l'ancrage (D469) et la
dimension, largeur puis hauteur (D454, D469).

```yaml
# Les champs : une référence filtrée
fields:

  # Le responsable : la référence, ses candidats restreints
  responsible:
    type: hr.employee
    filter: company = me.company
    check: immutable

# L'interface : le formulaire
gui:

  # Le formulaire : la présentation, la cardinalité, l'ancrage et la dimension
  forms:
    record:
      items:
        - section:
            title: { fr: Encadrement }
            items:
              - field[responsible]:
                  by: active_employees
                  selection: 1
                  anchor: right
                  dimension: 60% 80%
```

### `picker.image`

**Nom et famille.** `picker.image`, une feuille, la dérivée de
`picker.file` (D473), de la famille des pickers (D470).

**Rôle.** Le choix d'un ou plusieurs fichiers images, « dont la liste
des formats est exploitable par Syncytium » (D473).

**Types servis.** `image` et `thumbnail`, dont il est le défaut (D385,
D389). Le « un ou plusieurs » suit le type : la liste (D470).

**Contexte consommé.** Le champ : les `extensions` du jeu image, le
`quota`, les dimensions du crochet (D389). Le `mode`, les droits.

**Propriétés.** `anchor:` et `dimension:`, celles de la famille (D469).
Rien d'autre : les formats exploitables bornent d'eux-mêmes.

**Items.** Aucun.

**Modes et déclinaisons.**

- en modification, le dépôt : glisser ou parcourir ; sur smartphone,
  l'appareil photo et la galerie (D292) ; l'aperçu est immédiat au
  dépôt (D293), la vignette calculée (D286, D389) ;
- en lecture, la vignette, et la visionneuse au clic : le plein écran,
  le pourcentage ou la zone (D293) ;
- en template, l'image rendue (D257) ;
- en CSV, le nom du fichier.

**États et interactions.** Le sélecteur est grisé si le champ est
`readonly` ou si les droits l'imposent. Le refus des formats hors jeu et
du quota est propre (D307, D384).

**Décisions fondatrices.** D257, D286, D292–D293, D307, D384–D385,
D389–D390, D469–D470, D473, D1625.

**Exemple de configuration.** Dans le cas 3 (véhicule),
`03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/fields.yml` :

```yaml
# La photo : une image, la vignette automatique
photo:
  type: image[512x512]
  label: Photo
  hint: Le visage du véhicule — la vignette des listes et de la carte.
  description: Le visage porté par l'image ; la vignette est automatique.
```

Les autres propriétés, sur un exemple. Le crochet donne la boîte
maximale, et la vignette se calcule (D389). Le `placeholder:` est
l'icône de fond (D390), citée par l'identifiant d'une ressource (D1625).
Le sélecteur est le défaut : le dépôt, la caméra, la galerie.

```yaml
# Les champs : une image avec son icône de fond
fields:

  # La photo : la boîte maximale au crochet, l'icône de fond
  photo:
    type: image[512x512]
    placeholder: avatar

# L'interface : le formulaire
gui:

  # Le formulaire : picker.image par défaut
  forms:
    record:
      items:
        - section:
            title: { fr: Profil }
            items:
              - field[photo]
```

### `picker.file`

**Nom et famille.** `picker.file`, une feuille, de la famille des
pickers (D470, D473).

**Rôle.** Le choix d'un ou plusieurs fichiers quelconques : le dépôt,
par glisser, et le parcours.

**Types servis.** `file`, dont il est le composant par défaut (D384).
Le nombre suit le type et `selection:` (D474).

**Contexte consommé.** Le champ : ses `extensions`, en liste simple ou
à libellés, « la facture (pdf) » (D384) ; son `quota` (D162, D365). Le
`mode`, les droits.

**Propriétés.** `selection:`, le nombre (D474). `anchor:` et
`dimension:`, celles de la famille (D469).

**Items.** Aucun.

**Modes et déclinaisons.**

- en modification, le glisser-déposer et le parcours ; sur smartphone,
  l'appareil photo et la galerie si le jeu d'extensions le permet, le
  gestionnaire de fichiers sinon (D292) ; la forme à libellés guide le
  dépôt, « déposez la facture (pdf) » (D384) ;
- en lecture, le nom et les métadonnées ; le téléchargement sous
  droits ;
- en template et en CSV, le nom du fichier.

**États et interactions.** Le sélecteur est grisé si le champ est
`readonly` ou si les droits l'imposent. Le refus des extensions hors jeu
et du quota est propre (D307, D384). La déduplication est silencieuse,
au moteur (D165).

**Décisions fondatrices.** D160–D165, D292, D307, D365, D384,
D469–D474.

**Exemple de configuration.** Dans le cas 5 (entrepôt),
`05_entrepot/versions/beta/v1.0.0.1/technique/article/vie.yml` :

```yaml
# Les plans : une liste de fichiers, les extensions en liste simple
plans:
  type: list of file
  extensions: [pdf, dwg, dxf, step]
  label: Plans
  hint: Les plans de l'article, lus dans le répertoire des plans.
  description: La liste est remplie par le connecteur des plans, en complément de la base d'origine.
```

Les autres propriétés, sur un exemple. La forme à libellés des
extensions guide le dépôt (D384). Au nœud, `selection: 1` n'admet qu'un
fichier (D474).

```yaml
# Les champs : un fichier aux extensions à libellés
fields:

  # La facture : les extensions à libellés, le quota
  invoice:
    type: file
    extensions:
      pdf: { fr: facture }
      docx: { fr: document qualité }
    quota: 10MB

# L'interface : le formulaire
gui:

  # Le formulaire : un seul fichier
  forms:
    record:
      items:
        - section:
            title: { fr: Documents }
            items:
              - field[invoice]:
                  selection: 1
```

### `viewer`

**Nom et famille.** `viewer`, une feuille. « Image-viewer et carousel
sont un même objet : viewer » (D475). « Viewer est le composant
graphique et carousel un mode d'affichage » (D477).

**Rôle.** La visionneuse : le fichier regardé. La vignette en place, le
plein cadre au clic. Elle sert :

- tout type visualisable : l'image n'est « qu'un type parmi tant
  d'autres », avec le PDF, le Word, l'Excel, le PowerPoint… ;
- les collections, par le mode carousel ;
- le document paginé, feuilleté : « un carrousel d'un document PDF
  correspond à un défilement des pages » (D481) ;
- le document généré : « le fichier de la facture n'existe pas en tant
  que tel mais comme un PDF généré à partir des informations de la
  facture et de ses lignes : un viewer peut faire référence à un
  template de document à générer » (D483).

**Types servis.**

- `image` et `thumbnail` en lecture : la visionneuse est le défaut de
  leur mode lecture (D286, D293) ;
- `file`, si son format est visualisable ; sinon la vignette de
  fichier ;
- les collections : une `list of image`, une association ou une liste
  d'entités au visage, par `image:` (D386), une liste de fichiers ;
- le document paginé seul, PDF ou PowerPoint, en mode carousel : la
  page fait l'image (D481) ;
- le template : le document généré à la volée depuis l'enregistrement,
  sans fichier stocké (D483).

**Contexte consommé.** Le champ ou le lien (D470), ou le template et
l'enregistrement pour la génération à la volée (D483). Les dimensions
du crochet et la vignette automatique (D389). Le `placeholder` (D390).
Les visages des cibles. Les droits.

**Propriétés.**

- **`dimension:`**, celle de la visionneuse (D454, D469, D484).
- **`mode:`** : « le viewer peut afficher une image, une planche ou un
  carousel » (D478). `image` montre le fichier seul en vignette.
  `mosaic` montre la planche de vignettes (D480). `carousel` montre la
  succession qui défile. Sans `mode:`, il se déduit du contenu : le
  fichier seul donne `image`, la collection donne `carousel` (D477).
  Le crochet est un raccourci de la définition du mode :
  `viewer[carousel]` vaut `mode: carousel` (D478).
- **`sheet:`**, la planche : il y a « besoin de préciser le nombre
  d'images en colonne et en ligne dans la zone » (D479). `sheet: 4x3`
  donne quatre colonnes et trois lignes. Le crochet `mosaic[4x3]` en
  est le raccourci (D480, D482). Sans `sheet:`, la planche s'adapte à
  la zone.
- **`interval:`**, le défilement automatique du carrousel,
  `interval: 5s` (D476). Sans `interval:`, le défilement est manuel.
- **`template[<nom>]`**, en item d'une surface, référence le document à
  générer, sur le modèle de `field[<nom>]` (D460). La visionneuse en
  est le composant naturel (D1635).

**Items.** Aucun.

**Modes et déclinaisons.**

- `image` : la vignette, la visionneuse au clic ; le plein écran sur
  smartphone, le pourcentage sur tablette, la zone définie sur le poste
  informatique (D293) ;
- `mosaic` : la planche, les vignettes de la collection en grille ;
  `mosaic[4x3]` fixe les colonnes et les lignes, l'excédent se
  feuillette (D479) ; le clic ouvre la visionneuse ;
- `carousel` : « une liste ou une association faisant référence à des
  images et/ou des vignettes de fichiers », la succession qui défile,
  « à intervalle régulier, sur la pression d'une touche avant/après »
  (D475) ; le clic ouvre la visionneuse ;
- en cellule et en widget, la vignette (D286) ;
- en template, l'image rendue (D257) ; le carrousel se rend en planche
  (D1635) ;
- pas de recadrage dans le socle : c'est un hook (D263).

**États et interactions.** Le `placeholder` tient la place tant que le
fichier manque ou que la collection est vide (D390). Sur tactile, le
zoom et la fermeture au geste. Les commandes avant et après ; la pause
au survol.

**Décisions fondatrices.** D257, D263, D286, D293, D386, D389–D390,
D454, D460, D469–D470, D475–D484, D1625, D1635.

**Exemple de configuration.** Le fichier seul : la boîte maximale au
crochet et la vignette automatique (D389), l'icône de fond par
l'identifiant d'une ressource (D390, D1625), la visionneuse au clic
(D293), le PDF visualisé en place (D475).

```yaml
# Les champs : une image et un contrat
fields:

  # La photo : la boîte maximale, la vignette automatique, l'icône de fond
  photo:
    type: image[512x512]
    placeholder: avatar

  # Le contrat : un PDF, visualisé en place
  contract: { type: file, extensions: [pdf] }

# L'interface : le formulaire
gui:

  # Le formulaire : la visionneuse au clic sur la photo
  forms:
    record:
      items:
        - section:
            title: { fr: Profil }
            items:
              - field[photo]:
                  dimension: 60%
              - field[contract]
```

La collection, une `list of image` (D362, D385) : le carrousel se
déduit (D477), le défilement automatique s'ajoute (D476). La planche
s'écrit au crochet (D479) ou en clair (D482).

```yaml
# Les champs : une collection d'images
fields:

  # La galerie
  gallery:
    type: list of image

# L'interface : le formulaire, trois rendus de la même galerie
gui:

  # Le formulaire : le carrousel déduit, puis la planche, au crochet et en clair
  forms:
    record:
      items:
        - section:
            title: { fr: Galerie }
            items:
              - field[gallery]:
                  interval: 5s
              - field[gallery]:
                  component: viewer[mosaic[4x3]]
              - field[gallery]:
                  component: viewer
                  mode: mosaic
                  sheet: 4x3
```

Le document paginé, feuilleté (D481) : une présentation, un mode
opératoire.

```yaml
# Les champs : un document paginé
fields:

  # Le manuel : un PDF ou un PowerPoint
  handbook:
    type: file
    extensions: [pdf, pptx]

# L'interface : le formulaire
gui:

  # Le formulaire : le défilement des pages, automatique
  forms:
    record:
      items:
        - field[handbook]:
            component: viewer[carousel]
            interval: 10s
```

Le document généré, regardé (D483) : la facture est produite à la volée
depuis l'enregistrement, et ses pages se feuillettent (D481).

```yaml
# L'interface : le patron du document et sa visionneuse
gui:

  # Le template : le patron de la facture
  templates:
    invoice:
      items:
        - field[number]
        - field[customer]

  # Le formulaire : la facture générée à la volée, ses pages feuilletées
  forms:
    record:
      items:
        - template[invoice]:
            component: viewer[carousel]
```

### `map`

**Nom et famille.** `map`, une feuille, la carte : le composant naturel
de `geolocation` (D458).

**Rôle.** La géolocalisation regardée et saisie. En lecture, la
mini-carte centrée sur le marqueur. En saisie, le pointage sur la carte
(D294).

**Types servis.** `geolocation`, le composé (D391, D392) : les
coordonnées et le texte associé, l'adresse ou le lieu. La liste de
coordonnées aussi, `list of geolocation` ou l'association aux
coordonnées : « le composant doit pouvoir s'adapter » (D513). Les
marqueurs sont alors multiples sur une même carte, reliés ou non
(D513, D514) : « les lieux de commandes pour un produit » sans relier,
« le parcours d'un commercial » relié au trait droit. `lines: true` ou
`lines: false` le dit ; le défaut est `false` (D1635). Le tracé d'une
route est un hook, « les abonnements aux outils annexes », sur le patron
du géocodage (D294) ; OSRM et Valhalla en sont les candidats open
source.

**Contexte consommé.** La valeur : les coordonnées et le texte associé
(D392). Le fond de carte déclaré à l'instance (D259, D294). La focale,
`focus:` au champ ou hérité du setting (D391). La position courante du
terminal (D291). Les droits.

**Propriétés.**

- le socle du vocabulaire (D461) : `style:`, `readonly:`… ;
- `size:`, la mini-carte à l'affichage ;
- `dimension:`, la carte dépliée au clic. Les deux forment un couple
  (D484) : `size:` à plat, `dimension:` en extension.

**Items.** Aucun.

**Modes et déclinaisons.**

- en saisie, pointer sur la carte, dans le bloc dédié (D199) ; la
  latitude et la longitude au clavier ; l'adresse géocodée par le
  connecteur, open source par défaut, BAN/Addok ou Nominatim (D294) ;
  « ma position » en point de départ (D291) ;
- en lecture, la mini-carte centrée et le marqueur, le texte associé en
  légende (D392) ;
- en cellule, la latitude et la longitude en texte court ; le clic
  déplie la carte (D294) ; en widget, comme en cellule ;
- en template, une image de la carte (D257) ;
- en CSV et en Excel, `lat,long` canonique, ré-importable (D294) ;
- le tri, par la distance à vol d'oiseau, relative à la focale (D391,
  qui amende D125) ; pas de filtre dans le socle : la proximité est un
  hook.

**États et interactions.** La position courante est lue sous réserve de
l'autorisation du terminal (D291). La carte est grisée si le champ est
`readonly` ou si les droits l'imposent. Le zoom et le déplacement au
geste.

**Décisions fondatrices.** D125, D199, D257, D259, D291, D294,
D391–D392, D458, D461, D484, D513–D514, D1635.

**Exemple de configuration.** Dans le cas 5 (entrepôt),
`05_entrepot/versions/beta/v1.0.0.1/commande/commande_vente/fields.yml` :

```yaml
# L'adresse de livraison : une géolocalisation calculée par le géocodage
adresse_livraison:
  type: geolocation
  formula: >-
    geolocation("{livraison_rue1} {livraison_rue2} {livraison_rue3}, {livraison_code_postal} {livraison_ville},
    {livraison_pays}") if livraison_ville is not null
  label: Adresse de livraison
  description: >-
    Le géocodage du détail par le connecteur de localisation : la forme texte du constructeur rend les quatre parties,
    l'adresse normalisée et le point viennent du connecteur. Le gabarit écrit vide une ligne de rue absente. Sans
    la condition, la géolocalisation refuse le texte vide : le calculé est nul quand la ville manque.
```

Les autres propriétés, sur un exemple. La géolocalisation porte les
coordonnées et le texte associé (D392). La focale du tri se déclare au
champ ; sans elle, « ma position » (D391). En cellule, le texte court,
le clic déplie la carte (D294). Au nœud, le couple `size:` et
`dimension:` (D484).

```yaml
# Les champs : un nom et une position
fields:

  # Le nom
  name: text

  # La position : les coordonnées et le texte associé, la focale du tri
  location:
    type: geolocation
    focus: 48.86,2.35

# L'interface : la liste et le formulaire
gui:

  # La liste : le texte court en cellule, le clic déplie la carte
  lists:
    main:
      columns: [name, location]

  # Le formulaire : la mini-carte à plat, la carte dépliée au clic
  forms:
    record:
      items:
        - section:
            title: { fr: Localisation }
            items:
              - field[location]:
                  size: 200px
                  dimension: 60%
```

### `thread`

**Nom et famille.** `thread`, une feuille, le fil : le composant naturel
de `communication` (D458).

**Rôle.** Le fil chronologique, regardé et nourri. Les messages sont
immuables : l'auteur, l'horodatage, le contenu. La saisie du nouveau
message est en bas (D295).

**Types servis.** `communication` (D166, D393) : un canal est un champ,
non listable ; l'auteur et l'horodatage sont générés, jamais déclarés.

**Contexte consommé.** Le fil et ses attachés : `attachments:` porte
`file`, `image` ou `thumbnail`, et leurs propriétés à plat sur le champ
(D393). La confidentialité (D25, D364) : la visibilité du fil s'y cale,
sans propriété séparée. Les notifications, en opt-in (D108–D110). Les
droits.

**Propriétés.** Le socle du vocabulaire (D461). `preview:`, le nombre
de lignes du résumé au survol en cellule, `preview: 3` (D393, D1635).

**Items.** Aucun.

**Modes et déclinaisons.**

- en saisie et en lecture, le fil chronologique, la saisie en bas, les
  pièces jointes si elles sont activées (D295) ; le fil épouse son
  contenant, une section, un onglet… « ça prend la place qu'on lui
  laisse » (D485) ; l'onglet de D167 et D186 est un habitat parmi
  d'autres ;
- sur smartphone, le fil en plein écran (D295) ;
- en cellule, une petite icône ; au survol, le ou les derniers échanges
  résumés (D393, qui amende D295) ;
- en template, le fil complet si le bloc est inclus au gabarit (D295) ;
- en Excel, exclu (D236) ;
- en recherche, le contenu des messages : `normalized`, `similarity`,
  `mutualizable` (D393).

**États et interactions.** Les messages sont immuables : jamais
d'édition ni de suppression. La visibilité suit la confidentialité
(D393). Les notifications sont en opt-in (D108–D110). En lecture seule,
le fil se consulte sans zone de saisie.

**Décisions fondatrices.** D25, D108–D110, D166–D167, D186, D236,
D295, D364, D393, D458, D461, D485, D1635.

**Exemple de configuration.** Le type de l'attaché et ses propriétés
s'écrivent à plat sur le champ (D389, D393). En colonne, l'icône, et
trois lignes au survol (D393, D1635). Dans le formulaire, le fil prend
la place qu'on lui laisse (D485).

```yaml
# Les champs : un fil d'échanges avec ses pièces jointes
fields:

  # La discussion : les attachés en image, le quota
  discussion:
    type: communication
    attachments: image[1024x1024]
    quota: 5MB

# L'interface : la liste et le formulaire
gui:

  # La liste : l'icône en cellule, trois lignes au survol
  lists:
    main:
      columns:
        - number
        - customer
        - discussion: { preview: 3 }

  # Le formulaire : le fil dans sa section
  forms:
    record:
      items:
        - section:
            title: { fr: Échanges }
            items:
              - field[discussion]
```

### `list`

**Nom et famille.** `list`, une feuille, l'éditeur de liste (D458) : le
composant naturel du type `list of <type simple>` (D362, D458). Il est
intimement lié à la liste complète (D441–D447) : c'est un même
composant (D486).

**Rôle.** La collection de valeurs simples, éditée : ajouter, retirer,
réordonner. « La phrase se lit » : `list of text` (D362).

**Types servis.** `list of <type simple>` (D362) : des textes, des
nombres, des dates… Les facettes déclarées sur le champ s'appliquent à
chaque élément : la taille, le masque… Il y a deux régimes (D296) :

- les énumérés, avec `values:`, donnent la multi-sélection ;
- les libres donnent l'éditeur.

La parenté (D486) : la liste complète et l'éditeur sont un même
composant. Une `list of <entité>`, la composition (D399), le déploie aux
colonnes de l'entité (D441). Une `list of <type simple>` le resserre sur
la colonne unique des valeurs. Les collections d'images restent au
`viewer` (D475).

**Contexte consommé.** Le champ : le type de l'élément et ses facettes
(D362). Les `values:` des énumérés. Les droits.

**Propriétés.** Le socle du vocabulaire (D461). Le vocabulaire de la
liste complète vaut partout où il garde son sens (D486) : `editable`,
`selection`, `sizable`… La colonne unique dispense de `columns`. La
liste complète a deux visages (D492) : le tableau, par `columns:`
(D441), ou la liste de widgets, par `widget: <nom du widget>` de
l'entité de l'élément. La mécanique demeure : le filtre, le tri, la
recherche, la sélection, la pagination, les opérations.

**Items.** Aucun.

**Modes et déclinaisons.**

- en saisie, la multi-sélection, par cases ou par tags, pour les
  énumérés ; l'éditeur sinon : ajouter, retirer, et réordonner quand
  l'ordre est celui de l'insertion (D296) ;
- en lecture, les tags ;
- en cellule, les premières valeurs et l'ellipse (D296) ;
- en template, les valeurs énumérées ;
- en CSV et en Excel, le séparateur interne déclaré au modèle,
  surchargeable à la fonctionnalité (D296, qui précise D223) ; la
  ré-importabilité est préservée (D237) ;
- en filtre, « contient » (D166).

**États et interactions.** Chaque élément est contrôlé par les facettes
du champ (D362) : le refus est propre à l'élément fautif. Le
réordonnancement n'existe que si l'ordre est celui de l'insertion
(D296). L'éditeur est grisé si le champ est `readonly` ou si les droits
l'imposent.

**Décisions fondatrices.** D166, D223, D237, D296, D362, D399,
D441–D447, D458, D461, D475, D486, D492.

**Exemple de configuration.** Dans le cas 5 (entrepôt),
`05_entrepot/versions/beta/v1.0.0.1/technique/article/classification.yml` :

```yaml
# Les codes matière : une liste de textes courts
matieres:
  type: list of text[..6]
  label: Codes matière
  hint: Les matières de l'article — jusqu'à neuf chez l'ERP.
```

Les autres propriétés, sur un exemple. La facette du champ contraint
chaque élément (D362). Les `values:` font l'énuméré, et la
multi-sélection (D296). En cellule, les premières valeurs et l'ellipse
(D296).

```yaml
# Les champs : deux listes, l'une libre, l'autre énumérée
fields:

  # Le nom
  name: text

  # Les mots-clés : chaque élément contraint par la facette
  keywords:
    type: list of text[30]

  # Les langues : les valeurs font l'énuméré, la multi-sélection
  languages:
    type: list of text
    values: [fr, en, de, es]

# L'interface : la liste et le formulaire
gui:

  # La liste : les premières valeurs et l'ellipse en cellule
  lists:
    main:
      columns: [name, keywords]

  # Le formulaire : l'éditeur, puis les cases ou les tags
  forms:
    record:
      items:
        - field[keywords]
        - field[languages]
```

## Le texte et l'image fixes

Deux feuilles ne rendent aucun champ. Leur contenu vient de la
configuration : un texte, une image.

### `paragraph`

**Nom et famille.** `paragraph`, une feuille (D488) : le texte fixe,
pour « mettre du texte pour indiquer les informations légales de
l'entreprise ».

**Rôle.** Le texte venu de la configuration, affiché tel quel, sans
champ derrière : la mention, l'explication, l'avertissement. La mention
d'information RGPD en est une : le texte du socle `rgpd.notice`, généré
depuis le registre, que le concepteur ancre à son choix (D1335). Le
paragraphe est aussi un gabarit : « le paragraph peut être un gabarit,
utilisable dans le cas d'une lettre » (D559). Les variables de
l'enregistrement entrent dans le texte, « Cher {{customer}}, votre
commande {{number}}… » : le publipostage.

**Types servis.** Aucun. Le contenu est déclaré par langue (D465), ou
par référence au dictionnaire du module, par `label:` (D440, D1236).

**Contexte consommé.** La langue de l'utilisateur, par le contexte
(D455). Les droits et la confidentialité.

**Propriétés.**

- **`label:`**, les libellés par langue (D465), ou la référence au
  dictionnaire (D440).
- **Le socle du vocabulaire** (D461) : `style:`…
- **Le mode publipostage**, mustache et markdown (D559–D562). Mustache
  donne les variables, `{{champ}}`, au format de la langue du document
  (D369) ; les chemins, `{{customer.address.city}}` (D71) ; les
  sections, `{{#overdue}}…{{/overdue}}`, l'itération d'une collection ;
  une puce markdown dans la section fait la liste (D561). Markdown
  donne les titres, de `#` à `####` (D250), le gras et l'italique, les
  puces et les indices, les tableaux. Les limites : aucun composant
  dans le texte, ni liste-composant, ni image ; `![…]` est exclu,
  l'image reste `picture`.
- **`if:`**, l'alinéa conditionnel à l'expression (D90) : mustache est
  sans logique. Le champ texte de l'utilisateur reste nu (D261).

**Items.** Aucun.

**Modes et déclinaisons.**

- au formulaire, le paragraphe en place ;
- en template, le texte du gabarit : les mentions légales d'une
  facture ;
- jamais en colonne : aucun champ.

**États et interactions.** La visibilité suit les droits. Rien d'autre :
le texte ne se clique pas.

**Décisions fondatrices.** D71, D90, D250, D261, D369, D440, D455,
D461, D465, D488, D536, D559–D562, D1236, D1335.

**Exemple de configuration.** Dans le cas 3 (véhicule),
`03_vehicule/versions/beta/v1.0.0.0/transport/revision/gui.yml` :

```yaml
# Les widgets
# Pas de formulaire déclaré : celui du socle suffit ; la règle s'écrit dans la liste, en ligne.
widgets:

  # L'annonce
  # Le widget d'une règle échue : une alerte, un seul texte, sans lien vers le véhicule ni la règle — le foyer n'a pas
  # plus de deux véhicules. Le gabarit cite les chemins ; chaque alinéa porte sa condition.
  annonce:
    items:
      - paragraph:
          if: prochaine_date is not null
          label: "Révision « {{designation}} » du véhicule {{owner.nom}} — prévue le {{prochaine_date}}"
      - paragraph:
          if: prochaine_date is null
          label: "Révision « {{designation}} » du véhicule {{owner.nom}} — prévue à {{prochaine_km}} km"
```

Les autres propriétés, sur un exemple. Le premier paragraphe porte ses
libellés par langue (D465). Le second cite une entrée du dictionnaire du
module (D440).

```yaml
# L'interface : le pied du formulaire
gui:

  # Le formulaire : les mentions légales, par langue, puis par le dictionnaire
  forms:
    record:
      footer:
        - paragraph:
            label:
              fr: SARL Dupont — RCS Lyon 123 456 789 — TVA FR12 345678901
              en: Dupont Ltd — Trade register 123 456 789
        - paragraph:
            label: legal
```

### `picture`

**Nom et famille.** `picture`, une feuille (D488) : l'image fixe, « son
logo ».

**Rôle.** L'image venue de la configuration, affichée telle quelle,
sans champ derrière : le logo, l'illustration.

**Types servis.** Aucun. Le fichier est livré avec la configuration,
comme les icônes du menu (D439).

**Contexte consommé.** Les droits et la confidentialité.

**Propriétés.**

- l'image, par l'identifiant d'une ressource (D1625) : la forme courte
  `picture: logo`, ou `resource:` en clair (D1626) ;
- le couple `size:` et `dimension:` (D484) ; la ressource porte ses
  dimensions par format d'écran, et le `size:` du nœud la surcharge
  (D1627) ; sans `size:`, la taille que le socle donne au composant ;
  `dimension:` reste au nœud (D1629) ;
- le socle du vocabulaire (D461).

**Items.** Aucun.

**Modes et déclinaisons.**

- au formulaire, l'image en place ;
- en template, le logo du gabarit : l'entête de la facture ;
- jamais en colonne : aucun champ.

**États et interactions.** La visibilité suit les droits. Un fichier
manquant est une erreur d'ingestion (D330), jamais un placeholder.

**Décisions fondatrices.** D330, D439, D455, D461, D484, D488,
D1625–D1627, D1629.

**Exemple de configuration.** La forme courte cite l'identifiant d'une
ressource (D1625). La forme en clair (D1626) ajoute `size:`, la taille
à l'affichage (D484), qui surcharge celle de la ressource (D1627).

```yaml
# L'interface : l'entête du formulaire
gui:

  # Le formulaire : le logo en forme courte, la bannière en clair
  forms:
    record:
      header:
        - picture: logo
        - picture:
            resource: banner
            size: 120px
```

## La couleur et les codes

Trois feuilles closent le catalogue : la couleur, son sélecteur, et les
codes lisibles à la machine.

### `color`

**Nom et famille.** `color`, une feuille, le composant naturel du type
`color` (D458, D496).

**Rôle.** La couleur regardée et saisie : la pastille, avec le code
hexadécimal en légende, et le sélecteur à l'appel.

**Types servis.** `color` (D496). Le stockage est un entier : le RGB
ou RGBA assemblé, au moteur. L'affichage est hexadécimal, `#RRGGBB`,
l'alpha en option. La base des couleurs nommées traduit `red`,
`orange`, `green`… en RGB : ce sont celles de `colors:` (D467). La
validation est intégrée, la règle générale des composés.

**Contexte consommé.** Le champ, son `mode`, les droits.

**Propriétés.** Le socle du vocabulaire (D461). La saisie s'ouvre en
`picker.color` (D496) : l'ancre et la dimension du déploiement (D469,
D484).

**Items.** Aucun.

**Modes et déclinaisons.**

- en lecture, la pastille et le code hexadécimal ;
- en cellule, la pastille ;
- en saisie, le sélecteur, `picker.color` ;
- en template, la pastille imprimée ;
- en CSV et en Excel, l'hexadécimal, l'affichage canonique,
  ré-importable ;
- le tri, sur l'entier stocké, le nul en premier, la règle des composés
  (D391).

**États et interactions.** La pastille est grisée si le champ est
`readonly` ou si les droits l'imposent. Le refus des valeurs hors
format ou hors base vient de la validation du type.

**Décisions fondatrices.** D391, D458, D461, D467, D469, D484, D495,
D496.

**Exemple de configuration.** L'entité des seuils, celle que la table de
référence de `gauge` cite (D495). La couleur est un entier au moteur,
un hexadécimal à l'écran (D496).

```yaml
# Les champs : un seuil et sa couleur
fields:

  # Le niveau
  level: integer[0..100]

  # La teinte : un entier au moteur, un hexadécimal à l'écran
  tint: color

# L'interface : la liste
gui:

  # La liste : la pastille en cellule
  lists:
    main:
      columns: [level, tint]
```

### `picker.color`

**Nom et famille.** `picker.color`, une feuille, de la famille des
pickers (D470, D473, D496).

**Rôle.** « Sélectionner une couleur » : la palette qui s'ouvre, le
choix qui se referme.

**Types servis.** `color`, en saisie : le composant par défaut du type
l'appelle (D458). `list of color` (D362), en sélection multiple.

**Contexte consommé.** Le champ, et ses `values:` s'il en porte. La
base des couleurs nommées (D496). Les droits.

**Propriétés.**

- `selection:`, le nombre (D474, D1650) : `1` par défaut, ou `one`, `multiple`, `1`, `1..`, `1..4`, `2..4`, `..4` ;
- `anchor:`, le centre de l'écran, à droite du champ, ou à la place du
  champ (D469) ;
- `dimension:`, le déploiement (D469, D484) ;
- le socle du vocabulaire (D461).

**Items.** Aucun.

**Modes et déclinaisons.**

- la palette, la base des couleurs nommées, et le code hexadécimal
  saisissable ;
- si le champ porte des `values:`, la palette s'y restreint, comme
  `dropdown` et `icons` (D1636) ;
- sur smartphone, le plein écran, dans l'esprit de D293.

**États et interactions.** Le refus des valeurs hors format vient de la
validation du type. Le sélecteur est grisé si le champ est `readonly`
ou si les droits l'imposent.

**Décisions fondatrices.** D293, D362, D458, D461, D469–D470,
D473–D474, D484, D496, D1636.

**Exemple de configuration.** Au nœud, l'ancrage à droite du champ
(D469) et le déploiement (D484).

```yaml
# L'interface : le formulaire
gui:

  # Le formulaire : le sélecteur de couleur, ancré à droite, déployé à 30 %
  forms:
    record:
      items:
        - field[tint]:
            component: picker.color
            anchor: right
            dimension: 30%
```

### `qrcode` / `barcode`

**Nom et famille.** `qrcode` et `barcode`, deux feuilles jumelles, les
composants de sortie (D300). Elles partagent une fiche (D542).

**Rôle.** « Ils rendent la valeur d'un champ » (D300) : la valeur
encodée, lisible à la machine, sur l'étiquette, le document, l'écran.

**Types servis.**

- le texte à la facette `barcode:` (D988) : la valeur est un texte, la
  facette dit ce qu'il encode et le valide ; le composant en est le
  défaut en lecture, et la nature vient de la facette ;
- les champs à valeur textuelle sans facette : le texte, le compteur,
  l'`uuid`, la référence… La conversion en texte du type (D369) fait la
  valeur encodée. Le composant se déclare alors par surcharge,
  `component: qrcode`.

**Contexte consommé.** Le champ, sa valeur convertie (D369), les
droits.

**Propriétés.**

- **Le socle du vocabulaire** (D461).
- **`size:`**, à deux régimes (D543). Pour le QR code, « la taille
  unique pour les côtés » : `size: 120px`, le carré, jamais deux
  valeurs. Pour le code-barres, « largeur × hauteur » :
  `size: 200px 60px`, dans la grammaire de `size:` (D533). La saisie
  peut porter sa propre taille (D544, D1638) :
  `size: { input: 30, display: 120px }` ; la forme courte vaut
  l'affichage seul.
- **`labels:`**, « la valeur de la référence sous le code-barres »
  (D545, D1638) : `labels: true` écrit la valeur au format du champ,
  comme les libellés des graphiques (D516). Le défaut est `false`.
- **Le format du code-barres.** Il vient de la facette quand le champ
  en porte une (D988) : `barcode: ean13` au champ, le composant suit.
  Pour un champ texte sans facette, il s'écrit au crochet (D1638) :
  `component: barcode[code128]` ; le défaut est `code128`.

**Items.** Aucun.

**Modes et déclinaisons.**

- les deux modes du champ (D544) : la saisie en mode texte, dans la
  zone du champ et son régime, la taille (D366), le masque ; et
  l'affichage en mode graphique ;
- le PDF et l'étiquette en usage premier (D252) : l'impression directe
  du serveur, sur les imprimantes du système ;
- en Excel, la valeur source (D300) ;
- le scan reste hors de D300.

**États et interactions.** La lecture seule, par nature. Le code est
masqué par la confidentialité.

**Décisions fondatrices.** D252, D300, D366, D369, D410, D461, D484,
D516, D533, D542–D545, D988, D1638.

**Exemple de configuration.** L'étiquette est un template imprimé du
serveur (D252). Le compteur mutualisé (D410) se rend en QR code, au
carré (D300, D543). Le texte à la facette `barcode: ean13` prend la
nature de sa facette (D988), largeur puis hauteur (D543), la valeur
sous les barres (D545). Un texte sans facette se rend en code-barres au
format du crochet (D1638).

```yaml
# Les champs : un compteur mutualisé
fields:

  # La référence
  sku: counter[product]

# L'interface : le template de l'étiquette
gui:

  # Le template : l'étiquette imprimée du serveur
  templates:
    label:
      items:
        # Le QR code : le carré, 120 pixels de côté
        - field[sku]:
            component: qrcode
            size: 120px
        - field[name]
        # Le code-barres : un texte à la facette ean13, la largeur et la hauteur, la valeur sous les barres
        - field[ean]:
            size: 200px 60px
            labels: true
        # Un texte sans facette rendu en code-barres : le format au crochet
        - field[sku]:
            component: barcode[code128]
```
