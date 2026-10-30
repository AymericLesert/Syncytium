# La vie d'un enregistrement — l'héritage, la suppression, l'historisation

## L'héritage

Une entité peut hériter d'une autre. L'enfant déclare son parent par
`inheritance:`, et c'est sa seule référence à lui (D353). L'entrepôt en
a deux : `article` et ses dérivés `fabrique`, `semi_fini`, `fantome` ;
`tiers` et ses dérivés `client`, `fournisseur`.

```yaml
# Le nom de l'entité
name: client

# Le parent
inheritance: tiers

# L'historique
history: true
```

Huit règles disent ce que l'héritage est :

- **la structure** (D143) : un héritage simple, jamais multiple ; dans un
  seul module ; sur plusieurs niveaux ;
- **le stockage** (D144) : une table unique pour le parent et ses enfants,
  portée par Syncytium ; un champ appartient à un niveau, et n'est visible
  que si l'enregistrement a atteint ce niveau ;
- **l'identité à la racine** (D1035, D1039) : la racine porte l'identité,
  les dérivés la conservent ; `client` et `fournisseur` gardent l'identité
  du `tiers` ;
- **pas de surcharge d'un champ du parent** (D152) : l'enfant ne redéfinit
  jamais un champ hérité ; il peut seulement en ajuster la visibilité ;
- **la promotion** (D145) : un enregistrement progresse dans la hiérarchie,
  de `tiers` à `client` dès sa première commande, en gardant son
  identité ; la promotion étend ses propriétés et ouvre les listes, les
  écrans, les traitements du niveau ; ses déclencheurs se déclarent ;
- **la double position** (D146) : un tiers peut être client et
  fournisseur à la fois ; le parent porte le commun, chaque branche ses
  champs ; l'état est un ensemble de positions ;
- **la création directe** (D355) : un client peut naître client, sans
  passer par prospect ;
- **le cycle chez le parent** (D353) : la machine à états d'une hiérarchie
  vit en bloc sur le parent, qui référence ses enfants ; une entité à
  hiérarchie a son statut dans ses positions, jamais dans un champ.

Tout parent s'instancie comme ses enfants : il n'y a pas de parent
abstrait (D143, D1558). Un article acheté est un `article`, sans dérivé ;
un tiers peut n'être ni client ni fournisseur.

## La suppression et la réactivation

Supprimer un enregistrement ne l'efface pas. **La suppression est une
inactivation** (D137) : l'enregistrement devient inactif, ses propriétés
restent lisibles sur demande, et les listes ne montrent que les actifs
par défaut. Supprimer un agrégat inactive l'agrégat entier, la commande
et ses lignes ensemble. Modifier un inactif est refusé. L'effacement
réel, le droit du RGPD, est une purge distincte, un acte de
l'administrateur ([rights.md](../../rights.md)).

Quatre règles en découlent :

- **le comportement à la suppression se déduit de la nullabilité** du
  champ qui référence, sans déclaration (D138) : une référence
  obligatoire interdit de supprimer sa cible ; une référence optionnelle
  l'autorise, et la référence reste, pointée vers l'inactif ; il n'y a
  jamais de référence pendante ;
- **l'unicité ne vaut que parmi les actifs** (D141) : deux inactifs
  peuvent porter la même clé, et un enregistrement supprimé peut être
  recréé avec la même identité ;
- **la réactivation est l'acte exceptionnel de l'administrateur** (D140,
  D903), sous contrôle de collision des clés avec les actifs ; elle ne se
  déclare pas et n'est offerte ni à l'utilisateur ni au manager : c'est
  un geste du module d'administration ([administration.md](../../administration.md)) ;
- **les colonnes qui portent l'inactivation** sont celles du socle, à
  étudier à l'implémentation (D1305) ; la règle, elle, ne dépend pas du
  stockage.

Dans la banque, un compte que ses écritures référencent par une
référence obligatoire ne peut pas être supprimé tant qu'elles existent ;
un lieu, référencé par une référence optionnelle, peut l'être, et les
écritures qui le citent continuent de pointer vers le lieu inactif.

## L'historisation

`history:` allume l'historisation d'une entité (D168, D1174). Une fois
allumée, chaque modification d'un enregistrement laisse une trace, et la
fiche se relit telle qu'elle était à une date. Six règles disent ce que
cette trace est et comment on s'en sert.

- **Chaud et froid, des instantanés complets** (D169) : le courant est
  chaud, l'historique est froid ; chaque entrée porte toutes les valeurs
  de l'agrégat, pas les écarts, avec l'auteur, l'horodatage, le canal et
  le motif ; elle est en lecture seule.
- **La confidentialité de l'historique** (D170) : la visibilité se
  déclare par groupe, le responsable métier oui, le client non ; les
  confidentialités des champs sont héritées de l'entité ; l'anonymisation
  s'étend à l'historique, sinon elle fuit.
- **La consultation à une date** (D172) : l'API rend le courant par
  défaut, et l'agrégat à la date quand elle est précisée ; l'IHM a un
  composant « historique », la synthèse des entrées, un clic ouvre la
  fiche à la date ; les champs calculés s'évaluent sur l'instantané, la
  fiche d'époque montre ses calculs d'époque.
- **La lecture hors couverture** (D412) : une date postérieure à la
  création rend l'état à la dernière valeur connue avant elle, la valeur
  courante si rien n'est historisé, le plus ancien instantané si la
  rétention est dépassée ; une date antérieure à la création ne rend
  rien.
- **La restauration** (D171) : l'administrateur seul, sous condition,
  tracée ; restaurer est une modification, historisée elle aussi.
- **L'insertion antidatée** (D173) : réservée à la reprise, par une
  sollicitation à une date antérieure, les contrôles de cohérence levés.

Le véhicule ne déclare pas `history:` : sa documentation écrit « pas
d'historique » (D1173). Un projet qui écrit `history: true` dans les
settings de sa version l'active pour toutes ses entités ; chaque
modification d'un véhicule laisse alors un instantané, et la fiche se
relit à une date, ses calculs compris.
