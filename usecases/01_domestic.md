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

## Les arbitrages du cadrage (D759–D760 et les réponses de l'auteur)

1. **le sans-authentification** → **la classe `none`** (D759) :
   l'utilisateur et le groupe par défaut au degré `administrator` —
   les invariants pré-remplis, jamais contournés ;
2. **le solde en ligne** → **pas un manque** (D760) : l'enfant
   accède à son possesseur — le mot-clé **`owner`** (en
   proposition) + l'agrégat de la collection (D580) :
   `owner.operations.sum(amount if date <= me.date)` ;
3. **le virement** = **deux écritures liées** par la référence
   `VIREMENT-<référence>` ;
4. **`Guichet`** → le virement ; **l'espèce n'est pas suivie** dans
   l'application (le retrait est une dépense, le cash vit sa vie) ;
   le reste de la `Nature` mixte → le mode figé + le numéro de
   chèque ;
5. **les FRF demeurent tels quels** dans l'historique (antérieurs à
   1999) — la devise vit au compte, pas de conversion ;
6. **la duplication est générée entre deux dates** (au pas choisi :
   jour, semaine, mois, trimestre) ;
7. **« Propager les modifications »** : modifie **les opérations
   suivantes** — le libellé et le montant ;
8. **l'ancien format n'existe plus** (la vieille application seule
   le lisait) — la reprise porte sur les deux fichiers au format
   unique. *(La nostalgie de l'auteur est consignée ;-))*

## La forme — le dépôt

Le dépôt vit dans
[`examples/01_domestic/`](../examples/01_domestic/) — écrit morceau
par morceau (le protocole D457/D756), chaque morceau validé par
l'auteur.

**Le morceau 1 — la racine et l'environnement** (validé) :
`syncytium.yml` (l'entrée D322) et `environments/home.yml` —
l'environnement unique du poste du foyer : le storage `sqlite`
(D729), l'authentification `none` (D759), le smtp `none` (D763) ;
la réplication `disabled` par défaut (D725), rien à écrire.

**Le morceau 2 — le module et les entités** (validé) :
`modules.yml` → `banque/module.yml` (la chaîne par fichiers —
D765/D766) → les quatre entités **en français** (D764) : `compte`
(l'identité `numero`, `ouvert` calculé — « la règle » devenue
définition, la composition `ecritures`), `ecriture` (le compteur
masqué, les dates opération/comptable, le `decimal` signé, le mode
aux quatre valeurs, `liee:` — le miroir du virement, `imprimee`, le
`solde` par `owner` — D760), `budget` et `lieu` (les référentiels à
création directe D355). **Le modèle est arrêté** (D773) — les
raffinements de la relecture : le montant en `amount` aux devises
EUR/FRF (D771 — la devise vit dans la valeur), les calculés
`montant_euro`/`montant_franc` en amount à devise unique et le
solde continu (D770–D772 — `montant.value`/`montant.currency`, le
constructeur D659), le fichier d'entrée aux liens (D767), les
chemins relatifs (D768), la chaîne modules.yml → module.yml →
entités (D765–D766).

**Le morceau 3 — les opérations** (validé) :

- **le pointage** — la liste « sans date comptable » + l'édition en
  ligne (D205), l'opération de masse « pointer » (D446) ;
- **le virement** — le hook crée les deux écritures liées (`liee:`)
  dans la même transaction (D594) ;
- **`clone`** (D774) — la duplication entre deux dates au pas choisi
  (l'ex-« dupliquer ») ;
- **la propagation** (D774) — **sans lien** : les similaires par les
  valeurs d'avant (le même libellé ET le même montant, la date ≥
  celle de la modifiée), le déroulé liste → sélection → masse
  validée ; l'enchaînement fondateur : le clone suivi de la
  modification avant validation (la transaction tenue ouverte).

Les hooks du projet (D776 — le socle reste à 19) vivent dans la
maison à deux étages (D777–D778) : `hooks.yml` →
`hooks/operations.yml` (le mapping `code:`/`properties:`) → le code
et **le md du fonctionnement par hook** (la doc auto-générée D645) ;
le bloc `operations:` d'`ecriture.yml` déclare l'usage (D609) —
`clone`/`propager`/`virer` au `form:` d'appel (D775) et au
`commit: confirm`.

**Le morceau 4 — les surfaces** (en cours) : **la liste des
écritures soldée** (D779–D783) — les trois listes en entier (la
partition `!= null`/`= null`, le relevé sur la seule par_comptable),
la zone de recherche déclarée (le compte mono obligatoire, la plage
`input: range`, la `recherche` mutualisée au modèle D780), les
calculés d'affichage débit/crédit, le montant modifié par la ligne,
les boutons [add]/[trash]/[copy]/[PDF] et les touches Entrée/Suppr.
**Les formulaires soldés** (D785–D790) : le formulaire `record` aux
cinq usages (D199/D788) — les titres au gabarit par mode d'ouverture
(D789–D790), les steppers du date (D785), le `visible:` vivant du
chèque, les pickers à création directe ; le `post:`/[*] écarté
(D787 — la simplicité prime) ; **les trois formulaires d'appel**
(clonage, propagation, virement — D775) aux items en champs libres.
**Le relevé sans template à écrire** (D791–D792) : le bouton [PDF]
= `generate(me, PDF)` — l'opération du socle sur le contexte
courant ; **toute liste porte son template de base** (l'A4 portrait :
le titre, le tableau aux entêtes répétés et au pied comptant les
lignes, le pied de page n°/total) — le cas 1 ne surcharge pas.
Reste : le graphique (l'évolution des budgets depuis 1992).

## Les manques relevés

- **le formulaire d'appel d'une opération** — le frottement révélé
  par le clone (le pas, les deux dates) et le virement (le compte
  cible) : la saisie avant `execute` manquait au socle → **résolu
  par D775** : l'opération porte `form:`, **la validation du
  formulaire est l'opération** — la symétrie avec le confirm
  (D600) ;
- *(chaque frottement suivant = une décision consignée)*
