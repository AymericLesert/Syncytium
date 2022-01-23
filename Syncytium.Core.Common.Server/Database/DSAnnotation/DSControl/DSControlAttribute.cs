using Syncytium.Core.Common.Server.Database.DSSchema;
using Syncytium.Core.Common.Server.Error;
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

namespace Syncytium.Core.Common.Server.Database.DSAnnotation.DSControl
{
    /// <summary>
    /// Master class of Controls done by Differential Synchronization Schema Description
    /// </summary>
    public abstract class DSControlAttribute : DSAnnotationAttribute
    {
        /// <summary>
        /// Error code in case of errors (Reference the Key in Language table - To allow translation)
        /// </summary>
        public string Error { get; set; } = "";

        /// <summary>
        /// Check if the value respects the control
        /// </summary>
        /// <param name="column"></param>
        /// <param name="value"></param>
        /// <param name="errors"></param>
        /// <returns>true if the check is ok</returns>
        public virtual bool Check(DSColumn column, object? value, Errors errors) { return true; }

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
        public DSControlAttribute(string error) : base()
        {
            Error = error;
        }
    }
}
