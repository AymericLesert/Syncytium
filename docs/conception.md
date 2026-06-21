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

**Connecteurs (D23) — deux familles (D78, D79).** Le moteur définit une
**interface de connecteur** (contrat de plugin, D52) ; chaque système externe a
son implémentation, déclarée dans le descriptif avec sa correspondance aux
entités.

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

### 5.8 Versions de schéma ≠ versions de contrat d'API

Avec des migrations fréquentes (plusieurs par semaine), ne pas publier chaque
version de schéma aux tiers : distinguer les **versions de schéma** (internes,
nombreuses) des **versions de contrat d'API** (publiées, espacées). La chaîne de
traduction absorbe les versions intermédiaires sans les exposer.

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

**Déclenchement (D54).** Cinq modes : **interface, API, planifié, événement de
données, enchaînement** (tâche après tâche). Tâche **synchrone ou asynchrone** —
mais *toujours non bloquante avec progression* : le « synchrone » n'est qu'une
posture d'IHM (l'utilisateur suit la barre), pas un chemin d'exécution séparé.
Toutes les tâches passent par la file.

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
| Q6 | Syntaxe exacte des règles d'éclatement (regex) et des tables de correspondance de fusion de valeurs. | Voir §3.2. |
| Q7 | Pile technique (langage, base de données, framework d'interface). | **Différé volontairement (D18)** — critères pour la base déjà consignés au §7.1 (transactionnalité D9 en tête) ; abstraction de la persistance imposée dès la conception ; **dépendances compatibles AGPL** (D19) ; **renderer d'IHM interchangeable** grâce au modèle déclaratif (D69), critère : supporter un rendu `config → HTML`. |
| ~~Q8~~ | ~~Fenêtre de support : mécanisme ?~~ | **Résolu (D12)** : versionnement + dépréciation pour limiter les versions accessibles. Reste un paramètre à fixer : la **durée** des périodes de dépréciation. |
| Q9 | **Mécanisme d'épinglage** — largement résolu par D28 : chaque consommateur est un **compte technique** créé par l'administrateur, porteur naturel de sa version épinglée (modèle Stripe), de ses groupes et de son périmètre. Reste à confirmer : la version est-elle figée au compte, surchargée par en-tête, ou les deux ? | Conditionne la télémétrie par consommateur (§5.4). |
| ~~Q10~~ | ~~Politique pour les opérations avec perte ?~~ | **Résolu (D13)** : valeur de substitution pendant la dépréciation, suppression au terme — voir §5.3. |
| Q11 | **Cadence de publication des contrats d'API** vs versions de schéma internes (§5.5). | Équilibre entre fraîcheur des contrats et charge de maintenance des traductions. |
| ~~Q12~~ | ~~RGPD / forme de la télémétrie ?~~ | **Résolu (D38–D41, §6)** : usages agrégés sur le schéma (champ à la volée, entité stockée) ; acteurs identifiés uniquement sur les comptes techniques d'API ; journal à rétention paramétrable + option d'anonymisation ; client responsable de traitement. |
| ~~Q13~~ | ~~Restitution de la télémétrie ?~~ | **Résolu (D43–D44, §6.5)** : cinq canaux (tableau de bord, rapport de dry-run, synthèse périodique, alerte d'échéance, analyse de sécurité), réunis en solution intégrée sur le méta-schéma. |
| ~~Q28~~ | ~~Seuils de diversité ?~~ | **Résolu (D46, D48, D49)** : deux indicateurs (représentative, scalaire), seuils déclarés par champ dans le schéma, **pas de défaut** (seuil absent = aucun contrôle). Faux positifs neutralisés par construction. |
| ~~Q29~~ | ~~Calibration du modèle de risque ?~~ | **Résolu (D50, D51)** : seuils déclarés par élément (endpoint/entité/IHM), **filet de sécurité** = défaut global + surcharge ; défaut = pente 1 sem. > 1 pour volume > 1000 appels. Asymétrie voulue avec Q28. Reste du calage (log/pic/étendue) = réglage ultérieur. |
| Q30 | **Volet conseil — étude dédiée différée** (D45) : fouille de motifs de séquences d'appels, fondée sur l'implémentation personnelle existante de l'auteur (analyse des automatismes d'accès PostgreSQL). | D'un autre ordre de complexité ; traité à part le moment venu. Voir §6.5. |
| ~~Q14~~ | ~~Modèle de déploiement ?~~ | **Résolu (D16, D17)** : une instance par TPE, moteur public, mise à jour technique manuelle, description à chaud — voir §7.2. Reste implicite : **qui est le technicien** chez le client (intégrateur, personne ressource ?). |
| ~~Q15~~ | ~~Licence ?~~ | **Résolu (D19)** : AGPL. Reliquat **volontairement différé** : la contribution externe pourrait être autorisée, mais rien n'est décidé à ce stade — à trancher au plus tard à l'ouverture du repository. |
| Q16 | **Versionnement du format de descriptif** : politique de compatibilité moteur ↔ descriptions dans un parc hétérogène ; la procédure de migration technique inclut-elle la conversion des descriptions ? | Miroir de la problématique API (§5), transposée au contrat moteur/description — voir §7.2. **Le format de description = le méta-schéma (D44)** : Q16 versionne donc le méta-schéma, possédé par le moteur. **À TRAITER EN DERNIER — synthèse** : le méta-schéma est le point de convergence ; hooks, API, connecteurs et règles y déposeront des propriétés. Le définir avant eux serait prématuré. Contributeurs déjà connus : D2, D25, D27, D4–D6, D35–D36, D37, D49–D50 ; **interfaces de hooks versionnées (D52)** ; **déclaration de tâche + principals contextuels (D53–D58)** ; **thème, cartographie type→composant, surcharges, interface de composant, registre (D63–D68)** ; **vocabulaire de description de rendu déclaratif (D69)**. |
| ~~Q17~~ | ~~Confidentialité : globale ou par profil ?~~ | **Résolu (D25, D26)** : trois niveaux emboîtés (public/protégée/privée) + restriction par compte ou groupe, défaut global — voir §5.5. Détails ouverts : Q22–Q23. |
| ~~Q18~~ | ~~Portée des champs calculés ?~~ | **Résolu (D35–D36)** : paliers 1+2 actés ; agrégats en vocabulaire minimal à la volée + hook de code personnalisé — voir §5.5. Modalités du hook : Q26. |
| Q19 | **Pagination** (curseur vs offset, comportement pendant une migration) et **sémantique des lots** (tout-ou-rien vs succès partiel avec rapport par élément) ? | Contrat explicite indispensable face à des consommateurs non maîtrisés. |
| ~~Q20~~ | ~~Connecteurs ?~~ | **Résolu** : identité (D78, D80–D82) ; données (D83–D87) ; relance (D88) ; **conflits bidirectionnels portés par le connecteur** (D89). Cadre = moteur, sémantique métier = connecteur. |
| ~~Q21~~ | ~~Tâches — notification de fin ?~~ | **Résolu (D87)** : catalogue (D37) + notification au **déclencheur via son canal** — in-app (interface) ou webhook/callback (API). Trace technicien en parallèle. |
| ~~Q22~~ | ~~Modèle de comptes et groupes ?~~ | **Résolu (D27–D29)** : groupes dans la description, comptes (techniques/nominatifs étanches) et affectations gérés par un administrateur via l'interface, AD en provisionnement optionnel — voir §5.6. |
| Q23 | **Frontières de sécurité dérivées** — tâches **résolues** (D53 : droits déclenche/lecture, élévation contrôlée). Reste : validation de l'héritage de confidentialité des champs calculés. | Les tâches et les calculs sont les deux chemins par lesquels une donnée privée peut sortir — à outiller dans la validation du descriptif. |
| ~~Q24~~ | ~~Amorçage de l'administration ?~~ | **Résolu (D33)** : compte administrateur + empreinte de mot de passe dans la description, utilisable seulement si aucun administrateur n'existe dans l'interface. |
| ~~Q25~~ | ~~Suppression d'un groupe ayant des membres ?~~ | **Résolu (D34)** : note au technicien et groupe ignoré (fermé par défaut). Reliquat : un groupe réapparaissant fait-il revivre les affectations conservées ? |
| ~~Q26~~ | ~~Contrat des hooks ?~~ | **Résolu** : calcul (§5.5), tâche (D53–D62, §8.4), interface (D63–D68, §8.3). Principe uniforme D52. |
| ~~Q27~~ | ~~Périmètre du hook d'interface ?~~ | **Résolu (D63–D69, §8.3)** : thème + bibliothèque ouverte (type→composant, surcharge champ→composant), injection comportementale (UX, pas sécurité), pas de patch des internes. Bac à sable résolu par le **modèle de composant déclaratif** (D69, à la Webix). |
| ~~Q31~~ | ~~Granularité du cooldown ?~~ | **Résolu (D58)** : par **tâche + paramètres**. Ajout d'une option `deterministe` (D59) : mémoïsation du résultat dans une fenêtre dédiée. Reste : valeur des durées (cooldown, fenêtre) — réglage. |
| ~~Q32~~ | ~~Principals d'accès contextuels ?~~ | **Résolu (D70–D76, §5.7)** : dimension d'audience interne/externe ; accès au niveau ligne par appartenance (directe/indirecte/ouverte/fermée) ; orthogonalité ligne×champ ; lecture/écriture par champ ; OU seulement ; id contextuels anti-IDOR ; impersonation + délégation on-behalf-of. |
| ~~Q33~~ | ~~Provisionnement des comptes clients ?~~ | **Résolu (D77)** : 4 types de compte (technique / utilisateur / client issu d'une fiche ADV / client auto-créé vérifié, ce dernier non prioritaire). Le type 3 concrétise l'appartenance D71. |

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