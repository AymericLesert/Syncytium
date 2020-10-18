/// <reference path="../../../_references.js" />
/// <reference path="Enum.js" />

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
 * Handling a list of usermodules
 */
UserModuleRecord.List = class extends List.ListRecord {
    /**
     * Get the html content of an attribute (to show the attribute)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a HTML code describing the attribute or the value of the attribute
     */
    getAttributHTML( item, attribute ) {
        switch ( attribute ) {
            case "Default":
                return this.getAttributHTMLBoolean( item, attribute );

            default:
                return super.getAttributHTML( item, attribute );
        }
    }

    /**
     * Get the text of an attribute (to filter the value)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {string} a string representing the value of the field
     */
    getAttributText( item, attribute ) {
        let list = null;
        let element = null;

        if ( item === null || item === undefined )
            return "";

        switch ( attribute ) {
            case "UserId":
                return this.getAttributTextReference( item, attribute, "User" );

            case "ModuleId":
                return this.getAttributTextReference( item, attribute, "Module" );

            case "Default":
                return this.getAttributTextBoolean( item, attribute );

            case "Profile":
                if ( item._parent && item._parent._table === "Module" )
                    return this.getAttributTextEnumerate( item._parent, attribute );

                if ( item.ModuleId === undefined || item.ModuleId === null )
                    return "";

                list = List.ListRecord.CACHE_LIST( "Module" );
                if ( list === null )
                    return super.getAttributText( item, attribute );

                element = list.getItem( item.ModuleId, true );
                if ( element === null || element === undefined )
                    return super.getAttributText( element, attribute );

                return this.getAttributTextEnumerate( element, attribute );
            default:
                return super.getAttributText( item, attribute );
        }
    }

    /**
     * Get the value of an attribute (to sort it)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} value of the field
     */
    getAttributValue( item, attribute ) {
        switch ( attribute ) {
            case "UserId":
                return this.getAttributTextReference( item, attribute, "User" ).toUpperCase();

            case "ModuleId":
                return this.getAttributTextReference( item, attribute, "Module" ).toUpperCase();

            case "Default":
                return this.getAttributTextBoolean( item, attribute ).toUpperCase();

            default:
                return super.getAttributValue( item, attribute );
        }
    }

    /**
     * Check if the element attached to the attribute is deleted or not (show if the reference is deleted)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {boolean} true if the reference of the property is deleted
     */
    isAttributDeleted( item, attribute ) {
        switch ( attribute ) {
            case "UserId":
                return this.isAttributDeletedReference( item, attribute, "User" );

            case "ModuleId":
                return this.isAttributDeletedReference( item, attribute, "Module" );

            default:
                return super.isAttributDeleted( item, attribute );
        }
    }

    /**
     * False if the field can be updated in a dialog box
     * @param {any} box      reference on the dialog box
     * @param {any} attribute column / property
     * @param {any} user     current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the field can't be updated by the current user
     */
    isBoxFieldReadonly( box, attribute, user, item ) {
        if ( attribute === "ModuleId" )
            return true;

        if ( super.isBoxFieldReadonly( box, attribute, user, item ) )
            return true;

        return false;
    }

    /**
     * True if the user can execute the event into a board
     * @param {any} board    reference on the board
     * @param {any} user     current user
     * @param {string} event event name
     * @param {any} item     item handled by the board (can be null or undefined)
     * @returns {boolean} true if the user can execute the event
     */
    isBoardAllowed( board, user, event, item ) {
        if ( event === "delete" && item !== null && item !== undefined && (item.UserId !== user.Id || item.ModuleId !== DSDatabase.Instance.CurrentModule.Id ) )
            return true;

        return true;
    }

    /**
     * Constructor
     * @param {any} allRecords true : take into account the Enable property
     */
    constructor( allRecords ) {
        super( "UserModule", allRecords );
    }
};
