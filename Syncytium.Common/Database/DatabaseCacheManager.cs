using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Database.DSSchema;
using Syncytium.Common.Managers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

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

namespace Syncytium.Common.Database
{
    /// <summary>
    /// Singleton cache the content of the database into memory
    /// Limit this usage for some tables to avoid too much memory
    /// </summary>
    public class DatabaseCacheManager : IDisposable
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static readonly string MODULE = typeof(DatabaseCacheManager).Name;

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
        /// Instance of the current random manager
        /// </summary>
        private static DatabaseCacheManager _instance;

        /// <summary>
        /// Indicate if the cache is enabled or not
        /// </summary>
        private bool _enable { get; }

        /// <summary>
        /// Notify if the cache manager is enabled
        /// </summary>
        public bool IsEnable => _enable;

        /// <summary>
        /// Reference on a function to get the database on depends on the area
        /// </summary>
        /// <param name="area"></param>
        public delegate DatabaseContext FunctionGetDatabase(string area);

        /// <summary>
        /// The last tick loaded into the cache per customer
        /// </summary>
        private Dictionary<int, int> _tick { get; } = new Dictionary<int, int>();

        /// <summary>
        /// Handle a cache of DSRecord (per customer, per table and per Id)
        /// </summary>
        private Dictionary<int, Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord>>>> _records { get; } = new Dictionary<int, Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord>>>>();

        /// <summary>
        /// Keep in memory the list of tables loaded into the cache
        /// </summary>
        private Dictionary<string, DSTable> _tables { get; } = new Dictionary<string, DSTable>();

        /// <summary>
        /// Mutex protecting the critical section
        /// </summary>
        private SemaphoreSlim _mutex = null;

        /// <summary>
        /// Mutex protecting the critical section for the customer only
        /// </summary>
        private Dictionary<int, SemaphoreSlim> _mutexes = new Dictionary<int, SemaphoreSlim>();

        /// <summary>
        /// Constructor of the cache manager
        /// </summary>
        private DatabaseCacheManager()
        {
            _mutex = new SemaphoreSlim(1);
            _enable = ConfigurationManager.DatabaseCache;
        }

        /// <summary>
        /// Lock the current customer
        /// </summary>
        /// <param name="customerId"></param>
        /// <param name="lockMaster"></param>
        private void Lock(int customerId, bool lockMaster = true)
        {
            if (lockMaster)
                _mutex.Wait(); // lock critical section

            if (!_mutexes.ContainsKey(customerId))
                _mutexes[customerId] = new SemaphoreSlim(1);

            if (lockMaster)
                _mutex.Release(); // unlock critical section

            _mutexes[customerId].Wait(); // lock critical section dedicated to the current customer
        }

        /// <summary>
        /// Unlock the current customer
        /// </summary>
        /// <param name="customerId"></param>
        private void Unlock(int customerId)
        {
            if (!_mutexes.ContainsKey(customerId))
                return;

            _mutexes[customerId].Release(); // unlock critical section dedicated to the current customer
        }

        /// <summary>
        /// Dispose the lock
        /// </summary>
        public void Dispose()
        {
            if (_mutex != null)
                _mutex.Dispose();
            _mutex = null;

            foreach (KeyValuePair<int, SemaphoreSlim> mutex in _mutexes)
            {
                if (mutex.Value != null)
                    mutex.Value.Dispose();
            }

            _mutexes = new Dictionary<int, SemaphoreSlim>();
        }

        /// <summary>
        /// Retrieve the current tick into the database for the given customer
        /// </summary>
        /// <param name="database"></param>
        /// <param name="customerId"></param>
        /// <returns></returns>
        public int GetTick(DatabaseContext database, int customerId)
        {
            string tickKey = $"Database.Tick.{customerId}";
            ParameterRecord parameter = database._Parameter.SingleOrDefault(e => e.Key.Equals(tickKey));
            if (parameter == null)
                return 0;

            if (!int.TryParse(parameter.Value, out int tick))
                return 0;

            return tick;
        }

