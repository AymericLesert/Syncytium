# La sécurité et les droits de Syncytium

Ce document rassemble **la nature et les exemples des échanges
consignés sur la sécurité et les droits** — le huitième artefact
préparatoire de la documentation (Q58, le domaine 6 — D602), après le
[glossaire](glossaire.md), les [composants](syncytium/04-composants/README.md), les
[hooks](syncytium/01-configuration/04-version.md#39-hooks--le-mécanisme-des-hooks), les [types](syncytium/02-modele/05-types.md), les
[connecteurs](syncytium/05-connecteurs/README.md) et le [mapping](mapping.md). Les
décisions citées renvoient à la [conception](conception.md). Il
consolide l'acquis (le pilier P8 — la sécurité par construction) et
porte les points du chantier ouvert (le sujet 2 de la passe de
complétude).

## La doctrine

- **La sécurité par construction** (P8) : les niveaux de
  confidentialité emboîtés, l'audience au niveau ligne à identifiants
  opaques, les droits d'action au modèle — jamais une couche ajoutée
  après coup ;
- **Restreindre, jamais étendre** (D190/D416) : un module restreint
  la surface visible, il n'étend jamais les droits ;
- **Masquer, ne jamais détruire** (D137/D141) : la suppression est
  une désactivation ; l'effacement physique est l'exception tracée
  (la reprise — D184) ;
- **L'anti-oracle** (D144/D153) : l'interdit ne se devine pas — ni
  par la navigation, ni par les messages, ni par les comptages ;
- **Fail-closed** (D71) : la ligne sans propriétaire est invisible ;
  le non-exposé est le défaut ;
- **La librairie inviolable** (D599) : « la librairie mise en place
  assure l'inviolabilité des règles et des droits » — le hook est un
  citoyen du moteur, jamais un super-utilisateur.

## La confidentialité (D25–D27, D364)

Le niveau d'exposition d'une donnée : **`public`** (partout),
**`protected`** (l'interface et les tâches), **`private`** (les
tâches seulement) — **resserrable par groupes**, déclarable à
l'entité et **au champ** (D364) ; **un profil nommé à la racine du
projet se cite par son nom**, `confidentiality: financier`, la forme
courte, et la forme longue, `{ level: , groups: [..] }`, s'écrit au
champ sans profil (D885, D1536, D1798) ; un profil ne porte jamais le
nom d'un niveau, `public`, `protected`, `private` (D1799) :

```yaml
fields:
  salary:
    type: amount
    confidentiality: protected      # le niveau (D25), resserrable (D26)
```

La confidentialité irrigue tout : les menus filtrés (D193), l'export
aux colonnes visibles (D196), les widgets hérités surchargeables
(Q53), la communication (D393) — et jusqu'aux **thèmes** (D753 : un
objet comme les autres, le choix du profil n'offre que le visible).

## Les droits d'action (D196, D421–D427)

**Les droits d'action par entité s'inscrivent au modèle de
confidentialité** (D196). Deux foyers exclusifs — le nom unique
`allow` (D422–D423, « les 2 simultanément ne seront pas autorisés »,
l'erreur d'ingestion) :

```yaml
# LE CYCLE : allow par état (D422) — chaque état porte ses droits
fields:
  status:
    type: enum
    values:
      draft:    { allow: [create, read, update, delete] }
      archived: { allow: [read, delete] }

# OU LA FORME LIBRE : le bloc allow d'en-tête, verbe → expression (D90)
name: order
allow:
  update: locked = false
  delete: false
```

**Un droit d'action est une règle à trois propriétés** (D1795) : `enable`,
la règle générale ; `group`, les groupes qu'elle vise, `[all]` par
défaut ; `when`, la condition d'activation. `allow:` a trois écritures
équivalentes — la liste des actes permis, `allow: [create, update,
delete]` ; l'acte vers un booléen, `allow: { create: true, update: true,
delete: true }` ; l'acte vers sa règle, `allow: { create: { enable:
true, group: [all], when: true }, … }`. `false` vaut `{ enable: false }`,
l'expression seule vaut `{ when: … }`, la liste de groupes au verbe
(D700) vaut `{ group: [...] }`, à l'opération aussi (D1797).

L'absence = tout permis ; `read` absent = l'état masque. C'est par là
qu'un enregistrement se fige : la facture validée — son numéro
attribué par l'opération de validation, une identité acquise (D1171) —
porte `validee: { allow: [read] }`, l'acte qui promeut passant outre
(D1172). **La cascade de l'allow** (D886 — le cas 5) : le bloc libre se déclare
**à tous les étages** (D1796) — l'application dans `version.yml`, non
dans `syncytium.yml`, le module, l'entité, le champ, l'écran ou un
composant de l'écran, le template…
— et **le plus proche l'emporte** (l'esprit D359) ; le module dit la
règle de ses entités (l'entrepôt en lecture seule : `allow: {
create: false, update: false, delete: false }` sur chaque module),
l'entité la précise si elle diffère, le champ porte ses propres
droits d'action (`update: false` = le champ en lecture seule ;
`update: [commercial, achats]` = le champ ouvert à ces groupes quand
le module est en lecture seule — D941/D942). **`allow:` s'applique à
tous les canaux (D942)** : l'IHM et l'API passent par un compte,
utilisateur ou administrateur, et **le degré `administrator` passe
outre les `allow`** — la migration, opération de ce degré (D701),
écrit dans un module en lecture seule sans que les `allow` l'arrêtent,
non parce qu'elle y échappe mais parce que son degré les passe. **Les
droits d'action couvrent les opérations du socle et les opérations
déclarées** (D691) : le droit d'exécuter se déclare et se contrôle
comme les autres droits d'action. La réconciliation avec le
passe-outre (D422) : l'opération autorisée **passe outre les `allow`
d'état** (l'acte porte sa légitimité — le promote écrit ce que
l'état fige), mais **le droit de la déclencher** relève des droits
d'action — on contrôle qui appuie, pas ce que l'acte écrit.

**Le passe-droit du statut (D835)** : hors graphe = refus (D425) —
sauf le degré `administrator` : le changement d'état hors graphe,
**toujours tracé**, pour « des cas très particuliers et urgents »
(l'erreur de saisie ou de clic — débloquer sans déployer une
version) ; la voie déclarée demeure le `demote` d'une version.

## L'audience et l'anti-IDOR (D70–D77, D144, D153)

- **Les deux audiences** (D70) : l'interne (les collaborateurs — les
  groupes et les niveaux) et l'externe (les clients — l'accès au
  niveau ligne, fermé par défaut) ;
- **l'appartenance** (D71) : directe (le champ référence-compte),
  indirecte (le chemin multi-saut `commande.client.compte`), ouverte
  (les catalogues), ou non exposée (le défaut) ; les chemins
  multiples s'unissent, la ligne sans propriétaire est invisible ;
- **les identifiants opaques** (D75/D82) : l'UUID interne jamais
  exposé — l'anti-IDOR ; la pagination au curseur opaque (D100) ;
- **la typologie des comptes** (D77) : technique (l'API),
  utilisateur interne, client provisionné, client auto-créé
  (vérifié) — l'étanchéité par canal.

## Les groupes et les modules (D341, D414–D416)

- **`groups.yml`** à la racine de la version — la hiérarchie sans
  lien parent (« un groupe est constitué d'autres groupes »),
  acyclique, la multi-appartenance naturelle (D414) ; **un membre du
  groupe contenant voit tout ce que voient les groupes qui le
  composent** (D1099) — la direction au-dessus de ses strates, jamais
  l'inverse ; **le groupe porte `description:` et, pour la
  documentation, `persona:`** (D1200) — le lecteur type du groupe : un
  prénom fictif, un rôle, une description qui, à défaut, est celle du
  groupe et, présente, la surcharge (les clés `name:` et `role:`,
  confirmées, D1790) ; ses scénarios sont les fonctionnalités de bout en bout
  que ses droits permettent (documentation.md §22) ;
- **les affectations vivent en base** — l'acte d'administration
  (D341), jamais dans le dépôt ; **l'association à un groupe du système
  d'authentification aussi** (D1788) : une interface du module
  d'authentification la saisit, par groupe, dans les propriétés que
  fournit le connecteur — le GUID pour Entra, aucune pour un connecteur
  intégré, plusieurs pour d'autres, leurs valeurs parfois énumérées ;
  enregistrées dans le module `_administration` du méta-modèle (D1789) ;
  réorganiser les droits ne redéploie pas l'application ; **une
  association par groupe nommé, une pour `administrator`, une pour le
  groupe de l'application** (D1792) — l'utilisateur qui se connecte doit
  être actif dans le système d'authentification, présent dans le groupe
  de l'application et dans l'un des groupes de l'application : désactivé,
  ou privé du droit de l'application, il n'entre pas, même présent dans
  un autre groupe ; sans aucun groupe, il est un utilisateur sans groupe,
  un `reader` (D1793) ; **le groupe de l'application est une porte
  d'entrée**, géré par le connecteur, sans rôle dans l'application ; **les
  trois conditions sont contrôlées par le connecteur d'authentification**,
  non par le socle (D1793) ;
- **le groupe `administrator` par défaut** (D712) — fourni par le
  socle, **à nom réservé** : Syncytium refuse la déclaration d'un groupe
  `administrator`, une erreur d'ingestion (D1790) ; un groupe déclaré peut
  porter le degré `administrator`, la double entrée vaut alors pour lui
  (D1791) ; **l'accès administrateur à double entrée** : le groupe
  **et** la désignation individuelle de l'utilisateur ;
- **la délégation** (D715/D749) : agir à la place d'un utilisateur —
  les droits de l'emprunté, la trace aux deux comptes ; **le même
  degré** (jamais d'élévation), **le don jamais la prise** (le
  délégant ou un administrateur), l'exception administrateur tracée ;
- **le compte technique aux groupes** (D746) : l'appartenance
  obligatoire vaut pour tous les types de comptes ;
- **le groupe absent = désactivé** (D747) : réversible, la purge
  humaine — jamais automatique ;
- **le mode safe** (D718) : le lancement dédié — le module
  administration seul, le compte administrateur principal au mot de
  passe d'installation ; tracé, jamais une porte dérobée ;
- **le module restreint** (D190/D416) : l'affectation
  utilisateur↔module ouvre une surface — elle n'étend jamais un
  droit.

## Les connecteurs et la sécurité (D603, D626, D633, D642)

- **les secrets** : le paramètre marqué `*` (D944 — `password*:
  ${VAR}`), la référence à une variable d'environnement chiffrable
  par une clé environnement+machine (D603) — le dépôt ne porte jamais
  une valeur en clair, le journal non plus ;
- **la condition indispensable** (D626) : l'application ne démarre
  que si le mail à l'administrateur est possible — le canal d'alerte
  avant tout ;
- **le `directory` en lecture seule** (D633) — la synchronisation
  des comptes, jamais l'écriture vers l'annuaire ;
- **le webhook à l'authentification obligatoire** (D642) — aucune
  entrée anonyme, la garde d'office sur la route.

## La provenance et la trace (D62, D178, D238, D429)

Toute écriture est tracée (D62) ; la provenance de la reprise
persiste après la mort du connecteur (D178) ; l'import
d'exploitation porte l'opérateur (D238) ; la trace des opérations
est l'historisation elle-même (D429).

## L'authentification (D692)

**La famille de connecteur `authentication`** — la huitième : le
contrat **`challenge()`/`verify(preuve)`**, la session et
l'orchestration au moteur (D686), le rapprochement du compte par la
clé d'unicité (D82). **Les quatre volets à porter** :

1. **`local`** — le compte géré par Syncytium : le mot de passe
   haché vérifié par le moteur ; le premier visage des comptes
   clients (D77) ;
2. **`azure_ad`** — l'annuaire : le bind vers l'AD Azure, le bearer
   Entra — le pendant authentifiant du connecteur `directory`
   (D633, la synchronisation restant à lui) ;
3. **`sso`** — la délégation : la redirection OIDC, le ticket au
   retour, la signature du jeton validée — l'utilisateur ne confie
   jamais son secret à Syncytium ;
   *(`keycloak` — D716 — en est le visage concret : l'IdP OIDC open
   source, une classe aux côtés de `sso`.)*
4. **l'API** — la preuve au porteur : la clé d'API ou le bearer dans
   chaque requête (le 401 en défi), le compte technique (D77), pas
   de session ; **la garde du webhook (D642) appelle le même
   `verify`**.

*(Le cinquième volet, né du cas d'usage domestique — **`none`**
(D759) : aucun défi, aucun secret ; l'utilisateur et le groupe par
défaut au degré `administrator` — les invariants D699/D712
pré-remplis, jamais contournés. La documentation le dit en clair — « un
seul utilisateur, tous les droits » — et la complétude ne relève pas ce
défaut du socle : le tiny en est la déclinaison, D1176/D1173. Pour
porter un persona, le mono-poste déclare son groupe dans un
`groups.yml` minimal — « en utilisant un group, nous rentrons dans le
standard », D1208 ; l'utilisateur par défaut y appartient.)*

La passerelle (D418) a son visage ; le multi-connecteurs sert
l'étanchéité par canal (D77). Voir le contrat détaillé dans
[connectors.md](syncytium/05-connecteurs/README.md).

## La session (D693–D694)

**Deux items** (D1801) : ce qui tient à la session interactive — les
bornes, le verrouillage, l'invitation — relève du connecteur
d'authentification, en paramètres à l'environnement, chaque classe
déclarant les siens — `local` tous, `sso` et `azure_ad` les deux bornes
que l'IdP peut primer, `none` aucun (D1805) ; ce qui tient aux API — la clé, sa rotation, le porteur —
se définit aux settings, le bloc `application:`, sous `api:` en
proposition (D1805) ; le « pour le compte de » n'y est pas, c'est un
paramètre de l'appel d'API du client (D1803). Le chapitre 7 dit le
principe de la clé d'API — le porteur seul, la clé rotative, le compte
technique aux groupes, la délégation bornée au périmètre du sujet — et
renvoie au chapitre 13 pour les en-têtes, le 401 et la rotation du côté
du technicien (D1805). Un connecteur d'endpoint
d'entrée, qui porterait ses paramètres d'authentification, est une idée
d'évolution, hors des versions à venir (D1802, D1804). L'écriture ci-dessous est celle
d'avant D1801 :

```yaml
settings:
  application:
    session:
      duration: { mode: dynamic, type: duration, value: 8h }   # l'inactivité
      limit:    { mode: dynamic, type: duration, value: 7d }   # l'absolu
