using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Database.DSSchema;
using Syncytium.Common.Exception;
using Syncytium.Module.Administration.Models;
using Newtonsoft.Json.Linq;
using System;
using System.Data.Entity;

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

namespace Syncytium.Module.Administration
{
    /// <summary>
    /// Handle the connection to the database
    /// </summary>
    public class DatabaseContext : Common.Database.DatabaseContext
    {
        /// <summary>
        /// Name of the module
        /// </summary>
        public const string AREA_NAME = "Administration";

        #region Database

        /// <summary>
        /// Table "Customer"
        /// </summary>
        public DbSet<CustomerRecord> Customer { get; set; }

        /// <summary>
        /// Table "Language"
        /// </summary>
        public DbSet<LanguageRecord> Language { get; set; }

        /// <summary>
        /// Table "User"
        /// </summary>
        public DbSet<UserRecord> User { get; set; }

        /// <summary>
        /// Table "Notification"
        /// </summary>
        public DbSet<NotificationRecord> Notification { get; set; }

        /// <summary>
        /// Table "Module"
        /// </summary>
        public DbSet<ModuleRecord> Module { get; set; }

        /// <summary>
        /// Table "UserModule"
        /// </summary>
        public DbSet<UserModuleRecord> UserModule { get; set; }

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
        /// <returns></returns>
        public override DSCache GetCache()
        {
            DSCache cache = base.GetCache();
            cache.Tables.Add("Customer");
            cache.Tables.Add("Language");
            cache.Tables.Add("User");
            cache.Tables.Add("Module");
            cache.Tables.Add("UserModule");
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
                    case "Customer":
                        currentRecord = Customer.Find(id);
                        break;

                    case "Language":
                        currentRecord = Language.Find(id);
                        break;

                    case "User":
                        currentRecord = User.Find(id);
                        break;

                    case "Module":
                        currentRecord = Module.Find(id);
                        break;

                    case "UserModule":
                        currentRecord = UserModule.Find(id);
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

            if (currentRecord is CustomerRecord customer)
            {
                cache.Set(table, id, customer.Id != customerId ? null : currentRecord);
                return;
            }
            else if (currentRecord as LanguageRecord != null ||
                     currentRecord as ModuleRecord != null ||
                     currentRecord as UserModuleRecord != null ||
                     currentRecord as UserRecord != null)
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
        /// <param name="service"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns></returns>
        public override JObject ExecuteService(int customerId,
                                               int userId,
                                               UserProfile.EUserProfile profile,
                                               string area,
                                               string service,
                                               JObject record,
                                               JObject identity)
        {
            JObject result = base.ExecuteService(customerId, userId, profile, area, service, record, identity);
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