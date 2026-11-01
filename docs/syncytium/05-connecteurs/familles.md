# Les neuf familles

*Les neuf familles de connecteurs, définies par le socle, et le contrat
de chacune ; le storage, développé à part, y a son résumé.*

## Le sommaire

- [Les familles et le catalogue des classes (D604, D623, D692, D957)](#les-familles-et-le-catalogue-des-classes-d604-d623-d692-d957)
- [`storage`](#storage)
- [`smtp` (D628)](#smtp-d628)
- [`directory` (D633)](#directory-d633)
- [`file` (D634–D635, D972–D973)](#file-d634d635-d972d973)
- [`location` (D637)](#location-d637)
- [`authentication` (D692)](#authentication-d692)
- [`siren` (D639)](#siren-d639)
- [`webhook` (D640–D641)](#webhook-d640d641)
- [`llm` (D957)](#llm-d957)

## Les familles et le catalogue des classes (D604, D623, D692, D957)

**Le jeu est clos aux hooks** (D619) — « route est un exemple
d'extension ultérieure » (l'extension = l'affaire du moteur, jamais
du hook) ; il s'ouvre par décision : la neuvième famille, `llm`, entre
avec le module `chat` du socle (D957) ; **la famille contraint le
contrat** (D620), la conformité d'une classe vérifiée au chargement :

| le type (la famille) | le rôle | les classes consignées | l'acquis |
|---|---|---|---|
| `storage` | les bases de données — le stockage du modèle et les échanges ; **les formats structurés pour les exports et les imports** (D636) | postgresql, sqlserver, mysql, oracle, sqlite (le natif du domestique, D1114) — **et csv, xlsx, xml, json…** (D636) ; **memory** (D1045 — le modèle tenu en mémoire, la base miroir d'une reprise, `buffer:` ; **et le stockage de l'application en mémoire seule, avec un ratio d'espace, aucune place sur le disque, une suppression facile : la démonstration de Syncytium et le mode démo d'une application** — D1507–D1508) | D604/D606/D613/D636, D1508 |
| `smtp` | le mail sortant | smtp_std, **none** (D763 — le mock : send toujours vrai, aucun envoi — la condition indispensable D626 satisfaite, le silence assumé du domestique) | D564/D574/D763 |
| `file` | les fichiers — le dépôt, le guetteur, l'acquittement (le format se lit par un storage — D636) | file_std | D604/D634–D635 |
| `directory` | l'annuaire — le provisionnement des identités, les comptes et les groupes (D29) | azure_ad — le même produit que l'authentification, chacun dans sa famille (D1714) | D29/D418/D604 |
| `location` | le géocodage | ban (Addok), nominatim | D294 |
| `webhook` | **« un point d'entrée dans les différents appels d'api versionnés »** — get, put, post, delete (D609) | webhook_std (D1714) | D623–D624 |
| `siren` | la vérification des identifiants | sirene — l'API Sirene de l'INSEE, à l'implémentation (D1714) | D611/D623 |
| `authentication` | l'identité — l'utilisateur et l'API (D692) | local, azure_ad, sso, keycloak (D716), **none** (D759 — le domestique : l'utilisateur par défaut au degré administrator) | D418/D692/D716/D759 |
| `llm` | le modèle de langage du module `chat` (D957) — la question de l'utilisateur, la connaissance de l'instance sous ses droits ; **et l'IA de la démonstration de Syncytium** (D1510) — d'une phrase, une configuration unique | api — un service en ligne —, local — un modèle local (D1714 ; les deux noms, en proposition) | D957 |

*(La reprise n'est pas une famille : le connecteur de reprise
(D175–D179) s'appuie sur les familles existantes — le storage en
lecture, le file, le webhook.)*

## `storage`

Le storage est « le lien entre les données manipulées par Syncytium, la
manipulation, son optimisation et le stockage physique » (D1294). Son
contrat parle le langage du méta-modèle, l'instance, l'entité, le champ
(D680) ; ses méthodes se groupent en quatre : la transaction, l'instance,
les entités, les enregistrements ; `describe(model)` rend le modèle tel
qu'il est stocké (D1299). Le développement, les quatre énoncés, la
conversion au type, la migration à chaud, les storages de format, est
dans [le storage](storage.md).

## `smtp` (D628)

`send(message, pièces[], destinataires[])` — **le message au format
HTML** (le template `mail` D562/D564 : le mustache + markdown rendu
en HTML fait le corps), **les pièces jointes : une liste de fichiers,
quel que soit le format** ; **l'expéditeur est configuré dans les
propriétés du connecteur**. Les paramètres de `smtp_std`, écrits au cas 5 — `host`, `port`,
`address_from`, `password*` — sont confirmés par les cas (D945, D1093,
D1714).

**Les canaux de notification sont des connecteurs** (D108) : les canaux
autorisés se déclarent dans la description (D109) ; une notification est
persistée d'abord, une entité du méta-modèle, puis remise (D110),
localisée (D218) ; la notification in-app est le défaut, le mail un
setting (D836). **Les mails du socle** partent par `smtp` (D723) : le
changement de mail (D721), le mail des faits marquants (D733, D748).

## `directory` (D633)

`get_users` (tous les utilisateurs de l'AD) · `get_users_from_group`
(les utilisateurs d'un groupe) · `get_groups` (tous les groupes) —
**« uniquement de la lecture », aucun pendant en écriture** : la
synchronisation des comptes et des groupes, les affectations restant
des actes d'administration (D341/D210). L'authentification est une
famille à part, ci-dessous (D692).

## `file` (D634–D635, D972–D973)

| la méthode | le rôle |
|---|---|
| `files(pattern)` | la liste des fichiers au motif, **chacun avec ses descripteurs** (le type `file`, D972 — `.relativepath`, `.fullname`, `.filename`, `.pathname`, `.size`, `.created`, `.modified`, `.hash`) — **la liste vide admise** ; **à la garde de stabilité** : « Syncytium doit attendre qu'un fichier en cours d'écriture soit terminé » ; le contenu se lit par la valeur `file` elle-même (D973 — `get_file` absorbé : « get_file devient files ») ; **appelable dans une règle du mapping par le rôle du connecteur** (D617/D972) : `plans: plans.files(ARCTFICPLA)` |
| `commit(filename)` | l'acquittement — le renommage ou le déplacement, **aux méta-caractères** : un compteur, un identifiant, une date et heure… ; **appelé par le moteur** (D973), d'office, quand l'opération déclenchée par le guetteur a réussi — jamais par une règle ; en échec, le fichier reste en place |

**Le thread d'écoute** (D635) : « `every:` est utilisé sur `connect`
ou `initialize` pour démarrer un thread dédié à l'écoute des
fichiers » — le connecteur écoute lui-même, l'événement détecté
déclenche l'opération déclarée (`when:` — D609). **Le contenu se lit
par un storage de format** (D636) : la famille `file` détecte et
acquitte, le storage csv/xml lit les enregistrements.

## `location` (D637)

`geocode(address: {}) : geolocation` · `reverse(geolocation) :
address` — les signatures typées : l'adresse (l'objet structuré) vers
le type `geolocation` du modèle (D391) et l'inverse ; **le type porte
les coordonnées longitude/latitude et/ou l'adresse postale
normalisée** (D638) — geocode rend le point ET l'adresse mise au
propre ; `ban`/`nominatim` (D294) les implémentent.

## `authentication` (D692)

**Le contrat en deux gestes**, aux deux visages :

| le geste | l'utilisateur (interactif) | l'API (au porteur) |
|---|---|---|
| `challenge()` | le formulaire login/mdp, ou la redirection SSO | le schéma attendu (le 401 — Bearer, ApiKey…) |
| `verify(preuve)` | le couple saisi (local : le haché ; azure_ad : le bind), le ticket au retour (sso) | **le jeton porté par la requête** — la clé d'API, le bearer |

Tous les chemins finissent en **une identité vérifiée**, rapprochée
du compte (D82 — la clé d'unicité par connecteur) ; **la session,
l'écran de connexion et l'orchestration vivent au moteur** (D686), au
chapitre 7, la sécurité (D1723) ;
l'API ne porte pas de session — chaque requête porte sa preuve (le
compte technique D77). **La garde du webhook (D642) appelle ce même
`verify`** — rien de dédié. Les classes : `local` (le haché, les
clés d'API), `azure_ad` (le bind, le bearer Entra), `sso` (l'OIDC,
la signature du jeton), `keycloak` (D716 — l'IdP OIDC open source,
le visage concret du volet SSO), **`none`** (D759 — aucun défi :
l'utilisateur et le groupe par défaut au degré administrator, le
mono-poste domestique — les invariants D699 pré-remplis) — chaque
classe déclare ce qu'elle sait vérifier ; le multi-connecteurs sert l'étanchéité par canal (D77 —
l'AD pour les internes, le local pour les clients). Les paramètres
d'`azure_ad`, écrits au cas 5 — `tenant`, `client_id`, `client_secret*`
— sont confirmés par les cas (D945, D1714).

## `siren` (D639)

`verify(siren) : {}` — « retourne les informations de l'entreprise si
le SIREN est vérifié » : la vérification et l'enrichissement en un
geste, le formulaire client pré-rempli. L'inventaire des
champs disponibles via l'API Sirene de l'INSEE — la dénomination, la
forme juridique, le code NAF, l'adresse du siège, les
établissements/SIRET, l'état actif/cessé… — s'arrête à
l'implémentation de la classe `sirene` (D1724).

## `webhook` (D640–D641)

Le connecteur ne sort pas : **il déclare des entrées que Syncytium
sert**. Chaque point d'entrée porte :

- **le mode** de l'api — `get`, `put`, `post` ou `delete` ;
- **le point d'entrée** — la route versionnée
  `api/<version>/webhook/<nom du point d'entrée>` (D623–D624) ;
- **les paramètres** — « présents dans le header de l'api ou dans
  l'url de l'api ».

**Un webhook = une liste de points d'entrée** (D641) ; le moteur
monte les routes, contrôle les paramètres, reçoit. **Le
déclenchement passe par une authentification obligatoire** (D642) :
aucune entrée anonyme — la garde est d'office sur la route, le
mécanisme, la clé, le jeton ou la signature, au chapitre 7, la sécurité
(D418, D1723). **Le `when:` est
un abonnement** : `when: <connecteur>` (toute entrée) ou l'entrée
précisée — posé à l'`initialize` (D621), l'appel entrant déclenche
l'opération déclarée (D609).

```yaml
# Les connecteurs : un webhook aux deux points d'entrée servis
connectors:
  orders_api:
    type: webhook
    class: webhook_std
    entries:
      new_order:    { mode: post, parameters: [ source, order_id ] }
      order_status: { mode: get,  parameters: [ order_id ] }
```

Le catalogue s'étend par le hook de connecteur (D603) — **une classe
dans une famille, jamais une famille neuve** : « Syncytium fournit un
nombre limité de familles ; il n'existe pas de hook de famille »
(D619) — le contrat de la famille à implémenter (D605), voir
[le hook de connecteur](hooks.md).

## `llm` (D957)

La famille est née avec le module `chat` du socle (D957) ; le contrat,
confirmé (D1718), se complétera à l'implémentation (D1684). **Le rôle** : répondre à la question
d'un utilisateur « en se basant sur la somme des connaissances de
l'instance » — les données et leur description, **dans la limite des
autorisations accordées à l'utilisateur sur la consultation des
données**. Le connecteur ne lit rien de lui-même : **le moteur lui
tend les outils** — la lecture de l'instance par l'API versionnée au
porteur de l'utilisateur (D917–D918) ou par la librairie interne du
modèle, celle des hooks de fonctions ; les droits (D886), la
confidentialité (D885) et l'audience s'appliquent d'eux-mêmes, aucune
seconde couche.

- **la déclaration** : `type: llm`, `parameters: { provider: …,
  model: …, api_key*: ${VAR} }` — le secret par la marque `*` (D944) ;
  les classes à consigner (un service en ligne, un modèle local) ;
- **le geste** : `ask(session, tools) : message` — **la session
  d'échanges** (D959 : adossée à un module — les questions et les
  réponses précédentes de l'utilisateur sur ce module, puis la
  question), les outils tendus par le moteur (la description du
  module comme mode d'emploi — D44, la lecture sous le porteur) ; la
  réponse est un message ;
- **le RGPD, avant le connecteur** : « l'anonymisation sera appliquée
  avant tout envoi » — le moteur anonymise (D696, tel quel — D960) les
  champs `personal` (D695) de tout ce qui part vers le modèle, **sauf
  ce qui revient à l'utilisateur** : les données de son profil
  connecté, et ce que ses droits lui ouvrent — **aucun droit propre au
  chat** : « les droits ne sont pas sur chat mais sur les composantes
  de la description du modèle » (D885/D886, D25) ; ce que ses
  droits ne lui ouvrent pas n'est pas décrit au modèle, il est omis
  (D958) ;
- **la trace, avant l'affichage** : chaque question et chaque
  réponse s'écrit dans les entités du module `chat` — **`session`**
  (l'utilisateur, le module, l'ouverture, le connecteur et le modèle,
  `messages: list of message`) et **`message`** (le rang, le rôle
  utilisateur / assistant / outil, l'horodatage, le contenu, le
  contexte transmis — D959), historisées ; l'événement au journal de
  sécurité (D925) — « pour historisation ou pour analyse en cas de
  fuite ou d'incidents » ;
- **la lecture seule** (D958) : les outils tendus sont les primitives
  de lecture de la librairie interne des hooks de fonctions (D571/D599
  — lire, interroger, naviguer, agréger) — « le chat répond aux
  questions et fournit les données. Les mises à jour se feront via les
  interfaces proposées par l'application. Le chat proposera des liens
  vers les interfaces assurant la mise à jour qui peut être demandée » ;
  la boucle d'outils vit au moteur, le connecteur transporte ;
- **la condition indispensable** (D626/D959) : « si le connecteur LLM
  n'est pas disponible, un message d'erreur sera présenté et les
  questions ne seront pas possibles » — jamais une réponse inventée.
