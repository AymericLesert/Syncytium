using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

namespace Syncytium.Common.Database.DSModel
{
    /// <summary>
    /// This table stores current connection information to avoid that the same user is
    /// connected twice to the application on the same machine.
    /// 
    /// In case of auto-scale(as the features allowed by the cloud azure), a user can be
    /// connected to a server and can be switched to another server in case of abnormal
    /// situation.
    /// </summary>
    [Table("_Connection")]
    public class ConnectionRecord
    {
        /// <summary>
        /// Current connection Id of the user
        /// </summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public string ConnectionId { get; set; }

        /// <summary>
        /// Name of the machine running the server
        /// </summary>
        public string Machine { get; set; }

        /// <summary>
        /// User Id of the user authenticated and connected to the application
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Indicates if the connection is allowed to send request or to receive notification
        /// </summary>
        public bool Allow { get; set; } = false;

        /// <summary>
        /// User's profile
        /// </summary>
        public UserProfile.EUserProfile Profile { get; set; } = UserProfile.EUserProfile.Other;

        /// <summary>
        /// Current Area (module) of the user
        /// </summary>
        public string Area { get; set; } = null;

        /// <summary>
        /// ModuleId of the user (action launched within its connection)
        /// </summary>
        public int ModuleId { get; set; } = -1;

        /// <summary>
        /// Indicates if the connection is initialized or not
        /// </summary>
        public bool Status { get; set; } = false;

        /// <summary>
        /// Timestamp of the first connection
        /// </summary>
        public DateTime ConnectionDate { get; set; }

        /// <summary>
        /// Timestamp of the last exchange
        /// </summary>
        public DateTime ConnectionLast { get; set; }

        /// <summary>
        /// CustomerId attached to the connection
        /// </summary>
        public int CustomerId { get; set; }

        /// <summary>
        /// Convert the record into a string
        /// </summary>
        /// <returns></returns>
        public override string ToString() => JsonConvert.SerializeObject(this);
    }
}