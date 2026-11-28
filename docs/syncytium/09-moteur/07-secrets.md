# Les secrets et le chiffrement

> **Un secret** est une valeur confidentielle dont l'application a
> besoin pour fonctionner : le mot de passe d'un connecteur, une clé
> d'API, la clé d'un type chiffrant ([glossaire](../../glossaire.md)).

Une application parle à une base, à un annuaire, à un service de
messagerie : elle détient donc des mots de passe. Elle est servie à des
navigateurs, et appelle d'autres systèmes : ses échanges peuvent être
écoutés. Le moteur répond à ces deux risques par des règles simples,
qu'aucune configuration ne peut assouplir. Ce fichier les suit : le
patron unique des secrets, la rotation des clés, le chiffrement en
transit, ce que le moteur sert au navigateur, et le chiffrement au
repos. Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [Le patron unique des secrets](#le-patron-unique-des-secrets)
  - [La marque `*` et la variable](#la-marque--et-la-variable)
  - [Le fichier des variables](#le-fichier-des-variables)
  - [Les deux commandes](#les-deux-commandes)
  - [Le clair refusé au démarrage](#le-clair-refusé-au-démarrage)
- [La rotation des clés](#la-rotation-des-clés)
- [Le chiffrement en transit](#le-chiffrement-en-transit)
  - [Ce que Syncytium sert](#ce-que-syncytium-sert)
  - [Ce que Syncytium appelle](#ce-que-syncytium-appelle)
- [Ce que le moteur sert au navigateur](#ce-que-le-moteur-sert-au-navigateur)
  - [Les origines autorisées](#les-origines-autorisées)
  - [Le rendu des valeurs](#le-rendu-des-valeurs)
  - [Le seul code tiers](#le-seul-code-tiers)
- [Le chiffrement au repos](#le-chiffrement-au-repos)

## Le patron unique des secrets

Tout ce qui est secret suit le même chemin, du fichier de
configuration à l'appel qui s'en sert (D603, D707) :

| Le temps | Ce qui se passe |
|---|---|
| la déclaration | la clé de configuration est marquée `*`, et référence une variable |
| la maison | la variable vit dans le fichier des variables de l'environnement, jamais versionné |
| la création | une commande de Syncytium chiffre la valeur avant de l'enregistrer |
| l'usage | le moteur déchiffre à l'usage : la valeur en clair ne vit qu'en mémoire, le temps de l'appel |

Le périmètre est le même partout : les clés d'API, les mots de passe
des connecteurs, les clés des types chiffrants.

### La marque `*` et la variable

Une clé de configuration suffixée `*` porte une valeur confidentielle
(D944). Dans l'entrepôt (le cas 5), le connecteur de la base :

```yaml
# L'entrepôt
# La base de l'application : un schéma PostgreSQL.
entrepot:
  type: storage
  class: postgresql
  parameters:
    host: ${ENTREPOT_HOST}
    database: ${ENTREPOT_DATABASE}
    schema: entrepot
    user: ${ENTREPOT_USER}
    password*: ${ENTREPOT_PASSWORD}

  # Le réglementaire
  # Le stockage est en France.
  rgpd:
    countries: FR
```

- **la marque `*`** dit que la valeur n'est jamais écrite en clair
  dans un journal ;
- **`${ENTREPOT_PASSWORD}`** référence une variable : le dépôt ne porte
  jamais la valeur ;
- **le nom du paramètre** est le contrat de la classe du connecteur ;
  **le nom de la variable** est celui du déploiement.

### Le fichier des variables

Les variables vivent dans le fichier des variables de l'environnement,
`.env` par habitude. Deux règles le protègent :

- **il n'est jamais versionné** : le dépôt du client porte la
  description, non ses secrets (D336) ;
- **ses secrets sont obligatoirement chiffrés** (D707), par une clé
  dérivée de l'environnement et de la machine (D603).

Cette dérivation a une conséquence utile : un fichier copié sur une
autre machine reste muet.

### Les deux commandes

Deux commandes complètent le patron (D708) :

```bash
# chiffre la valeur et l'enregistre dans le fichier des variables
syncytium encrypt DB_PASSWORD "le-mot-de-passe"

# rend la valeur déchiffrée : la vérification d'un service, le débogage
syncytium decrypt DB_PASSWORD
```

`decrypt` n'est utile qu'à celui qui a déjà la machine. Le cadre commun
des commandes de `syncytium` sera posé au chapitre 10.

### Le clair refusé au démarrage

Le chiffrement n'est pas laissé à la vigilance de chacun (D902). Trois
gardes se suivent :

- **à l'initialisation**, le wizard demande les secrets et les chiffre
  lui-même ;
- **avant le dépôt**, une compétence du projet Syncytium repère une
  valeur laissée en clair, et la fait chiffrer (D2155). Elle complète
  le refus du démarrage, elle ne le remplace pas ;
- **au démarrage**, une valeur en clair, pour une variable qu'une clé
  marquée `*` référence, vaut refus de démarrer. Le moteur donne la
  raison, et la commande à exécuter. C'est la dernière barrière.

Dans l'entrepôt (le cas 5), supposons que le concepteur laisse en clair
le mot de passe d'un connecteur. La compétence le lui signale pendant
qu'il écrit, et la valeur est chiffrée avant le dépôt. Si elle lui
échappe, le moteur refuse de démarrer.

## La rotation des clés

> **La rotation des clés** rechiffre, sous la clé courante, tout ce
> que l'instance tient chiffré ([glossaire](../../glossaire.md)).

La clé de chiffrement dépend de l'environnement et de la machine. Dès
que l'un des deux change, ce qui est chiffré doit l'être de nouveau.
C'est le rôle de `syncytium rotate` (D730) :

- elle rechiffre le fichier des variables, et les champs des types
  chiffrants ;
- elle se conduit comme `migrate` : en masse, en une transaction, avec
  une progression suivie ;
- elle est tracée.

Quatre situations la déclenchent :

| Ce qui la déclenche | Pourquoi |
|---|---|
| chaque restauration | l'image restaurée vit peut-être sur une autre machine : la clé a changé (D730) |
| la duplication d'une sandbox, et sa recharge | une sandbox est un environnement, donc une clé : la copie de l'origine est rechiffrée sous la sienne (D915) |
| la commande | à la demande de l'administrateur |
| un changement d'algorithme | `rotate` est le seul geste qui rechiffre ou rehache (D916) |

La dernière ligne repose sur une règle : toute empreinte stockée porte
l'identifiant de son algorithme (D916).

- changer d'algorithme ne casse aucun compte : le moteur vérifie avec
  l'algorithme que l'empreinte annonce ;
- le passage à l'algorithme courant ne se fait que par `rotate`, en
  masse et tracé. Il ne se fait jamais en silence, à la vérification
  d'un mot de passe : aucun geste privilégié sans trace ;
- les algorithmes sont des standards publiés, jamais un algorithme
  maison.

## Le chiffrement en transit

Le moteur distingue ce qu'il sert de ce qu'il appelle (D705) :

| Le sens | La règle | L'exception |
|---|---|---|
| ce que Syncytium sert : les écrans, les API, les routes des webhooks | HTTPS | aucune |
| ce que Syncytium appelle : ses connecteurs | chiffré par défaut | `unencrypted:`, déclarée au connecteur |

### Ce que Syncytium sert

> **Le reverse proxy** est le serveur placé en amont de l'application :
> il reçoit les requêtes du navigateur, en HTTPS, et les transmet au
> moteur ([glossaire](../../glossaire.md)).

Le moteur ne porte pas lui-même le HTTPS : un reverse proxy l'assure,
partout (D2154, D2155). Aucune exemption n'existe, pas même pour la
boucle locale ni pour le poste informatique domestique (D919). Selon
l'installation, le reverse proxy n'a pas le même fournisseur :

| L'installation | Qui assure le reverse proxy | Le certificat |
|---|---|---|
| une installation industrielle existante | l'équipe d'administration | celui de l'infrastructure |
| un poste informatique domestique | Syncytium : il l'installe et le démarre | à défaut d'un autre, un certificat auto-signé fourni par Syncytium, engendré à l'initialisation et rangé avec les secrets (D919) |

Le reverse proxy de Syncytium est donc une fonctionnalité optionnelle :
elle sert là où personne d'autre ne tient ce rôle. Deux cas du dépôt
l'illustrent :

- l'entrepôt (le cas 5) tourne sur des serveurs : le reverse proxy est
  celui de l'équipe d'administration ;
- la banque (le cas 4) tourne sur un poste informatique domestique :
  Syncytium installe le reverse proxy, et le démarre avec
  l'application.

Deux règles tiennent dans les deux cas :

- **le certificat relève de l'infrastructure** : le moteur ne l'émet
  pas, et ne le renouvelle pas. L'écriture de la déclaration du reverse
  proxy, à l'environnement, est en proposition ;
- **au démarrage, le moteur vérifie qu'il est servi en HTTPS**. Servi
  en clair, il refuse de démarrer, et dit pourquoi.

### Ce que Syncytium appelle

Un appel en clair est une exception que le concepteur déclare au
connecteur, par `unencrypted:` (D901) : voir
[la déclaration d'un connecteur](../05-connecteurs/02-declaration.md).
Le moteur ne la laisse pas dormir dans un fichier :

- elle est signalée à l'ingestion ;
- elle est visible dans la description du connecteur ;
- elle est rappelée chaque jour, dans le tableau de bord de la santé
  et dans le mail des faits marquants (D731, D733).

## Ce que le moteur sert au navigateur

Le navigateur est le lieu le plus exposé de l'application. Le moteur y
tient quatre règles (D918).

### Les origines autorisées

Par défaut, seule l'interface de Syncytium parle à son API : elle est
de même origine. Un site tiers dont une page doit appeler l'API depuis
un navigateur se déclare à l'environnement, par `cors:`. Aucun cas n'en
porte ; en illustration :

```yaml
# Les origines autorisées
# Les sites tiers dont une page peut appeler l'API depuis un navigateur ; sans cette clé, aucun.
cors:
  - https://portail.exemple.fr
  - https://extranet.exemple.fr
```

- **sans la clé, aucune origine tierce** n'est admise ;
- **le joker `*` est refusé à l'ingestion** : la liste se nomme ;
- **une origine autorisée ne dispense de rien** : l'appel prouve
  toujours son identité (D917) ;
- les consommateurs qui ne sont pas des navigateurs, un connecteur, un
  webhook, un script, ne sont pas concernés.

### Le rendu des valeurs

| Ce qui s'affiche | La règle |
|---|---|
| une valeur saisie par un utilisateur | elle est toujours rendue comme du texte : le composant échappe, jamais une balise |
| un gabarit du concepteur | ses variables sont échappées, et le HTML brut n'y est pas accepté : le concepteur écrit du markdown |
| un script | la page n'autorise que ceux qu'elle connaît : ceux de Syncytium, et les hooks d'interface enregistrés |

### Le seul code tiers

Le hook d'interface est le seul code tiers qui s'exécute dans le
navigateur (D66, D918) :

- il ne voit jamais une donnée `private` ;
- il relève de l'expérience de l'utilisateur, jamais de la sécurité :
  le serveur arbitre ;
- il est sous la responsabilité du concepteur, et la documentation
  générée le liste : l'administrateur sait quel code tourne chez ses
  utilisateurs.

Sa déclaration est au chapitre 4 :
[les hooks des composants](../04-composants/07-hooks.md).

## Le chiffrement au repos

Deux niveaux ne se confondent pas (D706) :

| Le niveau | Qui en répond |
|---|---|
| le chiffrement du stockage : la base, le disque | l'infrastructure, non Syncytium |
| le chiffrement d'une valeur | le type du champ |

Chiffrer une valeur est un pouvoir de type. Le type qui l'a chiffre par
ses fonctions de valeur, et déclare ce qu'il sait encore faire : la
recherche stricte au mieux, le tri perdu (D579, D582, D683). Le type
`password` en est l'exemple (D463) : il s'écrit, il ne se relit pas, et
seule son empreinte est gardée. Voir
[`password`](../02-modele/05-types.md#password).

Le détail des passages d'une migration vit dans la base de
l'application, avec le module `_migration` (D1889, D1893) : il suit
donc la protection de cette base, sans chiffrement qui lui soit propre.