```

- **`duration:`** — l'inactivité au glissement : chaque action
  renouvelle, le délai passé déconnecte ;
- **`limit:`** — la borne absolue : la re-authentification
  obligatoire ; pour le SSO, la borne de l'IdP prime si plus
  courte ;
- **les sessions simultanées libres** (D15) — la révocation est un
  acte d'administration (les sessions d'un compte visibles et
  coupables) ; la déconnexion manuelle toujours ;
- **l'API hors session** (D692) — chaque requête porte sa preuve ;
- **la session ne fige jamais des droits** : la vérification
  s'effectue **au début d'une opération ou d'une sollicitation**
  (D694 — l'acte entamé s'achève sous les droits de son départ, la
  transaction cohérente D594) ; la latence est minimisée par **un
  cache de droits**, invalidé à chaque modification de droits par
  les interfaces administrateur (D341).

## Le RGPD (D695–D698)

- **le marquage** (D695) : la facette **`rgpd:`** aux trois valeurs —
  `personal` (la donnée personnelle), `sensitive` (l'article 9 — le
  régime renforcé), `consent` (le traitement au consentement) — et une
  quatrième, **`identity`**, acquise (D1332, D1806 : l'identité civile
  de la personne — le nom, le prénom —, non un identifiant unique ;
  depuis ces champs, l'arbre de la donnée dit tout ce qui est lié à une
  personne ; l'opération `rgpd.extract(identity)` du socle, D1331/D1333, part
  d'eux) :

```yaml
fields:
  name:       { type: text, rgpd: personal }
  blood_type: { type: text, rgpd: sensitive, confidentiality: private }
  newsletter: { type: boolean, rgpd: consent }
