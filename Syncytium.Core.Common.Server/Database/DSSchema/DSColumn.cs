using Syncytium.Core.Common.Server.Database.DSAnnotation;
using Syncytium.Core.Common.Server.Database.DSAnnotation.DSConstraint;
using Syncytium.Core.Common.Server.Database.DSAnnotation.DSControl;
using Syncytium.Core.Common.Server.Database.DSAnnotation.DSFormat;
using Syncytium.Core.Common.Server.Database.DSModel;
using Syncytium.Core.Common.Server.Error;
using Newtonsoft.Json.Linq;
using System.Data.Entity;
using System.Reflection;
using Syncytium.Core.Common.Server.Managers;

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

namespace Syncytium.Core.Common.Server.Database.DSSchema
{
    /// <summary>
    /// Describes the column structure
    /// </summary>
    public class DSColumn
    {
        /// <summary>
        /// Handle of the property attached to this column
        /// </summary>
        public PropertyInfo Property { get; }

        /// <summary>
        /// Handle of the property attached to this column attached into the history table
        /// </summary>
        public PropertyInfo? SourceProperty { get; } = null;

        /// <summary>
        /// Column name into the table
        /// </summary>
        public string ColumnName { get; }

        /// <summary>
        /// Field name from the multilingual dictionary
        /// </summary>
        public string Field { get; }

        /// <summary>
        /// Store the default value of the column
        /// </summary>
        public object? DefaultValue { get; }

        /// <summary>
        /// Sequence annotation of the column
        /// </summary>
        public DSSequenceAttribute? Sequence { get; }

        /// <summary>
        /// List of format annotations attached to the field
        /// </summary>
        public List<DSFormatAttribute> Formats { get; }

        /// <summary>
        /// List of control annotations attached to the field
        /// </summary>
        public List<DSControlAttribute> Controls { get; }

        /// <summary>
        /// List of constraint annotations attached to the field
        /// </summary>
        public List<DSConstraintAttribute> Constraints { get; }

        /// <summary>
        /// List of restricted annotations attached to the field
        /// </summary>
        public List<DSRestrictedAttribute> Restriction { get; }

        /// <summary>
        /// Notify the fact that the property can be null
        /// </summary>
        /// <returns></returns>
        public bool IsNullable => !Property.PropertyType.IsPrimitive && !Property.PropertyType.IsEnum && (Property.PropertyType.IsClass || Property.PropertyType.IsGenericType);

        /// <summary>
        /// Get the type of the column (if nullable, get the sub type)
        /// </summary>
        public Type Type
        {
            get
            {
                if (Property.PropertyType.IsPrimitive || Property.PropertyType.IsEnum)
                    return Property.PropertyType;

                if (!Property.PropertyType.IsGenericType ||
                    Property.PropertyType.GetGenericArguments().Length == 0 ||
                    Property.PropertyType.IsEnum)
                    return Property.PropertyType;

                return Property.PropertyType.GetGenericArguments().First();
            }
        }

        /// <summary>
        /// Indicates if the field is a key or not
        /// </summary>
        public bool IsKey => Controls.FirstOrDefault(c => (c as DSKeyAttribute) != null) != null;

        /// <summary>
        /// Indicates if the column is an enumerable value or not
        /// </summary>
        /// <returns></returns>
        public bool IsEnum()
        {
            if (Property.PropertyType.IsEnum)
                return true;

            if (!Property.PropertyType.IsGenericType || Property.PropertyType.GetGenericArguments().Length == 0)
                return false;

            if (Property.PropertyType.GetGenericArguments().First().IsEnum)
                return true;

            return false;
        }

        /// <summary>
        /// Get the foreign key constraints of this column
        /// </summary>
        public DSForeignKeyAttribute? ForeignKey => Constraints.FirstOrDefault(c => (c as DSForeignKeyAttribute) != null) as DSForeignKeyAttribute;

        /// <summary>
        /// Get the unique constraints of this column
        /// </summary>
        public DSUniqueAttribute? Unique => Constraints.FirstOrDefault(c => (c as DSUniqueAttribute) != null) as DSUniqueAttribute;

        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static readonly string MODULE = typeof(DSColumn).Name;

        /// <summary>
        /// Indicates if the all verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsVerboseAll() => LoggerManager.Instance.IsVerboseAll;

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsVerbose() => LoggerManager.Instance.IsVerbose;

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="message"></param>
        private void Verbose(string message) => LoggerManager.Instance.Verbose(MODULE, message);

        /// <summary>
        /// Indicates if the debug mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsDebug() => LoggerManager.Instance.IsDebug;

