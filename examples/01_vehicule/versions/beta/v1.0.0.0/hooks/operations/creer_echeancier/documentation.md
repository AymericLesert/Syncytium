# creer_echeancier — l'échéancier engendré à la validation du financement (D831)

À la validation d'un véhicule financé (crédit ou LOA), le hook
engendre les échéances de 1 à `duree_echeances` : la date au
`jour_echeance` de chaque mois depuis `premier_mois`, la mensualité
— celle déclarée pour la LOA, l'annuité constante du crédit
(capital, taux périodique actuariel, durée) — et, pour le crédit,
l'intérêt (reste dû × taux périodique), l'amortissement
(mensualité − intérêt) et l'assurance reportés ligne à ligne : les
formules du classeur vivent ici, pas dans la grammaire (D826,
D831).

Le hook est idempotent : l'échéancier absent s'engendre ; le
paramétrage modifié régénère les échéances **non payées** — les
payées restent, l'histoire ne se réécrit pas.
