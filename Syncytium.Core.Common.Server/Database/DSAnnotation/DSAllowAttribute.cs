using Syncytium.Core.Common.Server.Managers;
using Syncytium.Core.Common.Server.Database.DSModel;
using Newtonsoft.Json.Linq;
using System.Reflection;

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

namespace Syncytium.Core.Common.Server.Database.DSAnnotation
{
    /// <summary>
    /// Class defining the limitation on create, update or delete a record on depends on the user
    /// If the user isnot allowed to get access to the class, an UNAUTHORIZED exception will be raised
    /// </summary>
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
    public class DSAllowAttribute : DSAnnotationAttribute
    {
        /// <summary>
        /// Define the profile allowed (by default: nobody can get access to this record)
        /// </summary>
        public UserProfile.EUserProfile Profile { get; set; } = UserProfile.EUserProfile.None;

        /// <summary>
        /// Define the area attached to the table (by default: all areas)
        /// </summary>
        public string? Area { get; set; } = null;

        /// <summary>
        /// Define the action authorized attached to the table (by default: all actions)
        /// </summary>
        public string? Action { get; set; } = null;

        /// <summary>
        /// Define the field name to check (by default: UserId")
        /// </summary>
        public string FieldUserId { get; set; } = "UserId";

        /// <summary>
        /// Reference on the property describing the field
        /// </summary>
        private PropertyInfo? _field = null;

        /// <summary>
        /// Annotation type
        /// </summary>
        public override string Type => "Allowed";

        /// <summary>
        /// Retrieve the userId into the record
        /// </summary>
        /// <param name="record"></param>
        /// <returns></returns>
        public int? GetUserId(DSRecord record)
        {
            if (_field == null)
                _field = record.GetType().GetProperty(FieldUserId);

            if (_field == null)
                return null;

            object? value = _field.GetValue(record);
            if (value == null)
                return null;

            return (int)value;
        }

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
            result["FieldUserId"] = FieldUserId;
            return result;
        }

        /// <summary>
        /// This static function checks if the list of restrictions limits the access to the element
        /// on depends on the current area and the current profile
        /// </summary>
        /// <param name="allows"></param>
        /// <param name="area">Null, "Create", "Read", "Update" or "Delete"</param>
        /// <param name="profile"></param>
        /// <param name="action"></param>
        /// <param name="userId"></param>
        /// <param name="record"></param>
        public static bool IsAllowed(IEnumerable<DSAllowAttribute> allows, string area, UserProfile.EUserProfile profile, string action, int userId, DSRecord record)
        {
            // everything is allowed ?

            if (!allows.Any())
                return true;

            if (area == null && profile == UserProfile.EUserProfile.None)
                return true;

            // if the record is null, not allowed!

            if (record == null)
                return false;

            foreach (DSAllowAttribute allow in allows)
            {
                // By default: Nobody can access to this table

                if (allow.Area == null && allow.Profile == UserProfile.EUserProfile.None && allow.Action == null)
                    continue;

                // Check area (if restriction.Area = "*" : allow all areas)

                if (allow.Area != null && !allow.Area.Equals("*") && area != null && !allow.Area.Equals(area))
                    continue;

                // Check profile

                if (allow.Profile != UserProfile.EUserProfile.None && profile != UserProfile.EUserProfile.None && !UserProfile.IsInRole(profile, allow.Profile))
                    continue;

                // Check action

                if (allow.Action != null && !allow.Action.Equals("*") && action != null && !allow.Action.Equals(action))
                    continue;

                // retrieve the field if it doesn't exist

                if (allow.FieldUserId != null)
                {
                    int? currentUserId = allow.GetUserId(record);

                    if (currentUserId == null || currentUserId.Value != userId)
                        continue;
                }

                return true;
            }

            return false;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public DSAllowAttribute() : base() { }
    }
}
