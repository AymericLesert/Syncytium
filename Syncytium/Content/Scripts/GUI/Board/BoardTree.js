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
 * Handle a tree of elements containing into a board
 * TODO: Write a generic class to show tree into a component
 */
GUI.Board.BoardTree = class extends GUI.Board.Board {
    /**
     * Abstract method to adjust the webix object (async mode)
     */
    async adjustWebix() {
        await super.adjustWebix();

        if ( this.Webix === null )
            return;

        this.Webix.adjust();
    }

    /**
     * Constructor
     * @param {any} box      string describing the html container, an html object or a GUI.Box
     * @param {any} name     identify the board
     * @param {any} title    string describing the title of the table (using Helper.Span)
     * @param {any} tree     tree of elements (See List.List)
     * @param {any} icons    icons expected into the table (See BOARD_ICON, BOARD_ADD, ...)
     */
    constructor( box, name, title, tree, icons ) {
        super( box, name, "board_tree", title, tree, icons );
    }
};
