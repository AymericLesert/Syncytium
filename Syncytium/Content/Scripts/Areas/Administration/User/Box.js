/// <reference path="../../../_references.js" />
/// <reference path="Enum.js" />
/// <reference path="List.js" />
/// <reference path="Board.js" />

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
 * Define a dialog box handling a record
 */
UserRecord.Box = class extends GUI.Box.BoxRecord {
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
        this._list = list ? list : new UserRecord.List();
    }

    /**
     * @returns {boolean} true if the dialog box is opened in profile mode
     */
    get IsProfile() {
        return this._isProfile;
    }

    /**
     * @returns {any} record updated into the dialog box
     */
    get Value() {
        let newRecord = super.Value;
        delete newRecord.Profile;
        return newRecord;
    }

    /**
     * Retrieve the label of the record currently updating
     * @param {any} login user's login
     * @param {any} name user's name
     * @returns {string} Label of the record
     */
    getRecordLabel ( login, name ) {
        if ( login === undefined && name === undefined ) {
            if ( !String.isEmptyOrWhiteSpaces( this.CurrentRecord.Login ) && !String.isEmptyOrWhiteSpaces( this.CurrentRecord.Name ) )
                return this.CurrentRecord.Login + " (" + this.CurrentRecord.Name + ")";

            if ( !String.isEmptyOrWhiteSpaces( this.CurrentRecord.Login ) )
                return this.CurrentRecord.Login;

            if ( !String.isEmptyOrWhiteSpaces( this.CurrentRecord.Name ) )
                return this.CurrentRecord.Name;
        } else {
            if ( !String.isEmptyOrWhiteSpaces( login ) && !String.isEmptyOrWhiteSpaces( name ) )
                return login + " (" + name + ")";

            if ( !String.isEmptyOrWhiteSpaces( login ) )
                return login;

            if ( !String.isEmptyOrWhiteSpaces( name ) )
                return name;
        }

        return "{TITLE_NOT_DEFINED}";
    }

    /**
     * Draw buttons of the dialog box between OK and CANCEL
     * @param {any} container zone having the content
     */
    drawAdditionalButton ( container ) {
        function handleNewPassword( box ) {
            return function ( user ) {
                box.debug( "Ask a new password" );
                box.CurrentRecord.askNewPassword = true;
                box._buttonNewPassword.Visible = false;
                return false;
            };
        }

        this._buttonNewPassword = this.declareButton( "NewPassword", "BTN_NEW_PASSWORD", handleNewPassword( this ) );
    }

    /**
     * Draw and show the content of the dialog box
     * @param {any} container zone having the content
     */
    drawContent ( container ) {
        super.drawContent( container );

        function handleChangeTitle( box ) {
            return function () {
                box.CurrentRecord.Login = box._fieldLogin.Value;
                box.CurrentRecord.Name = box._fieldName.Value;
                box.Title = Helper.Label( box.Title.label, box.getRecordLabel( box.CurrentRecord.Login === null ? "" : box.CurrentRecord.Login, box.CurrentRecord.Name === null ? "" : box.CurrentRecord.Name ) );
            };
        }

        this.declarePanel( "photo" );
        this._fieldPicture = this.declareField( "Picture" );

        this.declarePanel( "user" );
        this._fieldName = this.declareField( "Name" );
        this._fieldName.on( 'change', handleChangeTitle( this ) );
        this._fieldLogin = this.declareField( "Login" );
        this._fieldLogin.on( 'change', handleChangeTitle( this ) );
        this._fieldRegistration = this.declareField( "Registration" );
        this._fieldProfile = this.declareField( new GUI.Field.FieldSelect( this, "Profile", "USER_PROFILE", List.ListEnumerable.Factory( "Module", "Profile", GUI.Box.BoxRecord.ROOT_DIRECTORY ) ) );
        this._fieldEmail = this.declareField( "Email" );

        // ------------------------------- Panel 'modules'

        this.declarePanel( "modules" );

        // 'Modules' : List of modules

        if ( UserModuleRecord.BoardModules )
            this._boardModules = this.declareBoard( new UserModuleRecord.BoardModules( this, "Modules", this._listModules ) );
    }

    /**
     * Called on openning the box
     */
    onOpen () {
        // List of navigation panels

        if (this._isProfile)
            this.declareNavigationPanels( [["photo", "user"]] );
        else
            this.declareNavigationPanels( [["photo", "user"], ["modules"]] );

        // Set property on openning

        this._listModules.Item = this.CurrentRecord;
        if ( this._buttonNewPassword !== null )
            this._buttonNewPassword.Visible = this.Mode === GUI.Box.BoxRecord.MODE_UPDATE;

        super.onOpen();
    }

    /**
     * Open the box
     */
    open() {
        super.open();

        this._fieldName.raise( 'change' );

        if ( this._buttonNewPassword !== null &&
            this.CurrentRecord.EndDate !== null &&
            this.CurrentRecord.EndDate !== undefined &&
            this.CurrentRecord.EndDate <= new moment() )
            this._buttonNewPassword.Visible = false;
    }

    /**
     * Open the dialog box for creating a new record
     */
    createRecord () {
        this._isProfile = false;
        super.createRecord();
    }

    /**
     * Open the dialog box for reading a record
     * @param {any} record record of the user to read
     */
    readRecord ( record ) {
        this._isProfile = false;
        super.readRecord( record );
    }

    /**
     * Open the dialog box for updating the user's profile
     * @param {any} record record of the user to update
     */
    updateRecord ( record ) {
        this._isProfile = false;
        super.updateRecord( record );
    }

    /**
     * Open the dialog box for updating the user's profile
     * @param {any} record record of the user to update
     */
    profile ( record ) {
        this._isProfile = true;
        super.updateRecord( record );
    }

    /**
     * Open the dialog box for reading a profile
     * @param {any} record record of the user to read
     */
    readProfile( record ) {
        this._isProfile = true;
        super.readRecord( record );
    }

    /**
     * Open the dialog box for deleting the user's profile
     * @param {any} record user to delete
     */
    deleteRecord ( record ) {
        if ( this.IsOpened )
            return;

        // you can't delete yourself !

        let userToDelete = this.getRecord( record );

        let currentUser = DSDatabase.Instance.CurrentUser;
        if ( currentUser !== null && currentUser !== undefined && currentUser.Id === userToDelete.Id )
            return;

        this._isProfile = false;
        super.deleteRecord( record );
    }

    /**
     * Constructor
     * @param {any} list if undefined, UserRecord.List() or a reference on a UserRecord.List()
     */
    constructor( list ) {
        super( "User", list ? list : new UserRecord.List() );

        this._isProfile = false;
        this._fieldPicture = null;
        this._fieldRegistration = null;
        this._fieldLogin = null;
        this._fieldName = null;
        this._fieldProfile = null;
        this._fieldEmail = null;
        this._fieldDate = null;

        this._buttonNewPassword = null;

        this._listModules = new List.ListArrayRecordAssociation( this.List, "Modules", new UserModuleRecord.List(), "ModuleId", new ModuleRecord.List() );
        this._boardModules = null;

        this.draw();
    }
};
