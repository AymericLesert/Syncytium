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
 * Handle a list of elements containing into a list of associations
 */
GUI.Board.BoardTableAssociation = class extends GUI.Board.BoardTable {
    /**
     * Method to define the list of columns into the table
     */
    declareColumns() {
        /*
         * Update the field 'Enable' on clicking on the cell of the board
         */
        function handleClickSelected( board ) {
            return function ( id, item, attribute ) {
                var oldRecord = board.List.getItem( id, true );
                if ( oldRecord === null )
                    return;

                var newRecord = DSRecord.Clone( oldRecord );

                if ( newRecord._selected ) {
                    if ( board.List.isBoardAllowed( board, DSDatabase.Instance.CurrentUser, "delete", oldRecord))
                        board.deleteItem( oldRecord );
                } else {
                    if ( board.List.isBoardAllowed( board, DSDatabase.Instance.CurrentUser, "add", newRecord ) )
                        board.addItem( newRecord );
                }
            };
        }

        // declare all columns

        this.declareColumn( "_selected", null, 1, 'center', false );

        // declare events attached to each column

        this.on( 'onClick_selected', handleClickSelected( this ) );

        super.declareColumns();
    }

    /**
     * Constructor
     * @param {any} box      string describing the html container, an html object or a GUI.Box
     * @param {any} name     identify the board
     * @param {any} title    string describing the title of the table (using Helper.Span)
     * @param {any} list     list of elements (See List.List)
     * @param {any} icons    icons expected into the table (See BOARD_ICON, BOARD_ADD, ...)
     */
    constructor( box, name, title, list, icons ) {
        super( box, name, title, list, icons );
    }
};