```

- **l'effacement = l'anonymisation** (D696) : la valeur de
  remplacement est **construite par un algorithme à règle
  aléatoire, jamais dérivée de l'origine** (l'exception admise : la
  longueur de la chaîne) — ni un blanc, ni un haché ; la
  modification porte **les enregistrements et les historiques**
  (D168) — l'enregistrement demeure, la personne disparaît ; la
  provenance (D178), technique, survit ;
- **`anonymize`, la dix-neuvième opération du socle** (D697) :
  l'usage limité à l'administration — et le principe posé : **chaque
  opération du socle porte un degré intrinsèque d'autorisation** (le
  plancher que la déclaration ne peut abaisser) ; l'inventaire des
  degrés est flagué ;
- **la rétention** (D698) : la donnée marquée dont la rétention
  échoit **s'anonymise d'office** — la profondeur de l'historique
  (D411) est une autre chose, de l'exploitation (D1811) ; deux
  rétentions (D1810) — celle des journaux et des
  fichiers, `cleanup.yml`, relève de l'exploitation, le chapitre 10 ;
  celle des données personnelles, l'anonymisation déclarée avec sa
  règle et sa fréquence (D1334), est de ce chapitre ; **la rétention
  d'une donnée personnelle est la durée d'une fiche sans mouvement ni
  mise à jour, au-delà de laquelle les informations personnelles ne sont
  pas à conserver ; la fiche et son historique s'anonymisent ensemble**
  (D1812) ;
- **le registre des traitements auto-documenté** (D698 —
  D333/D645) : une ligne par traitement — une opération ou une suite
  impliquant un champ `rgpd:` (D1317–D1318) —, **son responsable, un
  groupe d'utilisateurs** (D1320, `controller:` ; documentaire, aucun
  droit n'en découle, D1808), les
  champs `rgpd:`, leur confidentialité, leur rétention, leurs
  connecteurs sortants — généré, jamais rédigé ; un projet sans champ
  marqué n'est pas une anomalie (D1319).

## Le degré intrinsèque d'autorisation (D697, D699–D700)

**Le contrat de chaque opération déclare son degré** — le plancher
que la déclaration ne peut abaisser. **Les quatre valeurs** : `reader`
· `user` · `manager` · `administrator`. **Le degré `reader`** (D1140) :
« les documentations mises à disposition sans possibilité d'accéder au
détail » — le lecteur lit la documentation que la confidentialité de
son groupe ouvre (le décideur, le DPO, l'auditeur, l'hébergeur ; le
détail = les données) ; **une opération peut l'avoir pour plancher**
(D1680 — `degree:` admet les quatre valeurs). **Le groupe d'utilisateurs
porte le degré** (`degree:` dans groups.yml — validé D900, défaut
`user`) ; l'utilisateur atteint le degré de son meilleur groupe
(D414) ; **le compte sans groupe entre au degré `reader`** (D1793, qui
amende D699 — « l'appartenance obligatoire ») : il lit la documentation
`public`, rien du détail (D1140). **Le `reader`** (D1794) lit la
documentation que la confidentialité de ses groupes ouvre, jamais une
liste, un formulaire ou un enregistrement, et ne déclenche que les
opérations au plancher `reader` que le concepteur déclare pour lui
(D1680) ; par défaut — **un écran peut porter le degré `reader`**, pour
une consultation autorisée, décrit par le concepteur (`degree: reader`
sur la surface, en proposition). **Le degré ne se compose pas** : le
meilleur groupe est le plus élevé des groupes affectés, la composition
(D1099) ne transmet que la visibilité. Et
**`allow:` complète en précisant les groupes autorisés** (D700) :

**L'inventaire des vingt et un planchers** (D701 — validé ; la vingtième,
`reset_coverage` D881, au plancher `administrator` par D900 ; la vingt et
unième, `rgpd.extract`, au plancher `manager`, D1331, D1333, D1742) :

| le degré | les opérations |
|---|---|
| `user` | `create` · `read` · `update` · `delete` · `duplicate` · `promote` · `demote` · `generate` · `download` · `print` · `send` · `export` · `notify` · `refresh` |
| `manager` | `import` · `report` · `rgpd.extract` |
| `administrator` | `restore` · `migrate` · `rgpd.anonymize` · `reset_coverage` |

**Hors catalogue — la réactivation d'un enregistrement désactivé**
(D903) : « une opération exceptionnelle… l'action d'un
administrateur… pas une fonction exploitable par la configuration
(pas de hook) » — ni une opération du socle, ni déclarable : **une
fonctionnalité des écrans d'administration** (le module D710, le
degré `administrator`), sous la garde de l'unicité sur les actifs
(D141 — refus si un enregistrement actif porte la même clé
fonctionnelle), l'identité conservée (D142), tracée par
l'historisation (D429).

**L'exemple détaillé** — les degrés, les deux formes d'`allow` et la
composition :

```yaml
# groups.yml — le degré porté par le groupe (D699)
groups:
  sales_team: { }                          # degree: user (le défaut)
  accounting: { }
  managers:   { degree: manager, groups: [sales_team, accounting] }
  admins:     { degree: administrator }

