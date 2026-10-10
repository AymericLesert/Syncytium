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
  courant. Branche de travail `feature/meta-schema` ; `develop` reçoit les PR
  en squash, `main` les publications. Le reset --hard et le push --force sont
  refusés : les laisser à l'auteur.

## Les artefacts

- `docs/*.md` : les artefacts préparatoires de la documentation (glossaire,
  entity, types, composants, hooks, connectors, mapping, rights,
  administration, telemetry, security, configuration, migration,
  documentation). Ils sont **vivants** : une décision qui touche un élément
  se reporte dans l'artefact de l'élément ; les principes de la génération
  de la documentation vont dans `docs/documentation.md`.
- `usecases/<n>_<nom>.md` : la maison de chaque cas (1 tiny, 2 enquête,
  3 véhicule, 4 banque, 5 entrepôt, 6–8 à venir) ; une décision qui touche un
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
  le traceur d'orphelins.

## La manière

- Avancer **un point à la fois** ; présenter les lectures à confirmer, ne
  rien décider à la place de l'auteur ; quand il propose une « troisième
  voie », la consigner fidèlement.
- Ne pas alléger la charge de travail de soi-même ; ne pas relancer un sujet
  mis en attente (les questions de l'assistance, SEQUITUR) sans qu'il l'ouvre.
- À chaque pause : journal de pause dans le registre, tout committé et
  poussé (le verbe est « committer », jamais « commettre »).
