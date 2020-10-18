using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Exception;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Reflection;

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

namespace Syncytium.Common.Database.DSSchema
{
    /// <summary>
    /// Description of all tables handled by the application
    /// </summary>
    public class DSDatabase
    {
        /// <summary>
        /// Class containing the schema of the database (it derives from DbContext)
        /// </summary>
        public Type Schema { get; }

        /// <summary>
        /// List of all tables described into the schema
        /// </summary>
        public Dictionary<string, DSTable> Tables { get; }

        /// <summary>
        /// Reference on a class having the ability to execute a request different than "Create", "Update" or "Delete"
        /// </summary>
        private IDSRequest _request { get; set; } = null;

        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static readonly string MODULE = typeof(DSDatabase).Name;

        /// <summary>
        /// Indicates if the all verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsVerboseAll() => Logger.LoggerManager.Instance.IsVerboseAll;

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsVerbose() => Logger.LoggerManager.Instance.IsVerbose;

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="message"></param>
        private void Verbose(string message) => Logger.LoggerManager.Instance.Verbose(MODULE, message);

        /// <summary>
        /// Indicates if the debug mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsDebug() => Logger.LoggerManager.Instance.IsDebug;

        /// <summary>
        /// Log a debug message
        /// </summary>
        /// <param name="message"></param>
        private void Debug(string message) => Logger.LoggerManager.Instance.Debug(MODULE, message);

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        private void Info(string message) => Logger.LoggerManager.Instance.Info(MODULE, message);

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        private void Warn(string message) => Logger.LoggerManager.Instance.Warn(MODULE, message);

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        private void Error(string message) => Logger.LoggerManager.Instance.Error(MODULE, message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        private void Exception(string message, System.Exception ex) => Logger.LoggerManager.Instance.Exception(MODULE, message, ex);

        #endregion

        /// <summary>
        /// Convert the schema into JSON
        /// </summary>
        /// <param name="area">if null, all tables, else tables and columns having the restriction to the area</param>
        /// <param name="profile">if None, all tables, else tables and columns having the restriction to the profile</param>
        /// <param name="cache">if null, no order, else list of tables in the expected order</param>
        /// <returns></returns>
        public JObject ToJSON(string area,
                              UserProfile.EUserProfile profile,
                              DSCache cache)
        {
            JObject result = new JObject();

            if ( cache == null)
            {
                foreach (KeyValuePair<string, DSTable> table in Tables)
                {
                    JObject tableDescription = table.Value.ToJSON(area, profile);
                    if (tableDescription != null)
                        result[table.Key] = tableDescription;
                }
            }
            else
            {
                foreach(string table in cache.Tables)
                {
                    if (!Tables.ContainsKey(table))
                        continue;

                    JObject tableDescription = Tables[table].ToJSON(area, profile);
                    if (tableDescription != null)
                        result[table] = tableDescription;
                }

                foreach (KeyValuePair<string, DSTable> table in Tables)
                {
                    if (cache.Tables.IndexOf(table.Key) >= 0)
                        continue;

                    JObject tableDescription = table.Value.ToJSON(area, profile);
                    if (tableDescription != null)
                        result[table.Key] = tableDescription;
                }
            }

            return result;
        }

        /// <summary>
        /// Convert the schame into a string
        /// </summary>
        /// <returns></returns>
        public override string ToString() => ToJSON(null, UserProfile.EUserProfile.None, null).ToString(Formatting.None);

        /// <summary>
        /// Retrieve for each row in the database for the given table,
        /// Each columns within only the expected columns due to the restriction in area and profile
        /// </summary>
        /// <param name="database"></param>
        /// <param name="table"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="profile"></param>
        /// <param name="area"></param>
        /// <param name="recordId"></param>
        /// <param name="existingRecords">Define it to replace the loading into the database</param>
        /// <returns></returns>
        public IEnumerable<object[]> ReadTable(DatabaseContext database, string table, int customerId, int userId, UserProfile.EUserProfile profile, string area, int? recordId, List<DSRecord> existingRecords)
        {
            if (!Tables.ContainsKey(table))
                return Enumerable.Empty<object[]>();

            // Retrieve the list of columns to return

            return Tables[table].ReadTable(database, customerId, userId, profile, area, recordId, existingRecords);
        }

        /// <summary>
        /// Build a dynamic record containing properties depending on the area and the profile
        /// </summary>
        /// <param name="record"></param>
        /// <param name="area"></param>
        /// <param name="userId"></param>
        /// <param name="profile"></param>
        /// <returns></returns>
        public JObject FilterRecord(DSRecord record, string area, int userId, UserProfile.EUserProfile profile)
        {
            foreach (KeyValuePair<string, DSTable> table in Tables)
            {
                if (table.Value.Table != record.GetType())
                    continue;

                return table.Value.FilterRecord(record, area, userId, profile);
            }

            return null;
        }

        /// <summary>
        /// Build a dynamic record containing properties depending on the area and the profile
        /// </summary>
        /// <param name="record"></param>
        /// <param name="area"></param>
        /// <param name="userId"></param>
        /// <param name="profile"></param>
        /// <param name="request"></param>
        /// <returns>true if the record is filtered</returns>
        public bool FilterRecord(DSRecord record, string area, int userId, UserProfile.EUserProfile profile, DSRequest request)
        {
            foreach (KeyValuePair<string, DSTable> table in Tables)
            {
                if (table.Value.Table != record.GetType())
                    continue;

                return table.Value.FilterRecord(record, area, userId, profile, request);
            }

            return false;
        }

        /// <summary>
        /// Look for the record Id of the request
        /// </summary>
        /// <param name="database"></param>
        /// <param name="userId"></param>
        /// <param name="table"></param>
        /// <param name="action"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns></returns>
        public int GetRecordId(DatabaseContext database, int userId, string table, string action, JObject record, JObject identity)
        {
            if (!Tables.ContainsKey(table))
                return -1;

            return Tables[table].GetRecordId(database, userId, action, record, identity);
        }

        /// <summary>
        /// Execute a request on the database schema (Create, Update or Delete a record for an existing table)
        /// on depends on the restriction view for the area and the profile
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="area"></param>
        /// <param name="profile"></param>
        /// <param name="table"></param>
        /// <param name="action"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns></returns>
        public void OnBeforeExecuteRequest(DatabaseContext database, int tick, int customerId, int userId, string area, UserProfile.EUserProfile profile, string table, string action, int id, JObject record, JObject identity)
        {
            if (!Tables.ContainsKey(table))
                throw new ExceptionDefinitionRecord("ERR_REQUEST_UNKNOWN");

            Tables[table].OnBeforeExecuteRequest(database, tick, customerId, userId, area, profile, action, id, record, identity);
        }

        /// <summary>
        /// Execute a request on the database schema (Create, Update or Delete a record for an existing table)
        /// on depends on the restriction view for the area and the profile
        /// </summary>
        /// <param name="database"></param>
        /// <param name="transaction"></param>
        /// <param name="lot"></param>
        /// <returns></returns>
        public List<Tuple<DSRecord, InformationRecord>> ExecuteRequest(DatabaseContext database, DSTransaction transaction, List<DSRequest> lot)
        {
            if (lot.Count == 0)
                return new List<Tuple<DSRecord, InformationRecord>>();

            DSRequest reference = lot[0];

            if (!Tables.ContainsKey(reference.Table))
                throw new ExceptionDefinitionRecord("ERR_REQUEST_UNKNOWN");

            return Tables[reference.Table].ExecuteRequest(database, transaction, reference.Action, lot);
        }

        /// <summary>
        /// Execute a request on the database schema (Create, Update or Delete a record for an existing table)
        /// on depends on the restriction view for the area and the profile
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="area"></param>
        /// <param name="profile"></param>
        /// <param name="table"></param>
        /// <param name="action"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <returns></returns>
        public void OnAfterExecuteRequest(DatabaseContext database, int tick, int customerId, int userId, string area, UserProfile.EUserProfile profile, string table, string action, int id, DSRecord record)
        {
            if (!Tables.ContainsKey(table))
                throw new ExceptionDefinitionRecord("ERR_REQUEST_UNKNOWN");

            Tables[table].OnAfterExecuteRequest(database, tick, customerId, userId, area, profile, action, id, record);
        }

        /// <summary>
        /// Execute a request on the database schema (other than Create, Update or Delete)
        /// </summary>
        /// <param name="database"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="area"></param>
        /// <param name="profile"></param>
        /// <param name="table"></param>
        /// <param name="lot"></param>
        /// <returns></returns>
        public List<Tuple<DSRecord, InformationRecord>> ExecuteRequestCustom(DatabaseContext database, int customerId, int userId, string area, UserProfile.EUserProfile profile, string table, List<DSRequest> lot)
        {
            if (_request == null)
                return null;

            List<Tuple<DSRecord, InformationRecord>> result = new List<Tuple<DSRecord, InformationRecord>>();

            foreach (DSRequest request in lot)
            {
                int tick = request.NewTick;
                string action = request.Action;
                int id = request.RecordId;
                JObject record = request.Record;
                JObject identity = request.Identity;

                result.Add(_request.ExecuteRequest(database, tick, customerId, userId, area, profile, table, action, id, record, identity));
            }

            return result;
        }

        /// <summary>
        /// This function is called before creating the record ... used to complete the creation
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        public void OnBeforeCreateRecord(DatabaseContext database, int tick, string table, int id, JObject record, JObject identity)
        {
            if (_request == null)
                return;

            _request.OnBeforeCreateRecord(database, tick, table, id, record, identity);
        }

        /// <summary>
        /// This function is called before updating the record ... used to complete the update
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        public void OnBeforeUpdateRecord(DatabaseContext database, int tick, string table, int id, JObject record, JObject identity)
        {
            if (_request == null)
                return;

            _request.OnBeforeUpdateRecord(database, tick, table, id, record, identity);
        }

        /// <summary>
        /// This function is called before deleting the record ... used to complete the deletion
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        public void OnBeforeDeleteRecord(DatabaseContext database, int tick, string table, int id, JObject record, JObject identity)
        {
            if (_request == null)
                return;

            _request.OnBeforeDeleteRecord(database, tick, table, id, record, identity);
        }

        /// <summary>
        /// This function is called after creating the record ... used to complete the creation
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="record"></param>
        public void OnAfterCreateRecord(DatabaseContext database, int tick, string table, DSRecord record)
        {
            if (_request == null)
                return;

            _request.OnAfterCreateRecord(database, tick, table, record);
        }

        /// <summary>
        /// This function is called after updating the record ... used to complete the update
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="record"></param>
        public void OnAfterUpdateRecord(DatabaseContext database, int tick, string table, DSRecord record)
        {
            if (_request == null)
                return;

            _request.OnAfterUpdateRecord(database, tick, table, record);
        }

        /// <summary>
        /// This function is called after deleting the record ... used to complete the deletion
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="record"></param>
        public void OnAfterDeleteRecord(DatabaseContext database, int tick, string table, DSRecord record)
        {
            if (_request == null)
                return;

            _request.OnAfterDeleteRecord(database, tick, table, record);
        }

        /// <summary>
        /// Get the area containing into the area (namespace of the object)
        /// </summary>
        /// <param name="area"></param>
        /// <returns></returns>
        public static string GetArea(string area)
        {
            string[] NamespaceComponent = area.Split('.');
            int index = Array.IndexOf(NamespaceComponent, "Module");
            if (index < 0)
                return null;

            if (index >= NamespaceComponent.Length)
                return null;

            return NamespaceComponent[index+1];
        }

        /// <summary>
        /// Refer to the directory containing the picture of the enunmeration value
        /// </summary>
        /// <param name="enumeration"></param>
        /// <returns></returns>
        public static string GetDirectory(Type enumeration) => DSDatabase.GetArea(enumeration.Namespace) + "/" + enumeration.Name + "/";

        /// <summary>
        /// Build the schema by introspection (tables, columns and properties)
        /// </summary>
        /// <param name="schema">Type of DbContext</param>
        /// <param name="request"></param>
        public DSDatabase(Type schema, IDSRequest request)
        {
            Schema = schema;
            Tables = new Dictionary<string, DSTable>();
            _request = request;

            if (schema.IsSubclassOf(typeof(DbContext)))
            {
                // Each table is described by a DbSet<> object

                foreach (PropertyInfo property in schema.GetProperties())
                {
                    // Only DbSet<X> contains a table

                    if (!property.PropertyType.IsGenericType || property.PropertyType.GetGenericTypeDefinition() != typeof(DbSet<>))
                        continue;

                    // Ignore private, protected tables or properties started with "_"

                    if (property.Name.StartsWith("_") || property.PropertyType.IsNotPublic)
                        continue;

                    // Ignore record not inheritence of DSRecord

                    if (!property.PropertyType.GetGenericArguments().First().IsSubclassOf(typeof(DSRecord)))
                        continue;

                    DSTable table = new DSTable(this, property, property.PropertyType.GetGenericArguments().First());
                    Tables[table.Name] = table;
                }
            }
        }
    }
}
