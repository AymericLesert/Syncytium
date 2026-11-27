---
name: doc-coauthoring
description: >-
  Corédiger un chapitre de la documentation de Syncytium
  (docs/syncytium/<nn>-<chapitre>/) selon la méthode du projet : ouvrir le
  chapitre, l'écrire d'un trait, présenter la page des seuls vrais
  arbitrages, suivre la relecture de l'auteur fichier par fichier, puis le
  faire lire par un lecteur tiers. À utiliser dès que l'auteur ouvre, écrit,
  relit ou clôt un chapitre, dit « chapitre N », « Section N - ok »,
  « arbitrage N », « lecteur tiers », ou demande où en est un chapitre, même
  sans nommer la compétence.
---

# La corédaction d'un chapitre

*Brouillon du 27/11/2026, en proposition : rien n'est validé par l'auteur,
sauf ce qu'une décision citée porte déjà.*

Un chapitre de `docs/syncytium/` s'écrit à deux. L'auteur arbitre. Claude
propose, consigne et met en forme. Cette compétence tient l'ordre des gestes,
du premier jour du chapitre à sa clôture, dans le mode à l'essai depuis le
chapitre 9 : écrire d'abord, arbitrer sur le texte (D2128).

Elle ne remplace ni le registre ni `CLAUDE.md`. Le registre,
`docs/conception.md`, reste la seule source canonique : si la compétence et
le registre divergent, le registre a raison et la compétence se corrige. Les
règles de forme d'un chapitre sont dans `CLAUDE.md`, « L'écriture de la
documentation » ; elles ne sont pas recopiées ici.

## Les cinq temps

| # | Le temps | Qui agit | Ce qui en sort |
|---|---|---|---|
| 1 | Ouvrir | Claude | la famille constituée, la vision globale, une décision d'ouverture |
| 2 | Écrire d'un trait | Claude | le chapitre entier, ses sources vidées, une décision |
| 3 | Présenter les arbitrages | Claude | une page, `docs/arbitrages-chapitre-<n>.md` |
| 4 | La relecture de l'auteur | l'auteur | les arbitrages clos, chaque fichier accordé |
| 5 | Le lecteur tiers | un lecteur sans contexte | les défauts de lecture corrigés, le chapitre clos |

L'ordre des deux derniers temps est arbitré par l'auteur (D2131) :
« la relecture par une personne tierce est à faire après que j'ai réglé les
détails techniques et les manques fonctionnelles ». Le lecteur tiers ne lit
donc jamais un texte dont le fond bouge encore.

## Avant d'agir : savoir où en est le chapitre

Lire d'abord `docs/README.md` : la ligne du chapitre dans « L'avancement des
quinze chapitres », puis la table « Les points de la lecture en cours ».
Elles disent le temps en cours et l'état de chaque point. Reprendre là, sans
refaire un temps déjà fait, sans sauter le suivant.

## 1. Ouvrir

