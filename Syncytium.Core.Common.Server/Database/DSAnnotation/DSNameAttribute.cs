using Newtonsoft.Json.Linq;

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
    /// Class defining the field name attached to the attribute
    /// Used by the client interface to write the right label
    /// </summary>
    public class DSNameAttribute : DSAnnotationAttribute
    {
        /// <summary>
        /// Field name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Annotation type
        /// </summary>
        public override string Type => "Name";

        /// <summary>
        /// Build an annotation into a Json
        /// </summary>
        /// <returns></returns>
        public override JObject ToJSON()
        {
            JObject result = base.ToJSON();
            result["Name"] = Name;
            return result;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="name"></param>
        public DSNameAttribute(string name) : base()
        {
            Name = name;
        }
    }
}
