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
    /// This table stores all requests received (except the details). Just for traceability.
    /// </summary>
    [Table("_Request")]
    public class RequestRecord
    {
        /// <summary>
        /// Tick of the request
        /// </summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Tick { get; set; }

        /// <summary>
        /// UserId of the requester
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// RequestId of the requester
        /// </summary>
        public int RequestId { get; set; }

        /// <summary>
        /// Area of the request (Administration, Stock, ...)
        /// </summary>
        public string Area { get; set; } = string.Empty;

        /// <summary>
        /// ModuleId of the user (action launched within its request)
        /// </summary>
        public int ModuleId { get; set; } = -1;

        /// <summary>
        /// Table of the request (table into the database)
        /// </summary>
        public string Table { get; set; } = string.Empty;

        /// <summary>
        /// Action of the request (Create, Update, Delete or ... anything else)
        /// </summary>
        public string Action { get; set; } = string.Empty;

        /// <summary>
        /// Id of the object concerned by this action
        /// </summary>
        public int? Id { get; set; } = null;

        /// <summary>
        /// Indicates if the request is successfully executed or not (null if exception)
        /// </summary>
        public bool? Acknowledge { get; set; }

        /// <summary>
        /// Timestamp of the reception of the request
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// CustomerId attached to the request
        /// </summary>
        public int CustomerId { get; set; }

        /// <summary>
        /// Convert the record into a string
        /// </summary>
        /// <returns></returns>
        public override string ToString() => JsonConvert.SerializeObject(this);
    }
}