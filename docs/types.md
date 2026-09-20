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
  libellés par langue — D465), `description`/`hint` (l'aide,
  l'infobulle — D209/D258), `validation` (les règles, expression D90
  booléenne + message), `values` (l'énuméré — la clé stockée, les
  libellés, la description, l'icône ; l'attention aux migrations à
  valeur intercalée), `searchable` (strict / normalized /
  similarity[0.8] / range / mutualizable[nom] — selon le type),
  `default` (la valeur de naissance — D424), **`unchanged`** (D941 —
  `true` : le champ possédé par la cible, que la migration n'écrit
  pas ; il naît à son `default` et garde sa valeur, la saisie restant
  libre ; une règle de migration qui l'alimente = une erreur
  d'ingestion ; `false` par défaut), `mask`, `report:` (`no` par défaut —
  D406), la confidentialité
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
  comparateurs** (l'ordre des règles de tri), **le `if` suffixé et sa chaîne** (`valeur if condition`, D580 ; *`valeur if condition else valeur if condition else valeur` — les cas dans l'ordre, le dernier sans condition : en proposition, D1003*), **le `select`**
  (`valeur.select(cas: …, "...": défaut)` — **deux conduites** (D1002) : sans `"..."`, une valeur hors des cas est rejetée ; avec `"..."`, toutes les autres valeurs sont cadrées ou traitées par ce cas ; `null:` nomme le cas du nul, le vide du texte — *forme mienne*), **les fonctions dédiées**
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
  le graphe de conversion ; **la forme, une seule pour les types et
  leurs dérivés** (D991–D992 — « les types ou ses dérivés doivent être
  présentés simplement et sont définissables avec des paramètres par
  défaut ») : aux settings, **la clé est le nom** ; sans `type:`, elle
  règle les défauts d'un type du catalogue — `text: { normalize:
  trim(me) }` ; avec `type:`, elle définit un dérivé qui hérite de sa
  base et surcharge ce qu'il nomme — `date_pmi: { type: date, mask:
  "yyyymmdd" }`, `progression: { type: integer[0..100], component:
  fuel }` ; le dérivé d'un dérivé se résout à l'ingestion (le cycle =
  une erreur) ; le champ garde le dernier mot (`ARCJCRE: { type:
  date_pmi, mask: "yyyymm" }`) ; un dérivé ne redéfinit jamais un type
  du catalogue (D408) ; l'usage par la forme courte (D356) — `ARCJCRE:
  date_pmi` ;
- **le composant par défaut porte le nom du type** (D458).

## Les types simples

| le type | la nature et les facettes propres | le tri, le nul | D |
|---|---|---|---|
| `boolean` | les trois états (faux → vrai → nul) ; `required` retire le nul (la recherche strict filtre alors vrai & faux par la case « null ») | null < faux < vrai | D373–D375 |
| `enum` | les valeurs `values:` — la clé → les libellés, la description, l'icône ; **l'ordre de déclaration = la présentation et le tri** ; **le stockage numérique** (la clé chaîne → un code interne stable — attention à l'ajout intercalé en migration) ; la recherche par le composant multi-sélection ; l'entrée `null:` pour libeller le vide *(la ligne manquait au tableau — relevée par le cas 3, D882)* | le nul en tête | D387–D388 |
| `text` | la taille `auto` ou `text[30]` (les bornes au nom — D366) ; le masque (`_`, `9`, les littéraux, les classes — il pilote les lignes) ; mono/multi-ligne **déduit de la taille** face au seuil d'instance ; la recherche complète (strict/normalized/similarity/mutualizable) ; **la facette `barcode: <nature>`** (D988 — « la valeur du code-barres est un texte, la facette est un barcode », pas de type) : ean13, ean8, code128, qr… (D542) — elle **valide** le texte (les 13 chiffres et la clé de contrôle de l'EAN 13) et **le composant de sortie** (D300) la lit pour rendre les barres — `ean13: { type: text[13], barcode: ean13 }` | le nul = la chaîne vide | D259–D265, D366–D370, D988 |
| `integer` | les bornes au nom (`integer[100]`, `integer[0..100]`, `integer[0..]`) ou `min`/`max` ; **les octets jamais déclarés** — dimensionnés selon les bornes ou les valeurs (« le mode auto ») ; le masque (`000000`, `00 00 00`) ; la recherche `range` | le nul = 0 | D371–D372 |
| `decimal` | les décimales (le setting ou 2) ; **le stockage exact ou réel** (`storage:` — l'entier aux décimales converties) | le nul = 0 | D376–D378 |
| `date` | **la nature au crochet** : `date[yyyy-mm]`, `date[yyyy-mm-dd]`, `date[yyyy-ww]`… — la plus fine par défaut ; le masque de la langue (le `mask` déclaré pilote aussi **la lecture des sources** — D820) ; les bornes en littéraux ISO ; `date - date → duration`, `date + duration → date` — la table d'opérateurs du type (D581/D838) ; **les sous-items au point** — `.day`, `.month`, `.year`, `.week`, `.day_name`… (les fonctions du type — D772–D773/D838) | le nul en tête | D381–D383, D820, D838 |
| `time` | la précision au crochet (`time[hh:mm]`) | le nul en tête | D381 |
| `datetime` | la nature au crochet : `datetime[raw]` (défaut) \| `datetime[timestamp]` ; la précision en second paramètre ; **le constructeur `datetime(jour, heure)`** (D659/D1001 — le mouvement de PMI : `datetime(MVCJSAI, MVCTSAI)`, le jour et l'heure déjà typés) ; *une part nulle rend le nul — en proposition* | le nul en tête | D381, D1001 |
| `file` | les `extensions` (`[pdf, docx]` ou la forme à libellés `{ pdf: { fr: facture } }` — elle guide le dépôt) ; le `quota` contrôlé à la volée ; **la valeur = les descripteurs du fichier** (D972) : « le nom du fichier, sa taille, sa date de création, sa date de dernière modification, éventuellement une clé de hashage si la propriété file `hash` est `true` » — le contenu derrière ; **les parties au point** (D772) : **`.relativepath`** — le nom du fichier apparent ou saisi, relatif au répertoire du connecteur, la partie portée ; **`.fullname`** le chemin complet, **`.filename`** le nom seul, **`.pathname`** le répertoire — recalculés depuis `.relativepath` (les quatre de l'auteur) ; puis `.size`, `.created`, `.modified`, `.hash` (*miens*) ; **le différentiel** (D672) compare les descripteurs, le contenu n'est relu qu'à l'écart ; **la facette `hash: true`** ajoute l'empreinte ; **rempli par un connecteur `file`** dans une règle du mapping — `plans: plans.files(ARCTFICPLA)` (D883/D972) ; **les opérations du type** (D974 — « la lecture, le déplacement, la suppression, la lecture du hashage » ; *les noms miens*) : `.read()` le contenu binaire, `.read(text)` le texte — « à fournir pour la partie CSV ou pour le watcher » (D635/D636) —, `.move(destination)` (celui que `commit` emploie, D973), `.delete()`, `.hash()` l'empreinte à la demande | — | D160–D165, D292, D384, D972–D974 |
| `image` | dérive de `file` ; **la boîte maximale au crochet** (`image[512x512]`) — la vignette automatique ; le `placeholder` (l'icône de fond — D390) ; le champ image d'une entité = **le visage** sélectionnable (D386) | — | D385–D390 |
| `thumbnail` | la vignette seule — l'image réduite d'un fichier | — | D389, D393 |
| `uuid` | les identifiants externes (les systèmes tiers, les clés de reprise) ; la validation intégrée, le stockage compact ; **la saisie et la lecture en texte formaté** (D499) — l'UUID interne reste hors déclaration (D142) | — | D419, D499 |
| `password` | la saisie masquée aux garanties structurelles — jamais relue | — | D463 |
| `color` | **le stockage : un entier** (le RGB(A) assemblé) ; **l'affichage en hexadécimal** (`#RRGGBB`, l'alpha en option) ; **la base des couleurs nommées** → RGB (`red`, `orange`, `green` — celles de `colors:` D467) | le tri sur l'entier, le nul en premier | D496 |

