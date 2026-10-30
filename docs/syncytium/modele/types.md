# Les types — le socle commun, les types simples

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
  comparateurs** (l'ordre des règles de tri), **le `if` suffixé et sa chaîne** — `valeur if condition else valeur if condition else valeur`, les cas dans l'ordre, lus de gauche à droite, le dernier sans condition (D580, D1109–D1110) —, **le `select`**
  (`valeur.select(cas: …, "...": défaut)` — **deux conduites** (D1002) : sans `"..."`, une valeur hors des cas est rejetée ; avec `"..."`, toutes les autres valeurs sont cadrées ou traitées par ce cas ; `null:` nomme le cas du nul (D1551) ; le nul et la chaîne vide ne se confondent pas : `""` n'est pas un nul et ne tombe pas dans `null:`), **les fonctions dédiées**
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
  défaut ») : aux settings, sous `field:`, le type de composant (D1239),
  **la clé est le nom** ; sans `type:`, elle règle les défauts d'un type
  du catalogue — `field: { text: { normalize: trim(me) } }` ; avec
  `type:`, elle définit un dérivé qui hérite de sa base et surcharge ce
  qu'il nomme — `field: { date_pmi: { type: date, mask: "yyyymmdd" } }`,
  `field: { progression: { type: integer[0..100], component: fuel } }` ; le dérivé d'un dérivé se résout à l'ingestion (le cycle =
  une erreur) ; le champ garde le dernier mot (`ARCJCRE: { type:
  date_pmi, mask: "yyyymm" }`) ; un dérivé ne redéfinit jamais un type
  du catalogue (D408) ; l'usage par la forme courte (D356) — `ARCJCRE:
  date_pmi` ; **le dérivé porte aussi les facettes de sens** — `rgpd:`
  (D1178 : `nom: { type: text[..40], rgpd: personal }`, puis `nom: nom`
  dans chaque modèle — le champ hérite du marquage, la RGPD se
  généralise par le type ; de même le profil de confidentialité D885,
  `hint:` et `description:`) ; **et son entrée au glossaire de la
  documentation** (D1179 — le vocabulaire du métier : `title:` et
  `description:` par langue, la base, les facettes, les champs qui
  l'emploient ; la complétude compte le type sans description — mes
  lectures) ; **chaque type livre au dictionnaire des données sa ligne
  — le type en clair, ses contraintes, son exemple** (D1215 : « le
  dictionnaire de données est construit par Syncytium à partir
  d'informations qui sont fournies par chaque item… les hooks de type
  devront être adaptés pour que cela s'intègre parfaitement ») — la
  facette documentation du type et du hook de type, au rang 2 ;
- **le composant par défaut porte le nom du type** (D458).

## Les types simples

| le type | la nature et les facettes propres | le tri, le nul | D |
|---|---|---|---|
| `boolean` | les trois états (faux → vrai → nul) ; `required` retire le nul (la recherche strict filtre alors vrai & faux par la case « null ») | null < faux < vrai | D373–D375 |
| `enum` | les valeurs `values:` — la clé → les libellés, la description, l'icône ; **l'ordre de déclaration = la présentation et le tri** ; **le stockage numérique** (la clé chaîne → un code interne stable — attention à l'ajout intercalé en migration) ; la recherche par le composant multi-sélection ; l'entrée `null:` pour libeller le vide ; **à l'import, le code d'abord**, le libellé en repli dans la langue de l'importateur, une ambiguïté est un échec propre ; **à l'export, le code ou le libellé** selon le format CSV déclaré — les machines échangent les codes (D130) | le nul en tête | D130, D387–D388, D882 |
| `text` | la taille `auto` ou `text[30]` (les bornes au nom — D366) ; le masque (`_`, `9`, les littéraux, les classes — il pilote les lignes) ; mono/multi-ligne **déduit de la taille** face au seuil d'instance ; la recherche complète (strict/normalized/similarity/mutualizable) ; **la facette `barcode: <nature>`** (D988 — « la valeur du code-barres est un texte, la facette est un barcode », pas de type) : ean13, ean8, code128, qr… (D542) — elle **valide** le texte (les 13 chiffres et la clé de contrôle de l'EAN 13) et **le composant de sortie** (D300) la lit pour rendre les barres — `ean13: { type: text[13], barcode: ean13 }` | **le tri sur la chaîne normalisée** — les accents et les caractères spéciaux retirés, le même pour tous, sans surcharge par profil (D222) ; le nul = la chaîne vide | D222, D259–D265, D366–D370, D988 |
| `integer` | les bornes au nom (`integer[100]`, `integer[0..100]`, `integer[0..]`) ou `min`/`max` ; **les octets jamais déclarés** — dimensionnés selon les bornes ou les valeurs (« le mode auto ») ; le masque (`000000`, `00 00 00`) ; la recherche `range` | le nul = 0 | D371–D372 |
| `decimal` | les décimales (le setting ou 2) ; **le stockage exact ou réel** (`storage:` — l'entier aux décimales converties) | le nul = 0 | D376–D378 |
| `date` | **la nature au crochet** : `date[yyyy-mm]`, `date[yyyy-mm-dd]`, `date[yyyy-ww]`… — la plus fine par défaut ; le masque de la langue (le `mask` déclaré pilote aussi **la lecture des sources** — D820) ; les bornes en littéraux ISO ; `date - date → duration`, `date + duration → date` — la table d'opérateurs du type (D581/D838) ; **les sous-items au point** — `.day`, `.month`, `.year`, `.week`, `.day_name`… (les fonctions du type — D772–D773/D838) | le nul en tête | D381–D383, D820, D838 |
| `time` | la précision au crochet (`time[hh:mm]`) | le nul en tête | D381 |
| `datetime` | la nature au crochet : `datetime[raw]` (défaut) \| `datetime[timestamp]` ; la précision en second paramètre ; **le constructeur `datetime(jour, heure)`** (D659/D1001 — le mouvement de PMI : `datetime(MVCJSAI, MVCTSAI)`, le jour et l'heure déjà typés) ; **une part nulle, le jour ou l'heure, rend le nul** (D1553) | le nul en tête | D381, D1001, D1553 |
| `file` | les `extensions` (`[pdf, docx]` ou la forme à libellés `{ pdf: { fr: facture } }` — elle guide le dépôt) ; le `quota` contrôlé à la volée ; **la valeur = les descripteurs du fichier** (D972) : « le nom du fichier, sa taille, sa date de création, sa date de dernière modification, éventuellement une clé de hashage si la propriété file `hash` est `true` » — le contenu derrière ; **les parties au point** (D772) : **`.relativepath`** — le nom du fichier apparent ou saisi, relatif au répertoire du connecteur, la partie portée ; **`.fullname`** le chemin complet, **`.filename`** le nom seul, **`.pathname`** le répertoire — recalculés depuis `.relativepath` (les quatre de l'auteur) ; puis `.size`, `.created`, `.modified`, `.hash` (D1556) ; **le différentiel** (D672) compare les descripteurs, le contenu n'est relu qu'à l'écart ; **la facette `hash: true`** ajoute l'empreinte ; **rempli par un connecteur `file`** dans une règle du mapping — `plans: plans.files(ARCTFICPLA)` (D883/D972) ; **les opérations du type** (D974 — « la lecture, le déplacement, la suppression, la lecture du hashage » ; les noms, D1556) : `.read()` le contenu binaire, `.read(text)` le texte — « à fournir pour la partie CSV ou pour le watcher » (D635/D636) —, `.move(destination)` (celui que `commit` emploie, D973), `.delete()`, `.hash()` l'empreinte à la demande ; **le stockage dédupliqué par l'empreinte** (D165) : un contenu identique déjà présent est réutilisé, l'effacement réel n'a lieu qu'au dernier détenteur, par comptage de références — un bon joint à trois commandes n'est stocké qu'une fois | — | D160–D165, D292, D384, D972–D974 |
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
| `trim(t)` | les blancs de tête et de fin retirés — la normalisation des `nchar` : le défaut du type aux settings, sous `field:` et le nom du type — `field: { text: { normalize: trim(me) } }` (D991, D1239 — les settings portent les paramètres par défaut des types et la définition de nouveaux types, D359) ; la surcharge au champ (D872) | D870/D872, D991 |
| `upper(t)` / `lower(t)` | la casse | D656 |
| `left(t, n)` / `right(t, n)` | les n premiers / derniers caractères (`right("0000" + me, 4)`) | D870 |
| `mid(t, début, longueur)` | la sous-chaîne | D934 |
| `length(t)` | la longueur | D934 |
| `t1 + t2` | la concaténation | D870 |
| `t like "regex"` | la comparaison régulière | D818 |
| `extract(t, "regex")` | l'extraction par la regex — la capture unique, ou plusieurs noms par les groupes nommés | D817 |

La troncature d'un texte trop long pour sa cible passe par `left` : la
conversion avec perte est refusée à l'ingestion, jamais implicite
(D581, D934).
