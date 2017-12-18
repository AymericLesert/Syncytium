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
    /// Master class of Controls done by Differential Synchronization Schema Description
    /// </summary>
    public abstract class DSFormatAttribute : DSAnnotationAttribute
    {
        /// <summary>
        /// Convert a given value into a value matching within the expected type of the column
        /// Network -> Record
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public virtual object ConvertFromJSON(object value) => value;

        /// <summary>
        /// Convert a given value from a record to another type
        /// Record -> Network
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public virtual object ConvertToJSON(object value) => value;

        /// <summary>
        /// Constructor
        /// </summary>
        public DSFormatAttribute() : base() { }
    }
}
