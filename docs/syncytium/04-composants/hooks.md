# Le hook de composant

Le catalogue des composants graphiques est celui de Syncytium : les
feuilles, les conteneurs, l'acte, les graphiques, les surfaces. Quand il
manque un composant, le projet l'ajoute par du code : un hook. Ce
fichier dit ce qu'un composant ajouté livre, comment il se déclare et
s'emploie, et ce qui n'est pas un hook. Le mécanisme commun, la maison
`hooks/`, la fiche, la description par langue, les traces, est au
chapitre 1,
[la version](../01-configuration/version.md#39-hooks--le-mécanisme-des-hooks).

## Le sommaire

- [Le composant ajouté](#le-composant-ajouté)
  - [Le contrat](#le-contrat)
  - [La fiche et l'usage](#la-fiche-et-lusage)
- [Ce qui n'est pas un hook](#ce-qui-nest-pas-un-hook)

## Le composant ajouté

> **Un hook** est un prolongement par code, écrit contre le contrat de
> Syncytium. Le hook de composant ajoute un composant graphique au
> catalogue, une feuille, un conteneur, un acte, un graphique ou une
> surface ; ce composant s'emploie ensuite comme un composant du socle
> ([glossaire](../../glossaire.md)).

Un composant ajouté porte un nom unique, et le mot « hook » n'apparaît
jamais dans la configuration (D408). Il est de première classe (D65,
D68) : il partage l'interface des composants du socle, il se règle en
défaut d'un type, il se surcharge au champ. S'il échoue, le moteur se
replie sur le composant par défaut du type (D68). Il est un nœud comme
les autres dans l'arbre d'une surface (D452) : la signature commune du
nœud vaut pour lui, l'adresse, le `visible:` vivant, les propriétés
évaluées à la demande, les enfants déclarés, la pile de contexte, les
états ([la signature du nœud](README.md#la-signature-du-nœud), D566,
D567). Et « l'écriture repasse toujours par les champs et leurs règles »
(D452) : le composant ne contourne jamais le modèle.

Un hook étend aussi une famille. Le catalogue des graphiques s'arrête à
deux axes ; au-delà, un hook (D239). Le recadrage d'une image (D263) et
le tracé d'une route (D514) sont des hooks. Un composant de saisie
détaillée qu'aucun élément de base ne rend en est un (D452).

Ce que le composant ajouté livre à la documentation est dans
[l'assistance et la documentation](documentation.md#la-documentation--la-facette-des-composants-graphiques-et-des-surfaces) :
sa fiche à l'inventaire, son visage, ses modes, les types qu'il rend,
le RGAA critère par critère (D1406, D1407).

### Le contrat

Un composant est une fonction pure : de la configuration vers une
description de rendu. Le moteur réalise le HTML (D69). Le composant n'a
aucun accès au DOM, et la technologie de rendu est un choix
d'implémentation, interchangeable. Le hook livre « un objet qui se
chargera de gérer le composant et son rendu dans les différents
formats » (D566) : le Web, le PDF, le Word, l'Excel, l'email, les
destinations d'un template (D564). Le socle impose l'affichage de ses
composants (D1672) ; le composant ajouté décrit, le moteur rend.

Un hook d'interface, celui qui porte du code au navigateur, suit les
règles du chapitre 1,
[ce qu'un hook ne contourne pas](../01-configuration/version.md#ce-quun-hook-ne-contourne-pas) :
seul code tiers au navigateur, jamais `private`, l'ergonomie et jamais
la sécurité, listé par la documentation générée (D918, D645).

### La fiche et l'usage

La fiche suit la forme commune du chapitre 1 (D809) : `name`,
`description`, `code`, `properties`. L'exemple est inventé, aucun cas
n'en porte : une jauge en trois dimensions, `gauge_3d`, pour un
pourcentage. `hooks/components/gauge_3d/gauge_3d.yml` :

```yaml
# Le composant gauge_3d
# Une jauge en trois dimensions, pour un pourcentage ; rendue à l'écran, dans un PDF, un Word, un Excel, un mail.
name: gauge_3d

# La description
# La documentation du composant, en Markdown, une par langue de la version.
description:
  fr: ~{documentation.fr.md}
  en: ~{documentation.en.md}

# Le code
# L'objet qui gère le composant et son rendu dans chaque format.
code: ~{source.txt}

# Les propriétés
# Les seuils de couleur, en pourcentage ; vide, la jauge est unie.
properties:
  thresholds:
    mode: static
    type: list of integer
    value: [ ]
```

L'usage est celui d'un composant du socle. Au champ, `component:`
remplace le composant par défaut (D458, D566) :

```yaml
# Le champ emploie le composant ajouté comme un composant du socle ; s'il échoue, le repli.
fields:
  progress_ring:
    # Le type du champ.
    type: percentage

    # Le composant, celui que le hook a enregistré au catalogue.
    component: gauge_3d
```

En défaut d'un type, dans les settings, comme pour tout composant (D65,
D461) :

```yaml
# Les champs
field:

  # Le pourcentage
  # Tous les pourcentages de l'application sont rendus par la jauge ajoutée.
  percentage:
    component: gauge_3d
```

## Ce qui n'est pas un hook

Le style n'est pas un hook (D1672). Le socle impose l'affichage de ses
composants graphiques. Il propose quelques styles, des couleurs ou des
mises en forme (D752), que le concepteur combine dans un thème, la
couche de marque par-dessus le rendu par défaut (D63, D753), et que
l'utilisateur choisit à son profil. Leurs noms et ce qu'ils règlent se
fixent à l'architecture technique ; un hook d'affichage et de style se
reverra selon le choix technique (D1673). Le hook de composant demeure :
il ajoute un composant, avec son rendu (D64–D68, D566).
