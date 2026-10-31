# Les surfaces

## `menu`

1. **Nom et famille** — `menu`, une surface (D1604) — la porte de
   chaque module : **un menu par module fonctionnel, hiérarchique**
   (D193) ; écrit dans `menu.yml`, référencé par le module, facultatif
   (D351) — le fichier et sa grammaire sont au chapitre de la
   configuration ([version.md](../01-configuration/version.md)) ;
2. **Rôle** — conduire l'utilisateur à une surface : **une carte
   d'entrées nommées, dans l'ordre d'affichage** (D1237) ; le logo mène
   à la page d'accueil (D193) ;
3. **Types servis** — aucun : le menu adresse des surfaces, il ne rend
   aucun champ ;
4. **Contexte consommé** — l'utilisateur, ses droits et la
   confidentialité : **une entité invisible rend invisibles toutes ses
   entrées** (D193) ;
5. **Propriétés** — par entrée, **`label:`** par langue — sans lui,
   le titre de la surface liée — et **`link:`**, l'adresse logique
   (D1237, D439) : `<module>.<entité>` (la liste par défaut),
   `<module>.<entité>[<liste>]`, `<module>.<entité>.<opération>`,
   `<module>.<entité>[+<formulaire>]`, `<module>.<entité>[@<wizard>]`,
   `<module>[<dashboard>]` ; **l'icône vient de la surface visée**
   (D439) ; **une entité peut avoir plusieurs entrées**, chacune vers
   une de ses listes (D189) ; **le défaut sans `menu.yml`** : les entités agrégats du
   module, leurs enfants et leurs associations en lien multiple en
   sous-menu, chaque entrée vers la liste de l'entité (D193, D186) ;
6. **Items** — des entrées et des sous-menus : **un sous-menu porte
   `label:` et `items:`, la carte de ses entrées** (D1237) ; trois
   niveaux au plus — le module, les entités parents, les enfants et
   les liaisons (D192) ; **l'entrée d'une composition ouvre la liste
   de l'enfant, tous possesseurs confondus** (D1227) ;
7. **Modes et déclinaisons** — à l'écran, le bandeau haut des menus et
   des sous-menus, le bandeau gauche du choix du module quand il y en a
   plusieurs (D191) ; depuis le menu, le wizard prend tout l'écran
   (D549) ; la déclinaison au smartphone et à la tablette n'est pas
   encore décidée ;
8. **États et interactions** — l'entrée masquée par la
   confidentialité (D193) ; le clic ouvre la surface adressée ;
9. **Décisions fondatrices** — D186, D189, D191–D194, D351, D439, D549,
   D1227, D1237 ; **la documentation suit le menu** (D1194) : chaque
   entrée est une section de la documentation fonctionnelle — une
   liste décrite par une entrée a sa section, une entité hors du menu
   n'est pas décrite (D1195, D1229) ;
10. **Exemple de configuration** — le menu de la banque (le cas 4),
    son accueil et son sous-menu des écritures :

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

