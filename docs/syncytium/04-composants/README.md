# Les composants graphiques

> **Un composant graphique** est la représentation d'un champ à l'écran
> ou sur un document : la jauge d'un pourcentage, le calendrier d'une
> date, le toggle d'un booléen ([glossaire](../../glossaire.md)).

Une application Syncytium se montre par ses composants graphiques. Ils
sont de cinq familles :

- **les feuilles** rendent un champ : la saisie d'une valeur, le choix
  ou le regard d'un objet ;
- **les conteneurs** organisent les autres composants : les sections,
  les onglets, les pages ;
- **l'acte** déclenche une opération : le bouton, l'icône ;
- **les graphiques** résument des données : la courbe, les barres, le
  chiffre clé, le croisé ;
- **les surfaces** sont les écrans nommés que le menu adresse : la liste,
  le formulaire, le tableau de bord.

Ce chapitre est leur catalogue, une fiche par composant (D455–D457). Il
suit le vocabulaire du [glossaire](../../glossaire.md) ; les décisions
citées entre parenthèses renvoient au [registre](../../conception.md).

## Le sommaire

1. Le catalogue
   - [Le nœud](#le-nœud)
   - [Le modèle de fiche](#le-modèle-de-fiche)
   - [L'inventaire](#linventaire)
   - [Du modèle de données aux composants](#du-modèle-de-données-aux-composants)
     - [Les types simples](#les-types-simples)
     - [Les composés](#les-composés)
     - [Les liens et les générés](#les-liens-et-les-générés)
   - [La signature du nœud](#la-signature-du-nœud)
2. [Les feuilles](feuilles.md)
   - [La saisie d'une valeur](feuilles.md#la-saisie-dune-valeur)
   - [Le choix et le regard d'un objet](feuilles.md#le-choix-et-le-regard-dun-objet)
   - [Le texte et l'image fixes](feuilles.md#le-texte-et-limage-fixes)
   - [La couleur et les codes](feuilles.md#la-couleur-et-les-codes)
3. [Les conteneurs](conteneurs.md)
   - [`sections`](conteneurs.md#sections)
   - [`section`](conteneurs.md#section)
   - [`tabs`](conteneurs.md#tabs)
   - [`tab`](conteneurs.md#tab)
   - [`pages`](conteneurs.md#pages)
   - [`page`](conteneurs.md#page)
   - [`header` / `footer`](conteneurs.md#header--footer)
4. [L'acte](actes.md)
   - [`operation`](actes.md#operation)
5. [Les graphiques](graphiques.md)
   - [Le socle commun](graphiques.md#le-socle-commun)
   - [`chart.line`](graphiques.md#chartline)
   - [`chart.bars`](graphiques.md#chartbars)
   - [`chart.pie`](graphiques.md#chartpie)
   - [`chart.scatter`](graphiques.md#chartscatter)
   - [`chart.combo`](graphiques.md#chartcombo)
   - [`kpi`](graphiques.md#kpi)
   - [`pivot`](graphiques.md#pivot)
6. [Les surfaces](surfaces.md)
   - [`menu`](surfaces.md#menu)
   - [`list` (la surface)](surfaces.md#list-la-surface)
   - [`form`](surfaces.md#form)
   - [`summary`](surfaces.md#summary)
   - [`widget`](surfaces.md#widget)
   - [`wizard`](surfaces.md#wizard)
   - [`dashboard`](surfaces.md#dashboard)
   - [`template`](surfaces.md#template)
   - [`chat`](surfaces.md#chat)
7. [L'assistance et la documentation](documentation.md)
   - [L'assistance — les trois groupes d'une surface](documentation.md#lassistance--les-trois-groupes-dune-surface)
   - [La documentation — la facette des composants graphiques et des surfaces](documentation.md#la-documentation--la-facette-des-composants-graphiques-et-des-surfaces)
8. [Les décisions](#les-décisions)

## Le nœud

> **Un nœud** est un composant placé dans l'arbre d'une surface. Il a un
> nom, des propriétés, des items, et reçoit un contexte
> ([glossaire](../../glossaire.md)).

Une surface est un arbre. Chaque composant en est un nœud (D455) :

- **un nom unique**, qu'un hook peut étendre ; le mot « hook »
  n'apparaît jamais dans la configuration (D408) ;
- **des propriétés**, chacune avec son défaut ;
- **des items**, ce que le composant contient ;
- **un contexte reçu** : l'enregistrement, le champ, les opérations,
  l'origine de l'appel, l'utilisateur.

Le formulaire n'est qu'un arbre parmi d'autres. L'analogie est celle des
web components (D455).

## Le modèle de fiche

Chaque fiche du catalogue suit le même plan, en dix rubriques (D457) :

1. **Nom et famille** — la clé unique ; feuille, conteneur, acte,
   graphique ou surface.
2. **Rôle** — la définition, au ton du glossaire.
3. **Types servis** — les types de champs rendus, et si le composant est
   le défaut du type (D64, D447).
4. **Contexte consommé** — ce que le composant lit (D455).
5. **Propriétés** — les réglages propres, chacun avec son défaut ; le
   moteur déduit ce qui peut l'être (D443).
6. **Items** — ce que le composant contient.
7. **Modes et déclinaisons** — la lecture, la modification, le résumé,
   le template, l'Excel ; sur le poste informatique, la tablette, le
   smartphone (D250).
8. **États et interactions** — actionnable, grisé, masqué (D444) ;
   l'affichage du refus (D307) ; le clavier, le tactile.
9. **Décisions fondatrices** — le rappel des décisions.
10. **Exemple de configuration** — la mise en situation, prise dans un
    cas du dépôt quand il en porte une.

Deux propriétés valent pour tous les composants :

- **`description:`**, par langue (D1193, D1101). Son texte entre au
  masque d'explication de la surface qui porte le composant, et nourrit
  la page de l'écran dans la documentation (D1158).
- **le mode d'usage** (D1229, D1635) : le texte générique qui dit
  comment on se sert du composant, par exemple le picker à création
  directe ou l'édition en ligne. C'est un item du catalogue des textes
  du moteur, un par composant (D1160). La documentation de l'écran le
  reprend à côté de la description du champ.

## L'inventaire

Le catalogue compte les composants suivants (D456).

- **Les surfaces** : `menu`, la porte du module (D1604) ; `form` ;
  `summary` ; `wizard` ; `widget` ; `list` ; `dashboard` ; `template` ;
  `chat`, au socle (D957).
- **Les conteneurs** : `pages`, l'entête, les pages et le pied ; `page`,
  le saut de page ; `sections`, l'organisateur (D489) ; `section`, le
  regroupement, nommé ou non ; `tabs` et `tab`.
- **Les feuilles** : `text` ; `number` ; `calculator` ; `gauge`, `fuel`
  et `slider` ; `clock` ; `calendar` ; `checkbox` ; `toggle` ;
  `dropdown`, `radios` et `icons` ; `picker.record` ; `picker.image` ;
  `picker.file` ; `picker.color` ; `viewer` ; `map` ; `paragraph` ;
  `picture` ; `thread` ; `list`, l'éditeur du type liste ; `password`,
  la saisie masquée (D463) ; `color`, la pastille (D496) ; `qrcode` et
  `barcode`, les composants de sortie (D300, D542).
- **Les graphiques** : `chart.line`, `chart.bars`, `chart.pie`,
  `chart.combo`, `chart.scatter`, le nuage de points (D512) ; `kpi` ;
  `pivot`. Un hook étend la famille, `chart.radar` par exemple (D239).
  La jauge est la feuille `gauge`.
- **L'acte** : le bouton, l'icône, le passage d'étape. L'utilisateur
  acte une opération (D432, D444, D456).

Le composant par défaut d'un type porte le nom du type (D458).

## Du modèle de données aux composants

Chaque type déclarable a son composant par défaut, et des composants
compatibles, que `component:` choisit. Quatre règles valent pour tous :

- **R1** — le composant par défaut d'un type porte le nom du type
  (D458) ;
- **R2** — une borne ouvre la famille de la jauge : `gauge`, `slider`,
  `fuel` ; pas de jauge sans bornes (D276) ;
- **R3** — des `values:` ouvrent le trio des énumérés : `dropdown` ou
  `radios`, selon le seuil des settings (D468, D1612), et `icons` si les
  valeurs portent des icônes ;
- **R4** — un hook au nom unique étend chaque ligne (D408, D452).

### Les types simples

| Type | Composant par défaut | Compatibles (`component:`) |
|---|---|---|
| `boolean` | `checkbox`, trois états : faux, vrai, nul | `toggle` |
| `text` | `text` ; mono ou multi-ligne déduit (D361) ; `shortcut` (D464) | R3 si `values:` ; `qrcode`, `barcode` en sortie (D300, D542) |
| `integer` | `number`, au masque (D372) | `calculator` ; le stepper `[-]`/`[+]` (D269) ; R2 si borné ; R3 si `values:` |
| `decimal` | `number` ; les décimales (D378) | `calculator` ; R2 si borné ; R3 si `values:` |
| `date` | `calendar` ; la nature au crochet (D381) | — |
| `time` | `clock` | — |
| `datetime` | `calendar` et `clock`, la combinaison des deux (D499) | — |
| `file` | la saisie par `picker.file` (D473) ; la lecture par le bloc fichier, icône, nom, taille (D292), ou `viewer` si le fichier se regarde (D475) | `viewer[carousel]`, le paginé feuilleté (D481) |
| `image`, `thumbnail` | la saisie par `picker.image` (D473) ; la lecture par `viewer`, la vignette et la visionneuse (D286, D293) | — |
| `uuid` | `text` formaté, à la saisie et à la lecture (D499, D419) | — |
| `password` | `password`, la saisie masquée, jamais relue (D463) | — |
| `color` | `color`, la pastille et le sélecteur (D496) | `picker.color` |
| `list of <simple>` | `list`, l'éditeur (D486) ; la multi-sélection si `values:` (D296) | `viewer[mosaic]` ou `viewer[carousel]` pour une `list of image` (D475) ; `picker.color` pour une `list of color` |
| `range of <type>` | les deux champs du type, liés (D497, D498) | le double curseur si borné ; `gauge` (D498) |

### Les composés

| Type | Composant par défaut | Compatibles (`component:`) |
|---|---|---|
| `amount` | `number`, la devise, aligné à droite (D443) | `calculator` ; R2 si borné |
| `percentage` | `number`, le `%` en post-zone (D273) | `gauge`, le choix naturel de 0 à 100 (D274) ; `fuel` ; `slider` |
| `measure` | `number` et l'unité, aux trois régimes (D391) ; la matrice de conversion visible (D980) | `calculator` |
| `duration` | un composé (D981) : `number` masqué, la virgule en centièmes (D380), et l'unité ; la matrice de conversion visible (D980) | `calculator`, sur deux `clock` : le début, la fin, la différence (D499) |
| `phone` | `text` masqué, national par défaut (D391) | — |
| `geolocation` | `map`, la mini-carte et le pointage (D294) | — |
| `period` | les deux calendriers liés, début ≤ fin (D391) | — |
| `url` | `text` ; en lecture, le lien : le clic ouvre un nouvel onglet, l'icône du lien externe en post-zone, l'ellipse en cellule (D563) | — |
| `email`, `vat_number`, `siren`, `siret`, `iban`, `bic` | `text`, la validation intégrée (D391) | — |
| `communication` | `thread`, le fil (D295, D393) | — |

### Les liens et les générés

| Type | Composant par défaut | Compatibles (`component:`) |
|---|---|---|
| `reference`, un enregistrement pointé (D394) | la saisie par `picker.record` (D470) ; la lecture par le `title` de la cible (D465) | `dropdown` (D500) |
| la composition, `list of <entité>` (D399, D400) | la liste embarquée (D441, D486) | la liste en widgets, `widget:` (D492) |
| l'association, `association with <entité>` (D400) | la liste embarquée (D441, D486) | `picker.record` avec `selection: 1..` (D474) ; `viewer[carousel]` ou `viewer[mosaic]` au visage (D386, D475) ; `widget:` (D492) |
| le lien n-aire, `list of [a, b]` ou `association with [a, b]` (D402) | la liste embarquée, une combinaison par ligne | `widget:` (D492) |
| l'association dérivée, `association with <entité> if …` (D405) | la liste embarquée, en lecture | `widget:` ; `viewer` au visage |
| la liste nommée, l'accès retour du 1-N (D216, D394) | la liste embarquée | comme l'association |
| `counter` | la valeur assemblée, en lecture seule partout (D155, D297) | `qrcode`, `barcode` pour l'étiquette (D252, D542) |
| le champ calculé | le composant de son type de résultat (D298) | les compatibles de ce type |
| le statut, `states:` | déduit de la déclaration : la liste navigatrice, ou la lecture et les boutons (D427) | `dropdown`, les seuls états atteignables (D500) |

## La signature du nœud

Tout nœud de l'arbre d'une surface a la même signature, en sept traits
(D566).

1. **La clé** est l'adresse `<type>[<nom>]`. Les types sont `render`
   pour les composants de présentation, `field` (D460), `operation`
   (D511), `template` (D483), `chart` (D540), `widget` (D555), et `_`
   pour l'emplacement libre (D556). L'écriture courte, `- section:`,
   reste au YAML ; l'adresse est la forme canonique du moteur.
   `component:` remplace le composant par défaut (D458, D566).
2. **`visible:`** est une condition vivante (D90, D567). Le composant
   est construit, et sa visibilité s'évalue au fil de la valeur, comme
   un recalcul (D255). Un toggle peut ainsi ouvrir une saisie
   conditionnelle.
3. **Les propriétés** s'évaluent à la demande : Syncytium ne construit
   pas toutes les propriétés d'avance. Le socle vit à la cascade (D461) :
   le type, puis le champ, puis le nœud, et le plus proche l'emporte ;
   c'est le cas de `style:` (D536), `size:` (D533), `title:` (D493),
   `label:` (D465), `icon:` (D439). Chaque composant a ses propriétés
   propres : la fiche fait foi.
4. **Les enfants** sont déclarés par le type du composant : `items`,
   `steps`, ou `header`, `page`, `footer`, chacun facultatif (D567). Les
   alternances déclarées tiennent (D489, D490, D546). L'abréviation
   `fields: [a, b]` vaut `items: [ 'field[a]', 'field[b]' ]`. Le moteur
   évalue tous les enfants, de la feuille à la racine, avant de
   construire le composant (D455).
5. **La pile de contexte** est fournie depuis la racine (D553) :
   l'enregistrement, les contextes empilés, l'utilisateur (D455).
6. **Les états** sont des propriétés, évaluées à la demande : la
   visibilité, le readonly, l'actionnable (D444), le refus au champ
   (D307).
7. **Le hook** ajoute au catalogue, pour un nom donné, un objet qui gère
   le composant et son rendu dans chaque format : le Web, le PDF, le
   Word, l'Excel, l'email (D408, D452 ; les destinations, D564).

## Les décisions

Ce chapitre repose sur les décisions de la famille « les surfaces et les
composants », relues le 01/11/2026 (D1644). Elles sont 288 au registre :
D126, D185–D210, D212–D216, D226–D234, D236–D237, D239–D253, D255–D300, D330,
D351, D362, D371, D374–D377, D385, D419, D425–D426, D433, D437–D439,
D441–D442, D444–D446, D448–D452, D454–D458, D460–D461, D463–D464, D470,
D472–D492, D494, D500–D503, D506–D510, D512–D513, D515, D517–D519, D521,
D523–D525, D529, D531–D533, D535, D537–D545, D550, D554–D558, D560–D561,
D566–D569, D600–D601, D737, D752, D774–D775, D780, D782–D783, D785–D786,
D788, D792–D795, D806, D875, D935, D957, D980, D1024, D1036, D1062, D1170,
D1193, D1237, D1263, D1308, D1339–D1340, D1372, D1374, D1590, D1593–D1614,
D1616–D1618, D1620, D1622, D1624–D1629, D1631–D1643, D1645.
Chacune se lit dans [le registre](../../conception.md).
