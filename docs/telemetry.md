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

## Les six canaux de restitution (Q13 — D43–D44, D737)

La forme suit la finalité ; les canaux sont complémentaires :

| le canal | le mode | la finalité |
|---|---|---|
| **le tableau de bord** (D38) | *pull*, l'exploration | les usages — la diversité, les compteurs, les tendances |
| **le rapport de dry-run** | contextuel, à la migration | le risque — injecté là où la décision se prend, pas de tableau propre |
| **la synthèse périodique** | *push*, basse fréquence — le patron du mail des faits marquants (D733/D738) | les usages proactifs — les candidats au retrait, **le volet conseil** (D45) ; les destinataires au degré `administrator` |
| **l'alerte d'échéance** | *push*, événementiel, **rare** — le même patron (D738) | la version d'API dépréciée encore appelée près du `Sunset` (D12/D40) ; le degré `administrator` |
| **l'analyse de sécurité** (D43) | *push* + analyse | l'usage anormal — les refus journalisés, les pics |
| **le journal** (D737) | le substrat — la consultation par le technicien seul, en cas de besoin | tout — les six niveaux `verbose`/`debug`/`info`/`warning`/`error`/`exception`, la configuration en dur (`log.yml` par environnement — D342/D343), hors IHM |

## Le volet conseil (D45, D315–D319)

L'analyse des schémas d'appels d'API — les recommandations, jamais
la coercition :

- **au consommateur** : le cache des requêtes déterministes (le
  moteur fournit `ETag`/`304`), la lecture par lot contre le N+1 ;
- **au technicien** : faire émerger un besoin — l'endpoint
  composite, l'agrégat, le champ calculé ;
- **la détection : SEQUITUR** (D315–D316) — la grammaire
  hiérarchique des séquences répétées sur les appels normalisés
  (l'endpoint + les propriétés, les valeurs ignorées — D318) ; les
  seuils : la récurrence sur plage temporelle et le rapport de
  longueurs (D319, le calibrage sur données réelles en Q59) ; **le
  moteur propose avec la fréquence et le gain, le technicien
  décide** (D317).

**Où paraissent les propositions** (D739) : dans la synthèse
périodique (D738) et dans le dashboard « telemetry » (D736) — la
décision du technicien reste **un geste hors application** : la
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

Aucun point consigné — le calibrage des seuils SEQUITUR sur données
réelles attend les cas d'usage (Q59, comme prévu par D319).
