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
 * Handle a list of history elements containing into a table
 */
GUI.Board.BoardHistory = class extends GUI.Board.BoardTable {
    /**
     * Declare the list of columns into the table
     */
    declareColumns () {
        this.declareColumn( "User", "HISTORY_USER", 5, 'center', "Id" );
        this.declareColumn( "Date", "HISTORY_DATE", 5, 'center' );
        this.declareColumn( "Nature", "HISTORY_NATURE", 5, 'center', "Id" );
        this.declareColumn( "Description", "HISTORY_DESCRIPTION", 10, 'center', "Id" );
        this.declareColumn( "Field", "HISTORY_FIELD", 10, null, "Id" );
        this.declareColumn( "OldValue", "HISTORY_OLDVALUE", 5, null, "Id" );
        this.declareColumn( "NewValue", "HISTORY_NEWVALUE", 5, null, "Id" );
    }

    /**
     * The list of columns to show on depends on the window size
     * @param {any} rowId id of the row to adjust only
     */
    adjustWebix ( rowId ) {
        if ( rowId !== undefined ) {
            super.adjustWebix( rowId );
            return;
        }

        var newWidth = $( window ).width();
        var newNbColumnsToShow = -1;

        if ( newWidth < 480 )
            newNbColumnsToShow = 3;
        else if ( newWidth < 960 )
            newNbColumnsToShow = 4;

        if ( newNbColumnsToShow !== this._nbColumnsToShow ) {
            var columnsVisible = [];

            switch ( newNbColumnsToShow ) {
                case 3:
                    columnsVisible = ["User", "Date", "Nature"];
                    break;
                case 4:
                    columnsVisible = ["User", "Date", "Nature", "Description"];
                    break;
                default:
                    columnsVisible = null;
                    break;
            }

            this.debug( "Resizing and show a part of columns : " + String.JSONStringify( columnsVisible ) );

            for ( var columnId in this.Columns ) {
                var column = this.Columns[columnId];

                var isVisible = this.Webix.isColumnVisible( column.id );
                var hasToBeVisible = columnsVisible === null ? true : columnsVisible.indexOf( column.id ) >= 0;

                if ( isVisible === hasToBeVisible )
                    continue;

                if ( isVisible ) {
                    this.hideColumn( column.id );
                    continue;
                }

                this.showColumn( column.id );
            }

            this._nbColumnsToShow = newNbColumnsToShow;

            if ( this._nbColumnsToShow < 0 && !this.List.IsDetails || this._nbColumnsToShow >= 0 && this.List.IsDetails ) {
                this.List.setDetails( newNbColumnsToShow < 0 );
                this.populateWebix();
            }
        }

        super.adjustWebix();
    }

    /**
     * constructor
     * @param {any} box      string describing the html container, an html object or a GUI.Box
     * @param {any} name     identify the board
     * @param {any} list     list of elements (See List.List)
     */
    constructor ( box, name, list ) {
        super( box, name, "HISTORY_TITLE", list, GUI.Board.BOARD_NONE );

        // build the board

        this._nbColumnsToShow = -1;
        this.draw();
    }
};
