using Syncytium.Common.Database.DSAnnotation;
using Syncytium.Common.Database.DSAnnotation.DSConstraint;
using Syncytium.Common.Database.DSAnnotation.DSControl;
using Syncytium.Common.Database.DSModel;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

namespace Syncytium.Module.Administration.Models
{
    /// <summary>
    /// Describe a customer
    /// </summary>
    [Table("Customer")]
    [DSLot(Capacity = 4)]
    [DSRestricted(Area = "*", Action = "Read")]
    public class CustomerRecord : DSRecord
    {
        /// <summary>
        /// Name of the customer
        /// </summary>
        [Required]
        [DSUnique(CaseSensitive = false, ForCustomer = false)]
        [DSString(Max = 64)]
        public string Name { get; set; } = String.Empty;

        /// <summary>
        /// customer's administrator
        /// </summary>
        [Required]
        [DSString(Max = 40)]
        public string Login { get; set; } = String.Empty;

        /// <summary>
        /// Customer's email
        /// </summary>
        [Required]
        [DSString(Max = 128)]
        [DSEmail]
        public string Email { get; set; } = String.Empty;

        /// <summary>
        /// Customer's address
        /// </summary>
        [DSString(Max = 1024)]
        public string Address { get; set; } = string.Empty;

        /// <summary>
        /// Customer's comment
        /// </summary>
        [DSString(Max = 1024)]
        public string Comment { get; set; } = string.Empty;

        /// <summary>
        /// Empty constructor
        /// </summary>
        public CustomerRecord() : base() { }
    }
}