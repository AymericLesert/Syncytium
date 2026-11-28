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
démarrage, l'arrêt de l'application et le redémarrage qui suit un arrêt
brutal, puis le mode safe, l'amorçage et le bris de glace. Les
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
  - [Le redémarrage après un arrêt brutal](#le-redémarrage-après-un-arrêt-brutal)
- [Le mode safe](#le-mode-safe)
  - [La porte de secours](#la-porte-de-secours)
  - [Les conditions indispensables, suspendues](#les-conditions-indispensables-suspendues)
- [L'amorçage et le bris de glace](#lamorçage-et-le-bris-de-glace)
  - [Le compte de secours](#le-compte-de-secours)
  - [L'amorçage](#lamorçage)
  - [Le bris de glace](#le-bris-de-glace)
  - [Les trois secours](#les-trois-secours)

## Les vérifications du démarrage

### Ce que le moteur vérifie

| La vérification | Ce qui est exigé | Où la lire |
|---|---|---|
| les secrets | aucune valeur en clair, dans le fichier des variables, pour une variable qu'une clé marquée `*` référence (D902, D944) ; en amont, une compétence du projet repère ces valeurs et les fait chiffrer (D2155) | [les secrets](07-secrets.md#le-clair-refusé-au-démarrage) |
| le transit | l'application est servie en HTTPS, sans exception : un reverse proxy, placé en amont de l'application, l'assure, celui de l'équipe d'administration ou celui que Syncytium installe (D919, D2154, D2155) | [le chiffrement en transit](07-secrets.md#le-chiffrement-en-transit) |
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
d'alerte passe donc avant tout (D626) : au démarrage, le moteur vérifie
que le connecteur `smtp` peut envoyer un mail à l'administrateur. S'il
ne le peut pas, l'application ne démarre pas.

Une déclaration permet de passer outre cette condition : donner la
classe `none` au connecteur `smtp` (D763, D2154). Le concepteur déclare
ainsi une application qui n'envoie aucun mail, et le moteur démarre
sans exiger l'envoi. Les environnements domestiques des cas du dépôt
l'écrivent ; celui de la banque (le cas 4) :

```yaml
# Le mail sortant
# Muet, assumé.
smtp:
  class: none
```

La classe `none` elle-même est décrite avec les autres classes de la
famille, au chapitre 5 : [`smtp`](../05-connecteurs/04-familles.md#smtp).

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

Un moteur ne fait pas que démarrer. Il s'arrête aussi, de deux
façons :

- **l'arrêt demandé** : l'administrateur arrête l'application, pour une
  maintenance ou pour une intervention sur le serveur. Le moteur a le
  temps de se mettre en position de sécurité ;
- **l'arrêt brutal** : le serveur tombe en panne, son alimentation est
  coupée, ou le système interrompt le processus du moteur. Le moteur
  n'a le temps de rien.

Dans les deux cas, un arrêt se juge au redémarrage qui le suit (D2134).

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
| une migration de version | la migration est transactionnelle : la base reste dans l'état précédent, et l'instance en service n'a pas été touchée (D9, D1974) |
| un passage de reprise | la bascule s'applique en entier, ou pas du tout ; avant elle, rien de l'existant n'est touché (D1041, D1044) |
| une tâche | elle n'est pas rejouée d'elle-même : elle se relance depuis la supervision (D57) |

### Le redémarrage après un arrêt brutal

La position de repli garantit que rien d'achevé n'est perdu. Elle ne
dit pas ce que l'arrêt a laissé en chantier. Au redémarrage qui suit un
arrêt brutal, le moteur fait donc deux choses avant de servir (D2154) :

- **il signale l'arrêt brutal** à l'administrateur ;
- **il vérifie ce que l'arrêt a surpris**, pour garantir le bon
  fonctionnement de l'application : une tâche en cours de traitement,
  une transaction interrompue, ce qui était en construction.

Ce que la vérification trouve, et ce que le moteur en fait :

| Ce que l'arrêt brutal a laissé | Ce que le moteur fait au redémarrage |
|---|---|
| une transaction interrompue | rien n'en reste : elle n'a pas été validée, la base l'a annulée |
| une tâche en cours de traitement | elle est notée interrompue ; elle n'est pas rejouée d'elle-même, elle se relance depuis la supervision (D57) |
| une base miroir, celle d'un passage de reprise | elle est supprimée ; le passage reste tracé, et l'administrateur le relance (D1077) |
| la nouvelle instance d'une migration de version en cours | elle est supprimée, puis la migration est relancée |
| le dossier interne d'une version en cours d'ingestion | il est supprimé : la relance ne part jamais d'une version partielle |

Les trois suppressions suivent la même idée : ce qui était en
construction est défait, puis refait en entier. Aucune ne touche à ce
qui sert : ni l'instance en service, ni la base de l'application, ni
les versions déjà ingérées. Le dossier interne est décrit avec
l'ingestion : voir [le dossier interne](02-ingestion.md#le-dossier-interne).

Dans l'entrepôt (le cas 5), supposons que le serveur perde son
alimentation pendant l'ingestion de la version 1.0.0.2, alors que la
migration de ses données est en cours. Au redémarrage :

- le moteur signale l'arrêt brutal à l'administrateur ;
- il supprime le dossier interne de la 1.0.0.2, resté incomplet ;
- il supprime la nouvelle instance, que la migration construisait ;
- il relance l'ingestion de la 1.0.0.2, depuis son début ;
- pendant ce temps, l'entrepôt sert la 1.0.0.1 : elle n'a pas été
  touchée.

La base miroir de l'entrepôt, elle, est tenue en mémoire : elle a
disparu avec l'arrêt, et il n'y a rien à supprimer.

Deux appuis attendent ensuite le moteur, comme à tout démarrage :
l'estampille, qui dit où en est la base, et sans laquelle il ne sert
pas (D93) ; la forme compilée de la description, prête à l'emploi
(D329).

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
| qui y entre | le compte de secours, avec son mot de passe : voir [le compte de secours](#le-compte-de-secours) |
| où vit ce mot de passe | dans les variables d'environnement : hors de l'annuaire, hors de la configuration versionnée |
| ce qu'il laisse | une trace à l'audit, et au journal |

Une porte de secours n'est jamais une porte dérobée : le mode safe est
toujours tracé.

### Les conditions indispensables, suspendues

Le mode safe désactive toutes les conditions indispensables (D745).
L'envoi d'un mail n'y est plus exigé pour démarrer : c'est le seul mode
qui en soit exempté. Il sert précisément quand le reste manque.

## L'amorçage et le bris de glace

Deux autres secours vivent dans l'application en service. Ils ne
tiennent pas à un mode de lancement, mais au même compte que le mode
safe : le compte de secours.

### Le compte de secours

> **Le compte de secours** est le compte administrateur qui ouvre
> l'application quand aucune autre entrée n'est possible
> ([glossaire](../../glossaire.md)).

Il n'y en a qu'un, et il sert les trois secours : l'amorçage, le bris
de glace et le mode safe (D2163). Son mot de passe vit dans les
variables d'environnement :

- **hors de l'annuaire** : le compte ne dépend d'aucun connecteur
  externe ;
- **hors de la description** : aucun fichier versionné ne le porte, pas
  même sous la forme d'une empreinte ;
- **comme un secret** : il est chiffré dans le fichier des variables,
  et le clair est refusé au démarrage (D2164). Voir
  [le patron unique des secrets](07-secrets.md#le-patron-unique-des-secrets).

Dans l'entrepôt (le cas 5), l'authentification passe par Azure AD. Un
lundi matin, l'annuaire ne répond plus : l'administrateur entre par le
compte de secours. C'est le même compte qui a servi à l'installation,
pour créer le premier administrateur.

### L'amorçage

> **L'amorçage** est le premier accès à une application qui n'a encore
> aucun administrateur ([glossaire](../../glossaire.md)).

Une application neuve n'a pas de compte : il en faut un pour créer les
autres. Le compte de secours tient ce rôle (D33) :

- pour l'amorçage, il n'est utilisable que s'il n'existe aucun compte
  administrateur ;
- en régime normal, il est inerte.

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
| l'amorçage | aucun compte administrateur n'existe | l'application en service |
| le bris de glace | l'authentification ne répond plus | l'application en service |
| le mode safe | l'annuaire, le SSO ou les droits sont hors d'usage | le module d'administration seul, au lancement |

Les trois s'ouvrent par le même compte de secours (D2163).

Le quotidien des comptes, l'invitation, le mot de passe oublié, le
verrouillage, relève de l'administration : il est au chapitre 10.
L'entrée en régime normal est au chapitre 7 :
[l'entrée](../07-securite/03-entree.md).
