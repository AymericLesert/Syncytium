/// <reference path="../../_references.js" />

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

/**
 * Manage the differential synchronization database from the client side
 * This class describes the structure of a column
 */
class DSColumn extends LoggerBaseObject {
    /**
     * @returns {boolean} Check if the column is a key column
     */
    get IsKey () {
        for ( var i = 0; i < this._controls.length; i++ )
            if ( this._controls[i].Type === "Key" )
                return true;

        return false;
    }

    /**
     * @returns {boolean} Check if the column is a key column
     */
    get IsEmail() {
        for (var i = 0; i < this._controls.length; i++)
            if (this._controls[i].Type === "Email")
                return true;

        return false;
    }

    /**
     * @returns {any} Check if the column is a foreign key column and get the table
     */
    get ForeignKey () {
        for ( var i = 0; i < this._constraints.length; i++ )
            if ( this._constraints[i].Type === "ForeignKey" )
                return this._constraints[i];

        return null;
    }

    /**
     * Check if the column has to have a unique value (for the non-deleted record) and returns the error code
     */
    get Unique () {
        for ( var i = 0; i < this._constraints.length; i++ )
            if ( this._constraints[i].Type === "Unique" )
                return this._constraints[i];

        return null;
    }

    /**
     * Get the type of the column "number", "boolean", "string" or the current type of the column
     */
    get Typeof () {
        switch ( this._type ) {
            case "Int32":
            case "Decimal":
            case "Double":
                return "number";
            case "Boolean":
                return "boolean";
            case "String":
                return "string";
        }

        return this._type;
    }

    /**
     * @returns {string} the date time format into the javascript expected
     */
    get DatetimeFormat() {
        if ( this._type !== "DateTime" )
            return null;

        // Looking for the DSDateTimeAttribute

        for ( var i = 0; i < this._formats.length; i++ ) {
            if ( this._formats[i].Type === "DateTime" )
                return this._formats[i].Format;
        }

        return null;
    }

    /**
     * @returns {string} the date time format into the javascript expected
     */
    get StringFormat() {
        if (this._type !== "String")
            return null;

        // Looking for the DSMaskAttribute

        for (var i = 0; i < this._formats.length; i++) {
            if (this._formats[i].Type === "Mask")
                return this._formats[i].Mask;
        }

        return null;
    }

    /**
     * @returns {number} max length of the string value
     */
    get StringMaxLength() {
        if (this._type !== "String")
            return null;

        // Looking for the DSStringAttribute

        for (var i = 0; i < this._controls.length; i++) {
            if (this._controls[i].Type === "String")
                return this._controls[i].MaxLength;
        }

        return null;
    }

    /**
     * @returns {string} multilingual label of the column
     */
    get Field() {
        return this._field;
    }

    /**
     * @returns {string} property of the record
     */
    get Property() {
        return this._property;
    }

    /**
     * @returns {any} default value
     */
    get DefaultValue() {
        return this._defaultValue;
    }

    /**
     * @returns {any} list of format annotations
     */
    get Formats() {
        return this._formats;
    }

    /**
     * @returns {any} list of control annotations
     */
    get Controls() {
        return this._controls;
    }

    /**
     * @returns {any} list of constraint annotations
     */
    get Constraints() {
        return this._constraints;
    }

    /**
     * @returns {boolean} true if the field can have a null value
     */
    get IsNullable() {
        return this._isNullable;
    }

    /**
     * @returns {boolean} true if the field is required
     */
    get IsRequired() {
        if (!this._isNullable)
            return true;

        for (var i = 0; i < this._controls.length; i++) {
            if (this._controls[i].Type === "Required")
                return true;
        }

        return false;
    }

    /**
     * @returns {string} "Int32", "Double", "Decimal", "Boolean", "String", "Enum", "DateTime", "Byte[]"
     */
    get Type() {
        return this._type;
    }

    /**
     * @returns {string} Path of the different pictures of an enumerable list of values
     */
    get PathEnumerable() {
        var area = this._enumerable.Area;
        var name = this._enumerable.Name;
        var path = "";

        if ( !String.isEmptyOrWhiteSpaces( area ) )
            path += area + "/";
        if ( !String.isEmptyOrWhiteSpaces( name ) )
            path += name + "/";

        return path;
    }

