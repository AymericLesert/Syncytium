using System.Data.SqlClient;
using System.Data.Common;
using System.Data.Entity;
using System.Text.RegularExpressions;

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

namespace Syncytium.Core.Common.Server.Database.Provider
{
    /// <summary>
    /// Handle the access to the SQL Server database
    /// </summary>
    public class SQLServer : Provider
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected override string MODULE => typeof(SQLServer).Name;

        #endregion

        #region Common

        /// <summary>
        /// Retrieve the database type implemented
        /// </summary>
        public override EProvider Type => EProvider.SQLServer;

        /// <summary>
        /// Retrieve the SQL command corresponding to the existing table
        /// </summary>
        /// <param name="table"></param>
        /// <returns></returns>
        public override string GetSQLExistTable(string table) => $"SELECT * FROM information_schema.tables WHERE TABLE_NAME = '{table}' and TABLE_SCHEMA = '{Schema}'";

        #endregion

        #region Private

        /// <summary>
        /// Used by SQL to set the schema value
        /// </summary>
        /// <returns></returns>
        private string GetSchema() => (Schema == null ? "" : ("[" + Schema + "]."));

        #endregion

        /// <summary>
        /// Execute a SQL script
        /// </summary>
        /// <param name="script"></param>
        /// <returns>true if the script has correctly run or false if something is wrong</returns>
        public override bool ExecuteScript(string script)
        {
            if (_database == null)
                return false;

            Debug($"Executing :\n{script}");

            // execute the SQL script and commit it

            IEnumerable<string> commandStrings = Regex.Split(script, @"^\s*GO\s*$", RegexOptions.Multiline | RegexOptions.IgnoreCase);
            foreach (string commandString in commandStrings)
            {
                if (commandString.Trim() != "")
                {
                    try
                    {
                        new SqlCommand(commandString, _database as SqlConnection).ExecuteNonQuery();
                    }
                    catch (System.Exception ex)
                    {
                        Exception($"Unable to execute the instruction:\n{commandString}", ex);
                        return false;
                    }
                }
            }

            return true;
        }

        /// <summary>
        /// Check if a value already exists into a table of the database and if this value is still alive
        /// </summary>
        /// <param name="transaction"></param>
        /// <param name="customerId"></param>
        /// <param name="table"></param>
        /// <param name="columnValue"></param>
        /// <param name="columnId"></param>
        /// <param name="caseSensitive"></param>
        /// <param name="value"></param>
        /// <param name="id"></param>
        /// <param name="fields"></param>
        /// <returns></returns>
        public override bool ExistValue(DbContextTransaction transaction, int? customerId, string table, string columnValue, string columnId, bool caseSensitive, object value, int id, Dictionary<string, object> fields)
        {
            string schema = GetSchema();

            string SQLStatement = $"SELECT * FROM {Schema}[{table}] " +
                $"LEFT OUTER JOIN {schema}[_Information] " +
                $"ON {schema}[_Information].[Id] = {schema}[{table}].[Id] " +
                (caseSensitive ? $"WHERE {schema}[{table}].[{columnValue}] = @value " : $"WHERE upper({Schema}[{table}].[{columnValue}]) = upper(@value) ") +
                $"AND {schema}[{table}].[{columnId}] <> @id " +
                $"AND {schema}[_Information].[Table] = @tablename " +
                $"AND {schema}[_Information].[DeleteTick] is null " +
                (customerId == null ? "" : $"AND {schema}[{table}].[CustomerId] = @customerId ");

            if (fields != null)
            {
                foreach (KeyValuePair<string, object> key in fields)
                {
                    if (caseSensitive)
                        SQLStatement += $"AND {schema}[{table}].[{key.Key}] = @value{key.Key} ";
                    else
                        SQLStatement += $"AND upper({schema}[{table}].[{key.Key}]) = upper(@value{key.Key}) ";
                }
            }

            bool exist = false;

            if (_database != null)
            {
                using DbCommand selectStatement = _database.CreateCommand();
                DbTransaction currentTransaction = transaction == null ? _database.BeginTransaction() : transaction.UnderlyingTransaction;

                selectStatement.Transaction = currentTransaction;
                selectStatement.CommandText = SQLStatement;
                selectStatement.CommandType = System.Data.CommandType.Text;
                DbParameter valueParameter = selectStatement.CreateParameter();
                valueParameter.ParameterName = "@value";
                valueParameter.Value = value;
                selectStatement.Parameters.Add(valueParameter);
                DbParameter idParameter = selectStatement.CreateParameter();
                idParameter.ParameterName = "@id";
                idParameter.Value = id;
                selectStatement.Parameters.Add(idParameter);
                DbParameter tableParameter = selectStatement.CreateParameter();
                tableParameter.ParameterName = "@tablename";
                tableParameter.Value = table;
                selectStatement.Parameters.Add(tableParameter);
                if (customerId != null)
                {
                    DbParameter customerIdParameter = selectStatement.CreateParameter();
                    customerIdParameter.ParameterName = "@customerId";
                    customerIdParameter.Value = customerId.Value;
                    selectStatement.Parameters.Add(customerIdParameter);
                }

                if (fields != null)
                {
                    foreach (KeyValuePair<string, object> key in fields)
                    {
                        DbParameter valueFieldParameter = selectStatement.CreateParameter();
                        valueFieldParameter.ParameterName = $"@value{key.Key}";
                        valueFieldParameter.Value = key.Value;
                        selectStatement.Parameters.Add(valueFieldParameter);
                    }
                }

                using (DbDataReader select = selectStatement.ExecuteReader())
                {
                    exist = select.Read();
                }

                if (transaction == null)
                    currentTransaction.Dispose();
            }

            return exist;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="database"></param>
        /// <param name="schema"></param>
        public SQLServer(DbConnection database, string schema) : base(database, schema) { }
    }
}