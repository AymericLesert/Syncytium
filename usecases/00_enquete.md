# Le cas 0 — le « hello world ! » : l'enquête de satisfaction

*Le degré zéro de l'échelle (D756/D827, amendée par D856) — la
promesse fondatrice montrée nue : un modèle déclaré, une application
qui naît, **aucune surface écrite**. Le cadre du cas : le contexte,
le modèle, **la forme** (le dépôt `examples/00_enquete/` écrit pour
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
deux entités. **Dix-huit fichiers en tout, zéro surface.**

## Les manques relevés

*(chaque frottement deviendrait une décision — aucun relevé : les
défauts du socle couvrent le cas de bout en bout, c'est sa raison
d'être)*
