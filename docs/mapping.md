# Le mapping de Syncytium — la source et la migration

Ce document rassemble **la nature et les exemples des échanges
consignés sur le mapping** — la description de la source et les
règles de migration — le sixième artefact préparatoire de la
documentation (Q58, le domaine 6 — D602), après le
[glossaire](glossaire.md), les [composants](composants.md), les
[hooks](hooks.md), les [types](types.md) et les
[connecteurs](connectors.md). Les décisions citées renvoient à la
[conception](conception.md).

## Le cadre — les deux fonctions essentielles (D646)

« Le mapping va permettre de couvrir 2 fonctions essentielles : la
migration entre 2 versions ; la migration entre 2 schémas
(storage). » Un seul mapping, deux visages :

1. **entre deux versions** — la migration à chaud (les quatre gestes
   `create_schema` → migration → `switch_schema` → `delete_schema`,
   D631) **et la mécanique de la compatibilité ascendante et
   descendante** : le même mapping qui migre les données engendre la
   chaîne de translation des API (le pilier P3, D11–D13) ;
2. **entre deux schémas (storage)** — le `from:` (D610) : le système
   existant vers le nouveau ; **les interfaces de Syncytium offrent
   une vue sur les données migrées et validées** (D646) — l'IHM en
   poste de contrôle (l'écho de la reprise D175–D179 et de la
   posture entrepôt D180).

**Les deux usages sont unifiés** (D647) — le même langage, les mêmes
conversions.

## L'usage 1 — la migration entre versions : l'implicite (D647)

Entre deux versions, **rien ne s'écrit** : le `from:` implicite est
la version précédente, Syncytium le porte. Les seules écritures :

- **le renommage** — `old_name: <ancien nom>` sur le champ, l'entité
  ou le module renommé (D651) : le journal de migrations en dérive
  la translation, la chaîne API continue de servir l'ancien nom ;
- **la dépréciation en trois temps** (D650) : **l'intention**
  (l'avertissement — l'élément vit encore, son avenir est scellé),
  **l'acte** (déprécié mais il répond encore), **la suppression**
  (un geste de version — l'élément quitte la description, D11–D13
  prend le relais). **La documentation est obligatoire** — le
  remplacement ou l'abandon précisé, vérifié à l'ingestion :

```yaml
unit_price:
  type: amount
  deprecated:
    mode: planned            # l'intention ; true = l'acte
    documentation: "Remplacé par pricing.unit_price à la 2.x."
    replaced_by: pricing.unit_price   # absent = l'abandon
```

- **le changement de type** — la compatibilité ou le transcodage :
  **chaque type porte sa ou ses règles de conversion** (D647,
  D579/D584) ;
- **la création et la suppression de champ** — les règles actées
  persistent (D11–D13 : la substitution vers l'ancien, le défaut
  vers le neuf).

### La migration du schéma (D673–D674)

**Le critère est structurel** (D673) : seuls les écarts qui touchent
le stockage déclenchent la procédure — l'ajout, le renommage ou la
suppression d'un module ou d'une entité ; l'ajout, le renommage, la
modification ou la suppression d'un **champ non calculé** (modifié =
**le type ou la valeur par défaut**). Le champ calculé ne touche pas
le schéma (le recalcul suffit) ; l'écart sans portée structurelle
active la version **sans migration de schéma**.

**La procédure en quatre temps** (D674 — précise D631) :

1. **la duplication** du schéma (structure et données) dans un
   schéma temporaire ;
2. **les transformations** dérivées des différences entre les deux
   modèles (le mapping automatique — D632), appliquées au
   temporaire — l'original intact ;
3. **la bascule sur validation** : l'ancien supprimé, le temporaire
   renommé (le `switch_schema` de D631) ; non validées, le
   temporaire se jette — **le retour arrière d'avant-bascule est
   gratuit** ;
