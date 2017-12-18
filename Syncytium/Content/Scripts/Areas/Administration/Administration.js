/// <reference path="../../_references.js" />
/// <reference path="Language/Enum.js" />
/// <reference path="Language/List.js" />
/// <reference path="Language/Board.js" />
/// <reference path="User/Enum.js" />
/// <reference path="User/List.js" />
/// <reference path="User/Board.js" />
/// <reference path="User/Box.js" />
/// <reference path="Module/Enum.js" />
/// <reference path="Module/List.js" />
/// <reference path="Module/ListArray.js" />
/// <reference path="Module/Box.js" />
/// <reference path="Module/Board.js" />
/// <reference path="UserModule/Enum.js" />
/// <reference path="UserModule/List.js" />
/// <reference path="UserModule/ListArray.js" />
/// <reference path="UserModule/Box.js" />
/// <reference path="UserModule/Board.js" />

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
 * This file handles the relation between the data model and the interface into the administration area
 */
class Administration extends Area {
    /**
     * Private method to declare a new board
     * @param {any} name name of the menu attached to the board
     * @param {any} type board type
     */
    declareBoard( name, type ) {
        super.declareBoard( name, type );

        this.getMenu( name ).sheet.append( "<buttons><button class='button' id='submit' onclick='DSDatabase.Instance.commit();'></button><button class='button' id='cancel' onclick='DSDatabase.Instance.rollback();'></button></buttons>" );
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

        // initial screen

        super.drawSheets( container, treatment );

        // menu and board users

        this.declareMenu( "users", "TITLE_USER" );
        treatment.push( handleDeclareBoard( this, "users", UserRecord.Board ) );

        // menu and board module

        this.declareMenu( "module", "TITLE_MODULE" );
        treatment.push( handleDeclareBoard( this, "module", ModuleRecord.Board ) );

        // menu and board language

        this.declareMenu( "language", "TITLE_LANGUAGE" );
        treatment.push( handleDeclareBoard( this, "language", Language.Board ) );
    }

    /**
     * Constructor
     * @param {any} moduleId module launched in this screen
     */
    constructor( moduleId ) {
        super( "Administration", "AREA_ADMINISTRATION", moduleId );
        this.Help = Area.HTTP_ROOT_DOCUMENTATION + "module-d-administration";
    }
}
