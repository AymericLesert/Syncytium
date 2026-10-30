# Les types — le socle commun, les types simples

> **Un type** est le contrat d'un champ : ce qu'il accepte, comment il
> se stocke, s'affiche et se cherche. Son nom suffit : un type du
> catalogue, ou un type personnalisé ([glossaire](../../glossaire.md)).

Le type d'un champ dit ce que le champ contient : un texte, un entier,
une date, un montant. Il s'écrit à la propriété `type:`, ses bornes au
crochet, `text[..40]`, `integer[0..]`. Le type apporte avec lui tout ce
qui ne change pas d'un champ à l'autre : sa validation, son tri, ses
opérateurs, ses fonctions, son composant d'écran, sa forme en base. Ce
fichier décrit ce que tous les types partagent, puis les types simples.
Les types composés et les liens ont leurs propres fichiers,
[composes.md](composes.md) et [liens.md](liens.md).

## Le socle commun

### Un seul espace de noms

Le nom d'un type est sa clé (D408). Le catalogue, les types dérivés
(D359), les entités et les types ajoutés par un hook partagent un seul
espace de noms. Le nom d'une entité est donc aussi un type : c'est le
raccourci de la référence (D396). Deux types du même nom sont une erreur
d'ingestion.

### Les facettes communes

> **Une facette** est un des modes de représentation d'un type : sa
> valeur, son stockage, son affichage, sa forme d'API, sa forme en CSV
> ([glossaire](../../glossaire.md)).

Le champ règle ses facettes par des propriétés, à côté de son type.
Certaines valent pour tous les types (D391) :

- **`label:`**, les libellés par langue (D465) ;
- **`description:`** et **`hint:`**, l'aide et l'infobulle (D209, D258) ;
- **`validation:`**, les règles, une expression booléenne et son message
  ([entite.md](entite.md)) ;
- **`values:`**, les valeurs d'un énuméré : la clé stockée, les
  libellés, la description, l'icône ; une valeur intercalée demande de
  l'attention en migration ;
- **`searchable:`**, le mode de recherche que le type admet : `strict`,
  `normalized`, `similarity[0.8]`, `range`, `mutualizable[<nom>]` ;
- **`default:`**, la valeur de naissance (D424) ;
- **`unchanged:`**, le champ que la migration n'écrit pas (D941,
  [champs.md](champs.md)) ;
- **`mask:`**, le masque de saisie et de lecture ;
- **`report:`**, l'apparition dans les rapports, `no` par défaut (D406) ;
- **`confidentiality:`**, le niveau de confidentialité (D25, D364) ;
- **`rgpd:`**, le marquage réglementaire, `personal`, `sensitive` ou
  `consent` (D695) ; l'anonymisation en découle (D696) ;
- **`trace:`**, la trace des lectures, `audit` ou `limited` (D703) ; un
  champ `sensitive` est audité d'office ;
- **`component:`**, **`style:`**, **`size:`**, la présentation, en
  cascade : le plus proche l'emporte (D461).

### Le tri et le nul

Chaque type porte sa règle de tri et sa place du nul (D368). La fiche de
chaque type ci-dessous la donne. Le nul d'un type composé se trie
toujours en premier (D391).

### La signature d'un type

Tout type déclare ce que le langage peut faire de ses valeurs : sa conversion,
ses opérateurs, ses comparateurs, son `select`, ses fonctions (D579–D584). Le
langage la décrit, dans [l'écriture d'une expression](../langage/ecriture.md) ; le
typage statique et les garde-fous sont dans [le langage](../langage/README.md).

### La conversion vers le stockage

Le contrat d'un type comprend ses règles de conversion vers chaque
storage (D681, D682). Le storage visite le type, le type se décrit, le
storage rend sa forme native. Le contrat couvre trois choses :

- **les trois gestes du champ** : la création, la modification,
  l'altération et le transcodage compris, la suppression ;
- **les fonctions de valeur**, `create`, `update`, `read` (D683) ;
- **l'identification** : le type se reconnaît dans la structure native,
  à l'introspection (D684).

