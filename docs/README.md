# La documentation de Syncytium — le plan

*Cette page est le plan de la documentation du dépôt : son arborescence, et
l'état de chaque document. Elle se lit dans GitHub et s'embarque avec le
Syncytium déployé (D1515). Elle est tenue à jour à chaque chapitre déplacé
(le rang 10 du chantier de la documentation, D1520–D1521). En proposition,
écrite le 28/10/2026 avec l'arborescence encore vide.*

## Comment lire

- **Vous découvrez Syncytium** : commencez par la [présentation](presentation/),
  qui déplie une application complète à partir de vingt-six lignes de
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
│   ├── 08-reprise/        le mapping et le module de migration
│   ├── 09-administration/ l'administration, l'exploitation, la télémétrie
│   ├── 11-documentation/  la documentation que Syncytium génère
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

## L'avancement des quatorze chapitres

Un chapitre par famille de décisions (D1526). Avant d'être réorganisé, un
chapitre est *lu* : la classification de sa famille relue, les décisions
amendées ou remplacées confrontées à son texte, ses marques « en
proposition » soldées (D1521) ; puis il est *réorganisé* : déplacé, découpé,
ses renvois réécrits ; puis il est *réécrit*, didactique, illustré, en
phrases courtes (D1542–D1543), ce que la colonne de la réorganisation
note à sa suite. Les deux colonnes disent « — », « en cours » ou
« fait le JJ/MM/AAAA ».

| # | Le chapitre | Les documents d'aujourd'hui | La destination | La lecture | La réorganisation |
|---|---|---|---|---|---|
| 1 | **La configuration et son écriture** | `configuration.md` | `syncytium/01-configuration/` | fait le 29/10/2026 (13 points, D1528–D1540) | fait le 29/10/2026 (six fichiers, D1541) ; réécrite le 29/10/2026 (D1542–D1544) |
| 2 | **Le modèle et les types** | `entity.md`, `types.md` | `syncytium/02-modele/` | fait le 30/10/2026 (25 points, D1549–D1560) | fait le 30/10/2026 (huit fichiers, D1561) ; réécrite le 30/10/2026 (D1562, les définitions) |
| 3 | **Le langage d'expression** | le registre ; `syncytium/02-modele/types.md` (la signature des types) ; `syncytium/01-configuration/mecanismes.md` §2.7 | `syncytium/03-langage/` | fait le 31/10/2026 (13 points, D1565–D1584) | fait le 31/10/2026 (quatre fichiers, D1586) ; réécrite le 31/10/2026 |
| 4 | **Les surfaces et les composants** | `composants.md` | `syncytium/04-composants/` | fait le 01/11/2026 (21 points, D1593–D1645) | fait le 01/11/2026 (sept fichiers, D1646) ; réécrite le 01/11/2026, relue (D1647–D1656) |
| 5 | **Les connecteurs** | `connectors.md` | `syncytium/05-connecteurs/` | faite le 02/11/2026 (18 points, D1707–D1729) | faite le 02/11/2026 (sept fichiers, D1730) ; réécrite le 02/11/2026 (D1731–D1737), relue le 05/11/2026 (D1780) |
| 6 | **Les opérations** | `hooks.md` §3, le registre — les tâches, D53, D54, D87, D88, D106 (D1689) | `syncytium/06-operations/` | faite le 05/11/2026 (16 points, D1739–D1761) | faite le 05/11/2026 (huit fichiers, D1762) ; réécrite le 05/11/2026 (D1763–D1769), relue le 05/11/2026 (D1770–D1779) |
| 7 | **Les droits et la sécurité** | `rights.md`, `security.md` | `syncytium/07-securite/` | — | — |
| 8 | **La reprise et le mapping** | `mapping.md`, `migration.md` | `syncytium/08-reprise/` | — | — |
| 9 | **L'administration et l'exploitation** | `administration.md`, le registre — la supervision des tâches, D56, D61, D62 (D1689) | `syncytium/09-administration/` | — | — |
| 10 | **La télémétrie** | `telemetry.md` | `syncytium/09-administration/telemetrie.md` | — | — |
| 11 | **La documentation** | `documentation.md` | `syncytium/11-documentation/` ; `histoire/chantier-documentation.md` | — | — |
| 12 | **Les API et les échanges** | `documentation.md` §10 et §27 | `syncytium/11-documentation/developpeur.md` | — | — |
| 13 | **Les cas d'usage** | `../usecases/*.md` | `cas-d-usage/` (partie 4) | — | — |
| 14 | **La méthode et le projet** | `conception.md`, `../README.md` | `syncytium/README.md`, `histoire/` (parties 0 et 2) | — | — |

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

Hors des familles : `glossaire.md` va à `syncytium/glossaire.md` avec le
premier chapitre ; `etude-comparative-20260718.md` à
`etudes/comparative-2026-07-18.md` (partie 5) ; `presentation/` et le README
de la racine s'écrivent à la partie 0 ; `conception.md` se convertit en
dernier (partie 2).

*L'ordre des parties : ce plan, puis Syncytium chapitre par chapitre, les
cas d'usage, la présentation, l'histoire, les études à la demande, et en
dernier le nettoyage, qui allège le texte des références aux décisions
(D1520–D1521, D1548).*
