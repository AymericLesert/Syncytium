/// <reference path="../../_references.js" />

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
 * Handle a webix line chart into a board
 */
GUI.Board.BoardChartLine = class extends GUI.Board.BoardChartMultiData {
    /**
     * constructor
     * @param {any} box       string describing the html container, an html object or a GUI.Box
     * @param {any} name      identify the board
     * @param {any} title     string describing the title of the table (using Helper.Span)
     * @param {any} list      list of elements (See List.List)
     * @param {any} icons     icons expected into the table (See BOARD_ICON, BOARD_ADD, ...)
     * @param {any} showXAxis true or false to show the axis or not
     */
    constructor( box, name, title, list, icons, showXAxis ) {
        super( box, name, "board_chart_line", title, list, icons, GUI.Board.BoardChartMultiData.LINE, showXAxis );
    }
};
