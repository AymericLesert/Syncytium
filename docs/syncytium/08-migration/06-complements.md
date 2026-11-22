# Les compléments

> **Le mapping** est l'ensemble des règles de correspondance qu'une
> migration applique. Le plus souvent, une colonne alimente un champ :
> c'est le un pour un ([glossaire](../../glossaire.md)).

Une colonne pour un champ : la plupart des règles s'en tiennent là. Mais
une reprise a ses cas particuliers : un référentiel à déduire, deux
écritures à rapprocher, un numéro à reprendre. Ce fichier montre les
mécanismes qu'une règle emploie alors. Chacun garde sa définition dans
son chapitre ; celui-ci en montre l'usage, sur un cas (D1958). Les décisions citées entre
parenthèses renvoient au [registre](../../conception.md).

## Le sommaire

- [Au-delà du un pour un](#au-delà-du-un-pour-un)
- [Le référentiel par valeurs distinctes](#le-référentiel-par-valeurs-distinctes)
- [L'importation en phases](#limportation-en-phases)
- [Le rapprochement par le cache](#le-rapprochement-par-le-cache)
  - [La règle d'enregistrement empile](#la-règle-denregistrement-empile)
  - [La règle de complément associe](#la-règle-de-complément-associe)
- [Le compteur surchargé](#le-compteur-surchargé)
- [L'identité partout](#lidentité-partout)
  - [Toute entité porte une identité](#toute-entité-porte-une-identité)
  - [Plusieurs identités](#plusieurs-identités)
- [Une entité source, plusieurs fichiers](#une-entité-source-plusieurs-fichiers)
- [Les composés par la fonction du type](#les-composés-par-la-fonction-du-type)

## Au-delà du un pour un

Ce fichier montre des usages, pris dans les cas :

| Le besoin | Le mécanisme | Le cas qui le montre |
|---|---|---|
| un référentiel naît des valeurs d'une colonne | `distinct:` | la banque, l'entrepôt |
| l'ordre des gestes compte | des règles filtrées, en phases | la banque |
| deux lignes d'une même source se lient | le cache nommé, en deux règles | la banque |
| un numéro repris repositionne un compteur | la méthode `update` du compteur | l'entrepôt |
| plusieurs sources retrouvent le même enregistrement | l'identité, `identities:` | aucun : une illustration |
| une entité tient en plusieurs fichiers | la carte du connecteur | la banque |
| plusieurs colonnes font un champ | la fonction du type | l'entrepôt, la banque |

Seul `distinct:` se définit ici : c'est une clé de la règle. Les autres
mécanismes gardent leur définition dans leur chapitre :

| Le mécanisme | Où il se définit |
|---|---|
| le montant, le compteur | les types du [modèle](../02-modele/README.md) |
| `cache`, les fonctions | le [langage](../03-langage/README.md) |
| la référence de fichier `~{…}` | la [configuration](../01-configuration/README.md) |
| la lecture d'un fichier | les [connecteurs](../05-connecteurs/README.md) |

## Le référentiel par valeurs distinctes

Dans un ancien système, un référentiel n'est parfois qu'un texte répété
de ligne en ligne : le lieu d'une opération, dans la banque. La reprise
en déduit le référentiel. Avec `distinct:`, la destination prend les
valeurs distinctes d'un champ, ou d'une liste de champs (D658) :

- la valeur devient la clé fonctionnelle : elle alimente l'identité de
  la cible (D930) ;
- les entités porteuses la référencent par la clé (D654) ;
- la valeur lue est la valeur normalisée à la source (D660) ;
- la même table source porte plusieurs règles.

Dans la banque (le cas 4), le référentiel des lieux :

```yaml
  to: banque.lieu
  distinct: [Lieu]
  filter: Lieu is not null
  fields:
    libelle: Lieu
```

La règle porte un `filter:`, son périmètre (D663) : la valeur vide ne
fait pas un lieu. La règle des écritures référence ensuite le lieu par
cette clé : `lieu: Lieu`.

L'entrepôt fait de même pour ses dépôts : voir
[plusieurs origines, une même cible](04-regles.md#plusieurs-origines-une-même-cible).

## L'importation en phases

Certaines données ne peuvent entrer qu'après d'autres. L'importation se
découpe alors en phases : une phase est une règle filtrée (D663), et
l'ordre des phases est celui du préfixe des fichiers (D665). La banque
importe ainsi en trois phases (D814) :

| La phase | Les règles | Ce qu'elles font |
|---|---|---|
| 1 | `001_comptes`, `002_depots` | le marqueur OUVERTURE crée le compte, et son dépôt initial |
| 2 | `003_budgets`, `004_lieux`, `005_ecritures`, `006_ecritures_liees` | les référentiels, puis les écritures hors marqueurs |
| 3 | `007_soldes`, `008_clotures` | l'écriture du solde, puis la clôture par le marqueur FERMETURE |

La dernière règle ne crée rien : elle met à jour par la clé
fonctionnelle (D654). Elle retrouve le compte créé en phase 1, et pose
la clôture :

```yaml
  to: banque.compte
  filter: Budget = "FERMETURE"
  fields:
    numero:  Numero_Compte
    cloture: Date_Operation
```

- **le solde précède la clôture** : il s'écrit sur le compte encore
  ouvert (D815) ;
- **les valeurs marqueurs entrent au référentiel** des budgets, portées
  par les écritures de dépôt et de solde ;
- **le contrôle d'usage se fait à la validation de l'entité** (D824) :
  la date d'opération d'une écriture marqueur doit être l'ouverture ou
  la clôture du compte. Elle s'évalue au scellé (D594).

## Le rapprochement par le cache

Dans la banque, un virement fait deux écritures : une paire. Le
rapprochement est interne à la migration (D812). Il se fait en deux
phases, par le cache nommé de la migration (D821).

```mermaid
%%{init: {"flowchart": {"curve": "stepAfter"}}}%%
flowchart LR
    L["deux lignes d'un même virement<br/>A, puis B"]
    R1["la règle<br/>d'enregistrement"]
    C["le cache nommé<br/>une pile par clé"]
    R2["la règle<br/>de complément"]
    E["A et B, liées<br/>l'une à l'autre"]
    L -- "le premier parcours" --> R1
    R1 -- "cache.push" --> C
    L -- "le second parcours" --> R2
    C -- "cache.pop" --> R2
    R2 -- "me.liee.liee : me" --> E
```

### La règle d'enregistrement empile

La règle des écritures empile chaque virement référencé, dans ses
`operations:` :

```yaml
  operations:
    cache.push("virement", reference_virement, me) if reference_virement is not null
```

Le bloc `operations:` d'une règle porte des énoncés du langage, exécutés
par enregistrement. Le `if` postfixe y vaut (D364).

### La règle de complément associe

Une règle de complément re-parcourt la même source, et associe (D822) :

```yaml
  fields:
    liee: cache.pop("virement", reference_virement) if cache.size("virement", reference_virement) > 1
    me.liee.liee : me
```

- **une pile par clé**, dernier entré, premier sorti : la première ligne
  relue dépile la seconde empilée. C'est son miroir, jamais elle-même ;
- **la garde `size > 1` écarte l'orphelin** : il ne dépile pas, et le
  champ reste vide. C'est un fait, pas une non-conformité ;
- **le miroir reçoit sa référence en retour**, par l'affectation au
  chemin (D823) : `me.liee.liee : me`. Le membre gauche navigue, et
  écrit dans l'enregistrement pointé. L'ordre des affectations compte.
  Sur le vide, le chemin est sans effet ;
- **la règle de complément ne crée pas** : elle re-parcourt les mêmes
  lignes, dans le même passage. La correspondance entre la ligne et
  l'enregistrement est tenue par la migration (D666, D668).

## Le compteur surchargé

Une commande reprise garde son numéro d'origine : il ne se tire pas du
compteur de l'application. La règle écrit donc ce numéro dans un champ
de type compteur (D883, D998), puis remet le compteur à niveau. Dans
l'entrepôt, le numéro d'une commande de vente :

```yaml
    numero:
      formula: numero
      description: Le numéro calculé à la source ; la reprise surcharge la valeur du compteur.
```

La même règle repositionne ensuite le compteur, dans ses `operations:` :
`commande_vente.numero.update(numero)`. Voir
[les opérations d'une règle](04-regles.md#les-opérations-dune-règle).

- **`update(valeur)` est une méthode du type compteur** : si la valeur
  dépasse le compteur courant, le compteur se positionne sur elle ;
- **le champ s'adresse par le point** (D999) : l'écriture est plus
  parlante ;
- **les trous de la séquence reprise** relèvent du contrôle de la
  propriété du compteur, pas de la migration.

## L'identité partout

### Toute entité porte une identité

Toute entité porte au moins une identité : la sienne, ou celle qu'elle
hérite de sa racine (D1035, D1039). Son absence est une anomalie de
description du modèle. La règle « création seule », que D825 et D930
admettaient, n'existe pas.

Pour une règle, cela donne :

- l'enregistrement construit se retrouve dans la cible par son
  identité : deux enregistrements de même clé sont le même
  enregistrement (D1046) ;
- la règle de complément ne crée pas (D821) ;
- la règle de mise à jour alimente l'identité elle-même : une valeur
  inchangée, que le différentiel ignore.

### Plusieurs identités

Avec `identities:`, plusieurs sources retrouvent le même enregistrement
par des clés différentes (D1171, D1953). Aucun cas n'en porte ; en
illustration, une facture. Ses propriétés arrivent par son client et son
mois, son détail par son numéro :

```yaml
# Les identités d'une facture
# La clé de naissance, puis le numéro, acquis à la validation.
identities:
  mensuelle: [client, mois]
  numero: [numero]
```

| La clé | Son rôle à la reprise |
|---|---|
| la clé principale | elle est le lien principal : elle désigne l'enregistrement à chaque étape |
| une clé secondaire | elle s'associe à l'enregistrement dès qu'elle est définie ; si elle existait déjà, la nouvelle association la remplace |

- une seule de ses clés suffit à retrouver l'enregistrement (D1956) ;
- pendant la lecture, des clés peuvent se croiser : deux factures
  échangent leurs numéros d'une étape à l'autre ;
- l'intégrité se vérifie donc juste avant la validation de la
  migration, non à chaque ligne (D1954) ;
- ce contrôle différé vaut pour les identités secondaires (D1956) ;
- un doublon qui subsiste à ce moment est une anomalie (D1955).

## Une entité source, plusieurs fichiers

La même table arrive parfois en plusieurs fichiers. Deux fichiers au
même format font alors une seule entité : l'union de leurs lignes
(D816). La carte des entités vers les fichiers vit au connecteur
(D819, D828) : la section `entities:`, au même niveau que `parameters:`.
L'entité source reste purement logique (D652), et il n'y a qu'un
mapping. Dans la banque, le connecteur de l'ancien système :

```yaml
# Le legacy
# La base d'origine de la reprise : les fichiers CSV d'un dossier hors du dépôt, une entité sur un ou plusieurs fichiers
# du même format.
legacy:
  type: storage
  class: csv

  # Les paramètres du dossier
  # Le chemin, l'encodage et le séparateur des fichiers.
  parameters:
    directory: ${SYNCYTIUM_LEGACY_DIRECTORY}
    encoding: windows-1252
    separator: ";"

  # La carte des entités vers les fichiers
  # Par défaut, la première ligne du fichier porte les entêtes, qui nomment les colonnes de l'entité source ; un fichier
  # qui s'en écarte se déclare en objet — files, headers (l'entête de substitution), skipheader (sans entête). L'entité
  # budget lit deux fichiers : l'union de leurs lignes.
  entities:
    budget: [budget.txt, budget-clos.txt]
```

- **chaque entité déclare ses fichiers** : la liste, ou le motif
  (D806) ;
- **un fichier peut se répéter** : c'est le cas rare d'un fichier
  partagé ;
- **par défaut, la première ligne porte les entêtes** (D845) : la liste
  nue suffit ;
- **un fichier qui s'en écarte se déclare en objet**, avec `files:` et
  deux clés :

| La clé | Ce qu'elle dit |
|---|---|
| `headers: [..]` | l'entête de substitution, dans l'ordre des colonnes du fichier : elle prime |
| `skipheader: false` | le fichier n'a pas d'entête : les noms viennent de la substitution |

Ces clés se décrivent avec
[la déclaration d'un connecteur](../05-connecteurs/02-declaration.md).

## Les composés par la fonction du type

À l'inverse du un pour un, plusieurs colonnes de la source peuvent
alimenter un seul champ de la cible (D659). Aucune écriture nouvelle
n'est nécessaire : la fonction de construction est portée par le type
(D579, D584). Dans l'entrepôt, l'adresse d'un
client réunit deux coordonnées et six colonnes de texte :

```yaml
    adresse:
      formula: >-
        geolocation(ADCNGPSY, ADCNGPSX,
          ADCTRUE1 + " " + ADCTRUE2 + " " + ADCTRUE3 + ", " + ADCTCP + " " + ADCTVILLE + ", " + ADCTPAYS)
      description: >-
        L'adresse : ses coordonnées et l'adresse brute, assemblée de ses lignes.
```

Les autres types font de même :

- un montant et sa devise : `amount(LCCNPUBRUT, LCCTDEVISE)` ;
- une période : `period(NOCJDEBVAL, NOCJFINVAL)` ;
- une durée et son unité : `duration(NOCNTPSPRE, "h")`.
