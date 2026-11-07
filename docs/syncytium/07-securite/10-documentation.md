# Ce que les droits et la sécurité livrent à la documentation

La documentation est une facette des composants (D1158, D1159). Deux
parties, les droits puis la sécurité, chacune par documentation (D1819).

Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md). Le texte vient des deux artefacts
préparatoires, déplacé à la réorganisation ; la réécriture suit.

## Le sommaire

- [Les droits](#les-droits)
- [La sécurité](#la-sécurité)

## Les droits

*(La rubrique de la matrice de [documentation.md](../../documentation.md)
§13 ; la colonne 1 — la fonctionnelle — remplie, les autres à leur
rang.)*

**Le principe** : on ne lit que ce qu'on voit (D1141, D334) — la
confidentialité et les droits filtrent la documentation comme ils
filtrent l'écran ; une entité invisible n'a ni section ni ligne ; un
champ invisible n'est pas au dictionnaire du lecteur — dans la
fonctionnelle ; **au dictionnaire de la donnée, le modèle est intégral et
le niveau de confidentialité affiché** (D1247), seules les données de
l'instance suivent les droits du lecteur (D1249).

**Le groupe, dans la fonctionnelle** — **son persona** (D1200, D1208 :
le mono-poste déclare son groupe pour le porter) ouvre le chapitre des
scénarios : qui il est (le prénom, le rôle, sa description ou celle du
groupe), **ce qu'il voit** — ses modules et ses entrées de menu, ses
droits en clair, le « mes droits » servi dedans (D1206, D1220) —, ses
scénarios ; le groupe contenant (D1099) renvoie à ses constituants ; le
groupe au degré `administrator` a son persona, ses scénarios
d'administration vont au guide d'exploitation (D1206). Un groupe sans
`persona:` a un persona généré, nommé par le groupe, que la complétude
compte.

**Les permis** — par état, les verbes et **le libellé des groupes que
l'`allow` cite** (D1227), dans la table du cycle de vie de l'entité ;
l'`allow` d'un champ (D886) se lit au champ.

**Les degrés** : le `reader` lit la documentation sans le détail
(D1140) ; `manager` et `administrator` préparent une édition et
décident de la diffuser (D1142). **Les lecteurs** de chaque
documentation : la table de [documentation.md](../../documentation.md) §3
(D1154).

**Les groupes et les droits, dans le dictionnaire de la donnée** (la
colonne 2 — le rang 2) : **le chapitre 5.2, la matrice des droits**
(D1264 — « la visibilité est simple et rapide ») — les entités en
lignes, les groupes en colonnes, les quatre actes et les opérations
permises dans la case, la condition d'état quand il y en a une
(D1172) ; la composition des groupes (D1099), le degré (D699) ; les
profils de confidentialité lus comme « qui voit » chaque niveau. **Le
modèle est intégral pour tous, le niveau de confidentialité affiché à
chaque champ** (D1247) ; **les données de l'instance suivent les droits
du lecteur** (D1249). Les personas n'y sont pas — le dictionnaire est centré sur la donnée
(D1241).

**Les groupes et les droits, dans la réglementation** (la colonne 5 — le
rang 3) : **le responsable du traitement est un groupe** —
`controller:` dans le bloc `rgpd:` (D1320) — ; **qui peut déclencher**
chaque traitement reste l'`allow:` et le degré, que le registre montre à
côté du responsable (D1327) ; **les destinataires internes**, les
groupes qui lisent, par la confidentialité ; **`rgpd.extract`** au
plancher `manager`, **`rgpd.anonymize`** au plancher `administrator`
(D1331, D1333) ; la limitation par l'`allow:` d'un état (D1172).

**Les groupes et les droits, dans le projet et le support** (la colonne
8 — le rang 4) : **les trois groupes du bloc `assistance:`** — qui
traite une anomalie, qui répond à une question, qui enregistre une
évolution (D1372) ; le gestionnaire se prend dans le groupe (D1369) ;
sans bloc, le `manager` et l'`administrator` (D1377) ; **les degrés de
lecture** — la page des versions, le dépôt, le texte du support et
« qui répond à quoi » à tous, `reader` compris, les indicateurs à partir
de `manager` (D1347, D1377) ; un ticket se lit par son auteur et par le
groupe, une question close par tous, dans sa langue (D1373, D1381).

**Les groupes et les droits, dans la documentation du développeur** (la
colonne 3 — le rang 5) : **le filtre du contrat** — un compte technique
ne voit que ce que ses groupes et l'exposition lui permettent, rien en
négatif, l'astérisque excepté (D1394–D1395) ; **« pour le compte de »**,
l'intersection des droits (D1396) ; l'édition produite pour un compte
(D1400) ; le concepteur voit tout l'inventaire (D1404) ; un projet
`private` montre la référence (D1411).

**Les groupes et les droits, dans le D.A.T.** (la colonne 4 — le rang
6) : **ses lecteurs** — l'administrateur, le concepteur, l'hébergeur
sans les secrets (D1154) ; **l'authentification** comme connecteur du
schéma, le fournisseur d'identité et le compte qu'il attend (D1426,
D1428) ; rien des droits d'accès, qui sont à la documentation des
droits.

**Les groupes et les droits, dans le guide d'exploitation** (la colonne
9 — le rang 7) : **le lecteur** — l'administrateur, l'hébergeur sans
les secrets, l'équipe technique, le concepteur ou une société tierce
(D1154, D1456) ; **le degré requis par chaque fiche**, `administrator`
sauf la promotion, le geste du concepteur ; les comptes et les
affectations (D341) ; **le mode safe** et son compte principal, le mot
de passe fixé à l'installation, inaccessible dès qu'un administrateur
existe (D718, D1459).

**Les droits, dans la maintenance, les risques et les améliorations** (la
colonne 7 — le rang 8) : **les risques** — les refus de droits
journalisés et les pics (D43), les tentatives refusées ; **les
lecteurs** des trois chapitres (D1493) — les usages et les risques à
partir de `manager`, la vision métier ; les améliorations à
`administrator`, la configuration — et, dans la page d'un composant,
chacun voit l'usage de ce qu'il voit (D1489).

**Les droits, dans la promotionnelle** (la colonne 6 — le rang 9) : **le
mode public** — `visibility:` tranchée (D1151, D1498) : `promotional`
la plaquette seule sans compte, `public` toute la documentation en mode
public sans donnée ni rien de confidentiel, `private` rien sans
compte ; dedans, la plaquette se lit à tout degré, `reader` compris, la
première page de la documentation (D1498) ; les comptes de
démonstration, un par persona dans son groupe, éphémères (D1505) ; le
compte éphémère de la démonstration de Syncytium (D1509).

**Les neuf colonnes sont écrites.**

## La sécurité

*(La rubrique de la matrice de [documentation.md](../../documentation.md)
§13 ; la colonne 5 — la réglementation — remplie au rang 3, D1317–D1344 ;
les autres à leur rang.)*

**La sécurité, dans la réglementation** (la documentation 5, §18) :
**le registre des traitements** — une ligne par traitement, une
opération ou une suite impliquant un champ `rgpd:` (D1317–D1318,
D1329), groupé par module soumis (D1321), avec le bloc `rgpd:` résolu à
quatre niveaux — `controller`, `legal`, `purpose`, `contact`, `dpo`
(D1322–D1327), « non précisé » quand une propriété manque — ; l'entité
dit le stockage, la rétention vient du nettoyage et de l'anonymisation
(D1328, D1334), les lieux des `countries:` du connecteur (D1345) ; **les droits des
personnes** — `rgpd.extract(identity)` depuis les champs `identity`,
`rgpd.anonymize`, la limitation par l'état (D1330–D1333) ; **les
mentions** — `rgpd.notice` générée, ancrée par le concepteur, le manque
notifié sinon (D1335) ; **la journalisation des accès** — l'audité, le
journalisé, qui consulte, la rétention de l'audit (D1336) ; **le
chapitre de la sécurité** — une section par ligne de la carte du
chapitre 7, recalculée après le recentrage (D1819 ; « les douze » de
D1338), chacune en trois paragraphes, le socle, la configuration,
l'instance, un sommaire d'état en tête (D1337–D1338) : les dépendances
(D924), le code tiers (D918), les secrets par leur nom (D944) ; aucun
verdict (D1319) ; **l'accessibilité** — les critères du RGAA testés à
l'ingestion, par critère et par composant, `accessibility:` au projet
(D1339–D1341) ; **les obligations du secteur** — `regulation:` à
l'entité ou au module (D1342).

**La sécurité, dans le projet et le support** (la colonne 8 — le rang
4) : **l'adresse du dépôt** ne se montre que si elle est publique
(D1359) ; **les tickets ne quittent pas l'application** (D1378) —
l'auteur, le gestionnaire, les messages restent dedans, la F.A.Q. ne
porte que la paire ; **la documentation entière est portée par
l'application** (D1348), sous ses droits.

**La sécurité, dans la documentation du développeur** (la colonne 3 —
le rang 5) : **le porteur seul**, jamais le cookie (D917) ; la clé
rotative, le « pour le compte de », OAuth2 en déclinaison (D107) ;
aucune valeur de secret dans le contrat, la console saisit la clé et ne
la stocke pas (D1398) ; le code d'un hook par son existence et son
emplacement, jamais son contenu (D1406) ; l'appel lancé depuis la
console est réel, journalisé, confirmé en écriture (D1398) ; les
webhooks entrants authentifiés d'office (D642) ; les origines et HTTPS
au D.A.T. (D918, D919).

**La veille des vulnérabilités** (D924, D1431) : hors du moteur — au
dépôt du source, par son outillage ; le projet publie par core un
fichier d'avis de sécurité signé, que l'instance lit sur autorisation de
l'administrateur, désactivée par défaut, et compare à son core et aux
bibliothèques déclarées par ses hooks ; la nomenclature logicielle en
édition machine ; la mise à jour reste la migration technique sur
sollicitation (D17). Le D.A.T. (documentation.md §28) et la maintenance
(§23) en portent l'affichage.

**La sécurité, dans le D.A.T.** (la colonne 4 — le rang 6) : **les
secrets** par leur nom, jamais leur valeur (D944), chiffrés par le
wizard (D902) ; **HTTPS et le certificat** par environnement (D919) ;
**`cors:`** à l'environnement (D918) ; **les `countries:`** et les flux
de données personnelles (D1345, §18) ; **la veille des CVE**, la voie b,
le fichier d'avis de sécurité signé et la nomenclature logicielle (D1431) ; **ce
que Syncytium ne décrit pas** — le pare-feu, le DNS, les
authentifications du réseau, aux équipes d'intégration (D1426).

**La sécurité, dans le guide d'exploitation** (la colonne 9 — le rang
7) : **les secrets** — `encrypt`, le clair refusé au démarrage (D902), la
rotation (D730), le certificat (D919) ; **les événements de sécurité**
du journal, à leur niveau, jamais un secret (D343) ; **les CVE à
traiter** à la santé et au mail (D1451), le fichier d'avis de sécurité
consulté et lu à la main (D1445) ; **le mode safe**, le dernier recours,
son mot de passe en clair au guide puis inaccessible (D1459) ; **les
erreurs techniques dans la langue technique de l'instance** (D1460,
D1473), les traces codifiées des hooks et leur arbre (D1461–D1464).

