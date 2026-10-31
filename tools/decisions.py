"""Le graphe des amendements et la classification par famille des décisions du registre — l'outil de l'audit
avant le déplacement d'un chapitre (D1521), le calcul qui prépare les ADR (D1392 — le statut et les liens) et leurs
familles (D1516). Un outil de relecture du dépôt, pas du code du moteur (D313).

Usage :
  python tools/decisions.py docs/conception.md                 le résumé : les familles, les statuts, les liens
  python tools/decisions.py docs/conception.md --familles      la liste des décisions par famille, à relire
  python tools/decisions.py docs/conception.md --audit <famille>   l'audit d'un chapitre avant son déplacement
  python tools/decisions.py docs/conception.md --decision D1474    une décision : son statut, ses liens
  python tools/decisions.py docs/conception.md --json <fichier>    le calcul entier, pour les ADR (partie 2)

Ce que l'outil lit : chaque ligne `| Dnnnn | décision | justification |` de la table ; le titre en gras ; la
parenthèse qui suit le titre, où la décision nomme ce qu'elle amende, précise, étend, complète, clôt, retire ou
remplace (« (amende D756 ; précise D1515 — …) ») ; les artefacts que la ligne cite (« documentation.md §10 »).

Ce que l'outil déduit :
- le statut (D1392) : « remplacée » si une décision postérieure la retire, la remplace ou l'annule ; « amendée »
  si une décision postérieure l'amende, la revoit, la solde ou revient sur elle ; « acceptée » sinon ; et, à
  côté, la marque « une lecture à confirmer » quand la ligne porte « ma lecture », « à confirmer » ou « en
  proposition », hors des citations entre « … » (D1584) — levée quand une décision postérieure la confirme ou
  la valide (D1582) ;
- les liens : amende → amendée par ; confirme/valide → confirmée par ;
  précise/étend/complète/exécute/généralise → précisée par ;
  clôt → close par ; résout Qn ;
- la famille (D1516) : celle de l'artefact que la ligne cite le plus souvent ; à défaut, la section du registre
  qu'elle cite (« Voir §8.6 ») ; à défaut, des mots du titre, puis du texte ; à défaut, la plage du domaine
  (§1.2 : D333–D346, D347–D419, D420–D436, D437–D569, D570–D601) ; à défaut, « methode ». La classification est scriptée puis relue (D1516) : la liste par famille sert la relecture.

L'audit d'une famille (D1521), avant le déplacement de son chapitre : les décisions de la famille amendées ou
remplacées, à confronter au texte des artefacts ; celles que les artefacts de la famille ne citent pas, à vérifier ;
celles qui portent une lecture à confirmer ; les marques « en proposition » des artefacts, avec leur ligne.
"""
import json
import os
import re
import sys
from collections import Counter, defaultdict

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8")

# Les familles (D1516 — les thèmes des artefacts) : le nom, le titre, les artefacts de docs/ qui les portent.
FAMILLES = {
    "modele": ("le modèle et les types", ["entity.md", "types.md"]),
    "surfaces": ("les surfaces et les composants", ["composants.md"]),
    "securite": ("les droits et la sécurité", ["rights.md", "security.md"]),
    "hooks": ("les hooks", ["hooks.md"]),
    "connecteurs": ("les connecteurs", ["connectors.md"]),
    "reprise": ("la reprise et le mapping", ["mapping.md", "migration.md"]),
    "administration": ("l'administration et l'exploitation", ["administration.md"]),
    "telemetrie": ("la télémétrie", ["telemetry.md"]),
    "configuration": ("la configuration et son écriture", ["configuration.md"]),
    "documentation": ("la documentation", ["documentation.md"]),
    "langage": ("le langage d'expression", []),  # un chapitre à part (D1549)
    "api": ("les API et les échanges", []),  # ma lecture : ajoutée à la liste de D1516 — aucun artefact ne la porte
    "cas": ("les cas d'usage", []),
    "methode": ("la méthode et le projet", []),
}
# Les sections du registre que les décisions citent (« Voir §8.6 ») — le second signal, après l'artefact cité.
SECTIONS = {
    "3": "modele", "3.3": "langage", "4": "reprise", "5.1": "reprise", "5.2": "reprise", "5.3": "reprise", "5.4": "api",
    "5.5": "api", "5.6": "securite", "5.7": "securite", "5.8": "api", "6": "telemetrie", "6.6": "securite",
    "7": "administration", "8.0": "hooks", "8.1": "hooks", "8.2": "hooks", "8.3": "hooks", "8.4": "hooks",
    "8.5": "connecteurs", "8.6": "surfaces", "8.7": "configuration", "8.8": "surfaces",
}
SECTION = re.compile(r"§(\d+(?:\.\d+[a-z]?)?)")
# Les plages des domaines du §1.2 (D643) — le dernier signal avant le défaut.
PLAGES = [(333, 346, "configuration"), (347, 419, "modele"), (420, 436, "hooks"), (437, 569, "surfaces"),
          (570, 601, "hooks")]
