# Les graphiques

> **Un graphique** est le composant qui résume des données en une image :
> la courbe d'une évolution, les barres d'une comparaison, le chiffre clé
> d'un indicateur, le tableau croisé d'une analyse. Il se déclare une fois
> et se réutilise dans un widget, un formulaire ou un tableau de bord
> ([glossaire](../../glossaire.md)).

Un graphique n'est pas la représentation d'un champ. Il se déclare dans
le bloc `charts:` de l'interface d'une entité et se réutilise (D243). Ce
fichier compte sept fiches :

- les cinq graphiques de la famille pointée `chart.*` (D512) :
  `chart.line`, `chart.bars`, `chart.pie`, `chart.scatter` et
  `chart.combo` ;
- `kpi`, le chiffre clé ;
- `pivot`, le tableau croisé.

Un hook étend la famille, `chart.radar` par exemple (D239). La jauge
n'est pas un graphique : c'est la feuille `gauge`
([les feuilles](02-feuilles.md)).

Les cinq `chart.*` partagent les mêmes propriétés, les mêmes modes et les
mêmes interactions. Ce socle est décrit une fois, ci-dessous. Chaque
fiche y renvoie et ne détaille que ses écarts. Le `kpi` et le `pivot` en
reprennent une partie ; leur fiche dit laquelle.

## Le sommaire

