# Syncytium — comment ce projet se travaille avec Claude

Syncytium est en **phase de conception** : aucun code tant que tout n'est pas
validé (D313–D314). Le travail est une conversation point par point entre
l'auteur, qui arbitre, et Claude, qui propose, consigne et met en forme.

## Le registre

- `docs/conception.md` est la **seule source canonique** : la table des
  décisions `| Dnnnn | … |` (le numéro suit le dernier), le narratif §3.2c,
  le journal daté (le plus récent en tête).
- **Chaque arbitrage de l'auteur est une décision** : ses mots sont cités
  **verbatim** entre « … » dans la décision ; ce que Claude ajoute est marqué
  *ma lecture* / *en proposition* jusqu'à validation. On ne réécrit jamais les
  mots de l'auteur, ni l'histoire du registre (le seul renommage global,
  D1148, a été demandé par lui).
- **Une décision = un commit, poussé.** Message en français, ligne de titre
  `Dnnnn — ce qui est décidé`, puis le trailer d'attribution du modèle
  courant. Branche de travail `feature/documentation` ; `develop` reçoit les PR
  en squash, `main` les publications. Le reset --hard et le push --force sont
  refusés : les laisser à l'auteur.

## Les artefacts

- `docs/` : la documentation. Un chapitre réorganisé vit dans
  `docs/syncytium/<nn>-<chapitre>/`, préfixé du numéro du chapitre (D1591) ;
  un chapitre qui ne l'est pas encore vit dans son artefact préparatoire,
  `docs/<nom>.md`. La table « L'avancement des quinze chapitres » de
  `docs/README.md` dit où vit chaque chapitre (D1864). Les deux sont
  **vivants** : une décision qui touche un élément se reporte là où
  l'élément est décrit, le fichier du chapitre ou l'artefact ; les principes
  de la génération de la documentation vont dans `docs/documentation.md`.
  **Dans un chapitre, chaque fichier est préfixé de son rang dans la table
  des matières**, `02-declaration.md`, le README sans préfixe (D1738) ;
  `docs/README.md` tient l'arborescence et l'avancement ;
  `python tools/links.py docs usecases README.md` vérifie les renvois.
- `usecases/<n>_<nom>.md` : la maison de chaque cas (1 tiny, 2 enquête,
  3 véhicule, 4 banque, 5 entrepôt — les cinq seuls, D1518) ; une décision qui touche un
  cas s'y reporte (le cas 5 en particulier). `examples/<n>_<nom>/` ne
  contient que la configuration — jamais un fichier libre (D1082).
- `docs/documentation.md` porte le plan du chantier en cours (le contexte,
  partie 5 : dix rangs) et la matrice composants × documentations ; chaque
  rang remplit la colonne de sa documentation dans les artefacts.

## Le vocabulaire

- **le concepteur** écrit la configuration ; **le technicien** consomme les
  API (D1148) ; les degrés : `reader`, `user`, `manager`, `administrator`.
- La structure de la configuration est en anglais, la sémantique métier dans
  la langue du modèle (D335) ; les documents et les échanges sont en français.

## L'écriture de la configuration (exemples)

- YAML, lignes de 120 caractères au plus (D1097) ; avant chaque clé une
  courte intro (sa nature), puis son apport si non trivial ; commentaire
  collé à la clé, ligne vide entre deux clés (D1084) ; aucune référence de
  décision ni d'histoire du cas dans la configuration (D1085).
- Ce que la documentation doit porter s'écrit en propriété
  (`description:`, `hint:`, `title:`), jamais en commentaire (D1100).
- Toute référence de fichier s'écrit `~{…}` (D956) ; un fichier qu'aucune
  clé ne cite est un orphelin.
- Vérifier chaque réécriture par comparaison YAML (contenu inchangé) et par
  le traceur d'orphelins : `python tools/orphans.py examples/<cas>` (D1240 —
  il suit les `~{…}`, vérifie le YAML et les 120 caractères, liste les
  orphelins).

