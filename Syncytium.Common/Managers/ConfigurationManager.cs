using Syncytium.Common.Database.DSSchema;
using System;
using System.Collections.Generic;
using System.IO;
using static Syncytium.Common.Database.Provider.Provider;

/*
    Copyright (C) 2020 LESERT Aymeric - aymeric.lesert@concilium-lesert.fr

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

namespace Syncytium.Common.Managers
{
    /// <summary>
    /// Handle the configuration element (retrieve settings and eventually its default values)
    /// </summary>
    public static class ConfigurationManager
    {
        #region Constants

        /// <summary>
        /// Application name
        /// </summary>
        public const string APPLICATION = "Syncytium.Application.Name";

        /// <summary>
        /// Version of the application
        /// </summary>
        public const string APPLICATION_VERSION = "Syncytium.Application.Version";

        /// <summary>
        /// Company of the application
        /// </summary>
        public const string APPLICATION_COMPANY = "Syncytium.Application.Company";

        /// <summary>
        /// Copyright of the application
        /// </summary>
        public const string APPLICATION_COPYRIGHT = "Syncytium.Application.Copyright";

        /// <summary>
        /// connectionString attached to the application
        /// </summary>
        public const string CONNEXION_STRING = "Syncytium";

        /// <summary>
        /// connectionString attached to the azure environment
        /// </summary>
        public const string CONNEXION_STRING_AZURE = "AzureWebJobsStorage";

        /// <summary>
        /// AppSettings describing the mode of the application DEV, UAT or PROD
        /// </summary>
        public const string SETTING_MODE = "Syncytium.Mode";

        /// <summary>
        /// AppSettings describing the debug mode (true or false)
        /// </summary>
        public const string SETTING_DEBUG = "Syncytium.Debug";

        /// <summary>
        /// AppSettings describing the type of database used by the application
        /// </summary>
        public const string SETTING_DATABASE_TYPE = "Syncytium.Database.Type";

        /// <summary>
        /// AppSettings describing the database schema to use in the application
        /// </summary>
        public static string SETTING_DATABASE_SCHEMA = "Syncytium.Database.Schema";

        /// <summary>
        /// AppSettings describing the expected version of database schema
        /// </summary>
        public static string SETTING_DATABASE_EXPECTED_VERSION = "Syncytium.Database.ExpectedVersion";

        /// <summary>
        /// Enable / Disable the database cache manager (true or false)
        /// </summary>
        public static string SETTING_DATABASE_CACHE = "Syncytium.Database.Cache";

        /// <summary>
        /// AppSettings describing the default language of the application (on starting or on creating a user's profile)
        /// </summary>
        public const string SETTING_DEFAULT_LANGUAGE = "Syncytium.Language";

        /// <summary>
        /// AppSettings describing the max number of days to keep in the log folder
        /// </summary>
        public const string SETTING_LOGGER_MAX_DAYS = "Syncytium.Logger.MaxDays";

        /// <summary>
        /// AppSettings describing the max number of days to keep a file into the ~/App_Data
        /// </summary>
        public const string SETTING_APPDATA_MAX_DAYS = "Syncytium.AppData.MaxDays";

        /// <summary>
        /// AppSettings describing the default login of the administrator (first time or to upgrade database)
        /// </summary>
        public static string SETTING_ADMINISTRATOR_LOGIN = "Syncytium.Administrator.Login";

        /// <summary>
        /// AppSettings describing the default password of the administrator (first time or to upgrade database)
        /// </summary>
        public static string SETTING_ADMINISTRATOR_PASSWORD = "Syncytium.Administrator.Password";

        /// <summary>
        /// AppSettings describing the number of seconds of waiting before considering that the user is already connected
        /// </summary>
        public static string SETTING_CONNECTION_MAX_WAITING = "Syncytium.Connection.MaxWaiting";

        /// <summary>
        /// AppSettings notifying if all previous connections from the current machine must be cleaned up on starting
        /// </summary>
        public static string SETTING_CONNECTION_CLEANUP = "Syncytium.Connection.Cleanup";

        /// <summary>
        /// AppSettings describing the lot size for a list of notifications from the server to the client
        /// </summary>
        public static string SETTING_CONNECTION_LOTSIZE = "Syncytium.Connection.LotSize";

        /// <summary>
        /// AppSettings describing the number of days of validity between the sending of the mail and the changement allowed
        /// </summary>
        public static string SETTING_PASSWORD_EXPIRICYDAY = "Syncytium.Password.ExpiricyDay";

        /// <summary>
        /// AppSettings notifying if the log features must be enabled into the client side
        /// </summary>
        public static string SETTING_CLIENT_LOG_ENABLE = "Syncytium.Client.Log.Enable";

        /// <summary>
        /// AppSettings describing the maximum size of the buffer cache in the client side (in Ko)
        /// </summary>
        public static string SETTING_CLIENT_HUB_MAXSIZE = "Syncytium.Client.Hub.MaxSize";

        /// <summary>
        /// AppSettings describing the timeout allowed of the websocket in seconds
        /// </summary>
        public static string SETTING_CLIENT_HUB_TIMEOUT = "Syncytium.Client.Hub.Timeout";

        /// <summary>
        /// AppSettings describing the font used into the PDF file (see the documentation to get the list)
        /// </summary>
        public static string SETTING_CLIENT_PDF_FONT = "Syncytium.Client.PDF.Font";

        /// <summary>
        /// HTTP address root of the application
        /// </summary>
        public static string SETTING_HTTP_ROOT = "Syncytium.HTTP.Root";

        /// <summary>
        /// File directory root of the application
        /// </summary>
        public static string SETTING_FILE_ROOT = "Syncytium.File.Root";

        /// <summary>
        /// Delay in seconds between 2 heartbeats
        /// </summary>
        public static string SETTING_HEARTBEAT_DELAY = "Syncytium.Heartbeat.Delay";

        #endregion

        /// <summary>
        /// Store the current assembly of the application
        /// </summary>
        private static System.Reflection.Assembly _assembly = System.Reflection.Assembly.GetCallingAssembly();

        /// <summary>
        /// Retrieve or change the current assembly
        /// </summary>
        public static System.Reflection.Assembly Assembly
        {
            get
            {
                return _assembly;
            }

            set
            {
                _assembly = value;
            }
        }

        /// <summary>
        /// Retrieve the name of the application
        /// </summary>
        public static string ApplicationName => System.Diagnostics.FileVersionInfo.GetVersionInfo(Assembly.Location).ProductName;

        /// <summary>
        /// Retrieve the version of the application
        /// </summary>
        public static Version ApplicationVersion => Assembly.GetName().Version;

        /// <summary>
        /// Retrieve the company of the application
        /// </summary>
        public static string ApplicationCompany => System.Diagnostics.FileVersionInfo.GetVersionInfo(Assembly.Location).CompanyName;

        /// <summary>
        /// Retrieve the copyright of the application
        /// </summary>
        public static string ApplicationCopyright => System.Diagnostics.FileVersionInfo.GetVersionInfo(Assembly.Location).LegalCopyright;

        /// <summary>
        /// Reference the list of settings into the configuration file (app.config, web.config, ...)
        /// </summary>
        public static System.Collections.Specialized.NameValueCollection AppSettings = null;

        /// <summary>
        /// Reference the list of connection strings described into the configuration file (app.config, web.config, ...)
        /// </summary>
        public static System.Configuration.ConnectionStringSettingsCollection ConnectionStrings = null;

        /// <summary>
        /// Store the current schema of the database to avoid to build it at each connection
        /// </summary>
        public static Dictionary<String, DSDatabase> Schemas = new Dictionary<string, DSDatabase>();

        /// <summary>
        /// Retrieve the mode of the application
        /// If the value is not defined or contains different than "DEV", "UAT" or "PROD", set DEV
        /// </summary>
        public static string Mode
        {
            get
            {
                string mode = AppSettings[SETTING_MODE];
                if (String.IsNullOrWhiteSpace(mode))
                    return "DEV";
                return mode.ToUpper();
            }
        }

        /// <summary>
        /// Retrieve the log mode enable or not defined into web.config
        /// If the value is not defined or contains different than "TRUE", "ON" or "1", set False
        /// </summary>
        public static bool IsLogEnabled
        {
            get
            {
                string logMode = AppSettings[SETTING_CLIENT_LOG_ENABLE];
                return (logMode != null) && (logMode.ToUpper().Equals("TRUE") || logMode.ToUpper().Equals("ON") || logMode.Equals("1"));
            }
        }

        /// <summary>
        /// Retrieve the debug mode defined into web.config
        /// If the value is not defined or contains different than "TRUE", "VERBOSE", "ON" or "1", set False
        /// </summary>
        public static bool Debug
        {
            get
            {
                string debugMode = AppSettings[SETTING_DEBUG];
                return (debugMode != null) && (debugMode.ToUpper().Equals("TRUE") || debugMode.ToUpper().Equals("VERBOSE") || debugMode.ToUpper().Equals("ALL") || debugMode.ToUpper().Equals("ON") || debugMode.Equals("1"));
            }
        }

        /// <summary>
        /// Retrieve the verbose mode defined into web.config
        /// If the value is not defined or contains different than "VERBOSE", set False
        /// </summary>
        public static bool Verbose
        {
            get
            {
                string debugMode = AppSettings[SETTING_DEBUG];
                return debugMode != null && (debugMode.ToUpper().Equals("VERBOSE") || debugMode.ToUpper().Equals("ALL"));
            }
        }

        /// <summary>
        /// Retrieve the verbose mode defined into web.config
        /// If the value is not defined or contains different than "VERBOSE", set False
        /// </summary>
        public static bool VerboseAll
        {
            get
            {
                string debugMode = AppSettings[SETTING_DEBUG];
                return debugMode != null && debugMode.ToUpper().Equals("ALL");
            }
        }

        /// <summary>
        /// Retrieve the database type on depends on the configuration (based on the connexionString and the prodiver)
        /// </summary>
        public static EProvider DatabaseProvider
        {
            get
            {
                // retrieve the database type (by default defined in appsettings)

                string databaseType = AppSettings[SETTING_DATABASE_TYPE];
                EProvider databaseTypeDefault = EProvider.Unknown;

                if (databaseType != null)
                {
                    if (databaseType.ToUpper().Equals(EProvider.Oracle.ToString().ToUpper()))
                        databaseTypeDefault = EProvider.Oracle;

                    if (databaseType.ToUpper().Equals(EProvider.SQLServer.ToString().ToUpper()))
                        databaseTypeDefault = EProvider.SQLServer;

                    if (databaseType.ToUpper().Equals(EProvider.Firebird.ToString().ToUpper()))
                        databaseTypeDefault = EProvider.Firebird;

                    if (databaseType.ToUpper().Equals(EProvider.MySQL.ToString().ToUpper()))
                        databaseTypeDefault = EProvider.MySQL;
                }

                // replace the database type by the true one (defined by the provider)

                if (ConnectionStrings[CONNEXION_STRING] == null)
                    return EProvider.None;

                string provider = ConnectionStrings[CONNEXION_STRING].ProviderName;
                if (provider == null)
                    return databaseTypeDefault;

                if (ConnectionStrings[CONNEXION_STRING].ProviderName.Equals("Oracle.ManagedDataAccess.Client"))
                    return EProvider.Oracle;

                if (ConnectionStrings[CONNEXION_STRING].ProviderName.Equals("FirebirdSql.Data.FirebirdClient"))
                    return EProvider.Firebird;

                if (ConnectionStrings[CONNEXION_STRING].ProviderName.Equals("System.Data.SqlClient"))
                    return EProvider.SQLServer;

                if (ConnectionStrings[CONNEXION_STRING].ProviderName.Equals("MySql.Data.MySqlClient"))
                    return EProvider.MySQL;

                return databaseTypeDefault;
            }
        }

        /// <summary>
        /// Retrieve the schema defined into web.config
        /// If the value is not defined, set "Syncytium"
        /// </summary>
        public static string DatabaseSchema => AppSettings[SETTING_DATABASE_SCHEMA] ?? "Syncytium";

        /// <summary>
        /// Retrieve the expected version of the database schema
        /// If the value is not defined or not an integer, set -1 (means - check database version within SQL Script files)
        /// </summary>
        public static int DatabaseExpectedVersion
        {
            get
            {
                string strVersion = AppSettings[SETTING_DATABASE_EXPECTED_VERSION];

                if (strVersion == null)
                    return -1;

                if (!int.TryParse(strVersion, out int expectedVersion))
                    expectedVersion = -1;

                return expectedVersion;
            }
        }

        /// <summary>
        /// Indicates if the cache manager of the database must be enabled or disabled
        /// default value: false
        /// </summary>
        public static bool DatabaseCache
        {
            get
            {
                string strCache = AppSettings[SETTING_DATABASE_CACHE];
                return (strCache != null) && (strCache.ToUpper().Equals("TRUE") || strCache.ToUpper().Equals("ON") || strCache.Equals("1"));
            }
        }

        /// <summary>
        /// Retrieve the default language defined into web.config
        /// If the value is not defined, set "FR" (must be a valid language)
        /// </summary>
        public static string DefaultLanguage => AppSettings[SETTING_DEFAULT_LANGUAGE] ?? "FR";

        /// <summary>
        /// Retrieve the max number of days to keep in the log folder
        /// If the value is not defined or not an integer, set -1 (means keep all log files)
        /// </summary>
        public static int LoggerMaxDays
        {
            get
            {
                string strMaxDays = AppSettings[SETTING_LOGGER_MAX_DAYS];

                if (strMaxDays == null)
                    return -1;

                if (!int.TryParse(strMaxDays, out int maxDays))
                    maxDays = -1;

                return maxDays;
            }
        }

        /// <summary>
        /// Retrieve the max number of days to keep in the folder ~/App_Data
        /// If the value is not defined or not an integer, set -1 (means keep all files)
        /// </summary>
        public static int AppDataMaxDays
        {
            get
            {
                string strMaxDays = AppSettings[SETTING_APPDATA_MAX_DAYS];

                if (strMaxDays == null)
                    return -1;

                if (!int.TryParse(strMaxDays, out int maxDays))
                    maxDays = -1;

                return maxDays;
            }
        }

        /// <summary>
        /// Retrieve the administrator login by default
        /// If the value is not defined, set "admin"
        /// </summary>
        public static string AdministratorLogin => AppSettings[SETTING_ADMINISTRATOR_LOGIN] ?? "admin";

        /// <summary>
        /// Retrieve the administrator login by default
        /// If the value is not defined, set "Syncytium"
        /// </summary>
        public static string AdministratorPassword => AppSettings[SETTING_ADMINISTRATOR_PASSWORD] ?? "admin";

        /// <summary>
        /// Retrieve the number of seconds of waiting before considering that a user is already connected
        /// If the value is not defined, set "30"
        /// </summary>
        public static int ConnectionMaxWaiting
        {
            get
            {
                string maxWaiting = AppSettings[SETTING_CONNECTION_MAX_WAITING];
                if (maxWaiting == null)
                    return 30;

                if (!int.TryParse(maxWaiting, out int maxSeconds))
                    return 30;

                if (maxSeconds <= 0)
                    return 30;

                return maxSeconds;
            }
        }

        /// <summary>
        /// Notify if all previous connections from the current machine must be cleaned up on starting
        /// If the value is not defined or contains different than "TRUE", "ON" or "1", set False
        /// </summary>
        public static bool ConnectionCleanup
        {
            get
            {
                string connectionCleanup = AppSettings[SETTING_CONNECTION_CLEANUP];
                return (connectionCleanup != null) && (connectionCleanup.ToUpper().Equals("TRUE") || connectionCleanup.ToUpper().Equals("ON") || connectionCleanup.Equals("1"));
            }
        }

        /// <summary>
        /// LotSize for the list of notifications from the server to the client
        /// By default: 100
        /// </summary>
        public static int ConnectionLotSize
        {
            get
            {
                string strLotSize = AppSettings[SETTING_CONNECTION_LOTSIZE];
                if (strLotSize == null)
                    return 16384;

                if (!int.TryParse(strLotSize, out int lotSize))
                    return 16384;

                if (lotSize <= 0)
                    return 16384;

                return lotSize;
            }
        }

        /// <summary>
        /// Retrieve the number of days between the ask of the new password and the changement of the new password
        /// If the value is not defined, set "1"
        /// </summary>
        public static int PasswordExpiricyDay
        {
            get
            {
                string strMaxDays = AppSettings[SETTING_PASSWORD_EXPIRICYDAY];
                if (strMaxDays == null)
                    return 1;

                if (!int.TryParse(strMaxDays, out int maxDays))
                    return 1;

                if (maxDays <= 0)
                    return 1;

                return maxDays;
            }
        }

        /// <summary>
        /// Maximum size in ko of the buffer cache in the client side
        /// by default: 1.024 ko (1Mo)
        /// </summary>
        public static int ClientHubMaxSize
        {
            get
            {
                string strMaxSize = AppSettings[SETTING_CLIENT_HUB_MAXSIZE];
                if (strMaxSize == null)
                    return 1024;

                if (!int.TryParse(strMaxSize, out int maxSize))
                    return 1024;

                if (maxSize <= 0)
                    return 1024;

                return maxSize;
            }
        }

        /// <summary>
        /// Timeout allowed of the websocket in seconds
        /// by default: 30 secondes
        /// </summary>
        public static int ClientHubTimeout
        {
            get
            {
                string strTimeout = AppSettings[SETTING_CLIENT_HUB_TIMEOUT];
                if (strTimeout == null)
                    return 30;

                if (!int.TryParse(strTimeout, out int timeout))
                    return 30;

                if (timeout <= 0)
                    return 30;

                return timeout;
            }
        }

        /// <summary>
        /// Http Root defined by the application
        /// </summary>
        private static string _serverHttpRoot = null;

        /// <summary>
        /// Retrieve the root http address of the application
        /// </summary>
        public static string ServerHttpRoot
        {
            get
            {
                if (AppSettings[SETTING_HTTP_ROOT] == null)
                    return _serverHttpRoot ?? "";

                return AppSettings[SETTING_HTTP_ROOT];
            }

            set
            {
                if (value != null && !value.EndsWith("/"))
                    value += "/";

                _serverHttpRoot = value;
            }
        }

        /// <summary>
        /// Retrieve the root http address of the images of the application
        /// </summary>
        public static string ServerHttpRootImages => $"{Path.Combine(ServerHttpRoot, "Content", "Images")}/";

        /// <summary>
        /// Retrieve the directory root of the images of the application
        /// </summary>
        public static string ServerFileRootImages
        {
            get
            {
                string rootDirectory = AppDomain.CurrentDomain.BaseDirectory;

                if (AppSettings[SETTING_FILE_ROOT] != null)
                    rootDirectory = AppSettings[SETTING_FILE_ROOT];

                return Path.Combine(rootDirectory, "Content", "Images");
            }
        }

        /// <summary>
        /// Retrieve the file representing the release notes
        /// </summary>
        public static string ReleaseNotesFile
        {
            get
            {
                string rootDirectory = AppDomain.CurrentDomain.BaseDirectory;

                if (AppSettings[SETTING_FILE_ROOT] != null)
                    rootDirectory = AppSettings[SETTING_FILE_ROOT];

                return Path.Combine(rootDirectory, "release-notes.txt");
            }
        }

        /// <summary>
        /// Delay in seconds between 2 heartbeats ( &lt;= 0 to disable)
        /// by default: 30 s and limited up to ClientHubTimeout / 2
        /// </summary>
        public static int HeartbeatDelay
        {
            get
            {
                string strDelay = AppSettings[SETTING_HEARTBEAT_DELAY];
                if (strDelay == null || !int.TryParse(strDelay, out int delay))
                    delay = 30;

                int timeout = ClientHubTimeout / 2;
                if (delay > timeout)
                    delay = timeout;

                return delay <= 0 ? -1 : delay;
            }
        }

        /// <summary>
        /// Retrieves the list of settings described into web.config and take into account the default value set by this class
        /// </summary>
        public static Dictionary<string, string> Settings
        {
            get
            {
                Dictionary<string, string> settings = new Dictionary<string, string>();

                // retrieve all settings into web.config

                foreach (string key in AppSettings.AllKeys)
                    settings[key] = AppSettings[key];

                // complete settings by default value from this class

                if (!settings.ContainsKey(SETTING_MODE))
                    settings[SETTING_MODE] = Mode;

                if (!settings.ContainsKey(SETTING_DEBUG))
                    settings[SETTING_DEBUG] = Debug.ToString();

                if (!settings.ContainsKey(SETTING_DATABASE_SCHEMA))
                    settings[SETTING_DATABASE_SCHEMA] = DatabaseSchema;

                if (!settings.ContainsKey(SETTING_DATABASE_EXPECTED_VERSION))
                    settings[SETTING_DATABASE_EXPECTED_VERSION] = DatabaseExpectedVersion.ToString();

                if (!settings.ContainsKey(SETTING_DEFAULT_LANGUAGE))
                    settings[SETTING_DEFAULT_LANGUAGE] = DefaultLanguage;

                if (!settings.ContainsKey(SETTING_LOGGER_MAX_DAYS))
                    settings[SETTING_LOGGER_MAX_DAYS] = LoggerMaxDays.ToString();

                if (!settings.ContainsKey(SETTING_APPDATA_MAX_DAYS))
                    settings[SETTING_APPDATA_MAX_DAYS] = AppDataMaxDays.ToString();

                if (!settings.ContainsKey(SETTING_ADMINISTRATOR_LOGIN))
                    settings[SETTING_ADMINISTRATOR_LOGIN] = AdministratorLogin;

                if (!settings.ContainsKey(SETTING_ADMINISTRATOR_PASSWORD))
                    settings[SETTING_ADMINISTRATOR_PASSWORD] = AdministratorPassword;

                if (!settings.ContainsKey(SETTING_HTTP_ROOT))
                    settings[SETTING_HTTP_ROOT] = ServerHttpRoot;

                if (!settings.ContainsKey(SETTING_FILE_ROOT))
                    settings[SETTING_FILE_ROOT] = AppDomain.CurrentDomain.BaseDirectory;

                if (!settings.ContainsKey(SETTING_CLIENT_PDF_FONT))
                    settings[SETTING_CLIENT_PDF_FONT] = String.Empty;

                // override the value by the value extracted from this class

                settings[SETTING_DATABASE_TYPE] = DatabaseProvider.ToString();
                settings[SETTING_DATABASE_CACHE] = DatabaseCache ? "true" : "false";
                settings[SETTING_CONNECTION_MAX_WAITING] = ConnectionMaxWaiting.ToString();
                settings[SETTING_CONNECTION_CLEANUP] = ConnectionCleanup.ToString();
                settings[SETTING_CONNECTION_LOTSIZE] = ConnectionLotSize.ToString();
                settings[SETTING_PASSWORD_EXPIRICYDAY] = PasswordExpiricyDay.ToString();

                settings[SETTING_CLIENT_HUB_MAXSIZE] = ClientHubMaxSize.ToString();
                settings[SETTING_CLIENT_HUB_TIMEOUT] = ClientHubTimeout.ToString();

                settings[SETTING_HEARTBEAT_DELAY] = HeartbeatDelay.ToString();

                // set some globals parameters

                settings[APPLICATION] = ApplicationName;
                settings[APPLICATION_VERSION] = ApplicationVersion.ToString();
                settings[APPLICATION_COMPANY] = ApplicationCompany;
                settings[APPLICATION_COPYRIGHT] = ApplicationCopyright;

                return settings;
            }
        }
    }
}