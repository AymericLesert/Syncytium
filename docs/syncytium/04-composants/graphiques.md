# Les graphiques

## `chart.line`

1. **Nom et famille** — `chart.line`, un graphique de la famille
   pointée (D512) — la courbe ;
2. **Rôle** — l'évolution d'un agrégat le long d'un axe : la tendance
   d'un regard ;
3. **Types servis** — aucun champ : **le graphique est une déclaration
   autonome réutilisable** (D243) — **son assise : une entité, une
   liste nommée, ou un champ de type `list of` / `association with`**
   (D517/D539 — le champ-collection, `on: <champ>` (D1640) : le
   graphique des éléments liés à l'enregistrement du contexte), **les axes faisant référence aux
   champs de l'assise** (D517) ;
4. **Contexte consommé** — **X découpé par valeurs, par plages ou par
   temporalité** (D240) ; **Y = un agrégat (D158) filtré sur X** ; la
   confidentialité héritée de l'entité, surchargeable (D247) ; les
   droits ;
5. **Propriétés** — la déclaration (les noms — D1637) :
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
   d'axe — l'écho D494 ; `scale: linear` défaut `| log` — D1640),
   **`display: graph | table | both`** — le graphique, le tableau des
   valeurs, ou les deux (D521 — l'écho D244 ; défaut `graph` ; D1640),
   **`colors:`** (la mécanique D467 — la couleur par série, le
   dégradé), **`labels:`** (D516) — `true` : la valeur au format du
   champ ; **le gabarit** pour personnaliser (la collision avec le
   dictionnaire D440 notée — le contexte départage, D458) ; le visage
   au nuage (D386) ; `y:` accepte une liste — plusieurs séries sur le
   même axe ; les deux axes restent à `chart.combo` (D239, D1637) ;
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

Dans le cas 4 (banque), `04_banque/versions/beta/v1.0.0.0/banque/ecriture/gui.yml` :

```yaml
# Les graphiques
charts:

  # L'évolution des dépenses par budget
  # Les deux filtres du patron des listes ; le mois en abscisse, le montant cumulé du mois en ordonnée.
  evolution_budget:
    title:
      fr: L'évolution des dépenses par budget
      en: Spending over time by budget
      es: La evolución de los gastos por presupuesto
    searchable:
      - budget
      - date_operation
    x: date_operation[month]
    y: sum(montant_euro)
```

Les autres propriétés, sur un exemple :

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
   `title:` ; **les écarts propres** (D1637) :
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

Dans le cas 5 (entrepôt), `05_entrepot/versions/beta/v1.0.0.1/stock/mouvement/mouvement.yml` :

```yaml
# L'interface
# Les graphiques du mouvement pour le tableau de bord du module : les entrées et les sorties par mois, la matrice de
# contrôle en croisé.
gui:
  charts:

    # Les entrées et les sorties par mois
    # Deux séries sur la temporalité du mois, les douze derniers mois.
    par_mois:
      component: chart.bars
      x: date[month]
      y: [ sum(quantite if sens = "entree"), sum(quantite if sens = "sortie") ]
      filter: date >= context.today - 12m
      title: Entrées et sorties par mois
```

Les autres propriétés, sur un exemple :

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
    stacked: true                # les séries empilées (D1637)
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
   `chart.pie[donut]`, D478, D1640) ; **`thickness:`** — l'épaisseur de
   l'anneau et de l'arc (D520 — le pourcentage du rayon, D1637) ;
   **les angles de `quarter`** — le départ et la fin, au crochet aux
   bornes (D1637) : `quarter[-90..90]` (0° à
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
   D247, les droits) ; **le visage de l'enregistrement** (D386 —
   le gabarit `{champ}` des valeurs ; l'interpolation `${…}` de
   configuration possible aussi, D802) ;
