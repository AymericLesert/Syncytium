# 2. Les mécanismes transverses

Dix mécanismes reviennent dans toute la configuration, quel que soit le
fichier. Ils sont décrits ici une fois. Les chapitres suivants les
emploient sans les redire.

## 2.1 La référence de fichier — `~{<fichier>}` (D956)

Une valeur peut désigner un fichier. Elle s'écrit alors `~{…}`. À
l'ingestion, la partie de la configuration est remplacée par le contenu
du fichier. Ce fichier est chargé par la configuration elle-même.

```yaml
# Les champs de l'entité : le contenu du fichier remplace la valeur
fields: ~{fields.yml}

# Les entités du module : dans une liste, un élément par fichier
entities:
  - ~{article/article.yml}
  - ~{fabrique/fabrique.yml}
```

Une valeur nue est un littéral. Un fichier non marqué `~{…}` n'est pas
chargé, et l'ingestion le refuse. Quatre règles accompagnent la marque :

- **le chemin est relatif au fichier courant** (D768) : chaque fichier se
  lit seul et se déplace avec son sous-arbre ;
- **le contenu ou la référence, partout** (D767, D352) : toute propriété
  accepte l'un ou l'autre, le fichier unique pour le cas simple,
  l'éclatement pour l'entité conséquente ; le nommage et l'organisation
  sont libres (D807), le fichier qui porte le nom de son dossier est une
  convention des exemples, pas une règle ;
- **un nom de fichier chargé à l'usage reste nu** : les fichiers de
  données d'un connecteur, les journaux de `logging.yml` ne sont pas de
  la configuration, la marque ne s'y applique pas (D819, D828) ;
- **jamais en collection de flux** : l'accolade casse YAML, `[ ~{a.yml} ]`
  est une erreur ; on écrit la liste en bloc, ou entre guillemets
  simples (D892).

## 2.2 Le pattern — la liste par expression régulière (D806)

Partout où une liste de fichiers se déclare, une expression régulière
peut remplacer l'énumération. Le pattern est une déclaration : il dit le
standard de nommage que le concepteur se fixe.

```yaml
# Les versions du statut : toutes celles dont le dossier porte un numéro en quatre nombres
versions:
  - ~{v[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/version\.yml}

# Les règles de migration, dans l'ordre de leur préfixe numérique
mapping:
  - ~{mapping/[0-9]+_.*\.yml}
```

L'ordre au sein d'un pattern est alphabétique (D665). Un préfixe
numérique ordonne donc les étapes : `001_…`, `002_…`.

## 2.3 Le cumul de fichiers sous une carte (D968)

Une propriété qui porte une carte, `fields:`, `values:`, `parameters:`,
peut recevoir une liste de références en bloc. Les fichiers se fondent en
une seule carte.

```yaml
# Les champs d'une règle de migration : deux fichiers partagés, puis les champs propres à la règle
fields:
  - ~{articles/commun.yml}
  - ~{articles/nomenclature.yml}
  - actif: ARCTBLOCAG = ""
    date_creation: ARCJCRE
```

- **la fusion suit l'ordre** : la carte est l'union des clés ;
- **la même clé deux fois est une surcharge** : le dernier l'emporte, et
  l'ingestion lève une alerte ;
- **le pattern y vaut** : `- ~{articles/.*\.yml}`, dans l'ordre
  alphabétique ;
- **un élément est une référence ou une carte en ligne**, fusionnée comme
  le contenu d'un fichier.

Le premier usage est dans l'entrepôt (le cas 5) : les règles de
migration de l'article partagent un bloc de trente-huit champs par
`fields: ~{articles/fields.yml}` (D967), comme une entité le fait depuis
D767.

## 2.4 Les variables — `${…}` (D321)

Une variable s'écrit `${KEY}`, ou `${KEY?défaut}` quand la clé peut
manquer. `KEY` est l'une de quatre choses.

- **Une variable d'environnement** : `${ENTREPOT_HOST}`,
  `${SYNCYTIUM_LOG_DIRECTORY}`. Sa valeur vient du déploiement.
- **Un mot-clé** : `${PROJECT}`, `${VERSION}`, la liste est extensible.
  `${now:yyyy-mm-dd}` donne l'instant de l'usage, évalué à la demande et
  jamais au chargement, avec un masque dans la notation des types
  (D1069) : le fichier de détail d'une migration porte ainsi la date de
  son exécution.
