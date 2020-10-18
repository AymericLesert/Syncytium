using Syncytium.Common.Database.DSModel;
using Newtonsoft.Json.Linq;
using System;

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

namespace Syncytium.Common.Database.DSSchema
{
    /// <summary>
    /// This interface describes a class which can customize some features of the DSDatabase
    /// </summary>
    public interface IDSRequest
    {
        /// <summary>
        /// This function returns a record corresponding to the request
        /// If something is wrong, throw ExceptionDefinitionRecord("ERR_REQUEST_UNKNOWN")
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="area"></param>
        /// <param name="profile"></param>
        /// <param name="table"></param>
        /// <param name="action"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns></returns>
        Tuple<DSRecord, InformationRecord> ExecuteRequest(DatabaseContext database, int tick, int customerId, int userId, string area, UserProfile.EUserProfile profile, string table, string action, int id, JObject record, JObject identity);

        /// <summary>
        /// This function is called before creating the record ... used to complete the creation
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        void OnBeforeCreateRecord(DatabaseContext database, int tick, string table, int id, JObject record, JObject identity);

        /// <summary>
        /// This function is called before updating the record ... used to complete the update
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        void OnBeforeUpdateRecord(DatabaseContext database, int tick, string table, int id, JObject record, JObject identity);

        /// <summary>
        /// This function is called before deleting the record ... used to complete the deletion
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        void OnBeforeDeleteRecord(DatabaseContext database, int tick, string table, int id, JObject record, JObject identity);

        /// <summary>
        /// This function is called after creating the record ... used to complete the creation
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="record"></param>
        void OnAfterCreateRecord(DatabaseContext database, int tick, string table, DSRecord record);

        /// <summary>
        /// This function is called after updating the record ... used to complete the update
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="record"></param>
        void OnAfterUpdateRecord(DatabaseContext database, int tick, string table, DSRecord record);

        /// <summary>
        /// This function is called after deleting the record ... used to complete the deletion
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="record"></param>
        void OnAfterDeleteRecord(DatabaseContext database, int tick, string table, DSRecord record);
    }
}
