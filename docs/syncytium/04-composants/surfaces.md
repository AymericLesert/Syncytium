# Les surfaces

> **Une surface** est un écran généré et nommé : la liste, le
> formulaire, le résumé, le widget, le wizard, le tableau de bord, le
> template, le chat. Elle est la facette d'une entité, ou le composant
> graphique élaboré pour elle ([glossaire](../../glossaire.md)).

Une surface se déclare dans le bloc `gui:` d'une entité, sous `lists:`,
`forms:`, `summary:`, `widgets:`, `wizards:` ou `templates:` (D437). Le
tableau de bord se déclare au module, sous `dashboards:` (D1639). Dans
chaque bloc, la première surface déclarée est celle par défaut (D438).
Le menu adresse les surfaces par le `link:` de ses entrées (D439,
D1237). Le chat est une surface du socle (D957).

Toute surface s'ouvre au-dessus de la pile des surfaces précédentes
(D535). Quatre propriétés reviennent de fiche en fiche :

- `title:`, le titre, un gabarit déclinable par langue (D449, D465) ;
- `size:`, la zone de l'écran que la surface couvre (D532, D533) ;
- `screen:`, les formats d'écran sur lesquels elle s'affiche (D450,
  D1613) ; la règle complète est à la fiche `form` ;
- `description:`, par langue, pour la documentation (D1193).

Ce fichier porte neuf fiches, dans l'ordre du catalogue : `menu`,
`list`, `form`, `summary`, `widget`, `wizard`, `dashboard`, `template`,
`chat`. Chaque fiche suit le modèle du chapitre
([README.md](README.md)).

## `menu`

**Nom et famille.** `menu`, une surface (D1604). C'est la porte de
chaque module : un menu par module fonctionnel, hiérarchique (D193).
Il s'écrit dans `menu.yml`. Le module le référence ; il est facultatif
(D351). Le fichier et sa grammaire sont décrits au chapitre de la
configuration ([version.md](../01-configuration/version.md)).

**Rôle.** Conduire l'utilisateur à une surface. Le menu est « une carte
d'entrées nommées, dans l'ordre d'affichage » (D1237). Le logo mène à
la page d'accueil (D193).

**Types servis.** Aucun. Le menu adresse des surfaces, il ne rend aucun
champ.

**Contexte consommé.** L'utilisateur, ses droits et la confidentialité.
Une entité invisible rend invisibles toutes ses entrées (D193).

**Propriétés.** Chaque entrée porte deux propriétés (D1237) :

- `label:`, le libellé par langue. Sans lui, l'entrée prend le titre de
  la surface liée ;
- `link:`, l'adresse logique de la surface visée (D439).

L'adresse de `link:` prend une de ces formes :

- `<module>.<entité>` : la liste par défaut de l'entité ;
- `<module>.<entité>[<liste>]` : une liste nommée ;
- `<module>.<entité>.<opération>` : une opération ;
- `<module>.<entité>[+<formulaire>]` : un formulaire ;
- `<module>.<entité>[@<wizard>]` : un wizard ;
- `<module>[<dashboard>]` : un tableau de bord du module.

L'icône d'une entrée vient de la surface visée (D439). Une entité peut
avoir plusieurs entrées, chacune vers une de ses listes (D189).

Sans `menu.yml`, Syncytium construit le menu par défaut (D193, D186) :

- une entrée par entité agrégat du module ;
- ses enfants et ses associations en lien multiple, en sous-menu ;
- chaque entrée ouvre la liste de l'entité.

**Items.** Des entrées et des sous-menus. Un sous-menu porte `label:`
et `items:`, la carte de ses entrées (D1237). Le menu a trois niveaux
au plus (D192) :

- le module ;
- les entités parents ;
- les enfants et les liaisons.

L'entrée d'une composition ouvre la liste de l'enfant, tous possesseurs
confondus (D1227).

**Modes et déclinaisons.** À l'écran, le bandeau haut porte les menus
et les sous-menus. Quand l'application a plusieurs modules, le bandeau
gauche porte le choix du module (D191). Depuis le menu, le wizard prend
tout l'écran (D549). La déclinaison au smartphone et à la tablette
n'est pas encore décidée.

La documentation suit le menu (D1194). Chaque entrée est une section de
la documentation fonctionnelle. Une liste décrite par une entrée a sa
section ; une entité hors du menu n'est pas décrite (D1195, D1229).

**États et interactions.** La confidentialité masque l'entrée (D193).
Le clic ouvre la surface adressée.

**Décisions fondatrices.** D186, D189, D191–D194, D351, D439, D549,
D1194–D1195, D1227, D1229, D1237, D1604.

**Exemple de configuration.** Dans le cas 4 (banque),
`04_banque/versions/beta/v1.0.0.0/banque/menu.yml`, l'accueil et le
sous-menu des écritures :

```yaml
# L'accueil du module
accueil:
  label:
    fr: Tableau de bord
    en: Dashboard
    es: Panel de control
  link: banque[accueil]

# Les écritures, en sous-menu — une entrée par liste
ecritures:
  label:
    fr: Écritures
    en: Entries
    es: Apuntes
  items:
    operations:
      link: banque.ecriture[par_operation]
    comptable:
      link: banque.ecriture[par_comptable]
    rapprochement:
      link: banque.ecriture[pointage]
```

## `list` (la surface)

**Nom et famille.** `list`, une surface. C'est le même composant que la
feuille `list` : « un seul list » (D486). Ici, c'est son visage
déclaré : `gui: lists: <nom>:`. La première liste déclarée est la
surface par défaut (D438). Le menu l'adresse en valeur de `link:`,
`sales.order[pending]` par exemple (D439, D1237).

**Rôle.** La porte d'entrée de l'entité : ses enregistrements en
tableau ou en widgets, la recherche, le tri, les opérations.

**Types servis.** L'entité, ses champs en colonnes. La liste a deux
visages, exclusifs l'un de l'autre (D492) :

- le tableau, déclaré par `columns:` ;
- la liste de widgets, déclarée par `widget:`.

**Contexte consommé.** La liste lit :

- la confidentialité : une colonne non visible ne se trie pas ;
- les droits d'action (D196) ;
- le module.

**Propriétés.** Elles se groupent en cinq familles : le contenu, la
recherche, les gestes et les opérations, les exports, l'écran.

*Le contenu.*

