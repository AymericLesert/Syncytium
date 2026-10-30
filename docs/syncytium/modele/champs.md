# Les champs — `fields.yml`

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

**Les groupes de champs** (D1273, D1279–D1280). Dans la même carte, une
clé qui porte `fields:` sans `type:` est un groupe : son `title:` par
langue, ses champs en place ou dans un fichier référencé — un fichier
par groupe dans le cas 5 (`prix: { title: Les prix, fields: ~{prix.yml}
}`). Les champs hors groupe forment le groupe implicite ; les noms
restent uniques dans l'entité et s'adressent sans le groupe ; un groupe
ne s'emboîte pas ; l'ordre est celui du fichier. Le groupe est une vue :
un compartiment du diagramme, une section de la table du dictionnaire,
un onglet du formulaire par défaut — l'implicite en en-tête de l'écran,
au-dessus des onglets.

**Les propriétés du champ.**

| la propriété | la nature | D |
|---|---|---|
| `type:` | le type du catalogue ([types.md](types.md)) — les bornes au nom (`text[..40]`, `integer[0..]`, `date[yyyy-mm]`) ; **la référence** = le nom d'une entité (`transport.revision`) ; **la composition** = `list of <entité>` (le parent déclare, l'enfant ne déclare rien — l'accès montant `owner`) ; **l'association** = `association with <entité>[.<champ>]` | D362, D366, D394–D402, D760–D762 |
| `sort:` | **le tri d'une liste calculée** — sur une association dérivée (D405), les clés de tri dans l'ordre (`sort: [owner.date, owner.numero]`) ; « le tri est porté par la liste calculée » : `first()`/`last()` sans argument rendent l'élément en tête ou en queue (`commandes_vente.last().client`) ; nommée `order:` par D997, renommée `sort:` par D1017 pour porter le mot de la méthode `sort(…)` | D997, D1017 |
| `group:` | **le « group by » d'une liste calculée** — sur une association dérivée (D405), les champs de groupement (`group: [emplacement]`) : « le group by devient une propriété de l'association au même titre que le sort by » ; l'association livre une cellule par combinaison, un agrégat dessus s'évalue par cellule et rend l'hypercube aux dimensions du group (`stock_par_emplacement: mouvements_par_emplacement.sum(…)`) ; les méthodes `group(champ, …)` et `sort(champ, …)` sont les formes en ligne (D1015/D1017) | D1016, D1017 |
| `required:` | le champ obligatoire — le nul retiré ; implicite sur les champs de l'identité (de la première, avec `identities:` — D1170) | D373, D1170 |
| `mode:` | **si le champ se modifie** — `editable` (le défaut), `read-only`, ou `write-once`, l'écriture unique : vide, la saisie est permise ; renseigné, elle est refusée ; l'administrateur garde l'écriture pleine, une correction tracée ; ce qui s'écrit se lit toujours ; un calculé est en lecture seule par nature — le code d'un client, saisi à la création : `code: { type: text, mask: "C-999999", mode: write-once }` | D73, D153, D358, D364 |
| *(la documentation du champ)* | **à quoi il sert** — ses emplois, calculés depuis les liens que l'ingestion garantit (D1198) : les formules qui le lisent, les validations, les opérations et leurs effets, les règles de reprise, les rapports, les écrans ; en langage d'usager dans la fonctionnelle, en graphe d'impact dans la documentation de l'information ; aux deux bouts (D1186) | D1186, D1198 |
| `default:` | la valeur de naissance (le statut naît à son `default:` — D424) | D424 |
| `unchanged:` | `true` : le champ possédé par la cible — la migration ne l'écrit pas, il naît à son `default:` et garde sa valeur, l'écran de saisie reste libre ; une règle de migration qui l'alimente = une erreur d'ingestion ; `false` par défaut | D941 |
| `formula:` | **le champ calculé** — l'expression (D90), lecture seule, recalculé dès qu'une dépendance change ; les agrégats des collections (`sum`, `max`, `count`… — l'élément en contexte implicite, le `if` conditionnel), les fonctions de type au point (`montant.currency.select(…)`, `nb_jours.days`), **l'accès par la clé** (`owner.consommations[me.numero - 1].date` — l'`identity:` requise, D841 ; avec `identities:`, la première identité, ou une autre par son nom : `factures[numero: v]` — D1171, D1550), `owner`, `me`, `context` | D255, D298, D580, D588–D593, D772–D773, D841, D1171 |
| `values:` | les valeurs d'un `enum` — chacune porte son `label:` par langue ; sur le champ-statut : les `allow` par état (le CRUD — D422) et le graphe `promote:`/`demote:` (`to:`/`when:` — libre, l'acte, l'automatisme D426–D427) | D422–D427 |
| `label:` | le libellé par langue (`fr:`) — les colonnes, les formulaires, les exports ; sans lui, **le gabarit du socle `${name}`** — la clé de la configuration, l'invariant que rien ne surcharge (D1181) ; le gabarit par défaut est un défaut du socle, porté par l'inventaire (D1175, D1239) | D124, D127, D465, D1181 |
| `hint:` | **la description courte** — la précision au « (?) » du champ : l'infobulle (la tablette la replie en petit logo près du libellé, le smartphone l'omet — D262) ; par langue ; le nom `hint` (D840 — la réserve Android au glossaire) | D124, D258, D262, D840 |
| `description:` | **la description longue** — l'aide détaillée : le masque d'explication (D209 — la première consultation ou la sollicitation), **la matière du tutoriel** ; par langue | D209, D258 |
| `placeholder:` | la valeur de démonstration dans la zone vide (`AA-999-AA`) — par langue (D128/D258) ; l'image a le sien (l'icône de fond — D390) | D128, D258, D390 |
| `mask:` | le masque de saisie (`_`, `9`, les littéraux) — il pilote aussi la lecture des sources (D820) | D259–D265, D820 |
| `searchable:` | la capacité de recherche — `range`, `mutualizable[<nom>]`… — déclarée **au modèle**, consommée par les listes | D780, D784 |
| `filter:` / `check:` | sur une référence — le filtre des candidats (l'origine par `me.`), le contrôle `selection` (défaut) \| `immutable` | D394–D396 |
| `currencies:`, `units:`, `decimals:`… | les facettes propres à chaque type — la fiche du type fait foi ([types.md](types.md)) | D391 |

**L'ordre du fichier — la convention de lisibilité** (le cas 4) :

- les fichiers **aérés** — les accolades `{ }` dépliées en bloc, une
  ligne vide entre deux champs ;
- **les champs saisis en tête, les calculés en pied**, séparés par
  `# ------ Champs calculés ------` ;
- **le commentaire d'un champ se place devant le champ**, jamais à
  sa droite — et ce qui parle à l'utilisateur n'est pas un
  commentaire YAML : c'est un `hint:` (la précision courte) ou
  une `description:` (l'aide longue) — D258/D840.
