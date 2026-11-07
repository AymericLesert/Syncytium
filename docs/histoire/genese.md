# La genèse

*Cette page de l'histoire remonte avant le 12 juin 2026. Syncytium est la
troisième écriture d'une même conviction : une application se décrit,
elle ne se code pas. La première écriture date de 1994, un système de
gestion de bases de données en C et son dictionnaire en texte. La
deuxième date de 2016, un classeur Excel qui génère une application
entière. Entre les deux, la conviction s'est écrite dans des projets
professionnels, dont la page ne garde que le résumé (D1782). L'auteur a versé les pièces de 1994 et 1995 dans le dépôt le
7 novembre 2026 (D1781). La lecture qui en est faite ici est celle de
Claude ; les mots de l'auteur sont cités entre guillemets.*

## Le sommaire

- [Trois écritures d'une conviction](#trois-écritures-dune-conviction)
- [1994 — un système de gestion de bases de données en C](#1994--un-système-de-gestion-de-bases-de-données-en-c)
  - [Le dossier](#le-dossier)
  - [Les feuilles de travail](#les-feuilles-de-travail)
  - [Ce que le dossier pose déjà](#ce-que-le-dossier-pose-déjà)
- [1995 — la collection d'étiquettes de vin](#1995--la-collection-détiquettes-de-vin)
- [Entre les deux, les écritures professionnelles](#entre-les-deux-les-écritures-professionnelles)
- [2016 — le classeur qui génère une application](#2016--le-classeur-qui-génère-une-application)
- [Ce que Syncytium en garde](#ce-que-syncytium-en-garde)
- [Les pièces](#les-pièces)

## Trois écritures d'une conviction

| Quand | Quoi | La description |
|-------|------|----------------|
| 1994–1996 | un noyau de SGBD relationnel en C, pour les « petites bases » | un dictionnaire en texte, `nom.PRJ`, et des feuilles de travail papier |
| 1996–2016 | quatre projets professionnels : l'acquisition agnostique, les ticks de tous les marchés, les prix de clôture, le DataWareHouse autodocumenté | des règles écrites, un modèle de données générique, des hooks |
| 2016 | un classeur Excel qui génère une application entière, quarante-six tables, toujours en production | une feuille par table : module, intitulé, écran, panneaux, champs typés, libellés |
| 2026 | Syncytium, un moteur piloté par la description | un dossier de fichiers YAML, `syncytium.yml` et ses renvois |

Le public ne change pas d'une écriture à l'autre : la très petite
structure, le cas modeste, le besoin réel. En 1994, le dossier cite « une
collection d'étiquettes de vin » et « une gestion de devis ». En 2026,
les cas d'usage vont du tiny à l'entrepôt d'une entreprise industrielle.

## 1994 — un système de gestion de bases de données en C

L'auteur en dit : « Je te pousse mes travaux dont la première rédaction a
été réalisée en février 1994 ». Le dossier porte lui-même ses dates : les
unités C sont datées du 17 mars au 9 septembre 1994, la version 1.0 du
1er juin 1995. Les PDF ont été tirés de Word en mai 2003.

### Le dossier

« Système de Gestion de Bases de Données Relationnelles — Version 1 »,
quatre-vingt-quinze pages. Il alterne l'analyse et le code : chaque
partie expose une notion en quelques pages, puis donne l'unité C qui la
réalise, avec le contrat de chaque fonction et ses codes d'erreur.

Le produit visé est « le noyau d'un système de gestion de bases de
données (SGBD) de type relationnel », à destination « d'un programmeur
utilisant un compilateur C ou C++ ». Ses limites sont dites d'emblée :
32 000 enregistrements par table, 99 tables, 99 clés et 99 champs,
30 Ko de mémoire au plus, les données sur disque. Il se veut portable,
« MS-DOS, Linux, Unix, OS/2 et Windows ».

Les parties, dans l'ordre du dossier :

- la gestion d'une application : sa création, son arborescence, ses deux
  mots de passe, son ouverture et sa fermeture ;
- le dictionnaire : un fichier `.PRJ`, « séquentiel en mode ASCII de type
  texte lisible et compréhensible », relu et vérifié ligne à ligne à
  l'ouverture ;
- la modification du schéma : les tables, les clés, les champs, leurs
  paramètres ; chaque champ stocké à part avec son index ;
- la manipulation des données : le niveau du champ, interne, et le niveau
  de l'enregistrement, visible ; le formatage à l'entrée et les codes de
  sortie ;
- les variables : globales à l'application, préfixées de `&`, pour
  « rendre une requête dynamique » ;
- les outils mathématiques : les nombres stockés en chaînes, le calcul
  à précision bornée par la mémoire ;
- l'interrogation : une grammaire proche du SQL, un arbre de résolution,
  l'optimisation par tautologies et antilogies.

### Les feuilles de travail

« Feuille de travail du SGBD », six pages à remplir à la main, en quatre
parties :

- la déclaration des tables et des champs : nom, nature (clé croissante,
  décroissante, aléatoire, ou champ), type (C, N, R, D, M), taille,
  décimales, domaine, référence ;
- la déclaration des variables ;
- la déclaration des requêtes : nom, texte, commentaire, prescan ;
- les formats d'écran : la fenêtre, le titre, le type d'écran (saisie,
  résultat, impression, mise à jour), puis les boutons, les conditions
  « immédiates ou finales » avec leur message d'erreur, les fonctions de
  l'écran, et les champs avec leur position, leur séquencement et leur
  alignement.

La description précède le code. L'écran est décrit sur une feuille avant
d'exister.

### Ce que le dossier pose déjà

Quelques choix du dossier, cités dans ses mots.

- **Le dictionnaire est la source.** « Le dictionnaire est l'organe
  principal d'un S.G.B.D. ». Il est en texte, « lisible et compréhensible
  pour ceux qui connaissent les différents éléments qui le composent ».
- **La relecture ne laisse rien passer.** À l'ouverture, « il ne faudra
  rien laisser au hasard car il faut éviter au maximum la corruption de
  l'architecture et par conséquent, la corruption des données ».
- **Un type porte son domaine.** Chaque type a une expression régulière :
  `[\+\-0-9]*` pour le numérique, `[0-9]{4}[01][0-9][0-3][0-9]` pour la
  date. La valeur est formatée à l'entrée et rendue selon un code de
  sortie.
- **Deux mots de passe.** L'un pour « les modifications de structures »,
  l'autre pour « l'accès aux données ». Celui qui décrit et celui qui
  saisit ne sont pas la même personne.
- **Ne jamais perdre une donnée.** « Toutes les modifications physiques
  des données se feront par des fichiers temporaires qui seront validés
  seulement à la fin de la mise à jour. » Un enregistrement supprimé passe
  à l'état passif : « il pourra être récupéré ».
- **Un arbitrage motivé.** « Je préfère perdre du temps dans la
  sauvegarde des informations plutôt que dans la recherche de ces
  dernières : Ceci est un choix stratégique. »
- **Le langage se raisonne.** La requête devient un arbre binaire ; les
  `NON` descendent par les lois de Boole ; chaque comparaison se réduit,
  quand l'index le permet, en « Tautologie : toujours vrai » ou
  « Antilogie : toujours faux ».

## 1995 — la collection d'étiquettes de vin

L'auteur en dit : « Je te pousse aussi un exemple de ce que j'avais
produit pour un usage domestique ». L'exemple du dossier est devenu une
application : une collection d'étiquettes de vin, bâtie sur le SGBD entre
mars 1995 et janvier 1996.

Son dictionnaire tient en quarante lignes. En voici le début :

```text
PROJET:Collection d'étiquettes de vin
VARIABLE:NUMERO:C:02:00:*
VARIABLE:CODE_POSTAL:C:05:00:*
VARIABLE:NOM_COMMUNE:C:26:00:*
TABLE01:ETIQUETTE
TABLE01:CLE01:ETIQUETTE_NUMERO:C:N:06:00:[\+\-0-9]*
TABLE01:CHAMP01:ETIQUETTE_VIN:N:C:20:00:*
TABLE01:CHAMP02:ETIQUETTE_ROBE:N:C:07:00:*
```

Quatre tables : l'étiquette, la commune, le département, la nature du
vin. Dix-huit champs pour l'étiquette, dont trois sont des références :
`ETIQUETTE_COMMUNE_CP` renvoie à `COMMUNE_NUMERO`, `ETIQUETTE_DEPARTEMENT`
à `DEPARTEMENT_NUMERO`. Le degré est un réel à deux décimales, l'année un
numérique. Deux requêtes, `TOUTES_ETIQUETTES` et `TOUTES_NATURES`, chacune
dans son fichier texte :

```text
SELECT *
FROM ETIQUETTE;
```

Autour du dictionnaire, trois programmes en C de quelques pages :

- la création, qui déclare les tables, les clés et les champs d'un
  tableau de chaînes, puis pose les références ;
- l'import, qui lit la collection existante dans deux fichiers dBASE
  III+ et la verse dans la base, champ par champ ;
- la maintenance.

La reprise d'un existant est là dès le premier exemple. Le premier
chantier d'une application est de reprendre ce qui existe déjà.

## Entre les deux, les écritures professionnelles

Entre 1996 et 2016, la conviction s'est écrite dans des projets
professionnels. Leurs pièces ne peuvent pas être diffusées : ni le code,
ni les documents, ni les données. L'auteur en autorise le résumé (D1782).
Quatre d'entre eux en gardent la trace.

- **L'acquisition agnostique.** Dans l'automobile, un module acquiert les
  données de production sans dépendre de la machine qui les émet.
- **Le modèle générique des ticks.** Pour des quants, un moteur intègre des
  données tick par tick. Il les nettoie automatiquement, par une analyse
  statistique et par les événements du marché. Il les range dans un modèle
  de données unique, quel que soit le marché, pour les modèles
  mathématiques.
- **Les règles écrites.** Dans le référencement des données de marché, des
  règles écrites rendent le calcul des prix de clôture simple et efficace.
- **Le DataWareHouse autodocumenté.** En finance de marché, un entrepôt de
  données dont la structure documente son propre fonctionnement, construit
  sur des « hooks » pour intégrer des sources hétérogènes.

Ce que Syncytium en garde : le connecteur qui ne dépend pas de sa source,
les règles et les opérations qui nettoient, le modèle piloté par la
description, le langage de règles, la documentation comme facette, et le
mot « hook ».

## 2016 — le classeur qui génère une application

Vingt ans plus tard, la même conviction change de support. Un classeur
Excel décrit une application complète, une feuille par table : le module,
l'intitulé, la page de documentation, la boîte d'écran, les panneaux, les
champs typés, le requis, l'unique, le défaut, le visible, le filtre,
l'index, les libellés en deux langues. Le classeur génère le code. Quatre
applications en sont sorties depuis 2016 ; l'une d'elles, quarante-six
tables, est toujours en production.

Ce classeur est l'ancêtre direct de Syncytium. Il a montré qu'une
description suffit à produire une application. Il a montré aussi sa
limite : le code généré se reprend à la main, et la description ne vit
pas avec l'application. Syncytium répond aux deux : le moteur lit la
description, il ne génère pas de code ; la description est la version.

## Ce que Syncytium en garde

| 1994–2016 | 2026 |
|-----------|------|
| le dictionnaire `.PRJ`, en texte lisible, relu à l'ouverture | la configuration YAML, ingérée et vérifiée, une erreur d'ingestion refuse la version |
| un type, une taille, des décimales, un domaine en expression régulière | les types du socle, leur signature, leurs réglages, la surcharge au champ |
| la nature « référence » d'un champ | les liens entre entités |
| les variables `&`, globales | les paramètres et le langage d'expression |
| deux mots de passe, la structure et les données | le concepteur, qui écrit la configuration, et les degrés des usagers |
| les fichiers temporaires validés à la fin, le passif récupérable | la transaction tenue ouverte, l'historisation |
| la feuille de travail des formats d'écran | les composants décrits dans la configuration |
| l'import depuis dBASE III+ | la reprise et le mapping, chapitre 8 |
| « une collection d'étiquettes de vin », « une gestion de devis » | les cinq cas d'usage, du tiny à l'entrepôt |
| l'acquisition des données de production, agnostique | les connecteurs, indépendants de leur source |
| le nettoyage des ticks par l'analyse statistique et les événements du marché | les règles de validation et les opérations |
| un modèle de données unique pour les ticks de tous les marchés | le modèle piloté par la description |
| des règles écrites pour les prix de clôture | le langage de règles |
| un DataWareHouse autodocumenté, construit sur des hooks | la documentation comme facette de chaque composant ; les hooks |

Trente-deux ans séparent les deux colonnes. Les mots ont changé, la ligne
non.

## Les pièces

Le dossier [`genese/`](genese/) tient les documents versés par l'auteur
le 7 novembre 2026 (D1781) :

- [`1994-sgbdr.pdf`](genese/1994-sgbdr.pdf) : le dossier, 95 pages ;
- [`1994-feuilles-de-travail.pdf`](genese/1994-feuilles-de-travail.pdf) :
  les feuilles de travail, 6 pages ;
- [`1995-etiquettes.prj`](genese/1995-etiquettes.prj) : le dictionnaire
  de la collection d'étiquettes de vin, converti en UTF-8 ;
- [`1995-etiquettes-creation.c`](genese/1995-etiquettes-creation.c) : le
  programme de création de la base, converti en UTF-8.

Les exécutables, les fichiers de données et les images de l'application
de 1995 restent hors du dépôt.
