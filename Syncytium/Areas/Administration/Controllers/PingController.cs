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
    public class PingController : SyncytiumController
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected override string MODULE => typeof(PingController).Name;

        #endregion

        /// <summary>
        /// Test ping
        /// </summary>
        /// <returns></returns>
        [RoleFilter(Ping = true)]
        public JObject Ping()
        {
            Info($"Ping from the user '{HttpContext.User.Identity.Name}'");
            return new JObject
            {
                ["Ping"] = "OK"
            };
        }

        /// <summary>
        /// Constructor by default
        /// </summary>
        public PingController() : base(false) { }
    }
}