/// <reference path="../_references.js" />

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

var Filter = {};

/**
 * Filter manager
 */
Filter.Filter = class {
    /**
     * @param {string} name name of the filter
     * @returns {any} list of filters properties
     */
    getField( name ) {
        if ( this._filters[name] === undefined || this._filters[name] === null )
            return null;

        return this._filters[name];
    }

    /**
     * @param {string} name name of the filter
     * @param {any} value value of the filter
     * @returns {any} list of filters properties
     */
    setField( name, value ) {
        this._filters[name] = value;
    }

    /**
     * Constructor of the singleton
     */
    constructor() {
        this._filters = {};
    }

    /**
     * @returns {Filter} the instance of the singleton
     */
    static get Instance() {
        if ( !this._instance )
            this._instance = new Filter.Filter();

        return this._instance;
    }
};
