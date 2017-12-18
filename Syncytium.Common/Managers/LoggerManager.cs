using System;
using System.Threading;
using Syncytium.Common.Managers;
using log4net;
using log4net.Appender;
using log4net.Repository.Hierarchy;
using System.Linq;
using System.IO;
using System.Text.RegularExpressions;
using System.Collections.Generic;

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

namespace Syncytium.Common.Logger
{
    /// <summary>
    /// Singleton describing the logger context and save trace into some logger (using log4net)
    /// </summary>
    public sealed class LoggerManager : ILogger, IDisposable
    {
        /// <summary>
        /// Different level of logger
        /// </summary>
        enum Level : ushort { Verbose='V', Debug='D', Info='I', Warn='W', Error='E' };

        /// <summary>
        /// Module name used into the logger
        /// </summary>
        public static string MODULE_NAME = "Syncytium";

        /// <summary>
        /// log4net instance
        /// </summary>
        readonly log4net.ILog logger = log4net.LogManager.GetLogger(MODULE_NAME);

        /// <summary>
        /// True if verbose trace must be enabled
        /// </summary>
        private Boolean _logVerbose = false;

        /// <summary>
        /// True if debug trace must be added
        /// </summary>
        private Boolean _logDebug = false;

        /// <summary>
        /// Notify the logger if it's initialized
        /// </summary>
        private Boolean _logInitialized = false;

        /// <summary>
        /// List of text writer appended
        /// </summary>
        private Stack<TextWriter> _logFiles = new Stack<TextWriter>();

        /// <summary>
        /// Mutex protecting the critical section
        /// </summary>
        private SemaphoreSlim _mutex = null;

        /// <summary>
        /// Store the timestamp of the last clean up log files
        /// </summary>
        private DateTime _lastCleanUp;

        /// <summary>
        /// Notify the possibility to clean up the log file
        /// </summary>
        private bool _cleanUpAvailable = true;

        /// <summary>
        /// Instance of the current logger
        /// </summary>
        private static LoggerManager _instance;

        #region IDisposable

        /// <summary>
        /// Dispose this instance
        /// </summary>
        public void Dispose()
        {
            if (_mutex != null)
                _mutex.Dispose();
            _mutex = null;
        }

        #endregion

        /// <summary>
        /// Constructor of the logger
        /// </summary>
        private LoggerManager()
        {
            _logDebug = false;
            _logInitialized = false;
            _lastCleanUp = DateTime.Now;
            _cleanUpAvailable = true;
            _mutex = new SemaphoreSlim(1);
        }

        /// <summary>
        /// Initialize logger
        /// </summary>
        public void Initialize()
        {
            if (_logInitialized)
                return;
            _logInitialized = true;

            try
            {
                WriteMessage(Level.Info, MODULE_NAME, "-------------------------------------------------------------------");
                WriteMessage(Level.Info, MODULE_NAME, "Application: " + ConfigurationManager.ApplicationName);
                WriteMessage(Level.Info, MODULE_NAME, "Version    : " + ConfigurationManager.ApplicationVersion.ToString());
                WriteMessage(Level.Info, MODULE_NAME, "Company    : " + ConfigurationManager.ApplicationCompany);
                WriteMessage(Level.Info, MODULE_NAME, "Copyright  : " + ConfigurationManager.ApplicationCopyright);
                WriteMessage(Level.Info, MODULE_NAME, "-------------------------------------------------------------------");
                WriteMessage(Level.Info, MODULE_NAME, "Initializing ...");

                IsDebug = ConfigurationManager.Debug;
                IsVerbose = ConfigurationManager.Verbose;

                CleanUpLogFiles(true);
            }
            catch
            {
                // impossible to trace the exception due to no log available
            }
        }

        /// <summary>
        /// Get or Set the verbose flag
        /// </summary>
        public Boolean IsVerbose
        {
            get { return _logVerbose; }
            set
            {
                if (_logVerbose != value)
                {
                    _mutex.Wait(); // lock critical section

                    if (value)
                        WriteMessage(Level.Info, typeof(LoggerManager).Name, "Enable verbose mode");
                    else
                        WriteMessage(Level.Info, typeof(LoggerManager).Name, "Disable verbose mode");

                    _mutex.Release(); // unlock critical section
                }

                CleanUpLogFiles();
                _logVerbose = value;
            }
        }