ARTEFACT_FAMILLE = {a: f for f, (_, arts) in FAMILLES.items() for a in arts}
# Les mots du titre, quand aucun artefact n'est cité — du plus spécifique au plus général.
MOTS = [
    # le langage, sur les seuls mots qui le nomment ; les agrégats, le select et les fonctions de type se relisent
    # au chapitre 3, où la frontière avec les types se tranche
    ("langage", r"langage d'expression|\blangage\b|\bnull\b|ternaire|coercition|déterminis|conditionnel|\biif\b|"
                r"selon que|catalogue de fonctions|multi-valué|opérateurs?\b|comparateurs?\b"),
    ("api", r"\bAPI\b|pagination|curseur|contrat d'API|endpoint|dépréciation|épinglage|consommateur|rate limit|"
            r"webhook|export|import|CSV|JSON"),
    ("documentation", r"documentation|dictionnaire|plaquette|promotionnel|D\.A\.T\.|guide d'exploitation|persona|"
                      r"complétude|release-notes|glossaire|wizard"),
    ("telemetrie", r"télémétrie|SEQUITUR|seuil|calibration|journalisation|trace"),
    ("securite", r"sécurité|droit|confidentialit|audience|RGPD|authentif|session|chiffre|secret|groupe|allow|"
                 r"anonymis|IDOR|degré|administrator|plancher"),
    ("reprise", r"migration|mapping|reprise|source/|legacy|miroir|coverage|rapprochement|transformation|"
                r"éclatement|fusion|renommage|retour arrière|dry-run"),
    ("connecteurs", r"connecteur|storage|mail|llm|webhook|watcher|SMTP|proxy|S3|sqlite|PostgreSQL|ERP|AD\b"),
    ("hooks", r"\bhook|plugin|extensib|describe|langage|expression|formule|calcul|fonction"),
    ("surfaces", r"surface|composant|écran|formulaire|liste|dashboard|menu|IHM|UI|graphique|planche|impression|"
                 r"PDF|affich|vue|gui\b|cycle|état|wizard"),
    ("administration", r"administration|exploitation|sauvegarde|environnement|version|déploi|instance|sandbox|"
                       r"beta|production|opération|tâche|lot|nettoyage|retention|rétention"),
    ("configuration", r"configuration|YAML|syntaxe|fichier|~\{|clé|settings|arborescence|dossier|forme courte|"
                      r"forme longue|variable|\$\{"),
    ("modele", r"entité|champ|type|relation|identit|historis|agrégat|possession|association|énumér|decimal|"
               r"amount|date|texte|référence|héritage|validation|collection|modèle de données|schéma"),
    ("cas", r"\bcas\b|tiny|enquête|véhicule|banque|entrepôt|Cegid|PDCA"),
]

