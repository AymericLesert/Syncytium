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
 * Define a text input object having a box attached to set a value
 */
GUI.Field.FieldInputWithBox = class extends GUI.Field.Field {
    /**
     * @param {any} box table name, or digit format or instance of digit
     * @returns {any} Single reference on a dialog box for selecting a record from a table
     */
    static CACHE_BOX( box ) {
        let id = null;

        if ( !this._addonBox )
            this._addonBox = {};

        if ( box instanceof Digits.Digits ) {
            id = "digits";
        } else if ( typeof box === "string" ) {
            id = box;
        } else {
            return null;
        }

        let addonBox = this._addonBox[id];
        if ( addonBox !== undefined )
            return addonBox;

        // build a new addon on depends on the box name

        let newAddonBox = { name: null, box: null, list: null, digits: null };

        if ( box instanceof Digits.Digits ) {
            newAddonBox.digits = box;
            newAddonBox.name = box.Type.toLowerCase();
        } else if ( DSDatabase.Instance.Tables[box] !== undefined ) {
            newAddonBox.name = box.toLowerCase();
            newAddonBox.box = new GUI.Box.BoxSelect( box, "SELECT_NAME" );
            newAddonBox.list = List.ListRecord.CACHE_LIST( box );
        } else {
            newAddonBox.digits = Digits.Digits.Factory( box );
            if ( newAddonBox.digits !== null )
                newAddonBox.name = newAddonBox.digits.Type.toLowerCase();
        }

        this._addonBox[id] = newAddonBox;
        return newAddonBox;
    }

    /**
     * Set a value to this field
     * @param {any} value new value
     */
    set Value( value ) {
        if ( this._withBox.box !== null ) {
            super.Value = value;
            return;
        }

        let oldValue = this._value;
        let newValue = value;

        if ( value === undefined )
            value = null;

        this._withBox.digits.Value = value;
        this._value = this._withBox.digits.Value;

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
        return super.Value;
    }

    /**
     * Allow to select nothing
     * @param {boolean} value true if allowing null value
     */
    set AllowNullValue( value ) {
        this._allowNullValue = value !== null && value !== undefined && value;
    }

    /**
     * Set a new function filtering data into the box attached to this field
     * @param {any} value function filtering the list of values to select
     */
    set FilterInBox ( value ) {
        this._fnFilterInBox = value ? value : null;
    }

    /**
     * @returns {string} Indicate if the field references a table into the database or not!
     */
    get DatabaseTableReference () {
        if ( this._withBox.list === null )
            return null;

        return this._withBox.list.Table;
    }

    /**
     * Draw the field having or modifying the value
     * @param {any} container zone having the field
     */
    drawField( container ) {
        container.append( "<div class='value'></div><div class='icon'></div>" );
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
     * Called on openning the box
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

                    case "Delete":
                        event.stopImmediatePropagation();
                        field.Value = null;
                        return false;
                }
            };
        }

        function handleClick( field ) {
            return function () {
                function handleClick( field ) {
                    return function ( value ) {
                        field.Value = value;
                        return true;
                    };
                }

                function handleClose( field ) {
                    return function ( ) {
                        field.focus();
                    };
                }

                if ( field._withBox === null || field.Readonly )
                    return;

                if ( field._withBox.box !== null ) {
                    let title = field._withBox.list.Table.toUpperCase() + "_SELECT_" + field.Name.toUpperCase();
                    if ( Language.Manager.Instance.getLabel( DSDatabase.Instance.CurrentLanguage, title ) === null )
                        title = "TITLE_SELECT_" + field.DatabaseTableReference.toUpperCase();

                    let label = null;
                    if ( field.Label === null || field.Label.label === null || field.Label.label === undefined ) {
                        label = DSDatabase.Instance.getColumnLabel( field._withBox.list.Table, field.Name );
                        if ( Language.Manager.Instance.getLabel( DSDatabase.Instance.CurrentLanguage, label ) === null )
                            label = null;
                    }

                    field._withBox.box.AllowNullValue = field._allowNullValue;
                    field._withBox.box.Autovalidation = true;
                    field._withBox.box.List = field._withBox.list;
                    field._withBox.box.FilterInList = field._fnFilterInBox;
                    field._withBox.box.OnClosed = handleClose( field );
                    field._withBox.box.getButton( GUI.Box.Box.BUTTON_OK ).Action = handleClick( field );
                    field._withBox.box.Title = title;
                    field._withBox.box.Label = label;
                    field._withBox.box.Value = field.Value;
                    field._withBox.box.Error = null;
                    field._withBox.box.open();
                }

                if ( field._withBox.digits !== null ) {
                    let title = null;
                    if ( field.Box instanceof GUI.Box.Box ) {
                        if ( field.Box.List !== null && field.Box.List !== undefined && field.Box.List.Table !== null && field.Box.List.Table !== undefined )
                            title = field.Box.List.Table.toUpperCase() + "_SELECT_" + field.Name.toUpperCase();
                    }
                    if ( title === null || !Language.Manager.Instance.existLabel( title ) )
                        title = "TITLE_SELECT_" + field.Name.toUpperCase();

                    if ( !Language.Manager.Instance.existLabel( title ) )
                        title = "TITLE_SELECT_" + field._withBox.name.toUpperCase();

                    // TODO : Handle AllowNullValue into the digit box

                    field._withBox.digits.Value = field.Value;
                    GUI.Box.BoxInputDigit.Digit( title, field.Label, null, field._withBox.digits, field.Component.find( ".value > .field > .value" ).css( 'text-align' ), handleClick( field ), handleClose( field ) );
                }
            };
        }

        super.onOpen();

        this.Component.on( 'keydown', handleKeydown( this ) );
        this.Component.find( '.field' ).on( 'dblclick', handleClick( this ) );
        this.FieldZone.find( '.icon' ).on( 'click', handleClick( this ) );
    }

    /**
     * Called on closing the field
     */
    onClose() {
        super.onClose();

        this.Component.off( 'keydown' );
        this.Component.find( '.field' ).off( 'dblclick' );
        this.Component.find( '.label' ).off( 'click' );
        this.FieldZone.find( '.icon' ).off( 'click' );
    }

    /**
     * Refresh the field
     */
    refresh () {
        function handleReadElement( field ) {
            return function () {
                function handleClose( box, field ) {
                    return function () {
                        box.OnClose = null;
                        field.focus();
                    };
                }

                if ( String.isEmptyOrWhiteSpaces( field.Value ) )
                    return;

                let dialog = GUI.Box.BoxRecord.CACHE_DIALOG_BOX( field.DatabaseTableReference, null, field._withBox.list );
                if ( dialog === null )
                    return;

                dialog.OnClosed = handleClose( dialog, field );
                dialog.readRecord( field.Value );
            };
        }

        super.refresh();

        if ( this.Component === null )
            return;

        // Refresh read only

        if ( this.Readonly )
            this.FieldZone.find( ".icon" ).hide();
        else
            this.FieldZone.find( ".icon" ).show();

        // Refresh the link

        if ( this.FieldZone.hasClass( 'deleted' ) )
            this.FieldZone.removeClass( 'deleted' );

        let table = this.DatabaseTableReference;
        let record = null;

        if ( !this.IsLinked && table !== null && !String.isEmptyOrWhiteSpaces( this.Value ) ) {
            // In case of table reference ... enable or disable the link on depends on the value of the field

            record = DSDatabase.Instance.getRowById( table, this.Value );
            if ( record !== null ) {
                this.Component.find( ".label" ).off('click').on('click', handleReadElement( this ) );
                this.Component.find( ".label" ).addClass( 'link' );

                if ( this._withBox.list.isDeleted( record ) )
                    this.FieldZone.addClass( 'deleted' );
            }
        }

        // Refresh the listener

        this.updateListeners();

        // update the input text

        let value = null;
        if ( this._withBox.digits !== null ) {
            this._withBox.digits.Value = this.Value;
            value = !this._withBox.digits.IsNull ? this._withBox.digits.toString() : this.Value;
        } else {
            value = this.Value;
        }

        if ( String.isEmptyOrWhiteSpaces( value ) ) {
            this.FieldZone.find( '.value' ).html( "" );
            return;
        }

        if ( table === null ) {
            this.FieldZone.find( '.value' ).html( String.encode( value ) );
            return;
        }

        if ( record === null )
            record = DSDatabase.Instance.getRowById( table, value );

        if ( record === null ) {
            this.FieldZone.find( '.value' ).html( String.encode( value.toString() ) );
            return;
        }

        let name = this._withBox.list.getText( record );
        this.FieldZone.find( '.value' ).html( String.encode( String.isEmptyOrWhiteSpaces( name ) ? "" : name ));
    }

    /**
     * Update the listener of the current record referenced by this field
     */
    updateListeners () {

        // Refresh the listener

        this.clearListeners();

        function handleOnUpdateDB( field ) {
            return function ( event, table, id, oldRecord, newRecord ) {
                if ( field.DatabaseTableReference !== table )
                    return;

                let name = field._withBox.list.getText( newRecord );
                field.FieldZone.find( '.value' ).html( String.encode( String.isEmptyOrWhiteSpaces( name ) ? "" : name ) );

                if ( field.FieldZone.hasClass( 'deleted' ) )
                    field.FieldZone.removeClass( 'deleted' );

                if ( field._withBox.list.isDeleted( newRecord ) )
                    field.FieldZone.addClass( 'deleted' );
            };
        }

        function handleOnDeleteDB( field ) {
            return function ( event, table, id, oldRecord ) {
                if ( field.DatabaseTableReference !== table )
                    return;

                if ( field.FieldZone.hasClass( 'deleted' ) )
                    field.FieldZone.removeClass( 'deleted' );

                if ( field._withBox.list.isDeleted( oldRecord ) )
                    field.FieldZone.addClass( 'deleted' );
            };
        }

        if ( this.DatabaseTableReference && !String.isEmptyOrWhiteSpaces( this.Value ) ) {
            this.addListener( DSDatabase.Instance.addEventListener( "onUpdate", this.DatabaseTableReference, this.Value, handleOnUpdateDB( this ) ) );
            this.addListener( DSDatabase.Instance.addEventListener( "onDelete", this.DatabaseTableReference, this.Value, handleOnDeleteDB( this ) ) );
        }
    }

    /**
     * Clean up undo stack
     */
    cleanUndo() {
        super.cleanUndo();

        if ( this._withBox && this._withBox.digits )
            this._withBox.digits.cleanUndo();
    }

    /**
     * constructor
     * @param {any} box     reference on the box containing the component (inheritance of the readonly and visible flag)
     * @param {any} name    name of the component
     * @param {any} label   multilingual label of the field
     * @param {any} withBox table name, or digit format or instance of digit
     */
    constructor( box, name, label, withBox ) {
        super( box, name, label, "field_input_with_box" );

        this._fnFilterInBox = null;
        this._allowNullValue = false;
        this._withBox = GUI.Field.FieldInputWithBox.CACHE_BOX( withBox );

        this.draw();

        if ( this._withBox.name !== null )
            this.Component.addClass( this._withBox.name );
    }
};
