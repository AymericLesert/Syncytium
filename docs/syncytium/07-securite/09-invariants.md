# Les invariants, la liste de contrôle

> **Un invariant de sécurité** est une règle que toute implémentation de
> Syncytium devra prouver, décision par décision : ce que le socle
> garantit quoi que la configuration déclare
> ([glossaire](../../glossaire.md)).

Treize invariants, recalculés après le recentrage du chapitre (D1823).
Chacun renvoie aux décisions qui le fondent, et aux fichiers du chapitre
qui le détaillent. Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [La liste de contrôle](#la-liste-de-contrôle)

## La liste de contrôle

Ce que toute implémentation devra prouver, décision par décision :

1. un compte sans groupe est un `reader` (D1793, qui amende D699 et
   D746) — il lit la documentation `public`, rien du détail ; le
   `reader` n'ouvre un écran que si le concepteur l'a mis à son degré
   (D1794) ;
2. le serveur arbitre ; l'interface et l'injection comportementale
   ne portent aucune sécurité (D25, D66) ;
3. `private` ne quitte jamais le serveur autrement que par une tâche
   déclarée (D25, D53) ;
4. un champ calculé est au moins aussi restreint que ses sources
   (D102) ;
5. la possession d'un identifiant ne prouve rien — le re-contrôle
   d'appartenance à chaque accès (D75) ;
6. un `allow:` n'abaisse jamais un plancher ; le plus exigeant
   l'emporte (D700) ;
7. les droits se vérifient au début de chaque acte, jamais figés par
   la session (D694) ;
8. aucun acte privilégié sans trace — délégation, passe-droit,
   secours, mode safe, rotation (D62, D715, D835, D81, D718, D730) ;
9. un secret n'est jamais tracé (D703) — ni au journal, ni à l'audit, ni
   dans un message ; le reste des secrets est au moteur et à l'exploitation
   (D1786) ;
10. aucune entrée anonyme sur un webhook (D642) ;
11. la suppression désactive ; l'effacement RGPD anonymise sans
   dériver de l'origine (D137, D696) ;
12. le hook ne contourne ni droits, ni confidentialité, ni
   validation, ni concurrence (D599) ;
13. le chat ne sait jamais plus que l'utilisateur qui l'interroge —
   aucun droit propre au chat, les droits sont ceux des composantes
   de la description (D960) ; rien de personnel ne quitte l'instance
   sans anonymisation, hors les données du profil connecté ; aucun
   échange — question ou réponse — sans trace (D957–D959).

