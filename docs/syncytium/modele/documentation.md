# Ce que le modèle livre à la documentation

## La représentation graphique — l'entité dans le diagramme (D1119)

La documentation générée porte **un volet « modèle de données » en
diagrammes de classes UML, calculés depuis la configuration** (D1119 —
« pour que le modèle soit facilement perceptible par un opérateur ou
un décideur » ; les niveaux de lecture, la forme et les lecteurs dans
[documentation.md](../../documentation.md) §5). Ce que chaque propriété de
l'entité y devient, la table acquise par D1278 :

| la configuration | le diagramme (D1213 ; la table acquise, D1278) |
|---|---|
| le module | le paquetage ; dans la vue des modules (D1214, D1266), une boîte par module, la flèche dans le sens de la dépendance, un seul trait par sens, sans poids ; les associations dérivées font flèche aussi — les liens bidirectionnels |
| l'entité (`name:`) | la classe, par son nom ; le parent est une classe comme une autre, sans annotation — tout parent s'instancie (D143, D1558) |
| `inheritance:` | la généralisation — le triangle vers le parent (D143–D145, D1278) |
| le champ `nom: type` | **son nom seul** — aucun type au diagramme, la table du dictionnaire le dit ; seuls les champs de valeur sont des lignes : tout champ qui pointe vers une entité est un lien (D1270) ; **un compartiment par groupe** (les groupes dans `fields:`, D1273/D1279), l'implicite en tête |
| `identity:` / `identities:` | **souligné** ; l'identité écrite `identity:` se nomme par défaut « identity » (D1304) |
| `formula:` | *italique* |
| `confidentiality:` au-dessus de `public` (D25), ou `rgpd:` (D695) | **« * »** — le champ sécurisé |
| le champ cible d'une référence (D396) ou d'une association (D405) dans une autre entité | **gras** — chez la cible, sur le champ d'identité visé (D1278) |
| `type: <entité>` — la référence | un lien fléché vers la cible, **le nom du champ en étiquette, un lien par champ ; pas de ligne dans l'entité** (D1270) ; **la cardinalité par l'obligation** — « 1 » si `required:`, « 0..1 » sinon, « 0..* » pour une liste (D1278) ; le champ en gras chez la cible |
| `type: list of <entité>` — la composition (D115) | un lien — « les listes apparaissent comme des liens » ; le losange plein et le trait plein, la cardinalité (D1268) |
| `type: association with <entité> if …` — l'association dérivée (D405) | **le losange vide et le pointillé** (D1268), du côté de l'entité qui la porte, la cardinalité ; dans la vue d'ensemble comme dans la vue sélective ; une dépendance comme la référence (D1267) |
| `type: list of [ … ]` — la liste de valeurs composées | **une structure interne** (D1271) : une classe **nommée par son entité — `article.tarifs`** (D1274), dans le paquetage de l'entité, ses colonnes en champs, composée par l'entité ; ses références en liens |
| `states:` | un diagramme d'états à part (D1276) : les valeurs du champ-statut, les passages permis (D422) — le trait porte la cible et la condition `when:` telle qu'écrite, le nom de l'opération qui déclenche le passage s'il y en a une ; les actes `allow:` en note, la table des états en détail ; un par entité qui déclare `states:`, le dérivé hérite |
| `operations:`, `history:`, `hint:`, `description:`, `placeholder:` | rien au diagramme — la table du dictionnaire (D1215) et le registre (D698) ; `required:` y est par la cardinalité (D1278) |

Ce que l'entité et chaque champ livrent au dictionnaire est dit à la
facette documentation, ci-dessous (D1158, D1215, D1253).

## La documentation — la facette de l'entité et du champ (D1158–D1159)

