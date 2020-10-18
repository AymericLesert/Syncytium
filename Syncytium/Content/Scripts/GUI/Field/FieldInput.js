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
GUI.Field.FieldInput = class extends GUI.Field.Field {
    /**
     * @returns {string} "input"
     */
    static get TYPE_INPUT() {
        return "input";
    }

    /**
     * @returns {string} "textarea"
     */
    static get TYPE_TEXTAREA() {
        return "textarea";
    }

    /**
     * Set a value to this field
     * @param {any} value new value
     */
    set Value(value) {
        super.Value = value;
    }

    /**
     * @returns {any} Value (in a string) of this field
     */
    get Value() {
        if ( this.Component === null )
            return super.Value;

        return this.FieldZone.find( this._type ).val().trim();
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
     * @param {any} allowRC set allow RC into the field
     */
    set AllowRC( allowRC ) {
        this._allowRC === GUI.Field.FieldInput.TYPE_INPUT ? false : ( allowRC !== null && allowRC !== undefined && allowRC === true );
    }

    /**
     * Called on onOpenning the field
     */
    onOpen() {
        function handleChangeValue( field ) {
            return function () {
                let currentValue = $( this ).val();
                field._value = currentValue; // avoid to raise again the changing values

                if ( field._maxLength !== null ) {
                    if ( field._maxLength > 0 && currentValue.length >= parseInt(( field._maxLength * 9 / 10 ) ) )
                        field.Message = Helper.Span( "FIELD_MAX_LENGTH", field._maxLength );
                    else
                        field.Message = null;
                }

                // Add a throttling on changing the value of the field

                clearTimeout( field._throttle );
                field._throttle = setTimeout( () => { field.raise( 'change' ); }, 300 );
            };
        }

        function handleKeydown( field ) {
            return function ( event ) {
                switch ( event.key ) {
                    case "Tab":
                        event.stopImmediatePropagation();
                        if ( event.shiftKey )
                            field.previousFocus();
                        else
                            field.nextFocus();
                        return false;

                    case "Enter":
                        if ( field._allowRC ) {
                            GUI.Box.BOX_RC = true;
                            return;
                        }

                        event.stopImmediatePropagation();
                        field.onButtonOK();
                        return false;

                    case "Escape":
                        event.stopImmediatePropagation();
                        field.onButtonCancel();
                        return false;
                }
            };
        }

        function handleBlurField( field ) {
            return function () {
                // Clean up the throttling on changing the value of the field
                if ( field._throttle !== null ) {
                    clearTimeout( field._throttle );
                    field._throttle = null;
                    field.raise( 'change' );
                }
            };
        }

        function handleFocusField( field, input ) {
            return function () {
                if ( field.Box !== null )
                    field.Box.setFocus( field );

                if ( !input )
                    field.FieldZone.find( field._type ).focus();
            };
        }

        super.onOpen();

        this.FieldZone.find( this._type ).on( 'keydown', handleKeydown( this ) )
            .on( 'input', handleChangeValue( this ) )
            .on( 'blur', handleBlurField( this ) )
            .on( 'focus', handleFocusField( this, true ) );

        this.Component.off( 'focus' ).on( 'focus', handleFocusField( this, false ) );
    }

    /**
     * Called on onClosing the field
     */
    onClose() {
        super.onClose();

        this.FieldZone.find( this._type ).off( 'keydown input blur' );
    }

    /**
     * Refresh the field
     */
    refresh () {
        super.refresh();

        if ( this.Component === null )
            return;

        let element = this.FieldZone.find( this._type );

        element.prop( 'disabled', this.Readonly );
        element.val( String.isEmptyOrWhiteSpaces( this._value ) ? "" : this._value.toString() );

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

                this.FieldZone.find( ".unit" ).html( unit );
            }
        }

        // update the max length of the field

        if ( this._maxLength !== null )
            element.attr( 'maxlength', this._maxLength);
    }

    /**
     * Draw the field having or modifying the value
     * @param {any} container zone having the field
     */
    drawField ( container ) {
        switch ( this._type ) {
            case GUI.Field.FieldInput.TYPE_INPUT:
                container.append( "<input type='text' /><div class='unit'></div>" );
                break;
            case GUI.Field.FieldInput.TYPE_TEXTAREA:
                container.append( "<textarea></textarea>" );
                break;
        }
    }

    /**
     * Set the focus on a field
     * @returns {boolean} true if the focus is on
     */
    focus() {
        if ( !super.focus() )
            return false;

        this.Component.find( this._type ).focus().select();
        return true;
    }

    /**
     * Constructor
     * @param {any} box       reference on the box containing the component (inheritance of the readonly and visible flag)
     * @param {any} name      name of the component
     * @param {any} label     multilingual label of the field
     * @param {any} type      "input" or "textarea"
     * @param {any} unit      label matching the unit value (post fix)
     * @param {any} maxLength maximum length of the field
     */
    constructor( box, name, label, type, unit, maxLength ) {
        type = type ? type : GUI.Field.FieldInput.TYPE_INPUT;

        super( box, name, label, "field_" + type );

        this._type = type ? type : GUI.Field.FieldInput.TYPE_INPUT;
        this._unit = unit === null || unit === undefined ? null : unit;
        this._allowRC = this._type === GUI.Field.FieldInput.TYPE_TEXTAREA;
        this._maxLength = maxLength === null || maxLength === undefined || isNaN( parseInt( maxLength ) ) ? null : parseInt( maxLength );
        this._maxLength = this._maxLength <= 0 ? null : this._maxLength;
        this.draw();
    }
};
