/// <reference path="../../../_references.js" />

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
 * Class describing the conversion of a date into/from a string (see DSDateTimeAttribute.cs)
 */
class DSDateTimeAttribute extends DSFormatAttribute {
    /**
     * @returns {string} "DateTime"
     */
    get Type() {
        return "DateTime";
    }

    /**
     * @returns {string} Format DateTime for moment
     */
    get Format() {
        return this._format;
    }

    /**
     * Convert a given value into a value matching within the expected type of the column
     * Network -> Record
     * @param {any} value value to convert
     * @returns {any} value
     */
    convertFromJSON ( value ) {
        if ( value === null || value === undefined )
            return value;

        if ( typeof value !== "string" )
            return value;

        value = new moment( value, this._format );
        if ( !value.isValid() )
            throw "ERR_FIELD_BADFORMAT";

        return value;
    }

    /**
     * Convert a given value from a record to another type
     * Record -> Network
     * @param {any} value value to convert
     * @returns {any} value
     */
    convertToJSON ( value ) {
        if ( value === null || value === undefined )
            return value;

        if ( value instanceof Date )
            return moment( value.toString() ).format( this._format );

        if ( value instanceof moment )
            return value.format( this._format );

        return value;
    }

    /**
     * Constructor
     * @param {any} format date time format (see C#)
     */
    constructor( format ) {
        super();
        this._format = format;
    }
}
