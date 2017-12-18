using Syncytium.Common.Database.DSAnnotation.DSConstraint;

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

namespace Syncytium.Common.Database.DSModel
{
    /// <summary>
    /// Master class of the record description
    /// </summary>
    public class DSRecordWithCustomerId : DSRecord
    {
        /// <summary>
        /// CustomerId attached to the table
        /// </summary>
        [DSForeignKey("ERR_REFERENCE_CUSTOMER", "Customer")]
        public int CustomerId { get; set; } = 0;

        /// <summary>
        /// Empty constructor
        /// </summary>
        public DSRecordWithCustomerId() : base() { }

        /// <summary>
        /// Constructor by copy
        /// </summary>
        /// <param name="copy"></param>
        public DSRecordWithCustomerId(DSRecordWithCustomerId copy) : base(copy)
        {
            CustomerId = copy.CustomerId;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="id"></param>
        public DSRecordWithCustomerId(int id) : base(id) { }
    }
}