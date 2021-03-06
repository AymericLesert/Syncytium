﻿using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

namespace Syncytium.Common.Database.DSModel
{
    /// <summary>
    /// This tables stores some internal parameters managed by the application itself
    /// For example:
    ///  * Database.Version : current version of the database (based on the upgrade script)
    ///  * Database.Update  : date time of the last upgrade
    ///  * Database.Tick    : Last tick having updated the database
    ///          (different that Timestamp - in same case, you may have the same timestamp for 2 updates)
    ///          (by using a Tick, you are sure to have 2 differents values for 2 updates)
    /// </summary>
    [Table("_Parameter")]
    public class ParameterRecord
    {
        /// <summary>
        /// Key of the parameter
        /// </summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public string Key { get; set; } = string.Empty;

        /// <summary>
        /// Value of the parameter
        /// </summary>
        public string Value { get; set; } = string.Empty;

        /// <summary>
        /// Convert the record into a string
        /// </summary>
        /// <returns></returns>
        public override string ToString() => JsonConvert.SerializeObject(this);
    }
}