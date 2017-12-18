/// <reference path="../../../_references.js" />
/// <reference path="Enum.js" />
/// <reference path="List.js" />
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
 * Class handling a board of users
 */
UserRecord.Board = class extends GUI.Board.BoardTable {
    /**
     * Define the list of columns into the table
     */
    declareColumns () {
        function handleCloseUserAccount( board ) {
            return function ( id, item, attribute ) {
                var oldRecord = board.List.getItem( id, true );
                if ( oldRecord === null )
                    return;

                var currentUser = DSDatabase.Instance.CurrentUser;
                if ( currentUser !== null && currentUser.Id >= 0 && oldRecord.Id === currentUser.Id )
                    return;

                var newRecord = DSRecord.Clone( oldRecord );
                if ( newRecord.EndDate === null )
                    newRecord.EndDate = new moment();
                else
                    newRecord.EndDate = null;

                // notify the database that something has changed

                board.updateItem( oldRecord, newRecord );
            };
        }

        // declare all columns

        this.declareColumn( "Enable", null, 2, 'center', ["Login", "Name", "WorkcentreOrSectionOrFactory", "Id"] );
        this.declareColumn( "Picture", null, 3, 'center', false );
        this.declareColumn( "Login", "USER_LOGIN", 5, null, ["Name", "WorkcentreOrSectionOrFactory", "Id"] );
        this.declareColumn( "Name", "USER_NAME", 5, null, ["Login", "WorkcentreOrSectionOrFactory", "Id"] );

        // declare events attached to each column

        this.on( 'onClickEnable', handleCloseUserAccount( this ) );
    }

    /**
     * Constructor
     * @param {any} box      string describing the html container, an html object or a GUI.Box
     * @param {any} name     identify the board
     * @param {any} title    string describing the title of the table (using Helper.Span)
     * @param {any} list     list of elements (See List.List)
     */
    constructor( box, name, title, list ) {
        super( box, name, title ? title : "TITLE_USER", list ? list : new UserRecord.List( true ), GUI.Board.BOARD_ALL );
        this.setVisible( GUI.Board.BOARD_ICON + GUI.Board.BOARD_CANCEL, false );
        this.Help = Area.HTTP_ROOT_DOCUMENTATION + "module-d-administration/gestion-des-utilisateurs";
        this.draw();
    }
};
