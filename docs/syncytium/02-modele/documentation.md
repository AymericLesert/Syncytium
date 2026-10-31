# Ce que le modèle livre à la documentation

> **Une facette** est un des modes de représentation d'un élément : sa
> valeur, son stockage, son affichage, sa forme d'API
> ([glossaire](../../glossaire.md)). **La documentation est une facette
> de chaque composant** : chaque type de composant se décline dans
> chaque documentation, et Syncytium assemble (D1158, D1159).

L'entité, le champ et le type n'écrivent pas de documentation. Ils
portent ce qu'il faut pour qu'elle se calcule : leurs noms, leurs
textes, leurs liens. Ce fichier dit ce qu'ils livrent, d'abord au
diagramme du modèle, puis à chacune des neuf documentations générées.
Les documentations elles-mêmes sont décrites dans
[documentation.md](../../documentation.md).

## L'entité dans le diagramme

La documentation générée porte un volet « modèle de données », en
diagrammes de classes UML calculés depuis la configuration (D1119). Le
registre en dit le but : « pour que le modèle soit facilement
perceptible par un opérateur ou un décideur ». Les niveaux de lecture
et les lecteurs sont au §5 de [documentation.md](../../documentation.md).

Ce que chaque élément de la configuration devient au diagramme (D1213,
D1278) :

| La configuration | Le diagramme |
|---|---|
| le module | un paquetage ; dans la vue des modules, une boîte par module, une flèche dans le sens de la dépendance, un seul trait par sens, sans poids ; les associations dérivées font flèche aussi (D1214, D1266) |
| l'entité, `name:` | une classe, par son nom ; un parent est une classe comme une autre, sans annotation, car tout parent s'instancie (D143, D1558) |
| `inheritance:` | la généralisation, le triangle vers le parent (D143–D145) |
| un champ de valeur | une ligne, **son nom seul** : le type est dans la table du dictionnaire ; un champ qui pointe vers une entité est un lien, pas une ligne (D1270) |
| un groupe de champs | un compartiment ; le groupe implicite en tête (D1273, D1279) |
| `identity:`, `identities:` | le nom souligné ; l'identité écrite `identity:` se nomme « identity » (D1304) |
| `formula:` | le nom en *italique* |
| `confidentiality:` au-dessus de `public`, ou `rgpd:` | le nom suivi de « * », le champ sécurisé (D25, D695) |
| le champ visé par une référence ou une association | le nom en **gras**, chez la cible, sur le champ d'identité visé (D396, D405) |
| la référence, `type: <entité>` | un lien fléché vers la cible, le nom du champ en étiquette, un lien par champ ; la cardinalité par l'obligation : « 1 » si `required:`, « 0..1 » sinon (D1270) |
| la composition, `list of <entité>` | un lien, le losange plein et le trait plein, la cardinalité « 0..* » (D115, D1268) |
| l'association dérivée, `association with <entité> if …` | le losange vide et le pointillé, du côté de l'entité qui la porte, la cardinalité ; une dépendance comme la référence (D405, D1267, D1268) |
| la liste de valeurs composées, `list of [ … ]` | une structure interne : une classe nommée par son entité, `article.tarifs`, dans le paquetage de l'entité, ses colonnes en champs, composée par l'entité ; ses références en liens (D1271, D1274) |
| `states:` | un diagramme d'états à part, un par entité qui le déclare, hérité par les dérivés (D1276) |
| `operations:`, `history:`, `hint:`, `description:`, `placeholder:` | rien au diagramme : la table du dictionnaire (D1215) et le registre des traitements (D698) les portent |

Le diagramme d'états montre les valeurs du champ-statut et les passages
permis (D422). Chaque trait porte la cible et la condition `when:` telle
qu'écrite, et le nom de l'opération qui déclenche le passage s'il y en a
une. Les actes `allow:` sont en note, la table des états en détail.

## La facette de l'entité et du champ

### Dans la documentation fonctionnelle

L'entité a une section par entrée de menu qui l'atteint (D1194). La
section suit cet ordre (D1232) :

1. **l'entité** : son `title:`, sa `description:`, son visage, son
   identité ;
2. **ses champs**, en table : le libellé, le type en clair (D1233),
   l'obligation, l'aide, la description, les valeurs d'un énuméré,
   l'exemple du `placeholder:`, le mode d'usage du composant (D1229) ;
   les calculés en italique ;
3. **l'écran** : la liste et le formulaire qui disposent ces champs ; au
   masque d'explication, le `hint:` et la `description:` (D1191) ; un
   champ sans l'un ni l'autre n'y paraît pas ;
