"""La complétude de la documentation d'un exemple Syncytium — un outil de relecture du dépôt, pas du code du moteur
(D313 ; D1240 pour le traceur, D1478–D1481 pour la complétude).

Usage : python tools/completeness.py examples/<cas>   (PyYAML requis)

- Charge la configuration depuis syncytium.yml en suivant toute référence ~{...} (un chemin, ou un motif regex).
- Relève les manques de l'inventaire de documentation.md §20 (D1478) visibles au dépôt — ce que le concepteur n'a pas
  décrit ; jamais un défaut du socle, jamais une langue manquante (une erreur d'ingestion, D1474).
- Imprime le rapport dans la forme de D1479 : par version, le taux par documentation et par module, puis la liste des
  manques avec la clé à écrire et où. Le code de retour porte le taux global arrondi (0–100), pour un script.
"""
import os
import re
import sys
from collections import defaultdict

import yaml

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8")

ROOT = os.path.abspath(sys.argv[1])
REF = re.compile(r"^~\{([^}]*)\}$")
VERSION_KEYS = {"version", "languages", "release-notes", "authors", "settings", "groups", "documentation",
                "migrations", "modules", "hooks", "resources", "from", "environment"}
ENTITY_KEYS = {"name", "description", "title", "label", "identity", "history", "fields", "gui", "operations",
               "validation", "allow", "confidentiality", "rgpd", "menu", "entities", "parent", "type", "unique",
               "searchable", "mode", "root", "extends", "indexes", "export", "import", "watch", "when", "every"}
origin = {}  # id(nœud) → fichier d'origine, pour dire « où »
texts = []  # les textes complémentaires (md) chargés, pour y chercher la mention d'information


def resolve(base_dir, ref):
    candidate = os.path.join(base_dir, ref)
    if os.path.isfile(candidate):
        return [candidate]
    parts = ref.split("/")
    fixed = []
    for p in parts:
        if re.search(r"[.*+?\[\]()]", p) and p != ".":
            break
        fixed.append(p)
    directory = os.path.join(base_dir, *fixed) if fixed else base_dir
    pattern = re.compile("^" + "/".join(parts[len(fixed):]) + "$")
    found = []
    for dirpath, _, files in os.walk(directory):
        for f in files:
            rel = os.path.relpath(os.path.join(dirpath, f), directory).replace("\\", "/")
            if pattern.match(rel):
                found.append(os.path.join(dirpath, f))
    return sorted(found)


def mark(node, path):
    if id(node) in origin:
        return  # déjà marqué par son propre fichier
    if isinstance(node, dict):
        origin[id(node)] = path
        for v in node.values():
            mark(v, path)
    elif isinstance(node, list):
        origin[id(node)] = path
        for v in node:
            mark(v, path)


def load(path):
    rel = os.path.relpath(path, ROOT).replace("\\", "/")
    if not path.endswith(".yml"):
        try:
            texts.append(open(path, encoding="utf-8").read())
        except (OSError, UnicodeDecodeError):
            pass
        return f"~file:{rel}"
    with open(path, encoding="utf-8") as f:
        data = yaml.safe_load(f)
    data = expand(data, os.path.dirname(path))
    mark(data, rel)
    return data


def expand(node, base_dir):
    if isinstance(node, str):
        m = REF.match(node.strip())
        if m:
            targets = resolve(base_dir, m.group(1))
            if len(targets) == 1:
                return load(targets[0])
            return [load(t) for t in targets]
        return node
    if isinstance(node, list):
        out = []
        for v in node:
            if isinstance(v, str) and REF.match(v.strip()):
                targets = resolve(base_dir, REF.match(v.strip()).group(1))
                out.extend(load(t) for t in targets)
            else:
                out.append(expand(v, base_dir))
        return out
    if isinstance(node, dict):
        return {k: expand(v, base_dir) for k, v in node.items()}
    return node


def where(node, fallback):
    return origin.get(id(node), fallback)


