"""Le plan complet de la conception, en une page — un outil du dépôt (D1660).

Usage : python tools/plan.py            (écrit docs/histoire/plan.md ; à lancer depuis la racine du dépôt)

La page porte quatre tables, chacune aux quatre colonnes « numéro, titre, état, fin » :
- les huit domaines (le registre, §1.2) ;
- les rangs du chantier de la documentation (documentation.md, §5) ;
- leurs étapes (la liste « Étapes » de chaque rang) ;
- les quatorze chapitres du rang 10 (docs/README.md, la table).
La date de fin d'un domaine ou d'une étape est celle de sa dernière décision : la date de naissance de chaque
décision est lue dans l'historique git du registre — le premier commit qui porte sa ligne — et mise en cache dans
tools/plan-dates.json, que chaque exécution complète des commits nouveaux.
"""
import json
import os
import re
import subprocess
import sys
from datetime import date

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8")

REGISTRE = "docs/conception.md"
PLAN_DOC = "docs/documentation.md"
PLAN_CHAPITRES = "docs/README.md"
SORTIE = "docs/histoire/plan.md"
CACHE = "tools/plan-dates.json"

REFS_D = re.compile(r"D(\d+)(?:\s*[–-]\s*D?(\d+))?")
LIGNE_D = re.compile(r"^\| \**D(\d+)\**? \|", re.M)
ACQUISE = re.compile(r"\*\*acquis|\*\*fait|\*\*placé|\*\*soldé|\*\(tombée", re.I)
TOMBEE = re.compile(r"\*\(tombée", re.I)
EN_COURS = re.compile(r"en cours", re.I)


def lire(chemin):
    with open(chemin, encoding="utf-8") as f:
        return f.read().replace("\r\n", "\n")


def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True, encoding="utf-8",
                          errors="replace").stdout


def deplier(texte):
    out = set()
    for a, b in REFS_D.findall(texte):
        a = int(a)
        out.update(range(a, int(b) + 1) if b and a <= int(b) <= a + 200 else [a])
    return out


def strip_md(s):
    return re.sub(r"[*`_]", "", s).strip()


def fr(d):
    """Une date ISO en JJ/MM/AAAA."""
    return f"{d[8:10]}/{d[5:7]}/{d[0:4]}" if d else "—"


def dates_des_decisions():
    """La date de naissance de chaque décision : le premier commit du registre qui porte sa ligne."""
    cache = {"dernier": None, "dates": {}}
    if os.path.exists(CACHE):
        with open(CACHE, encoding="utf-8") as f:
            cache = json.load(f)
    commits = [l.split(" ") for l in git("log", "--reverse", "--format=%H %ad", "--date=short", "--",
                                         REGISTRE).splitlines() if l]
    hashes = [h for h, _ in commits]
    if cache["dernier"] in hashes:
        commits = commits[hashes.index(cache["dernier"]) + 1:]
    dates = {int(k): v for k, v in cache["dates"].items()}
    plus_haut = max(dates) if dates else 0
    for h, d in commits:
        nums = [int(n) for n in LIGNE_D.findall(git("show", f"{h}:{REGISTRE}"))]
        haut = max(nums) if nums else 0
        for n in range(plus_haut + 1, haut + 1):
            dates[n] = d
        plus_haut = max(plus_haut, haut)
        cache["dernier"] = h
    cache["dates"] = {str(k): v for k, v in sorted(dates.items())}
    with open(CACHE, "w", encoding="utf-8", newline="\n") as f:
        json.dump(cache, f, ensure_ascii=False, indent=0)
    return dates


def fin(texte, dates):
    """La date de la dernière décision citée dans un texte."""
    ds = [dates[n] for n in deplier(texte) if n in dates]
    return max(ds) if ds else ""


