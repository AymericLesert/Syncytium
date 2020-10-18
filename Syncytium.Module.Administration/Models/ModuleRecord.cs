using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Database.DSAnnotation;
using Syncytium.Common.Database.DSAnnotation.DSConstraint;
using Syncytium.Common.Database.DSAnnotation.DSControl;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Syncytium.Common.Managers;

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

namespace Syncytium.Module.Administration.Models
{
    /// <summary>
    /// Handle the list of functional modules
    /// </summary>
    [Table("Module")]
    [DSLot(Capacity = 16)]
    [DSRestricted(Area = DatabaseContext.AREA_NAME, Action = "*", Profile = UserProfile.EUserProfile.Administrator)]
    [DSRestricted(Area = "Customer", Action = "*", Profile = UserProfile.EUserProfile.Supervisor)]
    [DSRestricted(Area = "*", Action = "Read")]
    public class ModuleRecord : DSRecordWithCustomerId, IModule
    {
        #region Enumerate

        /// <summary>
        /// Describe the enumeration of Module
        /// </summary>
        public enum EModule
        {
            /// <summary>Module d'administration : users, modules, labels</summary>
            Administration = 0,
            /// <summary>Customer module ...</summary>
            Customer = 1,
            /// <summary>No module</summary>
            None = 5
        };

        #endregion

        /// <summary>
        /// Name of the module
        /// </summary>
        [Required]
        [DSString(Max = 32)]
        [DSUnique]
        public String Name { get; set; } = String.Empty;

        /// <summary>
        /// Functional module
        /// </summary>
        public EModule Module { get; set; } = EModule.Administration;

        /// <summary>
        /// List of parameters of the module
        /// </summary>
        [DSString(Max = 64)]
        public String Parameters { get; set; } = null;

        /// <summary>
        /// User's profile associated to this module
        /// </summary>
        public Syncytium.Common.Database.DSModel.UserProfile.EUserProfile Profile { get; set; } = Syncytium.Common.Database.DSModel.UserProfile.EUserProfile.User;

        /// <summary>
        /// Long description of the module
        /// </summary>
        [DSString(Max = 256)]
        public String Description { get; set; } = null;

        /// <summary>
        /// Module available ?
        /// </summary>
        public bool Enable { get; set; } = true;

        /// <summary>
        /// Empty constructor
        /// </summary>
        public ModuleRecord() : base() { }
    }
}
