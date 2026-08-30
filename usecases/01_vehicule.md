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

- **le morceau 3 — les opérations** (validé le 30/08, D839) : la maison
  des hooks au patron de la banque (D777/D778 — `hooks.yml` →
  `operations/operations.yml` au pattern, la fiche + un MD par
  hook), et le cycle de vie de l'échéancier sur l'entité
  `vehicule` (`operations.yml`, le patron `creer_releve` D796 —
  l'événement au `when:`, le `commit: auto`) :
  - **`creer_echeancier`** — `when: financement = credit or
    financement = loa` (l'opération automatique D428, le cliquet
    D354 — la validation du formulaire est l'opération D775) :
    engendre les
    échéances 1..durée (la date au `jour_echeance` du mois, la
    mensualité déclarée LOA ou l'annuité du crédit, intérêt /
    amortissement / assurance reportés) — les formules du classeur
    vivent dans le hook ; idempotent — le paramétrage modifié ne
    régénère que les non payées ;
  - **`ajuster_echeancier`** — le bouton (sans `when` — D428, la
    garde `if` D430) : le paramétrage modifié se reprend — les non
    payées remplacées, les payées intactes, la relecture au
    `commit: confirm` (D596/D598) ;
  - **`clore_echeancier`** — `when: statut = cloture` : la vente
    bascule le statut, le cliquet déclenche l'opération une fois —
    les échéances non payées supprimées (la coche calculée ne
    « paiera » pas un véhicule vendu) ;
  - **la notification des révisions — l'opération automatique +
    `notify` (D436)** : la ligne d'entretien **marquée révision**
    (`revision: boolean` — la référence à la règle n'avait pas
    d'intérêt), la règle en déduit `derniere_km`/`derniere_date`
    (`owner.entretiens.max(km if revision)`),
    `prochaine_km`/`prochaine_date` (depuis la dernière
    faite, sinon l'origine), **`echue`** — sur le km OU le délai,
    tant que le véhicule est actif —, et l'opération `notifier`
    (`when: echue`, l'effet `notify` du socle — D432/D574) porte
    l'information ; la surface du morceau 4 fera écho (le mail
    reste muet — smtp none, D763).

- **le morceau 4 — les surfaces** (en validation, la 2e passe —
  l'architecture de l'auteur) : **l'entrée principale = la liste
  des véhicules en widgets** (D492 — le visage `carte` : photo,
  identité, `km_courant`/`prix_km` en sections D489), **puis le
  formulaire du véhicule à six onglets** (tabs — D450/D504) :
  - **Véhicule** — l'identification (photo = le visage D386, le
    statut en liste navigatrice D426, les steppers D785) ;
  - **Financement** — le paramétrage au `visible:` vivant (D567),
    **le bouton `operation[ajuster_echeancier]`** (D511, la garde
    D430) et **l'échéancier embarqué** (`field[echeances]` — la
    composition déployée D486) ;
  - **Consommation / Entretien / Révision** — les compositions
    embarquées (`field[consommations]`…), chacune sur sa liste ;
  - **Bilan** — le dashboard : trois sections en ligne (les
    compteurs, les totaux, les prix de revient — D489) + la courbe
    `chart[evolution_consommation]` (D540) ;
  - **l'édition en ligne partout** (l'arbitrage) : `editable:
    […]` sur les quatre listes (les saisies — les calculés se
    refont D255) ; **aucun formulaire déclaré** aux quatre entités
    filles — le défaut du socle suffit (« basiques, sans
    description ») ;
  - les listes nommées demeurent (par_date, journal, toutes +
    echues, echeancier) — la feuille du classeur colonne à
    colonne, le chart GRAPHIQUE (x: date[month], y:
    avg(conso_100)).

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
   morceau 3 : l'opération automatique `notifier` + l'effet
   `notify` (D436) — in-app pour tous, **le relais mail = un
   setting de l'application, défaut néant (D836)** ;
8. **les événements du socle** — résolu par le registre : le
   `when:` accepte l'opération, l'expression, l'abonnement
   connecteur (D641) et l'événement `generated` (D796) ; les
   participes `created`/`updated` étaient inutiles — l'expression
   est évaluée à chaque mise à jour (`every: continuous`, le
   défaut — D435), le cliquet déclenche à la première vraie
   (D354/D428) ;
9. **la condition à l'événement** — résolu : le `if` au `when:`
   existait (D430 — la garde du bouton, `when: confirm if
   count(lines) > 0`) ; nos automatismes n'en ont pas besoin,
   l'expression porte tout ;
9 bis. **le re-paramétrage du financement** — tranché : le
   troisième hook **`ajuster_echeancier`**, un bouton de
   l'utilisateur (le cliquet de `creer_echeancier` reste intact) —
   les non payées remplacées, les payées intactes ;
10. **l'accès retour nommé** — résolu par le registre, puis rendu
    sans emploi : l'accès retour n'est **jamais déclaré**, le
    moteur le possède (D394) ; **le nommer = l'association
    dérivée** (D405 — la leçon demeure) ; l'arbitrage final a
    remplacé la référence `entretien.revision` par **un booléen**
    (une révision, ou une intervention hors révision) — plus rien
    à dériver, `owner.entretiens.max(km if revision)` suffit ;
11. **`date + duration → date`** — sans objet en grammaire
    (**D838** retire D837) : les opérateurs sont des fonctions de
    type (D581 — la table à la signature) — le `+` du `date` reçoit
    la duration et retourne une date ; les sous-items `.day`,
    `.month`, `.year`, `.week`, `.day_name`, `.days`, `.months` =
    le catalogue de fonctions des types `date`/`duration`
    (D772–D773, le hook de type D681) ;
12. **le passe-droit du statut** — tranché : **D835** — le degré
    `administrator` seul, toujours tracé (« des cas très
    particuliers et urgents » — moins onéreux qu'une version pour
    une erreur de saisie) ; la voie déclarée demeure le `demote`
    d'une version nouvelle ;
13. **le possesseur en colonne** — la liste `echues` traverse les
    véhicules et affiche `vehicule` en colonne : le nom d'entité
    désigne le possesseur, comme la facette de recherche du patron
    banque (`compte:`/`vehicule:` au `searchable:`) — l'extension
    aux `columns:` à confirmer ;
14. **le chart d'une autre entité** — l'onglet Bilan du véhicule
    référence `chart[evolution_consommation]`, déclaré sur
    l'entité `consommation` (ses données) : la portée de l'adresse
    `chart[<nom>]` hors de l'entité du formulaire — à confirmer
    (une qualification `consommation.evolution_consommation` ?).
