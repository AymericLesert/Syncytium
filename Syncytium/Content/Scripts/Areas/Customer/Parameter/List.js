/// <reference path="../../../_references.js" />
/// <reference path="Enum.js" />

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
 * Handling a list of parameters
 */
ParameterRecord.List = class extends List.ListRecord {
    /**
     * Get the text value of the item
     * @param {any} item record containing the label to retrieve
     * @returns {any} a string
     */
    getText( item ) {
        return item === null || item === undefined ? "" : item.Cle;
    }

    /**
     * Check the validity of the item
     * @param {any} item   record to check
     * @param {any} errors container of errors after checking
     * @param {any} force  true if the first step (warning is validated by the user)
     * @returns {any} null
     */
    checkItem( item, errors, force ) {
        let maxLines = null;
        let result = super.checkItem( item, errors, force );

        if ( Helper.IsLabel( result ) )
            return result;

        if ( errors.HasError )
            return errors;

        // Check format value of parameters

        switch ( item.Cle ) {
            case "MyValue":
                if ( isNaN( String.parseInt( item.Value ) ) || String.parseInt( item.Value ) <= 0 )
                    errors.addField( "Value", "ERR_PARAMETER_INTEGER", [item.Value] );
                break;

            default:
                break;
        }

        return result;
    }

    /**
     * False if the field can be updated in a dialog box
     * @param {any} box      reference on the dialog box
     * @param {any} attribute column / property
     * @param {any} user     current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the field can't be updated by the current user
     */
    isBoxFieldReadonly( box, attribute, user, item ) {
        if ( super.isBoxFieldReadonly( box, attribute, user, item) )
            return true;

        if ( attribute === "Key" ||
            attribute === "Description" )
            return true;

        return false;
    }

    /**
     * Notify the beginning of importing data from a file
     * @param {CSV} csv CSV file to import
     * @param {Errors} errors update the errors component if an abnormal situation is identified
     * @returns {boolean} true if the importing data from a file can start
     */
    startCSV( csv, errors ) {
        // Check the existing header before running the loading

        if ( !csv.hasHeader( "Key" ) )
            errors.addGlobal( "ERR_CSV_HEADER_MISSING", "Key" );

        if ( !csv.hasHeader( "Description" ) )
            errors.addGlobal( "ERR_CSV_HEADER_MISSING", "Description" );

        if ( !csv.hasHeader( "Value" ) )
            errors.addGlobal( "ERR_CSV_HEADER_MISSING", "Value" );

        if ( errors.HasError )
            return false;

        // Check if the CSV can be loaded

        return super.startCSV( csv, errors );
    }

    /**
     * Set in a record the value from 
     * @param {CSV} csv CSV file to import
     * @param {any} item record to complete within information from columns
     * @param {Array} columnsByOrder array of values by position into the CSV file
     * @param {Array} columnsByName map of values by the header name (first line of the CSV file)
     * @param {Errors} errors update the errors component if an abnormal situation is identified
     * @returns {any} record updated or null if the record must be ignored
     */
    getMappingRecordFromCSV( csv, item, columnsByOrder, columnsByName, errors ) {
        // Copy value from columns to the record

        item.Key = columnsByName.Key;
        item.Description = columnsByName.Description;
        item.Value = columnsByName.Value;

        return item;
    }

    /**
     * Constructor
     * @param {any} allRecords true : take into account the Enable property
     */
    constructor( allRecords ) {
        super( "Parameter", allRecords );
    }
};