Le but est de donner à l'auteur une vue d'ensemble avant le texte, sans lui
poser une seule question (D2128 : aucun point n'est soumis avant le texte).

- Constituer la famille de décisions du chapitre :
  `python tools/decisions.py docs/conception.md --audit <famille>`. Relire
  la classification, faire entrer les décisions que le sujet réclame
  (D1785 ; le précédent du chapitre 9, D2129).
- Confronter au texte des sources les décisions amendées ou remplacées
  (D1521) : c'est là que naissent les vrais arbitrages du temps 3.
- Poser la vision globale (D1787) : les fichiers dans l'ordre du sujet, en
  groupes, le cœur d'abord ; à part, ce qui quitte le chapitre vers les
  autres, sans question.
- Consigner une décision d'ouverture, marquée *en proposition, mien*.
  Tenir la ligne du chapitre et la table des points de `docs/README.md` ;
  l'état s'écrit « en cours depuis le JJ/MM/AAAA ».

## 2. Écrire d'un trait

Le chapitre s'écrit entier, réorganisé et réécrit, avant toute lecture.
L'auteur arbitre mieux sur un texte que sur une liste de questions : le
chapitre 8, lu point par point, a pris seize jours (D2127).

- Relire le registre par grep avant chaque forme, chaque nom de clé, chaque
  règle. Rien ne s'écrit de tête.
- Suivre la forme de `CLAUDE.md` : la définition en tête de chaque partie,
  une introduction qui pose un contexte, le sommaire, les exemples pris
  dans un cas du dépôt et copiés tels quels, un schéma quand il aide.
- Un mot de la grammaire s'explique à sa première mention (D2088). Ce que
  l'auteur a écarté ne se nomme pas (D2083) : le chapitre dit ce qui est.
- Vider les sources de ce que le chapitre prend, puis contrôler qu'aucune
  décision ne se perd : chaque `Dnnnn` retiré d'un artefact doit être cité
  dans le chapitre ou ailleurs dans la documentation.
- Tenir le glossaire, les renvois des autres chapitres, l'arborescence de
  `docs/README.md` et le sommaire du `README.md` de la racine.
- Lancer les contrôles, tous :

  ```
  python tools/links.py docs usecases README.md
  python tools/docyaml.py docs/syncytium
  python tools/logigramme.py docs/syncytium/<nn>-<chapitre>/schemas
  ```

- Trancher d'après le registre tout ce qui peut l'être, et le marquer
  *mien* dans la décision qui consigne l'écriture. Ces choix ne se
  soumettent pas : les énumérer à l'auteur serait lui demander une
  validation qu'il n'a pas à donner.

## 3. Présenter les arbitrages

Avec le chapitre vient une page des seuls vrais arbitrages. Il y en a trois
sortes : deux décisions qui se contredisent, un manque, une lecture jamais
confirmée. Le chapitre 9 en comptait six pour deux mille lignes.

Lire `references/gabarit-arbitrage.md` avant d'écrire la page : il porte la
forme de chaque point et ce qui distingue un vrai arbitrage d'un choix de
rédaction.

Ajouter les arbitrages à la table des points, après les fichiers du
chapitre, à l'état « présenté ». Consigner, committer, pousser.

## 4. La relecture de l'auteur

L'auteur relit fichier par fichier et répond aux arbitrages, dans l'ordre
qu'il choisit. Ici, c'est lui qui tient le rythme.

- **Une décision par message de l'auteur** (D2128). Chaque remarque est
  citée mot pour mot entre « … ». Ce que Claude ajoute est marqué *ma
  lecture* ou *en proposition*.
- « Section N - ok » se note à la table des points : « clos (Dnnnn) ».
- Une remarque se reporte là où l'élément est décrit : le fichier du
  chapitre, le glossaire, le cas concerné, un autre chapitre s'il le faut.
- Un arbitrage tranché se reporte dans le texte. La page des arbitrages se
  retire quand tous ses points sont clos.
- Ne pas présenter le point suivant, ne pas rappeler un arbitrage en
  attente : il les ouvre quand il veut.
- S'il répond à côté, la question était ambiguë. Ne pas consigner sa
  réponse : reposer la question sur un exemple chiffré d'un cas du dépôt,
  avec les réponses possibles numérotées.

Ce temps est fini quand tous les arbitrages sont clos et tous les fichiers
accordés. *Ma lecture* de « réglé les détails techniques et les manques
fonctionnelles » : les deux, non les seuls arbitrages.

## 5. Le lecteur tiers

Un lecteur qui n'a ni le registre ni l'échange lit le chapitre seul et dit
ce qu'il n'a pas compris. Il vient en dernier parce que sa lecture ne vaut
que sur un fond arrêté : avant, il buterait sur des manques que l'auteur
est seul à pouvoir combler.

Lire `references/lecteur-tiers.md` : il porte la préparation, la consigne
du lecteur, le tri de son rapport.

Le principe du tri tient en trois lignes :

- un défaut de forme se corrige, *mien*, sans être soumis ;
- un défaut de sens devient une question à l'auteur, par un exemple ;
- le lecteur ne rouvre jamais ce que l'auteur a arbitré.

*En proposition* : tout ce temps, sauf sa place, que l'auteur a fixée
(D2131).

## Clore le chapitre

- La ligne du chapitre dans `docs/README.md` note chaque temps et sa date ;
  la table des points passe au chapitre suivant à son ouverture.
- Le sommaire du `README.md` de la racine note le chapitre « fait ».
- À la pause : le journal dans le registre, `python tools/plan.py`, tout
  committé et poussé.

## Ce que la compétence ne fait pas

- Elle ne décide rien à la place de l'auteur, et ne réécrit pas ses mots
  dans le registre.
- Elle ne relance pas un sujet clos ou mis en attente.
- Elle n'écrit pas deux chapitres à la fois : le levier est proposé
  (D2127), il n'est pas appliqué à l'essai (D2128).
