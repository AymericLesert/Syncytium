using Syncytium.Common.Database.DSSchema;
using Syncytium.Common.Error;
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

namespace Syncytium.Common.Database.DSAnnotation.DSControl
{
    /// <summary>
    /// Class checking if a string has a minimal or a maximal length
    /// </summary>
    public class DSStringAttribute : DSControlAttribute
    {
        /// <summary>
        /// Error code in case of min lenght not respected (Reference the Key in Language table - To allow translation)
        /// </summary>
        public string ErrorMin { get; set; } = "ERR_FIELD_TOO_SHORT";

        /// <summary>
        /// Min length expected
        /// </summary>
        public int Min { get; set; } = 0;

        /// <summary>
        /// Error code in case of max lenght not respected (Reference the Key in Language table - To allow translation)
        /// </summary>
        public string ErrorMax { get; set; } = "ERR_FIELD_TOO_LONG";

        /// <summary>
        /// Max length expected
        /// </summary>
        public int Max { get; set; } = -1;

        /// <summary>
        /// Annotation type
        /// </summary>
        public override string Type => "String";

        /// <summary>
        /// Build an annotation into a Json
        /// </summary>
        /// <returns></returns>
        public override JObject ToJSON()
        {
            JObject result = base.ToJSON();
            result["Min"] = Min;
            result["ErrorMin"] = ErrorMin;
            result["Max"] = Max;
            result["ErrorMax"] = ErrorMax;
            return result;
        }

        /// <summary>
        /// Check if the value is a string and if the length is between Min and Max length
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
                if (Min > 0)
                {
                    errors.AddField(column.Property.Name, ErrorMin, new[] { $"{{{column.Field}}}", $"{Min}" });
                    validity = false;
                }
            }
            else if (value as string != null)
            {
                string strValue = (value as string).Trim();

                if (strValue.Length < Min)
                {
                    errors.AddField(column.Property.Name, ErrorMin, new[] { $"{{{column.Field}}}", $"{Min}" });
                    validity = false;
                }

                if (strValue.Length > Max)
                {
                    errors.AddField(column.Property.Name, ErrorMax, new[] { $"{{{column.Field}}}", $"{Max}" });
                    validity = false;
                }
            }
            else
            {
                errors.AddField(column.Property.Name, Error, new[] { $"{{{column.Field}}}" });
            }

            return validity;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public DSStringAttribute() : base("ERR_FIELD_BADFORMAT") { }
    }
}
