/// <reference path="../_references.js" />

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
 * Define a list representing the history
 */
List.ListHistory = class extends List.ListArray {
    /**
     * @returns {int} Nature Create of an history
     */
    static get CREATE() {
        return 0;
    }

    /**
     * @returns {int} Nature Update of an history
     */
    static get UPDATE() {
        return 1;
    }

    /**
     * @returns {int} Nature Delete of an history
     */
    static get DELETE() {
        return 2;
    }

    /**
     * Retrieve the details of the list
     */
    get IsDetails () {
        return this._details;
    }

    /**
     * Clear the list
     */
    clear() {
        super.clear();
        this._currentId = 0;
    }

    /**
     * Add a new modification item into the list
     * @param {any} item        item added into the list
     * @param {any} description description of the change
     * @param {any} nature      nature of the change
     * @param {any} field       property of the item concerned by the changement
     * @param {any} oldValue    old value
     * @param {any} newValue    new value
     * @returns {any} new item added into the list
     */
    push ( item, description, nature, field, oldValue, newValue ) {
        var newItem = {
            Id: this._currentId++,
            UserId: item.LastModificationAuthor,
            Date: item.LastModificationDate,
            Nature: Helper.Label( nature ),
            Description: description === null || description === undefined ? "" : description,
            Field: field === null || field === undefined ? null : Helper.Label( field ),
            OldValue: oldValue === null || oldValue === undefined ? null : oldValue,
            NewValue: newValue === null || newValue === undefined ? null : newValue,
            Item: item
        };
        this._array.push( newItem );
        return newItem;
    }

    /**
     * Sort elements in reverse order
     */
    sort () {
        this._array.sort( function ( h1, h2 ) { return h1.Id > h2.Id ? -1 : h1.Id < h2.Id ? 1 : 0; } );
    }

    /**
     * Extract a text value for a field
     * @param {any} value multilingual label or string
     * @returns {string} label or the string describing the value
     */
    getValueText ( value ) {
        if ( value === null || value === undefined )
            return "";

        if ( Helper.IsLabel( value, true ) )
            return value.label;

        return value.toString();
    }

    /**
     * Enable or disable the details of the list
     * @param {any} details show the details or just a few columns
     */
    setDetails ( details ) {
        this._details = details === null || details === undefined ? true : details;
    }

    /**
     * Get the Id of the item
     * @param {any} item item of the list
     * @returns {int} Id of the item
     */
    getId ( item ) {
        return item.Id;
    }

    /**
     * Get the html content of an attribute (to show the attribute)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a HTML code describing the attribute or the value of the attribute
     */
    getAttributHTML ( item, attribute ) {
        var value = null;

        switch ( attribute ) {
            case "Id":
                return "";

            case "User":
                value = item.UserId;
                if ( value === null || value === undefined )
                    return "";

                var user = DSDatabase.Instance.getRowById( "User", value );
                if ( user === null || user === undefined )
                    return "";

                if ( String.isEmptyOrWhiteSpaces( user.Picture ) )
                    user.Picture = UserRecord.DEFAULT_PICTURE().picture;

                if ( String.isEmptyOrWhiteSpaces( user.Picture ) )
                    return "";

                return "<img class='user' src='" + user.Picture + "' />";

            default:
                return super.getAttributHTML( item, attribute );
        }
    }

    /**
     * Get the text of an attribute (to filter the value)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {string} a string representing the value of the field
     */
    getAttributText ( item, attribute ) {
        var value = null;

        switch ( attribute ) {
            case "User":
                value = item.UserId;
                if ( value === null || value === undefined )
                    return "";

                var user = DSDatabase.Instance.getRowById( "User", value );
                if ( user === null || user === undefined )
                    return "";

                return String.isEmptyOrWhiteSpaces( user.Name ) ? "" : user.Name;

            case "Date":
                value = item[attribute];
                if ( value === null || value === undefined )
                    return "";

                if ( value instanceof moment )
                    return value.format( "DD/MM/YYYY HH:mm:ss" );

                return super.getAttributText( item, attribute );

            default:
                return super.getAttributText( item, attribute );
        }
    }

    /**
     * Get the value of an attribute (to sort it)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} value of the field
     */
    getAttributValue ( item, attribute ) {
        var value = null;

        switch ( attribute ) {
            case "User":
            case "Nature":
            case "Field":
            case "Description":
                value = this.getAttributText( item, attribute );
                return value === null ? null : value.toUpperCase().trim();

            case "Date":
                return item.Id;

            default:
                return super.getAttributValue( item, attribute );
        }
    }

    /**
     * Unable to create a new history
     * @returns {any} null
     */
    newItem () {
        return null;
    }

    /**
     * @param {any} item record to check if it is visible or not
     * @returns {boolean} Indicates if the item is visible in this list or not
     */
    isVisible ( item ) {
        return this._details || item.Field === null;
    }

    /**
     * Check the validity of the item (not available)
     * @param {any} record record concerned by the check
     * @param {any} errors container of errors (not changed)
     * @param {any} force not used
     * @returns {boolean} true
     */
    checkItem ( record, errors, force ) {
        return true;
    }

    /**
     * Add a new item (not available)
     * @param {any} newItem record to add
     * @param {any} errors container of errors (not changed)
     * @returns {any} null
     */
    addItem ( newItem, errors ) {
        return null;
    }

    /**
     * Update an item (not available)
     * @param {any} id id of the record to update
     * @param {any} oldItem record to update
     * @param {any} newItem record to add
     * @param {any} errors container of errors (not changed)
     * @param {any} force not used
     * @returns {any} null
     */
    updateItem ( id, oldItem, newItem, errors, force ) {
        return null;
    }

    /**
     * Remove an item (not available)
     * @param {any} id id of the record to remove
     * @param {any} oldItem record to remove
     * @param {any} errors container of errors (not changed)
     * @returns {any} null
     */
    deleteItem ( id, oldItem, errors ) {
        return null;
    }

    /**
     * Constructor
     */
    constructor() {
        super( [] );

        this._currentId = 0;
        this._details = true;
    }
};
