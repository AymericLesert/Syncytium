using System.Data.Common;
using System.Data.Entity;

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
    /// Handle the access to the oracle database
    /// </summary>
    public class Oracle : Provider
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected override string MODULE => typeof(Oracle).Name;

        #endregion

        #region Provider

        /// <summary>
        /// Retrieve the database type implemented
        /// </summary>
        public override EProvider Type => EProvider.Oracle;

        /// <summary>
        /// Retrieve the SQL command corresponding to the existing table
        /// </summary>
        /// <param name="table"></param>
        /// <returns></returns>
        public override string GetSQLExistTable(string table) => $"SELECT * FROM all_tables WHERE table_name = '{table}' and OWNER = '{Schema}'";

        #endregion

        #region Private

        /// <summary>
        /// Parse a SQL file to retrieve token after token
        /// </summary>
        /// <param name="script"></param>
        /// <returns></returns>
        private static IEnumerable<Tuple<string, int>> ParseSQLToken(string script)
        {
            for (int i = 0; i < script.Length; i++)
            {
                // ignore space
                if (script[i] <= ' ')
                    continue;

                // Comment
                if (script[i] == '-' && i < script.Length - 1 && script[i + 1] == '-')
                {
                    // comment : go to the end of line
                    for (; i < script.Length && script[i] != '\n'; i++) ;
                    continue;
                }

                // end line
                if (script[i] == '\n')
                    continue;

                // string
                if (script[i] == '\'')
                {
                    string token = "'";

                    bool endString = false;
                    for (i++; i < script.Length && !endString; i++)
                    {
                        if (script[i] == '\'' && i < script.Length - 1 && script[i + 1] == '\'')
                            i++;
                        else if (script[i] == '\'')
                            endString = true;

                        token += script[i];
                    }

                    yield return new Tuple<string, int>(token, i + (i < script.Length ? 0 : 1));

                    if (endString)
                        i--;
                    continue;
                }

                // string
                if (script[i] == '\"')
                {
                    string token = "\"";

                    for (i++; i < script.Length && script[i] != '"'; i++)
                        token += script[i];
                    token += '"';

                    yield return new Tuple<string, int>(token, i + (i < script.Length ? 0 : 1));
                    continue;
                }

                // litteral
                if (('a' <= script[i] && script[i] <= 'z') ||
                    ('A' <= script[i] && script[i] <= 'Z') ||
                    ('0' <= script[i] && script[i] <= '9') ||
                    (script[i] == '_'))
                {
                    string token = script[i].ToString();
                    for (i++; i < script.Length &&
                              (('a' <= script[i] && script[i] <= 'z') ||
                               ('A' <= script[i] && script[i] <= 'Z') ||
                               ('0' <= script[i] && script[i] <= '9') ||
                               (script[i] == '_') ||
                               (script[i] == '.')); i++)
                        token += script[i];

                    yield return new Tuple<string, int>(token, i + (i < script.Length ? 0 : 1));
                    i--;
                    continue;
                }

                if (script[i] == ':' && i < script.Length - 1 && script[i] == '=')
                {
                    yield return new Tuple<string, int>(":=", i + 1);
                    i++;
                    continue;
                }

                yield return new Tuple<string, int>(script[i].ToString(), i + 1);
            }
        }

        /// <summary>
        /// Remove the beginning of the line if '--' started the new command
        /// </summary>
        /// <param name="sqlCommand"></param>
        /// <returns></returns>
        private static string RemoveComment(string sqlCommand)
        {
            sqlCommand = sqlCommand.Trim();
            if (!sqlCommand.StartsWith("--"))
                return sqlCommand;

            int i;
            for (i = 0; i < sqlCommand.Length && sqlCommand[i] != '\n'; i++);
            if (i == sqlCommand.Length)
                return "";
            return sqlCommand[(i + 1)..];
        }

        /// <summary>
        /// Retrieve all SQL commands included into a script
        /// </summary>
        /// <param name="script"></param>
        /// <returns></returns>
        public static IEnumerable<Tuple<System.Data.CommandType, string>> ParseSQLCommand(string script)
        {
            // remove blank line and comments

            string scriptToParse = "";
            foreach (string line in script.Replace("\r\n", "\n").Split('\n'))
            {
                if (line.Trim().Equals("") || line.Trim().StartsWith("--"))
                    continue;

                scriptToParse += line + "\n";
            }

            // retrieve all tokens

            List<Tuple<string, int>> tokens = ParseSQLToken(scriptToParse).ToList();

            int lastIndex = 0;
            int blockBegin = 0;
            int lastLitteral = -1;

            System.Data.CommandType currentType = System.Data.CommandType.Text;
            bool addSemiColumn = false;
            bool dropInstruction = false;

            for (int i = 0; i < tokens.Count; i++)
            {
                Tuple<string, int> token = tokens[i];

                if (token.Item1.Equals(";") && blockBegin == 0)
                {
                    string sqlCommand = RemoveComment(scriptToParse[lastIndex..token.Item2].Trim());

                    lastIndex = token.Item2;
                    lastLitteral = i;

                    if (sqlCommand.Equals(""))
                        continue;

                    if (currentType == System.Data.CommandType.StoredProcedure)
                        sqlCommand = $"BEGIN\n{sqlCommand}\nEND;";
                    else
                    {
                        if (sqlCommand.EndsWith(";"))
                            sqlCommand = sqlCommand[0..^1];

                        if (addSemiColumn)
                            sqlCommand += ";";
                    }

                    yield return new Tuple<System.Data.CommandType, string>(currentType, sqlCommand);

                    addSemiColumn = false;
                    currentType = System.Data.CommandType.Text;
                    continue;
                }

                if (token.Item1.ToUpper().Equals("DROP") && blockBegin == 0)
                    dropInstruction = true;

                if ((token.Item1.ToUpper().Equals("PROCEDURE") ||
                     token.Item1.ToUpper().Equals("TRIGGER")) && blockBegin == 0 && !dropInstruction)
                    addSemiColumn = true;

                if (token.Item1.ToUpper().Equals("EXECUTE") && blockBegin == 0)
                {
                    currentType = System.Data.CommandType.StoredProcedure;
                    lastIndex = token.Item2;
                }

                if (i == lastLitteral + 1 && token.Item1.ToUpper().Equals("BEGIN"))
                    currentType = System.Data.CommandType.StoredProcedure;

                if (token.Item1.ToUpper().Equals("BEGIN"))
                    blockBegin++;

                if (token.Item1.ToUpper().Equals("END") &&
                    ((i == tokens.Count - 1) ||
                     ((i < tokens.Count - 1) && tokens[i + 1].Item1.Equals(";"))))
                    blockBegin--;
            }

            if (lastLitteral < tokens.Count - 1)
            {
                string sqlCommand = RemoveComment(scriptToParse[lastIndex..].Trim());

                if (!sqlCommand.Equals(""))
                {
                    if (currentType == System.Data.CommandType.StoredProcedure)
                        sqlCommand = $"BEGIN\n{sqlCommand}\nEND;";
                    else
                    {
                        if (sqlCommand.EndsWith(";"))
                            sqlCommand = sqlCommand[0..^1];

                        if (addSemiColumn)
                            sqlCommand += ";";
                    }

                    yield return new Tuple<System.Data.CommandType, string>(currentType, sqlCommand);
                }
            }
        }

        #endregion

        /// <summary>
        /// Execute a SQL script
        /// The Oracle Data Provider can't execute a SQL script directly. In this function, we parse the script to execute insttruction by instruction.
        /// </summary>
        /// <param name="script"></param>
        /// <returns>true if the script has correctly run or false if something is wrong</returns>
        public override bool ExecuteScript(string script)
        {
            if (_database == null)
                return false;

            // update the script by adding BEGIN / COMMIT / END

            Debug($"Executing :\n{script}");

            // execute the SQL script and commit it

            foreach (Tuple<System.Data.CommandType, string> command in ParseSQLCommand(script))
            {
                string commandToRun = command.Item2;

                try
                {
                    using DbCommand sqlCommand = _database.CreateCommand();
                    if (command.Item1 == System.Data.CommandType.StoredProcedure)
                    {
                        sqlCommand.CommandText = commandToRun;
                        sqlCommand.CommandType = System.Data.CommandType.Text;
                        sqlCommand.ExecuteScalar();
                    }
                    else
                    {
                        sqlCommand.CommandText = commandToRun;
                        sqlCommand.CommandType = System.Data.CommandType.Text;
                        sqlCommand.ExecuteNonQuery();
                    }
                }
                catch (System.Exception ex)
                {
                    Exception($"Unable to execute the instruction:\n{commandToRun}", ex);
                    return false;
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
        public override bool ExistValue(DbContextTransaction? transaction, int? customerId, string table, string columnValue, string columnId, bool caseSensitive, object value, int id, Dictionary<string, object?>? fields)
        {
            string SQLFieldStatement = "";

            if (fields != null)
            {
                foreach(KeyValuePair<string, object?> key in fields)
                {
                    if (caseSensitive)
                        SQLFieldStatement += $"AND \"{table}\".\"{key.Key}\" = :value{key.Key} ";
                    else
                        SQLFieldStatement += $"AND upper(\"{table}\".\"{key.Key}\") = upper(:value{key.Key}) ";
                }
            }

            string SQLStatement = $"SELECT * " +
                                  $"FROM \"{table}\", \"_Information\" " +
                                  $"WHERE " + (caseSensitive ? $"\"{table}\".\"{columnValue}\" = :value" : $"upper(\"{table}\".\"{columnValue}\") = upper(:value)") + " " +
                                    (customerId == null ? "" : $"AND \"{table}\".\"CustomerId\" = :customerId ") +
                                    SQLFieldStatement +
                                    $"AND \"{table}\".\"{columnId}\" <> :id " +
                                    $"AND \"{table}\".\"{columnId}\" = \"_Information\".\"Id\" (+) " +
                                    $"AND \"_Information\".\"Table\" = :tablename " +
                                    $"AND \"_Information\".\"DeleteTick\" is null";

            bool exist = false;
            if (_database != null)
            {
                using DbCommand selectStatement = _database.CreateCommand();
                DbTransaction currentTransaction = transaction == null ? _database.BeginTransaction() : transaction.UnderlyingTransaction;

                selectStatement.Transaction = currentTransaction;
                selectStatement.CommandText = SQLStatement;
                selectStatement.CommandType = System.Data.CommandType.Text;
                DbParameter valueParameter = selectStatement.CreateParameter();
                valueParameter.ParameterName = ":value";
                valueParameter.Value = value;
                selectStatement.Parameters.Add(valueParameter);
                if (customerId != null)
                {
                    DbParameter customerIdParameter = selectStatement.CreateParameter();
                    customerIdParameter.ParameterName = ":customerId";
                    customerIdParameter.Value = customerId.Value;
                    selectStatement.Parameters.Add(customerIdParameter);
                }
                if (fields != null)
                {
                    foreach (KeyValuePair<string, object?> key in fields)
                    {
                        DbParameter valueFieldParameter = selectStatement.CreateParameter();
                        valueFieldParameter.ParameterName = $":value{key.Key}";
                        valueFieldParameter.Value = key.Value;
                        selectStatement.Parameters.Add(valueFieldParameter);
                    }
                }
                DbParameter idParameter = selectStatement.CreateParameter();
                idParameter.ParameterName = ":id";
                idParameter.Value = id;
                selectStatement.Parameters.Add(idParameter);
                DbParameter tableParameter = selectStatement.CreateParameter();
                tableParameter.ParameterName = ":tablename";
                tableParameter.Value = table;
                selectStatement.Parameters.Add(tableParameter);

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
        public Oracle(DbConnection database, string schema) : base(database, schema) { }
    }
}