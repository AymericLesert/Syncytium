# Les conteneurs

> **Un conteneur** est un composant qui organise d'autres composants
> sans rendre de champ : `sections` et `section`, `tabs` et `tab`,
> `pages`, `page`, `header` et `footer`
> ([glossaire](../../glossaire.md)).

Une surface est un arbre de nœuds ([le catalogue](README.md)). Les
feuilles rendent les champs. Les conteneurs leur donnent une place : un
regroupement, un onglet, une page. Ils ne portent aucune valeur. Ils
transmettent leur contexte tel quel à ce qu'ils contiennent (D455). La
famille est close : huit conteneurs, et « pas besoin de composants
complémentaires » (D509).

Les conteneurs vont par couples. L'organisateur dispose, la partie
contient :

- `sections` organise des `section` ;
- `tabs` organise des `tab` ;
- `pages` organise un `header`, des `page` et un `footer`.

Deux règles traversent toutes les fiches.

- **L'alternance stricte** (D489). Un organisateur ne contient que ses
  parties. Une partie contient des feuilles, ou un organisateur. Pour
  emboîter deux regroupements, la section passe donc par `sections`.
- **Le socle du vocabulaire** (D461). Les propriétés de représentation,
  `style:`, `size:`, `readonly:`…, se portent au type, se surchargent au
  champ, puis au nœud. Le plus proche l'emporte. Chaque conteneur en
  dispose, sa fiche ne les répète pas.

Le formulaire est lui-même un `pages` qui ne se déclare pas (D509) : ses
clés `header:`, `page:` et `footer:` sont les conteneurs de cette fiche.
La surface est décrite dans [les surfaces](surfaces.md).

## `sections`

**Nom et famille.** `sections`, un conteneur : l'organisateur. Il
« permet de décrire l'organisation de différentes sections —
organisation en colonne ou en ligne » (D489).

**Rôle.** Poser la disposition des sections qu'il contient. En colonne,
elles s'empilent. En ligne, elles se placent côte à côte.

**Types servis.** Aucun. Le conteneur est indifférent à ce qu'il
contient (D455).

**Contexte consommé.** Le contexte est transmis tel quel aux items
(D455). Les droits et la confidentialité décident de la visibilité.

**Propriétés.** L'organisateur a trois réglages : la disposition, le
calibrage uniforme, l'espace du tout.

- `layout:`, la disposition, s'écrit `column[n]` ou `row[n]` (D490,
  D491). Le mot nomme l'unité. Le crochet la compte. Le flux replie
  au-delà :
  - `column`, le défaut : l'empilement ;
  - `column[3]` : jusqu'à trois colonnes par ligne, puis la ligne
    suivante ;
  - `row` : la ligne unique ;
  - `row[2]` : jusqu'à deux lignes par colonne, puis la colonne
    suivante.

  Le crochet couvre la grille : « oublie grid » (D491). Il s'écrit aussi
  en raccourci sur le composant : `sections[row]` vaut `layout: row`
  (D478, D489, D1640).
- `width:` et `height:`, au même niveau que `layout:`, donnent le
  calibrage uniforme : « pour que chaque section ait la même dimension »
  (D502). Une section peut les surcharger pour une taille variable. Le
  plus proche l'emporte (D461). Sans précision, tout l'espace est pris
  (D501).
- `size:` donne « les dimensions de l'espace occupé par l'ensemble des
  sections » (D503). C'est la dimension à l'affichage, en cohérence avec
  le couple `size:` et `dimension:` (D484).

Le socle du vocabulaire s'applique (D461).

**Items.** Des sections, rien d'autre : « chaque item est alors une
section » (D489).

**Modes et déclinaisons.** L'organisateur vit partout où un conteneur
vit : dans `header`, `page` et `footer`, dans `pages`, dans le template
(D487, D509). La disposition est un maximum : `column[3]` veut dire
« jusqu'à trois colonnes ». Le composant la replie selon la place
disponible : trois colonnes sur un poste informatique, une seule sur un
smartphone (D491, D1648). Un format qui demande une autre disposition,
un autre ordre ou d'autres sections, se déclare par une surface à part,
avec `screen:` : « si l'affichage doit changer, screen permet de
définir le format attendu » (D450, D490, D1613).

