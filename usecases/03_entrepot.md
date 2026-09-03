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
  classe `sqlserver` consignée (D613/D619) : `read_instance` pour
  de vrai (D653/D829), la lecture au curseur (D689) ;
- **la vérification de règles métiers** (D404) sur les données
  converties, le rapport aux responsables (D406) ;
- **les droits de consultation sur les entités et les champs**
  (D859 — P8/D25–D27, D196, rights.md) : le premier exemple de
  l'échelle aux droits réels, de l'opérateur aux dirigeants ;
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
   nombre de tables, d'enregistrements).
4. **Le réel à fournir** — comme les CSV de la banque et les
   classeurs des véhicules : **une extraction du schéma** (le DDL ou
   la liste tables/colonnes, anonymisée) et **un échantillon de
   données**. Sans le réel, aucun nom de table Cegid ne s'écrira
   ici : je ne les connais pas de façon fiable, et le cas se
   construit sur le vrai. L'alternative : l'auteur nomme de mémoire
   un petit périmètre.
5. **Le périmètre fonctionnel de départ** : les articles (les
   nomenclatures, les gammes — la composition auto-référencée D135),
   les tiers, les commandes clients, les ordres de fabrication, les
   stocks et les mouvements, les achats, la facturation ? Lesquels
   en premier, lesquels `ignored` ? *Répondue (D859) : quatre
   domaines — les données techniques (articles, gammes &
   nomenclatures, tarifs), les clients et les fournisseurs, les
   commandes de vente et d'achat, les stocks et les mouvements ; le
   reste de l'ERP hors périmètre.*

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
    entière (D820 lit du texte). À confirmer.

## Les morceaux proposés

*(à arbitrer — le protocole D457/D756 : un morceau à la fois, validé
avant le suivant ; l'ordre suit la conversion, le cœur du cas)*

1. **l'assise** — la racine et les environnements (staging /
   production ?), les connecteurs : `entrepot` (le storage cible),
   `cegid` (le storage `sqlserver` en lecture — D175 — et sa carte
   `entities:` D828, les tables lues), l'authentification, le smtp,
   `logging.yml` (D830), **les groupes** (`groups.yml` D414 — les
   strates, de l'opérateur aux dirigeants, le degré D699) ;
2. **le modèle cible** — les modules de l'entrepôt sur les quatre
   domaines du périmètre (D859, en français), **les droits de
   consultation sur les entités et les champs** (D859 — la
   confidentialité, les `allow:`), `history:` sur les entités qui
   gardent leurs changements de valeur (D859/D411–D413), **les
   validations = les règles métiers** (D404), le `report:` au
   destinataire capable de corriger l'origine (D406/D859) ;
3. **la source** — `source/` : les tables Cegid décrites dans la
   grammaire (l'ossature `read_instance` D653, `ignored` D657, les
   normalisations D660, le `filter:` D663), **le hook de type de la
   date `AAAAMMJJ`** ;
4. **le mapping** — `mapping/` (la clé sur chaque règle D825,
   `parent:`, `distinct:` D658), la migration déclarée `relative` +
   `reset: false` + l'`every:` nocturne (D667), la provenance
   (D178), le différentiel (D672) ;
5. **le pilotage et la restitution** — **l'état de la qualité et de
   l'avancement** (D859 — les surfaces du module `migration` : la
   couverture, les rejets et leurs causes, D666/D668), le rapport
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
