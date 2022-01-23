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

namespace Syncytium.Core.Common.Server.Database.DSAnnotation.DSFormat
{
    /// <summary>
    /// Class identifying the field as a date time
    /// </summary>
    public class DSFileAttribute : DSFormatAttribute
    {
        /// <summary>
        /// Annotation type
        /// </summary>
        public override string Type => "File";

        /// <summary>
        /// Convert a string having the given format into a array of bytes
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public override object? ConvertFromJSON(object? value)
        {
            if (value == null)
                return null;

            if (value.GetType() != typeof(string))
                return value;

            string str = (value as string) ?? String.Empty;
            byte[] bytes = new byte[str.Length * sizeof(char)];
            Buffer.BlockCopy(str.ToCharArray(), 0, bytes, 0, bytes.Length);
            return bytes;
        }

        /// <summary>
        /// Convert the value of an attribute to a string
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public override object? ConvertToJSON(object? value)
        {
            if (value == null)
                return null;

            if (value.GetType() != typeof(byte[]))
                return value;

            byte[] binary = (byte[])value;
            char[] chars = new char[binary.Length / sizeof(char)];
            Buffer.BlockCopy(binary, 0, chars, 0, binary.Length);
            return new string(chars);
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public DSFileAttribute() : base() { }
    }
}
