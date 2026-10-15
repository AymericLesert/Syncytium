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

## La documentation générée — la déclinaison sur le plan acquis

*(La première déclinaison, écrite à la main le 05/10/2026 en seize
chapitres sur le plan de l'exemple de référence, précédait tout le
rang 1 ; elle est réécrite le 11/10/2026 sur le plan acquis de
documentation.md §6 — sept chapitres, D1189 — et sur les règles du
rang 1 : les masques (D1190–D1193), les enchaînements (D1194–D1196,
D1227–D1229), les personas (D1200–D1210), le gabarit d'import (D1211),
le dictionnaire (D1212–D1217), la complétude (D1173–D1182, D1199,
D1221). Le tiny reste la configuration minimale : rien n'y est ajouté
pour la documentation, et c'est le propos — tout ce qui suit naît des
vingt-six lignes de `syncytium.yml`. Les frottements relevés le 05/10
sont tous soldés (la section suivante). **Validée par l'auteur le
11/10/2026 — D1231.**)*

---

> # tiny — Une entité, quatre champs et une application complète avec API et documentation
>
> *La documentation fonctionnelle de la version 1.0.0.0 — production,
> la seule version active, servie par défaut ; la langue du poste.*
>
> *(0. La couverture n'existe qu'en édition : la page de garde, le
> cartouche — tiny, 1.0.0.0, la date, l'auteur de l'édition — ; pas de
> filigrane, la version est en production.)*
>
> ## 1. Présentation
>
> *Aucun texte de présentation.* Une entité, quatre champs et une
> application complète avec API et documentation.
>
> **Les modules.** `annuaire` — *aucune description* ; une entité,
> `personne`.
>
> **Le modèle de données — la vue des modules.** Un module, sans lien.
>
> **La version 1.0.0.0.** Statut : production, sur l'environnement
> `home` (Exécution en mode local). Notes de version : « Version 1 de
> l'annuaire ». Ce qui change : première version, aucune version
> antérieure.
>
> **Le concepteur.** *Non nommé ; aucun contact déclaré.*
>
> ## 2. Le socle
>
> *(Ce chapitre vient de Syncytium — les textes génériques du catalogue
> —, borné à ce que la version emploie.)* L'écran principal et son
> menu — un module, une entité. Pour chaque entité : la liste, le
> formulaire, le widget de résumé. Le « ? » de chaque écran : le masque
> d'explication, la page de l'écran dans cette documentation, les
> questions et réponses. Le cycle de vie d'une donnée : la suppression
> marque sans effacer. L'import, un écran du module, par fichier CSV —
> le gabarit en annexe ; l'export depuis la liste, CSV ou Excel. Le
> profil : la langue, les notifications par mail. La recherche. *(Ni
> historique, ni groupes, ni authentification : un seul utilisateur,
> tous les droits.)*
>
> ## 3. Le module annuaire
>
> *Aucune description.*
>
> *(la vue du module — le diagramme : `personne` seule ; `nom` et
> `prenom` soulignés)*
>
> ### 3.1 Les personnes
>
> Les membres de l'entreprise. Une personne se présente par son prénom
> et son nom ; son identité est son nom et son prénom — deux personnes
> ne partagent pas le même nom et le même prénom.
>
> **L'écran.** La liste par défaut : les quatre colonnes, le tri, le
> filtre, les actions. Le formulaire par défaut, les quatre champs
> empilés : nom, obligatoire (l'identité) ; prenom, obligatoire
> (l'identité) ; age ; fonction. *(Les libellés sont les noms nus —
> aucun `label:`.)* Le widget de résumé : le prénom et le nom. **Le
> masque** : « Les membres de l'entreprise » ; aucun champ n'a d'aide,
> aucun n'y figure.
>
> **Le cycle de vie.** Aucun état.
>
> **Les opérations.** Aucune opération propre ; les actes du socle —
> créer, consulter, modifier, supprimer — sont ouverts.
>
> **Les règles.** Aucune.
>
> ## 4. Les scénarios d'utilisation
>
> ### Un membre du groupe par défaut
>
> *(Aucun groupe déclaré : le persona est généré, nommé par le groupe
> par défaut du socle.)*
>
> **Ce qu'il voit.** Le module annuaire, les personnes. Tous les
> droits.
>
> **Ses scénarios.** Aucun wizard, aucun scénario écrit : le tour de ses
> écrans — la liste des personnes, le formulaire d'une personne, les
> actes du socle à l'écran où ils se jouent.
>
> ## 5. La F.A.Q.
>
> *(Vide au dépôt : les questions et les réponses naissent avec
> l'instance.)*
>
> ## 6. Les annexes
>
> **Le glossaire des termes.** *Aucun terme déclaré.*
>
> **Le glossaire des types.** *Aucun type personnalisé.*
>
> **Le dictionnaire des données.**
>
> *(la vue de l'ensemble des entités : `personne` — nom souligné,
> prenom souligné, age, fonction)*
>
> personne — Les membres de l'entreprise ; module annuaire.
>
> | Champ | Type | Obligatoire | Défaut | Valeurs | Aide | Exemple |
> |---|---|---|---|---|---|---|
> | <u>nom</u> | un texte de 40 caractères au plus | oui (identité) | — | — | — | — |
> | <u>prenom</u> | un texte de 40 caractères au plus | oui (identité) | — | — | — | — |
> | age | un entier | non | — | — | — | — |
> | fonction | un texte de 60 caractères au plus | non | — | — | — | — |
>
> *(À l'instance, sur demande, la zone d'analyse de chaque champ : les
> valeurs, les statistiques d'utilisation, la volumétrie.)*
>
> **Le gabarit d'import de personne** — un fichier CSV, une ligne par
> personne ; les en-têtes sont les libellés, ici les noms :
>
> | nom | prenom | age | fonction |
> |---|---|---|---|
> | texte (40) — clé | texte (40) — clé | entier | texte (60) |
>
> Ligne d'exemple : vide — ni placeholder, ni valeur par défaut. La
> clé de rapprochement : le nom et le prénom. La procédure : l'écran
> d'import du module, le remplacement ou le complément, l'essai à
> blanc, le rapport cellule par cellule, puis l'import — tout ou rien ;
> l'export miroir pour corriger au tableur.

---

**Ce que la complétude relève** (le rapport, `syncytium document home
functional --check` — D1221) : le module sans description ; les quatre
champs sans `label:` (le nom nu, D1182), sans `hint:` ni `description:`
(D1199) ; le concepteur non nommé ; aucun persona déclaré (D1200) ;
l'entité sans aucun marquage `rgpd:`, signalée sans être qualifiée
(D1177). Ce qui ne compte pas : l'historique, les groupes,
l'authentification, les placeholders — des défauts du socle (D1173).
Un texte sur dix-neuf, comme le 05/10 — le tiny dit ce qu'une
configuration minimale donne, et ce qu'elle laisse à écrire.

## Le dictionnaire de la donnée — la déclinaison sur le plan acquis

*(La déclinaison du rang 2, écrite le 15/10/2026 sur le plan de
documentation.md §4 — cinq parties et deux annexes, D1241–D1303 — et
sur les règles du rang : les trois vues et les marques (D1213–D1214,
D1266–D1278), les groupes (D1273, D1279), les écarts et la section par
champ (D1281–D1286), les indicateurs (D1287–D1291), le stockage et le
format pivot (D1292–D1300), le hook de type (D1301), la reprise
(D1302). Le tiny reste la configuration minimale : tout ce qui suit
naît des vingt-six lignes de `syncytium.yml` et des défauts du socle
(configuration.md §3.5). Ce qui est de moi est marqué. **En
proposition.** La même documentation, telle que le moteur la
produirait, sans annotation : [01_tiny_dictionnaire.md](01_tiny_dictionnaire.md),
écrite le 16/10/2026 sur la demande de l'auteur.)*

---

> # tiny — Le dictionnaire de la donnée
>
> *La version 1.0.0.0 — production, la seule version active ; la langue
> du poste ; généré au dépôt : les données de l'instance absentes, leur
> cadre présent.*
>
> *(1. La couverture n'existe qu'en édition : le cartouche — tiny,
> 1.0.0.0, la date, l'auteur de l'édition — ; pas de filigrane, la
> version est en production.)*
>
> ## 2. La structure, avec ses évolutions
>
> ### 2.1 La version
>
> **Le projet.** `tiny` — Une entité, quatre champs et une application
> complète avec API et documentation ; le format `Syncytium-1.0`.
>
> **La version 1.0.0.0.** Production ; la langue du poste. Notes de
> version : « Version 1 de l'annuaire ». **L'historique** : première
> version, aucune version antérieure. **À venir** : aucune beta.
>
> ### 2.2 Le modèle
>
> **La vue des modules.** Un module, `annuaire`, sans lien.
>
> **La vue de l'ensemble des entités.** Un paquetage, une classe : les
> noms seuls, `nom` et `prenom` soulignés — l'identité ; rien en
> italique, ni étoile, ni gras : aucun calculé, aucun champ protégé,
> aucune référence.
>
> ```mermaid
> classDiagram
>   namespace module_annuaire {
>     class personne {
>       nom
>       prenom
>       age
>       fonction
>     }
>   }
> ```
>
> *(Les marques de D1213 absentes — Mermaid ne les porte pas ; la vue
> sélective du module `annuaire` est la même, le module n'ayant ni
> lien ni voisin.)*
>
> ### Le module annuaire
>
> *Aucune description.* Une entité.
>
> #### L'entité personne
>
> Les membres de l'entreprise.
>
> **L'identité.** `nom`, `prenom` — l'identité de naissance, les deux
> champs obligatoires de ce fait (D1170) ; écrite sous la forme
> `identity:`, elle se nomme « identity » par défaut (D1304). **Le visage.** `{prenom} {nom}`.
> **L'historisation.** Non — aucun instantané. **Le rgpd.** Aucun champ
> marqué.
>
> **Les champs.** Aucun groupe déclaré : les quatre champs forment le
> groupe implicite, en une seule table ; le formulaire du socle n'a pas
> d'onglet (D1273).
>
> | Nom | Type | Libellé | Aide | Obligatoire | Défaut | Confidentialité | Exceptions d'écriture | Depuis |
> |---|---|---|---|---|---|---|---|---|
> | `nom` | un texte de 40 caractères au plus | nom | — | oui (l'identité) | — | public | — | 1.0.0.0 |
> | `prenom` | un texte de 40 caractères au plus | prenom | — | oui (l'identité) | — | public | — | 1.0.0.0 |
> | `age` | un entier | age | — | non | — | public | — | 1.0.0.0 |
> | `fonction` | un texte de 60 caractères au plus | fonction | — | non | — | public | — | 1.0.0.0 |
>
> *(Le libellé est le nom, par le gabarit `${name}` du socle (D1181) ;
> aucune exception d'écriture (D1311) — aucun groupe, un seul
> utilisateur, tous les droits (D1176).)*
>
> **Les règles.** Aucune validation, aucun calculé, aucun état, aucun
> automatisme.
>
> **Les sections des champs.** *(Aucune : nul champ n'a de description
> détaillée, d'historique au-delà de sa naissance, d'évolution à venir
> ni d'opération ; la télémétrie n'existe qu'avec l'instance — D1283, la
> section ne s'écrit que si l'un de ses éléments existe.)*
>
> ## 3. Le stockage
>
> *Le storage `sqlite` de l'environnement `home` — la seule famille
> déclarée ; le `describe(model)` de sa classe (D1299).*
>
> **La table `personne`** *(ma lecture : le nom de l'entité, la règle de
> nommage de la classe sqlite ; le module n'est pas préfixé tant qu'il
> n'y a pas d'homonyme).*
>
> | Le logique | La colonne | Le type natif | Nul | L'origine |
> |---|---|---|---|---|
> | l'identité technique (D142) | `id` | TEXT (uuid) | non | la clé primaire |
> | `nom` | `nom` | TEXT, 40 au plus | non | `text[..40]` → texte |
> | `prenom` | `prenom` | TEXT, 40 au plus | non | `text[..40]` → texte |
> | `age` | `age` | INTEGER | oui | `integer` → entier |
> | `fonction` | `fonction` | TEXT, 60 au plus | oui | `text[..60]` → texte |
> | le soft delete (D141) | `deleted_at` | TEXT (horodatage) | oui | le socle |
> | l'audit (D76) | `created_at`, `created_by`, `updated_at`, `updated_by` | TEXT | — | le socle |
>
> *(Les colonnes du socle sont à étudier — D1305 : leur implémentation
> n'est pas faite, une autre approche reste possible ; les noms écrits
> ici sont des jalons. La déclinaison de chaque type en élémentaire —
> D1298 — est en colonne « origine ».)*
>
> **Les index.** Une clé unique sur (`nom`, `prenom`), les actifs
> seulement — l'identité (D141, D1292). Aucun autre : aucun
> `searchable:` — rien n'est cherchable (D1308) —, aucune référence,
> aucun état, aucune liste à critères déclarée. **Les partitions.** Aucune (D1293).
>
> **Les tables de Syncytium.** La version (D680) ; `user` (D719) — un
> seul utilisateur, sans authentification ; les compteurs de télémétrie
> (D39). Pas de tables de reprise.
>
> ## 4. L'origine
>
> **4.1 Reprise des données.** *Absent — aucune migration déclarée
> (D1302).*
>
> **4.2 Les imports.** Une entité importable, `personne` : le gabarit
> `personne.csv` — les colonnes `nom`, `prenom`, `age`, `fonction`, par
> les noms ; la clé de rapprochement `nom` + `prenom` ; la ligne
> d'exemple par le `placeholder` des types (D1307 — aucun champ n'a le
> sien). Le fichier se télécharge depuis l'écran d'import.
>
> **4.3 Les opérations.** Aucune opération déclarée ; les quatre actes du
> socle — la création, la lecture, la modification, la suppression —
> sur `personne`, par l'écran et par l'API.
>
> ## 5. L'usage
>
> **5.1 Où sert chaque champ.** *(L'index, trivial ici : la synthèse par
> entité tient en une ligne, le détail en quatre.)*
>
> | Le champ | Où il sert |
> |---|---|
> | `nom` | l'identité ; le visage `{prenom} {nom}` ; la liste et le formulaire du socle |
> | `prenom` | l'identité ; le visage ; la liste et le formulaire |
> | `age` | la liste et le formulaire |
> | `fonction` | la liste et le formulaire |
>
> `personne` n'est référencée par aucune entité et n'en référence
> aucune.
>
> **5.2 Les droits.** Aucun groupe déclaré : un seul utilisateur, tous
> les droits (D1176) — la matrice a une ligne, `personne`, et une
> colonne, « tous » ; les quatre actes permis, sans condition. Aucun
> profil de confidentialité : tout est `public`.
>
> **5.3 Les données.** *(Avec l'instance seulement — au dépôt, le
> cadre vide : le volume de `personne`, les créations, les
> modifications, les suppressions par période ; par champ le renseigné,
> la diversité, pour `age` le minimum, le maximum, la moyenne et la plage
> occupée, pour les textes les longueurs — D1287 ; les valeurs par
> fréquence si Pareto 80/20 — D1290.)*
>
> ## Annexes
>
> ### A. La configuration dépliée
>
> *(Un seul arbre — D1245, D1250, D1306 : les défauts du socle écrits aux
> trois niveaux — « un outil tiers ne peut pas les déduire seul » —, le
> catalogue dans la langue du poste ; aucune clé `*` à retirer. Les
> valeurs sont celles de l'inventaire des défauts de configuration.md
> §3.5 ; la forme est de moi, en proposition.)*
>
> ```yaml
> from: Syncytium-1.0
> name: tiny
> description: Une entité, quatre champs et une application complète avec API et documentation
> visibility: promotional
> environments:
>   home:
>     description: Exécution en mode local
>     storage: { name: sqlite, family: storage, class: sqlite }
> versions:
>   production:
>     environment: home
>     1.0.0.0:
>       languages: [<la langue du poste>]
>       title: tiny
>       release-notes: Version 1 de l'annuaire
>       history: false
>       menu: { annuaire: { personne: { label: personne, link: personne[list] } } }
>       settings: { field: { text: { normalize: trim(me) } } }
>       groups: {}
>       modules:
>         annuaire:
>           title: annuaire
>           entities:
>             personne:
>               title: personne
>               description: Les membres de l'entreprise
>               label: "{prenom} {nom}"
>               identities: { identity: [nom, prenom] }
>               history: false
>               allow: [create, read, update, delete]
>               fields:
>                 nom:      { type: text[..40], required: true,  mode: editable, label: nom,      confidentiality: public, default: null, unchanged: false }
>                 prenom:   { type: text[..40], required: true,  mode: editable, label: prenom,   confidentiality: public, default: null, unchanged: false }
>                 age:      { type: integer,    required: false, mode: editable, label: age,      confidentiality: public, default: null, unchanged: false }
>                 fonction: { type: text[..60], required: false, mode: editable, label: fonction, confidentiality: public, default: null, unchanged: false }
>               gui:
>                 lists:  { default: { searchable: [], columns: [nom, prenom, age, fonction] } }
>                 forms:  { default: { items: [nom, prenom, age, fonction] } }
> ```
>
> ### B. Le glossaire des types
>
> | Le type | En clair | Les contraintes | L'exemple |
> |---|---|---|---|
> | `text[..40]` | un texte de 40 caractères au plus | les blancs rognés (`trim`) | le `placeholder` du type (D1307) |
> | `text[..60]` | un texte de 60 caractères au plus | idem | le `placeholder` du type |
> | `integer` | un entier | sans borne | le `placeholder` du type |

---

**Ce que la complétude relève** (`syncytium document home dictionnaire
--check`, D1221) : *le même relevé que la fonctionnelle* — aucun
`title:`, aucune `description:` de module, aucun `hint:` ni
`description:` de champ, aucun `placeholder:` ; et, propre au
dictionnaire : aucun groupe de champs (acceptable à quatre champs) ;
aucun `searchable:` — rien n'est cherchable (D1308), un choix que le
dictionnaire dit et que la complétude ne relève pas. Ce que le dictionnaire montre malgré tout : la
structure entière, le stockage, les index, le gabarit d'import, la
configuration dépliée — tout ce que le concepteur n'a pas écrit, le
socle le dit.

## Les frottements relevés

*(chaque frottement = une décision à prendre ; mes lectures en
proposition)*

1. **L'identité rend-elle les champs obligatoires ?** — *soldé*
   (D1170–D1171) : oui, « cela découle de la définition » ; la table dit
   « oui (identité) ». Une entité peut porter plusieurs identités,
   nommées (`identities:`) : la première est l'identité de naissance,
   obligatoire ; les suivantes sont acquises — un compteur attribué à
   la validation — et leurs champs ne sont pas obligatoires. Le tiny
   n'en a qu'une.
2. **L'historique par défaut** — *soldé* (D1173) : `history:` non
   déclaré = inactif (D168) ; la documentation écrit « pas
   d'historique » en clair, et la complétude ne le compte pas comme un
   manque : un défaut du socle est un choix. `history: true` aux
   settings de la version l'activerait partout (D1174) ; le tiny n'a
   pas de settings.
3. **Les droits sans groupe** — *soldé* (D1176) : ni `groups.yml`, ni
   authentification — le tiny est le mono-poste de D759, le cas `none` :
   l'utilisateur et le groupe par défaut, le degré administrateur ; la
   documentation écrit « un seul utilisateur, tous les droits », la
   complétude ne relève pas ce défaut du socle (D1173).
4. **Le socle dans la documentation** (le point ouvert 11) : le
   chapitre 2 vient de Syncytium, identique pour toute application ;
   la configuration ne le nourrit pas. À confirmer.
5. **Le registre vide d'une entité nominative** — *soldé* (D1177) :
   `nom`, `prenom`, `age`, `fonction` sans `rgpd:` — la documentation
   dit « rien à inscrire » ; la complétude signale l'entité sans aucun
   marquage comme un point à relire, sans qualifier ses champs : elle
   compte, elle ne devine pas. Le marquage se généralise par un type
   personnalisé qui le porte (`nom: { type: text[..40], rgpd: personal }`,
   D1178) ; le tiny, minimal, n'en déclare pas.
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
8. **Le nom nu** — *soldé* (D1181–D1182) : sans `label:`, le libellé
   est le gabarit du socle `${name}`, résolu sur la clé de la
   configuration (`prenom`, sans accent — D124) ; le tiny le montre tel
   quel, sans embellissement, et la complétude compte le `label:`
   absent : un texte pour le lecteur manque — un défaut du socle n'est
   pas un manque, sauf quand il tient lieu d'un texte (D1173 précisé).

*Les cinq frottements en attente sont soldés le 10/10/2026
(D1170–D1182) ; les neuf de la déclinaison le sont tous.*
9. **Les chapitres de l'instance au dépôt** — *soldé* (D1157) : la
   supervision (chapitre 14), l'assistance (chapitre 16) et la
   troisième source n'existent qu'avec l'instance — la documentation du
   dépôt les montre vides, avec leur cadre.
