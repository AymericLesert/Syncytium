using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Exception;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Web.Configuration;

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
    /// Uncompress and handle the transaction
    /// </summary>
    public class DSTransaction
    {
        /// <summary>
        /// Event id into the table _Request
        /// </summary>
        public readonly int EventId = 0;

        /// <summary>
        /// Current connection Id of the user
        /// </summary>
        public readonly string ConnectionId = String.Empty;

        /// <summary>
        /// CustomerId attached to the connection
        /// </summary>
        public readonly int CustomerId = -1;

        /// <summary>
        /// User Id of the user authenticated and connected to the application
        /// </summary>
        public readonly int UserId = -1;

        /// <summary>
        /// User's profile
        /// </summary>
        public readonly UserProfile.EUserProfile Profile = UserProfile.EUserProfile.None;

        /// <summary>
        /// Current Area (module) of the user
        /// </summary>
        public readonly string Area = String.Empty;

        /// <summary>
        /// ModuleId of the user
        /// </summary>
        public readonly int ModuleId = -1;

        /// <summary>
        /// RequestId of the event
        /// </summary>
        public readonly int RequestId = -1;

        /// <summary>
        /// Label of the transaction
        /// </summary>
        public readonly JObject Label = null;

        /// <summary>
        /// List of all requests included into the transaction
        /// </summary>
        [JsonIgnore]
        public readonly List<DSRequest> Requests = null;

        /// <summary>
        /// List of requests grouped by lot
        /// </summary>
        [JsonIgnore]
        public readonly List<List<DSRequest>> LotRequests = null;

        /// <summary>
        /// List of compressed requests included into the transaction
        /// </summary>
        [JsonIgnore]
        public readonly JObject[] CompressedRequests = null;

        /// <summary>
        /// True if the transaction is a transaction, False if the transaction is just a request
        /// </summary>
        public readonly bool Transaction = false;

        /// <summary>
        /// True if the notification must be sent to the caller
        /// </summary>
        public readonly bool Notify = false;

        /// <summary>
        /// Add the tick value for every request
        /// </summary>
        /// <param name="tick"></param>
        public void SetNewTick(int tick)
        {
            foreach(DSRequest request in Requests)
            {
                tick++;
                request.NewTick = tick;
            }
        }

        /// <summary>
        /// Build a request from a compressed request
        /// </summary>
        /// <param name="records"></param>
        /// <param name="i"></param>
        /// <returns></returns>
        private JObject GetArrayIndex(JObject records, int i)
        {
            JObject newObject = new JObject();

            foreach( JProperty property in records.Properties())
            {
                JToken value = property.Value[i];

                if (value.Type != JTokenType.Undefined)
                    newObject[property.Name] = value;
            }

            return newObject;
        }

        /// <summary>
        /// Convert a list of requests from the client into a transaction
        /// </summary>
        /// <param name="eventId"></param>
        /// <param name="connectionId"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="profile"></param>
        /// <param name="area"></param>
        /// <param name="moduleId"></param>
        /// <param name="requestId"></param>
        /// <param name="label"></param>
        /// <param name="requests">List of requests from the client</param>
        /// <param name="transaction"></param>
        /// <param name="notify"></param>
        public DSTransaction(int eventId,
            string connectionId,
            int customerId,
            int userId,
            UserProfile.EUserProfile profile,
            string area,
            int moduleId,
            int requestId,
            JObject label,
            JObject[] requests,
            bool transaction,
            bool notify)
        {
            EventId = eventId;
            ConnectionId = connectionId;
            CustomerId = customerId;
            UserId = userId;
            Profile = profile;
            Area = area;
            ModuleId = moduleId;
            RequestId = requestId;
            Label = label;
            CompressedRequests = requests;
            Transaction = transaction;
            Notify = notify;

            // Uncompress transaction

            int index = 0;
            Requests = new List<DSRequest>();
            LotRequests = new List<List<DSRequest>>();

            foreach (JObject request in requests)
            {
                // Retrieve the current request

                string table = null;
                if (request["table"] != null &&
                    request["table"].Type == JTokenType.String)
                    table = request["table"].ToObject<string>();

                string action = null;
                if (request["action"] != null &&
                    request["action"].Type == JTokenType.String)
                    action = request["action"].ToObject<string>();

                if (table == null ||
                    action == null ||
                    !(request["identity"] is JObject identity) ||
                    !(request["record"] is JObject record))
                {
                    Logger.LoggerManager.Instance.Error("DSTransaction", $"The request[{index}] isn't correctly formatted!");
                    throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");
                }

                // Build a request or a list of requests

                JToken tick = request["tick"];
                int? tickValue = null;
                List<DSRequest> currentLot = new List<DSRequest>();

                LotRequests.Add(currentLot);

                if (tick == null || tick.Type != JTokenType.Array)
                {
                    if (tick != null && tick.Type != JTokenType.Undefined && tick.Type != JTokenType.Null)
                        tickValue = tick.ToObject<int>();

                    DSRequest newRequest = new DSRequest(index, table, action, record, identity, tickValue, request, -1);

                    Requests.Add(newRequest);
                    currentLot.Add(newRequest);

                    index++;
                    continue;
                }

                JArray ticks = tick as JArray;
                for (int i = 0; i < ticks.Count; i++)
                {
                    JObject transactionRecord;
                    JObject transactionIdentity;

                    if (ticks[i].Type != JTokenType.Undefined && ticks[i].Type != JTokenType.Null)
                        tickValue = ticks[i].ToObject<int>();

                    if ( action == "Update")
                    {
                        transactionRecord = new JObject();
                        transactionIdentity = new JObject();

                        transactionRecord["New"] = GetArrayIndex(record["New"] as JObject, i);
                        transactionRecord["Old"] = GetArrayIndex(record["Old"] as JObject, i);
                        transactionIdentity["New"] = GetArrayIndex(identity["New"] as JObject, i);
                        transactionIdentity["Old"] = GetArrayIndex(identity["Old"] as JObject, i);
                    }
                    else
                    {
                        transactionRecord = GetArrayIndex(record, i);
                        transactionIdentity = GetArrayIndex(identity, i);
                    }

                    DSRequest newRequest = new DSRequest(index, table, action, transactionRecord, transactionIdentity, tickValue, request, i);

                    Requests.Add(newRequest);
                    currentLot.Add(newRequest);

                    index++;
                }
            }
        }
    }
}
