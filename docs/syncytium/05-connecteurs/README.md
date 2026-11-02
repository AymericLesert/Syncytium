# Les connecteurs

> **Un connecteur** est une passerelle entre Syncytium et un système
> tiers : une base de données, un annuaire, des fichiers, un géocodeur,
> un serveur de mail. Il est déclaré à l'environnement, il décrit ses
> entrants et ses sortants, et sa famille est son contrat
> ([glossaire](../../glossaire.md)).

Une application Syncytium ne vit pas seule. Elle stocke ses données,
envoie des mails, lit des fichiers, authentifie ses utilisateurs,
géocode des adresses. Chaque échange avec l'extérieur passe par un
connecteur. Ce chapitre dit ce qu'est un connecteur, comment il se
déclare, ce que toute classe implémente, les neuf familles et leurs
contrats, le hook qui en ajoute une classe, et ce que le connecteur
livre à la documentation. Les décisions citées entre parenthèses
renvoient au [registre](../../conception.md).

## Le sommaire

1. Le connecteur
   - [Le diagramme — `Connector`, les familles, les classes (D1715–D1717)](#le-diagramme--connector-les-familles-les-classes-d1715d1717)
   - [La nature](#la-nature)
2. [La déclaration et le câblage](declaration.md)
   - [La déclaration par environnement](declaration.md#la-déclaration-par-environnement)
   - [Le câblage](declaration.md#le-câblage)
   - [Les renvois](declaration.md#les-renvois)
3. [Le socle commun](socle.md)
   - [Les méthodes](socle.md#les-méthodes)
   - [Les propriétés](socle.md#les-propriétés)
   - [La position de sécurité](socle.md#la-position-de-sécurité)
4. [Les neuf familles](familles.md)
   - [Les familles et le catalogue des classes](familles.md#les-familles-et-le-catalogue-des-classes)
   - [`storage`](familles.md#storage)
   - [`smtp`](familles.md#smtp)
   - [`file`](familles.md#file)
   - [`directory`](familles.md#directory)
   - [`location`](familles.md#location)
   - [`authentication`](familles.md#authentication)
   - [`siren`](familles.md#siren)
   - [`webhook`](familles.md#webhook)
   - [`llm`](familles.md#llm)
5. [Le storage](storage.md)
   - [Les quatre énoncés](storage.md#les-quatre-énoncés)
   - [Le contrat](storage.md#le-contrat)
   - [La facette des types](storage.md#la-facette-des-types)
   - [La conversion au type](storage.md#la-conversion-au-type)
   - [La migration à chaud et l'orchestration](storage.md#la-migration-à-chaud-et-lorchestration)
   - [Les storages de format et `memory`](storage.md#les-storages-de-format-et-memory)
6. [Le hook de connecteur](hooks.md)
   - [Une classe dans une famille](hooks.md#une-classe-dans-une-famille)
   - [Ce que la classe reçoit](hooks.md#ce-que-la-classe-reçoit)
   - [La fiche et la déclaration](hooks.md#la-fiche-et-la-déclaration)
7. [Ce que le connecteur livre à la documentation](documentation.md)
   - [La facette du connecteur](documentation.md#la-facette-du-connecteur)
   - [Le `describe(model)` du storage](documentation.md#le-describemodel-du-storage)
8. [Les décisions](#les-décisions)

## Le diagramme — `Connector`, les familles, les classes (D1715–D1717)

Trois notions, à ne pas confondre : **le connecteur**, déclaré à
l'environnement par son nom, qui nomme sa famille par `type:` et sa
classe par `class:` ; **la famille**, le contrat ; **la classe**,
l'implémentation qui remplit ce contrat. L'arbre a une racine,
`Connector`, le socle commun de tout connecteur : ses méthodes et ses
propriétés minimales (D621–D627, D1712, D1713). **Les familles sont
définies par le socle lui-même** (D619, D1716) : « il ne sera pas
possible pour le concepteur d'ajouter une nouvelle famille, sauf à
faire évoluer le socle lui-même ». Chaque famille hérite de `Connector`
et ajoute ses méthodes ; chaque classe hérite de sa famille et expose
ses paramètres et ses propriétés spécifiques (D1711). Le concepteur
ajoute une classe à une famille, par un hook de connecteur, jamais une
famille.

```mermaid
classDiagram
    direction TB
    class Connector {
        <<le socle commun>>
        initialize()
        release()
        connect()
        disconnect()
        ping() statut
        onerror() mock ou maintenance
        describe()
        connection, pool, retry, timeout, onerror, every
        rgpd.countries
    }
    class storage {
        begin()
        commit()
        rollback()
        create_instance()
        get_instance()
        duplicate_instance()
        rename_instance()
        delete_instance()
        create_entity()
        update_entity()
        delete_entity()
        create()
        read()
        update()
        delete()
        describe(model)
    }
    class smtp {
        send(message, pièces, destinataires)
    }
    class file {
        files(motif)
        commit(fichier)
    }
    class directory {
        get_users()
        get_users_from_group()
        get_groups()
    }
    class location {
        geocode(adresse) geolocation
        reverse(geolocation) adresse
    }
    class authentication {
        challenge()
        verify(preuve)
    }
    class siren {
        verify(siren)
    }
    class webhook {
        entries, les points d'entrée servis
    }
    class llm {
        ask(session, outils) message
    }
    class none_smtp["none"]
    class azure_ad_directory["azure_ad"]
    class none_auth["none"]
    class local_llm["local"]
    Connector <|-- storage
    Connector <|-- smtp
    Connector <|-- file
    Connector <|-- directory
    Connector <|-- location
    Connector <|-- authentication
    Connector <|-- siren
    Connector <|-- webhook
    Connector <|-- llm
    storage <|-- postgresql
    storage <|-- sqlserver
    storage <|-- mysql
    storage <|-- oracle
    storage <|-- sqlite
    storage <|-- memory
    storage <|-- csv
    storage <|-- xlsx
    storage <|-- xml
    storage <|-- json
    smtp <|-- smtp_std
    smtp <|-- none_smtp
    file <|-- file_std
    directory <|-- azure_ad_directory
    location <|-- ban
    location <|-- nominatim
    authentication <|-- local
    authentication <|-- azure_ad
    authentication <|-- sso
    authentication <|-- keycloak
    authentication <|-- none_auth
    siren <|-- sirene
    webhook <|-- webhook_std
    llm <|-- api
    llm <|-- local_llm
```

Les spécificités d'une classe se lisent à sa déclaration : la carte
`entities:` et les entêtes d'un storage de format (D828, D845), la
`convention:` de nommage d'un storage de reprise, les paramètres que
chaque classe expose (D1711). Le reste de ce document détaille la
déclaration, le câblage, le socle et le contrat de chaque famille.

## La nature

Un connecteur est une passerelle entre Syncytium et un système tiers
(D79) : une base de données, un annuaire, des fichiers, un géocodeur, un
serveur de mail. Il décrit ses entrants et ses sortants (D606). Cinq
traits le définissent.

- **Il est global** (D603). Un connecteur ne se décline ni par module ni
  par entité. Toute l'application le partage.
- **Il est déclaré à l'environnement** (D616, D617). Chaque environnement
  a ses propres connecteurs : le staging les siens, la production les
  siens. L'ingestion vérifie que chaque environnement les décrit tous.
- **Il est sans contexte** (D603). Ses paramètres sont ses propriétés,
  fixées au démarrage de l'application. Il est hors de la pile des
  contextes (D553), l'exception assumée.
- **Sa famille est son contrat, sa classe l'implémente** (D605, D613).
  `type:` nomme la famille, `storage`, `smtp`, `location` ; chaque
  famille a ses propres méthodes. `class:` nomme l'implémentation,
  `postgresql`, `ban`, `smtp_std` ; la compatibilité se juge à la
  famille.
- **Le stockage est un connecteur** (D606). Les entités sont liées à un
  connecteur de base de données : le storage porte l'instance, pas
  seulement l'échange.

Quelques connecteurs suffisent au bon fonctionnement d'une application
(D612) : la banque en déclare quatre, l'entrepôt sept.

## Les décisions

Ce chapitre repose sur les décisions de la famille « les connecteurs »,
relues le 02/11/2026 (D1707–D1729). Elles sont 76 au registre :
D29, D79, D108–D110, D218, D603–D605, D611–D612, D616–D617, D621, D626–D629, D633, D635–D637, D639, D641, D680, D686, D716, D721, D723, D733, D763, D829, D836, D845, D876, D883, D901, D911, D914, D945, D973, D1093, D1260, D1292–D1296, D1298, D1300, D1309, D1345, D1507–D1508, D1708–D1729. Chacune se lit dans [le registre](../../conception.md).
