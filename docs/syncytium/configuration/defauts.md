# L'inventaire des défauts du socle

*La suite du [sous-chapitre 3.5](version.md) : ce que Syncytium décide
quand la configuration ne dit rien (D1175).*

Chaque défaut du socle a une propriété, une valeur, un étage, et un
mode, statique ou dynamique. Une valeur dynamique se surcharge aussi par
l'administration, à chaud (D588). Une valeur statique engage le stockage
ou la structure : elle se change par une version. L'inventaire se
complète à chaque défaut nouveau.

Sa structure est celle des settings (D1239). Le registre le dit : « la
propriété doit être dans un bloc représentant le composant, qui lui-même
doit être dans un bloc représentant le type de composant ». L'inventaire
s'écrit donc comme un `settings.yml` qui redirait les défauts du socle ;
les valeurs sont celles du socle.

```yaml
# Le projet
project:
  # Ce qui se lit sans compte : la page de présentation seule
  visibility: promotional

# La version
version:
  # Les langues : celle du poste, la première est la langue par défaut
  languages: [<la langue du poste>]

# Le module
module:
  # Le nom d'usage : le nom
  title: "${name}"

  # L'historisation, en cascade vers l'entité
  history: false

  # Le menu : les entités agrégats, les enfants en sous-menu
  menu: <le défaut>

# L'entité
entity:
  # Le nom d'usage et le visage texte : le nom
  title: "${name}"
  label: "${name}"

  # L'historisation
  history: false

  # Les droits : absent, tout est permis, en cascade jusqu'au champ
  allow: <tout permis>

# Le champ : les propriétés communes directement sous field:, puis par type
field:
  # Obligatoire : non, sauf sur l'identité, où c'est implicite
  required: false

  # Le mode : modifiable
  mode: editable

  # Le libellé : le nom
  label: "${name}"

  # La confidentialité : publique
  confidentiality: public

  # La recherche : sans searchable:, rien n'est cherchable
  searchable: none

  # La valeur par défaut : nulle ; la valeur n'est pas figée
  default: <nul>
  unchanged: false

  # Le texte : aucune normalisation
  text:
    normalize: <aucune>

  # Le compteur : jamais remis à zéro
  counter:
    reset: never

  # Le montant : la devise est dans la valeur
  amount:
    currency: <la devise dans la valeur>

# L'opération
operation:
  # Le scellé : une relecture avant
  commit: confirm

  # Le délai entre deux exécutions et la rétention des exécutions : dynamiques
  cooldown: 1min
  retention: 90d

  # La notification : tout le monde, dans la zone des notifications de l'application
  notify:
    to: <tout le monde>

# Le groupe
group:
  # Le degré : utilisateur
  degree: user

  # Le persona : généré, nommé par le groupe
  persona: <généré>

# Les surfaces et les composants graphiques
surface:
  # La surface par défaut : la première déclarée, sinon le défaut du socle
  default: <la première déclarée>
wizard:
  # Le fil d'Ariane : en haut
  breadcrumb: top
component:
  # La taille : tout l'espace
  size: <tout l'espace>

# L'environnement
environment:
  # Le storage : sqlite, implicite au mono-poste
  storage: sqlite

  # La documentation : le dépôt, l'édition et l'impression sur demande ; la notification à la promotion
  # d'une version ; la publication selon visibility
  documentation:
    output: <sur demande>
    notify: <à la promotion>
    publish: <selon visibility>

# L'application : les réglages dynamiques
application:
  # La sandbox : sa rétention
  sandbox:
    retention: 7d

  # La journalisation : le throttling des traces
  logging:
    throttle: 1min

  # La télémétrie : les valeurs et leur fréquence au dictionnaire, par la courbe de Pareto
  telemetry:
    values: pareto[80/20]
```

## Les décisions de l'inventaire

- le projet : `visibility` (D1151) ;
- la version : `languages` (D1101, D1114) ;
- le module : `title` (D1120), `history` (D168, D1174), `menu` (D193,
  D351) ;
- l'entité : `title` (D1120), `label` (D1181), `history` (D168), `allow`
  (D422, D886) ;
- le champ : `required` (D373, D1170), `mode` (D364), `label` (D1181),
  `confidentiality` (D25), `searchable` (D1308), `default` et `unchanged`
  (D941), `normalize` (D870, D991), `reset` (D409, D410), `currency`
  (D993) ;
- l'opération : `commit` (D596), `cooldown` (D904), `retention` (D906),
  `notify` (D1228) ;
- le groupe : `degree` (D699, D900), `persona` (D1200) ;
- les surfaces : `default` (D186, D438), `breadcrumb` (D549), `size`
  (D533, D549) ;
- l'environnement : `storage` (D1114), `documentation` (D1167) ;
- l'application : `sandbox.retention` (D912), `logging.throttle` (D926),
  `telemetry.values` (D1290, D1291).

Les valeurs dynamiques sont `cooldown`, `retention`, `sandbox.retention`,
`logging.throttle` et `telemetry.values` ; toutes les autres sont
statiques.

## Le bloc `rgpd:` des settings (D1323)

Le bloc `rgpd:` est à la racine des settings. Il porte les défauts
réglementaires de tout traitement du projet.

```yaml
# Le réglementaire : les défauts de tout traitement du projet
rgpd:
  # Qui répond des traitements : un groupe
  controller: direction

  # La base légale et la finalité
  legal: L'exécution du contrat
  purpose: La gestion des commandes

  # Le contact et le délégué à la protection des données, au projet
  contact: rgpd@entreprise.example
  dpo:
    name: …
    email: …
    phone: …
```

Ces défauts se surchargent par les settings du module, de l'entité, puis
par le traitement, propriété par propriété : quatre niveaux (D1322,
D1324–D1325) ; le contact et le DPO sont au projet (D1330). Ils n'ont pas
de défaut du socle : absent, le registre des traitements écrit « non
précisé ».

## Hors de l'inventaire

Trois choses ressemblent à des défauts et n'en sont pas :

- le seuil de complétude n'a pas de défaut : le moteur mesure et ne
  refuse pas (D1221) ;
- le statut `production` seul accepté (D1115) est une règle, non un
  défaut ;
- les profils de confidentialité (D885) ne sont pas des settings : ils
  vivent à la racine du projet, dans `syncytium.yml` (D1536).
