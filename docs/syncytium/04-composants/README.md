# Le catalogue des composants graphiques

Une application Syncytium se montre par des **composants graphiques** :
les feuilles qui rendent un champ, les conteneurs qui les organisent,
l'acte qui déclenche une opération, les graphiques, et les surfaces —
les écrans nommés que le menu adresse. Ce chapitre est leur catalogue,
une fiche par composant (D455–D457). Il suit le vocabulaire du
[glossaire](../../glossaire.md) ; les décisions citées entre parenthèses
renvoient au [registre](../../conception.md).

## Le sommaire

1. **Le catalogue** — ci-dessous : le nœud, le modèle de fiche,
   l'inventaire, la synthèse du modèle de données aux composants, la
   signature du nœud.
2. **[Les feuilles](feuilles.md)** — la saisie d'une valeur, le choix
   et le regard d'un objet : du `checkbox` au `qrcode`.
3. **[Les conteneurs](conteneurs.md)** — `sections` et `section`,
   `tabs` et `tab`, `pages`, `page`, `header` et `footer`.
4. **[L'acte](actes.md)** — `operation`, le bouton qui déclenche une
   opération.
5. **[Les graphiques](graphiques.md)** — les `chart`, le `kpi`, le
   `pivot`.
6. **[Les surfaces](surfaces.md)** — le menu, la liste, le formulaire,
   le résumé, le widget, le wizard, le tableau de bord, le template, le
   chat.
7. **[L'assistance et la documentation](documentation.md)** — les trois
   groupes d'une surface, la facette documentation des composants.

**Un composant est un nœud** (D455) : un nom unique (extensible par
hook — le mot « hook » n'apparaît jamais, D408), des propriétés, des
items, un contexte reçu (l'enregistrement, le champ, les opérations,
l'origine de l'appel, l'utilisateur). Le formulaire n'est qu'une
matérialisation ; l'analogie des web components est consignée (D455).

## Le modèle de fiche (D457)

1. **Nom et famille** — la clé unique ; feuille, conteneur, surface ou
   acte ;
2. **Rôle** — la définition de dictionnaire (le ton du glossaire) ;
3. **Types servis** — les types de champs rendus, et si le composant
   est **le défaut** du type (D64/D447) ;
4. **Contexte consommé** — ce que le composant lit (D455) ;
5. **Propriétés** — les réglages propres, chacun avec son défaut — le
   moteur déduit ce qui peut l'être (D443) ; **`description:` est
   commune à tous** (D1193 — par langue, D1101) : son contenu **entre au
   masque d'explication** de la surface qui porte le composant (le kpi
   comme le champ) et nourrit la page de l'écran — la facette
   documentation du composant (D1158) ; **et chaque composant porte un
   mode d'usage** (D1229 — « un composant graphique doit avoir un mode
   d'usage intégrable dans la documentation de l'écran ») : le texte
   générique qui dit comment on s'en sert — le picker à création
   directe, l'édition en ligne, le toggle —, un item du catalogue du
   moteur par composant (D1160, D1635), repris par la
   documentation de l'écran à côté de la description du champ ;
6. **Items** — ce que le composant contient ;
7. **Modes et déclinaisons** — lecture / modification / résumé /
   template (PDF) / Excel — × écran, tablette, smartphone (D250) ;
8. **États et interactions** — actionnable / grisé / masqué (D444),
   l'affichage du refus (D307), le clavier, le tactile ;
9. **Décisions fondatrices** — le rappel discret ;
10. **Exemple de configuration** — la mise en situation qui **valide la
    fiche** avant de passer à la suivante.

## L'inventaire (D456)

- **Les surfaces** : `menu` (la porte du module — D1604) · `form` ·
  `summary` · `wizard` · `widget` · `list` · `dashboard` · `template` ·
  `chat` (au socle — D957) ;
- **Les conteneurs** : `pages` (header + page(s) + footer) · `page` (le
  saut de page) · `sections` (l'organisateur — D489) · `section` (le regroupement potentiellement nommé) ·
  `tabs`/`tab` ;
- **Les feuilles** : `text` · `number` · `calculator` ·
  `gauge`/`fuel`/`slider` · `clock` · `calendar` · `checkbox` ·
  `toggle` · `dropdown`/`radios`/`icons` · `picker.record` ·
  `picker.image` · `picker.file` · `picker.color` · `viewer` · `map` · `paragraph` · `picture` ·
  `thread` · `list` (l'éditeur du type liste) · `password` (la saisie
  masquée, D463) · `color` (la pastille — D496) · `qrcode`/`barcode`
  (les composants de sortie — D300/D542) — **le composant par défaut d'un type porte le nom du
  type** (D458) ;
- **Les graphiques** : la famille pointée **`chart.line`** ·
  **`chart.bars`** · **`chart.pie`** · **`chart.combo`** ·
  **`chart.scatter`** (le nuage de points — D512) · `kpi` · `pivot` —
  le hook étend (`chart.radar`…, D239) ; la jauge = la feuille `gauge` ;
- **Les actes** : le bouton, l'icône, le passage d'étape — l'utilisateur
  acte une opération (D432/D444/D456).

## La synthèse — du modèle de données aux composants

Cette synthèse **fait le lien entre le modèle de données et les
composants graphiques** : chaque type déclarable, son composant par
défaut, et les composants compatibles (exploitables avec
`component:`). *(Les manques en cours de relevé par l'auteur ; les
cellules jadis « à confirmer » sont toutes fermées — D499/D500.)*

Quatre règles transversales l'allègent :

- **R1** — le composant par défaut d'un type porte le nom du type
  (D458) ;
- **R2** — la borne ouvre la famille de la jauge : `gauge`, `slider`,
  `fuel` (D276 — « pas de jauge sans bornes ») ;
- **R3** — les `values:` ouvrent le trio des énumérés :
  `dropdown`/`radios` (le seuil en configuration générale — D468) et
  `icons` si les valeurs portent des icônes ;
- **R4** — tout hook au nom unique étend chaque ligne (D408/D452).

### Les types simples

| Type | Composant par défaut | Compatibles (`component:`) |
|---|---|---|
| `boolean` | `checkbox` (3 états — faux→vrai→nul) | `toggle` |
| `text` | `text` (mono/multi-ligne déduit D361, `shortcut` D464) | R3 si `values:` ; `qrcode`/`barcode` (la sortie — D300/D542) |
| `integer` | `number` (masque D372) | `calculator` ; le stepper [-]/[+] (D269) ; R2 si borné ; R3 si `values:` |
| `decimal` | `number` (décimales, storage D378) | `calculator` ; R2 si borné ; R3 si `values:` |
| `date` | `calendar` (la nature au crochet D381) | — |
| `time` | `clock` | — |
| `datetime` | **`calendar` + `clock`** — « la combinaison des 2 composants » (D499) | — |
| `file` | saisie : `picker.file` (D473) ; lecture : le bloc fichier (icône+nom+taille D292), `viewer` si visualisable (D475) | `viewer[carousel]` (le paginé feuilleté D481) |
| `image` / `thumbnail` | saisie : `picker.image` (D473) ; lecture : `viewer` (la vignette, la visionneuse D286/D293) | — |
| `uuid` | **`text` formaté — la saisie et la lecture** (D499 ; les fonctions multiples, dont les id des systèmes tiers — D419) | — |
| `password` | `password` (la saisie masquée, jamais relue D463) | — |
| `color` | `color` (la pastille, le sélecteur D496) | `picker.color` |
| `list of <simple>` | `list` (l'éditeur D486) ; la multi-sélection si `values:` (D296) | `viewer[mosaic\|carousel]` si `list of image` (D475) ; `picker.color` si `list of color` |
| `range of <type>` | les deux champs du type liés (D497–D498) | le double curseur si borné ; `gauge` (le cas particulier D498) |

### Les composés

| Type | Composant par défaut | Compatibles (`component:`) |
|---|---|---|
| `amount` | `number` (la devise, aligné à droite D443) | `calculator` ; R2 si borné |
| `percentage` | `number` (le % post-libellé D273) | `gauge` (le choix naturel 0..100 — D274), `fuel`, `slider` |
| `measure` | `number` + l'unité (les trois régimes D391) ; **la matrice de conversion visible** (D980) | `calculator` |
| `duration` | **un composé (D981)** — `number` masqué (la virgule en centièmes — D380) + l'unité ; **la matrice de conversion visible** (D980) | `calculator` **sur la base de deux `clock`** — le début, la fin, la différence (D499) |
| `phone` | `text` masqué (national par défaut D391) | — |
| `geolocation` | `map` (la mini-carte, le pointage D294) | — |
| `period` | les deux calendriers liés (début ≤ fin D391) | — |
| `url` | `text` — **le lien en lecture** : le clic ouvre dans un nouvel onglet, l'icône du lien externe en post-zone, l'ellipse en cellule (D563) | — |
| `email`, `vat_number`, `siren`, `siret`, `iban`, `bic` | `text` (la validation intégrée D391) | — |
| `communication` | `thread` (le fil D295/D393) | — |

### Les liens et les générés

| Type | Composant par défaut | Compatibles (`component:`) |
|---|---|---|
| `reference` (D394 — un, pointé) | saisie : `picker.record` (D470) ; lecture : le `title` de la cible (D465) | `dropdown` (D500) |
| la composition — `list of <entité>` (D399/D400 — plusieurs, possédés) | la liste embarquée (D441/D486) | la liste en widgets (`widget:` — D492) |
| l'association — `association with <entité>` (D400 — plusieurs, libres) | la liste embarquée (D441/D486) | `picker.record` (`selection: 1..` — D474) ; `viewer[carousel\|mosaic]` au visage (D386/D475) ; `widget:` (D492) |
| le lien n-aire — `list of [a, b]` / `association with [a, b]` (D402) | la liste embarquée (les combinaisons en lignes) | `widget:` (D492) |
| l'association dérivée — `association with <entité> if …` (D405) | la liste embarquée **en lecture** | `widget:`, `viewer` au visage |
| la liste nommée (l'accès retour automatique du 1-N — D216/D394) | la liste embarquée | comme l'association |
| `counter` | la valeur assemblée, lecture seule partout (D155/D297) | `qrcode`/`barcode` (l'étiquette — D252/D542) |
| le champ calculé | le composant de son type de résultat (D298) | les compatibles de ce type |
| le statut (`states:`) | déduit de la déclaration : la liste navigatrice ou la lecture + boutons (D427) | `dropdown` — la liste des valeurs **tenant compte du cycle de vie** : les états atteignables seuls (D500) |

## La signature du nœud (D566)

Tout nœud de l'arbre gui obéit à une même signature — sept traits,
arbitrés par l'auteur :

1. **La clé : l'adresse universelle `<type>[<nom>]`** — les types :
   **`render`** (les composants de présentation — sections, section,
   tabs, tab, pages, page, header, footer…), **`field`** (D460),
   **`operation`** (D511), **`template`** (D483), **`chart`** (D540),
   **`widget`** (D555)… — et `_` (D556). Les écritures courtes
   (`- section:`) demeurent au YAML ; l'adresse est la forme
   canonique du moteur. `component:` « convertit ou remplace le nom
   du type » (D458/D566) ;
2. **`visible:` — une condition vivante** (D90/D567) : « en fonction
   de la valeur d'un champ ou d'un contexte, un élément peut devenir
   visible ou masqué » — le toggle qui gère une saisie
   conditionnelle ; le composant est construit, sa visibilité
   s'évalue **au fil de la valeur** (l'écho du recalcul D255) ;
3. **Les propriétés, à l'évaluation paresseuse** — « le composant
   consulte les propriétés, dont l'évaluation s'effectuera à la
   sollicitation ; Syncytium ne tente pas de construire toutes les
   propriétés » ; le socle vit à la cascade (D461 — le type → le
   champ → le nœud, le plus proche l'emporte : style D536, size D533,
   title D493, label D465, icon D439…) ; chaque composant a les
   siennes — **la fiche fait foi** ;
4. **Les enfants, aux champs déclarés par le type** — la définition
   d'un type de composant précise **le ou les noms des champs
   d'enfants** (`items`, `steps` — ou `header`, `page`, `footer` :
   « chaque élément est facultatif », D567) ; les alternances déclarées tiennent
   (D489–D490, D546) et l'abréviation `fields: [a, b]` ≡
   `items: [ field[a], field[b] ]` ; **le moteur évalue tous les
   enfants de la feuille à la racine avant d'appeler/de construire le
   composant** (D455) ;
5. **La pile de contexte** — « fournie depuis la racine du
   composant » (D553) : l'enregistrement, les contextes empilés,
   l'utilisateur — le pré-analysé (D455) ;
6. **Les états = des propriétés**, « évaluées à la demande » —
   la visibilité, le readonly, l'actionnable (D444), le refus au
   champ (D307) ;
7. **Le hook** — « ajoute au catalogue de composants, pour un nom
   donné, **un objet qui se chargera de gérer le composant et son
   rendu dans les différents formats — Web, PDF, Word, Excel,
   Email…** » (D408/D452, les destinations D564).

---

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
