# Syncytium — Conception d'une solution pilotée par les métadonnées

> Document de travail issu des échanges de conception. Il consigne la vision, les
> décisions actées, les mécanismes esquissés et les questions encore ouvertes.
> Statut : **en cours de débat** — ne pas considérer comme spécification finale.
>
> Dépôt : <https://github.com/AymericLesert/Syncytium> — ce fichier
> (`docs/conception.md`) est la **version canonique** du document.

Dernière mise à jour : 2026-06-12

---

## 1. Vision

Construire une solution informatique dont les trois couches dérivent d'une **source
de vérité unique** : un descriptif simple des données (architecture *metadata-driven*
ou *schema-driven*).

1. **Le modèle** — un descriptif technique des données (entités, champs, types,
   relations) rédigé dans un fichier texte.
2. **L'interface graphique** — générée dynamiquement à partir du descriptif :
   tableaux, formulaires, navigation. Toute évolution du descriptif se reflète dans
   l'interface sans redéveloppement.
3. **Les API** — exposées automatiquement à partir du même descriptif (REST +
   documentation OpenAPI générée), pour faire communiquer la solution avec d'autres
   systèmes.

Outils existants comparables (pour situer le concept) : Airtable, Directus, Strapi,
Budibase. La question « construire sur mesure ou s'appuyer sur un existant » reste
posée (voir §6).

---

## 2. Décisions actées

