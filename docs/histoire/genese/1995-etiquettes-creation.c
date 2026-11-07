// Ce programme doit permettre de créer la base de données

#include <stdio.h>
#include "..\gestion\sgbd.h"

static char *Table[]={ "ETIQUETTE","COMMUNE","DEPARTEMENT","NATURE","" };

static char *Champ[]={ "CLE"   , "ETIQUETTE"   , "ETIQUETTE_NUMERO"       , "N 5 0" ,
                          "COMMUNE"     , "COMMUNE_NUMERO"         , "C 5 0" ,
                          "COMMUNE"     , "COMMUNE_NOM"            , "C 26 0",
                          "DEPARTEMENT" , "DEPARTEMENT_NUMERO"     , "C 2 0" ,
                          "NATURE"      , "NATURE_APPELLATION"     , "C 44 0",
                          "NATURE"      , "NATURE_CRU"             , "N 3 0",
                "CHAMP" , "ETIQUETTE"   , "ETIQUETTE_VIN"          , "C 20 0",
                          "ETIQUETTE"   , "ETIQUETTE_ROBE"         , "C 7 0" ,
                          "ETIQUETTE"   , "ETIQUETTE_CEPAGE"       , "C 20 0",
                          "ETIQUETTE"   , "ETIQUETTE_REGION"       , "C 15 0",
                          "ETIQUETTE"   , "ETIQUETTE_APPELLATION"  , "C 40 0",
                          "ETIQUETTE"   , "ETIQUETTE_SITE"         , "C 30 0",
                          "ETIQUETTE"   , "ETIQUETTE_PROPRIETAIRE" , "C 40 0",
                          "ETIQUETTE"   , "ETIQUETTE_PROFESSION"   , "C 30 0",
                          "ETIQUETTE"   , "ETIQUETTE_COMMUNE_CP"   , "C 5 0",
                          "ETIQUETTE"   , "ETIQUETTE_COMMUNE_NOM"  , "C 26 0",
                          "ETIQUETTE"   , "ETIQUETTE_DEPARTEMENT"  , "C 2 0",
                          "ETIQUETTE"   , "ETIQUETTE_DEGRE"        , "R 4 2",
                          "ETIQUETTE"   , "ETIQUETTE_ANNEE"        , "N 4 0",
                          "ETIQUETTE"   , "ETIQUETTE_TYPE"         , "C 20 0",
                          "ETIQUETTE"   , "ETIQUETTE_CLASSEUR"     , "C 15 0",
                          "ETIQUETTE"   , "ETIQUETTE_CRU"          , "C 4 0",
                          "ETIQUETTE"   , "ETIQUETTE_PAGE"         , "C 6 0",
                          "ETIQUETTE"   , "ETIQUETTE_ETAT"         , "C 10 0",
                          "DEPARTEMENT" , "DEPARTEMENT_NOM"        , "C 26 0",
                          "NATURE"      , "NATURE_VIN"             , "C 20 0",
                          "NATURE"      , "NATURE_CLASSEUR"        , "C 15 0",
                          "NATURE"      , "NATURE_N_VIN"           , "N 2 0",
                          "NATURE"      , "NATURE_CLASSER"         , "C 1 0",
                          "NATURE"      , "NATURE_NOMBRE"          , "N 5 0",
                "" };

int main()
{
  int err,i,Mode;

  // Création de la base de données
  printf("Création de l'application\n");
  err=Creer_Application("\\etiquet","etiquet","Collection d'étiquettes de vin");
  switch(err)
    {
      case 3 : printf("Base de données déjhà existante ...\n");
               return(0);
      case 8 : printf("Création du répertoire impossible ...\n");
               return(0);
    }

  // Création des tables
  printf("Création des tables\n");
  for (i=0;Table[i][0]!='\0';i++)
    Creer_Table("",Table[i]);

  // Création des clés et champs des différentes tables
  printf("Création de toutes les clés et de tous les champs\n");
  Mode=0;
  for (i=0;strlen(Champ[i][0])>0;i=i+3)
    {
      int p[2];
      char Type;

      if (strcmp(Champ[i],"CLE")==0) { Mode=0; i++; }
      if (strcmp(Champ[i],"CHAMP")==0) { Mode=1; i++; }
      printf("%d : %s , %s",i,Champ[i],Champ[i+1]);
      switch(Mode)
        {
          case 0 : Creer_Cle("",Champ[i],Champ[i+1],SGBD_Cle_Croissante); break;
          case 1 : Creer_Champ("",Champ[i],Champ[i+1]); break;
        }
      Type=Champ[i+2][0];
      if (Type!=SGBD_Reel)
        {
          sscanf(Champ[i+2]+2,"%d%d",&p[0],&p[1]);
          printf(" %c , %d , %d",Type,p[0],p[1]);
          Modifier_Champ("",Champ[i+1],2,p);
          err=Modifier_Champ("",Champ[i+1],3,&Type);
          printf(" (%d)",err);
        }
        else
        {
          sscanf(Champ[i+2]+2,"%d",&p[0]); p[1]=0;
          printf(" %c , %d , %d",Type,p[0],p[1]);
          Modifier_Champ("",Champ[i+1],2,p);
          err=Modifier_Champ("",Champ[i+1],3,&Type);
          sscanf(Champ[i+2]+2,"%d%d",&p[0],&p[1]);
          printf(" %c , %d , %d",Type,p[0],p[1]);
          Modifier_Champ("",Champ[i+1],2,p);
          printf(" (%d)",err);
        }
      printf("\n");
    }

  // Réalisation des références
  {
    struct
      {
        char Nature;
        char Nom[30];
      } Parametre;
    Parametre.Nature='R';
    (void) strcpy(Parametre.Nom,"COMMUNE_NUMERO");
    Modifier_Champ("","ETIQUETTE_COMMUNE_CP",5,&Parametre);
    (void) strcpy(Parametre.Nom,"COMMUNE_NOM");
    Modifier_Champ("","ETIQUETTE_COMMUNE_NOM",5,&Parametre);
    (void) strcpy(Parametre.Nom,"DEPARTEMENT_NUMERO");
    Modifier_Champ("","ETIQUETTE_DEPARTEMENT",5,&Parametre);
  }

  // Fermeture de la base de données
  printf("Fin de la création de l'application\n");
  Fermer_Application();
  return(0);
}