        /// <summary>
        /// Get or Set the debug flag
        /// </summary>
        public Boolean IsDebug
        {
            get { return _logVerbose || _logDebug; }
            set
            {
                if (_logDebug != value)
                {
                    _mutex.Wait(); // lock critical section

                    if (value)
                        WriteMessage(Level.Info, typeof(LoggerManager).Name, "Enable debug mode");
                    else
                        WriteMessage(Level.Info, typeof(LoggerManager).Name, "Disable debug mode");

                    CleanUpLogFiles();
                    _mutex.Release(); // unlock critical section
                }

                _logDebug = value;
            }
        }

        /// <summary>
        /// Add a new line into the logger
        /// </summary>
        /// <param name="level">"D"ebug, "I"nfo, "W"arning, "E"rror</param>
        /// <param name="module">module name of the current message</param>
        /// <param name="message">message to add into the log file</param>
        private void WriteMessage(Level level, string module, string message)
        {
            string newLine = module.PadRight(25, ' ') + " : " + (level == Level.Debug ? "(D) " : (level == Level.Verbose ? "(V) " : "")) + message;

            switch (level)
            {
                case Level.Verbose:
                case Level.Debug:
                case Level.Info:
                    logger.Info(newLine);
                    break;

                case Level.Warn:
                    logger.Warn(newLine);
                    break;

                case Level.Error:
                    logger.Error(newLine);
                    break;
            }

            foreach(TextWriter log in _logFiles)
                log.WriteLine(newLine);
        }

        /// <summary>
        /// Remove the oldest log files if it exceeds the max number of log days
        /// </summary>
        /// <param name="force">true if the clean up log file must be done even if the date is not ok</param>
        private void CleanUpLogFiles(bool force = false)
        {
            DateTime currentTime = DateTime.Now;

            // check automatically if the log file must be removed or not

            if (!force &&
                currentTime.Year == _lastCleanUp.Year &&
                currentTime.Month == _lastCleanUp.Month &&
                currentTime.Day == _lastCleanUp.Day)
                return;

            _lastCleanUp = currentTime;

            // start the clean up process

            if (!_cleanUpAvailable)
                return;

            int maxDays = -1;
            try { maxDays = ConfigurationManager.LoggerMaxDays; } catch { }

            if (maxDays <= 0)
            {
                WriteMessage(Level.Info, MODULE_NAME, "Disable the cleaning up log files");
                _cleanUpAvailable = false;
                return;
            }

            WriteMessage(Level.Info, MODULE_NAME, $"Cleaning up log files older than {maxDays} days ...");

            // retrieve the log file name within the date

            RollingFileAppender rootAppender = ((Hierarchy)LogManager.GetRepository())
                                                .Root.Appenders.OfType<RollingFileAppender>()
                                                .FirstOrDefault();

            if (rootAppender == null)
            {
                WriteMessage(Level.Warn, MODULE_NAME, "No rolling file appender defined in the section Log4Net (Check web.config)");
                _cleanUpAvailable = false;
                return;
            }

            string currentLogFilename = rootAppender.File;

            if (_logDebug)
                WriteMessage(Level.Debug, MODULE_NAME, $"Current log file is '{currentLogFilename}'");

            // Retrieve the list of files included into the log folder

            Regex pattern = new Regex(@"^Syncytium.*\-(?<year>\d+)\-(?<month>\d+)\-(?<day>\d+)(|\.\d+)\.log$");

            List<string> filenameToRemove = new List<string>();

            foreach (string filenameAndPath in Directory.GetFiles(Path.GetDirectoryName(currentLogFilename)))
            {
                // ignore the current log file

                if (currentLogFilename.Equals(filenameAndPath))
                {
                    WriteMessage(Level.Debug, MODULE_NAME, $"Ignore the file '{filenameAndPath}'");
                    continue;
                }

                // check if the filename mathes to the pattern expected

                string filename = Path.GetFileName(filenameAndPath);

                Match match = pattern.Match(filename);
                if (!match.Success)
                {
                    WriteMessage(Level.Debug, MODULE_NAME, $"Filename '{filename}' doesn't match");
                    continue;
                }

                // check if the log file is too old

                try
                {
                    DateTime logDate = new DateTime(int.Parse(match.Groups["year"].Value),
                                                    int.Parse(match.Groups["month"].Value),
                                                    int.Parse(match.Groups["day"].Value));

                    if ((currentTime - logDate).TotalDays <= maxDays)
                    {
                        WriteMessage(Level.Debug, MODULE_NAME, $"The filename '{filename}' is not too old");
                        continue;
                    }

                    filenameToRemove.Add(filenameAndPath);
                }
                catch (System.Exception)
                {
                    WriteMessage(Level.Debug, MODULE_NAME, $"The date into the filename '{filename}' is incorrect ...");
                }
            }

            // remove all files too old

            foreach (string filename in filenameToRemove)
            {
                WriteMessage(Level.Info, MODULE_NAME, $"Deleting '{filename}' ...");
                try
                {
                    File.Delete(filename);
                }
                catch(System.Exception ex)
                {
                    WriteMessage(Level.Error, MODULE_NAME, $"Unable to delete the file due to {ex.Message}");
                }
            }

            WriteMessage(Level.Info, MODULE_NAME, $"{filenameToRemove.Count} log files cleaned up");
        }

