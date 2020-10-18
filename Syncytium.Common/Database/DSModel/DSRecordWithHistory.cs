using Syncytium.Common.Database.DSAnnotation;
using Syncytium.Common.Database.DSAnnotation.DSConstraint;
using System;
using static Syncytium.Common.Database.DSModel.HistoryNature;

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

namespace Syncytium.Common.Database.DSModel
{
    /// <summary>
    /// Master class of the history description of a record
    /// </summary>
    public class DSRecordWithHistory : DSRecordWithCustomerId
    {
        /// <summary>
        /// CustomerId attached to the table
        /// </summary>
        [DSForeignKey("ERR_REFERENCE_USER", "User")]
        [DSName("HISTORY_HISTORYUSERID")]
        public int HistoryUserId { get; set; } = -1;

        /// <summary>
        /// CustomerId attached to the table
        /// </summary>
        [DSName("HISTORY_HISTORYNATURE")]
        public EHistoryNature HistoryNature { get; set; } = EHistoryNature.Create;

        /// <summary>
        /// CustomerId attached to the table
        /// </summary>
        [DSName("HISTORY_HISTORYDATE")]
        public DateTime HistoryDate { get; set; } = DateTime.Now;

        /// <summary>
        /// Empty constructor
        /// </summary>
        public DSRecordWithHistory() : base() { }

        /// <summary>
        /// Constructor by copy
        /// </summary>
        /// <param name="copy"></param>
        public DSRecordWithHistory(DSRecordWithHistory copy) : base(copy)
        {
            HistoryUserId = copy.HistoryUserId;
            HistoryNature = copy.HistoryNature;
            HistoryDate = copy.HistoryDate;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="id"></param>
        public DSRecordWithHistory(int id) : base(id) { }
    }
}