## L'écriture de la documentation (`docs/`, le rang 10)

- **Didactique, illustrée d'exemples, en phrases courtes** (D1542 ; D1515 :
  « didactique, lisible et concise … sans oublier de présenter toutes les
  options que nous avons vues ») : chaque notion s'explique avant de se
  nommer, chaque règle a son exemple — en YAML quand la configuration est
  en jeu, pris dans un cas du dépôt de préférence —, une idée par phrase ;
  **des listes à puces** quand le texte décrit une liste d'actions ou de
  valeurs (D1544) ; **une illustration schématique** quand le paragraphe,
  la section ou le chapitre nécessite une vision schématique (D1835 ; en
  Mermaid, comme l'arbre des connecteurs, D1715 ; la largeur avant la
  hauteur, D1841 ; un arbre de décision en logigramme, vertical, les arcs à
  angle droit, D1842, D1844 : Début et Fin en terminateurs, les actions en
  rectangles, les décisions en losanges à Oui et Non, les commentaires
  reliés par un trait, un tracé sobre, D1847 ; **les logigrammes se
  dessinent par `tools/logigramme.py`**, D1848 : une description YAML dans
  `schemas/<nom>.yml` du chapitre, le SVG à côté, l'image dans le texte) ; **un exemple YAML suit les règles des cas d'exemple**
  ci-dessus (D1545) : l'introduction avant chaque clé, le commentaire
  collé à la clé, une ligne vide entre deux clés, aucune référence de
  décision dans l'exemple — les décisions se citent dans la prose qui
  l'entoure —, 120 caractères au plus ; un extrait d'un cas se copie tel
  quel ; `python tools/docyaml.py docs/syncytium` le vérifie.
- **Chaque partie s'ouvre sur la définition de sa notion** (D1562) : en
  citation, la notion en gras, reprise du glossaire en phrases courtes,
  le renvoi au glossaire à sa suite ; une notion absente du glossaire y
  entre.
- **Chaque fichier porte un sommaire dans son introduction** (D1658) :
  `## Le sommaire`, avant le premier titre, les titres `##` et `###` du
  fichier en liens vers leurs ancres ; **le sommaire est une table des
  matières** (D1694, D1695) : le README d'un chapitre liste chaque
  fichier et ses sections `##` en titres liés, sans description.
- **Un chapitre se fait en trois temps** (D1521, D1543) : la lecture — l'audit
  par famille, les écarts arbitrés point par point —, la réorganisation —
  le découpage vérifié, l'historique sorti, les liens —, puis la
  **réécriture** dans la forme ci-dessus, à la fin du chapitre, pour une
  relecture rapide ; la table de `docs/README.md` note les trois.
- Un chapitre dit **ce qui est**, pas ce qui a été : l'historique reste au
  registre (D1822 — l'histoire est le récit du projet, `docs/histoire/`) ; les décisions sont citées entre parenthèses, elles
  renverront aux ADR.

## La manière

- **Un chapitre s'ouvre par une vision globale** (D1787) : les points ordonnés
  par le sujet du chapitre, en groupes, ce qui le quitte vers les autres
  chapitres ; la table « Les points de la lecture en cours » de
  `docs/README.md` les tient à chaque point (« à traiter », « présenté »,
  « clos (Dnnnn) »), le tableau de bord la lit.
- Avancer **un point à la fois** ; présenter les lectures à confirmer, ne
  rien décider à la place de l'auteur ; quand il propose une « troisième
  voie », la consigner fidèlement.
- Ne pas alléger la charge de travail de soi-même ; ne pas relancer un sujet
  mis en attente (les questions de l'assistance, SEQUITUR) sans qu'il l'ouvre.
- À chaque pause : journal de pause dans le registre, la page du plan
  régénérée (`python tools/plan.py`, D1660), tout committé et poussé (le
  verbe est « committer », jamais « commettre »).
