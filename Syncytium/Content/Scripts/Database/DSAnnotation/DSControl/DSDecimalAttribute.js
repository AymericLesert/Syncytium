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
 * Master class of the control property (see DSControlAttribute.cs)
 */
class DSDecimalAttribute extends DSControlAttribute {
    /**
     * @returns {string} "Decimal"
     */
    get Type() {
        return "Decimal";
    }

    /**
     * @returns {number} number of digits before coma
     */
    get NbDigitsBefore() {
        return this._digit - this._precision;
    }

    /**
     * @returns {number} number of digits after coma
     */
    get NbDigitsAfter() {
        return this._precision;
    }

    /**
     * @returns {string} unit of the value
     */
    get Unit() {
        return this._unit;
    }

    /**
     * Check the validity of the value
     * @param {DSColumn} column column of the table
     * @param {any} value  value to check
     * @param {any} errors list of errors to update
     * @returns {boolean} true if the value is valid
     */
    check( column, value, errors ) {
        let valueToCheck = 0;
        let validity = super.check( column, value, errors );

        if ( value === null || value === undefined )
            return validity;

        switch ( typeof value ) {
            case "string":
                valueToCheck = String.parseFloat( value );
                break;
            case "number":
                valueToCheck = value;
                break;
            case "boolean":
                valueToCheck = value ? 1 : 0;
                break;
            default:
                errors.addField( column.Property, this._error, ["{" + column.Field + "}", this._digit.toString(), this._precision.toString(), value.toString()] );
                return false;
        }

        if ( isNaN( valueToCheck ) ) {
            errors.addField( column.Property, this._error, ["{" + column.Field + "}", this._digit.toString(), this._precision.toString(), value.toString()] );
            return false;
        }

        if ( valueToCheck >= this._maxValue || valueToCheck <= this._minValue ) {
            errors.addField( column.Property, this._error, ["{" + column.Field + "}", this._digit.toString(), this._precision.toString(), value.toString()] );
            return false;
        }

        if ( String.parseFloat( valueToCheck.toFixed( 8 ) ) !== String.parseFloat( valueToCheck.toFixed( this._precision ) ) ) {
            errors.addField( column.Property, this._error, ["{" + column.Field + "}", this._digit.toString(), this._precision.toString(), value.toString()] );
            return false;
        }

        return validity;
    }

    /**
     * Constructor
     * @param {any} error     error code of label
     * @param {any} digit     number of digits
     * @param {any} precision number of digits before the decimal separator
     * @param {any} unit      string describing the type of value
     */
    constructor( error, digit, precision, unit ) {
        super( error );

        this._digit = digit;
        this._precision = precision;
        this._unit = String.isEmptyOrWhiteSpaces(unit) ? null : String.decode(unit);

        this._maxValue = this._digit <= 0 ? 1 : 10;
        for ( let i = precision + 1; i < this._digit; i++ )
            this._maxValue *= 10;
        this._minValue = -this._maxValue;
    }
}
