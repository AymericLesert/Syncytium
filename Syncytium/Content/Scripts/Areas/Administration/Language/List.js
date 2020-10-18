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
 * List of multilingual labels
 */
Language.List = class extends List.ListRecord {
    /**
     * Set the filter on type of a course (Type, CodeEBP or Description)
     * @param {string} value value to filter on field
     */
    set FilterField( value ) {
        // update the filter property

        value = String.isEmptyOrWhiteSpaces( value ) ? null : value;

        if ( this._filterField === value )
            return;

        this._filterField = value;

        this.raise( "onLoad", this.Table );
    }

    /**
     * Get the html content of a tooltip for the label
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a HTML code describing the tooltip to show of the attribute
     */
    getAttributToolTipHTML( item, attribute ) {
        switch ( attribute )
        {
            case "EN":
            case "FR":
                return this.getAttributText( item, "Comment" );
        }
        return null;
    }

    /**
     * Indicates if the item is visible in this list or not
     * @param {any} item record to check
     * @returns {boolean} true if the record is visible or not into the list
     */
    isVisible( item ) {
        if ( !super.isVisible( item ) )
            return false;

        if ( this._filterField === null )
            return true;

        return String.in( item.FR, this._filterField ) ||
            String.in(item.EN, this._filterField) ||
            String.in(item.Key, this._filterField) ||
            String.in( item.Comment, this._filterField );
    }

    /**
     * Constructor
     */
    constructor() {
        super( "Language" );

        // filter row by a substring

        this._filterField = null;
    }
};
