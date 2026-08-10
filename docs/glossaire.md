# Glossaire

Le vocabulaire du projet Syncytium, fixé terme par terme (D417). Chaque
entrée renvoie aux décisions qui la fondent (voir
[conception.md](conception.md), §2). L'unification « les modules
fonctionnels = les modules » (D416) a montré le besoin : les termes
vivent, le glossaire les ancre. Il a vocation à nourrir la
documentation générée (D333) et la documentation en amont (Q58).

*Ordre alphabétique. Les termes en gras dans une définition ont leur
propre entrée.*

---

**Agrégat** — la racine et ses **compositions**, prises comme un tout :
le plancher transactionnel (D101), la frontière intra-module (D116) ;
l'**instantané** d'historisation le capture entier (D169) ; la mise à
jour d'un enfant reprend la racine (D111/D192).

**Anonymisation** — l'effacement de la **clé fonctionnelle** d'un
enregistrement, l'**identité technique** préservée (D139/D142) ;
s'étend à l'historique (D170).

**Association** — le lien libre entre entités
(`association with <entité>`) : plusieurs, sans possession ni cascade,
inter-modules permis (D400) ; reprend les propriétés de la
**référence** (D401). Voir **vue dérivée** pour la forme
conditionnelle.

**Audience** — la dimension interne (collaborateurs) / externe
(clients, portail) du modèle d'accès (D70).

**Champ** — la donnée atomique d'une **entité** (D118) : un **type**,
ses facettes, et le socle commun de dix propriétés (D364).

**Champ calculé** — un champ porté par une expression
(`computed:`, D90), recalculé quand un champ concerné change (D255) ;
en lecture à date, évalué sur les **instantanés** (D172).

**Clé fonctionnelle** — l'identité métier d'un enregistrement
(`identity:` sur l'entité, D142/D357) ; unique parmi les actifs
seulement (D141) ; portée par le CSV aux frontières (D398).

**Composant** — le rendu graphique d'un type (D64, la matrice 7 types ×
3 modes × 2 orientations D250) ; surchargeable par `component` au champ
puis au formulaire, parmi les compatibles (D270).

**Composé (type)** — un type bâti sur une base, à validation intégrée
et facettes propres (D122/D391) : `amount`, `percentage`, `siren`,
`geolocation`, `period`…

**Composition** — la possession forte : le possesseur déclare
(`lines: list of order_line`, D399), l'enfant ne déclare rien ; cascade
de vie, atomicité de l'**agrégat**, intra-module (D116/D400) ;
imbrication multi-niveaux, la racine pour ancre (D400).

**Compteur** — le type `counter` (D154–D155/D409) : allocation dans la
transaction, unicité et continuité (l'exigence comptable),
format-gabarit (`{counter:000000}`), `reset:` déclaré, mutualisable par
le nom (`counter[accounting]`).

**Confidentialité** — les trois niveaux emboîtés d'un champ :
`public` ⊂ `protected` ⊂ `private` (D25), affinés par restrictions de
**groupes** (D26–D27).

**Connecteur** — l'échange déclaré avec un système tiers (D79–D89) : le
moteur porte le cadre, le connecteur la sémantique ; le connecteur de
reprise est un connecteur ordinaire déclaré « reprise » (D175).

**Crochet (paramètre en ligne)** — la convention `type[paramètre]` du
format (D366) : `text[3..10]`, `time[hh:mm]`, `image[1920x1080]`,
`similarity[0.8]`, `mutualizable[who]`, `counter[nom]`,
`temporal[730]`…

**Description** — l'ensemble des fichiers YAML écrits par le
**technicien** (le dépôt du client, distinct du projet — D336) ;
enveloppe convertie en logique interne à l'**ingestion**, inerte
ensuite (D330).

**Dry-run** — l'exécution à blanc avec rapport : les migrations sur
données réelles, l'import cellule par cellule (D120).

**Entité** — l'objet métier d'un **module** : un fichier propre (D347),
un en-tête (`name`, `labels`, `inheritance`, `identity`, `label`,
`image`, `history`), ses `fields:` et ses `validation:` (D404/D410).

**Entrée de version** — le fichier `<version>.yml` : son en-tête
déclare la version du **méta-schéma**, il référence le sous-dossier du
détail (D322).

**Environnement** — staging, production active, production passive
(D112–D114) ; configuration commune aux versions, déclinée par
environnement dans `environments/` (D342–D343).

**Facette** — un aspect d'un type : logique (canonique), stockage,
affichage (défaut de l'export), API (D119).

**Forme courte** — la déclaration en une valeur chaîne : `notes: text`
(D356), `customer: customer` (D396), `satisfaction: percentage` — le
type seul, tout au défaut.

**Groupe** — l'ensemble nommé servant la **confidentialité**, la
visibilité d'historique, les destinataires de rapports (D26/D414) ;
constitué d'autres groupes (acyclique) ; les affectations de personnes
restent en base (D27/D341).

**Hook** — l'extension par code au contrat Syncytium (D36/D52) : types,
composants (D263), fonctions, connecteurs. Les types du catalogue sont
les hooks embarqués par Syncytium ; le mot « hook » n'apparaît jamais
dans une description (D408).

**Horodatage** — `datetime[timestamp]` : l'instant stocké UTC, affiché
selon la langue (D220) ; s'oppose à la valeur **brute** (civile), qui
ne se convertit jamais.

**Identité technique** — l'UUID interne, invariant à vie (D142) : le
squelette référentiel (références D398, audit, chemins) ; jamais exposé
aux utilisateurs (Q49).

**Ingestion** — la lecture, la validation et la conversion d'une
description déposée (D330) ; les incohérences y sont des **erreurs**
franches (version en double D344, masque + taille D366, cycle de
groupes D414, doublon de nom de type D408…).

**Instance** — l'installation d'un client : une par TPE (D16) — le
moteur, la base, la description, ses environnements.

**Instantané** — l'entrée d'historique : **toutes** les valeurs de
l'**agrégat** à une date, jamais des écarts (D169) ; lecture seule ;
sert la consultation temporelle (D172) et la règle de lecture hors
couverture (D412).

**Langage d'expression** — le langage unique du projet (§3.3,
D90/D301–D312) : calculs, validations, filtres (`me.`), gabarits
(`"{code} — {company_name}"`), migrations ; catalogue et mots-clés en
anglais, échec par contexte, coercition jamais silencieuse.

**Liste (type)** — `list of X` : la multi-valuation d'un type (D166/
D362 — les facettes du champ contraignent chaque élément) ;
`list of <entité>` = **composition** (D399) ; `list of [a, b]` = le
lien **n-aire** (D402).

