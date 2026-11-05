# Le hook d'opération

*Ce que le projet ajoute par du code : une opération, son contrat, ses quatre fonctions, ses cinq propriétés, ce
qu'elle lit. Le mécanisme commun est au chapitre 1,
[la version](../01-configuration/04-version.md#39-hooks--le-mécanisme-des-hooks).*

## Le sommaire

- [Le contrat](#le-contrat)
- [Ce que le hook lit](#ce-que-le-hook-lit)

## Le contrat

**Le contrat — l'objet aux quatre fonctions (D595) :**

| la fonction | le rôle |
|---|---|
| `execute` | remplit **la transaction tenue ouverte** (D594) — le preview est l'exécution suspendue avant le commit |
| `confirm` | la relecture — le message-label (D597) aux valeurs nommées (`nb_creations`, `nb_updates`, `nb_deletes`… — D598), ou un formulaire nourri par la transaction (D600–D601) |
| `commit` | scelle — et **retourne l'issue** (l'écran, le téléchargement, l'impression, le message, rien — D570/D597) : le moteur lit et déclenche |
| `rollback` | défait proprement |

**Les propriétés intrinsèques du contrat** — « une opération
s'exécute et elle possède aussi des propriétés » : ce qui tient au
code, « pas exposable dans la configuration mais dans le contrat du
hook » (D699, D904–D905) ; cinq propriétés, closes jusqu'à
l'implémentation (D1743) :

| la propriété | le sens |
|---|---|
| `degree: reader \| user \| manager \| administrator` | le plancher d'autorisation (D697/D699) ; les quatre degrés, `reader` compris (D1140, D1680) |
| `execution: irreversible \| once \| repeatable`, `try:`, `delay:` | **le mode d'exécution** (D57, D1743, D1744) : `once`, le défaut — un seul essai, `try: 1`, `delay: 0` — ; `repeatable`, l'opération peut être rejouée, `try:` le nombre d'essais, `delay:` le délai entre deux essais, en millisecondes ou en secondes ; `irreversible` — « not undo » —, les effets ne se défont pas, le mail parti ne se rappelle pas, aucun rejeu, la relance manuelle depuis la supervision ; `rollback` défait la transaction, jamais les effets |
| `deterministic: true \| false` | **l'opération est déterministe ou pas — « elle ne peut pas changer sans faire changer son code »** (D59/D904) : l'assertion du code — un doublon (même opération, mêmes paramètres) dans la fenêtre reçoit **le résultat mémorisé**, sans ré-exécution ni effet répété |
| `deterministic_duration: <durée>` | **la fenêtre de mémoïsation** (D59) — « cela dépendra éventuellement de la façon dont elle sera implémentée » : le hook la porte, la configuration ne la surcharge jamais |
| `connectors: { <nom>: <famille> }` | **les connecteurs attendus pour l'exécution** (D913) — « le hook décrit les types de connecteurs utilisés (comme des paramètres d'exécution) » : nommés et typés par leur famille (`documents: file`, `mailer: smtp`) ; **la déclaration les lie par `uses:`** au connecteur de l'environnement (D617) ; l'ingestion vérifie la liaison, la famille (D613) et la complétude par environnement ; tout connecteur non attendu est hors de portée (D599) ; **aucune liaison implicite** (D914 — `uses:` s'écrit toujours, D805 ; l'erreur d'ingestion nomme le candidat unique) |

Toutes paraissent au `describe` (D645) ; leurs noms sont ceux du
catalogue, en anglais, `deterministic`, `deterministic_duration`
(D905). **Le hook déclare, le
moteur exploite** (D905) : « ces paramètres doivent être exploités
par Syncytium pour mieux gérer le déterminisme avec un cache ou
pas » — Syncytium lit le contrat et en tire sa conduite : le cache
de mémoïsation tenu pour l'opération déterministe et vidé à
l'échéance de la fenêtre, aucun cache pour la non-déterministe,
l'exécution unique sans rejeu. L'invalidation du cache
est l'acte de l'administrateur (D60 — trois grains : l'opération +
ses paramètres, l'opération, tout). **Le cooldown, lui, est un
paramètre d'administration** (D58/D904) : le défaut en setting
dynamique de l'application (`operation.cooldown`, `1min` — D588),
la surcharge `cooldown:` à la déclaration ; **l'API seule** — une
exécution par période, mesurée de la fin de l'exécution au début de
l'appel suivant, le rappel refusé et journalisé (D43). **La
rétention du résultat** de même (D55/D906 — « un paramètre
d'administration, je valide ») : `operation.retention` en setting
dynamique (`90d`), la surcharge `retention:` à la déclaration, le
résultat échu purgé. Quatre propriétés sont au contrat, deux
paramètres à l'administration (D904–D906).

## Ce que le hook lit

**Ce que le hook lit** : **la pile des contextes** (D553 —
l'opération au fond de la pile voit le périmètre de la liste,
l'enregistrement du formulaire, le transitoire du wizard),
**`context.`** (D589 — `user` traversable, `location`, `now`,
`instance`/`application`/`module`, `entity`/`field`,
`file`/`page`/`pages` au document) et **`context.settings.<nom>`**
(D588/D591 — `{ mode: static | dynamic, type:, value: }`, la
cascade application → module → entité, le dynamique ajusté au module
d'administration — D573). La fonction lit le contexte **en lecture
seule** (D571).
