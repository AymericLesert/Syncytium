/// <reference path="../_references.js" />

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
 * Abstract class for LoggerManager
 *
 * Handle the logger in the client side inside a class of the client
 */
class LoggerBaseObject {
    /**
     * Retrieve the module name
     */
    get Module() {
        return this._module;
    }

    /**
     * Retrieve the all verbose mode
     * @returns {boolean} true if the log must be verbose
     */
    get IsVerboseAll() {
        return Logger.Instance.IsVerboseAll;
    }

    /**
     * Retrieve the verbose mode
     * @returns {boolean} true if the log must be verbose
     */
    get IsVerbose () {
        return Logger.Instance.IsVerbose;
    }

    /**
     * Retrieve the debug mode
     * @returns {boolean} true if the log is in debugged
     */
    get IsDebug () {
        return Logger.Instance.IsDebug;
    }

    /**
     * Add a verbose message
     * @param {any} message string to log in verbose mode
     */
    verbose ( message ) {
        if ( !Logger.Instance.IsVerbose )
            return;
        Logger.Instance.verbose( this._module, message );
    }

    /**
     * Add a debug message
     * @param {any} message string to log in debug mode
     */
    debug ( message ) {
        if ( !Logger.Instance.IsDebug )
            return;
        Logger.Instance.debug( this._module, message );
    }

    /**
     * Add an info message
     * @param {any} message string to log in info mode
     */
    info ( message ) {
        Logger.Instance.info( this._module, message );
    }

    /**
     * Add a warning message
     * @param {any} message string to log in warning mode
     */
    warn ( message ) {
        Logger.Instance.warn( this._module, message );
    }

    /**
     * Add an error message
     * @param {any} message string to log in error mode
     */
    error ( message ) {
        Logger.Instance.error( this._module, message );
    }

    /**
     * Add an exception
     * @param {any} message string to log in error mode
     * @param {any} e       exception to log
     */
    exception ( message, e ) {
        Logger.Instance.exception( this._module, message, e );
    }

    /**
     * @returns {string} Convert the object into a string value
     */
    toString () {
        return String.JSONStringify( this );
    }

    /**
     * Constructor
     * @param {any} module module name
     */
    constructor( module ) {
        this._module = module;
    }
}
