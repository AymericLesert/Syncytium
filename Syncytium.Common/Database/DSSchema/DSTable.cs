using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.ComponentModel.DataAnnotations.Schema;
using Syncytium.Common.Database.DSAnnotation;
using Syncytium.Common.Error;
using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Exception;
using Newtonsoft.Json;
using Syncytium.Common.Database.DSAnnotation.DSConstraint;
using Newtonsoft.Json.Linq;
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

namespace Syncytium.Common.Database.DSSchema
{
    /// <summary>
    /// Describes the table structure
    /// </summary>
    public class DSTable
    {
        /// <summary>
        /// Name of the table into the Database
        /// </summary>
        public string Name { get; }

        /// <summary>
        /// Area including this table
        /// </summary>
        public string Area { get; }

        /// <summary>
        /// Handle of the property attached into the database schema
        /// </summary>
        public PropertyInfo Property { get; }

        /// <summary>
        /// Class containing the table description
        /// </summary>
        public Type Table { get; }

        /// <summary>
        /// Class containing the table description in case of a history table
        /// </summary>
        public Type SourceTable { get; }

        /// <summary>
        /// Class containing the table description in case of a history table
        /// </summary>
        public String SourceTableName { get; }

        /// <summary>
        /// List of columns in the order read into the schema
        /// </summary>
        public List<DSColumn> Columns { get; }

        /// <summary>
        /// List of columns sorted by name
        /// </summary>
        public Dictionary<String, DSColumn> ColumnsByName { get; }

        /// <summary>
        /// List of restricted annotations attached to the table
        /// </summary>
        public List<DSRestrictedAttribute> Restriction { get; }

        /// <summary>
        /// List of allow annotations attached to the table
        /// </summary>
        public List<DSAllowAttribute> Allow { get; }

        /// <summary>
        /// Reference on the database schema master
        /// </summary>
        private DSDatabase _databaseSchema { get; }

        /// <summary>
        /// Index of the column containing the key of the record
        /// </summary>
        private int _indexKey { get; }

        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static string MODULE = typeof(DSTable).Name;

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

        #region Private Methods

        /// <summary>
        /// Retrieve the sequence of the record identified by id
        /// </summary>
        /// <param name="database"></param>
        /// <param name="column"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        private string GetSequenceKey(DatabaseContext database, DSColumn column, int id)
        {
            DSRecord currentRecord = null;

            if ( SourceTable != null)
            {
                currentRecord = database.Set(SourceTable).Find(id) as DSRecord;

                if (currentRecord == null)
                {
                    Error($"[{SourceTable.Name}] : The record '{id}' doesn't exist or can't be created!");
                    throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
                }

                return column.SourceProperty.GetValue(currentRecord) as string;
            }

            // Retrieve the record of the Id

            currentRecord = database.Set(Table).Find(id) as DSRecord;

            if (currentRecord == null)
            {
                Error($"[{Name}] : The record '{id}' doesn't exist or can't be created!");
                throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
            }

            return column.Property.GetValue(currentRecord) as string;
        }

        /// <summary>
        /// Index of the key amongst the list of columns into the record
        /// </summary>
        private int GetIndexKey(DSColumn[] columns)
        {
            int nbSchemaColumns = columns.Length;
            int i = 0;

            for (i = 0; i < nbSchemaColumns; i++)
            {
                if (columns[i].IsKey)
                    return i;
            }

            for (i = 0; i < nbSchemaColumns; i++)
            {
                if (columns[i].Property.Name == "Id")
                    return i;
            }

            throw new ExceptionDefinitionRecord("No column Key defined in the table");
        }

        /// <summary>
        /// Retrieve the existing record into the table on depends on its Id
        /// </summary>
        /// <param name="database"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        private Tuple<DSRecord, InformationRecord> GetRecordById(DatabaseContext database, int id)
        {
            DSRecord currentRecord = null;
            InformationRecord information = null;

            // It's a new record

            if (id < 0)
                currentRecord = Table.GetConstructor(new Type[] { }).Invoke(new object[] { }) as DSRecord;
            else
                currentRecord = database.Set(Table).Find(id) as DSRecord;

            if (currentRecord == null)
            {
                Error($"[{Name}] : The record '{id}' doesn't exist or can't be created!");
                throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
            }

            // Retrieve information from this record

            if (id >= 0)
                information = database._Information.FirstOrDefault(i => i.Id == id && i.Table.Equals(Name));

            if (information != null)
            {
                currentRecord._tick = information.Tick;
                currentRecord._deleted = information.IsDeleted;
            }

            return Tuple.Create(currentRecord, information);
        }

