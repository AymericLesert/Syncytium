# Le cas 1 — le « tiny hello world ! » : une entité, quatre champs, toutes les capacités

*La maison de la documentation (D1026, ouverte le 21/09/2026 ; le premier rang depuis la renumérotation D1027) — plus
nue encore que l'enquête du cas 2 ([02_enquete.md](02_enquete.md)) :
le cas n'éprouve rien, il **montre** ; il ouvre la documentation
structurée (D1021) et porte **la première déclinaison des principes de
[documentation.md](../docs/documentation.md)** (le 05/10/2026). Le dépôt
`examples/01_tiny/` tient en un fichier (D1113–D1115). Les décisions
citées renvoient à [../docs/conception.md](../docs/conception.md). Le
nom de la maison est une proposition.*

## Le contexte (D1026)

**« Pour la documentation, nous prévoyons un cas d'usage "tiny hello
world !" : un environnement, un module, une entité et 4 champs (Nom,
Prénom, Age, Fonction) pour montrer simplement les capacités de
Syncytium avec des exemples d'accès API, une procédure
d'export/import, la documentation, les aides, les IHM, … Cela devra
tenir en quelques lignes de configuration. »** (l'auteur, le
21/09/2026)

## Ce que le cas montre

- **la configuration** — un environnement, un module, une entité,
  quatre champs : `nom`, `prenom`, `age`, `fonction` ; quelques lignes,
  rien d'autre ;
- **ce qui naît sans être écrit** — la base, l'IHM par défaut (la
  liste, le formulaire — D437–D438), l'API versionnée (D9/D28), la
  documentation auto-générée (D258/D840), les aides ;
- **les exemples d'accès à l'API** — la lecture, la création, la
  modification, la suppression, la recherche ;
- **la procédure d'export et d'import** (D211/D234–D238) ;
- **les IHM** — ce que l'utilisateur voit, sans une ligne de `gui:`.

## La forme — le dépôt

`examples/01_tiny/syncytium.yml`, un seul fichier (D1113 — la
substitution : le statut, la version, le module et l'entité sont des
clés) : le format `from: Syncytium-1.0`, le projet `tiny` et sa
description, un environnement `home` (« Exécution en mode local »,
`storage: sqlite` — le connecteur implicite, D1114), un statut
`production` sans `beta` (D1115), une version `1.0.0.0` et sa note,
un module `annuaire`, une entité `personne` — sa description, son
visage `"{prenom} {nom}"`, son identité `[nom, prenom]`, ses quatre
champs en forme courte. Ni journal, ni nettoyage, ni langues, ni
groupes, ni `title:` : les défauts du poste portent le reste (D1114,
D1120).

## La documentation générée — la première déclinaison