- `columns:`, l'ordre d'affichage des colonnes, par les noms nus. Un
  champ et une opération homonymes : le champ l'emporte (D462). Chaque
  colonne peut porter :
  - son style, son alignement, sa dimension (D442). Le type prime le
    format (D443, D448) : l'amount à droite avec sa devise, le toggle
    centré, le multi-lignes justifié ;
  - `visible: false`, la colonne fantôme ;
  - `background:`, le fond gradué (D466) ;
  - `colors:`, les couleurs (D467) ;
  - `preview:`, l'aperçu du fil (D393) ;
- `widget:`, le second visage : chaque enregistrement est rendu par le
  widget nommé (D492) ;
- `filter:`, une expression du langage (D90) ;
- `sort:`, le tri par colonne, à cascades, avec les signes `+` et `-`
  (D442) ;
- `editable:`, les colonnes modifiables en ligne. Par défaut, tout est
  en lecture seule (D442) ;
- `title:`, le titre de la liste (D493).

*La recherche.*

- `searchable:`, les champs ou les noms mutualisés, chacun cherchable
  au modèle. Par défaut, ce sont les colonnes affichées, ou les champs
  du widget, qui portent `searchable:` (D1308, D1596). Un critère
  nommé sans `searchable:` au modèle est une erreur d'ingestion
  (D1598) ;
- le possesseur d'une composition (D782, D1599). Ouverte depuis lui, la
  liste de ses éléments le tient du contexte. La liste de tous les
  éléments, sans distinction de possesseur, peut proposer un filtre sur
  lui par sa définition : en recherche stricte, ou sous l'une des
  autres formes.

*Les gestes et les opérations.*

- `selection:`, la sélection d'une ligne ou de plusieurs (D445, D446).
  Elle admet les mots et le nombre : `one`, `multiple`, `1`, `1..`,
  `1..4`, `2..4`, `..4` (D1650). `one` vaut `1` et `multiple` vaut `1..` ;
  `2..4` veut dire entre deux et quatre lignes, `..4` au plus quatre.
  Une autre valeur est une erreur d'ingestion (D1651). La banque écrit
  `selection: multiple` ;
- `sizable: none | auto | manual | auto+manual`, le dimensionnement des
  colonnes (D447) ;
- `add:`, `update:` et `delete:`, « le formulaire/widget à appeler »
  pour chaque geste (D530). Les défauts : le formulaire par défaut
  (D438), les gestes du socle (D446) ;
- `actions:`, la liste des opérations (D531). L'opération porte son
  icône à la déclaration ; la liste la surcharge au besoin.

*Les exports.*

- `exports:`, « les différents exports ou générations de documents »
  (D530). La forme courte est `<format>` ou `<format>[<modèle>]`
  (D1601) :
  - le format : `csv`, `pdf`, `word` (D1602), `excel`, `ods`, `mail`… ;
  - le crochet nomme le modèle qui génère le document ; sans crochet,
    c'est le modèle de base de la liste (D792) ;
  - `csv` exporte par défaut les colonnes affichées ; les colonnes d'un
    export déclaré portent leur longueur (D213) ;
  - le format est un storage de format (D636) ou une destination du
    gabarit (D564) ; sinon, c'est une erreur d'ingestion ;
  - derrière la forme courte, `export` ou `generate` s'exécute, et ses
    événements suivent (D1603). `generate()` sert les opérations, pas
    cette propriété.

Par exemple, `exports: [ csv, excel[stock.xlsx], pdf[order_sheet] ]`
offre trois exports : le CSV des colonnes affichées, l'Excel sur le
modèle `stock.xlsx`, le PDF sur le template `order_sheet`.

*L'écran.*

- `size:`, « la zone de couverture de l'écran » (D532). La grammaire
  vaut pour toutes les surfaces (D533, D484) :
  - `size: 75%`, la part de l'écran, centrée ;
  - `size: 90% 50%`, la largeur puis la hauteur ;
  - `size: 1000px 320px`, les pixels ;
- `screen:`, « le support sur lequel la liste a été définie et/ou
  autorisée à s'afficher » (D532, D450). Il s'écrit
  `<format>[<orientation>]` ; sans lui, tous les formats (D1613). La
  règle complète est à la fiche `form`.

**Items.** Aucun à déclarer. L'anatomie est celle d'un `pages`,
intrinsèque (D531).

**Modes et déclinaisons.** « Une liste est comme pages » (D531). Elle a
trois zones :

- le header : le titre ; les colonnes du tableau, « non visibles sur
  les widgets, sauf pour assurer les tris » ; les filtres ;
  l'icône-menu des exports ; les icônes de l'ajout, de la modification
  et de la suppression, étendues aux actions à icône. Une colonne
  étroite prend l'`abbreviation:` du champ (D1622) ;
- la zone page : le contenu du tableau ;
- le footer : le sous-total ou un gabarit, `{count}` par exemple
  (D1639) ; les boutons des actions sans icône.

Le contenu est le tableau ou les widgets (D492).

Le filtrage est vivant : la liste se rafraîchit d'elle-même, sans
bouton (D226–D229, D444).

La recherche texte globale ne porte que sur les champs qui ont
`searchable:`. Sans eux, aucune recherche (D198, D1632).

L'utilisateur paramètre sa liste : le choix et l'ordre des colonnes se
règlent à son profil. Un `manager` ou un `administrator` peut les
publier au groupe (D198, D1632).

La pagination se fait au curseur opaque, avec ses indicateurs.

La liste embarquée rend une composition ou une association (D486).

Le responsive se fait au repli (Q48).

La liste se décline selon l'écran (D290, D1613, D1634) :

- sur le smartphone, un tableau pour les petites listes, des widgets
  pour les grandes : une colonne en portrait, deux en paysage ;
- sur la tablette et le poste informatique, des tableaux ou des widgets
  sur plusieurs colonnes.

C'est une recommandation au concepteur. Il déclare une liste par écran
avec `screen:`.

Les filtres se placent selon l'écran (D290, D1633) :

- toujours affichés sur le poste informatique ;
- derrière une icône sur le smartphone ;
- sur la tablette, au choix du composant selon la place disponible.

**États et interactions.** Les gestes de la liste :

- la création : le bouton est compris dans le cadre ; il ouvre le
  formulaire d'`add:` (D530) ;
- la modification au double-clic : le formulaire d'`update:` ; en
  lecture seule, c'est la consultation ;
- la suppression (D197, D446, D530) : une ligne ouvre le formulaire de
  `delete:` en lecture seule, puis la confirmation ; plusieurs lignes
  demandent la double validation, le nombre et la synthèse des
  suppressions, puis la confirmation ;
