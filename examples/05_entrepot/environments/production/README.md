# L'environnement de production

L'entrepôt alimenté chaque nuit depuis la base PMI de production.

## Où tourne l'instance

Sur une machine virtuelle de la salle serveur de l'entreprise, sur le réseau interne. Les utilisateurs
y accèdent depuis les postes du réseau interne, ou par le VPN de l'entreprise quand ils sont en
déplacement : aucun flux n'entre depuis Internet.

## Ce que traversent les flux

- **La base PMI** (`cegid`) est sur le serveur de l'ERP, dans le même réseau : le flux SQL Server reste
  interne, en lecture, chaque nuit et le dimanche pour la relecture complète.
- **Azure AD**, **l'API adresse** et **le serveur SMTP** du fournisseur de messagerie sortent vers Internet
  par le pare-feu : des règles sortantes seules, HTTPS sur le 443 et SMTP sur le 587.
- **Les plans des articles** sont sur le partage de fichiers du bureau d'études, monté sur le serveur.

## Le nom, le certificat

L'instance répond au nom `entrepot.entreprise.example`, déclaré dans le DNS interne. Le certificat est
délivré par l'autorité de certification interne de l'entreprise et renouvelé chaque année.

## Qui tient quoi

- Le pare-feu, le DNS interne et le certificat : le prestataire informatique de l'entreprise.
- L'application Azure AD, son identifiant et son secret : le prestataire, dans le tenant de l'entreprise.
- Le compte d'envoi SMTP : le fournisseur de messagerie, au nom de l'entreprise.
- Le compte de lecture sur la base PMI : l'intégrateur de l'ERP, à la demande de la direction.
