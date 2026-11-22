# Le chapitre 9 — les arbitrages

*Cette page accompagne le chapitre 9,
[le fonctionnement du moteur](syncytium/09-moteur/README.md), écrit d'un
trait le 23/11/2026 dans le mode à l'essai (D2128, D2130). Elle ne porte
que les vrais arbitrages : deux décisions qui se contredisent, un manque,
une lecture jamais confirmée. Chacun se pose par un exemple, des réponses
numérotées et une recommandation. Tout le reste est tranché d'après le
registre et marqué mien (D2130). La page se retire quand ses six points
sont clos.*

## Le sommaire

- [1. Une version déposée en pleine journée](#1-une-version-déposée-en-pleine-journée)
- [2. Une version beta, sans que son modèle soit déployé](#2-une-version-beta-sans-que-son-modèle-soit-déployé)
- [3. Deux enregistrements gardent la même clé à la fin de la lecture](#3-deux-enregistrements-gardent-la-même-clé-à-la-fin-de-la-lecture)
- [4. Le compte de secours](#4-le-compte-de-secours)
- [5. Le modèle de `_migration` et le fichier de détail](#5-le-modèle-de-_migration-et-le-fichier-de-détail)
- [6. Les fusibles et la position de sécurité](#6-les-fusibles-et-la-position-de-sécurité)

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
enregistrées puis rejouées, et seul le renommage fait attendre, très
brièvement (D676, D677, D679, D1974). **<u>Le chapitre ne dit plus rien
d'une fenêtre de faible affluence.</u>**

*La question.* À dix heures, que fait le moteur ?

1. Il migre tout de suite. L'activité continue, et se rejoue : aucune
   fenêtre n'est attendue.
2. Il contrôle et migre à blanc tout de suite, mais il attend une
   période de faible affluence pour basculer.
3. Il attend la faible affluence pour tout.

*Ma recommandation.* La réponse 1 : le mécanisme de D1974 a été conçu
pour cela, et la bascule ne coûte qu'un renommage.

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
