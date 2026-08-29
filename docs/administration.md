# L'administration et l'exploitation de Syncytium

Ce document rassemble **les actes d'administration et les éléments
d'exploitation consignés** — le neuvième artefact préparatoire de la
documentation (Q58, le domaine 6 — D602), après le
[glossaire](glossaire.md), les [composants](composants.md), les
[hooks](hooks.md), les [types](types.md), les
[connecteurs](connectors.md), le [mapping](mapping.md) et les
[droits](rights.md). Les décisions citées renvoient à la
[conception](conception.md). Il consolide l'acquis épars et porte
les points du chantier ouvert (le sujet 3 — le dernier de la passe
de complétude).

## La doctrine

- **Les actes d'administration vivent en base, jamais dans le
  dépôt** (D341) : la configuration décrit les possibles (les
  groupes, les modules, les settings), l'administration affecte et
  ajuste — les deux mondes ne se mélangent pas ;
- **le degré `administrator`** (D699/D701) garde les gestes : porté
  par le groupe, l'appartenance obligatoire — le plancher que la
  déclaration ne peut abaisser ;
- **le module porté par Syncytium** (le patron D666) : le socle est
  le premier client du mécanisme (D408) — les entités et les
  surfaces d'administration sont des entités et des surfaces
  standard ;
- **expliciter plutôt que subir en silence** : la supervision, les
  alertes et les rapports naissent du modèle — rien ne s'ajoute
  après coup.

## Le module d'administration (D710)

**Un seul module, au degré minimal `administrator`** — le premier
module à plancher : l'affectation ne suffit pas, le degré du groupe
(D699) est exigé — la double garde. **Les entrées sont un menu
construit et maintenu dans Syncytium** :

- **les settings** — les paramètres **statiques et dynamiques**
  (D588/D711) : la consultation des deux, la surcharge des seuls
  dynamiques (le statique se change par une version) ;
- **la gestion des comptes** (D77/D82/D341) ;
- **les sessions** (D693) ;
- **l'audit** (D704) ;
- **les migrations** (D666/D711) — **l'entrée conditionnelle** :
  disponible seulement si `migrations:` est défini dans la
  configuration (D662) ;
- **la télémétrie** — le dashboard « telemetry » (D736) : les
  usages, la collecte par champ à la demande (voir
  [telemetry.md](telemetry.md)) ;
- **la santé** (D731/D751) — le dashboard temps réel ;
- **le backup** (D727/D751) — les archives, le déclenchement ; **la
  restauration n'est pas un écran** : une commande interne de
  Syncytium (D751 — l'application restaurée est peut-être morte, le
  geste vit hors d'elle) ;
- … (la liste reste ouverte — elle s'enrichit avec le socle).

**Le module exploite les différentes facettes de Syncytium** — le
module (D416), les entités, les menus (D193/D440), les composants
graphiques (D437–D569) : l'administration n'a rien de spécial, elle
est une application Syncytium (le patron D666 généralisé).

## Les actes d'administration consignés

### L'organisation des comptes (D712–D713)

- **le groupe `administrator` par défaut** (D712) : le socle le
  fournit d'office (groups.yml n'a pas à le déclarer) ; **l'accès
  administrateur est à double entrée** — l'appartenance au groupe
  **et** la désignation individuelle de l'utilisateur (l'affectation
  nominative D341) ;
- **la synchronisation selon le mode d'authentification** (D713) :

| le mode | la source des comptes | l'édition dans Syncytium |
|---|---|---|
| `local` | la création et l'affectation **manuelles** par l'administrateur | pleine |
| `azure_ad` | **le groupe Syncytium associé à un ou plusieurs groupes AD** — la classe d'authentification récupère les groupes puis leurs utilisateurs (le contrat `directory` D633 : `get_groups`, `get_users_from_group`) | **lecture seule** (l'annuaire est maître) — sauf les propriétés hors annuaire |
| `sso` | comme le directory | lecture seule — **sans la gestion du mot de passe** |
| `none` (D759) | **l'utilisateur par défaut** — implicite, au groupe par défaut, le degré `administrator` (le domestique) | n/a — aucun compte à gérer |

