# Les droits et la sécurité

> **La sécurité** de Syncytium est par construction : les droits vivent au
> modèle — la confidentialité au champ, l'audience à la ligne, les droits
> d'action à l'entité, le degré au groupe et à l'opération —, le moteur
> applique ce que la configuration déclare, et ce qu'il enregistre dit qui a
> lu, écrit ou refusé ([glossaire](../../glossaire.md)).

Qui entre, qui voit quelle donnée, qui fait quoi, ce qui s'enregistre : ce
chapitre dit les droits et la sécurité en fonctionnement (D1784). Les
groupes et les degrés d'abord, l'entrée, la confidentialité, l'audience, les
droits d'action, le réglementaire, ce que la sécurité enregistre, les
invariants, et ce que tout cela livre à la documentation. Le démarrage d'une
version, les secrets et le chiffrement sont au chapitre 9, le moteur ; les
journaux et la rétention à l'exploitation, le chapitre 10 ; la détection à la
télémétrie, le chapitre 11 (D1786). Les décisions citées entre parenthèses renvoient au
[registre](../../conception.md). Le texte vient des deux artefacts
préparatoires, déplacé à la réorganisation ; la réécriture suit.

## Le sommaire

1. Les droits et la sécurité
   - [La doctrine](#la-doctrine)
   - [La carte](#la-carte)
2. [Les groupes et les degrés](02-groupes.md)
   - [Les groupes et les modules (D341, D414–D416)](02-groupes.md#les-groupes-et-les-modules-d341-d414d416)
   - [Le degré intrinsèque d'autorisation (D697, D699–D700)](02-groupes.md#le-degré-intrinsèque-dautorisation-d697-d699d700)
   - [Les groupes, les modules, la délégation](02-groupes.md#les-groupes-les-modules-la-délégation)
3. [L'identité et l'entrée](03-entree.md)
   - [L'identité et les comptes](03-entree.md#lidentité-et-les-comptes)
   - [L'authentification (D692)](03-entree.md#lauthentification-d692)
   - [L'authentification](03-entree.md#lauthentification)
   - [La session (D693–D694)](03-entree.md#la-session-d693d694)
   - [La session et l'API](03-entree.md#la-session-et-lapi)
   - [Les connecteurs et la sécurité (D633, D642)](03-entree.md#les-connecteurs-et-la-sécurité-d633-d642)
4. [La confidentialité](04-confidentialite.md)
   - [La confidentialité (D25–D27, D364)](04-confidentialite.md#la-confidentialité-d25d27-d364)
   - [La confidentialité — qui voit quel champ](04-confidentialite.md#la-confidentialité--qui-voit-quel-champ)
5. [L'audience](05-audience.md)
   - [L'audience et l'anti-IDOR (D70–D77, D144, D153)](05-audience.md#laudience-et-lanti-idor-d70d77-d144-d153)
   - [L'audience — qui voit quelle ligne](05-audience.md#laudience--qui-voit-quelle-ligne)
6. [Les droits d'action](06-droits.md)
   - [Les droits d'action (D196, D421–D427)](06-droits.md#les-droits-daction-d196-d421d427)
   - [Les droits d'action — qui fait quoi](06-droits.md#les-droits-daction--qui-fait-quoi)
7. [Le réglementaire](07-rgpd.md)
   - [Le RGPD (D695–D698)](07-rgpd.md#le-rgpd-d695d698)
   - [Le RGPD](07-rgpd.md#le-rgpd)
8. [Ce que la sécurité enregistre](08-audit.md)
   - [La provenance et la trace (D62, D178, D238, D429)](08-audit.md#la-provenance-et-la-trace-d62-d178-d238-d429)
   - [L'audit des lectures (D702–D704)](08-audit.md#laudit-des-lectures-d702d704)
   - [La traçabilité](08-audit.md#la-traçabilité)
   - [L'audit et la détection](08-audit.md#laudit-et-la-détection)
9. [Les invariants, la liste de contrôle](09-invariants.md)
   - [La liste de contrôle](09-invariants.md#la-liste-de-contrôle)
10. [Ce que les droits et la sécurité livrent à la documentation](10-documentation.md)
   - [Les droits](10-documentation.md#les-droits)
   - [La sécurité](10-documentation.md#la-sécurité)
11. [Les décisions](#les-décisions)

## La doctrine

Six principes, posés au fil des décisions, gouvernent tout le reste :

1. **La sécurité par construction** (P8) : les droits vivent **au
   modèle** — la confidentialité au champ, l'audience à la ligne, les
   droits d'action à l'entité, le degré à l'opération. Rien ne
   s'ajoute après coup, rien ne se code à part ; le moteur applique ce
   que la description déclare.
2. **Fail-closed** (D34, D71, D102, D699, D1793) : le non-exposé est le
   défaut, la ligne sans propriétaire est invisible, le groupe absent
   ferme le champ, le compte sans groupe n'est qu'un `reader` (D1793). En cas de doute, la donnée se
   protège — elle ne s'expose pas.
3. **L'anti-oracle** (D126, D144, D153, D193) : l'interdit ne se
   devine pas — ni par la navigation (les entrées de menu filtrées),
   ni par les messages, ni par les comptages, ni par les
   identifiants (opaques, D75).
4. **Restreindre, jamais étendre** (D190, D416, D749) : un module
   restreint la surface ; une délégation joue les droits de
   l'emprunté au même degré ; un wizard n'élargit rien (Q54). Aucun
   chemin n'élève un droit — sauf l'administrateur, toujours tracé.
5. **Masquer, ne jamais détruire** (D137, D141, D184, D714, D722,
   D747) : la suppression est une désactivation, le bannissement
   conserve, le groupe retiré se désactive ; l'effacement physique
   est l'exception tracée (le retour arrière d'une reprise — D184) et
   le droit à l'effacement est **une anonymisation** (D139, D696) ;
   la réactivation d'un enregistrement désactivé est **l'acte
   exceptionnel de l'administrateur**, hors socle et hors hook
   (D903).
6. **La librairie inviolable** (D599) : « la librairie mise en place
   assure l'inviolabilité des règles et des droits » — le hook, le
   connecteur, le composant sont des citoyens du moteur, jamais des
   super-utilisateurs ; un built-in passe par la même frontière qu'un
   externe (D52).

## La carte

Les onze lignes de la carte sont les sections du chapitre de la sécurité de la
documentation réglementaire (D1819, D1823).

| le domaine | l'acquis | les décisions | le détail |
|---|---|---|---|
| **L'identité** | quatre types de comptes étanches, l'UUID interne, la clé d'unicité par connecteur | D28, D77, D82, D142 | [03-entree.md](03-entree.md) |
| **L'entrée** | la famille `authentication`, cinq classes, le secours et le mode safe | D29–D33, D78, D80–D81, D692, D713, D716, D718, D759 | [03-entree.md](03-entree.md) |
| **La session et l'API** | l'inactivité et la borne absolue ; l'API au porteur, la clé rotative, le rate limiting | D15, D98, D105, D107, D693–D694, D917–D918 | [03-entree.md](03-entree.md) |
| **La confidentialité** | trois niveaux emboîtés × les groupes, l'héritage fail-closed, les profils nommés | D25–D27, D102, D144, D170, D364, D885, D923 | [04-confidentialite.md](04-confidentialite.md) |
| **L'audience** | l'accès au niveau ligne par appartenance, l'anti-IDOR, l'écriture unique | D70–D76, D153 | [05-audience.md](05-audience.md) |
| **Les droits d'action** | `allow` à deux foyers et quatre étages, les opérations couvertes, le passe-droit tracé | D196, D421–D427, D691, D700, D835, D886 | [06-droits.md](06-droits.md) |
| **Les degrés** | user / manager / administrator au contrat, portés par le groupe, l'appartenance obligatoire | D697, D699–D701, D746, D881, D900, D903 | [02-groupes.md](02-groupes.md) |
| **Les groupes et les modules** | la configuration déclare, la base affecte ; la double entrée administrateur ; la délégation | D34, D96, D190, D341, D414–D416, D712, D715, D717, D747, D749 | [02-groupes.md](02-groupes.md) |
| **La traçabilité et l'audit** | l'historisation = la trace, la provenance persistante, le motif d'audit, les deux comptes ; l'audit des lectures par enregistrement, les actes privilégiés, les refus journalisés | D62, D169, D178, D182, D238, D411–D413, D429, D702–D704, D925–D926, D1814–D1817 | [08-audit.md](08-audit.md) |
| **Le RGPD** | le client responsable, le marquage `rgpd:`, l'anonymisation, la rétention, le registre | D16, D137, D139, D695–D698, D703 | [07-rgpd.md](07-rgpd.md) |
| **Le chat** | la connaissance sous les droits du demandeur (aucun droit propre au chat), l'anonymisation avant tout envoi sauf le profil connecté, la session par module tracée jusqu'à sa réinitialisation | D957–D960 | [06-droits.md](06-droits.md) |

## Les décisions

Ce chapitre repose sur les décisions de la famille « les droits et la
sécurité », relues le 07/11/2026 (D1783–D1823). Il réunit deux artefacts
préparatoires, `rights.md` (D690) et `security.md` (D602). Elles sont
110 décisions au registre :
D25–D27, D30–D31, D34, D70–D77, D81–D82, D96, D102, D139, D144, D153, D163, D170, D341, D414, D421–D423, D429, D599, D642, D690–D691, D693–D696, D699–D700, D702–D704, D712–D713, D717–D718, D720, D746–D747, D759, D835, D885–D886, D900, D917, D923, D925, D942, D1099, D1140, D1149, D1172, D1178, D1264, D1317, D1319–D1320, D1322–D1329, D1332, D1344, D1536, D1680, D1788–D1801, D1803, D1805–D1819, D1821. Chacune se lit dans [le registre](../../conception.md).
