# Glossaire

Cette section décrit les mots clés utilisés dans le projet Syncytium. Nous distinguons dans le projet les termes français utilisés pour la communication et les termes anglais (universels) pour la configuration et la traduction technique des concepts abordés.

---

**Agrégat** — Un enregistrement « racine » et tout ce qu'il possède,
pris comme un tout indivisible. Une commande et ses lignes s'enregistrent,
s'historisent et disparaissent ensemble. À ne pas confondre avec la fonction
d'agrégation, `sum` ou `count`. *(D101, D1564)*

**Anonymisation** — L'effacement des données personnelles d'un
enregistrement, qui garde son squelette : les liens et l'historique
tiennent, le contenu s'efface. *(D139)*

**Assistance** (`_assistance`, module interne — en proposition) — La
F.A.Q. vivante du socle : l'utilisateur pose une question depuis un
écran, le concepteur ou un responsable métier répond ; la question
répondue nourrit la F.A.Q. générée, le chat et la complétude.
*(D1132)*

**Association** (`association with`) — Le lien souple entre
enregistrements, sans possession : chacun vit sa vie.
*Ex. : `tags: association with catalog.tag`.* *(D400)*

**Audience** — Le public d'une donnée : l'interne (les collaborateurs)
ou l'externe (les clients, par un portail). *(D70)*

**Base miroir** (`buffer:`) — La base, à l'image de la destination,
où une reprise de données se construit et se contrôle avant d'être
reportée dans la base de l'application ; elle vit le temps de la
migration. *(D1044/D1045)*

**Boîte de dialogue** — Une fenêtre que l'application dessine dans sa page,
au-dessus de la surface : un message, puis confirmer ou annuler. C'est une
fenêtre assumée. La fenêtre surgissante du navigateur, la popup, ne sert
jamais. *(D601, D1605)*

**Cartouche** — L'en-tête ou le pied obligatoire d'une édition : le
numéro de version, la date, l'auteur de l'édition. *(D1142)*

**Cascade** — Le chemin de lecture des réglages : la version, puis le module,
puis l'entité, puis le champ ; le plus proche l'emporte. Voir Réglage.
*(D359/D360, D1174)*

**Catalogue (des textes du moteur)** — Les libellés, intitulés et
gabarits génériques de Syncytium, codifiés et uniques, un catalogue par
langue portée ; en couches — le moteur, le hook, l'application — le
plus proche l'emporte ; une langue attendue qui manque est une erreur
d'ingestion. Une langue que le core ne porte pas est apportée par le
projet : `syncytium language <référence> <souhaitée>` construit le
catalogue, le concepteur le traduit item par item. *(D1160–D1163,
D1465)*

**Champ** (`field`, le bloc `fields:`) — La plus petite donnée d'une
entité. Elle se caractérise par : un nom, un type, des propriétés.
*Ex. : `company_name: text[80]` — la raison sociale, 80 caractères au
plus.* *(D118)*

**Champ calculé** (`computed`) — Un champ dont la valeur est déduite par une opération. Par nature, cette information n'est pas modifiable par un utilisateur. Elle se rafraîchit en fonction des évolutions de valeurs de champs dont il dépend.
*Ex. : `total_orders: { computed: count(orders) }`.* *(D90)*

**Chat** (`chat`, le module du socle) — L'écran où l'utilisateur
interroge en langue naturelle la somme des connaissances de l'instance
— les données et leur description — par un modèle de langage déclaré
en connecteur (`llm`). Le chat ne sait que ce que l'utilisateur peut
consulter ; il répond et fournit les données, la mise à jour passe par
les interfaces de l'application ; les données personnelles sont
anonymisées avant tout envoi, hors celles qui lui reviennent ; chaque
question et chaque réponse sont tracées dans une **session
d'échanges**, adossée à un module — une session par module et par
utilisateur. *(D957–D959)*

**Clé fonctionnelle** (`identity`) — Identifie un enregistrement
aux yeux du métier de façon unique : un code client, un numéro de facture. Elle peut
changer un jour ; l'identité technique, elle, jamais. Toute entité
en porte au moins une, la sienne ou celle qu'elle hérite de sa racine ;
ses champs sont obligatoires par définition. Une entité peut en porter
plusieurs, nommées (`identities:`) : la première est l'identité de
naissance, obligatoire ; les suivantes sont acquises — un numéro
attribué à la validation — et ne valent qu'une fois complètes.
*Ex. : `identity: [code]` ; `identities: { mensuelle: [client, mois],
numero: [numero] }`.* *(D142/D357, D1035/D1039, D1170–D1171)*

**Collection** — Une valeur à plusieurs éléments : une liste, une
composition, une association. Elle porte ses méthodes : `sum`, `count()`,
`first`, `group`, `sort`… *Ex. : `lignes.sum(montant)`.* *(D580, D887,
D1015–D1017)*

**Complétude (de la documentation)** — Le rapport du concepteur : ce
qui devrait être écrit et ne l'est pas — les descriptions, les aides,
les libellés d'énumérés, les masques, l'entité sans aucun `rgpd:`. Un
défaut du socle n'est pas un manque, sauf quand il tient lieu d'un
texte pour le lecteur (le `label:` absent) ; elle compte, elle ne
devine pas ; une ligne de commande la mesure avec le moteur de la
génération, le seuil reste à la discrétion du concepteur — Syncytium ne
refuse jamais une version. Elle compte ce qui n'est décrit dans
aucune langue : un texte sans une langue de la version n'est pas un
manque mais une erreur d'ingestion (D1474). L'inventaire consolidé —
dix-neuf manques en quatre familles — est la table de §20. *(documentation.md §20,
D1173/D1177/D1182, D1221, D1474, D1478)*

**Composant graphique** (`component`) — La représentation graphique d'un champ à l'écran ou sur un document (PDF, Excel, ...) : la jauge d'un pourcentage, le calendrier d'une date, le toggle d'un booléen. *(D64)*

**Type composé** — Un type prêt à l'emploi, fourni par Syncytium ou proposé par une extension, bâti sur un type de base
avec sa validation incorporée : `amount` (un montant et sa devise),
`siren` (contrôlé), `period` (début ≤ fin)… *(D122)*

**Composition** (`list of`) — Le lien de possession : le parent déclare
ce qu'il possède, les enfants naissent, vivent et disparaissent avec
lui. *Ex. : `lines: { type: list of order_line }` — la commande possède
ses lignes.* *(D399)*

**Compteur** (`counter`) — Un numéroteur automatique : jamais deux fois
le même numéro, jamais de trou. Il peut être réinitialisé sous condition. Mais, la clé générée depuis le compteur doit être unique.
*Ex. : `number: { type: counter, format: "CMD-{year}-{counter:000000}" }`.*
*(D154/D409)*

**Concepteur** (anciennement *technicien*) — Celui qui écrit la
description. Un rôle, pas un métier : une à plusieurs personnes le
portent. Le concepteur est celui qui porte la validité de la
configuration et la stabilité de l'application. *(D95, D1148)*

