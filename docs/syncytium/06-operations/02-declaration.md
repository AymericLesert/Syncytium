# La déclaration

Une opération se déclare sur son entité, dans le bloc `operations:`,
sous le nom de son hook. Ce fichier dit ce que la déclaration porte, les
portées, le commit, la dépréciation, et montre l'exemple de la banque.

## Le sommaire

- [L'opération](#lopération)
- [Les portées](#les-portées)
- [Le commit](#le-commit)
- [La dépréciation d'une opération](#la-dépréciation-dune-opération)
- [L'exemple de la banque](#lexemple-de-la-banque)

## L'opération

> **Une opération** est un verbe déclaré sur une entité, au-delà du
> créer-modifier-supprimer : valider, envoyer, clôturer. Sa déclaration
> est une suite d'actions ; son exécution, suite à un déclencheur, est
> une tâche ([glossaire](../../glossaire.md)).

Une opération « ne se construit pas dans la configuration : elle se
construit toujours à l'aide d'un hook de code » (D570). Le hook porte le
code de l'opération ; l'opération est sa déclaration, dans le bloc
`operations:` de l'entité, une suite d'actions dont l'exécution du hook
est la première (D432, D609, D1771). Le hook et la déclaration portent le même
nom, un verbe (D797). Dans un écran, une opération n'apparaît que là où
un acte la place, `operation[<nom>]` dans un formulaire, son nom en
colonne d'une liste ; sans déclaration, elle n'apparaît pas (D1772).
L'API l'expose d'office (D428).

La déclaration porte :

- **`label:`**, le libellé du bouton, par langue ; sans lui, le nom
  (D1181) ;
- **`form:`**, le formulaire d'appel : ses champs sont les paramètres
  du hook, et la validation du formulaire est l'opération (D775) ;
- **`if:`**, la garde, une expression qui grise le bouton quand elle est
  fausse (D430) ;
- **`commit:`**, le mode de validation, ci-dessous ;
- **`scope:`**, la portée, ci-dessous ;
- **`when:`** et **`every:`**, le déclencheur quand il n'est pas l'acte
  de l'utilisateur, dans [les déclencheurs](03-declencheurs.md) ;
- **`actions:`** et **`effects:`**, la suite d'actions et les effets,
  dans [la composition](04-composition.md) ;
- **`mode:`**, synchrone, asynchrone ou différée, dans
  [les tâches](05-taches.md) ;
- **`uses:`**, les connecteurs de l'environnement que le hook attend,
  sous les noms de son contrat, toujours écrit (D913, D914) ;
- **`cooldown:`** et **`retention:`**, l'anti-rejeu de l'API et la durée
  de consultation du résultat ; leurs défauts sont des paramètres
  d'administration, `operation.cooldown` et `operation.retention`
  (D904, D906) ;
- **`allow:`**, les groupes autorisés, en plus du plancher du contrat
  (D700) ; la règle complète d'un droit d'action, `enable`, `group`,
  `when`, est au chapitre 7 (D1795) ;
- **`rgpd:`**, le traitement au sens du RGPD, sa finalité `purpose:`,
  qui tient lieu de description, son responsable, sa base légale
  (D1317, D1322, D1487) ; les cinq clés du bloc et ses quatre niveaux
  sont au chapitre 7 (D1809).

## Les portées

Une opération a l'une des cinq portées (D570) :

- l'enregistrement, celui du formulaire ;
- la liste, tous les enregistrements affichés ;
- la sélection, ceux que l'utilisateur a cochés ;
- le module ;
- l'application.

Elle voit la pile des contextes, le périmètre de la liste,
l'enregistrement du formulaire, le transitoire du wizard (D553). Elle
peut appeler une fonction ; une fonction ne déclenche jamais une
opération (D571).

## Le commit

`commit:` dit comment l'opération se valide (D596) :

- **`auto`**, sans relecture : la transaction se scelle dès que le hook
  a fini ;
- **`confirm`**, avec relecture : le moteur présente ce que l'opération
  a mis dans la transaction, l'utilisateur confirme ou annule.

La forme riche est `commit: { mode:, form:, message: }` (D600, D1606) :
`form:` nomme le formulaire de la relecture ; `message:` est un gabarit
nourri des valeurs nommées que l'opération rend, `{nb_creations}
factures créées` (D598). `commit: confirm` en est le raccourci. Sans
`form:` ni `message:`, le formulaire par défaut, `record`, s'ouvre en
lecture seule (D1645). Le wizard porte le même `commit:` (D1652).

## La dépréciation d'une opération

> **La dépréciation** d'un élément annonce son retrait. L'élément vit
> encore ; le bloc `deprecation:` dit ce qui le remplace, ou son abandon.
> Elle ne se confond pas avec la dépréciation d'une version, qui est
> effective ([glossaire](../../glossaire.md)).

Une opération peut être appelée à disparaître : une autre la remplace,
ou le métier ne s'en sert plus. La configuration ne la retire pas d'un
coup. Elle l'annonce d'abord, sur l'opération elle-même, dans le bloc
`operations:` de l'entité, dans la version en service (D650, D1871). Le
bouton, le déclencheur et l'API la servent comme avant.

**La forme courte.** Le bloc nomme la remplaçante, rien de plus (D1873).
La remplaçante est une autre opération, nommée par son nom, celui de son
hook (D1875). L'exemple est construit, aucun cas n'en porte. Dans la
banque, la duplication céderait à une opération `recopier` :

```yaml
# La duplication entre deux dates : l'opération recopier la remplace
dupliquer:
  label: { fr: Dupliquer, en: Duplicate, es: Duplicar }
  form: duplication
  commit: confirm
  deprecation: recopier
```

**La forme longue.** Elle porte deux clés (D1871) :

- **`documentation:`**, le texte qui explique la dépréciation. C'est un
  texte de la version : à plusieurs langues, il les porte toutes
  (D1474) ;
- **`to:`**, l'opération remplaçante.

Sans `to:`, le bloc dit l'abandon, et `documentation:` est exigée. Une
dépréciation dit toujours le remplacement ou l'abandon ; l'ingestion le
vérifie (D650). Le bloc n'a pas de `mode:` : sa présence dit l'intention
(D1872).

La banque a trois langues : son texte les porte toutes.

```yaml
# La propagation aux similaires : abandonnée, sans remplaçante
propager:
  label: { fr: Propager, en: Propagate, es: Propagar }
  form: propagation
  commit: confirm
  deprecation:
    documentation:
      fr: La saisie en masse de la liste suffit, la propagation n'est plus proposée.
      en: Bulk entry in the list is enough, propagation is no longer offered.
      es: La entrada masiva de la lista basta, la propagación ya no se ofrece.
```

**Ce que la dépréciation d'une opération touche.** Tout ce qui la lance
(D1877) :

- les actes qui la placent, `operation[<nom>]` dans un formulaire, son
  nom en colonne d'une liste (D1772) ;
- ses déclencheurs, `when:` et `every:` ;
- les opérations qui l'enchaînent dans leurs `actions:` ;
- l'API, qui l'expose encore (D428).

**De l'intention à la suppression.** Une dépréciation se joue en trois
temps :

1. **L'intention.** Le bloc est écrit. Rien ne change : l'opération
   s'exécute comme avant (D650, D1872).
2. **La validation.** Une beta complète la dépréciation : en retirant
   l'opération, elle la valide (D1870, D1875).
3. **La suppression.** Elle vient avec une version : l'opération quitte la
   description (D650).

Le mot `deprecated` nomme autre chose : le statut d'une version, déposée
dans `versions/deprecated/`. Là, la dépréciation est effective (D1869).
Sur une opération, le bloc s'écrit toujours `deprecation:` (D1871).

## L'exemple de la banque

Dans le cas 4 (banque), `banque/ecriture/operations.yml` déclare quatre
opérations, chacune portée par un hook du projet.

- **`dupliquer`** : la duplication d'une écriture entre deux dates, au
  pas choisi ; le formulaire `duplication` recueille le pas et les deux
  dates ; `commit: confirm`, la relecture affiche le nombre de créations.
  C'est le clone en hook (D776, D797).
- **`propager`** : le nouveau libellé et le nouveau montant, propagés
  aux écritures similaires ; le formulaire `propagation` ; la relecture
  avant le scellé.
- **`virer`** : le virement vers un compte cible, les deux écritures
  liées ; le formulaire `virement` ; la relecture.
- **`creer_releve`** : la tâche du relevé, sans bouton ni formulaire ;
  l'événement `generated` la déclenche, elle pose la date d'impression
  sur les écritures générées, `commit: auto`, sans relecture.

```yaml
# Les opérations de l'écriture. Chacune porte son libellé (label), le formulaire d'appel qui recueille ses paramètres
# (form) et son mode de validation (commit — confirm pour la relecture avant le scellé, auto sans relecture).

# La duplication entre deux dates
# Le pas et les deux dates ; la relecture affiche le nombre de créations.
dupliquer:
  label: { fr: Dupliquer, en: Duplicate, es: Duplicar }
  form: duplication
  commit: confirm

# La propagation aux similaires
# Le nouveau libellé et le nouveau montant, puis la liste, la sélection, la masse.
propager:
  label: { fr: Propager, en: Propagate, es: Propagar }
  form: propagation
  commit: confirm

# Le virement
# Le compte cible et le montant : les deux écritures liées.
virer:
  label: { fr: Virer, en: Transfer, es: Transferir }
  form: virement
  commit: confirm

# La tâche du relevé
# Déclenchée par toute génération ; elle pose la date d'impression sur les écritures générées, sans relecture.
creer_releve:
  when: generated
  commit: auto
```

Pour chacune, le cycle est le même (D594, D595) :

- `execute` : le hook remplit la transaction tenue ouverte ;
- `confirm` : le moteur présente le formulaire et le message ;
- `commit` : la transaction se scelle, l'issue est retournée ;
- `rollback` : la transaction se défait si l'utilisateur annule.

Et chacune a sa place dans les écrans (D1772, D1773) :

- `dupliquer`, `propager` et `virer`, au pied du formulaire de
  l'écriture et en colonnes de ses listes ;
- `creer_releve`, au menu, l'entrée `releve` du sous-menu des écritures.
