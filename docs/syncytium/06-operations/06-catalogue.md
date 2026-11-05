# Le catalogue des opérations du socle

*Les vingt et une opérations du socle, leur plancher, et les opérations dédiées du module d'administration ; une
fiche par opération à la réécriture (D1742).*

## Le sommaire

- [Les vingt et une opérations et leur plancher](#les-vingt-et-une-opérations-et-leur-plancher)
- [Les opérations dédiées du module d'administration](#les-opérations-dédiées-du-module-dadministration)

## Les vingt et une opérations et leur plancher

Ajoute **une opération** — une tâche et son déclencheur, matérialisée
en bouton (D148). L'infrastructure des tâches se décrit en deux
chapitres (D1689) : au chapitre 6, les opérations — les cinq
déclencheurs (D54), le dossier surveillé (D106), les droits de la
tâche (D53), l'écriture par un connecteur, une tâche (D87), le droit
de relance (D88) — ; au chapitre 9, l'administration — la file et ses
contrôles globaux (D61), la supervision, annuler, reporter,
reprioriser, le journal (D56), l'audit avec motif (D62). « Une
opération ne se construit pas dans
la configuration : elle se construit toujours à l'aide d'un hook de
code » (D570). Les vingt et une opérations du socle (D574, `migrate` D667,
`rgpd.anonymize` D697 et D1333, `reset_coverage` D881, `rgpd.extract`
D1331 et D1333 ; D1742) sont les hooks embarqués :
`create`, `read`, `update`, `delete`, `duplicate`, `promote`,
`demote`, `generate`, `download`, `print`, `send`, `export`,
`import`, `report`, `restore`, `notify`, `refresh`, `migrate`,
`reset_coverage` (la dernière valeur parcourue d'une
entité remise au départ — le `migrate` suivant relit la totalité,
rien du module n'est effacé, D1030), et la famille `rgpd` des opérations
réglementaires, `rgpd.extract` et `rgpd.anonymize` (D1333). **Chaque
opération porte un degré intrinsèque d'autorisation, déclaré à son
contrat** (D697/D699 — `reader` | `user` | `manager` |
`administrator`, le quatrième degré compris (D1140, D1680), le
plancher que la déclaration ne peut abaisser ; le groupe
d'utilisateurs porte le degré, l'appartenance à un groupe est
obligatoire ; `allow:` précise les groupes autorisés — D700, le plus
exigeant l'emporte).

## Les opérations dédiées du module d'administration

- les surfaces : **les utilisateurs** et **les groupes** en listes
  standard ;
- **`renew`** — le changement (ou le changement forcé) du mot de
  passe : le lien de réinitialisation, jamais la valeur ;
- **`ban`** — le bannissement **sans suppression** (masquer, jamais
  détruire) ; la liste des opérations reste ouverte ;
- **la réactivation d'un enregistrement désactivé** (D903) — « une
  opération exceptionnelle… l'action d'un administrateur… pas une
  fonction exploitable par la configuration (pas de hook) » : **ni
  une opération du socle, ni un hook** — une fonctionnalité des
  écrans d'administration, au degré `administrator` ; la garde de
  l'unicité sur les actifs (D141 — refus si un enregistrement actif
  porte la même clé fonctionnelle), l'identité conservée (D142),
  l'acte tracé par l'historisation (D429) ;
- **la délégation** (D715/D749) : agir **à la place** d'un
  utilisateur — les droits joués sont ceux de l'emprunté, **chaque
  trace porte les deux comptes**. Les règles (D749) : **le même
  degré** (jamais une élévation par délégation), **le don, jamais la
  prise** (le délégant ou un administrateur définissent — le
  destinataire ne se sert pas), l'usage type : l'absence prolongée ;
  **l'exception** : seul un administrateur peut s'octroyer les
  droits d'un utilisateur quelconque — la traçabilité toujours
  assurée.
