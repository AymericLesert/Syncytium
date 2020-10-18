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
 * Index constraint (see DSIndexAttribute.cs)
 */
class DSIndexAttribute extends DSConstraintAttribute {
    /**
     * @returns {string} "Unique"
     */
    get Type() {
        return "Index";
    }

    /**
     * @returns {array} Retrieve the list of fields indexed
     */
    get Fields() {
        return this._fields;
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
     * Set the field name (at the first element into the list of fields)
     * @param {any} name name to add into the list of fields
     */
    addField( name ) {
        this._fields = [name].concat( this._fields );
    }

    /**
     * Build the list of columns into a row from DB
     * @param {any} columnsByName list of columns included into the table get by name
     */
    addIndexFields( columnsByName ) {
        this._indexFields = [];
        for ( let name of this._fields )
            this._indexFields.push( columnsByName[name] );
    }

    /**
     * Get the key value of the value
     * @param {any} record record to read
     * @returns {string} value extracted from the record
     */
    getValue( record ) {
        let key = undefined;
        let keyArrays = undefined;

        for ( let attr of Array.toIterable( this._fields ) ) {
            let value = record[attr];
            if ( value === null || value === undefined )
                value = null;

            if ( value !== null )
                value = this._caseSensitive ? value.toString() : value.toString().toUpperCase();

            if ( key === undefined ) {
                key = value;
            } else if ( keyArrays === undefined ) {
                keyArrays = [key, value];
            } else {
                keyArrays.push( value );
            }
        }

        return keyArrays !== undefined ? keyArrays : key;
    }

    /**
     * Check if keys match within the index (all attributes must be into index)
     * @param {any} keys structure containing the list of keys
     * @returns {boolean} true if keys are all referenced
     */
    match( keys ) {
        if ( keys === null || keys === undefined )
            return false;

        for ( let field of this._fields )
            if ( keys[field] === undefined )
                return false;

        return true;
    }

    /**
     * Check if 2 rows are the same keys or not
     * @param {any} row1
     * @param {any} row2
     * @returns {boolean} true if row1 and row2 doesn't change the key references
     */
    isEqual( row1, row2 ) {
        for ( let columnId of this._indexFields )
            if ( row1[columnId] !== row2[columnId] )
                return false;

        return true;
    }

    /**
     * Retrieve the list of Ids representing the item 
     * @param {any} keys structure containing the list of keys
     * @returns {Array} list of ids or empty
     */
    getIds( keys ) {
        let valueToSearch = this.getValue( keys );
        if ( valueToSearch === null )
            return [];

        let ids = this._values[valueToSearch];
        return ids === undefined ? [] : ids;
    }

    /**
     * Retrieve the list of different values of this index
     * @returns {Array} list of different values
     */
    getValues() {
        let values = [];
        for ( let value in this._values )
            values.push( value );
        return values;
    }

    /**
     * Add a value into the unique table
     * @param {any} record record to add
     */
    addValue ( record ) {
        let valueToSearch = this.getValue( record );
        if ( valueToSearch === null )
            return;

        let id = record.Id;
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
        let valueToSearch = this.getValue( record );
        if ( valueToSearch === null || this._values[valueToSearch] === undefined )
            return false;

        let id = record.Id;
        if ( id === undefined || id === null || id < 0 )
            return true;

        let values = this._values[valueToSearch];
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
        let valueToSearch = this.getValue( record );
        if ( valueToSearch === null )
            return;

        let id = record.Id;
        if ( id === undefined || id === null || id < 0 )
            return;

        let values = this._values[valueToSearch];
        if ( values === null || values === undefined )
            return;

        let index = values.indexOf( id );
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
        this._indexFields = [];
    }
}
