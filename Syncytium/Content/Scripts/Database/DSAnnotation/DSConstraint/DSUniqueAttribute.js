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
 * Unique constraint (see DSUniqueAttribute.cs)
 */
class DSUniqueAttribute extends DSIndexAttribute {
    /**
     * @returns {string} "Unique"
     */
    get Type() {
        return "Unique";
    }

    /**
     * Constructor
     * @param {any} error         error code of the label
     * @param {any} caseSensitive true if the value must be case sensitive
     * @param {any} fields        list of fields grouped to check the unicity value
     */
    constructor( error, caseSensitive, fields ) {
        super( error, caseSensitive, fields );
    }
}