4. **le cycle de vie**, en table : par état, les verbes permis et le
   libellé des groupes que l'`allow` cite (D1195, D1227), puis le
   diagramme d'états (D422) ;
5. **les opérations**, en table : ce que chacune fait, par la
   description de son hook (D1227) ou la liste de ses étapes ; ce qui la
   déclenche, le bouton, le `when:`, la période (D1196) ; une
   notification sans destinataire remonte à tout le monde (D1228) ;
6. **les règles** : le `message:` montré par un exemple, le gabarit
   résolu sur les `placeholder:` (D1229).

Six règles complètent la section.

- **Les compositions** sont des sous-sections de leur possesseur.
  L'entrée de sous-menu d'une composition ouvre la liste de l'enfant,
  tous possesseurs confondus (D1227).
- **Une entité que le menu n'atteint pas** n'est pas décrite dans la
  fonctionnelle ; elle reste au dictionnaire (D1195).
- **Une liste ou un graphique** n'a de section que par son entrée de
  menu ; placé dans un écran, il se documente là (D1229).
- **Les liens entre modules** s'écrivent aux deux bouts (D1185, D1186).
- **À l'instance**, la section montre le nombre de lignes (D1155) et les
  usages (D1168).

Le champ apporte à la fonctionnelle :

- son libellé, `label:` par langue ; à défaut, le gabarit du socle
  `${name}` (D1181), que la complétude compte (D1182) ;
- son aide, `hint:`, et sa description ;
- son obligation, que l'identité implique (D1170) ;
- les valeurs d'un énuméré, par leur libellé ;
- **à quoi il sert** : ses emplois en langage d'usager, calculés depuis
  les liens que l'ingestion garantit (D1198) ;
- le mode d'usage du composant qui le rend (D1229) ;
- à l'instance, ses données vivantes (D1155) et, sur demande, sa zone
  d'analyse (D1216).

### Dans le dictionnaire des données

Le dictionnaire des données est l'annexe de la fonctionnelle ; sa
version complète est dans la documentation de l'information (D1212–D1217).
Il porte :

- **trois vues** : la vue des modules, la vue de l'ensemble des
  entités, la vue sélective d'un module ; chacune montre le nom du
  module, de l'entité et du champ seuls (D1218), avec les marques du
  diagramme (D1213, D1214) ;
- **une table par entité, une ligne par champ** : le libellé marqué, le
  type en clair, l'obligation, le défaut, les valeurs, l'aide,
  l'exemple (D1215).

### Ce que la complétude compte

La complétude signale ce qui manque à la documentation (§20) :

- l'entité sans `description:` ;
- le champ sans `label:` (D1182), sans `hint:` ni `description:`
  (D1199) ;
- l'énuméré sans libellé ;
- l'entité sans aucun marquage `rgpd:` : signalée, jamais qualifiée
  (D1177).

Elle ne compte ni un `history:` tu, ni des droits tus (D1173).

### Dans le dictionnaire de la donnée

C'est la documentation de l'information (D1241–D1302). **L'entité** a sa
sous-section au chapitre 2.2, dans la section de son module (D1252) :

- sa description, ses identités nommées, son visage ;
- son historisation, et comment lire ses instantanés ;
- son `rgpd:` ;
- **la table de ses champs, par groupe** (D1273, D1279) : le nom, le
  type en clair tel qu'appliqué (D1253), le libellé en complément,
  l'aide, l'obligation, le défaut, le niveau de confidentialité (D1247),
  les exceptions d'écriture (D1311), « depuis la version x » (D1282,
  D1310) ;
- **ses règles** (D1254) : les validations, les calculés et leurs
  formules, les états avec leur graphe et leurs transitions (D1276), les
  automatismes.

Toutes les entités et tous les champs y figurent (D1246). L'entité
paraît aussi :

- dans les trois vues (D1213, D1214, D1266–D1269) ;
- au chapitre 3, avec sa table, ses index et ses partitions : les index
  de ses identités, de ses références, de ses `searchable:` et des
  critères de ses listes, ses partitions `partition:` (D1292, D1293) ;
- à l'index 5.1, qui la référence (D1263) ;
- à la matrice 5.2, ses droits (D1264) ;
- au 5.3, ses données : le volume, les créations, les modifications, les
  suppressions, la répartition par état (D1287).

**Le champ** a sa ligne dans la table, et sa section après elle (D1283) :
la description détaillée, l'historique et les évolutions à venir
(D1285), les opérations qui l'écrivent et les règles qui le lisent
(D1198), la télémétrie (D1216, D1287). Tout se lit aux droits du lecteur
(D1249). Un champ qui pointe vers une entité est un lien du diagramme,
pas une ligne (D1270) ; une liste de valeurs composées est une structure
interne nommée `entité.champ` (D1271, D1274).

