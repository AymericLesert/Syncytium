using System;
using System.IO;

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

namespace Syncytium.Common.Managers
{
    /// <summary>
    /// This class interfaces the logger manager
    /// </summary>
    public interface ILogger
    {
        /// <summary>
        /// Indicates if the all verbose mode is enabled or not
        /// </summary>
        Boolean IsVerboseAll { get; }

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        Boolean IsVerbose { get; }

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="module"></param>
        /// <param name="message"></param>
        void Verbose(string module, string message);

        /// <summary>
        /// Get or Set the debug flag
        /// </summary>
        Boolean IsDebug { get; }

        /// <summary>
        /// Add a new debug message into the current file
        /// </summary>
        /// <param name="module"></param>
        /// <param name="message"></param>
        void Debug(string module, string message);

        /// <summary>
        /// Add a new info message into the current file
        /// </summary>
        /// <param name="module"></param>
        /// <param name="message"></param>
        void Info(string module, string message);

        /// <summary>
        /// Add a new warn message into the current file
        /// </summary>
        /// <param name="module"></param>
        /// <param name="message"></param>
        void Warn(string module, string message);

        /// <summary>
        /// Add a new error message into the current file
        /// </summary>
        /// <param name="module"></param>
        /// <param name="message"></param>
        void Error(string module, string message);

        /// <summary>
        /// Write the content of an exception in the log file!
        /// </summary>
        /// <param name="module"></param>
        /// <param name="message"></param>
        /// <param name="exception"></param>
        void Exception(string module, string message, System.Exception exception);

        /// <summary>
        /// Add a new text writer log into the application
        /// </summary>
        /// <param name="appendLog"></param>
        void Open(TextWriter appendLog);

        /// <summary>
        /// Remove the text writter appended with Open()
        /// </summary>
        void Close();
    }
}
