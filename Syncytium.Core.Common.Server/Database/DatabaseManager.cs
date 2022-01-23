using Syncytium.Core.Common.Server.Database.DSModel;
using Syncytium.Core.Common.Server.Database.DSSchema;
using Syncytium.Core.Common.Server.Exception;
using Syncytium.Core.Common.Server.Managers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Data.Entity.Infrastructure;

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
    /// This class treats each resquest from a client (WebAPI REST or Web navigator client)
    /// </summary>
    public sealed class DatabaseManager : IDisposable
    {
        /// <summary>
        /// Reference on the current database
        /// </summary>
        public readonly DatabaseContext Database;

        /// <summary>
        /// Reference on the user manager
        /// </summary>
        private readonly IUserManager _userManager;

        /// <summary>
        /// Connection Id of this instance
        /// </summary>
        private readonly string _connectionId = string.Empty;

        /// <summary>
        /// User Id of this instance
        /// </summary>
        private readonly int _userId;

        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static readonly string MODULE = typeof(DatabaseManager).Name;

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
        private void Debug(string message) => LoggerManager.Instance.Debug(MODULE, $"{_connectionId} [{_userId}] => {message}");

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        private void Info(string message) => LoggerManager.Instance.Info(MODULE, $"{_connectionId} [{_userId}] => {message}");

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        private void Warn(string message) => LoggerManager.Instance.Warn(MODULE, $"{_connectionId} [{_userId}] => {message}");

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        private void Error(string message) => LoggerManager.Instance.Error(MODULE, $"{_connectionId} [{_userId}] => {message}");

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        private void Exception(string message, System.Exception ex) => LoggerManager.Instance.Exception(MODULE, $"{_connectionId} [{_userId}] => {message}", ex);

        #endregion

        #region IDisposable

        /// <summary>
        /// Dispose this instance
        /// </summary>
        public void Dispose()
        {
            Database.Dispose();
        }

        #endregion

        /// <summary>
        /// When a new client is connected to the server, store the new connection into the database
        /// </summary>
        /// <param name="alreadyConnected"></param>
        /// <returns></returns>
        public void OpenConnection(bool alreadyConnected)
        {
            ConnectionRecord? existingConnection = Database._Connection?.FirstOrDefault(c => c.ConnectionId.Equals(_connectionId));
            if (existingConnection != null)
            {
                existingConnection.Machine = Environment.MachineName;

                Info($"The connection is already opened on another machine ... The connection '{existingConnection}' is updated");
            }
            else
            {
                ConnectionRecord newConnection = new()
                {
                    ConnectionId = _connectionId,
                    UserId = _userId,
                    Machine = Environment.MachineName,
                    Status = false,
                    ConnectionDate = DateTime.Now,
                    ConnectionLast = DateTime.Now
                };

                // retrieve user's profile

                if (newConnection.UserId == -1 || _userManager == null)
                {
                    // it's the administrator defined in web.config

                    newConnection.Profile = UserProfile.EUserProfile.Administrator;
                    newConnection.CustomerId = 0;
                }
                else
                {
                    // it's a user defined into the database

                    IUser user = _userManager.GetById(newConnection.UserId);
                    if (user != null)
                    {
                        newConnection.Profile = UserProfile.EUserProfile.None;
                        newConnection.Area = null;
                        newConnection.CustomerId = user.CustomerId;
                    }
                }

                // check if the user is already connected within another connection

                newConnection.Allow = !alreadyConnected;

                Info($"A connection '{newConnection}' is opened");
                Database._Connection?.Add(newConnection);
            }

            Database.SaveChanges();
        }

        /// <summary>
        /// The client starts the initialization process and has to declare its area
        /// </summary>
        /// <param name="area"></param>
        /// <param name="moduleId"></param>
        /// <returns>the database schema correspnding to the user's profile and its area:
        ///     Version         = database version
        ///     Schema          = database schema
        ///     DefaultLanguage = default language (user's language or default language of the application)
        ///     User            = user's profile
        ///     LastRequestId   = last request id of the user
        /// </returns>
        public JObject Initialize(string area, int moduleId)
        {
            string defaultLanguage = "FR";
            int versionDatabase = 0;
            int lastRequestId = 0;

            Info($"Initializing connection within the area '{area}' ({moduleId}) ...");

            if (_userManager == null)
            {
                Error("Unable to open the connection. UserManager is undefined!");
                throw new ExceptionDefinitionRecord("ERR_CONNECTION");
            }

            // Retrieve database information

            defaultLanguage = ConfigurationManager.DefaultLanguage;
            ParameterRecord? parameterVersion = Database._Parameter?.FirstOrDefault(p => p.Key.Equals("Database.Version"));
            if (parameterVersion != null)
                versionDatabase = int.Parse(parameterVersion.Value);

            // Retrieve the current user and its language

            IUser user = _userManager.GetById(_userId);
            if (user == null)
            {
                Warn("The user doesn't exist!");
                throw new ExceptionDefinitionRecord("ERR_CONNECTION");
            }

            IModule module = _userManager.GetModule(user, moduleId);
            if (module == null)
            {
                Warn("The module doesn't exist!");
                throw new ExceptionDefinitionRecord("ERR_CONNECTION");
            }

            // Retrieve the connection

            ConnectionRecord? currentConnection = Database._Connection?.FirstOrDefault(c => c.ConnectionId.Equals(_connectionId) &&
                                                                                            c.Machine.Equals(Environment.MachineName));
            if (currentConnection == null)
            {
                Warn("The connection doesn't exist. Open the new connection!");
                throw new ExceptionDefinitionRecord("ERR_CONNECTION");
            }

            // Retrieve the database schema

            DSDatabase schema = ConfigurationManager.Schemas[area];
            if (schema == null)
            {
                Error("No schema available!");
                throw new ExceptionDefinitionRecord("ERR_SCHEMA");
            }

            // Is this connection authorized to start the dialog ?

            if (!currentConnection.Allow)
            {
                Error("Not allowed!");
                throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
            }

            // Retrieve the last requestId of this user

            RequestIdRecord? requestId = Database._RequestId?.FirstOrDefault(r => r.UserId == _userId);
            if (requestId != null)
                lastRequestId = requestId.RequestId;

            // Set the area of the connection and notify that the connection is initialized

            currentConnection.Area = area;
            currentConnection.ModuleId = module.Id;
            currentConnection.Profile = module.Profile;
            currentConnection.Status = true;
            currentConnection.ConnectionLast = DateTime.Now;
            Database.SaveChanges();
            Info($"The connection '{currentConnection}' is linked to the area '{area}'");

            // define the response

            JObject result = new()
            {
                ["Version"] = versionDatabase,
                ["Schema"] = schema.ToJSON(area, currentConnection.Profile, Database.GetCache(schema)),
                ["DefaultLanguage"] = defaultLanguage,
                ["CurrentUserId"] = user == null ? -1 : user.Id,
                ["CurrentModuleId"] = moduleId,
                ["LastRequestId"] = lastRequestId
            };
            JObject settings = new();
            foreach (KeyValuePair<string, string?> setting in ConfigurationManager.Settings)
            {
                if (!setting.Key.StartsWith("DSP.Client."))
                    continue;

                settings[setting.Key["DSP.Client.".Length..]] = setting.Value;
            }
            result["Parameters"] = settings;

            return result;
        }

        /// <summary>
        /// Retrieve the last sequence id of a table
        /// </summary>
        /// <param name="table"></param>
        /// <returns></returns>
        public int LastSequenceId(string table)
        {
            SequenceIdRecord? sequenceId = Database._SequenceId?.FirstOrDefault(r => r.UserId == _userId && r.Table.Equals(table));
            return sequenceId != null ? sequenceId.SequenceId : 0;
        }


        /// <summary>
        /// Load the content of the table and returns a list of columns matching within the area and the profile of the user
        /// </summary>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="profile"></param>
        /// <param name="area"></param>
        /// <param name="table"></param>
        /// <param name="existingRecords">Define it to replace the loading into the database</param>
        /// <returns>The table records:
        ///     Table          = table name
        ///     Records        = List of tuple containing all data
        ///     LastSequenceId = Last sequence id of the user in this table
        /// </returns>
        public IEnumerable<JArray> LoadTable(int customerId, int userId, UserProfile.EUserProfile profile, string area, string table, List<DSRecord> existingRecords)
        {
            List<JArray> records = new();

            Info($"Loading content of the table '{table}' ...");

            // Retrieve the database schema

            DSDatabase schema = ConfigurationManager.Schemas[area];
            if (schema == null)
            {
                Error("No schema available!");
                throw new ExceptionDefinitionRecord("ERR_SCHEMA");
            }

            // Read the content of the given table

            System.Runtime.Serialization.Formatters.Binary.BinaryFormatter formatter = new();
            long lotSize = ConfigurationManager.ConnectionLotSize;
            long sizeTotal = 0;
            long sizeRecord = 0;
            long nbRecords = 0;

            foreach (object?[] record in schema.ReadTable(Database, table, customerId, userId, profile, area, null, existingRecords))
            {
                JArray jRecords = new();
                foreach (object? currentRecord in record)
                    if (currentRecord != null)
                        jRecords.Add(currentRecord);
                records.Add(jRecords);

                using (Stream s = new MemoryStream())
                {
#pragma warning disable SYSLIB0011 // Le type ou le membre est obsolète
                    formatter.Serialize(s, record); // TODO : Check the size of the component
#pragma warning restore SYSLIB0011 // Le type ou le membre est obsolète
                    sizeRecord = s.Length;
                }

                sizeTotal += sizeRecord;
                nbRecords++;

                if ( sizeTotal >= lotSize )
                {
                    yield return new JArray(records);
                    records.Clear();
                    sizeTotal = 0;
                }
            }

            if ( sizeTotal > 0)
                yield return new JArray(records);

            Info($"{nbRecords} records read from the table '{table}'");
        }

        /// <summary>
        /// Execute a list of requests from a client
        /// </summary>
        /// <param name="transaction"></param>
        /// <returns>RequestId, Error, Record</returns>
        public List<Tuple<DSRecord, InformationRecord?>> ExecuteTransaction(DSTransaction transaction)
        {
            Info($"Executing the transaction [{transaction.RequestId}] containing {transaction.Requests.Count} requests ...");

            List<Tuple<DSRecord, InformationRecord?>> recordsTreated = new();
            List<Tuple<string, DSRecord, InformationRecord?>> recordsToUpdate = new();

            // Retrieve the database schema

            DSDatabase schema = ConfigurationManager.Schemas[transaction.Area];
            if (schema == null)
            {
                Error("No schema available!");
                throw new ExceptionDefinitionRecord("ERR_SCHEMA");
            }

            // Lock database during the execution of the request

            using (DatabaseLock lockDatabase = Database.Lock(transaction.CustomerId))
            {
                try
                {
                    if (IsVerbose())
                        Verbose("Getting the first tick of the transaction ...");

                    // Get the tick

                    string tickKey = $"Database.Tick.{transaction.CustomerId}";
                    int tick = 0;
                    ParameterRecord? tickRecord = Database._Parameter?.FirstOrDefault(p => p.Key.Equals(tickKey));
                    if (tickRecord == null)
                    {
                        tickRecord = new ParameterRecord { Key = tickKey, Value = transaction.Requests.Count.ToString() };
                        tickRecord = Database._Parameter?.Add(tickRecord);
                    }
                    else
                    {
                        tick = int.Parse(tickRecord.Value);
                        tickRecord.Value = (tick + (transaction.Requests.Count)).ToString();
                    }
                    Database.SaveChanges();

                    if (IsDebug())
                        Debug($"First tick is {tick}");

                    // Execute the OnBefore trigger

                    if (IsVerbose())
                        Verbose("Executing the pre-request of the transaction ...");

                    transaction.SetNewTick(tick);

                    foreach (DSRequest request in transaction.Requests)
                    {
                        // Execute the request

                        if (IsVerboseAll())
                            Verbose($"Executing the pre-request[{request.Id}] with tick[{request.NewTick}]: {request} ...");

                        // Execute the trigger before requesting

                        schema.OnBeforeExecuteRequest(Database, request.NewTick, 
                                                                transaction.CustomerId, transaction.UserId, transaction.Area, transaction.Profile, 
                                                                request.Table, request.Action, request.RecordId, request.Record, request.Identity);
                    }

                    if (IsDebug())
                        Debug($"Pre-request executed for {transaction.Requests.Count} requests");

                    // Execute each request

                    if (IsVerbose())
                        Verbose("Executing the transaction ...");

                    // Execution by lot

                    List<RequestTableRecord> actions = new();

                    int index = 0;
                    foreach (List<DSRequest> lot in transaction.LotRequests)
                    {
                        // Execute the lot of requests

                        if (IsVerbose())
                            Verbose($"Executing the lot[{index}] with {lot.Count} requests ...");

                        // Execute the lot of requests

                        recordsTreated.AddRange(schema.ExecuteRequest(Database, transaction, lot));

                        // Saving data

                        Database.SaveChanges();

                        index++;
                    }

                    if (IsVerbose())
                        Verbose("Building the list of actions ...");

                    index = 0;
                    foreach (DSRequest request in transaction.Requests)
                    {
                        Tuple<DSRecord, InformationRecord?> recordTreated = recordsTreated[index];

                        // Keep in memory all records executed

                        recordsToUpdate.Add(Tuple.Create(request.Table, recordTreated.Item1, recordTreated.Item2));

                        // The request is correctly executed ... Store a new request

                        actions.Add(new RequestTableRecord
                        {
                            Tick = request.NewTick,
                            CustomerId = transaction.CustomerId,
                            UserId = transaction.UserId,
                            RequestId = transaction.RequestId,
                            Table = request.Table,
                            Action = request.Action,
                            Id = (recordTreated == null || recordTreated.Item1 == null ? -1 : recordTreated.Item1.Id)
                        });

                        Info($"The request[{request.Id}] has correctly been executed : {(recordTreated == null ? "null" : recordTreated.ToString())}");

                        index++;
                    }

                    if (IsDebug())
                        Debug($"Transaction executed with {transaction.Requests.Count} requests");

                    // Write actions into the RequestTable

                    if (IsVerbose())
                        Verbose($"Writing {actions.Count} actions into the RequestTable ...");

                    Database._RequestTable?.AddRange(actions);
                    Database.SaveChanges();

                    if (IsDebug())
                        Debug($"{actions.Count} actions written into the RequestTable");

                    // Execute the OnAfter trigger

                    if (IsVerbose())
                        Verbose("Executing the post-request of the transaction ...");

                    foreach (DSRequest request in transaction.Requests)
                    {
                        // Execute the request

                        if (IsVerboseAll())
                            Verbose($"Executing the post-request[{request.Id}] with tick[{request.NewTick}]: {request} ...");

                        // Execute the trigger before requesting

                        DSRecord record = recordsTreated[request.Id].Item1;
                        if ( record != null )
                            schema.OnAfterExecuteRequest(Database, request.NewTick,
                                                                   transaction.CustomerId, transaction.UserId, transaction.Area, transaction.Profile,
                                                                   request.Table, request.Action, record.Id, record);
                    }

                    if (IsDebug())
                        Debug($"Post-request executed for {transaction.Requests.Count} requests");

                    // Unlock the database and commit all changes

                    if (IsVerbose())
                        Verbose("Committing changes ...");

                    lockDatabase.Commit();

                    if (IsVerbose())
                        Verbose("Changes committed");

                    // Update the cache manager

                    if (IsVerbose())
                        Verbose("Updating cache ...");

                    DatabaseCacheManager.Instance.UpdateCache(recordsToUpdate, transaction.CustomerId, tick + transaction.Requests.Count);

                    if (IsVerbose())
                        Verbose("Cache updated");
                }
                catch (System.Exception ex)
                {
                    Exception("An exception occurs on executing the transaction", ex);

                    bool saveFailed = false;

                    do
                    {
                        saveFailed = false;
                        try
                        {
                            Database.SaveChanges();
                        }
                        catch (DbUpdateException ex2)
                        {
                            saveFailed = true;
                            ex2.Entries.Single().Reload();
                        }
                    }
                    while (saveFailed);

                    // Rollback all request already executed

                    throw;
                }
            }

            Info("Transaction done");

            return recordsTreated;
        }

        /// <summary>
        /// Execute a service from a client
        /// </summary>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="profile"></param>
        /// <param name="area"></param>
        /// <param name="moduleId"></param>
        /// <param name="service"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns>Data</returns>
        public JObject? ExecuteService(int customerId, int userId, UserProfile.EUserProfile profile, string area, int moduleId, string service, JObject? record, JObject? identity)
        {
            JObject? result = null;

            Info($"Executing the service: ['{service}', '{(record == null ? "null" : record.ToString(Formatting.None))}', '{(identity == null ? "null" : identity.ToString(Formatting.None))}'] ...");

            // Lock database during the execution of the service

            using (DatabaseLock lockDatabase = Database.Lock(customerId))
            {
                // Execute the request

                try
                {
                    result = Database.ExecuteService(customerId, userId, profile, area, moduleId, service, record, identity);

                    // Unlock the database

                    lockDatabase.Commit();
                }
                catch (System.Exception ex)
                {
                    Exception("An exception occurs on executing the service", ex);

                    // Rollback the requests done

                    throw;
                }
            }

            Info($"The service has correctly been executed : {(result == null ? "null" : result.ToString(Formatting.None))}");

            return result;
        }

        /// <summary>
        /// When a client is disconnected to the server, remove the previous connection into the database
        /// </summary>
        /// <returns></returns>
        public void CloseConnection()
        {
            if (IsDebug())
                Debug("The connection is closing ...");

            ConnectionRecord? currentConnection = Database._Connection?.FirstOrDefault(c => c.ConnectionId.Equals(_connectionId) &&
                                                                                           c.Machine.Equals(Environment.MachineName));
            if (currentConnection == null)
            {
                Warn("The connection is not closed because it's not in the list of connections!");
                return;
            }

            Database._Connection?.Remove(currentConnection);
            Database.SaveChanges();
            Info("The connection is closed");
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="database"></param>
        /// <param name="userManager"></param>
        /// <param name="connectionId"></param>
        /// <param name="userId"></param>
        public DatabaseManager(DatabaseContext database, IUserManager userManager, string connectionId, int userId)
        {
            Database = database;
            _userManager = userManager;
            _connectionId = connectionId;
            _userId = userId;
        }
    }
}