**États et interactions.** Les droits et la confidentialité masquent
l'organisateur. Quand le contenu déborde de `size:`, il défile (D503) :

- sur le poste informatique, les barres de défilement sont visibles ou
  évanescentes, ce qui est « plus moderne » ;
- au tactile, le swipe fait défiler, sans barres ;
- les barres restent « le positionnement de l'écran par rapport à
  l'ensemble ».

**Décisions fondatrices.** D449–D451, D455, D461, D487, D489–D491,
D501–D503.

**Exemple de configuration.** Dans le cas 3 (véhicule),
`03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/gui.yml` :

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

Les autres propriétés sont montrées sur l'exemple de la fiche `section`.

## `section`

**Nom et famille.** `section`, un conteneur : « une partie du composant
sections » (D489), « un regroupement potentiellement nommé ». Elle est
fournie par Syncytium (D451).

**Rôle.** « Organiser différents nœuds » sous un intitulé facultatif.
C'est l'unité de lecture d'un écran. La section est un nœud pur : elle
ne porte aucune valeur et n'est pas un bloc à part (D487).

**Types servis.** Aucun. Le conteneur est indifférent à ce qu'il
contient (D455).

**Contexte consommé.** Le contexte est transmis tel quel aux items :
l'enregistrement, l'origine de l'appel, l'utilisateur (D455). Les
droits et la confidentialité décident de la visibilité. Une section
masquée masque ses items.

**Propriétés.** La section a trois réglages : son titre, son calibrage,
son repli.

- `title:`, l'intitulé. « Le nom d'un regroupement est en fait un
  libellé en titre de la section » (D493). Il se donne par langue
  (D465). Il est facultatif : le regroupement est « potentiellement
  nommé ». Un regroupement qui demande une explication la reçoit dans la
  `description:` de l'écran. L'édition de la documentation la porte sur
  le regroupement (D1190). La partie de la description titrée du nom de
  la section s'y attache (D1640).
- `width:` et `height:` servent à « calibrer la taille ». Le calibrage
  uniforme se pose sur l'organisateur. La taille variable se pose sur la
  section. Le plus proche l'emporte (D501, D502). « Sans précision,
  l'ensemble de l'espace est pris. »
- `dropdown:` rend la section repliable : « refermer ou ouvrir, avec un
  icône pour matérialiser l'affichage ou pas » (D568). Ses quatre
  valeurs (D569) :
  - `false`, le défaut : la section est fixe ;
  - `true` : repliable, ouverte par défaut ;
  - `opened` ou `closed` : repliable, l'état d'entrée explicite.

  La feuille `dropdown` porte le même nom. Le contexte départage : une
  propriété de section ou un composant de champ (D458).

Le socle du vocabulaire s'applique (D461) : `style:`, `size:`…

**Items.** « Soit sections, soit une des feuilles vues précédemment »
(D489). C'est l'alternance stricte : pour emboîter des sections, la
section passe par l'organisateur `sections`. Les champs s'écrivent
`field[<nom>]` (D460).

**Modes et déclinaisons.** La section se décline selon son habitat.

- Au formulaire, elle dessine un cadre. L'intitulé est en tête si elle
  est nommée.
- Elle vit dans `header`, `page` et `footer` comme dans `pages` (D450,
  D487). Son rendu s'adapte au format de la zone d'affichage (D200,
  D1613).
- Au template, elle est le regroupement du gabarit.

La section seule vit directement sous un conteneur, `header`, `page` ou
`footer` (D490, qui reprend D450 et D451). Ailleurs, la composition
passe par l'organisateur `sections`.

**États et interactions.** Les droits et la confidentialité masquent la
section. Avec `dropdown: true`, l'icône replie et déplie (D568).

**Décisions fondatrices.** D449–D451, D455, D460–D461, D465, D487,
D489–D491, D493, D501–D502, D568–D569.

**Exemple de configuration.** Le couple vit ensemble : voir aussi la
fiche `sections`. Dans le cas 3 (véhicule),
`03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/gui.yml` :

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

