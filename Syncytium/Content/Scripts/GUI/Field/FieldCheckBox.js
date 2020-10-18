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
 * Define a check box (within 2 or 3 states)
 */
GUI.Field.FieldCheckBox = class extends GUI.Field.Field {
    /**
     * Set the third status of the check box
     * @param {boolean} value true if allowing null value
     */
    set AllowNullValue( value ) {
        this._allowNullValue = value !== null && value !== undefined && value;
    }

    /**
     * Set a value to this field
     * @param {any} value new value
     */
    set Value( value ) {
        // convert the value to a boolean before setting it

        if ( !this._allowNullValue && ( value === null || value === undefined ) )
            value = true;

        switch ( typeof value ) {
            case "boolean":
                break;
            case "number":
                value = value !== 0;
                break;
            case "string":
                value = value.toUpperCase() === "TRUE" || value.toUpperCase() === "OK" || value === "1";
                break;
            default:
                value = this._allowNullValue ? null : true;
                break;
        }

        super.Value = value;
    }

    /**
     * @returns {any} Value (in a string) of this field
     */
    get Value() {
        return super.Value;
    }

    /**
     * @returns {string} Text value of the current value
     */
    get Text () {
        let text = "";
        let i = -1;

        switch ( this.Value ) {
            case null:
                i = 0;
                break;
            case true:
                i = 1;
                break;
            default:
                i = 2;
                break;
        }

        if ( this._labels === null || this._labels === undefined || this._labels[i] === null || this._labels[i] === undefined )
            return "";

        text = Language.Manager.Instance.interpolation( this._labels[i] );
        if ( String.isEmptyOrWhiteSpaces( text ) )
            return "";

        return text.trim();
    }

    /**
     * Draw the field having or modifying the value
     * @param {any} container zone having the field
     */
    drawField( container ) {
        container.append( "<div></div>" );
    }

    /**
     * Click on the check box to change the value
     */
    onMouseClick() {
        if ( this.Readonly )
            return;

        switch ( this.Value ) {
            case true:
                this.Value = this._allowNullValue ? null : false;
                break;
            case null:
                this.Value = false;
                break;
            default:
                this.Value = true;
                break;
        }

        if ( GUI.Webix.Tooltip.Instance.IsVisible )
            GUI.Webix.Tooltip.Instance.show( String.encode( this.Text ) );
    }

    /**
     * Called on openning the field
     */
    onOpen() {
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
                        event.stopImmediatePropagation();
                        field.onButtonOK();
                        return false;

                    case "Escape":
                        event.stopImmediatePropagation();
                        field.onButtonCancel();
                        return false;

                    case " ":
                        event.stopImmediatePropagation();
                        field.onMouseClick();
                        return false;
                }
            };
        }

        super.onOpen();

        this.Component.on( 'keydown', handleKeydown( this ) );
    }

    /**
     * Called on closing the field
     */
    onClose() {
        super.onClose();

        this.Component.off( 'keydown' );
        this.FieldZone.find( "div" ).off( 'click mouseenter mousemove mouseleave' );
    }

    /**
     * Refresh the field
     */
    refresh () {
        function handleClick( field ) {
            return function () {
                field.onMouseClick();
            };
        }

        function handleHover( field ) {
            return function ( event ) {
                GUI.Webix.Tooltip.Instance.show( String.encode( field.Text ), event );
            };
        }

        function handleOut( field ) {
            return function ( event ) {
                GUI.Webix.Tooltip.Instance.hide();
            };
        }

        super.refresh();

        if ( this.Component === null )
            return;

        let element = this.FieldZone.find( "div" );

        if ( this.Readonly ) {
            element.css( 'cursor', 'initial' );
            element.off( 'click' );
        } else {
            element.css( 'cursor', 'pointer' );
            element.off( 'click' ).on( 'click', handleClick( this ) );
        }

        element.off( 'mouseenter mousemove mouseleave' );
        if ( this._labels !== null )
            element.on( 'mouseenter', handleHover( this ) ).on( 'mouseleave', handleOut (this) ).on( 'mousemove', handleHover( this ) );

        element.removeClass( 'true' );
        element.removeClass( 'false' );
        element.removeClass( 'null' );

        switch ( this.Value ) {
            case true:
                element.addClass( 'true' );
                break;
            case false:
                element.addClass( 'false' );
                break;
            case null:
                element.addClass( 'null' );
                break;
        }
    }

    /**
     * constructor
     * @param {any} box            reference on the box containing the component (inheritance of the readonly and visible flag)
     * @param {any} name           name of the component
     * @param {any} label          multilingual label of the field
     * @param {any} labels         array of multilingual labels describing each value (undefined, checked, unchecked)
     */
    constructor( box, name, label, labels ) {
        super( box, name, label, "field_checkbox" );
        this._allowNullValue = false;
        this._labels = labels ? labels : null;
        this.draw();
    }
};
