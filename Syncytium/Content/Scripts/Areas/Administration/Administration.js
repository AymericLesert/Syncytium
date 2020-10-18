/// <reference path="_references.js" />

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
 * This file handles the relation between the data model and the interface into the administration area
 */
class Administration extends Area {
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

        // Fields to filter Label

        function addFieldsLabel( area ) {
            return function () {
                area.declareFilterInputText( "Language", "FilterField", "LANGUAGE_FILTER" );
            };
        }

        // initial screen

        super.drawSheets( container, treatment );

        // menu and board users

        this.declareMenu( "Users", null, "TITLE_USER" );
        treatment.push( handleDeclareBoard( this, "Users", UserRecord.Board ) );

        // menu and board module

        this.declareMenu( "Module", null, "TITLE_MODULE" );
        treatment.push( handleDeclareBoard( this, "Module", ModuleRecord.Board ) );

        // menu and board language

        this.declareMenu( "Language", null, "TITLE_LANGUAGE", null, true );
        treatment.push( handleDeclareBoard( this, "Language", Language.Board ) );

        // filters

        treatment.push( addFieldsLabel( this ) );
    }

    /**
     * Constructor
     * @param {any} moduleId module launched in this screen
     */
    constructor( moduleId ) {
        super( "Administration", "AREA_ADMINISTRATION", moduleId );
    }
}