        /// <summary>
        /// Add a new verbose message into the current file
        /// </summary>
        /// <param name="module"></param>
        /// <param name="message"></param>
        public void Verbose(string module, string message)
        {
            if (!_logVerbose)
                return;

            _mutex.Wait(); // lock critical section

            WriteMessage(Level.Verbose, module, message);
            CleanUpLogFiles();

            _mutex.Release(); // unlock critical section
        }

        /// <summary>
        /// Add a new debug message into the current file
        /// </summary>
        /// <param name="module"></param>
        /// <param name="message"></param>
        public void Debug(string module, string message)
        {
            if (!_logDebug)
                return;

            _mutex.Wait(); // lock critical section

            WriteMessage(Level.Debug, module, message);
            CleanUpLogFiles();

            _mutex.Release(); // unlock critical section
        }

        /// <summary>
        /// Add a new info message into the current file
        /// </summary>
        /// <param name="module"></param>
        /// <param name="message"></param>
        public void Info(string module, string message)
        {
            _mutex.Wait(); // lock critical section

            WriteMessage(Level.Info, module, message);
            CleanUpLogFiles();

            _mutex.Release(); // unlock critical section
        }

        /// <summary>
        /// Add a new warn message into the current file
        /// </summary>
        /// <param name="module"></param>
        /// <param name="message"></param>
        public void Warn(string module, string message)
        {
            _mutex.Wait(); // lock critical section

            WriteMessage(Level.Warn, module, message);
            CleanUpLogFiles();

            _mutex.Release(); // unlock critical section
        }

        /// <summary>
        /// Add a new error message into the current file
        /// </summary>
        /// <param name="module"></param>
        /// <param name="message"></param>
        public void Error(string module, string message)
        {
            _mutex.Wait(); // lock critical section

            WriteMessage(Level.Error, module, message);
            CleanUpLogFiles();

            _mutex.Release(); // unlock critical section
        }

        /// <summary>
        /// Write the content of an exception in the log file!
        /// </summary>
        /// <param name="module"></param>
        /// <param name="message"></param>
        /// <param name="exception"></param>
        public void Exception(string module, string message, System.Exception exception)
        {
            _mutex.Wait(); // lock critical section

            string exceptionMessage = message + " : " + exception.Message + "\n";
            exceptionMessage += exception.ToString() + "\n";
            exceptionMessage += "HelpLink : " + exception.HelpLink + "\n";
            exceptionMessage += "Source : " + exception.Source;

            string[] lines = exceptionMessage.Split('\n');
            foreach (string line in lines)
            {
                string newLine = line;

                if (newLine.Length > 0 && newLine[newLine.Length - 1] < 32)
                    newLine = line.Remove(newLine.Length - 1);

                if (!newLine.Equals(""))
                    WriteMessage(Level.Error, module, newLine);
            }

            CleanUpLogFiles();
            _mutex.Release(); // unlock critical section
        }

        /// <summary>
        /// Add a new text writer log into the application
        /// </summary>
        /// <param name="appendLog"></param>
        public void Open(TextWriter appendLog)
        {
            _logFiles.Push(appendLog);
        }

        /// <summary>
        /// Remove the text writter appended with Open()
        /// </summary>
        public void Close()
        {
            if (_logFiles.Count > 0)
                _logFiles.Pop();
        }

        /// <summary>
        /// Remove the oldest log files if it exceeds the max number of log days
        /// </summary>
        public void CleanUp()
        {
            _mutex.Wait(); // lock critical section

            CleanUpLogFiles();

            _mutex.Release(); // unlock critical section
        }

        /// <summary>
        /// Close the main file and the current analysis
        /// </summary>
        public void Terminate()
        {
            if (!_logInitialized)
                return;

            Info(MODULE_NAME, "End of the application");
            _logInitialized = false;
        }

        /// <summary>
        /// Retrieve the current instance or define a new instanceof logger
        /// </summary>
        public static LoggerManager Instance
        {
            get
            {
                if (_instance == null)
                    _instance = new LoggerManager();

                return _instance;
            }
        }
    }
}
