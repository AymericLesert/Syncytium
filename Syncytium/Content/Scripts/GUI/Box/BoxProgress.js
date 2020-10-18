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
 * Progress bar
 */
GUI.Box.Progress = class {
    /**
     * Indicates if the popup is currently opened
     */
    static IsOpened() {
        return this._isShown !== null && this._isShown !== undefined && this._isShown === true;
    }

    /**
     * Build a structure containing the different value to set in the status
     * @param {int} value
     * @param {int} max
     * @param {string} message
     */
    static Status( value, max, message ) {
        return [value, max, message];
    }

    /**
     * Show the progress bar
     * @param {boolean} noWait true if the popup must be show what even it arrives
     */
    static Start( noWait ) {
        noWait = noWait === null || noWait === undefined || noWait === true;

        if ( this._timeoutStop !== null && this._timeoutStop !== undefined ) {
            // The popup is not closed ... keep it open

            window.clearTimeout( this._timeoutStop );
            this._timeoutStop = null;
        } else if ( this._timeoutStart !== null && this._timeoutStart !== undefined ) {
            // The progress bar will be show soon

            Logger.Instance.warn( "Progress", "Progress bar already started" );

            if ( noWait ) {
                window.clearTimeout( this._timeoutStart );
                this._timeoutStart = null;

                $( "body > .progress" ).show();
                Logger.Instance.verbose( "Progress", "Open progress bar forced" );
            }
        } else {
            // Show the popup

            if ( $( "body > .progress" ).is( ":visible" ) )
                Logger.Instance.debug( "Progress", "Progress bar already opened" );

            // Set a throttle to avoid flipping

            if ( noWait ) {
                $( "body > .progress" ).show();
                Logger.Instance.verbose( "Progress", "Open progress bar forced" );
            } else {
                this._timeoutStart = window.setTimeout( () => {
                    GUI.Box.Progress._timeoutStart = null;
                    $( "body > .progress" ).show();
                    Logger.Instance.verbose( "Progress", "Open progress bar" );
                }, 300 );
            }
        }

        Logger.Instance.debug( "Progress", "Start progress" );
        this._isShown = true;
    }

    /**
     * Update the progression bar
     * @param {any} value   current position (if undefined, go to the next value) or the result of Status method
     * @param {any} max     max position
     * @param {any} message multilingual label describing the current step of the progression
     * @param {any} trace   false to avoid writing into the log file
     */
    static SetStatus( value, max, message, trace ) {
        let progressBar = $( "body > .progress > div > #bar" );
        let progressStatus = $( "body > .progress > div > #progressStatus" );

        if ( Array.isArray( value ) && value.length === 3 ) {
            message = value[2];
            max = value[1];
            value = value[0];
        }

        if ( value === null || value === undefined )
            value = progressBar.val() + 1;

        progressBar.val( value );

        if ( max !== null && max !== undefined )
            progressBar.attr( 'max', max );

        if ( message !== null && message !== undefined )
            progressStatus.html( Helper.Span( message ) );

        if ( Logger.Instance.IsVerbose && trace !== false )
            Logger.Instance.verbose( "Progress", "Progress (" + value.toString() + "/" + progressBar.attr( 'max' ) + " - " + progressStatus.html() + ")" );
    }

    /**
     * Hide the progression bar
     * @param {boolean} force true if the popup must be closed even if it's closing ...
     */
    static Stop( force ) {
        if ( this._timeoutStart !== null && this._timeoutStart !== undefined ) {
            window.clearTimeout( this._timeoutStart );
            this._timeoutStart = null;

            Logger.Instance.verbose( "Progress", "Do not show the progress bar because it stops before a given laps of time" );
        } else if ( this._timeoutStop !== null && this._timeoutStop !== undefined ) {
            window.clearTimeout( this._timeoutStop );
            this._timeoutStop = null;

            if ( force === true ) {
                $( "body > .progress" ).hide();
                Logger.Instance.verbose( "Progress", "Close progress bar by force" );
            } else {
                this._timeoutStop = window.setTimeout( () => {
                    GUI.Box.Progress._timeoutStop = null;
                    $( "body > .progress" ).hide();
                    Logger.Instance.verbose( "Progress", "Close progress bar" );
                }, 500 );
            }
        } else {
            if ( $( "body > .progress" ).is( ":hidden" ) ) {
                Logger.Instance.debug( "Progress", "Progress bar already closed" );
            } else if ( force === true ) {
                $( "body > .progress" ).hide();
                Logger.Instance.verbose( "Progress", "Close progress bar by force" );
            } else {
                this._timeoutStop = window.setTimeout( () => {
                    GUI.Box.Progress._timeoutStop = null;
                    $( "body > .progress" ).hide();
                    Logger.Instance.verbose( "Progress", "Close progress bar" );
                }, 500 );
            }
        }

        // Set a throttle to avoid flipping

        if ( this._isShown )
            Logger.Instance.debug( "Progress", "End progress" );
        this._isShown = false;
    }

    /**
     * Execute a thread and show the progression within the progress bar
     * @param {any} generator function to run
     * @param {int} frequency frequency to refresh screen
     * @param {boolean} showBox true or null or undefined to show the dialog box
     * @param {boolean} noWait true or null or undefined to show immediately the dialog box
     * @param {int} timeout delay of ms between 2 running async treatment
     */
    static async Thread( generator, frequency, showBox, noWait, timeout ) {
        await SyncytiumThread.Thread( generator, frequency, showBox, noWait, timeout );
    }

    /**
     * Wait time ms
     * @param {int} time
     */
    static async Sleep( time ) {
        await new Promise( resolve => {
            setTimeout( resolve, time );
        } );
    }
};