**Masque d'explication** — l'aide en ligne portée par les
`description:` du modèle (D209/D333) ; ne pas confondre avec le
**masque de saisie**.

**Masque de saisie** — le format contraint d'une valeur (`mask`) :
`_`/`9`/littéraux/classes pour le texte (D260), le `0` des nombres
(D370), les deux notations de la durée (D378) ; ne pas confondre avec
le **masque d'explication**.

**Méta-schéma** — le format des descriptions lui-même : versionné
(l'en-tête de l'**entrée de version**, D322), converti à l'ingestion
(ascendant), refusé proprement (descendant) (D332) ; auto-descriptif à
terme (D44).

**Migration** — le passage d'une version de description à la suivante,
à chaud (D3) ; le journal compilé au format du moteur, persistant
(D331) ; déclenche les rapports `when: migration` (D406).

**Mode (d'un champ)** — `editable` (défaut), `read-only`,
`write-once` — l'écriture unique, posée à la création (D364).

**Module** — LE concept unifié (D416) : la donnée **et** l'expérience.
Un dossier avec `module.yml`, `settings.yml`, `menu.yml`, `entities/`
(D347–D351) ; la déclaration vaut activation (D350) ; l'affectation
utilisateur ↔ module est un acte d'administration (D210/D341) ; il
restreint la surface, n'étend jamais les droits (D190). `modules.yml`
en donne la liste explicite (D415).

**Mutualisé (champ de recherche)** — la boîte de recherche partagée
entre plusieurs champs (`mutualizable[nom]`, D367–D368) ; tout type y
entre par sa conversion en texte (D369) — la forme affichée, le
libellé, le texte associé d'une géolocalisation (D392).

**Opération** — l'action déclarée d'une entité (D148) : sous droits
(D196), déclencheur possible d'une transition d'états (D354).

**Provenance** — l'origine d'un enregistrement repris : connecteur,
date, clé d'origine (D178) — un fait historique, jamais un lien vivant.

**Rapport des non-conformes** — le rapport d'un filtre de lien (D395) :
paramétré en cascade à quatre étages, existant par défaut (à la
demande, vers l'administrateur), `report: no` pour l'exclure,
`when`/`to`/`by` pour l'enrichir (D406–D407).

**Référence** — le lien unitaire : l'origine porte le champ
(`advisor: hr.employee`, D394/D396), la destination y accède en retour
sans rien déclarer ; filtre évalué depuis la destination (`me.` =
l'origine), `check: selection | immutable` (D395) ; stockage = l'UUID
(D398).

**Ressources** — le dossier `resources/` : logos, icônes d'énumérés,
placeholders — partagés entre toutes les versions (D346/D390).

**Surface** — un écran nommé généré : la liste, le formulaire, le
widget de résumé, le widget de synthèse (Q48, D185+) ; le domaine 4 de
l'inventaire.

**Technicien** — le rôle qui écrit la description (D95) : paramétrable,
porté par une à n personnes ; distinct de l'administrateur (les actes
en base) et de l'opérateur (l'usage).

**Télémétrie** — l'observation d'usage déclarée au modèle (D38–D43) :
par champ (à la volée), par entité (stockée), par API (comptée) ;
nourrit le conseil SEQUITUR (D315–D319) et la documentation vivante
(D334).

**Type** — le contrat d'un champ : **le nom est la clé** (D408) — le
catalogue (les hooks embarqués), les **types personnalisés**, les
entités (la **référence** par le nom), les hooks tiers.

**Type personnalisé** — le type déclaré dans un `settings:`
(version / module / entité — D359) : des défauts surchargeables,
chaînable, le plus proche l'emporte, sans porter le graphe de
conversion (D360).

**Validation** — les règles de refus : au champ (sa valeur — le
`matches`), à l'entité (l'enregistrement — le bloc `validation:`)
(D364/D404) ; toute règle en échec = refus + trace (D307).

**Version (de description)** — la publication d'un état :
`<majeure>.<mineure>.<indice>.<build>` croissante, déposer = publier
(D324), le statut est l'emplacement (`beta/ production/ deprecated/
forbidden/`, D338/D340), transitions unidirectionnelles (D344–D345).

**Vue dérivée** — l'association conditionnelle
(`orders: association with order if order.customer = me`, D405) :
jamais stockée, en lecture — la vérité reste la référence qui la fonde.

**Wizard** — le menu-parcours : mono-utilisateur, une session, des
étapes-surfaces à transitions conditionnelles, la transaction à la
sortie (D230–D233) ; n'élargit jamais les droits.

**Widget** — trois espèces à ne pas confondre : le **widget
d'accueil** (indicateur ou liste sur la page d'accueil, D191), le
**widget de résumé** (le survol d'une référence, D185), le **widget de
synthèse** (graphiques, KPI, tableaux croisés — D247, Q53).