### Dans la réglementation

C'est la documentation de la conformité (D1317–D1344).

- **Un champ marqué `rgpd:`**, `personal`, `sensitive`, `consent` ou
  `identity`, par lui-même ou par son type (D695, D1178, D1332), fait de
  son module un module soumis, et de son entité le stockage de la donnée
  (D1317).
- **L'entité porte dans ses settings** le bloc `rgpd:` de son niveau
  (D1325).
- **Ses quatre actes du socle** sont des traitements du registre ; ses
  opérations déclarées aussi, quand elles touchent un champ marqué ; son
  wizard est une suite (D1318, D1329).
- **Son état** peut servir la limitation (D1172, D1331).
- **Ses champs `identity`** sont le point de départ de `rgpd.extract`.
- **Sa rétention** vient de l'anonymisation déclarée sur elle,
  `rgpd.anonymize` avec `every:` (D1334).
- **Sa table de stockage et ses colonnes protégées** se donnent par
  renvoi au dictionnaire (D1321).

### Dans le projet et le support

- **Ce qui change** : par module, les champs ajoutés, renommés, retypés,
  supprimés, dépréciés d'une version à la suivante, en résumé sur la
  page des versions (D1347) ; l'« à venir » sur la production (D1285).
- **L'enregistrement cité par un ticket** : l'entité et son identifiant,
  montrés au moment de la demande (D1364).

L'entité n'y écrit rien d'autre.

### Dans la documentation du développeur

L'entité a **sa section du contrat d'API** (§10) pour le compte qui peut
l'atteindre (D1394) :

- les champs `public`, par leur nom, avec le type en clair tel
  qu'appliqué et le format de la valeur dans l'appel, l'obligation, le
  défaut, les énumérés par leur code, la `description:` ;
- les actes permis et les opérations, avec leur contrat ;
- les lectures, la liste, le curseur, les critères admis (D1292) ;
- les écritures, le lot ;
- les liens vers les entités exposées ;
- les exemples d'appel, lancés depuis la console (D1398) ;
- **ses écarts**, filtrés par l'exposition et les droits, en tête et en
  annotation (D1401) ;
- **son gabarit technique**, par les noms (D1414).

Le `hint:` et le `title:` n'y paraissent pas (D1402).

### Dans le D.A.T.

Rien de propre : une entité n'est pas une connexion. Ses champs `rgpd:`
marquent sur le schéma le flux qui les emporte (D1426). Ses volumes
entrent au dimensionnement de l'instance (D1430).

### Dans le guide d'exploitation

Rien de propre : l'exploitation ne voit pas les entités. La
restauration d'un enregistrement (D171) est une fiche du guide, où
l'entité est nommée. Les volumes par entité pèsent sur la charge (D1453).

### Dans la maintenance, les risques et les améliorations

- **Les usages** (D1489) : les lectures et les écritures de l'entité
  (D39), son nombre de lignes, la diversité de chaque champ (D38, D46,
  D48), le champ jamais renseigné, la valeur d'énuméré jamais choisie ;
  sur la page de l'entité et dans les trois listes du chapitre
  d'ensemble.
- **Les risques** (D1490) : les volumes et leur croissance, les calculés
  sur les volumes (D985, D1012), les validations qui échouent le plus,
  par règle et par champ.
- **Les améliorations** (D1491–D1495) : le champ constant, « candidat au
  retrait » (D46), le domaine à resserrer (D48), l'entité jamais écrite ;
  une proposition datée, sur la page du champ, pour l'administrateur
  seul.

### Dans la documentation promotionnelle

- **L'entité** paraît par son titre dans le modèle d'ensemble en image :
  les entités et leurs liens, sans les champs (D1498).
- **Le champ** paraît par son `placeholder:`, qui peuple les écrans
  rendus sans donnée (D1129, D1498) et la ligne d'exemple du jeu de
  démonstration (D1504).

Aucune donnée réelle n'entre dans la plaquette ni dans le mode public
(D1150).

## La facette du type

### Dans la documentation fonctionnelle

Le type ne s'y nomme jamais. Il se dit **en clair**, dans la langue du
lecteur : « un texte de 40 caractères au plus », « un entier », « une
date », « un montant en euros », « l'un de : Thermique, Électrique ».
Cette forme paraît dans la table du dictionnaire (D1215) et dans la
section de l'écran.

