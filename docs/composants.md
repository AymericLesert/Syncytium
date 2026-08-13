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
  `toggle` · `dropdown`/`radios`/`icon-set` · `record-picker`/
  `image-picker` · `file-drop` · `image-viewer` · `carousel` · `map` ·
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
      true:  { labels: { fr: Actif } }
      false: { labels: { fr: Inactif } }
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
            labels: { fr: Statut }
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
      true:  { labels: { fr: Automatisé } }
      false: { labels: { fr: Manuel } }

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
            labels: { fr: Fonctionnement }
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
            labels: { fr: Identité }
            items:
              - field[name]
              - field[notes]:
                  shortcut: { lines: 6 }    # la surcharge au nœud (D461/D464)
              - field[registration]
```
