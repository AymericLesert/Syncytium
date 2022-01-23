using Syncytium.Core.Common.Server.Database.DSModel;
using Syncytium.Core.Common.Server.Database.DSSchema;
using Syncytium.Core.Common.Server.Managers;
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
        /// Indicates if the all verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsVerboseAll() => LoggerManager.Instance.IsVerboseAll;

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsVerbose() => LoggerManager.Instance.IsVerbose;

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="message"></param>
        private void Verbose(string message) => LoggerManager.Instance.Verbose(MODULE, message);

        /// <summary>
        /// Indicates if the debug mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsDebug() => LoggerManager.Instance.IsDebug;

        /// <summary>
        /// Log a debug message
        /// </summary>
        /// <param name="message"></param>
        private void Debug(string message) => LoggerManager.Instance.Debug(MODULE, message);

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        private void Info(string message) => LoggerManager.Instance.Info(MODULE, message);

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        private void Warn(string message) => LoggerManager.Instance.Warn(MODULE, message);

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        private void Error(string message) => LoggerManager.Instance.Error(MODULE, message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        private void Exception(string message, System.Exception ex) => LoggerManager.Instance.Exception(MODULE, message, ex);

        #endregion

        /// <summary>
        /// Instance of the current random manager
        /// </summary>
        private static DatabaseCacheManager? _instance = null;

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
        private Dictionary<int, Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord?>>>> _records { get; } = new Dictionary<int, Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord?>>>>(10);

        /// <summary>
        /// Keep in memory the list of tables loaded into the cache
        /// </summary>
        private Dictionary<string, DSTable> _tables { get; } = new Dictionary<string, DSTable>();

        /// <summary>
        /// Keep in memory the list of ids get by (CreateId, CreateUserId, Table)
        /// </summary>
        private Dictionary<int, Dictionary<int, Dictionary<String, int>>> _ids { get; } = new Dictionary<int, Dictionary<int, Dictionary<String, int>>>();

        /// <summary>
        /// Cache of tables to load on GetRecords
        /// </summary>
        private Dictionary<int, Dictionary<String, Dictionary<int, List<Tuple<DSRecord, InformationRecord?>>>>> _cacheTable { get; } = new Dictionary<int, Dictionary<String, Dictionary<int, List<Tuple<DSRecord, InformationRecord?>>>>>();

        /// <summary>
        /// Mutex protecting the critical section
        /// </summary>
        private readonly SemaphoreSlim _mutex = new(1);

        /// <summary>
        /// Mutex protecting the critical section for the customer only
        /// </summary>
        private Dictionary<int, SemaphoreSlim> _mutexes = new();

        /// <summary>
        /// Constructor of the cache manager
        /// </summary>
        private DatabaseCacheManager()
        {
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

            foreach (KeyValuePair<int, SemaphoreSlim> mutex in _mutexes)
            {
                if (mutex.Value != null)
                    mutex.Value.Dispose();
            }

            _mutexes = new Dictionary<int, SemaphoreSlim>();

            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Clean up all tables loaded into the cache
        /// </summary>
        /// <param name="customerId"></param>
        public void CleanUpCacheTable(int customerId)
        {
            if (_cacheTable.ContainsKey(customerId))
                _cacheTable[customerId].Clear();
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
            ParameterRecord? parameter = database._Parameter?.SingleOrDefault(e => e.Key.Equals(tickKey));
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

                Debug($"Initializing tables for the customer '{customerId}' ...");

                Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord?>>> currentCache = new(_tables.Count);
                _records[customerId] = currentCache; // replace the cache already existing

                foreach (KeyValuePair<string, DSTable> table in _tables)
                    currentCache[table.Key] = new Dictionary<int, Tuple<DSRecord, InformationRecord?>>();
            }

            _mutex.Release(); // unlock critical section

            // Loading all data

            foreach (string area in _tables.Select(t => t.Value.Area).Distinct())
            {
                if (area == null)
                    continue;

                Debug($"Loading tables from the area '{area}' ...");

                try
                {
                    // Load data into the current cache

                    using DatabaseContext currentContext = getDatabase(area);
                    foreach (KeyValuePair<string, DSTable> table in _tables.Where(t => t.Value.Area.Equals(area)))
                    {
                        Debug($"Loading table '{table.Key}' ...");

                        try
                        {
                            int nbRecords = 0;

                            // Load all records between the last tick and the new one (only for request successfully executed)

                            foreach (Tuple<DSRecord, InformationRecord> record in table.Value.ReadRecords(currentContext))
                            {
                                if (record.Item2 != null && record.Item2.CustomerId < 0)
                                {
                                    foreach (int customerId in customerIds)
                                        _records[customerId][table.Key][record.Item1.Id] = Tuple.Create<DSRecord, InformationRecord?>(record.Item1, record.Item2);
                                    nbRecords++;
                                }
                                else if (record.Item2 != null && customerIds.IndexOf(record.Item2.CustomerId) >= 0)
                                {
                                    _records[record.Item2.CustomerId][table.Key][record.Item1.Id] = Tuple.Create<DSRecord, InformationRecord?>(record.Item1, record.Item2);
                                    nbRecords++;
                                }
                            }

                            Info($"{nbRecords} records read into the table '{table.Key}' ...");

                            GC.Collect();
                        }
                        catch (System.Exception ex)
                        {
                            Exception($"Unable to initialize the cache for the table '{table.Key}'", ex);
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
                CleanUpCacheTable(customerId);

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

            Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord?>>> currentCache;
            if (!_records.ContainsKey(customerId))
            {
                Debug($"[{customerId}] Initializing tables ...");

                currentCache = new Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord?>>>(_tables.Count);
                _records[customerId] = currentCache;

                foreach (KeyValuePair<string, DSTable> table in _tables)
                    currentCache[table.Key] = new Dictionary<int, Tuple<DSRecord, InformationRecord?>>(table.Value.Capacity);
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

                Debug($"Loading tables from the area '{area}' ...");

                try
                {
                    // Load data into the current cache

                    using DatabaseContext currentContext = getDatabase(area);
                    foreach (KeyValuePair<string, DSTable> table in _tables.Where(t => t.Value.Area.Equals(area)))
                    {
                        try
                        {
                            Debug($"[{customerId}] Loading table '{table.Key}' ...");

                            // Load all records between the last tick and the new one (only for request successfully executed)

                            Dictionary<int, Tuple<DSRecord, InformationRecord?>> currentTable = currentCache[table.Key];

                            foreach (Tuple<DSRecord, InformationRecord> record in table.Value.ReadRecords(currentContext, customerId))
                            {
                                currentTable[record.Item1.Id] = Tuple.Create<DSRecord, InformationRecord?>(record.Item1, record.Item2);
                            }

                            Info($"[{customerId}] {currentTable.Count} records read into the table '{table.Key}'");

                            GC.Collect();
                        }
                        catch (System.Exception ex)
                        {
                            Exception($"[{customerId}] Unable to initialize the cache", ex);
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

            CleanUpCacheTable(customerId);

            Unlock(customerId);
        }

        /// <summary>
        /// Reload the content of a table into the cache
        /// </summary>
        /// <param name="database"></param>
        /// <param name="customerId"></param>
        /// <param name="table"></param>
        public void Reload(DatabaseContext database, int customerId, string table)
        {
            if (!_enable)
                return;

            // Check if the reload data is possible

            if (!_tick.ContainsKey(customerId) || !_tables.ContainsKey(table) || !_records.ContainsKey(customerId))
                return;

            // Clean up cache of the table

            Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord?>>> currentCache = _records[customerId];
            if (!currentCache.ContainsKey(table))
                return;

            Debug($"Reloading table '{table}' into the cache for the customer '{customerId}' ...");

            Dictionary<int, Tuple<DSRecord, InformationRecord?>> currentCacheTable = currentCache[table];
            currentCacheTable.Clear();

            // Update the content of the cache

            DSTable currentTable = _tables[table];
            foreach (Tuple<DSRecord, InformationRecord> record in currentTable.ReadRecords(database, customerId))
            {
                currentCacheTable[record.Item1.Id] = Tuple.Create<DSRecord, InformationRecord?>(record.Item1, record.Item2);
            }

            Info($"[{customerId}] {currentCacheTable.Count} records read into the table '{table}'");

            CleanUpCacheTable(customerId);
            GC.Collect();
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

                DSTable? currentTable = null;
                Dictionary<int, Tuple<DSRecord, InformationRecord?>>? currentContent = null;

                if (database._RequestTable != null)
                {
                    foreach (RequestTableRecord request in database._RequestTable.Where(r => r.CustomerId == customerId &&
                                                                                   r.Id != null &&
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

                        if (request.Id == null)
                            continue;

                        Tuple<DSRecord, InformationRecord>? currentRecord = currentTable.GetRecord(database, request.Id.Value, customerId);
                        if (currentRecord == null)
                            continue;

                        // Update the cache

                        if (currentContent != null)
                            currentContent[request.Id.Value] = Tuple.Create<DSRecord, InformationRecord?>(currentRecord.Item1, currentRecord.Item2);
                        nbUpdates++;
                    }
                }

                _tick[customerId] = currentTick;
            }
            catch (System.Exception ex)
            {
                Exception($"[{customerId}] Unable to update the cache", ex);
            }

            Info($"[{customerId}] {nbUpdates} records loaded between {previousTick} and {currentTick}");
            CleanUpCacheTable(customerId);

            Unlock(customerId); // Unlock the critical section
        }

        /// <summary>
        /// Update the cache within the list of records updated by the transaction
        /// </summary>
        /// <param name="records"></param>
        /// <param name="customerId"></param>
        /// <param name="tick"></param>
        public void UpdateCache(List<Tuple<string, DSRecord, InformationRecord?>> records, int customerId, int tick)
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

                Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord?>>> currentTable = _records[customerId];

                foreach (Tuple<string, DSRecord, InformationRecord?> record in records)
                {
                    if (!currentTable.ContainsKey(record.Item1))
                        continue;

                    currentTable[record.Item1][record.Item2.Id] = Tuple.Create(DSRecord.Copy(record.Item2), record.Item3 != null ? InformationRecord.Copy(record.Item3) : null);
                }

                _tick[customerId] = tick;

                if (IsDebug())
                    Debug($"[{customerId}] Cache updated in tick {_tick[customerId]}");
            }
            catch (System.Exception ex)
            {
                Exception($"[{customerId}] Unable to update the cache", ex);
            }

            CleanUpCacheTable(customerId);
            Unlock(customerId); // unlock critical section
        }

        /// <summary>
        /// Retrieve a data into the cache, if the element doesn't exist into the cache, read data into database and update it 
        /// before retrieving it
        /// </summary>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        public Tuple<DSRecord, InformationRecord?>? GetRecord(string table, int id)
        {
            if (!_enable)
                return null;

            try
            {
                foreach (KeyValuePair<int, Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord?>>>> customer in _records)
                {
                    if (!customer.Value.ContainsKey(table))
                        continue;

                    Lock(customer.Key); // lock critical section

                    Dictionary<int, Tuple<DSRecord, InformationRecord?>> currentTable = customer.Value[table];
                    if (currentTable.ContainsKey(id))
                    {
                        Tuple<DSRecord, InformationRecord?> currentRecord = currentTable[id];
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
        /// <param name="cacheId">null if no cache used, else the id of the cache used to looking for the list of records</param>
        /// <returns></returns>
        public List<Tuple<DSRecord, InformationRecord?>> GetRecords(string table, int customerId, int? cacheId = null)
        {
            List<Tuple<DSRecord, InformationRecord?>> result;

            if (!_enable)
                return new List<Tuple<DSRecord, InformationRecord?>>();

            Lock(customerId); // lock critical section

            if (cacheId != null && _cacheTable.ContainsKey(customerId) && _cacheTable[customerId].ContainsKey(table) && _cacheTable[customerId][table].ContainsKey(cacheId.Value))
            {
                result = _cacheTable[customerId][table][cacheId.Value];
                Unlock(customerId); //unlock critical section
                return result;
            }

            // Dictionary<int, Dictionary<String, Dictionary<int, List<Tuple<DSRecord, InformationRecord>>>>>

            if (IsVerbose())
                Verbose($"[{customerId}] Getting the record of the table '{table}' ...");

            // Check if the customer is currently loaded

            if (!_tick.ContainsKey(customerId))
            {
                Warn($"[{customerId}] Customer not defined!");
                Unlock(customerId); //unlock critical section
                return new List<Tuple<DSRecord, InformationRecord?>>();
            }

            // Read the content of the table

            Dictionary<string, Dictionary<int, Tuple<DSRecord, InformationRecord?>>> currentRecords = _records[customerId];
            if (!currentRecords.ContainsKey(table))
            {
                Unlock(customerId); //unlock critical section
                return new List<Tuple<DSRecord, InformationRecord?>>();
            }

            result = new List<Tuple<DSRecord, InformationRecord?>>();
            result.AddRange(currentRecords[table].Select(x => x.Value));

            if (IsDebug())
                Debug($"[{customerId}] {result.Count} records read into the table '{table}' (Cache: {((cacheId == null) ? "None" : cacheId.ToString())})");

            if (cacheId != null)
            {
                if (!_cacheTable.ContainsKey(customerId))
                    _cacheTable[customerId] = new Dictionary<String, Dictionary<int, List<Tuple<DSRecord, InformationRecord?>>>>();

                if (!_cacheTable[customerId].ContainsKey(table))
                    _cacheTable[customerId][table] = new Dictionary<int, List<Tuple<DSRecord, InformationRecord?>>>();

                _cacheTable[customerId][table][cacheId.Value] = result;
            }

            Unlock(customerId); //unlock critical section
            return result;
        }

        /// <summary>
        /// Retrieve the Id by createId, createUserId and table name
        /// </summary>
        /// <param name="information"></param>
        /// <param name="createId"></param>
        /// <param name="createUserId"></param>
        /// <param name="table"></param>
        /// <returns>Id</returns>
        public int GetId(DbSet<InformationRecord>? information, int createId, int createUserId, string table)
        {
            _mutex.Wait();

            if (_ids.ContainsKey(createId))
            {
                Dictionary<int, Dictionary<string, int>> itemId = _ids[createId];
                if (itemId.ContainsKey(createUserId))
                {
                    Dictionary<string, int> itemUserId = itemId[createUserId];
                    if (itemUserId.ContainsKey(table))
                    {
                        int id = itemUserId[table];
                        _mutex.Release();
                        return id;
                    }
                }
            }

            InformationRecord? record = information?.FirstOrDefault(info => info.CreateId == createId && info.CreateUserId == createUserId && info.Table.Equals(table));

            _mutex.Release(); // unlock critical section

            if (record != null)
                return SetId(createId, createUserId, table, record.Id);

            return -1;
        }

        /// <summary>
        /// Update the Id
        /// </summary>
        /// <param name="createId"></param>
        /// <param name="createUserId"></param>
        /// <param name="table"></param>
        /// <param name="id"></param>
        public int SetId(int createId, int createUserId, string table, int id)
        {
            Dictionary<int, Dictionary<string, int>> itemId;
            Dictionary<string, int> itemUserId;

            _mutex.Wait();

            if (_ids.ContainsKey(createId))
            {
                itemId = _ids[createId];
            }
            else
            {
                itemId = new Dictionary<int, Dictionary<string, int>>();
                _ids[createId] = itemId;
            }

            if (itemId.ContainsKey(createUserId))
            {
                itemUserId = itemId[createUserId];
            }
            else
            {
                itemUserId = new Dictionary<string, int>();
                itemId[createUserId] = itemUserId;
            }

            itemUserId[table] = id;

            _mutex.Release(); // unlock critical section

            return id;
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
