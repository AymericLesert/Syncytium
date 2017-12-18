using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Database.DSSchema;
using Syncytium.Common.Error;
using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Models;
using Syncytium.Test;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;
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

namespace Syncytium.Tests
{
    /// <summary>
    /// Unitary test for the master class and its daughters of DSAnnotation
    /// </summary>
    [TestClass]
    public class DSAnnotationTest
    {
        [TestInitialize]
        public void Initialise()
        {
            ConfigurationManager.AppSettings = System.Configuration.ConfigurationManager.AppSettings;
            ConfigurationManager.ConnectionStrings = System.Configuration.ConfigurationManager.ConnectionStrings;
        }

        [TestMethod]
        public void CheckPropertiesTest()
        {
            DSDatabase schema = new DSDatabase(typeof(ContextTest), null);

            LanguageRecord language = new LanguageRecord();
            
            // Errors errors = schema.CheckProperties(language);
        }

        [TestMethod]
        public void FilterRecordTest()
        {
            DSDatabase schema = new DSDatabase(typeof(ContextTest), null);

            LanguageRecord language = new LanguageRecord();

            dynamic value = schema.FilterRecord(language, Syncytium.Module.Administration.DatabaseContext.AREA_NAME, -1, UserProfile.EUserProfile.Administrator);
        }

        [TestMethod]
        public void DateTimeTest()
        {
            DateTime time = Convert.ToDateTime("2016-08-04T16:08:08.396442+02:00");
        }

        [TestMethod]
        public void DynamicToJSONTest()
        {
            var v = JsonConvert.SerializeObject(new Errors("ESSAI"));
        }
    }
}
