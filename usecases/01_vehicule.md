# Le cas 1 — les applications domestiques : la maintenance d'un véhicule

*Le premier projet du domestique (D756 : « compte bancaire,
véhicule… ») — le plus simple de l'échelle, la maison alignée un
cas = un exemple (D826/D827). Le cadre du cas : le
contexte, les données réelles, les arbitrages, **la forme** (le
dépôt `examples/01_vehicule/` écrit pour de vrai) et **les manques**
(chaque frottement devient une décision). Les décisions citées
renvoient à [../docs/conception.md](../docs/conception.md).*

## Le contexte (D826)

- **le foyer** suit ses véhicules — « un projet plus simple » que le
  compte bancaire ;
- **la genèse : un classeur Excel par véhicule depuis 1992** (dix
  classeurs — de l'Austin Metro 1992 à la 4L 2026) ; deux fournis
  pour le cadrage : **un thermique** (le Partner Outdoor 2015 —
  407 pleins, ~300 000 km, vendu en 2026) et **un électrique** (la
  Zoe 2023 — LOA, 173 charges) ;
- **l'application est multi-véhicules** : l'identification porte
  **une photo et le type de véhicule (thermique ou électrique)**.

## Les données décrites — la même maison à six feuilles

Les deux classeurs partagent la structure, aux unités près :

- **IDENTIFICATION** : le nom, l'immatriculation (masquée ici), le
  mode et le lieu d'achat, les dates ;
- **CONSOMMATION** — le journal des ravitaillements : nb jours,
  date, total km, km parcourus, la quantité (litres | kWh), le prix
  unitaire, le prix total, la consommation aux 100 km ; l'électrique
  ajoute **le « km prév. »** — le prorata du kilométrage total
  défini par la LOA ;
- **GRAPHIQUE** : l'évolution de la consommation ;
- **ENTRETIEN** — **le journal de vie** : la date, la désignation,
  le montant, le km — des frais, des événements sans montant
  (« Choc avec une biche », « Fuite de gasoil », le diagnostic d'une
  charge impossible), et **la vente en recette négative**
  (−2 477 €) ; le bloc droit : « Révisions tous les 25 000 /
  20 000 km » ;
- **CREDIT | LOA** — le financement : le tableau d'amortissement
  (capital, taux, assurance, les mensualités, la coche « Payé ») ou
  la LOA (la mensualité, le reste dû) ;
- **BILAN** — **tout calculé** : les totaux (achat + entretien,
  maintenance, énergie, intérêts), les compteurs (jours,
  pleins/charges, km, litres/kWh), les prix de revient — l'énergie
  au km, **le global au km** (0,249 €/km thermique, 0,237 €/km
  électrique), le global au jour.

## Les arbitrages du cadrage (D826)

1. **multi-véhicules** — « une application multi-véhicule avec dans
   l'identification une photo et le type de véhicule (thermique ou
   électrique) » ;
2. **la quantité en valeur seule** — « l'unité est portée par la
   colonne (le type de véhicule) et pas par la valeur » : le
   contre-patron assumé du `amount` du budget (D771) — deux patrons
   légitimes, la devise vivait dans la valeur, l'unité vit ici dans
   le type du véhicule ;
3. **l'entretien conservé tel quel** — le journal de vie : les
   événements sans montant sont licites, la vente est un montant
   négatif ;
4. **le financement = le tableau d'amortissement aux formules
   reportées** de la feuille Excel — des calculés déclarés, pas une
   saisie ;
5. **les révisions = un échéancier déclarant une notification, sur
   un km ou sur un délai** ;
6. **le contrôle technique non porté** ;
7. **le « km prév. » défini par rapport au km total de la LOA** ;
8. **la reprise par un storage de type `xlsx`** — « les
   paramétrages sont à définir » ;
9. **la maison à part** — `usecases/01_vehicule.md` et
   `examples/01_vehicule/` (le préfixe 01 : la famille domestique
   de D756).

## La forme — le dépôt

*(écrit morceau par morceau — le protocole D457/D756, comme le
compte bancaire : la racine et l'environnement, le modèle, les
opérations, les surfaces, la reprise)*

- **le morceau 1 — la racine et l'environnement** (validé) : onze
  fichiers sur les acquis D799–D810, `logging.yml` (D830),
  `authentication: none` (D759), `smtp: none` (D763) ;
