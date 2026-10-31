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

Dans le cas 5 (entrepôt), `05_entrepot/versions/beta/v1.0.0.1/stock/depot/depot.yml` :

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

Dans le cas 3 (véhicule), `03_vehicule/versions/beta/v1.0.0.0/transport/entretien/fields.yml` :

```yaml
revision:
  type: boolean
  label: Révision ?
  hint: La ligne est une révision — sinon, une intervention hors révision.
  description: >-
    Le booléen suffit, la référence à la règle n'avait pas d'intérêt ; les révisions faites restent des lignes du
    journal.
```

Les autres propriétés, sur un exemple :

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
    hint: { fr: "Audit réalisé ?" }

gui:
  lists:
    main:
      columns: [code, company_name, active, audited]
      searchable: [active, audited]   # la case sert le filtre — tri-état pour
                                      #   audited (lignes nulles), « tous » pour
                                      #   active (obligatoire) — D375–D376
      editable: [active]              # l'édition en ligne — le clic cycle (D374)
  forms:
    record:
      page:
        - section:
            title: { fr: Statut }
            items:
              - field[active]         # la forme explicite (D460) — l'ambiguïté
                                      #   champ/composant levée
              - field[audited]:
                  readonly: true      # la forme riche (D270)
                  resources:          # la ressource de chaque valeur (D1608) —
                    true:  check      #   coché = vrai, vide = faux,
                    false: empty      #   le nul distinct
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
    record:
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
   applique son défaut traduit ; **`style:`** — « la fonte,
   la taille et sa mise en forme » (D536) : le défaut au **thème
   choisi par l'utilisateur** (D752–D755 — le thème combine des
   styles du catalogue, le style porte le HTML des types + le CSS3),
   la surcharge à la cascade D461 (`style: { font: Roboto, size:
   14px, format: [bold, italic] }` — le size intérieur = la police,
   D458 départage ; D1635) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : la saisie, guidée par le
   masque s'il existe (les lignes du masque font les lignes de la zone,
   D366) ; lecture : le texte — le multi-lignes **justifié** (D447), le
   « voir plus » au-delà des `lines` ; résumé : « libellé pour
   widget » + valeur ; template / Excel : la valeur ; smartphone : le
   libellé plus petit au-dessus (D262), ou son `abbreviation:` (D265,
   D1619) — elle s'affiche aussi partout où la place manque (D1622) ; tablette et smartphone : pas
   de survol, le texte de `hint:` se lit par un clic sur une petite
   icône (?) à côté du champ, ou en texte plus petit sous la zone
   (D1618) — le composant choisit selon la place disponible (D1620) ;
8. **États et interactions** — grisée si `readonly`/droits ; le refus
   de validation affiché (D307) ; en recherche : `strict` /
   `normalized` / `similarity[x]` / `mutualizable[nom]` (D367–D368) —
   la boîte au filtrage vivant (D228) ;
9. **Décisions fondatrices** — D222, D260, D271, D366–D368, D447 ;
10. **Exemple de configuration** —

Dans le cas 5 (entrepôt), `05_entrepot/versions/beta/v1.0.0.1/stock/depot/depot.yml` :

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

Les autres propriétés, sur un exemple :

```yaml
# sales/entities/customer.yml
fields:
  name: text[80]                 # mono-ligne (sous le seuil) — text par défaut
  notes:
    type: text                   # auto → multi-lignes (D366)
    shortcut:                    # le raccourci (D464)
      lines: 4                   #   4 lignes visibles, puis…
      icon: next                 #   …l'icône (une ressource — D1625) et…
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
    record:
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
   la forme affichée (D369/D371) ; **pour `measure` et `duration`, la
   matrice de conversion visible** (D980 — « la facette de saisie doit
   permettre de visualiser la matrice et les règles de conversion ») :
   à la demande, le volet du composant montre la matrice du champ sur
   cet enregistrement — les unités connues et apportées (D978), les
   coefficients, les chemins de transitivité (D979) ; l'unité de la
   saisie se choisit parmi celles de la matrice ; une unité nouvelle se
   déclare avec son coefficient vers une connue — le volet s'ouvre par
   l'icône post-zone (l'écho de D563) et montre un tableau (D1635) ;
9. **Décisions fondatrices** — D272–D273, D370–D373, D447, D978–D980 ;
10. **Exemple de configuration** —

Dans le cas 4 (banque), `04_banque/versions/beta/v1.0.0.0/banque/ecriture/fields.yml` :

```yaml
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

