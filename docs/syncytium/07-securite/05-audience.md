# L'audience

> **L'audience** est le public d'une donnée : l'interne, les
> collaborateurs, par leurs groupes ; l'externe, les clients, par
> l'appartenance de la ligne, fermée par défaut
> ([glossaire](../../glossaire.md)).

La confidentialité dit qui voit quel champ ; l'audience dit qui voit
quelle ligne. Ce fichier dit les deux audiences, l'appartenance d'une
ligne à un compte, la lecture et l'écriture par appartenance, et ce qui
empêche de deviner une ligne qu'on ne voit pas. Aucun cas du dépôt
n'ouvre une audience externe : les règles s'énoncent sans exemple. Les
décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [Les deux audiences](#les-deux-audiences)
- [L'appartenance](#lappartenance)
- [La lecture et l'écriture](#la-lecture-et-lécriture)
- [L'anti-IDOR](#lanti-idor)

## Les deux audiences

Une donnée a deux publics possibles (D70) :

- **l'interne**, les collaborateurs de l'entreprise, que les groupes et
  les niveaux de confidentialité gouvernent ;
- **l'externe**, les clients, qui n'accèdent qu'aux lignes qui leur
  appartiennent ; cet accès est fermé par défaut.

Les deux axes sont orthogonaux : quelle ligne, quel champ (D72). Sur une
ligne visible d'un client, les champs internes de l'entreprise restent
masqués par leur confidentialité ([la confidentialité](04-confidentialite.md)).

## L'appartenance

Une ligne appartient à un compte de quatre façons (D71) :

- **directe** : un champ de l'entité référence le compte ;
- **indirecte** : un chemin à plusieurs sauts mène au compte,
  `commande.client.compte` ;
- **ouverte** : l'entité est un catalogue, visible de tous ;
- **non exposée** : le défaut ; l'entité ne s'ouvre à aucun client.

Quand plusieurs chemins mènent au compte, ils s'unissent : il suffit d'un
(D74). La ligne sans propriétaire est invisible : le non-exposé est le
défaut, la donnée se protège (D71). Le compte client suit sa fiche, et la
fiche désactivée ferme le compte ([l'entrée](03-entree.md), D77).

## La lecture et l'écriture

La lecture et l'écriture par appartenance se déclarent séparément, par
champ, sous un invariant : tout ce qui se modifie se voit, l'inverse non
(D73). L'écriture unique est un troisième régime : le champ vide s'écrit,
le champ renseigné refuse ; l'administrateur, lui, écrit en plein, et sa
trace le dit (D153).

## L'anti-IDOR

Posséder l'identifiant d'une ligne ne prouve rien. Quatre règles ferment
la devinette (D75) :

- **le filtrage est côté serveur**, jamais confié à l'interface ;
- **les identifiants ne se devinent pas** : l'identité interne est un
  UUID, jamais exposé (D82) ; la pagination avance par un curseur
  opaque (D100) ;
- **l'appartenance se recontrôle à chaque accès direct** : un
  identifiant obtenu ailleurs n'ouvre rien ;
- **l'aliasing par contexte** est une option forte, un identifiant
  différent par contexte.

L'abstraction de persistance sait filtrer au niveau de la ligne, par le
storage quand il le fait, sinon dans le moteur (D75). L'interdit ne se
devine pas non plus par la navigation, les messages ou les comptages :
c'est l'anti-oracle, le troisième principe de la doctrine
([README](README.md)).
