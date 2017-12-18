using Syncytium.Common.Database.DSModel;
using System;
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

namespace Syncytium.Common.Database.DSSchema
{
    /// <summary>
    /// Handle for every tuple (connectionId, table, id) the flag IsConcerned and the record
    /// 
    /// Before and After the execution of a request or a list of requests
    /// 
    /// Retrieve the difference between Before and After
    /// </summary>
    public class DSCache
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected virtual string MODULE => typeof(DSCache).Name;

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        protected bool IsVerbose() => Logger.LoggerManager.Instance.IsVerbose;

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="message"></param>
        protected void Verbose(string message) => Logger.LoggerManager.Instance.Verbose(MODULE, (_currentConnection == null ? "" : (_currentConnection + ":")) + message);

        /// <summary>
        /// Indicates if the debug mode is enabled or not
        /// </summary>
        /// <returns></returns>
        protected bool IsDebug() => Logger.LoggerManager.Instance.IsDebug;

        /// <summary>
        /// Log a debug message
        /// </summary>
        /// <param name="message"></param>
        protected void Debug(string message) => Logger.LoggerManager.Instance.Debug(MODULE, (_currentConnection == null ? "" : (_currentConnection + ":")) + message);

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        protected void Info(string message) => Logger.LoggerManager.Instance.Info(MODULE, (_currentConnection == null ? "" : (_currentConnection + ":")) + message);

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        protected void Warn(string message) => Logger.LoggerManager.Instance.Warn(MODULE, (_currentConnection == null ? "" : (_currentConnection + ":")) + message);

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        protected void Error(string message) => Logger.LoggerManager.Instance.Error(MODULE, (_currentConnection == null ? "" : (_currentConnection + ":")) + message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        protected void Exception(string message, System.Exception ex) => Logger.LoggerManager.Instance.Exception(MODULE, (_currentConnection == null ? "" : (_currentConnection + ":")) + message, ex);

        #endregion

        /// <summary>
        /// Handle the list of tables by order of priority
        /// </summary>
        public List<String> Tables { get; } = new List<string>();

        /// <summary>
        /// Build a reverse list before running the difference
        /// </summary>
        private List<String> _reverseTables = null;

        /// <summary>
        /// Indicates if it's before / after the execution requests
        /// </summary>
        private bool _before = true;

        /// <summary>
        /// Handle a cache of DSRecord for the status before (to avoid too much allocation memory)
        /// </summary>
        private Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord>>> _recordBefore { get; } = new Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord>>>();

        /// <summary>
        /// Handle a cache of DSRecord for the status after(to avoid too much allocation memory)
        /// </summary>
        private Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord>>> _recordAfter { get; } = new Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord>>>();

        /// <summary>
        /// Handle a cache of DSRecord for a connectionId before/after the request execution
        /// </summary>
        private Dictionary<string, Dictionary<string, Dictionary<int, Tuple<bool, DSRecord, bool, DSRecord>>>> _differences { get; } = new Dictionary<string, Dictionary<string, Dictionary<int, Tuple<bool, DSRecord, bool, DSRecord>>>>();

        /// <summary>
        /// Reference on the current cache (_connectionId, old or new)
        /// </summary>
        private Dictionary<string, Dictionary<int, Tuple<bool, DSRecord, bool, DSRecord>>> _currentDifference { get; set; } = null;

        /// <summary>
        /// Reference on the current cache (_connectionId, old or new)
        /// </summary>
        private Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord>>> _currentRecords { get; set; } = null;

        /// <summary>
        /// Store the current connectionId
        /// </summary>
        private string _currentConnection = null;

        /// <summary>
        /// Set the current cache to the cache corresponding before execution requests
        /// </summary>
        /// <param name="connectionId"></param>
        virtual public void SetBefore(string connectionId)
        {
            _currentConnection = connectionId;
            if (IsDebug() && !_currentConnection.Equals(""))
                Debug("Evaluating the status just before executing the request ...");

            if (!_differences.ContainsKey(connectionId))
                _differences[connectionId] = new Dictionary<string, Dictionary<int, Tuple<bool, DSRecord, bool, DSRecord>>>();

            _currentDifference = _differences[connectionId];
            _currentRecords = _recordBefore;
            _before = true;
        }

        /// <summary>
        /// Set the current cache to the cache corresponding after execution requests
        /// </summary>
        /// <param name="connectionId"></param>
        virtual public void SetAfter(string connectionId)
        {
            _currentConnection = connectionId;
            if (IsDebug() && !_currentConnection.Equals(""))
                Debug("Evaluating the status just after executing the request ...");

            if (!_differences.ContainsKey(connectionId))
                _differences[connectionId] = new Dictionary<string, Dictionary<int, Tuple<bool, DSRecord, bool, DSRecord>>>();

            _currentDifference = _differences[connectionId];
            _currentRecords = _recordAfter;
            _before = false;
        }

        /// <summary>
        /// Retrieve a record stored into the cache to avoid to read it into the database
        /// </summary>
        /// <param name="dbContext"></param>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        virtual public Tuple<DSRecord, InformationRecord> GetRecord(DatabaseContext dbContext, string table, int id)
        {
            if (_currentRecords == null)
                return null;

            if (_currentRecords.ContainsKey(table))
            {
                Dictionary<int, Tuple<DSRecord, InformationRecord>> currentTable = _currentRecords[table];
                if (currentTable.ContainsKey(id))
                    return currentTable[id];
            }

            Tuple<DSRecord, InformationRecord> cacheRecord = DatabaseCacheManager.Instance.GetRecord(dbContext, table, id);
            if (cacheRecord == null)
                return null;

            return SetRecord(dbContext, table, id, cacheRecord.Item1, cacheRecord.Item2);
        }

        /// <summary>
        /// Set a new record into the cache to avoid to read it multiply into the database
        /// </summary>
        /// <param name="dbContext"></param>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="informationAlreadyRead"></param>
        /// <returns></returns>
        virtual public Tuple<DSRecord, InformationRecord> SetRecord(DatabaseContext dbContext, string table, int id, DSRecord record, InformationRecord informationAlreadyRead)
        {
            if (_currentRecords == null || record == null)
                return null;

            if (!_currentRecords.ContainsKey(table))
                _currentRecords[table] = new Dictionary<int, Tuple<DSRecord, InformationRecord>>();

            Dictionary<int, Tuple<DSRecord, InformationRecord>> currentTable = _currentRecords[table];
            if (!currentTable.ContainsKey(id))
            {
                DSRecord newRecord = DSRecord.Copy(record);

                InformationRecord information = informationAlreadyRead;
                if (informationAlreadyRead == null || !informationAlreadyRead.Table.Equals(table) || informationAlreadyRead.Id != id)
                    information = dbContext._Information.Find(table, record.Id);

                if (information != null)
                {
                    newRecord._deleted = information.IsDeleted;
                    newRecord._tick = information.Tick;
                }

                currentTable[id] = Tuple.Create(newRecord, information);
            }

            return currentTable[id];
        }

        /// <summary>
        /// Retrieve the status of the couple (table, id)
        /// </summary>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        virtual public bool? Is(string table, int id)
        {
            if (_currentDifference == null)
                return null;

            if (!_currentDifference.ContainsKey(table))
                return null;

            Dictionary<int, Tuple<bool, DSRecord, bool, DSRecord>> currentTable = _currentDifference[table];
            if (!currentTable.ContainsKey(id))
                return null;

            Tuple<bool, DSRecord, bool, DSRecord> currentTuple = currentTable[id];
            if (currentTuple == null)
                return null;

            if (_before)
            {
                if (!currentTuple.Item1)
                    return null;

                return currentTuple.Item2 != null;
            }

            if (!currentTuple.Item3)
                return null;

            return currentTuple.Item4 != null;
        }

        /// <summary>
        /// Update the status of the couple (table, id)
        /// </summary>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        virtual public bool Set(string table, int id, DSRecord record)
        {
            if (_currentDifference == null)
                return false;

            if (!_currentDifference.ContainsKey(table))
            {
                _currentDifference[table] = new Dictionary<int, Tuple<bool, DSRecord, bool, DSRecord>>();
                if (Tables.IndexOf(table) < 0)
                    Tables.Add(table);
            }

            Dictionary<int, Tuple<bool, DSRecord, bool, DSRecord>> currentTable = _currentDifference[table];
            if (!currentTable.ContainsKey(id))
                currentTable[id] = Tuple.Create(false, null as DSRecord, false, null as DSRecord);

            Tuple<bool, DSRecord, bool, DSRecord> currentTuple = currentTable[id];

            if (_before)
            {
                currentTable[id] = Tuple.Create(true, record ?? currentTuple.Item2, currentTuple.Item3, currentTuple.Item4);
                return currentTable[id].Item2 != null;
            }

            currentTable[id] = Tuple.Create(currentTuple.Item1, currentTuple.Item2, true, record ?? currentTuple.Item4);
            return currentTable[id].Item4 != null;
        }

        /// <summary>
        /// Retrieve the list of differences into the cache for a given connection
        /// </summary>
        /// <param name="connectionId"></param>
        /// <returns></returns>
        virtual public List<Tuple<string, DSRecord, DSRecord>> GetDifferences(string connectionId)
        {
            _currentConnection = connectionId;

            List<Tuple<string, DSRecord, DSRecord>> differences = new List<Tuple<string, DSRecord, DSRecord>>();

            if (IsDebug())
                Debug("Building the difference ...");

            if (!_differences.ContainsKey(connectionId))
            {
                Debug("No differences ...");
                return differences;
            }

            if (_reverseTables == null)
            {
                _reverseTables = new List<string>(Tables);
                _reverseTables.Reverse();
            }

            Dictionary<string, Dictionary<int, Tuple<bool, DSRecord, bool, DSRecord>>> record = _differences[connectionId];

            // Element added

            foreach (string table in Tables)
            {
                if (!record.ContainsKey(table))
                    continue;

                Dictionary<int, Tuple<bool, DSRecord, bool, DSRecord>> currentTable = record[table];

                foreach (KeyValuePair<int, Tuple<bool, DSRecord, bool, DSRecord>> currentRecord in currentTable)
                {
                    if ((currentRecord.Value.Item2 == null && currentRecord.Value.Item4 != null) ||
                        (currentRecord.Value.Item2 != null && currentRecord.Value.Item4 != null &&
                         currentRecord.Value.Item2._deleted && !currentRecord.Value.Item4._deleted))
                        differences.Add(Tuple.Create(table, null as DSRecord, currentRecord.Value.Item4));
                }
            }

            // Element updated

            foreach (string table in Tables)
            {
                if (!record.ContainsKey(table))
                    continue;

                Dictionary<int, Tuple<bool, DSRecord, bool, DSRecord>> currentTable = record[table];

                foreach (KeyValuePair<int, Tuple<bool, DSRecord, bool, DSRecord>> currentRecord in currentTable)
                {
                    if (currentRecord.Value.Item2 != null && currentRecord.Value.Item4 != null &&
                        currentRecord.Value.Item2._deleted == currentRecord.Value.Item4._deleted &&
                        !currentRecord.Value.Item2.Equals(currentRecord.Value.Item4))
                        differences.Add(Tuple.Create(table, currentRecord.Value.Item2, currentRecord.Value.Item4));
                }
            }

            // Element delete

            foreach (string table in _reverseTables)
            {
                if (!record.ContainsKey(table))
                    continue;

                Dictionary<int, Tuple<bool, DSRecord, bool, DSRecord>> currentTable = record[table];

                foreach (KeyValuePair<int, Tuple<bool, DSRecord, bool, DSRecord>> currentRecord in currentTable)
                {
                    if (currentRecord.Value.Item2 != null && !currentRecord.Value.Item2._deleted &&
                        (currentRecord.Value.Item4 == null || currentRecord.Value.Item4._deleted))
                        differences.Add(Tuple.Create(table, currentRecord.Value.Item2, null as DSRecord));
                }
            }

            if (IsDebug())
                Debug($"{differences.Count} differences ...");

            return differences;
        }

        /// <summary>
        /// Empty constructor
        /// </summary>
        public DSCache() { }
    }
}