def present(value):
    """Un texte est présent s'il n'est ni absent ni vide — un texte simple, un md, ou un dict par langue."""
    if value is None:
        return False
    if isinstance(value, str):
        return value.strip() != ""
    if isinstance(value, dict):
        return any(present(v) for v in value.values())
    return True


# ---- l'inventaire (D1478) : un code, le libellé du manque, la clé à écrire, les documentations affaiblies
INVENTAIRE = {
    "entite.description": ("l'entité sans description", "description:", ["fonctionnelle", "dictionnaire"]),
    "champ.aide": ("le champ sans aide ni description", "hint: ou description:", ["fonctionnelle", "dictionnaire"]),
    "libelle": ("le libellé du champ absent — le nom nu s'affiche", "label:", ["fonctionnelle"]),
    "entite.title": ("l'entité sans nom d'usage (D1120 ; à valider)", "title:", ["fonctionnelle"]),
    "enum.libelle": ("l'énuméré sans libellé", "label: de la valeur", ["fonctionnelle", "dictionnaire"]),
    "type.description": ("le type personnalisé sans description", "description: du type", ["dictionnaire"]),
    "hook.md": ("le hook sans md", "description: de la fiche", ["développeur"]),
    "surface.description": ("la surface sans description — le masque vide", "description: de la surface",
                            ["fonctionnelle"]),
    "operation.description": ("l'opération sans description ni md", "description: ou le md du hook",
                              ["fonctionnelle", "développeur"]),
    "erreur.arbre": ("l'erreur codifiée sans arbre", "resolution: dans errors:", ["guide"]),
    "groupe.persona": ("le groupe sans persona", "persona: du groupe", ["fonctionnelle"]),
    "rgpd.controller": ("le traitement sans responsable", "controller:", ["réglementaire"]),
    "rgpd.propriete": ("la propriété du traitement absente à tous les niveaux", "purpose:, legal:",
                       ["réglementaire"]),
    "rgpd.mention": ("la mention d'information non ancrée", "${rgpd.notice} dans un texte ou un paragraph",
                     ["réglementaire", "fonctionnelle"]),
    "projet.support": ("le projet sans texte de support", "pages: support:", ["projet"]),
    "env.description": ("l'environnement sans description", "description: de l'environnement", ["D.A.T."]),
    "env.operations": ("l'environnement sans texte d'exploitation", "pages: operations:", ["guide"]),
    "module.description": ("le module sans description (hors inventaire, à valider)", "description: du module",
                           ["fonctionnelle"]),
}
DOCS = ["fonctionnelle", "dictionnaire", "réglementaire", "développeur", "D.A.T.", "guide", "projet"]


class Rapport:
    def __init__(self):
        self.attendus = defaultdict(lambda: defaultdict(int))  # (documentation) → module → n
        self.manques = []  # (code, module, où, élément)

    def check(self, ok, code, module, node, element, fallback):
        for doc in INVENTAIRE[code][2]:
            self.attendus[doc][module] += 1
        if not ok:
            self.manques.append((code, module, where(node, fallback), element))


def walk_fields(r, module, ent_name, fields, fallback):
    if not isinstance(fields, dict):
        return
    for fname, spec in fields.items():
        el = f"{ent_name}.{fname}"
        spec_d = spec if isinstance(spec, dict) else {}
        if isinstance(spec_d.get("fields"), dict) and "type" not in spec_d:  # un groupe de champs (D1279)
            walk_fields(r, module, ent_name, spec_d["fields"], fallback)
            continue
        r.check(present(spec_d.get("label")), "libelle", module, spec_d or fields, el, fallback)
        r.check(present(spec_d.get("hint")) or present(spec_d.get("description")), "champ.aide", module,
                spec_d or fields, el, fallback)
        values = spec_d.get("values")
        if isinstance(values, dict):
            for vname, vspec in values.items():
                ok = isinstance(vspec, dict) and present(vspec.get("label"))
                r.check(ok, "enum.libelle", module, values, f"{el} = {vname}", fallback)
        elif isinstance(values, list):
            for v in values:
                r.check(isinstance(v, dict) and present(v.get("label")), "enum.libelle", module, values,
                        f"{el} = {v}", fallback)


