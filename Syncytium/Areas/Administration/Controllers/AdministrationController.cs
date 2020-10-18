using Syncytium.Common.Database;
using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Managers;
using Syncytium.Module.Administration.Models;
using Syncytium.Web.Areas.ViewModels;
using Syncytium.Web.Controllers;
using Syncytium.Web.Database;
using Syncytium.Web.Filters;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Runtime.Remoting.Contexts;
using System.Web.Mvc;
using System.Web.Security;

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

namespace Syncytium.Web.Areas.Administration.Controllers
{
    /// <summary>
    /// Handle the administration controller
    /// </summary>
    public class AdministrationController : SyncytiumController
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected override string MODULE => typeof(AdministrationController).Name;

        #endregion

        /// <summary>
        /// URL ~/Administration/Administration/Upgrade
        /// </summary>
        /// <returns></returns>
        [RoleFilter(AllModules = false)]
        public ActionResult Upgrade()
        {
            Debug("Get ~/Administration/Administration/Upgrade()");

            if (StatusManager.Status != StatusManager.EStatus.STATUS_UPGRADING)
            {
                Debug("The upgrading process is called ... but the application status is not in UPGRADING status!");
                return HttpNotFound();
            }

            // The database must be upgraded before continuing ...

            // Open a connection to the database

            _userManager.Database.Database.Connection.Open();

            // Does the database upgrade towards the latest version ?

            if (!_userManager.Database.HasToUpgrade())
            {
                Debug("The upgrading process is called ... but nothing has to be upgraded!");
                return HttpNotFound();
            }

            // Run the upgrading process

            try
            {
                _userManager.Database.Upgrade();

                // update the database schema

                ConfigurationManager.Schemas[Module.Administration.DatabaseContext.AREA_NAME] = new Common.Database.DSSchema.DSDatabase(typeof(Module.Administration.DatabaseContext), new DatabaseRequest());
                Info($"Database schema[{Module.Administration.DatabaseContext.AREA_NAME}] : '{ConfigurationManager.Schemas[Module.Administration.DatabaseContext.AREA_NAME]}'");

                ConfigurationManager.Schemas[Module.Customer.DatabaseContext.AREA_NAME] = new Common.Database.DSSchema.DSDatabase(typeof(Module.Customer.DatabaseContext), new DatabaseRequest());
                Info($"Database schema[{Module.Customer.DatabaseContext.AREA_NAME}]: '{ConfigurationManager.Schemas[Module.Customer.DatabaseContext.AREA_NAME]}'");

                // upgrading done ...

                StatusManager.Status = StatusManager.EStatus.STATUS_OK;
                StatusManager.Exception = null;

                // Initialize the cache manager for all known customers

                if (DatabaseCacheManager.Instance.IsEnable)
                {
                    Debug($"Loading data into the cache manager for all customers ...");
                    List<int> customerIds = _userManager.Database.Customer.Select(c => c.Id).ToList();
                    DatabaseCacheManager.Instance.Initialize(_userManager.Database, customerIds, Syncytium.Managers.DatabaseManager.GetDatabase);
                    Info($"Data loaded into the cache manager for all customers ...");
                }
                else
                {
                    Info("The database cache manager is disabled");
                }

                // Load all labels

                LanguageManager.GetInstance(_userManager.Database);

                // Start Heartbeat

                DatabaseQueue.Instance.StartConsumer();
                Syncytium.Web.MvcApplication.StartHeartbeat();

                return View(new UserViewModel(new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage),
                                                new UserRecord(),
                                                HttpContext.User.Identity.IsAuthenticated));
            }
            catch (System.Exception ex)
            {
                Exception("An exception occurs during the upgrading process", ex);
                StatusManager.Status = StatusManager.EStatus.STATUS_FAIL;
                StatusManager.Exception = ex;
                return View("Error", new UserViewModel(new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage),
                                                        new UserRecord(),
                                                        HttpContext.User.Identity.IsAuthenticated));
            }
        }

        /// <summary>
        /// URL ~/Administration/Administration/Log?date=YYYY-MM-DD
        /// </summary>
        /// <param name="date">The day you want to download</param>
        /// <returns></returns>
        [RoleFilter]
        [HttpGet]
        public ActionResult Log(string date)
        {
            Debug($"Get ~/Administration/Administration/Log({date})");

            if (date == null)
                return HttpNotFound();

            // Load all log files corresponding to the date into a zip file

            MemoryStream compressedFileStream = new MemoryStream();

            // Create an archive and store the stream in memory

            using (var zipArchive = new ZipArchive(compressedFileStream, ZipArchiveMode.Update, false))
            {
                string UrlRoot = ConfigurationManager.ServerHttpRoot;
                if (!UrlRoot.EndsWith("/"))
                    UrlRoot += "/";
                UrlRoot += "Logs/";

                foreach (string filenameAndPath in Directory.GetFiles(Path.GetDirectoryName(UrlRoot)))
                {
                    if (Path.GetFileName(filenameAndPath).IndexOf(date) < 0)
                    {
                        Debug($"Ignore the file '{filenameAndPath}' because it doesn't match");
                        continue;
                    }

                    // Get the file

                    byte[] bytes = null;

                    try
                    {
                        bytes = System.IO.File.ReadAllBytes(filenameAndPath);
                    }
                    catch (System.Exception ex)
                    {
                        Exception($"Ignore the file '{filenameAndPath}' due to an exception", ex);
                    }

                    if (bytes == null)
                        continue;

                    // Create a zip entry for each attachment

                    var zipEntry = zipArchive.CreateEntry(Path.GetFileName(filenameAndPath));

                    // Get the stream of the attachment

                    using (var originalFileStream = new MemoryStream(bytes))
                    {
                        using (var zipEntryStream = zipEntry.Open())
                        {
                            //Copy the attachment stream to the zip entry stream
                            originalFileStream.CopyTo(zipEntryStream);
                        }
                    }
                }
            }

            return File(compressedFileStream.ToArray(), "application/zip", "logs.zip");
        }

        /// <summary>
        /// URL ~/Administration/Administration/Reload?customerId=99
        /// </summary>
        /// <param name="customerId">null, all customer, or the customer Id</param>
        /// <returns></returns>
        [RoleFilter(AllModules = false)]
        public ActionResult Reload(int ?customerId)
        {
            Debug($"Get ~/Administration/Administration/Reload({customerId ?? -1})");

            List<int> customerIds = null;
            if (customerId != null)
            {
                customerIds = new List<int>
                {
                    customerId.Value
                };
            }
            else
                customerIds = _userManager.Database.Customer.Select(c => c.Id).ToList();

            DatabaseCacheManager.Instance.Initialize(_userManager.Database, customerIds, Syncytium.Managers.DatabaseManager.GetDatabase);
            FormsAuthentication.SignOut();

            return Redirect("/");
        }

        /// <summary>
        /// URL ~/Administration/Administration/Index
        /// </summary>
        /// <param name="moduleId"></param>
        /// <returns></returns>
        [RoleFilter(Module = ModuleRecord.EModule.Administration, Role = UserProfile.EUserProfile.Administrator)]
        public ActionResult Index(int? moduleId)
        {
            Debug($"Get ~/Administration/Administration/Index({moduleId})");

            // If the login doesn't exist, it is the administrator by default (due to RoleFilter)

            if (!(_userManager.GetById(int.Parse(HttpContext.User.Identity.Name)) is UserRecord user))
                user = UserRecord.CreateDefaultAdministrator();

            // load ressources before designing the screen fitted to the user's profile

            LanguageDictionary ressources = new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);
            ressources.Load(_userManager.Database, user.CustomerId);

            // the user exists, check if it's already connected
            // In case of reloading page, the connection can't be disconnected as quick as expected ...

            if (DatabaseHub.IsAlreadyConnected(user.Id))
            {
                FormsAuthentication.SignOut();
                Debug($"The user '{user.Id}' is already connected on another support");
                return View("AlreadyConnected", new UserViewModel(ressources, user, false));
            }

            return View("Index", new UserViewModel(ressources, user, HttpContext.User.Identity.IsAuthenticated, moduleId));
        }

        /// <summary>
        /// Constructor within a userManager defined
        /// </summary>
        public AdministrationController(UserManager userContext) : base(userContext) { }

        /// <summary>
        /// Constructor by default
        /// </summary>
        public AdministrationController() : base() { }
    }
}