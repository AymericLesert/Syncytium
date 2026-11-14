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
| 8 | **La reprise et le mapping** | `mapping.md`, `migration.md` | `syncytium/08-reprise/` | en cours depuis le 08/11/2026 (D1863 ; dix-neuf points en deux parties, la reprise et la migration de version, D1887 ; les points 1 à 14 clos, la première partie lue) | — |
| 9 | **Le fonctionnement du moteur** | `administration.md`, « Reçu du chapitre 7 » — l'intégrité, la disponibilité, les secrets (D1824) ; le registre — l'ingestion, l'estampille, le registre des versions (D1784) ; `migration.md` — l'exécution d'un passage, et `mapping.md` — la migration entre deux versions (D1879, D1880) ; le fonctionnement du cache d'une migration (D1920) ; la dernière valeur parcourue, la clé de partition dans la table des clés d'origine, la comparaison par blocs, les compteurs et les indicateurs (D1928) ; l'échec dans une composition et le doublon de la base miroir (D1952) ; le contrôle d'intégrité des identités, juste avant la validation de la migration, le doublon qui subsiste étant une anomalie (D1954, D1955) ; le différentiel par lequel la source fait foi (D1966) ; le mécanisme de la migration de version — la comparaison des facettes, le plan de reprise, la bascule, l'espace de stockage au moins double, le changement de connecteur, déclenché par l'environnement (D1974, D1977–D1979) | `syncytium/09-moteur/` | — | — |
| 10 | **L'administration et l'exploitation** | `administration.md`, le registre — la supervision des tâches, D56, D61, D62 (D1689) | `syncytium/10-administration/` | — | — |
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

Le chapitre 8, la reprise et le mapping (D1863) — la lecture est ouverte. Les points d'un
chapitre se dégagent à son ouverture, dans l'ordre de son sujet, avec ce qui
le quitte vers les autres chapitres (D1787) ; l'état dit « à traiter »,
« présenté » ou « clos (Dnnnn) » ; le tableau de bord lit cette table.
Le chapitre a deux parties (D1887) : la reprise — le cadre (2–3), la source
(4–8), les règles de mapping (9–10), les règles de transformation (11–12) —,
puis la migration de version (13–16) ; les exemples, la facette et le
registre le ferment (17–19). Une troisième section est ouverte par l'auteur :
le remplacement silencieux d'une application existante, dont les points se
dégageront à son ouverture (D1907, D1908). Le chapitre définit ce que le concepteur écrit
(D1879) ; ce qui le quitte : toutes les conversions et l'exécution d'un
passage, vers le chapitre 9 — les six points du passage y sont partis
(D1880, D1881) — ; le contrat de compatibilité vu de l'API, vers le
chapitre 13 ; les surfaces du module `_migration`, vers le chapitre 10 ; la
carte des fichiers d'un connecteur, déjà au chapitre 5. Les points ont été
renumérotés à la clôture du point 1.

