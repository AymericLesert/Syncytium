# Les groupes et les degrés

> **Un groupe d'utilisateurs** est un ensemble nommé de personnes, la
> brique des droits : la confidentialité, la visibilité d'un historique,
> les destinataires d'un rapport. Un groupe peut en contenir d'autres. Il
> porte un degré d'autorisation ([glossaire](../../glossaire.md)).

Syncytium ne connaît pas les personnes dans sa configuration : il connaît
des groupes. Le concepteur déclare les groupes de l'application, leur
composition, leur degré ; l'administrateur y affecte les personnes, dans
l'application, jamais dans le dépôt. Ce fichier dit comment un groupe se
déclare, ce qu'est le degré d'autorisation, comment un utilisateur entre
par ses groupes, et ce que sont le module restreint, la délégation et le
passe-droit. Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [La déclaration des groupes](#la-déclaration-des-groupes)
  - [La composition](#la-composition)
  - [Le persona](#le-persona)
- [Le degré d'autorisation](#le-degré-dautorisation)
  - [Le reader](#le-reader)
  - [Le groupe administrator](#le-groupe-administrator)
  - [Les planchers, la vue par degré](#les-planchers-la-vue-par-degré)
- [L'entrée par les groupes](#lentrée-par-les-groupes)
- [Les modules, la délégation, le passe-droit](#les-modules-la-délégation-le-passe-droit)

## La déclaration des groupes

Les groupes se déclarent dans `groups.yml`, à la racine de la version,
transverses aux modules (D414). Un groupe est une clé : son nom, que la
confidentialité des champs et les droits citent. Il porte cinq
propriétés, toutes facultatives :

- `label:`, son nom d'usage, par langue ;
- `description:`, ce qu'il est, par langue ; la documentation la reprend ;
- `groups:`, les groupes qu'il contient, sa composition ;
- `degree:`, son degré d'autorisation, `user` par défaut (D699, D900) ;
- `persona:`, le lecteur type de la documentation (D1200).

L'entrepôt déclare sept groupes, les strates de l'entreprise. Les trois
derniers montrent la composition, le degré `administrator` et le degré
`reader` :

```yaml
# Le groupe de la direction
direction:
  label: Direction
  description: Les dirigeants — tout l'entrepôt, les prix de revient et les marges.

  # Les groupes qui composent la direction
  # Un membre de la direction voit tout ce que voient les groupes qui la composent.
  groups: [bureau_etudes, logistique, commercial, achats]

# Le groupe de l'administration
administration:
  label: Administration
  description: Le pilotage de l'entrepôt — les migrations, leurs indicateurs, leurs anomalies.

  # Le degré d'autorisation
  # Le seul groupe au degré administrator : il lance les migrations et réinitialise leur couverture.
  degree: administrator

# Le groupe de l'audit
audit:
  label: Audit
  description: Le délégué à la protection des données et l'auditeur — la documentation, sans le détail des données.

  # Le degré d'autorisation
  # Le degré reader : la documentation que la confidentialité du groupe ouvre, aucune liste, aucun formulaire.
  degree: reader

  # Le persona
  # Le lecteur type du groupe : un prénom, un rôle, ce qu'elle vient lire ; sa description surcharge celle du groupe.
  persona:
    name: Inès
    role: Déléguée à la protection des données
    description: Elle lit le registre des traitements, les mentions et la journalisation des accès de l'entrepôt.
```

Deux choses ne s'écrivent jamais dans la configuration :

- **les affectations** des personnes aux groupes vivent en base ; les
  affecter est un acte d'administration (D27, D341) ;
- **l'association** d'un groupe à un groupe du système
  d'authentification se saisit dans une interface du module
  d'administration (D1788, D1789) ; elle est décrite plus bas, avec
  l'entrée.

Un groupe vit avec les versions. Retiré de la configuration, il est
désactivé, jamais détruit : ses affectations sont conservées et
reprennent vie s'il réapparaît sous la même clé ; sa purge est un acte
humain (D96, D747). Un groupe supprimé qu'un champ cite encore ferme ce
champ, et le concepteur en est averti : la donnée se protège (D34).

### La composition

Un groupe est constitué d'autres groupes, sans lien parent : le contenant
déclare ses constituants dans `groups:` (D414). La règle de visibilité va
dans un seul sens (D1099) :

- un membre du groupe contenant voit tout ce que voient les groupes qui
  le composent ;
- un membre d'un constituant ne voit rien de plus par le contenant.

Dans l'entrepôt, la direction compose le bureau d'études, la logistique,
le commercial et les achats : un dirigeant voit ce que voit chaque
strate, aucune strate ne voit ce que voit la direction. La composition
est sans cycle, vérifié à l'ingestion (D414). Elle ne transmet que la
visibilité, jamais le degré (D1794).

### Le persona

Le persona est le lecteur type d'un groupe, pour la documentation : un
prénom fictif, `name:`, un rôle, `role:`, et une description qui, à
défaut, est celle du groupe et, présente, la surcharge (D1200, D1790).
Ses scénarios sont les fonctionnalités de bout en bout que ses droits
permettent. Un groupe sans `persona:` a un persona généré, nommé par le
groupe, que la complétude compte (D1200). Une application sans
authentification déclare un groupe pour porter son persona (D1208). La
banque, en trois langues :

```yaml
  # Le persona
  # Le lecteur type du groupe : un prénom, un rôle, ce qu'elle vient faire ; sa description surcharge celle du groupe.
  persona:
    name: Léa
    role:
      fr: Gestionnaire des comptes du foyer
      en: Household accounts manager
      es: Gestora de las cuentas del hogar
    description:
      fr: Elle tient les comptes du foyer — la saisie des écritures, le pointage du relevé, les virements, les budgets.
      en: She keeps the household accounts — entering transactions, reconciling the statement, transfers, budgets.
      es: >-
        Lleva las cuentas del hogar — el registro de apuntes, el punteo del extracto, las transferencias, los
        presupuestos.
```

## Le degré d'autorisation

> **Le degré d'autorisation** est le niveau d'autorisation d'un groupe,
> et le plancher d'une opération : `reader`, `user`, `manager`,
> `administrator`. Le groupe le porte, l'utilisateur atteint le plus
> élevé des groupes qui lui sont affectés
> ([glossaire](../../glossaire.md)).

Quatre degrés, du plus restreint au plus large (D699, D1140, D1680) :

- `reader` lit la documentation, sans le détail des données ;
- `user` travaille au quotidien : créer, lire, modifier, supprimer,
  promouvoir, générer, exporter… ;
- `manager` est le responsable métier : importer, rapporter, extraire ;
- `administrator` administre : restaurer, migrer, anonymiser, et passer
  outre.

Le groupe porte son degré dans `degree:`, `user` par défaut (D900).
L'utilisateur atteint le degré le plus élevé des groupes qui lui sont
affectés ; la composition ne transmet pas le degré (D1794). Un compte
sans aucun groupe est un `reader` (D1793), quel que soit son type, le
compte technique compris (D746).

### Le reader

Le `reader` est né pour la documentation : « les documentations mises à
disposition sans possibilité d'accéder au détail » (D1140). Ce qu'il
voit et fait (D1794) :

- il lit la documentation que la confidentialité de ses groupes ouvre ;
  sans groupe, la seule documentation `public` ;
- il n'ouvre jamais une liste, un formulaire ou un enregistrement ;
- il ne déclenche que les opérations au plancher `reader` que le
  concepteur déclare pour lui (D1680) ;
- un écran peut porter le degré `reader`, pour une consultation
  autorisée ; c'est au concepteur de le décrire, `degree: reader` sur la
  surface, une clé en proposition
  ([les surfaces](../04-composants/06-surfaces.md)).

Le délégué à la protection des données, l'auditeur, le décideur,
l'hébergeur en sont les figures : l'entrepôt déclare son groupe `audit`
à ce degré, avec son persona.

### Le groupe administrator

Le socle fournit d'office un groupe `administrator` (D712). Son nom est
réservé : Syncytium refuse la déclaration d'un groupe `administrator`,
une erreur d'ingestion (D1790). Un groupe déclaré peut porter le degré
`administrator`, l'`administration` de l'entrepôt par exemple (D1791).
L'accès administrateur est à double entrée, pour tout groupe de ce
degré : l'appartenance au groupe **et** la désignation individuelle de
l'utilisateur (D712, D1791). Le module d'administration exige le degré,
l'affectation au module ne suffit pas (D710). L'administrateur passe
outre les droits d'action, toujours tracé (D942) ; la règle est dans
[les droits d'action](06-droits.md).

### Les planchers, la vue par degré

Chaque opération du socle déclare à son contrat un degré intrinsèque, le
plancher que la déclaration ne peut abaisser ; `allow:` ajoute des
groupes, et le plus exigeant l'emporte (D697, D699, D700). Le chapitre 6
dit la règle et donne une fiche par opération
([le catalogue](../06-operations/06-catalogue.md), D1749). Vue par degré,
les vingt et une opérations du socle (D701, D881, D900, D1331, D1333,
D1742) :

| le degré | les opérations |
|---|---|
| `user` | `create` · `read` · `update` · `delete` · `duplicate` · `promote` · `demote` · `generate` · `download` · `print` · `send` · `export` · `notify` · `refresh` |
| `manager` | `import` · `report` · `rgpd.extract` |
| `administrator` | `restore` · `migrate` · `rgpd.anonymize` · `reset_coverage` |

Aucune opération du socle n'a `reader` pour plancher ; une opération
déclarée peut l'avoir (D1680). Hors catalogue, la réactivation d'un
enregistrement désactivé est un acte de l'administrateur dans les
écrans d'administration, sous la garde de l'unicité des actifs, tracé
(D903, D141, D142, D429).

## L'entrée par les groupes

> **Le groupe de l'application** est le groupe du système
> d'authentification qui donne le droit d'entrer dans l'application. Il
> est une porte d'entrée, sans rôle dans l'application
> ([glossaire](../../glossaire.md)).

Les groupes de la configuration sont ceux de l'application. Le système
d'authentification a les siens : les groupes Entra d'une entreprise, par
exemple. L'association entre les deux ne s'écrit pas dans la
configuration : les administrateurs revoient et réorganisent les droits
d'accès sans déployer une nouvelle version (D1788). Elle se saisit dans
une interface du module d'administration, et ses valeurs s'enregistrent
dans le module `_administration` du méta-modèle (D1789). Ce qui se
saisit, par groupe, ce sont les propriétés que fournit la classe du
connecteur d'authentification (D1788) :

- pour Entra, le GUID du groupe ;
- pour un connecteur intégré, `local` ou `none`, aucune ;
- pour d'autres, plusieurs propriétés, à valeurs parfois énumérées.

Il faut une association pour chaque groupe nommé de l'application, une
pour `administrator` et une pour le groupe de l'application (D1792). Un
utilisateur qui se connecte doit remplir trois conditions :

- être actif dans le système d'authentification : désactivé, il
  n'entre pas ;
- être présent dans le groupe de l'application : privé de ce droit, il
  n'entre pas, même présent dans un autre groupe ;
- être présent dans l'un des groupes de l'application : sans aucun, il
  entre comme utilisateur sans groupe, un `reader`.

Ces trois conditions sont contrôlées par le connecteur
d'authentification, non par le socle, qui reçoit une identité vérifiée
et ses groupes (D1793). Un retrait dans l'annuaire prend effet à la
connexion suivante (D30). L'entrepôt se connecte par Microsoft 365 : dans
Entra, un groupe par groupe de l'entrepôt, un pour `administrator`, un
pour l'entrepôt lui-même, associés par leur GUID. Avec `local`, le
statut du compte et les affectations en base tiennent ces rôles ; avec
`none`, l'utilisateur par défaut appartient à tous les groupes déclarés,
au degré `administrator` (D759).

## Les modules, la délégation, le passe-droit

Trois mécanismes complètent les groupes :

- **le module restreint** (D190, D416) : l'affectation d'un utilisateur
  à un module ouvre une surface, elle n'étend jamais un droit ;
- **la délégation** (D76, D715, D749) : agir à la place d'un
  utilisateur, avec les droits de l'emprunté, au même degré, jamais
  plus ; le don, jamais la prise, le délégant ou un administrateur
  donne ; chaque trace porte les deux comptes ; l'administrateur seul
  peut s'octroyer les droits de quiconque, tracé ; sa fiche est au
  chapitre 6 ([le catalogue](../06-operations/06-catalogue.md), D1757) ;
- **le passe-droit du statut** (D835) : le changement d'état hors du
  graphe, réservé au degré `administrator`, toujours tracé, pour les
  cas urgents ; la règle est dans [les droits d'action](06-droits.md).

Le mode safe, le lancement de l'application avec le seul module
d'administration quand tout le reste manque (D718), est au chapitre 9,
le moteur.