- [Le socle commun](#le-socle-commun)
  - [La déclaration autonome](#la-déclaration-autonome)
  - [L'assise, `on:`](#lassise-on)
  - [Les axes, `x:` et `y:`](#les-axes-x-et-y)
  - [Le périmètre et le drill-down](#le-périmètre-et-le-drill-down)
  - [L'affichage](#laffichage)
  - [Le contexte consommé](#le-contexte-consommé)
  - [Les modes et déclinaisons](#les-modes-et-déclinaisons)
  - [Les états et interactions](#les-états-et-interactions)
  - [La dépréciation d'un graphique](#la-dépréciation-dun-graphique)
- [`chart.line`](#chartline)
- [`chart.bars`](#chartbars)
- [`chart.pie`](#chartpie)
- [`chart.scatter`](#chartscatter)
- [`chart.combo`](#chartcombo)
- [`kpi`](#kpi)
- [`pivot`](#pivot)

## Le socle commun

### La déclaration autonome

Un graphique ne sert aucun champ. C'est une déclaration autonome, que
plusieurs surfaces réutilisent (D243). Il repose sur une assise et sur
des axes. L'assise est l'ensemble des enregistrements que le graphique
résume. Les axes font référence aux champs de cette assise (D517).

Un graphique déclare toujours son composant, `component: chart.line` par
exemple. Sans lui, la déclaration est une erreur d'ingestion (D1653).

### L'assise, `on:`

La propriété `on:` nomme l'assise, à l'adresse (D439, D517). Elle accepte
trois formes :

- une entité : `on: sales.order` ;
- une liste nommée, par le crochet de l'adresse : `on: sales.order[invoiced]`.
  Le périmètre de la liste est hérité ;
- un champ de type `list of` ou `association with`, le champ-collection :
  `on: <champ>` (D539, D1640). Le graphique porte alors sur les éléments
  liés à l'enregistrement du contexte.

Quand `on:` est absent, l'assise est l'entité qui porte la déclaration
(D518).

### Les axes, `x:` et `y:`

L'axe `x:` découpe un champ de l'assise (D240). Le découpage se fait :

- par valeurs : `x: seller`, une catégorie par commercial ;
- par plages, pour un champ numérique ;
- par temporalité, au crochet : `x: date[month]`, un point par mois.

L'axe `y:` est un agrégat (D158), écrit dans le langage d'expression
(D90) : `y: sum(total)`. Pour chaque valeur de X, Syncytium calcule
l'agrégat sur les enregistrements de cette valeur. `y:` accepte une
liste : plusieurs séries sur le même axe. Les deux axes Y restent le
propre de `chart.combo` (D239, D1637).

Chaque axe accepte une forme riche (D515), qui règle son début, sa fin et
son échelle (D494) :

```yaml
# L'ordonnée : la marge moyenne, de 0 à 100, sur une échelle linéaire
y: { value: avg(margin), min: 0, max: 100, scale: linear }
```

`scale:` vaut `linear` par défaut, ou `log` (D1640).

### Le périmètre et le drill-down

- `filter:` restreint l'assise, par une condition du langage (D90) :
  `filter: state = "invoiced"`. C'est le périmètre fixe du concepteur.
- `searchable:` ouvre une zone de recherche que l'utilisateur remplit ;
  le graphique se met à jour selon son choix (D798, D1654). Les règles
  de la liste s'appliquent : seuls les champs qui portent `searchable:`
  se filtrent, et un critère nommé sans `searchable:` est une erreur
  d'ingestion (D1596–D1598). La banque filtre ainsi son évolution des
  dépenses par budget et par plage de dates.
- `drill:` déclare le drill-down : la liste nommée qui s'ouvre au clic,
  avec le filtre imposé par la valeur cliquée. Sans `drill:`, « par
  défaut, pas de drill-down » (D242).
- `title:` est le titre du graphique, par langue (D493).

### L'affichage

Les réglages d'affichage (D515) sont :

- `display:` — `graph`, le graphique seul, par défaut ; `table`, le
  tableau des valeurs ; `both`, les deux (D244, D521, D1640) ;
- `colors:` — la couleur par série, ou un dégradé, selon la mécanique
  commune des couleurs (D467) ;
- `labels:` — `true` affiche la valeur au format du champ ; un gabarit la
  personnalise (D516). Le dictionnaire du module, lui, s'écrit `label:`
  (D440, D1236) ; le contexte départage (D458). Sur le nuage de points, le label
  est le visage de l'enregistrement (D386).

### Le contexte consommé

Un graphique lit la confidentialité de son assise. Elle est héritée de
l'entité et surchargeable sur le graphique (D247). Il lit aussi les
droits de l'utilisateur.

### Les modes et déclinaisons

Un graphique est réutilisable dans trois surfaces :

- le widget ; associé à une entité, il rejoint le module fonctionnel
  (D247) ;
- le formulaire ;
- le tableau de bord, avec son rafraîchissement : statique, en temps
  réel ou à une fréquence (D249).

Dans un template, le graphique est une image (D257). Sur un écran
tactile, l'élément touché montre sa valeur.

### Les états et interactions

- **Le drill-down au clic.** Le graphique « enrichit le filtre de la
  liste pour imposer » les éléments de la valeur cliquée (D242).
- **Le clic sur une vignette** permet de « voir toutes les valeurs
  utilisées pour le calcul » (D516). Si l'agrégat dépend d'une liste ou
  d'une association, le détail des contributions s'ouvre.
- **La confidentialité masque** ce que l'utilisateur ne peut pas voir.

### La dépréciation d'un graphique

> **La dépréciation** d'un élément annonce son retrait. L'élément vit
> encore ; le bloc `deprecation:` dit ce qui le remplace, ou son abandon.
> Elle ne se confond pas avec la dépréciation d'une version, qui est
> effective ([glossaire](../../glossaire.md)).

Un graphique peut être appelé à disparaître : un autre le remplace, ou
l'indicateur ne se suit plus. La configuration ne le retire pas d'un
coup. Elle l'annonce d'abord, sur le graphique lui-même, sous `charts:`,
dans la version en service (D650, D1873). Le graphique se dessine comme
avant.

**La forme courte.** Le bloc nomme le remplaçant, rien de plus (D1873). Le
remplaçant est un autre graphique, nommé par son adresse (D1875).
L'exemple est construit, aucun cas n'en porte. Dans la banque, l'évolution
des dépenses par budget céderait à un graphique des dépenses par mois :

```yaml
# Les graphiques de l'écriture
charts:

  # L'évolution des dépenses par budget : le graphique des dépenses par mois la remplace
  evolution_budget:
    component: chart.line
    deprecation: chart[depenses_par_mois]
```

**La forme longue.** Elle porte deux clés (D1871) :

- **`documentation:`**, le texte qui explique la dépréciation. C'est un
  texte de la version : à plusieurs langues, il les porte toutes
  (D1474) ;
- **`to:`**, le graphique remplaçant.

Sans `to:`, le bloc dit l'abandon, et `documentation:` est exigée. Une
dépréciation dit toujours le remplacement ou l'abandon ; l'ingestion le
vérifie (D650). Le bloc n'a pas de `mode:` : sa présence dit l'intention
(D1872).

La banque a trois langues : son texte les porte toutes.

```yaml
# Les graphiques de l'écriture
charts:

  # L'évolution des dépenses par budget : abandonnée, sans remplaçant
  evolution_budget:
    component: chart.line
    deprecation:
      documentation:
        fr: Le tableau de bord du budget suffit, ce graphique n'est plus tenu.
        en: The budget dashboard is enough, this chart is no longer maintained.
        es: El cuadro de mando del presupuesto basta, este gráfico ya no se mantiene.
```

**Ce que la dépréciation d'un graphique touche.** Tout ce qui le montre :

- les tableaux de bord et les formulaires qui le posent ;
- les résumés qui l'affichent ;
- la liste que son drill-down ouvre.

Cette liste est *en proposition*.

**De l'intention à la suppression.** Une dépréciation se joue en trois
temps :

1. **L'intention.** Le bloc est écrit. Rien ne change : le graphique se
   dessine et se lit (D650, D1872).
2. **La validation.** Une beta complète la dépréciation : en retirant le
   graphique, elle la valide (D1870, D1875).
3. **La suppression.** Elle vient avec une version : le graphique quitte
   la description (D650).

Le mot `deprecated` nomme autre chose : le statut d'une version, déposée
dans `versions/deprecated/`. Là, la dépréciation est effective (D1869).
Sur un graphique, le bloc s'écrit toujours `deprecation:` (D1871).

## `chart.line`

**Nom et famille.** `chart.line`, la courbe. Un graphique de la famille
pointée (D512).

**Rôle.** L'évolution d'un agrégat le long d'un axe : la tendance d'un
regard.

**Types servis.** Aucun champ. Le graphique est une déclaration autonome
réutilisable (D243). Son assise est une entité, une liste nommée ou un
champ-collection, et ses axes font référence aux champs de l'assise
(D517, D518, D539, D1640) : [le socle commun](#le-socle-commun).

**Contexte consommé.** Le socle commun : X découpé par valeurs, par
plages ou par temporalité (D240) ; Y un agrégat filtré sur X (D158) ; la
confidentialité héritée et surchargeable (D247) ; les droits.

**Propriétés.** Celles du socle commun, aux noms acquis (D1637) :

- `on:` (D439, D517, D518) ;
- `x:` et `y:`, nus ou en forme riche (D240, D158, D515, D494, D1640) ;
  `y:` accepte une liste de séries ;
- `filter:` (D90) et `drill:` (D242) ;
- `title:` (D493) ;
- `display:` (D521, D244), `colors:` (D467) et `labels:` (D516, D440,
  D458, D386).

Les deux axes Y restent à `chart.combo` (D239, D1637).

**Items.** Aucun.

**Modes et déclinaisons.** Le socle commun : le widget (D247), le
formulaire, le tableau de bord (D249), l'image dans un template (D257).
Sur un écran tactile, le point touché montre sa valeur.

**États et interactions.** Le socle commun : le drill-down au clic
(D242), les valeurs du calcul au clic sur une vignette (D516), la
confidentialité qui masque.

**Décisions fondatrices.** D90, D158, D239–D244, D247–D249, D439, D512,
D515–D518, D521, D539.

**Exemple de configuration.** Dans le cas 4 (banque),
`04_banque/versions/beta/v1.0.0.0/banque/ecriture/gui.yml` :

```yaml
# Les graphiques
charts:

  # L'évolution des dépenses par budget
  # Les deux filtres du patron des listes ; le mois en abscisse, le montant cumulé du mois en ordonnée.
  evolution_budget:
    component: chart.line
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

Les autres propriétés, sur un exemple. Le premier graphique n'a pas de
`on:` : son assise est l'entité porteuse (D518). Le second prend pour
assise la liste nommée `invoiced` et hérite de son périmètre (D517) ; son
axe Y est en forme riche (D515), ses couleurs et ses labels sont réglés
(D467, D516).

```yaml
# Les graphiques de l'entité order, dans son bloc gui
charts:

  # Le chiffre d'affaires par mois : l'assise est l'entité porteuse
  revenue_by_month:
    component: chart.line
    title: { fr: Chiffre d'affaires }
    # L'abscisse : la date, découpée par mois
    x: date[month]
    # L'ordonnée : la somme des totaux
    y: sum(total)
    # Le périmètre : les commandes facturées
    filter: state = "invoiced"
    # Le drill-down : la liste nommée, au filtre imposé
    drill: invoiced

  # La marge par mois : l'assise est la liste nommée des commandes facturées
  margin_by_month:
    component: chart.line
    on: sales.order[invoiced]
    x: date[month]
    # L'ordonnée en forme riche : la marge moyenne, de 0 à 100, en linéaire
    y: { value: avg(margin), min: 0, max: 100, scale: linear }
    # La couleur de la série
    colors: { serie: blue }
    # La valeur affichée au format du champ
    labels: true
```

## `chart.bars`

**Nom et famille.** `chart.bars`, les barres. Un graphique de la famille
pointée (D512).

**Rôle.** La comparaison des quantités par catégorie : la barre qui
mesure.

**Types servis.** L'assise du socle commun : l'entité porteuse ou `on:`
(D517, D518). Les axes font référence aux champs de l'assise. Le
découpage par valeurs est le plus naturel : une barre par catégorie
(D240). Les plages et la temporalité sont possibles.

**Contexte consommé.** Le socle commun : la confidentialité héritée et
surchargeable (D247), les droits.

**Propriétés.** Le socle commun (D515–D518, D521) : `on:`, `x:`, `y:` en
forme riche ou en liste de séries, `filter:`, `drill:`, `colors:`,
`labels:`, `title:`, `display:`. Les écarts propres (D1637) :

- `mode:` — `vertical` par défaut, ou `horizontal`. Le crochet est le
  raccourci : `chart.bars[horizontal]` vaut `mode: horizontal` (D478) ;
- `stacked:` — `true` empile les séries ; sans lui, elles sont côte à
  côte.

**Items.** Aucun.

**Modes et déclinaisons.** Le socle commun : le widget, le formulaire,
le tableau de bord (D243, D249), l'image dans un template (D257). Sur un
écran tactile, la barre touchée montre sa valeur.

**États et interactions.** Le socle commun : le drill-down au clic
(D242), les valeurs du calcul au clic sur une barre (D516), la
confidentialité qui masque.

**Décisions fondatrices.** D239–D243, D247–D249, D512, D515–D518.

**Exemple de configuration.** Dans le cas 5 (entrepôt),
`05_entrepot/versions/beta/v1.0.0.1/stock/mouvement/mouvement.yml` :

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

Les autres propriétés, sur un exemple. Le premier graphique est couché,
par le crochet (D478) ; son abscisse découpe par valeurs (D240). Le
second empile ses séries (D1637).

```yaml
# Les graphiques de l'entité order, dans son bloc gui
charts:

  # Le chiffre d'affaires par commercial : les barres couchées
  revenue_by_seller:
    component: chart.bars[horizontal]
    # L'abscisse : une barre par commercial
    x: seller
    # Deux séries, côte à côte
    y: [ sum(total), sum(margin) ]
    labels: true

  # Le stock par site : les séries empilées
  stock_by_site:
    component: chart.bars
    stacked: true
    x: site
    y: [ sum(reserved), sum(available) ]
```

## `chart.pie`

**Nom et famille.** `chart.pie`, les secteurs : le « camembert/anneau »
(D239). Un graphique de la famille pointée (D512).

**Rôle.** La répartition d'un tout : chaque part a son secteur.

**Types servis.** L'assise du socle commun (D517, D518). `x:` découpe
par valeurs : une part par valeur (D240). `y:` est l'agrégat qui mesure
la part.

**Contexte consommé.** Le socle commun : la confidentialité héritée et
surchargeable (D247), les droits.

**Propriétés.** Le socle commun (D515–D518, D521) : `on:`, `x:`, `y:`,
`filter:`, `drill:`, `colors:`, `labels:`, `title:`, `display:`. Les
écarts propres (D519) :

- `mode:` — `pie`, le camembert, par défaut ; `donut`, l'anneau ;
  `quarter`, l'arc. Le crochet est le raccourci : `chart.pie[donut]`
  (D478, D1640) ;
- `thickness:` — l'épaisseur de l'anneau et de l'arc, en pourcentage du
  rayon (D520, D1637) ;
- les angles de `quarter` — le départ et la fin, au crochet, aux bornes
  (D1637) : `quarter[-90..90]`. 0° est à midi, le sens est horaire ;
  `quarter` nu vaut `[0..90]`. L'usage fondateur est de « représenter
  l'assemblée nationale de la gauche vers la droite » (D520) ;
- les variables du gabarit des labels — `{value}`, `{percent}` et
  `{total}` : `{percent} % ({value} / {total})` (D516, D519) ;
- le regroupement des petites parts en « autres » — un seuil ; rien par
  défaut (D519).

**Items.** Aucun.

**Modes et déclinaisons.** Le socle commun : le widget, le formulaire,
le tableau de bord (D243, D249), l'image dans un template (D257). Sur un
écran tactile, la part touchée montre sa valeur.

**États et interactions.**

- Le clic sur une part ouvre la liste de ses éléments (D242, D519).
- Le drill de la part « autres » est à deux étages : une barre de
  répartition de toutes les autres valeurs s'ouvre, et l'utilisateur y
  précise la valeur à filtrer dans la liste (D519).
- Les valeurs du calcul s'ouvrent comme pour tout graphique (D516).
- La confidentialité masque.

**Décisions fondatrices.** D239–D243, D247–D249, D512, D515–D516,
D519–D520.

**Exemple de configuration.** Sur un exemple. Le premier graphique est
un anneau, par le crochet (D239, D478) ; ses parts sont les catégories
(D240), son label est le trio du gabarit (D519), et le clic sur une part
ouvre la liste nommée `by_category` (D242, D519). Le second est
l'hémicycle (D520).

```yaml
# Les graphiques de l'entité order, dans son bloc gui
charts:

  # Le chiffre d'affaires par catégorie : l'anneau
  revenue_by_category:
    component: chart.pie[donut]
    # Les parts : une par catégorie
    x: category
    y: sum(total)
    # Le gabarit du label : le pourcentage, la valeur et le total
    labels: { fr: "{percent} % ({value} / {total})" }
    # Le clic sur une part : la liste nommée de la catégorie
    drill: by_category

  # L'hémicycle : l'arc de la gauche vers la droite
  assembly:
    component: chart.pie
    # L'arc, du départ à la fin, en degrés
    mode: quarter[-90..90]
    # L'épaisseur de l'arc, en pourcentage du rayon
    thickness: 40%
    on: politics.deputy
    x: party
    y: count()
```

## `chart.scatter`

**Nom et famille.** `chart.scatter`, le nuage de points. Un graphique de
la famille pointée (D512).

**Rôle.** « Représenter une concentration ou une dispersion d'une
certaine valeur » et « aider à catégoriser des éléments » (D522) : la
matrice de décision.

**Types servis.** L'assise du socle commun (D517, D518). Le grain
diffère des autres graphiques : un point par enregistrement. `x:` et
`y:` sont deux champs numériques nus, sans agrégat, là où la courbe et
les barres agrègent (D522).

**Contexte consommé.** Le socle commun : la confidentialité (D247), les
droits. Le nuage lit aussi le visage de l'enregistrement (D386), par le
gabarit `{champ}` des valeurs ; l'interpolation `${…}` de la
configuration est possible aussi (D802).

**Propriétés.** Le socle commun (D515–D518, D521), `display:` compris.
Les écarts propres (D522, D523) :

- `threshold:`, dans la forme riche de l'axe. « L'axe définit min, max
  et threshold » : la liste croissante des seuils découpe l'axe en
  bandes ;
- `zones:`, la liste des zones. Les bandes des deux axes forment une
  matrice. Une zone s'adresse dans cette matrice : `zone: [1,1]`, avec
  son `title:` et, au choix, sa `color:`. Aucune borne n'est répétée
  (D523). La convention est `[colonne, ligne]` depuis l'origine des
  axes ; `[1,1]` est en bas à gauche (D1637). C'est le MoSCoW à deux
  critères, ou la matrice effort/bénéfice.

**Items.** Aucun.

**Modes et déclinaisons.** Le socle commun : réutilisable (D243, D249),
l'image dans un template (D257), le tableau des valeurs par `display:`
(D521). Au survol d'un point, le visage de l'enregistrement s'affiche
(D386).

**États et interactions.**

- Le clic sur un point ouvre le formulaire de l'enregistrement.
- Le clic sur une zone ouvre la liste de ses éléments, comme le clic sur
  une part de `chart.pie` (D519).
- La confidentialité masque.

**Décisions fondatrices.** D239–D243, D247–D249, D386, D512, D515–D518,
D521–D523.

**Exemple de configuration.** Sur un exemple, la matrice
effort/bénéfice (D522). Chaque axe porte un seuil, qui fait deux bandes
(D523) ; les quatre zones s'adressent par `[colonne, ligne]` (D523) ; le
label est le visage de l'enregistrement, au survol (D386).

```yaml
# Les graphiques de l'entité action, dans son bloc gui
charts:

  # Les priorités : la matrice effort/bénéfice
  priorities:
    component: chart.scatter
    # Les axes : l'effort et le bénéfice, de 0 à 100, un seuil à 50
    x: { value: effort, min: 0, max: 100, threshold: [50] }
    y: { value: benefit, min: 0, max: 100, threshold: [50] }
    # Les zones : la position dans la matrice, en colonne puis en ligne
    zones:
      - zone: [1, 2]
        title: { fr: Gains rapides }
        color: green
      - zone: [2, 2]
        title: { fr: Grands projets }
        color: orange
      - zone: [1, 1]
        title: { fr: Tâches de fond }
        color: gray
      - zone: [2, 1]
        title: { fr: À éviter }
        color: red
    # Le visage de l'enregistrement au survol
    labels: true
```

## `chart.combo`

**Nom et famille.** `chart.combo`, le combiné. Un graphique de la
famille pointée (D512).

**Rôle.** Deux mesures d'un regard : « courbe + barres ou deux courbes,
2 axes Y max, même temporalité/échantillon » (D239).

**Types servis.** L'assise du socle commun (D517, D518). Un `x:` commun
aux deux séries : le même découpage, donc la même temporalité par
construction. Deux séries `y:`, chacune sur son axe, à gauche et à
droite.

**Contexte consommé.** Le socle commun : la confidentialité (D247), les
droits.

**Propriétés.** Le socle commun (D515–D518, D521), `display:` compris.
Les écarts propres (D1637) :

- `y:` est une liste de séries. Chaque série s'écrit
  `{ value:, as: line | bars, axis: left | right }` : sa nature et son
  axe. Par défaut, la première est à gauche et la seconde à droite ;
- `axis: bottom | top` couche les valeurs : « la représentation en
  ligne contre la représentation en colonne » (D524, D525). La paire
  est homogène par construction. Les bords sont d'un seul vocabulaire
  (D504) ;
- deux axes au plus : « au-delà de 2 axes, illisible » (D239). Une
  troisième série est refusée à l'ingestion. Un hook permet d'aller
  au-delà.

**Items.** Aucun.

**Modes et déclinaisons.** Le socle commun : réutilisable (D243, D249),
l'image dans un template (D257). Le tableau des valeurs met les deux
séries en colonnes (`display:`, D521).

**États et interactions.** Le socle commun : le drill-down au clic
(D242), les valeurs du calcul (D516), la confidentialité qui masque.

**Décisions fondatrices.** D239–D243, D247–D249, D512, D515–D518, D521,
D524–D525.

**Exemple de configuration.** Sur un exemple. L'abscisse est commune aux
deux séries (D239, D240) : le chiffre d'affaires en barres sur l'axe de
gauche, le volume en courbe sur l'axe de droite.

```yaml
# Les graphiques de l'entité order, dans son bloc gui
charts:

  # L'activité : le chiffre d'affaires en barres, le volume en courbe
  activity:
    component: chart.combo
    # L'abscisse commune : la date, découpée par mois
    x: date[month]
    # Les deux séries, chacune sa nature et son axe
    y:
      - { value: sum(total), as: bars, axis: left }
      - { value: count(), as: line, axis: right }
    labels: true
```

## `kpi`

**Nom et famille.** `kpi`, le chiffre clé. Un graphique, à côté de la
famille pointée (D512).

**Rôle.** Un agrégat en grand : l'indicateur d'un regard.

**Types servis.** L'assise du socle commun : l'entité porteuse ou `on:`
(D517, D518). La valeur est un agrégat (D158). Il n'y a aucun axe.

**Contexte consommé.** Le socle commun : la confidentialité héritée et
surchargeable (D247), les droits.

**Propriétés.** Le `kpi` reprend une partie du socle commun et y ajoute
les siennes :

- `on:` (D517, D518) ;
- `value:` — l'agrégat. C'est le `y:` des graphiques, sans axe (D1637) ;
- `filter:` (D90) ;
- `title:` (D493) ;
- `labels:` — le gabarit du format, avec `{value}` (D516) ;
- `colors:` par seuils — le chiffre change de couleur selon sa valeur.
  C'est la mécanique commune des couleurs (D467), la table d'entité
  comprise (D495) ;
- `resources:` par seuils — « associer éventuellement une icône : cas
  d'un feu tricolore » (D526). La mécanique de `colors:` est dupliquée :
  une ressource par seuil, l'écriture de la jauge (D1609, D1611, D1640).
  La liaison `icon:` à la table d'entité vaut aussi (D495) ;
- `layout:` — « l'organisation se découpe en 4 » (D527) : la position du
  label, `top` par défaut, `left`, `bottom` ou `right`, les bords de
  D525. L'icône est au bord opposé (D1640). Le `layout:` des sections a
  d'autres valeurs ; le contexte départage (D458) ;
- `drill:` (D242).

Le socle ne compare pas (D245) : l'évolution contre une période est un
hook. Une tendance lue dans l'historique de l'entité est une piste notée
au registre, sans détail (D541, D411, D172).

**Items.** Aucun.

**Modes et déclinaisons.** Le chiffre est « mis en valeur avec un style
différent de la feuille » (D527) : en exergue, jamais comme un champ. Le
widget est sa surface naturelle ; l'entité rejoint le module fonctionnel
(D247). Le tableau de bord le rafraîchit (D249). Le formulaire le
reçoit aussi (D243). Dans un template, c'est la valeur au format.

**États et interactions.** Le clic ouvre le drill-down (D242) ou les
valeurs du calcul (D516). La confidentialité masque.

**Décisions fondatrices.** D158, D242–D243, D245, D247–D249, D467, D495,
D512, D515–D518, D526–D527.

**Exemple de configuration.** Dans le cas 5 (entrepôt),
`05_entrepot/versions/beta/v1.0.0.1/stock/niveau/niveau.yml` :

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

Les autres propriétés, sur un exemple. La valeur est un agrégat sans axe
(D158). Les couleurs et les ressources changent par seuils : le feu
tricolore, une ressource par seuil (D467, D526, D1640). Le label est à
gauche, donc l'icône à droite (D527). Le clic ouvre la liste nommée
(D242).

```yaml
# Les indicateurs de l'entité order, dans son bloc gui
charts:

  # Le chiffre d'affaires du mois
  monthly_revenue:
    component: kpi
    # L'agrégat, sans axe
    value: sum(total)
    # Le périmètre : le mois courant
    filter: date in current_month
    title: { fr: CA du mois }
    # Le gabarit du format
    labels: { fr: "{value} € HT" }
    # La couleur par seuils
    colors: { 0: red, 50000: orange, 100000: green }
    # Le feu tricolore : une ressource par seuil
    resources: { 0: red_light, 50000: orange_light, 100000: green_light }
    # Le label à gauche ; l'icône au bord opposé, à droite
    layout: left
    # Le clic : la liste nommée des commandes facturées
    drill: invoiced
```

## `pivot`

**Nom et famille.** `pivot`, le tableau croisé dynamique. Un graphique,
à côté de la famille pointée (D512).

**Rôle.** « Un outil d'analyse puissant et pourtant simple à mettre en
œuvre » (D246) : les lignes croisent les colonnes, et la formule remplit
l'intersection.

**Types servis.** L'assise du socle commun (D517, D518). Le croisé tient
en quatre éléments (D246) :

- un filtre ;
- le ou les champs en ligne ;
- le ou les champs en colonne ;
- une formule à l'intersection.

**Contexte consommé.** La confidentialité héritée et surchargeable
(D247), les droits. Le croisé est indépendant des compositions
matricielles du modèle (D134) : c'est une présentation, applicable à
toute entité.

**Propriétés.** Aux noms acquis (D1637) :

- `rows:` — le ou les champs en ligne. La liste est un groupement
  hiérarchique : `[seller, customer]`, le commercial puis le client ;
- `columns:` — le ou les champs en colonne. C'est le mot des listes
  (D442) ;
- `value:` — la formule : un agrégat (D158), partitionné par la
  cellule ;
- `filter:` — le périmètre (D90) ;
- `sort:` — « le tri peut s'appuyer sur les rows, les columns ou la
  value » (D528, D529). La clé est un champ des lignes, un champ des
  colonnes, ou `value`. Les signes et les cascades sont ceux des listes
  (D442) : `sort: { seller: -value, date: + }`. Chaque niveau du
  groupement est trié par son sous-total. Par défaut, l'ordre est
  l'ordre naturel du champ ;
- les plages et les temporalités, sur les champs numériques ou dates :
  « comme pour les graphiques (D240), pour réduire le volume ».
  `date[month]` s'écrit au crochet ;
- `title:` (D493).

**Items.** Aucun.

**Modes et déclinaisons.** Les groupements sont hiérarchiques, pliables
au besoin (D246). Le croisé est réutilisable : le widget (D247), le
tableau de bord (D249), le formulaire (D243). Dans un template, c'est le
tableau rendu, groupements dépliés.

**États et interactions.**

- Le pli et le dépli des groupements.
- Le clic sur une cellule ouvre la liste des éléments de l'intersection,
  comme le drill-down des graphiques (D242, D519, D1637).
- La confidentialité masque.

**Décisions fondatrices.** D134, D158, D240, D243, D246–D249, D441,
D512, D517–D518, D528–D529.

**Exemple de configuration.** Dans le cas 5 (entrepôt),
`05_entrepot/versions/beta/v1.0.0.1/stock/mouvement/mouvement.yml` :

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

Les autres propriétés, sur un exemple : l'exemple fondateur du croisé
(D246). Les lignes sont la hiérarchie pliable, les colonnes la
temporalité (D240), la valeur l'agrégat partitionné par la cellule
(D158), et le tri met les plus gros chiffres d'affaires d'abord (D528,
D1640).

```yaml
# Les croisés de l'entité order, dans son bloc gui
charts:

  # Le chiffre d'affaires par commercial et par mois
  revenue_matrix:
    component: pivot
    # Les lignes : la hiérarchie pliable, le commercial puis le client
    rows: [seller, customer]
    # Les colonnes : la date, découpée par mois
    columns:
      - date[month]
    # La valeur : la somme des totaux, par cellule
    value: sum(total)
    # Le tri : les plus gros chiffres d'affaires d'abord
    sort: -value
    filter: state = "invoiced"
    title: { fr: CA par commercial et par mois }
```
