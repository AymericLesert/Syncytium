# La version — ce qu'elle porte

*Les sous-chapitres 3.5 à 3.9 de l'[arbre](arbre.md) : les réglages, les
groupes, le module et son menu, l'entité, les hooks et la reprise.*

## 3.5 `settings.yml` — la maison des types et des réglages (D359, D360, D991–D993)

Les settings règlent les défauts. Ils se structurent en trois niveaux
(D1239) : le type de composant, puis le composant, puis la propriété.

```yaml
# Les champs : les défauts des types du catalogue et les types dérivés
field:
  # Le texte : la normalisation à la frontière, pour tous les champs de ce type
  text:
    normalize: trim(me)

  # Une date au masque de l'ERP : un type dérivé, sa base et ses défauts
  date_pmi:
    type: date
    mask: "yyyymmdd"

  # Le montant : la devise par défaut
  amount:
    currency: EUR

  # Le nom d'une personne : un dérivé qui porte le marquage RGPD ; tout champ de ce type en hérite
  nom:
    type: text[..40]
    rgpd: personal

# Les entités : l'historisation par défaut pour toute l'application
entity:
  history: true
```

### Les types et les dérivés

Sous `field:`, la clé est le nom d'un type :

- sans `type:`, elle règle les défauts d'un type du catalogue ;
- avec `type:`, elle définit un dérivé, qui hérite de sa base et
  surcharge ce qu'il nomme (D359, D992) ;
- le dérivé d'un dérivé se résout à l'ingestion ; un cycle est une
  erreur ;
- un dérivé ne redéfinit jamais un type du catalogue (D408) ;
- un dérivé s'emploie par la forme courte, `date_creation: date_pmi` ;
- un dérivé porteur de sens transmet son marquage, `nom: nom` hérite du
  `rgpd: personal` (D1178) ; la normalisation (D870, D872), la devise
  (D993) et l'historisation (D1174) se règlent de même.

### La cascade

Les settings se lisent du plus loin au plus près (D359, D360, D588) :
`settings.yml` de la version, puis `settings:` du module, puis
`settings:` de l'entité. Le plus proche l'emporte. Le champ garde le
dernier mot, par ses propriétés directes.

### La règle des paramètres (D1535)

Un hook décrit par son contrat la liste de ses paramètres : le mode, le
nom, le type, la valeur par défaut. Ce sont les `properties` de sa fiche
(D809). Le socle a les siens, décrits par Syncytium : l'inventaire est
dans [defauts.md](defauts.md). Trois cas se présentent.

- **Un paramètre connu, surchargé par la configuration**, exploite les
  informations connues du paramètre : seule la valeur se réécrit.
- **Un paramètre surchargé d'un autre paramètre**, d'un étage à l'autre
  de la cascade, exploite les propriétés du rang précédent.
- **Un paramètre rattaché à aucun paramètre existant**, en forme courte,
  est une valeur texte et statique (D590). La forme longue dit tout
  (D588, D589) : `mode:`, `dynamic` surchargeable à chaud par
  l'administration ou `static` ; `type:`, texte par défaut ; `value:`,
  la valeur par défaut.

```yaml
# La marge : un paramètre libre en forme courte, texte et statique
marge: 10%

# Le taux : un paramètre libre en forme longue, décimal, surchargeable à chaud par l'administration
taux:
  mode: dynamic
  type: decimal
  value: 20

# Le compteur : un paramètre du socle surchargé ; son mode et son type sont connus, seule la valeur s'écrit
counter:
  reset: never
```

### La règle des défauts (D1175)

Toute valeur ou tout statut par défaut de Syncytium se surcharge dans
les settings. Les types (D359), le `reset:` du compteur (D409),
`normalize:` (D870), les paramètres (D588, D1535), `history:` (D1174)
sont les cas d'un seul principe.

- La clé porte le nom de la propriété réglée, sous le nom du type quand
  c'est une propriété de type.
- Un défaut est statique dès qu'il engage le stockage ou la structure,
  dynamique sinon.
- Une clé qui ne nomme aucun défaut connu est une erreur d'ingestion
  (D311).

## 3.6 `groups.yml` — les groupes (D414)

Un groupe est une clé. Il porte son libellé, sa description, les groupes
qu'il voit, et son degré.

```yaml
# La production : les opérateurs et la préparation
production:
  label: { fr: Production }
  description: { fr: Les opérateurs et la préparation des commandes }

# La direction : elle voit ce que voient la production, le commercial et les achats
direction:
  label: { fr: Direction }
  groups: [production, commercial, achats]

# L'administration : le degré porté par le groupe
administration:
  degree: administrator
```

La hiérarchie est sans lien parent et acyclique ; un membre d'un groupe
voit ce que voient les groupes qu'il nomme (D414, D1099). Le degré est
porté par le groupe (D699, D701). Les affectations des personnes aux
groupes vivent en base, pas dans la configuration (D27, D341). Le détail
dans [rights.md](../../rights.md).

## 3.7 Le module — `<module>.yml` (D765, D416)

Un module regroupe des entités. Son fichier les déclare, et porte ses
droits, son menu, ses réglages, ses ressources et ses tableaux de bord.

```yaml
# Le nom du module : l'invariant, quelle que soit la langue
name: technique

# Le nom d'usage, par langue ; sans lui, le nom
title: Technique

# La description du module
description: Les données techniques de l'ERP, standardisées

# Les droits du module : l'entrepôt est en lecture seule, les entités en héritent
allow:
  create: false
  update: false
  delete: false

# Les entités du module, en liste explicite
entities:
  - ~{article/article.yml}
  - ~{nomenclature/nomenclature.yml}

# Le menu du module ; sans lui, le défaut
menu: ~{menu.yml}

# Les réglages du module : l'étage module de la cascade
settings: ~{settings.yml}

# Les ressources attachées au module
resources: ~{resources/resources.yml}
```

