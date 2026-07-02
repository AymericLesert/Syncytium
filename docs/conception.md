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
| D42 | **Dimension temporelle** des compteurs (D39, D40) : seaux **journaliers** sur périodes glissantes, **agrégés** en semaine/mois/année avec l'âge (selon la profondeur de stockage). | Le *downsampling* sert aussi la rétention (D41 = granularité décroissante avec l'âge). Compteurs additifs → agrégation par somme ; la diversité (D38) reste à la volée car non additive. Alimente la détection de tendance dans le dry-run (§6.3). Voir §6.2. |
| D43 | **Cinquième canal — analyse de sécurité** (3e finalité) : alerter le client et/ou le technicien d'un **usage/accès non autorisé ou anormal** (pics de fréquence, tentatives d'accès refusées). | Vue dérivée du substrat (journal D41 + compteurs D42) ; impose de **journaliser les refus d'autorisation** ; D42 fournit la ligne de base des anomalies. Voir §6.4. |
| D44 | Les canaux de restitution forment une **solution intégrée** possédée par le moteur, bâtie sur le **méta-schéma** (Syncytium se décrit lui-même). | Résout Q13 (5 canaux, §6.5). Collecte = couche moteur (doit survivre à une description cassée) ; restitution = générée par la même machinerie (hérite groupes + API). Généralise D33 ; le méta-schéma **est** l'objet de Q16. |
| D45 | **Volet conseil de la synthèse périodique** : analyser les schémas d'appels d'API (D40) pour recommander des optimisations au consommateur (cache de requêtes déterministes, lecture par lot vs N+1) et faire **émerger de nouveaux besoins** (endpoint composite, agrégat, champ calculé). Consultatif, jamais coercitif. | Miroir côté API de D38 : la télémétrie pilote l'évolution sur les **deux faces** du moteur — interne (description) et externe (API). Le moteur peut fournir le mécanisme (`ETag`) en plus du conseil. RGPD léger (comptes techniques). Voir §6.5. |
| D46 | **Diversité représentative** (D38) : `valeurs distinctes non nulles / nombre de lignes de l'entité` (ratio de cardinalité). Ratio ≈ 0 → champ constant → candidat au **retrait**. | Lisible, peu coûteux. Voir §6.1. |
| D47 | **Modèle de risque d'anomalie de sécurité** (D43), multi-composantes : pente de régression (linéaire **et** log) au global **et** par endpoint ; croisée au **volume** ; **détecteur de pics** jugé par l'**étendue d'accès** (crawl) ; pente des refus = énumération. | Linéaire = croissance parfois légitime ; log = exponentiel dangereux. L'indicateur d'**étendue** est partagé avec D45 (crawl ≡ N+1, séparés par l'autorisation). Calibration → Q29. Voir §6.4. |
| D48 | **Diversité scalaire** (D38) : `valeurs distinctes / valeurs théoriquement possibles` (taille du domaine). Ratio faible → domaine surdimensionné → **resserrer le domaine/type** (≠ retirer). | Domaine borné requis (énum, booléen, numérique borné, chaîne formatée) ; indéfini pour types non bornés. Dérivé du type/contraintes déclarés. Voir §6.1. |
| D49 | **Seuils de télémétrie par champ, déclarés dans le schéma**. **Pas de défaut** : seuil absent = aucun contrôle (silence par défaut, signalement opt-in). | Résout Q28 — supprime les faux positifs par la connaissance métier déclarative ; ajoute un attribut au **méta-schéma** (D44). Le tableau de bord affiche toujours à la demande ; seul le flag automatique requiert un seuil. Voir §6.1. |
| D50 | **Seuils du modèle de risque de sécurité (D47) déclarés dans la description**, portés par les **endpoints**, **entités** et **fonctionnalités d'IHM**. | Généralise D49 : seuils de télémétrie = attribut déclaratif par élément du méta-schéma, tous types. Les fonctions d'IHM entrent dans le périmètre sécurité. Voir §6.4. |
| D51 | **Filet de sécurité (résout Q29)** : **seuils globaux par défaut** sur le modèle + **surcharge par élément**. Asymétrie voulue avec Q28 (sécurité : seuil absent = défaut global s'applique). **Défaut** : pente **normalisée** > 1 (= plus que doublé) sur la fenêtre, pour un volume > 1000 appels. | Une alerte de sécurité ne peut se taire (contrairement à une suggestion). Pente (forme) croisée au volume (poids) = conditions orthogonales. Écart type écarté (simplicité). Fenêtre glissante à définir. Voir §6.4. |
| D52 | **Mécanisme de hook uniforme interne/externe** : fonctions internes (livrées par Syncytium) et externes (modules du technicien) implémentent la **même interface commune** par mode et se branchent à l'identique. Syncytium fournit un **socle de hooks** enrichissable ; les built-in sont des **extensions de première partie**. | Sécurité uniforme (même frontière déclarée) ; built-in = implémentations de référence ; impose registre + namespacing et **versionnement des interfaces** (→ Q16). Régularité « mécanisme uniforme, distingué par la provenance » (cf. D28, D44) ; généralisable aux connecteurs/auth → modèle d'extension unique. Voir §8.0. |
| D53 | **Droits de tâche** : `declenche_par` ⊆ `resultat_lu_par` par construction ; `resultat_lu_par` ne déclare que les lecteurs **additionnels** (groupes statiques **ou principals contextuels** comme `employe_concerne`). La tâche s'exécute avec sa **propre portée `lecture:`** (élévation contrôlée, type SUID). | Qui déclenche peut lire (sinon absurde). Principal contextuel = **sécurité au niveau ligne** → généraliser (Q32). Voir §8.4. |
| D54 | **Cinq déclencheurs de tâche** : interface, API, planifié, **événement de données**, **enchaînement**. Tâche synchrone ou asynchrone, **toujours non bloquante avec progression** (le synchrone = posture d'IHM, pas un chemin séparé). | Toutes les tâches passent par la file ; progression par SSE/WebSocket. Voir §8.4. |
| D55 | **File d'attente** bornant la concurrence ; chaque tâche a un **état** + **progression** (compteur/total + message) ; **résultat enregistré** (trace + restitution sur demande dans la limite de `resultat_lu_par`), disponible une **durée déterminée**. | Affine D24. Voir §8.4. |
| D56 | **Interface de supervision des tâches** (solution intégrée, D44) pour l'administrateur : **annuler / reporter / reprioriser** ; **journal** des exécutions (succès / échec / exception). | Syncytium s'administre avec ses propres mécanismes (cf. restitution télémétrie). Voir §8.4. |
| D57 | **Exécution-once par défaut**, **pas de rollback** (effets irréversibles assumés : mail jamais rejoué), **pas d'auto-retry** — relance **manuelle** depuis la supervision. | Un échec transitoire attend une intervention humaine (acceptable TPE). Voir §8.4. |
| D58 | **Anti-abus des tâches API** : une exécution par **période** (à définir), mesurée **de la fin de l'exécution au début de l'appel suivant** ; rappel pendant la période **refusé** (non enregistré). **Granularité (résout Q31) : par tâche + paramètres.** | Interdit recouvrement + impose intervalle minimal ; protège le hook comme point d'attaque. Voir §8.4. |
| D59 | **Option `deterministe`** : si déterministe, un doublon (même tâche + paramètres) dans la **fenêtre de déterminisme** rend le **résultat mémorisé** sans ré-exécuter (≠ rétention) ; sinon le cooldown (D58) refuse. | Mémoïsation = résout l'idempotence (D57) sans effet de bord répété ; pendant serveur de D45. Déterminisme = assertion du technicien (fenêtre = borne de volatilité). Voir §8.4. |
| D60 | **Réinitialisation du déterminisme** dans la supervision (D56) : l'administrateur **invalide le cache** d'une tâche — sans exécuter ; le **prochain appel** ré-exécute. **Granularité à trois niveaux** : tâche+paramètres, tâche entière, ou tout. | Soupape quand la réalité contredit l'assertion D59. Distinct de la relance (D57, exécute maintenant). Nouvel `ETag` → resync des caches clients (D45). Voir §8.4. |
| D61 | **Contrôles globaux de la file** (frein d'urgence) : **tout annuler / tout mettre en pause / tout relancer**. | Même primitif que le drainage de migration (D24/D54), exposé à la demande. Caveat D57 : la pause arrête le démarrage, n'annule pas les effets en cours. Voir §8.4. |
| D62 | **Audit des actions de supervision** : chaque action (surtout globale) est journalisée avec un **motif** (catégorie + note libre : blocage, anomalie, mise à jour…). | Journal d'audit nominatif (D41, finalité sécurité) : qui/quoi/quand/pourquoi. Catégorie → filtrage/alerte. Voir §8.4. |
| D63 | **Couche thème** : couleurs, polices, styles personnalisables par le technicien, par-dessus le rendu par défaut. | Couche de marque, sans logique, faible risque. Voir §8.3. |
| D64 | **Bibliothèque de composants par défaut**, riche et curée, pilotée par `type → composant` (table, liste déroulante sur énuméré et référence, vignettes, graphiques, dates, dashboard, planning…). | Écrans sensés sans code → construction rapide (promesse fondatrice). Voir §8.3. |
| D65 | **Surcharge `champ → composant`** ; built-in et custom partagent la **même interface de composant** (rendu + usage : types acceptés, config, points d'extension). | D52 appliqué à l'IHM. Voir §8.3. |
| D66 | **Injection comportementale** (filtres métier, affichage conditionnel, post-validation) aux points d'extension ; **dogfoodée** (built-in et technicien, même API). | **UX seulement, jamais la sécurité** (serveur D25 arbitre) ; effets délégués aux tâches (D54). Voir §8.3. |
| D67 | **Surcharge des composants internes non supportée** : on remplace par interface (D65) ou on injecte (D66), jamais on ne patche les internes. | Compat ascendante (parc hétérogène §7.2 transposé à l'IHM). Voir §8.3. |
| D68 | **Bibliothèque ouverte** : le technicien **enrichit** le registre de composants ; un composant ajouté (même interface, D65) est de première classe — mappable en **défaut de type** ou en surcharge de champ. | Registre namespacé (D52) ; composants partageables (AGPL) → écosystème. Dégradation : repli sur le built-in par défaut si un custom échoue. Voir §8.3. |
| D69 | **Modèle de composant déclaratif** (à la Webix) : un composant est une fonction pure `config → description de rendu`, le **moteur réalise le HTML**. | **Résout le bac à sable de Q27** par construction (pas d'accès DOM ; CSP + Worker ; iframe en échappatoire). **Technologie de rendu = choix d'implémentation interchangeable** ; descriptions tech-agnostiques et pérennes. Parallèle à D18 : Syncytium tech-agnostique aux deux bouts (données + IHM). Prix : vocabulaire de rendu à rendre assez riche. Voir §8.3. |
| D70 | **Dimension d'audience** dans le modèle d'accès : **interne** (collaborateurs → groupes + niveaux) vs **externe** (clients → accès au niveau ligne, fermé par défaut). | Ouverture des données aux clients (portail). Étend §5.6. Voir §5.7. |
| D71 | **Modèle d'appartenance** (audience externe) : **directe** (champ réf-compte), **indirecte** (chemin multi-saut `commande.client.compte`), **ouvert à tous les clients** (catalogues), ou **non exposé** (défaut, fail-closed). Propriétaires/chemins multiples → union ; ligne sans propriétaire → invisible. | Résout Q32 (cœur). Provisionnement des comptes clients → Q33. Voir §5.7. |
| D72 | **Orthogonalité ligne × champ** : sur une ligne visible par un client, les **champs internes TPE restent masqués** (niveau/groupe/audience s'appliquent). | Deux axes indépendants. Voir §5.7. |
| D73 | **Lecture/écriture par appartenance** : déclarables séparément **par champ** ; invariant **write ⊆ read**. | Tout modifiable est visualisable, l'inverse non. Voir §5.7. |
| D74 | **Combinaison OU seulement** (union d'octrois) ; AND/NON/XOR **différés**. | Simplicité ; rationale conservée (comme l'écart-type D47). Voir §5.7. |
| D75 | **Filtrage serveur + identifiants contextuels** : id **non devinables** côté client (anti-IDOR), **re-contrôle d'appartenance à chaque accès direct**, option **aliasing par contexte**. | Le serveur ne se fie jamais à la possession d'un id. Impose un filtrage au niveau ligne dans l'abstraction de persistance (D18). Voir §5.7. |
| D76 | **Impersonation & délégation** : admin **« agir en tant que »** sur toutes les strates avec **audit double identité** (effectif + origine) + motif (D62) ; compte technique **« pour le compte de »** un nominatif/client (OAuth on-behalf-of) → API bornée au périmètre ligne et attribuable. | Tests/délégations ; renforce la sécurité sur données sensibles (vigilance RGPD). Voir §5.7. |
| D77 | **Typologie de comptes (résout Q33)** : (1) **technique** (API), (2) **utilisateur** interne (groupes), (3) **client** issu d'une fiche client (provisionné par l'ADV), (4) **client auto-créé** (self-service, toujours vérifié par les ventes — dérivé de (3), **non prioritaire**). | Généralise D28. Le type 3 concrétise l'appartenance D71 (le `compte` = la fiche client). Étanchéité par canal ; le compte client suit le cycle de vie de sa fiche. Voir §5.6. |
| D78 | **Connecteur d'identité = cadre générique** : identification simple, SSO, autorisations AD/Entra en sont des **déclinaisons** ; défaut **login/mot de passe** ; **ouvert au technicien** (connecteur propre). | Protocole = détail d'implémentation (tech-agnostique, cf. D18/D69) ; couvre authn + autorisation (groupes). Voir §5.5. |
| D79 | **Connecteur de données = composant de translation** entre données externes et modèle du moteur (couche anti-corruption). | La **translation déclarative** est un **primitif transverse** (migrations §3.2, compat d'API §5.1, connecteurs) → réutilise le vocabulaire D4–D6 ; direction = sens de la translation. Renforce Q6. Voir §5.5. |
| D80 | **Source d'identité unique** (pas de mode mixte) + **changement gardé** : validation préalable (auth de test réussie) avant bascule ; repli rapide ; échec → on reste sur l'ancienne. | Simplicité ; couvre le risque de verrouillage. Voir §5.6. |
| D81 | **Secours « bris de glace »** (étend D33) : le compte de secours s'active aussi quand l'**authentification est indisponible** (santé du connecteur actif) ; indépendant de tout connecteur externe ; activation **auditée (D62) + alertée (D43)**. | Évite tout verrouillage total ; événement de sécurité fort. Voir §5.6. |
| D82 | **Identité interne = UUID stable** (ancre : appartenance D71, audit, références) ; **clé d'unicité définie par le connecteur** (rapprochement externe → UUID), variable par connecteur/TPE (GUID Entra/AD + courriel ; courriel/login local). | Clé immuable en priorité (email mutable → repli) ; opération admin de re-liaison/fusion ; cohérent id opaques D75 ; clé d'unicité = propriété du contrat connecteur (D78). Résout le rapprochement des comptes. Voir §5.6. |
| D83 | **Connecteur de données auto-descriptif** : il porte la **description de son propre modèle** (entités/champs) ; Syncytium **mappe** ses entités dessus (confidentialité D25). | Visualiser une structure externe (AD/CRM) par simple déclaration — méta-schéma appliqué aux connecteurs. Voir §5.5. |
| D84 | **Entité persistée vs virtuelle** : persistée (stockage DB, défaut) ou **virtuelle** (sans stockage propre, sourcée de connecteur(s), en cache/mémoire) ; **multi-occurrences** (DB + connecteurs). | Migrations (D4–D6) et diversité (D46) ne valent que pour le persisté. Voir §5.5. |
| D85 | **Écriture : DB synchrone, connecteurs asynchrones** via la **file de tâches** (D54–D58). | Découplage/résilience : ne bloque pas l'enregistrement. Résiduel : reprise = *cohérence à terme* (≠ at-most-once des tâches D57). Voir §5.5. |
| D86 | **Cache de lecture des connecteurs** à durée configurable. | Limite les opérations sur le connecteur ; même esprit que la mémoïsation D59. Voir §5.5. |
| D87 | **Écriture connecteur = tâche** (non transactionnelle, D57) ; **reprise gérée dans la tâche** (opt-in, idempotence requise). Anomalie : **trace technicien** + **notification au déclencheur via son canal** (in-app si interface, webhook si API). | Garde le moteur simple (au plus une fois) ; complexité de reprise dans la tâche. **Résout Q21** (notification de fin) et le résiduel de reprise de D85. Voir §8.4. |
| D88 | **Droit de relance selon la nature de la tâche** (déclaré, distinct de la notification) : tâche **explicite** → **déclencheur** (sous conditions : échec terminal, idempotence/déterminisme) ; tâche de **propagation connecteur** → **admin seulement**, relance = **re-propagation de l'état courant** (pas rejeu du payload périmé ; idempotence/upsert à la charge de la tâche). | Relancer une propagation à l'aveugle = double-écriture / données périmées. Voir §8.4. |
| D89 | **Conflits bidirectionnels portés par le connecteur** (clôt Q20), pas par le moteur. **Exigence** : le connecteur **doit** remonter ses conflits via le canal d'anomalie (D87) — jamais silencieux. | *Moteur = cadre, extension = sémantique métier* (cf. D79, D87). *Résolution = connecteur, visibilité = garantie par le cadre.* Voir §5.5. |
| D90 | **Langage d'expression unique** (résout Q6) partagé par calculs (D35–D36), migrations (§3.2), API (§5.1), connecteurs (D79) : gabarit `{}`, regex (groupes nommés), **transcodage** (constante ou lookup table/entité + défaut), arithmétique, **agrégats ensemblistes** (D36), **composable/imbriquable** ; hook (D36) = échappatoire. | Aboutissement du primitif de translation transverse ; pilier du méta-schéma. Voir §3.3. |
| D91 | **Réversibilité = propriété déclarée, assurée par le technicien** (non garantie par le langage). 3 cas : auto-inversible (renommer, éclater↔fusionner → moteur) ; inversible non dérivable (**technicien déclare la règle inverse**) ; à perte (**technicien déclare une substitution D13**). Validation §5.2 par règle/version d'API. | Le moteur n'auto-inverse que le trivial ; le reste est déclaré. Migration jamais bloquée ni silencieusement à perte. Voir §3.3. |
| D92 | **Langage multi-valué** : une expression retourne un **enregistrement de valeurs nommées** (généralisation des groupes regex), pas une seule valeur. Une transformation = mapping **`entrées nommées → sorties nommées`** ; renommer/éclater/fusionner = patrons de ce mapping. | Simplifie le méta-schéma (un seul concept) ; vaut pour regex/gabarit/transcodage/hooks/calculs ; inverse = symétrie 1→N ↔ N→1. Voir §3.3. |
| D93 | **Estampille de version interne dans la base** (paramètres moteur, non éditables par le technicien), sur **deux axes** : version de **description** (schéma métier) + version de **moteur/format**. Contrôle de cohérence **fail-closed** au démarrage : cohérent → sert ; données en retard → **migration (§4)** ; données en avance (moteur plus ancien) → **refus** ; estampille absente/corrompue → init ou refus. | Résout le résiduel de Q40 (cohérence donnée↔version que le SGBD ignore). C'est aussi la **source de vérité de « la version courante »** lue par le cycle de migration (§3.2/§4). Relie restauration, migrations et parc hétérogène (§7.2). |
| D94 | **Dépréciation par version minimale supportée (résout Q8)** : la description déclare une **version minimale supportée** (pas une durée) ; un appel API sous ce seuil reçoit **426 Upgrade Required**. | Seuil de version explicite, rythme au technicien (cf. D12). 426 = code standard adapté (419 écarté : non normalisé, « page expirée »). |
| D95 | **« Technicien » = un rôle moteur de Syncytium (résout Q14)** : rôle **associé au moteur**, **paramétrable et affectable à une ou plusieurs personnes physiques** — le responsable technique de la solution déployée (éditeur, intégrateur, adopteur compétent), distinct des utilisateurs finaux. | Introduit les **rôles moteur intégrés** (technicien ; déjà administrateurs D33), réutilisables — cohérent avec les solutions intégrées (D44). Apport au méta-schéma. |
| D96 | **Résurrection des affectations (résout Q25)** : les groupes s'appuient sur un **identifiant indépendant du libellé** = la clé de stabilité ; si un groupe supprimé **réapparaît** (même identifiant), les affectations conservées **reprennent vie**. | Résilience aux suppressions par inadvertance (ajustements de sécurité SI). Cohérent avec D34 (affectations conservées, non purgées ; notification). |
| D97 | **Défauts de calibration du modèle de risque (clôt Q29)** — paramètres **ajustables à l'initialisation de l'instance** : fenêtre glissante **30 jours** (unité = jour) ; échelle **linéaire par défaut**, **log sur demande** ; pic = **z-score ≥ 3** + **plancher 100 appels/jour** ; crawl = **> 50 %** d'une table de **> 1000 lignes** ; **R² ≥ 0,5** (valide la pente ; un R² faible = pas de tendance nette, les pics restant couverts par le z-score). | Patron uniforme *forme × poids* (seuil statistique + plancher absolu) ; tous explicables en une phrase. Complète D47/D50/D51. |
| D98 | **Épinglage de version (résout Q9)** : version **épinglée au compte technique** (socle) + **surcharge par en-tête** pour tester la version suivante avant bascule. Garde-fous : pas de version non publiée (D99) ni sous la minimale (D94 → 426) ; bascule d'épinglage = acte d'administration tracé. | Duo Stripe : robustesse par défaut + chemin de migration. Voir §5.8. |
| D99 | **Versions autorisées = versions publiées (résout Q11)** : publication = **acte déclaratif** du technicien, sans cadence imposée ; certaines versions ne sont **jamais publiées** (bêtas, bugs, fonctionnalités abandonnées) mais restent des **maillons internes** de la chaîne de traduction ; publication **révocable** (retrait → 426). | Fenêtre de support = [version minimale D94 … dernier contrat publié]. Voir §5.8. |
| D100 | **Pagination par curseur opaque (résout Q19-pagination)**, **porté par la mécanique** (le moteur le gère, pas le développeur) ; le curseur **embarque la version de schéma** (survit aux migrations à chaud via la chaîne de traduction) ; l'IHM générée consomme le même mécanisme. | Stable, performant, cohérent avec les id opaques (D75). Voir §5.5. |
| D101 | **Lots = lots de transactions (résout Q19-lots)** : un lot contient des **transactions** (1 niveau de récursivité) — chaque transaction **atomique**, le lot **continue** sur échec d'une transaction, **remontée par transaction**. Ligne-à-ligne et tout-ou-rien = **cas dégénérés**. **L'atomicité appartient au modèle** : la description déclare les **agrégats** (commande + lignes = indivisible par défaut) ; raffinement (ligne seule) **seulement si le modèle l'autorise** ; l'appelant **compose vers le haut** (une commande ou un ensemble de commandes par transaction), jamais en dessous du plancher. | Échelle : ligne (si autorisée) ⊂ agrégat (plancher déclaré) ⊂ transaction (appelant) ⊂ lot. Un seul concept (esprit D92). Agrégats détaillés au modèle de données (Q35, composition). Voir §5.5. |
| D102 | **Héritage de confidentialité des champs calculés (résout Q23)** : niveau **le plus restrictif des sources** par défaut (fail-closed, y compris via relations et `sources` des hooks) ; **abaissement explicite obligatoire**, signalé par la validation (jamais silencieux). | La sécurité niveau ligne (D70–D77) s'applique indépendamment (orthogonalité D72). Esprit `rupture_assumee` (D13). |
| D103 | **Cycle de vie des versions (précise D99)** — quatre états : **publiée officielle** (appelable, épinglable), **publiée bêta** (sollicitation explicite par en-tête D98 seulement, non épinglable), **interdite** (426), **dépréciée** (426, sous D94). **L'enchaînement des versions est indépendant de la publication** : la chaîne de traduction traverse toutes les versions (journal de migrations = colonne vertébrale). | *L'état gouverne l'appelabilité, jamais la traversabilité.* La bêta s'emboîte avec le mécanisme d'essai D98. Voir §5.8. |
| D104 | **Garde-fous d'exécution (résout Q43)** : **pas de timeout sur les fonctions « simples »** du langage ; **timeout paramétrable sur les fonctions « complexes »** — classification portée par le **catalogue de fonctions** (méta-schéma). Gardes existants inchangés (D36 hooks, D55 heartbeat des tâches, D69 IHM, D7 dry-run). | Les fonctions sont implémentées par le concepteur de Syncytium → risque non uniforme ; zéro surcoût sur le chemin chaud. Voir §3.3. |
| D105 | **Rate limiting global** : **15 req/sec** en défaut global d'instance, **surcharge par compte technique** (interface d'administration, comme la version épinglée D98) ; réponse **429 + `Retry-After`**. | Fusible de disponibilité **externe** du mono-serveur (pendant du fusible interne D104) ; distinct du cooldown par tâche (D58) et de la détection a posteriori (D43/D47). Voir §5.8. |
| D106 | **Déclencheur « apparition de fichier »** (étend l'événement de D54) : **dossier surveillé + pattern défini** ; à l'arrivée d'un fichier conforme, la tâche se déclenche, **le fichier = son entrée**. | Patron *hot folder* (scanner→PDF, export→CSV), très TPE. Pattern = vocabulaire du langage ; attendre l'écriture complète du fichier. Voir §8.4. |
| D107 | **Authentification des comptes techniques (clôt Q44)** : **clé API rotative** par défaut (2 clés actives pendant rotation) ; **« pour le compte de » par header dédié** (périmètre de délégation D76) ; **OAuth2 + Token Exchange RFC 8693 en déclinaison** (cadre D78) — le jeton porte alors le sujet. | Même sémantique D76 (borné au périmètre ligne du sujet, attribuable) quel que soit le véhicule. Simple par défaut, standard en option. Voir §5.8. |
| D108 | **Canaux de notification = connecteurs** (built-in + hooks du technicien, D52). *« Le connecteur est le vecteur, la configuration porte le contenant »* : **modèles de messages = paramètres du connecteur** (gabarits D90 : titre, destinataire, contenu, pièces jointes). | Résout Q46 (canaux + templates). Voir §8.5. |
| D109 | **Canaux autorisés déclarés dans la description** ; l'utilisateur **choisit via son profil** parmi les canaux qui lui sont autorisés. | Double gouvernance (le modèle borne, l'utilisateur choisit). Voir §8.5. |
| D110 | **Notification persistée d'abord (entité du méta-modèle), puis remise** (patron **outbox**) : remise externe = tâche de propagation (D85/D87), **livraison garantie** (jamais perdue, au pire en attente, visible en supervision D56) ; **historique conservé** avec rétention à durée max (patron D41/D55). | In-app = lecture du magasin ; confidentialité automatique (appartenance D71). Clôt Q46. Voir §8.5. |
| D111 | **Concurrence état-avant/état-après (résout Q41)** — mécanisme **unique IHM+API**, **compare-and-swap par champ** : modification (avant≠après) autorisée **ssi valeur-avant = valeur en base** ; champs inchangés ni écrits ni contrôlés (→ fusion des disjoints) ; même champ = conflit (409 + détail), **un conflit rejette l'agrégat** (D101), contrainte cassée = conflit ; création → premier gagne (409) ; suppression première → modification rejetée (410 Gone). | Fusion par champ ; diff journalisable (pont Q37) ; **ABA bénin par construction** (modèle par valeurs — chaque transition validée, l'historique relève de l'audit) ; ETag D45 = cache lecture ; SSE = désamorçage amont. Voir §5.5. |
| D112 | **Multi-environnements (résout Q42)** : production (dernière version publiée) + **un staging par version bêta, instancié à la volée** (copie prod → **migration** D4–D9 vers la bêta) ; **API bêta (D103) redirigées** vers le staging ; à la validation → staging **supprimé**, production migrée (§4). | Le dry-run rendu durable et navigable ; migration répétée 2× avant la vraie bascule. Raffine D16 (une instance *de production* + éphémères/passive). RGPD : éphémérité + accès restreint. Voir §7.3. |
| D113 | **Synchronisation prod → staging**, deux modes : **synchrone** (chaque écriture reportée, **traduite via la chaîne de versions** §5.1 — les instances sont à des versions différentes) ; **différé** (recréation sur sollicitation, fréquence à définir). | **4ᵉ usage du primitif de translation** (migrations, API, connecteurs, réplication inter-versions). Voir §7.3. |
| D114 | **PCA/PRA** : le même mécanisme de synchronisation entre **deux instances de production de même version** (active/passive) ; **bascule manuelle par le client** en cas de coupure. | Réplication **tech-agnostique** (niveau Syncytium, indépendante du SGBD — D18) ; cohérence à la bascule via l'estampille D93. Voir §7.3. |
| D115 | **Hiérarchie des structures** : **instance (1) → schéma (1) → modules (1..n) → entités (1..n) → champs**. Le schéma est la **racine unique versionnée** ; le **module** est le niveau d'organisation nouveau (rôles 1–6 en arbitrage — §3.2b). | « Une instance organise UN schéma » confirme D16. Voir §3.2b. |
| D116 | **Versionnement uniquement au niveau instance** (= son schéma, une seule horloge — pas de version par module/entité/champ) ; **composition intra-module** (l'agrégat D101 ne franchit pas le module = frontière de cohérence forte) ; **associations inter-modules libres**. | Distinction fondatrice pour Q35 : **composition** (possession forte, transactionnelle) vs **association** (lien souple). Estampille D93 inchangée. Voir §3.2b. |
| D117 | **Six rôles du module** : (1) espace de noms (`module.entite.champ`) ; (2) unité de **navigation IHM** ; (3) unité d'**activation** par instance (écrans/API masqués, données conservées) ; (4) **frontière d'accès** (module entier → groupe) ; (5) unité de **partage** inter-TPE (import = migration ordinaire) ; (6) **modules moteur** (solutions intégrées D44) vs modules métier. | Le module répond en partie à Q48 (navigation) ; l'écosystème gagne son objet d'échange (rôle 5, AGPL D19) ; motif D52 (provenance) pour le rôle 6. Voir §3.2b. |
| D118 | **Champ = donnée atomique**, **simple** (type de base + propriétés de stockage : taille, octets, précision, décimal avant/après virgule + limites de valeurs) ou **composée** (raffinement déclaratif : `montant` = décimal+devise, `email` = texte+format). Bibliothèque de composés **livrée + enrichissable** (D52/D68). | Types simples actés : texte, entier, réel, booléen, date-heure, fichier, énuméré. Voir §3.4. |
| D119 | **Quatre facettes par type** : **logique** (canonique — langage/calculs), **stockage** (propriétés ou mapping custom), **affichage** (IHM/i18n), **API** (sérialisation). **Extension par hook** = paire de fonctions pures `vers_stockage`/`depuis_stockage` (ex. date Cegid PMI : entier `AAAAMMJJ` ↔ date). | L'anti-corruption au niveau du type, au service des connecteurs (D79/D83). Voir §3.4. |
| D120 | **Règles de conversion portées par les types** — graphe de conversion à trois classes : **sûre** (implicite, automatique aux frontières), **explicite** (paramétrée/à perte, invoquée dans une expression), **faillible** (parsing/format, échec propre). | Unifie : **valider un composé = conversion faillible depuis sa base** ; frontières API/IHM/connecteurs systématiques ; pas de coercition silencieuse (règle en principe la coercition de Q47). Voir §3.4. |

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

### 3.2b Hiérarchie des structures de données (D115)

```
Instance (1) ── organise ──► Schéma (1)
Schéma ──── organise ──► Module (1..n)
Module ──── organise ──► Entité (1..n)
Entité ──── regroupe ──► Champ (1..n)
```

- **Une instance organise UN schéma** (singulier) : confirme D16 — le schéma
  **est** la description, racine unique versionnée (estampille D93, journal de
  migrations §3.2).
- **Le module** : niveau d'organisation entre schéma et entités — **six rôles
  actés (D117)** :
  1. **Espace de noms** : `ventes.commande` ; les chemins deviennent
     `module.entite.champ` (noms courts à l'intérieur d'un module, qualifiés
     au-delà) ;
  2. **Unité de navigation IHM** : le menu généré s'organise par modules
     (répond en partie à Q48) ;
  3. **Unité d'activation** : un module peut être activé/désactivé par instance
     — ses écrans et API disparaissent, ses données demeurent (fail-closed) ;
  4. **Frontière d'accès** : un groupe peut recevoir l'accès à un module entier
     (raccourci de confidentialité, se combine avec D25/D26) ;
  5. **Unité de partage** : modules métier **réutilisables entre TPE**
     (description partielle + hooks/composants associés, AGPL si distribués
     D19) ; l'import d'un module = fusion dans le schéma → **une migration
     ordinaire** (§4) ; collisions évitées par l'espace de noms (rôle 1) ;
  6. **Modules moteur vs métier** : les **solutions intégrées (D44)** —
     administration, supervision, télémétrie, notifications — sont des
     **modules moteur** (non éditables), à côté des modules métier du
     technicien — motif « uniforme, distingué par la provenance » (D52).

**Versionnement et frontières du module (D116) :**
- **Le versionnement porte uniquement sur l'instance** — un seul numéro pour
  tout l'arbre, pas de déclinaison par module/entité/champ. La version de
  l'instance = celle de son schéma (1:1, D115), portée par l'estampille D93.
  Une seule horloge → chaîne de traduction et compatibilité simples.
- **Composition intra-module** : l'agrégat (D101) ne franchit jamais la
  frontière d'un module — le module est la **frontière de cohérence forte**.
- **Associations inter-modules libres** : une référence peut traverser les
  modules (`ventes.commande` → `catalogue.article`).
- Première distinction du modèle relationnel (fondation de Q35) :
  **composition** (possession forte, unité transactionnelle, intra-module) vs
  **association** (lien souple, libre).

### 3.3 Langage d'expression unique (D90–D91, résout Q6)

**Un seul langage d'expression** pour tout le système (D90), partagé par :
**champs calculés** (D35–D36), **migrations** (§3.2), **compat d'API** (§5.1),
**translation des connecteurs** (D79). Aboutissement du principe *la translation
déclarative est un primitif transverse*.

**Composants :**
- **gabarit** `{champ}` (interpolation/fusion) ;
- **regex** avec **groupes nommés** (extraction/éclatement) :
  `(?<cp>\d{5})\s+(?<ville>.+)` ;
- **transcodage** (table) — cible **constante** (`particulier → B2C`) ou
  **lookup dans une table/entité de référence** ; défaut pour valeurs non prévues ;
- **arithmétique** simple ;
- **fonctions ensemblistes / agrégats** sur les listes inhérentes à
  l'enregistrement (`somme`, `compte`, `min`, `max`, `moyenne` — D36) ;
- **composable / imbriquable** : un transcodage peut combiner regex + gabarit +
  un autre transcodage — l'imbrication multiplie l'expressivité sans alourdir le
  vocabulaire ;
- **échappatoire** : hook de calcul (D36) pour tout ce qui dépasse.

**Réversibilité = propriété déclarée, assurée par le technicien (D91).** Elle
n'est **pas garantie** par le langage ; le moteur n'auto-inverse que le trivial.
Trois cas, responsabilité croissante :
1. **Auto-inversible** (renommer, éclater↔fusionner) → le **moteur** dérive
   l'inverse — seul cas « gratuit » ;
2. **Inversible mais non dérivable** → le **technicien déclare la règle inverse**
   (table inverse d'un transcodage `B2C → particulier`, regex inverse d'un gabarit,
   cf. §5.2) ;
3. **Non inversible / à perte** (agrégat, regex à perte, transcodage non bijectif)
   → le **technicien déclare une substitution (D13)** pour le sens descendant.

**Filet — validation (§5.2)** : pour chaque version d'API supportée, vérifier que
chaque règle a *un inverse (auto ou déclaré) ou une substitution*. Migration
jamais bloquée (D13), jamais silencieusement à perte non plus.

**Langage multi-valué — généralisation des groupes nommés (D92).** Une expression
ne retourne pas *une* valeur (modèle classique « fonction → valeur ») mais un
**enregistrement de valeurs nommées**, comme un regex livre plusieurs captures
nommées. Le cas « une seule valeur » est le cas dégénéré. Conséquences :
- une transformation est fondamentalement un **mapping `entrées nommées → sorties
  nommées`** (N → M) ; **renommer / éclater / fusionner** ne sont que des *patrons
  nommés* de ce mapping, pas des primitives distinctes → méta-schéma simplifié ;
- vaut pour **regex, gabarit, transcodage, hooks** (un hook peut retourner
  `{score, rang}`) et **champs calculés** (une expression peut alimenter plusieurs
  champs dérivés) ;
- la **composition** (D90) opère sur des enregistrements nommés ;
- l'**inverse** (D91) se relit comme la symétrie entrées/sorties : 1 → N
  (éclatement) ↔ N → 1 (fusion).

**Garde-fous d'exécution (D104, résout Q43).** Les fonctions du langage sont
**implémentées par le concepteur de Syncytium** — le risque n'est pas uniforme :
- fonctions **« simples »** (regex, gabarit, transcodage, arithmétique…) :
  **pas de timeout** — zéro surcoût sur le chemin chaud ;
- fonctions **« complexes »** (durée légitime possible — agrégats larges,
  lookups…) : **timeout paramétrable**, à la main du concepteur ;
- la classification **simple/complexe est portée par le catalogue de fonctions**
  (propriété du méta-schéma ; Q47 en hérite).

Gardes existants inchangés : hooks de calcul → délai max (D36) ; tâches →
**heartbeat** (D55 — une tâche longue mais vivante progresse, une tâche morte est
tuée, quel que soit son déclencheur D54) ; IHM → navigateur (D69). Le dry-run
(D7) reste le filet des regex pathologiques sur données réelles.

**Apport au méta-schéma** : le langage d'expression unique **multi-valué** est un
**pilier** — même grammaire pour calculs et transformations, un seul concept de
mapping nommé ; classification **simple/complexe** des fonctions (D104).

### 3.4 Types de champs (D118–D120 ; Q34 en cours)

**Un champ = une donnée atomique (D118)**, de deux natures :
- **Simple** : type de base + **propriétés de stockage** (taille de chaîne ;
  entier 1/2/4/8 octets ; précision du réel ; *entier/réel* descriptibles comme
  un **décimal** — chiffres avant/après la virgule) + **limites de valeurs**
  (bornes, plage). Types simples actés : texte, entier, réel, booléen,
  date et heure, fichier, énuméré.
- **Composée** : combinaison/raffinement déclaratif — `montant` = décimal +
  devise ; `email` = texte + format standard. Bibliothèque **livrée par
  Syncytium et enrichissable par le technicien** (patron D52/D68).

**Quatre facettes par type (D119)** — révélées par l'exemple de la date
Cegid PMI (chaîne `AAAAMMJJ` chez PMI, stockée en entier 4 octets, affichée
`JJ/MM/AAAA`, manipulée comme date) :

| Facette | Rôle |
|---|---|
| **Logique** | la vérité canonique — langage D90, calculs, comparaisons |
| **Stockage** | propriétés déclarées, ou mapping custom |
| **Affichage** | IHM (composant D64, i18n Q45) |
| **API** | sérialisation du contrat (ex. ISO 8601) |

Une **donnée simple étendue par hook** déclare un stockage custom + une **paire
de fonctions pures** `vers_stockage`/`depuis_stockage` (pureté D36, patron D52) —
au service direct des connecteurs (D79/D83 : l'anti-corruption au niveau du type).

**Règles de conversion portées par les types (D120)** — les types forment un
**graphe de conversion**, clé d'interprétation aux frontières (API, IHM,
translation) :

| Classe | Exemple | Comportement |
|---|---|---|
| **Sûre (implicite)** | `entier → décimal`, `email → texte` | sans perte, **automatique aux frontières** |
| **Explicite** | `décimal → entier` (arrondi), `montant → décimal` (perd la devise) | invoquée **explicitement** dans une expression (D90) |
| **Faillible (contrôlée)** | `texte → entier`, `texte → email` (parsing/format) | peut **échouer** → erreur propre |

Unifications : **valider un composé = tenter la conversion faillible depuis son
type de base** (texte→email, texte→iban avec clé) — un seul mécanisme ; les
**frontières** (JSON, saisie IHM, connecteurs) appliquent le graphe — sûres
automatiques, jamais de coercition silencieuse (règle en principe la
« coercition » de Q47) ; le **hook d'extension** = une arête de conversion
custom du graphe.

> **En attente d'arbitrage (Q34)** — propositions : types simples additionnels
> (`date` seule, `heure` seule, `duree` ; propriété `multiple` sur l'énuméré) ;
> composés livrés (`pourcentage`, `telephone`, `url`, `siren/siret` + Luhn,
> `iban/bic` + mod 97, `tva_intra`, `mesure` = décimal+unité, `geolocalisation`,
> `periode` ?) ; **devise de `montant`** = paramètre du champ à défaut
> d'instance, variante `multi_devise` (devise saisie avec la valeur).

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

**Lecture et écriture (D22 ; précisés par D100–D101, résout Q19).** Accès
unitaire, liste filtrée, intégralité paginée ; écriture unitaire ou par lot.

- **Pagination (D100)** : **curseur opaque** (keyset), **porté par la mécanique**
  — le moteur le gère, jamais le développeur. Stable pendant les modifications,
  cohérent avec les id opaques (D75). Le curseur **embarque la version de
  schéma** : un parcours interrompu par une migration à chaud continue, la chaîne
  de traduction (§5.1) absorbe. L'IHM générée consomme le même mécanisme.
- **Lots = lots de transactions (D101)** — un seul concept, deux cas dégénérés
  (esprit D92) :
  1. **ligne à ligne** = chaque ligne est sa propre transaction → validation
     individuelle, remontée des lignes échouées ;
  2. **global** = le lot entier est une seule transaction → tout ou rien ;
  3. **cas général** : le lot contient des **transactions** (1 seul niveau de
     récursivité) ; chaque transaction est **atomique** (échec → annulation de
     toutes ses mises à jour), le lot **continue** sur les autres, **remontée par
     transaction**.
  **L'atomicité appartient au modèle, pas à l'appelant (agrégats déclarés).**
  La **description déclare les unités d'atomicité** — les *agrégats* : une
  commande + ses lignes forment un tout indivisible. Règles :
  - **par défaut, l'écriture porte sur l'agrégat entier** — impossible de mettre
    à jour un entête de commande *seul*, sans ses lignes ;
  - **raffinement conditionnel** : mettre à jour une ligne seule n'est possible
    que **si le modèle l'autorise explicitement** ; sinon, la modification passe
    par la mise à jour de la commande ;
  - **composition libre vers le haut** : l'appelant choisit le périmètre de sa
    transaction — *une* commande ou *un ensemble* de commandes.

  Échelle de granularité : **ligne** (si autorisée) ⊂ **agrégat** (plancher,
  déclaré) ⊂ **transaction** (choix de l'appelant, ≥ agrégat) ⊂ **lot**. *La
  description fixe le plancher d'atomicité ; l'appelant groupe au-dessus, jamais
  ne découpe en dessous.* La déclaration d'agrégat (commande *possède* ses
  lignes) sera détaillée au **modèle de données** (Q35, relations de composition).
  (Structuration transactionnelle de premier ordre — habituellement laissée à la
  discrétion du développeur dans les SGBD.)

**Concurrence — état-avant / état-après (D111, résout Q41).** Mécanisme
**unique IHM + API** (ni verrou pessimiste, ni version côté écriture) :
l'**état-avant sert de jeton de concurrence, au grain du champ**.

- **Création** : doublon sur une clé → le **premier créateur gagne** ; le second
  est notifié, création non validée. API : **409 Conflict** ; IHM : l'utilisateur
  **reste sur son écran** (saisie intacte), message précis.
- **Modification** : l'appelant envoie **l'état avant + l'état après** ; le moteur
  déduit le diff. **Règle (compare-and-swap par champ)** : une modification d'un
  champ (avant ≠ après) n'est autorisée **que si la valeur-avant correspond à la
  valeur en base** ; les champs **inchangés** (avant = après) ne sont **ni écrits
  ni contrôlés** — c'est ce qui permet la fusion des modifications disjointes.
  Champs *différents* d'une même fiche → **fusion sans conflit** ; *même champ* →
  premier écrit, second notifié. Transaction = agrégat (D101) → **un champ en
  conflit rejette l'agrégat entier**. **Champs liés par une contrainte** (déclarée
  au méta-modèle, cf. Q36) : casser la contrainte = conflit = rejet. API : **409 +
  détail des champs en conflit** (attendu vs courant) ; IHM : notification
  précise, saisie conservée.
- **Suppression** : une modification arrivant après la suppression est **rejetée**
  (la suppression était première). API : **410 Gone**.
- Notes : le diff explicite (avant→après) est **directement journalisable**
  (pont vers Q37, audit des modifications) ; cohérent avec D92 (mapping de
  valeurs nommées) ; **ABA bénin par construction** dans ce modèle par valeurs —
  la séquence A→B→A peut survenir mais chaque transition a été elle-même validée,
  la prémisse de l'écrivain (avant = A) est vraie au moment de l'écriture, et
  l'historique des transitions relève de l'audit (Q37), pas de la concurrence
  (une règle dépendant du *chemin* serait une contrainte Q36) ; l'**ETag (D45)
  reste pour le cache en lecture** ; l'avertissement temps réel (SSE §4.5)
  demeure le désamorçage en amont.

**Connecteurs (D23) — deux familles (D78, D79).** Le moteur définit une
**interface de connecteur** (contrat de plugin, D52) ; chaque système externe a
son implémentation, déclarée dans le descriptif avec sa correspondance aux
entités. **Built-in (livrés) et connecteurs écrits par le technicien partagent la
même interface (D52)** — Syncytium fournit le **cadre + l'interface**, le
technicien implémente ses **propres connecteurs** (identité comme données) ; les
built-in ne sont que des extensions de première partie.

- **Connecteur d'identité (D78)** : un **cadre générique** de pilotage de
  l'identité, dont l'identification simple, le SSO et les autorisations AD/Entra
  sont des **déclinaisons**. Défaut livré : **login/mot de passe** (socle
  universel, D29). Couvre authentification **et** autorisation (groupes, D30).
  **Ouvert au technicien** (connecteur propre à la TPE, D52). Le protocole (OIDC,
  Kerberos, LDAPS…) devient un **détail d'implémentation** — tech-agnosticité,
  comme D18 (données) et D69 (rendu).
- **Connecteur de données (D79)** : un composant de **translation** entre données
  externes et modèle du moteur (couche anti-corruption). **Insight transverse** :
  la *translation déclarative* est un primitif partagé par **trois** usages —
  migrations (§3.2), compat d'API bidirectionnelle (§5.1) et connecteurs de
  données — qui peuvent **réutiliser le même vocabulaire** de transformation
  (renommage / éclatement regex / fusion gabarit, D4–D6). Mapper `full_name` →
  `prenom`+`nom` *est* un éclatement. La **direction** (import/export/bidi) =
  le sens de la translation. → renforce l'enjeu de **Q6** (syntaxe servant 3 usages).

**Modèle des connecteurs de données (D83–D86).**

- **Auto-description (D83)** : le connecteur **porte la description de son propre
  modèle** (entités/champs). On **mappe** les entités Syncytium dessus, en
  respectant la confidentialité (D25). Visualiser la structure externe (AD, CRM)
  devient une **simple déclaration** — méta-schéma appliqué aux connecteurs.
- **Entité persistée vs virtuelle (D84)** : une entité est **persistée** (stockage
  DB, défaut) ou **virtuelle** (sans stockage propre, sourcée d'un/des
  connecteur(s), en cache/mémoire). Une entité peut avoir **plusieurs occurrences**
  (DB + connecteurs).
- **Écriture — DB synchrone, connecteurs asynchrones (D85)** : la DB primaire est
  écrite **en synchrone** (entité non virtuelle) ; les écritures vers les **autres
  connecteurs sont différées via une file** (réutilise la file de tâches D54–D58)
  — découplage, résilience, performance.
- **Cache de lecture (D86)** : lectures **mises en cache un laps de temps
  configurable** (limite les appels connecteur ; même esprit que la mémoïsation
  D59).
- **Déclenchement (Q20, résolu)** : lectures **à la demande + cache** ; écritures
  **en file** (fil de l'eau).
- **Reprise (résolu, D87)** : l'écriture connecteur **est une tâche** ; la reprise
  se gère **dans la tâche** (opt-in, idempotence), pas par un auto-retry moteur.
  Anomalie → trace technicien + notification au déclencheur (D87).
- **Conflits bidirectionnels (résolu, D89)** : portés par **le connecteur**, pas
  par le moteur (*le moteur fournit le cadre, l'extension porte la sémantique
  métier* — cf. D79, D87). Le moteur expose l'état local + les métadonnées de
  version ; la **logique** de résolution (dernier écrivain, source de vérité,
  horodatage, fusion) appartient au connecteur. Caveat : la *résolution* s'arrête
  à la frontière du connecteur. **Exigence (clause du contrat de connecteur)** : un
  connecteur bidirectionnel **doit** remonter ses conflits via le canal d'anomalie
  (D87) — **conflit jamais silencieux**. Le moteur **garantit l'observabilité**
  (trace technicien + notification déclencheur) même s'il ne résout pas :
  *résolution = connecteur, visibilité = garantie par le cadre*.
- **Résiduel** : une **entité virtuelle** n'a pas de lignes : migrations (D4–D6) et
  diversité (D46) ne valent que pour les entités **persistées** ; la virtuelle suit
  son connecteur.

À trancher (Q20), au niveau des modalités : déclenchement (planifié, à la
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

### 5.6 Identités et accès (D27–D29, D77)

Découpage fidèle à toute l'architecture : **la structure dans la description, les
personnes dans les données.**

**Typologie des comptes (D77, résout Q33)** — quatre types, généralisant D28 :

| Type | Rôle | Audience / canal | Provisionnement |
|---|---|---|---|
| **1. Technique** | API | externe (API) | admin (D28) ; délégation on-behalf-of (D76) |
| **2. Utilisateur** | périmètre via groupes | interne (IHM) | admin / AD-Entra (D29–D32) |
| **3. Client** | accès à ses données | externe (portail) | **service ADV, depuis une fiche client** |
| **4. Client auto-créé** | self-service (commande web) | externe (portail) | auto **puis vérifié par le service des ventes** |

- **Le type 3 concrétise l'appartenance (D71)** : le `compte` des chemins
  (`commande.client.compte`) **est** ce compte, issu de l'entité `client` — le lien
  entité↔compte *est* la fiche client.
- **Le type 4 est un dérivé fail-closed** (jamais actif sans contrôle ADV ; devient
  un type 3 une fois vérifié) — **non prioritaire**, variante différée.
- **Étanchéité généralisée** : chaque type a son canal (technique→API,
  utilisateur→IHM interne, client→portail externe) ; ils ne se croisent pas.
- **Cycle de vie** : le compte client suit sa **fiche client** (fiche désactivée →
  compte désactivé).

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
- **Source d'identité unique + changement gardé (D80)** : **une seule source
  d'authentification active** à la fois (pas de mode mixte). Changer de source est
  une **opération gardée** (esprit dry-run §4.1) : **validation préalable
  obligatoire** (une authentification de test réussie contre la nouvelle source —
  typiquement l'admin opérant le changement — avant qu'elle devienne active) ;
  **repli rapide** (la config d'auth vit dans l'administration, D32) ; si la
  validation échoue → **on reste sur l'ancienne source**.
- **Secours « bris de glace » (D81, étend D33)** : la condition d'activation du
  compte de secours s'élargit à **« authentification indisponible »** (source
  active en panne/mal configurée), détectée par un **contrôle de santé** du
  connecteur actif. **Indépendant de tout connecteur externe** (validé localement,
  D33) → aucune panne d'AD/SSO ne le verrouille. Son activation est un **événement
  de sécurité fort** : **audité avec motif** (D62) et **alerté** (finalité
  sécurité D43).
- **Identité interne + clé d'unicité (D82)** : l'identité canonique est un **UUID
  interne stable** — l'ancre de tout (appartenance D71, audit, références) ; ne
  change jamais ; cohérent avec les id opaques de D75. La **clé d'unicité**
  (rapprochement externe → UUID) est **définie par le connecteur** et varie par
  connecteur/TPE : clé d'annuaire Entra/AD (+ courriel), courriel/login en local.
  Nuance : **clé immuable en priorité** (objectGUID) ; email = mutable → secondaire
  / repli ; prévoir une **opération admin de re-liaison / fusion** (email changé,
  doublon). JIT (D30) : le connecteur extrait la clé du jeton, retrouve l'UUID.
  Déclarer sa clé d'unicité fait partie du contrat du connecteur (D78).
- **Suppression d'un groupe encore référencé (D34)** : note au technicien
  (notification ou journalisation) et groupe **ignoré**. Comportement fermé par
  défaut : un champ restreint au seul groupe supprimé devient invisible de tous
  (la donnée se protège, ne s'expose pas). À confirmer : si le groupe réapparaît
  dans une version ultérieure, les affectations conservées reprennent-elles vie
  (utile en retour arrière, surprenant si involontaire) ?

### 5.7 Accès au niveau ligne — ouverture aux clients (D70–D76)

Deux mondes d'accès, distingués par une **dimension d'audience** :
- **Audience interne** (collaborateurs) : groupes statiques + niveaux (D25/D26).
- **Audience externe** (clients) : accès **au niveau ligne** par appartenance,
  **fermé par défaut**.

Deux axes orthogonaux (D72) : *quelle ligne* (appartenance) × *quel champ*
(niveau/groupe/audience). Sur une ligne visible par un client, les **champs
internes TPE restent masqués**.

**Modèle d'appartenance (D70–D71).** Une entité exposée aux clients déclare un mode :

| Mode | Déclaration | Exemple |
|---|---|---|
| **Directe** | champ référence-compte | `client.compte`, `employe.compte` |
| **Indirecte** | chemin de relations (multi-saut) vers un compte | `commande.client.compte` |
| **Ouvert à tous les clients** | aucun filtre | catalogues, listes de valeurs, descriptions publiques |
| **Non exposé** (défaut) | — | invisible aux clients (*fail-closed*) |

Cas-limites : **propriétaires/chemins multiples** → union (OR) ; **ligne sans
propriétaire** → invisible. Provisionnement des comptes clients (auto-inscription
vs créés par la TPE) → **Q33**.

**Lecture/écriture (D73).** L'appartenance accorde lecture **et/ou** écriture,
déclarables séparément **par champ** ; invariant **write ⊆ read** (tout champ
modifiable est visualisable, l'inverse non).

**Combinaison (D74).** **OU seulement** (union d'octrois). AND/NON/XOR
**délibérément différés** (peu de besoins ; rationale conservée).

**Filtrage serveur + identifiants contextuels (D75).** Filtrage **côté serveur**
(ne pas exposer de données inutiles). Contre l'**IDOR** : **identifiants non
devinables** exposés aux clients (opaques, pas les ID séquentiels internes) +
**re-contrôle d'appartenance à chaque accès direct** (ne jamais faire confiance à
la possession d'un id) ; option forte : **aliasing par contexte** (id différent
par utilisateur) pour données très sensibles. Affaiblit aussi le *crawl* (D43).
Implication : l'**abstraction de persistance (D18)** doit savoir filtrer au niveau
ligne (RLS natif SQL ; filtrage applicatif NoSQL).

**Impersonation et délégation (D76).**
- **« Agir en tant que » (admin)** sur toutes les strates (tests, délégations),
  avec **audit à double identité** : compte **effectif** enregistré + compte
  **d'origine** marqué ; session journalisée avec **motif** (cf. D62) ; vigilance
  RGPD pour les données sensibles.
- **Compte technique « pour le compte de »** un compte nominatif/client (modèle
  OAuth *on-behalf-of*) : l'API est **bornée au périmètre ligne** de cet
  utilisateur et chaque appel devient **attribuable** — au lieu d'un accès en bloc.

**Apport au méta-schéma** : dimension d'audience ; modes d'appartenance (chemins) ;
visibilité de champ par audience ; droits lecture/écriture par champ ; délégation.

### 5.8 Versions de schéma ≠ versions de contrat d'API (D98–D99)

Avec des migrations fréquentes (plusieurs par semaine), ne pas publier chaque
version de schéma aux tiers : distinguer les **versions de schéma** (internes,
nombreuses) des **versions de contrat d'API** (publiées, espacées). La chaîne de
traduction absorbe les versions intermédiaires sans les exposer.

**Publication = acte déclaratif (D99, résout Q11).** **Versions autorisées =
versions publiées.** Le moteur n'impose aucune cadence : le technicien **déclare**
qu'une version de schéma devient un contrat publié. La publication est
**révocable**. Fenêtre de support = [version minimale supportée (D94) … dernier
contrat publié].

**Cycle de vie des versions (D103, précise D99).** Quatre états :

| État | Appelable ? | Épinglable (D98) ? | Usage |
|---|---|---|---|
| **Publiée officielle** | oui | oui | contrat courant |
| **Publiée bêta/test** | **sur sollicitation explicite seulement** (en-tête D98) | non | essai avant officialisation |
| **Interdite** | non → 426 | non | bêtas abandonnées, versions boguées, fonctionnalités abandonnées |
| **Dépréciée** | non → 426 | non | sous la version minimale (D94) |

- La **bêta s'emboîte avec D98** : l'en-tête de surcharge *est* le canal d'accès
  aux bêtas — pas d'épinglage possible, sollicitation appel par appel.
- Transitions : bêta → officielle (promotion) ; officielle → dépréciée (la
  minimale monte) ; bêta/officielle → interdite (révocation) — interdite = terminal.
- **L'enchaînement des versions est indépendant de la publication** : la chaîne de
  traduction (§5.1) traverse **toutes** les versions (y compris interdites et
  dépréciées), son ordre étant défini par le **journal de migrations** (§3.2).
  **L'état gouverne l'*appelabilité*, jamais la *traversabilité*.** Le journal est
  la colonne vertébrale ; la publication n'est qu'un filtre d'entrée.

**Épinglage (D98, résout Q9) — le duo compte + en-tête.** La **version épinglée
au compte technique** est le socle (un appel sans précision obtient *sa* version
enregistrée) ; la **surcharge par en-tête** sert à **tester la version suivante**
avant de demander la bascule de l'épinglage. Garde-fous : la surcharge ne peut ni
viser une version **non publiée** (D99) ni descendre **sous la version minimale**
(D94 → 426) ; la bascule de l'épinglage est un **acte d'administration tracé**.

**Authentification des comptes techniques (D107, clôt Q44) + débit (D105).**
- **Défaut : clé API rotative** — deux clés actives pendant une rotation, bascule
  sans coupure ; révocable côté administration.
- **« Pour le compte de » : header dédié** portant le compte sujet, gouverné par
  le **périmètre de délégation déclaré** sur le compte technique (D76) — appel
  borné au périmètre ligne du sujet, toujours attribuable.
- **Déclinaisons** via le cadre générique (D78) : **OAuth2 client credentials +
  Token Exchange (RFC 8693)** pour les clients exigeants — le jeton porte alors
  le sujet à la place du header ; même sémantique D76 dans les deux cas.
- **Rate limiting (D105)** : **15 req/sec** défaut global d'instance, surcharge
  par compte technique, **429 + `Retry-After`** — fusible de disponibilité
  externe (pendant du fusible interne D104).

---

## 6. Télémétrie (D14, D38–D44)

**Principe de cadrage (D14, affiné le 2026-06-12)** : la télémétrie ne **redouble
pas les journaux** ; tout indicateur doit servir l'une des **trois finalités**
retenues — (1) **suivre les usages réels**, (2) **évaluer le risque d'une
migration**, (3) **détecter les usages/accès non autorisés ou anormaux** (D43).
Modèle clé : **un seul substrat de collecte** (compteurs D39/D40/D42 + journal
D41), **plusieurs couches d'analyse** — les finalités 2 et 3 sont des **vues
dérivées** de ce substrat (§6.3, §6.5), non des collectes distinctes.

### 6.1 Trois grains de mesure (D38–D40)

| Grain | Mode | Ce qu'on mesure | Au service de |
|---|---|---|---|
| **Champ** (D38) | **À la volée** (aucun stockage) — tableau de bord dédié | **Diversité des valeurs** : un champ sans diversité ne porte probablement pas de sémantique → candidat au retrait | Simplification du schéma |
| **Entité** (D39) | **Stocké** | Compteurs d'usage **lecture/écriture** ; **historique d'évolution du schéma** | Enrichissement du schéma |
| **API & fonctions** (D40) | **Stocké / journalisé** | **Double usage** : usage réel (compteurs) **et identification des acteurs** (quel compte technique appelle quoi) | Dépréciation (§5.4), épinglage (Q9), gestion des intégrations |

**Deux indicateurs de diversité, orthogonaux (D38) :**

| Indicateur | Formule | Question posée | Suggestion d'évolution |
|---|---|---|---|
| **Représentative** (D46) | distinctes non nulles / **nombre de lignes** | Les données varient-elles dans la table ? | Ratio ≈ 0 → **retirer le champ** |
| **Scalaire** (D48) | distinctes / **valeurs théoriquement possibles** | Quelle part du domaine déclaré est exploitée ? | Ratio faible → **resserrer le domaine/type** |

Exemple montrant l'indépendance — statut `{actif, inactif, suspendu}`,
10 000 lignes toutes `actif` : représentative = 1/10 000 ≈ 0 (constant) ;
scalaire = 1/3 (un seul état utilisé). Deux diagnostics distincts.

**Domaine théorique (D48)** — calculable seulement s'il est borné :
énumération → nb de valeurs déclarées ; booléen → 2 ; numérique borné →
étendue ; chaîne **formatée** → domaine du pattern (ex. `AA-999`) ; types non
bornés (texte libre) → **indéfini** (seule la représentative s'applique). Se
dérive du **type et des contraintes déclarés** : les formats servent deux fois
(validation **et** indicateur).

**Seuils par champ, déclarés dans le schéma (D49 → résout Q28).** Plutôt qu'un
seuil global, chaque champ porte son **seuil de télémétrie** dans la description :
la connaissance métier du technicien (un booléen `actif` est censé avoir une
représentative basse) supprime le faux positif à la source. Le **méta-schéma
gagne un attribut de seuil par champ**. **Pas de défaut** : *seuil absent =
aucun contrôle* — silence par défaut, signalement strictement opt-in, zéro faux
positif par construction. Le tableau de bord (D38, à la volée) peut toujours
**afficher** la diversité à la demande ; c'est le **flag automatique** qui
requiert un seuil déclaré, pas la consultation.

**Pondération temporelle** : un champ **récent** figé sur sa valeur par défaut
est normal ; sur une entité **rarement modifiée**, attendre plus longtemps
(ancienneté rapportée à l'intervalle moyen de mise à jour). Sur très peu de
lignes, le ratio est bruité → la maturité l'atténue.
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

**Dimension temporelle des compteurs (D42)** — pour D39 et D40 : compteurs en
**seaux journaliers** sur **périodes glissantes**, agrégés en semaine / mois /
année à mesure qu'ils vieillissent (si la profondeur de stockage le permet).
Conséquences :
- *Downsampling* = politique de rétention (D41) par **granularité décroissante
  avec l'âge** plutôt que purge sèche : on conserve la tendance longue à moindre
  coût (ex. année courante au jour, N-1 au mois, N-2 à l'année).
- Ces compteurs sont **additifs** (lectures, écritures, appels) → l'agrégation
  est une somme, sans perte. À l'inverse, la **diversité** (D38) n'est pas
  additive — d'où son calcul à la volée, jamais en seaux. Les deux choix se
  justifient mutuellement.
- La *fréquence de mise à jour* pondérant D38 se lit sur les compteurs d'écriture
  fenêtrés ; le dry-run (§6.3) peut alors signaler une **tendance** (« usage en
  hausse ce mois-ci → migration plus sensible »), pas seulement un instantané.

### 6.3 Finalité 2 — risque de migration (vue dérivée)

Assemblée pour le **rapport de dry-run** (§4.1) à partir du substrat :
intensité d'usage du champ/entité touché + **tendance** (D42) + acteurs API
concernés + dépendances (champs calculés, tâches). Pas de collecte nouvelle —
une lecture croisée.

### 6.4 Finalité 3 — sécurité / usages anormaux (D43, vue dérivée)

Cinquième canal de restitution (voir §6.5). Finalité : **alerter le client
et/ou le technicien** d'un usage ou accès non autorisé.

- **Ce qu'il détecte** : pics de fréquence inappropriés ; **tentatives d'accès
  refusées** (lecture d'un champ `privee`, appel d'une fonction interdite au
  groupe — §5.5/§5.6) ; sollicitations hors cadre.
- **Substrat** : journal (D41) + compteurs temporels (D42). **Exigence ajoutée
  à la collecte** : journaliser non seulement l'activité mais les **refus
  d'autorisation** (le carburant du canal). D42 fournit la **ligne de base** des
  fréquences normales → détection d'anomalie par simple comparaison.
- **Indicateur (D47) — un modèle de risque à plusieurs composantes**, pas un
  scalaire unique. Calibration → Q29.
  - **Deux portées** : au **global** et **par requête/endpoint** — une dérive
    noyée au global peut être flagrante sur un appel précis (substrat D40/D42).
  - **Pente de régression = orientation** : coefficient de la droite de
    régression des **points quotidiens** sur une **fenêtre glissante** (taille à
    définir, ex. 1 semaine). Coefficient positif = sollicitations en hausse.
    Hypothèse : attaque **progressive** *ou* **défaut de conception** du
    développeur appelant (les deux à signaler).
    - **Normalisation = clé de la portabilité** : la régression porte sur des
      points **normalisés** (indexés au premier jour / à la moyenne de la
      fenêtre = 1), pas sur les comptes bruts. Ainsi **pente > 1 ⇔ « plus que
      doublé » sur la fenêtre**, quel que soit le volume — un seuil unique vaut
      pour tous les endpoints.
    - *Échelle linéaire* : croissance parfois **légitime** (outil connecté qui
      monte en charge) → orientation, pas anomalie en soi.
    - *Échelle logarithmique* : révèle la croissance **exponentielle**, celle qui
      met le moteur en péril → signal de menace fort.
  - **Pente seule insuffisante → croiser au volume absolu** : deux conditions
    **orthogonales** — la pente normalisée capte la *forme* (doublement), le
    seuil de volume garantit que ça *compte* (pas de bruit sur faible volume).
  - **Écart type — option délibérément écartée.** Le coupler distinguerait une
    progression régulière d'une progression asymétrique (dents de scie), info
    que la seule pente perd ; mais pour une cible TPE cela alourdirait le
    paramétrage sans gain proportionné → non retenu (rationale conservée pour ne
    pas rouvrir sans raison). Même esprit que le garde-fou R², lui aussi simple.
  - **Détecteur de pics (complément)** : la régression rate les **attaques
    ponctuelles ciblées**. Discriminant = l'**étendue d'accès**, pas le volume :
    un pic de **clôture comptable** (accès concentré) est légitime ; un pic
    **couvrant tous les enregistrements** d'une entité = **tentative de crawl**.
  - **Pente des refus d'autorisation** = signal fort d'énumération.
  - Garde-fou : pondérer par R² (éviter la pente fantôme sur série plate).

  **Symétrie avec D45 (crawl ≡ N+1).** Le balayage de tous les items d'une entité
  est le **même signal** que le N+1 du volet conseil : selon l'acteur et son
  autorisation, c'est soit un **anti-pattern de performance** (conseil amical,
  consommateur légitime, D45) soit une **tentative de crawl** (alerte sécurité,
  acteur hostile, D43). L'**indicateur d'étendue** sert les deux finalités — la
  frontière est l'**intention/l'autorisation**, pas le comportement observé.
- **Seuils déclarés dans la description (D50)** : les seuils du modèle de risque
  sont portés par les éléments concernés — **endpoints**, **entités** et
  **fonctionnalités d'IHM**. Généralise D49 (seuils de diversité par champ) :
  *les seuils de télémétrie sont un attribut déclaratif par élément du
  méta-schéma*, tous types confondus. Les fonctions d'IHM entrent ainsi dans le
  périmètre sécurité (ex. export massif à rythme anormal) — surveillance, non
  suivi ergonomique.
- **Posture par défaut — filet de sécurité (D51, résout Q29)** : **seuils
  globaux par défaut** sur le modèle, **surchargés par élément**. Asymétrie
  délibérée avec Q28/D49 : diversité → seuil absent = *aucun contrôle* ;
  sécurité → seuil absent = *le défaut global s'applique* (on ne peut pas
  oublier de surveiller). **Défaut global** : pente de régression sur **1
  semaine > 1** pour un **volume > 1000 appels** (la pente ne déclenche que si
  le volume est significatif → pas de bruit sur les petits endpoints). Unité :
  +1 appel/jour de croissance, échelle linéaire. Variantes log / pic / étendue
  du modèle (D47) : défauts posés plus tard ou laissés à la surcharge — le cadre
  global + override les accueille identiquement.
  - **Lecture de la pente (précisée)** : pente **normalisée**, *> 1 ⇔ plus que
    doublé* sur la fenêtre (et non « +1 appel/jour » — interprétation brute
    abandonnée). Fenêtre glissante = paramètre à définir (1 semaine en exemple).
- **RGPD** : la sécurité du SI est une finalité légitime, qui justifie de tracer
  des tentatives nominatives même là où la surveillance comportementale serait
  proscrite (information + proportionnalité ; client responsable, D16).

### 6.5 Restitution — cinq canaux (D44, résout Q13)

La forme suit la finalité ; les canaux sont complémentaires, pas exclusifs :

| Canal | Mode | Finalité | Note |
|---|---|---|---|
| **Tableau de bord** (D38) | *Pull*, exploration | Usages | Diversité, compteurs, tendances ; à la demande |
| **Rapport de dry-run** (§6.3) | Contextuel, à la migration | Risque migration | La finalité 2 n'a **pas** de tableau de bord propre : elle s'injecte là où la décision se prend |
| **Synthèse périodique** | *Push*, basse fréquence | Usages (proactif) | Fait remonter d'elle-même les candidats au retrait ; inclut le **volet conseil** côté API (D45, ci-dessous) |
| **Alerte d'échéance** | *Push*, événementiel, **rare** | Risque/dépréciation | Cas justifié : version d'API dépréciée encore appelée près du `Sunset` (D12/D40). Pas d'alerte sur le simple non-usage |
| **Analyse de sécurité** (D43) | *Push* + analyse | Sécurité (finalité 3) | Voir §6.4 ; alerte client et/ou technicien |

**Volet conseil de la synthèse (D45) — la boucle d'évolution côté API.**
Symétrie de D38 : la télémétrie « objets » fait évoluer la description *vers
l'intérieur* (simplifier) ; la télémétrie « API » fait évoluer la surface
exposée *vers l'extérieur* (optimiser, enrichir). On analyse les **schémas
d'appels** (D40) pour produire des recommandations, à **deux destinataires** :

| Pattern détecté | Recommandation | Destinataire | Référence marché |
|---|---|---|---|
| Mêmes items, requête déterministe, appels répétés | Mise en cache ; le moteur **fournit le mécanisme** (`ETag`/`Cache-Control` dérivés de version schéma + enregistrement → requêtes conditionnelles `304`) | Consommateur | Analyse de redondance |
| Appels **unitaires** couvrant tous les items d'un service | Lecture **par lot/bloc** (D22) | Consommateur | Problème **N+1** des ORM |
| Séquences d'appels récurrentes / toujours jointes | Faire **émerger un besoin** : endpoint composite, agrégat (D36), champ calculé (D35) | Technicien | *Query advisor* / APM |

- *Consultatif uniquement* : on recommande, on n'étrangle jamais les requêtes.
- **Détection (Q30) — étude dédiée différée.** D'un autre ordre de complexité
  (fouille de **motifs de séquences d'appels**, pas un indicateur scalaire).
  Fera l'objet d'une étude à part, fondée sur l'**implémentation personnelle
  existante** de l'auteur pour l'analyse des automatismes d'accès à PostgreSQL
  (point de départ éprouvé, non une page blanche).
- RGPD léger : seuls des **comptes techniques** sont analysés (D40).
- **La boucle metadata-driven se referme sur les deux faces** : interne (D38) et
  externe (D45).

**Solution intégrée sur méta-schéma (D44).** Ces canaux forment une **solution
intégrée** : écrite dans le format Syncytium mais **possédée par le moteur**
(non éditable par le client), par opposition aux **solutions client**.

- **Couche moteur, non descriptible** : la *collecte* et le *calcul de diversité*
  sont des capacités du moteur — ils doivent fonctionner **même si la description
  du client est cassée** (c'est au pire moment qu'on en a besoin pour
  diagnostiquer) et introspectent n'importe quelle entité (méta-niveau).
- **Couche restitution, descriptible** : tableaux de bord et écrans d'analyse
  sont **générés par la même machinerie** que les solutions client → héritent du
  contrôle d'accès par groupes et de l'exposition API.
- **Méta-schéma** : Syncytium **se décrit lui-même** (entité, champ, groupe,
  niveau, migration, compteur, compte sont modélisés). Les solutions intégrées
  sont des **vues sur ce méta-schéma** — pattern du *catalogue système* d'une
  base (`information_schema`). Vertus : cohérence d'IHM, et **validation du
  langage** (s'il sait exprimer la gestion du moteur, il est assez expressif).
- **Rattachements** : D33 (groupe administrateurs intégré) n'est plus un cas
  particulier mais la **première solution intégrée**. Et le méta-schéma **est la
  définition formelle du format de description** → c'est l'objet de **Q16**
  (versionnement du format), possédé et versionné par le moteur (D17, §7.2).

### 6.6 RGPD

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

### 7.3 Environnements et continuité (D112–D114, résout Q42)

**Multi-environnements (D112).** Préconisation aux clients :
- un environnement de **production** portant la **dernière version publiée** ;
- **un environnement de staging par version bêta**, **instancié à la volée** :
  copie de la production → **migration** (mécanisme D4–D9) vers la version bêta
  — *le dry-run rendu durable et navigable*. Les **API bêta (D103) sont
  redirigées** vers l'instance de staging (la sollicitation explicite D98 trouve
  sa destination) ;
- **à la validation de la bêta** : l'instance de staging est **supprimée**, la
  production est migrée par le cycle §4 (migration ainsi répétée deux fois —
  dry-run + vie en staging — avant la vraie bascule).

**Synchronisation production → staging (D113), deux modes :**
- **synchrone** : chaque écriture en production est **reportée** vers le staging —
  **traduite à travers la chaîne de versions** (§5.1), les deux instances étant à
  des versions différentes → **4ᵉ usage du primitif de translation** (migrations,
  API, connecteurs, réplication inter-versions) ;
- **différé** : recréation du staging **sur sollicitation** (admin/technicien) à
  une fréquence à définir (ex. 1×/jour), via le mécanisme d'instanciation D112.

**Continuité d'activité — PCA/PRA (D114).** Le même mécanisme de synchronisation,
appliqué entre **deux instances de production de même version** (active/passive),
donne la continuité : **bascule manuelle par le client** en cas de coupure.
Atouts : réplication **tech-agnostique** (niveau Syncytium, indépendante du SGBD —
D18) ; cohérence protégée à la bascule par l'estampille D93.

**Caveats consignés** : D16 se raffine — « une instance *de production* par TPE »
+ instances **éphémères** (staging) + éventuellement une **passive** ; chaque
instance reste mono-serveur (D15). **RGPD** : le staging porte des données
réelles — garde-fous : éphémérité (suppression à la validation) + accès restreint
(technicien/testeurs) ; à documenter chez le client (responsable de traitement).

---

## 8. Extensibilité — hooks et plugins (D23, D32, D36–D37, D52)

Le moteur est un **noyau déclaratif** entouré de points d'extension typés :
**connecteurs** vers les systèmes externes (D23), **fournisseurs
d'authentification** (D32), et **hooks** déclinés en trois modes (D37) couvrant
les trois couches de la vision initiale.

### 8.0 Principe : mécanisme uniforme interne/externe (D52)

**Pas de mécanisme privilégié pour les fonctions « maison ».** Une fonction
**interne** (livrée par Syncytium) et une fonction **externe** (module de
développement du technicien) implémentent **la même interface commune** par mode
et se branchent à l'identique. Les fonctions de base sont des **extensions de
première partie** — Syncytium fournit un **socle de hooks** que le technicien
enrichit au fil des besoins.

- **Interface commune par mode** : calcul, tâche, comportement d'IHM exposent
  chacun un **contrat formel stable** (formalisation de la « boîte noire à
  contrat déclaré », §5.5/§8.2).
- **Sécurité uniforme** : un built-in passe par la **même frontière déclarée**
  qu'un externe (mêmes règles d'accès et de confidentialité). Aucun raccourci
  caché.
- **Les built-in = implémentations de référence** pour écrire un module externe.
- **Registre et espace de noms** (à prévoir) : résolution transparente d'un nom
  de hook vers interne ou externe ; namespacing (`syncytium.pdf` vs
  `monmodule.pdf`) pour éviter les collisions et permettre le remplacement.
- **Versionnement des interfaces** : un module externe déclare la **version
  d'interface** implémentée ; le moteur vérifie la compatibilité (parc
  hétérogène, §7.2) → **contributeur à Q16**.

Régularité architecturale : *mécanisme uniforme, distingué par la seule
provenance* — déjà vu pour les comptes (technique/nominatif, D28) et les
solutions (intégrée/client, D44). Généralisable : connecteurs (D23),
fournisseurs d'authentification (D32) et hooks relèvent d'un **modèle
d'extension unique**, les briques de Syncytium étant de simples extensions de
première partie.

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

### 8.3 Le hook d'interface (D63–D68 ; résout Q27)

**Principe directeur** : l'interface générée est **complète et cohérente par
elle-même** ; les hooks d'IHM sont des **enrichissements optionnels** (remplissage
d'emplacements), jamais requis. Langage **JavaScript** (territoire navigateur,
indépendant de Q7). Confidentialité **structurelle** : le canal ne livre jamais
`privee` au navigateur (D44) ; la sécurité au niveau ligne (principals contextuels,
Q32) s'applique. Aucun effet de bord direct. **Dégradation gracieuse** : une erreur
d'exécution retombe sur le rendu par défaut (≠ calcul qui bloque la migration).

**Quatre couches :**

1. **Thème (D63)** — couleurs, polices, styles, personnalisables par le technicien.
   Sans logique ; couche de marque, faible risque.
2. **Cartographie `type → composant` (D64)** — bibliothèque par défaut **riche et
   curée** : table, liste déroulante sur énuméré **et sur référence**, vignettes,
   graphiques, widgets de dates, dashboard, planning… → écrans sensés **sans code**.
   Vise la construction rapide d'application (promesse fondatrice).
3. **Surcharge `champ → composant` (D65) + bibliothèque ouverte (D68)** — built-in
   et custom partagent la **même interface de composant** (décrit *rendu* et
   *usage* : types acceptés, configuration, points d'extension) ; registre
   namespacé (D52). Le technicien **enrichit la bibliothèque** : un composant ajouté
   est de première classe — mappable en **défaut de type** (app-wide) ou en
   surcharge de champ, indistinguable d'un built-in. Composants **partageables**
   (AGPL si distribués) → écosystème.
4. **Injection comportementale (D66)** — filtres métier, affichage conditionnel,
   action post-validation, aux points d'extension. **Dogfoodé** : les composants
   internes utilisent la même API que le technicien. **UX seulement, jamais la
   sécurité** (un filtre client ne protège pas ; le serveur D25 le fait) ; tout
   effet **délègue à une tâche** (D54).

**Surcharge des internes non supportée (D67)** : se coupler aux détails internes
casse à la mise à jour du moteur (parc hétérogène §7.2 transposé à l'IHM). On
**remplace par interface** ou on **injecte** — jamais on ne patche les internes.

**Dégradation** : un composant custom qui échoue, **même promu défaut de type**,
retombe sur le **built-in par défaut** du type — le socle livré reste l'ultime
filet (la cohérence de l'interface générée est préservée).

**Apport au méta-schéma** : thème ; cartographie type→composant ; surcharges
champ→composant ; configuration + comportements injectés ; interface de composant
versionnée ; composants enregistrés dans le registre.

**Modèle de composant déclaratif (D69) — résout le bac à sable de Q27.** Un
composant est une **fonction pure `config → description de rendu`** ; le **moteur
réalise le HTML** (modèle à la **Webix**, le plus proche du principe originel :
la métadonnée pilote jusqu'au rendu). Conséquences :

- **Ajout de composant trivial** (interne ou externe) : on décrit, le moteur rend.
- **Technologie de rendu = choix d'implémentation, pas contrainte** : le renderer
  (Webix / autre cadre / moteur maison) est **interchangeable** ; les composants
  et descriptions ne le connaissent pas → descriptions **tech-agnostiques et
  pérennes** (traversent un changement de techno comme les versions de moteur, §7.2).
- **Parallèle avec D18** : même découplage que la persistance. Syncytium est
  **tech-agnostique aux deux bouts** — données (D18) *et* interface (D69) ; le
  méta-schéma est le cœur durable, les liaisons sont des satellites remplaçables.
- **Le bac à sable par construction** : un composant qui ne produit qu'une
  *description* ne touche pas le DOM (ni hameçonnage ni capture) ; en Worker + CSP,
  ni exfiltration ni gel. **Iframe en échappatoire** pour les rares composants à
  rendu brut (cartographie, graphes) hors du vocabulaire déclaratif.
- **Prix à payer** : le **vocabulaire de description de rendu** doit être assez
  riche pour les composants évolués (D64) — effort de conception ; l'iframe est
  la soupape.

Sandbox (synthèse) : **CSP** filet universel ; logique en **Worker** ; rendu par
**contrat déclaratif** (D69) ; **iframe** en échappatoire. Provenance : built-in
inline, tiers isolés.

### 8.4 Le hook de tâche (D53–D58 ; résout la moitié de Q21)

Même schéma que le calcul : **déclaration** dans la description, **implémentation**
en plugin (interne ou externe, D52). Built-in (PDF, mails) et tâches sur mesure
coexistent dans le même catalogue.

**Déclaration type :**

```yaml
taches:
  generer_bulletin:
    libelle: "Génération du bulletin de paie"
    parametres:
      employe: { type: reference, vers: employe }
      mois:    { type: mois }
    resultat:        { type: fichier, format: pdf }
    implementation:  "syncytium.pdf"          # built-in ou "monmodule.bulletin"
    connecteurs:     [stockage_documents]
    declenchement:   [interface, api, planifie, evenement, enchainement]
    acces:
      declenche_par:    [paie, administrateurs]
      resultat_lu_par:  [employe_concerne]     # additionnels ; déclencheurs inclus d'office
    lecture:         [employe.salaire, employe.coordonnees]
    execution:       once       # relance manuelle uniquement
    deterministe:    true        # mémoïse le résultat
    determinisme_duree: 1h       # fenêtre de validité du cache (≠ rétention)
    cooldown_api:    "<période, fin→début>"   # si non déterministe
    retention_resultat: 90j
```

**Droits (D53).** `declenche_par` ⊆ `resultat_lu_par` **par construction** : qui
déclenche peut lire. `resultat_lu_par` ne déclare que les lecteurs *additionnels*.
Ceux-ci peuvent être des groupes statiques **ou des principals contextuels**
(`employe_concerne` = l'employé sujet de la tâche, résolu depuis les paramètres)
→ **sécurité au niveau ligne**, concept à généraliser (Q32). La tâche s'exécute
avec **sa propre portée `lecture:`** (élévation de privilège contrôlée, type SUID),
pas celle de l'appelant.

**Déclenchement (D54, étendu par D106).** Cinq modes : **interface, API,
planifié, événement, enchaînement** (tâche après tâche). L'**événement** couvre
les **données** (écriture d'une entité) **et les fichiers (D106)** : un **dossier
surveillé + un pattern défini** — à l'arrivée d'un fichier conforme, la tâche se
déclenche, **le fichier devenant son entrée** (patron *hot folder* : scanner
déposant des PDF, export comptable déposant des CSV). Notes : le pattern
réutilise le vocabulaire du langage (glob/regex) ; attendre que le fichier soit
**complètement écrit** avant de déclencher (piège du fichier en cours de copie).
Tâche **synchrone ou asynchrone** — mais *toujours non bloquante avec
progression* : le « synchrone » n'est qu'une posture d'IHM (l'utilisateur suit la
barre), pas un chemin d'exécution séparé. Toutes les tâches passent par la file.

**File et suivi (D55).** **File d'attente** bornant la concurrence ; chaque tâche
a un **état** et un **statut de progression** (compteur/total + message). Le
**résultat est enregistré** (trace + restitution sur demande dans la limite de
`resultat_lu_par`), disponible pour une **durée déterminée**.

**Supervision (D56).** Une **interface d'administration** (solution intégrée sur
le méta-schéma, D44), à **deux étages de contrôle** :

- *Par tâche* : **annuler / reporter / reprioriser** ; **réinitialiser le
  déterminisme** (D60).
- *Globaux — frein d'urgence (D61)* : **tout annuler / tout mettre en pause /
  tout relancer**. Même primitif que le **drainage de migration** (D24/D54),
  exposé à la demande. Caveat D57 : la pause arrête le *démarrage* des tâches ;
  les tâches en cours ne se défont pas (effets déjà produits irréversibles) ;
  « tout annuler » vide l'attente et interrompt au mieux les tâches en cours.

**Journal** de toutes les exécutions (succès / échec / exception). Et **audit
des actions de supervision (D62)** : chaque action (surtout globale) est
journalisée avec un **motif** (catégorie — blocage applicatif, anomalie, mise à
jour… — + note libre). Relève du **journal d'audit nominatif** (D41, finalité
sécurité §6.4) : qui / quoi / quand / pourquoi.

**Exécution-once (D57).** Une exécution par défaut, **pas de rollback** (effets
irréversibles assumés : un mail ne se rejoue pas), **jamais d'auto-retry** —
relance **manuelle** depuis l'interface de supervision. Un échec transitoire
attend donc une intervention humaine (acceptable à l'échelle TPE).

**Anti-abus API (D58).** Une tâche déclenchée par API ne s'exécute qu'**une fois
par période** (à définir), mesurée **de la fin de l'exécution au début de
l'appel suivant** — interdit le recouvrement *et* impose un intervalle minimal.
Un rappel pendant la période est **refusé** (tâche non enregistrée). Protège le
hook comme point d'attaque/déstabilisation. **Granularité (D58, résout Q31) :
par tâche + paramètres.**

**Déterminisme et doublons (D59).** Une option `deterministe` sélectionne la
stratégie de gestion des doublons (clé = tâche + paramètres) :

- **Déterministe** : un second appel (mêmes paramètres) dans la **fenêtre de
  déterminisme** → le **résultat mémorisé est rendu**, sans ré-exécuter (pas de
  refus, pas de recalcul, **pas d'effet de bord répété**).
- **Non déterministe** : le **cooldown (D58) refuse** le doublon.

Net : le déterminisme dit « même résultat valide, sers le cache » ; le cooldown
dit « l'effet ne peut se répéter, refuse ». **Trois durées indépendantes** sur
une tâche :

| Durée | Concerne | Rôle |
|---|---|---|
| **Cooldown** (D58) | tâche non déterministe | intervalle min. fin→début ; refuse les doublons |
| **Fenêtre de déterminisme** (D59) | tâche déterministe | mêmes paramètres → résultat mémorisé rendu |
| **Rétention** (D55) | le résultat | disponibilité / restitution |

Ex. : bulletin *déterministe 1 h* (au-delà, régénération) mais *conservé 90 j*.

Cohérences : le déterminisme **résout l'idempotence (D57) par mémoïsation** (rejouer
= renvoyer le cache) ; c'est le **pendant serveur de D45** (le moteur mémoïse là où
D45 recommande au client de cacher + fournit l'`ETag`). **Caveat** : le déterminisme
est une **assertion du technicien** (comme la pureté d'un calcul) ; la fenêtre borne
le risque de résultat périmé (jugement sur la volatilité des données).

**Réinitialisation du déterminisme (D60).** Soupape d'échappement dans la
supervision (D56) : l'administrateur **invalide le cache** d'une tâche — *sans
rien exécuter*. Le **prochain appel** ré-exécute (distinct de la relance D57 qui
exécute *maintenant*). Sert quand la réalité contredit l'assertion (données
changées dans la fenêtre). **Granularité à trois niveaux** : tâche + paramètres
(cette entrée), tâche entière (toutes ses entrées), ou **tout** (vidage global).
Après réinitialisation, la ré-exécution produit un **nouvel `ETag`** → les caches
clients (D45) se resynchronisent.

**Traitement d'anomalie & notification (D87 ; résout Q21).** L'écriture
connecteur (D85) **est une tâche**, donc **non transactionnelle** (D57) ; la
**reprise se gère à l'intérieur de la tâche** (opt-in — pas d'auto-retry moteur ;
respecter l'idempotence comme D57/D59). En cas d'anomalie :
- **trace pour le technicien** (journal d'exécution, D41/D62) — diagnostic ;
- **notification au(x) déclencheur(s)** pour relancer ou trouver une solution,
  **via leur canal** : déclencheur interface → **in-app** ; déclencheur API →
  **webhook/callback** sortant. (Réponse à Q21 : *les deux*, selon le canal.)
- **Droit de relance selon la nature de la tâche (D88)** — distinct de la
  notification (toujours au déclencheur). La tâche **déclare** sa politique :
  - *tâche explicite* (lancée consciemment) → **déclencheur** autorisé, sous
    conditions (état d'échec terminal ; idempotence/déterminisme rendant le rejeu
    sûr) ;
  - *tâche de propagation connecteur* (D85) → **admin seulement** (supervision
    D56) ; relancer à l'aveugle = double-écriture / données périmées. La relance
    admin = **re-propagation de l'état courant** (pas rejeu du payload périmé) ;
    l'idempotence de la propagation (upsert, pas append) reste à la charge de la
    tâche.

**Apport au méta-schéma** : la déclaration complète de tâche (signature,
connecteurs, 5 déclencheurs, deux droits dont principals contextuels, portée de
lecture, mode d'exécution, cooldown, **déterminisme + fenêtre**, rétention,
**canal de notification**, **politique de relance**) ; la solution intégrée de
supervision.

### 8.5 Infrastructure de notifications (D108–D110, résout Q46)

Assemblage de briques existantes — pratiquement aucune machinerie neuve.

- **Canaux = connecteurs (D108).** Syncytium livre des connecteurs de
  notification built-in ; le technicien en ajoute via hooks (D52). **« Le
  connecteur est le vecteur, la configuration porte le contenant »** : les
  modèles de messages sont des **paramètres du connecteur** (s'il le permet) —
  ex. email : gabarits (langage D90) de titre, destinataire, contenu, pièces
  jointes, déclarés dans la description.
- **Canaux autorisés / choix utilisateur (D109).** La **description déclare les
  canaux utilisables et autorisés** ; l'utilisateur **sélectionne via son profil**
  l'un des canaux qui lui sont autorisés (double gouvernance : le modèle borne,
  l'utilisateur choisit dedans).
- **Livraison garantie + historique (D110).** La notification est **persistée
  d'abord** dans Syncytium — **entité décrite via le méta-modèle** — puis remise :
  c'est le patron **outbox**. Remise externe = **tâche de propagation connecteur**
  (D85), reprise dans la tâche (D87), visible en supervision (D56) — jamais
  perdue, au pire *en attente de remise*. **Rétention à durée maximale**
  (patron D41/D55). Conséquences gratuites : le **canal in-app = lecture du
  magasin** (l'IHM générée affiche l'entité) ; la **confidentialité s'applique
  seule** (notification adressée à X visible de X — appartenance directe D71).

**Apport au méta-schéma** : l'entité notification ; canaux autorisés (description)
+ canal choisi (profil) ; gabarits de message en paramètres de connecteur.

---

## 9. Étude comparative et positionnement (Q5)

> Recherche sourcée, **juin 2026**. Méthode : recherche multi-angles +
> vérification adversariale (vote 3 voix/claim ; 24 confirmés / 25). Forte
> sensibilité temporelle — licences à **re-vérifier à la date d'usage**.

**Verdict** : aucun framework, OSS ou propriétaire, n'égale Syncytium sur
**l'ensemble** de la combinaison. Chaque pilier isolé a des précédents, **sauf le
pilier (2)** — génération **automatique** des traductions d'API bidirectionnelles
à partir de migrations de modèle déclaratives — qui **n'a aucun précédent open
source confirmé**. C'est le différenciateur central, et il tient.

### 9.1 Par pilier

**Migration à chaud déclarative (pilier 1) — précédents solides :**
- **Atlas** (ariga) : migration déclarative *state-based* + dry-run (cœur OSS) ;
  mais **aucun versioning d'API**, et un renommage peut dégénérer en drop+create
  (perte de données) — ce que les règles explicites D4–D6 évitent.
  <https://atlasgo.io/declarative/apply>
- **pgroll** (xata, Apache-2.0) : zéro-downtime *expand/contract*, plusieurs
  versions de schéma via vues+triggers → compat bidirectionnelle **au niveau
  SQL**, pas une traduction requêtes/réponses d'API rejouée depuis un journal.
  <https://github.com/xataio/pgroll>

**Compatibilité d'API bidirectionnelle (pilier 2) — le différenciateur :**
- **Stripe** : exactement le modèle de chaîne de traduction (modules de version
  appliqués en ordre inverse), mais **interne/propriétaire** et transformations
  **écrites à la main**. <https://stripe.com/blog/api-versioning>
- **OSS « façon Stripe »** : request-migrations (MIT, dormant 2019), gates (PoC),
  keygen request_migrations (le plus mûr) — reproduisent le pattern bidirectionnel
  mais **tous exigent des transformations manuelles** ; aucun n'auto-génère depuis
  un modèle. <https://github.com/tomschlick/request-migrations>
- **Upcasters event-sourcing** (Axon, Marten) : reconnus, mais **code manuel et
  unidirectionnels** (forward only). <https://arxiv.org/abs/2104.01146>
- **Confluent Data Contracts** : le plus proche — règles déclaratives
  bidirectionnelles (UPGRADE/DOWNGRADE) **chaînées transitivement** — mais sur
  **messages Kafka** (pas DB+REST) et **licence Enterprise/Cloud payante**.
  <https://docs.confluent.io/platform/current/schema-registry/fundamentals/data-contracts.html>

→ Le **couplage automatique migration-de-modèle → traduction-d'API
bidirectionnelle** reste sans équivalent OSS.

**Tech-agnosticité & metadata-driven (piliers 3–4)** : précédents partiels à
examiner — **Apache Causeway** (naked objects : domaine→UI auto), **NocoBase**,
**Oinone/Pamirs**.

### 9.2 Contexte de licence 2026 — favorable

Les voisins directs ont **quitté l'open source** en 2026 :
- **Directus** v12 (mai 2026) : BSL → MSCL, source-available **non OSS**, clause
  anti-concurrence (GPLv3 après 4 ans).
  <https://directus.io/blog/directus-v12-license-change>
- **NocoDB** v0.301.0 (jan. 2026) : AGPLv3 → « Sustainable Use License » **non
  OSI**. <https://github.com/nocodb/nocodb/discussions/12891>

→ Syncytium revendique l'AGPL réelle exactement quand ses voisins se ferment :
positionnement isolé et différenciant.

### 9.3 Limites de l'étude

- **Couverture incomplète** : Strapi, Hasura, Supabase, PostgREST, Baserow,
  Budibase, Appsmith, ToolJet, Retool, Salesforce, Power Platform/Dataverse,
  Mendix, OutSystems **non réfutés pièce-par-pièce** — le verdict repose sur
  l'absence de précédent du pilier (2) + l'analyse de catégorie.
- **keygen request_migrations** (candidat OSS le plus mûr) à examiner précisément.
- Une **absence ne se prouve jamais** de façon absolue ; licences volatiles.

### 9.4 Implication pour Q5

Le **« construire »** est justifié — pilier (2) sans équivalent + timing AGPL —
**à condition d'assumer** la réimplémentation du tronc commun (modèle→UI→API) que
des OSS (Directus, Strapi, Hasura…) offrent déjà. Concurrents/menaces à
surveiller : **Directus, NocoDB, NocoBase, Apache Causeway**, et les plateformes
metadata-driven propriétaires (Salesforce, Dataverse, Mendix, OutSystems).
Piste hybride (socle existant + couche différenciante par-dessus) généralement
incompatible avec l'exigence de tech-agnosticité et d'AGPL → à écarter sauf
réévaluation.

---

## 10. Questions ouvertes

| # | Question | Enjeu |
|---|----------|-------|
| ~~Q1~~ | ~~Ordre de grandeur ?~~ | **Résolu (D15)** : ~20 utilisateurs simultanés, plusieurs Go → migration directe, mono-serveur, voir §7. |
| ~~Q2~~ | ~~Systèmes tiers : sous contrôle ou externes ?~~ | **Résolu (D11)** : non maîtrisés → compatibilité bidirectionnelle obligatoire, voir §5. |
| ~~Q3~~ | ~~Sens des intégrations ?~~ | **Résolu (D20–D24)** : les deux — exposition sélective avec champs calculés, lecture/écriture unitaire-liste-lot, connecteurs vers systèmes externes, tâches asynchrones suivies — voir §5.5. Détails ouverts : Q17–Q21. |
| ~~Q4~~ | ~~Contexte de déploiement, authentification ?~~ | **Résolu (D15–D16, D29)** : une instance par TPE, hébergement au choix du client ; authentification locale via l'interface (socle) ou provisionnée par AD (clients équipés). |
| Q5 | **Construire sur mesure ou s'appuyer sur un existant** ? | **Largement éclairé par l'étude §9** : aucun équivalent sur l'ensemble ; le pilier (2) (compat d'API bidirectionnelle auto-générée) est sans précédent OSS → le « construire » est justifié, à condition d'assumer le tronc commun. Décision stratégique finale à acter par l'auteur. |
| ~~Q6~~ | ~~Syntaxe des règles ?~~ | **Résolu (D90–D91, §3.3)** : langage d'expression **unique** (gabarit, regex, transcodage constante/lookup, arithmétique, agrégats, composable ; hook = échappatoire), partagé par calculs/migrations/API/connecteurs ; invertibilité par règle (substitution sinon). |
| Q7 | Pile technique (langage, base de données, framework d'interface). | **Différé volontairement (D18)** — critères pour la base déjà consignés au §7.1 (transactionnalité D9 en tête) ; abstraction de la persistance imposée dès la conception ; **dépendances compatibles AGPL** (D19) ; **renderer d'IHM interchangeable** grâce au modèle déclaratif (D69), critère : supporter un rendu `config → HTML`. |
| ~~Q8~~ | ~~Fenêtre de support / durée de dépréciation ?~~ | **Résolu (D12, D94)** : pas une durée mais une **version minimale supportée** déclarée ; appel sous le seuil → **426 Upgrade Required**. |
| ~~Q9~~ | ~~Mécanisme d'épinglage ?~~ | **Résolu (D28, D98)** : version épinglée au **compte technique** + **surcharge par en-tête** d'essai ; garde-fous (publiée D99, ≥ minimale D94) ; bascule = acte admin tracé. |
| ~~Q10~~ | ~~Politique pour les opérations avec perte ?~~ | **Résolu (D13)** : valeur de substitution pendant la dépréciation, suppression au terme — voir §5.3. |
| ~~Q11~~ | ~~Cadence de publication des contrats ?~~ | **Résolu (D99, D103)** : publication = acte déclaratif, sans cadence. **Quatre états** : officielle / bêta (sollicitation explicite D98) / interdite / dépréciée. L'enchaînement (chaîne de traduction) est **indépendant** des états — appelabilité ≠ traversabilité. |
| ~~Q12~~ | ~~RGPD / forme de la télémétrie ?~~ | **Résolu (D38–D41, §6)** : usages agrégés sur le schéma (champ à la volée, entité stockée) ; acteurs identifiés uniquement sur les comptes techniques d'API ; journal à rétention paramétrable + option d'anonymisation ; client responsable de traitement. |
| ~~Q13~~ | ~~Restitution de la télémétrie ?~~ | **Résolu (D43–D44, §6.5)** : cinq canaux (tableau de bord, rapport de dry-run, synthèse périodique, alerte d'échéance, analyse de sécurité), réunis en solution intégrée sur le méta-schéma. |
| ~~Q28~~ | ~~Seuils de diversité ?~~ | **Résolu (D46, D48, D49)** : deux indicateurs (représentative, scalaire), seuils déclarés par champ dans le schéma, **pas de défaut** (seuil absent = aucun contrôle). Faux positifs neutralisés par construction. |
| ~~Q29~~ | ~~Calibration du modèle de risque ?~~ | **Clos (D47, D50, D51, D97)** : défauts fixés — fenêtre 30 j (unité jour), linéaire par défaut / log sur demande, pic z ≥ 3 + plancher 100/j, crawl > 50 % d'une table > 1000 lignes, R² ≥ 0,5. Ajustables à l'initialisation de l'instance. |
| Q30 | **Volet conseil — étude dédiée différée** (D45) : fouille de motifs de séquences d'appels, fondée sur l'implémentation personnelle existante de l'auteur (analyse des automatismes d'accès PostgreSQL). | D'un autre ordre de complexité ; traité à part le moment venu. Voir §6.5. |
| ~~Q14~~ | ~~Modèle de déploiement / qui est le technicien ?~~ | **Résolu (D16, D17, D95)** : une instance par TPE, moteur public, mise à jour technique manuelle, description à chaud (§7.2). Le **« technicien » = un rôle moteur de Syncytium**, paramétrable, affectable à 1..n personnes physiques (D95). |
| ~~Q15~~ | ~~Licence ?~~ | **Résolu (D19)** : AGPL. Gouvernance des contributions : **question à part entière, formellement différée** — les premières versions **ne solliciteront pas** de contributions externes ; réouverture selon retours et besoins (CLA/DCO + processus à définir alors). |
| Q16 | **Versionnement du format de descriptif** : politique de compatibilité moteur ↔ descriptions dans un parc hétérogène ; la procédure de migration technique inclut-elle la conversion des descriptions ? | Miroir de la problématique API (§5), transposée au contrat moteur/description — voir §7.2. **Le format de description = le méta-schéma (D44)** : Q16 versionne donc le méta-schéma, possédé par le moteur. **À TRAITER EN DERNIER — synthèse** : le méta-schéma est le point de convergence ; hooks, API, connecteurs et règles y déposeront des propriétés. Le définir avant eux serait prématuré. Contributeurs déjà connus : D2, D25, D27, D4–D6, D35–D36, D37, D49–D50 ; **interfaces de hooks versionnées (D52)** ; **déclaration de tâche + principals contextuels (D53–D58)** ; **thème, cartographie type→composant, surcharges, interface de composant, registre (D63–D68)** ; **vocabulaire de description de rendu déclaratif (D69)** ; **dimension d'audience + appartenance + délégation (D70–D77)** ; **connecteurs : modèle auto-décrit, clé d'unicité, entité virtuelle (D78–D89)** ; **langage d'expression unique (D90–D91)**. |
| ~~Q17~~ | ~~Confidentialité : globale ou par profil ?~~ | **Résolu (D25, D26)** : trois niveaux emboîtés (public/protégée/privée) + restriction par compte ou groupe, défaut global — voir §5.5. Détails ouverts : Q22–Q23. |
| ~~Q18~~ | ~~Portée des champs calculés ?~~ | **Résolu (D35–D36)** : paliers 1+2 actés ; agrégats en vocabulaire minimal à la volée + hook de code personnalisé — voir §5.5. Modalités du hook : Q26. |
| ~~Q19~~ | ~~Pagination et lots ?~~ | **Résolu (D100, D101)** : curseur **opaque porté par la mécanique** (embarque la version de schéma) ; **lots de transactions** (1 niveau — ligne-à-ligne et tout-ou-rien = cas dégénérés) ; **atomicité portée par le modèle** (agrégats déclarés = plancher ; raffinement si autorisé ; composition libre vers le haut). |
| ~~Q20~~ | ~~Connecteurs ?~~ | **Résolu** : identité (D78, D80–D82) ; données (D83–D87) ; relance (D88) ; **conflits bidirectionnels portés par le connecteur** (D89). Cadre = moteur, sémantique métier = connecteur. |
| ~~Q21~~ | ~~Tâches — notification de fin ?~~ | **Résolu (D87)** : catalogue (D37) + notification au **déclencheur via son canal** — in-app (interface) ou webhook/callback (API). Trace technicien en parallèle. |
| ~~Q22~~ | ~~Modèle de comptes et groupes ?~~ | **Résolu (D27–D29)** : groupes dans la description, comptes (techniques/nominatifs étanches) et affectations gérés par un administrateur via l'interface, AD en provisionnement optionnel — voir §5.6. |
| ~~Q23~~ | ~~Frontières de sécurité dérivées ?~~ | **Résolu (D53 tâches, D102 calculs)** : héritage du niveau **le plus restrictif des sources** (fail-closed) ; **abaissement explicite obligatoire**, signalé par la validation. |
| ~~Q24~~ | ~~Amorçage de l'administration ?~~ | **Résolu (D33)** : compte administrateur + empreinte de mot de passe dans la description, utilisable seulement si aucun administrateur n'existe dans l'interface. |
| ~~Q25~~ | ~~Suppression d'un groupe ayant des membres ?~~ | **Résolu (D34, D96)** : note au technicien et groupe ignoré (fermé par défaut) ; un groupe réapparaissant (clé = identifiant stable) **fait revivre** les affectations conservées — résilience aux suppressions par inadvertance (D96). |
| ~~Q26~~ | ~~Contrat des hooks ?~~ | **Résolu** : calcul (§5.5), tâche (D53–D62, §8.4), interface (D63–D68, §8.3). Principe uniforme D52. |
| ~~Q27~~ | ~~Périmètre du hook d'interface ?~~ | **Résolu (D63–D69, §8.3)** : thème + bibliothèque ouverte (type→composant, surcharge champ→composant), injection comportementale (UX, pas sécurité), pas de patch des internes. Bac à sable résolu par le **modèle de composant déclaratif** (D69, à la Webix). |
| ~~Q31~~ | ~~Granularité du cooldown ?~~ | **Résolu (D58)** : par **tâche + paramètres**. Ajout d'une option `deterministe` (D59) : mémoïsation du résultat dans une fenêtre dédiée. Reste : valeur des durées (cooldown, fenêtre) — réglage. |
| ~~Q32~~ | ~~Principals d'accès contextuels ?~~ | **Résolu (D70–D76, §5.7)** : dimension d'audience interne/externe ; accès au niveau ligne par appartenance (directe/indirecte/ouverte/fermée) ; orthogonalité ligne×champ ; lecture/écriture par champ ; OU seulement ; id contextuels anti-IDOR ; impersonation + délégation on-behalf-of. |
| ~~Q33~~ | ~~Provisionnement des comptes clients ?~~ | **Résolu (D77)** : 4 types de compte (technique / utilisateur / client issu d'une fiche ADV / client auto-créé vérifié, ce dernier non prioritaire). Le type 3 concrétise l'appartenance D71. |

### Lacunes issues de l'audit (2026-06-12) — **thème A prioritaire**

Le modèle de données a été volontairement différé (faire émerger d'abord tout le
méta-modèle inhérent) ; il est maintenant le prochain volet, et il complétera IHM
et API. Les questions ci-dessous sont **contributrices du méta-schéma** (à traiter
avant la synthèse Q16).

| # | Question | Enjeu |
|---|----------|-------|
| **A — Modèle de données (prioritaire)** | | |
| Q34 | **Catalogue de types de champs** : primitifs (texte, nombre, booléen, date, date-heure **+ fuseau**, monnaie, durée), contraints (choix, référence, fichier), dérivé (calculé, multi-valué D92) ; formats et contraintes. | Socle du méta-schéma ; dont dépendent le composant IHM par défaut (D64) et l'exposition API. |
| Q35 | **Relations** : cardinalités (1-1, 1-N, **N-N**), intégrité référentielle, suppression (restrict/cascade/mise à null). | N-N via entité de liaison (« tout est entité ») ; défaut *restrict* (fail-closed). |
| Q36 | **Validation à l'écriture** : contraintes déclaratives (obligatoire, unique, plage, format) + **règles inter-champs** via le langage d'expression (D90). | Garantit l'intégrité en entrée ; se raccroche à D90. |
| Q39 | **Pièces jointes / fichiers binaires** : type `fichier`, stockage des blobs, quotas. | Non couvert (le PDF D24 est une sortie de tâche, pas un champ). |
| Q37 | **Historique / audit des modifications de données** (qui a changé quelle valeur, quand) — **rattachée au modèle de données** (2026-07-02) ; l'auteur précisera son point de vue. | Distinct de la télémétrie (agrégée D46), du journal de migrations (schéma) et de l'audit de supervision (D62) ; conformité / annulation. |
| **B — Cycle de vie & exploitation** | | |
| ~~Q40~~ | ~~Sauvegarde / cohérence donnée↔version ?~~ | **Backup physique délégué** au SGBD/hébergement (D16/D18/Q4). **Résiduel résolu (D93)** : estampille de version interne dans la base (deux axes : description + moteur), garde-fous fail-closed au démarrage. |
| ~~Q41~~ | ~~Concurrence & verrouillage ?~~ | **Résolu (D111)** : 3e voie — état-avant/état-après, jeton de concurrence au **grain du champ**, unique IHM+API ; fusion des champs disjoints, conflit → agrégat rejeté (409/410), premier arrivé gagne, second notifié. |
| ~~Q42~~ | ~~Environnement de test / pré-production ?~~ | **Résolu (D112–D114, §7.3)** : multi-environnements — prod (dernière publiée) + un staging par bêta instancié à la volée par migration, API bêta redirigées ; sync synchrone (traduite inter-versions) ou différée ; même mécanisme pour le **PCA/PRA** (actif/passif, bascule client). |
| Q49 | **Initialisation d'une instance par reprise de données** (ajout 02/07/2026) : connexion à une **base de données tierce** et **conversion** vers le modèle Syncytium. Sous-questions : connecteur **jetable** (one-shot) ou début d'un connecteur **permanent** (cohabitation) ? traitement des **rejets** (correction à la source / règles en vol / quarantaine) ? import de l'**historique** d'origine (lien Q37) ? | Cas décisif pour l'adoption (une TPE a toujours un existant). Assemblage pressenti : connecteur auto-descriptif (D83) + translation (D79/D90) + **dry-run d'import avec rapport** (D7/§4.1) + tâche à progression (D55) + UUID (D82) + estampille posée à l'issue (D93). À traiter avec/après le modèle de données (le mapping suppose Q34). |
| **C — Sécurité d'exécution** | | |
| ~~Q43~~ | ~~Robustesse d'exécution ?~~ | **Résolu (D104)** : pas de timeout sur les fonctions **simples** ; timeout **paramétrable** sur les fonctions **complexes** (classification au catalogue de fonctions). Gardes existants inchangés (D36/D55/D69/D7). |
| ~~Q44~~ | ~~Authentification API & débit global ?~~ | **Résolu (D105, D107)** : rate limiting 15 req/sec + surcharge par compte (429/`Retry-After`) ; **clé API rotative** par défaut ; **on-behalf-of par header dédié** (périmètre D76) ; OAuth2/RFC 8693 en déclinaison (D78). |
| **D — Transverses** | | |
| ~~Q46~~ | ~~Infrastructure de notifications ?~~ | **Résolu (D108–D110, §8.5)** : canaux = connecteurs (vecteur vs contenant, templates en paramètres) ; canaux autorisés dans la description + choix par profil ; persistée d'abord (entité du méta-modèle, outbox) → livraison garantie, historique à rétention max, in-app = lecture du magasin. |
| Q47 | **Spécification fine du langage d'expression** (D90–D92) : catalogue de fonctions, sémantique (**null**, coercition, erreurs → substitution), grammaire + classification **simple/complexe** (D104). | Pilier du méta-schéma ; précise D90. |
| **E — UI/UX (regroupe l'affichage)** | | |
| Q38 | **Recherche & filtrage** : plein-texte ? portée (par entité / globale) ? quels champs interrogeables/triables (attribut déclaratif par champ, patron D49/D50) ? | Deux contraintes déjà identifiées : le **langage de filtre exposé ≠ D90** (utilisateurs/consommateurs non maîtrisés → sous-ensemble contraint champ+opérateur+valeur, OU/ET simples) ; **on ne filtre/trie que ce qu'on peut lire** (anti-oracle : niveau D25 + audience D70). |
| Q45 | **Internationalisation** : libellés multi-langue, formats locaux (date/nombre/monnaie), fuseaux horaires — y compris la langue des **notifications** (D108) et des messages d'erreur. | Framework destiné à plusieurs TPE. |
| Q48 | **Organisation de l'IHM générée** : quels **écrans** exactement (listes, fiches, formulaires — §3.1 non détaillé), déclaration de la **navigation/menus**, **vues par défaut** d'une entité, tri, regroupements. | L'architecture IHM est décrite (D63–D69, D100) ; son **contenu fonctionnel** ne l'est pas. Dépend de Q34 (types → composants D64). |

---

## 11. Journal des échanges

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
- **2026-06-12 (suite 2)** — Dimension temporelle des compteurs (D42) : seaux
  journaliers sur périodes glissantes, agrégés en semaine/mois/année avec l'âge.
  Le downsampling devient la politique de rétention (granularité décroissante).
  Compteurs additifs (agrégation = somme) vs diversité non additive (reste à la
  volée) : les choix D38/D39-D40 se confortent. Permet la détection de tendance
  dans le rapport de dry-run.
- **2026-06-12 (suite 3)** — Restitution (résout Q13, D43–D44). Cinquième canal :
  **analyse de sécurité** (3e finalité, D43) — alerter sur usages/accès non
  autorisés ou anormaux ; vue dérivée du journal + compteurs, impose de
  journaliser les refus d'autorisation, D42 donne la ligne de base ; garder la
  détection simple (Q29). Les cinq canaux (tableau de bord, dry-run, synthèse
  périodique, alerte d'échéance, sécurité) forment une **solution intégrée sur le
  méta-schéma** (D44) : Syncytium se décrit lui-même (pattern catalogue système),
  collecte = couche moteur survivant à une description cassée, restitution générée
  par la même machinerie. Généralise D33 ; **le méta-schéma est l'objet de Q16**
  (versionnement du format = versionnement du méta-schéma). Modèle d'ensemble :
  un substrat de collecte, trois finalités en couches d'analyse.
- **2026-06-12 (suite 4)** — Volet conseil de la synthèse périodique (D45).
  Analyse des schémas d'appels d'API pour recommander cache (le moteur fournit
  l'`ETag`), lecture par lot (vs N+1), et émergence de nouveaux besoins (endpoint,
  agrégat, champ calculé). Deux destinataires : consommateur (change son code) et
  technicien (fait évoluer l'API). Consultatif, RGPD léger (comptes techniques).
  Révèle la symétrie : la télémétrie referme la boucle metadata-driven sur les
  deux faces — interne (D38) et externe (D45). Nouvelle question Q30 (règles de
  détection).
- **2026-06-12 (suite 5)** — Définition des indicateurs de télémétrie avant
  calibration des seuils. **Diversité (D46)** = valeurs distinctes non nulles /
  lignes de l'entité (ratio de cardinalité) ; caveat consigné : `distinct = 1`
  = signal fort, `distinct ≥ 2` peut être légitime (booléen/statut/choix).
  **Anomalie de sécurité (D47)** = pente de la droite de régression des
  sollicitations sur période glissante ; à normaliser, détecte les rampes (pas
  les pics → 2e forme z-score), pente des refus = signal fort. **Q30 (volet
  conseil)** différée vers une étude dédiée fondée sur l'implémentation
  personnelle existante de l'auteur (analyse des automatismes d'accès
  PostgreSQL). Q28/Q29 réduites au seul réglage des seuils.
- **2026-06-12 (suite 6)** — Diversité scindée en **deux indicateurs orthogonaux**
  (D46 représentative = distinctes/lignes → retirer le champ ; D48 scalaire =
  distinctes/domaine théorique → resserrer le domaine). Le domaine théorique se
  dérive du type/contraintes déclarés (énum, booléen, numérique borné, chaîne
  formatée ; indéfini si non borné) — les formats servent validation **et**
  indicateur. **Seuils par champ déclarés dans le schéma** (D49) : la connaissance
  métier neutralise les faux positifs ; nouvel attribut du méta-schéma, défauts
  par type surchargeables. Q28 résolue dans son approche (reste : valeurs par
  défaut).
- **2026-06-12 (suite 7)** — Clôture de Q28 : **pas de valeurs par défaut**.
  Seuil absent = aucun contrôle — silence par défaut, signalement strictement
  opt-in, zéro faux positif par construction (D49 ajustée). Le tableau de bord
  affiche toujours la diversité à la demande ; seul le flag automatique requiert
  un seuil déclaré.
- **2026-06-12 (suite 8)** — Enrichissement de D47 en **modèle de risque
  multi-composantes** : deux portées (global + par endpoint) ; pente linéaire
  (croissance parfois légitime, ex. outil qui monte en charge) vs **logarithmique**
  (exponentiel = danger moteur) ; pente **croisée au volume** (sinon bruit) ;
  détecteur de pics jugé par l'**étendue d'accès** (pic de clôture comptable
  légitime vs balayage de toutes les affaires = crawl). **Symétrie majeure** :
  crawl ≡ N+1 (D45) — même signal d'étendue, séparé par l'autorisation de
  l'acteur ; l'indicateur d'étendue sert sécurité (D43) et conseil (D45). Q29
  élargie à la calibration de ce modèle.
- **2026-06-12 (suite 9)** — Placement des seuils de sécurité (D50) : déclarés
  dans la description, portés par les **endpoints, entités et fonctionnalités
  d'IHM**. Généralise D49 → les seuils de télémétrie sont un attribut déclaratif
  par élément du méta-schéma, tous types confondus ; les fonctions d'IHM entrent
  dans le périmètre sécurité. Reste en Q29 la **posture par défaut** : opt-in
  strict vs filet de sécurité (moteur surveillant toujours refus d'autorisation
  + croissance exponentielle, seuils déclarés affinant) — filet recommandé car
  une alerte de sécurité ne peut se taire.
- **2026-06-12 (suite 10)** — Clôture de Q29 (D51, filet de sécurité retenu) :
  seuils globaux par défaut sur le modèle + surcharge par élément. Asymétrie
  assumée avec Q28 — sécurité : seuil absent = défaut global s'applique (pas
  d'angle mort silencieux). Défaut global : pente de régression sur 1 semaine
  > 1 pour un volume > 1000 appels (pente croisée au volume). Variantes
  log/pic/étendue calées plus tard via le même cadre global + override.
- **2026-06-12 (suite 11)** — Précision sur la pente (D47/D51) : c'est le
  coefficient de la régression des points quotidiens sur fenêtre glissante (taille
  à définir). **Normalisée** : pente > 1 ⇔ « plus que doublé » sur la fenêtre,
  quel que soit le volume (l'interprétation brute « +1 appel/jour » est
  abandonnée). Pente (forme) et volume (poids) = conditions orthogonales. **Écart
  type délibérément écarté** : distinguerait progression régulière/asymétrique
  mais alourdirait le paramétrage sans gain proportionné pour une TPE (rationale
  conservée).
- **2026-06-12 (suite 12)** — Séquencement : **Q16 (méta-schéma) à traiter en
  dernier**, comme synthèse. Argument de l'auteur : hooks, API, connecteurs et
  syntaxes de règles porteront des propriétés qui enrichiront le méta-modèle ; le
  définir avant serait dessiner le réceptacle avant d'en connaître le contenu.
  Principe de travail adopté : à chaque sujet, relever explicitement ce qu'il
  ajoute au méta-schéma, pour que Q16 ne soit qu'une consolidation. (Révision de
  la recommandation précédente qui plaçait Q16 en tête.)
- **2026-06-12 (suite 13)** — Ouverture de Q26 (contrat des hooks). Principe
  fondateur (D52, nouveau §8.0) : **mécanisme uniforme** pour fonctions internes
  (Syncytium) et externes (technicien), via des **interfaces communes** par mode ;
  socle de hooks de base enrichissable ; built-in = extensions de première partie,
  même frontière de sécurité, implémentations de référence. Impose registre +
  namespacing et versionnement des interfaces (→ Q16). Troisième occurrence du
  motif « mécanisme uniforme distingué par la provenance » (cf. D28, D44),
  généralisable à connecteurs/auth = modèle d'extension unique. Restent à traiter
  pour Q26 : contrats fins des modes tâche (droits déclenchement/résultat,
  idempotence, rétention, durée) et interface (délégation aux tâches, API
  navigateur).
- **2026-06-12 (suite 14)** — Contrat du hook de **tâche** arrêté (D53–D58, §8.4
  réécrit). Droits : `declenche_par` ⊆ `resultat_lu_par`, lecteurs additionnels
  pouvant être des **principals contextuels** (`employe_concerne` → sécurité au
  niveau ligne, Q32) ; exécution avec la portée propre de la tâche (élévation
  type SUID) (D53). Cinq déclencheurs dont **enchaînement** ; sync/async toujours
  non bloquant avec progression (le synchrone = posture d'IHM) (D54). File
  d'attente + état/progression (compteur/total+message) + résultat enregistré à
  durée déterminée (D55). Interface de supervision = solution intégrée (annuler/
  reporter/reprioriser + journal succès/échec/exception) (D56). Exécution-once,
  pas de rollback, pas d'auto-retry, relance manuelle (D57). Anti-abus API :
  cooldown mesuré fin→début, rappel refusé (D58, granularité Q31). Q26 : reste le
  mode interface (Q27). Q23 (tâches) résolu.
- **2026-06-12 (suite 15)** — Q31 résolue (D58 : cooldown **par tâche +
  paramètres**) et option **`deterministe`** ajoutée (D59) : pour une tâche
  déterministe, un doublon (mêmes paramètres) dans la **fenêtre de déterminisme**
  rend le résultat **mémorisé** sans ré-exécuter (≠ rétention) ; sinon le cooldown
  refuse. Trois durées indépendantes sur une tâche (cooldown / déterminisme /
  rétention). Le déterminisme résout l'idempotence (D57) par mémoïsation (pas
  d'effet répété) et est le pendant serveur de D45 ; c'est une **assertion du
  technicien**, la fenêtre bornant le risque de péremption.
- **2026-06-12 (suite 16)** — Réinitialisation du déterminisme (D60) ajoutée à la
  supervision (D56) : l'administrateur invalide le cache d'une tâche (une entrée
  tâche+paramètres ou toutes) sans exécuter ; le prochain appel ré-exécute.
  Soupape quand la réalité contredit l'assertion D59 ; distincte de la relance
  (D57, qui exécute maintenant) ; produit un nouvel `ETag` resynchronisant les
  caches clients (D45).
- **2026-06-12 (suite 17)** — Supervision élargie. Réinitialisation du déterminisme
  à **trois niveaux** (tâche+paramètres / tâche / tout) (D60). **Contrôles globaux
  de la file** (D61) : tout annuler / mettre en pause / relancer — même primitif
  que le drainage de migration (D24/D54), avec le caveat D57 (pause = arrêt du
  démarrage, effets en cours non annulés). **Audit des actions de supervision**
  (D62) : chaque action journalisée avec un motif (catégorie + note : blocage,
  anomalie, mise à jour) → journal d'audit nominatif (D41, finalité sécurité).
  Deux étages de contrôle : par tâche et global.
- **2026-06-12 (suite 18)** — Contrat du hook d'**interface** arrêté (D63–D68,
  §8.3 réécrit ; **résout Q26 et Q27**). Principe : interface générée complète,
  hooks = enrichissements optionnels, dégradation gracieuse. Quatre couches :
  **thème** (D63) ; **bibliothèque par défaut** riche pilotée par type→composant
  (D64) ; **surcharge champ→composant** avec interface de composant commune
  built-in/custom (D65) **et bibliothèque ouverte/enrichissable** par le technicien,
  composant ajouté mappable en défaut de type (D68) ; **injection comportementale**
  (filtres, post-validation) dogfoodée, **UX jamais sécurité**, effets via tâches
  (D66). **Pas de patch des internes** (compat ascendante, D67) → remplacer ou
  injecter. Dégradation : repli sur le built-in par défaut. Résiduel Q27 : degré
  de bac à sable. Le volet **hooks (D37, D52, D53–D68) est clos**.
- **2026-06-12 (suite 19)** — Modèle de composant déclaratif (D69, **clôt Q27**) :
  un composant = fonction pure `config → description de rendu`, le moteur réalise
  le HTML (modèle à la **Webix**, le plus proche du principe originel). Résout le
  bac à sable par construction (pas d'accès DOM ; CSP + Worker ; iframe en
  échappatoire). Surtout : **la technologie de rendu devient un choix
  d'implémentation interchangeable**, les descriptions restant tech-agnostiques et
  pérennes — **parallèle exact avec D18** (persistance) : Syncytium est
  tech-agnostique aux deux bouts (données + IHM), le méta-schéma étant le cœur
  durable. Prix : le vocabulaire de rendu doit être assez riche (iframe = soupape).
  Critère ajouté à Q7 (renderer supportant `config → HTML`).
- **2026-06-12 (suite 20)** — Étude comparative sourcée (nouveau §9, éclaire Q5).
  Verdict : **aucun équivalent sur l'ensemble** de la combinaison ; le **pilier (2)
  (compat d'API bidirectionnelle auto-générée depuis des migrations déclaratives)
  n'a aucun précédent open source** — différenciateur central confirmé. Précédents
  partiels : Atlas/pgroll (migration), Stripe/request-migrations/upcasters
  (versioning manuel), Confluent Data Contracts (déclaratif bidirectionnel mais
  Kafka + payant). Contexte 2026 favorable : Directus et NocoDB ont quitté l'OSS.
  Limites : couverture non exhaustive, keygen request_migrations à examiner.
  Implication Q5 : « construire » justifié si l'on assume le tronc commun.
- **2026-06-12 (suite 21)** — Clôture de Q32 (D70–D76, nouveau §5.7). Q32 ouvre la
  **dimension d'audience** interne/externe : en interne les groupes suffisent, vers
  les **clients** il faut un accès **au niveau ligne** (fermé par défaut). Modèle
  d'appartenance : directe / indirecte (chemin multi-saut) / ouverte à tous les
  clients / non exposée ; propriétaires multiples = union ; sans propriétaire =
  invisible (D70–D71). Orthogonalité ligne×champ — champs internes TPE masqués
  (D72). Lecture/écriture par champ, write ⊆ read (D73). Combinaison OU seulement
  (D74). Filtrage serveur + **id contextuels non devinables** (anti-IDOR) +
  re-contrôle d'appartenance ; impose le filtrage ligne dans l'abstraction de
  persistance D18 (D75). Impersonation admin « agir en tant que » à audit double
  identité + délégation technique « pour le compte de » (OAuth on-behalf-of) (D76).
  Nouvelle question Q33 (provisionnement des comptes clients).
- **2026-06-12 (suite 22)** — Clôture de Q33 (D77) : **quatre types de compte** —
  (1) technique (API), (2) utilisateur interne (groupes), (3) client issu d'une
  fiche client (provisionné par le service ADV), (4) client auto-créé (self-service
  toujours vérifié par les ventes, dérivé de (3), **non prioritaire**). Le type 3
  **concrétise l'appartenance D71** (le `compte` des chemins = la fiche client).
  Étanchéité généralisée par canal ; le compte client suit le cycle de vie de sa
  fiche.
- **2026-06-12 (suite 23)** — Structuration des connecteurs (D78, D79 ; avance
  Q20). **Identité (D78)** : cadre générique, déclinaisons (identification simple,
  SSO, autorisations AD), défaut login/mot de passe, ouvert au technicien ;
  protocole = détail d'implémentation (tech-agnostique). **Données (D79)** :
  composant de **translation** externe↔interne (anti-corruption). Insight : la
  **translation déclarative est un primitif transverse** (migrations, compat
  d'API, connecteurs) → réutilise le vocabulaire D4–D6 ; renforce l'enjeu de Q6.
  Restent les modalités (déclenchement, conflits, mode mixte) dans Q20.
- **2026-06-12 (suite 24)** — Identité de Q20 résolue (D80, D81). **Source unique**
  (pas de mode mixte) + **changement gardé** : validation préalable (auth de test
  réussie) avant bascule, repli rapide, échec → on reste sur l'ancienne (D80).
  **Secours bris-de-glace** (D81, étend D33) : le compte de secours s'active aussi
  quand l'authentification est indisponible (santé du connecteur actif) ;
  indépendant de tout connecteur externe ; activation auditée (D62) + alertée
  (D43). Reste côté données : déclenchement, conflits ; petit résiduel identité :
  rapprochement des comptes par email lors d'un changement de source.
- **2026-06-12 (suite 25)** — Rapprochement des comptes résolu (D82). Identité
  interne = **UUID stable** (ancre de l'appartenance D71, de l'audit, des
  références ; cohérent avec les id opaques D75). **Clé d'unicité définie par le
  connecteur** (variable par connecteur/TPE) : GUID Entra/AD + courriel, ou
  courriel/login en local. Nuance : clé immuable en priorité (email mutable =
  repli), opération admin de re-liaison/fusion prévue. Volet **identité de Q20
  entièrement clos** ; restent les modalités des connecteurs de données.
- **2026-06-12 (suite 26)** — Modèle des connecteurs de données (D83–D86, 3 cas :
  AD lecture, CSV écriture, CRM bidirectionnel). **Auto-description** : le
  connecteur porte son propre modèle, Syncytium mappe dessus (D83). **Entité
  persistée vs virtuelle** + multi-occurrences DB+connecteurs (D84). **Écriture :
  DB synchrone, connecteurs asynchrones via la file de tâches** (D85). **Cache de
  lecture** configurable (D86, cf. D59). Déclenchement réglé (lecture à la
  demande+cache, écriture en file). Résiduels : conflits bidirectionnels (CRM) et
  reprise/cohérence à terme des écritures connecteur (≠ at-most-once D57). Les
  entités virtuelles excluent migrations/diversité (persisté seulement).
- **2026-06-12 (suite 27)** — Reprise et notification des tâches (D87 ; résout Q21
  et le résiduel reprise de D85). L'écriture connecteur **est une tâche** non
  transactionnelle (D57) ; la **reprise se gère dans la tâche** (opt-in,
  idempotence), pas d'auto-retry moteur. Anomalie : **trace technicien** +
  **notification au déclencheur via son canal** (in-app si interface, webhook si
  API — réponse à Q21). Q20 : ne reste plus que les **conflits bidirectionnels**.
- **2026-06-12 (suite 28)** — Droit de relance précisé (D88, ajuste D87). Distinct
  de la notification (toujours au déclencheur). **Tâche explicite** → déclencheur
  autorisé sous conditions (échec terminal, idempotence/déterminisme). **Tâche de
  propagation connecteur** → **admin seulement** ; relancer à l'aveugle =
  double-écriture / données périmées → la relance admin **re-propage l'état
  courant** (pas le payload périmé), l'idempotence (upsert) restant à la charge de
  la tâche. Politique de relance = propriété déclarée (méta-schéma).
- **2026-06-12 (suite 29)** — Conflits bidirectionnels (D89, **clôt Q20**) : portés
  par le **connecteur**, pas le moteur — *le moteur fournit le cadre, l'extension
  porte la sémantique métier* (3e occurrence, cf. D79 translation, D87 reprise). Le
  moteur expose l'état local + métadonnées ; la logique (dernier écrivain, source
  de vérité, fusion) appartient au connecteur. Caveat : sûreté à la frontière du
  connecteur ; recommandation : remonter les conflits via le canal d'anomalie (D87).
  **Volet connecteurs entièrement clos.** Reste avant la synthèse Q16 : Q6 (syntaxe
  des règles).
- **2026-06-12 (suite 30)** — D89 renforcé : la remontée des conflits passe de
  *recommandation* à **exigence** (clause du contrat de connecteur). Conflit
  **jamais silencieux** ; le moteur **garantit l'observabilité** (trace +
  notification) même s'il délègue la résolution. *Résolution = connecteur,
  visibilité = garantie par le cadre.*
- **2026-06-12 (suite 31)** — Langage d'expression **unique** (D90–D91, **résout
  Q6**, nouveau §3.3). Une seule grammaire pour calculs (D35–D36), migrations
  (§3.2), API (§5.1) et connecteurs (D79) : gabarit, regex (groupes nommés),
  transcodage (constante ou lookup table/entité + défaut), arithmétique, agrégats
  ensemblistes, **composable/imbriquable** ; hook = échappatoire. **Invertibilité =
  propriété de la règle** (D91) : simples inversibles, riches/à perte → substitution
  D13 en sens arrière, validation par règle (§5.2). **Tous les volets contributeurs
  sont clos — reste la synthèse Q16 (méta-schéma).**
- **2026-06-12 (suite 32)** — D91 précisé : la **réversibilité est assurée par le
  technicien**, pas garantie par le langage. 3 cas : auto-inversible (moteur) ;
  inversible non dérivable (le technicien déclare la règle inverse) ; à perte (le
  technicien déclare une substitution D13). Le moteur n'auto-inverse que le
  trivial ; la validation §5.2 exige inverse-ou-substitution par règle et par
  version d'API supportée.
- **2026-06-12 (suite 33)** — Langage **multi-valué** (D92, généralise les groupes
  regex). Une expression retourne un **enregistrement de valeurs nommées**, pas une
  seule (le cas mono-valeur est dégénéré). Une transformation = mapping `entrées
  nommées → sorties nommées` ; renommer/éclater/fusionner = patrons de ce mapping,
  pas des primitives → **méta-schéma simplifié, un seul concept**. Vaut pour
  regex/gabarit/transcodage/hooks/calculs ; composition sur enregistrements nommés ;
  inverse = symétrie 1→N ↔ N→1.
- **2026-06-12 (suite 34)** — **Audit de conception**. Constat : profondeur sur les
  différenciateurs (migration, API, hooks, accès, connecteurs, télémétrie), mais
  **modèle de données & exploitation encore minces** (report volontaire pour faire
  émerger d'abord tout le méta-modèle inhérent). 14 lacunes formulées (Q34–Q47),
  groupées : **A** modèle de données (types Q34, relations Q35, validation Q36,
  fichiers Q39) — **prioritaire, prochain volet** ; **B** exploitation (audit
  données Q37, sauvegarde Q40, concurrence Q41, staging Q42) ; **C** sécurité
  d'exécution (Q43, auth API Q44) ; **D** transverses (i18n Q45, notifications Q46,
  spec langage Q47, recherche Q38). **Q40 recadrée** : backup physique délégué au
  SGBD/hébergement, résiduel = cohérence donnée↔version. **Q43 recadrée** : modèle
  de menace = code technicien de confiance + données adverses → garde-fou léger
  (timeout configurable, fusible mono-serveur) plutôt que limites rigides ; le
  dry-run attrape déjà les regex pathologiques.
- **2026-06-12 (suite 35)** — Cohérence donnée↔version (D93, clôt le résiduel de
  Q40). **Estampille de version interne dans la base** (paramètres moteur, non
  éditables par le technicien), **deux axes** : version de description (schéma
  métier) + version de moteur/format. Contrôle **fail-closed** au démarrage :
  cohérent → sert ; données en retard → cycle de migration (§4) ; données en
  avance (moteur plus ancien) → refus (intégrité avant disponibilité) ; estampille
  absente/corrompue → init ou refus. C'est aussi la **source de vérité de la
  version courante** lue par la migration — un seul point versionné reliant
  restauration, migrations (§3.2/§4) et parc hétérogène (§7.2).
- **2026-07-02** — Reprise (Fable). Récupération par cherry-pick de l'audit
  (Q34–Q47) et de D93, absents de la fusion PR #5 (course push/merge). Reliquats
  traités : **Q8** → dépréciation par **version minimale supportée**, appel sous le
  seuil → 419 (code à confirmer) (D94) ; **Q14** → « technicien » = **rôle**
  (responsable technique : éditeur/intégrateur/adopteur) (D95) ; **Q25** →
  affectations **revivent** si le groupe réapparaît (clé = id stable), résilience
  aux suppressions par inadvertance (D96). **Q15** (contributions externes) :
  résumé fourni, reste ouvert (CLA/DCO + processus, à l'ouverture du dépôt).
  **Q29** : architecture confirmée (D47/D50/D51), reste 5 calages empiriques
  (fenêtre, seuil log, seuil pic, seuil étendue, R²).
- **2026-07-02 (suite)** — Clôture des reliquats. **Q8** : 426 Upgrade Required
  (419 écarté, non normalisé) (D94 amendé). **Q14** : « technicien » = **rôle
  moteur de Syncytium**, paramétrable, affectable à 1..n personnes → introduit les
  **rôles moteur intégrés** (avec administrateurs D33), apport au méta-schéma (D95
  réécrit). **Q15** : gouvernance des contributions = question à part entière
  formellement différée (premières versions fermées aux contributions externes).
  **Q25** : clé de stabilité = identifiant indépendant du libellé (D96 confirmé).
  **Q29 clos (D97)** : défauts d'initialisation — fenêtre 30 j (unité jour),
  linéaire par défaut / log sur demande, pic z ≥ 3 + plancher 100 appels/jour
  (préco validée : à faible trafic le plancher évite les faux positifs
  statistiques), crawl > 50 % d'une table > 1000 lignes, R² ≥ 0,5 (valide la
  pente, les pics restant couverts par le z-score). Patron uniforme forme × poids ;
  paramètres ajustables à l'initialisation de l'instance.
- **2026-07-02 (suite 2)** — Reliquats API clos (D98–D102 ; résout Q9, Q11, Q19,
  Q23). **Épinglage** : compte technique (socle) + en-tête d'essai, garde-fous
  publiée/minimale, bascule = acte admin (D98). **Publication** : versions
  autorisées = publiées ; acte déclaratif sans cadence ; jamais-publiées (bêtas,
  bugs, abandons) = maillons internes de la chaîne ; révocable → 426 (D99).
  **Pagination** : curseur opaque porté par la mécanique, embarquant la version de
  schéma (D100). **Lots = lots de transactions** (1 niveau de récursivité) :
  transaction atomique / lot continue / remontée par transaction ; ligne-à-ligne
  et tout-ou-rien = cas dégénérés (esprit D92) ; **modes autorisés déclarés dans
  la description**, choix du développeur parmi eux (D101). **Champs calculés** :
  héritage du niveau le plus restrictif, abaissement explicite signalé (D102).
  Le volet API est entièrement clos.
- **2026-07-02 (suite 3)** — Cycle de vie des versions (D103, précise D99).
  **Quatre états** : publiée officielle (appelable, épinglable) ; publiée
  **bêta/test** (appelable **sur sollicitation explicite seulement** — l'en-tête
  d'essai D98 est le canal des bêtas, pas d'épinglage) ; **interdite** (426 ;
  bêtas abandonnées, versions boguées, fonctionnalités abandonnées) ;
  **dépréciée** (426, sous D94). Transitions : bêta→officielle,
  officielle→dépréciée, →interdite (terminal). Point structurel : **l'enchaînement
  des versions (chaîne de traduction, journal de migrations) est indépendant des
  états de publication** — l'état gouverne l'appelabilité, jamais la
  traversabilité ; une version interdite reste un maillon.
- **2026-07-02 (suite 4)** — D101 corrigé après précision de l'auteur :
  **l'atomicité appartient au modèle, pas à l'appelant**. La description déclare
  les **agrégats** (commande + lignes = indivisible) ; par défaut l'écriture porte
  sur l'agrégat entier (pas d'entête seul) ; **raffinement conditionnel** (ligne
  seule uniquement si le modèle l'autorise, sinon passer par la commande) ;
  **composition libre vers le haut** (une transaction = une commande ou un
  ensemble de commandes). Échelle : ligne ⊂ agrégat (plancher déclaré) ⊂
  transaction (appelant) ⊂ lot. La déclaration d'agrégat rejoint le modèle de
  données à venir (Q35, relations de composition). (L'ancienne formulation
  « modes autorisés au choix » est retirée.)
- **2026-07-02 (suite 5)** — Fusibles de disponibilité (résout Q43, avance Q44).
  **D104** : pas de timeout sur les fonctions **simples** du langage (implémentées
  par le concepteur, chemin chaud sans surcoût) ; timeout **paramétrable** sur les
  fonctions **complexes** — classification portée par le catalogue de fonctions
  (méta-schéma, hérité par Q47). Gardes existants inchangés (D36 délai hooks, D55
  heartbeat tâches — rappel des 5 déclencheurs D54 fourni à l'auteur, D69 IHM, D7
  dry-run). **D105** : rate limiting **15 req/sec** défaut global d'instance +
  surcharge par compte technique, 429 + Retry-After — fusible externe, pendant du
  fusible interne D104. Reste Q44 : mécanisme d'authentification (clé API
  rotative proposée, à confirmer).
- **2026-07-02 (suite 6)** — Clôture de Q44 et extension des déclencheurs.
  **D106** : déclencheur **« apparition de fichier »** (étend l'événement D54) —
  dossier surveillé + pattern, le fichier devient l'entrée de la tâche (hot
  folder ; attendre l'écriture complète). **D107** : authentification = **clé API
  rotative** par défaut ; **on-behalf-of par header dédié** gouverné par le
  périmètre de délégation D76 (réponse à la question de l'auteur : OAuth2 le
  couvre via l'extension **Token Exchange RFC 8693**, disponible en déclinaison
  D78 — lourde pour une TPE, le header dédié est le bon défaut ; même sémantique
  D76 dans les deux cas). Q43 et Q44 closes — le volet C (sécurité d'exécution)
  de l'audit est terminé.
- **2026-07-02 (suite 7)** — Infrastructure de notifications (D108–D110, résout
  Q46, nouveau §8.5). Assemblage de briques existantes : **canaux = connecteurs**
  (built-in + hooks ; « le connecteur est le vecteur, la configuration porte le
  contenant » — templates en paramètres du connecteur, gabarits D90) (D108) ;
  **canaux autorisés dans la description**, choix par profil parmi les autorisés
  (D109) ; **notification persistée d'abord** — entité du méta-modèle — puis
  remise (patron outbox : remise externe = tâche de propagation D85/D87, visible
  en supervision) → **livraison garantie**, historique à rétention max (patron
  D41/D55), in-app = lecture du magasin, confidentialité automatique par
  appartenance D71 (D110).
- **2026-07-02 (suite 8)** — Nouveau thème **E — UI/UX** dans les lacunes de
  l'audit, regroupant l'affichage : **Q38** (recherche & filtrage — enrichie de
  deux contraintes : langage de filtre exposé = sous-ensemble contraint, pas D90 ;
  anti-oracle : on ne filtre que ce qu'on peut lire), **Q45** (i18n, déplacée
  depuis D, étendue à la langue des notifications), et **Q48** (nouvelle :
  **organisation de l'IHM générée** — écrans, navigation/menus, vues par défaut,
  tri, regroupements — l'architecture IHM D63–D69 est décrite, son contenu
  fonctionnel non). Constat : l'IHM est décrite « à moitié » — architecture oui,
  contenu fonctionnel à traiter avec le modèle de données (Q34 → D64).
- **2026-07-02 (suite 9)** — Séquencement : Q47 confirmée **après** le modèle de
  données (les fonctions opèrent sur les types) ; **Q37 rattachée au thème A**
  (modèle de données), point de vue de l'auteur à venir. **Q41 résolue (D111)**
  par une **troisième voie** proposée par l'auteur : concurrence
  **état-avant/état-après**, mécanisme unique IHM+API, jeton de concurrence au
  **grain du champ** — création : premier gagne (409, l'IHM conserve la saisie) ;
  modification : diff avant/après, seuls les champs modifiés écrits, champs
  disjoints fusionnent, même champ = conflit, un conflit rejette l'agrégat
  entier (D101), contrainte inter-champs cassée = conflit (lien Q36) ;
  suppression première → modification rejetée (410 Gone). Diff journalisable
  (pont vers Q37) ; ABA accepté ; ETag limité au cache lecture ; SSE en
  désamorçage amont.
- **2026-07-02 (suite 10)** — D111 précisé : **compare-and-swap par champ**
  formalisé — modification (avant≠après) autorisée **ssi valeur-avant = valeur en
  base** ; champs inchangés ni écrits ni contrôlés (condition de la fusion des
  disjoints). Caveat ABA **révisé** suite à la remarque de l'auteur : dans ce
  modèle **par valeurs**, l'ABA est **bénin par construction** — chaque
  transition intermédiaire a été validée, la prémisse de l'écrivain est vraie au
  moment de l'écriture, l'historique des transitions relève de l'audit (Q37) et
  une règle dépendant du chemin serait une contrainte (Q36).
- **2026-07-02 (suite 11)** — Q42 résolue (D112–D114, nouveau §7.3) par le modèle
  multi-environnements de l'auteur : **production** (dernière version publiée) +
  **un staging par version bêta instancié à la volée** (copie prod → migration
  D4–D9 — le dry-run rendu durable et navigable) ; **API bêta (D103) redirigées**
  vers le staging ; à la validation, staging supprimé et production migrée (§4).
  **Synchronisation** prod→staging : synchrone (chaque écriture **traduite via la
  chaîne de versions** — 4ᵉ usage du primitif de translation) ou différée
  (recréation périodique sur sollicitation). Même mécanisme entre deux instances
  de production de même version = **PCA/PRA** (actif/passif, bascule manuelle
  client ; réplication tech-agnostique D18, cohérence par estampille D93).
  Caveats : D16 raffiné (une instance *de production* + éphémères/passive, chaque
  instance mono-serveur D15) ; RGPD staging (éphémérité + accès restreint).
  **Le thème B (exploitation) de l'audit est entièrement clos.**
- **2026-07-02 (suite 12)** — Nouvelle question **Q49** à la demande de l'auteur :
  **initialisation d'une instance par reprise de données** — connexion à une base
  tierce et conversion vers le modèle Syncytium. Cas décisif pour l'adoption
  (une TPE a toujours un existant). Assemblage pressenti : connecteur
  auto-descriptif (D83) + translation (D79/D90) + dry-run d'import avec rapport
  (D7/§4.1) + tâche à progression (D55) + UUID (D82) + estampille (D93).
  Sous-questions : connecteur jetable vs permanent (cohabitation), traitement des
  rejets, import de l'historique d'origine (lien Q37). À traiter avec/après le
  modèle de données.
- **2026-07-02 (suite 13)** — Ouverture du volet modèle de données par la
  **hiérarchie des structures** (D115) : instance (1) → schéma (1) → modules
  (1..n) → entités (1..n) → champs. Le singulier « une instance organise UN
  schéma » confirme D16 (le schéma = la description, racine versionnée D93).
  Le **module** = concept nouveau ; sept rôles candidats soumis à arbitrage
  (espace de noms, navigation IHM/Q48, activation, frontière d'accès, partage
  inter-TPE, modules moteur = solutions intégrées D44, versionnement — pressenti
  non). Questions de frontière posées : références inter-modules (pressenti
  libres) et composition/agrégats intra-module (pressenti oui).
- **2026-07-02 (suite 14)** — D116 : **versionnement uniquement au niveau
  instance** (une seule horloge, pas de déclinaison module/entité/champ ; la
  version de l'instance = celle de son schéma, estampille D93) ; **composition
  intra-module** (le module = frontière de cohérence forte) ; **associations
  inter-modules libres**. Distinction fondatrice pour Q35 : composition
  (possession forte, transactionnelle) vs association (lien souple). Restent à
  arbitrer les rôles 1–6 du module.
- **2026-07-02 (suite 15)** — Les **six rôles du module validés en bloc** (D117) :
  espace de noms (`module.entite.champ`), navigation IHM (répond en partie à
  Q48), activation par instance (fail-closed : écrans/API masqués, données
  conservées), frontière d'accès (module → groupe), partage inter-TPE (l'import
  d'un module = une migration ordinaire ; objet d'échange de l'écosystème AGPL),
  modules moteur (solutions intégrées D44) vs modules métier (motif D52).
- **2026-07-02 (suite 16)** — Modèle de types (D118–D120, nouveau §3.4, Q34 en
  cours). **Champ = donnée atomique**, simple (type de base + propriétés de
  stockage et limites) ou **composée** (montant = décimal+devise, email =
  texte+format ; bibliothèque livrée + enrichissable). **Quatre facettes**
  (logique / stockage / affichage / API — exemple fondateur : date Cegid PMI) ;
  **extension par hook** = paire de fonctions pures vers/depuis le stockage.
  **Règles de conversion portées par les types** (ajout de l'auteur) : graphe à
  trois classes — sûre (automatique aux frontières), explicite (arrondi,
  troncature, perte de devise), faillible (parsing, échec propre). Unifications :
  valider un composé = conversion faillible depuis sa base ; frontières
  API/IHM/connecteurs systématiques ; coercition de Q47 réglée en principe.
  Propositions en attente : date/heure/duree, énuméré multiple, liste des
  composés livrés, devise en paramètre à défaut d'instance.