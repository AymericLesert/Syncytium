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
 * Define a list within value defined into an enumerable column value into the database
 */
List.ListEnumerable = class extends List.ListArray {
    /**
     * Factory building the enumerable value list or retrieving le enumerable value list existing
     * @param {any} table  table name
     * @param {any} column column name containing the list of values
     * @param {any} path   root path containing all pictures describing each value
     * @returns {any} an enumerable list corresponding to the given column
     */
    static Factory( table, column, path ) {
        if ( !this._cache )
            this._cache = {};

        var id = table + "." + column;
        var list = this._cache[id];
        if ( list )
            return list;

        list = new List.ListEnumerable( table, column, path );
        this._cache[id] = list;
        return list;
    }

    /**
     * @returns {string} name of the picture in case of null
     */
    get DefaultPicture() {
        return this._defaultPicture;
    }

    /**
     * Get the multilingual label corresponding to the enumerable value
     * @param {any} item enumerable value
     * @returns {any} a string or a {label, language, parameters} structure
     */
    getLanguageLabel( item ) {
        return item.Label !== undefined ? item.Label : null;
    }

    /**
     * List of enumerable values into a column
     * @param {any} table  table name
     * @param {any} column column name containing the list of values
     * @param {any} path   root path containing all pictures describing each value
     */
    constructor( table, column, path ) {
        super( DSDatabase.Instance.getEnumerable( table, column ) );

        this._table = table;
        this._column = column;
        this._path = path ? path : "";
        this._defaultPicture = null;

        let enumerableValue = DSDatabase.Instance.getEnumerable( this._table, this._column, null );
        if ( enumerableValue !== null && enumerableValue !== undefined )
            this._defaultPicture = this._path + enumerableValue.Picture;

        for ( var i in this._array )
            this._array[i].Picture = this._path + this._array[i].Picture;
    }
};
