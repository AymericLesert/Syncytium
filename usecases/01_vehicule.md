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
    rang — l'accès par la clé `owner.consommations[me.numero - 1]`
    (D841/D842, `identity: [numero]` déclarée — la composition
    borne d'elle-même) ; date, `total_km` saisi, la quantité en
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

- **le morceau 4 — les surfaces** (validé le 30/08, D843–D844 —
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
  - les listes nommées à l'éponymie (l'arbitrage) : consommations,
    entretiens (« Entretiens et interventions »), revisions +
    echues, echeancier — la feuille du classeur colonne à
    colonne, le chart GRAPHIQUE ; le widget du véhicule nommé
    voiture (x: date[month], y:
    avg(conso_100)) ;
  - **l'écran principal** (la 3e passe — l'arbitrage) : le tableau
    de bord du module (`transport.yml`, `dashboards: accueil` —
    D554/D557/D439) empile **l'écho des révisions échues AVANT la
    liste des véhicules** — chaque liste dans sa section,
    l'empilement au défaut (D489/D490), l'adresse universelle
    `list[<entité>.<nom>]` (D566) ; la retouche finale :
    **`selection` et `searchable` retirés partout** — le défaut de
    `selection` est la déduction (D470/D474, le `multiple` de la
    consommation était un réflexe du patron banque sans opération
    de masse ici), et « pas de véritables besoins » de recherche
    (deux véhicules — les facettes `searchable:` du modèle retirées
    avec) ;
  - **la convention de lisibilité** (l'arbitrage, « de façon
    générale ») : les fichiers **aérés** — les accolades `{ }`
    dépliées en bloc, une ligne vide entre deux champs, dans
    chaque `fields.yml` **les champs saisis en tête, les calculés
    en pied** sous le séparateur `# ------ Champs calculés ------`,
    et **le commentaire d'un champ devant le champ**, jamais à sa
    droite ;
  - **l'auto-documentation** (le pilier rappelé par l'auteur) :
    `label:`/`hint:`/`description:`/`placeholder:` **utilisés
    davantage** (la courte se nomme `hint` — D840) —
    chaque champ porte son libellé français, sa phrase d'aide, son
    exemple de saisie ; chaque entité sa `description:` ; le
    commentaire YAML garde les références de décisions et les
    formules du réel — ce qui parle à l'utilisateur est un `hint:`
    ou une `description:`, pas un commentaire ; **l'artefact
    [entity.md](../docs/entity.md) créé** (le onzième —
    l'organisation d'une entité, ses champs, ses composants). `echues` devient une liste de widgets
    (D492) au **texte unique** — le widget `annonce` de la
    révision : deux `paragraph` au gabarit mustache (les chemins
    D71 — `{{owner.nom}}`), l'alinéa au `if:` (la règle au km ou
    au délai) — **une pure alerte**, sans lien (« pas plus de 2
    véhicules ») ; la `carte` du véhicule rejoint le bloc
    `widgets:` (la fiche widget).

