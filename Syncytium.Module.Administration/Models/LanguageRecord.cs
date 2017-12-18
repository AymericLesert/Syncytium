using Syncytium.Common.Database.DSAnnotation;
using Syncytium.Common.Database.DSAnnotation.DSConstraint;
using Syncytium.Common.Database.DSAnnotation.DSControl;
using Syncytium.Common.Database.DSModel;
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

namespace Syncytium.Module.Administration.Models
{
    /// <summary>
    /// Describe the multi lingual ressources
    /// </summary>
    [Table("Language")]
    [DSRestricted(Area = DatabaseContext.AREA_NAME, Action = "Update", Profile = UserProfile.EUserProfile.Administrator)]
    [DSRestricted(Area = "*", Action = "Read")]
    public class LanguageRecord : DSRecordWithCustomerId
    {
        /// <summary>
        /// Key of the label to translate or to show on depends on the default language
        /// </summary>
        [Required]
        [DSUnique]
        [DSString(Max = 64)]
        public string Key { get; set; } = string.Empty;

        /// <summary>
        /// Translate in French
        /// </summary>
        [DSString(Max = 1024)]
        public string FR { get; set; } = string.Empty;

        /// <summary>
        /// Comment describing the message (in case of parameters for example)
        /// </summary>
        [DSString(Max = 256)]
        public string Comment { get; set; } = string.Empty;

        /// <summary>
        /// Empty constructor
        /// </summary>
        public LanguageRecord() : base() { }
    }
}