        /// <summary>
        /// Extract from a JSON request the record containing and set correctly all properties
        /// In case of errors, an exception is raised
        /// </summary>
        /// <param name="database"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="area"></param>
        /// <param name="profile"></param>
        /// <param name="action"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <param name="check"></param>
        /// <returns></returns>
        private DSRecord GetRecordFromClient(DatabaseContext database, int customerId, int userId, string area, UserProfile.EUserProfile profile, string action, JObject record, JObject identity, bool check)
        {
            int currentId = -1;

            // Retrieve the currentId of the record

            if (record[Columns[_indexKey].Property.Name] != null && record[Columns[_indexKey].Property.Name].Type == JTokenType.Integer)
                currentId = record[Columns[_indexKey].Property.Name].ToObject<int>();

            // 1. If currentId < 0, look for into Information table the last Id known

            if (currentId < 0  && identity[Columns[_indexKey].Property.Name] != null && identity[Columns[_indexKey].Property.Name].Type == JTokenType.Integer)
            {
                int currentClientId = identity[Columns[_indexKey].Property.Name].ToObject<int>();

                InformationRecord information = database._Information.FirstOrDefault(info => info.CreateId == currentClientId && info.CreateUserId == userId && info.Table.Equals(this.Name));
                if (information != null)
                    currentId = information.Id;
            }

            // 2. Create an instance of the record

            DSRecord currentRecord = DSRecord.Copy(GetRecordById(database, currentId).Item1);

            // 3. Check if the record is allowed ... the record must be done for the user's customer

            if (typeof(DSRecordWithCustomerId).IsInstanceOfType(currentRecord) &&
                (record["CustomerId"] == null ||
                 record["CustomerId"].Type != JTokenType.Integer ||
                 record["CustomerId"].ToObject<int>() != customerId))
            {
                Error($"The record doesn't match with the user's customer '{customerId}' !");
                throw new ExceptionDefinitionRecord("ERR_CONNECTION");
            }

            // 4. Check properties of the record and set currentRecord from the dynamic record

            Errors errors = new Errors();
            bool conversionOk = false;

            foreach (DSColumn column in Columns)
            {
                if (DSRestrictedAttribute.IsRestricted(column.Restriction, area, profile, action))
                    continue;

                object value = null;

                // Build dynamically the sequence or look for it because in case of offline mode, sequence can't be retrieve before updating or deleting the element

                if (record[column.Property.Name] == null)
                    continue;

                if (record[column.Property.Name].Type == JTokenType.Null && column.Sequence != null)
                {
                    // For the column corresponding to a sequence, retrieve the sequence value ...

                    if (SourceTable != null && record["HistoryId"] != null && record["HistoryId"].Type == JTokenType.Integer)
                    {
                        int currentSourceId = record["HistoryId"].ToObject<int>();
                        if (currentSourceId < 0)
                        {
                            int currentSourceClientId = identity["HistoryId"].ToObject<int>();
                            InformationRecord information = database._Information.FirstOrDefault(info => info.CreateId == currentSourceClientId && info.CreateUserId == userId && info.Table.Equals(SourceTableName));
                            if (information != null)
                                currentSourceId = information.Id;
                        }
                        value = GetSequenceKey(database, column, currentSourceId);
                    }
                    else
                    {
                        switch (action)
                        {
                            case "Create":
                                value = database.GetSequenceKey(customerId, column.Sequence.Key, column.Sequence.Length);
                                break;
                            default:
                                value = GetSequenceKey(database, column, currentId);
                                break;
                        }
                    }
                }
                else
                {
                    // Get the value from the JSON record

                    switch (record[column.Property.Name].Type)
                    {
                        case JTokenType.Boolean:
                            value = record[column.Property.Name].ToObject<bool>();
                            break;
                        case JTokenType.Date:
                            value = record[column.Property.Name].ToObject<DateTime>();
                            break;
                        case JTokenType.Float:
                            value = record[column.Property.Name].ToObject<double>();
                            break;
                        case JTokenType.Integer:
                            value = record[column.Property.Name].ToObject<int>();
                            break;
                        case JTokenType.None:
                        case JTokenType.Null:
                            value = null;
                            break;
                        case JTokenType.Raw:
                            value = null;
                            break;
                        case JTokenType.String:
                        case JTokenType.Uri:
                            value = record[column.Property.Name].ToObject<string>();
                            break;
                        default:
                            errors.AddField(column.Property.Name, "ERR_FIELD_BADFORMAT", new object[] { $"{{{column.Field}}}" });
                            continue;
                    }
                }

                // Check properties and convert the value into the expected type

                value = column.CheckProperties(value, errors, out conversionOk, check);

                // set the value to the property

                if (conversionOk)
                    column.Property.SetValue(currentRecord, value);
            }

            if (errors.HasError)
                throw new ExceptionDefinitionRecord("ERR_CHECK", errors);

            // 5. Check foreign key of the record and complete all ids (if their values are -1)

            if (record[Columns[_indexKey].Property.Name] != null && record[Columns[_indexKey].Property.Name].Type == JTokenType.Integer)
                Columns[_indexKey].Property.SetValue(currentRecord, currentId);

            foreach (DSColumn column in Columns)
            {
                DSForeignKeyAttribute foreignKey = column.ForeignKey;

                if (foreignKey == null || column.Property.GetValue(currentRecord) == null)
                    continue;

                // Get the id of the foreign key

                int foreignKeyId = (int)column.Property.GetValue(currentRecord);

                if (foreignKeyId >= 0)
                    continue;

                // The foreign key id is not yet defined ... looking for the foreign key id on depends on the identity foreign key id of the client

                if (!_databaseSchema.Tables.ContainsKey(foreignKey.Table))
                {
                    errors.AddField(column.Property.Name, foreignKey.Error, new object[] { $"{{{column.Field}}}" });
                    continue;
                }

                if (identity[column.Property.Name] == null ||
                    identity[column.Property.Name].Type != JTokenType.Integer)
                {
                    errors.AddField(column.Property.Name, foreignKey.Error, new object[] { $"{{{column.Field}}}" });
                    continue;
                }

                // Get the value of a properties!

                int foreignKeyClientId = -1;
                foreignKeyClientId = identity[column.Property.Name].ToObject<int>();

                InformationRecord information = database._Information.FirstOrDefault(info => info.CreateId == foreignKeyClientId && info.CreateUserId == userId && info.Table.Equals(foreignKey.Table));
                if (information == null)
                {
                    errors.AddField(column.Property.Name, foreignKey.Error, new object[] { $"{{{column.Field}}}" });
                    continue;
                }

                // Replace the foreign key of the current record by the id of the foreign record found

                column.Property.SetValue(currentRecord, information.Id);
            }

            // 6. Check unique values

            if (check)
            {
                foreach (DSColumn column in Columns)
                {
                    DSUniqueAttribute unique = column.Unique;
                    Dictionary<string, object> fields = null;

                    if (unique == null)
                        continue;

                    // Get the value to check

                    object currentValue = column.Property.GetValue(currentRecord);

                    if (currentValue == null)
                        continue;

                    if ((currentValue as string != null) && String.IsNullOrWhiteSpace(currentValue as string))
                        continue;

                    // Build the list of keys

                    if (unique.Fields != null)
                    {
                        fields = new Dictionary<string, object>();
                        foreach (string field in unique.Fields)
                        {
                            if (!ColumnsByName.ContainsKey(field))
                                continue;

                            fields.Add(field, ColumnsByName[field].Property.GetValue(currentRecord));
                        }
                    }

                    // Check if the value is already defined for another record still alive

                    if (unique.ForCustomer)
                    {
                        if (!database.ExistValue(customerId, Name, column.ColumnName, Columns[_indexKey].ColumnName, unique.CaseSensitive, currentValue, currentId, fields))
                            continue;
                    }
                    else
                    {
                        if (!database.ExistValue(null, Name, column.ColumnName, Columns[_indexKey].ColumnName, unique.CaseSensitive, currentValue, currentId, fields))
                            continue;
                    }

                    errors.AddField(column.Property.Name, unique.Error, new object[] { $"{{{column.Field}}}" });
                }
            }

            if (errors.HasError)
                throw new ExceptionDefinitionRecord("ERR_CHECK", errors);

            // 7. Check if the user is allowed to update the record

            if (!DSAllowAttribute.IsAllowed(Allow, area, profile, action, userId, currentRecord))
                throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");

            // Get the extra-parameters

            if (record["_tick"] != null && record["_tick"].Type == JTokenType.Integer)
                currentRecord._tick = record["_tick"].ToObject<int>();

            if (record["_deleted"] != null && record["_deleted"].Type == JTokenType.Boolean)
                currentRecord._deleted = record["_deleted"].ToObject<bool>();

            // All, it's alright ... currentRecord contains the record to add

            return currentRecord;
        }

