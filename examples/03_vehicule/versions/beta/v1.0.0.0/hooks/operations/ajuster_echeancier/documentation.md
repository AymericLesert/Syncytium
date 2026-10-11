# ajuster_echeancier — l'échéancier remis au paramétrage courant

Le bouton de l'utilisateur (l'opération sans `when`) : après une
modification du financement (le taux renégocié, la durée allongée, la
mensualité revue), le hook recalcule l'échéancier depuis le
paramétrage à plat du véhicule — **les échéances non payées sont
remplacées, les payées restent** : l'histoire ne se réécrit pas.

La relecture avant le scellé (`commit: confirm`) donne le bilan : les
échéances conservées, supprimées, recréées. Le cliquet de
`creer_echeancier` joue à la première vraie — l'ajustement d'un
échéancier vivant passe par ce bouton.
