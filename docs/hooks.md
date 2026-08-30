# Les hooks de Syncytium

Ce document rassemble **les échanges consignés sur les hooks** — le
mécanisme unique d'extension de Syncytium. Il prépare la documentation
à rédiger (Q58, le domaine 6 — D602) et suit le vocabulaire du
[glossaire](glossaire.md) ; les décisions citées renvoient à la
[conception](conception.md) ; les composants graphiques au
[catalogue](composants.md).

## La doctrine

- **Un seul mécanisme, dedans comme dehors** (D52) : les hooks, les
  connecteurs et les composants relèvent d'un mécanisme uniforme —
  ce que Syncytium embarque et ce que le technicien ajoute passent
  par la même porte ;
- **« Tous les types proposés sont finalement des hooks qui
  appartiennent à Syncytium »** (D408) — **le catalogue = les hooks
  embarqués** : le socle n'est pas un cas particulier, il est le
  premier client du mécanisme ;
- **Le mot « hook » n'apparaît jamais dans la configuration**
  (D408) : un hook ajoute **un nom** au catalogue concerné (un type,
  un composant, une opération, une fonction, un connecteur, un
  style — D755) — et ce
  nom s'emploie comme un nom du socle ; le doublon de nom = une
  erreur d'ingestion (D344/D396) ;
- **La première classe** (D65/D68) : un élément ajouté a les mêmes
  droits que le socle — mappable en défaut de type, surchargeable au
  champ ; **le registre est namespacé** (D52), les éléments
  partageables (AGPL — l'écosystème D68) ;
- **La dégradation** (D68) : si un hook échoue, **le repli sur le
  built-in par défaut** ;
- **Un hook de code définit une signature et un code propre au
  langage exploité par Syncytium** (D570) — le langage et la sandbox
  relèvent du domaine 7 (l'architecture technique — D602).

## La maison des hooks — `hooks/` et `hooks.yml` (D644)

Les hooks de l'application vivent **à la racine de la version** : le
dossier `hooks/`, **un sous-dossier par type de hooks** ; **la
chaîne à deux étages** (D644/D777 — le patron des modules
D765/D766) : `hooks.yml` référence **les fichiers de famille**,
chaque fichier de famille **liste ses fiches** (l'énumération ou le
pattern regex — D806), **la fiche du hook** (D809) portant `name`,
`description`, `code` et `properties` — les chemins relatifs au
fichier courant (D768). Les hooks du socle vivent dans
l'arborescence de Syncytium — la même porte (D52), deux maisons.

```text
versions/<statut>/<version>/
├── version.yml                     # déclare hooks: — le lien (D805)
├── hooks/
│   ├── hooks.yml                   # → les fichiers de famille (D777)
│   ├── operations/operations.yml   # → les fiches (le pattern — D806)
│   │   └── <verbe>/                #   la fiche, le md, le source (D809)
│   ├── types/ · components/ · functions/ · connectors/
│   └── styles/                     # la sixième famille (D755)
└── <modules>/
```

*(Le nommage et l'organisation restent libres — D807 : l'arbre
ci-dessus est la convention du cas 1.)*

```yaml
# hooks/hooks.yml — l'étage des familles (D777)
operations: operations/operations.yml

# hooks/operations/operations.yml — la liste des fiches (le pattern D806)
operations:
  - .*/.*\.yml

# hooks/operations/dupliquer/dupliquer.yml — la fiche du hook (D809)
name: dupliquer
description: documentation.md        # → le md du fonctionnement (D645/D778)
code: source.txt                     # → le code — le langage du domaine 7 (D570)
properties: { }                      # les propriétés du hook
```

**Chaque hook s'accompagne d'un fichier md** (D778 — la fiche le
référence par `description:`, D809) décrivant son fonctionnement —
la brique humaine de la documentation auto-générée (D645). Un
dossier par hook ou tout dans un même fichier : l'éclatement est
libre (D767/D807/D809).

## Les familles

### 1. Le hook de type (D408, D459, D579–D584, D681)

Ajoute **un type** au catalogue — exploitable comme les types
standard (le chaînage possible, les types custom ne portant pas le
graphe de conversion).

**La signature du type porte :**
- **la conversion intrinsèque** (D579) — la fonction au nom du type
  (`text(x)`, `montype(x)`) ; la promotion implicite sans perte
  seulement (D581) ;
- **la table des opérateurs** (D581) — les combinaisons d'opérandes
  admises et le type du résultat ;
- **les comparateurs** (D582) — l'ordre des règles de tri, l'égalité
  de l'équivalence ; le `select` (D584) ;
- **les fonctions dédiées** (D579) — `distance`/`euclide` pour la
  géolocalisation : « un type emmène avec lui des fonctions
  dédiées » ; `extract` pour le texte (D817 — la regex, les groupes
  nommés au point) ;
- **les accès aux sous-items** (D772–D773) — un type composé expose
  **ses parties nommées via des fonctions** : `value`/`currency`
  (amount), les coordonnées/l'adresse (geolocation), les bornes
  (period)… — la signature les déclare, un composé sans ses accès
  est incomplet ;
- **le composant par défaut au nom du type** (D458) — le type-hook
  nomme son composant comme le socle nomme les siens ; le contexte
  départage les espaces de noms ;
- **les règles de tri et le nul** (D368 et suivantes), la recherche,
  le masque — le kit des facettes ;
- **la représentation obligatoire** (D459) : « aucun type sans
  visage » — le composant d'écran et/ou le rendu de document ;
- **les règles de conversion vers un storage** (D681–D682 — le
  patron visiteur) : « le contrat d'un type doit inclure les règles
  de conversion vers un storage » — la classe storage visite le
  type, le type se décrit, la classe rend la forme native ; le
  contrat couvre **les trois gestes du champ** (D682) : la création
  (les colonnes natives), la modification (l'altération + le
  transcodage — D647/D673), la suppression — **et les fonctions de
  valeur** (D683) : `create`/`update`/`read` d'une valeur (la forme
  native écrite et relue) — et **l'identification** (D684) : le type
  sait **se reconnaître** dans une structure native à l'introspection
  (`read_instance` compose les identifications) ; un type-hook sans
  ses règles de conversion ne se stocke pas — l'ingestion le refuse.

**La collection est un type — et porte les agrégats** (D580) : les
fonctions de la collection (`list of`, `association with`) sont ses
méthodes — `commandes.sum(montant if etat = "facturée")` (l'élément
en contexte implicite dans la parenthèse), `count()`, `avg`,
`min`/`max` (universels — tous les types sont triables, D575),
`first`, `last`, `any`, `exists` ; la forme contextuelle sans préfixe
quand la collection est le contexte (l'assise d'un chart — D517).

**Le type `label`** (D585–D586) — le type-hook du socle qui montre la
voie : l'accès au catalogue des labels (D440), les gabarits nommés
paramétrables (`label(mon_nom, { prenom: …, nom: … })` — l'ordre des
mots par langue), et l'enregistrement en paramètre
(`label(mon_nom, customer)` — « le nom des champs devient les
paramètres »).

**L'exemple** — le fondateur des échanges (« définir un type
progression… puis un champ avancement de type progression ») :