Les autres propriétés, sur un exemple. La section seule vit directement
sous `items:`, le raccourci de la page unique (D490, D1594, D1649). Elle contient des feuilles et un organisateur
(D489). L'organisateur replie au-delà de deux colonnes (D491), borne
l'espace du tout (D503) et fixe la hauteur uniforme (D502). Une de ses
sections impose sa largeur ; l'autre prend le reste (D502) :

```yaml
# Le contenu du formulaire : la section seule, directement sous le conteneur
items:

  # L'adresse : un regroupement nommé
  - section:
      title: { fr: Adresse }
      items:

        # Une feuille
        - field[street]

        # L'emboîtement : les sous-sections passent par l'organisateur
        - sections:
            # La disposition : deux colonnes, puis la ligne suivante
            layout: column[2]

            # L'espace du tout ; au-delà, le défilement
            size: 400px

            # La hauteur uniforme : chaque section à la même taille
            height: 120px

            items:

              # La section calibrée : sa largeur l'emporte sur l'uniforme
              - section:
                  width: 70%
                  items:
                    - field[zip]
                    - field[city]

              # La section qui prend le reste de l'espace
              - section:
                  items:
                    - field[country]
```

## `tabs`

**Nom et famille.** `tabs`, un conteneur : l'organisateur des onglets
(D456). Le couple `tabs` et `tab` est le miroir de `sections` et
`section` (D489, D1636).

**Rôle.** Poser les onglets. Un seul volet est visible à la fois. La
poignée fait basculer de l'un à l'autre.

**Types servis.** Aucun. Le conteneur est indifférent à ce qu'il
contient (D455).

**Contexte consommé.** Le contexte est transmis tel quel aux items
(D455). Les droits et la confidentialité décident de la visibilité :
l'onglet masqué disparaît de la barre.

**Propriétés.** L'organisateur a deux réglages : le visage de la barre,
l'espace du tout.

- `mode:` place la barre des poignées (D504, puis D552) :
  - `top`, le défaut : en haut, comme Windows ;
  - `bottom` : en bas, comme Excel ;
  - `left` ou `right` : la barre latérale.

  Le mode wizard n'est pas un mode de `tabs` (D552) : le wizard est une
  surface à part. Le crochet est un raccourci : `tabs[bottom]` vaut
  `mode: bottom` (D478, D1636).
- `size:` donne l'espace du tout, comme pour `sections` (D503, D484).

Les volets ont tous la même dimension : « pour chaque tab, toujours la
même dimension » (D506). Il n'y a donc aucun `width:` ni `height:` par
volet, au contraire des sections (D502).

Le socle du vocabulaire s'applique (D461).

**Items.** Des `tab`, rien d'autre (D489, D1636).

**Modes et déclinaisons.** L'onglet se montre par une barre de poignées
et le volet courant. La barre est en haut, en bas ou latérale (D504,
D552).

- La parenté visuelle avec le `wizard` est assumée, mais les deux objets
  restent distincts (D552) : ici la navigation est libre, là-bas le
  parcours est contraint.
- L'entête, la page et le pied acceptent les onglets (D450).
- Au tactile, le swipe bascule d'un onglet à l'autre (D503).
- Au template, les onglets sont rendus à la suite : rien ne bascule sur
  le papier (D1636).

**États et interactions.** La bascule se fait au clic ou au swipe.
L'onglet masqué par les droits disparaît. Le fil de discussion peut
prendre un onglet entier (D485).

**Décisions fondatrices.** D449–D451, D455–D456, D461, D485, D487, D489
(le patron), D503–D506, D552.

**Exemple de configuration.** Le couple vit ensemble. Dans le cas 3
(véhicule),
`03_vehicule/versions/beta/v1.0.0.0/transport/vehicule/gui.yml` :

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

Les autres propriétés, sur un exemple. La barre est en bas, comme Excel
(D504). Le second onglet porte une icône, l'identifiant d'une ressource
(D439, D1625). Le fil prend l'onglet entier (D485) :

