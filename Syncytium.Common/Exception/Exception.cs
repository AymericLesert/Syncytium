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

namespace Syncytium.Common.Exception
{
    /// <summary>
    /// This exception is the parent of all given exceptions done by this application
    /// </summary>
    [Serializable]
    public class Exception : System.Exception
    {
        /// <summary>
        /// Empty constructor
        /// </summary>
        public Exception() : base() { }

        /// <summary>
        /// Constructor within a message
        /// </summary>
        /// <param name="message"></param>
        public Exception(string message) : base(message) { }

        /// <summary>
        /// Constructor within a message and it inner exception
        /// </summary>
        /// <param name="message"></param>
        /// <param name="inner"></param>
        public Exception(string message, System.Exception inner) : base(message, inner) { }
    }
}