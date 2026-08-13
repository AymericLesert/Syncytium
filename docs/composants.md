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
9. **Décisions fondatrices** — le rappel discret.

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
  `thread` · `list` (l'éditeur du type liste) — **le composant par
  défaut d'un type porte le nom du type** (D458) ;
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
9. **Décisions fondatrices** — D281, D374–D377.
