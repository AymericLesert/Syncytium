/// <reference path="../../../_references.js" />

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

/**
 * Class describing the checking a field never null or empty (see DSRequiredAttribute.cs)
 */
class DSRequiredAttribute extends DSControlAttribute {
    /**
     * @returns {string} "Required"
     */
    get Type() {
        return "Required";
    }

    /**
     * Check the validity of the value
     * @param {DSColumn} column column of the table
     * @param {any} value  value to check
     * @param {any} errors list of errors to update
     * @returns {boolean} true if the value is valid
     */
    check( column, value, errors ) {
        let validity = super.check( column, value, errors );

        // Check if the value is defined and not empty

        if ( value === null || value === undefined ) {
            errors.addField( column.Property, this._error, ["{" + column.Field + "}"] );
            return false;
        }

        if ( typeof value === "string" && String.isEmptyOrWhiteSpaces( value ) ) {
            errors.addField( column.Property, this._error, ["{" + column.Field + "}"] );
            return false;
        }

        return validity;
    }

    /**
     * Constructor
     * @param {any} error     error code of label
     */
    constructor( error ) {
        super( error );
    }
}
