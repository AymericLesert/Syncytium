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
 * Define a release notes box
 */
GUI.Box.BoxReleaseNotes = class extends GUI.Box.Box {
    /**
     * Define the list of buttons of the dialog box
     * @param {any} container zone having the list of buttons
     */
    drawButton( container ) {
        super.drawButton( container );
        this.declareButton( GUI.Box.Box.BUTTON_OK );
    }

    /**
     * Open the dialog box
     */
    open() {
        super.open();
        this.firstFocus();
    }

    /**
     * Constructor
     * @param {any} releaseNotes lines containing the release notes
     */
    constructor( releaseNotes ) {
        super( "releasenotes", "box_releasenotes" );

        this.Title = "TITLE_RELEASENOTES";

        this.draw();

        if ( releaseNotes !== null && releaseNotes !== undefined &&
            releaseNotes.lines !== null && releaseNotes.lines !== undefined ) {

            let notes = "";
            for ( let i = 0; i < releaseNotes.lines.length; i++ )
                notes += releaseNotes.lines[i];

            this.ContentZone.append( notes );
            this.ContentZone.show();
        }
    }

    /**
     * Open the single screen showing the release notes
     * @param {any} releaseNotes lines containing the release notes
     */
    static Open( releaseNotes ) {
        if ( !this._instance )
            this._instance = new GUI.Box.BoxReleaseNotes( releaseNotes );

        this._instance.open();
    }
};
