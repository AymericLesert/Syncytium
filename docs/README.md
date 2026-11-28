# La documentation de Syncytium — le plan

*Cette page est le plan de la documentation du dépôt : son arborescence, et
l'état de chaque document. Elle se lit dans GitHub et s'embarque avec le
Syncytium déployé (D1515). Elle est tenue à jour à chaque chapitre déplacé
(le rang 10 du chantier de la documentation, D1520–D1521). En proposition,
écrite le 28/10/2026 avec l'arborescence encore vide.*

## Comment lire

- **Vous découvrez Syncytium** : commencez par la [présentation](presentation/),
  qui déplie une application complète à partir de vingt-neuf lignes de
  configuration, puis suivez son menu.
- **Vous écrivez une configuration** : [Syncytium](syncytium/) décrit ce qui
  est, chapitre par chapitre, avec l'organisation recommandée et des exemples.
- **Vous cherchez un cas complet** : les [cas d'usage](cas-d-usage/) donnent
  cinq configurations entières, le besoin qui les a produites et les documents
  qui en sortent.
- **Vous voulez comprendre pourquoi** : l'[histoire](histoire/) porte le
  cheminement, les décisions une à une et le journal des échanges.

## L'arborescence

Un dossier par chapitre, un fichier ou un sous-dossier par sous-chapitre, un
`README.md` dans chaque dossier ; aucun document au-delà d'un millier de
lignes ; les renvois sont relatifs (D1520).

```text
docs/
├── README.md              ce plan
├── presentation/          partie 0 : le tiny déplié clé par clé, le menu de la documentation
├── histoire/              partie 2 : ce qui a été
│   ├── README.md          le résumé du cheminement, juin → octobre 2026
│   ├── plan.md            le plan de la conception : les domaines, les rangs, les étapes, les chapitres (D1660)
│   ├── collaboration.md   la collaboration : les échanges, l'organisation, l'enrichissement mutuel, les posts (D1664)
│   ├── genese.md          la genèse : le SGBD de 1994 et son dictionnaire texte, la collection d'étiquettes de 1995, les écritures professionnelles, le classeur de 2016 (D1781, D1782)
│   ├── genese/            les pièces de la genèse : les deux PDF de 1994, le dictionnaire et le programme de création de 1995
│   ├── decisions/         une décision par fichier, un sous-dossier par famille, l'index généré
│   ├── questions.md       les questions ouvertes et closes
│   ├── journal/           le journal des échanges, un fichier par mois
│   ├── conception/        le narratif de la conception, découpé
│   └── chantier-documentation.md   le chantier de la documentation générée, ses dix rangs
├── syncytium/             partie 3 : ce qui est
│   ├── README.md          Syncytium, les dix piliers, l'organisation recommandée de la configuration
│   ├── glossaire.md
│   ├── 01-configuration/  la syntaxe, les mécanismes, l'arbre, les défauts du socle
│   ├── 02-modele/         l'entité, les champs, la vie d'un enregistrement, les types, les liens
│   ├── 03-langage/        le langage d'expression : la grammaire, le nul, les fonctions, les agrégats
│   ├── 04-composants/     le catalogue des composants graphiques
│   ├── 05-connecteurs/    les connecteurs et leurs contrats
│   ├── 06-operations/     les opérations du socle, leur degré, leur relecture
│   ├── 07-securite/       la sécurité et les droits
│   ├── 08-migration/      la migration : la reprise, la migration de version, la rétro-conception
│   ├── 09-moteur/         le fonctionnement du moteur : le démarrage d'une version, l'ingestion, ce qui tourne
│   ├── 10-administration/ l'administration, l'exploitation, la télémétrie
│   ├── 12-documentation/  la documentation que Syncytium génère
│   └── outils.md          les outils du dépôt
├── cas-d-usage/           partie 4 : les cinq cas, chacun avec sa configuration et ses documents
└── etudes/                partie 5 : les études comparatives, datées
```

La configuration des cas vit dans [`../examples/`](../examples/), les outils
dans [`../tools/`](../tools/).

La liste des décisions d'un chapitre, que son README écrit, se recalcule à chaque
relecture de sa famille :

```bash
python tools/decisions.py docs/conception.md --numeros <famille>
```

## L'avancement des quinze chapitres

Un chapitre par famille de décisions (D1526) ; le chapitre 9, le fonctionnement du moteur, ajouté le 07/11/2026 (D1784–D1785), a fait glisser les suivants d'un rang. Avant d'être réorganisé, un
chapitre est *lu* : la classification de sa famille relue, les décisions
amendées ou remplacées confrontées à son texte, ses marques « en
proposition » soldées (D1521) ; puis il est *réorganisé* : déplacé, découpé,
ses renvois réécrits ; puis il est *réécrit*, didactique, illustré, en
phrases courtes (D1542–D1543), ce que la colonne de la réorganisation
note à sa suite. Les deux colonnes disent « — », « en cours » ou
« fait le JJ/MM/AAAA ».

| # | Le chapitre | Les documents d'aujourd'hui | La destination | La lecture | La réorganisation |
|---|---|---|---|---|---|
| 1 | **La configuration et son écriture** | `configuration.md` | `syncytium/01-configuration/` | fait le 29/10/2026 (13 points, D1528–D1540) | fait le 29/10/2026 (six fichiers, D1541) ; réécrite le 29/10/2026 (D1542–D1544), illustrée le 08/11/2026 (D1854, validée D1862) ; la dépréciation d'un élément ajoutée le 10/11/2026 (D1874, D1875), à relire |
| 2 | **Le modèle et les types** | `entity.md`, `types.md` | `syncytium/02-modele/` | fait le 30/10/2026 (25 points, D1549–D1560) | fait le 30/10/2026 (huit fichiers, D1561) ; réécrite le 30/10/2026 (D1562, les définitions), illustrée le 08/11/2026 (D1855, D1859, validée D1862) ; la dépréciation d'un élément ajoutée le 10/11/2026 (D1874, D1875), à relire |
| 3 | **Le langage d'expression** | le registre ; `syncytium/02-modele/types.md` (la signature des types) ; `syncytium/01-configuration/mecanismes.md` §2.7 | `syncytium/03-langage/` | fait le 31/10/2026 (13 points, D1565–D1584) | fait le 31/10/2026 (quatre fichiers, D1586) ; réécrite le 31/10/2026 |
| 4 | **Les surfaces et les composants** | `composants.md` | `syncytium/04-composants/` | fait le 01/11/2026 (21 points, D1593–D1645) | fait le 01/11/2026 (sept fichiers, D1646) ; réécrite le 01/11/2026, relue (D1647–D1656), illustrée le 08/11/2026 (D1856, D1860, validée D1862) ; la dépréciation d'un élément ajoutée le 10/11/2026 (D1874, D1875), à relire |
| 5 | **Les connecteurs** | `connectors.md` | `syncytium/05-connecteurs/` | faite le 02/11/2026 (18 points, D1707–D1729) | faite le 02/11/2026 (sept fichiers, D1730) ; réécrite le 02/11/2026 (D1731–D1737), relue le 05/11/2026 (D1780), illustrée le 08/11/2026 (D1857, validée D1862) ; la dépréciation d'une classe de connecteur ajoutée le 10/11/2026 (D1876), à relire |
| 6 | **Les opérations** | `hooks.md` §3, le registre — les tâches, D53, D54, D87, D88, D106 (D1689) | `syncytium/06-operations/` | faite le 05/11/2026 (16 points, D1739–D1761) | faite le 05/11/2026 (huit fichiers, D1762) ; réécrite le 05/11/2026 (D1763–D1769), relue le 05/11/2026 (D1770–D1779), illustrée le 08/11/2026 (D1858, D1861, validée D1862) ; la dépréciation d'un élément ajoutée le 10/11/2026 (D1874, D1875), à relire |
| 7 | **Les droits et la sécurité** | `rights.md`, `security.md` | `syncytium/07-securite/` | faite le 07/11/2026 (14 points, D1783–D1823) | faite le 07/11/2026 (dix fichiers, D1824) ; réécrite le 07/11/2026 (D1825–D1833), relue le 08/11/2026 (D1834–D1853) |
| 8 | **La migration** | `mapping.md`, `migration.md` | `syncytium/08-migration/` | faite le 19/11/2026 (19 points, D1863–D2023) | faite le 20/11/2026 (dix fichiers, D2033), validée (D2035) ; réécrite le 20/11/2026 (D2036–D2056), relue par l'auteur du 21 au 22/11/2026, fichier par fichier (D2057–D2103) ; la rétro-conception lue dans les grands principes, sa section redécoupée et relue (D2107–D2126) |
| 9 | **Le fonctionnement du moteur** | `administration.md`, « Reçu du chapitre 7 » et « Reçu du chapitre 8 », vidés de ce qui relevait du moteur ; `migration.md`, l'exécution d'un passage ; le registre — le démarrage d'une version, l'exécution d'un passage, le mécanisme de la migration de version (D1784, D1824, D1879–D1881, D1920, D1928, D1952, D1954, D1955, D1966, D1974, D1977–D1979, D1993) | `syncytium/09-moteur/` | en cours depuis le 23/11/2026 : le mode à l'essai, le texte d'abord (D2128) — la famille constituée et la vision globale (D2129), six arbitrages présentés, un septième le 28/11/2026 (D2138), clos (D2139) ; l'auteur relit fichier par fichier : le README et `02-ingestion.md` relus le 28/11/2026, quatre remarques (D2134) ; cinq remarques sur `03-migration.md` le 28/11/2026 (D2136–D2141), le fichier validé le même jour (D2142), ses termes unifiés (D2145) ; deux remarques et un complément sur `04-passage.md` (D2142–D2144, D2146–D2149), le fichier validé le même jour (D2151) | faite le 23/11/2026 (huit fichiers, D2130), écrite d'un trait dans la forme réécrite ; à relire par l'auteur |
| 10 | **L'administration et l'exploitation** | `administration.md`, le registre — la supervision des tâches, D56, D61, D62 (D1689) ; `migration.md` — le détail du module `_migration` et sa facette documentation, quand le moteur et son fonctionnement l'auront fait apparaître (D2010) ; D181–D184, le stock de reprise à statuts, à trancher face au refusé non enregistré et à l'anomalie datée, D1032 et D1059 (D2018) ; la commande `syncytium retro`, à compléter à l'implémentation (D2030) ; le cadre commun des commandes de `syncytium` et leur liste (D2098) | `syncytium/10-administration/` | — | — |
| 11 | **La télémétrie** | `telemetry.md` | `syncytium/10-administration/telemetrie.md` | — | — |
| 12 | **La documentation** | `documentation.md` | `syncytium/12-documentation/` ; `histoire/chantier-documentation.md` | — | — |
| 13 | **Les API et les échanges** | `documentation.md` §10 et §27 | `syncytium/12-documentation/developpeur.md` | — | — |
| 14 | **Les cas d'usage** | `../usecases/*.md` | `cas-d-usage/` (partie 4) | — | — |
| 15 | **La méthode et le projet** | `conception.md`, `../README.md` | `syncytium/README.md`, `histoire/` (parties 0 et 2) | — | — |

**Les hooks n'ont pas de chapitre** (D1673) : `hooks.md` est dissous (D1762).
Le mécanisme et la déclaration dans la configuration vont au chapitre 1,
chaque famille à la fin de son chapitre — les types et leurs méthodes au 2
(D1674, D1702), les composants au 4, les connecteurs
au 5, les opérations au 6.
La lecture de `hooks.md` (17 points, D1657) est faite (D1667–D1691) ;
la distribution l'est aussi, validée chapitre par chapitre : le mécanisme
au chapitre 1 (D1692, D1697), le type et ses méthodes au chapitre 2
(D1698, D1704), le composant au chapitre 4 (D1705, D1706). Le connecteur
est au chapitre 5 (D1730), l'opération au chapitre 6 (D1762), où
`hooks.md` s'est dissous.

## Les points de la lecture en cours

Le chapitre 9, le fonctionnement du moteur (D1784, D1785) — écrit d'un trait
le 23/11/2026, dans le mode à l'essai : le texte d'abord, les arbitrages sur
le texte (D2128, D2130). Sa vision globale (D1787, D2129) : le cœur du
chapitre est le démarrage d'une version — l'ingestion, puis la migration de
ses données (2–3) ; vient ensuite une reprise qui s'exécute, et ce qu'elle
laisse (4–5) ; puis ce qui tient l'application debout — le démarrage de
l'instance et le secours, les secrets et le chiffrement, la disponibilité
(6–8). Ce qui le quitte : le détail du module `_migration`, les commandes de
`syncytium`, la sauvegarde, la restauration, les environnements et la vie
d'une sandbox, vers le chapitre 10 ; la détection après coup, vers le
chapitre 11 ; la compatibilité vue de l'API, vers le chapitre 13. Les points
sont les huit fichiers du chapitre, que l'auteur relit un à un, puis les
arbitrages de [la page des arbitrages](arbitrages-chapitre-9.md) ; l'état dit
« à traiter », « présenté » ou « clos (Dnnnn) ». Pour un fichier, la lecture
dit où en est sa relecture (D2150) : « à lire », « en relecture », « relu »,
« réécrit » ou « validé ». Le tableau de bord lit cette table, et montre les
fichiers avec leur statut de lecture.

| # | Le point | L'état | La lecture |
|---|---|---|---|
| 1 | **Le README** : la définition du moteur, la description et le moteur — la comparaison avec un compilateur et son schéma, avant et après l'ingestion —, les cinq temps, dont l'arrêt de l'application, ce qui quitte le chapitre, les décisions de la famille | présenté | relu le 28/11/2026, avec ses remarques (D2134) ; à réécrire, puis à valider |
| 2 | **`02-ingestion.md`, le démarrage d'une version** : le chemin d'une version et son logigramme, les contrôles — l'en-tête, le dossier des versions, la description, la migration à blanc —, l'identité et l'empreinte, le registre des versions, l'estampille, après l'ingestion, la sandbox et sa recharge (D93, D326–D332, D344, D801, D920–D922, D927, D928, D1784) | présenté | relu le 28/11/2026, avec ses remarques (D2134) ; à réécrire, puis à valider |
| 3 | **`03-migration.md`, la migration de version : le mécanisme** : les trois causes, la comparaison des facettes et son logigramme, les deux chemins, l'issue — l'erreur sur les données, le défaut, la bijection —, pendant la migration et les tâches, la bascule par un changement de référence, la rétention de la version antérieure et la restauration, le changement de connecteur et le contrat du storage, le double espace (D9, D631, D673–D679, D1969, D1974–D1979, D1993, D1994, D2136–D2141) | clos (D2142) | validé le 28/11/2026, les termes unifiés à sa demande (D2145), après ses remarques : les cinq du 28/11/2026 (D2136), `retention:` placée et son défaut donné (D2137), la version en couple de pointeurs et la nouvelle instance des transformations (D2138), les lecteurs externes de la base et `alias:` (D2139–D2141) |
| 4 | **`04-passage.md`, l'exécution d'un passage** : le déroulé, la lecture — le modèle lu, le filtre, la partition et la dernière valeur parcourue —, les cinq phases en marche, la base miroir et la transaction, le contrôle d'intégrité, la comparaison et la bascule, le cache, un passage à la fois (D672, D933, D1032–D1046, D1052, D1077, D1079, D1920, D1954, D1955) | clos (D2151) | validé le 28/11/2026, après ses remarques : une phrase reprise et le mode pause (D2142), ce que le mode pause arrête et pourquoi, la demande mise en attente (D2143, D2144, D2146), le double fonctionnement, une alternative où Syncytium arbitre (D2147–D2149) |
| 5 | **`05-suivi.md`, ce qu'un passage laisse** : la table des clés d'origine, le modèle lu et ses versions, la ligne d'exécution, les trois jeux de compteurs, les deux indicateurs, les anomalies, le détail et sa rétention, les rapports (D1047–D1060, D1065, D1068, D1889, D2078, D2105, D2106) | présenté | à lire |
| 6 | **`06-demarrage.md`, le démarrage de l'instance et le secours** : les vérifications du démarrage, la condition indispensable, le refus qui s'explique, l'arrêt de l'application, en position de sécurité, et la position de repli (D2134, D2135), le mode safe, l'amorçage, le bris de glace (D33, D81, D626, D718, D745, D902, D919) | présenté | à lire |
| 7 | **`07-secrets.md`, les secrets et le chiffrement** : le patron unique, la marque `*`, les deux commandes, le clair refusé, la rotation des clés, le chiffrement en transit, ce que le moteur sert au navigateur, le chiffrement au repos (D603, D705–D708, D730, D901, D902, D915, D916, D918, D919, D944) | présenté | à lire |
| 8 | **`08-disponibilite.md`, la disponibilité** : les cinq fusibles, la position de sécurité, les frontières d'extension, la continuité pendant une migration (D52, D55, D58, D104, D105, D625–D627) | présenté | à lire |
| 9 | **Arbitrage 1** : une version déposée en pleine journée — la fenêtre de faible affluence de D7 et D8 face à la migration à chaud de D676 et D1974 | présenté | — |
| 10 | **Arbitrage 2** : une version beta, sans que son modèle soit déployé — D1996 face à D801 | présenté | — |
| 11 | **Arbitrage 3** : deux enregistrements gardent la même clé à la fin de la lecture — ce que l'anomalie de D1955 fait tomber | présenté | — |
| 12 | **Arbitrage 4** : le compte de secours — un compte ou deux, l'empreinte dans la description ou le mot de passe à l'installation (D33, D718) | présenté | — |
| 13 | **Arbitrage 5** : le modèle de `_migration` et le fichier de détail — la question gardée pour le chapitre 9 (D1894) | présenté | — |
| 14 | **Arbitrage 6** : les fusibles et la position de sécurité, au chapitre 9 ou au chapitre 10 (D1784, D1785) | présenté | — |
| 15 | **Arbitrage 7** : les lecteurs externes de la base à la bascule — une application ou un outil de BI qui lit le schéma sans passer par Syncytium doit être informé du changement de pointeur ; un nom stable, une information, ou les deux (D1260, D2138) | clos (D2139) | — |