LIGNE = re.compile(r"^\| D(\d+) \| (.*) \|\s*$")
TITRE = re.compile(r"^\s*\*\*(.+?)\*\*")
REFS_D = re.compile(r"D(\d+)(?:\s*[–-]\s*D?(\d+))?")
REFS_Q = re.compile(r"Q(\d+)")
ARTEFACT = re.compile(r"\b([a-z_]+\.md)\b")
LECTURE = re.compile(r"ma lecture|à confirmer|en proposition", re.I)
# une citation de l'auteur, entre « … », ne porte pas la marque d'une lecture (D1584)
CITATION = re.compile(r"«[^»]*»|(?:confirme|valide|écarte) (?:ma|mes) lectures? de D\d+", re.I)
# Les verbes de la parenthèse, et le lien qu'ils posent de la décision vers sa cible.
VERBES = [
    (r"remplace|retire|annule|abroge|rend caduc|écarte", "remplace"),
    (r"amende|revoit|revient sur|solde|corrige|rectifie|renverse", "amende"),
    # la confirmation lève la marque « à confirmer » de sa cible (D1582)
    (r"confirme|valide|lève", "confirme"),
    (r"précise|étend|complète|exécute|généralise|applique|prolonge|reprend|répare", "précise"),
    (r"clôt|clot|ferme|résout", "clôt"),
    # les appuis ne posent aucun lien, mais bornent la portée du verbe qui précède
    (r"s'appuie|appuie|fonde|borne|suit|après|voir|rappelle|garde|compose|exploite|arbitre|ouvre", "cite"),
]
# un verbe est un mot entier : « annuler » dans un titre n'est pas « annule »
VERBE = re.compile(r"\b(?:" + "|".join(f"(?P<{lien}>{motif})" for motif, lien in VERBES) + r")\b", re.I)
PARENTHESES = re.compile(r"\(([^()]*(?:\([^()]*\)[^()]*)*)\)")


def deplier(texte):
    """Les numéros de décision d'un texte, les plages « D1109–D1110 » dépliées."""
    out = set()
    for a, b in REFS_D.findall(texte):
        a = int(a)
        out.update(range(a, int(b) + 1) if b and a <= int(b) <= a + 200 else [a])
    return out


def lire(chemin):
    """Les décisions de la table : numéro, titre, le texte, la justification, les artefacts cités, les liens."""
    with open(chemin, encoding="utf-8") as f:
        lignes = f.read().replace("\r\n", "\n").split("\n")
    decisions = {}
    for n, l in enumerate(lignes, 1):
        m = LIGNE.match(l)
        if not m:
            continue
        num = int(m.group(1))
        reste = m.group(2)
        texte, justification = (reste.rsplit(" | ", 1) + [""])[:2] if " | " in reste else (reste, "")
        t = TITRE.match(texte)
        titre = t.group(1) if t else texte.split(" : «")[0][:160]
        tete = texte[t.end():] if t else texte
        # la parenthèse de tête : avant la citation « … » ; chaque segment porte un verbe et des cibles
        # la tête s'arrête à la citation « : « … » » ; une citation à l'intérieur d'une parenthèse ne la coupe pas
        avant = tete.split(" : «")[0]
        # seules les parenthèses de la tête posent des liens ; le titre et le texte libre n'en posent pas
        dedans = " ; ".join(PARENTHESES.findall(avant))
        liens = []
        for seg in re.split(r"\s*[;—]\s*", dedans):
            # plusieurs verbes dans un segment (« amende D619 …, s'appuie sur D408 ») : chaque verbe prend les
            # cibles qui le suivent, jusqu'au verbe suivant
            verbes = list(VERBE.finditer(seg))
            for i, v in enumerate(verbes):
                lien = v.lastgroup
                fin = verbes[i + 1].start() if i + 1 < len(verbes) else len(seg)
                portee = seg[v.end():fin]
                if lien == "cite":
                    continue
                for cible in deplier(portee):
                    if cible < num:
                        liens.append((lien, cible))
                for q in REFS_Q.findall(portee):
                    liens.append((lien, f"Q{q}"))
        cites = sorted({c for c in deplier(texte + " " + justification) if c < num})
        decisions[num] = {
            "numero": num, "ligne": n, "titre": titre, "texte": texte, "justification": justification,
            "liens": liens, "cite": cites,
            "artefacts": [a for a in ARTEFACT.findall(texte + " " + justification) if a in ARTEFACT_FAMILLE
                          or a.endswith(("_tiny.md", "_enquete.md", "_vehicule.md", "_banque.md", "_entrepot.md"))],
            "lecture": bool(LECTURE.search(CITATION.sub(" ", texte + " " + justification))),
        }
    return decisions