def domaines(registre, dates):
    i = registre.index("### 1.2 La démarche")
    j = registre.index("\n### ", i + 10)
    out = []
    for l in registre[i:j].split("\n"):
        m = re.match(r"\| (\d) \| (.+?) \| (.+?) \| (.+?) \|\s*$", l)
        if m:
            titre = strip_md(m.group(2)).split(" — ")[0]
            etat = strip_md(m.group(3))
            clos = etat.lower().startswith(("livré", "soldé", "clos"))
            out.append((m.group(1), titre, etat, fin(m.group(4), dates) if clos else ""))
    return out


def clotures(registre, dates):
    """Les rangs clos par une décision qui le dit — « le rang N est clos » — quand l'en-tête du rang ne le dit pas."""
    out = {}
    for l in registre.split("\n"):
        m = re.match(r"\| D(\d+) \| (.*)", l)
        if m:
            for r in re.findall(r"rang (\d+) (?:est |— )?clos", m.group(2), re.I):
                out.setdefault(int(r), dates.get(int(m.group(1)), ""))
    return out


def titre_etape(texte):
    """Le titre d'une étape : sa première proposition, sans la liste qui la détaille."""
    texte = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", texte)
    if TOMBEE.search(texte):
        return "(tombée)"
    tete = re.split(r" : |\(|;", texte, maxsplit=1)[0]
    if " — " in tete:
        avant = tete.split(" — ", 1)[0]
        tete = tete if len(avant.strip()) <= 7 else avant
    titre = strip_md(tete).rstrip(" ;.,")
    return titre if len(titre) <= 90 else titre[:87].rstrip() + "…"


def rangs_et_etapes(doc, dates, clos_par_decision):
    acquis_ailleurs = {f"{a}.{b}" for a, b in re.findall(r"\(le rang (\d+), étape (\d+) — acquis", doc)}
    rangs, etapes = [], []
    courant = None
    dans_etapes = False
    item = None

    def clore_item():
        if item is not None:
            etapes.append(item)

    for l in doc.split("\n"):
        m = re.match(r"#### Rang (\d+) — (.+?)(?: — \*(.*?)\*)?\s*$", l)
        if m:
            clore_item()
            item = None
            dans_etapes = False
            n = int(m.group(1))
            clos = re.search(r"clos le (\d{2})/(\d{2})/(\d{4})", m.group(3) or "")
            date_fin = f"{clos.group(3)}-{clos.group(2)}-{clos.group(1)}" if clos else clos_par_decision.get(n, "")
            titre = re.sub(r"\s*\(D\d+\)\s*$", "", strip_md(m.group(2)).split(" (documentation")[0])
            courant = {"n": n, "titre": titre, "fin": date_fin, "etat": "clos" if date_fin else "en cours"}
            rangs.append(courant)
            continue
        if courant is None:
            continue
        if re.match(r"- \*\*Étapes\*\*", l):
            dans_etapes = True
            continue
        if not dans_etapes:
            continue
        step = re.match(r"  (\d+)\. (.*)", l)
        if step:
            clore_item()
            item = {"rang": courant["n"], "n": int(step[1]), "texte": step[2]}
            continue
        if l.startswith("     ") and item is not None:
            item["texte"] += " " + l.strip()
            continue
        clore_item()
        item = None
        dans_etapes = False
    clore_item()
    for e in etapes:
        r = next(x for x in rangs if x["n"] == e["rang"])
        cle = f"{e['rang']}.{e['n']}"
        t = e["texte"]
        if TOMBEE.search(t):
            e["etat"] = "tombée"
        elif r["fin"] or ACQUISE.search(t) or cle in acquis_ailleurs:
            e["etat"] = "acquise"
        elif EN_COURS.search(t):
            e["etat"] = "en cours"
        else:
            e["etat"] = "à venir"
        # un rang clos date ses étapes ; le rang en cours date chacune par sa dernière décision
        e["fin"] = (r["fin"] or fin(t, dates)) if e["etat"] in ("acquise", "tombée") else ""
        e["titre"] = titre_etape(t)
    return rangs, etapes


