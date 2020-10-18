using Newtonsoft.Json.Linq;

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

namespace Syncytium.Common.Database.DSAnnotation.DSConstraint
{
    /// <summary>
    /// Class checking if the current id is defined into the target table
    /// </summary>
    public class DSForeignKeyAttribute : DSConstraintAttribute
    {
        /// <summary>
        /// Table name of the foreign key id
        /// </summary>
        public string Table { get; set; }

        /// <summary>
        /// Annotation type
        /// </summary>
        public override string Type => "ForeignKey";

        /// <summary>
        /// Build an annotation into a Json
        /// </summary>
        /// <returns></returns>
        public override JObject ToJSON()
        {
            JObject result = base.ToJSON();
            result["Table"] = Table;
            return result;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="error"></param>
        /// <param name="table"></param>
        public DSForeignKeyAttribute(string error, string table) : base(error)
        {
            Table = table;
        }
    }
}
