# Les opérations

> **Une opération** est un verbe déclaré sur une entité, au-delà du
> créer-modifier-supprimer : valider, envoyer, clôturer. Sa déclaration
> est une suite d'actions ; son exécution, suite à un déclencheur, est
> une tâche. Sous droits, et déclencheur possible d'un changement d'état
> ([glossaire](../../glossaire.md)).

Une application ne fait pas que lire et écrire des enregistrements :
elle duplique une écriture, vire un montant, expédie une commande,
anonymise un contact. Chacun de ces gestes est une opération. Ce
chapitre dit ce qu'est une opération, comment elle se déclare, ce qui la
déclenche, comment elle enchaîne ses actions, ce qu'est la tâche qui
l'exécute, les vingt et une opérations du socle, le hook qui en ajoute
une, et ce que l'opération livre à la documentation. Les décisions
citées entre parenthèses renvoient au [registre](../../conception.md).

## Le sommaire

1. L'opération
   - [La nature](#la-nature)
2. [La déclaration](02-declaration.md)
   - [Le hook est l'opération](02-declaration.md#le-hook-est-lopération)
   - [Les portées](02-declaration.md#les-portées)
   - [Le commit](02-declaration.md#le-commit)
   - [L'exemple de la banque](02-declaration.md#lexemple-de-la-banque)
3. [Les déclencheurs](03-declencheurs.md)
   - [Les six déclencheurs](03-declencheurs.md#les-six-déclencheurs)
   - [Les déclencheurs par connecteur](03-declencheurs.md#les-déclencheurs-par-connecteur)
4. [La composition](04-composition.md)
   - [La suite d'actions et les effets](04-composition.md#la-suite-dactions-et-les-effets)
   - [Le wizard](04-composition.md#le-wizard)
5. [Les tâches](05-taches.md)
   - [La tâche, l'exécution d'une opération](05-taches.md#la-tâche-lexécution-dune-opération)
6. [Le catalogue des opérations du socle](06-catalogue.md)
   - [Les vingt et une opérations et leur plancher](06-catalogue.md#les-vingt-et-une-opérations-et-leur-plancher)
   - [Les opérations dédiées du module d'administration](06-catalogue.md#les-opérations-dédiées-du-module-dadministration)
7. [Le hook d'opération](07-hooks.md)
   - [Le contrat](07-hooks.md#le-contrat)
   - [Ce que le hook lit](07-hooks.md#ce-que-le-hook-lit)
8. [Ce que l'opération livre à la documentation](08-documentation.md)
   - [La facette de l'opération](08-documentation.md#la-facette-de-lopération)
9. [Les décisions](#les-décisions)

## La nature

Une opération est un verbe déclaré sur une entité, au-delà du
créer-modifier-supprimer : dupliquer, virer, expédier. Elle ne se
construit pas dans la configuration : « elle se construit toujours à
l'aide d'un hook de code » (D570), et le hook **est** l'opération
(D609). Sa déclaration, dans le bloc `operations:` de l'entité, en décrit
l'usage : le libellé, le formulaire d'appel, le `commit:`, le déclencheur,
la suite d'actions (D432, D1750). Son exécution, suite à un déclencheur,
est une tâche, qui passe par la file (D1748).

Quatre mots, chacun à sa place (D1750) : `operation`, la déclaration
d'une suite d'actions ; `action`, une étape d'une opération ; `task`, la
tâche exécutée suite à un déclencheur ; `procedure`, une fiche du guide
d'exploitation, jamais une opération.

## Les décisions

Ce chapitre repose sur les décisions de la famille « les opérations »,
relues le 05/11/2026 (D1739–D1761). Elles sont 57 au registre :
D24, D53–D55, D57–D60, D87–D88, D106, D148, D428, D430, D432–D436, D553, D570, D574, D594–D598, D600–D601, D609, D667, D697, D699, D701, D714–D715, D749, D776, D796–D797, D881, D903–D906, D913–D915, D1228, D1318, D1331, D1333, D1606–D1607, D1679–D1680, D1689. Chacune se lit dans [le registre](../../conception.md).
