# La configuration de Syncytium — la syntaxe

Ce chapitre dit **la forme** de la configuration : le format, les
mécanismes transverses, l'arbre des fichiers et ce que chacun porte. Le
sens de chaque élément vit dans son propre chapitre — l'entité et les
champs, les types, les composants, les hooks, les connecteurs, la
reprise, les droits, l'administration, la sécurité, la documentation.
Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

1. **La nature** — ci-dessous : YAML, de petits fichiers, une seule
   grammaire ; les règles d'écriture face à YAML et des exemples.
2. **[Les mécanismes transverses](mecanismes.md)** — la référence de
   fichier `~{…}`, le pattern, le cumul, les variables `${…}`, la
   marque `*`, l'adressage par le point, le langage d'expression, la
   forme courte et le bloc, la liste et la substitution, les défauts du
   poste.
3. **[L'arbre](arbre.md)** — du sommet à la feuille : `syncytium.yml`,
   `environments/`, `versions/`, `version.yml` ; puis
   **[ce que la version porte](version.md)** — `settings.yml` et la règle
   des paramètres, `groups.yml`, le module et son menu, l'entité,
   `hooks/` et `reprise/` — et **[l'inventaire des défauts du
   socle](defauts.md)**.
4. **[Les règles](regles.md)** — les cascades, le plus proche l'emporte ;
   l'ingestion, ce qui est refusé et ce qui alerte.

## 1. La nature — YAML, de petits fichiers, une seule grammaire

- **YAML, sans format personnalisé** (D320) : la description emprunte
  la syntaxe YAML et s'en tient à elle ; **le fichier est une
  enveloppe** (D327) — lu, converti en logique interne, puis inerte :
  le moteur ne réécrit jamais un fichier du concepteur (D331/D332),
  les commentaires restent, le dépôt se diffe.
- **De petits fichiers plutôt qu'un seul** (D323) : la description se
  décompose en fichiers et en dossiers, **une valeur peut être le
  contenu ou la référence d'un fichier** (D320/D767) ; les redondances
  s'éliminent par les variables (D321) et les références (D956/D967).
- **La langue** : les noms de dossiers, de fichiers et les propriétés
  sont **en anglais** (D335) ; les valeurs du catalogue aussi — les
  types, `public`/`protected`/`private`, `write-once` (D358) ; **la
  sémantique métier dans la langue du modèle** — les noms d'entités et
  de champs, les libellés (`label:`, `hint:` — par langue).
- **`description:` partout** (D810) : tout élément porte sa
  description, en ligne ou par fichier — le carburant de la
  documentation générée (D333/D645).
- **Le dépôt du client est distinct du projet** (D336) ; le projet
  embarque `template/`, un « Hello world ! » clonable (D337).
- **Le core en tête** (D322, D1361) : la description déclare le core de
  Syncytium qui l'interprète et génère sa documentation — **`from:
  Syncytium-1.0`, la première clé de `syncytium.yml`** (D1083) ;
  `syncytium init` récupère ce core (D1358, D1360) ; un core plus récent
  tient l'évolution du précédent — la conversion à l'ingestion (D331) ;
  un format plus récent que le moteur est refusé sur la seule lecture de
  l'en-tête (D330).

**Les règles d'écriture face à YAML (D892)** — la grammaire des
expressions vit dans des scalaires YAML, deux règles la protègent :

1. **les guillemets quand YAML l'exige, et seulement alors** : un
   crochet de la grammaire à l'intérieur d'une accolade ou d'un crochet
   YAML (`{ type: 'text[..100]' }`), un `: ` à l'intérieur d'une
   expression (`'sens.select(entree: quantite, sortie: -quantite)'`),
   une expression régulière — **aux guillemets simples**, qui prennent
   tout tel quel (`'^(?<prefix>[A-Z]{2})…$'`) ;
2. **la forme bloc préférée** quand la forme en flux imposerait les
   guillemets : `fields:` en bloc, `items:` en liste à tirets, la
   longue formule en scalaire bloc `>-` ; en contexte bloc, une valeur
   par ligne, la grammaire s'écrit nue (`libelle: text[..30]`).

Chaque exemple passe un analyseur YAML avant validation.

**Les règles d'écriture des exemples (D1084)** — un fichier aéré et
lisible : **avant chaque clé, une courte introduction** qui dit sa
nature dans la configuration, **puis ce que la clé apporte** — la
seconde partie s'omet quand elle est triviale ; le commentaire collé
à sa clé, une ligne vide entre deux clés ; **aucune référence de
décision dans la configuration** (D1085) — les décisions disent le
cheminement, la configuration dit la finalité et l'usage ; **une ligne
de 120 caractères au plus** (D1097) — le commentaire collé à sa clé
garde sa nature sur sa première ligne, son apport se replie sur les
suivantes ; **les sous-clés qui se répètent à l'identique** d'un
frère à l'autre (le `type`, la `class` et les `parameters` des
connecteurs, le `level` et les `groups` des profils) **s'expliquent
une fois, sur le bloc parent** (D1098), et s'écrivent alors serrées,
sans ligne vide.

```yaml
# Les environnements d'exécution
# Chaque environnement porte ses connecteurs, sa journalisation, son
# nettoyage et ses réglages ; rien ne se déduit de l'arborescence, la
# déclaration fait foi.
environments: ~{environments/environments.yml}

# Le nom du projet
name: entrepot
```


## Les décisions

Ce chapitre repose sur les décisions de la famille « la configuration et
son écriture », relues le 29/10/2026 (D1540) — 94 décisions : D217, D219, D320, D323, D327, D332, D335, D337, D339, D346–D349, D363, D365, D408, D410, D583, D588, D590–D591, D707, D726, D760, D762, D764, D766–D768, D799, D816, D825, D842, D892–D893, D944, D967, D994, D1069, D1071, D1074–D1075, D1082–D1086, D1088–D1092, D1094–D1098, D1101, D1109–D1110, D1113–D1115, D1151, D1174–D1175, D1181, D1239, D1291, D1355, D1361, D1384, D1427–D1428, D1444, D1465–D1466, D1473–D1474, D1498, D1500, D1511–D1513, D1517, D1528–D1532, D1535–D1538. La liste se
recalcule : `python tools/decisions.py docs/conception.md --numeros
configuration`.
