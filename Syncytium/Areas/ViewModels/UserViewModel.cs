using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Models;
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

namespace Syncytium.Web.Areas.ViewModels
{
    /// <summary>
    /// Link a User towards the view
    /// </summary>
    public class UserViewModel
    {
        /// <summary>
        /// Multilingual ressources
        /// </summary>
        public LanguageDictionary Ressources { get; } = null;

        /// <summary>
        /// Reference on the user's profile
        /// </summary>
        public UserRecord UserProfile { get; } = null;

        /// <summary>
        /// Notify if the user is authenticated or not
        /// </summary>
        public bool Authenticated { get; } = false;

        /// <summary>
        /// Notify in the signin screen that the remember me is checked or not
        /// </summary>
        public bool RememberMe { get; } = false;

        /// <summary>
        /// Root URL of the website
        /// </summary>
        public string UrlRoot { get; } = string.Empty;

        /// <summary>
        /// ModuleId referenced by this instance
        /// </summary>
        public int? ModuleId { get; } = null;

        /// <summary>
        /// Mode of the application "DEV", "UAT" or "PROD"
        /// </summary>
        public string Mode { get; } = "DEV";

        /// <summary>
        /// Notify if the log mode must be enable into the client
        /// </summary>
        public bool IsLogEnabled { get; } = false;

        /// <summary>
        /// Notify if the verbose mode is enable from the server
        /// </summary>
        public bool Verbose { get; } = false;

        /// <summary>
        /// Notify if the debug mode is enable from the server
        /// </summary>
        public bool Debug { get; } = false;

        /// <summary>
        /// Version number of the application
        /// </summary>
        public string Version { get; } = "";

        /// <summary>
        /// Notify that the current status of the application is ok
        /// </summary>
        public bool StatusOK => StatusManager.Status == StatusManager.EStatus.STATUS_OK;

        /// <summary>
        /// Retrieve a label on depends on the user's language and the key message
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public string GetLabel(string key)
        {
            return Ressources.GetLabel(UserProfile?.Language, key);
        }

        /// <summary>
        /// Retrieve a value stored into the configuration
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public string GetConfiguration(string key)
        {
            return ConfigurationManager.Settings[key] ?? "";
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="ressources"></param>
        /// <param name="profile"></param>
        /// <param name="authenticated"></param>
        /// <param name="moduleId"></param>
        /// <param name="rememberMe"></param>
        public UserViewModel(LanguageDictionary ressources,
                             UserRecord profile,
                             bool authenticated,
                             int? moduleId = null,
                             bool rememberMe = false)
        {
            Ressources = ressources;
            UserProfile = profile;
            Authenticated = authenticated;
            Mode = ConfigurationManager.Mode;
            IsLogEnabled = ConfigurationManager.IsLogEnabled;
            Verbose = ConfigurationManager.Verbose;
            Debug = ConfigurationManager.Debug;
            ModuleId = moduleId;
            RememberMe = rememberMe;
            UrlRoot = System.Web.HttpContext.Current.Request.Url.GetLeftPart(UriPartial.Authority) + System.Web.VirtualPathUtility.ToAbsolute("~");
            if (!UrlRoot.EndsWith("/"))
                UrlRoot += "/";
            Version = ConfigurationManager.ApplicationVersion.ToString();
        }
    }
}