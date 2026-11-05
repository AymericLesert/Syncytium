# Les déclencheurs

Une opération ne se déclenche pas que par un bouton. Ce fichier dit les
six déclencheurs, comment chacun s'écrit, et les montre dans le
véhicule, l'entrepôt et un exemple inventé.

## Le sommaire

- [Les six déclencheurs](#les-six-déclencheurs)
- [L'exemple du véhicule](#lexemple-du-véhicule)
- [L'exemple de l'entrepôt](#lexemple-de-lentrepôt)
- [Les déclencheurs par connecteur](#les-déclencheurs-par-connecteur)

## Les six déclencheurs

> **Un déclencheur** est ce qui lance une opération : l'acte de
> l'utilisateur, l'appel de l'API, le calendrier, l'événement de
> données, l'événement de connecteur, l'enchaînement
> ([glossaire](../../glossaire.md)).

Une opération se déclenche de six façons (D54, D106, D1747). Les deux
premières ne s'écrivent pas : la déclaration suffit. Les quatre autres
s'écrivent sur l'opération, par `every:`, `when:` ou `actions:`.

- **L'acte.** L'utilisateur clique : le bouton d'un formulaire, l'icône
  d'une colonne, le passage d'une étape de wizard. L'acte est un
  composant du chapitre 4, [l'acte](../04-composants/04-actes.md).
- **L'API.** Toute opération sans `when:` est aussi une fonction de
  l'API (D428). L'API déclenche et suit, le 202 et sa ressource de
  suivi, au chapitre 12 (D24).
- **Le calendrier.** `every:` planifie, dans la grammaire des durées et
  du calendaire, `5min`, `daily[02:00]`, `weekly[tuesday at 15:30]`,
  `monthly[1 at 03:00]` (D434, D476).
- **L'événement de données.** `when:` porte une expression, évaluée à
  chaque mise à jour de l'entité et déclenchée à la première vraie, au
  cliquet : si la condition redevient fausse, l'acquis se garde (D354,
  D428). `when:` porte aussi un événement nommé, `generated`, l'issue
  d'une génération (D796), `migrated`, l'issue d'une reprise.
  `every: continuous` est un événement de données, à chaque mise à jour
  (D435).
- **L'événement de connecteur.** `when: <connecteur>` ou
  `when: <connecteur>.<entrée>` abonne l'opération à un connecteur :
  le fichier détecté dans le dossier qu'un connecteur `file` écoute
  (D106, D604, D635), l'appel d'un point d'entrée qu'un connecteur
  `webhook` sert (D641). L'abonnement est posé à l'initialisation de
  l'application (D641) ; le webhook entrant est toujours authentifié
  (D642).
- **L'enchaînement.** Une opération en appelle d'autres par ses
  `actions:`, ou un wizard les enchaîne dans sa transaction (D1318),
  dans [la composition](04-composition.md).

La relance d'une tâche depuis la supervision est le geste de
l'administrateur, pas un déclencheur (D88). *En proposition* : les
événements nommés sont les issues des opérations du socle, au participe
anglais, `created`, `updated`, `deleted`, `generated`, `imported`,
`migrated`, `promoted`.

## L'exemple du véhicule

Dans le cas 3 (véhicule), `transport/vehicule/operations.yml` déclare
trois automatismes et un bouton :

# Les opérations du véhicule : le cycle de vie de l'échéancier, deux automatismes et un bouton. Une opération
# automatique porte son déclencheur (when), une expression évaluée à chaque mise à jour de l'entité et déclenchée à la
# première vraie, comme un cliquet ; le bouton n'a pas de when, et sa garde (if) le grise. La validation (commit) est
# auto, sans relecture, ou confirm, avec. Le hook est l'opération.

# La création de l'échéancier
# À la validation du financement : la validation est l'opération.
creer_echeancier:
  when: financement = credit or financement = loa
  commit: auto

# L'ajustement de l'échéancier
# Le bouton : le paramétrage modifié se reprend ; la relecture dit les échéances conservées, supprimées, recréées.
ajuster_echeancier:
  label: Ajuster l'échéancier
  if: (financement = credit or financement = loa) and statut != cloture
  commit: confirm

# La clôture de l'échéancier
# La clôture purge les échéances non payées ; le cliquet joue une fois.
clore_echeancier:
  when: statut = cloture
  commit: auto

# Le complément d'après-reprise
# L'issue de la migration est le déclencheur.
finaliser_vehicule:
  when: migrated
  commit: auto

`creer_echeancier` et `clore_echeancier` se déclenchent sur une
expression, au cliquet ; `finaliser_vehicule` sur l'événement nommé
`migrated` ; `ajuster_echeancier` est un bouton, gardé par `if`.

## L'exemple de l'entrepôt

Dans le cas 5 (entrepôt), `tiers/contact/contact.yml` planifie
l'anonymisation chaque mois :

```yaml
# Les opérations
# L'anonymisation des contacts des tiers inactifs depuis trois ans, chaque mois : le traitement d'appui du RGPD ; le
# responsable et la base légale viennent du projet, la finalité est la sienne.
operations:

  # L'anonymisation
  anonymiser:
    every: monthly[1 at 03:00]
    actions: [ rgpd.anonymize(owner.actif = false and owner.date_modification < context.now - 3y) ]
    rgpd:
      purpose: Effacer l'identité des contacts des tiers sortis de l'ERP depuis plus de trois ans
```

## Les déclencheurs par connecteur

Un connecteur `file` écoute un dossier au rythme de son `every:` ; un
connecteur `webhook` sert des points d'entrée (D604, D609, D641, D1720).
Dans
les deux cas, l'opération déclare son abonnement par `when:`. Aucun cas
n'en porte ; l'exemple est inventé :

```yaml
# Les opérations déclenchées par un connecteur
operations:
  archive_and_notify:
    when: incoming_orders          # l'événement du connecteur
    commit: auto
    actions:
      - import                     # l'import, une tâche après le commit
      - notify                     # l'information des utilisateurs
  import_order:
    when: orders_api.new_order     # l'abonnement au point d'entrée
    commit: auto
    actions: [ import ]
```

L'import, une action après le commit, est une tâche de la file ; le
`notify` informe les utilisateurs. Le connecteur, sa famille et ses
entrées sont au chapitre 5, [les familles](../05-connecteurs/04-familles.md).
