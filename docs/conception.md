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

**Double périmètre (élargi le 05/07/2026, D180)** — un seul moteur, deux
postures combinables :
1. **Entrepôt de données fiable** (entrepôt *opérationnel* à l'échelle TPE) —
   consolider des sources dégradées à travers le filtre de qualité, avec
   couverture mesurée, provenance, temporalité native et restitution ; l'IHM
   permet consultation **et** correction ;
2. **Applications métier** fondées sur une description exhaustive et simple —
   le développement d'applications dédiées basées sur la donnée et sa
   transformation.

### 1.1 Les dix piliers de Syncytium (ajouté le 18/07/2026)

Les piliers sont les engagements structurants du framework — ceux que
l'étude comparative évalue (§9, §9.5,
[etude-comparative-20260718.md](etude-comparative-20260718.md)) et que les
décisions D1–D312 construisent. Chaque pilier renvoie à ses décisions et à
sa section de référence.

| # | Pilier | En une phrase | Références |
|---|--------|---------------|------------|
| **P1** | **La description déclarative unique** | Une seule source de vérité, rédigée par le technicien, engendre le modèle de données, l'IHM et les API — « le schéma suffit, la déclaration ajuste ». | D1–D3, D44, D115–D131 ; §3 ; synthèse méta-schéma à venir (Q16) |
| **P2** | **Les migrations à chaud déclaratives** | Des règles de transformation (renommage, éclatement regex, fusion gabarit) exécutées sans interruption : validation → dry-run sur données réelles → fenêtre d'affluence → exécution transactionnelle. | D4–D9 ; §4 |
| **P3** | **La compatibilité d'API bidirectionnelle auto-générée** | Le journal de migrations engendre la chaîne de translation à la Stripe — ascendante et descendante, persistante, avec cycle de vie des versions et épinglage par compte. **Le différenciateur sans équivalent identifié (§9.5).** | D11–D13, D94, D98–D99, D103 ; §5 |
| **P4** | **L'IHM générée complète** | Une application utilisable sans une ligne de déclaration d'IHM : modules fonctionnels, surfaces nommées (listes, formulaires, widgets), wizard, tableaux de bord, catalogue de composants (7 types × 3 modes × 2 orientations). | D63–D69, D100, D185–D300 ; §8.3, §8.6–§8.8 |
| **P5** | **Le double périmètre entrepôt + applications** | La reprise de données est un ETL déclaratif — couverture mesurée, acceptation stricte, provenance persistante, stock de rejets à statuts — faisant du moteur un entrepôt opérationnel autant qu'un socle applicatif. | D175–D184 ; §3.11 |
| **P6** | **La temporalité native** | Historisation par instantanés d'agrégats complets, API temporelle (« à une date »), champs calculés évalués sur les instantanés, insertion antidatée maîtrisée. | D168–D174 ; §3.11 |
| **P7** | **Le langage d'expression unique multi-valué** | Un seul langage — gabarits, regex à groupes, transcodage, agrégats filtrés — sert les calculs, les migrations, la translation d'API, les connecteurs, les validations, les wizards et les gabarits de documents. | D90–D92, D104, D301–D312 ; §3.3 |
| **P8** | **La sécurité et la confidentialité par construction** | Niveaux de confidentialité emboîtés, audience au niveau ligne à identifiants opaques (anti-IDOR), droits d'action au modèle, visibilité par niveau d'héritage — et l'anti-oracle appliqué jusqu'à la navigation. | D25–D27, D70–D77, D144, D153, D196 ; §5.5–§5.7 |
| **P9** | **L'observabilité intégrée** | Une télémétrie à trois finalités — usages, risque de migration, sécurité — déclarée dans le modèle, restituée en tableaux de bord et synthèses, prolongée d'un volet conseil. | D38–D51, D97 ; §6 |
| **P10** | **L'engagement open source (AGPL)** | La licence AGPL et la non-commercialisation sont constitutives du projet : moteur public, dépendances compatibles AGPL, une instance par TPE — un positionnement que le paysage 2026 renforce (Directus sorti de l'open source, Redis revenu à l'AGPL). | D16–D19 ; §7.2, §9.2, §9.5 |

Le tout repose sur des **principes transverses** consignés au fil des
décisions — « expliciter plutôt que subir en silence », « le moteur fournit
le cadre, l'extension porte la sémantique », « masquer, ne jamais
détruire », « la translation déclarative est un primitif transverse » — qui
ne sont pas des piliers mais les irriguent tous.

Le vocabulaire du projet est fixé dans **[le glossaire](glossaire.md)** —
un document à part, terme par terme avec ses décisions fondatrices
(D417), au service de la rédaction documentaire (Q58). Les composants
graphiques ont **[leur catalogue dédié](composants.md)** — les fiches
de description au modèle en neuf rubriques (D457), même vocation.

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
| D119 | **Quatre facettes par type** : **logique** (canonique — langage/calculs), **stockage** (propriétés ou mapping custom), **affichage** (IHM/i18n — **défaut de l'export CSV**, surchargeable par un format compatible validé par le catalogue), **API** (sérialisation). **Extension par hook** = paire de fonctions pures `vers_stockage`/`depuis_stockage` (ex. date Cegid PMI : entier `AAAAMMJJ` ↔ date). | L'anti-corruption au niveau du type, au service des connecteurs (D79/D83). Surcharge d'export dans la config du connecteur (D108) ; aller-retour import/export cohérent. Voir §3.4. |
| D120 | **Règles de conversion portées par les types** — graphe de conversion à trois classes : **sûre** (implicite, automatique aux frontières), **explicite** (paramétrée/à perte, invoquée dans une expression), **faillible** (parsing/format, échec propre). **La conversion faillible = moteur de l'import** (Q49, CSV/Excel) : le dry-run d'import = exécution à blanc des conversions, rapport cellule par cellule. | Unifie : **valider un composé = conversion faillible depuis sa base** ; frontières API/IHM/connecteurs systématiques ; pas de coercition silencieuse (Q47 en principe) ; import CSV/Excel = connecteur en lecture (D79) + hot folder (D106). Voir §3.4. |
| D121 | **Types simples complétés** : + `date`, `heure`, `duree` ; **énuméré mono-sélection uniquement** (pas de `multiple` — le multi-valué passe par une entité liée). | Cohérent avec l'atomicité du champ (D118). Voir §3.4. |
| D122 | **Composés livrés** : `montant`, `email`, `pourcentage`, `telephone`, `url`, `siren`/`siret` (Luhn), `iban`/`bic` (mod 97), `tva_intra`, `mesure` (décimal+unité), `geolocalisation`, `periode` (début ≤ fin). | Bibliothèque enrichissable (D52/D68) ; validations par fonction de contrôle (catalogue D104/Q47). Voir §3.4. |
| D123 | **Devise portée par la donnée** (montant = valeur + devise, devise ∈ **jeu autorisé** ; standard = ISO 4217 complet) + **surcharge de types par restriction** : le schéma dérive des types en restreignant le domaine (`montant_francais` = {EUR}). | **Mécanisme général de spécialisation** (devises, unités, formats…) inséré dans le graphe D120 : dérivé→standard = sûre, standard→dérivé = faillible. Singleton = mono-devise (stockage optimisable, modèle logique inchangé). Voir §3.4. |
| D124 | **Identité du champ** : **nom = invariant** (référencé partout ; renommage = migration D4) ; **libellés = variantes traduites** (écran responsive, colonne tableau, colonne CSV) ; **langue au profil utilisateur, pas à l'instance** ; **descriptions courte** (bulle) **et longue** (aide), **exploitables par des IA**. | Patron identifiant stable (D96) ; première décision de Q45 (i18n) ; le méta-schéma (D44) devient documentation sémantique pour assistants. Voir §3.4. |
| D125 | **Fonction de comparaison intrinsèque au type** → fonde le **tri** ; réutilisée par le **filtre** : une valeur / un jeu de valeurs / un comparateur. Types sans ordre naturel = **non triables** ; composés : comparaison définie par le type. | C'est le langage de filtre contraint attendu par Q38 (champ+opérateur+valeur — jamais D90 exposé). Voir §3.4. |
| D126 | **Tables IHM** : champs **filtrables déclarés à la table** (la vue) ; **tris multi-clés** (combinaisons de colonnes). | Avec l'anti-oracle (Q38), le **cœur de Q38 est résolu** (résiduels : plein-texte, recherche globale). Voir §3.4. |
| D127 | **Libellés à deux couches** : défauts **par langue dans la description** + **surcharges en base**, modifiables en vie courante par un **responsable métier** (nouveau rôle moteur, famille D95/D33). Chaîne de résolution : surcharge → défaut (langue du profil) → langue de repli → nom technique. **Borne actée : la surcharge métier se limite à la présentation** — tout le reste au technicien. | Patron D31 (structure/description vs adaptations/données) ; surcharge rattachée au **nom invariant** (survit aux migrations) et **prioritaire sur tout défaut**. Voir §3.4. |
| D128 | **Valeur de démonstration** dans le profil de champ (bloc Valeurs) : affichée dans le champ comme exemple (placeholder IHM). | Sert aussi les **exemples de la doc API** générée et l'**exploitation par les IA** (complète les descriptions D124) ; les types sémantiques livrent la leur, surchargeable au champ. Voir §3.4. |
| D129 | **Énumérés : trois propriétés par valeur** — (1) **valeur numérique** = le **tri** (comparaison D125, ordre métier stable inter-langues ; changer l'ordre = description, pas migration) ; (2) **code invariant** = identité contractuelle (stockage logique, API, filtres, transcodages, domaine D48 ; renommer = **migration**) ; (3) **identifiant de libellé** = indirection vers D124/D127 (deux couches, partage possible entre énumérés ; changer un libellé ≠ migration). | L'API échange les codes ; IHM/export CSV affichent le libellé (langue du profil). Facette stockage (D119) libre de retenir la valeur numérique (tri natif) — sans effet sur le contrat. Voir §3.4. |
| D130 | **Import/export des énumérés** : import (API/CSV) = **code d'abord, libellé en repli** (langue de l'importateur) — garde-fous : priorité au code (collision), ambiguïté = échec propre + validation des libellés dupliqués, correspondance sur libellés effectifs (D127) ; export = **code ou libellé, déclaré au format CSV** (config connecteur D108/D119), libellé = langue de l'exportateur. | Import par libellé = commodité humaine ; **les machines utilisent les codes** (stables). Round-trip : codes universels, libellés mono-langue. Voir §3.4. |
| D131 | **Formats d'affichage et de conversion par langue**, portés par la **description du schéma** : l'affichage (D119) et le parsing (D120 — `texte → date/réel`) suivent la **grammaire de la langue du profil** (D124). Syncytium livre les formats standard par langue ; le schéma les précise. | Fondement formel de la « langue de l'importateur » (D130) ; format d'affichage = couche présentation (surchargeable, D127), grammaire de conversion = structurelle ; machines → formats canoniques (ISO). Voir §3.4. |
| D132 | **Composition** : 1-1 / 1-N, intra-module ; **suppression = compare-and-swap sur l'agrégat complet** (étend D111 — fournir l'agrégat entier, vérifié identique à la base, sinon 409) puis **cascade totale**. | La cascade = **définition de la possession**, seul cas de cascade du modèle. D111 couvre créer/modifier/supprimer. Voir §3.5. |
| D133 | **Déclaration `compose` sur le parent** : le **raffinement conditionnel** (D101) s'y déclare (pas sur l'enfant — lisibilité) ; **ordre des enfants = clé de tri déclarée** (fonctions D125, multi-clés D126). | Toute la sémantique d'agrégat se lit à un seul endroit. Voir §3.5. |
| D134 | **Formes de composition** : **liste** (1 dimension), **matrice** (2 — taille × couleur), **multi-dimensionnel** (n) — enfants **indexés par dimensions** (clés typées), une cellule par combinaison. | L'IHM choisit le composant selon la forme (table, grille — D64). Voir §3.5. |
| D135 | **Composition auto-référencée** autorisée (gamme de fabrication, nomenclature) : récursivité avec **validation d'acyclicité** ; l'agrégat = **l'arbre entier** (transaction, suppression-CAS, concurrence). | Cas industriel consigné par l'auteur. Voir §3.5. |
| D136 | **Association** : N-1 = champ `reference` (obligatoire/optionnelle, inter-modules, auto-référence OK) ; **inverse matérialisé en champ « liste »** (vue dérivée navigable — pas une composition) ; **N-N = entité de liaison explicite** ; **jamais de cascade**. *(Suppression : voir D138 — dérivée de la nullabilité.)* | Module désactivé : référence valide, affichage réduit. Voir §3.5. |
| D137 | **Suppression = inactivation (soft delete)** : l'enregistrement devient **inactif**, propriétés **lisibles sur demande** ; l'**IHM distingue actif/inactif** (listes = actifs par défaut). Suppression d'agrégat (D132) = **inactivation-CAS** ; modifier un inactif = 410 (D111) ; le compte client suit sa fiche (D77). | **⚠️ RGPD : droit à l'effacement = purge réelle distincte** (admin : suppression physique/anonymisation). Sous-questions : réactivation (par qui ?), unicité face aux inactifs (actifs seuls ou globale ?). Voir §3.5. |
| D138 | **Comportement à la suppression dérivé de la nullabilité** du champ référençant (aucune déclaration séparée) : référence **obligatoire** → **restrict** ; **optionnelle** → suppression autorisée, **références intactes** (pointent vers l'inactif) ; `mise_a_null` **supprimée par construction**. | Une déclaration de moins ; jamais de référence pendante (grâce à D137). Amende D136. Voir §3.5. |
| D139 | **Anonymisation déclarée sur l'entité** (RGPD) : pas de suppression physique — le droit à l'effacement = **procédure d'anonymisation**, règle **déclarée sur l'entité dans le modèle** (champs + substitutions, langage D90). **Irréversible** ; opération d'administration auditée (D62). | **L'intégrité référentielle survit à l'effacement** (l'anonymisé existe toujours — D137+D139 rendent le RGPD compatible avec « jamais de référence pendante » D138). Apport au méta-schéma : règle d'anonymisation par entité. Voir §3.5. |
| D140 | **Réactivation d'un inactif** : possible, **par l'administrateur de l'instance**, **sous conditions** — dont le **contrôle de collision de clés** (refus si duplication d'une clé d'un actif ; résolution préalable). | Pendant de D96 pour les données ; rendue nécessaire par D141. Voir §3.5. |
| D141 | **Unicité sur les enregistrements actifs uniquement** — les inactifs peuvent porter des **doublons de clés**. | Permet « supprimer » puis recréer avec la même clé (email) ; justifie la condition de D140. Voir §3.5. |
| D142 | **Identité d'un enregistrement (résout Q51)** : **technique** = UUID interne **invariant à vie** (généralise D75/D82 — références, audit, chemins, concurrence) vs **fonctionnelle** = clés métier (actifs seulement, D141). Recréer = **nouvelle** identité ; réactiver = **la même** ; anonymiser = efface la fonctionnelle, **préserve la technique**. | Le squelette référentiel survit à tout ; patron D82 généralisé aux entités synchronisées (clé d'unicité externe → UUID, Q49). Voir §3.5. |
| D143 | **Héritage d'entité — structure** : héritage **simple** (pas de multiple — association/composition pour les cas rares) ; **pas d'abstrait** (le parent est instanciable comme l'enfant) ; **intra-module** ; multi-niveaux. | Un concept de moins (abstrait) ; cohérence D116. Voir §3.6. |
| D144 | **Stockage de l'héritage : table unique** (parents + enfants), **porté par Syncytium**. **Visibilité des champs par niveau** = nouvel aspect de la confidentialité : un champ appartient à un niveau, applicable/visible seulement si l'enregistrement l'a **atteint**. | 3e axe de visibilité (après niveau/canal D25 et audience/ligne D70), même machinerie ; rend la promotion triviale et préserve l'identité D142. Voir §3.6. |
| D145 | **Héritage-état (promotion)** : un enregistrement **progresse dans la hiérarchie** (`tiers → prospect → client` dès la première commande) en conservant son **identité** (D142) ; la promotion **étend les propriétés** et ouvre listes/écrans/traitements du niveau ; **déclencheurs déclarés** (action/tâche ou événement de données D54). | Ajouter un niveau = migration de schéma ; promouvoir = opération de données. Voir §3.6. |
| D146 | **Double position autorisée** : un enregistrement occupe **plusieurs branches simultanément** (client **et** fournisseur) — le parent porte le commun, chaque spécialisation ses champs (table unique D144), visibilité **par branche**. **L'état = un ensemble de positions.** | Identité unique préservée (D142 — pas de doublon de tiers) ; champs de branches non antinomiques (chargé d'affaires client vs contact fournisseur) = modélisation. Voir §3.6. |
| D147 | **Cycles d'évolution déclarés** : la hiérarchie porte une **machine à états déclarative** — transitions autorisées (promotions ; **rétrogradations si déclarées** — exception explicite, défaut = progression), avec déclencheurs (D145). Rétrograder **masque** (D144), ne détruit pas (esprit D137). **Référence à niveau minimal : écartée** (cohérence niveaux/références = modélisation + règles métier Q36). | Clôt Q52. Voir §3.6. |
| D148 | **Opérations d'entité (résout Q50)** : opération = **tâche + déclencheur**, matérialisée en **bouton IHM** ; peut **changer l'état** (transitions D145/D147), **modifier des valeurs**, **enrichir/modifier d'autres enregistrements** (commande→facturation : n° de facture + écritures comptables). | **Zéro machinerie nouvelle** (infrastructure des tâches D53–D62) — une tâche promue au rang de **verbe de l'entité**. Complément à confirmer : champ en **écriture réservée aux opérations**. Voir §3.7. |
| D149 | **Lien parent matérialisé** : chaque enfant d'une composition accède **directement à son parent** — au service des traitements/tâches (parcours), **non exposé IHM/API**. | Navigation interne descendante et remontante. Voir §3.7. |
| D150 | **Encapsulation d'exposition dérivée** : les enfants **non modifiables seuls** (D101/D133) **n'apparaissent pas dans les API** — accès via le parent uniquement. | Aucune déclaration nouvelle : l'atomicité induit la visibilité API. Voir §3.7. |
| D151 | **Écarts d'encapsulation assumés** : champs internes → `privee` (D25) suffit ; **interface de module → écartée** (« la déclaration est une et entière » — confidentialité + organisation modules/entités couvrent le besoin). | Rationale conservée. Voir §3.7. |
| D152 | **Héritage : pas de surcharge de champ parent** — l'enfant ne redéfinit jamais un champ du parent (type/contraintes intouchables) ; il peut **seulement ajuster sa visibilité**, sans supprimer la valeur. | Lignée « masquer, ne jamais détruire » (D137/D144/D147). Voir §3.7. |
| D153 | **Écriture unique** (forme finale) : **troisième valeur du mode d'accès en écriture** (D73) — lecture / écriture / **écriture unique** (autorisée une seule fois : champ vide = permise, renseigné = refus). Déclinable par audience/groupe (admin en écriture pleine = correction tracée D62) ; écriture différable (création ou opération). | **Pas d'attribut supplémentaire** — une valeur de plus dans une énumération existante, zéro concept nouveau. Voir §3.7. |
| D154 | **Compteurs** : déclarés dans le modèle, **gérés en interne par le moteur** — ressource **critique** : **pas de doublon** + **continuité** (pas de trous — exigence comptable française) ; **allocation dans la transaction de l'opération** (échec = numéro non consommé). | Sérialisation de l'allocation, négligeable à l'échelle TPE (D15). Voir §3.7. |
| D155 | **Compteurs composés à déclencheurs** : combinables (Année / Mois / Libre), chacun avec son déclencheur (calendaire = planifié D54) ; **réinitialisation en cascade** (le libre revient à 1 au changement du mois) ; **assemblage par gabarit D90**. | Cas canonique consigné : `2026-07-0042`. Unicité du champ = la combinaison. Voir §3.7. |
| D156 | **Règles inter-champs déclaratives (résout Q36)** : sur l'entité ou la **composition** (portée agrégat, transaction D101) — expression **D90 booléenne** + message (libellé traduit D127). **Une règle = un contrôle, jamais une affectation.** Préconditions d'opérations (D148) = même forme. Évaluées à l'écriture sur les règles dont les sources sont touchées. | Rien au-delà de l'agrégat (opérations/unicité). Voir §3.8. |
| D157 | **Trois sévérités + protocole en trois passes** : **erreur** (bloquante) / **confirmation** (validée par l'utilisateur) / **information** (non bloquante). À l'enregistrement : (1) toutes les erreurs d'un coup ; (2) confirmations **regroupées** en une validation ; (3) informations **regroupées**. API : rejet+liste / re-soumission avec acquittement / signalées dans la réponse. **Confirmations acceptées tracées** (audit D62). | Jamais d'arrêt à la première erreur, pas de clics en rafale ; qui a validé quoi, quand. Voir §3.8. |
| D158 | **Agrégats filtrés** dans le langage : `somme(lignes.montant si ligne.etat = "facturée")` — critère de sélection des éléments, acté pour **tout** le langage (calculs, règles, translations). | Pressenti dès Q18, rendu nécessaire par les règles de cohérence. Voir §3.8. |
| D159 | **Double évaluation** : serveur = **la vérité** (toutes sollicitations) ; l'IHM **porte automatiquement** les règles déclaratives (transport par le moteur). **Hook de validation bi-versions** : serveur **obligatoire**, IHM **optionnelle** (JS, D69) — même contrat (D52) ; sans version IHM, vérification à l'enregistrement seulement. | Le confort est optionnel, la vérité jamais. Voir §3.8. |
| D160 | **Type `fichier`** (résout Q39) : métadonnées **nom, taille, MIME, empreinte, mots-clés** — les mots-clés = **clé de recherche** (réponse partielle au plein-texte Q38). Un champ = un fichier ; le multi = entité liée. | Voir §3.9. |
| D161 | **Stockage dual** : **binaires hors base** (dossier dédié, nommage Syncytium — les blobs feraient grossir la base) ; **grands formats texte** (JSON…) → **blob en base**. | Contrainte assumée : **sauvegarde/restauration = base + dossier** en cohérence temporelle (élargit Q40/D93). Voir §3.9. |
| D162 | **Quota en cascade** : instance, module, entité, champ — **la plus petite taille l'emporte**. | Simple à raisonner, précis à gouverner. Voir §3.9. |
| D163 | **Anonymisation de fichier** = **suppression physique du contenu** + **mots-clés anonymisés en cohérence** avec les fiches (D139) ; **statut** : `supprimé` / `anonymisé` / `corrompu` / `perdu` — métadonnées conservées (le squelette survit). `corrompu`/`perdu` détectés par **contrôle d'intégrité planifié** (empreinte + présence). | URL opaque + re-contrôle d'accès + contenu jamais exécuté (acquis D75/D25/D43) ; magasin partagé (tâches D55, notifications D108). Déduplication : voir D165. Voir §3.9. |
| D164 | **Synchronisation étendue aux fichiers** : toute synchronisation entre instances (**D113 staging, D114 PCA/PRA**) porte sur **la base ET le dossier de fichiers**, en cohérence temporelle. | Conséquence du stockage dual (D161) — comme la sauvegarde. Voir §7.3. |
| D165 | **Déduplication par empreinte, dès l'enregistrement** (amende D163) : contenu identique existant → **réutilisé**. Réconciliation avec la suppression physique : **comptage de références** — effacement réel au **dernier détenteur** ; **statut par champ** (chaque fiche sa vérité, un seul contenu). | Correct au sens RGPD : un document légitimement détenu ailleurs survit ; toutes fiches anonymisées → compteur zéro → effacement. Voir §3.9. |
| D166 | **Type liste** (forme finale) : applicable à **tous les types sauf la liste** (simples, composées, hooks — pas d'imbrication) ; **propriété « listable » par type** (communication = non-listable : un canal = un champ) ; **liste d'énumérés autorisée** (la multi-sélection revient par la porte générale, l'énuméré restant mono en champ). Élément = contraintes de son type ; doublons OK ; ordre insertion/clé ; bornes ; filtre « contient ». | Amende D160 ; nuance D118 (atomicité = l'élément) ; résout le micro-arbitrage D121. Voir §3.10. |
| D167 | **Type communication** (forme finale) : trace CRM — messages chronologiques (auteur = compte D77, horodatage, contenu), fil de discussion (D64). **Propriétés à défauts** : visibilité **maximale**, immuable **vrai**, pièces jointes **non**, **notification non** — si vrai, les nouveaux messages (réponse à une question) notifient par **IHM ou mail via l'infra D108–D110** (canaux/profil/audience). | Zéro machinerie nouvelle pour la notification. Voir §3.10. |
| D168 | **Historisation — portée en cascade (résout Q37)** : propriété du **module et/ou de l'entité**, héritée par les enfants d'agrégat ; **défaut inactive** ; module historisé → toutes ses entités **sauf opt-out**. | Patron de cascade (D162). Voir §3.11. |
| D169 | **Chaud/froid, instantanés complets** : courant = chaud, historique = froid ; chaque entrée = **toutes les valeurs de l'agrégat** (pas les écarts) + auteur (D76)/horodatage/canal/motif ; **lecture seule**. | Stockage assumé ↔ consultation triviale (fiche à une date = lire l'instantané). Voir §3.11. |
| D170 | **Confidentialité de l'historique** : visibilité **déclarée par groupe** (responsable métier oui, client non) ; confidentialités de champs **héritées de l'entité d'origine** ; **anonymisation étendue à l'historique** (D139 — sinon fuite). | Voir §3.11. |
| D171 | **Restauration outillée** : **administrateur seul, sous condition, tracée** — la restauration est une modification historisée. | Cas vécu : fiche client écrasée par erreur ADV. Voir §3.11. |
| D172 | **Consultation temporelle** : API — donnée **courante par défaut**, **date précisée → l'agrégat à cette date** ; IHM — composant **« historique »** (synthèse des entrées + clic sur un détail → la fiche à la date). **Les champs calculés s'évaluent sur les instantanés** (la fiche à date affiche ses calculs d'époque) — intra-agrégat exact ; traversée d'association résolue à date si la cible est historisée, sinon valeur courante signalée. | Servie directement par les instantanés D169 — dividende du choix « pas d'écarts ». Voir §3.11. |
| D173 | **Insertion antidatée** (reprise — résout la sous-question historique de Q49) : par défaut pas d'import d'historique ; sinon **sollicitation de l'interface à une date antérieure** + insertion dans l'historique, **contrôles levés** (règles de cohérence). | Complexité assumée ; mécanisme dédié, réservé à la reprise. Voir §3.11. |
| D174 | **Propagation de la date à travers les associations** : historisée → instantané à date ; non historisée → **valeur courante** ; non historisée référençant une historisée → **la date d'origine s'applique de nouveau** (jamais perdue). Perte de cohérence possible (mélange chaud/froid) → **alerte au technicien à la validation du schéma**, **sauf propriété d'anticipation déclarée** sur l'entité non historisée. | Patron `rupture_assumee` (D13/D102) : on peut assumer, jamais subir en silence. Analyse statique des chemins, pas de coût par requête. Voir §3.11. |
| D175 | **Connecteur de reprise** (corrigé) = connecteur ordinaire (D79/D83) **déclaré « reprise »** et **en lecture seule par défaut** (il lit le système d'origine ; exception : coexistence avec le connecteur standard) ; **durée de vie = responsabilité de l'administrateur** (débranché quand tout est repris ET qualité satisfaisante, tracé D62). Flux : lecture reprise → translation + **traitements pour l'information complexe** (tâches/hooks) → **écriture par le chemin standard**. | **Le privilège est porté par l'écriture, pas le connecteur** : l'insertion antidatée est **identifiée « reprise »** — ce marquage autorise la levée des contrôles (D173) et fonde la traçabilité. Voir §3.11. |
| D176 | **Mapping de reprise exhaustif** : le connecteur auto-descriptif **signale les entités/champs source non couverts** ; le mapping **référence toute la structure d'origine**, les éléments non repris **marqués « ignorés »** → **couverture mesurée**. | *On peut ignorer, jamais oublier* — l'exclusion se déclare. Voir §3.11. |
| D177 | **Critère d'acceptation de la reprise** : enregistré **seulement si toutes les données sont converties avec succès (D120) ET les contraintes de cohérence de la cible résolues (D156)** — au niveau enregistrement/agrégat (D101). | Pas d'enregistrement partiel, pas de données douteuses dans la cible. Voir §3.11. |
| D178 | **Clés externes déclarées** dans le mapping (**aucune déduction automatique** du modèle d'origine, parfois trompeur) ; **provenance par enregistrement** : connecteur d'origine + date de reprise + clé existante — **persiste** après désactivation/suppression du connecteur (plus alimentée). | La provenance est un fait historique, pas un lien vivant. Voir §3.11. |
| D179 | **Rejets de reprise : rapport seul (clôt Q49)** — les refusés (D177) ne sont pas conservés ; **rapport d'import** (D120) diffusé selon les **opt-in de notification** (D108–D110), correction à la source / ajustement des règles, **relance sur les manquants**. **Rapport spécifique de non-couverture (D176) au technicien.** | Quarantaine écartée (la source vit pendant la reprise, D175). Voir §3.11. |
| D180 | **Double périmètre du projet** : (1) **entrepôt de données fiable** (opérationnel à l'échelle TPE — qualité D177, couverture D176, provenance D178, temporalité D168–D174, restitution ; IHM = consultation **et** correction) ; (2) **applications métier** sur description exhaustive et simple. **Un moteur, deux postures, combinables.** | La reprise (Q49) = un ETL déclaratif déjà construit ; qualification honnête consignée (opérationnel ≠ OLAP ; D18/D36 = extensions si volumétrie). Vision §1 élargie. |
| D181 | **Rapports de reprise persistés + statut de ligne (complète D179)** : stock de rejets consolidé (identité = provenance D178, repli empreinte), statuts **à reprendre** (défaut, retentée, re-rejet sans re-notification) / **à ignorer** (écartée des relances, tracée D62) / **intégré** (constaté par rapprochement de provenance) ; **écran moteur** à accès déclaré (défaut admin) ; **le rapport ne diffuse que le nouveau**. | Toujours pas une quarantaine : trace à statut, ni éditable ni injectable. Fin de reprise objectivée : plus rien « à reprendre » + couverture assumée → débranchement (D175). « Ignorer, jamais oublier » (D176) étendu aux enregistrements. Voir §3.11. |
| D182 | **Dates du cycle de vie sur chaque ligne du stock (complète D181)** : première détection, dernière tentative, changement de statut (qui/quand/motif — D62), date d'intégration → **le stock = journal d'audit de la reprise** (chaque ligne source a un destin daté et justifiable). | Avec la provenance persistante (D178), l'audit couvre les deux faces : ce qui est entré et ce qui n'est pas entré. Ancienneté des « à reprendre » = indicateur de pilotage (fin de reprise, D181). Voir §3.11. |
| D183 | **Cycle des statuts du stock (amende D181)** : **en anomalie** (système, échec — état d'entrée, jamais retentée sans décision humaine) / **à reprendre** (admin — règle ou source corrigée, replanifiée) / **ignoré** (admin — exclusion tracée D62, réversible par l'admin) / **intégré** (système, D178). **Un passage traite : les nouveaux + les « à reprendre », même voie standard** (D175/D177) ; à l'issue le système repositionne (intégré ou en anomalie). | **Le système constate, l'administrateur décide.** Pas d'acharnement aveugle sur les lignes connues mauvaises. Rapport d'un passage = nouvelles anomalies + bilan des retentées ; fin de reprise = plus rien en anomalie ni à reprendre. Voir §3.11. |
| D184 | **Retour arrière d'une ligne intégrée** : intégré → à reprendre (admin — erreur découverte après coup) ⇒ **suppression physique** des données issues de la ligne (agrégat + historique éventuel) puis réimport au prochain passage — comme si jamais intégrée. | **Exception assumée** à « masquer, ne jamais détruire » (D137) : garantit la qualité en fin de reprise ; **portée par la provenance (D178, seul chemin)**, **refusée si références étrangères à la reprise**, **trace du stock conservée** (D182 — l'audit survit à l'effacement). Voir §3.11. |
| D185 | **Triade IHM par entité** : **liste** (colonnes + filtres + tris + actions ajout/modification/suppression) ; **écran unique fiche/formulaire à deux modes** (lecture = consultation/suppression, écriture = création/modification) ; **widget de résumé** (au survol d'une référence → informations essentielles de la cible). | Une seule organisation déclarée, deux rendus — le mode s'ouvre selon l'action et se borne aux droits (D25/D70/D144/D153). Voir §8.6. |
| D186 | **Défauts sans description** (« le schéma suffit, la déclaration ajuste ») : entité = entrée de menu du module ; liste = tous les champs (ou les premiers remplissant la largeur) ; affichage de champ **par surface** (formulaire/liste/widget) **décliné par mode responsive** (idem liste et formulaire) ; champs empilés sans section ; compositions en **onglets-listes** ; **historique = dernier onglet (invariant)** ; communication en onglet ; référence 1-1 → widget de résumé ; 1-N → liste de la cible filtrée sur l'association. | L'application complète existe sans une ligne de déclaration d'IHM. Voir §8.6. |
| D187 | **Listes déclarées** : 1..n par entité — colonnes, tris, filtres ; par mode(s) responsive ; **formulaire cible désigné** ; fonctions **ajout / modification / suppression / import / export CSV-Excel / impression PDF** ; **liste « paramétrable » à paramètres enregistrables**. | Import = conversion faillible (D120) ; export = facette affichage (D120) ; impression = tâche (D53). Portée de l'enregistrement des paramètres à préciser. Voir §8.6. |
| D188 | **Formulaires déclarés** : 1..n par entité, par mode(s) responsive ; organisation en **blocs** (rendus : **onglet / section / popup**) ; sections **en colonnes ou en lignes** ; affichage de champ dédié par mode responsive. | Deux couches (patron D127) : défaut dérivé sans déclaration (D186), blocs en surcharge. Voir §8.6. |
| D189 | **Menu déclaré** : **le modèle porte l'organisation du menu** ; une entité peut y avoir **plusieurs entrées**. | Chaîne interprétée à valider : entrée de menu → liste → formulaire. Voir §8.6. |
| D190 | **Module fonctionnel = sous-application** : **vue offerte à l'utilisateur aux fonctionnalités restreintes** (au plus ses droits, souvent moins) ; **affectation par l'administrateur** (1..n par utilisateur) ; **navigation** entre modules fonctionnels ; **module de préférence au profil**. **Défaut : un module fonctionnel unique = l'ensemble de l'application.** | **Restreint la surface présentée, n'étend jamais les droits** (sécurité = D25–D27, D70–D77). Distinct du module du schéma (D115/D117) : l'un structure la donnée, l'autre l'expérience. Voir §8.6. |
| D191 | **Page d'accueil du module fonctionnel** : identification de l'instance (**nom d'application, nom de module fonctionnel, société, logo**) ; **bandeau gauche** = choix du module fonctionnel ; **bandeau haut** = menus et sous-menus ; **corps** = widgets (**indicateurs clés** ou **liste d'entité**) — ou une liste directe. **Défauts** : bandeau gauche absent (module fonctionnel unique) ; bandeau haut = modules du schéma avec **les parents d'agrégats uniquement** ; corps **vide**. | Inspiration design : Microsoft Azure (le design après la structure). Tranche « enfants de composition au menu » (jamais d'entrée par défaut). Widget d'accueil ≠ widget de résumé (D185). Voir §8.6. |
| D192 | **Menu à trois niveaux possible** : module → entités parents → **entités enfants et entités de liaison** ; les liaisons ne sont **jamais proposées par défaut** (accessibles depuis une entité). L'IHM offre alors la **modification directe d'un enfant** — l'écriture **reprend l'agrégat parent/racine** (D101/D111/D132). | L'accès direct = **commodité de présentation, jamais un contournement de l'agrégat** (cohérent D150). Clôt le reste de la clarification n° 2. Voir §8.6. |
| D193 | **Menus** : un menu **par module fonctionnel**, hiérarchique ; entrée = **sous-menu / liste d'entité / formulaire de création / action / widget de synthèse** ; **logo → page d'accueil** ; entrées **filtrées par la confidentialité** (entité invisible → toutes ses entrées invisibles). **Défaut** : modules → entités agrégats ; **sous-menus = entités enfants et associées en lien multiple** (3ᵉ niveau présent par défaut — amende D191/D192) ; entrée → liste de l'entité. | Anti-oracle (patron D126) appliqué à la navigation. Voir §8.6. |
| D194 | **Expérience utilisateur (menu-parcours)** : un menu peut être un **enchaînement d'écrans et d'appels d'entités** — circuit de validation, processus d'enregistrement. Concept acté. | Spécification (étapes, transitions, état, droits, abandon) → **Q54 ouverte**. Voir §8.6. |
| D195 | **Quatuor de composants par entité (complète D185)** : liste, formulaire, widget de résumé + **widget de synthèse** (page d'accueil). La liste = **tabulaire ou en widgets de résumé**. | La forme widgets suppose un widget de résumé déclaré (D201). Voir §8.6. |
| D196 | **Fonctions d'une liste** : création / modification / suppression **si droit** — **les droits d'action par entité s'inscrivent au modèle de confidentialité** ; **confirmation de suppression = formulaire en lecture seule + confirmer/annuler, pas de popup** ; **export CSV/Excel = colonnes visibles de l'utilisateur** ; actions d'entité (D148) autorisées seulement. | Complète D25–D27/D70–D77/D153 (droits d'action). Import/impression PDF (D187) absents du raffinement — à confirmer. Voir §8.6. |
| D197 | **Masse** : **modification en masse = parcours séquentiel** (validation → suivant, **interruptible à tout moment**, sinon parcours complet sans retour à la liste) ; **suppression en masse = double validation** (1 : nombre + synthèse des supprimés ; 2 : confirmation). | Clôt la clarification n° 7 (sélection multiple). Un seul sélectionné = suppression simple. Voir §8.6. |
| D198 | **Paramétrage des listes** : tabulaire = colonnes + **dimensions par défaut**, tris au clic d'entête, champs filtrables, **filtres transverses** (texte multi-champs, plusieurs possibles) ; **sélection colonnes/ordre au profil utilisateur ou publiée au groupe** (administration — administrateur/responsable métier) ; en widgets = nombre par ligne, champs du widget de résumé, tris en boutons hauts, mêmes filtres. **Défaut : tabulaire, toutes colonnes, tous tris, filtre transverse global** ; 1..n listes par entité, par mode(s) responsive (défaut tous). | Clôt la clarification n° 3. Voir §8.6. |
| D199 | **Formulaire unique à cinq usages** (création/modification/suppression/consultation/**historique**) ; **compteurs renseignés à la validation** (continuité D154) ; **blocs composables** (horizontal/vertical), bloc = **section ou onglet** ; **champs à bloc dédié** (propriété du composant graphique — agrégat, liste d'association, carte, pièces jointes) ; un bloc peut **référencer un widget de synthèse filtré sur l'enregistrement courant** ; actions en **boutons du formulaire**. **Défaut** : une section empilée + onglets pour les champs à bloc ; **historique = dernier onglet (invariant)**. | Précise D185/D188 (la popup a disparu de la liste des blocs — à confirmer). Voir §8.6. |
| D200 | **Composant graphique d'un champ** : défini par **type + propriétés** ; **décliné en responsive par construction** — **aucun choix d'affichage laissé au technicien** ; définissable/surchargeable via hook (D64–D68). | La déclinaison responsive appartient au composant, pas à la description. Voir §8.6. |
| D201 | **Widget de résumé précisé** : champs **sélectionnés**, **lecture seule et/ou modification** ; pas d'onglets, sections possibles ; **petit par principe**. **Défaut : n'existe pas.** | Clôt la clarification n° 4. Le défaut D186.9 (1-1 → widget) suppose un widget déclaré. Voir §8.6. |
| D202 | **Widget de synthèse** : sur la page d'accueil — **compteurs, sommes/calculs, graphiques (types à décrire), tableaux de valeurs** ; **drill-down** vers une liste à filtres définis (part de camembert → liste des ventes de la part). **Défaut : n'existe pas.** | Nourrit Q53 (restent : types de graphiques, déclaration fine). Voir §8.6. |
| D203 | **Modes responsive** : jeu fermé **{Écran, Tablette, Smartphone} × {portrait, paysage}**. | Clôt la clarification n° 6. Dimension transverse : champ, liste, formulaire, widget. Voir §8.6. |
| D204 | **Page d'accueil personnalisée** : l'utilisateur **sélectionne une entrée du menu ou laisse vierge**, et **choisit les widgets de synthèse à afficher**. | Précise D191 (corps vide par défaut, rempli par l'utilisateur). Voir §8.6. |
| D205 | **Édition en ligne dans une liste** : modifier une valeur **directement dans le tableau** — case à cocher, liste de valeurs, champ texte, valeur numérique. | Sous le droit de modification (D196) ; concurrence par champ (D111). Voir §8.6. |
| D206 | **Déclaration des surfaces** : listes, formulaires, widgets de résumé et de synthèse — chacun **nommé + description à préciser** ; déclinaison **par mode d'affichage avec mode par défaut** (« pour éviter les blancs ») et **repli** (sans précision, la surface vaut pour tous les affichages non précisés) ; **une liste est associée à un formulaire**. | Le repli garantit qu'aucun mode d'affichage n'est orphelin. Voir §8.6. |
| D207 | **Paramètres d'un formulaire** : **« affichage de l'historique »** (défaut **vrai** — masquable par formulaire) ; **mode lecture seule** précisable. | Nuance l'invariant D186/D199 : l'historique, *s'il est affiché*, reste le dernier onglet. Liste de paramètres ouverte. Voir §8.6. |
| D208 | **Widget de résumé = configuration de formulaire restreinte** : mêmes items de configuration, **certains composants graphiques interdits** ; widgets de résumé et de synthèse **pluriels et nommés** par entité. | Complète D201 (pas d'onglets, petit par principe). Voir §8.6. |
| D209 | **Masque d'explication** : à la **première consultation ou sur sollicitation** d'une surface (liste, formulaire, widget de résumé, widget de synthèse), présentation de la **description de la surface** + **les descriptions des champs affichés** (D124). | Les descriptions déclarées = l'aide en ligne, sans rédaction séparée. Première consultation mémorisée au profil (interprétation). Voir §8.6. |
| D210 | **Modules fonctionnels déclarés** dans la description ; **un module fonctionnel déclare un menu** (D193) ; **affectation utilisateur ↔ module fonctionnel par l'administrateur** (écran d'administration). | Précise D190 — la description déclare la structure, l'administration affecte les personnes. Voir §8.6. |
| D211 | **Import = écran dédié de module** (responsable métier ou administrateur), **retiré des fonctions de liste**. | Détail à décrire ultérieurement → **Q55 ouverte**. Voir §8.6. |
| D212 | **Impression PDF confirmée** : défaut = **la liste telle qu'affichée** ; par déclaration : **colonnes dédiées** + mode (tabulaire/widgets) ; **gabarits** pour documents — **impression depuis un formulaire si gabarit** ; **le PDF s'apparente à un composant** (enregistrement, réutilisation) **sans en reprendre exactement les fonctionnalités** ; **plusieurs PDF par liste**. | Documents métier (facture, bon de livraison) couverts par les gabarits. Le contrat propre du gabarit → Q57. Voir §8.6. |
| D213 | **Export CSV** : défaut = **les colonnes affichées** ; les colonnes d'un export déclaré portent **leur longueur**. | Précise D196 (export = visible pour l'utilisateur, jamais plus). Voir §8.6. |
| D214 | **Bloc popup abandonné** : un bloc s'affiche comme **section ou onglet** (composables D199). | Amende D188 ; cohérent avec le refus de la popup de validation (D196). Voir §8.6. |
| D215 | **Référence 1-1** : affiche **un libellé ou un élément de synthèse** (agrégation de champs, image… — gabarit D90 pressenti) + **lien vers le formulaire de la cible en lecture seule** ; **sélection via une liste nommée** précisée dans la description du formulaire. | Remplace le défaut D186.9 (widget au survol — le widget de résumé n'existant pas par défaut, D201). Voir §8.6. |
| D216 | **Champ 1-N** : une **liste nommée** (désignée) de l'entité associée, **colonne de lien avec l'entité courante masquée**. | Clôt le micro-point de la clarification n° 1. Voir §8.6. |
| D217 | **i18n — UTC, fuseaux, formats, langues** : dates/heures **stockées en UTC** ; **le fuseau horaire dépend de la langue de l'utilisateur** (le modèle déclare le fuseau par langue — interprétation) ; **format d'affichage porté par la langue** (plusieurs formats possibles par langue ; défaut global au modèle par langue, surchargeable par champ et par langue) ; **le modèle liste les langues permises** (périmètre : 1 à 3). | Précise D131. Une TPE française n'a pas besoin de l'anglais ; FR+EN si marché anglais. Voir §8.7. |
| D218 | **Notifications localisées** : message à format **personnalisé par langue** (comme les libellés D127), émis **dans la langue de l'opérateur** destinataire ; **journaux internes en anglais**. | Voir §8.7. |
| D219 | **Gabarits par langue + repli à deux crans** : gabarits **PDF et mails = un par langue** possible ; pendant manquant → **langue par défaut du modèle** (la langue de l'utilisateur reste au profil D124) ; libellé totalement absent → **le nom invariant** (champ, message, gabarit). | Le repli garantit qu'aucun affichage n'est vide. Voir §8.7. |
| D220 | **Types temporels : brut ou horodatage** — la **date** et l'**heure** sont **brutes** (jamais converties : une échéance au 1ᵉʳ juillet reste le 1ᵉʳ juillet) ; la **date+heure** se déclare **brute** (valeur civile) **ou horodatage** (instant stocké **UTC**, affiché selon la langue D217). | Évite le glissement de jour des valeurs civiles converties. Précise D121. Voir §8.7. |
| D221 | **Une langue = un fuseau, assumé** ; **surcharge possible au profil**, bornée par une **liste de fuseaux déclarée par l'application**. | Demande faible à l'échelle TPE ; la surcharge couvre l'itinérant/outre-mer. Voir §8.7. |
| D222 | **Collation = tri sur chaîne normalisée** (suppression des accents et caractères spéciaux), **identique pour tous — aucune surcharge au profil**. | Pagination cohérente entre utilisateurs. Voir §8.7. |
| D223 | **Formats CSV définis au modèle** (ni utilisateur, ni langue) — **imposés par l'application**. | Uniformité des échanges de fichiers. Voir §8.7. |
| D224 | **Couverture des traductions** : les pendants manquants (libellés, messages, gabarits) par langue déclarée sont **signalés au technicien** et **consultables dans l'administration**. | « Ignorer, jamais oublier » (D176) appliqué à l'i18n. Voir §8.7. |
| D225 | **Sérialisation temporelle des API : chaînes de caractères** — horodatage **UTC**, valeurs **brutes** telles quelles ; format **canonique invariant ISO 8601** (brut sans décalage, horodatage suffixé `Z`), **jamais le format d'affichage**. | Le marqueur `Z` distingue seul l'horodatage du brut ; tri lexicographique = tri chronologique. **Clôt Q45.** Voir §8.7. |
| D226 | **Recherche plein-texte : mono-entité, portée par la liste** — **la recherche globale trans-entités est écartée (assumée)** ; la correspondance **traverse les références** (« Dupont » sur la liste des commandes → les commandes passées par Dupont) ; mécanique = **contient normalisé** (D222) ; droits = ceux de la liste (D70–D77). | Ni barre d'application, ni index global — périmètre des projets réels. Voir §8.6. |
| D227 | **Recherches déclarées (unifie D198)** : une recherche **précise la liste des champs concernés** (les autres ignorés), **plusieurs recherches par entité** — le **même objet** que le filtre transverse : une « recherche » nommée (champs + mode). | La déclaration peut viser un champ via référence ou enfant (interprétation) ; défaut = les colonnes affichées (D198). Voir §8.6. |
| D228 | **Filtrage vivant** : toujours « contient » ; **la liste se filtre à chaque saisie ou sélection, sans bouton « filtrer »** ; **throttling** côté client ; un filtre par type de données → composants graphiques (**Q56**). | UX temps réel, serveur ménagé. Voir §8.6. |
| D229 | **Recherche par approximation** : mode **stricte** (sous-chaîne normalisée D222) **ou approximation** — score de similarité, **seuil**, lignes **triées par score décroissant** (Dupont exact puis Dupond ; le score prime le tri déclaré pendant la recherche). | Algorithme = choix d'implémentation ; contrat = score + seuil (défaut global, surcharge par recherche — interprétation). **Clôt Q38.** Voir §8.6. |
| D230 | **Le menu-parcours = un wizard** (mono-utilisateur, une session) ; le **circuit de validation multi-acteurs = un patron d'assemblage** des briques existantes (états D147, opérations D148, notifications D108–D110, listes filtrées) — **pas de moteur BPM caché** : le circuit vit dans la donnée. | Chaque intervention d'un acteur du circuit peut être un petit wizard. Voir §8.6. |
| D231 | **Étape de wizard = une surface déclarée + un contexte** (formulaires nommés D206, listes, widgets) ; **transitions** suivant/précédent/annuler + **conditionnelles** par expression D90 sur les données saisies. | Le wizard enchaîne, il n'invente pas d'écran (cohérent D151). Voir §8.6. |
| D232 | **État intermédiaire transitoire** : rien n'est écrit avant la fin ; dernière étape = **transaction d'agrégats** (D101) + validations 3 passes (D156–D159) ; **abandon = rien**. **Brouillon reprenables = un niveau d'état déclaré** (D145–D147), jamais une machinerie moteur. | « Le brouillon est du modèle, pas de la machinerie. » Voir §8.6. |
| D233 | **Sortie de wizard** : étape **récapitulative** (porte les confirmations tracées D157) ; **opération** possible en sortie (D148 — PDF, mail). **Droits** : entrée filtrée (D193), écritures sous droits d'action (D196) — **un wizard n'élargit jamais les droits**. | Même principe que le module fonctionnel (D190). **Clôt Q54.** Voir §8.6. |
| D234 | **Import d'exploitation** : **CSV seuls, déposés dans l'écran** du module (ni Excel, ni hot folder) ; **un agrégat = un fichier par entité** ; **dry-run puis import** — l'import **n'est possible que si toutes les valeurs sont acceptées** ; sinon **rapport exact** (données en erreur + lignes, cellule par cellule D120). | Tout-ou-rien au dépôt ; correction à la source, nouveau dépôt. Le stock de rejets (D181–D183) reste propre à la reprise. Voir §8.6. |
| D235 | **Deux modes d'import** : **remplacement** (classement créé/modifié/inchangé/**supprimé** + **comptage par catégorie** + **confirmation avant lancement**) ; **complément** (pas de suppression). | **Confirmé** : rapprochement par la **clé fonctionnelle** (D142 — l'UUID est interne, jamais exposé aux utilisateurs) ; « supprimé » = **désactivation** (D137), jamais physique (D184 = reprise seule). Voir §8.6. |
| D236 | **Mapping par l'entête** : l'entête de colonne CSV = **un libellé du champ dans la langue de l'opérateur** (D124/D127) — pas de table de mapping ; **tous les champs concernés** (sauf optionnels). | Champs calculés/fichiers/communications hors périmètre CSV (interprétation). Voir §8.6. |
| D237 | **Réversibilité : l'export miroir** — un export produisant **le fichier ré-importable**, assuré depuis le même module d'import d'exploitation. | Export → tableur → import remplacement = l'édition de masse de Syncytium. Voir §8.6. |
| D238 | **Provenance d'un import d'exploitation = l'opérateur** qui le réalise (audit D62) ; écran réservé responsable métier/administrateur (D211). | Pas un connecteur — distinction nette avec la reprise (D178). **Clôt Q55.** Voir §8.6. |
| D239 | **Catalogue des graphiques du socle** : courbe, barres, secteurs (camembert/anneau), jauge, **combiné** (courbe+barres ou 2 courbes, **2 axes Y max**, même temporalité/échantillon) ; **au-delà de 2 axes = hook** (registre D68). | « Au-delà de 2 axes, illisible » — le socle reste lisible, le registre étend. Voir §8.6. |
| D240 | **Déclaration d'un graphique** : porte sur **une entité** ; axes déclinés par type. **X = un champ**, découpé par **valeur distincte** (énuméré, valeurs d'une référence), **plages déclarées** (numériques) ou **temporalité** (heure/jour/semaine/mois/année). **Y (1 ou 2)** = **une fonction sur un champ filtrée sur la valeur de X** (somme des CA d'un commercial). | La mesure = l'agrégat filtré (D158) partitionné par X ; le filtre métier vit dans la formule. Voir §8.6. |
| D241 | **Jauge** : **valeur de référence + valeur calculée**, chacune **formule ou valeur absolue** ; **le dépassement de 100 % est possible** (référence = cible, courante = réalisé). | Deux usages : taux borné (0–100 fixe) ou objectif dépassable. Voir §8.6. |
| D242 | **Drill-down déclaré** : **par défaut, aucun** ; sur déclaration, une **liste nommée** — le graphique **enrichit le filtre imposé** de la liste avec la valeur cliquée. | Mécanique du filtre imposé (D216). Voir §8.6. |
| D243 | **Le graphique = une déclaration autonome, nommée et réutilisable** : exploitable dans **plusieurs widgets de synthèse** et **plusieurs formulaires** (blocs D199). | Patron des surfaces nommées (D206) ; le bloc de formulaire le contextualise par filtre imposé. Voir §8.6. |
| D244 | **Tableau de valeurs** : une **liste nommée** + un **tri imposé** (non sélectionnable par l'utilisateur) + un **nombre de valeurs limité**. | Pas de listes à rallonge dans un widget de synthèse. Voir §8.6. |
| D245 | **Pas de comparaison/tendance dans le socle** : comparer = **deux widgets de synthèse côte à côte** sur des temporalités différentes ; les comparaisons complexes = **hook**. | Traitements lourds hors socle — même ligne que le combiné >2 axes (D239). Voir §8.6. |
| D246 | **Tableau croisé dynamique** : une entité + **4 éléments** — filtre, champ(s) **en ligne**, champ(s) **en colonne**, **formule d'intersection** ; plusieurs champs → **groupements hiérarchiques pliables** (CA par commercial › client × mois) ; sur numériques/dates, **plages ou temporalités déclarées pour réduire le volume** de lignes/colonnes (confirmé, comme D240). | Formule = agrégat (D158) par cellule ; **indépendant de D134** (le croisé est une présentation). Voir §8.6. |
| D247 | **Widget de synthèse : associé à une entité** — donc **par construction à un module fonctionnel** ; **confidentialité héritée de l'entité, surchargeable**. | Le pool de la page d'accueil (D204) en découle. Voir §8.6. |
| D248 | **Évaluation du widget = les règles des champs calculés** (calcul sur le périmètre de l'entité, accès gouverné par la confidentialité D247) ; **le drill-down ne montre que les valeurs visibles du lecteur** (D70–D77) ; écart possible = **fuite/valeur déductible assumée, responsabilité du technicien** ; **alerte à l'utilisateur** : les valeurs listées ne couvrent pas la totalité du périmètre du calcul. | L'alerte évite la fausse alerte de non-réconciliation. **Clôt Q53** (avec D249). Voir §8.6. |
| D249 | **Tableau de bord + trois modes de rafraîchissement d'un widget** : **statique** (calcul à l'affichage, jusqu'au rafraîchissement utilisateur), **temps réel** (à chaque notification de mise à jour de l'entité ou d'un enfant), **fréquence** (période déterminée). | Une page d'accueil de widgets = un tableau de bord. Temps réel = événements de données (D54) à l'échelle de l'agrégat ; **défaut = statique (confirmé)** ; D36 en extension. Voir §8.6. |
| D250 | **La matrice d'un composant graphique : 7 types × 3 modes × 2 orientations** — types : **lecture seule / modification / widget de résumé / cellule de liste en lecture / cellule de liste en modification / PDF / Excel** ; modes : **écran, tablette, smartphone** ; orientations : **portrait, paysage** (D203) — le tout **par construction** (D200). **Défaut : écran paysage.** | Lie Q56 et Q57 : le gabarit PDF compose les types PDF ; l'export = cellules typées (D237) ; interdiction en widget (D208) = type absent ; cellule en modification = l'édition en ligne (D205). La matrice appartient au composant, jamais à la description. Voir §8.6. |
| D251 | **Structure du gabarit PDF** : il **exploite le gabarit d'un formulaire en lecture seule** (blocs D199, types PDF des composants D250) + des ajustements — **paragraphe de texte, titre, sous-titres jusqu'à 4 niveaux** (retrouvables sur un formulaire) ; **document = entête (optionnel) + pied de page (optionnel) + un bloc-page** ; entête/pied = **gabarits nommés au même formalisme** ; la **dimension de la page est décrite**. | Liaison aux données = celle du formulaire (l'agrégat courant) ; gabarits par langue (D219). Le gabarit n'invente rien : un formulaire enrichi, rendu en PDF. Voir §8.6. |
| D252 | **Impression directe depuis le serveur** : un document PDF peut être imprimé côté serveur — cas de l'**étiquette à QR code ou code-barres** ; **les imprimantes disponibles = celles du système d'exploitation du serveur** (pas de déclaration dédiée). | QR/code-barres = composants du catalogue (Q56) ; impression = tâche (D53). Voir §8.6. |
| D253 | **Le formulaire peut aussi porter un entête et un pied de page, avec des zones de texte** (complète D199/D251). | Formulaire et gabarit PDF partagent **un seul formalisme** — le gabarit = un formulaire en lecture seule + une dimension de page. Voir §8.6. |
| D254 | **Variables de contexte = une entité « contexte »** (moteur, lecture seule) : nom du fichier, date/heure du moment, **numéro de page, nombre de pages**, opérateur, nom de l'instance, nom du module… — **exploitables comme un champ d'entité** (expressions/gabarits D90) ; **disponibilité selon le contexte** (pagination au rendu d'un document, opérateur en session). | Aucun mécanisme spécial — mécanisme uniforme. Nom définitif au méta-schéma (Q16). **Clôt Q57.** Voir §8.6. |
| D255 | **Champs calculés à l'écran : recalculés dès qu'un champ concerné est modifié** (dépendances — règles transportées D159). | Réactivité de saisie sans aller-retour serveur ; le serveur reste la vérité (D159). Voir §8.8. |
| D256 | **Boutons radio : uniquement sur un énuméré de faible cardinalité** — seuil à fixer (5 valeurs pressenties). | Variante du composant énuméré. Voir §8.8. |
| D257 | **Rendu PDF des contenus riches = une image** ; **chaque type aura son pendant PDF** (décrit au fil du catalogue Q56). | Carte, graphique… deviennent des images dans le document. Voir §8.8. |
| D258 | **Paramètres communs d'un composant** : **libellé, commentaire** (infobulle), **description** (masque D209 / aide détaillée), **valeur de démonstration** (placeholder D128), **états possibles** (lecture / écriture / écriture unique D153), **validation** (D156–D159), **filtre** (D228) — **+ d'autres propriétés par type** si nécessaire. | Alignement terminologique : description courte (D124) → **commentaire** ; description longue → **description** (à répercuter en Q16). Voir §8.8. |
| D259 | **Composant texte — cadrage** : **pas de zone de texte enrichie** ; **mono/multi-ligne dérivé de la taille maximale** du champ selon un **seuil = paramètre général de l'instance** (**défaut 100 caractères**) ; **N = nombre de lignes affichées** avant repli. | Introduit les **paramètres généraux de l'instance** (réglages à défauts moteur — à intégrer en Q16). Voir §8.8. |
| D260 | **Masque de saisie** = propriété du champ texte : `_` caractère libre, `9` chiffre, **littéraux imposés**, `[…]` classes/plages (`FR__ ____ [A-E][5-8A-E]__`). | Couvre les saisies formatées (identifiants, codes) au niveau du champ. Voir §8.8. |
| D261 | **Rendus du texte** : lecture = tel quel (mono) / **N lignes + « voir plus » traductible** (multi, redimensionnable) ; modification = **compteur si grande taille** (seuil = paramètre d'instance), **saisie bloquée à la taille du champ**, placeholder = démo ; widget = **« libellé pour widget » + valeur** en ellipse (**variante de libellé pouvant être vide** — D124 étendu) ; cellule lecture/modification, PDF (complet, jamais tronqué), Excel (natif) validés. | Le libellé est un code décliné par surface (formulaire, colonne, widget…). Voir §8.8. |
| D262 | **Écarts par mode, transverses à tous les composants** : **tablette** = pas de survol → description non affichée, **infobulle via un petit logo près du libellé** ; **smartphone** = **ni infobulle ni description, libellé plus petit** ; **portrait/paysage = aucun écart**. | Fixe une fois pour toutes la dégradation tablette/smartphone des paramètres communs (D258). Voir §8.8. |
| D263 | **Zone de texte enrichie = évolution potentielle** : ultérieurement, composant graphique d'un **type de champ complexe** (ex. « document ») ; **le hook de composant (D64–D68) devra permettre de développer ce type de composant**. | Hors socle — exigence posée sur l'extensibilité. Voir §8.8. |
| D264 | **Le masque pilote les lignes** : avec un masque de saisie (D260), **le nombre de lignes dépend du nombre de lignes du masque** (prime la dérivation taille/seuil D259). | Un masque peut être multi-lignes. Voir §8.8. |
| D265 | **Anatomie d'une zone de saisie** (écran) : **libellé + zone de saisie + post-zone** (devise, %, abréviation… ou rien) ; **tablette/smartphone : libellé ou abréviation configurables**, défaut = les libellés du mode de base. | Transverse : la post-zone servira les composés (montant, pourcentage, mesure). Voir §8.8. |
| D266 | **Colonnes de liste : modifiables par défaut, lecture seule déclarable** — la déclaration d'une liste peut marquer une colonne **en lecture seule**. | La marque ne fait que restreindre (droits D196, mode d'accès D153, calculés) — jamais élargir. Complète D198/D205. Voir §8.6. |
| D267 | **Composant nombre = une zone de texte à particularités** : **masque déduit des propriétés du champ et de la langue** (chiffres avant/après la virgule D118, bornes, séparateurs D131 — rien à déclarer) ; **post-libellé** (unité, devise…) placé **avant ou après selon la langue**. | Hérite du cadre du texte (D259–D265). Voir §8.8. |
| D268 | **Saisie numérique tactile** : **clavier numérique exploité** (réserve UX de l'auteur notée) ; la zone numérique **peut afficher une calculatrice** (calculs élémentaires) **ou un clavier stylisé** — la calculatrice = méthode de saisie tactile. | Aide à la saisie, propriété du composant. Voir §8.8. |
| D269 | **Variantes du nombre** : présentation en **jauge** (styles multiples, saisie ou affichage) ; **boutons [-] / [+]** pour incrémenter/décrémenter une **valeur entière** (stepper). | Variantes du catalogue numérique. Voir §8.8. |
| D270 | **Surcharge du composant au formulaire** : le défaut vient de la **description du modèle** (type → composant, champ D64) ; **le formulaire peut surcharger** pour choisir le type de GUI. | Chaîne : type → champ → formulaire ; la surcharge choisit parmi les composants **compatibles avec le type**, n'élargit ni droits ni états. Voir §8.8. |
| D271 | **Rendus du nombre par surface** : **aligné à droite** partout ; cellule en modification = saisie en ligne (D205) ; **Excel = nombre natif** ; **filtre = comparateur/plage** (D228) ; widget = patron du texte (valeur formatée, ellipse) ; PDF = valeur formatée avec post-libellé. | Validés tels que proposés. Voir §8.8. |
| D272 | **Montant** : nombre + post-libellé = **devise du jeu déclaré** (D123), placée selon la langue (D267) ; **décimales définies sur les propriétés du champ** (2/3/4 selon la précision — D118), **indépendamment de la devise** ; Excel = format monétaire natif. | La précision est un besoin métier, pas une propriété de la devise. Voir §8.8. |
| D273 | **Pourcentage** : post-libellé **%**, bornes 0–100 sauf déclaration ; **avec une borne, la jauge (D269) devient un choix possible**. | Pas de jauge sans bornes. Voir §8.8. |
| D274 | **Mesure** : nombre + **post-libellé = l'unité déclarée** (D122) — rien de plus. | Voir §8.8. |
| D275 | **Durée** : déclinée **par un masque de saisie + une option de conversion** (valeur canonique ↔ chaîne, patron D119) ; **Excel = la valeur canonique**. | Le seul composé numérique qui ne soit pas qu'un post-libellé. Voir §8.8. |
| D276 | **Tout numérique entier borné peut être une jauge** (ex. montant entre 0 et 10 000 €) ; **le curseur** = saisie **simple et sans clavier**. | Généralise D269/D273 — la borne est la condition, pour tout numérique ; précieux sur tactile (D268). Voir §8.8. |
| D277 | **Heure : précision portée par la propriété du champ** — hh / hh:mm / hh:mm:ss / hh:mm:ss.sss ; **horloge** pour saisir ou afficher. | Voir §8.8. |
| D278 | **Date : raccourcis** (aujourd'hui, la veille, hier, début/fin de mois…) **sur un clavier stylisé** (patron D268) ; **calendrier année/mois/semaine** avec **n° de semaine lié à la langue**. | Les conventions de numérotation des semaines varient par pays. Voir §8.8. |
| D279 | **Date+heure : raccourcis** (maintenant, aujourd'hui…) ; affichage **calendrier + horloge combinés**. | Voir §8.8. |
| D280 | **Compositions temporelles (agenda, emploi du temps, Gantt…) = évolutions potentielles** via le hook de composant. | Patron D263 (texte enrichi) — l'exigence sur le hook les couvre. Voir §8.8. |
| D281 | **Socle des temporels validé** : masque **déduit du format de la langue** ; **Excel = valeurs natives** ; **brute telle quelle / horodatage au fuseau de la langue** (affichage **et** export) ; filtre = **plage/comparateur**. | Cohérent D217/D220–D221/D267. Voir §8.8. |
| D282 | **Booléen** : case à cocher (**3 états si nullable**) ou **toggle (sans nul)** ; filtre oui/non/tous ; **libellés VRAI/FAUX/NUL surchargeables, affichés au survol** (Actif/Inactif…) ; **déclinable en liste énumérée** ; export = **libellé ou valeur** (déclaré, patron D130). | Voir §8.8. |
| D283 | **Énuméré** : liste déroulante (D129) ; **peut représenter un jeu d'icônes ou d'images** ; cellule (D205), filtre jeu de valeurs (D228), export code/libellé (D130). | Voir §8.8. |
| D284 | **Référence** : description D215/D228/D229/D201 validée, **Excel = clé fonctionnelle** ; **une entité peut porter un champ « image »** — s'il est défini, **sélection via image + libellé court privilégiée dans un formulaire dédié** (choix d'un plat, photo d'un utilisateur). | Ré-importabilité préservée (D235–D237). Voir §8.8. |
| D285 | **Boutons radio = surcharge graphique au formulaire** (chaîne D270) — **le seuil automatique de cardinalité est abandonné** (amende D256). | La pertinence relève du déclarant. Voir §8.8. |
| D286 | **Types de base ajoutés (étend D121)** : **vignette** (image petite taille) et **image** (grande taille **+ déclinaison en vignette**). | Portent le champ « image » d'une entité (D284) ; patron fichier (D160/D165) ; **vignette calculée automatiquement par le moteur (confirmé)**. Voir §8.8. |
| D287 | **La calculatrice remplace le clavier natif** — sur smartphone **et** tablette : un seul dispositif de saisie des nombres. | Précise D268. Voir §8.8. |
| D288 | **Temporels par mode** : smartphone = **calendrier plein écran** (semaine/mois/agenda multi-semaines, lisibilité maîtrisée, tactile seul) ; tablette = calendrier **à proximité du champ** ; PC = **saisie clavier + calendrier sur demande** (icône). | Voir §8.8. |
| D289 | **Choix par mode** : smartphone = déroulante (unique/multiple), **choix par image plein écran empilé, radios empilées** ; tablette = déroulante, image en **zone restreinte près du champ** (clavier limité) ; PC = **raccourcis clavier + parcours par saisie** (début de mots, throttling D228). | Voir §8.8. |
| D290 | **Listes par mode** : smartphone = tableau pour les **petites listes**, **widgets recommandés au volume** (1 colonne portrait / **2 colonnes paysage**) ; tablette/PC = tableaux ou widgets **multi-colonnes** ; **filtres : PC toujours affichés, smartphone derrière une icône, tablette au choix**. | **Premier écart d'orientation** (nuance D262 — les dispositions peuvent différer par orientation). Voir §8.8. |
| D291 | **Géolocalisation : la position courante du terminal est affichable sur la carte** (repère en lecture, « ma position » en saisie). | Sous réserve de l'autorisation de géolocalisation du terminal. Voir §8.8. |
| D292 | **Fichier** : **types autorisés portés par le champ** ; **smartphone : appareil photo / galerie** comme sources ; lecture = icône + nom + taille + téléchargement, statut visible (D163) ; **PDF/Excel = le nom** ; filtre = nom + mots-clés (D160) ; pièces jointes = bloc dédié (D199). | Voir §8.8. |
| D293 | **Image** : aperçu immédiat au dépôt ; **visionneuse au clic — plein écran (smartphone), pourcentage de l'écran (tablette), zone définie (PC)** ; cellule/widget = la vignette (D286) ; PDF = l'image (D257) ; **pas de recadrage dans le socle** (hook, D263). | Voir §8.8. |
| D294 | **Géolocalisation** : pointer sur la carte ou lat/long clavier ; **fond de carte déclarable à l'instance** ; **géocodage = connecteur avec un défaut open source dans le socle** — candidats : **API Adresse/BAN (Addok)** et **Nominatim (OSM)**, auto-hébergeables ; Excel = `lat,long` ; pas de filtre socle. | Politiques d'usage à re-vérifier en Q7. Voir §8.8. |
| D295 | **Communication** : fil chronologique immuable, saisie en bas, plein écran sur smartphone ; **pas d'affichage en cellule de liste** ; PDF = fil complet si inclus ; Excel exclu (D236). | Voir §8.8. |
| D296 | **Liste** : multi-sélection (énumérés) ou éditeur de liste ; tags en lecture, ellipse en cellule ; **séparateur Excel/CSV déclaré au modèle, surchargeable à la fonctionnalité** (précise D223). | Ré-importabilité (D237) préservée. Voir §8.8. |
| D297 | **Compteur** : **lecture seule partout** ; placeholder « (attribué à la validation) » en création (D154/D199) ; cellule/PDF/Excel = la valeur assemblée (D155). | Voir §8.8. |
| D298 | **Champ calculé** : lecture seule partout, **recalculé à l'écran sur dépendance modifiée** (D255) ; **composant = celui du type de résultat**. | Un calculé montant s'affiche comme un montant. Voir §8.8. |
| D299 | **Période** : **deux dates liées** (début ≤ fin contrôlé en frappe), raccourcis D278 ; cellule = « du … au … » ; **Excel = deux colonnes natives**. | Voir §8.8. |
| D300 | **QR code / code-barres** : composants de **sortie** (rendent la valeur d'un champ) — usage premier PDF/étiquettes (D252), affichables à l'écran ; Excel = la valeur source. | **Clôt Q56 — et le thème E.** Voir §8.8. |
| D301 | **Le catalogue de fonctions du langage est en anglais** (`sum`, `count`, `if`, `isnull`…) — internationalisation potentielle + **similitude avec les langages connus** (Visual Basic, Python…). | Les exemples consignés seront anglicisés à la rédaction du catalogue ; corollaire ouvert : les mots-clés de la grammaire (le « si » filtrant). Voir §3.3. |
| D302 | **La logique « selon que » ajoutée au catalogue** : sélection **multi-branches** (`Select Case` / `match`) — facilite les **tables de correspondance** en ligne. | Le pendant expression du transcodage (D90) pour les petits cas. Voir §3.3. |
| D303 | **Le null : logique ternaire retenue** (avantage sur la propagation d'anomalie et l'interruption) ; `isnull` / `ifnull` pour trancher explicitement. | **Table de vérité à confirmer** — deux écarts au standard SQL/Kleene dans la dictée (OU asymétrique, `Faux et null`) ; table standard proposée, alignée sur le SGBD. Voir §3.3. |
| D304 | **Échec d'une expression, par contexte** : migration = **substitution déclarée** (D13) ; champ calculé = **null + trace** ; validation = **règle non satisfaite + trace**. | Rien n'échoue en silence ; le doute profite à la sécurité. Voir §3.3. |
| D305 | **Grammaire = celle des exemples actés** : infixe, chemins pointés, gabarits `{}`, agrégats à filtre intégré, fonctions, imbrication (D90). | « Les exemples actés sont significatifs de ce que cela doit rassembler. » Mots-clés anglais : corollaire ouvert (D301). Voir §3.3. |
| D306 | **Simple/complexe = propriété de la fonction du catalogue** (matérialise D104). | Timeout paramétrable sur les seules complexes. Voir §3.3. |
| D307 | **Le déterminisme = propriété de la fonction du catalogue**. | Proposé à confirmer : l'exigence par contexte (migrations = déterministe seulement, dry-run D7). Voir §3.3. |
| D308 | **Le null non gardé = une anomalie capturée (amende D303)** : dans une expression booléenne ou arithmétique, le null est **anormal** — **capturé** via le circuit d'échec par contexte (D304), **sauf s'il est capté par `isnull`/`ifnull`**. | Table standard validée en référence ; les filtres SGBD suivent la table ternaire (interprétation à confirmer). Ni propagation ni ternaire silencieuses : l'anomalie se voit. Voir §3.3. |
| D309 | **Les mots-clés de la grammaire sont en anglais** : `sum(lignes.montant if ligne.etat = "facturée")` ; le « selon que » prendra sa forme anglaise (`case`/`match`). | Clôt le corollaire D301/D305. Fonctions et mots-clés anglais ; noms de champs/entités = ceux du modèle. Voir §3.3. |
| D310 | **Filtres et null** : les filtres **peuvent cibler les lignes null** (critère « vide/null ») ; doctrine — **« dans une table, null n'est pas une anomalie ; dans une évaluation pour un calcul, oui »** : null stocké = légitime (table ternaire au SGBD, sans capture), null évalué = capturé (D308). | La ligne de partage stocké/évalué. Voir §3.3. |
| D311 | **Déterminisme : exigé uniquement pour les migrations** (dry-run D7 rejouable) — aucune restriction ailleurs. | Confirme D307 côté contexte, en plus simple. Voir §3.3. |
| D312 | **Coercition ratifiée côté langage** : sûre **implicite**, explicite **par fonction** (`to_*`), faillible **à échec propre** (D304) — **jamais de coercition silencieuse** (D120). | **Clôt Q47.** Voir §3.3. |
| D313 | **Q5 actée : la construction de bout en bout.** « Cette étude confirme mon intuition concernant une ouverture pour une construction de bout en bout. **Je valide ce choix.** » | Fondée sur l'étude reprise au périmètre complet (§9.5, tableau piliers × outils) : aucun outil ne couvre deux piliers, l'auto-génération du P3 sans coche pleine. **Clôt Q5 — la dernière décision stratégique.** |
| D314 | **La feuille de route avant développement** : (1) répondre aux **questions restantes** (Q30, Q16…) ; (2) **rédiger une documentation en amont** des développements (→ Q58) ; (3) **mises en situation** sur des **exemples concrets** clients, vérifiant la compatibilité de la solution avec les besoins — exemples **intégrés à la documentation** pour montrer l'intérêt (→ Q59). **Aucun code tant que tous les points ne sont pas validés.** | La méthode fondatrice (« discuter avant de développer ») devient la feuille de route formelle. |
| D315 | **Détection du volet conseil = l'algorithme SEQUITUR** sur les **appels normalisés** : les paires apparaissant ≥ 2 fois deviennent des **règles**, substituées récursivement jusqu'à épuisement → **grammaire hiérarchique des séquences répétées** (journaux D40–D41, par compte technique). | Hérité du précédent projet de l'auteur (séquences PostgreSQL → curseurs, lectures/màj par bloc). Voir §6.5. |
| D316 | **Exploitation des séquences répétées** : (1) recommandations d'optimisation au consommateur (cache, lots) ; (2) **une séquence lourde et longue qui se répète peut se transformer en service proposé** — une ou quelques requêtes limitées la remplaçant ; le moteur propose (fréquence + coût constaté), **le technicien décide**. | Consultatif uniquement (D45). Voir §6.5. |
| D317 | **Normalisation des appels** : **endpoint + liste des propriétés, valeurs ignorées** — deux appels au même endpoint sur les mêmes propriétés = la même « lettre » de la grammaire. | Le pendant API des requêtes SQL normalisées du projet d'origine. Voir §6.5. |
| D318 | **Seuils de pertinence** : **récurrence sur plage temporelle** (1×/jour, /semaine, /mois — la régularité pèse autant que le volume) + **rapport longueur normalisée / longueur réelle** (le taux de compression = le gain estimé du service). **Valeurs à évaluer sur données réelles** (calibrage en Q59). | Dilemme nommé : seuil trop bas = bruit, trop haut = optimisations sous les radars. Patron D47–D51. Voir §6.5. |
| D319 | **Pas de catalogue de motifs prédéfini** : les motifs **se déduisent des motifs identifiés** par la grammaire — **non connus à l'avance** ; le catalogue de détections dédiées proposé est écarté. | Un seul moteur de détection, sans a priori — les schémas classiques émergeront comme règles courtes. **Clôt Q30.** Voir §6.5. |
| D320 | **Format de description : syntaxe empruntée au YAML, pas de format personnalisé** ; **décomposition en plusieurs fichiers et/ou dossiers** — une valeur peut référencer **un fichier ou un pattern de fichiers** (`01-Utilisateurs/*.yml`, `./*/instance.yml`). | Q16 phase 3. Voir §3.2c. |
| D321 | **Variables d'interpolation** : `${KEY}` / `${KEY?DefaultValue}` — KEY = **item de configuration à navigation relative remontante** (`{name}` = même niveau ; `{.name}` = niveau précédent ; `{..name}` = parent du précédent — chaque point remonte d'un niveau), **mot-clé** (`PROJECT`, `VERSION`, `date`, `date:<format>`… liste extensible), ou **variable d'environnement** ; `?` = défaut si absent ; **imbrication permise** (`${triggers.${environment.name}.filename}`). | Spécification éprouvée sur l'implémentation existante de l'auteur ; pas d'ancrage racine — résolution relative au nœud courant. Voir §3.2c. |
| D322 | **Organisation versionnée de la description** : la description **déclare en tête la version du méta-schéma** (le format) ; **un fichier d'entrée par version du schéma client, référençant un sous-dossier** contenant le détail de la description. | Q16 phase 2, premier pas — s'appuie sur la décomposition D320 ; lecture résolue par D324 (le dossier des versions matérialise le journal). Voir §3.2c. |
| D323 | **Philosophie des petits fichiers** : de petits fichiers de configuration plutôt qu'un seul ; **les redondances n'étant pas facilement éliminables, les variables (D321) référencent une valeur une fois** pour la réutiliser partout. | La raison d'être du dispositif de la phase 3. Voir §3.2c. |
| D324 | **Le dossier des versions** : une description par version, **dans un même dossier** où le moteur **découvre les versions disponibles** ; **déposer un nouveau fichier = publier une nouvelle version** (versionnement **croissant** exigé) ; version à **4 valeurs `<majeure>.<mineure>.<indice>.<build>`**. | Le geste concret du déploiement à chaud (D17). Voir §3.2c. |
| D325 | **Partage commun / versionné** : la **configuration technique commune** à toutes les versions (connecteurs, journaux, items à venir) vs **le contenu versionné** (schéma de données, IHM, configuration générale — dont seuils de télémétrie et méta-niveau). | L'arborescence du dépôt reflète ce partage. Voir §3.2c. |
| D326 | **Registre des versions essayées** : le moteur **conserve la référence des versions testées et validées** ; **une version en erreur n'est pas réessayée sans incrément (au moins) du build**. | Le retry est un acte explicite — pas d'acharnement, tentatives traçables. Voir §3.2c. |
| D327 | **Le fichier = une enveloppe convertie en logique interne** ; **après lecture, la modification des fichiers ne permet ni reconstruction ni altération de l'existant** (pas de re-vérification à chaque sollicitation ou relance). | Les fichiers sont inertes après ingestion — la logique interne est la vérité opérationnelle. Voir §3.2c. |
| D328 | **La migration s'effectue dès que la description de version est validée** ; la version devient alors **sollicitable via les API et par les IHM**. | Harmonisé avec le pipeline D7–D9 (dry-run, affluence, exécution) et la chaîne des versions publiées (D94–D100). Voir §3.2c. |
| D329 | **Journal de migrations compilé** : le moteur **traduit les descriptions en un journal à format interne qui lui est propre** (performance) ; **migration gérée en mémoire** ; **à la relance, les règles sont prêtes à l'emploi** — les optimisations déjà réalisées et **réutilisables** (forme compilée persistée). | Pièce maîtresse de la logique interne (D327) ; nourrit aussi la chaîne de translation des API (§5.1). Voir §3.2c. |
| D330 | **Descendante = refus propre immédiat** : format déclaré > format supporté → refus **sur la seule lecture de l'en-tête**, avant toute ingestion, avec la **version de moteur requise** ; consigné au registre (D326) avec la cause **« format non supporté »** — le bump du build ne sert à rien, **c'est le moteur qui doit monter**. | Le miroir du 426 (D94) transposé au contrat moteur↔description. Option (c) validée « sans hésiter ». Voir §3.2c. |
| D331 | **Ascendante = conversion à l'ingestion** : le moteur vN+1 **lit les formats antérieurs** (journal de migrations du format embarqué complet) et **compile l'enveloppe ancienne directement en logique interne à jour** ; **les fichiers du technicien ne sont jamais réécrits**. | Validée par l'auteur. Voir §3.2c. |
| D332 | **Diffable et commentaires : questions caduques** — le moteur ne réécrivant jamais les enveloppes, les fichiers restent tels qu'écrits (commentaires compris) ; un outil de mise à niveau serait **un outil du technicien, pas un geste du moteur**. | **Clôt la phase 2 de Q16** (le versionnement du format est entièrement spécifié : D322–D332). Voir §3.2c. |
| D333 | **Documentation générée automatiquement** : le méta-schéma et la configuration construisent en automatique — **autant que possible** — une **documentation technique**, les **masques d'explication** (D209) et une **documentation fonctionnelle**. | Prémices : D124 (« exploitables par des IA ») et `document: md.yml` (D320). Deux sources complémentaires avec la documentation rédigée en amont (D314/Q58). Voir §3.2c. |
| D334 | **Documentation vivante + partage élargi** : la documentation technique **exploite les données enregistrées en base** (usage ou non-usage de valeurs et de plages — la télémétrie D38–D51 en troisième source) ; **des informations dédiées au technicien pourront être partagées aux utilisateurs, aux techniciens de parties tierces et aux usagers**. | Le modèle dit ce qui est *permis*, la base dit ce qui est *fait*. Partage sous les règles d'accès existantes (D25–D27 — interprétation). Voir §3.2c. |
| D335 | **La langue du dépôt** : les **noms de dossiers, de fichiers et les propriétés de configuration sont en anglais** — la structure en anglais, la sémantique métier dans la langue du modèle. | Cohérent D301/D309 ; les échantillons D320 s'y conformaient déjà. Voir §3.2c. |
| D336 | **Le dépôt du client est distinct du projet** : le dossier de description est **versionné par le client dans un dépôt différent** du projet Syncytium. | Moteur public / descriptions par TPE — le contrat entre les deux = le format versionné (D322–D332). Voir §3.2c. |
| D337 | **Le dossier `template/` : un projet « Hello world ! »** embarqué dans le projet Syncytium — **facilite la prise en main par le technicien**. | Description minimale clonable, application immédiate ; premier des exemples de la documentation (D314/Q58–Q59). Voir §3.2c. |
| D338 | **Le statut d'une version = son emplacement** : pas de statut dans le fichier — **le dossier `versions/` est décliné par environnement** (sous-dossiers = les environnements déclarés) ; **déposer dans un environnement = publier pour cet environnement** (étend D324). | Interprétation « interdite/dépréciée hors fichiers » amendée par D340 — tout le cycle de vie est en dossiers. Voir §3.2c. |
| D339 | **Le dossier `environments/`** : `staging.yml` (test), `production.yml` (production **active**), `passive.yml` (production **passive** — PCA/PRA D113–D114) — les caractéristiques techniques par environnement. | Voir §3.2c. |
| D340 | **Quatre dossiers de versions** : `beta/`, `production/`, `deprecated/`, `forbidden/` — **le cycle de vie D103 entièrement matérialisé par l'emplacement**, les transitions = des **gestes de fichier** (promotion, dépréciation avec Sunset, interdiction). | Dépréciées servies jusqu'au Sunset, interdites refusées (D94/D103 inchangés) ; `beta/` → staging, `production/` → actif + passif. Voir §3.2c. |
| D341 | **Groupes et modules fonctionnels versionnés avec le schéma** (contenu versionné D325) ; **les affectations restent des actes d'administration en base** (personnes↔groupes D27, utilisateurs↔modules fonctionnels D210). | Le modèle des droits et l'expérience évoluent avec le schéma. **Clôt le domaine 1 de l'inventaire (Q16 phase 1).** Voir §3.2c. |
| D342 | **`technical/` écarté au profit d'`environments/` — un dossier par environnement** : **connecteurs, logs, settings et documentation spécifiques à chaque environnement** ; les valeurs partagées passent par les variables (D321/D323). | Amende D339 (fichiers → dossiers), précise D325 (commune aux versions, déclinée par environnement). Voir §3.2c. |
| D343 | **Journaux par environnement** : staging = **debug/verbose** ; production active = **info + puits de logs éventuel** ; passive = **warning** ; **formats et emplacements de stockage différents** par environnement. | Voir §3.2c. |
| D344 | **Cohérence du dossier des versions** : **erreur si une même version apparaît dans deux sous-dossiers simultanément** ; **le statut est porté par l'ingestion** (registre D326 — les dossiers sont le geste, l'état ingéré la vérité) ; **transitions unidirectionnelles** : `beta → production`, `production → deprecated | forbidden` — **jamais l'inverse, et `deprecated → forbidden` écarté** (une dépréciée est éprouvée par l'usage ; le bug critique se constate en production). | Complété par D345 : `beta → forbidden` permis (bug critique en validation). Voir §3.2c. |
| D345 | **Conservation et ordre des numéros** : **`beta → forbidden` permis** (bug critique en phase de validation) ; **dépréciées et interdites conservées** (mémoire historique) ; **ordre incrémental : `beta` > `production` > `deprecated`** — **`forbidden` hors contrainte**. | Rien ne s'efface ; l'ordre des numéros reflète le cycle de vie. Voir §3.2c. |
| D346 | **Le dossier `resources/`** — à la racine (même niveau que `syncytium.yml`) : **logos, icônes, images et autres documents, partagés avec toutes les versions**. | Ressources de la description (logo D191, icônes D283…) ≠ stockage des fichiers de données (D160, hors dépôt). Voir §3.2c. |
| D347 | **Le dossier d'un module** : `module.yml` (l'entrée) + **sous-dossier `entities/`, un fichier par entité** — `entities: - entities/*.yml`. | La séparation par sous-dossier exclut le fichier d'entrée du pattern par construction. Domaine 2, premier arbitrage. Voir §3.2c. |
| D348 | **Le bloc `settings` de `module.yml`** : regroupe **les propriétés potentiellement diffusées dans les sous-composants** (history D168, quota D162…) ; **structuration à consolider au fil des domaines** — section volontairement ouverte. | Le patron s'esquisse : des `settings` à chaque étage (environnement, module, entité, champ), chaque niveau raffinant les défauts du supérieur. Voir §3.2c. |
| D349 | **Le `settings.yml` du module** : le bloc settings est **externalisé dans un fichier `settings.yml`, référencé par `module.yml`** (`settings: settings.yml` — la référence de fichier D320) — anticipant sa croissance. | « La suite nous dira si c'est le cas. » Un `settings.yml` à chaque étage — le patron s'affirme. Voir §3.2c. |
| D350 | **La déclaration d'un module marque son activation** — pas de drapeau : présent dans la description = actif ; désactiver = retirer de la description (nouvelle version, migration). | D117.3 (« activation par instance ») porté par le contenu de la description propre à chaque instance (D16). Le geste déclaratif est l'acte. Voir §3.2c. |
| D351 | **Le menu du module est stocké dans `menu.yml`** (dossier du module, référencé par `module.yml` — patron D349) ; **optionnel** : sans lui, le défaut D186/D191/D193 s'applique. | Contenu détaillé au domaine 4 (entrées à 5 types, hiérarchie, filtrage par confidentialité). Le dossier de module est complet : module.yml + settings.yml + menu.yml + entities/. Voir §3.2c. |
| D352 | **L'externalisation des blocs d'entité est libre, jamais imposée** : cas simples = **un fichier unique léger** (le découpage excessif alourdit) ; entité conséquente = **le découpage bienvenu** (référence de fichier D320) — au choix du technicien, cas par cas. | La souplesse sans convention imposée. Voir §3.2c. |
| D353 | **Héritage : `inheritance` (enfant) = la seule référence au parent** ; **la machine à états = un bloc sur le parent**, référençant les enfants (niveaux, branches D146, promotions/rétrogradations D147, déclencheurs D54/D148). | « Le paramétrage doit être naturel » — la hiérarchie se lit là où elle est entière ; forme `states:` validée (D354). Voir §3.2c. |
| D354 | **La sémantique du `when` : le cliquet** — déclencheur automatique sous **3 formes** (événement de données D54, opération D148, **expression D90**) ; **la transition s'exécute à la première vraie** ; si la condition redevient fausse, **l'état acquis est conservé** (le client reste client) ; **le retour = une action explicite autorisée** (D147/D196). | La condition déclenche le franchissement, elle ne tient pas l'état. Voir §3.2c. |
| D355 | **La création directe à un niveau est possible** : un client peut être créé **sans passer par la phase prospect** — l'enregistrement naît avec la position du niveau choisi. | Identité unique dès la naissance (D142), autres branches acquérables ensuite (D146). Voir §3.2c. |
| D356 | **Le bloc `fields` = mapping ordonné** : le nom du champ en clé, **l'ordre de déclaration décrit l'affichage par défaut** ; **+ forme courte** : une valeur chaîne = le type, tout au défaut (`notes: text`). | « Utile pour faire un mode simple et rapide » — l'esprit des cas simples légers (D352). Voir §3.2c. |
| D357 | **L'identité fonctionnelle déclarée sur l'entité** : `identity: [code]` — pas de drapeau champ par champ. | Les clés composites se lisent d'un regard ; la clé simple s'écrit aussi facilement (D142). Voir §3.2c. |
| D358 | **Les valeurs du catalogue en anglais** (étend D335) : types (`amount`, `thumbnail`…), confidentialité (`public`/`protected`/`private` — D25), modes (`write-once`)… | L'anglais pour la machine, les `labels` pour l'humain — la ligne du catalogue de fonctions (D301). Voir §3.2c. |
| D359 | **Types personnalisés** : définissables dans le `settings` de **l'instance, du module ou de l'entité** ; un champ les utilise comme tout type et **reprend toutes les propriétés par défaut, surchargeables**. Ex. : `progression` = entier 0..100 + composant « fuel » → champ `avancement: progression`. | La bibliothèque enrichissable (D52/D68) trouve son geste déclaratif, la forme courte (D356) son plein sens ; le graphe de conversion reste aux types du catalogue (D360). Voir §3.2c. |
| D360 | **Résolution des types personnalisés** : le plus proche l'emporte (**entité > module > version > Syncytium**), noms du catalogue **réservés** ; étage « instance » = **`settings.yml` à la racine du dossier de version** (contenu versionné D325) ; **chaînage possible** ; **ne portent pas le graphe de conversion** — le graphe (D120/D123) reste aux types du catalogue, les propriétés reprises se résolvent en contraintes du champ. | « Les types custom facilitent le déclaratif mais ne portent pas le graphe de conversion. » Voir §3.2c. |
| D361 | **Catalogue nominatif des types, anglais natif** : « les types "réel" ou "tva_intra" n'existent pas dans Syncytium — nous utiliserons `decimal` ou `vat_number` » ; siren/siret/iban/bic inchangés (identifiants du domaine). Simples, composés, contenus, structurels — chaque type avec ses facettes. | Les noms français du document = étiquettes de travail (D358). Voir §3.2c. |
| D362 | **La liste : `type: list of text`** — la phrase se lit ; **les facettes déclarées sur le champ s'appliquent à chaque élément** (`size`, `mask`… contraignent chaque valeur). | D166 : l'atomicité est l'élément ; mots-clés anglais (D301). Voir §3.2c. |
| D363 | **Adressage logique par points** : `<module>.<entité>.<champ>` — **le point, pas la barre oblique** : « l'organisation des dossiers peut être finalement libre » — le chemin logique est **découplé de l'arborescence physique** ; nom local suffisant dans le même module. | Le namespace est porté par les déclarations (`name:`), les dossiers ne sont qu'une convention (les patterns D320 listent ce qui est inclus). Voir §3.2c. |
| D364 | **Socle commun du champ finalisé** (dix propriétés) ; **`validation` = plusieurs règles**, chacune portée par **le conditionnel d'autres valeurs de l'enregistrement ou une expression régulière** — chaque règle en échec = refus + trace (D307). | Le `matches` et le `if` du langage (D90/D301) ; forme liste en proposition. Voir §3.2c. |
| D365 | **Pas de `settings` au champ** : « le champ porte les settings » — les valeurs en cascade (quota D162…) s'écrivent en **propriétés directes** ; la cascade de blocs s'arrête à l'entité. | Amende la note D349 (« vraisemblablement l'entité et le champ ») et la famille 6. Voir §3.2c. |
| D366 | **`text` — `size` à quatre formes** : `auto` (défaut — s'auto-ajuste au contenu) / `<max>` / `<min>..` / `<min>..<max>`, **déclarable dans le nom du type** (`text[30]`, `text[3..10]`, `text[3..]`) ; mono/multi-ligne **déduit** (seuil d'instance), surchargeable par `component` ; `mask` déduit taille et lignes — `mask` + `size` = **erreur d'ingestion**. | Le crochet = **paramètre en ligne** du format ; la forme courte reste entière (D356). Voir §3.2c. |
| D367 | **`searchable` = le mode de recherche** : absent (défaut — pas de recherche) / `strict` (valeur égale) / `normalized` (D222) / `similarity[0.8]` (seuil D229 en ligne) — chacun **ouvre un champ de recherche propre au champ** ; `mutualizable[name]` = **champ de recherche mutualisé** entre plusieurs champs. | La « recherche nommée » de D227 déclarée côté champs ; raffine D226–D229. Voir §3.2c. |
| D368 | **Champ de recherche mutualisé** : **contient normalisé par défaut** (D222/D226) ; **la similarité déclarable** — « utile pour intégrer les fautes de frappe » — en second paramètre : `mutualizable[who, similarity[0.8]]`. | Déclarations divergentes sur un même nom = erreur d'ingestion (esprit D344 — note). Voir §3.2c. |
| D369 | **Le mutualisé au-delà du texte** : « la recherche va s'appuyer sur **la conversion du type en texte** » — la forme affichée (facette D119) est la clé de recherche partagée ; entier, date, montant rejoignent la boîte commune par leur forme lisible. | Doctrine générale du champ partagé — aucun type exclu. Voir §3.2c. |
| D370 | **`integer` porte `mask` = un format** : `"000000"` (aligné à droite, six chiffres), `"00 00 00"` (espace entre deux chiffres) — le `0` = emplacement de chiffre, littéraux intercalés. | L'esprit D260, le `9` du texte devenant le `0` du nombre ; cohérence masque/bornes = erreur d'ingestion (note en proposition). Voir §3.2c. |
| D371 | **`searchable: range`** = recherche par **plage de valeurs** ; sur l'entier, **`normalized` revient à `strict`** (accepté, équivalent) et **`similarity` est autorisé — basé sur la conversion en texte**. | Étend D369 : la conversion en texte porte **tous** les modes textuels hors du type texte ; `range` = types à ordre naturel (D125 — note). Voir §3.2c. |
| D372 | **`integer` clos** : **bornes dans le nom du type** (`integer[100]`, `integer[0..100]`, `integer[0..]`) ou `min`/`max` ; **octets jamais déclarés** — dimensionnés **en fonction des bornes ou des valeurs affectées**, « un peu comme le mode `auto` du texte ». | La symétrie de D366 ; le moteur dimensionne, le technicien décrit le domaine. Voir §3.2c. |
| D373 | **`decimal` clos** : `decimals` = **propriété** (défaut : **le `settings`, ou 2**) ; stockage **exact** (« stockage en entier en convertissant les décimales dans la partie entière » — dimensionnement D372, « calculs optimisés et performants ») **ou réel** (arrondis autorisés) ; `mask` étendu aux décimales (séparateurs rendus selon la langue D217/D221) ; recherche = le jeu de l'entier (D371) ; bornes en crochet. | `storage: exact` (défaut) / `real` **validé** (« "storage" me convient ») ; `decimal[2]` écarté (ambigu). Voir §3.2c. |
| D374 | **Le booléen — cycle du tri-état** : « une case à cocher à 3 états : **faux → vrai → nul → faux**… » — chaque clic avance d'un cran ; le nul se ressaisit à la main, valeur de plein droit. | Le tri-état découle de `required` (proposition en arbitrage) ; cohérent avec la doctrine du nul en table (Q47). Voir §3.2c. |
| D375 | **Le booléen — la recherche par le composant** : « une recherche `strict` s'appuie sur **une case à cocher ou un toggle** » — le champ de recherche est le composant du type ; le tri-état en recherche vise aussi **les lignes nulles** (doctrine Q47). | La ligne de D228 (un filtre par type de données) appliquée à la recherche déclarée. Voir §3.2c. |
| D376 | **Booléen `required` en recherche** : la case tri-état demeure — **sa position nulle filtre Vrai & Faux** (« aucun filtrage », tout passe). | Le sens de la position nulle suit la donnée : optionnel → lignes nulles (D375) ; obligatoire → « tous ». Voir §3.2c. |
| D377 | **`boolean` clos** : `values` surcharge les libellés VRAI/FAUX/NUL par langue (D281/D130) ; **tri-état découlant de `required`** ; recherche non engagée = aucun filtre (réinitialisation — D228) ; composant case/toggle-sans-nul/énuméré en surcharge ; **naissance : optionnel → nul, obligatoire → `false`** sauf `default: true`. | « Je valide les points. » Le stockage dit la même chose que l'écran. Voir §3.2c. |
| D378 | **Durée — la virgule du masque** : « une heure en centième, une minute en centième ou une heure en dix-millième » — le masque D276 porte le sexagésimal (`00:00`) **et la notation décimale industrielle** (`0.00 h`, `0.00 min`, `0.0000 h`) ; la conversion fait le pont vers **la valeur canonique unique**. | Le séparateur symbolique rendu selon la langue (D373) ; Excel reçoit le canonique. Voir §3.2c. |
| D379 | **Le tri du nul = une équivalence par type** : `boolean` — **nul < faux < vrai** ; `text` — **nul ≡ chaîne vide** ; `integer` — **nul ≡ 0** (classé parmi les valeurs, pas à une extrémité). | Vaut pour la comparaison intrinsèque (D125) seulement — le nul stocké demeure nul (Q47) ; nul temporel à la clôture des temporels. Voir §3.2c. |
| D380 | **Doctrine du tri complétée** : `decimal`/`duration` — **nul ≡ 0** ; **propriété `sort`** au socle pour les types à variantes (`text` : `alphabetical` défaut \| `natural` ; l'énuméré viendra) ; **référence triée sur le libellé affiché**, calculé sur sa valeur. | Le parcours énonce désormais la règle de tri à chaque type. Voir §3.2c. |
| D381 | **Temporels clos** (« ok pour tout ») : précision en crochet (`time[hh:mm]`) ; nature en crochet (`datetime[raw]` **défaut** \| `datetime[timestamp]`, précision en 2ᵉ paramètre) ; bornes `min`/`max` en **littéraux ISO** (le dynamique → `validation`) ; **pas de `mask`** (le format vient de la langue D217/D221) ; recherche `strict`/`range`/`mutualizable` ; **nul trié en tête**. | D220/D277–D280 trouvent leur écriture déclarative. Voir §3.2c. |
| D382 | **La date à précision** (complète D381) : `date[yyyy-mm-dd]` (le jour — défaut), **`date[yyyy-mm]`** (le mois), **`date[yyyy-ww]`** (la semaine — numérotation liée à la langue D279). | Valeur brute (D220), sérialisation ISO à la granularité (`2026-07`, `2026-W30`), calendrier au bon grain. Voir §3.2c. |
| D383 | **Temporels — la nature la plus fine par défaut** (`date[yyyy-mm-dd]`, `time[hh:mm:ss.sss]`, précision `datetime` la plus fine — `raw` reste le défaut de nature) ; **le `mask` possible**, le masque de la langue (D217/D221) restant le défaut. | Amende le point 4 de D381. Voir §3.2c. |
| D384 | **`file` clos** : `extensions` en **deux formes** — liste simple ou **mapping à libellés par langue** (`pdf: { fr: facture }` — le document attendu, nommé) ; `quota` acquis (D162/D365) ; **métadonnées jamais déclarées** (D160) ; recherche **nom + mots-clés**, tri sur le nom (nul ≡ chaîne vide) ; le reste au moteur/composants (D161/D165/D292–D293). | Le libellé d'extension nourrit l'écran de dépôt et la documentation (D333). Voir §3.2c. |
| D385 | **`image` = un simple dérivé de `file`** : extensions limitées aux formats d'image, **taille ajustée/retaillée par le moteur** ; `thumbnail` suit la même filiation (D286). | Reclasse le catalogue D361 (thumbnail/image quittent les « contenus ») ; hérite du socle D384, détail au parcours après `enum`. Voir §3.2c. |
| D386 | **L'entité désigne son champ image** — « pour que, dans une liste, l'image soit sélectionnable » : propriété d'en-tête `image: <champ>` (forme en proposition), le **visage de l'entité**. | Ancre déclarativement le choix par l'image (D284–D285) et la vignette en cellule/widget (D286/D293). Voir §3.2c. |
| D387 | **`enum`** : `values` gagne **`description`** (l'infobulle, en complément du libellé) ; **ordre de déclaration = présentation + tri** (`sort: declaration` défaut \| `label`) ; **stockage numérique** — clé numérique → entier, clé chaîne → **transformée en valeur numérique** ; attention aux migrations : « l'ajout intercalé d'une valeur ». | Résolution en proposition : code interne **stable**, l'intercalé reçoit un code nouveau (présentation ≠ dictionnaire de stockage) — pour le domaine migrations. Voir §3.2c. |
| D388 | **`enum` clos** : recherche **par le composant** — liste de sélection du jeu de valeurs (D228), multi-sélection en recherche, `mutualizable` par le libellé ; **nul trié en tête**, entrée `null:` dans `values` pour le libellé de la ligne vide (patron D377). | Les dix simples d'origine (D118/D121) sont détaillés. Voir §3.2c. |
| D389 | **`image`/`thumbnail` clos** : dimensions **dans le crochet** (`image[1920x1080]` — boîte maximale, proportions conservées, **jamais de recadrage** D293) ; vignette automatique aux dimensions du settings ; `thumbnail` ne garde **que** la petite taille ; extensions = jeu image restreignable ; héritage `file` intégral (D384). | « Ok pour les 5 points. » Les simples sont au complet — place aux composés. Voir §3.2c. |
| D390 | **Le placeholder d'une image = une icône** — « pour matérialiser le fond d'une image non définie » (`placeholder: package.png` ← `resources/` D346). | Le placeholder du socle (D364) s'interprète par type : valeur de démonstration (texte, nombres), icône de fond (image, thumbnail). Voir §3.2c. |
| D391 | **Les composés arbitrés** : héritage du kit de la base + validation intégrée + facettes propres ; `amount` — `currencies` paramétrables (**défaut : tout l'ISO**) ; `percentage` — bornes, **défaut 0..100**, hors cadre la représentation varie ; `measure` — unités **statiques / table de référence / libres** (défaut) ; `phone` — **national** (défaut) ou international ; **`geolocation` triable par la distance à une focale** (défaut : la localisation courante — amende D125), recherche par distance à un point ; `period` hérite du **format date/heure** (crochet D381–D383) ; **le nul des composés en premier**. | La règle composée prime l'équivalence de la base (D379) ; `focus:` **validé** — au champ ou hérité du setting (cascade D360). Voir §3.2c. |
| D392 | **Géolocalisation — la zone de texte associée** : la valeur porte, en plus des coordonnées, un texte (l'adresse, le lieu — géocodage D294) ; **le mutualisé s'appuie dessus, sinon sur la standardisation des coordonnées en chaîne**. | Définit la conversion en texte du type (D369). Voir §3.2c. |
| D393 | **`communication` clos** : la visibilité **= la confidentialité** (D25, socle — pas de « maximale ») ; `attachments` **référence `file`, `image` ou `thumbnail`** avec leur kit à plat ; **amende D295** — en cellule, **une petite icône** + au survol **les derniers échanges résumés** (taille paramétrable en lignes) ; **non listable** (D166) ; **la recherche porte sur le contenu des messages**. | Auteur et horodatage générés (D77) ; `preview:` en proposition. Voir §3.2c. |
| D394 | **Référence = association origine → destination** : l'origine **porte le champ** (le nom chez elle), le lien naturel et sémantique vers la destination ; **l'accès retour (destination → origine) jamais déclaré — Syncytium le propose**. | « Une relation parent-enfant (avec un seul enfant) » — la ligne D353 ; éclaire D216 (la liste nommée du 1-N habille un accès que le moteur possède). Voir §3.2c. |
| D395 | **Filtre de référence** : la condition **s'évalue depuis la destination** ; fonctionne **à la sélection** ; contrôle de conformité **en option** — **immuable** (brisée → « une mise à jour sera à prévoir pour valider la donnée ») ou **liée à la sélection seulement** ; **rapport des non-conformes** (filtre modifié, champ calculé dérivant). | `check: selection` (défaut) \| `immutable` en proposition ; accès à l'origine par `me.` (D396). Voir §3.2c. |
| D396 | **Raccourci de référence** : « si le type est le nom d'une entité, c'est une référence » — `company: hr.company` (le `to` devient inutile) ; **l'origine se lit par `me.`** dans le filtre (`filter: company = me.company` — préféré à `origin`). | Collision nom de type personnalisé / entité = erreur d'ingestion (note en proposition, esprit D344). Voir §3.2c. |
| D397 | **Référence — régimes et label** : l'écriture **API soumise au filtre, sauf forçage explicite** de l'appelant ; **le rythme du rapport = une propriété du champ** ; l'état « à valider » **porté par le moteur, visible, non bloquant** ; **`label:` d'entité validé** (champ ou gabarit, défaut : la clé fonctionnelle) — recherche et tri sur le libellé affiché, composant à recherche/choix par image (D386). | La valeur forcée relève du rapport (note) ; `report:` en proposition. Voir §3.2c. |
| D398 | **Stockage de la référence (clôt la référence)** : **l'UUID technique de la cible** (D142) — jamais la clé fonctionnelle (D141), jamais le libellé ; les frontières traduisent (IHM = `label`, **CSV = clé fonctionnelle**, API = UUID) ; référence vers un inactif **valide** (sélection = actifs seuls) ; **pas de cascade** (elle appartient à la composition) ; dénormalisation = choix du moteur. | « Je valide le stockage. » L'esprit D372 : le technicien décrit, le moteur dimensionne. Voir §3.2c. |
| D399 | **La composition = un champ du possesseur** : « la composition est sur l'entité d'origine, et le type est `list of <nom de l'entité>` » — `lines: { type: list of order_line }` sur `order` ; **l'enfant ne déclare rien**, l'accès retour automatique (D394). | La référence pointe **un**, la composition pointe **plusieurs** — même geste, le `list of` (D362) fait la différence ; la facette sur l'enfant est écartée. Voir §3.2c. |
| D400 | **Le trio des liens** : `list of <entité>` = **la** composition (« c'est la définition ») ; **`association with <entité>`** = l'association multiple libre — inter-modules (D116), sans cascade, machinerie de liaison **au moteur** ; **l'imbrication multi-niveaux nécessaire** (« facture → indice → ligne ») — **la racine demeure l'ancre de l'agrégat** (D101/D111). | Référence = un ; composition = plusieurs possédés ; association = plusieurs libres. Voir §3.2c. |
| D401 | **L'association reprend les propriétés de la référence** : `filter`/`me.` (D395/D396), `check` + rapport (D395), forçage API (D397), affichage `label`/`image` de la cible, recherche/tri sur le libellé, stockage UUID (D398). | Chaque élément lié = une référence ; seules la cardinalité et la liberté changent (D400). Voir §3.2c. |
| D402 | **Le lien n-aire** : `list of [module, right]` / `association with [module, right]` — **chaque élément = une combinaison des entités nommées**, avec **des propriétés par entité nommée** (le kit D401 pour chacune). Les matrices/hypercubes (D134) se rapportent au lien. | Exemple fondateur : user × module × droit ; la proposition `by:` est écartée — la combinaison EST l'élément. Voir §3.2c. |
| D403 | **La cellule du n-aire** : `list of [size, color] { quantity: integer[0..], … }` — **l'accolade porte les champs de la cellule**, avec « toute la puissance des champs déjà définis » ; **le moteur modélise cet objet de façon transparente** ; **unicité structurelle** — une cellule par combinaison de clé (liste et association). | « string » → `text` (D361) ; forme éclatée ≡ accolade (esprit D352) — notes. Voir §3.2c. |
| D404 | **Le bloc `validation:` au niveau de l'entité**, frère de `fields:` — les règles de l'enregistrement (multi-champs) y vivent. | **Confirmé : « la validation est possible sur un champ ou sur une entité »** — le champ garde ses règles locales (D364) ; la trace D307 cite le niveau. Voir §3.2c. |
| D405 | **L'association conditionnelle** : `orders: association with order if order.customer = me` — **l'`if` fait l'association dérivée** (la vue navigable D136, jamais stockée, en lecture — la vérité reste la référence) ; sans `if`, l'association stockée libre (D400). | Matérialise l'accès retour (D394) en le nommant — le trou n° 2 de la contre-passe se referme ; `count(orders)`, surfaces, chemins (D71). Voir §3.2c. |
| D406 | **Le rapport des non-conformes : affectable** — « à un utilisateur ou un groupe, sous forme de mails ou de notifications » (l'infra D108–D110, les groupes D26–D27). | Forme **validée** (« cette forme me convient ») : `report: { when: [migration, weekly], to: [...], by: [mail, notification] }` — l'à-la-demande toujours là ; défaut amendé par D407. Voir §3.2c. |
| D407 | **`report` en cascade** — instance / module / entité / champ (le plus proche l'emporte) ; **défaut : le rapport existe — à la demande, vers l'administrateur** (D29), aucun rythme implicite ; **`report: no` = l'exclusion explicite** (« pour ne pas déclencher de rapport »), posable à tout étage. | Amende D406 ; le premier défaut « report: no » est écarté par revirement. Voir §3.2c. |
| D408 | **Le nom du type est la clé** — un seul espace de noms : catalogue, personnalisés (D359), entités (D396), **hooks de type** (de nouveaux noms, exploitables comme les types standard) ; **le mot-clé `hook` n'apparaît jamais** ; et **« tous les types proposés sont finalement des hooks qui appartiennent à Syncytium »** — le catalogue = les hooks embarqués. | Un seul mécanisme de bout en bout (D52) ; déclaration au domaine 6 ; doublon de nom = erreur d'ingestion (D344/D396). Voir §3.2c. |
| D409 | **Le type `counter`** (l'écriture de D154–D155) : allocation transactionnelle, continuité ; `format:` gabarit à segment masqué (`{counter:000000}`) ; **`reset:` défini sur la déclaration** (jamais déduit) ; jamais saisi ; **attaché au champ par défaut, mutualisable par le nom** — `counter[my_counter]` entre champs et entités. | Le crochet nomme (patron D367) ; défaut `reset: never` et compteur nommé au settings englobant : **validés** (D410). Voir §3.2c. |
| D410 | **L'artefact de clôture du bloc `fields` validé** : customer.yml + order.yml canoniques consignés ; défaut **`reset: never`** ; **compteur nommé déclaré au `settings` de l'étage englobant** (cascade D360). | La contre-passe soldée — **le bloc `fields` est clos** (complétude finale après tous les domaines, règle du chantier). Voir §3.2c. |
| D411 | **Les valeurs de `history`** (l'écriture de D168–D174) : **`perpetual`/`true`** (tout depuis la création — défaut du mode activé), **`false`** (désactive), **`temporal[x]`** (x jours), **`update[x]`** (x dernières modifications) ; **la propriété d'une entité porte aussi sur les agrégations** (D169). | Le crochet-paramètre porte la rétention ; absent = inactif (D168 inchangé) ; reste `visibility:` (D170). Voir §3.2c. |
| D412 | **Lecture à date hors couverture** (amende D174) : `assume_current` **inutile** — la règle canonique : date **postérieure à la création** → **l'état à la dernière valeur connue avant l'horizon** (non historisée = valeur courante, rétention dépassée = plus ancien instantané) ; date **antérieure à la création** → **rien**. | La dégradation graduelle et déterministe remplace l'anticipation déclarée ; l'alerte de D174 perd son objet (note). Voir §3.2c. |
| D413 | **La forme riche de `history`** : `mode:` (valeur D411) + `visibility:` (les groupes qui voient l'historique — D26/D170) ; forme courte inchangée (visibilité = la confidentialité de l'entité). | **L'écriture de l'historisation est complète** (D411–D413) — le fond D168–D174 a son format. Voir §3.2c. |
| D414 | **Les groupes** : `groups.yml` à la **racine de version** (transverses aux modules, patron D349/D352), mapping clé → libellés (le nom = la clé, cité partout) ; affectations en base (D27/D341) ; **hiérarchie requise, sans cycle** — **« un groupe est constitué d'autres groupes »** : le contenant déclare (`groups: [accounting, sales_team]`), pas de lien parent. | La ligne D399 (le possesseur déclare) ; multi-appartenance naturelle, le membre d'un constituant est membre du contenant ; acyclicité à l'ingestion (D135). Voir §3.2c. |
| D415 | **`modules.yml` à la racine de version** : « décrit la liste des modules — il fait le lien avec les fichiers `module.yml` » — **la liste explicite**, pas de découverte implicite par les dossiers. | La ligne D320/D363 (l'entrée liste, l'arborescence libre) ; les modules listés = les modules unifiés (D416). Voir §3.2c. |
| D416 | **Les modules fonctionnels = les modules** — l'unification : le module structure **la donnée et l'expérience** (menu.yml D351 = le menu D193, page d'accueil D191, affectation utilisateur ↔ module D210/D341, restriction sans extension de droits D190). | La distinction de D190 est dissoute — lire « module » partout ; le menu peut citer des entités d'autres modules (D116). Voir §3.2c. |
| D417 | **Le glossaire** : un document à part — `docs/glossaire.md` — **à la façon d'un dictionnaire** : le terme français porte les échanges, sa traduction dans la configuration entre parenthèses (Champ/`field`), définition claire et concise, un exemple quand il éclaire, la décision en rappel discret (~55 entrées). | « Il nous sera utile lors de la rédaction de la documentation » (Q58) ; né de l'unification D416 ; la première version trop technique reprise sur retour de l'auteur ; pointeur en §1. |
| D418 | **Le glossaire relu et enrichi par l'auteur** (commits directs) — les évolutions de fond : **le couple Configuration/Description** (la configuration = les fichiers du technicien + les settings en cascade ; la description = le contexte d'un élément — aide, infobulle, masques — **jusqu'à l'interface pour outils tiers dont l'IA**) ; **« Application »** entre au vocabulaire (le cadre d'exécution d'une instance) ; **la clé d'un compteur reste unique malgré la réinitialisation** ; **les hooks élargis** (écrans de saisie, formats CSV/Excel fournis = des hooks) ; **utilisateurs associés par le technicien ou par une passerelle d'authentification** ; **le rapport des non-conformités couvre aussi les modifications directes en base par un outil tiers** ; **les ressources élargies** (tout fichier utile — modèles PDF/Word/Excel) ; renommages français (exécution à blanc, type court, composant graphique, groupe d'utilisateurs, rapport des non-conformités). | Entrées supprimées : Infobulle (absorbée par Description) ; **Ingestion réintégrée avec la définition de l'auteur** (« convertir une version de configuration en une entrée dans le moteur exploitable par toutes les composantes — API, Écrans, CSV… ») ; « méta-schéma » **tranché** : un seul mot couvrant **le modèle porté par une version ET la grammaire utilisée** (la proposition « format de description » écartée). |
| D419 | **Le composé `uuid`** : pour **les identifiants externes** (systèmes tiers, clés D178) — base `text`, validation intégrée (8-4-4-4-12), **stockage compact au moteur** (16 octets), recherche/tri sur la forme canonique. | **L'UUID interne demeure hors déclaration** (D142/Q49 — la famille 7) : la frontière est nette. Voir §3.2c. |
| D420 | **Le raffinement d'agrégat écarté** (amende D101/D133) : **l'agrégat est toujours le grain d'écriture** — la composition est indivisible par nature, l'association porte la vie libre (**le mot-clé fait la distinction**) ; ce que « refine » visait de légitime **est le `filter`** des liens (D395/D401). | Ouvre et clôt le point 5 du domaine 3 — par simplification ; D192 règle unique ; D111/D15 rendent le grain fin sans objet. Voir §3.2c. |
| D421 | **La condition de mise à jour porte sur l'entité** — jamais sur l'association ou la composition : propriété d'en-tête `update:` (expression D90 — `update: status = "draft"`). | En proposition : condition fausse = lecture seule de fait (refus propre D307) ; la racine couvre ses compositions (D420) ; **les opérations passent outre** (le chemin explicite, D354). Voir §3.2c. |
| D422 | **Le statut d'état couvre le CRUD entier** (élargit D421) : chaque état du cycle de vie porte ses droits — **create** (un sous-composant), **read** (la consultation — sans elle, l'état masque), **update** (l'agrégat D420), **delete** (la désactivation D141). | **La propriété se nomme `allow`** — toute combinaison (`allow: [read, delete]`) — sur la valeur d'énuméré ou l'état `states:` ; absent = tout permis ; les opérations passent outre. Voir §3.2c. |
| D423 | **Les deux formes conservées, exclusives** : le cycle (`allow` par état, D422) **ou** la forme libre (le bloc `allow:` d'en-tête, verbe → expression D90) — « pour éviter de faire un hook inutile » ; **« les 2 simultanément ne seront pas autorisés »** (erreur à l'ingestion, D344). | Un nom unique — `allow` — deux foyers ; le `update:` de D421 se fond dans le bloc. Clôt D421/D422. Voir §3.2c. |
| D424 | **`states` désigne le porteur du cycle** : « un état hiérarchique est déjà un statut » (pas de cumul) ; l'entité **sans** hiérarchie **réutilise le bloc `states`** pour désigner son champ énuméré — `states: status`. | **Un seul statut par entité, deux sources** (la hiérarchie D353 ou le champ désigné) ; notes : champ non énuméré = erreur, les deux sources = erreur, la naissance = le `default`. Voir §3.2c. |
| D425 | **Le graphe déclaré, `promote` en tableau** : la logique hiérarchique (D353–D355) transposée à l'énuméré-cycle — chaque valeur déclare ses passages ; **« le promote est un tableau, car nous pouvons avoir le choix entre plusieurs états »** ; hors graphe = refus. | Notes : `demote` en tableau par symétrie ; deux `when` vrais → l'ordre du tableau départage ; le cliquet D354 inchangé ; vaut pour les deux sources. Voir §3.2c. |
| D426 | **Les deux régimes d'une transition (clôt le focus cycle de vie)** : les trois virgules validées (demote en tableau, l'ordre départage, **la naissance libre** D355) ; **sans `when` = la transition libre** — le composant de sélection devient **navigateur du graphe** (les cibles `promote` seules) ; **« la présence du `when` marquera une opération (un bouton ou une action) »** — le chemin nommé, gardé, tracé. | Le `demote` jamais en sélection libre (D354) ; **le composant du statut se déduit de la déclaration** — liste-navigatrice (sans `when`) ou champ en lecture + boutons (avec `when`), le mixte combine ; l'articulation avec le cliquet D354 : question posée. Voir §3.2c. |
| D427 | **Le triptyque du `when`** (solde l'articulation D354) : sans `when` = **libre** (la liste navigatrice) ; `when: <opération>` = **l'acte** (un bouton) ; `when: <expression>` = **l'automatisme** — **le cliquet D354 intact** (« déduit d'un élément de l'entité via le langage d'expression »). | Trois écritures, trois vécus — un seul graphe. Le focus cycle de vie est soldé (D420–D427). Voir §3.2c. |
| D428 | **L'opération porte sa nature** (raffine D427) : **avec `when` = automatique** (le `when` est son déclencheur, jamais une simple garde) ; **sans `when` = un bouton / une fonction API** ; l'expression en ligne d'un `promote` = **l'abréviation** d'une opération automatique anonyme. | « Cycle de vie » et « État hiérarchique » ajoutés au glossaire à la demande de l'auteur. Voir §3.2c. |
| D429 | **La trace des actions = l'historisation** : « les actions sont tracées si l'entité possède un historique » — l'instantané photographie chaque acte (auteur, canal, motif — D169) ; **sans historique, pas de trace d'opération**. | Aucune machinerie de trace séparée — l'acquis D411–D413 porte tout. Voir §3.2c. |
| D430 | **La garde du bouton : le `if` au graphe** — `when: confirm if count(lines) > 0` : le passage n'est légal que si la condition tient (le bouton se grise, l'API refuse proprement D307). | Aucune propriété nouvelle — la garde vit où la transition vit ; `enabled:` et la validation-au-clic écartés. Voir §3.2c. |
| D431 | **La propriété se nomme `validate`, et `validate: true` est le défaut** — le patron D196 (lecture seule + confirmer/annuler, jamais de popup) généralisé aux opérations ; **`validate: false` à déclarer** pour l'exécution directe au clic. | « Validate me convient mieux que confirm » ; la relecture avant engagement est la règle ; les opérations automatiques (D428) non concernées. Voir §3.2c. |
| D432 | **Le bloc `operations:` clos** : au même niveau que `fields:`/`validation:` (mapping ordonné = l'ordre des boutons) ; **jamais d'effet d'état** (la transition au graphe) ; `effects:` ordonnés — `notify`, `document`, `set`, **`function`** (« une fonction interne à Syncytium — un catalogue ou une liste fournie en hook ») ; **disponible partout par défaut**, l'exclusion d'interface déclarable (« un écran ou l'API »). | `except: [api]` en proposition ; le passe-outre des `allow` demeure (D421c). Voir §3.2c. |
| D433 | **Le changement d'état = une opération du catalogue, l'opération par défaut** (celle qu'un `promote` invoque sans autre précision) — la ligne D408 étendue aux opérations : le catalogue embarqué. | **Q60 ouverte** : l'inventaire du catalogue des fonctions/opérations, « un point ultérieurement ». Voir §3.2c et §10. |
| D434 | **Le calendaire riche — `every:`** : les durées (`5min`/`2h`/`2d`/`2w`/`1m`), les raccourcis (`daily`/`weekly`/`monthly`), **le crochet précisant le(s) moment(s)** — `daily[08:00]`, `weekly[tuesday at 15:30]`, moments multiples (`weekly[monday at 09:30:45, wednesday at 20:35:12]`) ; **heures en UTC du serveur**. | Le crochet-paramètre (D366), le `at` du langage (D301) ; sans crochet = moment au moteur, le `when:` du rapport D406 s'aligne (notes). Voir §3.2c. |
| D435 | **`every: continuous`** = « à chaque mise à jour d'un enregistrement de l'entité » (les événements de données D54) — **le même mot que le rapport** (D406) — **et il est le défaut** (`every:` absent = `continuous`). | Le temporel exige son rythme calendaire déclaré (note). Voir §3.2c. |
| D436 | **Notifications soldées par simplification** (« pour le moment, pas de nouveaux éléments » — l'opération automatique + `notify:` couvre tout) ; **les tâches : `mode`** — **`synchronous`** (interface en pause + barre de progression), **`asynchronous`** (enregistrée, la file D24/D55), **`await[+3h]` / `await[+2d at 08:00]`** (le décalage avant lancement). | `background` écarté ; défaut `synchronous` en proposition ; couvre les points 3 et 4 du domaine 3. Voir §3.2c. |
| D437 | **Domaine 4 ouvert — l'ancrage des surfaces** : les cinq blocs (`lists`, `forms`, `summary`, `charts`, `widgets`) **dans un bloc `gui`** (nom : D438) ; **trois étages de complexité** — rien (les défauts D186), un seul fichier (le bloc en ligne), **un dossier par entité** (`entity.yml` + un fichier par bloc). | Références explicites (D320/D415) ; le pattern du module s'adapte. Voir §3.2c. |
| D438 | **Le point 1 du domaine 4 clos** : le bloc se nomme **`gui`** ; **la première déclarée = la surface par défaut** (l'ordre D356) ; **le socle des surfaces = le patron des champs** (labels/comment/description) ; **la déclaration remplace le défaut** (« le défaut proposé par le système n'est plus disponible »). | Suivant : le menu (point 2 — le différé D351). Voir §3.2c. |
| D439 | **Le menu = des adresses** : liste ordonnée filtrée par la confidentialité (inchangé) ; `<module>.<entité>` (liste par défaut), `[<liste>]` (nommée), `.<opération>`, `[+<formulaire>]` (création, nom optionnel), `[@<wizard>]` (nom optionnel), `<module>[<dashboard>]` (**le dashboard au module**), `<nom>:` (sous-menu — libellé au module) ; **`icon` rejoint le socle des surfaces**. | Ma proposition de blocs typés écartée ; le menu = pures adresses, l'icône vient de la surface visée ; notes : libellés de sous-menus, bloc dashboards (point 6). Voir §3.2c. |
| D440 | **Le dictionnaire de libellés du module (clôt le point 2)** : « les labels sont utilisés au-delà du menu — dans un champ, les libellés peuvent y faire référence » — bloc `labels:` de `module.yml` (externalisable D349/D352) ; **la chaîne vaut référence, le mapping vaut inline**. | L'esprit des variables (D323) — la redondance s'éteint ; nom introuvable = erreur, étage version en cascade (notes). Le dashboard → point 6. Voir §3.2c. |
| D441 | **Le `searchable` de liste** : « la liste des champs ou des noms mutualisés à positionner dans un filtre de tri — **par défaut, tous les champs sont inclus dans la recherche** ». | Le champ déclare *comment* (D367), la liste déclare *lesquels* ; amende le défaut de D227 (« colonnes affichées » → « tous les champs »). Voir §3.2c. |
| D442 | **La liste close** : `columns:` (l'ordre d'affichage) ; `filter:` (les expressions) ; **`sort:` par colonne** — sans = toutes triables, avec = la présente triable avec **sa cascade de clés secondaires** (`nom: [prenom, numero]`), l'absente non triable, `+`/`-` (croissant par défaut) ; **`editable:` à défaut readonly** — la colonne s'ouvre en se déclarant. | **Amende D266** (qui ouvrait tout par défaut) ; clôt le point 3 du domaine 4. Voir §3.2c. |
| D443 | **La colonne riche** (complète D442) : « les colonnes portent également **le style, l'alignement et la dimension** » — forme courte (le nom) ou riche (`nom: { align: left, width: 30%, style: bold }`) ; **la forme abrégée délègue au moteur** : « Syncytium décide alors du format par défaut et de la dimension de la colonne en fonction de son type ». | L'esprit D372 — le technicien décrit, le moteur dimensionne ; `align` au défaut du type, `width` %/px/auto, `style` relevant du thème (D191). Voir §3.2c. |
| D444 | **La liste raffinée — l'artefact** : **l'opération en colonne** (l'icône à 3 états : actionnable / non visible / non actionnable) ; **l'export** — colonnes visibles + complémentaires, **CSV = un fichier par type de composants**, **Excel = un fichier à onglets, surchargeable par un modèle** ; **l'auto-rafraîchissement** (pas de bouton) ; la confidentialité = non visible **et non triable** ; **la pagination à indicateurs** (« 21–40 sur 156 »). | La symétrie de l'import d'agrégat (Q55) ; le modèle Excel ← resources/ (D418) ; **l'export porte son tri** (l'écriture de D442, figée) ; l'exemple canonique consigné. Voir §3.2c. |
| D445 | **Les comportements de la liste** : `selection: 1 \| 1..` (harmonisé D474) ; la création en **bouton du cadre/entête** ; la modification au **double-clic** (ligne non readonly) ; la liste **en lecture seule** = le double-clic consulte ; la suppression — **1 ligne = formulaire lecture seule + confirmation** (D196), **n lignes = popup avec le nombre** (l'exception assumée, D202) ; **l'opération de masse sur la sélection**. | Les opérations (D432) rencontrent la sélection ; la masse séquentielle et la double validation (D202). Voir §3.2c. |
| D446 | **`sizable`** — le redimensionnement des colonnes : **`none` / `auto` / `manual` / `auto+manual`** — l'ajustement par l'utilisateur seulement si `manual` ; « la liste est un composant complet et complexe, dont la lisibilité doit s'adapter au format d'affichage ». | Défaut `auto` en proposition (la ligne D443 — le moteur dimensionne). Voir §3.2c. |
| D447 | **La préséance et la colonne fantôme** : « les types portent des propriétés d'affichage dans une liste — **par défaut, elles priment** ; la liste surcharge » (la chaîne **type → colonne**, le pendant de D270) ; **une colonne peut être présente, non affichée et non visible** (jamais révélée, même `sizable: manual`) — « utile pour un export CSV simplifié ». | `visible: false` en proposition ; l'export prend les colonnes **présentes**, les `export.columns` (D444) pour le hors-liste ; exemples canoniques — montant : devise + droite ; toggle : centré ; texte court : gauche ; multi-lignes : justifié. Voir §3.2c. |
| D448 | **La grammaire commune des surfaces** : « forms, summary et widget vont partager un vocabulaire et une grammaire commune » — le socle, `header`/`footer` à gabarits (D253), `mode`, `blocks` (`section`/`tab`) au contenu `fields`/`charts` ; **les spécialisations par restriction** (forms entière + history ; summary sans onglets, un seul ; widgets = charts/KPI/TCD) ; le gabarit PDF et le wizard réutiliseront la grammaire. | « La base que nous allons **reformuler et étoffer** » — l'arbitrage surface par surface suit. Voir §3.2c. |
| D449 | **Le formulaire reformulé** : l'icône **jamais dans `labels`** (le dictionnaire D440 amendé — les langues seules) ; « **un formulaire est conçu pour un mode d'écran** » (D206/D250) ; **quatre parties** — « un **titre** (zone de texte à gabarit), un **entête**, un **corps** et un **pied de page** — des blocs ». | À trancher : la propriété d'écran visé et son défaut (PC paysage D250) ; l'entête/pied — sections seules ou tous blocs. Voir §3.2c. |
| D450 | **`screen` en tableau** (« la compatibilité de plusieurs affichages »), défaut **`[pc paysage]`** ; entête/corps/pied acceptent **sections et onglets** — car **« les blocs sont des composants »** : « un composant "type" à signature commune qui assure un rendu — une section, une grille, des onglets sont des composants ». | Le catalogue des conteneurs (`section`, `grid`, `tabs`…) **extensible** — les livrés sont les hooks embarqués (D408/D263), l'inventaire rejoint Q60. Voir §3.2c. |
| D451 | **Le formulaire arborescent** : « un nœud est un composant qui affiche un composé graphique basé sur **l'enregistrement d'une entité, d'un champ et des opérations** » — conteneurs, feuilles-champs et boutons d'opérations : un seul arbre, une signature commune, **l'imbrication libre**. | Les quatre parties (D449) = les branches maîtresses ; le contexte (enregistrement, champ, opérations) nourrit chaque rendu. Voir §3.2c. |
| D452 | **Le composant de saisie personnalisé** : « un cas d'usage a besoin d'un composant de saisie personnalisée et détaillée qui ne pourra pas se matérialiser avec les éléments de base » — **un nœud comme les autres** dans l'arbre (D451), la signature commune (D450), le nom sans « hook » (D408) ; **l'écriture repasse toujours par les champs et leurs règles**. | Le contrat (signature, code, sandbox) au domaine 6 ; le composant ne contourne jamais le modèle. Voir §3.2c. |
| D453 | **Les propriétés du `form`** : **le gabarit déclinable par langue** (`title:` — chaîne unique ou mapping) ; **`mode: updatable` (défaut) \| `read-only`** ; **`history: false` = désactiver l'onglet d'une entité historisée** (défaut `true`, toujours dernier — D186/D411). | Vaut pour tous les gabarits (D253/D449) ; sans historisation, pas d'onglet. Voir §3.2c. |
| D454 | **La surimpression et sa `dimension`** : « le formulaire peut s'afficher en surimpression de l'écran — la totalité ou une portion » ; **`dimension:` — défaut 100 % de l'écran**, la portion déclarée (`dimension: 70%`). | La surimpression est le mode d'affichage du formulaire ; le patron de la visionneuse (D293). Voir §3.2c. |
| D455 | **Le modèle unifié du composant graphique** (`items` validé) : un formulaire = un composant — **un nom** (`form`/`summary`/`wizard`/`widget`… extensible par hook), **des propriétés**, **des items** (**pages**, header, body, footer), **un contexte** (l'enregistrement, **l'origine de l'appel, l'utilisateur**) ; l'emboîtement libre des surfaces ; **le graphe acyclique parcouru de la feuille à la racine**, les composants recevant du **pré-analysé** ; « le formulaire n'est qu'une matérialisation » — et **« une facette peut être vue comme un hook »**. | La clé de voûte du domaine 4 — la doctrine D408 totale (types, opérations, conteneurs, surfaces, facettes = hooks au catalogue) ; **l'analogie des web components** (« ou une extension ») consignée — l'écho pour Q7. Voir §3.2c. |
| D456 | **Le catalogue des composants arbitré** (cinq familles) : **+ `template`** (PDF, Word — la génération PDF sur cette base) ; **`pages` = une section à header/page(s)/footer, `page` = un saut de page, la section = un regroupement potentiellement nommé** ; **+ `carousel`** ; les graphiques couvrent ; **l'acte à trois déclencheurs** — le bouton, l'icône, **le passage d'étape**. | La description élément par élément s'ouvre ; le wizard s'adossera au passage d'étape (D233). Voir §3.2c. |
| D457 | **Le document dédié `docs/composants.md`** : les fiches du catalogue groupées — « cela préparera la phase de documentation à rédiger ultérieurement » (Q58) ; **le modèle de fiche en neuf rubriques validé** (« la fiche de description me convient ») ; la première fiche : `checkbox`. | Le patron du glossaire (D417) — pointeur en §1 ; le parcours remplira les fiches. |
| D458 | **Les renommages des feuilles** : `text-zone` → **`text`**, `number-zone` → **`number`**, `list-editor` → **`list`** (« suffit ») — et la lecture consignée : **le composant par défaut d'un type porte le nom du type** (D64 devient nominal), les espaces de noms se résolvant par le contexte (`type:` vs `component:`). | Les collisions assumées — le contexte du slot départage ; composants.md à jour. |
| D459 | **Le type-hook doit se représenter** : « un type ajouté via le hook doit inclure une phase de représentation graphique — ou via un document PDF, Word… » — **aucun type sans visage** : le composant d'écran et/ou le rendu de document (`template`, D456). | La ligne D455 (une facette = un hook) — la facette d'affichage d'un type hooké est due ; le contrat au domaine 6. Voir §3.2c. |
| D460 | **`field[<nom>]`** — la forme explicite du nœud-champ dans les `items` (« certains noms de champs sont aussi des composants — pour éviter l'ambiguïté, c'est nécessaire ») ; **la surcharge de représentation au nœud** : le style par état (vide/faux, coché/vrai, le nul), la taille… | La chaîne type → colonne → nœud (D270/D447) s'achève au formulaire ; formes `style:`/`size:` en proposition. Voir §3.2c. |
| D461 | **Un seul vocabulaire de représentation, trois étages** : les propriétés de représentation (`component`, `style`, `size`, `readonly`…) **se portent au type (D64/D359), se surchargent au champ, se surchargent encore au nœud `gui`** — les mêmes mots partout, le plus proche l'emporte. | `field[active]` confirmé (« dans mon esprit ») ; la cascade au vocabulaire unique (l'esprit D360). Voir §3.2c. |
| D462 | **Les colonnes gardent le nom nu** — « l'ambiguïté n'est pas présente : des noms de champs, les opérations sont des verbes » ; **la préconisation** (jamais un contrôle) : une action = un verbe ; **la préséance : le champ l'emporte** sur l'opération homonyme. | « Syncytium n'apporte pas de contrôles » — la préconisation rejoint la documentation du technicien (Q58). Voir §3.2c. |
| D463 | **Le composé `password`** — les garanties structurelles : **l'empreinte jamais le clair** (D33), **write-only** (« défini / non défini » en lecture) ; saisie masquée + double saisie ; **jamais** en liste, recherche, export ni conversion (D369) — l'empreinte seule aux instantanés (D169) ; la force par `validation`. | « La facette décrite me convient. » Catalogue (D361) et composants.md complétés. Voir §3.2c. |
| D464 | **Le raccourci du texte : `shortcut`** (au lieu de `lines`) — trois propriétés : **`lines`** (les lignes visibles), **`icon`** (`next.svg`), **`label`** (par langue — « Voir plus »/« More ») ; absent = le défaut traduit du moteur. | La fiche `text` reprise ; virgule : `label` vs le `labels` du socle — à harmoniser ? |
| D465 | **Le triptyque `label`/`title`/`labels`** : **`label` = les libellés par langue, partout** (remplace `labels`) ; **le visage de l'enregistrement (D397) se renomme `title`** — le gabarit d'affichage, cohérent avec le formulaire (D449/D453), **utilisable sur un formulaire et surchargeable** (la cascade entité → formulaire) ; **`labels` ne survit qu'au dictionnaire du module** (D440). | Renommage appliqué aux trois documents (conception — 43 occurrences, glossaire, composants) ; le socle D364 amendé. Voir §3.2c. |
| D466 | **Le fond gradué** : « un fond gradué d'un champ en fonction de la valeur d'un autre champ dont la valeur est bornée » — la jauge en fond de cellule (`name: { background: avancement }`), deux informations en une. | Les bornes du champ pilote exigées ; **le nom : `background`** (fill/gradient écartés). Voir §3.2c. |
| D467 | **Les couleurs de jauge** : « les couleurs à afficher doivent être spécifiées » — **le dégradé min → max** (`colors: { min: red, max: green }` — **le défaut, du rouge au vert**) **ou la couleur par seuil** (`{ 0: red, 50: orange, 80: green }`). | Vaut pour `gauge`, `fuel` et le fond gradué (D466), aux trois étages (D461) ; fiches complétées. Voir §3.2c. |
| D468 | **Le seuil des radios = la configuration générale** — un paramètre du `settings` (« il est possible de définir 3, 5 ou 10 selon les besoins ») ; la virgule du thème E refermée. | Le pendant du seuil mono/multi-ligne (D366) ; au-delà, le repli en `dropdown` (note en proposition). Voir §3.2c. |
| D469 | **Le `record-picker` enrichi** : **`anchor:`** — l'ancrage de la liste (« centre de l'écran, à droite du champ, à la place du champ ») ; **`dimension:`** — « plein écran, pourcentage en largeur et en hauteur » (la réutilisation de D454). | Défauts au moteur selon l'écran (smartphone plein écran) ; la forme à deux axes (`60% 80%`) en proposition. |
| D470 | **La famille `picker` pointée** : `picker.record`, `picker.image`, `picker.file` (« picker me convient, mais plutôt picker.record… ») — **le point du namespace (D363) gagne les noms de composants** ; `file-drop` renommé ; **la sélection unique ou multiple, déduite du lien** — la référence = unique, la liste et l'association = multiple (le vocabulaire D445). | La porte ouverte aux autres familles (chart.line, chart.bar… — note en proposition) ; l'inventaire et les fiches repris. |
| D471 | **Les trois présentations du picker** : « par une liste, par une liste d'identifiants, ou par une liste d'images » — l'entité représentée par ses **clés fonctionnelles et/ou son champ image** ; **`picker.image` dérive de `picker.record`** (la présentation images fixée, tout hérité). | `by: list` (défaut) \| `identity` en proposition sur picker.record. Voir §3.2c. |
| D472 | **`picker.image` s'efface** (amende D471) : `picker.record` seul, « avec un composant matérialisant la liste de sélection — le nom de la liste, ou le nom du champ représentant une image de l'enregistrement » — **la valeur d'une propriété dit la présentation**. | La simplification (la ligne D420) ; virgule : porter la matérialisation par `selection:` élargi plutôt que `component:` (collision D461) — en proposition. Voir §3.2c. |
| D473 | **La famille `picker` recomposée** : `picker.record` (les enregistrements — D472), `picker.file` (« un ou plusieurs fichiers quelconques » — le défaut de `file`), **`picker.image` (« un ou plusieurs fichiers images, dont la liste des formats est exploitable par Syncytium »** — le défaut d'`image`/`thumbnail`, dérivé de picker.file). | L'ancien picker.image (la référence par l'image) fondu dans picker.record ; le « un ou plusieurs » suit le lien/type (D470) ; la fiche réécrite. Voir §3.2c. |
| D474 | **`selection` = le nombre** (`1`, `1..`, `1..5` — l'écriture des bornes D366, la déduction D470 en défaut) ; **`by` = la présentation** (une liste de la cible, ou son champ-image — « component n'est pas adapté ; by me plaît »). | Solde D472 ; le `selection:` de D215 remplacé par `by:` ; l'harmonisation D445 (`one`/`multiple` → `1`/`1..`) en proposition. Voir §3.2c. |
| D475 | **La famille `viewer`** : « image-viewer et carousel sont un même objet : viewer » — **généralisé aux fichiers visualisables** (PDF, Word, Excel… — « l'image, un type parmi tant d'autres ») ; **`carousel` = le viewer des collections** (liste/association d'images ou vignettes, le défilement à intervalle ou avant/après). | Les fiches réécrites ; `interval: 5s` en proposition (la seconde aux durées D434). Voir §3.2c. |
| D476 | **Les durées complètes** (amende D434) : **`s`, `min`, `h`, `d`, `w`, `m`, `y`** — la seconde et l'année s'ajoutent ; le vocabulaire vaut partout (`every:`, `interval:`, `await[…]`). | `temporal[1y]` possible en note (le `[365]` nu = des jours, D411). Voir §3.2c. |
| D477 | **« Viewer est le composant graphique et carousel un mode d'affichage »** (amende D475) : une seule fiche `viewer` — le mode déduit du contenu (le fichier seul → la vignette, la collection → le carrousel), forçable au crochet. | `viewer[carousel]` en proposition. Voir §3.2c. |
| D478 | **Les trois modes du viewer** : « le crochet est un raccourci pour la définition du mode » (`viewer[carousel]` ≡ `mode: carousel`) ; « le viewer peut afficher **une image, une planche ou un carousel** ». | Le nom anglais de la planche en proposition : `mosaic` (le conteneur `grid` D451 déjà pris). Voir §3.2c. |
| D479 | **La planche dimensionnée** : « besoin de préciser le nombre d'images en colonne et en ligne dans la zone » — `mosaic[4x3]` (colonnes × lignes), absent = l'auto, l'excédent se feuillette. | L'écriture au crochet en proposition (l'écho d'`image[512x512]`). Voir §3.2c. |
| D480 | **`mosaic` et le crochet actés** : « la dimension dans les crochets est une bonne idée (pour un raccourci). Il faut prévoir une propriété quand même » — la grille aussi en clair. | `columns:`/`lines:` en proposition (les mots du vocabulaire D441/D464). Voir §3.2c. |
| D481 | **Le document paginé feuilleté** : « un carrousel d'un document PDF correspond à un défilement des pages. Un PowerPoint suit le même principe » — le carrousel défile une succession : les éléments d'une collection **ou les pages d'un document** ; l'usage : « une présentation ou un mode opératoire ». | La page fait l'image ; `interval:` fait tourner la présentation. Voir §3.2c. |
| D482 | **`sheet:`** — la grille de la planche en une seule propriété : `sheet: 4x3` (colonnes × lignes) ; le crochet `mosaic[4x3]` en est le raccourci (remplace la proposition columns/lines). | Voir §3.2c. |
| D483 | **Le viewer du document généré** : « le fichier de la facture n'existe pas en tant que tel mais comme un PDF généré à partir des informations de la facture et de ses lignes — un viewer peut faire référence à un template de document à générer ». | `template[<nom>]` en items (en proposition, l'écho de `field[<nom>]`) ; combiné à D481, le document généré se feuillette. Voir §3.2c. |
| D484 | **Le couple `size:`/`dimension:`** : « size décrit la dimension à l'affichage et dimension la dimension en extension (suite à un clic) » — size à plat (le socle D461), dimension au déploiement (la visionneuse D293, le picker D469, la surimpression D454). | Voir §3.2c. |
| D485 | **Le fil épouse son contenant** (précise D167/D186) : « il peut prendre une section ou un onglet… ça prend la place qu'on lui laisse » — l'onglet, un habitat parmi d'autres. | Voir §3.2c. |
| D486 | **Un seul `list`** : « le composant graphique list vu avant les types est intimement lié à list ici » — la liste complète (D441–D447) et l'éditeur, un même composant ; `list of <entité>` la déploie, `list of <type simple>` la resserre sur la colonne unique. | Le vocabulaire D441–D447 vaut où il garde son sens. Voir §3.2c. |
| D487 | **Le bloc n'existe pas** : « block n'existe pas en tant que tel — il se décline selon les différents items » ; header/body/footer = des conteneurs du catalogue reconnus par leur nom et leur rôle, au formulaire (D449) comme dans `pages`. | La ligne D455 : tout est composant. Voir §3.2c. |
| D488 | **Le contenu fixe** : « il manque une feuille essentielle : un texte fixe, un paragraphe et/ou une image fixe » — les informations légales, le logo ; deux feuilles sans champ derrière, nourries par la configuration. | Noms en proposition : `paragraph`, `picture` (`text`/`image` pris — D458). Voir §3.2c. |
| D489 | **Le couple `sections`/`section`** : sections organise (colonne ou ligne) et ne contient que des sections ; une section « organise différents nœuds — soit sections, soit une des feuilles » — l'alternance stricte. | `layout: column \| row` + crochet `sections[row]` en proposition ; la section seule = raccourci d'un sections à l'item unique (proposition). Voir §3.2c. |
| D490 | **Les arbitrages du couple** : `layout: column \| row \| grid[2]` (le crochet = les colonnes de la grille) ; « la section seule est un conteneur (header, body ou footer) » — la section nue y vit directement, ailleurs l'organisateur ; « si l'affichage doit changer, screen permet de définir le format attendu » — rien d'automatique. | Voir §3.2c. |
| D491 | **La grille au crochet** (amende D490) : « oublie grid… column[3] — maximum de 3 colonnes, après 3 on crée une ligne… row[2] — 2 lignes, puis ajoute une colonne » — `layout: column[n] \| row[n]`, le conteneur `grid` retiré du catalogue. | Le mot nomme l'unité, le crochet la compte, le flux replie. Voir §3.2c. |
| D492 | **La liste en widgets** : « elle peut se présenter sous forme d'une liste de widgets — la propriété `widget: <nom du widget>` de l'entité de l'élément » — le tableau (`columns:`) ou les widgets, la mécanique de la liste demeurant. | `widget:`/`columns:` exclusifs — validé. Voir §3.2c. |
| D493 | **`title:` au titre de la section** : « le nom d'un regroupement est un libellé en titre de la section — au lieu de label, j'utilise title » — title = ce qui titre (l'entité D465, le formulaire D449, la section) ; label demeure ailleurs. | Les exemples balayés (label → title sous section). Voir §3.2c. |
| D494 | **La jauge aux trois valeurs** (précise D241) : « min, value et max — min et max peuvent être fixes comme dépendre de valeurs. La jauge porte ces 3 valeurs en une » ; les bornes du type (D276) en défaut. | Chacune fixe ou formule/champ (la ligne D241). Voir §3.2c. |
| D495 | **Les seuils depuis une entité** : les couleurs de jauge (D467) peuvent « dépendre d'une entité en expliquant les liaisons entre les colonnes et les valeurs (seuil et couleur) » — la table de référence, l'écho de `units:` (D363). | Écriture en proposition (`from`/`threshold`/`color`) ; vaut pour gauge, fuel, le fond gradué. Voir §3.2c. |
| D496 | **Le type `color` et `picker.color`** : « le stockage est un entier, l'affichage en hexadécimal et une base traduisant les couleurs en RGB » — la pastille en lecture, le sélecteur en saisie (D458) ; « j'ajoute aussi picker.color » — la famille pointée s'agrandit (D470/D473). | La base nomme les couleurs de `colors:` (D467) ; `values:` restreignant la palette en proposition. Voir §3.2c. |
| D497 | **Le type `range`** : « un stockage de 2 valeurs dont l'une est égale ou plus petite que l'autre » — la plage de dates ou de valeurs, la contrainte intégrée ; ni la recherche (D371) ni `period` (D391) ne couvraient le générique. | `range of <type>` en proposition (l'écho de `list of` D362) ; le double curseur pour les bornés. Voir §3.2c. |
| D498 | **`range of` validé** — « déclinaison de list of avec 2 contraintes en nombre et en ordre » ; min et/ou max indéfinissables (la plage ouverte) ; les libellés sur trois éléments (min, value, max) ; **« la jauge étant un cas particulier d'un range »** (relit D494). Les liaisons D495 validées. | Voir §3.2c. |
| D499 | **Les cellules confirmées** : `duration` compatible `calculator` « sur la base de 2 clocks » ; `datetime` = la combinaison `calendar` + `clock` ; `uuid` « à saisir et en lecture sous forme de texte formaté » — les fonctions multiples, dont les id tiers (relit D419). | La synthèse mise à jour. Voir §3.2c. |
| D500 | **Le dropdown de la référence et du statut** : « reference : utilisation d'un dropdown possible » ; « le statut peut être un dropdown aussi, avec une liste de valeurs en tenant compte du cycle de vie » — les états atteignables seuls (D425–D427). | La synthèse n'a plus de cellule à confirmer. Voir §3.2c. |
| D501 | **`width`/`height` sur la section** : « layout fournit le découpage en colonnes et en lignes ; width et height permettent de calibrer la taille des sections. Sans précision, l'ensemble de l'espace est pris. » | Le calibrage au sein de l'organisateur. Voir §3.2c. |
| D502 | **Les deux étages du calibrage** (précise D501) : width/height « au même niveau que layout pour que chaque section ait la même dimension » — et « également définissables sur la section » pour la taille variable ; le plus proche l'emporte (D461). | Voir §3.2c. |
| D503 | **`size:` sur `sections`** : « les dimensions de l'espace occupé par l'ensemble » — au débordement, les barres de scrolling « visibles ou évaporeux », le swipe au tactile, les barres indiquant le positionnement. | La cohérence D484 (size = à l'affichage). Voir §3.2c. |
| D504 | **Les modes de `tabs`** : la barre en haut (Windows, défaut), en bas (Excel), latérale (gauche/droite) — et **le mode wizard** : « voir toutes les étapes mais ne pas prendre d'avance tant que l'onglet précédent n'a pas été exploré ». | `mode: top \| bottom \| left \| right \| wizard` + crochet `tabs[…]` en proposition (D478) ; l'écho du cliquet D354. Voir §3.2c. |
| D505 | **Le chemin de traitement** (complète D504) : « en wizard, les tabs parcourus décrivent le chemin de traitement — en cliquant sur une phase, nous revenons sur un onglet » — le retour libre sur l'exploré, l'avance gardée. | Voir §3.2c. |
| D506 | **La dimension unique des volets** : « pour chaque tab, toujours la même dimension — les zones sont centrées si elles représentent un espace plus petit » — aucun calibrage par volet (le contraste avec D502), le contenu plus petit centré. | Voir §3.2c. |
| D507 | **La géométrie de `pages`** : « pages prend toute la place, pas de dimension ; le header et le footer sont optionnels — s'ils sont définis, ils sont toujours visibles ; la hauteur du footer et du header sont paramétrables ; la page prend toujours le reste ». | Aucun size: (contraste D503) ; height: sur header/footer. Voir §3.2c. |
| D508 | **La navigation des pages = celle des tabs** : « les pages ont un numéro (par défaut), nous pouvons lui affecter un nom et/ou un icône comme un tab — l'affichage suit la même logique que tabs » (les modes D504, le chemin D505, le swipe). | Voir §3.2c. |
| D509 | **Le formulaire est un `pages` implicite, `body` disparaît** (amende D449/D455/D490) : « pages est le premier composant d'un formulaire sans avoir besoin de le déclarer ; header et footer sont déjà décrits ; body est à remplacer par page » — et « pas besoin de composants complémentaires » : les conteneurs sont au complet. | La clé `page:` remplace `body:` (30 occurrences balayées) ; le multi-pages à préciser. Voir §3.2c. |
| D510 | **Le multi-pages en liste** : « le multi-pages se fait à l'aide d'une liste d'éléments — default: [ { header: … }, { page: … }, { page: … }, { footer: … } ] » — les clés pour l'usuel, la liste dès que les pages se répètent. | Solde la virgule D509. Voir §3.2c. |
| D511 | **L'acte et les deux modes** : « operation[<nom>] pour être en phase avec les fields » ; « une opération doit avoir 2 modes — la pré-exécution identifie les modifications à apporter (les factures à créer ; l'import : ajoutées/modifiées/non modifiées/supprimées) » ; le message de confirmation au gabarit nourri de la pré-exécution. | Généralise D234 et l'exécution à blanc ; `validate: { message: }` en proposition (étend D431). Voir §3.2c. |
| D512 | **La famille `chart.*`** actée (l'écho des pickers, la note D470) : `chart.line`, `chart.bars`, `chart.pie`, `chart.combo` — et « j'ajouterais également **le nuage de points** » : `chart.scatter` ; `kpi` et `pivot` à part, la jauge restant la feuille `gauge`. | Le hook étend (`chart.radar`…) — D239. Voir §3.2c. |
| D513 | **La carte des collections** : « le composant doit pouvoir s'adapter pour une coordonnée ou une liste de coordonnées dont des lignes sont possibles ou pas » — les marqueurs multiples, le tracé dans l'ordre de la collection. | Rien n'était consigné (vérifié) ; `lines: true \| false` en proposition (défaut false). Voir §3.2c. |
| D514 | **La frontière de la route** (complète D513) : les lieux d'un produit (sans relier) / le parcours d'un commercial (relié) ; le socle relie au trait droit — **« le tracé de la route, je préfère le laisser aux hooks »** (les abonnements aux outils annexes). | Le patron du géocodage D294 — candidats open source auto-hébergeables : OSRM, Valhalla (Q7). Voir §3.2c. |
| D515 | **Les réglages d'affichage du graphique** : « paramétrer les échelles, les début et fin d'axe et quelques éléments d'affichage (vignettes, couleurs, dégradé…) ». | En proposition : la forme riche des axes `{ value:, min:, max:, scale: }` (l'écho D494), `colors:` (D467, le dégradé), `points:` (les vignettes — le visage au nuage D386). Voir §3.2c. |
| D516 | **`labels:` et les valeurs du calcul** (amende D515) : « labels: true affiche la valeur dans le format du champ, le gabarit pour personnaliser » ; « en cliquant sur une vignette, voir toutes les valeurs utilisées pour le calcul (si le calcul dépend d'une liste ou d'une association) ». | La collision avec le dictionnaire D440 notée (le contexte départage — D458). Voir §3.2c. |
| D517 | **L'assise du graphique** : « un chart doit s'appuyer sur une entité ou une liste (composant déjà vu) ; les axes font référence aux champs » — l'entité ou la liste nommée (le périmètre hérité), les axes sur ses champs. | `on:` à l'adresse D439 en proposition (`sales.order[invoiced]`). Voir §3.2c. |
| D518 | **Le défaut de l'assise** (complète D517) : « si on: est absent, l'assise porte sur l'entité elle-même » — l'entité porteuse ; on: pour désigner ailleurs. | Voir §3.2c. |
| D519 | **Les secteurs arbitrés** : `mode: pie \| donut \| quarter` ; les variables du gabarit `{value}`/`{percent}`/`{total}` (« {percent} % ({value} / {total}) ») ; le clic sur une part → la liste de ses éléments ; « autres » acté — **son drill affiche une barre de répartition** pour préciser la valeur à filtrer. | Le drill à deux étages. Voir §3.2c. |
| D520 | **L'épaisseur et les angles** (complète D519) : « sur donut, l'épaisseur ; sur quarter, l'angle de départ, de fin et l'épaisseur — représenter l'assemblée nationale de la gauche vers la droite ». | `thickness:` et les angles aux bornes (`quarter[-90..90]`) en proposition ; l'hémicycle fondateur. Voir §3.2c. |
| D521 | **Le graphique, le tableau, ou les deux** (au socle des charts) : « les charts doivent se présenter soit en graphique, soit sous forme d'un tableau — pour avoir une vue sur les différentes valeurs directement — ou les deux ». | L'écho des tableaux de valeurs D244 ; `display: graph \| table \| both` en proposition (défaut graph). Voir §3.2c. |
| D522 | **Le nuage de points** : un point par enregistrement (le visage D386) ; « les axes se déclinent via des seuils qui ne se chevauchent pas » — la concentration/dispersion, **et la catégorisation** : « un MoSCoW en s'appuyant sur 2 critères, les gains/bénéfices de l'effort ». | `thresholds:` à l'axe riche + `zones:` (title/color, les bornes D366) en proposition ; le clic sur une zone → la liste. Voir §3.2c. |
| D523 | **La matrice adressée** (simplifie D522) : « l'axe définit min, max et threshold ; les zones définissent les positions dans la matrice créée — plutôt que x et y, `zone: [1,1]` » — plus aucune borne répétée. | Convention `[colonne, ligne]` depuis l'origine (bas-gauche) en proposition. Voir §3.2c. |
| D524 | **L'orientation du combiné** : « axis: left \| right, ou bottom \| up, pour une représentation en ligne contre une représentation en colonne » — la paire d'axes dit l'orientation, homogène par construction. | La virgule « up »/« top » (D504) signalée. Voir §3.2c. |
| D525 | **`top` harmonisé** (amende D524) : « j'harmonise en effet avec top » — `axis: bottom \| top`, le vocabulaire unique des bords avec les tabs (D504). | Voir §3.2c. |
| D526 | **L'icône aux seuils** : « je souhaite aussi pouvoir associer éventuellement une icône — cas d'un feu tricolore » — les seuils portent la couleur (D467) et/ou l'icône. | `icons:` en proposition (la mécanique D467 dupliquée ; la collision avec la feuille notée — D458) ; la liaison `icon:` à la table D495. Voir §3.2c. |
| D527 | **L'organisation du kpi** : « mis en valeur avec un style différent de la feuille » ; « l'organisation se découpe en 4 » — la position du label (haut/gauche/bas/droite), l'icône au bord opposé. | `layout: top \| left \| bottom \| right` en proposition (défaut top ; la collision avec D490 notée). Voir §3.2c. |
| D528 | **Le tri du croisé sur la valeur** : « visualiser les plus gros CA » — les lignes par la valeur agrégée, chaque niveau du groupement par son sous-total ; le défaut = l'ordre naturel du champ. | `sort: -value` en proposition (le signe D441). Voir §3.2c. |
| D529 | **Le tri aux trois clés** (élargit D528) : « le tri peut s'appuyer sur les rows, les columns ou la value » — les signes et cascades D441 (`sort: { seller: -value, date: + }`). | Voir §3.2c. |
| D530 | **Les appels du geste et les exports** : « add, update or delete pour préciser le formulaire/widget à appeler » (les défauts : le formulaire par défaut D438, les gestes D446) ; « exports: permet de préciser les différents exports ou générations de documents ». | `exports: [ csv, excel[modèle], template[gabarit] ]` en proposition. Voir §3.2c. |
| D531 | **Les actions et l'anatomie de la liste** : `actions:` (l'opération porte son icône, surchargeable) ; « une liste est comme pages » — le header (titre, colonnes, filtres, l'icône-menu des exports, les icônes add/update/delete + actions à icône), la zone page (le tableau), le footer (le sous-total ou un gabarit, les boutons des actions sans icône). | L'icône trie : header ; sans icône : bouton du pied. `{count}` au gabarit en proposition. Voir §3.2c. |
| D532 | **`size:` et `screen:` sur la liste** : « comme la form — size pour marquer la zone de couverture de l'écran, screen pour indiquer sur quel support la liste a été définie et/ou autorisée à s'afficher ». | La cohérence D484/D503 et D450. Voir §3.2c. |
| D533 | **La grammaire de `size:`** : « 75% → 75 % de l'écran avec centrage ; 90% 50% → la longueur et la hauteur ; ou 1000px 320px en pixels » — une valeur centrée, deux valeurs largeur puis hauteur, % ou px. | Vaut partout où size s'écrit (D484). Voir §3.2c. |
| D534 | **La confusion levée** (clarifie D532) : « j'ai introduit une confusion entre dimension et size » — la doctrine D484 départage : le formulaire s'ouvre à l'appel → `dimension:` (D454) ; la liste s'affiche → `size:` ; la grammaire D533 vaut pour les deux. | Voir §3.2c. |
| D535 | **`size` aux surfaces, la pile des surimpressions** (amende D454/D534) : « size me convient mieux pour les 2 usages — un form ou une liste apparaissent en surimpression par rapport aux actions antécédentes cumulées » — toute surface s'ouvre au-dessus de la pile ; le couple D484 demeure au grain du champ. | Le dimension: du formulaire (D454) devient size:. Voir §3.2c. |
| D536 | **La propriété `style:` définie** : « par défaut, le style global de l'application ; prévoyons une propriété style qui regroupe la fonte, la taille et sa mise en forme » — le thème d'instance en défaut, la surcharge à la cascade D461. | `style: { font:, size:, format: [bold…] }` en proposition (le size intérieur = la police — D458 départage). Voir §3.2c. |
| D537 | **Le résumé précisé** : « le 1-1 affiche le title **ou l'image** si elle est définie » (le visage D386) ; petit par principe confirmé ; « plusieurs sections (pour mêler des affichages horizontaux et verticaux) — pas plusieurs pages, ni plusieurs tabs ». | L'organisateur D489–D491 dans le résumé ; D201 confirmé. Voir §3.2c. |
| D538 | **Le graphique au résumé** : « un summary peut contenir un kpi ou un chart — à condition que son affichage reste modeste » (D243 réutilisable, la modestie D201). | `chart[<nom>]` en items en proposition (la famille des adresses D460/D483/D511). Voir §3.2c. |
| D539 | **La troisième assise du chart** (élargit D517) : « elle s'appuie sur une entité ou un champ de type list of ou association with » — le champ-collection : le graphique des éléments liés à l'enregistrement du contexte. | `on: <champ>` en proposition. Voir §3.2c. |
| D540 | **Le chart, feuille du formulaire** : « un form peut donc avoir un composant chart comme feuille — nous le faisons entrer de fait dans summary » — `chart[<nom>]` en item du form, le résumé l'héritant (la modestie D538). | Confirme D243/D538. Voir §3.2c. |
| D541 | **La tendance du kpi** (note pour plus tard) : « en exploitant l'historique d'une entité, nous pourrions présenter la tendance » — la valeur rejouée aux instants passés (D411/D172) ; le détail différé. | La frontière avec D245 à confirmer au moment venu. Voir §3.2c. |
| D542 | **`qrcode` et `barcode` fichés** (répare un manque) : décidés (D252/D300 — les composants de sortie) mais absents de l'inventaire des fiches — les deux feuilles jumelles ajoutées, la fiche commune. | `barcode[ean13\|code128…]` au crochet en proposition (défaut code128) ; le scan hors D300. Voir §3.2c. |
| D543 | **Le `size` des jumeaux** : le qrcode — « la taille unique pour les côtés » (`size: 120px`, le carré) ; le code-barres — « largeur × hauteur » (la grammaire D533). | Voir §3.2c. |
| D544 | **Les deux modes du champ encodé** (précise D300/D543) : « la saisie en mode texte et l'affichage en mode graphique — la saisie peut nécessiter une size différente de l'affichage ». | `size: { input:, display: }` en proposition (la forme courte = l'affichage seul). Voir §3.2c. |
| D545 | **La valeur sous les barres** : « l'affichage du code-barres peut nécessiter l'affichage de la valeur de la référence sous le code-barres » — l'humain sous la machine. | `labels: true` en proposition (l'écho D516, défaut false). Voir §3.2c. |
| D546 | **Le wizard précisé** : steps/step = « un habillage de tabs[wizard] où chaque step est un tab » ; « un step peut contenir une opération sur la validation » ; les opérations de base de toute entité (create/read/update/delete, enrichies) ; la démarche guidée — créer, modifier/supprimer un ensemble d'une liste, **imprimer les menus**, mettre à jour une tournée. | `operation: <nom>` au step en proposition. Voir §3.2c. |
| D547 | **La chaîne de pré-exécutions** (amende D546) : « le mode draft s'efface… les steps avec une opération sont pré-exécutés ; la transformation n'aura lieu qu'à la validation définitive du wizard » ; « avec un message de confirmation, si l'utilisateur valide, il ne pourra pas revenir en arrière » — le cliquet sur le chemin D505. | `draft:` retiré ; la transaction finale D232/D101 exécute tout. Voir §3.2c. |
| D548 | **L'anatomie du wizard** : « un header et un footer ; le fil d'Ariane en bas ou en haut de la zone ; une dimension (size) surchargeable si le wizard s'inclut dans un formulaire ». | `mode: top \| bottom` en proposition (D525) ; l'écho pages D507 ; le plus proche l'emporte (D461). Voir §3.2c. |
| D549 | **Les arbitrages du wizard** (amende D548) : « size est optionnel — sans valeur, l'espace disponible ; depuis un menu, tout l'écran » ; « plutôt que mode, je préfère **breadcrumb: none \| top \| bottom** ». | Défaut top (l'esprit D504) ; none masque le fil. Voir §3.2c. |
| D550 | **L'aide à la décision au parcours** : « nous pouvons inclure des charts, des kpi ou des pivots pour apporter une aide à la décision » — les graphiques aux steps (`chart[<nom>]` — D540). | Voir §3.2c. |
| D551 | **Un seul wizard** : « tout ce que nous venons de voir avec wizard doit être également porté par tabs[wizard]… car cela doit être le même objet » — la surface et le conteneur, un même composant (l'écho D486) ; seule change la porte d'entrée. | Les fiches wizard et tabs liées. Voir §3.2c. |
| D552 | **La séparation tabs/wizard** (amende D504, rend D551 caduque) : « je valide la séparation — ça confirme mon ressenti » — le mode wizard quitte tabs (restent top/bottom/left/right), le wizard garde steps/step et sa mécanique, le chemin D505 à lui seul ; deux objets, une parenté visuelle. | La transactionnalité n'est pas un habillage ; if:/operation: orphelines sur un tab libre ; le mot fait la chose. Voir §3.2c. |
| D553 | **Le contexte empilé de l'opération** : « le contexte ne représente pas seulement les informations de l'appel en cours mais l'ensemble des contextes qui se sont empilés jusqu'à l'usage de l'opération » — la pile des contextes, le pendant de D535 ; « l'origine de l'appel » (D455) = la pile entière. | Voir §3.2c. |
| D554 | **Le dashboard aux deux auteurs** (unifie D204/D247) : « le dashboard est à la charge du technicien — un panel accessible depuis un menu ou une page d'accueil ; le pool est un dashboard personnalisable à l'utilisateur en piochant dans les widgets disponibles » — le même objet, deux auteurs. | La vérification : D204/D247 confirment. Voir §3.2c. |
| D555 | **Le squelette de dashboard** (précise D554) : « le technicien décrit un ou plusieurs squelettes — avec des widgets contraints et des widgets libres » ; l'accueil composé = le squelette entièrement libre. | L'item `free` (répétable) en proposition. Voir §3.2c. |
| D556 | **L'emplacement `_` et l'icône du choix** (amende D555) : « un widget interchangeable doit faire apparaître un icône qui permette de choisir un widget disponible selon son propre catalogue ou par sa libération » ; « "_" me parle plus que "free" — free pouvant être lui-même un nom de widget ». | L'item `_` acté ; la collision évitée par construction. Voir §3.2c. |
| D557 | **L'accueil au module actif** : « une page d'accueil fait référence à un dashboard selon le module activé » — le module actif fournit son tableau de bord. | Complète D554–D556. Voir §3.2c. |
| D558 | **La homepage aux trois pointes** (amende D557) : « la limiter à un dashboard m'embête — la homepage doit pouvoir pointer une liste, un dashboard ou une page vide ». | La lettre de D204 retrouvée ; la composition aux emplacements `_` (D555–D556). Voir §3.2c. |
| D559 | **Le template précisé** : `margin:` en mm ; « le paragraph peut être un gabarit — le cas d'une lettre » (le publipostage, l'étoffement Q55) ; « la déclinaison par langue se porte sur chaque item » (amende la lecture de D253 — un seul gabarit, les items déclinés). | Voir §3.2c. |
| D560 | **Le publipostage étoffé** : « paragraph doit être étoffé pour disposer d'un mode publipostage riche et facile à intégrer » — les cinq briques en proposition : les variables au format de la langue (les chemins D71), l'`if:` conditionnel, `style:`/les titres, la source (en place ou dictionnaire D440), le multi-alinéas. | À arbitrer. Voir §3.2c. |
| D561 | **La sixième brique** (complète D560) : « l'affichage d'une liste sous forme de bullet points ou d'indices » — la collection dans la lettre. | `{overdue[bullets]}` / `{overdue[numbers]}` en proposition (le crochet ; le `title` D465 par élément). Voir §3.2c. |
| D562 | **Mustache + markdown au paragraph** (remplace les écritures D560–D561) : « la combinaison doit couvrir les différents cas ; des limites portant sur les composants (pas de liste, pas d'image…) » — mustache (variables, chemins, sections-itérations), markdown (titres, gras, puces, tableaux) ; `![…]` exclu, l'`if:` d'expression demeure (D90), le champ texte utilisateur reste nu (D261). | Deux standards, zéro syntaxe maison. Voir §3.2c. |
| D563 | **Le comportement d'`url`** (les cinq points validés) : le lien en lecture — le clic ouvre dans un nouvel onglet, l'icône du lien externe en post-zone (D271/D391) ; l'icône demeure en saisie ; l'ellipse en cellule ; le lien actif au template, la valeur nue en Excel/CSV ; l'aperçu de la cible = un hook (D263). | La synthèse complétée (la ligne url séparée). Voir §3.2c. |
| D564 | **Les quatre destinations du template** : « générer un document Word, PDF, Excel ou un mail — le template porte une propriété `format` qui précise le format de destination ». | `format: pdf \| word \| excel \| mail` (défaut pdf en proposition) ; le mail = le publipostage D562, l'Excel = le modèle D445. Voir §3.2c. |
| D565 | **Le défaut et l'extension** (solde D564) : « le format pourra être étendu à d'autres formats en fonction des besoins à venir. PDF en défaut me convient. » | La ligne des hooks (D408). Voir §3.2c. |
| D566 | **La signature formelle du nœud** (clôt le point) : l'adresse universelle `<type>[<nom>]` (render/field/operation/template/chart/widget) ; `visible:` conditionnel — faux = ni déclaré ni construit ; les propriétés et les états **évalués à la sollicitation** ; les enfants au champ déclaré par le type, **évalués de la feuille à la racine avant construction** ; la pile de contexte depuis la racine ; le hook = l'objet du composant et de son rendu multi-formats. | La section en tête de composants.md. Voir §3.2c. |
| D567 | **Les deux amendements de la signature** (amende D566) : les enfants « dans un ou plusieurs noms — header, page, footer ; chaque élément est facultatif » ; `visible:` **vivant** — « en fonction de la valeur d'un champ ou d'un contexte, un élément peut devenir visible ou masqué (le toggle de la saisie conditionnelle) » — le « ni déclaré ni construit » effacé. | L'écho du recalcul D255. Voir §3.2c. |
| D568 | **La section repliable** : « refermer ou ouvrir si le composant a la propriété `dropdown: true`, avec un icône pour matérialiser l'affichage ou pas ». | La collision avec la feuille notée (D458) ; le défaut déplié en proposition. Voir §3.2c. |
| D569 | **Les quatre valeurs du repli** (solde D568) : `dropdown: false` (défaut — fixe) `\| true` (repliable, ouverte par défaut) `\| opened \| closed` (l'état d'entrée explicite). | L'orthographe `opened` consignée. Voir §3.2c. |
| D570 | **L'opération définie** (Q60 s'ouvre) : les cinq portées (l'enregistrement, la liste, la sélection, le module, l'application) ; « ne se construit pas dans la configuration — toujours à l'aide d'un hook de code » (signature + code) ; **les hooks de base : create, read, update, delete, promote, demote, generate, download, print, export, import** ; les issues (l'écran, le téléchargement, l'impression, le message, rien) ; peut appeler une fonction. | Voir §3.2c. |
| D571 | **La fonction définie** : les champs calculés ; retourne une valeur ou une liste de valeurs, aux types du modèle ; déclenchable au paramètre modifié ; **le graphe d'exécution** pour l'ordre cohérent ; un hook de code ; **« ne déclenche aucune opération »** — la pureté. | L'appel ne va que dans un sens. Voir §3.2c. |
| D572 | **Les signatures distinctes, la librairie d'exploration** : les deux signatures à finaliser en Q60 (celle des fonctions abordée au domaine 2) ; « le hook de code nécessitera une librairie qui explore le modèle de données de façon transparente ». | Voir §3.2c. |
| D573 | **Les paramètres dynamiques** : « la valeur initiale définie dans la configuration, modifiable par le technicien via le module d'administration » — la troisième temporalité (le statique, le dynamique, la donnée). | Les paramètres généraux (D366/D468/D259) ont vocation à rejoindre la famille. Voir §3.2c. |
| D574 | **Les dix-sept opérations de socle** (complète D570) : les 11 + `duplicate`/`restore`/`report`/`send` (les candidats acceptés) + **`notify`** (« générer une information de notification aux utilisateurs ») + **`refresh`** (« déclencher un recalcul d'un graphique ou d'un champ calculé »). | « Au final, cela nous fournit 17 opérations de socle. » Voir §3.2c. |
| D575 | **Les fonctions — les quatre arbitrages** : `sum` remplace « somme » + les sommes pondérées + « les calculs matriciels basés sur les sommes et les produits » ; `min`/`max` **universels** (tous les types sont triables) ; les agrégats couvrent **les listes ou les associations** ; la famille du **contexte courant** à décrire (l'utilisateur, la localisation, la date/heure, l'instance, l'application, le module, l'entité, le champ, les propriétés de configuration — le pont D254/D573). | Voir §3.2c. |
| D576 | **Les agrégats-collections fusionnés** : « les points 1 et 6 sont regroupés » ; `first`, `last`, `any`, `exists` complètent ; min/max au double régime — l'agrégat **ou** la liste de valeurs (`max(0, sum(stock.quantity))`). | Voir §3.2c. |
| D577 | **Les opérateurs numériques** : `+` `-` `*` `/` (réelle) `\` (entière) `%` (modulo) `!` (factoriel) `**` (puissance) — « pour simplifier l'écriture » ; `exp`, `sin`, `cos`, `tan`… en fonctions. | Voir §3.2c. |
| D578 | **Le texte** : la concaténation **via le gabarit** (D562), l'extraction via les regex, les extractions de chaîne, les règles de conversion (D579). | Voir §3.2c. |
| D579 | **Les fonctions de type — l'iceberg** : « un type emmène avec lui des fonctions dédiées » (`distance`/`euclide` pour la géolocalisation) ; **la conversion = une fonction au nom du type** (`text(x)`, `date(x)`…) — « la signature d'un type doit porter en elle la conversion intrinsèque » (D369 en cas particulier). | L'écho D408/D458 — le type emmène composant et fonctions. Voir §3.2c. |
| D580 | **Les agrégats portés par la collection** (pousse D579) : « sum(commandes.montant) devient `commandes.sum(montant)` » — l'élément en contexte implicite dans la parenthèse (le filtre sans alias, la pondérée lisible), min/max aux deux formes, `count()` nu, la forme contextuelle à l'assise (D517). | Voir §3.2c. |
| D581 | **Les opérateurs, le parenthésage, le typage** : la table d'opérateurs à la signature du type (`date - date` → duration, `date + date` → erreur) ; la précédence fixée ; **le typage statique à l'ingestion** — l'inférence de la feuille à la racine, la promotion sans perte, la conversion explicite (D579). | Jamais d'erreur de type à l'exécution (D330/D344). Voir §3.2c. |
| D582 | **Les comparateurs, des fonctions** : « naturellement » — `=` `!=` `<` `<=` `>` `>=` `in`, des fonctions de type au résultat boolean ; l'ordre des règles de tri (D368+), l'égalité de l'équivalence. | Le catalogue central vidé dans les types — restent le contexte courant, les libres, le gabarit. Voir §3.2c. |
| D583 | **`iif` et `select`** (complète D582) : « dans les comparateurs, j'intègre iif et select » — `iif(condition, alors, sinon)` ; `select` multi-branches (l'écriture en proposition — le dernier sans clé fait le défaut) ; toutes les branches d'un même type (D581). | Voir §3.2c. |
| D584 | **`select`, une fonction du type** (amende D583) : `state.select(draft: "En cours", …, "...": "autres")` — la valeur porte son select, la clé `"..."` fait le défaut. | La doctrine D579/D580 au conditionnel. Voir §3.2c. |
| D585 | **Le type `label`** : l'accès au catalogue des labels (D440), « un label peut couvrir un gabarit paramétrable », les gabarits nommés réutilisables — `label(mon_nom, { prenom: …, nom: … })`, l'ordre des mots par langue. | La langue dans les expressions — `state.select(draft: label(…))`. Voir §3.2c. |
| D586 | **L'enregistrement en paramètre du label** (complète D585) : « le nom des champs devient les paramètres » — `label(mon_nom, customer)`, les champs nourrissent le gabarit sans les épeler. | L'écho D465/D562 — un seul mécanisme de gabarit. Voir §3.2c. |
| D587 | **Le catalogue des fonctions libres** : « min, max, sum, avg… sont à inclure. Le catalogue s'enrichira, si besoin » — les variadiques scalaires doublant les méthodes de collection (D580), l'extension par les besoins (D408/D565). | Voir §3.2c. |
| D588 | **`context.settings` et les deux modes** (précise D573) : `<nom>` référence un élément statique ou dynamique — `{ mode: dynamic \| static, value: <défaut> }` ; « les paramètres dynamiques portent une valeur par défaut surchargeable via le module d'administration ». | La cascade D349/D360 ; le typage D581 vaut. Voir §3.2c. |
| D589 | **Le type du paramètre, `context` acté** : « un paramètre porte aussi type: (par défaut : text) » ; « le nom context me convient — si une entité se nomme context, l'entité prend le pas ; lors de l'ingestion, un warning sera nécessaire » ; l'inventaire des champs consigné (user traversable, location, now, instance/application/module, entity/field, file/page/pages, settings). | La préséance à l'entité + le warning (l'esprit D344). Voir §3.2c. |
| D590 | **L'abréviation du paramètre** : « marge: 10% — l'abréviation (mode: static et type: text) » — la forme courte aux défauts. | Voir §3.2c. |
| D591 | **La cascade des settings** (complète D588) : « les settings dans le module ou l'entité viennent compléter ou surcharger la valeur des settings définis dans l'application » — les trois étages, le plus proche l'emporte (D360/D461). | `context.settings.<nom>` résout au plus proche. Voir §3.2c. |
| D592 | **Le graphe d'exécution acyclique** (contraint D571) : « ils doivent être acycliques » — le cycle de calcul = une erreur d'ingestion (D330/D344), le contrôle statique. | La ligne des graphes acycliques (D455, les groupes). Voir §3.2c. |
| D593 | **Les valeurs nommées de la fonction** (précise D571) : « une valeur (par défaut) — ou plusieurs valeurs nommées : le cas d'une regex à groupes nommés affectés à plusieurs champs » — `result: <type>` ou `result: { nom: type, … }`, l'appel unique au graphe. | L'affectation au point en proposition (`extract_name(raw).prenom`). Voir §3.2c. |
| D594 | **La transaction tenue ouverte** (simplifie D511/D547) : « pas 2 modes — une opération ajoute des éléments dans une transaction ; le preview exécute et attend la validation ; valider = la transaction validée, annuler/stopper = annulée ». | Le chiffrage = le contenu de la transaction active ; le wizard = une transaction au fil des steps (D101) ; le mode disparaît de la signature. Voir §3.2c. |
| D595 | **Les quatre fonctions du hook d'opération** (précise D594) : `execute` (remplit la transaction), `confirm` (la relecture), `commit` (scelle, l'après-coup), `rollback` (défait) ; « une opération peut se valider ou s'annuler automatiquement selon les paramètres de l'appel ». | L'objet du hook (D566.7) ; l'écho D428/D431. Voir §3.2c. |
| D596 | **`commit: auto \| confirm`** (renomme D431) : « plutôt que validate, je préfère commit » — confirm le défaut (la relecture), auto la validation automatique ; le mot aligné sur la fonction du hook (D595). | La forme riche `commit: { mode:, message: }` en proposition (D511) ; les fiches balayées. Voir §3.2c. |
| D597 | **L'issue au commit, le message-label** : « le commit d'une opération retourne l'issue — Syncytium lira la valeur retournée [et] déclenchera l'action qu'elle contient » ; « le message du commit est un label » (D585 — le catalogue D440, le gabarit nourri de la transaction D586/D594). | Le hook rend une valeur, le moteur déclenche. Voir §3.2c. |
| D598 | **Les valeurs nommées de l'opération** (précise D597) : « les noms du label sont portés par l'opération — nb_creations, nb_updates, nb_deletes… utilisées par le message de confirmation » — les comptes de la transaction nommés (D594) + les résultats d'execute (D511), en paramètres du gabarit (D585–D586). | Voir §3.2c. |
| D599 | **L'inviolabilité de la librairie** (clôt les signatures — **et Q60**) : « la librairie mise en place assure l'inviolabilité des règles et des droits » — le hook citoyen du moteur : droits (D196), confidentialité, validation (D307), concurrence (D111) jamais contournables. | Le catalogue des fonctions est complet (D570–D599). Voir §3.2c. |
| D600 | **Le confirm au formulaire** (enrichit D595/D597) : « le rendre plus riche avec un formulaire et des champs alimentés par l'exécution — la création simplifiée validée en consultant l'enregistrement en lecture seule et/ou en modification » — les éditions rejoignent la transaction avant le scellé (D594). | `commit: { mode: confirm, form: <nom>, message: }` en proposition. Voir §3.2c. |
| D601 | **La boîte seule** (précise D600) : « si form: est absent et si message: est précisé, seule une boîte de dialogue de validation sera affichée » — le léger et le riche. | Voir §3.2c. |
| D602 | **Les huit domaines de Q16 consignés** (répare un manque) : 1. l'organisation et l'arborescence · 2. la donnée, sa structure et les droits · 3. le méta-schéma · 4. les surfaces · 5. les cas d'usage · 6. la documentation · 7. l'architecture technique · 8. l'implémentation. Le recoupement : 1–4 livrés (3 = règles/comportement + Q60) ; 5=Q59, 6=Q58, 7=Q7/Q47, 8=D314 ; les renvois « domaine 6 » de D408/D452/D459 relus (couverts par Q60, le reliquat au domaine 7). | Voir §3.2c. |
| D603 | **Les connecteurs — les cinq arbitrages** : `connectors.yml` à la racine, **global** (aucune déclinaison) ; le catalogue de base + le hook de connecteur ; les paramètres = les propriétés, **pas de contexte** (le démarrage du projet) ; **les secrets = la référence à une variable d'environnement**, chiffrable à la clé dérivée (environnement + machine) ; `every:` à la grammaire D434. | Le dépôt versionné (D336) sans secret en clair. Voir §3.2c. |
| D604 | **Le catalogue de base des connecteurs** (complète D603) : les bases de données standard (SQLServer, MySQL, Postgre…), l'AD Azure, les fichiers (CSV, JSON…) — + le géocodage (D294), l'itinéraire (D514), le smtp (D564), la reprise (D175) ; `every:` « pour rafraîchir ou tester » — le file watcher : « la détection de présence d'un fichier, le fichier mis à jour et relu ». | L'entrant naît par le fichier ; l'AD Azure = un visage de la passerelle D418. Voir §3.2c. |
| D605 | **Le contrat par famille** (solde les connecteurs) : « la famille (ou le type) permet de définir les interactions avec Syncytium — chaque famille a ses propres méthodes et fonctions » — la ligne D579 jusqu'aux connecteurs ; le hook implémente le contrat de sa famille. | Les cinq manques du sujet refermés (D603–D605). Voir §3.2c. |
| D606 | **Les deux sens, le stockage-connecteur, la migration inter-connecteurs** : « un connecteur décrit les sortants et les entrants » ; « les entités sont liées à un connecteur de base de données » — le stockage est un connecteur ; « une migration d'un connecteur vers un autre, en instantanée ou en différentiel ». | La translation aux 4 usages (vérifié — évoqué dès l'origine) ; le différentiel = la réplication passive (D112–D114). Voir §3.2c. |
| D607 | **`hooks.md` créé** : le troisième artefact préparatoire (Q58/domaine 6 — la ligne du glossaire D417 et de composants.md D457) — la doctrine, les cinq familles de hooks et leurs contrats, les points d'extension, les règles transversales. | Le report des échanges consignés — aucun contenu nouveau. |
| D608 | **`types.md` créé** : le quatrième artefact préparatoire (Q58/domaine 6) — le catalogue des types par croisement du registre : le socle commun (le kit, le tri, la signature D579–D584), les simples, les composés, les collections/plages, les liens, les générés et le contexte, les types-hooks. | Le report des décisions — aucun contenu nouveau. |
| D609 | **Le pont de l'opération** (referme le point 8) : le hook = l'opération, la déclaration = l'usage et le déclenchement hors-IHM (`when:`, `every:`, **l'événement de connecteur** — les webhooks, l'import automatique) ; **« une opération peut être une liste d'opérations disponibles dans le socle »** — les effets D432 = des références aux hooks, la composition déclarative sans code, la même transaction (D594). | `when: <nom du connecteur>` en proposition. Voir §3.2c. |
| D610 | **La liaison au stockage** : `connectors.yml` = la liste des disponibles ; « le modèle de données est attaché à un connecteur — celui de la lecture/écriture » ; à la racine : `connector: { storage: main_db }` ou `{ storage: main_db, from: legacy_db }` — le `from` = la procédure de migration/transformation, « une configuration basée sur les éléments déjà vus, que nous allons étendre ». | La surcharge par entité écartée — le legacy passe par le from. Voir §3.2c. |
| D611 | **Le câblage par rôles nommés** (précise D610) : `connector: { storage:, smtp:, location:, siren:, … }` — le hook nomme le rôle qu'il attend (disponible au contexte d'exécution), la racine l'associe au connecteur, **la surcharge locale** par la propriété au nom du rôle vers un connecteur compatible (la famille D605). | « siren » ouvre la vérification des types-identifiants par connecteur. Voir §3.2c. |
| D612 | **Le câblage précisé** (complète D611) : le câblage optionnel au simple, explicite au complexe ; **la famille = `type:`** — « pour les cas les plus simples, le type est le nom du connecteur » (l'écho D458) ; plusieurs connecteurs en service (la sobriété — quelques-uns suffisent) ; **`context.connector.<rôle>`** acté, plusieurs connecteurs par item non exclus ; la carte pouvant choisir son connecteur selon l'écran. | Voir §3.2c. |
| D613 | **Le type et l'implémentation** (clarifie D611–D612) : « postgresql n'est pas un type — storage est bien le type ; postgresql, sqlserver, mysql, oracle… constituent une implémentation compatible avec storage » — le type = la famille = le rôle (le contrat D605), l'implémentation le remplit. | `implementation:` en proposition (le mot hook quitte la configuration — D408). Voir §3.2c. |
| D614 | **`connectors.md` créé** : le cinquième artefact préparatoire (Q58/domaine 6) — la nature (global, sans contexte, le type-contrat et l'implémentation, le stockage-connecteur), la déclaration, le câblage aux rôles, les secrets, le catalogue de base, les déclencheurs, la migration ; les points ouverts listés. | Le report des décisions — aucun contenu nouveau. |
| D615 | **`class:`** (solde D613) : « class serait plus intéressant pour moi » — confirmé : le vocabulaire objet (le type = le contrat, la classe le remplit), court, sans collision ; le YAML écrit `class:`, la prose garde « l'implémentation ». | hooks.md et connectors.md balayés. Voir §3.2c. |

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

### 3.2c La forme du format de description (Q16, phase 3 ; D320–D321)

**La syntaxe : le YAML, étendu (D320).** La syntaxe est **empruntée au
YAML** — **pas de format personnalisé**. Le format est **étendu pour
décomposer le méta-schéma en plusieurs fichiers et/ou dossiers** : une
valeur peut **faire référence à un autre fichier ou à un pattern de
fichiers** pour en charger plusieurs —

```yaml
users:
  - 01-Utilisateurs/*.yml

# Configuration de la génération automatique de la documentation
document: md.yml

# Liste des instances à appliquer
instances:
  - ./*/instance.yml
```

**Les variables d'interpolation (D321).** Le fichier intègre des **variables
d'environnement**, des **variables spécifiques au projet** et des
**références à d'autres valeurs de la configuration**. La spécification de
l'auteur (éprouvée sur son implémentation existante) :

> The format of this kind of string is `${KEY}` or `${KEY?DefaultValue}`
>
> Where KEY can be another configuration item (`.item.subitem` from the
> root, or `item.subitem` from the current item)
> KEY can be a keyword (VERSION or PROJECT)
> KEY can be an environment variable
>
> The character `?` means that if the KEY doesn't exist the default value
> replaces it.

Exemples consignés :

| Expression | Résultat |
|---|---|
| `${PWD}/config` | `/home/developer/workspace/SDK/config` |
| `${ENV_NOT_FOUND?hello world}/config` | `hello world/config` |
| `${name} - ${version}` | `PySyncytium - v0.0.0.0` |
| `${triggers.csv.filename}` | la valeur `filename` du trigger `csv`, ailleurs dans la configuration |
| `${triggers.${environment.name}.filename}` | idem, la clé étant **elle-même variable** (imbrication) |
| `${.item}` | l'information du nœud précédent de l'item de configuration |

**Mots-clés standards** : `PROJECT`, `VERSION`, `date`, `date:<format>`… —
**la liste pourra être étendue au besoin**.

**L'ambiguïté levée (18/07/2026) : la navigation est relative et
remontante.** `{name}` fait référence à la propriété « name » située **au
même niveau** de configuration ; `{.name}` à la propriété située **au
niveau précédent** ; `{..name}` à celle du **parent du précédent** —
**chaque point initial remonte d'un niveau**. *(La mention « from the
root » de la spécification d'origine est caduque : il n'y a pas d'ancrage
à la racine, la résolution est relative au nœud courant.)*

**L'organisation versionnée de la description (D322 — Q16 phase 2, premier
pas).** Traitement étape par étape de la proposition de versionnement,
annoncé lié à l'organisation de la phase 3 :

- **chaque description déclare en tête la version du méta-schéma** qu'elle
  utilise ;
- **un fichier d'entrée par version** ; **ce fichier fait référence à un
  sous-dossier contenant le détail de la description** — la décomposition
  multi-fichiers/dossiers (D320) porte cette organisation.

*(Question de lecture **résolue par les précisions ci-dessous** : le
fichier d'entrée est **par version du schéma client** — le dossier des
versions matérialise le journal ; l'en-tête du fichier porte, lui, la
version du **format**.)*

**La philosophie des petits fichiers (D323).** L'auteur préfère
**travailler avec des petits fichiers de configuration** plutôt que tout
tenir dans un seul fichier. Et, **par expérience, les redondances
d'information ne sont pas facilement éliminables** : l'usage des
**variables** (D321) permet de **référencer la valeur pertinente une
fois** et de l'utiliser autant de fois que nécessaire — c'est la raison
d'être du dispositif de la phase 3.

**Le dossier des versions : déposer un fichier = publier une version
(D324).** Les descriptions de version (**une par version**) sont
**stockées dans un même dossier**, où **le moteur découvre toutes les
versions disponibles**. **La mise à disposition d'un nouveau fichier
signifie la présence d'une nouvelle version** — sous condition d'un
**versionnement cohérent : la nouvelle version doit être croissante**.
**Une version porte quatre valeurs :
`<majeure>.<mineure>.<indice>.<build>`.** Le déploiement à chaud de la
description (D17) trouve ici son geste concret : **déposer un fichier**.

**Le partage commun / versionné (D325).** L'arborescence du dépôt de
description distingue :

- **la configuration technique commune à toutes les versions** — les
  **connecteurs**, les **journaux**, et d'autres items à identifier par la
  suite ;
- **le contenu versionné** — chaque version détaille **le schéma de
  données, les IHM, et des items de configuration générale** (dont
  l'observation — les seuils de télémétrie — et le méta-niveau — les
  entités moteur : contexte, notifications, stock de rejets, solutions
  intégrées).

**Le registre des versions essayées (D326).** **Le moteur conserve une
référence sur les versions qui ont été testées et validées.** **Si une
version est en erreur, la modification du fichier sans évolution du build
(au moins) ne fera pas un nouvel essai** — le nouvel essai est un acte
explicite : incrémenter la version. Pas d'acharnement sur un fichier
cassé, et chaque tentative est traçable.

**L'enveloppe et la logique interne (D327).** **Le fichier de
configuration est une enveloppe** que le moteur **convertit en logique
interne** pour permettre son usage **en toute sécurité**. **Une fois le
fichier de la version lu, la modification des fichiers ne permet ni
reconstruction ni altération de l'existant** — afin d'éviter de tout
vérifier à chaque sollicitation ou relance de l'application. Les fichiers
deviennent **inertes après ingestion** : la logique interne est la vérité
opérationnelle, le dépôt de fichiers n'est que la source de publication.

**Le déclenchement et la mise en service (D328).** **La migration
s'effectue dès que la description de version est validée** *(lecture
harmonisée avec le pipeline D7–D9 : la validation enclenche la chaîne —
dry-run, fenêtre d'affluence, exécution transactionnelle)*. **La version
peut alors être sollicitée par un tiers via les API, ou par les IHM** —
elle rejoint la chaîne des versions publiées (D94–D99), l'IHM basculant
sur la dernière (D100).

**La descendante : le refus propre immédiat (D330).** Une description
déclarant **un format postérieur à celui que le moteur supporte** (le parc
étant hétérogène — mise à jour manuelle D17) est **refusée proprement,
immédiatement, sur la seule lecture de l'en-tête** (D322) : *« cette
description déclare le format N ; ce moteur supporte le format M au
maximum ; moteur requis : ≥ vX »* — **avant toute tentative d'ingestion**.
Le refus est **consigné au registre** (D326) avec sa cause **« format non
supporté »**, distincte d'une erreur de validation : ici, **incrémenter le
build ne sert à rien — c'est le moteur qui doit monter**. Le miroir du 426
(D94) : ni comportement dégradé, ni silence — un refus net, daté,
actionnable.

**L'ascendante : la conversion à l'ingestion, les fichiers jamais
réécrits (D331).** Un moteur vN+1 **sait lire les formats antérieurs** —
son journal de migrations du format, embarqué complet, lui permet de
**compiler directement une enveloppe ancienne en logique interne à jour**,
au moment de l'ingestion. **Les fichiers du technicien ne sont jamais
réécrits par le moteur.**

**La documentation générée automatiquement (D333).** **Le méta-schéma et
la configuration doivent construire en automatique — autant que
possible :**

1. une **documentation technique** ;
2. les **masques d'explication** (déjà actés, D209) ;
3. une **documentation fonctionnelle**.

Les prémices étaient consignées sans être promues : les descriptions
déclarées **« exploitables par des IA »** (D124 — commentaire et
description de chaque champ, entité, surface) et la ligne
`document: md.yml` de l'échantillon D320 (« configuration de la génération
automatique de la documentation »). La documentation du projet a donc
**deux sources complémentaires** : celle **rédigée en amont** (D314/Q58 —
la conception, les exemples des mises en situation Q59) et celle
**générée depuis les descriptions** — qui vit avec le modèle et ne se
périme jamais.

**La langue du dépôt de description (D335).** **Les noms des dossiers,
des fichiers et les propriétés dans les fichiers de configuration sont en
anglais** — cohérent avec le langage (D301 : fonctions, D309 : mots-clés) :
**la structure en anglais, la sémantique métier dans la langue du modèle**
(les noms d'entités et de champs restent ceux du technicien). Les
échantillons de la phase 3 s'y conformaient déjà (`users`, `document`,
`instances`, `triggers`, `environment.name`).

**Le statut d'une version = son emplacement (D338).** **Le statut de la
version n'est pas dans le fichier : le dossier `versions/` est décliné par
environnement** — les sous-dossiers portent les noms des environnements
déclarés (`technical/environments/` — production, stagings, D112–D114) :

```yaml
versions/
  staging/
    1.1.0.0.yml        # une bêta en test — son staging s'instancie (D112)
    1.1.0.0/
  production/
    1.0.0.0.yml        # la version officielle servie
    1.0.0.0/
```

**Déposer une version dans le dossier d'un environnement = la publier pour
cet environnement** (le geste D324, étendu). *(L'interprétation
« interdite/dépréciée = actes hors fichiers » est **amendée par D340** :
tout le cycle de vie est en dossiers.)*

**Le dossier `environments/` (D339).** Il contient **les caractéristiques
techniques de chaque environnement** :

- `staging.yml` — l'environnement de **test** ;
- `production.yml` — l'environnement de **production (actif)** ;
- `passive.yml` — l'environnement de **production (passif)** (le PCA/PRA,
  D113–D114).

**Les quatre dossiers de versions (D340).** **Les statuts interdits et
dépréciés sont aussi dans des dossiers dédiés** — les versions vivent donc
dans **quatre dossiers possibles** :

```yaml
versions/
  beta/          # bêtas en test — le staging s'instancie (D112)
  production/    # les versions officielles servies (active + passive)
  deprecated/    # les dépréciées — encore appelables jusqu'au Sunset (D12/D94)
  forbidden/     # les interdites — refusées proprement (D103)
```

**Le cycle de vie D103 est entièrement matérialisé par l'emplacement**, et
**les transitions sont des gestes de fichier** : `beta/ → production/` = la
promotion (le staging est supprimé, D112) ; `production/ → deprecated/` =
la dépréciation (le Sunset court) ; `→ forbidden/` = l'interdiction (la
version à bug révélé). *(Harmonisation : les dépréciées restent servies
par la chaîne de translation jusqu'au Sunset, les interdites sont refusées
— les sémantiques D94/D103 inchangées ; la correspondance
versions ↔ environnements : `beta/` → staging, `production/` → actif +
passif.)*

**La cohérence du dossier des versions (D344).** Trois règles :

1. **Unicité d'emplacement** : lors de l'exploration de `versions/`,
   Syncytium **lève une erreur si une même version apparaît dans deux
   sous-dossiers simultanément** ;
2. **Le statut est porté par l'ingestion** : les dossiers sont le geste de
   publication, **l'état ingéré est la vérité** (le registre D326, la
   logique interne D327) ;
3. **Les transitions sont unidirectionnelles** : une version **peut passer
   de `beta` à `production`, ou de `production` à `deprecated` ou
   `forbidden` — jamais le chemin inverse**. **Et `deprecated → forbidden`
   est écarté** : « s'il est déprécié, cela signifie qu'il a été utilisé
   suffisamment longtemps pour être éprouvé » — un bug critique se
   constate **en production**, et c'est là que la version est classée
   `forbidden`. **Complété (D345)** : **`beta → forbidden` est permis** —
   si un bug critique est découvert **lors de la phase de validation**.
   Le graphe complet :

   ```
   beta ──→ production ──→ deprecated  (extinction naturelle au Sunset)
      │               └──→ forbidden   (bug critique en production)
      └──────────────────→ forbidden   (bug critique en validation)
   ```

**Le dossier `resources/` (D346).** **Les logos, icônes, images ou autres
documents sont stockés dans un dossier `resources/`**, positionné **au
même niveau que `syncytium.yml`** (la racine du dépôt) — **ces fichiers
sont partagés avec toutes les versions**. *(Distinction à retenir :
`resources/` = les ressources de la **description** — le logo de
l'instance D191, les icônes d'énumérés D283… ; le stockage des fichiers de
**données** D160 reste, lui, hors dépôt, dans le dossier d'exploitation de
l'instance.)*

**Le dossier d'un module (D347 — domaine 2, premier arbitrage).** Dans le
dossier d'un module : **le fichier `module.yml`** (l'entrée du module) et
**un sous-dossier `entities/` contenant un fichier par entité**. La
propriété `entities` de `module.yml` s'écrit donc :

```yaml
# versions/<statut>/<version>/sales/module.yml
entities:
  - entities/*.yml
```

*(Le pattern à plat `*.yml` aurait inclus `module.yml` lui-même comme
entité — la séparation par sous-dossier l'exclut par construction.)*

```yaml
sales/
  module.yml                   # l'entrée du module
  entities/
    customer.yml               # une entité par fichier
    order.yml
```

**Le bloc `settings` de `module.yml` (D348).** Le fichier de module
s'enrichit d'un **bloc `settings`** qui **regroupe les propriétés
potentiellement diffusées dans les sous-composants** — les défauts en
cascade : l'historisation (D168, opt-out), le quota (D162, la plus petite
taille l'emporte)… **La structuration de cette section se consolidera au
fur et à mesure des échanges et des compléments poussés par les autres
domaines** — section volontairement ouverte.

**Le `settings.yml` du module (D349).** Le bloc est **externalisé dans un
fichier `settings.yml`, référencé par `module.yml`** — anticipant sa
croissance (« la suite nous dira si c'est le cas ») ; la référence de
fichier est le mécanisme natif du format (D320) :

```yaml
sales/
  module.yml                   # l'entrée du module
  settings.yml                 # les propriétés diffusées aux sous-composants
  entities/
    customer.yml
    order.yml
```

```yaml
# sales/module.yml
name: sales
label: { fr: Ventes }
comment: { fr: Gestion commerciale }
description: { fr: ... }
settings: settings.yml         # référence de fichier (D320)
menu: menu.yml                 # le bloc menu → menu.yml (D351)
entities:
  - entities/*.yml
```

```yaml
# sales/settings.yml
history: false                 # D168 — héritée par les entités, opt-out
quota: 2GB                     # D162 — cascade, la plus petite l'emporte
```

*(Le patron s'affirme : un `settings.yml` à chaque étage — l'environnement
(D342), le module (D349), et vraisemblablement l'entité — chaque niveau
raffinant les défauts du niveau supérieur, dans les cascades déjà actées ;
le champ, lui, porte ses settings en propriétés directes — D365.)*

**La déclaration vaut activation (D350).** **La déclaration d'un module
marque son activation** — pas de drapeau d'activation : un module présent
dans la description d'une version est **actif** ; le désactiver, c'est
**le retirer de la description** (une nouvelle version, donc une
migration). L'« activation par instance » (D117.3) est portée par le
contenu de la description propre à chaque instance (D16) — **le geste
déclaratif est l'acte**, dans la droite ligne de « déposer = publier »
(D324).

**Le menu du module : `menu.yml` (D351).** **Le menu du module est stocké
dans `menu.yml`**, dans le dossier du module — référencé par `module.yml`
(le patron D349). Le fichier est **optionnel** : sans lui, le défaut
s'applique (les entités agrégats en entrées — D186/D191/D193). Son
contenu détaillé (les entrées à cinq types, la hiérarchie, le filtrage par
la confidentialité — D193) sera précisé au **domaine 4** (les surfaces).
Le dossier de module atteint sa forme complète :

```yaml
sales/
  module.yml                   # l'entrée : name, labels, comment, description,
                               #   settings: settings.yml, menu: menu.yml,
                               #   entities: - entities/*.yml
  settings.yml                 # les propriétés diffusées (D348–D349)
  menu.yml                     # le menu du module (D351, optionnel)
  entities/
    customer.yml               # une entité par fichier (D347)
    order.yml
```

**L'externalisation libre des blocs d'entité (D352).**
**L'externalisation n'est pas imposée** : dans les cas les plus simples,
**le fichier d'entité est suffisamment léger** pour tout contenir — « un
découpage trop détaillé va rendre le processus trop lourd ». Mais **une
entité très conséquente bénéficiera d'un découpage**, par la référence de
fichier native du format (D320) — bloc en ligne ou
`validations: validations.yml`, **au choix du technicien**, cas par cas.

**L'héritage : l'enfant pointe, le parent décrit (D353).** **La propriété
`inheritance` fait référence uniquement à l'entité parent** — c'est tout
ce que porte l'enfant. **La machine à états est un bloc décrit sur le
parent, qui fait référence aux enfants** : les niveaux, les branches
(positions multiples D146), les promotions et rétrogradations (D147), les
déclencheurs (D54/D148) se déclarent là où la hiérarchie entière est
visible. L'exigence de l'auteur : **une approche qui rende le paramétrage
naturel** — la forme concrète du bloc est en proposition.

**La sémantique du `when` : le cliquet (D354).** La forme proposée est
validée (« belle proposition ») et sa sémantique précisée :

1. **`when` décrit le déclencheur automatique**, sous **trois formes** : un
   **événement de données** (D54), une **opération** (D148), ou une
   **expression** (D90 — `when: total_orders >= 1`) ;
2. **Le franchissement est un cliquet** : la transition s'exécute **la
   première fois** que la condition devient vraie — le prospect devient
   client à la première commande. **Si la condition redevient fausse
   ensuite** (une commande supprimée, `total_orders = 0`), **le client
   reste client** : la promotion acquise ne se perd pas d'elle-même ;
3. **Le retour n'advient que par une action explicite et autorisée** —
   l'opération de rétrogradation (D147/D148), sous les droits de
   l'utilisateur (D196).

**La création directe à un niveau (D355).** **La création directe doit
être possible** : « un client peut être créé sans être passé par la phase
prospect » — un enregistrement peut **naître directement à un niveau** de
la hiérarchie, avec la position correspondante d'emblée (l'identité D142
unique dès la naissance, les autres branches D146 restant acquérables
ensuite).

**Le bloc `fields` : le mapping ordonné et la forme courte (D356).** Le
bloc `fields` est un **mapping ordonné** : le nom du champ est la clé, et
**l'ordre de déclaration décrit l'affichage par défaut** (le formulaire
par défaut le suit). **La forme courte est retenue** : quand la valeur
d'un champ est une chaîne, **elle est le type**, tout le reste au défaut
(`notes: text`) — « utile pour faire un mode simple et rapide », dans
l'esprit des cas simples légers (D352).

**L'identité fonctionnelle au niveau de l'entité (D357).** La clé métier
(D142) se déclare **sur l'entité** — `identity: [code]` — et non champ
par champ : **les clés composites s'y lisent d'un regard**
(`identity: [last_name, first_name, birth_date]`), et la clé simple s'y
écrit tout aussi facilement.

**Les valeurs du catalogue en anglais (D358).** D335 (noms et propriétés
en anglais) s'étend aux **valeurs du catalogue** : les types (`text`,
`amount`, `percentage`, `thumbnail`…), la confidentialité
(`public` / `protected` / `private` — les niveaux D25), les modes
(`write-once`)… **L'anglais pour la machine, les `labels` français pour
l'humain** — la droite ligne du catalogue de fonctions (D301).

L'exemple canonique du bloc :

```yaml
# sales/entities/customer.yml
name: customer
label: { fr: Client }
inheritance: third_party            # D353 — seule référence au parent
identity: [code]                    # la clé métier, sur l'entité (D357)

fields:
  code:
    type: text
    size: 10
    mask: "C-999999"                # masque de saisie (D260)
    label: { fr: Code client }
    mode: write-once                # écriture unique — posé à la création
  company_name:
    type: text
    size: 80
    label: { fr: Raison sociale }
    required: true
    searchable: true                # recherche plein-texte (D226)
  revenue:
    type: amount                    # composé (D122) : décimal + devise
    currencies: [EUR]               # dérivation par restriction (D123)
    min: 0
    label: { fr: Chiffre d'affaires }
    confidentiality: protected      # D25
  category:
    type: enum
    values:
      bronze: { label: { fr: Bronze }, icon: bronze.png }   # ← resources/ (D283/D346)
      silver: { label: { fr: Argent } }
      gold:   { label: { fr: Or } }
    default: bronze
  advisor:
    type: reference
    to: hr.employee                 # l'adressage logique par points (D363)
    filter: active = true           # restreint les valeurs proposées (D90)
    label: { fr: Chargé d'affaires }
  logo:
    type: image                     # D286 — vignette calculée par le moteur
  total_orders:
    type: integer
    computed: count(orders)         # D90 — recalculé quand un champ concerné change
  notes: text                       # la forme courte (D356)
```

**Les sept familles d'un champ (l'inventaire de convergence).** Le bloc
`fields` fait converger : **(1) la nature** — `type` simple (D118/D121),
composé (D122), dérivé par restriction (D123), `list of …` (D166,
« listable » par type), vignette/image (D286), communication (D167),
référence *(la liste 1-N nommée D216 n'est pas un champ stocké — elle
viendra aux surfaces)* ; **(2) le stockage** — les facettes (D118–D119) :
`size`, `decimals`, `min`/`max`, `mask` (D260), précision de l'heure
(D277), `kind: raw | timestamp` (D220), devises/unités (D123), types de
fichiers permis (D292), `values` d'énuméré (D283) ; **(3) les libellés**
— `labels`, `comment` (infobulle), `description` (masque d'explication,
D333), `placeholder` (valeur de démonstration) ; **(4) les contraintes**
— `required`, `validation` (expression D90 — règle non satisfaite =
trace), `default`, `filter` ; **(5) l'accès** — `confidentiality` (D25),
`mode` : lecture / écriture / écriture unique *(la visibilité par niveau
D144 est structurelle : un champ déclaré sur l'enfant appartient à ce
niveau)* ; **(6) le comportement** — `computed` (D90), `searchable`
(D226), `component` (surcharge du défaut type→composant, D64/D270 — le
formulaire pourra surcharger encore), les valeurs en cascade en
propriétés directes du champ (quota D162 — D365) ; **(7) hors
déclaration** — les champs générés : UUID
(D142), horodatages et opérateur, provenance, positions (D146) — **le
moteur les porte, le technicien ne les écrit jamais**.

**Les types personnalisés, déclarés dans les settings (D359).** **Un type
peut être défini dans le `settings` de l'instance, du module ou de
l'entité** ; sur un champ, **ce type s'utilise comme n'importe quel
type** et **reprend toutes ses propriétés par défaut, avec possibilité de
les surcharger**. L'exemple fondateur : définir un type `progression` —
entier de 0 à 100, composant « fuel » — puis déclarer un champ
`avancement` de type `progression` :

```yaml
# settings.yml (instance, module ou entité)
types:
  progression:
    type: integer
    min: 0
    max: 100
    component: fuel
```

```yaml
# dans une entité
fields:
  avancement: progression        # la forme courte (D356) prend tout son sens
  completion:
    type: progression
    max: 200                     # surcharge d'une propriété héritée du type
    label: { fr: Complétude }
```

*(La convergence : les composés livrés D122 deviennent des types définis
à l'étage Syncytium de la cascade — la bibliothèque enrichissable D52/D68
trouve son geste déclaratif ; le graphe de conversion, lui, reste aux
types du catalogue — D360.)*

**La résolution des types personnalisés (D360).** Trois précisions
closent le mécanisme :

1. **Le niveau le plus proche l'emporte** — entité > module > version >
   Syncytium — et **les noms du catalogue de base sont réservés** (pas de
   type personnalisé nommé `text`). L'étage « instance » est ancré : **un
   `settings.yml` à la racine du dossier de version** — un type est du
   **schéma**, il migre avec lui (contenu versionné D325), il ne peut
   vivre dans `environments/` (commun aux versions). La cascade
   complète : **Syncytium (composés livrés D122) → version → module →
   entité**.
2. **Le chaînage est possible** : un type personnalisé peut dériver d'un
   autre type personnalisé (`progression_fine` à partir de `progression`)
   — même mécanisme, récursif.
3. **« Les types custom facilitent le déclaratif mais ne portent pas le
   graphe de conversion. »** Le graphe (D120/D123) reste porté par les
   **types du catalogue** : le champ convertit selon son type de base ;
   les propriétés reprises du type personnalisé (bornes, jeux de
   valeurs…) se résolvent en **contraintes du champ**, vérifiées aux
   frontières.

**Le catalogue nominatif des types (D361).** Les noms canoniques sont
anglais **nativement** : « les types "réel" ou "tva_intra" n'existent pas
dans Syncytium — nous utiliserons `decimal` ou `vat_number` » (les noms
français du document sont des étiquettes de travail — D358). Le
catalogue, avec les facettes de chacun :

- **Simples (D118/D121)** : `text` (`size` — mono/multi-ligne déduit,
  `mask` D260), `integer` (`min`/`max` — borné → jauge ou curseur D275),
  `decimal` (`decimals` D273, `min`/`max`), `boolean` (`values` —
  libellés VRAI/FAUX/NUL surchargeables D281), `date` (brute par nature
  D220, raccourcis D278), `time` (`precision` : `hh`…`hh:mm:ss.sss`
  D277), `datetime` (`kind: raw | timestamp` D220), `duration` (`mask` +
  option de conversion D276), `file` (`extensions` permises D292,
  métadonnées D160 automatiques), `enum` (`values` : clé → `labels`,
  `icon`/`image` D283 ← `resources/`).
- **Composés (D122)**, dérivables par restriction (D123) : `amount`
  (`currencies`), `email`, `percentage` (borné → jauge D274), `phone`,
  `url`, `siren`, `siret`, `iban`, `bic`, `vat_number`, `measure`
  (`units`), `geolocation`, `period` — siren/siret/iban/bic inchangés :
  des identifiants du domaine, pas des mots à traduire — et `uuid`
  (D419, les identifiants externes), `password` (D463, l'empreinte
  seule).
- **Contenus** : `communication` (D167 — défauts : visibilité maximale,
  immuable, sans pièces jointes, sans notification). *(`thumbnail` et
  `image` : reclassés parmi les simples, dérivés de `file` — D385.)*
- **Structurels** : `reference` (`to`, `filter`), la liste (D362).

**La liste : `list of` (D362).** La syntaxe **`type: list of text`** est
validée — la phrase se lit (les mots-clés anglais, D301) ; **les facettes
déclarées sur le champ s'appliquent à chaque élément** (`size`, `mask`…
contraignent chaque valeur — D166 : l'atomicité est l'élément).

**L'adressage logique par points (D363).** La référence s'écrit
**`<module>.<entité>.<champ>`** — **le séparateur est le point, pas la
barre oblique** : « l'organisation des dossiers peut être finalement
libre » — **le chemin logique est découplé de l'arborescence physique**.
Le namespace est porté par les déclarations (`name:`), les dossiers ne
sont qu'une convention (les patterns D320 listent explicitement ce qui
est inclus). Dans le même module, le nom local suffit (`to: employee`) ;
au-delà, le chemin qualifié (`to: hr.employee`).

**Le socle commun du champ (D364–D365).** Les propriétés de tout champ,
quel que soit son type — le socle est finalisé :

| Propriété | Rôle | Source |
|---|---|---|
| `label` | le libellé par langue (`labels` réservé au dictionnaire du module — D465) | D217 |
| `comment` | l'infobulle | invariants de l'auteur |
| `description` | le masque d'explication, la documentation | D188/D333 |
| `placeholder` | la valeur de démonstration | invariants de l'auteur |
| `required` | obligatoire — défaut : optionnel | D118 |
| `default` | la valeur initiale — littéral ou expression (D90) évaluée à la création | — |
| `validation` | les règles de validation — D364 | D90/D307 |
| `confidentiality` | `public` / `protected` / `private` | D25 |
| `mode` | `editable` (défaut) / `read-only` / `write-once` | — |
| `component` | la surcharge du composant par défaut du type | D64/D270 |

**`validation` : plusieurs règles (D364).** La propriété **peut contenir
plusieurs règles**, chacune portée par **le conditionnel d'autres valeurs
de l'enregistrement, ou par le respect d'une expression régulière** — le
langage les porte déjà (D90 : le `matches` du catalogue, le `if`
conditionnant la règle). Chaque règle en échec = refus + trace (la
doctrine D307). La forme en proposition :

```yaml
validation:
  - zip_code matches "^[0-9]{5}$" if country = "FR"   # conditionnée par un autre champ
  - end_date >= start_date                            # expression pure (D90)
```

**Pas de `settings` au champ (D365).** « La propriété `settings` d'un
champ n'est pas utile car **le champ porte les settings**. » Les valeurs
en cascade qui atteignent le champ (le quota D162…) s'écrivent en
**propriétés directes** — la cascade de blocs `settings` s'arrête à
l'entité (version D360 → module D349 → entité) ; le champ, lui, est à
plat.

**Le type `text` — la taille (D366).** `size` a **quatre formes** :
**`auto`** (pas de taille — elle **s'auto-ajuste en fonction du
contenu** ; le défaut), **`<max>`** (taille maximale), **`<min>..`** (à
partir de), **`<min>..<max>`** (entre les deux). Et **la taille peut être
définie dans le nom du type** : `notes: text` (auto), `name: text[30]`,
`code: text[3..10]`, `story: text[3..]` — la forme courte (D356) reste
entière. **Le mono/multi-ligne se déduit de la taille** (face au seuil
d'instance) et **se surcharge éventuellement par `component`** (D270).
**`mask` (D260) déduit ce qu'il impose** : la taille de la longueur du
masque, les lignes des lignes du masque — et **déclarer `mask` et `size`
ensemble = erreur à l'ingestion** (pas d'arbitrage silencieux entre deux
vérités, l'esprit D344). *(Le crochet s'affirme comme **le paramètre en
ligne** du format — `text[3..10]`, `similarity[0.8]`,
`mutualizable[who]`.)*

**Le type `text` — `searchable`, le mode de recherche (D367).** La
propriété ne dit plus « cherchable » mais **comment** : **absent = pas de
recherche (le défaut)** ; **`strict`** (valeur égale) ; **`normalized`**
(valeur normalisée — D222) ; **`similarity[0.8]`** (similarité ≥ 0,8 — le
seuil de D229 devient un paramètre en ligne, par champ). **Ces trois
valeurs ouvrent un champ de recherche spécifique au champ.**
**`mutualizable[name]`** nomme un **champ de recherche mutualisé entre
plusieurs champs** — la « recherche nommée » de D227, déclarée côté
champs : chaque membre la rejoint en la nommant.

```yaml
fields:
  notes: text                       # auto — la taille s'ajuste au contenu
  name: text[30]                    # 30 caractères maxi
  code: text[3..10]                 # entre 3 et 10 caractères
  story: text[3..]                  # au moins 3 caractères, sans borne
  registration:
    type: text
    mask: "FR__ ____ [A-E]9"        # taille et lignes déduites du masque (D260)
  city:
    type: text[40]
    searchable: normalized          # champ de recherche dédié, valeur normalisée
  last_name:
    type: text[60]
    searchable: mutualizable[who]   # rejoint la recherche partagée « who »
  first_name:
    type: text[60]
    searchable: mutualizable[who]
```

**Le champ de recherche mutualisé : normalisé par défaut, similarité
possible (D368).** Le mutualisé d'un texte **répond au « contient
normalisé » par défaut** (D222/D226) — le nom suffit, zéro déclaration de
plus. Mais **« l'usage de la similarité peut être utile pour intégrer les
fautes de frappe dans une recherche »** : le mode se déclare alors en
second paramètre — `mutualizable[who, similarity[0.8]]`. *(Cohérence
entre membres : des déclarations divergentes sur un même nom = erreur à
l'ingestion — l'esprit D344.)*

**Le mutualisé au-delà du texte : la conversion en texte (D369).** **Si
`mutualizable` est utilisé** sur un champ non textuel, **« la recherche
va s'appuyer sur la conversion du type en texte »** — la forme affichée
(la facette d'affichage D119) devient la clé de recherche partagée : un
entier, une date, un montant rejoignent la boîte commune par leur forme
lisible.

**Le `mask` de l'entier : le format (D370).** **Un `integer` peut porter
une propriété `mask` pour proposer un format** : `"000000"` — **entier
aligné à droite**, valeurs à six chiffres ; `"00 00 00"` — aligné à
droite, **un espace entre deux chiffres**. Le `0` est l'emplacement de
chiffre, les littéraux s'intercalent — l'esprit D260, le `9` du texte
devenant le `0` du nombre. *(Cohérence : un masque à six positions et une
borne `max` qui le déborde = erreur à l'ingestion — l'esprit D344/D366 ;
note en proposition.)*

**Les modes de recherche de l'entier : `range`, et la conversion qui
porte tout (D371).** **`searchable` peut prendre la valeur `range`** —
le champ de recherche propose alors **une plage de valeurs** *(les types
à ordre naturel, D125 — l'entier, et plus tard les dates, les montants ;
note)*. Sur un entier, **`normalized` revient à faire `strict`** (rien à
normaliser — accepté, équivalent), et **`similarity` est aussi autorisé,
basé sur la conversion en texte** : la doctrine D369 s'étend — **la
conversion en texte porte tous les modes textuels hors du type texte**,
le mutualisé comme la similarité (les chiffres intervertis d'un numéro se
retrouvent).

**Les bornes et les octets de l'entier (D372 — clôt `integer`).** **Les
bornes se déclarent dans le nom du type** : `integer` (non borné),
`integer[100]` (maxi 100), `integer[0..100]`, `integer[0..]` (positif) —
ou en propriétés `min`/`max` explicites (la symétrie de D366). **Les
octets ne se déclarent jamais** : le moteur dimensionne la représentation
interne **en fonction des bornes ou des valeurs affectées** — « un peu
comme le mode `auto` du texte » : sans borne, le stockage s'ajuste aux
valeurs réelles.

```yaml
fields:
  quantity: integer[0..]           # positif, stockage auto
  progress: integer[0..100]        # borné — jauge/curseur possibles (D275)
  serial:
    type: integer
    mask: "00 00 00"               # format (D370)
    searchable: similarity[0.9]    # les chiffres intervertis se retrouvent (D371)
```

**Le type `decimal` (D373 — clos).** **`decimals` est une propriété** —
son défaut **vient du `settings`** (la cascade D360/D349), **ou vaut 2 si
rien n'est défini**. **Le stockage est exact ou réel** : l'**exact**
évite les problèmes d'arrondis — « nous pouvons faire un stockage en
entier en convertissant les décimales dans la partie entière de la
valeur », le dimensionnement suivant les critères de l'entier (D372) ;
« cette structure offre des calculs optimisés et performants ». Le
**réel** autorise des arrondis (mesures, grandeurs continues). **La forme
est validée** (« pour décimal, "storage" me convient ») :
`storage: exact` — le défaut — ou `storage: real`. **Le
`mask` s'étend à la partie décimale** : `"0 000.00"` — les séparateurs
sont symboliques, **rendus selon la langue** (la virgule française —
D217/D221). **La recherche reprend le jeu de l'entier** (D371) tel quel.
Les bornes : dans le nom du type (`decimal[0..100]`) ou `min`/`max` — la
symétrie D372, le crochet ne portant jamais les décimales (`decimal[2]`
serait ambigu).

```yaml
fields:
  price:
    type: decimal[0..]
    decimals: 2                    # défaut : le settings, sinon 2
    mask: "0 000.00"               # séparateurs rendus selon la langue
  temperature:
    type: decimal[-50..60]
    storage: real                  # les arrondis assumés
```

**Le booléen : le cycle du tri-état (D374).** **« Une case à cocher à
3 états : faux → vrai → nul → faux… »** — sur un booléen optionnel (le
tri-état), **chaque clic avance d'un cran dans ce cycle** : l'état nul se
ressaisit à la main, comme les deux autres, sans passer par un
effacement — le nul de la table est une valeur de plein droit (la
doctrine Q47), son composant le traite pareil.

**Le booléen : la recherche par le composant (D375).** **« Une recherche
`strict` s'appuie sur une case à cocher ou un toggle »** — le champ de
recherche d'un booléen n'est pas une boîte de texte : **c'est le
composant du type qui sert la recherche** (la ligne de D228 — un filtre
par type de données). Le tri-état en recherche permet de **viser les
lignes nulles** (« les filtres peuvent également concerner les lignes
null si besoin » — la doctrine Q47) ; le toggle, sans nul, filtre
vrai/faux.

**Le booléen `required` : le troisième état dit « tous » (D376).**
**« Pour un booléen sans valeur nulle (`required`), la recherche `strict`
avec une case à cocher : "null" filtre Vrai & Faux. »** La case de
recherche garde ses trois états même quand la donnée n'en a que deux —
**la position nulle signifie « aucun filtrage »**, tout passe. *(Le sens
de la position nulle suit donc la donnée : champ optionnel → elle vise
les lignes nulles (D375) ; champ obligatoire → elle dit « tous ».)*

**Le type `boolean` (D377 — clos).** Les points sont validés : **(1)
`values` surcharge les libellés des trois états** — VRAI/FAUX/NUL (D281),
par langue — servant l'affichage, le survol, l'export (D130) et la
conversion en texte ; **(2) le tri-état n'est jamais déclaré : il découle
de `required`** ; **(3)** la recherche par le composant (D375–D376), et
**la recherche non engagée ne filtre rien** — la réinitialisation
désengage la case (l'esprit du filtrage vivant D228), aucun quatrième
état ; **(4) le composant** : case à cocher par défaut, `toggle` sans
état nul, énuméré/radios en surcharge (D281) ; **(5) la naissance** :
l'optionnel naît **nul**, l'obligatoire naît **`false`** sauf
`default: true` — le stockage dit la même chose que l'écran.

```yaml
fields:
  active:
    type: boolean
    required: true                 # deux états — toggle possible
    values:
      true:  { label: { fr: Actif } }
      false: { label: { fr: Inactif } }
  audited:
    type: boolean                  # optionnel — tri-état, naît nul (D374)
    searchable: strict             # case tri-état en recherche (D375)
```

**La durée : la virgule du masque, la notation décimale (D378).** **« Dans
le masque d'une durée, la virgule signifie une heure en centième, une
minute en centième ou une heure en dix-millième. »** Le masque (D276)
porte donc **deux notations** : le deux-points sexagésimal (`"00:00"` —
1:30 = une heure trente) et **le séparateur décimal industriel** — la
virgule de l'auteur, symbolique et rendue selon la langue (D373) :
`"0.00 h"` (l'heure en centièmes — 1,50 = 1 h 30), `"0.00 min"` (la
minute en centièmes), `"0.0000 h"` (l'heure en dix-millièmes — la
comptabilité industrielle du temps). **L'option de conversion (D276)**
fait le pont : la saisie dans une notation, **la valeur canonique unique**
au stockage et aux exports (Excel).

**Le tri et le nul : l'équivalence par type (D379).** Le nul n'a pas une
place fixe au tri — **il a une équivalence par type** : **`boolean` :
nul < faux < vrai** (un rang propre, sous le faux) ; **`text` : le nul
correspond à la chaîne vide** ; **`integer` : le nul est égal à 0** — il
se classe **parmi** les valeurs (entre négatifs et positifs), pas à une
extrémité. *(Le nul des temporels : à arbitrer avec leur clôture.)* La
table reste souveraine (Q47) : l'équivalence ne vaut que pour la
comparaison intrinsèque du type (D125) — le nul stocké demeure nul,
l'export le rend tel quel.

**La doctrine du tri complétée (D380).** **(1) `decimal` et `duration` :
nul ≡ 0** — l'équivalence D379 étendue. **(2) La propriété `sort` entre
au socle**, pour les seuls types à variantes : `text` →
`sort: alphabetical` (défaut — la collation D222) ou `sort: natural`
(les nombres lus comme des nombres : `item2` < `item10`) ; l'énuméré y
viendra (déclaration \| libellé). **(3) La référence trie sur son libellé
affiché** (ce que l'utilisateur voit — D216), **le calculé sur sa
valeur**. Le parcours énonce désormais la règle de tri à chaque type.

**Les temporels (D381 — clôt `date`, `time`, `datetime`, `duration`).**
« Ok pour tout » — les six points : **(1)** `time` : **la précision dans
le crochet** — `time[hh]`, `time[hh:mm]`, `time[hh:mm:ss]`,
`time[hh:mm:ss.sss]` (D277) ; **(2)** `datetime` : **la nature dans le
crochet** — `datetime[raw]` (valeur civile, **le défaut**) ou
`datetime[timestamp]` (instant UTC, affiché selon la langue — D220), la
précision de la partie heure en second paramètre
(`datetime[timestamp, hh:mm]`) ; **(3)** les bornes `min`/`max` en
**littéraux ISO** — les bornes dynamiques (« pas dans le passé »)
passent par `validation` (D90), jamais par les facettes ; **(4)** le
`mask` — **amendé par D383** : possible, **le masque de la langue
(D217/D221) restant le défaut** ; les raccourcis, calendriers et horloges
sont des composants (D278–D280) ;
**(5)** la recherche : `strict`, **`range` en usage roi** (la plage de
dates), `mutualizable` par la forme affichée (D369) ; **(6)** **le nul
temporel se trie en tête** — avant toute valeur, le pendant du
`nul < faux` booléen (D379).

```yaml
fields:
  due_date:
    type: date
    min: 2020-01-01                # littéral ISO — le dynamique passe par validation
    searchable: range              # la plage de dates
  opening:
    type: time[hh:mm]              # la précision dans le crochet (D277)
  meeting:
    type: datetime[raw, hh:mm]     # valeur civile (défaut), précision minute
  signed_at:
    type: datetime[timestamp]      # instant UTC, affiché selon la langue (D220)
```

**La date à précision (D382 — complète D381).** **`date` porte aussi une
nature dans le crochet** : **`date[yyyy-mm-dd]`** (le jour — le défaut de
`date`), **`date[yyyy-mm]`** (le mois — l'échéance mensuelle, la
facturation), **`date[yyyy-ww]`** (la semaine — `ww` le numéro de
semaine, dont la numérotation suit la langue D279). La valeur reste brute
(D220), la comparaison chronologique, les bornes et la sérialisation à la
granularité déclarée (ISO 8601 — `2026-07`, `2026-W30`) ; le calendrier
se présente au bon grain — année, mois, semaine (D279).

**Les temporels : la nature la plus fine par défaut, le masque possible
(D383 — amende D381).** **(1) « Par défaut, la nature la plus fine est
sélectionnée »** : `date` = `date[yyyy-mm-dd]`, `time` =
`time[hh:mm:ss.sss]`, la précision de `datetime` = la plus fine — sa
nature `raw` demeure, elle, le défaut (D381). **(2) « Le masque est
possible »** — le point 4 de D381 s'assouplit : **par défaut, le masque
de la langue s'applique** (D217/D221) ; un `mask` déclaré au champ
surcharge ce défaut, pour l'affichage comme pour la saisie.

**Le type `file` (D384 — clos).** **(1) `extensions`, deux formes** : la
liste simple — `extensions: [pdf, docx, jpg]` — ou **la forme à
libellés**, chaque extension nommant par langue **le document attendu** :

```yaml
fields:
  invoice:
    type: file
    extensions:
      pdf:  { fr: facture }
      docx: { fr: document qualité }
      jpg:  { fr: image }
    quota: 10MB                    # propriété directe (D365), cascade D162
  attachment:
    type: file
    extensions: [pdf, docx, jpg]   # la forme simple ; absente = tout accepté
```

*(Le libellé nourrit l'écran de dépôt et la documentation D333 — le champ
ne dit plus « pdf accepté » mais « la facture ».)* **(2)** `quota` :
déjà acquis (D162/D365). **(3) Les métadonnées ne se déclarent jamais** —
nom, taille, MIME, empreinte, mots-clés (D160), le moteur les porte.
**(4) La recherche porte sur le nom et les mots-clés** (`normalized`,
`similarity`, `mutualizable` — la conversion en texte d'un fichier est
son nom) ; **le tri sur le nom**, nul ≡ chaîne vide (D379). **(5) Rien
d'autre au champ** : déduplication (D165), stockage dual (D161),
caméra/galerie/visionneuse (D292–D293) relèvent du moteur et des
composants.

**`image` : un simple dérivé de `file` (D385).** **« Nous aurons un
autre type simple `image` qui dérive de fichiers — les extensions sont
limitées, la taille de l'image est ajustée/retaillée… »** Le type hérite
du socle de `file` (D384 — quota, métadonnées, recherche nom+mots-clés)
et **le restreint** : extensions bornées aux formats d'image, **la taille
ajustée/retaillée par le moteur** (la vignette automatique D286 en
découle). `thumbnail` suit la même filiation (D286 — la petite taille).
Le catalogue D361 se lit désormais avec `thumbnail` et `image` parmi les
simples ; leur détail viendra au parcours, après `enum`.

**Le champ image de l'entité : la sélection par l'image (D386).**
**« Dans une entité, nous pouvons associer un champ `image` pour que,
dans une liste, l'image soit sélectionnable. »** L'entité **désigne l'un
de ses champs image comme son visage** — la forme en proposition, une
propriété d'en-tête :

```yaml
name: customer
label: { fr: Client }
image: logo                       # le champ désigné — le visage de l'entité
fields:
  logo:
    type: image                   # D385
```

La désignation ancre ce qui était acté côté composants : **le choix d'une
référence par l'image** (D284–D285 — la liste de sélection présente les
images), la vignette en cellule et en widget (D286/D293).

**Le type `enum` : les values enrichies, le stockage numérique (D387).**
**(1) `values` gagne une `description`** — « pour infobulle, en
complément du libellé » — chaque valeur porte : `labels`, `description`,
`icon`/`image` (D283) :

```yaml
category:
  type: enum
  values:
    bronze: { label: { fr: Bronze }, description: { fr: Le niveau d'entrée }, icon: bronze.png }
    silver: { label: { fr: Argent } }
    gold:   { label: { fr: Or } }
  default: bronze
```

**(2) L'ordre de déclaration porte la présentation et le tri** ; le tri
paramétrable — `sort: declaration` (défaut) ou `sort: label` (D380).
**(3) Le stockage dépend de la clé** : **clé numérique → un entier** ;
**clé chaîne → transformée en valeur numérique** — l'optimisation du
stockage, le dictionnaire interne du moteur. **Le point d'attention des
migrations** : « il faudra faire attention lors des migrations avec
l'ajout intercalé d'une valeur » — *(résolution en proposition : le code
interne est **stable**, une valeur insérée au milieu de la déclaration
reçoit un code **nouveau**, jamais une renumérotation — l'ordre de
déclaration régit la présentation, le dictionnaire régit le stockage, la
donnée survit à la réorganisation du fichier ; à consigner au domaine
migrations.)*

**`enum` clos (D388).** Les deux derniers points validés : **(4) la
recherche par le composant** — une liste de sélection du jeu de valeurs
(D228), **multi-sélection en recherche**, `mutualizable` par le libellé
(D369) ; **(5) le nul trié en tête**, et la ligne vide d'un champ
optionnel peut recevoir son libellé via une entrée `null:` dans `values`
(le patron booléen D377). Les dix simples d'origine (D118/D121) sont
détaillés — restent `image`/`thumbnail` (D385) avant les composés.

**`image` et `thumbnail` clos (D389).** Les cinq points validés :
**(1) les dimensions dans le crochet** — `image[1920x1080]`, la boîte
maximale ; l'ajustement **conserve les proportions, jamais de
recadrage** (D293 — le hook D263 pour qui veut recadrer) ; sans crochet,
la boîte par défaut du settings d'instance ; **(2) la vignette
automatique** (D286) aux dimensions du settings d'instance —
**`thumbnail[128x128]` ne garde que la petite taille**, l'image garde la
grande + sa déclinaison ; **(3) `extensions`** : le jeu image par défaut,
restreignable dedans, la forme à libellés (D384) disponible ; **(4)
l'héritage `file` intégral** — quota, métadonnées, déduplication,
recherche nom + mots-clés, tri sur le nom ; **(5) rien d'autre au
champ** — caméra/galerie, visionneuse selon le terminal (D293), rendu
PDF = l'image (D257).

**Le placeholder d'une image : une icône (D390).** **« Le placeholder
d'une image est une icône pour matérialiser le fond d'une image non
définie. »** La propriété du socle (D364) s'interprète par type : la
valeur de démonstration pour le texte et les nombres, **une icône de
fond pour `image` et `thumbnail`** — `placeholder: package.png`, puisée
dans `resources/` (D346), affichée tant que l'image n'est pas déposée.

**Les composés (D391).** La règle générale est actée — **le composé
hérite du kit déclaratif entier de sa base** (crochet, `mask`,
`searchable`, `sort`), **sa validation est intégrée** (Luhn, mod 97, la
conversion faillible D120 — jamais à déclarer), **ses facettes propres
s'ajoutent** — et chacun est arbitré :

1. **`amount`** : les devises autorisées **paramétrables** —
   `currencies: [EUR, USD]` — **défaut : toutes les devises de la norme
   ISO** (D123/ISO 4217).
2. **`percentage`** : **les bornes permises, défaut 0..100** — « mais
   dans certains cas, le % peut être < 0 ou > 100 : **dans ce cas, la
   représentation varie** » (la jauge D274 vaut pour le cadre 0..100 ;
   hors cadre, le composant s'adapte).
3. **`measure`** : les unités autorisées paramétrables, **trois
   régimes** — **statiques** (`units: [kg, g, t]`), **table de
   référence** (`units: stock.unit` — l'adressage D363), ou **libres** ;
   **défaut : libres**.
4. **`phone`** : le numéro **national ou international, paramétrable** —
   **défaut : le national seul**.
5. **`geolocation` — amende D125** : **« le tri s'effectue en fonction
   de la distance (à vol d'oiseau) liée à une focale définie dans la
   configuration »** — **défaut : la localisation courante** (D291),
   sinon **une adresse** (géocodée D294) **ou des coordonnées** ; **la
   recherche trie par la distance entre un point de recherche et la
   valeur**. L'ordre n'est pas intrinsèque — il est **relatif à la
   focale**. **La forme est validée : « le focus de la géolocalisation
   est au champ ou hérité du setting »** — `focus:`, la cascade D360.
6. **`period` hérite du format d'une date/heure** — le crochet temporel
   (D381–D383) : `period[yyyy-mm]`, `period[yyyy-ww]`,
   `period[yyyy-mm-dd, hh:mm]`… début ≤ fin intégré, `range` en usage
   roi.
7. **Le nul de chaque composé se trie en premier** — la règle composée
   prime l'équivalence de la base (l'`amount` nul avant les montants, là
   où le `decimal` nul vaut 0 — D379).

Les autres — `email`, `url`, `vat_number`, `siren`, `siret`, `iban`,
`bic` — vivent de la règle générale : la validation intégrée suffit.

**La géolocalisation : la zone de texte associée (D392).** **« La
géolocalisation, en plus des coordonnées, peut être associée à une zone
de texte »** — l'adresse ou le lieu nommé, porté par la valeur
(alimenté à la saisie ou par le géocodage D294). **« La recherche
mutualisable s'appuie sur cette valeur ; si cette valeur n'est pas
présente, la standardisation des coordonnées en chaîne de caractères
servira pour ce type de recherche. »** La conversion en texte du type
(D369) est ainsi définie : **le texte associé, sinon les coordonnées
standardisées**.

**Le type `communication` (D393 — clos).** **(1) « Pas de visibilité
"maximale" : elle se cale sur les niveaux de confidentialité »** — la
visibilité du fil est portée par la confidentialité (D25, le socle
D364), pas de propriété séparée. **(2) `attachments` peut faire
référence à `file`, `image` ou `thumbnail`** — `attachments: false`
(défaut) ou le type d'attaché, **avec les propriétés vues
précédemment** (extensions, quota, dimensions en crochet — D384/D389)
posées à plat sur le champ. **(3) Amende D295 — la cellule de liste** :
**une communication apparaît comme une petite icône (thumbnail)** ; **au
survol, le ou les derniers échanges sont résumés — la taille est
paramétrable, en nombre de lignes** *(forme en proposition :
`preview: 3`)*. **(4) Non listable** — confirmé (D166) : un canal = un
champ. L'auteur (compte D77) et l'horodatage de chaque message restent
générés, jamais déclarés. **(5) « La recherche porte sur le contenu des
messages »** — `normalized`, `similarity`, `mutualizable` : la
conversion en texte d'un fil est son contenu (D369).

**La référence : l'origine pointe, la destination accède (D394).** **« La
référence est une association entre une entité d'origine et une entité
de destination »** : **l'entité d'origine porte le champ** — le nom de
la référence est chez elle — et **« le lien se fait naturellement et par
sémantique de l'origine vers la destination »** ; « une référence peut
être vue comme une relation parent-enfant (avec un seul enfant) » — la
ligne de D353 : celui qui pointe porte. **« Le lien de la destination
vers l'origine ne fait pas appel à la définition par l'utilisateur d'un
champ dédié : Syncytium doit le proposer »** — **l'accès retour est
automatique**, offert à la destination sans que le technicien ne
l'écrive. *(Ce qui éclaire D216 : la « liste nommée » du 1-N est
l'habillage d'un accès que le moteur possède déjà.)*

**Le filtre de référence : deux régimes et un rapport (D395).** **La
condition de sélection s'évalue depuis l'entité destination** (ses
champs ; l'enregistrement d'origine accessible via **`me.`** — D396). **Le filtre fonctionne à la sélection** ; **le contrôle de
conformité dans le temps est soumis à une option** : soit **la condition
est immuable** — la règle doit tenir (le responsable appartenant à la
même société que l'emploi) ; brisée, « une mise à jour sera à prévoir
pour valider la donnée » — soit **elle est liée à la sélection
seulement** (la semaine d'un calendrier dont le statut évolue au cours
du temps). Et **le filtre sait identifier les éléments qui ne respectent
plus la condition** — modification du filtre, référence à un champ
calculé qui dérive… — **sous forme d'un rapport**.

```yaml
responsible:
  type: hr.employee                  # le raccourci D396 : nom d'entité = référence
  filter: company = me.company       # évaluée depuis la destination ; me. = l'origine
  check: immutable                   # brisée → donnée à valider, rapport
week:
  type: planning.week
  filter: status = "open"
  check: selection                   # défaut — la règle vaut au moment du choix
```

**Le raccourci de la référence et l'accès `me.` (D396).** **« Si le type
est le nom d'une entité, nous considérerons que c'est une référence »** —
`company: hr.company` est la forme courte complète (D356/D363), le `to`
devenant inutile : le type **est** la cible. *(Note en proposition : une
collision de nom entre un type personnalisé et une entité visible =
erreur à l'ingestion — pas d'arbitrage silencieux, l'esprit D344.)* Et
dans le filtre, **l'enregistrement d'origine se lit par `me.`** —
`filter: company = me.company`, « je préfère `me` ou `this` à
`origin` » : les champs nus sont ceux du candidat (la destination),
`me.` est celui qui pointe.

**La référence : les régimes d'écriture, le rapport, le label (D397).**
**(1) « L'écriture via l'API doit être soumise au filtre aussi — sauf si
l'API exprime explicitement le forçage de la valeur »** : le refus
propre est la règle sur tous les canaux, le forçage un acte assumé de
l'appelant *(note : une valeur forcée hors filtre relève du rapport des
non-conformes — D395)*. **(2) Le rythme du rapport est défini dans les
paramètres, au même titre que les autres propriétés du champ** *(forme à
préciser — `report:` en proposition)*. **(3) L'état « à valider » est
porté par le moteur — visible et non bloquant** (jamais la machine à
états déclarée D353). **(4) Les propositions restantes sont validées** :
**`label:` en en-tête d'entité** — un champ ou un gabarit d'expression
(`label: "{code} — {company_name}"`, D90), **défaut : la clé
fonctionnelle** (D357) — le visage textuel servi partout (référence,
sélection, widgets — le pendant de `image:` D386) ; **la recherche
porte sur le libellé affiché de la cible** (`normalized`, `similarity`,
`mutualizable` ; la traversée D226 demeure) ; **le tri sur le libellé
affiché** (D380), nul ≡ chaîne vide ; **le composant** — liste
déroulante à recherche au début de mots et throttling, **choix par
image si la cible désigne son visage** (D386).

```yaml
name: customer
label: { fr: Client }
identity: [code]
title: "{code} — {company_name}"   # le visage textuel (D397, renommé title par D465)
image: logo                        # le visage graphique (D386)
```

**Le stockage de la référence (D398 — clôt la référence).** Les cinq
points validés : **(1) le stockage est l'UUID technique de la cible**
(D142 — l'invariant à vie : il survit au renommage, à l'anonymisation,
à la réactivation ; le squelette référentiel D75/D82) ; **(2) jamais la
clé fonctionnelle** — elle mute, les inactifs la dupliquent (D141) —
**jamais le libellé** — il se recalcule du gabarit (D397) ; **(3) les
frontières traduisent** : l'IHM montre le `label`, **le CSV transporte
la clé fonctionnelle** (l'UUID « non connu, ni exposé » — Q49), l'API
manipule l'UUID ; **(4) l'intégrité** : la cible doit exister à
l'écriture ; la « suppression » étant une désactivation (D141), **une
référence vers un inactif reste valide** — l'histoire tient, la
sélection ne proposant que les actifs ; **pas de cascade sur la
référence** (la cascade appartient à la composition) ; **(5) la
performance au moteur** : dénormaliser le libellé est un choix
d'implémentation **invisible au modèle** (l'esprit D372).

**La composition : le possesseur déclare la liste (D399).** **« La
composition est sur l'entité d'origine — et le type est
`list of <nom de l'entité>`. »** La commande possède ses lignes :

```yaml
# sales/entities/order.yml
name: order
label: { fr: Commande }
fields:
  customer: customer                 # référence (D396) — association libre
  lines:
    type: list of order_line         # la COMPOSITION — la commande possède
                                     # (nom local — même module, D363)
```

**L'enfant ne déclare rien** — l'accès retour (la ligne → sa commande)
est automatique (D394 : Syncytium le propose). La symétrie s'achève :
**la référence pointe un, la composition pointe plusieurs** — le même
geste (l'origine porte le champ), le `list of` (D362) faisant toute la
différence, le nom d'entité disant la cible (D396). *(La proposition
inverse — une facette `composition: true` sur l'enfant — est écartée.)*

**Le trio des liens, et l'imbrication (D400).** **(1) « Oui, c'est la
définition de la composition »** — tout `list of <entité>` est la
possession forte. Et **« pour une association, nous pouvons utiliser
`association with` »** — le trio est complet :

```yaml
customer: customer                    # la RÉFÉRENCE — un, lié (D396/D398)
lines:
  type: list of order_line            # la COMPOSITION — plusieurs, possédés (D399)
tags:
  type: association with catalog.tag  # l'ASSOCIATION — plusieurs, libres (D400)
```

La référence pointe **un**. La composition possède **plusieurs** — la
cascade de vie (désactivation/réactivation D140), l'atomicité de
l'agrégat (D101, la reprise à la racine D111), l'intra-module vérifié à
l'ingestion (D116), les cascades de configuration (D162/D168), la
naissance dans la liste du parent. L'association relie **plusieurs,
librement** — inter-modules permise (D116), sans cascade ni possession,
l'accès retour automatique des deux côtés (D394), **la machinerie de
liaison au moteur** — jamais une entité à construire à la main. **(2)
« L'imbrication est nécessaire sur plusieurs niveaux »** — « facture →
indice → ligne » : les compositions s'emboîtent, **la racine demeure
l'ancre de l'agrégat** — le plancher transactionnel (D101), la
concurrence ancrée à la racine (D111), la cascade de vie de haut en
bas.

**L'association reprend les propriétés de la référence (D401).** **« Dans
le cadre de l'association, nous reprenons les mêmes propriétés qu'une
référence »** : le `filter` évalué depuis la destination avec `me.`
(D395/D396), le `check: selection | immutable` et son rapport des
non-conformes (D395), l'écriture API sous filtre sauf forçage explicite
(D397), l'affichage par le `label` et l'`image` de la cible (D397/D386),
la recherche et le tri sur le libellé affiché, le stockage par UUID
(D398) — **chaque élément lié se comporte comme une référence** ; seule
la cardinalité et la liberté du lien changent (D400).

**La composition et l'association n-aires : le tuple d'entités (D402).**
Les matrices et hypercubes (D134) **se rapportent au lien** — l'exemple
fondateur : des utilisateurs, des modules, des droits. **« Le champ
`modules` de l'entité `user` est de type `list of [module, right]` »** —
chaque élément de la liste est **une combinaison des entités nommées** —
**« avec des propriétés pour chaque entité nommée, comme pour une
composition »** ; et **`association with [module, right]`** pour la
forme libre, les propriétés par entité nommée comme pour une
association. Le kit de la référence (D401) s'applique **à chacune des
entités nommées** :

```yaml
# system/entities/user.yml
modules:
  type: list of [module, right]      # chaque élément = (module, droit)
  module:
    filter: active = true            # le kit de la référence, par entité nommée
  right:
    filter: level <= me.clearance
    check: immutable
```

*(La proposition `by:` — les dimensions par champs de l'enfant — est
écartée : la combinaison EST l'élément.)*

**La cellule du lien n-aire : les champs associés (D403).** **(1)** La
définition prend la forme **`list of [size, color]
{ quantity: integer[0..], name: text, … }`** — le tuple indexe,
**l'accolade porte les champs de la cellule** : « dans les propriétés
associées, nous exploitons **toute la puissance des champs déjà
définis** » — types, facettes, masques, validations, tout le kit du
champ. **« Le moteur prend en charge la modélisation de cet objet de
façon transparente »** — jamais une entité à écrire à la main. *(Notes :
le « string » de l'exemple d'origine se lit `text` — le catalogue D361 ;
la forme éclatée en bloc YAML équivaut à l'accolade quand les champs
s'enrichissent — l'esprit D352.)* **(2) « Une cellule par combinaison de
clé de la liste ou de l'association »** — l'unicité est **structurelle**,
garantie par le moteur sur le tuple entier, pour les deux formes du
lien.

```yaml
# stock/entities/item.yml
cells:
  type: list of [size, color] { quantity: integer[0..] }   # la matrice (D134)
```

**Le bloc `validation:` au niveau de l'entité (D404).** **« `validation:`
est au même niveau que `fields:` dans la configuration »** — les règles
de l'enregistrement (celles qui croisent plusieurs champs) vivent dans
un bloc d'entité, frère de `fields:` :

```yaml
name: customer
fields:
  satisfaction: percentage
  category: { type: enum, values: { bronze: …, gold: … } }
validation:
  - satisfaction >= 50 if category = "gold"   # la règle de l'enregistrement
```

**Confirmé : « la validation est possible sur un champ ou sur une
entité. »** Le champ garde ses règles locales (D364 — le `matches` d'un
code postal), l'entité porte les règles croisées ; la trace D307 cite le
niveau qui a refusé.

**L'association conditionnelle : l'accès retour déclaré (D405).** **« Il
manque un champ dans `customer` pour matérialiser la liste des
commandes »** — la forme :

```yaml
orders: association with order if order.customer = me
```

**L'`if` fait l'association dérivée** : la condition définit
l'appartenance — les commandes dont le champ `customer` est
l'enregistrement courant (`me`, D396). C'est **la vue dérivée navigable
de D136**, enfin déclarative : **jamais stockée** (la vérité reste la
référence N-1 — D136/D398), **en lecture** (on n'édite pas une
condition, on édite la référence qui la fonde), servie par la machinerie
que le moteur possède déjà (D394). Le nom déclaré (`orders`) sert
partout — `computed: count(orders)`, les surfaces, les chemins (D71).
*(Sans `if`, l'association reste stockée et libre — les `tags` de D400 ;
l'`if` départage les deux natures. Le trou n° 2 de la contre-passe — le
nom de l'accès retour — se referme : le nom vient de la déclaration.)*

**Le rapport des non-conformes : rythmes et destinataires (D406).**
**« Il faudra pouvoir affecter les rapports à un utilisateur ou un
groupe, sous forme de mails ou de notifications »** — l'infrastructure
existante (D108–D110 : canaux, profils) et les groupes (D26–D27)
servent. La forme consolidée est **validée** (« cette forme me
convient ») :

```yaml
advisor:
  type: hr.employee
  filter: company = me.company
  check: immutable
  report:
    when: [migration, weekly]     # les rythmes automatiques, cumulables —
                                  #   migration (défaut) | continuous | daily | weekly | monthly
    to: [quality_team, aymeric]   # un groupe (D26) ou un utilisateur
    by: [mail, notification]     # les canaux (D108–D110)
```

**L'à-la-demande existe toujours** (l'écran du technicien), rien à
déclarer. *(Notes : la résolution des noms de `to` — groupe d'abord,
utilisateur ensuite, collision = erreur d'ingestion, l'esprit D344.)*

**Le `report` en cascade (D407 — amende D406).** **« Le report peut
être paramétré au niveau de l'instance, du module, de l'entité ou du
champ »** — la cascade des settings (D348–D349/D360) : le plus proche
l'emporte, chaque étage raffine le précédent. **Le défaut : le rapport
existe — à la demande, vers l'administrateur** (D29) : sans `when`,
aucun rythme automatique implicite (en déclarer un l'ajoute) ; sans
`to:`, l'administrateur de l'instance. **Et `report: no` est l'exclusion
explicite** — « pour ne pas déclencher de rapport », posable à
n'importe quel étage (l'opt-out local de la cascade). *(Le premier
défaut consigné — « report: no par défaut » — est écarté par revirement
de l'auteur.)*

**Le nom du type est la clé — les hooks sans le mot « hook » (D408).**
**« Tous les types que nous venons de voir ont des propriétés
communes : le nom du type est la clé. »** L'espace de noms des types est
**un** : le catalogue de base (réservé — D360), les types personnalisés
(D359), les entités (la référence par le nom — D396), et **les hooks de
type, qui ajoutent de nouveaux noms dans Syncytium** — **« exploitables
et déclarables comme les types standard »**. **« Le mot-clé `hook` ne
doit pas apparaître »** : pas de `type: hook.<nom>` (ma forme est
écartée) — le champ écrit `progress_ring: gauge_3d` comme il écrirait
`text` ; **l'usage est indistinguable, seule la déclaration du hook (le
contrat, le code) relève du domaine 6**. Et la pointe finale : **« pour
aller plus loin, tous les types proposés sont finalement des hooks qui
appartiennent à Syncytium »** — le catalogue de base est **l'ensemble
des hooks que Syncytium embarque** : un seul mécanisme de bout en bout
(la ligne D52 — interne et externe uniformes), le moteur mange sa propre
cuisine ; « réservé » (D360) signifie simplement que ces noms-là sont
déjà pris par les hooks de la maison. *(L'unicité de l'espace de noms
durcit la règle de collision : tout doublon de nom entre catalogue,
personnalisés, entités et hooks = erreur à l'ingestion — D344/D396.)*

**Le type `counter` (D409).** Les compteurs du modèle (D154–D155)
reçoivent leur écriture — le kit livré : **`type: counter`**, géré par le
moteur (allocation **dans la transaction**, échec = numéro non consommé,
unicité et **continuité** — l'exigence comptable) ; **`format:`** le
gabarit (D90/D155) aux segments calendaires et au segment compteur
masqué (`{counter:000000}` — le `0` du nombre D370) ; **« la
réinitialisation doit être définie sur la déclaration »** — `reset:`
explicite (`yearly`, `monthly`… — les déclencheurs calendaires D54/D155,
la cascade par déclaration ; *défaut en proposition : `never`, la
séquence continue* ; ma déduction depuis le gabarit est écartée) ;
**jamais saisi** (`write-once` de fait), candidat naturel à l'identité.
Et l'arbitrage de l'auteur : **« par défaut, le compteur est attaché au
champ ; mais il est possible de le mutualiser sur plusieurs champs dans
plusieurs entités »** — **`counter` = la séquence propre au champ,
`counter[my_counter]` = le compteur nommé partagé** (le crochet nomme —
le patron `mutualizable[name]`, D367).

```yaml
# sales/entities/invoice.yml
number:
  type: counter[accounting]              # la séquence partagée « accounting »
  format: "FAC-{year}-{counter:000000}"
  reset: yearly                          # défini sur la déclaration
# sales/entities/credit_note.yml
number:
  type: counter[accounting]              # la même séquence — la chronologie commune
  format: "AVR-{year}-{counter:000000}"
  reset: yearly
```

**L'artefact de clôture du bloc `fields` (D410).** Validé (« oui »),
avec les deux virgules actées : **le défaut `reset: never`** (la
séquence continue) et **le compteur nommé déclaré au `settings` de
l'étage englobant** (module si partagé dans le module, version au-delà —
la cascade D360), le champ gardant son `format:` propre. Les deux
fichiers canoniques :

```yaml
# sales/entities/customer.yml
name: customer
label: { fr: Client }
comment: { fr: Les clients de la société }
inheritance: third_party             # l'enfant pointe (D353) — les états sur le parent
identity: [code]                     # la clé fonctionnelle (D357)
title: "{code} — {company_name}"     # le visage textuel (D397 → title, D465)
image: logo                          # le visage graphique (D386)

fields:
  code:
    type: text
    mask: "C-999999"                 # taille et lignes déduites (D366)
    mode: write-once
    label: { fr: Code client }
  company_name:
    type: text[80]
    required: true
    searchable: mutualizable[who]    # la recherche partagée (D368)
    label: { fr: Raison sociale }
  notes: text                        # la forme courte — auto (D356/D366)
  employees: integer[0..]            # positif, octets auto (D372)
  revenue:
    type: amount
    currencies: [EUR]                # composé dérivé (D391)
    confidentiality: protected
  satisfaction: percentage           # 0..100 → jauge (D391)
  active:
    type: boolean
    required: true                   # deux états (D377)
    default: true
  created: datetime[timestamp]       # instant UTC (D381)
  logo:
    type: image[512x512]             # boîte max, vignette auto (D389)
    placeholder: company.png         # l'icône de fond (D390)
  category:
    type: enum
    values:
      bronze: { label: { fr: Bronze }, icon: bronze.png }
      silver: { label: { fr: Argent } }
      gold:   { label: { fr: Or } }
    default: bronze                  # stockage numérique (D387)
  headquarters: geolocation          # focale + texte associé (D391–D392)
  progress: progression              # type personnalisé (D359) — un hook (D408)
  advisor:
    type: hr.employee                # la référence (D396)
    filter: company = me.company     # depuis la destination (D395)
    check: immutable                 # report défaut : à la demande → administrateur (D407)
  tags:
    type: association with catalog.tag                     # l'association stockée (D400)
  orders: association with order if order.customer = me    # la vue dérivée (D405)
  total_orders:
    type: integer
    computed: count(orders)          # s'appuie sur la vue (D405)

validation:
  - satisfaction >= 50 if category = "gold"   # les règles de l'enregistrement (D404)
```

```yaml
# sales/entities/order.yml
name: order
label: { fr: Commande }
identity: [number]
title: "{number}"

fields:
  number:
    type: counter                        # la séquence propre au champ (D409)
    format: "CMD-{year}-{counter:000000}"
    reset: yearly
  customer: customer                     # référence, nom local (D396)
  lines:
    type: list of order_line             # la composition (D399), imbricable (D400)
  discounts:
    type: list of [product, season] { rate: percentage }   # le n-aire (D402–D403)
```

**La contre-passe est soldée** — les sept familles vérifiées, les trois
trous refermés (l'accès retour déclaré D405, `report:` D406–D407, les
hooks sans le mot D408), le compteur entré au catalogue (D409). **Le
bloc `fields` est clos** — sous la règle générale du chantier : la
complétude finale s'appréciera après tous les domaines.

**L'historisation : les valeurs de `history` (D411).** L'écriture
déclarative de D168–D174 s'ouvre — **« la propriété `history` d'une
entité porte aussi sur les agrégations »** (l'instantané d'agrégat
D169 : les enfants de composition suivent la racine). Les valeurs :

- **`perpetual` (ou `true`)** — conserve **toutes les modifications
  depuis la création** de l'enregistrement — le défaut du mode activé ;
- **`false`** — **aucun historique** (désactive) ;
- **`temporal[x]`** — l'historique sur **une période de `x` jours** ;
- **`update[x]`** — l'historique sur **les `x` dernières
  modifications**.

Le crochet-paramètre (D366) porte la rétention.

```yaml
# sales/settings.yml — l'étage module (la cascade D168)
history: temporal[730]           # deux ans glissants pour tout le module
# sales/entities/customer.yml — la surcharge d'entité
history: perpetual               # le client garde tout
# sales/entities/draft_note.yml
history: false                   # l'opt-out (D168)
```

*(Articulation avec D168 — lecture consignée : `history` **absent** =
inactif, le défaut D168 inchangé ; **activé sans précision** (`true`) =
`perpetual`. Reste à écrire : la `visibility:` par groupe (D170).)*

**La lecture à date hors couverture : la règle canonique (D412 — amende
D174).** **« La propriété `assume_current` n'est pas utile. »** À la
place, une règle universelle pour toute lecture à date sur une entité
**non historisée ou non couverte** (au-delà de la rétention D411) :

1. **date postérieure à la création** → la requête délivre **« l'état à
   la dernière valeur connue avant l'horizon de l'historique »** —
   l'entité non historisée sert sa valeur courante (la seule connue), la
   rétention dépassée sert son plus ancien instantané retenu : la
   dégradation est **graduelle et déterministe** ;
2. **date antérieure à la création** → **la requête ne retourne rien**
   (l'enregistrement n'existait pas).

*(La propriété d'anticipation de D174 disparaît — la règle canonique
vaut anticipation universelle : le comportement est défini, plus rien
n'est subi en silence ; l'alerte à la validation du schéma perd son
objet — note.)*

**La forme riche de `history` : la visibilité (D413 — clôt l'écriture
de l'historisation).** Validée (« oui, on valide ») :

```yaml
history:
  mode: temporal[730]          # la valeur D411 (perpetual, false, temporal[x], update[x])
  visibility: [managers]       # les groupes qui voient l'historique (D26/D170)
```

La **forme courte** demeure (`history: temporal[730]`) quand la
visibilité suit simplement la confidentialité de l'entité (D170).
**L'écriture de l'historisation est complète** : les valeurs (D411), la
lecture hors couverture (D412), la visibilité (D413) — le fond D168–D174
a son format.

**Les groupes : `groups.yml` et la hiérarchie acyclique (D414).**
L'écriture des groupes versionnés (D341) : **`groups.yml` à la racine du
dossier de version** — les groupes sont **transverses aux modules** —
référencé par le fichier d'entrée (`groups: groups.yml`, le patron
D349), externalisation libre (D352). **Le mapping ordonné** clé →
`labels`/`comment`/`description` (le patron D387) — **le nom est la
clé**, cité tel quel partout (confidentialité D25–D27, `visibility`
D413, `to:` des rapports D406). **Rien d'autre dans la description** :
les affectations restent en base (D27/D341), la doctrine de suppression
tient (D34). Et **« la hiérarchie de groupes est requise, à condition
qu'il n'y ait pas de cycle »** — l'acyclicité vérifiée à l'ingestion
(erreur — l'esprit D344, le garde-fou D135). **La forme, corrigée par
l'auteur : « l'organisation ne se fait pas via un lien parent — un
groupe est constitué d'autres groupes »** — le contenant déclare ses
constituants (la ligne D399 : le possesseur déclare) :

```yaml
# groups.yml
groups:
  accounting:
    label: { fr: Comptables }
  sales_team:
    label: { fr: Équipe commerciale }
  managers:
    label: { fr: Encadrement }
    groups: [accounting, sales_team]   # constitué d'autres groupes
```

*(La constitution par liste règle les deux notes : la
**multi-appartenance est naturelle** — un groupe cité dans plusieurs
contenants — et le sens est fixé — **le membre d'un constituant est
membre du contenant** : la visibilité accordée à `managers` atteint
comptables et commerciaux.)*

**`modules.yml` : la liste des modules (D415).** **« Le fichier
`<version>/modules.yml` décrit la liste des modules. Il fait le lien
avec les fichiers `module.yml` présents dans chaque module
fonctionnel. »** La racine de version porte donc **la liste explicite**
des modules — pas de découverte implicite par les dossiers : la ligne
de D320/D363 (les fichiers d'entrée listent ce qui est inclus,
l'arborescence physique reste libre) — chaque entrée pointant le
`module.yml` du module (D347).

**Les modules fonctionnels = les modules (D416).** La clarification
tranche par **l'unification** : **un seul concept**. Le module structure
la donnée **et** l'expérience — son `menu.yml` (D351) **est** le menu du
module fonctionnel (D193), sa page d'accueil est celle de D191,
**l'affectation utilisateur ↔ module** est l'acte d'administration
(D210/D341), la restriction de surface sans extension de droits (D190)
est la sienne, le bandeau gauche (D191) choisit entre les modules. La
distinction terminologique de D190 (« le module structure la donnée, le
module fonctionnel structure l'expérience ») est **dissoute** — les
décisions passées se lisent en y remplaçant « module fonctionnel » par
« module ». Le creux de l'arborescence disparaît : `modules.yml` (D415)
liste **ces** modules-là. *(Note : le menu d'un module peut citer des
entités d'autres modules — les associations inter-modules restent
libres, D116.)*

**Le composé `uuid` (D419).** « Dans les types de base, a-t-on le type
UUID ? » — non : **l'UUID interne est hors déclaration** (D142/Q49, la
famille 7 du bloc `fields`). Pour **les identifiants venus d'ailleurs**
(systèmes tiers, clés externes D178), **`uuid` entre aux composés** :
base `text`, **validation intégrée** (le format canonique 8-4-4-4-12,
la casse normalisée), **stockage compact au moteur** (16 octets
binaires, jamais la chaîne — l'esprit D372), recherche
`strict`/`mutualizable` par la forme texte (D369), tri sur la forme
canonique, nul ≡ chaîne vide (D379). **La frontière demeure** :
l'identité technique interne reste invisible et non typée dans les
fichiers.

```yaml
external_id:
  type: uuid                       # l'identifiant d'un système tiers
  mode: write-once
```

**Le raffinement d'agrégat écarté (D420 — ouvre et clôt le point 5 du
domaine 3, amende D101/D133).** La proposition `refine:` est examinée
puis **écartée** : **« par nature, une composition est indivisible, le
parent ne peut pas être réaffecté ; une association fait que chaque
item vit sa vie et peut changer de propriétaire »** — la distinction
est **déjà portée par le mot-clé** (`list of` vs `association with`).
Le raffinement transactionnel de D101 (« ligne seule si le modèle
l'autorise ») **n'existe plus** : **l'agrégat est toujours le grain
d'écriture** — la mise à jour d'un enfant reprend la racine (D192, la
règle unique), la concurrence par champ (D111) et l'échelle TPE (D15)
rendant le grain fin sans objet. Et ce que « refine » visait de
légitime **est le `filter`** (D395/D401) : « une condition qui filtre
les items faisant partie d'une association, en plus du lien entre les
deux entités — le terme qui s'approprie le plus est `filter` » — déjà
acquis, aucun mot-clé nouveau.

**La condition de mise à jour : une affaire d'entité (D421).** **« La
condition de mise à jour porte sur l'entité et non sur l'association ou
la composition »** — le cas « brouillon » trouve son foyer : une
propriété d'en-tête d'entité, en proposition **`update:`** (expression
D90 sur l'enregistrement) :

```yaml
# sales/entities/order.yml
name: order
update: status = "draft"        # la commande n'est modifiable qu'en brouillon
```

*(Articulations en proposition : **(a)** condition fausse = lecture
seule de fait — les écrans grisent, l'API refuse proprement + trace
(D307) ; **(b)** le grain agrégat (D420) : la condition de la racine
couvre ses compositions — ajouter, modifier ou retirer une ligne, c'est
modifier l'agrégat ; l'enfant peut porter la sienne en plus (la
navigation vers le parent : `update: order.status = "draft"`) ;
**(c)** **les opérations déclarées passent outre** — le chemin
explicite sous ses propres `when`/`rights` : « valider » agit sur la
commande que la condition verrouille, la ligne D354 — le retour par
l'acte explicite, jamais par l'édition libre.)*

**Le statut d'état couvre le CRUD entier (D422 — élargit D421).** Le
cycle de vie rejoint la condition de mise à jour (« selon le cycle de
vie, nous pourrons mettre un statut de modification ») — et **« le
statut ne porte pas que sur la modification : il concerne tous les
éléments du CRUD — Création d'un sous-composant, Lecture/consultation
de l'enregistrement, mise à jour et suppression. »** La forme en
proposition — **chaque état du cycle porte ses droits** :

```yaml
fields:
  status:
    type: enum                     # le champ porteur du cycle de vie
    values:
      draft:     { label: { fr: Brouillon }, allow: [create, read, update, delete] }
      confirmed: { label: { fr: Confirmée }, allow: [read] }
      archived:  { label: { fr: Archivée },  allow: [read] }
    default: draft
```

**Le nom de la propriété : `allow` (arbitrage de l'auteur)** — « plutôt
que les mots update, create, read ou delete, je propose `allow`, qui
permet de définir l'une ou l'autre des valeurs ou des combinaisons de
ces dernières. » Toute combinaison se déclare — `allow: [read, delete]` :
l'état qui se consulte et se purge, mais ne se modifie plus.

**Les deux formes conservées, exclusives (D423 — clôt D421/D422).**
« Dans un grand nombre de situations, le cycle suffira… mais il existe
quelques cas particuliers qui peuvent nécessiter une forme libre. **Pour
éviter de faire un hook inutile, je préfère conserver les 2
possibilités. Par contre, le technicien devra choisir entre l'un ou
l'autre — les 2 simultanément ne seront pas autorisés** » (erreur à
l'ingestion, D344). Un seul mot pour les deux mécanismes — la forme en
proposition :

```yaml
# LE CYCLE : allow par état (D422)
fields:
  status:
    type: enum
    values:
      draft:    { allow: [create, read, update, delete] }
      archived: { allow: [read, delete] }

# OU LA FORME LIBRE : le bloc allow d'en-tête, verbe → expression (D90)
name: order
allow:
  update: locked = false
  delete: false
```

*(Le `update: <expression>` de D421 se fond dans ce bloc — un nom
unique, `allow`, deux foyers exclusifs.)*

**Le cycle de vie : `states` désigne le porteur (D424).** Le focus de
l'auteur sur le cycle de vie tranche le creux du champ porteur :
**« un état hiérarchique est déjà un statut »** — l'entité à hiérarchie
(D353) a son statut dans ses positions, rien à cumuler. **« Dans le cas
d'une entité sans état hiérarchique, nous pouvons réutiliser le bloc
`states` pour préciser le champ ayant un type énuméré, pour
matérialiser le cycle de vie »** :

```yaml
# sales/entities/order.yml — entité sans hiérarchie
name: order
states: status                   # le champ énuméré porteur du cycle de vie
fields:
  status:
    type: enum
    values:
      draft:     { label: { fr: Brouillon },  allow: [create, read, update, delete] }
      confirmed: { label: { fr: Confirmée },  allow: [read] }
      archived:  { label: { fr: Archivée },   allow: [read, delete] }
    default: draft
```

**Un seul statut par entité, deux sources** : la hiérarchie (le bloc
`states:` du parent, D353) ou le champ énuméré désigné
(`states: <champ>` — la désignation, le patron `image:`/`label:`).
*(Notes en proposition : `states:` désignant un champ non énuméré =
erreur d'ingestion ; hiérarchie et champ désigné ensemble = erreur — un
seul statut ; la naissance = le `default` de l'énuméré.)*

**Le graphe déclaré et le `promote` en tableau (D425).** La logique des
états hiérarchiques (D353–D355) **se transpose mot pour mot** à
l'énuméré-cycle : chaque valeur déclare ses passages — le graphe se
lit, le moteur refuse tout passage hors graphe, l'ingestion attrape
l'opération incohérente. Et l'arbitrage de l'auteur : **« le `promote`
est un tableau, car nous pouvons avoir le choix entre plusieurs
états »** :

```yaml
values:
  draft:
    label: { fr: Brouillon }
    allow: [create, read, update, delete]
    promote:
      - { to: confirmed, when: operation.confirm }
      - { to: cancelled, when: operation.cancel }
  confirmed:
    allow: [read]
    promote:
      - { to: shipped, when: operation.ship }
    demote:
      - { to: draft }              # le retour — action explicite seule (D354)
  shipped:
    allow: [read, delete]
```

*(Notes en proposition : `demote` en tableau par symétrie — plusieurs
retours possibles ; deux `when` vrais au même instant → **l'ordre du
tableau départage**, la première entrée déclarée gagne — l'esprit du
mapping ordonné D356 ; le cliquet D354 inchangé — la première vraie
franchit, le retour explicite. Le tableau vaut pour **les deux
sources** : la hiérarchie D353 s'aligne.)*

**Le `when` facultatif et le composant navigateur du graphe (D426 —
clôt le focus cycle de vie).** Les trois virgules sont validées (« les
3 points me vont ») : **`demote` en tableau**, **l'ordre du tableau
départage** les `when` simultanés, **la naissance libre** (D355
transposé — l'import et l'API peuvent poser un état à la création). Et
la précision de l'auteur, en deux temps : **« le `when` est facultatif —
sans préciser le `when`, cela doit influer le fonctionnement du
composant graphique de sélection d'une valeur de la liste énumérée, en
ne sélectionnant que les états suivants (`promote`) autorisés »** ; et
**« la présence du `when` marquera une opération (un bouton ou une
action) »**. Les deux régimes d'une transition :

- **sans `when`** — la transition **libre** : le composant du
  champ-cycle devient **un navigateur du graphe** — la liste déroulante
  n'offre que la valeur courante et les cibles `promote` atteignables
  depuis l'état courant, sous les droits ;
- **avec `when`** — la transition **marque une opération** : un bouton
  ou une action porte le passage (le chemin nommé, tracé), le `when` en
  est la garde — la sélection libre ne l'offre pas.

Le retour (`demote`) reste un chemin explicite (D354), jamais la
sélection libre.

**Et le composant du statut se déduit de la déclaration** : **« liste
de valeurs dont la liste dépend de l'état — ou un champ non modifiable
avec des boutons ajoutés sur l'interface pour matérialiser le champ
d'état »** — les transitions libres (sans `when`) font la liste
déroulante-navigatrice ; les transitions-opérations (avec `when`) font
le champ en lecture avec ses boutons ; un graphe mixte combine les
deux. La forme n'est jamais déclarée : elle se lit dans le graphe
(l'esprit D366 — le déduit plutôt que le déclaré).

**Le triptyque du `when` (D427 — solde l'articulation avec D354).**
**« Le `when` peut faire référence à une opération ou à une
condition »** — les trois régimes d'une transition, complets :

| Déclaration | Régime | Surface |
|---|---|---|
| sans `when` | **libre** | la liste navigatrice du graphe |
| `when: <opération>` | **l'acte** | **un bouton** (« nous allons y venir » — les opérations) |
| `when: <expression>` | **l'automatisme** | aucune — **le cliquet D354 intact** : « déduit d'un élément de l'entité via une condition utilisant le langage d'expression (`count(orders) > 0`) » |

Le prospect devient client à la première commande **sans geste** ;
la commande se confirme **par le bouton** ; le brouillon s'annule **à la
sélection**. Trois écritures, trois vécus — un seul graphe. *(Raffiné
par D428 : la nature de l'opération nommée se lit dans sa propre
déclaration.)*

**L'opération porte sa nature : le `when` la rend automatique (D428 —
raffine D427).** Les deux exemples de l'auteur :

```yaml
promote: [ { to: confirmed, when: count(lines) > 0 } ]
  # → OPÉRATION AUTOMATIQUE — « l'abréviation de l'opération » :
  #   le moteur la matérialise, elle se déclenche seule (le cliquet)

promote: [ { to: confirmed, when: confirm } ]
  # → « confirm » EST l'opération — sa nature se lit dans SA déclaration :
operations:
  confirm:
    label: { fr: Confirmer }    # SANS when → un bouton / une fonction API
    rights: [sales_team]         #   — l'acte explicite qui déclenche l'action
  archive:
    when: age(updated) > 365     # AVEC when → une opération AUTOMATIQUE
```

**« Si présence de `when`, cela sera une opération automatique ; si
`when` est manquant, ce sera un bouton / une fonction API déclenchant
l'action. »** Le `when` d'une opération est donc **son déclencheur
automatique** — jamais une simple garde ; l'expression en ligne dans un
`promote` est **l'abréviation** d'une opération automatique anonyme.

**La trace des actions : l'historisation (D429).** **« Les actions sont
tracées si l'entité possède un historique »** — la trace des opérations
**monte sur l'historisation** (D411–D413) : l'entité historisée
photographie chaque acte dans ses instantanés (l'auteur, le canal, le
motif — D169) ; **sans historique, pas de trace d'opération**. Aucune
machinerie de trace séparée.

**La garde du bouton : le `if` au graphe (D430).** Le bouton
conditionné s'écrit **dans le graphe**, avec le `if` du langage
(D306) :

```yaml
promote: [ { to: confirmed, when: confirm if count(lines) > 0 } ]
```

**Le passage par l'opération n'est légal que si la condition tient** —
le bouton se grise sinon, l'API refuse proprement (D307). Aucune
propriété nouvelle : le `when` de l'opération reste le déclencheur
automatique (D428), la garde vit là où la transition vit. *(Les
alternatives — `enabled:` dédié, la validation au clic — sont
écartées.)*

**La confirmation par défaut : `validate` (D431).** Le patron de D196
(le formulaire en lecture seule + confirmer/annuler, jamais de popup)
généralisé aux opérations — **la propriété se nomme `validate`**
(« validate me convient mieux que confirm » — le mot ne collisionne
plus avec une opération nommée `confirm`) et **le défaut s'inverse :
`validate: true` est le défaut** ; **`validate: false` doit être déclaré
pour un passage automatique en cliquant sur le bouton** — l'exécution
directe est l'exception assumée, la relecture avant engagement est la
règle. *(Note : les opérations automatiques — avec `when`, D428 — ne
sont pas concernées : personne ne clique.)*

**Le bloc `operations:` (D432 — clôt les opérations).** Les quatre
points validés : **(1)** `operations:` **au même niveau que `fields:`
et `validation:`** — mapping ordonné, l'ordre de déclaration = l'ordre
des boutons ; **(2)** **jamais d'effet d'état** — la transition
appartient au graphe (D425–D430) ; l'opération citée par aucun
`promote`/`demote` est une action sans transition (générer, recalculer,
notifier) — légitime ; **(3)** **`effects:` ordonnés** — `notify:` (la
forme `to`/`by`, D406), `document:` (le gabarit PDF, D212), `set:`
(l'affectation de champs), et **`function:` — « l'appel d'une fonction
interne à Syncytium, présente dans un catalogue ou dans une liste de
fonctions fournie en hook »** (D36/D301/D408) ; **(4)** **disponible
partout par défaut** (bouton de liste et de formulaire, API, sortie de
wizard D233) — **« possibilité de préciser que l'opération ne soit pas
disponible dans l'une ou l'autre des interfaces (un écran ou l'API) »**
*(forme en proposition : `except: [api]`)* ; le passe-outre des `allow`
demeure (D421c).

```yaml
operations:
  confirm:                        # sans when → bouton / fonction API (D428)
    label: { fr: Confirmer }
    rights: [sales_team]          # les groupes (D196/D414)
    validate: false               # l'exécution directe — la relecture est le défaut (D431)
    effects:
      - notify: { to: [logistics], by: [notification] }
      - document: order_form
      - function: recompute_totals   # le catalogue ou un hook (D432)
    except: [api]                 # indisponible côté API (proposition)
  archive:
    when: age(updated) > 365      # avec when → automatique (D428)
    effects:
      - set: { archived_at: now() }
```

**Le changement d'état, opération du catalogue — Q60 ouverte (D433).**
**« Une opération ne servira pas uniquement à un changement d'état. Un
changement d'état est une des opérations disponibles au catalogue — et
c'est l'opération par défaut. »** La ligne D408 s'étend aux
opérations : **le catalogue d'opérations embarqué**, le changement
d'état en tête (l'opération qu'un `promote` invoque sans autre
précision) — les effets (notify, document, set, function) ayant
vocation à s'y ranger. **« Je propose que nous fassions un point
ultérieurement sur l'ensemble des fonctions à mettre au catalogue »** —
**Q60 ouverte** (l'inventaire du catalogue, §10).

**Le calendaire riche : `every:` (D434).** Le rythme d'évaluation des
opérations automatiques temporelles — **« le calendaire est plus
riche »** :

- **les durées** : `every: 5min` / `2h` / `2d` / `2w` / `1m` (minutes,
  heures, jours, semaines, mois) ;
- **les raccourcis** : `daily`, `weekly`, `monthly` ;
- **le crochet précise le(s) moment(s) de déclenchement** (le
  paramètre en ligne, D366) — **les heures en UTC du serveur** :
  `daily[08:00]` (tous les jours à 8 h), `weekly[tuesday at 15:30]`
  (les mardis à 15 h 30), **et les moments multiples** :
  `weekly[monday at 09:30:45, wednesday at 20:35:12]` — le `at` du
  langage (D301).

```yaml
archive:
  when: age(updated) > 365
  every: daily[02:00]           # évaluée chaque nuit à 2 h UTC
  effects: [ set: { archived_at: now() } ]
```

*(Notes en proposition : sans crochet, le moment est au moteur ; le
vocabulaire vaut partout où un rythme se déclare — le `when:` du
rapport D406 s'aligne.)*

**`every: continuous` (D435 — complète D434).** Le rythme des données :
**`continuous` signifie « à chaque mise à jour d'un enregistrement de
l'entité »** (les événements de données, D54) — **le même mot que le
rapport** (D406), le vocabulaire unifié (« on garde continuous »).
**Et il est le défaut** : `every:` absent = `continuous`. *(Note :
l'expression temporelle (`age(…)`) exige, elle, son rythme calendaire
déclaré — le défaut continu ne la réveillerait qu'aux écritures.)*

**Les notifications soldées, le `mode` d'exécution (D436 — couvre les
points 3 et 4 du domaine 3).** **(1) Les notifications : « pour le
moment, je ne vois pas de nouveaux éléments »** — le point se solde
**par simplification** : l'opération automatique + l'effet `notify:`
(D406/D432) couvre l'événement de données, le calendaire et l'acte ; le
rapport (D406–D407) et la communication (D393) ont leurs canaux. **(2)
Les tâches : `mode` plutôt que `background`**, à trois valeurs :

- **`synchronous`** — « met en pause l'interface avec une barre de
  progression et attend la fin du traitement » ;
- **`asynchronous`** — « l'opération est enregistrée et déclenchée dès
  que le serveur est en mesure de la traiter » (la file d'attente
  D24/D55 : état, progression, résultat conservé) ;
- **`await[…]`** — « décaler, le crochet décrivant le décalage avant le
  lancement » : `await[+3h]`, `await[+2d at 08:00]` — le `+` relatif,
  le `at` du calendaire (D434).

```yaml
purge_archives:
  rights: [administrator]
  mode: await[+2d at 02:00]     # enregistrée, lancée dans deux jours à 2 h
  effects: [ function: purge ]
```

*(Note en proposition : le défaut = `synchronous` — le clic classique ;
la supervision D56 suit l'asynchrone et le décalé.)*

**Le domaine 4 ouvert — l'ancrage des surfaces : le bloc `gui` et les
trois étages (D437, nom arbitré par D438).** Le périmètre en huit points est validé (« le
plan me convient ») ; le point 1 s'arbitre : **« les cinq blocs sont à
positionner dans un bloc »** — nommé **`gui`** (D438) (`lists`, `forms`, `summary`,
`charts`, `widgets`), et **la complexité se sert par étages** :

1. **Les entités les plus simples : pas de configuration requise** —
   les défauts D186 servent l'application entière (le pilier P4) ;
2. **Les petites entités, un peu de personnalisation : un seul
   fichier** — le bloc `gui` en ligne dans `customer.yml` ;
3. **Les entités complexes : un dossier**, un fichier par bloc —
   `entities/customer/` contenant `entity.yml`, `lists.yml`,
   `forms.yml`, `summary.yml`, `charts.yml`, `widgets.yml`…

```yaml
# étage 2 — le fichier unique
# sales/entities/customer.yml
name: customer
fields: { … }
gui:
  lists:
    main: { label: { fr: Les clients } }
  summary:
    fields: [company_name, category]

# étage 3 — le dossier
# sales/entities/customer/entity.yml
name: customer
fields: { … }
gui:
  lists: lists.yml               # les références explicites (D320/D415)
  forms: forms.yml
  summary: summary.yml
```

*(Le nom est tranché par D438 : **`gui`** ; le pattern du module
s'adapte au dossier d'entité — `- entities/*.yml` et
`- entities/*/entity.yml`.)*

**Le point 1 du domaine 4 clos (D438).** Les quatre virgules validées :
**(1) le bloc se nomme `gui`** (« gui me convient » — l'anglais D335) ;
**(2) la première déclarée est la surface par défaut** (l'ordre du
mapping D356 — la première liste est celle du menu, le premier
formulaire celui de la fiche) ; **(3) le socle des surfaces s'appuie
sur le patron des champs** (`label`/`comment`/`description` — « nous
avons défini ce qu'il faut, sauf oubli ») ; **(4) la déclaration
remplace le défaut** — « dès qu'un item est déclaré, le défaut proposé
par le système n'est plus disponible ».

**Le menu : la syntaxe d'adressage (D439).** Ma proposition de blocs
typés est écartée — la vision de l'auteur : **le menu reste une liste
d'entrées ordonnées** (l'ordre de déclaration), **filtrée par le niveau
de confidentialité** — « ça ne change pas » ; le défaut affiche les
entités (la visibilité de l'entité et sa liste par défaut). **Chaque
entrée est une adresse** :

| Adresse | Cible |
|---|---|
| `<module>.<entité>` | **la liste par défaut** de l'entité |
| `<module>.<entité>[<liste>]` | une **liste nommée** de l'entité |
| `<module>.<entité>.<opération>` | **le déclenchement d'une opération** |
| `<module>.<entité>[+<formulaire>]` | **un formulaire de création** — le nom optionnel (`[+]` = le défaut) |
| `<module>.<entité>[@<wizard>]` | **un wizard** — le nom optionnel |
| `<module>[<dashboard>]` | **un dashboard** — « défini au niveau du module » |
| `<nom>:` + liste | **un sous-menu** — le nom référence **un libellé déclaré au niveau du module** |

```yaml
# sales/menu.yml
menu:
  - sales.customer                 # la liste par défaut
  - sales.order[pending]           # la liste nommée
  - sales.order[+]                 # le formulaire de création par défaut
  - sales[overview]                # le dashboard du module
  - references:                    # le sous-menu (libellé au module)
      - catalog.product
      - catalog.tag[@import]       # le wizard « import » de l'entité tag
```

**Et « chaque item `gui` doit disposer d'un champ `icon` »** — pour
construire un menu « moderne » : **l'icône rejoint le socle des
surfaces** (D438.3 — `labels`/`comment`/`description`/`icon`, puisée
dans `resources/` D346) ; le menu reste ainsi une pure liste
d'adresses, l'icône venant de la surface visée. *(Notes à trancher : où
se déclarent les libellés de sous-menus au module ; le bloc
`dashboards` du module — détaillé au point 6.)*

**Le dictionnaire de libellés du module (D440 — clôt le point 2).**
**« Les labels sont utilisés au-delà du menu : dans un champ, les
libellés peuvent y faire référence »** — le module porte un
**dictionnaire de libellés** (le bloc `labels:` de `module.yml`,
externalisable — D349/D352), et **la chaîne vaut référence** (la forme
courte D356) :

```yaml
# sales/module.yml (ou labels: labels.yml)
labels:
  references:    { fr: Références }    # les langues seules — jamais d'icône (D449)
  customer_code: { fr: Code client }

# l'usage — partout
fields:
  code:
    labels: customer_code        # la référence au dictionnaire
menu:
  - references:                  # le sous-menu — le même dictionnaire (D439)
      - catalog.product
```

**La chaîne = la référence, le mapping = l'inline** — les deux formes
coexistent ; la redondance des libellés s'éteint (l'esprit des
variables, D323). *(Notes en proposition : un nom introuvable = erreur
d'ingestion ; l'étage version en cascade — le plus proche l'emporte,
D360.)*

**La liste : le `searchable` de surface (D441).** **« Une propriété
`searchable` décrit la liste des champs ou des noms mutualisés à
positionner dans un filtre de tri. Par défaut, tous les champs sont
inclus dans la recherche. »** Les deux étages se répondent : **le champ
déclare comment il se cherche** (les modes — D367), **la liste déclare
lesquels apparaissent** :

```yaml
lists:
  pending:
    columns: [number, customer, total, status]
    searchable: [who, total, status]   # champs ou noms mutualisés (D367-D368)
                                       # défaut : TOUS les champs
```

*(Amende le défaut de D227 — « les colonnes affichées » devient « tous
les champs ».)*

**La liste close (D442 — clôt le point 3, amende D266).** Les quatre
arbitrages : **(1) `columns:`** — les colonnes **dans l'ordre
d'affichage** ; **(2) `filter:`** — « filtrer les éléments à afficher »,
par les expressions (D90) ; **(3) `sort:` — le tri se pense PAR
COLONNE** (le clic sur l'en-tête), pas par liste :

- **sans `sort:`** — le tri est **autorisé pour chaque colonne** (le
  défaut) ;
- **avec `sort:`** — la colonne présente est triable, **avec sa cascade
  de clés secondaires** ; la colonne absente **n'est pas triable** ;
- **`+`/`-`** préfixent les clés (croissant par défaut).

```yaml
lists:
  main:
    columns: [numero, nom, prenom]
    sort:
      numero: asc                # triable, seul
      nom: [prenom, numero]      # triable — 1re clé le nom, puis prénom, puis numéro
                                 # prenom absent → NON triable
    editable: [status]           # les colonnes modifiables —
                                 # « par défaut, toutes les colonnes sont readonly »
```

**(4) `editable:`** — les colonnes modifiables en ligne (D205) ; **le
défaut s'inverse : toutes readonly** — la colonne s'ouvre en se
déclarant (**amende D266**, qui ouvrait tout par défaut).

**La colonne riche (D443 — complète D442).** **« Les colonnes portent
également des informations sur le style, l'alignement et la
dimension »** — la forme courte demeure (le nom seul), la forme riche
s'ouvre :

```yaml
columns:
  - numero                        # la forme courte
  - nom: { align: left, width: 30%, style: bold }
  - total: { align: right }       # (défaut naturel des nombres — D370)
```

*(Notes en proposition : `align` — left/center/right, le défaut suit le
type (les nombres à droite D370, le texte à gauche) ; `width` — %, px
ou auto ; `style` — un nom, dont le contenu relève du thème (« le
design sera traité après la structure », D191).)*

**Et la forme abrégée délègue au moteur** : « ta proposition pour les
colonnes est une version simplifiée et abrégée — **Syncytium décide
alors du format par défaut et de la dimension de la colonne en fonction
de son type** » : le masque du champ (D260/D370), l'alignement du type,
la largeur du contenu — l'esprit D372, le technicien décrit, le moteur
dimensionne.

**La liste raffinée en six points (D444 — l'artefact de la liste).** La
relecture de la description canonique par l'auteur :

1. **L'opération en colonne dédiée** : « si le nom de la colonne est
   une opération, une icône peut s'afficher si l'opération est
   disponible pour la ligne » (la propriété `icon` de l'opération —
   D439) — **l'icône à trois états : actionnable, non visible, non
   actionnable** *(lecture en proposition : non visible = les droits
   D196, non actionnable = la garde du graphe momentanément fausse
   D430)* ;
2. **L'export** : les colonnes visibles par défaut, **une liste de
   colonnes complémentaires précisable** ; **le CSV exporte plusieurs
   fichiers — un par type de composants** (`customer.csv`,
   `orders.csv` — la symétrie de l'import d'agrégat Q55) ; **l'Excel,
   un seul fichier à un onglet par type de composants**, **surchargeable
   par un modèle de document Excel** (← `resources/`, D418) ;
3. **Le filtrage vivant confirmé — et la liste s'auto-rafraîchit** :
   « pour éviter la pression d'un bouton pour le rafraîchissement » ;
4. **La confidentialité** : les colonnes non autorisées sont **non
   visibles et non triables** — « elles ne sont simplement pas
   utilisées » (ni tri, ni recherche, ni export) ;
5. **Le responsive** : conforme aux échanges du thème E (D250 et
   arbitrages) ;
6. **La pagination au curseur opaque (D100), attendue — avec des
   indicateurs** : « le nombre de lignes ou les numéros de lignes en
   cours d'affichage rendraient la navigation plus claire » (« 21–40
   sur 156 »).

L'exemple canonique de la liste, complet :

```yaml
lists:
  pending:                             # la première déclarée = la liste par défaut (D438)
    label: { fr: Commandes en attente }
    icon: pending.png                  # le socle des surfaces (D439)
    columns:                           # l'ordre d'affichage (D442) ; abrégé = moteur (D443)
      - number
      - customer                       # référence → le label de la cible (D397)
      - total: { align: right, width: 10%, style: bold }
      - status
      - confirm                        # une OPÉRATION — l'icône à trois états (D444)
    filter: status != "archived"       # les lignes affichées (D90/D442)
    sort:                              # le tri PAR COLONNE (D442)
      number: asc
      customer: [number]
    searchable: [who, total, status]   # défaut : tous les champs (D441)
    editable: [status]                 # défaut : toutes readonly (D442)
    export:
      columns: [notes, created]        # les complémentaires (D444)
      sort: [customer, -created]       # le tri de l'export — l'écriture de l'affichage
      excel: order_export.xlsx         # le modèle Excel ← resources/ (D444)
```

*(Complément de l'auteur : « pour l'export CSV, nous pouvons également
préciser un tri des colonnes — avec le format que nous avons vu pour
l'affichage » : la cascade de clés à `+`/`-` (D442), figée pour le
fichier.)*

**Les comportements de la liste (D445).** Six gestes arbitrés :

1. **`selection: 1 | 1..`** — la liste porte une sélection simple ou
   multiple *(harmonisé par D474 — l'écriture des bornes ; « one » et
   « multiple » d'origine)* ;
2. **La création** : un bouton **dans le cadre de la liste ou dans
   l'entête, au même titre que les filtres** ;
3. **La modification** : **le double-clic** sur une ligne qui n'est pas
   en lecture seule — le formulaire s'ouvre en écriture ;
4. **La liste en lecture seule** : ni création ni suppression — mais
   **le double-clic ouvre la consultation** de la ligne (le formulaire
   en lecture) ;
5. **La suppression, à deux visages** : **une ligne sélectionnée** → le
   formulaire de la ligne **en lecture seule avec la demande de
   confirmation** (le patron D196) ; **plusieurs lignes** → **une popup
   de confirmation précisant le nombre de lignes** — l'exception popup
   assumée pour la masse (le formulaire n'aurait pas de sens pour n
   lignes ; la double validation D202) ;
6. **L'opération de masse** : « une opération peut être sélectionnée et
   appliquée sur toutes les lignes sélectionnées simultanément » — les
   opérations (D432) rencontrent la sélection (la masse séquentielle
   D202).

**Le redimensionnement des colonnes : `sizable` (D446).** Le cadre
posé : **« une liste est un composant graphique complet et complexe,
dont la lisibilité doit s'adapter au format d'affichage. »** Et **les
colonnes peuvent avoir une taille ajustable — uniquement si la
propriété `sizable: manual` est positionnée** :

- **`none`** — les tailles fixes (déclarées ou déduites, D443) ;
- **`auto`** — le moteur ajuste au contenu et au format d'affichage ;
- **`manual`** — l'utilisateur redimensionne ;
- **`auto+manual`** — l'ajustement du moteur, la main de l'utilisateur
  par-dessus.

*(Note en proposition : le défaut = `auto` — la ligne de D443, le
moteur dimensionne.)*

**La préséance du type et la colonne non affichée (D447).** **(1) « Les
types portent aussi des propriétés d'affichage dans une liste — par
défaut, ce sont ces propriétés qui priment ; lors de la définition
d'une liste, nous pouvons surcharger »** : la chaîne **type → colonne
de liste** (le pendant de D270 — type → champ → formulaire), la facette
d'affichage (D119) et les défauts du type (D443) servant tant que la
colonne ne dit rien. Les exemples canoniques de l'auteur : **un montant
affiche la devise et s'aligne à droite ; un toggle est centré ; un
texte court s'aligne à gauche ; un texte sur plusieurs lignes s'affiche
en justifié**… **(2) La colonne présente mais non affichée** :
**« une colonne peut être présente, non affichée et non visible — même
avec un redimensionnement possible »** (jamais révélée, y compris en
`sizable: manual`) — **« utile pour faire un export CSV simplifié sans
décrire les mêmes colonnes que l'affichage »** :

```yaml
columns:
  - number
  - customer
  - notes: { visible: false }     # présente pour l'export, jamais à l'écran
```

*(Notes en proposition : la propriété `visible: false` ; l'export prend
les colonnes **présentes** — affichées ou non — les `export.columns` de
D444 restant pour les compléments hors liste.)*

**La grammaire commune des surfaces (D448 — la base).** **« Forms,
summary et widget vont partager un vocabulaire et une grammaire
commune »** — l'acquis le préparait (le résumé = une config de
formulaire restreinte D201, le gabarit PDF = un formulaire en lecture
seule D253). La base validée (« les surfaces et la définition
convient ») :

```yaml
<surface>:
  label: { fr: … }              # le socle (D438) : labels, comment, description, icon
  header: "{gabarit}"            # les zones de texte à gabarits (D253/D90)
  footer: "{gabarit}"
  mode: read-only                # précisable (D207)
  blocks:                        # la liste ordonnée
    - section:                   #   empilée — labels + contenu
        fields: [ … ]            #   des champs (forme courte/riche, D270/D447)
    - tab:                       #   en onglet
        charts: [ … ]            #   et/ou des graphiques (Q53)
```

**Les spécialisations par restriction** : `forms` = la grammaire
entière (les deux modes D185, `history:` en dernier onglet D207/D186) ;
`summary` = restreinte (D201 — pas d'onglets, champs sélectionnés,
petit par principe, un seul par entité) ; `widgets` = le contenu
bascule (charts/KPI/TCD — Q53/D247, le drill-down, la confidentialité
héritée). Le gabarit PDF (D253) et les étapes de wizard (D233)
réutiliseront la même grammaire. **« La grammaire présentée constitue
une base que nous allons reformuler et étoffer. »**

**Le formulaire reformulé : l'écran visé et les quatre parties (D449 —
ouvre l'étoffage).** Trois recadrages de l'auteur : **(1) l'icône ne
vit qu'au rang de l'item** — « dans labels, icon fait doublon avec
l'icon au rang au-dessus » : le dictionnaire de libellés (D440, amendé)
ne porte que les langues, l'icône appartient au socle de l'item
(D439) ; **(2) « un formulaire est conçu pour un mode d'écran »**
(smartphone, PC, tablette) — la ligne des surfaces (D206 : la
déclinaison par mode d'affichage à repli ; D250 : le défaut est
l'écran paysage) ; **(3) la structure en quatre parties** : **« un
titre, un entête, un corps et un pied de page — le titre est une zone
de texte à gabarit ; l'entête, le corps et le pied sont des blocs »** :

```yaml
forms:
  default:
    label: { fr: Fiche client }
    icon: customer.png
    title: "{code} — {company_name}"   # LA zone de texte à gabarit (D90/D253)
    header:                            # un BLOC
      - section: { fields: [category, active] }
    page:                              # ex-body (D509) — la page du pages implicite
      - section:
          label: { fr: Identité }
          fields: [code, company_name, advisor]
      - tab:
          label: { fr: Commandes }
          fields: [orders]
    footer:                            # un bloc
      - section: { fields: [updated] }
```

*(À trancher : le nom et le défaut de la propriété d'écran visé
(`screen: pc` — défaut PC paysage D250 ?) ; l'entête et le pied
acceptent-ils les mêmes blocs que le corps — sections, onglets — ou les
sections seules ?)*

**`screen` en tableau, et les blocs sont des composants (D450).**
**(1) `screen`** est validée — **un tableau, « pour une compatibilité
de plusieurs affichages »** (`screen: [pc, tablet]`), **défaut :
`[pc paysage]`** (D250). **(2) « Dans l'absolu, l'entête, le corps et
le pied acceptent sections et onglets »** — ma restriction est écartée,
et le principe de fond est posé : **« un composant graphique est un
composant "type" ayant une signature commune qui permet d'assurer un
rendu. Ici, une section, une grille, des onglets… sont des
composants. »** Les blocs ne sont pas une grammaire à part : **des
composants-conteneurs du catalogue** — `section`, `grid` (la grille
entre au vocabulaire), `tabs`… — à signature commune, **le catalogue
extensible** (la ligne D408/D263 : les conteneurs livrés sont les hooks
embarqués, l'inventaire rejoint Q60).

**Le formulaire arborescent (D451).** **« Un formulaire est décrit de
façon arborescente. Un nœud est un composant qui affiche un composé
graphique basé sur l'enregistrement d'une entité, d'un champ et des
opérations. »** L'arbre unifie tout : **chaque nœud est un composant**
(D450) — les conteneurs (`section`, `grid`, `tabs`…) portent des
enfants, les feuilles rendent un champ (les composants D64/D270), les
opérations s'y matérialisent (les boutons D432) — et chacun rend son
composé graphique **à partir du contexte** : l'enregistrement de
l'entité, le champ visé, les opérations disponibles. Les quatre parties
(titre, entête, corps, pied — D449) sont les branches maîtresses de
l'arbre ; **l'imbrication est libre** (une grille dans un onglet dans
une section), la signature commune assurant le rendu à chaque étage.

**Le composant de saisie personnalisé (D452).** **« Section, grid ou
tab sont fournis par Syncytium. Dans un cas d'usage, j'ai besoin de
construire un composant de saisie personnalisée et détaillée qui ne
pourra pas se matérialiser avec les éléments de base. »** Le hook de
composant (D263) prend donc sa place **dans l'arbre du formulaire**
(D451) : **un nœud comme les autres** — la signature commune (D450), le
contexte servi (l'enregistrement, les champs, les opérations), **le nom
sans le mot « hook »** (D408). Il saisit comme il affiche — l'écriture
repasse par les champs et leurs règles (validation D364/D404, `allow`
D422, concurrence D111) : le composant personnalisé ne contourne
jamais le modèle. **Le contrat (signature, code, sandbox) relève du
domaine 6.**

**Les propriétés du `form` (D453).** Trois arbitrages : **(1) la zone
de texte à gabarit se décline par langue** — `title:` (et tout gabarit,
D253/D449) accepte la chaîne unique ou le mapping par langue :

```yaml
title:
  fr: "{code} — {company_name}"
  en: "{code} — {company_name} (customer)"
```

**(2) `mode: read-only` ou `updatable`** — le défaut est `updatable`,
le `read-only` fige (la consultation seule, D207). **(3)
`history: false` — « pour désactiver l'onglet history d'une entité
ayant un historique »** : le défaut est `true` — l'onglet paraît
lorsque l'entité est historisée (D411), toujours dernier (l'invariant
D186) ; sans historisation, pas d'onglet, rien à déclarer.

**La surimpression et sa dimension (D454).** **« Le formulaire peut
s'afficher en surimpression de l'écran — soit sur la totalité de
l'écran, soit sur une portion »** ; et l'arbitrage : **« nous ajoutons
une dimension — par défaut : 100 % de l'écran »** :

```yaml
dimension: 70%               # la portion ; absent = 100 % de l'écran
```

**La surimpression est le mode d'affichage du formulaire**, sa
`dimension` en règle la portée — la totalité par défaut, la portion
déclarée (le patron de la visionneuse D293).

**Le modèle unifié du composant graphique (D455 — la clé de voûte du
domaine 4).** **`items` est validé**, et la description reprend de
fond : **un formulaire est un composant graphique** ayant —

- **un nom** : `form`, `summary`, `wizard` ou `widget`… **extensible
  via un hook identifié par un nom unique** (la ligne D408 — les
  surfaces elles-mêmes sont des composants du catalogue) ;
- **des propriétés** : `dimension`, `title`… (D453–D454) ;
- **des composants (`items`)** : **`pages`, `header`, `body`,
  `footer`** — les pages entrent au vocabulaire (le multi-pages, le
  wizard s'y adossera) ;
- **un contexte** : **l'enregistrement de l'entité** pour laquelle le
  formulaire est défini, **le contexte d'appel** (l'origine de
  l'appel) **et le contexte de l'utilisateur**… — le contexte D451
  enrichi ;
- **la liberté compositionnelle** : « rien n'empêche de définir un
  formulaire qui inclut un wizard dans une page ou une section, qui
  affiche des références sous forme de widgets, qui utilise les
  listes… » — les surfaces s'emboîtent librement.

**La mécanique** : les composants constituent des nœuds, et la
représentation graphique est **un graphe acyclique que Syncytium
parcourra de la feuille à la racine** ; **les composants transmis au
composant graphique auront déjà été analysés et traduits par
Syncytium** — le composant reçoit du digéré, il ne fait que rendre.

**La portée** : **« un composant graphique est un nœud de l'arbre dont
le formulaire n'est qu'une matérialisation »** — l'approche vaut pour
**tous** les composants déjà décrits dans les facettes de types (le
thème E entier) ; et **« une facette peut être vue comme un hook, dont
un catalogue est fourni par Syncytium »** — la doctrine D408 atteint sa
généralité totale : les types, les opérations, les conteneurs, les
surfaces **et les facettes** sont des hooks, Syncytium livrant le
catalogue.

**L'analogie consignée** : **« cela s'apparente à la notion de web
components — ou à une extension des web components — utilisés par les
navigateurs web »** : le nom unique d'élément (les custom elements ↔
les hooks au nom unique D408/D455), l'encapsulation du rendu (la
signature commune D450), l'arbre composé. L'écho est noté pour **Q7 —
la pile technique** : les web components comme substrat naturel de la
GUI générée.

**Le catalogue des composants arbitré (D456).** L'inventaire en cinq
familles est validé avec cinq retouches :

1. **`template` entre aux surfaces** — « pour générer des documents
   PDF, Word… ; Syncytium proposera la génération de PDF sur la base de
   ce template » (le gabarit D251–D253 trouve son composant ; Word
   rejoint PDF) ;
2. **`pages`, `page`, `section` redéfinis** : **« `page` est un
   composant de `pages` — `page` est un saut de page ; `pages` est une
   section pouvant contenir un header, page(s) et footer ; une section
   est un regroupement potentiellement nommé »** — la pagination a son
   conteneur (l'entête et le pied *par page* — le socle du `template`),
   le saut sa marque, la section sa définition ;
3. **`carousel` entre** — le viewer d'images défilant (aux côtés
   d'`image-viewer`, D293) ;
4. **Les graphiques couvrent les besoins** — « à voir si j'en
   ajoute » (la famille reste ouverte) ;
5. **Les nœuds d'acte précisés** : **« en appuyant sur un bouton, un
   icône, ou en passant à l'étape suivante, l'utilisateur acte une
   opération »** — trois déclencheurs d'acte : le bouton (D432),
   l'icône (la colonne d'opération D444), **le passage d'étape** (le
   wizard s'y adosse, D233).

La description élément par élément peut s'ouvrir.

**Le nœud-champ explicite et la surcharge de représentation (D460).**
La validation de l'exemple `checkbox` apporte deux règles : **(1)
`field[<nom du champ>]`** — la forme explicite du nœud-champ dans les
`items` : « il est possible que certains noms de champs soient aussi
des composants graphiques — pour éviter l'ambiguïté, c'est
nécessaire » ; **(2) la surcharge de représentation au `gui`** : le
nœud peut surcharger **la représentation de la valeur** — « notamment
des informations sur le style de la checkbox (vide = faux, null, ou
coché = vrai), la taille… » — la chaîne type → colonne → nœud
(D270/D447) s'achève au formulaire :

```yaml
items:
  - field[active]                # la forme explicite
  - field[audited]:
      readonly: true
      style: { true: check, false: empty, null: dash }   # l'apparence par état
      size: 24px                 # (formes en proposition)
```

**Un seul vocabulaire de représentation, trois étages (D461).** La
forme courte `field[active]` est confirmée (« dans mon esprit ») — et
la surcharge s'unifie : **« la description du type pouvait contenir des
informations sur sa représentation avec `component` (D64/D359) — ici,
nous reprenons les mêmes propriétés, qui surchargent les propriétés
vues sur la définition du champ. »** **Les mêmes mots à chaque étage** —
`component`, `style`, `size`, `readonly`… : **le type les porte, le
champ les surcharge, le nœud `gui` les surcharge encore** — la chaîne
D270/D447/D460 devient une cascade au vocabulaire unique, le plus
proche l'emporte (l'esprit D360).

**Le triptyque `label` / `title` / `labels` (D465).** Le renommage
global : **« remplaçons `labels` par `label`, à l'exception du
catalogue de libellés »** — et l'objection levée par le renommage du
visage : **(1) `label`** = les libellés par langue, **partout**
(champs, surfaces, valeurs, opérations, `shortcut`…) ; **(2) le visage
de l'enregistrement (D397) se renomme `title`** — le gabarit
d'affichage, cohérent avec le `title` du formulaire (D449/D453) — et
**« la propriété `title` d'une entité sera utilisable sur un formulaire
et surchargeable sur le formulaire »** (la cascade entité →
formulaire) ; **(3) `labels`** ne survit qu'au **dictionnaire du
module** (D440) :

```yaml
name: customer
label: { fr: Client }                # les libellés par langue
title: "{code} — {company_name}"     # le visage (ex-label D397) — sert le
image: logo                          #   formulaire par défaut, s'y surcharge
```

**Le fond gradué (D466).** La proposition de l'auteur, née de la fiche
`fuel` : **« un style gradué d'une cellule en fonction d'une jauge — un
fond gradué d'un champ en fonction de la valeur d'un autre champ dont
la valeur est une valeur bornée. »** La jauge devient **un fond** : la
cellule du nom se remplit à proportion de l'avancement — la lecture de
deux informations en une. La forme en proposition, au vocabulaire
unique (D461) :

```yaml
columns:
  - name: { background: avancement }   # le fond gradué par le champ borné
```

*(Les bornes du champ pilote exigées — l'esprit `gauge` ; **le nom est
tranché : `background`**.)*

**Les couleurs de jauge (D467).** **« Dans le cas d'une jauge, les
couleurs à afficher doivent être spécifiées »** — deux formes :

```yaml
colors: { min: red, max: green }           # le dégradé — LE DÉFAUT, du rouge au vert
colors: { 0: red, 50: orange, 80: green }  # ou les seuils — la couleur à partir de la valeur
```

**Le dégradé mini → maxi** (défaut : du rouge au vert) **ou la couleur
par seuil** (rouge, orange, vert) — la propriété vaut pour `gauge`,
`fuel` et le fond gradué (D466), aux trois étages du vocabulaire unique
(D461).

**Le seuil des radios : la configuration générale (D468).** La virgule
du thème E (« jusqu'à 5 valeurs ? je ne suis pas encore fixé ») se
referme : **« le seuil des radios est un élément de la configuration
générale »** — un paramètre du `settings` (la cascade D360, le pendant
du seuil mono/multi-ligne D366) — **« ainsi, il est possible de définir
3, 5 ou 10 selon les besoins. »** *(Note en proposition : au-delà du
seuil, le repli en `dropdown` — le composant s'adapte, l'esprit
D366/D391.)*

**Les trois présentations du picker (D471).** **« Picker.image est un
dérivé de picker.record »** — et la sélection offre **trois
présentations** : **« par une liste (définie précédemment), par une
liste d'identifiants, ou par une liste d'images — une entité dispose de
clé(s) fonctionnelle(s) et/ou d'un champ image/icon qui permet de
représenter un enregistrement »** (la photo d'un profil, l'image d'un
aliment pour un menu…) :

| Présentation | Montre | S'appuie sur |
|---|---|---|
| **la liste** | la liste nommée de la cible | `selection:` (D215) |
| **les identifiants** | les clés fonctionnelles | `identity` (D357) |
| **les images** | les visages | `image:` (D386) |

`picker.record` porte les deux premières (*forme en proposition :
`by: list` — le défaut — ou `by: identity`*) ; **`picker.image` est la
dérivée qui fixe la troisième** — héritant tout du parent (le filtre,
l'ancrage, la dimension, la sélection déduite — D469/D470).

**`picker.image` s'efface (D472 — amende D471).** La simplification :
**« picker.image s'efface pour devenir picker.record avec un composant
matérialisant la liste de sélection — le nom de la liste, ou le nom du
champ représentant une image de l'enregistrement. »** Un seul picker
d'enregistrement ; **la valeur d'une propriété dit la présentation** :
le nom d'une liste nommée de la cible → la liste (D215) ; le nom du
champ-image de la cible → la galerie de visages (D386). *(Virgule de
nommage : l'auteur écrit `component:` — mais le mot désigne déjà le
picker au champ (D461) ; je propose de porter cette matérialisation par
**`selection:`** (D215 élargi) — la valeur dit tout, `by:` disparaît
aussi.)*

**La famille `picker` recomposée (D473).** **« Nous avons `picker.file`
pour choisir un ou plusieurs fichiers (quelconques), et `picker.image`
pour choisir un ou plusieurs fichiers images — dont la liste des
formats est exploitable par Syncytium. »** La famille finale :

| Picker | Choisit | Défaut de |
|---|---|---|
| `picker.record` | un/des enregistrements — la présentation par liste ou par champ-image (D472) | la référence, l'association, la liste d'entités |
| `picker.file` | un/des fichiers **quelconques** | le type `file` (D384) |
| `picker.image` | un/des fichiers **images** — les formats exploitables (dérivé de `picker.file` : appareil photo, galerie, aperçu — D292–D293) | les types `image`/`thumbnail` (D385/D389) |

Le « un ou plusieurs » suit le lien ou le type (la déduction D470) ;
l'ancien picker.image (la référence par l'image) est fondu dans
`picker.record` (D472).

**La famille `viewer` (D475).** **« Image-viewer et carousel sont un
même objet : `viewer` »** — généralisé : **« nous pouvons ajouter un
viewer pour d'autres types de fichiers (Word, Excel, PDF…), une image
étant un type parmi tant d'autres. »** Et **`carousel` = le viewer des
collections** : « une liste ou une association faisant référence à des
images et/ou des vignettes de fichiers — une succession d'images qui
changent à intervalle régulier, sur la pression d'une touche
avant/après… ». Les fiches réécrites ; `interval:` en proposition
(l'unité seconde s'ajoutant aux durées D434).

**Le vocabulaire des durées complet (D476 — amende D434).** **« Les
durées : `s`, `min`, `h`, `d`, `w`, `m` et `y` »** — la seconde et
l'année rejoignent le jeu de D434. Le vocabulaire vaut **partout où une
durée s'écrit** : `every:` (D434), `interval:` (D475), `await[+3h]`
(D436) — *(et en note : `temporal[1y]` devient possible, l'unité
explicite aux rétentions D411 — le `[365]` nu restant des jours).*

**Le carousel, un mode d'affichage (D477 — amende D475).** **« Viewer
est le composant graphique et carousel un mode d'affichage. »** Le
carrousel quitte l'inventaire des feuilles : **une seule fiche
`viewer`**, dont le mode se déduit du contenu — le fichier seul → la
vignette et la visionneuse au clic (D293), la collection → le
carrousel (le défilement D475, `interval:` D476) — et se force au
crochet, `viewer[carousel]` *(l'écriture en proposition)*.

**Les trois modes du viewer (D478).** **« Le crochet est un raccourci
pour la définition du mode »** — la propriété `mode:` existe en clair,
`viewer[carousel]` ≡ `mode: carousel`. Et **« le viewer peut afficher
une image, une planche ou un carousel »** — trois modes : `image` (le
fichier seul en vignette), **la planche** (toutes les vignettes de la
collection — *nom du catalogue en proposition : `mosaic`, l'anglais des
valeurs sans collision avec le conteneur `grid` D451*), `carousel` (la
succession qui défile). *(En proposition : au template, le carrousel se
rend en planche.)*

**La planche dimensionnée (D479).** **« Dans le cadre d'une planche,
besoin de préciser le nombre d'images en colonne et en ligne dans la
zone. »** L'écriture au crochet *(en proposition)* : **`mosaic[4x3]`**
— colonnes × lignes, l'écho d'`image[512x512]` ; absent = l'auto selon
la dimension de la zone et des vignettes ; l'excédent de la collection
se feuillette.

**Mosaic acté, la propriété derrière le raccourci (D480).** **« Mosaic
me plaît et la dimension dans les crochets est une bonne idée (pour un
raccourci). Il faut prévoir une propriété quand même. »** Le nom
`mosaic` et le crochet `mosaic[4x3]` actés — le crochet n'étant qu'un
**raccourci**, la grille se déclare aussi en clair *(en proposition :
`columns:` et `lines:`, les mots déjà au vocabulaire — D441/D464)*.

**Le document paginé feuilleté (D481).** **« Un carrousel d'un document
PDF correspond à un défilement des pages. Un PowerPoint suit le même
principe. Un carrousel depuis l'un de ces documents peut être utilisé
pour afficher une présentation ou un mode opératoire. »** Le carrousel
défile donc **une succession** — les éléments d'une collection (D475)
**ou les pages d'un document paginé seul** : la page fait l'image ;
avec `interval:`, la présentation tourne d'elle-même (l'affichage
d'atelier, le mode opératoire).

**`sheet:` — la grille de la planche (D482, remplace la proposition
D480).** **« Columns/lines à remplacer par `sheet: columns x lines`. »**
Une seule propriété : `sheet: 4x3` — colonnes × lignes ; le crochet
`mosaic[4x3]` en est le raccourci.

**Le viewer du document généré (D483).** **« Le fichier de la facture
n'existe pas en tant que tel mais comme un fichier PDF généré à partir
des informations de la facture et de ses lignes. Par conséquent, un
viewer peut faire référence à un template de document à générer. »**
La source du viewer s'élargit : le champ, le lien — **ou le template**,
le document naissant à la volée de l'enregistrement. Combiné à D481,
la facture générée se feuillette en carrousel. *(L'écriture en
proposition : `template[<nom>]` en items — l'écho de `field[<nom>]`
D460, viewer en composant naturel.)*

**Le couple `size:`/`dimension:` (D484).** **« `size:` décrit la
dimension à l'affichage et `dimension:` décrit la dimension en
extension (suite à un clic). »** La doctrine vaut pour tout composant
qui se déploie : la mini-carte et la carte dépliée (`map`), la vignette
et la visionneuse (`viewer` — D293), la liste du picker (D469), le
formulaire en surimpression (D454). `size` vit dans le socle du
vocabulaire aux trois étages (D461) ; `dimension` porte le déploiement
— plein écran, pourcentage, zone définie.

**Le fil épouse son contenant (D485 — précise D167/D186).** **« J'avais
indiqué qu'un onglet pourrait représenter un thread. Cependant, il peut
prendre une section ou un onglet… ça prend la place qu'on lui
laisse. »** L'onglet n'est qu'un habitat possible du fil : une section,
un onglet, tout conteneur — le `thread` remplit l'espace que la
déclaration lui donne.

**Un seul `list` (D486).** **« Le composant graphique `list` vu avant
les types et les composants de base est intimement lié à `list`
ici. »** La liste complète (D441–D447) et l'éditeur de liste sont **un
même composant** : `list of <entité>` (la composition — D399) déploie
la liste embarquée aux colonnes de l'entité ; `list of <type simple>`
la **resserre sur la colonne unique des valeurs** — et le vocabulaire
de la liste complète (columns, editable, selection, sizable, l'export…)
vaut partout où il garde son sens.

**Le bloc n'existe pas (D487).** **« Block n'existe pas en tant que
tel. Il se décline selon les différents items vus ci-dessus. »** Le mot
« bloc » (D449) était générique : aucun composant ne le porte — il se
matérialise par les conteneurs du catalogue (`section`, `grid`, `tabs`,
`pages`, `page`) et par `header`/`body`/`footer`, des conteneurs
reconnus par leur nom et leur rôle — au formulaire (D449) comme dans
`pages`. La ligne du modèle unifié (D455) : tout est composant.

**Le contenu fixe (D488).** **« Il manque une feuille essentielle : un
texte fixe, un paragraphe et/ou une image fixe. Par exemple, mettre du
texte pour indiquer les informations légales de l'entreprise et son
logo. »** Deux feuilles s'ajoutent à l'inventaire — le contenu venu de
la configuration, aucun champ derrière : **le texte fixe** (les
libellés par langue D465, ou le dictionnaire du module D440) et
**l'image fixe** (un fichier livré avec la configuration, comme les
icônes D439). *(Les noms en proposition : `paragraph` et `picture` —
`text` et `image` étant les composants de champ, D458.)*

**Le couple `sections`/`section` (D489).** **« Sections permet de
décrire l'organisation de différentes sections (organisation en
colonne ou en ligne). Une section décrit une partie du composant
sections. Le nœud sections a des propriétés et des items — chaque item
est alors une section. Une section est un nœud qui permet d'organiser
différents nœuds (soit sections, soit une des feuilles vues
précédemment). »** L'alternance est stricte : `sections` ne contient
que des sections ; une section contient des `sections` ou des
feuilles — l'emboîtement passe par l'organisateur. *(En proposition :
la disposition `layout: column | row` — défaut `column`, l'empilement —
avec le crochet en raccourci `sections[row]` (D478) ; et la section
seule sous un conteneur = le raccourci d'un `sections` à l'item
unique.)*

**Les trois arbitrages du couple (D490).** **(1) « `layout: column |
row | grid[2]` »** — la grille rejoint la disposition, le crochet
portant le nombre de colonnes. **(2) « La section seule est un
conteneur (header, body ou footer) »** — la section nue vit
directement sous l'entête, le corps ou le pied (l'écho de D450/D451 :
« l'entête, le corps et le pied acceptent sections ») ; ailleurs, la
composition passe par l'organisateur `sections`. **(3) « Un écran va
dépendre de screen. Si l'affichage doit changer, screen permet de
définir le format attendu »** — aucun ré-empilement automatique : le
format par écran se déclare (D450).

**La grille au crochet, `grid` oublié (D491 — amende D490).**
**« Oublie grid… mais j'amende : `column[3]` — maximum de 3 colonnes :
après 3 colonnes, on crée une ligne avec de nouveau jusqu'à 3
colonnes… et `row[2]` — 2 lignes, puis ajoute une colonne… »** Le
conteneur `grid` quitte le catalogue et la valeur `grid[n]` disparaît :
**le mot nomme l'unité, le crochet la compte, le flux replie au-delà**
— `column` (défaut) = l'empilement en colonne unique ; `column[3]` =
jusqu'à trois colonnes par ligne, puis la ligne suivante ; `row` = la
ligne unique ; `row[2]` = jusqu'à deux lignes par colonne, puis la
colonne suivante. La grille est couverte par le crochet.

**La liste en widgets (D492).** **« Nous avons une représentation
tabulaire de la liste. Elle peut se présenter sous forme d'une liste
de widgets — la propriété `widget: <nom du widget>` de l'entité de
l'élément de la liste. »** Deux représentations pour la liste
complète : **le tableau** (`columns:` — D441) ou **la liste de
widgets** — chaque enregistrement rendu par le widget que son entité
déclare (`gui: widgets:` — D455). **L'exclusion mutuelle `widget:`/`columns:` est validée** — l'un ou
l'autre visage ; toute la mécanique de la liste — filtre, tri,
recherche, sélection, pagination, opérations — demeure.

**Le titre de la section : `title:` (D493).** **« Le nom d'un
regroupement est en fait un libellé en titre de la section. Au lieu de
label, j'utilise `title`. »** La section se nomme par **`title:`** —
les libellés par langue (la mécanique D465) en position de titre —
l'écho du titre du formulaire (D449, la zone à gabarit déclinable par
langue) et du `title` de l'entité (D465) : **title = ce qui titre**.
`label` demeure ailleurs (le `shortcut` D464, le `paragraph` D488, les
`values`…).

**La jauge aux trois valeurs (D494 — précise D241).** **« Nous pouvons
avoir 3 valeurs pour une jauge : min, value et max. Min et max peuvent
être fixes comme dépendre de valeurs. La jauge porte alors ces 3
valeurs en une. »** La vérification : D241 consignait la valeur de
référence et la valeur calculée, « chacune une formule ou une valeur
absolue » — le min restait implicite. La forme à trois valeurs le rend
explicite : **min, value, max — chacun fixe ou dépendant** (un champ,
une formule — la ligne D241), portés en une seule jauge ; les bornes
du type (D276) restent le défaut de min/max.

**Les seuils depuis une entité (D495).** **« Pour les seuils, je
propose aussi que cela puisse dépendre d'une entité en expliquant les
liaisons entre les colonnes et les valeurs (seuil et couleur). »** Les
couleurs de jauge (D467) gagnent une troisième source : **une table de
référence** — l'écho des unités de `measure` (`units: stock.unit`,
l'adressage D363) — en nommant les liaisons : la colonne du seuil, la
colonne de la couleur. *(L'écriture en proposition :
`colors: { from: quality.threshold, threshold: level, color: tint }`.)*
Vaut partout où `colors:` vaut — `gauge`, `fuel`, le fond gradué
(D466–D467).

**Le type `color` et `picker.color` (D496).** **« J'ajoute aussi
`picker.color` pour sélectionner une couleur »** — l'ajout vaut
adoption du type : **`color`**. Et la précision fonde sa mécanique :
**« Le stockage est un entier. L'affichage en hexadécimal et une base
traduisant les couleurs en RGB. »** — le moteur stocke **un entier**
(le RGB(A) assemblé), l'affichage s'écrit en **hexadécimal**
(`#RRGGBB`, l'alpha en option), et **la base des couleurs nommées**
traduit `red`, `orange`, `green`… en RGB — celles-là mêmes que
`colors:` emploie (D467). La pastille en lecture, le sélecteur en
saisie — le composant par défaut au nom du type (D458). Et
**`picker.color` rejoint la famille pointée** (D470/D473) : la palette
qui s'ouvre — `selection:` (D474), `anchor:` et `dimension:` (D469).
*(En proposition : si le champ porte des `values:`, la palette s'y
restreint — l'écho de dropdown/icons.)* Le type sert la colonne
couleur des seuils d'entité (D495).

**Le type `range` (D497).** **« Range étant un stockage de 2 valeurs
dont l'une est égale ou plus petite que l'autre »** — une plage de
dates ou de valeurs. La vérification : `range` n'existait que comme
régime de recherche (D371) ; `period` (D391) portait la paire
temporelle, début ≤ fin. Le type générique naît : **deux valeurs d'un
même type ordonné, la première ≤ la seconde, portées en une** —
la contrainte intégrée (l'esprit `period`). *(L'écriture en
proposition : **`range of <type>`** — l'écho de `list of` D362, la
phrase se lit : `range of decimal`, `range of date` ; les facettes du
champ s'appliquent aux deux valeurs ; la saisie = les deux champs du
type liés, le double curseur pour les bornés — l'écho D276 ; la
recherche `range` (D371) en usage naturel ; `period` demeure, le frère
temporel au crochet.)*

**`range of` validé, la jauge un cas particulier (D498 — solde
D497).** **« Je valide `range of`, déclinaison de `list of` avec 2
contraintes en nombre et en ordre. »** Et trois précisions : **« dans
le range of, j'autorise le fait de ne pas définir de min et/ou de
max »** — la plage ouverte (« ≥ 5 », « ≤ 10 ») ; **« les libellés de
ce type de champ portent sur 3 éléments : min, value et max »** — le
libellé se décline par élément ; **« la jauge étant un cas particulier
d'un range »** — la relecture de D494 : min/value/max en une, la jauge
porte un range et sa valeur — `gauge` devient un composant compatible
du type. **Les liaisons des seuils d'entité (D495) sont également
validées** (`from`/`threshold`/`color`).

**Les cellules confirmées de la synthèse (D499).** Les trois « à
confirmer » du tableau types × composants trouvent leurs réponses :
**« duration est compatible avec calculator sur la base de 2
clocks »** — la durée calculée entre deux horloges (le début, la fin —
la différence fait la durée) ; **« datetime nécessite la combinaison
des 2 composants calendar + clock »** ; **« uuid à saisir et en
lecture sous forme de texte formaté — ça peut servir à plusieurs
fonctions dont celle de conserver des id vers des systèmes tiers »**
(relit D419 : la saisie n'est pas exclue, le texte formaté vaut dans
les deux sens).

**Le dropdown de la référence et du statut (D500).** **« Reference :
utilisation d'un dropdown possible. »** Et **« le statut peut être un
dropdown aussi, avec une liste de valeurs en tenant compte du cycle de
vie »** — la liste déroulante du statut n'offre que **les états
atteignables** depuis l'état courant (le graphe promote/demote,
D425–D427 — la sélection libre restant le mode sans `when`). La
dernière cellule « à confirmer » de la synthèse se ferme — le registre
atteint sa cinq-centième décision.

**La taille des sections : `width`/`height` (D501).** **« Layout
fournit le découpage en colonnes et en lignes. `width` et `height`
permettent de calibrer la taille des sections. Sans précision,
l'ensemble de l'espace est pris. »** La section se calibre **au sein
de son organisateur** — la largeur, la hauteur ; sans elles, les
sections se partagent tout l'espace du découpage.

**Les deux étages du calibrage (D502 — précise D501).** **« Width et
height sont des propriétés à positionner au même niveau que layout
pour que chaque section ait la même dimension. Par contre, pour des
sections de taille variable, width et height sont également
définissables sur la section. »** L'uniforme à l'organisateur (toutes
les sections à la même taille), le variable à la section — **le plus
proche l'emporte** (la ligne D461).

**`size:` sur l'organisateur, le défilement au débordement (D503).**
**« Dans sections, `size` permet de préciser les dimensions de
l'espace occupé par l'ensemble des sections décrites. Si l'affichage
excède cet espace, des barres de scrolling seront visibles ou
évaporeux (plus moderne). Sur un écran tactile, le swipe permet de se
déplacer dans une zone sans avoir besoin d'afficher les barres de
scrolling. Cependant, les barres permettent d'afficher le
positionnement de l'écran par rapport à l'ensemble des éléments
affichés. »** L'enveloppe du tout — la cohérence D484 (`size` = la
dimension à l'affichage) : `size` dimensionne l'organisateur,
`width`/`height` calibrent ses parties ; au débordement, les barres —
pleines ou évanescentes —, le swipe au tactile, les barres restant
l'indicateur de position.

**Les modes de `tabs` (D504).** **« Les tabs se déclinent en plusieurs
modes : les onglets tels que nous les connaissons avec les composants
graphiques Windows (pour un affichage haut), comme Excel (pour un
affichage bas), comme un wizard pour représenter les différentes
étapes — avec la possibilité de voir toutes les étapes mais de ne pas
prendre d'avance tant que l'onglet précédent n'a pas été exploré. Nous
pouvons aussi avoir une représentation latérale (à gauche ou à
droite). »** Quatre visages : la barre en haut (le défaut), en bas, à
gauche ou à droite — et **le mode wizard** : toutes les étapes
visibles, l'avance au rythme de l'exploration (l'écho du cliquet
D354 ; la parenté avec la surface `wizard` D230–D233 notée). Et la
poignée se compacte : **« les icônes permettent de minimiser le texte
ou afficher le texte en survol »** — la barre d'icônes seules, le
titre en survol. *(En proposition : `mode: top | bottom | left |
right | wizard` — le crochet en raccourci, `tabs[bottom]`,
`tabs[wizard]` — D478.)*

**Le chemin de traitement (D505 — complète D504).** **« En wizard, les
tabs parcourus décrivent le chemin de traitement… en cliquant sur une
phase, nous revenons sur un onglet. »** La barre du mode wizard est le
fil d'Ariane du parcours : **le retour libre** sur toute étape
explorée — d'un clic sur la phase —, **l'avance gardée** (D504, le
cliquet D354).

**La dimension unique des volets (D506).** **« Par contre, pour chaque
tab, toujours la même dimension — et les zones sont centrées si elles
représentent un espace plus petit. »** Le contraste avec les sections
(D502) est assumé : **aucun calibrage par volet** — tous les onglets à
la même dimension, et le contenu plus petit **se centre** dans le
volet.

**La géométrie de `pages` (D507).** **« Pages prend toute la place,
pas de dimension. Le header et le footer sont optionnels. S'ils sont
définis, ils sont toujours visibles. La hauteur du footer et du header
sont paramétrables. La page prend toujours le reste. »** Aucun `size:`
sur `pages` (le contraste avec D503) — tout l'espace est à lui ;
l'entête et le pied, optionnels mais **toujours visibles** une fois
déclarés, portent leur **`height:`** ; **la page prend toujours le
reste**.

**La navigation des pages, celle des tabs (D508).** **« La navigation
entre les pages s'effectue de la même façon que les tabs. Les pages
ont un numéro (par défaut) et nous pouvons lui affecter un nom et/ou
un icône comme un tab. L'affichage des pages suit alors la même
logique que tabs. »** La poignée de la page est **son numéro** — le
`title:` et l'`icon:` s'y affectent comme sur un onglet (D493/D439) —
et l'affichage hérite de la logique de `tabs` : la barre des poignées,
ses modes (D504), le chemin (D505), le swipe.

**Le formulaire est un `pages`, `body` disparaît (D509 — amende
D449/D455/D490).** **« Pages est le premier composant d'un formulaire
sans avoir besoin de le déclarer. Header et footer sont déjà décrits.
Ici, body est à remplacer par `page`. »** Et la famille se clôt :
**« pas besoin de composants complémentaires. »** La racine de tout
formulaire est un `pages` **implicite** — ses items : `header`,
`page`(s), `footer` (D507) ; **le mot `body` quitte le vocabulaire**,
la clé s'écrit `page:`. Le quatuor D449 se relit : le titre, l'entête,
**la ou les pages**, le pied. Les conteneurs au complet :
`sections`/`section`, `tabs`/`tab`, `pages`/`page`, `header`/`footer`.
*(La virgule : plusieurs pages au formulaire — la clé `page:` ne se
répète pas en YAML ; l'écriture du multi-pages à préciser.)*

**Le multi-pages en liste (D510 — solde la virgule).** **« Le
multi-pages se fait à l'aide d'une liste d'éléments :
`default: [ { header: … }, { page: … }, { page: … }, { footer: … } ]`. »**
Deux plumes pour le même `pages` implicite : **les clés** pour l'usuel
(une page), **la liste d'éléments** dès que les pages se répètent.

**L'acte : `operation[<nom>]` et les deux modes de l'opération
(D511).** L'écriture actée : **« `operation[<nom>]` pour être en phase
avec les fields »** (l'écho de `field[<nom>]` D460 et `template[<nom>]`
D483). Et le concept s'approfondit : **« une opération doit avoir 2
modes : une pré-exécution permet d'identifier les modifications à
apporter — par exemple, calculer le nombre de factures à créer, ou
lors de l'import d'un fichier CSV, le nombre de lignes ajoutées,
modifiées, non modifiées et supprimées. Cela donne du contexte à
l'utilisateur avant que l'opération ne soit réellement exécutée. »**
La pré-exécution **généralise** le dry-run de l'import (D234) et
l'exécution à blanc du glossaire — toute opération sait se jouer à
blanc. Et **« un message de confirmation avec un gabarit dont les
informations sont issues de l'opération en mode pré-exécution »** —
la relecture de D431 s'enrichit du contexte chiffré. *(L'écriture en
proposition : `validate: true` — la relecture simple, le défaut —
s'étend en `validate: { message: <gabarit> }`, le gabarit consommant
les résultats nommés de la pré-exécution : « {invoices} factures
seront créées ».)*

**La famille `chart.*` et le nuage de points (D512).** La famille
pointée des graphiques est actée — l'écho des pickers, la note de D470
tenue : **`chart.line`** (la courbe), **`chart.bars`** (les barres),
**`chart.pie`** (les secteurs — camembert/anneau), **`chart.combo`**
(le combiné, 2 axes Y max — D239), et l'ajout de l'auteur :
**« j'ajouterais également le nuage de points »** — **`chart.scatter`**.
`kpi` (le chiffre-clé) et `pivot` (le croisé dynamique D246) vivent à
part ; la jauge reste la feuille `gauge` (D494/D498) ; le hook étend la
famille (`chart.radar`…) sans toucher au moteur (D239).

**La carte des collections (D513 — complète la fiche map).** **« Le
composant doit pouvoir s'adapter pour une coordonnée ou une liste de
coordonnées dont des lignes sont possibles ou pas. »** La vérification :
rien n'était consigné — la fiche `map` servait la coordonnée seule.
Désormais : **une coordonnée** = le marqueur (D294) ; **une liste de
coordonnées** (`list of geolocation`, l'association aux coordonnées) =
**les marqueurs multiples sur une même carte**, et **les lignes** —
le tracé reliant les points dans l'ordre de la collection (l'itinéraire,
la tournée) — **possibles ou pas**. *(L'écriture en proposition :
`lines: true | false` — défaut `false`, les marqueurs seuls.)*

**Les deux usages et la frontière de la route (D514 — complète
D513).** Les usages posés : **« présenter tous les lieux de commandes
pour un produit (pas besoin de relier les points), ou représenter le
parcours d'un commercial (relier les points entre eux) »**. Et la
frontière : **« nous pourrions également prévoir le tracé de la route,
mais cela nécessite de prendre des abonnements à des outils annexes —
je préfère le laisser aux hooks. »** Le socle relie **au trait droit**
(à vol d'oiseau — l'écho D391) sans aucune dépendance ; **le tracé de
la route = un hook/connecteur** — le patron exact du géocodage
(D294) : les services payants existent (Google, Mapbox), et des
candidats open source auto-hébergeables aussi (**OSRM**, **Valhalla**
— sur les données OpenStreetMap) ; le choix à re-vérifier en Q7.

**Les réglages d'affichage du graphique (D515).** **« Nous avons
besoin de pouvoir paramétrer les échelles, les début et fin d'axe et
éventuellement quelques éléments d'affichage — affichage de vignettes,
couleurs, utilisation de dégradé… »** *(Les écritures en proposition,
réemployant l'existant :* **la forme riche des axes** — `x:` et `y:`
acceptent `{ value:, min:, max:, scale: }` : `min`/`max` = les début
et fin d'axe (l'écho D494), `scale: linear` (défaut) `| log` ;
**`colors:`** — la mécanique D467 réemployée : la couleur par série,
**le dégradé** compris ; **`points:`** — les vignettes aux points de
la courbe : la valeur affichée — et au nuage (`chart.scatter`), **le
visage de l'enregistrement** (D386).)*

**`labels:` et les valeurs du calcul (D516 — amende D515).** La
proposition `points:` s'efface : **« je verrai plutôt `labels`, avec
un gabarit d'affichage si besoin de personnaliser. Sinon,
`labels: true` — affiche la valeur dans le format du champ. »** Le
vrai comme le gabarit *(la collision avec `labels`, le dictionnaire du
module D440/D465, est notée — le contexte départage, D458)*. Et
l'interaction : **« en cliquant sur une vignette, je souhaite voir
toutes les valeurs utilisées pour le calcul (si le calcul dépend
d'une liste ou d'une association) »** — le détail de l'agrégat
s'ouvre au clic : les valeurs contributrices (l'écho du drill-down
D242 et de l'écart assumé des évaluations D248).

**L'assise du graphique (D517).** **« Un composant chart doit
s'appuyer sur une entité ou une liste (composant déjà vu). Les axes
font référence aux champs. »** La déclaration se fonde : **l'assise**
— une entité, ou **une liste nommée** dont le périmètre (filtre,
confidentialité) s'hérite — et **les axes référencent les champs de
l'assise** (`x:` un champ à découpage, `y:` l'agrégat d'un champ).
*(L'écriture en proposition : **`on:`** à l'adresse D439 —
`on: sales.order` pour l'entité, `on: sales.order[invoiced]` pour la
liste nommée, le crochet de l'adresse.)*

**Le défaut de l'assise (D518 — complète D517).** **« Si `on:` est
absent, l'assise porte sur l'entité elle-même »** — l'entité porteuse
de la déclaration ; `on:` ne s'écrit que pour désigner une autre
assise (une liste nommée, une autre entité).

**Les secteurs arbitrés (D519).** Les trois virgules de `chart.pie`
tranchées : **(1) `mode: pie | donut | quarter`** — le quart de cercle
rejoint le camembert et l'anneau. **(2) Les variables du gabarit des
labels** : `{percent}` validée — **« cette variable s'ajoute à la
valeur pouvant être utilisée : "{percent} % ({value} / {total})" »** —
le trio `{value}`, `{percent}`, `{total}`. **(3) Le clic et les
« autres »** : « en cliquant sur une valeur, afficher la liste des
éléments correspondant à la part » (D242) ; le regroupement des
petites parts en « autres » est acté — **« mais le drill sur autres
doit afficher une barre avec une répartition de toutes les autres
valeurs, afin de permettre à l'utilisateur de préciser la valeur à
filtrer dans la liste »** — **le drill à deux étages** : le secteur →
la liste ; « autres » → la barre de répartition → la liste.

**L'épaisseur et les angles (D520 — complète D519).** **« Sur donut,
une propriété sur l'épaisseur doit être possible. Sur quarter,
l'angle de départ, de fin et l'épaisseur. Par exemple, quarter doit me
permettre de représenter l'assemblée nationale avec ses représentants
de la gauche vers la droite… »** — l'hémicycle en usage fondateur.
*(Les écritures en proposition : **`thickness:`** — l'épaisseur de
l'anneau ou de l'arc, en pourcentage du rayon ; **les angles au
crochet aux bornes** — `quarter[-90..90]`, l'écho de D366/D497 — le
départ..la fin en degrés, 0° à midi, le sens horaire ; `quarter` nu =
`[0..90]`, le quart ; l'hémicycle = `quarter[-90..90]`.)*

**Le graphique, le tableau, ou les deux (D521 — au socle des
charts).** **« Les charts doivent se présenter soit en graphique, soit
sous forme d'un tableau (pour avoir une vue sur les différentes
valeurs directement), ou les deux. »** La présentation rejoint le
socle commun de la famille — l'écho des tableaux de valeurs (D244).
*(L'écriture en proposition : `display: graph | table | both` —
défaut `graph`.)*

**Le nuage de points : la dispersion et la catégorisation (D522).**
Le grain d'abord — la lecture validée par l'usage : **le nuage montre
les enregistrements eux-mêmes** — un point par enregistrement, `x:` et
`y:` deux champs nus (sans agrégat), le visage au survol (D386), le
clic ouvrant le formulaire. Puis les mots de l'auteur : **« les axes
se déclinent également via des seuils qui ne se chevauchent pas.
L'idée est d'utiliser un nuage de points pour représenter une
concentration ou une dispersion d'une certaine valeur. Mais cela doit
permettre aussi d'aider à catégoriser des éléments — par exemple, la
réalisation d'un MoSCoW (en s'appuyant sur 2 critères), ou alors sur
les gains/bénéfices de l'effort d'une action ou d'un ensemble
d'actions… »** Les seuils découpent les axes en bandes, **les
croisements font les zones** — la matrice de décision (MoSCoW,
effort/bénéfice). *(Les écritures en proposition : `thresholds:` dans
la forme riche de l'axe — la liste croissante, non chevauchante par
construction ; **`zones:`** — la zone au croisement des bandes,
`x: 0..50` aux bornes D366, `title:` et `color:` ; le clic sur une
zone → la liste de ses éléments, l'écho D519.)*

**La matrice adressée (D523 — simplifie D522).** **« Je vois une
redondance entre threshold et le découpage des zones. Nous pouvons
simplifier : l'axe définit min, max et threshold. Les zones
définissent les positions dans la matrice créée — plutôt que x et y,
`zone: [1,1]`, `title: { … }`. »** Les seuils font la matrice une
fois ; la zone s'y **adresse** par sa position — plus aucune borne
répétée. *(La convention en proposition : `[colonne, ligne]` depuis
l'origine des axes — `[1,1]` en bas à gauche.)*

**L'orientation du combiné (D524).** **« `axis: left | right`, ou
`bottom | up`, pour une représentation en ligne contre une
représentation en colonne. »** Le combiné s'oriente par la paire
d'axes : **à gauche/droite** — les valeurs debout, la représentation
en colonne (le défaut) ; **en bas/haut** — les valeurs couchées, la
représentation en ligne. La paire est homogène par construction (les
deux séries du même régime). *(La virgule de vocabulaire signalée :
« up » ici, « top » chez les tabs (D504) — l'harmonisation à
trancher.)*

**L'harmonisation : `top` (D525 — amende D524).** **« J'harmonise en
effet avec top »** — la paire couchée s'écrit **`bottom | top`**, le
vocabulaire unique avec les tabs (D504) : top/bottom/left/right
partout où un bord se nomme.

**L'icône aux seuils (D526).** **« La combinaison valeur/couleur est
une approche. Je souhaite aussi pouvoir associer éventuellement une
icône — cas d'un feu tricolore, par exemple. »** Les seuils portent
la couleur (D467) **et/ou l'icône** : le feu rouge/orange/vert à côté
du chiffre. *(L'écriture en proposition : **`icons:`** — la mécanique
de `colors:` dupliquée, `{ 0: red_light.svg, 50: orange_light.svg,
80: green_light.svg }` — la collision avec la feuille `icons` notée,
le contexte départage (D458) ; et la table d'entité (D495) gagne la
liaison `icon:` en option.)* Vaut où les seuils valent (D467) — le
`kpi` en usage premier.

**L'organisation du kpi (D527).** **« Un kpi sera mis en valeur avec
un style différent de la feuille que nous avons déjà vue »** — le
chiffre-clé s'affiche en exergue, jamais comme un champ. Et
**« l'organisation se découpe en 4 : le label en haut - l'icône
dessous, le label à gauche - l'icône à droite, le label en bas -
l'icône dessus, le label à droite - l'icône à gauche »** — la position
du label, **l'icône au bord opposé**. *(L'écriture en proposition :
`layout: top | left | bottom | right` — la position du label, les
bords du vocabulaire unique (D525) ; défaut `top` — le premier cité ;
la collision avec le `layout:` des sections (D490) notée, les valeurs
départagent — D458.)*

**Le tri du croisé sur la valeur (D528).** **« J'ajoute un tri
également sur la value pour notamment visualiser les plus gros CA,
par exemple. »** Les lignes s'ordonnent par la valeur agrégée — et
dans un groupement hiérarchique, **chaque niveau se trie par son
sous-total** (les commerciaux par leur CA, leurs clients par le
leur). Le défaut demeure l'ordre naturel du champ. *(L'écriture en
proposition : `sort: -value` — le signe du tri des listes, D441.)*

**Le tri aux trois clés (D529 — élargit D528).** **« Le tri peut
s'appuyer sur les rows, les columns ou la value. »** La clé du tri :
un champ des lignes, un champ des colonnes, ou la valeur — les signes
et les cascades de D441 valent (`sort: { seller: -value, date: + }` —
les commerciaux par leur CA décroissant, les mois chronologiques).

**Les appels du geste et les exports de la liste (D530).** **« Sur la
liste, il manque les propriétés `add`, `update` or `delete` pour
préciser le formulaire/widget à appeler. La propriété `exports:`
permet de préciser les différents exports ou générations de
documents. »** Les trois gestes de D446 nomment leur surface : `add:`
(le bouton du cadre), `update:` (le double-clic), `delete:` (la
lecture seule + confirmation) — le formulaire ou le widget appelé,
**le formulaire par défaut (D438) sans déclaration**. Et **`exports:`**
précise la panoplie — les exports (D445) et **les générations de
documents** (l'effet document, le template — D483/D511). *(L'écriture
en proposition : `exports: [ csv, excel[stock.xlsx],
template[order_sheet] ]` — le crochet portant le modèle ou le
gabarit.)*

**Les actions et l'anatomie de la liste (D531).** **« J'ajoute
`actions:` avec une liste d'opérations. Dans la définition d'une
opération, nous associons un icône que nous pouvons surcharger dans la
liste. »** — l'opération porte son icône à la déclaration (D432
enrichi), la liste peut la surcharger. Et l'anatomie : **« une liste
est comme pages »** (D507/D509) :

- **le header** — le titre, **les colonnes** (l'affichage tabulaire —
  « non visibles sur les widgets, sauf pour assurer les tris »), les
  filtres de la liste, **une icône servant d'entrée de menu pour les
  exports**, les icônes de l'ajout, de la modification, de la
  suppression — **« la zone des icônes est étendue aux actions ayant
  un icon »** ;
- **la zone page** — le contenu du tableau ;
- **le footer** — « éventuellement un sous-total ou un gabarit
  (nombre de lignes, commentaire…) et **des boutons pour les actions
  sans icône** ».

La répartition est réglée d'elle-même : l'action à icône monte au
header, l'action sans icône devient bouton du pied. *(En proposition :
le gabarit du pied aux variables — `{count}` le nombre de lignes.)*

**`size:` et `screen:` sur la liste (D532).** **« Comme la form, la
liste porte aussi une propriété `size` pour marquer la zone de
couverture de l'écran, et l'option `screen` pour indiquer sur quel
support la liste a été définie et/ou autorisée à s'afficher. »** La
cohérence s'étend : `size` = la couverture à l'affichage (D484/D503),
`screen` = le support de conception **et** l'autorisation (D450 — le
tableau `[pc paysage]` en défaut).

**La grammaire de `size:` (D533).** **« `size: 75%` → 75 % de l'écran
avec centrage ; `size: 90% 50%` → 90 % de la longueur de l'écran et
50 % de la hauteur ; ou `1000px 320px` pour un dimensionnement en
pixels. »** Une valeur = la part de l'écran, **centrée** ; deux
valeurs = **la largeur puis la hauteur** ; l'unité : `%` ou `px`. La
grammaire vaut **partout où `size` s'écrit** (D484 — la carte, les
sections, le kpi, la liste…).

**La confusion levée (D534 — clarifie D532).** **« J'ai introduit une
confusion entre dimension et size. »** La doctrine D484 départage :
**le formulaire s'ouvre à l'appel → `dimension:`** (D454 — la
surimpression, l'extension au clic) ; **la liste s'affiche →
`size:`** (D532 — la couverture de l'écran). Le « comme la form » de
D532 se lit : comme le formulaire porte ses propriétés d'emprise et de
support, la liste porte les siennes. **La grammaire D533 vaut pour les
deux mots** — une ou deux valeurs, % ou px.

**`size` aux surfaces, la pile des surimpressions (D535 — amende D454
et D534).** **« Size me convient mieux pour les 2 usages. Un form ou
une liste — ou, comme nous le verrons, les autres points —
apparaissent en surimpression par rapport aux actions antécédentes
cumulées. »** Les surfaces portent toutes **`size:`** : chacune
s'ouvre **au-dessus de la pile** des surfaces précédentes — la liste,
puis le formulaire, puis le sous-formulaire… — la surimpression est
la règle générale, non une extension particulière. Le `dimension:` du
formulaire (D454) devient `size:` ; **le couple D484 demeure au grain
du champ** (la vignette/la visionneuse, la mini-carte/la carte
dépliée, le picker déployé — `dimension:`).

**La propriété `style:` définie (D536).** Le retour sur `text` — et le
mot du socle (D461) reçoit son contenu : **« par défaut, ces éléments
sont pris dans le cadre du style global de l'application, mais nous
pouvons avoir besoin de les surcharger. Prévoyons une propriété
`style` qui regroupe la fonte, la taille et sa mise en forme. »** Le
défaut : **le style global de l'instance** (le thème — le paramètre
général, l'esprit D259) ; la surcharge à la cascade D461 (le type → le
champ → le nœud gui, le plus proche l'emporte). *(L'écriture en
proposition : `style: { font: Roboto, size: 14px, format: [bold,
italic] }` — le `size` intérieur = la taille de la police, le contexte
départageant du size d'emprise D535 (D458) ; `format:` parmi bold,
italic, underline, strike.)*

**Le résumé précisé (D537).** **« Le 1-1 affiche le title ou l'image
si elle est définie »** — le visage de l'entité (D386) vaut aussi à la
référence. **« Je confirme : cela doit rester petit par principe.
Cependant, nous pourrions avoir plusieurs sections (pour mêler des
affichages horizontaux et verticaux). Pas plusieurs pages, ni
plusieurs tabs. »** La restriction du résumé se précise : **plusieurs
sections** — l'organisateur et ses layouts (D489–D491) mêlent
l'horizontal et le vertical — mais **l'unique page et jamais
d'onglets** (D201 confirmé).

**Le graphique au résumé (D538).** **« Un summary peut contenir un
kpi ou un chart — à condition que son affichage reste modeste. »**
Les graphiques réutilisables (D243) entrent au résumé, la modestie en
condition (le petit par principe D201 s'étend à l'embarqué).
*(L'écriture en proposition : **`chart[<nom>]`** en items — la
famille des adresses, l'écho de `field[<nom>]` D460,
`operation[<nom>]` D511 et `template[<nom>]` D483.)*

**La troisième assise du chart (D539 — élargit D517).** **« Une
précision concernant les charts : elle s'appuie sur une entité ou un
champ de type `list of` ou `association with`. »** Le graphique se
fonde donc sur : l'entité (porteuse par défaut — D518), la liste
nommée (D517), **ou le champ-collection** — la composition ou
l'association de l'enregistrement du contexte : le graphique des
lignes de *la* commande affichée. *(L'écriture en proposition :
`on: <champ>` — le nom du champ `list of`/`association with` de
l'entité porteuse.)*

**Le chart, feuille du formulaire (D540).** **« Un form peut donc
avoir un composant chart comme feuille. Nous le faisons entrer de
fait dans summary. »** La conséquence est actée : `chart[<nom>]` est
un item du formulaire au même titre que les feuilles (D243 tenait la
promesse) — et le résumé, restriction du formulaire (D201), **en
hérite de fait** — la modestie en condition (D538).

**La tendance du kpi (D541 — la note pour plus tard).** **« Un kpi
peut avoir une notion d'historique. En exploitant l'historique d'une
entité, nous pourrions présenter la tendance. »** La piste consignée,
le détail différé : la valeur du kpi rejouée aux instants passés —
l'historisation (D411) et l'API temporelle « au plus proche ≤ date »
(D172) savent déjà le faire — la tendance en regard du chiffre. *(À
arbitrer au moment venu : la frontière avec D245 — « pas de
comparaison dans le socle » ; la tendance issue de l'historique n'est
pas la comparaison de périodes, la lecture à confirmer.)*

**Le QR code et le code-barres fichés (D542 — répare un manque).**
**« Avant de reprendre, avons-nous décrit les qrcode et code
barres ? »** La vérification : décidés — D252 (l'étiquette imprimée
du serveur) et D300 (les composants de **sortie**, « ils rendent la
valeur d'un champ », clôt Q56) — mais jamais fichés : l'inventaire
des feuilles les avait manqués. Réparé : **`qrcode` et `barcode`**,
deux feuilles jumelles à la fiche commune — la valeur convertie en
texte (D369) rendue lisible à la machine ; l'écran en lecture, le
PDF/l'étiquette en usage premier, Excel = la valeur source. *(En
proposition : le format du code-barres au crochet —
`barcode[ean13]`, `barcode[code128]` — le défaut `code128` ; la
saisie par scan reste hors D300 — les composants sont de sortie, la
question du scan pour plus tard si besoin.)*

**Le `size` des jumeaux (D543).** **« Pour le qrcode, `size` fournit
la taille unique pour les côtés : `size: 120px` — un qrcode de 120 px
de côté. Pour le code-barres, `size` fournit une taille en largeur ×
hauteur. »** Le carré par nature (une seule valeur — jamais deux), le
rectangle à la grammaire pleine (D533).

**Les deux modes du champ encodé (D544 — précise D300/D543).**
**« C'est un champ qui se décline en 2 modes : la saisie en mode
texte et l'affichage en mode graphique. La saisie peut nécessiter une
size différente de l'affichage. »** Le composant de sortie (D300) se
précise : **la saisie est la zone de texte du champ** (le régime du
texte — la taille D366, le masque), **l'affichage est le graphique**
— et chacun peut porter sa taille. *(L'écriture en proposition :
`size: { input: …, display: … }` — la forme courte `size: 120px` =
l'affichage seul, la saisie restant au régime du texte.)*

**La valeur sous les barres (D545).** **« L'affichage du code-barres
peut nécessiter l'affichage de la valeur de la référence sous le
code-barres. »** La valeur lisible à l'humain, sous la valeur lisible
à la machine — l'usage des étiquettes EAN. *(L'écriture en
proposition : `labels: true` — l'écho D516, la valeur au format du
champ ; défaut `false`.)*

**Le wizard précisé : l'habillage, l'opération d'étape, la démarche
(D546).** **« Le wizard avec steps/step est un habillage de
`tabs[wizard]` où chaque step est en fait un tab. »** Le squelette est
acté — le couple validé. **« Pour un wizard, un step peut contenir
une opération sur la validation »** — l'opération jouée au passage de
l'étape (l'acte D511, sa pré-exécution et son `validate:`
s'appliquant). **« Chaque entité dispose des opérations de base
`create`, `read`, `update` et `delete`, enrichies par d'autres
opérations »** — le catalogue de base (l'écho D422/D433). Et la
démarche s'élargit : **« le wizard permet de guider l'utilisateur
dans sa démarche : la création d'un nouvel enregistrement, la
modification/suppression d'un ensemble d'enregistrements répondant à
une liste… »** — les usages fondateurs : **imprimer les menus** (la
semaine → la liste des menus → le mode de diffusion), **créer un
client**, **mettre à jour une tournée** — le wizard orchestre les
opérations, il ne fait pas que des naissances. *(L'écriture en
proposition : `operation: <nom>` au step.)*

**La chaîne de pré-exécutions (D547 — amende D546, retire le
draft).** **« Le mode draft s'efface avec la possibilité de
pré-exécuter une opération. Avec un message de confirmation, si
l'utilisateur valide, il ne pourra pas revenir en arrière. Dans un
wizard, les steps avec une opération sont pré-exécutés. La
transformation n'aura lieu qu'à la validation définitive du
wizard. »** Le wizard se referme en une mécanique pure : **les
opérations d'étape se jouent en pré-exécution** (le chiffrage D511)
au fil de l'avance ; **la transformation unique à la validation
définitive** — la transaction finale (D232/D101) exécute tout d'un
coup ; **la confirmation validée barre le retour** — le chemin
navigable (D505) s'arrête au dernier step confirmé (le cliquet) ; la
proposition `draft:` est retirée — la pré-exécution la remplace.

**L'anatomie du wizard (D548).** **« Un wizard peut avoir un header
et un footer. Le fil d'Ariane peut être affiché en bas ou en haut de
la zone. Un wizard doit avoir une dimension (`size`), surchargeable
si le wizard s'inclut dans un formulaire. »** L'écho de `pages`
(D507) : l'entête et le pied optionnels, toujours visibles autour
des steps ; **le fil d'Ariane** (le chemin D505) en haut ou en bas —
*(en proposition : `mode: top` (défaut) `| bottom` — les bords
D525)* ; **`size:` obligatoire** (la pile D535, la grammaire D533),
**surchargeable au nœud incluant** quand le wizard s'emboîte dans un
formulaire (D455 — le plus proche l'emporte, D461).

**Les deux arbitrages (D549 — amende D548).** **« `size` est
optionnel. Sans valeur, ça prend l'espace disponible. En cas d'appel
depuis un menu, le wizard prend tout l'écran. »** Et le nom du fil :
**« plutôt que mode, je préfère `breadcrumb: none | top | bottom`. »**
— `none` masque le fil d'Ariane ; le défaut `top` (les étapes
visibles — l'esprit D504).

**L'aide à la décision au parcours (D550).** **« Bien sûr, nous
pouvons inclure des charts, des kpi ou des pivots pour apporter une
aide à la décision. »** Les graphiques entrent aux steps
(`chart[<nom>]` — D540, la famille entière) : le chiffre, la courbe
ou le croisé éclairent le choix avant le passage — l'aide à la
décision au fil du parcours guidé.

**Un seul wizard (D551).** **« Tout ce que nous venons de voir avec
wizard doit être également porté par `tabs[wizard]`… car cela doit
être le même objet. »** La ligne de D486 (« un seul list ») se
répète : **la surface `wizard` (`gui: wizards:`) et le conteneur
`tabs[wizard]` sont le même composant** — les steps-tabs, l'`if:` et
l'`operation:` d'étape (D546), la chaîne de pré-exécutions et la
transformation finale (D547), le cliquet, le header/footer (D548), le
`breadcrumb:` et le `size:` optionnel (D549), les graphiques (D550) —
tout vaut des deux côtés ; seule change la porte d'entrée (le menu ou
l'emboîtement).

**La séparation tabs/wizard (D552 — amende D504/D546, rend D551
caduque).** La revue demandée (« ça m'embête d'avoir 2 vocabulaires —
tabs/steps — pour un même objet ») s'est conclue : **« je valide la
séparation. Ça confirme mon ressenti. »** Les raisons consignées :
**la transactionnalité n'est pas un habillage** (le contrat du wizard
— rien avant la validation définitive, le cliquet, la session unique —
n'est pas un mode d'affichage) ; **les propriétés orphelines
trahissent** (`if:`/`operation:` sans sens sur un tab libre) ; **le
mot fait la chose** (step = l'étape d'une démarche, tab = le volet
d'un classeur). Concrètement : **le mode `wizard` quitte `tabs`**
(D504 amendé — restent top/bottom/left/right) ; **D551 devient : deux
objets, une parenté visuelle assumée** ; le wizard garde son
vocabulaire entier (steps/step, breadcrumb, la mécanique D547) et le
chemin de traitement (D505) devient son affaire seule ;
l'emboîtement passe par D455 (le wizard dans une page, sans tabs).

**Le contexte empilé de l'opération (D553).** **« Pour une opération,
le contexte ne représente pas seulement les informations de l'appel
en cours mais l'ensemble des contextes qui se sont empilés jusqu'à
l'usage de l'opération. »** La pile des surimpressions (D535) a son
pendant de données : **la pile des contextes** — l'opération invoquée
au fond de la pile (la liste → le formulaire → le wizard → le step)
voit tout ce qui s'est empilé : le périmètre de la liste,
l'enregistrement du formulaire, le transitoire du wizard.
« L'origine de l'appel » de D455 se relit : **la pile entière, pas le
dernier maillon.**

**Le dashboard aux deux auteurs (D554 — unifie D204/D247).** La
vérification demandée (« est-ce bien cela ? ») : oui — D204 («
l'utilisateur sélectionne une entrée du menu ou laisse vierge, et
choisit les widgets ») et D247 (« le pool : les widgets de ses
modules, sous sa confidentialité ») disent exactement cela. Et la
formulation de l'auteur unifie : **« le dashboard est à la charge du
technicien — un panel de dashboards accessibles depuis un menu ou une
page d'accueil. Le pool est un dashboard personnalisable à
l'utilisateur en piochant dans les widgets disponibles. »** — **la
page d'accueil composée est un dashboard dont l'utilisateur est
l'auteur** : le même objet, deux auteurs — le technicien déclare le
panel, l'utilisateur compose le sien du pool.

**Le squelette de dashboard (D555 — précise D554).** **« Le
technicien décrit donc un ou plusieurs squelettes de dashboards —
avec des widgets contraints et des widgets libres. »** Le squelette :
**les widgets contraints** (fixés par le technicien, non retirables)
et **les emplacements libres** — l'utilisateur y pioche du pool
(D247). *(L'écriture en proposition : l'item **`free`** —
l'emplacement libre, répétable.)* La page d'accueil composée (D554)
devient le cas limite : **le squelette entièrement libre.**

**L'emplacement `_` et l'icône du choix (D556 — amende D555).**
**« Dans un dashboard, un widget interchangeable doit faire
apparaître un icône qui permette à l'utilisateur de choisir un widget
disponible selon son propre catalogue ou par sa libération. »** —
l'emplacement libre porte son icône : le choix s'ouvre parmi les
widgets disponibles — le catalogue propre de l'utilisateur (le pool
D247), ou un widget rendu disponible par la libération d'un autre
emplacement. Et l'écriture est actée : **« "_" me parle plus que
"free" — free pouvant être lui-même un nom de widget »** — l'item
**`_`**, la collision évitée par construction.

**L'accueil au module actif (D557).** **« Une page d'accueil fait
référence à un dashboard selon le module activé. »** L'accueil n'est
pas un tableau figé : **le module actif fournit son dashboard** — en
changeant de module, l'utilisateur change de tableau de bord (le
squelette du technicien, ses emplacements `_` composés — D554–D556).

**La homepage aux trois pointes (D558 — amende D557).** **« J'hésite
sur la homepage : la limiter à un dashboard m'embête. La homepage
doit pouvoir pointer une liste, un dashboard ou une page vide. »**
L'accueil pointe : **une liste** (l'entrée du menu — la lettre de
D204 retrouvée), **un dashboard** (celui du module activé — D557), ou
**la page vide** (D191). La composition personnelle vit désormais aux
emplacements `_` des squelettes (D555–D556).

**Le template précisé (D559).** Trois apports : **« `margin:` pour
définir les marges en mm »** ; **« le paragraph peut être un
gabarit — utilisable dans le cas d'une lettre »** — le publipostage
naît : le texte fixe (D488) sait porter les variables de
l'enregistrement (« Cher {customer}, votre commande {number}… ») —
l'étoffement Q55 commence ; **« la déclinaison par langue se porte
sur chaque item »** — la lecture de D253 s'amende : **un seul
gabarit**, ses items déclinés par langue (la mécanique D465), non un
gabarit entier par langue.

**Le publipostage étoffé (D560).** **« Paragraph doit être étoffé
pour disposer d'un mode publipostage riche et facile à intégrer. »**
L'étoffement proposé — cinq briques *(toutes en proposition, à
arbitrer)* : **(1) les variables** — `{champ}` rendu au format de la
langue du document (la conversion D369), les chemins de référence
traversés (`{customer.address.city}` — D71) ; **(2) la condition** —
`if:` sur le paragraphe (le bloc ne s'imprime que si — D90, l'écho
D546) ; **(3) la mise en forme** — `style:` (D536) et les titres à
quatre niveaux (D250) ; **(4) la source** — le texte en place
(décliné par langue D559) ou le dictionnaire du module (D440) ;
**(5) le multi-alinéas** — un seul `paragraph` porte plusieurs
alinéas (la lettre s'écrit d'un bloc).

**La sixième brique (D561 — complète D560).** **« L'affichage d'une
liste sous forme de bullet points ou d'indices. »** La collection
entre dans la lettre — les commandes en retard énumérées en puces ou
numérotées. *(L'écriture en proposition : la variable-collection au
crochet — `{overdue[bullets]}` / `{overdue[numbers]}` — chaque
élément rendu par son `title` (D465).)*

**Mustache + markdown (D562 — remplace les écritures de D560–D561).**
**« Une combinaison dans paragraph du mustache et du markdown doit
couvrir les différents cas, je pense. Il y aura des limites portant
sur les composants (pas de liste, pas d'image…). »** Deux standards à
la place des briques maison : **mustache** — les variables
`{{champ}}`, les chemins `{{customer.name}}` (D71), **les sections**
`{{#overdue}}…{{/overdue}}` (l'itération des collections — la puce
markdown dans la section fait la liste D561) ; **markdown** — la
forme : les titres (`#`…`####` — les quatre niveaux D250), le
gras/l'italique, les puces et les indices, les tableaux. **Les
limites** : les composants n'entrent pas dans le texte — pas de
composant liste, pas d'image (la syntaxe `![…]` exclue — l'image
reste `picture`, hors du texte) ; **l'`if:` d'expression demeure la
propriété de l'alinéa** (D90 — mustache est sans logique) ; la source
(en place ou dictionnaire D440) et le multi-alinéas vont de soi. Le
champ texte de l'utilisateur reste nu (la frontière D261 — le
markdown n'entre pas dans la donnée).

**Le comportement d'`url` (D563).** La question (« le type url
existe-t-il ? ») a relevé le manque : le type existait (D391, la
règle générale), son comportement non. Les cinq points validés :
**(1) la lecture = le lien** — le clic ouvre **dans un nouvel onglet
du navigateur**, jamais dans l'application (la pile D535 intouchée) ;
**l'icône du lien externe en post-zone** (l'anatomie D271, la
post-zone venant du type D391) ; **(2) la modification** — la zone de
texte, la validation intégrée ; l'icône post-zone demeure (vérifier
sans quitter la saisie) ; **(3) la cellule** — l'ellipse (D296), le
clic ouvre, le double-clic édite (D446) ; **(4) le template** — le
texte et le lien actif ; Excel/CSV — la valeur nue, ré-importable ;
**(5) pas de prévisualisation au socle** — l'aperçu de la cible = un
hook (la ligne D263).

**Les quatre destinations du template (D564).** **« Le template est
utilisé pour générer un document Word, PDF, Excel ou un mail. Le
template porte une propriété `format` qui précise le format de
destination. »** Le gabarit s'ouvre au-delà du PDF (D212/D250 — qui
reste le défaut naturel, *en proposition*) : **`format: pdf | word |
excel | mail`**. Le mail rejoint le publipostage (D562) — la lettre
mustache+markdown devient le corps du message ; l'Excel rejoint le
modèle des exports (D445).

**Le défaut et l'extension (D565 — solde D564).** **« Le format
pourra être étendu à d'autres formats en fonction des besoins à
venir. PDF en défaut me convient. »** Le défaut `pdf` acté ; le
catalogue des formats s'étend par les besoins — la ligne des hooks
(D408), sans toucher au moteur.

**La signature formelle du nœud (D566 — clôt le point).** La synthèse
proposée, arbitrée point par point par l'auteur :

**(0) `visible:` — une condition** : « dépend d'une condition ; si la
visibilité est false, **le composant n'est pas déclaré ni
construit** » — l'absence, pas le masquage.
**(1) La clé — l'adresse universelle `<type>[<nom>]`** :
« `render[<nom>]` pour représenter sections/section/tabs/tab… —
chaque composant ui a donc `<type>[<nom>]` avec type : `render`,
`field`, `operation`, `template`, `chart`, `widget`… » *(la lecture :
les écritures courtes — `- section:` — demeurent au YAML, l'adresse
est la forme canonique du moteur.)*
**(2/3) Les propriétés à l'évaluation paresseuse** : « le composant
pour la restitution consulte les propriétés, dont l'évaluation
s'effectuera **à la sollicitation**. Syncytium ne tente pas de
construire toutes les propriétés — le composant a ainsi ses propres
propriétés. `component` permet de convertir ou de remplacer le nom du
type. »
**(4) Les enfants au champ déclaré** : « les enfants se déduisent
comme décrit [les alternances D489/D490/D546, l'abréviation
`fields:`]. En définissant un type de composants, **on précise le nom
du champ couvrant les enfants** [items, steps…]. Ainsi, le moteur
évalue **tous les enfants de la feuille à la racine avant
d'appeler/de construire le composant** » (D455 tenu).
**(5) La pile de contexte** : « fournie depuis la racine du
composant » (D553 généralisé à tout nœud).
**(6) Les états = des propriétés**, « évaluées à la demande » (le
régime du 2/3).
**(7) Le hook** : « ajoute au catalogue de composants, pour un nom
donné, **un objet qui se chargera de gérer le composant et son rendu
dans les différents formats — Web, PDF, Word, Excel, Email…** »
(les destinations D564 + le Web).

**Les deux amendements de la signature (D567 — amende D566).**
**(4) Les enfants aux noms multiples** : « les enfants peuvent être
dans un ou plusieurs noms : header, page, footer. **Chaque élément
est facultatif.** » — le type de composant déclare le **ou les**
champs d'enfants. **(2) `visible:` devient vivant** : « je change de
fusil d'épaule — nous pouvons inclure une petite phase dynamique :
**en fonction de la valeur d'un champ ou d'un contexte, un élément
peut devenir visible ou masqué** (cas d'un toggle pour gérer une
saisie conditionnelle). » Le composant est construit, sa visibilité
s'évalue **au fil de la valeur** — l'écho du recalcul à l'écran
(D255) ; le « ni déclaré ni construit » de D566 s'efface.

**La section repliable (D568).** **« La possibilité de refermer ou
d'ouvrir si le composant a la propriété `dropdown: true`, avec un
icône pour matérialiser l'affichage ou pas. »** La section se replie
et se déplie — l'icône (le chevron) dit l'état. *(La collision avec
la feuille `dropdown` notée — le contexte départage, D458 ; le défaut
en proposition : la section s'ouvre dépliée.)*

**Les quatre valeurs (D569 — solde D568).** **« `dropdown: false |
true (avec open par défaut) | openned | closed`. »** — `false` (le
défaut : la section fixe), `true` (repliable, **ouverte par
défaut**), `opened` (repliable, ouverte — l'équivalent de true),
`closed` (repliable, **fermée d'entrée**). *(L'orthographe consignée
`opened` — la coquille « openned » corrigée au registre.)*

**Q60 s'ouvre — l'opération définie (D570).** La distinction
opération/fonction est actée, et l'opération reçoit sa définition :
**« une opération réalise une séquence de traitements sur au moins un
enregistrement, une liste d'enregistrements, une liste
d'enregistrements sélectionnés, un module ou l'application »** — les
cinq portées. **« Une opération est définie par son nom. Une
opération ne se construit pas dans la configuration : elle se
construit toujours à l'aide d'un hook de code. Un hook de code
définit une signature et un code propre au langage exploité par
Syncytium. »** **Les hooks de base du socle : `create`, `read`,
`update`, `delete`, `promote`, `demote`, `generate`, `download`,
`print`, `export`, `import`.** Les issues : **« une opération ouvre
un écran, permet le téléchargement d'un fichier, déclenche une
impression, affiche un message de fin de traitement, ou ne retourne
rien »** — et **« une opération peut éventuellement appeler une
fonction »**.

**La fonction définie (D571).** **« Une fonction est utilisée par les
champs calculés. Elle retourne toujours une valeur ou une liste de
valeurs — chaque valeur a l'un des types couverts par le modèle de
données. Une fonction est déclenchable si l'un des paramètres est
modifié »** (l'écho du recalcul D255/D298). **« Syncytium construit
un graphe d'exécution pour que l'ordre de calcul des fonctions soit
cohérent. Tout comme une opération, une fonction est un hook de code.
Une fonction ne déclenche aucune opération »** — la pureté : la
fonction calcule, l'opération agit ; l'appel ne va que dans un sens
(l'opération peut appeler une fonction, jamais l'inverse).

**Les signatures et la librairie d'exploration (D572).** **« Le hook
de code d'une opération n'a pas la même signature que le hook de code
d'une fonction »** — la signature des fonctions fut abordée au
domaine 2 ; **Q60 finalisera les deux définitions**. Et le chantier
consigné : **« le traitement du hook de code nécessitera une librairie
qui explore le modèle de données de façon transparente »** — l'auteur
du hook lit les entités, les champs, les liens sans connaître le
stockage.

**Les paramètres dynamiques (D573).** **« La configuration porte des
éléments statiques, qui varient d'une version à l'autre. J'introduis
des paramètres "dynamiques" : la valeur initiale est définie dans la
configuration, et modifiable par le technicien via le module
d'administration. »** — la troisième temporalité : le statique (la
version), le dynamique (l'administration), la donnée (l'utilisateur).
*(L'écho : les paramètres généraux déjà croisés — le seuil
mono/multi-ligne D366, le seuil des radios D468, le fond de carte
D259 — ont vocation à rejoindre cette famille.)*

**Les dix-sept opérations de socle (D574 — complète D570).** Les
quatre candidats acceptés (« les 4 candidats me conviennent ») et
deux ajouts de l'auteur : **« nous pouvons aussi ajouter `notify` —
pour générer une information de notification aux utilisateurs — et
`refresh` pour déclencher un recalcul d'un graphique ou d'un champ
calculé. Au final, cela nous fournit 17 opérations de socle. »** Le
catalogue scellé : **`create`, `read`, `update`, `delete`,
`promote`, `demote`, `duplicate`, `generate`, `download`, `print`,
`send`, `export`, `import`, `report`, `restore`, `notify`,
`refresh`** — dix-sept. *(Les parentés notées : l'opération `notify`
et l'effet `notify` (D432) se rejoignent — la notification comme
traitement à part entière ; `restore` matérialise D172–D174 ;
`report` le « à la demande » de D406 ; `send` l'issue du format
`mail` D564.)*

**Les fonctions : les quatre arbitrages fondateurs (D575).**
**(1) `sum` remplace « somme »** — l'anglais du catalogue (D301) vaut
aussi aux fonctions ; **« à ajouter les sommes pondérées. Par
extrapolation, nous pouvons inclure les calculs matriciels basés sur
les sommes et les produits »** — la famille somme-produit s'ouvre.
**(2) `min`/`max` universels** : « utilisables pour tous les types
car ils sont triables. Min : le plus petit, Max : le plus grand » —
les règles de tri (D368 et suivantes) font l'ordre, le nul y compris.
**(3) « Les agrégats couvrent les listes ou les associations »** —
le domaine de l'agrégat = la collection (l'écho D539).
**(4) La famille du contexte courant, à décrire** : « l'utilisateur
courant, la localisation, la date et heure courante, l'instance,
l'application, le module, l'entité, le champ… **ou des propriétés
liées aux éléments de configuration** » — le pont avec l'entité
contexte (D254) et les paramètres dynamiques (D573 — « d'où ma
remarque en commençant »). « En intégrant ces éléments, cela
complétera les familles abordées. »

**Les agrégats-collections fusionnés, min/max au double régime
(D576).** **« Les points 1 et 6 sont regroupés »** — les collections
se fondent dans les agrégats : une seule famille. **« First, last,
any or exists complètent le catalogue disponible. »** Et le double
régime de min/max : **« le min/max s'applique à un agrégat ou à une
liste de valeurs définies ou calculées — ex : `max(0,
sum(stock.quantity))` »** — l'agrégat sur la collection, ou le
variadique sur les valeurs (le borné d'écriture).

**Les opérateurs numériques (D577).** **« Pour les numériques et pour
simplifier l'écriture, nous utiliserons les opérateurs : `+`
(l'addition), `-` (la soustraction), `*` (la multiplication), `/`
(la division réelle), `\` (la division entière), `%` (le modulo),
`!` (le factoriel) et `**` (la puissance). Nous pouvons ajouter
`exp`, `sin`, `cos`, `tan`… »** — l'écriture d'abord, les
transcendantes en fonctions.

**Le texte (D578).** **« Le texte se retrouve avec la concaténation
via le gabarit, l'extraction via les regex, des extractions de
chaîne, et des règles de conversion. »** — pas de fonction de
concaténation : le gabarit (mustache — D562) la porte ; les regex et
les extractions de chaîne en fonctions ; les conversions par la
règle D579.

**Les fonctions de type — l'iceberg (D579).** **« La géodistance
montre le haut de l'iceberg. En fait, un type emmène avec lui des
fonctions dédiées pour combiner des valeurs et obtenir une valeur
dans le type dédié. Ici, `distance` or `euclide` calcule la distance
entre 2 localisations. »** — le catalogue des fonctions se
décentralise : **chaque type porte les siennes** (la ligne D408 — le
type-hook emmène ses fonctions, comme il emmène son composant D458).
Et **la conversion** : **« une forme de fonction simplifiée, d'une
valeur d'un type vers le type d'appartenance de la conversion — une
fonction dont le nom est le nom du type assure la conversion. La
signature d'un type doit alors porter en elle la conversion
intrinsèque. »** — `text(x)`, `integer(x)`, `date(x)`… (l'écho
D458 : le nom du type, partout où le type se matérialise) ; la
conversion en texte (D369) devient le cas particulier d'une règle
générale portée par la signature du type.

**Les agrégats portés par la collection (D580 — pousse D579).**
**« Je vais pousser l'approche des fonctions de type aux fonctions
des agrégats : sum, min, max, avg… sont portées par la liste
(`list of`) ou l'association (`association with`). Ex :
`sum(commandes.montant)` devient `commandes.sum(montant)`. »** La
bascule actée, avec les trois précisions : **dans la parenthèse,
l'élément est le contexte implicite** — le filtre perd son alias
(`lignes.sum(montant if etat = "facturée")`) et la pondérée se lit
(`lignes.sum(quantite * prix)`) ; **min/max gardent leurs deux
formes** — la méthode (l'agrégat) et la fonction libre variadique
(`max(0, x)` — D576) ; **`count()` sans argument**
(`commandes.count()`) ; **la forme contextuelle demeure** quand la
collection est le contexte — l'assise du chart (`y: sum(total)` —
D517), le préfixe ne s'écrivant que pour désigner ailleurs.

**Les opérateurs, le parenthésage, le typage (D581).** La poussée
suivante validée : **les opérateurs sont des fonctions de type à
l'écriture symbolique** — **la signature du type déclare sa table
d'opérateurs** (les combinaisons d'opérandes admises, le type du
résultat : `amount + amount` → amount à devise compatible,
`date - date` → duration, `date + date` → l'erreur, `text + text`
n'existe pas — le gabarit D578) ; **le parenthésage** groupe, **la
précédence fixée** : `!`, puis `**`, puis `* / \ %`, puis `+ -`,
puis les comparaisons, puis les logiques ; **la justesse des types =
le typage statique à l'ingestion** — l'expression s'infère **de la
feuille à la racine** (le parcours de D566), toute combinaison
impossible est une erreur d'ingestion (D330/D344 — jamais à
l'exécution), le type final doit être celui de la destination ; **la
promotion implicite seulement sans perte** (integer → decimal), la
conversion explicite sinon (la fonction au nom du type — D579).

**Les comparateurs, des fonctions (D582).** **« Naturellement, les
comparateurs sont alors des fonctions. »** — `=`, `!=`, `<`, `<=`,
`>`, `>=`, `in` : des fonctions de type à l'écriture symbolique, le
résultat `boolean` — **l'ordre vient des règles de tri consignées par
type** (D368 et suivantes — le nul y compris), l'égalité de
l'équivalence ; `in` porte l'appartenance (la liste, la plage). Le
paysage final : **le catalogue central s'est vidé dans les types** —
restent au centre le contexte courant (D575), les rares libres
(`max(0, x)` variadique) et le gabarit (D562/D578).

**`iif` et `select` (D583 — complète D582).** **« Dans les
comparateurs, j'intègre `iif` et `select`. »** Le conditionnel entre
au langage : **`iif(condition, alors, sinon)`** — le si en ligne ;
**`select`** — la sélection multi-branches *(l'écriture en
proposition : `select(<expression>, <valeur>: <résultat>, …,
<défaut>)` — le dernier sans clé fait le défaut)*. Le typage statique
tient : **toutes les branches d'un même type** (ou la promotion sans
perte — D581), l'inférence feuille → racine traverse le
conditionnel.

**`select`, une fonction du type ; la clé `"..."` (D584 — amende
D583).** **« `select` est une fonction du type :
`state.select(draft: "En cours", confirmed: "Validée", "...":
"autres")`. »** — la doctrine D579/D580 s'applique au conditionnel
même : la valeur porte son select ; et **la clé `"..."` marque la
branche par défaut** (l'écriture du dernier-sans-clé s'efface).

**Le type `label` (D585).** La langue entre aux expressions : **« nous
pouvons introduire un type `label` qui permet d'accéder aux
différents labels définis dans le catalogue des labels (D440). Un
label peut couvrir un gabarit paramétrable. Les gabarits paramétrés
nommés peuvent être utilisés sur plusieurs objets différents. Ex :
`labels: { mon_nom: { fr: "{prenom} {nom}", en: "{nom} {prenom}" } }` —
l'usage : `label(mon_nom, { prenom: "Aymeric", nom: "Lesert" })`. »**
Le type `label` rejoint le modèle : la fonction au nom du type (D579)
construit la valeur depuis le catalogue, les paramètres nommés
nourrissent le gabarit — **et l'ordre des mots change avec la langue**
(fr : prénom-nom, en : nom-prénom) : l'argument même des gabarits
nommés. La composition ferme la boucle du select :
`state.select(draft: label(status_draft), …)` — plus une chaîne crue
dans les formules.

**L'enregistrement en paramètre du label (D586 — complète D585).**
**« Pour un label paramétrable nommé, nous pouvons passer en
paramètre l'enregistrement. Le nom des champs devient les
paramètres. »** — `label(mon_nom, customer)` : les champs de
l'enregistrement nourrissent le gabarit par leurs noms, sans les
épeler — le raccourci du publipostage (l'écho du title-gabarit D465
et de la lettre D562 : un seul mécanisme, du visage de
l'enregistrement à la formule).

**Le catalogue des fonctions libres (D587).** **« Les fonctions
libres font partie d'un catalogue. `min`, `max`, `sum`, `avg`… sont à
inclure. Le catalogue s'enrichira, si besoin. »** — les formes
variadiques scalaires (`max(0, x)`, `sum(a, b, c)`…) doublent les
méthodes de collection (D580) ; l'extension par les besoins — la
ligne des hooks (D408/D565).

**`context.settings` et les deux modes du paramètre (D588 — précise
D573).** **« `context.settings.<nom>`, où `<nom>` fait référence soit
à un élément de configuration statique, soit dynamique »** — la
déclaration au bloc settings porte le mode :

```yaml
settings:
  application:
    marge: { mode: dynamic, value: 5% }   # surchargeable à l'administration (D573)
    tva:   { mode: static,  value: 20% }  # la valeur de la version
```

**« Les paramètres dynamiques portent une valeur par défaut,
surchargeable via le module d'administration. »** Le statique vit et
meurt avec la version ; le dynamique naît avec elle et vit à
l'administration. *(L'exemple normalisé dans la forme — chaque
paramètre : `{ mode:, value: }` ; le nom se résout à la cascade des
settings (D349/D360) ; chaque paramètre est typé — le typage statique
D581 vaut sur `context.settings.marge` comme partout.)*

**Le type du paramètre, le nom `context` acté (D589).** **« Un
paramètre porte aussi `type:` (par défaut : `text`). »** — la
déclaration complète : `marge: { mode: dynamic, type: percentage,
value: 5% }` ; le typage statique (D581) s'appuie sur la
déclaration. Et **le nom du contexte est acté : « le nom "context" me
convient. Si une entité se nomme "context", l'entité prend le pas.
Lors de l'ingestion, un warning sera nécessaire. »** — la préséance à
l'entité, le warning à l'ingestion (l'esprit D344). **L'inventaire
des champs consigné tel que proposé** : `user` (la référence
traversable), `location` (D291), `now` (datetime — la date par
conversion D579), `instance`/`application`/`module` (les noms),
`entity`/`field` (la réflexion), `file`/`page`/`pages` (au rendu d'un
document seulement — D254), `settings.<nom>` (D588) ; **la
disponibilité selon le contexte** (D254) et la lecture du **sommet
consolidé de la pile** (D553).

**L'abréviation du paramètre (D590).** **« Sur le setting,
`marge: 10%` — l'abréviation (mode: static et type: text). »** La
forme courte aux défauts : `marge: 10%` ≡ `{ mode: static,
type: text, value: 10% }` — la doctrine des abréviations, comme
partout.

**La cascade des settings (D591 — complète D588).** **« Les settings
dans le module ou l'entité viennent compléter ou surcharger la valeur
des settings définis dans l'application. »** — les trois étages
(l'application → le module → l'entité), le complément ou la
surcharge, **le plus proche l'emporte** (la ligne D360/D461) ;
`context.settings.<nom>` résout au plus proche du lieu d'évaluation.

**Le graphe d'exécution acyclique (D592 — contraint D571).** **« Sur
les graphes d'exécution, nous devons inclure une contrainte : ils
doivent être acycliques. »** — le cycle de calcul (a dépend de b qui
dépend de a) est **une erreur d'ingestion** (l'esprit D330/D344 — le
contrôle statique, comme le typage D581) ; la ligne des graphes
acycliques du projet (les composants D455, la hiérarchie des groupes)
se poursuit.

**Les valeurs nommées de la fonction (D593 — précise D571).** **« Une
fonction retourne une valeur (par défaut). Elle peut retourner
plusieurs valeurs nommées — cas d'une regex avec des groupes nommés à
affecter à plusieurs champs. »** La déclaration s'élargit :
`result: <type>` (le défaut — une valeur) ou `result: { prenom: text,
nom: text }` (les valeurs nommées, chacune typée) ; **un seul calcul
nourrit plusieurs champs** — le graphe d'exécution (D571) y gagne
l'appel unique. *(L'écriture de l'affectation en proposition : le
champ calculé lie la valeur nommée par le point —
`extract_name(raw).prenom`.)*

**La transaction tenue ouverte (D594 — simplifie D511/D547).** **« Nous
n'allons pas implémenter 2 modes par opération. Une opération ajoute
des éléments dans une transaction. Le preview exécute et attend une
validation de l'utilisateur — la transaction reste active. Si
l'utilisateur valide, la transaction est validée. Si l'utilisateur
annule ou stoppe l'exécution de l'opération, la transaction est
annulée. »** La pré-exécution n'est pas un mode : **c'est l'exécution
même, suspendue avant le commit** — un seul code, une seule
mécanique ; **le chiffrage (D511) = le contenu de la transaction
active** (les ajoutés/modifiés/supprimés s'y lisent), la relecture
(D431) le présente ; **le wizard (D547) = une transaction tenue
ouverte au fil des steps**, validée à la validation définitive,
annulée à l'abandon — les lots de transactions à agrégats (D101) en
socle. Le paramètre de mode disparaît de la signature du hook.

**Les quatre fonctions du hook d'opération (D595 — précise D594).**
**« Le hook de l'opération a plusieurs fonctions : `execute`,
`confirm`, `commit` et `rollback`. »** — l'objet du hook (D566.7)
prend forme : `execute` remplit la transaction (D594), `confirm`
produit la relecture (le chiffrage au gabarit — D511/D431), `commit`
scelle (et porte l'après-coup — l'envoi, l'impression), `rollback`
défait proprement. Et **« une opération peut se valider ou s'annuler
automatiquement selon les paramètres de l'appel de l'opération »** —
l'auto-commit (l'opération automatique D428, le `validate: false`
D431) comme l'auto-annulation, décidés à l'appel.

**`commit: auto | confirm` (D596 — renomme D431).** **« Plutôt que
validate, je préfère `commit: auto | confirm`. »** La propriété de
l'opération se renomme — le mot s'aligne sur la fonction du hook
(D595) : **`commit: confirm`** (le défaut — la relecture avant le
scellé, D196/D431) ou **`commit: auto`** (la validation automatique).
*(La forme riche en proposition : `commit: { mode: confirm, message:
<gabarit> }` — le message de D511 s'y loge ; les écritures
`validate:` balayées dans les fiches.)*

**L'issue au commit, le message-label (D597).** **« L'issue est
portée par le commit. Le commit d'une opération retourne l'issue.
Syncytium lira la valeur retournée [et] déclenchera l'action qu'elle
contient. »** — la fonction `commit` (D595) retourne l'issue (l'écran,
le téléchargement, l'impression, le message, rien — D570), **le
moteur lit et déclenche** : le hook ne manipule jamais l'interface,
il rend une valeur. Et **« le message du commit est un label — à
rapprocher du catalogue de labels »** (D585) : le message en place ou
la référence au dictionnaire (D440), le gabarit nourri de la
transaction (D586/D594) — la langue réglée par construction.

**Les valeurs nommées de l'opération (D598 — précise D597).** **« Les
noms du label sont portés par l'opération — `nb_creations`,
`nb_updates`, `nb_deletes`… Et ces valeurs peuvent être utilisées par
le message de confirmation. »** L'opération expose ses valeurs
nommées : **les comptes de la transaction** (le chiffrage D594,
nommé — nb_creations, nb_updates, nb_deletes…) et les résultats
propres de l'`execute` (D511) ; le message-label les consomme en
paramètres de gabarit (D585–D586) — `message: { fr: "{nb_creations}
factures créées, {nb_updates} commandes mises à jour" }`.

**L'inviolabilité de la librairie (D599 — clôt les signatures et
Q60).** **« Bien sûr, la librairie mise en place assure
l'inviolabilité des règles et des droits. »** — le hook est un
citoyen du moteur, jamais un super-utilisateur : les droits (D196),
la confidentialité (D25/D364), la validation (D307), la concurrence
par champ (D111) **ne se contournent pas** — la librairie
d'exploration (D572) est l'unique porte, et elle porte les règles.
**Q60 EST CLOSE** : les 17 opérations de socle (D574), les fonctions
unifiées dans les types (D579–D587), le contexte courant et les
paramètres (D588–D591), les graphes acycliques (D592), les signatures
des hooks (D593–D599) — le catalogue des fonctions est complet.

**Le pont de l'opération : le hook et la déclaration (D609 — referme
le point 8 de la relecture des hooks).** La clé de l'auteur :
**« l'opération elle-même est un hook de code. Par contre,
l'utilisation de l'opération dans l'application répond à plusieurs
usages dépendant du mode de déclenchement. La déclaration des
opérations permet de décrire une opération et son mode de
déclenchement quand il n'est pas lié à l'IHM — par exemple, sur une
mise à jour, sur la réception d'un fichier. »** Les deux plans : **le
hook = l'opération** (l'objet D595, la transaction D594) ; **la
déclaration (`operations:` — D432) = l'usage** — le nom, les
paramètres, le `commit:` (D596), la garde (D430), et **le
déclenchement hors-IHM** : `when: <expression>` (D428), `every:
continuous` (D435 — « sur une mise à jour »), le calendaire (D434),
**l'événement de connecteur** — acté : « utile pour traiter des
webhooks ou pour déclencher automatiquement un process d'import »
*(l'écriture en proposition : `when: <nom du connecteur>` — le
contexte départage, D458)* ; l'IHM lie sans déclaration de
déclenchement (le bouton D511, la colonne D444, les actions D531, le
step D546, le menu D439). **Et la composition déclarative est
actée** : **« une opération peut être une liste d'opérations
disponibles dans le socle »** — les effets de D432 se relisent comme
**des références aux hooks du socle** (`notify` → l'opération notify,
`document` → generate, `set` → update, `function` → un hook de
fonction) : « ne se construit pas dans la configuration » (D570)
signifie *pas de code* — l'orchestration de références, elle, est
déclarative. La séquence s'exécute **dans la même transaction tenue
ouverte** (D594) ; le chiffrage, le confirm et l'issue valent pour
les deux formes.

**La liaison au stockage (D610).** **« Le fichier `connectors.yml`
décrit la liste des connecteurs disponibles. Le modèle de données est
attaché à un connecteur : celui qui permet la lecture/écriture. Pour
les migrations/transformations, nous avons besoin de définir un
connecteur d'entrée et éventuellement un connecteur de sortie. À la
racine du projet : `connector: { storage: main_db }` ou
`connector: { storage: main_db, from: legacy_db }`. Le `from` décrit
la procédure de migration/transformation. »** — le modèle vit sur
**un** stockage (la question de la surcharge par entité se referme :
la base legacy passe par le `from`, pas par une liaison éparse) ; et
le chantier suivant est nommé : **« pour ce point, nous devons
décrire une configuration basée sur les éléments déjà vus (que nous
allons étendre) »** — la procédure de migration/transformation.

**Le câblage par rôles nommés (D611 — précise D610).** **« Dans
`connector`, nous pouvons déclarer les connecteurs "storage", "smtp",
"location", "siren"… — des noms exploitables par Syncytium pour
différents items. Le nom est défini par le hook du composant et
disponible dans le contexte d'exécution. En cas de besoin, le
connecteur peut être surchargé par un autre connecteur. Par exemple,
pour l'opération `send`, le connecteur attendu est "smtp" — mais s'il
existe une propriété `smtp` sur l'opération send, elle peut préciser
un connecteur compatible avec le smtp. »** Le bloc `connector:` de la
racine est donc **le câblage des rôles** : chaque hook (opération,
type, composant) **nomme le rôle dont il a besoin** (`send` → smtp,
la géolocalisation → location, le stockage → storage, le `from` de la
migration — D610) ; la racine associe le rôle au connecteur déclaré
(connectors.yml) ; **la surcharge locale** par la propriété au nom du
rôle, vers un connecteur **compatible** (la famille — D605). *(La
porte ouverte notée : le rôle « siren » — la vérification des
types-identifiants par connecteur.)*

**Le câblage précisé — les quatre réponses (D612 — complète D611).**
**(1) « Le câblage n'est pas toujours requis, pour des questions de
simplicité. Dans les cas les plus complexes, le câblage doit être
explicite. »** `connectors.yml` décrit le catalogue du fonctionnement
de l'application ; le mapping entre 2 bases = 2 connecteurs a minima ;
et la trouvaille : **« dans le cas de l'affichage d'une carte, nous
pouvons définir plusieurs connecteurs et, en fonction de l'écran,
utiliser l'un ou l'autre »** — le choix du connecteur peut suivre le
contexte d'affichage. **(2) « La famille est un type de connecteur
(`type:`). Pour les cas les plus simples, le type est le nom du
connecteur »** — l'écho de D458 : le nom porte le type quand la
sobriété suffit (`smtp:` est un smtp ; `marketing_mail: { type:
smtp, … }` quand le nom se libère). **(3)** Plusieurs connecteurs en
service simultanément — mais **« quelques connecteurs suffiront au
bon fonctionnement »** : la sobriété TPE. **(4) « Le hook de code lit
le connecteur via `context.connector.<rôle>` »** — acté ; **« quant à
l'utilisation de plusieurs connecteurs par un item, cela n'est pas
exclu. »**

**Le type et l'implémentation (D613 — clarifie D611–D612).** Après la
relecture approfondie de l'auteur : **« "postgresql" n'est pas un
type. "storage" est bien le type. Par contre, "postgresql",
"sqlserver", "mysql", "oracle"… constituent une implémentation
compatible avec "storage". »** Les trois notions fusionnent : **le
type = la famille = le rôle** — `storage`, `smtp`, `location`,
`siren`… porte **le contrat** (D605), le câblage (D611) et le nom du
cas simple (D612) ; **l'implémentation** (`postgresql`, `ban`,
`smtp_std`…) le remplit — la compatibilité se juge au type.
*(L'écriture en proposition : **`implementation:`** désigne
l'implémentation — le mot `hook:` quitte la configuration, la
doctrine D408 enfin respectée jusque dans connectors.yml :*
`main_db: { type: storage, implementation: postgresql }` *; le
simple demeure : le nom = le type —*
`smtp: { implementation: smtp_std }`*.)*

**`class:` (D615 — solde D613).** L'écriture arrêtée : **« class
serait plus intéressant pour moi »** — confirmé. Le vocabulaire
objet, exact au sens (le type est le contrat, la classe le remplit),
court, sans collision au registre ; le mot `hook` reste hors de la
configuration (D408). La prose du registre garde « l'implémentation »
comme mot français ; le YAML écrit `class:` —
`main_db: { type: storage, class: postgresql }`,
`smtp: { class: smtp_std }`.

**Le confirm au formulaire (D600 — enrichit D595/D597).** **« Sur les
opérations, nous avons `confirm` qui affiche une boîte de dialogue
avec un message. Nous pouvons le rendre plus riche avec un formulaire
et des champs qui sont alimentés par l'exécution. Par exemple : une
procédure simplifiée de création d'un enregistrement qui se valide en
consultant l'enregistrement dans un formulaire en lecture seule et/ou
en modification. »** La relecture (D431/D196) prend toute sa
dimension : le `confirm` présente **le message (le label — D597), ou
un formulaire nourri par la transaction active** (D594) — la lecture
seule pour consulter, **la modification pour ajuster : les éditions
de l'utilisateur rejoignent la transaction avant le scellé**.
*(L'écriture en proposition : `commit: { mode: confirm, form: <nom>,
message: … }` — le formulaire nommé de l'entité, son `mode` D453
valant.)* La six-centième décision.

**La boîte seule (D601 — précise D600).** **« Si `form:` est absent
et si `message:` est précisé, seule une boîte de dialogue de
validation sera affichée. »** — les deux visages du confirm : la
boîte au message (le léger), le formulaire sur la transaction (le
riche) ; le message accompagne le formulaire quand les deux sont
déclarés.

**Les huit domaines de Q16, enfin consignés (D602 — répare un
manque).** Le découpage vivait dans les échanges sans être posé au
document ; l'auteur le repose :

1. **l'organisation et l'arborescence d'une application** — « revue
   et amendée au fur et à mesure de nos explorations » ;
2. **la donnée, sa structure et les droits** ;
3. **le méta-schéma** ;
4. **les surfaces** ;
5. **les cas d'usage** ;
6. **la rédaction de la documentation synthétique et détaillée** ;
7. **le choix de l'architecture technique** ;
8. **l'implémentation**.

**Le recoupement des échanges** (la demande de l'auteur) : les
domaines 1 (D335–D346, amendé au fil — les dossiers module/entité,
gui) et 2 (D347–D419 — les types, l'historisation, les groupes, la
confidentialité au socle) sont livrés ; le domaine 3 fut vécu sous
l'intitulé « les règles et le comportement » (D420–D436) — sa part du
méta-schéma — que Q60 (D570–D601, le langage et les hooks) complète ;
le domaine 4 est soldé (D437–D569, le catalogue entier). **Les
domaines 5–8 correspondent aux chantiers déjà nommés** : 5 = les cas
d'usage (Q59 — les mises en situation), 6 = la documentation (Q58 —
le glossaire, composants.md et la synthèse en préparation), 7 =
l'architecture technique (Q7, Q47 — la spec du langage, le langage
des hooks D570, la sandbox), 8 = l'implémentation (D314 — le code
après la conception). **Deux réconciliations consignées** : (a)
l'intitulé du domaine 3 — « le méta-schéma » englobe les règles, le
comportement et le langage (D420–D436 + D570–D601) ; (b) **les
renvois « domaine 6 » des décisions D408/D452/D459** (le contrat des
hooks — signature, code, sandbox) furent écrits sous un découpage de
travail antérieur : **ils se relisent** — le contrat est couvert par
Q60 (D570–D601), le reliquat (la sandbox, le langage du code) relève
du domaine 7.

**Les connecteurs : les cinq arbitrages (D603 — la passe de
complétude, premier sujet).** **(1) « `connectors.yml` est bien à la
racine de la version. Il ne trouve pas de déclinaison dans les
modules, ni les entités. Un connecteur est global. »** **(2) « Les
connecteurs sont disponibles dans un catalogue de base offert par
Syncytium et sont extensibles via un hook de connecteur. »**
**(3) « Les paramètres d'un connecteur sont juste les propriétés du
connecteur. Le connecteur n'a pas de contexte, car il se définit au
démarrage du projet »** — hors de la pile (D553), l'exception
assumée. **(4) « Les secrets sont définis dans la configuration…
Les secrets peuvent faire référence à une variable d'environnement,
et la variable peut être cryptée via une clé construite en fonction
de l'environnement et de la machine d'exécution. »** — la
configuration porte la référence, jamais la valeur en clair ; le
chiffrement à la clé dérivée (l'environnement + la machine) — le
dépôt versionné (D336) reste propre. **(5) « `every:` reprend la même
grammaire »** (D434/D476) — « pour des hooks qui ont besoin d'être
régulièrement rafraîchis ».

**Le catalogue de base des connecteurs (D604 — complète D603).**
**« Le catalogue de hooks regroupe : un connecteur vers les bases de
données standard (SQLServer, MySQL, Postgre…), un connecteur vers
l'AD Azure, un connecteur de fichiers (CSV, JSON…) — ta liste
complète bien la mienne. »** Le catalogue de base réunit donc : **les
bases de données standard**, **l'AD Azure** (la passerelle
d'authentification D418 y trouve un premier visage), **les fichiers**
(CSV, JSON…), le géocodage (`ban`/`nominatim` — D294), l'itinéraire
(`osrm`/`valhalla` — D514), le mail sortant (`smtp` — D564/D574), la
reprise (D175–D179). Et l'`every:` précisé : **« utilisé pour les
connecteurs qui ont besoin d'être régulièrement rafraîchis ou
testés — par exemple un file watcher : la détection de présence d'un
fichier, le fichier mis à jour et relu. »** — **l'échange entrant
naît là** : le fichier déposé, détecté, relu — la porte d'entrée par
le connecteur de fichiers.

**Le contrat par famille (D605 — solde le sujet des connecteurs).**
**« La famille (ou le type) permet de définir les interactions avec
Syncytium. Chaque famille a ses propres méthodes et fonctions. »** —
le contrat du hook-connecteur n'est pas universel : **il est porté
par la famille** (la ligne D579 — le type emmène ses fonctions,
jusqu'aux connecteurs) : la base de données a ses méthodes, le
fichier les siennes (la veille, la lecture), le géocodage les siennes
(l'adresse → les coordonnées, l'inverse), le mail son envoi,
l'annuaire son authentification, la reprise sa lecture seule (D175).
Un hook de connecteur implémente le contrat de sa famille. **Les cinq
manques des connecteurs sont refermés** : la déclaration (D603), les
secrets (D603), la planification (D603–D604), les entrants (D604 —
le watcher), le contrat (D605).

**Les deux sens, le stockage-connecteur, la migration
inter-connecteurs (D606 — élargit D603–D605).** **« Un connecteur
décrit les sortants et les entrants. »** Et la vérification demandée
(« il me semble que je l'avais déjà évoqué ») : oui — la translation
déclarative fut posée dès l'origine comme **le primitif transverse
aux quatre usages** (les migrations, les API, **les connecteurs**, la
réplication) ; **« Syncytium peut convertir ou transférer des données
d'un connecteur à l'autre »** en est l'exercice. Les précisions
nouvelles : **« les entités sont liées à un connecteur de base de
données »** — **le stockage même est un connecteur** (les bases du
catalogue D604 ne servent pas que l'échange : elles portent
l'instance) ; et **« nous pouvons prévoir une migration d'un
connecteur vers un autre, en instantanée ou en différentiel »** — le
changement de moteur (SQLServer → PostgreSQL…) par la translation,
le différentiel rejoignant la réplication passive (D112–D114).

**`selection` = le nombre, `by` = la présentation (D474 — solde
D472).** **« La propriété `selection` définit le nombre d'éléments à
sélectionner : `1`, `1..` ou `1..5` »** — la cardinalité, à l'écriture
des bornes (D366), **la déduction du lien en défaut** (la référence =
`1`, la liste et l'association = `1..` — D470) ; **« component n'est
pas adapté ; ta proposition `by` me plaît »** — **`by:`** porte la
matérialisation : **le nom d'une liste de la cible** → la présentation
liste ; **le nom du champ-image de la cible** → la galerie de visages ;
absent → la liste par défaut filtrée. *(Note : le `selection: <liste>`
de D215 est remplacé par `by:` ; l'harmonisation du `selection:
one | multiple` de la liste (D445) vers `1 | 1..` — en proposition.)*

```yaml
- field[product]:
    by: catalog_photos           # le champ-image ou la liste — la présentation
    selection: 1..5              # la cardinalité — au plus cinq
```

**Le composé `password` (D463).** La sonde de l'auteur (« avons-nous un
type password ? ») — non ; il entre aux composés, **avec des garanties
structurelles, jamais des options** : **(1) le stockage est
l'empreinte, jamais le clair** (la ligne D33 — salée, l'algorithme au
moteur) — **le champ est write-only** : il s'écrit, ne se relit jamais
(la lecture montre « défini / non défini ») ; **(2) le composant** — la
saisie masquée, l'œil de révélation à la saisie seulement, la double
saisie en création ; **(3) les exclusions structurelles** — jamais en
colonne de liste, jamais `searchable` ni `mutualizable` (la conversion
D369 exclue), jamais exporté (CSV, Excel, template), **l'empreinte
seule aux instantanés** (D169) — le clair n'existe nulle part ;
**(4) la force déclarable** par la `validation` du champ (longueur,
classes — le refus propre D307). **« La facette décrite me
convient. »**

**Les colonnes gardent le nom nu (D462).** **« Pour les colonnes d'une
liste, l'ambiguïté n'est pas présente : ce sont des noms de champs — et
les opérations sont des verbes en général. »** Pas de `field[…]` aux
`columns` ; **la préconisation au technicien** (la documentation Q58,
jamais un contrôle — « Syncytium n'apporte pas de contrôles ») : **une
approche cohérente, une action marquée par un verbe**. Et la règle de
préséance : **« si un nom de champ = un nom d'opération, le nom du
champ l'emporte. »**

**Le type-hook doit se représenter (D459).** **« Un type ajouté via le
hook doit inclure une phase de représentation graphique — ou via un
document PDF, Word… »** Le contrat du type sur mesure comprend **ses
rendus** : le composant d'écran et/ou le rendu de document (le
`template`, D456) — **aucun type sans visage** (la ligne D455 : une
facette est un hook — la facette d'affichage d'un type hooké est due).
Le contrat détaillé au domaine 6.

*(Les quatre lettres : **create** = la création d'un **sous-composant**
— ajouter une ligne à l'agrégat ; **read** = la consultation de
l'enregistrement — sans elle, l'état masque (la donnée se protège) ;
**update** = la mise à jour — l'agrégat entier (D420) ; **delete** = la
suppression-désactivation (D141). Absent = tout permis. Le même
vocabulaire vaut pour les états hiérarchiques du bloc `states:` (D353) ;
l'en-tête d'entité garde les formes libres symétriques
(`update: <expression>`, D421) pour les cas hors cycle — les deux
déclarés = erreur d'ingestion ; **les opérations passent outre**,
inchangé.)*

```yaml
history:
  type: communication
  confidentiality: protected     # la visibilité du fil (D25) — le socle suffit
  attachments: image             # false (défaut) | file | image | thumbnail
  quota: 5MB                     # le kit du type d'attaché, à plat (D365)
  notification: true             # opt-in — IHM ou mail (D108–D110)
  preview: 3                     # le résumé au survol, en lignes (proposition)
```

**La conservation et l'ordre des numéros (D345).** **Les versions
dépréciées et interdites sont conservées** — pour des questions
**historiques** : rien ne s'efface, les dossiers `deprecated/` et
`forbidden/` sont la mémoire du parc. Et **la règle d'ordre incrémental**
des numéros : **`beta` > `production` > `deprecated`** — une bêta porte
toujours un numéro supérieur aux versions de production, elles-mêmes
supérieures aux dépréciées. **Les versions `forbidden` échappent à cette
contrainte** — naturellement : une bêta comme une production de n'importe
quel numéro peut y être classée.

**La configuration par environnement (D342, amende D339 et précise
D325).** **Le nom `technical/` est écarté au profit d'`environments/`** —
avec **un dossier par environnement** : **les connecteurs, les logs, les
settings et la documentation sont spécifiques à chaque environnement**.
La configuration reste **commune aux versions** (D325) mais se **décline
par environnement** ; les valeurs partagées entre environnements passent
par les **variables** (D321/D323 — le `${environment.name}` des
échantillons prend tout son sens).

**Les journaux par environnement (D343).** Les journaux n'ont **pas la
même configuration selon l'environnement** : **staging = debug ou
verbose** (il faut plus de traces) ; **production active = info**, avec
**éventuellement une redirection vers un puits de logs** ; **production
passive = warning**. **Les fichiers de journaux sont formatés différemment
et stockés dans des emplacements différents** selon l'environnement.

**La vue consolidée du domaine 1 — l'arborescence du dépôt de
description** (artefact de clôture, consolidé de D320–D343) :

```yaml
syncytium.yml                  # le fichier racine (D322) : identité de l'instance
                               # (application, société, logo — D191/D254), langues
                               # (permises, défaut, fuseaux, formats — D217–D221/D131),
                               # compte administrateur de secours (D29/D81),
                               # références par patterns (D320)
resources/                     # logos, icônes, images, documents — partagés avec
                               # toutes les versions (D346)
environments/                  # un dossier PAR environnement (D342)
  staging/                     #   le test
    environment.yml            #     caractéristiques techniques (D339 — nom illustratif)
    connectors/                #     identité (un actif, D80), données (D79),
                               #     notifications (D108), géocodage (D294), reprise (D175)
    logs.yml                   #     debug / verbose (D343)
    settings.yml               #     paramètres généraux (D259) : seuils, CSV, fond de carte…
    documentation.yml          #     génération de la documentation (D333)
  production/                  #   la production active
    environment.yml
    connectors/
    logs.yml                   #     info + puits de logs éventuel (D343)
    settings.yml
    documentation.yml
  passive/                     #   la production passive (PCA/PRA, D113–D114)
    environment.yml
    connectors/
    logs.yml                   #     warning (D343)
    settings.yml
    documentation.yml
versions/                      # (D324, D338, D340)
  beta/                        #   → le staging s'instancie (D112)
  production/                  #   → servies par l'actif + le passif
  deprecated/                  #   → appelables jusqu'au Sunset (D12/D94)
  forbidden/                   #   → refusées (D103)
    # dans chacun : <maj>.<min>.<indice>.<build>.yml (entrée, en-tête = version
    # du format) + <maj>.<min>.<indice>.<build>/ (le détail : settings.yml D360,
    # groups.yml D414, modules.yml D415 → les modules D416 — donnée ET
    # expérience unifiées ; IHM et configuration générale, domaines 3 à 8)
```

À granularité ouverte (contenus évoqués, fichier dédié à trancher au fil
de l'eau — `settings.yml` ou fichiers propres) : rate limiting (D105),
dossier des binaires + quota d'instance (D160/D162), rétentions (D110,
D55), synchronisation actif/passif (D113–D114). Côté **projet Syncytium**
(dépôt distinct, D336) : le dossier **`template/`** « Hello world ! »
(D337).

**Groupes et modules fonctionnels : versionnés (D341 — clôt le domaine 1
de l'inventaire).** **Les groupes (D26–D27) et les modules fonctionnels
(D190/D210) sont versionnés avec le schéma** — ils appartiennent au
contenu versionné (D325) : le modèle des droits et l'expérience utilisateur
évoluent avec le schéma qu'ils gouvernent. Les **affectations**, elles,
restent des **actes d'administration en base** : personnes ↔ groupes
(D27), utilisateurs ↔ modules fonctionnels (D210).

**Le dépôt du client, distinct du projet (D336).** **Le dossier de
description sera versionné par le client, dans un dépôt différent du
projet Syncytium** — le moteur (public) et les descriptions (propres à
chaque TPE) vivent dans des dépôts séparés ; le contrat entre les deux est
le format versionné (D322–D332).

**Le dossier « template » : Hello world ! (D337).** **Le projet Syncytium
embarque un dossier `template/`** définissant un projet **« Hello
world ! »** — le point de départ qui **facilite la prise en main par le
technicien** : une description minimale complète, clonable, dont
l'application générée fonctionne immédiatement. Premier des exemples
promis à la documentation (D314/Q58–Q59).

**La documentation vivante et son partage élargi (D334).** La
documentation technique **exploite aussi les données enregistrées dans la
base** pour apporter des **informations utiles sur l'usage — ou le
non-usage — de valeurs ou de plages de valeurs** : la télémétrie
(D38–D51, la diversité D46/D48 en tête) devient une **troisième source**
de la documentation, celle qui dit non pas ce que le modèle *permet* mais
ce que l'instance *fait*. Et **certaines informations dédiées au
technicien pourront être partagées** — **aux utilisateurs, aux
techniciens de parties tierces** (les consommateurs des API, dont la
documentation générée s'enrichit) **et aux usagers**. *(Harmonisation
naturelle : le partage s'opère sous les règles d'accès existantes —
confidentialité D25–D27, groupes — le destinataire ne voit que ce que ses
droits permettent.)*

**Le corollaire : diffable et commentaires, questions caduques (D332 —
clôt la phase 2).** Puisque le moteur ne réécrit jamais les enveloppes,
il n'y a **ni problème de YAML diffable, ni sort des commentaires** : les
fichiers restent **exactement tels que le technicien les a écrits**,
commentaires compris — seule la logique interne (D327/D329) change de
forme. Si un outil d'assistance à la mise à niveau des descriptions
voyait le jour, ce serait **un outil du technicien, pas un geste du
moteur**.

**Le journal de migrations compilé (D329).** **Pour des questions de
performance, le moteur traduit les descriptions en un journal de
migrations selon un format qui lui est propre.** **La migration est gérée
en mémoire** pour rendre les données plus rapidement. Et **en cas de
relance du serveur, les règles de migration sont déjà prêtes à l'emploi** —
**les traitements optimisant les temps de traitement sont déjà réalisés et
réutilisables** : la forme compilée est **persistée**, aucune
recompilation à la relance. C'est la pièce maîtresse de la logique interne
(D327) — et le même journal compilé nourrit naturellement la chaîne de
translation des API (§5.1), qui en dérive.

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

**Spécification fine du langage (Q47, en cours — D301–…).**

- **Le catalogue de fonctions est en anglais (D301).** Deux raisons : une
  **internationalisation potentielle**, et la **similitude avec des langages
  déjà connus et exploités** (Visual Basic, Python…) — `sum`, `count`,
  `min`, `max`, `if`, `isnull`… *(Corollaire à trancher : les mots-clés de
  la grammaire suivent-ils — le « si » filtrant des agrégats devient `if` ?
  Les exemples déjà consignés au document seront anglicisés lors de la
  rédaction du catalogue.)*
- **La logique « selon que » (D302).** Ajoutée au catalogue : la **sélection
  multi-branches** (à la `Select Case` de VB / `match` de Python) — `selon
  que (valeur) : cas a → x ; cas b → y ; défaut → z` — qui **facilite la
  construction des tables de correspondance** : c'est le pendant en ligne du
  transcodage (D90), pour les cas trop petits pour mériter une table.
- **Le null : la logique ternaire est retenue (D303).** L'auteur préfère la
  logique ternaire à la propagation stricte : « elle présente un avantage
  sur la propagation d'une anomalie et une interruption », les fonctions
  `isnull` / `ifnull` permettant de trancher explicitement. **La table de
  vérité exacte reste à confirmer** — la dictée de l'auteur comporte deux
  lignes en écart avec la logique ternaire standard (SQL/Kleene) : un OU
  asymétrique (`Faux ou null → null` mais `null ou Faux → Faux`) et un ET
  où `Faux et null → null` (le standard donne `Faux` — le faux absorbe).
  Table standard proposée : `Vrai ou null = Vrai` ; `Faux ou null = null` ;
  `Vrai et null = null` ; `Faux et null = Faux` — commutative, et alignée
  sur le SGBD sous-jacent (les filtres et validations s'y exécutent).
- **Le null non gardé = une anomalie capturée (D308, amende D303).** La
  table standard est validée (« tu as raison ») — **mais la doctrine du
  projet prime** : **une valeur null dans une expression booléenne ou une
  opération arithmétique est une valeur anormale — elle doit être
  capturée**, **sauf si elle est captée par `isnull` ou `ifnull`** (les
  seules portes légitimes du null). La capture emprunte le circuit d'échec
  par contexte (D304) : null + trace en champ calculé, règle non satisfaite
  + trace en validation, substitution déclarée en migration.
  *(Interprétation à confirmer : les **filtres de consultation** exécutés
  au SGBD suivent, eux, la table ternaire standard — exclure une ligne au
  champ null n'est pas une anomalie ; la capture vaut pour les expressions
  du langage : calculs, validations, migrations, transitions.)*
- **L'échec d'une expression, par contexte (D304).** **Migration /
  translation** : la substitution déclarée (D13) ; **champ calculé** : null
  + une trace ; **validation** : **une règle non satisfaite — qui fait
  l'objet d'une trace** (précision de l'auteur). Le doute profite à la
  sécurité, et rien n'échoue en silence.
- **La grammaire : celle des exemples actés (D305).** « Les exemples actés
  sont significatifs de ce que cela doit rassembler » — expressions
  infixes, chemins pointés (`client.nom`, `lignes.montant`), gabarits
  `{}`, agrégats à filtre intégré, fonctions `nom(args)`, imbrication
  libre (D90). *(Corollaire D301 toujours ouvert : les mots-clés — le
  « si » filtrant — passent-ils à l'anglais `if` ?)*
- **Simple/complexe = une propriété de la fonction du catalogue (D306)**
  (matérialise D104) ; **le déterminisme aussi (D307)** — chaque fonction
  est marquée déterministe ou non. *(Proposé, à confirmer : chaque contexte
  d'usage déclare ce qu'il accepte — les migrations n'admettent que le
  déterministe, dry-run D7 oblige ; l'affichage admet tout.)*
- **Les mots-clés de la grammaire sont en anglais (D309, clôt le corollaire
  de D301/D305).** Le « si » filtrant des agrégats devient `if` —
  `sum(lignes.montant if ligne.etat = "facturée")` — et le « selon que »
  (D302) prendra sa forme anglaise au catalogue (`case`/`match`, à fixer).
  **Fonctions et mots-clés en anglais ; les noms de champs et d'entités
  restent ceux du modèle.**
- **Les filtres et le null : la doctrine complète (D310).** **Les filtres
  peuvent cibler les lignes null si besoin** (un critère « vide/null » du
  filtre) ; et la ligne de partage est nette — **« dans une table, null
  n'est pas une anomalie ; mais dans une évaluation pour un calcul,
  oui »** : le null **stocké** est légitime (la table ternaire standard
  s'applique aux filtres exécutés au SGBD, sans capture), le null
  **évalué** dans une expression est capturé (D308).
- **Le déterminisme : exigé uniquement pour les migrations (D311).** Les
  migrations n'admettent que des fonctions déterministes (le dry-run D7
  doit être rejouable) ; **partout ailleurs, aucune restriction**
  (validations, filtres, gabarits, affichage).
- **La coercition est validée (D312 — clôt Q47).** Le résumé est ratifié :
  conversions **sûres implicites** aux frontières et dans les expressions ;
  **explicites par fonction** (`to_integer`, `to_text`… — D301) ;
  **faillibles à échec propre** (traité par contexte, D304) — **jamais de
  coercition silencieuse** (D120 confirmé côté langage).

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

**La conversion faillible = le moteur de l'import (précision 02/07/2026, lien
Q49).** L'initialisation depuis une base tierce ou l'import d'un **CSV/Excel**
est l'application massive du graphe : chaque cellule brute tente sa conversion
faillible vers le type du champ cible ; les **échecs produisent le rapport
d'import** cellule par cellule (« ligne 47, colonne date_livraison :
"31/02/2024" inconvertible ») — le **dry-run d'import** (Q49) est littéralement
l'exécution à blanc des conversions. La détection (conversion) est ainsi séparée
du traitement des rejets (politique Q49 : source / règle en vol / quarantaine).
L'import CSV/Excel = **connecteur de données en lecture** (D79), déclenchable
par hot folder (D106).

**L'export CSV (précision 02/07/2026)** : utilise la **facette d'affichage**
(D119) par défaut — l'usage dominant étant humain (Excel, analyses, cas 2 de
D83) — ou un **format surchargeable compatible avec le type** (validé par le
catalogue : pas de format de date sur un montant), permettant un export machine
(ISO 8601…). La surcharge vit dans la **configuration du connecteur** (principe
D108 : le vecteur/le contenant). **Aller-retour cohérent** : le format d'export
étant déclaré, le ré-import (conversion faillible) connaît sa grammaire.

**Catalogue acté (D121–D122).**
- **Types simples** : texte, entier, réel (*descriptibles en décimal* —
  chiffres avant/après la virgule), booléen, **date**, **heure**,
  **date et heure**, **durée**, fichier, énuméré (**mono-sélection
  uniquement** — pas de multiple : le multi-valué passe par une entité liée,
  cohérent avec l'atomicité D118) ; **ajoutés le 07/07/2026 (D286)** :
  **vignette** (image de petite taille) et **image** (grande taille **+
  déclinaison en vignette**).
- **Composés livrés** (bibliothèque enrichissable D52/D68) : `montant`,
  `email`, `pourcentage`, `telephone`, `url`, `siren`/`siret` (clé de Luhn),
  `iban`/`bic` (modulo 97), `tva_intra`, `mesure` (décimal + unité),
  `geolocalisation`, `periode` (début ≤ fin).

**Profil de champ (D124–D126, clôt Q34).**

| Bloc | Attributs |
|---|---|
| **Identité (D124)** | **nom = invariant** (référencé par calculs/tâches/API ; renommage = migration D4) ; **libellés** = identifiant décliné en **variantes traduites** (écran — variable selon le responsive —, colonne de tableau, colonne CSV) ; **description courte** (bulle IHM) + **description longue** (aide) — **exploitables par des IA** (le méta-schéma D44 devient documentation sémantique) |
| **Type** | simple / composé / surchargé (D118, D123) + 4 facettes (D119) + conversions (D120) |
| **Contraintes** | obligatoire, unique, limites de valeurs, format (D118) |
| **Valeurs** | défaut (D13/D35), calculé (D35–D36), **valeur de démonstration (D128)** — placeholder IHM, exemples de la doc API générée, échantillon pour les IA ; les types sémantiques livrent la leur (email → `nom@domaine.fr`), surchargeable au champ |
| **Comparaison (D125)** | **fonction de comparaison intrinsèque au type** → fonde le **tri** ; réutilisée par le **filtre** (une valeur / un jeu de valeurs / un comparateur) ; types sans ordre naturel (géolocalisation) = **non triables par nature** ; composés : comparaison définie par le type (montant : à devise comparable, D120 arbitre) |
| **Accès** | confidentialité (D25), lecture/écriture par audience (D73), groupes (D26) |
| **Observation** | seuils de télémétrie (D49) |
| **Présentation** | composant IHM (D64/D65), facette affichage (D119) |
| **API** | exposition (D20), facette API (D119) |
| **À venir** | agrégat (Q35), historisation (Q37) |

**Tables IHM (D126)** : les **champs filtrables se déclarent à la table** (la
vue), pas au champ ; les **tris sont multi-clés** (combinaisons de colonnes).
Avec la règle anti-oracle (on ne filtre/trie que ce qu'on peut lire, Q38), le
**cœur de Q38 est résolu** — résiduels : plein-texte, recherche globale.
**Langue = profil de l'utilisateur, pas l'instance** (D124) — première décision
de Q45.

**Libellés à deux couches + responsable métier (D127).**
- **Défauts par langue dans la description** (versionnés, migrés) ;
- **surcharges en base de données**, modifiables en vie courante — sans
  migration — par un **responsable métier** (acteur nouveau, famille des rôles
  moteur D95/D33 : autorité sur le vocabulaire/la présentation, pas la
  structure) quand le métier l'impose.
- **Chaîne de résolution** : surcharge (langue du profil) → défaut description
  (langue du profil) → langue de repli de l'instance → nom technique — jamais
  d'écran troué.
- **Borne actée (02/07/2026)** : la surcharge métier **se limite à la
  présentation** (libellés toutes variantes, descriptions, formats d'affichage) ;
  **tout le reste est à la charge du technicien** (nom, type, contraintes,
  stockage — par la description et les migrations).
- Cohérences : patron D31 (*structure dans la description, adaptations dans les
  données*) ; surcharge **rattachée au nom invariant** (D124) → survit aux
  migrations (un renommage la suit) ; **la surcharge bat toujours le défaut**,
  même livré plus récent, jusqu'à retrait par le responsable métier.

**Énumérés : trois propriétés par valeur (D129, étend D127 ; précisé le
02/07/2026).** Chaque valeur d'un énuméré porte :
1. une **valeur numérique** — assure le **tri** : c'est elle qu'utilise la
   fonction de comparaison (D125) de l'énuméré, ordre **métier** stable quelle
   que soit la langue (`brouillon < en_cours < valide`) ; modifier l'ordre =
   changement de description (nouvelle version), **pas** de migration de
   données ;
2. un **code invariant** — l'identité contractuelle : stockage logique, API,
   filtres, transcodages (D90), domaine de la diversité scalaire (D48) ;
   **renommer un code = migration** (avec transcodage des données) ;
3. un **identifiant de libellé** — indirection vers le système de libellés
   (D124/D127 : variantes, langues, deux couches défauts/surcharges) ;
   **changer un libellé n'est jamais une migration** (responsable métier, vie
   courante). L'indirection autorise le **partage** d'identifiants de libellés
   entre énumérés (« Actif »/« Inactif » traduits une fois).

Option de persistance (D119/D18) : la **facette stockage** peut retenir la
valeur numérique (compacte, tri natif en base), la facette logique/API restant
le **code** — liberté d'implémentation sans effet sur le contrat.

**Formats d'affichage et de conversion par langue (D131).** Les formats se
déclinent **par langue**, portés par la **description du schéma** :
- **affichage** (D119) : `31/12/2026` / `1 234,56` en français, `12/31/2026` /
  `1,234.56` en anglais — la **langue du profil** (D124) sélectionne la
  variante ;
- **conversion** (D120) : le parsing `texte → date/réel` est **paramétré par la
  grammaire de la langue** — fondement formel du « langue de l'importateur »
  (D130) ; vaut pour la saisie IHM, l'import CSV, tout parsing humain ;
- Syncytium **livre les formats standard par langue**, le schéma les précise ;
  le format d'*affichage* relève de la couche présentation (surchargeable,
  borne D127), la grammaire de *conversion* reste structurelle ;
- les machines passent par les **formats canoniques** (ISO, codes — D130).

**Import/export des énumérés (D130).**
- **Import (API/CSV)** : la conversion faillible essaie **le code d'abord, puis
  le libellé** — dans la **langue de l'utilisateur qui importe**. Garde-fous :
  (1) **priorité absolue au code** en cas de collision code/libellé ;
  (2) **libellé ambigu** (→ plusieurs codes) = **échec propre** de la
  conversion, jamais de choix silencieux — et la validation du schéma signale
  les libellés dupliqués par énuméré et par langue ; (3) correspondance sur les
  **libellés effectifs** (surcharges D127 comprises) — les libellés étant
  mutables, **l'import par libellé = commodité humaine, les intégrations
  machines utilisent les codes**. Propriété assumée : le même fichier importé
  par deux utilisateurs de langues différentes ne se lit pas pareil (langue au
  profil, D124).
- **Export** : **code ou libellé, déclaré dans la description du format CSV**
  (configuration du connecteur, D108/D119) ; libellé exporté = langue de
  l'utilisateur exportant. Aller-retour : l'export en codes se réimporte par
  quiconque ; en libellés, dans la même langue.

**Devise portée par la donnée + surcharge de types par restriction (D123).**
- La **devise est une composante de la donnée** (chaque montant stocke
  valeur + devise), appartenant à un **jeu autorisé**. Type standard `montant`
  = **toutes les devises ISO 4217**.
- Le schéma crée des **types surchargeant les standards par restriction** du
  domaine : `montant_francais` = {EUR}, `montant_asiatique` = {JPY, CNY, …}.
- **Mécanisme général de spécialisation** (pas limité aux devises : unités de
  `mesure`, formats…) qui **s'insère dans le graphe de conversion (D120)** :
  dérivé → standard = **sûre** (élargissement) ; standard → dérivé =
  **faillible** (contrôle du jeu). Restriction à un jeu singleton = mono-devise
  (le stockage peut omettre la composante devenue constante ; le modèle logique
  ne change pas).

### 3.5 Relations (Q35 ; D132–D136)

Deux natures (fondées par D116) : **composition** (« possède », agrégat D101,
intra-module) et **association** (« référence », libre, inter-modules).

**Composition (D132).**
- Cardinalités **1-1** et **1-N** ; intra-module (D116) ; l'enfant ne vit pas
  sans son parent.
- **Suppression = compare-and-swap sur l'agrégat complet** (étend D111) : le
  demandeur fournit **l'agrégat entier** (la commande avec *toutes* ses
  lignes), vérifié **identique à la base** — toute divergence (ligne
  ajoutée/modifiée par un tiers) → **conflit 409** ; puis la **cascade supprime
  tous les éléments**. D111 couvre ainsi les trois verbes : créer / modifier /
  supprimer.
- La **cascade est la définition de la possession** — et le seul cas de cascade
  du modèle.

**Déclaration de la composition (D133).** Tout se lit sur la déclaration
`compose` du parent :
- le **raffinement conditionnel** (D101 — enfants modifiables seuls ou non) s'y
  déclare (pas sur l'enfant : lisibilité) — **[écarté par D420 :
  l'agrégat est toujours le grain d'écriture]** ;
- l'**ordre des enfants = une clé de tri déclarée** (un ou plusieurs champs) —
  portée par les fonctions de comparaison des types (D125) et le multi-clés
  (D126), rien de neuf.

**Formes de composition (D134).** Les enfants sont **indexés par des
dimensions** (clés typées : énumérés, références) :
- **liste** — une dimension implicite (la clé d'ordre) ;
- **matrice** — deux dimensions (quantités par **taille × couleur**) ;
- **multi-dimensionnel** — n dimensions.
Unicité naturelle : **une cellule par combinaison de dimensions**. L'IHM
sélectionne le composant selon la forme (table, grille — D64).

**Composition auto-référencée (D135).** Autorisée — ex. **gamme de fabrication
industrielle**, nomenclature : les éléments se composent récursivement.
Garde-fous : **validation d'acyclicité** (un élément ne peut être son propre
ancêtre) ; l'agrégat = **l'arbre entier** (transaction D101, suppression-CAS
D132 et concurrence D111 portent sur toute la gamme).

**Association (D136).**
- **N-1 = un champ `reference`** (une commande référence *un* client) ;
  **obligatoire ou optionnelle** ; inter-modules libre (D116) ;
  **auto-référence autorisée** (hiérarchies : catégorie parente).
- **Inverse matérialisé en champ « liste »** sur l'entité cible :
  `client.commandes` — **pas une composition** (pas de possession, pas de
  cascade) mais une **vue dérivée navigable** : chemins (D71), calculs
  (`somme(commandes.montant_ttc)`), IHM (la fiche client liste ses commandes).
  La vérité reste la référence N-1.
- **N-N = une entité de liaison explicite** (« tout est entité » — elle porte
  ses attributs : date d'affectation, rôle…).
- **Suppression : dérivée de la nullabilité du champ référençant (D138)** —
  plus de déclaration séparée : référence **obligatoire** → suppression de la
  cible **refusée** (restrict, message généré : « 47 commandes le
  référencent ») ; référence **optionnelle** → suppression **autorisée**, **les
  références ne sont pas touchées** (elles pointent vers l'enregistrement
  inactif, lisible sur demande — D137). La `mise_a_null` **disparaît par
  construction** (jamais de référence pendante grâce au soft delete) ; **jamais
  de cascade sur une association**.
- Cas de bord : association vers un **module désactivé** (D117) — la donnée
  existe toujours, la référence reste valide, l'affichage se réduit (libellé
  sans navigation).

**Suppression = inactivation (D137, soft delete).** Aucune suppression réelle :
l'enregistrement devient **inactif**, propriétés **lisibles sur demande** ;
l'**IHM distingue actif/inactif** (listes = actifs par défaut, inactifs sur
demande, marquage visuel). Conséquences :
- la suppression-CAS d'agrégat (D132) = **inactivation-CAS** (l'agrégat complet
  vérifié puis inactivé en bloc) ; modifier un inactif reste rejeté (410, D111) ;
- cohérence D77 : le compte client **suit** sa fiche (fiche inactivée → compte
  inactivé) ;
- **⚠️ RGPD** : le soft delete conserve les données personnelles — le **droit à
  l'effacement exige une purge réelle distincte** (opération d'administration :
  suppression physique ou anonymisation). Suppression métier ≠ effacement
  réglementaire.
**Anonymisation, réactivation, unicité (D139–D141).**
- **Anonymisation déclarée sur l'entité (D139, RGPD)** : pas de suppression
  physique — le droit à l'effacement s'exerce par une **procédure
  d'anonymisation** dont la **règle est déclarée sur l'entité dans le modèle**
  (quels champs, quelles substitutions — langage D90). **L'intégrité
  référentielle survit à l'effacement** : l'enregistrement anonymisé existe
  toujours (les commandes gardent leur référence vers un client devenu
  anonyme) — soft delete (D137) + anonymisation = RGPD compatible avec « jamais
  de référence pendante » (D138). **Irréversible** (≠ inactivation) ; opération
  d'administration, auditée avec motif (D62).
- **Réactivation (D140)** : possible, **par l'administrateur de l'instance**,
  **sous conditions** — au premier chef le **contrôle de collision de clés**
  (refus si une clé unique du réactivé duplique celle d'un actif créé
  entre-temps ; résolution préalable).
- **Unicité sur les actifs uniquement (D141)** : les enregistrements inactifs
  **peuvent porter des doublons de clés** — on peut « supprimer » un client et
  en recréer un avec le même email ; d'où la condition de D140.

**Identité d'un enregistrement (D142, résout Q51).** Deux identités, deux rôles :
- **technique** = l'**UUID interne, invariant à vie** (généralise D75/D82 à tout
  enregistrement) — traverse actif → inactif → réactivé → anonymisé ; porteur
  des **références** (D136/D138 — jamais la clé métier), de l'**audit** (Q37),
  des **chemins** (D71) et de la **concurrence** (D111) ;
- **fonctionnelle** = les **clés métier** (email, référence…), valides **parmi
  les actifs seulement** (D141).
Conséquences : **recréer** (même clé qu'un inactif) = **nouvelle identité** ;
**réactiver** (D140) = **la même** ; **anonymiser** (D139) = effacer la
fonctionnelle, **préserver la technique** (le squelette référentiel demeure).
Pour les entités synchronisées/importées (Q49) : généralisation du patron D82 —
chaque entité déclare sa **clé d'unicité externe** → rapprochement vers l'UUID
(clé immuable en priorité, re-liaison admin).

**Apport au méta-schéma** : déclaration `compose` (cardinalité, raffinement,
clé d'ordre, dimensions/forme, récursivité) ; champ `reference` (obligatoire,
comportement à la suppression) ; champ « liste inverse » ; entités de liaison.

### 3.6 Héritage d'une entité (Q52 ; D143–D145)

**Règles de structure (D143).** Héritage **simple** — pas d'héritage multiple
(cas rares en entreprise, résolus par association/composition) ; **pas de
notion d'abstrait** — le parent est une implémentation instanciable au même
titre que l'enfant (un concept de moins) ; **intra-module** (cohérence,
maintenabilité) ; multi-niveaux (`tiers → prospect → client`).

**Stockage : table unique, porté par Syncytium (D144).** Parents et enfants
dans **une seule table** — le choix qui rend la promotion triviale (pas de
déménagement de ligne, les champs du niveau s'activent) et préserve
l'identité (D142). **La visibilité des champs par niveau = un nouvel aspect de
la confidentialité** : un champ *appartient à un niveau* de la hiérarchie et
n'est applicable/visible que si l'enregistrement a **atteint** ce niveau —
troisième axe de visibilité, orthogonal au niveau/canal (D25) et à
l'audience/ligne (D70), porté par la même machinerie.

**L'héritage-état : la promotion (D145).** Un enregistrement **progresse dans
la hiérarchie au cours de sa vie** : dès que le prospect passe une commande, il
*devient* client — la promotion **étend ses propriétés** et ouvre les listes,
écrans et traitements du niveau atteint.
- **L'identité traverse** (D142) : même UUID, références et historique intacts ;
- **déclencheurs de promotion déclarés dans le modèle** : action explicite
  (tâche) ou **événement de données** (D54 — « première commande créée ») ;
- **listes par niveau** : la liste « clients » = les tiers au niveau client
  (filtre de niveau, D126) ;
- séparation des plans : ajouter un **niveau** = migration de schéma ;
  promouvoir un **enregistrement** = opération de données.

**Double position (D146, clôt le résiduel 1).** Un enregistrement peut occuper
**plusieurs branches simultanément** (client **et** fournisseur) : le parent
porte le commun, chaque spécialisation ajoute ses champs à la même table
(D144) — le chargé d'affaires visible sur la seule fiche client, le contact
commercial sur la seule fiche fournisseur : non antinomiques, c'est de la
**modélisation**. La visibilité par niveau s'applique **par branche,
indépendamment** ; l'identité unique (D142) est préservée — une entreprise
réelle = un enregistrement, le doublon de tiers évité par construction.
**L'état d'un enregistrement = un ensemble de positions**, pas une seule.

**Cycles d'évolution déclarés (D147, clôt le résiduel 2).** En théorie, pas de
retour client → prospect — mais **le modèle décrit les cycles** : transitions
autorisées (promotions, **rétrogradations si déclarées**), chacune avec ses
déclencheurs (D145) — une **machine à états déclarative** sur l'arbre. Défaut =
progression ; rétrogradation = exception explicite. Rétrograder **masque** les
champs du niveau quitté (D144), **ne détruit pas** (esprit D137) — re-promotion
possible.

**Référence à niveau minimal : écartée (résiduel 3).** Aucune contrainte de
niveau portée par les références — la cohérence niveaux/références relève de la
modélisation et des règles métier (Q36), pas d'un mécanisme moteur.

**Apport au méta-schéma** : déclaration d'héritage (parent, niveaux, branches),
appartenance des champs à un niveau/une branche, **cycle de vie déclaré**
(transitions + déclencheurs).

### 3.7 Opérations d'entité et encapsulation (Q50 ; D148–D152)

**Opérations d'entité (D148).** Une **opération** déclarée sur une entité =
**une tâche + un déclencheur**, matérialisée en **bouton dans l'IHM**. Pouvoirs :
- **changer l'état** (transitions d'héritage D145/D147 — l'opération est le
  véhicule de la promotion) ;
- **changer une ou plusieurs valeurs** de l'enregistrement ;
- **enrichir/modifier d'autres enregistrements** — ex. : *bon de commande →
  facturation* génère le **numéro de facture** et les **écritures comptables**
  (orchestration au-delà de l'entité, y compris inter-modules).
**Zéro machinerie nouvelle** : l'opération réutilise l'infrastructure des tâches
(droits D53, file/progression D55, notification D87, supervision D56) — une
tâche promue au rang de **verbe de l'entité**. *(Complément à confirmer : champ
en **écriture réservée aux opérations** — `numero_facture` jamais saisi à la
main.)*

**Lien parent matérialisé (D149).** Chaque enfant d'une composition **accède
directement à son parent** — lien structurel au service des **traitements et
tâches** (parcours descendant *et remontant* de la structure), **non exposé
dans l'IHM ni l'API**.

**Encapsulation d'exposition dérivée (D150).** Les enfants **non modifiables
seuls** (raffinement D101/D133) **n'apparaissent pas dans les API** —
utilisables uniquement via leur parent. **Aucune déclaration nouvelle** : la
règle d'atomicité induit la visibilité API.

**Écarts assumés (D151).** Champs internes → couverts par `privee` (D25).
**Interface de module → écartée** : « la déclaration est une et entière » — la
confidentialité et l'organisation modules/entités couvrent le besoin, pas de
concept supplémentaire (rationale conservée).

**Héritage : pas de surcharge de champ parent (D152).** Un champ du parent ne
peut pas être **redéfini** par l'enfant (type, contraintes : intouchables) ;
l'enfant peut **seulement ajuster la visibilité** d'un champ parent, **sans en
supprimer la valeur** — lignée « masquer, ne jamais détruire » (D137, D144,
D147).

**Écriture unique (D153, lève le reliquat de D148 ; forme finale 04/07/2026).**
**Pas d'attribut supplémentaire** : le mode d'accès en écriture d'un champ (ou
d'une entité) — D73 — gagne une **troisième valeur** :

| Mode | Sémantique |
|---|---|
| **lecture** | consultation seule |
| **écriture** | modification libre (dans les droits) |
| **écriture unique** | l'écriture n'est autorisée **qu'une fois** — champ vide : permise ; renseigné : refus |

- Déclinable **par audience/groupe** comme tout le modèle d'accès : les
  utilisateurs en *écriture unique*, le groupe administrateurs en *écriture*
  pleine — la correction admin reste **tracée** (D62), sans règle spéciale.
- L'écriture **différée** demeure naturelle : l'unique écriture survient quand
  elle survient — à la **création** (`nature` d'un article, par l'utilisateur)
  ou lors d'une **opération** (`numero_facture`, compteur D154, en différé).

**Compteurs (D154).** Le cas du numéro de facture fait émerger les
**compteurs** : **déclarés dans le modèle, gérés en interne par le moteur**
(ressource moteur, comme D93). Chaque compteur est une **ressource critique** :
- **jamais de doublon** (unicité d'allocation) ;
- **continuité de la valeur** — pas de trous (exigence légale de la
  numérotation des factures en France). Conséquence : **l'allocation fait
  partie de la transaction de l'opération** (échec = rollback, numéro non
  consommé) → sérialisation de l'allocation, coût négligeable à l'échelle TPE
  (D15).

**Compteurs composés à déclencheurs (D155).** Un compteur se **combine** à
d'autres, chacun évoluant selon son **déclencheur** — cas canonique (numéro de
facture) :

| Compteur | Départ | Déclencheur |
|---|---|---|
| Année | 2026 | le 1er janvier |
| Mois | 1 (borné 1–12) | le 1er du mois |
| Libre | 1 | incrément à chaque allocation ; **retour à 1 quand le compteur Mois change** |

Cohérences : déclencheurs calendaires = vocabulaire **planifié** (D54) ;
**réinitialisation en cascade** = dépendance déclarée entre compteurs ;
**assemblage du numéro = gabarit D90** (`"{annee}-{mois}-{libre}"` →
`2026-07-0042`) ; l'unicité du champ résultant découle de la combinaison.

**Apport au méta-schéma** : déclaration d'opérations (tâche + déclencheur +
bouton), champ en **écriture réservée** (write-once), **compteurs** (bornes,
déclencheurs, cascades, combinaison), lien parent implicite, visibilité par
spécialisation.

### 3.8 Validation à l'écriture (Q36 ; D156–D159)

Le mono-champ est **déjà couvert** (obligatoire/limites D118, unique D141,
format = conversion faillible D120/D131, domaines D123/D129, clés de contrôle
D122, écriture unique D153). Q36 ajoute les **règles inter-champs**.

**Règles déclaratives (D156).** Déclarées sur l'**entité** (ou la
**composition** pour porter sur l'agrégat entier — évaluées dans la transaction
D101) : **expression D90 booléenne** + **message** (identifiant de libellé,
traduit D127). **Une règle = un contrôle, jamais une affectation** (un total qui
se *calcule* = champ calculé D35 ; la règle *vérifie* un total saisi/importé).
Pas de règle inter-enregistrements au-delà de l'agrégat (territoire des
opérations D148 et de l'unicité D141). Les **préconditions d'opérations**
(D148) utilisent la même forme. Évaluation : à l'écriture, sur les règles dont
les **sources sont touchées**.

**Trois sévérités, protocole en trois passes (D157).**
- **Erreur** — la règle doit être respectée : pas d'enregistrement ;
- **Confirmation** — l'utilisateur valide en connaissance de cause ;
- **Information** — non bloquante, l'utilisateur est informé.

À l'enregistrement : **(1)** toutes les **erreurs** d'un coup (jamais d'arrêt à
la première) ; **(2)** si aucune erreur, toutes les **confirmations regroupées**
en une seule validation (pas de clics en rafale) ; **(3)** si confirmé, toutes
les **informations regroupées**, affichées une fois. Transposition API :
erreurs → rejet avec liste complète ; confirmations → réponse listant les
confirmations requises, **re-soumission avec acquittement** ; informations →
dans la réponse de succès. **Les confirmations acceptées sont tracées** (qui a
validé quoi, quand — audit D62) : le dépassement de remise confirmé laisse une
trace.

**Agrégats filtrés (D158).** Les agrégats du langage acceptent un **critère de
sélection** : `somme(lignes.montant si ligne.etat = "facturée")` — pressenti dès
Q18, acté pour **tout** le langage (calculs, règles, translations).

**Double évaluation, hook à deux versions (D159).** Le **serveur = la vérité**
(toutes sollicitations, externes et IHM) ; l'**IHM porte automatiquement les
règles déclaratives** (le moteur les transporte — évite les allers-retours).
Le **hook de validation** (échappatoire pour les cas hors D90) se décline en
**deux versions** : **serveur obligatoire** (la vérité) et **IHM optionnelle**
(JavaScript, D69) — même contrat déclaré (D52) ; sans version IHM, la règle
n'est vérifiée qu'à l'enregistrement (le protocole des trois passes couvre).

**Apport au méta-schéma** : règles (condition D90, portée, sévérité, message),
préconditions d'opérations, critère de sélection des agrégats, hooks de
validation bi-versions.

### 3.9 Fichiers (Q39 ; D160–D163)

**Le type `fichier` (D160)** — type de base portant : **nom, taille, type MIME,
empreinte, mots-clés** (ou sous-ensembles de mots-clés). Les **mots-clés sont
la clé de recherche** (« tous les fichiers contenant ce mot, cet identifiant »)
— réponse partielle au résiduel plein-texte de Q38, à l'échelle des fichiers.
Un champ = un fichier (atomicité D118) ; le multi = entité liée en composition.

**Stockage dual (D161).**
- **Binaires → hors base** : dossier dédié, **nommage géré par Syncytium** —
  les blobs binaires feraient grossir la base de façon conséquente ;
- **grands formats texte** (JSON…) → **blob en base**.
**Contrainte opérationnelle assumée** : la sauvegarde/restauration porte sur
**la base ET le dossier**, en cohérence temporelle (le périmètre Q40/D93
s'élargit d'autant).

**Quota en cascade (D162)** : déclaré à **quatre niveaux** — instance, module,
entité, champ — **la plus petite taille l'emporte**.

**Anonymisation et statut (D163).** L'anonymisation d'un fichier =
**suppression physique du contenu** (pièce d'identité, avis d'imposition…) +
**anonymisation des mots-clés, cohérente avec les fiches anonymisées** (le lien
survit à l'effacement — D139). **Statut de fichier** : `supprimé`
(physiquement, volontairement), `anonymisé`, `corrompu`, `perdu`.
- **Le squelette survit, le contenu part** (philosophie D137/D139) : les
  métadonnées demeurent, seul le contenu disparaît ;
- `corrompu`/`perdu` **détectés par contrôle d'intégrité** (empreinte +
  présence), **tâche planifiée** (D54) — maintenance déclarée du magasin ;
- **déduplication par empreinte, dès l'enregistrement (D165)** : au dépôt, le
  moteur calcule l'empreinte — contenu identique existant → **réutilisé** (pas
  de seconde copie). Réconciliation avec la suppression physique : **comptage
  de références** — la suppression/anonymisation d'un fichier **décrémente**,
  le contenu n'est réellement effacé qu'au **dernier détenteur** ; le **statut
  reste par champ** (chaque fiche sa vérité, un seul contenu). Correct au sens
  RGPD : un document légitimement détenu ailleurs survit ; toutes les fiches
  anonymisées → compteur à zéro → effacement physique.
Sécurité (acquis) : téléchargement par URL opaque (D75), re-contrôle d'accès à
chaque accès (D25/D70), contenu jamais exécuté (donnée adverse, D43) ;
écriture unique (D153) applicable ; magasin partagé avec les résultats de
tâches (D55) et pièces jointes de notifications (D108).

**Apport au méta-schéma** : type fichier (métadonnées + mots-clés + statut),
quotas en cascade, règle d'anonymisation de fichier.

### 3.10 Types complexes additionnels (D166–D167)

**Liste (D166, forme finale).** La famille s'agrandit : simple / composée /
**liste** — but : **simplifier la description** (`liste de fichiers`,
`liste d'entiers` — les notes d'un élève) sans entité liée pour les cas
triviaux. **La liste s'applique à tous les types sauf la liste** (pas
d'imbrication) : simples, composées, **types apportés/étendus par hooks**.
**Le catalogue gagne une propriété par type : « listable »** — le type déclare
s'il peut entrer dans une liste (la **communication est non-listable** : un
canal = un champ avec sa sémantique — « SAV » et « commercial » = deux champs
nommés). Amende **D160** (le multi-fichiers simple passe par la liste ;
l'entité liée reste pour les cas riches) ; nuance **D118** (l'atomicité vaut
pour l'*élément*). **Liste d'énumérés autorisée par construction** — la
multi-sélection revient par la porte générale du type liste, pas par un
attribut sur l'énuméré (ce que D121 écartait) : l'énuméré reste mono-sélection
en tant que champ. Propriétés :
- l'élément porte **toutes les contraintes de son type** (formats, limites ;
  fichiers : quotas D162, déduplication D165) ;
- **doublons autorisés** ; **ordre** = insertion ou clé de tri déclarée ;
  **bornes** min/max d'éléments déclarables ;
- champ liste **non triable** (D125), filtre naturel = **« contient »** ;
  stockage (tableau/JSON vs table fille) = facette D119/D18.

**Communication (D167, forme finale).** Type complexe matérialisant les
**échanges** entre membres de l'entreprise et/ou clients — la **trace CRM**
attachée à l'enregistrement. **Suite chronologique de messages** (auteur =
compte D77 — interne ou client ; horodatage ; contenu), composant **fil de
discussion** en IHM (D64). **Propriétés du type, avec défauts** :

| Propriété | Défaut |
|---|---|
| **visibilité** | **maximale** (tous ceux qui voient l'enregistrement ; l'audience D70 s'applique si restreinte) |
| **immuable** | **vrai** (la trace ne se réécrit pas — esprit D153) |
| **pièces jointes** | **non** (fichiers D160 si activées) |
| **notification** | **non** — si **vrai** : les nouveaux messages **notifient** (IHM ou mail — notamment la **réponse à une question**), via l'infrastructure existante D108–D110 (canaux = connecteurs, choix par profil D109, audience respectée) |

### 3.11 Historisation (Q37 ; D168–D173)

**Portée déclarative en cascade (D168).** L'historisation porte sur **une
entité et ses agrégats** — propriété du **module et/ou de l'entité**, héritée
par les enfants d'agrégat. **Défaut : inactive.** Un module historisé historise
**toutes ses entités sauf opt-out** explicite (« pas d'historisation ») —
patron de cascade (cf. quotas D162).

**Chaud/froid, instantanés complets, lecture seule (D169).** Le courant =
valeurs **chaudes** ; l'historique = valeurs **froides**. **On n'historise pas
les écarts : chaque entrée = toutes les valeurs de l'agrégat** (instantané
complet), avec son **auteur** (compte + on-behalf-of D76), son **horodatage**,
son **canal** (IHM/API/opération/tâche/connecteur) et son **motif** quand il
existe (D62/D157). **Toujours en lecture seule.** Coût de stockage assumé —
en échange, la consultation est **triviale** (la fiche à une date = lire
l'instantané, aucun rejeu de diffs).

**Confidentialité et anonymisation (D170).** L'historique est couvert par la
confidentialité : **visibilité de l'historique déclarée par groupe** (visible
du responsable métier, pas du client) ; **les confidentialités de champs sont
portées par l'entité d'origine** (un champ privé reste privé dans le froid) ;
**l'anonymisation (D139) s'étend à l'historique** — sinon fuite.

**Restauration outillée (D171).** Par l'**administrateur seul**, **sous
condition**, **tracée** — la restauration est elle-même une modification
historisée. Motivation vécue : fiche client écrasée par une erreur de
manipulation (ADV).

**Consultation temporelle (D172).** L'**API** sert la donnée **courante par
défaut** ; **une date précisée → l'agrégat tel qu'il était à cette date**
(lecture directe de l'instantané froid). **Résolution à date (précisée le
05/07/2026)** : le **dernier instantané dont l'horodatage ≤ la date demandée**
— les modifications **strictement postérieures sont ignorées** (une
modification datée exactement de la date est incluse). **Fenêtre d'existence** :
date **antérieure à la création** → l'enregistrement *n'existait pas* (réponse
vide, pas le premier instantané) ; date **postérieure à la suppression**
(D137) → **réponse vide par défaut**, **sauf demande expresse** — restitué
alors avec le **statut « Supprimé »** (miroir temporel du comportement des
listes : actifs par défaut, inactifs sur demande). L'**IHM** gagne un composant **« historique »** : synthèse des
entrées d'un enregistrement, et **clic sur un détail → la fiche à la date du
détail**.

**Les champs calculés s'appliquent à l'historique (précision 05/07/2026).**
Dividende des instantanés complets (D169) : les calculs (D35–D36), jamais
stockés, **s'évaluent sur les valeurs froides** — la fiche à une date affiche
ses calculs *tels qu'ils valaient à cette date*, sans mécanisme nouveau.

**Propagation de la date à travers les associations (D174).** La **date
d'origine de la requête traverse toute la chaîne** de résolution :
- entité **historisée** → instantané **à la date** ;
- entité **non historisée** → **valeur courante** (pas d'historique) ;
- non historisée **référençant une historisée** → **la date d'origine
  s'applique de nouveau** — elle n'est jamais perdue en route.

Le mélange chaud/froid peut créer une **perte de cohérence** → **alerte au
technicien**, détectée à la **validation du schéma** (analyse statique des
chemins temporels traversant du non-historisé), **sauf si l'entité non
historisée porte la propriété déclarant l'anticipation** — patron
`rupture_assumee` (D13/D102) : on peut assumer, jamais subir en silence.

**Insertion antidatée — reprise (D173, résout la sous-question de Q49).** Par
défaut, la reprise **n'importe pas l'historique**. Pour récupérer l'historique
d'un système d'origine : **solliciter l'interface à une date antérieure** puis
**insérer la modification dans l'historique** — en **levant certains
contrôles** (notamment les règles de cohérence, qui n'ont pas à juger le
passé). Problématique complexe assumée ; mécanisme dédié, réservé à la reprise.

**Le connecteur de reprise (D175, corrigé le 05/07/2026).** Un connecteur
**comme un autre** (D79/D83), mais **déclaré comme lié à une reprise**
(marqueur explicite) et **en lecture seule par défaut** (il *lit* le système
d'origine ; exception : coexistence avec le connecteur standard).
- **Durée de vie = responsabilité de l'administrateur** : débranché quand
  **toutes les données sont reprises ET la qualité est satisfaisante** —
  jugement appuyé sur les outils existants (rapports d'import D120, vidage de
  la quarantaine, télémétrie) ; débranchement = action d'administration tracée
  (D62).
- **Le flux de reprise** : connecteur « reprise » (lecture) → **translation**
  (D79/D90) **+ traitements pour les informations complexes** (tâches/hooks —
  au-delà du déclaratif) → **écriture par le chemin standard**.
- **Le privilège est porté par l'écriture, pas par le connecteur** :
  **l'insertion antidatée passe par le chemin d'écriture standard** et est
  **identifiée comme provenant d'une reprise** — c'est ce marquage de
  l'écriture qui autorise la levée des contrôles (D173) et fonde la
  traçabilité. Une écriture non identifiée « reprise » ne peut jamais antidater
  ni contourner les règles.

**Mapping exhaustif et couverture (D176).** Le connecteur auto-descriptif
(D83) **analyse le schéma de la base d'origine et signale les entités/champs
non couverts** par le mapping. Règles : le **mapping référence toute la
structure du modèle d'origine** ; les éléments non repris sont **explicitement
marqués « ignorés »** ; la **couverture de la reprise se mesure** (comparaison
mapping ↔ modèle d'origine) — l'oubli silencieux est impossible : *on peut
ignorer, jamais oublier*.

**Critère d'acceptation (D177).** Seuls sont enregistrés les enregistrements
dont **toutes les données ont été converties avec succès** (D120) **et dont les
contraintes de cohérence de la cible sont résolues** (D156) — au niveau de
l'enregistrement/agrégat (D101). Pas d'enregistrement partiel.

**Clés externes déclarées, provenance persistante (D178).** Le mapping
**précise les clés externes à conserver** — **aucune déduction automatique**
depuis le modèle d'origine (parfois trompeur). Chaque enregistrement repris
**porte sa provenance** : **connecteur d'origine, date de reprise, clé
existante** (du système source). À la désactivation/suppression du connecteur,
**ces informations demeurent** — plus alimentées par l'usage courant (la
provenance est un fait historique, pas un lien vivant).

**Rejets : le rapport seul (D179, clôt Q49).** Les enregistrements refusés
(D177) ne sont **pas conservés comme données** côté Syncytium : ils sont
**listés dans le rapport d'import** (cellule par cellule, D120), **diffusé
selon les opt-in de notification existants** (D108–D110) — correction **à la
source** ou ajustement des règles, puis **relance sur les manquants**. La
**non-couverture (D176) fait l'objet d'un rapport spécifique émis au
technicien** pour analyse.
(Quarantaine écartée : la source vit encore pendant la reprise — D175.)

**Le rapport persisté et le statut des lignes rejetées (D181, complète
D179).** Sans mémoire des rejets déjà vus, le rapport re-signalerait
éternellement les mêmes lignes — et « exclure une ligne que nous n'intégrerons
jamais » n'aurait aucun support. Le rapport d'import est donc **stocké** :

- **Stock de rejets consolidé.** Les rapports sont **persistés** (décrits par
  le méta-modèle de Syncytium, comme les notifications D110 — module moteur).
  Une ligne rejetée est identifiée par sa **provenance** (connecteur + entité
  source + clé externe déclarée D178 ; en repli, si la clé elle-même est
  illisible : empreinte du contenu source).
- **Un statut par ligne** — le cycle complet est décrit ci-dessous (D183).
- **Écran moteur de gestion des rejets** : consultation, filtres, changement
  de statut. Accès **déclaré** ; par défaut l'administrateur — le stock
  contient du **contenu source brut**, potentiellement sensible, donc écran
  restreint.
- **Le rapport d'un passage ne porte que l'activité** : les lignes
  **nouvellement en anomalie** (inconnues du stock) et le **bilan des
  « à reprendre » retentées** (intégrées ou repassées en anomalie), diffusés
  via les opt-in ; les stocks dormants ne sont **pas re-notifiés** —
  l'existant se consulte à l'écran.
- **Critère de fin objectivé** (renforce D175) : plus aucune ligne « en
  anomalie » ni « à reprendre » — tout est « intégré » ou « ignoré » — et la
  couverture (D176) assumée : le connecteur de reprise peut être débranché.
  Le devenir du stock au débranchement (conservation en trace ou purge)
  relève de l'administrateur, comme la durée de vie du connecteur (D175).

**Le cycle des statuts : le système constate, l'administrateur décide (D183,
amende D181).** Quatre statuts, aux mains strictement séparées :

- **en anomalie** — posé par le **système** : la tentative d'intégration a
  échoué. C'est l'**état d'entrée** d'une ligne dans le stock ; elle y
  **reste sans être retentée** tant qu'un humain n'a pas statué (pas
  d'acharnement aveugle sur une ligne connue mauvaise).
- **à reprendre** — posé par l'**administrateur** (depuis « en anomalie » ou
  « intégré », D184) : une règle a été corrigée, ou la source l'a été — la
  ligne est **replanifiée** pour le prochain passage.
- **ignoré** — posé par l'**administrateur** (depuis « en anomalie ») :
  exclusion **assumée**, la ligne ne sera jamais intégrée ni retentée ;
  décision **tracée** (qui, quand, motif — audit D62). Revenir sur un
  « ignoré » (→ « à reprendre ») reste une décision d'administrateur, tracée
  de même.
- **intégré** — posé par le **système** : l'intégration a réussi
  (rapprochement de provenance D178).

**Un passage d'intégration traite les enregistrements nouveaux et les lignes
« à reprendre »** — rien d'autre — par la **même voie standard** (translation,
critère d'acceptation D177, écriture identifiée « reprise » D175). À l'issue,
le système repositionne chaque ligne — **intégré** ou **en anomalie** (dernier
motif, compteur de tentatives, dernière vue mis à jour).

**Le retour arrière d'une ligne intégrée (D184).** L'administrateur peut
repasser une ligne « intégré » en « à reprendre » — cas d'une erreur
découverte après coup (une règle fausse a produit des données fausses). Cette
bascule **supprime physiquement** les données issues de la ligne (l'agrégat
créé et son historique éventuel), avant réimport par le prochain passage —
comme si la ligne n'avait jamais été intégrée. C'est une **exception assumée**
au principe « masquer, ne jamais détruire » (D137), justifiée — intervenant en
phase de reprise, elle **garantit la qualité des données à l'issue de la
reprise** (pas de fantômes inactivés issus de règles fausses) — et bornée :

- **portée par la provenance** : seules les données dont la provenance (D178)
  pointe la ligne sont supprimables — la bascule de statut est le **seul
  chemin** de suppression physique, aucun autre n'est ouvert ;
- **garde-fou d'intégrité** : si l'enregistrement est déjà référencé par des
  données **étrangères à la reprise** (associations créées depuis), la bascule
  est **refusée** — l'administrateur traite d'abord ces références (cohérent
  avec D137) ;
- **la trace demeure** : la donnée disparaît, mais la ligne du stock garde la
  mémoire datée d'avoir été intégrée puis reprise (D182) — l'audit survit à
  l'effacement.

**Ce n'est toujours pas une quarantaine** : la ligne n'est **ni éditable ni
injectable depuis le stock** — la correction se fait à la source, l'intégration
passe par la voie standard. Le stock est une **trace à statut**, pas un sas de
données. Le principe « **ignorer, jamais oublier** » (D176) s'applique
désormais aux deux granularités : la structure (entités/champs ignorés du
mapping) et les enregistrements (lignes « à ignorer » du stock).

**Les dates du cycle de vie : le stock comme journal d'audit (D182, complète
D181).** Chaque ligne du stock porte les **dates de son cycle de vie** :
**première détection** (premier rejet), **dernière tentative** (D181),
**changement de statut** (la décision « à ignorer » portait déjà qui/quand/
motif — D62) et **date d'intégration** (bascule « intégré », automatique ou
manuelle). Le stock devient ainsi le **journal d'audit de la reprise** :
chaque ligne source a un destin **daté et justifiable** — intégrée (quand),
écartée (qui, quand, pourquoi), en anomalie ou replanifiée (depuis quand),
reprise après erreur (quand — D184). Combiné à la
**provenance persistante des enregistrements intégrés** (D178 — connecteur,
date, clé d'origine), l'audit couvre les **deux faces** de la reprise : **ce
qui est entré** (D178) et **ce qui n'est pas entré** (D181/D182).
L'**ancienneté des lignes « en anomalie » et « à reprendre »** devient au
passage un indicateur de pilotage pour l'administrateur (critère de fin de
reprise, D181/D183).

**Le double périmètre du projet (D180).** La reprise révèle que Syncytium
couvre **deux périmètres** avec **un seul moteur** :
1. **La construction d'un entrepôt de données fiable** — consolider des sources
   mal organisées à l'historique incohérent, à travers le filtre de qualité
   (D177), avec couverture mesurée (D176), provenance/lineage (D178),
   temporalité native (D168–D174) et restitution (calculs, agrégats filtrés,
   surfaces de synthèse Q53) — l'IHM permettant **consultation et correction**
   (ce qu'un entrepôt classique en lecture seule ne permet pas) ;
2. **La mise à disposition d'applications métier** fondées sur une description
   aussi exhaustive et simple que possible — le développement d'applications
   dédiées basées sur la donnée et sa transformation.
**Qualification honnête** : à l'échelle TPE, (1) est un **entrepôt
opérationnel** (référentiel consolidé, vivant, gouverné) plus qu'un entrepôt
analytique OLAP — distinction sans objet à quelques Go ; si la volumétrie
l'exigeait un jour : abstraction de persistance (D18) et matérialisation des
agrégats (D36) sont les points d'extension. **Deux postures, combinables dans
une même instance** — la Vision (§1) s'en trouve élargie.

**Apport au méta-schéma** : propriété d'historisation (module/entité,
opt-out), visibilité de l'historique par groupe, entrées d'historique
(instantané + auteur/horodatage/canal/motif), API temporelle, composant
historique.

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
- RGPD léger : seuls des **comptes techniques** sont analysés (D40).
- **La boucle metadata-driven se referme sur les deux faces** : interne (D38) et
  externe (D45).

**La détection : l'algorithme SEQUITUR (Q30 ; D315–D316, précisé le
18/07/2026).** L'approche vient du **précédent projet de l'auteur** :
l'identification de **séquences de requêtes sur une base PostgreSQL** pour
proposer des optimisations — remplacer des appels unitaires par des
**curseurs** et des **lectures/mises à jour par bloc**.

- **Le moteur d'analyse (D315).** L'identification s'appuie sur
  l'**algorithme SEQUITUR** (Nevill-Manning & Witten) : il analyse toutes
  les **paires de requêtes normalisées** et ne conserve que celles qui
  apparaissent **au moins 2 fois** ; chaque paire retenue est **remplacée
  par une règle** qui se substitue à toutes les paires identiques ;
  l'algorithme **se répète jusqu'à ce qu'il n'existe plus de paires
  utilisées 2 fois ou plus**. Le résultat est une **grammaire hiérarchique
  des séquences répétées** — appliquée ici aux journaux d'appels d'API
  (D40–D41), par compte technique.
- **L'exploitation : des séquences aux services (D316).** Les règles de la
  grammaire — les séquences qui se répètent — ont **deux débouchés** :
  1. des **recommandations d'optimisation** au consommateur (les motifs du
     tableau ci-dessus : cache, lecture par lot — l'héritage direct des
     curseurs et blocs du projet PostgreSQL) ;
  2. **la transformation en service** : une séquence de requêtes **lourde
     et longue** qui se répète **peut se transformer en un service que nous
     pourrions proposer** — une requête ou un ensemble de requêtes limitées
     la remplaçant. Le moteur **propose** le candidat-service au technicien
     (avec sa fréquence et son coût constaté) ; l'humain décide — cohérent
     avec le consultatif-uniquement de D45 et le patron « le moteur propose,
     le technicien dispose ».

- **La normalisation des appels (D317).** Elle s'effectue **via les
  endpoints et la liste des propriétés** concernées — **en ignorant les
  valeurs**. Le pendant API des requêtes SQL normalisées du projet
  d'origine : deux appels au même endpoint portant les mêmes propriétés
  sont la même « lettre » de la grammaire, quelles que soient les valeurs.
- **Les seuils de pertinence (D318).** Le dilemme est nommé : un seuil de
  fréquence **trop bas** fait remonter des séquences sans poids et alerte
  trop souvent ; **trop élevé**, il fait passer les optimisations **sous
  les radars**. Deux critères combinés :
  1. **la récurrence sur une plage temporelle** — une séquence revenant
     **une fois par jour, par semaine ou par mois** peut s'avérer une
     optimisation pertinente (la régularité pèse autant que le volume) ;
  2. **le rapport entre la longueur des requêtes normalisées et la
     longueur des requêtes réelles** — le taux de compression de la
     grammaire mesure le **gain** qu'offrirait le service.
  Les **valeurs** restent **à évaluer sur données réelles** (« la fréquence
  minimale doit être évaluée pour être pertinente ») — calibrage naturel
  lors des mises en situation (Q59), patron défaut global + surcharge
  (D47–D51).
- **Pas de catalogue de motifs prédéfini (D319 — clôt Q30).** Les motifs
  **se déduisent des motifs identifiés** par la grammaire — ils ne sont
  **pas connus à l'avance**. Le catalogue de détections dédiées proposé
  (cache, N+1, polling, crawl bienveillant) est **écarté** comme mécanisme :
  ces schémas, s'ils existent chez un consommateur, **émergeront de
  SEQUITUR** comme règles courtes et fréquentes — un seul moteur de
  détection, sans a priori.

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

**Synchronisation étendue aux fichiers (D164).** Le stockage dual (D161 —
binaires hors base) impose que **toute synchronisation entre deux instances
(D113 staging, D114 PCA/PRA) porte sur la base ET le dossier de fichiers**, en
cohérence temporelle — comme la sauvegarde ; la recréation différée d'un
staging copie les deux, la bascule PCA/PRA suppose les deux à jour.

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

### 8.6 L'IHM générée : la triade par entité et ses défauts (Q48 ; D185–D189)

Le principe directeur, validé par les défauts ci-dessous : **« le schéma
suffit, la déclaration ajuste »**. Une description sans aucune déclaration
d'IHM produit une application **complète et utilisable** ; chaque déclaration
raffine — jamais de configuration obligatoire.

**La triade de composants d'une entité (D185).** Une entité ouvre sur trois
composants :

1. **La liste d'enregistrements** : un jeu de colonnes, un jeu de filtres, un
   jeu de tris (D125–D126) et des actions — **ajout, modification,
   suppression**.
2. **L'écran de saisie et de consultation** : **un même écran, deux modes** —
   **écriture** (création/modification = formulaire) et **lecture seule**
   (consultation/suppression = fiche). Une seule organisation déclarée, deux
   rendus ; le mode s'ouvre selon l'action demandée et se **borne aux droits**
   (confidentialité D25, audience D70, niveau d'héritage D144, écriture
   unique D153).
3. **Le widget de résumé** : au survol d'un champ (une référence), il fait
   apparaître les **informations essentielles** de l'entité cible.

**Les défauts sans description (D186).** Sans une ligne de déclaration d'IHM :

1. l'entité apparaît comme une **entrée du menu** référençant le module ;
2. la liste reprend **tous les champs** de l'entité (ou les premiers champs,
   tels qu'ils remplissent la largeur de la liste) ;
3. un champ dispose d'un **affichage par surface** — formulaire, liste,
   widget — chacun **déclinable par mode responsive** ;
4. de même, formulaire et liste ont leurs **modes d'affichage responsive** ;
5. dans un formulaire, les champs sont **l'un en dessous de l'autre, sans
   section** ;
6. les **compositions** (agrégats) apparaissent chacune **dans un onglet,
   sous forme de liste** ;
7. si l'entité est **historisée**, l'historique apparaît **dans le dernier
   onglet — invariant, toujours vrai** (D168–D174) ;
8. un champ **communication** (D167) apparaît **dans un onglet** ;
9. une **association 1-1** (champ référence) affiche le **widget de résumé**
   de l'entité cible ;
10. une **association 1-N** (champ liste inverse, D136) affiche **la liste de
    l'entité associée, filtrée** sur les enregistrements correspondant à
    l'association.

**Les listes déclarées (D187).** Une entité **affiche une liste** ; la
description peut en contenir **une ou plusieurs**. Une liste précise **les
colonnes, les tris et les filtres** ; elle est disponible pour **un ou
plusieurs modes d'affichage (responsive)** ; elle **précise le formulaire
utilisé**. Ses fonctions : **ajout, modification, suppression, import,
export (CSV ou Excel), impression PDF** — l'import s'appuie sur le moteur de
conversion faillible (D120, rapport cellule par cellule), l'export sur la
facette affichage (D120), l'impression est une **tâche** (D53). S'y ajoute la
**liste « paramétrable »** : un composant dont les paramètres sont
**enregistrables** (colonnes, tris, filtres choisis par l'utilisateur —
portée à préciser).

**Les formulaires déclarés (D188).** Une entité peut définir **plusieurs
formulaires** ; un formulaire peut être dédié à **un ou plusieurs modes
responsive**. Un formulaire organise les champs en **blocs** ; un bloc
s'affiche comme **onglet**, comme **section** ou comme **popup** *(la popup
sera abandonnée le 06/07/2026 — D214)* ; les sections positionnent les
éléments **en colonnes ou en lignes**. Un champ dispose d'un **affichage
dédié au mode responsive**.

**Le menu déclaré (D189).** **Le modèle porte l'organisation du menu.** Une
entité peut y avoir **plusieurs entrées**. *(Chaîne interprétée, à valider :
une entrée de menu désigne une liste ; la liste désigne son formulaire —
menu → liste → formulaire.)*

**Le module fonctionnel : la sous-application (D190).** L'application se
décompose en **sous-applications** — les **modules fonctionnels** :

- un module fonctionnel est une **vue offerte à l'utilisateur** avec des
  fonctionnalités **restreintes** : elle couvre **au plus** l'ensemble des
  droits de l'utilisateur, mais il peut y avoir moins. Il **restreint la
  surface présentée, il n'étend jamais les droits** — la sécurité reste
  portée par les groupes, la confidentialité et l'audience (D25–D27,
  D70–D77) ;
- l'**administrateur affecte** un utilisateur à un ou plusieurs modules
  fonctionnels ; l'utilisateur **navigue** entre ses modules fonctionnels et
  choisit dans son **profil** son module fonctionnel **de préférence** ;
- **défaut sans description** : le module fonctionnel est **l'ensemble des
  composants de l'application** (module fonctionnel unique).

*Terminologie* : à distinguer du **module** (structure du schéma, D115/D117) —
le **module structure la donnée**, le **module fonctionnel structure
l'expérience utilisateur**. **[Distinction dissoute par D416 : les
modules fonctionnels = les modules — un seul concept, la donnée et
l'expérience portées par le même dossier.]**

**La page d'accueil du module fonctionnel (D191).** La structure d'écran :

- l'instance est **identifiée** par : un **nom d'application**, un **nom de
  module fonctionnel**, une **société** et un **logo** ;
- un **bandeau à gauche** : le choix du module fonctionnel ;
- un **bandeau en haut** : les **menus et leurs sous-menus** ;
- le **reste de l'écran** : des **widgets** qui apportent instantanément des
  **indicateurs clés** ou affichent une **liste représentant une entité** ;
  une page d'accueil regroupe un ou des widgets, ou affiche **directement une
  liste** d'une entité ;
- inspiration de design notée : **Microsoft Azure** — le design sera traité
  **après** que la structure soit bien définie ;
- **défauts sans description** :
  1. le bandeau de gauche **n'apparaît pas** (un seul module fonctionnel
     disponible) ;
  2. le bandeau haut contient **les modules** (du schéma), et dans chaque
     entrée de module **les entités d'agrégats — uniquement les parents**
     (les enfants de composition n'ont jamais d'entrée par défaut, cohérent
     D150) ;
  3. le reste de l'écran est **vide**.

*Terminologie* : le **widget d'accueil** (indicateur clé ou liste d'entité)
est distinct du **widget de résumé** (survol d'une référence, D185).

**Le troisième niveau de menu et l'accès direct aux enfants (D192).** Les
**entités de liaison** (D135) ne sont **jamais proposées par défaut** — elles
sont accessibles depuis une entité. Le menu peut cependant prévoir un
**troisième niveau** : module → entités parents → **entités enfants et
entités de liaison**. Corollaire : l'IHM propose alors la **modification d'un
enfant** en accès direct — mais, dans la mécanique du projet, **la mise à
jour d'un enfant reprend l'entité parent/racine** et s'applique comme une
écriture de l'agrégat complet (atomicité portée par le modèle D101,
concurrence état-avant/état-après D111, composition D132) : l'accès direct
est une **commodité de présentation, jamais un contournement de l'agrégat**
(cohérent avec D150 — les enfants ne sont pas modifiables seuls).

**Les menus (D193, amende les défauts D191/D192).**

- **Un menu par module fonctionnel**, organisé **par niveaux hiérarchiques**.
- Une **entrée de menu** peut être : un **menu** (sous-menu), une **liste
  d'entité**, un **formulaire de création**, une **action** ou un **widget
  de synthèse**.
- La **page d'accueil** est accessible **en cliquant sur le logo** de
  l'application.
- **Confidentialité** : les entrées sont **filtrées** par le niveau de
  confidentialité défini dans le modèle — une entité non visible → **toutes
  les entrées qui la référencent sont invisibles** (anti-oracle, patron
  D126).
- **Défaut sans description** : le menu représente **l'ensemble des
  modules** (un seul module défini → l'ensemble des entités agrégats) ; les
  **sous-menus** affichent les **entités enfants et associées (en lien
  multiple)** — le 3ᵉ niveau (D192) est donc **présent par défaut** ; une
  entrée de menu fait référence à **la liste de l'entité**.

**L'expérience utilisateur : le menu-parcours (D194 — ouvre Q54).** Un menu
peut aussi être une **expérience utilisateur** : un **enchaînement d'écrans
et d'appels d'entités** rendant un parcours — un **circuit de validation**,
un **processus d'enregistrement**, par exemple. Concept acté ; la
spécification (déclaration des étapes, transitions, état intermédiaire,
droits, abandon) fait l'objet de la **nouvelle question Q54**.

**Le quatuor de composants d'une entité (D195, complète D185).** À la triade
s'ajoute le **widget de synthèse de l'entité** (à intégrer sur la page
d'accueil) : **liste, formulaire, widget de résumé, widget de synthèse**. La
**liste** est une représentation **tabulaire** classique **ou** une
représentation **en widgets de résumé** (elle suppose alors un widget de
résumé déclaré).

**Les fonctions d'une liste (D196).**

- **Création / modification / suppression** d'un enregistrement sélectionné —
  chacune **uniquement si l'utilisateur en a le droit** : ces **droits
  d'action par entité s'inscrivent au modèle de confidentialité** (complète
  D25–D27, D70–D77, D153).
- **Confirmation de suppression** : affiche **le formulaire en lecture
  seule** avec un bouton de **confirmation ou d'annulation** — **pas de
  popup de validation**.
- **Export CSV / Excel** : **toutes les colonnes visibles pour
  l'utilisateur** — jamais plus (cohérent avec la confidentialité).
- **Actions d'entité** (D148) sur un enregistrement, **limitées à celles
  autorisées** pour l'utilisateur.

**La masse (D197 — clôt la clarification n° 7).**

- **Modification en masse = parcours séquentiel** : après la validation d'un
  enregistrement, passage **au suivant** ; l'utilisateur peut **interrompre
  le cheminement à tout moment** ; sinon, tous les enregistrements
  sélectionnés sont parcourus **sans revenir à la liste**.
- **Suppression en masse** (un seul sélectionné = suppression simple) :
  **double validation** — la première précise le **nombre d'enregistrements**
  et propose une **« synthèse » des enregistrements supprimés** ; la seconde
  **confirme**.

**Le paramétrage des listes (D198 — clôt la clarification n° 3).**

- **Tabulaire** : les colonnes et leur **dimension par défaut** ; les tris
  (appliqués **au clic sur l'entête** de colonne) ; les champs filtrables ;
  le **filtre transverse** — un champ texte **recoupant plusieurs champs**,
  et **plusieurs filtres transverses possibles** portant sur des champs
  différents ; une option de **sélection des colonnes affichées et de leur
  ordre**, enregistrée **au profil de l'utilisateur** ou **mise à
  disposition de tous les utilisateurs d'un groupe** depuis l'interface
  d'administration (accessible à l'**administrateur ou au responsable
  métier** D127).
- **En widgets** : le **nombre de widgets par ligne** ; les champs affichés
  **non sélectionnables** (ils appartiennent au widget de résumé) ; les tris
  en **boutons** dans la partie haute de la liste ; filtres et filtre
  transverse comme le tabulaire.
- **Défaut sans description** : format **tabulaire, toutes les colonnes,
  tous les tris possibles, un filtre transverse sur toutes les colonnes**.
  Plusieurs listes par entité ; chaque liste restreinte à un ou plusieurs
  **modes responsive** (défaut : **tous les modes**).

**Le formulaire unique à cinq usages (D199, précise D185/D188).** Le même
formulaire sert la **création, la modification, la suppression, la
consultation et la visualisation d'un historique**.

- **Champs clés incrémentaux** (compteurs D154–D155) : renseignés **au
  moment de la validation de l'enregistrement** seulement — la continuité
  est préservée (allocation dans la transaction, D154).
- **Blocs composables** : un bloc peut être **composé d'autres blocs**,
  organisés **horizontalement ou verticalement** ; un bloc est une
  **section** ou un **onglet** ; une **section** regroupe plusieurs champs
  **l'un en dessous de l'autre**.
- **Champs à bloc dédié** : certains types l'exigent — agrégat
  (composition), liste d'association, coordonnées géographiques (**via une
  carte**), pièces jointes… Cette exigence est une **propriété du composant
  graphique** représentant le champ.
- Un bloc peut **faire référence à un widget de synthèse avec un filtre
  spécifique sur l'enregistrement courant** (ex. le chiffre d'affaires lié
  au client, dans sa fiche).
- Le formulaire est **déclinable par mode(s) responsive** ; les **actions**
  sont accessibles **via des boutons du formulaire**.
- **Défaut sans description** : tous les champs pouvant tenir en section
  sont regroupés **dans une section**, l'un en dessous de l'autre ; les
  champs à bloc dédié apparaissent **en onglets** ; l'**historique = toujours
  un onglet, toujours le dernier** (invariant D186 confirmé).

**Le composant graphique d'un champ (D200).** Défini par **le type du champ
et ses propriétés** ; **décliné en modes responsive par construction** —
**aucun choix d'affichage laissé au technicien** (la représentation d'un
champ dédiée au smartphone n'a pas à s'afficher sur un écran de PC) ;
définissable ou surchargeable **via hook** (D64–D68, déjà acté).

**Le widget de résumé, précisé (D201 — clôt la clarification n° 4).** Il
**sélectionne des champs** à afficher **en lecture seule et/ou en
modification** ; **pas d'onglets**, mais des **sections** possibles ;
**petit par principe** — « un widget de résumé qui prend tout l'écran n'a
aucun intérêt ». **Défaut sans description : il n'existe pas.**

**Le widget de synthèse (D202).** Il affiche sur la page d'accueil les
**informations clés d'une entité** : des **compteurs**, des **sommes ou des
calculs**, des **graphiques** (types à décrire — Q53), des **tableaux de
valeurs**. Il peut **accéder à une liste avec des filtres définis** —
drill-down : un camembert des ventes dont chaque part, cliquée, ouvre **la
liste des ventes appartenant à la part**. **Défaut sans description : il
n'existe pas.**

**Les modes responsive (D203 — clôt la clarification n° 6).** Jeu fermé :
**Écran, Tablette ou Smartphone** × **portrait ou paysage**. *Vocabulaire
précisé avec D250 : trois **modes** (écran, tablette, smartphone) × deux
**orientations** (portrait, paysage) ; **par défaut, tout est prévu pour un
écran paysage**.*

**La page d'accueil personnalisée (D204, précise D191).** Sur la page
d'accueil, l'utilisateur peut **sélectionner une entrée du menu ou laisser
vierge**, et **choisir les widgets de synthèse à afficher**.

**L'édition en ligne dans une liste (D205).** Une liste permet de **modifier
une valeur directement dans le tableau** — une case à cocher, une liste de
valeurs, un champ texte ou une valeur numérique. Sous le droit de
modification (D196) ; la concurrence s'applique champ par champ (D111).

**Colonnes modifiables par défaut, lecture seule déclarable (D266, précisé
le 07/07/2026).** Dans la déclaration d'une liste, les colonnes sont
listées et, **par défaut, elles sont toutes modifiables** (édition en ligne
D205) ; la déclaration peut marquer une colonne **en lecture seule**. La
marque ne fait que **restreindre** : elle ne rend jamais modifiable un
champ qui ne l'est pas par ailleurs (droits D196, mode d'accès D153,
champs calculés).

**La déclaration des surfaces (D206).** Pour une entité, la description
déclare :

- **la ou les listes** — chacune **nommée**, avec une **description à
  préciser** ; déclinable **par mode d'affichage** avec un **mode par
  défaut** (« pour éviter les blancs ») ; **sans précision de mode, la liste
  vaut pour tous les affichages non précisés** ; une liste est **associée à
  un formulaire** ;
- **le ou les formulaires** — mêmes règles : nommé, description, déclinaison
  par mode d'affichage avec mode par défaut et repli sur les affichages non
  précisés ;
- **le ou les widgets de résumé** — nommé, description, même approche de
  déclinaison par mode ;
- **le ou les widgets de synthèse** — nommé, description.

**Les paramètres d'un formulaire (D207).** Le formulaire porte quelques
paramètres — actés : **« affichage de l'historique »** (par défaut **vrai** ;
mis à **faux**, l'onglet historique est masqué — nuance de l'invariant
D186/D199 : *s'il est affiché*, c'est toujours le dernier onglet) ; le
**mode d'affichage lecture seule** peut être précisé (formulaire de
consultation).

**Le widget de résumé : une configuration de formulaire restreinte (D208).**
Un widget de résumé **reprend les mêmes items de configuration qu'un
formulaire** ; **certains composants graphiques y seront interdits** (et pas
d'onglets — D201). Les widgets de résumé — comme les widgets de synthèse —
sont **pluriels et nommés** par entité.

**Le masque d'explication (D209).** À la **première consultation** — ou
**sur sollicitation** — d'une liste, d'un formulaire, d'un widget de résumé
ou d'un widget de synthèse, un **masque d'explication** est proposé : il
présente la **description déclarée de la surface** et **reprend les
descriptions des champs affichés** (D124). Les descriptions déclarées
deviennent ainsi **l'aide en ligne**, sans rédaction séparée.
*(Interprétation : la « première consultation » se mémorise au profil de
l'utilisateur.)*

**Les modules fonctionnels déclarés (D210, précise D190).** Les modules
fonctionnels sont **déclarés dans la description** ; **un module fonctionnel
déclare un menu** (D193) ; l'**association entre un utilisateur et un module
fonctionnel est assurée par l'administrateur dans un écran
d'administration**. Une entrée de menu décrit les paramètres actés en D193.

**L'import : un écran de module (D211 — ouvre Q55).** L'import de données
pour les entités d'un module est **retiré des fonctions de liste** : il est
associé à un **écran dédié**, réservé au **responsable métier ou à
l'administrateur**. Le **détail de l'import sera décrit ultérieurement**
(**Q55**).

**L'impression PDF, confirmée et généralisée (D212).**

- **Par défaut** : l'impression affiche **le contenu de la liste telle
  qu'elle est affichée**.
- **Par déclaration** : une impression peut se **limiter à une liste de
  colonnes** (à préciser dans la liste) pour un **mode d'affichage proposé**
  — tabulaire ou widgets de résumé.
- Une impression peut **associer un gabarit** pour imprimer des
  **documents** — et un PDF peut être **imprimé depuis un formulaire si un
  gabarit est proposé** (facture, bon de livraison…).
- **Le PDF peut être vu comme un composant** — l'analogie vaut pour
  l'enregistrement et la réutilisation, mais **ses fonctionnalités ne sont
  pas exactement les mêmes qu'un composant graphique** : le contrat propre
  du gabarit est à définir (**Q57**). Pour une liste, **plusieurs PDF sont
  possibles**.

**L'export CSV, précisé (D213).** **Par défaut**, l'export s'appuie sur
**les colonnes affichées** dans le tableau ; les colonnes d'un export
déclaré sont **à déclarer avec leur longueur**.

**La popup abandonnée (D214, amende D188).** Le bloc **popup est
abandonné** : un bloc s'affiche comme **section ou onglet** (composables,
D199) — cohérent avec le refus de la popup de validation (D196).

**La référence 1-1 (D215, remplace le défaut D186.9).** Un champ référence
affiche **un libellé ou un élément de synthèse** — une agrégation de champs,
une image… (gabarit D90 pressenti) — avec **un lien vers le formulaire de la
référence, en lecture seule**. Pour **choisir** un item : un **lien vers une
liste** est proposé — une **liste nommée, précisée dans la description du
formulaire**.

**Le champ 1-N (D216).** Le champ liste inverse (D136) affiche une **liste
nommée** (désignée) de l'entité associée, dont **la colonne faisant le lien
avec l'entité courante est à masquer**.

**La recherche plein-texte : mono-entité, portée par la liste (D226 —
Q38).** Une recherche plein-texte **ne s'applique qu'à une seule entité** et
est **disponible sur la liste** de l'entité. **La recherche globale
trans-entités est écartée** — limitation **assumée** : les projets visés ne
nécessitent pas cette machinerie (ni barre de recherche d'application, ni
index global). La subtilité qui fait la puissance du dispositif : **la
correspondance traverse les références** — sur la liste des commandes, une
recherche « Dupont » **remonte toutes les commandes passées par Dupont**,
alors que « Dupont » n'est pas un champ de la commande mais l'affichage de
sa référence client. Mécanique sous-jacente : le **« contient » sur chaîne
normalisée** (D222) ; les droits sont ceux de la liste (row-level D70–D77 —
l'anti-oracle est gratuit).

**Les recherches déclarées (D227, unifie D198).** Une recherche plein-texte
**précise la liste des champs concernés** (ex. le nom, le prénom, l'adresse
de domiciliation) — **les autres champs sont ignorés**. **Une entité peut
définir plusieurs recherches.** C'est **le même objet** que le filtre
transverse (D198) : une **« recherche » nommée** au méta-schéma — des
champs + un mode. *(Interprétations : la déclaration peut viser un champ
**à travers une référence ou un enfant de composition** — c'est ainsi que
« Dupont » matche depuis les commandes, et qu'un commentaire de ligne
participe si déclaré ; le **défaut** sans description (D198) reste le filtre
transverse sur **les colonnes affichées** — l'affichage des références
comprises.)*

**Le filtrage vivant (D228).** La recherche concerne toujours
« **contient** ». **La liste se filtre au fil de la saisie ou de la
sélection — pas de bouton « filtrer »** ; un **throttling** évite de
solliciter le serveur à chaque caractère. **Pour chaque type de données, un
filtre pourra être défini** — à décrire avec les composants graphiques
(**Q56**).

**La recherche par approximation (D229).** Une recherche porte sur une
**sous-chaîne stricte normalisée** (D222) **ou** sur une **approximation** :
« Dupont » retrouve les clients contenant Dupont **et, à la suite, les
« Dupond »**. Un **calcul d'approximation** attribue un score ; seules les
lignes **au-dessus d'un seuil** apparaissent, **triées par score
décroissant** (les correspondances exactes d'abord — pendant une recherche
approximative, le score prime le tri déclaré de la liste). *(Interprétations :
l'algorithme de similarité est un choix d'implémentation du moteur — le
contrat est « score + seuil » ; le seuil a un défaut global au modèle,
surchargeable par recherche.)*

**Le wizard : la spécification du menu-parcours (D230–D233 — clôt Q54).**
Le terme est acté : le menu-parcours (D194) est un **wizard**.

- **Wizard ≠ circuit (D230).** Le wizard est **mono-utilisateur, une
  session** : une saisie guidée, écran par écran. Le **circuit de validation
  multi-acteurs** (le devis qui passe du commercial au responsable) n'est
  **pas** un concept nouveau : c'est un **patron d'assemblage** des briques
  existantes — machine à états déclarée (D147), opérations d'entité (D148 :
  « soumettre », « valider », « refuser »), notifications (D108–D110),
  listes filtrées (« mes devis à valider »). Le circuit vit **dans la
  donnée**, pas dans l'IHM — **pas de moteur BPM caché**. Chaque
  intervention d'un acteur peut elle-même être un petit wizard.
- **Une étape = une surface existante + un contexte (D231).** Le wizard
  **enchaîne les surfaces déclarées** (formulaires nommés D206, listes,
  widgets) — il n'invente pas d'écran. **Transitions** : suivant /
  précédent / annuler, et des transitions **conditionnelles** par expression
  D90 sur les données saisies (« si client étranger → étape TVA »).
- **L'état intermédiaire est transitoire (D232).** Tant que le wizard n'est
  pas terminé, **rien n'est écrit** ; la dernière étape déclenche **la
  transaction d'agrégat(s)** (D101) avec les validations en trois passes
  (D156–D159) ; **abandon = rien**. Les **brouillons reprenables** ne sont
  **pas une machinerie moteur** : le métier déclare un **niveau d'état**
  (héritage-état D145–D147, `brouillon → confirmé`) et tout l'existant suit
  (droits, listes, historique). **Le brouillon est du modèle, pas de la
  machinerie.**
- **La sortie et les droits (D233).** Une **étape récapitulative** précède
  l'écriture — elle porte naturellement les **confirmations tracées**
  (D157) ; une **opération** (D148) peut suivre la fin (générer le PDF,
  envoyer le mail). **Droits** : l'entrée de menu-parcours est filtrée
  comme les autres (D193), les écritures passent sous les droits d'action
  (D196) — **un wizard n'élargit jamais les droits** (même principe que le
  module fonctionnel, D190).

**L'import d'exploitation (D234–D238 — clôt Q55).**

- **La source : des CSV déposés dans l'écran (D234).** Uniquement des
  fichiers **CSV**, déposés dans l'écran du module (D211) — ni Excel, ni hot
  folder pour l'exploitation. **Un agrégat = un fichier par entité** (une
  commande + ses lignes = 2 fichiers). **Deux temps : le dry-run, puis
  l'import** — et **l'import n'est possible que si toutes les valeurs sont
  acceptées** (tout-ou-rien à l'échelle du dépôt). Sinon, un **rapport
  précise exactement la ou les données en erreur et les lignes concernées**
  (cellule par cellule, D120) — correction à la source, nouveau dépôt.
  *(Le stock de rejets à statuts D181–D183 reste propre à la reprise :
  ici, le rapport seul suffit — l'import est bloquant tant que le fichier
  n'est pas propre.)*
- **Deux modes : remplacement ou complément (D235).** Le **remplacement**
  classe les données de l'import en **nouvelles (création), modifiées
  (modification), non modifiées (inchangé) et supprimées** (présentes en
  base, absentes du fichier) ; la première étape **vérifie et compte chaque
  catégorie**, et une **confirmation est demandée avant de lancer
  l'import**. Le **complément** ne fait **pas de suppression**.
  **Confirmé par l'auteur** : le rapprochement s'opère sur la **clé
  fonctionnelle** (D142) — l'UUID est un identifiant **interne, non connu
  et jamais exposé aux utilisateurs**, le CSV ne le transporte pas ; la
  « suppression » du remplacement est **la désactivation** (inactivation
  D137), par la voie standard — **aucune suppression physique**, celle-ci
  restant liée au seul connecteur de reprise (D184).
- **Le mapping par l'entête (D236).** L'entête de colonne CSV = **un libellé
  du champ dans la langue de l'opérateur** (D124/D127) — pas de table de
  mapping à déclarer. **L'import concerne tous les champs** (sauf les champs
  à valeurs optionnelles). *(Interprétation : les champs calculés, fichiers
  et communications sont hors périmètre CSV par nature.)*
- **La réversibilité : l'export miroir (D237).** Le pendant de l'import :
  **un export capable de produire le fichier ré-importable**, assuré
  **depuis le même module** d'import d'exploitation. Le cycle **export →
  modification au tableur → import en remplacement** devient le mode
  d'édition de masse de Syncytium.
- **La provenance : l'opérateur (D238).** La provenance d'un import
  d'exploitation est **l'opérateur qui le réalise** (audit D62) — pas un
  connecteur. L'écran reste réservé au **responsable métier ou à
  l'administrateur** (D211).

**Les graphiques des widgets de synthèse (D239–D242 — Q53 en cours).**

- **Le catalogue du socle (D239)** : **courbe, barres, secteurs (camembert/
  anneau), jauge, combiné**. Le **combiné** mixe courbe + barres ou deux
  courbes sur **deux axes Y** partageant la même temporalité ou le même
  échantillon — **borné à 2 axes** (« au-delà, cela peut vite devenir
  illisible ») ; au-delà : **un composant par hook** (registre D68). Le
  moteur livre un socle lisible, le registre étend.
- **La déclaration d'un graphique (D240)** : elle **porte sur une entité** ;
  les axes et les valeurs **se déclinent par type de graphique**.
  - **L'axe X** (courbes, barres, anneaux, combinés) **se définit sur un
    champ** ; le **découpage** : par **valeur distincte** (liste énumérée ou
    valeurs d'une référence), par **regroupement en plages déclarées** pour
    les numériques, par **temporalité** (échelle à définir : heure, jour,
    semaine, mois, année).
  - **L'axe Y** : **1 ou 2 axes selon le type** ; un axe Y est **une
    fonction portant sur un champ, filtrée sur la valeur de X** (la somme
    des CA d'un commercial) — l'agrégat filtré (D158) partitionné par X ;
    le filtre métier vit dans la formule elle-même
    (`somme(montant si etat = "facturée")`).
- **La jauge (D241)** : une **valeur de référence** et une **valeur
  calculée**, chacune étant **une formule ou une valeur absolue**. Exemples :
  un taux de progression de 0 à 100 (fixe) avec la moyenne des progressions
  des enregistrements d'une tâche ; ou une référence = le CA ciblé par la
  direction et la valeur courante = la somme des CA des collaborateurs —
  **la jauge peut alors dépasser les 100 %**.
- **Le drill-down déclaré (D242)** : **par défaut, pas de drill-down**. Sur
  déclaration, on précise une **liste nommée** ; à l'affichage, le graphique
  **enrichit le filtre de la liste pour imposer** les éléments respectant la
  valeur cliquée (la mécanique du filtre imposé, comme le champ 1-N D216).
- **Le graphique est une déclaration autonome et réutilisable (D243)** : un
  graphique **se déclare une fois** (nommé + description — patron D206) et
  est **potentiellement exploitable dans plusieurs widgets de synthèse et
  dans plusieurs formulaires** (blocs D199 — où le filtre imposé le
  contextualise sur l'enregistrement courant).
- **Les tableaux de valeurs : bornés et à tri imposé (D244)** : un tableau
  de valeurs = une **liste nommée**, un **tri imposé** (non sélectionnable
  par l'utilisateur) et un **nombre de valeurs limité** — les listes à
  rallonge n'ont pas leur place dans un widget de synthèse.
- **Pas de comparaison dans le socle (D245)** : pour comparer deux
  périodes, **deux widgets de synthèse côte à côte** sur des temporalités
  différentes — **aucune définition complémentaire**. Les comparaisons
  complexes (traitements lourds) relèvent du **hook**, si le besoin se fait
  sentir.
- **Le tableau croisé dynamique (D246)** : « un outil d'analyse puissant et
  pourtant simple à mettre en œuvre ». Il concerne **une entité** et décrit
  **quatre éléments** : un **filtre**, le ou les **champs en ligne**, le ou
  les **champs en colonne**, et une **formule décrivant l'intersection**.
  **Plusieurs champs → des groupements hiérarchiques, pliables au besoin**
  (la répartition par mois des CA par commerciaux et par client : lignes =
  commercial › client, colonnes = mois, intersection = somme des CA).
  **Confirmé par l'auteur** : sur les champs **numériques ou dates**, des
  **plages ou des temporalités peuvent être définies — comme pour les
  graphiques (D240) — pour réduire le volume de colonnes ou de lignes** ;
  la formule = un agrégat (D158) partitionné par la cellule. **Indépendant
  des compositions matricielles (D134)** — le croisé est une présentation,
  applicable à toute entité.
- **Rattachement et confidentialité du widget de synthèse (D247)** : un
  widget de synthèse est **associé à une entité** — et **par construction à
  un module fonctionnel**. Son **niveau de confidentialité reprend celui de
  l'entité**, **potentiellement surchargeable**. Le pool de la page
  d'accueil (D204) en découle : l'utilisateur compose parmi les widgets de
  ses modules fonctionnels, sous sa confidentialité.
- **L'évaluation : les règles des champs calculés (D248)** : le widget
  s'évalue **selon les mêmes règles que les champs calculés** en matière de
  visibilité — le calcul porte sur le périmètre de l'entité, l'accès au
  résultat est gouverné par la confidentialité du widget (D247). **Le
  drill-down, lui, ne s'applique qu'aux valeurs visibles pour
  l'utilisateur** (D70–D77). L'écart est possible — une valeur affichée
  peut couvrir des lignes que le drill-down ne montrera pas : **fuite ou
  valeur déductible, assumée sous la responsabilité du technicien** (qui
  règle la confidentialité en conséquence). **Une petite alerte informe
  l'utilisateur** que les valeurs listées **ne couvrent pas la totalité du
  périmètre du calcul** — pour qu'il ne s'alarme pas si une somme ne
  correspond pas à la somme des valeurs qu'il voit.
- **Le tableau de bord et les trois modes de rafraîchissement (D249)** :
  une page d'accueil garnie de widgets de synthèse **constitue un tableau
  de bord**. Un widget de synthèse dispose de **trois modes** :
  - **statique** — calcul à l'affichage, valeurs **non remises en cause
    jusqu'au rafraîchissement par l'utilisateur** ;
  - **temps réel** — mise à jour **à chaque notification de mise à jour de
    l'entité ou d'un enfant de l'entité** (les événements de données D54, à
    l'échelle de l'agrégat) ;
  - **fréquence** — une **fréquence déterminée**, avec rafraîchissement
    selon cette fréquence.
  **Le mode par défaut est statique** (confirmé par l'auteur) — le moins
  coûteux ; D36 reste le point d'extension si un calcul devenait lourd.

**Q56–Q57 : la matrice d'un composant graphique — sept types × six modes
(D250, précisé le 06/07/2026).** Les deux questions sont **intimement
liées** : un composant graphique **se décline en sept types** —

1. **en lecture seule** (la consultation — l'écran unique D185, mode
   lecture) ;
2. **en modification** (la saisie) ;
3. **en composant de widget de résumé** (le rendu compact — l'interdiction
   D208 se lit désormais dans le composant : **un type absent = un composant
   interdit** dans cette surface) ;
4. **en composant d'une cellule dans une liste, en lecture** (le rendu
   tabulaire) ;
5. **en composant d'une cellule dans une liste, en modification**
   (l'édition en ligne D205 — la déclinaison confirme l'interprétation) ;
6. **en composant PDF** (le rendu imprimé — les gabarits PDF de Q57
   **composent les types PDF des composants**, comme un formulaire compose
   leurs types écran) ;
7. **en composant Excel** (le rendu d'export — les exports D196/D213/D237
   produisent des **cellules typées**, dates et nombres natifs, pas des
   chaînes : l'export miroir D237 y gagne sa ré-importabilité).

**Chaque type est décliné en trois modes × deux orientations** — le jeu
responsive (D203) : les **modes** sont **écran, tablette, smartphone** ;
les **orientations** sont **portrait et paysage** — **par construction**
(D200). **Par défaut, tout est prévu pour un écran paysage.** Toute la
matrice (7 types × 3 modes × 2 orientations) appartient au composant,
jamais à la description.

**La structure du gabarit PDF (D251 — Q57).** Le gabarit PDF **exploite le
gabarit d'un formulaire en lecture seule** (les blocs D199, composés des
types PDF des composants D250) **avec quelques ajustements** — que l'on
**pourrait retrouver sur un formulaire** : l'ajout d'un **paragraphe de
texte**, d'un **titre** et de **sous-titres jusqu'à 4 niveaux**. **Un
document s'appuie sur : un entête (optionnel) + un pied de page (optionnel)
+ un bloc représentant la page.** L'entête et le pied de page sont des
**gabarits nommés exploitant le même formalisme qu'un document**. Le format
du document **décrit la dimension de la page** (A4, étiquette…). La liaison
aux données est **celle du formulaire** (l'agrégat courant) ; les gabarits
restent déclinés **par langue** (D219).

**L'impression depuis le serveur (D252).** Un document PDF peut être
**imprimé directement depuis le serveur** — le cas d'une **étiquette avec
un QR code ou un code-barres**. **Les imprimantes disponibles sont celles
présentes au regard du système d'exploitation** (du serveur) — pas de
connecteur ni de déclaration dédiée. *(Corollaires : le QR code et le
code-barres sont des composants du catalogue Q56 ; l'impression est une
tâche D53.)*

**Le formulaire hérite en retour (D253, complète D199/D251).** Un formulaire
**peut également porter un entête et un pied de page** — avec des **zones de
texte**. Les enrichissements du gabarit PDF (paragraphes, titres,
sous-titres — D251) et l'entête/pied valent donc **pour les deux surfaces** :
formulaire et gabarit PDF partagent **un seul et même formalisme** — le
gabarit PDF étant exactement *un formulaire en lecture seule + une dimension
de page*.

**Les variables de contexte : l'entité « contexte » (D254 — clôt Q57).**
Des variables sont **disponibles selon le contexte** : le **nom du
fichier**, la **date et l'heure du moment**, le **numéro de page**, le
**nombre de pages**, l'**opérateur**, le **nom de l'instance**, le **nom du
module**… Elles sont **exploitables de la même façon qu'un champ d'une
entité** — une **entité « contexte »** (nom illustratif — à fixer au
méta-schéma Q16), fournie par le moteur, en **lecture seule**, consommée
par les expressions et gabarits (D90) comme n'importe quel champ. **La
disponibilité des champs dépend du contexte** : la pagination n'existe
qu'au rendu d'un document, l'opérateur en session — aucun mécanisme
spécial, le patron « mécanisme uniforme » une fois encore.

*Annoncé par l'auteur* : **le catalogue des composants par type de champ
reste à décrire** → **Q56**.

**Les sept points de clarification — tous tranchés au 06/07/2026** (trace du
cheminement) :

1. ~~La chaîne menu → liste → formulaire~~ — **confirmée (D193)** : l'entrée
   par défaut référence **la liste de l'entité** ; l'entrée « **formulaire de
   création** » existe. **Micro-point tranché (D216)** : le champ 1-N désigne
   une **liste nommée**, colonne de lien masquée.
2. ~~Les enfants de composition au menu~~ — **tranché (D191–D193)** : menu
   par défaut = parents d'agrégats, **sous-menus par défaut = entités
   enfants et associées en lien multiple** (D193 amende D192 : le 3ᵉ niveau
   est présent par défaut) ; la modification directe d'un enfant s'applique
   **via l'agrégat racine** (D101/D111/D132, cohérent D150).
3. ~~La liste paramétrable~~ — **tranché (D198)** : sélection des colonnes
   et de leur ordre enregistrée **au profil de l'utilisateur**, ou **publiée
   à un groupe** depuis l'interface d'administration (administrateur ou
   responsable métier).
4. ~~Le widget de résumé~~ — **tranché (D201)** : champs **sélectionnés**
   (lecture seule et/ou modification), sections sans onglets, petit par
   principe ; **n'existe pas par défaut**. **Corollaire tranché (D215)** :
   la référence 1-1 affiche un **libellé ou un élément de synthèse** + lien
   vers le formulaire cible en lecture seule ; sélection via **liste
   nommée** du formulaire.
5. ~~Import et impression PDF~~ — **tranché (D211–D213)** : l'**import**
   quitte les listes pour un **écran dédié de module** (responsable
   métier/administrateur — détail en **Q55**) ; l'**impression PDF est
   confirmée** (défaut = la liste telle qu'affichée ; déclarable — colonnes,
   mode ; **gabarits** pour documents, impression depuis un formulaire ;
   **le PDF est un composant**, plusieurs par liste) ; l'**export CSV** =
   colonnes affichées par défaut, déclarables avec longueur.
6. ~~Le jeu des modes responsive~~ — **tranché (D203)** : **{Écran,
   Tablette, Smartphone} × {portrait, paysage}**.
7. ~~Les actions de masse~~ — **tranché (D196–D197)** : modification en
   masse séquentielle interruptible, suppression en masse à double
   validation, confirmation de suppression = formulaire en lecture seule.
   **La popup est abandonnée (D214)** : blocs = section ou onglet.

**Chantiers ouverts issus du raffinement** : **Q54** (l'expérience
utilisateur / menu-parcours, D194) ; les **types de graphiques** des widgets
de synthèse (Q53) ; **Q55** (l'import d'exploitation, D211) ; **Q56** (le
catalogue des composants graphiques par type de champ).

**Apport au méta-schéma** : modules fonctionnels (menu, affectations) ;
surfaces nommées + descriptions (listes — colonnes/dimensions/tris/filtres
transverses/formulaire cible/exports/impressions ; formulaires — blocs
section-onglet composables, paramètres ; widgets de résumé et de synthèse) ;
menus (5 types d'entrées) ; affichages de champ par surface × mode
responsive ; droits d'action par entité (modèle de confidentialité) ;
gabarits PDF (Q57).

### 8.7 Internationalisation (Q45 ; D217–D219)

**UTC, fuseaux et formats (D217).**

- **Stockage des dates et heures en UTC** — pour ne pas être perturbé par
  les fuseaux horaires.
- **Le fuseau horaire dépend de la langue de l'utilisateur** *(interprétation
  à valider : le modèle déclare le fuseau de chaque langue permise — ex. FR →
  Europe/Paris)*.
- Pour la date et l'heure, **pas de spécificité par langue au-delà du format
  d'affichage**. **Le format est porté par la langue** ; une langue peut
  offrir **plusieurs formats** (ex. AAAA-MM-JJ ou JJ/MM/AAAA) ; le **format
  par défaut est défini au global dans le modèle, par langue**, et
  **surchargeable sur un champ, par langue** (précise D131).
- **Le modèle liste les langues permises.** Périmètre assumé : **1 langue**
  (la grande majorité), **2** (une à deux entreprises), **3 au maximum**
  (un cas très particulier) — une TPE française n'a aucun intérêt à traiter
  l'anglais ; une société travaillant avec l'Angleterre déclare FR + EN ;
  un marché européen élargit la liste.

**Notifications et journaux (D218).** Comme pour les libellés (D127), une
notification est un **message à format, personnalisé par langue** : une
notification émise est **disponible dans la langue de l'opérateur**
(destinataire). Les **journaux internes** restent **en anglais**.

**Gabarits et chaîne de repli (D219).** Les **gabarits de PDF et de mails**
suivent la **même approche : un par langue** possible. **Repli à deux
crans** : si une langue est déclarée et qu'un **libellé, un message ou un
gabarit n'a pas son pendant**, la **langue par défaut** est utilisée —
définie **au global par le modèle** (la langue de l'utilisateur restant le
choix de son profil, D124) ; en **l'absence totale de libellé**, c'est **le
nom (invariant) du champ, du message ou du gabarit** qui est utilisé.

**Les types temporels : brut ou horodatage (D220).** La **date** et
l'**heure** sont des valeurs **« brutes »** — jamais converties : une
échéance au 1ᵉʳ juillet **reste le 1ᵉʳ juillet**, quel que soit le fuseau.
La **date+heure** se décline en **deux natures, déclarées** : **« brute »**
(valeur civile — un rendez-vous à 14 h) ou **« horodatage »** (un instant —
stocké **UTC**, affiché selon la langue de l'utilisateur, D217).

**Le fuseau : une langue = un fuseau, assumé (D221).** La liaison
langue → fuseau est **assumée** (« ce n'est pas une demande très forte » à
l'échelle TPE) ; une **surcharge au profil de l'utilisateur** reste
possible, **bornée par une liste de fuseaux déclarée par l'application**.

**La collation : le tri sur chaîne normalisée (D222).** Le tri des textes
s'applique sur une **normalisation de la chaîne** (suppression des
caractères accentués et des caractères spéciaux) — **identique pour tous
les utilisateurs, sans surcharge au profil** (aucun intérêt). La pagination
reste cohérente entre utilisateurs.

**Les formats CSV : au modèle (D223).** Les formats CSV (séparateurs,
encodage) sont **définis au niveau du modèle** — ni à l'utilisateur, ni à
la langue : **imposés par l'application**.

**La couverture des traductions (D224).** Les libellés, messages et
gabarits **sans pendant** dans une langue déclarée sont **signalés au
technicien** et **consultables dans l'interface d'administration**
(« ignorer, jamais oublier », patron D176).

**La sérialisation temporelle dans les API (D225).** Les valeurs
temporelles transitent **en chaînes de caractères** : l'**horodatage en
UTC** ; la date, l'heure et la date+heure **brutes**, telles quelles.
Recommandation intégrée : le format de sérialisation est **canonique et
invariant — ISO 8601** (date `AAAA-MM-JJ`, heure `HH:MM:SS`, date+heure
brute `AAAA-MM-JJTHH:MM:SS` **sans décalage**, horodatage **suffixé `Z`**) —
**jamais le format d'affichage d'une langue**. La présence du marqueur `Z`
distingue d'elle-même l'horodatage du brut, et le tri lexicographique des
chaînes coïncide avec le tri chronologique.

### 8.8 Le catalogue des composants graphiques (Q56 ; D255–…)

**« Cette partie est une partie essentielle et consolide tous les points
abordés jusqu'à présent »** — elle doit rendre la construction d'une
application **simple, rapide et à l'UI/UX agréable**. Méthode annoncée par
l'auteur : **la description reprend type par type**, et décrit **le
comportement du composant en fonction des modes d'affichage et de
l'orientation** (matrice D250 : 7 types de rendu × 3 modes × 2
orientations) — de nombreuses combinaisons **à parcourir dans leur
intégralité**.

**Conventions transverses arbitrées (D255–D257) :**

- **Champs calculés à l'écran (D255)** : **recalculés dès qu'un des champs
  concernés est modifié** (les dépendances — règles transportées D159).
- **Boutons radio (D256)** : possibles **uniquement sur une liste énumérée
  de faible cardinalité** — seuil à fixer (**jusqu'à 5 valeurs ?** l'auteur
  n'est pas encore fixé).
- **Rendu PDF des contenus riches (D257)** : **devient une image** ;
  **chaque type aura son pendant PDF**, décrit au fil du catalogue.

**Les paramètres communs d'un composant (D258).** Tout composant, quel que
soit le type, porte les propriétés suivantes :

- **libellé** (variante selon la surface — D124) ;
- **commentaire** — pour une **infobulle** ;
- **description** — pour le **masque des écrans** (D209) ou l'**aide
  détaillée** ;
- **valeur de démonstration** — le *placeholder* (D128) ;
- **états possibles** : **lecture, écriture, écriture unique** (D153) ;
- **validation** (l'affichage des règles transportées, D156–D159) ;
- **filtre** (propre au type, D228).

**Pour chaque type, d'autres propriétés pourraient être nécessaires** —
déclarées par le composant, décrites au fil du catalogue. *(Alignement
terminologique : la « description courte » de D124 prend le nom de
**commentaire**, la « description longue » celui de **description** — à
répercuter au méta-schéma, Q16.)*

*Convention rédactionnelle* (validée par l'usage dès le premier type) : pour
chaque type, décrire **en entier le comportement « écran paysage »** (le
défaut, D250), puis **seulement les écarts** pour les autres modes et
orientations — sans écart déclaré, le comportement se dégrade gracieusement
depuis l'écran paysage.

#### Le composant « texte » (D259–D262)

**Cadrage (D259).** **Pas de zone de texte enrichie** — Syncytium ne la
propose pas. Le **mono ou multi-ligne ne se déclare pas** : il **dérive de
la taille maximale du champ**, comparée à un **seuil défini comme paramètre
général de l'instance** — **par défaut : 100 caractères** (au-delà : zone de
texte ajustable). **N = le nombre de lignes affichées par défaut** (avant
« voir plus »). *(Nouveau concept transverse : les **paramètres généraux de
l'instance** — réglages d'instance à défauts moteur ; à intégrer au
méta-schéma, Q16.)*

**Le masque de saisie (D260).** Le champ texte de l'entité porte une
**propriété de masque** :

- `__ ____ ____` — saisir 10 caractères en 3 groupes (2+4+4) ;
- `99 99 99 99 99` — saisir 10 chiffres en 5 groupes de 2 ;
- `____-___` — 7 caractères, « - » imposé entre les 2 groupes ;
- `FR__ ____ [A-E][5-8A-E]__` — « FR » imposé en tête ; `[A-E]` = un
  caractère entre A et E ; `[5-8A-E]` = un chiffre entre 5 et 8 **ou** un
  caractère entre A et E.

Alphabet du masque : `_` = caractère libre, `9` = chiffre, **littéraux
imposés** (espaces, tirets, préfixes), `[…]` = classes et plages.

**Les rendus (D261).**

- **Lecture seule** : mono-ligne = le texte tel quel, non modifiable ;
  multi-ligne = les **N premières lignes**, le reste **replié** — « **voir
  plus** » l'affiche, et ce libellé est **traductible** ; la zone
  multi-ligne est **redimensionnable verticalement**.
- **Modification** : **compteur de caractères** affiché si la taille du
  champ est « grande » (**au-delà d'un seuil, paramètre général de
  l'instance**) ; **l'utilisateur ne peut pas saisir plus de caractères que
  la taille du champ** ; zone redimensionnable verticalement ; placeholder
  = la valeur de démonstration.
- **Widget de résumé** : **le libellé se décline au format widget** — le
  rendu est **« libellé pour widget » + espace + valeur du champ**, en
  **ellipse** pour limiter l'espace ; comme les variantes formulaire et
  colonne, **la variante widget d'un libellé peut être vide** (D124
  étendu — un libellé est un code décliné par surface).
- **Cellule de liste (lecture et modification), PDF, Excel** — validés
  tels que proposés : tronquée avec ellipse + valeur complète en
  infobulle / saisie en ligne (échappement = annuler) / **texte complet,
  jamais tronqué** / cellule **texte native**.

**Les écarts par mode — transverses à tous les composants (D262).**

- **Tablette** : pas d'écart de comportement, mais **le survol n'existe
  pas** — pas de description au survol ; **l'infobulle s'ouvre par un petit
  logo à côté du libellé**.
- **Smartphone** : encore moins d'espace — **ni infobulle, ni
  description** ; **le libellé s'affiche en plus petit** pour économiser la
  place.
- **Portrait / paysage : aucun écart.**

**Compléments du 07/07/2026 (D263–D265).**

- **La zone de texte enrichie : une évolution potentielle (D263).** Elle
  pourra être proposée **ultérieurement**, comme composant graphique d'un
  **type de champ complexe** (par exemple un type « document ») — hors du
  socle actuel. **Le hook de composant graphique (D64–D68) devra permettre
  de développer ce type de composant** — exigence posée sur l'extensibilité.
- **Le masque pilote les lignes (D264).** Dans le cadre d'un masque de
  saisie (D260), **le nombre de lignes dépend du nombre de lignes du
  masque** — un masque peut être multi-lignes, et sa structure prime la
  dérivation taille/seuil (D259).
- **L'anatomie d'une zone de saisie (D265).** Sur un écran d'ordinateur,
  trois parties : **libellé + zone de saisie + post-zone** — la post-zone
  accueille **une devise, un %, une abréviation… ou rien**. Sur **tablette
  et smartphone**, **le libellé ou l'abréviation sont configurables** ;
  **par défaut, les libellés sont ceux du mode d'affichage de base** (écran
  paysage, D250). *(Anatomie transverse : la post-zone servira les composés
  — montant, pourcentage, mesure.)*

#### Le composant « nombre » (D267–D268)

**Un nombre = une zone de texte à particularités (D267).** Le composant
nombre **reprend le cadre du texte** (anatomie D265, masque D260) :

- **le masque de saisie se déduit des propriétés du champ et de la langue
  de l'utilisateur** — chiffres avant/après la virgule (D118), bornes,
  séparateurs de la langue (D131) : **rien à déclarer** ;
- **le post-libellé** (la post-zone D265) affiche **une unité, une
  devise…** — et, **selon la langue, il se place avant ou après** la zone
  de saisie (« $ 100 » / « 100 € », formats D131).

**La saisie tactile (D268).** Sur un dispositif tactile, **le clavier
numérique est exploité** (plutôt que l'alphabétique) — voie actée, avec la
réserve de l'auteur : « parfois, ça gâche un peu l'expérience
utilisateur ». Une zone de texte numérique **peut afficher une
calculatrice** (calculs élémentaires) **ou un clavier stylisé** — la
calculatrice servant aussi **de méthode de saisie sur un dispositif
tactile**.

**Les variantes du nombre (D269).** En saisie comme en affichage, une zone
numérique peut être présentée comme une **jauge** (différents styles
possibles) ; dans certains cas, elle peut faire apparaître **deux boutons
[-] / [+]** pour **incrémenter ou décrémenter une valeur entière**
(stepper).

**La jauge et le curseur : la borne est la clé (D276, généralise
D269/D273).** **Tout champ numérique entier borné peut être une jauge** —
exemple : la saisie d'un montant **entre 0 et 10 000 €**. Et **un curseur**
permet une **saisie simple et sans clavier** (précieux sur tactile, D268).
La condition est la même que pour le pourcentage (D273) : **pas de jauge ni
de curseur sans bornes**.

#### Les composants temporels (D277–D280)

**L'heure (D277).** **La précision est portée par la propriété du champ** :
**hh, hh:mm, hh:mm:ss ou hh:mm:ss.sss**. Le champ peut disposer d'une
**horloge** pour **saisir ou afficher** l'heure.

**La date (D278).** Des **raccourcis** — aujourd'hui, la veille, hier,
début de mois, fin de mois… — disponibles **sur un clavier** (du même type
que le clavier numérique stylisé, D268) ; un **calendrier année / mois /
semaine**, avec **un numéro de semaine lié à la langue** (les conventions
de numérotation varient selon les pays).

**La date + heure (D279).** Ses raccourcis (**maintenant**, aujourd'hui…) ;
l'affichage **combine calendrier + horloge**.

**Les compositions temporelles : des évolutions (D280, patron D263).**
Comme pour le texte enrichi : la gestion d'un **calendrier** (agenda), d'un
**emploi du temps**, d'un **diagramme de Gantt** ou d'autres compositions
autour des dates et heures — **évolutions potentielles**, développables via
le **hook de composant** (l'exigence D263 les couvre).

**Socle des temporels — validé (D281)** : masque de saisie **déduit du
format de la langue** (comme le nombre, D267) ; **Excel = valeurs
temporelles natives** ; la **brute** affichée telle quelle et
l'**horodatage** converti dans le **fuseau de la langue** (D217/D220–D221)
— y compris à l'export ; filtre = **plage/comparateur** (D228).

#### Les composants de choix (D282–D285)

**Le booléen (D282).** **Case à cocher** — **à trois états si le champ peut
être nul** ; **toggle** éventuellement, **sans valeur nulle**. Filtre :
**oui / non / tous**. **Les libellés « VRAI / FAUX / NUL » sont
surchargeables** et **s'affichent en valeur au survol** de la zone (Actif /
Inactif, Inscrit / Non inscrit…). **Un booléen peut se décliner en liste
énumérée.** **Export CSV/Excel : le libellé ou la valeur** (déclaré —
patron D130).

**L'énuméré (D283).** **La liste déroulante représente bien la
fonctionnalité** (mono-sélection D129, tri par la valeur numérique,
libellés traduits). **Un énuméré peut également représenter un jeu
d'icônes ou d'images.** Le reste du socle vaut par les acquis : cellule en
modification = liste de valeurs (D205), filtre = jeu de valeurs (D228),
export = code ou libellé déclaré (D130).

**La référence (D284).** La description actée est validée : libellé ou
élément de synthèse + lien vers la fiche en lecture seule + sélection via
la liste nommée (D215), recherche incrémentale (D228, approximation D229),
widget de résumé au survol s'il est déclaré (D201), **Excel = la clé
fonctionnelle** (ré-importabilité D235–D237). **Ajout : la sélection par
image** — **une entité peut porter un champ « image »** ; s'il est défini,
**la sélection via une image + un libellé court est privilégiée dans un
formulaire dédié** (le choix d'un plat dans un menu, la photo d'un
utilisateur…).

**Les boutons radio : une surcharge au formulaire (D285, amende D256).**
Le passage d'un énuméré en boutons radio est **une surcharge graphique sur
le champ dans un formulaire** (la chaîne D270) — **le seuil automatique de
cardinalité est abandonné** : la pertinence (faible cardinalité) relève du
choix du déclarant.

**Deux types de base ajoutés : vignette et image (D286, étend D121).**
**« Vignette »** = une image de **petite taille** ; **« image »** = la
**grande taille + sa déclinaison en vignette**. Ils portent le champ
« image » d'une entité (D284 — sélection de référence par image) et
s'appuient sur le patron fichier (D160 : binaires hors base, quotas,
statuts ; déduplication D165). **Confirmé : dans le cas d'une image, la
vignette est calculée automatiquement** (par le moteur).

#### Les comportements par mode — arbitrages transverses (D287–D290)

**La calculatrice remplace le clavier natif (D287, précise D268).** Sur
**smartphone comme sur tablette**, la calculatrice **remplace** le clavier
natif — **inutile d'avoir deux dispositifs de saisie des nombres**.

**Les temporels par mode (D288).**

- **Smartphone** : le calendrier **peut prendre l'écran complet** ; il doit
  pouvoir afficher **la semaine, le mois**, ou mettre à disposition **un
  agenda sur plusieurs semaines/mois**, **en gardant le contrôle sur la
  lisibilité**, accessible **via le tactile uniquement**.
- **Tablette** : l'écran est plus grand — le calendrier s'affiche **à
  proximité du champ** à la saisie d'une nouvelle date.
- **PC** : la date peut être **saisie au clavier**, le calendrier s'affiche
  **sur demande, par une icône**.

**Les choix par mode (D289).**

- **Smartphone** : le choix (sans image) = **liste déroulante** (saisie
  **unique ou multiple**) ; **le choix par image prend l'écran et
  s'empile** ; **les radios s'empilent** également.
- **Tablette** : déroulante identique ; le choix par image dans une **zone
  plus restreinte, proche du champ**, avec **limitation de l'usage du
  clavier**.
- **PC** : **raccourcis clavier** pour sélectionner, et **parcours de la
  liste par saisie d'une valeur** (début de mots, **avec throttling** —
  D228).

**La géolocalisation : la position courante du terminal (D291).** La carte
doit pouvoir **afficher la position courante du terminal** — repère de
contexte en lecture, et aide à la saisie (« ma position » comme point de
départ). *(Note : sous réserve de l'autorisation de géolocalisation
accordée par l'utilisateur au navigateur/terminal.)*

#### La famille des contenus (D292–D296)

**Le fichier (D292).** Dépôt par **glisser-déposer** sur PC ; **sur
smartphone, l'appareil photo et la galerie servent à sélectionner une photo
ou un fichier**. **Les types de fichiers autorisés sont portés par le
champ.** Quota contrôlé à la volée (D162). Lecture = icône selon le type +
nom + taille, **téléchargement au clic**, statut visible quand dégradé
(D163) ; cellule = icône + nom tronqué ; widget = icône + nom ; **PDF et
Excel = le nom du fichier** ; filtre = « contient » sur le nom et les
mots-clés (D160) ; pièces jointes multiples = le bloc dédié (D199).

**L'image (D293).** Dépôt comme un fichier avec **aperçu immédiat**
(appareil photo sur mobile) ; lecture = **la vignette** (D286), **clic →
visionneuse** : **plein écran sur smartphone, en pourcentage de l'écran sur
tablette, en zone définie sur PC**. Cellule et widget = la vignette ; PDF =
l'image dimensionnée au bloc (D257) ; Excel = le nom du fichier. **Pas de
recadrage dans le socle** (évolution par hook, patron D263).

**La géolocalisation (D294).** Saisie = **pointer sur la carte** (bloc
dédié D199) ou **lat/long au clavier** ; position courante du terminal
(D291). Lecture = mini-carte centrée + marqueur ; cellule = lat/long en
texte court, clic → carte ; PDF = **une image de la carte** (D257) ; Excel
= `lat,long` canonique (ré-importable) ; non triable (D125), pas de filtre
dans le socle (la proximité = hook). **Le fond de carte est déclarable à
l'instance** (paramètre général, D259). **Le géocodage = un connecteur
(D78), avec un connecteur par défaut dans le socle, open source** —
candidats identifiés : **l'API Adresse / Base Adresse Nationale**
(adresse.data.gouv.fr — service public français, données ouvertes, moteur
**Addok** open source auto-hébergeable ; le candidat naturel du périmètre
TPE français) et **Nominatim** (le géocodeur open source d'OpenStreetMap,
auto-hébergeable ; API publique à politique stricte : ~1 req/s,
attribution, pas d'autocomplétion). Choix et politiques d'usage à
re-vérifier à la pile technique (Q7).

**La communication (D295).** L'onglet acté (D167/D186) : fil chronologique
(auteur, horodatage, contenu), **saisie du nouveau message en bas**,
messages **immuables**, pièces jointes si activées, notifications opt-in
(D108–D110) ; sur smartphone, **le fil en plein écran**. ~~Pas d'affichage
dans une cellule de liste.~~ **Amendé par D393** : en liste, **une petite
icône (thumbnail)** — au survol, **le ou les derniers échanges résumés**
(taille paramétrable en nombre de lignes). PDF = le fil complet si le
bloc est inclus au gabarit ; Excel = exclu (D236).

**La liste (D296).** Modification : **multi-sélection** (cases ou tags)
pour les énumérés, **éditeur de liste** sinon (ajouter / retirer /
réordonner quand l'ordre est l'insertion) ; lecture = tags ; cellule = les
premières valeurs + ellipse ; PDF = les valeurs énumérées ; **Excel/CSV :
le séparateur interne est déclaré au modèle (défaut) et éventuellement
surchargeable à la fonctionnalité** (précise D223 — condition de la
ré-importabilité D237) ; filtre = « contient » (D166).

#### La famille des générés (D297–D300 — clôt Q56 et le thème E)

**Le compteur (D297).** **Lecture seule partout** ; en création,
placeholder « *(attribué à la validation)* » (D199/D154 — la continuité
est préservée) ; cellule, PDF et Excel = **la valeur assemblée** (gabarit
D155).

**Le champ calculé (D298).** **Lecture seule partout**, **recalculé à
l'écran dès qu'une dépendance change** (D255) ; son composant est **celui
de son type de résultat** — un calculé de type montant s'affiche comme un
montant.

**La période (D299).** **Deux dates liées** — début ≤ fin **contrôlé en
frappe** ; les raccourcis de date (D278) s'appliquent ; cellule = « du … au
… » ; **Excel = deux colonnes natives**.

**Le QR code et le code-barres (D300).** Composants de **sortie** : ils
**rendent la valeur d'un champ** (texte, référence, compteur…) ; usage
premier = **PDF et étiquettes** (D252), affichables à l'écran en lecture ;
**Excel = la valeur source**.

**Les listes par mode (D290).**

- **Smartphone** : **le tableau est proposé pour les petites listes de
  valeurs** ; dès que le volume devient important, **la liste de widgets
  est recommandée** — widgets **l'un au-dessus de l'autre en portrait**,
  **en 2 colonnes en paysage** *(premier écart d'orientation du catalogue —
  nuance à D262, qui reste vrai pour les paramètres communs : les écarts
  d'orientation restent possibles au niveau des dispositions)*.
- **Tablette / PC** : **tableaux ou listes de widgets**, les widgets
  pouvant s'afficher **sur plusieurs colonnes**.
- **Les filtres** : **PC = systématiquement affichés** ; **smartphone =
  proposés derrière un petit icône significatif** ; **tablette = l'une ou
  l'autre des options**.

**La surcharge du composant au formulaire (D270).** À la déclaration d'un
champ dans un formulaire, **le composant graphique par défaut est pris en
compte** (porté par la **description du modèle** — type → composant,
surcharge au champ D64) ; **le formulaire peut surcharger ce choix** pour
sélectionner le type de GUI. Chaîne de résolution : **type → champ (modèle)
→ formulaire**. Garde : la surcharge choisit parmi les composants
**compatibles avec le type** (le catalogue arbitre) — et n'élargit jamais
les droits ni les états (D258).

**Les rendus du nombre par surface (D271 — validés).** **Aligné à droite**
partout (lecture, cellule de liste, PDF) ; cellule de liste en modification
= la saisie en ligne numérique (D205) ; **Excel = nombre natif** (pas une
chaîne) ; **filtre = comparateur / plage** (D228) ; **widget de résumé** =
le patron du texte (« libellé pour widget » + valeur formatée, en
ellipse) ; PDF = la valeur formatée, post-libellé compris.

**Les composés numériques (D272–D275).**

- **Montant (D272)** : nombre + **post-libellé = la devise** du jeu déclaré
  (D123), placée selon la langue (D267) ; **le nombre de décimales est
  défini sur les propriétés du champ** (2, 3 ou 4 selon la précision
  voulue — D118), **indépendamment de la devise** ; Excel : nombre natif au
  format monétaire ; filtre plage.
- **Pourcentage (D273)** : post-libellé **%**, bornes usuelles 0–100 sauf
  déclaration contraire ; **avec une borne, la jauge (D269) devient un
  choix possible** — pas de jauge sans bornes.
- **Mesure (D274)** : nombre + **post-libellé = l'unité déclarée** (D122) —
  **rien de plus**.
- **Durée (D275)** : se décline **à l'aide d'un masque de saisie** avec une
  **option de conversion** transformant **la valeur canonique en chaîne et
  vice versa** (le patron des facettes D119) ; **Excel fournit la valeur
  canonique**.

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

### 9.5 Mise à jour du 18/07/2026 — l'étude reprise avec le périmètre complet

**Méthode.** L'étude initiale précédait la clôture du modèle de données, du
thème E et du langage ; elle a été **reprise avec le périmètre des 312
décisions** (harnais de recherche : 5 angles priorisés — piliers 1, 2, 3, 6,
10 —, 24 sources collectées, 118 affirmations extraites, 25 soumises aux
panels de vérification adversariale). Bilan : **11 affirmations confirmées à
l'unanimité, 0 réfutée**, 14 non passées en panel (limites de quota) — dont
la clé de voûte, **re-vérifiée directement sur la documentation primaire le
18/07/2026**. Les piliers 4, 5, 7, 8 et 9 n'ont pas fait l'objet d'angles
dédiés (aucun acteur comparable remonté par les recherches croisées — sans
constituer une preuve d'absence).

**Pilier 1 — génération depuis une description unique.** Confirmé (3-0) :
**Frappe Framework** est l'acteur le plus proche — « *The basic building
block of Frappe Framework is a DocType. It is the model+view+controller for
your application* », et « *changing the metadata will change the schema and
the user interface automatically* » (frappe.io/framework/doctype). Le
DocType génère modèle + IHM ; **il ne génère pas d'API à translation
versionnée** — la boucle complète de Syncytium reste sans équivalent.

**Pilier 2 — migrations à chaud déclaratives.** Confirmés (3-0) :
**pgroll** (Apache-2.0, PostgreSQL) — migrations **déclaratives JSON**,
zéro-interruption, expand/contract avec backfill, **rollback à tout moment
pendant la migration** ; son README **ne documente ni dry-run sur données
réelles, ni règles d'éclatement regex / fusion gabarit** du niveau
Syncytium. **Reshape** (MIT, PostgreSQL) — migrations déclaratives
TOML/JSON, et **coexistence de l'ancien et du nouveau schéma pendant la
migration** (vues + triggers traduisant les écritures entre schémas).
**Atlas** — pré-planification déclarative (`schema plan` : générer, relire,
approuver avant `apply`) ; la source suggère (non vérifié en panel) que
cette capacité relève du niveau **Pro payant**.

**Pilier 3 — LE DIFFÉRENCIATEUR, verdict affiné.** Trois faits :
1. **Confirmé (2-0)** : il existe désormais **un précédent open source du
   versionnement d'API « à la Stripe »** — **Cadwyn** (MIT, Python/FastAPI,
   « *Production-ready community-driven modern Stripe-like API versioning
   in FastAPI* ») — ce qui **invalide partiellement** le constat antérieur
   d'« absence totale de précédent ».
2. **Vérifié directement (docs.cadwyn.dev, 18/07/2026)** : les
   « VersionChange » de Cadwyn sont **des classes écrites à la main** par
   les développeurs (instructions de schéma + convertisseurs
   `convert_request`/`convert_response` en Python) — **aucune génération
   automatique depuis un journal de migrations du modèle de données,
   aucun épinglage par compte, aucun statut de cycle de vie** (bêta,
   dépréciée, interdite) dans la documentation.
3. **Confirmé (3-0)** : **Reshape** produit bien une compatibilité
   bidirectionnelle **auto-générée depuis les définitions de migration —
   mais au niveau du schéma SQL** (vues Postgres), **temporaire** (la
   complétion supprime l'ancien schéma) — ni chaîne persistante, ni
   épinglage. Idem **pgroll** (schémas virtuels versionnés par
   `search_path`, le temps de la migration).

**Reformulation actée du pilier 3** : *le patron de translation à la Stripe
a des précédents open source — Cadwyn côté API (écrit à la main), Reshape et
pgroll côté SQL (auto-généré mais temporaire). La combinaison de Syncytium —
la chaîne de translation d'API **auto-générée depuis le journal de
migrations déclaratives du modèle**, **persistante**, avec **cycle de vie
des versions** et **épinglage par compte** — reste sans équivalent
identifié.* Ces trois outils passent du statut de menace à celui
d'**études de conception pour l'implémentation**. Le modèle de référence
vit toujours : **Stripe 2026 confirmé (3-0)** — versions datées + nommées
(courante : `2026-06-24.dahlia`), releases majeures non rétrocompatibles
(Acacia…) et mensuelles rétrocompatibles.

**Pilier 6 — temporalité.** Sources primaires collectées (non passées en
panel) : **XTDB v2** (stable depuis juin 2025, v2.1.0 déc. 2025) rend
toutes les tables **bitemporelles par défaut** avec lecture SQL « à une
date » (`FOR VALID_TIME AS OF`) — précédent direct de l'API temporelle,
**au grain de la ligne** ; l'historisation Syncytium par **instantanés
d'agrégats complets** avec champs calculés sur instantanés (D168–D174)
reste distincte.

**Pilier 10 — licences.** Sources primaires collectées (non passées en
panel) : **Directus v12 (mai 2026) quitte définitivement l'open source**
(BSL 1.1 → « Monospace Sustainable Core License ») ; **Redis est revenu à
l'AGPLv3** — deux signaux qui **renforcent le positionnement AGPL** de
Syncytium (D19) : le terrain « open source véritable » se dégage.

**Verdict Q5 (mis à jour).** **(a)** L'ensemble n'est couvert par aucun
acteur — confirmé sur les piliers sondés. **(b)** Le pilier 3 a un
**précédent partiel qui prouve la faisabilité du patron et laisse
l'auto-génération sans équivalent** — le différenciateur se reformule, il
ne disparaît pas. **(c)** Le socle le moins mauvais pour un adossement
resterait **Frappe** (pilier 1), au sacrifice des piliers 2, 3, 5, 6 et de
la maîtrise du méta-schéma. **Le « construire » sort renforcé et affiné de
la re-vérification.**

**Le détail complet de l'étude** — affirmations verbatim, citations, votes
des panels, affirmations non départagées, sources et limites — est consigné
dans **[etude-comparative-20260718.md](etude-comparative-20260718.md)**.

**Passe complémentaire superficielle (18/07/2026)** — à la demande de
l'auteur, les piliers 4, 5, 7, 8 et 9 ont été sondés par une recherche
rapide, **indicative et non vérifiée** (détail au §7 du document d'étude) :
**aucun acteur d'ensemble n'y apparaît** ; deux nuances honnêtes — le
**round-trip tableur (P8) est un patron établi au niveau fonctionnalité**
(AppSheet : ré-import CSV apparié par clé ; Azure Boards ; Dataverse) que
Syncytium raffine (remplacement/complément, dry-run bloquant, mapping par
libellés) plutôt qu'il ne l'invente ; et **l'idée d'un langage partagé
entre couches (P9) a un ancêtre** (Java Unified EL) de portée bien moindre.
Rien ne remet en cause le verdict.

**LA DÉCISION EST ACTÉE (18/07/2026, D313 — clôt Q5).** « Cette étude
confirme mon intuition concernant une ouverture pour une **construction de
bout en bout**. **Je valide ce choix.** » Et la feuille de route qui
l'encadre (D314) : répondre d'abord aux questions restantes ; **rédiger une
documentation en amont des développements** ; puis des **mises en
situation** — vérifier la compatibilité de la solution avec les besoins
des clients sur des **exemples concrets**, intégrés à la documentation pour
montrer l'intérêt de la solution. **Aucun code tant que tous les points ne
sont pas validés.**

---

## 10. Questions ouvertes

| # | Question | Enjeu |
|---|----------|-------|
| ~~Q1~~ | ~~Ordre de grandeur ?~~ | **Résolu (D15)** : ~20 utilisateurs simultanés, plusieurs Go → migration directe, mono-serveur, voir §7. |
| ~~Q2~~ | ~~Systèmes tiers : sous contrôle ou externes ?~~ | **Résolu (D11)** : non maîtrisés → compatibilité bidirectionnelle obligatoire, voir §5. |
| ~~Q3~~ | ~~Sens des intégrations ?~~ | **Résolu (D20–D24)** : les deux — exposition sélective avec champs calculés, lecture/écriture unitaire-liste-lot, connecteurs vers systèmes externes, tâches asynchrones suivies — voir §5.5. Détails ouverts : Q17–Q21. |
| ~~Q4~~ | ~~Contexte de déploiement, authentification ?~~ | **Résolu (D15–D16, D29)** : une instance par TPE, hébergement au choix du client ; authentification locale via l'interface (socle) ou provisionnée par AD (clients équipés). |
| ~~Q5~~ | ~~Construire sur mesure ou s'appuyer sur un existant ?~~ | **Résolu (D313, 18/07/2026)** : **la construction de bout en bout est validée par l'auteur** — « cette étude confirme mon intuition ». Fondement : l'étude reprise au périmètre complet (§9.5 + [etude-comparative-20260718.md](etude-comparative-20260718.md)) — l'ensemble n'est couvert par personne, l'auto-génération du P3 sans équivalent (Cadwyn/Reshape/pgroll = précédents partiels devenus études de conception), Directus hors open source et Redis en AGPL. Encadrée par la feuille de route D314 : questions restantes, documentation en amont (Q58), mises en situation (Q59) — **aucun code avant validation de tous les points**. |
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
| ~~Q30~~ | ~~Volet conseil — étude dédiée ?~~ | **Résolu (D45, D315–D319, §6.5)** : détection par **SEQUITUR** sur les appels **normalisés (endpoint + liste des propriétés, valeurs ignorées)** — paires ≥ 2 → règles récursives, **grammaire des séquences répétées** ; exploitation = recommandations d'optimisation **et transformation des séquences lourdes en services proposés** (le moteur propose avec fréquence + gain, **le technicien décide**) ; **seuils** = récurrence sur plage temporelle + **rapport longueur normalisée/réelle** (valeurs calibrées sur données réelles, Q59) ; **aucun catalogue de motifs prédéfini** — les motifs se déduisent, non connus à l'avance. |
| ~~Q14~~ | ~~Modèle de déploiement / qui est le technicien ?~~ | **Résolu (D16, D17, D95)** : une instance par TPE, moteur public, mise à jour technique manuelle, description à chaud (§7.2). Le **« technicien » = un rôle moteur de Syncytium**, paramétrable, affectable à 1..n personnes physiques (D95). |
| ~~Q15~~ | ~~Licence ?~~ | **Résolu (D19)** : AGPL. Gouvernance des contributions : **question à part entière, formellement différée** — les premières versions **ne solliciteront pas** de contributions externes ; réouverture selon retours et besoins (CLA/DCO + processus à définir alors). |
| Q16 | **Le méta-schéma — EN COURS (ouverte le 18/07/2026, branche feature/meta-schema)**. Méthode actée en trois phases : **(1) l'inventaire structuré** (l'arborescence complète du format, domaine par domaine — à produire) ; **(2) le versionnement du format** (compatibilité moteur ↔ descriptions, conversion des descriptions à la montée de version — à discuter) ; **(3) la forme concrète — ARBITRÉE (D320–D321, §3.2c)** : syntaxe **YAML** sans format personnalisé, **multi-fichiers/dossiers** avec patterns, **variables d'interpolation** `${KEY}`/`${KEY?Défaut}` (items de configuration à **navigation relative remontante** — chaque point initial remonte d'un niveau —, mots-clés extensibles, variables d'environnement, imbrication). **La phase 3 est close — et la phase 2 aussi (D322–D332)** : dossier des versions (déposer = publier, version 4 valeurs croissante), partage commun/versionné, registre des essais (retry par bump du build), enveloppe → logique interne (fichiers inertes), journal de migrations compilé persisté, migration dès validation, **descendante = refus propre sur l'en-tête**, **ascendante = conversion à l'ingestion sans réécriture des fichiers** (diffable/commentaires caducs). **Reste la phase 1 : l'inventaire structuré, domaine par domaine.** | Le point de convergence des 332 décisions ; le test de complétude du langage (D44). |
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
| ~~Q34~~ | ~~Catalogue de types de champs ?~~ | **Résolu (D118–D126, §3.4)** : champ = donnée atomique simple/composée, 4 facettes, graphe de conversion, catalogue acté (simples + 11 composés livrés), surcharge par restriction (devises), profil de champ complet (nom invariant, libellés traduits par variantes, descriptions IA-exploitables, comparaison intrinsèque). |
| ~~Q35~~ | ~~Relations ?~~ | **Résolu (D132–D141, §3.5)** : composition (agrégat, suppression-CAS, formes liste/matrice/n-dim, auto-référence acyclique) vs association (référence, inverse en champ liste, N-N par entité de liaison) ; **suppression = inactivation** (soft delete), comportement dérivé de la nullabilité ; **anonymisation déclarée** (RGPD) ; réactivation admin sous contrôle de clés ; unicité sur actifs. |
| ~~Q36~~ | ~~Validation à l'écriture ?~~ | **Résolu (D156–D159, §3.8)** : règles inter-champs déclaratives (D90 + message traduit), portée entité/agrégat, **trois sévérités** (erreur/confirmation/information) en **trois passes regroupées**, agrégats filtrés, double évaluation serveur (vérité) + IHM (transport auto), hook bi-versions. |
| ~~Q39~~ | ~~Pièces jointes / fichiers binaires ?~~ | **Résolu (D160–D163, §3.9)** : type fichier (métadonnées + **mots-clés** de recherche + empreinte), **stockage dual** (binaires hors base dans un dossier géré, grands textes en blob), **quota en cascade** (instance/module/entité/champ — la plus petite gagne), anonymisation = suppression physique du contenu + mots-clés cohérents, **statut** supprimé/anonymisé/corrompu/perdu, contrôle d'intégrité planifié, pas de déduplication. |
| ~~Q37~~ | ~~Historique des modifications ?~~ | **Résolu (D168–D173, §3.11)** : portée en cascade module/entité (défaut inactive, opt-out), **instantanés complets d'agrégat** chaud/froid en lecture seule, confidentialité héritée + anonymisation étendue, restauration admin tracée, **API temporelle** (agrégat à une date) + composant IHM historique, insertion antidatée pour la reprise (contrôles levés). |
| **B — Cycle de vie & exploitation** | | |
| ~~Q40~~ | ~~Sauvegarde / cohérence donnée↔version ?~~ | **Backup physique délégué** au SGBD/hébergement (D16/D18/Q4). **Résiduel résolu (D93)** : estampille de version interne dans la base (deux axes : description + moteur), garde-fous fail-closed au démarrage. |
| ~~Q41~~ | ~~Concurrence & verrouillage ?~~ | **Résolu (D111)** : 3e voie — état-avant/état-après, jeton de concurrence au **grain du champ**, unique IHM+API ; fusion des champs disjoints, conflit → agrégat rejeté (409/410), premier arrivé gagne, second notifié. |
| ~~Q42~~ | ~~Environnement de test / pré-production ?~~ | **Résolu (D112–D114, §7.3)** : multi-environnements — prod (dernière publiée) + un staging par bêta instancié à la volée par migration, API bêta redirigées ; sync synchrone (traduite inter-versions) ou différée ; même mécanisme pour le **PCA/PRA** (actif/passif, bascule client). |
| ~~Q49~~ | ~~Reprise de données ?~~ | **Résolu (D173, D175–D184, §3.11)** : connecteur « reprise » en lecture (durée de vie = admin), écriture standard identifiée « reprise » (antidaté D173), **mapping exhaustif à couverture mesurée** (ignorés marqués + rapport de non-couverture), **critère d'acceptation strict** (converti + cohérent), clés externes déclarées + provenance persistante, **rejets = rapport seul** (opt-in de notification, relance sur les manquants). A révélé le **double périmètre D180** (entrepôt de données fiable + applications métier). |
| ~~Q50~~ | ~~Encapsulation d'une entité ?~~ | **Résolu (D148–D155, §3.7)** : **opérations d'entité** (tâche + déclencheur + bouton IHM) ; **lien parent matérialisé** ; **encapsulation d'exposition dérivée** ; pas de surcharge de champ parent ; **écriture réservée** (write-once, admin tracé) ; **compteurs** (ressource critique moteur : unicité + continuité, composés à déclencheurs en cascade, assemblage par gabarit). |
| ~~Q51~~ | ~~Identité d'un enregistrement ?~~ | **Résolu (D142)** : identité **technique** (UUID invariant à vie — références, audit, concurrence) vs **fonctionnelle** (clés métier, actifs seulement) ; recréer = nouvelle, réactiver = la même, anonymiser = efface la fonctionnelle et préserve la technique. |
| ~~Q52~~ | ~~Héritage d'une entité ?~~ | **Résolu (D143–D147, §3.6)** : héritage simple sans abstrait, intra-module, **table unique** (visibilité des champs par niveau = 3e axe de confidentialité), **héritage-état** (promotion, identité conservée, déclencheurs déclarés), **double position** (client ET fournisseur — l'état = un ensemble de positions), **cycles déclarés** (rétrogradation = exception explicite, masque sans détruire) ; référence à niveau minimal écartée. | Types = restriction (D123), entités = extension. |
| **C — Sécurité d'exécution** | | |
| ~~Q43~~ | ~~Robustesse d'exécution ?~~ | **Résolu (D104)** : pas de timeout sur les fonctions **simples** ; timeout **paramétrable** sur les fonctions **complexes** (classification au catalogue de fonctions). Gardes existants inchangés (D36/D55/D69/D7). |
| ~~Q44~~ | ~~Authentification API & débit global ?~~ | **Résolu (D105, D107)** : rate limiting 15 req/sec + surcharge par compte (429/`Retry-After`) ; **clé API rotative** par défaut ; **on-behalf-of par header dédié** (périmètre D76) ; OAuth2/RFC 8693 en déclinaison (D78). |
| **D — Transverses** | | |
| ~~Q46~~ | ~~Infrastructure de notifications ?~~ | **Résolu (D108–D110, §8.5)** : canaux = connecteurs (vecteur vs contenant, templates en paramètres) ; canaux autorisés dans la description + choix par profil ; persistée d'abord (entité du méta-modèle, outbox) → livraison garantie, historique à rétention max, in-app = lecture du magasin. |
| ~~Q47~~ | ~~Spécification fine du langage d'expression ?~~ | **Résolu (D90–D92, D104, D120, D301–D312, §3.3)** : **catalogue de fonctions et mots-clés en anglais** (similitude VB/Python, i18n potentielle) + « selon que » (`case`) ; **null** — table ternaire standard en référence, **null évalué non gardé = anomalie capturée** (`isnull`/`ifnull` seules portes), null stocké légitime (filtres ciblant le vide) ; **échec par contexte** (substitution en migration / null+trace en calculé / règle non satisfaite + trace en validation) ; **coercition** sûre implicite / explicite par `to_*` / faillible à échec propre — jamais silencieuse ; **grammaire = les exemples actés** (infixe, chemins, gabarits `{}`, `if` filtrant) ; **simple/complexe et déterminisme = propriétés de la fonction** ; **déterminisme exigé aux seules migrations**. |
| **E — UI/UX (regroupe l'affichage)** | | |
| ~~Q38~~ | ~~Recherche & filtrage ?~~ | **Résolu (D125–D126, D198, D222, D226–D229, §8.6)** : filtre = valeur/jeu/comparateur (comparaison intrinsèque du type) ; **plein-texte mono-entité porté par la liste** — recherche globale trans-entités **écartée (assumée)** ; **recherches déclarées** (champs listés, plusieurs par entité, = le filtre transverse unifié) traversant références et enfants par déclaration ; **filtrage vivant** (saisie/sélection, throttling, pas de bouton) ; mode **strict** (contient normalisé) **ou approximation** (score + seuil, tri par score — Dupont puis Dupond) ; anti-oracle via les droits de la liste. Filtres par type → Q56. |
| ~~Q45~~ | ~~Internationalisation ?~~ | **Résolu (D124/D127/D131 + D217–D225, §8.7)** : langues permises **listées au modèle** (1 à 3), langue au profil, formats par langue (multiples, défaut global, surcharge par champ) ; **types temporels brut/horodatage** (brut jamais converti, horodatage UTC) ; **une langue = un fuseau** assumé + surcharge au profil sur liste déclarée ; **collation normalisée uniforme** ; **CSV au modèle** ; notifications **dans la langue de l'opérateur**, journaux en anglais ; gabarits PDF/mails par langue ; **repli à deux crans** + **rapport de couverture des traductions** (signalé + administrable) ; API en **ISO 8601 canonique** (brut sans décalage, horodatage `Z`). |
| ~~Q48~~ | ~~Organisation de l'IHM générée ?~~ | **Résolu (D185–D216, §8.6)** : **quatuor de surfaces nommées** (liste tabulaire/widgets avec édition en ligne, formulaire unique à 5 usages en blocs section/onglet, widget de résumé, widget de synthèse) à déclinaison responsive avec repli ; **module fonctionnel** déclaré + page d'accueil personnalisée ; **menus hiérarchiques** à 5 types d'entrées filtrés par la confidentialité ; masse séquentielle + double validation ; **masque d'explication** ; **impression PDF** (composant, gabarits) ; export CSV ; **import → écran de module (Q55)** ; responsive {écran, tablette, smartphone} × {portrait, paysage} ; popup abandonnée. **Ouvre Q54 (menu-parcours), Q55 (import), Q56 (catalogue des composants).** |
| ~~Q53~~ | ~~Surfaces de synthèse ?~~ | **Résolu (D191, D202, D204, D239–D249, §8.6)** : page d'accueil personnalisée dans le pool des modules fonctionnels ; **catalogue de graphiques** du socle (courbe, barres, secteurs, jauge, **combiné 2 axes max** — au-delà : hook) ; **déclaration** (X = champ découpé par valeurs/plages/temporalité ; Y = fonction filtrée sur X — agrégat D158) ; **jauge** référence+calculée (dépassement possible) ; **drill-down déclaré** (liste nommée à filtre imposé, valeurs visibles du lecteur seulement + **alerte de périmètre**) ; **graphique = déclaration autonome réutilisable** (widgets + formulaires) ; **tableaux de valeurs bornés à tri imposé** ; **pas de comparaison dans le socle** (2 widgets côte à côte ; complexe = hook) ; **croisé dynamique** (filtre + lignes + colonnes + formule, groupements pliables, plages/temporalités) ; **confidentialité héritée de l'entité surchargeable, évaluation = règles des champs calculés** (écart assumé, responsabilité technicien). |
| ~~Q54~~ | ~~Expérience utilisateur (menu-parcours) ?~~ | **Résolu (D230–D233, §8.6)** : le menu-parcours = **wizard** (mono-utilisateur, une session — étapes = surfaces déclarées + contexte, transitions conditionnelles D90, état transitoire, transaction finale D101 + récapitulatif à confirmations tracées, opération de sortie D148, droits jamais élargis) ; le **circuit de validation multi-acteurs = patron d'assemblage** (états D147 + opérations D148 + notifications D108 + listes filtrées) — pas de moteur BPM ; **brouillon = niveau d'état déclaré**, pas de machinerie. |
| ~~Q55~~ | ~~Import d'exploitation ?~~ | **Résolu (D211, D234–D238, §8.6)** : **CSV déposés dans l'écran** du module, un fichier par entité de l'agrégat, **dry-run puis import possible seulement si tout est accepté** (rapport exact sinon) ; modes **remplacement** (créé/modifié/inchangé/supprimé, comptage + confirmation) et **complément** (sans suppression) ; **mapping par entête = libellé dans la langue de l'opérateur** ; tous les champs sauf optionnels ; **export miroir ré-importable** (réversibilité — édition de masse au tableur) ; **provenance = l'opérateur**. |
| ~~Q56~~ | ~~Catalogue des composants graphiques par type de champ ?~~ | **Résolu (D250, D255–D300, §8.8)** : matrice **7 types × 3 modes × 2 orientations** (défaut écran paysage) ; paramètres communs (D258) ; **texte** (masque de saisie, seuils en paramètres d'instance, anatomie libellé/zone/post-libellé), **nombre + composés** (masque déduit, jauge/curseur/stepper à bornes, calculatrice remplaçant le clavier natif, surcharge au formulaire type→champ→formulaire), **temporels** (précision d'heure, raccourcis sur clavier stylisé, calendrier plein écran/proche/icône selon le mode), **choix** (booléen 3 états, énuméré icônes, référence + sélection par image, radios en surcharge), **contenus** (fichier, image + visionneuse graduée, géolocalisation + géocodage open source BAN/Nominatim, communication, liste), **générés** (compteur, calculé, période, QR/code-barres) ; comportements par mode tranchés (D287–D290), dégradation gracieuse pour le reste ; **évolutions par hook** : texte enrichi, agenda/Gantt, recadrage. **Clôt le thème E.** |
| ~~Q57~~ | ~~Construction des gabarits PDF ?~~ | **Résolu (D212, D219, D250–D254, §8.6)** : le gabarit = **un formulaire en lecture seule + une dimension de page** (un seul formalisme — paragraphes, titres/sous-titres 4 niveaux, zones de texte, entête/pied optionnels en gabarits nommés valant aussi pour les formulaires), composé des **types PDF des composants** (D250) ; un gabarit **par langue** (D219) ; **impression directe depuis le serveur** (imprimantes = celles de l'OS ; étiquettes QR/code-barres) ; **variables de contexte = entité « contexte »** (pagination, opérateur, instance… — exploitables comme des champs, D254). |
| Q58 | **La documentation en amont des développements** (ajout 18/07/2026, D314) : forme et structure (guide du technicien ? de l'utilisateur ? référence du méta-schéma ?), publics, lien avec les descriptions du modèle (D124 — « exploitables par des IA »), **intégration des exemples concrets** issus des mises en situation (Q59). | La documentation précède le code — décision de méthode D314. |
| Q59 | **Les mises en situation** (ajout 18/07/2026, D314) : choix des **cas clients concrets**, méthode de vérification de la **compatibilité de la solution avec les besoins**, critères de validation, et **intégration des exemples à la documentation** (Q58) pour montrer l'intérêt de la solution. | Le banc d'essai de la conception avant tout développement. |
| Q60 | **L'inventaire du catalogue des fonctions/opérations** (ajout 12/08/2026, D433) : l'ensemble des fonctions à mettre au catalogue — les opérations embarquées (**le changement d'état, l'opération par défaut**), les effets (notify, document, set, function — D432), leur articulation avec le catalogue d'expressions (D301) et les hooks (D408). | « Je propose que nous fassions un point ultérieurement sur l'ensemble des fonctions à mettre au catalogue. » |

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
- **2026-07-02 (suite 17)** — Précision de l'auteur sur D120 : **la conversion
  faillible est le moteur de l'import** — initialisation depuis une base tierce
  (Q49) et **import CSV/Excel**. Chaque cellule brute tente sa conversion vers le
  type cible ; les échecs produisent le **rapport d'import cellule par cellule** ;
  le dry-run d'import = exécution à blanc des conversions. Détection (conversion)
  séparée du traitement des rejets (politique Q49). Import CSV/Excel = connecteur
  en lecture (D79) + hot folder (D106).
- **2026-07-02 (suite 18)** — Export CSV (précision de l'auteur, D119 amendé) :
  utilise la **facette d'affichage par défaut** (usage humain — Excel) ou un
  **format surchargeable compatible avec le type** (validé par le catalogue ;
  permet l'export machine ISO). Surcharge portée par la configuration du
  connecteur (principe D108). Aller-retour cohérent : le format d'export déclaré
  est connu du ré-import (conversion faillible).
- **2026-07-02 (suite 19)** — Catalogue de types clos (D121–D123). Types simples :
  + date, heure, durée ; **énuméré mono-sélection uniquement** (proposition
  `multiple` écartée — le multi passe par une entité liée, atomicité D118).
  **Tous les composés proposés validés** (periode incluse). **Devise portée par
  la donnée** (valeur + devise, jeu autorisé, standard = ISO 4217) et **surcharge
  de types par restriction** : le schéma dérive des types en restreignant le
  domaine (montant_francais = {EUR}) — mécanisme général de spécialisation,
  inséré dans le graphe D120 (dérivé→standard sûre, standard→dérivé faillible) ;
  singleton = mono-devise. Reste pour clore Q34 : le profil de champ consolidé.
- **2026-07-02 (suite 20)** — **Q34 close** (D124–D126, profil de champ complet).
  **Identité (D124)** : nom = invariant (renommage = migration D4, patron D96) ;
  libellés = variantes traduites (écran responsive, colonne tableau, colonne
  CSV) ; **langue au profil utilisateur, pas à l'instance** (1re décision Q45) ;
  descriptions courte (bulle) + longue (aide) **exploitables par des IA** — le
  méta-schéma devient documentation sémantique. **Comparaison intrinsèque au
  type (D125)** : fonde le tri, réutilisée par le filtre (valeur / jeu /
  comparateur — le langage contraint attendu par Q38) ; types sans ordre = non
  triables. **Tables IHM (D126)** : champs filtrables déclarés à la table, tris
  multi-clés. **Cœur de Q38 résolu** (résiduels : plein-texte, recherche
  globale). Prochain : Q35 (relations — composition/association, agrégats).
- **2026-07-02 (suite 21)** — Libellés à deux couches (D127) : **défauts par
  langue dans la description** + **surcharges en base** modifiables en vie
  courante par un **responsable métier** — acteur nouveau (famille des rôles
  moteur D95/D33, autorité sur le vocabulaire/présentation, pas la structure).
  Chaîne de résolution avec replis (jamais d'écran troué) ; surcharge rattachée
  au nom invariant (survit aux migrations, prioritaire sur tout défaut).
  Borne proposée à valider : surcharge = présentation seulement.
- **2026-07-02 (suite 22)** — **Borne de D127 actée** : la surcharge métier se
  limite à la **présentation**, tout le reste au technicien. **Valeur de
  démonstration ajoutée au profil de champ (D128)** : placeholder IHM, exemples
  de la doc API générée, échantillon pour les IA (complète les descriptions
  D124) ; les types sémantiques livrent la leur, surchargeable au champ.
- **2026-07-02 (suite 23)** — Énumérés : codes stables + libellés par langue
  (D129, étend D127). Valeurs internes = codes invariants (stockage, API,
  filtres, transcodages, domaine D48 ; renommer un code = migration avec
  transcodage) ; libellés par valeur et par langue en deux couches (défauts
  description + surcharges métier) — changer un libellé n'est jamais une
  migration. L'API échange les codes ; l'IHM et l'export CSV affichent le
  libellé dans la langue du profil.
- **2026-07-02 (suite 24)** — Import/export des énumérés (D130). Import :
  **code d'abord, libellé en repli** dans la langue de l'importateur ;
  garde-fous — priorité au code en collision, ambiguïté = échec propre (+
  validation des libellés dupliqués par langue), correspondance sur libellés
  effectifs (surcharges D127) ; import par libellé = commodité humaine, les
  machines utilisent les codes. Export : **code ou libellé déclaré dans la
  description du format CSV** (config connecteur D108/D119), libellé = langue
  de l'exportateur. Round-trip : codes universels, libellés mono-langue.
- **2026-07-02 (suite 25)** — D129 précisé : **trois propriétés par valeur
  d'énuméré** — valeur numérique (le tri : comparaison D125, ordre métier stable
  inter-langues ; changer l'ordre = description, pas migration), code invariant
  (identité contractuelle), identifiant de libellé (indirection D124/D127,
  partage possible entre énumérés). Résout « comment trier un énuméré » (ni
  alphabétique, ni libellé — métier). Option de persistance : facette stockage
  = valeur numérique (tri natif), logique/API = code.
- **2026-07-02 (suite 26)** — Formats par langue (D131) : l'**affichage** (D119 —
  dates, réels : 31/12/2026 vs 12/31/2026, 1 234,56 vs 1,234.56) et la
  **conversion** (D120 — le parsing texte→date/réel suit la grammaire de la
  langue) se déclinent **par langue**, portés par la **description du schéma** ;
  la langue du profil (D124) sélectionne la variante. Syncytium livre les
  standards, le schéma précise. Fondement formel du « langue de l'importateur »
  (D130) ; affichage = présentation (surchargeable D127), grammaire de
  conversion = structurelle ; machines → canoniques ISO.
- **2026-07-03** — Relations (Q35 largement traitée, D132–D136, nouveau §3.5).
  **Composition** : suppression = **CAS sur l'agrégat complet** (fournir la
  commande avec toutes ses lignes, identique à la base, sinon 409 — D111 couvre
  les 3 verbes) puis cascade totale (= définition de la possession, seul cas de
  cascade) ; raffinement conditionnel **déclaré sur la composition** (lisibilité) ;
  **ordre = clé de tri déclarée** (D125/D126) ; **formes liste / matrice /
  multi-dimensionnel** (enfants indexés par dimensions — taille × couleur) ;
  **auto-référence autorisée** (gamme de fabrication) avec acyclicité validée,
  l'agrégat = l'arbre entier. **Association** : N-1 par champ reference ;
  **inverse matérialisé en champ liste** sur la cible (client.commandes — vue
  dérivée, pas une composition) ; N-N par entité de liaison ; restrict par
  défaut / mise_a_null / jamais cascade.
- **2026-07-03 (suite)** — Suppression repensée (D137–D138, amende D136).
  **Suppression = inactivation** (soft delete) : enregistrement inactif,
  propriétés lisibles sur demande, IHM distingue actif/inactif ; agrégat →
  inactivation-CAS ; compte client suit sa fiche (D77). **Comportement à la
  suppression dérivé de la nullabilité** du champ référençant (plus de
  déclaration) : obligatoire → restrict ; optionnel → suppression autorisée,
  **références intactes** (pointent vers l'inactif) ; mise_a_null supprimée par
  construction. **⚠️ RGPD consigné** : droit à l'effacement = purge réelle
  distincte (admin). Sous-questions : réactivation (par qui ?), unicité face
  aux inactifs.
- **2026-07-03 (suite 2)** — **Q35 close** (D139–D141). **Anonymisation déclarée
  sur l'entité** (RGPD — pas de suppression physique ; règle champs+substitutions
  dans le modèle ; irréversible ; l'intégrité référentielle survit à
  l'effacement). **Réactivation par l'administrateur** sous contrôle de collision
  de clés. **Unicité sur les actifs uniquement** (doublons possibles chez les
  inactifs — justifie le contrôle de réactivation). Le triplet
  D139/D140/D141 se verrouille mutuellement.
- **2026-07-03 (suite 3)** — Deux questions ajoutées à la demande de l'auteur :
  **Q50** (encapsulation d'une entité — à développer par lui) et **Q51**
  (identité d'un enregistrement, soulevée par le soft delete). Pour Q51, une
  proposition complète est sur la table : identité **technique** (UUID interne
  invariant à vie — références, audit, concurrence) vs identité
  **fonctionnelle** (clés métier, valides parmi les actifs D141) ; recréer =
  nouvelle identité, réactiver = la même, anonymiser = efface la fonctionnelle
  et préserve la technique ; généralisation du patron D82 (clé d'unicité
  externe → UUID) aux entités synchronisées (Q49).
- **2026-07-03 (suite 4)** — **Q51 validée et close (D142)** : identité technique
  (UUID invariant à vie) vs fonctionnelle (clés métier, actifs seulement) —
  recréer = nouvelle, réactiver = la même, anonymiser = efface la fonctionnelle
  et préserve la technique. **Q52 ajoutée** (héritage d'une entité — à développer
  par l'auteur ; pendant côté entités de la surcharge par restriction des types
  D123 ; complète le triptyque objet avec Q50).
- **2026-07-04** — Héritage d'entité (Q52 largement résolue, D143–D145, nouveau
  §3.6). Cadrage de l'auteur : héritage **simple** (pas de multiple —
  association/composition pour les cas rares), **pas d'abstrait** (parent
  instanciable), **intra-module**, **stockage en table unique porté par
  Syncytium** — avec la **visibilité des champs par niveau** comme nouvel aspect
  de la confidentialité (3e axe, après niveau/canal D25 et audience/ligne D70).
  Idée maîtresse : **l'héritage-état** — un enregistrement progresse dans la
  hiérarchie (tiers → prospect → client dès la première commande) en conservant
  son identité (D142) ; la promotion étend les propriétés et ouvre
  listes/écrans/traitements ; déclencheurs déclarés (action ou événement de
  données D54). Ajouter un niveau = migration ; promouvoir = donnée. Résiduels :
  cumul de branches (client ET fournisseur), rétrogradation, référence à niveau
  minimal.
- **2026-07-04 (suite)** — **Q52 close** (D146–D147). **Double position
  autorisée** : un enregistrement occupe plusieurs branches simultanément
  (client ET fournisseur) — l'état = **un ensemble de positions** ; parent =
  commun, chaque branche ses champs (chargé d'affaires client vs contact
  fournisseur — non antinomiques, modélisation) ; identité unique préservée
  (D142). **Cycles d'évolution déclarés** : machine à états déclarative sur
  l'arbre — promotions par défaut, **rétrogradations si déclarées** (exception
  explicite) ; rétrograder masque (D144), ne détruit pas (esprit D137).
  **Référence à niveau minimal écartée** (modélisation + règles métier Q36).
- **2026-07-04 (suite 2)** — **Q50 close** (D148–D152, nouveau §3.7).
  **Opérations d'entité** : tâche + déclencheur, bouton IHM ; changent l'état
  (véhicule des transitions D145/D147), des valeurs, d'autres enregistrements
  (commande→facturation : n° de facture + écritures comptables) — zéro
  machinerie nouvelle, une tâche promue au rang de verbe de l'entité (D148 ;
  reliquat : écriture réservée aux opérations, à confirmer). **Lien parent
  matérialisé** pour les traitements, non exposé IHM/API (D149).
  **Encapsulation d'exposition dérivée** : enfants non modifiables seuls =
  hors API, accès via le parent (D150). Champs internes → privee suffit ;
  **interface de module écartée** (« la déclaration est une et entière »)
  (D151). **Héritage : pas de surcharge de champ parent** — visibilité
  ajustable seulement, valeur jamais supprimée (D152).
- **2026-07-04 (suite 3)** — Reliquat D148 levé (D153–D155). **Écriture
  réservée** : écrite par les opérations, corrigible par admin seul avec
  traçabilité, **différable**, **write-once** (renseigné → immuable) (D153).
  **Compteurs** : déclarés dans le modèle, gérés en interne — ressource
  critique : pas de doublon + **continuité** (exigence comptable française) ;
  allocation **dans la transaction** de l'opération (échec = numéro non
  consommé) (D154). **Compteurs composés à déclencheurs en cascade** (Année /
  Mois / Libre — retour à 1 au changement de mois), assemblage par gabarit D90
  (`2026-07-0042`) (D155). Q50 entièrement close.
- **2026-07-04 (suite 4)** — Réserve de l'auteur sur D153, **amendée** : le
  write-once est **découplé** de « qui écrit ». `write_once` = propriété
  autonome (renseigné → immuable, correction admin tracée) ; **l'auteur de la
  première écriture relève du modèle d'accès existant** (confidentialité/droits
  d'écriture D25/D26/D73) — utilisateur à la création (`nature` d'un article)
  ou opération (`numero_facture`). L'« écriture réservée aux opérations »
  n'était qu'une configuration, pas un concept.
- **2026-07-04 (suite 5)** — D153, forme finale (clarification de l'auteur) :
  **pas d'attribut supplémentaire** — le mode d'accès en écriture (D73) gagne
  une **troisième valeur : écriture unique** (autorisée une seule fois — vide :
  permise, renseigné : refus). Déclinable par audience/groupe comme tout le
  modèle d'accès (admin en écriture pleine = correction tracée D62, sans règle
  spéciale) ; écriture différée naturelle. Une valeur de plus dans une
  énumération existante, zéro concept nouveau.
- **2026-07-04 (suite 6)** — **Q36 close** (D156–D159, nouveau §3.8). Règles
  inter-champs **déclaratives** (expression D90 booléenne + message traduit
  D127), sur l'entité ou la composition (portée agrégat, transaction D101) ;
  **une règle = un contrôle, jamais une affectation** (réponse à la question de
  l'auteur sur total_coherent). **Trois sévérités** (erreur / confirmation /
  information) avec **protocole en trois passes regroupées** (toutes les
  erreurs d'un coup, confirmations en une validation, informations en une
  fois) — transposé à l'API (re-soumission avec acquittement). **Agrégats
  filtrés** actés pour tout le langage (`somme(... si ...)`, D158). **Double
  évaluation** : serveur = vérité, IHM = transport automatique des règles
  déclaratives ; **hook de validation bi-versions** (serveur obligatoire, IHM
  optionnelle, même contrat D52).
- **2026-07-04 (suite 7)** — Complément D157 validé : **les confirmations
  acceptées sont tracées** (qui a validé quoi, quand — audit D62).
- **2026-07-04 (suite 8)** — **Q39 close** (D160–D163, nouveau §3.9). Type
  **fichier** = nom, taille, MIME, empreinte, **mots-clés** (clé de recherche —
  réponse partielle au plein-texte Q38). **Stockage dual** : binaires **hors
  base** (dossier dédié, nommage Syncytium — la base ne grossit pas), grands
  formats texte (JSON) en **blob** ; contrainte assumée : sauvegarde = base +
  dossier en cohérence temporelle. **Quota en cascade** (instance/module/
  entité/champ, la plus petite gagne). **Anonymisation de fichier** =
  suppression physique du contenu + mots-clés anonymisés en cohérence avec les
  fiches (le lien survit) ; **statut** supprimé/anonymisé/corrompu/perdu — le
  squelette (métadonnées) survit, le contenu part ; corrompu/perdu détectés par
  contrôle d'intégrité planifié ; **pas de déduplication** (la suppression par
  fiche l'interdit).
- **2026-07-04 (suite 9)** — Deux compléments de l'auteur. **D164** : la
  synchronisation entre instances (D113 staging, D114 PCA/PRA) porte sur **la
  base ET le dossier de fichiers** (conséquence du stockage dual D161).
  **D165** (inverse la conclusion « pas de déduplication » de D163) :
  **déduplication par empreinte, décidée dès l'enregistrement** — contenu
  identique réutilisé ; réconciliation par **comptage de références**
  (effacement physique au dernier détenteur, statut par champ) — correct au
  sens RGPD.
- **2026-07-04 (suite 10)** — Deux types complexes ajoutés (D166–D167, nouveau
  §3.10). **Liste de données simples** (liste de fichiers, liste d'entiers) —
  simplifie la description ; amende D160 (multi-fichiers), nuance D118
  (atomicité = l'élément) ; ouvert : liste d'énumérés (réintroduirait la
  multi-sélection D121). **Communication** — trace CRM des échanges
  entreprise↔clients : messages chronologiques (auteur=compte, horodatage,
  contenu, visibilité interne/partagée D70), immuables (append-only), pièces
  jointes ; fil de discussion en IHM ; micro-arbitrages ouverts (visibilité par
  message, immuabilité, pièces jointes).
- **2026-07-04 (suite 11)** — Micro-arbitrages tranchés (D166–D167, formes
  finales). **Liste** : applicable à tous les types **sauf la liste** (simples,
  composées, hooks) ; **propriété « listable » par type** (communication =
  non-listable — un canal = un champ) ; **liste d'énumérés autorisée** (la
  multi-sélection revient par la porte générale, D121 préservée en champ).
  **Communication** : propriétés à défauts — visibilité maximale, immuable
  vrai, pièces jointes non, **notification non** ; si activée, les nouveaux
  messages (réponse à une question) notifient par IHM ou mail via
  l'infrastructure D108–D110 (canaux/profil/audience) — zéro machinerie
  nouvelle.
- **2026-07-04 (suite 12)** — **Q53 ajoutée** au thème E — UI/UX (demande de
  l'auteur) : les **surfaces de synthèse** — déclaration de la page d'accueil,
  graphiques, tableaux de synthèse, widgets, vignettes de résumé (KPI). Briques
  déjà disponibles notées : composants D64, registre D68, rendu déclaratif D69,
  agrégats filtrés D158 comme source des chiffres, tableaux de bord intégrés
  D38/D44 en précédent. À traiter avec Q48.
- **2026-07-05** — **Q37 close** (D168–D173, nouveau §3.11) sur le point de vue
  de l'auteur. **Portée en cascade** : propriété du module et/ou de l'entité,
  héritée par les agrégats, défaut inactive, opt-out par entité (D168).
  **Chaud/froid, instantanés complets** : chaque entrée = toutes les valeurs de
  l'agrégat (pas les écarts) + auteur/horodatage/canal/motif, lecture seule —
  stockage assumé contre consultation triviale (D169). **Confidentialité** :
  visibilité de l'historique par groupe, confidentialités de champs héritées de
  l'origine, **anonymisation étendue** (D170). **Restauration** : admin seul,
  sous condition, tracée — cas vécu ADV (D171). **Consultation temporelle** :
  API à date (défaut courant) + composant IHM « historique » (synthèse + fiche
  à la date du détail) (D172). **Insertion antidatée** pour la reprise
  d'historique d'origine, contrôles de cohérence levés — résout la sous-question
  de Q49 (D173).
- **2026-07-05 (suite)** — Précision de l'auteur sur D169/D172 : **les champs
  calculés s'appliquent à l'historique** — dividende des instantanés complets
  (les calculs, jamais stockés, s'évaluent sur les valeurs froides : la fiche à
  date affiche ses calculs d'époque). Nuance consignée : intra-agrégat exact ;
  traversée d'association résolue à la même date si la cible est historisée
  (jointure temporelle), sinon valeur courante signalée.
- **2026-07-05 (suite 2)** — Sémantique temporelle complète (D174) : **la date
  d'origine traverse toute la chaîne** — historisée → à date ; non historisée →
  courante ; non historisée référençant une historisée → **la date d'origine
  s'applique de nouveau**. Perte de cohérence possible (mélange chaud/froid) →
  **alerte au technicien à la validation du schéma** (analyse statique des
  chemins), sauf **propriété d'anticipation** déclarée sur l'entité non
  historisée (patron rupture_assumee D13/D102).
- **2026-07-05 (suite 3)** — Résolution à date formalisée (D172 précisée) : le
  **dernier instantané dont l'horodatage ≤ la date demandée** — modifications
  strictement postérieures ignorées ; date antérieure à la création →
  l'enregistrement n'existait pas (réponse vide).
- **2026-07-05 (suite 4)** — Second corollaire (D172) : **date postérieure à la
  suppression → réponse vide par défaut, sauf demande expresse** — restitué
  avec le statut « Supprimé ». Fenêtre d'existence complète : avant création =
  vide ; [création…suppression] = instantané à date ; après suppression = vide
  ou « Supprimé » sur demande (miroir temporel de D137).
- **2026-07-05 (suite 5)** — Connecteur de reprise (D175) : un connecteur
  **comme un autre**, mais **déclaré lié à une reprise** (marqueur) ; durée de
  vie = **responsabilité de l'administrateur** — débranché quand tout est
  repris ET la qualité satisfaisante (tracé D62). **Le marqueur borne le
  privilège** : insertion antidatée + levée des contrôles (D173) réservées aux
  connecteurs « reprise ». Reste pour clore Q49 : la politique des rejets
  (gradation + mode strict/quarantaine, proposée).
- **2026-07-05 (suite 6)** — D175 **corrigé** par l'auteur : le connecteur
  « reprise » est **en lecture seule par défaut** (il lit le système d'origine ;
  exception : coexistence avec le connecteur standard) ; **l'insertion antidatée
  passe par le chemin d'écriture standard** et est **identifiée comme provenant
  d'une reprise** — le privilège (levée des contrôles D173) est porté par le
  **marquage de l'écriture**, pas par le type de connecteur. La reprise peut
  mobiliser des **traitements** (tâches/hooks) pour transformer l'information
  complexe, au-delà de la translation déclarative.
- **2026-07-05 (suite 7)** — Rigueur de la reprise (D176–D178). **Mapping
  exhaustif** : le connecteur auto-descriptif signale les entités/champs non
  couverts ; le mapping référence toute la structure d'origine, les éléments non
  repris marqués « ignorés » → couverture mesurée (*on peut ignorer, jamais
  oublier*). **Critère d'acceptation** : enregistré seulement si toutes les
  données converties avec succès ET cohérence de la cible résolue (pas
  d'enregistrement partiel). **Clés externes déclarées** (aucune déduction
  automatique du modèle d'origine) ; **provenance par enregistrement**
  (connecteur, date, clé existante) qui **persiste** après le débranchement du
  connecteur.
- **2026-07-05 (suite 8)** — **Q49 close (D179) et double périmètre acté
  (D180)**. Rejets : **option A, rapport seul** (diffusé selon les opt-in de
  notification D108–D110), correction à la source / ajustement des règles,
  relance sur les manquants ; **rapport spécifique de non-couverture au
  technicien**. L'auteur révèle le **second périmètre** : la reprise = un ETL
  déclaratif déjà construit (Extract = connecteur reprise ; Transform =
  translation + tâches ; Load = critère d'acceptation ; lineage = provenance ;
  time-travel = historisation) → **Syncytium couvre (1) la construction d'un
  entrepôt de données fiable et (2) les applications métier — un moteur, deux
  postures combinables**. Qualification honnête : entrepôt *opérationnel* à
  l'échelle TPE (≠ OLAP — sans objet à quelques Go ; D18/D36 = extensions).
  Vision §1 élargie. **LE VOLET MODÈLE DE DONNÉES EST CLOS** (Q34–Q37, Q39,
  Q49–Q52 : D115–D180).
- **2026-07-05 (suite 9)** — **Raffinement des rejets (D181, complète D179)**.
  L'auteur : le rapport seul suffit, mais il faut pouvoir **exclure des lignes
  que nous n'intégrerons jamais** → **rapports stockés** + **écran** de statut
  par ligne (à ignorer / à reprendre / intégré), le rapport ne diffusant que
  les **lignes nouvellement rejetées**. Consigné : stock consolidé identifié
  par provenance (D178, repli empreinte), « à ignorer » = écartée des relances
  et tracée (D62), « intégré » = constaté automatiquement par rapprochement de
  provenance, écran moteur à accès déclaré (contenu source brut → restreint,
  défaut admin), fin de reprise **objectivée** (plus rien « à reprendre » →
  débranchement D175). Toujours pas une quarantaine : **trace à statut**, ni
  éditable ni injectable — « ignorer, jamais oublier » (D176) vaut désormais
  pour la structure **et** les enregistrements.
- **2026-07-05 (suite 10)** — **Dates sur les lignes du stock (D182)**.
  L'auteur : « avec une date sur la ligne, cela nous permettra de faire un
  audit sur les données et leur intégration ». Consigné : chaque ligne porte
  les dates de son cycle de vie (première détection, dernière tentative,
  changement de statut, intégration) — **le stock devient le journal d'audit
  de la reprise**, complément symétrique de la provenance persistante (D178) :
  l'audit couvre ce qui est entré **et** ce qui n'est pas entré. Ancienneté
  des « à reprendre » = indicateur de pilotage de la fin de reprise (D181).
- **2026-07-05 (suite 11)** — **Cycle des statuts complété (D183) et retour
  arrière (D184)**. L'auteur restructure : statut **« en anomalie »** posé par
  le **système** à l'échec (état d'entrée — la ligne n'est **jamais retentée
  sans décision humaine**) ; l'**administrateur** seul décide (« à
  reprendre » = règle ou source corrigée, replanifiée ; « ignoré ») ; **un
  passage traite les nouveaux + les « à reprendre »**, par la même voie
  standard ; à l'issue, le système repositionne (intégré / en anomalie) —
  **le système constate, l'administrateur décide**. Complexification
  acceptée : **intégré → à reprendre** (erreur découverte après coup) ⇒
  **suppression physique** des données issues de la ligne (agrégat +
  historique), réimport au prochain passage — exception assumée à « masquer,
  ne jamais détruire » (D137), qui **garantit la qualité des données à
  l'issue de la reprise**. Garde-fous consignés : provenance = seul chemin
  (D178), refus si références étrangères à la reprise, trace du stock
  conservée (D182). L'auteur valide le cycle de dates D182 (« apporte de la
  visibilité sur les actions faites et sur la qualité de la reprise »).
- **2026-07-05 (soir — ouverture du thème E UI/UX)** — PR #13 fusionnée
  (le volet modèle de données rejoint `develop`) ; branche
  `feature/theme-uiux`. **Q48 : cœur arbitré (D185–D189)**. L'auteur pose la
  **triade par entité** — liste (colonnes/filtres/tris + ajout/modification/
  suppression), **écran unique fiche/formulaire à deux modes** (tranche le
  point débattu), **widget de résumé** au survol d'une référence — puis les
  **défauts sans description** (menu par module, liste = tous les champs ou
  les premiers remplissant la largeur, affichage de champ par surface ×
  responsive, champs empilés, compositions en onglets-listes, **historique =
  dernier onglet invariant**, communication en onglet, 1-1 → widget, 1-N →
  liste cible filtrée), les **listes déclarées** (1..n, modes responsive,
  import/export/impression PDF, formulaire cible, liste paramétrable
  enregistrable), les **formulaires déclarés** (1..n, **blocs**
  onglet/section/popup, sections en colonnes/lignes) et le **menu porté par
  le modèle** (entrées multiples par entité). Principe validé par la forme :
  « **le schéma suffit, la déclaration ajuste** ». Clarifications listées
  dans Q48 (chaîne menu→liste→formulaire, enfants de composition,
  paramétrable, widget, PDF, modes responsive, actions de masse).
- **2026-07-05 (soir, fin de séance)** — **Pause.** Les **7 points à
  clarifier sont consignés en détail au §8.6** (avec propositions — non
  décidées) pour reprise aux prochains échanges. L'auteur signale qu'« il
  manque de nombreux points » et que ses propositions **manquent encore de
  précisions** : les D185–D189 seront **raffinés** avant de clore Q48.
- **2026-07-06** — **Reprise, idées clarifiées : module fonctionnel et page
  d'accueil (D190–D191)**. (1) **Module fonctionnel** = sous-application :
  **vue restreinte** offerte à l'utilisateur (au plus ses droits, souvent
  moins — restreint la surface, n'étend jamais les droits), affectée par
  l'administrateur (1..n), navigable, **préférence au profil** ; défaut = un
  module fonctionnel unique couvrant toute l'application. Distinct du module
  du schéma (D115/D117). (2) **Page d'accueil du module fonctionnel** :
  identification (application, module fonctionnel, société, logo), bandeau
  gauche = choix du module fonctionnel, bandeau haut = menus/sous-menus,
  corps = **widgets** (indicateurs clés ou liste d'entité) ou liste directe ;
  défauts : bandeau gauche masqué si module fonctionnel unique, bandeau
  haut = modules du schéma avec **parents d'agrégats uniquement** (tranche
  la clarification n° 2 — reste le cas des entités de liaison N-N), corps
  vide. Inspiration design : **Microsoft Azure**, à traiter après la
  structure. **Suite annoncée par l'auteur (exposé en cours).**
- **2026-07-06 (suite)** — **Troisième niveau de menu (D192)**. Les entités
  de liaison ne sont **jamais proposées par défaut** (accessibles depuis une
  entité) ; le menu peut prévoir un **3ᵉ niveau** (entités enfants + entités
  de liaison) ; la **modification directe d'un enfant reprend l'agrégat
  parent/racine** (D101/D111/D132, cohérent D150) — l'accès direct est une
  commodité de présentation, pas un contournement. Clôt la clarification
  n° 2 en entier.
- **2026-07-06 (suite 2)** — **Le grand raffinement (D193–D204)**. L'auteur
  précise l'ensemble de l'IHM. **Menus** (D193) : un par module fonctionnel,
  hiérarchique, 5 types d'entrées (sous-menu/liste/formulaire de
  création/action/widget de synthèse), logo → accueil, **entrées filtrées
  par la confidentialité**, défaut à 3 niveaux (modules → agrégats →
  enfants et associées). **Menu-parcours** (D194) : une expérience
  utilisateur = enchaînement d'écrans (circuit de validation…) → **Q54
  ouverte**. **Quatuor** (D195) : + widget de synthèse ; liste tabulaire ou
  en widgets de résumé. **Fonctions de liste** (D196) : CRUD si droits —
  **droits d'action au modèle de confidentialité** ; suppression confirmée
  par le formulaire en lecture seule (**pas de popup**) ; export = colonnes
  visibles. **Masse** (D197) : modification séquentielle interruptible ;
  suppression à double validation (nombre + synthèse). **Paramétrage**
  (D198) : dimensions de colonnes, tris au clic, **filtres transverses
  multiples**, colonnes/ordre au profil ou publiés au groupe
  (administrateur/responsable métier). **Formulaire à 5 usages** (D199) :
  compteurs à la validation, **blocs composables** (section/onglet, h/v),
  champs à bloc dédié (carte, pièces jointes…), **widget de synthèse
  embarqué filtré sur l'enregistrement**, historique = dernier onglet.
  **Composant graphique** (D200) : responsive **par construction**, aucun
  choix technicien. **Widget de résumé** (D201) : champs choisis
  lecture/modification, petit, **inexistant par défaut**. **Widget de
  synthèse** (D202) : compteurs/calculs/graphiques/tableaux + **drill-down**
  vers liste filtrée ; inexistant par défaut. **Responsive** (D203) :
  {écran, tablette, smartphone} × {portrait, paysage}. **Accueil** (D204) :
  l'utilisateur choisit une entrée de menu ou laisse vierge + ses widgets.
  Clarifications 1/3/4/6/7 closes ; **restent** : import/impression PDF
  (disparus du raffinement ?), bloc popup (maintenu ?), 1-1 sans widget
  déclaré, liste désignée du 1-N, catalogue des composants par type
  (annoncé).
- **2026-07-06 (suite 3)** — **La déclaration formalisée (D205–D210)**.
  **Édition en ligne** dans les listes (case à cocher, liste de valeurs,
  texte, numérique — D205). **Surfaces déclarées** (D206) : listes,
  formulaires, widgets de résumé et de synthèse **nommés + description**,
  déclinés **par mode d'affichage avec mode par défaut et repli** (« pour
  éviter les blancs ») ; **une liste est associée à un formulaire**
  (confirme la chaîne). **Paramètres de formulaire** (D207) : « affichage de
  l'historique » (défaut vrai, masquable — l'invariant devient : *s'il est
  affiché*, toujours dernier), mode lecture seule précisable. **Widget de
  résumé = configuration de formulaire restreinte** (D208) — composants
  interdits, pluriel et nommé. **Masque d'explication** (D209) : première
  consultation ou sollicitation → descriptions de la surface et des champs
  (D124) = l'aide en ligne sans rédaction séparée. **Modules fonctionnels
  déclarés** (D210) : un module fonctionnel déclare un menu, l'affectation
  utilisateur↔module par l'administrateur (écran d'administration). Les
  résidus de Q48 (import/PDF, popup, 1-1 sans widget, liste du 1-N)
  demeurent.
- **2026-07-06 (suite 4)** — **Q48 CLOSE (D211–D216)**. Les quatre résidus
  tranchés par l'auteur : **import = écran dédié de module** (responsable
  métier/administrateur), retiré des listes — détail ultérieur → **Q55
  ouverte** ; **impression PDF confirmée** (défaut = la liste telle
  qu'affichée ; déclarable — colonnes, mode tabulaire/widgets ; **gabarits**
  pour documents, impression depuis un formulaire ; **le PDF est un
  composant**, plusieurs par liste) ; **export CSV** = colonnes affichées,
  déclarables avec longueur ; **popup abandonnée** (blocs = section ou
  onglet) ; **référence 1-1** = libellé ou élément de synthèse + lien vers
  le formulaire cible en lecture seule, sélection via une **liste nommée**
  du formulaire ; **champ 1-N** = liste nommée, colonne de lien masquée.
  **Q56 ouverte** (catalogue des composants graphiques par type, annoncé).
  **L'organisation de l'IHM est close** — restent au thème E : Q53
  (graphiques, croisés, gouvernance), Q54 (parcours), Q55 (import), Q56
  (catalogue), résiduels Q38/Q45.
- **2026-07-06 (suite 5)** — **Q57 ajoutée** à la demande de l'auteur : la
  **construction des gabarits PDF** (description du gabarit, liaison aux
  données, mise en page, i18n, lieu de déclaration) — découle de D212.
- **2026-07-06 (suite 6)** — **Précision de l'auteur sur D212/Q57** : « les
  fonctionnalités ne sont pas exactement les mêmes qu'un composant
  graphique » — l'analogie composant du PDF vaut pour l'**enregistrement et
  la réutilisation**, pas pour le **contrat fonctionnel** ; la définition du
  contrat propre du gabarit PDF est versée aux attendus de Q57 (consignation
  rectifiée : « est un composant » → « s'apparente à un composant »).
- **2026-07-06 (suite 7)** — **Q45 : le cœur tranché (D217–D219, §8.7 —
  PR #14 créée entre-temps)**. **UTC** au stockage ; **fuseau dépendant de
  la langue** de l'utilisateur ; **formats portés par la langue** (plusieurs
  possibles, défaut global au modèle par langue, surcharge par champ) ; **le
  modèle liste les langues permises** (périmètre réel : 1 langue en grande
  majorité, 2 parfois, 3 au maximum) ; **notifications = messages à format
  par langue, émis dans la langue de l'opérateur** ; **journaux internes en
  anglais** ; **gabarits PDF/mails : un par langue** ; **repli à deux
  crans** (langue par défaut du modèle, puis nom invariant). L'auteur
  demande : « Vois-tu d'autres points ? » — points soulevés en réponse :
  dates/heures **civiles** (sans conversion de fuseau) vs instants UTC,
  borne « une langue = un fuseau » à consigner, **collation de tri fixée
  par instance** (pagination cohérente), formats du **CSV** (séparateurs
  colonne/décimal par langue), **rapport de couverture des traductions**
  (patron D176), **API en ISO 8601 UTC**.
- **2026-07-06 (suite 8)** — **Q45 CLOSE (D220–D225)**. Les six points
  arbitrés : **types temporels brut/horodatage** (date et heure = brutes,
  jamais converties — « une échéance au 1ᵉʳ juillet reste le 1ᵉʳ juillet » ;
  la date+heure se déclare brute ou horodatage UTC) ; **une langue = un
  fuseau assumé** (surcharge au profil sur liste de fuseaux déclarée par
  l'application) ; **collation = tri sur chaîne normalisée** (sans accents
  ni caractères spéciaux, identique pour tous, pas de surcharge) ; **CSV
  défini au modèle** (imposé par l'application, ni utilisateur ni langue) ;
  **rapport de couverture des traductions signalé au technicien +
  consultable dans l'administration** ; **sérialisation API en chaînes** —
  réponse à la question de l'auteur (« est-ce que cela pose problème ? ») :
  aucun problème **à condition** d'un format canonique invariant (ISO
  8601 ; brut sans décalage, horodatage suffixé Z ; jamais le format
  d'affichage d'une langue) — recommandation intégrée à D225.
- **2026-07-06 (suite 9)** — **Q38 : la troisième voie de l'auteur (D226)**.
  Ni moteur plein-texte dédié, ni barre de recherche globale : **la
  recherche plein-texte est mono-entité et portée par la liste** — « cela
  évite les recherches trans-entités », limitation **assumée** (« mes
  projets ne nécessitent pas de mettre en place tout cela »). Mais **la
  correspondance traverse les références** : sur la liste des commandes,
  « Dupont » remonte **toutes les commandes passées par Dupont** (l'affichage
  de la référence client matche). Mécanique : contient normalisé (D222),
  droits de la liste (anti-oracle gratuit). Trois précisions soumises :
  la référence matche sur sa représentation d'affichage (D215, un seul
  niveau ?) ; l'agrégat entier participe-t-il (commentaire d'une ligne de
  commande) ? ; unification avec le filtre transverse (D198) ?
- **2026-07-06 (suite 10)** — **Q38 CLOSE (D227–D229)**. **Recherches
  déclarées** : la liste des champs concernés est précisée (les autres
  ignorés — ex. nom, prénom, adresse), **plusieurs recherches par entité** —
  unification avec le filtre transverse (D198) : un seul objet « recherche »
  au méta-schéma ; la traversée des références et des enfants passe par la
  déclaration des champs (interprétation consignée) ; défaut = les colonnes
  affichées. **Filtrage vivant** : toujours « contient », la liste se filtre
  **à chaque saisie ou sélection, sans bouton**, avec **throttling** ; les
  filtres par type de données seront décrits avec les composants graphiques
  (Q56). **Approximation** : mode strict (sous-chaîne normalisée D222) ou
  **approximatif** — score, **seuil**, tri **par score décroissant** (Dupont
  exact avant Dupond) ; algorithme = implémentation, contrat = score+seuil.
  Le thème E n'a plus que Q53, Q54, Q55, Q56, Q57.
- **2026-07-06 (suite 11)** — **Q54 CLOSE (D230–D233)**. L'auteur valide la
  proposition en bloc (« le terme wizard me plaît et tes propositions me
  conviennent ») : **menu-parcours = wizard** mono-utilisateur une session ;
  **circuit de validation multi-acteurs = patron d'assemblage** (états D147,
  opérations D148, notifications D108–D110, listes filtrées — pas de moteur
  BPM, le circuit vit dans la donnée) ; étape = surface déclarée + contexte,
  transitions conditionnelles (D90) ; **état transitoire** (abandon = rien,
  écriture = transaction d'agrégats D101 à la fin, récapitulatif à
  confirmations tracées D157, opération de sortie D148) ; **brouillon = un
  niveau d'état déclaré** (D145–D147), pas une machinerie moteur ; un wizard
  **n'élargit jamais les droits**. Restent au thème E : Q53, Q55, Q56, Q57.
- **2026-07-06 (suite 12)** — **Q55 CLOSE (D234–D238)**. La vision de
  l'auteur, plus simple et plus stricte que la proposition : **CSV seuls,
  déposés dans l'écran** (ni Excel, ni hot folder, ni stock de rejets —
  rapport seul) ; **un fichier par entité de l'agrégat** (commande + lignes
  = 2 fichiers) ; **dry-run, puis import possible uniquement si toutes les
  valeurs sont acceptées** (rapport exact des erreurs sinon : données +
  lignes) ; **deux modes** — **remplacement** (classement
  créé/modifié/inchangé/supprimé, **comptage par catégorie, confirmation
  avant lancement**) et **complément** (sans suppression) ; **mapping par
  l'entête de colonne = libellé du champ dans la langue de l'opérateur**
  (pas de table de mapping) ; **tous les champs** sauf optionnels ;
  **l'export miroir** produisant le fichier ré-importable (réversibilité —
  le cycle export→tableur→import remplacement = l'édition de masse) ;
  **provenance = l'opérateur**. Interprétations consignées : rapprochement
  par la clé fonctionnelle (D142), « supprimé » = inactivation (D137).
  Restent au thème E : Q53, Q56, Q57.
- **2026-07-06 (suite 13)** — **Confirmations sur D235** : le CSV ne
  transporte pas l'UUID — « c'est un identifiant **interne, non connu, ni
  exposé aux utilisateurs** » ; **la clé fonctionnelle fait le lien**
  (D142). « Suppression » = **désactivation** (D137) — aucune suppression
  physique, celle-ci restant liée au seul connecteur de reprise (D184).
  Les deux interprétations deviennent fermes.
- **2026-07-06 (suite 14)** — **Q53 : les graphiques arbitrés (D239–D242 —
  PR #15 créée entre-temps)**. **Catalogue du socle** : courbe, barres,
  secteurs (camembert/anneau), jauge, **combiné** (courbe+barres ou 2
  courbes, **2 axes Y maximum** — « au-delà, cela peut vite devenir
  illisible » ; au-delà = hook via le registre D68). **Déclaration** : sur
  une entité, axes par type de graphique — **X = un champ** découpé par
  valeur distincte (énuméré, valeurs d'une référence), par **plages
  déclarées** (numériques) ou par **temporalité** (heure/jour/semaine/mois/
  année) ; **Y (1 ou 2)** = une fonction sur un champ **filtrée sur la
  valeur de X** (agrégat filtré D158 partitionné). **Jauge** : valeur de
  référence + valeur calculée (formule ou valeur absolue), **dépassement de
  100 % possible**. **Drill-down** : par défaut aucun ; déclaré via une
  **liste nommée** dont le graphique **enrichit le filtre imposé** avec la
  valeur cliquée. Restent pour clore Q53 : vignettes KPI (tendance ?),
  tableau de valeurs, tableau croisé, gouvernance.
- **2026-07-06 (suite 15)** — **Le graphique réutilisable (D243)**.
  Précision de l'auteur : un graphique **se déclare une fois** et est
  **potentiellement exploitable dans plusieurs widgets de synthèse et dans
  plusieurs formulaires** — déclaration autonome nommée (patron D206),
  contextualisée dans un bloc de formulaire par le filtre imposé (D199).
- **2026-07-06 (suite 16)** — **Vignettes et tableaux de valeurs (D244–
  D245)**. **Tableau de valeurs** = liste nommée + **tri imposé** (non
  sélectionnable) + **nombre de valeurs limité** (pas de listes à rallonge
  dans un widget). **Pas de comparaison/tendance dans le socle** : comparer
  = **deux widgets côte à côte** sur des temporalités différentes ; les
  comparaisons complexes (traitements lourds) = **hook**. Restent pour
  clore Q53 : le tableau croisé et la gouvernance.
- **2026-07-06 (suite 17)** — **Le tableau croisé dynamique (D246)**.
  L'auteur : « puissant et pourtant simple à mettre en œuvre ». **Une
  entité + 4 éléments** : filtre, champ(s) en ligne, champ(s) en colonne,
  **formule d'intersection** ; plusieurs champs → **groupements
  hiérarchiques pliables** (répartition par mois des CA par commerciaux et
  par client). Découpage = D240, formule = agrégat D158 par cellule,
  **indépendant de D134**. Reste pour clore Q53 : la gouvernance.
- **2026-07-06 (suite 18)** — **Confirmation sur D246** : sur les champs
  **numériques ou dates**, des **plages ou des temporalités** peuvent être
  définies — comme pour les graphiques (D240) — **pour réduire le volume de
  colonnes ou de lignes** du croisé. Le renvoi anticipé vers D240 devient
  une décision ferme.
- **2026-07-06 (suite 19)** — **Q53 CLOSE (D247–D248)**. Gouvernance : le
  widget de synthèse est **associé à une entité, donc par construction à un
  module fonctionnel** ; **confidentialité héritée de l'entité,
  surchargeable**. **Évaluation = les règles des champs calculés** (le
  calcul voit le périmètre de l'entité, l'accès au résultat est gouverné
  par la confidentialité du widget) ; **le drill-down ne montre que les
  valeurs visibles du lecteur** — l'écart (fuite/valeur déductible) est
  **assumé, sous la responsabilité du technicien**, et **une petite alerte
  prévient l'utilisateur** que les valeurs listées ne couvrent pas la
  totalité du périmètre du calcul (pas de fausse alerte de
  non-réconciliation). Proposition intégrée non arbitrée : calcul à
  l'affichage (D36 en extension). **Le thème E n'a plus que Q56 et Q57.**
- **2026-07-06 (suite 20)** — **Le tableau de bord et le rafraîchissement
  (D249)**. Une page d'accueil de widgets de synthèse **constitue un
  tableau de bord** ; un widget dispose de **trois modes** : **statique**
  (calcul à l'affichage, jusqu'au rafraîchissement utilisateur — tranche la
  proposition restée ouverte en D248), **temps réel** (à chaque
  notification de mise à jour de l'entité ou d'un enfant — événements de
  données D54 à l'échelle de l'agrégat), **fréquence** (période
  déterminée). Défaut = statique (interprétation), **confirmé par l'auteur
  dans la foulée** — « le mode par défaut est bien statique ».
- **2026-07-06 (suite 21)** — **Q56–Q57 ouvertes ensemble : les cinq modes
  d'un composant (D250 — PR #16 créée entre-temps)**. « Les 2 questions
  sont intimement liées » : un composant graphique **se décline en
  lecture seule, modification, widget de résumé, composant PDF et composant
  Excel** — chaque mode décliné en responsive par construction (D200).
  Conséquences consignées : le gabarit PDF (Q57) **compose les modes PDF**
  des composants comme un formulaire compose leurs modes écran ;
  l'interdiction en widget (D208) = un mode absent ; l'export produit des
  **cellules typées** (la ré-importabilité D237 y gagne).
- **2026-07-06 (suite 22)** — **D250 précisé** : le vocabulaire est arrêté —
  les déclinaisons fonctionnelles sont des **types** (le mot « mode » est
  réservé au responsive D203) ; un **sixième type** est ajouté : le
  **composant d'une cellule dans une liste** (rendu tabulaire). **Chaque
  type est décliné en six modes** : écran/tablette/smartphone ×
  portrait/paysage — la matrice complète **6 types × 6 modes** appartient
  au composant, par construction (D200).
- **2026-07-06 (suite 23)** — **D250 précisé (bis)** : le composant de
  cellule dans une liste **se décline en 2 — lecture et modification** —
  soit **sept types** au total. La cellule en modification **est** l'édition
  en ligne (D205) : l'interprétation devient structurelle. Matrice finale :
  **7 types × 6 modes**.
- **2026-07-06 (suite 24)** — **Vocabulaire responsive arrêté (D250/D203)** :
  **trois modes** (écran, tablette, smartphone) × **deux orientations**
  (portrait, paysage) ; **par défaut, tout est prévu pour un écran
  paysage**. Matrice d'un composant : **7 types × 3 modes × 2
  orientations**.
- **2026-07-06 (suite 25)** — **Q57 : la structure du gabarit PDF (D251–
  D252)**. Le gabarit **exploite le gabarit d'un formulaire en lecture
  seule**, avec des ajustements retrouvables sur un formulaire :
  **paragraphe de texte, titre, sous-titres jusqu'à 4 niveaux**. **Document
  = entête (optionnel) + pied de page (optionnel) + un bloc représentant la
  page** — entête et pied sont des **gabarits nommés au même formalisme** ;
  la **dimension de la page est décrite**. **Impression directe depuis le
  serveur** (étiquette à QR code ou code-barres) — corollaires : QR/code-
  barres = composants du catalogue Q56, configuration d'imprimante serveur
  à préciser. Micro-points soumis : variables de pagination dans
  entête/pied, déclaration de l'imprimante.
- **2026-07-06 (suite 26)** — **Le formulaire hérite en retour (D253)** :
  un formulaire **peut également avoir un entête et un pied de page, avec
  des zones de texte** — formulaire et gabarit PDF partagent **un seul
  formalisme** (le gabarit = un formulaire en lecture seule + une dimension
  de page).
- **2026-07-06 (suite 27)** — **Les imprimantes (D252 précisé)** : les
  imprimantes disponibles pour l'impression serveur sont **celles présentes
  au regard du système d'exploitation** — pas de connecteur ni de
  déclaration dédiée. L'auteur demande une explication des « variables de
  pagination » avant d'arbitrer ce dernier micro-point de Q57.
- **2026-07-06 (suite 28)** — **Q57 CLOSE (D254)**. La généralisation de
  l'auteur : les variables de pagination deviennent des **variables de
  contexte** — nom du fichier, date/heure du moment, numéro de page, nombre
  de pages, opérateur, nom de l'instance, nom du module… — **exploitables
  de la même façon qu'un champ d'une entité** : une **entité « contexte »**
  (moteur, lecture seule, nom à fixer en Q16), consommée par les
  expressions et gabarits D90 ; **disponibilité selon le contexte**
  (pagination au rendu d'un document, opérateur en session). Aucun
  mécanisme spécial. **Le thème E n'a plus que Q56** (catalogue des
  composants par type — QR code et code-barres inclus).
- **2026-07-06 (suite 29)** — **Q56 : ouverture du catalogue (§8.8, D255–
  D257)**. L'auteur : « cette partie est essentielle et consolide tous les
  points abordés — je compte sur elle pour rendre la construction d'une
  application simple, rapide et à l'UI/UX agréable ». Trois conventions
  arbitrées : **calculés recalculés à l'écran dès qu'une dépendance est
  modifiée** (D255) ; **boutons radio réservés aux énumérés de faible
  cardinalité** (seuil à fixer, 5 pressenti — D256) ; **rendu PDF des
  contenus riches = une image, chaque type aura son pendant PDF** (D257).
  Méthode annoncée : **parcours intégral type par type**, comportement par
  mode et orientation. Convention rédactionnelle proposée (à valider) :
  décrire l'écran paysage en entier, puis les seuls écarts.
- **2026-07-06 (suite 30)** — **Les paramètres communs d'un composant
  (D258)**. L'auteur fixe la liste canonique : **libellé, commentaire**
  (infobulle), **description** (masque des écrans / aide détaillée),
  **valeur de démonstration** (placeholder), **états possibles** (lecture,
  écriture, écriture unique), **validation, filtre** — d'autres propriétés
  possibles **par type**. Alignement terminologique consigné : description
  courte (D124) → commentaire ; description longue → description.
- **2026-07-06 (suite 31)** — **Le composant texte, premier du catalogue
  (D259–D262)**. L'auteur corrige et enrichit la proposition : **pas de
  zone de texte enrichie** ; le mono/multi-ligne **dérive de la taille
  maximale** selon un **seuil en paramètre général de l'instance** (défaut
  100 caractères — nouveau concept transverse) ; **N = lignes affichées
  avant repli** ; **masque de saisie** en propriété du champ (`_`, `9`,
  littéraux, classes `[A-E]`) ; lecture multi = N lignes + « voir plus »
  **traductible** ; modification = compteur au-delà d'un seuil d'instance,
  **saisie bloquée à la taille** ; widget = « libellé pour widget » + valeur
  en ellipse (**la variante widget d'un libellé peut être vide** — D124
  étendu) ; cellule/PDF/Excel validés tels que proposés. **Écarts
  transverses (D262)** : tablette = pas de survol, infobulle par petit logo
  près du libellé ; smartphone = ni infobulle ni description, libellé plus
  petit ; portrait/paysage = aucun écart. Convention rédactionnelle validée
  par l'usage.
- **2026-07-07** — **Compléments sur le texte (D263–D265)**. **Zone de
  texte enrichie = évolution potentielle** (composant d'un futur type
  complexe « document » ; le hook de composant devra le permettre — hors
  socle). **Le masque pilote les lignes** (un masque multi-lignes prime la
  dérivation taille/seuil). **Anatomie d'une zone de saisie** : libellé +
  zone de saisie + **post-zone** (devise, %, abréviation… ou rien) ;
  tablette/smartphone : libellé ou abréviation **configurables**, défaut =
  les libellés du mode de base. La post-zone servira les composés (montant,
  pourcentage, mesure).
- **2026-07-07 (suite)** — **Retour sur les listes (D266)** : les colonnes
  déclarées sont **toutes modifiables par défaut** (édition en ligne
  D205) ; la déclaration d'une liste peut marquer une colonne **en lecture
  seule** — la marque restreint, elle n'élargit jamais (droits D196, mode
  d'accès D153, calculés).
- **2026-07-07 (suite 2)** — **Le composant nombre (D267–D268)**. **Un
  nombre = une zone de texte à particularités** : le masque de saisie **se
  déduit des propriétés du champ et de la langue** (chiffres avant/après la
  virgule, bornes, séparateurs D131 — rien à déclarer) ; le
  **post-libellé** (unité, devise) se place **avant ou après selon la
  langue**. **Tactile** : clavier numérique exploité (réserve UX de
  l'auteur notée) ; **calculatrice** à calculs élémentaires **ou clavier
  stylisé** — méthode de saisie tactile.
- **2026-07-07 (suite 3)** — **Variantes et surcharge (D269–D270)**. Le
  nombre peut se présenter en **jauge** (styles multiples) ou avec des
  boutons **[-] / [+]** (incrément/décrément d'une valeur entière). **La
  surcharge du composant au formulaire est actée** : le défaut vient de la
  description du modèle (type → champ D64), **le formulaire peut
  surcharger** pour choisir le type de GUI — chaîne type → champ →
  formulaire, bornée aux composants compatibles avec le type.
- **2026-07-07 (suite 4)** — **Rendus du nombre validés (D271)** : aligné à
  droite partout, Excel natif, filtre comparateur/plage, widget au patron
  du texte, PDF avec post-libellé. Le composant nombre est complet.
- **2026-07-07 (suite 5)** — **Les composés numériques (D272–D275), famille
  close**. **Montant** : décimales **définies sur les propriétés du champ**
  (2/3/4 selon la précision voulue), indépendamment de la devise —
  correction de la proposition (« dérivées de la devise » écartée) ;
  post-libellé devise selon la langue. **Pourcentage** : **avec une borne,
  la jauge devient un choix possible** (pas de jauge sans bornes).
  **Mesure** : ne contient pas plus d'informations (post-libellé unité).
  **Durée** : **masque de saisie + option de conversion** (canonique ↔
  chaîne) ; **Excel = la valeur canonique**.
- **2026-07-07 (suite 6)** — **Jauge et curseur généralisés (D276)** :
  **tout champ numérique entier borné peut être une jauge** (ex. un montant
  entre 0 et 10 000 €) ; **le curseur** offre une saisie **simple et sans
  clavier** (tactile D268). La borne est la condition — généralise
  D269/D273.
- **2026-07-07 (suite 7)** — **Les temporels (D277–D280)**. **Heure** :
  précision = propriété du champ (hh → hh:mm:ss.sss), **horloge** de
  saisie/affichage. **Date** : **raccourcis** (aujourd'hui, la veille,
  hier, début/fin de mois…) sur un **clavier stylisé** (patron D268),
  **calendrier année/mois/semaine** au **n° de semaine lié à la langue**.
  **Date+heure** : raccourcis (maintenant…), **calendrier + horloge
  combinés**. **Compositions temporelles** (agenda, emploi du temps,
  Gantt…) = **évolutions potentielles via le hook** (patron D263). Socle
  proposé à confirmer : masque déduit de la langue, Excel natif, brute
  telle quelle / horodatage au fuseau, filtre plage.
- **2026-07-07 (suite 8)** — **Socle des temporels validé (D281)** : « le
  socle que tu as proposé est validé » — masque déduit de la langue, Excel
  natif, brute telle quelle / horodatage au fuseau (affichage et export),
  filtre plage. La famille temporelle est close.
- **2026-07-07 (suite 9)** — **Les choix (D282–D285)**. **Booléen** : case
  à cocher **à 3 états si nullable**, toggle sans nul ; **libellés
  VRAI/FAUX/NUL surchargeables affichés au survol** ; déclinable en
  énuméré ; export = libellé ou valeur. **Énuméré** : déroulante validée ;
  **jeu d'icônes ou d'images possible**. **Référence** : description
  validée + **le champ « image » d'une entité** — s'il est défini, la
  **sélection par image + libellé court** est privilégiée dans un
  formulaire dédié (choix d'un plat). **Radios (D285, amende D256)** :
  **surcharge graphique au formulaire** (D270) — le seuil automatique de
  cardinalité est abandonné.
- **2026-07-07 (suite 10)** — **Deux types de base ajoutés (D286)** :
  **vignette** (image de petite taille) et **image** (grande taille **+
  déclinaison en vignette**) — étend le catalogue D121 ; ils portent le
  champ « image » d'une entité (D284) et s'appuient sur le patron fichier
  (D160/D165). **Confirmé dans la foulée : la vignette d'une image est
  calculée automatiquement** par le moteur.
- **2026-07-16 (reprise — PR #17 fusionnée entre-temps)** — **Les
  comportements par mode tranchés (D287–D290)**. Audit : seul le texte
  avait son bloc d'écarts explicite — quatre points soumis, quatre
  arbitrages : **la calculatrice remplace le clavier natif** (smartphone
  et tablette — un seul dispositif) ; **temporels** (smartphone :
  calendrier plein écran, semaine/mois/agenda, tactile seul ; tablette : à
  proximité du champ ; PC : saisie clavier + icône) ; **choix**
  (smartphone : déroulante unique/multiple, image plein écran empilée,
  radios empilées ; tablette : image en zone restreinte ; PC : raccourcis
  clavier + parcours par saisie throttlée) ; **listes** (smartphone :
  tableau pour les petites listes, widgets au volume — **1 colonne
  portrait / 2 colonnes paysage, premier écart d'orientation**, nuance
  D262 ; filtres : PC affichés, smartphone icône, tablette au choix).
  Le reste suit la **dégradation gracieuse** (convention §8.8).
- **2026-07-16 (suite)** — **Famille des contenus ouverte** (fichier,
  image/vignette, géolocalisation, communication, liste — proposition
  soumise). Premier arbitrage : **la carte affiche la position courante du
  terminal (D291)** — repère en lecture, « ma position » en saisie, sous
  réserve de l'autorisation du terminal.
- **2026-07-16 (suite 2)** — **La famille des contenus close (D292–D296)**.
  Les six points arbitrés : **types de fichiers autorisés portés par le
  champ** ; **appareil photo/galerie** sur smartphone ; **visionneuse**
  plein écran (smartphone) / pourcentage d'écran (tablette) / zone définie
  (PC) ; **géocodage = connecteur avec un défaut open source dans le
  socle** — question de l'auteur sur OpenStreetMap, réponse : **Nominatim**
  (géocodeur OSM, auto-hébergeable, API publique à politique stricte) et
  surtout **l'API Adresse / BAN** (service public français, moteur Addok
  open source — candidat naturel du périmètre TPE) ; **fond de carte
  déclarable à l'instance** ; **pas de communication en cellule de liste**
  (proposition compteur+date rejetée) ; **séparateur CSV déclaré au modèle,
  surchargeable à la fonctionnalité**. Reste pour clore Q56 : la famille
  des générés (compteur, calculé, période, QR/code-barres).
- **2026-07-16 (suite 3)** — **Q56 CLOSE (D297–D300) — LE THÈME E EST
  ENTIÈREMENT CLOS.** La famille des générés validée en bloc (« ta
  proposition me convient ») : **compteur** (lecture seule, placeholder
  « attribué à la validation », valeur assemblée D155), **champ calculé**
  (lecture seule, recalcul sur dépendance D255, composant = celui du type
  de résultat), **période** (deux dates liées contrôlées en frappe, Excel =
  deux colonnes natives), **QR code/code-barres** (composants de sortie,
  PDF/étiquettes D252, Excel = valeur source). **300 décisions.** Le thème
  E (Q38, Q45, Q48, Q53–Q57) est résolu en totalité — restent au projet :
  Q47 (langage), les différées Q5/Q7/Q30, et Q16 (méta-schéma, en dernier).
- **2026-07-16 (suite 4)** — **Q47 ouverte (PR #18 fusionnée, branche
  feature/langage)**. Proposition en sept points (null, coercition,
  erreurs, catalogue, grammaire, simple/complexe, déterminisme). Premiers
  arbitrages : **le catalogue de fonctions est en anglais (D301)** —
  internationalisation potentielle + similitude avec les langages connus
  (VB, Python) — la proposition « noms en français » est écartée, les
  exemples consignés seront anglicisés ; **la logique « selon que » est
  ajoutée (D302)** — sélection multi-branches facilitant les tables de
  correspondance, pendant en ligne du transcodage. Corollaire soumis : les
  mots-clés de la grammaire (le « si » filtrant → `if` ?).
- **2026-07-16 (suite 5)** — **Q47 : cinq arbitrages (D303–D307)**. **Le
  null : la logique ternaire retenue** (contre la proposition de
  propagation bivaluée) — mais la **table dictée comporte deux écarts au
  standard** (OU asymétrique ; `Faux et null → null` là où le standard
  absorbe en Faux) : table standard SQL/Kleene proposée en confirmation,
  argument = l'alignement sur le SGBD où s'exécutent filtres et
  validations. **Échec par contexte** (D304) : substitution en migration,
  null+trace en calculé, **règle non satisfaite + trace** en validation
  (précision de l'auteur). **Grammaire = les exemples actés** (D305).
  **Simple/complexe et déterminisme = propriétés de la fonction du
  catalogue** (D306–D307). Demande de l'auteur : un **résumé de la
  coercition** (fourni en réponse — ratification attendue). Restent : la
  table ternaire exacte, les mots-clés anglais, l'exigence de contexte du
  déterminisme, la ratification coercition.
- **2026-07-16 (suite 6)** — **Le null tranché (D308, amende D303)**.
  « Tu as raison » : la table standard est validée en référence — mais la
  doctrine du projet prime : **le null dans une expression booléenne ou
  arithmétique est une valeur anormale, capturée** (circuit D304), **sauf
  s'il est capté par `isnull`/`ifnull`**. Ni propagation silencieuse, ni
  ternaire silencieuse : l'anomalie se voit. Interprétation soumise : les
  filtres de consultation au SGBD suivent la table ternaire standard (pas
  d'anomalie à exclure une ligne à champ null).
- **2026-07-16 (suite 7)** — **Les mots-clés de la grammaire en anglais
  (D309)** : le « si » filtrant devient `if`, le « selon que » prendra sa
  forme anglaise au catalogue — fonctions et mots-clés anglais, noms de
  champs et d'entités = ceux du modèle. Clôt le corollaire D301/D305.
- **2026-07-16 (suite 8)** — **Q47 CLOSE (D310–D312)**. Les trois dernières
  confirmations : **les filtres peuvent cibler les lignes null** et la
  doctrine est nette — « **dans une table, null n'est pas une anomalie ;
  dans une évaluation pour un calcul, oui** » (null stocké légitime, null
  évalué capturé D308) ; **le déterminisme n'est exigé que pour les
  migrations** (D311) ; **la coercition est validée** (D312 — sûre
  implicite, explicite par `to_*`, faillible à échec propre, jamais
  silencieuse). **Le langage d'expression est entièrement spécifié**
  (D90–D92, D104, D120, D301–D312). Restent au projet : Q5 (une ligne),
  Q7, Q30, et **Q16 — la synthèse méta-schéma, dernière question**.
- **2026-07-18** — **L'étude comparative reprise avec le périmètre complet
  (§9.5 — PR #19 fusionnée entre-temps, branche feature/etude-q5)**. À la
  demande de l'auteur (« l'étude a été faite lorsque nous n'avions pas tout
  couvert »), le harnais de recherche a été relancé (2 passes — la première
  fauchée par les limites de quota, la seconde en reprise sur cache) : 24
  sources, 118 affirmations, **11 confirmées à l'unanimité des panels
  adversariaux, 0 réfutée**. Faits saillants : **Frappe/DocType confirmé**
  comme l'acteur le plus proche du pilier 1 (modèle+vue+contrôleur d'une
  déclaration, sans API à translation) ; **pgroll/Reshape/Atlas** documentés
  au pilier 2 (déclaratif zéro-interruption, sans règles regex/gabarit ni
  dry-run du niveau Syncytium) ; **pilier 3 affiné** — **Cadwyn** (MIT,
  FastAPI) confirmé comme **précédent OSS du versionnement à la Stripe**,
  mais **vérification directe** (docs.cadwyn.dev, 18/07) : VersionChange
  **écrits à la main**, **aucune auto-génération depuis un journal de
  migrations, ni épinglage par compte, ni cycle de vie** ; Reshape/pgroll =
  compat bidirectionnelle auto-générée **au niveau SQL, temporaire**. La
  reformulation du différenciateur est actée en §9.5. **Directus quitte
  l'open source (MSCL), Redis revient à l'AGPL** — positionnement D19
  renforcé. **Verdict : le « construire » sort renforcé — Q5 prête à être
  actée par l'auteur.**
- **2026-07-18 (suite)** — **Le détail de l'étude consigné au dépôt**
  (`docs/etude-comparative-20260718.md` : affirmations verbatim, citations,
  votes, non-départagées, sources, limites — le §9.5 y renvoie), et **la
  section §1.1 « Les neuf piliers de Syncytium » ajoutée** à la demande de
  l'auteur : P1 description unique, P2 migrations à chaud, P3 compat d'API
  bidirectionnelle auto-générée (le différenciateur), P4 IHM générée, P5
  double périmètre, P6 temporalité, P7 langage unique, P8 sécurité par
  construction, P9 observabilité — chacun renvoyant à ses décisions et
  sections ; les principes transverses distingués des piliers.
- **2026-07-18 (suite 2)** — **P10 ajouté : la liste devient « Les dix
  piliers »**. L'auteur relève l'absence du « pilier 10 » de l'étude ;
  l'explication est consignée avec la correction : dans la grille de
  l'étude, le pilier 10 examinait le **paysage des licences** (un
  contexte) — mais **l'engagement open source (AGPL) est bien un pilier du
  projet** (décision fondatrice D19 : « la solution ne devra pas devenir
  commerciale », dépendances compatibles, moteur public D16–D17) ; ce que
  l'étude examinait, c'est le paysage qui **valide** ce pilier (Directus
  sorti de l'open source, Redis revenu à l'AGPL).
- **2026-07-18 (suite 3)** — **Passe complémentaire superficielle sur les
  piliers 4/5/7/8/9** (question de l'auteur : « recherche non faite ou
  échouée ? » — réponse : non menée, le harnais priorise 5 angles ; passe
  légère demandée et exécutée : un sondage par pilier, sans vérification).
  Constats indicatifs consignés au §7 du document d'étude : **aucun acteur
  d'ensemble** sur P4 (IHM riche générée), P5 (entrepôt+applications à
  lineage d'enregistrement), P7 (compteurs/héritage-état/sécurité ligne en
  propriétés déclarables) ; **précédents de patron** à noter honnêtement
  sur **P8** (le round-trip tableur existe au niveau fonctionnalité —
  AppSheet en ré-import apparié par clé, Azure Boards, Dataverse — sans les
  modes remplacement/complément ni le dry-run bloquant) et **P9** (Java
  Unified EL = ancêtre d'un langage partagé entre couches, de portée bien
  moindre). Rien ne remet en cause le verdict — **Q5 attend la phrase de
  l'auteur.**
- **2026-07-18 (suite 4)** — **Q5 ACTÉE (D313) : LA CONSTRUCTION DE BOUT EN
  BOUT.** La phrase de l'auteur : « Cette étude confirme mon intuition
  concernant une ouverture pour une construction de bout en bout. **Je
  valide ce choix.** » (Entre-temps : le tableau de synthèse piliers ×
  outils ajouté au §9 du document d'étude, avec sa lecture en trois lignes,
  et les 14 affirmations non départagées énumérées en intégralité.) **La
  feuille de route est consignée (D314)** : répondre aux questions
  restantes (Q30, Q16…) ; **rédiger une documentation en amont des
  développements** (→ **Q58 ouverte**) ; **mises en situation** sur des
  exemples concrets clients, vérifiant la compatibilité avec les besoins,
  exemples intégrés à la documentation (→ **Q59 ouverte**) ; **aucun code
  tant que tous les points ne sont pas validés**. La dernière décision
  stratégique est prise — restent au projet : Q7, Q16, Q30, Q58, Q59.
- **2026-07-18 (suite 5 — PR #20 créée entre-temps)** — **Q30 : l'approche
  de l'auteur (D315–D316)**. L'héritage du précédent projet : identifier
  des **séquences de requêtes PostgreSQL** pour remplacer les appels
  unitaires par des **curseurs et des lectures/mises à jour par bloc**,
  via **SEQUITUR** — les paires de requêtes normalisées apparaissant au
  moins 2 fois deviennent des règles, substituées récursivement jusqu'à
  épuisement (grammaire hiérarchique des répétitions). Application à
  Syncytium : les séquences répétées → recommandations d'optimisation, et
  surtout **« les séquences qui se répètent peuvent se transformer en
  service que nous pourrions proposer »** — remplacer une séquence lourde
  et longue par une ou quelques requêtes limitées ; le moteur propose
  (fréquence + coût), le technicien décide. Restent à préciser :
  normalisation des appels, seuils de proposition, sort du catalogue de
  motifs simples proposé.
- **2026-07-18 (suite 6)** — **Q30 : normalisation et seuils (D317–D318)**.
  **Normalisation = endpoint + liste des propriétés, valeurs ignorées.**
  **Seuils** : le dilemme est nommé (trop bas = bruit, trop haut = sous les
  radars) ; deux critères combinés — **récurrence sur plage temporelle**
  (une séquence à 1×/jour, /semaine ou /mois peut être pertinente) et
  **rapport longueur normalisée / longueur réelle** (le taux de compression
  mesure le gain) ; **valeurs à évaluer sur données réelles** (calibrage
  aux mises en situation Q59). Reste : le sort du catalogue de motifs
  simples.
- **2026-07-18 (suite 7)** — **Q30 CLOSE (D319)**. Le catalogue de motifs
  prédéfini est **écarté** : « cela peut être déduit des motifs identifiés
  et non connus à l'avance » — un seul moteur de détection (SEQUITUR), sans
  a priori ; les schémas classiques (cache, N+1, polling, crawl)
  émergeront de la grammaire comme règles courtes s'ils existent. Le volet
  conseil est entièrement spécifié (D45, D315–D319). Restent au projet :
  Q7, Q16, Q58, Q59.
- **2026-07-18 (suite 8 — PR #21 fusionnée, branche feature/meta-schema)**
  — **Q16 OUVERTE — la synthèse finale.** Méthode proposée en trois phases
  (1 : inventaire structuré de l'arborescence, domaine par domaine ; 2 :
  versionnement du format moteur↔description ; 3 : forme concrète).
  **L'auteur prend la phase 3 d'emblée et l'arbitre (D320–D321)** :
  **syntaxe empruntée au YAML, pas de format personnalisé** ;
  **décomposition en plusieurs fichiers/dossiers** avec valeurs référençant
  des fichiers ou patterns (`01-Utilisateurs/*.yml`, `./*/instance.yml`) ;
  **variables d'interpolation** `${KEY}`/`${KEY?Défaut}` — items de
  configuration (`.item.subitem`), mots-clés (`PROJECT`, `VERSION`,
  `date:<format>`… extensibles), variables d'environnement, **imbrication**
  (`${triggers.${environment.name}.filename}`) — spécification **éprouvée
  sur l'implémentation existante de l'auteur** (« PySyncytium » apparaît
  dans les exemples). Ambiguïté soumise : le point initial — racine (spec)
  ou nœud précédent (exemple) ?
- **2026-07-18 (suite 9)** — **L'ambiguïté levée : la navigation est
  relative et remontante (D321 précisé)**. `{name}` = la propriété au
  **même niveau** ; `{.name}` = au **niveau précédent** ; `{..name}` = au
  **parent du précédent** — chaque point initial remonte d'un niveau ; pas
  d'ancrage à la racine (la mention « from the root » de la spécification
  d'origine est caduque). **La phase 3 de Q16 est close** — restent les
  phases 2 (versionnement du format) et 1 (l'inventaire).
- **2026-07-18 (suite 10)** — **Phase 2 ouverte, étape par étape (D322)**.
  La proposition de versionnement (6 points : version en tête, conversion
  par le journal de migrations du méta-schéma en dogfooding D4–D6,
  ascendante matérialisée, descendante = refus propre façon 426, YAML
  diffable, sort des commentaires) sera traitée **point par point** —
  l'auteur annonce un **lien avec l'organisation de la phase 3**. Premier
  pas consigné : **version du méta-schéma déclarée en tête ; un fichier
  d'entrée par version, référençant un sous-dossier au détail de la
  description**. Question de lecture soumise : « par version » — le
  méta-schéma (format) ou le schéma client (journal D2–D3, chaque montée
  matérialisée en fichier + dossier) ? *(Note : ordre chronologique du
  journal rétabli ce jour — les suites 6 à 8 du 16/07, déplacées par un
  ancrage d'insertion, ont été remises à leur place.)*
- **2026-07-18 (suite 11)** — **L'organisation du dépôt de description
  précisée (D323–D325)**. **Petits fichiers** plutôt qu'un seul (les
  redondances n'étant pas facilement éliminables, **les variables D321
  référencent une fois, réutilisent partout**). **Le dossier des
  versions** : une description par version dans un même dossier, le moteur
  y découvre les versions disponibles — **déposer un nouveau fichier =
  publier une nouvelle version** (croissance exigée) ; version à 4 valeurs
  `<majeure>.<mineure>.<indice>.<build>`. **Partage commun/versionné** :
  configuration technique commune (connecteurs, journaux) vs contenu
  versionné (schéma de données, IHM, configuration générale — seuils de
  télémétrie, méta-niveau). La question de lecture de D322 est résolue :
  **un fichier par version du schéma client** (le dossier matérialise le
  journal), l'en-tête portant la version du format.
- **2026-07-18 (suite 12)** — **Le cycle de vie d'une version de
  description (D326–D328)**. **Le moteur conserve la référence des
  versions testées et validées** ; une version **en erreur n'est pas
  réessayée sans incrément du build** au moins (le retry est explicite).
  **Le fichier est une enveloppe convertie en logique interne** pour un
  usage en toute sécurité ; **après lecture, modifier les fichiers ne
  reconstruit ni n'altère l'existant** (pas de re-vérification à chaque
  sollicitation ou relance) — les fichiers sont inertes après ingestion.
  **La migration s'effectue dès que la description est validée**
  (harmonisée au pipeline D7–D9), et la version devient **sollicitable via
  les API et les IHM** (chaîne D94–D100). Restent en phase 2 : la
  conversion du format à la montée de version moteur (dogfooding), la
  descendante, le YAML diffable, les commentaires.
- **2026-07-18 (suite 13)** — **Le journal de migrations compilé (D329)**.
  Pour la performance : **le moteur traduit les descriptions en un journal
  de migrations à format interne qui lui est propre** ; **la migration est
  gérée en mémoire** ; **à la relance du serveur, les règles sont déjà
  prêtes à l'emploi** — les traitements d'optimisation déjà réalisés et
  **réutilisables** (forme compilée persistée, aucune recompilation).
  Pièce maîtresse de la logique interne (D327), nourrissant aussi la
  chaîne de translation des API (§5.1).
- **2026-07-18 (suite 14)** — **La descendante tranchée (D330)** :
  « sans hésiter l'option (c) » — **refus propre immédiat sur la seule
  lecture de l'en-tête** (format déclaré > format supporté), avec la
  version de moteur requise, avant toute ingestion ; consigné au registre
  (D326) avec la cause « format non supporté » (le bump du build ne sert à
  rien — c'est le moteur qui doit monter). Le miroir du 426 (D94).
  Restent en phase 2 : l'ascendante (moteur vN+1 lisant les enveloppes
  anciennes — conversion à l'ingestion ?) et le sort diffable/commentaires
  (probablement caduc avec l'architecture d'enveloppe D327).
- **2026-07-18 (suite 15)** — **LA PHASE 2 DE Q16 EST CLOSE (D331–D332)**.
  L'ascendante validée : **conversion à l'ingestion** — le moteur vN+1 lit
  les formats antérieurs (journal du format embarqué complet) et compile
  l'enveloppe ancienne en logique interne à jour ; **les fichiers du
  technicien ne sont jamais réécrits**. Corollaire : **diffable et
  commentaires caducs** — les fichiers restent tels qu'écrits ; un outil
  de mise à niveau serait un outil du technicien, pas un geste du moteur.
  **Le versionnement du format est entièrement spécifié (D322–D332).**
  Reste la phase 1 : l'inventaire structuré, domaine par domaine.
- **2026-07-18 (soir)** — **La documentation générée automatiquement
  (D333)**. Question de l'auteur à la reprise : l'exigence était-elle
  consignée ? Réponse : partiellement — les masques d'explication oui
  (D209), la documentation auto seulement effleurée (D124 « exploitables
  par des IA », `document: md.yml` de l'échantillon D320). **Actée** : le
  méta-schéma et la configuration construisent en automatique, autant que
  possible, une **documentation technique**, les **masques d'explication**
  et une **documentation fonctionnelle** — deux sources complémentaires
  avec la documentation rédigée en amont (D314/Q58) : la générée vit avec
  le modèle et ne se périme jamais.
- **2026-07-18 (soir, suite)** — **La documentation vivante (D334)** : la
  documentation technique **exploite aussi les données enregistrées en
  base** — l'usage ou le non-usage de valeurs et de plages (la télémétrie
  D38–D51 devient la **troisième source** : le modèle dit le permis, la
  base dit le fait) ; et **des informations dédiées au technicien pourront
  être partagées aux utilisateurs, aux techniciens de parties tierces et
  aux usagers** (sous les règles d'accès existantes — interprétation
  consignée).
- **2026-07-18 (soir, suite 2)** — **Q16 phase 1 lancée : le domaine 1
  (la racine) livré** — arborescence (fichier racine, configuration
  technique commune, dossier des versions), contenu du fichier racine
  (identité d'instance, langues/fuseaux/formats, compte de secours,
  références par patterns), configuration technique détaillée. Premier
  arbitrage : **la langue du dépôt (D335)** — noms de dossiers, de
  fichiers et propriétés de configuration **en anglais** (structure en
  anglais, sémantique métier dans la langue du modèle — cohérent
  D301/D309). En attente : statut de version au fichier d'entrée
  (officielle/bêta), groupes versionnés, modules fonctionnels versionnés.
- **2026-07-18 (soir, suite 3)** — **Le dépôt client et le template
  (D336–D337)**. **Le dossier de description est versionné par le client
  dans un dépôt différent du projet Syncytium** (moteur public /
  descriptions par TPE — le contrat = le format versionné). **Le projet
  Syncytium embarque un dossier `template/`** : un projet **« Hello
  world ! »** facilitant la prise en main par le technicien — description
  minimale clonable, application immédiate, premier exemple de la
  documentation (D314/Q58–Q59).
- **2026-07-18 (soir, suite 4)** — **Le statut d'une version = son
  emplacement (D338)**. Après un rappel des environnements consignés
  (production, stagings par bêta, actif/passif — pas d'UAT), la troisième
  voie de l'auteur : **pas de statut dans le fichier — le dossier
  `versions/` est décliné par environnement**. Déposer une version dans le
  dossier d'un environnement = la publier pour cet environnement (le geste
  D324 étendu). Interprétations soumises : promotion bêta → officielle =
  déplacement du fichier vers production ; interdite/dépréciée = actes
  d'administration (D103). Restent au domaine 1 : les groupes et les
  modules fonctionnels (versionnés ?).
- **2026-07-18 (soir, suite 5)** — **Environnements et cycle de vie en
  dossiers (D339–D340)**. **`environments/`** : `staging.yml` (test),
  `production.yml` (active), `passive.yml` (passive PCA/PRA). **Les
  statuts interdits et dépréciés sont aussi des dossiers** — les versions
  vivent dans **quatre dossiers : `beta/`, `production/`, `deprecated/`,
  `forbidden/`** ; le cycle de vie D103 entièrement matérialisé par
  l'emplacement, les transitions = des gestes de fichier (l'interprétation
  « actes hors fichiers » de D338 est amendée). Harmonisation : dépréciées
  servies jusqu'au Sunset, interdites refusées (D94/D103) ; beta →
  staging, production → actif+passif. Restent au domaine 1 : groupes et
  modules fonctionnels (versionnés ?).
- **2026-07-18 (soir, suite 6)** — **LE DOMAINE 1 EST CLOS (D341)** : **les
  groupes et les modules fonctionnels sont versionnés avec le schéma**
  (contenu versionné D325) — les affectations restant des actes
  d'administration en base (D27, D210). La racine de l'inventaire est
  entièrement arbitrée (D333–D341) : documentation à trois sources, langue
  anglaise du dépôt, dépôt client distinct + template Hello world,
  environnements en fichiers, cycle de vie des versions en quatre
  dossiers, groupes et modules fonctionnels versionnés. **Prochain :
  le domaine 2 — la donnée.**
- **2026-07-18 (soir, suite 7)** — **La configuration par environnement
  (D342–D343)**. Après la vue consolidée du domaine 1, le nom
  `technical/` est écarté : **`environments/`, un dossier par
  environnement** — **connecteurs, logs, settings et documentation
  spécifiques à chaque environnement** (les valeurs partagées passant par
  les variables D321/D323). **Journaux par environnement** : staging =
  debug/verbose, production active = info + puits de logs éventuel,
  passive = warning — formats et emplacements de stockage différents.
  L'arborescence consolidée est réécrite en conséquence.
- **2026-07-18 (soir, suite 8)** — **La cohérence des versions (D344)** :
  **erreur si une même version apparaît dans deux sous-dossiers
  simultanément** ; **le statut est porté par l'ingestion** (les dossiers
  = le geste, l'état ingéré = la vérité — registre D326) ; **transitions
  unidirectionnelles** (beta → production, production → deprecated ou
  forbidden, **jamais l'inverse**). Micro-point soumis : deprecated →
  forbidden permis ?
- **2026-07-18 (soir, suite 9)** — **`deprecated → forbidden` écarté (D344
  complété)** : « s'il est déprécié, cela signifie qu'il a été utilisé
  suffisamment longtemps pour être éprouvé » — le bug critique se constate
  **en production**, où la version est classée `forbidden`. Le graphe du
  cycle de vie est complet : beta → production → deprecated (extinction au
  Sunset) ou production → forbidden.
- **2026-07-18 (soir, suite 10)** — **Le graphe final et l'ordre des
  numéros (D345)** : **`beta → forbidden` permis** (bug critique découvert
  en phase de validation) ; **dépréciées et interdites conservées pour
  l'histoire** (rien ne s'efface) ; **ordre incrémental : beta >
  production > deprecated — forbidden hors contrainte** (une bêta comme
  une production de tout numéro peut y être classée).
- **2026-07-18 (soir, suite 11)** — **Deux règles de méthode demandées par
  l'auteur, consignées** : (1) **avant de proposer la phase suivante,
  demander si tous les points du sujet en cours ont été vus** — la
  complétude se vérifie avec l'auteur, elle ne se présume pas ; (2) **dans
  le cadre du méta-schéma, chaque livraison de domaine inclut un rappel de
  l'organisation des dossiers et fichiers** — pour conserver la vue
  d'ensemble à mesure que l'inventaire grandit.
- **2026-07-18 (soir, suite 12)** — **Le dossier `resources/` (D346)** —
  la règle de complétude paie dès sa première application : à la question
  « avons-nous fait le tour du domaine 1 ? », l'auteur ajoute **le dossier
  `resources/`** à la racine (même niveau que `syncytium.yml`) — logos,
  icônes, images et autres documents, **partagés avec toutes les
  versions**. Distinction consignée : ressources de la description ≠
  stockage des fichiers de données (D160). Le domaine 2 (livré) attend ses
  arbitrages : grain module/entité, surfaces séparées, schema.yml en
  pattern.
- **2026-07-18 (soir, suite 13)** — **Le dossier d'un module (D347)** —
  la complétude du domaine 1 sera vérifiée après tous les domaines
  (méthode de l'auteur) ; `module.yml` détaillé et **corrigé par
  l'auteur** : le dossier d'un module = `module.yml` + **sous-dossier
  `entities/`** (un fichier par entité), `entities: - entities/*.yml` — le
  pattern à plat aurait inclus le fichier d'entrée comme entité. Restent
  au module.yml : l'activation (racine ou settings ?), le menu (avec les
  surfaces ?), les propriétés manquantes.
- **2026-07-18 (soir, suite 14)** — **Le bloc `settings` de module.yml
  (D348)** : il regroupe **les propriétés potentiellement diffusées dans
  les sous-composants** (history, quota…) — « la structuration de cette
  section se consolidera au fur et à mesure de nos échanges et des
  compléments poussés par les autres domaines ». Le patron des `settings`
  en cascade s'esquisse (environnement → module → entité → champ).
  Restent : l'activation et le menu.
- **2026-07-18 (soir, suite 15)** — **Le `settings.yml` du module
  (D349)** : le bloc settings est **externalisé en fichier**, référencé
  par `module.yml` (`settings: settings.yml` — la référence de fichier
  D320) — « il est possible que ce bloc prenne de l'ampleur, la suite
  nous dira si c'est le cas ». Un `settings.yml` à chaque étage : le
  patron s'affirme.
- **2026-07-18 (soir, suite 16)** — **La déclaration vaut activation
  (D350)** : pas de drapeau — un module présent dans la description est
  actif ; le désactiver = le retirer (nouvelle version, migration).
  L'« activation par instance » (D117.3) est portée par le contenu de la
  description de chaque instance (D16). Reste sur module.yml : le menu
  (avec les surfaces du domaine 4 ?).
- **2026-07-18 (soir, suite 17)** — **Le menu du module dans `menu.yml`
  (D351)** — fichier optionnel du dossier de module, référencé par
  `module.yml` ; sans lui, le défaut D186/D191/D193 s'applique ; contenu
  détaillé au domaine 4. **Le dossier de module est complet** :
  `module.yml` + `settings.yml` + `menu.yml` + `entities/`. Précision de
  l'auteur dans la foulée : **le bloc `menu: menu.yml` figure
  explicitement dans `module.yml`** — l'exemple complet est mis à jour.
- **2026-07-20** — **Le fichier d'entité abordé (module non clôturé — la
  complétude se vérifiera en fin de parcours)** ; structure proposée :
  identité (name/labels/comment/description), clé fonctionnelle, champ
  image, héritage-état, settings (raffinement des défauts), access
  (audiences + droits d'action), compositions, compteurs, opérations,
  validations, champs. Premier arbitrage : **l'externalisation des blocs
  est libre, jamais imposée (D352)** — fichier unique léger pour les cas
  simples (« un découpage trop détaillé va rendre le processus trop
  lourd »), découpage bienvenu pour les entités conséquentes, au choix du
  technicien. Restent : la forme du bloc états (machine à états), le
  détail du bloc fields.
- **2026-07-20 (suite)** — **L'héritage restructuré (D353)** :
  **`inheritance` (sur l'enfant) = la seule référence au parent** ; **la
  machine à états = un bloc sur le parent référençant les enfants** —
  niveaux, branches, promotions/rétrogradations, déclencheurs se déclarent
  là où la hiérarchie est entière. Exigence : « une approche qui rende le
  paramétrage naturel » — forme concrète proposée en réponse.
- **2026-07-20 (suite 2)** — **Le cliquet (D354)**. La forme `states:` est
  validée (« belle proposition ») ; la sémantique du `when` est précisée :
  **trois déclencheurs** (événement de données, opération, expression) ;
  **le franchissement s'exécute à la première vraie** — puis, si la
  condition redevient fausse (commande supprimée, total à zéro), **le
  client reste client** ; **le retour n'advient que par une action
  explicite autorisée**. La promotion est un cliquet, pas un asservissement
  à la condition.
- **2026-07-20 (suite 3)** — **La création directe à un niveau (D355)** :
  possible — « un client peut être créé sans être passé par la phase
  prospect » ; l'enregistrement naît avec la position du niveau choisi
  (identité D142 dès la naissance, branches D146 acquérables ensuite).
  Reste au fichier d'entité : le bloc `fields`.
- **2026-07-23** — **Le bloc `fields` : la forme (D356–D358)**. Livraison
  du bloc avec l'exemple canonique et l'inventaire en **sept familles**
  (nature, stockage, libellés, contraintes, accès, comportement, champs
  générés hors déclaration) ; trois arbitrages : **le mapping ordonné**
  — l'ordre de déclaration décrit l'affichage par défaut — **et la forme
  courte** (`notes: text`, « utile pour faire un mode simple et
  rapide ») ; **l'identité fonctionnelle sur l'entité**
  (`identity: [code]` — « une bonne lisibilité si nous avons des clés
  multiples », et tout aussi simple pour une clé simple) ; **les valeurs
  du catalogue en anglais** (types, confidentialité, modes — étend D335,
  la ligne D301). Reste au bloc `fields` : le détail des familles
  (facettes par type, contraintes, accès, comportement).
- **2026-07-23 (suite)** — **Les types personnalisés (D359)**. En regard
  du catalogue des types proposé (simples/composés/contenus en anglais),
  l'auteur introduit **le type défini dans le `settings` de l'instance,
  du module ou de l'entité** : le champ qui l'utilise **reprend toutes
  les propriétés par défaut et peut les surcharger** — l'exemple
  fondateur `progression` (entier 0..100, composant « fuel ») porté par
  un champ `avancement`. La bibliothèque enrichissable (D52/D68) trouve
  son geste déclaratif, la dérivation par restriction (D123) son
  domicile, la forme courte (D356) son plein sens. Micro-points ouverts :
  l'étage « instance » (settings.yml à la racine du dossier de version —
  contenu versionné D325), la résolution des noms, le chaînage, les trois
  micro-arbitrages du catalogue (renommages, `list of`, `to:`).
- **2026-07-23 (suite 2)** — **La résolution des types personnalisés
  (D360)** : **le plus proche l'emporte** (entité > module > version >
  Syncytium), les noms du catalogue de base réservés ; l'étage
  « instance » ancré au **`settings.yml` de la racine du dossier de
  version** (un type est du schéma — contenu versionné D325) ; **le
  chaînage possible** ; et la correction de l'auteur : « les types custom
  facilitent le déclaratif **mais ne portent pas le graphe de
  conversion** » — le graphe (D120/D123) reste aux types du catalogue,
  les propriétés reprises se résolvent en contraintes du champ (la note
  de convergence de D359 est amendée en conséquence). Toujours ouverts :
  les renommages, `list of`, `to:`.
- **2026-07-23 (suite 3)** — **Le catalogue nominatif, la liste,
  l'adressage (D361–D363)**. **D361** : les noms canoniques sont anglais
  nativement — « les types "réel" ou "tva_intra" n'existent pas dans
  Syncytium » ; le catalogue complet (simples, composés, contenus,
  structurels) est consigné avec les facettes de chacun. **D362** :
  `type: list of text` — les facettes du champ s'appliquent à chaque
  élément. **D363** : l'adressage logique **par points**
  (`<module>.<entité>.<champ>`) — pas la barre oblique, car
  « l'organisation des dossiers peut être finalement libre » : le
  namespace est porté par les déclarations, l'arborescence n'est qu'une
  convention. L'exemple canonique passe à `to: hr.employee`. Le bloc
  `fields` approche de sa complétude — restent les compositions
  (l'agrégat D116) et la contre-vérification des familles.
- **2026-07-23 (suite 4)** — **Le parcours type par type est engagé**
  (« nous allons détailler chaque type porté par Syncytium ») et **le
  socle commun est finalisé (D364–D365)** : la table des dix propriétés
  de tout champ est consignée ; **`validation` peut contenir plusieurs
  règles** — conditionnées par d'autres valeurs de l'enregistrement ou
  par une expression régulière (forme liste en proposition) ; **pas de
  `settings` au champ** — « le champ porte les settings » : propriétés
  directes, la cascade de blocs s'arrête à l'entité (la note D349 et la
  famille 6 sont amendées). Reste en attente : le détail de `text`
  (quatre règles proposées).
- **2026-07-23 (suite 5)** — **Le type `text` (D366–D367)** : **`size` à
  quatre formes** (auto / max / min.. / min..max) et **la taille dans le
  nom du type** (`text[3..10]`) — **le crochet s'affirme comme le
  paramètre en ligne du format** ; mono/multi-ligne déduit, surchargeable
  par `component` ; `mask` validé (« très bien » — déduction + conflit =
  erreur d'ingestion) ; **`searchable` devient un mode** : `strict` /
  `normalized` / `similarity[0.8]` (chacun ouvre un champ de recherche
  propre) et `mutualizable[name]` (champ partagé entre plusieurs champs —
  la « recherche nommée » D227 déclarée côté champs, le seuil D229 en
  paramètre en ligne). Ouvert : le mode du champ de recherche mutualisé.
- **2026-07-23 (suite 6)** — **Le mutualisé arbitré (D368)** : **contient
  normalisé par défaut** (la définition D222/D226 retenue telle quelle),
  et **la similarité déclarable** en second paramètre — « utile pour
  intégrer les fautes de frappe dans une recherche »
  (`mutualizable[who, similarity[0.8]]`). Le type `text` est complet
  (socle D364–D365 + D366–D368). En attente : `integer` (bornes en
  crochet, octets déduits des bornes, `searchable` restreint).
- **2026-07-23 (suite 7)** — **`integer` : le mutualisé par conversion,
  le masque-format (D369–D370)**. **D369, doctrine générale** : si
  `mutualizable` est utilisé sur un champ non textuel, « la recherche va
  s'appuyer sur la conversion du type en texte » — la forme affichée est
  la clé partagée, aucun type exclu. **D370** : l'entier porte un `mask`
  de **format** — `"000000"` (aligné à droite, six chiffres),
  `"00 00 00"` (espace entre deux chiffres) ; le `9` du texte devient le
  `0` du nombre. Restent à valider sur `integer` : les bornes en crochet
  (`integer[0..100]`), les octets déduits des bornes, les modes propres
  (`strict` seul avec le mutualisé ?).
- **2026-07-23 (suite 8)** — **Les modes de recherche de l'entier
  (D371)** : **`range`** rejoint `searchable` — la recherche par **plage
  de valeurs** (types à ordre naturel D125, note) ; `normalized` revient
  à `strict` sur un entier (accepté, équivalent) ; **`similarity`
  autorisé, basé sur la conversion en texte** — la doctrine D369 s'étend :
  la conversion porte tous les modes textuels hors du type texte.
  Toujours à valider : les bornes en crochet, les octets déduits.
- **2026-07-23 (suite 9)** — **`integer` clos (D372)** : **les bornes
  dans le nom du type** (`integer[100]`, `integer[0..100]`,
  `integer[0..]`) ou `min`/`max` explicites ; **les octets dimensionnés
  en fonction des bornes ou des valeurs affectées** — « un peu comme le
  mode auto du texte ». Le deuxième type du parcours est complet
  (D369–D372). Suivant : `decimal`.
- **2026-07-23 (suite 10)** — **`decimal` clos (D373)** : `decimals` en
  **propriété** (défaut : le settings, sinon 2 — une cascade de plus) ;
  **stockage exact ou réel** — l'exact par **entier mis à l'échelle**
  (les décimales converties dans la partie entière, dimensionnement D372,
  « calculs optimisés et performants »), le réel assumant les arrondis ;
  le `mask` étendu aux décimales (séparateurs symboliques rendus selon la
  langue) ; la recherche reprend le jeu de l'entier. En proposition : le
  nom `storage: exact | real` et le défaut `exact`. Suivant : `boolean`.
- **2026-07-23 (suite 11)** — **`storage` validé** (« pour décimal,
  "storage" me convient ») : D373 entièrement clos. **Pause du soir.** En
  attente à la reprise : la proposition `boolean` en quatre points
  (`values` surchargeant les libellés VRAI/FAUX/NUL par langue, tri-état
  découlant de `required`, recherche `strict`/`mutualizable` par le
  libellé D369, composants D281 — toggle sans nul). Puis la suite du
  parcours : `date`, `time`, `datetime`, `duration`, `file`, `enum`, les
  composés, les contenus, les structurels — et les compositions
  (l'agrégat D116).
- **2026-07-24** — **Reprise sur le booléen : le cycle du tri-état
  (D374)** : « une case à cocher à 3 états : **faux → vrai → nul →
  faux**… » — chaque clic avance d'un cran, le nul se ressaisit à la main
  comme les deux autres états. La proposition en cinq points (values des
  libellés, tri-état par `required`, recherche par le libellé, toggle
  sans nul, naissance nul/false) reste en arbitrage pour clore le type.
- **2026-07-24 (suite)** — **La recherche du booléen par le composant
  (D375)** : « une recherche `strict` s'appuie sur une case à cocher ou
  un toggle » — le champ de recherche est le composant du type (la ligne
  D228), le tri-état en recherche visant aussi les lignes nulles
  (doctrine Q47). Le point 3 de la proposition est précisé ; les points
  1, 2, 4, 5 restent à confirmer pour clore le booléen.
- **2026-07-24 (suite 2)** — **Le troisième état dit « tous » (D376)** :
  pour un booléen `required`, la case de recherche tri-état demeure — sa
  position nulle **filtre Vrai & Faux** (aucun filtrage). Le sens de la
  position nulle suit la donnée : optionnel → les lignes nulles (D375),
  obligatoire → « tous ».
- **2026-07-24 (suite 3)** — **`boolean` clos (D377)** : « je valide les
  points » — `values` des libellés par langue, tri-état par `required`,
  la recherche non engagée qui ne filtre rien (réinitialisation, esprit
  D228), les composants D281, la naissance (optionnel → nul, obligatoire
  → `false` sauf `default: true`). Quatrième type complet (D374–D377).
  Suivants : les temporels — `date`, `time`, `datetime`, `duration`.
- **2026-07-24 (suite 4)** — **La virgule du masque de durée (D378)** :
  « une heure en centième, une minute en centième ou une heure en
  dix-millième » — le masque D276 porte deux notations, le sexagésimal
  (`00:00`) et la décimale industrielle (`0.00 h`, `0.00 min`,
  `0.0000 h` — séparateur symbolique rendu selon la langue D373) ;
  l'option de conversion fait le pont vers la valeur canonique unique
  (stockage, exports). Restent les cinq autres points temporels
  (précision en crochet, raw/timestamp, bornes ISO, pas de mask
  date/heure, recherche range).
- **2026-07-24 (suite 5)** — **« Dans les types, il manque la règle du
  tri »** : doctrine proposée (comparaison intrinsèque D125 énoncée à
  chaque type, propriété `sort` pour les variantes, référence triée sur
  son libellé) et **le nul arbitré (D379)** : une **équivalence par
  type** — `boolean` : nul < faux < vrai ; `text` : nul ≡ chaîne vide ;
  `integer` : nul ≡ 0, classé parmi les valeurs. Ma proposition « nul
  toujours en queue » est écartée. En attente : le reste de la doctrine
  du tri, le nul des temporels, les cinq points temporels.
- **2026-07-24 (suite 6)** — **La doctrine du tri complétée (D380)** :
  `decimal` et `duration` — nul ≡ 0 ; la propriété `sort` au socle pour
  les types à variantes (`text` : alphabetical défaut | natural) ; la
  référence triée sur son libellé affiché, le calculé sur sa valeur.
  Restent : le nul des temporels (à leur clôture) et les cinq points
  temporels en attente.
- **2026-07-24 (suite 7)** — **Les temporels clos (D381)** : « ok pour
  tout » — la précision et la nature dans le crochet (`time[hh:mm]`,
  `datetime[raw]` défaut / `datetime[timestamp]`), bornes ISO (le
  dynamique par `validation`), pas de `mask` (le format vient de la
  langue), recherche `strict`/`range`/`mutualizable`, le nul trié en
  tête. Avec D378, `date`/`time`/`datetime`/`duration` sont complets —
  huit types clos sur le parcours. Suivants : `file`, `enum`.
- **2026-07-24 (suite 8)** — **La date à précision (D382)** : `date`
  porte aussi une nature dans le crochet — `date[yyyy-mm-dd]` (défaut),
  `date[yyyy-mm]` (le mois), `date[yyyy-ww]` (la semaine, numérotation
  liée à la langue D279) ; sérialisation ISO à la granularité, calendrier
  au bon grain. La proposition `file` (cinq points) reste en attente.
- **2026-07-24 (suite 9)** — **La nature la plus fine par défaut, le
  masque possible (D383, amende D381)** : sans crochet, le temporel prend
  sa nature la plus fine (`date[yyyy-mm-dd]`, `time[hh:mm:ss.sss]`) ; le
  `mask` redevient possible — par défaut, le masque de la langue
  s'applique (D217/D221), le champ pouvant le surcharger. La proposition
  `file` toujours en attente.
- **2026-07-24 (suite 10)** — **`file` clos (D384)** : `extensions` en
  deux formes — la liste simple ou **le mapping à libellés par langue**
  (`pdf: { fr: facture }` — le champ ne dit plus « pdf accepté » mais
  « la facture », l'écran de dépôt et la documentation D333 s'en
  nourrissent) ; quota acquis, métadonnées automatiques, recherche
  nom+mots-clés, tri sur le nom, le reste au moteur. Neuvième type clos.
  Dernier simple : `enum`.
- **2026-07-24 (suite 11)** — **`image`, un simple dérivé de `file`
  (D385)** : « les extensions sont limitées, la taille de l'image est
  ajustée/retaillée… » — hérite du socle D384 et le restreint ;
  `thumbnail` suit (D286). Le catalogue D361 est reclassé : thumbnail et
  image parmi les simples. La proposition `enum` (cinq points) reste en
  attente ; image/thumbnail se détailleront ensuite.
- **2026-07-24 (suite 12)** — **L'entité désigne son champ image
  (D386)** : « pour que, dans une liste, l'image soit sélectionnable » —
  propriété d'en-tête `image: <champ>` (forme en proposition), le visage
  de l'entité ; ancre le choix par l'image (D284–D285) et la vignette en
  cellule (D286/D293). `enum` toujours en attente.
- **2026-07-24 (suite 13)** — **`enum` : values enrichies, stockage
  numérique (D387)** : `description` sur chaque valeur (l'infobulle en
  complément du libellé) ; l'ordre de déclaration = présentation + tri,
  paramétrable ; **le stockage dépend de la clé** — numérique → entier,
  chaîne → transformée en valeur numérique (optimisation), avec le point
  d'attention des migrations (« l'ajout intercalé d'une valeur » —
  résolution en proposition : codes internes stables, l'intercalé reçoit
  un code nouveau). Restent les points 4–5 (recherche par le composant,
  le nul) pour clore `enum`.
- **2026-07-24 (suite 14)** — **`enum` clos (D388)** : la recherche par
  le composant (liste de sélection, multi-sélection, mutualizable par le
  libellé) et le nul (en tête, entrée `null:` pour la ligne vide). **Les
  dix simples d'origine sont détaillés** — text, integer, decimal,
  boolean, date, time, datetime, duration, file, enum. Suivants :
  `image`/`thumbnail`, puis les composés.
- **2026-07-24 (suite 15)** — **`image`/`thumbnail` clos (D389)** : « ok
  pour les 5 points » — dimensions dans le crochet (`image[1920x1080]`,
  proportions conservées, jamais de recadrage D293), vignette automatique
  au settings, `thumbnail` = la petite taille seule, extensions du jeu
  image, héritage `file` intégral. **Les simples sont au complet** —
  place aux composés (D122).
- **2026-07-25** — **Le placeholder d'une image (D390)** : « une icône
  pour matérialiser le fond d'une image non définie » — le placeholder
  du socle s'interprète par type (valeur de démonstration pour texte et
  nombres, icône de fond ← `resources/` pour image/thumbnail). Rappel
  complet des douze simples livré avant de lancer les composés.
- **2026-07-25 (suite)** — **Les composés arbitrés (D391)** : la règle
  générale actée (héritage du kit de la base, validation intégrée,
  facettes propres) ; `amount` — devises paramétrables, défaut tout
  l'ISO ; `percentage` — bornes, défaut 0..100, hors cadre la
  représentation varie ; `measure` — unités statiques / table de
  référence / libres (défaut) ; `phone` — national (défaut) ou
  international ; **`geolocation` devient triable par la distance à vol
  d'oiseau vers une focale** (défaut : la localisation courante ; sinon
  adresse ou coordonnées — amende D125), la recherche triant par la
  distance à un point de recherche ; `period` hérite du format
  date/heure ; **le nul de chaque composé en premier** (prime
  l'équivalence de la base D379). Les sept à validation intégrée vivent
  de la règle générale.
- **2026-07-25 (suite 2)** — **`focus` validé** (« le focus de la
  géolocalisation est au champ ou hérité du setting » — la cascade
  D360) : les composés sont clos. Suivant : `communication` (D167).
- **2026-07-25 (suite 3)** — **La zone de texte de la géolocalisation
  (D392)** : la valeur porte, en plus des coordonnées, un texte associé
  (l'adresse, le lieu — géocodage D294) ; **le mutualisé s'appuie sur ce
  texte, sinon sur la standardisation des coordonnées en chaîne** — la
  conversion en texte (D369) du type est définie. Rappel complet des
  composés livré.
- **2026-07-25 (suite 4)** — **`communication` clos (D393)** : la
  visibilité se cale sur les niveaux de confidentialité (pas de
  « maximale » — le socle D25/D364 suffit) ; `attachments` référence
  `file`, `image` ou `thumbnail` avec leur kit à plat ; **amende D295** :
  en cellule de liste, une petite icône (thumbnail), au survol les
  derniers échanges résumés — taille paramétrable en nombre de lignes
  (`preview:` en proposition) ; non listable confirmé. Reste en
  suspens : la recherche sur le contenu des messages (proposée, non
  arbitrée).
- **2026-07-25 (suite 5)** — **« La recherche porte sur le contenu des
  messages »** : D393 complété en place — `communication` est
  entièrement clos. Suivants : la `reference` en détail, puis les
  compositions (l'agrégat D116).
- **2026-07-26** — **La référence recadrée (D394–D395)**. Le programme
  relationnel est ouvert (référence, composition, associations) ;
  l'auteur bute sur le point 2 et pose la sémantique : **l'origine porte
  le champ, le lien va de l'origine vers la destination** (« une
  relation parent-enfant avec un seul enfant » — la ligne D353), et
  **l'accès retour n'est jamais déclaré : Syncytium le propose** (ce qui
  éclaire D216). **Le filtre (D395)** : évalué **depuis la
  destination**, il fonctionne à la sélection ; **le contrôle de
  conformité est une option** — condition **immuable** (brisée → donnée
  à valider) ou **liée à la sélection seulement** — avec **le rapport
  des non-conformes** (filtre modifié, champ calculé dérivant). En
  proposition : `check: selection | immutable`, l'accès `origin.`.
  Points 1, 3, 4, 5 de la référence toujours en attente.
- **2026-07-26 (suite)** — **Le raccourci et le `me.` (D396)** : « si le
  type est le nom d'une entité, c'est une référence » —
  `company: hr.company`, le `to` inutile ; et l'origine se lit par
  **`me.`** dans le filtre (« je préfère me ou this à origin » —
  l'exemple D395 corrigé en place). Toujours ouverts : les questions
  2–4 du filtre détaillé (écriture hors IHM, rythme du rapport, l'état
  « à valider »), les points 1, 3, 4, 5 de la référence.
- **2026-07-26 (suite 2)** — **La référence presque close (D397)** :
  l'écriture API soumise au filtre **sauf forçage explicite** ; le
  rythme du rapport = une propriété du champ ; l'état « à valider »
  porté par le moteur, visible et non bloquant ; et les propositions
  restantes validées — **`label:` d'entité** (champ ou gabarit, défaut
  la clé fonctionnelle), recherche et tri sur le libellé affiché,
  composant à recherche/choix par image. **Avant de clore : le
  stockage de la référence, à la demande de l'auteur.**
- **2026-07-26 (suite 3)** — **Le stockage validé (D398) : la référence
  est close.** L'UUID technique de la cible (D142), jamais la clé
  fonctionnelle ni le libellé ; les frontières traduisent (IHM = label,
  CSV = clé fonctionnelle, API = UUID) ; la référence vers un inactif
  reste valide, la sélection ne propose que les actifs ; pas de cascade
  (elle appartient à la composition) ; la dénormalisation au moteur.
  Suivante : **la composition** (l'agrégat D101/D116).
- **2026-07-26 (suite 4)** — **La composition : le possesseur déclare
  (D399)**. Ma proposition (facette `composition: true` sur l'enfant)
  est écartée : « la composition est sur l'entité d'origine, et le type
  est `list of <nom de l'entité>` » — dans `order`, un champ `lines` de
  type `list of order_line` (nom local, D363). L'enfant ne déclare
  rien, l'accès retour automatique (D394). La symétrie : la référence
  pointe un, la composition pointe plusieurs — le même geste. Ouverts :
  tout `list of <entité>` vaut-il composition ? l'imbrication ? les six
  conséquences (cascade, atomicité D101, naissance liée, intra-module
  D116, cascades de configuration, surfaces) reformulées côté parent.
- **2026-07-26 (suite 5)** — **Le trio des liens (D400)** : « oui, c'est
  la définition de la composition » — tout `list of <entité>` = la
  possession forte, avec ses conséquences (cascade de vie, atomicité
  D101, intra-module D116, cascades de configuration, naissance dans la
  liste du parent) ; **`association with <entité>`** pour l'association
  multiple libre (inter-modules D116, sans cascade, la machinerie de
  liaison au moteur) ; **l'imbrication multi-niveaux nécessaire** —
  « facture → indice → ligne », la racine demeurant l'ancre de
  l'agrégat (D101/D111). Le trio : référence = un ; composition =
  plusieurs possédés ; association = plusieurs libres.
- **2026-07-26 (suite 6)** — **L'association reprend les propriétés de
  la référence (D401)** : filter/me., check et rapport, forçage API,
  affichage label/image, recherche et tri sur le libellé, stockage UUID
  — chaque élément lié se comporte comme une référence, seules la
  cardinalité et la liberté du lien changent.
- **2026-07-26 (suite 7)** — **Le lien n-aire (D402)** : les matrices et
  hypercubes (D134) se rapportent au lien — « le champ `modules` de
  l'entité `user` est de type `list of [module, right]` », chaque
  élément étant une combinaison des entités nommées, avec des propriétés
  par entité nommée (le kit D401 pour chacune) ; `association with
  [module, right]` pour la forme libre. Ma proposition `by:` est
  écartée. Ouverts : la valeur portée par la combinaison (la quantité de
  la cellule taille × couleur), l'unicité par combinaison (D134).
- **2026-07-26 (suite 8)** — **La cellule du n-aire (D403)** :
  `list of [size, color] { quantity: integer[0..], … }` — l'accolade
  porte les champs de la cellule avec « toute la puissance des champs
  déjà définis », le moteur modélisant l'objet de façon transparente ;
  **une cellule par combinaison de clé** de la liste ou de
  l'association — l'unicité structurelle. Le programme relationnel
  (référence, composition, association, n-aire) est couvert.
- **2026-07-26 (suite 9)** — **La contre-passe du bloc `fields`** :
  livrée — les sept familles vérifiées (aucune propriété orpheline),
  trois trous détectés (le nom de l'accès retour automatique D394, la
  forme de `report:` D397, le type hook → domaine 6) et l'artefact de
  clôture (customer.yml complet + order.yml) proposé. Première
  correction de l'auteur consignée (**D404**) : **le bloc `validation:`
  est au même niveau que `fields:`** — les règles de l'enregistrement à
  l'entité (en proposition : le champ garde ses règles locales D364).
  L'artefact et les trois trous restent en arbitrage.
- **2026-07-26 (suite 10)** — **L'association conditionnelle (D405)** :
  « il manque un champ dans customer pour matérialiser la liste des
  commandes » — `orders: association with order if order.customer = me`.
  L'`if` fait l'association **dérivée** (la vue navigable D136 :
  jamais stockée, en lecture, la vérité restant la référence) ; sans
  `if`, l'association stockée libre (D400). Le nom vient de la
  déclaration — le trou n° 2 de la contre-passe (le nom de l'accès
  retour) se referme ; `count(orders)` s'écrit naturellement.
- **2026-07-26 (suite 11)** — **La validation à deux niveaux confirmée**
  (« la validation est possible sur un champ ou sur une entité ») :
  D404 acté en place — le champ pour les règles de sa valeur, l'entité
  pour les règles croisées, la trace citant le niveau. Les points
  restants de la contre-passe seront pris **un par un** : `report:`,
  le hook → domaine 6, l'artefact de clôture.
- **2026-07-26 (suite 12)** — **Le rapport affectable (D406)** : « il
  faudra pouvoir affecter les rapports à un utilisateur ou un groupe,
  sous forme de mails ou de notifications » — l'infra D108–D110 et les
  groupes D26–D27 servent ; forme consolidée en proposition
  (`when`/`to`/`by`, défaut `migration`, l'à-la-demande toujours là).
- **2026-07-26 (suite 13)** — **La forme de `report:` validée** (« cette
  forme me convient ») : `when`/`to`/`by`, défaut `migration` — D406
  acté en place. Point suivant : le type hook → domaine 6.
- **2026-07-26 (suite 14)** — **Le `report` en cascade, inactif par
  défaut (D407)** : paramétrable à l'instance, au module, à l'entité ou
  au champ (le plus proche l'emporte, opt-out `report: no`) ; **`report:
  no` est le défaut** — sans déclaration, aucun rapport automatique,
  l'à-la-demande demeurant. Le « défaut migration » de D406 se relit :
  un report activé sans `when` bat au rythme migration. En attente : le
  renvoi du hook au domaine 6, l'artefact de clôture.
- **2026-07-26 (suite 15)** — **D407 mis au propre après revirement** :
  d'abord les corrections (sans `when` = à la demande, ma relecture
  « migration » écartée ; destinataire par défaut = l'administrateur
  D29), puis le revirement — « j'ai changé d'avis » : **le rapport
  existe par défaut** (à la demande, vers l'administrateur), et
  **`report: no` devient l'exclusion explicite** (« pour ne pas
  déclencher de rapport »), posable à tout étage de la cascade. Toujours
  en attente : le hook → domaine 6, l'artefact.
- **2026-07-26 (suite 16)** — **Le nom du type est la clé (D408)** : un
  seul espace de noms — catalogue, personnalisés, entités, et **les
  hooks de type qui ajoutent de nouveaux noms dans Syncytium**,
  exploitables et déclarables comme les types standard ; **le mot-clé
  `hook` ne doit pas apparaître** (ma forme `type: hook.<nom>` écartée).
  Et la pointe finale de l'auteur : **« tous les types proposés sont
  finalement des hooks qui appartiennent à Syncytium »** — le catalogue
  de base = les hooks embarqués, un seul mécanisme de bout en bout (la
  ligne D52), le moteur mangeant sa propre cuisine. La déclaration
  (contrat, code) au domaine 6 ; le doublon de nom = erreur d'ingestion.
  Dernier point de la contre-passe : l'artefact de clôture.
- **2026-07-26 (suite 17)** — **Le type `counter` (D409)** : « a-t-on un
  type counter ? » — le concept existait (D154–D155), l'écriture
  manquait. Le kit : allocation transactionnelle, continuité, `format:`
  gabarit au segment masqué, **`reset:` défini sur la déclaration**
  (« doit être définie » — ma déduction depuis le gabarit écartée),
  jamais saisi ; **attaché au champ par défaut, mutualisable par le
  nom** — `counter[my_counter]` sur plusieurs champs de plusieurs
  entités (le crochet nomme, patron D367). En proposition : le défaut
  `reset: never`, le lieu de déclaration du compteur nommé (le settings
  de l'étage englobant — cascade D360).
- **2026-07-26 (suite 18)** — **L'artefact validé : le bloc `fields`
  est clos (D410)**. « Oui » — customer.yml et order.yml canoniques
  consignés en artefact de clôture, les deux virgules actées (défaut
  `reset: never`, compteur nommé au settings englobant). La contre-passe
  est soldée : sept familles vérifiées, trois trous refermés
  (D405–D408), le compteur au catalogue (D409). La complétude finale
  s'appréciera après tous les domaines (règle du chantier). Question de
  méthode posée : d'autres points au domaine 2, ou ouverture du
  domaine 3 ?
- **2026-07-26 (suite 19 — PR #22 créée)** — Rappel des huit domaines et
  de leur avancement livré (1 livré, 2 en cours de clôture, 3–8 non
  ouverts avec leurs renvois). L'auteur sonde le domaine 2 : **la
  gestion de l'historique** — le fond était acté (Q37, D168–D174, P6),
  l'écriture manquait. **D411** : les valeurs de `history` —
  `perpetual`/`true` (défaut du mode activé), `false`, `temporal[x]`
  (jours), `update[x]` (dernières modifications) ; **la propriété d'une
  entité porte aussi sur les agrégations** (D169). Absent = inactif
  (D168 inchangé). Restent : `visibility:` (D170), l'anticipation
  (D174).
- **2026-07-26 (suite 20)** — **La lecture à date hors couverture
  (D412, amende D174)** : « la propriété assume_current n'est pas
  utile » — la règle canonique : date postérieure à la création →
  **l'état à la dernière valeur connue avant l'horizon de l'historique**
  (non historisée = la valeur courante, rétention dépassée = le plus
  ancien instantané) ; date antérieure à la création → **rien**. La
  dégradation graduelle et déterministe remplace l'anticipation
  déclarée ; l'alerte de D174 perd son objet (note). Reste :
  `visibility:` (D170).
- **2026-07-26 (suite 21)** — **La visibilité validée (D413) :
  l'écriture de l'historisation est complète.** La forme riche
  `history: { mode:, visibility: }` (les groupes D26/D170), la forme
  courte inchangée. D411–D413 donnent leur format à D168–D174. Retour à
  la question pendante : d'autres points au domaine 2 (l'écriture des
  groupes et modules fonctionnels D341 reste le creux identifié), ou
  ouverture du domaine 3.
- **2026-07-26 (suite 22)** — **Les groupes écrits (D414)** :
  `groups.yml` à la racine de version (transverses, patron D349),
  mapping clé → libellés, le nom = la clé, les affectations en base ;
  **« la hiérarchie de groupes est requise, à condition qu'il n'y ait
  pas de cycle »** — `parent:` (le sous-groupe pointe, D353),
  acyclicité vérifiée à l'ingestion (garde-fou D135). En proposition :
  l'appartenance qui remonte, `parent` simple ou liste.
- **2026-07-26 (suite 23)** — **La forme des groupes corrigée (D414
  amendé)** : « l'organisation ne se fait pas via un lien parent — un
  groupe est constitué d'autres groupes » : le contenant déclare ses
  constituants (`groups: [accounting, sales_team]` — la ligne D399, le
  renversement D399 rejoué). La constitution par liste règle les deux
  notes : multi-appartenance naturelle, le membre d'un constituant est
  membre du contenant.
- **2026-07-26 (suite 24)** — Rappels livrés (les modules fonctionnels —
  l'acquis D190–D210/D341 ; l'arborescence complète). **D415 :
  `modules.yml` à la racine de version** — « décrit la liste des
  modules, fait le lien avec les fichiers module.yml » : la liste
  explicite, pas de découverte implicite (la ligne D320/D363). En
  clarification : la portée de « module fonctionnel » dans sa phrase
  (modules du schéma D347 ou modules fonctionnels D190 en dossiers).
- **2026-07-26 (suite 25)** — **L'unification (D416) : « les modules
  fonctionnels = les modules. »** Un seul concept — la donnée et
  l'expérience portées par le même dossier : menu.yml (D351) est LE menu
  (D193), la page d'accueil est celle de D191, l'affectation
  utilisateur ↔ module (D210/D341), la restriction sans extension de
  droits (D190). La distinction terminologique de D190 est dissoute
  (amendée en place) ; le creux de l'arborescence disparaît —
  modules.yml (D415) liste ces modules-là ; l'arborescence consolidée
  est retouchée. Note : le menu peut citer des entités d'autres modules
  (D116).
- **2026-08-10** — **Le glossaire (D417)**. À la reprise, la
  préconisation de l'auteur : « ajouter un volet glossaire dans notre
  documentation technique… un document glossaire.md à part — il nous
  sera utile lors de la rédaction de la documentation » (Q58). Créé :
  **docs/glossaire.md** — une cinquantaine de termes en ordre
  alphabétique, chacun défini et ancré à ses décisions fondatrices (né
  de l'unification D416 : les termes vivent, le glossaire les ancre) ;
  le pointeur ajouté en §1. La liste livrée pour arbitrage —
  enrichissements bienvenus.
- **2026-08-10 (suite)** — **Le glossaire repris en dictionnaire (D417
  amendé)**. Le retour de lecture de l'auteur : « la description est
  très technique… je souhaite des définitions claires et concises » —
  et la règle lexicale : **le terme français nous accompagne dans nos
  échanges, l'anglais est sa traduction dans la configuration**
  (Champ/`field`). Le glossaire est réécrit : définitions de
  dictionnaire en langage courant, le couple français/configuration en
  tête d'entrée, un exemple quand il éclaire, la décision en rappel
  discret. Entrées ajoutées au passage : libellé, infobulle, valeur de
  démonstration, recherche, tri, settings, visages de l'entité.
- **2026-08-11** — **Le glossaire relu et enrichi par l'auteur (D418)** :
  deux commits directs (« Update glossaire.md », « Revise glossary terms
  and definitions »). Les évolutions de fond consignées : le couple
  **Configuration/Description** (les fichiers vs le contexte d'un
  élément — jusqu'à l'interface pour l'IA), **Application** au
  vocabulaire, la clé du compteur unique malgré le reset, les hooks
  élargis (écrans, formats CSV/Excel), les utilisateurs associés par
  technicien **ou passerelle d'authentification**, le rapport des
  non-conformités couvrant les modifications directes en base, les
  ressources élargies (modèles PDF/Word/Excel), les renommages français
  (exécution à blanc, type court, composant graphique, groupe
  d'utilisateurs). Supprimées : Infobulle (absorbée), **Ingestion** —
  l'auteur demande le rappel de nos échanges sur ce terme ;
  « méta-schéma » redéfini (le modèle d'une version) — l'articulation
  avec l'usage Q16 (le format) à clarifier.
- **2026-08-11 (suite)** — **« Ingestion » réintégrée au glossaire**,
  avec la définition de l'auteur : « processus visant à convertir une
  version de configuration en une entrée dans le moteur exploitable par
  toutes les composantes de l'application (API, Écrans, CSV…) »
  (D330). Le terme des « erreurs d'ingestion » est fixé. Reste ouvert :
  l'articulation méta-schéma (le modèle d'une version) / le format de
  description (la grammaire Q16).
- **2026-08-11 (suite 2)** — **« Méta-schéma » tranché** : le mot couvre
  **le modèle porté par une version — modules, entités, champs — ET la
  grammaire utilisée** pour les écrire. Un seul terme pour le tout ; ma
  proposition d'un second terme (« format de description ») est
  écartée ; l'entrée du glossaire est amendée. La relecture du
  glossaire est soldée — le chantier reprend : l'ouverture du
  domaine 3.
- **2026-08-11 (suite 3)** — **Le composé `uuid` (D419)**. La sonde de
  l'auteur (« a-t-on le type UUID ? ») : non — l'UUID interne est hors
  déclaration (D142/Q49). Pour **les identifiants externes** (systèmes
  tiers, clés D178), `uuid` entre aux composés : validation intégrée
  (8-4-4-4-12), stockage compact au moteur (16 octets), recherche et
  tri sur la forme canonique, nul ≡ chaîne vide. La frontière est
  nette : l'identité technique reste invisible et non typée. Catalogue
  (D361) et glossaire complétés.
- **2026-08-12** — **Le domaine 3 ouvert (« les règles et le
  comportement »)** : le périmètre proposé en cinq points (opérations
  D148, déclencheurs D54, notifications D108–D110, tâches D24/D55,
  raffinement d'agrégat D101/D133) ; l'auteur commence par le point 5,
  « le plus clair dans mon esprit ». **D420 — le raffinement écarté,
  par simplification** : après le rappel exact de D399/D133/D90 demandé
  par l'auteur, son arbitrage — la composition est indivisible par
  nature, l'association porte la vie libre, **le mot-clé fait la
  distinction** ; l'agrégat est **toujours** le grain d'écriture
  (D192 règle unique ; D111 par champ et l'échelle D15 rendent le grain
  fin sans objet) ; et ce que « refine » visait de légitime **est le
  `filter`** des liens (D395/D401), déjà acquis. Le §3.5 est amendé en
  place. Restent au domaine 3 : opérations, déclencheurs,
  notifications, tâches.
- **2026-08-12 (suite)** — **La condition de mise à jour : une affaire
  d'entité (D421)** : « la condition de mise à jour porte sur l'entité
  et non sur l'association ou la composition » — le cas « brouillon »
  trouve son foyer : `update:` en en-tête d'entité (expression D90).
  En proposition : lecture seule de fait quand la condition est fausse
  (refus propre D307), la racine couvrant ses compositions (D420), et
  **les opérations qui passent outre** (le chemin explicite — la ligne
  D354). La proposition « opérations » (bloc operations:, when/rights/
  confirm/effects) reste en arbitrage.
- **2026-08-12 (suite 2)** — **Le statut d'état couvre le CRUD entier
  (D422)** : le cycle de vie rejoint la condition de mise à jour, et
  « le statut ne porte pas que sur la modification : il concerne tous
  les éléments du CRUD — création d'un sous-composant,
  lecture/consultation, mise à jour, suppression ». Forme en
  proposition : `crud: [create, read, update, delete]` porté par chaque
  valeur du cycle (énuméré D387) ou chaque état hiérarchique (D353) ;
  absent = tout permis ; read absent = l'état masque ; l'en-tête
  d'entité garde les formes libres (D421), les deux déclarés = erreur
  d'ingestion ; les opérations passent outre. En arbitrage : la forme
  `crud:`, le défaut, la sémantique du read.
- **2026-08-12 (suite 3)** — **La propriété se nomme `allow` (D422
  amendé)** : « plutôt que les mots update, create, read ou delete, je
  propose allow, qui permet de définir l'une ou l'autre des valeurs ou
  des combinaisons » — `allow: [read, delete]` : l'état qui se consulte
  et se purge sans se modifier. Reste en arbitrage : le sort de la
  forme libre `update: <expression>` de D421 (le cycle + `allow`
  couvrent-ils tout ?).
- **2026-08-12 (suite 4)** — **Les deux formes conservées, exclusives
  (D423)** : le cycle suffira le plus souvent, mais « quelques cas
  particuliers peuvent nécessiter une forme libre — pour éviter de
  faire un hook inutile, je préfère conserver les 2 possibilités ; par
  contre, le technicien devra choisir : les 2 simultanément ne seront
  pas autorisés » (erreur à l'ingestion). Forme consignée : un nom
  unique `allow` à deux foyers — la liste de verbes par état (D422) ou
  le bloc verbe → expression en en-tête d'entité (le `update:` de D421
  s'y fond). D421/D422 clos. Restent au domaine 3 : les opérations (en
  arbitrage), les déclencheurs, les notifications, les tâches.
- **2026-08-12 (suite 5)** — **Focus cycle de vie — `states` désigne le
  porteur (D424)**. La vue d'ensemble livrée (trois cycles, le
  mouvement, les interactions, trois creux) ; l'auteur tranche le
  premier creux : « un état hiérarchique est déjà un statut » — pas de
  cumul ; l'entité sans hiérarchie **réutilise le bloc `states`** pour
  désigner son champ énuméré (`states: status`). Un seul statut par
  entité, deux sources. Notes en proposition : champ non énuméré =
  erreur, deux sources = erreur, la naissance = le `default`. Restent
  du focus : le graphe des transitions (creux 2 — les passages légaux
  déclarés ou la liberté des opérations).
- **2026-08-12 (suite 6)** — **Le graphe déclaré, `promote` en tableau
  (D425)**. Le rappel exact de D353–D355 livré à sa demande ; la
  transposition à l'énuméré-cycle validée par la construction — chaque
  valeur déclare ses passages, hors graphe = refus — et l'arbitrage :
  « le promote est un tableau, car nous pouvons avoir le choix entre
  plusieurs états ». Notes en proposition : demote en tableau, l'ordre
  du tableau départage les when simultanés, le cliquet inchangé, le
  tableau vaut pour la hiérarchie aussi. Ouverts : la naissance directe
  à une valeur (D355 transposé), les notes.
- **2026-08-12 (suite 7)** — **Les deux régimes d'une transition (D426 —
  clôt le focus cycle de vie)**. Les trois virgules validées (« les 3
  points me vont ») : demote en tableau, l'ordre départage, la
  naissance libre. Puis les deux temps de l'auteur : **sans `when` = la
  transition libre** — le composant de sélection devient **navigateur du
  graphe** (n'offre que les cibles promote atteignables) ; **« la
  présence du when marquera une opération (un bouton ou une action) »**
  — le chemin nommé, gardé par le when, tracé. Le demote jamais en
  sélection libre. Question posée : l'articulation avec le cliquet
  automatique de D354 (le when-expression déclenche-t-il encore de
  lui-même, ou tout when passe-t-il par l'acte ?). Et le troisième
  temps de l'auteur : **le composant du statut se déduit de la
  déclaration** — « liste de valeurs dont la liste dépend de l'état, ou
  un champ non modifiable avec des boutons ajoutés » — la liste
  navigatrice (sans when), le champ en lecture + boutons (avec when),
  le graphe mixte combine ; la forme jamais déclarée, lue dans le
  graphe (l'esprit D366).
- **2026-08-12 (suite 8)** — **Le triptyque du `when` (D427) : le focus
  cycle de vie est soldé (D420–D427)**. « Le when peut faire référence
  à une opération ou à une condition » : sans when = libre (la liste
  navigatrice) ; when-opération = l'acte (un bouton — « nous allons y
  venir ») ; when-expression = **l'automatisme, le cliquet D354
  intact** (déduit d'un élément de l'entité — count(orders) > 0). Trois
  écritures, trois vécus, un seul graphe. Suivant : les opérations (la
  proposition en arbitrage).
- **2026-08-12 (suite 9)** — **L'opération porte sa nature (D428)** :
  les deux exemples de l'auteur — `when: count(lines) > 0` en ligne
  dans un promote = **l'opération automatique abrégée** ;
  `when: confirm` = l'opération nommée, dont la nature se lit dans SA
  déclaration : **avec `when` = automatique** (le when est son
  déclencheur, jamais une simple garde), **sans `when` = un bouton /
  une fonction API**. Le triptyque D427 raffiné en place. **« Cycle de
  vie » et « État hiérarchique » ajoutés au glossaire** à sa demande.
  La proposition opérations à re-livrer sous ce modèle.
- **2026-08-12 (suite 10)** — **La trace des actions = l'historisation
  (D429)** : « les actions sont tracées si l'entité possède un
  historique » — l'instantané porte l'acte (auteur, canal, motif D169),
  sans historique pas de trace, aucune machinerie séparée. La question
  du bouton-sous-condition reformulée explicitement (le when étant pris
  par l'automatisme, comment griser « Confirmer » tant que la commande
  est vide) — trois options posées, recommandation : la condition dans
  le graphe via le `if` du langage.
- **2026-08-12 (suite 11)** — **La garde du bouton : le `if` au graphe
  (D430)** : « ok pour ta proposition » —
  `when: confirm if count(lines) > 0` : le passage n'est légal que si
  la condition tient, le bouton se grise, l'API refuse proprement ;
  aucune propriété nouvelle, la garde vit où la transition vit. Le
  modèle transitions/opérations est complet — reste la forme finale du
  bloc `operations:` (labels/rights/confirm/effects, l'invocation,
  le passe-outre) à valider d'un bloc.
- **2026-08-12 (suite 12)** — **`validate: true` par défaut (D431)**.
  La question de l'auteur (« qu'entends-tu par confirm: true ? ») ; la
  réponse — le patron D196 généralisé (lecture seule +
  confirmer/annuler, jamais de popup) ; ses deux arbitrages : **le
  défaut s'inverse** (la relecture est la règle, `validate: false` à
  déclarer pour l'exécution directe) et **la propriété se nomme
  `validate`** (« me convient mieux que confirm »). Les opérations
  automatiques non concernées. Restent les points 1, 2, 4, 5 du bloc
  operations.
- **2026-08-12 (suite 13)** — **Les opérations closes (D432)** : le
  bloc `operations:` au même niveau que fields/validation (mapping
  ordonné = l'ordre des boutons) ; jamais d'effet d'état ; `effects:`
  ordonnés — notify, document, set, et **function** (« l'appel d'une
  fonction interne à Syncytium, présente dans un catalogue ou dans une
  liste de fonctions fournie en hook ») ; **disponible partout par
  défaut**, l'exclusion d'interface déclarable (un écran ou l'API —
  `except:` en proposition). Le point 1 du domaine 3 est soldé —
  restent : les déclencheurs calendaires, les notifications
  déclarées, les tâches.
- **2026-08-12 (suite 14)** — **Le changement d'état, opération du
  catalogue (D433) — Q60 ouverte.** « Une opération ne servira pas
  uniquement à un changement d'état : un changement d'état est une des
  opérations disponibles au catalogue, et c'est l'opération par
  défaut » — la ligne D408 étendue aux opérations. L'inventaire du
  catalogue des fonctions/opérations = **un point ultérieur → Q60**
  (§10). En attente : les trois arbitrages livrés (le calendaire
  `every:`, les notifications par simplification, les tâches
  `background:`).
- **2026-08-12 (suite 15)** — **Le calendaire riche (D434)** : « le
  calendaire est plus riche » — `every:` en durées (5min/2h/2d/2w/1m),
  raccourcis (daily/weekly/monthly), **le crochet précisant les
  moments** (daily[08:00], weekly[tuesday at 15:30], moments multiples
  séparés par virgules), les heures en **UTC du serveur**. Notes : sans
  crochet le moment est au moteur, le when: du rapport D406 s'aligne.
  Restent : les notifications par simplification, les tâches
  background.
- **2026-08-12 (suite 16)** — **`every: continuous`, le défaut (D435)** :
  le mot cherché existait — « à chaque mise à jour d'un enregistrement
  de l'entité » = `continuous`, le même mot que le rapport (D406), « on
  garde continuous » — **et il est par défaut** (`every:` absent =
  continuous). Le temporel exige son rythme calendaire déclaré.
  Restent : les notifications par simplification, les tâches
  background.
- **2026-08-12 (suite 17)** — **Les points 3 et 4 du domaine 3 soldés
  (D436)**. Les notifications : « pour le moment, je ne vois pas de
  nouveaux éléments » — la simplification (l'opération automatique +
  notify couvre tout). Les tâches : **`mode` plutôt que `background`** —
  `synchronous` (interface en pause, barre de progression, attente),
  `asynchronous` (enregistrée, déclenchée dès que le serveur peut — la
  file D24/D55), **`await[+3h]` / `await[+2d at 08:00]`** (le décalage
  avant lancement — le + relatif, le at calendaire). Défaut
  `synchronous` en proposition. **Les cinq points du domaine 3 sont
  couverts** — la question de complétude est posée.
- **2026-08-12 (suite 18 — PR #24 créée)** — **Le domaine 4 ouvert
  (« les surfaces »), l'ancrage arbitré (D437)**. Le périmètre en huit
  points validé (« le plan me convient ») ; le point 1 : **les cinq
  blocs dans un bloc `ihm`** (lists, forms, summary, charts, widgets)
  et **les trois étages de complexité** — rien (les défauts D186), un
  fichier unique (le bloc en ligne), un dossier par entité (entity.yml
  + un fichier par bloc : lists.yml, forms.yml, summary.yml,
  charts.yml, widgets.yml). Notes à trancher : « ihm » vs `ui` (D335),
  et les points 2–4 de l'ancrage (la première déclarée = le défaut, le
  socle des surfaces, la déclaration remplace le défaut).
- **2026-08-12 (suite 19)** — **Le point 1 du domaine 4 clos (D438)** :
  le bloc se nomme **`gui`** (« gui me convient » — D437 amendé en
  place) ; la première déclarée = la surface par défaut ; le socle des
  surfaces = le patron des champs (« nous avons défini ce qu'il faut,
  sauf oubli ») ; la déclaration remplace le défaut. Suivant : le menu
  (point 2 — le différé D351).
- **2026-08-12 (suite 20)** — **Le menu : la syntaxe d'adressage
  (D439)**. Ma proposition de blocs typés ne convenait pas — la vision
  de l'auteur : le menu reste une liste ordonnée filtrée par la
  confidentialité (« ça ne change pas »), et **chaque entrée est une
  adresse** — `<module>.<entité>` (liste par défaut), `[<liste>]`
  (nommée), `.<opération>`, `[+<formulaire>]` (création, nom
  optionnel), `[@<wizard>]`, `<module>[<dashboard>]` (**le dashboard
  défini au niveau du module**), `<nom>:` (sous-menu, libellé déclaré
  au module). **`icon` rejoint le socle des surfaces** (menu
  « moderne ») — le menu reste une pure liste d'adresses. À trancher :
  les libellés de sous-menus au module, le bloc dashboards (point 6).
- **2026-08-12 (suite 22)** — **Le dictionnaire de libellés (D440) : le
  point 2 est clos.** « Les labels sont utilisés au-delà du menu — dans
  un champ, les libellés peuvent y faire référence » : le bloc
  `labels:` du module (externalisable), **la chaîne valant référence et
  le mapping valant inline** (la forme courte D356, l'esprit des
  variables D323). Le dashboard renvoyé au point 6. Suivant : la liste
  (point 3).
- **2026-08-12 (suite 23)** — **Le `searchable` de liste (D441)** : la
  proposition « liste » livrée (columns/filter/sort/editable) ;
  l'auteur arbitre la recherche — « une propriété searchable décrit la
  liste des champs ou des noms mutualisés à positionner dans un filtre
  de tri ; par défaut, tous les champs sont inclus » (le champ déclare
  comment D367, la liste déclare lesquels ; le défaut de D227 amendé).
  Restent : columns/filter/sort, le défaut d'editable (tout ouvert
  D206 ou tout fermé ?).
- **2026-08-12 (suite 24)** — **La liste close (D442–D443)**. Les
  quatre arbitrages : columns dans l'ordre d'affichage ; filter par
  expressions ; **le tri PAR COLONNE** — sans `sort:` toutes triables ;
  avec, la colonne présente porte **sa cascade de clés secondaires**
  (`sort: { numero: asc, nom: [prenom, numero] }` — prénom absent = non
  triable), `+`/`-` croissant par défaut ; **editable à défaut
  readonly** (amende **D266** — ma première référence D206 corrigée).
  Puis **la colonne riche (D443)** : « le style, l'alignement et la
  dimension » — forme courte ou riche, align au défaut du type, width,
  style relevant du thème. Le point 3 du domaine 4 est clos. Suivant :
  le formulaire (point 4).
- **2026-08-12 (suite 25)** — **La forme abrégée délègue au moteur
  (D443 complété)** : « Syncytium décide alors du format par défaut et
  de la dimension de la colonne en fonction de son type » — le masque
  du champ, l'alignement du type, la largeur du contenu (l'esprit
  D372). La proposition « formulaire » (blocks section/tab,
  header/footer, history, surcharges) reste en arbitrage.
- **2026-08-12 (suite 26)** — **La liste raffinée, l'artefact consigné
  (D444)**. La relecture de la description canonique : **l'opération en
  colonne dédiée** (l'icône à trois états — actionnable / non visible /
  non actionnable) ; **l'export** — colonnes visibles + complémentaires,
  **le CSV en un fichier par type de composants** (customer.csv,
  orders.csv — la symétrie Q55), **l'Excel en un fichier à onglets,
  surchargeable par un modèle**, et **le tri d'export** (l'écriture de
  l'affichage, figée) ; **l'auto-rafraîchissement** (pas de bouton) ; la
  confidentialité = non visible et non triable ; le responsive
  conforme ; **la pagination à indicateurs** (« 21–40 sur 156 »).
  L'exemple canonique complet est gravé. La proposition « formulaire »
  toujours en arbitrage.
- **2026-08-12 (suite 27)** — **Les comportements de la liste (D445)** :
  `selection: one | multiple` ; la création en bouton du cadre/entête
  (au même titre que les filtres) ; la modification au double-clic
  (ligne non readonly) ; la liste en lecture seule = le double-clic
  consulte ; **la suppression à deux visages** — une ligne = le
  formulaire en lecture seule + confirmation (D196), plusieurs lignes =
  la popup précisant le nombre (l'exception assumée pour la masse,
  D202) ; **l'opération de masse** appliquée à toutes les lignes
  sélectionnées (D432 × D202). Le formulaire (point 4) toujours en
  arbitrage.
- **2026-08-12 (suite 28)** — **`sizable` (D446)** : « une liste est un
  composant graphique complet et complexe, dont la lisibilité doit
  s'adapter au format d'affichage » — le redimensionnement des colonnes
  gouverné : `none` / `auto` / `manual` / `auto+manual`, l'ajustement
  par l'utilisateur seulement si `manual` ; défaut `auto` en
  proposition. Le formulaire (point 4) toujours en arbitrage.
- **2026-08-12 (suite 29)** — **La préséance du type et la colonne
  fantôme (D447)** : les propriétés d'affichage du type priment par
  défaut, la colonne de liste surcharge (la chaîne type → colonne, le
  pendant de D270) ; et **la colonne présente, non affichée et non
  visible** — jamais révélée même en sizable manual — « utile pour un
  export CSV simplifié sans décrire les mêmes colonnes que
  l'affichage » (`visible: false` en proposition ; l'export prend les
  présentes). Le formulaire (point 4) toujours en arbitrage.
- **2026-08-12 (suite 30)** — **Les exemples canoniques de la préséance
  (D447 complété)** : « un montant affiche la devise et s'affiche avec
  un alignement à droite, un toggle est centré, un texte court est
  aligné à gauche, un texte sur plusieurs lignes s'affiche en
  justifié… » — gravés dans le bloc.
- **2026-08-12 (suite 31)** — **La grammaire commune des surfaces
  (D448)**. L'auteur garde la main sur la liste (« je pourrais
  potentiellement y revenir ») et ouvre forms/summary/widgets par leur
  socle partagé : « ces 3 éléments vont partager un vocabulaire et une
  grammaire commune ». La base validée (socle, header/footer à
  gabarits, mode, blocks section/tab au contenu fields/charts ; les
  spécialisations par restriction ; le gabarit PDF D253 et le wizard
  D233 en réutilisateurs) — « une base que nous allons **reformuler et
  étoffer** ». L'arbitrage surface par surface suit.
- **2026-08-12 (suite 32)** — **Les forms d'abord, la grammaire entière
  livrée — et reformulée (D449)**. Les trois recadrages : l'icône
  jamais dans `labels` (le dictionnaire D440 amendé — « icon fait
  doublon avec l'icon au rang au-dessus ») ; « un formulaire est conçu
  pour un mode d'écran » (la ligne D206/D250) ; **la structure en
  quatre parties** — le titre (zone de texte à gabarit), l'entête, le
  corps et le pied (des blocs). À trancher : la propriété d'écran visé
  et son défaut, les blocs permis en entête/pied.
- **2026-08-12 (suite 33)** — **`screen` en tableau, les blocs sont des
  composants (D450)** : `screen: [pc, tablet]` pour la compatibilité de
  plusieurs affichages, défaut `[pc paysage]` (D250) ; l'entête, le
  corps et le pied acceptent sections **et** onglets — le principe de
  fond : « un composant graphique est un composant type à signature
  commune qui assure un rendu — une section, **une grille**, des
  onglets sont des composants » : les blocs = des composants-conteneurs
  du catalogue (section, grid, tabs…), extensible (D408/D263),
  l'inventaire rejoignant Q60.
- **2026-08-12 (suite 34)** — **Le formulaire arborescent (D451)** :
  « un formulaire est décrit de façon arborescente ; un nœud est un
  composant qui affiche un composé graphique basé sur l'enregistrement
  d'une entité, d'un champ et des opérations » — un seul arbre unifiant
  conteneurs, feuilles-champs et boutons d'opérations, la signature
  commune (D450) à chaque étage, l'imbrication libre, les quatre
  parties (D449) en branches maîtresses.
- **2026-08-12 (suite 35)** — **Le composant de saisie personnalisé
  (D452)** : « section, grid ou tab sont fournis par Syncytium — dans
  un cas d'usage, j'ai besoin de construire un composant de saisie
  personnalisée et détaillée qui ne pourra pas se matérialiser avec les
  éléments de base » : le hook de composant (D263) devient un nœud
  comme les autres dans l'arbre (D451), au nom sans « hook » (D408) ;
  **l'écriture repasse toujours par les champs et leurs règles**
  (validation, allow, concurrence) — jamais de contournement du
  modèle ; le contrat au domaine 6.
- **2026-08-12 (suite 36)** — **Les propriétés du `form` (D453)** : la
  zone de texte à gabarit **déclinable par langue** (chaîne unique ou
  mapping — vaut pour tous les gabarits D253/D449) ;
  **`mode: updatable` (défaut) | `read-only`** ; **`history: false`
  pour désactiver l'onglet d'une entité historisée** (défaut true,
  toujours dernier). Reste à l'étoffage : la signature des nœuds, la
  grille, la `selection:` des références (D215), la `list:` des
  compositions (D216).
- **2026-08-12 (suite 37)** — **La surimpression et sa dimension
  (D454)** : « le formulaire peut s'afficher en surimpression de
  l'écran — la totalité ou une portion » ; « nous ajoutons une
  dimension (par défaut : 100 % de l'écran) » — la surimpression est le
  mode d'affichage du formulaire, `dimension:` en règle la portée
  (`dimension: 70%` — le patron de la visionneuse D293).
- **2026-08-12 (suite 38 — pause)** — **La signature des nœuds en
  arbitrage.** La proposition livrée : le type-clé (section, grid,
  tabs/tab, champ, opération, sur-mesure — le nom est la clé D408), le
  socle optionnel, `visible:` (condition d'affichage, expression D90 —
  proposition), le contenu et ses abréviations (`fields:`/`charts:`
  homogènes), les propriétés propres par type (grid.columns…), le
  contexte reçu jamais déclaré (D451). **`children` est écarté**
  (« je préfère content ou items ») — ma recommandation : **`items`**
  (le mot de l'auteur, D439) ; **le choix content/items reste à
  trancher à la reprise**, puis la signature entière se consignera.
- **2026-08-13** — **Le modèle unifié du composant graphique (D455)**.
  À la reprise, `items` validé — et la dictée de fond : un formulaire =
  un composant graphique (un nom — form/summary/wizard/widget,
  extensible par hook au nom unique ; des propriétés ; des items —
  **pages**, header, body, footer ; **un contexte** — l'enregistrement,
  l'origine de l'appel, l'utilisateur) ; l'emboîtement libre (un wizard
  dans une page, des références en widgets, des listes) ; **le graphe
  acyclique parcouru de la feuille à la racine**, les composants
  recevant du pré-analysé ; « le formulaire n'est qu'une
  matérialisation » du nœud — l'approche vaut pour tous les composants
  des facettes de types, et **« une facette peut être vue comme un
  hook »** (catalogue fourni par Syncytium) — la doctrine D408 totale.
  Et l'analogie de l'auteur : **« cela s'apparente à la notion de web
  components (ou à une extension des web components) utilisés par les
  navigateurs web »** — consignée, avec l'écho pour Q7 (la pile
  technique : les custom elements comme substrat naturel de la GUI).
- **2026-08-13 (suite)** — **Le catalogue des composants arbitré
  (D456)**. L'inventaire en cinq familles (surfaces, conteneurs,
  feuilles par type, graphiques, actes) validé avec cinq retouches :
  **+ `template`** (PDF, Word — la génération PDF proposée sur cette
  base) ; **`pages`/`page`/`section` redéfinis** (« page est un saut de
  page ; pages est une section pouvant contenir un header, page(s) et
  footer ; une section est un regroupement potentiellement nommé ») ;
  **+ `carousel`** (viewer d'images) ; les graphiques couvrent (famille
  ouverte) ; **l'acte à trois déclencheurs** — un bouton, un icône, le
  passage à l'étape suivante (l'utilisateur acte une opération). La
  description élément par élément s'ouvre.
- **2026-08-13 (suite 2)** — **Le document dédié et le modèle de fiche
  (D457)**. Le parcours commence par les feuilles (« les plus
  basiques » — le point 3 ; « il manquait la description ») ; le modèle
  de fiche en **neuf rubriques** proposé et **validé** (« la fiche de
  description me convient ») ; l'arbitrage : **« groupons les
  composants dans un document dédié — cela préparera la phase de
  documentation »** (Q58) → **docs/composants.md** créé (le modèle,
  l'inventaire D456, la fiche `checkbox` en première), le pointeur en
  §1 (le patron du glossaire D417).
- **2026-08-13 (suite 3)** — **Les renommages des feuilles (D458)** :
  `text-zone` → `text`, `number-zone` → `number`, `list-editor` →
  `list` (« suffit ») — et l'élégance en cadeau : **le composant par
  défaut d'un type porte le nom du type** (la table D64 devient
  nominale — text rend text) ; les espaces de noms se résolvent par le
  contexte (`type:` vs `component:`), les collisions assumées.
  composants.md est à jour.
- **2026-08-13 (suite 4)** — **Le type-hook doit se représenter
  (D459)** : « un type ajouté via le hook doit inclure une phase de
  représentation graphique — ou via un document PDF, Word… » — aucun
  type sans visage : le composant d'écran et/ou le rendu de document
  (template D456) ; la facette d'affichage d'un type hooké est due
  (D455) ; le contrat au domaine 6.
- **2026-08-13 (suite 5)** — **Le parcours des feuilles, une par une**
  (« pas de groupement ») : la fiche `toggle` livrée ; puis **le
  protocole enrichi à la demande de l'auteur** — les neuf rubriques
  **et la validation par un exemple de configuration** avant la feuille
  suivante : **la rubrique 10 entre au modèle** (composants.md), et
  `checkbox` est reprise avec son exemple complet (le champ obligatoire
  et l'optionnel tri-état, la liste — searchable/editable — et le
  formulaire). En attente : sa validation de l'exemple checkbox, puis
  l'exemple toggle.
- **2026-08-13 (suite 6)** — **`field[<nom>]` et la surcharge de
  représentation (D460)**. Le retour sur l'exemple checkbox : « la
  description du champ est claire, la partie gui a besoin d'être
  complétée » — la forme explicite `field[active]` (l'ambiguïté
  champ/composant levée, nécessaire), et la surcharge de représentation
  au nœud (le style par état — vide = faux, coché = vrai, le nul — la
  taille…). L'exemple checkbox repris dans composants.md ; en attente :
  sa validation, la question des columns (la même explicitation ?).
- **2026-08-13 (suite 7)** — **Un seul vocabulaire de représentation
  (D461)** : `field[active]` confirmé ; « la description du type
  pouvait contenir des informations sur sa représentation avec
  component — ici, nous reprenons les mêmes propriétés, qui surchargent
  les propriétés vues sur la définition du champ » — les mêmes mots aux
  trois étages (type → champ → nœud gui), le plus proche l'emporte.
  Toujours ouvertes : la question des columns, la validation finale de
  l'exemple checkbox.
- **2026-08-13 (suite 8)** — **Les colonnes au nom nu (D462)** :
  « l'ambiguïté n'est pas présente — ce sont des noms de champs, les
  opérations sont des verbes en général » ; la préconisation au
  technicien (une action = un verbe — jamais un contrôle, « Syncytium
  n'apporte pas de contrôles », la documentation Q58) ; la préséance :
  **si un nom de champ = un nom d'opération, le champ l'emporte**.
  Reste : la validation finale de l'exemple checkbox.
- **2026-08-13 (suite 9)** — **`checkbox` validée** (« je valide la
  checkbox ») : la première fiche complète du protocole (neuf rubriques
  + l'exemple). **L'exemple de `toggle` livré** (le champ obligatoire à
  `component: toggle`, les values, la liste — filtre vrai/faux,
  bascule en ligne — le nœud à `size:`) ; en attente de validation.
- **2026-08-13 (suite 10)** — **`component: toggle` au nœud aussi** :
  la précision de l'auteur — « component: toggle peut également être
  présent sous field » — la cascade D461 explicitée au troisième étage
  dans l'exemple (le formulaire seul bascule en toggle, ailleurs le
  champ garde son composant).
- **2026-08-13 (suite 11)** — **`toggle` validé** (« ok pour toggle ») ;
  **la fiche `text` livrée** — les trois parties (D271), le
  mono/multi déduit, la post-zone venue du type, **`lines:`** (les
  lignes avant « voir plus » — nom en proposition), le justifié
  multi-lignes (D447), les modes du thème E, la recherche D367–D368 ;
  l'exemple de configuration joint. En attente de validation.
- **2026-08-13 (suite 12)** — **`password` (D463)** puis **`shortcut`
  (D464)** : la sonde « avons-nous un type password ? » → le composé
  aux garanties structurelles (l'empreinte jamais le clair D33,
  write-only, exclusions absolues — « la facette décrite me
  convient ») ; et le raccourci du texte — **`shortcut:`** au lieu de
  `lines` : `lines`/`icon`/`label` (par langue), le défaut traduit du
  moteur sinon. La fiche `text` reprise ; virgule ouverte : `label` vs
  `labels` (l'harmonisation). En attente : la validation de `text`.
- **2026-08-13 (suite 13)** — **Le triptyque label/title/labels
  (D465)** : « remplaçons labels par label, à l'exception du catalogue
  de libellés » — l'objection de la collision D397 levée par le
  renommage du visage : **`label` = les libellés par langue partout ;
  le visage devient `title`** (cohérent avec le formulaire — « la
  propriété title d'une entité sera utilisable sur un formulaire et
  surchargeable ») ; **`labels` = le dictionnaire du module seul**.
  Renommage appliqué : conception (43 occurrences en ligne + le socle
  D364 + les artefacts), glossaire (Libellé, Visages), composants (7).
  En attente : la validation de la fiche `text`.
- **2026-08-13 (suite 14)** — **Le parcours des fiches avance** :
  `text` validée (exemple à l'appui — le protocole corrigé : la
  validation se demande l'exemple présenté dans l'échange), `number`
  validée, `calculator` validée, `gauge` validée, **`fuel` validée avec
  sa virgule** (le cadran illustre, la saisie redevient number en
  modification). Et **le fond gradué (D466)** : « un fond gradué d'un
  champ en fonction de la valeur d'un autre champ borné » — la jauge en
  fond de cellule (`fill:` en proposition — le nom à trancher).
- **2026-08-13 (suite 15)** — **Les couleurs de jauge (D467)** : « les
  couleurs à afficher doivent être spécifiées » — le dégradé min → max
  (défaut : du rouge au vert) ou la couleur par seuil (rouge, orange,
  vert) ; la propriété `colors:` vaut pour gauge, fuel et le fond
  gradué (D466), aux trois étages (D461). Les fiches gauge et fuel
  complétées. Ouverts : le nom du fond gradué (fill ?), la fiche
  slider.
- **2026-08-13 (suite 16)** — **Le parcours file** : `background` acté
  (D466 amendé) ; les fiches `slider`, `clock`, `calendar`, `dropdown`
  validées une à une, exemple à l'appui ; la fiche `radios` livrée — et
  **le seuil des radios tranché (D468)** : « un élément de la
  configuration générale — il est possible de définir 3, 5 ou 10 selon
  les besoins » (le settings, le pendant du seuil D366 ; le repli
  dropdown en note). En attente : la validation de `radios`.
- **2026-08-13 (suite 17)** — Le parcours file : `radios` et `icons`
  validées (**`icon-set` renommé `icons`** — la préférence de
  l'auteur, 6 occurrences reprises) ; la fiche `record-picker` livrée
  (le sélecteur de référence — filter/me., le title de la cible D465,
  les actifs seuls D398, `selection:` D215, CSV = la clé
  fonctionnelle). En attente : sa validation.
- **2026-08-13 (suite 18)** — **`record-picker` validé et enrichi
  (D469)** : `anchor:` (centre de l'écran, à droite du champ, à la
  place du champ) et `dimension:` (plein écran, pourcentage en largeur
  et hauteur — la réutilisation de D454). La fiche complétée ;
  suivante : `image-picker`.
- **2026-08-13 (suite 19)** — **La famille `picker` pointée (D470)** :
  « picker me convient, mais je propose plutôt picker.record,
  picker.image et picker.file » — le point du namespace (D363) gagne
  les noms de composants, `file-drop` renommé ; la porte ouverte aux
  autres familles (chart.* en note). L'inventaire et les fiches
  repris ; **la fiche `picker.image` livrée** (le choix par l'image —
  la cible au visage `image:` D386 exigé, les vignettes, le plein écran
  empilé sur smartphone, anchor/dimension de la famille). En attente de
  validation.
- **2026-08-13 (suite 20)** — **La sélection des pickers, déduite du
  lien (D470 complété)** : « pour les 3 pickers, nous pouvons avoir une
  sélection unique ou une sélection multiple — cas des références, des
  listes ou des associations » — unique pour la référence, multiple
  pour la liste et l'association (le vocabulaire D445, la déduction
  D366). Les fiches picker.record et picker.image complétées.
- **2026-08-13 (suite 21)** — **Les trois présentations du picker
  (D471)** : « picker.image est un dérivé de picker.record » — la
  sélection par **la liste** (nommée, D215), par **les identifiants**
  (les clés fonctionnelles, D357) ou par **les images** (les visages,
  D386 — la photo d'un profil, l'image d'un aliment) ; picker.record
  porte liste et identifiants (`by:` en proposition), picker.image fixe
  les images en héritant tout. Les fiches mises à jour.
- **2026-08-13 (suite 22)** — **`picker.image` s'efface (D472)** : la
  simplification — « picker.record avec un composant matérialisant la
  liste de sélection : le nom de la liste, ou le nom du champ
  représentant une image de l'enregistrement » — une seule propriété,
  sa valeur dit la présentation (liste nommée → la liste D215 ;
  champ-image → la galerie D386). Virgule : `selection:` élargi plutôt
  que `component:` (la collision D461) — en proposition ; les fiches à
  reprendre après son arbitrage.
- **2026-08-13 (suite 23)** — **La famille picker recomposée (D473)** :
  picker.file = un ou plusieurs fichiers quelconques (le défaut de
  file) ; **picker.image = un ou plusieurs fichiers IMAGES** (les
  formats exploitables par Syncytium — le défaut d'image/thumbnail,
  dérivé de picker.file : appareil photo, galerie, aperçu D292–D293) ;
  l'ancien picker.image (la référence par l'image) fondu dans
  picker.record (D472). La fiche picker.image réécrite au nouveau
  sens ; en attente : la virgule selection:/component: (D472), les
  validations.
- **2026-08-13 (suite 24)** — **`selection` = le nombre, `by` = la
  présentation (D474)** : « la propriété selection définit le nombre
  d'éléments à sélectionner : 1, 1.. ou 1..5 » (les bornes D366, la
  déduction D470 en défaut) ; « component n'est pas adapté ; ta
  proposition by me plaît » — `by:` porte la liste ou le champ-image.
  Le selection: de D215 remplacé ; l'harmonisation D445
  (one/multiple → 1/1..) en proposition. La fiche picker.record
  reprise.
- **2026-08-13 (suite 25)** — **« Ok »** : l'harmonisation D445
  appliquée (`selection: 1 | 1..` — le même vocabulaire partout), les
  fiches `picker.record` et `picker.image` validées ; **la fiche
  `picker.file` livrée** (le dépôt et le parcours, les extensions à
  libellés qui guident, le quota, la caméra/galerie selon le jeu,
  la déduplication silencieuse). En attente de validation — la famille
  picker se fermerait.
- **2026-08-13 (suite 26)** — **La famille `picker` scellée** :
  picker.file validée (« oui ») — record, image, file au complet
  (D469–D474). Suivante : `image-viewer` (la visionneuse — la lecture
  de l'image, le pendant du picker).
- **2026-08-13 (suite 27)** — **La famille `viewer` (D475)** :
  « image-viewer et carousel sont un même objet : viewer » — généralisé
  aux fichiers visualisables (PDF, Word, Excel — l'image un type parmi
  d'autres) ; **carousel = le viewer des collections** (liste ou
  association d'images/vignettes, le défilement à intervalle régulier
  ou avant/après). Les fiches viewer et carousel réécrites ;
  `interval: 5s` en proposition. En attente de leurs validations.
- **2026-08-13 (suite 28)** — **Les durées complètes (D476)** : « s,
  min, h, d, w, m et y » — la seconde et l'année rejoignent D434 ; le
  vocabulaire vaut partout où une durée s'écrit (every, interval,
  await ; temporal[1y] possible en note). Les fiches viewer/carousel
  toujours en attente de validation.
- **2026-08-13 (suite 29)** — **Le carousel, un mode d'affichage
  (D477)** : « viewer est le composant graphique et carousel un mode
  d'affichage » — la fiche carousel repliée dans viewer, le mode déduit
  du contenu (fichier seul → vignette, collection → carrousel),
  forçable au crochet viewer[carousel] (en proposition). La fiche
  unifiée en attente de validation.
- **2026-08-13 (suite 30)** — **Les trois modes du viewer (D478)** :
  « le crochet est un raccourci pour la définition du mode » — mode:
  en clair, le crochet en abrégé ; « le viewer peut afficher une image,
  une planche ou un carousel ». Le nom anglais de la planche en
  proposition (mosaic). La fiche en attente de validation.
- **2026-08-13 (suite 31)** — **La planche dimensionnée (D479)** :
  « besoin de préciser le nombre d'images en colonne et en ligne dans
  la zone » — mosaic[4x3] (colonnes × lignes) en proposition, absent =
  l'auto, l'excédent se feuillette. La fiche viewer en attente de
  validation.
- **2026-08-13 (suite 32)** — **Mosaic acté (D480)** : le nom et le
  crochet-raccourci retenus, « il faut prévoir une propriété quand
  même » — columns:/lines: en proposition. Le rendu template du
  carrousel à éclaircir (le point 3 incompris).
- **2026-08-13 (suite 33)** — **Le document paginé feuilleté (D481)** :
  « un carrousel d'un document PDF correspond à un défilement des
  pages. Un PowerPoint suit le même principe » — le carrousel défile
  une succession : les éléments d'une collection ou les pages d'un
  document ; l'usage : la présentation, le mode opératoire. La fiche
  viewer en attente de validation (columns:/lines: et le rendu
  template toujours en proposition).
- **2026-08-13 (suite 34)** — **`sheet:` (D482)** : « columns/lines à
  remplacer par sheet: columns x lines » — la grille de la planche en
  une seule propriété, le crochet mosaic[4x3] en raccourci. Reste le
  rendu template du carrousel (proposition : la planche).
- **2026-08-13 (suite 35)** — **Le viewer du document généré (D483)** :
  « le fichier de la facture n'existe pas en tant que tel mais comme un
  PDF généré à partir des informations de la facture et de ses lignes —
  un viewer peut faire référence à un template de document à générer ».
  template[<nom>] en proposition ; le rendu du carrousel dans un
  document différé au point template (Q55). La fiche viewer en attente
  de validation.
- **2026-08-13 (suite 36)** — **La fiche `viewer` validée** (« oui,
  même si je pourrais l'amender lorsque nous traiterons des
  templates ») — la réserve notée pour Q55. Suivante : `map` (la
  carte — la lecture de la géolocalisation).
- **2026-08-13 (suite 37)** — **Le couple size/dimension (D484)** :
  « size: décrit la dimension à l'affichage et dimension: décrit la
  dimension en extension (suite à un clic) » — la doctrine unifiant la
  mini-carte/carte dépliée, la vignette/visionneuse (D293), la liste
  du picker (D469), la surimpression (D454). La fiche map en attente
  de validation.
- **2026-08-13 (suite 38)** — **La fiche `map` validée** (« oui »).
  Suivante : `thread` (le fil de communication — D295/D393).
- **2026-08-13 (suite 39)** — **Le fil épouse son contenant (D485)** :
  « il peut prendre une section ou un onglet… ça prend la place qu'on
  lui laisse » — l'onglet de D167/D186, un habitat parmi d'autres. La
  fiche thread corrigée, en attente de validation (preview: 3 en
  proposition).
- **2026-08-13 (suite 40)** — **La fiche `thread` validée** (« oui, je
  valide »). Suivante : `list` (l'éditeur du type liste — D296/D362).
- **2026-08-13 (suite 41)** — **Un seul `list` (D486)** : « le
  composant graphique list vu avant les types est intimement lié à
  list ici » — la liste complète (D441–D447) et l'éditeur, un même
  composant (déployé pour l'entité, resserré sur la colonne unique
  pour le type simple). La fiche corrigée, en attente de validation.
- **2026-08-13 (suite 42)** — **La fiche `list` validée** (« oui ») —
  **les feuilles sont au complet** : 21 fiches validées (checkbox,
  toggle, text, number, password, calculator, gauge, fuel, slider,
  clock, calendar, dropdown, radios, icons, picker.record,
  picker.image, picker.file, viewer, map, thread, list). Famille
  suivante : les conteneurs (section, grid, tabs, pages, page — le
  statut de header/body/footer à trancher).
- **2026-08-13 (suite 43)** — **Le bloc n'existe pas (D487)** :
  « block n'existe pas en tant que tel — il se décline selon les
  différents items » ; header/body/footer = des conteneurs du
  catalogue. Première fiche de la famille : `section`.
- **2026-08-13 (suite 44)** — **Le contenu fixe (D488)** : « il manque
  une feuille essentielle : un texte fixe, un paragraphe et/ou une
  image fixe » (les informations légales, le logo) — paragraph et
  picture en proposition. Les fiches section et paragraph en attente
  de validation.
- **2026-08-13 (suite 45)** — **La réserve sur le contenu fixe** :
  « les feuilles paragraph et picture seront étoffées lorsque nous
  ferons du gabarit ou de la génération de documents » — les deux
  fiches minimales à dessein, l'enrichissement différé à Q55 (la même
  réserve que viewer). La fiche picture écrite.
- **2026-08-13 (suite 46)** — **`paragraph` et `picture` validées**
  (« les termes paragraph et picture sont validés et nous les
  amenderons lors de la génération de documents ») — les noms actés,
  l'amendement réservé à Q55. Retour à la fiche `section`.
- **2026-08-13 (suite 47)** — **Le couple sections/section (D489)** :
  sections = l'organisateur (colonne ou ligne), chaque item une
  section ; une section organise des nœuds (sections ou feuilles) —
  l'alternance stricte. Les fiches sections et section réécrites, en
  attente de validation (layout:, le crochet, la section seule en
  raccourci — propositions).
- **2026-08-13 (suite 48)** — **Les trois arbitrages (D490)** :
  layout: column | row | grid[2] ; la section seule vit directement
  sous header/body/footer (ailleurs, l'organisateur) ; l'affichage par
  écran relève de screen: (D450), rien d'automatique. Les fiches
  corrigées — la question ouverte : le conteneur grid du catalogue,
  absorbé par layout: grid[n] ?
- **2026-08-13 (suite 49)** — **La grille au crochet (D491)** :
  « oublie grid » — le conteneur retiré du catalogue ; layout:
  column[n] | row[n] — column[3] : trois colonnes par ligne puis
  repli ; row[2] : deux lignes par colonne puis repli. Les fiches et
  l'inventaire corrigés.
- **2026-08-13 (suite 50)** — **La liste en widgets (D492)** : « elle
  peut se présenter sous forme d'une liste de widgets — widget: <nom
  du widget> de l'entité de l'élément » — le tableau ou les widgets,
  la mécanique demeure. La fiche list complétée ; sections/section
  toujours en attente de validation.
- **2026-08-13 (suite 51)** — **L'exclusion widget/columns validée**
  (« je valide l'exclusion mutuelle widget / columns »). Les fiches
  sections/section toujours en attente.
- **2026-08-13 (suite 52)** — **`title:` au titre de la section
  (D493)** : « le nom d'un regroupement est un libellé en titre — au
  lieu de label, j'utilise title » — title = ce qui titre ; label
  demeure ailleurs (shortcut, paragraph, values). Les exemples de
  composants.md balayés.
- **2026-08-13 (suite 53)** — **Retour sur la jauge** : la
  vérification D241 (référence + calculée, formule ou absolue) — la
  forme à trois valeurs consignée (D494 : min, value, max en une,
  chacun fixe ou dépendant) ; les seuils depuis une entité (D495, la
  liaison seuil/couleur — écriture en proposition) ; la question du
  type color/rgb posée — absent du catalogue, la proposition faite.
- **2026-08-13 (suite 54)** — **color et picker.color (D496)** :
  « j'ajoute aussi picker.color pour sélectionner une couleur » puis
  « le stockage est un entier, l'affichage en hexadécimal et une base
  traduisant les couleurs en RGB » — le type acté (entier au moteur,
  hex à l'écran, la base des couleurs nommées — celles de colors:
  D467), picker.color à la famille pointée. Les fiches color et
  picker.color écrites, en attente de validation.
- **2026-08-13 (suite 55)** — **Le type range (D497)** : « un stockage
  de 2 valeurs dont l'une est égale ou plus petite que l'autre » — le
  générique manquait (la recherche D371 et period D391 vérifiés) ;
  range of <type> en proposition, la contrainte intégrée, le double
  curseur pour les bornés.
- **2026-08-13 (suite 56)** — **Les fiches `color` et `picker.color`
  validées** (« je valide color et picker.color »). Restent en
  attente : sections/section, les liaisons D495, l'écriture range of
  <type> (D497).
- **2026-08-13 (suite 57)** — **range of validé (D498)** : la
  déclinaison de list of aux deux contraintes (nombre, ordre) ; la
  plage ouverte autorisée ; les libellés sur min/value/max ; « la
  jauge étant un cas particulier d'un range ». Les liaisons D495
  validées. **Sections/section mis en attente de relecture** à la
  demande de l'auteur. Le tableau de synthèse types × composants
  demandé — livré dans l'échange.
- **2026-08-13 (suite 58)** — **Le tableau corrigé** : « association
  with est absent de la liste » — les lignes du trio des liens (D400)
  distinguées : l'association stockée, le n-aire (D402), la dérivée à
  l'if (D405), et la liste nommée de l'accès retour (D394/D216).
- **2026-08-13 (suite 59)** — **La synthèse intégrée à l'entête de
  composants.md** (« cela fait le lien entre le modèle de données et
  les composants graphiques ») — types × défaut × compatibles, les
  quatre règles transversales, les cellules °à confirmer. L'auteur
  relèvera les manques et y répondra.
- **2026-08-13 (suite 60)** — **Les cellules confirmées (D499)** :
  duration/calculator sur deux clocks ; datetime = calendar + clock ;
  uuid en texte formaté, saisie et lecture (les id tiers parmi ses
  fonctions). Reste °à confirmer : le dropdown de référence.
- **2026-08-13 (suite 61)** — **D500** : le dropdown possible sur la
  référence ; le statut en dropdown aussi, la liste des valeurs
  tenant compte du cycle de vie (les états atteignables, D425–D427).
  La synthèse complète — plus aucune cellule à confirmer. Cinq cents
  décisions consignées depuis le 12 juin.
- **2026-08-13 (suite 62)** — **La synthèse relue et validée par
  l'auteur** (« les liens sont faits. J'ai relu l'ensemble des types
  et des composants graphiques. Pour le moment, je ne vois plus de
  manques »). La reprise sur sections/section.
- **2026-08-13 (suite 63)** — **width/height (D501)** : « layout
  fournit le découpage ; width et height calibrent la taille des
  sections ; sans précision, l'ensemble de l'espace est pris ». Les
  fiches complétées, en attente de validation.
- **2026-08-13 (suite 64)** — **Les deux étages du calibrage
  (D502)** : width/height au niveau de layout (l'uniforme) et sur la
  section (le variable) — le plus proche l'emporte (D461). Les fiches
  ajustées.
- **2026-08-13 (suite 65)** — **size sur l'organisateur (D503)** :
  l'espace du tout ; au débordement les barres visibles ou
  évanescentes, le swipe au tactile, les barres = l'indicateur de
  position. La fiche sections complétée.
- **2026-08-13 (suite 66)** — **Les fiches `sections` et `section`
  validées** (« je valide sections et section »). Suivant : le couple
  `tabs`/`tab`, proposé au miroir (l'organisateur et sa partie —
  D489), avec quatre écritures en proposition (items = des tab seuls,
  title requis sur la poignée, icon: D439, les onglets à la suite au
  template).
- **2026-08-13 (suite 67)** — **Les modes de tabs (D504)** : haut
  (Windows, défaut), bas (Excel), latéral (gauche/droite), et le mode
  wizard — toutes les étapes visibles, l'avance au rythme de
  l'exploration (l'écho du cliquet D354) ; « les icônes permettent de
  minimiser le texte ou afficher le texte en survol ». mode: +
  crochet en proposition. Les fiches complétées.
- **2026-08-13 (suite 68)** — **Le chemin de traitement (D505)** :
  « en wizard, les tabs parcourus décrivent le chemin de traitement —
  en cliquant sur une phase, nous revenons sur un onglet » — le
  retour libre sur l'exploré, l'avance gardée.
- **2026-08-13 (suite 69)** — **La dimension unique des volets
  (D506)** : « pour chaque tab, toujours la même dimension — les
  zones centrées si plus petites » — aucun calibrage par volet (le
  contraste avec D502).
- **2026-08-13 (suite 70)** — **Les fiches `tabs` et `tab` validées**
  (« je valide tabs et tab »). Suivant : le couple `pages`/`page` —
  les fiches proposées sur la définition d'origine (« pages est une
  section pouvant contenir un header, page(s) et footer ; page est un
  saut de page »), trois lectures en proposition (l'alternance des
  items, header/footer constants autour des pages, la navigation au
  swipe/flèches).
- **2026-08-14** — **La géométrie de pages (D507)** : « pages prend
  toute la place, pas de dimension ; header/footer optionnels,
  toujours visibles s'ils sont définis, leur hauteur paramétrable ;
  la page prend toujours le reste ». La fiche corrigée.
- **2026-08-14 (suite)** — **La navigation des pages = tabs (D508)** :
  le numéro en poignée par défaut, le nom et/ou l'icône comme un tab,
  l'affichage à la logique de tabs (les modes D504, le chemin D505).
  Les fiches alignées.
- **2026-08-14 (suite 2)** — **Les fiches `pages` et `page` validées**
  (« je valide pages et page »). Dernier conteneur : la fiche
  commune `header`/`body`/`footer` (les sections seules aux rôles
  réservés — D487/D490), proposée avec deux lectures (une fiche pour
  les trois ; la double écriture — les clés au formulaire, les items
  dans pages).
- **2026-08-14 (suite 3)** — **Le formulaire est un pages (D509)** :
  « pages est le premier composant d'un formulaire sans avoir besoin
  de le déclarer ; header et footer sont déjà décrits ; body est à
  remplacer par page » — et « pas besoin de composants
  complémentaires ». Body quitte le vocabulaire ; la fiche réécrite
  en header/footer ; les exemples balayés (body: → page:). La
  virgule : l'écriture du multi-pages.
- **2026-08-14 (suite 4)** — **Le multi-pages en liste (D510)** :
  « default: [ { header: … }, { page: … }, { page: … },
  { footer: … } ] » — les clés pour l'usuel, la liste d'éléments dès
  que les pages se répètent.
- **2026-08-14 (suite 5, fin de séance)** — **La fiche
  `header`/`footer` validée** (« je valide header/footer ») — **la
  famille des conteneurs est soldée** : quatre couples
  (sections/section, tabs/tab, pages/page, header/footer), « pas
  besoin de composants complémentaires » (D509). L'auteur clôt la
  séance ; **la prochaine : une passe sur la construction des
  surfaces pour une entité.**
- **2026-08-14 (suite 6)** — **La PR #24 fusionnée** (« Q16 — le
  glossaire, le domaine 3, et le domaine 4 : le catalogue des
  composants, D417–D510 » — 140 commits, 3 fichiers). Develop porte
  désormais glossaire.md, composants.md et la conception jusqu'à
  D510.
- **2026-08-14 (suite 7)** — **Les actes ouverts (D511)** : la fiche
  unique tranchée par l'usage, operation[<nom>] acté (« en phase avec
  les fields ») ; les deux modes de l'opération — la pré-exécution
  (le contexte chiffré avant l'engagement, la généralisation du
  dry-run D234) ; le message de confirmation au gabarit
  (validate: { message: } en proposition). La fiche operation
  écrite, en attente de validation.
- **2026-08-14 (suite 8)** — **La fiche `operation` validée** (« je
  valide ») — validate: { message: <gabarit> } et les variables de la
  pré-exécution actés. **La famille des actes est soldée** (une fiche
  unique — l'habitat fait le visage). Restent : les graphiques
  (chart/kpi/pivot — Q53) et les surfaces.
- **2026-08-14 (suite 9)** — **Les graphiques ouverts** : la famille
  pointée chart.* actée avec le nuage de points (chart.scatter —
  D512) ; kpi et pivot à part. **La carte des collections (D513)** :
  une coordonnée ou une liste de coordonnées, les lignes possibles ou
  pas (rien n'était consigné — la fiche map complétée ; lines: en
  proposition). Première fiche à venir : chart.line.
- **2026-08-14 (suite 10)** — **La frontière de la route (D514)** :
  les deux usages (les lieux sans relier, le parcours relié) ; le
  socle au trait droit, « le tracé de la route aux hooks » — le
  patron du géocodage (D294), OSRM/Valhalla en candidats
  auto-hébergeables (Q7).
- **2026-08-14 (suite 11)** — **Les réglages d'affichage (D515)** :
  les échelles, les début/fin d'axe, les éléments d'affichage
  (vignettes, couleurs, dégradé) — la forme riche des axes, colors:
  D467 et points: en proposition. La fiche chart.line complétée.
- **2026-08-14 (suite 12)** — **labels: et les valeurs du calcul
  (D516)** : labels: true (la valeur au format du champ) ou le
  gabarit ; le clic sur une vignette ouvre toutes les valeurs du
  calcul (liste/association). La fiche chart.line ajustée.
- **2026-08-14 (suite 13)** — **L'assise du graphique (D517)** :
  « s'appuyer sur une entité ou une liste ; les axes font référence
  aux champs » — on: à l'adresse D439 en proposition, le périmètre de
  la liste hérité. La fiche chart.line ancrée.
- **2026-08-14 (suite 14)** — **Le défaut de l'assise (D518)** : « si
  on: est absent, l'assise porte sur l'entité elle-même » — l'entité
  porteuse de la déclaration.
- **2026-08-14 (suite 15)** — **La fiche `chart.line` validée**
  (« oui »). Suivante : `chart.bars` — le socle commun hérité
  (D515–D518), les écarts propres en proposition (mode:
  vertical|horizontal au crochet D478, stacked: pour l'empilement).
- **2026-08-14 (suite 16)** — **La fiche `chart.bars` validée** (« je
  valide chart.bars »). Suivante : `chart.pie` — les écarts propres en
  proposition (mode: pie|donut au crochet, la variable {percent} au
  gabarit des labels, le regroupement des petites parts en « autres »
  à seuil).
- **2026-08-14 (suite 17)** — **Les secteurs arbitrés (D519)** :
  mode: pie|donut|quarter ; les variables {value}/{percent}/{total} ;
  le clic sur une part → la liste de ses éléments ; « autres » acté,
  son drill ouvrant une barre de répartition (le drill à deux
  étages). La fiche chart.pie complétée.
- **2026-08-14 (suite 18)** — **L'épaisseur et les angles (D520)** :
  thickness: sur donut/quarter ; les angles de quarter au crochet aux
  bornes (quarter[-90..90] en proposition) — l'hémicycle de
  l'assemblée nationale en usage fondateur.
- **2026-08-14 (suite 19)** — **La fiche `chart.pie` validée** (« je
  valide chart.pie ») — et **le tableau au socle (D521)** : « les
  charts doivent se présenter soit en graphique, soit sous forme d'un
  tableau, ou les deux » (l'écho D244) ; display: graph|table|both en
  proposition. Suivante : chart.scatter.
- **2026-08-14 (suite 20)** — **Le nuage de points (D522)** : le
  grain (un point par enregistrement, le visage D386) ; les seuils
  d'axe non chevauchants, les zones aux croisements — la
  catégorisation (MoSCoW, effort/bénéfice) ; thresholds:/zones: en
  proposition. La fiche chart.scatter écrite.
- **2026-08-14 (suite 21)** — **La matrice adressée (D523)** : la
  redondance effacée — l'axe porte min/max/threshold, la zone
  s'adresse (zone: [1,1] + title) ; la convention [colonne, ligne]
  depuis l'origine en proposition. La fiche simplifiée.
- **2026-08-14 (suite 22)** — **La fiche `chart.scatter` validée**
  (« oui »), la convention [colonne, ligne] depuis l'origine actée.
  Suivante : `chart.combo` — le combiné (D239 : courbe+barres ou 2
  courbes, 2 axes Y max) ; en proposition : y: en liste de séries
  { value:, as: line|bars, axis: left|right }.
- **2026-08-14 (suite 23)** — **L'orientation du combiné (D524)** :
  axis: left|right ou bottom|up — la représentation en colonne ou en
  ligne, la paire homogène ; la virgule up/top (D504) signalée.
- **2026-08-14 (suite 24)** — **top harmonisé (D525)** : « j'harmonise
  en effet avec top » — axis: bottom|top, les bords nommés d'un seul
  vocabulaire (D504).
- **2026-08-14 (suite 25)** — **La fiche `chart.combo` validée** (« je
  valide chart.combo »). Suivante : `kpi` — le chiffre-clé (value:
  sans axe, colors: par seuils D467, drill D242, pas de comparaison
  au socle D245 — le hook).
- **2026-08-14 (suite 26)** — **L'icône aux seuils (D526)** : « le
  feu tricolore » — icons: en proposition (la mécanique D467
  dupliquée, la collision avec la feuille notée), la liaison icon: à
  la table D495. La fiche kpi complétée.
- **2026-08-14 (suite 27)** — **L'organisation du kpi (D527)** : le
  style en exergue (distinct de la feuille) ; les 4 organisations —
  la position du label, l'icône au bord opposé ; layout: top|left|
  bottom|right en proposition (défaut top).
- **2026-08-14 (suite 28)** — **La fiche `kpi` validée** (« je valide
  kpi »). Dernière des graphiques : `pivot` — le croisé dynamique
  (D246 : les quatre éléments, les groupements pliables) ; en
  proposition : rows:/columns:/value:, le clic sur une cellule
  ouvrant la liste de l'intersection.
- **2026-08-14 (suite 29)** — **Le tri du croisé (D528)** : « un tri
  sur la value pour visualiser les plus gros CA » — chaque niveau du
  groupement par son sous-total, sort: -value en proposition (D441).
  La fiche pivot complétée.
- **2026-08-14 (suite 30)** — **Le tri aux trois clés (D529)** : « le
  tri peut s'appuyer sur les rows, les columns ou la value » — les
  signes et cascades D441.
- **2026-08-14 (suite 31)** — **La fiche `pivot` validée** (« je
  valide pivot ») — **la famille des graphiques est soldée** : sept
  fiches (chart.line, chart.bars, chart.pie, chart.scatter,
  chart.combo, kpi, pivot — D512–D529). Quatre familles sur cinq au
  complet (les feuilles, les conteneurs, les actes, les graphiques) ;
  **ne restent que les surfaces — la passe réservée : la construction
  des surfaces pour une entité.**
- **2026-08-14 (suite 32)** — **La passe des surfaces ouverte** : la
  méthode validée (« la méthode me convient, entrons par la liste ») —
  le fil conducteur sales.order, les surfaces dans l'ordre d'usage
  (liste → formulaire → résumé → widgets → wizard → templates →
  dashboard), la fiche + l'exemple + la validation à chaque étape. La
  fiche de la liste-surface écrite (le visage déclaré du composant
  unique D486).
- **2026-08-14 (suite 33)** — **Les appels du geste et les exports
  (D530)** : add/update/delete nomment le formulaire ou le widget
  appelé (le défaut D438) ; exports: précise les exports et les
  générations de documents (le crochet au modèle/gabarit en
  proposition). La fiche complétée.
- **2026-08-14 (suite 34)** — **Les actions et l'anatomie (D531)** :
  actions: (l'icône à l'opération, surchargeable) ; « une liste est
  comme pages » — header (titre/colonnes/filtres/icône-exports/icônes
  des gestes et actions), la zone page (le tableau), footer
  (sous-total ou gabarit + les boutons des actions sans icône). La
  fiche restructurée.
- **2026-08-14 (suite 35)** — **size et screen sur la liste (D532)** :
  la couverture de l'écran (D484/D503) et le support de conception
  et/ou d'autorisation (D450). La fiche complétée.
- **2026-08-14 (suite 36)** — **La grammaire de size (D533)** : une
  valeur = la part de l'écran centrée ; deux valeurs = largeur puis
  hauteur ; % ou px — partout où size s'écrit (D484).
- **2026-08-14 (suite 37)** — **La fiche `list` (surface) validée**
  (« je valide la liste »). Le fil avance : la fiche `form` écrite —
  les cinq usages (D199), le pages implicite (D509–D510), le titre à
  gabarit (D449/D465), la surimpression (D454, la grammaire D533) ;
  la virgule size/dimension au formulaire signalée (D532 évoquait
  size — la lecture D484 dit dimension, l'extension à l'appel).
- **2026-08-14 (suite 38)** — **La confusion levée (D534)** : « j'ai
  introduit une confusion entre dimension et size » — D484
  départage : le formulaire à l'appel → dimension (D454), la liste à
  l'affichage → size ; la grammaire D533 pour les deux. La fiche form
  confirmée sur dimension:.
- **2026-08-14 (suite 39)** — **size aux surfaces (D535)** : « size me
  convient mieux pour les 2 usages » — toute surface s'ouvre en
  surimpression sur la pile des actions antécédentes cumulées ; le
  dimension: du formulaire (D454) devient size: ; le couple D484
  demeure au grain du champ. La fiche form corrigée.
- **2026-08-14 (suite 40)** — **La fiche `form` validée** (« je valide
  form ») — et **style: défini (D536)** : le style global de
  l'application en défaut, la surcharge {fonte, taille, mise en
  forme} à la cascade D461. La fiche text complétée.
- **2026-08-14 (suite 41)** — **style: validé** (« je valide style »).
  Le fil avance : la fiche `summary` écrite — la config de formulaire
  restreinte (D201 : les champs sélectionnés, pas d'onglets, petit
  par principe, le défaut n'existe pas), le visage déployé de la
  référence (D215).
- **2026-08-14 (suite 42)** — **Le résumé précisé (D537)** : le 1-1
  affiche le title ou l'image (D386) ; plusieurs sections pour mêler
  l'horizontal et le vertical — pas plusieurs pages ni tabs. La fiche
  summary ajustée.
- **2026-08-14 (suite 43)** — **Le graphique au résumé (D538)** :
  « un kpi ou un chart, à condition que son affichage reste
  modeste » — chart[<nom>] en items en proposition (la famille des
  adresses).
- **2026-08-14 (suite 44)** — **La troisième assise (D539)** : « la
  chart s'appuie sur une entité ou un champ de type list of ou
  association with » — le champ-collection, le graphique des éléments
  liés à l'enregistrement du contexte ; on: <champ> en proposition.
- **2026-08-14 (suite 45)** — **Le chart, feuille du formulaire
  (D540)** : « un form peut donc avoir un composant chart comme
  feuille — nous le faisons entrer de fait dans summary » (la
  restriction D201 le laisse passer, la modestie D538).
- **2026-08-14 (suite 46)** — **`summary` et `on: <champ>` validés**
  (« je valide summary et on: <champ> »). Le fil avance : la fiche
  `widget` écrite — la lecture proposée : une seule surface aux deux
  usages, la carte de l'enregistrement (D492) et la synthèse au
  drill-down (D202), le pool de l'accueil (D204), l'évaluation D248.
- **2026-08-14 (suite 47, pause)** — **La fiche `widget` validée**
  (« je valide widget ») — la lecture des deux usages en une surface
  actée. L'auteur fait une pause. **L'état de la passe des
  surfaces** : list, form, summary, widget validées (D530–D540) ;
  restent wizard, dashboard, template — puis la signature des nœuds,
  Q60, les domaines 5–8.
- **2026-08-14 (suite 48)** — **La tendance du kpi (D541, note pour
  plus tard)** : « en exploitant l'historique d'une entité, nous
  pourrions présenter la tendance » — la piste consignée
  (D411/D172), le détail différé, la frontière avec D245 à confirmer.
- **2026-08-14 (suite 49)** — **qrcode et barcode fichés (D542)** :
  la question de l'auteur relève le manque — décidés (D252/D300)
  mais jamais fichés ; la fiche commune écrite, l'inventaire et la
  synthèse complétés ; le format au crochet en proposition.
- **2026-08-14 (suite 50)** — **Le size des jumeaux (D543)** : le
  qrcode au carré (une valeur unique — le côté), le code-barres en
  largeur × hauteur (D533). La fiche complétée.
- **2026-08-14 (suite 51)** — **Les deux modes du champ encodé
  (D544)** : la saisie en mode texte (le régime du champ), l'affichage
  en mode graphique — chacun sa taille ; size: { input:, display: }
  en proposition.
- **2026-08-14 (suite 52)** — **La valeur sous les barres (D545)** :
  labels: true en proposition (l'écho D516, défaut false) — l'humain
  sous la machine.
- **2026-08-14 (suite 53)** — **La fiche `qrcode`/`barcode` validée**
  (« je valide qrcode/barcode ») — le manque de D542 refermé
  (D542–D545). La passe des surfaces peut reprendre : le wizard.
- **2026-08-14 (suite 54)** — **La fiche `wizard` écrite** : le
  matériau Q54 (D230–D233) sur le squelette tabs[wizard]
  (D504–D505) — mono-utilisateur une session, les étapes-surfaces aux
  transitions conditionnelles, l'état transitoire à transaction
  finale, le brouillon déclaré ; en proposition : le couple
  steps:/step:, l'if: d'étape, le draft: <état>.
- **2026-08-14 (suite 55)** — **Le wizard précisé (D546)** :
  l'habillage de tabs[wizard] acté (step = tab) ; l'opération à la
  validation du step (operation: <nom> en proposition) ; les
  opérations de base create/read/update/delete ; la démarche
  élargie — créer, agir sur un ensemble d'une liste, imprimer les
  menus, mettre à jour une tournée. La fiche complétée.
- **2026-08-14 (suite 56)** — **La chaîne de pré-exécutions (D547)** :
  le draft s'efface ; les steps à opération pré-exécutés, la
  transformation à la validation définitive ; la confirmation validée
  barre le retour (le cliquet sur le chemin D505). La fiche
  corrigée.
- **2026-08-14 (suite 57)** — **L'anatomie du wizard (D548)** :
  header/footer optionnels (l'écho pages D507) ; le fil d'Ariane en
  haut ou en bas (mode: top|bottom en proposition) ; size:
  obligatoire, surchargeable à l'inclusion dans un formulaire. La
  fiche complétée.
- **2026-08-14 (suite 58)** — **Les arbitrages du wizard (D549)** :
  size optionnel (sans valeur l'espace disponible, tout l'écran
  depuis un menu) ; breadcrumb: none|top|bottom (défaut top). La
  fiche ajustée.
- **2026-08-14 (suite 59)** — **L'aide à la décision (D550)** : les
  charts, kpi et pivots aux steps du wizard (chart[<nom>] — D540) —
  la 550e décision.
- **2026-08-14 (suite 60)** — **Un seul wizard (D551)** : « cela doit
  être le même objet » — la surface wizard et tabs[wizard], un même
  composant (l'écho D486), tout D546–D550 valant des deux côtés. Les
  fiches liées.
- **2026-08-14 (suite 61)** — **La revue tabs/wizard ouverte** :
  « ça m'embête d'avoir 2 vocabulaires (tabs/steps) pour un même
  objet — faut-il sortir wizard de tabs, ou au contraire fusionner
  les 2 ? » — la validation du wizard suspendue, les deux voies
  posées dans l'échange avec recommandation ; l'arbitrage attendu.
- **2026-08-14 (suite 62)** — **La séparation validée (D552)** : « je
  valide la séparation. Ça confirme mon ressenti » — le mode wizard
  retiré de tabs (D504 amendé), D551 caduque (deux objets, une
  parenté visuelle), le chemin D505 au wizard seul. Les deux fiches
  reprises.
- **2026-08-14 (suite 63)** — **Le contexte empilé (D553)** :
  l'opération voit « l'ensemble des contextes qui se sont empilés
  jusqu'à son usage » — la pile des contextes, le pendant de la pile
  des surimpressions (D535) ; l'origine de l'appel (D455) = la pile
  entière. La fiche operation complétée. *(Le commit 6efcb72
  annonçait D553 par erreur — le voici réellement porté.)*
- **2026-08-14 (suite 64)** — **Les fiches `tabs` et `wizard`
  validées après séparation** (« je valide tabs et wizard »). Le fil
  avance : la fiche `dashboard` écrite — la surface du module
  (module[dashboard] D439), les trois rafraîchissements (D249), les
  widgets assemblés ; en proposition : le bloc dashboards: au module,
  refresh: static|live|every[…] (D434), widget[<entité>.<nom>]
  (la famille des adresses).
- **2026-08-14 (suite 65)** — **Le dashboard aux deux auteurs
  (D554)** : la vérification (« est-ce bien cela ? ») — oui,
  D204/D247 mot pour mot ; l'unification actée : la page d'accueil
  composée est un dashboard dont l'utilisateur est l'auteur — le
  même objet, deux auteurs. La fiche ajustée.
- **2026-08-14 (suite 66)** — **Le squelette de dashboard (D555)** :
  les widgets contraints et les emplacements libres (l'item free en
  proposition) ; l'accueil = le squelette entièrement libre. La
  fiche complétée.
- **2026-08-14 (suite 67)** — **L'emplacement _ (D556)** : l'icône du
  choix sur le widget interchangeable (le catalogue propre ou la
  libération) ; « _ » acté à la place de free (la collision évitée).
  La fiche ajustée.
- **2026-08-14 (suite 68)** — **L'accueil au module actif (D557)** :
  « une page d'accueil fait référence à un dashboard selon le module
  activé » — le changement de module change le tableau de bord.
- **2026-08-14 (suite 69)** — **La homepage aux trois pointes
  (D558)** : « la limiter à un dashboard m'embête » — la liste, le
  dashboard (du module actif — D557) ou la page vide ; la lettre de
  D204 retrouvée.
- **2026-08-14 (suite 70)** — **La fiche `dashboard` validée** (« je
  valide dashboard »). La dernière surface : la fiche `template`
  écrite sur le matériau Q57 (D250–D254) — le formulaire en lecture
  seule + la dimension de page, l'entité contexte, un gabarit par
  langue, les quatre portes (l'effet document, le viewer, les
  exports, l'impression serveur) ; le rendez-vous Q55 atteint
  (paragraph/picture/viewer à étoffer) ; en proposition : paper:,
  l'écriture du gabarit par langue.
- **2026-08-14 (suite 71)** — **Le template précisé (D559)** :
  margin: en mm ; le paragraph-gabarit (la lettre — l'étoffement Q55
  commence) ; la déclinaison par langue à chaque item (D253 amendé :
  un seul gabarit, les items déclinés). Les écarts
  template/formulaire posés dans l'échange pour revue.
- **2026-08-14 (suite 72)** — **Le publipostage étoffé (D560)** :
  « riche et facile à intégrer » — les cinq briques proposées
  (variables aux chemins, if:, style:/titres, la source, le
  multi-alinéas), l'arbitrage attendu.
- **2026-08-14 (suite 73)** — **La sixième brique (D561)** : « une
  liste sous forme de bullet points ou d'indices » — la
  variable-collection au crochet en proposition ({overdue[bullets]},
  le title par élément).
- **2026-08-14 (suite 74)** — **Mustache + markdown (D562)** : la
  combinaison couvre les cas — les briques maison remplacées par deux
  standards ; les limites sur les composants (pas de liste, pas
  d'image — ![…] exclu) ; l'if: d'expression demeure ; la frontière
  D261 préservée (le champ texte utilisateur reste nu).
- **2026-08-14 (suite 76)** — **Le comportement d'url (D563)** : la
  question a relevé le manque (le type existait, le comportement
  non) — les cinq points validés (le lien au nouvel onglet, l'icône
  post-zone, l'ellipse, le lien actif au template, l'aperçu en
  hook). La synthèse complétée.
- **2026-08-14 (suite 77)** — **La PR #25 créée** (« Q16 domaine 4 —
  les actes, les graphiques, les surfaces : le catalogue au complet,
  D511–D563 » — 75 commits, 2 fichiers) vers develop.
- **2026-08-14 (suite 78)** — **Les quatre destinations du template
  (D564)** : Word, PDF, Excel ou un mail — format: précise la
  destination (défaut pdf en proposition) ; le mail rejoint le
  publipostage (D562). La fiche complétée — le commit rejoint la PR
  #25 ouverte.
- **2026-08-14 (suite 79)** — **Le défaut pdf acté (D565)** : « le
  format pourra être étendu à d'autres formats en fonction des
  besoins à venir » — la ligne des hooks (D408).
- **2026-08-14 (suite 80)** — **La PR #25 fusionnée** (« le catalogue
  au complet », D511–D565, 78 commits). Develop porte le catalogue
  entier de composants.md — les cinq familles fichées et validées.
- **2026-08-14 (suite 81)** — **La signature formelle du nœud
  (D566)** : les sept arbitrages de l'auteur — l'adresse universelle
  <type>[<nom>], visible: conditionnel (ni déclaré ni construit),
  l'évaluation à la sollicitation, les enfants au champ déclaré
  (évalués feuille → racine avant construction), la pile de contexte
  depuis la racine, les états-propriétés, le hook-objet au rendu
  multi-formats. La section écrite en tête de composants.md — **le
  domaine 4 ne porte plus de point en attente.**
- **2026-08-14 (suite 82)** — **Les deux amendements (D567)** : les
  enfants aux noms multiples (header/page/footer, chacun facultatif) ;
  visible: vivant — la valeur d'un champ ou du contexte montre/masque
  (le toggle de la saisie conditionnelle), le « ni construit »
  effacé. La section ajustée.
- **2026-08-14 (suite 83)** — **La section repliable (D568)** :
  dropdown: true — le repli/dépli à l'icône ; la collision avec la
  feuille notée, le défaut déplié en proposition. La fiche section
  complétée.
- **2026-08-14 (suite 84)** — **Les quatre valeurs du repli (D569)** :
  dropdown: false|true (ouvert par défaut)|opened|closed —
  l'orthographe opened consignée.
- **2026-08-14 (suite 85)** — **La signature (D566–D567) et la
  section repliable (D568–D569) validées** (« je les valide ») —
  **LE DOMAINE 4 EST SOLDÉ** : le catalogue des composants (les cinq
  familles, 47 fiches), la synthèse types × composants, la signature
  formelle du nœud — tout consigné, tout validé. Restent : Q60 (le
  catalogue des fonctions — le point différé de D433), les domaines
  5–8, la passe de complétude finale, Q58, Q59, Q7 — puis le code
  (D314).
- **2026-08-15** — **La PR #26 créée** (« le domaine 4 soldé : la
  signature du nœud, la section repliable », D566–D569, 6 commits) —
  la table rase avant Q60.
- **2026-08-15 (suite)** — **La PR #26 fusionnée**, et **la PR #27
  créée vers main** (« la conception au 15/08/2026 : les domaines 1–4
  soldés, D1–D569 » — 509 commits, la première publication de la
  conception sur la branche vitrine : main était resté à
  l'initialisation du dépôt).
- **2026-08-15 (suite 2)** — **La PR #27 fusionnée : la conception
  publiée sur main** (D1–D569, 509 commits — la vitrine à jour).
  **Q60 s'ouvre** : le catalogue des fonctions, le point différé de
  D433.
- **2026-08-15 (suite 3)** — **Le cadre de Q60 posé (D570–D573)** :
  l'opération (les cinq portées, le hook de code obligatoire, les 11
  de base, les issues) et la fonction (les champs calculés, le graphe
  d'exécution, la pureté) définies ; les signatures à finaliser ; la
  librairie d'exploration du modèle consignée ; les paramètres
  dynamiques introduits. La question de l'auteur (« vois-tu des
  éléments que j'aurais oubliés ? ») — la réponse dans l'échange :
  duplicate, restore, report, send en candidats.
- **2026-08-15 (suite 4)** — **Les dix-sept opérations de socle
  (D574)** : les quatre candidats acceptés + notify et refresh — le
  catalogue scellé à 17.
- **2026-08-15 (suite 5)** — **Les fonctions : les quatre arbitrages
  (D575)** : sum (les pondérées, les matriciels), min/max universels,
  les agrégats sur listes/associations, la famille du contexte
  courant (le pont D254/D573). L'inventaire des familles recomposé
  dans l'échange, en attente de validation.
- **2026-08-15 (suite 6)** — **Les familles arbitrées (D576–D579)** :
  agrégats-collections fusionnés (+ first/last/any/exists, min/max au
  double régime) ; les opérateurs numériques (+ - * / \ % ! ** ;
  exp/sin/cos/tan en fonctions) ; le texte (le gabarit, les regex,
  les extractions, les conversions) ; **les fonctions de type —
  l'iceberg** (le type emmène ses fonctions ; la conversion = la
  fonction au nom du type, la signature du type portant la conversion
  intrinsèque). L'inventaire recomposé, en attente de validation.
- **2026-08-15 (suite 7)** — **La grande unification des fonctions
  (D580–D582)** : les agrégats aux collections
  (commandes.sum(montant), l'élément en contexte implicite) ; les
  opérateurs et les comparateurs = des fonctions de type à l'écriture
  symbolique (la table à la signature du type) ; la précédence
  fixée ; le typage statique à l'ingestion (feuille → racine, la
  promotion sans perte). Le catalogue central vidé dans les types —
  restent le contexte courant, les libres, le gabarit.
- **2026-08-15 (suite 8)** — **iif et select (D583)** : le
  conditionnel en ligne et la sélection multi-branches rejoignent les
  comparateurs ; les branches d'un même type (D581) ; l'écriture du
  select en proposition.
- **2026-08-15 (suite 9)** — **select au type, le type label
  (D584–D585)** : state.select(…, "...": défaut) ; le type label —
  le catalogue D440 accessible aux expressions, les gabarits nommés
  paramétrables (l'ordre des mots par langue), label(mon_nom,
  { prenom:, nom: }).
- **2026-08-15 (suite 10)** — **L'enregistrement en paramètre
  (D586)** : label(mon_nom, customer) — les champs deviennent les
  paramètres du gabarit, sans les épeler.
- **2026-08-15 (suite 11)** — **Le catalogue des libres (D587)** :
  min, max, sum, avg… en variadiques scalaires ; l'enrichissement au
  besoin (D408/D565).
- **2026-08-15 (suite 12)** — **context.settings (D588)** : le nom
  référence un paramètre statique ou dynamique — { mode:
  dynamic|static, value: } ; le dynamique surchargeable à
  l'administration (D573). Le contexte courant (context., l'inventaire
  des champs) toujours en attente d'arbitrage.
- **2026-08-15 (suite 13)** — **type: au paramètre, context acté
  (D589)** : le paramètre { mode:, type: (défaut text), value: } ;
  le nom context — l'entité homonyme prend le pas, le warning à
  l'ingestion ; l'inventaire des champs consigné. **La famille du
  contexte courant est décrite** — restent les signatures des hooks
  (D572) pour clore Q60.
- **2026-08-15 (suite 14)** — **L'abréviation du paramètre (D590)** :
  marge: 10% ≡ { mode: static, type: text, value: 10% }.
- **2026-08-15 (suite 15)** — **La cascade des settings (D591)** :
  l'application → le module → l'entité, le complément ou la
  surcharge — le plus proche l'emporte (D360/D461).
- **2026-08-15 (suite 16)** — **Le graphe acyclique (D592)** : la
  contrainte sur les graphes d'exécution — le cycle = une erreur
  d'ingestion (le contrôle statique).
- **2026-08-15 (suite 17)** — **Les valeurs nommées (D593)** : la
  fonction retourne une valeur (défaut) ou plusieurs valeurs nommées
  (la regex aux groupes nommés) — un seul calcul, plusieurs champs ;
  l'affectation au point en proposition. Les signatures des hooks en
  cours d'arbitrage (les trois contrats posés dans l'échange).
- **2026-08-15 (suite 18)** — **La transaction tenue ouverte
  (D594)** : pas deux modes — l'exécution suspendue avant le commit,
  le chiffrage lu dans la transaction active, le wizard une seule
  transaction au fil des steps ; le mode hors de la signature.
- **2026-08-15 (suite 19)** — **Les quatre fonctions du hook
  (D595)** : execute, confirm, commit, rollback — l'objet prend
  forme ; l'auto-validation/annulation aux paramètres de l'appel.
- **2026-08-15 (suite 20)** — **commit: auto|confirm (D596)** :
  validate: renommé — le mot aligné sur la fonction du hook ; confirm
  en défaut, la forme riche au message (D511) en proposition ; les
  fiches balayées.
- **2026-08-15 (suite 21)** — **L'issue au commit, le message-label
  (D597)** : le commit retourne l'issue, le moteur lit et déclenche ;
  le message = un label (D585/D440, le gabarit à la transaction).
  Reste l'inviolable de la librairie à valider.
- **2026-08-15 (suite 22)** — **Les valeurs nommées de l'opération
  (D598)** : nb_creations, nb_updates, nb_deletes… — les comptes de
  la transaction nommés, consommés par le message de confirmation.
- **2026-08-15 (suite 23)** — **L'inviolabilité validée (D599) —
  Q60 EST CLOSE** : les 17 opérations, la grande unification des
  fonctions dans les types, le contexte et les paramètres, les
  signatures des hooks (execute/confirm/commit/rollback, la
  transaction tenue ouverte, l'issue au commit, les valeurs nommées),
  la librairie inviolable. Trente décisions (D570–D599). Restent :
  les domaines 5–8, la passe de complétude, Q58/Q59/Q7 — puis le
  code (D314).
- **2026-08-15 (suite 24)** — **La PR #28 créée** (« Q60 close — le
  catalogue des fonctions », D570–D599, 23 commits) vers develop.
- **2026-08-15 (suite 25)** — **Le confirm au formulaire (D600)** :
  la relecture enrichie — le formulaire nourri par la transaction
  active, la lecture seule et/ou la modification, les éditions
  rejoignant la transaction avant le scellé ; form: en proposition.
  **La six-centième décision** — le commit rejoint la PR #28
  ouverte.
- **2026-08-15 (suite 26)** — **La boîte seule (D601)** : form:
  absent + message: précisé = la boîte de dialogue seule.
- **2026-08-15 (suite 27)** — **La PR #28 fusionnée** (« Q60 close »,
  D570–D601, 26 commits) — develop porte le catalogue des fonctions.
  **Le domaine 5 s'ouvre.**
- **2026-08-15 (suite 28)** — **Les huit domaines consignés (D602)** :
  le découpage reposé par l'auteur et croisé avec les échanges — 1–4
  livrés, 5 = les cas d'usage (Q59), 6 = la documentation (Q58), 7 =
  l'architecture (Q7/Q47), 8 = l'implémentation (D314) ; les renvois
  « domaine 6 » de D408/D452/D459 relus vers Q60 et le domaine 7. Le
  manque réparé — le domaine 5 (les cas d'usage) prêt à s'ouvrir.
- **2026-08-15 (suite 29)** — **La passe de complétude ouverte** : la
  revue des manques sur les quatre sujets transversaux (les
  connecteurs/échanges, la sécurité/droits, l'administration/
  exploitation, la migration/versions) posée dans l'échange ; l'auteur
  tranche — « nous allons compléter les manques, commençons par les
  connecteurs et les échanges ». Les cinq manques du sujet : la
  déclaration, les secrets, le contrat du hook-connecteur, les
  entrants, la planification.
- **2026-08-15 (suite 30)** — **Les connecteurs arbitrés (D603)** :
  global à la racine, le catalogue + le hook, les paramètres sans
  contexte, les secrets par variable d'environnement chiffrable (la
  clé environnement + machine), every: D434. Le catalogue de base en
  proposition dans l'échange (la phrase de l'auteur interrompue —
  « le catalogue de hooks »).
- **2026-08-15 (suite 31)** — **Le catalogue de base (D604)** : les
  bases de données standard, l'AD Azure, les fichiers (CSV, JSON) —
  la liste complémentaire acceptée ; every: pour rafraîchir ou
  tester, le file watcher — l'entrant naît par le fichier.
- **2026-08-15 (suite 32)** — **Le contrat par famille (D605)** :
  chaque famille de connecteurs a ses propres méthodes et fonctions
  (la ligne D579 jusqu'au bout) — **le sujet des connecteurs et des
  échanges est soldé** (D603–D605, les cinq manques refermés).
  Suivant dans la passe : la sécurité et les droits.
- **2026-08-15 (suite 33)** — **Le stockage-connecteur et la
  migration inter-connecteurs (D606)** : les deux sens décrits ; les
  entités liées à un connecteur de base de données — le stockage est
  un connecteur ; la migration instantanée ou différentielle (la
  réplication D112–D114) ; la translation aux quatre usages vérifiée
  (évoquée dès l'origine).
- **2026-08-15 (suite 34)** — **hooks.md créé (D607)** : le troisième
  artefact préparatoire (après le glossaire D417 et composants.md
  D457) — le report des échanges sur les hooks : la doctrine (D52/
  D408 — le catalogue = les hooks embarqués, le mot jamais écrit, la
  première classe, la dégradation), les cinq familles aux contrats
  (type, composant, opération, fonction, connecteur), les autres
  points d'extension, les règles transversales (la librairie
  inviolable, le renvoi domaine 6 relu, la signature d'abord).
  L'entrée Connecteur du glossaire enrichie au passage (D603–D606).
- **2026-08-15 (suite 35)** — **Les exemples ajoutés à hooks.md**
  (« où sont les exemples ? ») : chaque famille reçoit le sien, puisé
  des échanges — le type progression/fuel (le fondateur), le
  composant gauge_3d, l'opération invoice du fil, la fonction
  extract_name (D593), les connecteurs geocoding + le guetteur.
- **2026-08-15 (suite 36)** — **hooks.md complété des sept manques**
  (le croisement systématique du registre — la relecture de l'auteur
  les pressentait) : la collection-type aux agrégats (D580), le type
  label (D585–D586), le contexte et les settings lus par les hooks
  (D553/D588–D591), le composant au nom du type (D458), le wizard et
  la transaction (D547/D594), la migration inter-connecteurs (D606),
  les libres et iif (D583/D587). **Le point 8 reste ouvert à
  l'arbitrage : l'articulation entre l'opération déclarée
  (when:/effects: — D428–D432) et le hook d'opération (D570).**
- **2026-08-15 (suite 37)** — **types.md créé (D608)** : le quatrième
  artefact préparatoire — le catalogue des types par croisement du
  registre (le socle commun, les simples, les composés, les
  collections et plages, les liens, les générés et le contexte, les
  types-hooks) ; chaque ligne cite ses décisions.
- **2026-08-15 (suite 38)** — **Le pont de l'opération (D609)** : le
  point 8 refermé — le hook = l'opération, la déclaration = l'usage
  et le déclenchement hors-IHM ; « une opération peut être une liste
  d'opérations du socle » (les effets = des références) ; le
  déclenchement par connecteur acté (les webhooks, l'import
  automatique) ; hooks.md mis à jour.
- **2026-08-15 (suite 39)** — **La PR #29 créée** (« la passe de
  complétude — les huit domaines consignés, les connecteurs, hooks.md
  et types.md », D602–D609, 14 commits, 4 fichiers) vers develop.
- **2026-08-15 (suite 40)** — **La liaison au stockage (D610)** :
  connector: { storage:, from: } à la racine — un seul stockage, le
  from portant la migration/transformation ; le chantier suivant
  nommé : la configuration de la procédure (les éléments déjà vus, à
  étendre).
- **2026-08-15 (suite 41)** — **La PR #29 fusionnée** (silencieusement,
  le patron connu — vérifiée : bcde1d2 sur develop) ; la branche
  recréée porte D610.
- **2026-08-15 (suite 42)** — **Le câblage par rôles nommés (D611)** :
  le hook nomme son besoin (send → smtp, la géoloc → location), la
  racine câble, la surcharge locale vers un connecteur compatible ;
  le rôle siren noté (la vérification des identifiants).
- **2026-08-15 (suite 43)** — **Le câblage précisé (D612)** : les
  quatre réponses — l'optionnel au simple, la famille = type: (le nom
  au plus simple), la sobriété des connecteurs,
  context.connector.<rôle> acté, la carte au connecteur selon
  l'écran.
- **2026-08-15 (suite 44)** — **Le type et l'implémentation (D613)** :
  storage est le type, postgresql une implémentation compatible — le
  type = la famille = le rôle ; implementation: en proposition (le
  mot hook quitte connectors.yml, la doctrine D408 respectée). Les
  exemples de hooks.md balayés.
- **2026-08-15 (suite 45)** — **connectors.md créé (D614)** : le
  cinquième artefact préparatoire — la nature, la déclaration, le
  câblage, les secrets, le catalogue de base, les déclencheurs, la
  migration/transformation, les points ouverts (le mapping du from,
  les contrats par famille, la défaillance, implementation:).
- **2026-08-15 (suite 46)** — **class: confirmé (D615)** : le
  vocabulaire objet, court, sans collision — implementation: balayé
  des deux documents.
- **2026-08-14 (suite 75)** — **`paragraph` et `template` validées**
  (« je valide paragraph et template ») — **LA PASSE DES SURFACES EST
  SOLDÉE** : les sept fiches (list, form, summary, widget, wizard,
  dashboard, template — D530–D562) sur le fil sales.order. **LE
  CATALOGUE DE COMPOSANTS.MD EST AU COMPLET : les cinq familles**
  (les feuilles — 26 fiches, les conteneurs — 4 couples +
  header/footer, l'acte unique, les graphiques — 7 fiches, les
  surfaces — 7 fiches). Restent au domaine 4 : la signature formelle
  des nœuds, puis Q60, les domaines 5–8, la passe de complétude.