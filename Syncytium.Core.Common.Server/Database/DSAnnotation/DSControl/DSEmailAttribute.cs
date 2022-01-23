using Syncytium.Core.Common.Server.Database.DSSchema;
using Syncytium.Core.Common.Server.Error;
using System.Net.Mail;

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

namespace Syncytium.Core.Common.Server.Database.DSAnnotation.DSControl
{
    /// <summary>
    /// Class checking if a string describes an email
    /// </summary>
    public class DSEmailAttribute : DSControlAttribute
    {
        /// <summary>
        /// Annotation type
        /// </summary>
        public override string Type => "Email";

        /// <summary>
        /// Check if the value describes an email address
        /// </summary>
        /// <param name="column"></param>
        /// <param name="value"></param>
        /// <param name="errors"></param>
        /// <returns>true if the check is ok</returns>
        public override bool Check(DSColumn column, object? value, Errors errors)
        {
            bool validity = base.Check(column, value, errors);

            if (value == null)
                return validity;

            if (value is not string strValue)
            {
                errors.AddField(column.Property.Name, Error, new[] { $"{{{column.Field}}}", value.ToString() ?? String.Empty });
                return false;
            }

            try
            {
                new MailAddress(strValue);
                return validity;
            }
            catch
            {
                errors.AddField(column.Property.Name, Error, new[] { $"{{{column.Field}}}", strValue });
                return false;
            }
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public DSEmailAttribute() : base("ERR_FIELD_BADFORMAT") { }
    }
}
