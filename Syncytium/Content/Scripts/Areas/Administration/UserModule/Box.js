/// <reference path="../../../_references.js" />
/// <reference path="Enum.js" />
/// <reference path="List.js" />
/// <reference path="ListArray.js" />

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
 * Define a dialog box handling a record
 */
UserModuleRecord.Box = class extends GUI.Box.BoxRecord {
    /**     * @returns {List.List} list representing all ressources     */    get List() {        return this._list;    }    /**     * @param {any} list set a list to this box     */    set List( list ) {        this._list = list ? list : new UserModuleRecord.List();    }    /**
     * Draw and show the content of the dialog box
     * @param {any} container zone having the content
     */
    drawContent( container ) {
        super.drawContent( container );

        function handleChangeTitle( box ) {
            return function () {
                box.Title = Helper.Label( box.Title.label, box.getRecordLabel() );
            };
        }

        function handleRefresh( box, field, table ) {
            return function () {
                field.refresh();
            };
        }

        function handleRead( box, field, table ) {
            return function () {
                var id = field.Value;
                if ( id === undefined || id === null )
                    return;

                var item = List.ListRecord.CACHE_LIST( table ).getItem( id, true );
                if ( item === null )
                    return;

                GUI.Box.BoxRecord.CACHE_DIALOG_BOX( table ).readRecord( item );
            };
        }

        function handleOnChange( box, field, table ) {
            return function () {
                field.Link = field.Value === null ? null : handleRead( box, field, table );
            };
        }

        // 'UserId' : User

        this._fieldUserId = this.declareField( "UserId" );
        this._fieldUserId.on( 'change', handleOnChange( this, this._fieldUserId, "User" ) );
        this._fieldUserId.on( 'onCreate', handleRefresh( this, this._fieldUserId, "User" ) );
        this._fieldUserId.on( 'onUpdate', handleRefresh( this, this._fieldUserId, "User" ) );
        this._fieldUserId.on( 'onDelete', handleRefresh( this, this._fieldUserId, "User" ) );

        // 'ModuleId' : Functional module

        this._fieldModuleId = this.declareField( "ModuleId" );
        this._fieldModuleId.on( 'change', handleOnChange( this, this._fieldModuleId, "Module" ) );
        this._fieldModuleId.on( 'onCreate', handleRefresh( this, this._fieldModuleId, "Module" ) );
        this._fieldModuleId.on( 'onUpdate', handleRefresh( this, this._fieldModuleId, "Module" ) );
        this._fieldModuleId.on( 'onDelete', handleRefresh( this, this._fieldModuleId, "Module" ) );

        // 'Default' : Module called by default

        this._fieldDefault = this.declareField( new GUI.Field.FieldCheckBox( this, "Default", "USERMODULE_DEFAULT", ["USERMODULE_DEFAULT_NULL", "USERMODULE_DEFAULT_TRUE", "USERMODULE_DEFAULT_FALSE"] ) );

    }

    /**
     * Open the box
     */
    open () {
        super.open();

        this._fieldUserId.raise( 'change' );
        this._fieldModuleId.raise( 'change' );
    }

    /**
     * Constructor
     * @param {any} list if undefined, UserRecord.List() or a reference on a UserRecord.List()
     */
    constructor( list ) {
        super( "UserModule", list ? list : new UserModuleRecord.List() );

        this._fieldUserId = null;
        this._fieldModuleId = null;
        this._fieldDefault = null;

        this.draw();
    }
};

