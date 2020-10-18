/// <reference path="../../../_references.js" />
/// <reference path="Enum.js" />
/// <reference path="List.js" />
/// <reference path="ListArray.js" />
/// <reference path="Box.js" />

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
 * Class handling a board of modules from a user
 */
UserModuleRecord.BoardModules = class extends GUI.Board.BoardTableAssociation {
    /**
     * Event raised on Update an element selected into the board within the current item selected
     */
    onUpdate() {
        let item = this.getSelectedItem();

        if ( item === null || item === undefined ||
            item.item === null || item.item === undefined )
            return;

        let dialogBox = GUI.Box.BoxRecord.CACHE_DIALOG_BOX( "Module", null, List.ListRecord.CACHE_LIST( "Module" ) );
        if ( dialogBox === null )
            return;

        dialogBox.readRecord( item.item.ModuleId );
    }

    /**
     * Define the list of columns into the table
     */
    declareColumns() {
        /*
         * Update the field 'Default' on clicking on the cell of the board
         */
        function handleClickDefault( board ) {
            return async function ( id, item, attribute ) {
                let oldRecord = board.List.getItem( id, true );
                if ( oldRecord === null )
                    return;

                let newRecord = DSRecord.Clone( oldRecord );

                // Update the field

                function handleUnselectedAll( list ) {
                    return function ( record ) {
                        if ( !record.Default )
                            return;

                        let oldRecord = DSRecord.Clone( record );
                        record.Default = false;

                        list.updateItem( list.getId( record ), oldRecord, record, new Errors(), true );
                    };
                }

                board.List.each( handleUnselectedAll( board.List ) );

                // Change 

                if ( newRecord.Default === true )
                    newRecord.Default = false;
                else
                    newRecord.Default = true;

                // notify the database that something has changed

                await board.updateItem( oldRecord, newRecord );
            };
        }

        super.declareColumns();

        // declare all columns

        this.declareColumn( "ModuleId", "USERMODULE_MODULEID", 5, 'left', false );
        this.declareColumn( "Profile", "USERMODULE_PROFILE", 3, 'center', false );
        this.declareColumn( "Default", "USERMODULE_DEFAULT", 1, 'center', false );

        // declare events attached to each column

        this.on( 'onClickDefault', handleClickDefault( this ) );
    }

    /**
     * Method called on onOpen of the board
     * Handle the update of the board when something changes into one of the references
     */
    onOpen() {
        super.onOpen();

        this.handleUpdateRows( "Module", "ModuleId" );
    }

    /**
     * Constructor
     * @param {any} box   string describing the html container, an html object or a GUI.Box
     * @param {any} name  identify the board
     * @param {any} list  list of elements (See List.List)
     */
    constructor( box, name, list ) {
        super( box, name, null, list ? list : new UserModuleRecord.List(), GUI.Board.BOARD_NONE );

        this.draw();

        this.Component.addClass( "usermodule" );
    }
};

/**
 * Class handling a board of modules attached to a user
 */
UserModuleRecord.BoardUsers = class extends GUI.Board.BoardTableAssociation {
    /**
     * Event raised on Update an element selected into the board within the current item selected
     */
    onUpdate() {
        let item = this.getSelectedItem();

        if ( item === null || item === undefined ||
            item.item === null || item.item === undefined )
            return;

        let dialogBox = GUI.Box.BoxRecord.CACHE_DIALOG_BOX( "User", null, List.ListRecord.CACHE_LIST( "User" ) );
        if ( dialogBox === null )
            return;

        dialogBox.readProfile( item.item.UserId );
    }

    /**
     * Define the list of columns into the table
     */
    declareColumns() {
        super.declareColumns();

        // declare all columns

        this.declareColumn( "UserId", "USERMODULE_USERID", 5, 'left', false );
    }

    /**
     * Method called on onOpen of the board
     * Handle the update of the board when something changes into one of the references
     */
    onOpen() {
        super.onOpen();

        this.handleUpdateRows( "User", "UserId" );
    }

    /**
     * Constructor
     * @param {any} box   string describing the html container, an html object or a GUI.Box
     * @param {any} name  identify the board
     * @param {any} list  list of elements (See List.List)
     */
    constructor( box, name, list ) {
        super( box, name, null, list ? list : new UserModuleRecord.List(), GUI.Board.BOARD_NONE );

        this.draw();

        this.Component.addClass( "usermodule" );
    }
};
