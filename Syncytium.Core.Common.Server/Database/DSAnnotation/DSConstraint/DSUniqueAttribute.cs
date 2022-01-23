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

namespace Syncytium.Core.Common.Server.Database.DSAnnotation.DSConstraint
{
    /// <summary>
    /// Class defining the value of this field as unique (only one value available amongst the list of elements not deleted)
    /// </summary>
    public class DSUniqueAttribute : DSIndexAttribute
    {
        /// <summary>
        /// Annotation type
        /// </summary>
        public override string Type => "Unique";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="caseSensitive"></param>SUn
        /// <param name="forCustomer"></param>
        /// <param name="fields"></param>
        public DSUniqueAttribute(bool caseSensitive = true, bool forCustomer = true, string[]? fields = null) : base(caseSensitive, forCustomer, fields) {
            Error = "ERR_FIELD_UNIQUE";
        }
    }
}
