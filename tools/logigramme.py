"""Le logigramme : une description YAML, un dessin SVG dans la forme arrêtée par l'auteur (D1847, D1848) — une colonne
de Début à Fin, les actions en rectangles, les décisions en losanges aux branches Oui et Non, les arcs à angle droit,
les retours et les détours sur le côté, les commentaires reliés par un trait. Un outil de la documentation du dépôt,
pas du code du moteur (D313).

Usage :
  python tools/logigramme.py <fichier.yml> [...]        dessine <fichier.svg> à côté de chaque description
  python tools/logigramme.py <dossier>                   toutes les descriptions `*.yml` du dossier, récursivement

La description :

  title: L'acceptation ou le refus d'un accès     # le titre, écrit sous le dessin (facultatif)
  steps:                                          # la colonne principale, de haut en bas
    - start: Début                                # le terminateur de départ
    - action: Un utilisateur se connecte          # une action
      note: le connecteur contrôle                # un commentaire, relié par un trait
    - decision: Actif ?                           # une décision ; « Oui » continue vers le pas suivant,
      no: {to: refus}                             #   « Non » saute vers le pas nommé `refus`
    - decision: Groupe nommé ?
      no:                                         # ou ouvre un détour, des pas sur le côté, qui rejoint `to`
        side: [{action: Entre comme reader}]
        to: fin
    - action: Entre avec ses groupes
    - end: Fin
      id: fin                                     # le nom d'un pas, cible d'un saut
  sides:                                          # les colonnes de côté nommées, cibles d'un saut
    refus:
      from: 2                                     # la ligne où la colonne commence (le rang du pas, de 0)
      steps:
        - action: Refusé
          id: refus
          note: même présent dans un autre groupe
      to: fin                                     # où la colonne rejoint la colonne principale

Chaque pas accepte `id:` et `note:` ; `yes:` se déclare comme `no:` quand c'est « Oui » qui sort de la colonne.
"""
import html
import os
import sys

import yaml

# Les mesures, en pixels : la police, les boîtes, les écarts.
FONT = 12
CHAR = 6.6                 # la largeur moyenne d'un caractère à cette police
ACTION_H = 28
TERM_H = 26
DIAMOND_H = 56
MIN_W = 110
MAX_W = 230
ROW = 74                   # la hauteur d'une ligne, boîte comprise
COL = 240                  # l'écart entre deux colonnes
NOTE_GAP = 40
MARGIN = 30
FILL = "#f2f2f2"
STROKE = "#555555"
TEXT = "#111111"
LINE = "#333333"


def largeur(texte, mini=MIN_W):
    return max(mini, min(MAX_W, int(len(texte) * CHAR) + 24))


def lire(chemin):
    with open(chemin, encoding="utf-8") as f:
        return yaml.safe_load(f)


class Noeud:
    def __init__(self, genre, texte, col, rang, ident=None, note=None):
        self.genre, self.texte, self.col, self.rang, self.id, self.note = genre, texte, col, rang, ident, note
        self.w = largeur(texte, 80 if genre in ("start", "end") else MIN_W)
        if genre == "decision":
            self.w = largeur(texte, 100) + 30
        self.h = {"action": ACTION_H, "start": TERM_H, "end": TERM_H, "decision": DIAMOND_H}[genre]

    @property
    def cx(self):
        return MARGIN + self.w_col() + self.col * COL

    @staticmethod
    def w_col():
        return MAX_W // 2 + 60

    @property
    def cy(self):
        return MARGIN + 20 + self.rang * ROW + ROW // 2

    def bord(self, cote):
        """Le point d'attache sur un bord : haut, bas, gauche, droite."""
        return {"haut": (self.cx, self.cy - self.h / 2), "bas": (self.cx, self.cy + self.h / 2),
                "gauche": (self.cx - self.w / 2, self.cy), "droite": (self.cx + self.w / 2, self.cy)}[cote]


def pas(d):
    for genre in ("start", "action", "decision", "end"):
        if genre in d:
            return genre, str(d[genre])
    raise ValueError(f"un pas sans genre : {d}")