- la modification en masse : un parcours séquentiel, valider puis
  passer au suivant, interruptible à tout moment (D197) ;
- l'opération de masse, sur les lignes sélectionnées (D446) ;
- les opérations en colonne, à trois états (D444).

**Décisions fondatrices.** D90, D189, D196–D198, D213, D226–D229, D290,
D393, D437–D448, D450, D462, D466–D467, D484, D486, D492–D493,
D530–D533, D564, D636, D782, D792, D1237, D1308, D1596, D1598–D1599,
D1601–D1603, D1613, D1622, D1632–D1634, D1639.

**Exemple de configuration.** Dans le cas 4 (banque),
`04_banque/versions/beta/v1.0.0.0/banque/ecriture/gui.yml` :

```yaml
# Les listes
# La première déclarée est celle par défaut ; chacune porte sa zone de recherche — le compte, la plage de dates par la
# facette du champ, le champ de recherche mutualisé.
lists:

  # Par date comptable
  # Les écritures pointées seules ; le tri, partagé avec le relevé, va de la dépense à la ressource ; l'export PDF prend
  # le modèle de base de la liste.
  par_comptable:
    title:
      fr: Par date comptable
      en: By posting date
      es: Por fecha contable
    filter: date_comptable is not null
    searchable:
      - owner: { searchable: strict, select: mono, required: true }
      - date_comptable
      - recherche
    columns: [date_operation, date_comptable, libelle, budget, debit, credit, solde]
    sort: [date_comptable, montant, numero]
    selection: multiple
    actions: [copy]
    exports: [ pdf ]
```

Les autres propriétés, sur un exemple :

```yaml
# Les listes de la commande : le tableau par défaut, puis la liste en cartes
lists:

  # Les commandes en cours
  # La première déclarée est la liste par défaut. Le total porte un fond gradué, la discussion montre trois messages
  # au survol, la colonne invoice porte l'icône de l'opération. Seules les notes se modifient en ligne.
  pending:
    title: { fr: Commandes en cours }
    columns:
      - number
      - customer
      - total: { background: progress }
      - discussion: { preview: 3 }
      - invoice
    filter: state in ["draft", "confirmed"]
    sort: { date: -, number: + }
    editable: [notes]
    selection: 1..
    sizable: auto+manual
    add: quick_entry
    update: record
    exports:
      - csv
      - excel[orders.xlsx]
      - pdf[order_sheet]
    actions: [ invoice, cancel ]

  # Les commandes en cartes
  # Le second visage : chaque enregistrement est rendu par son widget.
  cards:
    widget: card
    filter: state in ["draft", "confirmed"]
```

Dans cet exemple, `pending` est la liste par défaut (D438). Le fond
gradué de `total` (D466) et l'aperçu du fil de `discussion` (D393) se
déclarent à la colonne. La colonne `invoice` porte l'icône à trois
états de l'opération (D444, D462). Le tri cascade la date décroissante
puis le numéro (D442). `add:` nomme le formulaire du bouton d'ajout ;
`update:` nomme celui du double-clic, `record` étant le défaut (D438,
D788). Les actions à icône vont au header, les autres au pied (D531).
Le menu adresse la liste en valeur de `link:`, `sales.order[pending]`
(D439, D1237).

## `form`

**Nom et famille.** `form`, une surface : `gui: forms: <nom>:`. Le
premier formulaire déclaré est le formulaire par défaut (D438). Sans
déclaration, le formulaire du socle suit les groupes de champs de
l'entité (D1273, D1279 ; les groupes se déclarent dans `fields:`,
[champs.md](../02-modele/champs.md)) :

- un onglet par groupe ;
- les champs hors groupe en en-tête, au-dessus de tous les onglets ;
- sans `groups:`, pas d'onglet.

Trois chemins mènent au formulaire :

- le menu, par le `link:` d'une entrée, `[+form]` (D439, D1237) ;
- la liste, par `add:`, `update:` ou `delete:` (D530) ;
- une opération, pour la relecture de `commit: confirm` (D431, D596).

**Rôle.** L'enregistrement en face à face. Un seul formulaire sert
cinq usages (D199) :

- la création ;
- la modification ;
- la suppression ;
- la consultation ;
- la visualisation d'un historique.

**Types servis.** L'entité : l'enregistrement dans son agrégat, avec
ses compositions embarquées (D101).

**Contexte consommé.** L'enregistrement, l'origine de l'appel,
l'utilisateur (D455) ; les droits d'action (D196) ; la
confidentialité ; le `title` de l'entité (D465).

**Propriétés.** Le formulaire porte :

- `title:`, la zone de texte à gabarit, déclinable par langue (D449,
  D453). Le `title` de l'entité est utilisable et surchargeable
  (D465) ;
- `mode:`, `read-only` ou `updatable` (D453) ;
- `history:`, `false` désactive l'onglet historique d'une entité
  historisée (D453) ;
- `size:`, la surimpression, par défaut 100 % de l'écran (D454). Toute
  surface s'ouvre au-dessus de la pile des actions antécédentes
  cumulées (D535) : `size:` vaut pour toutes les surfaces, et le couple
  de D484 reste au grain du champ. La grammaire est une ou deux valeurs,
  en % ou en px (D533) ;
- `screen:`, les formats d'écran, décrits ci-dessous.

*Les formats d'écran.* `screen:` dit les formats sur lesquels la
surface s'affiche, un ou plusieurs (D450, D532). Chaque format s'écrit
`<format>[<orientation>]` (D1613, D1614) :

- les formats sont `pc`, `tablet` et `smartphone` ;
- les orientations sont `landscape` et `portrait` ;
- `pc[landscape]` et `pc[portrait]` nomment une orientation ; `pc`
  sans orientation vaut pour toutes les orientations.

Les règles qui en découlent :

- sans `screen:`, la surface vaut pour tous les formats et toutes les
  orientations (D1613) ;
- une surface par écran : Syncytium déduit le format de la zone
  d'affichage disponible. Un changement de taille fait basculer
  l'application d'un format à l'autre, et les composants se déclinent
  d'eux-mêmes (D200, D250, D1613) ;
- à la bascule, un lien vers une surface que le nouveau format
  n'autorise pas ouvre la première surface déclarée du même genre qui
  l'autorise (D438) ;
- un format qu'aucune surface d'un genre n'autorise est une erreur
  d'ingestion (D1614), parmi les formats que la version porte ;