def walk_gui(r, module, owner, gui, fallback):
    if not isinstance(gui, dict):
        return
    for section, surfaces in gui.items():
        if not isinstance(surfaces, dict):
            continue
        for sname, sspec in surfaces.items():
            if isinstance(sspec, dict):
                r.check(present(sspec.get("description")), "surface.description", module, sspec,
                        f"{owner} gui.{section}.{sname}", fallback)


def walk_operations(r, module, owner, ops, hooks_md, settings_rgpd, fallback):
    if not isinstance(ops, dict):
        return
    for oname, ospec in ops.items():
        ospec = ospec if isinstance(ospec, dict) else {}
        ok = present(ospec.get("description")) or oname in hooks_md
        r.check(ok, "operation.description", module, ospec or ops, f"{owner}.{oname}", fallback)
        if isinstance(ospec.get("rgpd"), dict):
            for prop in ("purpose",):
                ok = present(ospec["rgpd"].get(prop)) or present((settings_rgpd or {}).get(prop))
                r.check(ok, "rgpd.propriete", module, ospec["rgpd"], f"{owner}.{oname} rgpd.{prop}", fallback)


def walk_entity(r, module, ent, name, hooks_md, settings_rgpd, fallback, rgpd_fields):
    if not isinstance(ent, dict):
        return
    ent_name = ent.get("name", name)
    r.check(present(ent.get("description")), "entite.description", module, ent, ent_name, fallback)
    r.check(present(ent.get("title")), "entite.title", module, ent, ent_name, fallback)
    fields = ent.get("fields")
    walk_fields(r, module, ent_name, fields, fallback)
    if isinstance(fields, dict):
        for spec in fields.values():
            if isinstance(spec, dict) and spec.get("rgpd"):
                rgpd_fields.append(f"{ent_name}")
    walk_gui(r, module, ent_name, ent.get("gui"), fallback)
    walk_operations(r, module, ent_name, ent.get("operations"), hooks_md, settings_rgpd, fallback)
    for sub_name, sub in (ent.get("entities") or {}).items() if isinstance(ent.get("entities"), dict) else []:
        walk_entity(r, module, sub, sub_name, hooks_md, settings_rgpd, fallback, rgpd_fields)


def walk_module(r, mod, name, hooks_md, settings_rgpd, fallback, rgpd_fields):
    if not isinstance(mod, dict):
        return
    module = mod.get("name", name)
    r.check(present(mod.get("description")), "module.description", module, mod, module, fallback)
    entities = mod.get("entities")
    if isinstance(entities, list):
        for ent in entities:
            walk_entity(r, module, ent, "?", hooks_md, settings_rgpd, fallback, rgpd_fields)
    elif isinstance(entities, dict):
        for ename, ent in entities.items():
            walk_entity(r, module, ent, ename, hooks_md, settings_rgpd, fallback, rgpd_fields)
    else:  # la forme en ligne du tiny : les entités sont les clés qui ne sont pas des propriétés du module
        for ename, ent in mod.items():
            if ename not in ENTITY_KEYS and isinstance(ent, dict) and "fields" in ent:
                walk_entity(r, module, ent, ename, hooks_md, settings_rgpd, fallback, rgpd_fields)
    walk_gui(r, module, module, mod.get("gui"), fallback)
    walk_operations(r, module, module, mod.get("operations"), hooks_md, settings_rgpd, fallback)


def hooks_with_md(hooks):
    """Les fiches de hooks qui portent une description (md) ; et les manques des fiches."""
    found, fiches = set(), []
    if not isinstance(hooks, dict):
        return found, fiches
    for family, lst in hooks.items():
        items = []
        stack = [lst]
        while stack:  # la chaîne à deux étages (D777) : hooks.yml → le fichier de famille → les fiches
            x = stack.pop()
            if isinstance(x, list):
                stack.extend(x)
            elif isinstance(x, dict) and "name" in x:
                items.append(x)
            elif isinstance(x, dict):
                stack.extend(x.values())
        for fiche in items:
            if isinstance(fiche, dict) and "name" in fiche:
                fiches.append((family, fiche))
                if present(fiche.get("description")):
                    found.add(fiche["name"])
    return found, fiches