        /// <summary>
        /// Log a debug message
        /// </summary>
        /// <param name="message"></param>
        private void Debug(string message) => LoggerManager.Instance.Debug(MODULE, message);

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        private void Info(string message) => LoggerManager.Instance.Info(MODULE, message);

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        private void Warn(string message) => LoggerManager.Instance.Warn(MODULE, message);

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        private void Error(string message) => LoggerManager.Instance.Error(MODULE, message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        private void Exception(string message, System.Exception ex) => LoggerManager.Instance.Exception(MODULE, message, ex);

        #endregion

        #region Private Methods

        /// <summary>
        /// Retrieve an enumerable type
        /// </summary>
        /// <param name="enumerable"></param>
        /// <returns></returns>
        private JObject GetJSONEnumerableType(Type enumerable)
        {
            JObject values = new();

            if (!enumerable.IsEnum)
                return values;

            string[] valueString = enumerable.GetEnumNames();

            values["Name"] = enumerable.Name;
            string? area = DSDatabase.GetArea(enumerable.Namespace);
            if (area != null)
                values["Area"] = area;

            int i = 0;
            foreach (int value in enumerable.GetEnumValues())
            {
                JObject enumValue = new()
                {
                    ["Label"] = Field + "_" + valueString[i].ToUpper(),
                    ["Name"] = valueString[i]
                };
                values[value.ToString()] = enumValue;
                i++;
            }

            return values;
        }

        #endregion

        /// <summary>
        /// Get the type name of the property
        /// </summary>
        /// <returns></returns>
        public JToken GetJSONTypeName()
        {
            if (Property.PropertyType.IsEnum)
                return GetJSONEnumerableType(Property.PropertyType);

            if (!Property.PropertyType.IsGenericType || Property.PropertyType.GetGenericArguments().Length == 0)
                return Property.PropertyType.Name;

            if (Property.PropertyType.GetGenericArguments().First().IsEnum)
                return GetJSONEnumerableType(Property.PropertyType.GetGenericArguments().First());

            return new JValue(Property.PropertyType.GetGenericArguments().First().Name);
        }

        /// <summary>
        /// Convert the column into JSON
        /// </summary>
        /// <param name="area">if null, everything, else columns having the restriction to the area</param>
        /// <param name="profile">if None, everything, else columns having the restriction to the profile</param>
        /// <returns></returns>
        public JObject? ToJSON(string area, UserProfile.EUserProfile profile)
        {
            if (DSRestrictedAttribute.IsRestricted(Restriction, area, profile, null))
                return null;

            JObject result = new()
            {
                ["Field"] = Field,
                ["Property"] = Property.Name,
                ["Type"] = GetJSONTypeName(),
                ["DefaultValue"] = DefaultValue == null ? JValue.CreateNull() : new JValue(DefaultValue),
                ["IsNullable"] = IsNullable,
                ["Formats"] = new JArray(Formats.Select(format => format.ToJSON()).ToArray()),
                ["Controls"] = new JArray(Controls.Select(control => control.ToJSON()).ToArray()),
                ["Constraints"] = new JArray(Constraints.Select(constraint => constraint.ToJSON()).ToArray())
            };
            return result;
        }

        /// <summary>
        /// Convert a given value into a value matching within the expected type of the column
        /// Network -> Record
        /// </summary>
        /// <param name="value"></param>
        /// <param name="errors">List of errors identified</param>
        /// <param name="conversionOK">return true if the given value can be converted into the target type</param>
        /// <returns>the value converted</returns>
        public object? ConvertFromJSON(object? value, Errors errors, out bool conversionOK)
        {
            conversionOK = true;

            // check if the value is Nullable

            if (!IsNullable && value == null)
            {
                errors.AddField(Property.Name, "ERR_FIELD_REQUIRED", new object[] { $"{{{Field}}}" });
                conversionOK = false;
                return value;
            }

            // Convert the value if DSFormatAttribute is defined

            foreach (DSFormatAttribute format in Formats)
            {
                try
                {
                    value = format.ConvertFromJSON(value);
                }
                catch
                {
                    conversionOK = false;
                    errors.AddField(Property.Name, "ERR_FIELD_BADFORMAT", new object[] { $"{{{Field}}}", value?.ToString() ?? String.Empty });
                    return value;
                }
            }

            // Check the type of the property and convert it, if it's necessary

            if (value == null || value.GetType() == Type)
                return value;

            // To Int

            if (Type == typeof(int))
            {
                // Convert into int

                if (value.GetType() == typeof(bool))
                    return ((bool)value ? 1 : 0);

                if (value.GetType() == typeof(string))
                {
                    if (int.TryParse(value as string, out int result))
                        return result;

                    errors.AddField(Property.Name, "ERR_FIELD_BADFORMAT", new object[] { $"{{{Field}}}", value?.ToString() ?? String.Empty });
                    conversionOK = false;
                    return value;
                }

                conversionOK = false;
                errors.AddField(Property.Name, "ERR_FIELD_BADFORMAT", new object[] { $"{{{Field}}}", value?.ToString() ?? String.Empty });
                return value;
            }

            // To Boolean

            if (Type == typeof(bool))
            {
                if (value.GetType() == typeof(string))
                {
                    string strValue = ((string)value).ToUpper().Trim();
                    return (strValue.Equals("TRUE") || strValue.Equals("OK") || strValue.Equals("1"));
                }

                if (value.GetType() == typeof(int))
                    return ((int)value != 0);

                conversionOK = false;
                errors.AddField(Property.Name, "ERR_FIELD_BADFORMAT", new object[] { $"{{{Field}}}", value?.ToString() ?? String.Empty });
                return value;
            }

            // To String

            if (Type == typeof(string))
                return value?.ToString()?.Trim() ?? String.Empty;

            // To Enumerable

            if (Type.IsEnum)
            {
                if (value.GetType() == typeof(string))
                {
                    string strValueEnum = ((string)value)?.ToUpper()?.Trim() ?? String.Empty;

                    int i = 0;
                    string[] valueString = Type.GetEnumNames();
                    foreach (var index in Type.GetEnumValues())
                    {
                        if (strValueEnum.Equals(Field + "_" + valueString[i].ToUpper()) ||
                            strValueEnum.Equals(valueString[i].ToUpper()))
                            return index;

                        i++;
                    }
                }
                else if (value.GetType() == typeof(int))
                {
                    int intValueEnum = (int)value;
                    foreach (var index in Type.GetEnumValues())
                    {
                        if ((int)index == intValueEnum)
                            return index;
                    }
                }

                conversionOK = false;
                errors.AddField(Property.Name, "ERR_FIELD_BADFORMAT", new object[] { $"{{{Field}}}", value?.ToString() ?? String.Empty });
                return value;
            }

            // To DateTime

            if (Type == typeof(DateTime))
            {
                if (value.GetType() == typeof(string))
                {
                    try
                    {
                        return Convert.ToDateTime(value as string);
                    }
                    catch
                    {
                        conversionOK = false;
                        errors.AddField(Property.Name, "ERR_FIELD_BADFORMAT", new object[] { $"{{{Field}}}", value?.ToString() ?? String.Empty });
                        return value;
                    }
                }

                conversionOK = false;
                errors.AddField(Property.Name, "ERR_FIELD_BADFORMAT", new object[] { $"{{{Field}}}", value?.ToString() ?? String.Empty });
                return value;
            }

            // To Double

            if (Type == typeof(double))
            {
                // Convert into double

                if (value.GetType() == typeof(bool))
                    return ((bool)value ? (double)1.0 : (double)0.0);

                if (value.GetType() == typeof(int))
                    return Convert.ToDouble(value);

                if (value.GetType() == typeof(string))
                {
                    if (double.TryParse(value as string, out double result))
                        return result;
                }

                conversionOK = false;
                errors.AddField(Property.Name, "ERR_FIELD_BADFORMAT", new object[] { $"{{{Field}}}", "{ERR_FIELD_TYPE}" });
                return value;
            }

            // To Decimal

            if (Type == typeof(Decimal))
            {
                // Convert into decimal

                if (value.GetType() == typeof(bool))
                    return ((bool)value ? (Decimal)1 : (Decimal)0);

                if (value.GetType() == typeof(int))
                    return Convert.ToDecimal(value);

                if (value.GetType() == typeof(double))
                    return Convert.ToDecimal(value);

                if (value.GetType() == typeof(string))
                {
                    if (Decimal.TryParse(value as string, out Decimal result))
                        return result;
                }

                conversionOK = false;
                errors.AddField(Property.Name, "ERR_FIELD_BADFORMAT", new object[] { $"{{{Field}}}", "{ERR_FIELD_TYPE}" });
                return value;
            }

            // Conversion not implemented !

            conversionOK = false;
            errors.AddField(Property.Name, "ERR_FIELD_BADFORMAT", new object[] { $"{{{Field}}}", value?.ToString() ?? String.Empty });
            return value;
        }

        /// <summary>
        /// Convert a given value from a record to another type
        /// Record -> Network
        /// </summary>
        /// <param name="value"></param>
        /// <param name="errors">List of errors identified</param>
        /// <param name="conversionOK">return true if the given value can be converted into the target type</param>
        /// <returns>the value converted</returns>
        public object? ConvertToJSON(object? value, Errors errors, out bool conversionOK)
        {
            // Convert the value if DSFormatAttribute is defined

            foreach (DSFormatAttribute format in Formats)
            {
                try
                {
                    value = format.ConvertToJSON(value);
                }
                catch
                {
                    conversionOK = false;
                    errors.AddField(Property.Name, "ERR_FIELD_BADFORMAT", new object[] { $"{{{Field}}}", value?.ToString() ?? String.Empty });
                    return value;
                }
            }

            conversionOK = true;
            return value;
        }

        /// <summary>
        /// Check the given value within all controls (see DSColumn.js too)
        /// </summary>
        /// <param name="value"></param>
        /// <param name="errors">List of errors identified</param>
        /// <param name="conversionOK">return true if the given value can be converted into the target type</param>
        /// <param name="check"></param>
        /// <returns>the value to set</returns>
        public object? CheckProperties(object? value, Errors errors, out bool conversionOK, bool check)
        {
            // First, convert the value into an expected type

            value = ConvertFromJSON(value, errors, out conversionOK);

            if (!conversionOK || errors.HasError)
            {
                conversionOK = false;
                return value;
            }

            // Check all controls on this column

            if (check)
            {
                foreach (DSControlAttribute control in Controls)
                    control.Check(this, value, errors);
            }

            conversionOK = !errors.HasError;
            return value;
        }

        /// <summary>
        /// Build  a column description
        /// </summary>
        /// <param name="databaseSchema"></param>
        /// <param name="tableName"></param>
        /// <param name="property"></param>
        /// <param name="defaultInstance"></param>
        public DSColumn(DSDatabase databaseSchema, string tableName, PropertyInfo property, object defaultInstance)
        {
            Field = tableName.ToUpper() + "_" + property.Name.ToUpper();
            Property = property;
            ColumnName = property.Name;
            DefaultValue = property.GetValue(defaultInstance);
            Formats = new List<DSFormatAttribute>();
            Controls = new List<DSControlAttribute>();
            Constraints = new List<DSConstraintAttribute>();
            Restriction = new List<DSRestrictedAttribute>();

            foreach (object annotation in property.GetCustomAttributes(true))
            {
                if (typeof(DSNameAttribute).IsInstanceOfType(annotation))
                    Field = ((DSNameAttribute)annotation).Name;
                else if (typeof(DSControlAttribute).IsInstanceOfType(annotation))
                    Controls.Add((DSControlAttribute)annotation);
                else if (typeof(DSConstraintAttribute).IsInstanceOfType(annotation))
                    Constraints.Add((DSConstraintAttribute)annotation);
                else if (typeof(DSSequenceAttribute).IsInstanceOfType(annotation))
                {
                    Sequence = (DSSequenceAttribute)annotation;
                    Formats.Add((DSFormatAttribute)annotation);
                }
                else if (typeof(DSFormatAttribute).IsInstanceOfType(annotation))
                    Formats.Add((DSFormatAttribute)annotation);
                else if (typeof(DSRestrictedAttribute).IsInstanceOfType(annotation))
                    Restriction.Add((DSRestrictedAttribute)annotation);
                else if (typeof(System.ComponentModel.DataAnnotations.Schema.ColumnAttribute).IsInstanceOfType(annotation))
                    ColumnName = ((System.ComponentModel.DataAnnotations.Schema.ColumnAttribute)annotation)?.Name ?? String.Empty;
                else if (typeof(System.ComponentModel.DataAnnotations.KeyAttribute).IsInstanceOfType(annotation))
                    Controls.Add(new DSKeyAttribute());
                else if (typeof(System.ComponentModel.DataAnnotations.RequiredAttribute).IsInstanceOfType(annotation))
                    Controls.Add(new DSRequiredAttribute());
            }

            if (this.Type == typeof(DateTime))
            {
                bool existFormatDate = false;

                foreach (DSFormatAttribute format in Formats)
                {
                    if (!format.Type.Equals("DateTime"))
                        continue;

                    existFormatDate = true;
                    break;
                }

                if (!existFormatDate)
                    Formats.Add(new DSDateTimeAttribute());
            }

            // In case of history, retrieve the source field

            if (tableName.StartsWith("History") && databaseSchema.Schema.GetProperty(tableName[7..]) != null)
            {
                PropertyInfo? sourceTableProperty = databaseSchema.Schema.GetProperty(tableName[7..]);

                // Only DbSet<X> contains a table
                // Ignore private, protected tables or properties started with "_"

                if (sourceTableProperty != null &&
                    sourceTableProperty.PropertyType.IsGenericType &&
                    sourceTableProperty.PropertyType.GetGenericTypeDefinition() == typeof(DbSet<>) &&
                    !sourceTableProperty.Name.StartsWith("_") &&
                    !sourceTableProperty.PropertyType.IsNotPublic &&
                    sourceTableProperty.PropertyType.GetGenericArguments().First().IsSubclassOf(typeof(DSRecord)))
                {
                    // Ignore record not inheritence of DSRecord
                    Type sourceTable = sourceTableProperty.PropertyType.GetGenericArguments().First();
                    SourceProperty = sourceTable.GetProperty(property.Name);
                }
            }
        }
    }
}
