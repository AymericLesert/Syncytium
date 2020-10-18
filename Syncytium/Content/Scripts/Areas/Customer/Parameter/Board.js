/// <reference path="../../../_references.js" />
/// <reference path="Enum.js" />
/// <reference path="List.js" />
/// <reference path="Box.js" />

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
 * Class handling a board of Global parameters
 */
ParameterRecord.Board = class extends GUI.Board.BoardTable {
    /**
     * Define the list of columns into the table
     */
    declareColumns () {
        // declare all columns

        this.declareColumn( "Key"         , "PARAMETER_KEY"         , 2, 'left', true );
        this.declareColumn( "Description" , "PARAMETER_DESCRIPTION" , 6, 'left', ["Key"] );
        this.declareColumn( "Value"       , "PARAMETER_VALUE"       , 2, 'left', ["Key"] );

        // declare events attached to each column

        this.on( 'onClickValeur', GUI.Board.BoardTable.handleChangeText( this, "PARAMETER_UPDATE", "PARAMETER_VALUE" ) );
    }

    /**
     * Constructor
     * @param {any} box   string describing the html container, an html object or a GUI.Box
     * @param {any} name  identify the board
     * @param {any} title string describing the title of the table (using Helper.Span)
     * @param {any} list  list of elements (See List.List)
     */
    constructor( box, name, title, list ) {
        super( box, name, title ? title : "TITLE_PARAMETER", list ? list : new ParameterRecord.List(), GUI.Board.BOARD_ICON );

        this.draw();

        this.Component.addClass( "parameter" );

        // Export CSV

        function handleCSV( board ) {
            return function () {
                board.exportCSV( ["Key", "Description", "Value"], "Parameter.csv" );
            };
        }

        this.on( "board", handleCSV( this ) );
    }
};