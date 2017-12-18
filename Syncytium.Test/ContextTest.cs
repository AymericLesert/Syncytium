using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Models;
using System.Data.Entity;

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

namespace Syncytium.Test
{
    class ContextTest : DbContext
    {
        #region DSTechnicalTable

        /// <summary>
        /// Table "_Parameter"
        /// </summary>
        public DbSet<ParameterRecord> _Parameter { get; set; }

        /// <summary>
        /// Table "_Connection"
        /// </summary>
        public DbSet<ConnectionRecord> _Connection { get; set; }

        /// <summary>
        /// Table "_Request"
        /// </summary>
        public DbSet<RequestRecord> _Request { get; set; }

        /// <summary>
        /// Table "_RequestId"
        /// </summary>
        public DbSet<RequestIdRecord> _RequestId { get; set; }

        /// <summary>
        /// Table "_SequenceId"
        /// </summary>
        public DbSet<SequenceIdRecord> _SequenceId { get; set; }

        /// <summary>
        /// Table "_Information"
        /// </summary>
        public DbSet<InformationRecord> _Information { get; set; }

        #endregion

        #region Database

        #region Area Administration

        /// <summary>
        /// Table "Language"
        /// </summary>
        public DbSet<LanguageRecord> Language { get; set; }

        /// <summary>
        /// Table "User"
        /// </summary>
        public DbSet<UserRecord> User { get; set; }

        #endregion

        #endregion

        #region DbContext

        /// <summary>
        /// Set the schema name of the database
        /// </summary>
        /// <param name="modelBuilder"></param>
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            string schema = ConfigurationManager.DatabaseSchema;

            base.OnModelCreating(modelBuilder);

            if (schema != null)
                modelBuilder.HasDefaultSchema(schema);
        }

        #endregion

        /// <summary>
        /// Initialize the database access
        /// </summary>
        public ContextTest() : base(ConfigurationManager.CONNEXION_STRING)
        {
            System.Data.Entity.Database.SetInitializer<ContextTest>(null);
        }
    }
}