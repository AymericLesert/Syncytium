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

namespace Syncytium.Core.Common.Server.Managers
{
    /// <summary>
    /// This static class handles the application status
    /// </summary>
    public static class StatusManager
    {
        /// <summary>
        /// List of status handled by the application
        /// </summary>
        public enum EStatus
        {
            /// <summary>
            /// Notify that the application is up-to-date and the application is running ...
            /// </summary>
            STATUS_OK = 0,

            /// <summary>
            /// Notify that the application has a technical issue, the end-user has to contact the technical support team to resolve the issue
            /// </summary>
            STATUS_FAIL = 1,

            /// <summary>
            /// Notify that the application has to be updated, the end-user has to wait that the application is up-to-date before trying a new connection
            /// </summary>
            STATUS_UPGRADING = 2
        }

        /// <summary>
        /// Keep the current status of the application
        /// </summary>
        public static EStatus Status = EStatus.STATUS_OK;

        /// <summary>
        /// Store the exception occurring during the initialization process
        /// </summary>
        public static System.Exception? Exception = null;
    }
}