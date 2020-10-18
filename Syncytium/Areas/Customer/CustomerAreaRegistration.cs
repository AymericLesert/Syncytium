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

namespace Syncytium.Web.Areas.Customer
{
    /// <summary>
    /// Registration of the area Administratif
    /// </summary>
    public class CustomerAreaRegistration : AreaRegistration 
    {
        /// <summary>
        /// Name of the area
        /// </summary>
        public override string AreaName => Syncytium.Module.Customer.DatabaseContext.AREA_NAME;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="context"></param>
        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "Customer",
                "Customer/{controller}/{action}/{id}",
                new { controller = "Customer", action = "Index", id = UrlParameter.Optional });
        }
    }
}