```yaml
# le type déclaré au setting (l'instance, le module ou l'entité)
settings:
  types:
    progression:
      type: integer[0..100]        # le socle du type (le chaînage possible)
      component: fuel              # son visage (D459)

# l'usage — comme un type du socle (D408 : le mot hook n'apparaît pas)
fields:
  avancement: progression
```

### 2. Le hook de composant (D64–D68, D452, D566)

Ajoute **un composant graphique** au catalogue — une feuille, un
conteneur, une surface (D455 : « une facette = un hook »).

**Le contrat (D566.7)** : « un objet qui se chargera de gérer le
composant **et son rendu dans les différents formats — Web, PDF,
Word, Excel, Email…** » (les destinations D564). Le composant
personnalisé est **un nœud comme les autres** (D452) — la signature
commune (l'adresse `<type>[<nom>]`, le `visible:` vivant,
l'évaluation paresseuse, les enfants déclarés, la pile de contexte —
D566–D567) — et **« l'écriture repasse toujours par les champs et
leurs règles »** : le composant ne contourne jamais le modèle.

**L'exemple** — consigné à l'ère du modèle unifié (« le champ écrit
`gauge_3d` comme il écrirait un composant du socle ») :

```yaml
# le hook enregistre « gauge_3d » au catalogue des composants —
# l'objet gère le rendu Web, PDF, Word, Excel, Email (D566.7)

# l'usage — la première classe (D65/D68) :
fields:
  progress_ring:
    type: percentage
    component: gauge_3d            # comme un built-in ; s'il échoue, le repli (D68)
```

