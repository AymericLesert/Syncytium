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

GUI.Box.Message = class {
    /**
     * Define a single box showing a message and may ba wait for a validation
     * @param {any} title   multilingual label of the title
     * @param {any} message multilingual label of the message
     * @param {any} action  function to call if a treatment must be done on validation
     */
    static Message( title, message, action ) {
        if ( !this._dialogBoxMessage ) {
            this._dialogBoxMessage = new GUI.Box.Box( "message", "box_message" );
            this._dialogBoxMessage.draw();
            this._dialogBoxMessage.declareButton( GUI.Box.Box.BUTTON_OK );
            this._dialogBoxMessage.declareButton( GUI.Box.Box.BUTTON_CANCEL, "BTN_CANCEL" );
        }

        this._dialogBoxMessage.Title = title;
        this._dialogBoxMessage.Message = message;
        this._dialogBoxMessage.getButton( GUI.Box.Box.BUTTON_OK ).Action = action;
        this._dialogBoxMessage.getButton( GUI.Box.Box.BUTTON_CANCEL ).Visible = action !== null && action !== undefined;

        this._dialogBoxMessage.open();
    }

    /**
     * Define a single box showing an information message and execute a given function
     * @param {any} message multilingual label of the message
     * @param {any} action  function to call if a treatment must be done on validation
     */
    static Information( message, action ) {
        if ( !this._dialogBoxInformation) {
            this._dialogBoxInformation = new GUI.Box.Box( "message", "box_information" );
            this._dialogBoxInformation.draw();
            this._dialogBoxInformation.declareButton( GUI.Box.Box.BUTTON_OK );
            this._dialogBoxInformation.declareButton( GUI.Box.Box.BUTTON_CANCEL, "BTN_CANCEL" );
        }

        this._dialogBoxInformation.Title = "INFORMATION";
        this._dialogBoxInformation.Message = message;
        this._dialogBoxInformation.getButton( GUI.Box.Box.BUTTON_OK ).Action = action;
        this._dialogBoxInformation.getButton( GUI.Box.Box.BUTTON_CANCEL ).Visible = action !== null && action !== undefined;

        this._dialogBoxInformation.open();
    }

    /**
     * Define a single box showing a warning message and execute a given function
     * @param {any} message multilingual label of the message
     * @param {any} action  function to call if a treatment must be done on validation
     */
    static Warning( message, action ) {
        if ( !this._dialogBoxWarning ) {
            this._dialogBoxWarning = new GUI.Box.Box( "message", "box_warning" );
            this._dialogBoxWarning.draw();
            this._dialogBoxWarning.declareButton( GUI.Box.Box.BUTTON_OK );
            this._dialogBoxWarning.declareButton( GUI.Box.Box.BUTTON_CANCEL, "BTN_CANCEL" );
        }

        this._dialogBoxWarning.Title = "WARNING";
        this._dialogBoxWarning.Message = message;
        this._dialogBoxWarning.getButton( GUI.Box.Box.BUTTON_OK ).Action = action;
        this._dialogBoxWarning.getButton( GUI.Box.Box.BUTTON_CANCEL ).Visible = action !== null && action !== undefined;

        this._dialogBoxWarning.open();
    }

    /**
     * Define a single box showing an error message
     * @param {any} title     multilingual label of the title
     * @param {Errors} errors list of errors to show
     */
    static Error( title, errors ) {
        if ( !this._dialogBoxError ) {
            this._dialogBoxError = new GUI.Box.Box( "error", "box_error" );
            this._dialogBoxError.draw();
            this._dialogBoxError.declareButton( GUI.Box.Box.BUTTON_OK );
        }

        this._dialogBoxError.Title = title;
        this._dialogBoxError.Error = errors;

        this._dialogBoxError.open();
    }

    /**
     * Define a dialog box to show an error and to reload the page
     * @param {any} errors list of errors to show
     * @param {any} action function reloading the page
     */
    static Reload( errors, action ) {
        let messageReload = new GUI.Box.Box( "error", "box_reload" );
        messageReload.Title = "RELOAD";
        messageReload.Error = errors;
        messageReload.draw();
        messageReload.declareButton( "Reload", "BTN_RELOAD", action );
        messageReload.open();
    }
};