**L'entité, dans la fonctionnelle** — une section par entrée de menu
qui l'atteint (D1194), dans cet ordre (D1232) : **l'entité** — son
`title:`, sa `description:`, son visage, son identité ; **ses champs**,
en table — le libellé, **le type en clair** (D1233), l'obligation,
l'aide, la description, les valeurs d'un énuméré, l'exemple du
placeholder, le mode d'usage du composant (D1229) ; les calculés en
italique ; **l'écran** — la liste et le formulaire, qui disposent ces
champs (au masque, le `hint:` et la `description:` — D1191 ; un champ
sans l'un ni l'autre n'y est pas) ; **le cycle de vie** en table — par état, les
verbes permis et le libellé des groupes que l'`allow` cite (D1195,
D1227), le diagramme d'états (D422) ; **les opérations** en table — ce
qu'elle fait (la description de son hook, D1227 ; une opération
composée par la liste de ses étapes) et ce qui la déclenche (le
bouton, le `when:`, la période — D1196 ; une notification sans
destinataire remonte à tout le monde, D1228) ; **les règles** — le
`message:` montré par un exemple, le gabarit résolu sur les
`placeholder:` (D1229). Les compositions en sous-sections de leur
possesseur ; l'entrée de sous-menu d'une composition ouvre la liste de
l'enfant, tous possesseurs confondus (D1227). **Une entité que le menu
n'atteint pas n'est pas décrite dans la fonctionnelle** — elle reste au
dictionnaire (D1195). Une liste ou un graphique n'ont de section que
par leur entrée de menu ; placés dans un écran, ils se documentent là
(D1229). Les liens entre modules s'écrivent aux deux bouts (D1185–
D1186). À l'instance : le nombre de lignes (D1155), les usages (D1168).

**Le champ, dans la fonctionnelle** — son libellé (`label:` par langue ;
à défaut le gabarit du socle `${name}`, D1181, que la complétude
compte, D1182) ; son aide (`hint:`) et sa description ; l'obligation
(l'identité l'implique, D1170) ; les valeurs d'un énuméré par leur
libellé ; **à quoi il sert** — ses emplois en langage d'usager, depuis
les liens que l'ingestion garantit (D1198) ; le mode d'usage du
composant qui le rend (D1229) ; à l'instance, ses données vivantes
(D1155) et, sur demande, sa zone d'analyse (D1216).

**L'entité et le champ, dans le dictionnaire des données** (l'annexe
de la fonctionnelle, la version complète à l'information — D1212–
D1217) : la vue des modules, la vue de l'ensemble des entités, la vue
sélective du module — le nom du module, de l'entité et du champ seuls
(D1218), souligné pour l'identité, italique pour le calculé, « * » pour
le sécurisé ou `rgpd:`, gras pour le référencé, les listes en liens
(D1213–D1214) ; **une table par entité, une ligne par champ** — le
libellé marqué, le type en clair, l'obligation, le défaut, les valeurs,
l'aide, l'exemple (D1215).

**Ce que la complétude compte** (§20) : l'entité sans `description:`,
le champ sans `label:` (D1182), sans `hint:` ni `description:` (D1199),
l'énuméré sans libellé, l'entité sans aucun marquage `rgpd:` (D1177 —
signalée, jamais qualifiée) ; ni `history:` tu, ni les droits tus (D1173).

**L'entité et le champ, dans le dictionnaire de la donnée** (la colonne
2 — le rang 2, D1241–D1302) : **l'entité** a sa sous-section au chapitre
2.2, dans la section de son module (D1252) — sa description, ses
identités nommées, son visage, son historisation et comment lire ses
instantanés, son `rgpd:` ; **la table des champs par groupe** (D1273,
D1279) — le nom, le type en clair tel qu'appliqué (D1253), le libellé en
complément, l'aide, l'obligation, le défaut, le niveau de confidentialité
(D1247), les exceptions d'écriture (D1311), « depuis la version x »
(D1282, D1310) ; **ses
règles** (D1254) — les validations, les calculés et leurs formules, les
états avec leur graphe et leurs transitions (D1276), les automatismes ;
toutes les entités, tous les champs (D1246). Elle figure dans les trois
vues (D1213–D1214, D1266–D1269), sa table au chapitre 3 avec ses index
— ceux de ses identités, de ses références, de ses `searchable:` et des
critères de ses listes — et ses partitions (`partition:`, D1292–D1293), qui la référence à l'index 5.1
(D1263), ses droits à la matrice 5.2 (D1264), ses données au 5.3 — le
volume, les créations, les modifications, les suppressions, la
répartition par état (D1287). **Le champ** a sa ligne dans la table et
**sa section** après elle (D1283) : la description détaillée,
l'historique et les évolutions à venir (D1285), les opérations qui
l'écrivent et les règles qui le lisent (D1198), la télémétrie (D1216,
D1287) — aux droits du lecteur (D1249). Un champ qui pointe vers une
entité est un lien du diagramme, non une ligne (D1270) ; une liste de
valeurs composées, une structure interne nommée `entité.champ` (D1271,
D1274).

