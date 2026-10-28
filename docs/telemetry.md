# La télémétrie de Syncytium

Ce document rassemble **les échanges consignés sur la télémétrie** —
le dixième artefact préparatoire de la documentation (Q58, le
domaine 6 — D602), après le [glossaire](glossaire.md), les
[composants](composants.md), les [hooks](hooks.md), les
[types](types.md), les [connecteurs](connectors.md), le
[mapping](mapping.md), les [droits](rights.md) et
l'[administration](administration.md). Les décisions citées
renvoient à la [conception](conception.md). Il consolide l'acquis du
pilier P9 (Q12–Q13, résolues en juin 2026), **la jonction avec le
socle récent** (D734) et **la relecture point par point**
(D736–D741).

## Les trois finalités (P9)

1. **les usages** — faire évoluer la description : simplifier vers
   l'intérieur (D38), optimiser et enrichir vers l'extérieur (D45) ;
2. **le risque de migration** — éclairer la décision là où elle se
   prend (le rapport de dry-run) ;
3. **la sécurité** — détecter l'usage anormal, alerter (D43).

## La collecte (Q12 — D38–D41, D46)

- **par champ** (D38/D736) : **évaluée à la volée, aucun
  stockage** — la diversité des valeurs (D46 : le ratio de
  cardinalité `valeurs distinctes non nulles / lignes` ; ≈ 0 = le
  champ constant, le candidat au retrait), pondérée par l'âge du
  champ (le journal de migrations) et la fréquence de mise à jour ;
  **déclenchable à la demande depuis le dashboard « telemetry »**
  du module d'administration (D736) — le résultat s'affiche, rien ne
  se stocke ;
- **par entité** (D39) : **stockée** — les compteurs d'usage
  lecture/écriture, l'historique d'évolution du schéma (le journal
  de migrations, jamais dupliqué) ;
- **par API et fonction** (D40) : les compteurs d'usage réel **et
  les acteurs — les seuls comptes techniques** : la gestion
  d'intégrations, jamais la surveillance des salariés (le RGPD
  léger de Q12) ;
- **les deux supports** (D41) : les données en base (les compteurs
  durables) et les traces de journal — **la rétention paramétrable,
  l'archivage à durée de vie maximale, l'option d'anonymisation** ;
  le client responsable de traitement (D16) ;
- **la collecte est une couche moteur** (D44) — elle survit à une
  description cassée ; la restitution est générée par la même
  machinerie que tout le reste (elle hérite des groupes et des API).

L'exemple — la collecte ne se déclare pas (la couche moteur), seuls
ses réglages s'écrivent (voir le journal et la calibration
ci-dessous) ; le déclenchement par champ est **un geste** du
dashboard « telemetry » (D736), pas une configuration.

## Les six canaux de restitution (Q13 — D43–D44, D737)

La forme suit la finalité ; les canaux sont complémentaires :

| le canal | le mode | la finalité |
|---|---|---|
| **le tableau de bord** (D38) | *pull*, l'exploration | les usages — la diversité, les compteurs, les tendances |
| **le rapport de dry-run** | contextuel, à la migration | le risque — injecté là où la décision se prend, pas de tableau propre |
| **la synthèse périodique** | *push*, basse fréquence — le patron du mail des faits marquants (D733/D738) | les usages proactifs — les candidats au retrait, **le volet conseil** (D45) ; les destinataires au degré `administrator` |
| **l'alerte de dépréciation** | *push*, événementiel, **rare** — le même patron (D738) | **l'appel persistant d'une version dépréciée** (D742 — l'état, jamais une date : le déploiement déclenche la dépréciation ou son intention) ; jamais d'alerte sur le non-usage ; le degré `administrator` |
| **l'analyse de sécurité** (D43) | *push* + analyse | l'usage anormal — les refus journalisés, les pics |
| **le journal** (D737) | le substrat — la consultation par le concepteur seul, en cas de besoin | tout — les six niveaux `verbose`/`debug`/`info`/`warning`/`error`/`exception`, la configuration en dur (`logging.yml` par environnement — D342/D343/D830), hors IHM — **la maîtrise du niveau, des dimensions (taille/rotation — D800) et de la rétention** |