    /**
     * @returns {any} digit instance of the column or null
     */
    get Digit() {
        // Looking for the DSDecimalAttribute

        for (var i = 0; i < this._controls.length; i++) {
            if (this._controls[i].Type === "Decimal")
                return new Digits.Decimal(this._controls[i].NbDigitsBefore, this._controls[i].NbDigitsAfter);
        }

        return this._type === "Int32" ? new Digits.Decimal(9) : new Digits.Decimal(6, 3);
    }

    /**
     * @returns {any} unit of the column or null
     */
    get Unit() {
        // Looking for the DSDecimalAttribute

        for (var i = 0; i < this._controls.length; i++) {
            if (this._controls[i].Type === "Decimal")
                return this._controls[i].Unit;
        }

        return null;
    }

    /**
     * Check if 2 columns has the same type
     * @param {DSColumn} column column to compare to the current column
     * @returns {boolean} true if the 2 columns (this and column) has the same structure (same type and same enumerable values)
     */
    hasSameStructure ( column ) {
        if ( this._isNullable !== column._isNullable )
            return false;

        if ( this._type !== column._type )
            return false;

        var key = null;

        for ( key in this._enumerable ) {
            if ( key === "Name" || key === "Area" )
                continue;

            if ( column._enumerable[key] === null || column._enumerable[key] === undefined )
                return false;
        }

        for ( key in column._enumerable ) {
            if ( key === "Name" || key === "Area" )
                continue;

            if ( this._enumerable[key] === null || this._enumerable[key] === undefined )
                return false;
        }

        for ( key in this._enumerable ) {
            if ( key === "Name" || key === "Area" )
                continue;

            if ( this._enumerable[key].Label !== column._enumerable[key].Label )
                return false;
        }

        return true;
    }

