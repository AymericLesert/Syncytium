using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

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

namespace Syncytium.Core.Common.Server.Database.DSSchema

{
    /// <summary>
    /// Uncompress and handle the transaction
    /// </summary>
    public class DSRequest
    {
        /// <summary>
        /// Id of the request
        /// </summary>
        public readonly int Id;

        /// <summary>
        /// Table name
        /// </summary>
        public readonly string Table = String.Empty;

        /// <summary>
        /// Action
        /// </summary>
        public readonly string Action = String.Empty;

        /// <summary>
        /// Detail of the request
        /// </summary>
        public readonly JObject Record;

        /// <summary>
        /// Detail of identities
        /// </summary>
        public readonly JObject Identity;

        /// <summary>
        /// Tick of the last updated request
        /// </summary>
        public readonly int? Tick;

        /// <summary>
        /// Reference on the request into the transaction
        /// </summary>
        [JsonIgnore]
        public readonly JObject Request;

        /// <summary>
        /// Index of the request into the compressed request
        /// </summary>
        public readonly int RequestIndex;

        /// <summary>
        /// Set the recordId of the request
        /// </summary>
        public int RecordId = -1;

        /// <summary>
        /// Set the tick value of the request after executing request
        /// </summary>
        public int NewTick = -1;

        /// <summary>
        /// Convert the record into a string
        /// </summary>
        /// <returns></returns>
        public override string ToString() => JsonConvert.SerializeObject(this);

        /// <summary>
        /// Update the property of the record pointed by the request
        /// </summary>
        /// <param name="attribute"></param>
        /// <param name="value"></param>
        public void SetRecord(string attribute, JToken value)
        {
            // Update DSTransaction and its requests attached

            Record[attribute] = value;

            if (Request["record"] is not JObject record)
                return;

            if (Action == "Update" && record["New"] is JObject newRecord)
                record = newRecord;

            if (RequestIndex >= 0)
            {
                if (record[attribute] is not JArray values)
                {
                    values = new JArray();
                    record[attribute] = values;
                }

                for (int i = values.Count; i <= RequestIndex; i++)
                    values.Add(JValue.CreateUndefined());
                values[RequestIndex] = value;
            }
            else
            {
                record[attribute] = value;
            }
        }

        /// <summary>
        /// Update the current request before acknowledging the transaction
        /// </summary>
        /// <param name="newRecord"></param>
        public void UpdateRecord(JObject newRecord)
        {
            // Get the request to update

            if (Request["record"] is not JObject target)
                return;

            if (Action == "Update" && target["New"] is JObject record)
                target = record;

            if ( RequestIndex < 0 )
            {
                // Remove attributes not used

                List<String> propertiesToDelete = new();
                foreach (JProperty property in target.Properties())
                {
                    if (newRecord[property.Name] == null)
                        propertiesToDelete.Add(property.Name);
                }

                foreach(String name in propertiesToDelete)
                {
                    target.Remove(name);
                }

                // Update or create attributes

                foreach (JProperty property in newRecord.Properties())
                {
                    target[property.Name] = property.Value;
                }
            }
            else
            {
                // Remove attributes not used

                if ( RequestIndex == 0)
                {
                    List<String> propertiesToDelete = new();
                    foreach (JProperty property in target.Properties())
                    {
                        if (newRecord[property.Name] == null)
                            propertiesToDelete.Add(property.Name);
                    }

                    foreach (String name in propertiesToDelete)
                    {
                        target.Remove(name);
                    }
                }

                // Update or create attributes

                foreach (JProperty property in newRecord.Properties())
                {
                    if (target[property.Name] is not JArray values)
                    {
                        values = new JArray();
                        target[property.Name] = values;
                    }

                    for (int i = values.Count; i <= RequestIndex; i++)
                        values.Add(JValue.CreateUndefined());
                    values[RequestIndex] = property.Value;
                }
            }
        }

        /// <summary>
        /// Describe a request from a transaction
        /// </summary>
        /// <param name="id"></param>
        /// <param name="table"></param>
        /// <param name="action"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <param name="tick"></param>
        /// <param name="request"></param>
        /// <param name="requestIndex"></param>
        public DSRequest(int id,
                         string table,
                         string action,
                         JObject record,
                         JObject identity,
                         int? tick,
                         JObject request,
                         int requestIndex)
        {
            Id = id;

            Table = table;
            Action = action;
            Record = record;
            Identity = identity;
            Tick = tick;

            Request = request;
            RequestIndex = requestIndex;
        }
    }
}
