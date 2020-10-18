using Newtonsoft.Json;
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

namespace Syncytium.Common.Database.DSAnnotation
{
    /// <summary>
    /// Master class of Differential Synchronization Schema Description
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public abstract class DSAnnotationAttribute : Attribute
    {
        /// <summary>
        /// Annotation type
        /// </summary>
        public abstract string Type { get; }

        /// <summary>
        /// Describe the annotation into a string
        /// </summary>
        /// <returns></returns>
        public override string ToString() => JsonConvert.SerializeObject(this);

        /// <summary>
        /// Build an annotation into a Json
        /// </summary>
        /// <returns></returns>
        public virtual JObject ToJSON()
        {
            JObject result = new JObject
            {
                ["Type"] = Type
            };
            return result;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public DSAnnotationAttribute() { }
    }
}
