using System;
using System.IO;
using Microsoft.Azure.WebJobs;
using System.Threading;

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

namespace Syncytium.WebJob
{
    /// <summary>
    /// List of web jobs
    /// </summary>
    public class Jobs
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static string MODULE => typeof(Jobs).Name;

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private static bool IsVerbose() => Common.Logger.LoggerManager.Instance.IsVerbose;

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="message"></param>
        private static void Verbose(string message) => Common.Logger.LoggerManager.Instance.Verbose(MODULE, message);

        /// <summary>
        /// Indicates if the debug mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private static bool IsDebug() => Common.Logger.LoggerManager.Instance.IsDebug;

        /// <summary>
        /// Log a debug message
        /// </summary>
        /// <param name="message"></param>
        private static void Debug(string message) => Common.Logger.LoggerManager.Instance.Debug(MODULE, message);

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        private static void Info(string message) => Common.Logger.LoggerManager.Instance.Info(MODULE, message);

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        private static void Warn(string message) => Common.Logger.LoggerManager.Instance.Warn(MODULE, message);

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        private static void Error(string message) => Common.Logger.LoggerManager.Instance.Error(MODULE, message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        private static void Exception(string message, System.Exception ex) => Common.Logger.LoggerManager.Instance.Exception(MODULE, message, ex);

        #endregion

        private static SemaphoreSlim _mutex = new SemaphoreSlim(1);

        /// <summary>
        /// Manual launch a web job to test the email sending
        /// </summary>
        /// <param name="log"></param>
        [NoAutomaticTrigger]
        public static void TestEmail(TextWriter log)
        {
            _mutex.Wait(); // lock critical section

            Common.Logger.LoggerManager.Instance.Open(log);
            Info("Test mailing firing ...");

            try
            {
                (new Syncytium.WebJob.Module.Test.Job()).Run();
            }
            catch (System.Exception ex)
            {
                Exception("An exception occurs during executing test emailing", ex);
            }

            Info("End of test mailing");
            Common.Logger.LoggerManager.Instance.Close();

            _mutex.Release(); // unlock critical section
        }
    }
}
