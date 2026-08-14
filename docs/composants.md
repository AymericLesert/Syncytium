# Le catalogue des composants graphiques

Ce document rassemble **les fiches de description des composants
graphiques** de Syncytium (D455–D457). Il prépare la documentation à
rédiger (Q58) et suit le vocabulaire du [glossaire](glossaire.md) ;
les décisions citées renvoient à la [conception](conception.md).

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
   moteur déduit ce qui peut l'être (D443) ;
6. **Items** — ce que le composant contient ;
7. **Modes et déclinaisons** — lecture / modification / résumé /
   template (PDF) / Excel — × écran, tablette, smartphone (D250) ;
8. **États et interactions** — actionnable / grisé / masqué (D444),
   l'affichage du refus (D307), le clavier, le tactile ;
9. **Décisions fondatrices** — le rappel discret ;
10. **Exemple de configuration** — la mise en situation qui **valide la
    fiche** avant de passer à la suivante (le protocole de l'auteur).

## L'inventaire (D456)

- **Les surfaces** : `form` · `summary` · `wizard` · `widget` · `list`
  · `dashboard` · `template` ;
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
| `duration` | `number` masqué (la virgule en centièmes — D380) | `calculator` **sur la base de deux `clock`** — le début, la fin, la différence (D499) |
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
| `measure` | `number` + l'unité (les trois régimes D391) | `calculator` |
| `phone` | `text` masqué (national par défaut D391) | — |
| `geolocation` | `map` (la mini-carte, le pointage D294) | — |
| `period` | les deux calendriers liés (début ≤ fin D391) | — |
| `email`, `url`, `vat_number`, `siren`, `siret`, `iban`, `bic` | `text` (la validation intégrée D391) | — |
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

---

# Les feuilles

## `checkbox`

1. **Nom et famille** — `checkbox`, une feuille ;
2. **Rôle** — la case à cocher : l'état vrai/faux d'un booléen, d'un
   clic ;
3. **Types servis** — `boolean` ; **le défaut du type** ; le tri-état
   si le champ est optionnel (D377) ;
4. **Contexte consommé** — le champ, son `mode` (D364), les droits ;
5. **Propriétés** — les libellés d'états hérités des `values` du champ
   (D377) ; rien d'autre : tout se déduit ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : le clic cycle
   faux → vrai → nul → faux (D374) ; lecture : l'état affiché, le
   survol montre le libellé (D281) ; résumé / template / Excel : le
   libellé ou la valeur (D130) ; identique aux trois écrans ;
8. **États et interactions** — grisée si `readonly` ou droits ; en
   recherche, le composant sert le filtre : le tri-état vise les lignes
   nulles, la position nulle dit « tous » si le champ est obligatoire
   (D375–D376) ;
9. **Décisions fondatrices** — D281, D374–D377 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/customer.yml
fields:
  active:
    type: boolean
    required: true               # deux états — la checkbox simple (le défaut du type)
    default: true                # l'obligatoire naît false sauf default (D377)
    values:
      true:  { label: { fr: Actif } }
      false: { label: { fr: Inactif } }
  audited:
    type: boolean                # optionnel — la checkbox TRI-ÉTAT (D374)
    comment: { fr: Audit réalisé ? }

gui:
  lists:
    main:
      columns: [code, company_name, active, audited]
      searchable: [active, audited]   # la case sert le filtre — tri-état pour
                                      #   audited (lignes nulles), « tous » pour
                                      #   active (obligatoire) — D375–D376
      editable: [active]              # l'édition en ligne — le clic cycle (D374)
  forms:
    default:
      page:
        - section:
            title: { fr: Statut }
            items:
              - field[active]         # la forme explicite (D460) — l'ambiguïté
                                      #   champ/composant levée
              - field[audited]:
                  readonly: true      # la forme riche (D270)
                  style:              # la surcharge de représentation (D460) —
                    true:  check      #   l'apparence des états : coché = vrai,
                    false: empty      #   vide = faux, le nul distinct
                    null:  dash
                  size: 24px          # la taille
```

## `toggle`

1. **Nom et famille** — `toggle`, une feuille ;
2. **Rôle** — l'interrupteur : le vrai/faux d'un booléen qui bascule
   d'un geste — l'état se lit à la position ;
3. **Types servis** — `boolean` **obligatoire seulement** (`required` —
   jamais d'état nul, D281/D377) ; en surcharge du défaut
   (`component: toggle`) ;
4. **Contexte consommé** — le champ, son `mode` (D364), les droits ;
5. **Propriétés** — les libellés d'états hérités des `values` du champ
   (D377), montrés au survol (D281) ; rien d'autre : tout se déduit ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : la bascule au clic, au
   glissé sur tactile ; lecture : la position figée ; résumé /
   template / Excel : le libellé ou la valeur (D130) ; identique aux
   trois écrans — la cible tactile suffit d'elle-même ;
8. **États et interactions** — grisé si `readonly` ou droits ; en
   recherche, il filtre **vrai/faux seuls** — le « tous » n'existe pas
   en toggle : c'est la réinitialisation qui désengage (D375–D377), la
   case tri-état restant le composant du « tous » (D376) ;
9. **Décisions fondatrices** — D281, D375–D377 ;
10. **Exemple de configuration** —

```yaml
# stock/entities/warehouse.yml
fields:
  automated:
    type: boolean
    required: true               # le toggle exige l'obligatoire — jamais de nul (D281/D377)
    default: false
    component: toggle            # la surcharge du défaut checkbox, au champ (D461)
    values:
      true:  { label: { fr: Automatisé } }
      false: { label: { fr: Manuel } }

gui:
  lists:
    main:
      columns: [code, name, automated]
      searchable: [automated]    # le toggle filtre vrai/faux — la réinitialisation
                                 #   désengage (D375/D377)
      editable: [automated]      # la bascule en ligne
  forms:
    default:
      page:
        - section:
            title: { fr: Fonctionnement }
            items:
              - field[automated]:
                  component: toggle   # la surcharge peut aussi vivre AU NŒUD (D461) —
                  size: 32px          #   ce formulaire seul bascule en toggle ; ailleurs,
                                      #   le champ garde son composant
```

## `text`

1. **Nom et famille** — `text`, une feuille ;
2. **Rôle** — la zone de texte : la saisie et l'affichage d'un texte,
   du mot court au paragraphe ;
3. **Types servis** — `text` (**le défaut du type**, D458) ; les
   composés à base texte (`email`, `url`, `phone`, `siren`… — leur
   défaut aussi, la validation intégrée venant du type, D391) ;
4. **Contexte consommé** — le champ (la taille D366, le masque D260, la
   recherche D367), son `mode`, les droits ;
5. **Propriétés** — **les trois parties** (D271) : le libellé, la zone
   de saisie, **la post-zone** (la devise, le %, une abréviation — ou
   rien : elle vient du type, D271/D391) ; le mono/multi-ligne **déduit
   de la taille** face au seuil d'instance (D366), surchargeable par
   `component` ; **`shortcut:`** — le raccourci du texte long (D464) :
   `lines` (les lignes visibles), `icon` (l'icône du déploiement),
   `label` (le libellé par langue — « Voir plus ») ; absent, le moteur
   applique son défaut traduit (thème E) ; **`style:`** — « la fonte,
   la taille et sa mise en forme » (D536) : le défaut au **style
   global de l'application**, la surcharge à la cascade D461 (*en
   proposition : `style: { font: Roboto, size: 14px, format: [bold,
   italic] }` — le size intérieur = la police, D458 départage*) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : la saisie, guidée par le
   masque s'il existe (les lignes du masque font les lignes de la zone,
   D366) ; lecture : le texte — le multi-lignes **justifié** (D447), le
   « voir plus » au-delà des `lines` ; résumé : « libellé pour
   widget » + valeur ; template / Excel : la valeur ; smartphone : le
   libellé plus petit au-dessus, l'infobulle par petite icône (pas de
   survol tactile — thème E) ;
8. **États et interactions** — grisée si `readonly`/droits ; le refus
   de validation affiché (D307) ; en recherche : `strict` /
   `normalized` / `similarity[x]` / `mutualizable[nom]` (D367–D368) —
   la boîte au filtrage vivant (D228) ;
9. **Décisions fondatrices** — D222, D260, D271, D366–D368, D447 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/customer.yml
fields:
  name: text[80]                 # mono-ligne (sous le seuil) — text par défaut
  notes:
    type: text                   # auto → multi-lignes (D366)
    shortcut:                    # le raccourci (D464)
      lines: 4                   #   4 lignes visibles, puis…
      icon: next.svg             #   …l'icône et…
      label: { fr: Voir plus, en: More }   # …le libellé par langue
  registration:
    type: text
    mask: "FR__ ____ [A-E]9"     # la saisie guidée (D260/D366)

gui:
  lists:
    main:
      columns: [name, registration]
      searchable: [name]         # la boîte au filtrage vivant (D228/D441)
  forms:
    default:
      page:
        - section:
            title: { fr: Identité }
            items:
              - field[name]
              - field[notes]:
                  shortcut: { lines: 6 }    # la surcharge au nœud (D461/D464)
              - field[registration]
```

## `number`

1. **Nom et famille** — `number`, une feuille ;
2. **Rôle** — la zone numérique : la saisie et l'affichage d'un nombre,
   entier ou décimal ;
3. **Types servis** — `integer` et `decimal` (**le défaut des deux**) ;
   les composés à base numérique (`amount`, `percentage`, `measure` —
   leur défaut aussi, la post-zone venant du type, D391) ;
4. **Contexte consommé** — le champ (les bornes D372, les décimales
   D373, le masque D370, l'unité ou la devise du composé), son `mode`,
   les droits ;
5. **Propriétés** — **les trois parties** (D271/D272) : le libellé, la
   zone de saisie, **la post-zone** (l'unité, la devise, le % — selon
   la langue, avant ou après, D272) ; **le masque-format** (`"00 00
   00"`, `"0 000.00"` — le `0` du nombre, les séparateurs rendus selon
   la langue, D370/D373) ; **l'alignement à droite** (D447) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : la saisie guidée par le
   masque ; **sur tactile, le clavier numérique, la calculatrice ou le
   clavier stylisé** (D272 — le satellite `calculator` ; sur
   smartphone, la calculatrice remplace le clavier natif) ; lecture :
   le nombre formaté ; résumé : « libellé pour widget » + valeur ;
   template / Excel : **la valeur canonique** (Excel reçoit le nombre,
   jamais la chaîne) ;
8. **États et interactions** — grisée si `readonly`/droits ; le refus
   des bornes et validations affiché (D307) ; en recherche : `strict` /
   **`range`** (la plage, l'usage roi du nombre) / `mutualizable` par
   la forme affichée (D369/D371) ;
9. **Décisions fondatrices** — D272–D273, D370–D373, D447 ;
10. **Exemple de configuration** —

```yaml
# stock/entities/item.yml
fields:
  quantity: integer[0..]           # number par défaut, aligné à droite
  price:
    type: amount                   # le composé — la devise en post-zone (D391)
    currencies: [EUR]
  weight:
    type: measure
    units: [kg, g]
    mask: "0 000.00"               # les séparateurs selon la langue (D373)

gui:
  lists:
    main:
      columns: [quantity, price, weight]
      searchable: [price]          # la plage de montants (range — D371)
      editable: [quantity]
  forms:
    default:
      page:
        - section:
            title: { fr: Mesures }
            items:
              - field[quantity]
              - field[price]
              - field[weight]:
                  component: calculator   # le satellite au nœud (D461)
```

## `calculator`

1. **Nom et famille** — `calculator`, une feuille — le satellite de
   `number` ;
2. **Rôle** — la calculatrice : la saisie numérique tactile, **avec les
   calculs élémentaires** (+, −, ×, ÷) — le résultat alimente le champ ;
3. **Types servis** — les numériques (`integer`, `decimal` et leurs
   composés) ; **jamais un défaut — une surcharge** (`component:
   calculator`, aux trois étages D461) ; sur smartphone et tablette,
   **elle remplace le clavier natif** (l'arbitrage du thème E) ;
4. **Contexte consommé** — le champ (les bornes, les décimales, le
   masque), son `mode`, les droits ;
5. **Propriétés** — aucune propre : les touches et opérations
   élémentaires sont livrées, le format vient du champ (D370/D373) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — **la modification seulement** (la
   calculatrice est une saisie) ; en lecture, résumé, template et
   Excel : le rendu `number` standard ; sur PC, disponible au clic
   (l'icône près du champ) — sur tactile, le plein usage ;
8. **États et interactions** — grisée si `readonly`/droits ; le refus
   des bornes affiché (D307) ;
9. **Décisions fondatrices** — D272, les arbitrages responsive du
   thème E, D461 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/order_line.yml
fields:
  quantity: integer[1..]
  discount:
    type: decimal[0..100]
    decimals: 2
    component: calculator          # la surcharge au champ — partout

gui:
  forms:
    default:
      page:
        - section:
            title: { fr: Ligne }
            items:
              - field[quantity]:
                  component: calculator   # ou au nœud seul — ce formulaire (D461)
              - field[discount]
```

## `gauge`

1. **Nom et famille** — `gauge`, une feuille — le satellite des
   numériques bornés ; **« la jauge étant un cas particulier d'un
   range »** (D498 — min/value/max en une, D494) ;
2. **Rôle** — la jauge : la valeur dans son cadre, d'un coup d'œil — la
   barre qui se remplit entre les bornes ;
3. **Types servis** — les numériques **bornés** (`integer[a..b]`,
   `decimal[a..b]`, l'`amount` borné — « un montant entre 0 et
   10 000 € », D275) ; **le choix naturel du `percentage` dans son
   cadre 0..100** (D274) ; une surcharge (`component: gauge`) — **les
   bornes sont exigées** : sans bornes, pas de jauge (erreur à
   l'ingestion, l'esprit D344) ;
4. **Contexte consommé** — le champ (les bornes, les décimales), son
   `mode`, les droits ;
5. **Propriétés** — **les trois valeurs en une** (D494, précise
   D241) : `min`, `value`, `max` — min et max **fixes ou dépendants**
   (un champ, une formule), les bornes du type (D276) en défaut ;
   **`colors:`** (D467) — le dégradé deux couleurs (`{ min: red,
   max: green }` — le défaut, du rouge au vert), **les seuils**
   (`{ 0: red, 50: orange, 80: green }`) **ou la table de référence**
   (D495 — l'entité et ses liaisons : la colonne du seuil, la colonne
   de la couleur ; *écriture en proposition :* `colors: { from:
   quality.threshold, threshold: level, color: tint }`) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — **la lecture d'abord** (la valeur en un
   regard — listes, résumés, widgets) ; en modification, le glissé
   possible — mais `slider` est le composant de saisie dédié (D275) ;
   template / Excel : la valeur canonique ; identique aux trois
   écrans ;
8. **États et interactions** — **le dépassement** : le `percentage`
   hors cadre change de représentation (D391) ; grisée si
   `readonly`/droits ;
9. **Décisions fondatrices** — D241, D274–D276, D391, D467,
   D494–D495, D498 ;
10. **Exemple de configuration** —

```yaml
# hr/entities/employee.yml
fields:
  satisfaction: percentage         # 0..100 — la jauge, choix naturel (D274)
  workload:
    type: integer[0..40]
    component: gauge               # la surcharge — les bornes exigées

gui:
  lists:
    main:
      columns: [name, satisfaction, workload]   # la jauge en cellule — un regard
  forms:
    default:
      page:
        - section:
            title: { fr: Activité }
            items:
              - field[satisfaction]
              - field[workload]
```

## `fuel`

1. **Nom et famille** — `fuel`, une feuille — le cadran à aiguille, le
   cousin circulaire de la jauge ;
2. **Rôle** — le cadran de carburant : la valeur bornée en arc,
   l'aiguille pointant la position — la lecture instantanée ;
3. **Types servis** — les numériques **bornés** (les bornes exigées,
   comme `gauge`) ; jamais un défaut — la surcharge ; **l'exemple
   fondateur du projet** : le type personnalisé `progression` =
   `integer[0..100]` + `component: fuel` (D359) ;
4. **Contexte consommé** — le champ (les bornes, les décimales), son
   `mode`, les droits ;
5. **Propriétés** — l'arc se déduit des bornes ; **`colors:`** (D467) —
   le dégradé min/max (défaut rouge → vert) ou les seuils
   valeur → couleur ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — **la lecture avant tout** (cellules,
   résumés, widgets — le cadran est un affichage) ; en modification, la
   saisie redevient `number` — le cadran illustre, il ne saisit pas
   *(en proposition)* ; template / Excel : la valeur canonique ;
8. **États et interactions** — grisé si `readonly`/droits ; le
   dépassement change de représentation (la ligne D391) ;
9. **Décisions fondatrices** — D359 (l'exemple fondateur), D274–D275 ;
10. **Exemple de configuration** —

```yaml
# settings.yml — l'étage version ou module : le type fondateur (D359)
types:
  progression:
    type: integer
    min: 0
    max: 100
    component: fuel

# production/entities/task.yml
fields:
  name: text[60]
  avancement: progression          # la forme courte — le cadran partout (D359)

gui:
  lists:
    main:
      columns: [name, avancement]  # le cadran en cellule — la lecture instantanée
  forms:
    default:
      page:
        - section:
            title: { fr: Suivi }
            items:
              - field[avancement]  # en modification : la saisie number, le cadran illustre
```

## `slider`

1. **Nom et famille** — `slider`, une feuille — le curseur, la saisie
   des numériques bornés ;
2. **Rôle** — le curseur : « une saisie simple et sans clavier »
   (D275) — la poignée glisse entre les bornes, la valeur suit ;
3. **Types servis** — les numériques **bornés** (les bornes exigées —
   l'esprit `gauge`) ; jamais un défaut — la surcharge
   (`component: slider`, aux trois étages D461) ;
4. **Contexte consommé** — le champ (les bornes, les décimales — le pas
   s'en déduit), son `mode`, les droits ;
5. **Propriétés** — le pas se déduit des décimales (`decimals: 0` → pas
   de 1) ; **`colors:`** (D467) applicable à la piste ; la valeur
   affichée près de la poignée ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : le glissé (le tactile en
   premier — la cible large) ; lecture : la piste figée, la valeur ;
   résumé / template / Excel : la valeur canonique ; identique aux
   trois écrans, le pas tactile élargi sur smartphone ;
8. **États et interactions** — grisé si `readonly`/droits ; le clavier
   PC : les flèches ajustent d'un pas (l'accessibilité) ;
9. **Décisions fondatrices** — D275, D461, D467 ;
10. **Exemple de configuration** —

```yaml
# hr/entities/employee.yml
fields:
  workload:
    type: integer[0..40]
    component: slider              # la surcharge — la saisie au glissé
    colors: { 0: green, 30: orange, 38: red }   # les seuils (D467)

gui:
  forms:
    default:
      page:
        - section:
            title: { fr: Charge }
            items:
              - field[workload]
```

## `clock`

1. **Nom et famille** — `clock`, une feuille ;
2. **Rôle** — l'horloge : la saisie et l'affichage d'une heure — « le
   cadran pour saisir ou afficher » (D277) ;
3. **Types servis** — `time` (**le défaut du type**) ; la partie heure
   d'un `datetime` — en tandem avec `calendar` (D280 : la date + heure
   combine calendrier et horloge) ;
4. **Contexte consommé** — le champ (**la précision du crochet** —
   `time[hh]` … `time[hh:mm:ss.sss]`, D277/D383), son `mode`, les
   droits ;
5. **Propriétés** — rien de propre : la précision vient du type, le
   format d'affichage de la langue (le masque de langue par défaut,
   D383) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : **le cadran au tactile,
   la saisie directe au clavier sur PC** (l'horloge au clic — l'esprit
   des arbitrages date du thème E) ; lecture : l'heure formatée selon
   la langue ; résumé / template / Excel : la valeur canonique à la
   précision déclarée ;
8. **États et interactions** — grisée si `readonly`/droits ; le refus
   affiché (D307) ; en recherche : `strict` / **`range`** (la plage
   horaire) / `mutualizable` (D381) ;
9. **Décisions fondatrices** — D277, D381, D383 ;
10. **Exemple de configuration** —

```yaml
# stock/entities/warehouse.yml
fields:
  opening: time[hh:mm]             # la précision au crochet (D277) — clock par défaut
  closing: time[hh:mm]

gui:
  lists:
    main:
      columns: [name, opening, closing]
      searchable: [opening]        # la plage horaire (range — D381)
  forms:
    default:
      page:
        - section:
            title: { fr: Horaires }
            items:
              - field[opening]
              - field[closing]
```

## `calendar`

1. **Nom et famille** — `calendar`, une feuille ;
2. **Rôle** — le calendrier : la saisie et l'affichage d'une date — la
   vue année, mois ou semaine, et les raccourcis du quotidien ;
3. **Types servis** — `date` (**le défaut du type**) et la partie date
   du `datetime` (en tandem avec `clock`, D280) ; **la granularité du
   crochet** — `date[yyyy-mm-dd]`, `[yyyy-mm]`, `[yyyy-ww]` : « le
   calendrier au bon grain » (D382) ;
4. **Contexte consommé** — le champ (la granularité, les bornes ISO, le
   masque de langue D383), **la langue** (le numéro de semaine et le
   premier jour lui sont liés — D279), le `mode`, les droits ;
5. **Propriétés** — rien de propre : **les raccourcis livrés et
   traduits** (aujourd'hui, la veille, hier, début et fin de mois —
   D278), la numérotation de semaine par la langue (D279) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : **smartphone = le plein
   écran** (la semaine, le mois ou l'agenda — tactile) ; **tablette = à
   proximité du champ** ; **PC = la saisie au clavier d'abord, le
   calendrier par l'icône** (vos arbitrages du thème E) ; lecture : la
   date formatée à la langue ; template / Excel : la valeur canonique
   ISO à la granularité (D382) ;
8. **États et interactions** — grisé si `readonly`/droits ; le refus
   des bornes affiché (D307) ; en recherche : `strict` / **`range`**
   (la plage de dates — l'usage roi, D381) / `mutualizable` ;
9. **Décisions fondatrices** — D278–D280, D381–D383 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/invoice.yml
fields:
  due_date:
    type: date                     # le jour — calendar par défaut
    min: 2020-01-01                # la borne ISO (D381)
  billing_month: date[yyyy-mm]     # le mois — le calendrier au bon grain (D382)

gui:
  lists:
    main:
      columns: [number, due_date, billing_month]
      searchable: [due_date]       # la plage de dates — l'usage roi (D381)
  forms:
    default:
      page:
        - section:
            title: { fr: Échéances }
            items:
              - field[due_date]
              - field[billing_month]
```

## `dropdown`

1. **Nom et famille** — `dropdown`, une feuille ;
2. **Rôle** — la liste déroulante : le choix d'une valeur dans un jeu
   fermé ;
3. **Types servis** — `enum` (**le défaut du type**, D129/D283) ; le
   booléen décliné en liste énumérée (la surcharge
   `component: dropdown`, D281) ;
4. **Contexte consommé** — le champ (**les `values`** — clé, `label`,
   `description`-infobulle, `icon`/`image`, l'ordre de déclaration —
   D387 ; le `default`), la langue, le `mode`, les droits ;
5. **Propriétés** — rien de propre : tout vient des `values` du champ ;
   **la ligne vide de l'optionnel** porte le libellé de l'entrée
   `null:` (D388) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : la liste déroulante —
   **smartphone : la liste plein écran** (votre arbitrage) ; **PC : les
   raccourcis clavier, la saisie au début de mots avec throttling**
   (thème E) ; lecture : le libellé (et l'icône si déclarée) ; résumé :
   le libellé ; template / Excel : **le code ou le libellé** (D130) ;
8. **États et interactions** — grisée si `readonly`/droits ; en
   recherche : **la liste de sélection du jeu de valeurs,
   multi-sélection** (D388), `mutualizable` par le libellé (D369) ;
9. **Décisions fondatrices** — D129, D281, D283, D387–D388 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/customer.yml
fields:
  category:
    type: enum                     # dropdown par défaut
    values:
      bronze: { label: { fr: Bronze }, description: { fr: Le niveau d'entrée }, icon: bronze.png }
      silver: { label: { fr: Argent } }
      gold:   { label: { fr: Or } }
    default: bronze

gui:
  lists:
    main:
      columns: [code, company_name, category]
      searchable: [category]       # la multi-sélection du jeu de valeurs (D388)
      editable: [category]         # la liste en cellule (D205)
  forms:
    default:
      page:
        - section:
            title: { fr: Classification }
            items:
              - field[category]
```

## `radios`

1. **Nom et famille** — `radios`, une feuille ;
2. **Rôle** — les boutons radios : le jeu de valeurs étalé sous les
   yeux, un clic pour choisir — le choix visible sans dérouler ;
3. **Types servis** — `enum` **aux petits jeux de valeurs** — **le
   seuil est un élément de la configuration générale** (le settings, la
   cascade — D468 ; le pendant du seuil mono/multi-ligne D366) ; le
   booléen décliné (D281) ; **jamais un défaut — la surcharge**
   (`component: radios`, proposée au formulaire dès le thème E,
   D284) ;
4. **Contexte consommé** — les `values` du champ (`label`,
   `description`, `icon` — D387), le `mode`, les droits ;
5. **Propriétés** — rien de déclaré : la disposition se déduit de la
   place (**les radios s'empilent sur smartphone** — l'arbitrage du
   thème E) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : le clic direct, tout est
   visible ; lecture : le libellé de la valeur, sobre ; template /
   Excel : le code ou le libellé (D130) ;
8. **États et interactions** — grisés si `readonly`/droits ; **en
   recherche, les radios ne servent pas** : le composant de recherche
   de l'énuméré reste la liste multi-sélection (D388) ;
9. **Décisions fondatrices** — D129, D281, D283–D284, les arbitrages
   responsive du thème E ;
10. **Exemple de configuration** —

```yaml
# production/entities/task.yml
fields:
  priority:
    type: enum
    values:
      low:    { label: { fr: Basse } }
      normal: { label: { fr: Normale } }
      high:   { label: { fr: Haute } }
    default: normal

gui:
  forms:
    default:
      page:
        - section:
            title: { fr: Priorité }
            items:
              - field[priority]:
                  component: radios   # la surcharge au nœud — trois valeurs
                                      #   étalées, le clic direct (D461)
```

## `icons`

1. **Nom et famille** — `icons`, une feuille ;
2. **Rôle** — le jeu d'icônes : l'énuméré en images — chaque valeur est
   une icône, le choix d'un regard et d'un clic ;
3. **Types servis** — `enum` dont **les `values` portent `icon` ou
   `image`** (D283/D387) — sans icônes déclarées, pas d'icons
   (*erreur à l'ingestion, en proposition*) ; jamais un défaut — la
   surcharge (`component: icons`) ;
4. **Contexte consommé** — les `values` du champ (`icon`/`image` ←
   `resources/` D346, le `label` pour l'infobulle), le `mode`, les
   droits ;
5. **Propriétés** — **`size`** (la taille des icônes — le vocabulaire
   unique D461) ; rien d'autre : les icônes viennent des `values` ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : les icônes étalées, la
   sélection marquée ; **smartphone : le choix par image prend l'écran
   et s'empile** (l'arbitrage du thème E) ; lecture : l'icône de la
   valeur, le libellé en infobulle ; template : l'icône rendue (l'image
   au PDF, D257) ; Excel : le code ou le libellé (D130) ;
8. **États et interactions** — grisé si `readonly`/droits ; en
   recherche : la liste multi-sélection du jeu, icônes affichées
   (D388) ;
9. **Décisions fondatrices** — D283, D346, D387–D388 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/customer.yml
fields:
  category:
    type: enum
    values:
      bronze: { label: { fr: Bronze }, icon: bronze.png }   # ← resources/ (D346)
      silver: { label: { fr: Argent }, icon: silver.png }
      gold:   { label: { fr: Or },     icon: gold.png }
    default: bronze
    component: icons            # la surcharge au champ — les icônes partout

gui:
  lists:
    main:
      columns: [code, company_name, category]   # l'icône en cellule
  forms:
    default:
      page:
        - section:
            title: { fr: Classification }
            items:
              - field[category]: { size: 48px }   # la taille au nœud (D461)
```

## `picker.record`

1. **Nom et famille** — `picker.record`, une feuille ;
2. **Rôle** — le sélecteur d'enregistrement : le choix de la cible
   d'une référence — la liste qui cherche ;
3. **Types servis** — **la référence** (le nom d'entité en type, D396)
   — **le défaut** ; l'association et la liste d'entités, dont les
   éléments se choisissent pareillement (D401) ; **la sélection se
   déduit du lien** : la référence = unique, la liste et l'association
   = multiple (D470 — le vocabulaire de D445) ;
4. **Contexte consommé** — le champ (la cible, **le `filter` évalué
   depuis la destination** avec `me.` — D395/D396), **le `title` de la
   cible** (le visage, D465), les droits — **les actifs seuls** à la
   sélection (D398) ;
5. **Propriétés** — **`by:`** — la présentation (D474) : le nom d'une
   liste de la cible → la liste ; le nom de son champ-image → la
   galerie de visages ; absent → la liste par défaut filtrée ;
   **`selection:`** — le nombre d'éléments (`1`, `1..`, `1..5` — la
   déduction du lien en défaut, D470/D474) ;
   **`anchor:`** (D469) — l'ancrage de la liste : `center` (le centre
   de l'écran), `right` (à droite du champ), `field` (à la place du
   champ) — *défauts au moteur selon l'écran (smartphone = plein
   écran)* ; **`dimension:`** (D469 — la réutilisation de D454) — plein
   écran ou le pourcentage **en largeur et en hauteur**
   (`dimension: 60% 80%`) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : la liste à recherche **au
   début de mots avec throttling** (le PC aux raccourcis clavier —
   thème E) ; smartphone : la liste plein écran ; lecture : **le titre
   de la cible + le lien vers sa fiche en lecture seule** (D215) ;
   résumé : le titre ; template : le titre ; **CSV : la clé
   fonctionnelle** (l'UUID jamais — D398) ;
8. **États et interactions** — grisé si `readonly`/droits ; **le filtre
   restreint les candidats** (D395 — `check: immutable` surveille
   ensuite) ; la sélection ne propose que les actifs (D398) ;
9. **Décisions fondatrices** — D215, D284, D395–D398, D465 ;
10. **Exemple de configuration** —

```yaml
# hr/entities/employment.yml
fields:
  responsible:
    type: hr.employee              # la référence (D396) — record-picker par défaut
    filter: company = me.company   # les candidats restreints (D395)
    check: immutable

gui:
  forms:
    default:
      page:
        - section:
            title: { fr: Encadrement }
            items:
              - field[responsible]:
                  by: active_employees          # la présentation — la liste (D474)
                  selection: 1                  # la cardinalité (D474)
                  anchor: right                 # à droite du champ (D469)
                  dimension: 60% 80%            # largeur × hauteur (D454/D469)
```

## `picker.image`

1. **Nom et famille** — `picker.image`, une feuille — **la dérivée de
   `picker.file`** (D473), la famille `picker` (D470) ;
2. **Rôle** — le choix d'un ou plusieurs **fichiers images** — « dont
   la liste des formats est exploitable par Syncytium » (D473) ;
3. **Types servis** — `image` et `thumbnail` (**leur défaut** —
   D385/D389) ; le « un ou plusieurs » suit le type (la liste — D470) ;
4. **Contexte consommé** — le champ (les `extensions` du jeu image, le
   `quota`, les dimensions du crochet — D389), le `mode`, les droits ;
5. **Propriétés** — `anchor:` et `dimension:` (la famille — D469) ;
   rien d'autre : les formats exploitables bornent d'eux-mêmes ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : le dépôt (glisser ou
   parcourir) — **sur smartphone, l'appareil photo et la galerie**
   (D292) ; **l'aperçu immédiat au dépôt** (D293), la vignette calculée
   (D286/D389) ; lecture : la vignette, la visionneuse au clic (plein
   écran / pourcentage / zone — D293) ; template : l'image rendue
   (D257) ; CSV : le nom du fichier ;
8. **États et interactions** — grisé si `readonly`/droits ; le refus
   des formats hors jeu et du quota, propre (D307/D384) ;
9. **Décisions fondatrices** — D286, D292–D293, D385, D389, D470,
   D473 ;
10. **Exemple de configuration** —

```yaml
# hr/entities/employee.yml
fields:
  photo:
    type: image[512x512]           # la boîte max, la vignette auto (D389)
    placeholder: avatar.png        # l'icône de fond (D390)

gui:
  forms:
    default:
      page:
        - section:
            title: { fr: Profil }
            items:
              - field[photo]       # picker.image par défaut — dépôt, caméra, galerie
```

## `picker.file`

1. **Nom et famille** — `picker.file`, une feuille — la famille
   `picker` (D470/D473) ;
2. **Rôle** — le choix d'un ou plusieurs fichiers **quelconques** — le
   dépôt (glisser) et le parcours ;
3. **Types servis** — `file` (**le défaut du type**, D384) ; le nombre
   suit le type et `selection:` (D474) ;
4. **Contexte consommé** — le champ (**les `extensions`** — la liste
   simple ou à libellés « la facture (pdf) », D384 ; **le `quota`**
   D162/D365), le `mode`, les droits ;
5. **Propriétés** — `selection:` (le nombre — D474), `anchor:` et
   `dimension:` (la famille — D469) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : **le glisser-déposer et
   le parcours** ; smartphone : l'appareil photo et la galerie si le
   jeu d'extensions le permet, le gestionnaire de fichiers sinon
   (D292) ; **la forme à libellés guide le dépôt** (« déposez la
   facture (pdf) » — D384) ; lecture : le nom et les métadonnées, le
   téléchargement sous droits ; template / CSV : le nom du fichier ;
8. **États et interactions** — grisé si `readonly`/droits ; **le refus
   propre** des extensions hors jeu et du quota (D307/D384) ; la
   déduplication silencieuse au moteur (D165) ;
9. **Décisions fondatrices** — D160–D165, D292, D384, D469–D474 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/customer.yml
fields:
  invoice:
    type: file
    extensions:
      pdf:  { fr: facture }        # la forme à libellés (D384) — guide le dépôt
      docx: { fr: document qualité }
    quota: 10MB

gui:
  forms:
    default:
      page:
        - section:
            title: { fr: Documents }
            items:
              - field[invoice]:
                  selection: 1     # un seul fichier (D474)
```

## `viewer`

1. **Nom et famille** — `viewer`, une feuille — « image-viewer et
   carousel sont un même objet : viewer » (D475) ; **« viewer est le
   composant graphique et carousel un mode d'affichage »** (D477) ;
2. **Rôle** — la visionneuse : **le fichier regardé** — la vignette en
   place, le plein cadre au clic ; **tout type visualisable** : l'image
   n'est « qu'un type parmi tant d'autres » — PDF, Word, Excel,
   PowerPoint… ; **les collections**, par le mode carousel ; **le
   document paginé feuilleté** — « un carrousel d'un document PDF
   correspond à un défilement des pages » (D481) ; et **le document
   généré** — « le fichier de la facture n'existe pas en tant que tel
   mais comme un PDF généré à partir des informations de la facture et
   de ses lignes : un viewer peut faire référence à un template de
   document à générer » (D483) ;
3. **Types servis** — `image` et `thumbnail` **en lecture** (le défaut
   de leur mode lecture — D286/D293) ; `file` dont le format est
   visualisable (la vignette de fichier sinon) ; les collections :
   `list of image`, une association ou une liste d'entités **au
   visage** (`image:` — D386), une liste de fichiers ; **le document
   paginé seul** (PDF, PowerPoint…) en mode carousel — la page fait
   l'image (D481) ; **le template** — le document généré à la volée
   depuis l'enregistrement, sans fichier stocké (D483) ;
4. **Contexte consommé** — le champ ou le lien (D470), **ou le
   template et l'enregistrement** (la génération à la volée — D483),
   les dimensions du crochet et la vignette auto (D389), le
   `placeholder` (D390), les visages des cibles, les droits ;
5. **Propriétés** — `dimension:` (la visionneuse — D454/D469/D484) ;
   **`mode:`** — « le viewer peut afficher une image, une planche ou
   un carousel » (D478) : `image` (le fichier seul en vignette),
   `mosaic` (la planche de vignettes — le nom acté D480) —
   « besoin de préciser le nombre d'images en colonne et en ligne dans
   la zone » (D479) : le crochet `mosaic[4x3]`, colonnes × lignes, en
   **raccourci** de la propriété en clair **`sheet:`** —
   `sheet: 4x3` (D480/D482) ; absent = l'auto selon la zone ; `carousel` (la succession qui défile) ; déduit du contenu — le
   fichier seul → `image`, la collection → `carousel` (D477) ; **le
   crochet est un raccourci de la définition du mode** :
   `viewer[carousel]` ≡ `mode: carousel` (D478) ; `interval:` — le
   défilement automatique du carrousel (`interval: 5s` — D476 ;
   absent = manuel seul) ; en items, **`template[<nom>]`** référence le
   document à générer (*l'écriture en proposition — l'écho de
   `field[<nom>]` D460 ; viewer, son composant naturel*) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — **`image`** : la vignette, la
   visionneuse au clic — plein écran sur smartphone, pourcentage sur
   tablette, zone définie sur PC (D293) ; **`mosaic`** : la planche —
   les vignettes de la collection en grille, `mosaic[4x3]` fixant
   colonnes × lignes (D479 — l'excédent se feuillette), le clic ouvrant
   la visionneuse ; **`carousel`** : « une liste ou une association
   faisant référence à des images et/ou des vignettes de fichiers » —
   la succession qui défile, « à intervalle régulier, sur la pression
   d'une touche avant/après » (D475), le clic ouvrant la visionneuse ;
   cellule et widget : la vignette (D286) ; template : l'image rendue
   (D257), le carrousel rendu en planche (*en proposition*) ; **pas de
   recadrage dans le socle** (le hook D263) ;
8. **États et interactions** — le `placeholder` tant que le fichier
   manque ou que la collection est vide (D390) ; le zoom et la
   fermeture au geste sur tactile ; les commandes avant/après, la pause
   au survol ;
9. **Décisions fondatrices** — D257, D286, D293, D386, D389–D390,
   D475–D483 ;
10. **Exemple de configuration** —

```yaml
# hr/entities/employee.yml — le fichier seul
fields:
  photo:
    type: image[512x512]           # la boîte max, la vignette auto (D389)
    placeholder: avatar.png        # l'icône de fond (D390)
  contract: { type: file, extensions: [pdf] }

gui:
  forms:
    default:
      page:
        - section:
            title: { fr: Profil }
            items:
              - field[photo]:
                  dimension: 60%   # la visionneuse au clic (D293)
              - field[contract]    # le PDF visualisé en place (D475)

# catalog/entities/product.yml — la collection : le mode carousel
fields:
  gallery:
    type: list of image            # la collection d'images (D362/D385)

gui:
  forms:
    default:
      page:
        - section:
            title: { fr: Galerie }
            items:
              - field[gallery]:    # la collection => carousel déduit (D477)
                  interval: 5s     # le défilement automatique (D476)
              - field[gallery]:
                  component: viewer[mosaic[4x3]]   # la planche : 4 colonnes × 3 lignes (D479)
              - field[gallery]:                    # la même, en clair (D482)
                  component: viewer
                  mode: mosaic
                  sheet: 4x3       # la planche : colonnes x lignes

# workshop/entities/procedure.yml — le document paginé feuilleté (D481)
fields:
  handbook:
    type: file
    extensions: [pdf, pptx]
gui:
  forms:
    default:
      page:
        - field[handbook]:
            component: viewer[carousel]  # le défilement des pages
            interval: 10s                # la présentation, le mode opératoire

# sales/entities/order.yml — le document généré, regardé (D483)
gui:
  templates:
    invoice: …                           # le patron du document (Q55)
  forms:
    default:
      page:
        - template[invoice]:             # la facture générée à la volée —
            component: viewer[carousel]  # ses pages feuilletées (D481)
```

## `map`

1. **Nom et famille** — `map`, une feuille — la carte : le composant
   naturel de `geolocation` (D458) ;
2. **Rôle** — **la géolocalisation regardée et saisie** : la mini-carte
   centrée au marqueur en lecture ; le pointage sur la carte en
   saisie (D294) ;
3. **Types servis** — `geolocation` (le composé D391–D392 : les
   coordonnées + le texte associé — l'adresse, le lieu) ; **la liste
   de coordonnées** (`list of geolocation`, l'association aux
   coordonnées) — « le composant doit pouvoir s'adapter » (D513) :
   les marqueurs multiples sur une même carte, **les lignes possibles
   ou pas** (D513–D514 : « les lieux de commandes pour un produit » —
   sans relier ; « le parcours d'un commercial » — relié **au trait
   droit** ; *en proposition : `lines: true | false`, défaut
   `false`*) ; **le tracé de la route = un hook** (« les abonnements
   aux outils annexes » — le patron du géocodage D294, OSRM/Valhalla
   en candidats open source, Q7) ;
4. **Contexte consommé** — la valeur (coordonnées et texte associé —
   D392), **le fond de carte déclaré à l'instance** (D259/D294), la
   focale (`focus:` au champ ou hérité du setting — D391), **la
   position courante du terminal** (D291), les droits ;
5. **Propriétés** — le socle du vocabulaire (D461 : style,
   readonly…) ; **`size:`** — la mini-carte à l'affichage ;
   **`dimension:`** — la carte dépliée au clic (**le couple D484** :
   size à plat, dimension en extension) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — **saisie** : pointer sur la carte (le
   bloc dédié D199), le lat/long au clavier, l'adresse géocodée
   (D294 — le connecteur, défaut open source : BAN/Addok, Nominatim),
   **« ma position » en point de départ** (D291) ; **lecture** : la
   mini-carte centrée + le marqueur, le texte associé en légende
   (D392) ; **cellule** : le lat/long en texte court — le clic déplie
   la carte (D294) ; widget : idem cellule ; **template** : une image
   de la carte (D257) ; **CSV/Excel** : `lat,long` canonique,
   ré-importable (D294) ; **le tri : la distance à vol d'oiseau,
   relative à la focale** (D391 — amende D125) ; pas de filtre dans le
   socle (la proximité = un hook) ;
8. **États et interactions** — la position courante **sous réserve de
   l'autorisation du terminal** (D291) ; grisé si `readonly`/droits ;
   le zoom et le déplacement au geste ;
9. **Décisions fondatrices** — D125, D199, D257, D259, D291, D294,
   D391–D392, D484, D513–D514 ;
10. **Exemple de configuration** —

```yaml
# logistics/entities/site.yml
fields:
  name: text
  location:
    type: geolocation            # coordonnées + texte associé (D392)
    # focus: 48.86,2.35          # la focale du tri — défaut : ma position (D391)

gui:
  lists:
    main:
      columns: [name, location]  # lat,long court — le clic déplie la carte (D294)
  forms:
    default:
      page:
        - section:
            title: { fr: Localisation }
            items:
              - field[location]:
                  size: 200px      # la mini-carte à l'affichage (D484)
                  dimension: 60%   # la carte dépliée au clic (D484)
```

## `thread`

1. **Nom et famille** — `thread`, une feuille — le fil : le composant
   naturel de `communication` (D458) ;
2. **Rôle** — **le fil chronologique regardé et nourri** : les messages
   immuables — auteur, horodatage, contenu —, la saisie du nouveau
   message en bas (D295) ;
3. **Types servis** — `communication` (D166/D393 : un canal = un champ,
   non listable ; l'auteur et l'horodatage générés, jamais déclarés) ;
4. **Contexte consommé** — le fil et ses attachés (`attachments:` —
   `file`, `image` ou `thumbnail`, leurs propriétés à plat sur le
   champ — D393), **la confidentialité** (D25/D364 — la visibilité du
   fil s'y cale, aucune propriété séparée), les notifications opt-in
   (D108–D110), les droits ;
5. **Propriétés** — le socle du vocabulaire (D461) ; **`preview:`** —
   le nombre de lignes du résumé au survol en cellule (D393 — *la
   forme `preview: 3` en proposition*) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — **saisie et lecture** : le fil
   chronologique, la saisie en bas, les pièces jointes si activées
   (D295) — **le fil épouse son contenant** : une section, un onglet…
   « ça prend la place qu'on lui laisse » (D485 — l'onglet de
   D167/D186, un habitat parmi d'autres) ; **smartphone** :
   le fil en plein écran (D295) ; **cellule** : une petite icône
   (thumbnail) — au survol, le ou les derniers échanges résumés
   (D393, amende D295) ; **template** : le fil complet si le bloc est
   inclus au gabarit (D295) ; **Excel** : exclu (D236) ; **recherche** :
   le contenu des messages — `normalized`, `similarity`,
   `mutualizable` (D393) ;
8. **États et interactions** — les messages immuables (jamais d'édition
   ni de suppression) ; la visibilité par la confidentialité (D393) ;
   les notifications opt-in (D108–D110) ; en lecture seule, le fil se
   consulte sans zone de saisie ;
9. **Décisions fondatrices** — D108–D110, D166–D167, D186, D236, D295,
   D393, D485 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/order.yml
fields:
  discussion:
    type: communication
    attachments: image[1024x1024]  # le type d'attaché, ses propriétés à plat (D389/D393)
    quota: 5MB

gui:
  lists:
    main:
      columns:
        - number
        - customer
        - discussion: { preview: 3 }  # l'icône ; au survol, 3 lignes (D393 — proposition)
  forms:
    default:
      page:
        - section:
            title: { fr: Échanges }
            items:
              - field[discussion]   # le fil prend la place qu'on lui laisse (D485)
```

## `list`

1. **Nom et famille** — `list`, une feuille — l'éditeur de liste (l'ex
   `list-editor`, renommé D458) : le composant naturel du type
   `list of <type simple>` (D362/D458) — **intimement lié à la liste
   complète** (D441–D447) : un même composant (D486) ;
2. **Rôle** — **la collection de valeurs simples éditée** : ajouter,
   retirer, réordonner — « la phrase se lit » : `list of text`
   (D362) ;
3. **Types servis** — `list of <type simple>` (D362 — text, number,
   date… ; **les facettes déclarées sur le champ s'appliquent à chaque
   élément** : size, mask…) ; **deux régimes** (D296) : les énumérés
   (`values:`) → la multi-sélection ; les libres → l'éditeur. **La
   parenté (D486)** : la liste complète et l'éditeur sont un même
   composant — `list of <entité>` (la composition D399) le déploie aux
   colonnes de l'entité (D441), `list of <type simple>` le **resserre
   sur la colonne unique des valeurs** ; les collections d'images
   restent au `viewer` (D475) ;
4. **Contexte consommé** — le champ (le type de l'élément et ses
   facettes — D362), les `values:` des énumérés, les droits ;
5. **Propriétés** — le socle du vocabulaire (D461) ; **le vocabulaire
   de la liste complète vaut où il garde son sens** (D486 : editable,
   selection, sizable… — la colonne unique dispensant columns) ; **la
   liste complète a deux visages** (D492) : le tableau (`columns:` —
   D441) ou **la liste de widgets** — `widget: <nom du widget>` de
   l'entité de l'élément, la mécanique (filtre, tri, recherche,
   sélection, pagination, opérations) demeurant ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — **saisie** : la multi-sélection (cases
   ou tags) pour les énumérés, l'éditeur — ajouter / retirer /
   réordonner quand l'ordre est l'insertion — sinon (D296) ;
   **lecture** : les tags ; **cellule** : les premières valeurs +
   l'ellipse (D296) ; **template** : les valeurs énumérées ;
   **CSV/Excel** : le séparateur interne déclaré au modèle,
   surchargeable à la fonctionnalité (D296, précise D223 — la
   ré-importabilité D237 préservée) ; **filtre** : « contient »
   (D166) ;
8. **États et interactions** — chaque élément contrôlé par les facettes
   du champ (D362) — le refus propre à l'élément fautif ; le
   réordonnancement seulement quand l'ordre est l'insertion (D296) ;
   grisé si `readonly`/droits ;
9. **Décisions fondatrices** — D166, D223, D237, D296, D362, D441–D447,
   D458, D486, D492 ;
10. **Exemple de configuration** —

```yaml
# crm/entities/contact.yml
fields:
  name: text
  keywords:
    type: list of text[30]         # chaque élément contraint par la facette (D362)
  languages:
    type: list of text
    values: [fr, en, de, es]       # les énumérés => la multi-sélection (D296)

gui:
  lists:
    main:
      columns: [name, keywords]    # les premières valeurs + ellipse (D296)
  forms:
    default:
      page:
        - field[keywords]          # l'éditeur : ajouter, retirer, réordonner
        - field[languages]         # les cases ou les tags (D296)
```

## `sections`

1. **Nom et famille** — `sections`, un conteneur — **l'organisateur** :
   « permet de décrire l'organisation de différentes sections —
   organisation en colonne ou en ligne » (D489) ;
2. **Rôle** — poser la disposition des sections qu'il contient : en
   colonne (l'empilement) ou en ligne (côte à côte) ;
3. **Types servis** — aucun : le conteneur est indifférent au contenu
   (le graphe D455) ;
4. **Contexte consommé** — le contexte transmis tel quel aux items
   (D455) ; les droits et la confidentialité ;
5. **Propriétés** — **la disposition** : `layout: column[n] | row[n]`
   (D490/D491) — **le mot nomme l'unité, le crochet la compte, le flux
   replie au-delà** : `column` (défaut) = l'empilement ; `column[3]` =
   jusqu'à trois colonnes par ligne, puis la ligne suivante ; `row` =
   la ligne unique ; `row[2]` = jusqu'à deux lignes par colonne, puis
   la colonne suivante — la grille est couverte par le crochet
   (« oublie grid ») ; le crochet en raccourci du composant :
   `sections[row]` (D478) ; **`width:` / `height:` au même
   niveau que layout** — « pour que chaque section ait la même
   dimension » (D502, l'uniforme ; la section peut les surcharger —
   le variable, le plus proche l'emporte D461 ; sans précision, tout
   l'espace est pris D501) ; **`size:`** — « les dimensions de
   l'espace occupé par l'ensemble des sections » (D503 — la cohérence
   D484 : size à l'affichage) ; le socle du vocabulaire (D461) ;
6. **Items** — **des sections, rien d'autre** : « chaque item est
   alors une section » (D489) ;
7. **Modes et déclinaisons** — partout où un conteneur vit :
   `header`/`body`/`footer`, `pages`, le template (D487) ; **le format
   par écran se déclare** : « si l'affichage doit changer, screen
   permet de définir le format attendu » (D450/D490) — rien
   d'automatique ;
8. **États et interactions** — la visibilité par les droits et la
   confidentialité ; **le débordement de `size:`** — les barres de
   scrolling **visibles ou évanescentes** (« plus moderne »), **le
   swipe au tactile** sans barres, les barres restant « le
   positionnement de l'écran par rapport à l'ensemble » (D503) ;
9. **Décisions fondatrices** — D449–D451, D455, D461, D487,
   D489–D491, D501–D503 ;
10. **Exemple de configuration** —

```yaml
gui:
  forms:
    default:
      page:
        - sections:                # l'organisateur (D489)
            layout: row            # column[n] | row[n] (D490/D491)
            items:
              - section:
                  title: { fr: Adresse, en: Address }
                  items:
                    - field[street]
                    - field[city]
              - section:
                  title: { fr: Contact }
                  items:
                    - field[phone]
                    - field[email]
```

## `section`

1. **Nom et famille** — `section`, un conteneur — **« une partie du
   composant sections »** (D489) ; « un regroupement potentiellement
   nommé » ; fournie par Syncytium (D451) ;
2. **Rôle** — **« organiser différents nœuds »** sous un intitulé
   facultatif — l'unité de lecture ; le nœud pur : aucune valeur
   portée, aucun bloc à part (D487) ;
3. **Types servis** — aucun : le conteneur est indifférent à ce qu'il
   contient (le graphe D455) ;
4. **Contexte consommé** — le contexte transmis tel quel aux items
   (l'enregistrement, l'origine de l'appel, l'utilisateur — D455) ;
   les droits et la confidentialité (la section masquée masque ses
   items) ;
5. **Propriétés** — **`title:`** — « le nom d'un regroupement est en
   fait un libellé en titre de la section » (D493) : les libellés par
   langue (D465) en position de titre, **facultatif** (« potentiellement
   nommé ») ; **`width:` / `height:`** — « calibrer la taille » :
   l'uniforme se pose sur l'organisateur, **la taille variable sur la
   section** — le plus proche l'emporte (D501–D502 ; « sans précision,
   l'ensemble de l'espace est pris ») ; le socle du vocabulaire (D461 : style…) ;
6. **Items** — **« soit sections, soit une des feuilles vues
   précédemment »** (D489) — l'alternance stricte : l'emboîtement de
   sections passe par l'organisateur `sections` ; les champs par
   `field[<nom>]` (D460) ;
7. **Modes et déclinaisons** — au formulaire : le cadre, l'intitulé en
   tête s'il est nommé ; dans `header`/`body`/`footer` comme dans
   `pages` (D450/D487) ; le rendu s'adapte au `screen:` déclaré
   (D450) ; template : le regroupement du gabarit ; **la section seule
   vit directement sous un conteneur — header, body ou footer**
   (D490 — l'écho de D450/D451) ; ailleurs, la composition passe par
   l'organisateur `sections` ;
8. **États et interactions** — la visibilité par les droits et la
   confidentialité ; rien d'autre au socle ;
9. **Décisions fondatrices** — D449–D451, D455, D460–D461, D465,
   D487, D489–D491, D493, D501–D502 ;
10. **Exemple de configuration** — *(le couple vit ensemble — voir
    aussi la fiche `sections`)* —

```yaml
page:                              # la section seule, directement (D490)
  - section:
      title: { fr: Adresse }
      items:
        - field[street]            # les feuilles (D489)
        - sections:                # l'emboîtement par l'organisateur
            layout: column[2]      # deux colonnes, le repli au-delà (D491)
            size: 400px            # l'espace du tout — au-delà, le défilement (D503)
            height: 120px          # l'uniforme — chaque section à la même taille (D502)
            items:
              - section:
                  width: 70%       # le variable — la section l'emporte (D502)
                  items: [ field[zip], field[city] ]
              - section: { items: [ field[country] ] }   # le reste de l'espace
```

## `paragraph`

1. **Nom et famille** — `paragraph` (D488 — le nom validé), une
   feuille — **le texte fixe** : « mettre du texte pour indiquer les
   informations légales de l'entreprise » ;
2. **Rôle** — le texte venu de la configuration, affiché tel quel —
   **aucun champ derrière** : la mention, l'explication,
   l'avertissement ;
3. **Types servis** — aucun : le contenu est déclaré, par langue
   (D465) ou par référence au dictionnaire du module (`labels` —
   D440) ;
4. **Contexte consommé** — la langue de l'utilisateur (le contexte —
   D455) ; les droits et la confidentialité ;
5. **Propriétés** — `label:` — les libellés par langue (D465), ou la
   référence au dictionnaire (D440) ; le socle du vocabulaire (D461 :
   style…) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — au formulaire : le paragraphe en
   place ; **template** : le texte du gabarit — les mentions légales
   d'une facture ; jamais en colonne (aucun champ) ; *la fiche sera
   étoffée au point gabarit / génération de documents (Q55)* ;
8. **États et interactions** — la visibilité par les droits ; rien
   d'autre — le texte ne se clique pas ;
9. **Décisions fondatrices** — D440, D455, D461, D465, D488 ;
10. **Exemple de configuration** —

```yaml
gui:
  forms:
    default:
      footer:
        - paragraph:
            label:
              fr: SARL Dupont — RCS Lyon 123 456 789 — TVA FR12 345678901
              en: Dupont Ltd — Trade register 123 456 789
        - paragraph:
            label: legal           # la référence au dictionnaire du module (D440)
```

## `picture`

1. **Nom et famille** — `picture` (D488 — le nom validé), une
   feuille — **l'image fixe** : « son logo » ;
2. **Rôle** — l'image venue de la configuration, affichée telle
   quelle — **aucun champ derrière** : le logo, l'illustration ;
3. **Types servis** — aucun : le fichier est livré avec la
   configuration, comme les icônes du menu (D439) ;
4. **Contexte consommé** — les droits et la confidentialité ;
5. **Propriétés** — le fichier — la forme courte `picture: logo.png`,
   ou `file:` en clair (*en proposition*) ; le couple `size:` /
   `dimension:` (D484) ; le socle du vocabulaire (D461) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — au formulaire : l'image en place ;
   **template** : le logo du gabarit — l'entête de la facture ; jamais
   en colonne (aucun champ) ; *la fiche sera étoffée au point gabarit /
   génération de documents (Q55)* ;
8. **États et interactions** — la visibilité par les droits ; le
   fichier manquant = une erreur d'ingestion (D330), jamais un
   placeholder ;
9. **Décisions fondatrices** — D439, D455, D461, D484, D488 ;
10. **Exemple de configuration** —

```yaml
gui:
  forms:
    default:
      header:
        - picture: logo.png        # la forme courte — le fichier de la configuration
        - picture:
            file: banner.png       # la forme en clair (proposition)
            size: 120px            # à l'affichage (D484)
```

## `color`

1. **Nom et famille** — `color`, une feuille — le composant naturel du
   type `color` (D458/D496) ;
2. **Rôle** — la couleur regardée et saisie : **la pastille** — le code
   hexadécimal en légende —, le sélecteur à l'appel ;
3. **Types servis** — `color` (D496) : **le stockage est un entier**
   (le RGB(A) assemblé, au moteur), **l'affichage en hexadécimal**
   (`#RRGGBB`, l'alpha en option) et **la base des couleurs nommées**
   traduisant `red`, `orange`, `green`… en RGB — celles de `colors:`
   (D467) ; la validation intégrée (la règle générale des composés) ;
4. **Contexte consommé** — le champ, son `mode`, les droits ;
5. **Propriétés** — le socle du vocabulaire (D461) ; la saisie s'ouvre
   en `picker.color` (D496) — l'ancre et la dimension du déploiement
   (D469/D484) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — **lecture** : la pastille + le code
   hex ; **cellule** : la pastille ; **saisie** : le sélecteur
   (`picker.color`) ; **template** : la pastille imprimée ;
   **CSV/Excel** : l'hexadécimal (l'affichage canonique),
   ré-importable ; **le tri sur l'entier stocké**, le nul en premier
   (la règle des composés D391) ;
8. **États et interactions** — grisée si `readonly`/droits ; le refus
   des valeurs hors format ou hors base (la validation du type) ;
9. **Décisions fondatrices** — D458, D461, D467, D469, D484, D496 ;
10. **Exemple de configuration** —

```yaml
# quality/entities/threshold.yml — l'entité des seuils (D495)
fields:
  level: integer[0..100]
  tint:  color                   # entier au moteur, hex à l'écran (D496)

gui:
  lists:
    main:
      columns: [level, tint]     # la pastille en cellule
```

## `picker.color`

1. **Nom et famille** — `picker.color`, une feuille de la famille
   pointée (D470/D473/D496) ;
2. **Rôle** — **« sélectionner une couleur »** : la palette qui
   s'ouvre, le choix qui se referme ;
3. **Types servis** — `color` (la saisie — le défaut du type
   l'appelle, D458) ; `list of color` (D362) en sélection multiple ;
4. **Contexte consommé** — le champ (ses `values:` éventuelles), la
   base des couleurs nommées (D496), les droits ;
5. **Propriétés** — `selection:` — le nombre (D474 : `1` défaut,
   `1..`, `1..5`) ; `anchor:` — centre de l'écran, à droite du champ,
   à la place du champ (D469) ; `dimension:` — le déploiement
   (D469/D484) ; le socle (D461) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — la palette (la base des couleurs
   nommées) et le code hexadécimal saisissable ; *(en proposition : si
   le champ porte des `values:`, la palette s'y restreint — l'écho de
   dropdown/icons)* ; smartphone : le plein écran (l'esprit D293) ;
8. **États et interactions** — le refus des valeurs hors format (la
   validation du type) ; grisé si `readonly`/droits ;
9. **Décisions fondatrices** — D469–D470, D473–D474, D496 ;
10. **Exemple de configuration** —

```yaml
- field[tint]:
    component: picker.color
    anchor: right                # à droite du champ (D469)
    dimension: 30%               # le déploiement (D484)
```

## `tabs`

1. **Nom et famille** — `tabs`, un conteneur — **l'organisateur des
   onglets** (l'inventaire D456) ; le couple `tabs`/`tab` au miroir de
   `sections`/`section` (*le patron D489 — en proposition*) ;
2. **Rôle** — poser les onglets : **un seul volet visible à la fois**,
   la bascule par la poignée ;
3. **Types servis** — aucun : le conteneur est indifférent au contenu
   (D455) ;
4. **Contexte consommé** — le contexte transmis tel quel aux items
   (D455) ; les droits et la confidentialité — **l'onglet masqué
   disparaît de la barre** ;
5. **Propriétés** — **`mode:`** — les visages de la barre (D504) :
   `top` (Windows — le défaut), `bottom` (Excel), `left`/`right` (la
   latérale), **`wizard`** (« voir toutes les étapes mais ne pas
   prendre d'avance tant que l'onglet précédent n'a pas été exploré »
   — l'écho du cliquet D354) ; le crochet en raccourci :
   `tabs[bottom]`, `tabs[wizard]` (*l'écriture en proposition —
   D478*) ; `size:` — l'espace du tout (l'écho D503/D484) ; **la
   dimension unique des volets** — « pour chaque tab, toujours la même
   dimension » (D506 — aucun `width`/`height` par volet, le contraste
   avec D502) ; le socle du vocabulaire (D461) ;
6. **Items** — **des `tab`, rien d'autre** (*le miroir de D489 — en
   proposition*) ;
7. **Modes et déclinaisons** — la barre des poignées + le volet
   courant — en haut, en bas, latérale (D504) ; **le mode wizard** :
   les étapes toutes visibles, l'avance au rythme de l'exploration
   (la parenté avec la surface `wizard` D230–D233) — **« les tabs
   parcourus décrivent le chemin de traitement »** : le clic sur une
   phase explorée y ramène, l'avance reste gardée (D505) ; l'entête, le
   corps et le pied acceptent les onglets (D450) ; **tactile** : le
   swipe bascule d'un onglet à l'autre (l'esprit D503) ;
   **template** : les onglets rendus à la suite (*en proposition —
   rien ne bascule sur le papier*) ;
8. **États et interactions** — la bascule au clic ou au swipe ;
   l'onglet masqué par les droits disparaît ; le fil peut prendre un
   onglet (D485) ;
9. **Décisions fondatrices** — D449–D451, D455–D456, D461, D485,
   D487, D489 (le patron), D503–D506 ;
10. **Exemple de configuration** — *(le couple vit ensemble)* —

```yaml
page:
  - tabs:
      mode: wizard               # les étapes — l'avance à l'exploration (D504)
      items:
        - tab:
            title: { fr: Général }
            items:
              - field[name]
              - field[status]
        - tab:
            title: { fr: Échanges }
            icon: chat.svg         # l'icône de l'item gui (D439)
            items:
              - field[discussion]  # le fil prend l'onglet (D485)
```

## `tab`

1. **Nom et famille** — `tab`, un conteneur — **une partie de `tabs`**
   (le miroir de `section` — D489) ;
2. **Rôle** — l'onglet : le volet nommé qui se montre seul, sa
   poignée dans la barre ;
3. **Types servis** — aucun ;
4. **Contexte consommé** — le contexte transmis tel quel (D455) ; les
   droits (l'onglet masqué disparaît, poignée comprise) ;
5. **Propriétés** — **`title:`** — la poignée se nomme (D493 ; *requis
   en proposition — un onglet sans poignée ne se choisit pas*) ;
   **`icon:`** — « chaque item gui doit disposer d'un champ icône »
   (D439) ; **« les icônes permettent de minimiser le texte ou
   afficher le texte en survol »** (D504 — la poignée compacte, le
   titre en info-bulle) ; le socle (D461) ;
6. **Items** — des `sections` ou des feuilles (l'alternance D489) ;
7. **Modes et déclinaisons** — le volet plein cadre, **à la dimension
   commune** — « les zones sont centrées si elles représentent un
   espace plus petit » (D506) ; la poignée = le titre + l'icône ;
   smartphone : la barre défilable ;
8. **États et interactions** — la bascule ; masqué par droits ou
   confidentialité ;
9. **Décisions fondatrices** — D439, D449–D451, D455, D461, D489,
   D493, D504, D506 ;
10. **Exemple de configuration** — *(voir la fiche `tabs` : le couple
    vit ensemble)*.

## `pages`

1. **Nom et famille** — `pages`, un conteneur — **« une section
   pouvant contenir un header, des page(s) et un footer »** (la
   définition de l'auteur, D456) ; le troisième couple, après
   `sections`/`section` et `tabs`/`tab` (le patron D489) ;
2. **Rôle** — **paginer** : le contenu découpé en pages — au
   formulaire comme au template ;
3. **Types servis** — aucun : le conteneur est indifférent au contenu
   (D455) ;
4. **Contexte consommé** — le contexte transmis tel quel aux items
   (D455) ; les droits et la confidentialité ;
5. **Propriétés** — **aucune dimension** : « pages prend toute la
   place » (D507 — le contraste avec D503) ; le socle du vocabulaire
   (D461) ;
6. **Items** — **un `header` (facultatif), des `page`, un `footer`
   (facultatif)** — sa définition ; **« s'ils sont définis, ils sont
   toujours visibles »** (D507) — l'entête et le pied encadrent les
   pages qui tournent, **leur `height:` est paramétrable**, et **« la
   page prend toujours le reste »** ; au template, ils se répètent à
   chaque page (*en proposition*) ;
7. **Modes et déclinaisons** — au formulaire : une page à l'écran —
   **« la navigation s'effectue de la même façon que les tabs, et
   l'affichage suit la même logique »** (D508) : la barre des
   poignées, ses modes (D504), le chemin (D505), le swipe ;
   **template** : les pages physiques du document, l'entête et le pied
   répétés ;
8. **États et interactions** — la page masquée par les droits saute,
   la pagination se resserre ; les poignées disent le positionnement ;
9. **Décisions fondatrices** — D449, D455–D456, D461, D487, D489 (le
   patron), D507–D508 ;
10. **Exemple de configuration** — *(le couple vit ensemble)* —

```yaml
page:
  - pages:
      items:
        - header:
            height: 60px                 # la hauteur paramétrable (D507)
            items: [ field[number] ]     # toujours visible (D507)
        - page:
            items: [ field[customer], field[lines] ]
        - page:
            title: { fr: Notes }         # la poignée nommée — sinon le numéro (D508)
            items: [ field[notes] ]
        - footer:
            height: 40px
            items: [ field[total] ]      # toujours visible — la page prend le reste
```

## `page`

1. **Nom et famille** — `page`, un conteneur — **« un composant de
   `pages` : le saut de page »** (la définition de l'auteur, D456) ;
2. **Rôle** — la page : une part du découpage — le saut qui la sépare
   de la suivante ;
3. **Types servis** — aucun ;
4. **Contexte consommé** — le contexte transmis tel quel (D455) ; les
   droits (la page masquée saute) ;
5. **Propriétés** — **la poignée : le numéro par défaut** — « nous
   pouvons lui affecter un nom et/ou un icône comme un tab » (D508) :
   `title:` (D493) et `icon:` (D439) ; le socle (D461) ;
6. **Items** — des `sections` ou des feuilles (l'alternance D489 —
   *le miroir en proposition*) ;
7. **Modes et déclinaisons** — au formulaire : la page à l'écran ; au
   template : la page physique — le saut force le passage ;
8. **États et interactions** — masquée par droits ou confidentialité,
   la pagination se resserre ;
9. **Décisions fondatrices** — D439, D449, D455–D456, D461, D489,
   D493, D508 ;
10. **Exemple de configuration** — *(voir la fiche `pages` : le couple
    vit ensemble)*.

## `header` / `footer`

1. **Nom et famille** — `header` et `footer` — deux conteneurs d'un
   même sang : les rôles réservés de `pages` (D487/D490, amendés
   D509 — **le formulaire est un `pages` implicite**, `body` a quitté
   le vocabulaire au profit de `page`) ; « pas besoin de composants
   complémentaires » : la famille des conteneurs est close ;
2. **Rôle** — l'entête se fige en haut, le pied en bas — **« s'ils
   sont définis, ils sont toujours visibles »**, et **la page prend
   toujours le reste** (D507) ;
3. **Types servis** — aucun : des conteneurs (D455) ;
4. **Contexte consommé** — le contexte transmis tel quel aux items
   (D455) ; les droits et la confidentialité ;
5. **Propriétés** — **`height:`** — « la hauteur du footer et du
   header sont paramétrables » (D507) ; le socle du vocabulaire
   (D461) ;
6. **Items** — « l'entête et le pied acceptent sections et onglets »
   (D450) : les sections seules (D490), l'organisateur `sections`,
   les `tabs`, les feuilles ;
7. **Modes et déclinaisons** — au formulaire (le `pages` implicite —
   D509) comme dans un `pages` déclaré (D507) : toujours visibles
   pendant que les pages tournent ; au template : répétés à chaque
   page (*en proposition — D507*) ;
8. **États et interactions** — masqués par les droits ; rien d'autre
   au socle ;
9. **Décisions fondatrices** — D449–D450, D455, D461, D487, D490,
   D507, D509–D510 ;
10. **Exemple de configuration** —

```yaml
forms:
  default:                         # le formulaire = un pages implicite (D509)
    header:
      height: 60px                 # la hauteur paramétrable (D507)
      items: [ field[number] ]
    page:                          # ex-body (D509) — la page prend le reste
      - section:
          title: { fr: Client }
          items: [ field[customer] ]
    footer:
      items: [ field[total] ]

# le multi-pages : la liste d'éléments (D510)
forms:
  wizard_entry:
    - header: { items: [ field[number] ] }
    - page:   { items: [ field[customer] ] }
    - page:   { items: [ field[lines] ] }
    - footer: { items: [ field[total] ] }
```

# Les actes

## `operation` (l'acte)

1. **Nom et famille** — l'acte, **une fiche unique** : en items,
   **`operation[<nom>]`** — « pour être en phase avec les fields »
   (D511, l'écho de `field[<nom>]` D460 et `template[<nom>]` D483) ;
   la matérialisation se déduit de l'habitat ;
2. **Rôle** — **« l'utilisateur acte une opération »** (D456) : le
   geste qui engage — le bouton, l'icône, le passage d'étape ;
3. **Types servis** — les opérations du bloc `operations:` (D432 —
   sans `when` : le bouton / la fonction API, D428) ; le changement
   d'état du graphe (D425–D427, l'opération du catalogue par défaut —
   D433) ;
4. **Contexte consommé** — l'opération : sa garde (`if` — D430), ses
   droits (D196), son `validate:` (D431) ; l'enregistrement ou la
   sélection (l'opération de masse — D446) ; **la pré-exécution**
   (D511) — les modifications à venir, chiffrées ;
5. **Propriétés** — la surcharge de la présentation : `label:`,
   `icon:`, `style:` (le verbe du catalogue en défaut) ;
   **`validate:`** — `true` (défaut — la relecture D431) ou **le
   message au gabarit nourri de la pré-exécution** (D511 — *écriture
   en proposition :* `validate: { message: { fr: "{invoices}
   factures seront créées" } }`, les variables = les résultats nommés
   de la pré-exécution) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — **l'habitat fait le visage** : le
   formulaire → **le bouton** ; la colonne de liste → **l'icône à
   trois états** (D444, le verbe au nom nu — D462) ; le wizard → **le
   passage d'étape** (D504–D505, l'avance gardée) ; le menu →
   l'adresse `<module>.<entité>.<opération>` (D439) ; **les deux
   modes de l'opération** (D511) : la pré-exécution — « identifier
   les modifications à apporter » — puis l'exécution réelle ;
   template : jamais (le papier n'agit pas) ;
8. **États et interactions** — **les trois états** (D444) :
   actionnable / **non actionnable** (la garde grise le bouton, l'API
   refuse proprement — D430) / **non visible** (les droits D196, la
   confidentialité) ; la relecture avant engagement (D431 — lecture
   seule + confirmer/annuler, jamais de popup D196) ; l'exécution
   `synchronous`/`asynchronous`/`await` (D436) ;
9. **Décisions fondatrices** — D196, D425–D433, D436, D439, D444,
   D446, D456, D460, D462, D504–D505, D511 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/order.yml
operations:
  invoice:
    validate:
      message: { fr: "{invoices} factures seront créées" }  # le gabarit — la pré-exécution nourrit (D511)
    effects:
      - function: create_invoices

gui:
  forms:
    default:
      footer:
        items:
          - operation[invoice]:        # le bouton au formulaire (D511)
              icon: invoice.svg
  lists:
    main:
      columns: [number, customer, invoice]   # l'icône à trois états (D444/D462)
```

# Les graphiques

## `chart.line`

1. **Nom et famille** — `chart.line`, un graphique de la famille
   pointée (D512) — la courbe ;
2. **Rôle** — l'évolution d'un agrégat le long d'un axe : la tendance
   d'un regard ;
3. **Types servis** — aucun champ : **le graphique est une déclaration
   autonome réutilisable** (D243) — **son assise : une entité, une
   liste nommée, ou un champ de type `list of` / `association with`**
   (D517/D539 — le champ-collection : le graphique des éléments liés
   à l'enregistrement du contexte), **les axes faisant référence aux
   champs de l'assise** (D517) ;
4. **Contexte consommé** — **X découpé par valeurs, par plages ou par
   temporalité** (D240) ; **Y = un agrégat (D158) filtré sur X** ; la
   confidentialité héritée de l'entité, surchargeable (D247) ; les
   droits ;
5. **Propriétés** — la déclaration (*les noms en proposition*) :
   **`on:`** — l'assise à l'adresse (D517/D439) : `sales.order`
   (l'entité) ou `sales.order[invoiced]` (la liste nommée, le crochet
   de l'adresse) — **absent : l'entité porteuse de la déclaration**
   (D518) ; **`x:`** — le découpage d'un champ de l'assise
   (`date[month]` : le crochet temporel),
   **`y:`** — l'agrégat (`sum(total)` — l'expression D90/D158),
   `filter:` — le périmètre (D90), **`drill:`** — le drill-down
   déclaré : la liste nommée au filtre imposé (D242 — « par défaut,
   pas de drill-down ») ; `title:` (D493) ; **les réglages
   d'affichage** (D515) : **la forme riche des axes** — `x:`/`y:`
   acceptent `{ value:, min:, max:, scale: }` (les début et fin
   d'axe — l'écho D494 ; `scale: linear` défaut `| log`),
   **`display: graph | table | both`** — le graphique, le tableau des
   valeurs, ou les deux (D521 — l'écho D244 ; défaut `graph`),
   **`colors:`** (la mécanique D467 — la couleur par série, le
   dégradé), **`labels:`** (D516) — `true` : la valeur au format du
   champ ; **le gabarit** pour personnaliser (la collision avec le
   dictionnaire D440 notée — le contexte départage, D458) ; le visage
   au nuage (D386) ; *(en proposition : `y:` accepte une
   liste — plusieurs séries sur le même axe ; les deux axes restent à
   `chart.combo`, D239)* ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — **réutilisable** : le widget (associé à
   une entité → le module fonctionnel — D247), le formulaire, le
   tableau de bord (le rafraîchissement statique / temps réel /
   fréquence — D249) ; **template** : l'image du graphique (D257) ;
   tactile : le point touché montre sa valeur ;
8. **États et interactions** — **le drill-down au clic** : le
   graphique « enrichit le filtre de la liste pour imposer » les
   éléments de la valeur cliquée (D242) ; **le clic sur une
   vignette** : « voir toutes les valeurs utilisées pour le calcul »
   (D516 — si l'agrégat dépend d'une liste ou d'une association, le
   détail des contributions s'ouvre) ; la confidentialité masque ;
9. **Décisions fondatrices** — D90, D158, D239–D244, D247–D249,
   D439, D512, D515–D518, D521, D539 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/order.yml, bloc gui — la déclaration autonome (D243)
charts:
  revenue_by_month:
    component: chart.line
    title: { fr: Chiffre d'affaires }
                                 # on: absent — l'assise : l'entité porteuse (D518)
    x: date[month]               # le champ, découpé (D240/D517)
    y: sum(total)                # l'agrégat d'un champ (D158)
    filter: state = "invoiced"   # le périmètre (D90)
    drill: invoiced              # la liste nommée au filtre imposé (D242)

  margin_by_month:
    component: chart.line
    on: sales.order[invoiced]    # l'assise : la liste — le périmètre hérité (D517)
    x: date[month]
    y: { value: avg(margin), min: 0, max: 100, scale: linear }   # (D515)
    colors: { serie: blue }      # la mécanique D467 — le dégradé possible
    labels: true                 # la valeur au format du champ (D516)
```

## `chart.bars`

1. **Nom et famille** — `chart.bars`, un graphique de la famille
   pointée (D512) — les barres ;
2. **Rôle** — la comparaison des quantités par catégorie : la barre
   qui mesure ;
3. **Types servis** — l'assise (D517–D518 : l'entité porteuse ou
   `on:`), les axes aux champs — le découpage **par valeurs** y est
   roi (les catégories — D240), les plages et la temporalité
   possibles ;
4. **Contexte consommé** — le socle des `chart.*` : la confidentialité
   héritée surchargeable (D247), les droits ;
5. **Propriétés** — **le socle commun** (D515–D518, D521 — `display:`
   compris) : `on:`, `x:`, `y:` (la forme riche — et la liste :
   plusieurs séries), `filter:`, `drill:`, `colors:`, `labels:`,
   `title:` ; **les écarts propres** (*en proposition*) :
   **`mode: vertical | horizontal`** (défaut
   vertical — le crochet en raccourci : `chart.bars[horizontal]`,
   D478) ; **`stacked:`** — les séries empilées (`true`), côte à côte
   sinon (défaut) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — réutilisable : le widget, le
   formulaire, le tableau de bord (D243/D249) ; **template** :
   l'image (D257) ; tactile : la barre touchée montre sa valeur ;
8. **États et interactions** — le drill-down au clic (D242) ; le clic
   sur une barre : les valeurs du calcul (D516) ; la confidentialité
   masque ;
9. **Décisions fondatrices** — D239–D243, D247–D249, D512,
   D515–D518 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/order.yml, bloc gui
charts:
  revenue_by_seller:
    component: chart.bars[horizontal]   # ≡ mode: horizontal (D478)
    x: seller                    # le découpage par valeurs (D240)
    y: [ sum(total), sum(margin) ]      # deux séries côte à côte
    labels: true

  stock_by_site:
    component: chart.bars
    stacked: true                # les séries empilées (proposition)
    x: site
    y: [ sum(reserved), sum(available) ]
```

## `chart.pie`

1. **Nom et famille** — `chart.pie`, un graphique de la famille
   pointée (D512) — les secteurs : « camembert/anneau » (D239) ;
2. **Rôle** — la répartition d'un tout : chaque part son secteur ;
3. **Types servis** — l'assise (D517–D518) ; `x:` = le découpage **par
   valeurs** (les parts — D240), `y:` = l'agrégat qui mesure la part ;
4. **Contexte consommé** — le socle des `chart.*` : la confidentialité
   héritée surchargeable (D247), les droits ;
5. **Propriétés** — **le socle commun** (D515–D518, D521 —
   `display:` compris) : `on:`, `x:`, `y:`, `filter:`, `drill:`,
   `colors:`, `labels:`, `title:` ; **les écarts propres** (D519) : **`mode: pie | donut | quarter`** — le
   camembert (défaut), l'anneau, l'arc (le crochet en raccourci :
   `chart.pie[donut]`, D478) ; **`thickness:`** — l'épaisseur de
   l'anneau et de l'arc (D520 — *en proposition : le pourcentage du
   rayon*) ; **les angles de `quarter`** — le départ et la fin, *en
   proposition au crochet aux bornes* : `quarter[-90..90]` (0° à
   midi, le sens horaire ; nu = `[0..90]`) — « représenter
   l'assemblée nationale de la gauche vers la droite » (D520) ; **les variables du
   gabarit** des labels : `{value}`, `{percent}`, `{total}` —
   « {percent} % ({value} / {total}) » (D516/D519) ; **le
   regroupement des petites parts en « autres »** — un seuil, rien
   par défaut (D519) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — réutilisable : le widget, le
   formulaire, le tableau de bord (D243/D249) ; **template** :
   l'image (D257) ; tactile : la part touchée montre sa valeur ;
8. **États et interactions** — **le clic sur une part : la liste de
   ses éléments** (D242/D519) ; **le drill d'« autres » à deux
   étages** : une barre de répartition de toutes les autres valeurs
   s'ouvre — l'utilisateur y précise la valeur à filtrer dans la
   liste (D519) ; les valeurs du calcul (D516) ; la confidentialité
   masque ;
9. **Décisions fondatrices** — D239–D243, D247–D249, D512, D515–D516,
   D519–D520 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/order.yml, bloc gui
charts:
  revenue_by_category:
    component: chart.pie[donut]     # ≡ mode: donut — l'anneau (D239/D478)
    x: category                     # les parts (D240 — par valeurs)
    y: sum(total)
    labels: { fr: "{percent} % ({value} / {total})" }   # le trio (D519)
    drill: by_category              # le clic : la liste de la part (D242/D519)

  assembly:                         # l'hémicycle (D520)
    component: chart.pie
    mode: quarter[-90..90]          # de la gauche vers la droite
    thickness: 40%                  # l'épaisseur de l'arc
    on: politics.deputy
    x: party
    y: count()
```

## `chart.scatter`

1. **Nom et famille** — `chart.scatter`, un graphique de la famille
   pointée — le nuage de points, l'ajout de l'auteur (D512) ;
2. **Rôle** — **« représenter une concentration ou une dispersion
   d'une certaine valeur »** — et **« aider à catégoriser des
   éléments »** (D522) : la matrice de décision ;
3. **Types servis** — l'assise (D517–D518) ; **le grain diffère** :
   un point par **enregistrement** — `x:` et `y:` deux champs
   numériques **nus** (sans agrégat), là où courbe et barres
   agrègent (D522) ;
4. **Contexte consommé** — le socle des `chart.*` (la confidentialité
   D247, les droits) ; **le visage de l'enregistrement** (D386) ;
5. **Propriétés** — **le socle commun** (D515–D518, D521 — `display:`
   compris) ; **les écarts propres** (D522–D523) :
   **`threshold:`** dans la forme riche de l'axe — « l'axe définit
   min, max et threshold » : la liste croissante des seuils, les
   bandes ; **`zones:`** — la zone **s'adresse dans la matrice
   créée** : `zone: [1,1]` + `title:` (+ `color:`) — plus aucune
   borne répétée (D523 ; *la convention en proposition :
   `[colonne, ligne]` depuis l'origine des axes, `[1,1]` en bas à
   gauche*) : le MoSCoW à deux critères, l'effort/bénéfice ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — réutilisable (D243/D249) ; template :
   l'image (D257) ; **le survol** : le visage de l'enregistrement
   (D386) ; le tableau des valeurs (`display:` — D521) ;
8. **États et interactions** — **le clic sur un point : le
   formulaire de l'enregistrement** ; **le clic sur une zone : la
   liste de ses éléments** (l'écho D519) ; la confidentialité
   masque ;
9. **Décisions fondatrices** — D239–D243, D247–D249, D386, D512,
   D515–D518, D521–D523 ;
10. **Exemple de configuration** —

```yaml
# projects/entities/action.yml, bloc gui — la matrice effort/bénéfice (D522)
charts:
  priorities:
    component: chart.scatter
    x: { value: effort,  min: 0, max: 100, threshold: [50] }   # les bandes (D523)
    y: { value: benefit, min: 0, max: 100, threshold: [50] }
    zones:                        # la position dans la matrice — [colonne, ligne] (D523)
      - { zone: [1,2], title: { fr: Gains rapides }, color: green }
      - { zone: [2,2], title: { fr: Grands projets }, color: orange }
      - { zone: [1,1], title: { fr: Tâches de fond }, color: gray }
      - { zone: [2,1], title: { fr: À éviter },      color: red }
    labels: true                  # le visage au survol (D386)
```

## `chart.combo`

1. **Nom et famille** — `chart.combo`, un graphique de la famille
   pointée (D512) — le combiné ;
2. **Rôle** — deux mesures d'un regard : **« courbe + barres ou deux
   courbes, 2 axes Y max, même temporalité/échantillon »** (D239) ;
3. **Types servis** — l'assise (D517–D518) ; **un `x:` commun** (le
   même découpage — la même temporalité par construction) ; **deux
   séries `y:`, chacune son axe** (gauche/droite) ;
4. **Contexte consommé** — le socle des `chart.*` (la confidentialité
   D247, les droits) ;
5. **Propriétés** — **le socle commun** (D515–D518, D521 —
   `display:` compris) ; **les écarts propres** (*écritures en
   proposition*) : `y:` en liste de séries —
   `{ value:, as: line | bars, axis: left | right }` — la nature et
   l'axe de chacune (défauts : la première à gauche, la seconde à
   droite) ; **ou `axis: bottom | top`** — « la représentation en
   ligne contre la représentation en colonne » (D524, harmonisé
   D525) : les valeurs couchées, la paire homogène par construction —
   les bords d'un seul vocabulaire (D504) ; **deux axes maximum** — « au-delà de 2 axes, illisible »
   (D239) : la troisième série refusée à l'ingestion, le hook pour
   aller au-delà ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — réutilisable (D243/D249) ; template :
   l'image (D257) ; le tableau des valeurs — les deux séries en
   colonnes (`display:` — D521) ;
8. **États et interactions** — le drill-down au clic (D242) ; les
   valeurs du calcul (D516) ; la confidentialité masque ;
9. **Décisions fondatrices** — D239–D243, D247–D249, D512,
   D515–D518, D521, D524–D525 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/order.yml, bloc gui
charts:
  activity:
    component: chart.combo
    x: date[month]               # le découpage commun (D239/D240)
    y:
      - { value: sum(total), as: bars, axis: left }    # le CA en barres
      - { value: count(),    as: line, axis: right }   # le volume en courbe
    labels: true
```

## `kpi`

1. **Nom et famille** — `kpi`, un graphique (D512 — à côté de la
   famille pointée) — le chiffre-clé ;
2. **Rôle** — un agrégat en grand : l'indicateur d'un regard ;
3. **Types servis** — l'assise (D517–D518 : l'entité porteuse ou
   `on:`) ; **la valeur = un agrégat (D158) — aucun axe** ;
4. **Contexte consommé** — le socle des graphiques : la
   confidentialité héritée surchargeable (D247), les droits ;
5. **Propriétés** — `on:` (D517–D518), **`value:`** — l'agrégat
   (*l'écho de `y:`, sans axe — en proposition*), `filter:` (D90),
   `title:` (D493), `labels:` — le gabarit du format (D516,
   `{value}`) ; **`colors:` par seuils** — le chiffre qui change de
   couleur (la mécanique D467, la table d'entité D495 comprise) ;
   **`icons:` par seuils** — « associer éventuellement une icône :
   cas d'un feu tricolore » (D526 — la mécanique D467 dupliquée ; la
   collision avec la feuille `icons` notée, le contexte départage
   D458 ; la liaison `icon:` à la table D495) ; **`layout:`** —
   « l'organisation se découpe en 4 » (D527) : la position du label —
   `top` (défaut) `| left | bottom | right` (les bords D525),
   **l'icône au bord opposé** (*la collision avec le layout des
   sections D490 notée — les valeurs départagent, D458*) ; `drill:`
   (D242) ; **pas de comparaison dans le socle** (D245 —
   l'évolution contre une période = un hook) ; *(la note pour plus
   tard — D541 : la tendance issue de l'historique de l'entité,
   D411/D172 — le détail différé)* ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — **« mis en valeur avec un style
   différent de la feuille »** (D527) : le chiffre en exergue, jamais
   comme un champ ; **le widget roi** (l'entité → le module
   fonctionnel — D247), le tableau de bord (le rafraîchissement
   D249), le formulaire possible (D243) ; **template** : la valeur au
   format ;
8. **États et interactions** — le clic : le drill-down (D242) ou les
   valeurs du calcul (D516) ; la confidentialité masque ;
9. **Décisions fondatrices** — D158, D242–D243, D245, D247–D249,
   D467, D495, D512, D515–D518, D526–D527 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/order.yml, bloc gui
charts:
  monthly_revenue:
    component: kpi
    value: sum(total)            # l'agrégat (D158) — aucun axe
    filter: date in current_month
    title: { fr: CA du mois }
    labels: { fr: "{value} € HT" }
    colors: { 0: red, 50000: orange, 100000: green }   # les seuils (D467)
    icons:  { 0: red_light.svg, 50000: orange_light.svg, 100000: green_light.svg }
                                 # le feu tricolore (D526)
    layout: left                 # le label à gauche, l'icône à droite (D527)
    drill: invoiced              # le clic : la liste (D242)
```

## `pivot`

1. **Nom et famille** — `pivot`, un graphique (D512 — à côté de la
   famille pointée) — le croisé dynamique ;
2. **Rôle** — **« un outil d'analyse puissant et pourtant simple à
   mettre en œuvre »** (D246) : les lignes croisent les colonnes, la
   formule remplit l'intersection ;
3. **Types servis** — l'assise (D517–D518) ; **les quatre éléments**
   (D246) : un filtre, le ou les champs en ligne, le ou les champs en
   colonne, une formule à l'intersection ;
4. **Contexte consommé** — la confidentialité héritée surchargeable
   (D247), les droits ; **indépendant des compositions matricielles**
   (D134) — le croisé est une présentation, applicable à toute
   entité ;
5. **Propriétés** — (*les noms en proposition*) : **`rows:`** — le ou
   les champs en ligne (la liste = le groupement hiérarchique,
   `[seller, customer]` : commercial › client) ; **`columns:`** — le
   ou les champs en colonne (le mot des listes D441) ; **`value:`** —
   la formule : un agrégat (D158) **partitionné par la cellule** ;
   `filter:` (D90) ; **`sort:`** — « le tri peut s'appuyer
   sur les rows, les columns ou la value » (D528–D529) : la clé = un
   champ des lignes, un champ des colonnes, ou `value` — les signes
   et cascades D441 (`sort: { seller: -value, date: + }`) ; chaque
   niveau du groupement trié par son sous-total, l'ordre naturel du
   champ en défaut ; **les
   plages et temporalités** sur les champs numériques ou dates —
   « comme pour les graphiques (D240), pour réduire le volume » :
   `date[month]`, les crochets ; `title:` (D493) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — **les groupements hiérarchiques,
   pliables au besoin** (D246) ; réutilisable : le widget (D247), le
   tableau de bord (D249), le formulaire (D243) ; **template** : le
   tableau rendu, groupements dépliés ;
8. **États et interactions** — **le pli et le dépli** des
   groupements ; *(en proposition : le clic sur une cellule ouvre la
   liste des éléments de l'intersection — l'écho D242/D519)* ; la
   confidentialité masque ;
9. **Décisions fondatrices** — D134, D158, D240, D243, D246–D249,
   D441, D512, D517–D518, D528–D529 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/order.yml, bloc gui — l'exemple fondateur de D246
charts:
  revenue_matrix:
    component: pivot
    rows: [seller, customer]     # la hiérarchie pliable — commercial › client
    columns: [date[month]]       # la temporalité (D240)
    value: sum(total)            # l'agrégat partitionné par la cellule (D158)
    sort: -value                 # les plus gros CA d'abord (D528)
    filter: state = "invoiced"
    title: { fr: CA par commercial et par mois }
```

## `qrcode` / `barcode`

1. **Nom et famille** — `qrcode` et `barcode`, deux feuilles
   jumelles — **les composants de sortie** (D300, clôt Q56) ; une
   fiche commune (D542 — le manque relevé par l'auteur) ;
2. **Rôle** — **« ils rendent la valeur d'un champ »** (D300) — la
   valeur encodée, lisible à la machine : l'étiquette, le document,
   l'écran ;
3. **Types servis** — les champs à valeur textuelle — le texte, le
   compteur, l'`uuid`, la référence… : **la conversion en texte du
   type** (D369) fait la valeur encodée ; en surcharge
   (`component: qrcode`) ;
4. **Contexte consommé** — le champ, sa valeur convertie (D369), les
   droits ;
5. **Propriétés** — le socle (D461) ; **`size:` aux deux régimes**
   (D543) : le qrcode — **« la taille unique pour les côtés »**
   (`size: 120px`, le carré — jamais deux valeurs) ; le code-barres —
   **« largeur × hauteur »** (`size: 200px 60px` — la grammaire
   D533) ; **la saisie peut porter sa propre taille** (D544 — *en
   proposition :* `size: { input: 30, display: 120px }`, la forme
   courte valant l'affichage seul) ; **`labels:`** — « la valeur de
   la référence sous le code-barres » (D545 — *en proposition :*
   `labels: true`, la valeur au format du champ — l'écho D516 ;
   défaut `false`) ; **le format du code-barres au crochet** (*en
   proposition :* `barcode[ean13]`, `barcode[code128]` — le défaut
   `code128`) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — **les deux modes du champ** (D544) :
   **la saisie en mode texte** — la zone du champ, son régime (la
   taille D366, le masque) — et **l'affichage en mode graphique** ;
   le PDF et l'étiquette en usage premier (D252 — l'impression
   directe du serveur, les imprimantes de l'OS) ; **Excel = la valeur
   source** (D300) ; *(le scan reste hors D300 — la question pour
   plus tard si besoin)* ;
8. **États et interactions** — la lecture seule par nature ; masqué
   par la confidentialité ;
9. **Décisions fondatrices** — D252, D300, D366, D369, D461, D484,
   D516, D533, D542–D545 ;
10. **Exemple de configuration** —

```yaml
# stock/entities/product.yml
fields:
  sku: counter[product]            # le compteur mutualisé (D410)

gui:
  templates:
    label:                         # l'étiquette imprimée du serveur (D252)
      page:
        - field[sku]:
            component: qrcode      # la valeur rendue en QR (D300)
            size: 120px            # le carré — 120 px de côté (D543)
        - field[name]
        - field[price]:
            component: barcode[ean13]   # le format au crochet (proposition)
            size: 200px 60px       # largeur × hauteur (D543)
            labels: true           # la valeur sous les barres (D545)
```

# Les surfaces

*Le fil conducteur de la passe : `sales.order` — les surfaces
construites dans l'ordre d'usage (la liste, le formulaire, le résumé,
les widgets, le wizard, les templates, le dashboard du module).*

## `list` (la surface)

1. **Nom et famille** — `list`, une surface — **le même composant que
   la feuille** (D486 : « un seul list ») ; ici son visage déclaré :
   `gui: lists: <nom>:` — **la première déclarée est la surface par
   défaut** (D438), le menu l'adresse (`sales.order[pending]` —
   D439) ;
2. **Rôle** — **la porte d'entrée de l'entité** : les enregistrements
   en tableau ou en widgets, la recherche, le tri, les opérations ;
3. **Types servis** — l'entité (ses champs en colonnes) ; **les deux
   visages exclusifs** (D492) : le tableau (`columns:`) ou la liste
   de widgets (`widget:`) ;
4. **Contexte consommé** — la confidentialité (les colonnes non
   visibles et non triables), les droits d'action (D196), le module ;
5. **Propriétés** — **`columns:`** — l'ordre d'affichage, les noms
   nus (le champ l'emporte sur l'opération homonyme — D462) ; par
   colonne : le style, l'alignement, la dimension (D442 — **le type
   prime le format** : l'amount à droite avec devise, le toggle
   centré, le multi-lignes justifié — D443/D448), la colonne fantôme
   (`visible: false`), le fond gradué (`background:` — D466), les
   couleurs (`colors:` — D467), l'aperçu du fil (`preview:` — D393) ;
   **`widget:`** (D492) ; `filter:` (l'expression D90) ; `sort:` (par
   colonne, à cascades, les signes — D441) ; `searchable:` (les
   champs ou les noms mutualisés — défaut : tous) ; `editable:`
   (**défaut : tout readonly** — D441) ; `selection: 1 | 1..`
   (D445–D446) ; `sizable: none | auto | manual | auto+manual`
   (D447) ; **`add:` / `update:` / `delete:`** — « le
   formulaire/widget à appeler » pour chaque geste (D530 — les
   défauts : le formulaire par défaut D438, les gestes D446) ;
   **`exports:`** — « les différents exports ou générations de
   documents » (D530) : CSV (un fichier par type de composant), Excel
   (l'onglet par type, le modèle, le tri d'export — D445), **le
   template** (la génération — D483/D511) — *en proposition :*
   `exports: [ csv, excel[stock.xlsx], template[order_sheet] ]` ;
   **`actions:`** — la liste d'opérations (D531) : **l'opération
   porte son icône à la déclaration, la liste la surcharge** au
   besoin ; **`size:`** — « la zone de couverture de l'écran »
   (D532) ; **la grammaire** (D533, vaut partout — D484) :
   `size: 75%` — la part de l'écran, **centrée** ; `size: 90% 50%` —
   la largeur puis la hauteur ; `size: 1000px 320px` — les pixels ; **`screen:`** — « le support sur
   lequel la liste a été définie et/ou autorisée à s'afficher »
   (D532/D450 — `[pc paysage]` en défaut) ; `title:` (D493) ;
6. **Items** — aucun à déclarer : **l'anatomie est celle d'un
   `pages`** (D531 — intrinsèque) ;
7. **Modes et déclinaisons** — **« une liste est comme pages »**
   (D531) : **le header** — le titre, les colonnes (le tabulaire ;
   « non visibles sur les widgets, sauf pour assurer les tris »), les
   filtres, **l'icône-menu des exports**, les icônes de l'ajout, de
   la modification, de la suppression, **étendues aux actions à
   icône** ; **la zone page** — le contenu du tableau ; **le
   footer** — le sous-total ou un gabarit (`{count}` — *en
   proposition*), **les boutons des actions sans icône** ; le tableau
   ou les widgets (D492) ; **le filtrage vivant** — la liste
   s'auto-rafraîchit sans bouton (D226–D229/D444) ; **la pagination
   au curseur opaque** avec les indicateurs ; l'embarquée d'une
   composition ou d'une association (D486) ; le responsive au repli
   (Q48) ;
8. **États et interactions** — **la création : le bouton compris dans
   le cadre** — le formulaire d'`add:` (D530) ; **la modification au
   double-clic** — celui d'`update:` ; la lecture seule → la
   consultation ; **la suppression** : une ligne = le formulaire de
   `delete:` en lecture seule + la confirmation, plusieurs = le
   décompte confirmé (D446/D530) ; **l'opération de masse** sur les lignes
   sélectionnées (D446) ; les opérations en colonne à trois états
   (D444) ;
9. **Décisions fondatrices** — D226–D229, D437–D448, D450, D462,
   D466–D467, D484, D486, D492–D493, D530–D533 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/order.yml, bloc gui (D437)
lists:
  pending:                        # la première déclarée = le défaut (D438)
    title: { fr: Commandes en cours }
    columns:
      - number
      - customer
      - total: { background: progress }   # le fond gradué (D466)
      - discussion: { preview: 3 }        # le fil au survol (D393)
      - invoice                    # l'opération — l'icône à 3 états (D444/D462)
    filter: state in [draft, confirmed]
    sort: { date: -, number: + }   # les cascades (D441)
    editable: [notes]              # le reste readonly (D441)
    selection: 1..                 # la multi-sélection (D446)
    sizable: auto+manual           # (D447)
    add: quick_entry               # le formulaire du bouton + (D530)
    update: default                # celui du double-clic — le défaut sinon (D438)
    exports: [ csv, excel[orders.xlsx], template[order_sheet] ]   # (D530)
    actions: [ invoice, cancel ]   # les opérations — l'icône au header, sinon
                                   # le bouton du pied (D531)

  cards:                           # le second visage (D492)
    widget: card                   # chaque enregistrement rendu par son widget
    filter: state in [draft, confirmed]

# et le menu l'adresse (D439) : sales.order[pending]
```

## `form`

1. **Nom et famille** — `form`, une surface — `gui: forms: <nom>:` ;
   **la première déclarée est le formulaire par défaut** (D438) ;
   adressé par le menu (`[+form]` — D439), appelé par la liste
   (`add:`/`update:`/`delete:` — D530), par une opération (la
   relecture `validate:` — D431/D511) ;
2. **Rôle** — l'enregistrement en face à face : **le formulaire
   unique aux cinq usages** — la création, la modification, la
   suppression, la consultation, la visualisation d'un historique
   (D199) ;
3. **Types servis** — l'entité — l'enregistrement dans son agrégat
   (D101 : les compositions embarquées) ;
4. **Contexte consommé** — **l'enregistrement, l'origine de l'appel,
   l'utilisateur** (D455) ; les droits d'action (D196), la
   confidentialité ; le `title` de l'entité (D465) ;
5. **Propriétés** — **`title:`** — la zone de texte à gabarit,
   déclinable par langue (D449/D453) : le `title` de l'entité
   utilisable et surchargeable (D465) ; **`screen:`** — le support de
   conception et l'autorisation (`[pc paysage]` défaut — D450/D532) ;
   **`mode:`** — `read-only | updatable` (D453) ; **`history:`** —
   `false` désactive l'onglet historique d'une entité historisée
   (D453) ; **`size:`** — la surimpression, défaut 100 % de
   l'écran (D454 amendé par **D535 : toute surface s'ouvre au-dessus
   de la pile des actions antécédentes cumulées** — size pour toutes
   les surfaces, le couple D484 restant au grain du champ ; la
   grammaire D533 : une ou deux valeurs, % ou px) ;
6. **Items** — **le `pages` implicite** (D509) : `header`, `page`(s),
   `footer` — les clés à l'usuel, **la liste d'éléments au
   multi-pages** (D510) ; dans les pages : les sections seules
   (D490), l'organisateur `sections`, les `tabs`, les feuilles
   (`field[<nom>]` — D460), les actes (`operation[<nom>]` — D511),
   les documents (`template[<nom>]` — D483), **les graphiques —
   `chart[<nom>]` en feuille** (D243/D540, le résumé en héritant de
   fait — D538) ;
7. **Modes et déclinaisons** — **les cinq usages d'un seul
   formulaire** (D199) : la création (les compteurs « *(attribué à la
   validation)* » — D154/D199), la modification (la concurrence par
   champ — D111), la suppression (la lecture seule + la
   confirmation — D446), la consultation (`mode: read-only`),
   l'historique (l'onglet — D453) ; **jamais de popup** (D196) ; la
   relecture d'opération (D431 — lecture seule + confirmer/annuler) ;
   le responsive au repli (D203) ;
8. **États et interactions** — les droits déterminent l'usage offert
   (D196) ; le refus de validation affiché au champ (D307) ; le
   `title` en tête, vivant avec l'enregistrement ;
9. **Décisions fondatrices** — D101, D111, D154, D196, D199, D203,
   D307, D437–D438, D446, D449–D455, D460, D465, D483, D509–D511,
   D530, D533–D535 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/order.yml, bloc gui — le fil de la passe
forms:
  default:                          # la première déclarée = le défaut (D438)
    title: "{number} — {customer}"  # le gabarit (D449) — le title de l'entité surchargé (D465)
    screen: [pc paysage]            # le support (D450)
    size: 75%                       # la surimpression centrée sur la pile (D535/D533)
    header:
      items: [ field[number], field[state] ]
    page:                           # le pages implicite (D509)
      - section:
          title: { fr: Client }
          items: [ field[customer], field[date] ]
      - field[lines]                # la composition — la liste embarquée (D486)
      - field[discussion]           # le fil prend la place qu'on lui laisse (D485)
    footer:
      items: [ field[total], operation[invoice] ]   # l'acte au pied (D511)

  quick_entry:                      # le formulaire d'add: de la liste (D530)
    page:
      - field[customer]
      - field[lines]
```

## `summary`

1. **Nom et famille** — `summary`, une surface — `gui: summaries:
   <nom>:` (*l'écriture en proposition*) ; la première déclarée = le
   défaut (D438) — mais **« défaut : n'existe pas »** (D201) : sans
   déclaration, l'entité n'offre aucun résumé ;
2. **Rôle** — l'enregistrement en bref : **« petit par principe »**
   (D201) — le visage déployé d'une référence (D215), la carte qui se
   montre sans quitter le contexte ;
3. **Types servis** — l'entité ; l'appel vient d'ailleurs : la
   référence 1-1 — **« le 1-1 affiche le title ou l'image si elle est
   définie »** (D537, le visage D386), puis le résumé se déploie
   (D186/D215) ; le widget ;
4. **Contexte consommé** — l'enregistrement, l'origine de l'appel,
   l'utilisateur (D455) ; les droits (D196), la confidentialité ;
5. **Propriétés** — **une config de formulaire restreinte** (D201) :
   les champs **sélectionnés**, **lecture seule et/ou modification**
   (le `mode` au nœud — D461) ; `title:` (D449/D465) ; `size:` — la
   surimpression sur la pile, petite par principe (D535/D533) ;
   `screen:` (D450/D532) ;
6. **Items** — la restriction du formulaire : **plusieurs sections
   possibles — « pour mêler des affichages horizontaux et
   verticaux »** (D537 — l'organisateur `sections` et ses layouts,
   D489–D491) et les feuilles ; **un kpi ou un chart — « à condition
   que son affichage reste modeste »** (D538 — `chart[<nom>]` en
   items, *la famille des adresses en proposition*) ; **l'unique
   page, jamais d'onglets** (D201/D537) ;
7. **Modes et déclinaisons** — l'appel depuis la référence (D215 — le
   1-1 affiche le libellé, le résumé se déploie) ; la lecture seule
   et/ou la modification mêlées (D201) ; le responsive au repli
   (D203) ;
8. **États et interactions** — les droits décident du modifiable ; la
   fermeture rend à la surface précédente (la pile — D535) ;
9. **Décisions fondatrices** — D186, D196, D201, D203, D215, D243,
   D386, D437–D438, D449–D450, D455, D461, D465, D489–D491,
   D532–D533, D535, D537–D538 ;
10. **Exemple de configuration** —

```yaml
# crm/entities/customer.yml, bloc gui — le résumé du client
summaries:
  card:                            # sans déclaration : aucun résumé (D201)
    title: "{name}"
    size: 30%                      # petit par principe (D201), centré (D533)
    page:
      - sections:
          layout: row              # l'horizontal et le vertical mêlés (D537)
          items:
            - section: { items: [ field[photo] ] }
            - section: { items: [ field[name], field[phone] ] }
      - field[balance]: { mode: read-only }   # le mêlé lecture/modification (D201)
      - chart[orders_kpi]          # le kpi modeste (D538)

# et depuis la commande : field[customer] affiche le title (D465) ;
# le clic déploie ce résumé au-dessus de la pile (D215/D535)
```

## `widget`

1. **Nom et famille** — `widget`, une surface — `gui: widgets:
   <nom>:` ; **associé à une entité — et par construction à un module
   fonctionnel** (D247) ; **« défaut : n'existe pas »** (D202) ;
2. **Rôle** — la petite surface autonome — **deux usages, une seule
   surface** (*la lecture en proposition*) : **la carte d'un
   enregistrement** (D492 — la liste en widgets) et **la synthèse**
   (D202 — « compteurs, sommes/calculs, graphiques, tableaux de
   valeurs », le drill-down) ;
3. **Types servis** — l'entité : l'enregistrement (la carte) ou son
   périmètre agrégé (la synthèse) ;
4. **Contexte consommé** — l'enregistrement (la carte) ou le
   périmètre (la synthèse) ; **la confidentialité héritée de
   l'entité, surchargeable** (D247) ; l'utilisateur (le pool de
   l'accueil — D204) ;
5. **Propriétés** — `title:` (D449/D465) ; `size:` (la surimpression
   sur la pile — D535, la grammaire D533) ; `screen:` (D450/D532) ;
   la config de formulaire restreinte (l'esprit D201 — petit par
   nature) ;
6. **Items** — les sections et les feuilles (la carte — D492) ; les
   graphiques — `chart[<nom>]` (la synthèse — D243/D540) ; l'unique
   page, jamais d'onglets (l'écho D537) ;
7. **Modes et déclinaisons** — **la liste en widgets** (`widget:
   <nom>` — D492) ; **la page d'accueil** : le pool — « l'utilisateur
   compose parmi les widgets de ses modules fonctionnels, sous sa
   confidentialité » (D204/D247) ; le tableau de bord (D249) ;
   **l'évaluation aux règles des champs calculés** (D248 — l'écart
   drill-down assumé, l'alerte de périmètre) ;
8. **États et interactions** — **le drill-down** vers une liste à
   filtres définis (D202/D242) ; le clic sur la carte ouvre le
   formulaire de l'enregistrement (l'écho D522) ; la confidentialité
   masque ;
9. **Décisions fondatrices** — D202, D204, D242–D243, D247–D249,
   D437–D438, D449–D450, D455, D465, D492, D533, D535, D538, D540 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/order.yml, bloc gui
widgets:
  card:                            # la carte de l'enregistrement (D492)
    page:
      - sections:
          layout: row
          items:
            - section: { items: [ field[number], field[state] ] }
            - section: { items: [ field[total] ] }

  monthly:                         # la synthèse (D202) — le pool de l'accueil (D204)
    title: { fr: Le mois en cours }
    page:
      - chart[monthly_revenue]     # le kpi (D540)
      - chart[revenue_by_month]    # la courbe — le drill vers la liste (D202/D242)
```

## `wizard`

1. **Nom et famille** — `wizard`, une surface — `gui: wizards:
   <nom>:` ; le menu l'adresse (`[@wizard]` — D439) ; la première
   déclarée = le défaut (D438) ;
2. **Rôle** — **le parcours guidé : « mono-utilisateur, une
   session »** (D230) — les étapes s'enchaînent, la transaction
   conclut ; **la démarche au sens large** (D546) : créer un
   enregistrement, modifier ou supprimer **un ensemble répondant à
   une liste**, imprimer (les menus : la semaine → la liste → la
   diffusion), mettre à jour une tournée — le wizard orchestre les
   opérations de l'entité (les quatre de base `create`/`read`/
   `update`/`delete`, enrichies — D546) ;
3. **Types servis** — l'entité — l'enregistrement en construction,
   dans son agrégat (D101) ;
4. **Contexte consommé** — l'enregistrement transitoire, l'origine de
   l'appel, l'utilisateur (D455) ; les droits (D196) ;
5. **Propriétés** — `title:` (D449/D465) ; **`size:` optionnel** — « sans
   valeur, ça prend l'espace disponible ; en cas d'appel depuis un
   menu, le wizard prend tout l'écran » (D549) ; surchargeable au
   nœud incluant quand il s'emboîte dans un formulaire (D548/D455,
   le plus proche l'emporte D461 ; la grammaire D533) ;
   **`breadcrumb: none | top | bottom`** — le fil d'Ariane (D549,
   défaut `top` — les étapes visibles D504 ; `none` le masque) ; `screen:`
   (D450/D532) ; **les étapes = des surfaces déclarées**
   (D231) ; **les transitions conditionnelles** — « si client
   étranger → étape TVA » (D231/D90) ; **la transaction finale**
   (D232/D101 — rien ne s'écrit avant la conclusion, la relecture
   D431 en clôture) ; **pas de brouillon** — « le mode draft s'efface
   avec la possibilité de pré-exécuter une opération » (D547 ; le
   niveau d'état déclaré D233 reste l'affaire de l'entité) ;
6. **Items** — **un `header` et un `footer` optionnels** (D548 —
   l'écho de `pages` D507 : toujours visibles autour des steps) ;
   **les étapes : `steps:`/`step:` — « un habillage de `tabs[wizard]`
   où chaque step est en fait un tab »** (D546, le couple acté) : chaque étape porte sa poignée (`title:`/`icon:` —
   le chemin D505), ses items (les sections, les feuilles — la page
   d'un formulaire), sa condition (*en proposition :* **`if:`** — la
   transition conditionnelle D231/D90, l'étape sautée si la condition
   ne tient pas), et **son opération** — « un step peut contenir une
   opération sur la validation » (D546 — *en proposition :*
   `operation: <nom>`) : **pré-exécutée au passage** (D547 — le
   chiffrage D511), **la transformation n'ayant lieu qu'à la
   validation définitive du wizard** ;
7. **Modes et déclinaisons** — **le squelette `tabs[wizard]`**
   (D504–D505) : toutes les étapes visibles, **l'avance au rythme de
   l'exploration**, « les tabs parcourus décrivent le chemin de
   traitement » — le retour libre d'un clic ; **le passage d'étape =
   un acte** (D511) ; emboîtable — « rien n'empêche un formulaire
   qui inclut un wizard dans une page » (D455) ; le circuit de
   validation multi-acteurs reste **hors wizard** — le patron
   d'assemblage états + opérations + notifications, sans moteur BPM
   (D233) ;
8. **États et interactions** — **l'état transitoire** jusqu'à la
   transaction finale (D232/D101) — **la chaîne de pré-exécutions**
   (D547) : rien ne se transforme avant la validation définitive ;
   **la confirmation validée barre le retour** — le chemin navigable
   (D505) s'arrête au dernier step confirmé (le cliquet) ;
   l'interruption emporte le transitoire (D547 — le draft effacé) ;
9. **Décisions fondatrices** — D90, D101, D196, D230–D233, D431,
   D438–D439, D449–D450, D455, D465, D504–D505, D507, D511, D525,
   D532–D533, D535, D546–D549 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/order.yml, bloc gui
wizards:
  new_order:                       # le menu : sales.order[@new_order] (D439)
    title: { fr: Nouvelle commande }
    steps:
      - step:
          title: { fr: Client }
          items: [ field[customer] ]
      - step:
          title: { fr: TVA }
          if: customer.country != "FR"   # la transition conditionnelle (D231/D90)
          items: [ field[vat_number] ]
      - step:
          title: { fr: Lignes }
          items: [ field[lines] ]
    validate: true                 # la relecture, puis la transaction finale (D232/D431)

# catering/entities/menu.yml — l'impression guidée (D546)
wizards:
  print_week:
    steps:
      - step: { title: { fr: Semaine }, items: [ field[week] ] }
      - step: { title: { fr: Menus },   items: [ field[menus] ] }
      - step:
          title: { fr: Diffusion }
          items: [ field[channel] ]
          operation: print_menus   # l'opération à la validation du step (D546)
```
