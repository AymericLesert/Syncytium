# Ce que la sécurité enregistre

> **L'audit des lectures** enregistre qui a lu quoi, quand et par où,
> dans un stockage distinct de l'historisation, une entité du module
> d'administration. `trace:` l'allume sur un module, une entité ou un
> champ ([glossaire](../../glossaire.md)).

La sécurité ne fait pas qu'autoriser : elle enregistre, pour l'audit, ce
qui a été lu, écrit et refusé, et par qui. Ce fichier dit les quatre
enregistrements, l'audit des lectures, la trace des écritures, les actes
privilégiés, les refus et les événements de sécurité. La forme du journal,
ses niveaux, son throttling et sa rétention sont à l'exploitation, le
chapitre 10 ; ce que l'on déduit de ces enregistrements, les risques d'un
usage inapproprié, est à la télémétrie, le chapitre 11 (D1816). Les
décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [L'audit des lectures](#laudit-des-lectures)
- [La trace des écritures](#la-trace-des-écritures)
- [Les actes privilégiés](#les-actes-privilégiés)
- [Les refus et les événements de sécurité](#les-refus-et-les-événements-de-sécurité)

## L'audit des lectures

L'audit a son stockage, distinct de l'historisation, pour un autre
usage : l'historique dit ce qu'une fiche était, l'audit dit qui l'a lue
(D1814). Trois régimes gouvernent ce qui s'audite (D703) :

- **d'office**, un champ `rgpd: sensitive` est audité, rien à écrire ;
- **`trace: audit`** allume l'audit au-delà du défaut, sur un module,
  une entité ou un champ (D1814) ;
- **`trace: limited`** exclut un champ de toute trace, l'audit, le
  journal, les messages : un mot de passe, une clé ne se tracent jamais
  (D463, D603).

Une ligne d'audit par enregistrement lu (D1815) : le module, l'entité et
l'identifiant de l'enregistrement, qui, quand, par où, l'écran, l'export,
l'impression, l'API, le connecteur, et, pour une trace sur un champ, le
nom du champ. Jamais la valeur : on la recoupe par l'historique de
l'entité à la date, s'il est actif sur la période (D1814). Le requêtage
est simple et le filtre facile, par module, entité, champ ou
enregistrement ; sur de très grandes requêtes fréquentes, un stockage
« intelligent » gardera la granularité avec un espace ajusté, un choix
d'implémentation (D1815). L'entité d'audit est dans le module
d'administration, portée par Syncytium ; ses surfaces se consultent au
degré `administrator` (D704, D666) ; sa rétention est de l'exploitation,
le chapitre 10 (D411, D1811). L'entrepôt audite les lectures de ses
contacts :

```yaml
# L'historique
history: true

# L'audit des lectures
# Les lectures des contacts, des données personnelles, sont auditées : qui, quand, par où, l'enregistrement lu.
trace: audit
```

## La trace des écritures

Toute écriture est tracée (D62). L'historisation est la trace des
écritures : chaque acte photographie l'agrégat, avec l'auteur, le canal,
le motif, l'horodatage (D169, D429) ; sans historique, un acte ordinaire
ne laisse pas de trace, c'est le choix du concepteur. L'écriture
d'`history:` est au chapitre 2 ([la vie d'un enregistrement](../02-modele/04-vie.md),
D411). La provenance d'une donnée reprise persiste après la mort du
connecteur, le stock de reprise est le journal d'audit de la reprise, et
l'import d'exploitation porte l'opérateur (D178, D182, D238) ; le
chapitre 8 les décrit.

## Les actes privilégiés

Un acte privilégié agit au-delà des droits ordinaires, ou sur les droits
eux-mêmes. Aucun n'est sans trace : il se trace dans l'entité d'audit du
module `_administration`, avec son motif, une catégorie et une note, que
l'entité touchée ait ou non un historique (D62, D1817). Ce sont :

- le passe-outre d'un `allow:` par l'administrateur (D942) ;
- le passe-droit du statut, le changement d'état hors du graphe (D835) ;
- la délégation, agir à la place d'un autre, la trace aux deux comptes
  (D76, D715) ;
- le changement d'adresse d'un compte par l'administrateur (D721) ;
- l'activation du secours (D81) et le mode safe (D718) ;
- la rotation des clés (D730) ;
- la réactivation d'un enregistrement désactivé (D903) ;
- les actions de supervision des tâches (D62).

## Les refus et les événements de sécurité

Les refus d'autorisation et les échecs d'authentification se journalisent
toujours : ils sont le carburant de la détection (D43, D720). Le journal
du moteur porte les événements de sécurité avec leur sens (D925) :

- l'authentification réussie, la déconnexion, la révocation, la rotation
  des clés, l'ingestion et la recharge, en `info` ;
- l'échec d'authentification et le verrouillage, le refus
  d'autorisation, le refus de cooldown et le 429, l'activation du
  secours, le mode safe, le passe-droit et la délégation, en `warning` ;
- les erreurs de connecteur, en `error`.

Chaque événement porte le compte, l'origine, la ressource, la règle, et
jamais un secret : ni un mot de passe même erroné, ni une valeur
`trace: limited` ou `private` (D925). Le journal d'accès complet, une
ligne par requête, reste au proxy (D925). Le journal comme fichier, par
environnement, ses niveaux, sa rétention, et le throttling qui agrège
les occurrences répétées d'un même événement contre la saturation
(D343, D737, D800, D926), sont au chapitre 10 ; la pente des refus, les
pics et le modèle de risque, au chapitre 11 (D43). La documentation
réglementaire porte, par module soumis, un chapitre de la journalisation
des accès, l'audité, le journalisé, qui consulte, la rétention (D1336).
