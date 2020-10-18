using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Models;
using System;
using System.Collections.Generic;

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

namespace Syncytium.Web.Areas.ViewModels
{
    /// <summary>
    /// Link a custom towards the view
    /// </summary>
    public class CustomerViewModel
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
        /// List of customers
        /// </summary>
        public List<CustomerRecord> Customers = new List<CustomerRecord>();

        /// <summary>
        /// Reference on the current customer
        /// </summary>
        public CustomerRecord Customer { get; } = null;

        /// <summary>
        /// Mode of the application "DEV", "UAT" or "PROD"
        /// </summary>
        public string Mode { get; } = "DEV";

        /// <summary>
        /// Notify if the log mode must be enable into the client
        /// </summary>
        public bool IsLogEnabled { get; } = false;

        /// <summary>
        /// Notify if the debug mode is enable from the server
        /// </summary>
        public bool Debug { get; } = false;

        /// <summary>
        /// Notify if the verbose mode is enable from the server
        /// </summary>
        public bool Verbose { get; } = false;

        /// <summary>
        /// Version number of the application
        /// </summary>
        public string Version { get; } = "";

        /// <summary>
        /// Root URL of the website
        /// </summary>
        public string UrlRoot { get; } = string.Empty;

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
        /// Constructor
        /// </summary>
        /// <param name="ressources"></param>
        /// <param name="profile"></param>
        public CustomerViewModel(LanguageDictionary ressources,
                                 UserRecord profile)
        {
            Ressources = ressources;
            UserProfile = profile;
            Mode = ConfigurationManager.Mode;
            IsLogEnabled = ConfigurationManager.IsLogEnabled;
            Debug = ConfigurationManager.Debug;
            Verbose = ConfigurationManager.Verbose;
            Version = ConfigurationManager.ApplicationVersion.ToString();
            UrlRoot = ConfigurationManager.ServerHttpRoot;
            if (!UrlRoot.EndsWith("/"))
                UrlRoot += "/";
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="ressources"></param>
        /// <param name="profile"></param>
        /// <param name="customer"></param>
        public CustomerViewModel(LanguageDictionary ressources,
                                 UserRecord profile,
                                 CustomerRecord customer)
        {
            Ressources = ressources;
            UserProfile = profile;
            Customer = customer;
            Mode = ConfigurationManager.Mode;
            IsLogEnabled = ConfigurationManager.IsLogEnabled;
            Debug = ConfigurationManager.Debug;
            Verbose = ConfigurationManager.Verbose;
            Version = ConfigurationManager.ApplicationVersion.ToString();
            UrlRoot = ConfigurationManager.ServerHttpRoot;
            if (!UrlRoot.EndsWith("/"))
                UrlRoot += "/";
        }
    }
}