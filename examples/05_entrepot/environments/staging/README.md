# L'environnement de staging

L'entrepôt d'essai, alimenté depuis une copie de la base PMI.

## Où tourne l'instance

Sur une seconde machine virtuelle de la salle serveur, à côté de la production, sur le réseau interne
seulement : ni VPN ni Internet entrant. Les essais se font depuis les postes de l'entreprise.

## Ce que traversent les flux

- **La copie de la base PMI** est restaurée chaque semaine sur le serveur SQL Server de test ; le flux
  reste interne.
- **Azure AD**, **l'API adresse** et **le SMTP** sortent par les mêmes règles que la production ; les mails
  du staging partent vers une boîte de test.

## Le nom, le certificat

L'instance répond au nom `entrepot-staging.entreprise.example`, dans le DNS interne. Le certificat est
l'auto-signé fourni par Syncytium : les postes qui essaient l'acceptent une fois.

## Qui tient quoi

Les mêmes que la production ; la copie hebdomadaire de la base PMI est faite par l'intégrateur de l'ERP.
