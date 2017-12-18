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
ModuleRecord.Box = class extends GUI.Box.BoxRecord {
    /**
     * @returns {List.List} list representing all ressources
     */
    get List() {
        return this._list;
    }

    /**
     * @param {any} list set a list to this box
     */
    set List( list ) {
        this._list = list ? list : new ModuleRecord.List();
    }

    /**
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

        // ------------------------------- Panel 'fields'

        this.declarePanel( "_fields" );

        // 'Name' : Name of the module

        this._fieldName = this.declareField( "Name" );
        this._fieldName.on( 'change', handleChangeTitle( this ) );

        // 'Module' : Functional module

        this._fieldModule = this.declareField( "Module" );

        // 'Parameters' : List of parameters of the module

        this._fieldParameters = this.declareField( "Parameters" );

        // 'Profile' : User's profile associated to this module

        this._fieldProfile = this.declareField( "Profile" );

        // 'Description' : Long description of the module

        this._fieldDescription = this.declareField( "Description" );

        // 'Enable' : Module available ?

        this._fieldEnable = this.declareField( "Enable" );

        // ------------------------------- Panel 'users'

        this.declarePanel( "_users" );

        // 'Users' : List of users

        this._boardUsers = this.declareBoard( new UserModuleRecord.BoardUsers( this, "Users", this._listUsers ) );

        // ------------------------------- List of navigation panels

        this.declareNavigationPanels( [["_fields"], ["_users"]] );
    }

    /**
     * Virtual method called on onOpen of the box containing the component
     */
    onOpen() {
        this._listUsers.Item = this.CurrentRecord;

        super.onOpen();
    }

    /**
     * Open the box
     */
    open() {
        super.open();

        this._fieldName.raise( 'change' );
    }

    /**
     * Constructor
     * @param {any} list if undefined, UserRecord.List() or a reference on a UserRecord.List()
     */
    constructor( list ) {
        super( "Module", list ? list : new ModuleRecord.List() );

        this._fieldName = null;
        this._fieldModule = null;
        this._fieldParameters = null;
        this._fieldProfile = null;
        this._fieldDescription = null;
        this._fieldEnable = null;

        this._listUsers = new List.ListArrayRecordAssociation( this.List, "Users", new UserModuleRecord.List(), "UserId", new UserRecord.List() );
        this._boardUsers = null;

        this.draw();
    }
};