**L'entité et le champ, dans la réglementation** (la colonne 5 — le rang
3, D1317–D1344) : **le champ marqué `rgpd:`** — `personal`, `sensitive`,
`consent`, `identity` (D695, D1332), par lui-même ou par son type
(D1178) — fait du module un module soumis et de l'entité le stockage de
la donnée (D1317) ; l'entité porte, dans ses settings, le bloc `rgpd:`
du niveau entité (D1325) ; ses quatre actes du socle sont des
traitements du registre, ses opérations déclarées aussi quand elles
touchent un champ marqué, son wizard est une suite (D1318, D1329) ; son
état peut servir la limitation (D1172, D1331) ; ses champs `identity`
sont le point de départ de `rgpd.extract` ; sa rétention vient de
l'anonymisation déclarée sur elle (`rgpd.anonymize` avec `every:`,
D1334) ; sa table de stockage et ses colonnes protégées, par renvoi au
dictionnaire (D1321).

**L'entité et le champ, dans le projet et le support** (la colonne 8 —
le rang 4) : **ce qui change** — par module, les champs ajoutés,
renommés, retypés, supprimés, dépréciés d'une version à la suivante, en
résumé sur la page des versions (D1347, §9 de documentation.md),
l'« à venir » sur la production (D1285) ; **l'enregistrement cité par un
ticket** — l'entité et son identifiant montrés au moment de la demande
(D1364) ; rien d'écrit par l'entité.

**L'entité et le champ, dans la documentation du développeur** (la
colonne 3 — le rang 5) : **sa section du contrat d'API** (§10) pour le
compte qui peut l'atteindre (D1394) — les champs `public` par leur nom,
le type en clair tel qu'appliqué et le format de la valeur dans l'appel,
l'obligation, le défaut, les énumérés par leur code, la `description:` ;
les actes permis et les opérations avec leur contrat ; les lectures, la
liste, le curseur, les critères admis (D1292) ; les écritures, le lot ;
les liens vers les entités exposées ; les exemples d'appel lancés
depuis la console (D1398) ; **ses écarts** filtrés par l'exposition et
les droits, en tête et en annotation (D1401) ; **son gabarit technique**
par les noms (D1414) ; le `hint:` et le `title:` n'y paraissent pas
(D1402).

**L'entité et le champ, dans le D.A.T.** (la colonne 4 — le rang 6) :
rien de propre — une entité n'est pas une connexion ; ses champs
`rgpd:` marquent sur le schéma le flux qui les emporte (D1426, §18) ;
ses volumes entrent au dimensionnement de l'instance (D1430).

**L'entité et le champ, dans le guide d'exploitation** (la colonne 9 —
le rang 7) : rien de propre — l'exploitation ne voit pas les entités ;
la restauration d'un enregistrement (D171) est une fiche du guide,
l'entité y est nommée ; les volumes par entité pèsent sur la charge
(D1453).

**L'entité et le champ, dans la maintenance, les risques et les
améliorations** (la colonne 7 — le rang 8) : **les usages** (D1489) —
les lectures et les écritures de l'entité (D39), son nombre de lignes,
la diversité de chaque champ (D38, D46, D48), le champ jamais renseigné,
la valeur d'énuméré jamais choisie, sur la page de l'entité et dans les
trois listes du chapitre d'ensemble ; **les risques** (D1490) — les
volumes et leur croissance, les calculés sur les volumes (D985, D1012),
les validations qui échouent le plus, par règle et par champ ; **les
améliorations** (D1491–D1495) — le champ constant « candidat au
retrait » (D46), le domaine à resserrer (D48), l'entité jamais écrite ;
la proposition datée, sur la page du champ pour l'administrateur seul.

**L'entité et le champ, dans la promotionnelle** (la colonne 6 — le rang
9) : **l'entité** par son titre dans le modèle d'ensemble en image, les
entités et leurs liens sans les champs (D1498) ; **le champ** par son
`placeholder:`, qui peuple les écrans rendus sans donnée (D1498, D1129)
et la ligne d'exemple du jeu de données de démonstration (D1504) ;
aucune donnée réelle dans la plaquette ni dans le mode public (D1150).
## La documentation — la facette du type (D1158–D1159)

**Le type, dans la fonctionnelle.** Il ne s'y nomme jamais : il se dit
**en clair**, dans la langue du lecteur — « un texte de 40 caractères
au plus », « un entier », « une date », « un montant en euros », « l'un
de : Thermique, Électrique » — dans la table du dictionnaire (D1215) et
dans la section de l'écran. **La forme en clair de chaque type est sa
facette documentation**, à écrire type par type au rang 2 (le
frottement 7 du tiny, D1160) : un item du catalogue du moteur par
langue (D1160–D1162), que le type livre avec ses bornes et son masque.
Le `counter` se dit « attribué à la validation » (D409) ; le calculé se
dit par son libellé et son aide, jamais par sa formule (D1121).

