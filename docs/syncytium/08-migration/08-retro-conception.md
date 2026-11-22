# La rétro-conception

> **La rétro-conception** est le troisième usage du chapitre : un outil
> de Syncytium analyse le modèle de données d'une application existante
> et construit sa configuration. Aucune donnée ne migre
> ([glossaire](../../glossaire.md)).

Cette section exploite les notions abordées pour la reprise et pour la
migration de version : une source que son connecteur décrit, un
méta-modèle, des données qui passent de l'un à l'autre. Dans leur
continuité, Syncytium peut s'adapter à une application existante, grâce
à l'analyse de la description de son modèle de données : c'est la
rétro-conception. Ce fichier dit ce qu'elle est, ce que l'outil
construit et ce qu'il laisse au concepteur, comment elle se montre, et
comment elle se lance. Les décisions citées entre parenthèses renvoient
au [registre](../../conception.md).

## Le sommaire

- [La rétro-conception d'une application existante](#la-rétro-conception-dune-application-existante)
  - [Le principe](#le-principe)
  - [L'intérêt](#lintérêt)
- [Ce que l'outil construit, ce qu'il laisse](#ce-que-loutil-construit-ce-quil-laisse)
  - [Ce qu'il lit](#ce-quil-lit)
  - [Les indices de l'analyse](#les-indices-de-lanalyse)
  - [Ce que la base ne dit pas](#ce-que-la-base-ne-dit-pas)
  - [Le partage](#le-partage)
  - [Aucune donnée ne migre](#aucune-donnée-ne-migre)
- [Un scénario de démonstration](#un-scénario-de-démonstration)
  - [Quatre temps](#quatre-temps)
  - [Le retour à l'application d'origine](#le-retour-à-lapplication-dorigine)
- [La commande](#la-commande)
  - [`syncytium retro`](#syncytium-retro)
  - [Le fichier de la commande](#le-fichier-de-la-commande)
- [Ce qui reste à préciser](#ce-qui-reste-à-préciser)

## La rétro-conception d'une application existante

### Le principe

La rétro-conception ne migre pas les données, et ne les transforme pas.
Un outil de Syncytium analyse le modèle de données de l'application
existante : le méta-modèle se déduit automatiquement de la description
que le connecteur donne de la base (D1907, D2026). Syncytium se pose
alors sur cette base, telle qu'elle est : ses modules, ses entités et
ses champs sont ceux de l'application (D2027).

### L'intérêt

Le modèle obtenu permet de lancer Syncytium sans une première charge
d'analyse trop lourde : c'est une forme de rétro-ingénierie (D2028). En
démonstration, l'effet est immédiat. Syncytium se plaque sur une
application existante et, en quelques minutes, une nouvelle application
est disponible : de quoi montrer d'un coup l'intérêt de la solution
(D2029, D2097).

## Ce que l'outil construit, ce qu'il laisse

### Ce qu'il lit

L'outil lit deux choses dans la base existante (D2108) :

- **son schéma**, par la description que le connecteur en donne : les
  tables, les colonnes et leurs types, et tout ce que la base déclare —
  les clés, les références d'intégrité, les séquences, les partitions
  (D2109) ;
- **ses données**, pour dire ce que le schéma ne dit pas. L'outil
  parcourt toute la table (D2109) : deux colonnes qui ne se répètent
  jamais ensemble font une identité possible ; une colonne qui ne prend
  que quelques valeurs, un énuméré possible.

Lire les données n'est pas les migrer : elles restent où elles sont. Ce
que l'outil en déduit est une proposition, que le concepteur confirme.

Le nom d'une colonne est aussi un indice. Dans PMI, une colonne dont le
nom porte un K en troisième position est une clé par construction, et
les premières colonnes d'une table aident à repérer sa clé. La
convention de nommage du connecteur le dit à Syncytium (D876) : celle
de l'entrepôt déclare `identity: [K, I]`. Pour la table ARTICLE, les
données révèlent ainsi une clé à trois composants : `ARKTSOC`,
`ARKTCODART` et `ARKTCOMART`.

### Les indices de l'analyse

Deux principes guident l'analyse (D2110) :

- **ce que la base déclare est un fait ; ce que les données suggèrent
  est une proposition** ;
- **chaque proposition porte sa preuve**, « unique sur 48 213 lignes »
  par exemple, pour que le concepteur décide vite.

| Ce que l'outil cherche | L'indice dans le schéma | L'indice dans les données | Ce qu'il propose |
|---|---|---|---|
| l'identité | la clé primaire, un index unique ; à défaut la convention de nommage, les premières colonnes | la plus petite combinaison de colonnes qui ne se répète jamais | `identity:` |
| une référence | la référence d'intégrité | une colonne dont toutes les valeurs se retrouvent dans l'identité d'une autre table | le type de l'entité visée |
| une composition | une référence vers le parent, prise dans la clé du fils | l'identité du fils commence par celle d'une autre table | `list of` chez le possesseur |
| un énuméré | une contrainte de valeurs | peu de valeurs distinctes | les valeurs de l'énuméré |
| un booléen | le type de la colonne | deux valeurs seulement | `boolean` |
| l'obligatoire | la colonne déclarée non nulle | jamais vide | `required:` |
| le type et ses bornes | le type et la longueur de la colonne | un texte qui se lit toujours comme une date ou un nombre ; le minimum, le maximum, la plus grande longueur | le type, ses bornes |
| un compteur | une séquence | un entier qui croît sans se répéter | `counter` |
| la partition | les partitions déclarées | rien | `partition:` |
| une colonne morte | rien | toujours vide, ou toujours la même valeur | un signalement au concepteur |

### Ce que la base ne dit pas

Il reste des cas où la base ne dit rien, même lue en entier.

**La table où rien ne fait clé.** Un journal peut porter deux lignes
parfaitement égales, qui sont deux faits distincts : aucune combinaison
de ses colonnes n'est unique. Or toute entité porte une identité
(D1035). L'outil ajoute alors à la table une colonne technique, un
numéro, qui lui sert d'identité (D2111). Trois règles l'encadrent
(D2112) :

- **la colonne répond à l'absence de clé** : elle donne à la table une
  clé, et le moyen de la gérer ;
- **l'administrateur en est averti avant**, et le concepteur avec lui,
  qui est un administrateur (D2114) : le signalement est fait avant que
  la mise à jour du modèle de la base de données ne se déclenche ;
- **la colonne se gère comme un compteur** : son ajout demande un
  traitement, qui lui donne ses valeurs.

C'est le seul cas où la rétro-conception modifie d'elle-même la base
existante.

**Les modules.** Toute entité vit dans un module, et une base n'en a
pas. L'outil s'en remet au connecteur, qui fournit la description du
modèle de données (D2113) :

- si le connecteur sait construire des modules, l'outil les utilise ;
- sinon, toutes les entités vont dans un seul module.

### Le partage

L'outil va au-delà du méta-modèle (D2026). Beaucoup d'éléments se
construisent automatiquement ; trois ne se déduisent pas d'un existant :

| L'outil construit | Le concepteur écrit |
|---|---|
| le méta-modèle, exploitable et opérationnel, à partir du modèle de données existant | les opérations |
| les fichiers de configuration pour accéder à l'application, si cela se déduit | les règles |
| les écrans par défaut : construits pour l'occasion, ou ceux que Syncytium fournit | les droits |

Reporter tout ce qui fait un métier, et ses besoins, est le travail du
concepteur (D2028).

```mermaid
%%{init: {"flowchart": {"curve": "stepAfter"}}}%%
flowchart LR
    B["la base de<br/>l'application existante"]
    F["monapp.yml<br/>la connexion, les accès,<br/>le dossier racine"]
    R["syncytium retro"]
    C["monapp/<br/>le méta-modèle, la configuration d'accès,<br/>les écrans par défaut"]
    M["le concepteur<br/>les opérations, les règles, les droits"]
    S["Syncytium, posé sur<br/>la base existante"]
    B -- "son modèle de données" --> R
    F --> R
    R --> C
    C --> S
    M --> S
```

### Aucune donnée ne migre

Le méta-modèle se pose sur le modèle de données existant. Puis Syncytium
prend le relais, en douceur (D2026). La base reste celle de
l'application d'origine.

## Un scénario de démonstration

### Quatre temps

Pour un démonstrateur, la rétro-conception peut être puissante (D2029).
Elle se montre en quatre temps :

1. une application existante est là, avec sa base de données ;
2. le méta-modèle se construit ;
3. Syncytium s'exécute, et montre son initialisation ;
4. le modèle évolue pour une exploitation — ou l'on revient à
   l'application d'origine, si cela ne convient pas.

### Le retour à l'application d'origine

Le retour est possible parce qu'aucune donnée ne migre (D2030) : la
base reste celle de l'application d'origine.

| Ce qui a été fait | Le retour |
|---|---|
| aucune modification du modèle de données | sans perte : l'application d'origine retrouve sa base telle quelle |
| le modèle intègre des évolutions | une perte minimale : une évolution que l'application d'origine ne connaît pas |
| le modèle n'intègre pas des contrôles existants | une perte minimale : des enregistrements entrés sans un contrôle qu'elle imposait |

## La commande

### `syncytium retro`

La rétro-conception se lance par `syncytium retro monapp.yml` (D2030).
Le fichier `monapp.yml` porte :

- les éléments de connexion à la base de données à analyser ;
- les propriétés et les accès ;
- le dossier racine.

Le cadre commun des commandes de `syncytium` se définit au chapitre 10,
l'administration et l'exploitation (D2098).

### Le fichier de la commande

Ce fichier ne sert qu'à construire le dossier `monapp/` (D2031) :

- il n'a pas besoin de variables d'environnement : ses valeurs
  s'écrivent en clair ;
- une fois le dossier construit, il n'est plus exploitable ;
- il est recommandé de ne pas le versionner, surtout s'il contient des
  données sensibles.

Un fichier minimal illustre la proposition :

```yaml
# La base à analyser
# La base de données de l'application existante : la classe de son connecteur, ses paramètres de connexion et ses
# accès, écrits en clair ; la marque * signale un paramètre confidentiel.
database:
  class: postgresql
  parameters:
    host: localhost
    database: monapp
    schema: public
    user: lecteur
    password*: <le mot de passe du compte>

# Le dossier racine
# Le dossier où la commande écrit la configuration construite.
root: monapp/
```

Il se complétera à l'implémentation.

## Ce qui reste à préciser

La rétro-conception n'a pas encore été lue point par point, comme la
reprise et la migration de version l'ont été. Ses points se dégageront à
l'ouverture de cette lecture.
