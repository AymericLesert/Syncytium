/// <reference path="../../../_references.js" />
/// <reference path="Enum.js" />

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
 * Define a list representing the list of users into the application
 */
UserRecord.List = class extends List.ListRecord {
    /**
     * Indicates if the item is deleted or not
     * @param {any} item user to check
     * @returns {boolean} true if the user is deleted or disabled
     */
    isDeleted ( item ) {
        if ( super.isDeleted( item ) )
            return true;

        return !UserRecord.IsEnabled( item, false );
    }

    /**
     * Get the text value of the item
     * @param {any} item user
     * @returns {string} user's login
     */
    getText ( item ) {
        if ( !String.isEmptyOrWhiteSpaces( item.Name ) )
            return item.Name.trim();

        return item.Login.trim();
    }

    /**
     * Get the html content of an attribute (to show the attribute)
     * @param {any} item user
     * @param {any} attribute attribute to retrieve
     * @returns {string} HTML Code of the value of the attribute
     */
    getAttributHTML ( item, attribute ) {
        switch ( attribute ) {
            case "Enable":
                return "<div class='" + ( item.EndDate === null ? "true" : "false" ) + "'>&nbsp;&nbsp;&nbsp;&nbsp;</div>";

            case "Profile":
                return Helper.Span( DSDatabase.Instance.getEnumerable( "Module", "Profile", item.Profile ) );

            default:
                return super.getAttributHTML( item, attribute );
        }
    }

    /**
     * Get the text of an attribute (to filter the value)
     * @param {any} item user
     * @param {any} attribute attribute to retrieve
     * @returns {string} Text value of the attribute
     */
    getAttributText ( item, attribute ) {
        switch ( attribute ) {
            case "Picture":
                return "";

            case "Enable":
                return Language.Manager.Instance.interpolation( Helper.Label( item.EndDate === null ? "USER_ENABLE" : "USER_DISABLE" ) );

            case "Profile":
                return Language.Manager.Instance.interpolation( DSDatabase.Instance.getEnumerable( "Module", "Profile", item.Profile ) );

            default:
                return super.getAttributText( item, attribute );
        }
    }

    /**
     * Get the value of an attribute (to sort it)
     * @param {any} item user
     * @param {any} attribute attribute to retrieve
     * @returns {any} Value of the attribute
     */
    getAttributValue ( item, attribute ) {
        switch ( attribute ) {
            case "Picture":
                return "";

            case "Enable":
                return item.EndDate === null;

            default:
                return super.getAttributValue( item, attribute );
        }
    }

    /**
     * False if the field can be updated
     * @param {any} box      reference on the box having the field
     * @param {any} attribute column / property
     * @param {any} user     current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the field can't be updated by the current user
     */
    isBoxFieldVisible( box, attribute, user, item ) {
        if ( !super.isBoxFieldVisible( box, attribute, user, item ) )
            return false;

        switch ( attribute ) {
            case "Profile":
                return box.IsProfile;
        }

        return true;
    }

    /**
     * False if the field can be updated
     * @param {any} box      reference on the box having the field
     * @param {any} attribute column / property
     * @param {any} user     current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the field can't be updated by the current user
     */
    isBoxFieldReadonly( box, attribute, user, item ) {
        if ( super.isBoxFieldReadonly( box, attribute, user, item ) )
            return true;

        switch ( attribute ) {
            case "Profile":
                return true;

            case "Registration":
                return box.IsProfile && UserRecord.IsUser( item );

            case "Login":
                return box.IsProfile && UserRecord.IsUser( item );
        }

        return false;
    }

    /**
     * False if the board can be updated in a dialog box
     * @param {any} box      reference on the dialog box
     * @param {any} board board name
     * @param {any} user  current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the board can't be updated by the current user
     */
    isBoxBoardReadonly( box, board, user, item ) {
        if ( super.isBoxBoardReadonly( box, board, user, item ) )
            return true;

        switch ( board ) {
            case "Modules":
                return box.IsProfile || !UserRecord.IsAdministrator( user );
        }

        return false;
    }

    /**
     * Create an empty record of user
     */
    get NewItem () {
        var record = super.NewItem;

        record.CreationDate = new moment();
        record.Language = DSDatabase.Instance.CurrentLanguage;
        record.askNewPassword = false;

        return record;
    }

    /**
     * Check the validity of the user
     * @param {any} record record to check
     * @param {any} errors errors identified during the check
     * @param {any} force true if the check must be done
     * @returns {any} confirmation message
     */
    checkItem ( record, errors, force ) {
        var confirmation = super.checkItem( record, errors, force );

        if ( UserRecord.IsAdministrator( record ) )
            return confirmation;

        return confirmation;
    }

    /**
     * Add a new item into the database and return a new id (or null, if no id available)
     * @param {any} newItem new item to add
     * @param {any} errors list of errors
     * @param {any} force true to avoid checking
     * @param {any} checkItem true or undefined if the element and its sub-element must be checked
     * @returns {any} item added
     */
    addItem ( newItem, errors, force, checkItem ) {
        var itemCreated = super.addItem( newItem, errors, force, checkItem );

        if ( errors.HasError )
            return errors;

        if ( Helper.IsLabel( itemCreated ) )
            return itemCreated;

        DSDatabase.Instance.executeRequest( "User", "NewPassword", { Id: itemCreated.Id }, errors );

        if ( errors.HasError )
            return errors;

        return itemCreated;
    }

    /**
     * Update an item into the database
     *
     * force can be true / false
     * - false it's the first time ... if you have a question, you can,
     * - true means that you force the update except in case of errors
     * @param {any} id id of the item updated
     * @param {any} oldItem oldvalue of the item
     * @param {any} newItem newvalue of the item
     * @param {any} errors list of errors
     * @param {any} force true to avoid checking
     * @param {any} checkItem true or undefined if the element and its sub-elements must be checked
     * @returns {any} item updated
     */
    updateItem( id, oldItem, newItem, errors, force, checkItem ) {
        var itemUpdated = super.updateItem( id, oldItem, newItem, errors, force, checkItem );

        if ( errors.HasError )
            return errors;

        if ( Helper.IsLabel( itemUpdated ) )
            return itemUpdated;

        if ( newItem.askNewPassword ) {
            DSDatabase.Instance.executeRequest( "User", "NewPassword", { Id: itemUpdated.Id }, errors );

            if ( errors.HasError )
                return errors;
        }

        return itemUpdated;
    }

    /**
     * Constructor 
     * @param {any} allRecords true : take into account the Enable property
     */
    constructor( allRecords ) {
        super( "User", allRecords );

        this.DefaultPicture = UserRecord.DEFAULT_PICTURE().picture;

        this.declareListValues( "Modules", "UserModule", "UserId", true );
    }
};
