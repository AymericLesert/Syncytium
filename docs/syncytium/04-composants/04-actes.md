# L'acte

> **Un acte** est le composant qui déclenche une opération : le bouton,
> l'icône, le passage d'étape d'un wizard. L'utilisateur acte, Syncytium
> exécute ([glossaire](../../glossaire.md)).

Les opérations d'une entité sont déclarées dans son bloc `operations:`
([le modèle](../02-modele/02-entite.md)). L'acte est la façon de les
appeler depuis une surface. Il n'a qu'une fiche : `operation`.

## `operation`

**Nom et famille.** `operation`, l'acte. Dans les items d'une surface,
il s'écrit `operation[<nom>]`, comme `field[<nom>]` et
`template[<nom>]` (D460, D483, D511). Sa forme se déduit de l'endroit où
il est placé.

**Rôle.** « L'utilisateur acte une opération » (D456). C'est le geste
qui engage : le bouton d'un formulaire, l'icône d'une colonne, le passage
d'une étape.

**Types servis.** Les opérations du bloc `operations:` (D432). Une
opération sans `when:` est un bouton et une fonction de l'API (D428). Le
changement d'état du graphe en est une aussi, servie par le catalogue
par défaut (D425–D427, D433). Dès qu'un écran est déclaré, une opération
n'y apparaît que là où un acte la place : `operation[<nom>]` dans les
items d'un formulaire, son nom nu dans les colonnes d'une liste ; sans
déclaration, elle n'apparaît pas (D1772). La banque place `dupliquer`,
`propager` et `virer` au pied de son formulaire et dans ses listes.

**Contexte consommé.** L'acte lit :

- l'opération : sa garde `if` (D430), ses droits (D196), son `commit:`
  (D431, D596) ;
- la pile des contextes (D553), « l'ensemble des contextes qui se sont
  empilés jusqu'à l'usage de l'opération » : le périmètre de la liste,
  l'enregistrement du formulaire, le transitoire du wizard ; l'origine
  de l'appel est la pile entière (D455) ;
- l'enregistrement, ou la sélection pour une opération de masse (D446) ;
- la transaction tenue ouverte (D594) : ce que l'opération y a mis,
  chiffré pour la relecture.

**Propriétés.** L'acte surcharge la présentation de l'opération :

- `label:` et `icon:` ;
- `style:`, la typographie de son libellé, comme pour tout composant
  (D536, D1610) ;
- `commit:`, le mode de validation. `confirm` est le défaut : la
  relecture avant d'engager (D431, D596). `auto` valide sans relecture.
  La forme riche est `commit: { mode:, form:, message: }` (D600, D1606) ;
  `commit: confirm` en est le raccourci. Avec `form:`, la relecture se
  fait au formulaire nommé. Avec `message:` seul, une boîte de dialogue
  suffit (D601). Sans l'un ni l'autre, le formulaire par défaut s'ouvre
  en lecture seule (D196, D431). Le message est un gabarit, nourri de la
  transaction active (D511, D594) : `{invoices} factures seront créées`.

**Items.** Aucun.

**Modes et déclinaisons.** L'endroit fait le visage :

- dans un formulaire, le bouton ;
- dans une colonne de liste, l'icône à trois états (D444) ; la colonne
  porte le nom nu de l'opération (D462) ;
- dans un wizard, le passage d'étape, l'avance gardée (D504, D505) ;
- dans le menu, l'adresse `<module>.<entité>.<opération>` (D439) ;
- dans un template, jamais : le papier n'agit pas.

La transaction est tenue ouverte (D594, D1607). L'opération la remplit,
`execute`. La relecture en montre le contenu, `confirm`. Valider la
scelle, `commit`. Annuler la défait, `rollback` (D595).

**États et interactions.** L'acte a trois états (D444) :

- actionnable ;
- non actionnable : la garde grise le bouton, et l'API refuse proprement
  (D430) ;
- non visible : les droits (D196) ou la confidentialité le masquent.

La relecture précède l'engagement : le formulaire en lecture seule, puis
confirmer ou annuler (D196, D431). Il n'y a jamais de popup du
navigateur. La boîte de dialogue de l'application est une fenêtre
assumée, celle du message seul (D601, D1605). L'exécution est
`synchronous`, `asynchronous` ou `await` (D436).

**Décisions fondatrices.** D196, D425–D433, D436, D439, D444, D446,
D456, D460, D462, D504–D505, D511, D553, D594–D596, D600–D601, D1605–D1607.

**Exemple de configuration.** Dans le cas 4 (banque),
`04_banque/versions/beta/v1.0.0.0/banque/ecriture/operations.yml` :

```yaml
# La duplication entre deux dates
# Le pas et les deux dates ; la relecture affiche le nombre de créations.
dupliquer:
  label: { fr: Dupliquer, en: Duplicate, es: Duplicar }
  form: duplication
  commit: confirm
```

Les autres propriétés, sur un exemple :

```yaml
# L'opération de facturation : sa validation et ses effets
operations:

  # La facturation
  invoice:
    # La validation : la relecture, avec un message nourri de la transaction
    commit:
      mode: confirm
      message: { fr: "{invoices} factures seront créées" }

    # Les actions : l'opération qui crée les factures, après le commit
    actions:
      - create_invoices

# L'interface : le bouton au pied du formulaire, l'icône en colonne de la liste
gui:

  # Le formulaire
  forms:
    record:
      footer:
        items:
          - operation[invoice]:
              # L'icône du bouton, une ressource
              icon: invoice

  # La liste : la colonne invoice porte l'icône à trois états
  lists:
    main:
      columns: [number, customer, invoice]
```