- **le morceau 5 — la reprise des classeurs** (en validation, le
  dernier du cas) : le connecteur `legacy` **storage xlsx** sur le
  dossier (`${SYNCYTIUM_LEGACY_DIRECTORY}`) — la carte `entities:`
  (D828) : les **huit entités source** lisent les mêmes classeurs
  (le pattern `.*\.xlsx?` — dix classeurs, 1992-2026) ; la
  migration `classeurs` (absolute + reset, le patron R1) ; **la
  carte porte les options de lecture** (D845/D846 — **la plage au
  nommage Excel** : la zone de nom ou `FEUILLE!A3:H100`, l'entête
  au régime du CSV — la première ligne de la plage, ou la
  substitution) :
  - les feuilles-formulaires en **cellules adressées** —
    `identification` (B1 la marque et le modèle ensemble — le réel
    ne les sépare pas —, E1 **la plaque, devenue l'`identity:` du
    véhicule**, H1/H2 l'achat, les K de la Zoe, **la photo
    embarquée** — l'unique image de la feuille, ancrée en B6),
    `titre_consommation` (A1 → le type), `regle_revision` (I1 →
    le pas, l'astuce ×1000 du point de milliers),
    `credit_parametres` (C3/C4/C5/G4) ;
  - les tableaux à **entêtes nommées** (`headers: 3`, les labels =
    les entêtes D236 — les colonnes du thermique et de
    l'électrique en un seul jeu, les absentes nulles, les
    calculées du classeur ignorées D648/D657), bornés au besoin
    (`range: A..H` — le bloc droit homonyme) ;
  - **dix phases** : les véhicules (la jointure par `fichier`, le
    statut d'entrée), les types, **les origines** (la ligne 1 =
    date_achat + km_initial + la devise par `.year` — pas une
    consommation), les consommations (`numero: ligne - 1`), le
    journal (sans clé — création seule D825), **les ventes du
    journal** (« Vente de la voiture… » → date_vente + **le lieu
    extrait de la désignation** + clôture),
    les règles de révision, les financements (la source
    fusionnée `echeance` au repli de plages — D847 : l'intérêt
    vide = la LOA ; le crédit aux cellules, l'ancrage `.day`),
    les échéanciers **en données** (Payé et reste dû se
    recalculent), la durée par écrasement — tous régimes.

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
### Les manques de la reprise (le morceau 5)

R1. **la forme de lecture du xlsx** — tranché par D846 : **la
    plage au nommage Excel** (la zone de nom, ou
    `FEUILLE!A3:H100`) à la carte, l'entête au régime du CSV ;
    restent deux queues — **la facette `cell:`** aux champs des
    feuilles-formulaires (le même nommage, `IDENTIFICATION!B1` —
    un item par classeur), et **la borne haute des plages** (le
    plafond ; la lecture s'arrête à la première ligne vide) — à
    valider ;
R2. **les colonnes système** — `fichier` (la provenance de l'item)
    et `ligne` (le rang parmi **les lignes vivantes** — au moins un
    champ déclaré servi : la ligne blanche du Partner et la ligne
    du paramètre C4 de la Zoe se sautent, l'origine est bien la
    ligne 1 = CONSOMMATION!B5/D5) — à trancher ;
R3. **la jointure par le fichier** — le classeur = le véhicule :
    `key: fichier` à la règle-mère, `parent: { vehicule: fichier }`
    aux filles — le parent se résout par **la clé de reprise** de
    la règle-mère (D654 à préciser : la clé de reprise n'est pas
    l'`identity:` du modèle) ;
R4. **les entêtes homonymes** — dissous par D846 : la plage
    `ENTRETIEN!A3:H100` borne d'elle-même, le bloc droit n'existe
    pas pour la source ;
R5. **les lignes de continuation** — la Zoe étale une désignation
    sur plusieurs lignes sans date : `filter: date != null` les
    écarte — **la perte assumée** (trois lignes au réel), sauf
    arbitrage contraire ;
R6. **la durée par écrasement** — nulle part en cellule fiable :
    chaque échéance écrase `duree_echeances`, la dernière gagne —
    généralisée aux deux régimes par la source fusionnée (D847),
    l'astuce à valider ;
R7. **le premier mois tronqué** — `premier_mois: date` sur un champ
    `date[yyyy-mm]` : le type tronque au mois — à confirmer ;
R8. **l'image embarquée** — la photo vit dans le classeur
    (`xl/media/image1.jpg`, l'ancre B6 vérifiée au réel) : la
    facette `cell:` désigne l'image par sa cellule d'ancrage
    (`photo: { type: image, cell: IDENTIFICATION!B6 }`) — l'unique
    image de la feuille ; l'écriture à confirmer.

13. **le possesseur en colonne** — dissous par l'arbitrage : la
    liste `echues` n'a plus de colonnes — le widget-texte porte le
    véhicule dans son gabarit (`{{owner.nom}}`) ;
14. **le chart d'une autre entité** — résolu par le registre : la
    fiche dashboard adresse les widgets **qualifiés**
    `widget[<entité>.<nom>]` (`widget[order.monthly]`) — la même
    forme vaut pour le chart :
    `chart[consommation.evolution_consommation]` à l'onglet Bilan ;
15. **les listes au squelette du dashboard** — tranché par
    l'auteur : « chaque liste est mise dans une section différente,
    une section au-dessus de l'autre — nous avons déjà les
    éléments » : les sections empilées (`column`, le défaut —
    D489/D490), l'adresse universelle `<type>[<nom>]` (D566) qui
    couvre `list[<entité>.<nom>]`, la liberté compositionnelle
    (D455 — « qui utilise les listes ») ; rien de neuf en
    grammaire.