**Les fonctions du texte (D934).** « trim, upper, right, mid, …
doivent figurer au catalogue sur un champ texte » — le type `text`
emmène ses fonctions (D579), employées par les règles du mapping, les
calculés et les normalisations :

| la fonction | le geste | D |
|---|---|---|
| `trim(t)` | les blancs de tête et de fin retirés — la normalisation des `nchar` : le défaut du type aux settings, sous le nom du type — `text: { normalize: trim(me) }` (D991 — les settings portent les paramètres par défaut des types et la définition de nouveaux types, D359) ; la surcharge au champ (D872) | D870/D872, D991 |
| `upper(t)` / `lower(t)` | la casse | D656 |
| `left(t, n)` / `right(t, n)` | les n premiers / derniers caractères (`right("0000" + me, 4)`) | D870 |
| `mid(t, début, longueur)` | la sous-chaîne | D934 |
| `length(t)` | la longueur | D934 |
| `t1 + t2` | la concaténation | D870 |
| `t like "regex"` | la comparaison régulière | D818 |
| `extract(t, "regex")` | l'extraction par la regex — la capture unique, ou plusieurs noms par les groupes nommés | D817 |

*(`lower`, `left`, `length` : mes ajouts, les pendants naturels. La
troncature d'un texte trop long pour sa cible passe par `left` —
la conversion avec perte est refusée à l'ingestion, D581, jamais
implicite.)*

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
| `amount` | les devises paramétrables (`currencies` — défaut : tout l'ISO) ; `amount + amount` à devise compatible, `amount * decimal` (D581) ; **les parties au point** : `montant.value`, `montant.currency` (D771–D772) — la conversion au constructeur `amount(v, EUR)` (D659) ; **la devise par défaut du type** (D993 — aux settings, sous le nom du type : `amount: { currency: EUR }`, D991) et **le constructeur à un argument**, `amount(v)`, qui la prend — celle du champ s'il en déclare une, celle des settings sinon (la cascade D359) ; le cas 3 : les prix de l'article sans colonne de devise, `amount(ARCNPRS)` | D391, D771–D772, D993 |
| `percentage` | les bornes — défaut 0..100 ; hors cadre, **la représentation varie** (la jauge vaut pour le cadre) | D273–D274, D391 |
| `measure` | les unités : **statiques** (`units: [kg, g, t]`), **la table de référence** (`units: stock.unit`), ou **libres** (défaut) ; **le constructeur `measure(valeur, unité)`** (D659/D975 — `measure(ARCNPDSUNI, kg)`, l'unité parmi celles du champ, hors liste = une erreur d'ingestion D581) ; **`.units`** — la liste des unités connues du champ : les standards restreintes par `units:`, les déclarées, celles apportées par les données (D983), pour un contrôle `me.unite in me.article.unite.units` (D1007 — « .units utile sur measure et sur duration », acté) ; **les conversions du type, à paramètres** (D975 — « des règles de conversion qui peuvent nécessiter des paramètres complémentaires » : la masse volumique d'un volume vers un poids) — *la forme `.to(<unité>, <paramètres>)` en proposition* ; **les matrices de conversion** (D976) : les unités en lignes et en colonnes, le coefficient à l'intersection — **les matrices standard fournies par le type** (kg/g/t, mm/cm/m…) ; **la matrice est propre au champ, non mutualisable** (D978 — la forme `conversions:` aux settings retirée) : **les unités connues** du champ = les standards du type et celles de sa déclaration ; **les unités supplémentaires arrivent par les données**, dans la valeur, **chacune avec son coefficient vers une unité connue** (`PL` la plaque de tel article → kg : 12,5 — les couples de PMI, D977) ; le coefficient constant ou expression (D975–D976) ; **la transitivité** (D979) — la matrice est un graphe, la conversion suit le chemin dans les deux sens ; deux unités non standard se relient l'une à l'autre (`PL → U : 1` — « 1 PL = 1 U, toujours ») ou par une standard commune ; **l'invariant, à la validation du champ** : toute unité présente atteint une unité standard, sinon la valeur est non conforme (intrinsèque au type, *ma lecture*) ; **le constructeur à trois paramètres** (D982) — la valeur, l'unité, **la liste des conversions apportées**, chacune par **`measure.convert(source, cible, coefficient)`** (la fonction du type, D579 — « conversion à remplacer par measure.convert ») : `measure(1, "PL", list(measure.convert("PL", "U", 1), measure.convert("PL", "KG", 12.5)))` — le cas 3, une unité de l'article ; **la comparaison des unités est normalisée** (D983 — « KG = kg, T = t ») ; **`units:` restreint la matrice standard** à ce qu'il nomme — `units: [U]` : la seule diagonale, U → U = 1, aucune standard, la valeur valide en soi ; l'invariant D979 se lit « toute unité atteint une unité **connue du champ** » ; **la matrice standard est en blocs** (les poids kg/g/t, les dimensions mm/cm/m, les volumes…) non convertibles entre eux sans un coefficient apporté, à paramètres s'il le faut (D975) ; la matrice visible à la saisie (D980) ; **l'arithmétique** (D984 — la table d'opérateurs du type, D581 ; *en proposition*) : `measure ± measure` si les unités se relient (la matrice, la transitivité D979 — le résultat dans l'unité de l'opérande gauche ; non reliées = une erreur de typage à l'ingestion), `measure * decimal`, `decimal * measure`, `measure / decimal` (`article.unite * quantite`), `measure / measure → decimal` (le rapport, unités reliées), les comparaisons par conversion ; **les agrégats** `sum`/`avg`/`min`/`max` (D887) sur les mesures reliées, dans l'unité du champ ; `measure × measure` hors table ; **la performance sur les volumes** (D985 — « un point important… des millions de lignes ») : *en proposition* — **`storage: <unité>`**, l'unité canonique de stockage (l'écho de D378), la valeur stockée convertie à côté de l'origine ; les agrégats poussés au storage (une somme de colonne, jamais une conversion par ligne) ; les calculés matérialisés à l'écriture (D571) | D391, D975–D985 |
| `duration` | **un composé depuis D981** (« il me semblait que measure et duration étaient des types composés » — rangée parmi les simples depuis D380, elle a l'anatomie d'un composé depuis D975) : la valeur et l'unité ; le masque — **la virgule : l'heure ou la minute en centièmes, l'heure en dix-millièmes** (D380) ; les unités `s`/`min`/`h`/`d`/`w`/`m`/`y` (D476) ; **les sous-items au point** — `.days`, `.months`… (les fonctions du type — D772–D773/D838) ; **le constructeur `duration(valeur, unité)`** (D659/D975 — `duration(NOCNTPSOUV, h)`) ; **les conversions du type, à paramètres** (D975 — la base d'un temps industriel en centièmes vers les heures-minutes) ; **la matrice des temps** (D976/D978) — la standard fournie par le type, **la matrice propre au champ**, **les unités supplémentaires apportées par les données avec leur coefficient vers une unité connue** : `F` la frappe de tel poste, « 20 F/H ⇒ 3 min » (*en proposition, la même forme que `measure` — D982 : `duration(v, "F", list(duration.convert("F", "h", 1 / 20)))`*) ; la transitivité et le chemin obligatoire vers une unité connue du champ (D979/D983) ; **`.units`** — la liste des unités connues du champ, comme pour `measure` (D1007, acté) ; la matrice visible à la saisie (D980) ; **l'arithmétique** (D984 — *en proposition*) : `duration ± duration` par conversion (le résultat dans l'unité de l'opérande gauche), `duration * decimal`, `duration / decimal`, `duration / duration → decimal`, les comparaisons ; avec le temps (D838) : `date + duration → date`, `date - date → duration`, de même `datetime` ; **les agrégats** `sum`/`avg`/`min`/`max` (D887) — `temps_gamme: nomenclature.sum(temps_ouverture if nature = "operation")` ; le nul = 0, le tri sur la valeur | D380, D476, D838, D975–D984 |
| `phone` | le national (défaut) ou l'international | D391 |
| `geolocation` | **quatre parties** (D961 — précise D638/D392) : **la latitude, la longitude, l'adresse normalisée et l'adresse saisie au format brut** — « une adresse contient alors la latitude, la longitude, l'adresse normalisée et l'adresse saisie au format brut » ; la saisie, le GPS ou le géocodage (D294/D637 — le connecteur `location` remplit l'adresse normalisée depuis la brute ou les coordonnées ; sans connecteur, elle reste vide) ; **les parties au point** (D772 — *les noms miens*) : `.latitude`, `.longitude`, `.address` (la normalisée), `.raw` (la brute) ; **le constructeur à trois formes** (D659/D961) : `geolocation(lat, lng)`, `geolocation(texte)`, `geolocation(lat, lng, texte)` — le texte est l'adresse brute ; **le tri = la distance à vol d'oiseau à une focale** (`focus:` au champ ou au setting — défaut : la localisation courante) ; la conversion en texte = l'adresse normalisée, sinon la brute, sinon les coordonnées standardisées ; `distance`/`euclide` (D579) | D291, D294, D391–D392, D637–D638, D961 |
| `period` | hérite du format date/heure — le crochet (`period[yyyy-mm]`…) ; **début ≤ fin intégré** ; la recherche `range` en usage roi ; **les sous-items `min`, `max`, `gap`** (D890 — les bornes alignées sur `range`, `gap` la durée dérivée entre elles, nulle si la période est ouverte) ; le constructeur `period(min, max)` | D391, D890 |
| `email`, `url`, `vat_number`, `siren`, `siret`, `iban`, `bic` | la règle générale — la validation intégrée suffit ; `url` : **le lien en lecture** (le nouvel onglet, l'icône post-zone, l'ellipse en cellule — D563) | D391, D563 |
| `communication` | le fil (un canal = un champ, non listable — D166) ; `attachments: false` (défaut) ou le type d'attaché à plat ; la visibilité par la confidentialité ; la recherche sur le contenu des messages | D295, D393 |
| `label` | l'accès au catalogue des labels (D440) ; **le gabarit nommé paramétrable** — `label(mon_nom, { prenom: … })` ou l'enregistrement en paramètre (`label(mon_nom, customer)`) ; l'ordre des mots par langue | D585–D586 |

## Les collections et les plages

| le type | la nature | D |
|---|---|---|
| `list of <type simple>` | « la phrase se lit » ; **les facettes du champ s'appliquent à chaque élément** ; les énumérés (`values:`) → la multi-sélection ; **la collection est un type — elle porte les agrégats en méthodes** (`sum`, `count()`, `avg`, `min`/`max`, `first`, `last`, `any`, `exists` — l'élément en contexte implicite) ; **la doctrine des agrégats** (D887) : l'agrégat qui porte une valeur se lit « valeur if condition » (`sum(montant if statut = "en_cours")`), celui qui n'en porte pas reçoit la condition seule (`count(nature = "composant")`, `any(…)`, `exists(…)`), `count()` nu = le tout ; **l'appartenance par l'opérateur `in`** (D888) : `<élément> in <collection>` — `me in fournisseurs` ; **la projection** (D889) : `<collection>.<champ>` = la collection des valeurs de ce champ — `me.code in fournisseurs.code`, `lignes.article` ; **`list`** (D965) — l'agrégat qui rend la liste des valeurs (`list of <type>`, la forme « valeur if condition ») ; **le constructeur `list(a, b, …)`** (D971 — la fonction au nom du type, D579/D659) : plusieurs valeurs vers une liste — **les vides tombent** (le nul, la chaîne vide), **l'ordre des arguments**, **la liste nettoyée de ses doublons** (le premier des égaux garde sa place), les arguments du même type ou la promotion sans perte (D581), le résultat `list of <ce type>` — `matieres: list(ARCTCODMA1, …, ARCTCODMA9)` ; **à la source, l'entité décrite est une collection** (D965) : un calculé lit une autre entité source par `first`/`list` (`PARAM_EMPLACEMENTS.first(PACTEXT140 if PACTEXT210 = …)` — l'entité avec son filtre, D966), le résultat mis en cache par critères le temps d'un passage — au modèle, D891 tient (jamais l'entité entière) | D296, D362, D580, D887–D889, D965–D966, D971 |
| `range of <type>` | « la déclinaison de `list of` avec 2 contraintes en nombre et en ordre » — deux valeurs, la première ≤ la seconde (la contrainte intégrée) ; **min et/ou max indéfinissables** (la plage ouverte) ; les libellés sur trois éléments (min, value, max) ; **la jauge = un cas particulier d'un range** | D497–D498 |