5. **Propriétés** — **le socle commun** (D515–D518, D521 — `display:`
   compris) ; **les écarts propres** (D522–D523) :
   **`threshold:`** dans la forme riche de l'axe — « l'axe définit
   min, max et threshold » : la liste croissante des seuils, les
   bandes ; **`zones:`** — la zone **s'adresse dans la matrice
   créée** : `zone: [1,1]` + `title:` (+ `color:`) — plus aucune
   borne répétée (D523 ; la convention, D1637 : `[colonne, ligne]`
   depuis l'origine des axes, `[1,1]` en bas à gauche) : le MoSCoW à deux critères, l'effort/bénéfice ;
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
   `display:` compris) ; **les écarts propres** (D1637) : `y:` en
   liste de séries —
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
   (l'écho de `y:`, sans axe — D1637), `filter:` (D90),
   `title:` (D493), `labels:` — le gabarit du format (D516,
   `{value}`) ; **`colors:` par seuils** — le chiffre qui change de
   couleur (la mécanique D467, la table d'entité D495 comprise) ;
   **`resources:` par seuils** — « associer éventuellement une icône :
   cas d'un feu tricolore » (D526 — la mécanique D467 dupliquée ;
   l'écriture de la jauge, une ressource par seuil, D1609, D1611,
   D1640 ; la liaison `icon:` à la table D495) ; **`layout:`** —
   « l'organisation se découpe en 4 » (D527) : la position du label —
   `top` (défaut) `| left | bottom | right` (les bords D525),
   **l'icône au bord opposé** (D1640 ; le `layout:` des sections a
   d'autres valeurs, le contexte départage — D458) ; `drill:`
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

Dans le cas 5 (entrepôt), `05_entrepot/versions/beta/v1.0.0.1/stock/niveau/niveau.yml` :

```yaml
# L'interface
# Les indicateurs du tableau de bord du module : des kpi, dont la valeur est un agrégat, sans axe.
gui:
  charts:

    # La valeur du stock
    # Restreinte comme la valeur des niveaux.
    valeur_stock:
      component: kpi
      value: sum(valeur)
      title: Valeur du stock
      labels: "{value}"

    # Les niveaux sous le minimum
    # Le compte sur la condition seule ; les couleurs à seuils.
    sous_minimum:
      component: kpi
      value: count(sous_minimum = true)
      title: Niveaux sous le minimum
      colors: { 0: green, 1: orange, 20: red }
```

Les autres propriétés, sur un exemple :

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
    resources: { 0: red_light, 50000: orange_light, 100000: green_light }
                                 # le feu tricolore, une ressource par seuil (D526, D1640)
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
5. **Propriétés** — (les noms — D1637) : **`rows:`** — le ou
   les champs en ligne (la liste = le groupement hiérarchique,
   `[seller, customer]` : commercial › client) ; **`columns:`** — le
   ou les champs en colonne (le mot des listes D442) ; **`value:`** —
   la formule : un agrégat (D158) **partitionné par la cellule** ;
   `filter:` (D90) ; **`sort:`** — « le tri peut s'appuyer
   sur les rows, les columns ou la value » (D528–D529) : la clé = un
   champ des lignes, un champ des colonnes, ou `value` — les signes
   et cascades D442 (`sort: { seller: -value, date: + }`) ; chaque
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
   groupements ; le clic sur une cellule ouvre la liste des éléments
   de l'intersection — l'écho D242/D519 (D1637) ; la
   confidentialité masque ;
9. **Décisions fondatrices** — D134, D158, D240, D243, D246–D249,
   D441, D512, D517–D518, D528–D529 ;
10. **Exemple de configuration** —

Dans le cas 5 (entrepôt), `05_entrepot/versions/beta/v1.0.0.1/stock/mouvement/mouvement.yml` :

```yaml
# L'interface
# Les graphiques du mouvement pour le tableau de bord du module : les entrées et les sorties par mois, la matrice de
# contrôle en croisé.
gui:
  charts:

    # Le contrôle des stocks par les mouvements
    # Le pivot : la hiérarchie pliable dépôt puis emplacement en lignes, les articles en colonnes ; la règle de
    # contrôle à la cellule, sur le dernier mois.
    controle:
      component: pivot
      rows: [depot, emplacement]
      columns: [article]
      value: 'sum(sens.select(entree: quantite, sortie: -quantite))'
      filter: date >= context.today - 1m
      title: Contrôle des stocks par les mouvements (le mois)
```

Les autres propriétés, sur un exemple :

```yaml
# sales/entities/order.yml, bloc gui — l'exemple fondateur de D246
charts:
  revenue_matrix:
    component: pivot
    rows: [seller, customer]     # la hiérarchie pliable — commercial › client
    columns:                     # la temporalité (D240)
      - date[month]
    value: sum(total)            # l'agrégat partitionné par la cellule (D158)
    sort: -value                 # les plus gros CA d'abord (D528, D1640)
    filter: state = "invoiced"
    title: { fr: CA par commercial et par mois }
```