- la version porte ses formats dans les settings :
  `version: { screen: [ pc, tablet ] }`. Sans cette clé, elle porte tous
  les formats (D1616) ;
- une surface qui déclare un format que la version ne porte pas est une
  erreur d'ingestion. Ouverte sur un format que la version ne porte pas,
  l'application affiche « l'application n'est pas disponible sur ce
  support » (D1617).

**Items.** Le formulaire est un `pages` implicite (D509) : `header`,
une ou plusieurs `page`, `footer`, aux clés usuelles. Au multi-pages,
les pages s'écrivent en liste (D510).

*Le raccourci de la page unique* (D1594, D1595) :

- sans entête, sans pied et sur une seule page, le formulaire écrit son
  contenu directement sous `items:` ;
- `page:` s'impose dès qu'un `header`, un `footer` ou une seconde page
  entre ;
- sous `page:`, le contenu s'écrit en liste ; `header:` et `footer:`
  portent `items:`, parce qu'ils portent aussi `height:` (D507) ;
- le raccourci vaut pour toutes les surfaces à pages : le formulaire,
  le résumé, le widget, le template, le tableau de bord. `page:` reste
  valide (D1649).

Dans les pages, le formulaire accueille :

- les sections seules (D490) et l'organisateur `sections` ;
- les `tabs` ;
- les feuilles, `field[<nom>]` (D460) ;
- les actes, `operation[<nom>]` (D511) ;
- les documents, `template[<nom>]` (D483) ;
- les graphiques, `chart[<nom>]`, en feuille (D243, D540) ; le résumé
  en hérite de fait (D538).

**Modes et déclinaisons.** Les cinq usages d'un seul formulaire
(D199) :

- la création : les compteurs affichent « *(attribué à la
  validation)* » (D154, D199) ;
- la modification : la concurrence se règle par champ (D111) ;
- la suppression : la lecture seule, puis la confirmation (D446) ;
- la consultation : `mode: read-only` ;
- l'historique : l'onglet (D453).

Il n'y a jamais de popup du navigateur ; la boîte de dialogue de
l'application est assumée (D196, D1605). La relecture d'une opération
ouvre le formulaire en lecture seule, puis confirmer ou annuler (D431).
Le responsive se fait au repli (D203).

**États et interactions.** Les droits déterminent l'usage offert
(D196). Le refus de validation s'affiche au champ (D307). Le `title` en
tête vit avec l'enregistrement.

**Décisions fondatrices.** D101, D111, D154, D196, D199–D200, D203,
D243, D250, D307, D431, D437–D438, D446, D449–D455, D460, D465, D483,
D485, D507, D509–D511, D530, D533–D535, D538, D540, D596, D788, D1237,
D1273, D1279, D1594–D1595, D1605, D1613–D1614, D1616–D1617.

**Exemple de configuration.** Dans le cas 4 (banque),
`04_banque/versions/beta/v1.0.0.0/banque/ecriture/gui.yml` :

```yaml
# Les formulaires
# Le formulaire de l'écriture, puis les formulaires d'appel des opérations : leur validation est l'opération, et leurs
# items déclarent des champs libres — les paramètres du hook.
forms:

  # Le formulaire de l'écriture
  # Les cinq usages ; le titre suit le mode d'ouverture. Le calendrier et ses pas sur les dates, les choix du mode, le
  # numéro de chèque visible pour le mode autre, les référentiels à création directe.
  record:
    title:
      create:
        fr: Création d'une écriture
        en: New entry
        es: Nuevo apunte
      read:
        fr: Écriture '{libelle}' du {date_operation}
        en: Entry '{libelle}' of {date_operation}
        es: Apunte '{libelle}' del {date_operation}
      update:
        fr: Modification de l'écriture '{libelle}' du {date_operation}
        en: Editing entry '{libelle}' of {date_operation}
        es: Modificación del apunte '{libelle}' del {date_operation}
      delete:
        fr: Suppression de l'écriture '{libelle}' du {date_operation}
        en: Deleting entry '{libelle}' of {date_operation}
        es: Eliminación del apunte '{libelle}' del {date_operation}
    items:
      - field[date_operation]
      - field[date_comptable]
      - field[libelle]
      - field[budget]
      - field[montant]
      - field[mode]
      - field[cheque]: { visible: mode = autre }
      - field[lieu]
```

Ce formulaire tient sur une seule page, sans entête ni pied : il écrit
ses champs sous `items:`, le raccourci de la page unique (D1594).

Les autres propriétés, sur un exemple :

```yaml
# Les formulaires de la commande : le formulaire unique, puis la saisie rapide
forms:

  # Le formulaire de la commande
  # Le premier déclaré est le défaut, et record est son nom. Le titre surcharge le title de l'entité. Affiché sur le
  # poste informatique en paysage seulement, sur les trois quarts de l'écran, au-dessus de la pile.
  record:
    title: "{number} — {customer}"
    screen:
      - pc[landscape]
    size: 75%
    header:
      items:
        - field[number]
        - field[state]
    page:
      - section:
          title: { fr: Client }
          items:
            - field[customer]
            - field[date]
      - field[lines]
      - field[discussion]
    footer:
      items:
        - field[total]
        - operation[invoice]

  # La saisie rapide
  # Le formulaire que le bouton d'ajout de la liste appelle, par add:.
  quick_entry:
    items:
      - field[customer]
      - field[lines]
```

Dans cet exemple, `record` est le formulaire par défaut et son nom
(D438, D788). Le titre est un gabarit (D449) qui surcharge le `title`
de l'entité (D465). `screen:` restreint le formulaire au poste
informatique en paysage (D450, D1613) ; `size:` le centre sur la pile
(D535, D533). L'entête, la page et le pied sont le `pages` implicite
(D509). La composition `lines` est rendue par la liste embarquée (D486).
Le fil `discussion` prend la place qu'on lui laisse (D485). L'acte
`invoice` est au pied (D511). `quick_entry` est le formulaire que la
liste appelle par `add:` (D530).

## `summary`

**Nom et famille.** `summary`, une surface : `gui: summary: <nom>:`
(le bloc, D437 ; le nom sous le bloc, D1639). Le premier résumé déclaré
est le défaut (D438). Mais « défaut : n'existe pas » (D201) : sans
déclaration, l'entité n'offre aucun résumé.

**Rôle.** L'enregistrement en bref, « petit par principe » (D201).
C'est le visage déployé d'une référence (D215) : la carte qui se montre
sans quitter le contexte.