# sales/entities/order.yml — LE CYCLE : allow par état (D422)
name: order
fields:
  status:
    type: enum
    values:
      draft:     { allow: [create, read, update, delete] }
      confirmed: { allow: [read] }
      archived:  { allow: [read] }
operations:
  archive:
    allow: [managers, admins]              # le droit de déclencher (D691/D700)
    commit: confirm
  purge_customer:
    actions: [ rgpd.anonymize ]            # la 19e (D697, D1333) — plancher administrator
    # un allow: [managers] serait sans effet : le plancher l'emporte (D700)

# sales/entities/customer.yml — LA FORME LIBRE (D423), exclusive du cycle
name: customer
allow:
  update: locked = false                   # l'expression (D90)
  delete: [admins]                         # les groupes (D700)
```

**Qui peut quoi** — la composition (le plus exigeant l'emporte) :

| l'acteur (son meilleur groupe) | `archive` une commande | `purge_customer` | `delete` un client |
|---|---|---|---|
| un membre de `sales_team` (user) | non — hors de l'`allow` | non — le plancher `administrator` | non — l'`allow` exige `admins` |
| un membre de `managers` (manager) | **oui** — dans l'`allow`, le plancher `user` de l'opération déclarée est couvert | non — le plancher `administrator` l'emporte sur tout `allow` | non — l'`allow` exige `admins` |
| un membre de `admins` (administrator) | **oui** | **oui** — le plancher atteint | **oui** — et l'expression `update: locked = false` continue de gouverner la modification |

— et dans tous les cas, un compte **sans groupe est un `reader`** (D1793,
qui amende D699) ; la vérification joue **au début**
de l'opération, servie par le cache de droits (D694).

## L'audit des lectures (D702–D704)

- **le grain : l'acte, jamais l'enregistrement** (D702) — une ligne
  d'audit **par lecture en masse de l'entité parente ou par
  transaction** : qui, quand, quoi (l'entité, le périmètre), par où
  (l'écran, l'export, l'impression, l'API, le connecteur), et **le
  nombre d'éléments concernés** — la volumétrie limitée ;
- **le défaut automatique** (D703) : ce qui est `rgpd: sensitive`
  (D695) s'audite d'office — rien à écrire ;
- **la propriété `trace:`** (D703) — les deux compléments :
  `trace: audit` (l'opt-in — le champ tracé au-delà du défaut) et
  **`trace: limited`** (l'exclusion — le champ écarté de **toute**
  trace : « un mot de passe ou une clé ne doivent pas être tracés »,
  l'écho de D463/D603) ;
- **la maison** (D704) : une entité du **module d'administration**
  (porté par Syncytium — le patron D666) ; les surfaces standard la
  consultent (le degré `administrator`), la rétention de l'audit se
  déclare comme toute historisation (D411).

```yaml
fields:
  blood_type: { type: text, rgpd: sensitive }   # audité d'office (D703)
  notes:      { type: text, trace: audit }      # l'opt-in
  api_key:    { type: password, trace: limited } # jamais tracé — nulle part
