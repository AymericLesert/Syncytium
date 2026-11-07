# Les neuf familles

Chaque connecteur appartient à une famille, et la famille est son
contrat : les méthodes que toute classe de la famille implémente. Ce
fichier donne les neuf familles, le catalogue de leurs classes, puis le
contrat de chacune. Le storage, le plus riche, est résumé ici et
développé dans son propre fichier.

## Le sommaire

- [Les familles et le catalogue des classes](#les-familles-et-le-catalogue-des-classes)
- [`storage`](#storage)
- [`smtp`](#smtp)
- [`file`](#file)
- [`directory`](#directory)
- [`location`](#location)
- [`authentication`](#authentication)
- [`siren`](#siren)
- [`webhook`](#webhook)
- [`llm`](#llm)

## Les familles et le catalogue des classes

> **Une famille de connecteurs** est le contrat d'un connecteur, défini
> par le socle : neuf familles, chacune avec ses méthodes. Le concepteur
> n'en ajoute pas, il ajoute une classe ([glossaire](../../glossaire.md)).

Les familles sont définies par le socle lui-même (D619, D1716). Le jeu
s'ouvre par décision : la neuvième, `llm`, est entrée avec le module
`chat` du socle (D957). La famille contraint le contrat (D620) : la
conformité d'une classe se vérifie au chargement. Le catalogue des
classes est l'union du registre et des cas (D1714) ; les noms `sirene`,
`api` et `local` restent en proposition jusqu'à l'implémentation.

| la famille | le rôle | les classes |
|---|---|---|
| `storage` | les bases de données, le stockage du modèle et les échanges ; les formats structurés des exports et des imports (D636) | postgresql, sqlserver, mysql, oracle, sqlite, le natif du domestique (D1114) ; csv, xlsx, xml, json ; memory, le modèle tenu en mémoire, la base miroir d'une reprise et le mode démo (D1045, D1508) |
| `smtp` | le mail sortant | smtp_std ; none, le mock, aucun envoi (D763) |
| `file` | les fichiers : le dépôt, le guetteur, l'acquittement ; le format se lit par un storage (D636) | file_std |
| `directory` | l'annuaire : le provisionnement des identités, les comptes et les groupes (D29) | azure_ad, le même produit que l'authentification, chacun dans sa famille |
| `location` | le géocodage (D294) | ban, nominatim |
| `authentication` | l'identité, l'utilisateur et l'API (D692) | local, azure_ad, sso, keycloak (D716) ; none, le domestique (D759) |
| `siren` | la vérification des identifiants d'entreprise | sirene, l'API Sirene de l'INSEE |
| `webhook` | les points d'entrée servis par l'API versionnée, `get`, `put`, `post`, `delete` (D609, D623) | webhook_std |
| `llm` | le modèle de langage du module `chat` (D957) et l'IA de la démonstration de Syncytium (D1510) | api, un service en ligne ; local, un modèle local |

La reprise n'est pas une famille : le connecteur d'une reprise est un
storage en lecture, un `file` ou un `webhook` (D175–D179).

## `storage`

Le storage est « le lien entre les données manipulées par Syncytium, la
manipulation, son optimisation et le stockage physique » (D1294). Son
contrat parle le langage du méta-modèle, l'instance, l'entité, le champ
(D680). Ses méthodes se groupent en quatre : la transaction, l'instance,
les entités, les enregistrements ; `describe(model)` rend le modèle tel
qu'il est stocké (D1299). Le développement, les quatre énoncés, la
conversion au type, la migration à chaud, les storages de format, est
dans [le storage](05-storage.md).

## `smtp`

Un geste, `send(message, pièces, destinataires)` (D628), celui de
l'opération `send` du socle (D574) :

- le message est au format HTML ; le template `mail` fait le corps, du
  Markdown rendu en HTML (D562, D564) ;
- les pièces jointes sont une liste de fichiers, quel que soit le
  format ;
- l'expéditeur est un paramètre du connecteur, `address_from` (D1093).

Les paramètres de `smtp_std` sont `host`, `port`, `address_from` et
`password*` (D945, D1714). La classe `none` rend `send` toujours vrai et
n'envoie rien : le silence assumé du domestique (D763).

Les canaux de notification sont des connecteurs (D108). Les canaux
autorisés se déclarent dans la description (D109). Une notification est
persistée d'abord, une entité du méta-modèle, puis remise (D110), dans
la langue du destinataire (D218). La notification in-app est le défaut,
le mail un setting (D836). Les mails du socle partent par `smtp` (D723) :
le changement de mail (D721), le mail des faits marquants (D733, D748).

## `file`

Deux gestes (D634, D635, D972, D973) :

- **`files(motif)`** rend la liste des fichiers au motif, chacun avec ses
  descripteurs, le type `file` du modèle : `.relativepath`,
  `.fullname`, `.filename`, `.pathname`, `.size`, `.created`,
  `.modified`, `.hash` (D972). La liste vide est admise. Le connecteur
  attend qu'un fichier en cours d'écriture soit terminé. Le contenu se
  lit par la valeur `file` elle-même. Une règle de reprise l'appelle par
  le rôle du connecteur, `plans.files(ARCTFICPLA)` (D617, D972).
- **`commit(fichier)`** acquitte : il renomme ou déplace le fichier, avec
  des méta-caractères, un compteur, un identifiant, une date. Le moteur
  l'appelle d'office quand l'opération déclenchée a réussi, jamais une
  règle (D973). En échec, le fichier reste en place.

Le thread d'écoute (D635) : `every:` démarre, à `connect` ou
`initialize`, un thread dédié à l'écoute du dossier. Le connecteur
écoute lui-même ; le fichier détecté déclenche l'opération déclarée par
son `when:` (D609), au chapitre 6. Le contenu se lit par un storage de
format (D636) : `file` détecte et acquitte, le storage csv ou xlsx lit
les enregistrements.

## `directory`

Trois gestes, en lecture seule (D633) : `get_users()`, tous les
utilisateurs de l'annuaire ; `get_users_from_group()`, ceux d'un
groupe ; `get_groups()`, tous les groupes. Aucun pendant en écriture :
la synchronisation des comptes et des groupes et les affectations
restent des actes d'administration (D341, D210). L'authentification est
une famille à part, ci-dessous (D692).

## `location`

Deux gestes typés (D637) : `geocode(adresse) : geolocation` et
`reverse(geolocation) : adresse`. L'adresse est un objet structuré ; le
type `geolocation` du modèle porte les coordonnées et l'adresse postale
normalisée (D391, D638). `geocode` rend le point et l'adresse mise au
propre. Les classes `ban` et `nominatim` l'implémentent (D294).

## `authentication`

Le contrat a deux gestes et deux visages, l'utilisateur et l'API
(D692) :

| le geste | l'utilisateur, interactif | l'API, au porteur |
|---|---|---|
| `challenge()` | le formulaire login et mot de passe, ou la redirection SSO | le schéma attendu, le 401, Bearer ou ApiKey |
| `verify(preuve)` | le couple saisi, le haché en local, le bind en azure_ad, le ticket au retour en sso | le jeton porté par la requête, la clé d'API, le bearer |

Tous les chemins finissent en une identité vérifiée, rapprochée du
compte par la clé d'unicité du connecteur (D82). La session, l'écran de
connexion et l'orchestration vivent au moteur (D686), au chapitre 7, la
sécurité (D1723). L'API ne porte pas de session : chaque requête porte
sa preuve, le compte technique (D77). La garde du webhook appelle ce
même `verify` (D642).

Cinq classes : `local`, le haché et les clés d'API ; `azure_ad`, le bind
et le bearer Entra ; `sso`, l'OIDC et la signature du jeton ;
`keycloak`, l'IdP OIDC open source (D716) ; `none`, aucun défi,
l'utilisateur et le groupe par défaut au degré administrator, le
mono-poste domestique (D759, D699). Chaque classe déclare ce qu'elle
sait vérifier. Plusieurs connecteurs servent l'étanchéité par canal,
l'annuaire pour les internes, le local pour les clients (D77). Les
paramètres d'`azure_ad` sont `tenant`, `client_id` et `client_secret*`
(D945, D1714).

Une classe fournit aussi les propriétés qui associent un groupe de
l'application à un groupe de son système : le GUID du groupe pour
Entra, aucune pour `local` et `none`, plusieurs pour d'autres, leurs
valeurs parfois énumérées. L'association se saisit dans une interface
du module d'authentification, jamais dans la configuration : les
administrateurs réorganisent les droits sans déployer une nouvelle
application (D1788). Ses valeurs s'enregistrent dans le module
`_administration` du méta-modèle (D1789). Il en faut une pour chaque
groupe nommé de l'application, une pour `administrator` et une pour le
groupe de l'application : l'utilisateur qui se connecte doit être actif
dans le système, présent dans le groupe de l'application et dans l'un
de ses groupes (D1792).

## `siren`

Un geste, `verify(siren)` (D639) : il « retourne les informations de
l'entreprise si le SIREN est vérifié ». La vérification et
l'enrichissement se font en un geste, le formulaire client se
pré-remplit. L'inventaire des champs de l'API Sirene de l'INSEE, la
dénomination, la forme juridique, le code NAF, l'adresse du siège, les
établissements, l'état actif ou cessé, s'arrête à l'implémentation de
la classe `sirene` (D1724).

## `webhook`

Le connecteur ne sort pas : il déclare des entrées que Syncytium sert
(D640). Chaque point d'entrée porte :

- le mode de l'API, `get`, `put`, `post` ou `delete` ;
- la route versionnée, `api/<version>/webhook/<point d'entrée>` (D623,
  D624) ;
- les paramètres, dans l'entête ou dans l'URL.

Un webhook est une liste de points d'entrée (D641) : le moteur monte
les routes, contrôle les paramètres, reçoit. Toute entrée est
authentifiée (D642) : la garde est d'office sur la route ; le mécanisme,
la clé, le jeton ou la signature, est au chapitre 7, la sécurité (D418,
D1723). Le `when:` d'une opération s'abonne à une entrée,
`when: <connecteur>` ou `when: <connecteur>.<entrée>`, posé à
l'`initialize` (D621) ; l'appel entrant déclenche l'opération (D609).
L'exemple est inventé, aucun cas n'en porte :

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

## `llm`

La famille est née avec le module `chat` du socle (D957). Le contrat est
confirmé (D1718) et se complétera à l'implémentation (D1684). Le rôle :
répondre à la question d'un utilisateur « en se basant sur la somme des
connaissances de l'instance », les données et leur description, « dans
la limite des autorisations accordées à l'utilisateur sur la
consultation des données ». Le connecteur ne lit rien de lui-même : le
moteur lui tend les outils, la lecture de l'instance par l'API
versionnée au porteur de l'utilisateur (D917, D918) ou par la librairie
d'exploration du modèle (D572, D599). Les droits (D886), la
confidentialité (D885) et l'audience s'appliquent d'eux-mêmes, sans
seconde couche.

- **La déclaration** : `type: llm`, les paramètres `provider`, `model`
  et `api_key*` (D957, D944) ; les classes `api`, un service en ligne,
  et `local`, un modèle local (D1714).
- **Le geste** : `ask(session, outils) : message`. La session d'échanges
  est adossée à un module, une par module et par utilisateur, avec ses
  questions et ses réponses précédentes (D959). Les outils sont tendus
  par le moteur, la description du module en mode d'emploi (D44), la
  lecture sous le porteur. La réponse est un message.
- **Le RGPD, avant le connecteur** : le moteur anonymise les champs
  `personal` de tout ce qui part vers le modèle (D695, D696, D960), sauf
  ce qui revient à l'utilisateur, les données de son profil connecté et
  ce que ses droits lui ouvrent. Il n'y a aucun droit propre au chat :
  « les droits ne sont pas sur chat mais sur les composantes de la
  description du modèle » (D885, D886, D25). Ce que ses droits ne lui
  ouvrent pas n'est pas décrit au modèle, il est omis (D958).
- **La trace, avant l'affichage** : chaque question et chaque réponse
  s'écrit dans les entités du module `chat`, `session`, l'utilisateur,
  le module, l'ouverture, le connecteur et le modèle, et `message`, le
  rang, le rôle, l'horodatage, le contenu, le contexte transmis (D959),
  historisées ; l'événement va au journal de sécurité (D925).
- **La lecture seule** (D958) : les outils tendus sont les primitives
  de lecture de la librairie d'exploration, lire, interroger, naviguer,
  agréger (D571, D599). « Le chat répond aux questions et fournit les données. Les
  mises à jour se feront via les interfaces proposées par l'application.
  Le chat proposera des liens vers les interfaces assurant la mise à
  jour qui peut être demandée. » La boucle d'outils vit au moteur, le
  connecteur transporte.
- **La condition indispensable** (D626, D959) : « si le connecteur LLM
  n'est pas disponible, un message d'erreur sera présenté et les
  questions ne seront pas possibles ». Jamais une réponse inventée.