**Types servis.** L'entité. L'appel vient d'ailleurs :

- de la référence 1-1 : « le 1-1 affiche le title ou l'image si elle
  est définie » (D537 ; le visage, D386), puis le résumé se déploie
  (D186, D215) ;
- du widget.

**Contexte consommé.** L'enregistrement, l'origine de l'appel,
l'utilisateur (D455) ; les droits (D196) ; la confidentialité.

**Propriétés.** Une configuration de formulaire restreinte (D201) :

- les champs sélectionnés ;
- la lecture seule et/ou la modification : le `mode` se pose au nœud
  (D461) ;
- `title:` (D449, D465) ;
- `size:`, la surimpression sur la pile, petite par principe (D535,
  D533) ;
- `screen:` (D450, D532).

**Items.** La restriction du formulaire :

- plusieurs sections possibles, « pour mêler des affichages
  horizontaux et verticaux » (D537) : l'organisateur `sections` et ses
  layouts (D489–D491), et les feuilles ;
- un kpi ou un chart, « à condition que son affichage reste modeste »
  (D538) : `chart[<nom>]` en items, la famille des adresses (D1639) ;
- une page unique, jamais d'onglets (D201, D537).

**Modes et déclinaisons.** L'appel depuis la référence (D215) : le 1-1
affiche le libellé, le résumé se déploie. La lecture seule et la
modification se mêlent (D201). Le responsive se fait au repli (D203).

**États et interactions.** Les droits décident du modifiable. La
fermeture rend à la surface précédente, la pile (D535).

**Décisions fondatrices.** D186, D196, D201, D203, D215, D243, D386,
D437–D438, D449–D450, D455, D461, D465, D489–D491, D532–D533, D535,
D537–D538, D1639.

**Exemple de configuration.** Le résumé d'un client, sur un exemple :

```yaml
# Le résumé du client : la carte qui se déploie depuis une référence
summary:

  # La carte du client
  # Petite par principe, centrée sur la pile : la photo à côté de l'identité, le solde en lecture seule, un kpi modeste.
  card:
    title: "{name}"
    size: 30%
    items:
      - sections:
          layout: row
          items:
            - section:
                items:
                  - field[photo]
            - section:
                items:
                  - field[name]
                  - field[phone]
      - field[balance]: { mode: read-only }
      - chart[orders_kpi]
```

Sans cette déclaration, le client n'aurait aucun résumé (D201). La
taille le garde petit et le centre (D201, D533). Les sections en ligne
mêlent l'horizontal et le vertical (D537) ; le solde en lecture seule
se mêle aux champs modifiables (D201) ; le kpi reste modeste (D538).
Depuis la commande, `field[customer]` affiche le `title` du client
(D465) ; le clic déploie ce résumé au-dessus de la pile (D215, D535).

## `widget`

**Nom et famille.** `widget`, une surface : `gui: widgets: <nom>:`. Le
widget est associé à une entité, et par construction à un module
fonctionnel (D247). « Défaut : n'existe pas » (D202).

**Rôle.** La petite surface autonome. Deux usages, une seule surface
(D1639) :

- la carte d'un enregistrement, pour la liste en widgets (D492) ;
- la synthèse : « compteurs, sommes/calculs, graphiques, tableaux de
  valeurs », avec le drill-down (D202).

**Types servis.** L'entité : l'enregistrement, pour la carte ; son
périmètre agrégé, pour la synthèse.

**Contexte consommé.** L'enregistrement, pour la carte, ou le
périmètre, pour la synthèse. La confidentialité est héritée de
l'entité, et surchargeable (D247). L'utilisateur, par le pool de
l'accueil (D204).

**Propriétés.** Le widget porte :

- `title:` (D449, D465) ;
- `size:`, la surimpression sur la pile (D535), à la grammaire commune
  (D533) ;
- `screen:` (D450, D532) ;
- une configuration de formulaire restreinte, dans l'esprit du résumé
  (D201) : petit par nature.

**Items.** Le widget contient :

- les sections et les feuilles, pour la carte (D492) ;
- les graphiques, `chart[<nom>]`, pour la synthèse (D243, D540) ;
- une page unique, jamais d'onglets, comme le résumé (D537).

**Modes et déclinaisons.** Le widget vit à quatre endroits :

- la liste en widgets, par `widget: <nom>` (D492) ;
- la page d'accueil, le pool : « l'utilisateur compose parmi les
  widgets de ses modules fonctionnels, sous sa confidentialité » (D204,
  D247) ;
- le tableau de bord (D249) ;
- l'évaluation suit les règles des champs calculés (D248) : l'écart de
  drill-down est assumé, l'alerte de périmètre aussi.

**États et interactions.** Le drill-down mène vers une liste à filtres
définis (D202, D242). Le clic sur la carte ouvre le formulaire de
l'enregistrement, comme le clic sur un point du nuage (D522). La
confidentialité masque.

**Décisions fondatrices.** D201–D202, D204, D242–D243, D247–D249,
D437–D438, D449–D450, D455, D465, D492, D522, D532–D533, D535,
D537–D538, D540, D1639.

**Exemple de configuration.** Dans le cas 3 (véhicule),
`03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/gui.yml` :

```yaml
# Les widgets
widgets:

  # La carte du véhicule
  # Le widget de la liste : la photo, l'identité, les deux chiffres clés.
  voiture:
    items:
      - sections:
          layout: row
          items:
            - section:
                items:
                  - field[photo]
            - section:
                items:
                  - field[nom]
                  - field[immatriculation]
                  - field[type]
                  - field[statut]
            - section:
                items:
                  - field[km_courant]
                  - field[prix_km]
```

Les autres propriétés, sur un exemple :

```yaml
# Les widgets de la commande : la carte d'un enregistrement, puis la synthèse du mois
widgets:

  # La carte de la commande
  # Le widget de la liste en cartes : le numéro et l'état à côté du total.
  card:
    items:
      - sections:
          layout: row
          items:
            - section:
                items:
                  - field[number]
                  - field[state]
            - section:
                items:
                  - field[total]

  # Le mois en cours
  # La synthèse, proposée au pool de l'accueil : le chiffre clé, puis la courbe.
  monthly:
    title: { fr: Le mois en cours }
    items:
      - chart[monthly_revenue]
      - chart[revenue_by_month]
```

`card` est la carte de l'enregistrement (D492). `monthly` est la
synthèse (D202), que l'utilisateur pioche au pool de l'accueil (D204) :
le kpi (D540), puis la courbe dont le clic mène à la liste (D202,
D242).

