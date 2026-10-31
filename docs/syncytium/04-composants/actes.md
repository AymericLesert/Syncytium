# Les actes

## `operation` (l'acte)

1. **Nom et famille** — l'acte, **une fiche unique** : en items,
   **`operation[<nom>]`** — « pour être en phase avec les fields »
   (D511, l'écho de `field[<nom>]` D460 et `template[<nom>]` D483) ;
   la matérialisation se déduit de l'habitat ;
2. **Rôle** — **« l'utilisateur acte une opération »** (D456) : le
   geste qui engage — le bouton, l'icône, le passage d'étape ;
3. **Types servis** — les opérations du bloc `operations:` (D432 —
   sans `when` : le bouton / la fonction API, D428) ; le changement
   d'état du graphe (D425–D427, l'opération du catalogue par défaut —
   D433) ;
4. **Contexte consommé** — l'opération : sa garde (`if` — D430), ses
   droits (D196), son `commit:` (D431/D596) ; **la pile des
   contextes**
   (D553) — « l'ensemble des contextes qui se sont empilés jusqu'à
   l'usage de l'opération » : le périmètre de la liste,
   l'enregistrement du formulaire, le transitoire du wizard —
   l'origine de l'appel (D455) est la pile entière ;
   l'enregistrement ou la sélection (l'opération de masse — D446) ;
   **la transaction tenue ouverte** (D594) — ce que l'opération y a
   mis, chiffré pour la relecture ;
5. **Propriétés** — la surcharge de la présentation : `label:`,
   `icon:`, `style:` (la typographie de son libellé, comme tout
   composant — D536, D1610) ;
   **`commit:`** — `confirm` (défaut — la relecture D431/D596) ou
   `auto` (la validation automatique) ; **la forme riche**,
   `commit: { mode:, form:, message: }` (D600, D1606) — `commit:
   confirm` en est le raccourci, `{ mode: confirm }` ; avec `form:`, la
   relecture au formulaire nommé ; avec `message:` seul, la boîte de
   dialogue (D601) ; sans l'un ni l'autre, le formulaire par défaut en
   lecture seule (D196, D431) ; **le message au gabarit nourri de la
   transaction active** (D511/D594) : `commit: { mode: confirm,
   message: { fr: "{invoices} factures seront créées" } }` ;
6. **Items** — aucun ;
7. **Modes et déclinaisons** — **l'habitat fait le visage** : le
   formulaire → **le bouton** ; la colonne de liste → **l'icône à
   trois états** (D444, le verbe au nom nu — D462) ; le wizard → **le
   passage d'étape** (D504–D505, l'avance gardée) ; le menu →
   l'adresse `<module>.<entité>.<opération>` (D439) ; **la
   transaction tenue ouverte** (D594, D1607) : l'opération la remplit
   (`execute`), la relecture en montre le contenu (`confirm`), valider
   la scelle (`commit`), annuler la défait (`rollback` — D595) ;
   template : jamais (le papier n'agit pas) ;
8. **États et interactions** — **les trois états** (D444) :
   actionnable / **non actionnable** (la garde grise le bouton, l'API
   refuse proprement — D430) / **non visible** (les droits D196, la
   confidentialité) ; la relecture avant engagement (D431 — lecture
   seule + confirmer/annuler — D196) ; **jamais de popup du
   navigateur** : la boîte de dialogue de l'application est une fenêtre
   assumée, celle du message seul (D601, D1605) ; l'exécution
   `synchronous`/`asynchronous`/`await` (D436) ;
9. **Décisions fondatrices** — D196, D425–D433, D436, D439, D444,
   D446, D456, D460, D462, D504–D505, D511, D553 ;
10. **Exemple de configuration** —

Dans le cas 4 (banque), `04_banque/versions/beta/v1.0.0.0/banque/ecriture/operations.yml` :

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
# sales/entities/order.yml
operations:
  invoice:
    commit:
      mode: confirm
      message: { fr: "{invoices} factures seront créées" }  # le gabarit — la transaction nourrit (D511/D596)
    effects:
      - function: create_invoices

gui:
  forms:
    record:
      footer:
        items:
          - operation[invoice]:        # le bouton au formulaire (D511)
              icon: invoice
  lists:
    main:
      columns: [number, customer, invoice]   # l'icône à trois états (D444/D462)
```
