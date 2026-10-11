# finaliser_vehicule — le complément d'après-migration

À l'issue de la migration (`when: migrated` — l'issue de `migrate`, sur
le patron de `generated`), le hook complète ce que la reprise ne porte
pas :

- **la durée du contrat** — les véhicules repris la gagnent du réel :
  `duree_contrat` ← le compte des échéances importées ;
- et, en général, l'occasion d'**engendrer des lignes ou de faire
  des compléments après la migration**.

Le hook est idempotent : il ne complète que l'absent — les valeurs
saisies ou reprises restent intactes.
