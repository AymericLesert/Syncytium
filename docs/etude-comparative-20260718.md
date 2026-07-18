# Étude comparative — mise à jour du 18/07/2026 (périmètre complet)

> Document de détail de l'étude synthétisée au **§9.5 de
> [conception.md](conception.md)**. Il consigne les affirmations vérifiées
> verbatim, leurs sources, les votes des panels de vérification, les
> affirmations restées non vérifiées, et les limites de l'exercice.

## 1. Objet et méthode

**Objet.** L'étude comparative initiale (§9 de conception.md) avait été
menée avant la clôture du modèle de données, du thème E (UI/UX) et de la
spécification du langage. À la demande de l'auteur, elle a été **reprise
avec le périmètre complet des 312 décisions**, avec pour questions : (a)
l'ensemble est-il couvert par quiconque ? (b) le différenciateur
(compatibilité d'API bidirectionnelle auto-générée depuis les migrations
déclaratives) a-t-il désormais un précédent ? (c) en cas d'adossement,
quel serait le socle le moins mauvais et que sacrifierait-on ?

**Méthode.** Harnais de recherche approfondie : décomposition en **5 angles
priorisés** (piliers 1, 2, 3, 6 et 10 du brief), recherches web parallèles,
collecte et lecture de **24 sources**, extraction de **118 affirmations
falsifiables**, soumission des **25 plus importantes** à des **panels de
vérification adversariale** (3 vérificateurs indépendants par affirmation,
chacun cherchant à la réfuter). Deux passes ont été nécessaires (la
première fauchée par des limites de quota ; la seconde en reprise sur
cache). Bilan des panels : **11 affirmations confirmées à l'unanimité des
votes exprimés, 0 réfutée, 14 non départagées** (panels en erreur de
quota). L'affirmation la plus décisive pour le verdict a été **re-vérifiée
directement sur la documentation primaire** le 18/07/2026 (voir §3).

## 2. Les affirmations confirmées par les panels (11)

