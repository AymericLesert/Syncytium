"""Le traceur d'orphelins et le contrôle YAML d'un exemple Syncytium — un outil de relecture du dépôt, pas du code
du moteur (D313 ; D1240).

Usage : python tools/orphans.py examples/<cas>   (PyYAML requis ; sans -I, le module vit en site-packages utilisateur)

- Charge chaque .yml (yaml.safe_load) et signale les fichiers invalides.
- Part de syncytium.yml, suit toute référence ~{...} (un chemin relatif au fichier qui la porte, ou un
  motif regex sur un dossier), et marque les fichiers atteints.
- Liste les fichiers (.yml, .md, .txt, images) jamais atteints : les orphelins.
- Vérifie les lignes de plus de 120 caractères dans les .yml.
"""
import os
import re
import sys

import yaml

# La console Windows peut être en cp1252 : la sortie est forcée en UTF-8 (les accents, la flèche).
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8")

ROOT = os.path.abspath(sys.argv[1])
REF = re.compile(r"~\{([^}]*)\}")
reached = set()
errors = []
queue = []


def add(path):
    path = os.path.normpath(path)
    if path not in reached and os.path.isfile(path):
        reached.add(path)
        queue.append(path)


def resolve(base_dir, ref):
    """Un chemin exact, ou un motif regex dont le dossier est la partie fixe."""
    candidate = os.path.join(base_dir, ref)
    if os.path.isfile(candidate):
        return [candidate]
    # un motif : le dossier = les segments sans métacaractère
    parts = ref.split("/")  # jamais de remplacement des antislashs : ce sont les échappements du motif
    fixed = []
    for p in parts:
        if re.search(r"[.*+?\[\]()]", p) and p not in (".",):
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
    return found


start = os.path.join(ROOT, "syncytium.yml")
add(start)
while queue:
    path = queue.pop()
    if not path.endswith(".yml"):
        continue  # un fichier complémentaire ou une image : atteint, rien à suivre
    try:
        text = open(path, encoding="utf-8").read()
    except (OSError, UnicodeDecodeError) as e:
        errors.append(f"illisible : {path} ({e})")
        continue
    if True:
        try:
            yaml.safe_load(text)
        except yaml.YAMLError as e:
            errors.append(f"YAML invalide : {os.path.relpath(path, ROOT)} — {str(e).splitlines()[0]}")
        for n, line in enumerate(text.splitlines(), 1):
            if len(line) > 120:
                errors.append(f"ligne > 120 : {os.path.relpath(path, ROOT)}:{n}")
        for ref in REF.findall(text):
            targets = resolve(os.path.dirname(path), ref)
            if not targets and not re.search(r"[*+?\[\]()]", ref):
                errors.append(f"référence sans cible : {os.path.relpath(path, ROOT)} → ~{{{ref}}}")
            elif not targets:
                print(f"info : motif sans fichier (toléré) : {os.path.relpath(path, ROOT)} → ~{{{ref}}}")
            for t in targets:
                add(t)

all_files = []
for dirpath, _, files in os.walk(ROOT):
    for f in files:
        if f.endswith((".yml", ".md", ".txt", ".png", ".jpg", ".svg", ".csv")) and not f.startswith("."):
            all_files.append(os.path.normpath(os.path.join(dirpath, f)))
orphans = sorted(os.path.relpath(p, ROOT) for p in set(all_files) - reached)

print(f"{len(reached)} fichiers atteints, {len(all_files)} fichiers de configuration")
for e in errors:
    print("ERREUR", e)
for o in orphans:
    print("ORPHELIN", o)
print("OK" if not errors and not orphans else "À CORRIGER")
