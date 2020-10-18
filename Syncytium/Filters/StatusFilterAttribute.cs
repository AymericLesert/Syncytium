using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Models;
using Syncytium.Web.Areas.ViewModels;
using System.Web.Mvc;

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
    /// Check the application status:
    /// * In case of STATUS_OK        : no changes ...
    /// * In case of STATUS_FAIL      : Show a page describing a technical issue
    /// * In case of STATUS_UPGRADING : Show a page dedicated to the upgrading process for the admin user or a support operation for the other users
    /// </summary>
    public class StatusFilterAttribute : ActionFilterAttribute
    {
        /// <summary>
        /// Apply the filter to an action of the controller
        /// </summary>
        /// <param name="filterContext"></param>
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            switch (StatusManager.Status)
            {
                case StatusManager.EStatus.STATUS_OK:
                    break;
                case StatusManager.EStatus.STATUS_FAIL:
                    filterContext.Result = new ViewResult
                    {
                        ViewName = "Error",
                        ViewData = new ViewDataDictionary(filterContext.Controller.ViewData)
                        {
                            Model = new UserViewModel(new LanguageDictionary(((Controller)filterContext.Controller).Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage),
                                                            new UserRecord(),
                                                            false)
                        }
                    };
                    break;
                case StatusManager.EStatus.STATUS_UPGRADING:
                    if (filterContext.ActionDescriptor.ActionName.Equals("SignIn") ||
                        filterContext.ActionDescriptor.ActionName.Equals("SignOut") ||
                        filterContext.ActionDescriptor.ActionName.Equals("Upgrade"))
                        break;

                    if (filterContext.HttpContext.User.Identity.IsAuthenticated && filterContext.HttpContext.User.Identity.Name.Equals("-1"))
                    {
                        filterContext.Result = new ViewResult
                        {
                            ViewName = "Upgrading",
                            ViewData = new ViewDataDictionary(filterContext.Controller.ViewData)
                            {
                                Model = new UserViewModel(new LanguageDictionary(((Controller)filterContext.Controller).Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage),
                                                          UserRecord.CreateDefaultAdministrator(),
                                                          true)
                            }
                        };
                    }
                    else
                    {
                        filterContext.Result = new ViewResult
                        {
                            ViewName = "Upgrading",
                            ViewData = new ViewDataDictionary(filterContext.Controller.ViewData)
                            {
                                Model = new UserViewModel(new LanguageDictionary(((Controller)filterContext.Controller).Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage),
                                                          new UserRecord(),
                                                          false)
                            }
                        };
                    }

                    break;
            }

            base.OnActionExecuting(filterContext);
        }
    }
}