```

## Le chiffrement (D705–D706)

- **en transit** (D705) : ce que Syncytium **sert** (l'IHM, les API,
  les routes webhook) est **HTTPS sans dérogation** ; ce qu'il
  **appelle** (les huit familles) est chiffré **par défaut** —
  l'exception déclarée au connecteur (`unencrypted:` — validé
  D901), signalée par l'ingestion, visible au `describe()`, **et
  rappelée chaque jour** : le dashboard de santé (D731) et le mail
  des faits marquants (D733) portent la dérogation ;
- **au repos** (D706) : le chiffrement du storage (TDE, disque)
  **n'est pas de la responsabilité de Syncytium** — l'infrastructure
  et la classe ; et le chiffrement d'une valeur est **un pouvoir de
  type** (comme `password` — D463) : pas de facette `encrypted:` —
  le type qui a le pouvoir chiffre par ses fonctions de valeur
  (D683) et déclare ce qu'il sait encore faire (la recherche
  stricte au mieux, le tri perdu — la signature du type D579/D582).

## Les clés — le patron unique des secrets (D603/D707)

**Les clés sont obligatoirement chiffrées** (D707 — le
« chiffrable » de D603 durci) :

1. **la maison** : les variables d'environnement (le `.env`) —
   **jamais versionnées** (D336), exploitées par Syncytium ;
2. **la création** : **les commandes propres à Syncytium** chiffrent
   la valeur *avant* son enregistrement dans l'environnement (la clé
   dérivée environnement + machine — D603) ; *(flagué :
   l'automatisation de ce geste)* ;
3. **l'usage** : Syncytium déchiffre à l'usage — la valeur en clair
   ne vit qu'en mémoire, le temps de l'appel ;
4. **le périmètre** : les clés d'API, les mots de passe de
   connecteurs, les clés des types chiffrants (D706) — un seul
   patron pour tout ce qui est secret.

**Les deux commandes** (D708) :

```bash
# chiffre la clé et l'enregistre dans .env (ou un autre fichier si nécessaire)
syncytium encrypt DB_PASSWORD "le-mot-de-passe"

