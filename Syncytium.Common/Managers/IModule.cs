﻿using Syncytium.Common.Database.DSModel;

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

namespace Syncytium.Common.Managers
{
    /// <summary>
    /// Describe properties expected for a user into the DS Database manager
    /// </summary>
    public interface IModule
    {
        /// <summary>
        /// Id of the record
        /// </summary>
        int Id { get; set; }

        /// <summary>
        /// Module's role
        /// </summary>
        UserProfile.EUserProfile Profile { get; set; }

        /// <summary>
        /// CustomerId attached to the table
        /// </summary>
        int CustomerId { get; set; }
    }
}
