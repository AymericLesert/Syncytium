# La déclaration

*Où et comment une opération se déclare sur une entité : le bloc `operations:`, ses clés, les portées, le
`commit:`, l'exemple de la banque.*

## Le sommaire

- [Le pont entre le hook et la déclaration](#le-pont-entre-le-hook-et-la-déclaration)
- [Les portées et le commit](#les-portées-et-le-commit)
- [L'exemple de la banque](#lexemple-de-la-banque)

## Le pont entre le hook et la déclaration

**Le pont hook/déclaration (D609)** : le hook **est** l'opération ;
la déclaration (`operations:` — D432) en décrit **l'usage** — le nom,
les paramètres, le `commit:`, la garde `if` (D430), **le formulaire
d'appel** (`form:` — D775 : les champs du formulaire sont les
paramètres du hook, **la validation du formulaire est l'opération** ;
la symétrie avec le confirm D600 — le formulaire aux deux bouts), et
**le mode de déclenchement quand il n'est pas lié à l'IHM** : `when:
<expression>` (D428 ; l'événement `generated`, émis à toute
génération, D796 — `creer_releve` de la banque s'y déclenche),
`every: continuous` (D435 — sur une mise à
jour), le calendaire (D434), **l'événement de connecteur** (les
webhooks, l'import automatique à la réception d'un fichier —
`when: <connecteur>[.<point d'entrée>]`, **un abonnement posé à
l'initialisation de l'application** — D641 ; le webhook entrant
s'authentifie obligatoirement — D642). L'IHM lie sans
déclaration (le bouton, la colonne, les actions, le step, le menu).
## Les portées et le commit

Les cinq portées (D570) : l'enregistrement, la liste, la sélection,
le module, l'application. `commit: auto | confirm` à la déclaration
(D596). L'opération voit **la pile des contextes** (D553) et peut
appeler une fonction — jamais l'inverse (D571).

## L'exemple de la banque

**L'exemple** — la déclaration, dans l'entité, référence le hook par
son nom (D432, D609). Dans le cas 4 (banque),
`banque/ecriture/operations.yml` :

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

Le `commit:` a une forme riche, `{ mode:, form:, message: }` (D600,
D1606) : `mode:`, `auto` ou `confirm` ; `form:`, le formulaire de la
relecture ; `message:`, un gabarit nourri des valeurs nommées que
l'opération rend (D598), `{nb_creations} factures créées`.
`commit: confirm` en est le raccourci ; sans `form:` ni `message:`, le
formulaire par défaut, `record`, s'ouvre en lecture seule (D1645). Le
wizard porte le même `commit:` (D1652). La déclaration porte encore,
au besoin, `scope:`, l'une des cinq portées (D570) ; `uses:`, les
connecteurs de l'environnement que le hook attend sous les noms de son
contrat (D913, D617) ; `cooldown:` et `retention:`, l'anti-rejeu de
l'API et la durée de consultation du résultat, dont les défauts sont
des paramètres d'administration (D904, D906). Le hook `dupliquer`
(le code) exécute dans la transaction tenue ouverte ; `confirm`
laisse le moteur présenter le formulaire et le message ; `commit`
scelle et retourne l'issue ; `rollback` défait si l'utilisateur
annule (D594–D595). `dupliquer` est le clone en hook (D776, D797).
