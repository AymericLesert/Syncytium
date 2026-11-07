# La confidentialité

Qui voit quelle donnée : les trois niveaux, les groupes, les profils, l'héritage
des calculés, l'historique, les fichiers, partout où la donnée sort.

Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md). Le texte vient des deux artefacts
préparatoires, déplacé à la réorganisation ; la réécriture suit.

## Le sommaire

- [La confidentialité (D25–D27, D364)](#la-confidentialité-d25d27-d364)
- [La confidentialité — qui voit quel champ](#la-confidentialité--qui-voit-quel-champ)

## La confidentialité (D25–D27, D364)

Le niveau d'exposition d'une donnée : **`public`** (partout),
**`protected`** (l'interface et les tâches), **`private`** (les
tâches seulement) — **resserrable par groupes**, déclarable à
l'entité et **au champ** (D364) ; **un profil nommé à la racine du
projet se cite par son nom**, `confidentiality: financier`, la forme
courte, et la forme longue, `{ level: , groups: [..] }`, s'écrit au
champ sans profil (D885, D1536, D1798) ; un profil ne porte jamais le
nom d'un niveau, `public`, `protected`, `private` (D1799) :

```yaml
fields:
  salary:
    type: amount
    confidentiality: protected      # le niveau (D25), resserrable (D26)
```

La confidentialité irrigue tout : les menus filtrés (D193), l'export
aux colonnes visibles (D196), les widgets hérités surchargeables
(Q53), la communication (D393) — et jusqu'aux **thèmes** (D753 : un
objet comme les autres, le choix du profil n'offre que le visible).

## La confidentialité — qui voit quel champ

- **Trois niveaux emboîtés** (D25) : `public` (l'API, l'interface,
  les tâches), `protected` (l'interface et les tâches), `private`
  (les tâches seulement) — l'ordre total API ⊂ interface ⊂ tâches,
  le défaut `public`. *(Les noms d'origine `publique`/`protegee`/
  `privee` ont pris leur forme anglaise avec le catalogue.)*
- **Le second axe : le qui** (D26–D27) — la restriction par groupe,
  les groupes déclarés dans la description et versionnés avec elle.
  **Les deux se composent** au champ (D364) ; **les profils nommés**
  (D885 — le cas 5) écrivent une fois le niveau et le qui à la racine
  du projet, dans `syncytium.yml` (D1536), et se citent par leur nom,
  `confidentiality: financier`, la forme courte ; la forme longue,
  `{ level: , groups: [..] }`, s'écrit au champ sans profil (D1798).
- **Changer un niveau = une migration de contrat** (§5.5) : passer un
  champ de `public` à `protected` est une suppression pour l'API —
  le mécanisme de dépréciation D13 s'applique, rien de nouveau.
- **L'héritage fail-closed** (D102, Q23) : un champ calculé hérite
  du niveau **le plus restrictif** de ses sources, y compris à
  travers les relations et les `sources` des hooks ; l'abaissement
  est **explicite et signalé** — jamais silencieux.
- **Le troisième axe** (D144) : la visibilité d'un champ par le
  niveau d'héritage atteint par l'enregistrement — la même
  machinerie.
- **L'historique** (D170, D413) : la visibilité déclarée par groupe
  (`visibility:`), la confidentialité des champs héritée de l'entité
  d'origine, l'anonymisation étendue aux instantanés — sinon la
  fuite.
- **Partout où la donnée sort** : les menus filtrés (D193), l'export
  aux seules colonnes visibles (D196), les widgets, la
  communication (D393), les thèmes (D753), le hook d'interface qui
  ne reçoit **jamais `private`** (§8.2) — **et les fichiers** (D923) :
  le dossier appartient au moteur et n'est jamais servi directement,
  tout accès passe par le moteur sous la confidentialité du champ et
  l'appartenance de la ligne, les noms sur disque sont opaques.