1. **Nom et famille** — `list`, une surface — **le même composant que
   la feuille** (D486 : « un seul list ») ; ici son visage déclaré :
   `gui: lists: <nom>:` — **la première déclarée est la surface par
   défaut** (D438), le menu l'adresse en valeur de `link:`
   (`sales.order[pending]` — D439, D1237) ;
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
   colonne, à cascades, les signes — D442) ; `searchable:` (les
   champs ou les noms mutualisés, chacun cherchable au modèle — par
   défaut, les colonnes affichées — ou les champs du widget — qui
   portent `searchable:`, D1308, D1596 ; un critère nommé sans `searchable:`
   est une erreur d'ingestion, D1598 ; **le possesseur d'une
   composition** : ouverte depuis lui, la liste de ses éléments le tient
   du contexte ; la liste de tous les éléments, sans distinction de
   possesseur, peut proposer un filtre sur lui par sa définition, en
   recherche stricte ou sous l'une des autres formes, D782, D1599) ; `editable:`
   (**défaut : tout readonly** — D442) ; `selection: 1 | 1..`
   (D445–D446) ; `sizable: none | auto | manual | auto+manual`
   (D447) ; **`add:` / `update:` / `delete:`** — « le
   formulaire/widget à appeler » pour chaque geste (D530 — les
   défauts : le formulaire par défaut D438, les gestes D446) ;
   **`exports:`** — « les différents exports ou générations de
   documents » (D530) — **la forme courte, `<format>` ou
   `<format>[<modèle>]`** (D1601) : le format, `csv`, `pdf`, `word`
   (D1602), `excel`, `ods`, `mail`… ; le crochet nomme le modèle qui génère le document,
   sans crochet le modèle de base de la liste (D792) ; `csv` exporte
   par défaut les colonnes affichées, et les colonnes d'un export
   déclaré portent leur longueur (D213) ; le format est
   un storage de format (D636) ou une destination du gabarit (D564),
   sinon une erreur d'ingestion ; derrière la forme courte, `export`
   ou `generate` s'exécute et ses événements suivent (D1603) ;
   `generate()` sert les opérations, pas cette propriété :
   `exports: [ csv, excel[stock.xlsx], pdf[order_sheet] ]` ;
   **`actions:`** — la liste d'opérations (D531) : **l'opération
   porte son icône à la déclaration, la liste la surcharge** au
   besoin ; **`size:`** — « la zone de couverture de l'écran »
   (D532) ; **la grammaire** (D533, vaut partout — D484) :
   `size: 75%` — la part de l'écran, **centrée** ; `size: 90% 50%` —
   la largeur puis la hauteur ; `size: 1000px 320px` — les pixels ; **`screen:`** — « le support sur
   lequel la liste a été définie et/ou autorisée à s'afficher »
   (D532/D450) — `<format>[<orientation>]`, tous les formats en son
   absence (D1613) ; `title:` (D493) ;
6. **Items** — aucun à déclarer : **l'anatomie est celle d'un
   `pages`** (D531 — intrinsèque) ;
7. **Modes et déclinaisons** — **« une liste est comme pages »**
   (D531) : **le header** — le titre, les colonnes (le tabulaire ;
   « non visibles sur les widgets, sauf pour assurer les tris » ; une
   colonne étroite prend l'`abbreviation:` du champ — D1622), les
   filtres, **l'icône-menu des exports**, les icônes de l'ajout, de
   la modification, de la suppression, **étendues aux actions à
   icône** ; **la zone page** — le contenu du tableau ; **le
   footer** — le sous-total ou un gabarit (`{count}` — D1639), **les boutons des actions sans icône** ; le tableau
   ou les widgets (D492) ; **le filtrage vivant** — la liste
   s'auto-rafraîchit sans bouton (D226–D229/D444) ; **la recherche
   texte globale** ne porte que sur les champs qui ont `searchable:` —
   sans eux, aucune recherche (D198, D1632) ; **le paramétrage par
   l'utilisateur** : le choix et l'ordre des colonnes se règlent à son
   profil, ou se publient au groupe par un `manager` ou un
   `administrator` (D198, D1632) ; **la pagination
   au curseur opaque** avec les indicateurs ; l'embarquée d'une
   composition ou d'une association (D486) ; le responsive au repli
   (Q48) ; **selon l'écran** : sur smartphone, un tableau pour les
   petites listes, des widgets pour les grandes — une colonne en
   portrait, deux en paysage ; sur tablette et poste informatique,
   tableaux ou widgets sur plusieurs colonnes — une recommandation au
   concepteur, qui déclare une liste par écran avec `screen:` (D290,
   D1613, D1634) ; **les filtres** toujours affichés sur un
   poste informatique, derrière une icône sur un smartphone, et sur une
   tablette au choix du composant selon la place disponible (D290,
   D1633) ;
8. **États et interactions** — **la création : le bouton compris dans
   le cadre** — le formulaire d'`add:` (D530) ; **la modification au
   double-clic** — celui d'`update:` ; la lecture seule → la
   consultation ; **la suppression** : une ligne = le formulaire de
   `delete:` en lecture seule + la confirmation, plusieurs = **la
   double validation** — le nombre et la synthèse des suppressions,
   puis la confirmation (D197, D446/D530) ; **la modification en
   masse** : un parcours séquentiel — valider, passer au suivant —,
   interruptible à tout moment (D197) ; **l'opération de masse** sur les lignes
   sélectionnées (D446) ; les opérations en colonne à trois états
   (D444) ;
9. **Décisions fondatrices** — D189, D197–D198, D213, D226–D229, D290, D437–D448, D450, D462,
   D466–D467, D484, D486, D492–D493, D530–D533 ;
10. **Exemple de configuration** —

Dans le cas 4 (banque), `04_banque/versions/beta/v1.0.0.0/banque/ecriture/gui.yml` :

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
    filter: state in ["draft", "confirmed"]
    sort: { date: -, number: + }   # les cascades (D442)
    editable: [notes]              # le reste readonly (D442)
    selection: 1..                 # la multi-sélection (D446)
    sizable: auto+manual           # (D447)
    add: quick_entry               # le formulaire du bouton + (D530)
    update: record                 # celui du double-clic — le défaut sinon (D438, D788)
    exports:                       # (D530, D1601)
      - csv
      - excel[orders.xlsx]
      - pdf[order_sheet]
    actions: [ invoice, cancel ]   # les opérations — l'icône au header, sinon
                                   # le bouton du pied (D531)

  cards:                           # le second visage (D492)
    widget: card                   # chaque enregistrement rendu par son widget
    filter: state in ["draft", "confirmed"]

# et le menu l'adresse, en valeur de link: (D439, D1237) : sales.order[pending]
```

## `form`

1. **Nom et famille** — `form`, une surface — `gui: forms: <nom>:` ;
   **la première déclarée est le formulaire par défaut** (D438) ; sans
   déclaration, **le formulaire du socle suit les groupes de champs de
   l'entité** (D1273, D1279 — les groupes dans `fields:`, entity.md) : un onglet par groupe, les
   champs hors groupe en en-tête au-dessus de tous les onglets ; sans
   `groups:`, pas d'onglet ;
   adressé par le menu (le `link:` d'une entrée, `[+form]` — D439,
   D1237), appelé par la liste
   (`add:`/`update:`/`delete:` — D530), par une opération (la
   relecture `commit: confirm` — D431/D596) ;
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
   utilisable et surchargeable (D465) ; **`screen:`** — les formats
   sur lesquels la surface s'affiche, un ou plusieurs (D450/D532),
   écrits **`<format>[<orientation>]`** — les formats `pc`, `tablet`,
   `smartphone`, les orientations `landscape` et `portrait` :
   `pc[landscape]`, `pc[portrait]`, `pc` — sans orientation, toutes
   les orientations (D1614) ;
   **sans `screen:`, tous les formats et toutes les orientations**
   (D1613) ; **une surface par écran** : Syncytium déduit le format de
   la zone d'affichage disponible, et un changement de taille fait
   basculer l'application d'un format à l'autre — les composants se
   déclinent d'eux-mêmes (D200/D250, D1613) ; à la bascule, un lien
   vers une surface que le nouveau format n'autorise pas ouvre la
   première surface déclarée du même genre qui l'autorise (D438) ; un
   format qu'aucune surface d'un genre n'autorise est une **erreur
   d'ingestion** (D1614), parmi les formats que la version porte —
   `version: { screen: [ pc, tablet ] }` dans les settings, tous les
   formats en son absence (D1616) ; une surface qui déclare un format
   que la version ne porte pas est une erreur d'ingestion ; ouverte sur
   un format qu'elle ne porte pas, l'application affiche
   « l'application n'est pas disponible sur ce support » (D1617) ;
   **`mode:`** — `read-only | updatable` (D453) ; **`history:`** —
   `false` désactive l'onglet historique d'une entité historisée
   (D453) ; **`size:`** — la surimpression, défaut 100 % de
   l'écran (D454 amendé par **D535 : toute surface s'ouvre au-dessus
   de la pile des actions antécédentes cumulées** — size pour toutes
   les surfaces, le couple D484 restant au grain du champ ; la
   grammaire D533 : une ou deux valeurs, % ou px) ;
6. **Items** — **le `pages` implicite** (D509) : `header`, `page`(s),
   `footer` — les clés à l'usuel, **la liste d'éléments au
   multi-pages** (D510) ; **le raccourci de la page unique** (D1594) :
   sans entête, sans pied et sur une seule page, le formulaire écrit
   son contenu sous `items:` — `page:` s'impose dès qu'un `header`, un
   `footer` ou une seconde page entre ; dans les pages : les sections seules
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
   l'historique (l'onglet — D453) ; **jamais de popup du navigateur**,
   la boîte de dialogue de l'application assumée (D196, D1605) ; la
   relecture d'opération (D431 — lecture seule + confirmer/annuler) ;
   le responsive au repli (D203) ;
8. **États et interactions** — les droits déterminent l'usage offert
   (D196) ; le refus de validation affiché au champ (D307) ; le
   `title` en tête, vivant avec l'enregistrement ;
9. **Décisions fondatrices** — D101, D111, D154, D196, D199, D203,
   D307, D437–D438, D446, D449–D455, D460, D465, D483, D509–D511,
   D530, D533–D535 ;
10. **Exemple de configuration** —

Dans le cas 4 (banque), `04_banque/versions/beta/v1.0.0.0/banque/ecriture/gui.yml` :

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

Les autres propriétés, sur un exemple :

```yaml
# sales/entities/order.yml, bloc gui
forms:
  record:                           # la première déclarée = le défaut (D438) ; record, le nom (D788)
    title: "{number} — {customer}"  # le gabarit (D449) — le title de l'entité surchargé (D465)
    screen:                         # les formats autorisés (D450/D1613)
      - pc[landscape]
    size: 75%                       # la surimpression centrée sur la pile (D535/D533)
    header:
      items:
        - field[number]
        - field[state]
    page:                           # le pages implicite (D509)
      - section:
          title: { fr: Client }
          items:
            - field[customer]
            - field[date]
      - field[lines]                # la composition — la liste embarquée (D486)
      - field[discussion]           # le fil prend la place qu'on lui laisse (D485)
    footer:
      items:                        # l'acte au pied (D511)
        - field[total]
        - operation[invoice]

  quick_entry:                      # le formulaire d'add: de la liste (D530)
    page:
      - field[customer]
      - field[lines]
```

## `summary`

1. **Nom et famille** — `summary`, une surface — `gui: summary:
   <nom>:` (le bloc, D437 ; le nom sous le bloc, D1639) ; la première déclarée = le
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
   items, la famille des adresses — D1639) ; **l'unique
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
summary:
  card:                            # sans déclaration : aucun résumé (D201)
    title: "{name}"
    size: 30%                      # petit par principe (D201), centré (D533)
    page:
      - sections:
          layout: row              # l'horizontal et le vertical mêlés (D537)
          items:
            - section:
                items:
                  - field[photo]
            - section:
                items:
                  - field[name]
                  - field[phone]
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
   surface** (D1639) : **la carte d'un
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

Dans le cas 3 (véhicule), `03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/gui.yml` :

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
# sales/entities/order.yml, bloc gui
widgets:
  card:                            # la carte de l'enregistrement (D492)
    page:
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

  monthly:                         # la synthèse (D202) — le pool de l'accueil (D204)
    title: { fr: Le mois en cours }
    page:
      - chart[monthly_revenue]     # le kpi (D540)
      - chart[revenue_by_month]    # la courbe — le drill vers la liste (D202/D242)
```

## `wizard`

1. **Nom et famille** — `wizard`, une surface — `gui: wizards:
   <nom>:` ; le menu l'adresse (le `link:` d'une entrée,
   `[@wizard]` — D439, D1237) ; la première
   déclarée = le défaut (D438) ; **séparé de `tabs`**
   (D552 — « je valide la séparation ») : deux objets, une parenté
   visuelle assumée — le vocabulaire du parcours (steps/step) tout
   entier chez lui ;
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
   **les étapes : `steps:`/`step:`** (D546, le couple acté ; la
   séparation D552 — le step n'est plus un tab) : chaque étape porte sa poignée (`title:`/`icon:` —
   le chemin D505), ses items (les sections, les feuilles — la page
   d'un formulaire — **et les graphiques : `chart[<nom>]`, kpi,
   pivot, « l'aide à la décision »**, D550), sa condition (D1639 : **`if:`** — la
   transition conditionnelle D231/D90, l'étape sautée si la condition
   ne tient pas), et **son opération** — « un step peut contenir une
   opération sur la validation » (D546 — `operation: <nom>`,
   D1639) : **exécutée au passage, dans la transaction
   du wizard tenue ouverte** (D547, D594, D1607), **rien n'étant scellé
   avant la validation définitive du wizard** ;
7. **Modes et déclinaisons** — **le stepper** : toutes les étapes
   visibles, **l'avance au rythme de l'exploration**, « le chemin de
   traitement » navigable — le retour libre d'un clic (D505 —
   désormais l'affaire du wizard seul ; la parenté visuelle avec les
   onglets assumée, D552) ; **le passage d'étape =
   un acte** (D511) ; emboîtable — « rien n'empêche un formulaire
   qui inclut un wizard dans une page » (D455) ; le circuit de
   validation multi-acteurs reste **hors wizard** — le patron
   d'assemblage états + opérations + notifications, sans moteur BPM
   (D233) ;
