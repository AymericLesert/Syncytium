# L'assistance et la documentation

Ce fichier ferme le catalogue par deux parties qui valent pour toutes les
surfaces et tous les composants graphiques :

- **l'assistance** : les trois groupes d'utilisateurs qu'une surface
  nomme pour recevoir les tickets ;
- **la documentation** : ce que les composants et les surfaces apportent
  à chacune des neuf documentations.

## L'assistance — les trois groupes d'une surface

> **L'assistance** est la F.A.Q. vivante du socle. L'utilisateur pose une
> question depuis un écran. Le concepteur ou un responsable métier
> répond. La question répondue nourrit la F.A.Q. générée, le chat et la
> complétude ([glossaire](../../glossaire.md)).

La question est l'un des trois types de support (D1367). Une surface, un
écran, un wizard ou un tableau de bord, porte trois propriétés (D1372).
Chacune nomme un groupe d'utilisateurs :

- `anomaly:`, le groupe qui traite une anomalie ;
- `question:`, le groupe qui répond à une question fonctionnelle ;
- `evolution:`, le groupe qui enregistre une demande d'évolution.

L'utilisateur ouvre un ticket depuis le « ? » de la surface
([documentation.md](../../documentation.md) §26). Le groupe destinataire
est alors connu. Il est transmis sans que l'utilisateur ait à le choisir.
Le gestionnaire du ticket se prend dans ce groupe.

Les trois propriétés forment le bloc `assistance:`, aux clés anglaises
(D335). Le bloc s'hérite par la cascade du module et des settings (D359,
D1374) : déclaré une fois dans les settings de la version, il vaut pour
toutes ses surfaces.

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

## La documentation — la facette des composants graphiques et des surfaces

> **Une facette** est l'un des modes de représentation d'un élément de la
> configuration : la valeur logique, le stockage, l'affichage, la forme
> d'API. La documentation en est une (D1158) : chaque composant dit ce
> qu'il apporte à chaque document, et Syncytium assemble
> ([glossaire](../../glossaire.md)).

Les neuf documentations et leur matrice sont décrites dans
[documentation.md](../../documentation.md) §13 (D1158–D1159). Cette
partie en remplit la ligne des composants graphiques et des surfaces :
documentation par documentation, ce qu'ils y apportent. La colonne citée
sous chaque titre est celle de la matrice.

### Ce que tout composant graphique apporte

Deux propriétés valent pour tous les composants graphiques, le kpi comme
le champ :

- **`description:`**, par langue. Son texte entre au masque
  d'explication de la surface qui porte le composant (D1193).
- **le mode d'usage**, le texte générique du catalogue du moteur qui dit
  comment on se sert du composant : le picker à création directe,
  l'édition en ligne, le toggle. La documentation de l'écran le place à
  côté de la description du champ rendu (D1229).

### La fonctionnelle (la colonne 1)

Chaque surface y a sa place (D1194–D1196, D1227, D1229) :

- **la liste** fait une section quand une entrée de menu l'atteint. La
  première liste déclarée est au menu par défaut (D438). Les autres y
  entrent par le menu déclaré (D351, D439). Placée dans un écran, elle
  se documente là. La section dit ses colonnes par libellé, ses zones de
  recherche, ses actions, l'édition en ligne.
- **le formulaire** dit ses champs par libellé et aide, ses onglets et
  ses groupements. L'explication d'un groupement, la `section`, vit dans
  la `description:` de l'écran. L'édition la porte sur le groupement
  (D1190). Le formulaire d'appel d'une opération (D775) se rend sur la
  planche par le bouton, puis le formulaire (D1210). Ses champs libres
  comptent dans la complétude (D1230).
- **le widget** de résumé et de liste dit ce qu'il montre.
- **le tableau de bord** fait une section s'il est au menu, comme
  l'accueil du module (D1227). Il décrit par renvoi ce qu'il assemble.
- **le graphique** se documente sur l'écran qui le porte (D1229) : ce
  qu'il mesure, ses axes, ses filtres.
- **le wizard** fait un scénario du persona qui l'atteint (D1130, D1201).
  Son `title:` est le but. Ses steps sont les étapes. Ses opérations sont
  les actes. Chaque step porte l'image de son écran. Sa planche se
  dessine step par step (D1188, D1205). Un scénario écrit peut le citer
  par `[@nom]`.
- **le template** est le gabarit des éditions et des planches (D1143,
  D1166) : la couverture, le cartouche (D1142), le filigrane d'une beta
  (D1145), la dimension de page.

