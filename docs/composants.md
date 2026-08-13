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
  saut de page) · `section` (le regroupement potentiellement nommé) ·
  `grid` · `tabs`/`tab` ;
- **Les feuilles** : `text` · `number` · `calculator` ·
  `gauge`/`fuel`/`slider` · `clock` · `calendar` · `checkbox` ·
  `toggle` · `dropdown`/`radios`/`icons` · `picker.record` ·
  `picker.image` · `picker.file` · `viewer` · `carousel` · `map` ·
  `thread` · `list` (l'éditeur du type liste) · `password` (la saisie
  masquée, D463) — **le composant par défaut d'un type porte le nom du
  type** (D458) ;
- **Les graphiques** : `chart` (courbe, barres, secteurs, combiné) ·
  `kpi` · `pivot` — famille ouverte ;
- **Les actes** : le bouton, l'icône, le passage d'étape — l'utilisateur
  acte une opération (D432/D444/D456).

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
      body:
        - section:
            label: { fr: Statut }
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
      body:
        - section:
            label: { fr: Fonctionnement }
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
   applique son défaut traduit (thème E) ;
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
      body:
        - section:
            label: { fr: Identité }
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
      body:
        - section:
            label: { fr: Mesures }
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
      body:
        - section:
            label: { fr: Ligne }
            items:
              - field[quantity]:
                  component: calculator   # ou au nœud seul — ce formulaire (D461)
              - field[discount]
```

## `gauge`

1. **Nom et famille** — `gauge`, une feuille — le satellite des
   numériques bornés ;
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
5. **Propriétés** — le remplissage se déduit des bornes ; **`colors:`**
   (D467) — le dégradé deux couleurs (`{ min: red, max: green }` — le
   défaut, du rouge au vert) **ou les seuils** (`{ 0: red, 50: orange,
   80: green }` — la couleur à partir du seuil) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — **la lecture d'abord** (la valeur en un
   regard — listes, résumés, widgets) ; en modification, le glissé
   possible — mais `slider` est le composant de saisie dédié (D275) ;
   template / Excel : la valeur canonique ; identique aux trois
   écrans ;
8. **États et interactions** — **le dépassement** : le `percentage`
   hors cadre change de représentation (D391) ; grisée si
   `readonly`/droits ;
9. **Décisions fondatrices** — D274–D275, D391 ;
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
      body:
        - section:
            label: { fr: Activité }
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
      body:
        - section:
            label: { fr: Suivi }
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
      body:
        - section:
            label: { fr: Charge }
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
      body:
        - section:
            label: { fr: Horaires }
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
      body:
        - section:
            label: { fr: Échéances }
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
      body:
        - section:
            label: { fr: Classification }
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
      body:
        - section:
            label: { fr: Priorité }
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
      body:
        - section:
            label: { fr: Classification }
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
      body:
        - section:
            label: { fr: Encadrement }
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
      body:
        - section:
            label: { fr: Profil }
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
      body:
        - section:
            label: { fr: Documents }
            items:
              - field[invoice]:
                  selection: 1     # un seul fichier (D474)
```

## `viewer`

1. **Nom et famille** — `viewer`, une feuille — « image-viewer et
   carousel sont un même objet : viewer » (D475) ;
2. **Rôle** — la visionneuse : **le fichier regardé** — la vignette en
   place, le plein cadre au clic ; **tout type visualisable** : l'image
   n'est « qu'un type parmi tant d'autres » — PDF, Word, Excel… ;
3. **Types servis** — `image` et `thumbnail` **en lecture** (le défaut
   de leur mode lecture — D286/D293) ; `file` dont le format est
   visualisable (PDF, Word, Excel… — la vignette de fichier sinon) ;
4. **Contexte consommé** — le champ (les dimensions du crochet, la
   vignette auto — D389), le `placeholder` (D390), les droits ;
5. **Propriétés** — `dimension:` (la visionneuse — D454/D469) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — lecture : **la vignette, la visionneuse
   au clic — plein écran sur smartphone, pourcentage sur tablette, zone
   définie sur PC** (D293) ; cellule et widget : la vignette (D286) ;
   template : l'image rendue (D257), le document lié ; **pas de
   recadrage dans le socle** (le hook D263) ;
8. **États et interactions** — le `placeholder` tant que le fichier
   manque (D390) ; le zoom et la fermeture au geste sur tactile ;
9. **Décisions fondatrices** — D257, D286, D293, D389–D390, D475 ;
10. **Exemple de configuration** —

```yaml
# hr/entities/employee.yml
fields:
  photo:
    type: image[512x512]           # la boîte max, la vignette auto (D389)
    placeholder: avatar.png        # l'icône de fond (D390)
  contract: { type: file, extensions: [pdf] }

gui:
  lists:
    main:
      columns: [name, photo]       # la vignette en cellule (D286)
  forms:
    default:
      body:
        - section:
            label: { fr: Profil }
            items:
              - field[photo]:
                  dimension: 60%   # la visionneuse au clic (D293)
              - field[contract]    # le PDF visualisé en place (D475)
```

## `carousel`

1. **Nom et famille** — `carousel`, une feuille — **le `viewer` des
   collections** (D475) ;
2. **Rôle** — le carrousel : « une liste ou une association faisant
   référence à des images et/ou des vignettes de fichiers » — la
   succession qui défile ;
3. **Types servis** — les collections d'images : `list of image`, une
   association ou une liste d'entités **au visage** (`image:` — D386),
   une liste de fichiers (les vignettes) ;
4. **Contexte consommé** — la collection (le lien — D470), les visages
   des cibles, les droits ;
5. **Propriétés** — **le défilement** : « à intervalle régulier, sur la
   pression d'une touche avant/après » — `interval:` (*en proposition —
   l'unité seconde s'ajoutant au vocabulaire des durées D434 :
   `interval: 5s` ; absent = manuel seul*) ; `dimension:` (D469) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — lecture : le défilement automatique
   (l'intervalle) et manuel (avant/après — la touche, le geste
   tactile) ; le clic ouvre la visionneuse (`viewer`) ; template : la
   première image ou la planche (*en proposition*) ;
8. **États et interactions** — les commandes avant/après, la pause au
   survol ; le `placeholder` si la collection est vide ;
9. **Décisions fondatrices** — D386, D456, D470, D475 ;
10. **Exemple de configuration** —

```yaml
# catalog/entities/product.yml
fields:
  gallery:
    type: list of image            # la collection d'images (D362/D385)

gui:
  forms:
    default:
      body:
        - section:
            label: { fr: Galerie }
            items:
              - field[gallery]:
                  component: carousel
                  interval: 5s     # le défilement automatique (proposition)
```


