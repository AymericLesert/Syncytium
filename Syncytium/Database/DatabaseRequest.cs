using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Database.DSSchema;
using Syncytium.Common.Exception;
using Syncytium.Module.Administration.Managers;
using Syncytium.Module.Administration.Models;
using Syncytium.Web.Areas.Administration.Controllers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Linq;

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

namespace Syncytium.Web.Database
{
    /// <summary>
    /// This class implements some requests (like 'NewPassword')
    /// </summary>
    public class DatabaseRequest : IDSRequest
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static readonly string MODULE = typeof(DatabaseRequest).Name;

        /// <summary>
        /// Indicates if the all verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsVerboseAll() => Common.Logger.LoggerManager.Instance.IsVerboseAll;

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsVerbose() => Common.Logger.LoggerManager.Instance.IsVerbose;

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="message"></param>
        private void Verbose(string message) => Common.Logger.LoggerManager.Instance.Verbose(MODULE, message);

        /// <summary>
        /// Indicates if the debug mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsDebug() => Common.Logger.LoggerManager.Instance.IsDebug;

        /// <summary>
        /// Log a debug message
        /// </summary>
        /// <param name="message"></param>
        private void Debug(string message) => Common.Logger.LoggerManager.Instance.Debug(MODULE, message);

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        private void Info(string message) => Common.Logger.LoggerManager.Instance.Info(MODULE, message);

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        private void Warn(string message) => Common.Logger.LoggerManager.Instance.Warn(MODULE, message);

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        private void Error(string message) => Common.Logger.LoggerManager.Instance.Error(MODULE, message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        private void Exception(string message, System.Exception ex) => Common.Logger.LoggerManager.Instance.Exception(MODULE, message, ex);

        #endregion

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
        public Tuple<DSRecord, InformationRecord> ExecuteRequest(Common.Database.DatabaseContext database, int tick, int customerId, int userId, string area, UserProfile.EUserProfile profile, string table, string action, int id, JObject record, JObject identity)
        {
            if (table.Equals("User") && action.Equals("NewPassword") && record != null)
            {
                Info($"Executing request of new password for the user {record.ToString(Formatting.None)} ...");

                int currentUserId = -1;

                // Retrieve the userId

                if (record["CustomerId"] == null || record["CustomerId"].Type != JTokenType.Integer ||
                    record["UserId"] == null || record["UserId"].Type != JTokenType.Integer)
                    throw new ExceptionDefinitionRecord("ERR_REQUEST_UPDATE_MISSING");

                if (record["CustomerId"].ToObject<int>() != customerId)
                {
                    Error($"The record is defined for the customer '{record["CustomerId"].ToObject<int>()}' but it doesn't match with the user's customer '{customerId}' !");
                    throw new ExceptionDefinitionRecord("ERR_CONNECTION");
                }

                currentUserId = record["UserId"].ToObject<int>();

                if (currentUserId < 0)
                {
                    if (identity["UserId"] == null || identity["UserId"].Type != JTokenType.Integer)
                        throw new ExceptionDefinitionRecord("ERR_REQUEST_UPDATE_MISSING");

                    currentUserId = identity["UserId"].ToObject<int>();
                    if (currentUserId >= 0)
                    {
                        InformationRecord information = database._Information.FirstOrDefault(info => info.CreateId == currentUserId && info.CreateUserId == userId && info.Table.Equals(table));
                        if (information != null)
                            currentUserId = information.Id;
                    }
                }

                // check if the user has the right to send a new password

                if (currentUserId < 0 || (userId != currentUserId && profile != UserProfile.EUserProfile.Administrator))
                    throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");

                // send an email to change the password

                UserManager manager = new UserManager(database as Module.Administration.DatabaseContext);

                if (!(manager.GetById(currentUserId) is UserRecord currentUser))
                    throw new ExceptionDefinitionRecord("ERR_UNAUTHORIZED");

                using (UserController controller = new UserController(manager))
                    return Tuple.Create(controller.SendNewPassword(currentUser.Login) as DSRecord, database._Information.Find("User", currentUserId));
            }

            throw new ExceptionDefinitionRecord("ERR_REQUEST_UNKNOWN");
        }

        /// <summary>
        /// This function is called before creating the record ... used to complete the creation
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        public void OnBeforeCreateRecord(Common.Database.DatabaseContext database, int tick, string table, int id, JObject record, JObject identity)
        {
        }

        /// <summary>
        /// This function is called before updating the record ... used to complete the update
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        public void OnBeforeUpdateRecord(Common.Database.DatabaseContext database, int tick, string table, int id, JObject record, JObject identity)
        {
        }

        /// <summary>
        /// This function is called before deleting the record ... used to complete the deletion
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        public void OnBeforeDeleteRecord(Common.Database.DatabaseContext database, int tick, string table, int id, JObject record, JObject identity)
        {
        }

        /// <summary>
        /// This function is called after creating the record ... used to complete the creation
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="record"></param>
        public void OnAfterCreateRecord(Common.Database.DatabaseContext database, int tick, string table, DSRecord record)
        {
            if (table.Equals("User"))
            {
                if (record is DSRecordWithCustomerId user &&
                    database is Module.Administration.DatabaseContext administration)
                {
                    // Create the first notification or reports ...

                    administration.Notification.Add(new NotificationRecord() { UserId = user.Id, CustomerId = user.CustomerId, LastTick = tick, Date = DateTime.Now, Report = NotificationRecord.NOTIFICATION });
                    administration.SaveChanges();
                }
            }
            /* TODO : Handle AttachedFile
            else if (table.Equals("AttachedFile"))
            {
                if (record is AttachedFileRecord attachment &&
                    database is Module.Stock.DatabaseContext stock)
                {
                    // Load the file, save it into the table and delete it

                    string filename = System.Web.HttpContext.Current.Server.MapPath($"~/App_Data/{attachment.FileId:D6}_{attachment.Filename}");
                    Debug($"Loading file {filename} into the database {attachment.ToString()} ...");

                    AttachedFileContentRecord content = null;
                    if (System.IO.File.Exists(filename))
                    {
                        try
                        {
                            content = new AttachedFileContentRecord() { Content = System.IO.File.ReadAllBytes(filename), CustomerId = attachment.CustomerId };
                            stock.AttachedFileContent.Add(content);
                            stock.SaveChanges();

                            // update the fileId

                            attachment.FileId = content.Id;
                            stock.SaveChanges();
                        }
                        catch (System.Exception ex)
                        {
                            Exception($"Unable to load the file {filename}", ex);
                            return;
                        }
                        attachment.Size = content == null || content.Content == null ? 0 : content.Content.Length;
                    }
                    else
                    {
                        Warn($"The file {filename} doesn't exist ... The file may be already saved into the database!");
                        attachment.Date = DateTime.Now;
                    }

                    try
                    {
                        System.IO.File.Delete(filename);
                    }
                    catch (System.Exception)
                    {
                        Warn($"Unable to delete the file {filename}");
                    }

                    Info($"File {filename} loaded into the database");
                }
            } */
        }

        /// <summary>
        /// This function is called after updating the record ... used to complete the update
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="record"></param>
        public void OnAfterUpdateRecord(Common.Database.DatabaseContext database, int tick, string table, DSRecord record)
        {
            if (table.Equals("Language"))
            {
                if (database is Module.Administration.DatabaseContext administration &&
                    record is DSRecordWithCustomerId language)
                {
                    string tickKey = $"Language.Tick.{language.CustomerId}";
                    ParameterRecord parameter = database._Parameter.SingleOrDefault(e => e.Key.Equals(tickKey));
                    if (parameter != null)
                        parameter.Value = tick.ToString();

                    // Unable to add a line into "_Parameter" due to the lock set into the table "_Parameter"!
                }
            }
        }

        /// <summary>
        /// This function is called after deleting the record ... used to complete the deletion
        /// </summary>
        /// <param name="database"></param>
        /// <param name="tick"></param>
        /// <param name="table"></param>
        /// <param name="record"></param>
        public void OnAfterDeleteRecord(Common.Database.DatabaseContext database, int tick, string table, DSRecord record)
        {
        }
    }
}