8. **États et interactions** — **l'état transitoire** jusqu'à la
   transaction finale (D232/D101) — **la transaction tenue ouverte au
   fil des étapes** (D547, D594) : rien n'est scellé avant la
   validation définitive ;
   **la confirmation validée barre le retour** — le chemin navigable
   (D505) s'arrête au dernier step confirmé (le cliquet) ;
   l'interruption emporte le transitoire (D547 — le draft effacé) ;
9. **Décisions fondatrices** — D90, D101, D196, D230–D233, D431,
   D438–D439, D449–D450, D455, D465, D505, D507, D511, D525,
   D532–D533, D535, D540, D546–D550, D552 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/order.yml, bloc gui
wizards:
  new_order:                       # le link: du menu : sales.order[@new_order] (D439, D1237)
    title: { fr: Nouvelle commande }
    steps:
      - step:
          title: { fr: Client }
          items:
            - field[customer]
      - step:
          title: { fr: TVA }
          if: customer.country != "FR"   # la transition conditionnelle (D231/D90)
          items:
            - field[vat_number]
      - step:
          title: { fr: Lignes }
          items:
            - field[lines]
    commit: confirm                # la relecture, puis la transaction scellée (D232/D596)

# catering/entities/menu.yml — l'impression guidée (D546)
wizards:
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
          operation: print_menus   # l'opération à la validation du step (D546)
