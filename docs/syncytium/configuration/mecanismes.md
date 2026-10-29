# 2. Les mécanismes transverses

## 2.1 La référence de fichier — `~{<fichier>}` (D956)

Toute valeur qui désigne un fichier de configuration s'écrit
**`~{…}`** : « la partie de la configuration sera remplacée par le
contenu du fichier correspondant. Ce fichier est chargé par la
configuration ». La valeur nue est un littéral — l'ingestion refuse un
fichier non marqué.

```yaml
fields: ~{fields.yml}                # le contenu du fichier remplace la valeur
entities:
  - ~{article/article.yml}           # dans une liste, un élément par fichier
  - ~{fabrique/fabrique.yml}
```

- **le chemin est relatif au fichier courant** (D768) : chaque fichier
  se lit seul et se déplace avec son sous-arbre ;
- **le contenu ou la référence, partout** (D767/D352) : toute
  propriété accepte l'un ou l'autre — le fichier unique léger pour le
  cas simple, l'éclatement libre pour l'entité conséquente ; **le
  nommage et l'organisation sont libres** (D807 — le fichier éponyme
  du dossier est une convention d'exemple, pas une règle) ;
- **un nom de fichier chargé à l'usage, pas par la configuration**, reste
  nu — les fichiers de données d'un connecteur (`entities:` d'un
  storage de fichiers, D819/D828), les journaux de `logging.yml` ;
- **jamais en collection de flux** : l'accolade y casse YAML —
  `[ ~{a.yml} ]` est une erreur ; la liste en bloc, ou les guillemets
  simples (D892).

## 2.2 Le pattern — la liste par expression régulière (D806)

Partout où une liste de fichiers se déclare, **un pattern regex peut
remplacer l'énumération** — c'est une déclaration : le standard
d'organisation et de nommage que le concepteur se fixe.

```yaml
versions:
  - ~{v[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/version\.yml}   # toutes les versions du statut
mapping:
  - ~{mapping/[0-9]+_.*\.yml}        # les règles de migration
```

**L'ordre au sein d'un pattern est alphabétique** (D665) — le préfixe
numérique décrit les étapes (`001_…`, `002_…`).

## 2.3 Le cumul de fichiers sous une carte (D968)

Une propriété qui porte une carte (`fields:`, `values:`,
`parameters:`…) peut porter **une liste de références en bloc** :

```yaml
fields:
  - ~{articles/commun.yml}           # un fichier — son contenu
  - ~{articles/nomenclature.yml}     # un autre, fusionné à la suite
  - actif: ARCTBLOCAG = ""           # une carte en ligne — les champs propres
    date_creation: ARCJCRE
```

- **la fusion dans l'ordre** — la carte est l'union des clés ;
- **la même clé deux fois est une surcharge** : le dernier l'emporte,
  **une alerte est levée à l'ingestion** ;
- **le pattern y vaut** — `- ~{articles/.*\.yml}`, l'ordre alphabétique ;
- **un élément est une référence de fichier ou une carte en ligne**,
  fusionnée comme un contenu de fichier.

Le premier usage : les règles de migration de l'article du cas 5, qui
partagent un bloc de trente-huit champs par `fields:
~{articles/fields.yml}` (D967) — comme l'entité le fait depuis D767.

## 2.4 Les variables — `${…}` (D321)

`${KEY}`, ou `${KEY?défaut}` quand la clé peut manquer. `KEY` est :

- **une variable d'environnement** — `${ENTREPOT_HOST}`,
  `${SYNCYTIUM_LOG_DIRECTORY}` ;
- **un mot-clé** — `${PROJECT}`, `${VERSION}`… (la liste extensible) ;
  **`${now:yyyy-mm-dd}`** (D1069 ; il remplace `${date:%Y-%m-%d}`,
  D1071) — l'instant de l'usage, évalué à la demande de la
  configuration, jamais au chargement, le masque dans la notation des
  types : le fichier de détail d'une migration porte la date de son
  exécution ;