**Les autres colonnes** — à leur rang : la fonctionnelle (rien — la
sécurité n'est pas ce que l'utilisateur fait ; le masque dit ce qui est
protégé) ; l'information (le niveau de confidentialité affiché à chaque
champ, D1247 ; les colonnes protégées du chapitre 3, D1300 ; la matrice
des droits 5.2).

**La sécurité, dans la promotionnelle** (la colonne 6 — le rang 9) :
**rien de confidentiel, aucune donnée** dans la plaquette ni dans le
mode public (D1150) — les écrans rendus sont peuplés des `placeholder:`
(D1498) ; la démonstration n'a aucun connecteur réel hors le `llm`
(D1503, D1510), ses comptes sont éphémères (D1505), son storage
`memory` se supprime (D1506–D1508) ; `visibility: private` ferme tout
sans compte (D1498).

**La sécurité, dans la maintenance, les risques et les améliorations**
(la colonne 7 — le rang 8) : la famille « la sécurité » des risques
(D1490) — les refus de droits et les pics (D43, D47, D97), les
tentatives refusées, les CVE à traiter (D1451) — et la famille
« l'infrastructure » — les dépendances et leurs failles identifiées hors
du moteur (D924) ; la part de l'administrateur (D1493) ; les seuils du
modèle de risque (D50–D51, D740) inchangés.