    /**
     * Convert a given value into a value matching within the expected type of the column
     * Network -> Record
     * @param {any} value         value to convert
     * @param {any} errors        container of errors in case of abnormal values
     * @param {any} nullableCheck true if the value null is allowed
     * @returns {any} value converted
     */
    convertType ( value, errors, nullableCheck ) {
        if ( nullableCheck === undefined )
            nullableCheck = true;

        var newValue = null;

        // check if value is null or not

        if ( value === undefined || typeof value === "string" && value === "" )
            value = null;

        // check if the value is Nullable

        if ( !this._isNullable && nullableCheck && value === null ) {
            this.error( "The property '" + this._property + "' can't be null" );
            errors.addField( this._property, "ERR_FIELD_BADFORMAT", ["{" + this._field + "}"] );
            return value;
        }

        // Check the type of the property and convert it, if it's necessary

        if ( value === null )
            return value;

        if ( typeof value === "string" )
            value = value.trim();

        if ( typeof value === this.Typeof )
            return value;

        // Check the type of the property and convert it, if it's necessary

        var newDate = null;
        switch ( this._type ) {
            case "Int32":
                if ( typeof value === "boolean" )
                    return value ? 1 : 0;

                if ( typeof value === "string" ) {
                    if ( value.trim() === "" )
                        return 0;

                    newValue = String.parseInt( value );
                    if ( !isNaN( newValue ) )
                        return newValue;
                }

                this.error( "The property '" + this._property + "' (" + value + ") can't be converted into '" + this._type + "'" );
                errors.addField( this._property, "ERR_FIELD_BADFORMAT", ["{" + this._field + "}"] );
                return value;
            case "Decimal":
            case "Double":
                if ( typeof value === "boolean" )
                    return value ? 1 : 0;

                if ( typeof value === "string" ) {
                    if ( value.trim() === "" )
                        return 0;

                    newValue = String.parseFloat( value );
                    if ( !isNaN( newValue ) )
                        return newValue;
                }

                this.error( "The property '" + this._property + "' (" + value + ") can't be converted into '" + this._type + "'" );
                errors.addField( this._property, "ERR_FIELD_BADFORMAT", ["{" + this._field + "}"] );
                return value;
            case "Boolean":
                if ( typeof value === "string" )
                    return value.toUpperCase() === "TRUE" || value.toUpperCase() === "OK" || value === "1";

                if ( typeof value === "number" )
                    return value !== 0;

                this.error( "The property '" + this._property + "' (" + value + ") can't be converted into '" + this._type + "'" );
                errors.addField( this._property, "ERR_FIELD_BADFORMAT", ["{" + this._field + "}"] );
                return value;
            case "String":
                return value.toString().trim();
            case "Enum":
                if ( typeof value === "number" && this._enumerable[value] !== undefined )
                    return value;

                if ( typeof value === "string" ) {
                    // Check if the enumerable value exists

                    if ( value !== "Name" && value !== "Area" && this._enumerable[value] !== undefined ) {
                        var valueNumber = String.parseInt( value );
                        if ( !isNaN( valueNumber ) )
                            return valueNumber;
                        return value;
                    }

                    // Check if the string value corresponds to one of the enumerable values

                    for ( var enumerableKey in this._enumerable ) {
                        if ( enumerableKey !== "Name" &&
                            enumerableKey !== "Area" &&
                            this._enumerable[enumerableKey] !== null && this._enumerable[enumerableKey] !== undefined &&
                            !String.isEmptyOrWhiteSpaces( this._enumerable[enumerableKey].Label ) &&
                            this._enumerable[enumerableKey].Label.trim().toUpperCase() === value.trim().toUpperCase() )
                            return String.parseInt( enumerableKey );
                    }
                }

                this.error( "The property '" + this._property + "' (" + value + ") can't be converted into '" + this._type + "'" );
                errors.addField( this._property, "ERR_FIELD_BADFORMAT", ["{" + this._field + "}"] );
                return value;
            case "DateTime":
                if ( value instanceof Date ) {
                    newDate = moment( value.toISOString(), moment.ISO_8601 );
                    if ( newDate.isValid() )
                        return newDate;
                }

                if ( value instanceof moment )
                    return value;

                if ( typeof value === "string" ) {
                    newDate = moment( value, [moment.ISO_8601,
                        "YYYY/MM/DD HH:mm:ss.SSS",
                        "YYYY/MM/DD HH:mm:ss",
                        "YYYY/MM/DD HH:mm",
                        "YYYY/MM/DD",
                        "DD/MM/YYYY HH:mm:ss.SSS",
                        "DD/MM/YYYY HH:mm:ss",
                        "DD/MM/YYYY HH:mm",
                        "DD/MM/YYYY",
                        "HH:mm:ss.SSS",
                        "HH:mm:ss",
                        "HH:mm"], true );
                    if ( newDate.isValid() )
                        return newDate;
                }

                this.error( "The property '" + this._property + "' (" + value + ") can't be converted into '" + this._type + "'" );
                errors.addField( this._property, "ERR_FIELD_BADFORMAT", ["{" + this._field + "}"] );
                return value;
            case "Byte[]":
                return value;
            default:
                this.error( "Type '" + this._type + "' not implemented!" );
                errors.addField( this._property, "ERR_FIELD_BADFORMAT", ["{" + this._field + "}"] );
                return value;
        }
    }

    /**
     * Convert a given value into a value matching within the expected type of the column
     * Network -> Record
     * @param {any} value  value to convert from JSON format
     * @param {any} errors container of errors in case of abnormal values
     * @returns {any} value converted
     */
    convertFromJSON ( value, errors ) {
        // check if the value is Nullable

        if ( !this._isNullable && ( value === null || value === undefined ) ) {
            errors.addField( this._property, "ERR_FIELD_BADFORMAT", ["{" + this._field + "}"] );
            return value;
        }

        // Convert the value if DSFormatAttribute is defined

        for ( var i = 0; i < this._formats.length; i++ ) {
            try {
                value = this._formats[i].convertFromJSON( value );
            } catch ( e ) {
                errors.addField( this._property, "ERR_FIELD_BADFORMAT", ["{" + this._field + "}"] );
                return value;
            }
        }

        return this.convertType( value, errors );
    }

