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
 * Define a digit input object
 */
GUI.Field.FieldInputDigit = class extends GUI.Field.Field {
    /**
     * @param {any} value true if the keyboard is shown on focus and disappears on blur
     */
    set ShowKeyboard( value ) {
        this._showKeyboard = value !== null && value !== undefined && value === true;
    }

    /**
     * @param {any} value true if the value is a string
     */
    set AsString( value ) {
        this._asString = value !== null && value !== undefined && value === true;
    } 

    /**
     * Set a value to this field
     * @param {any} value new value
     */
    set Value( value ) {
        if ( this._asString && typeof value === "string" ) {
            let newValue = "";
            for ( let i = 0; i < value.length; i++ )
                if ( '0' <= value[i] && value[i] <= '9' )
                    newValue += value[i];
            value = newValue;
        }

        let oldValue = this._digits.Value;
        this._digits.Value = value;

        if ( oldValue !== value ) {
            oldValue = oldValue !== undefined && oldValue !== null ? oldValue.toString() : "null";
            let newValue = value !== undefined && value !== null ? value.toString() : "null";
            this.debug( "Replace the value '" + oldValue + "' to '" + newValue + "'" );
            if ( this.IsOpened ) {
                this.refresh();
                this.raise( 'change' );
            }
        } else if ( this.IsOpened ) {
            this.refresh();
        }
    }

    /**
     * @returns {any} Value of this field (depends on the digit)
     */
    get Value() {
        if ( this._digits.IsNull )
            return null;

        if ( this._asString )
            return this._digits.toString();

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
     * @param {number} nbDecimals number of digits just after the coma
     */
    set NbDecimals( nbDecimals ) {
        if ( !this._digits instanceof Digits.Decimal )
            return;

        let newDigits = new Digits.Decimal( this._digits.NbDigitBefore, nbDecimals );
        newDigits.Value = this._digits.Value;
        this._digits = newDigits;
        this.refresh();
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
        if ( this.Readonly )
            return;

        if ( key === "undo" && this._digits._undo.length === 0 )
            this._digits.addKey( "raz" );

        let oldValue = this._digits.Value;
        this._digits.addKey( key );
        let value = this._digits.Value;

        if ( oldValue !== value ) {
            oldValue = oldValue !== undefined && oldValue !== null ? oldValue.toString() : "null";
            let newValue = value !== undefined && value !== null ? value.toString() : "null";
            if ( this.IsOpened ) {
                this.refresh();
                this.raise( 'change' );
            }
        } else if ( this.IsOpened ) {
            this.refresh();
        }

        if ( this._calendar === null )
            return;

        // update the calendar

        if ( value !== null ) {
            this._notRefresh = true;
            this._calendar.setValue( value.toDate() );
            this._notRefresh = false;
        }
    }

    /**
     * Method drawing the calendar (from Webix)
     */
    drawCalendar() {
        function handleOnChange( field ) {
            return function ( newDate ) {
                if ( field._notRefresh )
                    return;

                field._digits.setDate( newDate.getDate(), newDate.getMonth() + 1, 1900 + newDate.getYear() );
                field.refresh();
                field.raise( 'change' );
                field.focus();
            };
        }

        if ( this._calendar !== null ) {
            this._calendar.destructor();
            this._calendar = null;
        }

        if ( !( this._digits instanceof Digits.Datetime ) || !this._showKeyboard )
            return;

        let type = this._digits.WebixType;
        if ( type === null )
            return;

        this._calendar = new webix.ui( {
            view: "calendar",
            type: type === "day" ? undefined : type,
            container: this.Component.find( "#calendar" )[0],
            weekHeader: type === "day",
            weekNumber: type === "day",
            calendarDateFormat: this._digits.WebixFormat,
            on: {
                onChange: handleOnChange( this )
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
     * Draw the field having or modifying the value
     * @param {any} container zone having the field
     */
    drawField( container ) {
        let keyboard = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];
        let content = "<div id='field'><div class='field'></div><div class='unit'></div></div>";

        content += "<div id='keyboard' class='hide'>";
        for ( let i = 0; i < keyboard.length; i++ )
            content += "<div class='key' key='" + keyboard[i] + "'><div>" + String.encode( keyboard[i] ) + "</div></div>";
        content += "<div class='key undo' key='undo'></div>";
        content += "<div class='key' key='0'><div>0</div></div>";
        content += "<div class='key next minus' key='next'></div>";
        content += "<div class='key value minus' key='minus'>" + String.encode( "-" ) + "</div>";
        content += "</div>";
        content += "<div id='calendar'></div>";

        container.append( content );
    }

    /**
     * Called on openning the box
     */
    onOpen() {
        function handleOnChangeLanguage( field ) {
            return function ( currentLanguage, language, key ) {
                if ( field._calendar === null || language !== undefined )
                    return;

                field.drawCalendar();
            };
        }

        function handleKeydown( field ) {
            return function ( event ) {
                let keyCode = event.which || event.keyCode;

                switch ( keyCode ) {
                    case 8:
                        event.preventDefault();
                        field.addKey( "undo" );
                        return false;

                    case 9:
                        event.preventDefault();
                        if ( event.shiftKey )
                            field.previousFocus();
                        else
                            field.nextFocus();
                        return false;

                    case 13:
                        event.preventDefault();
                        field.onButtonOK();
                        return false;

                    case 27:
                        event.preventDefault();
                        field.onButtonCancel();
                        return false;

                    case 46:
                        event.preventDefault();
                        field.addKey( "raz" );
                        return false;
                }
            };
        }

        function handleKeypress( field ) {
            return function ( event ) {
                let keyCode = event.which || event.keyCode;

                if ( keyCode < 32 )
                    return;

                event.preventDefault();
                field.addKey( String.fromCharCode( keyCode ) );
            };
        }

        function handleKey( field ) {
            return function () {
                field.addKey( $( this ).attr( 'key' ) );
                field.focus();
            };
        }

        function handleBoxDigit( field ) {
            return function () {
                function handleAction( field ) {
                    return function (value) {
                        field.Value = value;
                        field.focus();
                    };
                }

                function handleCancel( field ) {
                    return function () {
                        field.focus();
                    };
                }

                if ( field.Readonly || field._showKeyboard )
                    return;

                let title = null;
                if ( field.Box instanceof GUI.Box.Box ) {
                    if ( field.Box.List !== null && field.Box.List !== undefined && field.Box.List.Table !== null && field.Box.List.Table !== undefined )
                        title = field.Box.List.Table.toUpperCase() + "_SELECT_" + field.Name.toUpperCase();
                }
                if ( title === null || Language.Manager.Instance.getLabel( DSDatabase.Instance.CurrentLanguage, title ) === null )
                    title = "TITLE_SELECT_" + field.Name.toUpperCase();

                if ( Language.Manager.Instance.getLabel( DSDatabase.Instance.CurrentLanguage, title ) === null )
                    title = "TITLE_SELECT_" + field._digits.Type.toUpperCase();

                GUI.Box.BoxInputDigit.Digit( title, field.Label, field.Unit, field._digits.clone(),
                    field.Component.find( ".value > .field > #field > .field" ).css( 'text-align' ),
                    handleAction( field ), handleCancel( field ) );
            };
        }

        super.onOpen();

        this.drawCalendar();
        this._languageListener = Language.Manager.Instance.addListener( handleOnChangeLanguage( this ) );

        this.Component.on( 'keydown', handleKeydown( this ) );
        this.Component.on( 'keypress', handleKeypress( this ) );
        this.Component.on( 'dblclick', handleBoxDigit( this ) );
        this.Component.find( '#keyboard > .key' ).on( 'click', handleKey( this ) );

        this._digits.selectAll();
    }

    /**
     * Called on closing the field
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

        this.Component.off( 'keydown keypress dblclick' );
        this.Component.find( '#keyboard > .key' ).off( 'click' );
    }

    /**
     * Event raised on the entering
     */
    onFocusIn() {
        super.onFocusIn();

        this._digits.selectAll();

        this._keyboardVisible = true;

        // show calendar or keyboard

        if ( this._showKeyboard ) {
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
        }
    }

    /**
     * Event raised on the leaving
     */
    onFocusOut() {
        super.onFocusIn();

        let calendarZone = this.Component.find( "#calendar" );
        let keyboardZone = this.Component.find( "#keyboard" );

        this._keyboardVisible = false;

        if ( !keyboardZone.hasClass( "hide" ) )
            keyboardZone.addClass( "hide" );

        if ( !calendarZone.hasClass( "hide" ) )
            calendarZone.addClass( "hide" );
    }

    /**
     * Refresh the field
     */
    refresh () {
        super.refresh();

        if ( this.Component === null )
            return;

        // update the value

        let value = this._digits.toString();
        this.FieldZone.find( ".field" ).html( String.isEmptyOrWhiteSpaces( value ) ? "0" : String.encode( value ) );

        // update the unit part of the field

        let unitZone = this.FieldZone.find( ".unit" );
        if ( unitZone.length > 0 ) {
            let unit = String.encode( this._unit );

            if ( String.isEmptyOrWhiteSpaces( unit  ) ) {
                if ( !unitZone.hasClass( "hide" ) )
                    unitZone.addClass( "hide" );
            } else {
                if ( unitZone.hasClass( "hide" ) )
                    unitZone.removeClass( "hide" );

                unitZone.html( unit );
            }
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

        // show calendar or keyboard

        let calendarZone = this.Component.find( "#calendar" );
        let keyboardZone = this.Component.find( "#keyboard" );

        if ( this._keyboardVisible && this._showKeyboard ) {
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
        } else {
            if ( !calendarZone.hasClass( "hide" ) )
                calendarZone.addClass( "hide" );

            if ( !keyboardZone.hasClass( "hide" ) )
                keyboardZone.addClass( "hide" );
        }
    }

    /**
     * Constructor
     * @param {any} box    reference on the box containing the component (inheritance of the readonly and visible flag)
     * @param {any} name   name of the component
     * @param {any} label  multilingual label of the field
     * @param {any} digits instance of digit to use in this componen
     * @param {any} unit   label matching the unit value (post fix)
     */
    constructor( box, name, label, digits, unit ) {
        digits = digits === null || digits === undefined ? new Digits.Digits() : digits;

        super( box, name, label, "field_input_digit " + digits.Type );

        this._digits = digits;
        this._unit = unit === null || unit === undefined ? null : unit;
        this._showKeyboard = false;
        this._calendar = null;
        this._languageListener = null;
        this._keyboardVisible = false;
        this._notRefresh = false;
        this._asString = false;

        this.draw();
    }
};
