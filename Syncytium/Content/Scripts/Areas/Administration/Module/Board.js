/// <reference path="../../../_references.js" />
/// <reference path="Enum.js" />
/// <reference path="List.js" />
/// <reference path="ListArray.js" />
/// <reference path="Box.js" />

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
 * Class handling a board of modules
 */
ModuleRecord.Board = class extends GUI.Board.BoardTable {
    /**
     * Define the list of columns into the table
     */
    declareColumns() {
        /*
         * Update the field 'Enable' on clicking on the cell of the board
         */
        function handleClickEnable( board ) {
            return function ( id, item, attribute ) {
                var oldRecord = board.List.getItem( id, true );
                if ( oldRecord === null )
                    return;

                if ( id === DSDatabase.Instance.CurrentModule.Id )
                    return;

                var newRecord = DSRecord.Clone( oldRecord );

                // Update the field

                if ( newRecord.Enable === true )
                    newRecord.Enable = false;
                else
                    newRecord.Enable = true;

                // notify the database that something has changed

                board.updateItem( oldRecord, newRecord );
            };
        }

        // declare all columns

        this.declareColumn( "Enable", null, 1, 'center', ["Id"] );
        this.declareColumn( "Name", "MODULE_NAME", 5, 'left', ["Id"] );
        this.declareColumn( "Description", "MODULE_DESCRIPTION", 5, 'left', ["Id"] );
        this.declareColumn( "Module", "MODULE_MODULE", 3, 'left', ["Id"] );
        this.declareColumn( "Profile", "MODULE_PROFILE", 3, 'left', ["Id"] );
        this.declareColumn( "Parameters", "MODULE_PARAMETERS", 5, 'left', ["Id"] );

        // declare events attached to each column

        this.on( 'onClickEnable', handleClickEnable( this ) );
    }

    /**
     * Constructor
     * @param {any} box      string describing the html container, an html object or a GUI.Box
     * @param {any} name     identify the board
     * @param {any} title    string describing the title of the table (using Helper.Span)
     * @param {any} list     list of elements (See List.List)
     */
    constructor( box, name, title, list ) {
        super( box, name, title ? title : "TITLE_MODULE", list ? list : new ModuleRecord.List(), GUI.Board.BOARD_NONE );

        this.setVisible( GUI.Board.BOARD_ADD + GUI.Board.BOARD_DELETE, true );

        if ( !( list instanceof List.ListArrayRecord ) ) {
            this.setVisible( GUI.Board.BOARD_HELP, true );
            this.Help = Area.HTTP_ROOT_DOCUMENTATION + "module-d-administration/gestion-des-modules-fonctionnels";
        }

        this.draw();
    }
};
