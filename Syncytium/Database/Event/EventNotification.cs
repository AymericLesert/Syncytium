using Syncytium.Common.Database.DSSchema;
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
    /// Handle a notification into the queue
    /// </summary>
    public class EventNotification : Event
    {
        /// <summary>
        /// TickNumber of the request notified
        /// </summary>
        public long Tick { get; set; }

        /// <summary>
        /// Label of the transaction
        /// </summary>
        public JObject Label{ get; set; }

        /// <summary>
        /// The status before and after all executed requests
        /// </summary>
        public DSCache Cache { get; set; }
    }
}