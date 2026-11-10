# Le modèle — l'entité, les champs, les types

Une application Syncytium est d'abord un **modèle de données** : des
modules, des entités dans chaque module, des champs dans chaque entité.
Ce chapitre dit comment une entité se décrit, ce que porte un champ, ce
qui arrive à un enregistrement au fil de sa vie, et quels types un champ
peut prendre. Le langage qui calcule et vérifie les valeurs a son propre
chapitre ; la forme des fichiers est dans
[la configuration](../01-configuration/README.md). Les décisions citées
entre parenthèses renvoient au [registre](../../conception.md).

## Le sommaire

1. [La doctrine](#la-doctrine)
   - [Le module déclare ses entités](#le-module-déclare-ses-entités)
   - [Un fichier ou plusieurs, au choix](#un-fichier-ou-plusieurs-au-choix)
   - [L'entité se documente elle-même](#lentité-se-documente-elle-même)
2. [L'entité](02-entite.md)
   - [Le nom et les textes](02-entite.md#le-nom-et-les-textes)
   - [L'identité](02-entite.md#lidentité)
   - [Le cycle de vie, l'héritage, l'historique](02-entite.md#le-cycle-de-vie-lhéritage-lhistorique)
   - [Les champs, les opérations, la présentation, la partition](02-entite.md#les-champs-les-opérations-la-présentation-la-partition)
   - [La validation](02-entite.md#la-validation)
   - [Les opérations — le renvoi](02-entite.md#les-opérations--le-renvoi)
   - [La présentation — le renvoi](02-entite.md#la-présentation--le-renvoi)
   - [L'exemple fil rouge](02-entite.md#lexemple-fil-rouge)
3. [Les champs](03-champs.md)
   - [La forme courte et le bloc](03-champs.md#la-forme-courte-et-le-bloc)
   - [Les groupes de champs](03-champs.md#les-groupes-de-champs)
   - [Les propriétés d'un champ](03-champs.md#les-propriétés-dun-champ)
   - [La dépréciation d'un élément du modèle](03-champs.md#la-dépréciation-dun-élément-du-modèle)
   - [L'ordre du fichier](03-champs.md#lordre-du-fichier)
4. [La vie d'un enregistrement](04-vie.md)
   - [L'héritage](04-vie.md#lhéritage)
   - [La suppression et la réactivation](04-vie.md#la-suppression-et-la-réactivation)
   - [L'historisation](04-vie.md#lhistorisation)
5. [Les types](05-types.md)
   - [Le socle commun](05-types.md#le-socle-commun)
   - [Les types simples](05-types.md#les-types-simples)
   - [Les fonctions du texte](05-types.md#les-fonctions-du-texte)
6. [Les types composés](06-composes.md)
   - [`amount`, le montant](06-composes.md#amount-le-montant)
   - [`percentage`, le pourcentage](06-composes.md#percentage-le-pourcentage)
   - [`measure`, la mesure](06-composes.md#measure-la-mesure)
   - [`duration`, la durée](06-composes.md#duration-la-durée)
   - [`phone`, le téléphone](06-composes.md#phone-le-téléphone)
   - [`geolocation`, la géolocalisation](06-composes.md#geolocation-la-géolocalisation)
   - [`period`, la période](06-composes.md#period-la-période)
   - [Les identifiants contrôlés](06-composes.md#les-identifiants-contrôlés)
   - [`communication`, le fil](06-composes.md#communication-le-fil)
   - [`label`, le libellé nommé](06-composes.md#label-le-libellé-nommé)
7. [Les collections, les liens, les générés](07-liens.md)
   - [Les collections et les plages](07-liens.md#les-collections-et-les-plages)
   - [Les liens](07-liens.md#les-liens)
   - [Les générés et le contexte](07-liens.md#les-générés-et-le-contexte)
8. [Les hooks du modèle — le type et ses méthodes](08-hooks.md)
   - [Le hook de type](08-hooks.md#le-hook-de-type)
   - [Les méthodes d'un type](08-hooks.md#les-méthodes-dun-type)
9. [Ce que le modèle livre à la documentation](09-documentation.md)
   - [L'entité dans le diagramme](09-documentation.md#lentité-dans-le-diagramme)
   - [La facette de l'entité et du champ](09-documentation.md#la-facette-de-lentité-et-du-champ)
   - [La facette du type](09-documentation.md#la-facette-du-type)
10. [Les décisions](#les-décisions)

## La doctrine

> **Un module** est une part de l'application : ses entités, son menu,
> sa page d'accueil. Il décrit une partie fonctionnelle, comme la gestion
> des ventes ou le référentiel des produits d'un ERP.
>
> **Une entité** est un objet du métier, ou une table dans un modèle
> relationnel : le client, la commande, l'article. Elle a ses champs,
> ses règles, sa présentation.
>
> **Un champ** est la plus petite donnée d'une entité. Il a un nom, un
> type et des propriétés.
>
> **Un enregistrement** est une occurrence d'une entité : tel client,
> telle commande. Les définitions sont au [glossaire](../../glossaire.md).

### Le module déclare ses entités

Un module liste ses entités dans son fichier, par `entities:` (D765,
D766). Les chemins sont relatifs au fichier courant (D768). Rien ne se
déduit de l'arborescence : une entité que le module ne cite pas n'existe
pas (D767).

```yaml
# Les entités du module, en liste explicite
entities:
  - ~{article/article.yml}
  - ~{nomenclature/nomenclature.yml}
```

### Un fichier ou plusieurs, au choix

Toute propriété d'une entité s'écrit en place ou par la référence d'un
fichier (D767). Le fichier unique est possible ; l'éclatement est libre.
Les exemples suivent une convention, un dossier par entité :

- `<entité>.yml`, l'en-tête : le nom, l'identité, la description ;
- `fields.yml`, les champs ;
- `gui.yml`, la présentation ;
- `operations.yml`, quand les opérations le méritent.

Le nommage est libre (D807). Le fichier qui porte le nom de l'entité est
une convention, pas une règle, et le mot juste prime : l'entrepôt écrit
`tiers/tiers/tiers.yml` parce que « tiers » est le bon mot (D884).

### L'entité se documente elle-même

C'est l'un des dix piliers. Ce que l'entité dit d'elle-même nourrit à la
fois les écrans et la documentation générée (D258) :

- `name:`, son nom invariant ;
- `title:`, son nom d'usage, par langue ;
- `label:`, le libellé d'un champ, par langue ;
- `hint:`, la description courte, la précision au « (?) » d'un champ
  (D840) ;
- `description:`, la description longue, la matière du tutoriel ;
- `placeholder:`, l'exemple montré dans une zone vide.

La documentation décrit ainsi les données, jusqu'à celles que les API
transportent. Le commentaire YAML, lui, ne s'adresse qu'au lecteur du
fichier : il dit la nature d'une clé et son apport (D1084), jamais une
décision ni l'histoire du cas (D1085). Ce qui parle à l'utilisateur est
une propriété, jamais un commentaire (D1100).

## Les décisions

Ce chapitre repose sur les décisions de la famille « le modèle et les
types », relues le 30/10/2026 (D1560). Elles sont 130 au registre : D115,
D118–D125, D127–D138, D140–D147, D149, D152–D157, D160–D162, D165–D174,
D220, D222, D353, D355, D359–D361, D364, D368–D369, D373, D381–D383, D386,
D388–D392, D394–D402, D404–D405, D409, D412, D420–D421, D427, D496–D497,
D585–D586, D589, D638, D682, D687, D761, D771, D773, D894, D941, D961, D972,
D974–D976, D981, D983–D984, D987–D988, D991–D992, D998–D999, D1001, D1009,
D1016, D1035, D1039, D1277, D1304–D1305, D1550, D1553–D1561. Chacune se lit
dans [le registre](../../conception.md). Les hooks du modèle,
[08-hooks.md](08-hooks.md), reposent sur les décisions de la famille des hooks
(D1698), listées au chapitre 1 (D1762).