        /// <summary>
        /// Execute a request on creation into the database schema
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="area"></param>
        /// <param name="profile"></param>
        /// <param name="action"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns></returns>
        private Tuple<DSRecord, InformationRecord> CreateRecord(DatabaseContext database, int tick, int customerId, int userId, string area, UserProfile.EUserProfile profile, string action, int id, JObject record, JObject identity)
        {
            // Extract the record from the request

            DSRecord currentRecord = GetRecordFromClient(database, customerId, userId, area, profile, action, record, identity, true);

            if (currentRecord.Id >= 0 || currentRecord._deleted || id >= 0)
            {
                Error($"[{Name}] : On creation a record, the Id must be equal to -1 and the deleted flag must be set to false!");
                throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
            }

            if (IsDebug())
                Debug($"[{Name}] : Adding record {currentRecord.ToString()}");

            // It's a new record

            currentRecord._tick = tick;
            currentRecord._deleted = false;

            // Add a new record into the table

            DSRecord newRecord = database.Set(Table).Add(currentRecord) as DSRecord;

            // Save changes to get the new Id of the record

            database.SaveChanges();

            int newId = (int)Columns[_indexKey].Property.GetValue(newRecord);
            Columns[_indexKey].Property.SetValue(currentRecord, newId);

            // Attach an information record to this new record

            int currentSequenceId = (identity[Columns[_indexKey].Property.Name] != null && identity[Columns[_indexKey].Property.Name].Type == JTokenType.Integer) ? identity[Columns[_indexKey].Property.Name].ToObject<int>() : -1;

            InformationRecord information = new InformationRecord
            {
                Table = Name,
                Id = newId,
                CustomerId = customerId,
                CreateId = currentSequenceId,
                CreateTick = tick,
                CreateUserId = userId,
                CreateDate = DateTime.Now,
                UpdateTick = tick,
                UpdateUserId = userId,
                UpdateDate = DateTime.Now
            };
            database._Information.Add(information);

            // Update the last sequence id for the table and this user

            if (currentSequenceId >= 0)
            {
                SequenceIdRecord sequenceIdRecord = database._SequenceId.FirstOrDefault(s => s.UserId == userId && s.Table.Equals(Name));
                if (sequenceIdRecord == null)
                {
                    database._SequenceId.Add(new SequenceIdRecord
                    {
                        UserId = userId,
                        Table = Name,
                        SequenceId = currentSequenceId,
                        Date = DateTime.Now
                    });
                }
                else if (sequenceIdRecord.SequenceId < currentSequenceId)
                {
                    sequenceIdRecord.SequenceId = currentSequenceId;
                }
            }

            if (IsDebug())
                Debug($"[{Name}] : Record {currentRecord.ToString()} added");

            return Tuple.Create(currentRecord, information);
        }

