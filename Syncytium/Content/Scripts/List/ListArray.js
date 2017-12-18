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
 * Define a list within value defined into an array
 */
List.ListArray = class extends List.List {  
    /**
     * @returns {any} list of items
     */
    get Array() {
        return this._array;
    }

    /**
     * Get a multilingual label describing the item
     * @param {any} item record containing the label to retrieve
     * @returns {any} a string or a {label, language, parameters} structure
     */
    getLanguageLabel( item ) {
        if ( typeof item === "object" )
            return item.Label !== undefined ? item.Label : null;

        return null;
    }

    /**
     * Get the text value of the item
     * @param {any} item record containing the label to retrieve
     * @returns {any} a string
     */
    getText ( item ) {
        if ( typeof item === "string" || typeof item === "number" || typeof item === "boolean" )
            return item.toString().trim();

        return item.Text !== undefined ? item.Text : null;
    }

    /**
     * Clear the list
     */
    clear() {
        super.clear();

        if ( this._array !== null ) {
            let ids = [];

            for ( let id in this._array )
                ids.push( id );

            for ( let i = 0; i < ids.length; i++ )
                delete this._array[ids[i]];

            this._array.length = 0;
        } else {
            this._array = [];
        }
    }

    /**
     * @returns {any} list of values
     */
    getList() {
        return this._array;
    }

    /**
     * Constructor
     * @param {any} array array of items
     */
    constructor( array ) {
        super();

        this._array = array;
    }
};
