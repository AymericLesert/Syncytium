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
 * Define a box with a list of choices
 */
GUI.Box.BoxChoice = class extends GUI.Box.Box {
    /**
     * Define the list of choices possible into this dialog box
     * One button per choice
     * @param {any} choices array of choices {label: multilingual label, fn: function to call}
     */
    set Choices( choices ) {
        function handleSelectChoice( box, choice, fn ) {
            return function () {
                this.debug( "Select the choice '" + choice.toString() + "'" );
                try { fn(); } catch ( e ) { box.exception( "Unable to select the choice '" + choice.toString() + "' due to an exception", e ); }
                box.close();
            };
        }

        let container = this.ContentZone;
        if ( container === null )
            return;

        // clean up the list of existing choices

        container.empty();

        if ( choices === null || choices === undefined )
            return;

        // Build the list of buttons into the dialog box

        this.clearFocus();
        this.clearButtons();

        let i = 0;
        for ( let choice of choices ) {
            if ( choice === null || choice === undefined ||
                choice.label === null || choice.label === undefined ||
                choice.fn === null || choice.fn === undefined )
                continue;

            this.debug( "Choice (" + i + ") -> " + Language.Manager.Instance.interpolation( Helper.Label( choice.label ) ) );

            let newButton = this.declareButton( "Choice_" + i, choice.label );
            newButton.Action = handleSelectChoice( this, i, choice.fn );
            i++;
        }

        // Add Cancel button

        this.declareButton( GUI.Box.Box.BUTTON_CANCEL, "BTN_CANCEL" );
    }

    /**
     * Draw and show the content of the dialog box
     * @param {any} container zone having the content
     */
    drawContent ( container ) {
        super.drawContent( container );
        container.show();
    }

    /**
     * Open the dialog box
     */
    open() {
        super.open();
        this.firstFocus();
    }

    /**
     * Create a box which helps uers to make a choice (list of values)
     * @param {any} name box name
     */
    constructor( name ) {
        super( name, "box_choice" );
        this.draw();
    }

    /**
     * Define a dialog box of choices (only one for the whole of application)
     * @param {any} title   multilingual label describing the title of the box
     * @param {any} message multilingual label describing the message of the box
     * @param {any} choices array of choices {label: multilingual label, fn: function to call}
     */
    static BoxChoices( title, message, choices ) {
        if ( !this._boxChoices )
            this._boxChoices = new GUI.Box.BoxChoice( "choices" );

        if ( !this._boxChoices.IsOpened ) {
            this._boxChoices.Title = title;
            this._boxChoices.Message = message;
            this._boxChoices.Choices = choices;
            this._boxChoices.Error = null;

            this._boxChoices.open();
        }
    }
};