        /// <summary>
        /// Execute a request on updating into the database schema
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="area"></param>
        /// <param name="profile"></param>
        /// <param name="action"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns></returns>
        private Tuple<DSRecord, InformationRecord> UpdateRecord(DatabaseContext database, int tick, int customerId, int userId, string area, UserProfile.EUserProfile profile, string action, int? id, JObject record, JObject identity)
        {
            if (record["New"] == null ||
                record["Old"] == null ||
                identity["New"] == null ||
                identity["Old"] == null)
            {
                Error($"[{Name}] : On updating a record, the reference on Old and New record are missing!");
                throw new ExceptionDefinitionRecord("ERR_REQUEST_UPDATE_MISSING");
            }

            JObject oldRecord = record["Old"] as JObject;
            JObject newRecord = record["New"] as JObject;
            JObject oldIdentity = identity["Old"] as JObject;
            JObject newIdentity = identity["New"] as JObject;

            if (oldRecord == null || newRecord == null || oldIdentity == null || newIdentity == null)
            {
                Error($"[{Name}] : On updating a record, the reference on Old and New record are missing!");
                throw new ExceptionDefinitionRecord("ERR_REQUEST_UPDATE_MISSING");
            }

            // Get the previous and the next record

            DSRecord previousRecord = GetRecordFromClient(database, customerId, userId, area, profile, action, oldRecord, oldIdentity, false);
            DSRecord nextRecord = GetRecordFromClient(database, customerId, userId, area, profile, action, newRecord, newIdentity, true);

            if (previousRecord.Id != nextRecord.Id || previousRecord.Id < 0 || nextRecord.Id < 0 || previousRecord._deleted || nextRecord._deleted || id == null || id.Value != previousRecord.Id)
            {
                Error($"[{Name}] : On updating a record, Old and New records must represent the same record and this record can't be deleted!");
                throw new ExceptionDefinitionRecord("ERR_REQUEST_SYNCHRONIZED");
            }

            if (IsDebug())
                Debug($"[{Name}] : Updating record {previousRecord.ToString()} to {nextRecord.ToString()}");

            // Retrieve the existing record

            Tuple<DSRecord, InformationRecord> existingRecord = GetRecordById(database, (int)Columns[_indexKey].Property.GetValue(previousRecord));

            // The existing record must be the same record as the previousRecord ...
            // If these records are different, the record has been updated since the update from the client by another client

            if (!existingRecord.Item1.Equals(previousRecord))
            {
                Error($"[{Name}] : On updating a record, Old record and existing record into the database must be equal!");
                existingRecord.Item1.LogDifferences(previousRecord);
                throw new ExceptionDefinitionRecord("ERR_REQUEST_SYNCHRONIZED");
            }

            // Update the existing record within the new record (except _tick or _deleted)

            foreach (PropertyInfo property in Table.GetProperties())
            {
                if (property.Name.Equals("_tick") || property.Name.Equals("_deleted") || !property.CanWrite)
                    continue;

                object existingValue = property.GetValue(existingRecord.Item1);
                object nextValue = property.GetValue(nextRecord);

                if (property.PropertyType == typeof(string))
                {
                    if (existingValue == null && nextValue == null)
                        continue;

                    if (existingValue != null && nextValue == null && !existingValue.Equals(""))
                    {
                        if (IsDebug())
                            Debug($"[{Name}] : The previous value of property '{property.Name}' ({existingValue.ToString()}) is replaced by NULL");
                        property.SetValue(existingRecord.Item1, nextValue);
                        continue;
                    }

                    if (existingValue == null && nextValue != null && !nextValue.Equals(""))
                    {
                        if (IsDebug())
                            Debug($"[{Name}] : The previous value of property '{property.Name}' is set to '{nextValue.ToString()}'");
                        property.SetValue(existingRecord.Item1, nextValue);
                        continue;
                    }

                    if (existingValue != null && nextValue != null && !existingValue.Equals(nextValue))
                    {
                        if (IsDebug())
                            Debug($"[{Name}] : The previous value of property '{property.Name}' ({existingValue.ToString()}) is replaced by '{nextValue.ToString()}'");
                        property.SetValue(existingRecord.Item1, nextValue);
                        continue;
                    }
                }
                else
                {
                    if (existingValue == null && nextValue == null)
                        continue;

                    if (existingValue != null && nextValue == null)
                    {
                        if (IsDebug())
                            Debug($"[{Name}] : The previous value of property '{property.Name}' ({existingValue.ToString()}) is replaced by NULL");
                        property.SetValue(existingRecord.Item1, nextValue);
                        continue;
                    }

                    if (existingValue == null && nextValue != null)
                    {
                        if (IsDebug())
                            Debug($"[{Name}] : The previous value of property '{property.Name}' is set to '{nextValue.ToString()}'");
                        property.SetValue(existingRecord.Item1, nextValue);
                        continue;
                    }

                    if (property.PropertyType == typeof(byte[]) && !(existingValue as byte[]).SequenceEqual(nextValue as byte[]))
                    {
                        if (IsDebug())
                            Debug($"[{Name}] : The previous value of property '{property.Name}' ({existingValue.ToString()}) is replaced by '{nextValue.ToString()}'");
                        property.SetValue(existingRecord.Item1, nextValue);
                        continue;
                    }

                    if (property.PropertyType != typeof(byte[]) && !existingValue.Equals(nextValue))
                    {
                        if (IsDebug())
                            Debug($"[{Name}] : The previous value of property '{property.Name}' ({existingValue.ToString()}) is replaced by '{nextValue.ToString()}'");
                        property.SetValue(existingRecord.Item1, nextValue);
                        continue;
                    }
                }
            }

            // update information attached to this record

            if (existingRecord.Item2 == null)
            {
                // no information existing ... create a new one

                InformationRecord information = new InformationRecord
                {
                    Table = Name,
                    Id = previousRecord.Id,
                    CustomerId = customerId,
                    UpdateTick = tick,
                    UpdateUserId = userId,
                    UpdateDate = DateTime.Now
                };

                database._Information.Add(information);

                existingRecord = Tuple.Create(existingRecord.Item1, information);
            }
            else
            {
                // update information attached to this record

                existingRecord.Item2.UpdateTick = tick;
                existingRecord.Item2.UpdateUserId = userId;
                existingRecord.Item2.UpdateDate = DateTime.Now;
            }

            // the update is done

            existingRecord.Item1._tick = tick;

            if (IsDebug())
                Debug($"[{Name}] : Record {existingRecord.Item1.ToString()} updated");

            return existingRecord;
        }

