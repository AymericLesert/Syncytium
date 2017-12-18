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
 * Unique constraint (see DSUniqueAttribute.cs)
 */
class DSUniqueAttribute extends DSConstraintAttribute {
    /**
     * @returns {string} "Unique"
     */
    get Type() {
        return "Unique";
    }

    /**
     * Set the field name (at the first element into the list of fields)
     * @param {any} name name to add into the list of fields
     */
    addField ( name ) {
        this._fields = [name].concat( this._fields );
    }

    /**
     * @returns {string} field name of the unique attribute
     */
    get FieldName() {
        return this._fields[0];
    }

    /**
     * @returns {string} string describing the list of fields included into the unique column
     */
    get FieldNames() {
        return String.JSONStringify( this._fields );
    }

    /**
     * Get the key value of the value
     * @param {any} record record to read
     * @returns {string} value extracted from the record
     */
    getValue ( record ) {
        var value = record[this._fields[0]];
        if ( value === null || value === undefined )
            return null;

        var valueToSearch = this._caseSensitive ? value.toString() : value.toUpperCase();
        if ( valueToSearch === undefined || valueToSearch === null )
            return null;

        if ( this._fields.length > 1 ) {
            var values = [valueToSearch];
            for ( var i = 1; i < this._fields.length; i++ )
                values.push( record[this._fields[i]] );
            valueToSearch = String.JSONStringify( values );
        }

        return valueToSearch;
    }

    /**
     * Add a value into the unique table
     * @param {any} record record to add
     */
    addValue ( record ) {
        var valueToSearch = this.getValue( record );
        if ( valueToSearch === null || id < 0 )
            return;

        var id = record.Id;
        if ( id === undefined || id === null || id < 0 )
            return;

        if ( this._values[valueToSearch] === undefined )
            this._values[valueToSearch] = [];

        this._values[valueToSearch].push( id );
    }

    /**
     * Check if the value already exists for another id
     * @param {any} record record to read
     * @returns {boolean} true if the value already exists
     */
    existValue ( record ) {
        var valueToSearch = this.getValue( record );
        if ( valueToSearch === null || this._values[valueToSearch] === undefined )
            return false;

        var id = record.Id;
        if ( id === undefined || id === null || id < 0 )
            return true;

        var values = this._values[valueToSearch];
        if ( values === null || values === undefined )
            return false;

        if ( values.indexOf( id ) >= 0 )
            return false;

        return values.length > 0;
    }

    /**
     * Remove a value from the unique table
     * @param {any} record record to remove
     */
    deleteValue ( record ) {
        var valueToSearch = this.getValue( record );
        if ( valueToSearch === null )
            return;

        var id = record.Id;
        if ( id === undefined || id === null || id < 0 )
            return;

        var values = this._values[valueToSearch];
        if ( values === null || values === undefined )
            return;

        var index = values.indexOf( id );
        if ( index < 0 )
            return;

        values.splice( index, 1 );
        if ( values.length === 0 )
            delete this._values[valueToSearch];
    }

    /**
     * Convert this element to a string
     * @returns {string} a string containing all values saved into this unique key values
     */
    toListValues () {
        return String.JSONStringify( this._values );
    }

    /**
     * Constructor
     * @param {any} error         error code of the label
     * @param {any} caseSensitive true if the value must be case sensitive
     * @param {any} fields        list of fields grouped to check the unicity value
     */
    constructor( error, caseSensitive, fields ) {
        super( error );

        // By value, set an array of Id

        this._caseSensitive = caseSensitive === "True";
        this._values = {};
        this._fields = fields === null || fields === undefined ? [] : fields;
    }
}