## `wizard`

**Nom et famille.** `wizard`, une surface : `gui: wizards: <nom>:`. Le
menu l'adresse par le `link:` d'une entrée, `[@wizard]` (D439, D1237).
Le premier wizard déclaré est le défaut (D438). Le wizard est séparé de
`tabs` (D552) : deux objets, une parenté visuelle assumée. Le
vocabulaire du parcours, `steps` et `step`, est tout entier chez lui.

**Rôle.** Le parcours guidé, « mono-utilisateur, une session » (D230) :
les étapes s'enchaînent, la transaction conclut. C'est la démarche au
sens large (D546) :

- créer un enregistrement ;
- modifier ou supprimer un ensemble répondant à une liste ;
- imprimer : les menus, par exemple, la semaine, puis la liste, puis la
  diffusion ;
- mettre à jour une tournée.

Le wizard orchestre les opérations de l'entité : les quatre de base,
`create`, `read`, `update` et `delete`, et les opérations enrichies
(D546).

**Types servis.** L'entité : l'enregistrement en construction, dans son
agrégat (D101).

**Contexte consommé.** L'enregistrement transitoire, l'origine de
l'appel, l'utilisateur (D455) ; les droits (D196).

**Propriétés.** Le wizard porte :

- `title:` (D449, D465) ;
- `size:`, optionnel : « sans valeur, ça prend l'espace disponible ; en
  cas d'appel depuis un menu, le wizard prend tout l'écran » (D549).
  Quand le wizard s'emboîte dans un formulaire, le nœud qui l'inclut
  surcharge sa taille (D548, D455) ; le plus proche l'emporte (D461) ;
  la grammaire est commune (D533) ;
- `breadcrumb: none | top | bottom`, le fil d'Ariane (D549). Par défaut
  `top`, les étapes visibles (D504) ; `none` le masque ;
- `screen:` (D450, D532).

Quatre principes gouvernent le wizard :

- les étapes sont des surfaces déclarées (D231) ;
- les transitions sont conditionnelles : « si client étranger → étape
  TVA » (D231, D90) ;
- la transaction est finale (D232, D101) : rien ne s'écrit avant la
  conclusion ; la relecture vient en clôture (D431) ;
- pas de brouillon : « le mode draft s'efface avec la possibilité de
  pré-exécuter une opération » (D547). Le niveau d'état déclaré reste
  l'affaire de l'entité (D233).

**Items.** Le wizard contient :

- un `header` et un `footer` optionnels (D548), comme ceux de `pages`
  (D507) : toujours visibles autour des étapes ;
- les étapes, `steps:` et `step:` (D546). Depuis la séparation (D552),
  le step n'est plus un tab.

Chaque étape porte :

- sa poignée, `title:` et `icon:`, qui dessine le chemin (D505) ;
- ses items : les sections et les feuilles, comme la page d'un
  formulaire ; et les graphiques, `chart[<nom>]`, kpi ou pivot,
  « l'aide à la décision » (D550) ;
- sa condition, `if:` (D1639) : la transition conditionnelle (D231,
  D90). L'étape est sautée si la condition ne tient pas ;
- son opération, `operation: <nom>` (D546, D1639) : « un step peut
  contenir une opération sur la validation ». Elle s'exécute au
  passage, dans la transaction du wizard tenue ouverte (D547, D594,
  D1607). Rien n'est scellé avant la validation définitive du wizard.

**Modes et déclinaisons.** Le wizard se présente ainsi :

- le stepper : toutes les étapes visibles ; l'avance au rythme de
  l'exploration ; « le chemin de traitement » navigable, le retour
  libre d'un clic (D505). C'est l'affaire du wizard seul ; la parenté
  visuelle avec les onglets est assumée (D552) ;
- le passage d'étape est un acte (D511) ;
- il est emboîtable : « rien n'empêche un formulaire qui inclut un
  wizard dans une page » (D455) ;
- le circuit de validation multi-acteurs reste hors wizard : c'est le
  patron d'assemblage états + opérations + notifications, sans moteur
  BPM (D233).

**États et interactions.** Trois règles :

- l'état est transitoire jusqu'à la transaction finale (D232, D101) ;
  la transaction est tenue ouverte au fil des étapes (D547, D594) :
  rien n'est scellé avant la validation définitive ;
- la confirmation validée barre le retour : le chemin navigable (D505)
  s'arrête au dernier step confirmé, le cliquet ;
- l'interruption emporte le transitoire (D547) : le brouillon est
  effacé.

**Décisions fondatrices.** D90, D101, D196, D230–D233, D431,
D438–D439, D449–D450, D455, D461, D465, D504–D505, D507, D511, D525,
D532–D533, D535, D540, D546–D550, D552, D594, D596, D1237, D1607,
D1639.

**Exemple de configuration.** La création guidée d'une commande, sur
un exemple :

```yaml
# Les wizards de la commande : la création guidée
wizards:

  # La nouvelle commande
  # L'étape de la TVA n'apparaît que pour un client étranger ; la relecture précède la transaction.
  new_order:
    title: { fr: Nouvelle commande }
    steps:
      - step:
          title: { fr: Client }
          items:
            - field[customer]
      - step:
          title: { fr: TVA }
          if: customer.country != "FR"
          items:
            - field[vat_number]
      - step:
          title: { fr: Lignes }
          items:
            - field[lines]
    commit: confirm
```

Le menu adresse ce wizard par `sales.order[@new_order]` (D439, D1237).
Le `if:` de la deuxième étape est la transition conditionnelle (D231,
D90). `commit: confirm` demande la relecture, puis la transaction est
scellée (D232, D596).

L'impression guidée, sur un second exemple :

```yaml
# Les wizards du menu de la semaine : l'impression guidée
wizards:

  # L'impression de la semaine
  # La semaine, puis les menus, puis la diffusion ; l'opération s'exécute à la validation de la dernière étape.
  print_week:
    steps:
      - step:
          title: { fr: Semaine }
          items:
            - field[week]
      - step:
          title: { fr: Menus }
          items:
            - field[menus]
      - step:
          title: { fr: Diffusion }
          items:
            - field[channel]
          operation: print_menus
```

C'est la démarche au sens large (D546) : `operation: print_menus`
s'exécute à la validation de la dernière étape.

## `dashboard`

