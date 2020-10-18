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
 * Define an object having the ability to select a value on depends on a picture (status, source, product or user, for example)
 */
GUI.Field.FieldSelectImage = class extends GUI.Field.Field {
    /**
     * Protected setter
     * Set the value to the parent field
     * @param {any} value new value
     */
    set _parentValue( value ) {
        super.Value = value;
    }

    /**
     * Set the default picture (picture to replace null value)
     * @param {any} picture picture to load and show
     */
    set DefaultPicture( picture ) {
        this._picture = String.isEmptyOrWhiteSpaces( picture ) ? null : picture;
    }

    /**
     * Set the rollover flag
     * @param {any} value true if the next element of the end item is the first element
     */
    set Rollover ( value ) {
        this._rollover = value !== null && value !== undefined && value;
        if ( this._rollover )
            this._multiSelect = false;
    }

    /**
     * Set the autovalidation flag
     * @param {any} value true if as the end-user clicks on a picture, the box is closed and the value is automatically selected
     */
    set Autovalidation( value ) {
        this._autovalidation = value !== null && value !== undefined && value;
        if ( this._autovalidation )
            this._multiSelect = false;
    }

    /**
     * Set the MultiSelect flag
     * @param {any} value true if the end-user can select several values
     */
    set MultiSelect( value ) {
        this._multiSelect = value !== null && value !== undefined && value === true;
        if ( this._multiSelect ) {
            this._rollover = false;
            this._autovalidation = false;
        }
    }

    /**
     * @param {boolean} value true if the label of the picture selected is shown or not
     */
    set ShowLabel( value ) {
        this._showLabel = value !== null && value !== undefined && value === true;

        if ( !this._showLabel )
            this.Message = null;
    }

    /**
     * Set a label to this field in message part (for information)
     * @param {any} message HTML code describing the text
     */
    set Message( message ) {
        if ( !this._showLabel && !String.isEmptyOrWhiteSpaces( message ) )
            return;

        super.Message = message;
    }

    /**
     * @returns {any} the current list of items
     */
    get List() {
        return this._list;
    }

    /**
     * @returns {string} The text of the picture
     */
    get Text () {
        let text = "";
        let value = [];

        if ( Array.isArray( this.Value ) ) {
            value = this.Value;
        } else if ( !String.isEmptyOrWhiteSpaces( this.Value ) ) {
            value = [ this.Value ];
        }

        if ( value.length === 0 ) {
            text = Language.Manager.Instance.interpolation( this._labelNullValue );
            if ( String.isEmptyOrWhiteSpaces( text ) )
                return "";
            return text.trim();
        }

        for ( let id of value ) {
            let item = this._list.getItem( id, true );
            if ( item === null )
                continue;

            let label = this._list.getText( item );
            if ( String.isEmptyOrWhiteSpaces( label ) )
                label = Language.Manager.Instance.interpolation( this._list.getLanguageLabel( item ) );

            if ( String.isEmptyOrWhiteSpaces( label ) )
                continue;

            text = text + ( text.length === 0 ? "" : ", " ) + label.trim();
        }

        return text;
    }

    /**
     * Destructor
     */
    destructor () {
        super.destructor();

        if ( this._dialogBox !== null ) {
            this._dialogBox.destructor();
            this._dialogBox = null;
        }
    }

    /**
     * Draw the field having or modifying the value
     * @param {any} container zone having the field
     */
    drawField ( container ) {
        container.append( "<img></img><span></span>" );
    }

    /**
     * Called on onOpenning the field
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

        super.onOpen();

        this.FieldZone.find( "img" ).on( 'mouseenter', handleHover( this ) ).on( 'mouseleave', handleOut( this ) ).on( 'mousemove', handleHover( this ) );
        this.Component.on( 'keydown', handleKeydown( this ) );
    }

    /**
     * Called on onClosing the field
     */
    onClose() {
        super.onClose();

        this.FieldZone.find( "img" ).off( 'mouseenter mouseleave mousemove click' );
        this.Component.on( 'keydown' );
    }

    /**
     * Called on refresh the field
     */
    refresh () {
        function handleClick( field ) {
            return function () {
                if ( field._rollover ) {
                    field.setNextValue();
                    return;
                }

                // define a BoxSelect dedicated to this object

                function handleOnChangeValue( field ) {
                    return function ( value ) {
                        if ( !field._allowNullValue && value === null ) {
                            GUI.Box.BoxError( "ERROR", field._errorMessage );
                            return false;
                        }

                        field.Value = value;
                        field.Message = field.Text;
                        return true;
                    };
                }

                function handleOnCancel( field ) {
                    return function () {
                        field.raise( 'cancel' );
                        return true;
                    };
                }

                function handleOnClosed( field ) {
                    return function () {
                        field.focus();
                        field._dialogBox.OnClosed = null;
                    };
                }

                if ( field._dialogBox === null ) {
                    field._dialogBox = new GUI.Box.BoxSelect( field.Name, field.Label ? field.Label : "SELECT_NAME" );
                    field._dialogBox.getButton( GUI.Box.Box.BUTTON_OK ).Action = handleOnChangeValue( field );
                    field._dialogBox.getButton( GUI.Box.Box.BUTTON_CANCEL ).Action = handleOnCancel( field );

                    if ( ( field.Label === null || !field.Label.label ) && field.Box instanceof GUI.Box.BoxRecord ) {
                        let label = DSDatabase.Instance.getColumnLabel( field.Box.Table, field.Name );
                        if ( label !== null )
                            field._dialogBox.Label = label;
                    }
                }

                field._dialogBox.Title = field._title;
                field._dialogBox.Error = null;
                field._dialogBox.Message = null;
                field._dialogBox.Filter = null;
                field._dialogBox.Value = field.Value;
                field._dialogBox.List = field._list;
                field._dialogBox.AllowNullValue = field._allowNullValue;
                field._dialogBox.Autovalidation = field._autovalidation;
                field._dialogBox.MultiSelect = field._multiSelect;
                field._dialogBox.OnClosed = handleOnClosed( field );
                field._dialogBox.open();
            };
        }

        super.refresh();

        if ( this.Readonly ) {
            this.FieldZone.find( "img" ).css( 'cursor', 'initial' );
            this.FieldZone.find( "img" ).off( 'click' );
        } else {
            this.FieldZone.find( "img" ).css( 'cursor', 'pointer' );
            this.FieldZone.find( "img" ).off( 'click' ).on( 'click', handleClick( this ) );
        }

        let picture = this._picture;

        let item = null;
        if ( Array.isArray( this.Value ) ) {
            item = this.Value.length > 0 ? this._list.getItem( this.Value[0], true ) : null;
        } else if ( !String.isEmptyOrWhiteSpaces( this.Value ) ) {
            item = this._list.getItem( this.Value, true );
        }

        if ( item !== null )
            picture = this._list.getPicture( item );
        if ( ( picture === null || picture === undefined ) && !String.isEmptyOrWhiteSpaces( this._list.DefaultPicture ) )
            picture = this._list.DefaultPicture;

        this.FieldZone.find( "img" )[0].src = picture === null ? this._picture : picture;

        if ( Array.isArray( this.Value ) && this.Value.length > 1 ) {
            this.FieldZone.find( "span" ).show();
            this.FieldZone.find( "span" ).html( this.Value.length );
        } else {
            this.FieldZone.find( "span" ).hide();
        }

        // add the value of the selected item

        this.Message = this.Text;

        // style of the field

        if ( this.FieldZone.hasClass( 'deleted' ) )
            this.FieldZone.removeClass( 'deleted' );
        if ( item !== null && this._list.isDeleted( item ) )
            this.FieldZone.addClass( 'deleted' );

        if ( this.IsOpened )
            this.updateListeners();

        if ( this._dialogBox !== null && this._dialogBox.IsOpened )
            this._dialogBox.Value = this.Value;
    }

    /**
     * Set next value to this field
     */
    setNextValue () {
        function handleSetValue( field, item ) {
            field._parentValue = item === null ? null : String.convertValue( field._list.getId( item ) );
            field.FieldZone.find( "img" )[0].src = item === null ? field._picture : field._list.getPicture( item );

            // style of the field

            if ( field.FieldZone.hasClass( 'deleted' ) )
                field.FieldZone.removeClass( 'deleted' );
            if ( item !== null && field._list.isDeleted( item ) )
                field.FieldZone.addClass( 'deleted' );

            // add the value of the selected item

            field.Message = field.Text;

            if ( field.IsOpened )
                field.updateListeners();

            if ( GUI.Webix.Tooltip.Instance.IsVisible )
                GUI.Webix.Tooltip.Instance.show( String.encode( field.Text ) );
        }

        let firstItem = null;
        let nextItem = null;
        let found = false;

        for ( let item of Array.toIterable( this._list.getList() ) ) {
            let id = String.convertValue( this._list.getId( item ) );

            if ( this.Value === id ) {
                found = true;
                continue;
            }

            if ( !this._list.isVisible( item ) )
                continue;

            if ( found ) {
                nextItem = item;
                break;
            }

            if ( firstItem === null )
                firstItem = item;
        }

        if ( nextItem !== null ) {
            handleSetValue( this, nextItem );
            return;
        }

        if ( firstItem === null ) {
            handleSetValue( this, null );
            return;
        }

        handleSetValue( this, firstItem );
    }

    /**
     * Update the listener of the current record referenced by this field
     */
    updateListeners () {
        function handleOnUpdateDB( field ) {
            return function ( event, table, id, oldRecord, newRecord ) {
                let picture = field._list.getPicture( newRecord );
                field.FieldZone.find( "img" )[0].src = picture === null ? field._picture : picture;

                // style of the field

                if ( field.FieldZone.hasClass( 'deleted' ) )
                    field.FieldZone.removeClass( 'deleted' );
                if ( item !== null && field._list.isDeleted( newRecord ) )
                    field.FieldZone.addClass( 'deleted' );

                // add the value of the selected item

                field.Message = field.Text;
            };
        }

        this.clearListeners();
        if ( ( this._list instanceof List.ListRecord || this._list instanceof List.ListArrayRecord) && !String.isEmptyOrWhiteSpaces( this.Value ) )
            this.addListener( DSDatabase.Instance.addEventListener( "onUpdate", this._list.Table, this.Value, handleOnUpdateDB( this ) ) );
    }

    /**
     * Allow to select nothing
     * @param {any} allowNullValue true if the value can be nulled
     * @param {any} message        value to show if the value is null
     */
    setAllowNullValue ( allowNullValue, message ) {
        this._allowNullValue = allowNullValue !== null && allowNullValue !== undefined && allowNullValue;
        this._labelNullValue = message ? message : "SELECT_VALUE_NULL";
        this._errorMessage = new Errors( message === null || message === undefined ? "ERR_SELECT_VALUE" : message );
        if ( this._dialogBox !== null )
            this._dialogBox.AllowNullValue = this._allowNullValue;
    }

    /**
     * Raise the click event
     */
    onMouseClick() {
        if ( this.Visible && !this.Readonly && this.FieldZone !== null )
            this.FieldZone.find( "img" ).click();
    }

    /**
     * Constructor
     * @param {any} box            reference on the box containing the component (inheritance of the readonly and visible flag)
     * @param {any} name           name of the component
     * @param {any} label          multilingual label of the field
     * @param {any} title          multilingual label of the title
     * @param {any} list           reference on the list of item to select
     * @param {any} labelNullValue multilingual label for a null value
     */
    constructor( box, name, label, title, list, labelNullValue ) {
        super( box, name, label, "field_select_image" );

        this._title = title;
        this._list = list ? list : new List.List();
        this._rollover = false;
        this._picture = this._list.DefaultPicture === null || this._list.DefaultPicture === undefined ? null : this._list.DefaultPicture;
        this._dialogBox = null;
        this._allowNullValue = false;
        this._errorMessage = new Errors( "ERR_SELECT_VALUE" );
        this._labelNullValue = labelNullValue ? labelNullValue : "SELECT_VALUE_NULL";
        this._autovalidation = false;
        this._multiSelect = false;
        this._showLabel = false;

        this.draw();
    }
};
