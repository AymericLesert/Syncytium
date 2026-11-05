# La composition

Une opération fait rarement une seule chose. Ce fichier dit comment elle
enchaîne ses actions, comment chaque action diffuse son résultat par ses
effets, et ce qu'est le wizard, la suite synchrone.

## Le sommaire

- [La suite d'actions](#la-suite-dactions)
- [Les effets](#les-effets)
- [L'exemple](#lexemple)
- [Le wizard](#le-wizard)

## La suite d'actions

> **Une action** est une étape d'une opération : l'exécution du hook,
> une notification, une édition, une mise à jour, un webhook sortant, ou
> une autre opération. Une opération se déclare comme une suite
> d'actions ([glossaire](../../glossaire.md)).

« Une opération peut être une liste d'opérations disponibles dans le
socle » (D609). « Ne se construit pas dans la configuration » signifie
sans code : l'enchaînement de références est déclaratif. Une opération
se déclare comme une suite d'actions (D1750) : l'exécution de son hook,
puis les effets qui diffusent le résultat, puis d'autres opérations.

`actions:` porte la liste des opérations à engager après la réalisation
de l'opération (D1745, D1751). Chacune part après le commit, dans sa
propre transaction, avec son `execution:` ; chacune est une tâche de la
file (D55). Les valeurs nommées que l'opération rend, `nb_creations`,
`nb_updates` (D598), nourrissent leurs paramètres. Une action qui échoue
ne défait pas l'opération : la supervision la relance (D88). Une
fonction n'est pas une action : c'est une méthode d'un type, elle
s'appelle dans une formule (D1702).

## Les effets

`effects:` diffuse le résultat d'une action, sur sa bonne exécution
(D432, D1752). Cinq natures (D1745, D1746) :

- **`notify`**, l'information des utilisateurs ; sans destinataire, la
  notification remonte à tous ceux qui voient l'entité, dans la zone
  des notifications de l'application, et le relais par mail est le
  choix de chacun, dans son profil (D1228, D334) ;
- **`document`**, l'édition d'un document par son gabarit, vers le PDF,
  le Word, l'Excel ou le mail (D564) ;
- **`set`**, la mise à jour de données, un champ et sa valeur ;
- **`webhook`**, « pour déclencher une action sur une application
  distante », par un connecteur `webhook` sortant (D1746) ;
- une autre opération, par `actions:`.

L'opération porte ses propres `effects:`, ceux de son hook ; chaque
action listée porte les siens (D1753). `set` et `document` s'exécutent
au commit, dans la transaction tenue ouverte (D594) ; `notify` et
`webhook` partent après le scellé. Les effets s'écrivent en carte, dans
l'ordre d'écriture.

## L'exemple

L'exemple est inventé, aucun cas n'enchaîne encore d'actions avec leurs
effets (D1753) :

```yaml
# Les opérations de la commande de vente
# Chacune est une suite d'actions ; une action porte ses effets, déclenchés sur sa bonne exécution.

# L'expédition
# Le hook expedier sort les articles du stock ; sur sa bonne exécution, la commande passe à expédiée et le bon de
# livraison s'édite ; puis la facturation s'engage, après le commit, et, sur sa bonne exécution, le client et le
# transporteur sont prévenus.
expedier:
  label: { fr: Expédier, en: Ship }
  form: expedition
  commit: confirm

  # Les effets de l'opération elle-même, sur sa bonne exécution
  effects:
    set: { statut: expediee }
    document: bon_de_livraison

  # Les actions qui suivent, après le commit, chacune avec ses effets
  actions:
    - facturer:
        effects:
          notify: { to: client, message: { fr: "Votre commande {numero} est expédiée." } }
          webhook: transporteur
```

Dans le cas 5 (entrepôt), `anonymiser` appelle une action avec son
paramètre, `rgpd.anonymize(…)`, montrée dans
[les déclencheurs](03-declencheurs.md) ; dans le cas 3 (véhicule),
`notifier` n'a qu'une action, `notify`.

## Le wizard

Le wizard est la suite synchrone (D1318). Les étapes qui portent une
`operation:` s'exécutent dans la transaction du wizard, tenue ouverte au
fil des étapes : « la transformation n'aura lieu qu'à la validation
définitive du wizard » (D546, D547). La confirmation validée barre le
retour, le cliquet (D505) ; l'abandon annule tout. Le wizard porte le
même `commit:` qu'une opération (D1652). Il est décrit au chapitre 4,
[les surfaces](../04-composants/06-surfaces.md#wizard) (D1754).

Une opération composée se documente par la liste de ses étapes, chacune
avec la description de son hook (D1227).