    /**
     * Convert a given value from a record to another type
     * Record -> Network
     * @param {any} value  value to convert to JSON format
     * @param {any} errors container of errors in case of abnormal values
     * @returns {any} value converted
     */
    convertToJSON ( value, errors ) {
        for ( var i = 0; i < this._formats.length; i++ ) {
            try {
                value = this._formats[i].convertToJSON( value );
            } catch ( e ) {
                errors.addField( this._property, "ERR_FIELD_BADFORMAT", ["{" + this._field + "}"] );
                return value;
            }
        }

        return value;
    }

    /**
     * Check if the value respects the control (see DSColumn.cs too)
     * @param {any} value  value to check
     * @param {any} errors container of errors in case of abnormal values
     * @returns {any} value converted and checked
     */
    checkProperties ( value, errors ) {
        value = this.convertType( value, errors );

        for ( var i = 0; i < this._controls.length; i++ )
            this._controls[i].check( this, value, errors );

        return value;
    }

    /**
     * Retrieve an enumerable value or the list of enumerables values of a given column
     * @param {any} value defined if you want to have the enumerable value corresponding to the value, undefined if you want to have the list of enumerable values
     * @returns {any} the enumerable value or the list of enumerable values
     */
    getEnumerable ( value ) {
        var enumerableKey = null;
        var item = null;

        if ( this._type !== "Enum" )
            return value === undefined ? [] : value;

        if ( value === undefined ) {
            var values = [];
            var path = this.PathEnumerable;

            for ( enumerableKey in this._enumerable ) {
                if ( enumerableKey === "Name" || enumerableKey === "Area" )
                    continue;

                if ( String.isEmptyOrWhiteSpaces( this._enumerable[enumerableKey].Label ) )
                    continue;

                item = {};
                item.Id = String.parseInt( enumerableKey );
                item.Label = this._enumerable[enumerableKey].Label.trim().toUpperCase();
                item.Picture = null;
                item.Name = this._enumerable[enumerableKey].Name;

                if ( !String.isEmptyOrWhiteSpaces( this._enumerable[enumerableKey].Name ) )
                    item.Picture = path + this._enumerable[enumerableKey].Name + ".svg";

                values.push( item );
            }

            return values;
        }

        if ( typeof value === "number" && this._enumerable[value] !== undefined )
            return this._enumerable[value].Label;

        if ( typeof value === "string" ) {
            // Check if the enumerable value exists

            if ( value !== "Name" && value !== "Area" && this._enumerable[value] !== undefined )
                return this._enumerable[value].Label;

            // Check if the string value corresponds to one of the enumerable values

            for ( enumerableKey in this._enumerable ) {
                if ( enumerableKey !== "Name" && enumerableKey !== "Area" &&
                    this._enumerable[enumerableKey] !== null && this._enumerable[enumerableKey] !== undefined &&
                    !String.isEmptyOrWhiteSpaces( this._enumerable[enumerableKey].Label ) &&
                    this._enumerable[enumerableKey].Label.trim().toUpperCase() === value.trim().toUpperCase() )
                    return this._enumerable[enumerableKey].Label.trim().toUpperCase();
            }
        }

        if ( value === null ) {
            item = {};

            item.Id = null;
            item.Label = this._field + "_NULL";
            item.Picture = this.PathEnumerable + "Null.svg";
            item.Name = "Null";

            return item;
        }

        return value;
    }

    /**
     * Constructor
     * @param {any} table        table name
     * @param {any} schemaColumn description of the column from the server
     */
    constructor ( table, schemaColumn ) {
        super("DSColumn[" + table + "." + schemaColumn.Property + "]" );

        // set column properties

        this._field = schemaColumn.Field;
        this._property = schemaColumn.Property;
        if ( typeof schemaColumn.Type === "string" ) {
            this._type = schemaColumn.Type;
            this._enumerable = {};
        } else {
            this._type = "Enum";
            this._enumerable = schemaColumn.Type;
        }
        this._isNullable = schemaColumn.IsNullable;
        this._defaultValue = schemaColumn.DefaultValue;
        this._formats = DSAnnotationAttribute.FactoryList( schemaColumn.Formats );
        this._controls = DSAnnotationAttribute.FactoryList( schemaColumn.Controls );
        this._constraints = DSAnnotationAttribute.FactoryList( schemaColumn.Constraints );

        this.info( "Structure: " + this.toString() );
    }
}