        /// <summary>
        /// Execute a request on deletion into the database schema
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="area"></param>
        /// <param name="profile"></param>
        /// <param name="action"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns></returns>
        private Tuple<DSRecord, InformationRecord> DeleteRecord(DatabaseContext database, int tick, int customerId, int userId, string area, UserProfile.EUserProfile profile, string action, int? id, JObject record, JObject identity)
        {
            // Get the previous and the next record

            DSRecord currentRecord = GetRecordFromClient(database, customerId, userId, area, profile, action, record, identity, false);

            if (currentRecord.Id < 0 || currentRecord._deleted || id == null || id.Value != currentRecord.Id)
            {
                Error($"[{Name}] : On deleting a record, the record must already exists!");
                throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
            }

            if (IsDebug())
                Debug($"[{Name}] : Deleting record {currentRecord.ToString()}");

            // Retrieve the existing record

            Tuple<DSRecord, InformationRecord> existingRecord = GetRecordById(database, (int)Columns[_indexKey].Property.GetValue(currentRecord));

            // The existing record must be the same record as the record to delete ...
            // If these records are different, the record has been updated since the update from the client by another client

            if (!existingRecord.Item1.Equals(currentRecord))
            {
                Error($"[{Name}] : On deleting a record, record and existing record into the database must be equal!");
                existingRecord.Item1.LogDifferences(currentRecord);
                throw new ExceptionDefinitionRecord("ERR_REQUEST_SYNCHRONIZED");
            }

            // update information attached to this record

            if (existingRecord.Item2 == null)
            {
                // no information existing ... create a new one

                InformationRecord information = new InformationRecord
                {
                    Table = Name,
                    Id = currentRecord.Id,
                    CustomerId = customerId,
                    UpdateTick = tick,
                    UpdateUserId = userId,
                    UpdateDate = DateTime.Now,
                    DeleteTick = tick,
                    DeleteUserId = userId,
                    DeleteDate = DateTime.Now
                };

                database._Information.Add(information);

                existingRecord = Tuple.Create(existingRecord.Item1, information);
            }
            else
            {
                // update information attached to this record

                existingRecord.Item2.DeleteTick = tick;
                existingRecord.Item2.DeleteUserId = userId;
                existingRecord.Item2.DeleteDate = DateTime.Now;
            }

            // the deletion is done

            existingRecord.Item1._tick = tick;
            existingRecord.Item1._deleted = true;

            if (IsDebug())
                Debug($"[{Name}] : Record {existingRecord.Item1.ToString()} Deleted");

            return existingRecord;
        }

        #endregion

        /// <summary>
        /// Convert the table into JSON
        /// </summary>
        /// <param name="area">if null, all tables, else tables and columns having the restriction to the area</param>
        /// <param name="profile">if None, all tables, else tables and columns having the restriction to the profile</param>
        /// <returns></returns>
        public JObject ToJSON(string area, UserProfile.EUserProfile profile)
        {
            if (DSRestrictedAttribute.IsRestricted(Restriction, area, profile, null))
                return null;

            JObject result = new JObject
            {
                ["Name"] = Name,
                ["Area"] = Area,
                ["Columns"] = new JArray(Columns.Select(column => column.ToJSON(area, profile)).Where(column => column != null).ToArray())
            };
            return result;
        }

        /// <summary>
        /// Retrieve for all data contains into the table without any filter
        /// </summary>
        /// <param name="database"></param>
        /// <param name="customerId"></param>
        /// <returns></returns>
        public IEnumerable<Tuple<DSRecord, InformationRecord>> ReadRecords(DatabaseContext database, int customerId)
        {
            IEnumerable<DSRecord> records = null;
            if (Property.GetValue(database) is IEnumerable<DSRecordWithCustomerId> recordsWithCustomerId)
                records = customerId < 0 ? recordsWithCustomerId : recordsWithCustomerId.Where(r => r.CustomerId == customerId);
            else
                records = Property.GetValue(database) as IEnumerable<DSRecord>;

            var query = from record in records
                        join information in database._Information.Where(info => info.Table.Equals(Name)) on record.Id equals information.Id into gj
                        from subInformation in gj.DefaultIfEmpty()
                        select new { Record = record, Information = subInformation };

            if (customerId < 0)
            {
                foreach (var v in query.ToList())
                {
                    if (v.Record is DSRecordWithCustomerId recordWithCustomer)
                        yield return Tuple.Create(v.Record, v.Information ?? new InformationRecord() { Table = Name, Id = v.Record.Id, CustomerId = recordWithCustomer.CustomerId });
                    else
                        yield return Tuple.Create(v.Record, v.Information ?? new InformationRecord() { Table = Name, Id = v.Record.Id, CustomerId = -1 });
                }
            }
            else
            {
                foreach (var v in query.ToList())
                    yield return Tuple.Create(v.Record, v.Information ?? new InformationRecord() { Table = Name, Id = v.Record.Id, CustomerId = customerId });
            }
        }

