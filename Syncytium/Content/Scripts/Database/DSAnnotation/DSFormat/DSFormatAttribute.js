﻿/// <reference path="../../../_references.js" />

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
 * Master class of the format property (see DSFormatAttribute.cs)
 */
class DSFormatAttribute extends DSAnnotationAttribute {
    /**
     * @returns {string} "Format"
     */
    get Type() {
        return "Format";
    }

    /**
     * Convert a given value into a value matching within the expected type of the column
     * Network -> Record
     * @param {any} value value to convert
     * @returns {any} value
     */
    convertFromJSON ( value ) {
        return value;
    }

    /**
     * Convert a given value from a record to another type
     * Record -> Network
     * @param {any} value value to convert
     * @returns {any} value
     */
    convertToJSON ( value ) {
        return value;
    }

    /**
     * Constructor
     */
    constructor() {
        super();
    }
}