Le hook de type fournit ce contrat ([liens.md](liens.md)).

### Les types dérivés

> **Un type personnalisé**, ou type dérivé, décrit une fois un type et
> ses propriétés, pour le réutiliser sur plusieurs champs de
> l'application ([glossaire](../../glossaire.md)).

Un type dérivé est un type du catalogue auquel le projet donne un nom et
des facettes figées (D359). Il se déclare dans les settings, sous
`field:`, le type de composant (D1239). La clé est le nom du type
(D991, D992) :

- **sans `type:`**, la clé règle les défauts d'un type du catalogue ;
- **avec `type:`**, la clé définit un dérivé, qui hérite de sa base et
  surcharge ce qu'il nomme.

Les settings de l'entrepôt montrent les deux formes :

```yaml
# Les champs
field:

  # Le type text
  # Les défauts de tout champ texte ; un champ peut surcharger avec sa propre expression.
  text:

    # La normalisation
    # La valeur lue est rognée de ses blancs, à la frontière ; me désigne la valeur.
    normalize: trim(me)

  # Le type date_pmi
  # Les dates de PMI, écrites AAAAMMJJ : une date lue au masque yyyymmdd ; les colonnes de dates des sources
  # l'emploient.
  date_pmi:
    type: date
    mask: yyyymmdd

  # Le type amount
  # Les défauts de tout montant.
  amount:

    # La devise
    # La monnaie de l'entreprise, pour les prix que PMI écrit sans colonne de devise ; les tiers, les tarifs et les
    # commandes portent la leur.
    currency: EUR
```

Six règles encadrent les dérivés.

- **Un dérivé s'emploie en forme courte** (D356) : `ARCJCRE: date_pmi`.
- **Le champ garde le dernier mot** : `ARCJCRE: { type: date_pmi, mask:
  "yyyymm" }` surcharge le masque.
- **Le dérivé d'un dérivé** se résout à l'ingestion ; un cycle est une
  erreur.
- **Un dérivé ne redéfinit jamais un type du catalogue** (D408).
- **Un dérivé ne porte pas de graphe de conversion** : il reste la base
  qu'il dérive.
- **Un dérivé porte aussi les facettes de sens** (D1178) : `rgpd:`, le
  profil de confidentialité (D885), `hint:`, `description:`. Le champ qui
  l'emploie en hérite, et le marquage se généralise par le type :

```yaml
# Le nom d'une personne : un dérivé qui porte le marquage ; tout champ de ce type en hérite
nom:
  type: text[..40]
  rgpd: personal
```

Chaque champ écrit ensuite `nom: nom`, et hérite du marquage. Un dérivé
peut aussi fixer son composant, `progression: { type: integer[0..100],
component: fuel }`.

Le dérivé a son entrée au glossaire de la documentation, le vocabulaire
du métier (D1179) : son `title:` et sa `description:` par langue, sa
base, ses facettes, les champs qui l'emploient. La complétude compte le
dérivé sans description. Chaque type livre au dictionnaire des données
sa ligne : le type en clair, ses contraintes, son exemple (D1215). Le
registre le dit : « le dictionnaire de données est construit par
Syncytium à partir d'informations qui sont fournies par chaque item ».
Le détail est dans [documentation.md](documentation.md).

### Le composant par défaut

Le composant d'écran par défaut d'un champ porte le nom de son type
(D458) : un champ `date` s'affiche par le composant `date`.

## Les types simples

### `boolean`

Le booléen a trois états : faux, vrai et nul (D373–D375).

- `required: true` retire le nul ; la recherche stricte filtre alors vrai
  et faux par la case « null ».
- Le tri : nul, puis faux, puis vrai.

```yaml
# Le mouvement valide : un booléen calculé
valide:
  type: boolean
  formula: quantite != 0
  label: Valide
```

### `enum`

L'énuméré porte une liste de valeurs, `values:` (D130, D387, D388, D882).
Chaque valeur a sa clé, son libellé, sa description, son icône.

