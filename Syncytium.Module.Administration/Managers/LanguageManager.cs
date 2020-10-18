using Syncytium.Common.Database;
using Syncytium.Common.Database.DSModel;
using Syncytium.Module.Administration.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

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

namespace Syncytium.Module.Administration.Managers
{
    /// <summary>
    /// This singleton stores all labels on depends on the customer
    /// Handle the loading labels in case of modifications
    /// </summary>
    public sealed class LanguageManager : IDisposable
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static readonly string MODULE = typeof(LanguageManager).Name;

        /// <summary>
        /// Indicates if the all verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsVerboseAll() => Common.Logger.LoggerManager.Instance.IsVerboseAll;

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsVerbose() => Common.Logger.LoggerManager.Instance.IsVerbose;

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="message"></param>
        private void Verbose(string message) => Common.Logger.LoggerManager.Instance.Verbose(MODULE, message);

        /// <summary>
        /// Indicates if the debug mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsDebug() => Common.Logger.LoggerManager.Instance.IsDebug;

        /// <summary>
        /// Log a debug message
        /// </summary>
        /// <param name="message"></param>
        private void Debug(string message) => Common.Logger.LoggerManager.Instance.Debug(MODULE, message);

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        private void Info(string message) => Common.Logger.LoggerManager.Instance.Info(MODULE, message);

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        private void Warn(string message) => Common.Logger.LoggerManager.Instance.Warn(MODULE, message);

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        private void Error(string message) => Common.Logger.LoggerManager.Instance.Error(MODULE, message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        private void Exception(string message, Exception ex) => Common.Logger.LoggerManager.Instance.Exception(MODULE, message, ex);

        #endregion

        /// <summary>
        /// Instance of the current language manager
        /// </summary>
        private static LanguageManager _instance;

        /// <summary>
        /// Last tick of the update of the labels
        /// </summary>
        private readonly Dictionary<int, int> _lastUpdate = null;

        /// <summary>
        /// List of labels loaded
        /// </summary>
        private Dictionary<int, List<LanguageRecord>> _labels = null;

        /// <summary>
        /// Mutex protecting the critical section
        /// </summary>
        private SemaphoreSlim _mutex = null;

        /// <summary>
        /// Load all labels if it's necessary
        /// </summary>
        /// <param name="database"></param>
        /// <param name="customerId"></param>
        private void Load(DatabaseContext database, int? customerId)
        {
            int lastUpdate = 0;

            _mutex.Wait(); // lock critical section

            if (customerId == null)
            {
                // Load all tickId for each customer or create it if it doesn't exist

                foreach (CustomerRecord customer in database.Customer.ToList())
                {
                    int tick = 0;

                    // Retrieve the tick of the database

                    string tickKey = $"Database.Tick.{customer.Id}";
                    ParameterRecord parameter = database._Parameter.FirstOrDefault(e => e.Key.Equals(tickKey));
                    if (parameter != null)
                        int.TryParse(parameter.Value, out tick);

                    // Update or retrieve the tick of the language

                    tickKey = $"Language.Tick.{customer.Id}";
                    parameter = database._Parameter.FirstOrDefault(e => e.Key.Equals(tickKey));
                    if (parameter == null)
                        database._Parameter.Add(new ParameterRecord() { Key = tickKey, Value = tick.ToString() });
                    else
                        parameter.Value = tick.ToString();

                    _lastUpdate[customer.Id] = tick;
                }

                database.SaveChanges();
            }
            else
            {
                string tickKey = $"Language.Tick.{customerId.Value}";
                ParameterRecord parameter = database._Parameter.SingleOrDefault(e => e.Key.Equals(tickKey));

                if (parameter == null)
                    Warn($"Please, create the parameter '{tickKey}' into the database to avoid loading labels every time!");

                if (parameter != null && !String.IsNullOrWhiteSpace(parameter.Value) && !int.TryParse(parameter.Value, out lastUpdate))
                    lastUpdate = 0;

                if (parameter != null && _lastUpdate.ContainsKey(customerId.Value) && lastUpdate == _lastUpdate[customerId.Value] && lastUpdate >= 0)
                {
                    // no changes ...
                    _mutex.Release(); // unlock critical section
                    return;
                }

                // Update the language tick

                if (parameter != null && lastUpdate < 0 )
                {
                    string dbTickKey = $"Database.Tick.{customerId.Value}";
                    ParameterRecord parameterTick = database._Parameter.FirstOrDefault(e => e.Key.Equals(dbTickKey));
                    if (parameterTick != null)
                    {
                        parameter.Value = parameterTick.Value;
                        database.SaveChanges();
                    }
                }
            }

            if (customerId == null)
            {
                Info("Loading all labels ...");

                try
                {
                    int i = 0;
                    Dictionary<int, List<LanguageRecord>> newLabels = new Dictionary<int, List<LanguageRecord>>();

                    foreach (LanguageRecord label in database.Language.ToList())
                    {
                        if (!newLabels.ContainsKey(label.CustomerId))
                            newLabels[label.CustomerId] = new List<LanguageRecord>();

                        newLabels[label.CustomerId].Add(DSRecord.Copy(label) as LanguageRecord);

                        if (IsDebug() && customerId == null && label.CustomerId == 1)
                            Debug($"{label.Key.Trim()} = {label}");

                        i++;
                    }

                    Info($"{i} labels loaded");

                    _labels = newLabels;
                }
                catch (Exception ex)
                {
                    Exception("Unable to load all labels", ex);
                }
            }
            else
            {
                Info($"Loading labels because they recently change ('{lastUpdate}') for the customer '{customerId.Value}' ...");

                try
                {
                    int i = 0;
                    List<LanguageRecord> newLabels = new List<LanguageRecord>();

                    foreach (LanguageRecord label in database.Language.Where(l => l.CustomerId == customerId.Value).ToList())
                    {
                        newLabels.Add(DSRecord.Copy(label) as LanguageRecord);
                        i++;
                    }

                    Info($"{i} labels loaded");

                    _labels[customerId.Value] = newLabels;
                    _lastUpdate[customerId.Value] = lastUpdate;
                }
                catch (Exception ex)
                {
                    Exception($"Unable to load labels for the customer '{customerId.Value}'", ex);
                }
            }

            _mutex.Release(); // unlock critical section

            if ( customerId != null )
                DatabaseCacheManager.Instance.Reload(database, customerId.Value, "Language");

            return;
        }

        /// <summary>
        /// Dispose the language manager
        /// </summary>
        public void Dispose()
        {
            if (_mutex != null)
                _mutex.Dispose();
            _mutex = null;
        }

        /// <summary>
        /// Retrieve the list of labels attached to the customer
        /// </summary>
        /// <param name="customerId"></param>
        /// <returns></returns>
        public List<LanguageRecord> GetLabels(int customerId)
        {
            List<LanguageRecord> currentLabels;

            _mutex.Wait(); // lock critical section

            if (!_labels.ContainsKey(customerId))
                currentLabels = new List<LanguageRecord>();
            else
                currentLabels = _labels[customerId];

            _mutex.Release(); // unlock critical section

            return currentLabels;
        }

        /// <summary>
        /// Constructor of the language manager
        /// </summary>
        private LanguageManager()
        {
            _lastUpdate = new Dictionary<int, int>();
            _labels = new Dictionary<int, List<LanguageRecord>>();
            _mutex = new SemaphoreSlim(1);
        }

        /// <summary>
        /// Retrieve the current instance or define a new instanceof logger
        /// </summary>
        /// <param name="database"></param>
        /// <param name="customerId"></param>
        public static LanguageManager GetInstance(DatabaseContext database, int customerId)
        {
            if (_instance == null)
                _instance = new LanguageManager();

            _instance.Load(database, customerId);

            return _instance;
        }

        /// <summary>
        /// Retrieve the current instance or define a new instanceof logger
        /// </summary>
        /// <param name="database"></param>
        public static LanguageManager GetInstance(DatabaseContext database)
        {
            if (_instance == null)
                _instance = new LanguageManager();

            _instance.Load(database, null);

            return _instance;
        }
    }
}
