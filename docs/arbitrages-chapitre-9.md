# Le chapitre 9 — les arbitrages

*Cette page accompagne le chapitre 9,
[le fonctionnement du moteur](syncytium/09-moteur/README.md), écrit d'un
trait le 23/11/2026 dans le mode à l'essai (D2128, D2130). Elle ne porte
que les vrais arbitrages : deux décisions qui se contredisent, un manque,
une lecture jamais confirmée. Chacun se pose par un exemple, des réponses
numérotées et une recommandation. Tout le reste est tranché d'après le
registre et marqué mien (D2130). Les points 8 à 12 sont des manques que
la relecture de l'auteur a ouverts (D2162) ; ils sont présentés depuis
le 28/11/2026 (D2170). Le point 13
vient de l'arbitrage 5 (D2164), le point 14 de l'arbitrage 2 (D2168),
le point 15 d'une question de l'auteur (D2176). La page se retire quand
ses quinze points sont clos.*

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
- [14. La clé qui demande la migration de la copie](#14-la-clé-qui-demande-la-migration-de-la-copie)
- [15. `history:`, sous `quiet:`](#15-history-sous-quiet)

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

*Validé (D2169).* Leurs clés : le bloc `quiet:` du fichier de
l'environnement, avec `delay:`, `connections:` et `history:`.

*Repris (D2177, D2178).* Le bloc s'appelle `low_traffic:`, et la plage
`window:`. L'analyse statistique porte sur des créneaux de vingt-quatre
heures : le créneau horaire le moins fréquenté pendant `delay:` est
choisi pour déclencher la migration de version.

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

*Précisé (D2165).* Le statut `sandbox` s'efface : la sandbox redevient
l'environnement fermé où une beta fonctionne (D907).

*Précisé (D2166).* Une beta nomme son origine par `from:` et le seul
numéro de la version : une même version ne peut pas être dans deux
environnements, son numéro dit donc si elle est en production ou en
beta.

*Confirmé (D2167).* Il n'y a pas de dossier `versions/sandbox/` : c'est
`versions/beta/` qui utilise la sandbox.

*Précisé (D2177).* Sans `from:`, l'origine d'une beta est la dernière
version en production.

*Tranché (D2168).* Le staging est la sandbox des betas. Syncytium copie
d'office la base de l'origine, au dépôt. La migration de la copie se
demande par une clé de `version.yml`. Le chapitre le décrit :
[la sandbox](syncytium/09-moteur/02-ingestion.md#la-sandbox).

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

*L'exemple.* Dans l'entrepôt, la table `MVTSTO` de PMI a 34 colonnes et
des millions de lignes ; la table `ARTICLE` en a 181. Le concepteur veut
de grands lots pour la première, de plus modestes pour la seconde.

*Le manque.* La taille du lot se déclare par entité, de la source ou du
modèle (D2160). **<u>Le chapitre ne nomme pas la clé, et ne dit pas la
taille d'une entité qui ne déclare rien.</u>**

*La question.* Je propose la clé `batch:`, à l'entête de l'entité, à
côté de `partition:` : `batch: 1`, `batch: -1`, `batch: 20000`. Et sans
cette clé, quelle taille ?

1. La classe du storage décide : chacune connaît son mécanisme de masse
   (D688). C'est déjà la règle de `partition:` sans déclaration.
2. Tout en une fois : `-1`.
3. Une valeur du socle, réglable dans les paramètres d'administration.

*Ma recommandation.* `batch:`, et la réponse 1 : la bonne taille tient
autant à la base qu'à l'entité, et la classe est la seule à connaître la
base.

*En cours (D2171).* L'auteur avance un autre nom, `sizeLot:`, et
m'interroge. Mon avis : `lot_size:`, dans la forme des autres clés,
comme `max_size:`. La taille d'une entité qui ne déclare rien reste à
dire.

*Le nom, tranché (D2172).* `lot_size:`. La taille d'une entité qui ne
déclare rien reste à dire.

*Tranché (D2173).* La réponse 2 : sans `lot_size:`, tout en une seule
fois.

## 9. La déclaration du reverse proxy

*Où.* [Ce que Syncytium sert](syncytium/09-moteur/07-secrets.md#ce-que-syncytium-sert).

*L'exemple.* L'entrepôt tourne sur des serveurs : l'équipe
d'administration assure le reverse proxy. La banque tourne sur un poste
informatique domestique : Syncytium installe le sien et le démarre.
Leurs fichiers d'environnement portent tous deux `listen:`, l'adresse et
le port servis.

*Le manque.* Un reverse proxy assure le HTTPS partout, et celui de
Syncytium est une fonctionnalité optionnelle (D2155). L'écriture de sa
déclaration est en proposition depuis D919. **<u>Le chapitre ne dit pas
comment un environnement déclare son reverse proxy, ni comment il
demande celui de Syncytium.</u>**

*La question.* Je propose une clé `proxy:`, sous `listen:`. Qui
l'écrit ?

1. Les deux environnements, toujours : `proxy: external` dans
   l'entrepôt, `proxy: embedded` dans la banque. Sans la clé, une erreur
   d'ingestion.
2. La banque seule : `proxy: embedded` demande celui de Syncytium. Sans
   la clé, un autre l'assure.
3. L'entrepôt seul : `proxy: external` dit qu'un autre l'assure. Sans la
   clé, Syncytium installe le sien.

*Ma recommandation.* La réponse 2 : une fonctionnalité optionnelle se
demande. Sur un poste informatique domestique, l'initialisation écrit la
clé (D729). Si la clé manque et qu'aucun reverse proxy n'est là, le
moteur refuse de démarrer, et dit pourquoi (D919).

*Tranché (D2171).* `proxy: embedded` est la valeur par défaut : sans la
clé, Syncytium installe le sien. L'autre valeur, `external`, est en
proposition.

*Validé (D2174).* `proxy: external | embedded`.

## 10. Le dossier interne

*Où.* [Le dossier interne](syncytium/09-moteur/02-ingestion.md#le-dossier-interne).

*L'exemple.* Dans l'entrepôt, en production, le dossier interne reçoit
la forme compilée de chaque version, et quatre-vingt-dix jours de
fichiers de détail des anomalies, sur des tables de plusieurs millions
de lignes. Il peut devenir volumineux.

*Le manque.* Tout ce que le moteur génère vit dans un dossier interne à
l'application, ni versionné, ni poussé sur un git (D2154, D2164).
**<u>Le chapitre ne dit ni son nom, ni son emplacement, ni si un
environnement peut le placer ailleurs.</u>**

*La question.* Où est le dossier interne de la production ?

1. À un emplacement fixe, à côté du fichier des variables de
   l'environnement, qui n'est pas versionné non plus. Rien ne se
   déclare.
2. Au même emplacement par défaut, mais une clé de l'environnement peut
   le placer ailleurs, par une variable du déploiement : un autre disque,
   un volume sauvegardé.

*Ma recommandation.* La réponse 2, avec la clé `internal:` : le volume
du détail des anomalies demande de pouvoir choisir le disque, et un
chemin tient au déploiement, comme `listen:`.

*Tranché (D2171).* Un environnement dispose d'une clé pour décrire le
dossier interne, comme pour décrire le dossier des journaux. Son nom
reste à écrire ; `internal:` est en proposition.

*Nommé (D2174).* `volume:`, le dossier des fichiers qui appartiennent à
l'application, par la variable `SYNCYTIUM_VOLUME_DIRECTORY` ; `volume/`
par défaut, à la racine du projet, ignoré du git. À côté, `data:`, le
dossier des fichiers téléchargés et dédiés à l'application.

## 11. L'annonce de la bascule aux applications abonnées

*Où.* [Les lecteurs externes de la base](syncytium/09-moteur/03-migration.md#les-lecteurs-externes-de-la-base).

*L'exemple.* Dans l'entrepôt, un rapport Power BI et une application
tierce lisent la base sans passer par Syncytium (D1260). La 1.0.0.1
bascule : l'application tierce doit en être prévenue, avec les écarts
entre les deux versions.

*Le manque.* À la bascule, Syncytium annonce le changement : à
l'administrateur par le mail des faits marquants, aux applications
abonnées par un webhook sortant (D2139). Or le connecteur `webhook` ne
sort pas : il ne déclare que des entrées (D640). **<u>Le chapitre ne dit
pas comment une application s'abonne à cette annonce.</u>**

*La question.* Comment l'application tierce s'abonne-t-elle ?

1. Par le fichier de l'environnement : l'administrateur y liste les
   adresses à prévenir, chacune avec son secret. C'est la manière des
   origines autorisées, `cors:` (D918).
2. Par l'API : l'application s'abonne elle-même, avec son compte
   technique ; la liste vit en base.
3. Par un canal de notification (D108, D109) : un canal de classe
   webhook, déclaré dans la description, dont les applications sont les
   destinataires.

*Ma recommandation.* La réponse 1 : savoir qui lit la base est un fait
du déploiement, et l'administrateur doit le voir d'un coup d'œil.

*Tranché (D2171).* La réponse 2, précisée : les applications s'abonnent
par l'API, et se désabonnent par l'API ; l'abonnement s'exprime pour un
type d'événement.

## 12. Un nom stable demandé à une classe qui n'en publie pas

*Où.* [Le nom stable](syncytium/05-connecteurs/05-storage.md#le-nom-stable).

*L'exemple.* Dans l'entrepôt, la base miroir `temporaire` est de classe
`memory`. Supposons que le concepteur y écrive `alias: entrepot_bi` : une
base en mémoire ne peut pas publier un nom qu'un rapport lirait.

*Le manque.* Le nom stable est une option du connecteur, demandée par
`alias:` (D2139, D2140). **<u>Rien ne dit ce que fait l'ingestion quand
`alias:` est écrit sur une classe de storage qui ne sait pas publier de
nom stable.</u>**

*La question.* Que fait l'ingestion ?

1. Une erreur, qui nomme le connecteur et sa classe : la version n'est
   pas servie.
2. Un avertissement au journal : l'application démarre, et aucun nom
   stable n'est publié.
3. Le cas n'existe pas : le contrat impose à toute classe de savoir
   publier un nom stable.

*Ma recommandation.* La réponse 1 : une clé ignorée en silence laisserait
le rapport se casser sans que personne le sache. Rien ne s'ignore, rien
ne se devine (D928).

*Tranché (D2171).* La réponse 1 : une erreur d'ingestion.

## 13. Les fichiers du détail des anomalies

*Où.* [Le détail et sa rétention](syncytium/09-moteur/05-suivi.md#le-détail-et-sa-rétention).

*L'exemple.* Dans l'entrepôt, le passage de la nuit refuse des lignes de
commandes : le détail de ces anomalies porte des valeurs réelles, dont
des données personnelles (D1065). Il vit dans des fichiers du dossier
interne (D2164).

*Le manque.* Quand le détail était un fichier, trois décisions le
réglaient : un fichier SQLite par passage, daté par son nom (D1066) ; ce
fichier chiffré, et rechiffré par la rotation des clés (D1067) ; une
option de la copie d'un environnement pour l'emporter (D1080). Elles ont
été retirées quand le détail est passé en base (D1893). **<u>Le chapitre
ne dit ni le format de ces fichiers, ni leur protection, ni s'ils
suivent la copie d'un environnement.</u>**

*La question.* Le détail étant revenu dans des fichiers, ces trois
décisions reviennent-elles ?

1. Oui, toutes les trois : un fichier SQLite par passage, chiffré, que
   la copie d'un environnement emporte sur option.
2. Le format et le chiffrement reviennent ; à la copie d'un
   environnement, le détail suit toujours (D1894).
3. Autre chose : un autre format, ou des fichiers non chiffrés, protégés
   par les seuls droits du dossier.

*Ma recommandation.* La réponse 1 : les surfaces du module et les
rapports doivent interroger le détail, ce qu'un fichier SQLite permet ;
des valeurs réelles ne restent pas en clair ; et un détail volumineux ne
se copie que si on le demande.

*Tranché (D2171), par une autre voie.* Le détail vit dans un fichier au
format d'un journal, chiffré après la migration et rechiffré à la
rotation des clés. À la consultation par le module d'administration, il
est déchiffré avant l'affichage. La copie d'un environnement n'est pas
dite.

## 14. La clé qui demande la migration de la copie

*Où.* [La migration de la copie](syncytium/09-moteur/02-ingestion.md#la-migration-de-la-copie-au-choix-du-concepteur).

*L'exemple.* Dans l'entrepôt, la 1.0.0.1 est déposée dans
`versions/beta/`, avec `from: v1.0.0.0`. Le concepteur veut, ou non, que
la copie de la base soit migrée en 1.0.0.1.

*Le manque.* La copie de l'origine est migrée si une clé de
`version.yml`, à côté de `from:`, le demande (D2168). **<u>Le chapitre
ne nomme pas cette clé, et ne dit pas ce qui vaut quand elle est
absente.</u>**

*La question.* Je propose la clé `migrate:`, un booléen. Et sans cette
clé ?

1. La copie seule : la migration est ce qui se demande, par
   `migrate: true`. Les règles ascendantes délivrent les données.
2. La migration : c'est la copie seule qui se demande, par
   `migrate: false`.

*Ma recommandation.* `migrate:`, et la réponse 1 : ce sont vos mots, la
migration se joue « si demandée ».

*Tranché (D2171).* `migrate: true` est la valeur par défaut : la copie
est migrée. `migrate: false` demande la copie seule.

## 15. `history:`, sous `quiet:`

*Où.* [Le moment](syncytium/09-moteur/03-migration.md#le-moment--une-période-de-faible-affluence).

*L'exemple.* L'entrepôt ne déclare pas le bloc `quiet:`. Une version
est déposée : le moteur calcule le laps de temps et le plafond de
connexions d'après l'historique de l'application. Par ailleurs,
trente-six entités des cas écrivent déjà `history: true` : c'est
l'historisation, la mémoire des modifications d'une entité (D168).

*Ce qui pose question.* Deux choses. Le mot `history:` est déjà pris :
je l'ai proposé sans relire le registre (D2164), et il a été validé
(D2169). **<u>Et le chapitre ne dit pas sur combien de jours le moteur
regarde quand la clé est absente.</u>**

*La question A, le nom.*

1. Garder `history:` : c'est le même concept, la profondeur d'une
   mémoire. `history: temporal[365]` garde un an de modifications ;
   `history: 30d` regarde trente jours d'activité.
2. Renommer la clé : `window:`, la plage glissante.

*La question B, sans la clé.*

1. Trente jours.
2. Sept jours.
3. Une autre durée.

*Ma recommandation.* A, la réponse 2 : les deux clés n'ont pas la même
écriture, `temporal[365]` ici, `30d` là, et « plage de dates
glissantes » se dit `window`. B, la réponse 1 : quatre semaines lissent
une semaine inhabituelle, et suivent encore un changement d'usage.

*La question A, tranchée (D2177).* `window:`. La question B reste
posée : l'auteur répond « quiet ? », que je n'ai pas su lire.

*« quiet ? », éclairé (D2178).* L'auteur doutait du nom du bloc : il
s'appelle `low_traffic:`. La question B, la plage analysée quand
`window:` est absente, reste posée.

*La question B, tranchée (D2179).* Une semaine : `window:` vaut `1w`
par défaut.