| # | Décision | Justification |
|---|----------|---------------|
| D1 | Le descriptif est **géré par un technicien**, jamais exposé tel quel à l'utilisateur final. | Pas besoin d'éditeur visuel de schéma ; un fichier texte (YAML/JSON) suffit. |
| D2 | Le descriptif est un **fichier texte versionnable** (Git) avec validation stricte au chargement. | Traçabilité, retour arrière, test avant production ; les erreurs sont signalées au chargement plutôt que de produire des écrans cassés. |
| D3 | Les mises à jour du descriptif sont **fréquentes** (potentiellement en cours de journée) → **migration à chaud** requise. | L'historique de l'auteur : il appliquait jusqu'ici une stratégie « redémarrage + migration simple » (niveau 1), insuffisante pour son besoin. |
| D4 | Le descriptif inclut des **règles de transformation explicites** pour les changements ambigus : renommage, éclatement, fusion. | Un renommage est indiscernable d'une suppression+création par simple comparaison de schémas ; seule la déclaration du technicien est fiable. |
| D5 | Les cas triviaux (ajout de champ, ajout d'entité) sont **déduits automatiquement** par comparaison de schémas, sans déclaration. | Meilleur des deux mondes : règles explicites uniquement pour l'ambigu ou le destructif. |
| D6 | **Éclatement** : expressions régulières (regex). **Fusion** : syntaxe de gabarit avec accolades, ex. `"{prenom} {nom}"`. | Niveau d'expressivité volontairement minimal — connu de tout technicien, lisible sans documentation, n'embarque pas de logique métier complexe. |
| D7 | La migration est **préparée pendant une période de faible affluence** (vérifications), puis **déclenchée dès que valide**. | Profiter de l'absence de connexions résout une partie du problème des requêtes en cours. |
| D8 | Si des utilisateurs restent connectés : **procédure de mise en attente ou phase de maintenance**. | Une application utilisée en continu ne migrerait jamais sans ce mécanisme. |
| D9 | Chaque migration est **transactionnelle** : elle réussit entièrement ou la base reste dans l'état précédent. | Indispensable pour migrer à chaud en cours de journée. |
| D10 | L'interface graphique **suit toujours la dernière version déployée** du schéma — migration imposée, pas de choix utilisateur. | Simplifie tout un pan du problème : la compatibilité multi-versions ne concerne que les API. |
| D11 | Les API assurent la **compatibilité ascendante et descendante**. Les applications appelantes ne sont **pas maîtrisées** par l'auteur. | Point identifié comme le plus complexe du projet ; impose traduction de versions et politique de dépréciation observable (voir §5). |
| D12 | Les API sont **versionnées**, avec des **mécanismes de dépréciation** pour limiter le nombre de versions accessibles simultanément. | Résout le mécanisme de Q8 ; chaque version maintenue est une charge — la dépréciation borne cette charge dans le temps. |
| D13 | La migration est **autorisée même sans fonction inverse** : une **valeur de substitution** est servie aux anciennes versions d'API pendant la période de dépréciation, puis supprimée avec la version au terme de celle-ci. | Résout Q10 — aucune migration n'est bloquée ; le contrat se dégrade en douceur, selon un calendrier annoncé (`Deprecation`/`Sunset`). |
| D14 | **Télémétrie indispensable** à trois étages : API, objets (entités/champs) et actions des utilisateurs. Elle conditionne les évolutions et simplifications de l'outil. | Boucle de rétroaction : le descriptif pilote l'application, la télémétrie pilote l'évolution du descriptif (voir §6). |
| D15 | Cible : **TPE**. ~**20 utilisateurs simultanés**, bases jusqu'à **plusieurs Go**. Pas d'interfaces publiques à très forte affluence. | Résout Q1 — architecture mono-serveur, migration directe (pas d'arrière-plan), voir §7. |
| D16 | **Une instance par TPE**, chacune avec **sa propre description**. | Résout Q14 (modèle) — isolation parfaite, migrations indépendantes, RGPD simple. |
| D17 | Le **moteur est distribué via un repository public**. **Pas de mise à jour technique automatique** : la mise à jour du moteur passe par une **procédure de migration technique déclenchée sur sollicitation**. Seule la **description** se déploie **à chaud**. | Deux canaux de mise à jour bien distincts ; le parc d'instances sera hétérogène (voir §7.2). |
| D18 | Le **choix de la base de données est différé** (PostgreSQL, NoSQL ou autre). | Garde Q7 ouverte ; impose dès maintenant une **couche d'abstraction de la persistance** dans le moteur (voir §7.1). |
| D19 | Licence : **AGPL**. La solution est et reste **open source** ; elle ne doit pas pouvoir être capturée dans une version propriétaire fermée. | Résout l'essentiel de Q15. Nuance consignée : l'AGPL n'interdit pas l'usage commercial (aucune licence open source ne le peut) mais garantit que toute modification — y compris servie en ligne — retourne au commun. |
| D20 | **Exposition sélective** : les API diffusent selon des critères de confidentialité — tous les champs ne sont pas exposés. | Le contrat d'API = schéma × politique d'exposition, déclarée champ par champ dans le descriptif (voir §5.5). |
| D21 | **Champs calculés** : certains champs exposés ne représentent pas uniquement des données stockées. | En lecture seule par nature (pas de problème d'inverse). Même mécanique que la valeur de substitution de D13. |
| D22 | Lecture : **unitaire, liste, ou intégralité via pagination**. Écriture : **unitaire ou par lot**. | Surface CRUD complète ; sémantique des lots et type de pagination à trancher (Q19). |
| D23 | Accès aux **systèmes externes** (Active Directory, ERP, CRM, …) via des **connecteurs spécialisés**. | La solution consomme aussi (résout Q3 avec D20–D24) ; architecture de plugins, correspondance connecteur ↔ entités déclarée dans le descriptif (voir §5.5). |
| D24 | Les API **déclenchent des tâches asynchrones et suivent leur avancée** (génération de PDF, envoi de mails, …). | Patron 202 + ressource de suivi ; la file de tâches est drainée/suspendue pendant une migration (§4). |
| D25 | Confidentialité des champs : **trois niveaux en ordre emboîté** — `public` (API + interface + tâches), `protegee` (interface + tâches), `privee` (tâches seulement). Défaut : `public`. Le cas « API sans interface » est exclu (sans objet dans le projet). | Résout Q17 (niveaux) — un seul attribut `confidentialite` par champ dans le descriptif ; l'audience de chaque canal est un sous-ensemble du canal plus large (API ⊂ interface ⊂ tâches). Voir §5.5. |
| D26 | En complément des niveaux : **restriction par compte (nominatif) ou par groupe d'utilisateurs** (comptable, administrateurs, …). Par défaut, le niveau est global (tous les utilisateurs). | Deux axes orthogonaux qui se composent : le *niveau* (quel canal) × le *qui* (quels comptes/groupes). Voir §5.5. |
| D27 | Les **groupes sont déclarés dans la description** et la **confidentialité est portée par les groupes**. | Structure versionnée avec le reste du modèle ; les groupes sont donc soumis aux migrations (voir §5.6). Résout Q22 (définitions). |
| D28 | Deux types d'identité **étanches** : **technique** (accès API) et **nominative** (interface). Un compte est l'un ou l'autre, jamais les deux. | Cloisonnement de sécurité ; télémétrie distinguant nativement les deux populations ; le compte technique devient le porteur naturel de l'épinglage de version d'API (Q9). |
| D29 | Provisionnement des identités : **connecteur Active Directory** pour les clients équipés ; **gestion locale via l'interface** pour les autres. Un **administrateur** définit un utilisateur (technique ou interface) et l'affecte à des groupes issus de la description. | L'identité locale est le socle universel ; l'AD est une source de provisionnement optionnelle (correspondance groupes AD → groupes de la description). Résout Q4 (authentification). |
| D30 | Clients AD : **connexion de type SSO**, avec **association d'un groupe de sécurité AD à un groupe de la description**. | Ouvre le provisionnement à la première connexion (JIT) : les groupes arrivent dans le jeton à chaque connexion — pas de synchronisation différée. Ne concerne que les comptes nominatifs (l'étanchéité D28 est préservée). Voir §5.6. |
| D31 | L'**association** groupe de la description ↔ groupe de sécurité AD/Entra est **gérée dans l'interface**, comme les comptes utilisateurs et techniques. | La description porte le *modèle* ; l'interface d'administration porte l'*infrastructure du client* (qui évolue indépendamment — changer d'annuaire n'exige pas de migration de description). |
| D32 | À l'**installation**, le technicien précise la **nature de l'authentification** (local, AD, Entra, …) — implémentée par des **connecteurs derrière une interface générique**. Le connecteur reste **paramétrable ensuite, par un administrateur uniquement**. | Le SI des clients évolue, le système d'authentification aussi. Même philosophie de plugins que D23. Point dérivé : rapprochement des comptes existants lors d'un changement de fournisseur (Q20). |
| D33 | **Amorçage** : la description contient un **compte administrateur et un mot de passe spécifique**, utilisable **uniquement s'il n'existe aucun compte administrateur dans l'interface**. | Résout Q24 — compte de secours inerte en régime normal. Précaution consignée : stocker l'**empreinte (hash)** du mot de passe dans la description, jamais le clair (fichier versionné dans Git). |
| D34 | **Suppression d'un groupe** encore référencé : **note remontée au technicien** (notification ou journalisation) et **groupe ignoré**. | Résout Q25 — politique tolérante. Effet de bord sûr : les restrictions référençant le groupe deviennent insatisfiables → champ fermé par défaut (la donnée se protège, ne s'expose pas). |
| D35 | Champs calculés : **paliers 1 et 2 actés** — calcul sur l'enregistrement (gabarits + arithmétique simple) et traversée de référence (`{client.nom_complet}`). | Résout Q18 (socle) — simples à décrire, peu coûteux, utiles à l'interface générée. Validation : références cassées et cycles. |
| D36 | Palier 3 (agrégats) en **deux temps** : (1) **expressivité minimale** pour commencer — `somme`, `compte`, `min`, `max`, `moyenne` sur une relation, à la volée ; (2) **hook de code personnalisé** pour tout le reste. | Résout Q18 (agrégats). Le vocabulaire reste minimal *parce que* la soupape du hook existe ; la matérialisation des agrégats est une optimisation ultérieure guidée par la télémétrie. Le hook = 3e point d'extension du moteur (voir §5.5). |
| D37 | Le hook se matérialise par une **extension de type plugin, déployée en même temps que la description**, déclinée en **trois modes** : **calcul d'un champ**, **tâche**, **comportement de l'interface graphique**. | Système d'extension générique couvrant les trois couches de la vision (modèle, traitements, interface) — cycle de vie commun, règles propres à chaque mode (voir §8). Résout la moitié de Q21 (catalogue de tâches : déclaration dans la description, implémentation en plugin). |
| D38 | Télémétrie **par champ** : évaluée **à la volée** (aucun stockage), via un tableau de bord dédié. Indicateur clé : la **diversité des valeurs**, pondérée par la date de création du champ et la fréquence de mise à jour de l'entité. | Un champ sans diversité ne porte probablement pas de sémantique → candidat au retrait. Date de création dérivée du journal de migrations (§3.2) ; fréquence = compteur d'entité (D39). Voir §6.1. |
| D39 | Télémétrie **par entité** : **stockée**. Compteurs d'usage lecture/écriture + historique d'évolution du schéma. | Au service de l'enrichissement du schéma ; l'historique de schéma réutilise le journal de migrations (pas de duplication). Voir §6.1. |
| D40 | Télémétrie **API & fonctions** : **double usage** — suivre l'usage réel (compteurs) **et identifier les acteurs**. | Acteurs = comptes techniques (D28), donc gestion d'intégrations et non surveillance de salariés ; alimente la dépréciation (§5.4) et l'épinglage (Q9). Voir §6.1. |
| D41 | Deux **supports** de télémétrie : (a) **données en base** (objet `télémétrie` dédié ou attaché à une entité) ; (b) **traces de journal** à conservation **paramétrable**, archivage à durée de vie max, **option d'anonymisation**. | Sépare les compteurs/indicateurs durables des traces datées ; la rétention et l'anonymisation outillent la conformité côté client (D16). Voir §6.2/§6.4. |

---

## 3. Le descriptif (esquisse)

### 3.1 État cible — entités et champs

```yaml
entites:
  client:
    libelle: "Client"
    champs:
      nom:        { type: texte, obligatoire: true }
      email:      { type: email, unique: true }
      categorie:  { type: choix, valeurs: [particulier, professionnel] }
      actif:      { type: booleen, defaut: true }

  commande:
    libelle: "Commande"
    champs:
      reference:  { type: texte, obligatoire: true }
      date:       { type: date }
      montant:    { type: monnaie }
      client:     { type: reference, vers: client }
```

À partir de ce seul fichier, la solution déduit : les tables en base, les écrans
(listes, fiches, formulaires avec les bons contrôles et libellés), et les API
(`GET /api/clients`, `POST /api/commandes`, …) avec leur documentation.

### 3.2 Versionnement et journal de transformations

Le descriptif porte un numéro de **version** et une section de **règles de passage**
d'une version à l'autre :

```yaml
version: 12

migrations:
  - depuis: 11
    operations:
      - renommer: { entite: client, champ: categorie, en: segment }
      - eclater:
          entite: client
          source: adresse_complete
          vers:
            code_postal: "regex: \\d{5}"
            ville:       "regex après code postal"   # syntaxe exacte à définir
      - fusionner:
          entite: client
          sources: [prenom, nom]
          vers: nom_complet
          gabarit: "{prenom} {nom}"
```

**À débattre** : syntaxe exacte des regex d'éclatement (groupes nommés ? une regex
par champ cible ou une regex unique avec groupes ?), tables de correspondance pour
la fusion de *valeurs* (ex. « particulier + indépendant → B2C »).

---

