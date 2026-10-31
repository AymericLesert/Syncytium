# L'assistance et la documentation

## L'assistance — les trois groupes d'une surface (D1372)

Une surface — un écran, un wizard, un tableau de bord — porte trois
propriétés, chacune un groupe d'utilisateurs : qui traite une anomalie,
qui répond à une question fonctionnelle, qui enregistre une demande
d'évolution. À la création d'un ticket depuis le « ? » de la surface
(documentation.md §26, chapitre 3), le groupe destinataire est connu et
transmis automatiquement ; le gestionnaire du ticket se prend dans ce
groupe. Le bloc `assistance:` aux clés anglaises (D335), héritable par
la cascade du module et des settings (D359) — acquis, D1374.

Dans le cas 5 (entrepôt), `05_entrepot/versions/beta/v1.0.0.1/settings.yml` :

```yaml
# Le support
# Les groupes qui reçoivent les tickets ouverts depuis les écrans ; hérité par toutes les surfaces de la version.
assistance:

  # Les anomalies
  # L'administration de l'entrepôt : la reprise, la configuration.
  anomaly: administration

  # Les questions
  # La logistique, qui connaît les stocks et fait suivre aux autres services.
  question: logistique

  # Les évolutions
  # La direction, qui arbitre et planifie.
  evolution: direction
```

## La documentation — la facette des composants graphiques et des surfaces (D1158–D1159)

*(La rubrique de la matrice de
[documentation.md](../../documentation.md) §13.)*

**Tout composant graphique** porte `description:` par langue, qui
**entre au masque d'explication** de la surface qui le porte — le kpi
comme le champ (D1193) —, et **un mode d'usage**, le texte générique du
catalogue du moteur qui dit comment on s'en sert — le picker à création
directe, l'édition en ligne, le toggle —, que la documentation de
l'écran intègre à côté de la description du champ rendu (D1229).

**Les surfaces, dans la fonctionnelle** (D1194–D1196, D1227, D1229) :

- **la liste** — une section si une entrée de menu l'atteint (la
  première déclarée l'est par défaut, D438 ; les autres par le menu
  déclaré, D351/D439) ; placée dans un écran, elle se documente là ;
  la section dit ses colonnes par libellé, ses zones de recherche, ses
  actions, l'édition en ligne ;
- **le formulaire** — ses champs par libellé et aide, ses onglets et
  ses groupements (la `section` : l'explication d'un groupement vit
  dans la `description:` de l'écran et l'édition la porte sur le
  groupement, D1190) ; le formulaire d'appel d'une opération (D775)
  rend, sur la planche, le bouton puis le formulaire (D1210) ; **ses
  champs libres comptent dans la complétude** (D1230) ;
- **le widget** de résumé et de liste — ce qu'il montre ;
- **le tableau de bord** — une section, s'il est au menu (D1227 :
  l'accueil du module) ; il décrit par renvoi ce qu'il assemble ;
- **le graphique** — documenté sur l'écran qui le porte (D1229) : ce
  qu'il mesure, ses axes, ses filtres ;
- **le wizard** — un scénario du persona qui l'atteint (D1130, D1201) :
  son `title:` est le but, ses steps les étapes, ses opérations les
  actes, chaque step avec l'image de son écran ; **sa planche** se
  dessine step par step (D1188, D1205) ; un scénario écrit peut le citer
  par `[@nom]` ;
- **le template** — le gabarit des éditions et des planches (D1143,
  D1166) : la couverture, le cartouche (D1142), le filigrane d'une beta
  (D1145), la dimension de page.

**Le masque d'explication** (§7 — D1190–D1193) : la description de la
surface, puis, pour chaque composant qui en a, sa description ; le
« ? » le montre, mène à la page de l'écran et porte l'assistance
(D1192) ; le glossaire s'y lit au survol (D1184).

