# Le gabarit de la page des arbitrages

Le modèle est `docs/arbitrages-chapitre-9.md` (D2130). La page vit à
`docs/arbitrages-chapitre-<n>.md`, hors du dossier du chapitre : elle
accompagne l'échange, elle n'est pas de la documentation.

## Ce qui est un vrai arbitrage

Un point entre dans la page s'il change ce que le chapitre écrit et si le
registre ne permet pas de trancher. Trois sortes :

- **deux décisions qui se contredisent**, sans que l'une amende l'autre ;
- **un manque** : le chapitre doit dire quelque chose que rien n'a décidé ;
- **une lecture jamais confirmée** : une proposition de Claude restée
  « en proposition », ou une question gardée ouverte par une décision.

Tout le reste n'y entre pas : une reformulation que le registre appuie, un
ordre de sections, un titre, le choix d'un exemple. Cela se tranche, se
marque *mien* dans la décision d'écriture, et ne se soumet pas.

Quand un point hésite entre les deux, se demander : deux lecteurs du
registre de bonne foi écriraient-ils deux textes différents ? Si oui, c'est
un arbitrage.

## L'en-tête de la page

Un paragraphe en italique : le chapitre accompagné, en lien ; la date de
son écriture ; le nombre de points et leurs sortes ; la phrase « La page se
retire quand ses points sont clos. » Puis `## Le sommaire`, chaque point en
lien vers son ancre.

## La forme d'un point

Le titre nomme la situation, non la règle : « Une version déposée en pleine
journée », jamais « La fenêtre de migration ». Puis cinq paragraphes, dans
cet ordre, chacun ouvert par son nom en italique.

```markdown
## 1. Une version déposée en pleine journée

*Où.* Le lien vers la section du chapitre où le texte en cause se lit.

*L'exemple.* Une situation concrète, prise dans un cas du dépôt, avec ses
valeurs : la version 1.0.0.1 déposée un mardi à dix heures.

*Ce qui s'oppose.* Les deux décisions, citées par leur numéro, et ce que
chacune fait écrire. **<u>Le passage sur lequel porte le choix.</u>**

*La question.* Une seule, posée sur l'exemple.

1. Une réponse, en une ou deux phrases.
2. Une autre.
3. Une troisième au plus.

*Ma recommandation.* La réponse retenue et sa raison, en une phrase.
```

Le troisième paragraphe change de nom selon la sorte : *Ce qui s'oppose*,
*Ce qui manque*, *Ce qui n'a pas été confirmé*.

## Les règles qui évitent une question incomprise

- La question se pose sur l'exemple, jamais par une formule abstraite.
- Un seul passage en gras souligné par point ; rien d'autre en gras.
- Pas de verbe à double sens : « lever une erreur » se lit de deux façons.
- La recommandation reste à la fin, jamais mêlée à la description.
- Dire dans la décision d'écriture ce que le texte porte en attendant : la
  recommandation, ou les deux décisions telles quelles.
