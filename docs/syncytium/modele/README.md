# Le modèle — l'entité, les champs, les types

Une application Syncytium est d'abord un **modèle de données** : des
modules, des entités dans chaque module, des champs dans chaque entité.
Ce chapitre dit comment une entité se décrit, ce que porte un champ, ce
qui arrive à un enregistrement au fil de sa vie, et quels types un champ
peut prendre. Le langage qui calcule et vérifie les valeurs a son propre
chapitre ; la forme des fichiers est dans
[la configuration](../configuration/README.md). Les décisions citées
entre parenthèses renvoient au [registre](../../conception.md).

## Le sommaire

1. **La doctrine** — ci-dessous : où vit une entité, comment elle se
   documente.
2. **[L'entité](entite.md)** — l'en-tête de son fichier, sa validation et
   ses trois sévérités, ses opérations et sa présentation par renvoi.
3. **[Les champs](champs.md)** — la forme courte et le bloc, les groupes,
   les propriétés d'un champ, l'ordre du fichier.
4. **[La vie d'un enregistrement](vie.md)** — l'héritage, la suppression
   et la réactivation, l'historisation.
5. **[Les types](types.md)** — le socle commun à tous les types, les types
   simples, les fonctions du texte.
6. **[Les types composés](composes.md)** — le montant, la mesure, la
   durée, la géolocalisation, la période…
7. **[Les collections, les liens, les générés](liens.md)** — les listes et
   les plages, la référence, la composition, l'association, le compteur,
   le calculé, le contexte, les types ajoutés par un hook.
8. **[Ce que le modèle livre à la documentation](documentation.md)** — le
   diagramme, et ce que l'entité, le champ et le type apportent à chaque
   documentation générée.

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

Ce chapitre repose sur les décisions de la famille « le modèle et les
types », relues le 30/10/2026 (D1560). La liste se recalcule :
`python tools/decisions.py docs/conception.md --numeros modele`.