## 4. Cycle de vie d'une migration

```
Nouveau descriptif détecté
        │
        ▼
   1. VALIDATION      syntaxe, cohérence, règles de transformation complètes
        │
        ▼
   2. PRÉPARATION     répétition à blanc (dry-run) sur les données réelles
        │
        ▼
   3. ATTENTE         surveillance de l'affluence
        │
        ├── aucune connexion active ──────► 4. EXÉCUTION (transactionnelle)
        │
        └── utilisateurs présents ────────► mise en attente / maintenance
                                            puis 4. EXÉCUTION
        ▼
   5. BASCULE         nouveau modèle actif, interfaces rafraîchies
```

### 4.1 Préparation (dry-run) — la meilleure assurance

- Appliquer réellement les transformations sur une copie ou en transaction annulée.
- Détecter **avant la bascule** : regex qui ne matche pas sur des lignes existantes,
  fusion produisant des doublons sur un champ unique, etc.
- Produire un **rapport de répétition** remis au technicien
  (« 99,8 % des lignes passent, voici les 12 récalcitrantes ») ; il corrige sa règle
  ou définit une valeur par défaut pour les cas non couverts.
- Le dry-run **mesure la durée probable** de la migration → permet de choisir
  automatiquement le niveau de gel approprié (§4.3).

### 4.2 Détection d'affluence — deux seuils configurables

1. *Aucune session active depuis N minutes* → exécution immédiate.
2. *Délai maximal d'attente dépassé* (ex. la migration attend depuis 4 h, il reste
   2 connectés) → passage en procédure de maintenance plutôt qu'attente indéfinie.

### 4.3 Utilisateurs connectés — trois niveaux, du plus doux au plus ferme

1. **Prévenance** — bandeau : « Mise à jour dans 10 minutes, pensez à enregistrer ».
2. **Gel des écritures** — consultation possible, enregistrements suspendus
   (« mise à jour en cours, réessayez dans un instant ») ; suffisant pour la
   plupart des migrations (quelques secondes).
3. **Maintenance complète** — écran d'attente, pour les migrations lourdes.

L'application choisit le niveau d'elle-même grâce à la durée mesurée au dry-run.

### 4.4 Retour arrière

Si l'exécution échoue malgré le dry-run : la transaction annule tout (pas de
corruption), l'application **continue sur la version précédente** et notifie le
technicien — jamais d'état « entre deux versions ».

### 4.5 Requêtes en vol et rafraîchissement

- Drainer brièvement les écritures pendant la bascule.
- L'interface détecte le changement de version et se rafraîchit d'elle-même.

---

## 5. API et systèmes tiers — compatibilité bidirectionnelle

Contrainte actée (D11) : compatibilité ascendante **et** descendante, face à des
consommateurs **non maîtrisés**. L'interface graphique, elle, suit toujours la
dernière version (D10).

### 5.1 Le journal de migrations comme chaîne de traduction

La base ne stocke qu'une seule forme : **la dernière version du schéma**. La
compatibilité se joue **aux frontières** : chaque requête entrante et chaque réponse
sortante traversent la chaîne des migrations, rejouée en avant ou à l'envers.

```
Requête d'un client resté au contrat v11 (schéma actuel : v14)

  Requête (forme v11)
     → traduction 11→12 → 12→13 → 13→14 →  traitement sur le schéma actuel
     ← traduction 14→13 → 13→12 → 12→11 ←  réponse renvoyée (forme v11)
```

Modèle de référence : l'API de Stripe. Rendu possible ici parce que les migrations
sont **déclaratives**, donc rejouables mécaniquement dans les deux sens — à
condition que chaque opération ait un inverse.

### 5.2 Inversibilité des opérations

Symétrie clé : **l'éclatement (regex) et la fusion (gabarit) sont l'inverse l'un de
l'autre**.

| Opération (sens avant) | Inverse (sens arrière) | Fourni par |
|---|---|---|
| Renommer | Renommer dans l'autre sens | Automatique |
| Éclater par regex | Fusionner par gabarit | Le technicien (souvent trivial) |
| Fusionner par gabarit | Éclater par regex | Le technicien |
| Ajouter un champ | Omis des réponses anciennes ; écritures anciennes → `defaut` du descriptif | Automatique |
| Supprimer un champ | **Opération avec perte** — voir §5.3 | Politique explicite |

Chaque règle gagne donc une déclaration bidirectionnelle :

```yaml
- fusionner:
    entite: client
    sources: [prenom, nom]
    vers: nom_complet
    gabarit: "{prenom} {nom}"
    inverse: "(?<prenom>\\S+) (?<nom>.+)"   # pour servir les clients v11
```

**Conséquences sur le cycle de vie (§4)** :
- La **validation** exige, pour chaque opération, soit un inverse, soit une valeur
  de substitution (D13, §5.3) — une migration n'est jamais bloquée, mais jamais
  silencieusement avec perte non plus.
- Le **dry-run** vérifie les allers-retours sur données réelles (traduire 14→11→14
  et contrôler le résultat — une regex inverse peut échouer sur un nom composé).

### 5.3 Opérations avec perte (ex. suppression de champ) — politique actée (D13)

**La migration n'est jamais bloquée**, même sans fonction inverse. Règle de
validation reformulée : une opération sans inverse doit déclarer une **valeur de
substitution** dans le descriptif.

- Les anciennes versions d'API reçoivent la valeur de substitution (constante ou
  calculée) pendant la **période de dépréciation**.
- Les écritures sur le champ disparu sont **acceptées puis ignorées**, et
  journalisées — signal de télémétrie précieux : un client qui écrit encore ce
  champ n'a pas migré.
- L'**horloge de dépréciation démarre à la migration** ; les en-têtes
  `Deprecation`/`Sunset` l'annoncent dès la première réponse.
- Au terme de la période, la version d'API est retirée et la substitution avec
  elle.

(Pour mémoire, options écartées : refus de la migration tant qu'une version active
expose le champ ; rupture assumée immédiate.)

### 5.4 Vivre avec des consommateurs inconnus

La coordination étant impossible, trois mécanismes la remplacent :

1. **Épinglage de version explicite** — version dans l'URL (`/api/v11/clients`) ou
   en-tête. **Pas de défaut implicite vers « dernière version »** ; soit la version
   est obligatoire, soit (modèle Stripe) elle est figée à l'enregistrement du
   consommateur.
2. **Télémétrie par version et par consommateur** — observer qui appelle encore la
   v11, à quelle fréquence, sur quels points d'accès → retirer une version en
   connaissance de cause.
3. **Dépréciation annoncée dans les réponses** — en-têtes HTTP standard
   `Deprecation` et `Sunset` ; documentation OpenAPI générée **par version
   supportée**.

### 5.5 Surface fonctionnelle des API (D20–D24)

Les API ne sont pas qu'un robinet à données : exposition sélective, champs
calculés, lots, connecteurs et tâches asynchrones (Q3 résolue).

**Exposition sélective (D20, précisée par D25–D26).** Trois niveaux en ordre
emboîté, un seul attribut par champ dans le descriptif :

| Niveau | API | Interface | Tâches |
|---|---|---|---|
| `public` (défaut) | ✔ | ✔ | ✔ |
| `protegee` | ✘ | ✔ | ✔ |
| `privee` | ✘ | ✘ | ✔ |

Le cas « API sans interface » est exclu (sans objet) — ce qui confirme l'ordre
total API ⊂ interface ⊂ tâches et évite toute matrice canal par canal.

Conséquences consignées :
- **Changer le niveau d'un champ = migration de contrat.** Passer de `public` à
  `protegee` est, pour un consommateur d'API, une suppression de champ → emprunte
  le mécanisme D13 (substitution pendant dépréciation, `Sunset`, retrait). Aucun
  mécanisme nouveau.