def construire(desc):
    """Les nœuds et les arcs d'une description. Les arcs : (de, vers, libellé, sortie)."""
    noeuds, arcs, par_id = [], [], {}
    main = []
    for rang, d in enumerate(desc.get("steps", [])):
        genre, texte = pas(d)
        n = Noeud(genre, texte, 0, rang, d.get("id"), d.get("note"))
        n.desc = d
        noeuds.append(n); main.append(n)
        if n.id:
            par_id[n.id] = n
    cols = {}
    for nom, s in (desc.get("sides") or {}).items():
        col = s.get("col", 1)
        rang = s.get("from", 0)
        liste = []
        for d in s.get("steps", []):
            genre, texte = pas(d)
            n = Noeud(genre, texte, col, rang, d.get("id"), d.get("note"))
            n.desc = d
            noeuds.append(n); liste.append(n); rang += 1
            if n.id:
                par_id[n.id] = n
        if liste:
            par_id.setdefault(nom, liste[0])
        cols[nom] = (liste, s.get("to"))
    # les arcs de la colonne principale
    for i, n in enumerate(main):
        suivant = main[i + 1] if i + 1 < len(main) else None
        if n.genre == "decision":
            for branche, libelle in (("yes", "Oui"), ("no", "Non")):
                # YAML lit `yes` et `no` comme des booléens : les deux écritures valent
                b = n.desc.get(branche, n.desc.get(branche == "yes"))
                if b is None:
                    if suivant is not None:
                        arcs.append((n, suivant, libelle, "bas"))
                    continue
                if "side" in b:
                    liste, rang = [], n.rang + 1
                    for d in b["side"]:
                        genre, texte = pas(d)
                        m = Noeud(genre, texte, 1, rang, d.get("id"), d.get("note"))
                        m.desc = d
                        noeuds.append(m); liste.append(m); rang += 1
                        if m.id:
                            par_id[m.id] = m
                    arcs.append((n, liste[0], libelle, "droite"))
                    for a, c in zip(liste, liste[1:]):
                        arcs.append((a, c, "", "bas"))
                    cible = par_id[b["to"]] if b.get("to") else suivant
                    if cible is not None:
                        arcs.append((liste[-1], cible, "", "rejoint"))
                elif "to" in b:
                    arcs.append((n, par_id[b["to"]], libelle, "saut"))
        elif n.genre != "end" and suivant is not None:
            arcs.append((n, suivant, "", "bas"))
    for nom, (liste, to) in cols.items():
        for a, c in zip(liste, liste[1:]):
            arcs.append((a, c, "", "bas"))
        if liste and to:
            arcs.append((liste[-1], par_id[to], "", "rejoint"))
    return noeuds, arcs


def forme(n):
    x, y, w, h = n.cx - n.w / 2, n.cy - n.h / 2, n.w, n.h
    style = f'fill="{FILL}" stroke="{STROKE}" stroke-width="1"'
    if n.genre in ("start", "end"):
        return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h / 2}" {style}/>'
    if n.genre == "decision":
        pts = f"{n.cx},{y} {x + w},{n.cy} {n.cx},{y + h} {x},{n.cy}"
        return f'<polygon points="{pts}" {style}/>'
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" {style}/>'


def texte(x, y, t, ancre="middle", taille=FONT, couleur=TEXT):
    return (f'<text x="{x}" y="{y}" text-anchor="{ancre}" font-family="Segoe UI, Arial, sans-serif" '
            f'font-size="{taille}" fill="{couleur}" dominant-baseline="middle">{html.escape(t)}</text>')


def chemin(points, fleche=True):
    d = "M " + " L ".join(f"{x},{y}" for x, y in points)
    m = ' marker-end="url(#fleche)"' if fleche else ""
    return f'<path d="{d}" fill="none" stroke="{LINE}" stroke-width="1"{m}/>'


