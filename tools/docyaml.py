"""Le vérificateur des exemples YAML de la documentation — un outil de relecture du dépôt (D1545 : les exemples de
la documentation suivent les règles d'écriture des cas ; D1084–D1085, D1097).

Usage : python tools/docyaml.py docs/syncytium    (des dossiers ou des fichiers .md ; PyYAML requis)

Pour chaque bloc ```yaml d'un fichier .md :
- le bloc est du YAML valide (yaml.safe_load) ;
- aucune ligne ne dépasse 120 caractères ;
- aucun commentaire ne cite une décision (« D1234 ») : les décisions se citent dans la prose ;
- chaque clé de premier niveau est précédée d'un commentaire d'introduction, et une ligne vide sépare deux clés
  de premier niveau — la forme des cas.
Le code de sortie est 1 s'il reste un écart.
"""
import os
import re
import sys

import yaml

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8")

BLOC = re.compile(r"```yaml\n(.*?)```", re.S)
DECISION = re.compile(r"#.*\bD\d{2,4}\b")
CLE = re.compile(r"^[A-Za-z_][\w.\-*]*:")  # une clé de premier niveau, sans indentation


def fichiers(args):
    for a in args:
        if os.path.isdir(a):
            for racine, _, noms in os.walk(a):
                for n in sorted(noms):
                    if n.endswith(".md"):
                        yield os.path.join(racine, n)
        elif a.endswith(".md") and os.path.exists(a):
            yield a


def verifier_bloc(nom, debut, bloc, ecarts):
    lignes = bloc.split("\n")
    try:
        yaml.safe_load(bloc)
    except yaml.YAMLError as e:
        ecarts.append((nom, debut, f"YAML invalide — {str(e).splitlines()[0]}"))
    precedente = ""
    premiere = True
    for i, l in enumerate(lignes):
        n = debut + i
        if len(l) > 120:
            ecarts.append((nom, n, f"{len(l)} caractères"))
        if DECISION.search(l):
            ecarts.append((nom, n, "une décision en commentaire"))
        if CLE.match(l):
            if not precedente.startswith("#"):
                ecarts.append((nom, n, "une clé de premier niveau sans introduction"))
            elif not premiere:
                # la ligne vide doit précéder le bloc de commentaires de cette clé
                j = i - 1
                while j >= 0 and lignes[j].startswith("#"):
                    j -= 1
                if j >= 0 and lignes[j].strip() != "":
                    ecarts.append((nom, n, "pas de ligne vide avant la clé"))
            premiere = False
        precedente = l


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    ecarts = []
    blocs = 0
    for f in fichiers(sys.argv[1:]):
        with open(f, encoding="utf-8") as h:
            texte = h.read()
        for m in BLOC.finditer(texte):
            blocs += 1
            debut = texte[:m.start()].count("\n") + 2
            verifier_bloc(f, debut, m.group(1), ecarts)
    for f, n, quoi in ecarts:
        print(f"{f}:{n} : {quoi}")
    print(f"{blocs} blocs YAML vérifiés, {len(ecarts)} écart{'s' if len(ecarts) > 1 else ''}")
    sys.exit(1 if ecarts else 0)


if __name__ == "__main__":
    main()
