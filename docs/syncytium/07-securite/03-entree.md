# L'identité et l'entrée

Qui entre : les comptes et leur identité, le connecteur d'authentification
qui vérifie, la session de l'interface, l'API au porteur, la garde du
webhook.

Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md). Le texte vient des deux artefacts
préparatoires, déplacé à la réorganisation ; la réécriture suit.

## Le sommaire

- [L'identité et les comptes](#lidentité-et-les-comptes)
- [L'authentification (D692)](#lauthentification-d692)
- [L'authentification](#lauthentification)
- [La session (D693–D694)](#la-session-d693d694)
- [La session et l'API](#la-session-et-lapi)
- [Les connecteurs et la sécurité (D633, D642)](#les-connecteurs-et-la-sécurité-d633-d642)

## L'identité et les comptes

- **Deux identités étanches à l'origine** (D28) — technique (l'API)
  et nominative (l'interface) ; un compte est l'un ou l'autre.
  **Généralisé en quatre types** (D77) : technique, utilisateur
  interne, client provisionné depuis une fiche client par l'ADV,
  client auto-créé vérifié (non prioritaire). **Chaque type a son
  canal** ; la compromission d'un canal n'ouvre pas l'autre.
- **L'identité canonique est un UUID interne stable** (D82, D142) —
  l'ancre de l'appartenance, de l'audit, des références ; jamais
  exposé (l'anti-IDOR D75). **La clé d'unicité** (le rapprochement
  externe → UUID) est **définie par le connecteur** : le GUID Entra en
  priorité (immuable), le courriel en repli (mutable), le login en
  local. L'opération d'administration de **re-liaison / fusion**
  couvre le changement d'adresse et le doublon (D721–D722).
- **Le compte client suit sa fiche** (D77) : fiche désactivée → compte
  désactivé. Le compte technique porte sa version d'API épinglée
  (D98), ses groupes, donc son périmètre.
- **L'entité système `user`** (D719) est définie et maintenue par
  Syncytium : `login`/`email`/`first_name`/`last_name` en
  `rgpd: personal`, `account_type`, `origin` (le connecteur
  d'authentification), `status: active | banned | locked`, `admin`
  (la désignation individuelle), `password` (le local seul), les
  associations `groups`/`modules`. Historisée, ses lectures auditées.

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
[connectors.md](../05-connecteurs/README.md).

## L'authentification

- **Le cadre générique dès l'origine** (D29, D32, D78) : la nature de
  l'authentification se choisit à l'installation, derrière une
  interface de connecteur, reparamétrable **par un administrateur
  uniquement** ; le login/mot de passe est le défaut ; le concepteur
  peut écrire son propre connecteur.
- **La famille `authentication`** (D692, la huitième) : le contrat
  `challenge()` / `verify(preuve)`, aux deux visages — l'utilisateur
  interactif (la session) et l'API (la preuve au porteur, sans
  session). **Cinq classes** : `local` (le haché, les clés d'API),
  `azure_ad` (le bind, le bearer Entra), `sso` (l'OIDC, la signature
  du jeton — l'utilisateur ne confie jamais son secret), `keycloak`
  (D716 — l'IdP open source), `none` (D759 — le mono-poste
  domestique : aucun défi, l'utilisateur et le groupe par défaut au
  degré administrator, les invariants pré-remplis jamais contournés).
- **Une seule source active, le changement gardé** (D80) : pas de
  mode mixte ; changer de source exige une authentification de test
  réussie contre la nouvelle ; l'échec laisse l'ancienne.
- **Le provisionnement JIT** (D30–D31) : le compte nominatif naît au
  premier login, les groupes arrivent dans le jeton à chaque
  connexion — un retrait dans l'annuaire prend effet à la connexion
  suivante ; l'association groupe AD ↔ groupe de la description se
  gère **dans l'interface**, pas dans la description : une interface du
  module d'authentification la saisit, par groupe, dans les propriétés
  que fournit le connecteur — le GUID pour Entra, aucune pour un
  connecteur intégré (D1788) —, enregistrées dans le module
  `_administration` du méta-modèle (D1789). **Trois conditions à
  l'entrée** (D1792) : actif dans le système d'authentification, présent
  dans le groupe de l'application, présent dans l'un des groupes de
  l'application ; une association pour chaque groupe nommé, une pour
  `administrator`, une pour le groupe de l'application — **contrôlées par
  le connecteur d'authentification, non par le socle** (D1793) ; le
  groupe de l'application est une porte d'entrée, sans rôle dans
  l'application. **Le
  `directory` est en lecture seule** (D633) et coopère avec
  l'authentification (D713) : les comptes synchronisés sont en
  lecture seule dans Syncytium, sauf `admin`, `modules`, `status`.
- **Le secours** — trois étages : **l'amorçage** (D33 — un compte
  administrateur dans la description, **l'empreinte seule, jamais le
  clair**, utilisable seulement si aucun administrateur n'existe) ;
  **le bris de glace** (D81 — le même compte s'active quand
  l'authentification est indisponible, détecté par la santé du
  connecteur ; indépendant de tout connecteur externe ; **audité
  avec motif et alerté**) ; **le mode safe** (D718, D745 — un mode de
  lancement, jamais atteignable depuis l'application vivante : le
  module administration seul, aucune donnée métier, le compte
  principal au mot de passe fixé à l'installation ; tracé — « jamais
  une porte dérobée » ; les conditions indispensables levées, le
  refus de démarrer toujours expliqué).
- **Le quotidien du compte local** (D720–D723) : l'invitation à lien
  limité (le compte naît sans mot de passe, l'administrateur ne le
  connaît jamais) ; le mot de passe oublié par lien ; `renew` = le
  lien, jamais une valeur ; **le verrouillage** après N échecs
  (`lockout: 5`, `cooldown: 15min`, `invitation: 48h` en settings
  dynamiques), les échecs tracés ; tout cela **indisponible en SSO**.
  Les mails du socle en templates surchargeables.

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

## La session et l'API

- **La session** (D693–D694) : `duration` (l'inactivité, défaut 8h)
  et `limit` (l'absolu, défaut 7d) — des paramètres du connecteur
  d'authentification, chaque classe déclarant les siens, depuis D1801
  et D1805 ; l'item des API aux settings, `application.api`, en
  proposition ; le principe de la clé d'API au chapitre 7, les en-têtes
  au chapitre 13 (D1805) ; la borne
  de l'IdP prime en SSO ; les sessions simultanées libres (D15), la
  révocation par l'administrateur, les sessions visibles ; **la
  session ne fige jamais des droits** — la vérification joue **au
  début** de chaque opération ou sollicitation, servie par un cache
  invalidé à toute modification de droits.
- **Le navigateur** (D917) : la session de l'IHM voyage dans **un
  cookie inaccessible au script**, sécurisé, restreint au site —
  jamais un jeton dans le stockage du navigateur ; **l'API n'accepte
  que la preuve au porteur, jamais le cookie** — la falsification de
  requête inter-sites fermée par construction. **Les origines tierces**
  (D918) : la liste `cors:` à l'environnement — absent = aucune, le
  joker refusé, la preuve au porteur toujours exigée. **L'injection
  de script** (D918) : les valeurs saisies toujours rendues comme du
  texte, les templates du concepteur échappent leurs variables et
  refusent le HTML brut, le hook d'interface est le seul code tiers
  au navigateur — listé par la documentation générée, sous la
  responsabilité du concepteur — et la page n'autorise que les
  scripts qu'elle connaît.
- **L'API hors session** : chaque requête porte sa preuve. **La clé
  d'API rotative** par défaut (D107 — deux clés actives pendant la
  rotation), **« pour le compte de » par en-tête dédié** (le
  périmètre de délégation D76 — l'API bornée au périmètre ligne du
  sujet, chaque appel attribuable), OAuth2 + Token Exchange RFC 8693
  en déclinaison. Les jetons des comptes techniques sont créés et
  révoqués par l'administration.
- **Les garde-fous du contrat** : la version épinglée au compte
  technique (D98 — la bascule = un acte tracé), 426 sous la version
  minimale (D94), la bêta sur sollicitation explicite seulement
  (D103), **la pagination au curseur opaque** (D100), **le rate
  limiting** 15 req/s par défaut, surchargeable par compte, 429 +
  `Retry-After` (D105).
- **Le webhook** (D640–D642) : aucune entrée anonyme — la garde
  d'office sur la route, **le même `verify`** que l'authentification.

## Les connecteurs et la sécurité (D633, D642)

- **le `directory` en lecture seule** (D633) — la synchronisation
  des comptes, jamais l'écriture vers l'annuaire ;
- **le webhook à l'authentification obligatoire** (D642) — aucune
  entrée anonyme, la garde d'office sur la route.

