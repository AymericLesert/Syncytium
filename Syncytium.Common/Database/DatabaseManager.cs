using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Exception;
using Syncytium.Common.Managers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;

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
    /// This class treats each resquest from a client (WebAPI REST or Web navigator client)
    /// </summary>
    public sealed class DatabaseManager : IDisposable
    {
        /// <summary>
        /// Reference on the current database
        /// </summary>
        public DatabaseContext Database = null;

        /// <summary>
        /// Reference on the user manager
        /// </summary>
        private IUserManager _userManager = null;

        /// <summary>
        /// Connection Id of this instance
        /// </summary>
        private string _connectionId = string.Empty;

        /// <summary>
        /// User Id of this instance
        /// </summary>
        private int _userId = -1;

        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static string MODULE = typeof(DatabaseManager).Name;

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
        private void Debug(string message) => Logger.LoggerManager.Instance.Debug(MODULE, $"{_connectionId} [{_userId}] => {message}");

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        private void Info(string message) => Logger.LoggerManager.Instance.Info(MODULE, $"{_connectionId} [{_userId}] => {message}");

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        private void Warn(string message) => Logger.LoggerManager.Instance.Warn(MODULE, $"{_connectionId} [{_userId}] => {message}");

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        private void Error(string message) => Logger.LoggerManager.Instance.Error(MODULE, $"{_connectionId} [{_userId}] => {message}");

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        private void Exception(string message, System.Exception ex) => Logger.LoggerManager.Instance.Exception(MODULE, $"{_connectionId} [{_userId}] => {message}", ex);

        #endregion

        #region IDisposable

        /// <summary>
        /// Dispose this instance
        /// </summary>
        public void Dispose()
        {
            if (Database != null)
                Database.Dispose();
            Database = null;
        }

        #endregion

        /// <summary>
        /// When a new client is connected to the server, store the new connection into the database
        /// </summary>
        /// <param name="alreadyConnected"></param>
        /// <returns></returns>
        public void OpenConnection(bool alreadyConnected)
        {
            ConnectionRecord existingConnection = Database._Connection.FirstOrDefault(c => c.ConnectionId.Equals(_connectionId));
            if (existingConnection != null)
            {
                existingConnection.Machine = Environment.MachineName;

                Info($"The connection is already opened on another machine ... The connection '{existingConnection.ToString()}' is updated");
            }
            else
            {
                ConnectionRecord newConnection = new ConnectionRecord
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
                    newConnection.CustomerId = 0; // TODO: In case of default administrator, how to handle the screen of this user ?
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

                Info($"A connection '{newConnection.ToString()}' is opened");
                Database._Connection.Add(newConnection);
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
            IUser user = null;
            IModule module = null;

            Info($"Initializing connection within the area '{area}' ({moduleId}) ...");

            if (_userManager == null)
            {
                Error("Unable to open the connection. UserManager is undefined!");
                throw new ExceptionDefinitionRecord("ERR_CONNECTION");
            }

            // Retrieve database information

            defaultLanguage = ConfigurationManager.DefaultLanguage;
            ParameterRecord parameterVersion = Database._Parameter.FirstOrDefault(p => p.Key.Equals("Database.Version"));
            if (parameterVersion != null)
                versionDatabase = int.Parse(parameterVersion.Value);

            // Retrieve the current user and its language

            user = _userManager.GetById(_userId);
            if (user == null)
            {
                Warn("The user doesn't exist!");
                throw new ExceptionDefinitionRecord("ERR_CONNECTION");
            }

            module = _userManager.GetModule(user, moduleId);
            if (module == null)
            {
                Warn("The module doesn't exist!");
                throw new ExceptionDefinitionRecord("ERR_CONNECTION");
            }

            // Retrieve the connection

            ConnectionRecord currentConnection = Database._Connection.FirstOrDefault(c => c.ConnectionId.Equals(_connectionId) &&
                                                                                          c.Machine.Equals(Environment.MachineName));
            if (currentConnection == null)
            {
                Warn("The connection doesn't exist. Open the new connection!");
                throw new ExceptionDefinitionRecord("ERR_CONNECTION");
            }

            // Retrieve the database schema

            DSSchema.DSDatabase schema = ConfigurationManager.Schemas[area];
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

            RequestIdRecord requestId = Database._RequestId.FirstOrDefault(r => r.UserId == _userId);
            if (requestId != null)
                lastRequestId = requestId.RequestId;

            // Set the area of the connection and notify that the connection is initialized

            currentConnection.Area = area;
            currentConnection.ModuleId = module.Id;
            currentConnection.Profile = module.Profile;
            currentConnection.Status = true;
            currentConnection.ConnectionLast = DateTime.Now;
            Database.SaveChanges();
            Info($"The connection '{currentConnection.ToString()}' is linked to the area '{area}'");

            // define the response

            JObject result = new JObject
            {
                ["Version"] = versionDatabase,
                ["Schema"] = schema.ToJSON(area, currentConnection.Profile, Database.GetCache()),
                ["DefaultLanguage"] = defaultLanguage,
                ["CurrentUserId"] = user == null ? -1 : user.Id,
                ["CurrentModuleId"] = moduleId,
                ["LastRequestId"] = lastRequestId
            };
            JObject settings = new JObject();
            foreach (KeyValuePair<string, string> setting in ConfigurationManager.Settings)
            {
                if (!setting.Key.StartsWith("Syncytium.Client."))
                    continue;

                settings[setting.Key.Substring("Syncytium.Client.".Length)] = setting.Value;
            }
            result["Parameters"] = settings;

            return result;
        }

        /// <summary>
        /// Load the content of the table and returns a list of columns matching within the area and the profile of the user
        /// </summary>
        /// <param name="table"></param>
        /// <param name="existingRecords">Define it to replace the loading into the database</param>
        /// <returns>The table records:
        ///     Table          = table name
        ///     Records        = List of tuple containing all data
        ///     LastSequenceId = Last sequence id of the user in this table
        /// </returns>
        public JObject LoadTable(string table, List<DSRecord> existingRecords)
        {
            int lastSequenceId = 0;
            List<JArray> records = new List<JArray>();

            Info($"Loading content of the table '{table}' ...");

            // Retrieve the connection

            ConnectionRecord currentConnection = Database._Connection.FirstOrDefault(c => c.ConnectionId.Equals(_connectionId) &&
                                                                                            c.Machine.Equals(Environment.MachineName));
            if (currentConnection == null)
            {
                Error($"The connection doesn't exist!");
                throw new ExceptionDefinitionRecord("ERR_CONNECTION");
            }

            // Retrieve the database schema

            DSSchema.DSDatabase schema = ConfigurationManager.Schemas[currentConnection.Area];
            if (schema == null)
            {
                Error("No schema available!");
                throw new ExceptionDefinitionRecord("ERR_SCHEMA");
            }

            // Is this connection authorized to start the dialog ?

            if (!currentConnection.Allow || !currentConnection.Status)
            {
                Error("Not allowed!");
                throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
            }

            // Retrieve the last sequenceId of this user and the table

            SequenceIdRecord sequenceId = Database._SequenceId.FirstOrDefault(r => r.UserId == _userId && r.Table.Equals(table));
            if (sequenceId != null)
                lastSequenceId = sequenceId.SequenceId;

            // Read the content of the given table

            foreach (object[] record in schema.ReadTable(Database, table, currentConnection.CustomerId,
                                                                            currentConnection.UserId,
                                                                            currentConnection.Profile,
                                                                            currentConnection.Area,
                                                                            null,
                                                                            existingRecords))
                records.Add(new JArray(record));

            // Update the last connection date

            currentConnection.ConnectionLast = DateTime.Now;
            try
            {
                Database.SaveChanges();
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateConcurrencyException)
            {
                Warn("An exception occurs on saving the last connection due to the disconnection of the user ...");
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException)
            {
                Warn("An exception occurs on saving the last connection due to the concurrency update ...");
            }

            Info($"{records.Count} records read from the table '{table}'");

            // define the response

            JObject result = new JObject
            {
                ["Table"] = table,
                ["Records"] = new JArray(records),
                ["LastSequenceId"] = lastSequenceId
            };
            return result;
        }

        /// <summary>
        /// Execute a list of requests from a client
        /// </summary>
        /// <param name="requestId"></param>
        /// <param name="requests"></param>
        /// <returns>RequestId, Error, Record</returns>
        public List<Tuple<DSRecord, InformationRecord>> ExecuteTransaction(int requestId, JObject[] requests)
        {
            Info($"Executing the transaction [{requestId}] containing {requests.Length} requests ...");

            List<Tuple<DSRecord, InformationRecord>> recordsTreated = new List<Tuple<DSRecord, InformationRecord>>();
            List<Tuple<string, DSRecord, InformationRecord>> recordsToUpdate = new List<Tuple<string, DSRecord, InformationRecord>>();
            System.Exception exRaised = null;

            // Retrieve the connection

            ConnectionRecord currentConnection = Database._Connection.FirstOrDefault(c => c.ConnectionId.Equals(_connectionId) &&
                                                                                          c.Machine.Equals(Environment.MachineName));
            if (currentConnection == null)
            {
                Error("The connection doesn't exist!");
                throw new ExceptionDefinitionRecord("ERR_CONNECTION");
            }

            // Retrieve the database schema

            DSSchema.DSDatabase schema = ConfigurationManager.Schemas[currentConnection.Area];
            if (schema == null)
            {
                Error("No schema available!");
                throw new ExceptionDefinitionRecord("ERR_SCHEMA");
            }

            // Is this connection authorized to start the dialog ?

            if (!currentConnection.Allow || !currentConnection.Status)
            {
                Error("Not allowed!");
                throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
            }

            // check if the user has the rights to execute this request

            if (String.IsNullOrWhiteSpace(currentConnection.Area))
            {
                Error("No area defined for the user");
                throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
            }

            // Lock database during the execution of the request

            using (DatabaseLock lockDatabase = Database.Lock(currentConnection.CustomerId))
            {
                // Retrieve the last requestId of this user

                RequestIdRecord requestIdRecord = Database._RequestId.FirstOrDefault(r => r.UserId == _userId);
                if (requestIdRecord == null)
                {
                    requestIdRecord = new RequestIdRecord { UserId = _userId, RequestId = 0, Date = DateTime.Now };
                    requestIdRecord = Database._RequestId.Add(requestIdRecord);
                }

                if (requestId < requestIdRecord.RequestId)
                {
                    Warn($"The request '{requestId}' has already been executed!");
                    throw new ExceptionDefinitionRecord("ERR_REQUEST_ALREADY_EXECUTED");
                }

                if (requestId > requestIdRecord.RequestId)
                {
                    Warn($"The request id expected is '{requestIdRecord.RequestId}' (your request id is '{requestId}')!");
                    throw new ExceptionDefinitionRecord("ERR_SYNCHRONIZED");
                }

                Debug($"The request Id '{requestId}' is expected");

                try
                {
                    // Get the tick

                    string tickKey = $"Database.Tick.{currentConnection.CustomerId}";
                    int tick = 0;
                    ParameterRecord tickRecord = Database._Parameter.FirstOrDefault(p => p.Key.Equals(tickKey));
                    if (tickRecord == null)
                    {
                        tickRecord = new ParameterRecord { Key = $"Database.Tick.{currentConnection.CustomerId}", Value = "0" };
                        tickRecord = Database._Parameter.Add(tickRecord);
                    }
                    else
                    {
                        tick = int.Parse(tickRecord.Value);
                    }

                    // Execute the OnBefore trigger

                    int index = 0;
                    int startTick = tick;
                    foreach (JObject request in requests)
                    {
                        tick++;

                        // Execute the request

                        if (IsDebug())
                            Debug($"Executing the pre-request[{index}] with tick[{tick}]: {request.ToString(Formatting.None)} ...");

                        // Retrieve the current request

                        string table = null;
                        if (request["table"] != null &&
                            request["table"].Type == JTokenType.String)
                            table = request["table"].ToObject<string>();

                        string action = null;
                        if (request["action"] != null &&
                            request["action"].Type == JTokenType.String)
                            action = request["action"].ToObject<string>();

                        JObject record = request["record"] as JObject;
                        JObject identity = request["identity"] as JObject;

                        int? recordId = null;
                        if (request["recordId"] != null &&
                            request["recordId"].Type == JTokenType.Integer)
                            recordId = request["recordId"].ToObject<int>();

                        if (table == null ||
                            action == null ||
                            record == null ||
                            action == null ||
                            recordId == null)
                        {
                            Error($"The request[{index}] isn't correctly formatted!");
                            throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
                        }

                        // Execute the trigger before requesting

                        schema.OnBeforeExecuteRequest(Database, tick, currentConnection.CustomerId, _userId, currentConnection.Area, currentConnection.Profile, table, action, recordId.Value, record, identity);

                        index++;
                    }

                    // Execute each request

                    index = 0;
                    tick = startTick;
                    foreach (JObject request in requests)
                    {
                        tick++;

                        // Execute the request

                        if (IsDebug())
                            Debug($"Executing the request[{index}] with tick[{tick}]: {request.ToString(Formatting.None)} ...");

                        // Retrieve the current request

                        string table = null;
                        if (request["table"] != null &&
                            request["table"].Type == JTokenType.String)
                            table = request["table"].ToObject<string>();

                        string action = null;
                        if (request["action"] != null &&
                            request["action"].Type == JTokenType.String)
                            action = request["action"].ToObject<string>();

                        JObject record = request["record"] as JObject;
                        JObject identity = request["identity"] as JObject;

                        int? recordId = null;
                        if (request["recordId"] != null &&
                            request["recordId"].Type == JTokenType.Integer)
                            recordId = request["recordId"].ToObject<int>();

                        if (table == null ||
                            action == null ||
                            record == null ||
                            action == null ||
                            recordId == null)
                        {
                            Error($"The request[{index}] isn't correctly formatted!");
                            throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
                        }

                        RequestRecord newRequest = new RequestRecord
                        {
                            Tick = tick,
                            UserId = _userId,
                            RequestId = requestId,
                            Area = currentConnection.Area,
                            ModuleId = currentConnection.ModuleId,
                            Table = table,
                            Id = recordId.Value,
                            Action = action,
                            Date = DateTime.Now,
                            Acknowledge = null,
                            CustomerId = currentConnection.CustomerId
                        };
                        newRequest = Database._Request.Add(newRequest);

                        if (IsVerbose())
                            Verbose($"For traceability, the request[{index}] is saved '{newRequest.ToString()}'");

                        // Execute the request

                        Tuple<DSRecord, InformationRecord> recordTreated = schema.ExecuteRequest(Database, tick, currentConnection.CustomerId, _userId, currentConnection.Area, currentConnection.Profile, table, action, recordId.Value, record, identity);
                        recordsTreated.Add(recordTreated);
                        recordsToUpdate.Add(Tuple.Create(table, recordTreated.Item1, recordTreated.Item2));
                        Database.SaveChanges();

                        Info($"The request[{index}] has correctly been executed : {(recordTreated == null ? "null" : recordTreated.ToString())}");

                        // The request is correctly executed ...

                        newRequest.Acknowledge = true;
                        newRequest.Id = (recordTreated == null || recordTreated.Item1 == null ? -1 : recordTreated.Item1.Id);
                        tickRecord.Value = tick.ToString();

                        index++;
                    }

                    // Execute the OnAfter trigger

                    index = 0;
                    tick = startTick;
                    foreach (JObject request in requests)
                    {
                        tick++;

                        // Execute the request

                        if (IsDebug())
                            Debug($"Executing the post-request[{index}] with tick[{tick}]: {request.ToString(Formatting.None)} ...");

                        // Retrieve the current request

                        string table = null;
                        if (request["table"] != null &&
                            request["table"].Type == JTokenType.String)
                            table = request["table"].ToObject<string>();

                        string action = null;
                        if (request["action"] != null &&
                            request["action"].Type == JTokenType.String)
                            action = request["action"].ToObject<string>();

                        // Execute the trigger before requesting

                        DSRecord record = recordsTreated[index].Item1;
                        schema.OnAfterExecuteRequest(Database, tick, currentConnection.CustomerId, _userId, currentConnection.Area, currentConnection.Profile, table, action, record.Id, record);

                        index++;
                    }

                    // Transaction is done! Save the new request ...

                    requestIdRecord.RequestId++;
                    currentConnection.ConnectionLast = DateTime.Now;
                    Database.SaveChanges();

                    // Unlock the database

                    lockDatabase.Commit();

                    // Update the cache manager

                    DatabaseCacheManager.Instance.UpdateCache(Database, recordsToUpdate, currentConnection.CustomerId, tick);
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

                    exRaised = ex;
                }
            }

            if (exRaised != null)
            {
                try
                {
                    // Update requestId

                    RequestIdRecord requestIdRecord = Database._RequestId.FirstOrDefault(r => r.UserId == _userId);
                    if (requestIdRecord == null)
                    {
                        requestIdRecord = new RequestIdRecord { UserId = _userId, RequestId = 0, Date = DateTime.Now };
                        requestIdRecord = Database._RequestId.Add(requestIdRecord);
                    }
                    requestIdRecord.RequestId++;

                    // Update the last connection

                    currentConnection = Database._Connection.FirstOrDefault(c => c.ConnectionId.Equals(_connectionId) &&
                                                                                    c.Machine.Equals(Environment.MachineName));
                    if (currentConnection != null)
                        currentConnection.ConnectionLast = DateTime.Now;

                    // Unlock the database

                    Database.SaveChanges();
                }
                catch (System.Exception ex)
                {
                    Exception("An exception occurs on rollbacking the transaction", ex);
                }

                throw exRaised;
            }

            Info("End of transaction");

            return recordsTreated;
        }

        /// <summary>
        /// Execute a service from a client
        /// </summary>
        /// <param name="service"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns>Data</returns>
        public JObject ExecuteService(string service, JObject record, JObject identity)
        {
            JObject result = null;

            Info($"Executing the service: ['{service}', '{(record == null ? "null" : record.ToString(Formatting.None))}', '{(identity == null ? "null" : identity.ToString(Formatting.None))}' ...");

            // Retrieve the connection

            ConnectionRecord currentConnection = Database._Connection.FirstOrDefault(c => c.ConnectionId.Equals(_connectionId) &&
                                                                                          c.Machine.Equals(Environment.MachineName));
            if (currentConnection == null)
            {
                Error("The connection doesn't exist!");
                throw new ExceptionDefinitionRecord("ERR_CONNECTION");
            }

            // Is this connection authorized to start the dialog ?

            if (!currentConnection.Allow || !currentConnection.Status)
            {
                Error("Not allowed!");
                throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
            }

            // check if the user has the rights to execute this service

            if (String.IsNullOrWhiteSpace(currentConnection.Area))
            {
                Error("No area defined for the user");
                throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
            }

            // Lock database during the execution of the service

            using (DatabaseLock lockDatabase = Database.Lock(currentConnection.CustomerId))
            {
                // Execute the request

                try
                {
                    result = Database.ExecuteService(currentConnection.CustomerId,
                                                     currentConnection.UserId,
                                                     currentConnection.Profile,
                                                     currentConnection.Area,
                                                     service,
                                                     record,
                                                     identity);
                }
                catch (System.Exception ex)
                {
                    Exception("An exception occurs on executing the service", ex);
                    currentConnection.ConnectionLast = DateTime.Now;
                    Database.SaveChanges();

                    // Unlock the database

                    lockDatabase.Commit();
                    throw;
                }

                // The service is correctly executed ...

                currentConnection.ConnectionLast = DateTime.Now;
                Database.SaveChanges();

                // Unlock the database

                lockDatabase.Commit();
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

            ConnectionRecord currentConnection = Database._Connection.FirstOrDefault(c => c.ConnectionId.Equals(_connectionId) &&
                                                                                          c.Machine.Equals(Environment.MachineName));
            if (currentConnection == null)
            {
                Warn("The connection is not closed because it's not in the list of connections!");
                return;
            }

            Database._Connection.Remove(currentConnection);
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