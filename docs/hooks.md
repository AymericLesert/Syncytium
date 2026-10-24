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
  ce que Syncytium embarque et ce que le concepteur ajoute passent
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
`description`, `code`, `properties` et, quand il embarque des
bibliothèques, `dependencies` (D1432) — les chemins relatifs au
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
ci-dessus est la convention du cas 4.)*

```yaml
# hooks/hooks.yml — l'étage des familles (D777)
operations: ~{operations/operations.yml}   # la référence explicite (D956)

# hooks/operations/operations.yml — la liste des fiches (le pattern D806)
operations:
  - ~{.*/.*\.yml}

# hooks/operations/dupliquer/dupliquer.yml — la fiche du hook (D809)
name: dupliquer
description: documentation.md        # → le md du fonctionnement (D778) — un md par langue, comme les autres textes
                                     #   (D1403, D1405) : description: { fr: ~{documentation.fr.md}, en: ~{documentation.en.md} }
code: source.txt                     # → le code — le langage du domaine 7 (D570)
properties: { }                      # les propriétés du hook
dependencies: [ ]                    # les bibliothèques embarquées — le nom, la version, la licence (D1432) ; absente = aucune
```

**Chaque hook s'accompagne d'un fichier md par langue qu'il supporte**
(D778 — la fiche le référence par `description:`, D809 ; D1403 — un md
par langue, avec les gabarits de D562 qui y insèrent les `properties` et
la déclaration du hook) décrivant son fonctionnement — la brique humaine
de la documentation générée ; Syncytium décrit ses propres hooks de
même, dans sa section `hook:`, une sous-section par famille, une par
implémentation (D1403). Un
dossier par hook ou tout dans un même fichier : l'éclatement est
libre (D767/D807/D809). **La documentation fonctionnelle reprend ce md
comme la description de l'opération** — « ce qu'elle fait », dans la
section de l'entité (D1196/D1227) ; une opération qui en enchaîne
plusieurs se décrit par la liste de ses étapes, chacune avec sa
description (D1227). Le md est une configuration : il ne cite ni
décision ni histoire du cas (D1085) — les md des hooks du véhicule et
de la banque sont à nettoyer sur ce point.

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
  (`get_instance` compose les identifications) ; un type-hook sans
  ses règles de conversion ne se stocke pas — l'ingestion le refuse ;
  **depuis D1298, la règle de conversion est la déclinaison** : un
  élémentaire avec ses propriétés génériques, ou une liste nommée
  d'élémentaires, le storage ne transcrivant que ceux-là ;