- **La forme en clair est la facette documentation du type** (D1160) :
  un item du catalogue du moteur, par langue (D1160–D1162), que le type
  livre avec ses bornes et son masque.
- **Le compteur** se dit « attribué à la validation » (D409).
- **Le calculé** se dit par son libellé et son aide, jamais par sa
  formule (D1121).

### Le type dérivé et le glossaire

Le type dérivé (D359, D991) a son entrée au glossaire des types,
l'annexe B du dictionnaire (D1179) :

- son `title:` et sa `description:` par langue ;
- sa base ;
- ses facettes de sens, `rgpd:` (D1178) et la confidentialité ;
- ses contraintes, en clair ;
- les champs qui l'emploient.

La complétude compte le dérivé sans description.

### Dans le dictionnaire

Le type remplit la colonne « Type » de la table d'une entité, avec les
marques : l'italique pour le calculé, « * » pour `rgpd:` (D1213, D1215).

- **Le hook de type livre la même facette** : le type en clair, ses
  contraintes, son exemple, dans chaque langue du moteur (D1162). Le
  registre le dit : « les hooks de type devront être adaptés pour que
  cela s'intègre parfaitement » (D1215). Le contrat est dans
  [les hooks](../../hooks.md).
- **Dans le dictionnaire de la donnée, le type en clair est le type tel
  qu'appliqué** (D1253). Le registre le dit : « les settings deviennent
  invisibles car intégrés au type ». La facette résout les trois niveaux
  de réglages (D1239) avant de livrer sa forme, « une date, écrite
  AAAAMMJJ », sans dire d'où vient le masque. Il n'y a pas de chapitre
  des types ni des réglages : le type vit dans la table des champs.
- **Le hook de type livre ses indicateurs de télémétrie** (D1287, D1288) :
  un type ajouté dit ce qu'il mesure. La liste par famille est dans
  [la télémétrie](../../telemetry.md).

### Les cinq livraisons du hook de type

La facette documentation d'un hook de type livre cinq choses (D1301) :

1. **la forme en clair, par langue**, les réglages fondus (D1253) ;
2. **la déclinaison en élémentaires** (D1298), la colonne « stockage »
   du catalogue ;
3. **les modes de recherche qu'il admet**, `strict`, `normalized`,
   `similarity`, `range` (D367, D371), origines des index du chapitre 3
   (D1292), et s'il peut porter une partition : une date par période, un
   énuméré (D1293) ;
4. **les indicateurs** (D1288) ;
5. **l'exemple** : le `placeholder:` du type, que celui du champ
   surcharge (D1211, D1307).

Le marquage `rgpd:` du type s'y ajoute (D1178). Le moteur résout, le type
formule, et les mots sont au catalogue (D1160). Un type dérivé hérite de
la facette de sa base. Le glossaire des types s'en construit. Sans sa
facette, un type est complet pour tourner, incomplet pour documenter
(D1221).

### Dans les autres documentations

- **La réglementation** : le marquage porté par le type, `rgpd:
  personal | sensitive | consent | identity`, hérité par tout champ qui
  l'emploie (D1178). Le registre des traitements se lit alors par type,
  puis par champ. Le `sensitive` est audité d'office (D703). La forme en
  clair du type dit le marquage (D1301).
- **Le projet et le support** : un champ retypé est un écart de « ce qui
  change », sur la page des versions (D1281, D1347).
- **Le développeur** : la forme des valeurs du type dans un appel et dans
  une cellule du gabarit, fixée par le type, non par la langue (D1414),
  et le type en clair à côté de chaque champ du contrat. Un type ajouté a
  sa fiche à l'inventaire (D1406, D1407) : la forme en clair, la
  déclinaison, les contraintes, l'exemple, les indicateurs, les modes de
  recherche, le glossaire, les champs qui le portent. La référence dit
  comment en écrire un (D1408), son md par langue (D1403, D1405).
- **Le D.A.T.** : rien ; un type n'a pas de connexion. Sa forme native par
  storage est au chapitre 3 du dictionnaire (D1297).
- **Le guide d'exploitation** : rien ; les types chiffrants sont à la
  fiche de la rotation des clés (D730).
- **La maintenance** : les valeurs inemployées d'un type borné, le
  domaine surdimensionné à resserrer, non à retirer (D48), le type dérivé
  qu'aucun champ n'emploie plus ; une proposition datée pour
  l'administrateur (D1491–D1495).
- **La promotionnelle** : rien ; le type n'est pas un argument. Le jeu de
  démonstration (D1504) respecte ses règles, et le dry-run de l'import
  les applique (D234).