Les familles `authentication` (D692) et `directory` (D633)
**coopèrent** — comme `file` et `storage` (D636) : l'une authentifie,
l'autre fournit la lecture des groupes et des utilisateurs.
**Keycloak** entre comme une classe de la famille `authentication`
(D716 — le visage concret du volet SSO) ; **le groupe
`administrator` peut être associé à un groupe du directory** (D717 —
la double entrée demeure : la désignation individuelle reste l'acte
local).

### Le mode safe (D718)

**La porte de secours** — quand l'annuaire est injoignable, le SSO
cassé ou les droits verrouillés par erreur : **un mode d'exécution
au lancement** de l'application (jamais atteignable depuis
l'application vivante) — **le module administration seul** (aucune
donnée métier servie), l'accès par **le compte administrateur
principal** et **le mot de passe fixé à l'installation** (le patron
des secrets D707 — hors annuaire, hors configuration versionnée) ;
le mode safe est **tracé** (l'audit D704) — la porte de secours
n'est jamais une porte dérobée. **Le mode safe désactive toutes les
conditions indispensables** (D745 — l'envoi de mails n'est plus un
critère de démarrage : le seul mode exempté de D626) ; et **le refus
de démarrer s'explique toujours** : Syncytium fournit la raison du
non-démarrage (la configuration corrompue, le connecteur
indisponible, la perte du réseau…).

### Le détail de l'utilisateur et du groupe (D719)

```yaml
# l'entité système user — définie, construite et maintenue par
# Syncytium, jamais déclarée par le technicien
user:
  label: "{first_name} {last_name}"
  fields:
    login:        { type: text, rgpd: personal }      # la clé d'unicité (D82)
    email:        { type: email, rgpd: personal }
    first_name:   { type: text, rgpd: personal }
    last_name:    { type: text, rgpd: personal }
    language:     reference                            # la langue → le fuseau (D217–D225)
    theme:        reference                            # le thème choisi (D753 — parmi les visibles)
    account_type: enum [technical, internal, customer] # la typologie (D77)
    origin:       reference                            # le connecteur d'authentification (D713)
    status:       enum [active, banned, locked]        # ban (D714), le verrouillage
    admin:        boolean                              # la désignation individuelle (D712)
    password:     password                             # le local seul — jamais relu (D463)
    groups:       association with group               # l'affectation en base (D341)
    modules:      association with module              # l'affectation en base (D416)

# groups.yml — la configuration (le déclaré)
groups:
  managers:
    degree: manager                    # D699
    groups: [sales_team, accounting]   # la composition acyclique (D414)
    directory: ["GRP-AD-Managers"]     # l'association aux groupes AD (D713/D717)
```

**Les régimes** : la fiche synchronisée en **lecture seule** (D713 —
sauf `admin`, `modules`, `status` : les propriétés hors annuaire) ;
l'UUID interne hors déclaration (D142) ; l'entité **historisée**
(qui a donné quel droit, quand), ses lectures à l'audit. **La ligne
de partage** : la configuration déclare la structure (les groupes,
les degrés, `directory:`), la base porte les appartenances —
l'écran du groupe montre les deux faces.

### Le quotidien du compte local (D720–D722)

- **l'invitation** (D720) : le compte naît sans mot de passe — le
  lien à durée limitée, l'utilisateur définit son secret,
  l'administrateur ne le connaît jamais (D463/D703) ; le compte
  n'entre pas tant que l'invitation n'est pas honorée ;
- **le mot de passe oublié** : le lien de réinitialisation à durée
  limitée ; le `renew` (D714) en est le pendant administratif —
  toujours le lien, jamais une valeur ; **indisponible en SSO** (le
  mot de passe n'est pas géré par l'application) ;
- **le verrouillage** — **le volet local seul** : N échecs
  verrouillent (`status: locked`), le déverrouillage par l'attente
  ou l'administrateur ; les échecs tracés (D704) :

```yaml
settings:
  application:
    account:
      lockout:    { mode: dynamic, type: integer,  value: 5 }     # les échecs
      cooldown:   { mode: dynamic, type: duration, value: 15min } # l'attente
      invitation: { mode: dynamic, type: duration, value: 48h }   # la validité des liens
```

- **le changement de mail** (D721) — l'UUID survit (D82) ; deux
  chemins : **l'administrateur** (le changement direct, sans
  vérification — tracé) ou **le profil** (la double validation en
  chaîne : le clic depuis l'ancienne adresse, puis la validation
  depuis la nouvelle) ;
