using Syncytium.Common.Database.DSAnnotation;
using Syncytium.Common.Database.DSAnnotation.DSConstraint;
using Syncytium.Common.Database.DSAnnotation.DSControl;
using Syncytium.Common.Database.DSModel;
using System;
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
    /// This table stores the last notification done for a user
    /// In case of creation a new user, this table will store the tick of the creation
    /// </summary>
    [Table("Notification")]
    [DSRestricted(Area = DatabaseContext.AREA_NAME, Action = "Read")]
    public class NotificationRecord : DSRecordWithCustomerId
    {
        #region constante

        /// <summary>
        /// Name of the report : notification
        /// </summary>
        public const string NOTIFICATION = "Notification";

        /// <summary>
        /// Name of the report : automatic report for a user
        /// </summary>
        public const string REPORT_USER = "ReportUser";

        /// <summary>
        /// Name of the report : automatic report for a supervisor
        /// </summary>
        public const string REPORT_SUPERVISOR = "ReportSupervisor";

        #endregion

        /// <summary>
        /// User Id concerned by this last notification
        /// </summary>
        [DSForeignKey("ERR_NOTIFICATION_REFERENCE_USER", "User")]
        public int UserId { get; set; } = -1;

        /// <summary>
        /// Last tick concerned by this notification
        /// </summary>
        public int LastTick { get; set; } = 0;

        /// <summary>
        /// Last date concerned by this notification
        /// </summary>
        public DateTime Date { get; set; } = DateTime.Now;

        /// <summary>
        /// Name of the notification concerning by this line
        /// </summary>
        [DSString(Max = 32)]
        public string Report { get; set; } = null;
    }
}