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

GUI.Webix = {};

/**
 * Define some settings for Webix component
 */
webix.Date.startOnMonday = true;

/**
 * Abstract class to define a webix object
 *  - box       : string describing the html container, an html object or a box
 *  - name      : identify the field
 *  - cssClass  : css class of the field
 */
GUI.Webix.Webix = class extends GUI.GUI {
    /**
     * Protected method
     * @returns {any} Component of this webix zone
     */
    get ChartZone () {
        return this.Component;
    }

    /**
     * @param {any} value Webix component
     */
    set Webix( value ) {
        if ( this._webix !== null ) {
            this._webix.destructor();
            this._webix = null;
        }
        this._webix = value;
    }

    /**
     * @returns {any} Webix component
     */
    get Webix() {
        return this._webix;
    }

    /**
     * Destructor
     */
    destructor () {
        super.destructor();

        if ( this._webix !== null )
            this._webix.destructor();
        this._webix = null;
    }

    /**
     * Abstract method to draw the chart
     * @param {any} container zone having the field
     */
    drawChart ( container ) {
    }

    /**
     * Draw the field into the container
     */
    draw () {
        super.draw( "<webix id='" + this.Name + "'></webix>" );
        this.drawChart( this.ChartZone );
        this.refresh();

        function handleResize( webix ) {
            return function () {
                webix.debug( "Resizing webix chart ..." );
                webix.refresh();
            };
        }

        $( window ).on( 'resize', handleResize( this ) );
    }

    /**
     * Constructor
     * @param {any} box      reference on the box containing the component (inheritance of the readonly and visible flag)
     * @param {any} name     name of the component
     * @param {any} cssClass class name to add to the component
     */
    constructor( box, name, cssClass ) {
        super( "Webix", box, name, cssClass );
        this._webix = null;
    }
};
