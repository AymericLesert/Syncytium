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
- … (la liste reste ouverte — elle s'enrichit avec le socle).

**Le module exploite les différentes facettes de Syncytium** — le
module (D416), les entités, les menus (D193/D440), les composants
graphiques (D437–D569) : l'administration n'a rien de spécial, elle
est une application Syncytium (le patron D666 généralisé).

## Les actes d'administration consignés

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

### Les journaux (D343)

Par environnement : le staging en **debug/verbose**, la production
active en **info + puits de logs éventuel**, la passive en
**warning** — les formats et les emplacements différents ; les
journaux en anglais (D217–D225).

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

## La télémétrie — le chantier (P9, Q12–Q13 ouvertes)

L'acquis du pilier P9 (D38–D51, D97) : **les trois finalités** — les
usages (la diversité des valeurs par champ D38, les compteurs
d'entité D39), le risque de migration, la sécurité (les seuils
déclarés aux endpoints/entités/fonctions d'IHM — D50 ; la
calibration ajustable à l'initialisation — D97 : fenêtre 30 jours,
z-score ≥ 3, planchers) ; la détection des séquences répétées
(SEQUITUR — D315–D319 : les optimisations et **les services
proposés** au technicien, avec fréquence et gain) ; la restitution
en tableaux de bord et synthèses, le volet conseil. **Q12–Q13
restent à clore** — le sujet 3 les portera.

## Les points ouverts — le chantier du sujet 3

1. **les comptes au quotidien** — la création du compte local, le
   cycle de vie (l'invitation ? le mot de passe oublié ? le
   verrouillage ?), la re-liaison D82 en pratique ;
2. **l'exploitation courante** — la sauvegarde (au-delà de la
   restauration D174), **la rotation des clés** (le flag D707),
   l'automatisation d'`encrypt` (le flag D708), la santé de
   l'instance en une vue ;
3. **la télémétrie** (Q12–Q13) — ce qu'elle collecte, où elle vit
   (des entités du module d'administration ?), qui la voit, le lien
   au volet conseil (P9).