**Conditionnel** (`if … else`) — L'expression qui choisit une valeur selon une
condition, la valeur d'abord : `valeur if condition else autre`. Les cas
s'enchaînent de gauche à droite ; un `if` sans `else` vaut nul quand la condition
est fausse. *Ex. : `"cloture" if date_fin is not null else "actif"`.* *(D580, D1109–D1110)*

**Confidentialité** (`confidentiality`) — Le niveau d'exposition d'une
donnée : `public` (partout), `protected` (l'interface et les tâches),
`private` (les tâches seulement) — resserrable par groupes. *(D25)*

**Connecteur** (`environments/<env>.yml`) — Une passerelle entre
Syncytium et un système tiers : une base de données, un annuaire, des
fichiers, un géocodeur, un serveur de mail… Le connecteur décrit ses
entrants et ses sortants — la lecture et l'écriture selon les
spécificités de sa famille. Il est **global** (aucune déclinaison par
module ni entité) et **déclaré à l'environnement** : chaque
environnement les siens, la complétude vérifiée à l'ingestion. **Son
type est sa famille — et son contrat** : huit familles closes
(`storage`, `smtp`, `file`, `directory`, `location`, `webhook`,
`siren`, `authentication`) dont chacune contraint les méthodes ; sa **classe**
(`postgresql`, `ban`, `smtp_std`…) remplit le contrat. Toute classe
implémente le socle commun : `initialize`/`release`,
`connect`/`disconnect`, `ping()` (le statut, la fréquence à
`every:`), `onerror` (le mock ou la page de maintenance),
`describe()` (la documentation de l'instance). Ses propriétés le
paramètrent (pas de contexte — il naît au démarrage du projet) ; ses
secrets référencent des variables d'environnement (chiffrables) ; le
câblage nomme les rôles : l'environnement désigne le storage du modèle
(`storage: entrepot`), la migration sa base d'origine (`from:`) —
optionnel au simple : le nom = le type ; `when:
<connecteur>[.<entrée>]` abonne une opération à ses événements.
L'application ne démarre que si le mail à l'administrateur est
possible — le canal d'alerte avant tout. Le stockage des entités est
lui-même un connecteur — et Syncytium sait convertir ou transférer
d'un connecteur à l'autre. *(D79, D603–D642)*

Exemple : `location: { class: ban, parameters: { url: … },
secrets: [api_key] }`.

**Constructeur** — La fonction au nom d'un type, qui fabrique une valeur
de ce type à partir de ses parties. *Ex. : `amount(ARCNPMP)`,
`measure(ARCNEPAISS, "mm")`, `datetime(MVCJSAI, MVCTSAI)`.* *(D659)*

**Contexte** (`context`) — L'entité du moteur, en lecture seule :
l'utilisateur, le moment, l'instance, le module, la page d'un document,
les paramètres. *Ex. : `context.now`, `context.user`.* *(D254, D588–D591)*

**Crochet** (`type[paramètre]`) — La convention d'écriture qui glisse
un paramètre dans un nom : `text[3..10]`, `time[hh:mm]`,
`counter[accounting]`. *(D366)*

**Cycle de vie** (`states: <champ>`) — La suite d'états qu'un
enregistrement traverse : brouillon, confirmée, expédiée… Porté par un
champ énuméré désigné, chaque état déclare ses droits (`allow`) et ses
passages (`promote`/`demote`) — le graphe se lit, le moteur refuse tout
passage hors graphe. *Ex. : `states: status`.* *(D421–D428)*

**Configuration** (`settings`) — Tout ce que le concepteur écrit : l'ensemble des
fichiers YAML qui décrivent l'application. Syncytium la lit, la
vérifie, puis la fait vivre. *(D336)*
La configuration peut se décomposé par étage (la version, le module, l'entité) et diffusés en cascade à ce qu'il
contient : le plus proche l'emporte. *(D348/D360)*

**Défaut du socle** — Une valeur que Syncytium applique quand rien n'est
déclaré : le libellé `${name}`, `reset: never`, l'historisation éteinte.
Les settings le surchargent ; une clé qui ne nomme aucun défaut connu est
une erreur d'ingestion. *(D1175, D1239)*

**Description** (`hint`, `label`, `description`) — Information plus ou moins complète permettant d'apporter du contexte à un élément du modèle de données. La description couvre plusieurs fonctions : aide à la saisie, une infobulle, une description courte (`hint` — D840) pour comprendre la nature de l'information, une description détaillée (`description`) pour construire une aide ou un masque d'aide. La description permet également à des outils tiers (comme l'IA) de s'interfacer ou de proposer des constructions de modèles ou de rapports adaptés à un usage.
*Ex. : `hint: { fr: Le code se génère à la création }`.*
*Réserve de vocabulaire : le « hint » d'Android/Flutter désigne le texte fantôme du champ vide — chez Syncytium, c'est le `placeholder`.*
*(D364/D840)*

**Valeur de démonstration** (`placeholder`) — Description visuelle permet de capter l'attention d'un utilisateur sur la validité de la donnée. L'exemple affiché dans un champ vide ; pour une image, l'icône de fond. *(D364/D390)*

**Extraction** (`rgpd.extract(identity)`) — L'opération du socle qui réunit tout ce
qui concerne une personne : depuis les champs qui portent son identité
civile (`rgpd: identity`), les enregistrements trouvés et confirmés,
puis ce que l'arbre de la donnée y relie — les références, les
compositions, l'historique, le journal des accès, les traitements qui
l'ont touchée. Au plancher `manager`, à la demande de l'usager ; le
résultat, une édition à cartouche, journalisée ; la famille `rgpd` des
opérations réglementaires, où `anonymize` entre comme `rgpd.anonymize`.
*(D1149, D1331–D1333)*

**Exécution à blanc** (Dry-run) — La répétition générale afin de valider la conformité d'une nouvelle version du modèle. Cela ouvre droit à un rapport sur les non-repects ou les impossibilités liés à la migration. Le but est de garantir la stabilité du système et sa continuité de service. *(D120)*

**Dictionnaire de la donnée** — Le titre de la documentation de
l'information : la donnée du projet par sa structure, ses évolutions,
son origine et son usage ; le dictionnaire des données en est le cœur,
la configuration dépliée son annexe. Il décrit l'exhaustivité de la
donnée là où la fonctionnelle décrit ce qui est accessible à un
utilisateur : la fonctionnelle en est un extrait. Il montre tout, avec
le niveau de confidentialité de chaque information ; seules les clés
`*` (les secrets) n'y sont pas. *(D1243–D1247)*

**Dictionnaire des données** — L'inventaire exhaustif des données de
l'application, lisible, en tableaux — une table par entité, une ligne
par champ : le libellé, le type en clair, l'obligation, le défaut, les
valeurs, l'aide, l'exemple — précédé de sa représentation graphique :
les modules et leurs liens, l'ensemble des entités en diagramme de
classes aux noms seuls (souligné = identifiant, italique = calculé,
« * » = sécurisé ou rgpd, gras = référencé), chaque module en vue
sélective ; construit par Syncytium depuis les propriétés d'explication
de chaque item ; sur demande, une zone par champ montre les valeurs
possibles, les statistiques d'utilisation et la volumétrie — l'entrée
vers une analyse claire de l'information ; ouvert par les deux
glossaires ; une annexe de la fonctionnelle. *(documentation.md §15,
D1179–D1180, D1212–D1216)*

**Avis de sécurité** — Ce que le projet Syncytium publie, par core,
sur son dépôt : la qualification d'une ou plusieurs CVE pour ce core —
la dépendance touchée, si le moteur emploie la partie vulnérable, la
gravité pour Syncytium, le core qui corrige —, dans un fichier signé
que l'instance lit sur autorisation de l'administrateur. Un avis de
sécurité n'est pas une CVE : il la cite et la qualifie. *(D1431,
D1443)*

**Contrat d'API** — Ce que la documentation du développeur donne au
technicien pour chaque version publiée : une console interactive dans
l'application, qui s'authentifie, prend ses paramètres (la version,
« pour le compte de », la langue, l'environnement) et n'affiche que ce
que le compte technique a le droit d'appeler — le chapitre commun en
tête, une section par entité permise, les exemples d'appel lancés
depuis la console, les écarts entre versions ; la même description en
édition pour un compte, ou au format machine. *(D1393–D1402, D1425)*

**Skill (les consignes pour l'IA)** — Le paquet qu'une IA charge pour
écrire ou améliorer une configuration Syncytium : la couche du core —
la grammaire des clés, les règles d'ingestion, les recommandations, les
exemples du socle —, versionnée avec lui ; le complément de la version,
généré depuis la configuration — ses hooks, ses types, son glossaire,
ses conventions — et le texte libre `skill:` du projet, un complément,
jamais un remplacement, décliné par langue — toutes celles de la
version, sinon l'erreur d'ingestion. Générée, déterministe ; lue au
concepteur, exportée en édition machine. *(D1224, D1226, D1409–D1410,
D1472, D1474)*

**CVE** (Common Vulnerabilities and Exposures) — L'entrée du
référentiel public des vulnérabilités : un identifiant
(`CVE-AAAA-NNNNN`), une description, une gravité, les versions touchées
d'un composant logiciel. Écrite par le composant ou par le référentiel,
jamais par Syncytium ; la veille la cherche au dépôt du source, l'avis
de sécurité la qualifie pour un core. *(D924, D1431, D1443)*

**D.A.T. (le dossier d'architecture technique)** — La quatrième
documentation : les inter-connexions de l'application avec son
environnement et le paramétrage externe indispensable — le schéma des
connexions calculé par environnement, les silhouettes des postes, le
réseau en texte porté par la description de l'environnement ; les
environnements, leurs relations, les flux et les ports ; la liste des
variables d'environnement, les comptes chez les tiers, les certificats ;
le dimensionnement et les dépendances, du core et des hooks, la veille
des CVE par le fichier d'avis de sécurité du dépôt. *(D1134, D1426–D1435)*

**Documentation (la facette)** — Chaque composant porte sa
documentation, comme il porte son affichage ou son stockage ; chaque
type de composant la décline dans chacune des neuf documentations ;
Syncytium assemble. *(D1158–D1159)*

**Documentation de l'information** — La deuxième documentation, pour
la BI, l'IA et le décideur : centrée sur la donnée et la configuration
du projet — ce que l'application sait à une version donnée (le modèle,
les règles, les droits, les réglages, le stockage, les données de
l'instance) et ce que le concepteur a écrit pour le dire. Elle
s'intitule « Le dictionnaire de la donnée » ; son plan est le §4 de
documentation.md. *(D1131, D1241, D1243)*

**Documentation du projet et du support** — La huitième
documentation : le cycle de vie des versions et leur page (le numéro,
le statut, les notes écrites, les écarts calculés — l'état, jamais
l'échéance —, les dates lues à l'instance, les ressources, les droits
d'auteur, les auteurs), le dépôt du
client (aucune clé : l'adresse lue depuis le dossier si elle est
publique, le versionnement calculé, `syncytium init` lit `from:`, la version du core, et récupère
ce core — la documentation est la sienne, D1360–D1361), signaler, demander et questionner — le
support dans l'application : les tickets (anomalie, évolution,
question) du module interne `_assistance`, leurs messages, leur
statut, le groupe gestionnaire désigné par la surface, D1363–D1373 ; la
question répondue va à la F.A.Q. de la fonctionnelle, la paire seule),
le support (un texte écrit sans engagement, les indicateurs statiques et
dynamiques, D1375–D1380).
*(D1133, D1347–D1391)*

**Édition** — Un extrait figé de la documentation pour qui n'a pas de
compte, préparé par un `manager` ou un `administrator` dans la limite de
ses droits, à cartouche, dans la langue et la version de l'émetteur,
au gabarit des rapports (`template`) ; une beta s'édite sous filigrane.
*(D1142–D1145, D1166)*

**Édition machine** — Le YAML ou le JSON des informations internes et
des items de configuration, sans facette, pour l'analyste et
l'assistant ; le Markdown est le rendu humain. *(D1165)* Depuis D1245, l'annexe du
dictionnaire de la donnée : la configuration entière et dépliée, sans
les clés confidentielles.

**Enregistrement** — Une occurrence d'une entité : tel client, telle
commande. Il a son identité fonctionnelle, celle que l'entité déclare,
et son identité technique, invisible. *(D141, D142)*

**Entité** (`entity`) — Un objet du métier ou une table dans un modèle relationnel : le
client, la commande, le produit. Chaque entité a ses
champs, ses règles, sa représentation, ... *(D347)*

**Énuméré** (`enum`) — Un type dont les valeurs sont listées, `values:` :
chacune a sa clé stockée, son libellé par langue, sa description, son
icône. L'ordre de déclaration est l'ordre de tri.
*Ex. : `values: { thermique: { label: Thermique } }`.* *(D130, D387–D388)*

**Environnement** (`environments/`) — Un cadre d'exécution hermétique : le staging
(l'essai), la production active (le quotidien), la passive (le
secours). Chacun a ses connecteurs et ses journaux. Un environnement vise à tester de nouveaux concepts, évolutions ou corrections d'anomalie sans impacter les autres environnements. Cela suit une règle bien définie (Staging avec Production). Ici, la production active/passive permet de synchroniser les informations entre les 2 environnements afin de faciliter en cas d'interruption de l'infrastructure sur l'un, une bascule quasi-automatique sur l'autre. *(D342)*

**État hiérarchique** (`states:` sur le parent) — La position d'un
enregistrement dans une hiérarchie d'héritage : le prospect devient
client, le tiers est client **et** fournisseur. « Un état hiérarchique
est déjà un statut » : les positions montent au cliquet (la première
condition vraie franchit, l'acquis se garde), redescendent par l'acte
explicite, se cumulent en branches. *(D144–D147, D353–D355, D424)*

**Facette** — Un des modes de représentations d'un type de données : la logique (la valeur
vraie), le stockage physique, l'affichage, la forme d'API ou la nature du champ CSV. *(D119)*

**Filigrane** — La marque de fond de page d'une édition de beta,
« Beta vx.y.z.w » par défaut, personnalisable ou absente. *(D1145)*

**Fonction** — Une opération du langage qui prend des valeurs en arguments et
rend une valeur, ou plusieurs valeurs nommées. Le catalogue est en anglais ;
chaque type emmène les siennes, un hook de fonction en ajoute.
*Ex. : `left(code, 3)`, `ifnull(remise, 0)`.* *(D301, D571, D579, D593)*

**Fonction d'agrégation** — Une méthode d'une collection qui en résume
les éléments en une valeur : `sum`, `count`, `avg`, `min`, `max`, `first`,
`last`, `any`, `all`, `list`. Celle qui porte une valeur se lit
« valeur if condition ». À ne pas confondre avec l'agrégat, l'enregistrement
et ce qu'il possède. *Ex. : `lignes.sum(montant if statut = "en_cours")`.*
*(D580, D887, D1564, D1575, D1576)*

**Format d'écran** (`screen:`) — Le support sur lequel une surface
s'affiche : un format, `pc`, la tablette ou le smartphone, suivi ou non
de son orientation, `pc[paysage]`, `pc[portrait]`. Sans orientation, le
format vaut pour toutes ; sans `screen:`, la surface vaut pour tous les
formats. Syncytium déduit le format de la zone d'affichage disponible ;
quand elle change de taille, l'application bascule d'un format à
l'autre, et les composants se déclinent d'eux-mêmes. *(D250, D450, D1613)*

**Forme courte, forme longue** — Deux écritures d'une même clé : la
valeur seule, tout le reste au défaut, ou le bloc qui détaille ses
propriétés. Un champ, une règle de validation, un paramètre ont les deux.
Voir Type court. *Ex. : `lieu_achat: text[..60]` ; `- rule: … message: …`.*
*(D356, D590, D1116–D1117)*

**Gabarit** — Un texte à trous, dont les accolades citent des valeurs :
le message d'une validation, le visage d'une entité, le libellé d'un
champ. *Ex. : `"{code} — {nom}"` ; `La vente du {date_vente} précède
l'achat du {date_achat}.`* *(D397, D1106, D1181)*

**Gabarit d'import** — Le fichier CSV attendu par l'écran d'import,
généré par la documentation pour chaque entité importable, par langue :
les en-têtes en libellés, pour chaque colonne le type en clair, le
masque, l'obligation, les valeurs permises, la valeur par défaut, la
clé de rapprochement ; une ligne d'exemple faite des `placeholder:` ou
des valeurs par défaut ; l'export miroir en est la mise en page.
*(D234–D237, D1211)*

**Glossaire (de l'application)** — Deux glossaires ouvrent le
dictionnaire des données : **celui des termes**, écrit par le concepteur
(`glossary:` dans `documentation.yml` du projet ou du module — les
termes du métier et leur définition) ; **celui des types**, calculé
depuis les types personnalisés ; tous deux servent le traitement
sémantique. Une annexe de la documentation ; un terme est une liste de
mots, le singulier et le pluriel, dans toutes les langues de la
version sinon l'erreur d'ingestion ; dans l'application, la définition
s'affiche au survol de la première occurrence du terme dans la page.
*(D1179–D1180, D1183–D1184, D1197, D1475)*

**Group by** (`group(champ, …)`, `group:`) — Le regroupement d'une
liste par les valeurs d'un ou plusieurs champs : une cellule par
combinaison, l'agrégat qui suit s'évalue par cellule et le résultat est
un hypercube aux dimensions des champs. En méthode dans une formule, ou
en propriété d'une association dérivée, à côté du tri (`sort:`).
*Ex. : `mouvements.group(emplacement, article).sum(…)`.* *(D1015–D1017)*

**Groupe de champs** (dans `fields:`) — Une clé de la carte des champs
qui porte `title:` et `fields:` sans `type:` — ses champs en place ou
dans un fichier référencé ; nommée, titrée par langue, ordonnée : le
modèle reste plat, les noms de champs s'adressent sans le groupe. Le diagramme en fait un compartiment, le dictionnaire une
section, le formulaire par défaut un onglet ; les champs hors groupe
forment le groupe implicite, en en-tête de l'écran. *(D1273, D1279)*

**Groupe d'utilisateurs** (`group`, `groups.yml`) — Un ensemble nommé de personnes,
brique des droits : la confidentialité, la visibilité d'un historique,
les destinataires d'un rapport. Un groupe peut en contenir d'autres :
un membre du groupe contenant voit tout ce que voient les groupes qui le
composent. Syncytium ne gère pas dans sa configuration les liens directs avec les utilisateurs. Syncytium manipule dans sa configuration des groupes. Les utilisateurs sont associés par un concepteur ou par une passerelle avec un système d'authentification.
Le groupe porte **le degré d'autorisation** (`degree:` — `reader`,
`user`, `manager` ou `administrator`, D699/D1140 — le `reader` lit la
documentation sans accéder au détail) ; l'appartenance à un groupe est
**obligatoire** pour utiliser l'application.
*Ex. : `managers: { degree: manager, groups: [accounting, sales_team] }`.* *(D26/D414/D699)*

**Héritage** (`inheritance:`) — Le lien qui fait d'une entité l'enfant
d'une autre : l'enfant reçoit les champs du parent et ajoute les siens,
dans une seule table. Un enregistrement progresse dans la hiérarchie en
gardant son identité : le tiers devient client. *Ex. : `inheritance:
tiers`.* *(D143–D146, D353)*

**Historisation** (`history`) — La mémoire d'une entité : chaque
modification photographie l'agrégat entier. On en règle la profondeur :
tout (`perpetual`), une période (`temporal[365]`), les dernières
modifications (`update[10]`), rien (`false`). *(D168/D411)*

**Hook** — Le prolongement par code : un type, un composant graphique ou une
fonction sur mesure, écrits contre le contrat de Syncytium. Le hook rend transparent l'usage de développements spécifiques à un projet. De façon homogène, Syncytium fournit un cadre d'exécution et pour ne pas à avoir à tout recréer, Syncytium fournit déjà un ensemble de Hooks.Les types de champ, les composants graphiques, les écrans de saisie, les formats CSV ou Excel fournis avec Syncytium sont des hooks. Sept familles : le type, le composant, l'opération, la fonction, le connecteur, le style, la langue. *(D52/D408, D755, D1467)*

**Horodatage** (`datetime[timestamp]`) — Un instant absolu, stocké en
temps universel et affiché à l'heure de chacun. S'oppose à la valeur
**brute**, qui reste ce qu'on a écrit — une échéance au 1ᵉʳ juillet
reste au 1ᵉʳ juillet. *(D220)*

**Identité** (`identity:`, `identities:`) — Voir Clé fonctionnelle et
Identité technique. *(D142, D1170)*

**Identité acquise** — Une identité qui ne vaut qu'une fois ses champs
remplis, comme un numéro attribué à la validation. La première identité
d'une entité est celle de naissance ; les suivantes sont acquises. Voir
Clé fonctionnelle. *(D1171)*

**Identité technique** — Le matricule interne et invisible d'un
enregistrement (un UUID), qui ne change jamais — même renommé, même
anonymisé. C'est lui que les références retiennent. *(D142)*

**Inactivation** — La suppression dans Syncytium : l'enregistrement
devient inactif, sort des listes par défaut, reste lisible et cité ;
l'effacement réel est une purge distincte. *(D137–D141)*

**Ingestion** — Processus visant à convertir une version de
configuration en une entrée dans le moteur exploitable par toutes les
composantes de l'application (API, Écrans, CSV, ...). *(D330)*

**Instance** — L'installation d'un client. Elle regroupe tous les éléments nécessaires au fonctionnement de l'application : son moteur, ses environnements, sa base, sa
description. Une par TPE. *(D16)*

**Instantané** — La photographie complète d'un agrégat à une date,
rangée dans l'historique. On la consulte, on ne la modifie pas.
*(D169)*

**Interpolation** (`${…}`) — L'écriture qui cite une déclaration nommée
de la configuration à la place d'une valeur.
*Ex. : `confidentiality: ${confidentiality.financier}`.* *(D885, D1536)*

**Langage d'expression** — La langue unique des formules : calculs,
validations, filtres, gabarits.
*Ex. : `lines.sum(amount if quantity > 0)`.* *(D90/D301, D1570)*

**Langue apportée** — Une langue que le core ne porte pas et qu'un
projet apporte : son catalogue, complet, construit par `syncytium
language` depuis une langue de référence et traduit item par item —
le catalogue du core seul, les textes du projet la portent comme toute
langue de la version (D1101) ; **un hook de langue**, la septième
famille, `hooks/languages/<code>/` ; incomplet, une erreur
d'ingestion ; elle peut être la langue technique. *(D1465–D1467)*

**Langue technique** — La langue des journaux, des traces et du
catalogue des erreurs techniques d'une instance : définie à la
configuration — `language:` de `syncytium.yml` —, non modifiable ;
l'une des langues du core ou une langue apportée par le projet.
*(D1460, D1465, D1473, D1531)*

**Lecteur (de la documentation)** — Un rôle, non une personne : douze
rôles lisent la documentation, chacun sous ses droits (D1139–D1147).
Le **concepteur** (il écrit la configuration), l'**administrateur**
(`administrator`), le **responsable métier** (`manager`),
l'**utilisateur** (`user`), le **décideur** (`reader`), l'**analyste**
(la BI, un compte à son degré), l'**assistant** (le chat, aux droits
de qui l'interroge), le **technicien** (les API, un compte technique),
l'**usager** (la personne dont les données sont traitées — une
édition sur sa demande), le **DPO** (l'auditeur aussi), l'**hébergeur**
(`reader` ou une édition), le **prospect** (le partenaire aussi — le
mode public). *(D1148, D1152)*

**Littéral** — Une valeur écrite en dur dans une formule : un texte entre
guillemets ou apostrophes, un nombre au point décimal, une durée, un booléen,
une date. Une unité ou une devise s'écrit entre guillemets ; une clé reste nue.
*Ex. : `"soldee"`, `6.55957`, `180d`, `true`, `date("2026-01-01")`.* *(D1579, D1581)*

**Libellé** (`label`) — Le nom d'une chose dans la langue de
l'utilisateur. *Ex. : `label: { fr: Client }`.* Sans lui, le gabarit du
socle `${name}` : la clé de la configuration, que rien ne surcharge
(D1181). Le même mot nomme le dictionnaire de libellés du module —
`label:` dans module.yml — que le menu (le nom d'un sous-menu) et les
champs référencent par leur clé (D440, D1236). *(D217/D465, D1181,
D1236)*

**Lien n-aire** (`list of [a, b]`) — Un lien dont chaque élément combine
plusieurs entités nommées, et parfois une valeur typée ; chaque
combinaison est une cellule qui porte ses champs.
*Ex. : `list of [emplacement: stock.emplacement, article: technique.article]`.*
*(D402, D897–D898)*

**Liste (type)** (`list of`) — Un champ à plusieurs valeurs du même
type. *Ex. : `phones: list of phone`.* Sur un nom d'entité, elle
devient la composition. *(D166/D362)*

**Masque d'explication** — L'aide en ligne tissée dans l'application :
la documentation fonctionnelle de l'écran servie en place — la
description de la surface, puis, pour chaque champ qui en a, son
`hint:` et, au détail, sa `description:` ; un champ sans l'un ni l'autre
n'y est pas, son nom suffit ; la `description:` de tout composant
graphique — un kpi, un graphique, une section — y entre de même. Le
« ? » le montre, mène à la page de l'écran et porte l'assistance. À ne
pas confondre avec le masque de saisie. *(D209, D1190–D1193)*

**Masque de saisie** (`mask`) — Le gabarit d'une valeur au clavier :
`"C-999999"`, `"00 00 00"`, `"0.00 h"`. Il guide la saisie et fixe le
format. À ne pas confondre avec le masque d'explication. *(D260)*

**Matrice calculée** — Un hypercube porté par une formule plutôt que
par des données : la règle de contrôle du stock, emplacement × article
= la somme des entrées moins la somme des sorties des mouvements.
*(D1014)*

**Matrice de conversion** — Pour une mesure ou une durée, la table des
coefficients entre unités. Le type fournit les matrices standard ; chaque
champ a la sienne ; les données apportent des unités supplémentaires avec
leur coefficient ; la conversion suit le chemin, dans les deux sens.
*Ex. : la plaque d'un article vaut 12,5 kg.* *(D975–D983)*

**Menu** (`menu.yml`) — La carte des entrées d'un module, dans l'ordre
d'affichage. Chaque entrée porte son libellé par langue et son lien,
l'adresse d'une liste, d'un formulaire, d'une opération, d'un wizard ou
d'un tableau de bord ; un sous-menu porte ses entrées.
*Ex. : `link: banque.ecriture[pointage]`.* *(D351, D439, D1237)*

**Méta-schéma** — La description complète d'un modèle de données —
modules, entités, champs — **et la grammaire utilisée** pour les
écrire. Chaque version porte un méta-schéma. *(D322)*

**Migration** — Deux sens voisins. Le passage d'une version de
configuration à la suivante, sans arrêter l'application : la base, les
écrans et les API suivent *(D3)*. Et le nom du module interne
`_migration` et de l'artefact migration.md, qui portent la **reprise
des données** : la configuration dit « reprise » pour le geste, le
module s'appelle « migration » parce qu'il vaut pour toute migration
d'un système à Syncytium *(D1031, D1259)*.

**Mode d'un champ** (`mode`) — Son mode d'écriture : modifiable
(`editable`), lecture seule (`read-only`), écrit une fois pour toutes
(`write-once`). *(D364)*

**Mode public** (`visibility:`) — La page de présentation de
l'application, construite par défaut et diffusable sans aucun droit ;
`visibility: public | private | promotional` au projet — la
documentation en mode public, rien, ou la page de présentation seule.
*(D1150–D1151)*

**Application** (`application`) — Une application décrit le cadre d'exécution d'une instance. Elle fournit une solution à une question de gestion et/ou d'organisation d'entreprise (ERP, Gestion de stock, Gestion bancaire, ...).

**Module** (`module`, `module.yml`) — Une part de l'application : ses
entités, son menu, sa page d'accueil — la donnée et l'expérience
ensemble. Un module décrit une partie fonctionnelle d'une application (aussi appelée module fonctionnel) comme pour un ERP : la gestion ADV, le référentiel des produits, la gestion et la planification de la production, ...
*(D347/D416)*

**Module interne** (`_syncytium`, `_migration`, `_administration`,
`_assistance`, `_chat`) — Un
module servi par Syncytium, jamais déclaré par l'application ; son nom
commence par `_`, le préfixe des modules internes, et Syncytium refuse
ce premier caractère aux modules d'application. *(D1029)*

**Normalisation** (`normalize:`) — L'expression appliquée à une valeur à
la frontière, quand elle entre. *Ex. : `normalize: trim(me)`, les blancs
retirés.* *(D870, D872, D991)*

**Nul** (`null`) — L'absence de valeur, qui ne se confond pas avec la chaîne vide.
Stocké, il est légitime ; évalué dans une expression, c'est une anomalie, sauf
par le test `is null` ou la fonction `ifnull`. *Ex. : `date_vente is not null`.*
*(D303, D308, D310, D1551, D1573–D1574)*

**Opérateur** — Une fonction du type à l'écriture symbolique : les opérateurs
numériques (`+`, `*`, `**`…), les comparateurs (`=`, `<`, `in`, `is null`…) et
les opérateurs logiques (`not`, `and`, `xor`, `or`), chacun à sa priorité.
*(D577, D581–D582, D1571)*

**Opération ensembliste** — Une méthode qui combine deux collections du même
type : `union`, `intersect`, `except` — ce que l'une a et l'autre pas — et `xor`,
ce qui n'est que d'un seul côté. Le résultat retire ses doublons. À ne pas confondre
avec l'opération d'une entité. *Ex. : `lignes.article.except(depot.niveaux.article)`.*
*(D1575)*

**Opération** — Une action déclarée sur une entité, au-delà du
créer-modifier-supprimer : valider, envoyer, clôturer. Sous droits, et
déclencheur possible d'un changement d'état. *(D148)*

**Orphelin** — Un fichier de la configuration qu'aucune clé ne cite par
`~{…}`. Le traceur `tools/orphans.py` les liste. *(D956, D1240)*

**Paramètre** — Une valeur réglable et nommée, que les expressions lisent
par `context.settings.<nom>`. Il a un mode, statique ou dynamique —
surchargeable à chaud par l'administration —, un type et une valeur par
défaut. Les hooks décrivent les leurs dans leur contrat, le socle a les
siens ; un paramètre libre en forme courte est un texte statique.
*Ex. : `taux: { mode: dynamic, type: decimal, value: 20 }`.*
*(D588–D590, D1535)*

**Partie au point** — Une composante d'une valeur, atteinte par le
point : une fonction du type. *Ex. : `montant.currency`, `date.month`,
`adresse.latitude`, `fichier.size`.* *(D772–D773)*

**Partition** (`partition:`) — Le découpage physique de la table d'une
entité selon un ou plusieurs champs, par période pour une date.
*Ex. : `partition: date_comptable[year]`.* *(D1293, D1300)*

**Passage** — Une exécution d'une reprise de données (`migrate`) : la
lecture, les cinq phases de contrôle, la comparaison, la bascule ; sa
ligne d'exécution garde l'état, les compteurs et les indicateurs.
*(D667, D1033, D1054)*

**Parcours guidé** — Le tour généré des écrans, module par module dans
l'ordre du menu, depuis les descriptions et les aides ; fondu dans les
scénarios des personas, dont il est le squelette ; le tour complet reste
disponible à la demande de l'utilisateur, joué dans l'application.
*(documentation.md §19/§22, D258, D1187)*

**Persona** (`persona:`) — Un lecteur type, un par groupe
d'utilisateurs, dont les scénarios sont des fonctionnalités de bout en
bout, appuyés sur les wizards ; déclaré dans le groupe de `groups.yml`
— un prénom fictif, un rôle, et une description qui, à défaut, est
celle du groupe. *(D1127/D1130, D1200)*

**Plage** (`range of`) — Deux valeurs du même type, la première
inférieure ou égale à la seconde ; l'une peut manquer. La jauge est une
plage. *Ex. : `range of integer`.* *(D497–D498)*

**Planche** — Le mode opératoire imprimable : une page A4 paysage — le
titre, les étapes numérotées, une capture par étape, le contrôle
entouré ; la forme condensée d'un scénario de persona, une à trois
planches synthétiques qui montrent un enchaînement d'écrans et
d'actions, dessinées step par step depuis le wizard. *(D1129, D1188)*

**Possesseur** (`owner`) — L'enregistrement qui possède une
composition ; l'enfant l'atteint par `owner`. *Ex. : `owner.km_initial`.*
*(D760–D761)*

**Profil de confidentialité** — Une déclaration nommée, dans
`syncytium.yml`, sous `confidentiality:`, que les champs citent par
interpolation au lieu de répéter leur niveau.
*Ex. : `${confidentiality.financier}`.* *(D885, D1536)*

**Promotion** — Le passage d'un enregistrement au niveau suivant de sa
hiérarchie d'héritage, son identité gardée : le tiers devient client à sa
première commande. Voir État hiérarchique. *(D145, D355)*

**Propriété** — Une clé portée par un élément de la configuration, qui
en règle un aspect : `type:`, `label:`, `required:`, `formula:` sur un
champ ; `identity:`, `history:` sur une entité. *(D364, D391)*

**Provenance** — La carte d'identité d'origine d'une donnée reprise :
de quel système, quand, sous quelle clé. Un fait qui ne bouge plus.
*(D178)*

**Scénario d'utilisation** (`scenarios:`) — Une fonctionnalité de bout
en bout vécue par un persona : un but, une fréquence, des étapes,
chacune reliée à un écran ou à une opération par un lien vers son
adresse, paramétrée au besoin (filtrer une liste, affecter des valeurs)
; généré depuis un wizard, ou écrit par le concepteur dans
`documentation.yml` de la version — un nom, un `title:` et une
`description:` qui référence son Markdown, par langue. Trois formes :
lue (le chapitre), vécue (le wizard), imprimée (la planche).
*Ex. : `scenarios: { foyer: { virement: { title: Faire un virement,
description: ~{…/virement.md} } } }`.* *(D1127/D1130, D1201–D1205)*

**Rétention des fichiers** (`cleanup.yml`) — Les règles qui
suppriment, dans un dossier, les fichiers d'un pattern au-delà d'une
durée ou d'un nombre : le journal, les watchers, le détail des
migrations. *(D1070–D1076)*

**Purge** — L'effacement réel d'un enregistrement, le droit du RGPD,
distinct de l'inactivation ; un acte de l'administrateur. *(D137)*

**Rapport des non-conformités** (`report`) — La liste de ce qui ne
respecte plus une règle de lien — le filtre a changé, la donnée a
dérivé. Produit à la demande, à la migration ou en continu, adressé à
qui de droit. Ce rapport permet également de couvrir les modifications directes à la base de données par un outil tiers sans passer par Syncytiium. *(D395/D406)*

**Réactivation** — Le retour d'un enregistrement inactif parmi les
actifs : un acte exceptionnel de l'administrateur, sous contrôle de
collision des clés. *(D140, D903)*

**Recherche** (`searchable`) — La manière dont un champ se cherche :
exacte (`strict`), tolérante aux accents (`normalized`), aux fautes de
frappe (`similarity[0.8]`), par plage (`range`) — ou pas du tout
(l'absence). *(D367/D371)*

**Recherche mutualisée** (`mutualizable[nom]`) — Une boîte de recherche
partagée par plusieurs champs : on y tape une fois, elle cherche
partout où elle est branchée. *Ex. : `searchable: mutualizable[who]`
sur le nom et le prénom.* *(D367)*

**Réglage** (`settings.yml`, `settings:`) — Toute valeur ou tout statut
par défaut de Syncytium se surcharge dans les settings — les types et
leurs défauts, `normalize:`, `reset:`, les profils, `history:`… — en
cascade : la version, le module, l'entité, le champ ; le plus proche
l'emporte. *(D359/D1175)*

**Référence** — Lien vers un
enregistrement d'une autre entité. Celui qui pointe porte le champ ;
celui qui est pointé y accède en retour, sans rien déclarer (notion de parent-enfant). 
Le parent déclare le lien vers l'enregistrement d'une autre entité pour marquer un lien fort.
Dans Syncytium, la navigation entre le parent et l'enfant est conservée et permet depuis l'enfant d'accéder à son ou ses parents sans déclaration complémentaire.
*Ex. : `advisor: hr.employee`.* *(D394/D396)*

**Référence de fichier** (`~{…}`) — L'écriture qui cite un fichier, ou
un pattern de fichiers, à la place d'une valeur.
*Ex. : `fields: ~{fields.yml}`.* *(D956)*

**Référence nommée** (`TABLE[NOM].colonne`) — À la source d'une
migration, quand la même entité est référencée plusieurs fois, le nom
entre crochets lie les colonnes d'une même référence ; la référence
unique garde la forme `TABLE.colonne` ; `A.colonne or B.colonne` vise
l'une de deux entités, la première qui correspond. *Ex. :
`NOKTCODPF: ARTICLE[PRODUIT].ARKTCODART`.* *(D995–D996)*

**Release-notes** (`release-notes:`) — Le cadre des évolutions
apportées par une version, porté par `version.yml`. L'historique
complet s'assemble par concaténation des release-notes des versions
antérieures jusqu'à la courante — pas de fichier unique à maintenir.
*(D808)*

**Réplication** (`replication:`) — La copie des données de la production
active vers la passive ; `differential` ne transmet que les écarts.
*(D724–D725, D1534)*

**Reprise des données** — Le chargement, dans Syncytium, des données
d'un système précédent : les sources lues ou ignorées, leurs colonnes,
les règles et leurs destinataires, le refusé non enregistré, la table
des associations ; décrite dans `reprise.yml`, portée par le module
interne `_migration` — d'où la proximité avec **migration**. Le
chapitre 4 du dictionnaire de la donnée en porte le nom.
*(D1030–D1080, D1259)*

**Ressources** (`resources/`) — Le dossier des images de la
description : logos, icônes, fonds. Une ressource peut être également un fichier binaire, word, excel, ... En fait, cela représente tout fichier complémentaire utile au bon fonctionnement du projet (Ex : cas de fichiers modèles pour PDF, Word, Excel, ...).
Le dossier est **versionné** — il vit dans la version, déclaré par
`version.yml` (« un jeu d'icônes, des templates de fichiers…
dépendent de la version d'exécution »). La fiche d'une ressource :
`name`, `description`, `file`, `credit:` — le crédit des éléments
tiers, par courtoisie.
*(D346, amendé par D803)*

**Restauration** — Le retour d'un enregistrement à un instantané de son
historique : par l'administrateur seul, sous condition, tracée ; elle est
elle-même une modification, historisée. *(D171)*

**Sévérité** (`severity:`) — Ce que fait une validation en échec :
`error`, le défaut, bloque ; `confirm` demande une confirmation, tracée ;
`info` signale sans bloquer. *(D157, D1559)*

**Select** (`.select(…)`) — La table de correspondance en ligne : la valeur
porte son `select`, qui nomme ses cas ; le cas `"..."` prend toutes les autres
valeurs, et sans lui une valeur hors des cas est rejetée. Sur un énuméré, les
cas doivent être complets. *Ex. : `type.select(thermique: "litres", electrique: "kWh")`.*
*(D584, D1002, D1569)*

**Signature d'un type** — Ce que le langage peut faire des valeurs d'un
type : sa conversion, ses opérateurs, ses comparateurs, son `select`, ses
fonctions. *(D579–D584)*

**Socle** — Ce que Syncytium fournit sans que le concepteur l'écrive :
le moteur, ses types, ses composants, ses hooks, ses modules internes, ses
défauts. *(D1175)*

**Storage** (`storage`, une famille de connecteurs) — Le lien entre
les données manipulées par Syncytium, leur manipulation, son
optimisation et le stockage physique. Il traite l'unitaire et la masse ;
son traitement est bijectif, standardisé, harmonisé, extensible par le
format pivot — les types élémentaires, dans lesquels tout type
Syncytium se décline (D1298). Il s'auto-décrit : ses règles de transcription des types vers la base ou
la zone de stockage, rendues par son `describe(model)` — les tables,
les colonnes, les clés, les index, les partitions ; `get_instance()`
lit la base et rend un modèle à l'image du méta-modèle (D1299). Il influe sur le hook de
type, à qui il dit ce qu'il attend. La classe `memory` tient la base en mémoire seule — la base miroir
d'une reprise, ou l'application de démonstration, avec un ratio
d'espace, rien sur le disque. *(D629, D680–D684, D1045, D1294–D1297,
D1507–D1508)*

**Style** — Le cadre technique du rendu, fourni par Syncytium (« au
même titre que les composants graphiques, Syncytium propose un ou
plusieurs styles ») ou apporté par un hook de style — la sixième
famille. Porté par le langage de Syncytium ; pour le Web, la
représentation HTML des types (le hook d'affichage) est complétée
par un CSS3 — la structure d'un côté, la présentation de l'autre.
La structure des styles ne se généralise pas forcément.
*(D752, D754–D755)*

**Surface** ou Facette d'une entité ou composant graphique élaboré pour une entité — Un écran généré et nommé : la liste, le formulaire, le
widget de résumé, le widget de synthèse. *(Q48)*

**Table des clés d'origine** — Ce que le module `_migration` garde de
chaque ligne d'une source : sa clé, sa partition, un hash, le statut
de son dernier traitement — jamais la clé de destination. *(D1047–D1050)*

**Tableau de bord** (`dashboards:`) — Un écran de synthèse d'un module,
ses widgets et ses graphiques, que le menu adresse ; le concepteur le
compose, l'utilisateur peut avoir le sien. *Ex. : `link: banque[accueil]`.*
*(D439, D554)*

**Technicien** — Le consommateur des API, dans une partie tierce
(D334) : un compte technique (D28), qui lit la documentation du
développeur aux versions publiées. *(D1148 — le rôle s'appelait
« technicien tiers » ; celui qui écrit la description est le
concepteur.)*

**Télémétrie** — Tous compteurs, journaux ou rapports visant à assurer la stabilité du projet (fonctionnement, migration, sécurité, ...) et à apporter des conseils sur des optimisations à apporter tant en termes de développement interne qu'en usage pour les applications tierces. *(D38)*

**Traitement (RGPD)** — Une opération ou une suite d'opérations —
un wizard, une action, un déclencheur — impliquant au moins un champ
`rgpd:`. L'entité qui porte le champ décrit le stockage de la donnée ;
le module qui porte une telle entité est soumis au RGPD ;
l'anonymisation et le nettoyage sont des traitements d'appui, tenus
par leur fréquence et leur règle. Le registre des traitements en fait
une ligne par traitement, avec son bloc `rgpd:` — le responsable
(`controller`, un groupe d'utilisateurs), la base légale (`legal`, à
valeurs fermées), la finalité (`purpose`) —, « non précisé » quand une propriété manque ; un projet sans champ
`rgpd:` n'est pas une anomalie, Syncytium ne décide pas de ce qui est
réglementaire. *(D1317–D1322)*

**Tri** (`sort`) — L'ordre naturel d'un type — alphabétique, numérique,
chronologique — réglable là où plusieurs ordres se défendent.
*Ex. : `sort: natural` — item2 avant item10.* *(D125/D380)*

**Thème** (`themes/`, `themes.yml`) — Une combinaison de styles,
assemblée et surchargée : la marque (la société, le logo —
`resources/`), les couleurs, les fontes. L'application en propose
plusieurs ; **l'utilisateur choisit le sien via son profil** (comme
sa langue) ; le thème est **un objet comme les autres, avec les
droits** (la confidentialité — le choix n'offre que le visible). Le
premier déclaré est le défaut.
*Ex. : `themes: [classic, dark, durand]`.* *(D63, D752–D755)*

**Type** (`type`) — Le contrat d'un champ : ce qu'il accepte, comment
il se stocke, s'affiche et se cherche. Le nom suffit — un type du
catalogue (simple, référence ou composé - hook inclus) ou un type personnalisé (ensemble de propriétés communes à plusieurs champs).
*(D408)*

**Type élémentaire** (le format pivot) — Un des composants
élémentaires du stockage : booléen, entier, long, décimal, texte… avec
ses propriétés génériques (la longueur d'un texte, les bornes d'un
entier). Tout type Syncytium se décline en un type élémentaire ou en
une liste nommée de types élémentaires ; le storage ne convertit que
ceux-là, ce qui fait l'extensibilité du modèle. *(D1298)*

**Type personnalisé** — Description commune d'un type et de ses propriétés tel qu'il puisse être réutilisable sur plusieurs champs de l'application.
Il porte aussi les facettes de sens — `rgpd:`, la confidentialité — dont
ses champs héritent (D1178), et chaque type de l'application a son entrée
au glossaire de la documentation générée : le vocabulaire du métier
(D1179).
*Ex. : `progression` = `integer[0..100]` + la jauge « fuel » →
`avancement: progression` ; `nom: { type: text[..40], rgpd: personal }` →
`nom: nom`.* *(D359, D1178–D1179)*

**Type court** — L'écriture minimale d'un champ : le type seul, tout au défaut.
*Ex. : `notes: text` ; `customer: customer`.* *(D356)*

**UUID** (`uuid`) — Identifiant universel unique. Le type sert les
identifiants venus de systèmes tiers ; l'identité technique interne,
elle, n'est jamais déclarée dans la configuration.
*Ex. : `external_id: uuid`.* *(D419)*

**Validation** (`validation`) — Les règles de refus : sur le champ (sa
valeur) ou sur l'entité (la cohérence de l'enregistrement). Toute règle
enfreinte refuse et trace. *Ex. : `- end_date >= start_date`.*
*(D364/D404)*

**Version (de description)** — Identifiant numérique décrivant la version de la configuration d'une application (x.y.z.w).
Les nombres permettent de trier par ordre croissant les différentes versions d'une application.
Chaque version peut avoir l'un des 4 statuts : bêta, production, dépréciée, interdite.
Le fait de déposer une version, nous considérons que la version est publiée. *(D324/D340)*
Dans la configuration, chaque version fera l'objet d'une entrée et cette entrée est un sous-dossier de l'application. Chaque sous-dossier reprend alors tous les éléments nécessaires au bon fonctionnement de l'application.
*Ex. : `2.1.0.14.yml` → `2.1.0.14/`.* *(D322)*

**Visages de l'entité** (`label`, `image`) — La manière dont un
enregistrement se présente : son visage texte (le gabarit `label:`) et
son image, servis partout — de la liste déroulante au widget ; `title:`
est, lui, le nom d'usage de l'entité par langue (D1120).
*Ex. : `label: "{code} — {company_name}"` ; `image: logo`.*
*(D397/D386/D465, D803, D1120)*

**Vue dérivée** (`association with … if …`) — Une liste calculée par
une condition, jamais stockée : on la lit ; pour la changer, on change
la donnée qui la fonde.
*Ex. : `orders: association with order if order.customer = me` — les
commandes de ce client.* *(D405)*

**Widget** — Une tuile d'information. Trois espèces : le widget
d'accueil (sur la page d'accueil), le widget de résumé (au survol d'une
référence), le widget de synthèse (graphiques et indicateurs).
*(D185/D191/D247)*

**Wizard** — Le parcours guidé : des étapes, des transitions, une
transaction à la sortie. *(D230)*