        /// <summary>
        /// Retrieve a given record
        /// </summary>
        /// <param name="database"></param>
        /// <param name="id"></param>
        /// <param name="customerId"></param>
        /// <returns></returns>
        public Tuple<DSRecord, InformationRecord> GetRecord(DatabaseContext database, int id, int customerId)
        {
            Tuple<DSRecord, InformationRecord> currentRecord = GetRecordById(database, id);

            if (currentRecord == null || currentRecord.Item1 == null)
                return null;

            if (currentRecord.Item1 != null && currentRecord.Item2 != null)
                return currentRecord;

            return Tuple.Create(currentRecord.Item1, new InformationRecord() { Table = Name, Id = currentRecord.Item1.Id, CustomerId = customerId });
        }

        /// <summary>
        /// Retrieve for each row in the database for the current table,
        /// Each columns within only the expected columns due to the restriction in area and profile
        /// </summary>
        /// <param name="database"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="profile"></param>
        /// <param name="area"></param>
        /// <param name="id"></param>
        /// <param name="existingRecords">Define it to replace the loading into the database</param>
        /// <returns></returns>
        public IEnumerable<object[]> ReadTable(DatabaseContext database, int customerId, int userId, UserProfile.EUserProfile profile, string area, int? id, List<DSRecord> existingRecords)
        {
            if (DSRestrictedAttribute.IsRestricted(Restriction, area, profile, null))
                yield break;

            // Select the list of columns

            DSColumn[] schemaColumns = Columns.Where(c => !DSRestrictedAttribute.IsRestricted(c.Restriction, area, profile, null)).ToArray();
            int nbSchemaColumns = schemaColumns.Length;

            // Build a cache to stored data attached ...

            DSCache cache = database.GetCache();
            cache.SetBefore("");

            // Looking for the column containing the key

            int i = 0;

            // Build the list of fields for each record

            Errors errors = new Errors();
            bool conversionOK = true;

            // If the cache manager is enabled, load data from the cache and not from the database

            if (DatabaseCacheManager.Instance.IsEnable)
            {
                foreach (Tuple<DSRecord, InformationRecord> element in DatabaseCacheManager.Instance.GetRecords(Name, customerId))
                {
                    DSRecord record = element.Item1;

                    // Is this record concerned by the current user ?

                    if (id != null && record.Id != id)
                        continue;

                    database.GetListRecordsConcernedByUpdate(cache, Name, record.Id, customerId, userId, profile, area, false, record, element.Item2);
                    if (cache.Is(Name, record.Id) != true)
                        continue;

                    if (!DSAllowAttribute.IsAllowed(Allow, area, profile, "Read", userId, record))
                        continue;

                    // Retrieve the current record and add 3 columns (tick, delete, createdId)

                    object[] columns = new object[nbSchemaColumns + 3];
                    for (i = 0; i < nbSchemaColumns; i++)
                    {
                        object value = schemaColumns[i].Property.GetValue(record);

                        columns[i] = schemaColumns[i].ConvertToJSON(value, errors, out conversionOK);

                        if (!conversionOK || errors.HasError)
                            throw new ExceptionDefinitionRecord($"Conversion of the value '{value.ToString()}' of the column '{schemaColumns[i].Property.Name}' in the record '{JsonConvert.SerializeObject(record)}' has failed", errors);
                    }

                    // Retrieve the information and complete the columns

                    InformationRecord information = element.Item2;

                    if (information == null)
                    {
                        columns[i++] = null;
                        columns[i++] = false;
                        columns[i++] = null;
                    }
                    else if (information.DeleteTick == null)
                    {
                        columns[i++] = information.UpdateTick ?? information.CreateTick ?? null;
                        columns[i++] = false;
                        columns[i++] = information.CreateUserId == userId ? information.CreateId : null;
                    }
                    else
                    {
                        columns[i++] = information.DeleteTick.Value;
                        columns[i++] = true;
                        columns[i++] = information.CreateUserId == userId ? information.CreateId : null;
                    }

                    yield return columns;
                }
            }
            else
            {
                IEnumerable<DSRecord> records = null;
                if (existingRecords != null)
                    records = existingRecords as IEnumerable<DSRecord>;
                else if (Property.GetValue(database) is IEnumerable<DSRecordWithCustomerId> recordsWithCustomerId)
                    records = recordsWithCustomerId.Where(r => r.CustomerId == customerId);
                else
                    records = Property.GetValue(database) as IEnumerable<DSRecord>;

                var query = from record in records
                            join information in database._Information.Where(info => info.Table.Equals(Name)) on record.Id equals information.Id into gj
                            from subInformation in gj.DefaultIfEmpty()
                            select new { Record = record, Information = subInformation };

                foreach (var v in query.ToList())
                {
                    DSRecord record = v.Record;

                    // Is this record concerned by the current user ?

                    if (id != null && record.Id != id)
                        continue;

                    if (existingRecords == null)
                    {
                        database.GetListRecordsConcernedByUpdate(cache, Name, record.Id, customerId, userId, profile, area, false, record, v.Information);
                        if (cache.Is(Name, record.Id) != true)
                            continue;

                        if (!DSAllowAttribute.IsAllowed(Allow, area, profile, "Read", userId, record))
                            continue;
                    }

                    // Retrieve the current record and add 3 columns (tick, delete, createdId)

                    object[] columns = new object[nbSchemaColumns + 3];
                    for (i = 0; i < nbSchemaColumns; i++)
                    {
                        object value = schemaColumns[i].Property.GetValue(record);

                        columns[i] = schemaColumns[i].ConvertToJSON(value, errors, out conversionOK);

                        if (!conversionOK || errors.HasError)
                            throw new ExceptionDefinitionRecord($"Conversion of the value '{value.ToString()}' of the column '{schemaColumns[i].Property.Name}' in the record '{JsonConvert.SerializeObject(record)}' has failed", errors);
                    }

                    // Retrieve the information and complete the columns

                    InformationRecord information = v.Information;

                    if (information == null)
                    {
                        columns[i++] = null;
                        columns[i++] = false;
                        columns[i++] = null;
                    }
                    else if (information.DeleteTick == null)
                    {
                        columns[i++] = information.UpdateTick ?? information.CreateTick ?? null;
                        columns[i++] = false;
                        columns[i++] = information.CreateUserId == userId ? information.CreateId : null;
                    }
                    else
                    {
                        columns[i++] = information.DeleteTick.Value;
                        columns[i++] = true;
                        columns[i++] = information.CreateUserId == userId ? information.CreateId : null;
                    }

                    yield return columns;
                }
            }
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
            if (!DSAllowAttribute.IsAllowed(Allow, area, profile, "Read", userId, record))
                return null;

            if (DSRestrictedAttribute.IsRestricted(Restriction, area, profile, null))
                return null;

            Errors errors = new Errors();
            bool conversionOK = true;

            // Build a record within only the list of authorized attributes

            JObject result = new JObject();
            foreach (DSColumn column in Columns)
            {
                if (DSRestrictedAttribute.IsRestricted(column.Restriction, area, profile, null))
                    continue;

                object value = column.ConvertToJSON(column.Property.GetValue(record), errors, out conversionOK);

                if (!conversionOK || errors.HasError)
                {
                    Error($"Conversion of the value '{value.ToString()}' of the column '{column.Property.Name}' in the record '{record.ToString()}' has failed");
                    throw new ExceptionDefinitionRecord("Unable to convert a value", errors);
                }

                result[column.Property.Name] = new JValue(value);
            }

            // add _tick and _deleted

            result["_tick"] = record._tick;
            result["_deleted"] = record._deleted;

            return result;
        }

