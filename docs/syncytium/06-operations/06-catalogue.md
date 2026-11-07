# Le catalogue des opérations du socle

Syncytium embarque ses opérations comme il embarque ses types : des
hooks du socle, employés sous leur nom. Ce fichier donne le catalogue,
une fiche par opération, groupées par plancher, puis les opérations
dédiées du module d'administration.

## Le sommaire

- [Le catalogue et les planchers](#le-catalogue-et-les-planchers)
- [Le quotidien, au plancher `user`](#le-quotidien-au-plancher-user)
  - [`create`, `read`, `update`, `delete`](#create-read-update-delete)
  - [`duplicate`](#duplicate)
  - [`promote` et `demote`](#promote-et-demote)
  - [`generate`](#generate)
  - [`download` et `print`](#download-et-print)
  - [`send`](#send)
  - [`export`](#export)
  - [`notify`](#notify)
  - [`refresh`](#refresh)
- [Le responsable métier, au plancher `manager`](#le-responsable-métier-au-plancher-manager)
  - [`import`](#import)
  - [`report`](#report)
  - [`rgpd.extract`](#rgpdextract)
- [L'administrateur, au plancher `administrator`](#ladministrateur-au-plancher-administrator)
  - [`restore`](#restore)
  - [`migrate`](#migrate)
  - [`reset_coverage`](#reset_coverage)
  - [`rgpd.anonymize`](#rgpdanonymize)
- [Les opérations dédiées du module d'administration](#les-opérations-dédiées-du-module-dadministration)
  - [`renew`](#renew)
  - [`ban`](#ban)
  - [`rotate`](#rotate)
  - [La délégation](#la-délégation)

## Le catalogue et les planchers

> **Une opération** du socle est un hook embarqué par Syncytium : elle
> s'emploie comme une opération du projet, sous son nom, avec son
> plancher ([glossaire](../../glossaire.md)).

Le socle embarque vingt et une opérations (D570, D574, D667, D697, D881,
D1331, D1333, D1742) : dix-neuf verbes nus et la famille `rgpd` des
opérations réglementaires. Chacune porte un degré intrinsèque
d'autorisation, déclaré à son contrat, le plancher que la déclaration ne
peut abaisser (D697, D699) ; `allow:` ajoute des groupes, et le plus
exigeant l'emporte (D700). Les quatre degrés sont `reader`, `user`,
`manager`, `administrator` (D1140, D1680). Le degré des groupes,
le compte sans groupe, un `reader` (D1793), et l'inventaire par plancher sont au
chapitre 7, [les droits](../../rights.md) (D1749).

Chaque fiche donne le rôle, le plancher, la portée, les paramètres,
l'issue et les décisions ; ce qui attend l'implémentation est dit tel
quel.

## Le quotidien, au plancher `user`

### `create`, `read`, `update`, `delete`

Les quatre gestes de base d'un enregistrement (D570). Ils sont servis
par les surfaces, le bouton de création, le double-clic, la suppression
confirmée (D445), et par l'API. Leur droit se déclare par état, `allow:`
sur la valeur du statut (D422). Portée : l'enregistrement, ou la
sélection pour `delete`.

### `duplicate`

La duplication d'un enregistrement (D574). Portée : l'enregistrement.
La banque n'emploie pas le verbe du socle : son `dupliquer` est un hook
du projet, la duplication d'une écriture entre deux dates (D776).

### `promote` et `demote`

Le passage d'un enregistrement à l'état suivant, ou précédent, de son
graphe (D425, D426). Le changement d'état est une opération du
catalogue, l'opération par défaut qu'un passage invoque sans autre
précision (D433). Le graphe, le triptyque du `when` et le cliquet sont
au chapitre 2, [les champs](../02-modele/03-champs.md) (D1755). Portée :
l'enregistrement.

### `generate`

La génération d'un document depuis un gabarit, vers le PDF, le Word,
l'Excel ou le mail (D564). L'issue est le document ; l'événement
`generated` est émis à toute génération, et une opération peut s'y
déclencher (D796) : `creer_releve` de la banque. Portée :
l'enregistrement, la liste, la sélection.

### `download` et `print`

Le téléchargement et l'impression sont deux issues d'une opération
(D570), et deux verbes du socle : télécharger un fichier, imprimer une
liste ou un document en PDF (D187). Portée : l'enregistrement, la
liste, la sélection.

### `send`

L'envoi d'un message par le connecteur `smtp` : le corps, un gabarit
rendu en HTML, les pièces jointes (D562, D564, D628). Portée :
l'enregistrement, la sélection. Connecteur attendu : `smtp`, trouvé par
son nom (D1710).

### `export`

L'export d'une liste vers un format, `csv`, `excel[<modèle>]`,
`word[<modèle>]`, `pdf` (D445, D530, D1602), écrit par un storage de
format (D636). Portée : la liste, la sélection. L'écran le déclare par
`exports:` (chapitre 4).

### `notify`

« Générer une information de notification aux utilisateurs » (D574).
Les canaux sont des connecteurs ; la notification est persistée puis
remise, localisée (D108, D109, D110, D218). Sans destinataire, elle
remonte à tous ceux qui voient l'entité, dans la zone des notifications ;
le relais par mail est le choix de chacun (D1228, D836). C'est aussi un
effet (D1745).

### `refresh`

« Déclencher un recalcul d'un graphique ou d'un champ calculé » (D574).
Portée : l'enregistrement, la liste, l'application.

## Le responsable métier, au plancher `manager`

### `import`

L'import d'exploitation : un fichier CSV déposé dans l'écran dédié du
module, un fichier par entité, le dry-run puis l'import, qui n'est
possible que si toutes les valeurs sont acceptées, sinon le rapport
exact (D211, D234, D238). La provenance est l'opérateur (D238). Portée :
le module.

### `report`

Le rapport des non-conformités : la liste de ce qui ne respecte plus
une règle de lien, le filtre qui a changé, la donnée qui a dérivé ; à la
demande, à la migration ou en continu, adressé à qui de droit ; il
couvre aussi les modifications faites à la base sans Syncytium (D395,
D406, D574). Portée : le module, l'application.

### `rgpd.extract`

`rgpd.extract(identity)` : l'extraction des traitements et des
informations qui concernent une personne, cherchée sur les champs
`rgpd: identity` ; une édition à cartouche, journalisée (D1149, D1331,
D1333). Portée : l'application.

## L'administrateur, au plancher `administrator`

### `restore`

Le retour d'un enregistrement à un instantané de son historique, sous
condition, tracé ; la restauration est elle-même une modification,
historisée (D171). La restauration d'une instance entière est une
procédure du guide d'exploitation, par renommage, le geste inverse de la
bascule (D678, D1450).

### `migrate`

L'exécution d'une migration déclarée (D667). Elle se déclenche comme
toute opération, le bouton, `when:`, `every:`, l'API ; la relance est
la ré-exécution, le rejeu par la clé fonctionnelle (D654) ; le dry-run
absolu est le preview suspendu avant le commit (D594). Un seul passage
à la fois par migration ; l'administrateur peut interrompre, sauf
pendant la bascule (D1077). Le chapitre 8, la reprise, détaille.

### `reset_coverage`

`reset_coverage(module, entité)` efface l'état de couverture d'une
entité, la dernière valeur parcourue et les empreintes : le `migrate`
suivant relit la totalité, rien n'est effacé (D881, D1030). Planifiable
par `every:` : le delta en semaine, la relecture complète le dimanche.
Elle attend le passage en cours ou l'interrompt, selon une option
(D1079).

### `rgpd.anonymize`

L'anonymisation par algorithme : la valeur construite à règle
aléatoire, jamais dérivée de l'origine, les enregistrements et les
historiques modifiés (D696, D697, D1333) : la fiche et son historique
s'anonymisent ensemble. La rétention d'une donnée personnelle est la
durée d'une fiche sans mouvement ni mise à jour, au-delà de laquelle les
informations personnelles ne sont pas à conserver (D1812) ; la règle de
l'opération l'écrit. L'entrepôt l'appelle en action, avec son expression
en paramètre, `rgpd.anonymize(owner.actif = false and …)`.

## Les opérations dédiées du module d'administration

Le module d'administration, interne, au degré `administrator` (D710), a
ses opérations propres, hors catalogue, que le concepteur n'appelle pas ;
la liste reste ouverte (D714, D1757). Chacune a sa fiche.

### `renew`

Le changement, ou le changement forcé, du mot de passe d'un utilisateur
(D714). L'opération envoie un lien de réinitialisation, jamais la
valeur. Plancher : `administrator` ; l'utilisateur peut renouveler le
sien. Portée : le compte, la liste des utilisateurs du module.

### `ban`

Le bannissement d'un utilisateur sans suppression : masquer, jamais
détruire (D714). Le compte ne peut plus entrer ; ses traces demeurent.
Plancher : `administrator`. Portée : le compte, la liste des
utilisateurs.

### `rotate`

La rotation des clés qui chiffrent les secrets d'un environnement
(D730, D915). La duplication d'une sandbox la déclenche d'office, la
sandbox ayant sa propre clé, dérivée de l'environnement et de la
machine ; le re-chiffrement des valeurs copiées à l'initialisation reste
à préciser à l'implémentation. Plancher : `administrator`. Portée :
l'environnement. La rotation des secrets est aussi une procédure du
guide d'exploitation (D1450).

### La délégation

Agir à la place d'un utilisateur (D715, D749). Les droits joués sont
ceux de l'emprunté ; chaque trace porte les deux comptes. Les règles :
le même degré, jamais une élévation par la délégation ; le don, jamais
la prise, le délégant ou un administrateur définissent, le destinataire
ne se sert pas ; l'usage type est l'absence prolongée ; seul un
administrateur peut s'octroyer les droits d'un utilisateur quelconque,
la traçabilité toujours assurée. Plancher : `administrator` pour
l'octroi, l'utilisateur pour le don. Portée : le compte. Le verbe reste
à nommer à l'implémentation.

La réactivation d'un enregistrement désactivé n'est ni une opération du
socle ni un hook (D903) : une fonctionnalité des écrans
d'administration, sous la garde de l'unicité sur les actifs (D141),
l'identité conservée (D142), tracée par l'historisation (D429).