**Le type personnalisé** (D359/D991) — son entrée au glossaire des types
(D1179, l'annexe) : `title:` et `description:` par langue, sa base, ses
facettes de sens — `rgpd:` (D1178), la confidentialité —, ses
contraintes en clair, les champs qui l'emploient ; la complétude compte
le type sans description.

**Le type, dans le dictionnaire** (D1215) : la colonne « Type » de la
table d'une entité, et les marques — italique pour le calculé, « * »
pour `rgpd:` (D1213). **Le hook de type** livre la même facette — le
type en clair, ses contraintes, son exemple, dans chaque langue du
moteur (D1162) — : « les hooks de type devront être adaptés pour que
cela s'intègre parfaitement » (D1215) ; le contrat au rang 2, dans
[hooks.md](../../hooks.md). **Dans le dictionnaire de la donnée, le type en
clair est le type tel qu'appliqué** (D1253) : « les settings deviennent
invisibles car intégrés au type » — la facette résout les trois niveaux
de réglages (D1239) avant de livrer sa forme (« une date, écrite
AAAAMMJJ » — sans dire d'où vient le masque) ; il n'y a pas de chapitre
des types ni des réglages, le type vit dans la table des champs. **Le
hook de type livre aussi ses indicateurs de télémétrie** (D1288 — la
liste par famille dans [telemetry.md](../../telemetry.md), D1287) : un type
personnalisé dit ce qu'il mesure ; la clause entre au contrat du hook
de type, à l'étape 9 du rang 2.

**La facette documentation du hook de type — les cinq livraisons**
(D1301, le rang 2) : la forme en clair par langue, les réglages fondus
(D1253) ; la déclinaison en élémentaires (D1298) — la colonne
« stockage » du catalogue ; **les modes de recherche qu'il admet**
(`strict`, `normalized`, `similarity`, `range` — D367/D371), origines
des index du chapitre 3 (D1292), et s'il peut porter une partition
(D1293 — une date par période, un énuméré) ; les indicateurs (D1288) ; l'exemple —
le `placeholder` du type, que celui du champ surcharge (D1211,
D1307) ; le marquage `rgpd:` (D1178). Le
moteur résout, le type formule ; les mots au catalogue (D1160) ; un type
dérivé hérite de la facette de son socle ; l'annexe B du dictionnaire,
le glossaire des types, s'en construit ; sans sa facette, un type est
complet pour tourner, incomplet pour documenter (D1221).

**Le type, dans la réglementation** (la colonne 5 — le rang 3) : **le
marquage porté par le type** (D1178) — `rgpd: personal | sensitive |
consent | identity` sur un type personnalisé, hérité par tout champ qui
l'emploie — ; le registre se lit alors par type, puis par champ ; le
`sensitive` audité d'office (D703) ; la forme en clair du type dit le
marquage (D1301).

**Le type, dans le projet et le support** (la colonne 8 — le rang 4) :
un champ retypé est un écart de « ce qui change » sur la page des
versions (D1281, D1347) ; rien d'autre.

**Le type, dans la documentation du développeur** (la colonne 3 — le
rang 5) : **la forme de ses valeurs** dans un appel et dans une cellule
du gabarit — fixée par le type, non par la langue (D1414) — et le type
en clair à côté de chaque champ du contrat ; **un type personnalisé** a
sa fiche à l'inventaire (D1406–D1407) — la forme en clair, la
déclinaison, les contraintes, l'exemple, les indicateurs, les modes de
recherche, le glossaire, les champs qui le portent — et l'entrée de la
référence pour en écrire un (D1408) ; son md par langue (D1403, D1405).

**Le type, dans le D.A.T.** (la colonne 4 — le rang 6) : rien — un type
n'a pas de connexion ; sa forme native par storage est au chapitre 3 du
dictionnaire (D1297).

**Le type, dans le guide d'exploitation** (la colonne 9 — le rang 7) :
rien — les types chiffrants à la fiche de la rotation des clés (D730).

**Le type, dans la maintenance, les risques et les améliorations** (la
colonne 7 — le rang 8) : les valeurs inemployées d'un type borné, le
domaine surdimensionné à resserrer (D48 — resserrer, non retirer), le
type dérivé que plus aucun champ n'emploie ; une proposition datée pour
l'administrateur (D1491–D1495).

**Le type, dans la promotionnelle** (la colonne 6 — le rang 9) : rien —
le type n'est pas un argument pour l'adhésion ; le jeu de données de
démonstration (D1504) doit respecter ses règles, le dry-run de l'import
les applique (D234).
