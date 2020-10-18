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
class Customer extends Area {
    /**
     * Called when the data model was loaded or reloaded
     */
    async onLoadedData() {
        if ( !this._firstLoad )
            return;

        await super.onLoadedData();

        // On change parameters

        ParameterRecord.OnLoadedData();
    }

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

        function handleDeclareImportation( area, menu ) {
            return function () {
                let board = area.declareBoard( menu, GUI.Board.BoardImport );
                board.declareImportationRecord( "Parameter", "Parameter", "TITLE_PARAMETER" );
            };
        }

        // initial screen

        super.drawSheets( container, treatment );

        // menu and board Parameter

        this.declareMenu( "Parameter", null, "TITLE_PARAMETER" );
        treatment.push( handleDeclareBoard( this, "Parameter", ParameterRecord.Board ) );

        if ( UserRecord.IsAdministrator() ) {
            // add a button to import data

            this.declareMenu( "import", null, "TITLE_IMPORT" );
            treatment.push( handleDeclareImportation( this, "import" ) );
        }
    }

    /**
     * Abstract method on opening the screen
     */
    async onOpen() {
        await super.onOpen();

        // Fields to filter Calendrier

        this._fieldCalendrierFiltre.Value = ( new moment() ).year().toString();
    }

    /**
     * Constructor
     * @param {any} moduleId module launched in this screen
     */
    constructor( moduleId ) {
        super( "Customer", "AREA_CUSTOMER", moduleId );
        this.Help = "module-customer";
    }
}
