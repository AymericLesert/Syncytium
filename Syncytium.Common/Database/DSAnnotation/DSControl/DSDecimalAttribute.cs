using Syncytium.Common.Database.DSSchema;
using Syncytium.Common.Error;
using Newtonsoft.Json.Linq;
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
    /// Class checking if a decimal has a max number of digits and precision
    /// </summary>
    public class DSDecimalAttribute : DSControlAttribute
    {
        /// <summary>
        /// Max number of digits
        /// </summary>
        public int Digit { get; set; } = 11;

        /// <summary>
        /// Store the max value of the decimal
        /// </summary>
        private decimal _maxValue = 0;

        /// <summary>
        /// Store the min value of the decimal
        /// </summary>
        private decimal _minValue = 0;

        /// <summary>
        /// Max number of precisions
        /// </summary>
        public int Precision { get; set; } = 0;

        /// <summary>
        /// Unit to apply for this value
        /// </summary>
        public string Unit { get; set; } = string.Empty;

        /// <summary>
        /// Annotation type
        /// </summary>
        public override string Type => "Decimal";

        /// <summary>
        /// Build an annotation into a Json
        /// </summary>
        /// <returns></returns>
        public override JObject ToJSON()
        {
            JObject result = base.ToJSON();
            result["Digit"] = Digit;
            result["Precision"] = Precision;
            result["Unit"] = Unit.Replace("€", "&euro;");
            return result;
        }

        /// <summary>
        /// Check if the value is a decimal within expected digits
        /// </summary>
        /// <param name="column"></param>
        /// <param name="value"></param>
        /// <param name="errors"></param>
        /// <returns>true if the check is ok</returns>
        public override bool Check(DSColumn column, object value, Errors errors)
        {
            Decimal valueToCheck = 0;
            bool validity = base.Check(column, value, errors);

            if (value == null)
                return validity;

            if (_maxValue == 0 && Digit > Precision)
            {
                _maxValue = 10;
                for (int i = Precision + 1; i < Digit; i++)
                    _maxValue *= 10;
                _minValue = -_maxValue;
            }

            if (value as string != null)
            {
                if (!Decimal.TryParse(value as string, out valueToCheck))
                {
                    errors.AddField(column.Property.Name, Error, new[] { $"{{{column.Field}}}", $"{Digit}", $"{Precision}", $"{value}" });
                    return false;
                }
            }
            else if (value.GetType() == typeof(double) ||
                     value.GetType() == typeof(decimal) ||
                     value.GetType() == typeof(int) ||
                     value.GetType() == typeof(float))
            {
                valueToCheck = Convert.ToDecimal(value);
            }
            else if (value.GetType() == typeof(bool))
            {
                valueToCheck = (bool)value ? 1 : 0;
            }
            else
            {
                errors.AddField(column.Property.Name, Error, new[] { $"{{{column.Field}}}", $"{Digit}", $"{Precision}", $"{value}" });
                validity = false;
            }

            if (validity)
            {
                Decimal valueRounded = Math.Round(valueToCheck, Precision);

                if (valueRounded != valueToCheck)
                {
                    errors.AddField(column.Property.Name, Error, new[] { $"{{{column.Field}}}", $"{Digit}", $"{Precision}", $"{value}" });
                    return false;
                }

                if (valueToCheck >= _maxValue || valueToCheck <= _minValue)
                {
                    errors.AddField(column.Property.Name, Error, new[] { $"{{{column.Field}}}", $"{Digit}", $"{Precision}", $"{value}" });
                    return false;
                }
            }

            return validity;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public DSDecimalAttribute() : base("ERR_FIELD_DECIMAL") { }
    }
}
