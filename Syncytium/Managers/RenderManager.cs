using System.IO;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

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

namespace Syncytium.Web.Managers
{
    /// <summary>
    /// Just for the method
    /// </summary>
    public class EmptyController : Controller { }

    /// <summary>
    /// Use Razor MVC
    /// </summary>
    public class RenderManager
    {
        /// <summary>
        /// Convert a partial view to a string
        /// </summary>
        /// <param name="viewName">Absolute path (started by ~)</param>
        /// <param name="model"></param>
        /// <returns></returns>
        public static string RenderView(string viewName, object model)
        {
            using (var st = new StringWriter())
            {
                var context = new HttpContextWrapper(HttpContext.Current);
                var routeData = new RouteData();
                var controllerContext = new ControllerContext(new RequestContext(context, routeData), new EmptyController());
                var razor = new RazorView(controllerContext, viewName, null, false, null);
                razor.Render(new ViewContext(controllerContext, razor, new ViewDataDictionary(model), new TempDataDictionary(), st), st);
                return st.ToString();
            }
        }
    }
}