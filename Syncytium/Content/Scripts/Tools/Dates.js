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
 * Handle checking dates
 */
class Dates {
    /**
     * Check if the list of fields having date as type is really date and if the order is respected
     * @param {any} table  table name
     * @param {any} record current record to check
     * @param {any} fields list of fields
     * @param {any} checkNow true if the dates mustn't exceed now
     * @param {Errors} errors list of errors identified by this function
     */
    static Check ( table, record, fields, checkNow, errors ) {
        var field = null;
        var definedFields = [];
        var nowFields = [];
        var now = new moment();

        // Check if the field is defined

        for ( field in fields ) {
            if ( fields[field] === null || fields[field] === undefined )
                continue;

            if ( record[fields[field]] === null ||
                record[fields[field]] === undefined ||
                !record[fields[field]] instanceof moment ) {
                errors.addField( fields[field], "ERR_FIELD_REQUIRED", ["{" + table.toUpperCase() + "_" + fields[field].toUpperCase() + "}"] );
                continue;
            }

            definedFields.push( fields[field] );
        }

        // Check if the date is before now

        for ( field in definedFields ) {
            if ( checkNow && record[definedFields[field]] > now ) {
                errors.addField( definedFields[field], "ERR_" + table.toUpperCase() + "_DATE", ["{" + table.toUpperCase() + "_" + definedFields[field].toUpperCase() + "}", "{" + table.toUpperCase() + "_NOW}"] );
                continue;
            }

            nowFields.push( definedFields[field] );
        }

        // Check the chronology

        for ( var i = 0; i < nowFields.length - 1; i++ ) {
            for ( var j = i + 1; j < nowFields.length; j++ ) {
                if ( record[nowFields[i]] > record[nowFields[j]] )
                    errors.addField( nowFields[i], "ERR_" + table.toUpperCase() + "_DATE", ["{" + table.toUpperCase() + "_" + nowFields[i].toUpperCase() + "}", "{" + table.toUpperCase() + "_" + nowFields[j].toUpperCase() + "}"] );
            }
        }
    }

    /**
     * Compare 2 dates
     * @param {any} date1 date to compare
     * @param {any} date2 date to compare
     * @returns {int} -1, 0 or 1 on depends on the order
     */
    static Compare ( date1, date2 ) {
        if ( ( date1 === null || date1 === undefined ) &&
            ( date2 === null || date2 === undefined ) )
            return 0;

        if ( date1 === null || date1 === undefined )
            return 1;

        if ( date2 === null || date2 === undefined )
            return -1;

        return date1 < date2 ? -1 : date1 > date2 ? 1 : 0;
    }

    /**
     * Check if the attribute (status attached to a date) is visible into the list of paths
     * @param {any} attribute status attached to a date
     * @param {any} item record to check
     * @param {any} paths list of paths to take into account
     * @returns {boolean} true if the attribute is visible or not
     */
    static isDateVisible( attribute, item, paths ) {
        let i = 0, j = 0;

        if ( paths === null || paths===undefined || paths.length === null || paths.length === undefined || paths.length === 0 )
            return false;

        // Is the attribute into all paths ?

        for ( i = 0; i < paths.length && paths[i].indexOf( attribute ) >= 0; i++ );

        if ( i === paths.length )
            return true;

        if ( paths.length === 1 )
            return false;

        // Does a path exist such as all previous nodes are visible ?

        for ( i = 0; i < paths.length; i++ ) {
            let index = paths[i].indexOf( attribute );
            if ( index < 0 )
                continue;

            for ( j = index - 1; j >= 0 && Dates.isDateVisible( paths[i][j], item, paths ); j-- );

            if ( j < 0 && item[attribute] !== null && item[attribute] !== undefined )
                return true;
        }

        // Check if the attribute is into the shortest path ?

        let minPath = 0;
        for ( i = 1; i < paths.length; i++ ) {
            if ( paths[i].length < paths[minPath].length )
                minPath = i;
        }

        return paths[minPath].indexOf( attribute ) >= 0;
    }

    /**
     * Retrieve the longest path of status dates visible
     * @param {any} item record to check
     * @param {any} paths list of paths to take into account
     * @returns {any} the longest visible path
     */
    static getLongestPath( item, paths ) {
        if ( paths === null || paths === undefined || paths.length === null || paths.length === undefined || paths.length === 0 )
            return [];

        if ( paths.length === 1 )
            return paths[0];

        let nbVisibleItems = 0;
        for ( let i = 0; i < paths[0].length; i++ ) {
            if ( Dates.isDateVisible( paths[0][i], item, paths ) )
                nbVisibleItems++;
        }

        let maxPath = 0;
        for ( let i = 1; i < paths.length; i++ ) {
            if ( nbVisibleItems >= paths[i].length )
                continue;

            let currentNbVisibleItems = 0;

            for ( let j = 0; j < paths[i].length; j++ ) {
                if ( Dates.isDateVisible( paths[i][j], item, paths ) )
                    currentNbVisibleItems++;
            }

            if ( nbVisibleItems < currentNbVisibleItems ) {
                maxPath = i;
                nbVisibleItems = currentNbVisibleItems;
            }
        }

        return paths[maxPath];
    }
}