Les décisions de ces clés : D1120 pour `name:` et `title:`, D886 pour la
cascade de `allow:`, D765 pour la liste des entités, D351 pour le menu,
D359 pour les réglages, D1530 pour les ressources (la déclaration, ma
lecture). Les tableaux de bord du module, `dashboards:`, sont décrits
dans [composants.md](../../composants.md).

Déclarer un module, c'est l'activer (D350) : présent, il est actif ;
retiré par une nouvelle version, il est désactivé.

### `menu.yml` — une carte d'entrées nommées (D1237)

Le menu est une carte, dans l'ordre d'affichage. Chaque entrée porte son
`label:` par langue et son `link:`, une adresse logique (D439) :

- `<module>.<entité>`, la liste par défaut de l'entité ;
- `<module>.<entité>[<liste>]`, une liste nommée ;
- `<module>.<entité>.<opération>`, une opération ;
- `<module>.<entité>[+<formulaire>]`, une création ;
- `<module>.<entité>[@<wizard>]`, un wizard ;
- `<module>[<dashboard>]`, un tableau de bord du module.

Un sous-menu porte `items:`, la carte de ses entrées. Le menu de la
banque (le cas 4), le premier au dépôt (D1230), tel qu'il est écrit :

```yaml
# Le menu du module : une carte d'entrées nommées, dans l'ordre d'affichage. Chaque entrée porte son libellé par langue
# et son lien, l'adresse ; un sous-menu porte ses entrées. Sans libellé, l'entrée prend le titre de la surface liée.
# Sans menu déclaré, le défaut ne connaît qu'une liste par entité ; les trois listes de l'écriture ont ici chacune leur
# entrée, en sous-menu. Une liste absente du menu et d'un écran n'est documentée nulle part.

# L'accueil du module
accueil:
  label:
    fr: Tableau de bord
    en: Dashboard
    es: Panel de control
  link: banque[accueil]

# Les comptes
comptes:
  label:
    fr: Comptes bancaires
    en: Accounts
    es: Cuentas bancarias
  link: banque.compte

# Les écritures, en sous-menu — une entrée par liste
ecritures:
  label:
    fr: Écritures
    en: Entries
    es: Apuntes
  items:
    operations:
      link: banque.ecriture[par_operation]
    comptable:
      link: banque.ecriture[par_comptable]
    rapprochement:
      link: banque.ecriture[pointage]

# Les référentiels
referential:
  items:
    budgets:
      link: banque.budget
    lieux:
      link: banque.lieu
```

Quatre règles complètent la forme :

- une entrée sans `label:` prend le titre de la surface qu'elle lie ;
- un sous-menu sans `label:` prend son nom nu, et la complétude le
  compte ;
- l'icône vient de la surface visée (D439) ; le dictionnaire `label:` du
  module (D440) ne sert pas au menu ;
- sans menu déclaré, le défaut ne connaît qu'une liste par entité (D351)
  ; le menu est filtré par la confidentialité à l'affichage.

## 3.8 L'entité, les champs, les surfaces

Les mécanismes de ce chapitre s'appliquent tels quels à l'entité :
`fields: ~{fields.yml}`, la forme courte, les facettes en bloc,
l'interpolation des profils de confidentialité, les expressions. Le sens
vit dans trois chapitres :

- l'en-tête de l'entité, `name`, `description`, `label`, `identity`,
  `inheritance`, `states`, `history`, `fields:`, `validation:`,
  `operations:`, `gui:`, `allow:`, dans [entity.md](../../entity.md) ;
- les champs et leurs facettes dans [types.md](../../types.md), dont
  `sort:` et `group:` sur une association dérivée (D1016, D1017) et
  `unit:` sur une mesure empruntée à une référence (D1009) ;
- les surfaces, `lists`, `forms`, `summary`, `widgets`, `wizards`,
  `templates`, et `dashboards` au module, dans
  [composants.md](../../composants.md).

## 3.9 `hooks/` et `reprise/`

### `hooks/`

`hooks.yml` déclare les familles ; chaque famille liste ses fiches par
pattern ; chaque fiche porte `name`, `description` (un fichier md par
langue), `code` (le source) et `properties` (D777, D809). Le détail dans
[hooks.md](../../hooks.md).

### `reprise/`

Le nom est celui du cas 5 ; l'organisation est libre. Trois sortes de
fichiers décrivent une reprise de données :

- `reprise.yml` déclare les migrations (D662) : `from:` la base
  d'origine (D1087), `buffer:` la base miroir (D1045), `storage:` le
  fichier de son détail (D1072), `mode:`, `reset:`, `source:`,
  `mapping:`, `operations:` ;
- `source/<TABLE>.yml` décrit chaque entité d'origine (D947, D966) :
  `name`, `alias`, `filter`, `identity`, `coverage`, `parent`, `fields`,
  `validation` ; une colonne typée `TABLE.colonne` est une référence,
  `TABLE[NOM].colonne` une référence nommée quand l'entité est visée
  plusieurs fois (D995), `A.colonne or B.colonne` une référence à l'une
  de deux entités (D996) ; les calculés de la source s'écrivent en
  `formula:` (D660) ;
- `mapping/NNN_<nom>.yml` écrit chaque règle (D656) : `to`, `filter`,
  `distinct`, `parent`, `fields`, `validation`, `report`, `operations`.

Le détail dans [mapping.md](../../mapping.md). Le pilotage et le suivi,
les passages, les clés d'origine, le modèle lu, les anomalies, sont le
module `_migration` du socle, que l'application n'expose pas (D1028) :
[migration.md](../../migration.md).
