using Syncytium.Common.Managers;
using Syncytium.Module.Customer;

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

namespace Syncytium.WebJob.Module.Stock
{
    /// <summary>
    /// Abstract class for a job using the administration database
    /// </summary>
    abstract public class Job : Syncytium.WebJob.Module.Job
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected override string MODULE => typeof(Job).Name;

        #endregion

        /// <summary>
        /// Method called to execute the request
        /// </summary>
        /// <param name="verbose"></param>
        /// <param name="databaseContext"></param>
        /// <param name="args"></param>
        /// <returns></returns>
        public abstract int Execute(bool verbose, DatabaseContext databaseContext, string[] args);

        /// <summary>
        /// Connection the job to the database and execute the job
        /// </summary>
        /// <param name="verbose"></param>
        /// <param name="args"></param>
        /// <returns></returns>
        public override int Run(bool verbose, string[] args)
        {
            // Check database connection

            int status = base.Run(verbose, args);
            if (status != 0)
                return status;

            // Database connection

            using (DatabaseContext database = new DatabaseContext())
            {
                // Open a connection to the database

                database.Database.Connection.Open();

                // Build the database schema

                string area = DatabaseContext.AREA_NAME;
                ConfigurationManager.Schemas[area] = new Common.Database.DSSchema.DSDatabase(typeof(DatabaseContext), null);
                if (IsDebug())
                    Common.Logger.LoggerManager.Instance.Debug(Common.Logger.LoggerManager.MODULE_NAME, $"Database schema[{area}] : '{ConfigurationManager.Schemas[area].ToString()}'");

                // Executing the job

                return Execute(verbose, database, args);
            }
        }
    }
}
