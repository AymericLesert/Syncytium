# L'entité — l'organisation, les champs, les composants

*Le onzième artefact — la fiche d'identité de l'entité : comment elle
s'organise, ce que porte un champ, comment la présentation s'y
accroche. La vue vivante du registre — les décisions citées renvoient
à [conception.md](conception.md) ; les types au catalogue
[types.md](types.md), les composants aux fiches
[composants.md](composants.md), les hooks à [hooks.md](hooks.md), les
droits à [rights.md](rights.md).*

## La doctrine

- **le module déclare ses entités** (D765/D766) : `module.yml` porte
  la liste `entities:` — les chemins relatifs au fichier courant
  (D768) ; rien ne se déduit de l'arborescence (D767) ;
- **toute propriété porte le contenu ou la référence de fichier**
  (D767) — le fichier unique est possible, l'éclatement libre : la
  convention des exemples est le trio par dossier —
  `<entité>/<entité>.yml` (l'identité), `fields.yml` (les champs),
  `gui.yml` (la présentation), et `operations.yml` quand les
  opérations le méritent ;
- **le nommage est libre** (D807) — l'éponymie (le fichier au nom de
  l'entité) est une convention, pas une règle ;
- **l'entité se documente elle-même** — un des piliers : `name`,
  `description`, les `label:` par langue, les `hint:` (la
  description courte — la précision au « (?) » du champ, D840) et
  `description:` (la longue — la matière du tutoriel) et les
  `placeholder:` nourrissent **la documentation générée** (Q58 —
  le document fonctionnel et technique, **la description claire
  des données véhiculées par les API**) **et** l'IHM (D258) ; le
  commentaire YAML (`#`) reste pour le lecteur du fichier (les
  références de décisions, les formules du réel).

## Le fichier de l'entité — l'en-tête

| la propriété | la nature | D |
|---|---|---|
| `name:` | le nom de l'entité — la référence `<module>.<entité>` en découle | D394, D765 |
| `hint:` | **la description courte** — la précision d'un mot (l'alignement D258, le nom D840) | D124, D258, D840 |
| `description:` | **la description longue** — l'aide détaillée : le masque d'explication de la surface (D209), la matière du tutoriel | D209, D258 |
| `label:` | **le visage texte** — un gabarit `{champ}` (« `{nom}` », « `{libelle}` ») ; le champ `image` de l'entité est le visage image (D386) | D397, D803 |
| `identity:` | **la clé fonctionnelle** — la liste des champs (`[nom]`, `[numero]`) ; l'identité interne reste l'UUID (D142), hors déclaration ; pour une composition, la clé vaut au sein du possesseur — elle ouvre l'accès `collection[<clé>]` (D841) ; **la clé composée s'énumère** (`[v1, v2]` — une valeur par identifiant), **l'étendue globale passe par l'entité** (`transport.consommation[…]` — la clé du/des parents en tête, D842) | D141–D142, D357, D841–D842 |
| `states:` | **le porteur du cycle de vie** — le champ énuméré désigné (`states: statut`) ; l'entité à hiérarchie a son statut dans ses positions (D353), jamais les deux | D424 |
| `inheritance:` | l'enfant référence son parent — la hiérarchie se lit chez le parent (le bloc `states:` D353) | D353 |
| `fields:` | les champs — le bloc ou la référence (`fields: fields.yml`) | D767 |
| `operations:` | les opérations — le bloc ou la référence ; le mapping ordonné, l'ordre = les boutons | D432 |
| `gui:` | la présentation — le bloc ou la référence | D767 |
| `validation:` | les règles inter-champs — la liste d'expressions booléennes (D90), le `if` suffixé (« `date_operation = owner.ouverture if budget = "OUVERTURE"` ») ; l'évaluation **au scellé** de la transaction | D156, D594, D824 |

L'exemple — le véhicule (`examples/01_vehicule/`) :

```yaml
name: vehicule
description: Un véhicule du foyer — l'identification, le financement, la vie et le bilan
label: "{nom}"
identity: [nom]
states: statut

fields: fields.yml
operations: operations.yml
gui: gui.yml

validation:
  - date_vente >= date_achat if date_vente != null
```

## Les champs — `fields.yml`

**La forme courte et la forme pleine.** Un champ sans façon s'écrit
en une ligne — `lieu_achat: text[..60]` ; dès qu'il porte une facette
ou sa documentation, le bloc :

```yaml
km_initial:
  type: integer[0..]
  required: true
  label:
    fr: Kilométrage initial
  hint:
    fr: Le compteur au retrait du véhicule — la première ligne de consommation en part.
```

**Les propriétés du champ.**

