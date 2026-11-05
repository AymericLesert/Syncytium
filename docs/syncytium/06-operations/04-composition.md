# La composition

*Une opération est une suite d'actions ; chaque action porte ses effets. Le wizard, la suite synchrone, est au
chapitre 4.*

## Le sommaire

- [La suite d'actions et les effets](#la-suite-dactions-et-les-effets)
- [Le wizard](#le-wizard)

## La suite d'actions et les effets

**Et la composition déclarative** : « une opération peut être une
liste d'opérations disponibles dans le socle » (D609) ; « ne se
construit pas dans la configuration » signifie *pas de code*.
**Le vocabulaire** (D1750) : « on garde "operation:" pour la
déclaration d'une suite d'actions, "action:" pour une étape d'une
opération, "task" pour une tâche exécutée suite à un déclencheur,
"procedure" pour les fiches de procédure ». **Une opération se déclare
comme une suite d'actions** : l'exécution de son hook, puis les effets
qui diffusent le résultat (D432, D1745, D1746) — `notify`,
l'information des utilisateurs ; `document`, l'édition ; `set`, la mise
à jour de données ; `webhook`, « pour déclencher une action sur une
application distante », par un connecteur `webhook` sortant — et
d'autres opérations, « à engager après la réalisation de l'action »,
exécutées de façon asynchrone, chacune une tâche de la file (D55).
La clé de la suite est `actions:` (D1751) ; **`effects:` reste, à l'action**
(D1752) : « pour une action, nous pouvons définir un effect qui se
déclenche sur la bonne exécution de l'action ». La forme est acquise
(D1753) : l'opération porte ses propres `effects:`, ceux de son hook ;
chaque action listée porte les siens ; `notify`, `document` et `set` s'exécutent au
commit, dans la transaction tenue ouverte (D594) ; une opération
appelée en action part après le commit, dans sa transaction, avec son
`execution:` ; les valeurs nommées que l'opération rend (D598)
nourrissent les gabarits et les paramètres des actions ; une action
asynchrone qui échoue ne défait pas l'opération, la supervision la
relance (D88). `function` n'est pas une action : une fonction est une
méthode d'un type (D1702), elle s'appelle dans une formule. **Le
`notify` sans destinataire remonte à tout le monde, dans la zone des
notifications de l'application ; le relais par mail est le choix de
chacun, dans son profil** (D1228, la lecture confirmée D1685 — « tout le monde » =
ceux qui voient l'entité, D334). **La documentation** d'une opération
composée est la liste de ses étapes, chacune avec la description de
son hook (D1227).

**L'extrait, inventé, validé** (D1752, D1753) — une opération, ses
effets, ses actions et leurs effets :

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

## Le wizard

**Le wizard, la même transaction** (D546–D547/D594 ; le wizard est décrit
au chapitre 4, ce chapitre n'en dit que l'opération, D1754) : les steps qui
portent une `operation:` s'exécutent **dans la transaction du
wizard, tenue ouverte au fil des étapes** — « la transformation
n'aura lieu qu'à la validation définitive du wizard » ; la
confirmation validée barre le retour (le cliquet — D505/D547) ;
l'abandon annule tout.
