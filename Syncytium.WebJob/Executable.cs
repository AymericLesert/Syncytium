using Syncytium.Common.Managers;
using System;
using Microsoft.Azure.WebJobs;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;

/*
    Copyright (C) 2017 LESERT Aymeric - aymeric.lesert@concilium-lesert.fr

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

namespace Syncytium.WebJob
{
    /// <summary>
    /// Main program
    /// </summary>
    class Executable
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static string MODULE => typeof(Executable).Name;

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
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        private static void Error(string message) => Common.Logger.LoggerManager.Instance.Error(MODULE, message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        private static void Exception(string message, System.Exception ex) => Common.Logger.LoggerManager.Instance.Exception(MODULE, message, ex);

        #endregion

        /// <summary>
        /// Usage formula
        /// </summary>
        /// <param name="args"></param>
        static void Usage(string[] args)
        {
            Info($"Usage : {ConfigurationManager.ApplicationName} [-v] [module] [function] [parameters]");
            Info("Where :");
            Info("  -v : verbose mode. Write the content into the console");
            Info("  [module] / [function] can be :");
            Info("  'Test' : show the configuration in the console");
            Info("Without any arguments, if the connection string 'AzureWebJobsStorage' is defined and not null, the application will start in webjob mode");
        }

        /// <summary>
        /// This function is called on the end of the application
        /// </summary>
        static void OnClose()
        {
            Common.Logger.LoggerManager.Instance.Terminate();
        }

        /// <summary>
        /// Execute a job with some arguments
        /// </summary>
        /// <param name="verbose"></param>
        /// <param name="args"></param>
        /// <returns></returns>
        static int ExecuteJob(bool verbose, string[] args)
        {
            // Check if a parameter is defined

            switch (args.Length)
            {
                case 0:
                    Info("Running Web jobs ...");

                    // WebJob is running if and only if the application has a connection string to a storage account into azure environment

                    string connectionString = ConfigurationManager.ConnectionStrings[ConfigurationManager.CONNEXION_STRING_AZURE]?.ConnectionString;
                    if (String.IsNullOrWhiteSpace(connectionString))
                        break;

                    // Run a function on terminating the application by the webjob process

                    System.Threading.CancellationToken cancellationToken = new WebJobsShutdownWatcher().Token;
                    cancellationToken.Register(() => {
                        // The process is correctly done ...
                        // This notification is raised on closing the web jobs
                        OnClose();
                    });

                    // Run WebJob in continuous mode

                    JobHostConfiguration config = new JobHostConfiguration();
                    if (config.IsDevelopment)
                        config.UseDevelopmentSettings();

                    config.UseTimers();

                    var host = new JobHost(config);
                    host.RunAndBlock();
                    return 0;

                case 1:
                    Info("Running test ...");

                    // run a module without any function

                    switch (args[0])
                    {
                        case "Test":
                            return (new Syncytium.WebJob.Module.Test.Job()).Run(verbose, args.RemoveAt(0, 1));
                    }
                    break;

                default:
                    // run a module within a function

                    switch (args[0])
                    {
                        case Syncytium.Module.Administration.DatabaseContext.AREA_NAME:
                            break;

                        case Syncytium.Module.Sample.DatabaseContext.AREA_NAME:
                            break;
                    }
                    break;
            }

            Usage(args);
            return -1;
        }

        /// <summary>
        /// Certificate validation callback.
        /// </summary>
        static bool ValidateRemoteCertificate(object sender, X509Certificate cert, X509Chain chain, SslPolicyErrors errorSsl)
        {
            // If the certificate is a valid, signed certificate, return true.
            if (errorSsl == System.Net.Security.SslPolicyErrors.None)
                return true;

            Error($"Allow X509Certificate [{cert.Subject}] '{errorSsl.ToString()}'");
            return true;
        }
        /// <summary>
        /// Entry point
        /// </summary>
        /// <param name="args"></param>
        /// <returns></returns>
        static int Main(string[] args)
        {
            bool verbose = args.Length > 0 && args[0].Equals("-v");
            if (verbose)
                args = args.RemoveAt(0, 1);

            Console.CancelKeyPress += new ConsoleCancelEventHandler((object sender, ConsoleCancelEventArgs cancelArgs) => {
                Info("The application is stopped by CTRL+C");
                OnClose();
            });

            Console.WriteLine("Job initialization ...");

            string filenameConfig = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, AppDomain.CurrentDomain.FriendlyName.ToString() + ".config");

            Console.WriteLine($"Configuration file: {filenameConfig}");

            // Initialize Log4Net and LoggerManager

            try
            {
                ConfigurationManager.AppSettings = System.Configuration.ConfigurationManager.AppSettings;
                ConfigurationManager.ConnectionStrings = System.Configuration.ConfigurationManager.ConnectionStrings;

                log4net.Config.XmlConfigurator.Configure(new FileInfo(filenameConfig));
                Common.Logger.LoggerManager.Instance.Initialize();
            }
            catch (System.Exception ex)
            {
                // Impossible to start the application due to an abnormal situation on initializing
                // The log manager is not currently running !
                Console.WriteLine("Unable to initialize the log file due to " + ex.ToString());
                return -1;
            }

            // List of arguments

            Info("List of arguments :");
            int i = 0;
            foreach (string arg in args)
            {
                Info($"Args[{i}] = '{args[i]}'");
                i++;
            }

            if (verbose)
            {
                Console.WriteLine("List of arguments :");
                i = 0;
                foreach (string arg in args)
                {
                    Console.WriteLine($"Args[{i}] = '{args[i]}'");
                    i++;
                }
            }

            // Log settings from app.config

            try
            {
                Info($"Settings into the {filenameConfig}");
                if (verbose)
                    Console.WriteLine($"Settings into the {filenameConfig}");

                foreach (KeyValuePair<string, string> setting in ConfigurationManager.Settings)
                {
                    Info($"Setting[{setting.Key}] = '{setting.Value}'");
                    if (verbose)
                        Console.WriteLine($"Setting[{setting.Key}] = '{setting.Value}'");
                }
            }
            catch (System.Exception ex)
            {
                Exception("An exception occurs during reading the settings", ex);
                return -1;
            }

            // Run the job

            int result = 0;
            try
            {
                ServicePointManager.ServerCertificateValidationCallback += ValidateRemoteCertificate;

                result = ExecuteJob(verbose, args);
            }
            catch (System.Exception ex)
            {
                Exception("An exception occurs during executing the job", ex);
                result = -1;
            }

            // The process is correctly done ...

            OnClose();
            return result;

        }
    }
}
