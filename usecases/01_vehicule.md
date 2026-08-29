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

*(à écrire morceau par morceau — le protocole D457/D756, comme le
compte bancaire : la racine et l'environnement, le modèle, les
opérations, les surfaces, la reprise)*

## Les manques relevés

*(chaque frottement deviendra une décision)*