**Nom et famille.** `dashboard`, une surface au module : il se déclare
dans `module.yml`, au bloc `gui:`, sous `dashboards:` (D1639). Le menu
l'adresse en valeur de `link:`, `module[dashboard]` (D439, D1237). Le
premier déclaré est le défaut (D438).

**Rôle.** Le tableau de bord : la vue d'ensemble du module, les widgets
et les graphiques de ses entités, assemblés.

**Types servis.** Le module : ses entités, au travers de leurs widgets
et de leurs charts, chacun sous sa confidentialité (D247).

**Contexte consommé.** L'utilisateur : ses droits et sa
confidentialité, chaque widget filtrant de lui-même. Le module.

**Propriétés.** Le tableau de bord porte :

- `title:` (D449, D465) ;
- `size:`, sur la pile (D535) ; depuis le menu, tout l'écran, comme le
  wizard (D549) ;
- `screen:` (D450, D532) ;
- `refresh:`, le rafraîchissement, aux trois modes de D249 : `static`,
  `live`, `every[5min]` (D1639). Les durées suivent la grammaire
  commune (D434, D476). Un widget peut surcharger le mode, à la
  cascade (D461).

**Items.** Le squelette (D555) :

- les widgets contraints, `widget[<entité>.<nom>]`, la famille des
  adresses, `widget[order.monthly]` par exemple : fixés, non retirables
  (D1639) ;
- les emplacements libres, l'item `_`, répétable (D556). Le nom `_`
  évite la collision : « free pouvant être lui-même un nom de widget ».
  L'icône du choix y apparaît : l'utilisateur pioche parmi les widgets
  disponibles, son catalogue propre, le pool (D247), ou libère un
  autre emplacement (D556) ;
- les graphiques directs, `chart[<nom>]` (D243, D540) ;
- les `sections` et leurs layouts, pour la disposition (D489–D491).

Le contenu s'écrit sous `items:` sur une page unique, et sous `page:`
dès qu'un `header` ou un `footer` entre : c'est le raccourci du
formulaire (D1594, D1595).

**Modes et déclinaisons.** Le même objet, deux auteurs (D554) :

- le concepteur déclare le panel : les tableaux de bord du module, que
  le menu et l'accueil pointent ;
- l'utilisateur compose le sien : la page d'accueil est un tableau de
  bord personnel, pioché dans le pool des widgets de ses modules, sous
  sa confidentialité (D204, D247, D191). C'est le cas limite du
  squelette entièrement libre (D555).

La page d'accueil pointe une liste, un tableau de bord ou une page vide
(D558). Le tableau de bord suit le module activé : le changement de
module change le tableau de bord (D557). Le responsive se fait au repli
(D203).

**États et interactions.** Le drill-down de chaque widget (D202, D242).
La confidentialité masque widget par widget (D247). Le rafraîchissement
vit selon son mode (D249). L'emplacement interchangeable porte son
icône : le choix, le remplacement, la libération (D556).

**Décisions fondatrices.** D191, D202–D204, D242–D243, D247–D249,
D434, D438–D439, D449–D450, D455, D461, D465, D476, D489–D491, D532,
D535, D540, D549, D554–D558, D1237, D1594–D1595, D1639.

**Exemple de configuration.** Dans le cas 5 (entrepôt),
`05_entrepot/versions/beta/v1.0.0.1/stock/stock.yml` :

```yaml
# L'interface du module
# Le seul tableau de bord du cas : la preuve que l'entrepôt sert une fois rempli — les indicateurs du stock et la
# matrice de contrôle. Le menu l'adresse stock[pilotage] ; le premier tableau de bord déclaré est celui par défaut.
gui:
  dashboards:

    # Le pilotage des stocks
    # Rafraîchi toutes les heures : les données changent la nuit, après la migration, l'heure rassure. Les graphiques
    # sont adressés chart[<entité>.<nom>], en flux entre guillemets ; l'emplacement libre `_` est le pool de l'usager.
    pilotage:
      title: Le pilotage des stocks
      refresh: every[1h]
      page:
        - sections:
            layout: row
            items:
              - section: { items: [ 'chart[niveau.valeur_stock]' ] }
              - section: { items: [ 'chart[niveau.sous_minimum]' ] }
              - section: { items: [ 'chart[niveau.perimes]' ] }
        - chart[mouvement.par_mois]
        - chart[mouvement.controle]
        - _
```

## `template`

**Nom et famille.** `template`, une surface : `gui: templates: <nom>:`
(D456). Le premier déclaré est le défaut (D438).

**Rôle.** Le patron du document généré : « un formulaire en lecture
seule + une dimension de page » (D250). La facture, le devis,
l'étiquette, le bon de livraison. Il vise quatre destinations :
« Word, PDF, Excel ou un mail » (D564).

**Types servis.** L'entité : l'enregistrement dans son agrégat. Quatre
portes mènent au template :

- l'effet `document:` d'une opération (D432) ;
- le viewer à la volée, `template[<nom>]` (D483) : « le fichier qui
  n'existe pas » ;
- les exports de la liste, `exports: [ pdf[…] ]` (D530, D1601) ;
- l'impression directe du serveur (D252) : les imprimantes de l'OS,
  pour l'étiquette.

**Contexte consommé.** Le template lit :

- l'enregistrement ;
- les variables de contexte, l'entité « contexte » (D254) : la
  pagination, l'opérateur, l'instance, des champs comme les autres ;
- la langue : « la déclinaison par langue se porte sur chaque item »
  (D559, qui amende la lecture de D253). Un seul gabarit, ses items
  déclinés par la mécanique des libellés (D465).

**Propriétés.** Le formalisme est celui des formulaires (D250) :

- `title:`, le gabarit (D449) ;
- le `pages` implicite (D509) ;
- `paper:`, la dimension de page (D1614, D1639) : `A4`, le portrait ;
  `A4[landscape]`, l'orientation au crochet, comme pour les formats
  d'écran ; `105x48mm`, pour l'étiquette ;
- `margin:`, « les marges en mm » (D559) ;
- `format:`, « le format de destination » (D564, D565) : `pdf`, le
  défaut (D212, D250), `word`, `excel` ou `mail`. Le mail porte le
  publipostage (D562) ; l'Excel, le modèle (D445). Le format est
  « étendu à d'autres formats en fonction des besoins à venir »
  (D565), par la ligne des hooks (D408) ;
- les titres, à quatre niveaux (D250).

**Items.** Le `pages` implicite :