# La relecture de la classification par l'auteur, famille par famille, à l'audit de chaque chapitre (D1526) :
# le numéro → la famille arbitrée, qui l'emporte sur les signaux. Le chapitre 1, la configuration (D1540, le 29/10/2026).
RELECTURE = {
    220: "modele", 222: "modele", 389: "modele",
    223: "api", 225: "api",
    218: "connecteurs",
    221: "hooks",
    224: "documentation", 1222: "documentation",
    502: "surfaces", 529: "surfaces",
    730: "securite", 923: "securite",
    1047: "reprise", 1049: "reprise", 1050: "reprise", 1051: "reprise", 1066: "reprise",
    1383: "methode", 1516: "methode",
}
# Le chapitre 2, le modèle et les types (D1560, le 30/10/2026) : quatre-vingt-sept décisions reclassées.
for _fam, _nums in {
    "reprise": [175, 176, 177, 178, 179, 181, 182, 183, 184, 657, 931, 966, 995, 1006, 1007, 1033, 1037, 1040,
                1053, 1054],
    "documentation": [1119, 1150, 1152, 1160, 1215, 1233, 1253, 1267, 1268, 1269, 1270, 1271, 1274, 1278, 1314],
    "cas": [824, 859, 866, 936, 950, 955, 962, 964, 989, 997, 1000],
    "surfaces": [126, 464, 494, 500, 513, 518, 541, 544, 786, 795],
    "langage": [90, 158, 580, 833, 889, 891, 1551],
    "hooks": [148, 159, 431, 435, 613],
    "securite": [139, 163, 702, 1149, 1326],
    "configuration": [116, 117, 352, 765],
    "connecteurs": [79, 637, 1293],
    "methode": [608, 843, 1546],
    "api": [150, 151],
    "administration": [675],
    "telemetrie": [38],
}.items():
    RELECTURE.update({_n: _fam for _n in _nums})
# Le chapitre 3, le langage d'expression (D1584, le 31/10/2026) : douze sorties, quarante-sept entrées.
for _fam, _nums in {
    "modele": [388, 405, 427],
    "surfaces": [560, 567, 783],
    "reprise": [648, 656],
    "hooks": [754],
    "cas": [954, 1003],
    "documentation": [958, 1225, 1226],
    "methode": [1549, 1565],
    "configuration": [321, 802],
    "langage": [35, 36, 254, 571, 575, 576, 578, 579, 584, 587, 593, 659, 760, 817, 818, 841, 842, 872, 934, 971,
                1002, 1015, 1017, 1106, 1109, 1110, 1564] + list(range(1566, 1588)) + [1589],
}.items():
    RELECTURE.update({_n: _fam for _n in _nums})


def classer(d):
    """La famille d'une décision : la relecture de l'auteur, sinon l'artefact le plus cité, sinon la section,
    les mots du titre puis du texte, la plage du domaine, sinon la méthode."""
    if d["numero"] in RELECTURE:
        return RELECTURE[d["numero"]], "relecture"
    comptes = Counter()
    for a in d["artefacts"]:
        comptes[ARTEFACT_FAMILLE.get(a, "cas")] += 1
    if comptes:
        return comptes.most_common(1)[0][0], "artefact"
    # le renvoi « Voir §n » : la sous-section d'abord, puis la section (§3.2c, le narratif, ne dit rien)
    for sec in SECTION.findall(d["texte"] + " " + d["justification"]):
        if sec == "3.2c":
            continue
        fam = SECTIONS.get(sec) or SECTIONS.get(sec.split(".")[0])
        if fam:
            return fam, "section"
    for champ, source in ((d["titre"], "mots du titre"), (d["texte"], "mots du texte")):
        for fam, motif in MOTS:
            if re.search(motif, champ, re.I):
                return fam, source
    for a, b, fam in PLAGES:
        if a <= d["numero"] <= b:
            return fam, "plage du domaine"
    return "methode", "défaut"


