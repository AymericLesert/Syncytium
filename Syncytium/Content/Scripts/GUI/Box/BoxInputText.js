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
 * Define a text input object
 */
GUI.Box.BoxInputText = class extends GUI.Box.Box {
    /**
     * @param {any} value true or false (allow a new line into the string value)
     */
    set AllowRC ( value ) {
        this._allowRC = value !== undefined && value !== null && value;
    }

    /**
     * @returns {any} the file picture zone
     */
    get TextZone() {
        return this._content.find( "textarea" );
    }

    /**
     * @param {any} value value to set into the dialog box (here: a string)
     */
    set Value( value ) {
        this._value = String.convertValue( value );

        if ( this.Component === null )
            return;

        this.TextZone.val( this._value === null || this._value === undefined ? "" : this._value.toString() );
        this.resize();
    }

    /**
     * @returns {any} string written into the dialog box
     */
    get Value() {
        if ( this.Component === null )
            return this._value;

        return this.TextZone.val();
    }

    /**
     * Define the list of buttons of the dialog box
     * @param {any} container zone having the list of buttons
     */
    drawButton ( container ) {
        super.drawButton( container );

        this.addFocus( this.TextZone );
        this.declareButton( GUI.Box.Box.BUTTON_OK );
        this.declareButton( GUI.Box.Box.BUTTON_CANCEL, "BTN_CANCEL" );
    }

    /**
     * Draw and show the content of the dialog box
     * @param {any} container zone having the content
     */
    drawContent ( container ) {
        super.drawContent( container );

        this._content = container;
        this._content.append( "<textarea></textarea>" );
        this._content.show();

        // handle the window resizing

        function handleResize( box ) {
            return function () {
                if ( !box.IsOpened )
                    return;

                // Add a throttling on resizing

                clearTimeout( box._throttle );
                box._throttle = setTimeout( function () {
                    box.resize();
                }, 100 );
            };
        }

        $( window ).on( 'resize', handleResize( this ) );
    }

    /**
     * Called on openning the box
     */
    onOpen() {
        function handleKeydown( box ) {
            return function ( event ) {
                switch ( event.key ) {
                    case "Tab":
                        event.stopImmediatePropagation();
                        if ( event.shiftKey )
                            box.previousFocus();
                        else
                            box.nextFocus();
                        return false;

                    case "Enter":
                        if ( box._allowRC ) {
                            GUI.Box.BOX_RC = true;
                            return;
                        }

                        event.stopImmediatePropagation();
                        box.onButtonOK();
                        return false;

                    case "Escape":
                        event.stopImmediatePropagation();
                        box.onButtonCancel();
                        return false;
                }
            };
        }

        function handleFocus( box ) {
            return function () {
                $( this ).select();
            }
        }

        super.onOpen();

        this.TextZone.on( 'keydown', handleKeydown( this ) );
        this.TextZone.on( 'focus', handleFocus( this ) );

        // Handle resize

        function handleResize( box ) {
            return function () {
                box.resize();
            };
        }

        this.TextZone.on( 'change keyup paste', handleResize( this ) );
    }

    /**
     * Open the box
     */
    open() {
        super.open();
        this.firstFocus();
    }

    /**
     * Called on closing the box
     */
    onClose() {
        this.TextZone.off( 'change keyup paste keydown' );
    }

    /**
     * Refresh the textarea
     */
    refresh () {
        super.refresh();
        this.Value = this._value;
    }

    /**
     * Resize the textarea
     */
    resize () {
        if ( this.Component === null )
            return;

        let oldHeight = this.TextZone.height();
        this.TextZone.height( 1 );
        let newHeight = this.TextZone[0].scrollHeight;

        this.TextZone.height( newHeight > 1 ? newHeight : oldHeight );
    }

    /**
     * Constructor
     * @param {any} name name fo the dialog box
     */
    constructor( name ) {
        super( name, "box_inputtext" );

        this._allowRC = false;
        this._content = null;
        this._value = null;

        this.draw();
    }

    /**
     * @returns {GUI.Box.BoxInputText} a single instance of the dialog box
     */
    static get Instance() {
        if ( !this._instance )
            this._instance = new GUI.Box.BoxInputText( "inputtext" );

        return this._instance;
    }

    /**
     * Open the single screen choosen a file
     * @param {any} title   multilingual label describing the title of the dialog box
     * @param {any} message multilingual label describing the message
     * @param {any} value   initial value to put into the dialog boc
     * @param {any} allowRC true / false (allow multiline)
     * @param {any} action  function to call on validating
     */
    static Open( title, message, value, allowRC, action ) {
        GUI.Box.BoxInputText.Instance.Title = title;
        GUI.Box.BoxInputText.Instance.Message = message;
        GUI.Box.BoxInputText.Instance.Value = value;
        GUI.Box.BoxInputText.Instance.AllowRC = allowRC;
        GUI.Box.BoxInputText.Instance.Error = null;
        GUI.Box.BoxInputText.Instance.getButton( GUI.Box.Box.BUTTON_OK ).Action = action;
        GUI.Box.BoxInputText.Instance.open();
    }
};
