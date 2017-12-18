using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Managers;
using Syncytium.Module.Administration;
using Syncytium.Module.Administration.Models;
using Syncytium.WebJob.Manager;
using System.Collections.Generic;

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

namespace Syncytium.WebJob.Module
{
    /// <summary>
    /// Master class describing a job
    /// </summary>
    abstract public class Job
    {
        /// <summary>
        /// Dictionary of all ressources for each customer
        /// </summary>
        protected static Dictionary<int, LanguageDictionary> labels = new Dictionary<int, LanguageDictionary>();

        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected virtual string MODULE => typeof(Job).Name;

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        protected bool IsVerbose() => Common.Logger.LoggerManager.Instance.IsVerbose;

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="message"></param>
        protected void Verbose(string message) => Common.Logger.LoggerManager.Instance.Verbose(MODULE, message);

        /// <summary>
        /// Indicates if the debug mode is enabled or not
        /// </summary>
        /// <returns></returns>
        protected bool IsDebug() => Common.Logger.LoggerManager.Instance.IsDebug;

        /// <summary>
        /// Log a debug message
        /// </summary>
        /// <param name="message"></param>
        protected void Debug(string message) => Common.Logger.LoggerManager.Instance.Debug(MODULE, message);

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        protected void Info(string message) => Common.Logger.LoggerManager.Instance.Info(MODULE, message);

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        protected void Warn(string message) => Common.Logger.LoggerManager.Instance.Warn(MODULE, message);

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        protected void Error(string message) => Common.Logger.LoggerManager.Instance.Error(MODULE, message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        protected void Exception(string message, System.Exception ex) => Common.Logger.LoggerManager.Instance.Exception(MODULE, message, ex);

        #endregion

        /// <summary>
        /// Check if the job can be run within the database status
        /// </summary>
        /// <param name="verbose"></param>
        /// <param name="args"></param>
        /// <returns></returns>
        virtual public int Run(bool verbose, string[] args)
        {
            // Clear all images

            PictureManager.Instance.Clear();

            // Check database connection and properties

            string connectionString = ConfigurationManager.ConnectionStrings[ConfigurationManager.CONNEXION_STRING]?.ConnectionString;
            if (connectionString == null)
                connectionString = "";

            Debug($"Connection String to the database is '{connectionString}'");

            using (DatabaseContext database = new DatabaseContext())
            {
                // Open a connection to the database

                database.Database.Connection.Open();

                // Does the database upgrade towards the latest version ?

                if (database.HasToUpgrade())
                {
                    Warn("A upgrading process must be done before running this process");
                    return -2;
                }

                // Log settings from database

                Common.Logger.LoggerManager.Instance.Info(Common.Logger.LoggerManager.MODULE_NAME, "Settings into the database");
                foreach (ParameterRecord parameter in database._Parameter)
                    Common.Logger.LoggerManager.Instance.Info(Common.Logger.LoggerManager.MODULE_NAME, $"Parameter[{parameter.Key}] = '{parameter.Value}'");
            }

            return 0;
        }

        /// <summary>
        /// Constructor by default
        /// </summary>
        public Job() { }
    }
}
