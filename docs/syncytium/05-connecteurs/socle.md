# Le socle commun

*Ce que toute classe de connecteur implémente et porte, quelle que soit
sa famille : les méthodes, les propriétés minimales, la position de
sécurité.*

## Le sommaire

- [Les méthodes (D621, D627, D630)](#les-méthodes-d621-d627-d630)
- [Les propriétés (D621–D627, D1712, D1713)](#les-propriétés-d621d627-d1712-d1713)
- [La position de sécurité (D625–D627)](#la-position-de-sécurité-d625d627)

## Les méthodes (D621, D627, D630)

Toute classe les implémente :

| la méthode | le moment, le rôle |
|---|---|
| `initialize` / `release` | le démarrage et l'arrêt de l'application (D621) |
| `connect` / `disconnect` | à l'appel du connecteur (D621) |
| `ping()` | la santé — **le statut** : `error`, `initialized`, `disconnected`, `connected`, `closed`… ; `every:` en précise la fréquence (D621) |
| `onerror` | la défaillance — retourne **un mock de résultat** (le connecteur non critique — l'écho de la dégradation D68) ou **l'appel à la page de maintenance** (le connecteur clé) (D627) |
| `describe()` — `describe(model)` pour le storage (D1299) | « générer de la documentation en markdown/html pour la documentation automatique de l'instance » (D630) — la règle de **tous** les hooks (D645), la doc technique assemblée version par version |

## Les propriétés (D621–D627, D1712, D1713)

Tout connecteur les porte, un cas n'écrit que ce qu'il surcharge ; elles sont
minimales : « un connecteur peut compter plus de propriétés et cela
dépendra de leur implémentation » (D1713), les propriétés spécifiques
d'une classe, la carte `entities:` d'un storage de format, la
`convention:` d'un storage de reprise ; leurs
défauts sont à l'inventaire du chapitre 1, en proposition jusqu'à
l'implémentation :

- `connection: permanent | on_demand | idle[15min]` — la connexion
  permanente, à l'appel, ou fermée au laps d'inactivité (D621) ; le
  défaut, `on_demand` ;
- `pool:` — le nombre de connexions, le parallélisme des opérations
  asynchrones (D622, D436) ; le défaut, 1 ;
- `retry:` et `timeout:` — la reprise sur erreur (D625 ; ce retry n'est
  pas la reprise de données, D175) ; les défauts, aucune relance, et un
  délai par famille ;
- `onerror: maintenance | mock` — la page de maintenance pour un
  connecteur clé, le mock de résultat pour un connecteur non critique
  (D627) ; le défaut, `maintenance` pour le storage du modèle, le
  `smtp` et l'`authentication`, `mock` pour les autres ; un connecteur
  est clé quand son `onerror` vaut `maintenance` ;
- `every:` — le rythme, la fréquence du `ping()` (D604, D621) ;
- `rgpd: { countries: [FR] }` — le ou les pays du stockage ou de la
  destination, une liste, « selon l'implémentation du connecteur, nous
  pouvons avoir plusieurs zones de stockage ou d'échange » (D1345), pour
  le registre des traitements (D1328 ; le lieu du storage, les
  transferts hors Union des connecteurs sortants).

## La position de sécurité (D625–D627)

La position de sécurité : « en cas d'erreur, il faut
passer sur une page de maintenance et une alerte doit être émise »
(D626) ; et **la condition indispensable** : « l'application doit
démarrer uniquement si l'envoi de mail à l'administrateur est
possible » — le canal d'alerte avant tout, le smtp vérifié au
démarrage.
