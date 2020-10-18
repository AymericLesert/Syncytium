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

/*
 * DO NOT INLUDE THIS FILE INTO THE MINIFIER FILE DUE TO for await ... of NOT HANDLED BY MINIFIER
 */
var SyncytiumThread = {};

SyncytiumThread.Thread = async function ( generator, frequency, showBox, noWait, timeout ) {
    timeout = timeout !== null && timeout !== undefined && typeof ( timeout ) === 'number' && timeout >= 1 ? timeout : 1;
    frequency = frequency !== null && frequency !== undefined && typeof ( frequency ) === 'number' && frequency >= 1 ? frequency : 1;
    showBox = showBox === null || showBox === undefined || showBox === true;

    if ( showBox )
        GUI.Box.Progress.Start( noWait );

    try {
        let i = 1;

        for await ( let result of generator ) {
            if ( result !== null && result !== undefined && showBox )
                GUI.Box.Progress.SetStatus( result, null, null, i === 1 );

            if ( i >= frequency ) {
                i = 1;
                await new Promise( resolve => setTimeout( resolve, timeout ) );
            } else {
                i++;
            }
        }
    } catch ( e ) {
        Logger.Instance.exception( "Progress", "Exception on running thread", e );
    }

    if ( showBox )
        GUI.Box.Progress.Stop();
};