*(Écrite à la main le 05/10/2026, telle que Syncytium devrait la
produire depuis ces lignes — la méthode de documentation.md §13 ; le
rendu est en Markdown parce qu'il se lit ici, la forme relève du
domaine 7 (D1126). Le plan suit l'exemple de référence (§6) : la
présentation, le socle, le module ; puis les pièces (§14–§25). Chaque
frottement de l'écriture est relevé à la fin.)*

---

> # tiny — Une entité, quatre champs et une application complète avec API et documentation
>
> *La documentation de la version 1.0.0.0 — production, la seule
> version active, servie par défaut.*
>
> ## 1. Présentation
>
> **L'application.** `tiny` — « Une entité, quatre champs et une
> application complète avec API et documentation ». Un module :
> `annuaire`. Une version en service : 1.0.0.0, en production, sur
> l'environnement `home`.
>
> **Les environnements.**
>
> | Environnement | Nature | Stockage |
> |---|---|---|
> | `home` | Exécution en mode local | `sqlite` |
>
> **La version 1.0.0.0.** Statut : production. Notes de version :
> « Version 1 de l'annuaire ». Langue : celle du poste. Ce qui change :
> première version, aucune version antérieure.
>
> **Les modules.**
>
> | Module | Description | Entités |
> |---|---|---|
> | `annuaire` | — | `personne` |
>
> **Le modèle de données.** Une entité, un module : la vue d'ensemble
> et la vue de l'entité se confondent.
>
> ```mermaid
> classDiagram
>   namespace annuaire {
>     class personne {
>       nom : text[..40] «id»
>       prenom : text[..40] «id»
>       age : integer
>       fonction : text[..60]
>     }
>   }
> ```
>
> ## 2. Le socle — ce qui est commun à toute application Syncytium
>
> *(Ce chapitre vient de Syncytium, non de la configuration — le point
> ouvert 11 de documentation.md.)* L'écran et son menu — un module,
> ses entités ; la liste, le formulaire et le widget de résumé ; les
> masques d'explication ; l'import, un écran du module, par fichier CSV
> ; l'export depuis la liste ; le profil et la langue ; les notes de
> version.
>
> ## 3. Le module `annuaire`
>
> *Aucune description.* Une entrée de menu : `annuaire` → `personne`.
>
> ### `personne` — Les membres de l'entreprise
>
> Une personne se présente par **son prénom et son nom** (`"{prenom}
> {nom}"`). **Son identité est son nom et son prénom** : deux personnes
> ne partagent pas le même nom et le même prénom.
>
> **Les champs.**
>
> | Champ | Libellé | Type | Obligatoire | Aide |
> |---|---|---|---|---|
> | `nom` | nom | un texte de 40 caractères au plus | identité | — |
> | `prenom` | prenom | un texte de 40 caractères au plus | identité | — |
> | `age` | age | un entier | non | — |
> | `fonction` | fonction | un texte de 60 caractères au plus | non | — |
>
> **Les règles.** Aucune validation. Aucun état. Aucune opération
> propre ; les actes du socle — créer, consulter, modifier, supprimer
> — sont ouverts. Pas d'historique.
>
> **Les écrans** (les défauts). La liste `personne` : les quatre
> colonnes, le tri, le filtre, les actions. Le formulaire : les quatre
> champs, empilés. Le widget de résumé : le prénom et le nom. Le masque
> d'explication de la liste : « Les membres de l'entreprise » — aucune
> aide sur les champs.
>
> **Les droits.** Aucun groupe déclaré, aucune authentification :
> l'utilisateur par défaut, au degré administrateur ; tout lui est
> ouvert.
>
> ## 4. Le dictionnaire des données
>
> - **age** — un entier ; un champ de `personne`.
> - **fonction** — un texte de 60 caractères au plus ; un champ de
>   `personne`.
> - **nom** — un texte de 40 caractères au plus ; l'identité de
>   `personne`, avec `prenom`.
> - **personne** — « Les membres de l'entreprise » ; l'entité du module
>   `annuaire`.
> - **prenom** — un texte de 40 caractères au plus ; l'identité de
>   `personne`, avec `nom`.
>
> ## 5. L'API
>
> Pour `personne`, à la version 1.0.0.0 du contrat : **lire** — une
> personne par son identité (nom, prénom), une liste, l'intégralité par
> pages ; **créer**, **modifier**, **supprimer** — à l'unité ou par
> lot ; **rechercher**. Les quatre champs sont exposés. Le compte
> technique épingle la version. *(La forme des appels : le domaine 7.)*
>
> ## 6. L'export et l'import
>
> **Le gabarit d'import de `personne`** — un fichier CSV, une ligne par
> personne :
>
> | Colonne | Type | Clé | Obligatoire |
> |---|---|---|---|
> | `nom` | texte (40) | oui | identité |
> | `prenom` | texte (40) | oui | identité |
> | `age` | entier | | non |
> | `fonction` | texte (60) | | non |
>
> Ligne d'exemple : aucune (pas de valeur de démonstration). La clé de
> rapprochement : le nom et le prénom. La procédure : l'écran d'import
> du module `annuaire`, l'essai à blanc, le rapport cellule par
> cellule, puis l'import — tout ou rien. **L'export** : les colonnes
> visibles de la liste, en CSV ou en Excel.
>
> ## 7. Les enchaînements
>
> Un parcours : le menu `annuaire` → la liste `personne` → le formulaire
> (créer, consulter, modifier, supprimer). Aucun état, aucune
> opération, aucun automatisme.
>
> ## 8. Le guide d'exploitation
>
> `home` : une exécution locale ; le stockage `sqlite` ; le journal sur
> la sortie standard, en `verbose` ; aucun nettoyage ; aucune opération
> périodique ; aucune reprise ; un seul compte, l'utilisateur par
> défaut ; les dépendances du moteur : *(fournies par le moteur)*.
>
> ## 9. La conformité
>
> **Le registre des traitements** : aucun champ marqué `rgpd:` — rien à
> inscrire. **Les droits** : un utilisateur, administrateur. **La
> sécurité** : aucun secret, aucun connecteur sortant, aucun code tiers
> au navigateur.
>
> ## 10. Le parcours guidé
>
> **Annuaire.** La liste des membres de l'entreprise. Ajouter une
> personne : son nom, son prénom, son âge, sa fonction. La retrouver par
> son nom. La modifier. La supprimer.
>
> ## 11. La complétude de la documentation
>
> | Élément | Ce qui manque |
> |---|---|
> | le module `annuaire` | `title:`, `description:` |
> | l'entité `personne` | `hint:` |
> | `nom`, `prenom`, `age`, `fonction` | `label:`, `hint:`, `description:`, `placeholder:` |
> | la liste par défaut | `description:` — le masque se réduit à celle de l'entité |
> | `rgpd:` | aucun champ marqué |
>
> Un texte écrit sur dix-neuf attendus.
>
> ## 12. Les scénarios d'utilisation
>
> Un persona : **l'utilisateur** (le groupe par défaut, administrateur).
> Ses scénarios : consulter l'annuaire ; ajouter une personne ; modifier
> une personne ; supprimer une personne ; importer l'annuaire depuis un
> fichier CSV ; exporter l'annuaire.
>
> ## 13. La diffusion
>
> Dans l'application : le « ? » du module et de la liste, le masque. En
> fichiers : la commande au dépôt. Une édition, dans la langue du poste.
>
> ## 14. La maintenance, les contrôles et la supervision
>
> *(À l'instance seulement — au dépôt, ce chapitre reste vide.)* **Les
> usages** de `personne` : les lectures et les écritures, les personnes
> ajoutées par mois ; les champs jamais renseignés ; l'écran jamais
> ouvert ; les imports réalisés. **Les contrôles** : la complétude de
> la documentation (chapitre 11) ; aucune reprise, aucune version
> dépréciée, aucun refus de droit. **Les optimisations** : rien à
> proposer tant que l'annuaire n'a pas vécu. **La maintenance** :
> aucune opération déclarée — le journal sur la sortie standard, pas
> de nettoyage.
>
> ## 15. Les modes opératoires
>
> Une planche par scénario, une page A4 en paysage. **« Ajouter une
> personne »** — *l'utilisateur ; à chaque arrivée dans l'entreprise* :
> **1.** Ouvrir l'annuaire — l'écran de la liste `personne`, l'entrée
> de menu entourée. **2.** Créer — le formulaire et ses quatre champs,
> le bouton de création entouré ; le nom et le prénom sont l'identité :
> deux personnes ne partagent pas les deux. **3.** Enregistrer — le
> bouton entouré ; la personne paraît dans la liste. Les images sont
> les écrans par défaut, rendus par Syncytium. Deux autres planches :
> « Modifier une personne », « Importer l'annuaire depuis un fichier
> CSV » (le gabarit du chapitre 6).
>
> ## 16. L'assistance
>
> *(À l'instance seulement.)* Aucune question posée. Depuis la liste
> ou le formulaire `personne`, le « ? » permet d'en poser une ;
> l'utilisateur par défaut, administrateur, y répond lui-même.

---

## Les frottements relevés

*(chaque frottement = une décision à prendre ; mes lectures en
proposition)*

1. **L'identité rend-elle les champs obligatoires ?** `identity: [nom,
   prenom]` sans `required:` — ma lecture : oui, implicitement (une
   identité ne peut être nulle, D1035) ; la table dit « identité »
   plutôt que « obligatoire ». À trancher.
2. **L'historique par défaut** : `history:` non déclaré — D168 le dit
   inactif par défaut ; la documentation écrit « pas d'historique ».
   Lecture à confirmer.
3. **Les droits sans groupe** : ni `groups.yml`, ni authentification —
   le tiny est le mono-poste de D759 : l'utilisateur et le groupe par
   défaut, le degré administrateur. Lecture à confirmer : le tiny = le
   cas `none`.
4. **Le socle dans la documentation** (le point ouvert 11) : le
   chapitre 2 vient de Syncytium, identique pour toute application ;
   la configuration ne le nourrit pas. À confirmer.
5. **Le registre vide d'une entité nominative** : `nom`, `prenom`,
   `age`, `fonction` sans `rgpd:` — la documentation dit « rien à
   inscrire » et la complétude signale l'absence de marquage ; faut-il
   qu'elle devine les champs nominatifs ? Ma lecture : non, elle
   compte, elle ne devine pas.
6. **La langue de l'édition** — *soldé* (D1144, D1160) : les textes de
   la configuration sont dans leur langue ; les intitulés de la
   documentation sont les textes génériques du moteur, codifiés et
   uniques, dans le catalogue de chaque langue que Syncytium porte ; ils
   suivent la langue du lecteur dedans, celle de l'émetteur en édition.
7. **Le type dit en clair** — *renvoyé au rang 2* : « un texte de 40
   caractères au plus », « un entier » — la forme des types en langage
   d'usager appartient à la facette documentation de chaque type
   (D1158), une rubrique de sa fiche dans types.md, avec ce que le
   stockage en dit (D1155).
8. **Le nom nu** : sans `label:`, le libellé est le nom (`prenom`, sans
   accent) — acquis (D124) ; le tiny le montre, et la complétude le
   compte.
9. **Les chapitres de l'instance au dépôt** — *soldé* (D1157) : la
   supervision (chapitre 14), l'assistance (chapitre 16) et la
   troisième source n'existent qu'avec l'instance — la documentation du
   dépôt les montre vides, avec leur cadre.