        /// <summary>
        /// Look for the record Id of the request
        /// </summary>
        /// <param name="database"></param>
        /// <param name="userId"></param>
        /// <param name="action"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns></returns>
        public int GetRecordId(DatabaseContext database, int userId, string action, JObject record, JObject identity)
        {
            int recordServerId = -1;
            int recordClientId = -1;

            switch (action)
            {
                case "Create":
                case "Delete":
                    if (record[Columns[_indexKey].Property.Name] != null && record[Columns[_indexKey].Property.Name].Type == JTokenType.Integer)
                        recordServerId = record[Columns[_indexKey].Property.Name].ToObject<int>();

                    if (identity[Columns[_indexKey].Property.Name] != null && identity[Columns[_indexKey].Property.Name].Type == JTokenType.Integer)
                        recordClientId = identity[Columns[_indexKey].Property.Name].ToObject<int>();

                    break;

                case "Update":
                    if (record["New"] != null && record["New"][Columns[_indexKey].Property.Name] != null && record["New"][Columns[_indexKey].Property.Name].Type == JTokenType.Integer)
                        recordServerId = record["New"][Columns[_indexKey].Property.Name].ToObject<int>();

                    if (identity["New"] != null && identity["New"][Columns[_indexKey].Property.Name] != null && identity["New"][Columns[_indexKey].Property.Name].Type == JTokenType.Integer)
                        recordClientId = identity["New"][Columns[_indexKey].Property.Name].ToObject<int>();

                    break;
            }

            if (recordServerId < 0 && recordClientId >= 0)
            {
                InformationRecord information = database._Information.FirstOrDefault(info => info.CreateId == recordClientId && info.CreateUserId == userId && info.Table.Equals(this.Name));
                if (information != null)
                    recordServerId = information.Id;
            }

            return recordServerId;
        }

        /// <summary>
        /// Execute a pretreatement before exeucting the request on the database schema (Create, Update or Delete a record for the current table)
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="area"></param>
        /// <param name="profile"></param>
        /// <param name="action"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns></returns>
        public void OnBeforeExecuteRequest(DatabaseContext database, int tick, int customerId, int userId, string area, UserProfile.EUserProfile profile, string action, int id, JObject record, JObject identity)
        {
            switch (action)
            {
                case "Create":
                    _databaseSchema.OnBeforeCreateRecord(database, tick, this.Name, id, record, identity);
                    return;

                case "Update":
                    _databaseSchema.OnBeforeUpdateRecord(database, tick, this.Name, id, record, identity);
                    return;

                case "Delete":
                    _databaseSchema.OnBeforeDeleteRecord(database, tick, this.Name, id, record, identity);
                    return;
            }
        }

