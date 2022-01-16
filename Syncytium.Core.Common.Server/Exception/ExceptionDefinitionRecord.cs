using Syncytium.Core.Common.Server.Error;
using System.Runtime.Serialization;
using System.Security.Permissions;

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

namespace Syncytium.Core.Common.Server.Exception
{
    /// <summary>
    /// This exception is raised when a record for the database contains some errors
    /// </summary>
    [Serializable]
    public class ExceptionDefinitionRecord : Exception
    {
        /// <summary>
        /// Retrieve the list of errors identified into the definition of the record
        /// </summary>
        public Errors Errors { get; }

        /// <summary>
        /// Implemented to SerializableAttribute
        /// </summary>
        /// <param name="info"></param>
        /// <param name="context"></param>
        public override void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            if (info == null)
                throw new ArgumentNullException("info");

            base.GetObjectData(info, context);
        }

        /// <summary>
        /// Empty constructor
        /// </summary>
        public ExceptionDefinitionRecord() : base()
        {
            Errors = new Errors();
        }

        /// <summary>
        /// Constructor within a message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="parameters"></param>
        public ExceptionDefinitionRecord(string message, params object[] parameters) : base(message)
        {
            Errors = new Errors();
            Errors.AddGlobal(message, parameters);
        }

        /// <summary>
        /// Constructor within a message and a list of errors
        /// </summary>
        /// <param name="message"></param>
        /// <param name="listOfErrors"></param>
        public ExceptionDefinitionRecord(string message, Errors listOfErrors) : base(message)
        {
            Errors = listOfErrors;
        }

        /// <summary>
        /// Constructor within a message and it inner exception
        /// </summary>
        /// <param name="message"></param>
        /// <param name="inner"></param>
        public ExceptionDefinitionRecord(string message, System.Exception? inner) : base(message, inner)
        {
            Errors = new Errors();
        }
    }
}