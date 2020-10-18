# Syncytium
Technical framework to ease the PWA development

# Getting Started
This framework can be built and run within Visual Studio 2017.

It can be connected to 4 databases :
* Oracle,
* SQL Server,
* Firebird 2.5 or 3.0,
* MySQL.

## Requirement

Before running this sample, you have to define a database connection and a SMTP server configuration.

To get acces to the application (except the default administrator), it needs a SMTP Sever configuration.

## Database configuration

The application needs a schema to know how to set tables into the database. The schema name is defined int the file **App.config** in Syncytium.Test, **Web.config** in Syncytium.Web and Syncytium.WebJob, in the section appSettings :

```
  <appSettings>
    <add key="LAPC.Database.Schema" value="Syncytium" />
  </appSettings>
```

### Oracle

First, you have to install Oracle Developer Tools for VS2015.
Then, update the file **C:\Program Files (x86)\Oracle Developer Tools for VS2015\network\admin\tnsnames.ora**

```
XE =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = <computer name>)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = XE)
    )
  )
```

Now, you can create a schema by using SQL*Plus Command line (a schema is a user) :

```
SQL*Plus: Release 11.2.0.2.0 Production on Lun. Mars 20 15:23:32 2017

Copyright (c) 1982, 2014, Oracle.  All rights reserved.

SQL> connect sys/<Password of the sys account> as sysdba;
Connected.
SQL> create user Syncytium identified by Syncytium;

User created.

SQL> grant all privileges to Syncytium;

Grant succeeded.

SQL>
```

You have to update the file **App.config** in Syncytium.Test and Syncytium.WebJob, **Web.config** in Syncytium.Web :

```
  <connectionStrings>
    <add name="Syncytium" connectionString="DATA SOURCE=//<computer name>:1521/XE;PERSIST SECURITY INFO=True;USER ID=Syncytium;PASSWORD=Syncytium" providerName="Oracle.ManagedDataAccess.Client" />
  </connectionStrings>
```

### SQL Server

First, you have to install SQL Server 2016 Express or not. If you need to run the application into a dedicated instance, you have to install once more (here: Syncytium).
Then, in the target instance, you can create a schema like this (by using Data source into Visual Studio) :

```
create schema Syncytium
```

You have to update the file **App.config** in Syncytium.Test and Syncytium.WebJob, **Web.config** in Syncytium.Web :

```
  <connectionStrings>
    <add name="Syncytium" connectionString="Data Source=localhost\Syncytium;Initial Catalog=Syncytium;Integrated Security=True" providerName="System.Data.SqlClient" />
  </connectionStrings>
```

### Firebird

In Firebird, a schema is a file. So, you have to create a file to store your database. In Firebird 3.0, into the file **C:\Program Files (x86)\Firebird\Firebird_3_0\firebird.conf**, set WireCrypt to **Enabled**.

Then, you can create a database.

You have to update the file **App.config** in Syncytium.Test and Syncytium.WebJob, **Web.config** in Syncytium.Web :

```
  <connectionStrings>
    <add name="Syncytium" connectionString="Database=<pathtolocatedb>\Syncytium.FDB;User=SYSDBA;Password=masterkey;DataSource=localhost;Port=3052;Charset=UNICODE_FSS;Role=;Connection lifetime=15;Pooling=true;MinPoolSize=0;MaxPoolSize=50;Packet Size=4096;ServerType=0" providerName="FirebirdSql.Data.FirebirdClient" />
  </connectionStrings>
```

### MySQL

A schema is a database. So, you have to create a database like this :

```
create database Syncytium;
```

You have to update the file **App.config** in Syncytium.Test and Syncytium.WebJob, **Web.config** in Syncytium.Web :

```
  <connectionStrings>
    <add name="Syncytium" connectionString="server=localhost;port=3306;database=syncytium;uid=root;password=syncytium" providerName="MySql.Data.MySqlClient" />
  </connectionStrings>
```

## SMTP configuration

The simplest way is to have a smtp account with google. Or, if you already have your server email account, you can use it.

You have to update the file **App.config** in Syncytium.Test and Syncytium.WebJob, **Web.config** in Syncytium.Web :

```
  <system.net>
    <mailSettings>
      <!-- TODO : mettre de fausses informations avant de commit-->
      <smtp from="no-reply@syncytium.fr" deliveryMethod="Network">
        <network host="smtp.gmail.com" port="587" userName="smtp.syncytium@gmail.com" password="xxxxxx" enableSsl="true" defaultCredentials="false" />
      </smtp>
    </mailSettings>
  </system.net>
```

Now, you have to define the default email in the file **App.config** in Syncytium.WebJob and **Web.config** in Syncytium.Web :

```
  <appSettings>
    <add key="Syncytium.Administrator.Email" value="myemail@xxxx.fr" />
  </appSettings>
```

## First start and first authentication

To begin, the first login screen (in administrator mode) is shown. The administrator mode is used by the application when the database schema will be updated and only in this case. The login and the password of this mode is defined into the file **Web.Config** in Syncytium.Web project. This account is disabled as soon as the database schema is updated and available.

```
  <appSettings>
    <add key="Syncytium.Administrator.Login" value="admin-dev" />
    <add key="Syncytium.Administrator.Password" value="9RQjTOYJNkzmyasphEUt" />
  </appSettings>
```

The SQL script which initializes the application is stored into Syncytium.Web project / Database / Provider / <database engine> / Script.

Now, you can run the application for the first time and you can connect to the application.

## Log files

If the initialization of the database failed, you can check what's happened into the log file (see Logs into the Syncytium.Web project).
The setting of the log file is done by this part into the file **Web.config** in Syncytium.Web project :

```
  <log4net debug="true">
    <appender name="RollingLogFileAppender" type="log4net.Appender.RollingFileAppender">
      <file type="log4net.Util.PatternString" value="Logs\\Syncytium-" />
      <encoding value="iso8859-1" />
      <appendToFile value="true" />
      <lockingModel type="log4net.Appender.FileAppender+MinimalLock" />
      <rollingStyle value="Composite" />
      <!-- if the value is different than 'Syncytium-'yyyy-MM-dd'.log', the clean up process can't work -->
      <datePattern value="yyyy-MM-dd'.log'" />
      <preserveLogFileNameExtension value="true" />
      <staticLogFileName value="false" />
      <maxSizeRollBackups value="2" />
      <maximumFileSize value="100MB" />
      <layout type="log4net.Layout.PatternLayout">
        <conversionPattern value="%date{yyyy-MM-dd HH:mm:ss.fff} [%-5level] %m%n" />
      </layout>
    </appender>
    <root>
      <level value="DEBUG" />
      <appender-ref ref="RollingLogFileAppender" />
    </root>
  </log4net>
```

In case of failure, stop the application, fix the script, start the application connect again.

## Setting password for administrators

If the database is updated, you have to set a password for 2 users :
* admin-dev (see Syncytium.Administrator.Login parameter)
* SyncytiumAdmin

Setting a first password is the same way as forget password.
Forgetting a password will send you an email within a link to click to update the password. The login is mandatory. If the login doesn't exist, you can't receive an email to initialize or to reset your password.

The user "admin-dev" is defined to create, read, update or delete a customer. The database can be shared between differents customers (within the same database schema). Each customer is clearly separated. No data can be sent from a customer to another.

The user "SyncytiumAdmin" is defined to get access to the administration screen of the application. He can create, read, update or delete a user and/or a module.

## First user

As soon as you create a user, an email is sent on validating the update into the administration screen.
