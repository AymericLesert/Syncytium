using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Error;
using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Managers;
using Syncytium.Module.Administration.Models;
using Syncytium.Web.Areas.ViewModels;
using System;
using System.Collections.Generic;
using System.Web.Mvc;
using System.Web.Security;

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

namespace Syncytium.Web.Controllers
{
    /// <summary>
    /// Base class of the controllers of Syncytium application
    /// </summary>
    public abstract class SyncytiumController : Controller
    {
        /// <summary>
        /// Inidicates if the database must be disposable here or in the caller
        /// </summary>
        private bool _disposeDatabase = false;

        /// <summary>
        /// Reference on the DataAccessLayer of a user
        /// </summary>
        protected UserManager _userManager = null;

        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected virtual string MODULE => typeof(SyncytiumController).Name;

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        protected bool IsVerbose() => Common.Logger.LoggerManager.Instance.IsVerbose;

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="message"></param>
        protected void Verbose(string message) => Common.Logger.LoggerManager.Instance.Verbose(MODULE, message);

        /// <summary>
        /// Indicates if the debug mode is enabled or not
        /// </summary>
        /// <returns></returns>
        protected bool IsDebug() => Common.Logger.LoggerManager.Instance.IsDebug;

        /// <summary>
        /// Log a debug message
        /// </summary>
        /// <param name="message"></param>
        protected void Debug(string message) => Common.Logger.LoggerManager.Instance.Debug(MODULE, message);

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        protected void Info(string message) => Common.Logger.LoggerManager.Instance.Info(MODULE, message);

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        protected void Warn(string message) => Common.Logger.LoggerManager.Instance.Warn(MODULE, message);

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        protected void Error(string message) => Common.Logger.LoggerManager.Instance.Error(MODULE, message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        protected void Exception(string message, System.Exception ex) => Common.Logger.LoggerManager.Instance.Exception(MODULE, message, ex);

        #endregion

        #region Controller

        /// <summary>
        /// Delete the data access layer at the end of the controller
        /// </summary>
        /// <param name="disposing"></param>
        protected override void Dispose(bool disposing)
        {
            if (_userManager != null && _disposeDatabase)
                _userManager.Database.Dispose();
            base.Dispose(disposing);
        }

        /// <summary>
        /// Handle the current exception
        /// </summary>
        /// <param name="filterContext"></param>
        protected override void OnException(ExceptionContext filterContext)
        {
            Exception("An exception occurs in the controller", filterContext.Exception);
            base.OnException(filterContext);
        }

        /// <summary>
        /// Handle the redirection to another page
        /// </summary>
        /// <param name="action"></param>
        /// <param name="controller"></param>
        /// <param name="area"></param>
        /// <param name="returnUrl"></param>
        /// <param name="error"></param>
        /// <returns></returns>
        public RedirectToRouteResult RedirectToAction(string action, string controller, string area, string returnUrl, string error = "")
        {
            return base.RedirectToAction(action, controller, new { area = area, returnUrl = returnUrl, error = error });
        }

        #endregion

        /// <summary>
        /// Set modelState within current errors
        /// </summary>
        /// <param name="modelState"></param>
        /// <param name="ressources"></param>
        /// <param name="errors"></param>
        protected void SetModelState(ModelStateDictionary modelState, LanguageDictionary ressources, Errors errors)
        {
            modelState.Clear();

            foreach (KeyValuePair<string, List<Error>> field in errors.Fields)
                foreach (Error error in field.Value)
                    modelState.AddModelError(field.Key, ressources.GetLabel(ressources.DefaultLanguage, error.Message, error.Parameters));

            foreach (Error error in errors.Global)
                modelState.AddModelError("", ressources.GetLabel(ressources.DefaultLanguage, error.Message, error.Parameters));
        }

        /// <summary>
        /// On depends on the current context, build the view model of the index page for a module (except Administration or Customer)
        /// </summary>
        /// <param name="moduleId"></param>
        /// <returns></returns>
        public UserViewModel BuildUserViewModel(int? moduleId)
        {
            // Retrieve the user

            UserRecord user = _userManager.GetById(int.Parse(HttpContext.User.Identity.Name)) as UserRecord;

            if (user == null)
                return null;

            // load ressources before designing the screen fitted to the user's profile

            LanguageDictionary ressources = new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);
            ressources.Load(_userManager.Database, user.CustomerId);

            // the user exists, check if it's already connected
            // In case of reloading page, the connection can't be disconnected as quick as expected ...

            if (Database.DatabaseHub.IsAlreadyConnected(user.Id))
            {
                FormsAuthentication.SignOut();
                Debug($"The user '{user.Id}' is already connected on another support");
                return new UserViewModel(ressources, user, false);
            }

            // Show the screen on depends on the user's profile

            return new UserViewModel(ressources, user, HttpContext.User.Identity.IsAuthenticated, moduleId);
        }


        /// <summary>
        /// Constructor within a userManager defined
        /// </summary>
        public SyncytiumController(UserManager userContext) : base()
        {
            _disposeDatabase = false;
            _userManager = userContext;
        }

        /// <summary>
        /// Constructor by default
        /// </summary>
        public SyncytiumController() : base()
        {
            _disposeDatabase = true;
            _userManager = new UserManager(new Syncytium.Module.Administration.DatabaseContext());
        }
    }
}