# Les tâches

*L'exécution d'une opération : la file, l'état, la progression, le résultat, le mode, l'exécution, la relance ; la
supervision est au chapitre 9.*

## Le sommaire

- [La tâche, l'exécution d'une opération](#la-tâche-lexécution-dune-opération)

## La tâche, l'exécution d'une opération

**Les tâches** (D53–D55, D87, D88, D436, D1748) : une tâche est
l'exécution d'une opération ; toute exécution passe par la file, avec
son état, sa progression et son résultat, retenu `retention:` (D906).
`mode:` se déclare, `synchronous` par défaut, l'interface en pause avec
sa progression, `asynchronous`, enregistrée dans la file, `await[…]`, le
décalage avant le lancement (D436). Qui déclenche est dit par `allow:`
et le plancher ; le déclencheur lit le résultat ; l'opération s'exécute
avec les droits de son contrat (D53). La relance : le déclencheur pour
une opération `repeatable` en échec terminal, l'administrateur pour
tout, depuis la supervision (D88). Les effets `webhook` et `actions`
sont des tâches ; leur anomalie est tracée et notifiée au déclencheur
par son canal, in-app depuis l'interface, webhook depuis l'API (D87).
L'API déclenche et suit, le 202 et sa ressource de suivi, au
chapitre 12 (D24).