```yaml
# Le type du véhicule : un énuméré à deux valeurs
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

- **L'ordre de déclaration** est l'ordre de présentation et de tri.
- **Le stockage est numérique** : la clé devient un code interne stable.
  Une valeur ajoutée au milieu de la liste demande de l'attention en
  migration.
- **La recherche** passe par le composant de multi-sélection.
- **L'entrée `null:`** donne un libellé au vide.
- **À l'import**, le code est lu d'abord, le libellé en repli, dans la
  langue de l'importateur ; une ambiguïté est un échec propre.
- **À l'export**, le code ou le libellé, selon le format CSV déclaré : les
  machines échangent les codes (D130).
- Le tri : le nul en tête.

### `text`

Le texte a une taille, `auto` ou bornée au crochet, `text[30]`,
`text[..40]` (D366–D370).

- **Le masque** se compose de `_`, `9`, des littéraux et des classes
  (D259–D265).
- **Une ou plusieurs lignes** : la taille le décide, face au seuil de
  l'instance.
- **La recherche** admet tous les modes : `strict`, `normalized`,
  `similarity`, `mutualizable`.
- **Le tri** se fait sur la chaîne normalisée : les accents et les
  caractères spéciaux retirés, le même pour tous, sans surcharge par
  profil (D222). Le nul est la chaîne vide.
- **La facette `barcode:`** fait d'un texte un code-barres : `ean13`,
  `ean8`, `code128`, `qr`… (D542, D988). Le code-barres n'est pas un
  type : sa valeur est un texte. La facette valide le texte, et le
  composant de sortie la lit pour rendre les barres (D300).

```yaml
# Le code EAN 13 : un texte à la facette code-barres
ean13:
  type: text[13]
  barcode: ean13
  label: EAN 13
  description: >-
    Un texte à la facette code-barres : la facette valide les treize chiffres et la clé de contrôle, le composant de
    sortie rend les barres ; une valeur fausse met la fiche en anomalie.
```

### `integer`

L'entier a ses bornes au nom, `integer[100]`, `integer[0..100]`,
`integer[0..]`, ou par `min:` et `max:` (D371, D372).

- **Les octets ne se déclarent jamais** : le mode automatique les
  dimensionne selon les bornes ou les valeurs.
- **Le masque** : `000000`, `00 00 00`.
- **La recherche** : `range`.
- Le tri : le nul vaut 0.

### `decimal`

Le décimal a ses décimales : celles du setting, ou 2 (D376–D378).

- **Le stockage** est exact ou réel, par `storage:` : l'exact stocke un
  entier, aux décimales converties.
- Le tri : le nul vaut 0.

### `date`

La date a sa nature au crochet : `date[yyyy-mm]`, `date[yyyy-mm-dd]`,
`date[yyyy-ww]`… (D381–D383). Sans crochet, c'est la plus fine.

- **Le masque** suit la langue. Un `mask:` déclaré pilote aussi la
  lecture des sources (D820).
- **Les bornes** s'écrivent en littéraux ISO.
- **Les opérateurs** : `date - date` rend une durée, `date + duration`
  rend une date (D581, D838).
- **Les parties au point**, des fonctions du type : `.day`, `.month`,
  `.year`, `.week`, `.day_name`… (D772, D773, D838).
- Le tri : le nul en tête.

Le véhicule calcule l'intervalle entre deux ravitaillements par la
soustraction de deux dates :

```yaml
# Le nombre de jours : la date de la ligne moins celle de la précédente
nb_jours:
  type: duration
  formula: date - owner.consommations[me.numero - 1].date if numero > 1
  label: Nb de jours
  hint: Depuis le ravitaillement précédent.
  description: La première ligne reste nulle, comme au classeur ; la précédente s'atteint par la clé.
