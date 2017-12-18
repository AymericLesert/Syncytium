using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Database.DSAnnotation;
using Syncytium.Common.Database.DSAnnotation.DSConstraint;
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

namespace Syncytium.Module.Administration.Models
{
    /// <summary>
    /// Association between users and modules (rights handling)
    /// </summary>
    [Table("UserModule")]
    [DSRestricted(Area = DatabaseContext.AREA_NAME, Action = "*", Profile = UserProfile.EUserProfile.Administrator)]
    [DSRestricted(Area = "*", Action = "Read")]
    public class UserModuleRecord : DSRecordWithCustomerId
    {
        /// <summary>
        /// User
        /// </summary>
        [DSForeignKey("ERR_USERMODULE_REFERENCE_USER", "User")]
        public int UserId { get; set; } = -1;

        /// <summary>
        /// Functional module
        /// </summary>
        [DSForeignKey("ERR_USERMODULE_REFERENCE_MODULE", "Module")]
        [DSUnique(Fields = new string[] { "UserId" })]
        public int? ModuleId { get; set; } = null;

        /// <summary>
        /// Module called by default
        /// </summary>
        public bool Default { get; set; } = false;

        /// <summary>
        /// Empty constructor
        /// </summary>
        public UserModuleRecord() : base () { }
    }
}

