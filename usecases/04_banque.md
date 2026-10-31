# Le cas 4 — les applications domestiques : le compte bancaire

*(D1101 : la banque parlera trois langues — `languages: [fr, en, es]` — et portera chacun de ses textes par langue ; l'exemple multilingue de l'échelle, à sa relecture.)*

*Le cadre du cas — la mise en situation (Q59/D756–D758) : le
contexte, les parcours, **la forme** (le dépôt écrit pour de vrai)
et **les manques** (chaque frottement devient une décision). Les
décisions citées renvoient à [../docs/conception.md](../docs/conception.md).*

*Le domestique compte deux maisons, alignées un cas = un exemple
(D827 ; le cas 2 devenu le cas 4, D1027) : **la maintenance des véhicules** —
[03_vehicule.md](03_vehicule.md), le plus simple — et ce fichier,
le compte bancaire.*

## Le contexte (D758)

- **le foyer** accède au compte bancaire — l'application tourne
  **sur un poste informatique du foyer**, **sans authentification** (« pas de
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
[`examples/04_banque/`](../examples/04_banque/) — écrit morceau
par morceau (le protocole D457/D756), chaque morceau validé par
l'auteur.

**Le morceau 1 — la racine et l'environnement** (validé) :
`syncytium.yml` (l'entrée D322) et `environments/home.yml` —
l'environnement unique du poste informatique du foyer : le storage `sqlite`
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
partition `is not null`/`is null`, le relevé sur la seule par_comptable),
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
= `exports: [ pdf ]` — le format seul, le modèle de base de la liste
(D1601) ; **toute liste porte son template de base** (l'A4 portrait :
le titre, le tableau aux entêtes répétés et au pied comptant les
lignes, le pied de page n°/total) — le cas 3 ne surcharge pas.
**Le graphique écrit** (D798) : le `chart.line` — X au mois
(`date_operation[month]`), Y au montant cumulé (`sum(montant_euro)`),
les deux filtres au patron des listes (le budget, la plage de
dates). **Le morceau 4 (les surfaces) est soldé** — avec la
relecture des opérations (D797 : l'opération est un verbe, le même
nom des deux côtés, le formulaire reste un nom de chose ; l'événement
`generated` D796 ; le tri partagé liste/relevé D793/D795).

**La relecture de l'auteur (24/08 — D799–D810)** : le dépôt
restructuré de sa main, l'audit rendu, les arbitrages consignés —
**l'arborescence pleine actée** (D799 : syncytium.yml →
environments/ + versions/ → le statut → la version, l'application
entière dans la version), la journalisation cadrée (D800 —
l'exemple Python non acté), la mise à niveau au chargement sans
redémarrage (D801), le visage à l'interpolation `${name}` (D802),
resources/ versionné au crédit déclaré (D803), les statuts
implicites déclarés à l'usage (D804), pas de déclaration orpheline
(D805 — le statut porte `environment:`), le pattern regex = une
déclaration (D806), le nommage et l'organisation libres (D807 —
l'éponyme = une convention), `release-notes:` à l'historique par
concaténation (D808), la fiche du hook (D809 —
name/description/code/properties), `description:` partout (D810).

**Le morceau R1 — la reprise écrite (D811–D813, en validation)** :
les trois questions tranchées sur le réel — **les marqueurs
OUVERTURE/FERMETURE** portent l'ouverture, la clôture ET le libellé
du compte (D811 — le marqueur fait foi, pas le fichier ; douze
marqueurs à montant réel migrent en écritures ; les deux budgets
naissent inactifs, la sélection = les actifs seuls) ; **la liaison
des virements** par l'identifiant extrait (D812 — 402 paires
parfaites, 1 249 orphelines assumées, aucun triplet) ; **le montant
normalisé + le constructeur** (D813 — `enum { E, F }` en garde,
`round(…, 2)` contre les poussières flottantes du legacy). Le dépôt
porte la reprise : le connecteur `legacy` (storage csv,
Windows-1252, point-virgule), `reprise/` déclaré par `version.yml`
(`migrations:`) — la migration `mode: absolute` + `reset: true`,
`source/` à l'entité unique `budget` — les deux fichiers au même
format portés par le même connecteur — la carte `entities:` au
niveau du connecteur (D816/D828), les
cinq calculés de normalisation (D660) —, `mapping/` en **trois
phases** (D814 — la phase = la règle filtrée, l'ordre = le préfixe,
huit règles `001`–`008` depuis D821) : la phase 1 crée les comptes par le
marqueur OUVERTURE et pose l'écriture du dépôt ; la phase 2 porte
les référentiels et les écritures **hors marqueurs** —
OUVERTURE/FERMETURE n'entrent pas au référentiel ; la phase 3 pose
l'écriture du solde **puis** clôt les comptes par FERMETURE en
**mise à jour par la clé fonctionnelle** (D654) — le solde sur le
compte encore ouvert, la clôture en dernier geste (D815) ; les
écritures des marqueurs au libellé conventionnel « Dépôt initial » /
« Solde de clôture » (D815). **Le libellé de
la cible élargi à 100** (le réel monte à 93 caractères — 163 lignes
au-delà de 60). **Le morceau R1 est soldé pièce à pièce** : la carte
entités → fichiers au connecteur (D819/D828), le `mask` à la
lecture (D820), et **le
rapprochement remis à plat par l'auteur (D821)** — les deux phases
par le cache nommé de la migration : la règle empile
(`operations: cache.push`), la règle de complément associe
(`liee: cache.pop(nom, clé) if cache.size(nom, clé) > 1` — D822),
**le FILO croise les miroirs** (la première relue dépile la seconde
empilée), la garde `size > 1` écarte l'orphelin ; **le miroir
reçoit sa référence en retour par l'affectation au chemin**
(`me.liee.liee : me` — D823, les deux côtés portés comme au hook
virer) ; la maison à huit règles (`006_ecritures_liees`, `007_soldes`, `008_clotures`).
Les deux dernières miettes sont soldées (D824) : le mode `autre`
acté, et **les écritures de dépôt/solde portent les budgets
marqueurs** — OUVERTURE/FERMETURE entrent au référentiel, leur
usage gardé par **la validation de l'entité** (la date d'opération
doit être l'ouverture ou la clôture du compte — l'évaluation au
scellé D594, l'écriture en proposition). Et la dernière pièce est actée (D825) : **la règle
sans clé** — `key:` optionnelle, la règle création seule (le réel :
54 doublons du quintuple, aucune clé naturelle), la garde à
l'ingestion (`mode: relative` ou le rejeu sans `reset` exigent la
clé). **Le morceau R1 est clos — quinze décisions (D811–D825), la
reprise écrite de bout en bout.**

