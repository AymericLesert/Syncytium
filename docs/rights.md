# La sécurité et les droits de Syncytium

Ce document rassemble **la nature et les exemples des échanges
consignés sur la sécurité et les droits** — le huitième artefact
préparatoire de la documentation (Q58, le domaine 6 — D602), après le
[glossaire](glossaire.md), les [composants](composants.md), les
[hooks](hooks.md), les [types](types.md), les
[connecteurs](connectors.md) et le [mapping](mapping.md). Les
décisions citées renvoient à la [conception](conception.md). Il
consolide l'acquis (le pilier P8 — la sécurité par construction) et
porte les points du chantier ouvert (le sujet 2 de la passe de
complétude).

## La doctrine

- **La sécurité par construction** (P8) : les niveaux de
  confidentialité emboîtés, l'audience au niveau ligne à identifiants
  opaques, les droits d'action au modèle — jamais une couche ajoutée
  après coup ;
- **Restreindre, jamais étendre** (D190/D416) : un module restreint
  la surface visible, il n'étend jamais les droits ;
- **Masquer, ne jamais détruire** (D137/D141) : la suppression est
  une désactivation ; l'effacement physique est l'exception tracée
  (la reprise — D184) ;
- **L'anti-oracle** (D144/D153) : l'interdit ne se devine pas — ni
  par la navigation, ni par les messages, ni par les comptages ;
- **Fail-closed** (D71) : la ligne sans propriétaire est invisible ;
  le non-exposé est le défaut ;
- **La librairie inviolable** (D599) : « la librairie mise en place
  assure l'inviolabilité des règles et des droits » — le hook est un
  citoyen du moteur, jamais un super-utilisateur.

## La confidentialité (D25–D27, D364)

Le niveau d'exposition d'une donnée : **`public`** (partout),
**`protected`** (l'interface et les tâches), **`private`** (les
tâches seulement) — **resserrable par groupes**, déclarable à
l'entité et **au champ** (D364) :

```yaml
fields:
  salary:
    type: amount
    confidentiality: protected      # le niveau (D25), resserrable (D26)
```

La confidentialité irrigue tout : les menus filtrés (D193), l'export
aux colonnes visibles (D196), les widgets hérités surchargeables
(Q53), la communication (D393).

## Les droits d'action (D196, D421–D427)

**Les droits d'action par entité s'inscrivent au modèle de
confidentialité** (D196). Deux foyers exclusifs — le nom unique
`allow` (D422–D423, « les 2 simultanément ne seront pas autorisés »,
l'erreur d'ingestion) :

```yaml
# LE CYCLE : allow par état (D422) — chaque état porte ses droits
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

L'absence = tout permis ; `read` absent = l'état masque. **Les
droits d'action couvrent les opérations du socle et les opérations
déclarées** (D691) : le droit d'exécuter se déclare et se contrôle
comme les autres droits d'action. La réconciliation avec le
passe-outre (D422) : l'opération autorisée **passe outre les `allow`
d'état** (l'acte porte sa légitimité — le promote écrit ce que
l'état fige), mais **le droit de la déclencher** relève des droits
d'action — on contrôle qui appuie, pas ce que l'acte écrit.

## L'audience et l'anti-IDOR (D70–D77, D144, D153)

- **Les deux audiences** (D70) : l'interne (les collaborateurs — les
  groupes et les niveaux) et l'externe (les clients — l'accès au
  niveau ligne, fermé par défaut) ;
- **l'appartenance** (D71) : directe (le champ référence-compte),
  indirecte (le chemin multi-saut `commande.client.compte`), ouverte
  (les catalogues), ou non exposée (le défaut) ; les chemins
  multiples s'unissent, la ligne sans propriétaire est invisible ;
- **les identifiants opaques** (D75/D82) : l'UUID interne jamais
  exposé — l'anti-IDOR ; la pagination au curseur opaque (D100) ;
- **la typologie des comptes** (D77) : technique (l'API),
  utilisateur interne, client provisionné, client auto-créé
  (vérifié) — l'étanchéité par canal.

## Les groupes et les modules (D341, D414–D416)

- **`groups.yml`** à la racine de la version — la hiérarchie sans
  lien parent (« un groupe est constitué d'autres groupes »),
  acyclique, la multi-appartenance naturelle (D414) ;
- **les affectations vivent en base** — l'acte d'administration
  (D341), jamais dans le dépôt ;
- **le module restreint** (D190/D416) : l'affectation
  utilisateur↔module ouvre une surface — elle n'étend jamais un
  droit.

## Les connecteurs et la sécurité (D603, D626, D633, D642)

- **les secrets** : la référence à une variable d'environnement,
  chiffrable par une clé environnement+machine (D603) — le dépôt ne
  porte jamais une valeur en clair ;
- **la condition indispensable** (D626) : l'application ne démarre
  que si le mail à l'administrateur est possible — le canal d'alerte
  avant tout ;
- **le `directory` en lecture seule** (D633) — la synchronisation
  des comptes, jamais l'écriture vers l'annuaire ;
- **le webhook à l'authentification obligatoire** (D642) — aucune
  entrée anonyme, la garde d'office sur la route.

## La provenance et la trace (D62, D178, D238, D429)

Toute écriture est tracée (D62) ; la provenance de la reprise
persiste après la mort du connecteur (D178) ; l'import
d'exploitation porte l'opérateur (D238) ; la trace des opérations
est l'historisation elle-même (D429).

## L'authentification (D692)

**La famille de connecteur `authentication`** — la huitième : le
contrat **`challenge()`/`verify(preuve)`**, la session et
l'orchestration au moteur (D686), le rapprochement du compte par la
clé d'unicité (D82). **Les quatre volets à porter** :

1. **`local`** — le compte géré par Syncytium : le mot de passe
   haché vérifié par le moteur ; le premier visage des comptes
   clients (D77) ;
2. **`azure_ad`** — l'annuaire : le bind vers l'AD Azure, le bearer
   Entra — le pendant authentifiant du connecteur `directory`
   (D633, la synchronisation restant à lui) ;
3. **`sso`** — la délégation : la redirection OIDC, le ticket au
   retour, la signature du jeton validée — l'utilisateur ne confie
   jamais son secret à Syncytium ;
4. **l'API** — la preuve au porteur : la clé d'API ou le bearer dans
   chaque requête (le 401 en défi), le compte technique (D77), pas
   de session ; **la garde du webhook (D642) appelle le même
   `verify`**.

La passerelle (D418) a son visage ; le multi-connecteurs sert
l'étanchéité par canal (D77). Voir le contrat détaillé dans
[connectors.md](connectors.md).

## Les points ouverts — le chantier du sujet 2

1. **la session** — les réglages fins (la durée, le renouvellement,
   la déconnexion — des settings ?) ;
2. **le RGPD** — les données personnelles marquées au modèle ? le
   droit à l'effacement face à l'historisation (D168) et à la
   provenance persistante (D178) ; la rétention ;
3. **l'audit** — la trace des écritures existe ; l'audit des
   **lectures** (qui a consulté quoi), celui des actes
   d'administration, la surface qui le consulte ;
4. **le chiffrement** — au repos (le storage), en transit.
