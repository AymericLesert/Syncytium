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
démarrage, puis le mode safe, l'amorçage et le bris de glace. Les
décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [Les vérifications du démarrage](#les-vérifications-du-démarrage)
  - [Ce que le moteur vérifie](#ce-que-le-moteur-vérifie)
  - [La condition indispensable](#la-condition-indispensable)
  - [Le refus de démarrer s'explique](#le-refus-de-démarrer-sexplique)
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
