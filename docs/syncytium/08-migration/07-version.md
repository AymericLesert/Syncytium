# La migration de version

> **La migration de version** est la migration dont l'origine est la
> version antérieure de l'application. Syncytium calcule les
> correspondances depuis les écarts entre les deux versions ; le
> concepteur n'écrit que ce que le calcul ne devine pas
> ([glossaire](../../glossaire.md)).

Ce fichier dit ce que le concepteur écrit entre deux versions : rien le
plus souvent, puis le protocole et le processus, ce qui s'écrit, les
deux volets d'une règle d'`exchange/`, les écarts documentés. Le
mécanisme de la migration est au chapitre 9. Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [L'implicite](#limplicite)
- [Le protocole et le processus](#le-protocole-et-le-processus)
- [Ce qui s'écrit](#ce-qui-sécrit)
- [Les deux volets](#les-deux-volets)
- [Les écarts documentés](#les-écarts-documentés)

## L'implicite

Entre deux versions, **rien ne s'écrit** : le `from:` implicite est
la version précédente, Syncytium le porte. **La migration de version
est une forme courte** (D1968) : la version antérieure est la source et
se décrit elle-même, par son méta-modèle ; le mapping est champ à
champ, par les noms ; la conversion vient du type de destination. Les
règles de la forme courte d'une reprise s'y appliquent (D1896) : un
champ supprimé est une colonne sans champ, un champ ajouté un champ
sans colonne, qui prend sa valeur par défaut — un champ requis ajouté
sans `default:` est une erreur d'ingestion, même alimenté par une règle
d'`exchange/` (D1970, D1972). La procédure à chaud
dépend du moteur : elle est au chapitre 9.

## Le protocole et le processus

**Une migration de version et une reprise suivent le même protocole ;
seule l'origine change** (D1981). Un processus de migration déclare sa
source, `sources:`, ses règles de mapping, `mapping:`, et ses règles de
transformation, `exchange:` — les trois clés au même niveau. Une règle
d'`exchange/` a le format d'une règle de mapping, formules comprises ;
son sens diffère : elle porte sur le format existant. L'origine d'une
migration de version se déduit : par défaut, `from:` est la dernière
version déployée. Le concepteur peut l'écrire ; si la version écrite
n'est pas la dernière version connue, c'est une erreur d'ingestion
(D1983). Ce `from:` écrit est le garde-fou des règles d'`exchange/`
(D1989) : une règle oubliée à la version suivante est refusée à
l'ingestion, au lieu d'être rejouée. L'écrire est donc préconisé dès
que le processus porte des règles. C'est le même garde-fou que pour
le renommage ; Syncytium ne compare pas les règles d'une version à
l'autre.

**Le processus d'une migration de version** (D1990) porte un nom libre,
comme celui d'une reprise. Il se reconnaît à son `from:` : un numéro de
version, ou absent, là où une reprise nomme un connecteur. Il ne
s'écrit que s'il y a des règles d'`exchange/` : sans règle, la
migration reste silencieuse, et `migration.yml` n'en dit rien (D1908).
Un exemple d'illustration — aucun cas n'en porte :

```yaml
# La migration de version des contacts
contacts:

  # La version d'origine
  from: 1.0.0.1

  # Les règles de transformation
  exchange:
    - ~{exchange/.*\.yml}
```

Dans `exchange/`, l'organisation des fichiers est libre, comme dans
`mapping/` : un fichier peut porter plusieurs règles, un fichier par
règle reste recommandé (D1940, D1990). Les seules écritures :

## Ce qui s'écrit

- **le renommage** — `from: <ancien nom>` sur le champ, l'entité ou
  le module renommé (D651, D1111, D1984, D1985) : il s'écrit dans le
  modèle, à côté de ce qu'il renomme, non dans `exchange/`. Sans
  précision, l'ancien nom se lit dans la dernière version connue.
  `from: <ancien nom>@<version>` écrit la version d'origine, le
  numéro sans `v`, `from: abrege@1.0.0.0` (D1987) ; si elle n'est pas
  la dernière version connue, si elle n'existe pas ou si elle ne
  porte pas l'ancien nom, c'est une erreur d'ingestion (D1986–D1988). Écrire le numéro de version est préconisé :
  un renommage oublié dans le modèle se rejouerait à la version
  suivante, et deux noms échangés reviendraient en arrière sans qu'on
  le veuille ; la version écrite évite de procéder deux fois à la
  transformation : à la version suivante, l'ingestion refuse le
  renommage oublié au lieu de le rejouer. Le journal de
  migrations en dérive la translation, la chaîne API continue de
  servir l'ancien nom ;
- **l'éclatement et la fusion** — une règle d'`exchange/`, au format
  d'une règle de mapping (D4, D6, D1981, D1990). Ils n'ont pas de
  grammaire propre : ce sont deux usages des formules du langage. La
  fusion s'écrit par le gabarit, l'éclatement par `extract` et son
  expression régulière. Un exemple d'illustration, sur le contact de
  l'entrepôt :

```yaml
# La fusion : le prénom et le nom de la version antérieure en un seul champ
tiers.contact:

  # Les affectations
  fields:
    nom_complet: "{prenom} {nom}"
```

```yaml
# L'éclatement : un champ de la version antérieure en deux
tiers.contact:

  # Les affectations
  fields:
    prenom: extract(nom_complet, '^(\S+)')
    nom: extract(nom_complet, '\s(.+)$')
```

- **la dépréciation en trois temps** (D650, D1870, D1872) : **l'intention**
  (le bloc `deprecation:` — l'élément vit encore, son avenir est scellé),
  **la validation** (la beta qui retire l'élément), **la suppression**
  (un geste de version — l'élément quitte la description, D11–D13
  prend le relais). **La documentation est obligatoire** — le
  remplacement ou l'abandon précisé, vérifié à l'ingestion :

```yaml
# Le prix unitaire : son type et sa dépréciation
unit_price:
  type: amount
  deprecation:               # le bloc dit l'intention ; deprecated reste le statut d'une version
    documentation: "Remplacé par pricing.unit_price à la 2.x."
    to: pricing.unit_price   # le remplaçant ; absent = l'abandon
```

*Les décisions de cet exemple : D1871, D1872.*

  La forme courte nomme le seul remplaçant (D1873) : `deprecation: pricing.unit_price`.

- **le changement de type** — la compatibilité ou le transcodage :
  **chaque type porte sa ou ses règles de conversion** (D647,
  D579/D584) ;
- **la création et la suppression de champ** — les règles actées
  persistent (D11–D13 : la substitution vers l'ancien, le défaut
  vers le neuf).

## Les deux volets

**Les deux volets d'une règle d'`exchange/`** (D1883, D1992, D1996). Une
règle va dans deux sens.

- **L'ascendant** est son `fields:`. Le modèle de données n'est pas
  stocké dans toutes ses versions : il reflète la dernière version en
  production. L'ascendant permet de basculer, ou de fournir des données
  sans que le modèle soit encore officiellement basculé : une beta,
  hors du bac à sable, peut être servie sans que son modèle soit
  déployé.
- **Le descendant** va de la nouvelle version vers une ancienne. Il
  s'écrit dans la même règle, par le bloc `reverse:` (D1997). Le
  concepteur ne l'écrit que là où le moteur ne le dérive pas : rien
  pour un renommage ou un champ repris tel quel, la règle inverse pour
  une formule, une substitution pour un champ supprimé — une constante
  du bloc, `echeance: 30`. L'éclatement et la fusion demandent leur
  inverse écrit, comme toute formule (D91 amendée).

Les deux sens se lisent au même endroit. Un exemple d'illustration :

```yaml
# La fusion du prénom et du nom, et son inverse
tiers.contact:

  # L'ascendant : de la version antérieure vers la nouvelle
  fields:
    nom_complet: "{prenom} {nom}"

  # Le descendant : de la nouvelle vers l'antérieure
  reverse:
    prenom: extract(nom_complet, '^(\S+)')
    nom: extract(nom_complet, '\s(.+)$')
```

**La bijection d'une règle n'est pas assurée par Syncytium** (D91,
D1993) : elle est de la responsabilité du concepteur. En écrivant la
règle, il ne sait pas toujours qu'elle ne conserve pas les données. Un
contrôle, à la migration de version, vérifie donc ce point (D1994) : il
joue l'aller puis le retour sur chaque enregistrement migré, et
compare le retour à l'original. Un contact « Jean Pierre » « Dupont »
devient « Jean Pierre Dupont », puis revient en « Jean » et « Pierre
Dupont » : la règle ne conserve pas les données. Un écart entre au
rapport de la migration de version ; il demande une lecture et une
validation du concepteur pour basculer.

**Le bloc descendant n'est pas toujours dû** (D1995). Une formule sans
bloc descendant est une erreur d'ingestion quand les champs qu'elle lit
disparaissent de la nouvelle version : une ancienne API ne saurait plus
les rendre. Quand ils restent, la règle est acceptée : elle initialise
un champ nouveau en combinant des champs existants. Si `prenom` et
`nom` restent, `nom_complet` est défini à l'initialisation ; à l'usage,
il vit ensuite sa vie dans l'application.

## Les écarts documentés

**Les écarts sont documentés par Syncytium (D1112).** La description
d'un champ dit ce qu'il est, jamais ce qui a changé : la documentation
de la version présente les écarts calculés — les champs ajoutés,
renommés, retypés, supprimés — sans que le concepteur les décrive ;
les notes de version, elles, portent l'évolution fonctionnelle.
