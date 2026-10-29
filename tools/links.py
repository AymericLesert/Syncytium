"""Le vérificateur des liens relatifs de la documentation — un outil de relecture du dépôt (D1520 : les renvois
relatifs, jamais une adresse brute ; D1521 : les renvois réécrits à chaque chapitre déplacé).

Usage : python tools/links.py docs usecases README.md    (des dossiers ou des fichiers .md)

- Lit chaque .md ; relève les liens Markdown `[texte](cible)` et `[texte](cible#ancre)`.
- Ignore les adresses absolues (http, https, mailto) et les ancres seules (`#…`).
- Vérifie que la cible, relative au fichier qui la porte, existe sur le disque ; liste ce qui ne mène nulle part.
- Le code de sortie est 1 s'il reste un lien cassé.
"""
import os
import re
import sys

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8")

LIEN = re.compile(r"\[[^\]]*\]\(([^)\s]+)\)")
CODE = re.compile(r"```.*?```|`[^`\n]*`", re.S)  # les blocs et les portées de code ne portent pas de liens


def fichiers(args):
    for a in args:
        if os.path.isdir(a):
            for racine, _, noms in os.walk(a):
                for n in sorted(noms):
                    if n.endswith(".md"):
                        yield os.path.join(racine, n)
        elif a.endswith(".md") and os.path.exists(a):
            yield a


def verifier(chemins):
    casses = []
    total = 0
    for f in chemins:
        with open(f, encoding="utf-8") as h:
            texte = CODE.sub("", h.read())  # les blocs de code ne portent pas de liens
        for n, ligne in enumerate(texte.split("\n"), 1):
            for cible in LIEN.findall(ligne):
                if cible.startswith(("http://", "https://", "mailto:", "#")):
                    continue
                total += 1
                chemin = cible.split("#", 1)[0]
                if not chemin:
                    continue
                attendu = os.path.normpath(os.path.join(os.path.dirname(f), chemin))
                if not os.path.exists(attendu):
                    casses.append((f, n, cible))
    return total, casses


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    total, casses = verifier(list(fichiers(sys.argv[1:])))
    for f, n, cible in casses:
        print(f"{f}:{n} : `{cible}` ne mène nulle part")
    print(f"{total} liens relatifs vérifiés, {len(casses)} cassé{'s' if len(casses) > 1 else ''}")
    sys.exit(1 if casses else 0)


if __name__ == "__main__":
    main()
