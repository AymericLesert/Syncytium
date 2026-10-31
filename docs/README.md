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
│   ├── 05-hooks/          les hooks et leurs familles
│   ├── 06-connecteurs/    les connecteurs et leurs contrats
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
| 4 | **Les surfaces et les composants** | `composants.md` | `syncytium/04-composants/` | en cours (21 points, D1590 ; les points 1 à 3, D1593–D1599) | — |
| 5 | **Les hooks** | `hooks.md` | `syncytium/05-hooks/` | — | — |
| 6 | **Les connecteurs** | `connectors.md` | `syncytium/06-connecteurs/` | — | — |
| 7 | **Les droits et la sécurité** | `rights.md`, `security.md` | `syncytium/07-securite/` | — | — |
| 8 | **La reprise et le mapping** | `mapping.md`, `migration.md` | `syncytium/08-reprise/` | — | — |
| 9 | **L'administration et l'exploitation** | `administration.md` | `syncytium/09-administration/` | — | — |
| 10 | **La télémétrie** | `telemetry.md` | `syncytium/09-administration/telemetrie.md` | — | — |
| 11 | **La documentation** | `documentation.md` | `syncytium/11-documentation/` ; `histoire/chantier-documentation.md` | — | — |
| 12 | **Les API et les échanges** | `documentation.md` §10 et §27 | `syncytium/11-documentation/developpeur.md` | — | — |
| 13 | **Les cas d'usage** | `../usecases/*.md` | `cas-d-usage/` (partie 4) | — | — |
| 14 | **La méthode et le projet** | `conception.md`, `../README.md` | `syncytium/README.md`, `histoire/` (parties 0 et 2) | — | — |

Hors des familles : `glossaire.md` va à `syncytium/glossaire.md` avec le
premier chapitre ; `etude-comparative-20260718.md` à
`etudes/comparative-2026-07-18.md` (partie 5) ; `presentation/` et le README
de la racine s'écrivent à la partie 0 ; `conception.md` se convertit en
dernier (partie 2).

*L'ordre des parties : ce plan, puis Syncytium chapitre par chapitre, les
cas d'usage, la présentation, l'histoire, les études à la demande, et en
dernier le nettoyage, qui allège le texte des références aux décisions
(D1520–D1521, D1548).*
