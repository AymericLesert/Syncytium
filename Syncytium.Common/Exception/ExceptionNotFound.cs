﻿using System;

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
    /// This exception is raised when an element doesn't exist into a collection
    /// </summary>
    [Serializable]
    public class ExceptionNotFound : Exception
    {
        /// <summary>
        /// Empty constructor
        /// </summary>
        public ExceptionNotFound() : base() { }

        /// <summary>
        /// Constructor within a message
        /// </summary>
        /// <param name="message"></param>
        public ExceptionNotFound(string message) : base(message) { }

        /// <summary>
        /// Constructor within a message and it inner exception
        /// </summary>
        /// <param name="message"></param>
        /// <param name="inner"></param>
        public ExceptionNotFound(string message, System.Exception inner) : base(message, inner) { }
    }
}