```

## `dashboard`

1. **Nom et famille** — `dashboard`, une surface — **au module** :
   `module.yml`, bloc gui (`dashboards:` — D1639) ; le menu l'adresse, en valeur de `link:` —
   `module[dashboard]` (D439, D1237) ;
   la première déclarée = le défaut (D438) ;
2. **Rôle** — le tableau de bord : **la vue d'ensemble du module** —
   les widgets et les graphiques de ses entités, assemblés ;
3. **Types servis** — le module — ses entités au travers de leurs
   widgets et charts (chacun sous sa confidentialité — D247) ;
4. **Contexte consommé** — l'utilisateur (ses droits, sa
   confidentialité — chaque widget filtre de lui-même), le module ;
5. **Propriétés** — `title:` (D449/D465) ; `size:` (la pile D535 —
   tout l'écran depuis le menu, l'esprit D549) ; `screen:`
   (D450/D532) ; **le rafraîchissement** — les trois modes de D249
   (`refresh: static | live | every[5min]` — les durées D434/D476 ;
   surchargeable au widget, la cascade D461 ; D1639) ;
6. **Items** — **le squelette** (D555) : **les widgets contraints**
   (`widget[<entité>.<nom>]` — la famille des adresses,
   `widget[order.monthly]` — fixés, non retirables ; D1639) et
   **les emplacements libres** — l'item **`_`** (D556, acté — « free
   pouvant être lui-même un nom de widget », la collision évitée),
   répétable : **l'icône du choix** y apparaît, l'utilisateur pioche
   parmi les widgets disponibles — son catalogue propre (le pool
   D247) ou la libération d'un autre emplacement (D556) ; les graphiques
   directs (`chart[<nom>]` — D243/D540) ; les `sections` et leurs
   layouts pour la disposition (D489–D491) ; le contenu sous `items:`
   sur une page unique, sous `page:` dès qu'un `header` ou un `footer` entre —
   le raccourci du formulaire (D1594–D1595) ;
7. **Modes et déclinaisons** — **le même objet, deux auteurs**
   (D554) : **le concepteur déclare le panel** (les dashboards du
   module — le menu, l'accueil pointé) ; **l'utilisateur compose le
   sien** — la page d'accueil = un dashboard personnel, pioché dans
   le pool des widgets de ses modules, sous sa confidentialité
   (D204/D247/D191) — **le cas limite du squelette entièrement
   libre** (D555) ; **la homepage pointe une liste, un dashboard ou une
   page vide** (D558) — le dashboard suivant le module activé
   (D557 : le changement de module change le tableau de bord) ; le responsive au repli (D203) ;
8. **États et interactions** — **le drill-down** de chaque widget
   (D202/D242) ; la confidentialité masque widget par widget (D247) ;
   le rafraîchissement vit selon son mode (D249) ; **l'emplacement
   interchangeable porte son icône** — le choix, le remplacement, la
   libération (D556) ;
9. **Décisions fondatrices** — D191, D202–D204, D242–D243,
   D247–D249, D434, D438–D439, D449–D450, D455, D461, D465, D532,
   D535, D540, D554–D558 ;
10. **Exemple de configuration** —

Dans le cas 5 (entrepôt), `05_entrepot/versions/beta/v1.0.0.1/stock/stock.yml` :

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

1. **Nom et famille** — `template`, une surface — `gui: templates:
   <nom>:` (l'ajout de l'auteur au catalogue — D456) ; la première
   déclarée = le défaut (D438) ;
2. **Rôle** — **le patron du document généré** : « un formulaire en
   lecture seule + une dimension de page » (D250) — la facture, le
   devis, l'étiquette, le bon de livraison — **vers quatre
   destinations : « Word, PDF, Excel ou un mail »** (D564) ;
3. **Types servis** — l'entité — l'enregistrement dans son agrégat ;
   **les quatre portes** : l'effet `document:` d'une opération
   (D432), le viewer à la volée (`template[<nom>]` — D483, « le
   fichier qui n'existe pas »), les exports de la liste
   (`exports: [ pdf[…] ]` — D530, D1601), **l'impression directe du
   serveur** (D252 — les imprimantes de l'OS, l'étiquette) ;
4. **Contexte consommé** — l'enregistrement ; **les variables de
   contexte = l'entité « contexte »** (D254 — la pagination,
   l'opérateur, l'instance : des champs comme les autres) ; la
   langue — **« la déclinaison par langue se porte sur chaque item »**
   (D559, amende la lecture de D253) : un seul gabarit, ses items
   déclinés (la mécanique D465) ;
5. **Propriétés** — **le formalisme unique avec les formulaires**
   (D250) : `title:` (le gabarit — D449), le `pages` implicite
   (D509) ; **la dimension de page** (`paper:` — `A4`, le portrait,
   `A4[landscape]`, l'orientation au crochet comme les formats d'écran,
   `105x48mm` pour l'étiquette ; D1614, D1639) ; **`margin:`**
   — « les marges en mm » (D559) ; **`format:`** — « le format de
   destination » (D564–D565) : `pdf` (**le défaut acté** — la lignée
   D212/D250) `| word | excel | mail` — le mail portant le
   publipostage (D562), l'Excel le modèle (D445) ; **« étendu à
   d'autres formats en fonction des besoins à venir »** (D565 — la
   ligne des hooks D408) ; les titres à
   quatre niveaux (D250) ;
6. **Items** — le `pages` implicite : `header`/`footer` — **répétés à
   chaque page** (D507, D1636) —,
   les `page`(s), les sections ; **les feuilles aux pendants PDF**
   (D257 — « un pendant PDF par type » : l'image dimensionnée au
   bloc, le fil complet si inclus…) ; **le contenu fixe** —
   `paragraph`/`picture` (D488) ; `qrcode`/`barcode` (D542–D545 — l'étiquette) ;
   les graphiques en image (D257) ;
7. **Modes et déclinaisons** — le PDF d'abord (D212) ; jamais
   d'interaction — le papier n'agit pas (l'écho D511) ; le viewer le
   feuillette à l'écran (D481/D483) ;
8. **États et interactions** — la lecture seule par nature (D250) ;
   la confidentialité s'applique au rendu (les champs masqués
   n'apparaissent pas) ;
9. **Décisions fondatrices** — D212, D250–D254, D257, D432, D438,
   D445, D449, D481, D483, D488, D507, D509, D530, D542–D545, D559,
   D562, D564 ;
10. **Exemple de configuration** —

```yaml
# sales/entities/order.yml, bloc gui
templates:
  invoice:                         # document: invoice (D432) — template[invoice] (D483)
    title: "Facture {number}"
    paper: A4                      # la dimension de page (D250, D1639)
    margin: 15mm                   # les marges (D559)
    header:
      height: 40mm
      items:
        - picture: logo            # l'image fixe (D488), l'identifiant d'une ressource (D1625)
        - field[number]: { component: qrcode, size: 25mm }   # (D543)
    page:
      - field[customer]
      - field[lines]               # la composition — le tableau
      - paragraph: { label: legal }   # le texte fixe du dictionnaire (D440/D488)
    footer:
      height: 15mm
      items:                       # répété à chaque page (D507)
        - field[total]

  label:                           # l'étiquette (D252)
    paper: 105x48mm
    page:
      - field[sku]: { component: qrcode, size: 30mm }
      - field[name]
