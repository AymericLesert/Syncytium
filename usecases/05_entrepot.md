# Le cas 7 — l'entrepôt de données : la conversion Cegid PMI

*Le cadre du cas — la mise en situation (Q59/D756–D757) : le
contexte, les parcours, **la forme** (le dépôt écrit pour de vrai)
et **les manques** (chaque frottement devient une décision). Les
décisions citées renvoient à [../docs/conception.md](../docs/conception.md).*

*Le cas est ouvert le 03/09/2026 (le cas 3 devenu le cas 5 par la
renumérotation D1027 — le registre garde « cas 3 » dans son histoire) — la maison **`05_entrepot`**
(D857 : « renomme-le 03_reprise », « Renomme plutôt 03_reprise en
03_dwh », puis « "entrepot" est approprié » — la conversion Cegid
PMI prend le troisième rang de l'échelle sous le nom de l'entrepôt
qu'elle alimente, le mot de D180/D756 ; la collecte des commandes
glisse au quatrième — au sixième depuis D1027). Le cas suivant, `06_sales_collection`, est
devenu la lecture de documents par hooks (D1022).*

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
  `report: { to: }`, le destinataire déclaré — porté par chaque règle
  de migration, D929) ;
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
  consultation et l'analyse des écarts** — **soldés par la remise à
  plat de l'auteur (D878)** : la comparaison par partition en cinq
  blocs, `coverage:` sur l'entité source, l'écart traité par
  l'`history:` de la destination.

**Ce que le registre porte déjà du cas** — la lecture avant le
cadrage :

