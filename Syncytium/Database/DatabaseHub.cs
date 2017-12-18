using System;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Collections.Generic;
using Microsoft.AspNet.SignalR;
using System.Threading;
using Syncytium.Common.Error;
using Syncytium.Common.Database;
using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Exception;
using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Managers;

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
        private static string MODULE = typeof(DatabaseHub).Name;

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

        #region Private Methods

        /// <summary>
        /// Build a result for the client having sent the request
        /// </summary>
        /// <param name="errors"></param>
        /// <returns></returns>
        private JObject MakeErrorResult(Errors errors)
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
        private JObject MakeErrorResult(string language, string error)
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
        private JObject MakeErrorResult(int requestId, string error)
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
        private JObject MakeErrorResult(int requestId, Errors errors)
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
                        Common.Logger.LoggerManager.Instance.Debug(MODULE, $"Connection {currentConnection.ToString()} removed ...");
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
                return MakeErrorResult("FR", "ERR_UNAUTHENTICATED");
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
                return MakeErrorResult("FR", "ERR_EXCEPTION_UNEXPECTED");
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
        public JObject LoadTable(string table)
        {
            if (!Context.Request.User.Identity.IsAuthenticated)
            {
                // Lost the session for unconnecting period ... all changes into the client is definitively lost ... reload the page
                Error($"The user is not authenticated ... Reload the page!");
                return MakeErrorResult("FR", "ERR_UNAUTHENTICATED");
            }

            try
            {
                Info($"Loading content of the table '{table}' for the user '{Context.Request.User.Identity.Name}' ...");

                JObject result = null;

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

                    // Update the cache manager

                    DatabaseCacheManager.Instance.UpdateCache(requester.Database, currentConnection.CustomerId, Syncytium.Managers.DatabaseManager.GetDatabase);

                    // Load data

                    result = requester.LoadTable(table, table.Equals("Language") ? LanguageManager.GetInstance(requester.Database as Syncytium.Module.Administration.DatabaseContext, currentConnection.CustomerId).GetLabels(currentConnection.CustomerId).ToList<DSRecord>() : null);
                }

                if (IsVerbose())
                    Verbose($"LoadTable['{table}'] = '{result.ToString(Formatting.None)}';");

                return result;
            }
            catch (ExceptionDefinitionRecord ex)
            {
                Error("The loading of the table can't be executed due to some errors");
                return MakeErrorResult(ex.Errors);
            }
            catch (System.Exception ex)
            {
                Exception("An exception occurs on initializing the connection", ex);
                return MakeErrorResult("FR", "ERR_EXCEPTION_UNEXPECTED");
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
                return MakeErrorResult("FR", "ERR_UNAUTHENTICATED");
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
                return MakeErrorResult("FR", "ERR_EXCEPTION_UNEXPECTED");
            }
        }

        /// <summary>
        /// make the difference between previousNotification and newNotification
        /// This algorithm is done to reduce the stream towards the network and to update juste necessary
        /// </summary>
        /// <param name="schema"></param>
        /// <param name="connectionId"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="profile"></param>
        /// <param name="area"></param>
        /// <param name="tick"></param>
        /// <param name="label"></param>
        /// <param name="cache"></param>
        public async Task<JObject> NotificationClients(Common.Database.DSSchema.DSDatabase schema,
                                                       string connectionId,
                                                       int customerId,
                                                       int userId,
                                                       UserProfile.EUserProfile profile,
                                                       string area,
                                                       int tick,
                                                       JObject label,
                                                       Common.Database.DSSchema.DSCache cache)
        {
            try
            {
                List<Tuple<string, DSRecord, DSRecord>> differences = cache.GetDifferences(connectionId);
                if (differences.Count == 0)
                {
                    if (IsDebug())
                        Debug($"{connectionId} No notification");

                    return null;
                }

                JArray notifications = new JArray();

                foreach (Tuple<string, DSRecord, DSRecord> difference in differences)
                {
                    JObject recordFiltered = null;

                    if (difference.Item2 == null && difference.Item3 == null)
                        continue;

                    if (difference.Item2 == null && difference.Item3 != null)
                    {
                        recordFiltered = schema.FilterRecord(difference.Item3, area, userId, profile);
                        if (recordFiltered == null)
                            continue;

                        recordFiltered["_tick"] = tick;

                        if (IsDebug())
                            Debug($"{connectionId} [Add ({difference.Item1})] Notification '{recordFiltered.ToString(Formatting.None)}'");

                        notifications.Add(new JObject() { ["table"] = difference.Item1, ["record"] = recordFiltered });
                        continue;
                    }

                    if (difference.Item2 != null && difference.Item3 == null)
                    {
                        recordFiltered = schema.FilterRecord(difference.Item2, area, userId, profile);
                        if (recordFiltered == null)
                            continue;

                        // set the flag _deleted and _tick for the target client because it can't modified it never

                        recordFiltered["_tick"] = tick;
                        recordFiltered["_deleted"] = true;

                        if (IsDebug())
                            Debug($"{connectionId} [Delete ({difference.Item1})] Notification '{recordFiltered.ToString(Formatting.None)}'");

                        notifications.Add(new JObject() { ["table"] = difference.Item1, ["record"] = recordFiltered });
                        continue;
                    }

                    recordFiltered = schema.FilterRecord(difference.Item3, area, userId, profile);
                    if (recordFiltered == null)
                        continue;

                    JObject oldRecordFiltered = schema.FilterRecord(difference.Item2, area, userId, profile);
                    if (oldRecordFiltered != null && JToken.DeepEquals(oldRecordFiltered, recordFiltered))
                    {
                        if (IsVerbose())
                            Verbose($"{connectionId} [Unchange ({difference.Item1})] No notification for '{recordFiltered.ToString(Formatting.None)}'");
                        continue;
                    }

                    recordFiltered["_tick"] = tick;

                    if (IsDebug())
                        Debug($"{connectionId} [Update ({difference.Item1})] Notification '{recordFiltered.ToString(Formatting.None)}'");

                    notifications.Add(new JObject() { ["table"] = difference.Item1, ["record"] = recordFiltered });
                }

                // Send notifications by lot

                if (IsDebug())
                    Debug($"{connectionId} [{userId}] Sending {notifications.Count} notifications ...");

                if (notifications.Count > 0)
                {
                    await Clients.Client(connectionId).beginNotification(tick, label);

                    int lotSize = ConfigurationManager.ConnectionNotificationLotSize;
                    for (int i = 0; i < notifications.Count; i += lotSize)
                    {
                        int count = Math.Min(notifications.Count - i, lotSize);
                        JObject[] lot = new JObject[count];
                        for (int j = 0; j < count; j++)
                            lot[j] = notifications[i + j].ToObject<JObject>();

                        if (IsVerbose())
                            Verbose($"{connectionId} [{userId}] Sending the lot [{i} .. {i + count}] ...");

                        await Clients.Client(connectionId).notify(userId, label, area, lot);
                    }

                    await Clients.Client(connectionId).endNotification(tick, label);

                    Info($"{connectionId} [{userId}] {notifications.Count} Notifications sent");
                }

                return null;
            }
            catch (System.Exception ex)
            {
                Exception($"An exception occurs on notifying the user '{userId}'", ex);
            }

            return null;
        }

        /// <summary>
        /// Execute a transaction (list of requests) from a client
        /// </summary>
        /// <param name="requestId"></param>
        /// <param name="label"></param>
        /// <param name="requests"></param>
        /// <param name="transaction"></param>
        /// <returns>RequestId, Error, Record</returns>
        private async Task<JObject> ExecuteTransaction(int requestId, JObject label, JObject[] requests, bool transaction)
        {
            int index = 0;

            if (!Context.Request.User.Identity.IsAuthenticated)
            {
                // Lost the session for unconnecting period ... all changes into the client is definitively lost ... reload the page
                Error($"The user is not authenticated ... Reload the page!");
                return MakeErrorResult("FR", "ERR_UNAUTHENTICATED");
            }

            // nothing to execute

            if (requests == null || requests.Length == 0)
            {
                Info("No requests to execute");
                JObject resultEmpty = new JObject
                {
                    ["RequestId"] = requestId
                };
                return resultEmpty;
            }

            try
            {
                Info($"Executing the transaction [{requestId} - '{label.ToString(Formatting.None)}'] containing {requests.Length} requests ...");
                foreach (JObject request in requests)
                    Info($"Executing the request: {request.ToString(Formatting.None)} ...");

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

                    JObject record = request["record"] as JObject;
                    JObject identity = request["identity"] as JObject;

                    if (table == null ||
                        action == null ||
                        record == null ||
                        action == null)
                    {
                        Error($"The request[{index}] isn't correctly formatted!");
                        throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
                    }

                    index++;
                }

                // From the current user, check if the user can update database

                int userId = int.Parse(Context.Request.User.Identity.Name);

                using (DatabaseManager requester = Syncytium.Managers.DatabaseManager.CreateDatabase(Context.ConnectionId, userId))
                {
                    // Get the current connection properties

                    ConnectionRecord currentConnection = requester.Database._Connection.FirstOrDefault(c => c.ConnectionId.Equals(Context.ConnectionId) &&
                                                                                                            c.Machine.Equals(Environment.MachineName));
                    if (currentConnection == null)
                    {
                        Error($"The connection '{Context.ConnectionId}' doesn't exist!");
                        throw new ExceptionDefinitionRecord("ERR_CONNECTION");
                    }

                    Common.Database.DSSchema.DSDatabase schema = ConfigurationManager.Schemas[currentConnection.Area];
                    if (schema == null)
                    {
                        Error($"The schema of the module '{currentConnection.Area}' doesn't exist!");
                        throw new ExceptionDefinitionRecord("ERR_SCHEMA");
                    }

                    // Update the cache manager

                    DatabaseCacheManager.Instance.UpdateCache(requester.Database, currentConnection.CustomerId, Syncytium.Managers.DatabaseManager.GetDatabase);

                    // Define a cache to handle the list of notifications

                    Common.Database.DSSchema.DSCache cache = requester.Database.GetCache();

                    // Retrieve the list of plans in case of notification for a user

                    if (IsDebug())
                        Debug("Prepare the execution of the transaction");

                    index = 0;
                    foreach (JObject request in requests)
                    {
                        if (IsVerbose())
                            Verbose($"Prepare the execution of the request[{index}]");

                        string table = request["table"].ToObject<string>();
                        string action = request["action"].ToObject<string>();
                        JObject record = request["record"] as JObject;
                        JObject identity = request["identity"] as JObject;

                        requester.Database.PrepareRequest(cache, userId, table, action, record, identity);

                        int recordId = schema.GetRecordId(requester.Database, userId, table, action, record, identity);
                        request["recordId"] = recordId;

                        index++;
                    }

                    // Retrieve the list of records concerned by this update before updating database for each users except the current connection

                    index = 0;
                    foreach (JObject request in requests)
                    {
                        if (IsVerbose())
                            Verbose($"Retrieve the database status just before executing the request[{index}] ...");

                        string table = request["table"].ToObject<string>();
                        string action = request["action"].ToObject<string>();
                        JObject record = request["record"] as JObject;
                        JObject identity = request["identity"] as JObject;
                        int recordId = request["recordId"].ToObject<int>();

                        // For each user connected ... and having at least one update

                        foreach (ConnectionRecord connection in requester.Database._Connection.Where(c => c.Allow && c.Status &&
                                                                                                          c.CustomerId == currentConnection.CustomerId &&
                                                                                                          c.Profile != UserProfile.EUserProfile.None &&
                                                                                                          (!c.ConnectionId.Equals(Context.ConnectionId) ||
                                                                                                           !c.Machine.Equals(Environment.MachineName))).ToList())
                        {
                            if (IsVerbose())
                                Verbose($"{connection.ConnectionId} Retrieve the database status just before executing the request[{index}] ...");

                            cache.SetBefore(connection.ConnectionId);
                            requester.Database.GetListRecordsConcernedByUpdate(cache,
                                                                               table,
                                                                               recordId,
                                                                               connection.CustomerId,
                                                                               connection.UserId,
                                                                               connection.Profile,
                                                                               connection.Area,
                                                                               true,
                                                                               null,
                                                                               null);
                        }

                        index++;
                    }

                    // Execute the transaction and update the database

                    List<Tuple<DSRecord, InformationRecord>> recordsTreated = requester.ExecuteTransaction(requestId, requests);

                    if (recordsTreated == null)
                    {
                        Info("No result for the transaction!");
                        JObject resultEmpty = new JObject
                        {
                            ["RequestId"] = requestId
                        };
                        return resultEmpty;
                    }

                    // Retrieve the list of records concerned by this update after updating database for myself only

                    cache.SetAfter(currentConnection.ConnectionId);

                    index = 0;
                    foreach (JObject request in requests)
                    {
                        DSRecord recordTreated = recordsTreated[index].Item1;

                        if (IsDebug())
                            Debug($"Result of the request[{index}]: {(recordTreated == null ? "null" : recordTreated.ToString())}");

                        if (recordsTreated == null)
                        {
                            index++;
                            continue;
                        }

                        if (IsVerbose())
                            Verbose($"{currentConnection.ConnectionId} Retrieve the database status just after executing the transaction ...");

                        string table = request["table"].ToObject<string>();

                        requester.Database.GetListRecordsConcernedByUpdate(cache,
                                                                           table,
                                                                           recordTreated.Id,
                                                                           currentConnection.CustomerId,
                                                                           currentConnection.UserId,
                                                                           currentConnection.Profile,
                                                                           currentConnection.Area,
                                                                           true,
                                                                           recordTreated,
                                                                           null);
                        index++;
                    }

                    // acknowledge to the caller (ignore all exceptions) before sending the result to the caller

                    int notificationTick = 0;

                    try
                    {
                        index = 0;
                        foreach (JObject request in requests)
                        {
                            DSRecord recordTreated = recordsTreated[index].Item1;
                            if (recordTreated == null)
                            {
                                index++;
                                continue;
                            }

                            JObject recordFiltered = schema.FilterRecord(recordTreated, currentConnection.Area, currentConnection.UserId, currentConnection.Profile);
                            if (recordFiltered == null)
                            {
                                Error($"Conversion of the result of the transaction[{index}] into a JSON in error!");
                                index++;
                                continue;
                            }

                            notificationTick = recordTreated._tick;

                            if (!recordTreated._deleted && cache.Is(request["table"].ToObject<string>(), recordTreated.Id) != true)
                            {
                                if (IsDebug())
                                    Debug($"Notify to the current client that this record[{index}] is deleted because he is not yet concerned by this record!");
                                recordFiltered["_deleted"] = true;
                            }

                            request["record"] = recordFiltered;

                            index++;

                            if (!transaction)
                            {
                                if (IsDebug())
                                    Debug($"{currentConnection.ConnectionId} Acknowledge the request");
                                await Clients.Caller.acknowledgeRequest(requestId, currentConnection.Area, request["table"].ToObject<string>(), request["action"].ToObject<string>(), recordFiltered, request["identity"]);
                            }
                        }

                        if (transaction)
                        {
                            if (IsDebug())
                                Debug($"{currentConnection.ConnectionId} Acknowledge the transaction");
                            await Clients.Caller.acknowledgeTransaction(requestId, currentConnection.Area, requests);
                        }
                    }
                    catch (System.Exception ex)
                    {
                        Exception("An exception occurs on acknowledging the transaction. But, continue informing all other clients ...", ex);
                    }

                    // The request was executed ... notify all clients (except himself) that something has changed
                    // In some cases, new client or client disconnected while executing a request

                    // For each user connected ... and having at least one update

                    foreach (ConnectionRecord connection in requester.Database._Connection.Where(c => c.Allow && c.Status &&
                                                                                                      c.CustomerId == currentConnection.CustomerId &&
                                                                                                      c.Profile != UserProfile.EUserProfile.None &&
                                                                                                      (!c.ConnectionId.Equals(Context.ConnectionId) ||
                                                                                                       !c.Machine.Equals(Environment.MachineName))).ToList())
                    {
                        if (IsVerbose())
                            Verbose($"{connection.ConnectionId} Retrieve the database status just after executing the transaction ...");

                        cache.SetAfter(connection.ConnectionId);

                        index = 0;
                        foreach (JObject request in requests)
                        {
                            DSRecord recordTreated = recordsTreated[index].Item1;
                            if (recordTreated == null)
                            {
                                index++;
                                continue;
                            }

                            if (IsVerbose())
                                Verbose($"{connection.ConnectionId} Retrieve the database status just after executing the request[{index}] ...");

                            requester.Database.GetListRecordsConcernedByUpdate(cache,
                                                                               request["table"].ToObject<string>(),
                                                                               recordTreated.Id,
                                                                               connection.CustomerId,
                                                                               connection.UserId,
                                                                               connection.Profile,
                                                                               connection.Area,
                                                                               true,
                                                                               recordTreated,
                                                                               null);

                            index++;
                        }

                        await NotificationClients(ConfigurationManager.Schemas[connection.Area], connection.ConnectionId, connection.CustomerId, connection.UserId, connection.Profile, connection.Area, notificationTick, label, cache);
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
        public async Task<JObject> ExecuteRequest(int requestId, JObject label, string table, string action, JObject record, JObject identity)
        {
            JObject request = new JObject
            {
                ["table"] = table,
                ["action"] = action,
                ["record"] = record,
                ["identity"] = identity
            };

            return await ExecuteTransaction(requestId, label, new JObject[] { request }, false);
        }

        /// <summary>
        /// Execute a transaction (list of requests) from a client
        /// </summary>
        /// <param name="requestId"></param>
        /// <param name="label"></param>
        /// <param name="requests"></param>
        /// <returns>RequestId, Error, Record</returns>
        public async Task<JObject> ExecuteTransaction(int requestId, JObject label, JObject[] requests)
        {
            return await ExecuteTransaction(requestId, label, requests, true);
        }

        /// <summary>
        /// Execute a service from a client
        /// A service is just limited to the current user ... no notification done for the other users
        /// </summary>
        /// <param name="service"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns>RequestId, Error, Record</returns>
        public JObject ExecuteService( string service, JObject record, JObject identity)
        {
            if (!Context.Request.User.Identity.IsAuthenticated)
            {
                // Lost the session for unconnecting period ... all changes into the client is definitively lost ... reload the page
                Error($"The user is not authenticated ... Reload the page!");
                return MakeErrorResult("FR", "ERR_UNAUTHENTICATED");
            }

            try
            {
                Info($"Executing the service: ['{service}', '{(record == null ? "null" : record.ToString(Formatting.None))}', '{(identity == null ? "null" : identity.ToString(Formatting.None))}'] ...");

                int userId = int.Parse(Context.Request.User.Identity.Name);

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

                    // Handle a service

                    JObject resultService = requester.ExecuteService(service, record, identity);

                    JObject result = new JObject
                    {
                        ["Result"] = resultService
                    };
                    return result;
                }
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