        /// <summary>
        /// Load all data in once ...
        /// </summary>
        /// <param name="database"></param>
        /// <param name="customerIds">All customers Id to load</param>
        /// <param name="getDatabase"></param>
        public void Initialize(DatabaseContext database, List<int> customerIds, FunctionGetDatabase getDatabase)
        {
            if (!_enable)
            {
                Info($"No cache enabled ...");
                return;
            }

            if (_tables.Count == 0)
            {
                Debug("Initializing tables into the cache ...");

                foreach (KeyValuePair<string, DSDatabase> schema in ConfigurationManager.Schemas)
                {
                    foreach (KeyValuePair<string, DSTable> table in schema.Value.Tables)
                    {
                        if (_tables.ContainsKey(table.Key))
                            continue;

                        Verbose($"Initializing the table '{table.Key}' ({table.Value.Area}) ...");
                        _tables[table.Key] = table.Value;
                    }
                }

                Info($"{_tables.Count} tables initialized");
            }

            // Building the cache for all customers

            _mutex.Wait(); // lock critical section

            foreach (int customerId in customerIds)
            {
                Lock(customerId, false);

                // Build and clean the cache for the customers and lock all customers ...

                Debug($"[{customerId}] Initializing tables ...");

                Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord>>> currentCache = new Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord>>>();
                _records[customerId] = currentCache; // replace the cache already existing

                foreach (KeyValuePair<string, DSTable> table in _tables)
                    currentCache[table.Key] = new Dictionary<int, Tuple<DSRecord, InformationRecord>>();
            }

            _mutex.Release(); // unlock critical section

            // Loading all data

            foreach (string area in _tables.Select(t => t.Value.Area).Distinct())
            {
                if (area == null)
                    continue;

                try
                {
                    using (DatabaseContext currentContext = getDatabase(area))
                    {
                        // Load data into the current cache

                        foreach (KeyValuePair<string, DSTable> table in _tables.Where(t => t.Value.Area.Equals(area)))
                        {
                            try
                            {
                                int nbRecords = 0;

                                Debug($"Loading table '{table.Key}' ...");

                                // Load all records between the last tick and the new one (only for request successfully executed)

                                foreach (Tuple<DSRecord, InformationRecord> record in table.Value.ReadRecords(currentContext, -1))
                                {
                                    currentContext.Entry(record.Item1).State = System.Data.Entity.EntityState.Detached;
                                    currentContext.Entry(record.Item2).State = System.Data.Entity.EntityState.Detached;

                                    if (record.Item2.CustomerId < 0)
                                    {
                                        foreach (int customerId in customerIds)
                                            _records[customerId][table.Key][record.Item1.Id] = record;
                                        nbRecords++;
                                    }
                                    else if (customerIds.IndexOf(record.Item2.CustomerId) >= 0)
                                    {
                                        _records[record.Item2.CustomerId][table.Key][record.Item1.Id] = record;
                                        nbRecords++;
                                    }
                                }

                                Info($"{nbRecords} records read into the table '{table.Key}' ...");
                            }
                            catch (System.Exception ex)
                            {
                                Exception($"Unable to initialize the cache for the table '{table.Key}'", ex);
                            }
                        }
                    }
                }
                catch (System.Exception ex)
                {
                    Exception($"Unable to load the area {area}", ex);
                }
            }

            // Finalize the initialization of the cache for this customer

            foreach (int customerId in customerIds)
            {
                _tick[customerId] = GetTick(database, customerId);
                Info($"[{customerId}] Cache initialized in tick {_tick[customerId]}");
                Unlock(customerId);
            }
        }

