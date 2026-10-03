# creer_echeancier — l'échéancier engendré à la validation du financement (D831)

À la validation d'un véhicule financé (crédit ou LOA), le hook
engendre les échéances du contrat, de 1 à `duree_contrat` (D853) : la date au
`jour_echeance` de chaque mois depuis `premier_mois`, la mensualité
— celle déclarée pour la LOA, l'annuité constante du crédit
(capital, taux périodique actuariel, durée) — et, pour le crédit,
l'intérêt (reste dû × taux périodique), l'amortissement
(mensualité − intérêt) et l'assurance reportés ligne à ligne : les
formules du classeur vivent ici, pas dans la grammaire (D826,
D831).

Le cliquet (D354) déclenche à la première vraie : le hook engendre
l'échéancier une fois. Le paramétrage modifié ensuite se reprend
par le bouton `ajuster_echeancier`.
