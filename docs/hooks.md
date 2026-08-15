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
  un composant, une opération, une fonction, un connecteur) — et ce
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

## Les familles

### 1. Le hook de type (D408, D459, D579–D584)

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
  dédiées » ;
- **le composant par défaut au nom du type** (D458) — le type-hook
  nomme son composant comme le socle nomme les siens ; le contexte
  départage les espaces de noms ;
- **les règles de tri et le nul** (D368 et suivantes), la recherche,
  le masque — le kit des facettes ;
- **la représentation obligatoire** (D459) : « aucun type sans
  visage » — le composant d'écran et/ou le rendu de document.

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
code » (D570). Les 17 opérations de socle (D574) sont les hooks
embarqués : `create`, `read`, `update`, `delete`, `duplicate`,
`promote`, `demote`, `generate`, `download`, `print`, `send`,
`export`, `import`, `report`, `restore`, `notify`, `refresh`.

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
les paramètres, le `commit:`, la garde `if` (D430), et **le mode de
déclenchement quand il n'est pas lié à l'IHM** : `when:
<expression>` (D428), `every: continuous` (D435 — sur une mise à
jour), le calendaire (D434), **l'événement de connecteur** (les
webhooks, l'import automatique à la réception d'un fichier —
`when: <nom du connecteur>` en proposition). L'IHM lie sans
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

### 5. Le hook de connecteur (D603–D606)

Ajoute **un connecteur** — la passerelle globale (`connectors.yml` à
la racine, aucune déclinaison — D603). Le catalogue de base (D604) :
les bases de données standard (SQLServer, MySQL, PostgreSQL…), l'AD
Azure, les fichiers (CSV, JSON — le guetteur à `every:`), le
géocodage (`ban`/`nominatim` — D294), l'itinéraire
(`osrm`/`valhalla` — D514), le mail (`smtp` — D564), la reprise
(D175–D179).

**Le contrat par famille (D605)** : « chaque famille a ses propres
méthodes et fonctions » — la base de données les siennes, le fichier
sa veille et sa lecture, le géocodage son adresse et son inverse. Les
propriétés paramètrent (pas de contexte — le démarrage du projet),
**les secrets par variable d'environnement chiffrable** (D603), les
deux sens décrits (D606) — et **le stockage des entités est lui-même
un connecteur** (D606) : les bases du catalogue portent l'instance,
pas seulement l'échange. **La migration inter-connecteurs** (D606) :
« Syncytium peut convertir ou transférer des données d'un connecteur
à l'autre » — le changement de moteur (SQLServer → PostgreSQL…) par
la translation déclarative (le primitif aux quatre usages), **en
instantané ou en différentiel** — le différentiel rejoignant la
réplication passive du PCA-PRA (D112–D114).

**L'exemple** — la déclaration à la racine (D603–D604) :

```yaml
# connectors.yml — à la racine de la version, global (D603)
connectors:
  geocoding:
    hook: ban                      # le catalogue de base (D294/D604)
    parameters: { url: https://api-adresse.data.gouv.fr }
    secrets: [api_key]             # la référence — la valeur en variable
                                   # d'environnement, chiffrable (D603)
  incoming_orders:
    hook: file                     # le connecteur de fichiers (D604)
    parameters: { path: /exchange/in, format: csv }
    every: 5min                    # le guetteur — détecté, relu (D604)
```

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
