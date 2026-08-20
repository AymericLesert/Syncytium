# Les hooks d'opération du cas 1 (D776)

Le code de `clone`, `propagation` et `virement` s'écrira au langage
du moteur (le domaine 7 — D570). Les signatures attendues :

- **clone** : les paramètres `pas` (jour|semaine|mois|trimestre),
  `du`, `au` (le formulaire d'appel D775) — crée les copies de
  l'écriture aux dates générées, dans la transaction (D594) ;
- **propagation** : le nouveau libellé/montant — liste les
  similaires (les valeurs d'avant, la date ≥), la sélection, la
  masse (D774) ;
- **virement** : le compte cible, le montant — crée les deux
  écritures liées (`liee:` des deux côtés).
