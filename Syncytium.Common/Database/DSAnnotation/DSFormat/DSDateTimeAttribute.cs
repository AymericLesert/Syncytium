using Newtonsoft.Json.Linq;
using System;
using System.Globalization;

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

namespace Syncytium.Common.Database.DSAnnotation.DSFormat
{
    /// <summary>
    /// Class identifying the field as a date time
    /// </summary>
    public class DSDateTimeAttribute : DSFormatAttribute
    {
        /// <summary>
        /// Format to use for the string or datetime conversion - cache value (CSharp)
        /// </summary>
        private string _formatCS = null;

        /// <summary>
        /// Format to use for the string or datetime conversion (CSharp)
        /// </summary>
        public string FormatCS {
            get
            {
                if (_formatCS != null)
                    return _formatCS;

                _formatCS = Format;
                _formatCS = _formatCS.Replace("YYYY", "yyyy");
                _formatCS = _formatCS.Replace("DD", "dd");
                _formatCS = _formatCS.Replace("SSS", "fff");

                return _formatCS;
            }
        }

        /// <summary>
        /// Format to use for the string or datetime conversion (Javascript)
        /// </summary>
        public string FormatJS => Format;

        /// <summary>
        /// Format to use for the string or datetime conversion
        /// YYYY : Year on 4 digits
        /// MM : Month on 2 digits
        /// DD : Day on 2 digits
        /// HH : Hour on 24 hours
        /// mm : Minute on 2 digits
        /// ss : Second on 2 digits
        /// SSS : millisecondes on 3 digits
        /// </summary>
        public string Format { get; set; } = "YYYY-MM-DD HH:mm:ss";

        /// <summary>
        /// Annotation type
        /// </summary>
        public override string Type => "DateTime";

        /// <summary>
        /// Build an annotation into a Json
        /// </summary>
        /// <returns></returns>
        public override JObject ToJSON()
        {
            JObject result = base.ToJSON();
            result["Format"] = Format;
            return result;
        }

        /// <summary>
        /// Convert a string having the given format into a DateTime
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public override object ConvertFromJSON(object value)
        {
            if (value == null)
                return null;

            string strValue = value as string;
            if (strValue == null)
                return value;

            return DateTime.ParseExact(strValue, FormatCS, CultureInfo.InvariantCulture);
        }

        /// <summary>
        /// Convert the value of an attribute to a string having the given format
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public override object ConvertToJSON(object value)
        {
            if (value == null)
                return null;

            if (!(value is DateTime))
                return value;

            return ((DateTime)value).ToString(FormatCS);
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public DSDateTimeAttribute() : base() { }
    }
}