### 3. Le hook d'opération (D570, D594–D601)

Ajoute **une opération** — « une opération ne se construit pas dans
la configuration : elle se construit toujours à l'aide d'un hook de
code » (D570). Les 19 opérations de socle (D574, `migrate` D667,
`anonymize` D697) sont les hooks embarqués : `create`, `read`,
`update`, `delete`, `duplicate`, `promote`, `demote`, `generate`,
`download`, `print`, `send`, `export`, `import`, `report`,
`restore`, `notify`, `refresh`, `migrate`, `anonymize`. **Chaque
opération porte un degré intrinsèque d'autorisation, déclaré à son
contrat** (D697/D699 — `user` | `manager` | `administrator`, le
plancher que la déclaration ne peut abaisser ; le groupe
d'utilisateurs porte le degré, l'appartenance à un groupe est
obligatoire ; `allow:` précise les groupes autorisés — D700, le plus
exigeant l'emporte).

**Le contrat — l'objet aux quatre fonctions (D595) :**

| la fonction | le rôle |
|---|---|
| `execute` | remplit **la transaction tenue ouverte** (D594) — le preview est l'exécution suspendue avant le commit |
| `confirm` | la relecture — le message-label (D597) aux valeurs nommées (`nb_creations`, `nb_updates`, `nb_deletes`… — D598), ou un formulaire nourri par la transaction (D600–D601) |
| `commit` | scelle — et **retourne l'issue** (l'écran, le téléchargement, l'impression, le message, rien — D570/D597) : le moteur lit et déclenche |
| `rollback` | défait proprement |

Les cinq portées (D570) : l'enregistrement, la liste, la sélection,
le module, l'application. `commit: auto | confirm` à la déclaration
(D596). L'opération voit **la pile des contextes** (D553) et peut
appeler une fonction — jamais l'inverse (D571).

**Le pont hook/déclaration (D609)** : le hook **est** l'opération ;
la déclaration (`operations:` — D432) en décrit **l'usage** — le nom,
les paramètres, le `commit:`, la garde `if` (D430), **le formulaire
d'appel** (`form:` — D775 : les champs du formulaire sont les
paramètres du hook, **la validation du formulaire est l'opération** ;
la symétrie avec le confirm D600 — le formulaire aux deux bouts), et
**le mode de déclenchement quand il n'est pas lié à l'IHM** : `when:
<expression>` (D428), `every: continuous` (D435 — sur une mise à
jour), le calendaire (D434), **l'événement de connecteur** (les
webhooks, l'import automatique à la réception d'un fichier —
`when: <connecteur>[.<point d'entrée>]`, **un abonnement posé à
l'initialisation de l'application** — D641 ; le webhook entrant
s'authentifie obligatoirement — D642). L'IHM lie sans
déclaration (le bouton, la colonne, les actions, le step, le menu).
**Et la composition déclarative** : « une opération peut être une
liste d'opérations disponibles dans le socle » — les effets de D432
sont **des références aux hooks** (`notify` → notify, `document` →
generate, `set` → update, `function` → une fonction) ; « ne se
construit pas dans la configuration » signifie *pas de code* —
l'orchestration de références est déclarative, et la séquence
s'exécute **dans la même transaction tenue ouverte** (D594).

**L'exemple** — le fil `sales.order` :

```yaml
# sales/entities/order.yml — la déclaration référence le hook par son nom
operations:
  invoice:
    scope: selection               # les cinq portées (D570)
    commit:
      mode: confirm                # auto | confirm (D596)
      form: default                # la relecture au formulaire (D600)
      message: { fr: "{nb_creations} factures créées" }   # les valeurs nommées (D598)
```

Le hook `invoice` (le code) : `execute` crée les factures **dans la
transaction tenue ouverte** ; `confirm` laisse le moteur présenter le
formulaire et le message ; `commit` scelle et retourne l'issue
(`download` du PDF, par exemple) ; `rollback` défait si l'utilisateur
annule.

**Le wizard, la même transaction** (D546–D547/D594) : les steps qui
portent une `operation:` s'exécutent **dans la transaction du
wizard, tenue ouverte au fil des étapes** — « la transformation
n'aura lieu qu'à la validation définitive du wizard » ; la
confirmation validée barre le retour (le cliquet — D505/D547) ;
l'abandon annule tout.

