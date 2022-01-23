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

namespace Syncytium.Core.Common.Server.Database.DSModel
{
    /// <summary>
    /// Handle the list of rights included into the application
    /// </summary>
    public class HistoryNature
    {
        #region Enumerate

        /// <summary>
        /// Describe the enumeration of all profiles
        /// </summary>
        public enum EHistoryNature
        {
            /// <summary>Creation</summary>
            Create = 0,
            /// <summary>Update</summary>
            Update = 1,
            /// <summary>Delete</summary>
            Delete = 2
        };

        #endregion
    }
}
