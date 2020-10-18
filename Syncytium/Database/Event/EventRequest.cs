using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

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

namespace Syncytium.Web.Database.Event
{
    /// <summary>
    /// Handle an event into the queue
    /// </summary>
    public class EventRequest : Event
    {
        /// <summary>
        /// RequestId of the event
        /// </summary>
        public int RequestId { get; set; }

        /// <summary>
        /// Label of the transaction
        /// </summary>
        public JObject Label{ get; set; }

        /// <summary>
        /// List of request included into the transaction
        /// </summary>
        [JsonIgnore]
        public JObject[] Requests { get; set; }

        /// <summary>
        /// True if the transaction is a transaction, False if the transaction is just a request
        /// </summary>
        public bool Transaction { get; set; }

        /// <summary>
        /// True if the notification must be sent to the caller
        /// </summary>
        public bool Notify { get; set; }
    }
}