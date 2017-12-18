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

GUI.Button = {};

/**
 * Handling buttons
 */
GUI.Button.Button = class extends GUI.GUI {
    /**
     * Set a label to this button
     * @param {any} value multilingual label on the button
     */
    set Label( value ) {
        this._label = Helper.Label( value );
    }

    /**
     * Set the action on clicking on the button
     * @param {any} value function to call on clicking on the button
     */
    set Action ( value ) {
        this._action = value ? value : null;
    }

    /**
     * Get the read only flag of the component
     * Do not take into account the box status ...
     * @returns {boolean} read only flag
     */
    get Readonly() {
        return this._readonly;
    }

    /**
     * Set the read only flag of the component
     * @param {boolean} value set the read only flag of the GUI component
     */
    set Readonly( value ) {
        super.Readonly = value;
    }

    /*
     * Draw the button into the container
     */
    draw () {
        super.draw( "<button id='" + this.Name + "'>" + Helper.Span( this._label ) + "</button>" );
    }

    /**
     * Called on onOpenning the field
     */
    onOpen() {
        function handleClick( button ) {
            return function () {
                if ( button.Readonly )
                    return;

                try {
                    if ( button._action === null ) {
                        if ( button.Box !== null )
                            button.Box.close();
                        return;
                    }

                    var value = null;

                    if ( button.Box !== null && !String.isEmptyOrWhiteSpaces( button.Box.Value ) ) {
                        value = button.Box.Value;
                        let result = button.Box.checkValue( value );
                        if ( result !== true ) {
                            button.Box.Error = result;
                            return;
                        }
                    }

                    var result = button.Box === null ? button._action() : button._action( value );

                    if ( typeof result === "boolean" ) {
                        if ( result && button.Box !== null )
                            button.Box.close();
                        return;
                    }

                    if ( typeof result === "string" || result instanceof Errors ) {
                        if ( button.Box !== null )
                            button.Box.Error = result;
                        return;
                    }

                    if ( button.Box !== null )
                        button.Box.close();
                } catch ( e ) {
                    button.exception( "Unexpected error on clicking", e );
                    if ( button.Box !== null )
                        button.Box.Error = "ERR_EXCEPTION_UNEXPECTED";
                }
            };
        }

        function handleFocus( button ) {
            return function () {
                if ( button.Readonly )
                    return;

                if ( button.Box !== null )
                    button.Box.setFocus( button );
            };
        }

        function handleKeydown( button ) {
            return function ( event ) {
                let keyCode = event.which || event.keyCode;

                switch ( keyCode ) {
                    case 9:
                        event.preventDefault();
                        if ( event.shiftKey )
                            button.previousFocus();
                        else
                            button.nextFocus();
                        return false;

                    case 27:
                        event.preventDefault();
                        button.onButtonCancel();
                        return false;

                    case 13:
                    case 32:
                        event.preventDefault();
                        button.onMouseClick();
                        return false;
                }
            };
        }

        super.onOpen();

        this.Component.on( 'focus', handleFocus( this ) );
        this.Component.on( 'keydown', handleKeydown( this ) );
        this.Component.on( 'click', handleClick( this ) );
    }

    /**
     * Called on onClosing the field
     */
    onClose() {
        super.onClose();

        this.Component.off( 'focus keydown click' );
    }

    /**
     * Refresh the button
     */
    refresh () {

        super.refresh();

        if ( this.Component === null )
            return;

        // set label

        var value = Helper.Span( this._label );

        if ( String.isEmptyOrWhiteSpaces( value ) ) {
            this.Component.html( "" );
            this.Component.hide();
            return;
        }

        this.Component.html( value );

        // set readonly

        if ( this.Readonly ) {
            if ( !this.Component.hasClass( "readonly" ) )
                this.Component.addClass( "readonly" );
            return;
        }

        if ( this.Component.hasClass( "readonly" ) )
            this.Component.removeClass( "readonly" );
    }

    /**
     * Raise a click event on this button
     */
    onMouseClick() {
        if ( !this.Visible || this.Readonly || this.Component === null )
            return;

        this.Component.click();
    }

    /**
     * constructor
     * @param {any} box      reference on the box containing the component (inheritance of the readonly and visible flag)
     * @param {any} name     name of the component
     * @param {any} cssClass class name to add to the component
     * @param {any} label    multilingual label on the button
     * @param {any} action   function to call on clicking on this button
     */
    constructor( box, name, cssClass, label, action ) {
        super( "button", box, name, cssClass );

        if ( box instanceof GUI.Box.BoxChoice )
            this._container = box.ContentZone;
        else if ( box instanceof GUI.Box.Box )
            this._container = box.ButtonZone;

        this._label = Helper.Label( label );
        if ( this._label.label === null )
            this._label = Helper.Label( "BTN_OK" );
        this._action = action ? action : null;

        this.draw();
    }
};
