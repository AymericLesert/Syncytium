using Syncytium.Module.Administration.Managers;
using Syncytium.Module.Administration.Models;
using Syncytium.Web.Areas.ViewModels;
using Syncytium.Web.Controllers;
using Syncytium.Web.Filters;
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

namespace Syncytium.Web.Areas.Customer.Controllers
{
    /// <summary>
    /// Handle the stock controller
    /// </summary>
    public class CustomerController : SyncytiumController
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected override string MODULE => typeof(CustomerController).Name;

        #endregion

        /// <summary>
        /// URL ~/Administratif/Administratif/Index
        /// </summary>
        /// <param name="moduleId"></param>
        /// <returns></returns>
        [RoleFilter(Module = ModuleRecord.EModule.Customer)]
        public ActionResult Index(int? moduleId)
        {
            Debug($"Get ~/Customer/Customer/Index({moduleId})");

            UserViewModel viewModel = BuildUserViewModel(moduleId);

            if (viewModel == null)
                return HttpNotFound();

            if (!viewModel.Authenticated)
                return View("AlreadyConnected", viewModel);

            // Show the screen on depends on the user's profile

            return View("Index", viewModel);
        }

        /// <summary>
        /// Constructor within a userManager defined
        /// </summary>
        public CustomerController(UserManager userContext) : base(userContext) { }

        /// <summary>
        /// Constructor by default
        /// </summary>
        public CustomerController() : base() { }
    }
}