# Ce que la sécurité enregistre

Ce qui s'enregistre pour l'audit : les lectures, les écritures, les actes
privilégiés, les refus et les événements de sécurité ; la forme du journal
est à l'exploitation, la déduction des risques à la télémétrie (D1816).

Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md). Le texte vient des deux artefacts
préparatoires, déplacé à la réorganisation ; la réécriture suit.

## Le sommaire

- [La provenance et la trace (D62, D178, D238, D429)](#la-provenance-et-la-trace-d62-d178-d238-d429)
- [L'audit des lectures (D702–D704)](#laudit-des-lectures-d702d704)
- [La traçabilité](#la-traçabilité)
- [L'audit et la détection](#laudit-et-la-détection)

## La provenance et la trace (D62, D178, D238, D429)

Toute écriture est tracée (D62) ; la provenance de la reprise
persiste après la mort du connecteur (D178) ; l'import
d'exploitation porte l'opérateur (D238) ; la trace des opérations
est l'historisation elle-même (D429).

## L'audit des lectures (D702–D704)

- **le grain : l'enregistrement** (D1815, qui amende D702 — « l'acte,
  jamais l'enregistrement ») — une ligne d'audit par enregistrement lu :
  qui, quand, quoi (le module, l'entité, l'identifiant de
  l'enregistrement, le champ), par où (l'écran, l'export, l'impression,
  l'API, le connecteur) ; le requêtage est simple, le filtre facile ; sur
  de très grandes requêtes fréquentes, un stockage « intelligent » est à
  envisager, qui garde la granularité avec un espace ajusté ;
- **le défaut automatique** (D703) : ce qui est `rgpd: sensitive`
  (D695) s'audite d'office — rien à écrire ;
- **la propriété `trace:`** (D703) — les deux compléments :
  `trace: audit` (l'opt-in — le champ tracé au-delà du défaut) et
  **`trace: limited`** (l'exclusion — le champ écarté de **toute**
  trace : « un mot de passe ou une clé ne doivent pas être tracés »,
  l'écho de D463/D603) ;
- **la maison** (D704) : une entité du **module d'administration**
  (porté par Syncytium — le patron D666) ; les surfaces standard la
  consultent (le degré `administrator`), la rétention de l'audit se
  déclare comme toute historisation (D411) ;
- **un stockage distinct de l'historisation, pour un autre usage**
  (D1814) : `trace:` se pose sur un module, une entité ou un champ ;
  l'audit stocke l'identifiant de l'enregistrement, qui, quand, par où,
  et, pour une trace sur un champ, le nom du champ — jamais la valeur,
  que l'on recoupe par l'historique de l'entité à la date, s'il est
  actif sur la période ; l'identifiant d'une trace suit le module,
  l'entité et l'id de l'enregistrement, le nom du champ ;
- **les actes privilégiés s'y tracent aussi** (D1817) : le passe-outre
  d'un `allow:`, le passe-droit du statut, la délégation, le secours, le
  mode safe, la rotation, la réactivation, la supervision — avec leur
  motif (D62), que l'entité touchée ait ou non un historique ; « sans
  historique, pas de trace » (D429) ne vaut que pour les actes
  ordinaires.

```yaml
fields:
  blood_type: { type: text, rgpd: sensitive }   # audité d'office (D703)
  notes:      { type: text, trace: audit }      # l'opt-in
  api_key:    { type: password, trace: limited } # jamais tracé — nulle part
```

## La traçabilité

- **Toute écriture est tracée** (D62) : l'audit des actions de
  supervision porte **un motif** (catégorie + note) ; l'historisation
  photographie chaque acte — **auteur, canal, motif, horodatage**
  (D169) ; **la trace des opérations = l'historisation** (D429),
  sans machinerie séparée ; la rétention déclarée par `history:`
  (D411).
- **La provenance persiste** (D178) après la mort du connecteur ;
  **le stock de reprise = le journal d'audit de la reprise** (D182 —
  chaque ligne source a un destin daté et justifiable) ; l'import
  d'exploitation porte l'opérateur (D238).
- **L'audit à double identité** : la délégation (D76, D715), le
  changement de statut hors graphe (D835), le changement de mail par
  l'administrateur (D721), l'activation du secours (D81), le mode
  safe (D718), la rotation des clés (D730) — **jamais un acte
  privilégié sans trace** : ils se tracent dans l'entité d'audit du
  module `_administration`, avec leur motif, que l'entité touchée ait ou
  non un historique (D1817).

## L'audit et la détection

- **L'audit des lectures** (D702–D704, D1815) : le grain de
  **l'enregistrement** (une ligne par enregistrement lu — qui, quand,
  quoi, par où ; un stockage « intelligent » à envisager pour le
  volume ; D702 amendée) ; le
  `rgpd: sensitive` audité d'office ; `trace: audit` en opt-in,
  **`trace: limited`** en exclusion totale (le mot de passe, la clé —
  D463/D603) ; l'entité d'audit au module d'administration, ses
  surfaces au degré `administrator` ; **un stockage distinct de
  l'historisation** (D1814) — `trace:` sur un module, une entité ou un
  champ ; l'identifiant de l'enregistrement, qui, quand, par où, le nom
  du champ, jamais la valeur, recoupée par l'historique à la date.
- **La documentation 5** (D1336) : par module soumis, le chapitre des
  mentions — `rgpd.notice` générée depuis le registre, ancrée par le
  concepteur, le manque notifié sinon (D1335) — et le chapitre de la
  journalisation des accès — l'audité, le journalisé, qui consulte, la
  rétention de l'audit, les comptes à l'instance.
- **Les journaux** (D343, D737, D800) : par environnement, en
  anglais, le niveau et la rétention maîtrisés, **la consultation par
  le concepteur seul, hors IHM**. **Le journal d'accès reste au
  proxy** (D925) ; le journal du moteur porte **les événements de
  sécurité avec leur sens** — l'authentification en `info`, les
  échecs, les refus d'autorisation, les refus de cooldown et les
  429, le secours, le mode safe, le passe-droit et la délégation en
  `warning`, les erreurs de connecteur en `error` — le compte,
  l'origine, la ressource, la règle ; **jamais un secret**, un mot de
  passe même erroné, une valeur `trace: limited` ou `private`.
  **Le throttling des traces** (D926) : la première occurrence
  tracée en entier, les suivantes agrégées dans la fenêtre —
  l'événement, le début, la fin, le nombre — contre l'attaque qui
  saturerait les journaux ; le nombre nourrit la détection (D43).