# retourne la valeur chiffrée — le débogage, la vérification d'un service
syncytium decrypt DB_PASSWORD
```

La clé de chiffrement étant dérivée de l'environnement **et de la
machine** (D603), un `.env` copié ailleurs reste muet — le `decrypt`
n'est utile qu'à qui a déjà la machine.

## Les points ouverts — le chantier du sujet 2

Aucun point consigné — la clôture du sujet 2 attend la relecture de
l'auteur (le flag mineur : l'automatisation de la commande de
chiffrement, D707).

## La documentation — la facette des droits (D1158–D1159)

*(La rubrique de la matrice de [documentation.md](documentation.md)
§13 ; la colonne 1 — la fonctionnelle — remplie, les autres à leur
rang.)*

**Le principe** : on ne lit que ce qu'on voit (D1141, D334) — la
confidentialité et les droits filtrent la documentation comme ils
filtrent l'écran ; une entité invisible n'a ni section ni ligne ; un
champ invisible n'est pas au dictionnaire du lecteur — dans la
fonctionnelle ; **au dictionnaire de la donnée, le modèle est intégral et
le niveau de confidentialité affiché** (D1247), seules les données de
l'instance suivent les droits du lecteur (D1249).

**Le groupe, dans la fonctionnelle** — **son persona** (D1200, D1208 :
le mono-poste déclare son groupe pour le porter) ouvre le chapitre des
scénarios : qui il est (le prénom, le rôle, sa description ou celle du
groupe), **ce qu'il voit** — ses modules et ses entrées de menu, ses
droits en clair, le « mes droits » servi dedans (D1206, D1220) —, ses
scénarios ; le groupe contenant (D1099) renvoie à ses constituants ; le
groupe au degré `administrator` a son persona, ses scénarios
d'administration vont au guide d'exploitation (D1206). Un groupe sans
`persona:` a un persona généré, nommé par le groupe, que la complétude
compte.

**Les permis** — par état, les verbes et **le libellé des groupes que
l'`allow` cite** (D1227), dans la table du cycle de vie de l'entité ;
l'`allow` d'un champ (D886) se lit au champ.

**Les degrés** : le `reader` lit la documentation sans le détail
(D1140) ; `manager` et `administrator` préparent une édition et
décident de la diffuser (D1142). **Les lecteurs** de chaque
documentation : la table de [documentation.md](documentation.md) §3
(D1154).

**Les groupes et les droits, dans le dictionnaire de la donnée** (la
colonne 2 — le rang 2) : **le chapitre 5.2, la matrice des droits**
(D1264 — « la visibilité est simple et rapide ») — les entités en
lignes, les groupes en colonnes, les quatre actes et les opérations
permises dans la case, la condition d'état quand il y en a une
(D1172) ; la composition des groupes (D1099), le degré (D699) ; les
profils de confidentialité lus comme « qui voit » chaque niveau. **Le
modèle est intégral pour tous, le niveau de confidentialité affiché à
chaque champ** (D1247) ; **les données de l'instance suivent les droits
du lecteur** (D1249). Les personas n'y sont pas — le dictionnaire est centré sur la donnée
(D1241).

**Les groupes et les droits, dans la réglementation** (la colonne 5 — le
rang 3) : **le responsable du traitement est un groupe** —
`controller:` dans le bloc `rgpd:` (D1320) — ; **qui peut déclencher**
chaque traitement reste l'`allow:` et le degré, que le registre montre à
côté du responsable (D1327) ; **les destinataires internes**, les
groupes qui lisent, par la confidentialité ; **`rgpd.extract`** au
plancher `manager`, **`rgpd.anonymize`** au plancher `administrator`
(D1331, D1333) ; la limitation par l'`allow:` d'un état (D1172).

**Les groupes et les droits, dans le projet et le support** (la colonne
8 — le rang 4) : **les trois groupes du bloc `assistance:`** — qui
traite une anomalie, qui répond à une question, qui enregistre une
évolution (D1372) ; le gestionnaire se prend dans le groupe (D1369) ;
sans bloc, le `manager` et l'`administrator` (D1377) ; **les degrés de
lecture** — la page des versions, le dépôt, le texte du support et
« qui répond à quoi » à tous, `reader` compris, les indicateurs à partir
de `manager` (D1347, D1377) ; un ticket se lit par son auteur et par le
groupe, une question close par tous, dans sa langue (D1373, D1381).

**Les groupes et les droits, dans la documentation du développeur** (la
colonne 3 — le rang 5) : **le filtre du contrat** — un compte technique
ne voit que ce que ses groupes et l'exposition lui permettent, rien en
négatif, l'astérisque excepté (D1394–D1395) ; **« pour le compte de »**,
l'intersection des droits (D1396) ; l'édition produite pour un compte
(D1400) ; le concepteur voit tout l'inventaire (D1404) ; un projet
`private` montre la référence (D1411).

**Les groupes et les droits, dans le D.A.T.** (la colonne 4 — le rang
6) : **ses lecteurs** — l'administrateur, le concepteur, l'hébergeur
sans les secrets (D1154) ; **l'authentification** comme connecteur du
schéma, le fournisseur d'identité et le compte qu'il attend (D1426,
D1428) ; rien des droits d'accès, qui sont à la documentation des
droits.

**Les groupes et les droits, dans le guide d'exploitation** (la colonne
9 — le rang 7) : **le lecteur** — l'administrateur, l'hébergeur sans
les secrets, l'équipe technique, le concepteur ou une société tierce
(D1154, D1456) ; **le degré requis par chaque fiche**, `administrator`
sauf la promotion, le geste du concepteur ; les comptes et les
affectations (D341) ; **le mode safe** et son compte principal, le mot
de passe fixé à l'installation, inaccessible dès qu'un administrateur
existe (D718, D1459).

**Les droits, dans la maintenance, les risques et les améliorations** (la
colonne 7 — le rang 8) : **les risques** — les refus de droits
journalisés et les pics (D43), les tentatives refusées ; **les
lecteurs** des trois chapitres (D1493) — les usages et les risques à
partir de `manager`, la vision métier ; les améliorations à
`administrator`, la configuration — et, dans la page d'un composant,
chacun voit l'usage de ce qu'il voit (D1489).

**Les droits, dans la promotionnelle** (la colonne 6 — le rang 9) : **le
mode public** — `visibility:` tranchée (D1151, D1498) : `promotional`
la plaquette seule sans compte, `public` toute la documentation en mode
public sans donnée ni rien de confidentiel, `private` rien sans
compte ; dedans, la plaquette se lit à tout degré, `reader` compris, la
première page de la documentation (D1498) ; les comptes de
démonstration, un par persona dans son groupe, éphémères (D1505) ; le
compte éphémère de la démonstration de Syncytium (D1509).

**Les neuf colonnes sont écrites.**
