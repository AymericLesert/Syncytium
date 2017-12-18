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

GUI.Field = {};

/*
 * Abstract class
 * Field in a screen :
 *  - box       : string describing the html container, an html object or a box
 *  - name      : identify the field
 *  - label     : string describing the label of the field (using Helper.Span)
 *                if label is missing or null, no label is shown
 *  - cssClass  : css class of the field
 */
GUI.Field.Field = class extends GUI.GUI {
    /**
     * @returns {any} HTML component of the field
     */
    get FieldZone () {
        return this.Component.find( "> .value > .field" );
    }

    /**
     * @returns {any} HTML component of the message
     */
    get MessageZone() {
        return this.Component.find( "> .value > .message" );
    }

    /**
     * @returns {any} HTML component of the error
     */
    get ErrorZone() {
        return this.Component.find( "> .value > .error" );
    }

    /**
     * Set a label to this field
     * @param {any} value multilingual label of the field label
     */
    set Label( value ) {
        this._label = Helper.Label( value );
    }

    /**
     * @returns {any} multilingual label of this field
     */
    get Label() {
        return this._label;
    }

    /**
     * Set a panel name to this field
     * @param {any} value panel name
     */
    set Panel( value ) {
        this._panel = value;
    }

    /**
     * @returns {any} panel name
     */
    get Panel() {
        return this._panel;
    }

    /**
     * @param {any} fn Add class 'link' on the label and execute the function on click event
     */
    set Link ( fn ) {
        this._fnLink = fn ? fn : null;
        this.refreshLink();
    }

    /**
     * Set a label to this field in message part (for information)
     * @param {any} message HTML code describing the text
     */
    set Message( message ) {
        if ( message === null || message === undefined || String.isEmptyOrWhiteSpaces( message ) ) {
            if ( this.Component.hasClass( "message" ) )
                this.Component.removeClass( "message" );
            this.MessageZone.html( "" );
            return;
        }

        if ( !this.Component.hasClass( "message" ) )
            this.Component.addClass( "message" );
        this.MessageZone.html( message );
    }

    /**
     * Set a list of multilingual label to this field in error part
     * @param {any} errors HTML code describing a list of multilingual labels of errors
     */
    set Error( errors ) {
        if ( errors === null || errors === undefined || String.isEmptyOrWhiteSpaces(errors) ) {
            if ( this.Component.hasClass( "error" ) )
                this.Component.removeClass( "error" );
            this.ErrorZone.html( "" );
            return;
        }

        this.debug( "Error = " + errors );
        if ( !this.Component.hasClass( "error" ) )
            this.Component.addClass( "error" );
        this.ErrorZone.html( errors );
    }

    /**
     * Set a value to this field
     * @param {any} value new value
     */
    set Value( value ) {
        var oldValue = this._value;
        var newValue = value;

        if ( value === undefined )
            value = null;

        this._value = value;

        if ( typeof this._value === 'string' )
            this._value = this._value.trim();
        else if ( this._value instanceof moment )
            this._value = this._value.format( List.List.TEXT_FORMAT_DATE );
        else if ( this._value instanceof Date )
            this._value = moment( this._value ).format( List.List.TEXT_FORMAT_DATE );

        if ( oldValue !== this._value ) {
            oldValue = oldValue !== undefined && oldValue !== null ? oldValue.toString() : "null";
            newValue = this._value !== undefined && this._value !== null ? this._value.toString() : "null";
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
     * @returns {any} Value (in a string) of this field
     */
    get Value() {
        return this._value;
    }

    /**
     * @returns {boolean} true if fnLink is defined
     */
    get IsLinked() {
        return this._fnLink !== null;
    }

    /**
     * Draw the field into the container
     */
    draw () {
        super.draw( "<field id='" + this.Name + "'><div class='label'></div><div class='value'><div class='field'></div><div class='message'></div><div class='error'></div></div></field>" );
        this.drawField( this.FieldZone );
    }

    /**
     * Abstract method to draw the field having or modifying the value
     * @param {any} container zone having the field
     */
    drawField ( container ) {
    }

    /**
     * Called on onOpenning just before setting a value
     */
    populate() {
        this.verbose( "Populate" );
    }

    /**
     * Called on onOpenning the field
     */
    onOpen() {
        function handleFocusField( field ) {
            return function () {
                if ( field.Box !== null )
                    field.Box.setFocus( field );
            };
        }

        super.onOpen();

        this.Component.on( 'focus', handleFocusField( this ) );
    }

    /**
     * Called on onClosing the field
     */
    onClose() {
        super.onClose();

        this.Component.off( 'focus' );
    }

    /**
     * (Abstract Method) Event raised on the entering
     */
    onFocusIn() { }

    /**
     * (Abstract Method) Event raised on the leaving
     */
    onFocusOut() { }

    /**
     * Refresh the label status and its link
     */
    refreshLink() {
        if ( this.Component === null )
            return;

        // Refresh label

        var labelComponent = this.Component.find( "> .label" );

        var value = Helper.Span( this._label );

        if ( String.isEmptyOrWhiteSpaces( value ) ) {
            labelComponent.html( "" );
            if ( !labelComponent.hasClass( "hide" ) )
                labelComponent.addClass( "hide" );
            return;
        }

        labelComponent.html( value );
        if ( labelComponent.hasClass( "hide" ) )
            labelComponent.removeClass( "hide" );

        // Refresh link

        labelComponent.off( 'click' );
        labelComponent.removeClass( 'link' );

        if ( this._fnLink ) {
            labelComponent.on('click', this._fnLink );
            labelComponent.addClass( 'link' );
        }
    }

    /**
     * Refresh the field
     */
    refresh () {
        super.refresh();

        if ( this.Component === null )
            return;

        // Refresh label

        this.refreshLink();
    }

    /**
     * constructor
     * @param {any} box      reference on the box containing the component (inheritance of the readonly and visible flag)
     * @param {any} name     name of the component
     * @param {any} label    multilingual label of the field
     * @param {any} cssClass class name to add to the component
     */
    constructor( box, name, label, cssClass ) {
        super( "field", box, name, cssClass );

        this._label = Helper.Label( label );
        this._value = null;
        this._fnLink = null;
        this._panel = null;
    }
};
