using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Database.DSSchema;
using Syncytium.Common.Exception;
using Syncytium.Common.Managers;
using Newtonsoft.Json.Linq;
using Oracle.ManagedDataAccess.Client;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.Entity;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using FirebirdSql.Data.FirebirdClient;
using MySql.Data.MySqlClient;
using System.Reflection;
using Syncytium.Common.Database.DSAnnotation.DSControl;
using System.Linq.Expressions;
using System.Data.Entity.ModelConfiguration.Configuration;
using System.ComponentModel.DataAnnotations.Schema;

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

namespace Syncytium.Common.Database
{
    /// <summary>
    /// Handle the connection to the database (See Web.config to know if it works with Oracle or SQL Server)
    /// </summary>
    public abstract class DatabaseContext : DbContext
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
        /// Table "_RequestId"
        /// </summary>
        public DbSet<RequestIdRecord> _RequestId { get; set; }

        /// <summary>
        /// Table "_Request"
        /// </summary>
        public DbSet<RequestRecord> _Request { get; set; }

        /// <summary>
        /// Table "_Request"
        /// </summary>
        public DbSet<RequestTableRecord> _RequestTable { get; set; }

        /// <summary>
        /// Table "_SequenceId"
        /// </summary>
        public DbSet<SequenceIdRecord> _SequenceId { get; set; }

        /// <summary>
        /// Table "_Information"
        /// </summary>
        public DbSet<InformationRecord> _Information { get; set; }

        /// <summary>
        /// Table "_Ping"
        /// </summary>
        public DbSet<PingRecord> _Ping { get; set; }

        #endregion

        /// <summary>
        /// Reference on the provider depending on the database connection
        /// </summary>
        protected Provider.Provider _provider = null;

        /// <summary>
        /// Reference on the current transaction opened by the lock
        /// </summary>
        protected DatabaseLock _lock = null;

        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected virtual string MODULE => typeof(DatabaseContext).Name;

        /// <summary>
        /// Indicates if the all verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        protected bool IsVerboseAll() => Logger.LoggerManager.Instance.IsVerboseAll;

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        protected bool IsVerbose() => Logger.LoggerManager.Instance.IsVerbose;

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="message"></param>
        protected void Verbose(string message) => Logger.LoggerManager.Instance.Verbose(MODULE, message);

        /// <summary>
        /// Indicates if the debug mode is enabled or not
        /// </summary>
        /// <returns></returns>
        protected bool IsDebug() => Logger.LoggerManager.Instance.IsDebug;

