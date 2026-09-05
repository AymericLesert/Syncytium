# Le cas 3 — l'entrepôt de données : la conversion Cegid PMI

*Le cadre du cas — la mise en situation (Q59/D756–D757) : le
contexte, les parcours, **la forme** (le dépôt écrit pour de vrai)
et **les manques** (chaque frottement devient une décision). Les
décisions citées renvoient à [../docs/conception.md](../docs/conception.md).*

*Le cas est ouvert le 03/09/2026 — la maison **`03_entrepot`**
(D857 : « renomme-le 03_reprise », « Renomme plutôt 03_reprise en
03_dwh », puis « "entrepot" est approprié » — la conversion Cegid
PMI prend le troisième rang de l'échelle sous le nom de l'entrepôt
qu'elle alimente, le mot de D180/D756 ; la collecte des commandes
glisse au quatrième). Le cas suivant sera « la gestion des commandes
industrielles » (le cas 4, `04_sales_collection`, relu à son
ouverture).*

## Le contexte (D859)

**« Un outil de conversion de données (le passage de Cegid PMI à un
entrepôt de données) et la vérification de règles métiers. »**
(D756) — le sommaire ; **le contexte posé par l'auteur le
03/09/2026 (D859), mot pour mot :**

> Cet exemple présente la capacité de Syncytium à assurer la
> migration de données d'un connecteur à un autre en appliquant un
> mapping, des règles de conversion et des règles de vérification.
> Le cas d'usage porte sur une conversion de données issue de l'ERP
> Cegid vers un entrepôt de données. Cette conversion vise à
> standardiser, à harmoniser et à fiabiliser les données exploitées
> par les différentes strates de l'entreprise (de l'opérateur aux
> dirigeants). Elle met également en avant les règles de droit sur
> la consultation des entités et des champs.
>
> La standardisation consiste à mapper la bonne information dans le
> bon module et la bonne entité. L'harmonisation vise à convertir
> les données pour extraire les informations utiles. La
> fiabilisation garantit que les informations disponibles sont
> justes et sont accessibles à la bonne personne. Par conséquent,
> les données ne respectant pas les règles de conversion et de
> vérification font l'objet d'un état sur la qualité des données et
> sur l'avancement de l'intégration dans l'entrepôt. Le non respect
> des règles fait l'objet d'état à destination d'un destinataire
> capable de traiter la correction des données d'origine.
>
> L'utilisation de cet exemple construit pour certaines entités un
> historique des changements de valeur.
>
> Dès que les données sont disponibles, un tableau de bord
> affichant des indicateurs de pilotage offre une vue globale du
> fonctionnement de l'entreprise.
>
> Un ERP est vaste aussi pour cet exemple, nous allons limiter le
> périmètre à :
>
> - les données techniques (articles, gammes & nomenclatures,
>   tarifs) ;
> - les clients et les fournisseurs ;
> - les commandes de vente et d'achat ;
> - la gestion des stocks et les mouvements.

**La lecture au registre** — chaque visée a son acquis :

- **la capacité montrée** : la migration d'un connecteur à un autre
  — le `from:` (D610), les migrations déclarées (D662), le mapping
  (D646–D672) — **avec un mapping, des règles de conversion et des
  règles de vérification** ;
- **standardiser** = le `to:` du mapping (D655–D656 : la bonne
  entité du bon module, la clé fonctionnelle D654) ;
- **harmoniser** = les conversions : la normalisation par champ
  calculé (D660), les constructeurs de composés (D659), `extract`
  (D817), le hook de type de la date `AAAAMMJJ` (D119/D820) ;
