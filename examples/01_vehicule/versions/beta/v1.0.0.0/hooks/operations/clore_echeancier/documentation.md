# clore_echeancier — la vente clôt l'échéancier (D831)

À la vente du véhicule (`date_vente` posée), toutes les échéances
**non payées** sont supprimées. La coche Payé étant calculée —
payée dès que la date du jour dépasse l'échéance —, la purge évite
qu'un véhicule vendu voie ses échéances futures se « payer »
seules avec le temps.
