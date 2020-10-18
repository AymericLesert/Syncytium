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
 * Class describing the conversion of a sequence (see DSSequenceAttribute.cs)
 */
class DSSequenceAttribute extends DSFormatAttribute {
    /**
     * @returns {string} "Sequence"
     */
    get Type() {
        return "Sequence";
    }

    /**
     * @returns {string} key of the sequence
     */
    get Key() {
        return this._key;
    }

    /**
     * @returns {number} number of digits of the sequence
     */
    get Length() {
        return this._length;
    }

    /**
     * Constructor
     * @param {any} mask mask to apply
     */
    constructor( key, length ) {
        super();

        this._key = key;
        this._length = length;
    }
}
