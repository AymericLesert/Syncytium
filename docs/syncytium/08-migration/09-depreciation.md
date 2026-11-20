# La dépréciation d'un élément de la reprise

> **La dépréciation** d'un élément annonce son retrait. L'élément vit
> encore ; le bloc `deprecation:` dit ce qui le remplace, ou son abandon.
> Elle ne se confond pas avec la dépréciation d'une version, qui est
> effective ([glossaire](../../glossaire.md)).

Ce fichier dit comment se déprécie une migration déclarée, une entité
source ou une règle (D1873, D1877, D2011) : les deux formes du bloc, ce
que la dépréciation
touche, l'adresse d'une règle remplaçante, les trois temps. Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [Les trois éléments](#les-trois-éléments)
- [Les deux formes](#les-deux-formes)
- [Ce que la dépréciation touche](#ce-que-la-dépréciation-touche)
- [L'adresse d'une règle remplaçante](#ladresse-dune-règle-remplaçante)
- [De l'intention à la suppression](#de-lintention-à-la-suppression)

## Les trois éléments

Trois éléments d'une reprise peuvent être appelés à disparaître : **la
migration déclarée**, **l'entité source**, **la règle**. Le système
d'origine s'arrête, une table n'est plus fournie, une règle cède à une
autre. La configuration ne retire pas l'élément d'un coup. Elle
l'annonce d'abord, sur l'élément lui-même, dans la version en service
(D650, D1871). La migration continue de tourner comme avant.

## Les deux formes

**La forme courte.** Le bloc nomme le remplaçant, rien de plus (D1873) :
une migration déclarée nomme une autre migration déclarée, une entité
source une autre entité source, une règle une autre règle. L'exemple
est construit, aucun cas n'en porte. Dans l'entrepôt, PMI céderait à un
nouveau système, et la migration `cegid` à une migration `nouvel_erp` :

```yaml
# La migration cegid : la migration du nouveau système la remplace
cegid:

  # La base d'origine
  # Le storage de PMI, lu en lecture seule.
  from: cegid

  # La dépréciation
  # La migration nouvel_erp prend le relais.
  deprecation: nouvel_erp
```

**La forme longue.** Elle porte deux clés (D1871) :

- **`documentation:`**, le texte qui explique la dépréciation. C'est un
  texte de la version : à plusieurs langues, il les porte toutes
  (D1474) ;
- **`to:`**, l'élément remplaçant.

Sans `to:`, le bloc dit l'abandon, et `documentation:` est exigée. Une
dépréciation dit toujours le remplacement ou l'abandon ; l'ingestion le
vérifie (D650). Le bloc n'a pas de `mode:` : sa présence dit l'intention
(D1872). Dans une règle, ce `to:` est celui du bloc ; il ne se confond
pas avec le `to:` de la règle, qui nomme son entité cible.

L'entrepôt a une langue : son texte s'écrit en texte simple. L'exemple
est construit, lui aussi :

```yaml
# Les contacts de PMI : la table n'est plus fournie, sans remplaçante
CONTACT:

  # La dépréciation
  # L'abandon : le texte est exigé.
  deprecation:
    documentation: PMI ne fournit plus les contacts ; ils se saisissent dans l'entrepôt.
```

## Ce que la dépréciation touche

**Ce que la dépréciation d'un élément de la reprise touche.** L'élément
vit encore (D2011). Une dépréciation à venir signale les sources et les
règles, non les destinations (D2012) :

- **la migration déclarée** : ses sources et ses règles. Ses passages
  tournent, à son rythme, jusqu'à la version qui la retire ;
- **l'entité source** : les règles qui la lisent. Elle est lue comme
  avant ;
- **la règle** : elle s'applique comme avant ;
- **les destinations ne sont pas signalées** : les entités et les champs
  que la reprise alimente continuent de vivre après elle. Ils
  s'utilisent tels quels, sans que le processus s'exécute ;
- **le dictionnaire de la donnée** : le chapitre 4.1, « Reprise des
  données », montre l'élément déprécié, son remplaçant ou son abandon,
  et ce qu'il signale.

Dans l'entrepôt, déprécier la migration `cegid` signalerait ses
vingt-trois sources et ses trente-trois règles ; déprécier la source
`CONTACT`, les deux règles qui la lisent. Les tiers, les articles et les
commandes de l'entrepôt ne seraient pas signalés.

Signaler n'est pas déprécier : rien n'est déprécié en cascade (D2014).
Une source ou une règle signalée garde son propre bloc `deprecation:`,
si le concepteur veut annoncer son retrait.

**Au retrait**, le concepteur élimine ou remplace ce qui doit l'être :
une règle qui lit une source retirée, par exemple. Toute erreur est
alors une erreur d'ingestion (D2012).

## L'adresse d'une règle remplaçante

**L'adresse d'une règle remplaçante** (D2015). Une migration déclarée et
une entité source ont un nom. Une règle porte le nom de sa source, que
plusieurs règles partagent : dans l'entrepôt, `CONTACT:` ouvre la règle
des contacts des clients et celle des contacts des fournisseurs. Une
règle remplaçante se désigne donc par son nom propre, la propriété
`name:`. L'exemple est construit : une règle unique reprendrait tous les
contacts.

```yaml
# Les contacts : la règle remplaçante, désignée par son nom propre
CONTACT:

  # Le nom propre de la règle
  name: contacts

  # La cible
  to: tiers.contact
```

```yaml
# Les contacts des clients : la règle contacts la remplace
CONTACT:

  # La cible
  to: tiers.contact

  # Le périmètre
  filter: CTCTTYPCPT = "C"

  # La dépréciation
  deprecation: contacts
```

Trois règles accompagnent ce nom (D2016) :

- `name:` ne s'écrit que sur une règle qu'une autre désigne ; les
  trente-trois règles de l'entrepôt n'en portent pas ;
- deux règles d'un même processus ne portent pas le même nom : sinon,
  c'est une erreur d'ingestion ;
- ce `name:` n'est pas celui d'une source, qui nomme sa table (D1918).

## De l'intention à la suppression

**De l'intention à la suppression.** Une dépréciation se joue en trois
temps :

1. **L'intention.** Le bloc est écrit. Rien ne change : la reprise
   s'exécute comme avant (D650, D1872).
2. **La validation.** Une beta complète la dépréciation : en retirant
   l'élément, elle la valide (D1870, D1875).
3. **La suppression.** Elle vient avec une version : l'élément quitte la
   description (D650).

Le mot `deprecated` nomme autre chose : le statut d'une version, déposée
dans `versions/deprecated/`. Là, la dépréciation est effective (D1869).
Sur un élément de la reprise, le bloc s'écrit toujours `deprecation:`
(D1871).
