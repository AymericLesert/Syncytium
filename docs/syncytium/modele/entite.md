# L'entité — l'en-tête, la validation, les renvois

## Le fichier de l'entité — l'en-tête

| la propriété | la nature | D |
|---|---|---|
| `name:` | le nom de l'entité — **l'invariant, quelle que soit la langue** ; la référence `<module>.<entité>` en découle | D124, D394, D765, D1120 |
| `title:` | **le nom d'usage** — le texte montré : l'entrée de menu par défaut, la vue d'ensemble du modèle, les titres de la documentation ; par langue (texte simple à une langue — D1101) ; sans lui, le `name:` ; au singulier, confirmé (D1277) — le `label:` de l'entrée de menu dit le pluriel ; le même mot que le `title:` des surfaces, un formulaire sans `title:` prend celui de l'entité | D1120, D1277 |
| `hint:` | **la description courte** — la précision d'un mot (l'alignement D258, le nom D840) | D124, D258, D840 |
| `description:` | **la description longue** — l'aide détaillée : le masque d'explication de la surface (D209), la matière du tutoriel | D209, D258 |
| `label:` | **le visage texte** — un gabarit `{champ}` (« `{nom}` », « `{libelle}` ») ; le champ `image` de l'entité est le visage image (D386) | D397, D803 |
| `identity:` | **la clé fonctionnelle** — la liste des champs (`[nom]`, `[numero]`) ; **toute entité en porte une**, la sienne ou celle de sa racine, que les dérivés conservent (D1035/D1039) ; l'identité interne reste l'UUID (D142), hors déclaration ; pour une composition, la clé vaut au sein du possesseur — elle ouvre l'accès `collection[<clé>]` (D841) ; **la clé composée s'énumère** (`[v1, v2]` — une valeur par identifiant), **l'étendue globale passe par l'entité** (`transport.consommation[…]` — la clé du/des parents en tête, D842) ; **ses champs sont obligatoires sans `required:`** — cela découle de la définition (D1170) ; écrite `identity:`, l'identité se nomme « identity » par défaut (D1304) | D141–D142, D357, D841–D842, D1170 |
| `identities:` | **plusieurs identités, nommées** — une carte ordonnée, un nom par identité et la liste de ses champs (`identities: { mensuelle: [client, mois], numero: [numero] }`, en bloc) ; exclusive de `identity:` (les deux = une erreur d'ingestion) ; **la première déclarée est l'identité de naissance** : ses champs obligatoires (D1170) ; **les suivantes sont acquises** : leurs champs non obligatoires, le `counter` attribué à la validation y a sa place ; une identité dont un champ est nul ne vaut pas pour l'enregistrement, chacune est une clé parmi les actifs (D141) ; l'accès par la clé vise la première, une autre se nomme — `factures[numero: v]` (D1550) ; la racine porte les identités, les dérivés les conservent (D1039) ; la documentation les nomme | D1170–D1171 |
| `states:` | **le porteur du cycle de vie** — le champ énuméré désigné (`states: statut`) ; l'entité à hiérarchie a son statut dans ses positions (D353), jamais les deux | D424 |
| `inheritance:` | l'enfant référence son parent — la hiérarchie se lit chez le parent (le bloc `states:` D353) ; ce que l'enfant reçoit et comment un enregistrement change de niveau : la section « L'héritage » | D353 |
| `fields:` | les champs — le bloc ou la référence (`fields: fields.yml`) | D767 |
| les groupes de champs, dans `fields:` | **un groupe est une clé de la carte des champs qui porte `fields:` et `title:`, sans `type:`** (D1279 — amende D1273 ; le critère validé, D1289) : `classification: { title: La classification, fields: ~{classification.yml} }` ou le bloc en place ; les champs hors groupe forment **le groupe implicite** ; les noms de champs restent uniques dans l'entité et s'adressent sans le groupe ; un groupe ne s'emboîte pas ; l'ordre est celui du fichier ; le `title:` texte simple à une langue, par langue à plusieurs (D1101). Le diagramme fait un compartiment par groupe, la table du dictionnaire une section, **le formulaire par défaut un onglet par groupe, l'implicite en en-tête au-dessus des onglets** (D1273). Un champ à `type:` et `fields:` est une liste de valeurs composées (D115), pas un groupe | D1273, D1275, D1279 |
| `partition:` | **le découpage physique de la table** — le ou les champs dont les valeurs la partitionnent (`partition: date_comptable[year]`, `partition: [site, statut]`), par période pour une date ; sans déclaration, pas de partition ; le storage décide la forme, le `describe(model)` la rend (connectors.md) | D1293, D1300 |
| `operations:` | les opérations — le bloc ou la référence ; le mapping ordonné, l'ordre = les boutons | D432 |
| `gui:` | la présentation — le bloc ou la référence | D767 |
| `validation:` | les règles inter-champs — la liste d'expressions booléennes (D90), le `if` suffixé (« `date_operation = owner.ouverture if budget = "OUVERTURE"` ») ; l'évaluation **au scellé** de la transaction | D156, D594, D824 |
| `history:` | **l'historisation** — inactive par défaut, en cascade de `settings.yml` de la version (`history: true` rend l'option disponible par défaut, D1174) au module puis à l'entité, le plus proche l'emporte, l'opt-out par `history: false` (D168) ; tue partout, la documentation écrit « pas d'historique » en clair et la complétude ne le compte pas (D1173) ; ce que l'historique contient et comment il se lit : la section « L'historisation » | D168, D1173–D1174 |

