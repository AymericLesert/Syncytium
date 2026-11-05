# Les déclencheurs

*Ce qui déclenche une opération : l'acte, l'API, le calendrier, l'événement de données, l'événement de connecteur,
l'enchaînement.*

## Le sommaire

- [Les six déclencheurs](#les-six-déclencheurs)
- [Les déclencheurs par connecteur](#les-déclencheurs-par-connecteur)

## Les six déclencheurs

**Six déclencheurs** (D54, D106, D1747) : l'acte, l'API, le calendrier
par `every:`, l'événement de données par `when:`, une expression ou un
événement nommé, l'événement de connecteur par
`when: <connecteur>[.<entrée>]`, l'enchaînement par `actions:`
ou le wizard ; `every: continuous` est un événement de données, à
chaque mise à jour (D435) ; la relance depuis la supervision est le
geste de l'administrateur, pas un déclencheur (D88). *En proposition* :
les événements nommés sont les issues des opérations du socle, au
participe, `created`, `updated`, `deleted`, `generated`, `imported`,
`migrated`, `promoted`.

## Les déclencheurs par connecteur

**Les déclencheurs par connecteur** (D1720) :

- **l'entrant par le fichier** (D604) : le guetteur détecte, relit —
  la porte d'entrée ;
- **le déclenchement d'opération par connecteur** (D609) : « utile
  pour traiter des webhooks ou pour déclencher automatiquement un
  process d'import » — `when: <nom du connecteur>` *(en
  proposition)* sur l'opération déclarée :

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

- **le `when:` en abonnement** (D641) : posé à l'initialisation de
  l'application — le connecteur et éventuellement le point d'entrée
  attendu ; l'appel entrant (webhook) ou l'événement détecté (file)
  déclenche.
