# Le cas 1 — les applications domestiques : le compte bancaire

*Le cadre du cas — la mise en situation (Q59/D756–D758) : le
contexte, les parcours, **la forme** (le dépôt écrit pour de vrai)
et **les manques** (chaque frottement devient une décision). Les
décisions citées renvoient à [../docs/conception.md](../docs/conception.md).*

## Le contexte (D758)

- **le foyer** accède au compte bancaire — l'application tourne
  **sur un poste du foyer**, **sans authentification** (« pas de
  secrets dans la famille ») ;
- **la genèse : 1987** — un des premiers développements personnels
  de l'auteur (la version 1 en Turbo Pascal, puis plusieurs vies —
  la dernière en Java) ; l'approche reste **simple et sobre** ;
- l'application gère **plusieurs comptes bancaires**, enregistre
  **les opérations faites et à venir** (l'anticipation du niveau de
  trésorerie), permet **la duplication d'une opération** sur
  plusieurs jours, semaines, mois ou trimestres, et **le pointage
  manuel** (une fois par mois ou de temps en temps — la date
  comptable se renseigne au pointage) ; **l'analyse est à la charge
  de l'utilisateur** ;
- la synthèse graphique existe (peu utilisée — « pas très
  esthétique ») ; **le souhait nouveau** : avec l'historique
  (les données les plus anciennes remontent à 1992), **visualiser
  l'évolution des répartitions des dépenses par budget**.

## Les données décrites

### Le compte bancaire

- le **numéro de compte**, le **libellé** ;
- la **date d'ouverture** — toujours précisée (antérieure ou
  postérieure à la date du jour) ;
- la **date de fermeture** ;
- la **devise** : FRF ou EUR ;
- **la règle** : un compte bancaire est ouvert **sans date de
  fermeture**.

### L'enregistrement (l'opération)

- le **compte bancaire** associé ;
- le **numéro d'opération** — masqué à l'utilisateur, le compteur
  automatique (D409) ;
- la **date de l'opération** ; la **date comptable** (celle de la
  banque) — renseignée **au moment du pointage** ;
- le **libellé** ;
- le **budget** — une valeur parmi une liste **dynamique** (l'ajout
  d'une valeur à la volée — la création directe D355) ;
- le **montant signé** (−10 pour une dépense de 10 €, +10 pour une
  ressource) ;
- le **mode de paiement figé** : CB, Prélèvement, Virement (vers
  éventuellement un autre compte), Autre (en général avec un numéro
  de chèque) ;
- le **lieu** (une ville) — la liste dynamique comme le budget.

### Les comportements

- **le solde en ligne** : chaque ligne de la liste affiche un solde —
  « le champ calculé de la somme des valeurs antérieures, de
  l'ouverture du compte à la date de l'écriture, **qui dépend de
  l'ordre du tri** » ;
- **le filtre** : une valeur libre sur le libellé, le budget ou le
  lieu ;
- **les tris** : uniquement la date d'opération, la date comptable,
  ou « sans date comptable » (les opérations non pointées) ;
- **le relevé mensuel** : l'impression entre deux dates au tri par
  date comptable ; pour une même date, le 2ᵉ tri est **le montant —
  de la plus grosse dépense à la ressource**, puis le numéro
  d'opération ;
- **l'impression** : un PDF du tableau (la date d'opération, la date
  comptable, le libellé, le budget, le lieu, le montant, le solde)
  entre deux dates — en général celles du relevé envoyé par la
  banque.

## Les données réelles

Deux fichiers CSV fournis (~23 400 lignes cumulées, **1992 → 2026**) :
les comptes ouverts (`budget.txt`) et les comptes clos
(`budget-clos.txt`) — **le même format** :

```text
Numero_Compte;Date_Operation;Date_Comptable;Designation;Budget;Debit;Credit;Nature;Devise;Lieu;Date_Impression
XXXXX-XXXXXXXX01;05/11/1998;05/11/1998;Retrait liquidité;DIVERS;200.0;;Guichet;F;;
XXXXX-XXXXXXXX01;15/12/2009;15/12/2009;Cotisation mensuelle;RETRAITE;;95.0;VIREMENT;E;HERICOURT;
```

Les observations sur le réel (la matière du mapping — D646+) :

- le CSV au point-virgule, **l'encodage Windows-1252**, les dates
  `jj/mm/aaaa`, le point décimal ;
- **`Debit`/`Credit` en deux colonnes** — la spécification cible dit
  **un montant signé** : la conversion au mapping ;
- **la `Nature` est mixte** : `CB` (~6 500), `PRELEVEMENT` (~3 300),
  `Chèque`, `VIREMENT`, `VIREMENT-<référence>`, `Espèce`,
  `OUVERTURE`, ou **un numéro de chèque nu** — la cible sépare le
  mode figé et le numéro ;
- **`Date_Impression`** : le marqueur du relevé imprimé ;
- **81 budgets distincts** ; les devises `F`/`E` ;
- la première ligne d'un compte est l'`OUVERTURE`.

## Les questions ouvertes (posées à l'auteur)

1. le sans-authentification face à D692/D699 — le frottement
   fondateur du cas ;
2. le montant signé (la cible) contre Débit/Crédit (la source) — la
   conversion au mapping, à confirmer ;
3. la `Nature` mixte → le mode figé + le numéro de chèque, et le
   sort de `Guichet`/`Espèce`/`OUVERTURE` ;
4. le virement vers un autre compte : une écriture référençant la
   cible, ou deux écritures liées (le miroir) ?
5. le solde dépendant du tri — le cumul de fenêtre : un manque
   potentiel du catalogue des calculés ;
6. FRF/EUR : la conversion des synthèses historiques ;
7. `Date_Impression` : reprise telle quelle ou dérivée du relevé ;
8. « Propager les modifications » (le dialogue existant) : la
   portée ;
9. la duplication : le geste (jusqu'à une date de fin ? le nombre) ;
10. l'ancien format (1992–2011) : les fichiers trouvés partagent un
    format unique — l'ancien format distinct existe-t-il encore ?

## La forme — le dépôt

*(à écrire morceau par morceau — le protocole D457/D756)*

## Les manques relevés

*(chaque frottement = une décision consignée)*