| la propriété | la nature | D |
|---|---|---|
| `type:` | le type du catalogue ([types.md](types.md)) — les bornes au nom (`text[..40]`, `integer[0..]`, `date[yyyy-mm]`) ; **la référence** = le nom d'une entité (`transport.revision`) ; **la composition** = `list of <entité>` (le parent déclare, l'enfant ne déclare rien — l'accès montant `owner`) ; **l'association** = `association with <entité>[.<champ>]` | D362, D366, D394–D402, D760–D762 |
| `required:` | le champ obligatoire — le nul retiré | D373 |
| `default:` | la valeur de naissance (le statut naît à son `default:` — D424) | D424 |
| `formula:` | **le champ calculé** — l'expression (D90), lecture seule, recalculé dès qu'une dépendance change ; les agrégats des collections (`sum`, `max`, `count`… — l'élément en contexte implicite, le `if` conditionnel), les fonctions de type au point (`montant.currency.select(…)`, `nb_jours.days`), **l'accès par la clé** (`owner.consommations[me.numero - 1].date` — l'`identity:` requise, D841), `owner`, `me`, `context` | D255, D298, D580, D588–D593, D772–D773, D841 |
| `values:` | les valeurs d'un `enum` — chacune porte son `label:` par langue ; sur le champ-statut : les `allow` par état (le CRUD — D422) et le graphe `promote:`/`demote:` (`to:`/`when:` — libre, l'acte, l'automatisme D426–D427) | D422–D427 |
| `label:` | le libellé par langue (`fr:`) — les colonnes, les formulaires, les exports ; sans lui, le nom nu | D124, D127, D465 |
| `hint:` | **la description courte** — la précision au « (?) » du champ : l'infobulle (la tablette la replie en petit logo près du libellé, le smartphone l'omet — D262) ; par langue ; le nom `hint` (D840 — la réserve Android au glossaire) | D124, D258, D262, D840 |
| `description:` | **la description longue** — l'aide détaillée : le masque d'explication (D209 — la première consultation ou la sollicitation), **la matière du tutoriel** ; par langue | D209, D258 |
| `placeholder:` | la valeur de démonstration dans la zone vide (`AA-999-AA`) — par langue (D128/D258) ; l'image a le sien (l'icône de fond — D390) | D128, D258, D390 |
| `mask:` | le masque de saisie (`_`, `9`, les littéraux) — il pilote aussi la lecture des sources (D820) | D259–D265, D820 |
| `searchable:` | la capacité de recherche — `range`, `mutualizable[<nom>]`… — déclarée **au modèle**, consommée par les listes | D780, D784 |
| `filter:` / `check:` | sur une référence — le filtre des candidats (l'origine par `me.`), le contrôle `selection` (défaut) \| `immutable` | D394–D396 |
| `currencies:`, `units:`, `decimals:`… | les facettes propres à chaque type — la fiche du type fait foi ([types.md](types.md)) | D391 |

**L'ordre du fichier — la convention de lisibilité** (le cas 1) :

- les fichiers **aérés** — les accolades `{ }` dépliées en bloc, une
  ligne vide entre deux champs ;
- **les champs saisis en tête, les calculés en pied**, séparés par
  `# ------ Champs calculés ------` ;
- **le commentaire d'un champ se place devant le champ**, jamais à
  sa droite — et ce qui parle à l'utilisateur n'est pas un
  commentaire YAML : c'est un `hint:` (la précision courte) ou
  une `description:` (l'aide longue) — D258/D840.

## Les opérations — le renvoi

Le bloc `operations:` (D432) déclare l'usage des hooks d'opération
(le hook **est** l'opération — D609) : le verbe sans `when:` = un
bouton (la garde `if` — D430, le `label:`, le `commit: auto |
confirm` — D596, le formulaire d'appel `form:` — D775) ; le verbe
avec `when: <expression>` = l'automatisme (le cliquet — D354/D428) ;
les `effects:` composent les opérations du socle (`notify`,
`document`, `set`, `function`). La famille entière : [hooks.md](hooks.md).

## La présentation — `gui.yml`

L'entité accroche ses surfaces — chacune nommée, **la première
déclarée = le défaut** (D437/D438) :

| le bloc | la surface | l'essentiel |
|---|---|---|
| `forms:` | les formulaires — `record` (les cinq usages, les titres au gabarit par mode D788–D790), les formulaires d'appel des opérations (D775) | l'arbre de composants : `items:`, les conteneurs (`tabs`/`tab`, `sections`/`section`, `grid`…), les feuilles (`field[…]`, `operation[…]`, `chart[…]`, `paragraph`) ; le `visible:` vivant (D567) |
| `lists:` | les listes — la porte d'entrée de l'entité | les deux visages (D492) : le tableau (`columns:`) ou **la liste de widgets** (`widget: <nom>`) ; `editable: […]` (l'édition en ligne — défaut : tout readonly D441), `filter:`, `sort:`, `title:` ; sans déclaration de formulaire, **le formulaire par défaut du socle** sert les gestes (D438/D530) |
| `widgets:` | les petites surfaces — la carte d'un enregistrement (D492) ou la synthèse (D202) | les items : sections, feuilles, `chart[…]` ; le `paragraph` au gabarit mustache (`{{owner.nom}}` — les chemins D71, l'alinéa `if:`) |
| `charts:` | les graphiques de l'entité | `x:` (le découpage temporel au crochet — `date[month]`, D516), `y:` (l'agrégat — D517/D580) |

**L'adresse universelle** `<type>[<nom>]` (D566) relie tout :
`field[nom]`, `operation[ajuster_echeancier]`, `chart[…]`,
`widget[…]`, `list[…]` — **qualifiée `<entité>.<nom>` hors de
l'entité courante** (`chart[consommation.evolution_consommation]`,
`widget[order.monthly]`, `list[revision.echues]`). Le module porte
ses `dashboards:` (la vue d'ensemble — D554/D555), le menu adresse
le tout (D439). Les fiches : [composants.md](composants.md).

## L'exemple fil rouge

Le cas 1 (`examples/01_vehicule/`) déroule l'entité entière :
`vehicule` (l'identité, le statut Création → Actif → Clôture, le
financement à plat, le bilan calculé, le formulaire à six onglets,
la liste en widgets), ses quatre compositions (`consommation`,
`entretien`, `revision`, `echeance` — l'édition en ligne, les
formulaires par défaut), le dashboard d'accueil du module. La banque
(`examples/02_banque/`) montre la recherche déclarée (`searchable:`),
les opérations à formulaire d'appel et les montants à devise portée
(`amount` — quand la devise a un sens métier, D771).
