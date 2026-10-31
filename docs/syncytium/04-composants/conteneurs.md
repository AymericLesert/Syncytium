# Les conteneurs

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
   `sections[row]` (D478, D489, D1640) ; **`width:` / `height:` au même
   niveau que layout** — « pour que chaque section ait la même
   dimension » (D502, l'uniforme ; la section peut les surcharger —
   le variable, le plus proche l'emporte D461 ; sans précision, tout
   l'espace est pris D501) ; **`size:`** — « les dimensions de
   l'espace occupé par l'ensemble des sections » (D503 — la cohérence
   D484 : size à l'affichage) ; le socle du vocabulaire (D461) ;
6. **Items** — **des sections, rien d'autre** : « chaque item est
   alors une section » (D489) ;
7. **Modes et déclinaisons** — partout où un conteneur vit :
   `header`/`page`/`footer`, `pages`, le template (D487, D509) ; **le format
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

Dans le cas 3 (véhicule), `03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/gui.yml` :

```yaml
- sections:
    layout: row
    items:
      - section:
          title: Les compteurs
          items:
            - field[nb_jours]
            - field[km_courant]
            - field[km_total]
            - field[quantite_totale]
            - field[duree_moyenne]
      - section:
          title: Les totaux
          items:
            - field[total_entretien]
            - field[total_energie]
            - field[cout_financement]
            - field[cout_total]
      - section:
          title: Les prix de revient
          items:
            - field[conso_moyenne]
            - field[prix_energie_km]
            - field[prix_km]
            - field[prix_jour]
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
   nommé ») — **la documentation** : un regroupement qui demande une
   explication la reçoit dans la `description:` de l'écran, l'édition
   la porte sur le regroupement (D1190, D1640 : la partie de la
   description titrée du nom de la section s'y attache) ;
   **`width:` / `height:`** — « calibrer la taille » :
   l'uniforme se pose sur l'organisateur, **la taille variable sur la
   section** — le plus proche l'emporte (D501–D502 ; « sans précision,
   l'ensemble de l'espace est pris ») ; **`dropdown:`** — la section
   repliable : « refermer ou ouvrir, avec un icône pour matérialiser
   l'affichage ou pas » (D568) — **`false`** (défaut : fixe)
   **`| true`** (repliable, ouverte par défaut) **`| opened |
   closed`** (l'état d'entrée explicite — D569 ; *la collision avec
   la feuille `dropdown` notée, le contexte départage D458*) ; le socle du vocabulaire (D461 : style…) ;
6. **Items** — **« soit sections, soit une des feuilles vues
   précédemment »** (D489) — l'alternance stricte : l'emboîtement de
   sections passe par l'organisateur `sections` ; les champs par
   `field[<nom>]` (D460) ;
7. **Modes et déclinaisons** — au formulaire : le cadre, l'intitulé en
   tête s'il est nommé ; dans `header`/`page`/`footer` comme dans
   `pages` (D450/D487) ; le rendu s'adapte au format de la zone
   d'affichage (D200/D1613) ; template : le regroupement du gabarit ; **la section seule
   vit directement sous un conteneur — header, page ou footer**
   (D490 — l'écho de D450/D451) ; ailleurs, la composition passe par
   l'organisateur `sections` ;
8. **États et interactions** — la visibilité par les droits et la
   confidentialité ; **le repli et le dépli à l'icône**
   (`dropdown: true` — D568) ;
9. **Décisions fondatrices** — D449–D451, D455, D460–D461, D465,
   D487, D489–D491, D493, D501–D502, D568–D569 ;
10. **Exemple de configuration** — *(le couple vit ensemble — voir
    aussi la fiche `sections`)* —

Dans le cas 3 (véhicule), `03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/gui.yml` :

```yaml
- section:
    title: Les compteurs
    items:
      - field[nb_jours]
      - field[km_courant]
      - field[km_total]
      - field[quantite_totale]
      - field[duree_moyenne]
```

Les autres propriétés, sur un exemple :

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
                  items:
                    - field[zip]
                    - field[city]
              - section:           # le reste de l'espace
                  items:
                    - field[country]
```

## `tabs`

1. **Nom et famille** — `tabs`, un conteneur — **l'organisateur des
   onglets** (l'inventaire D456) ; le couple `tabs`/`tab` au miroir de
   `sections`/`section` (le patron D489 — D1636) ;
2. **Rôle** — poser les onglets : **un seul volet visible à la fois**,
   la bascule par la poignée ;
3. **Types servis** — aucun : le conteneur est indifférent au contenu
   (D455) ;
4. **Contexte consommé** — le contexte transmis tel quel aux items
   (D455) ; les droits et la confidentialité — **l'onglet masqué
   disparaît de la barre** ;
5. **Propriétés** — **`mode:`** — les visages de la barre (D504,
   amendé D552) : `top` (Windows — le défaut), `bottom` (Excel),
   `left`/`right` (la latérale) — **le mode wizard a quitté tabs**
   (D552 : la séparation) ; le crochet en raccourci : `tabs[bottom]`
   (D478, D1636) ; `size:` — l'espace du tout (l'écho D503/D484) ; **la
   dimension unique des volets** — « pour chaque tab, toujours la même
   dimension » (D506 — aucun `width`/`height` par volet, le contraste
   avec D502) ; le socle du vocabulaire (D461) ;
6. **Items** — **des `tab`, rien d'autre** (le miroir de D489 —
   D1636) ;
7. **Modes et déclinaisons** — la barre des poignées + le volet
   courant — en haut, en bas, latérale (D504/D552) ; **la parenté
   visuelle avec le `wizard` est assumée, les objets restent
   distincts** (D552 — la navigation libre ici, le parcours contraint
   là-bas) ; l'entête, la page et le pied acceptent les onglets
   (D450) ; **tactile** : le swipe bascule d'un onglet à l'autre
   (l'esprit D503) ; **template** : les onglets rendus à la suite
   (rien ne bascule sur le papier — D1636) ;
8. **États et interactions** — la bascule au clic ou au swipe ;
   l'onglet masqué par les droits disparaît ; le fil peut prendre un
   onglet (D485) ;
9. **Décisions fondatrices** — D449–D451, D455–D456, D461, D485,
   D487, D489 (le patron), D503–D506, D552 ;
10. **Exemple de configuration** — *(le couple vit ensemble)* —

Dans le cas 3 (véhicule), `03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/gui.yml` :

```yaml
- tabs:
    items:

      # L'identification
      # Le visage, le type, la devise visuelle, le statut qui navigue dans le cycle de vie, l'achat et la vente.
      - tab:
          title: Véhicule
          items:
            - field[nom]
            - field[immatriculation]
            - field[photo]
            - field[type]
            - field[devise]
            - field[statut]
            - field[mode_achat]
            - field[lieu_achat]
            - field[date_achat]
            - field[date_vente]
            - field[lieu_vente]
            - field[km_initial]
```

Les autres propriétés, sur un exemple :

```yaml
page:
  - tabs:
      mode: bottom               # la barre en bas — le style Excel (D504)
      items:
        - tab:
            title: { fr: Général }
            items:
              - field[name]
              - field[status]
        - tab:
            title: { fr: Échanges }
            icon: chat             # l'icône de l'item gui (D439), une ressource (D1625)
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
5. **Propriétés** — **`title:`** — la poignée se nomme (D493) ;
   **requis** : un onglet sans poignée ne se choisit pas, un `tab` sans
   `title:` est une erreur d'ingestion (D1636) ;
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
   chaque page (D1636) ;
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
            items:                       # toujours visible (D507)
              - field[number]
        - page:
            items:
              - field[customer]
              - field[lines]
        - page:
            title: { fr: Notes }         # la poignée nommée — sinon le numéro (D508)
            items:
              - field[notes]
        - footer:
            height: 40px
            items:                       # toujours visible — la page prend le reste
              - field[total]
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
6. **Items** — des `sections` ou des feuilles (l'alternance D489, en
   miroir — D1636) ;
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
   D509 — **le formulaire est un `pages` implicite** : `header`, `page`,
   `footer`) ; « pas besoin de composants
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
   page (D507, D1636) ;
8. **États et interactions** — masqués par les droits ; rien d'autre
   au socle ;
9. **Décisions fondatrices** — D449–D450, D455, D461, D487, D490,
   D507, D509–D510 ;
10. **Exemple de configuration** —

```yaml
forms:
  record:                          # le formulaire = un pages implicite (D509) ; record, le nom (D788)
    header:
      height: 60px                 # la hauteur paramétrable (D507)
      items:
        - field[number]
    page:                          # la page prend le reste
      - section:
          title: { fr: Client }
          items:
            - field[customer]
    footer:
      items:
        - field[total]

# le multi-pages : la liste d'éléments (D510)
forms:
  wizard_entry:
    - header:
        items:
          - field[number]
    - page:
        items:
          - field[customer]
    - page:
        items:
          - field[lines]
    - footer:
        items:
          - field[total]
```
