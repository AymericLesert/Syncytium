using Syncytium.Common.Database.DSModel;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;

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

namespace Syncytium.Common.Database.DSAnnotation
{
    /// <summary>
    /// Class defining a restriction view of the field or of the table
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Property, AllowMultiple = true)]
    public class DSRestrictedAttribute : DSAnnotationAttribute
    {
        /// <summary>
        /// Define the profile allowed to view the field (by default: nobody can show this field)
        /// </summary>
        public UserProfile.EUserProfile Profile { get; set; } = UserProfile.EUserProfile.None;

        /// <summary>
        /// Define the area attached to the field or the table (by default: all areas)
        /// </summary>
        public string Area { get; set; } = null;

        /// <summary>
        /// Define the action authorized attached to the field or the table (by default: all actions)
        /// </summary>
        public string Action { get; set; } = null;

        /// <summary>
        /// Annotation type
        /// </summary>
        public override string Type => "Restricted";

        /// <summary>
        /// Build an annotation into a Json
        /// </summary>
        /// <returns></returns>
        public override JObject ToJSON()
        {
            JObject result = base.ToJSON();
            result["Profile"] = (int)Profile;
            result["Area"] = Area;
            result["Action"] = Action;
            return result;
        }

        /// <summary>
        /// This static function checks if the list of restrictions limits the access to the element
        /// on depends on the current area and the current profile
        /// </summary>
        /// <param name="restrictions"></param>
        /// <param name="area">Null, "Create", "Update" or "Delete"</param>
        /// <param name="profile"></param>
        /// <param name="action"></param>
        public static bool IsRestricted(IEnumerable<DSRestrictedAttribute> restrictions, string area, UserProfile.EUserProfile profile, string action)
        {
            // no restriction ?

            if (!restrictions.Any())
                return false;

            if (area == null && profile == UserProfile.EUserProfile.None)
                return false;

            foreach (DSRestrictedAttribute restriction in restrictions)
            {
                // By default: Nobody can access to this table

                if (restriction.Area == null && restriction.Profile == UserProfile.EUserProfile.None && restriction.Action == null)
                    continue;

                // Check area (if restriction.Area = "*" : allow all areas)

                if (restriction.Area != null && !restriction.Area.Equals("*") && area != null && !restriction.Area.Equals(area))
                    continue;

                // Check profile

                if (restriction.Profile != UserProfile.EUserProfile.None && profile != UserProfile.EUserProfile.None && !UserProfile.IsInRole(profile, restriction.Profile))
                    continue;

                // Check action

                if (restriction.Action != null && !restriction.Action.Equals("*") && action != null && !restriction.Action.Equals(action))
                    continue;

                return false;
            }

            return true;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public DSRestrictedAttribute() : base() { }
    }
}
