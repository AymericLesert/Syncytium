using Syncytium.Common.Database;
using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Managers;
using Syncytium.Web.App_Start;
using Syncytium.Web.Database;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Timers;
using System.Web.Configuration;
using System.Web.Mvc;
using System.Web.Routing;

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

namespace Syncytium.Web
{
    /// <summary>
    /// Entry point of the MVC application
    /// </summary>
    public class MvcApplication : System.Web.HttpApplication
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static string MODULE => Common.Logger.LoggerManager.MODULE_NAME;

        /// <summary>
        /// Indicates if the all verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private static bool IsVerboseAll() => Common.Logger.LoggerManager.Instance.IsVerboseAll;

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private static bool IsVerbose() => Common.Logger.LoggerManager.Instance.IsVerbose;

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="message"></param>
        private static void Verbose(string message) => Common.Logger.LoggerManager.Instance.Verbose(MODULE, message);

        /// <summary>
        /// Indicates if the debug mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private static bool IsDebug() => Common.Logger.LoggerManager.Instance.IsDebug;

        /// <summary>
        /// Log a debug message
        /// </summary>
        /// <param name="message"></param>
        private static void Debug(string message) => Common.Logger.LoggerManager.Instance.Debug(MODULE, message);

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        private static void Info(string message) => Common.Logger.LoggerManager.Instance.Info(MODULE, message);

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        private static void Warn(string message) => Common.Logger.LoggerManager.Instance.Warn(MODULE, message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        private static void Exception(string message, System.Exception ex) => Common.Logger.LoggerManager.Instance.Exception(MODULE, message, ex);

        #endregion

        /// <summary>
        /// Initialize the application
        /// </summary>
        private void Initialize()
        {
            StatusManager.Status = StatusManager.EStatus.STATUS_OK;

            // Initialize Log4Net and LoggerManager

            try
            {
                log4net.Config.XmlConfigurator.Configure(new FileInfo(Server.MapPath("~/Web.config")));
                Common.Logger.LoggerManager.Instance.Initialize();
            }
            catch (System.Exception ex)
            {
                // Impossible to start the application due to an abnormal situation on initializing
                // The log manager is not currently running !
                StatusManager.Status = StatusManager.EStatus.STATUS_FAIL;
                StatusManager.Exception = ex;
                return;
            }

            // Log settings from web.config

            try
            {
                Info("Settings into the web.config");
                foreach (KeyValuePair<string, string> setting in ConfigurationManager.Settings)
                    Info($"Setting[{setting.Key}] = '{setting.Value}'");
            }
            catch (System.Exception ex)
            {
                Exception("An exception occurs during reading the settings", ex);
            }

            try
            {
                string connectionString = WebConfigurationManager.ConnectionStrings[ConfigurationManager.CONNEXION_STRING]?.ConnectionString;
                if (connectionString == null)
                    connectionString = "";

                Debug($"Connection String to the database is '{connectionString}'");

                using (Module.Administration.DatabaseContext database = new Module.Administration.DatabaseContext())
                {
                    // Open a connection to the database

                    database.Database.Connection.Open();

                    // Does the database upgrade towards the latest version ?

                    if (database.HasToUpgrade())
                    {
                        Warn("A upgrading process must be run");
                        StatusManager.Status = StatusManager.EStatus.STATUS_UPGRADING;
                        return;
                    }

                    // Build the database schema

                    ConfigurationManager.Schemas[Module.Administration.DatabaseContext.AREA_NAME] = new Common.Database.DSSchema.DSDatabase(typeof(Module.Administration.DatabaseContext), new DatabaseRequest());
                    Info($"Database schema[{Module.Administration.DatabaseContext.AREA_NAME}] : '{ConfigurationManager.Schemas[Module.Administration.DatabaseContext.AREA_NAME]}'");

                    ConfigurationManager.Schemas[Module.Customer.DatabaseContext.AREA_NAME] = new Common.Database.DSSchema.DSDatabase(typeof(Module.Customer.DatabaseContext), new DatabaseRequest());
                    Info($"Database schema[{Module.Customer.DatabaseContext.AREA_NAME}] : '{ConfigurationManager.Schemas[Module.Customer.DatabaseContext.AREA_NAME]}'");

                    // Log settings from database

                    Info("Settings into the database");
                    foreach (ParameterRecord parameter in database._Parameter)
                        Info($"Parameter[{parameter.Key}] = '{parameter.Value}'");

                    /*  Clean up all connection from this server */

                    if (ConfigurationManager.ConnectionCleanup)
                        database.CleanupConnection();

                    /* Remove files older than max number of days from ~/App_Data */

                    if (ConfigurationManager.AppDataMaxDays < 0)
                    {
                        Info("Do not clean up the folder ~/App_Data");
                    }
                    else
                    {
                        int nbFilesDeleted = 0;
                        Info("Cleaning up the folder ~/App_Data ...");
                        foreach (String filename in Directory.GetFiles(Server.MapPath("~/App_Data")))
                        {
                            Debug($"Cleaning up the file '{filename}' ...");

                            FileAttributes fileAttr = File.GetAttributes(filename);

                            if (fileAttr.HasFlag(FileAttributes.Directory) ||
                                Path.GetFileName(filename).Equals("UploadFiles.txt"))
                            {
                                Debug($"The file '{filename}' mustn't be deleted ...");
                                continue;
                            }

                            FileInfo fileInfo = new FileInfo(filename);
                            if (fileInfo.CreationTime >= DateTime.Now.AddDays(-ConfigurationManager.AppDataMaxDays))
                            {
                                Info($"Keep the file '{filename}'");
                                continue;
                            }

                            try
                            {
                                fileInfo.Delete();
                                Info($"'{filename}' deleted");
                                nbFilesDeleted++;
                            }
                            catch (System.Exception ex)
                            {
                                Exception($"Unable to delete '{filename}'", ex);
                            }
                        }
                        Info($"{nbFilesDeleted} files deleted");
                    }

                    // Initialize the cache manager for all known customers

                    if (DatabaseCacheManager.Instance.IsEnable)
                    {
                        Debug($"Loading data into the cache manager for all customers ...");
                        List<int> customerIds = database.Customer.Select(c => c.Id).ToList();
                        DatabaseCacheManager.Instance.Initialize(database, customerIds, Syncytium.Managers.DatabaseManager.GetDatabase);
                        Info($"Data loaded into the cache manager for all customers ...");
                    }
                    else
                    {
                        Info("The database cache manager is disabled");
                    }

                    // Load all labels

                    LanguageManager.GetInstance(database);
                }
            }
            catch (System.Exception ex)
            {
                Exception("An exception occurs during initializing database connection", ex);
                StatusManager.Status = StatusManager.EStatus.STATUS_FAIL;
                StatusManager.Exception = ex;
                return;
            }

            // Run threads

            DatabaseQueue.Instance.StartConsumer();
            StartHeartbeat();
        }

        /// <summary>
        /// Launch the heartbeat of the application if it is enabled
        /// </summary>
        public static void StartHeartbeat()
        {
            // Start Heartbeat to disconnect client if no updated done since a while

            if (ConfigurationManager.HeartbeatDelay <= 0 || ConfigurationManager.ClientHubTimeout <= 0)
                return;

            Info($"Launching heartbeat every {ConfigurationManager.HeartbeatDelay} seconds and disconnect clients after {ConfigurationManager.ClientHubTimeout} seconds without response ...");

            // Disconnect all connections if no updates done since a while ...

            IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<DatabaseHub>();

            using (Module.Administration.DatabaseContext requester = new Module.Administration.DatabaseContext())
                foreach (ConnectionRecord connection in requester._Connection.Where(c => c.Allow && c.Status).ToList())
                {
                    if (connection.ConnectionLast < DateTime.Now.AddSeconds(-ConfigurationManager.ClientHubTimeout))
                    {
                        try
                        {
                            Info($"Disconnecting the client {connection} ...");
                            if (hub != null)
                                hub.Clients.Client(connection.ConnectionId).stop();
                            connection.Allow = false;
                            requester.SaveChanges();
                        }
                        catch (System.Exception exception)
                        {
                            Exception("Unable to disconnect the client", exception);
                        }
                    }
                }

            // Run the heartbeat

            Debug("Starting heartbeat ...");
            Timer heartbeat = new Timer(ConfigurationManager.HeartbeatDelay * 1000);
            heartbeat.Elapsed += Heartbeat;
            heartbeat.Start();
        }

        /// <summary>
        /// Event raise every heartbeat
        /// </summary>
        /// <param name="source"></param>
        /// <param name="e"></param>
        private static void Heartbeat(Object source, ElapsedEventArgs e)
        {
            IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<DatabaseHub>();
            if (hub == null)
                return;

            Info("Running heartbeat ...");

            using (Module.Administration.DatabaseContext requester = new Module.Administration.DatabaseContext())
            {
                Debug("Ping all clients connected ...");

                foreach (ConnectionRecord connection in requester._Connection.Where(c => c.Allow && c.Status).ToList())
                {
                    try
                    {
                        Verbose($"Ping the client {connection}");
                        hub.Clients.Client(connection.ConnectionId).ping();
                    }
                    catch (System.Exception exception)
                    {
                        Exception("Unable to ping the client", exception);
                    }
                }

                Debug("Disconnect all clients without any updates since a while ...");

                foreach (ConnectionRecord connection in requester._Connection.Where(c => c.Allow && c.Status).ToList())
                {
                    if (connection.ConnectionLast < DateTime.Now.AddSeconds(-ConfigurationManager.ClientHubTimeout))
                    {
                        try
                        {
                            Info($"Disconnecting the client {connection} ...");
                            hub.Clients.Client(connection.ConnectionId).stop();
                            connection.Allow = false;
                            requester.SaveChanges();
                        }
                        catch (System.Exception exception)
                        {
                            Exception("Unable to disconnect the client", exception);
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Entry point of the ASP.NET Application
        /// </summary>
        protected void Application_Start()
        {
            // Initialize the application

            ConfigurationManager.AppSettings = WebConfigurationManager.AppSettings;
            ConfigurationManager.ConnectionStrings = WebConfigurationManager.ConnectionStrings;

            Initialize();

            // Start process

            AreaRegistration.RegisterAllAreas();
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
        }
    }
}
