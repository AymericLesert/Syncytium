# Les compléments

> **Le mapping** est l'ensemble des règles de correspondance qu'une
> migration applique. Le plus souvent, une colonne alimente un champ :
> c'est le un pour un ([glossaire](../../glossaire.md)).

Ce fichier montre les mécanismes qu'une règle emploie quand le un pour
un ne suffit pas. Chacun garde sa définition dans son chapitre ; celui-ci
en montre l'usage (D1958). Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md).

## Le sommaire

- [Au-delà du un pour un](#au-delà-du-un-pour-un)

## Au-delà du un pour un

Cette partie montre des usages (D1958). Seul `distinct:` s'y définit :
c'est une clé de la règle. Les autres mécanismes gardent leur
définition dans leur chapitre : le montant et le compteur sont des
types du [modèle](../02-modele/README.md), `cache` et les
fonctions relèvent du [langage](../03-langage/README.md), la
référence de fichier `~{…}` de la
[configuration](../01-configuration/README.md), la lecture d'un
fichier des [connecteurs](../05-connecteurs/README.md).

- **le référentiel par valeurs distinctes** (D658, validé) : la
  destination prend les valeurs distinctes d'un champ ou d'une liste
  de champs — la valeur devient la clé fonctionnelle, les entités
  porteuses référencent par la clé ; la même table source porte
  plusieurs règles. **La règle porte un `filter:`**
  (l'écho D663) — son périmètre : le cas 4 importe en **trois
  phases** (D814 — la phase = la règle filtrée, l'ordre = le
  préfixe D665 : les comptes créés par le marqueur OUVERTURE, les
  référentiels et les écritures hors marqueurs, l'écriture du
  solde puis la clôture par FERMETURE en **mise à jour par la clé
  fonctionnelle** D654 — le solde sur le compte encore ouvert,
  D815) ; les
  valeurs marqueurs entrent au référentiel, portées par les
  écritures de dépôt/solde — **le contrôle d'usage à la validation
  de l'entité** garde leur emploi (D824 — la date d'opération doit
  être l'ouverture ou la clôture du compte, l'évaluation au scellé
  D594) :

```yaml
# mapping/cities.yml — le référentiel des valeurs distinctes
customers:
  to: sales.city
  distinct: [city]               # sur la valeur normalisée
  fields:
    label: city                  # la valeur devient l'identité

# mapping/customers.yml — l'entité qui référence, par la clé
customers:
  to: sales.customer
  fields:
    code: code
    city: city                   # la référence résolue par la clé
```

*Les décisions de cet exemple : D658, D660, D658/D930, D654.*

- **le rapprochement interne à la migration** (D812/D821 — le cas
  1 : les paires de virements) : **en deux phases par le cache nommé
  de la migration** — la règle d'enregistrement empile
  (`operations: cache.push(nom, clé, me)`), une **règle de
  complément** re-parcourt la même source et associe
  (`liee: cache.pop(nom, clé) if cache.size(nom, clé) > 1` — D822) ;
  **une pile par clé (FILO)** : la première ligne relue dépile la
  seconde empilée — son miroir, jamais elle-même ; **la garde
  `size > 1` écarte l'orphelin** (il ne dépile pas, le champ reste
  vide — un fait, pas une non-conformité) ; **le miroir reçoit sa
  référence en retour par l'affectation au chemin** (D823 —
  `me.liee.liee : me` : le membre gauche navigue et écrit dans
  l'enregistrement pointé ; l'ordre des affectations compte, le
  chemin sur le vide est sans effet) ; **le compteur surchargé** (D883/D998) — la règle écrit la valeur reprise dans le champ `counter`, et la méthode `update(valeur)` du type counter, dans ses `operations:`, positionne le compteur courant sur la plus grande valeur (« si la valeur > au compteur courant, ça positionne le compteur courant sur la valeur la plus grande ») : `commande_vente.numero.update(numero)` — le champ adressé par le point (D999, « plus parlante ») ; les trous de la séquence reprise relèvent du contrôle de la propriété du compteur, pas de la migration. Le bloc `operations:` d'une règle = des énoncés du
  langage exécutés par enregistrement (le `if` postfixe — D364) ; la
  correspondance ligne → enregistrement de la règle de complément
  est tenue par la migration (D666/D668) ;

- **l'identité partout** (D1035 — amende D825/D930) : toute entité
  porte au moins une identité, la sienne ou celle qu'elle hérite de sa
  racine (D1039) ; avec `identities:` (D1171, D1953), plusieurs
  sources retrouvent le même enregistrement par des clés différentes —
  les propriétés d'une facture par son client et son mois, son détail
  par son enregistrement comptable — ; une seule de ses clés suffit à
  retrouver l'enregistrement (D1956) : **la clé principale est le lien
  principal** ; **la clé secondaire s'associe à l'enregistrement** dès
  qu'elle est définie, et si elle existait déjà, la nouvelle
  association la remplace ; pendant la lecture, des clés peuvent se
  croiser — deux factures échangent leurs numéros d'une étape à
  l'autre — : **l'intégrité se vérifie juste avant la validation de la
  migration**, non à chaque ligne (D1954) ; ce contrôle différé vaut
  pour les identités secondaires, la clé principale désignant
  l'enregistrement à chaque étape (D1956) ; un doublon qui subsiste à
  ce moment est une anomalie (D1955) ; son absence est une anomalie de description du modèle —
  la règle « création seule » disparaît : l'enregistrement construit
  se retrouve dans la cible par son identité, deux enregistrements de
  même clé sont le même enregistrement (D1046) ; la règle de
  complément (D821) ne crée pas : elle re-parcourt les mêmes lignes
  dans le même passage ; la règle de mise à jour alimente l'identité
  elle-même, une valeur inchangée que le différentiel ignore ;

- **une entité source, plusieurs fichiers** (D816 — le cas 4) : deux
  fichiers au même format = une seule entité (l'union des lignes) ;
  **la carte entités → fichiers vit au connecteur** (D819/D828 —
  la section `entities:` au même niveau que `parameters:` : chaque
  entité déclare ses fichiers, la liste ou le pattern D806, le
  fichier répété pour le cas rare d'un fichier partagé), l'entité
  source reste purement logique (D652) ; un seul mapping ;
  **le défaut : la première ligne = les entêtes existantes** (D845 —
  la liste nue suffit) ; **l'entrée en objet pour les écarts** —
  `files:`, `headers: [..]` (la substitution, dans l'ordre des
  colonnes du fichier — elle prime), `skipheader: false` (le
  fichier sans entête — les noms viennent de la substitution) ;

- **les composés par la fonction du type** (D659, validé) : plusieurs
  colonnes source vers un champ cible — la fonction de construction
  portée par le type (D579/D584), rien de neuf dans la grammaire :

```yaml
  fields:
    position: geolocation(lat, lng)             # 2 colonnes → 1 champ
    total:    amount(total_cts / 100, currency) # le montant et la devise
```
