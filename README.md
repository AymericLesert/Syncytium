# Syncytium

**Syncytium est un framework, pas une application.** À la manière du tissu
biologique dont il tire son nom — un *syncytium* est une cellule unique à
plusieurs noyaux, née de la fusion de cellules qui partagent désormais un même
corps — il est la matière commune à partir de laquelle des solutions métier se
forment. Il n'est pas la partie visible : les applications construites sur lui
exploitent ses capacités de façon **transparente**.

Le framework est piloté par les **métadonnées** : à partir d'une **description
déclarative des données** (entités, champs, relations, groupes, confidentialité),
il génère et fait vivre :

- le **modèle de données** et ses migrations — y compris **à chaud**, avec des
  règles de transformation déclaratives (renommage, éclatement, fusion) ;
- une **interface graphique dynamique**, qui s'organise en fonction de la
  description et suit toujours sa dernière version ;
- des **API versionnées**, à compatibilité ascendante et descendante, pour
  communiquer avec d'autres solutions (consommateurs non maîtrisés, connecteurs
  vers des systèmes externes, tâches asynchrones suivies).

## Trois strates

Le nom encode l'architecture : une membrane unique, plusieurs noyaux autonomes.

1. **Syncytium — le framework.** Le moteur générique open source : le *tissu*.
   C'est ce dépôt.
2. **La solution.** Une application métier décrite *sur* le framework ; le
   technicien travaille à ce niveau, en écrivant la description.
3. **L'instance.** La solution déployée chez une TPE, avec ses données, ses
   comptes et sa propre vie.

Cette distinction éclaire les deux rythmes d'évolution du projet : faire évoluer
le **moteur**, c'est faire avancer le framework (mise à jour technique, sur
sollicitation) ; faire évoluer la **description**, c'est faire avancer la
solution (déploiement à chaud). Deux niveaux, deux responsables, deux cadences.

La cible : les **TPE** — une instance autonome par client, environ vingt
utilisateurs simultanés, des bases de quelques Go. La sophistication se
concentre là où elle a de la valeur : migrations sûres (validation, répétition
à blanc, exécution transactionnelle), contrats d'API stables dans le temps,
télémétrie au service de l'évolution du modèle.

## Genèse

<!-- Section à compléter par l'auteur : l'origine du projet et du nom, qui le
guident depuis plus de dix ans. -->

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
