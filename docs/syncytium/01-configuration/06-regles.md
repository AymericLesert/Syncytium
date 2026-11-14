# Les règles — les cascades et l'ingestion

Deux règles traversent toute la configuration. La cascade dit qui
l'emporte quand une valeur s'écrit à plusieurs étages. L'ingestion dit ce
que le moteur refuse avant de servir.

## Le sommaire

- [4. Les cascades — le plus proche l'emporte](#4-les-cascades--le-plus-proche-lemporte)
- [5. L'ingestion — ce qui est refusé](#5-lingestion--ce-qui-est-refusé)

## 4. Les cascades — le plus proche l'emporte

Une valeur écrite près de l'élément l'emporte sur une valeur écrite plus
loin. Chaque cascade a ses étages.

| Ce qui cascade | Les étages, du plus loin au plus près | Les décisions |
|---|---|---|
| les settings et les types | Syncytium, la version (`settings.yml`), le module, l'entité, le champ | D359, D360, D588, D991–D993 |
| `allow:` | l'application (`version.yml`), le module, l'entité, le champ, l'écran ou un composant de l'écran, le template | D886, D1796 |
| la confidentialité | le niveau (D25) et les groupes (D26) ; le profil nommé à la racine du projet, référencé au champ | D885, D1536 |
| `trace:` | les settings, le module, l'entité, le champ ; `sensitive` par défaut, `audit`, `limited` | D703, D1845 |
| `normalize:` | le défaut du type aux settings, puis le champ | D870, D872, D991 |
| `history:` | `settings.yml` de la version, le module, l'entité ; l'opt-out par `history: false` ; le défaut du socle est inactif | D168, D1174 |
| le catalogue des textes du moteur | le core, le hook, l'application, qui reprend, surcharge ou ajoute, une langue entière au besoin | D1160–D1163, D1465 |
| tout défaut du socle | la valeur de Syncytium, `settings.yml` de la version, le module, l'entité, le champ ; dans les settings, le type de composant, le composant, la propriété | D1175, D1239 |
| le report des anomalies | l'entité source et ses phases, ou la règle de migration et les siennes, puis le défaut de D407 | D929, D1058 |

## 5. L'ingestion — ce qui est refusé

La description se vérifie en entier à l'ingestion, avant de servir
(D328). Une erreur d'ingestion refuse la version. Les causes :

- le format déclaré plus récent que le moteur (D330) ;
- une même version dans deux dossiers de statut, ou une transition
  interdite (D344, D345) ;
- un doublon de nom, entité, type ou hook (D344, D396, D408) ;
- un nom ambigu dans une formule : il désigne à la fois un champ et un
  connecteur (D1960) ;
- un cycle de groupes (D414), de calculés (D592) ou de types dérivés
  (D992) ;
- un groupe nommé `administrator`, le nom réservé du groupe du socle
  (D712, D1790) ; un profil de confidentialité nommé `public`,
  `protected` ou `private`, les noms des niveaux (D1799) ;
- un hook de type sans ses règles de stockage (D681, D1690) ;
- un module d'application dont le nom commence par `_`, le préfixe des
  modules internes du socle, `_migration`, `_administration`, `_chat`
  (D1029) ;
- une référence de fichier non marquée `~{…}` (D956), un fichier absent,
  une clé de configuration inconnue ;
- un secret en clair dans le `.env` (D902) ;
- un plan de promotionnelle qui cite une vue non marquée `promotional`
  (D1500) ;
- un texte sans une langue de la version, libellé, md, gabarit, skill,
  terme du glossaire (D1101, D1474, D1475) ; une langue attendue qui
  manque à un hook (D1163) ; le catalogue d'une langue apportée par le
  projet incomplet (D1465) ;
- une conversion de type avec perte non écrite (D581) ; une unité sans
  chemin vers une unité connue du champ (D979, D983) ;
- une entité sans identité, ni la sienne ni celle de sa racine (D1035,
  D1039) ;
- un champ requis ajouté par une version sans `default:` : les
  enregistrements existants ne pourraient pas le recevoir (D1970). Une
  règle d'`exchange/` qui l'alimente n'y change rien : une ancienne
  version de l'API écrit encore sans ce champ (D1972) ;
- une migration de version dont le `from:` écrit n'est pas la dernière
  version connue (D1983) ;
- un renommage dont la version écrite, `from: <ancien nom>@<version>`,
  n'est pas la dernière version connue (D1985, D1986).

Une alerte signale sans refuser :

- la surcharge d'une clé au cumul de fichiers (D968) ;
- un plan ou une vue marquée dans un projet `promotional: false` (D1512,
  « cette option peut être utilisée temporairement ») ;
- `visibility: promotional` dans un projet `promotional: false`, la
  visibilité passée à `private` (D1528).

Une version en erreur rejoint le registre des versions essayées (D326),
avec sa cause. Le retry passe par l'incrément du build (D323).
