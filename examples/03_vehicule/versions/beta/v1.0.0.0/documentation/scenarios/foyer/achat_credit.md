Quand : à chaque nouveau véhicule financé par un crédit ou une LOA.

1. Depuis [le garage du foyer](transport[accueil]), créer [un véhicule](transport.vehicule[+record]) :
   le nom, la plaque, la photo, le type, la devise ; le statut naît en Création.
2. Dans l'onglet Financement, [choisir Crédit](transport.vehicule[+record]?financement=credit) :
   le capital, le taux annuel, l'assurance mensuelle, la durée, le premier mois et le jour
   d'échéance apparaissent.
3. Valider : [l'échéancier se crée de lui-même](transport.vehicule.creer_echeancier) — l'opération
   se déclenche à la validation du financement, sans relecture.
4. Relire l'échéancier dans l'onglet Financement ; si le paramétrage change plus tard,
   [Ajuster l'échéancier](transport.vehicule.ajuster_echeancier) le reprend et dit ce qu'il
   conserve, supprime et recrée.
5. Passer le statut à Actif : le journal de vie s'ouvre.

> **À ne pas faire** : saisir les échéances à la main — l'échéancier se calcule, un ajustement les
> reprendrait.
