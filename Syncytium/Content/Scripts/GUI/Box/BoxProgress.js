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
 * Progress bar
 */
GUI.Box.Progress = class {
    /**
     * Show the progress bar
     */
    static Start () {
        $( "body > .progress" ).show();
        Logger.Instance.debug( "Progress", "Start progress" );
    }

    /**
     * Update the progression bar
     * @param {any} value   current position (if undefined, go to the next value)
     * @param {any} max     max position
     * @param {any} message multilingual label describing the current step of the progression
     */
    static SetStatus( value, max, message ) {
        let progressBar = $( "body > .progress > div > #bar" );
        let progressStatus = $( "body > .progress > div > #progressStatus" );

        if ( value === null || value === undefined )
            value = progressBar.val() + 1;

        progressBar.val( value );

        if ( max !== null && max !== undefined )
            progressBar.attr( 'max', max );

        if ( message !== null && message !== undefined )
            progressStatus.html( Helper.Span( message ) );

        Logger.Instance.debug( "Progress", "Progress (" + value.toString() + "/" + progressBar.attr( 'max' ) + " - " + progressStatus.html() + ")" );
    }

    /**
     * Hide the progression bar
     */
    static Stop () {
        $( "body > .progress" ).hide();
        Logger.Instance.debug( "Progress", "End progress" );
    }
};
