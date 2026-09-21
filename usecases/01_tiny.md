# Le cas 1 — le « tiny hello world ! » : une entité, quatre champs, toutes les capacités

*La maison de la documentation (D1026, ouverte le 21/09/2026 ; le premier rang depuis la renumérotation D1027) — plus
nue encore que l'enquête du cas 2 ([02_enquete.md](02_enquete.md)) :
le cas n'éprouve rien, il **montre** ; il ouvrira la documentation
structurée (D1021). Le dépôt `examples/01_tiny/` s'écrira avec elle.
Les décisions citées renvoient à
[../docs/conception.md](../docs/conception.md). Le nom de la maison est
une proposition.*

## Le contexte (D1026)

**« Pour la documentation, nous prévoyons un cas d'usage "tiny hello
world !" : un environnement, un module, une entité et 4 champs (Nom,
Prénom, Age, Fonction) pour montrer simplement les capacités de
Syncytium avec des exemples d'accès API, une procédure
d'export/import, la documentation, les aides, les IHM, … Cela devra
tenir en quelques lignes de configuration. »** (l'auteur, le
21/09/2026)

## Ce que le cas montre

*(à écrire avec la documentation structurée — chaque capacité
illustrée sur la même entité, depuis les mêmes quelques lignes)*

- **la configuration** — un environnement, un module, une entité,
  quatre champs : `nom`, `prenom`, `age`, `fonction` ; quelques lignes,
  rien d'autre ;
- **ce qui naît sans être écrit** — la base, l'IHM par défaut (la
  liste, le formulaire — D437–D438), l'API versionnée (D9/D28), la
  documentation auto-générée (D258/D840), les aides ;
- **les exemples d'accès à l'API** — la lecture, la création, la
  modification, la suppression, la recherche ;
- **la procédure d'export et d'import** (D211/D234–D238) ;
- **les IHM** — ce que l'utilisateur voit, sans une ligne de `gui:`.

## La forme — le dépôt

*(`examples/01_tiny/` — à écrire avec la documentation, D1021)*

## Les manques relevés

*(chaque frottement = une décision consignée)*
