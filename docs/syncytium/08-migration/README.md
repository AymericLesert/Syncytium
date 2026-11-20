# La migration

> **La migration** porte les données d'une description vers une autre. Elle
> a deux origines : une source, un système précédent, c'est la **reprise** ;
> la version antérieure de l'application, c'est la **migration de version**.
> Dans les deux cas elle applique un **mapping**
> ([glossaire](../../glossaire.md)).

Ce chapitre dit ce que le concepteur écrit pour une migration (D1879). Il
compte trois usages, dont deux sont des migrations (D2025) : la reprise,
la migration de version, et la rétro-conception d'une application
existante, où aucune donnée ne migre (D2027). La reprise vient d'abord —
la migration déclarée, la source, les règles, les contrôles, les
compléments —, puis la migration de version, la rétro-conception, la
dépréciation et ce que tout cela livre à la documentation. L'entrepôt est
le fil rouge des exemples (D2007). Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

1. La migration
   - [Le cadre](#le-cadre)
   - [Ce qui quitte le chapitre](#ce-qui-quitte-le-chapitre)
   - [Les décisions](#les-décisions)
2. [La migration déclarée](02-declaration.md)
   - [Le processus](02-declaration.md#le-processus)
   - [La forme courte](02-declaration.md#la-forme-courte)
   - [Les fichiers et leur ordre](02-declaration.md#les-fichiers-et-leur-ordre)
   - [Le mode et la remise à zéro](02-declaration.md#le-mode-et-la-remise-à-zéro)
   - [La base miroir](02-declaration.md#la-base-miroir)
   - [Le rythme et les opérations](02-declaration.md#le-rythme-et-les-opérations)
3. [La source](03-sources.md)
   - [Les deux maisons](03-sources.md#les-deux-maisons)
   - [La description de la source](03-sources.md#la-description-de-la-source)
   - [Le filtre et la partition](03-sources.md#le-filtre-et-la-partition)
4. [Les règles](04-regles.md)
   - [Le sens et la clé](04-regles.md#le-sens-et-la-clé)
   - [La description et les formes longues](04-regles.md#la-description-et-les-formes-longues)
   - [Le partage entre fichiers](04-regles.md#le-partage-entre-fichiers)
   - [Le possesseur et la clé lue](04-regles.md#le-possesseur-et-la-clé-lue)
5. [Les contrôles](05-controles.md)
   - [La validation et son message](05-controles.md#la-validation-et-son-message)
   - [Les rapports](05-controles.md#les-rapports)
   - [Les phases de contrôle](05-controles.md#les-phases-de-contrôle)
   - [Ce que la reprise écrit, ce qu'elle laisse](05-controles.md#ce-que-la-reprise-écrit-ce-quelle-laisse)
6. [Les compléments](06-complements.md)
   - [Au-delà du un pour un](06-complements.md#au-delà-du-un-pour-un)
7. [La migration de version](07-version.md)
   - [L'implicite](07-version.md#limplicite)
   - [Le protocole et le processus](07-version.md#le-protocole-et-le-processus)
   - [Ce qui s'écrit](07-version.md#ce-qui-sécrit)
   - [Les deux volets](07-version.md#les-deux-volets)
   - [Les écarts documentés](07-version.md#les-écarts-documentés)
8. [La rétro-conception](08-retro-conception.md)
   - [La rétro-conception d'une application existante](08-retro-conception.md#la-rétro-conception-dune-application-existante)
9. [La dépréciation d'un élément de la reprise](09-depreciation.md)
   - [Les trois éléments](09-depreciation.md#les-trois-éléments)
   - [Les deux formes](09-depreciation.md#les-deux-formes)
   - [Ce que la dépréciation touche](09-depreciation.md#ce-que-la-dépréciation-touche)
   - [L'adresse d'une règle remplaçante](09-depreciation.md#ladresse-dune-règle-remplaçante)
   - [De l'intention à la suppression](09-depreciation.md#de-lintention-à-la-suppression)
10. [Ce que la migration livre à la documentation](10-documentation.md)
   - [La facette de la reprise](10-documentation.md#la-facette-de-la-reprise)
   - [La migration de version, dans les documentations](10-documentation.md#la-migration-de-version-dans-les-documentations)

## Le cadre

« Le mapping va permettre de couvrir 2 fonctions essentielles : la
migration entre 2 versions ; la migration entre 2 schémas
(storage). » Un seul mapping, deux visages :

1. **entre deux versions** — la migration à chaud (les quatre gestes
   `create_schema` → migration → `switch_schema` → `delete_schema`,
   D631) **et la mécanique de la compatibilité ascendante et
   descendante** : le même mapping qui migre les données engendre la
   chaîne de translation des API (le pilier P3, D11–D13) ;
2. **entre deux schémas (storage)** — le `from:` (D610) : le système
   existant vers le nouveau ; **les interfaces de Syncytium offrent
   une vue sur les données migrées et validées** (D646) — l'IHM en
   poste de contrôle (l'écho de la reprise D175–D179 et de la
   posture entrepôt D180).

**Les deux usages sont unifiés** (D647) — le même langage, les mêmes
conversions.

**Le chapitre compte trois usages, dont deux sont des migrations**
(D2025) : la reprise, la migration de version, et la rétro-conception
d'une application existante (D2027). Dans les deux premiers, des
données passent d'une description à une autre. Dans le troisième,
aucune donnée ne migre : Syncytium se pose sur la base existante
(D1907).

## Ce qui quitte le chapitre

Le chapitre définit ce que le concepteur écrit ; ce qui s'exécute est
ailleurs :

- **l'exécution d'un passage** et les conversions, au chapitre 9, le
  moteur (D1880, D1881) ;
- **le mécanisme de la migration de version**, au chapitre 9 (D1974) ;
- **le détail du module `_migration`** et sa facette documentation, au
  chapitre 10, l'administration et l'exploitation (D2010) ;
- **le contrat de compatibilité vu de l'API**, au chapitre 13 ;
- **la carte des fichiers d'un connecteur**, au
  [chapitre 5](../05-connecteurs/README.md).

Ce qui attend les chapitres 9 et 10 est dans
[administration.md](../../administration.md), « Reçu du chapitre 8 », et
dans [migration.md](../../migration.md), qui reste en place jusqu'au
chapitre 10.

## Les décisions

Ce chapitre repose sur les décisions de la famille « la migration », relues
du 08/11/2026 au 19/11/2026 (D1863–D2023). Il vient de l'artefact
préparatoire `mapping.md` (D661) ; le second, `migration.md` (D1028), reste
en place jusqu'au chapitre 10 (D2010). Elles sont 170 décisions au
registre :
D3–D6, D91, D175–D179, D406, D606, D610, D632, D646, D648–D649, D651–D652, D654–D658, D660–D665, D669, D671, D673, D811, D819–D823, D828, D847–D848, D851, D869, D871, D874, D877–D880, D882, D929–D932, D943, D965–D966, D969, D986, D990, D995–D996, D1006–D1007, D1038, D1042, D1044–D1045, D1058, D1087, D1102–D1105, D1111, D1116, D1259, D1262, D1302, D1880, D1882–D1886, D1888–D1898, D1900–D1905, D1907–D1911, D1913–D1916, D1918, D1923, D1925, D1927, D1929–D1930, D1940–D1949, D1951, D1953, D1956, D1958, D1961, D1964, D1966, D1968–D1972, D1981–D1990, D1992–D1993, D1995–D1997, D2007, D2010–D2016, D2025–D2031.