```

### `time`

L'heure a sa précision au crochet, `time[hh:mm]` (D381). Le tri : le
nul en tête.

### `datetime`

L'horodatage a sa nature au crochet (D381) :

- `datetime[raw]`, le défaut ;
- `datetime[timestamp]`.

La précision s'écrit en second paramètre. Le constructeur
`datetime(jour, heure)` assemble un jour et une heure déjà typés
(D1001) : `datetime(MVCJSAI, MVCTSAI)` dans la reprise des mouvements de
l'entrepôt. Si le jour ou l'heure est nul, le résultat est nul (D1553).
Le tri : le nul en tête.

### `file`

Le fichier est un descripteur ; le contenu est derrière (D160–D165, D384,
D972). Le registre le dit : « le nom du fichier, sa taille, sa date de
création, sa date de dernière modification, éventuellement une clé de
hashage si la propriété file `hash` est `true` ».

Les facettes du fichier :

- **`extensions:`**, la liste admise, `[pdf, docx]`, ou la forme à
  libellés, `{ pdf: { fr: facture } }`, qui guide le dépôt ;
- **`quota:`**, contrôlé à la volée ;
- **`hash: true`**, qui ajoute l'empreinte.

Les parties au point (D772, D1556) :

- **`.relativepath`**, le nom apparent ou saisi, relatif au répertoire du
  connecteur : la partie portée ;
- **`.fullname`**, le chemin complet, **`.filename`**, le nom seul,
  **`.pathname`**, le répertoire, recalculés depuis `.relativepath` ;
- **`.size`**, **`.created`**, **`.modified`**, **`.hash`**.

Les opérations du type (D974, D1556) :

- **`.read()`**, le contenu binaire ; **`.read(text)`**, le contenu en
  texte, pour un CSV ou un watcher (D635, D636) ;
- **`.move(destination)`**, le déplacement, celui que `commit` emploie
  (D973) ;
- **`.delete()`**, la suppression ;
- **`.hash()`**, l'empreinte à la demande.

Trois règles complètent le type.

- **Un connecteur `file` remplit le champ**, dans une règle du mapping
  (D883, D972) : `plans: plans.files(ARCTFICPLA)`.
- **Le différentiel compare les descripteurs** ; le contenu n'est relu
  qu'en cas d'écart (D672).
- **Le stockage est dédupliqué par l'empreinte** (D165). Un contenu
  identique déjà présent est réutilisé. L'effacement réel n'a lieu qu'au
  dernier détenteur, par comptage de références : un bon joint à trois
  commandes n'est stocké qu'une fois.

### `image`

L'image dérive du fichier (D385–D390).

- **La boîte maximale au crochet**, `image[512x512]`, produit la vignette
  automatique.
- **Le `placeholder:`** d'une image est une icône de fond (D390).
- **Le champ image d'une entité est son visage**, sélectionnable (D386).

```yaml
# La photo : le visage du véhicule
photo:
  type: image[512x512]
  label: Photo
  hint: Le visage du véhicule — la vignette des listes et de la carte.
  description: Le visage porté par l'image ; la vignette est automatique.
```

### `thumbnail`

La vignette seule : l'image réduite d'un fichier (D389, D393).

### `uuid`

L'identifiant externe : les systèmes tiers, les clés de reprise (D419,
D499). Sa validation est intégrée et son stockage compact. Il se saisit
et se lit en texte formaté. L'UUID interne d'un enregistrement reste
hors déclaration (D142).

### `password`

La saisie masquée, aux garanties structurelles : la valeur n'est jamais
relue (D463).

### `color`

La couleur (D496) :

- **se stocke en entier**, le RGB ou le RGBA assemblé ;
- **s'affiche en hexadécimal**, `#RRGGBB`, l'alpha en option ;
- **admet les couleurs nommées**, `red`, `orange`, `green`, celles de
  `colors:` (D467).

Le tri : sur l'entier, le nul en premier.

## Les fonctions du texte

Le type `text` emmène ses fonctions : `trim`, `upper`, `left`, `lpad`, `mid`,
`extract`… (D934). Elles sont décrites dans [le catalogue des fonctions](../langage/fonctions.md).