        /// <summary>
        /// Log a debug message
        /// </summary>
        /// <param name="message"></param>
        protected void Debug(string message) => Logger.LoggerManager.Instance.Debug(MODULE, message);

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        protected void Info(string message) => Logger.LoggerManager.Instance.Info(MODULE, message);

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        protected void Warn(string message) => Logger.LoggerManager.Instance.Warn(MODULE, message);

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        protected void Error(string message) => Logger.LoggerManager.Instance.Error(MODULE, message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        protected void Exception(string message, System.Exception ex) => Logger.LoggerManager.Instance.Exception(MODULE, message, ex);

        #endregion

        #region DbContext

        /// <summary>
        /// Set the schema name of the database
        /// </summary>
        /// <param name="modelBuilder"></param>
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            string schema = ConfigurationManager.DatabaseSchema;
            bool firstError = false;

            base.OnModelCreating(modelBuilder);

            if (schema == null)
            {
                Info($"The schema of the database doesn't change (Please check the AppSetting '{ConfigurationManager.SETTING_DATABASE_SCHEMA}')");
            }
            else
            {
                Info($"The schema of the database becomes '{schema}'");
                modelBuilder.HasDefaultSchema(schema);
            }

            foreach (PropertyInfo property in this.GetType().GetProperties())
            {
                // Only DbSet<X> contains a table

                if (!property.PropertyType.IsGenericType || property.PropertyType.GetGenericTypeDefinition() != typeof(DbSet<>))
                    continue;

                // Ignore private, protected tables or properties started with "_"

                if (property.Name.StartsWith("_") || property.PropertyType.IsNotPublic)
                    continue;

                // Ignore record not inheritence of DSRecord

                Type tableType = property.PropertyType.GetGenericArguments().First();
                if (!tableType.IsSubclassOf(typeof(DSRecord)))
                    continue;

                foreach (PropertyInfo column in tableType.GetProperties())
                {
                    // ignore all properties started by "_" because it defines client information

                    if (column.Name.StartsWith("_") || column.PropertyType.IsNotPublic || !column.CanWrite)
                        continue;

                    foreach (object annotation in column.GetCustomAttributes(true))
                    {
                        if (!typeof(DSDecimalAttribute).IsInstanceOfType(annotation) || column.PropertyType == typeof(int))
                            continue;

                        var entityConfig = modelBuilder.GetType().GetMethod("Entity").MakeGenericMethod(tableType).Invoke(modelBuilder, null);
                        ParameterExpression param = ParameterExpression.Parameter(tableType, "c");
                        Expression expressionProperty = Expression.Property(param, column.Name);
                        LambdaExpression lambdaExpression = Expression.Lambda(expressionProperty, true, new ParameterExpression[] { param });

                        try
                        {
                            DecimalPropertyConfiguration decimalConfig;
                            if (column.PropertyType.IsGenericType && column.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>))
                            {
                                MethodInfo methodInfo = entityConfig.GetType().GetMethods().Where(p => p.Name == "Property").ToList()[7];
                                decimalConfig = methodInfo.Invoke(entityConfig, new[] { lambdaExpression }) as DecimalPropertyConfiguration;
                            }
                            else
                            {
                                MethodInfo methodInfo = entityConfig.GetType().GetMethods().Where(p => p.Name == "Property").ToList()[6];
                                decimalConfig = methodInfo.Invoke(entityConfig, new[] { lambdaExpression }) as DecimalPropertyConfiguration;
                            }

                            decimalConfig.HasPrecision((byte)(annotation as DSDecimalAttribute).Digit, (byte)(annotation as DSDecimalAttribute).Precision);
                        }
                        catch (System.Exception ex)
                        {
                            if ( !firstError )
                            {
                                Warn($"Unable to set decimal on the property {property.Name}.{column.Name} but it's not so important at all !");
                                Exception($"Unable to set decimal on the property {property.Name}.{column.Name}", ex);
                                firstError = true;
                            }
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Override the Dispose to write a message on deleting the database context
        /// </summary>
        /// <param name="disposing"></param>
        protected override void Dispose(bool disposing)
        {
            if (IsVerbose())
                Verbose($"Deleting {ConfigurationManager.DatabaseProvider} database instance ...");

            if (_lock != null)
            {
                _lock.Dispose();
                _lock = null;
            }

            base.Dispose(disposing);
        }

        #endregion

        #region Upgrading

        /// <summary>
        ///  check if a table exists into the database
        /// </summary>
        /// <param name="table"></param>
        /// <returns></returns>
        private bool? ExistTable(string table)
        {
            try
            {
                using (DbCommand sqlCommand = Database.Connection.CreateCommand())
                {
                    sqlCommand.CommandText = _provider.GetSQLExistTable(table);
                    sqlCommand.CommandType = System.Data.CommandType.Text;
                    using (DbDataReader select = sqlCommand.ExecuteReader())
                    {
                        return select.Read();
                    }
                }
            }
            catch (System.Exception ex)
            {
                Exception("Unable to check if a table exists", ex);
                return null;
            }
        }

        /// <summary>
        /// Check if an upgrade must be done
        /// </summary>
        /// <returns>true if the database is up to date</returns>
        public bool HasToUpgrade()
        {
            ParameterRecord parameter = null;

            Info("Checking upgrading the database schema ...");

            // Is the DS Model defined ?

            bool? existsParameter = ExistTable("_Parameter");
            if (existsParameter == null || !existsParameter.Value)
            {
                Logger.LoggerManager.Instance.Warn(Logger.LoggerManager.MODULE_NAME, "The DS Model is not defined");
                return true;
            }

            Logger.LoggerManager.Instance.Info(Logger.LoggerManager.MODULE_NAME, "The DS Model is defined");

            // Retrieve the last upgrading already done

            int lastUpgradingVersion = 0;

            parameter = _Parameter.SingleOrDefault(e => e.Key.Equals("Database.Version"));
            if (parameter != null && !String.IsNullOrWhiteSpace(parameter.Value) && !int.TryParse(parameter.Value, out lastUpgradingVersion))
                lastUpgradingVersion = 0;

            if (lastUpgradingVersion == 0)
            {
                Info("No database defined ... start the first upgrade");
                return true;
            }

            string lastUpgradingDate = string.Empty;
            parameter = _Parameter.SingleOrDefault(e => e.Key.Equals("Database.Update"));
            if (parameter != null)
                lastUpgradingDate = parameter.Value;

            Info($"The current database version '{lastUpgradingVersion:D4}' was set up at '{lastUpgradingDate}'");

            // Check if the version of the expected database is described into the configuration file

            try
            {
                Debug($"The domain is '{HttpRuntime.AppDomainAppPath}'");
            }
            catch (System.Exception)
            {
                // If an exception is raised, it means that this code is run over the web application (for example: in the job par of the application)

                if (lastUpgradingVersion != ConfigurationManager.DatabaseExpectedVersion)
                {
                    Warn($"The expected database version must be '{ConfigurationManager.DatabaseExpectedVersion:D4}' instead of '{lastUpgradingVersion:D4}'");
                    return true;
                }

                return false;
            }

            // Check if a script must be executed ...

            Regex pattern = new Regex(@"^(?<version>\d+)\-(?<year>\d+)\-(?<month>\d+)\-(?<day>\d+)-(?<label>.*)\.txt$");

            foreach (string sqlFilenameAndDirectory in Directory.GetFiles(Path.Combine(HttpRuntime.AppDomainAppPath, "Database", "Provider", _provider.Type.ToString(), "Script")))
            {
                // check if the filename mathes to the pattern expected

                string filename = Path.GetFileName(sqlFilenameAndDirectory);

                Match match = pattern.Match(filename);
                if (!match.Success)
                {
                    Warn($"The filename '{filename}' has no the correct format name ... ignore it!");
                    continue;
                }

                // check if the script must be run on depends on the last upgrading version

                int versionFile = int.Parse(match.Groups["version"].Value);
                if (versionFile <= lastUpgradingVersion)
                {
                    Info($"Script '{filename}' already done ...");
                    continue;
                }

                // load the sql file and replace all values from the settings

                Info("A upgrade must be applied ...");
                return true;
            }

            Info("No upgrade detected");

            return false;
        }

        /// <summary>
        /// Upgrade the current schema of the database towards the last one
        /// </summary>
        public void Upgrade()
        {
            ParameterRecord parameterVersion = null;
            ParameterRecord parameterUpdate = null;

            Info("Upgrading the database ...");

            int lastUpgradingVersion = 0;
            string lastUpgradingDate = string.Empty;

            // Is the DS Model defined ?

            bool? existsParameter = ExistTable("_Parameter");
            if (existsParameter != null && existsParameter.Value)
            {
                parameterVersion = _Parameter.SingleOrDefault(e => e.Key.Equals("Database.Version"));
                if (parameterVersion != null && !String.IsNullOrWhiteSpace(parameterVersion.Value) && !int.TryParse(parameterVersion.Value, out lastUpgradingVersion))
                    lastUpgradingVersion = 0;

                parameterUpdate = _Parameter.SingleOrDefault(e => e.Key.Equals("Database.Update"));
                if (parameterUpdate != null)
                    lastUpgradingDate = parameterUpdate.Value;

                if (String.IsNullOrWhiteSpace(lastUpgradingDate))
                    Info($"No database set up");
                else
                    Info($"The current database version '{lastUpgradingVersion:D4}' was set up at '{lastUpgradingDate}'");
            }
            else
                Info($"No database set up");

            // Retrieve the list of script to run

            Regex pattern = new Regex(@"^(?<version>\d+)\-(?<year>\d+)\-(?<month>\d+)\-(?<day>\d+)-(?<label>.*)\.txt$");
            Dictionary<int, string> scriptsToRun = new Dictionary<int, string>();

            foreach (string sqlFilenameAndDirectory in Directory.GetFiles(Path.Combine(HttpRuntime.AppDomainAppPath, "Database", "Provider", _provider.Type.ToString(), "Script")))
            {
                // check if the filename mathes to the pattern expected

                string filename = Path.GetFileName(sqlFilenameAndDirectory);

                Match match = pattern.Match(filename);
                if (!match.Success)
                {
                    Warn($"The filename '{filename}' has no the correct format name ... ignore it!");
                    continue;
                }

                // check if the script must be run on depends on the last upgrading version

                int version = int.Parse(match.Groups["version"].Value);
                if (version <= lastUpgradingVersion)
                {
                    Info($"Script '{filename}' already done ...");
                    continue;
                }

                if (scriptsToRun.ContainsKey(version))
                    throw new ExceptionParse($"The version ('{version}') of the script '{filename}' is defined twice!");

                // load the sql file and replace all values from the settings

                Info($"The script '{filename}' must be applied");

                scriptsToRun[version] = sqlFilenameAndDirectory;
            }

            // check if a script must be run

            if (scriptsToRun.Count == 0)
            {
                Info("Database already up-to-date");
                return;
            }

            // Executing the list of upgrade scripts ordered by the version number

            Dictionary<string, string> valuesToReplace = ConfigurationManager.Settings;
            List<int> versions = scriptsToRun.Keys.ToList();
            versions.Sort();

            foreach (int version in versions)
            {
                string filename = scriptsToRun[version];

                // load the sql file and replace all values from the settings

                Info($"Executing script '{filename}' ...");

                string sqlCommand = File.ReadAllText(filename);
                foreach (KeyValuePair<string, string> valueToReplace in valuesToReplace)
                    sqlCommand = sqlCommand.Replace($"${{{valueToReplace.Key}}}", valueToReplace.Value);

                if (!_provider.ExecuteScript(sqlCommand))
                    throw new ExceptionParse($"Unable to execute the script '{filename}', see the log file to have more details!");

                // update parameters

                lastUpgradingVersion = version;
                if (parameterVersion == null)
                    _Parameter.Add(new ParameterRecord() { Key = "Database.Version", Value = lastUpgradingVersion.ToString() });
                else
                    parameterVersion.Value = lastUpgradingVersion.ToString();

                lastUpgradingDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                if (parameterUpdate == null)
                    _Parameter.Add(new ParameterRecord() { Key = "Database.Update", Value = lastUpgradingDate });
                else
                    parameterUpdate.Value = lastUpgradingDate;

                SaveChanges();

                Info($"The database is successfully upgraded in version ({lastUpgradingVersion:D4}) - '{lastUpgradingDate}'");

                // retrieve the record after updating database

                if (parameterVersion == null)
                {
                    parameterVersion = _Parameter.SingleOrDefault(e => e.Key.Equals("Database.Version"));
                    parameterUpdate = _Parameter.SingleOrDefault(e => e.Key.Equals("Database.Update"));
                }
            }
        }

        #endregion

        #region Lock

        /// <summary>
        /// Lock the database for a customer
        /// </summary>
        /// <param name="customerId"></param>
        public DatabaseLock Lock(int customerId)
        {
            string lockKey = $"Database.Lock.{customerId}";

            // Create Database.Lock if the line doesn't exist

            ParameterRecord parameterRecord = _Parameter.FirstOrDefault(p => p.Key.Equals(lockKey));
            if (parameterRecord == null)
            {
                parameterRecord = new ParameterRecord() { Key = $"Database.Lock.{customerId}", Value = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") };
                parameterRecord = _Parameter.Add(parameterRecord);
                SaveChanges();
            }

            // Lock the database

            DbContextTransaction transaction = Database.BeginTransaction();

            switch (_provider.Type)
            {
                case Provider.Provider.EProvider.Oracle:
                    if (Database.Connection.State != System.Data.ConnectionState.Open)
                        Database.Connection.Open();
                    Database.ExecuteSqlCommand($"UPDATE \"_Parameter\" SET \"Value\" = '{DateTime.Now:yyyy-MM-dd HH:mm:ss}' where \"Key\" = 'Database.Lock.{customerId}'");
                    break;
                case Provider.Provider.EProvider.SQLServer:
                    if (Database.Connection.State != System.Data.ConnectionState.Open)
                        Database.Connection.Open();
                    Database.ExecuteSqlCommand($"UPDATE [{ConfigurationManager.DatabaseSchema}].[_Parameter] SET [Value] = '{DateTime.Now:yyyy-MM-dd HH:mm:ss}' where [Key] = 'Database.Lock.{customerId}'");
                    break;
                case Provider.Provider.EProvider.Firebird:
                    if (Database.Connection.State != System.Data.ConnectionState.Open)
                        Database.Connection.Open();
                    Database.ExecuteSqlCommand($"UPDATE \"_Parameter\" SET \"Value\" = '{DateTime.Now:yyyy-MM-dd HH:mm:ss}' where \"Key\" = 'Database.Lock.{customerId}'");
                    break;
                case Provider.Provider.EProvider.MySQL:
                    if (Database.Connection.State != System.Data.ConnectionState.Open)
                        Database.Connection.Open();
                    Database.ExecuteSqlCommand($"UPDATE `{ConfigurationManager.DatabaseSchema}`.`_Parameter` SET `Value` = '{DateTime.Now:yyyy-MM-dd HH:mm:ss}' where `Key` = 'Database.Lock.{customerId}'");
                    break;
                default:
                    Warn("Unable to lock the database due to an implementation of locking database missing!");
                    break;
            }

            _lock = new DatabaseLock(transaction);
            return _lock;
        }

        #endregion

        #region Handling Connection

        /// <summary>
        /// Remove all connection for the current machine
        /// </summary>
        public void CleanupConnection()
        {
            Info($"Cleaning up all connections lost since the last starting ...");
            List<ConnectionRecord> recordsToRemove = _Connection.Where(c => c.Machine.Equals(Environment.MachineName)).ToList();
            _Connection.RemoveRange(recordsToRemove);
            Info($"{recordsToRemove.Count} connections cleaned up");

            // Update database

            SaveChanges();
        }

        #endregion

        #region Handling Notifications

        /// <summary>
        /// Factory building a cache using to optimize the notification effect
        /// Virtual method (in sub class, define it the order of tables to notify)
        /// </summary>
        /// <param name="schema"></param>
        /// <returns></returns>
        virtual public DSCache GetCache(DSDatabase schema)
        {
            return new DSCache(schema);
        }

        /// <summary>
        /// Method called before starting the execution of the transaction
        /// </summary>
        /// <param name="cache"></param>
        /// <param name="userId"></param>
        /// <param name="table"></param>
        /// <param name="action"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        virtual public void PrepareRequest(DSCache cache, int userId, string table, string action, JObject record, JObject identity) { }

        /// <summary>
        /// Retrieve a list of tuple (DSRecord, Table) attached to a given record (table, id) for the given profile
        /// This function is used to retrieve a list of records attached to the current update
        /// Example :
        ///    The object A is not visible for the user Y
        ///    The user X updates the object A
        ///    The object A becomes visible for the user Y
        ///    In that case, object A must be added and notified to the user Y
        ///    This function builds this case
        /// </summary>
        /// <param name="cache"></param>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="profile"></param>
        /// <param name="area"></param>
        /// <param name="deepUpdate"></param>
        /// <param name="recordAlreadyRead"></param>
        /// <param name="informationAlreadyRead"></param>
        /// <returns></returns>
        virtual public void GetListRecordsConcernedByUpdate(DSCache cache,
                                                            string table,
                                                            int id,
                                                            int customerId,
                                                            int userId,
                                                            UserProfile.EUserProfile profile,
                                                            string area,
                                                            bool deepUpdate,
                                                            DSRecord recordAlreadyRead,
                                                            InformationRecord informationAlreadyRead)
        {
            if (id < 0 || profile != UserProfile.EUserProfile.None || cache.Is(table, id) != null)
                return;

            cache.Set(table, id, null);
        }

        #endregion

        #region Services

        /// <summary>
        /// Retrieve the next value of the key into the database
        /// </summary>
        /// <param name="customerId"></param>
        /// <param name="key"></param>
        /// <returns></returns>
        public int GetSequence(int customerId, string key)
        {
            if (key == "Tick" || key == "Lock")
                throw new ExceptionNotAuthorized("ERR_UNAUTHENTICATED");

            // Get the next value

            string parameterKey = $"Sequence.{key}.{customerId}";
            int currentValue = 1;
            ParameterRecord valueRecord = _Parameter.FirstOrDefault(p => p.Key.Equals(parameterKey));
            if (valueRecord == null)
            {
                valueRecord = new ParameterRecord { Key = parameterKey, Value = "1" };
                valueRecord = _Parameter.Add(valueRecord);
            }
            else
            {
                currentValue = int.Parse(valueRecord.Value) + 1;
                valueRecord.Value = currentValue.ToString();
            }
            SaveChanges();

            return currentValue;
        }

        /// <summary>
        /// Retrieve the next value of the key into the database
        /// </summary>
        /// <param name="customerId"></param>
        /// <param name="key"></param>
        /// <param name="length"></param>
        /// <returns></returns>
        public string GetSequenceKey(int customerId, string key, int length)
        {
            return key + GetSequence(customerId, key).ToString().PadLeft(length, '0');
        }

        /// <summary>
        /// Retrieve the next value of the key into the database
        /// </summary>
        /// <param name="customerId"></param>
        /// <param name="key"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        public int SetSequence(int customerId, string key, int value)
        {
            if (key == "Tick" || key == "Lock")
                throw new ExceptionNotAuthorized("ERR_UNAUTHENTICATED");

            // Get the next value

            string parameterKey = $"Sequence.{key}.{customerId}";
            int currentValue = 1;
            ParameterRecord valueRecord = _Parameter.FirstOrDefault(p => p.Key.Equals(parameterKey));
            if (valueRecord == null)
            {
                valueRecord = new ParameterRecord { Key = parameterKey, Value = value.ToString() };
                valueRecord = _Parameter.Add(valueRecord);
            }
            else
            {
                currentValue = int.Parse(valueRecord.Value);
                if ( currentValue < value )
                    valueRecord.Value = value.ToString();
            }
            SaveChanges();

            return currentValue;
        }

        /// <summary>
        /// Retrieve all images and credits
        /// </summary>
        /// <param name="lines"></param>
        /// <param name="folder"></param>
        private void ExecuteServiceCredits(JArray lines, string folder)
        {
            string creditFile = Path.Combine(folder, "credits.txt");

            // Retrieve the credits file

            if (File.Exists(creditFile))
            {
                // Read the file and all pictures

                Regex pattern = new Regex(@"^(?<image>.*) : (?<author>.*) \((?<link>.*)\).*$");
                string rootHttp = ConfigurationManager.ServerHttpRootImages;
                if (rootHttp.Length > 0)
                    rootHttp = rootHttp.Substring(0, rootHttp.Length - 1);
                rootHttp = (rootHttp + folder.Substring(ConfigurationManager.ServerFileRootImages.Length)).Replace('\\', '/');
                if (!rootHttp.EndsWith("/"))
                    rootHttp += "/";

                foreach (string image in File.ReadAllLines(creditFile))
                {
                    Match match = pattern.Match(image);
                    if (!match.Success)
                    {
                        this.Debug($"Image '{image}' doesn't match");
                        continue;
                    }

                    string filename = rootHttp + match.Groups["image"].Value;
                    string newLine = "<tr>" +
                                       "<td class='picture'><img src='"+ filename + "' /></td>" +
                                       "<td class='name'>" + match.Groups["image"].Value + "</td>" +
                                       "<td class='author'>" + 
                                         "<a href='" + match.Groups["link"].Value + "' title='" + match.Groups["author"].Value + "' target ='_blank'>" + match.Groups["author"].Value + "</a>" +
                                       "</td>" +
                                     "</tr>";
                    lines.Add(newLine);

                    // <div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
                }
            }

            // Retrieve the list of credits into a subfolder

            foreach (string subfolder in Directory.GetDirectories(folder))
                ExecuteServiceCredits(lines, subfolder);
        }

        /// <summary>
        /// Read the release notes and structure results
        /// </summary>
        /// <returns>JOBject containing the list of actions</returns>
        private JObject ExecuteServiceReleaseNotes()
        {
            try
            {
                JObject result = new JObject();
                JArray lines = new JArray();

                // Release-notes content
                // TODO : Add link towards GitHub on issue number

                foreach (string line in File.ReadAllLines(ConfigurationManager.ReleaseNotesFile))
                    lines.Add(line + "<br />");

                // Images credits

                lines.Add("<hr />");
                lines.Add("<div>From <a href='https://www.flaticon.com/' title='Flaticon' target='_blank'>www.flaticon.com</a> is licensed by " +
                          "<a href='http://creativecommons.org/licenses/by/3.0/' title='Creative Commons BY 3.0' target='_blank'>CC 3.0 BY</a></div>");
                lines.Add("<table><thead><tr><th class='picture'>Picture</th><th class='name'>Name</th><th class='author'>Icons made by</th></tr></thead><tbody>");
                ExecuteServiceCredits(lines, ConfigurationManager.ServerFileRootImages);
                lines.Add("</tbody></table>");

                result["lines"] = lines;

                return result;
            }
            catch (System.Exception ex)
            {
                Exception($"Unable to load the release-note files '{ConfigurationManager.ReleaseNotesFile}'", ex);
                return null;
            }
        }

        /// <summary>
        /// Retrieve the next value of the key into the database
        /// </summary>
        /// <param name="customerId"></param>
        /// <param name="key"></param>
        /// <returns></returns>
        private JObject ExecuteServiceSequence(int customerId, string key)
        {
            return new JObject { ["Value"] = GetSequence(customerId, key) };
        }

        /// <summary>
        /// Retrieve the next value of the key into the database
        /// </summary>
        /// <param name="customerId"></param>
        /// <param name="key"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        private JObject ExecuteServiceSetSequence(int customerId, string key, int value)
        {
            return new JObject { ["Value"] = SetSequence(customerId, key, value) };
        }

        /// <summary>
        /// Execute a service
        /// </summary>
        /// <param name="customerId"></param>
        /// <param name="userId"></param>
        /// <param name="profile"></param>
        /// <param name="area"></param>
        /// <param name="moduleId"></param>
        /// <param name="service"></param>
        /// <param name="record"></param>
        /// <param name="identity"></param>
        /// <returns>null if not currently treated or JObject with the result</returns>
        virtual public JObject ExecuteService(int customerId,
                                              int userId,
                                              UserProfile.EUserProfile profile,
                                              string area,
                                              int moduleId,
                                              string service,
                                              JObject record,
                                              JObject identity)
        {
            switch (service)
            {
                case "ReleaseNotes":
                    return ExecuteServiceReleaseNotes();

                case "Sequence":
                    if (record["Key"] != null &&
                        record["Key"].Type == JTokenType.String)
                        return ExecuteServiceSequence(customerId, record["Key"].ToObject<string>());

                    return new JObject { ["Value"] = 0 };

                case "SetSequence":
                    if (record["Key"] != null &&
                        record["Key"].Type == JTokenType.String)
                        return ExecuteServiceSetSequence(customerId, record["Key"].ToObject<string>(), record["Value"].ToObject<int>());

                    return new JObject { ["Value"] = 0 };
            }

            return null;
        }

        #endregion

        /// <summary>
        /// Check if a value already exists into a table of the database and if this value is still alive
        /// </summary>
        /// <param name="customerId"></param>
        /// <param name="table"></param>
        /// <param name="columnValue"></param>
        /// <param name="columnId"></param>
        /// <param name="caseSensitive"></param>
        /// <param name="value"></param>
        /// <param name="id"></param>
        /// <param name="fields"></param>
        /// <returns></returns>
        public bool ExistValue(int? customerId, string table, string columnValue, string columnId, bool caseSensitive, object value, int id, Dictionary<string, object> fields)
        {
            if (_provider == null)
                return false;

            return _provider.ExistValue(_lock.Transaction, customerId, table, columnValue, columnId, caseSensitive, value, id, fields);
        }

        /// <summary>
        /// Initialize the database access
        /// </summary>
        public DatabaseContext() : base(ConfigurationManager.CONNEXION_STRING)
        {
            if (IsVerbose())
                Verbose($"Creating a {ConfigurationManager.DatabaseProvider} database instance ...");

            System.Data.Entity.Database.SetInitializer<DatabaseContext>(null);

            if ((Database.Connection as OracleConnection) != null)
                _provider = new Provider.Oracle.Oracle(Database.Connection, ConfigurationManager.DatabaseSchema);

            if ((Database.Connection as SqlConnection) != null)
                _provider = new Provider.SQLServer.SQLServer(Database.Connection, ConfigurationManager.DatabaseSchema);

            if ((Database.Connection as FbConnection) != null)
                _provider = new Provider.Firebird.Firebird(Database.Connection, ConfigurationManager.DatabaseSchema);

            if ((Database.Connection as MySqlConnection) != null)
                _provider = new Provider.MySQL.MySQL(Database.Connection, ConfigurationManager.DatabaseSchema);
        }
    }
}