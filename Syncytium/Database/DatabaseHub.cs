using System;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Microsoft.AspNet.SignalR;
using System.Threading;
using Syncytium.Common.Error;
using Syncytium.Common.Database;
using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Exception;
using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Managers;

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

namespace Syncytium.Web.Database
{
    /// <summary>
    /// This class handles the communication between the client Web and the application
    /// </summary>
    // [Microsoft.AspNet.SignalR.Authorize]
    public class DatabaseHub : Microsoft.AspNet.SignalR.Hub
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static readonly string MODULE = typeof(DatabaseHub).Name;

        /// <summary>
        /// Indicates if the all verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsVerboseAll() => Common.Logger.LoggerManager.Instance.IsVerboseAll;

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsVerbose() => Common.Logger.LoggerManager.Instance.IsVerbose;

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="message"></param>
        private void Verbose(string message) => Common.Logger.LoggerManager.Instance.Verbose(MODULE, message);

        /// <summary>
        /// Indicates if the debug mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsDebug() => Common.Logger.LoggerManager.Instance.IsDebug;

        /// <summary>
        /// Log a debug message
        /// </summary>
        /// <param name="message"></param>
        private void Debug(string message) => Common.Logger.LoggerManager.Instance.Debug(MODULE, message);

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        private void Info(string message) => Common.Logger.LoggerManager.Instance.Info(MODULE, message);

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        private void Warn(string message) => Common.Logger.LoggerManager.Instance.Warn(MODULE, message);

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        private void Error(string message) => Common.Logger.LoggerManager.Instance.Error(MODULE, message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        private void Exception(string message, System.Exception ex) => Common.Logger.LoggerManager.Instance.Exception(MODULE, message, ex);

        #endregion

        #region Hub

        /// <summary>
        /// When a new client is connected to the server, store the new connection into the database
        /// </summary>
        /// <returns></returns>
        public override Task OnConnected()
        {
            if (Context.Request.User.Identity.IsAuthenticated)
            {
                try
                {
                    int userId = int.Parse(Context.Request.User.Identity.Name);
                    using (DatabaseManager requester = Syncytium.Managers.DatabaseManager.CreateDatabase(Syncytium.Module.Administration.DatabaseContext.AREA_NAME, Context.ConnectionId, userId))
                        requester.OpenConnection(IsAlreadyConnected(userId));
                }
                catch (System.Exception ex)
                {
                    Exception("An exception occurs on adding a new connection", ex);
                }
            }

            return base.OnConnected();
        }

        /// <summary>
        /// When a client is disconnected to the server, remove the previous connection into the database
        /// </summary>
        /// <param name="stopCalled"></param>
        /// <returns></returns>
        public override Task OnDisconnected(bool stopCalled)
        {
            if (stopCalled && Context.Request.User.Identity.IsAuthenticated)
            {
                try
                {
                    using (DatabaseManager requester = Syncytium.Managers.DatabaseManager.CreateDatabase(Syncytium.Module.Administration.DatabaseContext.AREA_NAME, Context.ConnectionId, int.Parse(Context.Request.User.Identity.Name)))
                        requester.CloseConnection();
                }
                catch (System.Exception ex)
                {
                    Exception("An exception occurs on removing an existing connection", ex);
                }
            }

            return base.OnDisconnected(stopCalled);
        }

        #endregion

        #region MakeErrorMethods

        /// <summary>
        /// Build a result for the client having sent the request
        /// </summary>
        /// <param name="errors"></param>
        /// <returns></returns>
        public static JObject MakeErrorResult(Errors errors)
        {
            JObject result = new JObject
            {
                ["Error"] = errors.ToJSON()
            };
            return result;
        }

        /// <summary>
        /// Build a result for the client having sent the request
        /// </summary>
        /// <param name="language"></param>
        /// <param name="error"></param>
        /// <returns></returns>
        public static JObject MakeErrorResult(string language, string error)
        {
            JObject result = new JObject
            {
                ["DefaultLanguage"] = language,
                ["Error"] = (new Errors(error)).ToJSON()
            };
            return result;
        }

        /// <summary>
        /// Build a result for the client having sent the request
        /// </summary>
        /// <param name="requestId"></param>
        /// <param name="error"></param>
        /// <returns></returns>
        public static JObject MakeErrorResult(int requestId, string error)
        {
            JObject result = new JObject
            {
                ["RequestId"] = requestId,
                ["Error"] = (new Errors(error)).ToJSON()
            };
            return result;
        }

        /// <summary>
        /// Build a result for the client having sent the request
        /// </summary>
        /// <param name="requestId"></param>
        /// <param name="errors"></param>
        /// <returns></returns>
        public static JObject MakeErrorResult(int requestId, Errors errors)
        {
            JObject result = new JObject
            {
                ["RequestId"] = requestId,
                ["Error"] = errors.ToJSON()
            };
            return result;
        }

        #endregion

        /// <summary>
        /// The client tests if the server if up ... this call generally occurs on connection on an existing account!
        /// </summary>
        public void Ping()
        {
            try
            {
                DateTime now = DateTime.Now;

                Debug($"Ping from '{Context.ConnectionId}'");

                using (Module.Administration.DatabaseContext database = new Module.Administration.DatabaseContext())
                {
                    // receive the ping from the client

                    PingRecord existingPing = database._Ping.Find(Context.ConnectionId);
                    if (existingPing != null)
                        existingPing.Date = now;
                    else
                        database._Ping.Add(new PingRecord { ConnectionId = Context.ConnectionId });

                    // update the last connection time of the client

                    ConnectionRecord currentConnection = database._Connection.Find(Context.ConnectionId);
                    if (currentConnection != null)
                        currentConnection.ConnectionLast = now;

                    database.SaveChanges();
                }
            }
            catch (System.Exception ex)
            {
                Exception($"An exception occurs on pinging of the connection '{Context.ConnectionId}'", ex);
                Warn("This exception is ignored ... may be the connection was previously deleted or disconnected!");
            }
        }

        /// <summary>
        /// Check if the given user is already connected through hub
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public static bool IsAlreadyConnected(int userId)
        {
            // the user exists, check if it's already connected
            // In case of reloading page, the connection can't be disconnected as quick as expected ...

            IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<DatabaseHub>();
            if (hub == null)
            {
                // no hub ... disconnect the user and go to the index page

                Common.Logger.LoggerManager.Instance.Info(MODULE, $"Cleaning up all connections for the user {userId} ...");

                using (Module.Administration.DatabaseContext database = new Module.Administration.DatabaseContext())
                {
                    ConnectionRecord currentConnection = database._Connection.FirstOrDefault(c => c.UserId == userId && c.Allow);
                    while (currentConnection != null)
                    {
                        Common.Logger.LoggerManager.Instance.Debug(MODULE, $"Connection {currentConnection} removed ...");
                        try { database._Connection.Remove(currentConnection); } catch { }
                        currentConnection = database._Connection.FirstOrDefault(c => c.UserId == userId && c.Allow);
                    }
                    database.SaveChanges();
                }

                return false;
            }

            // DatabaseCommonContext is frequently open/close here to clean up the cache of the database (else the ping record is never updated) ...

            bool alreadyConnected = true;
            DateTime pingDate = DateTime.Now;
            int count = 0;
            while (count < ConfigurationManager.ConnectionMaxWaiting && alreadyConnected)
            {
                count++;

                ConnectionRecord currentConnection = null;

                using (Module.Administration.DatabaseContext database = new Module.Administration.DatabaseContext())
                    currentConnection = database._Connection.FirstOrDefault(c => c.UserId == userId && c.Allow);

                if (currentConnection != null && count < ConfigurationManager.ConnectionMaxWaiting)
                {
                    // Ping the client and wait 1 secondes to check if the client responses

                    if (count == 1)
                    {
                        Thread.Sleep(1000);
                        Common.Logger.LoggerManager.Instance.Debug(MODULE, $"Ping to '{currentConnection.ConnectionId}'");
                        hub.Clients.Client(currentConnection.ConnectionId).ping();
                    }

                    // Did the client answer to the ping ?

                    PingRecord currentPing = null;
                    using (Module.Administration.DatabaseContext database = new Module.Administration.DatabaseContext())
                        currentPing = database._Ping.Find(currentConnection.ConnectionId);

                    // The client has answered to the ping ... So, it already exists

                    if (currentPing != null && DateTime.Compare(currentPing.Date, pingDate) >= 0)
                        break;

                    // The client didn't answer ... wait a few more second

                    if (count > 1)
                        Thread.Sleep(1000);
                }
                else if (currentConnection != null)
                {
                    // The max seconds has expired ... it means that no client is already connected ... disconnect it

                    alreadyConnected = false;

                    try
                    {
                        hub.Clients.Client(currentConnection.ConnectionId).stop();
                        Common.Logger.LoggerManager.Instance.Info(MODULE, $"The connection '{currentConnection.ConnectionId}' is disconnected");
                    }
                    catch (System.Exception ex)
                    {
                        Common.Logger.LoggerManager.Instance.Exception(MODULE, $"(Warning) Unable to disconnect '{currentConnection.ConnectionId}' due to an exception", ex);
                    }

                    using (Module.Administration.DatabaseContext database = new Module.Administration.DatabaseContext())
                    {
                        currentConnection = database._Connection.Find(currentConnection.ConnectionId);
                        currentConnection.Allow = false;
                        database.SaveChanges();
                    }
                }
                else
                {
                    alreadyConnected = false;
                    Common.Logger.LoggerManager.Instance.Info(MODULE, $"No connection already existing or the previous connection is disconnected ...");
                }
            }

            if (alreadyConnected)
            {
                Common.Logger.LoggerManager.Instance.Debug(MODULE, $"The user '{userId}' is already connected on another support");
                return true;
            }

            return false;
        }

        /// <summary>
        /// The client starts the initialization process and has to declare its area
        /// </summary>
        /// <param name="area"></param>
        /// <param name="moduleId"></param>
        /// <returns>the database schema correspnding to the user's profile and its area:
        ///     Error = error code or missing if it's ok
        ///     Language = default language (user's language or default language of the application)
        ///     Ressources = all labels
        ///     Schema = database schema
        ///     Version = database version
        ///     LastRequestId = last request id of the user
        ///     User = user's profile
        /// </returns>
        public JObject Initialize(string area, int moduleId)
        {
            if (!Context.Request.User.Identity.IsAuthenticated)
            {
                // Lost the session for unconnecting period ... all changes into the client is definitively lost ... reload the page
                Error($"The user is not authenticated ... Reload the page!");
                return MakeErrorResult("EN", "ERR_UNAUTHENTICATED");
            }

            try
            {
                Info($"Initializing connection for the user '{Context.Request.User.Identity.Name}' in the area '{area}' ({moduleId}) ...");

                JObject result = null;
                using (DatabaseManager requester = Syncytium.Managers.DatabaseManager.CreateDatabase(area, Context.ConnectionId, int.Parse(Context.Request.User.Identity.Name)))
                    result = requester.Initialize(area, moduleId);

                if (IsVerbose())
                    Verbose($"Initialize['{area}'] = '{result.ToString(Formatting.None)}';");

                return result;
            }
            catch (ExceptionDefinitionRecord ex)
            {
                Error("The initialization can't be executed due to some errors");
                return MakeErrorResult(ex.Errors);
            }
            catch (System.Exception ex)
            {
                Exception("An exception occurs on initializing the connection", ex);
                return MakeErrorResult("EN", "ERR_EXCEPTION_UNEXPECTED");
            }
        }

        /// <summary>
        /// Load the content of the table and returns a list of columns matching within the area and the profile of the user
        /// </summary>
        /// <param name="table"></param>
        /// <returns>The table records:
        ///     Error = error code or missing if it's ok
        ///     Table = table name
        ///     Records = List of tuple containing all data
        ///     SequenceId = last sequence id of the user in this table
        /// </returns>
        public async Task<JObject> LoadTable(string table)
        {
            if (!Context.Request.User.Identity.IsAuthenticated)
            {
                // Lost the session for unconnecting period ... all changes into the client is definitively lost ... reload the page
                Error($"The user is not authenticated ... Reload the page!");
                return MakeErrorResult("EN", "ERR_UNAUTHENTICATED");
            }

            try
            {
                Info($"Loading content of the table '{table}' for the user '{Context.Request.User.Identity.Name}' ...");

                int lastSequenceId = 0;
                int nbLots = 0;

                using (DatabaseManager requester = Syncytium.Managers.DatabaseManager.CreateDatabase(Context.ConnectionId, int.Parse(Context.Request.User.Identity.Name)))
                {
                    // Get the current connection properties to retrieve the user's area

                    ConnectionRecord currentConnection = requester.Database._Connection.FirstOrDefault(c => c.ConnectionId.Equals(Context.ConnectionId) &&
                                                                                                            c.Machine.Equals(Environment.MachineName));
                    if (currentConnection == null)
                    {
                        Error($"The connection '{Context.ConnectionId}' doesn't exist!");
                        throw new ExceptionDefinitionRecord("ERR_CONNECTION");
                    }

                    // Is this connection authorized to start the dialog ?

                    if (!currentConnection.Allow || !currentConnection.Status)
                    {
                        Error("Not allowed!");
                        throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
                    }

                    // Retrieve the database schema

                    if (ConfigurationManager.Schemas[currentConnection.Area] == null)
                    {
                        Error("No schema available!");
                        throw new ExceptionDefinitionRecord("ERR_SCHEMA");
                    }

                    // Update the cache manager

                    DatabaseCacheManager.Instance.UpdateCache(requester.Database, currentConnection.CustomerId, Syncytium.Managers.DatabaseManager.GetDatabase);

                    // Retrieve the last sequence Id

                    lastSequenceId = requester.LastSequenceId(table);

                    // Load data

                    foreach (JArray records in requester.LoadTable(currentConnection.CustomerId,
                                                                    currentConnection.UserId,
                                                                    currentConnection.Profile,
                                                                    currentConnection.Area, 
                                                                    table, 
                                                                    table.Equals("Language") ? LanguageManager.GetInstance(requester.Database as Syncytium.Module.Administration.DatabaseContext, currentConnection.CustomerId).GetLabels(currentConnection.CustomerId).ToList<DSRecord>() : null))
                    {
                        if (IsVerboseAll())
                            Verbose($"LoadTable['{table}'] = '{records.ToString(Formatting.None)}'");

                        await Clients.Caller.loadTable(table, records);
                        nbLots++;
                    }
                    Debug($"{nbLots} lots of data sent");

                    // Update the last connection date

                    currentConnection.ConnectionLast = DateTime.Now;
                    try
                    {
                        requester.Database.SaveChanges();
                    }
                    catch (System.Data.Entity.Infrastructure.DbUpdateConcurrencyException)
                    {
                        Warn("An exception occurs on saving the last connection due to the disconnection of the user ...");
                    }
                    catch (System.Data.Entity.Infrastructure.DbUpdateException)
                    {
                        Warn("An exception occurs on saving the last connection due to the concurrency update ...");
                    }
                }

                return new JObject
                {
                    ["Table"] = table,
                    ["LastSequenceId"] = lastSequenceId,
                    ["NbLots"] = nbLots
                };
            }
            catch (ExceptionDefinitionRecord ex)
            {
                Exception("The loading of the table can't be executed due to some errors", ex);
                return MakeErrorResult(ex.Errors);
            }
            catch (System.Exception ex)
            {
                Exception("An exception occurs on initializing the connection", ex);
                return MakeErrorResult("EN", "ERR_EXCEPTION_UNEXPECTED");
            }
        }

        /// <summary>
        /// Notify to the client that it can't get access to the server becuse he is not allowed
        /// </summary>
        /// <returns>
        ///     Error = error code or missing if it's ok
        ///     Allow = true / false
        /// </returns>
        public JObject IsAllowed()
        {
            JObject result = new JObject();

            if (!Context.Request.User.Identity.IsAuthenticated)
            {
                // Lost the session for unconnecting period ... all changes into the client is definitively lost ... reload the page
                Error($"The user is not authenticated ... Reload the page!");
                return MakeErrorResult("EN", "ERR_UNAUTHENTICATED");
            }

            try
            {
                Debug($"{Context.ConnectionId} [{Context.Request.User.Identity.Name}] Checking if the user is allowed to reconnect to the server ...");

                using (DatabaseManager requester = Syncytium.Managers.DatabaseManager.CreateDatabase(Context.ConnectionId, int.Parse(Context.Request.User.Identity.Name)))
                {
                    bool allow = false;

                    // Get the current connection properties to retrieve the user's area

                    ConnectionRecord currentConnection = requester.Database._Connection.FirstOrDefault(c => c.ConnectionId.Equals(Context.ConnectionId) &&
                                                                                                            c.Machine.Equals(Environment.MachineName));
                    if (currentConnection == null)
                    {
                        Error($"{Context.ConnectionId} [{Context.Request.User.Identity.Name}] The connection doesn't exist!");
                    }
                    else
                    {
                        allow = currentConnection.Allow;
                    }

                    result["Allow"] = allow;
                    if (allow)
                        Info($"{Context.ConnectionId} [{Context.Request.User.Identity.Name}] The user can do a synchronization");
                    else
                        Warn($"{Context.ConnectionId} [{Context.Request.User.Identity.Name}] The user can't do a synchronization");
                }

                return result;
            }
            catch (ExceptionDefinitionRecord)
            {
                result["Allow"] = false;
                Warn($"{Context.ConnectionId} [{Context.Request.User.Identity.Name}] The user can't do a synchronization");
                return result;
            }
            catch (System.Exception ex)
            {
                Exception("An exception occurs on checking if the user is allowed to reconnect", ex);
                return MakeErrorResult("EN", "ERR_EXCEPTION_UNEXPECTED");
            }
        }

        /// <summary>
        /// Execute a transaction (list of requests) from a client
        /// </summary>
        /// <param name="requestId"></param>
        /// <param name="label"></param>
        /// <param name="requests"></param>
        /// <param name="transaction"></param>
        /// <param name="notify">true if the notification must be sent to the caller</param>
        /// <returns>RequestId, Error, Record</returns>
        private JObject ExecuteTransaction(int requestId, JObject label, JObject[] requests, bool transaction, bool notify)
        {
            int index = 0;

            if (!Context.Request.User.Identity.IsAuthenticated)
            {
                // Lost the session for unconnecting period ... all changes into the client is definitively lost ... reload the page
                Error($"The user is not authenticated ... Reload the page!");
                return MakeErrorResult("EN", "ERR_UNAUTHENTICATED");
            }

            try
            {
                // nothing to execute => Throw an error

                if (requests == null || requests.Length == 0)
                {
                    Error("No requests to execute");
                    throw new ExceptionDefinitionRecord("ERR_REQUEST_UNKNOWN");
                }

                Info($"Executing the transaction [{requestId} - '{label.ToString(Formatting.None)}'] containing {requests.Length} requests ...");
                if ( IsDebug() )
                {
                    foreach (JObject request in requests)
                    {
                        Debug($"Executing the request: {request.ToString(Formatting.None)} ...");
                    }
                }

                // Check if the request is correctly formatted

                index = 0;
                foreach (JObject request in requests)
                {
                    // convert the request property

                    string table = null;
                    if (request["table"] != null &&
                        request["table"].Type == JTokenType.String)
                        table = request["table"].ToObject<string>();

                    string action = null;
                    if (request["action"] != null &&
                        request["action"].Type == JTokenType.String)
                        action = request["action"].ToObject<string>();

                    JObject identity = request["identity"] as JObject;

                    if (table == null ||
                        action == null ||
                        !(request["record"] is JObject record) ||
                        action == null)
                    {
                        Error($"The request[{index}] isn't correctly formatted!");
                        throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
                    }

                    index++;
                }

                // From the current user, check if the user can update database

                using (DatabaseManager requester = Syncytium.Managers.DatabaseManager.CreateDatabase(Context.ConnectionId, int.Parse(Context.Request.User.Identity.Name)))
                {
                    // Get the current connection properties

                    ConnectionRecord currentConnection = requester.Database._Connection.FirstOrDefault(c => c.ConnectionId.Equals(Context.ConnectionId) &&
                                                                                                            c.Machine.Equals(Environment.MachineName));
                    if (currentConnection == null)
                    {
                        Error($"The connection '{Context.ConnectionId}' doesn't exist!");
                        throw new ExceptionDefinitionRecord("ERR_CONNECTION");
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

                    if (ConfigurationManager.Schemas[currentConnection.Area] == null)
                    {
                        Error($"The schema of the module '{currentConnection.Area}' doesn't exist!");
                        throw new ExceptionDefinitionRecord("ERR_SCHEMA");
                    }

                    // Retrieve the last requestId of this user

                    RequestIdRecord requestIdRecord = requester.Database._RequestId.FirstOrDefault(r => r.UserId == currentConnection.UserId);
                    if (requestIdRecord == null)
                    {
                        requestIdRecord = new RequestIdRecord { UserId = currentConnection.UserId, RequestId = 0, Date = DateTime.Now };
                        requestIdRecord = requester.Database._RequestId.Add(requestIdRecord);
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

                    if (IsVerbose())
                        Verbose($"The request Id '{requestId}' is expected");

                    // Post the event into the event queue

                    DatabaseQueue.Instance.Produce(currentConnection, requestId, label, requests, transaction, notify);

                    // Update last connection date and the last requestId of the user

                    requestIdRecord.RequestId++;
                    currentConnection.ConnectionLast = DateTime.Now;

                    try
                    {
                        requester.Database.SaveChanges();
                    }
                    catch (System.Data.Entity.Infrastructure.DbUpdateConcurrencyException)
                    {
                        Warn("An exception occurs on saving the last connection due to the disconnection of the user ...");
                    }
                    catch (System.Data.Entity.Infrastructure.DbUpdateException)
                    {
                        Warn("An exception occurs on saving the last connection due to the concurrency update ...");
                    }

                    JObject result = null;
                    if (transaction)
                    {
                        result = new JObject
                        {
                            ["RequestId"] = requestId,
                            ["Transaction"] = new JArray(requests)
                        };
                    }
                    else
                    {
                        result = new JObject
                        {
                            ["RequestId"] = requestId,
                            ["Record"] = requests[0]["record"]
                        };
                    }

                    return result;
                }
            }
            catch (ExceptionDefinitionRecord ex)
            {
                Error($"The transaction '{requestId}' can't be executed due to some errors ({JsonConvert.SerializeObject(ex.Errors)})");
                return MakeErrorResult(requestId, ex.Errors);
            }
            catch (System.Exception ex)
            {
                Exception("An exception occurs on executing the transaction", ex);
                return MakeErrorResult(requestId, "ERR_EXCEPTION_UNEXPECTED");
            }
        }

        /// <summary>
        /// Execute a request from a client
        /// </summary>
        /// <param name="requestId"></param>
        /// <param name="label"></param>
        /// <param name="table"></param>
        /// <param name="action"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns>RequestId, Error, Record</returns>
        public JObject ExecuteRequest(int requestId, JObject label, string table, string action, JObject record, JObject identity)
        {
            JObject request = new JObject
            {
                ["table"] = table,
                ["action"] = action,
                ["record"] = record,
                ["identity"] = identity
            };

            return ExecuteTransaction(requestId, label, new JObject[] { request }, false, false);
        }

        /// <summary>
        /// Execute a transaction (list of requests) from a client
        /// </summary>
        /// <param name="requestId"></param>
        /// <param name="label"></param>
        /// <param name="requests"></param>
        /// <param name="notify">true if the notification must be sent to the caller</param>
        /// <returns>RequestId, Error, Record</returns>
        public JObject ExecuteTransaction(int requestId, JObject label, JObject[] requests, bool notify)
        {
            return ExecuteTransaction(requestId, label, requests, true, notify);
        }

        /// <summary>
        /// Execute a service from a client
        /// A service is just limited to the current user ... no notification done for the other users
        /// </summary>
        /// <param name="service"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <param name="synchronous">true means that the service can be immediately executed</param>
        /// <returns>RequestId, Error, Record</returns>
        public JObject ExecuteService(string service, JObject record, JObject identity, bool synchronous)
        {
            if (!Context.Request.User.Identity.IsAuthenticated)
            {
                // Lost the session for unconnecting period ... all changes into the client is definitively lost ... reload the page
                Error($"The user is not authenticated ... Reload the page!");
                return MakeErrorResult("EN", "ERR_UNAUTHENTICATED");
            }

            try
            {
                JObject result = null;

                Info($"Executing the service: ['{service}', '{(record == null ? "null" : record.ToString(Formatting.None))}', '{(identity == null ? "null" : identity.ToString(Formatting.None))}', {synchronous}] ...");

                using (DatabaseManager requester = Syncytium.Managers.DatabaseManager.CreateDatabase(Context.ConnectionId, int.Parse(Context.Request.User.Identity.Name)))
                {
                    // Get the current connection properties

                    ConnectionRecord currentConnection = requester.Database._Connection.FirstOrDefault(c => c.ConnectionId.Equals(Context.ConnectionId) &&
                                                                                                            c.Machine.Equals(Environment.MachineName));
                    if (currentConnection == null)
                    {
                        Error($"The connection '{Context.ConnectionId}' doesn't exist!");
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

                    // Update the last connection date

                    currentConnection.ConnectionLast = DateTime.Now;
                    try
                    {
                        requester.Database.SaveChanges();
                    }
                    catch (System.Data.Entity.Infrastructure.DbUpdateConcurrencyException)
                    {
                        Warn("An exception occurs on saving the last connection due to the disconnection of the user ...");
                    }
                    catch (System.Data.Entity.Infrastructure.DbUpdateException)
                    {
                        Warn("An exception occurs on saving the last connection due to the concurrency update ...");
                    }

                    // Execute the service in synchronous or asynchronous mode

                    if ( synchronous )
                    {
                        try
                        {
                            result = new JObject
                            {
                                ["Result"] = requester.ExecuteService(currentConnection.CustomerId,
                                                                      currentConnection.UserId,
                                                                      currentConnection.Profile,
                                                                      currentConnection.Area,
                                                                      currentConnection.ModuleId,
                                                                      service, record, identity)
                            };
                        }
                        catch (System.Exception ex)
                        {
                            Exception("An exception occurs on executing the service", ex);
                            result = MakeErrorResult(0, "ERR_EXCEPTION_UNEXPECTED");
                        }
                    }
                    else
                    {
                        DatabaseQueue.Instance.Produce(currentConnection, service, record, identity);

                        result = new JObject
                        {
                            ["Result"] = "OK"
                        };
                    }

                    try
                    {
                        requester.Database.SaveChanges();
                    }
                    catch (System.Data.Entity.Infrastructure.DbUpdateConcurrencyException)
                    {
                        Warn("An exception occurs on saving the last connection due to the disconnection of the user ...");
                    }
                    catch (System.Data.Entity.Infrastructure.DbUpdateException)
                    {
                        Warn("An exception occurs on saving the last connection due to the concurrency update ...");
                    }
                }

                if ( IsDebug() )
                    Debug($"End of execution service : {result.ToString(Formatting.None)}");

                return result;
            }
            catch (ExceptionDefinitionRecord ex)
            {
                Error($"The service '{service}' can't be executed due to some errors ({JsonConvert.SerializeObject(ex.Errors)})");
                return MakeErrorResult(0, ex.Errors);
            }
            catch (System.Exception ex)
            {
                Exception("An exception occurs on executing the service", ex);
                return MakeErrorResult(0, "ERR_EXCEPTION_UNEXPECTED");
            }
        }
    }
}