**Ce que le hook lit** : **la pile des contextes** (D553 —
l'opération au fond de la pile voit le périmètre de la liste,
l'enregistrement du formulaire, le transitoire du wizard),
**`context.`** (D589 — `user` traversable, `location`, `now`,
`instance`/`application`/`module`, `entity`/`field`,
`file`/`page`/`pages` au document) et **`context.settings.<nom>`**
(D588/D591 — `{ mode: static | dynamic, type:, value: }`, la
cascade application → module → entité, le dynamique ajusté au module
d'administration — D573). La fonction lit le contexte **en lecture
seule** (D571).

### 4. Le hook de fonction (D571, D592–D593)

Ajoute **une fonction** — le calcul pur : une valeur (ou une liste)
aux types du modèle, ou **des valeurs nommées** (D593 — la regex à
groupes nommés nourrit plusieurs champs d'un seul appel).

**Le contrat** : les paramètres typés, le résultat déclaré (le typage
statique D581 s'y appuie), le contexte en lecture seule — **aucune
écriture, aucune opération déclenchée** (la pureté D571). Le moteur
appelle au fil du **graphe d'exécution acyclique** (D592 — le cycle =
une erreur d'ingestion), au paramètre modifié.

**Les fonctions libres** (D583/D587) complètent le monde des
fonctions : les variadiques scalaires (`min`, `max`, `sum`, `avg` —
`max(0, stock.sum(quantity))`) et `iif(condition, alors, sinon)` —
« le catalogue s'enrichira, si besoin » : la porte des hooks de
fonction libre.

**L'exemple** — la regex aux groupes nommés (D593) :

```yaml
# la déclaration du hook (la signature — le code au langage de Syncytium)
functions:
  extract_name:
    parameters: { raw: text }
    result: { prenom: text, nom: text }   # les valeurs nommées (D593)

# l'usage — un seul calcul, deux champs (le graphe D592)
fields:
  prenom: { formula: extract_name(raw).prenom }
  nom:    { formula: extract_name(raw).nom }
```

### 5. Le hook de connecteur (D603–D642)

Ajoute **une classe de connecteur** — la passerelle globale, déclarée
à l'environnement (`environments/<env>.yml` — D603/D617, aucune
déclinaison). **Les huit familles sont closes** (D619/D623/D692) :
`storage` (les bases — et les formats csv/xml/json des exports et
imports, D636), `smtp`, `file` (le guetteur), `directory` (l'AD
Azure), `location` (le géocodage), `webhook` (les entrées servies),
`siren`, **`authentication`** (D692 — le contrat
`challenge()`/`verify(preuve)` aux deux visages, l'utilisateur et
l'API ; les classes `local`/`azure_ad`/`sso` ; la session et le
rapprochement du compte au moteur — D82/D686) — « il n'existe pas de
hook de famille : le hook porte sur l'implémentation d'une famille »
(une classe, jamais un contrat neuf ; `route` attend une version
ultérieure du moteur).

**Le contrat par famille (D605/D620)** : « chaque famille a ses
propres méthodes et fonctions » — la famille contraint le contrat, la
conformité de la classe se vérifie au chargement. **Et le socle
commun d'abord** (D621–D630) : toute classe reçoit **sa déclaration
entière à l'initialisation** — les `parameters:`, les `secrets:` et,
pour les storages sources, **la carte `entities:`** (D828/D829 — le
mapping entités ↔ fichiers, les options de lecture D845–D848 ;
optionnelle, les familles sans fichiers l'ignorent) ; **le
connecteur porte les informations système `connector.*`** (D849) —
`connector.filename`, `connector.path`, `connector.line`
(l'identifiant de la ligne **par rapport à la zone**, la ligne
vivante — jamais la ligne réelle du fichier), la liste extensible —
offertes aux sources et au mapping ; toute classe implémente
`initialize`/`release`, `connect`/`disconnect`, `ping()` (le statut
error/initialized/disconnected/connected/closed, la fréquence à
`every:`), `onerror` (le mock ou la page de maintenance — D627) et
`describe()` (la documentation markdown/html de l'instance — D630).
Les contrats détaillés — storage (la transaction, l'instance —
`read_instance`/`duplicate_instance`/`rename_instance` —, les
entités et les enregistrements composés des types-visiteurs
(D680–D689 : l'écriture en lots, la lecture au curseur), la
migration à chaud orchestrée par le moteur), smtp (`send`), file
(`get_files`/`get_file`/`commit`), directory (la lecture seule),
location (`geocode`/`reverse`), webhook (les entrées, l'abonnement,
l'authentification obligatoire), siren (`verify`) — sont dans
[connectors.md](connectors.md). Les propriétés paramètrent (pas de contexte — le démarrage du projet),
**les secrets par variable d'environnement chiffrable** (D603), les
deux sens décrits (D606) — et **le stockage des entités est lui-même
un connecteur** (D606) : les bases du catalogue portent l'instance,
pas seulement l'échange. **La migration inter-connecteurs** (D606) :
« Syncytium peut convertir ou transférer des données d'un connecteur
à l'autre » — le changement de moteur (SQLServer → PostgreSQL…) par
la translation déclarative (le primitif aux quatre usages), **en
instantané ou en différentiel** — le différentiel rejoignant la
réplication passive du PCA-PRA (D112–D114).

**L'exemple** — la déclaration à l'environnement (D603/D617) :

```yaml
# environments/production.yml — chaque environnement les siens (D617)
connectors:
  location:                        # le nom = le type (D612–D613)
    class: ban            # l'implémentation compatible (D294/D604/D613)
    parameters: { url: https://api-adresse.data.gouv.fr }
    secrets: [api_key]             # la référence — la valeur en variable
                                   # d'environnement, chiffrable (D603)
  incoming_orders:
    type: file                     # le type — le contrat de famille (D605/D613)
    class: file_std
    parameters: { path: /exchange/in, format: csv }
    every: 5min                    # le guetteur — détecté, relu (D604)
```

### 6. Le hook de style (D752–D755)

Ajoute **un style** au catalogue — « au même titre que les
composants graphiques, Syncytium propose un ou plusieurs styles »
(D752) : le socle fournit les siens, le hook en apporte d'autres
(le comportement des hooks — D52/D408, le repli D68).

**Le contrat (D754–D755)** : le style décrit **le cadre technique**,
porté par le langage de Syncytium (comme les hooks de code — D570) ;
pour le Web, **la représentation HTML des types (le hook
d'affichage — D566.7) est complétée par un CSS3 (le style)** — le
découpage net par type : la structure d'un côté, la présentation de
l'autre. **Le hook de style complète l'affichage aux côtés du hook
d'affichage** ; la structure des styles **ne se généralise pas
forcément** — pas de schéma unique imposé.

**Le thème n'est pas un hook** : c'est **une combinaison de styles**
(D755) — déclaré dans `themes/` (D753), il assemble et surcharge ;
l'utilisateur le choisit à son profil, les droits s'y appliquent
(un objet comme les autres).

### Les autres points d'extension consignés

- **les écrans et les formats CSV/Excel** (D418 — le glossaire les
  élargit) ; **les graphiques au-delà de 2 axes** (D239) ; **le
  recadrage d'image** (D263 — le patron) ; **le tracé de la route**
  (D514) ; **la comparaison du kpi** (D245) ; **la proximité en
  filtre** (D294) ; **les formats du template** (D565 — « étendu à
  d'autres formats en fonction des besoins ») ; **les fonctions
  libres** (D587 — « le catalogue s'enrichira, si besoin »).

## Les règles transversales

1. **La librairie d'exploration** (D572/D599) : le hook lit le modèle
   « de façon transparente » (les noms logiques, jamais le stockage)
   et écrit dans la transaction — **« la librairie mise en place
   assure l'inviolabilité des règles et des droits »** : les droits
   (D196), la confidentialité (D25/D364), la validation (D307), la
   concurrence par champ (D111) ne se contournent pas — **le hook est
   un citoyen du moteur, jamais un super-utilisateur** ;
2. **Le renvoi historique « domaine 6 »** (D408/D452/D459) se relit
   (D602) : le contrat des hooks est couvert par Q60 (D570–D601) ; le
   reliquat — la sandbox, le langage du code — relève du domaine 7 ;
3. **La signature d'abord** : chaque famille déclare ce que le typage
   statique (D581) et l'ingestion (D330/D344) vérifient — l'erreur ne
   passe jamais l'ingestion.
4. **describe partout** (D645 — généralise D630) : **tout hook porte
   une méthode `describe`** qui écrit la documentation de son
   fonctionnement — la documentation technique de l'application
   (celle de Syncytium + les hooks ajoutés automatiquement) se
   construit **dynamiquement, version par version** : la version
   documentée est exactement la version servie.
