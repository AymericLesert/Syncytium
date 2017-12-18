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

namespace Syncytium.Common.Error
{
    /// <summary>
    /// This class handles an error and its parameters
    /// </summary>
    public class Error
    {
        /// <summary>
        /// Key label of the message
        /// </summary>
        public string Message { get; set; } = "";

        /// <summary>
        /// Set a list of parameters attached to the message
        /// </summary>
        public object[] Parameters = null;

        /// <summary>
        /// Convert this class to JSON
        /// </summary>
        /// <returns></returns>
        public JObject ToJSON()
        {
            JObject error = new JObject
            {
                ["Message"] = Message
            };

            // Set Parameters

            if (Parameters != null)
                error["Parameters"] = new JArray(Parameters);
            else
                error["Parameters"] = new JArray();

            return error;
        }

        /// <summary>
        /// Empty constructor
        /// </summary>
        public Error()
        {
            Message = "";
            Parameters = null;
        }

        /// <summary>
        /// Constructor of the error message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="parameters"></param>
        public Error(string message, params object[] parameters)
        {
            Message = message;
            Parameters = parameters;
        }
    }
}