## Les manques relevés

- **le formulaire d'appel d'une opération** — le frottement révélé
  par le clone (le pas, les deux dates) et le virement (le compte
  cible) : la saisie avant `execute` manquait au socle → **résolu
  par D775** : l'opération porte `form:`, **la validation du
  formulaire est l'opération** — la symétrie avec le confirm
  (D600) ;
- *(chaque frottement suivant = une décision consignée)*
- **neuf descriptions de la reprise en français seul** — relevées par
  `tools/completeness.py` le 25/10/2026 (D1502) : les `description:`
  des huit règles de `reprise/mapping/001_comptes.yml` à
  `008_clotures.yml` et de la source `reprise/source/budget.yml`, dans
  une version à trois langues ; **la description de la reprise est un
  texte par langue** (D1517) → **écrites le 26/10/2026 (D1522)** : l'outil
  en listait vingt-six en vrai — les huit règles, l'entité source et ses
  seize colonnes, la description de l'icône —, toutes en anglais et en
  espagnol, le français inchangé ; le crédit de l'icône aussi — « le
  crédit se traduit aussi » (D1523) : plus aucun défaut d'ingestion ;

## La documentation générée — le chapitre des personas (le rang 1, étape 5 — D1200–D1209)

*(la déclinaison de §22 de documentation.md sur la banque, le second
cas choisi par D1207 — écrite le 11/10/2026 sur le patron du véhicule
(D1209), **validée par D1210** ; ce que la banque montre en plus : **les
trois langues** sur `title:` et `description:` (D1202) et **les
opérations à formulaire d'appel** ; le prénom, les rôles, les scénarios
sont miens, acquis tels qu'écrits)*

**Ce que la configuration ajoute.** Le mono-poste déclare son groupe
(D1208) : un `groups.yml` à la version, le groupe `foyer`, son persona
(D1200) — le prénom invariant, le rôle et la description par langue
(D1101) ; un `documentation.yml` avec quatre scénarios écrits, chacun
son `title:` par langue et sa `description:` par langue — un fichier
Markdown par langue (D1202) ; douze fichiers sous
`documentation/scenarios/foyer/`. La banque n'a aucun wizard : la part
générée est le tour (D1201) ; les trois opérations à bouton —
dupliquer, propager, virer — et l'automatisme du relevé se lisent dans
les scénarios écrits.

```yaml
# groups.yml — le groupe du foyer (D1208), le persona par langue
foyer:
  label: { fr: Le foyer, en: The household, es: El hogar }
  description:
    fr: Les membres du foyer — tous les droits sur les comptes.
    en: The household members — full rights on the accounts.
    es: Los miembros del hogar — todos los derechos sobre las cuentas.
  persona:
    name: Léa
    role: { fr: Gestionnaire des comptes du foyer, en: Household accounts manager, es: Gestora de las cuentas del hogar }
    description:
      fr: Elle tient les comptes du foyer — la saisie des écritures, le pointage du relevé, les virements, les budgets.
      en: She keeps the household accounts — entering transactions, reconciling the statement, transfers, budgets.
      es: Lleva las cuentas del hogar — el registro de apuntes, el punteo del extracto, las transferencias, los presupuestos.
```

```yaml
# versions/beta/v1.0.0.0/documentation.yml — les scénarios écrits, par langue (D1202)
scenarios:
  foyer:
    pointage:
      title: { fr: Pointer le relevé bancaire, en: Reconcile the bank statement, es: Puntear el extracto bancario }
      description:
        fr: ~{documentation/scenarios/foyer/pointage.fr.md}
        en: ~{documentation/scenarios/foyer/pointage.en.md}
        es: ~{documentation/scenarios/foyer/pointage.es.md}
    recurrente:
      title: { fr: Dupliquer une écriture récurrente, en: Duplicate a recurring entry, es: Duplicar un apunte recurrente }
      description:
        fr: ~{documentation/scenarios/foyer/recurrente.fr.md}
        en: ~{documentation/scenarios/foyer/recurrente.en.md}
        es: ~{documentation/scenarios/foyer/recurrente.es.md}
    virement:
      title: { fr: Faire un virement entre deux comptes, en: Transfer between two accounts, es: Transferir entre dos cuentas }
      description:
        fr: ~{documentation/scenarios/foyer/virement.fr.md}
        en: ~{documentation/scenarios/foyer/virement.en.md}
        es: ~{documentation/scenarios/foyer/virement.es.md}
    budget:
      title: { fr: Suivre un budget, en: Track a budget, es: Seguir un presupuesto }
      description:
        fr: ~{documentation/scenarios/foyer/budget.fr.md}
        en: ~{documentation/scenarios/foyer/budget.en.md}
        es: ~{documentation/scenarios/foyer/budget.es.md}
```

```markdown
<!-- documentation/scenarios/foyer/virement.fr.md (D1204) -->
Quand : à chaque mouvement d'argent d'un compte du foyer vers un autre.

1. Ouvrir [les écritures du compte de départ](banque.ecriture[par_operation]) et sélectionner
   une écriture — le virement part de la ligne où il se place.
2. Appuyer sur [Virer](banque.ecriture.virer) : le formulaire demande le compte d'arrivée et le
   montant.
3. Relire, puis valider : deux écritures naissent, liées l'une à l'autre — la sortie sur le compte
   de départ, l'entrée sur le compte d'arrivée, chacune avec son écriture liée.
4. Vérifier [le compte d'arrivée](banque.ecriture[par_operation]) : l'entrée y figure, le solde a
   suivi.

> **À ne pas faire** : saisir le virement en deux écritures à la main — elles ne seraient pas liées,
> et la suppression de l'une ne supprimerait pas l'autre.
```

```markdown
<!-- documentation/scenarios/foyer/virement.en.md -->
When: whenever money moves from one household account to another.

1. Open [the entries of the source account](banque.ecriture[par_operation]) and select an entry —
   the transfer starts from the line where it belongs.
2. Press [Transfer](banque.ecriture.virer): the form asks for the target account and the amount.
3. Review, then confirm: two entries are created, linked to each other — the debit on the source
   account, the credit on the target account, each one carrying its linked entry.
4. Check [the target account](banque.ecriture[par_operation]): the credit is there, the balance
   has followed.

> **Do not**: enter the transfer as two manual entries — they would not be linked, and deleting one
> would not delete the other.
```

**Le chapitre 4, tel que Syncytium le produirait** — l'édition en
français ; l'anglaise et l'espagnole se construisent de même, chacune
depuis ses propres textes (D1144) :

> ## 4. Les scénarios d'utilisation
>
> ### Léa — Gestionnaire des comptes du foyer
>
> Elle tient les comptes du foyer — la saisie des écritures, le
> pointage du relevé, les virements, les budgets.
>
> **Ce qu'elle voit.** Le module banque : les comptes, les écritures
> (par date d'opération, par date comptable, sans date comptable),
> les budgets, les lieux ; le graphique de l'évolution des dépenses par
> budget. Tous les droits.
>
> **Ses scénarios.**
>
> **Pointer le relevé bancaire** — *la planche 1*. Quand : à l'arrivée
> du relevé. Ouvrir les écritures sans date comptable *(→ la liste
> pointage, le compte demandé)* ; pour chaque ligne du relevé, poser la
> date comptable en ligne *(→ la colonne date comptable, éditable)* —
> la ligne quitte la liste ; une écriture du relevé absente de la liste
> se saisit *(→ le formulaire de création)* ; à la fin, imprimer le
> relevé *(→ la liste par date comptable, l'export PDF)* : les
> écritures imprimées reçoivent leur date d'impression *(→ l'opération
> creer_releve, déclenchée par la génération)*.
>
> **Dupliquer une écriture récurrente** — *la planche 2*. Quand : à la
> mise en place d'un abonnement, d'un loyer. Sélectionner l'écriture
> modèle *(→ la liste par date d'opération)* ; Dupliquer *(→
> l'opération, son formulaire : le pas — jour, semaine, mois,
> trimestre — et les deux dates)* ; relire le nombre de créations, puis
> valider.
>
> **Faire un virement entre deux comptes** — *la planche 3*. Quand : à
> chaque mouvement d'argent d'un compte du foyer vers un autre.
>
> 1. Ouvrir les écritures du compte de départ *(→ la liste par date
>    d'opération)* et sélectionner une écriture — le virement part de la
>    ligne où il se place.
> 2. Appuyer sur Virer *(→ l'opération, son formulaire)* : le compte
>    d'arrivée et le montant.
> 3. Relire, puis valider : deux écritures naissent, liées l'une à
>    l'autre — la sortie sur le compte de départ, l'entrée sur le compte
>    d'arrivée, chacune avec son écriture liée.
> 4. Vérifier le compte d'arrivée *(→ la liste par date d'opération)* :
>    l'entrée y figure, le solde a suivi.
>
> > **À ne pas faire** : saisir le virement en deux écritures à la main
> > — elles ne seraient pas liées, et la suppression de l'une ne
> > supprimerait pas l'autre.
>
> **Suivre un budget** — *la planche 4*. Quand : chaque mois. Ouvrir
> l'évolution des dépenses par budget *(→ le graphique
> evolution_budget, le budget et la période en filtres)* ; lire le
> cumul du mois ; remonter aux écritures du budget *(→ la liste par
> date d'opération, filtrée sur le budget)*.

**La planche 3** — « Faire un virement entre deux comptes », une page
A4 paysage, dans la langue de l'émetteur (D1144) — en français ici :
le titre, « à chaque mouvement d'argent » dessous ; quatre étapes ;
sous chacune, l'image rendue par Syncytium — la liste par date
d'opération avec la ligne sélectionnée et le bouton Virer entourés,
le formulaire d'appel du virement avec ses deux champs, la relecture
avant le scellé, la liste du compte d'arrivée avec l'entrée et le solde
entourés ; l'encart ; le cartouche et le filigrane « Beta v1.0.0.0 »
(D1145).

**Ce que la déclinaison relève** (les frottements — *arbitrés par
D1210*) :

1. **Le persona par langue** : `name:` est invariant — un prénom ne se
   traduit pas —, `role:` et `description:` sont par langue (D1101) ;
   un rôle qui manque dans une langue tombe sur la langue par défaut et
   la complétude le signale — « ok ».
2. **Le scénario par langue** : `title:` par langue, `description:` un
   fichier par langue, nommés ici `<scénario>.<langue>.md` — « le
   nommage me convient (uniquement pour le cas d'usage) » : ailleurs, un
   sous-dossier par langue ou le nommage du concepteur ; **un fichier
   qui manque dans une langue est une erreur d'ingestion, pas de
   bascule sur la langue par défaut** (D1210 — ma lecture de la bascule
   écartée).
3. **L'opération à formulaire d'appel** (D775) : son adresse
   (`banque.ecriture.virer`) rend, sur la planche, le formulaire
   d'appel comme un écran — le bouton d'abord, le formulaire ensuite,
   deux images pour une étape ; **ses champs libres** (`pas`, `du`, `au`
   — sans `hint:` ni `description:`) **comptent dans la complétude**
   (D1230 — « oui, cela fait partie de la complétude »).
4. **La liste à recherche obligatoire** (`owner: { searchable: strict,
   select: mono, required: true }` — le possesseur, filtré par la
   définition de la liste, D1599–D1600) : le lien sans paramètre ouvre
   la liste qui demande le compte ; le scénario peut le fixer
   (`?owner=…`, D1203)
   quand le contexte le connaît — ici il ne le connaît pas, la planche
   montre la liste avec le compte en attente.
5. **L'automatisme déclenché par une génération** (`creer_releve`,
   `when: generated`) : il n'a ni bouton ni `label:` — le scénario le
   désigne par son effet (« les écritures imprimées reçoivent leur date
   d'impression »), comme ceux du véhicule (D1209).

## La documentation générée — le chapitre du module (le rang 1 — D1194–D1196, D1218, D1227–D1233)

*(la déclinaison du chapitre 3 de §6 de documentation.md sur le
module `banque` — écrite le 11/10/2026, réécrite le même jour sur
D1229–D1233 : le menu déclaré, le graphique sur l'accueil, le mode
d'usage des composants, les messages par des exemples, **la
description de l'entité et de ses champs avant l'écran, le type dans
la table** ; l'édition française ; en proposition)*

**Ce qui structure le chapitre.** Le menu, déclaré (`banque/menu.yml`,
D1230) : l'accueil, les comptes, les écritures en sous-menu avec une
entrée par liste, les budgets, les lieux. Une section par entrée
(D1194, D1229) ; chaque section décrit l'entité, ses champs, l'écran
(D1232), les opérations, les règles ; une liste qui partage l'entité
d'une autre renvoie à ses champs.

**Le chapitre, tel que Syncytium le produirait** :

> ## 3. Le module banque
>
> La gestion des comptes bancaires du foyer.
>
> *(la vue du module — le diagramme : `compte` et sa composition
> `ecriture` ; `ecriture` vers `budget`, `lieu`, et vers elle-même par
> `liee` ; `numero` souligné chez le compte, `libelle` chez les deux
> référentiels, en gras car référencés ; les calculés en italique —
> D1213)*
>
> ### 3.0 Le foyer et ses comptes
>
> L'écran d'accueil du module : **l'évolution des dépenses par budget**
> — le mois en abscisse, le montant du mois en ordonnée ; le budget et
> la période se choisissent en filtres.
>
> ### 3.1 Les comptes
>
> **Un compte bancaire — son numéro, son libellé, ses dates d'ouverture
> et de clôture, ses écritures.** Un compte se présente par son libellé
> ; son identité est son numéro.
>
> | Champ | Type | Obligatoire | Aide | Description |
> |---|---|---|---|---|
> | Numéro | un texte de 23 caractères au plus | oui (identité) | — | — |
> | Libellé | un texte de 40 caractères au plus | non | — | — |
> | Ouverture | une date | oui | — | — |
> | Clôture | une date | non | Vide tant que le compte est ouvert. | — |
> | *Ouvert* | oui / non, calculé | — | — | — |
> | Écritures | les écritures de 3.2 | — | — | — |
>
> **L'écran.** La liste et le formulaire par défaut ; les écritures en
> onglet.
>
> **Les règles.** L'écriture d'ouverture est datée du jour de
> l'ouverture — « L'écriture d'ouverture est datée du *[Date
> d'opération]* ; le compte ouvre le *[Ouverture]*. » ; de même pour la
> clôture — « L'écriture de clôture est datée du *[Date d'opération]* ;
> le compte ferme le *[Clôture]*. »
>
> ### 3.2 Les écritures — par date d'opération
>
> **Une écriture bancaire — la date, le libellé, le budget, le montant,
> le mode, le lieu.**
>
> | Champ | Type | Obligatoire | Aide | Description |
> |---|---|---|---|---|
> | Numéro | un compteur, attribué à la validation | — | — | Le compteur automatique, masqué aux surfaces. |
> | Date d'opération | une date | oui | — | — |
> | Date comptable | une date | non | Renseignée au pointage. | — |
> | Libellé | un texte de 100 caractères au plus | non | — | — |
> | Budget | un budget (3.5) | non | — | Le référentiel dynamique — la création directe au picker. *Mode d'usage* : tapez un libellé absent pour le créer. |
> | Montant | un montant, en euros ou en francs | oui | Signé — négatif pour une dépense. | La devise vit dans la valeur ; le franc porte l'historique antérieur au passage à l'euro. |
> | Mode | l'un de : CB, Prélèvement, Virement, Autre | non | — | — |
> | N° de chèque | un texte de 10 caractères au plus | non | Pour le mode autre. | — |
> | Écriture liée | une écriture (3.2) | — | — | L'écriture miroir du virement, sur l'autre compte. |
> | Lieu | un lieu (3.6) | non | — | La ville — le référentiel dynamique, la création directe au picker. *Mode d'usage* : tapez un libellé absent pour le créer. |
> | Imprimée le | une date | — | — | Le marqueur du relevé, posé par la génération du PDF. |
> | *Montant en euros* | un montant en euros, calculé | — | — | Un montant à devise unique. |
> | *Montant en francs* | un montant en francs, calculé | — | — | — |
> | *Solde* | un montant en euros, calculé | — | — | Le solde continu — la somme des écritures du compte jusqu'à cette date. |
> | *Débit* | un montant, calculé | — | — | Un calculé d'affichage — le montant signé en deux colonnes, avec le crédit. |
> | *Crédit* | un montant, calculé | — | — | — |
>
> **L'écran.** La liste par date d'opération, tous comptes confondus :
> Date d'opération, Date comptable, Libellé, Budget, Débit, Crédit,
> Solde ; en zone de recherche, le compte — à choisir, obligatoirement
> —, la plage de dates d'opération, la recherche ; la sélection
> multiple ; la copie d'une écriture. Le formulaire — Création d'une
> écriture, Écriture « … » du …, Modification, Suppression — : les
> champs saisissables dans l'ordre de la table, le N° de chèque visible
> pour le mode Autre.
>
> **Les opérations.**
>
> | L'opération | Ce qu'elle fait | Ce qui la déclenche |
> |---|---|---|
> | **Dupliquer** | Duplique l'écriture courante entre deux dates, au pas choisi — jour, semaine, mois ou trimestre ; les copies naissent dans la transaction, sans date comptable. | un bouton sur une écriture ; le formulaire « Dupliquer l'écriture "…" » — le pas (l'un de : Jour, Semaine, Mois, Trimestre), du (une date), au (une date), obligatoires ; la relecture affiche le nombre de créations |
> | **Propager** | Modifie le libellé et le montant de toutes les écritures similaires — le même libellé et le même montant qu'avant la modification, à une date d'opération postérieure ou égale : la liste des similaires, la sélection, la modification en masse. | un bouton sur une écriture ; le formulaire « Propager depuis "…" » — le nouveau libellé (un texte de 60 caractères au plus), le nouveau montant (un montant en euros), obligatoires ; validée avant le scellé |
> | **Virer** | Crée les deux écritures d'un virement entre comptes — la sortie sur le compte courant, l'entrée sur le compte cible —, liées des deux côtés, dans la même transaction. | un bouton sur une écriture ; le formulaire « Virement » — le compte cible (un compte), le montant (un montant en euros), obligatoires ; avec relecture |
> | creer_releve | À toute génération d'un relevé, pose la date d'impression sur chaque écriture générée — le relevé devient un acte tracé, pas un simple export. | automatique, à l'export PDF du relevé (3.3) ; sans relecture |
>
> ### 3.3 Les écritures — par date comptable
>
> Les écritures pointées seules, par date comptable puis par montant,
> de la dépense à la ressource — les champs de 3.2. **L'écran** : les
> mêmes colonnes ; le compte, la plage de dates comptables et la
> recherche ; la sélection multiple ; la copie ; **l'export du relevé
> en PDF**, qui déclenche creer_releve.
>
> ### 3.4 Les écritures — sans date comptable
>
> Le pointage : les écritures sans date comptable, par date
> d'opération — les champs de 3.2. **L'écran** : Date d'opération, Date
> comptable, Libellé et Budget **éditables en ligne** *(mode d'usage :
> la cellule se modifie dans la liste, sans ouvrir le formulaire)*,
> puis Débit, Crédit, Solde ; le compte et la recherche ; la sélection
> multiple. Poser la date comptable fait quitter la liste à l'écriture.
>
> ### 3.5 Les budgets
>
> **Un budget — le poste de dépense ou de ressource d'une écriture.**
> Son identité est son libellé.
>
> | Champ | Type | Obligatoire | Aide | Description |
> |---|---|---|---|---|
> | Libellé | un texte de 30 caractères au plus | oui (identité) | — | — |
>
> **L'écran** : la liste et le formulaire par défaut.
>
> ### 3.6 Les lieux
>
> **Un lieu — la ville d'une écriture.** Son identité est son libellé.
>
> | Champ | Type | Obligatoire | Aide | Description |
> |---|---|---|---|---|
> | Libellé | un texte de 30 caractères au plus | oui (identité) | — | — |
>
> **L'écran** : la liste et le formulaire par défaut.

**Ce que la déclinaison relève** — les six frottements du 11/10 sont
soldés (D1229–D1230) ; la réécriture en ajoute deux :

7. **La description de l'entité et de ses champs avant l'écran**
   (D1232) : la section décrit l'entité, puis chaque champ — le
   libellé, le type, l'obligation, l'aide, la description, les valeurs,
   le mode d'usage du composant qui le rend (D1229) —, puis l'écran ;
   une liste qui partage l'entité d'une autre (3.3, 3.4) renvoie à ses
   champs ; les champs que les surfaces ne montrent pas (le numéro,
   l'écriture liée, la date d'impression) y figurent avec leur
   description, sans obligation — à confirmer.
8. **Le type dans la table** (D1233) : « un montant, en euros ou en
   francs », « un budget (3.5) » — la référence se dit par l'entité
   cible et renvoie à sa section ; les formes en clair sont miennes, à
   fixer au rang 2 (D1160) ; les champs libres d'un formulaire d'appel
   disent aussi leur type, dans la colonne du déclenchement.


## La réglementation — la déclinaison de la banque (le rang 3)

*(La déclinaison du rang 3, écrite le 19/10/2026 sur §18 de
documentation.md — D1317–D1343. La banque est le mono-poste d'un foyer :
aucun champ `rgpd:` — les tiers des écritures, les titulaires des
comptes ne sont pas marqués ; ce n'est pas une anomalie (D1319). Le cas
montre ce que la documentation 5 donne à une application sans
traitement déclaré, et ce qu'elle donnerait si le concepteur marquait
un champ. **En proposition.**)*

---

> # banque — La réglementation et la sécurité
>
> ## Le registre des traitements
>
> Aucun traitement : aucun champ ne porte le marquage `rgpd:`.
>
> ## Les droits des personnes, les mentions d'information
>
> *Aucun module soumis.*
>
> ## La journalisation des accès
>
> Les refus d'autorisation sont journalisés ; aucun champ audité.
>
> ## La sécurité de l'instance
>
> *Les douze principes, une section chacun (D1338) — l'audience : le
> groupe `foyer` (D1208), tous ses membres voient tout ; les secrets :
> aucune clé `*`, le sqlite natif ; la disponibilité : la sauvegarde du
> fichier ; le chat : absent.*
>
> ## L'accessibilité
>
> Les critères du RGAA testés à l'ingestion sur les composants employés
> — dont le graphique `chart[ecriture.evolution_budget]` et le tableau de
> bord d'accueil (D1237) — : par critère, passe, ne passe pas, non
> testé. *Aucune déclaration : `accessibility:` absent.*
>
> ## Les obligations du secteur
>
> *Aucun texte : `regulation:` absent.*

---

**Ce que donnerait un marquage.** Si le concepteur écrivait
`tiers: { type: text[..40], rgpd: identity }` sur l'écriture, la banque
aurait un traitement par acte du socle sur `ecriture`, `foyer` pour
responsable à déclarer, et `rgpd.extract("Dupont")` réunirait les
écritures du tiers Dupont ; le registre le dirait, « non précisé » tant
que le bloc `rgpd:` manquerait. Le cas reste sans marquage : c'est le
foyer qui tient ses propres comptes.

## Le développeur — la déclinaison de la banque (le rang 5)

*(La déclinaison du rang 5, écrite le 24/10/2026 sur §27 de
documentation.md — D1403–D1423. La banque porte quatre hooks
d'opération — `creer_releve`, `dupliquer`, `propager`, `virer` —, trois
langues (`fr`, `en`, `es`), un groupe `foyer`, l'authentification
`none` du mono-poste (D759) ; aucun type ni composant personnalisé,
aucun webhook. Elle montre le chapitre « Étendre » et ce que D1403 et
D1405 lui demandent. **Confirmée, et les md par langue écrits dans la
configuration le 24/10/2026 — D1424.**)*

---

> # banque — Le développeur, chapitre 2 : Étendre
>
> ## L'inventaire — ce que la version 1.0.0.0 ajoute au socle
>
> **Les hooks d'opération** (quatre) ; aucun type, composant, fonction,
> connecteur ni style personnalisé.
>
> | le hook | ce qu'il fait (son md) | les langues | les références |
> |---|---|---|---|
> | `creer_releve` | la tâche d'impression — déclenchée par l'événement `generated`, pose la date d'impression `imprimee` sur chaque écriture générée | fr | 1 — `ecriture`, le déclencheur `when: generated` |
> | `dupliquer` | la duplication d'une écriture entre deux dates, au pas choisi (jour, semaine, mois, trimestre) ; les paramètres `pas`, `du`, `au` ; `nb_creations` avant le scellé | fr | 1 — `ecriture`, le bouton de la fiche |
> | `propager` | la modification des similaires — même libellé et même montant, à la date d'opération ≥ ; la liste, la sélection, la modification en masse validée avant le scellé | fr | 1 — `ecriture`, le bouton de la fiche |
> | `virer` | les deux écritures d'un virement entre comptes, liées par `liee:` des deux côtés, dans la même transaction ; les paramètres : le compte cible, le montant | fr | 1 — `ecriture`, le bouton de la fiche |
>
> *Chaque fiche : le nom, la famille, la description dans la langue du
> lecteur, les propriétés (`properties: { }` — le degré `user` par
> défaut, l'exécution normale, non déterministe), les connecteurs
> touchés (aucun ; `creer_releve` écrit un document), la version
> d'apparition (1.0.0.0), le code par son existence et son emplacement
> — `hooks/operations/<nom>/source.txt` —, jamais son contenu (D1406).*
>
> **Les langues — un manque** (D1403, D1405) : la version parle `fr`,
> `en`, `es` ; chaque hook n'a qu'un md, en français. **L'ingestion le
> refuse** : « un hook porté par un projet doit forcément contenir les
> langues utilisées par le projet ». *La complétude le relève ; le
> concepteur écrit `documentation.en.md` et `documentation.es.md` et la
> fiche devient `description: { fr: …, en: …, es: … }`.*
>
> **Pour le technicien** : le même inventaire filtré par D1394 — le
> compte unique du mono-poste voit les quatre.
>
> ## La référence de Syncytium-1.0
>
> Embarquée entière (D1411) : les six familles, le contrat de chacune,
> ce que le moteur fournit, la maison, essayer en sandbox, la forme du
> code au domaine 7.

---

**Ce que le concepteur ajouterait** — **écrit dans la configuration le
24/10/2026** (D1424, comme les clés du rang 4, D1382) : pour chacun des
quatre hooks, `documentation.fr.md`, `documentation.en.md`,
`documentation.es.md`, et la fiche en forme longue ; le traceur : 68
fichiers atteints, aucun orphelin :

```yaml
# hooks/operations/dupliquer/dupliquer.yml — la description par langue (D1403, D1405)
description:
  fr: ~{documentation.fr.md}
  en: ~{documentation.en.md}
  es: ~{documentation.es.md}
```

*Le véhicule ne parle qu'une langue, `fr` : ses hooks gardent la forme
simple (D1105).*

## La complétude de la documentation — la déclinaison de la banque (le rang 8, étape 1)
*(La mesure au dépôt, `python tools/completeness.py examples/04_banque`, le 25/10/2026 — D1478–D1488 :
l'inventaire de documentation.md §20, le taux par documentation et par module, les manques par nature ;
la liste complète, le fichier et la clé d'accès, sort de l'outil. Les manques sont ceux du cas tel qu'il
est écrit : ils disent ce que le concepteur n'a pas décrit, jamais un défaut du socle.)*

### La version 1.0.0.0 (beta) — 74 %

| La documentation | (environnements) | (groups) | (hooks) | (projet) | banque | **la version** |
|---|---|---|---|---|---|---|
| fonctionnelle | — | 100 % (1/1) | — | — | 77 % (50/65) | **77 %** |
| dictionnaire | — | — | — | — | 66 % (21/32) | **66 %** |
| développeur | — | — | 100 % (4/4) | — | 100 % (4/4) | **100 %** |
| D.A.T. | 100 % (1/1) | — | — | — | — | **100 %** |
| guide | 0 % (0/1) | — | — | — | — | **0 %** |
| projet | — | — | — | 0 % (0/1) | — | **0 %** |

**74 %** — 81 éléments décrits sur 109 attendus, 17 manques.

| Le manque | Combien | La clé à écrire | La documentation |
|---|---|---|---|
| l'entité sans nom d'usage | 4 | `title:` | fonctionnelle |
| le champ sans aide ni description | 11 | `hint: ou description:` | fonctionnelle, dictionnaire |
| le projet sans texte de support | 1 | `pages: support:` | projet |
| l'environnement sans texte d'exploitation | 1 | `pages: operations:` | guide |

**Les orphelins** — 68 fichiers atteints depuis `syncytium.yml`, 68 fichiers dans le dossier ; un orphelin n'entre pas dans le taux : c'est peut-être un oubli — un texte écrit, jamais référencé.

Aucun orphelin.