**Les surfaces et les composants graphiques, dans le dictionnaire de la
donnée** (la colonne 2 — le rang 2) : presque rien d'eux-mêmes — le
dictionnaire décrit la donnée, non l'écran (D1241, D1246). Ce qui passe :
**à l'index 5.1**, les écrans, les listes et les rapports qui lisent un
champ (D1198, D1263) ; **au chapitre 3**, les `searchable:`, `sort:` et
`filter:` des listes, origines des index (D1292) ; **au chapitre 4.3**,
les opérations qu'un écran déclenche, par leur contrat (D1262) ; **le
formulaire du socle** suit les groupes de champs (D1273). La forme en
clair d'un type (D1301) nomme son composant par défaut sans le décrire.

**Les surfaces et les composants, dans la réglementation** (la colonne 5
— le rang 3) : **le `paragraph` ancre la mention** `rgpd.notice`
(D1335) — sur un formulaire, la page d'accueil, une édition ; sans
ancrage, le manque est notifié ; **le wizard est une suite
d'opérations**, un traitement du registre quand une étape touche un
champ marqué (D1318, D1329) ; **chaque composant, du socle ou ajouté,
passe les tests du RGAA à l'ingestion** (D1339–D1340) — le chapitre de
l'accessibilité en montre le résultat par critère et par composant.

**Les surfaces et les composants, dans le projet et le support** (la
colonne 8 — le rang 4) : **la surface porte le bloc `assistance:`** —
les trois groupes, les anomalies, les questions, les évolutions,
héritable par la cascade (D1372, D1374) ; **son « ? »** ouvre la
documentation de l'écran, un ticket, une question, la recherche
générale (D1366, D1371) ; le ticket porte l'ancre de la surface et
l'enregistrement montré (D1364) ; les questions closes de la surface
rejoignent la F.A.Q. de la fonctionnelle (D1367, D1373) ; les
composants graphiques, rien.

**Les surfaces et les composants, dans la documentation du
développeur** (la colonne 3 — le rang 5) : **un composant personnalisé**
a sa fiche à l'inventaire — le visage, les modes, les types rendus, le
RGAA critère par critère avec le md qui explique un échec, les surfaces
qui l'emploient (D1406–D1407) ; **le hook d'interface** listé à part,
avec les pages où il est chargé (D918, D1407) ; **le wizard** exposé à
l'API est une suite d'opérations, son contrat d'appel au chapitre de
l'entité ; les surfaces du socle, rien de propre — la référence de
Syncytium (D1411).

**Les surfaces et les composants, dans le D.A.T.** (la colonne 4 — le
rang 6) : **les postes informatiques des utilisateurs** — les navigateurs supportés
par le core et leur version minimale (D1430) ; **le hook d'interface**,
le seul code tiers au navigateur, nommé (D918, D1407) ; rien d'autre.

**Les surfaces et les composants, dans le guide d'exploitation** (la
colonne 9 — le rang 7) : rien de propre — le tableau de bord de la
santé est une surface du socle, l'accueil de l'administrateur (D1452),
et le « ? » de chaque surface renvoie au guide.

**Le composant, dans la promotionnelle** (la colonne 6 — le rang 9) : une
surface marquée `promotional: true` est offerte à la plaquette (D1499) —
elle y entre sous le persona de son groupe, ou à sa place dans le plan
`pages: promotional:` — et **porte dans l'application la marque du
socle « un point clé du projet »** (D1501), qui ouvre la plaquette à son
item ; un plan qui cite une vue non marquée est une erreur d'ingestion
(D1500) ; l'écran se rend lui-même, peuplé des `placeholder:` (D1129,
D1498) ; le wizard est un cas d'usage, par le scénario de son persona
(§22, D1498).

**Le composant, dans la maintenance, les risques et les améliorations**
(la colonne 7 — le rang 8) : **les usages** — les ouvertures de chaque
surface, l'écran jamais ouvert, sur sa page (D1168, D1489) ; **les
améliorations** — l'écran jamais ouvert candidat au retrait ou au
regroupement, l'écran qui suscite le plus de questions et de demandes
(D1495, §25) ; la proposition datée, pour l'administrateur.
