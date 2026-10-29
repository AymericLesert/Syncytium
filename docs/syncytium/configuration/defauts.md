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
s'écrit donc comme un `settings.yml` qui redirait les défauts du socle.

```yaml
# L'inventaire des défauts du socle, dans la forme des settings (D1239) — les valeurs sont celles du socle

# Le projet
project:
  visibility: promotional          # la page de présentation seule (D1151)

# La version
version:
  languages: [<la langue du poste>]  # la première = la langue par défaut (D1101, D1114)

# Le module
module:
  title: "${name}"                 # le nom d'usage = le nom (D1120)
  history: false                   # l'historisation, en cascade vers l'entité (D168, D1174)
  menu: <le défaut>                # les entités agrégats, les enfants en sous-menu (D193, D351)

# L'entité
entity:
  title: "${name}"                 # (D1120)
  label: "${name}"                 # le visage texte (D1181)
  history: false                   # (D168)
  allow: <tout permis>             # absent = tout permis, en cascade jusqu'au champ (D422, D886)

# Le champ — les propriétés communes directement sous field: (D1239), puis par type
field:
  required: false                  # implicite sur l'identité (D373, D1170)
  mode: editable                   # (D364)
  label: "${name}"                 # (D1181)
  confidentiality: public          # (D25)
  searchable: none                 # sans searchable:, rien n'est cherchable (D1308)
  default: <nul>                   # (D941)
  unchanged: false                 # (D941)
  text:
    normalize: <aucune>            # (D870, D991)
  counter:
    reset: never                   # (D409–D410)
  amount:
    currency: <la devise dans la valeur>   # (D993)

# L'opération
operation:
  commit: confirm                  # la relecture avant le scellé (D596)
  cooldown: 1min                   # dynamique — operation.cooldown (D904)
  retention: 90d                   # dynamique — operation.retention (D906)
  notify:
    to: <tout le monde>            # dans la zone des notifications de l'application (D1228)

# Le groupe
group:
  degree: user                     # (D699, D900)
  persona: <généré>                # nommé par le groupe (D1200)

# Les surfaces et les composants graphiques
surface:
  default: <la première déclarée>  # sans déclaration, le défaut du socle (D186, D438)
wizard:
  breadcrumb: top                  # (D549)
component:
  size: <tout l'espace>            # (D533, D549)

# L'environnement
environment:
  storage: sqlite                  # implicite au mono-poste (D1114)
  documentation:
    output: <sur demande>          # le dépôt, l'édition, l'impression sur demande (D1167)
    notify: <à la promotion>       # la notification à la promotion d'une version (D1167)
    publish: <selon visibility>    # (D1167)

# L'application — les réglages dynamiques
application:
  sandbox:
    retention: 7d                  # dynamique (D912)
  logging:
    throttle: 1min                 # dynamique (D926)
  telemetry:
    values: pareto[80/20]          # dynamique — les valeurs et leur fréquence au dictionnaire (D1290–D1291)
```

## Le bloc `rgpd:` des settings (D1323)

Le bloc `rgpd:` est à la racine des settings. Il porte les défauts
réglementaires de tout traitement du projet :

```yaml
rgpd:
  controller: <groupe>             # qui répond des traitements
  legal: …                         # la base légale
  purpose: …                       # la finalité
  contact: …                       # le contact et le DPO, au projet (D1330)
  dpo: { name: …, email: …, phone: … }
```

Ces défauts se surchargent par les settings du module, de l'entité, puis
par le traitement, propriété par propriété : quatre niveaux (D1322,
D1324–D1325). Ils n'ont pas de défaut du socle : absent, le registre des
traitements écrit « non précisé ».

## Hors de l'inventaire

Trois choses ressemblent à des défauts et n'en sont pas :

- le seuil de complétude n'a pas de défaut : le moteur mesure et ne
  refuse pas (D1221) ;
- le statut `production` seul accepté (D1115) est une règle, non un
  défaut ;
- les profils de confidentialité (D885) ne sont pas des settings : ils
  vivent à la racine du projet, dans `syncytium.yml` (D1536).
