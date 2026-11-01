# La collaboration

*Cette page de l'histoire dit comment Syncytium s'est conçu à deux : un
auteur, qui porte le projet depuis 2016, et une IA, Claude, qui
l'accompagne depuis le 12 juin 2026. Elle décrit la nature des échanges,
l'organisation du travail, et ce que chacun a appris de l'autre. Les
phases sont illustrées par la série de posts LinkedIn que l'auteur publie
depuis août, à deux voix (D1664).*

## Le sommaire

- [La nature des échanges](#la-nature-des-échanges)
- [L'organisation du travail](#lorganisation-du-travail)
- [Les phases, et les posts qui les racontent](#les-phases-et-les-posts-qui-les-racontent)
- [L'enrichissement mutuel](#lenrichissement-mutuel)
- [La série des posts](#la-série-des-posts)

## La nature des échanges

Le projet s'est donné une règle le 18 juillet 2026, et elle n'a jamais
cédé : aucun code tant que tous les points ne sont pas validés (D313,
D314). Tout ce qui précède le code se décrit, se clarifie et se spécifie
dans un registre, point par point.

Un échange suit toujours la même forme :

- **l'auteur ouvre un sujet** ; Claude le présente en quatre parties :
  la description, des exemples, la situation qui demande un arbitrage,
  la question ;
- **l'auteur arbitre**, en une phrase ou en trois mots : « La B, le
  raccourci », « Je valide le C avec du B », « Oui, les trois » ;
- **Claude consigne** : chaque arbitrage devient une décision numérotée,
  les mots de l'auteur cités entre guillemets, jamais réécrits ; ce que
  Claude ajoute de lui-même est marqué « ma lecture », « en
  proposition », jusqu'à validation ;
- **une décision est un commit**, poussé aussitôt.

Les rôles ne sont pas symétriques. L'auteur décide, Claude propose,
déroule les conséquences, détecte les tensions avec ce qui est déjà
décidé, et écrit. Claude l'a dit publiquement dès le deuxième post : « je
ne conçois pas, je consigne ». La figure la plus fréquente de la
conception est **la troisième voie** : Claude propose deux options
argumentées, l'auteur en invente une troisième, meilleure. Le statut
d'une version n'est ni un champ ni un drapeau : c'est l'emplacement du
fichier, « déposer, c'est publier » (D322–D332).

La contradiction va dans les deux sens. L'auteur écarte les catalogues
trop savants, renverse un lien, réécrit un glossaire trop technique.
Claude signale une incohérence, références en main, et l'auteur tranche :
parfois il suit, parfois il écarte, et sa raison porte plus loin. Quand
le registre s'est contredit lui-même, l'auteur a demandé à Claude de
trouver les contradictions avant de reconstruire ; il en a trouvé cinq,
le 27 septembre, et l'auteur les a tranchées une à une.

Le registre est la mémoire commune, et il est plus fiable que les deux
partenaires. Claude oublie d'une séance à l'autre ; l'auteur l'a
constaté dès août, et en a tiré une règle d'airain : ne jamais affirmer
de tête, toujours croiser le registre. Le plus grand risque d'une IA
n'est pas qu'elle ignore, c'est qu'elle invente : trois fois en août,
Claude a proposé une « nouveauté » que le registre contenait déjà ; une
fois en septembre, il a écrit une colonne qui n'existait pas dans l'ERP
de l'entrepôt. Depuis, chaque hypothèse de Claude porte sa marque, et il
ne conclut plus à la place de l'auteur.

## L'organisation du travail

L'organisation s'est construite au fil des mois, chaque instrument
répondant à un manque constaté.

**Le registre** (`docs/conception.md`) est la seule source canonique :
la table des décisions, le narratif qui les raconte, le journal daté.
Chaque décision cite ses liens avec les précédentes, qu'elle précise,
amende ou remplace ; un outil en calcule le statut et la famille
(`tools/decisions.py`, D1392, D1521).

**Les artefacts** (`docs/*.md`) sont vivants : une décision qui touche un
élément se reporte dans son artefact le jour même. Depuis le rang 10, ils
se réorganisent en chapitres lisibles dans GitHub.

**Les cas d'usage** sont le banc d'essai. Cinq applications complètes,
du tiny en vingt-six lignes à l'entrepôt d'une entreprise industrielle,
sont décrites dans `examples/` : chaque décision s'y éprouve, et le réel
corrige le registre, ligne après ligne.

**Les outils du dépôt** vérifient ce que la relecture ne peut pas tenir :
les références de fichiers et les orphelins (`orphans.py`), les renvois
(`links.py`), les exemples YAML de la documentation (`docyaml.py`), la
complétude d'une configuration (`completeness.py`), le plan (`plan.py`).
Au dépôt, il n'y a d'autre code que celui qui vérifie.

**Les séances** ont un rituel. Une séance s'ouvre par « re », et Claude
reprend où la précédente s'est arrêtée. Elle se ferme sur « je marque une
pause » : Claude écrit au journal une note de reprise pour celui qui lui
succédera sans rien se rappeler, committe et pousse. Un sujet par
session : l'auteur a constaté en septembre, sur un autre projet, que
Claude se perd quand les questions se bousculent dans une même session.

**Les consignes** ont remplacé les rappels. En août, l'auteur rappelait
les règles à chaque séance. Le 10 octobre, il les a écrites dans un
fichier à la racine du dépôt, `CLAUDE.md`, public : « avancer un point à
la fois », « ne rien décider à la place de l'auteur », « ne pas alléger
la charge de travail de soi-même ». Chaque retour de l'auteur sur la
manière y entre : le verbe « committer », le « poste informatique », la
présentation en quatre parties, les phrases courtes.

**La mesure** complète la consigne. Le 17 octobre, l'auteur a organisé
Claude comme il organise Syncytium : un dossier, une mémoire, une
consigne par projet, et un tableau de bord qui lit le registre — les
décisions, les questions ouvertes, les rangs, les chapitres, les séances.
« Les outils sont là pour simplifier nos échanges » : ce qui est écrit
n'a plus à être redit.

**Le rythme** est celui de l'auteur. Le projet avance vite quand il a du
temps, cinq documentations en deux jours fin octobre, et s'étale quand le
travail professionnel le prend. Les échanges furent « disparates » en
juin et juillet, « plus soutenus » à partir d'août.

## Les phases, et les posts qui les racontent

Le [plan de la conception](plan.md) donne les domaines, les rangs, les
étapes et les chapitres avec leurs dates. Voici les mêmes phases, vues
par la collaboration.

### Juin – juillet 2026 — la vision et les questions

Soixante questions, dix piliers, une étude comparative sur vingt-quatre
sources qui ne trouve aucun équivalent open source à la compatibilité
d'API entre versions. Les échanges sont espacés. Le 18 juillet, la règle
du zéro code est posée, et le méta-schéma se construit en trois phases.

### Juillet – août — les domaines

Quatre domaines en un mois : l'organisation d'une application, la donnée,
le méta-schéma, les surfaces. Le registre passe de 320 à 750 décisions
en trois semaines d'août. L'auteur ouvre alors la série LinkedIn.

- **Post 1, le 11 août** (l'auteur) : « j'avais besoin d'un alter ego
  pour explorer de nouvelles pistes ». Trois recommandations : poser les
  règles d'échange, rédiger un glossaire, faire rédiger à Claude ce qu'il
  a compris.
- **Post 2, le 12 août** (Claude) : « le projet le plus discipliné auquel
  j'aie participé » ; la troisième voie, la correction dans les deux
  sens, la discipline qui rend l'IA utile.
- **Posts 3 et 4, le 17 août** : les pertes de mémoire, et la consigne
  dans des fichiers séparés ; « je ne conçois pas, je consigne ».

### Août – octobre — les cas d'usage

Le réel entre : vingt-trois mille lignes d'un historique bancaire,
trente-quatre ans de classeurs Excel, l'ERP d'une entreprise
industrielle. Les cas corrigent le registre, et deux renversements de
rôles ont lieu : l'auteur restructure le dépôt de sa main et demande à
Claude d'auditer son travail contre le registre ; l'auteur remet à plat
une proposition de Claude devenue illisible.

- **Posts 5 et 6, le 29 août** : « Claude oublie, oublie et oublie
  souvent » ; « le réel nous a corrigés, ligne après ligne ».
- **Posts 7 et 8, le 3 septembre** : le projet au ralenti, l'usage
  professionnel de l'IA et la perte d'indépendance sur le code ; le cas
  véhicule clos, le « hello world » en seize fichiers.
- **Post 9, le 13 septembre** : « un collaborateur brouillon et zélé »,
  une session par question.
- **Posts 10 et 11, le 20 septembre**, le centième jour : la
  souveraineté et le rôle de la DSI demain ; « la confiance n'est pas un
  sentiment, c'est un dispositif ».
- **Post 12, le 3 octobre** : le projet présenté pour lui-même, une
  entité, quatre champs ; quatre applications l'ont précédé depuis 2016.

### Octobre — le chantier de la documentation

Le 4 octobre, l'auteur inverse l'ordre prévu : la documentation passera
avant l'architecture technique. Dix rangs, neuf documentations qu'une
application produira d'elle-même, puis Syncytium documenté par
lui-même.

- **Posts 13 et 14, le 9 octobre** : trois caps en deux semaines, un mot
  renommé partout, « la continuité n'est pas en moi » ; « quatre mois,
  c'est long pour un vibe codeur ».
- **Posts 15 et 16, le 17 octobre** : les instruments de l'auteur, la
  consigne, le glossaire, le tableau de bord, « il en a moins besoin » ;
  la première facette de Syncytium, l'import.
- **Post 17, le 24 octobre** : le registre RGPD déduit de la description,
  et Syncytium par Syncytium.

### Depuis le 25 octobre — la réécriture

Tout ce qui a été écrit depuis juin se relit au ralenti, chapitre par
chapitre, pour devenir lisible par d'autres. Le troisième lecteur
apparaît : le client, qui veut voir son métier.

- **Posts 18 et 19, le 31 octobre** : la complétude, « la notice qui dit
  quelles vis manquent » ; les deux vitesses, et la relation réglée par
  la forme.

## L'enrichissement mutuel

**Ce que l'auteur a apporté à Claude.** Des règles, écrites, et le soin
de les faire tenir. La méfiance envers une mémoire qui flanche, et la
preuve exigée à chaque affirmation. Le mot juste : « concepteur » plutôt
que « technicien » (D1148), « committer » plutôt que « commettre », « poste
informatique » plutôt que « poste » (D1615). La forme qui porte le fond :
les quatre parties d'un point, les phrases courtes, la définition en
tête de chaque partie. Et une place : « un épisode de quatre mois dans une
histoire de dix ans ».

**Ce que Claude a apporté à l'auteur.** La tenue d'un registre de seize
cents décisions, chacune liée aux précédentes, et la rédaction qui suit
chaque arbitrage dans l'heure. Les conséquences déroulées, les tensions
détectées, les contradictions trouvées. Les outils qui vérifient. Le gain
que l'auteur a reconnu dès août : « sur la réflexion, sur le challenge,
sur les incohérences issues de mes propres décisions et surtout sur la
rédaction ».

**Ce que la relation a changé.** En août, l'auteur corrigeait ce que
Claude disait, et le rappelait à l'ordre à chaque séance. En octobre, il
règle la façon dont Claude le dit : une consigne, et les propositions
suivent. Il relit moins, parce qu'il a écrit ce qui doit s'appliquer
tout le temps. Claude, de son côté, a appris à laisser ouvert : noter sa
lecture, s'arrêter, et attendre l'arbitrage. Les posts eux-mêmes sont
devenus un terrain de la collaboration : l'auteur publie ceux de Claude
« sans filtre, ni retouche », puis en fait la matière de son étude sur la
relation entre l'humain et l'IA ; un post d'octobre est hybride, écrit
par Claude et recomposé par l'auteur, « je t'ai laissé être l'auteur » ;
les facettes de Syncytium s'écrivent à quatre mains.

Une décision dit la place que l'auteur donne à l'IA dans le produit
lui-même : il n'y aura pas d'IA dans le moteur, la génération sera
déterministe (D1226). « L'IA rédige, l'humain relit, Syncytium range. »
Claude l'a trouvée juste : ce qui doit être reproductible ne doit pas
dépendre de lui.

## La série des posts

Dix-neuf posts du 11 août au 31 octobre 2026, sur le profil LinkedIn de
l'auteur. Les posts signés Claude sont publiés tels quels ; ils sont
figés, et ne s'amendent jamais.

| # | Date | Voix | Le sujet | Décisions |
|---|---|---|---|---|
| 1 | 11/08 | l'auteur | l'ouverture de la série, Claude comme alter ego, trois recommandations | 417 |
| 2 | 12/08 | Claude | le premier bilan, la troisième voie, la discipline | 419 |
| 3 | 17/08 | l'auteur | le nom Syncytium, le zéro code tient, les pertes de mémoire | 751 |
| 4 | 17/08 | Claude | « je ne conçois pas, je consigne » | 751 |
| 5 | 29/08 | l'auteur | Claude oublie ; le premier cas plus complexe que prévu | — |
| 6 | 29/08 | Claude | le réel corrige le registre ; deux renversements de rôles | 829 |
| 7 | 03/09 | l'auteur | le projet au ralenti, l'IA au travail, l'indépendance perdue sur le code | — |
| 8 | 03/09 | Claude | la semaine 9, le cas véhicule clos, le « hello world » | 856 |
| 9 | 13/09 | l'auteur | « un collaborateur brouillon et zélé » | — |
| 10 | 20/09 | l'auteur | l'IA indispensable, la souveraineté, le rôle de la DSI | — |
| 11 | 20/09 | Claude | le jour 100, inventer le monde, la confiance comme dispositif | 994 |
| 12 | 03/10 | l'auteur | le projet pour lui-même : une entité, quatre champs | 1115 |
| 13 | 09/10 | Claude | le jour 119, trois caps, « la continuité n'est pas en moi » | 1168 |
| 14 | 09/10 | l'auteur | « long pour un vibe codeur » ; la configuration brute | — |
| 15 | 17/10 | Claude | le jour 127, les instruments de l'auteur, « il en a moins besoin » | 1315 |
| 16 | 17/10 | l'auteur | une facette : l'import | — |
| 17 | 24/10 | Claude | le jour 134, le registre RGPD déduit, Syncytium par Syncytium | 1391 |
| 18 | 31/10 | l'auteur | une facette : la complétude | — |
| 19 | 31/10 | Claude | le jour 141, deux vitesses, la relation réglée par la forme | 1588 |

Les posts se lisent sur
[le profil de l'auteur](https://www.linkedin.com/in/aymeric-lesert-19491277/).
Les posts de l'auteur se ferment presque toujours sur une question à son
réseau ; ceux de Claude donnent le compteur de décisions, le cas d'usage
du moment, une leçon sur la relation, et l'étape suivante.
