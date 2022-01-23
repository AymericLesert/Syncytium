using Newtonsoft.Json;
using Syncytium.Core.Common.Server.Managers;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

namespace Syncytium.Core.Common.Server.Database.DSModel
{
    /// <summary>
    /// This table stores all requests received (except the details). Just for traceability.
    /// </summary>
    [Table("_Request")]
    public class RequestRecord
    {
        /// <summary>
        /// Id of the request
        /// </summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        /// <summary>
        /// Current connection Id of the user
        /// </summary>
        public string ConnectionId { get; set; } = String.Empty;

        /// <summary>
        /// CustomerId attached to the request
        /// </summary>
        public int CustomerId { get; set; }

        /// <summary>
        /// UserId of the requester
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// RequestId of the requester
        /// </summary>
        public int RequestId { get; set; }

        /// <summary>
        /// User's profile
        /// </summary>
        public UserProfile.EUserProfile Profile { get; set; }

        /// <summary>
        /// Area of the request (Administration, Referentiel, ...)
        /// </summary>
        public string Area { get; set; } = string.Empty;

        /// <summary>
        /// ModuleId of the user (action launched within its request)
        /// </summary>
        public int ModuleId { get; set; } = -1;

        /// <summary>
        /// Label of the request sent by the client
        /// </summary>
        [JsonIgnore]
        public String Label { get; set; } = String.Empty;

        /// <summary>
        /// Request sent by the client
        /// </summary>
        [JsonIgnore]
        public byte[]? Request { get; set; } = null;

        /// <summary>
        /// True if the request is a transaction
        /// </summary>
        public bool? Transaction { get; set; } = null;

        /// <summary>
        /// True if the client must be notified by its own request
        /// </summary>
        public bool? Notify { get; set; } = null;

        /// <summary>
        /// Service name
        /// </summary>
        public string Service { get; set; } = String.Empty;

        /// <summary>
        /// Timestamp of the reception
        /// </summary>
        public DateTime? ReceptionDate { get; set; } = null;

        /// <summary>
        /// Timestamp of the execution
        /// </summary>
        public DateTime? ExecutionDate { get; set; } = null;

        /// <summary>
        /// True if the request was successfully run
        /// </summary>
        public bool? Acknowledge { get; set; } = null;

        /// <summary>
        /// Convert the record into a string
        /// </summary>
        /// <returns></returns>
        public override string ToString() => JsonConvert.SerializeObject(this);
    }
}