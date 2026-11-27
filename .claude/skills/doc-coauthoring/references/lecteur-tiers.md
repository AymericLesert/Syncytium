# Le lecteur tiers

*En proposition, sauf la place de ce temps et le sens du lecteur tiers,
arbitrés par l'auteur (D2131, D2132).*

Le lecteur tiers est la « personne tierce » dont parle l'auteur (D2132) :
un lecteur qui n'a ni le registre ni l'échange. Ici, c'est une instance de
Claude lancée sans contexte. Si l'auteur confie le chapitre à une personne,
le tri de son retour suit les mêmes règles.

## Quand

Après le temps 4, et seulement après : tous les arbitrages sont clos, tous
les fichiers accordés. Un lecteur lancé plus tôt relèverait des manques de
fond que seul l'auteur peut combler, et ses remarques se périmeraient à
chaque arbitrage.

## Préparer les questions

Écrire de cinq à dix questions qu'un lecteur poserait au chapitre, avant de
lancer le lecteur. Elles se prennent dans les cas du dépôt, l'entrepôt de
préférence, et dans les deux lecteurs de la documentation : le concepteur,
qui écrit la configuration, et le technicien, qui consomme les API (D1148).

Une bonne question a une réponse arrêtée au registre. Exemple, pour le
chapitre 9 : « Dans l'entrepôt, la version 1.0.0.1 est déposée dans
`versions/production/` un mardi à dix heures. Que fait le moteur, et que
voient les utilisateurs ? » Noter à part, pour chaque question, la réponse
attendue et la décision qui la porte.

## La consigne du lecteur

Lancer un sous-agent neuf, sans rien lui transmettre de l'échange. Il
reçoit le dossier du chapitre et le glossaire, rien d'autre. La consigne :

```text
Tu lis un chapitre de documentation pour la première fois. Tu es
<le concepteur | le technicien> : <une phrase sur ce qu'il fait>.

Lis seulement docs/syncytium/<nn>-<chapitre>/ et docs/glossaire.md.
N'ouvre ni docs/conception.md, ni les autres chapitres, ni les artefacts :
un lecteur ne les a pas. Suis un lien sortant seulement pour dire s'il
était nécessaire à la compréhension.

1. Réponds à chaque question ci-dessous avec le chapitre seul. Cite le
   fichier et la section qui te donnent la réponse. Si le chapitre ne
   répond pas, dis-le : n'invente rien.
   <les questions, sans les réponses attendues>

2. Relève, fichier par fichier, avec la section et la phrase :
   - un mot employé avant d'être expliqué ;
   - une phrase qui se lit de deux façons ;
   - deux passages qui se contredisent ;
   - une règle sans exemple ;
   - un passage que tu n'as compris qu'en lisant plus loin.

Ne propose pas de réécriture. Ne juge pas le fond : dis ce que tu as
compris et où tu as buté.
```

Le lecteur ne propose pas de réécriture, parce qu'il n'a pas le registre :
une phrase plus claire à ses yeux peut dire autre chose que ce qui est
arbitré.

## Trier le rapport

Comparer chaque réponse du lecteur à la réponse attendue, puis ranger
chaque relevé dans une des trois sortes.

| La sorte | Le signe | Ce qui se fait |
|---|---|---|
| Un défaut de forme | la réponse est au registre, le texte la dit mal ou trop tard | corriger, *mien*, sans soumettre |
| Un défaut de sens | le registre lui-même ne tranche pas, ou se lit de deux façons | une question à l'auteur, par un exemple |
| Rien | le lecteur conteste ce que l'auteur a arbitré | laisser, sans le rapporter |

Un défaut de sens trouvé ici est un arbitrage tardif : il se présente dans
la forme de `gabarit-arbitrage.md`, un point à la fois, et rouvre le temps 4
pour le seul fichier touché.

## Relire après correction

Les corrections faites, relancer les contrôles du temps 2, puis un lecteur
neuf sur les seuls fichiers corrigés : le premier connaît déjà le chapitre,
il ne bute plus. S'arrêter quand un lecteur neuf répond juste à toutes les
questions.

## Consigner

Une décision pour le passage du lecteur, marquée *mien* : le nombre de
questions, ce qui a été corrigé, fichier par fichier, et les questions de
sens ouvertes s'il y en a. Le rapport brut ne s'archive pas au dépôt. La
ligne du chapitre dans `docs/README.md` note « lu par un lecteur tiers le
JJ/MM/AAAA (Dnnnn) ».
