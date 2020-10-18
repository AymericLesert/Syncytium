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
 * Handle a list of history elements containing into a table
 */
GUI.Board.BoardHistory = class extends GUI.Board.BoardTable {
    /**
     * @returns {Array or String} Column and order to sort by default
     */
    get ColumnSortedByDefault() {
        return [ "Date", "desc" ];
    }

    /**
     * Declare the list of columns into the table
     * @param withDescription {boolean} true if the description must be show into the table (false by default)
     */
    declareColumns ( withDescription ) {
        this.declareColumn( "User", "HISTORY_HISTORYUSERID", 5, 'center', "Id", 20, 20 );
        this.declareColumn( "Date", "HISTORY_HISTORYDATE", 5, 'center', "Id" );
        this.declareColumn( "Nature", "HISTORY_HISTORYNATURE", 5, 'center', "Id" );
        if ( withDescription !== null && withDescription !== undefined && withDescription === true )
            this.declareColumn( "Description", "HISTORY_HISTORYDESCRIPTION", 10, 'center', "Id" );
        this.declareColumn( "Field", "HISTORY_HISTORYFIELD", 7, null, "Id" );
        this.declareColumn( "OldValue", "HISTORY_HISTORYOLDVALUE", 9, null, "Id" );
        this.declareColumn( "NewValue", "HISTORY_HISTORYNEWVALUE", 9, null, "Id" );
    }

    /**
     * The list of columns to show on depends on the window size (async mode)
     * @param {any} rowId id of the row to adjust only
     */
    async adjustWebix( rowId ) {
        if ( rowId !== undefined ) {
            await super.adjustWebix( rowId );
            return;
        }

        let newWidth = $( window ).width();
        let newNbColumnsToShow = -1;

        if ( newWidth < 480 )
            newNbColumnsToShow = 3;
        else if ( newWidth < 960 )
            newNbColumnsToShow = 4;

        if ( newNbColumnsToShow !== this._nbColumnsToShow ) {
            let columnsVisible = [];

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

            for ( let column of this.Columns ) {
                let isVisible = this.Webix.isColumnVisible( column.id );
                let hasToBeVisible = columnsVisible === null ? true : columnsVisible.indexOf( column.id ) >= 0;

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
                await this.populateWebix();
            }
        }

        await super.adjustWebix();
    }

    /**
     * Build the histories values on depends on a given record within History subList
     * @param {any} item item to show
     */
    set Item( item ) {
        this.List.Item = item;
    }

    /**
     * Event raised on Update an element selected into the board within the current item selected
     * Override the function defined into BoardTable (only readonly within history board)
     */
    onUpdate() {
        let item = this.getSelectedItem();

        if ( item === null || item.item === null || item.item === undefined )
            return;

        // Ouvrir la boite de dialogue affichant les informations de l'objet à la date sélectionnée

        let dialogBox = GUI.Box.BoxRecord.CACHE_DIALOG_BOX( this.List._list.Table, "History", this.List );

        if ( dialogBox !== null )
            dialogBox.readRecord( item.item.Item );
    }

    /**
     * constructor
     * @param {any} box      string describing the html container, an html object or a GUI.Box
     * @param {any} name     identify the board
     * @param {any} list     list of elements (See List.ListHistory)
     */
    constructor ( box, name, list ) {
        super( box, name, "HISTORY_TITLE", list, GUI.Board.BOARD_NONE );

        // build the board

        this._nbColumnsToShow = -1;
        this.draw();
    }
};
