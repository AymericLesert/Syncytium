# Glossaire

Cette section décrit les mots clés utilisés dans le projet Syncytium. Nous distinguons dans le projet les termes français utilisés pour la communication et les termes anglais (universels) pour la configuration et la traduction technique des concepts abordés.

---

**Agrégat** — Un enregistrement « racine » et tout ce qu'il possède,
pris comme un tout indivisible. Une commande et ses lignes s'enregistrent,
s'historisent et disparaissent ensemble. *(D101)*

**Anonymisation** — L'effacement des données personnelles d'un
enregistrement, qui garde son squelette : les liens et l'historique
tiennent, le contenu s'efface. *(D139)*

**Association** (`association with`) — Le lien souple entre
enregistrements, sans possession : chacun vit sa vie.
*Ex. : `tags: association with catalog.tag`.* *(D400)*

**Audience** — Le public d'une donnée : l'interne (les collaborateurs)
ou l'externe (les clients, par un portail). *(D70)*

**Champ** (`field`, le bloc `fields:`) — La plus petite donnée d'une
entité. Elle se caractérise par : un nom, un type, des propriétés.
*Ex. : `company_name: text[80]` — la raison sociale, 80 caractères au
plus.* *(D118)*

**Champ calculé** (`computed`) — Un champ dont la valeur est déduite par une opération. Par nature, cette information n'est pas modifiable par un utilisateur. Elle se rafraîchit en fonction des évolutions de valeurs de champs dont il dépend.
*Ex. : `total_orders: { computed: count(orders) }`.* *(D90)*

**Clé fonctionnelle** (`identity`) — Identifie un enregistrement
aux yeux du métier de façon unique : un code client, un numéro de facture. Elle peut
changer un jour ; l'identité technique, elle, jamais.
*Ex. : `identity: [code]`.* *(D142/D357)*

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

**Confidentialité** (`confidentiality`) — Le niveau d'exposition d'une
donnée : `public` (partout), `protected` (l'interface et les tâches),
`private` (les tâches seulement) — resserrable par groupes. *(D25)*

**Connecteur** — Une passerelle entre Syncytium et un système tiers. Le connecteur peut être utilisé dans les 2 sens : en lecture/écriture selon les spécificités techniques implémentées. *(D79)*

**Crochet** (`type[paramètre]`) — La convention d'écriture qui glisse
un paramètre dans un nom : `text[3..10]`, `time[hh:mm]`,
`counter[accounting]`. *(D366)*

**Configuration** — Tout ce que le technicien écrit : l'ensemble des
fichiers YAML qui décrivent l'application. Syncytium la lit, la
vérifie, puis la fait vivre. *(D336)*

**Description** ((`comment`, `label`, `description`) — Information plus ou moins complète permettant d'apporter du contexte à un élément du modèle de données. La description couvre plusieurs fonctions : aide à la saisie, une infobulle, une description courte pour comprendre la nature de l'information, une description détaillée pour construire une aide ou un masque d'aide. La description permet également à des outils tiers (comme l'IA) de s'interfacer ou de proposer des constructions de modèles ou de rapports adaptés à un usage.
*Ex. : `comment: { fr: Le code se génère à la création }`.*
*(D364)*

**Exécution à blanc** (Dry-run) — La répétition générale afin de valider la conformité d'une nouvelle version du modèle. Cela ouvre droit à un rapport sur les non-repects ou les impossibilités liés à la migration. Le but est de garantir la stabilité du système et sa continuité de service. *(D120)*

**Entité** (`entity`) — Un objet du métier ou une table dans un modèle relationnel : le
client, la commande, le produit. Chaque entité a ses
champs, ses règles, sa représentation, ... *(D347)*

**Environnement** (`environments/`) — Un cadre d'exécution hermétique : le staging
(l'essai), la production active (le quotidien), la passive (le
secours). Chacun a ses connecteurs et ses journaux. Un environnement vise à tester de nouveaux concepts, évolutions ou corrections d'anomalie sans impacter les autres environnements. Cela suit une règle bien définie (Staging avec Production). Ici, la production active/passive permet de synchroniser les informations entre les 2 environnements afin de faciliter en cas d'interruption de l'infrastructure sur l'un, une bascule quasi-automatique sur l'autre. *(D342)*

**Facette** — Un des modes de représentations d'un type de données : la logique (la valeur
vraie), le stockage physique, l'affichage, la forme d'API ou la nature du champ CSV. *(D119)*

