using System.Data.Entity;

/*
    Copyright (C) 2022 LESERT Aymeric - aymeric.lesert@concilium-lesert.fr

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

namespace Syncytium.Core.Common.Server.Database
{
    /// <summary>
    /// Handling the creation and the disposition of a transaction locking the database
    /// </summary>
    public class DatabaseLock : IDisposable
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected virtual string MODULE => typeof(DatabaseLock).Name;

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
        /// Store the current transaction
        /// </summary>
        public DbContextTransaction? Transaction = null;

        /// <summary>
        /// Dispose the lock
        /// </summary>
        public void Dispose()
        {
            if (Transaction != null)
                Transaction.Dispose();
            Transaction = null;
        }

        /// <summary>
        /// Commit the transaction ...
        /// </summary>
        public void Commit()
        {
            if (Transaction == null)
                return;

            if (IsVerbose())
                Verbose($"Unlocking the database ...");

            Transaction.Commit();
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="transaction"></param>
        public DatabaseLock(DbContextTransaction transaction)
        {
            if (IsVerbose())
                Verbose("Locking the database ...");
            Transaction = transaction;
        }
    }
}
