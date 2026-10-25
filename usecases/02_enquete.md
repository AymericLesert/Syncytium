# Le cas 2 — le « hello world ! » : l'enquête de satisfaction

*Le degré zéro de l'échelle (D756/D827, amendée par D856 ; le cas 0 devenu le cas 2 par la renumérotation D1027, derrière le tiny) — la
promesse fondatrice montrée nue : un modèle déclaré, une application
qui naît, **aucune surface écrite**. Le cadre du cas : le contexte,
le modèle, **la forme** (le dépôt `examples/02_enquete/` écrit pour
de vrai) et **les manques**. Les décisions citées renvoient à
[../docs/conception.md](../docs/conception.md).*

## Le contexte (D856)

- **le rôle** : le « hello world » de Syncytium — « un modèle avec un
  module, 1 table et 1 composition, sans migration et avec gui généré
  automatiquement » ;
- **l'usage** : « montrer que cela peut être utile pour récolter
  rapidement des informations » — l'enquête de satisfaction : la
  campagne (le titre, la date) et ses réponses (le répondant, la
  note de 1 à 5, le commentaire) ;
- **ce que le cas montre** : le formulaire par défaut (D438), la
  liste par défaut, la composition embarquée par défaut (D486), les
  calculés qui vivent seuls (`nb_reponses`, `note_moyenne` — D255),
  et le généré qui parle français (les `label`/`hint`/`placeholder`
  de l'auto-documentation — D258/D840) ;
- **ce que le cas n'a pas** : ni hooks, ni opérations déclarées, ni
  `gui:`, ni reprise — les dossiers n'existent pas.

## Le modèle

- **`satisfaction`** — le module (le nommage libre D807 : l'éponymie
  triple `enquete/enquete/enquete.yml` évitée — la leçon transport
  D831) ;
- **`enquete`** — la campagne : `titre` (l'identité), `date`
  optionnelle, la composition `reponses`, et deux calculés —
  `nb_reponses` (`reponses.count()`), `note_moyenne`
  (`reponses.avg(note)`) ;
- **`reponse`** — le répondant (`text[..40]`), la `note`
  (`integer[1..5]` — « De 1 (déçu) à 5 (ravi) »), le `commentaire`
  (multi-ligne déduit — D366).

## La forme — le dépôt

Un seul morceau — le cas tient entier : l'assise du domestique
(l'arborescence pleine D799–D810, `logging.yml` D830,
`authentication: none` D759, `smtp: none` D763) et le module aux
deux entités. **Seize fichiers en tout, zéro surface.**

## Les manques relevés

*(chaque frottement deviendrait une décision — aucun relevé : les
défauts du socle couvrent le cas de bout en bout, c'est sa raison
d'être)*

## La complétude de la documentation — la déclinaison de l'enquête (le rang 8, étape 1)
*(La mesure au dépôt, `python tools/completeness.py examples/02_enquete`, le 25/10/2026 — D1478–D1488 :
l'inventaire de documentation.md §20, le taux par documentation et par module, les manques par nature ;
la liste complète, le fichier et la clé d'accès, sort de l'outil. Les manques sont ceux du cas tel qu'il
est écrit : ils disent ce que le concepteur n'a pas décrit, jamais un défaut du socle.)*

### La version 1.0.0.0 (beta) — 71 %

| La documentation | (environnements) | (projet) | satisfaction | **la version** |
|---|---|---|---|---|
| fonctionnelle | — | — | 76 % (16/21) | **76 %** |
| dictionnaire | — | — | 70 % (7/10) | **70 %** |
| D.A.T. | 100 % (1/1) | — | — | **100 %** |
| guide | 0 % (0/1) | — | — | **0 %** |
| projet | — | 0 % (0/1) | — | **0 %** |

**71 %** — 24 éléments décrits sur 34 attendus, 7 manques.

| Le manque | Combien | La clé à écrire | La documentation |
|---|---|---|---|
| l'entité sans nom d'usage | 2 | `title:` | fonctionnelle |
| le champ sans aide ni description | 3 | `hint: ou description:` | fonctionnelle, dictionnaire |
| le projet sans texte de support | 1 | `pages: support:` | projet |
| l'environnement sans texte d'exploitation | 1 | `pages: operations:` | guide |

**Les orphelins** — 15 fichiers atteints depuis `syncytium.yml`, 15 fichiers dans le dossier ; un orphelin n'entre pas dans le taux : c'est peut-être un oubli — un texte écrit, jamais référencé.

Aucun orphelin.
