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

/**
 * @param {any} array array to check
 * @returns {boolean} true if the array is empty
 */
Array.isEmpty = function ( array ) {
    if ( array === null || array === undefined )
        return true;

    if ( array.length === null || array.length === undefined )
        return true;

    if ( array.length > 0 )
        return false;

    for ( let i in array )
        return false;

    return true;
};

/**
 * Convert a structure into an iterable objet ... like an array
 * This function must be used within for ... of and if the list is incomplet or if the element is a structure like a cache
 * 
 * @param {any} structure item to convert
 * @yields {any} value of each element into the structure
 */
Array.toIterable = function* ( structure ) {
    if ( structure === null || structure === undefined )
        return;

    for ( let attribute in structure )
        yield structure[attribute];
};