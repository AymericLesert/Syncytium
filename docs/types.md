# Le catalogue des types de Syncytium

Ce document référence **tous les types consignés** — le quatrième
artefact préparatoire de la documentation (Q58, le domaine 6 — D602),
après le [glossaire](glossaire.md), le [catalogue des
composants](composants.md) et les [hooks](hooks.md). Chaque type
renvoie à ses décisions dans la [conception](conception.md) ; les
composants par défaut et compatibles vivent dans la synthèse de
composants.md.

## Le socle commun

- **le nom du type est la clé** (D408) — un seul espace de noms :
  le catalogue, les types personnalisés (D359), les entités (D396 —
  le raccourci de référence), les types-hooks ; le doublon = une
  erreur d'ingestion ;
- **le kit des facettes** (commun à tous — D391) : `label` (les
  libellés par langue — D465), `description`/`comment` (l'aide,
  l'infobulle — D209/D258), `validation` (les règles, expression D90
  booléenne + message), `values` (l'énuméré — la clé stockée, les
  libellés, la description, l'icône ; l'attention aux migrations à
  valeur intercalée), `searchable` (strict / normalized /
  similarity[0.8] / range / mutualizable[nom] — selon le type),
  `mask`, `report:` (`no` par défaut — D406), la confidentialité
  (D25/D364), **`rgpd:`** (`personal` / `sensitive` / `consent` —
  D695, l'anonymisation D696), **`trace:`** (`audit` / `limited` —
  D703 ; le sensitive audité d'office), `component`/`style`/`size`
  (la cascade D461 — le plus proche l'emporte) ;
- **le tri et le nul** (D368 et suivantes) — chaque type porte sa
  règle ; **le nul des composés se trie en premier** (D391) ;
- **la signature du type** (D579–D584) : **la conversion
  intrinsèque** (la fonction au nom du type — `text(x)`, `date(x)` ;
  la promotion implicite sans perte seulement — D581), **la table des
  opérateurs** (les combinaisons admises, le type du résultat), **les
  comparateurs** (l'ordre des règles de tri), **le `select`**
  (`valeur.select(cas: …, "...": défaut)`), **les fonctions dédiées**
  (`distance` de la géolocalisation — D579 ; **`extract` du texte** :
  l'extraction par la regex, la capture unique ou **plusieurs noms
  simultanément par les groupes nommés**, les valeurs au point —
  D817) ;
- **le typage statique à l'ingestion** (D581) — l'inférence de la
  feuille à la racine, jamais une erreur de type à l'exécution ;
- **la conversion vers le stockage** (D681–D682 — le patron
  visiteur) : le contrat d'un type inclut ses règles de conversion
  vers un storage — la classe storage visite le type, le type se
  décrit, la classe rend la forme native ; le contrat couvre **les
  trois gestes du champ** (la création, la modification —
  l'altération + le transcodage —, la suppression) **et les
  fonctions de valeur** (D683 — `create`/`update`/`read` d'une
  valeur) **et l'identification** (D684 — le type se reconnaît dans
  la structure native à l'introspection) ; le hook de type les
  fournit ;
- **le type personnalisé** (D359) : déclaré au `settings` (l'instance,
  le module ou l'entité) — un nom, un type de base, des facettes
  figées ; **le chaînage possible** ; les types custom ne portent pas
  le graphe de conversion ;
- **le composant par défaut porte le nom du type** (D458).

## Les types simples

| le type | la nature et les facettes propres | le tri, le nul | D |
|---|---|---|---|
| `boolean` | les trois états (faux → vrai → nul) ; `required` retire le nul (la recherche strict filtre alors vrai & faux par la case « null ») | null < faux < vrai | D373–D375 |
| `text` | la taille `auto` ou `text[30]` (les bornes au nom — D366) ; le masque (`_`, `9`, les littéraux, les classes — il pilote les lignes) ; mono/multi-ligne **déduit de la taille** face au seuil d'instance ; la recherche complète (strict/normalized/similarity/mutualizable) | le nul = la chaîne vide | D259–D265, D366–D370 |
| `integer` | les bornes au nom (`integer[100]`, `integer[0..100]`, `integer[0..]`) ou `min`/`max` ; **les octets jamais déclarés** — dimensionnés selon les bornes ou les valeurs (« le mode auto ») ; le masque (`000000`, `00 00 00`) ; la recherche `range` | le nul = 0 | D371–D372 |
| `decimal` | les décimales (le setting ou 2) ; **le stockage exact ou réel** (`storage:` — l'entier aux décimales converties) | le nul = 0 | D376–D378 |
| `duration` | le masque — **la virgule : l'heure ou la minute en centièmes, l'heure en dix-millièmes** ; les unités `s`/`min`/`h`/`d`/`w`/`m`/`y` (D476) ; **les sous-items au point** (D837) — `.days`, `.months`… | le nul = 0 | D380, D476, D837 |
| `date` | **la nature au crochet** : `date[yyyy-mm]`, `date[yyyy-mm-dd]`, `date[yyyy-ww]`… — la plus fine par défaut ; le masque de la langue (le `mask` déclaré pilote aussi **la lecture des sources** — D820) ; les bornes en littéraux ISO ; `date - date → duration` (D581), `date + duration → date` (D837) ; **les sous-items au point** (D837) — `.day`, `.month`, `.year`, `.week`, `.day_name`… | le nul en tête | D381–D383, D820, D837 |
| `time` | la précision au crochet (`time[hh:mm]`) | le nul en tête | D381 |
| `datetime` | la nature au crochet : `datetime[raw]` (défaut) \| `datetime[timestamp]` ; la précision en second paramètre | le nul en tête | D381 |
| `file` | les `extensions` (`[pdf, docx]` ou la forme à libellés `{ pdf: { fr: facture } }` — elle guide le dépôt) ; le `quota` contrôlé à la volée | — | D160–D165, D292, D384 |
| `image` | dérive de `file` ; **la boîte maximale au crochet** (`image[512x512]`) — la vignette automatique ; le `placeholder` (l'icône de fond — D390) ; le champ image d'une entité = **le visage** sélectionnable (D386) | — | D385–D390 |
| `thumbnail` | la vignette seule — l'image réduite d'un fichier | — | D389, D393 |
| `uuid` | les identifiants externes (les systèmes tiers, les clés de reprise) ; la validation intégrée, le stockage compact ; **la saisie et la lecture en texte formaté** (D499) — l'UUID interne reste hors déclaration (D142) | — | D419, D499 |
| `password` | la saisie masquée aux garanties structurelles — jamais relue | — | D463 |
| `color` | **le stockage : un entier** (le RGB(A) assemblé) ; **l'affichage en hexadécimal** (`#RRGGBB`, l'alpha en option) ; **la base des couleurs nommées** → RGB (`red`, `orange`, `green` — celles de `colors:` D467) | le tri sur l'entier, le nul en premier | D496 |

## Les composés

Ils héritent du kit de la base + la validation intégrée + leurs
facettes propres (D391). Le nul de chaque composé se trie en premier.
**Les sous-items au point** (D772–D773) : chaque composé expose ses
parties nommées **via des fonctions du type** — `montant.value`,
`montant.currency` (amount), les coordonnées et l'adresse
(geolocation — D638), les bornes (period)… ; la conversion se
compose avec le constructeur (D659) :
`amount(montant.value / 6.55957, EUR)`.

| le type | la nature et les facettes propres | D |
|---|---|---|
| `amount` | les devises paramétrables (`currencies` — défaut : tout l'ISO) ; `amount + amount` à devise compatible, `amount * decimal` (D581) ; **les parties au point** : `montant.value`, `montant.currency` (D771–D772) — la conversion au constructeur `amount(v, EUR)` (D659) | D391, D771–D772 |
| `percentage` | les bornes — défaut 0..100 ; hors cadre, **la représentation varie** (la jauge vaut pour le cadre) | D273–D274, D391 |
| `measure` | les unités : **statiques** (`units: [kg, g, t]`), **la table de référence** (`units: stock.unit`), ou **libres** (défaut) | D391 |
| `phone` | le national (défaut) ou l'international | D391 |
| `geolocation` | **les coordonnées longitude/latitude et/ou l'adresse postale normalisée** (D638 — la saisie, le GPS ou le géocodage D294/D637 qui réunit les deux) + **le texte associé** (D392 — l'adresse normalisée en premier visage) ; **le tri = la distance à vol d'oiseau à une focale** (`focus:` au champ ou au setting — défaut : la localisation courante) ; la conversion en texte = le texte associé, sinon les coordonnées standardisées ; `distance`/`euclide` (D579) | D291, D294, D391–D392, D637–D638 |
| `period` | hérite du format date/heure — le crochet (`period[yyyy-mm]`…) ; **début ≤ fin intégré** ; la recherche `range` en usage roi | D391 |
| `email`, `url`, `vat_number`, `siren`, `siret`, `iban`, `bic` | la règle générale — la validation intégrée suffit ; `url` : **le lien en lecture** (le nouvel onglet, l'icône post-zone, l'ellipse en cellule — D563) | D391, D563 |
| `communication` | le fil (un canal = un champ, non listable — D166) ; `attachments: false` (défaut) ou le type d'attaché à plat ; la visibilité par la confidentialité ; la recherche sur le contenu des messages | D295, D393 |
| `label` | l'accès au catalogue des labels (D440) ; **le gabarit nommé paramétrable** — `label(mon_nom, { prenom: … })` ou l'enregistrement en paramètre (`label(mon_nom, customer)`) ; l'ordre des mots par langue | D585–D586 |

## Les collections et les plages

| le type | la nature | D |
|---|---|---|
| `list of <type simple>` | « la phrase se lit » ; **les facettes du champ s'appliquent à chaque élément** ; les énumérés (`values:`) → la multi-sélection ; **la collection est un type — elle porte les agrégats en méthodes** (`sum`, `count()`, `avg`, `min`/`max`, `first`, `last`, `any`, `exists` — l'élément en contexte implicite) | D296, D362, D580 |
| `range of <type>` | « la déclinaison de `list of` avec 2 contraintes en nombre et en ordre » — deux valeurs, la première ≤ la seconde (la contrainte intégrée) ; **min et/ou max indéfinissables** (la plage ouverte) ; les libellés sur trois éléments (min, value, max) ; **la jauge = un cas particulier d'un range** | D497–D498 |

## Les liens

| le type | la nature | D |
|---|---|---|
| la référence — `<module>.<entité>` | « si le type est le nom d'une entité, c'est une référence » (le `to` inutile) ; **l'origine se lit par `me.`** dans le filtre ; `check: selection` (défaut) \| `immutable` ; l'accès retour automatique (la liste nommée) | D394–D398, D216 |
| la composition — `list of <entité>` | le lien de possession : le parent déclare, l'enfant ne déclare rien ; **l'agrégat = le grain d'écriture** (indivisible) | D399–D400, D420 |
| l'association — `association with <entité>[.<champ>]` | plusieurs, libres, inter-modules — sans cascade ; reprend les propriétés de la référence (filter/me./check, l'affichage au visage) ; **le champ de destination au point** (D761–D762 — le défaut : le champ au nom de l'entité ; `association with order.billing` à l'ambiguïté) | D400–D401, D761–D762 |
| le lien n-aire — `list of [a, b]` / `association with [a, b]` | **chaque élément = une combinaison des entités nommées**, des propriétés par entité nommée | D402 |
| l'association dérivée — `association with <entité> if …` | la vue navigable, jamais stockée, en lecture — la vérité reste la référence | D405 |
| l'accès montant | **`owner`** — le possesseur d'une composition (unique — D760/D761) ; l'associé s'atteint **par son champ de référence** | D760–D761 |

## Les générés et le contexte

| le type | la nature | D |
|---|---|---|
| `counter` | le compteur — attaché au champ ou **mutualisé** (`counter[mon_compteur]`) ; la réinitialisation sur la déclaration (`reset: never` défaut) ; lecture seule partout, « *(attribué à la validation)* » en création | D154–D155, D297, D409–D410 |
| le champ calculé | `formula:` — l'expression D90 ; lecture seule, **recalculé dès qu'une dépendance change** ; son composant = celui de son type de résultat ; les valeurs nommées d'une fonction se lient au point (D593) | D255, D298 |
| le statut — `states:` | désigne le porteur (la hiérarchie D353 ou le champ énuméré) ; le graphe promote/demote ; un seul statut par entité | D421–D427 |
| l'entité `context` | le moteur, lecture seule — `user` (traversable), `location`, `now`, `instance`/`application`/`module`, `entity`/`field`, `file`/`page`/`pages` (au document), `settings.<nom>` (les paramètres statiques/dynamiques en cascade) ; l'entité homonyme prend le pas (le warning à l'ingestion) | D254, D588–D591 |

## Les types-hooks

Tout type ajouté suit le contrat de la famille (voir
[hooks.md](hooks.md)) : la signature complète (la conversion, les
opérateurs, les comparateurs, les fonctions dédiées, le tri) et **la
représentation obligatoire** — « aucun type sans visage » (D459).
L'exemple fondateur : le type `progression` (`integer[0..100]` +
`component: fuel`), le champ `avancement: progression`.
