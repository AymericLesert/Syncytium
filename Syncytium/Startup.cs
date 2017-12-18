using Syncytium.Common.Managers;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;
using System;

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

[assembly: OwinStartup(typeof(Syncytium.Web.Startup))]
[assembly: log4net.Config.XmlConfigurator(ConfigFile = "Web.config", Watch = true)]
namespace Syncytium.Web
{
    /// <summary>
    /// Entry point of the application
    /// </summary>
    public class Startup
    {
        /// <summary>
        /// Initialize signalR connection ...
        /// </summary>
        /// <param name="app"></param>
        public void Configuration(IAppBuilder app)
        {
            // Any connection or hub wire up and configuration should go here

            GlobalHost.Configuration.MaxIncomingWebSocketMessageSize = ConfigurationManager.ClientHubMaxSize * 1024; // Max size of the buffer (client to server)
            GlobalHost.Configuration.DisconnectTimeout = TimeSpan.FromSeconds(ConfigurationManager.ClientHubInterval); // Time between 2 timeout

            app.MapSignalR();
        }
    }
}
