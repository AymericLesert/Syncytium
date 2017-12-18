/// <reference path="../../_references.js" />

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
 * Handling some features on a record
 */
class DSRecord {
    /**
     * Clone a record
     * @param {any} record record to clone
     * @param {any} withAssociation clone also all sublists (composition or not)
     * @returns {any} record cloned (this record can be changed without modifying the original record)
     */
    static Clone( record, withAssociation ) {
        if ( record === undefined || record === null )
            return null;

        withAssociation = withAssociation !== null && withAssociation !== undefined && withAssociation === true;

        var newRecord = {};

        for ( var attr in record ) {
            if ( attr === "_subLists" || attr === "_parent" || attr === "_list" )
                continue;

            var value = record[attr];

            if ( value === undefined )
                value = null;

            if ( value === null ) {
                newRecord[attr] = null;
                continue;
            }

            if ( typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "function" ) {
                newRecord[attr] = value;
                continue;
            }

            if ( value instanceof Date ) {
                newRecord[attr] = new Date( value );
                continue;
            }

            if ( value instanceof moment ) {
                newRecord[attr] = new moment( value );
                continue;
            }

            if ( Array.isArray( value ) ) {
                newRecord[attr] = [];
                for ( var i in value )
                    newRecord[attr][i] = DSRecord.Clone( value[i], withAssociation );
                continue;
            }

            newRecord[attr] = DSRecord.Clone( value, withAssociation );
        }

        if ( record._list !== null && record._list !== undefined )
            newRecord._list = record._list;

        if ( record._parent !== null && record._parent !== undefined )
            newRecord._parent = record._parent;

        if ( record._subLists === null || record._subLists === undefined )
            return newRecord;

        // Clone the list of values ... if the sub list is a composition

        newRecord = List.ListRecord.SetListValues( record._subLists, newRecord );

        for ( var subListId in newRecord._subLists ) {
            var subList = newRecord._subLists[subListId];
            if ( subList === null || subList === undefined || !subList.composition && !withAssociation )
                continue;

            let listToClone = record[subListId];

            subList.values = [];
            for ( let i in listToClone ) {
                var newItem = DSRecord.Clone( listToClone[i], withAssociation );
                if ( newItem === null || newItem === undefined )
                    continue;

                newItem._parent = newRecord;
                newItem._list = subList;
                subList.values[i] = newItem;
            }
        }

        return newRecord;
    }

    /**
     * Check if 2 records are equals
     * @param {any} record1 first record
     * @param {any} record2 second record
     * @returns {boolean} true if the 2 records are identical (internal properties are not checked - recursive function)
     */
    static IsEqual ( record1, record2 ) {
        var attr = null;

        if ( ( record1 === undefined || record1 === null ) &&
            ( record2 === undefined || record2 === null ) )
            return true;

        if ( record1 === undefined || record1 === null ||
            record2 === undefined || record2 === null )
            return false;

        for ( attr in record1 ) {
            if ( attr.startsWith( "_" ) )
                continue;

            if ( !record2.hasOwnProperty( attr ) )
                return false;
        }

        for ( attr in record2 ) {
            if ( attr.startsWith( "_" ) )
                continue;

            if ( !record1.hasOwnProperty( attr ) )
                return false;
        }

        for ( attr in record1 ) {
            if ( attr.startsWith( "_" ) )
                continue;

            var value1 = record1[attr];
            var value2 = record2[attr];

            if ( value1 === undefined || String.isEmptyOrWhiteSpaces( value1 ) )
                value1 = null;

            if ( value2 === undefined || String.isEmptyOrWhiteSpaces( value2 ) )
                value2 = null;

            if ( value1 === null && value2 === null )
                continue;

            if ( value1 === null || value2 === null )
                return false;

            if ( typeof value1 === "string" || typeof value1 === "number" || typeof value1 === "boolean" || typeof value === "function" ) {
                if ( value1 !== value2 )
                    return false;

                continue;
            }

            if ( value1 instanceof Date && value2 instanceof Date ) {
                if ( value1.toString() !== value2.toString() )
                    return false;

                continue;
            } else if ( value1 instanceof Date || value2 instanceof Date ) {
                return false;
            }

            if ( value1 instanceof moment && value2 instanceof moment ) {
                if ( Dates.Compare(value1, value2) !== 0 )
                    return false;

                continue;
            } else if ( value1 instanceof moment || value2 instanceof moment ) {
                return false;
            }

            if ( Array.isArray( value1 ) && Array.isArray( value2 ) ) {
                if ( value1.length !== value2.length )
                    return false;

                for ( var i in value1 )
                    if ( !DSRecord.IsEqual( value1[i], value2[i] ) )
                        return false;

                continue;
            } else if ( Array.isArray( value1 ) || Array.isArray( value2 ) ) {
                return false;
            }

            if ( !DSRecord.IsEqual( value1, value2 ) )
                return false;
        }

        // Check if the sub lists are equals

        if ( ( record1._subLists === null || record1._subLists === undefined ) && ( record2._subLists === null || record2._subLists === undefined ))
            return true;

        if ( ( record1._subLists === null || record1._subLists === undefined ) && !( record2._subLists === null || record2._subLists === undefined ) )
            return false;

        if ( !( record1._subLists === null || record1._subLists === undefined ) && ( record2._subLists === null || record2._subLists === undefined ) )
            return false;

        // Check if the list of items into the list are equals

        for ( attr in record1._subLists ) {
            if ( !( record1._subLists[attr] === null || record1._subLists[attr] === undefined ) && ( record2._subLists[attr] === null || record2._subLists[attr] === undefined ) )
                return false;

            if ( ( record1._subLists[attr] === null || record1._subLists[attr] === undefined ) && !( record2._subLists[attr] === null || record2._subLists[attr] === undefined ) )
                return false;
        }

        for ( attr in record2._subLists ) {
            if ( !( record1._subLists[attr] === null || record1._subLists[attr] === undefined ) && ( record2._subLists[attr] === null || record2._subLists[attr] === undefined ) )
                return false;

            if ( ( record1._subLists[attr] === null || record1._subLists[attr] === undefined ) && !( record2._subLists[attr] === null || record2._subLists[attr] === undefined ) )
                return false;
        }

        for ( attr in record1._subLists ) {
            if ( record1._subLists[attr].composition !== record2._subLists[attr].composition )
                return false;

            if ( !record1._subLists[attr].composition )
                continue;

            let list1 = record1[attr];
            let list2 = record2[attr];

            if ( !DSRecord.IsEqual( list1, list2 ) )
                return false;
        }

        return true;
    }
}