- **un élément de la configuration, en navigation relative
  remontante** — `${name}` au même niveau, `${.name}` au niveau
  précédent, `${..name}` au parent du précédent, chaque point remonte
  d'un niveau **de la structure YAML** — un point ne compte jamais un
  fichier : le fichier inclus par `~{…}` prend la place de sa clé
  (D1089) ; dans `logging.yml`, le nom du fichier journal remonte au
  `name:` de `syncytium.yml`, le nom du projet — `${.....name}`, cinq
  points depuis `handlers.file.filename` ;
- **l'imbrication est permise** —
  `${triggers.${environment.name}.filename}`.

**L'interpolation lit aussi la racine du projet** (D885 — « on exploite
une capacité de la configuration » ; D1536) : `confidentiality:
${confidentiality.financier}` référence un profil nommé une fois dans
`syncytium.yml` (la forme de la référence confirmée le 29/10/2026).

## 2.4 bis Rien hors de la configuration (D1440)

« Toutes les variables d'environnement sont présentes par construction
dans la configuration. Une règle à porter dans le développement d'un
hook ou dans le développement de Syncytium consiste à dire que les
éléments de configuration nécessaires au fonctionnement doivent être
présents dans le fichier de configuration et nulle part ailleurs. » — le
core et les hooks ne lisent que ce que la configuration référence ; le
fichier des variables créé par `syncytium init` (D1429) est donc complet
par construction, et le D.A.T. (documentation.md §28) en expose la
liste entière.

## 2.5 La marque `*` — la clé confidentielle (D944)

Une clé suffixée `*` porte une information confidentielle : **sa valeur
n'est jamais lisible dans les journaux** (D703), et sa variable est
chiffrée par le wizard — **en clair dans le `.env`, elle empêche le
démarrage** (D902).

```yaml
parameters:
  user: ${ENTREPOT_USER}
  password*: ${ENTREPOT_PASSWORD}    # la marque * : confidentiel, la variable chiffrée
```

C'est la seule forme du secret : il n'existe pas de liste `secrets:`.

**Dans la documentation** (D1247) : la clé `*` est la seule chose
que le dictionnaire de la donnée et sa configuration dépliée en annexe
ne montrent pas ; tout le reste y est, avec son niveau de
confidentialité.

## 2.6 L'adressage logique — le point (D363)