- **la fusion** (D722) — l'opération de l'administrateur : le
  survivant désigné, l'autre **désactivé** (jamais supprimé) ; **la
  perte éventuelle des historiques du compte désactivé est
  assumée** — pas de re-parentage rétroactif des traces.
- **les mails du socle** (D723) : l'invitation, la réinitialisation
  et la validation de changement d'adresse sont **des templates
  `mail` du socle** (D562/D564 — le mustache + markdown, l'envoi par
  le smtp D628, la langue de l'utilisateur D217–D225) ; **Syncytium
  les fournit par défaut, la configuration de l'application peut les
  redéfinir** (D186).

### Les opérations dédiées et la délégation (D714–D715)

- les surfaces : **les utilisateurs** et **les groupes** en listes
  standard ;
- **`renew`** — le changement (ou le changement forcé) du mot de
  passe : le lien de réinitialisation, jamais la valeur ;
- **`ban`** — le bannissement **sans suppression** (masquer, jamais
  détruire) ; la liste des opérations reste ouverte ;
- **la délégation** (D715/D749) : agir **à la place** d'un
  utilisateur — les droits joués sont ceux de l'emprunté, **chaque
  trace porte les deux comptes**. Les règles (D749) : **le même
  degré** (jamais une élévation par délégation), **le don, jamais la
  prise** (le délégant ou un administrateur définissent — le
  destinataire ne se sert pas), l'usage type : l'absence prolongée ;
  **l'exception** : seul un administrateur peut s'octroyer les
  droits d'un utilisateur quelconque — la traçabilité toujours
  assurée.

### Les comptes et les affectations

- **la typologie des comptes** (D77) : technique (l'API),
  utilisateur interne, client provisionné par l'ADV, client
  auto-créé vérifié — l'étanchéité par canal ;
- **l'identité interne = l'UUID stable** (D82) ; la clé d'unicité
  définie par le connecteur (le GUID Entra + courriel, le login
  local) — **l'opération d'administration de re-liaison/fusion**
  des comptes ;
- **les affectations** utilisateur↔groupes et utilisateur↔modules
  (D341/D414–D416) — en base, par l'administrateur ; le groupe porte
  le degré (D699), **l'appartenance à un groupe est obligatoire** ;
- **le provisionnement** : les utilisateurs associés par le
  technicien ou par la passerelle d'authentification (D418/D692 —
  la famille `authentication`, la synchronisation par le
  `directory` D633) ;
- **les jetons des comptes techniques** (D692) : créés et révoqués
  par l'administration — la classe `local` les vérifie.
- **le compte technique aux groupes** (D746) : l'appartenance
  obligatoire (D699) vaut pour tous les types de comptes —
  l'inviolabilité des informations (D599) ;
- **le groupe absent = désactivé** (D747) : un groupe retiré de la
  configuration se désactive (réversible — la réapparition
  réactive) ; **la purge est une opération d'administration, jamais
  automatique**.

### Les sessions (D693)

Les sessions d'un compte **visibles et coupables** — la révocation
est un acte d'administration ; les réglages (`duration`/`limit`) en
settings dynamiques, ajustables sans republier.

### Les settings dynamiques (D588–D590)

`{ mode: dynamic, type:, value: }` — la valeur par défaut déclarée,
**surchargée via le module d'administration** ; la cascade
application → module → entité.

### L'audit (D702–D704)

L'entité d'audit **vit au module d'administration** : le grain à
l'acte (la lecture en masse, la transaction, le nombre d'éléments),
le défaut automatique (`rgpd: sensitive`), `trace: audit`/`limited` ;
les surfaces standard la consultent (le degré `administrator`), la
rétention déclarée (D411).

### Le suivi des migrations (D666–D668, D711)

