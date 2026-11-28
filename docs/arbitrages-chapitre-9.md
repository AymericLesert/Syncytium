# Le chapitre 9 — les arbitrages

*Cette page accompagne le chapitre 9,
[le fonctionnement du moteur](syncytium/09-moteur/README.md), écrit d'un
trait le 23/11/2026 dans le mode à l'essai (D2128, D2130). Elle ne porte
que les vrais arbitrages : deux décisions qui se contredisent, un manque,
une lecture jamais confirmée. Chacun se pose par un exemple, des réponses
numérotées et une recommandation. Tout le reste est tranché d'après le
registre et marqué mien (D2130). Les points 8 à 12 sont des manques que
la relecture de l'auteur a ouverts (D2162) : ils sont à traiter, et
chacun se posera par un exemple quand l'auteur l'ouvrira. Le point 13
vient de l'arbitrage 5 (D2164). La page se retire quand ses treize
points sont clos.*

## Le sommaire

- [1. Une version déposée en pleine journée](#1-une-version-déposée-en-pleine-journée)
- [2. Une version beta, sans que son modèle soit déployé](#2-une-version-beta-sans-que-son-modèle-soit-déployé)
- [3. Deux enregistrements gardent la même clé à la fin de la lecture](#3-deux-enregistrements-gardent-la-même-clé-à-la-fin-de-la-lecture)
- [4. Le compte de secours](#4-le-compte-de-secours)
- [5. Le modèle de `_migration` et le fichier de détail](#5-le-modèle-de-_migration-et-le-fichier-de-détail)
- [6. Les fusibles et la position de sécurité](#6-les-fusibles-et-la-position-de-sécurité)
- [7. Les lecteurs externes de la base, à la bascule](#7-les-lecteurs-externes-de-la-base-à-la-bascule)
- [8. La clé de la taille du lot](#8-la-clé-de-la-taille-du-lot)
- [9. La déclaration du reverse proxy](#9-la-déclaration-du-reverse-proxy)
- [10. Le dossier interne](#10-le-dossier-interne)
- [11. L'annonce de la bascule aux applications abonnées](#11-lannonce-de-la-bascule-aux-applications-abonnées)
- [12. Un nom stable demandé à une classe qui n'en publie pas](#12-un-nom-stable-demandé-à-une-classe-qui-nen-publie-pas)
- [13. Les fichiers du détail des anomalies](#13-les-fichiers-du-détail-des-anomalies)

## 1. Une version déposée en pleine journée

*Où.* [Quand l'ingestion se déclenche](syncytium/09-moteur/02-ingestion.md#quand-lingestion-se-déclenche)
et [pendant la migration](syncytium/09-moteur/03-migration.md#pendant-la-migration).

*L'exemple.* Dans l'entrepôt, la version 1.0.0.1 est déposée dans
`versions/production/` un mardi à dix heures. Les utilisateurs
travaillent.

*Ce qui s'oppose.* En juin, la migration se préparait pendant une
période de faible affluence, et les utilisateurs connectés passaient
par une mise en attente ou une phase de maintenance (D7, D8). Depuis, la
migration se joue à chaud : les lectures continuent, les écritures sont
enregistrées puis rejouées, et seule la bascule, un changement de
référence, fait attendre, très brièvement (D676, D677, D679, D1974,
D2136). Avant de démarrer, le moteur attend qu'une tâche en cours se
termine, et met les autres en pause (D2136).
**<u>Le chapitre ne dit plus rien
d'une fenêtre de faible affluence.</u>**

*La question.* À dix heures, que fait le moteur ?

1. Il migre tout de suite. L'activité continue, et se rejoue : aucune
   fenêtre n'est attendue.
2. Il contrôle et migre à blanc tout de suite, mais il attend une
   période de faible affluence pour basculer.
3. Il attend la faible affluence pour tout.

*Ma recommandation.* La réponse 1 : le mécanisme de D1974 a été conçu
pour cela, et la bascule ne coûte qu'un changement de référence.

*Tranché (D2163).* Le moteur attend une période de faible affluence,
pour réduire l'attente que cause la migration de version. Il la
reconnaît à l'historique d'exécution des tâches et des appels, ou à
l'absence de connexion pendant un certain laps de temps.

*Précisé (D2164).* La description est contrôlée dès le dépôt ; seule la
migration attend. Trois paramètres définissent la faible affluence : le
laps de temps, le nombre de connexions simultanées au plus, la plage de
dates glissantes. Les deux premiers se calculent sur les `n` derniers
jours, ou se déclarent quand l'historique ne suffit pas.

## 2. Une version beta, sans que son modèle soit déployé

*Où.* [Quand l'ingestion se déclenche](syncytium/09-moteur/02-ingestion.md#quand-lingestion-se-déclenche).

*L'exemple.* Dans l'entrepôt, la production sert la 1.0.0.0. La 1.0.0.1
est en `beta`, et `beta.yml` désigne le staging, qui a sa propre base.
Le chapitre écrit : chaque environnement rejoint la version la plus
élevée de son statut (D801). La base du staging est donc migrée en
1.0.0.1.

*Ce qui s'oppose.* Au point 16 du chapitre 8, une autre image a été
donnée : le modèle stocké reflète la dernière version en production, et
une beta peut être servie sans que son modèle soit déployé, par le
volet ascendant des règles (D1996). **<u>Le chapitre ne décrit pas une
beta servie sur un modèle resté à la version de production.</u>** Cette
lecture était gardée ouverte pour les chapitres 9 et 13 (D2021).

*La question.* Comment la 1.0.0.1 est-elle servie tant qu'elle est en
`beta` ?

1. Toujours sur une base migrée : le staging passe en 1.0.0.1 par le
   mécanisme de la migration de version. Servir une version sans
   déployer son modèle ne concerne que les API, au chapitre 13.
2. Toujours sans migration : la beta lit et écrit dans le modèle de la
   production, par les deux volets des règles d'`exchange/` ; la
   migration ne se joue qu'à la promotion.
3. Les deux existent, selon l'environnement que le statut `beta`
   désigne : un environnement à part est migré ; sur l'environnement de
   la production, la beta est servie par les volets.

*Ma recommandation.* La réponse 3 : elle garde les deux décisions. Le
chapitre recevrait alors un paragraphe sur la beta servie par les
volets.

*Repris par l'auteur (D2164).* Une beta a trois origines possibles :
aucune, pour la première version ; une autre beta ; la dernière version
en production. Elle fonctionne dans une sandbox, et ses données se
réinitialisent à la demande. Sans base d'origine, Syncytium crée le
modèle. Avec une base d'origine, il la copie, puis la migre si c'est
demandé ; sinon la copie suffit, et les règles de migration ascendantes
délivrent les informations dans la dernière version. Deux questions
sont posées avant de reporter : comment une beta nomme son origine, et
ce que devient le statut `sandbox`.

## 3. Deux enregistrements gardent la même clé à la fin de la lecture

*Où.* [Le contrôle d'intégrité](syncytium/09-moteur/04-passage.md#le-contrôle-dintégrité).

*L'exemple.* Celui du chapitre 8 : les factures d'octobre 2026 de
Dupont et de Martin. Supposons qu'à la fin de la lecture toutes deux
portent encore le numéro F-0042. C'est une anomalie (D1955) ; ce qu'elle
fait tomber devait se dire au chapitre 9.

*Ce qui manque.* **<u>Le chapitre écrit que les deux factures tombent,
et que l'anomalie les nomme toutes les deux.</u>** Rien au registre ne
le dit.

*La question.* Que deviennent les deux factures ?

1. Les deux tombent : aucune n'est écrite, et la source est à corriger.
2. La seconde tombe, la première entre, comme pour deux enregistrements
   de même clé principale (D1046).
3. Les deux entrent, sans le numéro : seule la clé en double est
   refusée.

*Ma recommandation.* La réponse 1 : rien ne dit laquelle des deux a
raison. En mode `absolute`, le passage échoue dans les trois cas.

*Tranché (D2164).* La réponse 1 : les deux tombent.

## 4. Le compte de secours

*Où.* [Le mode safe](syncytium/09-moteur/06-demarrage.md#le-mode-safe)
et [l'amorçage et le bris de glace](syncytium/09-moteur/06-demarrage.md#lamorçage-et-le-bris-de-glace).

*L'exemple.* L'entrepôt authentifie par Azure AD. Un lundi matin,
l'annuaire ne répond plus : il faut entrer par le secours.

*Ce qui s'oppose.* Pour l'amorçage et le bris de glace, la description
porte un compte administrateur, et l'empreinte de son mot de passe,
dans un fichier versionné (D33, D81). Pour le mode safe, le compte
administrateur principal a un mot de passe fixé à l'installation, hors
de la configuration versionnée (D718). **<u>Le chapitre décrit les deux
tels quels, sans dire s'il s'agit du même compte.</u>**

*La question.* Combien de comptes de secours, et où vit le mot de
passe ?

1. Un seul compte. Son mot de passe est fixé à l'installation, et
   chiffré avec les secrets ; il sert l'amorçage, le bris de glace et
   le mode safe. La description ne porte plus d'empreinte.
2. Deux comptes : celui de la description, pour l'amorçage et le bris
   de glace ; celui de l'installation, pour le mode safe.
3. Un seul compte, dont l'empreinte reste dans la description.

*Ma recommandation.* La réponse 1 : depuis, les secrets sont
obligatoirement chiffrés et jamais versionnés (D707), et le dépôt de la
description est celui du client (D336).

*Tranché (D2163).* Un seul compte de secours ; son mot de passe vit dans
les variables d'environnement. Il suit le patron des secrets (D2164).

## 5. Le modèle de `_migration` et le fichier de détail

*Où.* [migration.md](migration.md), « Le modèle ». C'est la question
gardée pour le chapitre 9 (D1894).

*L'exemple.* Le modèle du module porte encore trois mentions d'un
fichier de détail par passage et d'une base miroir déclarée dans la
migration : le champ `fichier` de l'entité `passage`, l'en-tête de
l'entité `anomalie`, le champ `buffer` de l'entité `migration`.

*Ce qui s'oppose.* Le détail d'un passage vit désormais dans le module,
partitionné par une date (D1889), et la base miroir se déclare dans
l'environnement (D1891). **<u>Ces trois mentions décrivent ce qui n'est
plus.</u>** Le reste du modèle attend le chapitre 10 (D2010).

*La question.* Que faire de ces trois mentions ?

1. Elles sortent maintenant : `fichier` et `buffer` sont retirés,
   l'entité `anomalie` est dite en base, partitionnée par sa date.
2. Elles restent jusqu'au chapitre 10, où le modèle entier se relit.

*Ma recommandation.* La réponse 1 : le fond est décidé ; les noms du
modèle restent en proposition jusqu'au chapitre 10.

*Tranché (D2164), par une autre voie.* La base miroir est un storage. Le
détail des anomalies, exhaustif, vit dans des fichiers du dossier
interne, et la purge les supprime. Des statistiques et des indicateurs,
en base, matérialisent l'historique. Le chapitre 9 le décrit :
[le détail et sa rétention](syncytium/09-moteur/05-suivi.md#le-détail-et-sa-rétention).

## 6. Les fusibles et la position de sécurité

*Où.* [La disponibilité](syncytium/09-moteur/08-disponibilite.md).

*L'exemple.* La limite de quinze requêtes par seconde (D105), et la
page de maintenance quand la base ne répond plus (D626).

*Ce qui n'a pas été confirmé.* À l'ouverture du chapitre du moteur, les
fusibles et la position de sécurité lui étaient envoyés en proposition
(D1784, D1785). **<u>Le chapitre leur donne un fichier, qui réunit les
protections et renvoie aux chapitres 3, 5, 6 et 7 où elles sont
définies.</u>**

*La question.* Où se lisent-ils ?

1. Au chapitre 9, comme écrit : c'est ce que le moteur fait seul. Le
   chapitre 10 dira ce que l'administrateur règle et surveille.
2. Au chapitre 10 : `08-disponibilite.md` y part, et le chapitre 9
   s'arrête aux secrets.

*Ma recommandation.* La réponse 1.

*Clos (D2164).* La réponse 1 : `08-disponibilite.md` est au chapitre 9,
où l'auteur l'a validé (D2161).

## 7. Les lecteurs externes de la base, à la bascule

*Où.* [La bascule](syncytium/09-moteur/03-migration.md#la-bascule).

*L'exemple.* Dans l'entrepôt, la base est le schéma `entrepot` d'un
PostgreSQL. Un rapport Power BI y lit les tiers, sans passer par
Syncytium (D1260). La version 1.0.0.1 bascule un mardi à dix heures :
Syncytium pointe vers une nouvelle instance de la base (D2136, D2138).

*Le manque.* Les applications et les outils de BI qui lisent la base
doivent être informés du changement de pointeur (D2138).
**<u>Le chapitre le dit, sans donner de mécanisme.</u>**

*La question.* Le mardi à dix heures une, que lit le rapport ?

1. **Un nom stable.** Le storage publie l'instance en service sous un
   nom qui ne change pas, `entrepot`. Derrière ce nom, des vues, ou des
   synonymes selon le moteur de base de données, désignent l'instance de
   la version. La bascule les fait suivre le pointeur, dans le même
   geste ; la restauration aussi. Le rapport lit la 1.0.0.1 sans toucher
   à sa connexion. Le contrat du storage y gagne une méthode, que chaque
   classe doit tenir.
2. **Une information.** La bascule est un événement, que Syncytium
   annonce : à l'administrateur, dans le mail des faits marquants ; aux
   applications abonnées, par un webhook sortant qui porte le nom de la
   nouvelle instance. Chacun change sa connexion. Un rapport Power BI ne
   s'abonne à rien : quelqu'un le reconfigure, à chaque bascule.
3. **Les deux.** Le nom stable porte le changement de pointeur.
   L'information porte ce que le nom stable ne règle pas : un champ
   renommé ou retiré casse le rapport, où qu'il se connecte. Elle joint
   donc les écarts entre les deux versions, que la documentation génère
   déjà.

*Ma recommandation.* La réponse 3. Le nom stable seul laisse le rapport
se casser en silence sur un champ renommé ; l'information seule demande
un geste à chaque bascule. Une limite demeure : seule l'API garde la
forme d'une version antérieure (D11–D13). Un lecteur qui ne veut subir
aucun changement lit par elle.

*Tranché (D2139).* La réponse 3, les deux. Le nom stable est une
facette de la description du modèle, et une option du connecteur.

## 8. La clé de la taille du lot

*Où.* [Une taille par entité](syncytium/09-moteur/README.md#une-taille-par-entité).

*Le manque.* La taille du lot se déclare par entité, de la source ou du
modèle (D2160). **<u>Le chapitre ne nomme pas la clé, et ne dit pas la
taille d'une entité qui ne déclare rien.</u>**

## 9. La déclaration du reverse proxy

*Où.* [Ce que Syncytium sert](syncytium/09-moteur/07-secrets.md#ce-que-syncytium-sert).

*Le manque.* Un reverse proxy assure le HTTPS partout, et celui de
Syncytium est une fonctionnalité optionnelle (D2155). L'écriture de sa
déclaration est en proposition depuis D919. **<u>Le chapitre ne dit pas
comment un environnement déclare son reverse proxy, ni comment il
demande celui de Syncytium.</u>**

## 10. Le dossier interne

*Où.* [Le dossier interne](syncytium/09-moteur/02-ingestion.md#le-dossier-interne).

*Le manque.* Tout ce que le moteur génère pour une version vit dans un
dossier interne à l'application (D2154). **<u>Le chapitre ne dit ni son
nom, ni son emplacement, ni si un environnement peut le placer
ailleurs.</u>**

## 11. L'annonce de la bascule aux applications abonnées

*Où.* [Les lecteurs externes de la base](syncytium/09-moteur/03-migration.md#les-lecteurs-externes-de-la-base).

*Le manque.* À la bascule, Syncytium annonce le changement : à
l'administrateur par le mail des faits marquants, aux applications
abonnées par un webhook sortant (D2139). **<u>Le chapitre ne dit pas
comment une application s'abonne à cette annonce.</u>**

## 12. Un nom stable demandé à une classe qui n'en publie pas

*Où.* [Le nom stable](syncytium/05-connecteurs/05-storage.md#le-nom-stable).

*Le manque.* Le nom stable est une option du connecteur, demandée par
`alias:` (D2139, D2140). **<u>Rien ne dit ce que fait l'ingestion quand
`alias:` est écrit sur une classe de storage qui ne sait pas publier de
nom stable.</u>**

## 13. Les fichiers du détail des anomalies

*Où.* [Le détail et sa rétention](syncytium/09-moteur/05-suivi.md#le-détail-et-sa-rétention).

*Le manque.* Le détail des anomalies vit dans des fichiers du dossier
interne (D2164). Auparavant, un fichier par passage était chiffré
(D1067), puis le détail, passé en base, suivait la protection de la base
(D1893). **<u>Le chapitre ne dit ni le format de ces fichiers, ni leur
protection, ni s'ils suivent la copie d'un environnement (D1894).</u>**