def chapitres(plan):
    out = []
    for l in plan.split("\n"):
        m = re.match(r"\| (\d+) \| \*\*(.+?)\*\* \| .+? \| .+? \| (.+?) \| (.+?) \|\s*$", l)
        if not m:
            continue
        lecture, reorg = m.group(3), m.group(4)
        faits = [c.startswith("fait") for c in (lecture, reorg)]
        if all(faits) and "réécrite" in reorg:
            etat = "fait"
        elif lecture.strip() == "—":
            etat = "à faire"
        else:
            etat = "en cours"
        ds = re.findall(r"(\d{2})/(\d{2})/(\d{4})", lecture + " " + reorg)
        date_fin = max(f"{a}-{mo}-{j}" for j, mo, a in ds) if ds and etat == "fait" else ""
        out.append((m.group(1), m.group(2), etat, date_fin))
    return out


def table(lignes):
    out = ["| # | Le titre | L'état | La fin |", "|---|---|---|---|"]
    for n, titre, etat, d in lignes:
        out.append(f"| {n} | {titre} | {etat} | {fr(d)} |")
    return "\n".join(out)


def main():
    registre = lire(REGISTRE)
    doc = lire(PLAN_DOC)
    plan = lire(PLAN_CHAPITRES)
    dates = dates_des_decisions()
    doms = domaines(registre, dates)
    rangs, etapes = rangs_et_etapes(doc, dates, clotures(registre, dates))
    chaps = chapitres(plan)
    aujourd_hui = fr(date.today().isoformat())
    parties = [
        "# Le plan de la conception",
        "",
        "*Cette page donne le plan complet de la conception de Syncytium, à quatre",
        "niveaux : les domaines, les rangs du chantier de la documentation, leurs",
        "étapes, et les chapitres du rang 10. Chaque ligne porte un numéro, un titre,",
        "un état et une date de fin. Elle est calculée depuis le",
        "[registre](../conception.md), le [plan du chantier](../documentation.md)",
        "et le [plan de la documentation](../README.md) par `python tools/plan.py`,",
        f"le {aujourd_hui} (D1660).*",
        "",
        "## Le sommaire",
        "",
        "- [Les huit domaines](#les-huit-domaines)",
        "- [Les rangs du chantier de la documentation](#les-rangs-du-chantier-de-la-documentation)",
        "- [Les étapes des rangs](#les-étapes-des-rangs)",
        "- [Les quatorze chapitres du rang 10](#les-quatorze-chapitres-du-rang-10)",
        "",
        "## Les huit domaines",
        "",
        "Les domaines sont la carte de la conception : décrire, clarifier et spécifier",
        "avant de coder (D314, D602, D643). La date de fin est celle de la dernière",
        "décision du domaine.",
        "",
        table(doms),
        "",
        "## Les rangs du chantier de la documentation",
        "",
        "Le chantier de la documentation générée (D1118, D1136) occupe le domaine 6.",
        "Onze rangs, de 0 à 10 : chaque rang produit une documentation, et le rang 10",
        "reprend `docs/`.",
        "",
        table([(r["n"], r["titre"], r["etat"], r["fin"]) for r in rangs]),
        "",
        "## Les étapes des rangs",
        "",
        "Chaque étape est un arbitrage. Sa date de fin est celle de la clôture de",
        "son rang ; pour le rang en cours, celle de sa dernière décision.",
        "",
        table([(f"{e['rang']}.{e['n']}", e["titre"], e["etat"], e["fin"]) for e in etapes]),
        "",
        "## Les quatorze chapitres du rang 10",
        "",
        "Un chapitre se fait en trois temps : la lecture, la réorganisation, la",
        "réécriture (D1521, D1543). Il est fait quand les trois le sont.",
        "",
        table(chaps),
        "",
    ]
    with open(SORTIE, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(parties))
    print(f"{SORTIE} : {len(doms)} domaines, {len(rangs)} rangs, {len(etapes)} étapes, {len(chaps)} chapitres")


if __name__ == "__main__":
    main()
