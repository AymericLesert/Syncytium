using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Newtonsoft.Json;
using Newtonsoft.Json.Bson;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using Microsoft.AspNet.SignalR;
using Syncytium.Common.Database;
using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Database.DSSchema;
using Syncytium.Common.Exception;
using Syncytium.Common.Managers;
using Syncytium.Web.Database.Event;

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
    /// This class handles the queue event
    /// </summary>
    public class DatabaseQueue
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static readonly string MODULE = typeof(DatabaseQueue).Name;

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

        #region HandleEvent

        /// <summary>
        /// Execute a request from a client
        /// </summary>
        /// <param name="hub"></param>
        /// <param name="eventRequest"></param>
        /// <returns>true if the request was successfully executed</returns>
        public bool Execute(IHubContext hub, EventRequest eventRequest)
        {
            dynamic caller = null;
            DSTransaction transaction = null;

            try
            {
                if (hub != null)
                    caller = hub.Clients.Client(eventRequest.ConnectionId);

                // Convert the event into a transaction

                transaction = new DSTransaction(eventRequest.EventId.Value,
                                                eventRequest.ConnectionId,
                                                eventRequest.CustomerId,
                                                eventRequest.UserId,
                                                eventRequest.Profile,
                                                eventRequest.Area,
                                                eventRequest.ModuleId,
                                                eventRequest.RequestId,
                                                eventRequest.Label,
                                                eventRequest.Requests,
                                                eventRequest.Transaction,
                                                eventRequest.Notify);

                // nothing to execute

                if (transaction.Requests == null || transaction.Requests.Count == 0)
                {
                    Info("No requests to execute");

                    if (transaction.Transaction)
                    {
                        if (IsDebug())
                            Debug($"{transaction.ConnectionId} Acknowledge the transaction");

                        if (caller != null)
                            caller.acknowledgeTransaction(transaction.RequestId, transaction.Area, transaction.CompressedRequests, null);

                        return true;
                    }

                    if (IsDebug())
                        Debug($"{transaction.ConnectionId} Acknowledge the request");

                    if (caller != null)
                        caller.acknowledgeRequest(transaction.RequestId, transaction.Area, "", "", null, null, null);

                    return true;
                }

                Info($"Executing the transaction [{transaction.RequestId} - '{transaction.Label.ToString(Formatting.None)}'] containing {transaction.Requests.Count} requests ...");

                // From the current user, check if the user can update database

                using (DatabaseManager requester = Syncytium.Managers.DatabaseManager.CreateDatabase(transaction.Area, transaction.ConnectionId, transaction.UserId))
                {
                    DSDatabase schema = ConfigurationManager.Schemas[transaction.Area];
                    if (schema == null)
                    {
                        Error($"The schema of the module '{transaction.Area}' doesn't exist!");
                        throw new ExceptionDefinitionRecord("ERR_SCHEMA");
                    }

                    // Update the cache manager

                    if (IsDebug())
                        Debug("Step 1 - Updating cache ...");

                    DatabaseCacheManager.Instance.UpdateCache(requester.Database, transaction.CustomerId, Syncytium.Managers.DatabaseManager.GetDatabase);

                    // Define a cache to handle the list of notifications

                    DSCache cache = requester.Database.GetCache(schema);

                    // Execute an treatment just before executing the transaction

                    if (IsDebug())
                        Debug("Step 2 - Preparing the execution of the transaction ...");

                    foreach (DSRequest request in transaction.Requests)
                    {
                        if (IsVerboseAll())
                            Verbose($"Preparing the execution of the request[{request.Id}] ...");

                        requester.Database.PrepareRequest(cache, transaction.UserId, request.Table, request.Action, request.Record, request.Identity);
                    }

                    if (IsDebug())
                        Debug($"{transaction.Requests.Count} requests prepared in the transaction");

                    // Getting ids of all records described into the transaction

                    if (IsDebug())
                        Debug("Step 3 - Getting ids of all requests into the transaction ...");

                    foreach (DSRequest request in transaction.Requests)
                    {
                        if (IsVerboseAll())
                            Verbose($"Getting Id of the request[{request.Id}] ...");

                        request.RecordId = schema.GetRecordId(requester.Database, transaction.UserId, request.Table, request.Action, request.Record, request.Identity);
                    }

                    if (IsDebug())
                        Debug($"{transaction.Requests.Count} ids gotten in the transaction");

                    // Retrieve the list of records concerned by this update before updating database for each users except the current connection

                    if (IsDebug())
                        Debug("Step 4 - Getting the database status just before executing the transaction ...");

                    List<ConnectionRecord> connections = requester.Database._Connection.Where(c => c.Allow && c.Status &&
                                                                                              c.CustomerId == transaction.CustomerId &&
                                                                                              c.Profile != UserProfile.EUserProfile.None &&
                                                                                              (!c.ConnectionId.Equals(transaction.ConnectionId) ||
                                                                                              !c.Machine.Equals(Environment.MachineName))).ToList();

                    // For each user connected ... and having at least one update

                    foreach (ConnectionRecord connection in connections)
                    {
                        if (IsVerbose())
                            Verbose($"{connection.ConnectionId} Getting the database status just before executing the transaction ...");

                        cache.SetBefore(connection.ConnectionId);

                        foreach (DSRequest request in transaction.Requests)
                        {
                            if (IsVerboseAll())
                                Verbose($"{connection.ConnectionId} Getting the database status just before executing the request[{request.Id}] ...");

                            requester.Database.GetListRecordsConcernedByUpdate(cache,
                                                                                request.Table,
                                                                                request.RecordId,
                                                                                connection.CustomerId,
                                                                                connection.UserId,
                                                                                connection.Profile,
                                                                                connection.Area,
                                                                                true,
                                                                                null,
                                                                                null);
                        }
                    }

                    if (IsDebug())
                        Debug("Database status gotten just before executing the transaction");

                    // Execute the transaction and update the database

                    if (IsDebug())
                        Debug("Step 5 - Executing the transaction ...");

                    List<Tuple<DSRecord, InformationRecord>> recordsTreated = requester.ExecuteTransaction(transaction);

                    if (IsDebug())
                        Debug("Transaction executed");

                    if (recordsTreated == null)
                    {
                        Info("No result for the transaction!");

                        if (IsDebug())
                            Debug("Step 6 - Acknowledging the transaction ...");

                        if (transaction.Transaction)
                        {
                            if (caller != null)
                                caller.acknowledgeTransaction(transaction.RequestId, transaction.Area, transaction.CompressedRequests, null);
                        }
                        else
                        {
                            if (caller != null)
                                caller.acknowledgeRequest(transaction.RequestId, transaction.Area, "", "", null, null, null);
                        }

                        if (IsDebug())
                            Debug($"{transaction.ConnectionId} Transaction acknowledged");

                        Info($"Transaction [{transaction.RequestId}] completely executed");
                        return true;
                    }

                    // Getting the list of records concerned by this update after updating database for myself only

                    if (IsDebug())
                        Debug("Step 6 - Getting the database status just after executing the transaction for the caller (Prepare the acknowledgement) ...");

                    cache.SetAfter(transaction.ConnectionId);

                    foreach (DSRequest request in transaction.Requests)
                    {
                        DSRecord recordTreated = recordsTreated[request.Id].Item1;
                        if (recordTreated == null)
                        {
                            Warn($"Request[{request.Id}] has no record!");
                            continue;
                        }

                        if (IsVerboseAll())
                            Verbose($"{transaction.ConnectionId} Getting the database status just after executing the request[{request.Id}] ...");

                        requester.Database.GetListRecordsConcernedByUpdate(cache,
                                                                           request.Table,
                                                                           recordTreated.Id,
                                                                           transaction.CustomerId,
                                                                           transaction.UserId,
                                                                           transaction.Profile,
                                                                           transaction.Area,
                                                                           true,
                                                                           recordTreated,
                                                                           null);
                    }

                    if (IsDebug())
                        Debug("Database status gotten just after executing the transaction for the caller");

                    // acknowledge to the caller (ignore all exceptions) before sending the result to the caller

                    if (IsDebug())
                        Debug("Step 7 - Acknowledging the transaction ...");

                    int notificationTick = 0;

                    try
                    {
                        foreach (DSRequest request in transaction.Requests)
                        {
                            DSRecord recordTreated = recordsTreated[request.Id].Item1;
                            if (recordTreated == null)
                                continue;

                            if (!schema.FilterRecord(recordTreated, transaction.Area, transaction.UserId, transaction.Profile, request))
                            {
                                Error($"Conversion of the result of the transaction[{request.Id}] into a JSON in error!");
                                continue;
                            }

                            notificationTick = recordTreated._tick;

                            if (!recordTreated._deleted && cache.Is(request.Table, recordTreated.Id) != true)
                            {
                                if (IsDebug())
                                {
                                    Debug($"Notify to the current client that this record[{request.Id}] is deleted because it's not yet concerned by this record!");
                                }

                                request.SetRecord("_deleted", true);
                            }

                            // Acknowledge the request

                            if (!transaction.Transaction)
                            {
                                if (IsVerboseAll())
                                {
                                    Verbose($"{transaction.ConnectionId} Acknowledging the request[{request.Id}] ...");
                                }

                                if (caller != null)
                                {
                                    caller.acknowledgeRequest(transaction.RequestId, transaction.Area, request.Table, request.Action, request.Record, request.Identity, null);
                                }
                            }
                        }

                        // Acknowledge the transaction

                        if (transaction.Transaction)
                        {
                            if (IsVerboseAll())
                            {
                                Verbose($"{transaction.ConnectionId} Acknowledging the transaction ...");
                            }

                            if (caller != null)
                            {
                                caller.acknowledgeTransaction(transaction.RequestId, transaction.Area, transaction.CompressedRequests, null);
                            }

                            if (transaction.Notify)
                            {
                                caller.endNotification(notificationTick, transaction.Label);
                            }
                        }
                    }
                    catch (System.Exception ex)
                    {
                        Exception("An exception occurs on acknowledging the transaction. But, continue informing all other clients ...", ex);
                    }

                    if (IsDebug())
                        Debug("Transaction acknowledged");

                    // The request was executed ... notify all clients (except himself) that something has changed
                    // In some cases, new client or client disconnected while executing a request

                    // For each user connected ... and having at least one update

                    if (IsDebug())
                        Debug("Step 8 - Getting the database status just after executing the transaction for the clients ...");

                    foreach (ConnectionRecord connection in connections)
                    {
                        if (IsVerboseAll())
                            Verbose($"{connection.ConnectionId} Getting the database status just after executing the transaction ...");

                        cache.SetAfter(connection.ConnectionId);

                        foreach (DSRequest request in transaction.Requests)
                        {
                            DSRecord recordTreated = recordsTreated[request.Id].Item1;
                            if (recordTreated == null)
                                continue;

                            if (IsVerbose())
                                Verbose($"{connection.ConnectionId} Getting the database status just after executing the request[{request.Id}] ...");

                            requester.Database.GetListRecordsConcernedByUpdate(cache,
                                                                               request.Table,
                                                                               recordTreated.Id,
                                                                               connection.CustomerId,
                                                                               connection.UserId,
                                                                               connection.Profile,
                                                                               connection.Area,
                                                                               true,
                                                                               recordTreated,
                                                                               null);
                        }
                    }

                    if (IsDebug())
                        Debug("Database status gotten just before executing the transaction");

                    // Queueing the notifications to sent to all clients

                    if (IsDebug())
                        Debug("Step 9 - Queuing notifications to all clients ...");

                    foreach (ConnectionRecord connection in connections)
                    {
                        if (IsVerboseAll())
                            Verbose($"{connection.ConnectionId} Queuing notifications ...");

                        QueueNotification.Post(new EventNotification
                        {
                            ConnectionId = connection.ConnectionId,
                            CustomerId = connection.CustomerId,
                            UserId = connection.UserId,
                            Profile = connection.Profile,
                            Area = connection.Area,
                            ModuleId = connection.ModuleId,
                            Tick = notificationTick,
                            Label = transaction.Label,
                            Cache = cache
                        });
                    }

                    if (IsDebug())
                        Debug($"{connections.Count} clients notified");
                }

                Info($"Transaction [{transaction.RequestId}] completely executed");
                return true;
            }
            catch (ExceptionDefinitionRecord ex)
            {
                JObject error = DatabaseHub.MakeErrorResult(eventRequest.RequestId, ex.Errors);
                Error($"The transaction '{eventRequest.RequestId}' can't be executed due to some errors ({JsonConvert.SerializeObject(ex.Errors)})");

                if (eventRequest.Transaction)
                {
                    if (IsDebug())
                        Debug($"{eventRequest.ConnectionId} Acknowledge the transaction");

                    if (caller != null)
                        caller.acknowledgeTransaction(eventRequest.RequestId, eventRequest.Area, eventRequest.Requests, error);

                    return false;
                }

                if (IsDebug())
                    Debug($"{eventRequest.ConnectionId} Acknowledge the request");

                if (caller != null)
                    caller.acknowledgeRequest(eventRequest.RequestId, eventRequest.Area, "", "", null, null, error);

                return false;
            }
            catch (System.Exception ex)
            {
                JObject error = DatabaseHub.MakeErrorResult(eventRequest.RequestId, "ERR_EXCEPTION_UNEXPECTED");
                Exception("An exception occurs on executing the transaction", ex);

                if (eventRequest.Transaction)
                {
                    if (IsDebug())
                        Debug($"{eventRequest.ConnectionId} Acknowledge the transaction");

                    if (caller != null)
                        caller.acknowledgeTransaction(eventRequest.RequestId, eventRequest.Area, eventRequest.Requests, error);

                    return false;
                }

                if (IsDebug())
                    Debug($"{eventRequest.ConnectionId} Acknowledge the request");

                if (caller != null)
                    caller.acknowledgeRequest(eventRequest.RequestId, eventRequest.Area, "", "", null, null, error);

                return false;
            }
        }

        /// <summary>
        /// Execute a service from a client
        /// A service is just limited to the current user ... no notification done for the other users
        /// </summary>
        /// <param name="hub"></param>
        /// <param name="eventService"></param>
        /// <returns>true if the request was successfully executed</returns>
        public bool Execute(IHubContext hub, EventService eventService)
        {
            JObject resultService = null;
            bool status = true;

            try
            {
                Info($"Executing the service('{eventService.Service}') : '{(eventService.Record == null ? "null" : eventService.Record.ToString(Formatting.None))}', '{(eventService.Identity == null ? "null" : eventService.Identity.ToString(Formatting.None))}' ...");

                using (DatabaseManager requester = Syncytium.Managers.DatabaseManager.CreateDatabase(eventService.Area, eventService.ConnectionId, eventService.UserId))
                {
                    // Handle a service

                    resultService = new JObject
                    {
                        ["Result"] = requester.ExecuteService(eventService.CustomerId,
                                                                eventService.UserId,
                                                                eventService.Profile,
                                                                eventService.Area,
                                                                eventService.ModuleId,
                                                                eventService.Service,
                                                                eventService.Record,
                                                                eventService.Identity)
                    };
                }
            }
            catch (ExceptionDefinitionRecord ex)
            {
                Error($"The service '{eventService}' can't be executed due to some errors ({JsonConvert.SerializeObject(ex.Errors)})");
                resultService = DatabaseHub.MakeErrorResult(0, ex.Errors);
                status = false;
            }
            catch (System.Exception ex)
            {
                Exception("An exception occurs on executing the service", ex);
                resultService = DatabaseHub.MakeErrorResult(0, "ERR_EXCEPTION_UNEXPECTED");
                status = false;
            }

            if (hub != null)
                hub.Clients.Client(eventService.ConnectionId).acknowledgeService(eventService.Area, eventService.Service, eventService.Record, eventService.Identity, resultService);

            Info($"Service executed with result '{resultService.ToString(Formatting.None)}'");
            return status;
        }

        /// <summary>
        /// Send notifications to all clients
        /// A service is just limited to the current user ... no notification done for the other users
        /// </summary>
        /// <param name="hub"></param>
        /// <param name="eventNotification"></param>
        public void Execute(IHubContext hub, EventNotification eventNotification)
        {
            try
            {
                Info($"Executing the notification '{eventNotification}' ...");

                List<Tuple<string, DSRecord, DSRecord>> differences = eventNotification.Cache.GetDifferences(eventNotification.ConnectionId);

                if (differences.Count == 0)
                {
                    if (IsDebug())
                    {
                        Debug($"{eventNotification.ConnectionId} No notification");
                    }

                    return;
                }

                Common.Database.DSSchema.DSDatabase schema = ConfigurationManager.Schemas[eventNotification.Area];
                if (schema == null)
                {
                    Error($"The schema of the module '{eventNotification.Area}' doesn't exist!");
                    return;
                }

                if (IsDebug())
                    Debug($"{eventNotification.ConnectionId} [{eventNotification.UserId}] Building differences ...");

                JArray notifications = new JArray();

                foreach (Tuple<string, DSRecord, DSRecord> difference in differences)
                {
                    JObject recordFiltered = null;

                    if (difference.Item2 == null && difference.Item3 == null)
                        continue;

                    if (difference.Item2 == null && difference.Item3 != null)
                    {
                        recordFiltered = schema.FilterRecord(difference.Item3, eventNotification.Area, eventNotification.UserId, eventNotification.Profile);
                        if (recordFiltered == null)
                            continue;

                        recordFiltered["_tick"] = eventNotification.Tick;

                        if (IsVerboseAll())
                            Verbose($"{eventNotification.ConnectionId} [Add ({difference.Item1})] Notification '{recordFiltered.ToString(Formatting.None)}'");

                        notifications.Add(new JObject() { ["table"] = difference.Item1, ["record"] = recordFiltered });
                        continue;
                    }

                    if (difference.Item2 != null && difference.Item3 == null)
                    {
                        recordFiltered = schema.FilterRecord(difference.Item2, eventNotification.Area, eventNotification.UserId, eventNotification.Profile);
                        if (recordFiltered == null)
                            continue;

                        // set the flag _deleted and _tick for the target client because it can't modified it never

                        recordFiltered["_tick"] = eventNotification.Tick;
                        recordFiltered["_deleted"] = true;

                        if (IsVerboseAll())
                            Verbose($"{eventNotification.ConnectionId} [Delete ({difference.Item1})] Notification '{recordFiltered.ToString(Formatting.None)}'");

                        notifications.Add(new JObject() { ["table"] = difference.Item1, ["record"] = recordFiltered });
                        continue;
                    }

                    recordFiltered = schema.FilterRecord(difference.Item3, eventNotification.Area, eventNotification.UserId, eventNotification.Profile);
                    if (recordFiltered == null)
                        continue;

                    JObject oldRecordFiltered = schema.FilterRecord(difference.Item2, eventNotification.Area, eventNotification.UserId, eventNotification.Profile);
                    if (oldRecordFiltered != null && JToken.DeepEquals(oldRecordFiltered, recordFiltered))
                    {
                        if (IsVerboseAll())
                            Verbose($"{eventNotification.ConnectionId} [Unchange ({difference.Item1})] No notification for '{recordFiltered.ToString(Formatting.None)}'");
                        continue;
                    }

                    recordFiltered["_tick"] = eventNotification.Tick;

                    if (IsVerboseAll())
                        Verbose($"{eventNotification.ConnectionId} [Update ({difference.Item1})] Notification '{recordFiltered.ToString(Formatting.None)}'");

                    notifications.Add(new JObject() { ["table"] = difference.Item1, ["record"] = recordFiltered });
                }

                if (IsDebug())
                    Debug($"{eventNotification.ConnectionId} [{eventNotification.UserId}] {notifications.Count} differences found");

                // Send notifications by lot

                if (IsDebug())
                    Debug($"{eventNotification.ConnectionId} [{eventNotification.UserId}] Sending {notifications.Count} notifications ...");

                if (notifications.Count > 0)
                {
                    hub.Clients.Client(eventNotification.ConnectionId).beginNotification(eventNotification.Tick, eventNotification.Label);

                    long lotSize = ConfigurationManager.ConnectionLotSize;
                    long sizeTotal = 0;
                    int startLot = 0;
                    JObject[] lot = null;

                    // Split notification by lot size

                    for (int i = 0; i < notifications.Count; i++)
                    {
                        long sizeNotification = notifications[i].ToString(Formatting.None).Length;

                        if (i > startLot && sizeTotal + sizeNotification > lotSize)
                        {
                            lot = new JObject[i - startLot];
                            for (int j = startLot; j < i; j++)
                                lot[j - startLot] = notifications[j].ToObject<JObject>();

                            if (IsVerboseAll())
                                Verbose($"{eventNotification.ConnectionId} [{eventNotification.UserId}] Sending the lot [{startLot} .. {i - 1}] ...");

                            hub.Clients.Client(eventNotification.ConnectionId).notify(eventNotification.UserId, eventNotification.Label, eventNotification.Area, lot);

                            startLot = i;
                            sizeTotal = 0;
                        }
                        sizeTotal += sizeNotification;
                    }

                    // notify the last lot

                    lot = new JObject[notifications.Count - startLot];
                    for (int j = startLot; j < notifications.Count; j++)
                        lot[j - startLot] = notifications[j].ToObject<JObject>();

                    if (IsVerboseAll())
                        Verbose($"{eventNotification.ConnectionId} [{eventNotification.UserId}] Sending the lot [{startLot} .. {notifications.Count - 1}] ...");

                    hub.Clients.Client(eventNotification.ConnectionId).notify(eventNotification.UserId, eventNotification.Label, eventNotification.Area, lot);

                    hub.Clients.Client(eventNotification.ConnectionId).endNotification(eventNotification.Tick, eventNotification.Label);

                    Info($"{eventNotification.ConnectionId} [{eventNotification.UserId}] {notifications.Count} Notifications sent");
                }
            }
            catch (System.Exception ex)
            {
                Exception($"An exception occurs on notifying the user '{eventNotification.UserId}'", ex);
            }
        }

        #endregion

        #region ThreadStoreRequests

        /// <summary>
        /// Define the transaction and service queue of the server (on Storing requests into the framework database)
        /// </summary>
        private readonly BufferBlock<Event.Event> QueueStoreRequest = new BufferBlock<Event.Event>();

        /// <summary>
        /// Store the current thread reference on handling requests (on storing requests into the framework database)
        /// </summary>
        private Task<int> _consumerStoreRequest = null;

        /// <summary>
        /// JSON Serializer object
        /// </summary>
        private readonly JsonSerializer _jsonSerializer = new JsonSerializer();

        /// <summary>
        /// Thread working in background to update database on depends on a given request (on storing requests into the framework database)
        /// </summary>
        /// <returns>Number of requests executing</returns>

        public async Task<int> ConsumerStoreRequestAsync()
        {
            int nbStoringRequests = 0;

            // At the beginning, reload all requests not closed into the database ... Retry without loosing data

            try
            {
                using (DatabaseContext context = new Syncytium.Module.Administration.DatabaseContext())
                {
                    List<RequestRecord> requestsToReload = context._Request.Where(r => r.Acknowledge == null).OrderBy(r => r.Id).ToList();
                    if (requestsToReload.Count > 0)
                    {
                        Info($"Loading {requestsToReload.Count} requests to execute ...");

                        foreach (RequestRecord request in requestsToReload)
                        {
                            Event.Event newEvent = null;
                            JObject jRequest = null;

                            // Deserialize the request

                            if (request.Request != null)
                            {
                                using (System.IO.MemoryStream memoryStream = new System.IO.MemoryStream(request.Request))
                                {
#pragma warning disable CS0618 // Le type ou le membre est obsolète
                                    using (BsonReader bsonReaderObject = new BsonReader(memoryStream))
#pragma warning disable CS0618 // Le type ou le membre est obsolète
                                        jRequest = _jsonSerializer.Deserialize<JObject>(bsonReaderObject);
                                }
                            }

                            if (request.RequestId < 0)
                            {
                                // Rebuild the service from the database

                                newEvent = new EventService
                                {
                                    EventId = request.Id,
                                    ConnectionId = request.ConnectionId,
                                    CustomerId = request.CustomerId,
                                    UserId = request.UserId,
                                    Profile = request.Profile,
                                    Area = request.Area,
                                    ModuleId = request.ModuleId,
                                    Service = request.Service,
                                    Record = jRequest["Record"].ToObject<JObject>(),
                                    Identity = jRequest["Identity"].ToObject<JObject>()
                                };
                            }
                            else
                            {
                                int nb = 0;
                                while (jRequest[nb.ToString()] != null)
                                    nb++;

                                JObject[] jRequests = new JObject[nb];
                                for (int i = 0; i < nb; i++)
                                    jRequests[i] = jRequest[i.ToString()].ToObject<JObject>();

                                // Rebuild the request from the database

                                newEvent = new EventRequest
                                {
                                    EventId = request.Id,
                                    ConnectionId = request.ConnectionId,
                                    CustomerId = request.CustomerId,
                                    UserId = request.UserId,
                                    Profile = request.Profile,
                                    Area = request.Area,
                                    ModuleId = request.ModuleId,
                                    RequestId = request.RequestId,
                                    Label = request.Label == null ? null : JObject.Parse(request.Label),
                                    Requests = jRequests,
                                    Transaction = request.Transaction.Value,
                                    Notify = request.Notify.Value
                                };
                            }

                            Info($"Queuing the request ['{newEvent}'] ...");
                            QueueRequest.Post(newEvent);
                        }
                    }
                }
            }
            catch(System.Exception ex)
            {
                Exception("Unable to reload requests", ex);
            }

            Info("Thread Storing Requests started");

            while (await QueueStoreRequest.OutputAvailableAsync().ConfigureAwait(false))
            {
                while (QueueStoreRequest.TryReceiveAll(out IList<Event.Event> events))
                {
                    try
                    {
                        DateTime currentDatetime = DateTime.Now;
                        Info($"Storing {events.Count} requests in database ...");

                        List<RequestRecord> requests = new List<RequestRecord>();

                        foreach (Event.Event currentEvent in events)
                        {
                            // The request is correctly executed ... Store a new request

                            using (System.IO.MemoryStream memoryStream = new System.IO.MemoryStream())
                            {
                                RequestRecord newRequest = null;

                                if (currentEvent is EventService service)
                                {
                                    JObject request = new JObject() { ["Record"] = service.Record, ["Identity"] = service.Identity };

#pragma warning disable CS0618 // Le type ou le membre est obsolète
                                    using (BsonWriter bsonWriterObject = new BsonWriter(memoryStream))
#pragma warning restore CS0618 // Le type ou le membre est obsolète
                                        _jsonSerializer.Serialize(bsonWriterObject, request);

                                    newRequest = new RequestRecord
                                    {
                                        ConnectionId = service.ConnectionId,
                                        CustomerId = service.CustomerId,
                                        UserId = service.UserId,
                                        RequestId = -1,
                                        Profile = service.Profile,
                                        Area = service.Area,
                                        ModuleId = service.ModuleId,
                                        Service = service.Service,
                                        Request = memoryStream.ToArray(),
                                        ReceptionDate = currentDatetime
                                    };
                                }
                                else if (currentEvent is EventRequest request)
                                {
#pragma warning disable CS0618 // Le type ou le membre est obsolète
                                    using (BsonWriter bsonWriterObject = new BsonWriter(memoryStream))
#pragma warning restore CS0618 // Le type ou le membre est obsolète
                                        _jsonSerializer.Serialize(bsonWriterObject, request.Requests);

                                    newRequest = new RequestRecord
                                    {
                                        ConnectionId = request.ConnectionId,
                                        CustomerId = request.CustomerId,
                                        UserId = request.UserId,
                                        RequestId = request.RequestId,
                                        Profile = request.Profile,
                                        Area = request.Area,
                                        ModuleId = request.ModuleId,
                                        Label = request.Label == null ? String.Empty : request.Label.ToString(Formatting.None),
                                        Request = memoryStream.ToArray(),
                                        Transaction = request.Transaction,
                                        Notify = request.Notify,
                                        ReceptionDate = currentDatetime
                                    };
                                }

                                requests.Add(newRequest);

                                if (IsVerbose() && newRequest == null)
                                    Verbose("The request 'null' is stored");
                                if (IsVerbose() && newRequest != null)
                                    Verbose($"The request '{newRequest}' is stored");
                            }
                        }

                        using (DatabaseContext context = new Syncytium.Module.Administration.DatabaseContext())
                        {
                            context._Request.AddRange(requests);
                            context.SaveChanges();
                        }

                        Info($"{events.Count} requests stored in database");
                        nbStoringRequests++;

                        int index = 0;
                        foreach (Event.Event currentEvent in events)
                        {
                            if (requests[index] != null)
                                currentEvent.EventId = requests[index].Id;

                            Info($"Queuing the request ['{currentEvent}'] ...");
                            QueueRequest.Post(currentEvent);
                            index++;
                        }
                    }
                    catch(System.Exception ex)
                    {
                        Exception("Unable to store the request", ex);
                    }
                }
            }

            Warn($"Consuming request stopped after {nbStoringRequests} requests stored");
            _consumerStoreRequest = null;
            return nbStoringRequests;
        }

        #endregion

        #region ThreadEvents

        /// <summary>
        /// Define the transaction and service queue of the server
        /// </summary>
        private readonly BufferBlock<Event.Event> QueueRequest = new BufferBlock<Event.Event>();

        /// <summary>
        /// Store the current thread reference on handling requests
        /// </summary>
        private Task<int> _consumerRequest = null;

        /// <summary>
        /// Thread working in background to update database on depends on a given request
        /// </summary>
        /// <returns>Number of requests executing</returns>

        public async Task<int> ConsumerRequestAsync()
        {
            IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<DatabaseHub>();
            int nbRequests = 0;

            Info("Thread Requests started");
            while (await QueueRequest.OutputAvailableAsync().ConfigureAwait(false))
            {
                while (QueueRequest.TryReceive(out Event.Event currentEvent))
                {
                    int nbEvents = QueueRequest.Count;
                    bool status = false;

                    Info($"Consuming the first of the left {nbEvents + 1} requests ['{currentEvent}'] ...");

                    if (currentEvent is EventService service)
                        status = Execute(hub, service);
                    else if (currentEvent is EventRequest request)
                        status = Execute(hub, request);

                    try
                    {
                        using (DatabaseContext context = new Syncytium.Module.Administration.DatabaseContext())
                        {
                            RequestRecord request = context._Request.Find(currentEvent.EventId);
                            if (request != null)
                            {
                                request.ExecutionDate = DateTime.Now;
                                request.Acknowledge = status;
                                context.SaveChanges();
                            }
                        }
                    }
                    catch(System.Exception ex)
                    {
                        Exception("Unable to update Request table", ex);
                    }

                    nbRequests++;
                }
            }

            Warn($"Consuming request stopped after {nbRequests} requests");
            _consumerRequest = null;
            return nbRequests;
        }

        #endregion

        #region ThreadNotifications

        /// <summary>
        /// Define the notification event
        /// </summary>
        private readonly BufferBlock<Event.Event> QueueNotification = new BufferBlock<Event.Event>();

        /// <summary>
        /// Store the current thread reference on handling notification
        /// </summary>
        private Task<int> _consumerNotification = null;

        /// <summary>
        /// Thread working in background to notify all clients
        /// </summary>
        /// <returns>Number of notifications sent</returns>

        public async Task<int> ConsumerNotificationAsync()
        {
            IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<DatabaseHub>();
            int nbNotifications = 0;

            Info("Thread Notification started");
            while (await QueueNotification.OutputAvailableAsync().ConfigureAwait(false))
            {
                while (QueueNotification.TryReceive(out Event.Event currentEvent))
                {
                    int nbEvents = QueueNotification.Count;
                    Info($"Consuming the first of the left {nbEvents + 1} notifications ['{currentEvent}'] ...");

                    if (currentEvent is EventNotification notification)
                        Execute(hub, notification);

                    nbNotifications++;
                }
            }

            Warn($"Consuming notification stopped after {nbNotifications} notifications");
            _consumerNotification = null;
            return nbNotifications;
        }

        #endregion

        #region Producer

        /// <summary>
        /// Add a new request into the queue
        /// </summary>
        /// <param name="connection">Connection properties</param>
        /// <param name="requestId"></param>
        /// <param name="label"></param>
        /// <param name="requests"></param>
        /// <param name="transaction"></param>
        /// <param name="notify">true if the notification must be sent to the caller</param>
        public void Produce(ConnectionRecord connection, int requestId, JObject label, JObject[] requests, bool transaction, bool notify)
        {
            if (_consumerRequest == null)
                throw new ExceptionNotFound($"The queue is not available");

            EventRequest newEvent = new EventRequest
            {
                ConnectionId = connection.ConnectionId,
                CustomerId = connection.CustomerId,
                UserId = connection.UserId,
                Profile = connection.Profile,
                Area = connection.Area,
                ModuleId = connection.ModuleId,
                RequestId = requestId,
                Label = label,
                Requests = requests,
                Transaction = transaction,
                Notify = notify
            };

            Info($"Queuing the request to store ['{newEvent}'] ...");

            QueueStoreRequest.Post(newEvent);
        }

        /// <summary>
        /// Add a new service into the queue
        /// </summary>
        /// <param name="connection"></param>
        /// <param name="service"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        public void Produce(ConnectionRecord connection, string service, JObject record, JObject identity)
        {
            if (_consumerRequest == null)
                throw new ExceptionNotFound($"The queue is not available");

            EventService newEvent = new EventService
            {
                ConnectionId = connection.ConnectionId,
                CustomerId = connection.CustomerId,
                UserId = connection.UserId,
                Profile = connection.Profile,
                Area = connection.Area,
                ModuleId = connection.ModuleId,
                Service = service,
                Record = record,
                Identity = identity
            };

            Info($"Queuing the request to store ['{newEvent}'] ...");

            QueueStoreRequest.Post(newEvent);
        }

        /// <summary>
        /// Stop the consumer
        /// </summary>
        public void StartConsumer()
        {
            if (_consumerRequest != null)
                return;

            Info("Starting the thread notifications ...");
            _consumerNotification = ConsumerNotificationAsync();

            Info("Starting the thread requests ...");
            _consumerRequest = ConsumerRequestAsync();

            Info("Starting the thread storing requests ...");
            _consumerStoreRequest = ConsumerStoreRequestAsync();
        }

        /// <summary>
        /// Stop the consumer
        /// </summary>
        public void StopConsumer()
        {
            Info("Stopping the thread ...");

            if (_consumerStoreRequest != null)
            {
                QueueStoreRequest.Complete();
                _consumerStoreRequest.Wait();

                Debug("The thread storing requests are stopped !");
            }

            if (_consumerRequest != null)
            {
                QueueRequest.Complete();
                _consumerRequest.Wait();

                Debug("The thread requests are stopped !");
            }

            if (_consumerNotification != null)
            {
                QueueNotification.Complete();
                _consumerNotification.Wait();

                Debug("The thread notifications are stopped !");
            }

            Info("Thread stopped !");
        }

        #endregion

        /// <summary>
        /// Instance of the current logger
        /// </summary>
        private static DatabaseQueue _instance = null;

        /// <summary>
        /// Retrieve the current instance or define a new instanceof queue
        /// </summary>
        public static DatabaseQueue Instance
        {
            get
            {
                if (_instance == null)
                    _instance = new DatabaseQueue();

                return _instance;
            }
        }

    }
}