L'exemple du journal (les écritures validées — D743) :

```yaml
# environments/production/logging.yml — la configuration en dur (D737), sans niveau log: (D1092)
level: info            # verbose | debug | info | warning | error | exception
output: file:/var/log/syncytium/${...name}-${now:yyyy-mm-dd}.log   # ou le puits de logs (D343)
max_size: 128MB        # les dimensions (D800/D1091) : la taille d'un fichier…
backups: 10            # … et le nombre de fichiers tournés ; la rétention au cleanup.yml (D1073)
anonymize: true        # l'option d'anonymisation (D41b)

# environments/staging/logging.yml — le staging bavard (D343)
level: debug
```

*(La maîtrise du journal (D800) : le niveau, **les dimensions** — la
taille et la rotation des fichiers, la syntaxe à écrire quand le
domaine s'ouvrira — et la rétention. Un bloc qui ne doit pas servir se
retire : le suffixe `-disable` du cas 4 n'existe plus (D1533).)*

*(**La rétention des fichiers est un mécanisme générique** (D1070) : dans
un dossier, les fichiers qui répondent à un pattern — gardés par nombre
(les n derniers) ou par durée, la date lue dans le nom du fichier par
le pattern ; **elle vit dans `cleanup.yml`, à l'environnement** (D1073) :
des règles nommées, la clé est le nom (D1074) — le journal (sorti de `logging.yml`), les
watchers, les fichiers de détail des migrations (D1066). Les propriétés
sont normalisées (D1071) : `interval:` (le délai entre deux
nettoyages), `directory:`, `pattern:` (la date par le groupe nommé
`(?<date>…)`), `retention:` (une durée — `30d` ; `nbdays:` retiré ;
sans unité, un nombre de fichiers — `10` garde les dix derniers, triés
par leur dernière date de création, D1076) ; `interval:` en durée
(`1d`, `1min` — `m` est le mois, D476) ;
le nom daté s'écrit `${now:yyyy-mm-dd}`.)*

L'exemple des push (les écritures validées — D743) :

```yaml
settings:
  application:
    mails:
      highlights: { every: daily[07:00] }              # les faits marquants (D733)
      telemetry:  { every: monthly[1 at 07:00] }       # la synthèse périodique (D738)
      # l'alerte de dépréciation n'a pas de rythme ni de fenêtre (D742) :
      # elle part sur l'appel persistant d'une version dépréciée —
      # le déploiement déclenche la dépréciation, jamais un calendrier
```

## Le volet conseil (D45, D315–D319)

L'analyse des schémas d'appels d'API — les recommandations, jamais
la coercition :

- **au consommateur** : le cache des requêtes déterministes (le
  moteur fournit `ETag`/`304`), la lecture par lot contre le N+1 ;
- **au concepteur** : faire émerger un besoin — l'endpoint
  composite, l'agrégat, le champ calculé ;
- **la détection : SEQUITUR** (D315–D316) — la grammaire
  hiérarchique des séquences répétées sur les appels normalisés
  (l'endpoint + les propriétés, les valeurs ignorées — D318) ; les
  seuils : la récurrence sur plage temporelle et le rapport de
  longueurs (D319, le calibrage sur données réelles en Q59) ; **le
  moteur propose avec la fréquence et le gain, le concepteur
  décide** (D317).

**Où paraissent les propositions** (D739) : dans la synthèse
périodique (D738) et dans le dashboard « telemetry » (D736) — la
décision du concepteur reste **un geste hors application** : la
description se change au dépôt, jamais depuis l'écran.

## Les seuils et la calibration (D47–D51, D97, D740)

**La cascade** (D740) : **le global en paramètres dynamiques**
(D588 — l'administrateur ajuste sans republier), **la surcharge à
l'instance, au module, à l'entité et au champ par la configuration
statique** (versionnée — la déclaration par élément de D50) ; le
plus proche l'emporte. Le filet demeure (D51 — une alerte de
sécurité ne peut se taire : le seuil absent = le défaut global
s'applique). La calibration par défaut (D97) : la fenêtre glissante
30 jours, l'échelle linéaire (log sur demande), le pic = z-score ≥ 3
+ le plancher 100 appels/jour, le crawl > 50 % d'une table > 1000
lignes, le R² ≥ 0,5 — le patron uniforme *forme × poids*, chaque
seuil explicable en une phrase.

L'exemple de la cascade (les écritures validées — D743 ; les
valeurs sont les défauts de D97) :

```yaml
# settings.yml — le global, en paramètres dynamiques (D740)
settings:
  application:
    telemetry:
      window:      { mode: dynamic, type: duration,   value: 30d }  # la fenêtre glissante
      peak_zscore: { mode: dynamic, type: decimal,    value: 3 }    # le pic (forme)
      peak_floor:  { mode: dynamic, type: integer,    value: 100 }  # le plancher appels/jour (poids)
      crawl_ratio: { mode: dynamic, type: percentage, value: 50% }  # le crawl (forme)
      crawl_floor: { mode: dynamic, type: integer,    value: 1000 } # les lignes (poids)
      trend_r2:    { mode: dynamic, type: decimal,    value: 0.5 }  # la pente validée

# la surcharge statique — l'entité (D50/D740, versionnée)
name: order
telemetry:
  peak_floor: 1000               # l'entité très sollicitée — le seuil relevé

# la surcharge statique — le champ
fields:
  iban:
    type: iban
    telemetry: { peak_floor: 10 }  # le champ sensible — le seuil resserré
```

Le filet demeure (D51) : le seuil absent = le défaut global
s'applique — une alerte de sécurité ne peut se taire.

## La jonction avec le socle récent (D734)

L'acquis de juin précédait le module d'administration, l'audit, les
settings dynamiques et le mail des faits marquants — les six
raccords validés :

1. **la maison** : la télémétrie stockée (D39/D41a) vit dans **des
   entités du module d'administration** (le patron D666/D704) ; le
   tableau de bord des usages est une entrée de son menu — **le
   dashboard « telemetry »** (D736) — aux côtés de la santé (D731) ;
2. **la synthèse périodique et l'alerte d'échéance** rejoignent **le
   patron du mail des faits marquants** (D733/D738) : le template
   surchargeable (D723), l'`every:` à convenance, le smtp — **les
   destinataires limités au degré `administrator`** ;
3. **l'analyse de sécurité** s'assoit aussi sur **l'audit des
   lectures** (D702–D704) et les échecs d'authentification tracés
   (D720) — les refus que D43 demandait de journaliser ont leur
   mécanique ;
4. **la calibration** (D97/D740) : le global en settings dynamiques
   (D588), la surcharge locale (instance/module/entité/champ) par la
   configuration statique — le plus proche l'emporte ;
5. **la rétention et l'anonymisation des traces** (D41b) rejoignent
   **le patron RGPD** (D695–D698 — la rétention qui anonymise
   d'office) et le `trace: limited` (D703) ;
6. **qui voit** (corrigé par D741) : **la télémétrie entière est au
   degré `administrator`** — le dashboard « telemetry » vit au
   module d'administration (D710/D736), les push partent au même
   degré (D738) ; le manager voit les données métier par ses listes
   et ses widgets, jamais la télémétrie.

## Les points ouverts

**La télémétrie est soldée** (D743) — le seul reste : le calibrage
des seuils SEQUITUR sur données réelles, aux cas d'usage (Q59, comme
prévu par D319).

## La documentation — la facette de la télémétrie (D1158–D1159)

*(La rubrique de la matrice de [documentation.md](documentation.md)
§13 ; la colonne de l'information remplie au rang 2, les autres à leur
rang.)*

**La télémétrie, dans le dictionnaire de la donnée** (D1265 — « Cette
partie est une façon d'exploiter la télémétrie de Syncytium ») : le
chapitre 5.3, les données — les volumes par entité, la synthèse, le
détail par champ dans la zone sur demande (D1216) ; à l'instance
seulement, sur les données que le lecteur a le droit de consulter
(D1248–D1249). *Ma lecture* : **un septième canal de restitution** à
côté des six — *pull*, par la documentation, l'usage réel champ par
champ. **La liste des indicateurs** (D1287, §8 de documentation.md) :
pour tout champ le renseigné et la part de vides, la diversité
représentative (D46), la dernière écriture ; par famille de type — la
répartition et les valeurs jamais employées (`enum`, `boolean`, D48),
les longueurs (`text`), le minimum, le maximum, la moyenne et la plage
occupée (les numériques), la plage et la répartition par période (les
dates), les cibles distinctes (la référence), le nombre d'éléments (les
listes), le nombre et la taille (`file`) ; **les valeurs et leur
fréquence quand la diversité est faible ou quand quelques valeurs font
la grande majorité** — **le seuil suit la courbe de Pareto, 20 % des
valeurs pour 80 % des lignes** (D1290 ; les deux nombres en réglage global de
l'application, `application: { telemetry: { values: pareto[80/20] } }`,
D1291) ; pour
l'entité le volume, les créations, les modifications et **les
suppressions** (le soft delete, D141), la répartition par état, la part
d'historisés, les compteurs (D39). **Le hook de type livre ses
indicateurs** (D1288) ; le tableau de bord « telemetry » montre les
mêmes chiffres.

**La télémétrie, dans la réglementation** (la colonne 5 — le rang 3) :
**la journalisation des accès** (D1336) — les refus d'autorisation
journalisés (D43), l'audit des lectures au grain de l'acte (D702–D704),
leurs comptes par période à l'instance ; **l'extraction** d'une personne
reprend les accès qui la concernent (D1331) ; la rétention et
l'anonymisation des traces (D41) au chapitre de la journalisation.

**La télémétrie, dans le projet et le support** (la colonne 8 — le rang
4) : **les indicateurs du support** — statiques, les tickets en cours
par statut ; dynamiques, les tickets ouverts par jour, par semaine ou
par mois selon l'ancienneté de l'application (D1379–D1380) — calculés
sur `_assistance`, à l'instance, sans le détail ; rien d'autre.

**La télémétrie, dans la documentation du développeur** (la colonne 3 —
le rang 5) : rien d'écrit — les données vivantes n'entrent ni dans le
contrat ni dans les exemples (D1398) ; à l'instance, le dernier envoi
de chaque émission sortante et son état (D1421) ; les indicateurs des
appels par compte relèvent de la maintenance.

**La télémétrie, dans le D.A.T.** (la colonne 4 — le rang 6) : **le
dimensionnement de l'instance** — les volumes par entité, la taille de
la base, les comptes et les groupes, le poids des fichiers, le rythme
des tâches (D1430), lus par la télémétrie (D1155, D1265), à côté de la
référence ; les journaux et leur rotation (D343).

**La télémétrie, dans le guide d'exploitation** (la colonne 9 — le rang
7) : **la disponibilité et la charge** — le processeur, le disque, la
congestion, les files, les sessions, les 429 — mesurées par le moteur,
la priorité 1 du tableau de bord (D1453) ; **le journal**, sixième
canal (D737), ses niveaux, sa rotation, son puits (D343, D1454) ; les
alertes et leurs seuils (D626, D738).

**La télémétrie, dans la maintenance, les risques et les améliorations**
(la colonne 7 — le rang 8), la source de tout : **la collecte**
(D38–D40, D46, D48) fournit les usages — un indicateur par type de
composant, rien de nouveau à collecter (D1489) —, les mesures des
risques (D1490) et les faits des propositions (D1495) ; **le tableau de
bord** (D38) et **la synthèse périodique** (D738) restent les canaux de
la télémétrie, la documentation 7 est une lecture qui ne pousse rien
(D1168) ; **le volet conseil** (D45, D315–D319, D739) alimente la
famille « enrichir » des améliorations ; **les seuils** (D49, D740)
restent où ils sont — aucun seuil absolu pour les listes, le classement
suffit ; la période au choix du lecteur, trente jours par défaut, les
compteurs au jour (D39).

**La télémétrie, dans la promotionnelle** (la colonne 6 — le rang 9) :
rien — la plaquette ne montre aucune mesure, aucun usage (D1150 — rien
de confidentiel, aucune donnée) ; la démonstration de Syncytium est
tracée comme tout échange d'un connecteur `llm` (D957, D1510).

**Les autres colonnes** — à leur rang : la fonctionnelle (rien — la
télémétrie n'est pas ce que l'utilisateur fait).