```yaml
# Le contenu du formulaire : deux onglets, la barre en bas
items:

  # Les onglets
  - tabs:
      # La barre des poignées en bas, comme Excel
      mode: bottom

      items:

        # Le premier onglet : l'identité
        - tab:
            title: { fr: Général }
            items:
              - field[name]
              - field[status]

        # Le second onglet : le fil de discussion prend tout le volet
        - tab:
            title: { fr: Échanges }
            # L'icône de la poignée, une ressource
            icon: chat
            items:
              - field[discussion]
```

## `tab`

**Nom et famille.** `tab`, un conteneur : une partie de `tabs`, le
miroir de `section` (D489).

**Rôle.** L'onglet : le volet nommé qui se montre seul. Sa poignée est
dans la barre.

**Types servis.** Aucun.

**Contexte consommé.** Le contexte est transmis tel quel (D455). Les
droits masquent l'onglet, poignée comprise.

**Propriétés.** La poignée se nomme et se dessine.

- `title:` nomme la poignée (D493). Il est requis : un onglet sans
  poignée ne se choisit pas. Un `tab` sans `title:` est une erreur
  d'ingestion (D1636).
- `icon:` dessine la poignée : « chaque item gui doit disposer d'un
  champ icône » (D439). « Les icônes permettent de minimiser le texte ou
  afficher le texte en survol » (D504) : la poignée est compacte, le
  titre passe en info-bulle.

Le socle du vocabulaire s'applique (D461).

**Items.** Des `sections` ou des feuilles : l'alternance stricte (D489).

**Modes et déclinaisons.** Le volet occupe tout le cadre, à la dimension
commune des onglets : « les zones sont centrées si elles représentent un
espace plus petit » (D506). La poignée est le titre et l'icône. Sur le
smartphone, la barre défile.

**États et interactions.** La bascule. L'onglet est masqué par les
droits ou la confidentialité.

**Décisions fondatrices.** D439, D449–D451, D455, D461, D489, D493,
D504, D506.

**Exemple de configuration.** Voir la fiche `tabs` : le couple vit
ensemble.

## `pages`

**Nom et famille.** `pages`, un conteneur : « une section pouvant
contenir un header, des page(s) et un footer » (D456). C'est le
troisième couple, après `sections` et `section`, `tabs` et `tab`
(D489).

**Rôle.** Paginer. Le contenu est découpé en pages, au formulaire comme
au template.

**Types servis.** Aucun. Le conteneur est indifférent à ce qu'il
contient (D455).

**Contexte consommé.** Le contexte est transmis tel quel aux items
(D455). Les droits et la confidentialité décident de la visibilité.

**Propriétés.** Aucune dimension : « pages prend toute la place »
(D507), au contraire de `sections` et de son `size:` (D503). Le socle du
vocabulaire s'applique (D461).

**Items.** Un `header` facultatif, des `page`, un `footer` facultatif.
C'est la définition du composant. Trois règles tiennent (D507) :

- l'entête et le pied, « s'ils sont définis, ils sont toujours
  visibles » : ils encadrent les pages qui tournent ;
- leur `height:` est paramétrable ;
- « la page prend toujours le reste ».

Au template, l'entête et le pied se répètent à chaque page (D1636).

**Modes et déclinaisons.** Au formulaire, une page à l'écran. « La
navigation s'effectue de la même façon que les tabs, et l'affichage suit
la même logique » (D508) : la barre des poignées, ses modes (D504), le
chemin (D505), le swipe. Au template, ce sont les pages physiques du
document, l'entête et le pied répétés.

**États et interactions.** La page masquée par les droits saute, et la
pagination se resserre. Les poignées disent le positionnement.

**Décisions fondatrices.** D449, D455–D456, D461, D487, D489 (le
patron), D507–D508.

**Exemple de configuration.** Le couple vit ensemble. L'entête et le
pied sont toujours visibles, leur hauteur est réglée (D507). La première
page porte son numéro en poignée, la seconde un nom (D508) :

```yaml
# Le contenu du formulaire : un pages déclaré, l'entête et le pied fixes, deux pages qui tournent
items:

  # Le conteneur paginé
  - pages:
      items:

        # L'entête : toujours visible, sa hauteur réglée
        - header:
            height: 60px
            items:
              - field[number]

        # La première page : la poignée porte son numéro
        - page:
            items:
              - field[customer]
              - field[lines]

        # La seconde page : la poignée nommée
        - page:
            title: { fr: Notes }
            items:
              - field[notes]

        # Le pied : toujours visible ; la page prend le reste
        - footer:
            height: 40px
            items:
              - field[total]
```