Les autres propriétés, sur un exemple :

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
    record:
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
   **elle remplace le clavier natif** ;
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
9. **Décisions fondatrices** — D272, D461 ;
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
    record:
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
   de la couleur ; `colors: { from: quality.threshold, threshold:
   level, color: tint }`, D1635) ;
   **`resources:`** — l'icône selon la valeur, aux mêmes seuils que les
   couleurs (D1609, D1611) — `resources: { 0: empty, 50: half, 80:
   full }` ; les noms viennent du catalogue des ressources, le défaut
   du socle se surcharge par les settings ou au champ ;
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

Dans le cas 3 (véhicule), `03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/fields.yml` :

```yaml
taux_annuel:
  type: percentage
  label: Taux annuel
  hint: Le taux nominal du crédit — 6,187.
```

Les autres propriétés, sur un exemple :

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
    record:
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
   (D1635) ; template / Excel : la valeur canonique ;
8. **États et interactions** — grisé si `readonly`/droits ; le
   dépassement change de représentation (la ligne D391) ;
9. **Décisions fondatrices** — D359 (l'exemple fondateur), D274–D275 ;
10. **Exemple de configuration** —

```yaml
# settings.yml — l'étage version ou module : le type fondateur (D359), sous field: (D1239)
field:
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
    record:
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
    record:
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
   la saisie directe au clavier sur PC** (l'horloge au clic) ; lecture : l'heure formatée selon
   la langue ; résumé / template / Excel : la valeur canonique à la
   précision déclarée ;
8. **États et interactions** — grisée si `readonly`/droits ; le refus
   affiché (D307) ; en recherche : `strict` / **`range`** (la plage
   horaire) / `mutualizable` (D381) ;
9. **Décisions fondatrices** — D277, D381, D383 ;
10. **Exemple de configuration** —

Dans le cas 5 (entrepôt), `05_entrepot/versions/beta/v1.0.0.1/settings.yml` :

```yaml
# Les champs
field:

  # Le type time_pmi
  # Les heures de PMI : une heure lue au masque hhmmss ; une colonne en hhmm surcharge le masque au champ.
  time_pmi:
    type: time
    mask: hhmmss
```

Les autres propriétés, sur un exemple :

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
    record:
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
7. **Modes et déclinaisons** — modification : **les steppers
   [-]/[+]**, le jour d'avant et le jour d'après, au même rang que le
   calendrier — l'écho du stepper du nombre (D270, D785) ; aucun report
   de champ en post-zone (D786/D787) ; **smartphone = le plein
   écran** (la semaine, le mois ou l'agenda — tactile) ; **tablette = à
   proximité du champ** ; **PC = la saisie au clavier d'abord, le
   calendrier par l'icône** ; lecture : la
   date formatée à la langue ; template / Excel : la valeur canonique
   ISO à la granularité (D382) ;
8. **États et interactions** — grisé si `readonly`/droits ; le refus
   des bornes affiché (D307) ; en recherche : `strict` / **`range`**
   (la plage de dates — l'usage roi, D381) / `mutualizable` ;
9. **Décisions fondatrices** — D278–D280, D381–D383, D785–D787 ;
10. **Exemple de configuration** —

Dans le cas 3 (véhicule), `03_vehicule/versions/beta/v1.0.0.0/transport/consommation/fields.yml` :

```yaml
date:
  type: date
  required: true
  label: Date
```

Dans le cas 3 (véhicule), `03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/fields.yml` :

```yaml
premier_mois:
  type: date[yyyy-mm]
  label: Premier mois
  hint: Le premier mois du financement — 2016-02, 2023-10.
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
   **smartphone : la liste plein écran** ; **PC : les
   raccourcis clavier, la saisie au début de mots avec throttling** ;
   lecture : le libellé (et l'icône si déclarée) ; résumé :
   le libellé ; template / Excel : **le code ou le libellé** (D130) ;
8. **États et interactions** — grisée si `readonly`/droits ; en
   recherche : **la liste de sélection du jeu de valeurs,
   multi-sélection** (D388), `mutualizable` par le libellé (D369) ;
9. **Décisions fondatrices** — D129, D281, D283, D387–D388 ;
10. **Exemple de configuration** —

Dans le cas 3 (véhicule), `03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/fields.yml` :

```yaml
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

## `radios`

1. **Nom et famille** — `radios`, une feuille ;
2. **Rôle** — les boutons radios : le jeu de valeurs étalé sous les
   yeux, un clic pour choisir — le choix visible sans dérouler ;
3. **Types servis** — `enum` **aux petits jeux de valeurs** ; le
   booléen décliné (D281) ; **jamais un défaut — la surcharge**
   (`component: radios` — D284, D285) ; **le seuil borne la surcharge** (D468, D1612) : un
   élément de la configuration générale, à la cascade des settings ;
   au-delà, le champ se replie en `dropdown` — `field: { enum: {
   radios: 5 } }` (D1635) ;
4. **Contexte consommé** — les `values` du champ (`label`,
   `description`, `icon` — D387), le `mode`, les droits ;
5. **Propriétés** — rien de déclaré : la disposition se déduit de la
   place (**les radios s'empilent sur smartphone**) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : le clic direct, tout est
   visible ; lecture : le libellé de la valeur, sobre ; template /
   Excel : le code ou le libellé (D130) ;
8. **États et interactions** — grisés si `readonly`/droits ; **en
   recherche, les radios ne servent pas** : le composant de recherche
   de l'énuméré reste la liste multi-sélection (D388) ;
9. **Décisions fondatrices** — D129, D281, D283–D284 ;
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
    record:
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
   (une erreur d'ingestion — D1635) ; jamais un défaut — la
   surcharge (`component: icons`) ;
4. **Contexte consommé** — les `values` du champ (`icon`/`image` ←
   `resources/` D346, le `label` pour l'infobulle), le `mode`, les
   droits ;
5. **Propriétés** — **`size`** (la taille des icônes — le vocabulaire
   unique D461) ; rien d'autre : les icônes viennent des `values` ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — modification : les icônes étalées, la
   sélection marquée ; **smartphone : le choix par image prend l'écran
   et s'empile** ; lecture : l'icône de la
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
      bronze: { label: { fr: Bronze }, icon: bronze }   # ← l'identifiant d'une ressource (D1625)
      silver: { label: { fr: Argent }, icon: silver }
      gold:   { label: { fr: Or },     icon: gold }
    default: bronze
    component: icons            # la surcharge au champ — les icônes partout

gui:
  lists:
    main:
      columns: [code, company_name, category]   # l'icône en cellule
  forms:
    record:
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
   début de mots avec throttling** (le PC aux raccourcis clavier) ; smartphone : la liste plein écran ; lecture : **le titre
   de la cible + le lien vers sa fiche en lecture seule** (D215) ;
   résumé : le titre ; template : le titre ; **CSV : la clé
   fonctionnelle** (l'UUID jamais — D398) ;
8. **États et interactions** — grisé si `readonly`/droits ; **le filtre
   restreint les candidats** (D395 — `check: immutable` surveille
   ensuite) ; la sélection ne propose que les actifs (D398) ;
9. **Décisions fondatrices** — D215, D284, D395–D398, D465 ;
10. **Exemple de configuration** —

Dans le cas 4 (banque), `04_banque/versions/beta/v1.0.0.0/banque/ecriture/fields.yml` :

```yaml
budget:
  type: banque.budget
  searchable: mutualizable[recherche]
  label: { fr: Budget, en: Budget, es: Presupuesto }
  description:
    fr: Le référentiel dynamique — la création directe au picker.
    en: The dynamic reference list — direct creation from the picker.
    es: El referencial dinámico — la creación directa desde el selector.
```

Les autres propriétés, sur un exemple :

```yaml
# hr/entities/employment.yml
fields:
  responsible:
    type: hr.employee              # la référence (D396) — record-picker par défaut
    filter: company = me.company   # les candidats restreints (D395)
    check: immutable

gui:
  forms:
    record:
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

Dans le cas 3 (véhicule), `03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/fields.yml` :

```yaml
photo:
  type: image[512x512]
  label: Photo
  hint: Le visage du véhicule — la vignette des listes et de la carte.
  description: Le visage porté par l'image ; la vignette est automatique.
```

Les autres propriétés, sur un exemple :

```yaml
# hr/entities/employee.yml
fields:
  photo:
    type: image[512x512]           # la boîte max, la vignette auto (D389)
    placeholder: avatar            # l'icône de fond (D390), une ressource (D1625)

gui:
  forms:
    record:
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

Dans le cas 5 (entrepôt), `05_entrepot/versions/beta/v1.0.0.1/technique/article/vie.yml` :

```yaml
plans:
  type: list of file
  extensions: [pdf, dwg, dxf, step]
  label: Plans
  hint: Les plans de l'article, lus dans le répertoire des plans.
  description: La liste est remplie par le connecteur des plans, en complément de la base d'origine.
```

Les autres propriétés, sur un exemple :

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
    record:
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
   document à générer (l'écho de `field[<nom>]` D460 ; viewer, son
   composant naturel — D1635) ;
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
   (D257), le carrousel rendu en planche (D1635) ; **pas de
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
    placeholder: avatar            # l'icône de fond (D390), une ressource (D1625)
  contract: { type: file, extensions: [pdf] }

gui:
  forms:
    record:
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
    record:
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
    record:
      page:
        - field[handbook]:
            component: viewer[carousel]  # le défilement des pages
            interval: 10s                # la présentation, le mode opératoire

# sales/entities/order.yml — le document généré, regardé (D483)
gui:
  templates:
    invoice: …                           # le patron du document (Q55)
  forms:
    record:
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
   droit** ; `lines: true | false`, défaut `false` — D1635) ; **le tracé de la route = un hook** (« les abonnements
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

Dans le cas 5 (entrepôt), `05_entrepot/versions/beta/v1.0.0.1/commande/commande_vente/fields.yml` :

```yaml
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

Les autres propriétés, sur un exemple :

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
    record:
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
   le nombre de lignes du résumé au survol en cellule (D393 — la
   forme `preview: 3`, D1635) ;
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
        - discussion: { preview: 3 }  # l'icône ; au survol, 3 lignes (D393, D1635)
  forms:
    record:
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

Dans le cas 5 (entrepôt), `05_entrepot/versions/beta/v1.0.0.1/technique/article/classification.yml` :

```yaml
matieres:
  type: list of text[..6]
  label: Codes matière
  hint: Les matières de l'article — jusqu'à neuf chez l'ERP.
```

Les autres propriétés, sur un exemple :

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
    record:
      page:
        - field[keywords]          # l'éditeur : ajouter, retirer, réordonner
        - field[languages]         # les cases ou les tags (D296)
```

## `paragraph`

1. **Nom et famille** — `paragraph` (D488 — le nom validé), une
   feuille — **le texte fixe** : « mettre du texte pour indiquer les
   informations légales de l'entreprise » ;
2. **Rôle** — le texte venu de la configuration, affiché tel quel —
   **aucun champ derrière** : la mention, l'explication,
   l'avertissement — dont **la mention d'information RGPD**, le texte
   du socle `rgpd.notice` généré depuis le registre, que le concepteur
   ancre à son choix (D1335) ; **et le gabarit** — « le paragraph peut être un
   gabarit, utilisable dans le cas d'une lettre » (D559,
   l'étoffement Q55) : les variables de l'enregistrement dans le
   texte (« Cher {{customer}}, votre commande {{number}}… ») — le
   publipostage ;
3. **Types servis** — aucun : le contenu est déclaré, par langue
   (D465) ou par référence au dictionnaire du module (`label:` —
   D440, D1236) ;
4. **Contexte consommé** — la langue de l'utilisateur (le contexte —
   D455) ; les droits et la confidentialité ;
5. **Propriétés** — `label:` — les libellés par langue (D465), ou la
   référence au dictionnaire (D440) ; le socle du vocabulaire (D461 :
   style…) ; **le mode publipostage : mustache + markdown**
   (D559–D562) — **mustache** : les variables `{{champ}}` au format
   de la langue du document (D369), les chemins
   (`{{customer.address.city}}` — D71), **les sections**
   `{{#overdue}}…{{/overdue}}` (l'itération des collections — la puce
   markdown dans la section fait la liste D561) ; **markdown** : les
   titres (`#`…`####` — D250), le gras/l'italique, les puces et les
   indices, les tableaux ; **les limites** : aucun composant dans le
   texte — pas de liste-composant, pas d'image (`![…]` exclu —
   l'image reste `picture`) ; **`if:`** — l'alinéa conditionnel à
   l'expression (D90 — mustache est sans logique) ; le champ texte de
   l'utilisateur reste nu (D261) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — au formulaire : le paragraphe en
   place ; **template** : le texte du gabarit — les mentions légales
   d'une facture ; jamais en colonne (aucun champ) ; *la fiche sera
   étoffée au point gabarit / génération de documents (Q55)* ;
8. **États et interactions** — la visibilité par les droits ; rien
   d'autre — le texte ne se clique pas ;
9. **Décisions fondatrices** — D71, D90, D250, D261, D369, D440,
   D455, D461, D465, D488, D536, D559–D562 ;
10. **Exemple de configuration** —

Dans le cas 3 (véhicule), `03_vehicule/versions/beta/v1.0.0.0/transport/revision/gui.yml` :

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

Les autres propriétés, sur un exemple :

```yaml
gui:
  forms:
    record:
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
5. **Propriétés** — l'image, par l'identifiant d'une ressource
   (D1625) — la forme courte `picture: logo`, ou `resource:` en clair
   (D1626) ; le couple `size:` /
   `dimension:` (D484) — la ressource porte ses dimensions par format
   d'écran, et le `size:` du nœud la surcharge (D1627) ; sans `size:`,
   la taille que le socle donne au composant ; `dimension:` reste au
   nœud (D1629) ; le socle du
   vocabulaire (D461) ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — au formulaire : l'image en place ;
   **template** : le logo du gabarit — l'entête de la facture ; jamais
   en colonne (aucun champ) ;
8. **États et interactions** — la visibilité par les droits ; le
   fichier manquant = une erreur d'ingestion (D330), jamais un
   placeholder ;
9. **Décisions fondatrices** — D439, D455, D461, D484, D488 ;
10. **Exemple de configuration** —

```yaml
gui:
  forms:
    record:
      header:
        - picture: logo            # la forme courte — l'identifiant d'une ressource (D1625)
        - picture:
            resource: banner       # la forme en clair (D1626)
            size: 120px            # à l'affichage (D484), la surcharge de la ressource (D1627)
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
   nommées) et le code hexadécimal saisissable ; si le champ porte des
   `values:`, la palette s'y restreint — l'écho de dropdown/icons
   (D1636) ; smartphone : le plein écran (l'esprit D293) ;
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

## `qrcode` / `barcode`

1. **Nom et famille** — `qrcode` et `barcode`, deux feuilles
   jumelles — **les composants de sortie** (D300, clôt Q56) ; une
   fiche commune (D542) ;
2. **Rôle** — **« ils rendent la valeur d'un champ »** (D300) — la
   valeur encodée, lisible à la machine : l'étiquette, le document,
   l'écran ;
3. **Types servis** — **le texte à la facette `barcode:`** (D988 — la
   valeur est un texte, la facette dit ce qu'il encode et le valide ;
   le composant en est le défaut en lecture, la nature venant de la
   facette) ; et les champs à valeur textuelle sans facette — le texte,
   le compteur, l'`uuid`, la référence… : **la conversion en texte du
   type** (D369) fait la valeur encodée ; en surcharge
   (`component: qrcode`) ;
4. **Contexte consommé** — le champ, sa valeur convertie (D369), les
   droits ;
5. **Propriétés** — le socle (D461) ; **`size:` aux deux régimes**
   (D543) : le qrcode — **« la taille unique pour les côtés »**
   (`size: 120px`, le carré — jamais deux valeurs) ; le code-barres —
   **« largeur × hauteur »** (`size: 200px 60px` — la grammaire
   D533) ; **la saisie peut porter sa propre taille** (D544, D1638 —
   `size: { input: 30, display: 120px }`, la forme courte valant
   l'affichage seul) ; **`labels:`** — « la valeur de
   la référence sous le code-barres » (D545, D1638 — `labels: true`,
   la valeur au format du champ — l'écho D516 ; défaut `false`) ; **le format du code-barres** : **de la facette
   quand le champ en porte une** (D988 — `barcode: ean13` au champ, le
   composant suit) ; **au crochet pour un champ texte sans facette**
   rendu en code-barres (D1638 — `component: barcode[code128]`, le
   défaut `code128`) ;
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
   D516, D533, D542–D545, D988 ;
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
        - field[ean]:              # un texte à la facette barcode: ean13 (D988) : la nature vient de la facette
            size: 200px 60px       # largeur × hauteur (D543)
            labels: true           # la valeur sous les barres (D545)
        - field[sku]:
            component: barcode[code128]   # un champ texte rendu en code-barres — le format au crochet (D1638)
```
