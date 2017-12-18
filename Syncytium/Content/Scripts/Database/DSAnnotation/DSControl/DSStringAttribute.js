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
 * Class describing the checking a field never null or empty (see DSRequiredAttribute.cs)
 */
class DSStringAttribute extends DSControlAttribute {
    /**
     * @returns {string} "String"
     */
    get Type() {
        return "String";
    }

    /**
     * @returns {number} maximum number of characters
     */
    get MaxLength() {
        return this._max;
    }

    /**
     * Check the validity of the value
     * @param {DSColumn} column column of the table
     * @param {any} value  value to check
     * @param {any} errors list of errors to update
     * @returns {boolean} true if the value is valid
     */
    check( column, value, errors ) {
        var validity = super.check( column, value, errors );

        if ( value === null || value === undefined ) {
            if ( this._min > 0 ) {
                errors.addField( column.Property, this._errorMin, ["{" + column.Field + "}", this._min.toString()] );
                return false;
            }

            return validity;
        }

        // Check the length of the string

        if ( typeof value !== "string" ) {
            errors.addField( column.Property, this._error, ["{" + column.Field + "}"] );
            return false;
        }

        if ( value.length < this._min ) {
            errors.addField( column.Property, this._errorMin, ["{" + column.Field + "}", this._min.toString()] );
            validity = false;
        }

        if ( this._max >= 0 && value.length > this._max ) {
            errors.addField( column.Property, this._errorMax, ["{" + column.Field + "}", this._max.toString()] );
            validity = false;
        }

        return validity;
    }

    /**
     * Constructor
     * @param {any} error     error code of label
     * @param {any} min       minimum length of the string
     * @param {any} errorMin  error code of label in case of minimum length not respected
     * @param {any} max       maximum length of the string
     * @param {any} errorMax  error code of label in case of maximum length not respected
     */
    constructor( error, min, errorMin, max, errorMax ) {
        super( error );

        this._min = min;
        this._errorMin = errorMin;
        this._max = max;
        this._errorMax = errorMax;
    }
}
