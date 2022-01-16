using System.Data.Common;
using System.Data.Entity;

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

namespace Syncytium.Core.Common.Server.Database.Provider
{
    /// <summary>
    /// Handle the access to the database (base) because this class must be implemented on depends on the connection
    /// </summary>
    public abstract class Provider
    {
        /// <summary>
        /// Database type handled by the application
        /// </summary>
        public enum EProvider
        {
            /// <summary>No database</summary>
            None = 0,
            /// <summary>Oracle database</summary>
            Oracle = 1,
            /// <summary>SQL Server database</summary>
            SQLServer = 2,
            /// <summary>Firebird database</summary>
            Firebird = 3,
            /// <summary>MySQL database</summary>
            MySQL = 4,
            /// <summary>Unknown database</summary>
            Unknown = 5
        };

        /// <summary>
        /// Reference on the database connection
        /// </summary>
        protected DbConnection? _database = null;

        /// <summary>
        /// Store the schema of the database
        /// </summary>
        public string? Schema = null;

        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected virtual string MODULE => typeof(Provider).Name;

        /// <summary>
        /// Indicates if the all verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        protected bool IsVerboseAll() => Managers.LoggerManager.Instance.IsVerboseAll;

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        protected bool IsVerbose() => Managers.LoggerManager.Instance.IsVerbose;

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="message"></param>
        protected void Verbose(string message) => Managers.LoggerManager.Instance.Verbose(MODULE, message);

        /// <summary>
        /// Indicates if the debug mode is enabled or not
        /// </summary>
        /// <returns></returns>
        protected bool IsDebug() => Managers.LoggerManager.Instance.IsDebug;

        /// <summary>
        /// Log a debug message
        /// </summary>
        /// <param name="message"></param>
        protected void Debug(string message) => Managers.LoggerManager.Instance.Debug(MODULE, message);

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        protected void Info(string message) => Managers.LoggerManager.Instance.Info(MODULE, message);

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        protected void Warn(string message) => Managers.LoggerManager.Instance.Warn(MODULE, message);

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        protected void Error(string message) => Managers.LoggerManager.Instance.Error(MODULE, message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        protected void Exception(string message, System.Exception ex) => Managers.LoggerManager.Instance.Exception(MODULE, message, ex);

        #endregion

        /// <summary>
        /// Provider type
        /// </summary>
        public abstract EProvider Type { get; }

        /// <summary>
        /// Retrieve the SQL command corresponding to the existing table
        /// </summary>
        /// <param name="table"></param>
        /// <returns></returns>
        public abstract string GetSQLExistTable(string table);

        /// <summary>
        /// Execute a SQL script
        /// </summary>
        /// <param name="script"></param>
        /// <returns>true if the script has correctly run or false if something is wrong</returns>
        public abstract bool ExecuteScript(string script);

        /// <summary>
        /// Check if a value already exists into a table of the database and if this value is still alive
        /// </summary>
        /// <param name="transaction"></param>
        /// <param name="customerId"></param>
        /// <param name="table"></param>
        /// <param name="columnValue"></param>
        /// <param name="columnId"></param>
        /// <param name="caseSensitive"></param>
        /// <param name="value"></param>
        /// <param name="id"></param>
        /// <param name="fields"></param>
        /// <returns></returns>
        public abstract bool ExistValue(DbContextTransaction transaction, int? customerId, string table, string columnValue, string columnId, bool caseSensitive, object value, int id, Dictionary<string, object> fields);

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="database"></param>
        /// <param name="schema"></param>
        public Provider(DbConnection database, string schema)
        {
            _database = database;
            Schema = schema;
        }
    }
}