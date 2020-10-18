/// <reference path="../../_references.js" />

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
 * Class handling a board of Global parameters
 */
GUI.Board.BoardImport = class extends GUI.Board.Board {
    /**
     * Load the content of the file included into the field into a table and update database
     * @param {string} name identifier of the current import
     * @param {string} table table name to update
     * @param {any} frequency frequency to refresh screen
     * @param {array} files list of files completing the main file
     */
    importFileIntoTable( name, table, frequency, files ) {
        function handleCloseCSV( board, list, csv, deleteAll, errors ) {
            return async function () {
                GUI.Box.Progress.Stop( true );

                if ( errors.HasError ) {
                    board.error( "Data not imported into the table '" + table + "' due to " + errors.toString() );
                    await list.rollbackAsync().then( () => { GUI.Box.Message.Error( "TITLE_IMPORT", errors ); } );
                } else {
                    board.info( csv.RowAdded + " data added, " + csv.RowUpdated + " data updated and " + csv.RowDeleted + " data deleted into the table '" + table + "' ..." );
                    await list.commitAsync().then( () => { GUI.Box.Message.Information( Helper.Label( "MSG_IMPORT_IMPORTED", [csv.RowAdded, csv.RowUpdated, deleteAll ? csv.RowDeleted : 0, table] ) ); } );
                }
            };
        }

        function handleImport( board, list, csv, deleteAll, filesCSV ) {
            return async function () {
                let errors = new Errors();

                await GUI.Box.Progress.Thread( csv.toList( list,
                    errors,
                    Helper.Label( "MSG_IMPORT_PRELOADING", table ),
                    Helper.Label( "MSG_IMPORT_CHECKING", table ),
                    Helper.Label( "MSG_IMPORT_IMPORTING", table ),
                    Helper.Label( "MSG_IMPORT_DELETING", table ),
                    false, true,
                    deleteAll, filesCSV ), frequency ).then( handleCloseCSV( board, list, csv, deleteAll, errors ) );
            };
        }

        function handleImportFiles( board, list, csv, deleteAll ) {
            return async function ( filesCSV ) {
                let errors = new Errors();

                // Duplicate csv file to set the name and to parse it

                board.info( "Importing data into the table '" + table + "' ..." );
                if ( Array.isArray( filesCSV ) ) {
                    for ( let fileCSV of filesCSV ) {
                        board.info( "Completing data within the file '" + fileCSV.name + "' ..." );
                    }
                }

                // Check the content of the CSV file and notify the errors ...

                await GUI.Box.Progress.Thread( csv.toList( list,
                    errors,
                    Helper.Label( "MSG_IMPORT_PRELOADING", table ),
                    Helper.Label( "MSG_IMPORT_CHECKING", table ),
                    Helper.Label( "MSG_IMPORT_IMPORTING", table ),
                    Helper.Label( "MSG_IMPORT_DELETING", table ),
                    true, false,
                    deleteAll, filesCSV ), frequency ).then( () => {
                        GUI.Box.Progress.Stop( true );

                        if ( errors.HasError ) {
                            board.error( "Data not imported into the table '" + table + "' due to " + errors.toString() );
                            GUI.Box.Message.Error( "TITLE_IMPORT", errors );
                        } else {
                            // Ask the confirmation of importing data

                            if ( csv.RowAdded === 0 && csv.RowUpdated === 0 && ( csv.RowDeleted === 0 || !deleteAll ) )
                                GUI.Box.Message.Message( "TITLE_IMPORT", Helper.Label( "MSG_CSV_IMPORTING_NONE", board._fieldFile.Filename ) );
                            else if ( deleteAll )
                                GUI.Box.Message.Message( "TITLE_IMPORT", Helper.Label( "MSG_CSV_IMPORTING_ALL", [csv.RowAdded, csv.RowUpdated, csv.RowDeleted, board._fieldFile.Filename] ), handleImport( board, list, csv, deleteAll, filesCSV ) );
                            else
                                GUI.Box.Message.Message( "TITLE_IMPORT", Helper.Label( "MSG_CSV_IMPORTING", [csv.RowAdded, csv.RowUpdated, board._fieldFile.Filename] ), handleImport( board, list, csv, deleteAll, filesCSV ) );
                        }
                    } );
            };
        }

        // Check if the current file is a CSV file

        let fileCSV = this._fieldFile.File;
        let deleteAll = this._fieldAll.Value;
        let list = List.ListRecord.CACHE_LIST( table );

        if ( !( fileCSV instanceof CSV) ) {
            GUI.Box.Message.Error( "ERROR", "ERR_FILE_MISSING" );
            return;
        }

        // check if the process must read a list of files and not only one file

        if ( !Array.isArray( files ) || Array.isEmpty( files ) ) {
            handleImportFiles( this, list, fileCSV.copy( name ), deleteAll )( files );
            return;
        }

        // show a dialog box to select all other files

        this.info( "Selecting " + files.length + " files before importing data into the table '" + table + "' ..." );

        GUI.Box.BoxInputFilesCSV.Open( "CSV_SELECT_FILES", null, files, handleImportFiles( this, list, fileCSV.copy( name ), deleteAll ) );
    }

    /**
     * Add a new button into the importation board
     * @param {string} name identifier of the import CSV
     * @param {string} table table name of the target
     * @param {string} label label of the importation feature
     * @param {array} files list of files completing the main file
     * @returns {GUI.Button.Button} a button added to the board
     */
    declareImportationRecord( name, table, label, frequency, files ) {
        function handleClick( board, name, table, frequency, files ) {
            return function () {
                board.importFileIntoTable( name, table, frequency, files );            
            };
        }

        this.debug( "Declare the importation record '" + table + "', '" + String.JSONStringify( label ) + "' (" + name + ")" );
        let newButton = new GUI.Button.Button( this.Component.find( "> .table > .buttons" ), name, null, label, handleClick( this, name, table, frequency, files) );
        this._buttons[newButton.Name] = newButton;
        return newButton;
    }

    /**
     * @param {any} container reference on the container having the webix component
     * @returns {any} Webix object representing the table
     */
    drawWebix( container ) {
        container.append( "<div class='fields'></div><div class='buttons'></div>" );

        this._fieldFile = new GUI.Field.FieldFileCSV( container.find( "> .fields" ), "file", null );
        this._fieldAll = new GUI.Field.FieldCheckBox( container.find( "> .fields" ), "all", "BTN_DELETE_ALL_LINES" );
        this._fieldAll.AllowNullValue = false;
        this._fieldAll.Value = false;

        return null;
    }

    /**
     * Virtual method to refresh the content of the box
     */
    refresh() {
        super.refresh();

        this._fieldFile.refresh();
        this._fieldAll.refresh();

        for ( let button of Array.toIterable( this._buttons ) )
            button.refresh();
    }

    /**
     * Virtual method called on openning the box
     */
    onOpen() {
        super.onOpen();

        this._fieldFile.onOpen();
        this._fieldAll.onOpen();

        for ( let button of Array.toIterable( this._buttons ) )
            button.onOpen();
    }

    /**
     * Virtual method called on closing the box
     */
    onClose() {
        this._fieldFile.onClose();
        this._fieldAll.onClose();

        for ( let button of Array.toIterable( this._buttons ) )
            button.onClose();

        super.onClose();
    }

    /**
     * Constructor
     * @param {any} box   string describing the html container, an html object or a GUI.Box
     * @param {any} name  identify the board
     * @param {any} title string describing the title of the table (using Helper.Span)
     */
    constructor( box, name, title ) {
        super( box, name, "import", title ? title : "TITLE_IMPORT", null, GUI.Board.BOARD_NONE );

        this._fieldFile = null;
        this._fieldAll = null;
        this._buttons = [];

        this.draw();

        this.Component.addClass( "import" );
    }
};