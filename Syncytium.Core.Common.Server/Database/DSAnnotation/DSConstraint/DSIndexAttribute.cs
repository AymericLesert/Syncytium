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

namespace Syncytium.Core.Common.Server.Database.DSAnnotation.DSConstraint
{
    /// <summary>
    /// Class defining the value of this field as unique (only one value available amongst the list of elements not deleted)
    /// </summary>
    public class DSIndexAttribute : DSConstraintAttribute
    {
        /// <summary>
        /// Indicates if the check must be case sensitive or not
        /// </summary>
        public bool CaseSensitive { get; set; } = true;

        /// <summary>
        /// Indicates if the check must be done within CustomerId or not
        /// Only available from the server side .. do not send to the client
        /// </summary>
        public bool ForCustomer { get; set; } = true;

        /// <summary>
        /// List of fields to attached to this unique value
        /// For example: Name has the DSIndexAttribute but it defined for the same sectionId
        /// </summary>
        public string[]? Fields { get; set; } = null;

        /// <summary>
        /// Annotation type
        /// </summary>
        public override string Type => "Index";

        /// <summary>
        /// Build an annotation into a Json
        /// </summary>
        /// <returns></returns>
        public override JObject ToJSON()
        {
            JObject result = base.ToJSON();
            result["CaseSensitive"] = CaseSensitive ? "True" : "False";
            if (Fields != null)
            {
                JArray fields = new();
                foreach (string field in Fields)
                    fields.Add(field);
                result["Fields"] = fields;
            }
            return result;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="caseSensitive"></param>
        /// <param name="forCustomer"></param>
        /// <param name="fields"></param>
        public DSIndexAttribute(bool caseSensitive = true, bool forCustomer = true, string[]? fields = null) : base("")
        {
            CaseSensitive = caseSensitive;
            ForCustomer = forCustomer;
            Fields = fields;
        }
    }
}
