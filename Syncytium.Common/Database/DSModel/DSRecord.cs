using Syncytium.Common.Database.DSAnnotation;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Reflection;

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

namespace Syncytium.Common.Database.DSModel
{
    /// <summary>
    /// Master class of the record description
    /// </summary>
    public class DSRecord
    {
        /// <summary>
        /// Id of the record
        /// </summary>
        [DSName("ID")]
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; } = -1;

        /// <summary>
        /// Last tick updated
        /// </summary>
        [NotMapped]
        public int _tick { get; set; } = 0;

        /// <summary>
        /// Indicates if the record is deleted or not
        /// </summary>
        [NotMapped]
        public bool _deleted { get; set; } = false;

        /// <summary>
        /// Retrieve the string of a factory
        /// </summary>
        /// <returns></returns>
        public override string ToString() => JsonConvert.SerializeObject(this);

        /// <summary>
        /// Get a JSON object of the record
        /// </summary>
        /// <returns></returns>
        public JObject ToJSON() => JObject.Parse(JsonConvert.SerializeObject(this));

        #region Equals

        /// <summary>
        /// Must be declared within overriding Equals
        /// </summary>
        /// <returns></returns>
        public override int GetHashCode()
        {
            return base.GetHashCode();
        }

        /// <summary>
        /// Check if 2 records are equals
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public override bool Equals(object obj)
        {
            if (obj == null)
                return false;

            if (GetType() != obj.GetType())
                return false;

            foreach (PropertyInfo property in GetType().GetProperties())
            {
                if (!property.CanWrite)
                    continue;

                object value1 = property.GetValue(this);
                object value2 = property.GetValue(obj);

                if (property.PropertyType == typeof(string))
                {
                    if (value1 == null && value2 == null)
                        continue;

                    if (value1 != null && value2 == null && !value1.Equals(""))
                        return false;

                    if (value1 == null && value2 != null && !value2.Equals(""))
                        return false;

                    if (value1 != null && value2 != null && !value1.Equals(value2))
                        return false;
                }
                else
                {
                    if (value1 == null && value2 == null)
                        continue;

                    if (value1 != null && value2 == null)
                        return false;

                    if (value1 == null && value2 != null)
                        return false;

                    if (property.PropertyType == typeof(byte[]) && !(value1 as byte[]).SequenceEqual(value2 as byte[]))
                        return false;

                    if (property.PropertyType != typeof(byte[]) && !value1.Equals(value2))
                        return false;
                }
            }

            return true;
        }

        /// <summary>
        /// Put in the log file the fields different between 2 records
        /// </summary>
        /// <param name="obj"></param>
        public void LogDifferences(object obj)
        {
            if (obj == null)
            {
                Logger.LoggerManager.Instance.Debug("DSRecord", "<obj> is null");
                return;
            }

            if (GetType() != obj.GetType())
            {
                Logger.LoggerManager.Instance.Debug("DSRecord", $"The element '{GetType().Name}' doesn't match within '{obj.GetType().Name}'!");
                return;
            }

            Logger.LoggerManager.Instance.Debug("DSRecord", $"Record1 is {this}");
            Logger.LoggerManager.Instance.Debug("DSRecord", $"Record2 is {obj}");

            foreach (PropertyInfo property in GetType().GetProperties())
            {
                if (!property.CanWrite)
                    continue;

                object value1 = property.GetValue(this);
                object value2 = property.GetValue(obj);

                if (property.PropertyType == typeof(string))
                {
                    if (value1 == null && value2 == null)
                        continue;

                    if (value1 != null && value2 == null && !value1.Equals(""))
                    {
                        Logger.LoggerManager.Instance.Debug("DSRecord", $"The field '{property.Name}' with the value '{value1}' doesn't match with the value 'null'!");
                        continue;
                    }

                    if (value1 == null && value2 != null && !value2.Equals(""))
                    {
                        Logger.LoggerManager.Instance.Debug("DSRecord", $"The field '{property.Name}' with the value 'null' doesn't match with the value '{value2}'!");
                        continue;
                    }

                    if (value1 != null && value2 != null && !value1.Equals(value2))
                    {
                        Logger.LoggerManager.Instance.Debug("DSRecord", $"The field '{property.Name}' with the value '{value1}' doesn't match with the value '{value2}'!");
                        continue;
                    }
                }
                else
                {
                    if (value1 == null && value2 == null)
                        continue;

                    if (value1 != null && value2 == null)
                    {
                        Logger.LoggerManager.Instance.Debug("DSRecord", $"The field '{property.Name}' is defined for the record not for <obj>!");
                        continue;
                    }

                    if (value1 == null && value2 != null)
                    {
                        Logger.LoggerManager.Instance.Debug("DSRecord", $"The field '{property.Name}' is undefined for the record not for <obj>!");
                        continue;
                    }

                    if (property.PropertyType == typeof(byte[]) && !(value1 as byte[]).SequenceEqual(value2 as byte[]))
                    {
                        Logger.LoggerManager.Instance.Debug("DSRecord", $"The field '{property.Name}' which it's an array of byte is different!");
                        continue;
                    }

                    if (property.PropertyType != typeof(byte[]) && !value1.Equals(value2))
                    {
                        Logger.LoggerManager.Instance.Debug("DSRecord", $"The field '{property.Name}' are 2 different values!");
                        continue;
                    }
                }
            }
        }

        #endregion

        /// <summary>
        /// Duplicate a record
        /// </summary>
        /// <param name="record"></param>
        /// <returns></returns>
        public static DSRecord Copy(DSRecord record)
        {
            if (record == null)
                return null;

            if (!(Activator.CreateInstance(record.GetType()) is DSRecord newCopy))
                return null;

            foreach (PropertyInfo property in record.GetType().GetProperties())
            {
                if (!property.CanWrite)
                    continue;

                if (property.PropertyType != typeof(byte[]))
                {
                    property.SetValue(newCopy, property.GetValue(record));
                    continue;
                }

                if (!(property.GetValue(record) is byte[] value))
                {
                    property.SetValue(newCopy, null);
                    continue;
                }

                byte[] newValue = new byte[value.Length];
                value.CopyTo(newValue, 0);
                property.SetValue(newCopy, newValue);
            }

            return newCopy;
        }

        /// <summary>
        /// Empty constructor
        /// </summary>
        public DSRecord() { }

        /// <summary>
        /// Constructor by copy
        /// </summary>
        /// <param name="copy"></param>
        public DSRecord(DSRecord copy)
        {
            Id = copy.Id;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="id"></param>
        public DSRecord(int id)
        {
            Id = id;
        }
    }
}