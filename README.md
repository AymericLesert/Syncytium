# Syncytium

**Syncytium** est un moteur applicatif open source piloté par les métadonnées :
à partir d'une **description déclarative des données** (entités, champs,
relations, groupes, confidentialité), il génère et fait vivre :

- le **modèle de données** et ses migrations — y compris **à chaud**, avec des
  règles de transformation déclaratives (renommage, éclatement, fusion) ;
- une **interface graphique dynamique**, qui s'organise en fonction de la
  description et suit toujours sa dernière version ;
- des **API versionnées**, à compatibilité ascendante et descendante, pour
  communiquer avec d'autres solutions (consommateurs non maîtrisés, connecteurs
  vers des systèmes externes, tâches asynchrones suivies).

La cible : les **TPE** — une instance autonome par client, environ vingt
utilisateurs simultanés, des bases de quelques Go. La sophistication se
concentre là où elle a de la valeur : migrations sûres (validation, répétition
à blanc, exécution transactionnelle), contrats d'API stables dans le temps,
télémétrie au service de l'évolution du modèle.

## État du projet

🚧 **Phase de conception.** Aucun code n'est encore écrit : le projet en est au
débat d'architecture, mené point par point et consigné dans le document de
conception.

📄 **[Document de conception](docs/conception.md)** — vision, décisions actées
(numérotées Dxx), questions ouvertes (Qxx) et journal des échanges.

## Licence

Ce projet est distribué sous licence **GNU Affero General Public License v3.0**
(voir [LICENSE](LICENSE)). Toute version modifiée du moteur — y compris
proposée en tant que service en ligne — doit être publiée sous la même
licence : Syncytium est un bien commun et le restera.
