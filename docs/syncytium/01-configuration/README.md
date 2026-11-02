# La configuration de Syncytium — la syntaxe

Une application Syncytium n'a pas de code. Elle a une **configuration** :
des fichiers texte qui décrivent ses données, ses écrans, ses règles et
ses environnements. Le moteur lit ces fichiers et fait le reste.

Ce chapitre dit **la forme** de cette configuration : le format, les
mécanismes qui reviennent partout, l'arbre des fichiers et ce que chacun
porte. Le sens de chaque élément vit dans son propre chapitre : l'entité
et les champs, les types, les composants, les hooks, les connecteurs, la
reprise, les droits, l'administration, la sécurité, la documentation. Les
décisions citées entre parenthèses renvoient au
[registre](../../conception.md).


## Le sommaire

1. [La nature — YAML, de petits fichiers, une seule grammaire](#1-la-nature--yaml-de-petits-fichiers-une-seule-grammaire)
   - [Du YAML, et rien d'autre](#du-yaml-et-rien-dautre)
   - [De petits fichiers plutôt qu'un seul](#de-petits-fichiers-plutôt-quun-seul)
   - [Deux langues, chacune à sa place](#deux-langues-chacune-à-sa-place)
   - [Une description partout](#une-description-partout)
   - [Le dépôt du client](#le-dépôt-du-client)
   - [Le core en tête](#le-core-en-tête)
   - [Les règles d'écriture face à YAML](#les-règles-décriture-face-à-yaml)
   - [Les règles d'écriture des exemples](#les-règles-décriture-des-exemples)
2. [Les mécanismes transverses](02-mecanismes.md)
   - [2.1 La référence de fichier — `~{<fichier>}` (D956)](02-mecanismes.md#21-la-référence-de-fichier--fichier-d956)
   - [2.2 Le pattern — la liste par expression régulière (D806)](02-mecanismes.md#22-le-pattern--la-liste-par-expression-régulière-d806)
   - [2.3 Le cumul de fichiers sous une carte (D968)](02-mecanismes.md#23-le-cumul-de-fichiers-sous-une-carte-d968)
   - [2.4 Les variables — `${…}` (D321)](02-mecanismes.md#24-les-variables---d321)
   - [2.5 La marque `*` — la clé confidentielle (D944)](02-mecanismes.md#25-la-marque---la-clé-confidentielle-d944)
   - [2.6 L'adressage logique — le point (D363)](02-mecanismes.md#26-ladressage-logique--le-point-d363)
   - [2.7 Le langage d'expression dans les valeurs (D90–D92)](02-mecanismes.md#27-le-langage-dexpression-dans-les-valeurs-d90d92)
   - [2.8 La forme courte et le bloc (D356)](02-mecanismes.md#28-la-forme-courte-et-le-bloc-d356)
   - [2.9 Les deux formes d'une collection — la liste et la substitution (D1113)](02-mecanismes.md#29-les-deux-formes-dune-collection--la-liste-et-la-substitution-d1113)
   - [2.10 Les défauts du poste informatique (D1114)](02-mecanismes.md#210-les-défauts-du-poste-informatique-d1114)
3. [L'arbre](03-arbre.md)
   - [3.1 `syncytium.yml` — le projet](03-arbre.md#31-syncytiumyml--le-projet)
   - [3.2 `environments/` — la configuration technique commune (D325, D342)](03-arbre.md#32-environments--la-configuration-technique-commune-d325-d342)
   - [3.3 `versions/` — le cycle de vie en dossiers](03-arbre.md#33-versions--le-cycle-de-vie-en-dossiers)
   - [3.4 `version.yml` — l'entrée de la version](03-arbre.md#34-versionyml--lentrée-de-la-version)
4. [La version — ce qu'elle porte](04-version.md)
   - [3.5 `settings.yml` — la maison des types et des réglages (D359, D360, D991–D993)](04-version.md#35-settingsyml--la-maison-des-types-et-des-réglages-d359-d360-d991d993)
   - [3.6 `groups.yml` — les groupes (D414)](04-version.md#36-groupsyml--les-groupes-d414)
   - [3.7 Le module — `<module>.yml` (D765, D416)](04-version.md#37-le-module--moduleyml-d765-d416)
   - [3.8 L'entité, les champs, les surfaces](04-version.md#38-lentité-les-champs-les-surfaces)
   - [3.9 `hooks/` — le mécanisme des hooks](04-version.md#39-hooks--le-mécanisme-des-hooks)
   - [3.10 `reprise/` — la reprise de données](04-version.md#310-reprise--la-reprise-de-données)
5. [L'inventaire des défauts du socle](05-defauts.md)
   - [Les décisions de l'inventaire](05-defauts.md#les-décisions-de-linventaire)
   - [Le bloc `rgpd:` des settings (D1323)](05-defauts.md#le-bloc-rgpd-des-settings-d1323)
   - [Hors de l'inventaire](05-defauts.md#hors-de-linventaire)
6. [Les règles](06-regles.md)
   - [4. Les cascades — le plus proche l'emporte](06-regles.md#4-les-cascades--le-plus-proche-lemporte)
   - [5. L'ingestion — ce qui est refusé](06-regles.md#5-lingestion--ce-qui-est-refusé)
7. [Les décisions](#les-décisions)

## 1. La nature — YAML, de petits fichiers, une seule grammaire

### Du YAML, et rien d'autre

La configuration s'écrit en YAML (D320). Syncytium n'invente pas de
format : il emprunte la syntaxe YAML et s'en tient à elle. Un éditeur de
texte suffit, et tout outil qui lit du YAML lit une configuration.

Le fichier est une **enveloppe** (D327). Le moteur le lit, le convertit
en logique interne, puis le laisse inerte. Il ne réécrit jamais un
fichier du concepteur (D331, D332). Les commentaires restent. Le dépôt se
compare, version après version, comme n'importe quel code.

### De petits fichiers plutôt qu'un seul

La description se découpe en fichiers et en dossiers (D323). Toute valeur
peut être écrite en place, ou remplacée par la référence d'un fichier qui
la contient (D320, D767). C'est la clé `~{…}` du chapitre des
[mécanismes](02-mecanismes.md).

```yaml
# Les champs de l'entité, écrits en place
fields:
  nom: text[..40]
  prenom: text[..40]
```

```yaml
# Les mêmes champs, dans un fichier à côté de l'entité
fields: ~{fields.yml}
```

Les deux écritures se valent. La première convient à une petite entité.
La seconde garde lisible une entité de quarante champs. Ce qui se répète
s'écrit une fois : par les variables (D321), ou par un fichier référencé
depuis plusieurs endroits (D956, D967).

### Deux langues, chacune à sa place

La structure est en anglais, le métier dans la langue du modèle (D335).
En anglais : les noms de dossiers et de fichiers, les propriétés, et les
valeurs du catalogue, les types, `public`, `protected`, `private`,
`write-once` (D358). Dans la langue du modèle : les noms des entités et
des champs, et les libellés, écrits par langue.

```yaml
# L'entité, nommée dans la langue du modèle
personne:
  description: Les membres de l'entreprise

  # Les champs : le nom dans la langue du modèle, le type et les propriétés en anglais, le libellé par langue
  fields:
    nom:
      type: text[..40]
      label: { fr: Nom, en: Last name }
```

### Une description partout

Tout élément porte sa `description:` (D810), en ligne ou par fichier.
Ces descriptions sont le carburant de la documentation que Syncytium
génère (D333, D645). Une entité sans description se lit, mais sa
documentation reste muette.

### Le dépôt du client

Le dépôt du client est distinct du projet Syncytium (D336). Le projet
embarque `template/`, un « Hello world ! » clonable pour démarrer (D337).
Le cas 1, [le tiny](../../../usecases/01_tiny.md), en est la forme la
plus courte : une entité, quatre champs, une application complète.

### Le core en tête

La première clé de `syncytium.yml` nomme le core de Syncytium qui
interprète la description (D322, D1083, D1361). L'entrepôt l'écrit
ainsi :

```yaml
# Le format de la configuration
# La version de la grammaire que parle ce projet : un moteur qui ne la connaît pas refuse le projet à la lecture de
# cette seule ligne ; un format plus ancien est converti à l'ingestion.
from: Syncytium-1.0
```

`syncytium init` lit cette clé et récupère ce core (D1358, D1360). Un
core plus récent sait lire les descriptions du précédent : la conversion
se fait à l'ingestion (D331). L'inverse est refusé : un format plus
récent que le moteur est rejeté sur la seule lecture de cette ligne
(D330).

### Les règles d'écriture face à YAML

La grammaire des expressions, `text[..40]`, `sens.select(…)`, une
expression régulière, vit dans des scalaires YAML. Deux règles la
protègent (D892).

**Première règle : les guillemets quand YAML l'exige, et seulement
alors.** Trois cas l'exigent : un crochet de la grammaire à l'intérieur
d'une accolade ou d'un crochet YAML, un `: ` à l'intérieur d'une
expression, une expression régulière. On emploie alors les guillemets
simples, qui prennent tout tel quel.

```yaml
# Un crochet de la grammaire dans une accolade YAML : les guillemets simples
code: { type: 'text[..100]' }

# Un « : » dans une expression : les guillemets simples
mouvement: 'sens.select(entree: quantite, sortie: -quantite)'

# Une expression régulière : les guillemets simples, tout est pris tel quel
pattern: '^(?<prefix>[A-Z]{2})…$'
```

**Seconde règle : la forme bloc de préférence.** Quand la forme en flux
imposerait des guillemets, on écrit en bloc : `fields:` en bloc, `items:`
en liste à tirets, la longue formule en scalaire `>-`. En bloc, une
valeur par ligne, la grammaire s'écrit nue.

```yaml
# Les champs en bloc : une valeur par ligne, la grammaire nue
fields:
  libelle: text[..30]

  # Le total : une formule longue, en scalaire bloc
  total:
    formula: >-
      quantite * prix_unitaire
      - remise
```

Chaque exemple du dépôt passe un analyseur YAML avant validation.

### Les règles d'écriture des exemples

Un fichier d'exemple se lit comme une page (D1084). Avant chaque clé, une
courte introduction dit sa nature. Puis, si ce n'est pas trivial, ce que
la clé apporte. Le commentaire est collé à sa clé ; une ligne vide sépare
deux clés. L'entrepôt commence ainsi :

```yaml
# Les environnements d'exécution
# Chaque environnement porte ses connecteurs, sa journalisation, son
# nettoyage et ses réglages ; rien ne se déduit de l'arborescence, la
# déclaration fait foi.
environments: ~{environments/environments.yml}

# Le nom du projet
name: entrepot
```

Trois règles complètent la forme :

- **aucune référence de décision dans la configuration** (D1085) : les
  décisions disent le cheminement, la configuration dit la finalité et
  l'usage ;
- **une ligne de 120 caractères au plus** (D1097) : le commentaire garde
  sa nature sur sa première ligne, son apport se replie sur les
  suivantes ;
- **les sous-clés qui se répètent à l'identique** d'un frère à l'autre,
  le `type` et la `class` des connecteurs, le `level` et les `groups` des
  profils, **s'expliquent une fois, sur le bloc parent** (D1098), et
  s'écrivent alors serrées, sans ligne vide.

Les exemples de cette documentation suivent les mêmes règles (D1545).

## Les décisions

Ce chapitre repose sur les décisions de la famille « la configuration et son
écriture », relues le 29/10/2026 (D1540). Elles sont 96 au registre :
D116–D117, D217, D219, D320–D321, D323, D327, D332, D335, D337, D339,
D346–D349, D352, D363, D365, D408, D410, D588, D590–D591, D707, D726, D762,
D764–D768, D799, D802, D816, D825, D892–D893, D944, D967, D994, D1069,
D1071, D1074–D1075, D1082–D1086, D1088–D1092, D1094–D1098, D1101,
D1113–D1115, D1151, D1174–D1175, D1181, D1239, D1291, D1355, D1361, D1384,
D1427–D1428, D1444, D1465–D1466, D1473–D1474, D1498, D1500, D1511–D1513,
D1517, D1528–D1532, D1535–D1538, D1541. Chacune se lit dans [le
registre](../../conception.md). Le mécanisme des hooks, § 3.9 de
[04-version.md](04-version.md), repose sur les décisions de la famille des
hooks (D1692) ; elles rejoindront cette liste à la dissolution de
`hooks.md` (D1673).
