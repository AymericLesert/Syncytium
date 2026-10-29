# La version — ce qu'elle porte

*Les sous-chapitres 3.5 à 3.9 de l'[arbre](arbre.md) : les réglages, les
groupes, le module et son menu, l'entité, les hooks et la reprise.*

## 3.5 `settings.yml` — la maison des types et des réglages (D359, D360, D991–D993)

Les settings règlent les défauts. Ils se structurent en trois niveaux
(D1239) : le type de composant, puis le composant, puis la propriété.

```yaml
field:                               # le type de composant
  text:                              # le composant : un type du catalogue, ses défauts
    normalize: trim(me)              # la normalisation à la frontière (D870/D872)
  date_pmi:                          # un dérivé (D359/D992) : la base et ses défauts
    type: date
    mask: "yyyymmdd"
  amount:
    currency: EUR                    # la devise par défaut — amount(v) à un argument (D993)
  nom:                               # un dérivé porteur de sens (D1178) : le champ `nom: nom` hérite du marquage
    type: text[..40]
    rgpd: personal

entity:
  history: true                      # l'historisation par défaut pour toute l'application (D1174)
```

### Les types et les dérivés

Sous `field:`, la clé est le nom d'un type :

- sans `type:`, elle règle les défauts d'un type du catalogue ;
- avec `type:`, elle définit un dérivé, qui hérite de sa base et
  surcharge ce qu'il nomme ;
- le dérivé d'un dérivé se résout à l'ingestion ; un cycle est une
  erreur ;
- un dérivé ne redéfinit jamais un type du catalogue (D408) ;
- un dérivé s'emploie par la forme courte, `date_creation: date_pmi`.

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
marge: 10%                           # la forme courte, sans paramètre connu : texte, statique (D590)
taux:                                # la forme longue (D588–D589)
  mode: dynamic                      # surchargeable à chaud par l'administration
  type: decimal
  value: 20
counter:
  reset: never                       # un paramètre du socle surchargé : son mode et son type sont connus
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
production:
  label: { fr: Production }
  description: { fr: Les opérateurs et la préparation — … }
direction:
  label: { fr: Direction }
  groups: [production, commercial, achats]   # un membre de la direction voit ce que voient ces groupes (D414/D1099)
administration:
  degree: administrator                      # le degré porté par le groupe (D699/D701)
```

La hiérarchie est sans lien parent et acyclique. Les affectations des
personnes aux groupes vivent en base, pas dans la configuration (D27,
D341). Le détail dans [rights.md](../../rights.md).

## 3.7 Le module — `<module>.yml` (D765, D416)

Un module regroupe des entités. Son fichier les déclare, et porte ses
droits, son menu, ses réglages, ses ressources et ses tableaux de bord.

```yaml
name: technique                      # l'invariant, quelle que soit la langue (D1120)
title: Technique                     # le nom d'usage, par langue (D1120) — sans lui, le name
description: Les données techniques — …
allow:                               # la cascade de l'allow (D886) — ici, l'entrepôt en lecture seule
  create: false
  update: false
  delete: false
entities:                            # la liste explicite (D765)
  - ~{article/article.yml}
  - ~{nomenclature/nomenclature.yml}
menu: ~{menu.yml}                    # optionnel (D351) — sans lui, le défaut ; la forme ci-dessous (D1237)
settings: ~{settings.yml}            # l'étage module de la cascade (D359)
resources: ~{resources/resources.yml}   # les ressources attachées au module (D1530 ; la déclaration, ma lecture)
dashboards: …                        # les tableaux de bord du module (composants.md)
```

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

Un sous-menu porte `items:`, la carte de ses entrées. L'exemple de la
banque (le cas 4), le premier au dépôt (D1230) :

```yaml
# banque/menu.yml
accueil:
  label: { fr: Tableau de bord, en: Dashboard, es: Panel de control }
  link: banque[accueil]              # le tableau de bord du module
comptes:
  label: { fr: Comptes bancaires, en: Accounts, es: Cuentas bancarias }
  link: banque.compte                # la liste par défaut de l'entité
ecritures:                           # un sous-menu : une entrée par liste
  label: { fr: Écritures, en: Entries, es: Apuntes }
  items:
    operations:
      link: banque.ecriture[par_operation]   # sans label: — le titre de la liste
    rapprochement:
      link: banque.ecriture[pointage]
referential:                         # un sous-menu sans label: — son nom nu
  items:
    budgets:
      link: banque.budget
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
