# La version — ce qu'elle porte

*Les sous-chapitres 3.5 à 3.9 de l'[arbre](arbre.md).*

## 3.5 `settings.yml` — la maison des types et des réglages (D359/D360, D991–D993)

**La structure des settings** (D1239 — amende la forme à plat de
D991/D1174) : **le type de composant, puis le composant, puis la
propriété** — `field: { text: { default: "Me" }, integer: { default:
-10 } }`, `entity: { history: true }`. Les paramètres par défaut d'un
type se déclarent sous `field:` et le nom du type ; un type dérivé s'y
déclare de la même façon, avec `type:` sa base (les dérivés sous
`field:` avec les types du catalogue — confirmé, D1239) :

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

- la clé est le nom ; sans `type:`, elle règle les défauts d'un type du
  catalogue ; avec `type:`, elle définit un dérivé qui hérite de sa
  base et surcharge ce qu'il nomme ; le dérivé d'un dérivé se résout à
  l'ingestion (le cycle = une erreur) ; un dérivé ne redéfinit jamais
  un type du catalogue (D408) ; l'usage par la forme courte ;
- **la cascade** (D359/D360/D588) : `settings.yml` de la version
  (l'instance), `settings:` du module, `settings:` de l'entité — **le
  plus proche l'emporte** ; le champ garde le dernier mot ;
- **les paramètres — la règle** (D1535) : un hook décrit par son contrat
  la liste de ses paramètres, le mode, le nom, le type, la valeur par
  défaut (les `properties` de sa fiche, D809) ; le socle a les siens,
  décrits par Syncytium — l'inventaire ci-dessous ; **un paramètre
  surchargé par la configuration exploite les informations connues du
  paramètre**, et un paramètre surchargé d'un autre paramètre, d'un
  étage à l'autre de la cascade, celles du rang précédent — seule la
  valeur se réécrit ; **un paramètre rattaché à aucun paramètre existant,
  en forme courte, est une valeur texte et statique** (D590) ; la forme
  longue dit tout (D588–D589) : `mode:` — `dynamic`, surchargeable à
  chaud par l'administration, ou `static` —, `type:` (texte par défaut)
  et `value:`, la valeur par défaut ;

  ```yaml
  marge: 10%                         # la forme courte, sans paramètre connu : texte, statique (D590)
  taux:                              # la forme longue (D588–D589)
    mode: dynamic                    # surchargeable à chaud par l'administration
    type: decimal
    value: 20
  counter:
    reset: never                     # un paramètre du socle surchargé : son mode et son type sont connus
  ```

- **la règle (D1175) : toute valeur ou tout statut par défaut de
  Syncytium se surcharge dans les settings** — les types (D359), `reset:`
  du compteur (D409), `normalize:` (D870), les profils (D885), les
  paramètres (D588, D1535), `history:` (D1174) sont les cas déjà
  traités d'un seul principe ; la clé porte le nom de la propriété
  réglée, sous le nom du type quand c'est une propriété de type ;
  statique dès que le défaut engage le stockage ou la structure,
  dynamique sinon ; une clé qui ne nomme aucun défaut connu = une
  erreur d'ingestion (D311). **L'inventaire des défauts du socle** — la
  propriété, sa valeur, son étage, statique ou dynamique — se tient
  dans [defauts.md](defauts.md).

## 3.6 `groups.yml` — les groupes (D414)

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

La hiérarchie sans lien parent, acyclique ; les affectations des
personnes vivent en base (D27/D341). Le détail dans
[rights.md](../../rights.md).

## 3.7 Le module — `<module>.yml` (D765, D416)

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

**Déclarer un module, c'est l'activer** (D350) : présent = actif,
retiré = désactivé par une nouvelle version.

**`menu.yml` — une carte d'entrées nommées** (D1237 ; D351, D439) : dans
l'ordre d'affichage, chaque entrée porte son `label:` par langue et
son `link:`, l'adresse logique de D439 — `<module>.<entité>` la liste par
défaut, `[<liste>]` une liste nommée, `.<opération>`, `[+<formulaire>]`,
`[@<wizard>]`, `<module>[<dashboard>]` — ; un sous-menu porte `items:`,
la carte de ses entrées. **Une entrée sans `label:` prend le titre de la
surface qu'elle lie** ; un sous-menu sans `label:` prend son nom nu, et
la complétude le compte ; l'icône vient de la surface visée (D439) ; le
dictionnaire `label:` du module (D440) ne sert pas au menu. Sans menu
déclaré, le défaut ne connaît qu'une liste par entité (D351). Le menu
est filtré par la confidentialité à l'affichage. L'exemple de la banque
(le cas 4), le premier au dépôt (D1230) :

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

## 3.8 L'entité, les champs, les surfaces

L'en-tête de l'entité (`name`, `description`, `label`, `identity`,
`inheritance`, `states`, `history`, `fields:`, `validation:`,
`operations:`, `gui:`, `allow:`) est décrit dans
[entity.md](../../entity.md) ; les champs et leurs facettes dans
[types.md](../../types.md) — dont `sort:` et `group:` sur une association
dérivée (D1016/D1017), `unit:` sur une mesure empruntée à une référence
(D1009) ; les surfaces (`lists`, `forms`, `summary`,
`widgets`, `wizards`, `templates` — et `dashboards` au module) dans
[composants.md](../../composants.md). Les mécanismes de ce document s'y
appliquent tels quels : `fields: ~{fields.yml}`, la forme courte, les
facettes en bloc, l'interpolation des profils de confidentialité, les
expressions.

## 3.9 `hooks/` et `reprise/`

- **`hooks/`** — `hooks.yml` déclare les familles, chaque famille ses
  fiches par pattern, chaque fiche `name`, `description` (un fichier
  md), `code` (le source), `properties` (D777/D809) :
  [hooks.md](../../hooks.md) ;
- **`reprise/`** (le nom est celui du cas ; l'organisation est libre)
  — `reprise.yml` déclare les migrations (D662 : `from:` — la base
  d'origine, D1087 —, `buffer:`, `storage:`, `mode:`,
  `reset:`, `source:`, `mapping:`, `operations:`), `source/<TABLE>.yml`
  décrit chaque entité d'origine (`name`, `alias`, `filter`, `identity`,
  `coverage`, `parent`, `fields`, `validation` — D947/D966 ; une colonne
  typée `TABLE.colonne` est une référence, `TABLE[NOM].colonne` une
  référence nommée quand l'entité est visée plusieurs fois — D995,
  `A.colonne or B.colonne` une référence à l'une de deux entités —
  D996 ; les calculés de la source en `formula:` — D660),
  `mapping/NNN_<nom>.yml` chaque règle (`to`, `filter`, `distinct`,
  `parent`, `fields`, `validation`, `report`, `operations` — D656) :
  [mapping.md](../../mapping.md) ; le pilotage et le suivi — les passages,
  les clés d'origine, le modèle lu, les anomalies — sont le module
  `_migration` du socle, que l'application n'expose pas :
  [migration.md](../../migration.md) (D1028) ; la migration déclare sa base
  miroir (`buffer:`, D1045) et le fichier de son détail (`storage:`,
  D1072).
