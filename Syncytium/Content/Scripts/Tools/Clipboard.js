/// <reference path="../_references.js" />

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
 * Handle clipboard
 */
class Clipboard {
    /**
     * Copy a string into the clipboard
     * @param {string} title label of the title of the screen
     * @param {string} text value to copy
     */
    static Copy ( title, text ) {
        let textareaElement = document.createElement( 'textarea' );

        let value = "";
        if ( !String.isEmptyOrWhiteSpaces( title ) )
            value = title;

        if ( !String.isEmptyOrWhiteSpaces( text ) )
            value += ( String.isEmptyOrWhiteSpaces( value ) ? "" : "\n\n" ) + text;

        textareaElement.value = String.isEmptyOrWhiteSpaces( value ) ? "Error empty" : value;

        document.body.appendChild( textareaElement );
        textareaElement.select();
        document.execCommand( 'copy' );
        document.body.removeChild( textareaElement );
    }
};