def walk_version(r, ver, label, env_names):
    fallback = f"versions/{label}"
    settings = ver.get("settings") if isinstance(ver.get("settings"), dict) else {}
    settings_rgpd = settings.get("rgpd") if isinstance(settings.get("rgpd"), dict) else None
    hooks_md, fiches = hooks_with_md(ver.get("hooks"))
    for family, fiche in fiches:
        code = "hook.md" if family in ("operations", "functions", "connectors", "styles") else "type.description"
        r.check(fiche["name"] in hooks_md, code, "(hooks)", fiche, f"{family}.{fiche['name']}", fallback)
        errors = fiche.get("errors")
        if isinstance(errors, dict):
            for ecode, espec in errors.items():
                if isinstance(espec, dict) and espec.get("level") in ("error", "exception"):
                    r.check(present(espec.get("resolution")), "erreur.arbre", "(hooks)", espec,
                            f"{fiche['name']}.{ecode}", fallback)
    # les types personnalisés : les entrées de settings.field qui déclarent un type (un dérivé, D1239)
    for tname, tspec in (settings.get("field") or {}).items() if isinstance(settings.get("field"), dict) else []:
        if isinstance(tspec, dict) and "type" in tspec:
            r.check(present(tspec.get("description")), "type.description", "(settings)", tspec, tname, fallback)
    rgpd_fields = []
    modules = ver.get("modules")
    if isinstance(modules, list):
        for mod in modules:
            walk_module(r, mod, "?", hooks_md, settings_rgpd, fallback, rgpd_fields)
    else:  # la forme en ligne du tiny : les modules sont les clés qui ne sont pas des propriétés de la version
        for mname, mod in ver.items():
            if mname not in VERSION_KEYS and isinstance(mod, dict) and not re.match(r"^\d+(\.\d+)+$", str(mname)):
                walk_module(r, mod, mname, hooks_md, settings_rgpd, fallback, rgpd_fields)
    groups = ver.get("groups")
    if isinstance(groups, dict):
        for gname, gspec in groups.items():
            ok = isinstance(gspec, dict) and present(gspec.get("persona"))
            r.check(ok, "groupe.persona", "(groups)", gspec if isinstance(gspec, dict) else groups, gname, fallback)
    doc = ver.get("documentation") if isinstance(ver.get("documentation"), dict) else {}
    pages = doc.get("pages") if isinstance(doc.get("pages"), dict) else {}
    r.check(present(pages.get("support")), "projet.support", "(projet)", doc or ver, "documentation.yml", fallback)
    if rgpd_fields:
        r.check(settings_rgpd is not None and present(settings_rgpd.get("controller")), "rgpd.controller",
                "(settings)", settings_rgpd or settings or ver, "rgpd.controller", fallback)
        for prop in ("purpose", "legal"):
            r.check(settings_rgpd is not None and present(settings_rgpd.get(prop)), "rgpd.propriete", "(settings)",
                    settings_rgpd or settings or ver, f"rgpd.{prop}", fallback)
        anchored = any("rgpd.notice" in t for t in texts) or "rgpd.notice" in yaml.safe_dump(ver, allow_unicode=True)
        r.check(anchored, "rgpd.mention", "(projet)", ver, "la mention d'information — " + ", ".join(
            sorted(set(rgpd_fields))), fallback)


def versions_of(status_block):
    """Les versions d'un statut : la liste `versions:` (les fichiers) ou les clés x.y.z.w (la forme en ligne)."""
    out = []
    if not isinstance(status_block, dict):
        return out
    for v in status_block.get("versions") or []:
        if isinstance(v, dict):
            out.append((str(v.get("version", "?")), v))
    for k, v in status_block.items():
        if re.match(r"^\d+(\.\d+)+$", str(k)) and isinstance(v, dict):
            out.append((str(k), v))
    return out