```

## `chat`

1. **Nom et famille** — `chat`, une surface — **au socle** : l'écran
   du module `_chat` fourni par Syncytium (comme `_migration` D666 et
   `_administration` D710) ; le menu l'adresse, en valeur de `link:` — `_chat[main]` (D439, D1237 ; le préfixe des modules internes, D1029) ;
2. **Rôle** — **la question en langue naturelle à la somme des
   connaissances de l'instance** — les données et leur description —,
   la réponse d'un modèle de langage déclaré en connecteur (`llm`) ;
3. **Types servis** — **la session d'échanges** (D959 : `_chat.session`
   — un utilisateur, **un module**, ses messages) : le fil des
   messages (le composant `thread` — D295), la question de
   l'utilisateur, la réponse du modèle ;
4. **Contexte consommé** — **l'utilisateur et ses droits** (D886, la
   confidentialité D885, l'audience) : le modèle ne lit l'instance que
   par l'API au porteur de l'utilisateur ou par la librairie interne
   des hooks de fonctions — « dans la limite des autorisations
   accordées à l'utilisateur sur la consultation des données » ; **le
   module activé** — la session lui est adossée, son mode d'emploi et
   ses données bornent le contexte (D959) ; le connecteur `llm` de
   l'environnement (D617) ;
5. **Propriétés** — `title:` (D449/D465) ; `screen:` (D450/D532) ;
   `connector:` — le rôle nommé du connecteur `llm` (D617, D1639) ;
6. **Items** — aucun : la surface est le fil et sa saisie ;
7. **Modes et déclinaisons** — **PC et tablette** : le fil et la
   saisie en bas (D295) ; **smartphone** : le fil en plein écran ;
   **le chat suit le module activé** (l'écho de D557 — le tableau de
   bord change avec le module) : deux modules accessibles = deux
   sessions, chacune son historique et son contexte (D959) ;
   **template** : sans objet ;
8. **États et interactions** — la question part **après
   l'anonymisation** des champs `personal` (D695/D696, tel quel —
   D960) de tout le contexte transmis, hors les données du profil
   connecté et ce que les droits de l'utilisateur sur les composantes
   de la description lui ouvrent — aucun droit propre au chat ; **la
   session dure** — sans rétention, « aussi longtemps que possible et
   jusqu'à ce que l'utilisateur demande sa réinitialisation » (D960) :
   l'acte **réinitialiser** sur la session (la suppression du socle,
   qui désactive — D137 ; la session close reste à l'analyse, une
   nouvelle s'ouvre — D1639) ; **chaque
   question et chaque réponse s'écrivent, avant l'affichage,** dans
   `_chat.session` et `_chat.message` (historisées — D411), l'événement
   au journal de sécurité (D925) ; **le connecteur indisponible** :
   « un message d'erreur sera présenté et les questions ne seront pas
   possibles » (D626/D959) — la saisie fermée, l'historique lisible ; **le chat répond et fournit
   les données, il ne met rien à jour** (D958) — « les mises à jour se
   feront via les interfaces proposées par l'application » : la
   réponse porte **les liens vers les surfaces de mise à jour** (le
   formulaire, l'acte — D439/D483), où l'utilisateur agit sous ses
   propres droits ;
9. **Décisions fondatrices** — D295, D439, D449–D450, D465, D617,
   D626, D695–D696, D885–D886, D917–D918, D925, D957–D960, D1029 ;
10. **Exemple de configuration** —

```yaml
# le module _chat du socle — rien à déclarer chez le client, sinon le
# connecteur llm de l'environnement (connectors.yml — D617)
assistant:
  type: llm
  parameters:
    provider: …
    model: …
    api_key*: ${LLM_API_KEY}       # la marque * — le secret chiffré (D944/D902)
```
