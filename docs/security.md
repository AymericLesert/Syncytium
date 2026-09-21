# La sécurité de Syncytium

Ce document est **la vue transversale de la sécurité** — la relecture,
depuis le début du projet, de tout ce qui protège une instance : qui
entre, qui voit quoi, qui fait quoi, ce qui est tracé, ce qui est
chiffré, ce qui survit à une panne. Il ne remplace aucun artefact :
[rights.md](rights.md) porte le détail des droits (le sujet 2 de la
passe de complétude), [administration.md](administration.md) les
actes d'administration, [telemetry.md](telemetry.md) la détection,
[connectors.md](connectors.md) les contrats des familles. Il les
**relie** — la carte du pilier P8 (« la sécurité et la confidentialité
par construction ») étendue aux décisions qui, sans porter le mot,
font la sécurité de l'ensemble. Les décisions citées renvoient à la
[conception](conception.md).

## La doctrine

Six principes, posés au fil des décisions, gouvernent tout le reste :

1. **La sécurité par construction** (P8) : les droits vivent **au
   modèle** — la confidentialité au champ, l'audience à la ligne, les
   droits d'action à l'entité, le degré à l'opération. Rien ne
   s'ajoute après coup, rien ne se code à part ; le moteur applique ce
   que la description déclare.
2. **Fail-closed** (D34, D71, D93, D102, D699) : le non-exposé est le
   défaut, la ligne sans propriétaire est invisible, le groupe absent
   ferme le champ, le compte sans groupe n'entre pas, la donnée en
   avance sur le moteur est refusée. En cas de doute, la donnée se
   protège — elle ne s'expose pas.
3. **L'anti-oracle** (D126, D144, D153, D193) : l'interdit ne se
   devine pas — ni par la navigation (les entrées de menu filtrées),
   ni par les messages, ni par les comptages, ni par les
   identifiants (opaques, D75).
4. **Restreindre, jamais étendre** (D190, D416, D749) : un module
   restreint la surface ; une délégation joue les droits de
   l'emprunté au même degré ; un wizard n'élargit rien (Q54). Aucun
   chemin n'élève un droit — sauf l'administrateur, toujours tracé.
5. **Masquer, ne jamais détruire** (D137, D141, D184, D714, D722,
   D747) : la suppression est une désactivation, le bannissement
   conserve, le groupe retiré se désactive ; l'effacement physique
   est l'exception tracée (le retour arrière d'une reprise — D184) et
   le droit à l'effacement est **une anonymisation** (D139, D696) ;
   la réactivation d'un enregistrement désactivé est **l'acte
   exceptionnel de l'administrateur**, hors socle et hors hook
   (D903).
6. **La librairie inviolable** (D599) : « la librairie mise en place
   assure l'inviolabilité des règles et des droits » — le hook, le
   connecteur, le composant sont des citoyens du moteur, jamais des
   super-utilisateurs ; un built-in passe par la même frontière qu'un
   externe (D52).

## La carte

| le domaine | l'acquis | les décisions | le détail |
|---|---|---|---|
| **L'identité** | quatre types de comptes étanches, l'UUID interne, la clé d'unicité par connecteur | D28, D77, D82, D142 | [rights.md](rights.md), §5.6 |
| **L'authentification** | la famille `authentication`, cinq classes, le secours et le mode safe | D29–D33, D78, D80–D81, D692, D713, D716, D718, D759 | [connectors.md](connectors.md), [administration.md](administration.md) |
| **La session et l'API** | l'inactivité et la borne absolue ; l'API au porteur, la clé rotative, le rate limiting | D15, D98, D105, D107, D693–D694, D917–D918 | [rights.md](rights.md) |
| **La confidentialité** | trois niveaux emboîtés × les groupes, l'héritage fail-closed, les profils nommés | D25–D27, D102, D144, D170, D364, D885, D923 | [rights.md](rights.md), §5.5 |
| **L'audience** | l'accès au niveau ligne par appartenance, l'anti-IDOR, l'écriture unique | D70–D76, D153 | [rights.md](rights.md), §5.7 |
| **Les droits d'action** | `allow` à deux foyers et quatre étages, les opérations couvertes, le passe-droit tracé | D196, D421–D427, D691, D700, D835, D886 | [rights.md](rights.md) |
| **Les degrés** | user / manager / administrator au contrat, portés par le groupe, l'appartenance obligatoire | D697, D699–D701, D746, D881, D900, D903 | [rights.md](rights.md) |
| **Les groupes et les modules** | la configuration déclare, la base affecte ; la double entrée administrateur ; la délégation | D34, D96, D190, D341, D414–D416, D712, D715, D717, D747, D749 | [administration.md](administration.md) |
| **Les frontières d'extension** | le hook citoyen, la tâche à portée propre, l'interface sans `private`, le connecteur gardé | D52–D53, D58–D59, D66, D599, D603, D626, D633, D642, D904–D906, D913–D914 | [hooks.md](hooks.md), [connectors.md](connectors.md) |
| **L'intégrité** | la concurrence par champ, l'estampille fail-closed, le registre des versions, l'ingestion qui refuse | D93, D111, D326, D330, D344, D920, D927 | §4, §3.2c |
| **La traçabilité** | l'historisation = la trace, la provenance persistante, le motif d'audit, les deux comptes | D62, D169, D178, D182, D238, D411–D413, D429 | §3.11 |
| **L'audit et la détection** | l'audit des lectures, les refus journalisés, le modèle de risque et ses seuils | D41–D43, D47, D50–D51, D97, D702–D704, D740–D741, D925–D926 | [telemetry.md](telemetry.md), §6.4 |
| **Le RGPD** | le client responsable, le marquage `rgpd:`, l'anonymisation, la rétention, le registre | D16, D137, D139, D695–D698, D703 | [rights.md](rights.md), §6.6 |
| **Les secrets et le chiffrement** | la marque `*` (D944), l'empreinte jamais le clair, le `.env` chiffré, HTTPS sans dérogation, le type chiffrant | D33, D463, D603, D705–D708, D730, D901–D902, D915–D916, D919 | [rights.md](rights.md) |
| **La disponibilité** | les fusibles (timeout, rate limiting, cooldown), la condition indispensable, le passif, la sauvegarde | D58, D104–D105, D112–D114, D164, D626–D627, D724–D729, D745, D907–D912, D915, D921–D922, D928 | [administration.md](administration.md), §7.3 |
| **Le chat** | la connaissance sous les droits du demandeur (aucun droit propre au chat), l'anonymisation avant tout envoi sauf le profil connecté, la session par module tracée jusqu'à sa réinitialisation | D957–D960 | [connectors.md](connectors.md), [composants.md](composants.md) |

