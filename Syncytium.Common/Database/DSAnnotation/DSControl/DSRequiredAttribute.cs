using Syncytium.Common.Database.DSSchema;
using Syncytium.Common.Error;
using System;

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

namespace Syncytium.Common.Database.DSAnnotation.DSControl
{
    /// <summary>
    /// Class identifying the field as a required field (not null or not empty)
    /// </summary>
    public class DSRequiredAttribute : DSControlAttribute
    {
        /// <summary>
        /// Annotation type
        /// </summary>
        public override string Type => "Required";

        /// <summary>
        /// Check if the value is not null and not empty
        /// </summary>
        /// <param name="column"></param>
        /// <param name="value"></param>
        /// <param name="errors"></param>
        /// <returns>true if the check is ok</returns>
        public override bool Check(DSColumn column, object value, Errors errors)
        {
            bool validity = base.Check(column, value, errors);

            if (value == null)
            {
                errors.AddField(column.Property.Name, Error, new[] { $"{{{column.Field}}}" });
                return false;
            }

            if (value is string strValue && String.IsNullOrWhiteSpace(strValue))
            {
                errors.AddField(column.Property.Name, Error, new[] { $"{{{column.Field}}}" });
                return false;
            }

            return validity;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="error"></param>
        public DSRequiredAttribute(string error) : base(error) { }

        /// <summary>
        /// Constructor
        /// </summary>
        public DSRequiredAttribute() : base("ERR_FIELD_REQUIRED") { }
    }
}
