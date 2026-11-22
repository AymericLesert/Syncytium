# La disponibilité

> **Un fusible** est une limite que le moteur pose à une exécution,
> pour qu'un traitement qui s'emballe ne prive pas les autres du
> service ([glossaire](../../glossaire.md)).

Une instance sert une entreprise entière depuis un seul serveur. Une
formule trop lente, un appel répété mille fois, un système tiers qui ne
répond plus : chacun peut suffire à l'arrêter. Le moteur s'en protège
de trois façons, que ce fichier réunit. Il borne ce qui s'exécute, par
des fusibles ; il sait quoi faire quand un système tiers fait défaut,
c'est la position de sécurité ; et il tient le code du concepteur dans
des frontières déclarées. Chacune de ces protections est définie dans
le chapitre de son composant : on en trouve ici la vue d'ensemble, et
les renvois. Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [Les fusibles](#les-fusibles)
  - [Cinq limites](#cinq-limites)
  - [Trois portées](#trois-portées)
- [La position de sécurité](#la-position-de-sécurité)
- [Les frontières d'extension](#les-frontières-dextension)
  - [Le même chemin pour tous](#le-même-chemin-pour-tous)
  - [Ce qu'un hook ne contourne pas](#ce-quun-hook-ne-contourne-pas)
  - [Ce qui se règle, et où](#ce-qui-se-règle-et-où)
- [La continuité pendant une migration](#la-continuité-pendant-une-migration)

## Les fusibles

### Cinq limites

| Le fusible | Ce qu'il borne | Où le lire |
|---|---|---|
| le délai d'une fonction complexe | une fonction du langage classée complexe a un délai d'exécution, réglable ; une fonction simple n'en a pas (D104) | [le langage](../03-langage/README.md) |
| le délai d'un calcul | un hook de calcul est pur, et son exécution a un délai maximal | [le mécanisme des hooks](../01-configuration/04-version.md#39-hooks--le-mécanisme-des-hooks) |
| la file des tâches | toutes les tâches passent par une file, qui borne la concurrence ; chacune signale qu'elle vit (D55) | [la file](../06-operations/05-taches.md#la-file) |
| le temps de repos d'une opération | appelée par l'API, une opération ne s'exécute qu'une fois par période, pour les mêmes paramètres ; l'appel de trop est refusé (D58) | [les tâches](../06-operations/05-taches.md) |
| la limite des appels | quinze requêtes par seconde pour l'instance, par défaut, ajustable par compte technique ; au-delà, la réponse 429 dit quand revenir (D105) | [l'API au porteur](../07-securite/03-entree.md#lapi-au-porteur) |

### Trois portées

Ces limites ne se recouvrent pas :

- **à l'intérieur**, les délais et la file protègent le moteur de ce
  qu'il exécute lui-même ;
- **à l'extérieur**, la limite des appels le protège de ceux qui
  l'appellent ;
- **par opération**, le temps de repos protège un traitement qui
  pourrait servir de point d'attaque.

Elles agissent sur le moment. La détection après coup, les pics de
fréquence et les accès refusés qui se répètent, est autre chose : elle
relève de la télémétrie, au chapitre 11 (D43).

## La position de sécurité

> **La position de sécurité** est la conduite du moteur quand un
> système tiers fait défaut : la page de maintenance, et l'alerte à
> l'administrateur ([glossaire](../../glossaire.md)).

Un connecteur peut échouer. Les nouvelles tentatives et les délais se
règlent sur lui, par les propriétés du socle (D625). Quand l'erreur
demeure, le moteur ne continue pas comme si de rien n'était (D626,
D627) :

| Le connecteur | Ce que fait le moteur |
|---|---|
| un connecteur clé | il passe sur la page de maintenance, et alerte l'administrateur |
| un connecteur non critique | il rend le résultat de remplacement que le connecteur fournit, et alerte |

La graduation se déclare au connecteur, par `onerror` : voir
[la position de sécurité](../05-connecteurs/03-socle.md#la-position-de-sécurité).

Deux règles l'encadrent, au démarrage :

- l'application ne démarre que si elle peut alerter : c'est
  [la condition indispensable](06-demarrage.md#la-condition-indispensable) ;
- le mode safe en est seul exempté, et tout refus de démarrer
  s'explique (D745).

## Les frontières d'extension

Un hook est du code que le concepteur ajoute. Le moteur l'exécute dans
des frontières qu'il déclare, et qu'aucun hook ne franchit.

### Le même chemin pour tous

Un composant du socle et un hook externe passent par la même frontière
déclarée : il n'y a aucun raccourci caché (D52). Un hook est déployé,
versionné et validé avec la description.

### Ce qu'un hook ne contourne pas

| La frontière | La règle |
|---|---|
| la lecture et l'écriture | le hook lit le modèle par ses noms logiques, jamais le stockage ; il écrit dans la transaction : les droits, la confidentialité, la validation et la concurrence s'appliquent (D572, D599) |
| le navigateur | un hook d'interface s'y exécute ; il ne reçoit que le `public` et le `protected`, jamais le `private` (D66) |
| les connecteurs | le hook nomme les connecteurs qu'il attend, par `connectors:` ; la déclaration les lie par `uses:`, et l'ingestion le vérifie : il ne touche que ce qu'il a annoncé (D913) |
| l'exécution | elle est unique, sans rejeu automatique (D57) |

Les connecteurs gardent de leur côté leurs propres bornes : leurs
valeurs à l'environnement (D617), l'annuaire en lecture seule (D633),
le webhook entrant gardé (D642).

### Ce qui se règle, et où

Certaines propriétés d'exécution appartiennent au code du hook,
d'autres à l'administration :

| La propriété | Où elle vit | Pourquoi |
|---|---|---|
| `execution`, `deterministic`, `deterministic_duration` | au contrat du hook, jamais dans la configuration (D905) | une opération est déterministe ou non : cela ne change pas sans que son code change (D59, D904) |
| le temps de repos, `operation.cooldown` | aux paramètres d'administration, surchargeable à la déclaration (D904) | il se règle selon la charge |
| la rétention du résultat, `operation.retention` | aux paramètres d'administration (D906) | le résultat échu est purgé |

L'administrateur peut invalider le résultat gardé d'une opération
déterministe (D60).

Le détail est dans le chapitre de chaque famille :
[le mécanisme des hooks](../01-configuration/04-version.md#39-hooks--le-mécanisme-des-hooks),
[les hooks de connecteur](../05-connecteurs/06-hooks.md),
[les hooks d'opération](../06-operations/07-hooks.md).

## La continuité pendant une migration

Une montée de version n'arrête pas l'application (D801). Les lectures
continuent, les écritures sont enregistrées puis rejouées, la file des
tâches est drainée (D24) : voir
[pendant la migration](03-migration.md#pendant-la-migration).

La continuité d'une instance à l'autre, la sauvegarde, la restauration
et l'instance passive, relève de l'exploitation : elle est au
chapitre 10.