- **Les tâches sont le chemin de contournement officiel** (c'est leur raison
  d'être : un bulletin PDF incorpore le salaire, champ privé). Le droit de
  déclencher une tâche et de lire son résultat est donc une **frontière de
  sécurité** : le catalogue de tâches porte ses propres règles d'accès.
- **Champs calculés** : un gabarit incorporant un champ privé exfiltrerait sa
  valeur → un champ calculé hérite du niveau **le plus restrictif** de ses
  sources, sauf déclaration explicite du technicien.

**Second axe (D26) : comptes et groupes.** Orthogonal au niveau : restriction
par compte nominatif ou groupe (comptable, administrateurs, …), défaut global.
Piste d'unification : **tout acteur est un compte appartenant à des groupes**,
y compris les consommateurs d'API (compte machine membre de « partenaires ») —
la restriction fonctionne alors identiquement sur tous les canaux, et rejoint
Q9 (enregistrement des consommateurs) et Q20 (synchronisation des groupes AD).
À trancher (Q22) : définitions des groupes et droits dans le **descriptif**
(versionnés), affectation des personnes dans les **données** ou déléguée à l'AD.

**Champs calculés (D21, précisés par D35–D36).** En lecture seule par nature —
pas d'inverse à déclarer. Insight unificateur : la valeur de substitution (D13)
est un champ calculé servi aux anciennes versions. Trois paliers :

1. **Enregistrement seul** (acté, D35) : gabarits + arithmétique simple —
   `{prenom} {nom}`, `{montant_ht} * (1 + {taux_tva})`.
2. **Traversée de référence** (acté, D35) : `{client.nom_complet}` — une
   jointure simple, très utile aux listes de l'interface générée. La validation
   détecte références cassées et cycles (un calcul peut traverser vers un champ
   lui-même calculé).
3. **Agrégats inter-entités** (acté en deux temps, D36) :
   - vocabulaire minimal pour commencer — `somme`, `compte`, `min`, `max`,
     `moyenne` sur une relation (ex. `somme(commandes.montant_ttc)`), calculés
     **à la volée** (acceptable sur les volumes D15) ; matérialisation =
     optimisation ultérieure guidée par la télémétrie ;
   - **hook de code personnalisé** pour tout le reste — 3e point d'extension du
     moteur (après connecteurs D23 et fournisseurs d'authentification D32).

**Contrat du hook** (à valider, Q26) — le code est opaque, donc tout ce que le
moteur déduisait des expressions doit être **déclaré** :

```yaml
score_fidelite:
  calcul_personnalise: "plugins/score_fidelite"
  sources: [commandes.montant_ttc, commandes.date]   # confidentialité héritée,
  type_resultat: nombre                              # invalidation, cycles
```

Le hook ne reçoit que ses `sources` déclarées (il ne fouille pas la base).
Règles d'exécution proposées : **fonction pure** (pas d'écriture ni d'appel
externe — les effets de bord sont le territoire des tâches D24) ; **délai
maximal** (au-delà, le champ s'affiche en erreur, pas l'écran) ; **déployé avec
la description** (même version, même validation, même dry-run — un hook qui
plante au dry-run bloque la migration). Licence : un hook chargé dans le moteur
est un travail dérivé AGPL s'il est *distribué* ; l'usage interne d'un client
reste libre — les extensions partagées retournent au commun (cohérent D19).

**Lecture et écriture (D22).** Accès unitaire, liste filtrée, intégralité
paginée ; écriture unitaire ou par lot. À trancher (Q19) : pagination par
curseur ou offset — avec la subtilité d'un parcours interrompu par une migration
à chaud (piste : le curseur porte la version de schéma, la chaîne de traduction
absorbe le changement) ; et sémantique des lots — tout-ou-rien ou **succès
partiel avec rapport par élément** (préférable face à des consommateurs non
maîtrisés, mais à rendre explicite dans le contrat).

**Connecteurs (D23).** Le moteur définit une **interface de connecteur**
(contrat de plugin) ; chaque système externe (AD, ERP, CRM…) a son
implémentation. Le descriptif déclare les instances et leur correspondance avec
les entités (« l'entité utilisateur se synchronise depuis l'AD »). À trancher
(Q20) : direction (import/export/bidirectionnel), déclenchement (planifié, à la
demande, au fil de l'eau), gestion des conflits (modification simultanée locale
et externe). Remarque : **Active Directory peut être à la fois source de données
et fournisseur d'authentification** — piste pour Q4.

**Tâches asynchrones (D24).** Déclenchement → `202 Accepted` + identifiant ;
suivi sur `taches/{id}` (en attente, en cours, progression, succès/échec avec
résultat). Pendant une bascule de migration (§4), la file de tâches est drainée
ou suspendue, comme les écritures. À trancher (Q21) : le **catalogue de tâches**
est-il déclaré dans le descriptif (cohérent avec l'architecture) ou apporté par
les connecteurs/plugins ? Notification de fin : consultation périodique seule,
ou aussi rappel sortant (webhook) ?

### 5.6 Identités et accès (D27–D29)

Découpage fidèle à toute l'architecture : **la structure dans la description, les
personnes dans les données.**

| Où ? | Quoi ? | Qui ? |
|---|---|---|
| **Description** (versionnée) | Définition des groupes ; confidentialité portée par les groupes ; compte administrateur d'amorçage (empreinte de mot de passe, D33) | Technicien |
| **Interface d'administration** | Comptes (techniques ou nominatifs, **étanches**) ; affectation aux groupes ; **association groupes AD/Entra ↔ groupes de la description (D31)** ; **paramétrage du connecteur d'authentification (D32)** | Administrateur |
| **Connecteur d'authentification** (local, AD, Entra, … — interface générique, D32) | Authentification SSO et livraison des groupes dans le jeton (JIT) | Synchronisation |

Conséquences consignées :

- **Les groupes sont soumis aux migrations.** Renommer un groupe = opération
  ordinaire (les affectations suivent). **Supprimer un groupe ayant des membres**
  exige une règle déclarative : réaffectation explicite (« les membres de X
  passent dans Y ») ou orphelinage assumé (Q25). Restreindre la visibilité portée
  par un groupe est une **migration de contrat** pour les consommateurs concernés
  — le mécanisme D13/D25 s'applique tel quel.
- **Étanchéité technique/nominatif** : la compromission d'un type de compte ne
  donne pas l'autre canal. Le compte technique porte naturellement **sa version
  d'API épinglée** (modèle Stripe — résout l'essentiel de Q9), ses groupes, donc
  tout son périmètre de visibilité.
- **Double source d'identité** : gestion locale universelle ; AD en
  provisionnement optionnel. À régler côté connecteur (Q20) : mode mixte
  (AD **et** comptes locaux chez un même client — stagiaire, externe ?) et
  variantes AD on-premise (LDAPS) vs Entra ID / Microsoft 365.
- **SSO pour les clients AD/Entra (D30–D32)** : provisionnement **à la première
  connexion** (JIT) — le compte nominatif naît au premier login, les groupes
  arrivent dans le jeton à chaque connexion (un retrait AD prend effet à la
  connexion suivante ; pas de synchronisation différée). L'**association**
  groupe de sécurité ↔ groupe de la description est **gérée dans l'interface**
  (D31). La **nature de l'authentification** (local, AD, Entra, …) est choisie à
  l'installation et reste **reparamétrable par un administrateur uniquement**
  (D32) — connecteurs derrière une interface générique. À régler au moment du
  connecteur : protocole (OpenID Connect via Entra ID/ADFS vs Kerberos/LDAPS
  on-premise) ; **rapprochement des comptes existants** lors d'un changement de
  fournisseur (par l'email, sous peine de doublons). Les comptes techniques
  d'API restent locaux dans tous les cas.
- **Amorçage (D33)** : la description contient un compte administrateur de
  secours, utilisable **uniquement si aucun administrateur n'existe dans
  l'interface** — inerte en régime normal, réactivé en situation de reprise.
  Sécurité : la description (fichier versionné) ne porte que l'**empreinte** du
  mot de passe, jamais le clair.
- **Suppression d'un groupe encore référencé (D34)** : note au technicien
  (notification ou journalisation) et groupe **ignoré**. Comportement fermé par
  défaut : un champ restreint au seul groupe supprimé devient invisible de tous
  (la donnée se protège, ne s'expose pas). À confirmer : si le groupe réapparaît
  dans une version ultérieure, les affectations conservées reprennent-elles vie
  (utile en retour arrière, surprenant si involontaire) ?

### 5.7 Versions de schéma ≠ versions de contrat d'API

Avec des migrations fréquentes (plusieurs par semaine), ne pas publier chaque
version de schéma aux tiers : distinguer les **versions de schéma** (internes,
nombreuses) des **versions de contrat d'API** (publiées, espacées). La chaîne de
traduction absorbe les versions intermédiaires sans les exposer.

---

## 6. Télémétrie (D14, D38–D41)

**Principe de cadrage (D14, affiné le 2026-06-12)** : la télémétrie ne **redouble
pas les journaux** ; tout indicateur doit servir l'une des **deux finalités**
retenues — (1) **suivre les usages réels**, (2) **évaluer le risque d'une
migration**. La finalité 2 n'est pas une collecte distincte : c'est une **vue
dérivée** de la finalité 1 (§6.3).

### 6.1 Trois grains de mesure (D38–D40)

| Grain | Mode | Ce qu'on mesure | Au service de |
|---|---|---|---|
| **Champ** (D38) | **À la volée** (aucun stockage) — tableau de bord dédié | **Diversité des valeurs** : un champ sans diversité ne porte probablement pas de sémantique → candidat au retrait | Simplification du schéma |
| **Entité** (D39) | **Stocké** | Compteurs d'usage **lecture/écriture** ; **historique d'évolution du schéma** | Enrichissement du schéma |
| **API & fonctions** (D40) | **Stocké / journalisé** | **Double usage** : usage réel (compteurs) **et identification des acteurs** (quel compte technique appelle quoi) | Dépréciation (§5.4), épinglage (Q9), gestion des intégrations |

**Indicateur de diversité (D38), pondéré pour éviter le faux positif :**
- un champ **récent** figé sur sa valeur par défaut est normal, pas suspect ;
- sur une entité **rarement modifiée**, attendre plus longtemps avant de conclure.
- Règle opérationnelle proposée (Q28) : *candidat au retrait si diversité ≈ 0 ET
  ancienneté > N × intervalle moyen de mise à jour de l'entité* — une entité
  active dénonce vite un champ inutile, une entité dormante laisse le bénéfice du
  doute.
- **Sans nouveau mécanisme** : la *date de création du champ* se dérive du
  **journal de migrations** (§3.2, qui est déjà l'historique du schéma) ; la
  *fréquence de mise à jour* est le compteur d'entité (D39). Les trois pièces
  s'emboîtent.
- Coût à surveiller : `COUNT(DISTINCT)` sur grosse table n'est pas gratuit —
  acceptable car tableau de bord ponctuel sur volumes TPE, échantillonnage
  possible ; sémantique dépendante de la persistance (D18).

**Acteurs des API (D40)** : ce sont des **comptes techniques** (D28), pas des
salariés → identifier « quel système appelle quelle fonction » relève de la
gestion d'intégrations, pas de la surveillance de personnes. RGPD léger ici, à
distinguer du journal côté interface.

### 6.2 Deux supports de stockage (D41)

1. **Données en base** : un objet `télémétrie` dédié, ou des indicateurs
   **attachés à une entité** (compteurs ; l'historique de schéma via le journal
   de migrations).
2. **Traces de journal** : **durée de conservation paramétrable**, puis
   **archivage à durée de vie maximale**. L'anonymisation n'est pas viscéralement
   nécessaire (acteurs API = comptes techniques ; côté interface = responsabilité
   du client, D16) mais une **option d'anonymisation** est prévue.

### 6.3 Finalité 2 — risque de migration (vue dérivée)

Assemblée pour le **rapport de dry-run** (§4.1) à partir de la finalité 1 :
intensité d'usage du champ/entité touché + acteurs API concernés + dépendances
(champs calculés, tâches). Pas de collecte nouvelle — une lecture croisée.

### 6.4 RGPD

- **Le client est responsable de traitement, pas l'éditeur** (instance déployée
  chez le client, D16). Syncytium *fournit la capacité* et les outils de
  conformité (conservation paramétrable, option d'anonymisation, archivage borné,
  export/effacement). La remontée agrégée vers l'éditeur (§7.2) est la seule où
  l'éditeur deviendrait (co)responsable → **opt-in strict**.
- Les indicateurs d'usage (champ, entité) sont **agrégés sur le schéma** et ne
  nomment personne ; l'identification d'acteurs ne porte que sur des **comptes
  techniques**. La dérive vers la surveillance des salariés est ainsi évitée par
  construction.

---

## 7. Dimensionnement, déploiement et distribution (D15–D18)

### 7.1 Dimensionnement (D15)

Cible TPE : ~20 utilisateurs simultanés, bases jusqu'à plusieurs Go, pas
d'exposition publique massive. Conséquences :

- **Architecture mono-serveur** : un processus applicatif, une base. Pas de
  répartition de charge ni de scalabilité horizontale — la sophistication se
  concentre sur les migrations, la traduction d'API et la télémétrie.
- **Migration directe systématique** : sur quelques Go, un éclatement de colonne se
  chiffre en secondes (au pire 1–2 min). Le gel des écritures mesuré par le dry-run
  (§4.3, niveaux 1–2) couvre la quasi-totalité des cas ; l'écran de maintenance
  reste l'exception. La migration en arrière-plan sort du périmètre.
- **Détection d'affluence et rafraîchissement d'interface triviaux** à cette
  échelle : suivi d'une vingtaine de sessions, notification du changement de
  version par SSE ou WebSocket.
- **Base de données : choix différé (D18)** — PostgreSQL, NoSQL ou autre. Ce report
  impose une **couche d'abstraction de la persistance** : migrations, traduction
  d'API et télémétrie parlent à une interface de stockage, jamais à une base
  directement. Critères d'évaluation déjà identifiés pour le moment venu :
  - migration **tout-ou-rien** (D9) — fort en SQL à DDL transactionnel
    (PostgreSQL), à vérifier soigneusement ailleurs ;
  - volumes de plusieurs Go, ~20 utilisateurs (D15) — peu discriminant ;
  - requêtage/filtrage riche pour l'interface générée ;
  - option à évaluer côté NoSQL documentaire : la **migration paresseuse**
    (transformation à la lecture, pas en masse) — séduisante pour le « à chaud »,
    mais en tension avec le dry-run exhaustif et l'état tout-ou-rien.
- **Télémétrie et RGPD (Q12)** : dans une TPE de 5 personnes, l'agrégation anonyme
  est illusoire. Assumer une télémétrie nominative encadrée (information des
  salariés, finalité déclarée) plutôt qu'une anonymisation de façade.

### 7.2 Modèle de distribution (D16, D17)

- **Une instance par TPE**, chacune avec sa propre description : isolation
  parfaite, migrations indépendantes, RGPD simple.
- **Moteur open source dans un repository public.** Deux canaux de mise à jour
  strictement séparés :
  - **la description** — déployée **à chaud** (cycle de vie du §4) ;
  - **le moteur** — **jamais automatique** : procédure de migration technique
    déclenchée sur sollicitation uniquement.
- **Parc hétérogène assumé** : des moteurs de versions différentes tourneront dans
  la nature, avec des descriptions écrites à des époques différentes. Le **format
  du descriptif devient lui-même un contrat versionné** entre moteur et
  descriptions — miroir exact de la problématique des API face aux consommateurs
  inconnus (§5) : versionnement, conversion, dépréciation annoncée s'y transposent.
  Un moteur vN doit charger (ou convertir via la procédure de migration technique)
  une description écrite pour vN-1.
- **Licence : AGPL (D19).** Toute personne qui modifie le moteur et le propose à
  des utilisateurs — y compris en tant que service en ligne (spécificité de l'AGPL
  vs GPL) — doit publier ses modifications sous la même licence. Le code ne peut
  jamais être capturé en version propriétaire. Nuance : l'usage commercial
  périphérique reste possible (intégration, hébergement facturés) — aucune licence
  open source ne peut l'interdire — mais personne ne peut en faire un produit
  fermé. Conséquences pratiques : **compatibilité AGPL exigée pour toutes les
  dépendances** (critère ajouté à Q7) ; gouvernance des contributions externes à
  définir (reliquat de Q15).
- **Discipline de versionnement sémantique et de notes de version** : les
  utilisateurs décident manuellement de mettre à jour — le changelog est leur
  outil d'évaluation du risque.
- **Télémétrie locale par instance** : au service du technicien du client. Une
  remontée agrégée vers l'éditeur serait techniquement possible mais strictement
  **opt-in**.

---

## 8. Extensibilité — hooks et plugins (D23, D32, D36–D37)

Le moteur est un **noyau déclaratif** entouré de points d'extension typés :
**connecteurs** vers les systèmes externes (D23), **fournisseurs
d'authentification** (D32), et **hooks** déclinés en trois modes (D37) couvrant
les trois couches de la vision initiale.

### 8.1 Cycle de vie commun à tous les hooks

Déclaré dans la description ; **déployé, versionné et validé avec elle** ;
soumis au dry-run (un hook qui plante bloque la migration, comme une regex qui
ne matche pas) ; **dérivé AGPL si distribué** — l'usage interne d'un client
reste libre (D19).

### 8.2 Les trois modes et leurs règles propres

| Mode | S'exécute où ? | Effets de bord | Voit quoi ? |
|---|---|---|---|
| **Calcul d'un champ** | Moteur (synchrone) | **Interdits** (fonction pure, délai maximal) | Ses `sources` déclarées, y compris `privee` — contrat détaillé au §5.5 |
| **Tâche** | Moteur (asynchrone, file D24) | **Autorisés** — sa raison d'être (PDF, mails, appels externes) | Champs `privee` inclus, selon ses règles d'accès (Q23) |
| **Comportement d'interface** | **Navigateur de l'utilisateur** | Présentation et interaction seulement | Uniquement le canal interface : `public` + `protegee`, **jamais `privee`**, filtré par les groupes de l'utilisateur |

Frontière structurante : **un calcul est pur, une tâche a des effets** — toute
extension qui veut « faire quelque chose » est une tâche, pas un calcul déguisé.

### 8.3 Spécificités du hook d'interface

- Langage imposé par le territoire d'exécution : **JavaScript** (indépendant du
  choix de pile du moteur, Q7).
- Confidentialité **structurellement** garantie : le canal interface ne livre
  jamais un champ `privee` au navigateur — pas besoin de faire confiance au code.
- **Périmètre exact à définir (Q27)** : rendu personnalisé d'un champ (jauge au
  lieu d'un nombre), validation de saisie enrichie, boutons d'action déclenchant
  des tâches, réorganisation d'écran ? Plus le périmètre est large, plus
  l'interface générée est personnalisable — mais plus on s'éloigne de la
  garantie qu'une description produit toujours une interface cohérente.

> **À l'agenda** : les hooks de **tâche** et d'**interface** feront l'objet d'une
> discussion dédiée — l'auteur a des précisions complémentaires à apporter,
> volontairement réservées pour un échange ultérieur. Les sections 8.2–8.4 posent
> le cadre proposé ; rien n'est figé sur ces deux modes tant que cette discussion
> n'a pas eu lieu.

### 8.4 Catalogue de tâches (résout la moitié de Q21)

Même schéma que le calcul personnalisé : **déclaration** dans la description
(nom, paramètres, règles d'accès, entités concernées), **implémentation** dans
le plugin déployé avec elle. Tâches intégrées au moteur (PDF, mails génériques)
et tâches apportées par hook coexistent dans le même catalogue, avec le même
suivi d'avancement (D24). Reste de Q21 : la notification de fin (consultation
seule ou webhook sortant).

---

## 9. Questions ouvertes

| # | Question | Enjeu |
|---|----------|-------|
| ~~Q1~~ | ~~Ordre de grandeur ?~~ | **Résolu (D15)** : ~20 utilisateurs simultanés, plusieurs Go → migration directe, mono-serveur, voir §7. |
| ~~Q2~~ | ~~Systèmes tiers : sous contrôle ou externes ?~~ | **Résolu (D11)** : non maîtrisés → compatibilité bidirectionnelle obligatoire, voir §5. |
| ~~Q3~~ | ~~Sens des intégrations ?~~ | **Résolu (D20–D24)** : les deux — exposition sélective avec champs calculés, lecture/écriture unitaire-liste-lot, connecteurs vers systèmes externes, tâches asynchrones suivies — voir §5.5. Détails ouverts : Q17–Q21. |
| ~~Q4~~ | ~~Contexte de déploiement, authentification ?~~ | **Résolu (D15–D16, D29)** : une instance par TPE, hébergement au choix du client ; authentification locale via l'interface (socle) ou provisionnée par AD (clients équipés). |
| Q5 | **Construire sur mesure ou s'appuyer sur un existant** (Directus, Strapi, …) ? | À trancher quand le besoin sera suffisamment cerné — la migration à chaud avec règles déclaratives **et la compatibilité d'API bidirectionnelle** sont les points les plus différenciants vs l'existant. |
| Q6 | Syntaxe exacte des règles d'éclatement (regex) et des tables de correspondance de fusion de valeurs. | Voir §3.2. |
| Q7 | Pile technique (langage, base de données, framework d'interface). | **Différé volontairement (D18)** — critères pour la base déjà consignés au §7.1 (transactionnalité D9 en tête) ; abstraction de la persistance imposée dès la conception ; **dépendances compatibles AGPL** (D19). |
| ~~Q8~~ | ~~Fenêtre de support : mécanisme ?~~ | **Résolu (D12)** : versionnement + dépréciation pour limiter les versions accessibles. Reste un paramètre à fixer : la **durée** des périodes de dépréciation. |
| Q9 | **Mécanisme d'épinglage** — largement résolu par D28 : chaque consommateur est un **compte technique** créé par l'administrateur, porteur naturel de sa version épinglée (modèle Stripe), de ses groupes et de son périmètre. Reste à confirmer : la version est-elle figée au compte, surchargée par en-tête, ou les deux ? | Conditionne la télémétrie par consommateur (§5.4). |
| ~~Q10~~ | ~~Politique pour les opérations avec perte ?~~ | **Résolu (D13)** : valeur de substitution pendant la dépréciation, suppression au terme — voir §5.3. |
| Q11 | **Cadence de publication des contrats d'API** vs versions de schéma internes (§5.5). | Équilibre entre fraîcheur des contrats et charge de maintenance des traductions. |
| ~~Q12~~ | ~~RGPD / forme de la télémétrie ?~~ | **Résolu (D38–D41, §6)** : usages agrégés sur le schéma (champ à la volée, entité stockée) ; acteurs identifiés uniquement sur les comptes techniques d'API ; journal à rétention paramétrable + option d'anonymisation ; client responsable de traitement. |
| Q13 | **Restitution de la télémétrie** au technicien : **tableau de bord dédié** acté pour le grain « champ » (D38). Reste : rapports périodiques ? alertes (plutôt sécurité) ? la restitution est-elle elle-même une solution Syncytium ? | Dépend du périmètre retenu ; à reprendre après Q12. |
| Q28 | **Seuil de l'indicateur de diversité** (D38) : formaliser la règle « diversité ≈ 0 ET ancienneté > N × intervalle moyen de mise à jour de l'entité » — valeur de N, gestion des entités dormantes. | Détermine la qualité des suggestions de simplification (faux positifs). |
| ~~Q14~~ | ~~Modèle de déploiement ?~~ | **Résolu (D16, D17)** : une instance par TPE, moteur public, mise à jour technique manuelle, description à chaud — voir §7.2. Reste implicite : **qui est le technicien** chez le client (intégrateur, personne ressource ?). |
| ~~Q15~~ | ~~Licence ?~~ | **Résolu (D19)** : AGPL. Reliquat **volontairement différé** : la contribution externe pourrait être autorisée, mais rien n'est décidé à ce stade — à trancher au plus tard à l'ouverture du repository. |
| Q16 | **Versionnement du format de descriptif** : politique de compatibilité moteur ↔ descriptions dans un parc hétérogène ; la procédure de migration technique inclut-elle la conversion des descriptions ? | Miroir de la problématique API (§5), transposée au contrat moteur/description — voir §7.2. |
| ~~Q17~~ | ~~Confidentialité : globale ou par profil ?~~ | **Résolu (D25, D26)** : trois niveaux emboîtés (public/protégée/privée) + restriction par compte ou groupe, défaut global — voir §5.5. Détails ouverts : Q22–Q23. |
| ~~Q18~~ | ~~Portée des champs calculés ?~~ | **Résolu (D35–D36)** : paliers 1+2 actés ; agrégats en vocabulaire minimal à la volée + hook de code personnalisé — voir §5.5. Modalités du hook : Q26. |
| Q19 | **Pagination** (curseur vs offset, comportement pendant une migration) et **sémantique des lots** (tout-ou-rien vs succès partiel avec rapport par élément) ? | Contrat explicite indispensable face à des consommateurs non maîtrisés. |
| Q20 | **Connecteurs** : direction (import/export/bidirectionnel), déclenchement (planifié, à la demande, fil de l'eau), gestion des conflits ? Pour l'identité (D29–D32) : **mode mixte** AD + comptes locaux ? protocole SSO (OpenID Connect via Entra ID/ADFS vs Kerberos/LDAPS on-premise) ? **rapprochement des comptes existants** lors d'un changement de fournisseur d'authentification ? | Architecture de plugins ; SSO, association des groupes (interface, D31) et reparamétrage admin (D32) actés — restent les modalités techniques. |
| Q21 | **Tâches** — catalogue résolu par D37 (déclaration dans la description, implémentation en plugin, voir §8.4). Reste : **notification de fin** par consultation seule ou aussi webhook sortant ? | Les webhooks sortants devraient eux aussi être versionnés (§5). |
| ~~Q22~~ | ~~Modèle de comptes et groupes ?~~ | **Résolu (D27–D29)** : groupes dans la description, comptes (techniques/nominatifs étanches) et affectations gérés par un administrateur via l'interface, AD en provisionnement optionnel — voir §5.6. |
| Q23 | **Frontières de sécurité dérivées** : règles d'accès du catalogue de tâches (déclenchement + lecture des résultats, qui véhiculent des champs privés) ; validation de l'héritage de confidentialité des champs calculés. | Les tâches et les calculs sont les deux chemins par lesquels une donnée privée peut sortir — à outiller dans la validation du descriptif. |
| ~~Q24~~ | ~~Amorçage de l'administration ?~~ | **Résolu (D33)** : compte administrateur + empreinte de mot de passe dans la description, utilisable seulement si aucun administrateur n'existe dans l'interface. |
| ~~Q25~~ | ~~Suppression d'un groupe ayant des membres ?~~ | **Résolu (D34)** : note au technicien et groupe ignoré (fermé par défaut). Reliquat : un groupe réapparaissant fait-il revivre les affectations conservées ? |
| Q26 | **Contrat des hooks** : validation des règles proposées (§5.5 pour le calcul, §8.2 pour le tableau des trois modes) — sources déclarées, pureté du calcul, délai maximal, dry-run avec la description. | **Discussion dédiée à venir** pour les modes tâche et interface — précisions de l'auteur attendues (voir encadré §8). |
| Q27 | **Périmètre du hook d'interface** : rendu personnalisé de champ, validation de saisie, boutons d'action (→ tâches), réorganisation d'écran ? | **Discussion dédiée à venir** — précisions de l'auteur attendues (voir encadré §8). Curseur entre personnalisation et garantie d'une interface cohérente (§8.3). |

---

## 10. Journal des échanges

- **2026-06-10** — Cadrage initial : architecture metadata-driven en trois couches ;
  descriptif géré par un technicien (D1, D2) ; mises à jour fréquentes → migration à
  chaud (D3) ; règles de transformation explicites — renommage, éclatement (regex),
  fusion (gabarit `{}`) (D4–D6) ; cycle de vie de migration avec dry-run, détection
  d'affluence et procédure de mise en attente/maintenance (D7–D9). Questions Q1–Q7
  ouvertes.
- **2026-06-10 (suite)** — Compatibilité d'API : interface graphique toujours sur la
  dernière version (D10) ; consommateurs non maîtrisés → compatibilité ascendante et
  descendante obligatoire (D11, résout Q2). Conception du §5 : chaîne de traduction
  bidirectionnelle fondée sur le journal de migrations (modèle Stripe), déclaration
  des inverses (éclatement ↔ fusion), politiques pour opérations avec perte,
  épinglage de version, télémétrie, en-têtes de dépréciation, distinction versions
  de schéma / versions de contrat. Nouvelles questions Q8–Q11.
- **2026-06-10 (suite 2)** — Trois précisions de l'auteur : versionnement d'API avec
  dépréciation pour limiter les versions accessibles (D12, résout Q8) ; migration
  autorisée sans inverse avec valeur de substitution pendant la dépréciation (D13,
  résout Q10, §5.3 réécrit) ; télémétrie indispensable à trois étages — API, objets,
  actions utilisateurs — pour piloter évolutions et simplifications (D14, nouveau
  §6, vigilance RGPD). Nouvelles questions Q12–Q13.
- **2026-06-10 (suite 3)** — Dimensionnement (D15, résout Q1) : cible TPE, ~20
  utilisateurs simultanés, bases jusqu'à plusieurs Go. Conséquences (§7) :
  mono-serveur, migration directe systématique, orientation PostgreSQL pour son DDL
  transactionnel (lié à D9), télémétrie nominative encadrée plutôt qu'anonymisation
  illusoire à cette échelle. Question majeure soulevée : une instance par TPE ou
  plateforme mutualisée, et qui est le technicien (Q14).
- **2026-06-10 (suite 4)** — Modèle de distribution (résout Q14) : une instance par
  TPE avec sa propre description (D16) ; moteur open source en repository public,
  mise à jour technique uniquement sur sollicitation via procédure de migration,
  seule la description se déploie à chaud (D17) ; choix de base différé — NoSQL,
  PostgreSQL ou autre (D18) → abstraction de la persistance imposée, orientation
  PostgreSQL retirée du §7 au profit de critères d'évaluation. Constats : le format
  de descriptif devient un second contrat versionné (miroir des API, parc
  hétérogène) ; télémétrie locale par instance, remontée éditeur opt-in seulement.
  Nouvelles questions Q15 (licence/gouvernance) et Q16 (versionnement du format de
  descriptif).
- **2026-06-10 (suite 5)** — Licence : AGPL (D19, résout Q15). Nuance consignée :
  l'AGPL garantit que le code reste un bien commun (toute modification, y compris
  servie en ligne, doit être republiée) mais n'interdit pas l'usage commercial
  périphérique — aucune licence open source ne le peut. Conséquences : dépendances
  compatibles AGPL (critère ajouté à Q7) ; gouvernance des contributions externes
  encore à définir (reliquat de Q15).
- **2026-06-10 (suite 6)** — Contributions externes : envisageables mais aucune
  décision prise — reliquat de Q15 volontairement différé, à trancher au plus tard
  à l'ouverture du repository.
- **2026-06-10 (suite 7)** — Surface fonctionnelle des API (résout Q3, D20–D24,
  nouveau §5.5) : exposition sélective par critères de confidentialité ; champs
  calculés (lecture seule — même mécanique que la substitution D13) ; lecture
  unitaire/liste/intégralité paginée et écriture unitaire/par lot ; connecteurs
  spécialisés vers systèmes externes (AD, ERP, CRM) — la solution consomme aussi ;
  tâches asynchrones déclenchées et suivies par API (PDF, mails), file drainée
  pendant les migrations. Nouvelles questions Q17–Q21 (profils de confidentialité,
  portée des calculs, pagination/lots, modalités des connecteurs, catalogue de
  tâches et webhooks).
- **2026-06-10 (suite 8)** — Confidentialité des champs (résout Q17, D25–D26) :
  trois niveaux en ordre emboîté — public (API+interface+tâches), protégée
  (interface+tâches), privée (tâches seules) ; cas « API sans interface » exclu →
  un seul attribut par champ. Second axe : restriction par compte ou groupe,
  défaut global. Effets de bord consignés : changer un niveau = migration de
  contrat (mécanisme D13 réutilisé) ; tâches et champs calculés = chemins de
  sortie des données privées → frontières de sécurité à valider (Q23) ; piste
  d'unification « tout acteur est un compte » (Q22).
- **2026-06-10 (suite 9)** — Identités et accès (résout Q22, Q4 ; D27–D29, nouveau
  §5.6) : groupes déclarés dans la description et porteurs de la confidentialité ;
  comptes techniques (API) et nominatifs (interface) strictement étanches ;
  provisionnement par AD pour les clients équipés, gestion locale via l'interface
  pour les autres ; l'administrateur crée les comptes et les affecte aux groupes.
  Conséquences : les groupes suivent les migrations (suppression avec membres →
  Q25) ; le compte technique porte l'épinglage de version d'API (Q9 quasi résolu) ;
  amorçage du groupe administrateurs à trancher (Q24) ; mode mixte AD+local et
  variante Entra ID ajoutés à Q20.
- **2026-06-11** — Clients AD : connexion SSO avec association groupe de sécurité
  AD ↔ groupe de la description (D30). Conséquences : provisionnement à la
  première connexion (JIT), groupes portés par le jeton à chaque login, pas de
  synchronisation différée ; étanchéité D28 préservée (comptes techniques
  toujours locaux). Restent dans Q20 : protocole (OIDC/ADFS vs Kerberos/LDAPS),
  emplacement de l'association (description vs configuration locale), mode mixte.
- **2026-06-11 (suite)** — Clôture du chantier identité (D31–D34, résout Q24 et
  Q25) : association groupes AD/Entra ↔ groupes gérée dans l'interface, comme les
  comptes (D31) ; nature de l'authentification choisie à l'installation (local,
  AD, Entra, …) via connecteurs derrière une interface générique, reparamétrable
  par un administrateur uniquement (D32) ; compte administrateur d'amorçage dans
  la description, actif seulement si aucun administrateur n'existe — empreinte de
  mot de passe, jamais le clair (D33) ; groupe supprimé : note au technicien et
  groupe ignoré, comportement fermé par défaut (D34). Points dérivés versés à
  Q20 : rapprochement des comptes lors d'un changement de fournisseur ;
  reliquat D34 : résurrection des affectations si un groupe réapparaît.
- **2026-06-11 (suite 2)** — Champs calculés (résout Q18, D35–D36) : paliers 1
  (enregistrement : gabarits + arithmétique) et 2 (traversée de référence) actés ;
  palier 3 (agrégats) en deux temps — vocabulaire minimal (somme, compte, min,
  max, moyenne) à la volée, puis hook de code personnalisé pour le reste. Le hook
  devient le 3e point d'extension du moteur ; contrat proposé : sources déclarées,
  fonction pure, délai maximal, déployé et validé avec la description, dérivé
  AGPL si distribué (Q26 pour validation).
- **2026-06-11 (suite 3)** — Généralisation du hook (D37, nouvelle section §8) :
  extension de type plugin déployée avec la description, en trois modes — calcul
  de champ (pur, synchrone), tâche (effets de bord autorisés, asynchrone),
  comportement d'interface (navigateur, jamais de champ privé — confidentialité
  structurelle). Cycle de vie commun : versionné, validé, dry-run, AGPL si
  distribué. Résout la moitié de Q21 (catalogue de tâches = déclaration dans la
  description + implémentation plugin). Nouvelle question Q27 (périmètre du hook
  d'interface).
- **2026-06-11 (suite 4)** — Les hooks de **tâche** et d'**interface** sont mis à
  l'agenda d'une discussion dédiée : l'auteur a des précisions complémentaires,
  réservées pour un échange ultérieur (encadré ajouté au §8 ; Q26 et Q27 en
  attente de cette discussion — le cadre des §8.2–8.4 reste une proposition non
  figée pour ces deux modes).
- **2026-06-11 (suite 5)** — Le projet a un nom et un foyer : **Syncytium**
  (dépôt <https://github.com/AymericLesert/Syncytium>). Le document de conception
  rejoint le dépôt en version canonique sous `docs/conception.md` ; l'ancienne
  copie de travail (`D:\Projets\Claude\conception-solution-metadata.md`) n'est
  plus maintenue.
- **2026-06-12** — Cadrage de la télémétrie (Q12–Q13, nouveaux §6.1 et §6.2).
  L'auteur resserre le besoin avant de figer : la télémétrie ne doit pas
  redoubler les journaux et doit servir deux finalités bornées — suivre les
  usages et évaluer le risque d'une migration (lien au dry-run §4.1). L'étage
  « actions utilisateurs » pourrait être réduit/reporté. Pistes d'analyse
  consignées (séparation des finalités, client responsable de traitement,
  restitution par tableau de bord/journal) mais Q12–Q13 restent ouvertes en
  attente de l'arbitrage de l'auteur.
- **2026-06-12 (suite)** — Modèle de télémétrie arrêté (résout Q12 ; D38–D41,
  §6 réécrit). Trois grains : **champ** mesuré à la volée via la **diversité des
  valeurs** pondérée par l'âge du champ et la fréquence de l'entité (D38) ;
  **entité** stockée — compteurs lecture/écriture + historique de schéma réutilisant
  le journal de migrations (D39) ; **API & fonctions** en double usage, usage réel
  + identification des acteurs (comptes techniques, RGPD léger) (D40). Deux
  supports : base (objet `télémétrie`) et journal à rétention paramétrable +
  archivage + option d'anonymisation (D41). Finalité 2 = vue dérivée pour le
  dry-run. Nouvelle question Q28 (seuil de l'indicateur de diversité) ; Q13
  (restitution) avance — tableau de bord dédié acté pour le grain champ.
