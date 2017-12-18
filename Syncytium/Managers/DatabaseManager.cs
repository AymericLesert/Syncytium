using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Exception;
using Syncytium.Module.Administration;
using Syncytium.Module.Administration.Managers;
using System;
using System.Collections.Generic;
using System.Linq;

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

namespace Syncytium.Managers
{
    /// <summary>
    /// Static class to create a database instance on depends on the connection and the current user
    /// </summary>
    public static class DatabaseManager
    {
        /// <summary>
        /// Build an database context on depends on the area
        /// </summary>
        /// <param name="area"></param>
        /// <returns></returns>
        public static DatabaseContext GetDatabase(string area)
        {
            switch (area)
            {
                case Syncytium.Module.Administration.DatabaseContext.AREA_NAME:
                    return new Syncytium.Module.Administration.DatabaseContext();

                case Syncytium.Module.Sample.DatabaseContext.AREA_NAME:
                    return new Syncytium.Module.Sample.DatabaseContext();
            }

            throw new ExceptionNotImplemented($"Unable to create the database instance of the module '{area}'!");
        }

        /// <summary>
        /// Create a database instance if the module, connection and user are known
        /// </summary>
        /// <param name="area"></param>
        /// <param name="connectionId"></param>
        /// <param name="userId"></param>
        /// <returns></returns>
        public static Common.Database.DatabaseManager CreateDatabase(string area, string connectionId, int userId)
        {
            DatabaseContext dbContext = GetDatabase(area);
            return new Common.Database.DatabaseManager(dbContext, new UserManager(dbContext), connectionId, userId);
        }

        /// <summary>
        /// Look for the module of the user and create an instance of the database
        /// </summary>
        /// <param name="connectionId"></param>
        /// <param name="userId"></param>
        /// <returns></returns>
        public static Common.Database.DatabaseManager CreateDatabase(string connectionId, int userId)
        {
            DatabaseContext dbContext = GetDatabase(Syncytium.Module.Administration.DatabaseContext.AREA_NAME);

            // Get the current connection properties to retrieve the user's area

            ConnectionRecord currentConnection = dbContext._Connection.FirstOrDefault(c => c.ConnectionId.Equals(connectionId) &&
                                                                                           c.Machine.Equals(Environment.MachineName) &&
                                                                                           c.UserId == userId);
            if (currentConnection == null)
            {
                Common.Logger.LoggerManager.Instance.Error("DatabaseManager", $"The connection '{connectionId}' doesn't exist!");
                throw new ExceptionDefinitionRecord("ERR_CONNECTION");
            }

            string area = currentConnection.Area;
            if (area == null || area.Equals(DatabaseContext.AREA_NAME))
                return new Syncytium.Common.Database.DatabaseManager(dbContext, new UserManager(dbContext), connectionId, userId);

            // look for the current database manager

            dbContext.Dispose();
            dbContext = null;

            return CreateDatabase(area, connectionId, userId);
        }
    }
}