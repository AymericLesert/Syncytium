# Les règles — les cascades et l'ingestion

# 4. Les cascades — le plus proche l'emporte

| ce qui cascade | les étages | la décision |
|---|---|---|
| les settings et les types | Syncytium → la version (`settings.yml`) → le module → l'entité → le champ | D359/D360/D588, D991–D993 |
| `allow:` | l'application → le module → l'entité → le champ | D886 |
| la confidentialité | le niveau (D25) × les groupes (D26), le profil nommé à la racine du projet, référencé au champ | D885, D1536 |
| `normalize:` | le défaut du type aux settings → le champ | D870/D872, D991 |
| `history:` | `settings.yml` de la version → le module → l'entité ; l'opt-out par `history: false` ; le défaut du socle = inactif | D168, D1174 |
| le catalogue des textes du moteur | le core → le hook → l'application, qui reprend, surcharge ou ajoute — une langue entière, au besoin | D1160–D1163, D1465 |
| tout défaut du socle | la règle : la valeur de Syncytium → `settings.yml` de la version → le module → l'entité → le champ ; dans les settings, le type de composant → le composant → la propriété | D1175, D1239 |
| le report des anomalies | l'entité source (ses phases) ou la règle de migration (les siennes) → le défaut de D407 | D929, D1058 |

# 5. L'ingestion — ce qui est refusé

La description se vérifie en entier à l'ingestion, avant de servir
(D328) ; **l'erreur d'ingestion** :

- le format déclaré plus récent que le moteur (D330) ;
- une même version dans deux dossiers de statut (D344) ; une
  transition interdite (D344/D345) ;
- un doublon de nom — entité, type, hook (D344/D396/D408) ; un cycle —
  de groupes (D414), de calculés (D592), de types dérivés (D992) ;
- un module d'application dont le nom commence par `_` — le préfixe
  des modules internes du socle (`_migration`, `_administration`,
  `_chat` — D1029) ;
- une référence de fichier non marquée `~{…}` (D956), un fichier
  absent ; une clé de configuration inconnue ;
- un secret en clair dans le `.env` (D902) ;
- le plan de la promotionnelle qui cite une vue non marquée
  `promotional` (D1500) ;
- un texte sans une langue de la version — libellé, md, gabarit, skill,
  terme du glossaire (D1101, D1474, D1475) ; une langue attendue qui manque à un hook (D1163) ;
  le catalogue d'une langue apportée par le projet incomplet (D1465) ;
- une conversion de type avec perte non écrite (D581 — le typage
  statique des expressions) ; une unité sans chemin vers une unité
  connue du champ (D979/D983) ;
- une entité sans identité — ni la sienne ni celle de sa racine
  (D1035/D1039) : une anomalie de description du modèle.

**L'alerte**, pas l'erreur : la surcharge d'une clé au cumul de
fichiers (D968) ; un plan ou une vue marquée dans un projet
`promotional: false` (D1512 — « cette option peut être utilisée
temporairement ») ; `visibility: promotional` dans un projet
`promotional: false` — la visibilité passée à `private` (D1528).

Une version en erreur rejoint le registre des versions essayées (D326)
avec sa cause ; le retry passe par l'incrément du build (D323).
