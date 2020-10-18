using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Managers;
using Syncytium.Module.Administration.Models;
using Syncytium.Web.Controllers;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using static Syncytium.Module.Administration.Models.ModuleRecord;

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

namespace Syncytium.Web.Filters
{
    /// <summary>
    /// Handle the filter on user's role handling [RoleFilter(AllModules=true, Module=EModule.None, Role=User.eProfile.None)]
    /// Example :
    /// [RoleFilter] => check if the user is authenticated
    /// [RoleFilter(AllModules=false)] => default administrator or user attached to the first Customer (CustomerId) is allowed
    /// [RoleFilter(Module=EModule.Referentiel)] => If moduleId is defined into the URL, check if the moduleId assigned to the user exists and corresponds to the module Referentiel
    /// [RoleFilter(Role=User.eProfile.Supervisor)] => If moduleId is defined into the URL, check if the moduleId assigned to the user exists and matchs within the expected role
    ///                                                If no moduleId is defined into the URL, check if one of the modules assigned to the user has a role matching within Supervisor
    /// [RoleFilter(Module=EModule.Referentiel, Role=User.eProfile.Supervisor)] => If moduleId is defined into the URL, check if the moduleId assigned to the user exists and matchs within the expected role
    /// </summary>
    public class RoleFilterAttribute : ActionFilterAttribute
    {
        /// <summary>
        /// Notify if the role concerns all modules (ignore Module property)
        /// </summary>
        public bool AllModules { get; set; } = true;

        /// <summary>
        /// Notify if the role concerns a ping
        /// </summary>
        public bool Ping { get; set; } = false;

        /// <summary>
        /// Describe the expected module for a user
        /// </summary>
        public EModule Module { get; set; } = EModule.None;

        /// <summary>
        /// Describe the expected role for a user
        /// </summary>
        public UserProfile.EUserProfile Role { get; set; } = UserProfile.EUserProfile.None;

        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static readonly string MODULE = typeof(RoleFilterAttribute).Name;

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
        /// Apply the filter to an action of the controller
        /// </summary>
        /// <param name="filterContext"></param>
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (IsVerbose())
                Verbose($"Check if the current user is allowed to get access to the target page ({filterContext.HttpContext.Request.RawUrl}) - AllModules = {(AllModules ? "true" : "false")} - Module = {Module} - Role = {Role}");

            // if the user is not authenticated ... can't access to the page ... redirect to the sign in page

            if (!HttpContext.Current.User.Identity.IsAuthenticated)
            {
                Verbose("The user has to be authenticated!");

                filterContext.Result = ((SyncytiumController)filterContext.Controller).RedirectToAction("SignIn", "User", "Administration", filterContext.HttpContext.Request.RawUrl);
                base.OnActionExecuting(filterContext);
                return;
            }

            if (Ping)
            {
                base.OnActionExecuting(filterContext);
                return;
            }


            // it is due to a upgrading process ... no error because StatusFilterAttribute has already rejected the action

            if (StatusManager.Status != StatusManager.EStatus.STATUS_OK)
            {
                Info("The server is not available!");

                if (!HttpContext.Current.User.Identity.Name.Equals("-1"))
                {
                    Warn("Only the administrator default user can get access! ");
                    FormsAuthentication.SignOut();

                    filterContext.Result = ((SyncytiumController)filterContext.Controller).RedirectToAction("SignIn", "User", "Administration", "", "ERR_UNAUTHORIZED");
                }

                Verbose("The user is allowed!");

                base.OnActionExecuting(filterContext);
                return;
            }

            // check if the user expected must be only connected (default)

            if (AllModules && Role == UserProfile.EUserProfile.None)
            {
                Verbose("The user is authenticated!");

                base.OnActionExecuting(filterContext);
                return;
            }

            // check if the user gets access on Customer or Administration screen