## L'identité et les comptes

- **Deux identités étanches à l'origine** (D28) — technique (l'API)
  et nominative (l'interface) ; un compte est l'un ou l'autre.
  **Généralisé en quatre types** (D77) : technique, utilisateur
  interne, client provisionné depuis une fiche client par l'ADV,
  client auto-créé vérifié (non prioritaire). **Chaque type a son
  canal** ; la compromission d'un canal n'ouvre pas l'autre.
- **L'identité canonique est un UUID interne stable** (D82, D142) —
  l'ancre de l'appartenance, de l'audit, des références ; jamais
  exposé (l'anti-IDOR D75). **La clé d'unicité** (le rapprochement
  externe → UUID) est **définie par le connecteur** : le GUID Entra en
  priorité (immuable), le courriel en repli (mutable), le login en
  local. L'opération d'administration de **re-liaison / fusion**
  couvre le changement d'adresse et le doublon (D721–D722).
- **Le compte client suit sa fiche** (D77) : fiche désactivée → compte
  désactivé. Le compte technique porte sa version d'API épinglée
  (D98), ses groupes, donc son périmètre.
- **L'entité système `user`** (D719) est définie et maintenue par
  Syncytium : `login`/`email`/`first_name`/`last_name` en
  `rgpd: personal`, `account_type`, `origin` (le connecteur
  d'authentification), `status: active | banned | locked`, `admin`
  (la désignation individuelle), `password` (le local seul), les
  associations `groups`/`modules`. Historisée, ses lectures auditées.

## L'authentification

- **Le cadre générique dès l'origine** (D29, D32, D78) : la nature de
  l'authentification se choisit à l'installation, derrière une
  interface de connecteur, reparamétrable **par un administrateur
  uniquement** ; le login/mot de passe est le défaut ; le technicien
  peut écrire son propre connecteur.
- **La famille `authentication`** (D692, la huitième) : le contrat
  `challenge()` / `verify(preuve)`, aux deux visages — l'utilisateur
  interactif (la session) et l'API (la preuve au porteur, sans
  session). **Cinq classes** : `local` (le haché, les clés d'API),
  `azure_ad` (le bind, le bearer Entra), `sso` (l'OIDC, la signature
  du jeton — l'utilisateur ne confie jamais son secret), `keycloak`
  (D716 — l'IdP open source), `none` (D759 — le mono-poste
  domestique : aucun défi, l'utilisateur et le groupe par défaut au
  degré administrator, les invariants pré-remplis jamais contournés).
- **Une seule source active, le changement gardé** (D80) : pas de
  mode mixte ; changer de source exige une authentification de test
  réussie contre la nouvelle ; l'échec laisse l'ancienne.
- **Le provisionnement JIT** (D30–D31) : le compte nominatif naît au
  premier login, les groupes arrivent dans le jeton à chaque
  connexion — un retrait dans l'annuaire prend effet à la connexion
  suivante ; l'association groupe AD ↔ groupe de la description se
  gère **dans l'interface**, pas dans la description. **Le
  `directory` est en lecture seule** (D633) et coopère avec
  l'authentification (D713) : les comptes synchronisés sont en
  lecture seule dans Syncytium, sauf `admin`, `modules`, `status`.
- **Le secours** — trois étages : **l'amorçage** (D33 — un compte
  administrateur dans la description, **l'empreinte seule, jamais le
  clair**, utilisable seulement si aucun administrateur n'existe) ;
  **le bris de glace** (D81 — le même compte s'active quand
  l'authentification est indisponible, détecté par la santé du
  connecteur ; indépendant de tout connecteur externe ; **audité
  avec motif et alerté**) ; **le mode safe** (D718, D745 — un mode de
  lancement, jamais atteignable depuis l'application vivante : le
  module administration seul, aucune donnée métier, le compte
  principal au mot de passe fixé à l'installation ; tracé — « jamais
  une porte dérobée » ; les conditions indispensables levées, le
  refus de démarrer toujours expliqué).
- **Le quotidien du compte local** (D720–D723) : l'invitation à lien
  limité (le compte naît sans mot de passe, l'administrateur ne le
  connaît jamais) ; le mot de passe oublié par lien ; `renew` = le
  lien, jamais une valeur ; **le verrouillage** après N échecs
  (`lockout: 5`, `cooldown: 15min`, `invitation: 48h` en settings
  dynamiques), les échecs tracés ; tout cela **indisponible en SSO**.
  Les mails du socle en templates surchargeables.

## La session et l'API

- **La session** (D693–D694) : `duration` (l'inactivité, défaut 8h)
  et `limit` (l'absolu, défaut 7d) en settings dynamiques ; la borne
  de l'IdP prime en SSO ; les sessions simultanées libres (D15), la
  révocation par l'administrateur, les sessions visibles ; **la
  session ne fige jamais des droits** — la vérification joue **au
  début** de chaque opération ou sollicitation, servie par un cache
  invalidé à toute modification de droits.
- **Le navigateur** (D917) : la session de l'IHM voyage dans **un
  cookie inaccessible au script**, sécurisé, restreint au site —
  jamais un jeton dans le stockage du navigateur ; **l'API n'accepte
  que la preuve au porteur, jamais le cookie** — la falsification de
  requête inter-sites fermée par construction. **Les origines tierces**
  (D918) : la liste `cors:` à l'environnement — absent = aucune, le
  joker refusé, la preuve au porteur toujours exigée. **L'injection
  de script** (D918) : les valeurs saisies toujours rendues comme du
  texte, les templates du technicien échappent leurs variables et
  refusent le HTML brut, le hook d'interface est le seul code tiers
  au navigateur — listé par la documentation générée, sous la
  responsabilité du technicien — et la page n'autorise que les
  scripts qu'elle connaît.
- **L'API hors session** : chaque requête porte sa preuve. **La clé
  d'API rotative** par défaut (D107 — deux clés actives pendant la
  rotation), **« pour le compte de » par en-tête dédié** (le
  périmètre de délégation D76 — l'API bornée au périmètre ligne du
  sujet, chaque appel attribuable), OAuth2 + Token Exchange RFC 8693
  en déclinaison. Les jetons des comptes techniques sont créés et
  révoqués par l'administration.
- **Les garde-fous du contrat** : la version épinglée au compte
  technique (D98 — la bascule = un acte tracé), 426 sous la version
  minimale (D94), la bêta sur sollicitation explicite seulement
  (D103), **la pagination au curseur opaque** (D100), **le rate
  limiting** 15 req/s par défaut, surchargeable par compte, 429 +
  `Retry-After` (D105).
- **Le webhook** (D640–D642) : aucune entrée anonyme — la garde
  d'office sur la route, **le même `verify`** que l'authentification.

## La confidentialité — qui voit quel champ

- **Trois niveaux emboîtés** (D25) : `public` (l'API, l'interface,
  les tâches), `protected` (l'interface et les tâches), `private`
  (les tâches seulement) — l'ordre total API ⊂ interface ⊂ tâches,
  le défaut `public`. *(Les noms d'origine `publique`/`protegee`/
  `privee` ont pris leur forme anglaise avec le catalogue.)*
- **Le second axe : le qui** (D26–D27) — la restriction par groupe,
  les groupes déclarés dans la description et versionnés avec elle.
  **Les deux se composent** au champ (D364) ; **les profils nommés**
  (D885 — le cas 5) écrivent une fois le niveau et le qui dans les
  settings et se référencent par interpolation
  (`confidentiality: ${settings.confidentiality.financier}`).
- **Changer un niveau = une migration de contrat** (§5.5) : passer un
  champ de `public` à `protected` est une suppression pour l'API —
  le mécanisme de dépréciation D13 s'applique, rien de nouveau.
- **L'héritage fail-closed** (D102, Q23) : un champ calculé hérite
  du niveau **le plus restrictif** de ses sources, y compris à
  travers les relations et les `sources` des hooks ; l'abaissement
  est **explicite et signalé** — jamais silencieux.
- **Le troisième axe** (D144) : la visibilité d'un champ par le
  niveau d'héritage atteint par l'enregistrement — la même
  machinerie.
- **L'historique** (D170, D413) : la visibilité déclarée par groupe
  (`visibility:`), la confidentialité des champs héritée de l'entité
  d'origine, l'anonymisation étendue aux instantanés — sinon la
  fuite.
- **Partout où la donnée sort** : les menus filtrés (D193), l'export
  aux seules colonnes visibles (D196), les widgets, la
  communication (D393), les thèmes (D753), le hook d'interface qui
  ne reçoit **jamais `private`** (§8.2) — **et les fichiers** (D923) :
  le dossier appartient au moteur et n'est jamais servi directement,
  tout accès passe par le moteur sous la confidentialité du champ et
  l'appartenance de la ligne, les noms sur disque sont opaques.

## L'audience — qui voit quelle ligne

- **Deux audiences** (D70) : l'interne (les groupes et les niveaux)
  et l'externe (les clients — l'accès au niveau ligne, **fermé par
  défaut**). Deux axes orthogonaux (D72) : *quelle ligne* ×
  *quel champ* — sur une ligne visible d'un client, les champs
  internes restent masqués.
- **L'appartenance** (D71) : directe (le champ référence-compte),
  indirecte (le chemin `commande.client.compte`), ouverte (les
  catalogues), non exposée (le défaut) ; les chemins multiples
  s'unissent (OU seulement — D74), la ligne sans propriétaire est
  invisible.
- **Lecture / écriture / écriture unique** par champ (D73, D153),
  l'invariant write ⊆ read ; l'écriture unique = le champ vide
  s'écrit, le champ renseigné refuse — l'administrateur en écriture
  pleine, tracée.
- **L'anti-IDOR** (D75) : le filtrage **côté serveur**, les
  identifiants **non devinables**, **le re-contrôle d'appartenance à
  chaque accès direct** (la possession d'un id ne prouve rien),
  l'aliasing par contexte en option forte ; l'abstraction de
  persistance sait filtrer au niveau ligne (RLS natif ou applicatif).

## Les droits d'action — qui fait quoi

- **`allow`, un nom, deux foyers exclusifs** (D422–D423) : le cycle
  (chaque état porte ses droits — `read` absent = l'état masque) ou
  le bloc libre (verbe → expression ou liste de groupes, D700).
  **Quatre étages** (D886) : l'application, le module, l'entité, le
  champ — le plus proche l'emporte ; `update: false` au champ = la
  lecture seule.
- **Les opérations sont des droits d'action** (D691) : le droit de
  déclencher se déclare et se contrôle comme les autres ; l'opération
  autorisée passe outre les `allow` d'état (l'acte porte sa
  légitimité), le graphe des transitions est la seule voie (D425) —
  **sauf le passe-droit administrateur, toujours tracé** (D835).
- **Le degré intrinsèque** (D697, D699–D701) : chaque opération du
  socle déclare son plancher — `user` (le quotidien, quatorze
  opérations), `manager` (`import`, `report`), `administrator`
  (`restore`, `migrate`, `anonymize`, `reset_coverage` — D881, le
  plancher validé par D900). **Le groupe porte le degré** (`degree:`,
  validé D900), l'utilisateur
  atteint celui de son meilleur groupe ; **l'appartenance à un groupe
  est obligatoire** pour tous les types de comptes (D746) ; **le plus
  exigeant l'emporte** — un `allow:` n'abaisse jamais un plancher.
- **La tâche à portée propre** (D53) : elle s'exécute avec sa propre
  `lecture:` (l'élévation contrôlée, type SUID) ; qui déclenche peut
  lire le résultat, les lecteurs additionnels se déclarent. La tâche
  est **le chemin de contournement officiel** de la confidentialité
  (le bulletin PDF incorpore le salaire) — donc une frontière gardée.

## Les groupes, les modules, la délégation

- **La ligne de partage** (D27, D341, D414) : la configuration
  déclare les groupes (`groups.yml` — acyclique, « un groupe est
  constitué d'autres groupes », le degré, l'association `directory:`)
  ; **la base porte les affectations** — l'acte d'administration,
  jamais le dépôt.
- **Le groupe `administrator` d'office** (D712, D717), **l'accès
  administrateur à double entrée** : le groupe **et** la désignation
  individuelle. Le module d'administration exige le degré (D710) —
  l'affectation ne suffit pas.
- **Le groupe supprimé** (D34, D96) : note au technicien, groupe
  ignoré — le champ qu'il restreignait se ferme ; les affectations
  sont conservées et **reprennent vie** si le groupe réapparaît (la
  clé stable) ; le groupe absent de la configuration = désactivé,
  **la purge est humaine** (D747).
- **Le module restreint** (D190, D416) : l'affectation utilisateur ↔
  module ouvre une surface, elle n'étend jamais un droit.
- **La délégation** (D76, D715, D749) : agir à la place d'un
  utilisateur — les droits de l'emprunté, **le même degré**, **le don
  jamais la prise**, **chaque trace porte les deux comptes** ;
  l'administrateur seul peut s'octroyer les droits de quiconque —
  tracé.

## Les frontières d'extension

- **Le mécanisme uniforme** (D52) : un built-in et un externe passent
  par la même frontière déclarée ; aucun raccourci caché. **Le hook
  est déployé, versionné, validé avec la description** (§8.1) — un
  hook qui plante bloque la migration.
- **Les trois modes** (§8.2) : le calcul est **pur** (aucun effet, un
  délai maximal, ses seules `sources` déclarées) ; la tâche a des
  effets, dans sa portée ; **le comportement d'interface s'exécute
  dans le navigateur** — `public` et `protected` seulement, filtré
  par les groupes, **jamais `private`** ; l'injection
  comportementale relève de l'UX, **jamais de la sécurité** (D66 — le
  serveur arbitre) ; **le hook d'interface est le seul code tiers au
  navigateur** (D918) — listé par la documentation générée, sous la
  responsabilité du technicien.
- **La librairie d'exploration** (D572, D599) : le hook lit le modèle
  par les noms logiques, jamais le stockage, écrit dans la
  transaction — les droits, la confidentialité, la validation, la
  concurrence ne se contournent pas.
- **Les opérations appelées par l'API** : le cooldown par opération
  + paramètres (D58 — « protège le hook comme point d'attaque »),
  **un paramètre d'administration** (D904 — le setting dynamique
  `operation.cooldown`, la surcharge à la déclaration, l'API seule,
  le refus journalisé) ; **le déterminisme et sa fenêtre au contrat
  du hook** (D59/D904 — « une opération est déterministe ou pas,
  elle ne peut pas changer sans faire changer son code » : le
  garde-fou vit dans le code, la configuration ne le surcharge
  jamais), l'invalidation par l'administrateur (D60) ;
  l'exécution unique sans rejeu automatique (D57) — **trois
  propriétés d'exécution au contrat du hook** (D905 :
  `execution`, `deterministic`, `deterministic_duration`), jamais
  exposées à la configuration ; **la rétention du résultat à
  l'administration** comme le cooldown (D906 — `operation.retention`,
  le résultat échu purgé) ; **les connecteurs attendus au contrat**
  (D913 — `connectors:` nommés et typés par la famille, liés par
  `uses:` à la déclaration, vérifiés à l'ingestion : le hook ne
  touche que ce qu'il a annoncé).
- **Les connecteurs** : les secrets par paramètre marqué `*` (D944)
  et référence à une variable d'environnement (D603 — jamais de valeur
  en clair au dépôt ni au journal), les
  valeurs à l'environnement (D617), **la condition indispensable**
  (D626 — l'application ne démarre que si le mail à l'administrateur
  est possible), `onerror` gradué (D627 — le mock ou la page de
  maintenance), `directory` en lecture seule (D633), le webhook gardé
  (D642), l'appel chiffré par défaut (D705).

## L'intégrité

- **La concurrence par champ** (D111) : le compare-and-swap
  état-avant/état-après, unique IHM + API ; le conflit rejette
  l'agrégat (409), la suppression première rend 410 ; l'ABA bénin
  par construction.
- **L'estampille fail-closed** (D93) : la base porte la version de
  description et la version de moteur ; en retard → la migration ;
  en avance → **le refus** ; absente ou corrompue → l'initialisation
  ou le refus.
- **L'ingestion refuse** (D330, D344) : le format descendant est
  rejeté sur la seule lecture de l'en-tête ; les incohérences du
  dossier des versions sont des erreurs ; **le registre des versions
  essayées** (D326) interdit l'acharnement — pas de retry sans bump ;
  **l'identité de la version** (D920, D927) : le couple environnement
  + numéro de version, la clé du registre ; l'empreinte du dossier
  ingéré consignée avec elle ; **une version ingérée l'est une
  fois** — la configuration modifiée sous le même numéro n'est pas
  relue, l'empreinte recalculée à chaque chargement **trace l'écart**
  et dit au technicien de changer de numéro ; la sandbox seule se
  recharge (D922).
- **La migration transactionnelle** (D9) après dry-run sur données
  réelles ; le retour arrière gratuit avant bascule, la grâce après
  (D674–D675).
- **Les identifiants** (D142) : la technique invariante à vie, la
  fonctionnelle sur les actifs seuls ; **l'intégrité référentielle
  survit à l'effacement** (D138–D139).

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
  privilégié sans trace**.

## L'audit et la détection

- **L'audit des lectures** (D702–D704) : le grain de **l'acte** (une
  ligne par lecture en masse ou par transaction — qui, quand, quoi,
  par où, combien), jamais une ligne par enregistrement ; le
  `rgpd: sensitive` audité d'office ; `trace: audit` en opt-in,
  **`trace: limited`** en exclusion totale (le mot de passe, la clé —
  D463/D603) ; l'entité d'audit au module d'administration, ses
  surfaces au degré `administrator`.
- **La finalité sécurité de la télémétrie** (D43) : **journaliser les
  refus d'autorisation** — le carburant du canal — et les échecs
  d'authentification (D720). **Le modèle de risque** (D47) : la pente
  normalisée sur fenêtre glissante, le volume absolu, le détecteur
  de pics, **l'étendue d'accès** (le balayage de toute une entité =
  le crawl — le même signal que le N+1, la frontière étant
  l'autorisation), la pente des refus = l'énumération.
- **Les seuils** (D50–D51, D97, D740) : déclarés par élément
  (endpoint, entité, fonction d'IHM — l'export massif surveillé), le
  global en settings dynamiques, **le filet ne se tait jamais** — le
  seuil absent = le défaut global. La calibration : fenêtre 30 j,
  linéaire (log sur demande), pic z ≥ 3 + plancher 100 appels/jour,
  crawl > 50 % d'une table > 1000 lignes, R² ≥ 0,5.
- **Qui voit** (D741) : la télémétrie entière au degré
  `administrator` ; les push (les faits marquants, la synthèse,
  l'alerte de dépréciation) aux administrateurs, chacun à son rythme
  (D748).
- **Les journaux** (D343, D737, D800) : par environnement, en
  anglais, le niveau et la rétention maîtrisés, **la consultation par
  le technicien seul, hors IHM**. **Le journal d'accès reste au
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

## Le RGPD

- **Le client est responsable de traitement** (D16, §6.6) —
  l'instance chez lui ; Syncytium fournit la capacité (la rétention,
  l'anonymisation, l'export). La remontée vers l'éditeur serait un
  **opt-in strict**. Les indicateurs d'usage sont agrégés sur le
  schéma ; les acteurs identifiés ne sont que les comptes
  techniques — la surveillance des salariés est évitée par
  construction ; **la sécurité du SI reste une finalité légitime**
  pour tracer les tentatives nominatives (§6.4).
- **Le marquage** (D695) : `rgpd: personal | sensitive | consent` — le
  modèle sait ce qui est personnel ; le `sensitive` (l'article 9)
  audité d'office (D703).
- **L'effacement = l'anonymisation** (D137, D139, D696) : jamais une
  suppression physique — la valeur de remplacement **construite par
  un algorithme aléatoire, jamais dérivée de l'origine** (ni blanc ni
  haché), sur **les enregistrements et les historiques** ;
  l'enregistrement demeure, la personne disparaît, la provenance
  survit. `anonymize` = la dix-neuvième opération, plancher
  `administrator` (D697) ; le fichier anonymisé = le contenu détruit,
  les mots-clés cohérents (Q39).
- **La rétention** (D698, D411) : la donnée marquée dont la rétention
  échoit **s'anonymise d'office** ; les traces de journal à
  rétention paramétrable et anonymisation optionnelle (D41).
- **Le registre des traitements auto-documenté** (D698) : généré du
  modèle — les champs `rgpd:`, leur confidentialité, leur rétention,
  leurs connecteurs sortants.
- **Le staging porte des données réelles** (§7.3) : l'éphémérité et
  l'accès restreint sont les garde-fous, à documenter chez le
  client.

## Les secrets et le chiffrement

- **L'empreinte jamais le clair** — dès D33 (le compte d'amorçage
  dans un fichier versionné) ; **le type `password`** (D463) :
  write-only (« défini / non défini » en lecture), la saisie masquée
  et double, jamais en liste, recherche, export ni conversion,
  l'empreinte seule aux instantanés, la force par `validation`.
- **Le patron unique des secrets** (D603, D707–D708, D944) : la clé
  de configuration marquée `*` porte la valeur confidentielle (jamais
  en clair dans un journal) et référence la variable ; les variables
  d'environnement (`.env`) **jamais versionnées** (D336 — le dépôt
  du client est distinct), **obligatoirement chiffrées** par la clé
  dérivée **environnement + machine** ; `syncytium encrypt <VAR>
  <valeur>` chiffre avant l'enregistrement, `syncytium decrypt <VAR>`
  ne sert qu'à qui a la machine ; la valeur en clair ne vit qu'en
  mémoire, le temps de l'appel. Le périmètre : les clés d'API, les
  mots de passe de connecteurs, les clés des types chiffrants.
  **Le wizard d'initialisation chiffre lui-même** les secrets qu'il
  demande, et **une valeur en clair dans le `.env`, pour une variable
  référencée par une clé marquée `*`, vaut refus de démarrer**, la
  raison et la commande données (D902/D944).
- **La rotation** (D730) : `syncytium rotate` re-chiffre le `.env`
  et les champs des types chiffrants — au patron de `migrate`,
  tracé ; **déclenchée à chaque restauration** (la machine change, la
  clé aussi) **et à chaque duplication d'une sandbox** (D915 — la
  sandbox est un environnement, donc une clé : la copie de l'origine
  re-chiffrée sous la sienne). **`rotate` est le geste unique de tout
  ce qui re-chiffre ou rehache** (D916) : toute empreinte porte
  l'identifiant de son algorithme — changer d'algorithme ne casse
  aucun compte —, et le passage à l'algorithme courant ne se fait que
  par `rotate`, en masse et tracé, jamais en silence à la
  vérification.
- **En transit** (D705) : ce que Syncytium **sert** est **HTTPS sans
  dérogation** — **la boucle locale comprise** (D919 : aucune
  exemption ; le certificat relève de l'infrastructure et se déclare
  à l'environnement, fourni ou terminé par un proxy ; à défaut,
  **Syncytium engendre un certificat auto-signé** à l'initialisation ;
  servi en clair = refus de démarrer, la raison donnée) ; ce qu'il
  **appelle** est chiffré par défaut,
  l'exception `unencrypted:` déclarée, signalée à l'ingestion,
  visible au `describe()` — **et rappelée chaque jour** au dashboard
  de santé et au mail des faits marquants (D901).
- **Au repos** (D706) : le chiffrement du storage (TDE, disque)
  relève de l'infrastructure, pas de Syncytium ; le chiffrement
  d'une valeur est **un pouvoir de type** (comme `password`) — pas de
  facette : le type chiffre par ses fonctions de valeur et déclare
  ce qu'il sait encore faire (la recherche stricte au mieux, le tri
  perdu).

## La disponibilité et la continuité

- **Les fusibles** : interne — le timeout des fonctions complexes
  (D104), le heartbeat des tâches (D55), le délai maximal des
  calculs ; externe — le rate limiting (D105) ; par tâche — le
  cooldown (D58). La détection a posteriori (D43) est distincte.
- **La position de sécurité** (D625–D627, D745) : l'erreur → la page
  de maintenance + l'alerte ; l'application ne démarre que si elle
  peut alerter (D626), sauf en mode safe ; le refus de démarrer
  s'explique.
- **Les environnements** (D112–D114, D616–D617) : la production, les
  stagings éphémères, la passive du PCA/PRA — chacun ses connecteurs
  et ses secrets ; **la sandbox** (D907–D908) : l'évaluation de la
  description en cours et de ses hooks **dans un environnement
  fermé** — un statut de `versions/` dont chaque version nomme son
  origine par `from:` (`beta/v1.0.0.0`, ou une autre sandbox — la
  transitivité), dupliquée à l'initialisation puis migrée ; les
  connecteurs de son environnement (D911 — la fermeture est l'œuvre
  du technicien, le mock comme pour beta), l'origine jamais
  touchée ; la promotion vers `beta` ou `production` par un geste
  de fichier (D910) — **`from:` retiré à la promotion, sinon une
  erreur avant l'ingestion ; l'origine promue casse le lien des
  sandboxes qui la citaient, une erreur** (D928 — tout lien s'écrit,
  aucun ne se devine) ; **l'instance survit à l'arrêt, la suppression
  est un geste** (D912 — la commande ou la rétention d'inactivité,
  le registre des instances à la vue de santé) ; **son ingestion est
  un acte d'administration** (D921 — le dossier posé ne fait rien,
  l'administrateur déclenche, tracé) ; **la recharge** (D922 —
  l'ingestion rejouée, réservée au statut sandbox) ; la synchronisation porte **la base et les
  fichiers** (D164) ; actif et passif **aux mêmes versions et
  configurations** (D744) ; le retard surveillé, l'alerte au seuil.
- **La sauvegarde** (D727–D729) : l'instance dupliquée + les fichiers
  + la configuration vers une destination, la rétention en jours ;
  **la restauration est une commande hors application** (D751) — une
  image à sa propre vie, la rotation des clés enchaînée.
- **Les migrations** : le dry-run sur données réelles, la fenêtre
  d'affluence, la transaction, la file de tâches drainée pendant la
  migration (D24) ; la montée de version **sans redémarrage** (D801).

## Les invariants — la liste de contrôle

Ce que toute implémentation devra prouver, décision par décision :

1. un compte sans groupe n'entre pas (D699) — tous types confondus
   (D746) ;
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
9. un secret n'est jamais en clair au dépôt ni relu par l'application
   (D33, D463, D603, D707) ; jamais tracé (D703) ; en clair dans le
   `.env`, il empêche le démarrage (D902) ;
10. ce qui est servi est HTTPS sans dérogation, la boucle locale
    comprise — vérifié au démarrage (D705, D919) ;
11. aucune entrée anonyme sur un webhook (D642) ;
12. la suppression désactive ; l'effacement RGPD anonymise sans
    dériver de l'origine (D137, D696) ;
13. le hook ne contourne ni droits, ni confidentialité, ni
    validation, ni concurrence (D599) ;
14. la donnée en avance sur le moteur est refusée (D93) ;
15. une alerte de sécurité ne peut se taire — le seuil absent = le
    défaut global (D51) ;
16. le chat ne sait jamais plus que l'utilisateur qui l'interroge —
    aucun droit propre au chat, les droits sont ceux des composantes
    de la description (D960) ; rien de personnel ne quitte l'instance
    sans anonymisation, hors les données du profil connecté ; aucun
    échange — question ou réponse — sans trace (D957–D959).

## Les points ouverts

**Tranchés le 13/09/2026** (à la relecture de ce document) :
`degree:` et le plancher de `reset_coverage` (D900), `unencrypted:`
visible chaque jour (D901), le chiffrement automatisé et le clair
refusé au démarrage (D902), la réactivation d'un enregistrement
désactivé — l'acte exceptionnel de l'administrateur, hors socle et
hors hook (D903) ; le déterminisme au contrat du hook et le
cooldown à l'administration (D904 — le reliquat de Q31 soldé), les
propriétés d'exécution de juin reprises au contrat du hook (D905),
la rétention du résultat à l'administration (D906).

**Renvoyé :**

- la question 10 du cadrage du cas 5 (l'authentification de
  l'entreprise, les groupes et les strates « de l'opérateur aux
  dirigeants ») **reste au cas** — usecases/05_entrepot.md, « nous
  verrons sur le cas 3 [5] en cours de description ».

**Jamais abordés — le domaine 7 (l'architecture technique, Q7) :**

- ~~la sandbox des hooks~~ — **tranché par D907–D911** : la sandbox
  est **un statut de `versions/`** lié à son environnement, `from:
  <statut>/<version>` dans chaque `version.yml`, la transitivité,
  la promotion vers `beta` ou `production` par un geste de fichier,
  les connecteurs à l'environnement (le mock comme pour beta),
  l'instance qui survit à l'arrêt et la suppression par commande ou
  rétention (D912) — non une cage autour du code ; **et D913** : le
  hook déclare à son contrat les connecteurs qu'il attend
  (`connectors:`, nommés et typés par la famille), la déclaration
  les lie (`uses:` — toujours écrit, aucune liaison implicite,
  D914), l'ingestion vérifie, tout connecteur non attendu est hors
  de portée ; le langage du code des hooks reste à Q7 ;
- ~~l'algorithme de hachage et la dérivation de clé~~ — **tranché
  par D916** : l'empreinte porte l'identifiant de son algorithme ;
  le rehachage et le re-chiffrement par `rotate` seul, jamais en
  silence à la vérification ; le choix des algorithmes reste à Q7
  sous une exigence : des standards publiés, jamais un algorithme
  maison ;
- ~~la protection du navigateur~~ — **tranché par D917–D918** : le
  cookie inaccessible au script, l'API au porteur seul, `cors:` à
  l'environnement, les valeurs en texte, les templates échappés, le
  hook d'interface seul code tiers, la page qui n'autorise que ses
  scripts ; les en-têtes exacts (le cookie, la politique de contenu)
  restent à Q7 ;
- ~~la gestion des certificats TLS et la terminaison HTTPS~~ —
  **tranché par D919** : le certificat à l'infrastructure, déclaré à
  l'environnement (fourni ou proxy), l'auto-signé engendré par
  Syncytium à défaut, HTTPS vérifié au démarrage sans exemption ;
  l'en-tête du proxy et la forme de l'auto-signé à Q7 ;
- ~~la sécurité du dépôt de configuration du client~~ — **tranché
  par D920** : le dépôt est un dossier, sa synchronisation et ses
  droits sont hors Syncytium (git ou autre) ; l'ingestion calcule
  l'empreinte du dossier de la version et la consigne au registre
  sous la clé environnement + numéro de version ; la signature d'une
  version reste différée ;
- ~~la sécurité des fichiers hors base~~ — **tranché par D923** : le
  dossier au moteur, jamais servi directement ; tout accès sous la
  confidentialité du champ et l'appartenance de la ligne ; les noms
  opaques ; les droits du dossier à l'infrastructure ;
- ~~les dépendances et leur veille~~ — **tranché par D924** : la
  documentation générée liste les dépendances du moteur et leurs
  versions ; les failles sont identifiées par le dépôt ou une action
  extérieure, jamais par le moteur ;
- ~~la journalisation des accès web~~ — **tranché par D925–D926** :
  le journal d'accès reste au proxy ; le journal du moteur porte les
  événements de sécurité à leur niveau, jamais un secret ; le
  throttling des traces contre la saturation.

**Le domaine 7 est couvert en huit principes (D907–D926).** Ce qui
reste à Q7 est le moyen — les algorithmes, les en-têtes du cookie
et de la politique de contenu, l'en-tête du proxy, la forme de
l'auto-signé, le langage du code des hooks —, jamais le principe.

**Le volet sécurité est clos le 13/09/2026** (D900–D928, 928
décisions) : « dans cette session, je clos le point sécurité.
Peut-être ajouterons-nous d'autres points, si nécessaire. » Ce
document reste la vue vivante : toute décision nouvelle qui touche
la sécurité s'y reporte, comme au §1.2 de la conception.