**Groupe d'utilisateurs** (`group`, `groups.yml`) — Un ensemble nommé de personnes,
brique des droits : la confidentialité, la visibilité d'un historique,
les destinataires d'un rapport. Un groupe peut en contenir d'autres. Syncytium ne gère pas dans sa configuration les liens directs avec les utilisateurs. Syncytium manipule dans sa configuration des groupes. Les utilisateurs sont associés par un technicien ou par une passerelle avec un système d'authentification.
*Ex. : `managers: { groups: [accounting, sales_team] }`.* *(D26/D414)*

**Historisation** (`history`) — La mémoire d'une entité : chaque
modification photographie l'agrégat entier. On en règle la profondeur :
tout (`perpetual`), une période (`temporal[365]`), les dernières
modifications (`update[10]`), rien (`false`). *(D168/D411)*

**Hook** — Le prolongement par code : un type, un composant graphique ou une
fonction sur mesure, écrits contre le contrat de Syncytium. Le hook rend transparent l'usage de développements spécifiques à un projet. De façon homogène, Syncytium fournit un cadre d'exécution et pour ne pas à avoir à tout recréer, Syncytium fournit déjà un ensemble de Hooks.Les types de champ, les composants graphiques, les écrans de saisie, les formats CSV ou Excel fournis avec Syncytium sont des hooks. *(D52/D408)*

**Horodatage** (`datetime[timestamp]`) — Un instant absolu, stocké en
temps universel et affiché à l'heure de chacun. S'oppose à la valeur
**brute**, qui reste ce qu'on a écrit — une échéance au 1ᵉʳ juillet
reste au 1ᵉʳ juillet. *(D220)*

**Identité technique** — Le matricule interne et invisible d'un
enregistrement (un UUID), qui ne change jamais — même renommé, même
anonymisé. C'est lui que les références retiennent. *(D142)*

**Instance** — L'installation d'un client. Elle regroupe tous les éléments nécessaires au fonctionnement de l'application : son moteur, ses environnements, sa base, sa
description. Une par TPE. *(D16)*

**Instantané** — La photographie complète d'un agrégat à une date,
rangée dans l'historique. On la consulte, on ne la modifie pas.
*(D169)*

**Langage d'expression** — La langue unique des formules : calculs,
validations, filtres, gabarits.
*Ex. : `sum(lines.amount if quantity > 0)`.* *(D90/D301)*

**Libellé** (`labels`) — Le nom d'une chose dans la langue de
l'utilisateur. *Ex. : `labels: { fr: Client }`.* *(D217)*

**Liste (type)** (`list of`) — Un champ à plusieurs valeurs du même
type. *Ex. : `phones: list of phone`.* Sur un nom d'entité, elle
devient la composition. *(D166/D362)*

**Masque d'explication** — L'aide en ligne tissée dans l'application,
nourrie par les `description:` du modèle. À ne pas confondre avec le
masque de saisie. *(D209)*

**Masque de saisie** (`mask`) — Le gabarit d'une valeur au clavier :
`"C-999999"`, `"00 00 00"`, `"0.00 h"`. Il guide la saisie et fixe le
format. À ne pas confondre avec le masque d'explication. *(D260)*

**Méta-schéma** — La description complète d'un modèle de données : modules, entités et champs. Chaque version porte un méta-schéma. *(D322)*

**Migration** — Le passage d'une version de configuration à la suivante,
sans arrêter l'application : la base, les écrans et les API suivent.
*(D3)*

**Mode d'un champ** (`mode`) — Son mode d'écriture : modifiable
(`editable`), lecture seule (`read-only`), écrit une fois pour toutes
(`write-once`). *(D364)*

**Application** (`application`) — Une application décrit le cadre d'exécution d'une instance. Elle fournit une solution à une question de gestion et/ou d'organisation d'entreprise (ERP, Gestion de stock, Gestion bancaire, ...).

**Module** (`module`, `module.yml`) — Une part de l'application : ses
entités, son menu, sa page d'accueil — la donnée et l'expérience
ensemble. Un module décrit une partie fonctionnelle d'une application (aussi appelée module fonctionnel).
*(D347/D416)*

**Opération** — Une action déclarée sur une entité, au-delà du
créer-modifier-supprimer : valider, envoyer, clôturer. Sous droits, et
déclencheur possible d'un changement d'état. *(D148)*

**Provenance** — La carte d'identité d'origine d'une donnée reprise :
de quel système, quand, sous quelle clé. Un fait qui ne bouge plus.
*(D178)*

