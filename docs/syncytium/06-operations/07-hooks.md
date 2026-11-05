# Le hook d'opération

Le catalogue des opérations est celui de Syncytium. Quand il manque un
verbe, le projet l'ajoute par du code : un hook d'opération. Ce fichier
dit son contrat, ses quatre fonctions, ses cinq propriétés, ce qu'il lit,
et sa fiche.

## Le sommaire

- [Une opération ajoutée](#une-opération-ajoutée)
- [Le contrat, les quatre fonctions](#le-contrat-les-quatre-fonctions)
- [Les cinq propriétés intrinsèques](#les-cinq-propriétés-intrinsèques)
- [Ce que le hook lit](#ce-que-le-hook-lit)
- [La fiche et le md](#la-fiche-et-le-md)

## Une opération ajoutée

> **Un hook** est un prolongement par code, écrit contre le contrat de
> Syncytium. Le hook d'opération ajoute une opération, un verbe que
> l'entité déclare ensuite comme une opération du socle
> ([glossaire](../../glossaire.md)).

« Une opération ne se construit pas dans la configuration : elle se
construit toujours à l'aide d'un hook de code » (D570). Le hook porte le
code de l'opération ; l'opération est sa déclaration, une suite
d'actions dont l'exécution du hook est la première (D609, D1771). Les
deux portent
le même nom, un verbe (D797). Les vingt et une opérations du socle sont
des hooks embarqués ; celles du projet sont des hooks ajoutés, écrits
contre le même contrat.

## Le contrat, les quatre fonctions

Le hook est un objet aux quatre fonctions (D595) :

- **`execute`** remplit la transaction tenue ouverte (D594) ; le preview
  est l'exécution suspendue avant le commit ;
- **`confirm`** relit : le message aux valeurs nommées, `nb_creations`,
  `nb_updates`, `nb_deletes` (D597, D598), ou un formulaire nourri par la
  transaction (D600, D601) ;
- **`commit`** scelle et retourne l'issue, l'écran, le téléchargement,
  l'impression, le message, ou rien (D570, D597) ; le moteur lit l'issue
  et la déclenche ;
- **`rollback`** défait la transaction, jamais les effets irréversibles
  (D1744).

## Les cinq propriétés intrinsèques

« Une opération s'exécute et elle possède aussi des propriétés » ; elles
tiennent au code, « pas exposables dans la configuration mais dans le
contrat du hook » (D905). Elles sont cinq, closes jusqu'à
l'implémentation (D1743) :

- **`degree: reader | user | manager | administrator`**, le plancher
  d'autorisation (D697, D699, D1680) ;
- **`execution: irreversible | once | repeatable`**, avec `try:` et
  `delay:`, le mode d'exécution (D57, D1744), dans
  [les tâches](05-taches.md) ;
- **`deterministic: true | false`** : l'opération est déterministe ou
  pas, « elle ne peut pas changer sans faire changer son code » (D59,
  D904) ; un appel identique dans la fenêtre reçoit le résultat
  mémorisé, sans ré-exécution ni effet répété ;
- **`deterministic_duration: <durée>`**, la fenêtre de mémoïsation
  (D59) ; le hook la porte, la configuration ne la surcharge jamais ;
- **`connectors: { <nom>: <famille> }`**, les connecteurs attendus,
  nommés et typés par leur famille, `documents: file`, `mailer: smtp`
  (D913) ; la déclaration les lie par `uses:` au connecteur de
  l'environnement (D617), toujours écrit, tout lien s'écrit (D914,
  D805) ; l'ingestion vérifie la liaison et la famille (D613) ; tout
  connecteur non attendu est hors de portée (D599).

Toutes paraissent au `describe` (D645). Le hook déclare, le moteur
exploite (D905) : le cache de mémoïsation est tenu pour l'opération
déterministe et vidé à l'échéance de la fenêtre ; l'invalidation du
cache est l'acte de l'administrateur, à trois grains, l'opération et ses
paramètres, l'opération, tout (D60). Le cooldown et la rétention du
résultat ne sont pas au contrat : ce sont des paramètres
d'administration, surchargés à la déclaration (D904, D906).

## Ce que le hook lit

Le hook lit la pile des contextes (D553) : l'opération au fond de la
pile voit le périmètre de la liste, l'enregistrement du formulaire, le
transitoire du wizard. Il lit `context.` (D589) : `user`, traversable,
`location`, `now`, `instance`, `application`, `module`, `entity`,
`field`, et `file`, `page`, `pages` dans un document. Il lit
`context.settings.<nom>` (D588, D591) : `{ mode: static | dynamic,
type:, value: }`, en cascade de l'application au module puis à
l'entité, le dynamique ajusté dans le module d'administration (D573).
Une fonction lit le contexte en lecture seule (D571) ; le hook écrit
dans la transaction, par la librairie d'exploration, jamais hors des
droits (D572, D599).

## La fiche et le md

La fiche suit la forme commune du chapitre 1 (D809) : `name`,
`description`, `code`, `properties`. Dans le cas 4 (banque),
`hooks/operations/dupliquer/dupliquer.yml` :

```yaml
# L'opération dupliquer
# La duplication d'une écriture entre deux dates, au pas choisi.
name: dupliquer

# La description
# La documentation de l'opération, en Markdown, une par langue de la version.
description:
  fr: ~{documentation.fr.md}
  en: ~{documentation.en.md}
  es: ~{documentation.es.md}

# Le code
code: ~{source.txt}

# Les propriétés
# Aucune.
properties: { }
```

La description est un fichier Markdown par langue de la version (D778,
D1403) : c'est la description de l'opération dans la documentation
fonctionnelle (D1227). Le code porte les quatre fonctions et les cinq
propriétés. Le mécanisme commun, la maison `hooks/`, la chaîne, les
traces codifiées, est au chapitre 1,
[la version](../01-configuration/04-version.md#39-hooks--le-mécanisme-des-hooks).