        /// <summary>
        /// Load all data in once for one customer ...
        /// </summary>
        /// <param name="database"></param>
        /// <param name="customerId"></param>
        /// <param name="getDatabase"></param>
        public void Initialize(DatabaseContext database, int customerId, FunctionGetDatabase getDatabase)
        {
            if (!_enable)
            {
                Info($"[{customerId}] No cache enabled ...");
                return;
            }

            _mutex.Wait(); // lock critical section

            if (_tick.ContainsKey(customerId))
            {
                _mutex.Release(); // unlock critical section
                Warn($"[{customerId}] Data are still loaded!");
                return;
            }

            if (_tables.Count == 0)
            {
                Debug("Initializing tables into the cache ...");

                foreach (KeyValuePair<string, DSDatabase> schema in ConfigurationManager.Schemas)
                {
                    foreach (KeyValuePair<string, DSTable> table in schema.Value.Tables)
                    {
                        if (_tables.ContainsKey(table.Key))
                            continue;

                        Verbose($"Initializing the table '{table.Key}' ({table.Value.Area}) ...");
                        _tables[table.Key] = table.Value;
                    }
                }

                Info($"{_tables.Count} tables initialized");
            }

            Info($"[{customerId}] Loading data ...");

            // Build the cache for the customer

            Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord>>> currentCache = null;
            if (!_records.ContainsKey(customerId))
            {
                Debug($"[{customerId}] Initializing tables ...");

                currentCache = new Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord>>>();
                _records[customerId] = currentCache;

                foreach (KeyValuePair<string, DSTable> table in _tables)
                    currentCache[table.Key] = new Dictionary<int, Tuple<DSRecord, InformationRecord>>();
            }
            else
            {
                currentCache = _records[customerId];
            }

            Lock(customerId, false);
            _mutex.Release(); // unlock critical section

            // sort all tables by area ...

            foreach (string area in _tables.Select(t => t.Value.Area).Distinct())
            {
                if (area == null)
                    continue;

                try
                {
                    using (DatabaseContext currentContext = getDatabase(area))
                    {
                        // Load data into the current cache

                        foreach (KeyValuePair<string, DSTable> table in _tables.Where(t => t.Value.Area.Equals(area)))
                        {
                            try
                            {
                                Debug($"[{customerId}] Loading table '{table.Key}' ...");

                                // Load all records between the last tick and the new one (only for request successfully executed)

                                Dictionary<int, Tuple<DSRecord, InformationRecord>> currentTable = currentCache[table.Key];

                                foreach (Tuple<DSRecord, InformationRecord> record in table.Value.ReadRecords(currentContext, customerId))
                                {
                                    currentContext.Entry(record.Item1).State = System.Data.Entity.EntityState.Detached;
                                    currentContext.Entry(record.Item2).State = System.Data.Entity.EntityState.Detached;
                                    currentTable[record.Item1.Id] = record;
                                }

                                Info($"[{customerId}] {currentTable.Count} records read into the table '{table.Key}' ...");
                            }
                            catch (System.Exception ex)
                            {
                                Exception($"[{customerId}] Unable to initialize the cache", ex);
                            }
                        }
                    }
                }
                catch (System.Exception ex)
                {
                    Exception($"[{customerId}] Unable to load the area {area}", ex);
                }
            }

            // Finalize the initialization of the cache for this customer

            _tick[customerId] = GetTick(database, customerId);
            Info($"[{customerId}] Cache initialized in tick {_tick[customerId]}");

            Unlock(customerId);
        }

        /// <summary>
        /// Check if the last tick loaded is different, and only load differences ...
        /// </summary>
        /// <param name="database"></param>
        /// <param name="customerId"></param>
        /// <param name="getDatabase"></param>
        public void UpdateCache(DatabaseContext database, int customerId, FunctionGetDatabase getDatabase)
        {
            if (!_enable)
                return;

            // Check if the customer is currently loaded

            if (!_tick.ContainsKey(customerId))
                Initialize(database, customerId, getDatabase);

            // the current customer is available

            Lock(customerId); // lock critical section

            // If the tick into the cache is not the same as the current one ... update the cache manager

            int currentTick = GetTick(database, customerId);
            int previousTick = _tick[customerId];
            if (currentTick <= previousTick)
            {
                Unlock(customerId); // unlock critical section
                return;
            }

            Debug($"[{customerId}] Updating cache between {previousTick} and {currentTick} ...");
            int nbUpdates = 0;

            try
            {
                // Load all records between the last tick and the new one (only for request successfully executed)

                DSTable currentTable = null;
                Dictionary<int, Tuple<DSRecord, InformationRecord>> currentContent = null;
                foreach (RequestRecord request in database._Request.Where(r => r.CustomerId == customerId &&
                                                                               r.Id != null &&
                                                                               r.Acknowledge != null && r.Acknowledge.Value &&
                                                                               previousTick < r.Tick && r.Tick <= currentTick).ToList().OrderBy(r => r.Table).ThenBy(r => r.Id))
                {
                    // new table ?

                    if (currentTable == null || !currentTable.Name.Equals(request.Table))
                    {
                        currentTable = null;
                        currentContent = null;
                        if (!_tables.ContainsKey(request.Table))
                        {
                            if (IsVerbose())
                                Verbose($"[{customerId}] The table '{request.Table}' doesn't exist into the cache. May be, the table doesn't exist into the schemas");
                            continue;
                        }
                        currentTable = _tables[request.Table];
                        currentContent = _records[customerId][request.Table];
                    }

                    // read the current record

                    Tuple<DSRecord, InformationRecord> currentRecord = currentTable.GetRecord(database, request.Id.Value, customerId);
                    if (currentRecord == null)
                        continue;

                    // Update the cache

                    database.Entry(currentRecord.Item1).State = System.Data.Entity.EntityState.Detached;
                    database.Entry(currentRecord.Item2).State = System.Data.Entity.EntityState.Detached;
                    currentContent[request.Id.Value] = currentRecord;
                    nbUpdates++;
                }

                _tick[customerId] = currentTick;
            }
            catch (System.Exception ex)
            {
                Exception($"[{customerId}] Unable to update the cache", ex);
            }

            Info($"[{customerId}] {nbUpdates} records loaded between {previousTick} and {currentTick}");

            Unlock(customerId); // Unlock the critical section
        }

