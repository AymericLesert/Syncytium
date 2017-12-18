using System.Collections.Generic;

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

namespace Syncytium.Module.Administration.Models
{
    /// <summary>
    /// Link a label towards the view
    /// </summary>
    public class LanguageLabel
    {
        /// <summary>
        /// List of labels sorted by language "EN", "FR" or "SP"
        /// </summary>
        public Dictionary<string, string> Languages;

        /// <summary>
        /// Comment of the label
        /// </summary>
        public string Comment { get; set; }

        /// <summary>
        /// Update a label for a given language
        /// </summary>
        /// <param name="language"></param>
        /// <param name="label"></param>
        /// <param name="comment"></param>
        public void SetLabel(string language, string label, string comment)
        {
            if (language == null || !Languages.ContainsKey(language.Trim()))
                return;

            Languages[language.Trim()] = (label == null ? string.Empty : label.Trim());
            Comment = (comment == null ? string.Empty : comment.Trim());
        }

        /// <summary>
        /// Retrieve a label under a string format
        /// </summary>
        /// <returns></returns>
        public override string ToString() => "{" + string.Join(",", Languages) + (Comment == null ? "" : (", Comment: " + Comment)) + "}";

        /// <summary>
        /// Constructor
        /// </summary>
        public LanguageLabel()
        {
            Languages = new Dictionary<string, string>
            {
                ["FR"] = string.Empty
            };
            Comment = string.Empty;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public LanguageLabel(string comment)
        {
            Languages = new Dictionary<string, string>
            {
                ["FR"] = string.Empty
            };
            Comment = (comment == null ? string.Empty : comment.Trim());
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="FR"></param>
        /// <param name="comment"></param>
        public LanguageLabel(string FR, string comment)
        {
            Languages = new Dictionary<string, string>
            {
                ["FR"] = (FR == null ? string.Empty : FR.Trim())
            };
            Comment = comment;
        }
    }
}