- `header` et `footer`, répétés à chaque page (D507, D1636) ;
- les `page`, une ou plusieurs, et leurs sections ;
- les feuilles, avec leurs pendants PDF (D257) : « un pendant PDF par
  type », l'image dimensionnée au bloc, le fil complet s'il est
  inclus… ;
- le contenu fixe, `paragraph` et `picture` (D488) ;
- `qrcode` et `barcode`, pour l'étiquette (D542–D545) ;
- les graphiques, en image (D257).

**Modes et déclinaisons.** Le PDF d'abord (D212). Jamais
d'interaction : le papier n'agit pas (D511). Le viewer le feuillette à
l'écran (D481, D483).

**États et interactions.** La lecture seule, par nature (D250). La
confidentialité s'applique au rendu : les champs masqués
n'apparaissent pas.

**Décisions fondatrices.** D212, D250–D254, D257, D408, D432, D438,
D440, D445, D449, D456, D481, D483, D486, D488, D507, D509, D511, D530,
D542–D545, D559, D562, D564–D565, D1601, D1614, D1625, D1636, D1639.

**Exemple de configuration.** La facture et l'étiquette d'une
commande, sur un exemple :

```yaml
# Les templates de la commande : la facture, puis l'étiquette
templates:

  # La facture
  # Une page A4 aux marges de 15 mm. L'entête porte le logo et le numéro en QR code ; le pied, répété à chaque page,
  # porte le total ; la page, le client, les lignes et le texte légal.
  invoice:
    title: "Facture {number}"
    paper: A4
    margin: 15mm
    header:
      height: 40mm
      items:
        - picture: logo
        - field[number]: { component: qrcode, size: 25mm }
    page:
      - field[customer]
      - field[lines]
      - paragraph: { label: legal }
    footer:
      height: 15mm
      items:
        - field[total]

  # L'étiquette
  # Le code article en QR code, puis le nom.
  label:
    paper: 105x48mm
    items:
      - field[sku]: { component: qrcode, size: 30mm }
      - field[name]
```

L'effet `document: invoice` d'une opération appelle la facture (D432) ;
`template[invoice]` la feuillette à l'écran (D483). `paper:` donne la
dimension de page (D250, D1639) et `margin:` les marges (D559). Le logo
est une image fixe (D488), citée par l'identifiant d'une ressource
(D1625). Le numéro se rend en QR code, à la taille donnée (D543). La
composition `lines` devient un tableau (D486). Le texte légal est un
paragraphe fixe, pris au dictionnaire (D440, D488). Le pied se répète
à chaque page (D507). L'étiquette est le cas de l'impression directe
(D252).

## `chat`

**Nom et famille.** `chat`, une surface au socle : l'écran du module
`_chat`, fourni par Syncytium comme `_migration` (D666) et
`_administration` (D710). Le menu l'adresse en valeur de `link:`,
`_chat[main]` (D439, D1237). Le préfixe `_` marque les modules internes
(D1029).

**Rôle.** La question en langue naturelle à la somme des connaissances
de l'instance : les données et leur description. La réponse vient d'un
modèle de langage, déclaré en connecteur `llm`.

**Types servis.** La session d'échanges, `_chat.session` (D959) : un
utilisateur, un module, ses messages. Le fil des messages est rendu par
le composant `thread` (D295) : la question de l'utilisateur, la réponse
du modèle.

**Contexte consommé.** Le chat lit :

- l'utilisateur et ses droits (D886), la confidentialité (D885),
  l'audience. Le modèle ne lit l'instance que par l'API, au porteur de
  l'utilisateur, ou par la librairie interne des hooks de fonctions,
  « dans la limite des autorisations accordées à l'utilisateur sur la
  consultation des données » ;
- le module activé : la session lui est adossée ; son mode d'emploi et
  ses données bornent le contexte (D959) ;
- le connecteur `llm` de l'environnement (D617).

**Propriétés.** `title:` (D449, D465) ; `screen:` (D450, D532) ;
`connector:`, le rôle nommé du connecteur `llm` (D617, D1639).

**Items.** Aucun. La surface est le fil et sa saisie.

**Modes et déclinaisons.** Le chat se décline ainsi :

- sur le poste informatique et la tablette, le fil avec la saisie en
  bas (D295) ;
- sur le smartphone, le fil en plein écran ;
- le chat suit le module activé, comme le tableau de bord (D557) : deux
  modules accessibles font deux sessions, chacune avec son historique
  et son contexte (D959) ;
- en template, sans objet.

**États et interactions.** Cinq règles :

- la question part après l'anonymisation des champs `personal` (D695,
  D696 ; D960) de tout le contexte transmis. Font exception les données
  du profil connecté, et ce que les droits de l'utilisateur sur les
  composantes de la description lui ouvrent. Le chat n'a aucun droit
  propre ;
- la session dure, sans rétention, « aussi longtemps que possible et
  jusqu'à ce que l'utilisateur demande sa réinitialisation » (D960).
  L'acte **réinitialiser** porte sur la session : c'est la suppression
  du socle, qui désactive (D137). La session close reste à l'analyse ;
  une nouvelle s'ouvre (D1639) ;
- chaque question et chaque réponse s'écrivent, avant l'affichage,
  dans `_chat.session` et `_chat.message`, qui sont historisées (D411).
  L'événement va au journal de sécurité (D925) ;
- le connecteur indisponible : « un message d'erreur sera présenté et
  les questions ne seront pas possibles » (D626, D959). La saisie est
  fermée, l'historique reste lisible ;
- le chat répond et fournit les données, il ne met rien à jour (D958) :
  « les mises à jour se feront via les interfaces proposées par
  l'application ». La réponse porte les liens vers les surfaces de
  mise à jour, le formulaire ou l'acte (D439, D483). L'utilisateur y
  agit sous ses propres droits.

**Décisions fondatrices.** D137, D295, D411, D439, D449–D450, D465,
D532, D557, D617, D626, D666, D695–D696, D710, D885–D886, D902,
D917–D918, D925, D944, D957–D960, D1029, D1237, D1639.

**Exemple de configuration.** Le module `_chat` est au socle : rien à
déclarer chez le client, sinon le connecteur `llm` de l'environnement,
dans `connectors.yml` (D617) :

```yaml
# Le connecteur du modèle de langage : le rôle que le chat nomme par connector:
assistant:
  type: llm
  parameters:
    provider: …
    model: …
    api_key*: ${LLM_API_KEY}
```

La marque `*` sur `api_key` dit le secret, chiffré (D944, D902).
