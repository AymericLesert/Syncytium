﻿/// <reference path="../_references.js" />

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

Filter.FilterItems = class {
    /**
     * Update the list of values of this filter
     * @param {any} value value to filter or a list of values
     * @returns {boolean} true if the filter has a new value
     */
    setValue( value ) {
        let newValues = [];
                    newValues.push( currentValue );
                }
            newValues.sort( function ( e1, e2 ) { return e1 < e2 ? -1 : e1 > e2 ? 1 : 0; } );
        } else if ( !String.isEmptyOrWhiteSpaces( value ) && !isNaN( String.parseInt( value ) ) ) {
        }
            if ( i === newValues.length )
                return false;
        }

    /**
     * @returns {any} array of items included into the filter
     */
    getValue() {
        return this._values;
    }

    /**
     * Check if the item matches within one of the values
     * @param {any} value value to check
     * @returns {boolean} true if the item corresponds to one of the value
     */
    match( value ) {
        if ( this._values.length === 0 )
            return true;
        
        return this._values.indexOf( value ) >= 0;
    }

    /**
     * Empty constructor
     */
    constructor() {
        this._values = [];
    }
};