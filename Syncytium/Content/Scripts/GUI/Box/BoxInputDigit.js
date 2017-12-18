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
 * Define a input object for digits
 */
GUI.Box.BoxInputDigit = class extends GUI.Box.Box {
    /**
     * @param {any} value multilingual label describing the field into this dialog box
     */
    set Label( value ) {
        this._label = Helper.Label( value );
    }

    /**
     * Set the format expected into the input digit box (0 or _ means numerical and any other characters fix values)
     * Ex: 000,00 - OF0000 - 00:00:00 - _____0,0
     * @param {string} format format to set
     */
    set Format( format ) {
        this._digits.Format = format;
    }

    /**
     * @returns {string} format expected
     */
    get Format() {
        return this._digits.Format;
    }

    /**
     * @param {any} digits digit format to apply into the box
     */
    set Digits( digits ) {
        if ( typeof digits === "string" )
            this._digits = new Digits.Digits( digits );
        else
            this._digits = digits === null || digits === undefined ? new Digits.Digits() : digits;
    }

    /**
     * @param {any} align 'left', 'center', 'right' (default)
     */
    set Align( align ) {
        this._align = align === 'left' || align === 'center' || align === 'right' ? align : 'right';
    }

    /**
     * @param {any} value value to set into the dialog box
     */
    set Value( value ) {
        this._digits.Value = value;
    }

    /**
     * @returns {any} value selected into the dialog box
     */
    get Value() {
        return this._digits.Value;
    }

    /**
     * @param {any} unit value to show after the field
     */
    set Unit( unit ) {
        this._unit = unit === null || unit === undefined ? null : unit;
        this.refresh();
    }

    /**
     * @param {any} unit value to show after the field
     */
    get Unit() {
        return this._unit;
    }

    /**
     * Destructor
     */
    destructor() {
        super.destructor();

        if ( this._calendar !== null ) {
            this._calendar.destructor();
            this._calendar = null;
        }
    }

    /**
     * Update the value on depends on the key
     * @param {any} key key to implement
     */
    addKey( key ) {
        this._digits.addKey( key );
        this.refresh();

        if ( this._calendar === null )
            return;

        // update the calendar

        let value = this._digits.Value;
        if ( value !== null ) {
            this._notRefresh = true;
            this._calendar.setValue( value.toDate() );
            this._notRefresh = false;
        }
    }

    /**
     * Define the list of buttons of the dialog box
     * @param {any} container zone having the list of buttons
     */
    drawButton( container ) {
        super.drawButton( container );
        this.declareButton( GUI.Box.Box.BUTTON_OK );
        this.declareButton( GUI.Box.Box.BUTTON_CANCEL, "BTN_CANCEL" );
    }

    /**
     * Draw and show the content of the dialog box
     * @param {any} container zone having the content
     */
    drawContent( container ) {
        let keyboard = ['7', '8', '9', '4', '5', '6', '1', '2', '3' ];
        let content = "";

        for ( let i = 0; i < keyboard.length; i++ )
            content += "<div class='key' key='" + keyboard[i] + "'><div>" + String.encode( keyboard[i] ) + "</div></div>";
        content += "<div class='key undo' key='undo'></div>";
        content += "<div class='key' key='0'><div>0</div></div>";
        content += "<div class='key next minus' key='next'></div>";
        content += "<div class='key value minus' key='minus'>" + String.encode( "-" ) + "</div>";

        this._content = container;

        this._content.append( "<field class='input field_input input_digit'>" +
                                "<div class='label'></div>" +
                                "<div class='value'><div class='field' tabindex=0></div></div>" +
                                "<div class='unit'></div>" +
                                "<div class='icon'></div>" +
                              "</field > " +
                              "<div id='keyboard'>" + content + "</div>" +
                              "<div id='calendar'></div>" );
        this._content.show();
    }

    /**
     * Method drawing the calendar (from Webix)
     */
    drawCalendar() {
        function handleOnChange( box ) {
            return function ( newDate ) {
                box._digits.setDate( newDate.getDate(), newDate.getMonth() + 1, 1900 + newDate.getYear());
                box.refresh();
            };
        }

        if ( this._calendar !== null ) {
            this._calendar.destructor();
            this._calendar = null;
        }

        if ( !( this._digits instanceof Digits.Datetime ) )
            return;

        let type = this._digits.WebixType;
        if ( type === null )
            return;

        this._calendar = new webix.ui( {
            view: "calendar",
            type: type === "day" ? undefined : type,
            container: this._content.find( "> #calendar" )[0],
            weekHeader: type === "day",
            weekNumber: type === "day",
            calendarDateFormat: this._digits.WebixFormat,
            on: {
                onDateSelect: handleOnChange( this )
            }
        } );

        let value = this._digits.Value;
        if ( value !== null ) {
            this._notRefresh = true;
            this._calendar.setValue( value.toDate() );
            this._notRefresh = false;
        }
    }

    /**
     * Called on openning the box
     */
    onOpen() {
        function handleKey( box ) {
            return function () {
                box.addKey( $( this ).attr( 'key' ) );
            };
        }

        function handleKeydown( box ) {
            return function ( event ) {
                let keyCode = event.which || event.keyCode;

                switch ( keyCode ) {
                    case 8:
                        event.preventDefault();
                        box.addKey( "undo" );
                        return;

                    case 9:
                        event.preventDefault();
                        if ( event.shiftKey )
                            box.previousFocus();
                        else
                            box.nextFocus();
                        return false;

                    case 13:
                        event.preventDefault();
                        box.onButtonOK();
                        return;

                    case 27:
                        event.preventDefault();
                        box.onButtonCancel();
                        return;

                    case 46:
                        event.preventDefault();
                        box.addKey( "raz" );
                        return false;
                }
            };
        }

        function handleKeypress( box ) {
            return function ( event ) {
                let keyCode = event.which || event.keyCode;

                if ( keyCode < 32 )
                    return;

                box.addKey( String.fromCharCode( keyCode ) );
            };
        }

        function handleRAZ( box ) {
            return function () {
                box._digits.RAZ();
                box.refresh();
            };
        }

        super.onOpen();

        this.clearFocus();
        this.addFocus( "field > .value > .field" );
        this.addFocus( this.getButton( GUI.Box.Box.BUTTON_OK ) );
        this.addFocus( this.getButton( GUI.Box.Box.BUTTON_CANCEL ) );

        this.Component.find( '#keyboard > .key' ).on( 'click', handleKey( this ) );
        this.Component.find( 'field > .value > .field' ).on( 'keydown', handleKeydown( this ) );
        this.Component.find( 'field > .value > .field' ).on( 'keypress', handleKeypress( this ) );
        this.Component.find( 'field > .icon' ).on( 'click', handleRAZ( this ) );

        this._digits.selectAll();
    }

    /**
     * Open the box
     */
    open() {
        function handleOnChangeLanguage( box ) {
            return function ( currentLanguage, language, key ) {
                if ( box._calendar === null || language !== undefined )
                    return;

                box.drawCalendar();
            };
        }

        super.open();

        this.drawCalendar();
        this._languageListener = Language.Manager.Instance.addListener( handleOnChangeLanguage( this ) );
    }

    /**
     * Called on closing the box
     */
    onClose() {
        super.onClose();

        if ( this._calendar !== null ) {
            this._calendar.destructor();
            this._calendar = null;
        }

        if ( this._languageListener !== null ) {
            Language.Manager.Instance.removeListener( this._languageListener );
            this._languageListener = null;
        }

        this.Component.find( '#keyboard > .key' ).off( 'click' );
        this.Component.find( 'field > .value > .field' ).off( 'keydown keypress' );
        this.Component.find( 'field > .icon' ).off( 'click' );
    }

    /**
     * Refresh the field
     */
    refresh() {
        super.refresh();

        if ( this.Component === null )
            return;

        // update the value

        let value = this._digits.toString();

        this.Component.find( "field > .value > .field" ).html( String.encode( value ) );

        // update label

        value = Helper.Span( this._label );

        var labelComponent = this.Component.find( "field > .label" );
        if ( String.isEmptyOrWhiteSpaces( value ) ) {
            labelComponent.html( "" );
            if ( !labelComponent.hasClass( "hide" ) )
                labelComponent.addClass( "hide" );
        } else {
            labelComponent.html( value );
        }

        // next key update

        let nextKey = this.Component.find( "#keyboard > .next" );
        let nextTokenFix = this._digits.NextTokenFix;
        if ( !String.isEmptyOrWhiteSpaces( nextTokenFix ) ) {
            if ( nextKey.hasClass( "empty" ) )
                nextKey.removeClass( "empty" );
            this.Component.find( "#keyboard > .next" ).html( String.encode( nextTokenFix ) );
        } else {
            if ( !nextKey.hasClass( "empty" ) )
                nextKey.addClass( "empty" );
            this.Component.find( "#keyboard > .next" ).html( "" );
        }

        // minus key update

        if ( this._digits.AllowNegativeValue ) {
            if ( !nextKey.hasClass( "minus" ) )
                nextKey.addClass( "minus" );

            this.Component.find( "#keyboard > .key.value.minus" ).show();
        } else {
            if ( nextKey.hasClass( "minus" ) )
                nextKey.removeClass( "minus" );

            this.Component.find( "#keyboard > .key.value.minus" ).hide();
        }

        // undo key update

        let undoKey = this.Component.find( "#keyboard > .undo" );
        if ( this._digits.HasUndo ) {
            if ( undoKey.hasClass( "empty" ) )
                undoKey.removeClass( "empty" );
        } else {
            if ( !undoKey.hasClass( "empty" ) )
                undoKey.addClass( "empty" );
        }

        // update the unit part of the field

        let unitZone = this.Component.find( "field > .unit" );
        if ( unitZone.length > 0 ) {
            let unit = String.encode( this._unit );

            if ( String.isEmptyOrWhiteSpaces( unit ) ) {
                if ( !unitZone.hasClass( "hide" ) )
                    unitZone.addClass( "hide" );
            } else {
                if ( unitZone.hasClass( "hide" ) )
                    unitZone.removeClass( "hide" );

                unitZone.html( unit );
            }
        }

        // align the value

        let valueZone = this.Component.find( "field > .value > .field" );
        valueZone.css( 'text-align', this._align );

        // show calendar or keyboard

        let calendarZone = this.Component.find( "#calendar" );
        let keyboardZone = this.Component.find( "#keyboard" );

        if ( this._digits.IsCalendar ) {
            if ( calendarZone.hasClass( "hide" ) )
                calendarZone.removeClass( "hide" );

            if ( !keyboardZone.hasClass( "hide" ) )
                keyboardZone.addClass( "hide" );
        } else {
            if ( !calendarZone.hasClass( "hide" ) )
                calendarZone.addClass( "hide" );

            if ( keyboardZone.hasClass( "hide" ) )
                keyboardZone.removeClass( "hide" );
        }

        // set the focus on the first field

        this.firstFocus();
    }

    /**
     * Constructor
     * @param {any} name name of the dialog box (selecting a date)
     * @param {any} digits instance of Digits describing the numerical expected format
     */
    constructor( name, digits ) {
        super( name, "box_inputdigit" );

        this._content = null;
        this._label = null;
        this._unit = null;
        this._align = "right";
        this._calendar = null;
        this._languageListener = null;
        this._notRefresh = false;

        if (typeof digits === "string")
            this._digits = new Digits.Digits(digits);
        else
            this._digits = digits === null || digits === undefined ? new Digits.Digits() : digits;

        this.draw();
    }

    /**
     * Define a single box showing a digit box
     * @param {any} title   multilingual label of the title
     * @param {any} label   multilingual label of the message
     * @param {any} unit    value describing the unity of the value
     * @param {any} digits  digits to apply
     * @param {any} align   'left', 'center' or 'right'
     * @param {any} action  function to call if a treatment must be done on validation
     * @param {any} cancel  function to call if a treatment must be done on cancellation
     */
    static Digit( title, label, unit, digits, align, action, cancel ) {
        if ( !this._dialogBoxDigit )
            this._dialogBoxDigit = new GUI.Box.BoxInputDigit( "digits" );

        this._dialogBoxDigit.Title = title;
        this._dialogBoxDigit.Label = label;
        this._dialogBoxDigit.Unit = unit;
        this._dialogBoxDigit.Digits = digits;
        this._dialogBoxDigit.Align = align;
        this._dialogBoxDigit.getButton( GUI.Box.Box.BUTTON_OK ).Action = action;
        this._dialogBoxDigit.getButton( GUI.Box.Box.BUTTON_CANCEL ).Visible = action !== null && action !== undefined;
        this._dialogBoxDigit.getButton( GUI.Box.Box.BUTTON_CANCEL ).Action = cancel;

        this._dialogBoxDigit.open();
    }
};
