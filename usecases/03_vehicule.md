# Le cas 3 — les applications domestiques : la maintenance d'un véhicule

*Le premier projet du domestique (D756 : « compte bancaire,
véhicule… ») — le plus simple de l'échelle, la maison alignée un
cas = un exemple (D826/D827 ; le cas 1 devenu le cas 3, D1027). Le cadre du cas : le
contexte, les données réelles, les arbitrages, **la forme** (le
dépôt `examples/03_vehicule/` écrit pour de vrai) et **les manques**
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
9. **la maison à part** — `usecases/03_vehicule.md` et
   `examples/03_vehicule/` (le préfixe 01 : la famille domestique
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
    [entity.md](../docs/syncytium/modele/entite.md) créé** (le onzième —
    l'organisation d'une entité, ses champs, ses composants). `echues` devient une liste de widgets
    (D492) au **texte unique** — le widget `annonce` de la
    révision : deux `paragraph` au gabarit mustache (les chemins
    D71 — `{{owner.nom}}`), l'alinéa au `if:` (la règle au km ou
    au délai) — **une pure alerte**, sans lien (« pas plus de 2
    véhicules ») ; la `carte` du véhicule rejoint le bloc
    `widgets:` (la fiche widget).

- **le morceau 5 — la reprise des classeurs** (validé le 30/08,
  D855 — **le cas est clos**) : le connecteur `legacy` **storage xlsx** sur le
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
    embarquée** — `reference: IDENTIFICATION`, l'image de la
    feuille, l'ancre libre),
    `titre_consommation` (A1 → le type), `regle_revision` (I1 →
    le pas, l'astuce ×1000 du point de milliers),
    `credit_parametres` (C3/C4/C5/G4) ;
  - les tableaux à **entêtes nommées** (`headers: 3`, les labels =
    les entêtes D236 — les colonnes du thermique et de
    l'électrique en un seul jeu, les absentes nulles, les
    calculées du classeur ignorées D648/D657), bornés au besoin
    (`range: A..H` — le bloc droit homonyme) ;
  - **onze phases** : les véhicules (la jointure par la plaque —
    D850, le statut d'entrée), les types, **les origines** (la ligne 1 =
    date_achat + km_initial + la devise par `.year` — pas une
    consommation), les consommations (`numero: ligne - 1`), le
    journal (sans clé — création seule D825, les continuations en
    anomalie D851), **les ventes du
    journal** (« Vente de la voiture… » → date_vente + **le lieu
    extrait de la désignation** + clôture),
    les règles de révision, les financements (la source
    fusionnée `echeance` au repli de plages — D847 : l'intérêt
    vide = la LOA ; le crédit aux cellules, l'ancrage `.day`),
    les échéanciers **en données** (Payé et reste dû se
    recalculent), la durée en calculé (`echeances.count()` — D852).

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

R1. **la forme de lecture du xlsx** — clos (D846–D848) : la plage
    au nommage Excel à la carte, l'entête au régime du CSV, **la
    facette `reference:`** (la cellule, la feuille de l'image, la
    plage — un seul mot), **`single:`** à la carte (un
    enregistrement par fichier — le mixte plage + cellules
    d'autres onglets levé), **la borne aux trois formes** :
    explicite, `...` (l'arrêt à la ligne vide toutes colonnes),
    ouverte (`A3:H` — la fin de la feuille, les vides sautés) —
    le réel arbitre par plage ;
R2. **les informations système** — clos (D849) : le préfixe
    **`connector.`** — `connector.filename`, `connector.path`,
    `connector.line` (l'identifiant **par rapport à la zone**,
    jamais la ligne réelle — la ligne vivante : au moins un champ
    déclaré servi, la blanche du Partner et la ligne-paramètre de
    la Zoe se sautent, l'origine = la ligne 1 = B5/D5), la liste
    extensible, portées par le contrat du hook de connecteur ;
R3. **la jointure** — sans objet (D850) : chaque source porte un
    champ `immatriculation` référençant `IDENTIFICATION!E1` (le
    mixte de D848 — la cellule d'un autre onglet répétée sur
    chaque item) ; la clé et les parents joignent **par l'identité
    réelle** — le patron banque intact, le lien par le fichier
    inutile ;
R4. **les entêtes homonymes** — dissous par D846 : la plage
    `ENTRETIEN!A3:H100` borne d'elle-même, le bloc droit n'existe
    pas pour la source ;
R5. **les lignes de continuation** — clos (D851) : **l'anomalie,
    pas la perte** — sans filtre, la ligne sans date échoue à la
    cible (`date` requise) et la migration la signale ;
    l'utilisateur ajuste le classeur et rejoue (l'esprit D183 :
    le système constate, l'humain décide) ;
R6. **la durée** — clos (D852) : **le champ calculé** —
    `duree_echeances: formula: echeances.count()` ; la phase
    d'écrasement supprimée, rien à reprendre ; la question
    close (D853) : **`duree_contrat`** saisi — l'intention
    contractuelle que le générateur engendre —, et
    **`finaliser_vehicule`** (`when: migrated` — le 4e hook) :
    l'opération d'après-migration qui complète l'absent (les
    repris gagnent leur `duree_contrat` du compte) et, en général,
    engendre ou complète après la reprise ;
R7. **le premier mois tronqué** — clos (D854) : **la troncature
    naturelle** — l'affectation vers un `date` plus grossier
    tronque à sa nature (le type-cible fait autorité, la cohérence
    du `mask` D820) ; la formule explicite reste utilisable, au
    choix ;
R8. **l'image embarquée** — tranché : la photo se désigne **par la
    feuille**, pas par l'ancre (`photo: { type: image, reference:
    IDENTIFICATION }`) — « toutes les photos ne sont pas forcément
    ancrées sur la même cellule » ; l'image présente sur la
    feuille.

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

## La documentation générée — le chapitre des personas (le rang 1, étape 5 — D1200–D1208)

*(la déclinaison de §22 de documentation.md sur le véhicule, le cas
choisi par D1207 — écrite le 11/10/2026, **validée par D1209 avec ses
cinq frottements** ; la configuration entre dans `examples/03_vehicule/`
avec celle de la banque ; le prénom, le rôle, les scénarios sont miens,
acquis tels qu'écrits)*

**Ce que la configuration ajoute.** Le mono-poste déclare son groupe
(D1208) : un `groups.yml` à la version, un seul groupe, `foyer`, qui
porte le persona (D1200) ; un `documentation.yml` à la version avec
quatre scénarios écrits (D1202) ; quatre fichiers Markdown sous
`documentation/scenarios/foyer/` (D1204). Le véhicule n'a aucun wizard
: la part générée est le tour (D1201) ; les quatre opérations — deux
automatismes, un bouton, l'après-reprise — se lisent dans les
scénarios écrits.

```yaml
# groups.yml — le groupe du foyer (D1208 : le mono-poste déclare son groupe pour porter son persona)
foyer:
  label: Le foyer
  description: Les membres du foyer — tous les droits sur les véhicules.
  persona:
    name: Paul
    role: Membre du foyer
    description: Il tient le garage du foyer — les véhicules, leurs pleins, leur entretien, leur financement.
```

```yaml
# versions/beta/v1.0.0.0/documentation.yml — les scénarios écrits (D1202)
scenarios:
  foyer:
    achat_credit:
      title: Acheter un véhicule à crédit
      description: ~{documentation/scenarios/foyer/achat_credit.md}
    vente:
      title: Vendre un véhicule
      description: ~{documentation/scenarios/foyer/vente.md}
    plein:
      title: Enregistrer un plein ou une charge
      description: ~{documentation/scenarios/foyer/plein.md}
    revisions:
      title: Suivre les révisions
      description: ~{documentation/scenarios/foyer/revisions.md}
```

```markdown
<!-- documentation/scenarios/foyer/achat_credit.md (D1204) -->
Quand : à chaque nouveau véhicule financé par un crédit ou une LOA.

1. Depuis [le garage du foyer](transport[accueil]), créer [un véhicule](transport.vehicule[+record]) :
   le nom, la plaque, la photo, le type, la devise ; le statut naît en Création.
2. Dans l'onglet Financement, [choisir Crédit](transport.vehicule[+record]?financement=credit) :
   le capital, le taux annuel, l'assurance mensuelle, la durée, le premier mois et le jour
   d'échéance apparaissent.
3. Valider : [l'échéancier se crée de lui-même](transport.vehicule.creer_echeancier) — l'opération
   se déclenche à la validation du financement, sans relecture.
4. Relire l'échéancier dans l'onglet Financement ; si le paramétrage change plus tard,
   [Ajuster l'échéancier](transport.vehicule.ajuster_echeancier) le reprend et dit ce qu'il
   conserve, supprime et recrée.
5. Passer le statut à Actif : le journal de vie s'ouvre.

> **À ne pas faire** : saisir les échéances à la main — l'échéancier se calcule, un ajustement les
> reprendrait.
```

**Le chapitre 4, tel que Syncytium le produirait** (le plan de D1206) :

> ## 4. Les scénarios d'utilisation
>
> ### Paul — Membre du foyer
>
> Il tient le garage du foyer — les véhicules, leurs pleins, leur
> entretien, leur financement.
>
> **Ce qu'il voit.** Le module transport : le garage du foyer (les
> révisions échues, puis les véhicules en cartes), les véhicules, les
> consommations, les entretiens, les révisions, les échéances. Tous
> les droits ; un véhicule clôturé ne se modifie plus.
>
> **Ses scénarios.**
>
> **Acheter un véhicule à crédit** — *la planche 1*. Quand : à chaque
> nouveau véhicule financé par un crédit ou une LOA.
>
> 1. Depuis le garage du foyer *(→ transport[accueil])*, créer un
>    véhicule *(→ le formulaire de création)* : le nom, la plaque, la
>    photo, le type, la devise ; le statut naît en Création.
> 2. Dans l'onglet Financement, choisir Crédit *(→ le formulaire,
>    financement = Crédit)* : le capital, le taux annuel, l'assurance
>    mensuelle, la durée, le premier mois et le jour d'échéance
>    apparaissent.
> 3. Valider : l'échéancier se crée de lui-même *(→ l'opération
>    creer_echeancier)* — l'opération se déclenche à la validation du
>    financement, sans relecture.
> 4. Relire l'échéancier dans l'onglet Financement ; si le paramétrage
>    change plus tard, Ajuster l'échéancier *(→ l'opération)* le
>    reprend et dit ce qu'il conserve, supprime et recrée.
> 5. Passer le statut à Actif : le journal de vie s'ouvre.
>
> > **À ne pas faire** : saisir les échéances à la main — l'échéancier
> > se calcule, un ajustement les reprendrait.
>
> **Vendre un véhicule** — *la planche 2*. Quand : à la vente. Poser la
> date et le lieu de vente *(→ le formulaire, onglet Véhicule)* ;
> inscrire la vente au journal de vie en recette négative *(→
> l'onglet Entretien)* ; le statut passe en Clôture de lui-même dès
> que la vente est posée, et l'échéancier purge ses échéances non
> payées *(→ l'opération clore_echeancier)* ; le bilan se fige — le
> prix de revient au kilomètre.
>
> **Enregistrer un plein ou une charge** — *la planche 3*. Quand : à
> chaque passage à la pompe ou à la borne. Ouvrir le véhicule, l'onglet
> Consommation *(→ la liste consommations, éditable en ligne)* ; saisir
> la date, le kilométrage total, la quantité, le prix unitaire ; les
> jours, les kilomètres parcourus, le prix total et la consommation
> aux 100 km se calculent ; la courbe du bilan se met à jour.
>
> **Suivre les révisions** — *la planche 4*. Quand : à l'ouverture de
> l'application. Le garage du foyer annonce les révisions échues *(→
> la liste revision.echues)* ; ouvrir le véhicule, l'onglet Révision
> *(→ la liste revisions)* : les règles, éditables en ligne — le pas en
> kilomètres ou en durée — et les prochaines échéances déduites ; après
> la révision, l'inscrire au journal de vie *(→ l'onglet Entretien)* :
> la règle se recale.

**La planche 1** — « Acheter un véhicule à crédit », une page A4
paysage au gabarit `planche` de la version : le titre en tête, « à
chaque nouveau véhicule financé » dessous ; cinq étapes de gauche à
droite ; sous les étapes 1 à 4, l'image de l'écran rendue par
Syncytium — le garage du foyer avec le bouton de création entouré, le
formulaire à l'onglet Véhicule, l'onglet Financement avec le choix
Crédit entouré et les champs du crédit apparus, le même onglet avec
l'échéancier déployé et le bouton Ajuster entouré ; l'étape 5, le
statut à Actif, sur une petite image du champ statut ; en bas, l'encart
« À ne pas faire » ; le cartouche : le garage du foyer, la version
1.0.0.0 beta — **le filigrane « Beta v1.0.0.0 »** (D1145), la version
du véhicule n'ayant pas encore été promue —, la date de génération.

**Ce que la déclinaison relève** (les frottements — *validés en bloc
par D1209*) :

1. **Le mono-poste déclare son groupe** (D1208) : `groups.yml` naît
   pour le persona seul ; avec `authentication: none`, l'utilisateur
   par défaut y appartient et le degré est `administrator`, écrit ou
   non — ma lecture.
2. **L'adresse d'un état du formulaire** : « dans l'onglet
   Financement, choisir Crédit » s'écrit par un paramètre sur le
   formulaire de création (`?financement=credit`, D1203) — la planche
   rend l'écran dans cet état ; l'onglet n'a pas d'adresse propre, la
   planche montre celui où vit le champ cité.
3. **L'automatisme sans libellé** : `creer_echeancier` et
   `clore_echeancier` n'ont pas de `label:` — la documentation les
   nomme par leur nom (D1181), la complétude le compte (D1182) ; le
   scénario les désigne par leur effet (« l'échéancier se crée de
   lui-même »).
4. **Le passage d'état libre** (Création → Actif sans `when:`, D427) se
   fait par la liste navigatrice du statut (D500) : le scénario dit
   « passer le statut à Actif », l'image montre le champ.
5. **La beta** : la version du véhicule vit en `beta/` — la planche
   porte le filigrane (D1145) tant qu'elle n'est pas promue.

## La documentation générée — le chapitre du module (le rang 1 — D1194–D1196, D1218, D1227–D1233)

*(la déclinaison du chapitre 3 de §6 de documentation.md sur le
module `transport` — écrite le 11/10/2026, réécrite le même jour sur
D1227–D1233 : les sections des entrées de sous-menu, les messages par
des exemples, **la description de l'entité et de ses champs avant
l'écran, le type dans la table** ; rien de nouveau dans la
configuration ; en proposition)*

**Ce qui structure le chapitre.** La documentation suit le menu
(D1194). Le menu du module n'est pas déclaré : le défaut de D193 le
donne — l'accueil (`transport[accueil]`), l'entité agrégat `vehicule`
par sa liste `vehicules`, puis en sous-menu ses quatre compositions par
leur liste par défaut. Une section par entrée (D1194) ; chaque section
décrit **l'entité, puis ses champs, puis l'écran** (D1232), le cycle de
vie, les opérations, les règles ; les compositions en sous-sections de
leur possesseur (D1195), et leur entrée de sous-menu en section — la
liste de l'enfant, tous véhicules confondus (D1227).

**Le chapitre, tel que Syncytium le produirait** :

> ## 3. Le module transport
>
> Suivi et maintenance des moyens de locomotion du foyer.
>
> *(la vue du module — le diagramme : `vehicule` et ses quatre
> compositions `consommation`, `entretien`, `revision`, `echeance`, en
> liens ; `immatriculation` souligné ; les calculés en italique —
> D1213)*
>
> ### 3.1 Le garage du foyer
>
> L'écran d'accueil du module. En tête, **les révisions échues** de
> tous les véhicules, une annonce par règle à échéance (3.5). Dessous,
> **les véhicules du foyer** en cartes (3.2). La carte ouvre le
> véhicule.
>
> ### 3.2 Les véhicules
>
> **Un véhicule du foyer — l'identification, le financement, la vie et
> le bilan.** Un véhicule se présente par son nom ; son identité est
> son immatriculation.
>
> **Les champs.**
>
> | Champ | Type | Obligatoire | Aide | Description |
> |---|---|---|---|---|
> | Nom | un texte de 40 caractères au plus | non | La marque et le modèle — un classeur, un véhicule, un nom. | Le réel ne sépare pas la marque du modèle ; le nom les porte ensemble. *Exemple* : Partner Outdoor. |
> | Immatriculation | un texte de 12 caractères au plus | oui (identité) | La plaque du véhicule, au format du moment. | L'identité du véhicule ; les formats anciens interdisent un masque unique. *Exemple* : AA-999-AA. |
> | Photo | une image, 512 × 512 | non | Le visage du véhicule — la vignette des listes et de la carte. | Le visage porté par l'image ; la vignette est automatique. |
> | Type de véhicule | l'un de : Thermique, Électrique | oui | Il porte l'unité de la consommation — les litres du thermique, les kWh de l'électrique. | L'unité vit dans le type, pas dans la valeur. |
> | Devise | l'un de : €, F | oui | Visuelle seulement — elle habille l'affichage des montants, la valeur reste nue. | F — les classeurs antérieurs au passage à l'euro. |
> | Statut | l'un de : Création, Actif, Clôture | oui (défaut : Création) | La vie du véhicule — Création, Actif, Clôture ; la vente clôt sans retour. | La naissance à la valeur par défaut, l'activation libre, la clôture au cliquet dès que la vente est posée ; l'archive ne se réécrit pas. Actif — le journal s'écrit ; Clôture — l'archive, la vie ne se réécrit pas. |
> | Mode d'achat | un texte de 40 caractères au plus | non | — | *Exemple* : Acheté concessionnaire. |
> | Lieu d'achat | un texte de 60 caractères au plus | non | — | *Exemple* : Garage Peugeot à Dôle. |
> | Date d'achat | une date | oui | — | — |
> | Date de vente | une date | non | La vente ou la restitution — elle bascule le statut en Clôture et fige le véhicule. | Après la clôture, elle ne se modifie plus : l'état ne porte que la lecture, sans retour, et aucune opération n'y touche. |
> | Lieu de vente | un texte de 60 caractères au plus | non | Nul tant que le véhicule vit — le site de vente, la reprise du concessionnaire… | — |
> | Kilométrage initial | un entier positif ou nul | oui | Le compteur au retrait du véhicule — la première ligne de consommation en part. | — |
> | Financement | l'un de : Comptant, Crédit, LOA | non | — | — |
> | Capital emprunté | un nombre décimal | non | Le crédit seulement — 24 500. | — |
> | Taux annuel | un pourcentage | non | Le taux nominal du crédit — 6,187. | — |
> | Assurance mensuelle | un nombre décimal | non | Le crédit seulement — 34,40 par mois, en sus de la mensualité. | — |
> | Mensualité | un nombre décimal | non | La mensualité de la LOA — celle du crédit se calcule à l'échéancier. | — |
> | Durée du contrat | un entier positif ou nul | non | Le nombre d'échéances du contrat — 60 mensualités, 36 loyers. | L'intention contractuelle, que le générateur engendre ; le nombre d'échéances dit le réel compté. |
> | Premier mois | un mois (aaaa-mm) | non | Le premier mois du financement — 2016-02, 2023-10. | — |
> | Jour d'échéance | un entier de 1 à 31 | non | Le jour du mois du prélèvement — le 10, le 5. | La coche Payé des échéances s'en déduit. |
> | Kilométrage annuel | un entier positif ou nul | non | Le forfait de la LOA — 23 000 km/an, il nourrit le « km prévu ». | — |
> | Consommations | les lignes de 3.2.1 | — | — | — |
> | Entretiens | les lignes de 3.2.2 | — | — | — |
> | Révisions | les règles de 3.2.3 | — | L'échéancier des règles. | — |
> | Échéances | les lignes de 3.2.4 | — | — | Engendrées à la validation du financement par creer_echeancier ; closes à la vente par clore_echeancier, qui supprime les non payées. |
> | *Nombre d'échéances* | un entier, calculé | — | 60 mensualités du crédit, 34 loyers de la LOA — le compte des échéances. | — |
> | *Unité* | un texte, calculé | — | L'unité de la quantité — litres ou kWh, dérivée du type de véhicule. | — |
> | *Kilométrage courant* | un entier, calculé | — | Le plus grand compteur vu — consommations et entretiens confondus. | — |
> | *Nombre de jours* | une durée, calculée | — | La durée de vie suivie — la somme des intervalles entre ravitaillements. | — |
> | *Kilomètres parcourus* | un entier, calculé | — | — | — |
> | *Quantité totale* | un nombre décimal, calculé | — | Les litres ou kWh consommés sur la vie du véhicule. | — |
> | *Consommation moyenne* | un nombre décimal, calculé | — | Aux 100 km — litres ou kWh selon le type. | — |
> | *Durée moyenne d'un plein* | un nombre décimal, calculé | — | En jours — l'intervalle moyen entre deux ravitaillements. | — |
> | *Total achat et entretien* | un nombre décimal, calculé | — | L'achat et la vente sont des lignes du journal. | — |
> | *Total énergie* | un nombre décimal, calculé | — | — | — |
> | *Coût du financement* | un nombre décimal, calculé | — | Les intérêts payés du crédit, ou les loyers payés de la LOA. | — |
> | *Coût total* | un nombre décimal, calculé | — | — | — |
> | *Prix de l'énergie au km* | un nombre décimal, calculé | — | — | — |
> | *Prix de revient au km* | un nombre décimal, calculé | — | — | — |
> | *Prix de revient journalier* | un nombre décimal, calculé | — | — | — |
>
> **L'écran.** La liste en cartes (3.1) : la photo, le nom,
> l'immatriculation, le type, le statut, le kilométrage courant, le prix
> de revient au kilomètre. Le formulaire, à six onglets — **Véhicule**
> (de Nom à Kilométrage initial), **Financement** (de Financement à
> Kilométrage annuel, chaque champ visible selon le mode choisi ; le
> bouton Ajuster l'échéancier ; l'échéancier déployé, 3.2.4),
> **Consommation** (3.2.1), **Entretien** (3.2.2), **Révision**
> (3.2.3), **Bilan** (les compteurs, les totaux, les prix de revient ;
> la courbe de l'évolution de la consommation). Le statut se change
> par sa liste, qui ne propose que les états atteignables.
>
> **Le cycle de vie.**
>
> | L'état | Ce qui est permis | Le passage suivant |
> |---|---|---|
> | **Création** | créer, consulter, modifier, supprimer | → Actif, librement |
> | **Actif** | créer (les lignes du journal), consulter, modifier | → Clôture, dès que la date de vente est posée |
> | **Clôture** | consulter | — l'archive, la vie ne se réécrit pas |
>
> Les consommations, les entretiens, les révisions et les échéances
> suivent le véhicule : en Clôture, rien ne se modifie plus.
>
> *(le diagramme d'états — D422)*
>
> **Les opérations.**
>
> | L'opération | Ce qu'elle fait | Ce qui la déclenche |
> |---|---|---|
> | creer_echeancier | À la validation d'un véhicule financé (crédit ou LOA), engendre les échéances du contrat, de 1 à la durée du contrat : la date au jour d'échéance de chaque mois depuis le premier mois, la mensualité — celle déclarée pour la LOA, l'annuité constante du crédit —, et pour le crédit l'intérêt, l'amortissement et l'assurance ligne à ligne. Engendre l'échéancier une fois. | automatique, à la validation d'un financement à crédit ou en LOA ; sans relecture |
> | **Ajuster l'échéancier** | Après une modification du financement — le taux renégocié, la durée allongée, la mensualité revue —, recalcule l'échéancier depuis le paramétrage à plat : les échéances non payées sont remplacées, les payées restent. La relecture donne le bilan : conservées, supprimées, recréées. | un bouton, dans l'onglet Financement ; grisé hors crédit ou LOA, et après la clôture ; avec relecture |
> | clore_echeancier | À la vente du véhicule, supprime toutes les échéances non payées — la coche Payé étant calculée, la purge évite qu'un véhicule vendu voie ses échéances futures se « payer » seules. | automatique, à la clôture ; une fois |
> | finaliser_vehicule | À l'issue de la migration, complète ce que la reprise ne porte pas : la durée du contrat, gagnée du compte des échéances importées. Idempotent : ne complète que l'absent. | automatique, à l'issue de la reprise |
>
> **Les règles.** La vente ne précède pas l'achat — « La vente du
> *[Date de vente]* précède l'achat du *[Date d'achat]*. » *(l'exemple
> résolu par les libellés, faute de placeholder ou de défaut — D1229)*
>
> #### 3.2.1 La consommation
>
> **Une ligne du suivi de consommation — le plein ou la charge.** Une
> ligne par ravitaillement, numérotée au sein du véhicule.
>
> | Champ | Type | Obligatoire | Aide | Description |
> |---|---|---|---|---|
> | N° | un entier à partir de 1 | oui (identité) | Le rang dans la vie du véhicule — la première ligne part du kilométrage initial. | — |
> | Date | une date | oui | — | — |
> | Kilométrage compteur | un entier positif ou nul | oui | Le compteur du tableau de bord au moment du ravitaillement. | — |
> | Quantité | un nombre décimal | oui | Les litres ou les kWh du ravitaillement, selon le véhicule. | La valeur seule ; l'unité est au type du véhicule. |
> | Prix unitaire | un nombre décimal | non | Le prix du litre ou du kWh. | La devise est visuelle, celle du véhicule. |
> | *Prix total* | un nombre décimal, calculé | — | — | — |
> | *Nb de jours* | une durée, calculée | — | Depuis le ravitaillement précédent. | La première ligne reste nulle, comme au classeur. |
> | *Km parcourus* | un entier, calculé | — | Depuis le ravitaillement précédent. | La première ligne part du compteur au retrait. |
> | *Aux 100 km* | un nombre décimal, calculé | — | La consommation de l'intervalle — litres ou kWh aux 100 km. | — |
> | *Km prévu* | un nombre décimal, calculé | — | Le prorata du forfait annuel de la LOA depuis l'achat. | Les mois écoulés depuis l'achat, bornés à la vente, fois le douzième du forfait. Sans forfait, la colonne reste nulle. |
>
> **L'écran.** La liste, dans l'onglet Consommation du véhicule,
> éditable en ligne — les cinq saisies se corrigent dans la ligne, les
> calculés se refont. Au Bilan, la courbe de l'évolution de la
> consommation — la moyenne du mois.
>
> **Les règles.** Le ravitaillement ne précède pas l'achat — « Le
> ravitaillement du *[Date]* précède l'achat du *[Date d'achat]*. » ; le
> compteur n'est pas sous le kilométrage initial — « Le compteur
> *[Kilométrage compteur]* est sous le kilométrage initial
> *[Kilométrage initial]*. »
>
> #### 3.2.2 Entretiens et interventions
>
> **Une ligne du journal de vie — un frais, un événement, l'achat, la
> vente.**
>
> | Champ | Type | Obligatoire | Aide | Description |
> |---|---|---|---|---|
> | Date | une date | oui | — | — |
> | Désignation | un texte de 200 caractères au plus | oui | Le fait marquant — un frais, un événement, l'achat, la vente. | Le multi-ligne se déduit de la taille. *Exemple* : Changement du pneu avant droit. |
> | Montant | un nombre décimal | non | Optionnel — l'événement sans montant est licite, la vente en recette négative. | La devise est visuelle, celle du véhicule. |
> | Kilométrage | un entier positif ou nul | non | — | — |
> | Révision ? | oui / non | non | La ligne est une révision — sinon, une intervention hors révision. | Les révisions faites restent des lignes du journal. |
>
> **L'écran.** La liste, dans l'onglet Entretien, éditable en ligne.
> **La règle.** L'entretien ne précède pas l'achat — « L'entretien du
> *[Date]* précède l'achat du *[Date d'achat]*. »
>
> #### 3.2.3 Les révisions
>
> **Une règle de révision — le pas en kilomètres ou en délai, la
> notification à l'échéance.** Une règle se présente par sa
> désignation.
>
> | Champ | Type | Obligatoire | Aide | Description |
> |---|---|---|---|---|
> | Désignation | un texte de 60 caractères au plus | oui | — | *Exemple* : Révision constructeur. |
> | Tous les (km) | un entier positif ou nul | non | Le pas en kilomètres — « Révisions tous les 25 000 km ». | — |
> | Tous les (délai) | une durée | non | Le pas en délai — l'autre voie de l'échéancier ; 1y, 6m. | — |
> | *Dernière (km)* | un entier, calculé | — | — | Les révisions faites sont les lignes du journal marquées révision. |
> | *Dernière (date)* | une date, calculée | — | — | — |
> | *Prochaine (km)* | un entier, calculé | — | — | Depuis la dernière révision faite, sinon depuis l'origine du véhicule. |
> | *Prochaine (date)* | une date, calculée | — | — | — |
> | *Échue ?* | oui / non, calculé | — | La règle est à échéance — la notification part, la surface met en avant. | Sur le kilométrage ou sur le délai, tant que le véhicule est actif. |
>
> **L'écran.** La liste, dans l'onglet Révision, éditable en ligne sur
> les trois saisies. **L'opération** : notifier — automatique, dès que
> la règle est échue ; notifie tout le monde dans la zone des
> notifications de l'application, et par mail ceux dont le profil le
> demande. **La règle.** Une règle sans pas ne dit rien — « La règle
> "*[Désignation]*" n'a ni pas en kilomètres ni pas en délai. »
>
> #### 3.2.4 L'échéancier
>
> **Une échéance du financement — la ligne du tableau de crédit ou de
> LOA.**
>
> | Champ | Type | Obligatoire | Aide | Description |
> |---|---|---|---|---|
> | N° | un entier à partir de 1 | oui | Le rang de l'échéance — de 1 à la durée du financement. | — |
> | Date | une date | oui | Au jour d'échéance du mois, depuis le premier mois du financement. | — |
> | Intérêt | un nombre décimal | non | Le crédit seulement. | — |
> | Amortissement | un nombre décimal | non | Le crédit seulement. | — |
> | Assurance | un nombre décimal | non | Le crédit seulement — 34,40. | — |
> | Mensualité | un nombre décimal | oui | 473,86 pour le crédit, 434,48 pour la LOA. | — |
> | *Payé* | oui / non, calculé | — | Payée dès que la date du jour dépasse l'échéance. | La coche automatique. |
> | *Reste dû* | un nombre décimal, calculé | — | En début de période — le capital moins l'amorti (crédit), les loyers restants (LOA). | — |
>
> **L'écran.** La liste, dans l'onglet Financement, éditable en ligne
> sur les six données ; les lignes naissent de la création de
> l'échéancier et se remettent au paramétrage par l'ajustement (3.2).
>
> ### 3.3 Les consommations
>
> L'entrée de sous-menu : la liste de toutes les consommations, tous
> véhicules confondus, le véhicule en colonne — les champs de 3.2.1.
>
> ### 3.4 Les entretiens
>
> Tous les entretiens et interventions, tous véhicules confondus, le
> véhicule en colonne — les champs de 3.2.2.
>
> ### 3.5 Les révisions
>
> Toutes les règles de révision, tous véhicules confondus, le véhicule
> en colonne — les champs de 3.2.3 ; la liste des révisions échues est
> celle de l'accueil (3.1).
>
> ### 3.6 Les échéances
>
> Toutes les échéances, tous véhicules confondus, le véhicule en
> colonne — les champs de 3.2.4.

**Ce que la déclinaison relève** — les six frottements du 11/10 sont
soldés (D1227–D1228) ; la réécriture en ajoute deux :

7. **La description de l'entité et de ses champs avant l'écran**
   (D1232) : la section décrit l'entité, puis chaque champ, puis
   l'écran qui les dispose.
8. **Le type dans la table** (D1233) : la colonne « Type » dit le type
   en clair — « un texte de 40 caractères au plus », « l'un de :
   Thermique, Électrique », « une date, calculée » — ; la forme en
   clair de chaque type est sa facette documentation, à fixer au rang 2
   (D1160) : celles d'ici sont miennes.

## La complétude de la documentation — la déclinaison de le véhicule (le rang 8, étape 1)
*(La mesure au dépôt, `python tools/completeness.py examples/03_vehicule`, le 25/10/2026 — D1478–D1488 :
l'inventaire de documentation.md §20, le taux par documentation et par module, les manques par nature ;
la liste complète, le fichier et la clé d'accès, sort de l'outil. Les manques sont ceux du cas tel qu'il
est écrit : ils disent ce que le concepteur n'a pas décrit, jamais un défaut du socle.)*

### La version 1.0.0.0 (beta) — 82 %

| La documentation | (environnements) | (groups) | (hooks) | (projet) | transport | **la version** |
|---|---|---|---|---|---|---|
| fonctionnelle | — | 100 % (1/1) | — | — | 85 % (144/170) | **85 %** |
| dictionnaire | — | — | — | — | 78 % (68/87) | **78 %** |
| développeur | — | — | 100 % (4/4) | — | 80 % (4/5) | **89 %** |
| D.A.T. | 100 % (1/1) | — | — | — | — | **100 %** |
| guide | 0 % (0/1) | — | — | — | — | **0 %** |
| projet | — | — | — | 0 % (0/1) | — | **0 %** |

**82 %** — 222 éléments décrits sur 270 attendus, 28 manques.

| Le manque | Combien | La clé à écrire | La documentation |
|---|---|---|---|
| l'entité sans nom d'usage | 5 | `title:` | fonctionnelle |
| le champ sans aide ni description | 19 | `hint: ou description:` | fonctionnelle, dictionnaire |
| le libellé du champ absent — le nom nu s'affiche | 1 | `label:` | fonctionnelle |
| l'opération sans description, ni md, ni finalité | 1 | `description:, le md du hook ou rgpd.purpose:` | fonctionnelle, développeur |
| le projet sans texte de support | 1 | `pages: support:` | projet |
| l'environnement sans texte d'exploitation | 1 | `pages: operations:` | guide |

**Les orphelins** — 65 fichiers atteints depuis `syncytium.yml`, 65 fichiers dans le dossier ; un orphelin n'entre pas dans le taux : c'est peut-être un oubli — un texte écrit, jamais référencé.

Aucun orphelin.
