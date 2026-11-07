# Les groupes et les degrés

Qui est dans l'application, et avec quel degré : les groupes déclarés dans
`groups.yml`, leur composition, leur persona, leur degré, le groupe
`administrator` du socle, l'association au système d'authentification, la
délégation, le passe-droit.

Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md). Le texte vient des deux artefacts
préparatoires, déplacé à la réorganisation ; la réécriture suit.

## Le sommaire

- [Les groupes et les modules (D341, D414–D416)](#les-groupes-et-les-modules-d341-d414d416)
- [Le degré intrinsèque d'autorisation (D697, D699–D700)](#le-degré-intrinsèque-dautorisation-d697-d699d700)
- [Les groupes, les modules, la délégation](#les-groupes-les-modules-la-délégation)

## Les groupes et les modules (D341, D414–D416)

- **`groups.yml`** à la racine de la version — la hiérarchie sans
  lien parent (« un groupe est constitué d'autres groupes »),
  acyclique, la multi-appartenance naturelle (D414) ; **un membre du
  groupe contenant voit tout ce que voient les groupes qui le
  composent** (D1099) — la direction au-dessus de ses strates, jamais
  l'inverse ; **le groupe porte `description:` et, pour la
  documentation, `persona:`** (D1200) — le lecteur type du groupe : un
  prénom fictif, un rôle, une description qui, à défaut, est celle du
  groupe et, présente, la surcharge (les clés `name:` et `role:`,
  confirmées, D1790) ; ses scénarios sont les fonctionnalités de bout en bout
  que ses droits permettent (documentation.md §22) ;
- **les affectations vivent en base** — l'acte d'administration
  (D341), jamais dans le dépôt ; **l'association à un groupe du système
  d'authentification aussi** (D1788) : une interface du module
  d'authentification la saisit, par groupe, dans les propriétés que
  fournit le connecteur — le GUID pour Entra, aucune pour un connecteur
  intégré, plusieurs pour d'autres, leurs valeurs parfois énumérées ;
  enregistrées dans le module `_administration` du méta-modèle (D1789) ;
  réorganiser les droits ne redéploie pas l'application ; **une
  association par groupe nommé, une pour `administrator`, une pour le
  groupe de l'application** (D1792) — l'utilisateur qui se connecte doit
  être actif dans le système d'authentification, présent dans le groupe
  de l'application et dans l'un des groupes de l'application : désactivé,
  ou privé du droit de l'application, il n'entre pas, même présent dans
  un autre groupe ; sans aucun groupe, il est un utilisateur sans groupe,
  un `reader` (D1793) ; **le groupe de l'application est une porte
  d'entrée**, géré par le connecteur, sans rôle dans l'application ; **les
  trois conditions sont contrôlées par le connecteur d'authentification**,
  non par le socle (D1793) ;
- **le groupe `administrator` par défaut** (D712) — fourni par le
  socle, **à nom réservé** : Syncytium refuse la déclaration d'un groupe
  `administrator`, une erreur d'ingestion (D1790) ; un groupe déclaré peut
  porter le degré `administrator`, la double entrée vaut alors pour lui
  (D1791) ; **l'accès administrateur à double entrée** : le groupe
  **et** la désignation individuelle de l'utilisateur ;
- **la délégation** (D715/D749) : agir à la place d'un utilisateur —
  les droits de l'emprunté, la trace aux deux comptes ; **le même
  degré** (jamais d'élévation), **le don jamais la prise** (le
  délégant ou un administrateur), l'exception administrateur tracée ;
- **le compte technique aux groupes** (D746) : l'appartenance
  obligatoire vaut pour tous les types de comptes ;
- **le groupe absent = désactivé** (D747) : réversible, la purge
  humaine — jamais automatique ;
- **le mode safe** (D718) : le lancement dédié — le module
  administration seul, le compte administrateur principal au mot de
  passe d'installation ; tracé, jamais une porte dérobée ;
- **le module restreint** (D190/D416) : l'affectation
  utilisateur↔module ouvre une surface — elle n'étend jamais un
  droit.

## Le degré intrinsèque d'autorisation (D697, D699–D700)

**Le contrat de chaque opération déclare son degré** — le plancher
que la déclaration ne peut abaisser. **Les quatre valeurs** : `reader`
· `user` · `manager` · `administrator`. **Le degré `reader`** (D1140) :
« les documentations mises à disposition sans possibilité d'accéder au
détail » — le lecteur lit la documentation que la confidentialité de
son groupe ouvre (le décideur, le DPO, l'auditeur, l'hébergeur ; le
détail = les données) ; **une opération peut l'avoir pour plancher**
(D1680 — `degree:` admet les quatre valeurs). **Le groupe d'utilisateurs
porte le degré** (`degree:` dans groups.yml — validé D900, défaut
`user`) ; l'utilisateur atteint le degré de son meilleur groupe
(D414) ; **le compte sans groupe entre au degré `reader`** (D1793, qui
amende D699 — « l'appartenance obligatoire ») : il lit la documentation
`public`, rien du détail (D1140). **Le `reader`** (D1794) lit la
documentation que la confidentialité de ses groupes ouvre, jamais une
liste, un formulaire ou un enregistrement, et ne déclenche que les
opérations au plancher `reader` que le concepteur déclare pour lui
(D1680) ; par défaut — **un écran peut porter le degré `reader`**, pour
une consultation autorisée, décrit par le concepteur (`degree: reader`
sur la surface, en proposition). **Le degré ne se compose pas** : le
meilleur groupe est le plus élevé des groupes affectés, la composition
(D1099) ne transmet que la visibilité. Et
**`allow:` complète en précisant les groupes autorisés** (D700) :

**L'inventaire des vingt et un planchers** (D701 — validé ; la vingtième,
`reset_coverage` D881, au plancher `administrator` par D900 ; la vingt et
unième, `rgpd.extract`, au plancher `manager`, D1331, D1333, D1742) :

| le degré | les opérations |
|---|---|
| `user` | `create` · `read` · `update` · `delete` · `duplicate` · `promote` · `demote` · `generate` · `download` · `print` · `send` · `export` · `notify` · `refresh` |
| `manager` | `import` · `report` · `rgpd.extract` |
| `administrator` | `restore` · `migrate` · `rgpd.anonymize` · `reset_coverage` |

**Hors catalogue — la réactivation d'un enregistrement désactivé**
(D903) : « une opération exceptionnelle… l'action d'un
administrateur… pas une fonction exploitable par la configuration
(pas de hook) » — ni une opération du socle, ni déclarable : **une
fonctionnalité des écrans d'administration** (le module D710, le
degré `administrator`), sous la garde de l'unicité sur les actifs
(D141 — refus si un enregistrement actif porte la même clé
fonctionnelle), l'identité conservée (D142), tracée par
l'historisation (D429).

**L'exemple détaillé** — les degrés, les deux formes d'`allow` et la
composition :

```yaml
# groups.yml — le degré porté par le groupe (D699)
groups:
  sales_team: { }                          # degree: user (le défaut)
  accounting: { }
  managers:   { degree: manager, groups: [sales_team, accounting] }
  admins:     { degree: administrator }

# sales/entities/order.yml — LE CYCLE : allow par état (D422)
name: order
fields:
  status:
    type: enum
    values:
      draft:     { allow: [create, read, update, delete] }
      confirmed: { allow: [read] }
      archived:  { allow: [read] }
operations:
  archive:
    allow: [managers, admins]              # le droit de déclencher (D691/D700)
    commit: confirm
  purge_customer:
    actions: [ rgpd.anonymize ]            # la 19e (D697, D1333) — plancher administrator
    # un allow: [managers] serait sans effet : le plancher l'emporte (D700)

# sales/entities/customer.yml — LA FORME LIBRE (D423), exclusive du cycle
name: customer
allow:
  update: locked = false                   # l'expression (D90)
  delete: [admins]                         # les groupes (D700)
```

**Qui peut quoi** — la composition (le plus exigeant l'emporte) :

| l'acteur (son meilleur groupe) | `archive` une commande | `purge_customer` | `delete` un client |
|---|---|---|---|
| un membre de `sales_team` (user) | non — hors de l'`allow` | non — le plancher `administrator` | non — l'`allow` exige `admins` |
| un membre de `managers` (manager) | **oui** — dans l'`allow`, le plancher `user` de l'opération déclarée est couvert | non — le plancher `administrator` l'emporte sur tout `allow` | non — l'`allow` exige `admins` |
| un membre de `admins` (administrator) | **oui** | **oui** — le plancher atteint | **oui** — et l'expression `update: locked = false` continue de gouverner la modification |

— et dans tous les cas, un compte **sans groupe est un `reader`** (D1793,
qui amende D699) ; la vérification joue **au début**
de l'opération, servie par le cache de droits (D694).

## Les groupes, les modules, la délégation

- **La ligne de partage** (D27, D341, D414) : la configuration
  déclare les groupes (`groups.yml` — acyclique, « un groupe est
  constitué d'autres groupes », le degré) ; l'association à l'annuaire
  se saisit dans l'interface, jamais dans la configuration (D1788)
  ; **la base porte les affectations** — l'acte d'administration,
  jamais le dépôt.
- **Le groupe `administrator` d'office** (D712, D717), à nom réservé :
  la déclaration d'un groupe `administrator` est refusée (D1790) ; un
  groupe déclaré peut porter ce degré, la double entrée vaut pour lui
  (D1791) ; **l'accès
  administrateur à double entrée** : le groupe **et** la désignation
  individuelle. Le module d'administration exige le degré (D710) —
  l'affectation ne suffit pas.
- **Le groupe supprimé** (D34, D96) : note au concepteur, groupe
  ignoré — le champ qu'il restreignait se ferme ; les affectations
  sont conservées et **reprennent vie** si le groupe réapparaît (la
  clé stable) ; le groupe absent de la configuration = désactivé,
  **la purge est humaine** (D747).
- **Le module restreint** (D190, D416) : l'affectation utilisateur ↔
  module ouvre une surface, elle n'étend jamais un droit.
- **La délégation** (D76, D715, D749) : agir à la place d'un
  utilisateur — les droits de l'emprunté, **le même degré**, **le don
  jamais la prise**, **chaque trace porte les deux comptes** ;
  l'administrateur seul peut s'octroyer les droits de quiconque —
  tracé.