def main():
    project = load(os.path.join(ROOT, "syncytium.yml"))
    name = project.get("name", os.path.basename(ROOT))
    print(f"# La complétude de la documentation — {name}\n")
    print("*Rapport calculé au dépôt par `tools/completeness.py` (D1478–D1481) : les manques visibles dans la "
          "configuration seule ; la variable sans valeur se mesure à l'instance.*\n")
    envs = project.get("environments") if isinstance(project.get("environments"), dict) else {}
    r_env = Rapport()
    for ename, espec in envs.items():
        espec = espec if isinstance(espec, dict) else {}
        r_env.check(present(espec.get("description")), "env.description", "(environnements)", espec or envs, ename,
                    "environments")
        pages = (espec.get("documentation") or {}).get("pages") if isinstance(espec.get("documentation"), dict) \
            else espec.get("pages")
        ok = isinstance(pages, dict) and present(pages.get("operations"))
        r_env.check(ok, "env.operations", "(environnements)", espec or envs, ename, "environments")
    rates = []
    versions = project.get("versions") if isinstance(project.get("versions"), dict) else {}
    for status, block in versions.items():
        for vlabel, ver in versions_of(block):
            r = Rapport()
            r.attendus.update({d: dict(m) for d, m in r_env.attendus.items()})
            for d, m in r_env.attendus.items():
                for mod, n in m.items():
                    r.attendus[d][mod] = n
            r.manques.extend(r_env.manques)
            walk_version(r, ver, f"{status}/{vlabel}", set(envs))
            rates.append(print_version(r, f"{vlabel} ({status})"))
    taux = round(sum(rates) / len(rates)) if rates else 100
    print(f"\n**Le taux global : {taux} %** — le code de retour.")
    sys.exit(taux)


def print_version(r, label):
    manques_par = defaultdict(lambda: defaultdict(int))  # doc → module → n
    for code, module, _, _ in r.manques:
        for doc in INVENTAIRE[code][2]:
            manques_par[doc][module] += 1
    print(f"## La version {label}\n")
    print("### Le taux par documentation et par module\n")
    modules = sorted({m for d in r.attendus.values() for m in d})
    print("| La documentation | " + " | ".join(modules) + " | **la version** |")
    print("|---|" + "---|" * len(modules) + "---|")
    total_att = total_man = 0
    for doc in DOCS:
        if doc not in r.attendus:
            continue
        cells, att_doc, man_doc = [], 0, 0
        for m in modules:
            att = r.attendus[doc].get(m, 0)
            man = manques_par[doc].get(m, 0)
            att_doc += att
            man_doc += man
            cells.append(f"{round(100 * (att - man) / att)} % ({att - man}/{att})" if att else "—")
        total_att += att_doc
        total_man += man_doc
        print(f"| {doc} | " + " | ".join(cells) + f" | **{round(100 * (att_doc - man_doc) / att_doc)} %** |")
    taux = round(100 * (total_att - total_man) / total_att) if total_att else 100
    print(f"\n**Le taux de la version : {taux} %** — {total_att - total_man} éléments décrits sur {total_att} attendus, "
          f"{len(r.manques)} manques.\n")
    print("### Les manques, par nature\n")
    print("| Le manque | Combien | La clé à écrire | La documentation |")
    print("|---|---|---|---|")
    counts = defaultdict(int)
    for code, *_ in r.manques:
        counts[code] += 1
    for code, (lib, cle, docs) in INVENTAIRE.items():
        if counts[code]:
            print(f"| {lib} | {counts[code]} | `{cle}` | {', '.join(docs)} |")
    print("\n### La liste des manques — la clé à écrire et où\n")
    for code, (lib, cle, docs) in INVENTAIRE.items():
        items = [(m, o, e) for c, m, o, e in r.manques if c == code]
        if not items:
            continue
        print(f"**{lib}** — `{cle}` :")
        by_file = defaultdict(list)
        for m, o, e in items:
            by_file[o].append(e)
        for o in sorted(by_file):
            print(f"- `{o}` : " + ", ".join(by_file[o]))
        print()
    return taux


if __name__ == "__main__":
    main()
