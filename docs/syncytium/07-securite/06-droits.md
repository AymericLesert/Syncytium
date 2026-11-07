# Les droits d'action

Qui fait quoi : `allow:`, ses écritures, ses étages, les opérations, le
passe-outre de l'administrateur, le passe-droit, les planchers comme vue des
droits.

Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md). Le texte vient des deux artefacts
préparatoires, déplacé à la réorganisation ; la réécriture suit.

## Le sommaire

- [Les droits d'action (D196, D421–D427)](#les-droits-daction-d196-d421d427)
- [Les droits d'action — qui fait quoi](#les-droits-daction--qui-fait-quoi)

## Les droits d'action (D196, D421–D427)

**Les droits d'action par entité s'inscrivent au modèle de
confidentialité** (D196). Deux foyers exclusifs — le nom unique
`allow` (D422–D423, « les 2 simultanément ne seront pas autorisés »,
l'erreur d'ingestion) :

```yaml
# LE CYCLE : allow par état (D422) — chaque état porte ses droits
fields:
  status:
    type: enum
    values:
      draft:    { allow: [create, read, update, delete] }
      archived: { allow: [read, delete] }

# OU LA FORME LIBRE : le bloc allow d'en-tête, verbe → expression (D90)
name: order
allow:
  update: locked = false
  delete: false
```

**Un droit d'action est une règle à trois propriétés** (D1795) : `enable`,
la règle générale ; `group`, les groupes qu'elle vise, `[all]` par
défaut ; `when`, la condition d'activation. `allow:` a trois écritures
équivalentes — la liste des actes permis, `allow: [create, update,
delete]` ; l'acte vers un booléen, `allow: { create: true, update: true,
delete: true }` ; l'acte vers sa règle, `allow: { create: { enable:
true, group: [all], when: true }, … }`. `false` vaut `{ enable: false }`,
l'expression seule vaut `{ when: … }`, la liste de groupes au verbe
(D700) vaut `{ group: [...] }`, à l'opération aussi (D1797).

L'absence = tout permis ; `read` absent = l'état masque. C'est par là
qu'un enregistrement se fige : la facture validée — son numéro
attribué par l'opération de validation, une identité acquise (D1171) —
porte `validee: { allow: [read] }`, l'acte qui promeut passant outre
(D1172). **La cascade de l'allow** (D886 — le cas 5) : le bloc libre se déclare
**à tous les étages** (D1796) — l'application dans `version.yml`, non
dans `syncytium.yml`, le module, l'entité, le champ, l'écran ou un
composant de l'écran, le template…
— et **le plus proche l'emporte** (l'esprit D359) ; le module dit la
règle de ses entités (l'entrepôt en lecture seule : `allow: {
create: false, update: false, delete: false }` sur chaque module),
l'entité la précise si elle diffère, le champ porte ses propres
droits d'action (`update: false` = le champ en lecture seule ;
`update: [commercial, achats]` = le champ ouvert à ces groupes quand
le module est en lecture seule — D941/D942). **`allow:` s'applique à
tous les canaux (D942)** : l'IHM et l'API passent par un compte,
utilisateur ou administrateur, et **le degré `administrator` passe
outre les `allow`** — la migration, opération de ce degré (D701),
écrit dans un module en lecture seule sans que les `allow` l'arrêtent,
non parce qu'elle y échappe mais parce que son degré les passe. **Les
droits d'action couvrent les opérations du socle et les opérations
déclarées** (D691) : le droit d'exécuter se déclare et se contrôle
comme les autres droits d'action. La réconciliation avec le
passe-outre (D422) : l'opération autorisée **passe outre les `allow`
d'état** (l'acte porte sa légitimité — le promote écrit ce que
l'état fige), mais **le droit de la déclencher** relève des droits
d'action — on contrôle qui appuie, pas ce que l'acte écrit.

**Le passe-droit du statut (D835)** : hors graphe = refus (D425) —
sauf le degré `administrator` : le changement d'état hors graphe,
**toujours tracé**, pour « des cas très particuliers et urgents »
(l'erreur de saisie ou de clic — débloquer sans déployer une
version) ; la voie déclarée demeure le `demote` d'une version.

## Les droits d'action — qui fait quoi

- **`allow`, un nom, deux foyers exclusifs** (D422–D423) : le cycle
  (chaque état porte ses droits — `read` absent = l'état masque) ou
  le bloc libre. **Une règle à trois propriétés** (D1795) : `enable`,
  `group` (`[all]` par défaut), `when` — trois écritures équivalentes,
  la liste des actes, l'acte vers un booléen, l'acte vers sa règle.
  **Tous les étages** (D886, D1796) : l'application dans `version.yml`,
  le module, l'entité, le champ, l'écran ou un composant de l'écran, le
  template — le plus proche l'emporte ; `update: false` au champ = la
  lecture seule.
- **Les opérations sont des droits d'action** (D691) : le droit de
  déclencher se déclare et se contrôle comme les autres ; l'opération
  autorisée passe outre les `allow` d'état (l'acte porte sa
  légitimité), le graphe des transitions est la seule voie (D425) —
  **sauf le passe-droit administrateur, toujours tracé** (D835).
- **Le degré intrinsèque** (D697, D699–D701) : chaque opération du
  socle déclare son plancher — `user` (le quotidien, quatorze
  opérations), `manager` (`import`, `report`), `administrator`
  (`restore`, `migrate`, `anonymize`, `reset_coverage` — D881, le
  plancher validé par D900). **Le groupe porte le degré** (`degree:`,
  validé D900), l'utilisateur
  atteint celui de son meilleur groupe — le plus élevé des groupes
  affectés, la composition ne transmet que la visibilité (D1794) ; un
  compte sans groupe est un `reader` (D1793) ; **le plus exigeant
  l'emporte** — un `allow:` n'abaisse jamais un plancher.
- **La tâche à portée propre** (D53) : elle s'exécute avec sa propre
  `lecture:` (l'élévation contrôlée, type SUID) ; qui déclenche peut
  lire le résultat, les lecteurs additionnels se déclarent. La tâche
  est **le chemin de contournement officiel** de la confidentialité
  (le bulletin PDF incorpore le salaire) — donc une frontière gardée.

