# Le cas 8 — la lecture de documents par hooks : PowerPoint, le llm, le watcher

*Le cadre du cas — la mise en situation (Q59/D756–D757) : le
contexte, les parcours, **la forme** (le dépôt écrit pour de vrai)
et **les manques** (chaque frottement devient une décision). Les
décisions citées renvoient à [../docs/conception.md](../docs/conception.md).*

*Le quatrième rang depuis le 03/09/2026 (D857), le sixième depuis la
renumérotation D1027 ; **transformé le 21/09/2026 (D1022)** — le titre d'origine, « la collecte des commandes
commerciales » (D756), cède devant un cas plus court et plus pointu ;
le nom de la maison se relira à l'ouverture.*

## Le contexte (D1022)

**« Pour le cas 4 [le cas 6 depuis D1027], et vu la complexité portée par le cas 3 [le cas 5], je vais
le transformer pour aborder un hook de connecteur (lecture des données
dans PowerPoint) et un hook llm pour extraire des informations et les
enregistrer dans un modèle de données via l'usage d'un watcher
(alimentation automatique). »** (l'auteur, le 21/09/2026)

*(à cadrer à l'ouverture : quels documents PowerPoint, quelles
informations à extraire, quel modèle les reçoit, qui consulte)*

## Ce que le cas éprouve

- **le hook de connecteur** (D52/D634) — une classe qui lit un
  document PowerPoint : la famille, le contrat, les paramètres ;
- **le hook de la famille `llm`** (D957) — l'extraction d'informations
  d'un document vers un modèle de données : le prompt, la sortie
  typée, l'anonymisation avant envoi (D696/D960) ;
- **le watcher** (D634/D974) — l'alimentation automatique à l'arrivée
  d'un fichier : la chaîne lecture → extraction → enregistrement, sans
  main humaine ;
- la trace de ce que l'IA a écrit (D959 — tout échange tracé).

## La forme — le dépôt

*(à écrire morceau par morceau — le protocole D457/D756)*

## Les manques relevés

*(chaque frottement = une décision consignée)*
