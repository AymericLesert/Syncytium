using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Database.DSSchema;
using Syncytium.Common.Exception;
using Syncytium.Module.Customer.Models;
using Newtonsoft.Json.Linq;
using System;
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

namespace Syncytium.Module.Customer
{
    /// <summary>
    /// Handle the connection to the database
    /// </summary>
    public class DatabaseContext : Administration.DatabaseContext
    {
        /// <summary>
        /// Name of the module
        /// </summary>
        new public const string AREA_NAME = "Customer";

        #region Customer

        /// <summary>
        /// Table "Parameter"
        /// </summary>
        public DbSet<Models.ParameterRecord> Parameter { get; set; }

        #endregion

        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected override string MODULE => typeof(DatabaseContext).Name;

        #endregion

        #region Handling Notifications

        /// <summary>
        /// Factory building a cache using to optimize the notification effect
        /// Virtual method (in sub class, define it the order of tables to notify)
        /// </summary>
        /// <param name="schema"></param>
        /// <returns></returns>
        public override DSCache GetCache(DSDatabase schema)
        {
            DSCache cache = base.GetCache(schema);

            // Référentiel

            cache.AddTable("Parameter");

            return cache;
        }

        /// <summary>
        /// Retrieve a list of tuple (DSRecord, Table) attached to a given record (table, id) for the given profile
        /// </summary>
        /// <param name="cache"></param>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="profile"></param>
        /// <param name="area"></param>
        /// <param name="deepUpdate"></param>
        /// <param name="recordAlreadyRead"></param>
        /// <param name="informationAlreadyRead"></param>
        /// <returns></returns>
        public override void GetListRecordsConcernedByUpdate(DSCache cache,
                                                             string table,
                                                             int id,
                                                             int customerId,
                                                             int userId,
                                                             UserProfile.EUserProfile profile,
                                                             string area,
                                                             bool deepUpdate,
                                                             DSRecord recordAlreadyRead,
                                                             InformationRecord informationAlreadyRead)
        {
            if (id < 0 || profile == UserProfile.EUserProfile.None || cache.Is(table, id) != null)
                return;

            // Retrieve the current record

            DSRecord currentRecord = null;
            Tuple<DSRecord, InformationRecord> currentRecordFromCache = cache.GetRecord(this, table, id);

            if (currentRecordFromCache == null && recordAlreadyRead == null)
            {
                switch (table)
                {
                    case "Parameter":
                        currentRecord = Parameter.Find(id);
                        break;

                    default:
                        base.GetListRecordsConcernedByUpdate(cache, table, id, customerId, userId, profile, area, deepUpdate, recordAlreadyRead, informationAlreadyRead);
                        return;
                }

                if (currentRecord == null)
                {
                    cache.Set(table, id, null);
                    return;
                }

                currentRecordFromCache = cache.SetRecord(this, table, id, currentRecord, null);
            }
            else if (currentRecordFromCache == null && recordAlreadyRead != null)
            {
                currentRecordFromCache = cache.SetRecord(this, table, id, recordAlreadyRead, informationAlreadyRead);
            }

            if (currentRecordFromCache != null)
                currentRecord = currentRecordFromCache.Item1;

            // Check if the record is concerned by the current update

            if (currentRecord is DSRecordWithCustomerId currentCustomerRecord)
            {
                if (currentCustomerRecord.CustomerId != customerId)
                {
                    cache.Set(table, id, null);
                    return;
                }
            }

            if (currentRecord as Models.ParameterRecord != null)
            {
                cache.Set(table, id, currentRecord);
                return;
            }

            base.GetListRecordsConcernedByUpdate(cache, table, id, customerId, userId, profile, area, deepUpdate, recordAlreadyRead, informationAlreadyRead);
        }

        #endregion

        #region Services

        /// <summary>
        /// Execute a service
        /// </summary>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="profile"></param>
        /// <param name="area"></param>
        /// <param name="moduleId"></param>
        /// <param name="service"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns></returns>
        public override JObject ExecuteService(int customerId,
                                               int userId,
                                               UserProfile.EUserProfile profile,
                                               string area,
                                               int moduleId,
                                               string service,
                                               JObject record,
                                               JObject identity)
        {
            JObject result = base.ExecuteService(customerId, userId, profile, area, moduleId, service, record, identity);
            if (result != null)
                return result;

            Error($"The service '{service}' is unknown!");
            throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
        }

        #endregion

        /// <summary>
        /// Initialize the database access
        /// </summary>
        public DatabaseContext() : base() { }
    }
}