`<module>.<entité>.<champ>` — **le point, jamais la barre oblique** :
le chemin logique est découplé de l'arborescence physique ; le nom
local suffit dans le même module. **`name:` porte l'espace de noms**
(D344/D396 : un doublon de nom est une erreur d'ingestion) ; les
dossiers ne sont qu'une convention, les listes de fichiers disent ce
qui est inclus.

## 2.7 Le langage d'expression dans les valeurs (D90–D92)

Un seul langage sert les calculs (`formula:`), les validations
(`validation:`), les filtres (`filter:`), les normalisations
(`normalize:`), les règles de migration (`fields:` d'une règle), les
conditions (`if`, `when:`). Ses mots à portée : **`me`** — la valeur à
l'étage du champ (`normalize: trim(me)`), l'enregistrement à l'étage
de la règle (D872/D822) ; **`owner`** — le possesseur (D760/D841) ;
**`context`** — le contexte courant (`context.now`, `context.settings`,
D575/D588) ; **`connector`** et **`cache`** dans une règle de migration
(D821/D845). Le conditionnel s'écrit `valeur if condition else
autre` — les cas s'enchaînent par `else … if …`, lus de gauche à
droite, les parenthèses changent la priorité, et le `if` seul vaut
nul sinon (D580/D1003/D1109–D1110 ; `iif` est retiré) ; un jeu de
valeurs s'écrit `.select(clé: valeur, "...": défaut)` sur le type
(D584) ; le `if` suffixé des agrégats (D887). **Chaque type porte ses fonctions**
(D579) — le catalogue est dans [types.md](../../types.md).

## 2.8 La forme courte et le bloc (D356)

`fields:` est une carte ordonnée : le nom du champ en clé, l'ordre de
déclaration = l'affichage par défaut. **Une valeur chaîne est le type,
tout au défaut** — `notes: text` ; le bloc quand une facette s'écrit :

```yaml
fields:
  notes: text                        # la forme courte — le type, tout au défaut
  code:                              # le bloc — le type et ses facettes
    type: text[..18]
    required: true
    label: { fr: Code article }
  date_creation: date_pmi            # un type dérivé (D992), la forme courte
```

**Les groupes de champs** (D1273, D1279–D1280) : dans la même carte,
**une clé qui porte `fields:` sans `type:` est un groupe** (D1289) — son
`title:` par langue, ses champs en place ou dans un fichier référencé,
un fichier par groupe dans le cas 5 ; les champs hors groupe forment le
groupe implicite ; les noms de champs restent uniques dans l'entité et
s'adressent sans le groupe ; un groupe ne s'emboîte pas. Un champ qui
porte `type:` et `fields:` est une liste de valeurs composées (D115),
pas un groupe.

```yaml
fields:
  code: text[..18]                   # hors groupe — le groupe implicite, l'en-tête de l'écran
  prix:                              # un groupe : title: et fields:, sans type:
    title: Les prix
    fields: ~{prix.yml}              # ou le bloc en place
```

## 2.9 Les deux formes d'une collection — la liste et la substitution (D1113)

Les collections **`versions`, `modules` et `entities`** s'écrivent de **deux
manières équivalentes** ; le modèle décrit est le même.

1. **La liste de valeurs** — le niveau est nommé (`versions:`, `modules:`,
   `entities:`) et chaque élément porte son identifiant dans une propriété :
   **`version:`** pour une version, **`name:`** pour un module ou une entité.
   C'est la forme du cas 2 et des autres exemples ; elle reste vraie.
2. **La substitution** — le niveau disparaît et **l'identifiant devient la
   clé**, à la place de la propriété : `1.0.0.0:` remplace `- version: 1.0.0.0`,
   `annuaire:` ou `personne:` remplace `- name: …`. C'est la forme du tiny
   hello world (cas 1), une simplification d'écriture.

```yaml
# la liste de valeurs
versions:
  - version: 1.0.0.0
    modules:
      - name: annuaire
        entities:
          - name: personne
            fields:
              nom: text[..40]
```

```yaml
# la substitution — le même modèle, sous un statut
1.0.0.0:
  annuaire:
    personne:
      fields:
        nom: text[..40]
```

Les deux formes se valent à l'ingestion : un fichier se lit, se compare et se
documente de la même façon quelle que soit l'écriture.

**Dans la substitution, le niveau n'est plus nommé : le moteur le déduit de la
position** — sous un statut, les clés sont des versions ; sous une version, des
modules ; sous un module, des entités. **Au même niveau, les clés réservées
(les propriétés du niveau : `environment`, `release-notes`, `description`,
`title`, `languages`…) sont celles du moteur, toutes les autres sont des identifiants** ;
un identifiant qui reprend une clé réservée de son niveau est refusé à
l'ingestion.

## 2.10 Les défauts du poste (D1114)

Ce qu'un projet n'écrit pas, le système le porte. Un projet minimal — le tiny
hello world (cas 1) — ne déclare que son modèle et un environnement :

- **La journalisation** — sans `logging:`, les traces vont sur **la sortie
  standard, en mode `verbose`**.
- **Le nettoyage** — sans `cleanup:`, rien : la sortie standard ne laisse aucun
  fichier à nettoyer.
- **La langue** — sans `languages:`, **la langue est la localisation définie sur
  le poste** ; les textes s'écrivent alors en texte simple (D1101).
- **Le connecteur** — sans bloc `connectors:`, `storage: sqlite` désigne un
  connecteur implicite dont le nom, la famille et la classe sont `sqlite`
  (D1093 : le type ne s'écrit pas quand le nom est la famille).
- **La première clé** — `from: Syncytium-1.0` reste écrite (D1083).