- **Un élément de la configuration**, en navigation relative remontante :
  `${name}` au même niveau, `${.name}` au niveau précédent, `${..name}` au
  parent du précédent. Chaque point remonte d'un niveau de la structure
  YAML, jamais d'un fichier : un fichier inclus par `~{…}` prend la place
  de sa clé (D1089).
- **Une imbrication** : `${triggers.${environment.name}.filename}`.

```yaml
# Le fichier du journal
# Son nom remonte au nom du projet, cinq niveaux plus haut dans la structure ; la date est celle de l'usage.
handlers:
  file:
    filename: ${SYNCYTIUM_LOG_DIRECTORY}/${.....name}-${now:yyyy-mm-dd}.log
```

L'interpolation lit aussi la racine du projet (D885, D1536). Un profil de
confidentialité, nommé une fois dans `syncytium.yml`, se référence depuis
un champ :

```yaml
# La confidentialité du champ : le profil financier, déclaré à la racine du projet
confidentiality: ${confidentiality.financier}
```

### Rien hors de la configuration (D1440)

Tout ce dont le moteur ou un hook a besoin est dans la configuration, et
nulle part ailleurs. Le registre le dit : « Toutes les variables
d'environnement sont présentes par construction dans la configuration.
Une règle à porter dans le développement d'un hook ou dans le
développement de Syncytium consiste à dire que les éléments de
configuration nécessaires au fonctionnement doivent être présents dans le
fichier de configuration et nulle part ailleurs. » Deux conséquences :

- le fichier des variables que `syncytium init` crée est complet par
  construction (D1429) ;
- le D.A.T. en expose la liste entière
  ([documentation.md](../../documentation.md) §28).

## 2.5 La marque `*` — la clé confidentielle (D944)

Une clé suffixée `*` porte une information confidentielle.

```yaml
# Les paramètres du connecteur
# Le mot de passe porte la marque * : sa valeur est confidentielle, sa variable est chiffrée.
parameters:
  user: ${ENTREPOT_USER}
  password*: ${ENTREPOT_PASSWORD}
```

La marque a trois effets :

- la valeur n'est jamais lisible dans les journaux (D703) ;
- la variable est chiffrée par le wizard d'initialisation ;
- en clair dans le `.env`, elle empêche le démarrage (D902).

C'est la seule forme du secret. Il n'existe pas de liste `secrets:`. Dans
la documentation générée, la clé `*` est la seule chose que le
dictionnaire de la donnée et sa configuration dépliée ne montrent pas ;
tout le reste y est, avec son niveau de confidentialité (D1247).

## 2.6 L'adressage logique — le point (D363)

Un élément s'adresse par son chemin logique, `<module>.<entité>.<champ>`,
avec le point, jamais la barre oblique. Le chemin logique est découplé de
l'arborescence physique : les dossiers sont une convention, les listes de
fichiers disent ce qui est inclus.

- Dans le même module, le nom local suffit : `article` plutôt que
  `technique.article`.
- `name:` porte l'espace de noms (D344, D396) : un doublon de nom est une
  erreur d'ingestion.

## 2.7 Le langage d'expression dans les valeurs (D90–D92)

Un seul langage sert partout où une valeur se calcule ou se vérifie :

- les calculs, `formula:` ;
- les validations, `validation:` ;
- les filtres, `filter:` ;
- les normalisations, `normalize:` ;
- les règles de migration, `fields:` d'une règle ;
- les conditions, `if`, `when:`.

Ses mots à portée :

- **`me`** : la valeur, à l'étage du champ (`normalize: trim(me)`) ;
  l'enregistrement, à l'étage de la règle (D872, D822) ;
- **`owner`** : le possesseur (D760, D841) ;
- **`context`** : le contexte courant, `context.now`, `context.settings`
  (D575, D588) ;
- **`connector`** et **`cache`** : dans une règle de migration (D821,
  D845).

Le conditionnel s'écrit `valeur if condition else autre`. Les cas
s'enchaînent par `else … if …`, lus de gauche à droite ; les parenthèses
changent la priorité ; un `if` seul vaut nul sinon (D580, D1003, D1109,
D1110). Un jeu de valeurs s'écrit `.select(clé: valeur, "...": défaut)`
sur le type (D584). Les agrégats acceptent un `if` suffixé (D887).

