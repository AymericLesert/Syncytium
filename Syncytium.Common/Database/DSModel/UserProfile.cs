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
    /// Handle the list of rights included into the application
    /// </summary>
    public class UserProfile
    {
        #region Enumerate

        /// <summary>
        /// Describe the enumeration of all profiles
        /// </summary>
        public enum EUserProfile
        {
            /// <summary>All rights</summary>
            Administrator = 0,
            /// <summary>Agent creating some elements (ation plan, ...)</summary>
            Supervisor = 1,
            /// <summary>Agent executing tasks</summary>
            User = 2,
            /// <summary>Read only</summary>
            Other = 3,
            /// <summary>Nothing allowed</summary>
            None = 4
        };

        #endregion

        #region static functions

        /// <summary>
        /// Check if the profile given in parameter is allowed for the current profile
        /// </summary>
        /// <param name="userProfile"></param>
        /// <param name="profile"></param>
        /// <returns></returns>
        public static bool IsInRole(EUserProfile userProfile, EUserProfile profile)
        {
            switch (userProfile)
            {
                case EUserProfile.Administrator:
                    return true;

                case EUserProfile.Supervisor:
                    return (profile == EUserProfile.Supervisor || profile == EUserProfile.User || profile == EUserProfile.Other || profile == EUserProfile.None);

                case EUserProfile.User:
                    return (profile == EUserProfile.User || profile == EUserProfile.Other || profile == EUserProfile.None);

                case EUserProfile.Other:
                    return (profile == EUserProfile.Other || profile == EUserProfile.None);

                case EUserProfile.None:
                    return false;
            }

            return false;
        }

        #endregion
    }
}