        /// <summary>
        /// Execute a request on the database schema (Create, Update or Delete a record for the current table)
        /// on depends on the restriction view for the area and the profile
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="area"></param>
        /// <param name="profile"></param>
        /// <param name="action"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns></returns>
        public Tuple<DSRecord, InformationRecord> ExecuteRequest(DatabaseContext database, int tick, int customerId, int userId, string area, UserProfile.EUserProfile profile, string action, int id, JObject record, JObject identity)
        {
            if (DSRestrictedAttribute.IsRestricted(Restriction, area, profile, action))
                throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");

            switch(action)
            {
                case "Create":
                    return CreateRecord(database, tick, customerId, userId, area, profile, action, id, record, identity);

                case "Update":
                    return UpdateRecord(database, tick, customerId, userId, area, profile, action, id, record, identity);

                case "Delete":
                    return DeleteRecord(database, tick, customerId, userId, area, profile, action, id, record, identity);
            }

            return _databaseSchema.ExecuteRequestCustom(database, tick, customerId, userId, area, profile, Name, action, id, record, identity);
        }

        /// <summary>
        /// Execute a request on the database schema (Create, Update or Delete a record for the current table)
        /// on depends on the restriction view for the area and the profile
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="area"></param>
        /// <param name="profile"></param>
        /// <param name="action"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <returns></returns>
        public void OnAfterExecuteRequest(DatabaseContext database, int tick, int customerId, int userId, string area, UserProfile.EUserProfile profile, string action, int id, DSRecord record)
        {
            switch (action)
            {
                case "Create":
                    _databaseSchema.OnAfterCreateRecord(database, tick, this.Name, record);
                    return;

                case "Update":
                    _databaseSchema.OnAfterUpdateRecord(database, tick, this.Name, record);
                    return;

                case "Delete":
                    _databaseSchema.OnAfterDeleteRecord(database, tick, this.Name, record);
                    return;
            }
        }

        /// <summary>
        /// Build the list of columns and properties of the given table
        /// </summary>
        /// <param name="databaseSchema"></param>
        /// <param name="propertyTable"></param>
        /// <param name="table"></param>
        public DSTable(DSDatabase databaseSchema, PropertyInfo propertyTable, Type table)
        {
            _databaseSchema = databaseSchema;
            Property = propertyTable;
            Table = table;
            Columns = new List<DSColumn>();
            ColumnsByName = new Dictionary<string, DSColumn>();
            Restriction = new List<DSRestrictedAttribute>();
            Allow = new List<DSAllowAttribute>();

            // Retrieve table name from the class definition (class name or the table name in MVC)

            Name = table.Name;
            Area = DSDatabase.GetArea(table.Namespace);
            foreach (object annotation in table.GetCustomAttributes(true))
            {
                if (typeof(TableAttribute).IsInstanceOfType(annotation))
                    Name = (annotation as TableAttribute).Name;
                else if (typeof(DSRestrictedAttribute).IsInstanceOfType(annotation))
                    Restriction.Add(annotation as DSRestrictedAttribute);
                else if (typeof(DSAllowAttribute).IsInstanceOfType(annotation))
                    Allow.Add(annotation as DSAllowAttribute);
            }

            // Create an instance of the record (table) to get default values for each properties

            object instance = table.GetConstructor(Type.EmptyTypes).Invoke(new object[] { });

            // For each column, look for the list of checks to do

            var properties = table.GetProperties();
            foreach (PropertyInfo property in properties)
            {
                // ignore all properties started by "_" because it defines client information

                if (property.Name.StartsWith("_") || property.PropertyType.IsNotPublic || !property.CanWrite)
                    continue;

                bool mapped = true;

                foreach (object annotation in property.GetCustomAttributes(true))
                {
                    if (typeof(NotMappedAttribute).IsInstanceOfType(annotation))
                    {
                        mapped = false;
                        break;
                    }
                }

                if (!mapped)
                    continue;

                DSColumn column = new DSColumn(databaseSchema, Name, property, instance);
                Columns.Add(column);
                ColumnsByName.Add(property.Name, column);
            }
            _indexKey = GetIndexKey(Columns.ToArray());

            // In case of history, retrieve the source table

            if (Name.StartsWith("History") && table.GetProperty("HistoryId") != null && databaseSchema.Schema.GetProperty(Name.Substring(7)) != null)
            {
                PropertyInfo sourceTableProperty = databaseSchema.Schema.GetProperty(Name.Substring(7));

                // Only DbSet<X> contains a table
                // Ignore private, protected tables or properties started with "_"

                if (sourceTableProperty.PropertyType.IsGenericType &&
                    sourceTableProperty.PropertyType.GetGenericTypeDefinition() == typeof(DbSet<>) &&
                    !sourceTableProperty.Name.StartsWith("_") &&
                    !sourceTableProperty.PropertyType.IsNotPublic &&
                    sourceTableProperty.PropertyType.GetGenericArguments().First().IsSubclassOf(typeof(DSRecord)))
                {
                    // Ignore record not inheritence of DSRecord
                    SourceTable = sourceTableProperty.PropertyType.GetGenericArguments().First();
                    if (SourceTable != null)
                    {
                        SourceTableName = SourceTable.Name;

                        foreach (object annotation in SourceTable.GetCustomAttributes(true))
                        {
                            if (typeof(TableAttribute).IsInstanceOfType(annotation))
                                SourceTableName = (annotation as TableAttribute).Name;
                        }
                    }
                }
            }
        }
    }
}