**Rapport des non-conformes** (`report`) — La liste de ce qui ne
respecte plus une règle de lien — le filtre a changé, la donnée a
dérivé. Produit à la demande, à la migration ou en continu, adressé à
qui de droit. Ce rapport permet également de couvrir les modifications directes à la base de données par un outil tiers sans passer par Syncytiium. *(D395/D406)*

**Recherche** (`searchable`) — La manière dont un champ se cherche :
exacte (`strict`), tolérante aux accents (`normalized`), aux fautes de
frappe (`similarity[0.8]`), par plage (`range`) — ou pas du tout
(l'absence). *(D367/D371)*

**Recherche mutualisée** (`mutualizable[nom]`) — Une boîte de recherche
partagée par plusieurs champs : on y tape une fois, elle cherche
partout où elle est branchée. *Ex. : `searchable: mutualizable[who]`
sur le nom et le prénom.* *(D367)*

**Référence** — Lien vers un
enregistrement d'une autre entité. Celui qui pointe porte le champ ;
celui qui est pointé y accède en retour, sans rien déclarer (notion de parent-enfant). 
Le parent déclare le lien vers l'enregistrement d'une autre entité pour marquer un lien fort.
Dans Syncytium, la navigation entre le parent et l'enfant est conservée et permet depuis l'enfant d'accéder à son ou ses parents sans déclaration complémentaire.
*Ex. : `advisor: hr.employee`.* *(D394/D396)*

**Ressources** (`resources/`) — Le dossier des images de la
description : logos, icônes, fonds — partagés par toutes les versions. Une ressource peut être également un fichier binaire, word, excel, ... En fait, cela représente tout fichier complémentaire utile au bon fonctionnement du projet (Ex : cas de fichiers modèles pour PDF, Word, Excel, ...)
*(D346)*

**Settings** (`settings.yml`, le bloc `settings:`) — Les réglages d'un
étage (la version, le module, l'entité), diffusés en cascade à ce qu'il
contient : le plus proche l'emporte. *(D348/D360)*

**Surface** — Un écran généré et nommé : la liste, le formulaire, le
widget de résumé, le widget de synthèse. *(Q48)*

**Technicien** — Celui qui écrit la description. Un rôle, pas un
métier : une à plusieurs personnes le portent. *(D95)*

**Télémétrie** — Les compteurs d'usage de l'application : ce qui sert,
ce qui dort. Elle éclaire les migrations, la sécurité et le conseil.
*(D38)*

**Tri** (`sort`) — L'ordre naturel d'un type — alphabétique, numérique,
chronologique — réglable là où plusieurs ordres se défendent.
*Ex. : `sort: natural` — item2 avant item10.* *(D125/D380)*

**Type** (`type`) — Le contrat d'un champ : ce qu'il accepte, comment
il se stocke, s'affiche et se cherche. Le nom suffit — un type du
catalogue, un type personnalisé, une entité (la référence) ou un hook.
*(D408)*

**Type personnalisé** — Un type défini dans les settings à partir d'un
autre : un paquet de défauts réutilisable.
*Ex. : `progression` = `integer[0..100]` + la jauge « fuel » →
`avancement: progression`.* *(D359)*

**Forme courte** — L'écriture minimale d'un champ : le type seul, tout
au défaut. *Ex. : `notes: text` ; `customer: customer`.* *(D356)*


**Valeur de démonstration** (`placeholder`) — L'exemple affiché dans un
champ vide ; pour une image, l'icône de fond. *(D364/D390)*

**Validation** (`validation`) — Les règles de refus : sur le champ (sa
valeur) ou sur l'entité (la cohérence de l'enregistrement). Toute règle
enfreinte refuse et trace. *Ex. : `- end_date >= start_date`.*
*(D364/D404)*

**Entrée de version** — Le fichier qui ouvre une version : il annonce
le format utilisé et pointe le dossier du détail.
*Ex. : `2.1.0.14.yml` → `2.1.0.14/`.* *(D322)*

**Version (de description)** — Un état publié du modèle : quatre
nombres croissants, un dossier par statut (bêta, production, dépréciée,
interdite). Déposer, c'est publier. *(D324/D340)*

**Visages de l'entité** (`label`, `image`) — La manière dont un
enregistrement se présente : son libellé et son image, servis partout —
de la liste déroulante au widget.
*Ex. : `label: "{code} — {company_name}"` ; `image: logo`.*
*(D397/D386)*

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

A reprendre et à décrire :

**Ingestion** — L'entrée d'une description dans le moteur : lecture,
vérifications, conversion. Toute incohérence s'arrête là, franchement.
*(D330)*