        /// <summary>
        /// Update the cache within the list of records updated by the transaction
        /// </summary>
        /// <param name="database"></param>
        /// <param name="records"></param>
        /// <param name="customerId"></param>
        /// <param name="tick"></param>
        public void UpdateCache(DatabaseContext database, List<Tuple<string, DSRecord, InformationRecord>> records, int customerId, int tick)
        {
            if (!_enable)
                return;

            Lock(customerId); // lock critical section

            // Check if the customer is currently loaded

            if (!_tick.ContainsKey(customerId))
            {
                Unlock(customerId); // unlock critical section
                return;
            }

            try
            {
                // Update the cache within the list of records from the transaction currently executed

                Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord>>> currentTable = _records[customerId];

                foreach (Tuple<string, DSRecord, InformationRecord> record in records)
                {
                    if (!_tables.ContainsKey(record.Item1))
                        continue;

                    database.Entry(record.Item2).State = System.Data.Entity.EntityState.Detached;
                    database.Entry(record.Item3).State = System.Data.Entity.EntityState.Detached;
                    currentTable[record.Item1][record.Item2.Id] = Tuple.Create(record.Item2, record.Item3);
                }

                _tick[customerId] = tick;

                if (IsDebug())
                    Debug($"[{customerId}] Cache updated in tick {_tick[customerId]}");
            }
            catch (System.Exception ex)
            {
                Exception($"[{customerId}] Unable to update the cache", ex);
            }

            Unlock(customerId); // unlock critical section
        }

        /// <summary>
        /// Retrieve a data into the cache, if the element doesn't exist into the cache, read data into database and update it 
        /// before retrieving it
        /// </summary>
        /// <param name="database"></param>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        public Tuple<DSRecord, InformationRecord> GetRecord(DatabaseContext database, string table, int id)
        {
            if (!_enable)
                return null;

            try
            {
                foreach (KeyValuePair<int, Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord>>>> customer in _records)
                {
                    if (!customer.Value.ContainsKey(table))
                        continue;

                    Lock(customer.Key); // lock critical section

                    Dictionary<int, Tuple<DSRecord, InformationRecord>> currentTable = customer.Value[table];
                    if (currentTable.ContainsKey(id))
                    {
                        Tuple<DSRecord, InformationRecord> currentRecord = currentTable[id];
                        Unlock(customer.Key); // unlock critical section
                        return currentRecord;
                    }

                    Unlock(customer.Key); // unlock critical section
                }
            }
            catch (System.Exception ex)
            {
                Exception($"Unable to retrieve the element expected ('{table}', {id})", ex);
            }

            return null;
        }

        /// <summary>
        /// Retrieve all elements of the table for a given customer
        /// </summary>
        /// <param name="table"></param>
        /// <param name="customerId"></param>
        /// <returns></returns>
        public List<Tuple<DSRecord, InformationRecord>> GetRecords(string table, int customerId)
        {
            List<Tuple<DSRecord, InformationRecord>> records = new List<Tuple<DSRecord, InformationRecord>>();

            if (!_enable)
                return records;

            Lock(customerId); // lock critical section

            if (IsVerbose())
                Verbose($"[{customerId}] Getting the record of the table '{table}' ...");

            // Check if the customer is currently loaded

            if (!_tick.ContainsKey(customerId))
            {
                Warn($"[{customerId}] Customer not defined!");
                Unlock(customerId); //unlock critical section
                return records;
            }

            // Read the content of the table

            Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord>>> currentRecords = _records[customerId];
            if (!currentRecords.ContainsKey(table))
            {
                Unlock(customerId); //unlock critical section
                return records;
            }

            Dictionary<int, Tuple<DSRecord, InformationRecord>> currentTable = currentRecords[table];
            foreach (KeyValuePair<int, Tuple<DSRecord, InformationRecord>> currentRecord in currentTable)
                records.Add(currentRecord.Value);

            if (IsDebug())
                Debug($"[{customerId}] {records.Count} records read into the table '{table}'");

            Unlock(customerId); //unlock critical section
            return records;
        }

        /// <summary>
        /// Retrieve the current instance or define a new instanceof DatabaseCacheManager
        /// </summary>
        public static DatabaseCacheManager Instance
        {
            get
            {
                if (_instance == null)
                    _instance = new DatabaseCacheManager();

                return _instance;
            }
        }
    }
}
