/// <reference path="../../_references.js" />

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
 * Handle the tooltip of the application
 *
 * Create a tooltip with a given name
 */
GUI.Webix.Tooltip = class {
    /**
     * @returns {string} "tooltip" name of the tooltip
     */
    static get DEFAULT () {
        return "tooltip";
    }

    /**
     * @returns {boolean} Indicates if the tooltip is visible or not
     */
    get IsVisible () {
        return this._visible;
    }

    /**
     * Show a tooltip with a given value (at the mouse position)
     * @param {any} value HTML code source to show in the tooltip
     * @param {any} event position to show the tooltip {x, y}
     */
    show ( value, event ) {
        if ( String.isEmptyOrWhiteSpaces( value ) )
            return;

        // set the text into the screen to compute its size

        if ( event === null || event === undefined )
            event = { pageX: this._lastEventMouse.x, pageY: this._lastEventMouse.y };

        $( '<p class="image webix_tooltip"></p>' ).html( value ).appendTo( 'body' );
        let width = $( '.image.webix_tooltip' ).width() + 20;
        let height = $( '.image.webix_tooltip' ).height() + 10;
        $( '.image.webix_tooltip' ).remove();

        let maxWidth = $( window ).width();
        let maxHeight = $( window ).height();

        let x = event.pageX;
        let y = event.pageY;

        if ( x + width > maxWidth ) {
            if ( x < width )
                x = 0;
            else {
                x = x - width;
                y += 10;
            }
        }

        if ( y + height > maxHeight ) {
            if ( y < height )
                y = 0;
            else
                y = y - height;
        }

        this._tooltip.show( { text: value }, { x: x, y: y } );
        this._visible = true;
        this._lastEventMouse = { x: event.pageX, y: event.pageY };
    }

    /**
     * Hide the tooltip
     */
    hide () {
        this._tooltip.hide();
        this._visible = false;
    }

    /**
     * Constructor
     */
    constructor() {
        webix.ui( {
            id: GUI.Webix.Tooltip.DEFAULT,
            view: 'tooltip',
            template: '#text#'
        } );

        this._tooltip = $$( GUI.Webix.Tooltip.DEFAULT );
        this._lastEventMouse = { x: 0, y: 0 };
        this._visible = false;
    }

    /**
     * @returns {GUI.Webix.Tooltip} a single instance of a tooltip
     */
    static get Instance() {
        if ( !this._instance )
            this._instance = new GUI.Webix.Tooltip();

        return this._instance;
    }
};