- **le morceau 2 — le modèle** (validé le 30/08, D831–D833) : le
  module **`transport`** (le moyen de locomotion — D831, le nommage
  libre D807) aux cinq entités, les formules reportées du classeur
  colonne par colonne :
  - **`vehicule`** — l'IDENTIFICATION (nom, immatriculation, photo
    `image` = le visage D386, le type thermique|électrique qui
    porte l'unité — le calculé `unite` par le `.select` des
    énumérés D833, la **devise visuelle** D832, `km_initial` = le
    compteur au retrait), **le cycle de vie** (`states: statut` —
    Création → Actif → Clôture : l'activation libre D426, la
    clôture au cliquet D354/D427 dès `date_vente` posée, les
    `allow` par état D422 — l'archive en lecture seule,
    `date_vente` comprise : sans demote, la clôture est terminale), le
    financement à plat
    (comptant|credit|loa, capital, taux, assurance, mensualité,
    durée, le premier mois + **le jour d'échéance du mois** D831,
    `km_annuel` de la LOA), les quatre compositions, et **le BILAN
    tout calculé** (compteurs, totaux, prix de revient —
    0,249 €/km) ;
  - **`consommation`** — le suivi de la consommation (D831) :
    **le numéro de ligne 1..n** — la première ligne se déduit
    (`numero = 1` part du `km_initial`), le précédent s'atteint au
    rang (`numero − 1`) ; date, `total_km` saisi, la quantité en
    **valeur seule** (D826), et les calculés du classeur :
    `nb_jours`/`km` par différence avec le précédent, `prix_total
    = quantité × prix unitaire`, `conso_100`, le `km_prevu` de la
    LOA **au temps** (D834 — les mois écoulés depuis l'achat,
    bornés à la vente, × `km_annuel / 12`) ;
  - **`entretien`** — le journal de vie : montant optionnel et nu
    (D832), l'achat en première ligne, la vente en négatif
    (−2 477) ;
  - **`revision`** — la règle de l'échéancier seule (pas en km OU
    en délai) : les révisions faites restent des lignes du journal,
    la notification = le hook du morceau 3 ;
  - **`echeance`** — la ligne CREDIT|LOA au cycle de vie par deux
    hooks (D831) : **engendrée à la validation du financement**
    (`creer_echeancier` — les formules riches dans le générateur),
    **close à la vente** — les non payées supprimées
    (`clore_echeancier`) ; **la coche « Payé » calculée** — payée
    dès que la date du jour dépasse l'échéance ; le reste dû
    calculé selon le mode.

- **le morceau 3 — les opérations** (en validation) : la maison
  des hooks au patron de la banque (D777/D778 — `hooks.yml` →
  `operations/operations.yml` au pattern, la fiche + un MD par
  hook), et le cycle de vie de l'échéancier sur l'entité
  `vehicule` (`operations.yml`, le patron `creer_releve` D796 —
  l'événement au `when:`, le `commit: auto`) :
  - **`creer_echeancier`** — `when: [created, updated] if
    financement = credit or financement = loa` : engendre les
    échéances 1..durée (la date au `jour_echeance` du mois, la
    mensualité déclarée LOA ou l'annuité du crédit, intérêt /
    amortissement / assurance reportés) — les formules du classeur
    vivent dans le hook ; idempotent — le paramétrage modifié ne
    régénère que les non payées ;
  - **`clore_echeancier`** — `when: promoted if statut =
    cloture` : la vente bascule le statut (le cliquet), la
    transition porte l'acte — les échéances non payées supprimées
    (la coche calculée ne « paiera » pas un véhicule vendu) ;
  - **la notification des révisions, déclarative** — pas de hook :
    la ligne d'entretien qui solde une règle la nomme
    (`entretien.revision`, le picker borné au véhicule), la règle
    en déduit `derniere_km`/`derniere_date` (l'accès retour D398),
    `prochaine_km`/`prochaine_date` (depuis la dernière faite,
    sinon l'origine), et **`echue`** — sur le km OU le délai, tant
    que le véhicule vit ; la surface du morceau 4 mettra les
    échues en avant (le mail reste muet — smtp none, D763).

## Les manques relevés

*(chaque frottement deviendra une décision)*

1. **le `.select` des énumérés** — tranché : **D833** (généralise
   le `.select` de `amount.currency` D771–D773 à tout `enum`) ;
2. **le précédent sans précédent** — éteint par **le numéro de
   ligne** (D831) : `iif(numero = 1, …)` remplace l'agrégat
   conditionnel sur le vide ;
3. **le max scalaire** — `km_courant` s'écrit en `iif` :
   suffisant, noté ;
4. **la division d'`amount`** — éteinte par **la devise visuelle**
   (D832) : les montants nus sont des `decimal`, la division va de
   soi ; `nb_jours.days` s'appuie sur les sous-items D772–D773 ;
5. **l'engendrement de l'échéancier** — tranché (D831) et écrit
   au morceau 3 : `creer_echeancier` à la validation du
   financement, `clore_echeancier` à la vente ;
6. **le libellé dynamique de la colonne quantité** (litres | kWh
   selon le véhicule) — le champ `unite` est prêt, la surface le
   consommera au morceau 4 ;
7. **la notification des révisions** (D826) — résolue au
   morceau 3 **sans hook** : le calculé `echue` se recalcule de
   lui-même (D255/D298), la surface la portera — en validation ;
8. **les événements du socle** — le `when:` du morceau 3 suppose
   `created`/`updated`/`promoted`, les participes des opérations
   aux côtés du `generated` de D796 — le vocabulaire à confirmer ;
9. **la condition à l'événement** — `when: updated if date_vente
   != null` : le `if` suffixé (le patron des validations) étendu
   au `when:` — à trancher ;
10. **l'accès retour nommé** — `revision` lit les entretiens qui
    la citent par `entretiens.max(km)` : le nom de la liste
    automatique (D398) à confirmer ;
11. **`date + duration → date`** — `prochaine_date =
    derniere_date + pas_duree` : le miroir de `date − date →
    duration` (D581) à confirmer.
