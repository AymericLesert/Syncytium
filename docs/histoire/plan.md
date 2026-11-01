# Le plan de la conception

*Cette page donne le plan complet de la conception de Syncytium, à quatre
niveaux : les domaines, les rangs du chantier de la documentation, leurs
étapes, et les chapitres du rang 10. Chaque ligne porte un numéro, un titre,
un état et une date de fin. Elle est calculée depuis le
[registre](../conception.md), le [plan du chantier](../documentation.md)
et le [plan de la documentation](../README.md) par `python tools/plan.py`,
le 01/11/2026 (D1660).*

## Le sommaire

- [Les huit domaines](#les-huit-domaines)
- [Les rangs du chantier de la documentation](#les-rangs-du-chantier-de-la-documentation)
- [Les étapes des rangs](#les-étapes-des-rangs)
- [Les quatorze chapitres du rang 10](#les-quatorze-chapitres-du-rang-10)

## Les huit domaines

Les domaines sont la carte de la conception : décrire, clarifier et spécifier
avant de coder (D314, D602, D643). La date de fin est celle de la dernière
décision du domaine.

| # | Le titre | L'état | La fin |
|---|---|---|---|
| 1 | L'organisation et l'arborescence d'une application | Livré | 19/07/2026 |
| 2 | La donnée, sa structure et les droits | Livré | 11/08/2026 |
| 3 | Le méta-schéma | Livré | 15/08/2026 |
| 4 | Les surfaces | Livré | 14/08/2026 |
| 5 | Les cas d'usage | Livré | 26/10/2026 |
| 6 | La rédaction de la documentation synthétique et détaillée | En cours | — |
| 7 | Le choix de l'architecture technique | À couvrir | — |
| 8 | L'implémentation | Après tout le reste | — |

## Les rangs du chantier de la documentation

Le chantier de la documentation générée (D1118, D1136) occupe le domaine 6.
Onze rangs, de 0 à 10 : chaque rang produit une documentation, et le rang 10
reprend `docs/`.

| # | Le titre | L'état | La fin |
|---|---|---|---|
| 0 | le socle de la génération | clos | 08/10/2026 |
| 1 | la fonctionnelle | clos | 11/10/2026 |
| 2 | l'information, pour la BI et l'IA | clos | 16/10/2026 |
| 3 | la réglementation | clos | 20/10/2026 |
| 4 | le projet et le support | clos | 22/10/2026 |
| 5 | le développeur | clos | 24/10/2026 |
| 6 | le D.A.T. | clos | 24/10/2026 |
| 7 | le guide d'exploitation | clos | 25/10/2026 |
| 8 | la maintenance, les risques, les améliorations | clos | 25/10/2026 |
| 9 | la promotionnelle | clos | 25/10/2026 |
| 10 | Syncytium lui-même, et docs/ consultable sur GitHub | en cours | — |

## Les étapes des rangs

Chaque étape est un arbitrage. Sa date de fin est celle de la clôture de
son rang ; pour le rang en cours, celle de sa dernière décision.

| # | Le titre | L'état | La fin |
|---|---|---|---|
| 0.1 | §3 — les lecteurs des neuf documentations | acquise | 08/10/2026 |
| 0.2 | §2 — le carburant | acquise | 08/10/2026 |
| 0.3 | §13 — la méthode | acquise | 08/10/2026 |
| 0.4 | les frottements transversaux du tiny | acquise | 08/10/2026 |
| 0.5 | §12 — documentation.yml | acquise | 08/10/2026 |
| 0.6 | §21 — la diffusion | acquise | 08/10/2026 |
| 0.7 | §11 — les formats | acquise | 08/10/2026 |
| 1.1 | les frottements du tiny 1, 2, 3, 5, 8 | acquise | 11/10/2026 |
| 1.2 | §6 — le plan de la fonctionnelle | acquise | 11/10/2026 |
| 1.3 | §7 — les masques | acquise | 11/10/2026 |
| 1.4 | §16 — les enchaînements | acquise | 11/10/2026 |
| 1.5 | §22 — les personas | acquise | 11/10/2026 |
| 1.6 | §24 — les planches | acquise | 11/10/2026 |
| 1.7 | §19 — le parcours guidé | acquise | 11/10/2026 |
| 1.8 | §14 — le gabarit d'import | acquise | 11/10/2026 |
| 1.9 | §15 — le dictionnaire par libellés | acquise | 11/10/2026 |
| 1.10 | §5 et §9 | acquise | 11/10/2026 |
| 1.11 | (tombée) | tombée | 11/10/2026 |
| 2.1 | §4 — le plan du dictionnaire de la donnée | acquise | 16/10/2026 |
| 2.2 | §5 — le modèle de données | acquise | 16/10/2026 |
| 2.3 | §9 — les écarts | acquise | 16/10/2026 |
| 2.4 | l'édition lisible par la machine | acquise | 16/10/2026 |
| 2.5 | §8 — les données | acquise | 16/10/2026 |
| 2.6 | le modèle physique | acquise | 16/10/2026 |
| 2.7 | les règles, l'historique, les volumes | acquise | 16/10/2026 |
| 2.8 | la reprise des données | acquise | 16/10/2026 |
| 2.9 | le contrat du hook de type | acquise | 16/10/2026 |
| 2.10 | la lisibilité de l'index 5.1 | acquise | 16/10/2026 |
| 2.11 | la colonne 2 de la matrice | acquise | 16/10/2026 |
| 3.1 | ce qu'est un traitement et ce que le registre calcule | acquise | 20/10/2026 |
| 3.2 | ce qui s'écrit | acquise | 20/10/2026 |
| 3.3 | les droits des personnes | acquise | 20/10/2026 |
| 3.4 | les mentions d'information et la journalisation des accès | acquise | 20/10/2026 |
| 3.5 | la cinquième élargie à la sécurité | acquise | 20/10/2026 |
| 3.6 | l'accessibilité des écrans générés et les obligations du secteur | acquise | 20/10/2026 |
| 4.1 | la page des versions | acquise | 22/10/2026 |
| 4.2 | le dépôt du client | acquise | 22/10/2026 |
| 4.3 | signaler et demander | acquise | 22/10/2026 |
| 4.4 | le support | acquise | 22/10/2026 |
| 5.1 | §10 — le contrat d'API | acquise | 24/10/2026 |
| 5.2 | étendre | acquise | 24/10/2026 |
| 5.3 | enrichir | acquise | 24/10/2026 |
| 5.4 | les formats d'échange | acquise | 24/10/2026 |
| 6.1 | le schéma des connexions, calculé | acquise | 24/10/2026 |
| 6.2 | les environnements et leur rôle | acquise | 24/10/2026 |
| 6.3 | le paramétrage externe | acquise | 24/10/2026 |
| 6.4 | le dimensionnement | acquise | 24/10/2026 |
| 7.1 | ce que la configuration et administration.md génèrent | acquise | 25/10/2026 |
| 7.2 | les procédures | acquise | 25/10/2026 |
| 7.3 | la supervision quotidienne | acquise | 25/10/2026 |
| 7.4 | le dépannage | acquise | 25/10/2026 |
| 8.1 | §20 — la complétude | acquise | 25/10/2026 |
| 8.2 | §23 — la supervision des usages | acquise | 25/10/2026 |
| 8.3 | l'analyse des risques | acquise | 25/10/2026 |
| 8.4 | la recherche d'améliorations | acquise | 25/10/2026 |
| 9.1 | la plaquette | acquise | 25/10/2026 |
| 9.2 | la démonstration | acquise | 25/10/2026 |
| 9.3 | l'argumentaire du socle | acquise | 25/10/2026 |
| 10.1 | la partie 1, l'arborescence de docs/ | acquise | 26/10/2026 |
| 10.2 | le calcul | acquise | 29/10/2026 |
| 10.3 | la partie 3, Syncytium | en cours | — |
| 10.4 | la partie 4, les cinq cas d'usage | à venir | — |
| 10.5 | la partie 0, la présentation | à venir | — |
| 10.6 | la partie 2, l'histoire | à venir | — |
| 10.7 | la partie 5, les études | à venir | — |
| 10.8 | le nettoyage | à venir | — |

## Les quatorze chapitres du rang 10

Un chapitre se fait en trois temps : la lecture, la réorganisation, la
réécriture (D1521, D1543). Il est fait quand les trois le sont.

| # | Le titre | L'état | La fin |
|---|---|---|---|
| 1 | La configuration et son écriture | fait | 29/10/2026 |
| 2 | Le modèle et les types | fait | 30/10/2026 |
| 3 | Le langage d'expression | fait | 31/10/2026 |
| 4 | Les surfaces et les composants | fait | 01/11/2026 |
| 5 | Les hooks | en cours | — |
| 6 | Les connecteurs | à faire | — |
| 7 | Les droits et la sécurité | à faire | — |
| 8 | La reprise et le mapping | à faire | — |
| 9 | L'administration et l'exploitation | à faire | — |
| 10 | La télémétrie | à faire | — |
| 11 | La documentation | à faire | — |
| 12 | Les API et les échanges | à faire | — |
| 13 | Les cas d'usage | à faire | — |
| 14 | La méthode et le projet | à faire | — |