            if (!AllModules && Module == EModule.None)
            {
                // the default administrator user is allowed to get to this feature

                if (HttpContext.Current.User.Identity.Name.Equals("-1"))
                {
                    Warn("The default administrator is allowed!");

                    base.OnActionExecuting(filterContext);
                    return;
                }

                // the user connected must be for CustomerId = 1

                try
                {
                    using (Syncytium.Module.Administration.DatabaseContext dbContext = new Module.Administration.DatabaseContext())
                    {
                        UserManager database = new UserManager(dbContext);

                        if (!(database.GetById(int.Parse(HttpContext.Current.User.Identity.Name)) is UserRecord currentUser) || currentUser.CustomerId != 1)
                        {
                            Warn("The current user is not the user of the first customer!");

                            // The login doesn't exist, is it the administrator default login ?
                            // Or, Only the user defined for CustomerId = 1 can get access to the screen

                            FormsAuthentication.SignOut();
                            filterContext.Result = ((SyncytiumController)filterContext.Controller).RedirectToAction("SignIn", "User", "Administration", "", "ERR_UNAUTHORIZED");
                        }
                        else
                        {
                            Info("The user of the first customer is allowed!");
                        }
                    }
                }
                catch (System.Exception ex)
                {
                    Exception("Unable to filter on the user's role", ex);
                    filterContext.Result = ((SyncytiumController)filterContext.Controller).RedirectToAction("SignIn", "User", "Administration", "", "ERR_UNAUTHORIZED");
                }

                base.OnActionExecuting(filterContext);
                return;
            }

            // Check if the module expectation is correctly defined

            int? moduleId = null;
            if (filterContext.ActionParameters.ContainsKey("moduleId") && filterContext.ActionParameters["moduleId"] != null)
                moduleId = (int)filterContext.ActionParameters["moduleId"];

            try
            {
                using (Syncytium.Module.Administration.DatabaseContext dbContext = new Module.Administration.DatabaseContext())
                {
                    UserManager database = new UserManager(dbContext);

                    // retrieve the current user


                    if (!(database.GetById(int.Parse(HttpContext.Current.User.Identity.Name)) is UserRecord currentUser) || !currentUser.IsEnable())
                    {
                        Warn("The user doesn't exist or is not enabled!");

                        FormsAuthentication.SignOut();
                        filterContext.Result = ((SyncytiumController)filterContext.Controller).RedirectToAction("SignIn", "User", "Administration", "", "ERR_UNAUTHORIZED");
                        base.OnActionExecuting(filterContext);
                        return;
                    }

                    // retrieve the current module

                    if (moduleId != null)
                    {
                        if (!(database.GetModule(currentUser, moduleId.Value) is ModuleRecord currentModule) ||
                            !currentModule.Enable ||
                            !UserRecord.IsInRole(currentModule.Profile, Role) ||
                            (Module != EModule.None && currentModule.Module != Module))
                        {
                            Warn("The user has not enough rights to get access!");

                            FormsAuthentication.SignOut();
                            filterContext.Result = ((SyncytiumController)filterContext.Controller).RedirectToAction("SignIn", "User", "Administration", "", "ERR_UNAUTHORIZED");
                        }
                        else
                        {
                            Verbose("The user is allowed");
                        }

                        base.OnActionExecuting(filterContext);
                        return;
                    }

                    // check if one of the modules assigned to the user has the expected role

                    foreach (UserModuleRecord currentUserModule in database.Database.UserModule.Where(um => um.UserId == currentUser.Id).ToList())
                    {
                        if (!(database.GetModule(currentUser, currentUserModule.Id) is ModuleRecord currentModule))
                            continue;

                        if (UserRecord.IsInRole(currentModule.Profile, Role) && (Module == EModule.None || Module == currentModule.Module))
                        {
                            Verbose("The user is allowed");
                            base.OnActionExecuting(filterContext);
                            return;
                        }
                    }

                    Warn("No module assigned to the user allows it to get access to the current page");
                    FormsAuthentication.SignOut();
                    filterContext.Result = ((SyncytiumController)filterContext.Controller).RedirectToAction("SignIn", "User", "Administration", "", "ERR_UNAUTHORIZED");
                }
            }
            catch (System.Exception ex)
            {
                Exception("Unable to filter on the user's role", ex);
                filterContext.Result = ((SyncytiumController)filterContext.Controller).RedirectToAction("SignIn", "User", "Administration", "", "ERR_UNAUTHORIZED");
            }

            base.OnActionExecuting(filterContext);
        }
    }
}