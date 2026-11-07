# L'audience

Qui voit quelle ligne : les deux audiences, l'appartenance, la ligne sans
propriétaire, l'écriture unique, l'anti-IDOR.

Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md). Le texte vient des deux artefacts
préparatoires, déplacé à la réorganisation ; la réécriture suit.

## Le sommaire

- [L'audience et l'anti-IDOR (D70–D77, D144, D153)](#laudience-et-lanti-idor-d70d77-d144-d153)
- [L'audience — qui voit quelle ligne](#laudience--qui-voit-quelle-ligne)

## L'audience et l'anti-IDOR (D70–D77, D144, D153)

- **Les deux audiences** (D70) : l'interne (les collaborateurs — les
  groupes et les niveaux) et l'externe (les clients — l'accès au
  niveau ligne, fermé par défaut) ;
- **l'appartenance** (D71) : directe (le champ référence-compte),
  indirecte (le chemin multi-saut `commande.client.compte`), ouverte
  (les catalogues), ou non exposée (le défaut) ; les chemins
  multiples s'unissent, la ligne sans propriétaire est invisible ;
- **les identifiants opaques** (D75/D82) : l'UUID interne jamais
  exposé — l'anti-IDOR ; la pagination au curseur opaque (D100) ;
- **la typologie des comptes** (D77) : technique (l'API),
  utilisateur interne, client provisionné, client auto-créé
  (vérifié) — l'étanchéité par canal.

## L'audience — qui voit quelle ligne

- **Deux audiences** (D70) : l'interne (les groupes et les niveaux)
  et l'externe (les clients — l'accès au niveau ligne, **fermé par
  défaut**). Deux axes orthogonaux (D72) : *quelle ligne* ×
  *quel champ* — sur une ligne visible d'un client, les champs
  internes restent masqués.
- **L'appartenance** (D71) : directe (le champ référence-compte),
  indirecte (le chemin `commande.client.compte`), ouverte (les
  catalogues), non exposée (le défaut) ; les chemins multiples
  s'unissent (OU seulement — D74), la ligne sans propriétaire est
  invisible.
- **Lecture / écriture / écriture unique** par champ (D73, D153),
  l'invariant write ⊆ read ; l'écriture unique = le champ vide
  s'écrit, le champ renseigné refuse — l'administrateur en écriture
  pleine, tracée.
- **L'anti-IDOR** (D75) : le filtrage **côté serveur**, les
  identifiants **non devinables**, **le re-contrôle d'appartenance à
  chaque accès direct** (la possession d'un id ne prouve rien),
  l'aliasing par contexte en option forte ; l'abstraction de
  persistance sait filtrer au niveau ligne (RLS natif ou applicatif).