4. **les écritures en attente** pendant la phase — jamais rejetées ;
   au rejeu sur le schéma neuf, **la compatibilité ascendante les
   traduit** (D677 — formulées dans l'ancienne version, elles passent
   par la chaîne P3 comme un appel d'API antérieur) ; **les lectures
   continuent** (D676 — « cela ne modifie pas les données, ni sa
   structure » : la migration vraiment à chaud, seule l'écriture
   attend).

**Le délai de grâce et la restauration** (D675/D678) : configurable
— sous grâce, l'ancien schéma devient **le schéma sauvegardé** ; **le
défaut : pas de délai, l'ancien schéma est supprimé**. La
restauration (`restore` — D574) est **le geste inverse de la
bascule** : le courant renommé, le sauvegardé repositionné — et
**chaque schéma porte sa version dans une table système**, rien à
deviner. Les lectures ne s'arrêtent que le temps du renommage
(D679 — « normalement, cela est très court »).

## L'usage 2 — la migration d'un système existant

### Les migrations déclarées (D662)

« Une migration peut faire converger plusieurs sources vers une
seule destination — le `from:` seul ne suffit pas. » **Le setting
décrit chaque migration** : le lien { connecteur storage source ·
descriptions des entités sources · mapping }. **L'ordre est celui de
la définition, aux deux étages** : les migrations s'exécutent dans
l'ordre déclaré, les entités sources se parcourent dans l'ordre
défini (le référentiel avant l'entité qui le référence, le
possesseur avant ses lignes).

```yaml
# settings.yml — les migrations déclarées (D662/D664)
migrations:
  legacy_erp:                       # l'ordre de définition = l'ordre d'exécution
    connector: legacy_db            # le connecteur storage source
    source:
      - legacy_db/source/.*\.yml    # un fichier par entité — le regex (D806)
    mapping:
      - legacy_db/mapping/.*\.yml   # un fichier par règle de migration
  old_crm:
    connector: crm_db
    source:  [old_crm/source/.*\.yml]
    mapping: [old_crm/mapping/.*\.yml]
```

**La migration référence ses fichiers par patterns** (D664 — le
patron multi-fichiers de D320–D321) : un fichier par entité source,
un fichier par règle de migration ; l'organisation des dossiers est
libre, la déclaration fait foi. **Les patterns sont des regex**
(D806 — « plus de personnalisation et de contrôle ») ; le pattern
est une déclaration : le standard d'organisation et de nommage que
le technicien se fixe — partout où une liste de fichiers se déclare,
il peut remplacer l'énumération. **Le versionnement est plein**
(D670) : `source/` et `mapping/` sont versionnés comme tout le
reste — l'itération d'exploration passe par le bump du build (D323),
le statut `beta/` (D340) et le dry-run qui n'engage rien (D667) ; la
version des règles est consignée à chaque passage dans le module
`migration` (D668). **L'ordre au sein d'un pattern est
alphabétique** (D665) — le préfixe numérique décrit les étapes de la
migration : `001_referentiels.yml`, `002_customers.yml`,
`003_orders.yml`. Le câblage `from:` (D610) se relit
comme le raccourci du cas à une seule migration.

### Les deux maisons (D652–D653)

« La destination est décrite par le méta-modèle. La source doit être
décrite par le méta-modèle également. » À la racine de la version :

- **`source/`** — la description du modèle d'origine, **table par
  table et colonne par colonne, dans la grammaire de description** ;
  **Syncytium s'assure de la complétude du modèle** : la description
  confrontée au schéma réel (`read_instance` — D629/D680), l'écart
  signalé ; `read_instance` peut engendrer l'ossature, le technicien
  la raffine ;
- **`mapping/`** — les règles de conversion, **table par table, aux
  origines multiples possibles**.

Le typage statique (D581) vérifie les expressions des deux côtés ;
l'exhaustivité (D648) se juge entre deux descriptions du même
langage.

### La description de la source (`source/`)

`source/` parle **toute** la grammaire (D652), avec trois mots
propres :

- **`ignored`** (D657) — l'élément **attendu** dans la source mais
  non développé : sur une entité (`audit_log: ignored`) ou sur un
  champ, **comme un type** (`ref_ext: ignored`) — l'écart
  **volontaire**. **Trois états pour une colonne comme pour une
  table** (D869/D947) : lue (typée, renvoyée à son champ), ignorée
  (citée `ignored`, avec son motif), **non lue** (absente de la
  description — Syncytium la relève au rapport de migration, le point
  à creuser D868) ; la complétude (D861) se mesure au schéma réel, la
  description n'a pas à citer chaque colonne. **Un fichier par entité
  d'origine, au nom de la table** (`source/ARTICLE.yml`, `name:
  ARTICLE` — D947) ;
- **la normalisation par champ calculé** (D660) — le nettoyage, la
  casse, le transcodage s'écrivent sur la description de la source
  (`formula:`), et le mapping consomme le champ calculé comme une
  colonne ;
- **le `parent:` du fils** (D931 — la forme de la surcharge D877) :
  quand la convention du connecteur (D876 — les colonnes d'identité
  aux noms identiques) ne trouve pas le lien d'une composition, le
  fils nomme les colonnes du possesseur, la même carte que la règle
  (`parent: { ARTICLE: { ARKTCODART: NOKTCODPF, ARKTCOMART:
  NOKTCOMPF } }`) ; quand elle tient, il s'omet ; la composition reste
  déclarée chez le possesseur (`list of`, D399/D869) ; le pré-contrôle
  (D874) compare les valeurs brutes. La référence composée se déclare
  colonne par colonne (`NOCTCODECP: ARTICLE.ARKTCODART`, la dépendance
  D648) — les colonnes qui dépendent des champs d'identité d'une même
  entité forment une référence, dans l'ordre de cette identité.
- **le `filter:`** (D663) — la sélection des enregistrements
  parcourus par la migration (`filter: order_date >= now() - 10y`,
  `filter: company_code = "PARIS"` — le multi-instances d'une entité
  recoupant plusieurs instances) ; **le périmètre déclaré, hors taux
  de couverture** — l'exclu du filtre n'est pas un rejet.

```yaml
# source/customers.yml — le modèle d'origine, la même grammaire (D652)
customers:
  identity: [code]                    # la contrainte d'unicité (D357)
  fields:
    code:     text[8]
    name:     text[..60]
    bal_cts:  integer                 # le solde en centimes
    fax:      ignored                 # attendue, non développée (D657)
    city_raw: text[..40]
    city:     { formula: upper(trim(city_raw)) }   # la normalisation (D660)

# source/customer_notes.yml
customer_notes:
  fields:
    customer_code: customers.code     # la dépendance déclarée (D648/D396)
    text:          text

# source/audit_log.yml — l'entité attendue mais ignorée (D657)
audit_log: ignored
```

### Les règles (`mapping/`)

**Le sens : de la table source vers la table cible** (D655) — chaque
table source déclare où vont ses colonnes. **La forme de la règle**
(D656) : la règle au nom de la table source — `to:` la cible (entité
ou agrégat), `parent:` le possesseur par ses champs mappés (D931),
`fields:` les expressions du langage unique, `validation:` les
contrôles de chaque ligne importée (D932), `report:` le rapport de
ses rejets (D929). **La clé fonctionnelle ne se déclare pas** (D930 — `key:`
retirée) : c'est l'identité de la cible, alimentée par `fields:`.

**La construction et la clé fonctionnelle** (D654) : le mapping
construit l'enregistrement avant sa validation (D177 — converti ET
cohérent, l'écriture par le chemin standard D175) ; **la clé
fonctionnelle** (D142/D398 — l'`identity:` de la cible, que la règle
alimente par `fields:`, D930) l'identifie — le rejeu sans doublon, et
**les origines multiples se rejoignent par la clé** : la jointure
n'est pas une syntaxe, c'est la clé (D655). Elle lie aussi **les
agrégats** : la ligne retrouve sa commande, l'association son
vis-à-vis.

```yaml
# mapping/customers.yml — une règle par table source (D655–D656)
customers:
  to: sales.customer                  # la cible
  fields:
    code:    code                     # l'identité alimentée = la clé du rejeu (D654/D930)
    name:    upper(name)
    balance: amount(bal_cts / 100)

# mapping/customer_notes.yml — la seconde origine, même cible
customer_notes:
  to: sales.customer
  fields:
    code:  customer_code              # la même identité — les contributions se rejoignent
    notes: text

# mapping/order_lines.yml — la composition par la clé
order_lines:
  to: sales.order.lines               # l'agrégat : la ligne rejoint sa commande
  parent: { order: order_no }         # le possesseur par ses champs mappés (D931) — à un champ, le raccourci
  fields:
    number:   line_no                 # l'identité de la ligne au sein du possesseur (D841)
    item:     item_code
    quantity: qty
```

**Le rapport des rejets porté par la règle (D929).** « Chaque règle
de migration a un report. Pas un report général. » La règle sait sa
source, sa cible et qui corrige l'origine : elle déclare `report:`
sous la forme validée de D406 (`when:` les rythmes, `to:` le groupe
ou l'utilisateur, `by:` les canaux) pour les enregistrements qu'elle
construit et que la cible refuse (D177 — la conversion échouée, sa
propre `validation:` D932, le contrat de la cible, la référence non
résolue). Sans `report:`, le
défaut de D407 tient : à la demande, vers l'administrateur, par les
surfaces du module `migration` (D666). Aucun rapport général — ni à
la migration déclarée (D662), ni au module ; la cascade de D407 reste
celle du modèle (les non-conformes des références, D395). Les
anomalies de la source — le schéma non décrit (D868), l'identité qui
n'est pas une clé (D871), l'orphelin isolé (D875) — ne sont pas des
rejets de règle : elles vont au technicien par le module `migration`
et le rapport de non-couverture (D176/D179).

```yaml
# mapping/001_articles.yml — le rapport porté par la règle (D929)
ARTICLE:
  to: technique.article
  fields:
    code: ARKTCODART
    libelle: ARCTLIB01
  report:
    when: [migration]              # après chaque passage de la règle (D406/D407)
    to: [production]               # le destinataire qui corrige l'origine (D859)
    by: [notification, mail]
```

**`parent:` par les champs mappés du possesseur (D931).** « Les
champs clés sont les champs mappés et non les champs sources… car un
champ mappé peut être converti ou transformé avant de vérifier la
clé. » La clé du possesseur se vérifie sur les valeurs construites :
`parent:` nomme les champs de l'identité du possesseur, chacun avec
l'expression qui produit, depuis la ligne fille, la valeur telle que
la règle du possesseur l'a construite — `parent: { <possesseur>: {
<champ d'identité>: <expression> } }`. L'identité à un champ garde le
raccourci (`parent: { compte: Numero_Compte }`) : l'expression seule,
le champ implicite. **La référence par clé composée dans `fields:`
porte la même carte.** La conversion écrite deux fois — chez le
possesseur et dans chaque `parent:` — est un risque d'entretien : la
normalisation à la source (D660/D872) fait lire aux deux règles des
colonnes déjà converties, et `parent:` ne porte alors que des colonnes
nues.

```yaml
# reprise/mapping/001_articles.yml — le possesseur construit son identité
ARTICLE:
  to: technique.article
  fields:
    code:       ARKTCODART
    complement: iif(ARKTCOMART = "", null, ARKTCOMART)   # le vide devient nul
    libelle:    ARCTLIB01

# reprise/mapping/002_nomenclatures.yml — la fille présente la même conversion (D931)
NOMENC:
  to: technique.ligne_nomenclature                       # l'entité fille, comme banque.ecriture
  parent:
    article:                                             # le possesseur, par ses champs mappés
      code:       NOKTCODPF
      complement: iif(NOKTCOMPF = "", null, NOKTCOMPF)   # sinon la clé ne se retrouve pas
  fields:
    numero:    NOKNLIGNOM
    composant:                                           # la référence par la clé composée : la même carte
      code:       NOCTCODECP
      complement: iif(NOCTCOMCPT = "", null, NOCTCOMCPT)
    quantite:  NOCNQTEUNI
```

**`validation:` à trois niveaux (D932).** « validation: porte à la
source avant l'import, porte à la destination après l'import et à la
règle du mapping porte sur chaque ligne de l'import. » La même
grammaire (D404) à trois places : sur l'entité source, la règle
s'évalue sur la ligne lue, avant la conversion — la non-conformité de
la source, comme la garde D813 ; sur la règle de migration, elle
s'évalue sur chaque ligne importée, après la construction par
`fields:` et avant l'écriture — les colonnes source à nu,
l'enregistrement construit par `me` ; sur l'entité cible, elle
s'évalue à l'écriture, au scellé (D594), sur l'enregistrement et ses
enfants (D933). L'échec, à chaque étage, rejette la ligne et va au
rapport de la règle (D929).

```yaml
# reprise/source/NOMENC.yml — avant l'import : la ligne lue, avant la conversion
NOMENC:
  validation:
    - NOCJFINVAL >= NOCJDEBVAL if NOCJFINVAL != null and NOCJDEBVAL != null

# reprise/mapping/002_nomenclatures.yml — sur chaque ligne importée : la source à nu, le construit par me
NOMENC:
  to: technique.ligne_nomenclature
  fields:
    nature:   nature_n                                 # le calculé de normalisation à la source (D660)
    quantite: NOCNQTEUNI
  validation:
    - me.quantite > 0 if me.nature = "composant"       # le construit
    - NOCTCODOPE != null if me.nature = "operation"    # la source et le construit

# technique/ligne_nomenclature/ligne_nomenclature.yml — après l'import : l'enregistrement écrit
validation:
  - composant != null if nature = "composant"
```

**L'échec dans une composition (D933).** « Si un échec est vu sur le
parent, tous les composants sont en échec. Si un composant est en
erreur et pas sur le parent, le parent est créé sans le composant en
erreur. Par contre, la règle de validation sur un enregistrement du
parent vérifie le fonctionnement de son enregistrement et de ses
enfants. Et, là, c'est l'enregistrement du parent et de tous ses
enfants qui sont en échec. » Trois cas : l'échec propre du parent (sa
conversion, sa `validation:`, sa référence) entraîne ses composants ;
l'échec propre d'un composant (sa conversion, sa `validation:` à la
règle ou à l'entité, sa référence — l'orphelin D875) ne rejette que
lui, le parent entre sans lui ; la `validation:` du parent qui lit
ses enfants (`lignes.count() > 0`, une somme) s'évalue sur le parent
et tous ses enfants, et son échec rejette le tout. L'agrégat reste le
grain d'écriture (D420) : ce qui s'écrit est le parent avec ses
composants conformes. Au cas 3 : l'article entre sans la cellule
tarifaire fautive, ses mouvements le trouvent ; la commande sans
ligne valide tombe entière. Le rapport nomme la cause — le parent, ou
la ligne (mien).

**Le texte trop long (D581).** Un `text[30]` de la source vers un
`text[..20]` de la cible est une conversion avec perte : le typage
statique la refuse à l'ingestion — ni troncature silencieuse, ni rejet
à l'exécution ; le technicien l'écrit s'il la veut, `left(ARCTLIB01,
20)` (les fonctions du texte, D934).

**L'enrichissement — le champ possédé par la cible (D941).** Le
différentiel ne compare que l'enregistrement construit, donc les
seuls champs que les règles alimentent : un champ qu'aucune règle
n'alimente reste tel quel — « la doctrine est bonne » ; `reset:
false` la garde. Le champ obligatoire naît à sa valeur : « le
default: répond à ce besoin ». Et le champ qu'un écran de saisie
remplit se protège par la propriété **`unchanged: true`** (`false`
par défaut) : « pour un nouvel enregistrement, la valeur est la
valeur par défaut. Si l'enregistrement existe, la valeur du champ
reste sa valeur » — la migration ne l'écrit jamais, la saisie reste
libre (la différence avec `mode: write-once`, immuable pour tous) ;
« unchanged est lié à la migration et aux règles de migration. Une
règle qui alimente l'un de ces champs serait une erreur d'ingestion ».
Le cas 3 : `note_interne` sur le tiers, aucune colonne PMI, née à
`""`, ouverte au commercial et aux achats par l'allow au champ
(D886/D942) — la note de l'acheteur survit à chaque nuit.

### Au-delà du 1-1 (D658–D660)

- **le référentiel par valeurs distinctes** (D658, validé) : la
  destination prend les valeurs distinctes d'un champ ou d'une liste
  de champs — la valeur devient la clé fonctionnelle, les entités
  porteuses référencent par la clé ; la même table source porte
  plusieurs règles. **La règle porte un `filter:`**
  (l'écho D663) — son périmètre : le cas 1 importe en **trois
  phases** (D814 — la phase = la règle filtrée, l'ordre = le
  préfixe D665 : les comptes créés par le marqueur OUVERTURE, les
  référentiels et les écritures hors marqueurs, l'écriture du
  solde puis la clôture par FERMETURE en **mise à jour par la clé
  fonctionnelle** D654 — le solde sur le compte encore ouvert,
  D815) ; les
  valeurs marqueurs entrent au référentiel, portées par les
  écritures de dépôt/solde — **le contrôle d'usage à la validation
  de l'entité** garde leur emploi (D824 — la date d'opération doit
  être l'ouverture ou la clôture du compte, l'évaluation au scellé
  D594) :

```yaml
# mapping/cities.yml — le référentiel des valeurs distinctes (D658)
customers:
  to: sales.city
  distinct: [city]               # sur la valeur normalisée (D660)
  fields:
    label: city                  # la valeur devient l'identité (D658/D930)

# mapping/customers.yml — l'entité qui référence, par la clé
customers:
  to: sales.customer
  fields:
    code: code
    city: city                   # la référence résolue par la clé (D654)
```

- **le rapprochement interne à la migration** (D812/D821 — le cas
  1 : les paires de virements) : **en deux phases par le cache nommé
  de la migration** — la règle d'enregistrement empile
  (`operations: cache.push(nom, clé, me)`), une **règle de
  complément** re-parcourt la même source et associe
  (`liee: cache.pop(nom, clé) if cache.size(nom, clé) > 1` — D822) ;
  **une pile par clé (FILO)** : la première ligne relue dépile la
  seconde empilée — son miroir, jamais elle-même ; **la garde
  `size > 1` écarte l'orphelin** (il ne dépile pas, le champ reste
  vide — un fait, pas une non-conformité) ; **le miroir reçoit sa
  référence en retour par l'affectation au chemin** (D823 —
  `me.liee.liee : me` : le membre gauche navigue et écrit dans
  l'enregistrement pointé ; l'ordre des affectations compte, le
  chemin sur le vide est sans effet). Le bloc `operations:` d'une règle = des énoncés du
  langage exécutés par enregistrement (le `if` postfixe — D364) ; la
  correspondance ligne → enregistrement de la règle de complément
  est tenue par la migration (D666/D668) ;

- **la règle rapprochable, la règle création seule** (D825, réécrit
  par D930 — le cas 1 : les écritures, sans identifiant de ligne ni
  clé composite fiable) : `key:` n'existe plus — **une règle est
  rapprochable si l'enregistrement qu'elle construit détermine
  l'identité de sa cible**, par ses expressions ou par les défauts des
  champs ; sinon — l'entité sans `identity:`, un champ d'identité
  sans valeur — **elle est création seule** (jamais de rapprochement,
  un rejeu dupliquerait) ; **la garde à l'ingestion** : `mode:
  relative` ou un rejeu sans `reset: true` exigent que chaque règle
  soit rapprochable — la règle création seule n'est admise qu'au
  tout-ou-rien remis à zéro ; la règle de complément (D821) ne crée
  pas : elle re-parcourt les mêmes lignes dans le même passage, la
  correspondance ligne → enregistrement tenue par la migration
  (D666/D668) ; la règle de mise à jour alimente l'identité
  elle-même, une valeur inchangée que le différentiel ignore ;

- **une entité source, plusieurs fichiers** (D816 — le cas 1) : deux
  fichiers au même format = une seule entité (l'union des lignes) ;
  **la carte entités → fichiers vit au connecteur** (D819/D828 —
  la section `entities:` au même niveau que `parameters:` : chaque
  entité déclare ses fichiers, la liste ou le pattern D806, le
  fichier répété pour le cas rare d'un fichier partagé), l'entité
  source reste purement logique (D652) ; un seul mapping ;
  **le défaut : la première ligne = les entêtes existantes** (D845 —
  la liste nue suffit) ; **l'entrée en objet pour les écarts** —
  `files:`, `headers: [..]` (la substitution, dans l'ordre des
  colonnes du fichier — elle prime), `skipheader: false` (le
  fichier sans entête — les noms viennent de la substitution) ;

- **les composés par la fonction du type** (D659, validé) : plusieurs
  colonnes source vers un champ cible — la fonction de construction
  portée par le type (D579/D584), rien de neuf dans la grammaire :

```yaml
  fields:
    position: geolocation(lat, lng)             # 2 colonnes → 1 champ
    total:    amount(total_cts / 100, currency) # le montant et la devise
```

## Le dry-run à deux modes (D649)

- **absolu** — le tout-ou-rien : valide uniquement si toutes les
  règles et transcriptions se déroulent sans erreur — **la bascule**
  d'un système A vers une application Syncytium ;
- **relatif** — **l'entrepôt** : seuls les enregistrements conformes
  sont portés, les erreurs isolées — dans une composition, l'échec du
  parent entraîne ses composants, l'échec d'un composant ne rejette
  que lui (D933) —, le rapport porté par chaque
  règle vers son destinataire (D929 — à défaut l'administrateur,
  D108–D110/D179), et **la vue sur le taux de couverture** par
  rapport à la source d'origine.

La reprise (D175–D179) est le mode relatif du `from:` ; le mode
absolu en est le durcissement pour la bascule définitive — les deux
postures de D180 incarnées.

## La couverture et le pilotage (D666–D667, D861–D862)

- **le module `migration`** (D666) — défini par Syncytium (le socle
  premier client — D408/D416) : ses entités stockent l'état de la
  couverture (par migration, par entité source, par règle, les
  rejets et leurs causes) — **la vue exploite les éléments déjà
  décrits** : les listes, les widgets, les kpi, les tableaux de bord
  du catalogue sur ces entités ; le taux de couverture est une
  donnée du modèle — consultable, filtrable, exportable ;
- **les trois taux** (D861–D862 — le cas 3, l'entrepôt) : **la
  complétude du schéma** — les éléments décrits ou déclarés
  `ignored` rapportés au schéma réel (cent pour cent quand tout est
  déclaré ; l'écart = **les anomalies** : la table ou le champ
  présent dans le schéma et absent de `source/`, remonté au
  technicien D179 — la complétude confrontée au schéma réel D653 à
  l'ingestion et à chaque `migrate`) ; **la couverture du schéma**
  — les éléments migrés rapportés au schéma réel (les ignorés =
  l'exclusion assumée, affichée à part, jamais comptée comme
  couverte) ; **la couverture des données** — les lignes intégrées
  rapportées aux lignes de chaque table source (les rejets creusent
  l'écart, le `filter:` D663 hors taux) ; deux grains au module
  `migration` : l'entité et le champ pour le schéma, la ligne pour
  les données ;
- **la comparaison par blocs et `coverage:`** (D878 — le cas 3) :
  la migration compare **le converti** (D672 — l'enregistrement
  reconstruit, la clé fonctionnelle) à la destination, **par
  partition, en cinq blocs** — **anomalies** (les lignes d'origine
  non converties — les rejets D177), **création** (les clés
  nouvelles), **modification** (les clés existantes à un champ
  différent), **inchangé**, **suppression** (les clés de la
  destination absentes de l'origine) ; **la synthèse** — par bloc,
  par clé de partition, le nombre d'enregistrements par entité —
  est la visibilité sur l'avancement ; **la lecture de l'origine**
  se règle par `coverage:` sur l'entité source — **la clé de la
  partition** (distincte de l'`identity:` si besoin : Syncytium
  garde une empreinte par valeur de clé, qui signale une
  différence, et la dernière valeur parcourue, pour reprendre
  depuis la dernière lecture) et **la plage de valeurs** (une
  période sur une date, un nombre de valeurs ou d'enregistrements
  sur un numéro) ; **sans `coverage:`, la totalité est relue** ;
  `filter:` reste le périmètre jamais lu ; **le traitement des
  écarts se lit sur la destination** — `history:` présent, ils
  complètent et l'historique les garde ; absent, ils remplacent ;
  **la forme courte, au crochet** (D880) — la nature puis la plage
  en retrait, ou la plage seule ; la liste pour plusieurs champs
  de partition ; **la forme riche** (D879) — la carte des champs,
  chacun avec `value:` (la nature) et `range:` (la plage) —
  équivalente :

```yaml
# source/MVTSTO.yml — la forme courte (D880)
coverage: MVCJMVT[month - 3]          # la partition au mois, les trois derniers relus

# source/ECOMCLI.yml
coverage: ECKTNUMERO[10000]           # les dix mille derniers

# la forme riche (D879), équivalente
coverage:
  MVCJMVT:
    value: month
    range: 3m
```

- **`reset_coverage`** (D881) — l'opération du socle qui efface
  l'état de couverture d'une entité (la dernière valeur parcourue,
  les empreintes par partition) : le `migrate` suivant relit la
  totalité ; planifiable par `every:` (D434), déclenchable comme
  toute opération (D428) ; le rythme type : le delta en semaine, la
  relecture complète le dimanche par un `reset_coverage` planifié
  dans la nuit de samedi — la vingtième opération du socle, au
  degré `administrator` ; **le rythme se déclare par des opérations
  périodiques** (D943 — pas une clé de la migration) : le bloc
  `operations:` de la migration déclarée porte le delta nocturne
  (`every: daily[02:00]`, `operations: [ migrate ]`) et la relecture
  complète (`every: weekly[saturday at 23:00]`, `operations: [
  reset_coverage(MVTSTO), … ]` — par entité partitionnée), le
  calendaire D434 et la composition des hooks du socle D609 ;
- **`migrate`, la dix-huitième opération du socle** (D667 — complète
  D574) : elle exécute une migration déclarée (D662) et **se
  déclenche comme toute opération** (D428/D609) — le bouton
  d'administration, le `when:`, l'`every:` calendaire (le
  différentiel nocturne), l'API ; la relance = la ré-exécution, le
  rejeu sans doublon par la clé fonctionnelle (D654) ; le dry-run
  absolu (D649) = le preview de `migrate` suspendu avant commit
  (D594–D595) ;
- **le `filter:`** (D663, confirmé) : les enregistrements hors
  filtre ne sont ni des rejets ni de la couverture — le périmètre
  déclaré.
- **le module historisé** (D668) : les entités du module `migration`
  portent `history:` (D168) — le suivi de la migration et
  **l'évolution de la qualité de la couverture dans le temps** (le
  taux qui monte au fil des ajustements, la courbe du catalogue) ;
- **les options de la migration** (D669/D671) : `{ mode: absolute |
  relative, reset: true | false }` — deux propriétés orthogonales :
  `absolute` (le tout-ou-rien de la bascule) / `relative`
  (l'entrepôt — les conformes portés, les erreurs isolées au
  rapport, la composition selon D933) ; `reset: true` **efface le contenu des tables cibles
  avant l'import** (le périmètre de la migration seul — le patron de
  l'exploration répétée) ;
- **le différentiel par comparaison** (D672) : évalué **après la
  migration** — l'enregistrement reconstruit se compare à la cible
  par la clé fonctionnelle (D654), **champ par champ** ; seuls les
  écarts s'écrivent, et l'entité cible historisée assure l'évolution
  de la valeur (D168) — le différentiel est la conséquence du rejeu
  par la clé, pas un mode de plus ; **les champs qu'aucune règle
  n'alimente restent intacts** (D941 — l'enrichissement : le champ
  possédé par la cible, `unchanged: true`, né à son `default:`).

## Les points ouverts

Aucun — le chantier du mapping et la jonction versions↔storage sont
soldés (D646–D676).
