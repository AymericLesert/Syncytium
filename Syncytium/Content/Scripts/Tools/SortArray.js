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

class SortArray {
    /**
     * Look for the index of the item corresponding to the record
     * @param {any} arr array of items
     * @param {any} record record to look for
     * @param {any} predicate function to call to compare items
     * @returns {any} { index, newIndex } index of the record to look for
     */
    static find( arr, record, predicate ) {
        let value = null;
        let result = null;

        switch ( arr.length ) {
            case 0:
                return { index: 0, newIndex: true };

            case 1:
                value = predicate( arr[0], record );

                if ( value < 0 )
                    return { index: 1, newIndex: true };

                if ( value > 0 )
                    return { index: 0, newIndex: true };

                return { index: 0, newIndex: false };
        }

        let i = 0;
        let j = arr.length - 1;

        value = predicate( arr[i], record );
        if ( value > 0 )
            return { index: i, newIndex: true };

        if ( value === 0 )
            return { index: i, newIndex: false };

        value = predicate( arr[j], record );
        if ( value < 0 )
            return { index: j + 1, newIndex: true };

        if ( value === 0 )
            return { index: j, newIndex: false };

        let k = Math.floor(( i + j ) / 2 );

        while ( k !== i && k !== j ) {
            value = predicate( arr[k], record );
            if ( value === 0 )
                return { index: k, newIndex: false };

            if ( value < 0 )
                i = k;
            else
                j = k;

            k = Math.floor(( i + j ) / 2 );
        }

        return { index: i+1, newIndex: true };
    }
}