- **la facette documentation** (D1301 — le rang 2) : le type livre
  **cinq choses**, le moteur assemble — **la forme en clair**, par
  langue du moteur, les réglages fondus (« une date, écrite AAAAMMJJ »,
  « un texte de 40 caractères au plus » — D1160, D1253) ; **la
  déclinaison** en élémentaires (D1298) ; **les indicateurs** qu'il
  mesure (D1288) ; **l'exemple** — le `placeholder` du type (D1307), quand le champ n'a
  pas le sien (D1211) ; **le marquage** qu'il porte, `rgpd:` (D1178) ;
  et, pour le chapitre du stockage, **les modes de recherche qu'il
  admet** — les index que le storage en tire (D1292) — et **s'il peut
  porter une partition** (D1293).
  Le moteur résout les trois niveaux de réglages (D1239) avant l'appel,
  le type reçoit ses facettes appliquées et formule ; les mots viennent
  du catalogue par langue (D1160/D1163), un type ajouté apporte ses
  items ; un type dérivé hérite de la facette de son socle et peut
  reformuler ; le glossaire des types (l'annexe B du dictionnaire) se
  construit de ces livraisons ; un type sans sa facette est complet
  pour tourner, incomplet pour documenter — la complétude le relève
  (D1221), l'ingestion ne le refuse pas.

**La collection est un type — et porte les agrégats** (D580) : les
fonctions de la collection (`list of`, `association with`) sont ses
méthodes — `commandes.sum(montant if etat = "facturée")` (l'élément
en contexte implicite dans la parenthèse), `count()`, `avg`,
`min`/`max` (universels — tous les types sont triables, D575),
`first`, `last`, `any`, `exists` ; **`group(champ, …)`** — le « group
by » d'une liste (D1015) : une cellule par combinaison de valeurs des
champs nommés, l'agrégat qui suit s'évalue par cellule, le résultat est
un hypercube (D897) aux dimensions des champs —
`mouvements.group(emplacement, article).sum(…)` ; **`sort(champ, …)`** — le
tri d'une liste en ligne (D1017), les clés dans l'ordre, `first()`/`last()`
sans argument rendent l'élément en tête ou en queue
(`commandes_vente.sort(owner.date).last().client`) ; « les méthodes group
et sort sont à ajouter », leurs propriétés déclaratives `group:` et
`sort:` sur l'association (D1016/D1017) ; la forme contextuelle
sans préfixe quand la collection est le contexte (l'assise d'un chart —
D517).

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

**Le pivot avec le storage** (D1297 — le 15/10/2026) : « Le storage
influe le hook des types pour définir les propriétés ou les éléments à
couvrir. Au storage de faire le nécessaire pour exploiter au mieux ces
données. » — le storage énonce la liste de ce qu'il attend d'un type ;
le type la couvre par sa déclinaison en types élémentaires — un
élémentaire ou une liste nommée d'élémentaires, le format pivot
(D1298) — et ses règles de transcription (D1296) ; la forme en
clair, les indicateurs (D1288) et la règle de stockage sont les trois
facettes que le contrat du hook de type livre à la documentation — à
écrire à l'étape 9 du rang 2.

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
code » (D570). Les 20 opérations de socle (D574, `migrate` D667,
`anonymize` D697, `reset_coverage` D881) sont les hooks embarqués :
`create`, `read`, `update`, `delete`, `duplicate`, `promote`,
`demote`, `generate`, `download`, `print`, `send`, `export`,
`import`, `report`, `restore`, `notify`, `refresh`, `migrate`,
`anonymize`, `reset_coverage` (la dernière valeur parcourue d'une
entité remise au départ — le `migrate` suivant relit la totalité,
rien du module n'est effacé, D1030). **Chaque
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

**Les propriétés intrinsèques du contrat** — « une opération
s'exécute et elle possède aussi des propriétés » : ce qui tient au
code, « pas exposable dans la configuration mais dans le contrat du
hook » (D699, D904–D905) ; la liste reste ouverte :

| la propriété | le sens |
|---|---|
| `degree: user \| manager \| administrator` | le plancher d'autorisation (D697/D699) |
| `execution: once` | **l'exécution unique** (D57) — pas de rollback des effets, pas de rejeu automatique ; la relance est manuelle, depuis la supervision |
| `deterministic: true \| false` | **l'opération est déterministe ou pas — « elle ne peut pas changer sans faire changer son code »** (D59/D904) : l'assertion du code — un doublon (même opération, mêmes paramètres) dans la fenêtre reçoit **le résultat mémorisé**, sans ré-exécution ni effet répété |
| `deterministic_duration: <durée>` | **la fenêtre de mémoïsation** (D59) — « cela dépendra éventuellement de la façon dont elle sera implémentée » : le hook la porte, la configuration ne la surcharge jamais |
| `connectors: { <nom>: <famille> }` | **les connecteurs attendus pour l'exécution** (D913) — « le hook décrit les types de connecteurs utilisés (comme des paramètres d'exécution) » : nommés et typés par leur famille (`documents: file`, `mailer: smtp`) ; **la déclaration les lie par `uses:`** au connecteur de l'environnement (D617) ; l'ingestion vérifie la liaison, la famille (D613) et la complétude par environnement ; tout connecteur non attendu est hors de portée (D599) ; **aucune liaison implicite** (D914 — `uses:` s'écrit toujours, D805 ; l'erreur d'ingestion nomme le candidat unique) |

Toutes paraissent au `describe` (D645) ; les noms de juin
(`deterministe`, `determinisme_duree`) prennent la graphie anglaise
du catalogue, la sémantique intacte (D905). **Le hook déclare, le
moteur exploite** (D905) : « ces paramètres doivent être exploités
par Syncytium pour mieux gérer le déterminisme avec un cache ou
pas » — Syncytium lit le contrat et en tire sa conduite : le cache
de mémoïsation tenu pour l'opération déterministe et vidé à
l'échéance de la fenêtre, aucun cache pour la non-déterministe,
l'exécution unique sans rejeu. L'invalidation du cache
est l'acte de l'administrateur (D60 — trois grains : l'opération +
ses paramètres, l'opération, tout). **Le cooldown, lui, est un
paramètre d'administration** (D58/D904) : le défaut en setting
dynamique de l'application (`operation.cooldown`, `1min` — D588),
la surcharge `cooldown:` à la déclaration ; **l'API seule** — une
exécution par période, mesurée de la fin de l'exécution au début de
l'appel suivant, le rappel refusé et journalisé (D43). **La
rétention du résultat** de même (D55/D906 — « un paramètre
d'administration, je valide ») : `operation.retention` en setting
dynamique (`90d`), la surcharge `retention:` à la déclaration, le
résultat échu purgé. Le partage de juin est complet : quatre
propriétés au contrat, deux paramètres à l'administration.

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
s'exécute **dans la même transaction tenue ouverte** (D594). **Le
`notify` sans destinataire remonte à tout le monde, dans la zone des
notifications de l'application ; le relais par mail est le choix de
chacun, dans son profil** (D1228 — ma lecture : « tout le monde » =
ceux qui voient l'entité, D334). **La documentation** d'une opération
composée est la liste de ses étapes, chacune avec la description de
son hook (D1227).

**L'exemple** — le fil `sales.order` :

```yaml
# sales/entities/order.yml — la déclaration référence le hook par son nom
operations:
  invoice:
    scope: selection               # les cinq portées (D570)
    cooldown: 10s                  # l'API seule — fin → début (D58/D904) ; défaut : le setting
    retention: 30d                 # le résultat consultable (D55/D906) ; défaut : le setting
    uses:                          # le lien attendu → déclaré (D913)
      documents: archive           #   le connecteur `archive` de l'environnement (D617)
      mailer: company_smtp
    commit:
      mode: confirm                # auto | confirm (D596)
      form: default                # la relecture au formulaire (D600)
      message: { fr: "{nb_creations} factures créées" }   # les valeurs nommées (D598)
```

Le hook `invoice` (le code) déclare à son contrat `connectors: {
documents: file, mailer: smtp }` (D913) ; `execute` crée les factures
**dans la transaction tenue ouverte** ; `confirm` laisse le moteur présenter le
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
`max(0, stock.sum(quantity))`) — `iif` est retiré au profit du
conditionnel natif `valeur if condition else autre` (D1110) —
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
entière à l'initialisation** — les `parameters:` (les secrets y sont
les paramètres marqués `*`, D944) et,
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
`get_instance`/`duplicate_instance`/`rename_instance` —, les
entités et les enregistrements composés des types-visiteurs
(D680–D689 : l'écriture en lots, la lecture au curseur), la
migration à chaud orchestrée par le moteur), smtp (`send`), file
(`get_files`/`get_file`/`commit`), directory (la lecture seule),
location (`geocode`/`reverse`), webhook (les entrées, l'abonnement,
l'authentification obligatoire), siren (`verify`) — sont dans
[connectors.md](connectors.md). Les propriétés paramètrent (pas de contexte — le démarrage du projet),
**les secrets par paramètre marqué `*` et variable d'environnement
chiffrée** (D603/D944), les
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
    parameters:
      url: https://api-adresse.data.gouv.fr
      api_key*: ${BAN_API_KEY}     # la marque * (D944) — la référence seule,
                                   # la variable chiffrée (D603/D902)
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

0. **Le hook d'interface, seul code tiers au navigateur** (D918 —
   D66/§8.2) : il ne reçoit jamais `private`, il relève de l'UX et
   jamais de la sécurité (le serveur arbitre), il est **sous la
   responsabilité du concepteur** et **listé par la documentation
   générée** (`describe`, D645) pour que l'administrateur sache quel
   code tourne chez ses utilisateurs ; la page n'autorise que les
   scripts qu'elle connaît.
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
4. **La documentation du hook est déclarée** (D1403 — amende D645/D630
   pour les textes) : **le md par langue**, avec ses gabarits, décrit le
   fonctionnement ; `describe` ne rédige plus — ce qui n'est pas un
   texte reste calculé depuis les déclarations du hook (la
   correspondance logique-physique du storage D1255/D1299, la forme en
   clair d'un type D1160) ; la documentation de l'application (celle de
   Syncytium + les hooks ajoutés) se construit **version par version** :
   la version documentée est exactement la version servie.

## La documentation — la facette du hook (D1158–D1159)

*(La rubrique de la matrice de [documentation.md](documentation.md)
§13 ; la colonne 1 — la fonctionnelle — remplie, les autres à leur
rang.)*

**Le hook d'opération, dans la fonctionnelle** : son md (`description:
~{documentation.md}`, D778/D809) **est la description de l'opération**
— « ce qu'elle fait » dans la table des opérations de la section de
l'entité (D1196, D1227) ; une opération qui en enchaîne plusieurs se
décrit par la liste de ses étapes, chacune avec sa description
(D1227) ; « ce qui la déclenche » vient de la déclaration — le bouton,
le `when:`, la période (D428/D609), le formulaire d'appel et ses champs
(D775) ; les opérations que l'utilisateur ne déclenche pas
(`migrated`, `generated`) figurent parce qu'elles transforment ce
qu'il voit (D1209) ; sans `label:`, le nom (D1181). Le md est une
configuration : ni décision ni histoire du cas (D1085, D1228).

**L'effet `notify`** sans destinataire remonte à tout le monde dans la
zone des notifications de l'application ; le relais par mail est le
choix du profil (D1228) — la section le dit ainsi.

**Le hook de type** livre la facette documentation du type — le type en
clair, ses contraintes, son exemple, dans chaque langue du moteur
(D1162) — pour le dictionnaire (D1215 : « les hooks de type devront
être adaptés ») ; le contrat s'écrit au rang 2.

**Les langues** : chaque hook porte ses textes dans les langues
attendues (D1162–D1163, D1403 — un md par langue) ; un hook ajouté à
Syncytium pour Syncytium les porte toutes ; un hook du concepteur,
celles de sa version ; une langue manquante est une erreur d'ingestion.

**Les hooks, dans le dictionnaire de la donnée** (la colonne 2 — le rang
2) : **la notion de hook n'y apparaît pas** (D1244 — « les hooks
s'intégreront au document sans que la notion de hook apparaisse ») ; le
lecteur voit ce que chaque hook livre par sa facette : **le hook de
type**, la forme en clair, la déclinaison, les indicateurs, l'exemple, le
marquage (D1301) ; **le hook d'opération**, la description de
l'opération (D1227) et son contrat au chapitre 4.3 — ce qu'elle lit, ce
qu'elle écrit, ses effets (D1262) ; **le hook de fonction**, le texte des
formules dans les règles de l'entité (D1254) ; **le hook de connecteur
storage**, le chapitre 3 par `describe(model)` (D1299) ; les hooks de
composant et de style, rien. L'inventaire des hooks câblés et comment en
écrire un vont à la documentation du développeur (D1244).

**Les hooks, dans la réglementation** (la colonne 5 — le rang 3) : **le
hook d'opération** est un traitement quand il implique un champ `rgpd:`
(D1317) — la déclaration porte le bloc `rgpd:` du traitement
(`controller`, `legal`, `purpose`, D1322) et, pour une suite, `operations:
[ … ]` fait une ligne du registre (D1318, D1329) ; **la famille `rgpd`**
des opérations du socle — `rgpd.extract(identity)`, `rgpd.anonymize`
(D1333) — ; **le hook d'interface**, seul code tiers au navigateur, est
nommé au chapitre de la sécurité (D918, D1337) ; **le hook de
composant** passe les tests du RGAA comme les composants du socle
(D1340) ; **le hook de connecteur** porte `rgpd: { countries: [ … ] }`
(D1328).

**Les hooks, dans le projet et le support** (la colonne 8 — le rang 4) :
rien de propre — les opérations ne sont pas des écarts (D1281) ; les
notifications des tickets et l'alerte du profil passent par le
mécanisme des notifications du socle (D1366, D108/D397).

**Les hooks, dans la documentation du développeur** (la colonne 3 — le
rang 5) : **l'inventaire** par famille (D1404, D1406) — la fiche, la
description par son md dans la langue du lecteur (D1403, D1405), les
propriétés `degree`, `execution`, `deterministic`, les connecteurs, les
références comptées et localisées, le code par son existence et son
emplacement ; **le hook d'opération** au contrat d'API, son md montré au
technicien (D1402), ses paramètres dont le changement est un écart
(D1401) ; **la référence** pour en écrire un, six chapitres par
famille, celle du core nommé par `from:` (D1408) ; **la skill**, la
couche du core et le complément de la version (D1409–D1410).

**Les autres colonnes** — à leur rang : le D.A.T. (le hook d'interface, le seul
code tiers au navigateur, D918) ; la maintenance (la fréquence
d'emploi de chaque opération, D1168).
