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
      - legacy_db/source/*.yml      # un fichier par entité
    mapping:
      - legacy_db/mapping/*.yml     # un fichier par règle de migration
  old_crm:
    connector: crm_db
    source:  [old_crm/source/*.yml]
    mapping: [old_crm/mapping/*.yml]
```

**La migration référence ses fichiers par patterns** (D664 — le
patron multi-fichiers de D320–D321) : un fichier par entité source,
un fichier par règle de migration ; l'organisation des dossiers est
libre, la déclaration fait foi. **Le versionnement est plein**
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

`source/` parle **toute** la grammaire (D652), avec deux mots
propres :

- **`ignored`** (D657) — l'élément **attendu** dans la source mais
  non développé : sur une entité (`audit_log: ignored`) ou sur un
  champ, **comme un type** (`ref_ext: ignored`). L'exhaustivité
  (D648) se joue entièrement ici : chaque table et chaque colonne du
  schéma réel est décrite ou marquée `ignored` ;
- **la normalisation par champ calculé** (D660) — le nettoyage, la
  casse, le transcodage s'écrivent sur la description de la source
  (`formula:`), et le mapping consomme le champ calculé comme une
  colonne.
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
ou agrégat), `key:` la clé fonctionnelle, `parent:` la clé du
possesseur, `fields:` les expressions du langage unique.

**La construction et la clé fonctionnelle** (D654) : le mapping
construit l'enregistrement avant sa validation (D177 — converti ET
cohérent, l'écriture par le chemin standard D175) ; **la clé
fonctionnelle** (D142/D398) l'identifie — le rejeu sans doublon, et
**les origines multiples se rejoignent par la clé** : la jointure
n'est pas une syntaxe, c'est la clé (D655). Elle lie aussi **les
agrégats** : la ligne retrouve sa commande, l'association son
vis-à-vis.

```yaml
# mapping/customers.yml — une règle par table source (D655–D656)
customers:
  to: sales.customer                  # la cible
  key: code                           # la clé fonctionnelle (D654)
  fields:
    code:    code
    name:    upper(name)
    balance: amount(bal_cts / 100)

# mapping/customer_notes.yml — la seconde origine, même cible
customer_notes:
  to: sales.customer
  key: customer_code                  # la même clé — les contributions se rejoignent
  fields:
    notes: text

# mapping/order_lines.yml — la composition par la clé
order_lines:
  to: sales.order.lines               # l'agrégat : la ligne rejoint sa commande
  key: [order_no, line_no]
  parent: order_no                    # la clé fonctionnelle du possesseur
  fields:
    item:     item_code
    quantity: qty
```

### Au-delà du 1-1 (D658–D660)

- **le référentiel par valeurs distinctes** (D658, validé) : la
  destination prend les valeurs distinctes d'un champ ou d'une liste
  de champs — la valeur devient la clé fonctionnelle, les entités
  porteuses référencent par la clé ; la même table source porte
  plusieurs règles :

```yaml
# mapping/cities.yml — le référentiel des valeurs distinctes (D658)
customers:
  to: sales.city
  distinct: [city]               # sur la valeur normalisée (D660)
  key: city
  fields:
    label: city

# mapping/customers.yml — l'entité qui référence, par la clé
customers:
  to: sales.customer
  key: code
  fields:
    city: city                   # la référence résolue par la clé (D654)
```

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
  sont portés, les erreurs isolées, le rapport à l'administrateur
  (D108–D110/D179), et **la vue sur le taux de couverture** par
  rapport à la source d'origine.

La reprise (D175–D179) est le mode relatif du `from:` ; le mode
absolu en est le durcissement pour la bascule définitive — les deux
postures de D180 incarnées.

## La couverture et le pilotage (D666–D667)

- **le module `migration`** (D666) — défini par Syncytium (le socle
  premier client — D408/D416) : ses entités stockent l'état de la
  couverture (par migration, par entité source, par règle, les
  rejets et leurs causes) — **la vue exploite les éléments déjà
  décrits** : les listes, les widgets, les kpi, les tableaux de bord
  du catalogue sur ces entités ; le taux de couverture est une
  donnée du modèle — consultable, filtrable, exportable ;
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
  rapport) ; `reset: true` **efface le contenu des tables cibles
  avant l'import** (le périmètre de la migration seul — le patron de
  l'exploration répétée) ;
- **le différentiel par comparaison** (D672) : évalué **après la
  migration** — l'enregistrement reconstruit se compare à la cible
  par la clé fonctionnelle (D654), **champ par champ** ; seuls les
  écarts s'écrivent, et l'entité cible historisée assure l'évolution
  de la valeur (D168) — le différentiel est la conséquence du rejeu
  par la clé, pas un mode de plus.

## Les points ouverts

Aucun — le chantier du mapping et la jonction versions↔storage sont
soldés (D646–D676).