## `page`

**Nom et famille.** `page`, un conteneur : « un composant de `pages` :
le saut de page » (D456).

**Rôle.** La page, une part du découpage. Le saut la sépare de la
suivante.

**Types servis.** Aucun.

**Contexte consommé.** Le contexte est transmis tel quel (D455). Les
droits masquent la page : elle saute.

**Propriétés.** La poignée porte le numéro de la page par défaut. « Nous
pouvons lui affecter un nom et/ou un icône comme un tab » (D508) :

- `title:`, le nom (D493) ;
- `icon:`, l'icône (D439).

Le socle du vocabulaire s'applique (D461).

**Items.** Des `sections` ou des feuilles : l'alternance stricte, en
miroir de `section` et de `tab` (D489, D1636).

**Modes et déclinaisons.** Au formulaire, la page à l'écran. Au
template, la page physique : le saut force le passage.

**États et interactions.** Masquée par les droits ou la confidentialité,
la page saute et la pagination se resserre.

**Décisions fondatrices.** D439, D449, D455–D456, D461, D489, D493,
D508.

**Exemple de configuration.** Voir la fiche `pages` : le couple vit
ensemble.

## `header` / `footer`

**Nom et famille.** `header` et `footer`, deux conteneurs d'un même
sang : les rôles réservés de `pages` (D487, D490). Le formulaire est un
`pages` implicite : `header`, `page`, `footer` (D509). « Pas besoin de
composants complémentaires » : la famille des conteneurs est close.

**Rôle.** L'entête se fige en haut, le pied en bas. « S'ils sont
définis, ils sont toujours visibles », et la page prend toujours le
reste (D507).

**Types servis.** Aucun : des conteneurs (D455).

**Contexte consommé.** Le contexte est transmis tel quel aux items
(D455). Les droits et la confidentialité décident de la visibilité.

**Propriétés.** `height:`, la hauteur : « la hauteur du footer et du
header sont paramétrables » (D507). Le socle du vocabulaire s'applique
(D461).

**Items.** « L'entête et le pied acceptent sections et onglets » (D450) :

- les sections seules (D490) ;
- l'organisateur `sections` ;
- les `tabs` ;
- les feuilles.

**Modes et déclinaisons.** Au formulaire, dans le `pages` implicite
(D509), comme dans un `pages` déclaré (D507) : l'entête et le pied
restent visibles pendant que les pages tournent. Au template, ils sont
répétés à chaque page (D507, D1636).

**États et interactions.** Masqués par les droits. Rien d'autre au
socle.

**Décisions fondatrices.** D449–D450, D455, D461, D487, D490, D507,
D509–D510.

**Exemple de configuration.** Le formulaire unique, `record` (D788),
est un `pages` implicite (D509). Les clés `header:`, `page:` et
`footer:` suffisent. La hauteur de l'entête est réglée (D507) :

```yaml
# Les formulaires
forms:

  # Le formulaire unique : un pages implicite, sans le déclarer
  record:

    # L'entête : toujours visible, sa hauteur réglée
    header:
      height: 60px
      items:
        - field[number]

    # La page : elle prend le reste
    page:
      - section:
          title: { fr: Client }
          items:
            - field[customer]

    # Le pied : toujours visible
    footer:
      items:
        - field[total]
```

Dès que les pages se répètent, le formulaire s'écrit en liste
d'éléments : le multi-pages (D510). Chaque élément est un conteneur de
cette fiche :

```yaml
# Les formulaires
forms:

  # Le formulaire à plusieurs pages : la liste d'éléments
  wizard_entry:

    # L'entête
    - header:
        items:
          - field[number]

    # La première page
    - page:
        items:
          - field[customer]

    # La seconde page
    - page:
        items:
          - field[lines]

    # Le pied
    - footer:
        items:
          - field[total]
```

Sans entête ni pied, le formulaire d'une seule page écrit son contenu
sous `items:` : le raccourci de la page unique, décrit dans
[les surfaces](surfaces.md) (D1594).