## Les liens

| le type | la nature | D |
|---|---|---|
| la référence — `<module>.<entité>` | « si le type est le nom d'une entité, c'est une référence » (le `to` inutile) ; **l'origine se lit par `me.`** dans le filtre ; `check: selection` (défaut) \| `immutable` ; l'accès retour automatique (la liste nommée) | D394–D398, D216 |
| la composition — `list of <entité>` | le lien de possession : le parent déclare, l'enfant ne déclare rien ; **l'agrégat = le grain d'écriture** (indivisible) | D399–D400, D420 |
| l'association — `association with <entité>[.<champ>]` | plusieurs, libres, inter-modules — sans cascade ; reprend les propriétés de la référence (filter/me./check, l'affichage au visage) ; **le champ de destination au point** (D761–D762 — le défaut : le champ au nom de l'entité ; `association with order.billing` à l'ambiguïté) | D400–D401, D761–D762 |
| le lien n-aire — `list of [a, b]` / `association with [a, b]` | **chaque élément = une combinaison des entités nommées**, des propriétés par entité nommée ; **une dimension de valeur typée** à côté des entités (D897 — `list of [tiers.tiers, tranche: text[1], date_application: date]` : l'hypercube de D134, le temps en dimension) ; la cellule `{ … }` porte ses champs, calculés compris (D403) — **en bloc sous `fields:`** quand elle s'enrichit (D898), l'accolade au cas court | D402, D897–D898 |
| l'association dérivée — `association with <entité> if …` | la vue navigable, jamais stockée, en lecture — la vérité reste la référence | D405 |
| l'accès montant | **`owner`** — le possesseur d'une composition (unique — D760/D761) ; l'associé s'atteint **par son champ de référence** | D760–D761 |

## Les générés et le contexte

| le type | la nature | D |
|---|---|---|
| `counter` | le compteur — attaché au champ ou **mutualisé** (`counter[mon_compteur]`) ; la réinitialisation sur la déclaration (`reset: never` défaut) ; lecture seule partout, « *(attribué à la validation)* » en création ; **surchargé par la migration** (D883) : la valeur reprise entre telle quelle, **la méthode `update(valeur)` du type** (D999 — « plus parlante ») dans les `operations:` de la règle positionne le compteur courant sur la plus grande valeur : `commande_vente.numero.update(numero)`, le champ adressé par le point (D363) ; *le compteur mutualisé par son nom au crochet : `counter[mon_compteur].update(valeur)` — en proposition* ; **l'identification des trous est le contrôle porté par la propriété du compteur** (la continuité, D154), pas une règle de la migration ; le rejeu par l'identité (D930), jamais une nouvelle allocation | D154–D155, D297, D409–D410, D883, D998 |
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