**L'entrée « migrations » du module d'administration** (D711 —
conditionnelle : `migrations:` défini) : les entités du suivi — la
couverture par migration/entité/règle, les rejets et leurs causes —
**historisées** (l'évolution de la qualité dans le temps) ; la vue
par les surfaces standard.

### Les opérations d'administration du socle (D701)

Les planchers `administrator` : **`restore`** (la restauration par
renommage — le geste inverse de la bascule, D174/D678),
**`migrate`** (D667), **`anonymize`** (D697) ; les planchers
`manager` : **`import`** (D211/D238), **`report`**.

## L'exploitation consignée

### Les environnements (D339, D342–D343)

`environments/` — un dossier par environnement (staging, production
active, passive) : `environment.yml` + les connecteurs (D617) + les
journaux + les settings + la documentation, **spécifiques à
chacun** ; l'actif/passif du PCA-PRA (D112–D114) — la réplication
différentielle (le mode `relative` de la migration, D649/D671).

### Le lien actif/passif (D724)

**Le passif est dormant** — ni lecture ni service pendant la vie
normale. **Les trois modes de gestion** (l'écriture `replication:`
en proposition, dans `environments/passive.yml`) :

| le mode | la mécanique | le failback |
|---|---|---|
| `disabled` | **le défaut** — pas de passif, pas de synchronisation (D725) | — |
| `brut` | **la copie de l'instance à intervalle régulier** — les fichiers des entités, les fichiers de configuration et la base | non |
| `differentiel` | **la base au natif du moteur ou de l'infrastructure** (Syncytium ne gère pas la base) ; Syncytium synchronise **les fichiers des entités et de configuration** | non |
| `synchronous` | **les actions historisées, transmises au passif, l'exécution confirmée supprime l'action en attente** (le patron de la file — D686) ; **une translation** (D744) : la sérialisation des enregistrements (D687) expédiée, **les fichiers répliqués de même** (l'upload suivi) | **oui** — le rejeu s'appuie sur la sérialisation réalisée |

**Une montée de version est couverte par les trois modes** : la
copie l'emporte (brut), les fichiers de configuration la portent
(differentiel), l'action de migration s'expédie comme les autres
(synchronous). **L'invariant** (D744) : les deux instances
actif/passif sont **forcément les mêmes versions de schéma, aux
mêmes configurations** — la réplication ne traduit jamais entre
versions. La bascule reste un acte d'exploitation ; le retard
de synchronisation se surveille (l'alerte D626 au-delà d'un seuil).

**La mise à niveau au chargement (D801)** : au démarrage — et sans
redémarrage ensuite, la configuration se relisant à chaud —
l'application rejoint **la version la plus élevée du statut de son
mode d'exécution** (beta | production) ; la procédure de migration
de schéma (D673–D679) est le bras du geste. « Être en mesure de
monter de version sans avoir besoin de redémarrer l'application »
est un point crucial du projet.

**La déclaration** (D726) — dans `environments/passive.yml` :

```yaml
replication: disabled                  # le défaut (D725) — pas de passif

replication:
  mode: brut                           # la copie entière (D724)
  every: daily[02:00]

replication:
  mode: differential                   # la base au natif ; les fichiers par Syncytium
  every: 15min

replication:
  mode: synchronous                    # le journal d'actions — le flux continu
```

### La sauvegarde et la restauration (D727–D729)

- **la sauvegarde** (D727) : `duplicate_instance` (D680) + les
  fichiers des entités + la configuration, **vers une destination
  précisée** — un zip ou un espace de stockage ; **la rétention en
  jours** (l'archive échue supprimée) :

```yaml
backup:
  destination: zip:/backups/           # ou un connecteur de stockage
  every: daily[01:00]
  retention: 30d
```

- **la restauration** (D728) : **une image à sa propre vie** —
  l'adresse du point d'entrée fournie au geste, l'application
  restaurée devient une application comme les autres (le clonage
  assumé : le staging depuis la production, l'archive consultable) ;
- **les bibliothèques d'applications** (D729) : la sauvegarde en
  **gabarit distribuable** (le « Hello world ! » D337 industrialisé,
  l'écosystème AGPL) — à la restauration, **le wizard
  d'initialisation** demande les paramètres clés (le storage, les
  connecteurs — l'assistant des secrets D707/D708 enchaîné), **ou le
  storage sqlite natif** épargne toute question : l'application
  démarre seule.

### La rotation des clés (D730)

Deux déclencheurs : **chaque restauration** (l'image nouvelle, la
machine peut-être autre — la clé environnement + machine D603 impose
la naturalisation) et **la commande** :

```bash
syncytium rotate    # re-chiffre le .env et les champs des types chiffrants
```

— le re-chiffrement en masse au patron de `migrate` (la transaction,
la progression suivie), l'acte tracé.

### La santé (D731)

La vue d'office du module d'administration : **les statuts, les
files d'attente (D686), les sessions actives, les connecteurs** (le
`ping()` D621 — le feu tricolore) — disponible **en dashboard et en
API** (la supervision externe interroge l'API) ; **l'état de santé
du passif intégré** quand la réplication est active (le retard, le
dernier passage, l'alerte au seuil — D626). **L'état est en temps
réel** (D732) : pas de période de rafraîchissement — l'état pousse
(`refresh: live` — D249/D555) ; l'`every:` du `ping()` rythme la
mesure, jamais l'affichage.

**Le mail des faits marquants** (D733/D748) : **les administrateurs
reçoivent**, **une
fois par jour ou à leur convenance** (l'`every:` calendaire D434 —
**chaque administrateur gère ses notifications et ses déclenchements
via son profil**, D748), le
résumé de la période — **les utilisateurs connectés, les
erreurs/warnings (D343), les changements d'état de santé** (la
liste ouverte) — fondé sur le statut de santé et **son évolution au
cours de la journée** ; le template mail du socle (D723),
surchargeable en configuration, l'envoi par le smtp (D628).

### Les journaux (D343)

Par environnement : le staging en **debug/verbose**, la production
active en **info + puits de logs éventuel**, la passive en
**warning** — les formats et les emplacements différents ; les
journaux en anglais (D217–D225). **Le journal est le sixième canal
de la télémétrie** (D737) : les six niveaux
(`verbose`/`debug`/`info`/`warning`/`error`/`exception`) dans la
configuration en dur (**`logging.yml`** — le nom harmonisé D750, renommé D830), la
consultation par **le technicien seul**, en cas de besoin — hors
IHM.

### La supervision (D621, D625–D627)

- **`ping()`** sur chaque connecteur — les statuts (`error`,
  `initialized`, `disconnected`, `connected`, `closed`…), la
  fréquence à l'`every:` ;
- **la position de sécurité** : l'erreur → la page de maintenance +
  **l'alerte émise** ; l'`onerror` gradué (le mock du connecteur non
  critique, la maintenance du connecteur clé) ;
- **la condition indispensable** (D626) : l'application ne démarre
  que si le mail à l'administrateur est possible — le canal d'alerte
  avant tout.

### Les secrets (D603, D707–D708)

Le `.env` jamais versionné, les clés obligatoirement chiffrées (la
clé dérivée environnement + machine) ; **les commandes** :

```bash
syncytium encrypt DB_PASSWORD "le-mot-de-passe"   # chiffre et enregistre
syncytium decrypt DB_PASSWORD                      # la vérification, le débogage
```

### Le cycle de vie des versions (D338–D340, D332)

Le statut = l'emplacement (`beta/`, `production/`, `deprecated/`,
`forbidden/`) — les transitions par gestes de fichier ; le registre
des versions essayées (le retry par bump du build) ; le délai de
grâce du schéma remplacé (D675/D678).

## La télémétrie (P9 — Q12–Q13 closes depuis juin)

**Q12 est résolue** (D38–D41) : les usages agrégés sur le schéma (le
champ à la volée D38/D46, l'entité stockée D39), les acteurs
identifiés **sur les seuls comptes techniques** (D40 — la gestion
d'intégrations, jamais la surveillance des salariés), les deux
supports (la base + les traces de journal à rétention paramétrable
et option d'anonymisation — D41), le client responsable de
traitement. **Q13 est résolue** (D43–D44) : **les cinq canaux de
restitution** en solution intégrée bâtie sur le méta-modèle — le
tableau de bord des usages (pull), le rapport de dry-run (contextuel
à la migration), la synthèse périodique (push — avec **le volet
conseil** D45 : le cache, la lecture par lot, l'endpoint composite),
l'alerte d'échéance (rare — le Sunset d'API), l'analyse de sécurité
(D43 — les refus journalisés, les seuils D50–D51, la calibration
D97). La détection SEQUITUR (D315–D319) nourrit le conseil.

**La jonction avec l'acquis récent est validée** (D734) — le détail
et les six raccords vivent dans **[telemetry.md](telemetry.md)**
(D735, le dixième artefact).

## Les points ouverts

**Le sujet 3 est soldé** (D743) — et avec lui la passe de complétude
entière (D603–D743) : les domaines 5 et 6 s'ouvrent (les cas d'usage
Q59, la documentation Q58).
