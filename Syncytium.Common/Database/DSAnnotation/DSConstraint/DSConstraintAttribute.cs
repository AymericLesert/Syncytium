using Newtonsoft.Json.Linq;

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

namespace Syncytium.Common.Database.DSAnnotation.DSConstraint
{
    /// <summary>
    /// Master class of Constraints done by Differential Synchronization Schema Description
    /// A constraint concerns a value amongst the database element.
    /// For example: a value referencing another key into a table
    ///           or the check of the unique value into a table
    /// </summary>
    public abstract class DSConstraintAttribute : DSAnnotationAttribute
    {
        /// <summary>
        /// Error code in case of errors (Reference the Key in Language table - To allow translation)
        /// </summary>
        public string Error { get; set; } = "";

        /// <summary>
        /// Build an annotation into a Json
        /// </summary>
        /// <returns></returns>
        public override JObject ToJSON()
        {
            JObject result = base.ToJSON();
            result["Error"] = Error;
            return result;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="error"></param>
        public DSConstraintAttribute(string error) : base()
        {
            Error = error;
        }
    }
}
