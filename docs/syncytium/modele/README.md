# Le modèle — l'entité, les champs, les types

## La doctrine

- **le module déclare ses entités** (D765/D766) : `module.yml` porte
  la liste `entities:` — les chemins relatifs au fichier courant
  (D768) ; rien ne se déduit de l'arborescence (D767) ;
- **toute propriété porte le contenu ou la référence de fichier**
  (D767) — le fichier unique est possible, l'éclatement libre : la
  convention des exemples est le trio par dossier —
  `<entité>/<entité>.yml` (l'identité), `fields.yml` (les champs),
  `gui.yml` (la présentation), et `operations.yml` quand les
  opérations le méritent ;
- **le nommage est libre** (D807) — l'éponymie (le fichier au nom de
  l'entité) est une convention, pas une règle ; **le mot juste
  prime l'éponymie** (D884 — `tiers/tiers/tiers.yml` assumé quand
  le mot est le bon) ;
- **l'écriture face à YAML** (D892 — le fichier est du YAML sans
  format personnalisé, D320) : en contexte bloc, une valeur par
  ligne, la grammaire s'écrit nue (`libelle: text[..30]`, `- field[nb_jours]`) ;
  **les guillemets ne s'imposent que dans trois situations** — un
  crochet de la grammaire à l'intérieur d'une accolade ou d'un
  crochet YAML, un `: ` à l'intérieur d'une expression (le
  `.select`, la cellule du n-aire), une regex, aux guillemets
  simples ; **la forme bloc est préférée** quand la forme en flux
  imposerait les guillemets (`fields:` en bloc, `items:` à tirets,
  la longue formule en scalaire `>-`) ; chaque exemple passe un
  analyseur YAML avant validation ;
- **l'entité se documente elle-même** — un des piliers : `name`,
  `description`, les `label:` par langue, les `hint:` (la
  description courte — la précision au « (?) » du champ, D840) et
  `description:` (la longue — la matière du tutoriel) et les
  `placeholder:` nourrissent **la documentation générée** (Q58 —
  le document fonctionnel et technique, **la description claire
  des données véhiculées par les API**) **et** l'IHM (D258) ; le
  commentaire YAML (`#`) dit la nature de la clé et son apport, pour
  le lecteur du fichier (D1084) ; jamais une décision ni l'histoire du
  cas (D1085) ; ce qui parle à l'utilisateur est une propriété (D1100).