```yaml
# Le montant signé : le conditionnel natif
montant_signe: credit if credit != null else -debit

# L'état en clair : un jeu de valeurs sur le type, avec son défaut
etat_lisible: etat.select(brouillon: "En cours", valide: "Validée", "...": "Autre")

# La dernière sortie : un agrégat filtré par un if suffixé
derniere_sortie: mouvements.max(date if sens = "sortie")
```

Chaque type porte ses fonctions (D579). Le catalogue est dans
[types.md](../../types.md).

## 2.8 La forme courte et le bloc (D356)

`fields:` est une carte ordonnée. Le nom du champ est la clé ; l'ordre de
déclaration est l'ordre d'affichage par défaut. Une valeur chaîne est le
type, tout le reste au défaut. Le bloc sert dès qu'une facette s'écrit.

```yaml
# Les champs de l'entité
fields:
  # Les notes : la forme courte, le type seul, tout au défaut
  notes: text

  # Le code : le bloc, le type et ses facettes
  code:
    type: text[..18]
    required: true
    label: { fr: Code article }

  # La date de création : un type dérivé, déclaré aux settings, en forme courte
  date_creation: date_pmi
```

### Les groupes de champs (D1273, D1279–D1280)

Dans la même carte, une clé qui porte `fields:` sans `type:` est un
groupe (D1289). Il a son `title:` par langue, et ses champs en place ou
dans un fichier référencé.

```yaml
# Les champs de l'article
fields:
  # Le code, hors groupe : le groupe implicite, l'en-tête de l'écran
  code: text[..18]

  # Les prix : un groupe, son titre et ses champs dans un fichier
  prix:
    title: Les prix
    fields: ~{prix.yml}
```

- les champs hors groupe forment le groupe implicite ;
- les noms de champs restent uniques dans l'entité et s'adressent sans le
  groupe ;
- un groupe ne s'emboîte pas ;
- un champ qui porte `type:` et `fields:` n'est pas un groupe : c'est une
  liste de valeurs composées (D115).

## 2.9 Les deux formes d'une collection — la liste et la substitution (D1113)

Les collections `versions`, `modules` et `entities` s'écrivent de deux
manières. Le modèle décrit est le même.

**La liste de valeurs.** Le niveau est nommé, et chaque élément porte son
identifiant dans une propriété : `version:` pour une version, `name:`
pour un module ou une entité. C'est la forme des cas 2 à 5.

```yaml
# Les versions, en liste : chaque élément porte son identifiant dans une propriété
versions:
  - version: 1.0.0.0
    modules:
      - name: annuaire
        entities:
          - name: personne
            fields:
              nom: text[..40]
```

**La substitution.** Le niveau disparaît, et l'identifiant devient la
clé : `1.0.0.0:` remplace `- version: 1.0.0.0`, `annuaire:` remplace
`- name: annuaire`. C'est la forme du tiny (le cas 1), la plus courte.

```yaml
# La même version, en substitution : l'identifiant est la clé, le niveau n'est plus nommé
1.0.0.0:
  annuaire:
    personne:
      fields:
        nom: text[..40]
```

Les deux formes se valent à l'ingestion. Un fichier se lit, se compare et
se documente de la même façon, quelle que soit l'écriture. Dans la
substitution, le moteur déduit le niveau de la position :

- sous un statut, les clés sont des versions ;
- sous une version, des modules ;
- sous un module, des entités.

Au même niveau, les clés réservées sont celles du moteur, `environment`,
`release-notes`, `description`, `title`, `languages` ; toutes les autres
sont des identifiants. Un identifiant qui reprend une clé réservée de son
niveau est refusé à l'ingestion.

## 2.10 Les défauts du poste (D1114)

Ce qu'un projet n'écrit pas, le poste le porte. Le tiny (le cas 1) ne
déclare que son modèle et un environnement ; le reste vient des défauts :

- **la journalisation** : sans `logging:`, les traces vont sur la sortie
  standard, en mode `verbose` ;
- **le nettoyage** : sans `cleanup:`, rien, la sortie standard ne laisse
  aucun fichier ;
- **la langue** : sans `languages:`, la langue est celle du poste, et les
  textes s'écrivent en texte simple (D1101) ;
- **le connecteur** : sans bloc `connectors:`, `storage: sqlite` désigne
  un connecteur implicite dont le nom, la famille et la classe sont
  `sqlite` (D1093) ;
- **la première clé** : `from: Syncytium-1.0` reste écrite (D1083).

L'inventaire complet des défauts du socle est dans
[defauts.md](defauts.md).
