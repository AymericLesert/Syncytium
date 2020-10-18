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
 * Define a select element object on depends on a list of pictures
 */
GUI.Box.BoxSelect = class extends GUI.Box.Box {
    /**
     * @param {any} fn function filtering the content of the list into the dialog box
     */
    set FilterInList( fn ) {
        this._fnFilterInList = fn ? fn : null;

        if ( this._list !== null )
            this._list.Filter = this._fnFilterInList;
    }

    /*
     * Method to set a label to the field into the dialog box
     */
    set Label( label ) {
        this._label = label === null || label === undefined ? null : label;

        if ( this._fieldFilter !== null )
            this._fieldFilter.Label = this._label;
    }

    /**
     * Set a default filter value into the dialog box
     * @param {any} filter function filtering items by its substring
     */
    set Filter( filter ) {
        this._filter = filter === null || filter === undefined ? null : filter;

        if ( this._fieldFilter === null )
            return;

        this._fieldFilter.Value = String.convertValue( this._filter );

        if ( this.IsOpened )
            this.updateListFiltered();
    }

    /**
     * Set a list of values into the dialog box
     * @param {any} list list of elements to show into this selected box
     */
    set List ( list ) {
        this._list = list === undefined || list === null ? null : list;

        if ( this._list !== null && this._fnFilterInList !== null )
            this._list.Filter = this._fnFilterInList;

        if ( this.Component === null )
            return;

        if ( this.IsOpened )
            this.updateList();
    }

    /**
     * @returns {any} list of elements to show into this selected box
     */
    get List() {
        return this._list;
    }

    /**
     * Allow to select nothing
     * @param {boolean} value true if allowing null value
     */
    set AllowNullValue ( value ) {
        this._allowNullValue = value !== null && value !== undefined && value;
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
        if ( this._multiSelect )
            this._autovalidation = false;
    }

    /**
     * @param {any} value value to set into the dialog box (here: an integer)
     */
    set Value( value ) {
        let oldValue = this._value;

        if ( !this._multiSelect ) {
            this._value = String.convertValue( value );

            if ( this.Component === null || !this.IsOpened )
                return;

            if ( oldValue !== null )
                this._pictures.find( "#" + oldValue + " > img" ).removeClass( 'selected' );

            if ( this._value !== null ) {
                this._pictures.find( "#" + this._value ).show();
                this._pictures.find( "#" + this._value + " > img" ).addClass( 'selected' );
            }

            return;
        }

        if ( String.isEmptyOrWhiteSpaces( value ) ) {
            this._value = [];
        } else if ( Array.isArray( value ) ) {
            this._value = [];
            for ( let item of Array.toIterable( value ) )
                this._value.push( String.convertValue( item ) );
        } else {
            this._value = [ String.convertValue( value ) ];
        }

        if ( this.Component === null || !this.IsOpened )
            return;

        if ( oldValue !== null && oldValue !== undefined ) {
            if ( !Array.isArray( oldValue ) )
                this._pictures.find( "#" + oldValue + " > img" ).removeClass( 'selected' );
            else {
                for ( let currentValue of Array.toIterable( oldValue ) ) {
                    this._pictures.find( "#" + currentValue + " > img" ).removeClass( 'selected' );
                }
            }
        }

        if ( this._value !== null && this._value !== undefined ) {
            for ( let currentValue of Array.toIterable( this._value ) ) {
                this._pictures.find( "#" + currentValue ).show();
                this._pictures.find( "#" + currentValue + " > img" ).addClass( 'selected' );
            }
        }
    }

    /**
     * @returns {any} item selected into the dialog box
     */
    get Value() {
        if ( !this._multiSelect )
            return this._value;

        if ( String.isEmptyOrWhiteSpaces( this._value ) )
            return null;

        if ( Array.isArray( this._value ) )
            return [].concat( this._value );

        return [String.convertValue( this._value )];
    }

    /**
     * Destructor
     */
    destructor () {
        super.destructor();

        if ( this._fieldFilter !== null ) {
            this._fieldFilter.destructor();
            this._fieldFilter = null;
        }

        if ( this._languageListener !== null ) {
            Language.Manager.Instance.removeListener( this._languageListener );
            this._languageListener = null;
        }
    }

    /**
     * Define the list of buttons of the dialog box
     * @param {any} container zone having the list of buttons
     */
    drawButton ( container ) {
        super.drawButton( container );
        this.declareButton( GUI.Box.Box.BUTTON_OK );
        this.declareButton( GUI.Box.Box.BUTTON_CANCEL, "BTN_CANCEL" );
    }

    /**
     * Draw and show the content of the dialog box
     * @param {any} container zone having the content
     */
    drawContent ( container ) {
        function handleOnChangeField( box, filter ) {
            return function ( currentLanguage, language, key ) {
                if ( language !== undefined )
                    return;

                box.refresh();
            };
        }

        this._fieldFilter = this.declareField( new GUI.Field.FieldInput( this, "filter_" + this.Name, this._label ) );
        container.append( "<div class='pictures'></div>" );
        container.show();
        this._pictures = container.find( ".pictures" );

        this._languageListener = Language.Manager.Instance.addListener( handleOnChangeField( this ) );

        this._fieldFilter.on( 'change', handleOnChangeField( this ) );
        this.List = this._list;
    }

    /**
     * Virtual method to refresh the content of the box
     * (you can use this.Mode and this.Readonly to get exactly the context)
     */
    refresh () {
        super.refresh();

        this.Filter = this._fieldFilter.Value;

        this.getButton( GUI.Box.Box.BUTTON_OK ).Visible = !this._autovalidation || this._allowNullValue;
    }

    /**
     * called on openning the box
     */
    onOpen () {
        function handleKeydown( box ) {
            return function ( event ) {
                switch ( event.key ) {
                    case "Tab":
                        event.stopImmediatePropagation();
                        if ( event.shiftKey )
                            box.setFocus( box._fieldFilter );
                        else if ( box.getButton( GUI.Box.Box.BUTTON_OK ).Visible )
                            box.setFocus( box.getButton( GUI.Box.Box.BUTTON_OK ) );
                        else if ( box.getButton( GUI.Box.Box.BUTTON_CANCEL ).Visible )
                            box.setFocus( box.getButton( GUI.Box.Box.BUTTON_CANCEL ) );
                        else
                            box.setFocus( box._fieldFilter );
                        return false;

                    case "Enter":
                        event.stopImmediatePropagation();
                        $( this ).click();
                        if ( !box._multiSelect )
                            box.getButton( GUI.Box.Box.BUTTON_OK ).Component.click();
                        return false;

                    case " ":
                        event.stopImmediatePropagation();
                        $( this ).click();
                        return false;

                    case "Escape":
                        event.stopImmediatePropagation();
                        box.onButtonCancel();
                        return false;

                    case "ArrowLeft":
                        event.stopImmediatePropagation();
                        box.leftFocus();
                        return false;

                    case "ArrowUp":
                        event.stopImmediatePropagation();
                        box.upFocus();
                        return false;

                    case "ArrowRight":
                        event.stopImmediatePropagation();
                        box.rightFocus();
                        return false;

                    case "ArrowDown":
                        event.stopImmediatePropagation();
                        box.downFocus();
                        return false;
                }
            };
        }

        function handleFocus( box ) {
            return function () {
                box.setFocus( $( this ) );
            }
        }

        function handleOnClick( box ) {
            return function () {
                box.setFocus( $( this ) );

                let newValue = String.convertValue( $( this ).attr( 'id' ) );

                if ( box._multiSelect ) {
                    for ( let i in box._value ) {
                        if ( box._value[i] === newValue ) {
                            if ( box._value.length === 1 && !box._allowNullValue )
                                return;

                            box._pictures.find( "> #" + box._value[i] + " > img" ).removeClass( 'selected' );
                            box._value.splice( i, 1 );
                            return;
                        }
                    }

                    if ( box._value === null || box._value === undefined )
                        box._value = [];

                    box._value.push( newValue );
                    box._pictures.find( "> #" + newValue + " > img" ).addClass( 'selected' );
                } else {
                    if ( box._value !== null )
                        box._pictures.find( "> #" + box._value + " > img" ).removeClass( 'selected' );

                    box._value = newValue === box._value ? null : newValue;
                    if ( !box._allowNullValue && box._value === null )
                        box._value = newValue;

                    if ( box._value !== null ) {
                        box._pictures.find( "> #" + box._value + " > img" ).addClass( 'selected' );
                        if ( box._autovalidation ) {
                            box.getButton( GUI.Box.Box.BUTTON_OK ).Component.click();
                        }
                    }
                }
            };
        }

        super.onOpen();

        this._currentList = this._list ? this._list.getList() : [];
        this.updateList();

        // Disable RC

        this.ContentZone.find( "> .pictures > div" ).on( 'keydown', handleKeydown( this ) );
        this.ContentZone.find( "> .pictures > div" ).on( 'focus', handleFocus( this ) );
        this.ContentZone.find( "> .pictures > div" ).on( 'click', handleOnClick( this ) );
    }

    /**
     * Open the dialog box and set the focus
     */
    open() {
        super.open();
        this.firstFocus();
    }

    /**
     * called on closing the box
     */
    onClose () {
        super.onClose();

        this.ContentZone.find( "> .pictures > div" ).off( 'click keydown focus' );
        this._pictures.html( "" );
        this._currentList = null;
    }

    /**
     * Go to the first picture of the list
     */
    previousFocus() {
        if ( this._focusIndex === this._focus.length - 1 ) {
            if ( this.getButton( GUI.Box.Box.BUTTON_OK ).Visible ) {
                this.setFocus( this.getButton( GUI.Box.Box.BUTTON_OK ) );
                return;
            }
            this.setFocus( this._fieldFilter );
            this.nextFocus();
            return;
        }

        if ( this._focusIndex === this._focus.length - 2 && this.getButton( GUI.Box.Box.BUTTON_OK ).Visible ) {
            this.setFocus( this._fieldFilter );
            this.nextFocus();
            return;
        }

        super.previousFocus();
    }

    /**
     * Method to show or hide elements on depends on the current filter value
     */
    updateListFiltered () {
        if ( this._currentList === null )
            return;

        let nameSelected = String.convertValue( this._fieldFilter.Value );
        if ( nameSelected !== null )
            nameSelected = nameSelected.toUpperCase();

        this.clearFocus();
        this.addFocus( this._fieldFilter );

        for ( let item of Array.toIterable( this._currentList ) ) {
            if ( !this._list.isVisible( item ) )
                continue;

            let id = String.convertValue( this._list.getId( item ) );
            if ( id === null )
                continue;

            let image = this._list.getPicture( item );
            if ( ( image === null || image === undefined ) && !String.isEmptyOrWhiteSpaces( this._list.DefaultPicture ) )
                image = this._list.DefaultPicture;
            if ( image === null || image === undefined )
                continue;

            let value = "";
            let text = this._list.getText( item );
            if ( !String.isEmptyOrWhiteSpaces( text ) )
                value = text;
            else
                value = Language.Manager.Instance.interpolation( this._list.getLanguageLabel( item ) );

            let pictures = this._pictures.find( "> #" + id );

            if ( nameSelected === null || value.toUpperCase().indexOf( nameSelected ) >= 0 ) {
                pictures.show();
                this.addFocus( pictures );
                pictures.focus( function () { $( this ).addClass( "focus" ); } );
                pictures.blur( function () { $( this ).removeClass( "focus" ); } );
            } else {
                pictures.hide();
            }
        }

        this.addFocus( this.getButton( GUI.Box.Box.BUTTON_OK ) );
        this.addFocus( this.getButton( GUI.Box.Box.BUTTON_CANCEL ) );
    }

    /**
     * Method to update the list of objects in the dialog box
     */
    updateList() {
        if ( this._pictures === null )
            return;

        // draw or refresh the list of pictures

        let content = "";

        for ( let item of Array.toIterable( this._currentList ) ) {
            if ( !this._list.isVisible( item ) )
                continue;

            let id = String.convertValue( this._list.getId( item ) );
            if ( id === null )
                continue;

            let image = this._list.getPicture( item );
            if ( ( image === null || image === undefined ) && !String.isEmptyOrWhiteSpaces( this._list.DefaultPicture ) )
                image = this._list.DefaultPicture;
            if ( image === null || image === undefined )
                continue;

            let value = "";
            let text = this._list.getText( item );
            if ( !String.isEmptyOrWhiteSpaces( text ) )
                value = String.encode( text );
            else
                value = Helper.Span( this._list.getLanguageLabel( item ) );

            content += "<div id='" + id + "'><img id='picture' src='" + image + "' /><div id='name'>" + value + "</div></div>";
        }

        this._pictures.html( content );

        // set the value selected

        if ( this._value !== null && this._value !== undefined ) {
            if ( Array.isArray( this._value ) ) {
                let newValues = [];

                for ( let value of Array.toIterable( this._value ) ) {
                    if ( this._pictures.find( "> #" + value + " > img" ).length > 0 ) {
                        this._pictures.find( "> #" + value + " > img" ).addClass( 'selected' );
                        newValues.push( value );
                    }
                }

                this._value = newValues;
            } else {
                if ( this._pictures.find( "> #" + this._value + " > img" ).length === 0 )
                    this._value = null;
                else
                    this._pictures.find( "> #" + this._value + " > img" ).addClass( 'selected' );
            }
        }

        // filter the value by taking into account the current filter

        this.updateListFiltered();
    }

    /**
     * Constructor
     * @param {any} name  name of the dialog box
     * @param {any} label multilingual label describing a short description (element to select)
     */
    constructor( name, label ) {
        super( name, "box_select" );

        this._label = Helper.Label( label );
        this._filter = null;
        this._list = null;
        this._value = null;
        this._fnFilterInList = null;

        this._fieldFilter = null;
        this._pictures = null;
        this._languageListener = null;
        this._allowNullValue = true;
        this._autovalidation = false;
        this._multiSelect = false;

        this._currentList = null;

        this.draw();
        this.List = new List.List();
    }

    /**
     * @returns {GUI.Box.BoxSelect} a single instance of the dialog box
     */
    static get Instance() {
        if ( !this._instance )
            this._instance = new GUI.Box.BoxSelect( "boxselect" );

        return this._instance;
    }

    /**
     * Open the single screen chosing an item from a list
     * @param {any} title   multilingual label describing the title of the dialog box
     * @param {any} message multilingual label describing the message
     * @param {any} value   value by default
     * @param {any} list    list of items to show in the box select
     * @param {any} filter  function to filter the list of items
     * @param {any} action  function to call on validating
     */
    static Open( title, message, value, list, filter, action ) {
        GUI.Box.BoxSelect.Instance.Title = title;
        GUI.Box.BoxSelect.Instance.Message = message;
        GUI.Box.BoxSelect.Instance.Error = null;
        GUI.Box.BoxSelect.Instance.Label = null;
        GUI.Box.BoxSelect.Instance.List = list;
        GUI.Box.BoxSelect.Instance.List.Filter = filter;
        GUI.Box.BoxSelect.Instance.AllowNullValue = false;
        GUI.Box.BoxSelect.Instance.Autovalidation = false;
        GUI.Box.BoxSelect.Instance.Value = value;
        GUI.Box.BoxSelect.Instance.getButton( GUI.Box.Box.BUTTON_OK ).Action = action;

        GUI.Box.BoxSelect.Instance.open();
    }
};
