﻿/// <reference path="../../_references.js" />

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
 * Define a select list object
 */
GUI.Field.FieldSelect = class extends GUI.Field.Field {
    /**
     * Add a first row corresponding to null value
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
        if ( value !== null && value !== undefined || this._allowNullValue ) {
            super.Value = value;
            return;
        }

        this.setFirstValueNotNull();
    }

    /**
     * @returns {any} Value (in a string) of this field
     */
    get Value() {
        if ( this.Component === null )
            return super.Value;

        let value = this.FieldZone.find( "select" ).val();
        if ( String.isEmptyOrWhiteSpaces( value ) )
            return null;

        return value.trim();
    }

    /**
     * Add a value in the list even if the value is not filtered
     * @param {any} value value to add even if the value is not filtered
     */
    set ExcludeValueToFilter ( value ) {
        this._valueAdded = value === null || value === undefined ? null : value;
    }

    /**
     * @returns {any} the current list of items
     */
    get List() {
        return this._list;
    }

    /**
     * Draw the field having or modifying the value
     * @param {any} container zone having the field
     */
    drawField ( container ) {
        container.append( "<select></select><div class='icon'></div>" );
    }

    /**
     * Raise the click event
     */
    onMouseClick() {
        if ( this.Component === null || this.Readonly )
            return;

        this.FieldZone.find( ".icon" ).click();
    }

    /**
     * Set the focus on a field
     * @returns {boolean} true if the focus is set on the component
     */
    focus() {
        if ( !super.focus() )
            return false;

        this.Component.find( "select" ).focus();
        return true;
    }

    /**
     * Sort text into the combo select 
     */
    sort() {
        let options = this.FieldZone.find( "select > option" );
        options.detach().sort( ( a, b ) => {
            let t1 = $( a ).text();
            let t2 = $( b ).text();

            if ( String.isEmptyOrWhiteSpaces( t1 ) && String.isEmptyOrWhiteSpaces( t2 ) )
                return 0;
            if ( String.isEmptyOrWhiteSpaces( t1 ) )
                return -1;
            if ( String.isEmptyOrWhiteSpaces( t2 ) )
                return 1;

            return t1 > t2 ? 1 : t1 < t2 ? - 1 : 0;
        } );
        options.appendTo( this.FieldZone.find( "select" ) );
    }

    /**
     * Called on onOpenning just before setting a value
     */
    populate() {
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
                }
            };
        }

        function handleFocusField( field, select ) {
            return function () {
                if ( field.Box !== null )
                    field.Box.setFocus( field );

                if ( !select )
                    field.FieldZone.find( "select" ).focus();
            };
        }

        super.populate();

        if ( this.Component === null )
            return;

        let select = this.FieldZone.find( "select" );

        select.empty();
        select.off( 'keydown focus' ).on( 'keydown', handleKeydown( this ) ).on( 'focus', handleFocusField( this, true ) );

        let options = "";

        if ( this._allowNullValue )
            options += "<option value=''></option>";

        let classDeleted = "";
        let valueAddedExists = false;

        for ( let item of Array.toIterable( this._list.getList() ) ) {
            if ( !this._list.isVisible( item ) )
                continue;

            classDeleted = "";
            if ( this._list.isDeleted( item ) )
                classDeleted = " class='deleted'";

            let id = this._list.getId( item );
            if ( id === null )
                continue;

            let text = this._list.getText( item );
            if ( !String.isEmptyOrWhiteSpaces( text ) ) {
                options += "<option value='" + id + "'" + classDeleted + ">" + String.encode( text.trim() ) + "</option>";
                if ( this._valueAdded === id )
                    valueAddedExists = true;
                continue;
            }

            let label = this._list.getLanguageLabel( item );
            if ( label === undefined || label === null )
                continue;

            options += Helper.Option( id, label );
            if ( this._valueAdded === id )
                valueAddedExists = true;
        }

        if ( !valueAddedExists && this._list !== null && ( this._list instanceof List.ListRecord || this._list instanceof List.ListArrayRecord ) ) {
            let record = this._list.getItem( this._valueAdded, true );

            if ( record !== null ) {
                classDeleted = "";
                if ( this._list.isDeleted( record ) )
                    classDeleted = " class='deleted'";

                options += "<option value='" + record.Id + "'" + classDeleted + ">" + String.encode( this._list.getText( record ) ) + "</option>";
            }
        }

        select.append( options );
        this.sort();
    }

    /**
     * Retrieve the list of values and pictures for a given column in a table into the database
     */
    refresh () {
        function handleChangeValue( field ) {
            return function () {
                field._value = $( this ).val();

                // update the style of the element selected

                let select = field.FieldZone.find( "select" );
                if ( select.hasClass( 'deleted' ) )
                    select.removeClass( 'deleted' );

                if ( field.Value !== null && ( field._list instanceof List.ListRecord || field._list instanceof List.ListArrayRecord ) ) {
                    let record = DSDatabase.Instance.getRowById( field._list.Table, field.Value );
                    if ( record !== null && field._list.isDeleted( record ) )
                        select.addClass( 'deleted' );
                }

                field.raise( 'change' );
            };
        }

        super.refresh();

        if ( this.Component === null )
            return;

        this.populate();

        // Select the current value

        if ( typeof this._value === 'string' )
            this._value = this._value.trim();

        let select = this.FieldZone.find( "select" );
        let option = select.find( "option[value='" + this._value + "']" );
        if ( option === null || option === undefined || option.length === 0 )
            this._value = null;

        select.val( this._value === null ? "" : this._value );

        // update the style of the element selected

        if ( select.hasClass( 'deleted' ) )
            select.removeClass( 'deleted' );

        if ( this.Value !== null && ( this._list instanceof List.ListRecord || this._list instanceof List.ListArrayRecord ) ) {
            let record = DSDatabase.Instance.getRowById( this._list.Table, this._value );
            if ( record !== null && this._list.isDeleted( record ) )
                select.addClass( 'deleted' );
        }

        // Raise an event onLoad

        let fn = this.getEvent( "onLoad" );
        if ( fn && ( this._list instanceof List.ListRecord || this._list instanceof List.ListArrayRecord ) )
            fn( "onLoad", this._list.Table );

        // handle the changement of the value

        select.prop( 'disabled', this.Readonly );
        select.off( 'change' ).on( 'change', handleChangeValue( this ) );

        if ( this.Readonly || !this.isEvent( 'icon' ) ) {
            this.FieldZone.find( '.icon' ).hide();
            this.FieldZone.find( '.icon' ).off( 'click' );
        } else {
            this.FieldZone.find( '.icon' ).show();
            this.FieldZone.find( '.icon' ).off( 'click' ).on( 'click', () => this.raise( 'icon', this ) );
        }
    }

    /**
     * Called on openning the box containing the field
     */
    onOpen () {
        function handleFocusField( field ) {
            return function () {
                if ( field.Box !== null )
                    field.Box.setFocus( field );

                field.FieldZone.find( "select" ).focus();
            };
        }

        super.onOpen();

        this.Component.off( 'focus' ).on( 'focus', handleFocusField( this ) );

        if ( !( this._list instanceof List.ListRecord ) && !( this._list instanceof List.ListArrayRecord ) )
            return;

        function handleOnLoad( field ) {
            return function ( event, table ) {
                field.refresh();
            };
        }

        function handleOnCreate( field ) {
            let select = field.FieldZone.find( "select" );

            return function ( event, table, id, record ) {
                if ( !( field._list instanceof List.ListRecord ) && !( field._list instanceof List.ListArrayRecord ) )
                    return;

                List.ListRecord.SetExtendedFields(field._list, record);

                if (field._list.isVisible(record)) {
                    let classDeleted = "";
                    if ( field._list.isDeleted( record ) )
                        classDeleted = " class='deleted'";

                    select.append( "<option value='" + record.Id + "'" + classDeleted + ">" + String.encode( field._list.getText( record ) ) + "</option>" );
                }

                field.sort();


                // Raise an event onCreate

                let fn = field.getEvent( event );
                if ( fn )
                    fn( event, table, id, record );
            };
        }

        function handleOnUpdate( field ) {
            let select = field.FieldZone.find( "select" );

            return function ( event, table, id, oldRecord, newRecord ) {
                if ( !( field._list instanceof List.ListRecord ) && !( field._list instanceof List.ListArrayRecord ) )
                    return;

                List.ListRecord.SetExtendedFields(field._list, newRecord);
                List.ListRecord.SetExtendedFields(field._list, oldRecord);

                let option = select.find( "option[value='" + newRecord.Id + "']" );

                let classDeleted = "";
                let itemDeleted = false;
                if ( field._list.isDeleted( newRecord ) ) {
                    classDeleted = " class='deleted'";
                    itemDeleted = true;
                }

                if ( option === null || option === undefined || option.length === 0 ) {
                    if ( field._list.isVisible( newRecord ) )
                        select.append( "<option value='" + newRecord.Id + "'" + classDeleted + ">" + String.encode( field._list.getText( newRecord ) ) + "</option>" ); // Add
                } else if ( !field._list.isVisible( newRecord ) ) {
                    if ( field._valueAdded !== null && field._valueAdded.toString() === newRecord.Id.toString() ) {
                        if ( option.hasClass( 'deleted' ) )
                            option.removeClass( 'deleted' );

                        if ( itemDeleted )
                            option.addClass( 'deleted' );

                        option.html( String.encode( field._list.getText( newRecord ) ) ); // Update
                    } else {
                        let oldValue = field.Value; // Delete
                        option.remove();
                        let newValue = field.Value; // Delete

                        if ( oldValue !== newValue )
                            field.Value = newValue;
                    }
                } else {
                    if ( option.hasClass( 'deleted' ) )
                        option.removeClass( 'deleted' );

                    if ( itemDeleted )
                        option.addClass( 'deleted' );

                    option.html( String.encode( field._list.getText( newRecord ) ) ); // Update
                }

                // update the style of the element selected

                if ( select.hasClass( 'deleted' ) )
                    select.removeClass( 'deleted' );

                if ( field.Value !== null ) {
                    let record = DSDatabase.Instance.getRowById( field._list.Table, field.Value );
                    if ( record !== null && field._list.isDeleted( record ) )
                        select.addClass( 'deleted' );
                }

                field.sort();

                // Raise an event

                let fn = field.getEvent( event );
                if ( fn )
                    fn( event, table, id, oldRecord, newRecord );
            };
        }

        function handleOnDelete( field ) {
            let select = field.FieldZone.find( "select" );

            return function ( event, table, id, record ) {
                if ( !( field._list instanceof List.ListRecord ) && !( field._list instanceof List.ListArrayRecord ) )
                    return;

                List.ListRecord.SetExtendedFields(field._list, record);

                let option = select.find("option[value='" + record.Id + "']");

                if ( !( option === null || option === undefined || option.length === 0 ) &&
                    ( field._valueAdded === null || field._valueAdded.toString() !== newRecord.Id.toString() ) ) {
                    let oldValue = field.Value;
                    option.remove();
                    let newValue = field.Value;

                    if ( oldValue !== newValue )
                        field.Value = newValue;
                } else {
                    if ( option.hasClass( 'deleted' ) )
                        option.removeClass( 'deleted' );

                    if ( field._list.isDeleted( record ) )
                        option.addClass( 'deleted' );
                }

                // update the style of the element selected

                if ( select.hasClass( 'deleted' ) )
                    select.removeClass( 'deleted' );

                if ( field.Value !== null ) {
                    let record = DSDatabase.Instance.getRowById( field._list.Table, field.Value );
                    if ( record !== null && field._list.isDeleted( record ) )
                        select.addClass( 'deleted' );
                }

                // Raise an event

                let fn = field.getEvent( event );
                if ( fn )
                    fn( event, table, id, record );
            };
        }

        this.addListener( DSDatabase.Instance.addEventListener( "onLoad", this._list.Table, "*", handleOnLoad( this ) ) );
        this.addListener( DSDatabase.Instance.addEventListener( "onCreate", this._list.Table, "*", handleOnCreate( this ) ) );
        this.addListener( DSDatabase.Instance.addEventListener( "onUpdate", this._list.Table, "*", handleOnUpdate( this ) ) );
        this.addListener( DSDatabase.Instance.addEventListener( "onDelete", this._list.Table, "*", handleOnDelete( this ) ) );
    }

    /**
     * Called on closing the field
     */
    onClose() {
        super.onClose();

        this.FieldZone.find( "select" ).off( 'focus' );
        this.FieldZone.find( '.icon' ).off( 'click' )
        this.Component.off( 'focus' );
    }

    /**
     * Set the first value not null into the select list
     */
    setFirstValueNotNull() {
        if ( this.Component === null )
            return;

        let select = this.FieldZone.find( "select" );

        if ( select[0].length === 0 ) {
            super.Value = null;
            return;
        }

        if ( this._allowNullValue ) {
            if ( select[0].length > 1 ) {
                this.FieldZone.find( "select" ).val( select[0][1].value );
                super.Value = select[0][1].value;
            } else {
                super.Value = null;
            }
            return;
        }

        if ( select[0].length > 0 ) {
            this.FieldZone.find( "select" ).val( select[0][0].value );
            super.Value = select[0][0].value;
            return;
        }

        super.Value = null;
    }

    /**
     * constructor
     * @param {any} box    reference on the box containing the component (inheritance of the readonly and visible flag)
     * @param {any} name   name of the component
     * @param {any} label  multilingual label of the field
     * @param {any} list   reference on the list of items to select
     */
    constructor ( box, name, label, list ) {
        super(box, name, label, "field_select");

        this._list = list ? list : new List.List();
        this._allowNullValue = false;
        this._valueAdded = null;

        this.draw();
    }
};
