# Le démarrage de l'instance et le secours

> **L'instance** est l'installation d'un client. Elle réunit ce qu'il
> faut à l'application pour fonctionner : son moteur, ses
> environnements, sa base, sa description
> ([glossaire](../../glossaire.md)).

Avant de servir le premier écran, le moteur s'assure qu'il peut le
faire sans risque : ses secrets sont chiffrés, il est servi en HTTPS,
il sait alerter l'administrateur, et la base est à la version qu'il
attend. Si une de ces vérifications échoue, il ne démarre pas, et il
dit pourquoi. Reste un cas à part : celui où ce qui manque est
justement ce qui permet d'entrer, l'annuaire ou l'authentification.
Trois secours y répondent. Ce fichier suit donc les vérifications du
démarrage, l'arrêt de l'application, puis le mode safe, l'amorçage et
le bris de glace. Les
décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [Les vérifications du démarrage](#les-vérifications-du-démarrage)
  - [Ce que le moteur vérifie](#ce-que-le-moteur-vérifie)
  - [La condition indispensable](#la-condition-indispensable)
  - [Le refus de démarrer s'explique](#le-refus-de-démarrer-sexplique)
- [L'arrêt de l'application](#larrêt-de-lapplication)
  - [L'arrêt demandé](#larrêt-demandé)
  - [La position de repli](#la-position-de-repli)
- [Le mode safe](#le-mode-safe)
  - [La porte de secours](#la-porte-de-secours)
  - [Les conditions indispensables, suspendues](#les-conditions-indispensables-suspendues)
- [L'amorçage et le bris de glace](#lamorçage-et-le-bris-de-glace)
  - [L'amorçage](#lamorçage)
  - [Le bris de glace](#le-bris-de-glace)
  - [Les trois secours](#les-trois-secours)

## Les vérifications du démarrage

### Ce que le moteur vérifie

| La vérification | Ce qui est exigé | Où la lire |
|---|---|---|
| les secrets | aucune valeur en clair, dans le fichier des variables, pour une variable qu'une clé marquée `*` référence (D902, D944) | [les secrets](07-secrets.md#le-clair-refusé-au-démarrage) |
| le transit | l'application est servie en HTTPS, sans exception (D919) | [le chiffrement en transit](07-secrets.md#le-chiffrement-en-transit) |
| le canal d'alerte | l'envoi d'un mail à l'administrateur est possible (D626) | plus bas |
| l'estampille | la base est à la version attendue, ou en retard sur elle (D93) | [l'estampille](02-ingestion.md#lestampille) |
| le dossier des versions | ses statuts et ses transitions sont cohérents (D344) | [la cohérence du dossier](02-ingestion.md#la-cohérence-du-dossier-des-versions) |

Le démarrage une fois acquis, l'application rejoint la version la plus
élevée de son statut : voir
[quand l'ingestion se déclenche](02-ingestion.md#quand-lingestion-se-déclenche).

### La condition indispensable

> **La condition indispensable** est ce sans quoi l'application ne
> démarre pas : pouvoir envoyer un mail à l'administrateur
> ([glossaire](../../glossaire.md)).

Une application qui ne peut pas alerter ne doit pas servir. Le canal
d'alerte passe donc avant tout (D626) : le connecteur `smtp` est
vérifié au démarrage. Sa définition, et la classe `none` qui la
satisfait sur un poste informatique domestique, sont au chapitre 5 :
[la position de sécurité](../05-connecteurs/03-socle.md#la-position-de-sécurité).

### Le refus de démarrer s'explique

Un moteur qui refuse de démarrer donne toujours sa raison (D745) : la
configuration corrompue, le connecteur indisponible, la perte du
réseau. Quand un geste répare, il le nomme. Pour un secret laissé en
clair, il donne ainsi la commande à exécuter, `syncytium encrypt`
(D902).

## L'arrêt de l'application

> **L'arrêt de l'application** met l'application en position de
> sécurité, pour assurer un bon redémarrage
> ([glossaire](../../glossaire.md)).

Un moteur ne fait pas que démarrer. Il s'arrête aussi : pour une
maintenance, pour une intervention sur le serveur, ou sans prévenir,
parce que le courant manque. Dans tous les cas, un arrêt se juge au
redémarrage qui le suit (D2134).

### L'arrêt demandé

L'arrêt met l'application en position de sécurité, pour que le
redémarrage se passe bien. C'est la position que le moteur prend déjà
quand un système tiers fait défaut (D2135) : voir
[la position de sécurité](08-disponibilite.md#la-position-de-sécurité).
Ses gestes, dans l'ordre :

| Le geste | Ce qu'il fait |
|---|---|
| la page de maintenance | elle s'affiche : l'application ne sert plus ses écrans (D626) |
| les déclenchements | ils sont suspendus : plus aucune opération ne part (D625) |
| le passage en cours | il est interrompu, comme lors d'un redémarrage, et tracé ; il n'est pas relancé de lui-même (D1077) : voir [l'interruption](04-passage.md#linterruption) |
| les connecteurs | chacun est relâché, par la méthode `release` du socle commun (D621) : voir [les méthodes](../05-connecteurs/03-socle.md#les-méthodes) |
| l'arrêt | l'application s'arrête |

Dans l'entrepôt (le cas 5), un arrêt demandé à 2 h 05 surprend le delta
de la nuit. Tant qu'il n'a pas basculé, le passage est interrompu : rien
de l'entrepôt n'est touché, et l'administrateur le relance au
redémarrage.

### La position de repli

> **La position de repli** est l'état sûr auquel l'application peut
> toujours revenir après un arrêt brutal
> ([glossaire](../../glossaire.md)).

Un arrêt brutal ne laisse le temps de rien préparer. Syncytium garde
donc toujours une position de repli, et cette garantie ne doit rien
coûter en performance (D2134). Ce que le chapitre décrit ailleurs y
contribue déjà :

| Ce que l'arrêt brutal surprend | La position de repli |
|---|---|
| une migration de version | la migration est transactionnelle : la base reste dans l'état précédent, et le modèle en service n'a pas été touché (D9, D1974) |
| un passage de reprise | la bascule s'applique en entier, ou pas du tout ; avant elle, rien de l'existant n'est touché (D1041, D1044) |
| une tâche | elle n'est pas rejouée d'elle-même : elle se relance depuis la supervision (D57) |

Au redémarrage, deux appuis attendent le moteur : l'estampille, qui dit
où en est la base, et sans laquelle il ne sert pas (D93) ; la forme
compilée de la description, prête à l'emploi (D329).

## Le mode safe

> **Le mode safe** est un mode d'exécution choisi au lancement de
> l'application : le module d'administration seul, ouvert au compte
> administrateur principal ([glossaire](../../glossaire.md)).

### La porte de secours

L'annuaire est injoignable, le SSO est cassé, ou les droits ont été
verrouillés par erreur : plus personne n'entre, pas même pour réparer.
Le mode safe est la porte de secours de cette situation (D718) :

| Ce qui le caractérise | Le détail |
|---|---|
| quand il se choisit | au lancement de l'application ; il n'est jamais atteignable depuis l'application en service |
| ce qu'il sert | le module d'administration seul : aucune donnée métier |
| qui y entre | le compte administrateur principal, avec le mot de passe fixé à l'installation |
| où vit ce mot de passe | avec les secrets : hors de l'annuaire, hors de la configuration versionnée |
| ce qu'il laisse | une trace à l'audit, et au journal |

Une porte de secours n'est jamais une porte dérobée : le mode safe est
toujours tracé.

### Les conditions indispensables, suspendues

Le mode safe désactive toutes les conditions indispensables (D745).
L'envoi d'un mail n'y est plus exigé pour démarrer : c'est le seul mode
qui en soit exempté. Il sert précisément quand le reste manque.

## L'amorçage et le bris de glace

Deux autres secours vivent dans l'application en service. Ils portent
sur un compte, non sur un mode de lancement.

### L'amorçage

> **L'amorçage** est le premier accès à une application qui n'a encore
> aucun administrateur ([glossaire](../../glossaire.md)).

Une application neuve n'a pas de compte : il en faut un pour créer les
autres. La description porte donc un compte administrateur de secours,
avec son mot de passe (D33) :

- il n'est utilisable que s'il n'existe aucun compte administrateur ;
- en régime normal, il est inerte ;
- la description n'en garde que l'empreinte, jamais le clair : le
  fichier est versionné.

### Le bris de glace

> **Le bris de glace** est l'activation du compte de secours quand
> l'authentification est indisponible
> ([glossaire](../../glossaire.md)).

Le compte de secours s'active aussi quand le connecteur
d'authentification ne répond plus (D81) :

- il ne dépend d'aucun connecteur externe ;
- son activation est auditée, et elle déclenche une alerte : c'est un
  événement de sécurité fort.

### Les trois secours

| Le secours | La situation | Ce qu'il ouvre |
|---|---|---|
| l'amorçage | aucun compte administrateur n'existe | le compte de la description |
| le bris de glace | l'authentification ne répond plus | le compte de secours, dans l'application en service |
| le mode safe | l'annuaire, le SSO ou les droits sont hors d'usage | le module d'administration seul, au lancement |

Le quotidien des comptes, l'invitation, le mot de passe oublié, le
verrouillage, relève de l'administration : il est au chapitre 10.
L'entrée en régime normal est au chapitre 7 :
[l'entrée](../07-securite/03-entree.md).
