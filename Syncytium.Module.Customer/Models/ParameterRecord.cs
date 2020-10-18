using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Database.DSAnnotation;
using Syncytium.Common.Database.DSAnnotation.DSConstraint;
using Syncytium.Common.Database.DSAnnotation.DSControl;
using Syncytium.Common.Database.DSAnnotation.DSFormat;
using System;
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

namespace Syncytium.Module.Customer.Models
{
    /// <summary>
    /// Global parameters
    /// </summary>
    [Table("Parameter")]
    [DSLot(Capacity = 16)]
    [DSRestricted(Area = DatabaseContext.AREA_NAME, Action = "*", Profile = UserProfile.EUserProfile.Supervisor)]
    [DSRestricted(Area = DatabaseContext.AREA_NAME, Action = "*", Profile = UserProfile.EUserProfile.Administrator)]
    [DSRestricted(Area = "*", Action = "Read")]
    public class ParameterRecord : DSRecordWithCustomerId
    {
        /// <summary>
        /// Key of the parameter
        /// </summary>
        [Required]
        [DSString(Max = 32)]
        [DSUnique]
        public String Key { get; set; } = String.Empty;

        /// <summary>
        /// Long description of the parameter
        /// </summary>
        [Required]
        [DSString(Max = 256)]
        public String Description { get; set; } = String.Empty;

        /// <summary>
        /// Value assigned to the parameter
        /// </summary>
        [DSString(Max = 64)]
        public String Value { get; set; } = null;

        /// <summary>
        /// Empty constructor
        /// </summary>
        public ParameterRecord() : base () { }
    }
}