def tracer(noeuds, arcs, titre):
    out = []
    lanes_gauche, lanes_droite = 0, 0
    for de, vers, libelle, sortie in arcs:
        if sortie == "bas":
            p1, p2 = de.bord("bas"), vers.bord("haut")
            if abs(p1[0] - p2[0]) < 1:
                pts = [p1, p2]
            else:
                ymid = (p1[1] + p2[1]) / 2
                pts = [p1, (p1[0], ymid), (p2[0], ymid), p2]
            out.append(chemin(pts))
            if libelle:
                out.append(texte(p1[0] + 6, p1[1] + 11, libelle, "start", FONT - 1))
        elif sortie == "droite":
            p1, p2 = de.bord("droite"), vers.bord("haut")
            pts = [p1, (p2[0], p1[1]), p2]
            out.append(chemin(pts))
            if libelle:
                out.append(texte(p1[0] + 6, p1[1] - 7, libelle, "start", FONT - 1))
        elif sortie == "rejoint":
            # du bas d'un pas de côté vers le flanc d'une cible, à angle droit
            p1 = de.bord("bas")
            if vers.col < de.col:
                p2 = vers.bord("droite")
            elif vers.col > de.col:
                p2 = vers.bord("gauche")
            else:
                p2 = vers.bord("haut")
            if abs(p1[0] - p2[0]) < 1:
                pts = [p1, p2]
            else:
                pts = [p1, (p1[0], p2[1]), p2]
            out.append(chemin(pts))
        elif sortie == "saut":
            if vers.col <= de.col:
                # un retour dans la colonne ou vers la gauche : par la voie de gauche, vers le flanc gauche de la cible
                lanes_gauche += 1
                xl = MARGIN + 10 + 14 * (lanes_gauche - 1)
                p1, p2 = de.bord("gauche"), vers.bord("gauche")
                pts = [p1, (xl, p1[1]), (xl, p2[1]), p2]
            else:
                # vers la droite : jusqu'au flanc gauche de la cible, par une voie entre les colonnes
                lanes_droite += 1
                xr = de.cx + de.w / 2 + 24 + 14 * (lanes_droite - 1)
                p1, p2 = de.bord("droite"), vers.bord("gauche")
                if abs(p1[1] - p2[1]) < 1:
                    pts = [p1, p2]
                else:
                    pts = [p1, (xr, p1[1]), (xr, p2[1]), p2]
            out.append(chemin(pts))
            if libelle:
                dx = -6 if pts[1][0] < p1[0] else 6
                out.append(texte(p1[0] + dx, p1[1] - 7, libelle, "end" if dx < 0 else "start", FONT - 1))
    for n in noeuds:
        out.append(forme(n))
        out.append(texte(n.cx, n.cy, n.texte))
        if n.note:
            w = largeur(n.note, 60)
            x = n.cx + n.w / 2 + NOTE_GAP + (COL if any(m.col == n.col + 1 and m.rang == n.rang for m in noeuds) else 0)
            out.append(chemin([n.bord("droite"), (x, n.cy)], fleche=False))
            out.append(f'<rect x="{x}" y="{n.cy - 11}" width="{w}" height="22" fill="#ffffff" stroke="#999999" '
                       f'stroke-dasharray="3 3" stroke-width="1"/>')
            out.append(texte(x + w / 2, n.cy, n.note, taille=FONT - 1, couleur="#333333"))
    largeur_totale = max(n.cx + n.w / 2 + (largeur(n.note, 60) + NOTE_GAP + COL if n.note else 0) for n in noeuds) + MARGIN
    hauteur = max(n.cy + n.h / 2 for n in noeuds) + MARGIN + (24 if titre else 0)
    if titre:
        out.append(texte(largeur_totale / 2, hauteur - 14, titre, taille=FONT, couleur="#333333"))
    tete = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{int(largeur_totale)}" height="{int(hauteur)}" '
            f'viewBox="0 0 {int(largeur_totale)} {int(hauteur)}" font-family="Segoe UI, Arial, sans-serif">\n'
            f'<defs><marker id="fleche" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">'
            f'<path d="M0,0 L8,4 L0,8 z" fill="{LINE}"/></marker></defs>\n<rect width="100%" height="100%" fill="#ffffff"/>\n')
    return tete + "\n".join(out) + "\n</svg>\n"


def dessiner(chemin_yml):
    desc = lire(chemin_yml)
    noeuds, arcs = construire(desc)
    svg = tracer(noeuds, arcs, desc.get("title"))
    sortie = os.path.splitext(chemin_yml)[0] + ".svg"
    with open(sortie, "w", encoding="utf-8", newline="\n") as f:
        f.write(svg)
    return sortie


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    for arg in sys.argv[1:]:
        if os.path.isdir(arg):
            for racine, _, fichiers in os.walk(arg):
                for fn in fichiers:
                    if fn.endswith(".yml") and os.path.basename(racine) == "schemas":
                        print(dessiner(os.path.join(racine, fn)))
        else:
            print(dessiner(arg))


if __name__ == "__main__":
    main()