- **la date Cegid `AAAAMMJJ`** (D119 — l'exemple fondateur des
  quatre facettes du type : la chaîne chez PMI, l'entier 4 octets
  au stockage, `JJ/MM/AAAA` à l'écran, la date au calcul) — « le
  futur cas 3 [5] » annoncé par D820 : la paire de conversion portée
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
  utilisateur ou un groupe, par mail ou notification (D406–D407),
  porté par chaque règle de migration (D929).

## Ce que le cas éprouve

- **le mapping entier (D646–D672) en situation réelle** : `source/`
  sur un schéma Cegid PMI — des centaines de tables, l'exhaustivité
  tenue par `ignored` à l'entité (D657) —, les règles, **le mode
  `relative`** ;
- **la posture entrepôt (D180)** : le taux de couverture, les
  rejets, la vue de migration (D666) — et **l'alimentation
  continue** : l'`every:` de `migrate` (D667), le différentiel
  (D672), toutes les règles rapprochables (la garde D825, réécrite
  par D930) ;
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
  converties, le rapport aux responsables (D406 — par la règle,
  D929) ;
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
  réel (la condition indispensable D626), deux environnements
  (D342/D617/D945 — le staging sur une copie, la production sur la
  base réelle).

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
  est une chaîne en 16.17, pas un entier** —, **`S` = la semaine**
  (`nchar(6)` — lue « heure » à l'analyse puis « hhmm » (D992),
  **corrigée par D1000 : « le S en 4ème position décrit en général la
  semaine »**, déduite du jour, non reprise ; l'heure, s'il y en a une,
  se surcharge au champ) ;
- **la société** : la première colonne de clé partout (`ARKTSOC`,
  `CLKTSOC`, `MVITSOC`… `nchar(3)`) — le multi-sociétés ;
  l'extraction filtre la société `100` : le `filter:` de D663 sur
  chaque entité source ;
- **les dates** : `date` au `mask: "yyyymmdd"` (D820) et `time` au
  masque `hhmmss` (D992, amendée par D1001 — la seule heure lue,
  MVCTSAI, porte les secondes) suffisent — **le hook de type de D119
  n'est pas nécessaire pour la 16.17** (la question 11 répondue par le
  réel ; le hook reste l'outil des autres legacies) ; le couple jour +
  heure (`MVCJSAI` + `MVCTSAI`, D1001 — la colonne S est la semaine,
  D1000) se recompose par le constructeur du type (D659) ; les dates
  vides sont absentes (`None` dans l'échantillon) ;
- **les clés naturelles** portées par les colonnes `K` :
  `ARTICLE` (société, code `nchar(18)`, complément `nchar(6)`),
  `CLIENT`/`FOURNIS` (société, code `nchar(6)`), `NOMENC` (société,
  produit fini, complément, ligne), `TARIF` (sept colonnes dont la
  date d'application), `STDEPLOT` (sept colonnes : article, lot,
  emplacement, dépôt…), `ECOMCLI` (société, numéro, **indice** —
  la révision de la commande), `LCOMCLI` (+ ligne ; `PSF` est l'indice
  — D951) ;
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
    arbitrer à l'assise ; *l'indice de révision des lignes : `LCKTPSF`, sous un autre nom que
    l'entête (D951)* ;
  - **la convention surchargeable** (D877, complète D876) : « si la
    convention n'est pas possible ou ne convient pas au technicien,
    la convention pourra être surchargée et cela rendra possible ce
    point sur des modèles de données autres que ceux portés par
    Syncytium » — la convention de la classe est **un défaut** ; le
    technicien la surcharge au connecteur (une autre convention
    déclarée), à l'entité ou au champ (les colonnes nommées
    explicitement — le lien d'une composition, la colonne d'une
    association, les colonnes d'un composé), **le plus proche
    l'emporte** (l'esprit D359) ; ainsi `source/` décrit **tout
    modèle de données**, pas seulement ceux que Syncytium porte ou
    dont il connaît la convention ; la forme des surcharges
    s'écrira au morceau de la source, sur les tables.

## La cible — la proposition (question 6, ouverte le 06/09/2026)

*(en attente d'arbitrage — le modèle détaillé, champ par champ,
s'écrira au morceau 2 une fois les choix tranchés)*

**Le principe** (D859) : standardiser = « mapper la bonne
information dans le bon module et la bonne entité » — l'entrepôt
**n'est pas une copie de PMI** : pas les 181 colonnes de l'article,
mais les champs que l'analyse retient (D868), nommés en français
(le précédent domestique, D764), typés par le catalogue (`amount`,
`date`, `enum`, `duration`…), à l'identité = la clé fonctionnelle
(D357) ; la société est filtrée à la source (D663 — une seule
société) et **ne serait pas portée** par l'entrepôt ; l'entrepôt
est **en lecture pour ses usagers** — les écritures viennent de
`migrate` (le privilège porté par l'écriture identifiée reprise,
D175), les entités en `allow: [read]` pour les groupes (D422–D423).

**Quatre modules, les quatre domaines** (D859/D873 — le module
structure la donnée et l'expérience, D416 : le menu et les droits
d'un domaine vont ensemble) :

1. **`technique`** — `article` (le code et le complément en
   identité, les libellés, **la famille et la sous-famille en
   énumérés** — D883, les listes closes de PMI —, les unités, poids
   et dimensions, les prix de revient, le statut) ; **`nomenclature`**
   = la composition de l'article, `article.nomenclature: list of
   nomenclature` — la ligne porte la nature (composant ou
   opération — l'énuméré de PMI), **le composant en référence à
   `article`** (la composition auto-référencée D135, l'acyclicité
   validée), la quantité et l'unité, **les temps de gamme en
   `duration`** (D378 — la notation industrielle), le jalon ;
   **`tarif`** = la composition de l'article, `article.tarifs: list
   of tarif` — le genre (client ou fournisseur), le code, le numéro
   de tarif, la date d'application, le prix : la validité dans le
   temps vient de la source, sans `history:` ;
2. **`tiers`** — **le choix ouvert** : PMI porte `CLIENT` et
   `FOURNIS` sur la même structure (167 colonnes identiques) ;
   **la proposition : un parent `tiers` décrit une fois, deux
   enfants `client` et `fournisseur` par `inheritance:`** (D353 —
   la première mise en œuvre de l'héritage dans un exemple ; le
   code en identité chez l'enfant) ; les alternatives : une seule
   entité à `role:` (client, fournisseur, les deux), ou deux entités
   indépendantes ; les compositions **`adresses`** (les adresses
   complémentaires d'`ADRESSE`) et **`contacts`** (`CONTACT` — les
   personnes : `rgpd: personal` D695, le premier exemple au RGPD) ;
   l'adresse principale en **`geolocation`** (D638 — l'adresse
   normalisée et les coordonnées `CLCNGPSX`/`CLCNGPSY` par le
   constructeur D659) ; les référentiels par `distinct:` (le pays,
   la devise, le mode et les conditions de règlement, le
   représentant) ; le SIRET et la TVA en texte validé ;
3. **`commande`** — le même choix : `ECOMCLI`/`ECOMFOU` et
   `LCOMCLI`/`LCOMFOU` partagent leurs structures ; **la
   proposition : un parent `commande` décrit une fois (l'entête et
   la composition `lignes: list of ligne`), deux enfants
   `commande_client` (+ `client: tiers.client`) et
   `commande_fournisseur` (+ `fournisseur: tiers.fournisseur`)** ;
   l'identité = le numéro **et l'indice** de révision ; la ligne :
   `article: technique.article`, la quantité, le prix, les délais
   (les couples jour + heure de PMI recomposés en `datetime` —
   D659), le statut ; **pas de machine à états** — l'entrepôt
   consulte, le statut est un énuméré venu de PMI ; c'est « le lien
   complet entre les articles, les clients et les fournisseurs »
   (D873) ;
4. **`stock`** — **`mouvement`** (l'identité aux colonnes `I`, à
   fixer à l'analyse — D869/D871 ; l'article, le dépôt,
   l'emplacement, le lot, **la date et l'heure en un `datetime`**,
   la quantité, le prix unitaire, la valeur, le type et le genre en
   énumérés, le stock et le PMP d'avant) — **`history: true`** : les
   retouches des outils maison (D864) se consultent dans
   l'historique (D878 — les écarts complètent) ; **`stock`**
   (`STDEPLOT` — l'article, le lot, l'emplacement, le dépôt, les
   quantités, les dates) — **`history: true`** : le stock à une
   date (D412 — la lecture à date) ; les référentiels `depot`,
   `emplacement`, `lot` par `distinct:` (ou `Stock.Batch` pour le
   lot — l'analyse dira).

**L'historique** (D859 — « pour certaines entités ») — la liste
proposée : `stock` et `mouvement` (ci-dessus), `article` (les prix
et le statut qui changent), `tiers` (les adresses et les
conditions) ; sans : `nomenclature`, `commande` (l'indice est déjà
la révision), `tarif` (la date d'application est déjà la validité).

**Les droits** (D859 — « de l'opérateur aux dirigeants », les
strates) — `groups.yml` (D414/D699), en proposition : `production`
(technique + stock), `commercial` (les clients, les commandes de
vente), `achats` (les fournisseurs, les commandes d'achat),
`direction` (tout — et seuls avec `achats` à voir **les champs
financiers** : les prix de revient, les prix d'achat, les marges —
la confidentialité au champ, P8/D25–D27/D70–D77), `administration`
(le degré `administrator` : `migrate`, `reset_coverage`) ; les
modules portent les menus de chaque strate (D416).

**La restitution** (D858/D859) — au morceau 5 : les listes de
chaque entité, **le tableau de bord de pilotage** (la valeur du
stock, les commandes en cours, le carnet par client, les articles
sans mouvement…), des documents (un état de stock, une fiche
article).

**Les choix à arbitrer :**

1. le modèle **conçu ici** depuis le périmètre — ou existe-t-il
   déjà chez l'auteur ?
2. **quatre modules** `technique` / `tiers` / `commande` / `stock`,
   en français ;
3. la standardisation : les champs retenus par l'analyse, la
   société non portée, **les montants** — `amount` en EUR ou le
   `decimal` à devise visuelle (D832) ?
4. **`client`/`fournisseur` par `inheritance:`** sur un parent
   `tiers` — ou une entité à `role:`, ou deux entités ;
5. **`commande` par `inheritance:`** de même — ou deux entités ;
6. **`history:`** sur `stock`, `mouvement`, `article`, `tiers` ;
7. **les groupes** production / commercial / achats / direction /
   administration, les champs financiers restreints ;
8. **l'entrepôt en lecture** pour ses usagers, `migrate` seul
   écrit.

### Les arbitrages de la cible (D882, le 06/09/2026)

Les huit choix tranchés, mot pour mot :

> Dans les données, nous avons aussi des montants avec des devises
> différentes (sur les tarifs, les prix unitaires, …). Pour
> l'historique des modifications, toutes les tables citées
> ci-dessus sont concernées, sauf les mouvements de stock. L'indice
> n'est pas lié à la nomenclature, malheureusement. Par conséquent,
> l'historique porte aussi sur la nomenclature.
>
> 1. Pour ce cas d'usage, je n'ai pas de modèle. Je te laisse faire
>    une proposition qui convertit un ensemble de champs tel que
>    nous conservons la cohérence des données sans être exhaustif.
> 2. La décomposition en 4 modules me convient.
> 3. La standardisation reporte ce que nous avons déjà vu dans les
>    exemples précédents.
> 4. L'héritage du tiers en fournisseur et client met en lumière
>    cette fonctionnalité.
> 5. Pour les commandes, nous n'appliquerons pas d'héritage. Nous
>    allons séparer les commandes d'achat et les commandes de
>    vente.
> 6. Vu ci-dessus.
> 7. Les champs restreints conviennent car cela montre le
>    fonctionnement des droits en consultation.
> 8. L'entrepôt est en lecture seule.
>
> Ce cas d'usage présente :
>
> - la composition (à l'image de ce que nous avons déjà décrit dans
>   les cas d'usage précédents) — la nomenclature est une
>   composition de l'article, une ligne de commande est une
>   composition d'une commande, … La suppression d'un article
>   supprime la nomenclature… mais ne touche pas les commandes
>   (rappelons que nous implémentons du soft delete) ;
> - l'association — un client a une liste de commandes de vente, un
>   fournisseur a une liste de commandes d'achat. Ces 2 listes ne
>   sont pas des compositions du tiers. Elles sont des
>   associations. Même approche pour les articles. Un article a une
>   liste de commandes sous forme d'association ;
> - les listes avec des compositions sont représentées par les
>   tarifs — le prix unitaire est conditionné par l'article, le
>   client/fournisseur, une tranche.
>
> Cet exemple permet de mettre en lumière tous les types possibles
> du modèle.

**La lecture :**

- **le modèle se conçoit ici** — un ensemble de champs cohérent,
  non exhaustif (l'analyse, D868) ; **la standardisation = les
  patrons des cas précédents** (les noms français D764, l'auto-doc
  D840/D844, la convention de lisibilité) ; **les montants en
  `amount` à devise dans la valeur** (D771 — les devises
  différentes des tarifs et des prix unitaires : `TACTDEVISE`,
  `LCCTDEVISE`), pas la devise visuelle de D832 ;
- **quatre modules** `technique` / `tiers` / `commande` / `stock` ;
- **`tiers` parent, `client` et `fournisseur` enfants par
  `inheritance:`** (D353 — la fonctionnalité mise en lumière) ;
  **les commandes sans héritage** : `commande_vente` et
  `commande_achat` séparées, chacune ses lignes ;
- **`history:` sur toutes les entités sauf `mouvement`** — la
  nomenclature comprise (l'indice de révision des commandes ne la
  couvre pas) ; les retouches des mouvements (D864) remplacent
  (D878 sans historique) et se comptent au bloc de modification ;
- **les champs financiers restreints** — les droits en
  consultation montrés ; **l'entrepôt en lecture seule** ;
- **les trois figures du lien** : la composition avec sa cascade
  (l'article supprimé emporte sa nomenclature — le soft delete du
  socle, « masquer, ne jamais détruire » — et ne touche pas les
  commandes qui le référencent) ; **l'association** — les commandes
  d'un client, d'un fournisseur, d'un article ne sont pas des
  compositions : **l'association dérivée** de D405 (`commandes:
  association with commande.commande_vente if client = me` — la
  vérité reste la référence portée par la commande) ; **le tarif =
  le lien n-aire** (D402–D403 — « le prix unitaire est conditionné
  par l'article, le client/fournisseur, une tranche » :
  `tarifs: list of [tiers, tranche]` à la cellule `{ prix: amount,
  date_application: date }`, l'unicité par la combinaison — le
  premier emploi du n-aire).

### La couverture des types par le modèle (la vérification demandée)

*Le catalogue de [types.md](../docs/types.md), type par type, avec
le champ qui le porte et la colonne réelle de PMI ; les absents en
fin.*

| le type | le champ proposé (la colonne PMI) |
|---|---|
| `boolean` | `tiers.actif` (`CLCTACTIF`), `tarif.valide` (`TACTVALID`), les tops de l'article (`ARCTTOP01`…) |
| `text` | `article.libelle` (`ARCTLIB01`), `tiers.nom` (`CLCTNOM`), les codes |
| `integer` | `nomenclature.numero` (`NOKNLIGNOM` — l'identité) |
| `decimal` | `ligne_vente.quantite` (`LCCNQTECDE`), `stock.quantite` (`DPCNSTOPHY`), `commande.taux_change` (`ECCNTXDEVI`) |
| `duration` | `nomenclature.temps_ouverture` (`NOCNTPSOUV`), `temps_attente`, `temps_preparation` — la notation industrielle D378 |
| `date` | `article.creation` (`ARCJCRE`), `tarif.date_application` (`TAKJAPLI`), `stock.peremption` (`DPCJPEREMP`) — au masque `yyyymmdd` (D820) |
| `time` | aucune seule : l'heure de PMI n'existe qu'avec son jour (MVCTSAI — D1001) ; `time_pmi` sert le constructeur |
| `datetime` | `mouvement.horodatage` (`MVCJSAI` + `MVCTSAI` — le constructeur D659/D1001 ; les délais des commandes sont des jours, D1000) |
| `enum` | `article.type` (`ARCTTYPART`), **`article.famille`/`sous_famille` (`ARCTCODFAM`/`ARCTCOSFAM`), le code de gestion** (D883 — « les valeurs sont parties d'une liste de valeurs facilement identifiables dans une liste énumérée » : l'énuméré, pas le référentiel par `distinct:`), `nomenclature.nature` (`NOCTNATCPT`), `mouvement.type`/`genre` (`MVCTTYPE`, `MVCTGENRE`), `ligne_vente.statut` (`LCCTSTATUT` — A, vide, S, T, P, D1002 ; ECCTSTATUT ignorée) — les codes PMI en `values:` à libellés |
| `counter` | `commande_vente.numero` (`ECKTNUMERO`) — « une commande est un counter » : le type déclaré, **la valeur surchargée par la migration** (D883 — le privilège de l'écriture identifiée reprise, D175/D173) |
| `file` | `article.plans: list of file` — « une liste de pièces jointes » remplie **via un connecteur `file`** (D634) en complément du connecteur de source, le nom du fichier venant d'`ARCTFICPLA` (D883 — la forme au morceau de la source) |
| `amount` | `tarif.prix` (`TACNPU` + `TACTDEVISE`), `ligne_vente.prix_net` (`LCCNPUNET` + `LCCTDEVISE`), `article.prix_revient` (`ARCNPRS`) |
| `percentage` | `tiers.taux_representant` (`CLCNTXREP1`), `nomenclature.rendement` (`NOCNRENDT`) |
| `measure` | `article.poids` (`ARCNPDSUNI` — kg), `longueur`/`largeur`/`epaisseur` (`ARCNLONGUE`… — mm), `volume` (`ARCNVOLUNI`) |
| `phone` | `tiers.telephone` (`CLCTTELEP1`), `fax` |
| `geolocation` | `tiers.adresse` (`CLCTRUE1`/`CLCTCP`/`CLCTVILLE`/`CLCTPAYS` + `CLCNGPSX`/`CLCNGPSY` — le constructeur, D638) |
| `period` | `nomenclature.validite` (`NOCJDEBVAL` + `NOCJFINVAL`) |
| `email`, `url` | `tiers.email` (`CLCTEMAIL`), `tiers.site` (`CLCTSITE`) |
| `vat_number`, `siret`, `siren` | `tiers.tva` (`CLCTNOTVA`), `tiers.siret` (`CLCTSIRET`), `tiers.siren` — le calculé `left(siret, 9)` |
| `iban`, `bic` | `tiers.iban` (`CLCTIBAN`), `tiers.bic` (`CLCTSWIFT`) |
| `label` | les `title:` des entités (D465 — `"{code} — {libelle}"`) |
| `list of <simple>` | `article.matieres: list of text` (`ARCTCODMA1`…`ARCTCODMA9` — neuf colonnes, une liste) |
| `range of <type>` | `article.tarifs.plage: range of decimal` — du seuil de la tranche (`TACNTRANCH`) au seuil de la tranche suivante, la dernière ouverte (D949) |
| la référence | `ligne_vente.article: technique.article`, `commande_vente.client: tiers.client` |
| la composition | `article.nomenclature`, `article.tarifs`, `commande_vente.lignes`, `tiers.adresses`, `tiers.contacts` |
| l'association | `article.fournisseurs: association with tiers.fournisseur` (`ARCTNOFOU1`/`ARCTNOFOU2`) |
| le n-aire | `article.tarifs`, **la grille tarifaire en hypercube** tiers × tranche × date — `list of [tiers.tiers, tranche: text[1], date_application: date]` (D895–D898 : le temps en dimension du tuple, la cellule en bloc sous `fields:` — prix, forfait, numéro, `valide`, commentaire) |
| l'association dérivée | `client.commandes: association with commande.commande_vente if client = me` (D405) |
| `owner` | `ligne_vente.devise: owner.devise` (la devise de la commande) |
| le calculé | `commande_vente.total: lignes.sum(montant)`, `tiers.siren` |
| `context` | `article.dormant: context.now - derniere_sortie > 180d` (le tableau de bord) |
| `inheritance:` | `client`/`fournisseur` ← `tiers` (D353) ; `fabrique`/`semi_fini`/`fantome` ← `article`, par le code de gestion (D940) |
| `history:` | toutes les entités sauf `mouvement` (D882) |

**Les types absents du modèle** — et ce qu'ils appellent (relu par
D883) :

- **`image`, `thumbnail`** — la photo de l'article n'existe pas
  chez PMI, l'enrichissement d'un entrepôt en lecture seule est
  fermé (D882) — artificiels ;
- **`uuid`** — aucun identifiant externe au format UUID dans le
  périmètre (les `Id` des schémas typés sont des entiers) —
  artificiel ;
- **`color`** — aucune couleur dans les données — artificiel ;
- **`states:`** — écarté par choix : l'entrepôt consulte, le statut
  d'une commande est un énuméré venu de PMI, pas une machine à
  états — sans objet (confirmé D883) ;
- **`communication`** — pas de fil d'échanges dans un entrepôt en
  lecture — sans objet (confirmé D883) ;
- **`password`** — les comptes sont ceux du socle — sans objet
  (confirmé D883) ;
- **le type-hook** — aucun format que le catalogue ne dise pas (la
  date au masque a évité le hook, R5) — sans objet (confirmé
  D883) ;
- *(`counter` et `file` sont remontés au tableau par D883 ; `enum`
  manquait au tableau des simples de types.md — ajouté)*.

Tous les types qu'un entrepôt en lecture porte sont là, `counter`
et `file` compris ; restent hors du modèle les sans-objet par
nature (`states:`, `communication`, `password`, le type-hook) et
les artificiels (`image`, `thumbnail`, `uuid`, `color`).

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
   dans l'entrepôt, pas dans Cegid) ? Le périmètre du cas 6 en
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
   (D177/D179) ; les exemples de règles restent à donner.* *Le
   13/09 : les exemples donnés sur le fil ARTICLE → NOMENC — la
   vérification est le contrat du modèle cible (D177/D156 : les
   `required`, les types, les `validation:`) et les pré-contrôles de
   la source (D871/D874) ; le mapping convertit (le masque D820, le
   typage en garde D813, le `select` D893) et sa règle contrôle chaque
   ligne importée par son propre `validation:` (D932 — trois niveaux :
   la source avant, la règle pendant, la cible après).
   Deux remarques de l'auteur : le rapport est porté par chaque règle
   de migration, pas un rapport général (D929) ; la clé `key:` de la
   règle fait doublon avec l'identité de la cible — retirée (D930) ;
   `parent:` se lit par les champs mappés du possesseur, la même carte
   pour la référence composée et pour le lien à la source (D931).*
   *Les quatre points restants (13/09) : D932 les trois `validation:` ;
   D933 l'échec dans une composition — le parent entraîne ses
   composants, le composant fautif tombe seul, la validation du parent
   qui lit ses enfants rejette le tout — ma conséquence « la cellule
   retient l'article » écartée ; le texte trop long refusé à
   l'ingestion (D581) ; D934 les fonctions du texte au catalogue ; les
   codes des listes closes : ceux de PMI, publiables, leur vocabulaire
   donné par l'auteur — accessoire, consommable, libellé, outillage,
   produit fini, plaque, main d'œuvre, sous-traitance, semi-fini —,
   hors de l'énuméré une erreur (D935) ; mes quatre valeurs, fabriqué,
   acheté, sous-traité, fantôme, sont celles du code de gestion
   ARCTFATN et non du type d'article : le modèle corrigé (D936) ; PR
   est une erreur pour l'exemple, la nature numérique ignorée, le type
   du composant celui de l'article référencé — la ligne de nomenclature
   corrigée (D937) ; la table des codes ARCTFATN donnée avec ses trous
   (D938) ; les codes sans libellé entrent sous une valeur nommée par
   le code, CG03, CG09, CG12, le libellé viendra (D939). Close.* *Puis
   l'article en hiérarchie (D940) : le parent instanciable et trois
   dérivés par le code de gestion, fabriqué, semi-fini, fantôme, qui
   portent la nomenclature ; la grille tarifaire au parent.*
8. **L'enrichissement** : l'entrepôt porte-t-il des champs qui ne
   viennent pas de Cegid (une classification, un commentaire, un
   responsable) ? Le différentiel (D672) compare champ par champ
   les champs alimentés ; les champs possédés par l'entrepôt
   doivent lui rester — un frottement possible. *Répondue (15/09,
   D941–D942) : la doctrine est bonne — les champs qu'aucune règle
   n'alimente restent intacts, `reset: false` la garde ; le champ
   obligatoire naît à son `default:` ; le champ qu'un écran de saisie
   remplit se protège par `unchanged: true` (la propriété nouvelle de
   l'auteur — née au défaut, la valeur gardée ensuite) ; l'exemple :
   `note_interne` sur le tiers, aucune colonne PMI, ouvert au commercial
   et aux achats par l'allow au champ — l'allow s'applique partout,
   l'administrateur, qui porte la migration, passe outre (D942).*

**D. L'exploitation**

9. **Le rythme** : la conversion unique (`absolute`) ou
   l'alimentation continue (`relative`, l'`every:` nocturne, le
   différentiel D672, `reset: false` et la clé sur chaque règle —
   D825) ? Le cadre du cas dit `relative`. *Répondue en partie
   (D859) : l'historique des changements de valeur implique
   l'alimentation continue — `relative` et le différentiel ; la
   fréquence reste à fixer.* *Répondue (15/09, D943) : le delta
   chaque nuit et la relecture complète du dimanche (D881) sont deux
   opérations périodiques de la migration déclarée — `every:
   daily[02:00]` avec `migrate`, `every: weekly[saturday at 23:00]`
   avec `reset_coverage` par entité partitionnée —, pas des clés de la
   migration ; les heures à fixer avec l'entreprise.*
10. **L'entreprise** : l'authentification (`azure_ad`, `local` ?),
    le smtp réel pour les rapports, les groupes (qui reçoit le
    rapport des rejets, qui lance `migrate` — le degré
    `administrator` D701), **un ou deux environnements** (le staging
    sur une copie de la base, la production sur la base réelle —
    D342/D617) ? *Répondue (15/09, D945) : « 1. azure_ad 2. smtp_std
    confirmé 3. la production et un staging 4. chaque matin » —
    l'authentification par Microsoft 365, le relais de l'entreprise,
    deux environnements (le staging sur une copie de PMI, où vivent
    les versions beta — D805), le rapport de chaque règle `when:
    [migration]` (D929) ; les paramètres des deux classes sont miens ;
    le connecteur directory (D633) écarté (R4). Le cadrage est soldé.*
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
   destinataire capable de corriger l'origine (D406/D859 — porté par
   chaque règle de migration, D929) ;
3. **la source** — `source/` : **les tables analysées, chacune avec
   toutes ses colonnes typées** (D861/D866/D868 — l'acte du
   technicien, aucun pattern, aucune génération ; les dépendances
   déclarées faute de clés étrangères, les clés aux colonnes K, les
   normalisations D660, le `filter:` D663 sur la société), **la date
   au masque** (D820/D867), le reste du schéma **en points à
   creuser** (D868) ; *ouvert le 18/09 (D946–D947) : un fichier par
   table au nom de la table ; les colonnes lues typées et renvoyées à
   leur champ, quelques colonnes ignorées avec leur motif, les autres
   non lues — relevées au rapport ; le premier lot, ARTICLE et NOMENC,
   et `reprise/reprise.yml` avec ses opérations (D943) ; puis les lots
   — TARIF et TRANCHES (D948–D949), les tiers (D950), les commandes
   (D951), les stocks et les tables ignorées (D952) : le morceau 3 est
   écrit en entier le 19/09, 14 tables décrites, 8 ignorées ; la
   validation globale à la fin du cas, sur tous les fichiers (D955)* ;
4. **le mapping** — `mapping/` (l'identité déterminée par chaque
   règle — D825/D930, `parent:` par les champs mappés — D931,
   `parent:`, `distinct:` D658), la migration déclarée `relative` +
   `reset: false` + l'`every:` nocturne (D667), la provenance
   (D178), le différentiel (D672) — **et la lecture par partition**
   (`coverage:` — D878 : la clé, la plage, l'empreinte par
   partition, la reprise depuis la dernière valeur ; la comparaison
   en cinq blocs) ; *ouvert le 19/09 : le plan des étapes (les
   référentiels, les tiers, les articles et leurs dérivés, la
   nomenclature, les tarifs, les commandes, les stocks — le préfixe
   numérique fait l'étape, D665 ; deux règles sur une table = deux
   fichiers), une règle par dérivé de l'article filtrée sur ARCTFATN
   (D940), deux règles par table à possesseur conditionnel (D950), le
   `report:` par règle (D929/D945) ; **le lot 1 — les référentiels et
   les tiers (001–012) — clos par D961–D966**, **le lot 2 — les
   articles, la nomenclature, les tarifs (013–019) — clos par
   D967–D990** : vingt-cinq règles et le bloc commun
   `articles/fields.yml` ; les frottements et leurs décisions ci-dessous
   (« Les frottements du morceau 4 ») ; **le lot 3 — les commandes
   (020–023) — clos par D998–D1007** ; **le lot 4 — les stocks (024–025
   et les origines 3 bis / 6 bis) — clos par D1008–D1018** ; puis le
   morceau 5* ;
5. **le pilotage et la restitution** — **l'état de la qualité et de
   l'avancement** (D859 — les surfaces du module `migration` : les
   trois taux — la complétude du schéma, la couverture du schéma,
   la couverture des données (D861–D862) —, les rejets et leurs
   causes, D666/D668), le rapport
   au destinataire (D406 — par la règle, D929), et **la restitution
   décisionnelle**
   (D858) : **le tableau de bord des indicateurs de pilotage**
   (D859 — la vue globale du fonctionnement de l'entreprise,
   D554–D558/D527, rafraîchi dès que les données sont disponibles),
   les documents générés (D559–D565), les listes (D441–D447) sur
   l'entrepôt ; *ouvert le 20/09/2026 en cinq lots (les listes, les
   graphiques et widgets, les tableaux de bord, les documents, le menu
   et l'accueil) ; **recadré par D1019 le 21/09** : « reprenons
   l'intérêt du cas d'usage 3 [5] — la migration de données et son
   enregistrement dans un entrepôt de données. Ici, les interfaces
   graphiques ne sont pas essentielles » — le lot 1 écrit puis retiré
   ; le morceau tient en deux points : **le suivi de la migration** —
   les trois taux (D861–D862), les rejets et leurs causes, l'évolution
   (D668) — par les surfaces standard du module `migration`
   (D666/D711), citées, jamais déclarées ; et **un seul tableau de
   bord**, `stock[pilotage]`, la preuve que l'entrepôt sert ; rien
   d'autre — D858 amendée ; **puis précisé par D1020** : « la dernière
   partie est la consolidation des rapports de la mise à jour de
   l'entrepôt de données. Ça doit décrire le module migration et ses
   composants. Le reste des interfaces est servi (par défaut) pour
   montrer la capacité de Syncytium » — la description du module
   `migration` sur PMI, ci-dessous (« Le morceau 5 ») ; puis la
   relecture complète de tous les fichiers de configuration par
   l'auteur, le peaufinage et la documentation structurée (D1021), le
   jeu de données construit (D869), la PR.*

## La forme — le dépôt

*(à écrire morceau par morceau — le protocole D457/D756)*

Le dépôt vit dans `examples/05_entrepot/` — la maison alignée un
cas = un exemple (D827/D857).

**Le morceau 2 — le modèle champ par champ** (écrit le 06/09/2026,
validé le 08/09 — D882 à D898 —, lié le 09/09, **clos par D899** :
« la validation définitive se fera après la relecture complète des
fichiers de configuration ») :
`versions/beta/v1.0.0.0/` porte `groups.yml` (les cinq strates de
D859/D882 — production, commercial, achats, direction qui les
contient, administration au degré `administrator`), `settings.yml`
(D885) et **les quatre modules, seize entités, deux cent vingt-cinq
champs** (le compte relu le 09/09 — les cellules et les fichiers en
ligne compris), chaque champ commenté de sa colonne PMI :

- **`technique/`** — `article` (l'identité code + complément, la
  classification en énumérés D883, les unités et les mesures, les
  prix restreints, `matieres: list of text` des neuf colonnes, `plans:
  list of file` par le connecteur file D883, `fournisseurs:
  association with tiers.fournisseur` stockée, `nomenclature: list of
  nomenclature`, **`tarifs` en hypercube** `list of
  [tiers.tiers, tranche: text[1], date_application: date]` (D897 —
  le temps en dimension du tuple ; D898 — la cellule en bloc sous
  `fields:` : prix, forfait, numéro, `valide`, commentaire, sans
  calculés), les associations dérivées vers les lignes de commande
  et les mouvements, les calculés du tableau de bord — `dormant`,
  `temps_gamme`) ;
  `nomenclature` (la nature composant | opération, le composant
  = `technique.article` — l'auto-référence D135, les temps en
  `duration` au masque industriel, le rendement en `percentage`, la
  `validite: period`) ; `tranche` (les trente-cinq seuils en `list of
  decimal`, la première tranche en `range of decimal`) ;
- **`tiers/`** — **`tiers`, le parent** (la structure commune de
  CLIENT et FOURNIS : l'adresse en `geolocation`, `phone`, `email`,
  `url`, `siret`, `vat_number`, `iban`, `bic`, les conditions, les
  compositions `adresses` et `contacts`, le `siren` calculé — **le
  mot de l'auteur, l'éponymie triple `tiers/tiers/tiers.yml`
  assumée**, D884) ; **`client` et `fournisseur` par `inheritance:
  tiers`** (D353 — chacun son `identity: [code]`, ses champs
  propres, `commandes` en association dérivée D405) ; `adresse`
  (l'usage en énuméré, la `geolocation`) ; `contact` (**`rgpd:
  personal`** sur le nom, le prénom, les coordonnées, la date de
  naissance — D695) ;
- **`commande/`** — `commande_vente` et `commande_achat`, séparées
  sans héritage (D882 — la structure se répète, le prix du choix) :
  **`numero: counter`** surchargé par la migration (D883), l'indice de
  révision en identité, la référence au client ou au fournisseur, la
  devise et le taux de change, le statut en énuméré sans machine à
  états, la composition `lignes`, les totaux calculés ; `ligne_vente`
  et `ligne_achat` (l'article en référence, les quantités, les prix en
  `amount` à devise D771, les délais en `datetime` recomposés D659,
  la `marge` calculée réservée à la direction, `en_retard` par
  `context.now`) ;
- **`stock/`** — **`niveau`** (STDEPLOT — le niveau de stock, le mot
  de l'auteur, D884 ; la clé à cinq champs, les quantités, la
  valeur restreinte, l'inventaire en `datetime`, `history: true`
  pour le stock à date D412) ; **`mouvement`** (la clé aux colonnes I complétées de
  l'article, de la date et de l'heure — D869/D871 tranchera ; la
  date et l'heure séparées — le `time` seul ; le type et le sens en
  énumérés ; **`history: false`**, le seul opt-out D882) ; `depot` et
  `emplacement` (les référentiels par valeurs distinctes D658).

**Les retours de l'auteur (D884)** : « je préfère TIERS au lieu de
PARTENAIRE. Pour Position, je préfère Niveau » — le parent des
tiers se nomme `tiers` (module `tiers`, entité `tiers`, fichier
`tiers/tiers/tiers.yml` : l'éponymie triple assumée — le mot juste
prime la convention, la nuance de D831), le niveau de stock se
nomme `niveau` ; les références (`tiers.tiers` au n-aire des
tarifs, `stock.niveau` aux dépôts, `inheritance: tiers`) et les
libellés renommés, les trente fichiers revalidés.

**Le lien — la chaîne des déclarations (écrite le 09/09/2026, à la
remarque de l'auteur : « entre ta description et l'assise, je ne
vois pas le lien »).** D767 le dit, rien ne se déduit de
l'arborescence : les modules étaient orphelins tant que
`version.yml` ne les citait pas. La chaîne est posée, sur le patron
du véhicule : `syncytium.yml` (le projet `entrepot`) →
`environments/environments.yml` → `environments/production/` et
`environments/staging/` (la base PMI lue en direct — D863 — et sa
copie pour les essais, D945 ; `production.yml`,
`logging.yml` D830 en info, `documentation.yml`, `settings.yml`,
**`connectors.yml`**) ; `versions/versions.yml` → `beta.yml` et
`production.yml` (le beta sur le staging, la production sur la
production — D805/D945, le regex des versions D806) → **`version.yml`** (1.0.0.0, les release-notes du
cas, **`settings: settings.yml`**, **`groups: groups.yml`**, les
quatre modules ; la migration à venir au morceau 3). La chaîne est
suivie par script : quarante-deux fichiers, toutes les références
résolues, aucun fichier hors chaîne — le statut `production` ne
liste encore aucune version, la 1.0.0.0 est en beta (D340 : la
transition sera un geste de fichier). **Les connecteurs** décidés y
sont : `entrepot` (postgresql, le schéma — D860), `cegid`
(sqlserver, la base de production lue en direct — D860/D863, sans
carte `entities:` : la base se décrit elle-même et la comparaison
du schéma doit voir les tables non définies — D829/D861), `plans`
(le connecteur file des plans — D883). **Trois formes en
proposition, nées de l'écriture** : les clés `settings:` et
`groups:` de `version.yml` (D767 — la référence de fichier, D359 et
D414 disaient l'emplacement sans la clé) ; **le bloc `convention:`
du connecteur cegid** (D876 renvoyait la forme à l'assise) — le
motif à groupes nommés qui découpe la colonne
(`<prefix><kind><type><name>`, D817), `identity: [K, I]`, `types:
{ T: text, N: decimal, J: date[yyyymmdd], S: time[hhmm] }` (`hhmm` depuis D992 —
« time_pmi a un format hhmm seulement ») ;
l'absence de carte `entities:` pour un storage base de données.
**Reste à l'assise** : l'authentification et le smtp (la question
10), dits en commentaire dans `connectors.yml`, jamais en `none`.

**Les cinq renvois à l'analyse de la source** (le morceau 3) laissés
dans le modèle, aucun ne le bloque : `niveau.lot` en texte (une
entité lot si `Stock.Batch` le justifie) ; les valeurs de
`article.famille` et `sous_famille` (la liste close à relever,
D893) ; l'unité des temps de gamme (`NOCNTPSOUV` — heures ou
centièmes) ; la forme de la n-ième tranche entre deux seuils
(`TRANCHES`) ; la colonne d'ADRESSE qui porte l'usage (ADCTTYPE — D950) ; les libellés des codes de
gestion 03, 09 et 12 (D939 — entrés sous CG03, CG09, CG12 ; puis 09 =
semi-fini et 12 = fantôme, mes hypothèses de D940 à vérifier) — PR, la
nature numérique et le type du composant tranchés par D937, les
articles « libellé » gardés, les lignes les référencent. *Soldés au
morceau 4 : la famille et la sous-famille aux codes inventés, la
famille lue sans son drapeau (D963/D986) ; l'unité des temps
inventée — les heures décimales de l'exemple (D975) ; TRANCHES
ignorée, la tranche est la lettre (D949) ; ADCTTYPE traduit aux codes
inventés (D963) ; les codes de gestion « en dur » dans PMI, hors
PARAM — les hypothèses de D940 restent celles de l'exemple.*

**Le fichier `settings.yml`** (D885, l'étage instance de la cascade
D359/D588) : **les paramètres par défaut d'un type sous le nom du
type** — `text: { normalize: trim(me) }` (D991, corrigé par l'auteur :
« dans settings, normalize n'est pas au bon endroit. Dans settings, les
paramètres par défaut des types ou la définition de nouveaux types
peuvent être présents » ; D872 — les blancs des nchar), **les types
dérivés** `date_pmi: { type: date, mask: "yyyymmdd" }` et `time_pmi`
(D992 — « les types ou ses dérivés doivent être présentés simplement et
sont définissables avec des paramètres par défaut » : la clé est le
nom, `type:` la base, le reste ses défauts ; les trente-quatre colonnes
J et S des sources s'écrivent `ARCJCRE: date_pmi`, la forme courte),
**`amount: { currency: EUR }`** (D993, qui amende D970 — « le défaut du
type me convient » : la devise de l'entreprise en défaut du type, les
prix de l'article sans colonne de devise par le constructeur à un
argument, `amount(ARCNPRS)`) et
les trois profils de confidentialité — `financier` (les achats et
la direction), `direction`, `commercial` — que les champs
référencent par `${settings.confidentiality.<profil>}` ; le lien
depuis `version.yml` viendra avec le morceau 1.

**Le morceau 4 — le mapping** (ouvert le 19/09/2026 ; les lots 1 et
2 clos — D961 à D990 ; le lot 3 clos — D998 à D1007 ; le lot 4 clos —
D1008 à D1018 ; **le morceau est écrit en entier**, sa validation
globale à la fin du cas, D955) : `reprise/mapping/`, **trente-trois règles, 001
à 025**, déclarées par le pattern `~{mapping/[0-9]+_.*\.yml}`
de `reprise.yml` (D806/D956) — le préfixe fait l'étape (D665), les
référentiels avant ce qui les référence (D662), deux règles sur une
même table = deux fichiers :

- **001–006, les référentiels de stock** — `depot` et `emplacement`
  à trois origines (D962) : les paramètres de Cegid
  (`PARAM_EMPLACEMENTS`, l'entité alias de PARAM au filtre du
  paramètre 170 — D966 —, le couple `Dépôt.Emplacement` découpé à la
  source par `extract`, les actifs nommés), les fiches articles (les
  quatre lieux — réception, fabrication, consommation, expédition,
  D964 — une règle `distinct` par paire), les mouvements (toutes les
  valeurs, même dépassées) ; l'emplacement identifié par le couple
  (dépôt, code) ; le nouveau naît inactif ;
- **007–012, les tiers** — FOURNIS et CLIENT vers les enfants du
  tiers (D353) ; ADRESSE et CONTACT en deux règles filtrées sur le
  type de compte (D950), le possesseur par son identité mappée
  (D931) ; l'adresse principale par `geolocation(lat, lng, texte)`
  (D961) ; les codes inconnus traduits par des `select` aux
  correspondances inventées — la langue, l'usage, la civilité, la
  fonction, la base d'échéance (D963/D964) ; le mode de règlement
  retiré du modèle ;
- **013–016, l'article et ses dérivés** — quatre règles filtrées sur
  ARCTFATN (D940) qui partagent **un bloc de trente-sept champs par
  la référence de fichier**, `fields: ~{articles/fields.yml}` (D967 —
  hors du pattern des règles), et 013/014 y ajoutent leur propre par
  le cumul en bloc (D968/D997 : `- fournisseur_defaut: ARCTNOFOU1`,
  `- client_defaut: ARCTNOFOU1` — le compte 1 de PMI routé par le
  dérivé) ; dedans : les `select` du type et du
  code de gestion, `perissable: mid(ARCTCODFAM, 4, 1) = "1"` (D954),
  `matieres: list(…)` (D971), `plans: plans.files(ARCTFICPLA)` (D972),
  les mesures par `measure(x, kg)` (D975), les prix
  `amount(x)` à la devise par défaut du type (D970, amendée par D993),
  `ean13:
  left(ARCTEAN13, 13)` sous la facette `barcode: ean13` (D988), **une
  unité de l'article** — `unite: measure(1, ARCTUNISTO,
  list(measure.convert(…)))`, les deux couples de conversion de PMI
  (D982) ;
- **017, la nomenclature** — `parent: { article: { code, complement
  } }`, le possesseur retrouvé parmi les dérivés par l'identité
  partagée (D969), la désignation lue de NOCTLIBCOM (D989), les temps
  en `duration(x, h)`, la validité en `period(…)` ;
- **018–019, les tarifs** — deux règles sur TARIF filtrées sur le
  genre (D948), `to: technique.article.tarifs` (la cellule de
  l'hypercube), le tiers par le calculé de la source, `valide:
  TACTVALID = "O"` ;
- **020–023, les commandes** (*clos par D998–D1007*) — ECOMCLI et
  ECOMFOU vers les deux entêtes, LCOMCLI et
  LCOMFOU vers leurs lignes, séparées sans héritage (D882) : la règle
  se répète ; le numéro de commande par le calculé `numero:
  integer(ECKTNUMERO)` de la source — la clé convertie à la lecture
  (D990), le `counter` de la cible surchargé (D883) ; le possesseur
  des lignes `parent: { commande_vente: { numero: numero, indice:
  LCKTPSF } }` (D931/D951) ; l'article par sa clé composée ; les prix
  `amount(x, LCCTDEVISE)` (D771), le prix de revient `amount(x)` à la
  devise de l'entreprise (D993) ; les délais recomposés par
  `datetime(jour, heure)` (le constructeur D659, la forme à fixer) ;
  les statuts traduits par `select`, les codes inventés (D963) ;
  l'adresse de livraison de l'entête reprise en détail (sept champs)
  et géocodée à la cible par le connecteur `location` (D1004) ; les
  rapports au commercial (ventes) et aux achats (D945) ;
- **024–025, les stocks** (*clos par D1008–D1018*) — STDEPLOT vers
  `niveau` : l'identité aux six K, l'article
  par sa clé composée, l'emplacement par le couple `{ depot, code }`
  (D931/D962), le prix du lot `amount(x)` (D993), l'inventaire en date
  (D1001) ; MVTSTO vers `mouvement` : l'identité aux I + l'article +
  `datetime(MVCJSAI, MVCTSAI)` (D1001), le sens et le type par `select`
  sur E/S et C/D/E/F/I/R (D952/D953), la quantité signée en mesure
  dans l'unité de stock de l'article (D1009), la masse par la matrice
  de l'article (D1010) ; et
  **la quatrième origine des référentiels** (3 bis, 6 bis — D1008) :
  les dépôts et emplacements distincts des niveaux non nuls, pour
  qu'aucun niveau en stock ne soit orphelin (D875) ; les rapports à la
  production.

Ce que le lot a fixé hors du cas : la référence de fichier explicite
et son cumul (D956/D967–D968), la lecture d'une autre entité source
depuis un calculé et l'alias d'une table (D965–D966), le contrat de la
famille `file` et le type `file` (D972–D974), **les mesures et les
durées** — la valeur et l'unité, les matrices de conversion propres au
champ, les unités apportées par les données, la transitivité,
l'arithmétique, la performance sur les volumes (D975–D985), la facette
`barcode` (D988), la conversion d'une clé à la lecture (D990).

**Les choix d'écriture, à valider avec le morceau** : l'entrepôt en
lecture seule par le bloc `allow: { create: false, update: false,
delete: false }` **à l'étage de chaque module** (D886 — la cascade
application / module / entité / champ) ; `history: true` entité
par entité (D411) ; les clés d'énumérés sont **le vocabulaire de
l'entrepôt** (fabrique, achete, en_cours…), les codes PMI s'y
traduisent au mapping — la standardisation même — **validé
(D893)** : « les clés d'énumérés sont le vocabulaire de l'entrepôt.
Pour une manipulation claire, la valeur qui a du sens est à
utiliser. Par contre, si la source n'est pas évidente, un mapping
sera apporté lors de l'import » — la valeur porteuse de sens dans
le modèle, la traduction des codes opaques par la règle du mapping
(`ARCTTYPART.select(<code>: "fabrique", …)` — les codes relevés à
l'analyse ; les lettres de ma première rédaction étaient inventées,
D934) ; les montants en
`amount` sans `currencies:` (toutes les devises ISO, D391) ; **le
tarif — tranché en trois temps** : D894 l'avait aplati en une
composition à la date en identité pour montrer les tarifs
planifiés ; **D895 la retire** — « une grille tarifaire est un
composé de l'article… ton approche est juste dans le cadre d'un
modèle relationnel classique. Ici, ce n'est pas le cas » (le
réflexe relationnel consigné, D134 : la matrice est une forme de
composition) ; **D896** pose la doctrine des deux plans (l'objet
naturel au modèle, la traduction en table et clé étrangère au
stockage — la forme de la source ne dicte jamais le modèle) ;
**D897 choisit l'hypercube** — « visualiser les évolutions de la
grille tarifaire dans le temps » : `list of [tiers.tiers,
tranche: text[1], date_application: date]`, le temps en dimension
du tuple (D134 étend D402) ; **D898 valide la cellule en bloc sous
`fields:`** (« je valide pour fields sous une liste ») et allège
l'exemple : « tu peux enlever planifie et en_vigueur. Valide
suffit » — la cellule porte le prix, le forfait, le numéro, `valide`
et le commentaire ; le tuple reste sous guillemets (D892).

**Le morceau 5 — le pilotage et la restitution** (ouvert le
20/09/2026, recadré le 21/09 par D1019 — « les interfaces graphiques ne
sont pas essentielles ») : un seul tableau de bord, `gui: dashboards:
pilotage:` dans `stock/stock.yml` (D554/D555 — le menu l'adresse
`stock[pilotage]`, D439 ; le premier `dashboards:` du dépôt, le point
ouvert de D994) : trois `kpi` déclarés dans le bloc `gui: charts:` du
niveau — la valeur du stock (`sum(valeur)`, restreinte), les niveaux
sous le minimum et les lots périmés en stock (`count(condition)`, D887,
les seuils de couleur D467) —, les entrées et les sorties par mois en
`chart.bars` sur le mouvement (`x: date[month]`, deux séries), la
matrice de contrôle (D1014) en `pivot` (D246 — les dépôts et
emplacements en lignes, les articles en colonnes, la somme signée à la
cellule, le mois courant), et l'emplacement libre `_` du pool (D556) ;
le rafraîchissement `every[1h]` (D249). Les graphiques s'adressent par
`chart[<entité>.<nom>]` depuis le module (la forme en proposition dans
composants.md). Le suivi de la migration — les trois taux, les rejets,
l'évolution — est celui des surfaces standard du module `migration`
(D666/D711/D861–D862) : le cas les cite, ne les déclare pas. Rien
d'autre : les entités gardent les surfaces que le socle propose sans
déclaration (D437–D438).

**Le morceau 5 — la consolidation des rapports : le module
`migration` et ses composants** (D1020, écrit le 21/09/2026 — *en
proposition* : le module est celui du socle, D666, « le socle premier
client » D408 ; le cas le décrit tel qu'il donne à voir PMI, l'exemple
ne le déclare pas). Ce que la mise à jour de l'entrepôt produit chaque
nuit, où cela vit, qui le lit :

- **la migration** — la déclaration de `reprise.yml` (D662) : le
  connecteur `cegid`, le mode `relative`, `reset: false`, les
  vingt-trois sources, les vingt-neuf règles, les deux opérations
  périodiques (D943) ; l'entité racine du module, historisée (D668) ;
- **le passage** — chaque exécution de `migrate` (D667) : le début,
  la fin, le déclencheur (la nuit de `delta_nocturne`, le dimanche de
  `relecture_complete`, la main), l'état (réussi, en erreur, en
  cours), les comptes globaux — lus, intégrés, rejetés — et **les
  cinq blocs de D878** cumulés : anomalies, créations, modifications,
  inchangés, suppressions ; un passage par nuit, ~250 par an ;
- **l'entité source** — une par fichier de `source/` : la table
  réelle, le nombre de colonnes du schéma, les colonnes décrites,
  ignorées (avec leur motif), non lues (D947), la couverture déclarée
  (`coverage:` et sa dernière valeur parcourue, D880), les lignes de
  la table et les lignes intégrées ; **la complétude du schéma** et
  **la couverture du schéma** se calculent ici (D862) ;
- **la règle** — une par fichier de `mapping/` (D665) : la source,
  la cible, le filtre, le `report:` (D929) ; par passage, ses comptes
  aux cinq blocs et ses rejets ; **la couverture des données** se
  calcule ici (D861 — les lignes intégrées rapportées aux lignes de
  la source, le `filter:` hors taux) ;
- **le rejet** — un enregistrement que la cible refuse (D177/D932) :
  le passage, la règle, l'identité construite, l'étage (la source, la
  règle, la cible — les trois temps D1006), la cause (le champ, le
  message), le bloc (l'anomalie, jamais une création) ; le
  destinataire est celui du `report:` de la règle — la production
  pour la technique et le stock, le commercial pour les ventes et les
  clients, les achats pour les achats et les fournisseurs (D945) ; le
  rejet corrigé à l'origine disparaît au passage suivant (le rejeu par
  l'identité, D654/D930) — son histoire reste (D668) ;
- **l'anomalie** — ce qui est au technicien, pas aux métiers (D929)
  : la table ou la colonne du schéma absente de `source/` (D861 —
  la complétude confrontée au schéma réel à chaque passage), les
  identités en doublon (D871), le lien sans cible — l'orphelin isolé
  (D874/D875), le lieu né inactif d'un mouvement ou d'un niveau
  (D962/D1008) ;
- **les trois taux** (D862) — des calculés du module, consultables,
  filtrables, exportables (D666), historisés : la complétude du
  schéma (les décrites ou ignorées sur le schéma réel — cent pour
  cent quand tout est déclaré), la couverture du schéma (les migrées
  sur le schéma réel, les ignorées à part), la couverture des données
  (les intégrées sur les lignes de chaque table) ; sur PMI : les
  vingt-trois tables décrites sur trois cent trente objets du schéma,
  les sept ignorées en bloc (les offres, le devis, les libellés),
  le reste non décrit — la complétude dit ce que l'analyse a couvert ;
- **la consolidation des rapports** — les `report:` sont ceux des
  règles (D929, « pas un report général ») : après chaque passage, le
  module les consolide **par destinataire** — un rapport par groupe,
  chaque matin (D945 : `when: [migration]`, `by: [notification,
  mail]`), avec les rejets de toutes les règles qui lui sont
  adressées, et **par passage** — le tableau du passage pour le
  technicien ; le rapport n'est pas une entité de plus : c'est une
  vue des rejets, groupée (D1015) par destinataire et par règle ;
- **les surfaces** — celles du catalogue sur ces entités (D666), par
  défaut ou déclarées par le socle : le tableau de bord du suivi
  (`migration[suivi]` — les trois taux en kpi, la courbe des taux au
  fil des passages D668, les rejets du dernier passage par règle en
  barres, le dernier passage en résumé), les listes des passages, des
  rejets (par règle, par destinataire, par cause — le drill-down
  D242), des anomalies, des entités sources avec leurs comptes ;
  l'entrée « migrations » du module d'administration (D711),
  conditionnelle à `migrations:` (D662) ;
- **ce qui reste servi par défaut** — toutes les autres entités de
  l'entrepôt (D437–D438 : la liste, le formulaire, la composition
  embarquée) ; et le tableau de bord `stock[pilotage]` (D1019).

*Les noms des composants (passage, entité source, règle, rejet,
anomalie) et la forme du tableau de bord sont miens ; le socle les
fixera à la documentation structurée (D1021).*

## Les manques relevés

*(chaque frottement = une décision consignée)*

### Les frottements du morceau 2 (M3–M9, en proposition)

- **M3 — la confidentialité resserrée par groupes au champ** —
  **tranché par D885**. D25 donne le niveau, D26 la restriction par
  groupe, aucune forme ne les composait. L'auteur : « la
  confidentialité peut faire référence à un paramétrage dans
  settings. On exploite une capacité de la configuration » — **les
  profils nommés dans `settings.yml`** (`confidentiality: {
  financier: { level: protected, groups: [achats, direction] } }`,
  puis `direction`, `commercial`) et **la référence au champ par
  l'interpolation** `confidentiality: ${settings.confidentiality.
  financier}` (D321/D802) : dix-neuf blocs répétés du modèle
  remplacés par leur référence, le niveau et le qui écrits une fois.
- **M4 — l'entrepôt en lecture seule, entité par entité** —
  **tranché par D886**. Le bloc `allow:` libre (D423) se répétait
  seize fois. L'auteur : « un allow au niveau du module me convient.
  Le allow peut porter sur l'application, le module, une entité ou
  un champ » — **la cascade de l'allow** aux quatre étages, le plus
  proche l'emporte (l'esprit D359) : les seize blocs retirés, les
  quatre modules portent `allow: { create: false, update: false,
  delete: false }`.
- **M5 — le décompte conditionnel** — **tranché par D887**.
  `nomenclature.count(nature = "composant")` : `count()` était nu au
  catalogue (D580) et la forme `sum(x if …)` porte la condition sur
  la valeur. Quatre formes pesées (la condition en argument, le `if`
  seul, la valeur factice `count(1 if …)`, le filtre `where(…)`) ;
  l'auteur valide la première — **la doctrine** : l'agrégat qui
  porte une valeur (`sum`, `avg`, `min`, `max`, `first`, `last`) se
  lit « valeur if condition », celui qui n'en porte pas (`count`,
  `any`, `exists`) reçoit la condition seule. Les deux calculés de
  l'article sont justes tels quels.
- **M6 — l'accès retour d'une association stockée** — **tranché
  par D888**. `fournisseur.articles`, l'accès retour de
  `article.fournisseurs` (D394), nommé en association dérivée
  (D405) : la condition doit dire l'appartenance du fournisseur
  d'origine à la collection de l'article — aucun opérateur ne
  l'écrivait. Trois formes pesées (`contains`, `exists(code =
  me.code)`, un mot pour l'élément) ; l'auteur : « ma recommandation
  pour plus de visibilité est : `me in fournisseurs` » — **l'opérateur
  `in`**, l'élément à gauche, la collection à droite, porté par le
  type collection (D581) ; le modèle relu : `association with
  technique.article if me in fournisseurs` ; **la déclinaison**
  (D889) : le point après une collection projette — `me.code in
  fournisseurs.code`, l'appartenance d'une valeur à la collection
  des valeurs d'un champ.
- **M7 — les sous-items de la période** — **tranché par D890**.
  D772 disait « les bornes » sans les nommer, et les noms comptent
  aux formules, au constructeur, à l'API (les clés JSON du composé),
  à l'export en deux colonnes, à la recherche par plage. Trois
  formes pesées (`start`/`end`, `min`/`max`, `from`/`to`) ; l'auteur :
  « je valide min, max et gap » — **`min` et `max`**, alignés sur
  range (D498), et **`gap`**, la durée dérivée entre les bornes
  (date − date → duration, D838) ; le constructeur `period(min,
  max)` ; la ligne de validation redondante de la nomenclature
  retirée (début ≤ fin est intégré, D391).
- **M8 — l'entité comme collection dans une formule** — **tranché
  par D891**. `stock.mouvement.max(date if article = me and sens =
  "sortie")` employait l'étendue globale d'une entité (D842) comme
  collection aux agrégats (D580). Trois formes pesées (l'entité en
  collection, l'accès retour déclaré en vue dérivée, l'accès retour
  implicite) ; l'auteur : « je valide la 2 » — **l'agrégat s'applique
  à une collection déclarée** : `mouvements: association with
  stock.mouvement if article = me` sur l'article (D394/D405), puis
  `mouvements.max(date if sens = "sortie")` ; l'étendue globale
  reste à l'accès par la clé (D842).
- **M9 — la grammaire face à YAML** — **tranché par D892**. Le
  modèle passé à un analyseur YAML (PyYAML) avait demandé deux
  paires de guillemets — le `.select(entree: quantite, …)` de D833
  et la cellule du n-aire de D403 ; les exemples déjà validés,
  passés au même analyseur, échouaient dans neuf fichiers de
  `03_vehicule` et `04_banque`, pour trois causes : le crochet dans
  une collection en flux (`{ type: text[..100] }`, `items: [
  list[revision.echues] ]` — le `[` ouvre une séquence YAML), le
  `: ` dans un scalaire nu (les `.select`), le `\.` entre guillemets
  doubles (`".*\.xlsx?"`). Quatre règles pesées, un avant-après
  vérifié à l'analyseur ; l'auteur : « je valide les règles 1 et 2,
  corrige les neuf fichiers » — **la règle 1, les guillemets quand
  YAML l'exige** (le crochet dans une accolade ou un crochet YAML,
  le `: ` dans une expression, la regex aux guillemets simples) ;
  **la règle 2, la forme bloc préférée** quand le flux imposerait
  les guillemets ; en bloc, la grammaire s'écrit nue. **Les neuf
  fichiers corrigés** sans toucher au sens, **cent trente-cinq
  fichiers des quatre exemples valides** ; chaque exemple passe
  désormais l'analyseur avant validation.

### Les frottements du morceau 4 — le mapping (D961–D990)

*(le lot 1, les référentiels et les tiers ; le lot 2, les articles —
chaque frottement présenté avec ses voies, l'auteur tranche)*

**Le lot 1 (001–012) :**

- **la géolocalisation à trois arguments** — **D961**. La règle
  écrivait `geolocation(CLCNGPSY, CLCNGPSX, <les lignes d'adresse>)`
  là où D659 ne donnait que deux arguments : « une adresse contient
  alors la latitude, la longitude, l'adresse normalisée et l'adresse
  saisie au format brut » — quatre parties, le constructeur à trois
  formes, la normalisée par le connecteur `location` s'il y en a un.
- **la base d'échéance** — **D964**. CLCTCECHEA (« 030 ») et
  CLCTBECHEA (1, 3, 6) allaient au même entier ; « je valide ta
  proposition pour l'échéance » — `tiers.base_echeance` en énuméré,
  les correspondances inventées.
- **les codes inconnus** — **D963**. « Si tu ne connais pas, tu peux
  inventer pour le cas d'usage » — la langue, l'usage d'adresse, la
  civilité, la fonction en `select` marqués ; « le retirer du modèle »
  pour le mode de règlement.
- **les référentiels de stock** — **D962**, puis **D964**, **D966**.
  L'emplacement n'était identifié que par son code, les référentiels
  ne venaient que des niveaux de stock : « l'identité d'un emplacement
  est un couple (dépôt, emplacement) » ; trois origines — les
  paramètres de Cegid (PARAM 170, « PACTEXT210 correspond au couple
  Dépôt.Emplacement », le libellé en PACTEXT140), les fiches articles
  (quatre paires : « R : Réception, F : Fabrication, C : Consommation,
  le 4ème est l'Expédition »), les mouvements (« toutes les valeurs y
  compris dépassées ») ; « tout nouvel emplacement est ajouté et
  inactif » ; et, en chemin, `article.gere_en_stock` (ARCTGDEPOT).
- **lire une autre table depuis un calculé** — **D965**, corrigé par
  **D966**. « PARAM conditionne le fonctionnement de l'ERP et donc des
  données » : à la source, l'entité décrite est une collection —
  `PARAM_EMPLACEMENTS.first(PACTEXT140 if …)`, `list` pour une liste,
  un cache par critères ; ma lecture « hors filtre » écartée — « la
  lecture d'une entité utilise le filtre défini », et **l'alias** :
  plusieurs entités source sur la même table, chacune son filtre.

**Le lot 2 (013–019) :**

- **le bloc de trente-huit champs répété quatre fois** — **D967**,
  **D968**. « Comment pourrions-nous prendre en compte ~{<fichier>}
  pour capitaliser et mutualiser les champs ? » — `fields:
  ~{articles/fields.yml}`, comme l'entité (D767) ; puis le cumul de
  fichiers sous une carte : la liste en bloc, la fusion dans l'ordre,
  la surcharge avec alerte, le pattern admis, l'élément fichier ou
  carte en ligne.
- **la nomenclature sans le code de gestion de son produit** —
  **D969**. « Je valide A ; le fantôme garde sa nomenclature » —
  `parent: { article: … }` résolu dans la hiérarchie, le produit sans
  nomenclature = un rejet visible ; la nomenclature redite : « une
  liste d'articles décrivant les composants et les tâches… cela se
  construit récursivement ».
- **la devise des prix de l'article** — **D970**, puis **D993**. Aucune
  colonne chez PMI : d'abord une clé de l'instance
  (`context.settings.currency`) ; puis, les settings devenus la maison
  des types, « le défaut du type me convient » — `amount: { currency:
  EUR }`, `amount(ARCNPRS)` à un argument.
- **le constructeur `list(…)`** — **D971**. « Le point 1 est valide
  et la liste est nettoyée des doublons » — les vides tombent, l'ordre
  des arguments, les doublons retirés.
- **les plans par le connecteur** — **D972**, **D973**, **D974**.
  « Je valide B. Au lieu de get_files, le résumé à files est
  suffisant » — `plans: plans.files(ARCTFICPLA)` ; le type `file`
  porte ses descripteurs (`.relativepath` la partie portée,
  `.fullname`, `.filename`, `.pathname` recalculés, la taille, les
  dates, l'empreinte si `hash: true`) et ses opérations (la lecture
  binaire ou texte, le déplacement, la suppression, l'empreinte) ;
  « le moteur appelle commit ; get_file devient files ».
- **les unités des mesures et des temps** — **D975 à D985**. « Pour
  measure ou duration, ça combine une valeur et une unité. Elles
  portent également des règles de conversion » — les matrices
  (lignes, colonnes, le coefficient à l'intersection ; les standards
  fournies, les unités étendues PL, F) ; « un champ measure ou
  duration porte une matrice propre au champ et non mutualisable. Ces
  champs peuvent contenir des unités supplémentaires. Mais chaque
  déclaration doit fournir un coefficient de conversion entre cette
  nouvelle unité et une unité connue du champ » ; la transitivité
  (« 1 PL = 1 U, toujours ») ; la matrice visible à la saisie ;
  `duration` rejoint les composés (D981) ; **les deux couples de
  conversion de PMI** (ARCTCONV1A/1B/ARCNCONC01, 2A/2B/02) — d'abord
  un hypercube (D977), puis « une unité de l'article » :
  `measure(1, ARCTUNISTO, list(measure.convert(…)))` (D982) ; la
  comparaison des unités normalisée, `units:` qui restreint la matrice
  standard, `[U]` = la diagonale à 1 (D983) ; l'arithmétique (D984) ;
  la performance sur les millions de mouvements — « un point
  important » (D985 : l'unité canonique de stockage, les agrégats au
  storage, les calculés matérialisés, en proposition ; **D1012** la
  note d'implémentation : « dans la facette des données en base… un
  mécanisme qui permette de précalculer des valeurs… et un mode qui
  permette une mise à jour en fonction de l'évolution d'un des
  paramètres »).
- **la famille et son drapeau** — **D986**. « Je confirme, porte left
  à la source » — `famille_code: left(ARCTCODFAM, 3)` en calculé de la
  source ; `extract` et `like`, les fonctions à regex rappelées.
- **le code-barres** — **D987**, retirée par **D988**. Un type
  `barcode(ean, ARCTEAN13)` d'abord ; puis « la valeur du code-barres
  est un texte, la facette est un barcode. Pas besoin de créer un
  nouveau type » — `ean13: { type: text[13], barcode: ean13 }`, la
  facette valide, `left(ARCTEAN13, 13)` à la règle.
- **les désignations sans colonne** — **D989**. « Pour la
  nomenclature, c'est bien NOCTLIBCOM » ; pour les lignes de commande,
  « le commentaire… est présent dans une autre table LIBEL40… que
  nous ne décrirons pas ici » — le champ retiré, la table ignorée.
- **le complément vide et la conversion d'une clé** — **D990**. Le
  nul du texte est la chaîne vide, rien à convertir ; « nous avions
  abordé la possibilité de faire un traitement de transformation lors
  de la lecture » — `normalize:` sur la colonne (D872), jamais dans la
  règle ni dans `parent:` ; l'exemple de D931 aligné.
- **les settings, la maison des types** — **D991**, **D992**,
  **D993**. En montrant `normalize:`, le `settings.yml` du cas le
  portait à la racine : « dans settings, normalize n'est pas au bon
  endroit. Dans settings, les paramètres par défaut des types ou la
  définition de nouveaux types peuvent être présents » — `text: {
  normalize: trim(me) }` ; puis « les types ou ses dérivés doivent être
  présentés simplement et sont définissables avec des paramètres par
  défaut » — une seule forme, la clé est le nom, `type:` la base d'un
  dérivé : `date_pmi`, `time_pmi` (« hhmm seulement… les 2 formats sont
  possibles dans PMI », le masque surchargeable au champ), les
  trente-quatre colonnes J et S des sources en forme courte ; et la
  devise en défaut du type `amount`.

**Le lot 3 (020–023) — écrit le 20/09/2026, en attente d'arbitrage :**

- **le `counter` surchargé** — la valeur du numéro vient du calculé
  `numero: integer(ECKTNUMERO)` de la source (la clé convertie à la
  lecture, D990), la règle écrit `numero: numero` dans un champ
  `counter` (D883 — le privilège de la reprise) ; le `format:
  "{counter:000000}"` de la cible n'est qu'un affichage ; la valeur
  reprise doit-elle repositionner le compteur (le prochain numéro
  créé à la main, si l'entrepôt écrivait un jour) ? — **tranché par
  D998** : « l'identification des trous correspond à contrôle sur la
  propriété d'un compteur » ; « nous pouvons disposer de counter avec
  une méthode update(<clé>, <valeur>). Si la valeur > au compteur
  courant, ça positionne le compteur courant sur la valeur la plus
  grande » ; puis **D999**, « plus parlante » :
  `operations: commande_vente.numero.update(numero)` — la méthode du
  type counter, le champ adressé par le point, sur 020 et 022 ; le
  rejeu par l'identité, « tout à fait ».
- **le constructeur `datetime(jour, heure)`** — proposé pour le couple
  J + S ; **tranché par D1000** : « cette situation décrite n'existe pas
  dans PMI. Sur les commandes, il n'y a pas d'heures… LCCSDELEXP est la
  semaine du jour… se déduit du jour » ; « le S en 4ème position décrit
  en général la semaine » — les délais en `date`, les S des lignes
  ignorées, la convention corrigée ; puis **D1001** : « dans la table
  MVTSTO, la date et l'heure du mouvement avec les secondes
  correspondent à la combinaison des champs MVCJSAI (jour) et MVCTSAI
  (heure) » — MVCSMVT et DPCSSINV sont des semaines ;
  `mouvement.horodatage: datetime` dans l'identité, le constructeur
  `datetime(jour, heure)` a son cas ; `time_pmi` en hhmmss ;
  `niveau.inventaire` en date.
- **les statuts inventés** — aucune table de l'échantillon ne porte
  ECCTSTATUT ni LCCTSTATUT : `EC` en cours, `SO` soldée, `AN`
  annulée ; `PA` partielle pour la ligne (D963) — **tranché par
  D1002** : « LCCTSTATUT prend les valeurs A (acompte / en cours), vide
  (non traité), S (soldé), T (terminé) et P (partiel). ECCTSTATUT peut
  être ignoré. LCCTETACDE est utilisé pour un état mais je ne connais
  pas les valeurs exactes » ; les deux conduites du `select` : « en
  l'absence de "...", la valeur est rejetée ; "..." permet de préciser
  toutes les autres valeurs » — les énumérés des lignes réécrits
  (non_traite, en_cours, partielle, soldee, terminee), le statut retiré
  des entêtes, `null:` pour le vide (mien) ; puis **D1003** : « l'état
  d'une commande se déduit de l'état des lignes » — le statut de
  l'entête en calculé, la chaîne `valeur if condition else …` (mienne).
- **l'adresse de livraison de l'entête** — le morceau 3 ne la lisait
  pas ; six colonnes lues (ECCTNOMLIV, ECCTRUE1LI/2LI/3LI, ECCTCPLIV,
  ECCTVILLIV, ECCTPAYSLI ; ECCTCPAYLI non lue), sans GPS : la forme
  texte du constructeur (D961), *absente quand la ville manque (`if
  ECCTVILLIV != null` — mien)* ; l'adresse de facturation de l'entête
  (ECCTRUE1–3, ECCTCP, ECCTVILLE, ECCTPAYS) n'a pas de champ au modèle —
  non lue, celle du client fait foi ; à confirmer — **tranché par
  D1004** : « nous stockons le détail pour la reprise et nous calculons
  un champ adresse_livraison correspondant à l'appel à la
  géolocalisation » (le connecteur `location`, classe `ban`, déclaré) ;
  « laisser geolocation refuser un texte vide si if est absent » ;
  l'adresse de la commande « une redondance… le code client est
  suffisant », ignorée ; chez l'achat « nous allons ignorer ces
  champs ».
- **la devise du prix de revient** — LCCNPUREVI n'a pas de devise
  propre chez PMI (LCCTDEVISE est celle des prix de vente) :
  `amount(LCCNPUREVI)` à la devise de l'entreprise (D993) — *mien, à
  confirmer* ; l'alternative `amount(LCCNPUREVI, LCCTDEVISE)` —
  **tranché par D1005** : « le prix de revient se déduit. Cegid PMI le
  calcule et le stocke pour des questions de performance. Dans notre
  cas, ce sera un champ calculé mais pour l'exemple, nous n'allons pas
  fournir la formule » ; « nous ne traitons pas la marge pour
  l'exemple » — les deux champs retirés, LCCNPUREVI ignorée.
- **la validation de la règle qui redit celle de l'entité** —
  `me.quantite_expediee <= me.quantite` à la règle (D932, le deuxième
  étage) doublonne `quantite_expediee <= quantite` à l'entité : le
  même rejet, au même rapport ; garder l'une ou l'autre ? — *ma
  lecture : l'entité suffit, la règle porte ce qui est propre à la
  source* — **tranché par D1006** : les trois temps redits (« sur la
  source à la lecture — limite les enregistrements aux valeurs valides ;
  sur le mapping — identifie les règles non respectées ou les données
  incorrectes ; sur la destination — garantit que les règles des
  données entreposées sont correctes »), et « ces règles de validation
  ne sont pas vraiment utiles car les quantités sont à titre
  indicatif… identifier les cas limites de nos processus » — retirées
  des deux étages.
- **l'unité de la ligne face à l'unité de l'article** — la ligne
  garde `quantite: decimal` + `unite: text` (LCCTUNICDE), l'article
  porte sa matrice (D982) : faut-il contrôler que l'unité de la ligne
  est connue de l'article (`LCCTUNICDE in article.unite.units` — une
  validation de la cible, forme mienne) ? Sinon la conversion
  `(article.unite * quantite).to(kg)` échouera à la lecture — **tranché
  par D1007** : « pour l'exemple, l'unité peut être contrôlée lors de
  la migration » — `me.unite in me.article.unite.units` aux règles 021
  et 023, le deuxième temps de la validation (D1006) ; `.units` mien.

**Le lot 3 est clos — D998 à D1007.**

**Le lot 4 (024–025) — écrit le 20/09/2026, en attente d'arbitrage :**

- **une quatrième origine des référentiels** — D962 nomme trois
  origines (les paramètres, les fiches articles, les mouvements) ; un
  niveau de stock (STDEPLOT) dont le dépôt ou l'emplacement n'est dans
  aucune serait un orphelin (D875) — les mouvements ne sont relus que
  sur trois mois. Deux règles `distinct` de plus sur STDEPLOT (3 bis,
  6 bis), *à valider* ; l'alternative : accepter le rejet, le
  référentiel se corrige à la main — **tranché par D1008** : « STDEPLOT
  rejoint le référentiel uniquement si la quantité != 0, si
  l'emplacement n'existe pas déjà dans le référentiel » — les deux
  règles gardées, filtrées sur `DPCNSTOPHY != 0` ; le niveau à zéro sur
  un lieu inconnu reste un rejet.
- **la quantité signée** — MVCNQTE est signée chez PMI, le sens vit
  dans MVCTTYPE : `quantite: abs(MVCNQTE)` ; *`abs()` n'existe pas au
  catalogue des fonctions (D934 ne couvre que le texte) — à ajouter aux
  fonctions du nombre, ou le signe est-il toujours cohérent avec E/S ?*
  — **tranché par D1009** : l'échantillon montre des sorties positives
  et quelques-unes négatives ; « une quantité avec une unité (celle du
  stockage de l'article). Elle est signée et vient en complément du type
  de mouvement E/S. Une valeur négative est une correction. Pas de
  validation sur la quantité. Par contre, la ligne est valide si la
  quantité est non nulle » — `measure(MVCNQTE, unite_stock)`, l'unité
  empruntée à l'article (`unit: article.unite`, mien) ; « ajoute un
  champ calculé valide qui est vrai si la quantité est non nulle » —
  le calculé, pas un rejet.
- **la masse du mouvement** — MVTSTO porte un poids unitaire
  (MVCNPDSUNI) : `poids_unitaire: measure(MVCNPDSUNI, kg)` (l'unité
  inventée, D963) et `masse: poids_unitaire * quantite` à la cible ;
  *l'autre voie, la matrice de l'article `(article.unite *
  quantite).to(kg)` (D982) ; et la matérialisation à l'écriture sur des
  millions de lignes (D985, en proposition)* — **tranché par D1010** :
  « le poids unitaire est à porter au niveau de l'article » — le champ
  retiré du mouvement, MVCNPDSUNI ignorée, `masse: quantite.to(kg)` par
  la matrice de l'article, où le poids entre comme conversion vers le
  kilogramme (mien) ; la matérialisation D985 est notée pour
  l'implémentation (D1012).
- **la valeur du mouvement** — MVCNVAL existe chez PMI ; recalculée
  à la cible (`prix_unitaire * quantite`), la colonne ignorée — *ou la
  reprendre, comme le prix de revient stocké « pour des questions de
  performance » (D1005) ?* — **tranché par D1011** : « le poids ne varie
  pas pour une même référence. Par contre, le prix unitaire varie en
  fonction du temps. En le dupliquant sur le mouvement, nous simplifions
  le calcul de la valorisation avec le facteur temps. Nous allons
  conserver l'approche » — le prix gardé, la valeur recalculée
  (`quantite.value`, mien).
- **le niveau sans couverture** — STDEPLOT est un état, pas un
  journal : relu en entier chaque nuit, l'historique de la cible donne
  le stock à une date (D412/D882) ; *aucun `coverage:`, à confirmer* —
  **tranché par D1013** : « la relecture de STDEPLOT concerne au plus
  200 000 lignes… sans surcoût ; MVTSTO, plusieurs millions de lignes,
  coverage et reset_coverage sont à paramétrer » ; « pas d'historique
  sur STDEPLOT car les mouvements sont dans MVTSTO. Sinon, cela fera
  doublon (ou presque). Par contre, un comparatif entre les mouvements
  et le stockage peut être mené par une règle de contrôle » — `history:
  false` sur le niveau ; puis **D1014** : « la règle de contrôle
  s'effectue par un champ calculé d'une matrice à 2 dimensions :
  emplacement × article = somme des quantités en entrée du mouvement −
  somme des quantités en sortie du mouvement » — `depot.controle_stock`,
  l'hypercube (D897) en calculé, mes calculés du niveau retirés ; puis
  **D1015** : « nous pouvons calculer la liste des mouvements d'un
  article, puis la quantité par emplacement s'en déduit via des sommes.
  Nous pouvons introduire un "group by" dans une liste » —
  `mouvements.group(emplacement, article).sum(…)`, l'agrégat par
  cellule, l'hypercube en résultat ; `article.stock_par_emplacement` ;
  puis **D1016** : « 2 associations basées sur les mouvements via 2
  accès : l'article et l'emplacement. Le group by devient une propriété
  de l'association au même titre que le sort by » — `group:` à côté
  d'`order:`, `article.mouvements_par_emplacement`,
  `emplacement.mouvements_par_article`, les sommes par cellule ; puis
  **D1017** : « les méthodes group et sort sont à ajouter » — les deux
  méthodes de la collection, la propriété `order:` renommée `sort:`
  (mien).
- **le lot en texte** — DPKTNUMLOT et MVCTNUMLOT restent des textes
  (le morceau 2 : « Stock.Batch le décrit chez PMI, l'analyse dira ») ;
  *un référentiel des lots n'est pas ouvert, à confirmer* — **tranché
  par D1018** : « pour le cas d'usage, oublions le numéro de lot. Si
  nous devions le prendre en compte, il faudrait séparer 2 concepts :
  la définition d'un article et l'article à proprement parler (article
  physique)… le n° de lot et la date de péremption, le packaging… cela
  irait trop loin par rapport au besoin du cas d'usage » ; « nous
  allons considérer ces propriétés sur la base de chaque enregistrement
  de mouvements » — le lot, un texte sur chaque mouvement et dans la
  clé du niveau, sans référentiel, BATCH non décrite.

**Le lot 4 est clos — D1008 à D1018.**

**Le retour de l'auteur sur les sources (20/09) :**

- **la référence nommée** — **D995**. En relisant STDEPLOT et
  NOMENC : « je propose une syntaxe complémentaire dans le cas des
  références multiples pour une même entité :
  `ARTICLE[ARTICLE_STOCKE].ARKTCODART`… un identifiant/alias de
  ARTICLE qui lie les identifiants à fournir pour retrouver la
  référence » ; « le parent et l'enfant font référence à un article
  mais pas le même » — NOMENC porte `ARTICLE[PRODUIT]` et
  `ARTICLE[COMPOSANT]`, `parent: ARTICLE[PRODUIT]` (ma conséquence) ;
  la référence unique garde la forme simple.
- **ARCTNOFOU1/2, « des codes qui font référence à un tiers (soit un
  client, soit un fournisseur) »** — *en attente de confirmation* : la
  colonne peut-elle porter un code client (la cible deviendrait le
  parent `tiers.tiers`, la source devrait choisir entre CLIENT et
  FOURNIS — D884, un code peut exister des deux côtés), ou la forme
  `FOURNIS.CLKTCODE` tient-elle, nommée au besoin ? — **tranché par
  D996** : « compte 1 correspond au compte client ou fournisseur par
  défaut… un article acheté… un client s'il est vendu tel quel ou un
  fournisseur… un produit fabriqué… le client de référence. Compte 2
  correspond au dernier achat/vente réalisé », « se calcule, ne se
  stocke pas » ; `ARCTNOFOU1: FOURNIS.CLKTCODE or CLIENT.CLKTCODE`
  (« le premier des 2 qui matchent fait le lien »), ARCTNOFOU2
  ignorée ; à la cible, la destination « plus fine » : le client par
  défaut et la liste des clients sur le fabriqué, le fournisseur par
  défaut sur l'acheté — « grâce à l'héritage aux règles de
  clarification, nous pouvons redispatcher l'information au bon
  endroit » ; `article.fournisseurs` retirée.
- **les comptes à la cible** — **D997**. « Dans la destination, nous
  définirons 2 champs — chacun pointant sur une entité différente. Pas
  d'ambiguïté, pas de or » ; « client_defaut et fournisseur_defaut
  vivent sur l'instanciation de l'article (type d'article)… absents
  pour les inactifs… pour l'exemple, nous ne mettrons pas les 2 sur
  l'article. Ça fait partie des éléments spécifiques » ; « dernier_
  client: commandes_vente.last().client (le tri est porté par la liste
  calculée) — même approche pour le fournisseur ». Le modèle :
  `article.fournisseur_defaut`, `fabrique.client_defaut`,
  `fabrique.clients` (dérivée des lignes de vente), les deux derniers
  comptes en calculés ; les règles 013 et 014 ajoutent leur propre au
  bloc commun — le premier emploi du cumul en bloc (D968) ; mes formes
  en proposition : `order:` sur la liste calculée (renommée `sort:`,
  D1017), `last()` sans argument, `ligne.client`/`ligne.fournisseur`
  par `owner`.

### M1 — la détection des écarts à l'échelle (D864, en proposition — tranchée par D878)

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

### M2 — la consultation et l'analyse des écarts (D864, en proposition — tranchée par D878)

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
comme entités du module `migration`. *(Le mot `immutable` étant
déjà pris par la référence — D395 —, `append_only` fut recommandé
à sa place.)*

### La remise à plat de l'auteur — la comparaison par blocs et `coverage:` (D878)

Le 06/09/2026, les quatre pièces et le mot sont soldés d'un coup,
mot pour mot :

> La migration consiste à comparer le contenu des entités d'origine
> converties et prêtes à être intégrées dans les entités
> destinations.
>
> Pour des questions de performance, nous pouvons fournir des
> informations sur la manière dont la lecture des données d'origine
> est assurée :
>
> - uniquement les enregistrements nouveaux depuis la dernière
>   lecture ;
> - relecture des enregistrements selon une plage de dates (en
>   général) ou de valeurs (cas de numéros de facture, …) ;
> - relecture de la totalité des enregistrements.
>
> append_only est trop restrictif. Syncytium procède à la relecture
> de la totalité. Le paramètre "Coverage" précise :
>
> - la clé de la partition (peut être différente de identity) :
>   - selon la clé de la partition, Syncytium va garder une
>     empreinte par clé — cette empreinte peut être utilisée pour
>     identifier une différence ;
>   - Syncytium va conserver la dernière valeur parcourue pour être
>     en mesure de reprendre depuis la dernière lecture ;
> - une plage de valeurs de clé :
>   - par exemple, si une date décrit la couverture, une période
>     pourra être indiquée (les 3 derniers mois, la dernière année
>     ou la dernière semaine) ;
>   - par exemple, si un numéro de documents, de factures ou de
>     commande sont précisés, une plage de valeur pourra être
>     indiquée (reprendre les 15 dernières valeurs, les 10.000
>     derniers enregistrements, …).
>
> Cette comparaison est faite par partition et décompose l'analyse
> en blocs :
>
> - un bloc d'anomalies — identification des lignes d'origine
>   n'ayant pas pu être converties ;
> - un bloc de création — identification des clés nouvelles ;
> - un bloc de modification — identification des clés existantes
>   avec le contenu d'un des champs différent ;
> - un bloc de données inchangées — rien à faire ;
> - un bloc de suppression — identification des clés existantes
>   dans la destination et n'existant pas dans l'origine.
>
> Pour chaque bloc et pour chaque clé, le nombre d'enregistrements
> par entité en synthèse apporte une visibilité sur l'avancement de
> la migration.
>
> Le traitement de cette comparaison va dépendre de la
> configuration des entités de destination :
>
> - la présence d'un historique indique que les écarts de valeurs
>   viennent compléter les valeurs existantes et sont stockés dans
>   l'historique ;
> - l'absence d'un historique indique que les écarts de valeurs
>   viennent remplacer les valeurs existantes.

**La lecture — ce que D878 fait aux quatre pièces et au mot :**

- **la comparaison se fait sur le converti** (D672 tient : la clé
  fonctionnelle, l'enregistrement reconstruit contre la cible),
  **par partition et en cinq blocs** — anomalies, création,
  modification, inchangé, suppression ; le bloc de suppression est
  mon « disparu », le bloc d'anomalies rejoint les rejets (D177) ;
- **`append_only` est écarté** — trop restrictif — et avec lui
  toute qualification de l'entité source (la pièce 3 et le mot) :
  **le traitement des écarts se lit sur la destination** —
  `history:` présent, les écarts complètent (l'historique les
  garde, D168–D174) ; absent, ils remplacent ; **l'analyse des
  écarts = l'historique de l'entité cible + la synthèse des blocs**
  — la pièce 4 prend cette forme : les décomptes par bloc, par
  clé de partition, par entité, en données du module `migration`
  (D666/D668) ;
- **`coverage:` sur l'entité source remplace la pièce 1 et la
  pièce 2** : la clé de partition (distincte de l'`identity:`
  possible) porte **une empreinte par valeur de clé** — le condensé
  agrégé de la partition qui signale une différence — et **la
  dernière valeur parcourue** — la reprise depuis la dernière
  lecture, le mode « nouveaux seulement » ; **la plage** dit ce qui
  se relit systématiquement — une période sur une date, un nombre
  de valeurs ou d'enregistrements sur un numéro ; **le défaut, sans
  `coverage:` : la relecture de la totalité** ; l'empreinte par
  ligne dans la provenance (D178) n'est plus nécessaire ;
- **les mots voisins** : `filter:` (D663) = le périmètre déclaré,
  jamais lu ; `coverage:` = la stratégie de lecture dans le
  périmètre ; et le `coverage:` de la lecture n'est pas le taux de
  couverture de D862 (la même famille, deux objets — noté) ;
- **la forme, arrêtée par l'auteur (D879)** : « pour coverage, ne
  pas oublier que key peut faire référence à plusieurs champs. Et,
  range se reporte sur chaque champ » — **`coverage:` est une carte
  des champs de partition**, chaque champ avec **`value:`** (la
  nature de la partition — `month`, les natures du crochet de
  D382 ; absente, la valeur brute) et **`range:`** (la plage relue —
  une durée de D476 sur une date, un nombre sur un numéro) ; la
  clé de partition composée = plusieurs champs, chacun sa plage :

```yaml
# source/MVTSTO.yml — la lecture par partition : le mois du mouvement
coverage:
  MVCJMVT:
    value: month              # la partition au mois
    range: 3m                 # les trois derniers mois relus

# source/ECOMCLI.yml — la lecture par plage de numéros
coverage:
  ECKTNUMERO:
    range: 10000              # les dix mille derniers
```

  *la nuance de D878 sur un numéro — les dernières valeurs de la
  clé ou les derniers enregistrements — à préciser sur la table
  (une commande, une valeur ; ses lignes, plusieurs
  enregistrements).*

- **la forme courte, au crochet** (D880 — « je propose une forme
  simplifiée, peut-être plus lisible ») : **`coverage:
  MVCJMVT[month - 3]`**, **`coverage: ECKTNUMERO[10000]`** — le
  crochet est le paramètre en ligne (D372/D381 : `text[3..10]`,
  `date[yyyy-mm]`) : la nature puis la plage en retrait (`month -
  3` = les trois derniers mois, `week - 1` = la dernière semaine),
  ou la plage seule sur un numéro (`[10000]` = les dix mille
  derniers) ; plusieurs champs = la liste (`coverage: [MVITSOC,
  MVCJMVT[month - 3]]`) ; la carte de D879 (`value:`/`range:`)
  demeure la forme riche, équivalente — le patron courte/riche du
  registre (D356/D441).

- **`reset_coverage`, l'opération qui force la relecture** (D881) :
  « je propose de définir une opération
  `reset_coverage(nom du module, nom de l'entité)` qui peut être
  exécutée régulièrement. En réinitialisant le coverage, cela
  forcera Syncytium à tout relire. Par exemple, nous pouvons du
  lundi au vendredi faire un delta, et le dimanche une relecture
  complète en planifiant un reset_coverage dans la nuit de samedi à
  dimanche » — l'opération du socle efface l'état de couverture
  d'une entité (la dernière valeur parcourue, les empreintes par
  partition) : le `migrate` suivant relit la totalité (le défaut de
  D878) ; planifiable par `every:` (D434 — `weekly[saturday at
  23:00]`), déclenchable comme toute opération (D428/D667) ; **le
  rythme du cas** : le delta du lundi au vendredi, la relecture
  complète le dimanche — c'est elle qui rattrape les retouches
  anciennes des outils maison (D864) hors de la plage ; la
  vingtième opération du socle (après `migrate` D667 et
  `anonymize` D697), au degré `administrator` (D701 — en
  proposition).

Les quatre pièces et le mot sont soldés ; M1 et M2 sont clos par
D878, la forme par D879–D880, le rythme par D881.
