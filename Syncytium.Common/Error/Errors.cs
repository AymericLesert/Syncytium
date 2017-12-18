using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;

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
    /// This class handles a list of errors grouped by field
    /// </summary>
    public class Errors
    {
        /// <summary>
        /// List of errors attached to a field
        /// </summary>
        public Dictionary<string, List<Error>> Fields { get; }

        /// <summary>
        /// List of errors not attached to a field
        /// </summary>
        public List<Error> Global { get; }

        /// <summary>
        /// True if the class contains at least one error, else false
        /// </summary>
        public bool HasError
        {
            get
            {
                if (Global.Count > 0)
                    return true;

                foreach (KeyValuePair<string, List<Error>> field in Fields)
                    if (field.Value.Count > 0)
                        return true;

                return false;
            }
        }

        /// <summary>
        /// Clean up all messages in this handler
        /// </summary>
        public void Clear()
        {
            Fields.Clear();
            Global.Clear();
        }

        /// <summary>
        /// Add a new message error into the handler and attach it to a field
        /// </summary>
        /// <param name="field"></param>
        /// <param name="message"></param>
        /// <param name="parameters">If a parameter contains {LANGUAGE_KEY}, it means that LANGUAGE_KEY must be replaced by the label of LANGUAGE_KEY for a given language</param>
        public void AddField(string field, string message, params object[] parameters)
        {
            if (!Fields.ContainsKey(field))
                Fields[field] = new List<Error>();

            Fields[field].Add(new Error(message, parameters));
        }

        /// <summary>
        /// Add a new message into the handler for a global aspect
        /// </summary>
        /// <param name="message"></param>
        /// <param name="parameters">If a parameter contains {LANGUAGE_KEY}, it means that LANGUAGE_KEY must be replaced by the label of LANGUAGE_KEY for a given language</param>
        public void AddGlobal(string message, params object[] parameters)
        {
            Global.Add(new Error(message, parameters));
        }

        /// <summary>
        /// Convert this class to JSON
        /// </summary>
        /// <returns></returns>
        public JObject ToJSON()
        {
            JObject errors = new JObject();
            JObject fields = new JObject();

            // Fields

            foreach (KeyValuePair<string, List<Error>> field in Fields)
                fields[field.Key] = new JArray(field.Value.Select(e => e.ToJSON()).ToArray());

            errors["Fields"] = fields;
            errors["Globals"] = new JArray(Global.Select(e => e.ToJSON()).ToArray());

            return errors;
        }

        /// <summary>
        /// Constructor within a single message into the global part
        /// </summary>
        /// <param name="message"></param>
        /// <param name="parameters"></param>
        public Errors(string message, params object[] parameters)
        {
            Fields = new Dictionary<string, List<Error>>();
            Global = new List<Error>
            {
                new Error(message, parameters)
            };
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public Errors()
        {
            Fields = new Dictionary<string, List<Error>>();
            Global = new List<Error>();
        }
    }
}