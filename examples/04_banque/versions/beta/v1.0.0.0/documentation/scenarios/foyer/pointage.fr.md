Quand : à l'arrivée du relevé bancaire.

1. Ouvrir [les écritures sans date comptable](banque.ecriture[pointage]) et choisir le compte.
2. Pour chaque ligne du relevé, poser la date comptable directement dans la liste : la ligne
   quitte la liste des écritures à pointer.
3. Une écriture du relevé absente de la liste se saisit : [créer une écriture](banque.ecriture[+record])
   avec sa date d'opération, sa date comptable, son libellé, son budget, son montant.
4. À la fin, ouvrir [les écritures par date comptable](banque.ecriture[par_comptable]) et exporter le
   relevé en PDF : [les écritures imprimées reçoivent leur date d'impression](banque.ecriture.creer_releve).

> **À ne pas faire** : poser une date comptable sur une écriture absente du relevé — elle y
> figurera au prochain, c'est là qu'elle se pointe.
