---
name: doc-coauthoring
description: >-
  Corédiger un chapitre de la documentation de Syncytium
  (docs/syncytium/<nn>-<chapitre>/) selon la méthode du projet : ouvrir le
  chapitre, l'écrire d'un trait, présenter la page des seuls vrais
  arbitrages, suivre la relecture de l'auteur et ses compléments, réécrire
  le chapitre, le lui remettre pour validation, puis le faire lire par un
  lecteur tiers. À utiliser dès que l'auteur ouvre, écrit, relit, complète,
  valide ou clôt un chapitre, dit « chapitre N », « Section N - ok »,
  « arbitrage N », « réécris le chapitre », « lecteur tiers », ou demande où
  en est un chapitre, même sans nommer la compétence.
---

# La corédaction d'un chapitre

*Écrite le 27/11/2026 (D2131), en proposition : rien n'est validé par
l'auteur, sauf ce qu'une décision citée porte déjà.*

Un chapitre de `docs/syncytium/` s'écrit à deux. L'auteur arbitre. Claude
propose, consigne et met en forme. Cette compétence tient l'ordre des gestes,
du premier jour du chapitre à sa clôture, dans le mode à l'essai depuis le
chapitre 9 : écrire d'abord, arbitrer sur le texte (D2128).

Elle ne remplace ni le registre ni `CLAUDE.md`. Le registre,
`docs/conception.md`, reste la seule source canonique : si la compétence et
le registre divergent, le registre a raison et la compétence se corrige. Les
règles de forme d'un chapitre sont dans `CLAUDE.md`, « L'écriture de la
documentation » ; elles ne sont pas recopiées ici.

## Les sept temps

| # | Le temps | Qui agit | Ce qui en sort |
|---|---|---|---|
| 1 | Ouvrir | Claude | la famille constituée, la vision globale, une décision d'ouverture |
| 2 | Écrire d'un trait | Claude | le chapitre entier, ses sources vidées, une décision |
| 3 | Présenter les arbitrages | Claude | une page, `docs/arbitrages-chapitre-<n>.md` |
| 4 | La relecture de l'auteur | l'auteur | ses commentaires, ses compléments, les arbitrages tranchés |
| 5 | La réécriture du chapitre | Claude | le chapitre réécrit, ce qui a changé fichier par fichier |
| 6 | La validation de l'auteur | l'auteur | chaque fichier relu et validé |
| 7 | Le lecteur tiers | un lecteur sans contexte | les défauts de lecture corrigés, le chapitre clos |

Les temps 4 à 7 sont arbitrés par l'auteur (D2133) : « 4. Ma relecture et
mes commentaires/compléments » ; « 5. La réécriture du chapitre » ; « 6. Une
nouvelle relecture de ma part pour une validation » ; « 7. Le lecteur
tiers ». Le lecteur tiers ne lit donc jamais un texte dont le fond bouge
encore : il vient « après que j'ai réglé les détails techniques et les
manques fonctionnelles » (D2131).

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

La table des points a quatre colonnes : le numéro, le point, l'état, la
lecture (D2150). La lecture ne vaut que pour un fichier ; un arbitrage y
porte « — ». Elle suit les temps, et le tableau de bord la montre :

| La lecture | Quand |
|---|---|
| « à lire » | le fichier est écrit, l'auteur ne l'a pas ouvert |
| « en relecture depuis le … » | l'auteur y fait ses remarques, temps 4 |
| « relu le … » | ses remarques sont reportées ; le fichier attend sa réécriture |
| « réécrit le … » | le fichier est réécrit, temps 5 ; il attend la validation |
| « validé le … » | l'auteur l'a validé ; l'état passe à « clos (Dnnnn) » |

## 4. La relecture de l'auteur

L'auteur relit fichier par fichier, dans l'ordre qu'il choisit. Il commente
ce qui est écrit, il complète ce qui manque, il répond aux arbitrages. Ici,
c'est lui qui tient le rythme.

- **Une décision par message de l'auteur** (D2128). Chaque remarque est
  citée mot pour mot entre « … ». Ce que Claude ajoute est marqué *ma
  lecture* ou *en proposition*.
- Un commentaire corrige ce qui est écrit. Un complément apporte ce que le
  chapitre ne disait pas. Les deux se consignent de la même façon.
- « Section N - ok » dit qu'un fichier n'appelle pas de remarque. Il se
  note à la table des points.
- *Mien* : une remarque se reporte tout de suite là où l'élément est
  décrit, pour que le registre et le texte ne divergent jamais. Ce report
  est une retouche. La mise en forme d'ensemble attend le temps 5.
- Ne pas présenter le point suivant, ne pas rappeler un arbitrage en
  attente : il les ouvre quand il veut.
- S'il répond à côté, la question était ambiguë. Ne pas consigner sa
  réponse : reposer la question sur un exemple chiffré d'un cas du dépôt,
  avec les réponses possibles numérotées.

Ce temps est fini quand l'auteur le dit.

## 5. La réécriture du chapitre

Les commentaires et les compléments reçus, le chapitre se réécrit. Un
complément ajouté phrase par phrase laisse des coutures : un paragraphe
posé là où la remarque est tombée, une notion expliquée deux fois, un
exemple qui ne suit plus. La réécriture fond le tout dans le fil du texte.

- Réécrire en entier chaque fichier qu'une remarque a touché, dans la
  forme du temps 2. Un fichier sans remarque ne bouge pas.
- Reporter les arbitrages tranchés dans le texte. La page des arbitrages
  se retire quand tous ses points sont clos.
- Reprendre ce qui en dépend : le glossaire, les sommaires, les renvois
  des autres chapitres, les cas.
- N'ajouter aucun fond qui ne vienne d'une remarque ou du registre. Un
  doute sur le sens d'une remarque se pose en question, par un exemple,
  avant de remettre le chapitre.
- Contrôler qu'aucune décision citée ne se perd, puis relancer les
  contrôles du temps 2.
- Consigner une décision, marquée *mien* : pour chaque fichier réécrit, ce
  qui a changé et la remarque qui l'a demandé. C'est ce que l'auteur lira
  au temps 6.

*En proposition, miens* : le détail de ce temps. L'auteur a fixé qu'il
existe et sa place (D2133).

## 6. La validation de l'auteur

L'auteur relit le chapitre réécrit, pour le valider.

- Lui remettre la liste des fichiers réécrits et, pour chacun, ce qui a
  changé. Rien de plus : pas de liste de points « à regarder ».
- « Section N - ok » vaut validation du fichier. La table des points le
  note : « clos (Dnnnn) ».
- Une nouvelle remarque se consigne comme au temps 4, et renvoie le seul
  fichier touché au temps 5.

Ce temps est fini quand tous les fichiers sont validés.

## 7. Le lecteur tiers

Un lecteur qui n'a ni le registre ni l'échange lit le chapitre seul et dit
ce qu'il n'a pas compris. Il vient en dernier, sur un chapitre que l'auteur
a validé, parce que sa lecture ne vaut que sur un fond arrêté : avant, il
buterait sur des manques que l'auteur est seul à pouvoir combler.

Lire `references/lecteur-tiers.md` : il porte la préparation, la consigne
du lecteur, le tri de son rapport.

Le principe du tri tient en trois lignes :

- un défaut de forme se corrige, *mien*, sans être soumis ;
- un défaut de sens devient une question à l'auteur, par un exemple ;
- le lecteur ne rouvre jamais ce que l'auteur a arbitré.

*En proposition* : tout ce temps, sauf sa place et le sens du lecteur
tiers, que l'auteur a fixés (D2131, D2132, D2133).

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
