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
│   ├── configuration/     la syntaxe, les mécanismes, l'arbre, les défauts du socle
│   ├── modele/            l'entité, les champs, les types
│   ├── composants/        le catalogue des composants graphiques
│   ├── hooks/             les hooks et leurs familles
│   ├── connecteurs/       les connecteurs et leurs contrats
│   ├── securite/          la sécurité et les droits
│   ├── reprise/           le mapping et le module de migration
│   ├── administration/    l'administration, l'exploitation, la télémétrie
│   ├── documentation/     la documentation que Syncytium génère
│   └── outils.md          les outils du dépôt
├── cas-d-usage/           partie 4 : les cinq cas, chacun avec sa configuration et ses documents
└── etudes/                partie 5 : les études comparatives, datées
```

La configuration des cas vit dans [`../examples/`](../examples/), les outils
dans [`../tools/`](../tools/).

## L'état des documents

Les documents d'aujourd'hui, leur destination et leur état. Un chapitre est
*audité* avant d'être déplacé : les décisions de sa famille amendées ou
remplacées sont confrontées à son texte, et ses marques « en proposition »
sont soldées (D1521, D1526).

| Le document | Sa destination | L'état |
|---|---|---|
| `conception.md` | `histoire/` — les décisions, le journal, le narratif ; `syncytium/README.md` — les piliers | à convertir en dernier (partie 2) |
| `glossaire.md` | `syncytium/glossaire.md` | à auditer et déplacer |
| `configuration.md` | `syncytium/configuration/` | à auditer et déplacer |
| `entity.md`, `types.md` | `syncytium/modele/` | à auditer et déplacer |
| `composants.md` | `syncytium/composants/` | à auditer, découper et déplacer |
| `hooks.md` | `syncytium/hooks/` | à auditer et déplacer |
| `connectors.md` | `syncytium/connecteurs/` | à auditer et déplacer |
| `rights.md`, `security.md` | `syncytium/securite/` | à auditer et déplacer |
| `mapping.md`, `migration.md` | `syncytium/reprise/` | à auditer et déplacer |
| `administration.md`, `telemetry.md` | `syncytium/administration/` | à auditer et déplacer |
| `documentation.md` | `syncytium/documentation/` ; `histoire/chantier-documentation.md` | à auditer, découper et déplacer |
| `etude-comparative-20260718.md` | `etudes/comparative-2026-07-18.md` | à déplacer (partie 5) |
| `../usecases/*.md` | `cas-d-usage/<cas>/` | à déplacer et découper (partie 4) |
| `../README.md` | la racine : le tiny en accroche | à réécrire (partie 0) |
| `presentation/` | — | à écrire (partie 0) |

*L'ordre des parties : ce plan, puis Syncytium chapitre par chapitre, les
cas d'usage, la présentation, l'histoire, et les études à la demande
(D1520–D1521).*
