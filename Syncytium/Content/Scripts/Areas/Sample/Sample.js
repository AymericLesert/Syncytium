/// <reference path="../../_references.js" />
/// <reference path="Sample/Enum.js" />
/// <reference path="Sample/List.js" />
/// <reference path="Sample/ListArray.js" />
/// <reference path="Sample/Box.js" />
/// <reference path="Sample/Board.js" />

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
 * This file handles the relation between the data model and the interface into the referential area
 */
class Sample extends Area {
    /**
     * Function drawing and intializing all data into the screen
     * @param {any} container jQuery zone which will contain the HTML element
     * @param {any} treatment array of functions to complete
     */
    drawSheets( container, treatment ) {
        function handleDeclareBoard( area, menu, type ) {
            return function () {
                area.declareBoard( menu, type );
            };
        }

        // initial screen

        super.drawSheets( container, treatment );

        // menu and board sample

        this.declareMenu( "sample", "TITLE_SAMPLE" );
        treatment.push( handleDeclareBoard( this, "sample", SampleRecord.Board ) );
    }

    /**
     * Method on selecting a menu (specification of treatment due to the selection of the menu)
     * @param {any} menu    identity of the menu selected by the user
     * @param {any} submenu identity of the submenu selected by the user
     */
    onSelectingMenu( menu, submenu ) {
        super.onSelectingMenu( menu, submenu );
    }

    /**
     * Abstract method on opening the screen
     */
    onOpen() {
        super.onOpen();
    }

    /**
     * Constructor
     * @param {any} moduleId module launched in this screen
     */
    constructor( moduleId ) {
        super( "Sample", "AREA_SAMPLE", moduleId );
        this.Help = Area.HTTP_ROOT_DOCUMENTATION + "module-exemple";
    }
}
