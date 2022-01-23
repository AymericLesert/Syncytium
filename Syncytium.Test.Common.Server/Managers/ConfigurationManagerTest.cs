using Microsoft.VisualStudio.TestTools.UnitTesting;
using Syncytium.Core.Common.Server.Managers;
using System.Collections.Specialized;

/*
    Copyright (C) 2022 LESERT Aymeric - aymeric.lesert@concilium-lesert.fr

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

namespace Syncytium.Test.Common.Server.Managers
{
    /// <summary>
    /// Unitary test for the master class and its daughters of DSAnnotation
    /// </summary>
    [TestClass]
    public class ConfigurationManagerTest
    {
        [TestInitialize]
        public void Initialise()
        {
            ConfigurationManager.AppSettings = new NameValueCollection
            {
                {"Syncytium.Database.Schema", "SyncytiumTest" }
            };
            ConfigurationManager.ConnectionStrings = new System.Configuration.ConnectionStringSettingsCollection
            {
                new System.Configuration.ConnectionStringSettings("Syncytium", "server=localhost;port=3306;database=Syncytium_TEST;uid=syncytium;password=syncytium", "MySql.Data.MySqlClient")
            };
        }

        [TestMethod]
        public void DatabaseSchemaTest()
        {
            Assert.AreEqual(ConfigurationManager.Settings["Syncytium.Database.Schema"], "SyncytiumTest");
        }
    }
}