**Le masque d'explication** est l'aide en ligne de l'écran
([documentation.md](../../documentation.md) §7 ; D1190–D1193). Il
assemble la description de la surface, puis, pour chaque composant qui
en a une, sa description. Le « ? » le montre, mène à la page de l'écran
et porte l'assistance (D1192). Le glossaire s'y lit au survol (D1184).

### Le dictionnaire de la donnée (la colonne 2)

Le dictionnaire décrit la donnée, non l'écran (D1241, D1246). Les
surfaces et les composants graphiques n'y disent presque rien
d'eux-mêmes. Ce qui passe :

- à l'index 5.1, les écrans, les listes et les rapports qui lisent un
  champ (D1198, D1263) ;
- au chapitre 3, les `searchable:`, `sort:` et `filter:` des listes, à
  l'origine des index (D1292) ;
- au chapitre 4.3, les opérations qu'un écran déclenche, par leur
  contrat (D1262) ;
- le formulaire du socle suit les groupes de champs (D1273).

La forme en clair d'un type (D1301) nomme son composant par défaut, sans
le décrire.

### La réglementation (la colonne 5)

- **Le `paragraph` ancre la mention** `rgpd.notice` (D1335) : sur un
  formulaire, sur la page d'accueil, sur une édition. Sans ancrage, le
  manque est notifié.
- **Le wizard est une suite d'opérations.** Il entre au registre des
  traitements quand une étape touche un champ marqué (D1318, D1329).
- **Chaque composant passe les tests du RGAA à l'ingestion**, qu'il soit
  du socle ou ajouté (D1339–D1340). Le chapitre de l'accessibilité en
  montre le résultat, par critère et par composant.

### Le projet et le support (la colonne 8)

- **La surface porte le bloc `assistance:`** : les trois groupes, pour
  les anomalies, les questions et les évolutions, héritable par la
  cascade (D1372, D1374).
- **Son « ? »** ouvre la documentation de l'écran, un ticket, une
  question, la recherche générale (D1366, D1371).
- **Le ticket** porte l'ancre de la surface et l'enregistrement montré
  (D1364).
- **Les questions closes** de la surface rejoignent la F.A.Q. de la
  fonctionnelle (D1367, D1373).
- **Les composants graphiques** n'y apportent rien.

### La documentation du développeur (la colonne 3)

- **Un composant personnalisé** a sa fiche à l'inventaire : son visage,
  ses modes, les types qu'il rend, le RGAA critère par critère avec le
  md qui explique un échec, les surfaces qui l'emploient (D1406–D1407).
- **Le hook d'interface** est listé à part, avec les pages où il est
  chargé (D918, D1407).
- **Le wizard** exposé à l'API est une suite d'opérations. Son contrat
  d'appel est au chapitre de l'entité.
- **Les surfaces du socle** n'y ont rien de propre : la référence de
  Syncytium les décrit (D1411).

### Le D.A.T. (la colonne 4)

- **Les postes informatiques des utilisateurs** : les navigateurs
  supportés par le core et leur version minimale (D1430).
- **Le hook d'interface**, le seul code tiers au navigateur, est nommé
  (D918, D1407).
- Rien d'autre.

### Le guide d'exploitation (la colonne 9)

Les surfaces et les composants n'y ont rien de propre :

- le tableau de bord de la santé est une surface du socle, l'accueil de
  l'administrateur (D1452) ;
- le « ? » de chaque surface renvoie au guide.

### La promotionnelle (la colonne 6)

- **Une surface marquée `promotional: true`** est offerte à la plaquette
  (D1499). Elle y entre sous le persona de son groupe, ou à sa place dans
  le plan `pages: promotional:`.
- **Elle porte dans l'application la marque du socle « un point clé du
  projet »** (D1501). La marque ouvre la plaquette à son item.
- **Un plan qui cite une vue non marquée** est une erreur d'ingestion
  (D1500).
- **L'écran se rend lui-même**, peuplé des `placeholder:` (D1129,
  D1498).
- **Le wizard** est un cas d'usage, par le scénario de son persona
  ([documentation.md](../../documentation.md) §22 ; D1498).

### La maintenance, les risques et les améliorations (la colonne 7)

- **Les usages** : les ouvertures de chaque surface, et l'écran jamais
  ouvert, sur sa page (D1168, D1489).
- **Les améliorations** : l'écran jamais ouvert est candidat au retrait
  ou au regroupement ; l'écran qui suscite le plus de questions et de
  demandes est relevé (D1495 ;
  [documentation.md](../../documentation.md) §25). La proposition est
  datée, pour l'administrateur.
