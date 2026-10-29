# L'inventaire des défauts du socle

*La suite du [sous-chapitre 3.5](version.md), `settings.yml` : la propriété, sa valeur, son étage, statique ou dynamique (D1175).*

**L'inventaire des défauts du socle** (D1175 ; *à compléter à chaque
défaut nouveau*). **Sa structure est
celle des settings** (D1239 — « la propriété doit être dans un bloc
représentant le composant, qui lui-même doit être dans un bloc
représentant le type de composant ») : **le type de composant → le
composant → la propriété**. L'inventaire s'écrit donc comme un
`settings.yml` qui redirait les défauts du socle ; une valeur
*dynamique* (D588) se surcharge aussi par l'administration à chaud, les
autres sont statiques — elles engagent le stockage ou la structure et
se changent par une version :

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

**Le bloc `rgpd:` des settings** (D1323) : à la racine des settings —
`rgpd: { controller: <groupe>,
legal: …, purpose: …, contact: …, dpo: { name, email, phone } }`
(le contact et le DPO au projet, D1330) — les défauts réglementaires de tout
traitement du projet, surchargés par les settings du module, de
l'entité, puis par le traitement, propriété par propriété (D1322,
D1324–D1325 — quatre niveaux) ; sans
défaut du socle — absent, le registre écrit « non précisé ».

*Hors de l'inventaire* : le seuil de complétude n'a pas de défaut, le
moteur mesure et ne refuse pas (D1221) ; le statut `production` seul
accepté (D1115) est une règle, non un défaut ; les profils de
confidentialité (D885) ne sont pas des settings : ils vivent à la
racine du projet, dans `syncytium.yml` (D1536).
