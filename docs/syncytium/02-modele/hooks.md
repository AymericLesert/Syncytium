# Les hooks du modèle — le type et la fonction

Le catalogue des types et des fonctions est celui de Syncytium. Quand il
manque un type ou une fonction, le projet l'ajoute par du code : un hook.
Ce fichier dit ce qu'un hook de type livre, comment il se déclare et
s'emploie, puis ce qu'est un hook de fonction. Le mécanisme commun, la
maison `hooks/`, la fiche, la description par langue, les traces, est au
chapitre 1,
[la version](../01-configuration/version.md#39-hooks--le-mécanisme-des-hooks).

## Le sommaire

- [Le hook de type](#le-hook-de-type)
  - [Un dérivé ou un hook ?](#un-dérivé-ou-un-hook-)
  - [Ce qu'un type ajouté livre](#ce-quun-type-ajouté-livre)
  - [Le pivot avec le storage](#le-pivot-avec-le-storage)
  - [La fiche et l'usage](#la-fiche-et-lusage)
- [Le hook de fonction](#le-hook-de-fonction)
  - [Le contrat](#le-contrat)
  - [La déclaration et l'usage](#la-déclaration-et-lusage)

## Le hook de type

> **Un hook** est un prolongement par code, écrit contre le contrat de
> Syncytium. Le hook de type ajoute un type au catalogue ; ce type
> s'emploie ensuite comme un type du socle
> ([glossaire](../../glossaire.md)).

Le mot « hook » n'apparaît jamais dans la configuration (D408) : le type
ajouté se nomme, et son nom s'écrit comme `text` ou `date`. Tous les
types du catalogue sont eux-mêmes des hooks qui appartiennent à
Syncytium (D408). Le type `label` montre la voie (D585, D586) : l'accès
au catalogue des libellés, les gabarits nommés, l'enregistrement en
paramètre ; sa fiche est dans
[les types composés](composes.md#label-le-libellé-nommé).

### Un dérivé ou un hook ?

Avant d'écrire du code, une question : le catalogue a-t-il déjà le
type ? Un type `progression`, un entier de 0 à 100 rendu par le
composant `fuel`, ne demande aucun code. C'est un type dérivé (D359,
D992), déclaré dans les settings sous `field:` (D1239) et décrit dans
[les types](types.md#les-types-dérivés). Le hook de type sert quand le
catalogue n'a pas le type : il apporte un type nouveau, avec sa
signature complète (D1668).

### Ce qu'un type ajouté livre

Un type ajouté livre cinq choses (D1677). Chacune est décrite à sa
fiche. Un type sans l'une d'elles est incomplet ; sans ses règles de
stockage, l'ingestion le refuse (D681, D1690).

- **Sa signature** (D579–D584) : la conversion au nom du type, la table
  des opérateurs, les comparateurs, le tri, ses fonctions, qui sont ses
  méthodes (D1674), et pour un composé l'accès à ses parties (D772,
  D773). Voir [la signature d'un type](types.md#la-signature-dun-type).
- **Sa représentation** (D458, D459) : « aucun type sans visage », le
  composant d'écran au nom du type et le rendu de document. Voir
  [le composant par défaut](types.md#le-composant-par-défaut).
- **Ses règles de stockage** (D681–D684, D1296–D1298) : la déclinaison
  en types élémentaires, la forme pivot, l'identification, les trois
  gestes du champ, dont la modification, l'altération et le transcodage
  (D647, D673). Voir
  [la conversion vers le stockage](types.md#la-conversion-vers-le-stockage)
  et le pivot, ci-dessous.
- **Sa facette documentation** (D1301) : la forme en clair, la
  déclinaison, les indicateurs, l'exemple, le marquage, et les mots du
  catalogue par langue (D1160, D1163). Voir
  [les cinq livraisons du hook de type](documentation.md#les-cinq-livraisons-du-hook-de-type).
- **Ses facettes** (D368 et suivantes) : le tri et le nul, la
  recherche, le masque. Voir
  [les facettes communes](types.md#les-facettes-communes).

La collection est un type comme les autres. Ses méthodes, `sum`,
`count`, `avg`, `min`, `max`, `first`, `last`, `any`, `all`, `group`,
`sort`, sont à sa fiche,
[les collections et les plages](liens.md#les-collections-et-les-plages) ;
leur usage est au chapitre 3,
[les collections](../03-langage/collections.md) (D580, D1015–D1017,
D1576).

### Le pivot avec le storage

Le storage influe sur le hook de type (D1297) : « Le storage influe le
hook des types pour définir les propriétés ou les éléments à couvrir.
Au storage de faire le nécessaire pour exploiter au mieux ces
données. » Le storage énonce ce qu'il attend d'un type : la forme
native, les gestes, l'identification, les index qu'il sait porter, la
partition. Le type le fournit ; le storage en tire le meilleur parti.

Tout type se décline en types élémentaires (D1298, D1300), le format
pivot :

- **en un élémentaire** : booléen, entier, long, décimal, texte…, avec
  ses propriétés génériques ; `text[..40]` a sa longueur maximale ;
- **ou en une liste nommée d'élémentaires** : `measure` devient
  `{ valeur: decimal, unite: enum }`, `amount` devient
  `{ valeur: decimal, devise: text[3] }` ;
- **un énuméré** se décline en entier, l'indice, ou en texte, le code.

Le storage ne convertit que des élémentaires : c'est ce qui rend le
modèle extensible. Le type couvre la liste du storage par cette
déclinaison et ses règles de transcription (D1296). Un type qui ne
couvre pas un élément attendu est refusé à l'ingestion, jamais dégradé
(D1690). La forme en clair, les indicateurs (D1288) et la règle de
stockage sont les trois facettes que le contrat livre à la
documentation.

### La fiche et l'usage

La fiche suit la forme commune du chapitre 1 (D809) : `name`,
`description`, `code`, `properties`. Le code livre la signature et le
composant. L'exemple est inventé, aucun cas n'en porte : un type `isbn`,
l'identifiant d'un livre, que le catalogue n'a pas, alors qu'il a `iban`
(D391). L'ISBN est l'identifiant international du livre, à dix ou treize
chiffres, dont le dernier est une clé de contrôle
([AFNIL](https://www.afnil.org/isbn/)). Le code livre la conversion
`isbn(x)`, l'égalité, le tri, la clé vérifiée par sa méthode `check`,
ci-dessous, les parties `.group`, `.publisher` et `.title`, la déclinaison
en `text[..17]` (D1298) et le composant `isbn` (D458).
`hooks/types/isbn/isbn.yml` :

```yaml
# Le type isbn
# Un identifiant de livre, vérifié par sa clé ; ses parties : le groupe, l'éditeur, le titre.
name: isbn

# La description
# La documentation du type, en Markdown, une par langue de la version.
description:
  fr: ~{documentation.fr.md}
  en: ~{documentation.en.md}

# Le code
# La signature du type et son composant.
code: ~{source.txt}

# Les propriétés
# Les formes admises, à dix ou treize chiffres ; vide, les deux le sont.
properties:
  lengths:
    mode: static
    type: list of integer
    value: [ ]
```

L'usage est celui d'un type du socle. Les défauts se règlent sous
`field:` des settings, comme ceux de tout type (D991, D1239) :

```yaml
# Les champs
field:

  # Le type isbn
  # La forme à treize chiffres seulement.
  isbn:
    lengths: [ 13 ]
```

Un champ l'emploie par son nom :

```yaml
# L'identifiant du livre
# Son ISBN, vérifié à la saisie.
isbn: isbn
```

## Le hook de fonction

> **Une fonction** est une opération du langage qui prend des valeurs
> en arguments et rend une valeur, ou plusieurs valeurs nommées. Chaque
> type emmène les siennes, un hook de fonction en ajoute
> ([glossaire](../../glossaire.md)).

Une fonction est une méthode d'un type (D1674). Le hook de fonction est
porté par le type qui expose ses fonctions (D1676) : « le hook de
fonction est porté par le type qui exposera ses fonctions ». Le hook qui
ajoute une fonction dit donc quel type l'expose, `isbn` pour
`check`, et un type apporté par un hook liste ses fonctions dans
sa propre fiche. La clé qui le dit, `type:`, reste en proposition.

Le hook de fonction se complétera à l'implémentation (D1684) : « ça
assurera le lien entre le socle et les composants ajoutés. En fonction
de l'architecture technique et des composants techniques, les règles
peuvent être revues et corrigées. Pour le moment, ça couvre le besoin et
ça reste vrai. »

### Le contrat

Une fonction ajoutée est un calcul pur (D571) :

- elle rend une valeur, une liste, ou des valeurs nommées, aux types du
  modèle ; une expression régulière à groupes nommés nourrit plusieurs
  champs d'un seul appel (D593) ;
- ses paramètres sont typés et son résultat déclaré : le typage statique
  s'y appuie (D581) ;
- elle lit son contexte et n'écrit rien ; elle ne déclenche aucune
  opération ;
- le moteur l'appelle au fil du graphe d'exécution, au paramètre
  modifié ; le graphe est acyclique, un cycle est une erreur d'ingestion
  (D592).

Les fonctions libres, `min`, `max`, `sum`, `avg` (D583, D587), sont la
porte des hooks de fonction libre : « le catalogue s'enrichira, si
besoin ». Elles sont décrites au chapitre 3,
[le catalogue des fonctions](../03-langage/fonctions.md).

### La déclaration et l'usage

L'exemple est inventé, aucun cas n'en porte : la méthode `check` du type
`isbn`, ci-dessus, qui valide la clé de contrôle de l'identifiant. Le
type porte la validation de l'identifiant et ses méthodes (D1699) ;
`check` en est une. La fiche nomme le type qui l'expose.
`hooks/functions/check/check.yml` :

```yaml
# La méthode check du type isbn
# Vraie quand la clé de contrôle est juste : à dix chiffres, la somme pondérée de 10 à 1 est un multiple de 11,
# X valant dix ; à treize chiffres, la somme pondérée 1, 3, 1, 3… est un multiple de 10.
name: check

# Le type qui expose la méthode
type: isbn

# La description
# La documentation de la méthode, en Markdown, une par langue de la version.
description:
  fr: ~{documentation.fr.md}
  en: ~{documentation.en.md}

# Le code
# La signature, un booléen sans paramètre, et le calcul de la clé.
code: ~{source.txt}

# Les propriétés
# Aucune.
properties: { }
```

L'usage est celui d'une fonction du type, dans toute expression. Une
règle de validation l'appelle, et le projet choisit la sévérité : un
livre ancien porte parfois une clé mal imprimée, la règle demande
confirmation plutôt que de bloquer.

```yaml
# La cohérence des données
validation:
  # La clé de l'ISBN est juste ; une clé fausse se confirme
  - rule: check(isbn)
    severity: confirm
    message: La clé de contrôle de l'ISBN {isbn} est fausse.
```