| # | Affirmation | Source | Citation | Vote |
|---|---|---|---|---|
| C1 | Le DocType est l'unité déclarative unique de Frappe Framework, couvrant à la fois modèle de données, vue et contrôleur — soit une description unique générant modèle + IHM, ce qui en fait l'acteur le plus proche du pilier 1 de Syncytium. | [frappe.io/framework/doctype](https://frappe.io/framework/doctype) | « The basic building block of Frappe Framework is a DocType. It is the model+view+controller for your application. » | 3-0 |
| C2 | Modifier les métadonnées d'un DocType met à jour automatiquement le schéma de base de données ET l'interface utilisateur — génération pilotée par métadonnées du couple modèle + IHM. | [frappe.io/framework/doctype](https://frappe.io/framework/doctype) | « Changing the metadata will change the schema and the user interface automatically. » | 3-0 |
| C3 | Il existe un précédent open source de versionnement d'API « à la Stripe » : **Cadwyn**, framework Python/FastAPI sous licence MIT, qui se présente comme prêt pour la production et porté par la communauté — ce qui **invalide partiellement** le constat antérieur d'absence totale de précédent open source pour la chaîne de translation à la Stripe (pilier 3). | [github.com/zmievsa/cadwyn](https://github.com/zmievsa/cadwyn) | « Production-ready community-driven modern Stripe-like API versioning in FastAPI » | 2-0 |
| C4 | Le modèle Stripe en vigueur en 2026 nomme les versions par date + nom de release (version courante citée : `2026-06-24.dahlia`) et distingue releases majeures (non rétrocompatibles, p. ex. Acacia) et mensuelles (rétrocompatibles, reprenant le nom de la dernière majeure). | [docs.stripe.com/api/versioning](https://docs.stripe.com/api/versioning) | « Each major release, such as Acacia, includes changes that aren't backward-compatible with previous releases… Each monthly release includes only backward-compatible changes, and uses the same name as the last major release. » | 3-0 |
| C5 | **pgroll** est un outil open source de migrations de schéma PostgreSQL sans interruption, où les migrations sont **déclaratives** (fichiers JSON, tableau d'« operations »), avec backfill automatique et **rollback possible à tout moment pendant la migration**. | [github.com/xataio/pgroll](https://github.com/xataio/pgroll) | « At any point during a migration, it can be rolled back to the previous version. » | 3-0 |
| C6 | pgroll maintient les **ancienne ET nouvelle versions du schéma accessibles simultanément** pendant une migration (schémas virtuels versionnés — vues — sélectionnés par `search_path`) : une compatibilité bidirectionnelle ascendante/descendante **au niveau SQL**, mais **pas** une chaîne de translation d'API générée depuis un journal de migrations. | [github.com/xataio/pgroll](https://github.com/xataio/pgroll) | « old and new schema versions work simultaneously (even when breaking changes are being made!) » | 3-0 |
| C7 | Pour un changement cassant, pgroll suit le modèle expand/contract (nouvelle colonne physique + backfill, coexistence pendant la transition) ; le README **ne documente ni dry-run sur données réelles, ni règles d'éclatement par regex ou de fusion par gabarit** du niveau spécifié par Syncytium. | [github.com/xataio/pgroll](https://github.com/xataio/pgroll) | « will create a new column in the physical schema, and backfill it from the old column » | 3-0 |
| C8 | **Reshape** est un outil open source (MIT) de migration de schéma PostgreSQL « zero-downtime », migrations **déclaratives** (TOML/JSON) ; il gère automatiquement des migrations complexes qui exigeraient normalement une interruption — acteur direct du pilier 2, **au niveau base de données seulement** (ni IHM ni API générées). | [github.com/fabianlindfors/reshape](https://github.com/fabianlindfors/reshape) | « Reshape is an easy-to-use, zero-downtime schema migration tool for Postgres. It automatically handles complex migrations that would normally require downtime or manual multi-step changes. » | 3-0 |
| C9 | Pendant une migration, Reshape fait **coexister l'ancien et le nouveau schéma** (vues encapsulant les tables + triggers traduisant les écritures entre schémas) — une compatibilité bidirectionnelle **auto-générée depuis les définitions de migration**, mais au niveau du schéma SQL, pas d'une API HTTP versionnée. | [github.com/fabianlindfors/reshape](https://github.com/fabianlindfors/reshape) | « Reshape works by creating views that encapsulate the underlying tables… During a migration, Reshape will automatically create a new set of views and set up triggers to translate inserts and updates between the old and new schema. » | 3-0 |
| C10 | La fenêtre de compatibilité de Reshape est **temporaire et non persistante** : la complétion supprime l'ancien schéma, les données intermédiaires et les triggers — **ni chaîne de versions persistante à la Stripe, ni épinglage par compte** ; le pilier 3 de Syncytium reste sans équivalent dans cet outil, pourtant le précédent open source le plus proche mécaniquement. | [github.com/fabianlindfors/reshape](https://github.com/fabianlindfors/reshape) | « Removes the old schema and any intermediate data and triggers. […] you need to run a query to select the most recent schema. » | 3-0 |
| C11 | **Atlas** (ariga/atlas) propose en 2026 un flux de migrations déclaratives avec **pré-planification** : `atlas schema plan` permet de générer, relire et faire approuver un plan avant `atlas schema apply` — l'état de l'art du pilier 2 inclut la revue préalable de migrations déclaratives. | [atlasgo.io/declarative/plan](https://atlasgo.io/declarative/plan) | « The `atlas schema plan` command allows users to pre-plan, review, and approve migrations before executing `atlas schema apply` on the database. » | 3-0 |

## 3. La vérification directe complémentaire (18/07/2026)

Les panels portant sur la **nature des « VersionChange » de Cadwyn** — la
nuance décisive du pilier 3 — ayant tous été fauchés par les limites de
quota, cette affirmation a été **vérifiée directement** sur la
documentation primaire ([docs.cadwyn.dev, page Version
Changes](https://docs.cadwyn.dev/concepts/version_changes/)) :

1. **Les `VersionChange` sont des classes écrites à la main** par les
   développeurs : instructions de schéma (ex.
   `schema(BaseInvoice).field("creation_date").had(name="created_at")`) et
   convertisseurs Python décorés
   (`@convert_request_to_next_version_for`,
   `@convert_response_to_previous_version_for`). Citation : « VersionChange
   classes describe each atomic group of business capabilities that you
   have altered in a version. »
2. **Aucune génération automatique** depuis un journal de migrations du
   modèle de données n'est mentionnée — le processus est manuel et
   intentionnel (« Follow these steps to add a new version: 1. Introduce a
   breaking change in your HEAD version 2. Apply reverse changes to older
   versions using special "migration instructions" »).
3. **Aucune mention** d'un épinglage de version par compte (account
   pinning) ni de statuts de cycle de vie (bêta, dépréciée, interdite).

## 4. Les affirmations non départagées par les panels (14)

Panels en erreur de quota (0 à 1 vote exprimé sur 3) — affirmations
extraites de sources primaires, **à considérer avec la prudence
correspondante**. Trois sources indépendantes convergent sur les
affirmations Cadwyn (README GitHub, docs.cadwyn.dev, article Monite), et
les points N1–N3 sont recoupés par la vérification directe du §3.

| # | Affirmation (résumé) | Source | Statut |
|---|---|---|---|
| N1 | Cadwyn : on ne maintient que la version la plus récente, les antérieures sont générées automatiquement depuis les « version changes ». | github.com/zmievsa/cadwyn, docs.cadwyn.dev | 1 vote pour, 2 en erreur ; cohérent §3 |
| N2 | Cadwyn : chaîne de translation bidirectionnelle (requêtes migrées vers l'avant, réponses vers l'arrière, le métier ne voyant que la version de tête). | github.com/zmievsa/cadwyn, docs.cadwyn.dev, dev.to/monite | panels en erreur ; cohérent §3 |
| N3 | Cadwyn : VersionChange écrits à la main (pas dérivés d'un journal de migrations du modèle) ; pas d'épinglage par compte ni de statuts de versions ; la doc traite le versionnement des données comme un sujet séparé (« Beware of data versioning »). | docs.cadwyn.dev, dev.to/monite | **recoupé et confirmé par la vérification directe (§3)** |
| N4 | Monite a publié Cadwyn en open source (précédent direct depuis au moins août 2024). | dev.to/monite/api-versioning-at-monite | panels en erreur |
| N5 | Stripe épingle chaque compte sur une version par défaut (gérée dans Workbench), surchargeable par requête via l'en-tête `Stripe-Version` — précédent commercial direct de l'épinglage par compte (notre D98). | docs.stripe.com/api/versioning | panels en erreur ; conforme à la connaissance établie |
| N6 | La pré-planification déclarative d'Atlas (`schema plan`) serait réservée au niveau **Pro payant** (connexion `atlas login` exigée). | atlasgo.io/declarative/plan | panels en erreur |
| N7 | XTDB v2 : première version stable annoncée le 12 juin 2025 par JUXT (API SQL et format de stockage stables, partenaires en production). | xtdb.com/blog/launching-xtdb-v2 | panels en erreur |
| N8 | XTDB v2 : toutes les tables **bitemporelles par défaut** (system time + valid time, inspiré SQL:2011), lecture « à une date » en SQL (`SELECT * FROM users FOR VALID_TIME AS OF '2024-01-01'…`) — précédent de l'API temporelle **au grain de la ligne**, pas par instantanés d'agrégats (« No need for explicit snapshots and copies »). | xtdb.com/blog/launching-xtdb-v2 | panels en erreur |

*(Les 6 affirmations restantes des 14 sont des variantes des précédentes
issues de sources redondantes — regroupées ici par thème.)*

## 5. Les sources collectées (24)

| Source | Qualité | Affirmations extraites |
|---|---|---|
| frappe.io/framework/doctype | primaire | 5 |
| discuss.frappe.io (« DocType — the complete story ») | forum | 5 |
| nocobase.com/en/blog/open-source-data-apps | blog éditeur | 5 |
| openalternative.co/compare/budibase/vs/nocodb | secondaire | 5 |
| bullet.so/blog/best-frappe-alternatives | blog | 5 |
| sliplane.io/blog/5-open-source-nocobase-alternatives | blog | 5 |
| github.com/zmievsa/cadwyn | primaire | 5 |
| docs.cadwyn.dev | primaire | 5 |
| dev.to/monite/api-versioning-at-monite | primaire (éditeur) | 5 |
| getconvoy.io/blog/rolling-versions | blog | 5 |
| docs.stripe.com/api/versioning | primaire | 5 |
| ardentperf.com (« Database schema migrations in 2026 — survey ») | blog | 5 |
| github.com/xataio/pgroll | primaire | 5 |
| github.com/fabianlindfors/reshape | primaire | 5 |
| fabianlindfors.se (« Complex schema migrations with Reshape ») | blog auteur | 5 |
| fabianlindfors.se (« Renaming database fields is unreasonably hard ») | blog auteur | 5 |
| atlasgo.io/declarative/plan | primaire | 4 |
| xtdb.com/blog/launching-xtdb-v2 | primaire | 5 |
| docs.xtdb.com/concepts/key-concepts | primaire | 5 |
| docs.datomic.com/client-tutorial/history | primaire | 4 |
| event-driven.io (« Temporal tables and event sourcing ») | blog | 5 |
| directus.com/resources/directus-v12-license-change | primaire | 5 |
| github.com/nocodb/nocodb/discussions/12891 | primaire | 5 |
| redis.io/blog/agplv3 | primaire | 5 |

Signaux additionnels issus de l'extraction (non passés en panel) :
**NocoDB sous AGPL-3.0** (constat au 17/07/2026) ; **NocoBase** se
positionnant « data-model-driven » par opposition aux outils centrés
tableur ; **Directus v12 (mai 2026)** passant de BSL 1.1 à la « Monospace
Sustainable Core License » (MSCL) — hors open source ; **Redis** revenu à
l'**AGPLv3**.

## 6. Analyse par pilier et verdict

L'analyse consolidée et le verdict sont consignés au **§9.5 de
[conception.md](conception.md)** — en particulier la **reformulation du
pilier 3** : le patron de translation à la Stripe a des précédents open
source (Cadwyn côté API, écrit à la main ; Reshape/pgroll côté SQL,
auto-généré mais temporaire) ; la combinaison de Syncytium — **chaîne de
translation d'API auto-générée depuis le journal de migrations
déclaratives du modèle, persistante, avec cycle de vie des versions et
épinglage par compte** — reste **sans équivalent identifié**. Le
« construire » sort **renforcé** ; Cadwyn, pgroll et Reshape passent du
statut de menaces à celui d'**études de conception pour
l'implémentation**.

## 7. Passe complémentaire superficielle (18/07/2026) — piliers 4, 5, 7, 8, 9

> **Statut : indicatif.** À la demande de l'auteur, une passe **volontairement
> superficielle** — un sondage de recherche par pilier, sans lecture
> approfondie des sources ni vérification adversariale. Elle comble l'angle
> mort signalé au §8 sans prétendre au niveau de preuve des piliers
> principaux.

**P4 — IHM générée riche.** Les recherches remontent des générateurs de
formulaires et des catalogues de tableaux de bord (Budibase et consorts),
et OpenMetadata — un **catalogue de métadonnées de données**, domaine
distinct. **Aucune plateforme n'émerge** qui génère depuis un schéma la
combinaison wizard déclaratif + tableaux de bord à drill-down + croisés
dynamiques + catalogue de composants décliné par mode/orientation. Les
acteurs du pilier 1 (Frappe, NocoBase) restent les plus proches, loin du
niveau spécifié.

**P5 — entrepôt opérationnel + applications.** Le paysage est net : d'un
côté les orchestrateurs/ETL à lineage (**Kestra, Dagster, Airbyte,
DataHub**) — lineage au grain du *jeu de données*, pas de l'enregistrement,
sans IHM applicative ; de l'autre les app-builders sans reprise outillée.
**La combinaison** (ETL déclaratif à couverture mesurée + stock de rejets à
statuts + provenance par enregistrement + insertion antidatée, dans le même
moteur que les applications) **n'apparaît nulle part**.

**P7 — spécificités métier.** Les recherches ne remontent que des
**applications** de facturation autonomes (Crater, InvoicePlane,
SolidInvoice) qui codent en dur leur numérotation. **Aucun framework**
n'expose compteurs sans trou + machine à états d'enregistrement (héritage-
état) + sécurité ligne à identifiants opaques comme **propriétés
déclarables d'un modèle**.

**P8 — import/export miroir.** **Le patron round-trip a des précédents
établis au niveau fonctionnalité** — à consigner honnêtement :
**AppSheet** (Google) fait du ré-import CSV **apparié par clé** qui met à
jour les enregistrements existants ; **Azure DevOps Boards** documente le
cycle export → édition Excel → ré-import ; **Power Apps/Dataverse** offre
l'upsert à l'import ; des services dédiés (CSVbox, Flatfile) outillent
l'import à validation. En revanche, **les modes remplacement (avec
désactivation des absents) / complément, l'import bloquant tant que le
dry-run n'est pas propre, et le mapping par libellés dans la langue de
l'opérateur** ne sont pas retrouvés assemblés. Précédent de patron : oui ;
équivalent du dispositif : non trouvé.

**P9 — langage d'expression transverse unique.** Deux voisinages, aucun
équivalent : le **Java Unified EL** (JSF/JSP) est un précédent historique
d'un langage d'expression **partagé entre les couches d'une pile** — mais
pour le templating/la validation d'IHM, pas pour migrations + translation
d'API + connecteurs ; et les cadres académiques MDE (**BESSER/B-UML**,
Dandelion+) unifient la modélisation par transformations de modèles, sans
langage d'expression unique embarqué dans un produit. **Aucune plateforme
low-code trouvée** dont un seul langage serve calculs, migrations,
translation, validations, wizards et documents.

**Bilan de la passe.** Rien ne remet en cause le verdict du §6 ; deux
nuances honnêtes s'y ajoutent — le round-trip tableur (P8) est un patron
établi que Syncytium raffine plutôt qu'il ne l'invente, et l'idée d'un
langage partagé entre couches (P9) a un ancêtre (Java UEL) dont la portée
était bien moindre.

Sources principales du sondage : [Budibase — form
builders](https://budibase.com/blog/open-source-form-builder/),
[OpenMetadata](https://open-metadata.org/),
[Kestra](https://kestra.io/resources/data/open-source-etl-tool),
[DataHub](https://datahub.com/blog/open-source-data-lineage/),
[Crater](https://github.com/crater-invoice-inc/crater),
[InvoicePlane](https://invoiceplane.com/), [AppSheet — edit multiple rows
using CSV](https://support.google.com/appsheet/answer/11918330), [Azure
Boards — bulk import/export
CSV](https://learn.microsoft.com/en-us/azure/devops/boards/queries/import-work-items-from-csv),
[Power Apps —
import/export](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-import-export),
[BESSER (arXiv)](https://arxiv.org/html/2405.13620v1), [Unified EL
(Eclipse)](https://wiki.eclipse.org/Unified_Expression_Language_Support).

## 8. Limites de l'exercice

- **Les piliers 4, 5, 7, 8 et 9** n'ont pas eu d'angle de recherche dédié
  dans le harnais principal (les 5 angles ont priorisé les piliers
  structurants 1/2/3/6/10) — **l'angle mort a été comblé par la passe
  superficielle du §7**, au niveau de preuve indicatif qui est le sien.
- **14 affirmations sur 25 n'ont pas été départagées** par les panels
  (erreurs de quota) — la plus décisive a été re-vérifiée directement
  (§3), les autres restent au statut « sources primaires convergentes, non
  vérifiées adversarialement ».
- **La passe complémentaire (§7) est volontairement superficielle** : un
  sondage par pilier, sans lecture approfondie ni vérification — ses
  constats sont indicatifs.
- **L'étape de synthèse automatique a échoué** (quota) : le présent
  document tient lieu de synthèse, rédigée à partir des résultats bruts
  vérifiés.
- Constats **datés du 17–18/07/2026** — le paysage des licences, en
  particulier, évolue vite.