def calculer(decisions):
    """Le statut et les liens inverses de chaque décision."""
    inverses = defaultdict(lambda: defaultdict(list))  # cible → lien → [auteurs]
    for d in decisions.values():
        for lien, cible in d["liens"]:
            inverses[cible][lien].append(d["numero"])
    for d in decisions.values():
        inv = inverses.get(d["numero"], {})
        d["remplacee_par"] = sorted(inv.get("remplace", []))
        d["amendee_par"] = sorted(inv.get("amende", []))
        d["precisee_par"] = sorted(inv.get("précise", []))
        d["close_par"] = sorted(inv.get("clôt", []))
        d["confirmee_par"] = sorted(inv.get("confirme", []))
        d["lecture_ouverte"] = d["lecture"] and not d["confirmee_par"]
        d["statut"] = ("remplacée" if d["remplacee_par"] else "amendée" if d["amendee_par"] else "acceptée")
        d["famille"], d["famille_source"] = classer(d)
    return decisions


def resume(decisions):
    fams = Counter(d["famille"] for d in decisions.values())
    sources = Counter(d["famille_source"] for d in decisions.values())
    statuts = Counter(d["statut"] for d in decisions.values())
    print(f"# Les décisions du registre — {len(decisions)} lignes, D1 à D{max(decisions)}\n")
    print("## Les familles (D1516)\n\n| La famille | Le titre | Les décisions | Les artefacts |\n|---|---|---|---|")
    for fam, (titre, arts) in FAMILLES.items():
        print(f"| `{fam}` | {titre} | {fams.get(fam, 0)} | {', '.join(arts) or '—'} |")
    print(f"\nLa classification : {sources['relecture']} par la relecture de l'auteur (D1526), "
          f"{sources['artefact']} par l'artefact cité, {sources['section']} par la section "
          f"citée, {sources['mots du titre']} par les mots du titre, {sources['mots du texte']} par les mots du "
          f"texte, {sources['plage du domaine']} par la plage du domaine (§1.2), {sources['défaut']} par défaut "
          f"(la méthode) — à relire (D1516).\n")
    print("## Les statuts (D1392)\n")
    for s in ("acceptée", "amendée", "remplacée"):
        print(f"- {s} : {statuts.get(s, 0)}")
    lectures = sum(1 for d in decisions.values() if d["lecture_ouverte"])
    levees = sum(1 for d in decisions.values() if d["lecture"] and d["confirmee_par"])
    liens = sum(len(d["liens"]) for d in decisions.values())
    print(f"- une lecture à confirmer sur la ligne : {lectures} (et {levees} levées par une confirmation)"
          f"\n\nLes liens posés : {liens} "
          f"(amende {sum(1 for d in decisions.values() for l, _ in d['liens'] if l == 'amende')}, "
          f"précise {sum(1 for d in decisions.values() for l, _ in d['liens'] if l == 'précise')}, "
          f"confirme {sum(1 for d in decisions.values() for l, _ in d['liens'] if l == 'confirme')}, "
          f"remplace {sum(1 for d in decisions.values() for l, _ in d['liens'] if l == 'remplace')}, "
          f"clôt {sum(1 for d in decisions.values() for l, _ in d['liens'] if l == 'clôt')}).")


def familles(decisions):
    par = defaultdict(list)
    for d in decisions.values():
        par[d["famille"]].append(d)
    for fam, (titre, _) in FAMILLES.items():
        print(f"\n## `{fam}` — {titre} ({len(par[fam])})\n")
        for d in par[fam]:
            marque = "" if d["famille_source"] == "artefact" else f" *({d['famille_source']})*"
            print(f"- D{d['numero']} — {d['titre'][:110]}{marque}")


