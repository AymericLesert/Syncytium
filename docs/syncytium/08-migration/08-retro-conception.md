# La rétro-conception

> **La rétro-conception** est le troisième usage du chapitre : un outil de
> Syncytium analyse le modèle de données d'une application existante et
> construit sa configuration. Aucune donnée ne migre
> ([glossaire](../../glossaire.md)).

Ce fichier dit ce que la rétro-conception construit, ce qu'elle laisse
au concepteur, comment elle se montre et comment elle se lance. Ses
points se dégageront à l'ouverture de la section. Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [La rétro-conception d'une application existante](#la-rétro-conception-dune-application-existante)

## La rétro-conception d'une application existante

« Dans le cas où une application écrite dans le cadre de Syncytium
remplace silencieusement une application existante, les modules, les
entités et les champs ont un mapping simple et Syncytium remplace par
construction l'ancienne application sans besoin de migration. Dans ce
cas, seul le méta-modèle sera à construire à partir de l'analyse d'une
base de données existante afin que la migration silencieuse se fasse en
toute transparence. »

Cet usage s'appelle **la rétro-conception** (D2027). C'est une forme de
rétro-ingénierie (D2028) : le modèle obtenu permet de lancer Syncytium
sans une première charge d'analyse trop lourde. Le mot
« silencieux » ne lui convient pas (D2026) : il reste à la migration que
Syncytium porte lui-même entre deux versions (D1908).

- **Entre deux versions**, la migration est silencieuse parce que
  Syncytium la porte directement : sans règle sous `exchange:`, elle se
  déduit et s'effectue sans intervention du concepteur.
- **Pour une application existante**, c'est la rétro-conception : une
  commande de `syncytium` peut analyser le modèle de données d'une base, puis
  construire un méta-modèle, déduit automatiquement de la description
  d'une instance d'un connecteur. Le fichier obtenu permet de poser
  Syncytium sur le modèle existant, puis de prendre le relais de
  l'ancienne application, « un peu comme un parasite ».

**Ce que l'outil construit** (D2026). Il va au-delà du méta-modèle :

- le méta-modèle, exploitable et opérationnel, à partir du modèle de
  données existant ;
- les fichiers de configuration pour accéder à l'application, si cela
  se déduit ;
- les écrans par défaut, construits pour l'occasion, ou ceux que
  Syncytium fournit.

Beaucoup d'éléments se construisent automatiquement. **Trois ne se
déduisent pas d'un existant** : les opérations, les règles et les
droits. Le concepteur les écrit : reporter tout ce qui fait un métier,
et ses besoins, est son travail (D2028).

Aucune donnée ne migre : le méta-modèle se pose sur le modèle de
données existant, puis Syncytium prend le relais, en douceur (D2026).

**Un scénario de démonstration** (D2029). Pour un démonstrateur, la
rétro-conception peut être puissante. Elle se montre en quatre temps :

1. une application existante est là, avec sa base de données ;
2. le méta-modèle se construit ;
3. Syncytium s'exécute, et montre son initialisation ;
4. le modèle évolue pour une exploitation — ou l'on revient à
   l'application d'origine, si cela ne convient pas.

Le retour est sans perte quand aucune modification n'a été faite. La
perte est minimale quand le modèle intègre des évolutions, ou n'intègre
pas des contrôles existants. Le retour est possible parce qu'aucune
donnée ne migre : la base reste celle de l'application d'origine. Tant
que le modèle de données n'est pas modifié, l'application d'origine
retrouve sa base telle quelle. La perte minimale a deux causes : une
évolution que l'application d'origine ne connaît pas, ou des
enregistrements entrés sans un contrôle qu'elle imposait (D2030).

**La commande** (D2030). La rétro-conception se lance par
`syncytium retro monapp.yml`. Le fichier `monapp.yml` porte :

- les éléments de connexion à la base de données à analyser ;
- les propriétés et les accès ;
- le dossier racine.

Ce fichier ne sert qu'à construire le dossier `monapp/` (D2031). Il
n'a donc pas besoin de variables d'environnement : ses valeurs
s'écrivent en clair. Une fois le dossier construit, il n'est plus
exploitable. Il est recommandé de ne pas le versionner, surtout s'il
contient des données sensibles.

Un fichier minimal illustre la proposition. Il se complétera à
l'implémentation :

```yaml
# La base à analyser
# La base de données de l'application existante : la classe de son connecteur, ses paramètres de connexion et ses
# accès, écrits en clair ; la marque * signale un paramètre confidentiel.
database:
  class: postgresql
  parameters:
    host: localhost
    database: monapp
    schema: public
    user: lecteur
    password*: <le mot de passe du compte>

# Le dossier racine
# Le dossier où la commande écrit la configuration construite.
root: monapp/
```

Ce mode fait l'objet d'une troisième section du chapitre. Ses points se
dégageront à son ouverture.