- **fiabiliser** = deux garanties : **la justesse** — les règles de
  vérification (la validation au champ et à l'entité D364/D404,
  l'acceptation « converti ET cohérent » D177) — et **l'accès à la
  bonne personne** — les droits de consultation sur les entités et
  les champs (la confidentialité P8/D25–D27, les droits d'action
  D196, le degré des groupes D699) : **de l'opérateur aux
  dirigeants**, le premier exemple de l'échelle aux droits réels ;
- **l'état de la qualité et de l'avancement** = le module
  `migration` (D666/D668 : la couverture, les rejets et leurs
  causes, l'historique de la qualité) — les non conformes ne sont
  pas portées (D177), le rapport va **au destinataire capable de
  corriger l'origine** (D179 : la correction à la source ; D406 :
  `report: { to: }`, le destinataire déclaré) ;
- **l'historique des changements de valeur** pour certaines
  entités = `history:` déclaré (D411–D413), nourri par le
  différentiel du rejeu (D672 : seuls les écarts s'écrivent) — la
  continuité de l'alimentation en découle (le mode `relative`,
  l'`every:` de `migrate` D667) ;
- **le tableau de bord des indicateurs de pilotage** = le dashboard
  du catalogue (D554–D558, les kpi D527) ; « dès que les données
  sont disponibles » : le rafraîchissement (D249/D555) ou l'issue
  de `migrate` (le patron D853) — à arbitrer au morceau du
  pilotage ;
- **le périmètre** : quatre domaines — les données techniques
  (articles, gammes & nomenclatures, tarifs), les clients et les
  fournisseurs, les commandes de vente et d'achat, les stocks et
  les mouvements — les modules de l'entrepôt en germe (le nommage
  au morceau 2 ; la nomenclature et la gamme = la composition
  auto-référencée D135).

**La première réponse du cadrage (D858)** — **« La connotation
décisionnelle sera portée par cet exemple pour mettre en avant la
construction de dashboard, de génération de documents, de
listes… »** : l'exemple met en avant **la restitution** sur les
données converties — les tableaux de bord (D554–D558), les documents
générés (D212/D559–D565), les listes (D441–D447) — le volet
« restitution » de D180 joué pour de vrai.

**La couverture à deux étages (D861)** — le second temps du
cadrage, mot pour mot :

> Pour commencer, l'objectif est de couvrir toutes les tables et
> tous les champs de la source. Si une table ou un champ présent
> dans un schéma de la base de données SQL Server ne sont pas
> décrits dans la source de la configuration, une anomalie doit
> être remontée. L'état de la couverture du schéma ou un indicateur
> de taux de couverture du schéma s'appuie sur la description
> décrite en base via la configuration. L'état de la couverture des
> données ou un indicateur du taux de couverture de la données
> s'appuie sur le nombre de lignes de chaque table.
>
> Pour notre exemple, nous allons partir de la version de Cegid
> PMI 16.17.

La lecture au registre :

- **l'exhaustivité** : `source/` décrit **le schéma SQL Server
  entier**, table par table et champ par champ (D176/D648) — le
  hors-périmètre (D859) déclaré `ignored` (D657 : « on peut
  ignorer, jamais oublier ») ; l'ossature engendrée par
  `read_instance` (D653) rend la chose tenable sur des centaines de
  tables ;
- **l'anomalie** : toute table ou tout champ du schéma réel absent
  de la description = une anomalie remontée — la complétude
  confrontée au schéma (D653) **à l'ingestion de la version et à
  chaque `migrate`** (le schéma peut bouger sous la description :
  une mise à jour de Cegid), le rapport de non-couverture au
  technicien (D179) ;
- **l'état du schéma** — le taux s'appuie sur la description de la
  configuration : par table et par champ, trois états — **décrit et
  migré**, **déclaré ignoré**, **absent de la description**
  (l'anomalie) — et **deux taux scindés (D862)** : **la complétude
  du schéma** (les décrits et les ignorés rapportés au schéma réel
  — cent pour cent quand tout est déclaré, l'écart = les
  anomalies) et **la couverture du schéma** (les migrés rapportés
  au schéma réel — les ignorés affichés à part, l'exclusion
  assumée) ;
- **l'état de la couverture des données** — le taux s'appuie sur le
  nombre de lignes de chaque table : les lignes intégrées
  rapportées aux lignes de la table source, les rejets creusent
  l'écart (le `filter:` D663 hors taux — le périmètre déclaré) ;
- **les deux états = des données du module `migration`**
  (D666/D668 — deux grains : l'entité et le champ pour le schéma,
  la ligne pour les données), leur vue = les surfaces du module,
  leur histoire = l'historisation (l'évolution de la qualité) ;
- **la version : Cegid PMI 16.17** — le schéma réel à fournir est
  celui-là (la question 4).

**L'accès et le volume (D863)** — le troisième temps du cadrage,
mot pour mot : **« L'accès se fait en lecture directe sur la base
de production. Le volume concerne quelques dizaines de milliers de
lignes d'articles, quelques centaines de clients et de fournisseurs
et quelques millions de lignes de mouvements de stocks. »** La
lecture au registre :

- **la production, en direct** : le connecteur `cegid` lit la base
  vivante — la lecture seule (D175) devient une garde, pas une
  convention : rien ne s'écrit chez Cegid ; la fenêtre du `every:`
  aux heures creuses (l'esprit D7), `timeout:` et `retry:` (D625),
  la classe `sqlserver` responsable de lire sans gêner
  l'exploitation ;
- **le volume** — les articles ~10⁴, les tiers ~10², les mouvements
  de stocks ~10⁶ : **le premier exemple au-delà de l'échelle
  domestique** — la lecture au curseur (D689) et l'écriture en lots
  (D688) pour de vrai ;
- **le point que le volume pose** : le différentiel par
  comparaison (D672) relit et compare chaque enregistrement à
  chaque passage — sur des millions de mouvements chaque nuit, le
  coût est réel ; **le `filter:` en fenêtre glissante** (D663 —
  `filter: date >= now() - …`) borne la relecture aux mouvements
  récents, **si les mouvements sont immuables une fois écrits** — à
  arbitrer au morceau du mapping (les corrections de Cegid
  passent-elles par un contre-mouvement ou par une modification ?).

**Les écarts des mouvements de stocks (D864)** — la réponse, mot
pour mot : **« Dans le principe, les mouvements de stocks sont
immuables, une correction passe par un contre-mouvement.
Malheureusement, dans certains cas, des outils "maisons" apportent
des ajustements sur la donnée directement pour corriger des défauts
de saisie. L'idée est de consulter les écarts. Cela peut
représenter une charge de travail pour le serveur conséquent.
L'analyse des écarts est un sujet qui doit être couvert par
Syncytium. »** La lecture :

- **la fenêtre glissante est écartée** : elle serait aveugle aux
  ajustements directs portés sur des lignes anciennes — la
  détection doit être **exhaustive** (toute ligne, toute nuit) **et
  légère** (la charge du serveur de production) ;
- **consulter les écarts** : ce que les outils maison ont changé
  après coup — et ce qu'ils ont supprimé — se voit dans l'entrepôt,
  se rapporte, s'analyse ;
- **l'analyse des écarts est un sujet du socle**, pas du seul cas —
  deux manques ouverts, en proposition dans « Les manques
  relevés » : **M1 la détection des écarts à l'échelle**, **M2 la
  consultation et l'analyse des écarts**.

**Ce que le registre porte déjà du cas** — la lecture avant le
cadrage :

- **la date Cegid `AAAAMMJJ`** (D119 — l'exemple fondateur des
  quatre facettes du type : la chaîne chez PMI, l'entier 4 octets
  au stockage, `JJ/MM/AAAA` à l'écran, la date au calcul) — « le
  futur cas 3 » annoncé par D820 : la paire de conversion portée
  par **un hook de type** (D681–D683), pas par un masque de
  lecture ;
- **la posture entrepôt** (D180) : l'entrepôt de données fiable —
  la qualité (D177 : converti ET cohérent), la couverture (D176 :
  « on peut ignorer, jamais oublier »), la provenance (D178), la
  temporalité (D168–D174), l'IHM en consultation **et correction** ;
  opérationnel à l'échelle TPE, pas OLAP ;
- **la reprise** (D175–D179) : le connecteur de reprise = un storage
  ordinaire **en lecture seule**, à durée de vie administrée ; les
  rejets = **un rapport, jamais une quarantaine** — la correction à
  la source, la relance sur les manquants ;
- **le mapping** (D646–D672) : `source/` dans la grammaire —
  l'ossature engendrée par `read_instance` (D653), `ignored` à
  l'entité ou au champ (D657), la normalisation (D660), le
  `filter:` du périmètre (D663) ; `mapping/` aux clés
  fonctionnelles (D654) ; **le mode `relative`** (D649/D671 — les
  conformes portés, les erreurs isolées, le taux de couverture) ;
  le module `migration` historisé (D666/D668) ; `migrate`
  déclenchée comme toute opération (D667 — l'`every:` calendaire) ;
  le différentiel par comparaison au rejeu (D672) ;
- **les règles métiers** : la validation au champ et à l'entité
  (D364/D404), le rapport des non-conformes affectable à un
  utilisateur ou un groupe, par mail ou notification (D406–D407).

## Ce que le cas éprouve

- **le mapping entier (D646–D672) en situation réelle** : `source/`
  sur un schéma Cegid PMI — des centaines de tables, l'exhaustivité
  tenue par `ignored` à l'entité (D657) —, les règles, **le mode
  `relative`** ;
- **la posture entrepôt (D180)** : le taux de couverture, les
  rejets, la vue de migration (D666) — et **l'alimentation
  continue** : l'`every:` de `migrate` (D667), le différentiel
  (D672), les clés sur toutes les règles (la garde D825) ;
- **le premier hook de type d'un exemple** (D119/D820 — la maison
  `hooks/types/`, D644/D777) ;
- **le premier storage lu par connexion**, pas par fichier — la
  classe `sqlserver` consignée (D613/D619), un schéma d'une
  instance SQL Server (D860) : `read_instance` pour de vrai
  (D653/D829), la lecture au curseur (D689) ;
- **le premier storage cible `postgresql`** (D860 — le domestique
  portait le sqlite natif D729) : l'entrepôt = un schéma, l'instance
  du contrat (D680), la duplication et la bascule par schéma (D674)
  sous leur forme native ;
- **le volume** (D863 — des millions de mouvements de stocks, la
  production lue en direct) : le curseur (D689), les lots (D688) et
  le différentiel (D672) à l'épreuve — la fenêtre glissante du
  `filter:` (D663) à arbitrer ;
- **la vérification de règles métiers** (D404) sur les données
  converties, le rapport aux responsables (D406) ;
- **les droits de consultation sur les entités et les champs**
  (D859 — P8/D25–D27, D196, rights.md) : le premier exemple de
  l'échelle aux droits réels, de l'opérateur aux dirigeants ;
- **la couverture à deux étages** (D861–D862) : le schéma entier
  décrit ou ignoré, l'anomalie de l'absent, **les trois taux** — la
  complétude du schéma, la couverture du schéma, la couverture des
  données par les lignes — au module `migration` ;
- **l'historique des changements de valeur** (D859 — `history:`
  D411–D413 nourri par le différentiel D672) sur certaines
  entités ;
- **la restitution décisionnelle** (D858) : les tableaux de bord,
  les documents générés et les listes du catalogue (le domaine 4)
  sur les données converties — la connotation décisionnelle assumée
  par l'exemple ;
- **la première application d'entreprise de l'échelle** :
  l'authentification autre que `none` (D692), les groupes et les
  degrés (D699–D701 — `migrate` au degré `administrator`), le smtp
  réel (la condition indispensable D626), peut-être deux
  environnements (D342/D617 — le staging sur une copie, la
  production sur la base réelle).

## Les données réelles (D865)

Deux classeurs fournis le 05/09/2026, **hors du dépôt**
(`Workspace/`, à côté du dépôt — jamais dedans) :

- **le schéma** — `PMI-schema.xlsx` : deux feuilles, *Tables* (330
  objets : le schéma SQL, le nom, table ou vue, le nombre de
  colonnes) et *Colonnes* (13 512 colonnes : la position, le type
  SQL, la longueur, la précision, l'échelle, la nullabilité, le
  défaut) — **sans les contraintes** (ni clés primaires, ni index,
  ni clés étrangères) ;
- **l'extraction anonymisée** — `PMI-extraction-anonymisee.xlsx` :
  cinq tables (`ARTICLE`, `NOMENC`, `MVTSTO`, `CLIENT`, `FOURNIS`)
  à cent lignes chacune, la société `100` seule, et la feuille
  *Anonymisation* (la règle par colonne : les libellés remplacés,
  les utilisateurs en `USR`, les adresses génériques, les noms en
  pseudonymes stables, SIRET/TVA/banque masqués, les textes libres
  vidés). **Ces données sont confidentielles : elles n'entrent
  jamais dans les commits** — le cas cite la structure, jamais une
  valeur, même anonymisée ; les analyses de travail vivent dans le
  scratchpad de session, hors dépôt.

**La lecture du schéma :**

- **la carte des schémas SQL** : `dbo` porte l'ERP historique (246
  tables, 12 vues, 10 346 colonnes) ; les schémas typés de la
  16.17 (`Production`, `Stock`, `Project`, `Crm`, `Common`, `adt`
  l'audit, `Cache`, `idt`) portent les tables neuves aux noms
  anglais, aux `datetime` vrais, à l'`Id` et au `RowVersion` ;
  `OData` = 43 vues (2 798 colonnes), la façade de l'API ;
- **la convention de nommage de `dbo`** — `<XX><K|C|I><T|N|J|S><nom>` :
  `XX` le préfixe de la table (`AR` article, `CL` client **et**
  fournisseur — la même structure à 167 colonnes, `NO`
  nomenclature, `MV` mouvement, `EC`/`LC` entête/ligne de document,
  `TA` tarif, `RM` remises, `DP` stock par dépôt-lot, `AD` adresse,
  `CT` contact) ; la troisième lettre : **`K` = colonne de clé**,
  `C` = colonne, `I` = identifiant hors clé (l'origine du
  mouvement, le code concaténé) ; la quatrième : **`T` = texte**
  (`nchar` à largeur fixe — 8 645 colonnes sur 13 512, le
  remplissage à blancs), **`N` = nombre** (`decimal` 2 900, `int`),
  **`J` = jour** — `nchar(8)` `AAAAMMJJ`, 552 colonnes : **la date
  est une chaîne en 16.17, pas un entier** —, **`S` = heure**
  (`nchar(6)` `HHMMSS`) ;
- **la société** : la première colonne de clé partout (`ARKTSOC`,
  `CLKTSOC`, `MVITSOC`… `nchar(3)`) — le multi-sociétés ;
  l'extraction filtre la société `100` : le `filter:` de D663 sur
  chaque entité source ;
- **les dates** : `date` au `mask: "yyyymmdd"` (D820) et `time` au
  masque `hhmmss` suffisent — **le hook de type de D119 n'est pas
  nécessaire pour la 16.17** (la question 11 répondue par le réel ;
  le hook reste l'outil des autres legacies) ; le couple jour +
  heure (`MVCJMVT` + `MVCSMVT`) se recompose par le constructeur
  du type (D659) ; les dates vides sont absentes (`None` dans
  l'échantillon) ;
- **les clés naturelles** portées par les colonnes `K` :
  `ARTICLE` (société, code `nchar(18)`, complément `nchar(6)`),
  `CLIENT`/`FOURNIS` (société, code `nchar(6)`), `NOMENC` (société,
  produit fini, complément, ligne), `TARIF` (sept colonnes dont la
  date d'application), `STDEPLOT` (sept colonnes : article, lot,
  emplacement, dépôt…), `ECOMCLI` (société, numéro, **indice** —
  la révision de la commande), `LCOMCLI` (+ ligne, `PSF`) ;
  **`MVTSTO` n'a aucune colonne `K`** : ses cinq colonnes `I`
  (société, numéro, ligne, indice, composant — l'origine) donnent
  70 valeurs distinctes sur 100 lignes — **pas de clé naturelle
  visible** ; les tables `ARTICLE`, `CLIENT`, `FOURNIS`, `TARIF`,
  `ADRESSE`, `CONTACT` portent un compteur `ROWVER` ;
- **les familles** : treize genres de documents en paires `E*`/`L*`
  (91 et 124 colonnes — commandes clients/fournisseurs/internes,
  demandes, expéditions, offres, réceptions…) ; les tables
  d'extension `U*` (`UARTICLE`, `UCLIENT`, `UFOURNIS`, `UECOM*`,
  `ULCOM*` — les champs propres au site) ; **les vues de
  compatibilité** de `dbo` sur les tables neuves (`NOMENC` ↔
  `Production.BomRange`, `BATCH` ↔ `Stock.Batch`, `POSTES` ↔
  `Production.WorkstationMachine`, `CONTROLE` ↔
  `Production.IdCONTROLE`) — les gammes et les nomenclatures vivent
  ensemble dans `BomRange` (la nature du composant : matière ou
  opération).

**Les questions que le réel pose (R1–R6) :**

1. **R1 — la clé de `MVTSTO`.** Le classeur ne porte pas les
   contraintes : existe-t-il un index unique sur les mouvements ?
   Sans clé, le mode `relative` est interdit à la règle (la garde
   D825) — l'identité par l'empreinte (la ligne est son contenu,
   les doublons comptés) ou une clé composée déclarée sont les
   deux issues. **Une feuille *Contraintes* (clés primaires, index
   uniques, clés étrangères) ajoutée au classeur du schéma servirait
   aussi les dépendances de D648.**
2. **R2 — la vue ou la table.** Pour `NOMENC`, `BATCH`, `POSTES`,
   `CONTROLE` : décrire la table neuve (l'`Id`, les `datetime`, le
   `RowVersion`) et déclarer la vue `ignored`, ou l'inverse (les
   noms que les outils du site connaissent) ?
3. **R3 — les vues `OData` et les schémas techniques** (`adt`,
   `Cache`, `Common`, `Crm`, `idt`, `Project`) : `ignored` en bloc ?
4. **R4 — les genres de documents** : `ECOMCLI`/`LCOMCLI` et
   `ECOMFOU`/`LCOMFOU` seuls, ou aussi les offres (`EOFFCLI`), les
   expéditions (`EEXPCLI`), les réceptions (`ERECFOU`), les
   commandes internes (`ECOMINT`) ? Et les tables d'extension `U*` ?
5. **R5 — la date au masque** plutôt qu'au hook de type : la
   question 11 se referme ainsi, à confirmer.
6. **R6 — le `nchar`** : le rognage des blancs de fin est un geste
   de la classe `sqlserver` à la lecture (D683 — la fonction de
   valeur `read`), pas une règle de mapping à répéter 8 645 fois —
   à confirmer.

**Les réponses du 05/09 (D866) — R1, R2, R3 et la date de D119 :**

- **la date de D119 tient** : « j'avais indiqué un entier. Une
  chaîne de caractères composée uniquement de numérique peut
  également être vue comme un entier » — l'exemple fondateur n'est
  pas démenti par la 16.17 : la chaîne de chiffres et l'entier sont
  la même chose vue du masque ; **le `mask: "yyyymmdd"` (D820) lit
  l'une comme l'autre** (l'entier au masque — D370), le hook de
  type reste l'outil des formats que le masque ne dit pas (**R5
  refermée**) ;
- **R1 — les clés** : « les clés d'une table dans PMI contiennent
  un "K" en 3ème position. Et la base de données ne contient
  aucune clé étrangère » — la convention fait foi : **les colonnes
  K = la clé** (`identity:` de l'entité source, D357) ; **aucune
  clé étrangère** : les dépendances de D648 ne se lisent pas dans
  le schéma, **elles se déclarent dans `source/`** (le raccourci
  de référence `code_article: article.code` — D396, la jointure par
  la clé D654) ; **`MVTSTO` n'a pas de clé** — la conséquence, en
  proposition : **l'identité par l'empreinte** — `key:
  connector.fingerprint` sur la règle (l'information système du
  connecteur, le patron D849 : la ligne est son contenu, le
  condensé calculé en natif par la classe — la pièce 1 de D864) ;
  la garde D825 est satisfaite, le mode `relative` admis ; une
  ligne modifiée par un outil maison = une disparue + une nouvelle,
  l'écart d'une entité en ajout seul (M2) ; les doublons stricts
  comptés par la migration ;
- **R2 — la vue `NOMENC`** : « doit être vue comme une table » —
  l'entité source `NOMENC` décrite et migrée comme une table ;
  `Production.BomRange`, comme tout le reste, décrite en entier ;
- **R3 — pas d'ignorance en bloc** : « toutes les tables doivent
  être citées en entier (pas d'utilisation de patterns) » — chaque
  objet du schéma (les 330, vues `OData` et schémas techniques
  compris) décrit **avec toutes ses colonnes typées** ;
  `reprise.yml` liste ses fichiers **un par un**, sans regex (le
  pattern D806 reste licite ailleurs, l'auteur le refuse ici) ;
  l'ossature engendrée depuis le schéma réel (D653 — le rôle de
  `read_instance`), le technicien la raffine ; **la taxonomie de la
  couverture s'ajuste** (D861–D862) : la complétude = décrit /
  absent, la couverture = migré / décrit sans règle — *l'état
  « ignoré » : conservé pour une exclusion explicite, ou l'exclusion
  se lit-elle dans l'absence de règle ? à trancher* ; **le schéma
  entier dans le dépôt public** (330 fichiers engendrés, 13 512
  lignes de colonnes) — à confirmer par l'auteur, qui connaît le
  statut de ce schéma.

**Les réponses du 05/09 (D867) — R4, R5, R6 :**

- **R4 — le périmètre resserré « pour l'exemple »** : « uniquement
  les clients et les fournisseurs, pas les commandes, les offres…
  Ce n'est que pour l'exemple. Si nous prenons en compte tous les
  cas, cela pourrait être long et fastidieux. Je souhaite juste
  montrer l'utilisation du module migration pour alimenter un
  entrepôt de données et disposer de la mécanique pour accéder aux
  données de l'entrepôt et pour disposer de quelques écrans de
  consultation. » — **aucun document** (ni commandes, ni offres, ni
  expéditions, ni réceptions) : les paires `E*`/`L*` décrites (R3)
  mais sans règle ; **l'ambition du cas** : le module `migration`
  qui alimente l'entrepôt, la mécanique d'accès aux données (l'IHM
  et l'API), quelques écrans de consultation — le périmètre de D859
  s'amende ; *à clarifier : les données techniques (`ARTICLE`,
  `NOMENC`, `TARIF`) et les stocks (`MVTSTO`, `STDEPLOT`) restent-ils
  au mapping — l'extraction les porte, et les mouvements portent le
  sujet des écarts (D863–D864) — ou le mapping se réduit-il aux
  tiers (`CLIENT`, `FOURNIS`, avec `ADRESSE` et `CONTACT` ?)* ;
- **R5 — la date au masque** : « une date au masque simplifie la
  conversion des données et cela peut éviter un hook » — confirmé
  (D820/D866) ;
- **R6 — le rognage des blancs = un réglage** : « disposer d'une
  option dans les settings pour indiquer que les blancs sont
  rognés et une option sur les champs pour éventuellement
  surcharger cette option » — **un réglage de la cascade des
  settings** (D359/D588 : l'application → le module → l'entité) et
  **une facette du champ** qui le surcharge ; le nom proposé :
  **`trim`** (`trim: true | false`) — le défaut du socle `false`
  (rien ne s'altère en silence — l'esprit D311), le cas le pose à
  `true` aux settings de la version, le champ qui garde ses blancs
  déclare `trim: false` ; la classe storage l'applique à la lecture
  (D683) et l'entrée (l'IHM, l'API, l'import) à l'écriture.

**Les points de précision (D868) — l'analyse itérative**, mot pour
mot :

> - Le schéma de la source est décrit dans la configuration.
> - Syncytium compare la structure réelle à la description et note
>   les écarts au technicien.
> - Il serait plus facile de laisser Syncytium construire le modèle
>   à partir d'une analyse du schéma fournie par le connecteur.
>   Mais, dans le cadre d'une migration, chaque table et chaque
>   colonne doivent être comprises et analysées par un technicien.
> - Les écarts ne doivent pas être vus comme des écarts ou des
>   négligences mais comme des points à creuser… Les écarts sont
>   présents pour permettre au technicien de savoir où il en est
>   de son analyse.
> - La migration est une procédure itérative qui permet d'exploiter
>   les données justes au fur et à mesure de l'analyse.

La lecture — ce qui se corrige et ce qui se précise :

- **la description est un acte du technicien, jamais une
  génération** : `read_instance` (D653) sert la comparaison, pas
  l'écriture — l'ossature engendrée que je proposais (D866) est
  retirée ; chaque table et chaque colonne décrite l'est parce
  qu'elle a été comprise ;
- **le non-décrit = un point à creuser**, pas une anomalie ni une
  négligence : le mot « anomalie » de D861 se relit — la
  confrontation au schéma réel (D653) rend au technicien **la liste
  de ce qui reste à analyser**, son marque-page ; et le mot
  « écart » se réserve aux données qui bougent après coup (D864 —
  les mouvements retouchés), pour ne pas confondre les deux ;
- **la complétude du schéma (D862) = l'avancement de l'analyse** :
  décrit sur réel, qui monte au fil des itérations (l'historisation
  du module `migration` D668 en fait la courbe) ; **la couverture**
  = ce que l'entrepôt prend ;
- **R3 relue** : « toutes les tables citées en entier » = **chaque
  table décrite l'est avec toutes ses colonnes**, sans pattern et
  sans ignorance en bloc — la description **grandit** table par
  table, elle n'est pas complète au premier jour ; *`ignored`
  proposé comme la conclusion d'une analyse — « compris et écarté »
  — qui avance la complétude sans avancer la couverture, distinct
  du point à creuser ; à confirmer* ;
- **la migration itérative** : à chaque itération, ce qui est
  analysé et mappé entre dans l'entrepôt et s'exploite — le
  versionnement plein de `source/` et `mapping/` (D670 : le bump du
  build, le statut `beta/`), la couverture historisée (D668) ;
- **l'exemple montre un état de l'analyse** : les tiers décrits et
  migrés, le reste du schéma en points à creuser — la question du
  schéma entier dans le dépôt public se dissout : seules les tables
  analysées y figurent.

**Les arbitrages du 05/09 (D869–D870) — R1 revue, les trois états,
`normalize`, le périmètre, le jeu de données :**

- **R1 revue — la description porte les clés et les références**
  (D869) : « comme nous devons décrire le schéma d'origine, nous
  décrivons les champs, les clés et les références externes (sous
  forme de liste ou d'association). Donc, peu importe la
  codification ou la description des contraintes du schéma. La
  table MVTSTO dispose bien de clés (avec un I à la place de K).
  Dans cet exemple, nous voyons que les clés n'ont pas un nommage
  unique ;-) » — `source/` parle la grammaire du modèle (D652) :
  `identity:` (D357) pour la clé, le raccourci de référence (D396),
  `list of` et `association with` (D399–D401) pour les dépendances
  — **le technicien les déclare, le schéma réel n'a pas à les
  porter** (les contraintes SQL et la feuille *Contraintes*
  deviennent sans objet) ; **`MVTSTO` a sa clé : ses colonnes `I`**
  — l'empreinte proposée sous D866 est retirée ; *l'échantillon
  donne 70 valeurs distinctes sur 100 pour les cinq `I` seules, 100
  avec l'article, la date et l'heure : l'`identity:` exacte se
  fixera à l'analyse de la table* ;
- **les trois états** (D869) : « la migration va référencer les
  tables migrées et quelques tables à ignorer, pour l'exemple. Les
  autres tables apparaîtront en "non défini". Toutes les colonnes
  ne seront pas non plus décrites pour les faire apparaître comme
  "non défini" » — **migré / ignoré / non défini**, aux deux grains
  (la table, la colonne) ; `ignored` = « compris et écarté » (la
  proposition D868 reçue par l'usage), **« non défini » = le point à
  creuser** ; l'exemple montre les trois, et des colonnes non
  définies dans des tables décrites ;
- **`normalize:` remplace `trim`** (D870) : « la propriété "trim"
  sur les chaînes de caractères répond à un besoin unique. Je
  verrai plutôt une option "normalize" qui fasse référence à une
  fonction de transformation qui, elle, peut être définie comme un
  hook. Dans notre cas, "trim" sera une fonction fournie par
  Syncytium (normalize: trim) » — **la normalisation à la frontière
  par une fonction** : `normalize: <fonction>` dans la cascade des
  settings (D359/D588) et en facette du champ qui la surcharge ; la
  fonction vient du catalogue (D570–D601 — `trim` en fait partie,
  D660 l'employait) ou d'un hook de fonction (D432/D592) ; le cas :
  `normalize: trim` aux settings de la version ; le voisin de
  vocabulaire noté : `searchable: normalized` (D367) est un mode de
  recherche, `normalize:` une transformation ;
- **le périmètre confirmé** (D869) : « le périmètre comprend bien
  les tables que j'avais initialement définies » — les données
  techniques (`ARTICLE`, `NOMENC`, `TARIF`), les tiers (`CLIENT`,
  `FOURNIS`), les stocks et les mouvements (`MVTSTO`, `STDEPLOT`) ;
  *les commandes de D859 sous la réserve de R4 (« pas les
  commandes ») — à confirmer d'un mot* ;
- **le jeu de données construit** (D869) : « les données ne sont
  pas présentes dans l'extraction, c'est volontaire. Par contre,
  pour les besoins de l'exemple, nous construirons le jeu de
  données que nous pourrions publier sans risque » — l'extraction
  anonymisée reste hors dépôt ; **l'exemple portera un jeu de
  données construit, publiable** (à composer au morceau de la
  source, sur la structure réelle) ;
- **en attente** : les quatre pièces de D864 (« j'ai besoin d'un peu
  plus de réflexion ») ; **la cible** : « nous ne l'avons pas encore
  abordée » — la question 6 s'ouvre ensuite.

**Les arbitrages du 05/09 (D871–D873) — l'identité contrôlée,
`normalize` paramétré, les commandes de retour :**

- **le contrôle de l'identité avant la migration** (D871) : « la
  migration doit garantir aussi que la définition de l'identité
  sur une entité est bien une clé avant de lancer la procédure de
  migration. Ce contrôle s'appuie uniquement sur les données
  consultables après l'application du filtre des données à lire »
  — avant de lire, `migrate` vérifie sur le réel que l'`identity:`
  déclarée de chaque entité source **est une clé** (aucun doublon)
  **dans le périmètre du `filter:`** (D663 — la société 100) ; le
  manquement arrête la procédure et se rapporte au technicien (la
  garde de D825 gagne son pendant sur les données) ; la question de
  `MVTSTO` se règle ainsi : le technicien déclare, le contrôle
  tranche ; le décompte des clés distinctes après filtre est un
  geste ensembliste de la classe storage, jamais une relecture
  ligne à ligne ;
- **`normalize:` paramétré — une expression sur la valeur** (D872,
  amende D870) : « je pense qu'il peut être utile d'utiliser des
  paramètres : `normalize: trim(me)`, `normalize: right("0000" +
  me, 4)`… » — `normalize:` porte **une expression du langage**
  (D90–D92) où **`me` désigne la valeur à normaliser** ; le
  catalogue (D570–D601) et les hooks de fonction (D592) y sont
  disponibles ; le cas : `normalize: trim(me)` aux settings de la
  version, la surcharge au champ avec ses propres paramètres (le
  code sur quatre positions : `right("0000" + me, 4)`) ; `me` à
  l'étage du champ = sa valeur, comme `me` à l'étage de la règle =
  l'enregistrement (D822–D823) ;
- **les commandes restent au mapping** (D873, lève la réserve de
  R4) : « les commandes de vente et d'achat restent au mapping. Ces
  éléments sont utiles pour montrer un lien complet entre les
  articles, les clients et les fournisseurs » — le périmètre de
  D859 vaut en entier : les données techniques, les tiers, **les
  commandes de vente (`ECOMCLI`/`LCOMCLI`) et d'achat
  (`ECOMFOU`/`LCOMFOU`)**, les stocks et les mouvements ; les autres
  genres de documents (les offres, les expéditions, les réceptions,
  les internes) hors mapping — décrits ou non définis ;
- **le contrôle des compositions et des associations** (D874,
  complète D871) : « au même titre que le contrôle de l'identité,
  Syncytium doit inclure le contrôle sur les compositions et les
  associations » — avant de lancer, sur les données du `filter:`,
  chaque lien déclaré dans `source/` (D869 : `list of`,
  `association with`, le raccourci de référence) est vérifié :
  **tout enfant a son possesseur, toute association et toute
  référence ont leur cible** — l'intégrité référentielle que le
  schéma ne porte pas (D866 : aucune clé étrangère) se prouve sur
  le réel ; le manquement se rapporte au technicien avant la
  procédure ; *à préciser : l'arrêt comme pour l'identité — la
  procédure ne part pas — ou l'orphelin laissé au mode `relative`
  qui l'isole (D177/D179) ; et, au morceau de la source, la forme
  de la jointure sur un schéma étranger — l'enfant porte la clé du
  possesseur sous ses propres noms (`LCKTNUMERO` pour
  `ECKTNUMERO`), là où D399 ne fait rien déclarer à l'enfant* —
  **les deux points tranchés le 06/09 (D875–D876)** :
  - **l'orphelin isolé** (D875) : « l'orphelin est laissé au mode
    relative qui l'isole. L'enregistrement contenant un orphelin ne
    sera pas enregistré dans la cible. Une anomalie sera remontée
    au technicien » — le pré-contrôle rapporte, la procédure part ;
    l'enregistrement à l'orphelin n'entre pas dans la cible (D177)
    et l'anomalie va au technicien ; seule l'identité brisée arrête
    (D871) ;
  - **le connecteur porte la facette des types** (D876) : « la
    description d'un modèle fait référence à différents types dont
    le connecteur porte la facette. Par exemple : pour une
    composition, le lien entre le parent et le fils se fait sur les
    noms de colonnes identités identiques. Pour une association, le
    lien pourra se faire par une convention de nommage des
    colonnes. Pour un type composé, les colonnes qui feront
    référence à un objet dépendra de la convention de nommage » —
    la description de `source/` reste **logique** (`lignes: list of
    LCOMCLI`, `client: CLIENT`, un composé), et **le connecteur
    résout les colonnes par sa convention** (la facette de stockage
    des types, D119/D681–D684, tournée vers la lecture d'un schéma
    étranger) : la composition par les colonnes d'identité aux noms
    identiques, l'association par une convention de nommage, le
    composé par la convention qui désigne ses colonnes ; D399 tient
    — l'enfant ne déclare rien, la facette trouve le lien ; **le
    cas** : la convention `<XX><K|C|I><T|N|J|S><nom>` — le nom
    logique sans le préfixe de table (`SOC`, `NUMERO` identiques
    d'`ECOMCLI` à `LCOMCLI`), K ou I = l'identité, la lettre de type
    = le type — portée par le connecteur `cegid` : un paramètre de
    convention de la classe `sqlserver`, ou une classe dédiée — à
    arbitrer à l'assise ; *l'indice de révision absent des lignes
    (`ECKTINDICE`) : une question d'analyse des commandes, que le
    contrôle des liens (D874) mettra au jour*.

## Les questions du cadrage

*(posées le 03/09/2026 — les réponses de l'auteur feront les
arbitrages, comme les huit de la banque et les neuf du véhicule)*

**A. Le contexte**

1. **Qui utilise l'entrepôt, et pour quoi faire ?** L'administrateur
   qui pilote la migration ; les lecteurs (le contrôle de gestion,
   la qualité, l'ADV, la production ?) ; d'autres applications
   (l'API versionnée de l'entrepôt — D11) ? Ce que l'application
   montre (les vues de l'entrepôt, les vues de couverture), ce
   qu'elle ne fait pas (aucune écriture vers Cegid, pas d'OLAP, pas
   un remplacement de l'ERP — à confirmer). *Répondue (D858/D859) :
   les usagers = les strates de l'entreprise, de l'opérateur aux
   dirigeants, sous les droits de consultation ; l'application
   montre la restitution décisionnelle — le tableau de bord des
   indicateurs de pilotage, les documents générés, les listes — et
   l'état de la qualité et de l'avancement ; le « ne fait pas »
   reste à confirmer.*
2. **Le lien avec le cas suivant** — « la gestion des commandes
   industrielles » : l'entrepôt l'alimente-t-il (les commandes lues
   dans l'entrepôt, pas dans Cegid) ? Le périmètre du cas 4 en
   dépend.

**B. La source — le réel**

3. **L'instance Cegid PMI** : le moteur (SQL Server ?), la version,
   **l'accès** (la connexion directe en lecture sur la base de
   production, une copie nocturne, des exports ?), le volume (le
   nombre de tables, d'enregistrements). *Répondue en partie
   (D860) : « L'instance Cegid est le schéma d'une instance
   SQLServer. L'entrepôt de données est un schéma PostgreSQL. » —
   le connecteur `cegid` = `storage` de classe `sqlserver` en
   lecture seule sur un schéma de l'instance, le connecteur
   `entrepot` = `storage` de classe `postgresql`, l'entrepôt = un
   schéma ; la version — Cegid PMI 16.17 (D861). Soldée par D863 :
   « L'accès se fait en lecture directe sur la base de production.
   Le volume concerne quelques dizaines de milliers de lignes
   d'articles, quelques centaines de clients et de fournisseurs et
   quelques millions de lignes de mouvements de stocks. »*
4. **Le réel à fournir** — comme les CSV de la banque et les
   classeurs des véhicules : **une extraction du schéma** (le DDL ou
   la liste tables/colonnes, anonymisée) et **un échantillon de
   données**. Sans le réel, aucun nom de table Cegid ne s'écrira
   ici : je ne les connais pas de façon fiable, et le cas se
   construit sur le vrai. L'alternative : l'auteur nomme de mémoire
   un petit périmètre. *Soldée (D865) : le schéma entier et cinq
   tables anonymisées reçus le 05/09 — voir « Les données
   réelles » ; les contraintes manquent encore (R1).*
5. **Le périmètre fonctionnel de départ** : les articles (les
   nomenclatures, les gammes — la composition auto-référencée D135),
   les tiers, les commandes clients, les ordres de fabrication, les
   stocks et les mouvements, les achats, la facturation ? Lesquels
   en premier, lesquels `ignored` ? *Répondue (D859) : quatre
   domaines — les données techniques (articles, gammes &
   nomenclatures, tarifs), les clients et les fournisseurs, les
   commandes de vente et d'achat, les stocks et les mouvements ; le
   reste de l'ERP hors périmètre. Amendée (D867) : aucun document —
   « uniquement les clients et les fournisseurs » ; confirmée
   (D869) : les données techniques et les stocks restent, « le
   périmètre comprend bien les tables initialement définies » ;
   les commandes de vente et d'achat de retour (D873) — le
   périmètre de D859 en entier, les autres genres de documents hors
   mapping.*

**C. La cible**

6. **Le modèle de l'entrepôt** : existe-t-il déjà (un modèle cible
   défini dans le contexte professionnel de l'auteur) ou se
   conçoit-il ici, depuis le périmètre ? Les noms en français, comme
   le domestique (D764) ?
7. **Les règles métiers** : des exemples concrets — les règles que
   Cegid n'impose pas (le champ obligatoire vide, la référence
   orpheline, la date incohérente, le prix nul…). Et **la posture
   face à la violation** : le rejet (D177 — l'enregistrement non
   porté, le rapport D179, la correction dans Cegid) ou
   l'enregistrement **porté et signalé** (l'anomalie visible dans
   l'entrepôt) ? Le registre dit le rejet ; l'entrepôt de D180 dit
   « consultation et correction » — à trancher. *Répondue en partie
   (D859) : les non conformes font l'objet d'un état, vers un
   destinataire capable de corriger l'origine — la posture du rejet
   (D177/D179) ; les exemples de règles restent à donner.*
8. **L'enrichissement** : l'entrepôt porte-t-il des champs qui ne
   viennent pas de Cegid (une classification, un commentaire, un
   responsable) ? Le différentiel (D672) compare champ par champ
   les champs alimentés ; les champs possédés par l'entrepôt
   doivent lui rester — un frottement possible.

**D. L'exploitation**

9. **Le rythme** : la conversion unique (`absolute`) ou
   l'alimentation continue (`relative`, l'`every:` nocturne, le
   différentiel D672, `reset: false` et la clé sur chaque règle —
   D825) ? Le cadre du cas dit `relative`. *Répondue en partie
   (D859) : l'historique des changements de valeur implique
   l'alimentation continue — `relative` et le différentiel ; la
   fréquence reste à fixer.*
10. **L'entreprise** : l'authentification (`azure_ad`, `local` ?),
    le smtp réel pour les rapports, les groupes (qui reçoit le
    rapport des rejets, qui lance `migrate` — le degré
    `administrator` D701), **un ou deux environnements** (le staging
    sur une copie de la base, la production sur la base réelle —
    D342/D617) ?
11. **La date `AAAAMMJJ`** : le hook de type (D119/D820 —
    `hooks/types/`, le premier écrit dans un exemple) est le chemin
    supposé — plutôt qu'un `mask` à la lecture d'une colonne
    entière (D820 lit du texte). À confirmer. *Répondue par le réel
    (D865) : en 16.17 la date est une chaîne `nchar(8)` — le
    `mask: "yyyymmdd"` de D820 suffit, le hook est sans objet
    ici (R5). Refermée (D866) : la chaîne de chiffres et l'entier
    de D119 sont la même chose vue du masque.*

## Les morceaux proposés

*(à arbitrer — le protocole D457/D756 : un morceau à la fois, validé
avant le suivant ; l'ordre suit la conversion, le cœur du cas)*

1. **l'assise** — la racine et les environnements (staging /
   production ?), les connecteurs : `entrepot` (le storage
   `postgresql` — un schéma, D860), `cegid` (le storage `sqlserver`
   en lecture seule — D175/D860 — **la production lue en direct**
   D863, un schéma de l'instance, et sa carte `entities:` D828, les
   tables du périmètre D859),
   l'authentification, le smtp,
   `logging.yml` (D830), **les groupes** (`groups.yml` D414 — les
   strates, de l'opérateur aux dirigeants, le degré D699) ;
2. **le modèle cible** — les modules de l'entrepôt sur les quatre
   domaines du périmètre (D859, en français), **les droits de
   consultation sur les entités et les champs** (D859 — la
   confidentialité, les `allow:`), `history:` sur les entités qui
   gardent leurs changements de valeur (D859/D411–D413), **les
   validations = les règles métiers** (D404), le `report:` au
   destinataire capable de corriger l'origine (D406/D859) ;
3. **la source** — `source/` : **les tables analysées, chacune avec
   toutes ses colonnes typées** (D861/D866/D868 — l'acte du
   technicien, aucun pattern, aucune génération ; les dépendances
   déclarées faute de clés étrangères, les clés aux colonnes K, les
   normalisations D660, le `filter:` D663 sur la société), **la date
   au masque** (D820/D867), le reste du schéma **en points à
   creuser** (D868) ;
4. **le mapping** — `mapping/` (la clé sur chaque règle D825,
   `parent:`, `distinct:` D658), la migration déclarée `relative` +
   `reset: false` + l'`every:` nocturne (D667), la provenance
   (D178), le différentiel (D672) — **et la détection des écarts à
   l'échelle** (D863/D864 — la fenêtre glissante écartée, les
   manques M1/M2 en proposition) ;
5. **le pilotage et la restitution** — **l'état de la qualité et de
   l'avancement** (D859 — les surfaces du module `migration` : les
   trois taux — la complétude du schéma, la couverture du schéma,
   la couverture des données (D861–D862) —, les rejets et leurs
   causes, D666/D668), le rapport
   au destinataire (D406), et **la restitution décisionnelle**
   (D858) : **le tableau de bord des indicateurs de pilotage**
   (D859 — la vue globale du fonctionnement de l'entreprise,
   D554–D558/D527, rafraîchi dès que les données sont disponibles),
   les documents générés (D559–D565), les listes (D441–D447) sur
   l'entrepôt.

## La forme — le dépôt

*(à écrire morceau par morceau — le protocole D457/D756)*

Le dépôt vivra dans `examples/03_entrepot/` — la maison alignée un
cas = un exemple (D827/D857).

## Les manques relevés

*(chaque frottement = une décision consignée)*

### M1 — la détection des écarts à l'échelle (D864, en proposition)

**Le frottement.** Le différentiel du registre (D672) compare
l'enregistrement reconstruit à la cible, champ par champ, après le
mapping : il suppose la relecture entière de la source à chaque
passage. Sur des millions de mouvements chaque nuit, la relecture
coûte — sur le serveur de production (D863) comme dans le moteur
(le mapping de millions de lignes pour quelques écarts). La fenêtre
glissante est écartée (D864 — aveugle aux ajustements directs).

**La proposition — l'empreinte dans la provenance.** La provenance
(D178) porte déjà, par enregistrement, le connecteur d'origine, la
date de reprise et la clé existante ; **elle porte aussi l'empreinte
de la ligne source** (le condensé des colonnes lues). La détection
se joue alors **au niveau clé + empreinte, avant tout mapping** :

1. **la lecture légère** — la classe storage rend, pour l'entité
   source, le couple (clé, empreinte) de chaque ligne : **l'empreinte
   est calculée en natif par la classe** (le patron visiteur
   D681–D684 — `HASHBYTES` côté SQL Server, `md5` côté PostgreSQL,
   le code côté csv/xlsx), triée par la clé ; le curseur (D689)
   enchaîne ; rien de la ligne ne voyage sinon la clé et le
   condensé ;
2. **la comparaison en flot** avec la provenance, triée par la même
   clé : **les nouveaux** (la clé inconnue), **les modifiés**
   (l'empreinte changée), **les disparus** (la clé absente de la
   source — la suppression directe, un écart aussi) ;
3. **la relecture entière des seuls nouveaux et modifiés**, qui
   passent le mapping, les règles et le différentiel champ par champ
   (D672 — l'historisation D168 garde l'ancienne valeur) ;
4. **le pré-contrôle par partition** (l'option pour les grandes
   tables) : avant le couple par ligne, **un agrégat par partition**
   (le nombre de lignes et le condensé agrégé, par mois de la date
   du mouvement — une requête groupée, une ligne par mois) comparé
   aux agrégats mémorisés ; seules les partitions qui bougent
   passent à l'étape 1 — la nuit ordinaire relit quelques mois, pas
   des années.

**La grammaire — presque rien.** L'empreinte est un fait de la
provenance, le moteur la tient ; la partition se déclare sur
l'entité source : `partition: date_mouvement[month]` (la nature au
crochet, D382) — une propriété de `source/` (aux côtés d'`ignored`
D657 et de `filter:` D663). Le différentiel de D672 demeure : il
est la seconde comparaison, sur les lignes qui ont bougé.

### M2 — la consultation et l'analyse des écarts (D864, en proposition)

**Le frottement.** L'historisation (D168) garde l'évolution des
valeurs de la cible ; le module `migration` (D666) tient la
couverture et les rejets — mais **l'écart comme objet** (« cette
ligne a changé après coup, voilà quoi ») n'existe nulle part.

**La proposition.** Les écarts détectés (M1) deviennent **des
données du module `migration`** : par passage, par entité source,
par clé — le genre (nouveau, modifié, disparu), les champs changés
avec l'ancienne et la nouvelle valeur (le fruit de D672), la date.
Puis **la qualification par la source** : l'entité source déclare
`immutable: true` quand ses lignes ne sont pas censées changer
(les mouvements) — **l'écart sur une entité immuable est une
anomalie** rapportée au destinataire (`report:` D406, la cascade
D407), l'écart sur une entité vivante (les articles, les tarifs)
est la vie normale, gardée par l'historisation seule. La
consultation = les surfaces du module : la liste des écarts filtrée
par entité/genre/période, le kpi des écarts par nuit, le
drill-down vers l'historique de l'enregistrement cible (D168–D174).

**Les quatre pièces à arbitrer** : l'empreinte dans la provenance
(D178 étendue) ; le pré-contrôle par partition (`partition:` sur
l'entité source) ; `immutable:` sur l'entité source ; les écarts
comme entités du module `migration`.
