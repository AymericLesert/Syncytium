# La sécurité et les droits de Syncytium

Ce document rassemble **la nature et les exemples des échanges
consignés sur la sécurité et les droits** — le huitième artefact
préparatoire de la documentation (Q58, le domaine 6 — D602), après le
[glossaire](glossaire.md), les [composants](composants.md), les
[hooks](hooks.md), les [types](types.md), les
[connecteurs](connectors.md) et le [mapping](mapping.md). Les
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
l'entité et **au champ** (D364) :

```yaml
fields:
  salary:
    type: amount
    confidentiality: protected      # le niveau (D25), resserrable (D26)
```

La confidentialité irrigue tout : les menus filtrés (D193), l'export
aux colonnes visibles (D196), les widgets hérités surchargeables
(Q53), la communication (D393).

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

L'absence = tout permis ; `read` absent = l'état masque. **Les
droits d'action couvrent les opérations du socle et les opérations
déclarées** (D691) : le droit d'exécuter se déclare et se contrôle
comme les autres droits d'action. La réconciliation avec le
passe-outre (D422) : l'opération autorisée **passe outre les `allow`
d'état** (l'acte porte sa légitimité — le promote écrit ce que
l'état fige), mais **le droit de la déclencher** relève des droits
d'action — on contrôle qui appuie, pas ce que l'acte écrit.

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
  acyclique, la multi-appartenance naturelle (D414) ;
- **les affectations vivent en base** — l'acte d'administration
  (D341), jamais dans le dépôt ;
- **le groupe `administrator` par défaut** (D712) — fourni par le
  socle ; **l'accès administrateur à double entrée** : le groupe
  **et** la désignation individuelle de l'utilisateur ;
- **la délégation** (D715) : agir à la place d'un utilisateur — les
  droits de l'emprunté, la trace aux deux comptes ;
- **le module restreint** (D190/D416) : l'affectation
  utilisateur↔module ouvre une surface — elle n'étend jamais un
  droit.

## Les connecteurs et la sécurité (D603, D626, D633, D642)

- **les secrets** : la référence à une variable d'environnement,
  chiffrable par une clé environnement+machine (D603) — le dépôt ne
  porte jamais une valeur en clair ;
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
4. **l'API** — la preuve au porteur : la clé d'API ou le bearer dans
   chaque requête (le 401 en défi), le compte technique (D77), pas
   de session ; **la garde du webhook (D642) appelle le même
   `verify`**.

La passerelle (D418) a son visage ; le multi-connecteurs sert
l'étanchéité par canal (D77). Voir le contrat détaillé dans
[connectors.md](connectors.md).

## La session (D693–D694)

Les réglages aux settings de l'application (D588), en mode
`dynamic` :

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
  régime renforcé), `consent` (le traitement au consentement) :

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
  échoit (l'écriture de l'historisation — D411) **s'anonymise
  d'office** ;
- **le registre des traitements auto-documenté** (D698 —
  D333/D645) : les champs `rgpd:`, leur confidentialité, leur
  rétention, leurs connecteurs sortants — généré, jamais rédigé.

## Le degré intrinsèque d'autorisation (D697, D699–D700)

**Le contrat de chaque opération déclare son degré** — le plancher
que la déclaration ne peut abaisser. **Les trois valeurs** : `user`
· `manager` · `administrator`. **Le groupe d'utilisateurs porte le
degré** (`degree:` dans groups.yml — en proposition, défaut
`user`) ; l'utilisateur atteint le degré de son meilleur groupe
(D414) ; **l'appartenance à un groupe est obligatoire** — le compte
sans groupe n'entre pas (le fail-closed jusqu'à la porte). Et
**`allow:` complète en précisant les groupes autorisés** (D700) :

**L'inventaire des dix-neuf planchers** (D701 — validé) :

| le degré | les opérations |
|---|---|
| `user` | `create` · `read` · `update` · `delete` · `duplicate` · `promote` · `demote` · `generate` · `download` · `print` · `send` · `export` · `notify` · `refresh` |
| `manager` | `import` · `report` |
| `administrator` | `restore` · `migrate` · `anonymize` |

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
    operations: [ anonymize ]              # la 19e (D697) — plancher administrator
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

— et dans tous les cas, un compte **sans groupe n'entre pas** (D699,
le fail-closed jusqu'à la porte) ; la vérification joue **au début**
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
  l'exception déclarée au connecteur (`unencrypted:` en
  proposition), signalée par l'ingestion, visible au `describe()` ;
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
