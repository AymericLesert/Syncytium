# Le langage d'expression

> **Le langage d'expression** est la langue unique des formules : les
> calculs, les validations, les filtres, les gabarits
> ([glossaire](../../glossaire.md)).

Une valeur peut se calculer, se vérifier ou se transformer. Syncytium le
dit dans une seule langue, partout (D90). Ce chapitre dit où elle
s'emploie, comment s'écrit une expression, ce qu'on fait d'une
collection, et quelles fonctions existent. Ce qu'un type porte en propre
reste à sa fiche, dans [le modèle](../modele/types.md) (D1583). Les
décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

1. **Le langage** — ci-dessous : où il s'emploie, ses mots, ses
   garde-fous.
2. **[L'écriture d'une expression](ecriture.md)** — les littéraux, les
   opérateurs et leur priorité, la conversion, le conditionnel, le
   `select`, le nul, le gabarit.
3. **[Les collections](collections.md)** — les fonctions d'agrégation,
   l'appartenance, la projection, les opérations ensemblistes, l'accès
   par la clé.
4. **[Le catalogue des fonctions](fonctions.md)** — les fonctions du
   texte, les fonctions libres et l'arrondi, les valeurs nommées, la
   fonction définie.

## Où il s'emploie

Le même langage sert partout où une valeur se calcule ou se vérifie :

- **les calculs**, `formula:` ;
- **les validations**, `validation:` ;
- **les filtres**, `filter:` ;
- **les normalisations**, `normalize:` ;
- **les règles de migration**, les `fields:` d'une règle ;
- **les conditions**, `if`, `when:`.

L'entrepôt en montre deux, un calcul sur le niveau de stock et une
validation sur l'article :

```yaml
# Le niveau sous son minimum : un calcul, qui ne joue que si le minimum est posé
sous_minimum:
  type: boolean
  formula: quantite < stock_minimum if stock_minimum is not null

# Les bornes du stock de l'article : une validation, entre deux champs qui peuvent manquer
validation:
  - rule: stock_maximum >= stock_minimum if stock_maximum is not null and stock_minimum is not null
```

## Les mots du langage

Quelques mots désignent ce qui entoure l'expression. Leur sens dépend de
l'endroit où elle s'écrit :

- **`me`** désigne ce que l'expression qualifie (D872, D822, D396) :
  - la valeur, dans une normalisation : `normalize: trim(me)` ;
  - l'enregistrement, dans une règle de migration ;
  - l'enregistrement d'origine, dans le filtre d'une référence ;
- **`owner`** désigne le possesseur d'une composition :
  `owner.km_initial` (D760, D841) ;
- **`context`** désigne le contexte courant : `context.now`,
  `context.today`, `context.user`, `context.settings.<nom>` (D254, D575,
  D588) ;
- **`connector`** et **`cache`** servent dans une règle de migration :
  la ligne lue, le rapprochement de deux règles (D821, D845).

## L'expression multivaluée

Une expression ne rend pas toujours une seule valeur. Elle peut rendre un
enregistrement de valeurs nommées (D92). Une expression régulière à
groupes nommés en est l'exemple : chaque groupe est une valeur, lue au
point (D593, D817). Une transformation se lit alors comme une carte des
entrées nommées vers les sorties nommées. Renommer, éclater ou fusionner
des champs en sont des cas.

## Les garde-fous

Le type de chaque expression se calcule à l'ingestion, de la feuille à la
racine (D581). Une erreur de type est donc une erreur d'ingestion, jamais
une erreur à l'exécution.

Rien n'échoue en silence. Quand une expression échoue à l'exécution, la
suite dépend de l'endroit où elle s'emploie (D304) :

- **dans une migration**, la valeur de substitution déclarée la remplace
  (D13) ;
- **dans un champ calculé**, le champ vaut nul, et l'échec est tracé ;
- **dans une validation**, la règle n'est pas satisfaite, et l'échec est
  tracé.

Trois règles complètent les garde-fous :

- **le déterminisme** n'est exigé que pour les migrations : leur
  exécution à blanc doit se rejouer à l'identique (D311) ; partout
  ailleurs, aucune restriction ;
- **une fonction est simple ou complexe**, une propriété du catalogue
  (D104, D306) ; seule une fonction complexe porte un délai d'exécution
  paramétrable ;
- **aucune conversion n'est silencieuse** : la conversion sûre est
  implicite, la conversion faillible échoue proprement (D312).

## Les décisions

Ce chapitre repose sur les décisions de la famille « le langage
d'expression », relues le 31/10/2026 (D1584). Elles sont 77 au registre :
D35–D36, D90, D92, D104, D158, D254, D301–D312, D571, D575–D584, D587, D593,
D659, D760, D817–D818, D833, D838, D841–D842, D872, D887–D889, D891, D934,
D971, D1002, D1015, D1017, D1106, D1109–D1110, D1551, D1564, D1566–D1587.
Chacune se lit dans [le registre](../../conception.md).
