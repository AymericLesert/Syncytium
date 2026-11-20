# Ce que la migration livre à la documentation

> **La facette documentation** est ce qu'un composant livre à chaque
> documentation générée : chaque type de composant décline dans chaque
> type de document, Syncytium assemble ([glossaire](../../glossaire.md)).

Ce fichier dit ce que la migration déclarée donne à chacune des neuf
documentations (D1158, D1159) : la reprise d'abord, la migration de
version ensuite.
La facette du module `_migration` suit le module, au chapitre 10 (D2010).
Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [La facette de la reprise](#la-facette-de-la-reprise)
- [La migration de version, dans les documentations](#la-migration-de-version-dans-les-documentations)

## La facette de la reprise

*(La rubrique de la matrice de [documentation.md](../../documentation.md)
§13 ; la colonne 1 — la fonctionnelle — remplie, les autres à leur
rang.)*

**La reprise, dans la fonctionnelle** : rien en chapitre — le module
`_migration` est au socle, sous le menu d'administration (D711), et ses
scénarios relèvent du guide d'exploitation (D1206). Ce qui passe tout
de même : **« à quoi sert un champ »** cite les règles de reprise qui
l'alimentent (D1198 — « repris de l'ERP ») ; **les opérations
déclenchées par la reprise** (`when: migrated`) figurent dans la table
des opérations de l'entité parce qu'elles transforment ce que
l'utilisateur voit (D1209, D1227) ; les champs `unmapped:` se disent
« saisis ici, jamais repris » (D941). **Quand plusieurs règles
alimentent un champ**, la documentation les décrit toutes et précise
que la dernière qui répond est celle que Syncytium retient (D1951).

**La migration déclarée, dans le dictionnaire de la donnée** (la colonne
2 — le rang 2, D1302) : le chapitre 4.1 « Reprise des données »
(D1259) — la migration déclarée, **les sources** (par table d'origine,
le périmètre, l'identité et la clé de partition de la couverture
(D879/D1050 — comment la source se lit, à distinguer de la partition
de stockage de D1293), les colonnes lues avec le type lu et le type
décrit, les colonnes écartées et leur motif), **les
règles** (dans l'ordre : la source, la cible, le périmètre, les champs
mappés et leurs transformations, les destinataires), **le graphe source
→ cible dans les deux sens** — l'index 5.1 lu depuis l'autre bout
(D1198, D1186) ; à l'instance, le modèle lu et ses versions, les
passages ; le détail dans [migration.md](../../migration.md).

**La migration déclarée, dans la réglementation** (la colonne 5 — le
rang 3) : **les règles de reprise qui écrivent un champ marqué sont des
traitements** du registre (D1317), par leur source, leur cible, leur
rapport et ses destinataires ; **la provenance** (D178) entre dans la
mention d'information — « reprises de PMI » — et dans la documentation,
pour le contexte (D1335) ; la rétention du détail des passages, par
`retention:` de la base miroir (D1065, D1334, D1892).

**La migration déclarée, dans le projet et le support** (la colonne 8
— le rang 4) : rien — les règles de reprise ne sont pas des écarts
(D1281) ; les notes de version disent, en clair, ce que la reprise
apporte (D1096).

**La migration déclarée, dans la documentation du développeur** (la
colonne 3 — le rang 5) : rien de propre — la reprise n'est pas un
appel ; le gabarit technique de l'import (D1414) est la porte du
programme qui voudrait alimenter l'entrepôt sans reprise ; les règles
de reprise ne sont pas des écarts du contrat (D1281).

**La migration déclarée, dans le D.A.T.** (la colonne 4 — le rang 6) :
**le connecteur de reprise** sur le schéma, distinct, avec le rythme de
la migration et son état à l'instance (D1433) ; le flux marqué par les
champs `rgpd:` qu'il emporte (D1426) ; rien d'écrit.

**La migration déclarée, dans le guide d'exploitation** (la colonne 9 —
le rang 7) : **les passages de la reprise** dans la supervision
quotidienne (D1454) — les cinq états, les rapports, les rejets ; **la
fiche de la relecture** — `reset_coverage`, `on_running`, l'interruption
et la relance manuelle (D1077, D1079) ; le rythme au calendrier des
opérations (D943).

**La migration déclarée, dans la maintenance, les risques et les
améliorations** (la colonne 7 — le rang 8) : **les risques** de la
famille « la reprise » (D1490) — les anomalies et les rejets des
passages, leur tendance, la couverture ([migration.md](../../migration.md)) ;
une anomalie qui dit une règle absente ou une source qui a changé est
une lecture métier, servie à partir de `manager` (D1493).

**La migration déclarée, dans la promotionnelle** (la colonne 6 — le
rang 9) : rien — la reprise n'est pas un argument pour l'adhésion ;
dans la démonstration, le connecteur de reprise est mocké comme les
autres (D1503) et le jeu de données vient de `dataset:` (D1504), non
d'une reprise.

**Les neuf colonnes sont écrites.**

## La migration de version, dans les documentations

La facette ci-dessus décrit la reprise. Une migration de version donne
aussi sa part :

- **le dictionnaire de la donnée** : la lignée d'un champ — « renommé
  depuis `abrege` » pour `nom_court`, dans l'entrepôt (D1112, D1123) ;
  une section du chapitre 4.1 par processus qui porte des règles
  d'`exchange/`, avec ses deux volets (D1302, D1990, D1992) ;
- **le guide d'exploitation** : le rapport de migration de version ; la
  lecture et la validation d'un écart avant de basculer (D1993, D1994) ;
- **le D.A.T.** : l'espace de stockage au moins double, le temps d'une
  migration (D1977) ;
- **la documentation du développeur** : les anciennes versions de l'API,
  servies par les deux volets ; elles se décrivent au chapitre des API
  (D11, D1996) ;
- **les autres documentations** : rien.

Le module `_migration` et sa facette se décrivent au chapitre 10, avec
l'administration et l'exploitation (D2010).