def audit(decisions, fam, racine):
    titre, arts = FAMILLES[fam]
    textes = {}
    for a in arts:
        p = os.path.join(racine, "docs", a)
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f:
                textes[a] = f.read()
    cites = set()
    for t in textes.values():
        cites |= deplier(t)
    mienne = [d for d in decisions.values() if d["famille"] == fam]
    print(f"# L'audit de la famille `{fam}` — {titre} — avant le déplacement (D1521)\n")
    print(f"Les artefacts : {', '.join(textes) or 'aucun'} ; {len(mienne)} décisions de la famille.\n")
    print("## 1. Les décisions amendées ou remplacées — à confronter au texte\n")
    for d in mienne:
        if d["statut"] != "acceptée":
            par = d["remplacee_par"] or d["amendee_par"]
            ou = "citée" if d["numero"] in cites else "NON citée"
            print(f"- D{d['numero']} ({d['statut']} par {', '.join(f'D{x}' for x in par)} ; {ou}) — {d['titre'][:100]}")
    print("\n## 2. Les décisions de la famille que les artefacts ne citent pas — à vérifier\n")
    for d in mienne:
        if d["numero"] not in cites:
            print(f"- D{d['numero']} ({d['statut']}) — {d['titre'][:100]}")
    print("\n## 3. Les décisions qui portent une lecture à confirmer\n")
    for d in mienne:
        if d["lecture_ouverte"]:
            print(f"- D{d['numero']} — {d['titre'][:100]}")
    print("\n## 4. Les marques « en proposition » des artefacts\n")
    for a, t in textes.items():
        for n, l in enumerate(t.split("\n"), 1):
            if "en proposition" in l:
                print(f"- `{a}:{n}` — {l.strip()[:110]}")


def montrer(d):
    print(f"# D{d['numero']} — {d['titre']}\n")
    print(f"- la famille : `{d['famille']}` ({d['famille_source']}) ; le statut : {d['statut']}"
          f"{' ; une lecture à confirmer' if d['lecture_ouverte'] else ''}"
          f"{' ; sa lecture confirmée' if d['lecture'] and d['confirmee_par'] else ''}")
    for k, lib in (("amendee_par", "amendée par"), ("remplacee_par", "remplacée par"),
                   ("precisee_par", "précisée par"), ("confirmee_par", "confirmée par"),
                   ("close_par", "close par")):
        if d[k]:
            print(f"- {lib} : {', '.join(f'D{x}' for x in d[k])}")
    if d["liens"]:
        print("- pose : " + ", ".join(f"{l} {c if isinstance(c, str) else f'D{c}'}" for l, c in d["liens"]))
    print(f"- la ligne {d['ligne']} du registre ; cite {len(d['cite'])} décisions")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    chemin = sys.argv[1]
    racine = os.path.dirname(os.path.dirname(os.path.abspath(chemin)))
    decisions = calculer(lire(chemin))
    args = sys.argv[2:]
    if not args:
        resume(decisions)
    elif args[0] == "--familles":
        familles(decisions)
    elif args[0] == "--audit" and len(args) > 1:
        if args[1] not in FAMILLES:
            sys.exit(f"famille inconnue : {args[1]} — {', '.join(FAMILLES)}")
        audit(decisions, args[1], racine)
    elif args[0] == "--decision" and len(args) > 1:
        num = int(args[1].lstrip("D"))
        montrer(decisions[num])
    elif args[0] == "--numeros" and len(args) > 1:
        # les numéros d'une famille, en plages compactes — la liste des décisions d'un chapitre, pour son README
        if args[1] not in FAMILLES:
            sys.exit(f"famille inconnue : {args[1]} — {', '.join(FAMILLES)}")
        nums = sorted(d["numero"] for d in decisions.values() if d["famille"] == args[1])
        plages, debut, prev = [], None, None
        for n in nums + [None]:
            if debut is None:
                debut = prev = n
            elif n is not None and n == prev + 1:
                prev = n
            else:
                plages.append(f"D{debut}" if debut == prev else f"D{debut}–D{prev}")
                debut = prev = n
        print(f"{len(nums)} décisions : " + ", ".join(plages))
    elif args[0] == "--json" and len(args) > 1:
        with open(args[1], "w", encoding="utf-8") as f:
            json.dump(list(decisions.values()), f, ensure_ascii=False, indent=1)
        print(f"{len(decisions)} décisions écrites dans {args[1]}")
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
