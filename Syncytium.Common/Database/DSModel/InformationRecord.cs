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
    /// This table stores some details about a record into the database:
    ///    - Creation information(used to link 2 requests by the ids from the client)
    ///    - Update information(used to synchronize data and to check if somebody has updated record at the same time)
    ///    - Delete information(any record are physically deleted in the database schema - virtual deleted)
    /// </summary>
    [Table("_Information")]
    public class InformationRecord
    {
        /// <summary>
        /// Table name
        /// </summary>
        [Key, Column(Order = 0)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public string Table { get; set; } = String.Empty;

        /// <summary>
        /// Id of the record into the table
        /// </summary>
        [Key, Column(Order = 1)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; } = -1;

        /// <summary>
        /// CustomerId of the record from the client side of the CreateUserId
        /// </summary>
        public int CustomerId { get; set; } = 1;

        /// <summary>
        /// Id of the record from the client side of the CreateUserId
        /// </summary>
        public int? CreateId { get; set; } = null;

        /// <summary>
        /// UserId having created this record
        /// </summary>
        public int? CreateUserId { get; set; } = null;

        /// <summary>
        /// Tick having created this record
        /// </summary>
        public int? CreateTick { get; set; } = null;

        /// <summary>
        /// Timestamp of the creation
        /// </summary>
        public DateTime? CreateDate { get; set; } = null;

        /// <summary>
        /// Last UserId having updated this record
        /// </summary>
        public int? UpdateUserId { get; set; } = null;

        /// <summary>
        /// Last Tick having updated this record
        /// </summary>
        public int? UpdateTick { get; set; } = null;

        /// <summary>
        /// Timestamp of the last update
        /// </summary>
        public DateTime? UpdateDate { get; set; } = null;

        /// <summary>
        /// UserId having deleted this record
        /// </summary>
        public int? DeleteUserId { get; set; } = null;

        /// <summary>
        /// Tick having deleted this record
        /// </summary>
        public int? DeleteTick { get; set; } = null;

        /// <summary>
        /// Timestamp of the deletion
        /// </summary>
        public DateTime? DeleteDate { get; set; } = null;

        /// <summary>
        /// Convert the record into a string
        /// </summary>
        /// <returns></returns>
        public override string ToString() => JsonConvert.SerializeObject(this);

        /// <summary>
        /// Last tick of the information
        /// </summary>
        [NotMapped]
        public int Tick
        {
            get
            {
                int currentTick = 0;

                if (CreateTick != null)
                    currentTick = CreateTick.Value;
                if (UpdateTick != null && UpdateTick.Value > currentTick)
                    currentTick = UpdateTick.Value;
                if (DeleteTick != null && DeleteTick.Value > currentTick)
                    currentTick = DeleteTick.Value;

                return currentTick;
            }
        }

        /// <summary>
        /// Indicates if the record is deleted
        /// </summary>
        [NotMapped]
        public bool IsDeleted => DeleteTick != null;
    }
}