| # | Le point | L'état |
|---|---|---|
| 1 | **Le périmètre** : la migration et ses deux origines, la reprise et la migration de version ; le mapping, les règles qu'une migration applique ; le chapitre définit, le chapitre 9 exécute ; la dépréciation d'un élément, un bloc par composante (D1869–D1886) | clos (D1887) |
| 2 | **La migration déclarée**, `migrations:` et `migration.yml` : `from:`, `sources:`, `mapping:`, `mode:` et `reset:` avec leurs défauts, `operations:`, `on_running:` ; la base miroir dans l'environnement, par `mirror:`, en forme courte ou en bloc — `storage:` et `retention:` —, le `storage:` de la migration retiré — leur définition, leur usage est au chapitre 9 ; un processus de migration par connecteur d'origine, `from:` garde sa structure ; la forme courte d'une reprise un pour un, `legacy: fichier_csv` ou `legacy: fichier_csv[client]`, par l'auto-description du connecteur et un mapping champ à champ (D662, D664, D671, D943, D1045, D1087, D1884–D1898) ; les trois cas la déclarent | clos (D1899) |
| 3 | **L'ordre des étapes** : les migrations dans l'ordre alphabétique de leurs noms, la logique du concepteur (D1888, D1905) ; les règles dans l'ordre de leur déclaration, que le concepteur maîtrise (D1905), un motif trié sur le chemin complet de ses fichiers et inséré à sa position, le tri sur les caractères — `10_stock` avant `2_tiers` — (D1900, D1901) ; l'ordre des entités sous `sources:` sans importance, Syncytium construit le graphe de dépendance et réordonne, un numéro n'y sert que la lisibilité (D1902–D1904) ; les dossiers et les fichiers numérotés, les motifs regex (D665, D806, D1103–D1104) | clos (D1906) |
| 4 | **La description de la source** dans la grammaire du modèle : un fichier par table, les trois états d'une colonne — lue, ignorée, non lue —, `ignored` en forme courte ou en propriété (D1909), la colonne décrite et ses codes ; deux régimes, la reprise analysée et la forme courte, la complétude portée de la même façon ; la description recommandée, non obligatoire (D652, D657, D868, D869, D947, D1100–D1102, D1907–D1911) | clos (D1912) |
| 5 | **L'identité et les références de la source** : la référence composée, nommée `TABLE[NOM].colonne`, à l'une de deux entités `A.c or B.c` — deux lectures en proposition (D995, D996) —, la composition déclarée chez le possesseur, `list of <fils>[<colonne du fils>: <colonne du possesseur>]`, le `parent:` du fils retiré de la source (D876, D931, D1035, D1042, D1913–D1916) | clos (D1917) |
| 6 | **La normalisation à la source** : `formula:`, `normalize:` — un usage ici, `me.trim()` préférée, ses fonctions au chapitre 3 (D1921, D1924) —, la lecture d'une autre table par un calculé — les méthodes du modèle, rien d'inventé (D1919) — et son cache, dont le fonctionnement va au chapitre 9 (D1920), l'alias — `alias:` le nom de l'entité, avant `name:`, celui de la table (D1918) — ; un seul cache, deux usages, l'entrée déclarée à son premier `push` (D1923, D1925) (D660, D872, D965, D966, D990, D1918–D1925) | clos (D1926) |
| 7 | **Le périmètre et la couverture** : `filter:` hors taux, `partition:` — la clé s'appelait `coverage:` (D1929) — en forme courte et riche, sur un numéro la plage en numéros distincts (D1927), la partition et la dernière valeur parcourue, l'état relu en entier ; la mécanique de la lecture au chapitre 9 (D1928) (D663, D878–D880, D1013, D1050, D1927–D1930) | clos (D1931) |
| 8 | **Les sources fichiers** : la carte entités → fichiers au connecteur, `headers:`, `skipheader:` ; les classeurs, Excel décrit au chapitre 5 (D1932) ; `reference:` et `label:` dans `entities` du connecteur, qui expose les colonnes et les types — `sources/` ajoute ce qu'il ne porte pas (D1933, D1936) ; le `mask` au connecteur ou dans la migration (D1934) ; `connector.*` défini au chapitre 5, un usage ici (D1935) (D816, D819–D820, D828, D845–D849, D1932–D1938) — la frontière avec le chapitre 5 | clos (D1939) |
| 9 | **La forme de la règle** : `to:`, `filter:`, `distinct:`, `parent:`, `fields:`, `validation:`, `operations:`, `report:` ; les formes longues, le `message:` en gabarit, les deux formes de la validation ; plusieurs règles par fichier, dans l'ordre écrit, un fichier par règle recommandé (D1940) ; la clé d'une référence et celle du possesseur entre crochets (D1941, D1943) ; le message construit par un label par opérateur, `message:` facultatif (D1944–D1949) (D655–D656, D930, D1105–D1106, D1116–D1117, D1940–D1949) | clos (D1950) |
| 10 | **La clé fonctionnelle et les agrégats** : l'identité de la cible alimentée par `fields:`, les origines multiples, `parent:` par les champs mappés, le parent d'une hiérarchie, l'identité partout ; sur un même champ, la dernière mise à jour l'emporte (D1951) ; plusieurs identités, la clé principale et la clé secondaire (D1953) (D654, D931, D969, D1035, D1046, D1171, D1951–D1956) | clos (D1957) |
| 11 | **Au-delà du 1-1** : le référentiel par `distinct:`, les composés par la fonction du type, le rapprochement par le cache `push`/`pop`, le compteur surchargé, les champs mutualisés `~{…}`, le cumul de fichiers — des usages, chacun défini dans son chapitre, un exemple et un lien ici (D1958) (D658–D659, D821–D823, D883, D967–D968, D998, D999, D1958–D1962) | clos (D1963) |
| 12 | **L'enrichissement et la perte** : `unmapped:`, `default:`, la source fait foi, le texte trop long refusé à l'ingestion — une doctrine en quatre cas, les mécanismes définis aux chapitres 2 et 3 (D1964) ; `unmapped:`, non plus `unchanged:` (D1965) (D581, D941, D1038, D1964–D1966) | clos (D1967) |
| 13 | **La traduction des écarts** : la version antérieure est la source, Syncytium calcule les règles de mapping — les cas triviaux déduits, le critère — un écart de structure ou des règles de mapping (D1969) —, les écarts documentés ; la migration de version est une forme courte (D1968) (D5, D632, D647, D673, D1112, D1968–D1972) | clos (D1973) |
| 14 | **Les transformations d'une migration de version** : le changement de type par les conversions que chaque type porte, la création et la suppression d'un champ ; le mécanisme dévoilé par l'auteur, au chapitre 9 (D1974) ; une conversion ne fait une erreur que si une valeur échoue (D1975) ; les conversions définies aux chapitres 2 et 3, un usage ici (D1977) (D579, D584, D647, D1974–D1979) | clos (D1980) |
| 15 | **Les surcharges, `exchange/`** : le renommage — `from:` sur le champ, l'entité ou le module, la version d'origine à sa suite au besoin, non dans `exchange/` (D1985, qui amende D1982) —, l'éclatement et la fusion, leur grammaire, la clé qui déclare `exchange/` — `exchange:`, dans le processus, au niveau de `sources:` et `mapping:` (D1981) (D4, D6, D651, D1111, D1883, D1981–D1985) | présenté |
| 16 | **Les deux volets** : l'ascendant et le descendant, la réversibilité — l'auto-inversible, la règle inverse déclarée, la valeur de substitution —, le lien avec la compatibilité des API (D11–D13, D91, D1883) | à traiter |
| 17 | **Les exemples** : le véhicule — les classeurs, `absolute`, `reset` —, la banque — les fichiers, les trois phases, le cache —, l'entrepôt — PMI, `relative`, `coverage:` — ; le cas 5 en fil rouge, les extraits tels quels (D1545, D1818) | à traiter |
| 18 | **La facette documentation** : les neuf colonnes écrites dans les deux artefacts, réunies dans le fichier de la documentation du chapitre (D1158–D1159, D1259, D1302) ; la dépréciation d'un élément de la reprise — la migration déclarée, l'entité source, la règle (D1873) | à traiter |
| 19 | **Le registre** : 35 amendées dont 11 non citées, 55 non citées à citer ou à reclasser — dont D181–D184, le stock de reprise, face au passage et à l'anomalie datée (D1032, D1059), avec le chapitre 9 —, 37 lectures à confirmer, 6 marques en proposition ; l'historique — Q58, « le sixième artefact », les lots du 20/09 — au journal | à traiter |
