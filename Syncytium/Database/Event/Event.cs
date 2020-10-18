using Syncytium.Common.Database.DSModel;
using Newtonsoft.Json;

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
    public class Event
    {
        /// <summary>
        /// Event id into the table _Request
        /// </summary>
        public int? EventId { get; set; } = null;

        /// <summary>
        /// Current connection Id of the user
        /// </summary>
        public string ConnectionId { get; set; }

        /// <summary>
        /// CustomerId attached to the connection
        /// </summary>
        public int CustomerId { get; set; }

        /// <summary>
        /// User Id of the user authenticated and connected to the application
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// User's profile
        /// </summary>
        public UserProfile.EUserProfile Profile { get; set; }

        /// <summary>
        /// Current Area (module) of the user
        /// </summary>
        public string Area { get; set; } = null;

        /// <summary>
        /// ModuleId of the user
        /// </summary>
        public int ModuleId { get; set; }

        /// <summary>
        /// Convert the record into a string
        /// </summary>
        /// <returns></returns>
        public override string ToString() => JsonConvert.SerializeObject(this);
    }
}