L'exemple — le véhicule (`examples/03_vehicule/`) :

```yaml
name: vehicule
description: Un véhicule du foyer — l'identification, le financement, la vie et le bilan
label: "{nom}"
identity: [nom]
states: statut

fields: ~{fields.yml}             # la référence de fichier explicite (D956)
operations: ~{operations.yml}
gui: ~{gui.yml}

validation:
  - date_vente >= date_achat if date_vente != null
```

**Les deux formes d'une validation** (D1116–D1117). La forme courte
`- expression` ; la forme longue `rule:`, `description:`, `message:`, mêlables
dans une même liste — au champ (D364), à l'entité (D404), à la règle de
reprise (D1105). Le `message:` est un gabarit (D1106). Sans lui, à l'échec, le
message est construit : la règle, les valeurs des champs qu'elle cite et les
valeurs de la clé de l'enregistrement (la `description:` n'y entre pas). Avec
plusieurs langues, `message:` est exigé, par langue : sinon une erreur
d'ingestion, et la forme courte est refusée.

**Les trois sévérités d'une règle** (D157, D1559). Une règle en échec
n'empêche pas toujours l'enregistrement. La forme longue porte sa
sévérité, `severity:` :

- `error`, le défaut : la règle bloque ;
- `confirm` : l'utilisateur confirme pour passer, et sa confirmation est
  tracée ;
- `info` : la règle signale sans bloquer.

À l'enregistrement, trois passes : toutes les erreurs d'un coup, puis les
confirmations regroupées en une seule validation, puis les informations
regroupées ; jamais d'arrêt à la première erreur. L'API suit le même
protocole : le rejet avec la liste, la re-soumission avec
l'acquittement, le signalement dans la réponse.

```yaml
# Les règles du véhicule
validation:
  - rule: date_vente >= date_achat if date_vente != null
    message: La date de vente précède la date d'achat.

  - rule: km_initial < 500000
    severity: confirm
    message: Un kilométrage initial de {km_initial} km est inhabituel.
```

**Le cumul de fichiers** (D968) : une propriété à carte peut porter
une liste de références en bloc — `fields:` suivi de `- ~{commun.yml}`,
`- ~{propre.yml}`, ou d'une carte en ligne — fusionnées dans l'ordre ;
la même clé deux fois est une surcharge, le dernier l'emporte, une
alerte levée à l'ingestion ; le pattern y vaut (D806). Jamais en flux
(D956).

## Les opérations — le renvoi

Le bloc `operations:` (D432) déclare l'usage des hooks d'opération
(le hook **est** l'opération — D609) : le verbe sans `when:` = un
bouton (la garde `if` — D430, le `label:`, le `commit: auto |
confirm` — D596, le formulaire d'appel `form:` — D775) ; le verbe
avec `when: <expression>` = l'automatisme (le cliquet — D354/D428) ;
les `effects:` composent les opérations du socle (`notify`,
`document`, `set`, `function`). La famille entière : [hooks.md](../../hooks.md).

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
le tout (D439). Les fiches : [composants.md](../../composants.md).

## L'exemple fil rouge

Le cas 3 (`examples/03_vehicule/`) déroule l'entité entière :
`vehicule` (l'identité, le statut Création → Actif → Clôture, le
financement à plat, le bilan calculé, le formulaire à six onglets,
la liste en widgets), ses quatre compositions (`consommation`,
`entretien`, `revision`, `echeance` — l'édition en ligne, les
formulaires par défaut), le dashboard d'accueil du module. La banque
(`examples/04_banque/`) montre la recherche déclarée (`searchable:`),
les opérations à formulaire d'appel et les montants à devise portée
(`amount` — quand la devise a un sens métier, D771).
