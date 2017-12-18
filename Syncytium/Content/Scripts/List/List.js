/// <reference path="../_references.js" />

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

var List = {};

/**
 * Handling a list of elements (form an array or a table in the database)
 * Abstract class
 */
List.List = class {
    /**
     * @returns {string} "DD/MM/YYYY"
     */
    static get TEXT_FORMAT_DATE() {
        return "DD/MM/YYYY";
    }

    /**
     * @returns {string} "DD/MM/YYYY HH:mm:ss"
     */
    static get TEXT_FORMAT_DATETIME() {
        return "DD/MM/YYYY HH:mm:ss";
    }

    /**
     * Set the default picture of the element
     * @param {any} value default picture if the picture doesn't exist in the item
     */
    set DefaultPicture( value ) {
        this._defaultPicture = String.isEmptyOrWhiteSpaces( value ) ? null : value;
    }

    /**
     * Retrieve the default picture of the list
     * @returns {any} default picture if the picture doesn't exist in the item
     */
    get DefaultPicture() {
        return this._defaultPicture;
    }

    /**
     * Set a function limiting the number of selectable elements
     * @param {any} fn function filtering items
     */
    set Filter( fn ) {
        this._fnFilter = fn ? fn : null;
    }

    /**
     * Destructor
     */
    destructor() {
        this.clearListeners();
        this._events = {};
    }

    /**
     * Clear the list
     */
    clear() {
    }

    /**
     * Compare 2 items (by default, check by ids)
     * @param {any} item1 first item
     * @param {any} item2 second item
     * @returns {int} -1, 0 or 1 on depends on the order of the 2 elements
     */
    compare( item1, item2 ) {
        var id1 = this.getId( item1 );
        var id2 = this.getId( item2 );

        if ( id1 === id2 )
            return 0;

        return id1 < id2 ? -1 : 1;
    }

    /**
     * Execute a function on each record visible
     * @param {any} fn function to call on each record
     */
    each( fn ) {
        var list = this.getList();

        for ( var i in list ) {
            var item = list[i];

            if ( !this.isVisible( item ) )
                continue;

            var id = String.convertValue( this.getId( item ) );

            if ( id !== null ) {
                try {
                    fn( item );
                } catch ( e ) {
                    Logger.Instance.exception( "List", "An exception occurs while rading each items", e );
                }
            }
        }
    }

    /**
     * @returns {any} list of values
     */
    getList() {
        return [];
    }

    /**
     * @returns {any} list of sorted values (applying the function compare())
     */
    getListSorted() {
        function compare( list ) {
            return function ( item1, item2 ) {
                return list.compare( item1, item2 );
            };
        }

        var currentList = this.getList();
        currentList.sort( compare( this ) );
        return currentList;
    }

    /**
     * Add an event
     * @param {any} event name of the event associate to the function
     * @param {any} fn    function to call on raising the event
     */
    on( event, fn ) {
        this._events[event] = fn;
    }

    /**
     * Raise an event
     * @param {any} event name of the event to raise
     */
    raise( event ) {
        if ( !this._events[event] )
            return;

        this._events[event]();
    }

    /**
     * @param {any} event name of the event to retrieve
     * @returns {boolean} true if a function is available for the event
     */
    isEvent( event ) {
        return this._events[event] !== undefined && this._events[event] !== null;
    }

    /**
     * @param {any} event name of the event to retrieve
     * @returns {any} the function corresponding to the name of the event
     */
    getEvent( event ) {
        return this._events[event] ? this._events[event] : null;
    }

    /**
     * Remove an existing event
     * @param {any} event name of the event to unbind to the list
     */
    unbind( event ) {
        this._events[event] = null;
    }

    /**
     * Clean up all references on the listener into the database to remove it on close
     */
    clearListeners() {
        for ( var i in this._listeners )
            DSDatabase.Instance.removeEventListener( this._listeners[i] );
        this._listeners = [];
    }

    /**
     * Add the reference on the listener into the database to remove it on close
     * @param {any} listener id of the listener created in DSDatabase
     */
    addListener( listener ) {
        this._listeners.push( listener );
    }

    /**
     * this function is raised to follow the changement of the table
     */
    onOpen() {
    }

    /**
     * this function is cancelled the following of database
     */
    onClose() {
        this.clearListeners();
    }

    /**
     * Get the Id of the item (ex: Id in the record, value of an enumerable)
     * @param {any} item record containing the id to retrieve
     * @returns {int} id of the record
     */
    getId( item ) {
        if ( typeof item === "string" || typeof item === "number" || typeof item === "boolean" )
            return item;

        if ( item.Id !== undefined )
            return item.Id;

        return null;
    }

    /**
     * Retrieve an item into the list by its id
     * If force is true, the filter is not applied to look for the id
     * @param {any} id    id of the record to look for
     * @param {any} force true if the record must be retrieved even if the record is not visible
     * @returns {any} item or null
     */
    getItem( id, force ) {
        var list = this.getList();
        var searchId = String.convertValue( id );

        for ( var i in list ) {
            var item = list[i];

            if ( ( force === null || force === undefined || !force ) && !this.isVisible( item ) )
                continue;

            var itemId = String.convertValue( this.getId( item ) );

            if ( itemId !== null && itemId === searchId )
                return item;
        }

        return null;
    }

    /**
     * Get the text value of the item
     * @param {any} item record containing the label to retrieve
     * @returns {any} a string
     */
    getText( item ) {
        if ( typeof item === "string" || typeof item === "number" || typeof item === "boolean" )
            return item.toString().trim();

        if ( !String.isEmptyOrWhiteSpaces( item.Name ) )
            return item.Name.trim();

        if ( !String.isEmptyOrWhiteSpaces( item.Description ) )
            return item.Description.trim();

        if ( item.Id !== undefined )
            return item.Id.toString().trim();

        return item.toString().trim();
    }

    /**
     * Get a multilingual label describing the item
     * @param {any} item record containing the label to retrieve
     * @returns {any} a string or a {label, language, parameters} structure
     */
    getLanguageLabel( item ) {
        return null;
    }

    /**
     * Get the picture of the item (null if no picture)
     * @param {any} item record containing the picture to retrieve
     * @returns {any} a picture (base 64 or filename)
     */
    getPicture( item ) {
        if ( typeof item === "string" || typeof item === "number" || typeof item === "boolean" )
            return null;

        if ( !String.isEmptyOrWhiteSpaces( item.Picture ) )
            return item.Picture;

        return this._defaultPicture;
    }

    /**
     * Protected method
     * Get the html content of a boolean
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a HTML code describing the boolean
     */
    getAttributHTMLBoolean( item, attribute ) {
        if ( item === null || item === undefined )
            return "";

        var value = item[attribute];

        if ( value === undefined )
            return "";

        return "<div class='" + ( value === null ? "null" : value ? "true" : "false" ) + "'></div>";
    }

    /**
     * Protected method
     * Get the html content of a picture of an item
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @param {any} table table name
     * @param {any} picture true if the reference is shown within a picture
     * @returns {any} a HTML code describing the picture of the reference
     */
    getAttributHTMLReference( item, attribute, table, picture ) {
        if ( item === null || item === undefined )
            return "";

        var list = List.ListRecord.CACHE_LIST( table );
        if ( list === null )
            return this.getAttributText( item, attribute );

        var refItem = list.getItem( item[attribute], true );
        if ( refItem === null || refItem === undefined )
            return this.getAttributText( item, attribute );

        if ( picture === true ) {
            var pictureToShow = list.getPicture( refItem );
            if ( pictureToShow !== null )
                return "<img src='" + pictureToShow + "' />";

            if ( list.DefaultPicture !== null )
                return "<img src='" + list.DefaultPicture + "' />";
        }

        return list.getText( refItem );
    }

    /**
     * Protected method
     * Get the html content of a picture
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a HTML code describing the picture
     */
    getAttributHTMLPicture( item, attribute ) {
        if ( item === null || item === undefined )
            return "";

        var picture = item.Picture ? item.Picture : this._defaultPicture;
        if ( picture === null || picture === undefined )
            return "";

        return "<img src='" + picture + "' />";
    }

    /**
     * Protected method
     * Get the html content of an enumerate value
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @param {any} picture true if the enumerate value is shown within a picture
     * @returns {any} a HTML code describing the enumerate value
     */
    getAttributHTMLEnumerate( item, attribute, picture ) {
        if ( item === null || item === undefined )
            return "";

        var value = item[attribute];

        if ( value === null || value === undefined )
            return picture === true ? "<div class='null'></div>" : "";

        var element = List.ListEnumerable.Factory( this.Table, attribute, GUI.Box.BoxRecord.ROOT_DIRECTORY ).getList()[value];

        if ( element === undefined || element === null || element.Label === undefined || element.Label === null )
            return picture === true ? "<div class='null'></div>" : "";

        return picture === true ? "<div class='" + element.Name.toLowerCase() + "'></div>" : Helper.Span( element.Label );
    }

    /**
     * Protected method
     * Get the html content of an attribute (to show the attribute) within a string value on multiline
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a HTML code describing the attribute or the value of the attribute
     */
    getAttributHTMLMultiline( item, attribute ) {
        if ( item === null || item === undefined )
            return "";

        var value = item[attribute];

        if ( value === null || value === undefined )
            return String.encode( this.getAttributText( item, attribute ) );

        value = String.encode( this.getAttributText( item, attribute ) ).split( "\n" );
        return value.join( "<br />" );
    }

    /**
     * Get the html content of an attribute (to show the attribute)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a HTML code describing the attribute or the value of the attribute
     */
    getAttributHTML( item, attribute ) {
        if ( item === null || item === undefined )
            return "";

        var value = item[attribute];

        if ( value === null || value === undefined )
            return String.encode( this.getAttributText( item, attribute ) );

        if ( Helper.IsLabel( value, true ) )
            return Helper.Span( value );

        return String.encode( this.getAttributText( item, attribute ) );
    }

    /**
     * Get the html content of a tooltip for an attribute (to show the value into a board)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a HTML code describing the tooltip to show of the attribute
     */
    getAttributToolTipHTML( item, attribute ) {
        return null;
    }

    /**
     * Protected method
     * Get the text content of a boolean
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a text describing the boolean (see from multilingual)
     */
    getAttributTextBoolean( item, attribute ) {
        if ( item === null || item === undefined )
            return "";

        var value = item[attribute];
        if ( value === null || value === undefined )
            return "";

        return Language.Manager.Instance.interpolation( Helper.Label( this.Table.toUpperCase() + "_" + attribute.toUpperCase() + "_" + ( value === null ? "NULL" : value === true ? "TRUE" : "FALSE" ) ) );
    }

    /**
     * Protected method
     * Get the text content of a double
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @param {any} precision number of digits after the coma
     * @returns {any} a text describing the double
     */
    getAttributTextDouble( item, attribute, precision ) {
        if ( item === null || item === undefined )
            return "";

        var value = item[attribute];
        if ( value === undefined || value === null)
            return "";

        let digit = null;
        let unitField = null;

        let column = DSDatabase.Instance.getColumn( item._table, attribute );
        if ( column !== null && column !== undefined ) {
            digit = precision === null || precision === undefined ? column.Digit : new Digits.Decimal(9, precision);
            unitField = column.Unit;
        } else {
            digit = new Digits.Decimal( 9, precision === null || precision === undefined ? 3 : precision );
        }

        digit.Value = value;
        return digit.toString() + ( String.isEmptyOrWhiteSpaces( unitField ) ? "" : " " + unitField);
    }

    /**
     * Protected method
     * Get the text content of a date
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a text describing the date
     */
    getAttributTextDate( item, attribute ) {
        if ( item === null || item === undefined )
            return "";

        var value = item[attribute];
        if ( value === undefined || value === null )
            return "";

        if ( typeof value === "string" )
            return value;

        let format = DSDatabase.Instance.getDatetimeFormat( item._table, attribute );
        if ( format === null )
            format = List.List.TEXT_FORMAT_DATE;

        if ( value instanceof Date )
            return moment( value.toString() ).format( format );

        if ( value instanceof moment )
            return value.format( format );

        return value.toString();
    }

    /**
     * Protected method
     * Get the text content of a date and time
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a text describing the date and time
     */
    getAttributTextDateTime( item, attribute ) {
        if ( item === null || item === undefined )
            return "";

        var value = item[attribute];
        if ( value === undefined || value === null )
            return "";

        if ( typeof value === "string" )
            return value;

        let format = DSDatabase.Instance.getDatetimeFormat( item._table, attribute );
        if ( format === null )
            format = List.List.TEXT_FORMAT_DATETIME;

        if ( value instanceof Date )
            return moment( value.toString() ).format( format );

        if ( value instanceof moment )
            return value.format( format );

        return value.toString();
    }

    /**
     * Protected method
     * Get the text of an item
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @param {any} table table name
     * @returns {any} a text describing the reference
     */
    getAttributTextReference( item, attribute, table ) {
        if ( item === null || item === undefined )
            return "";

        var list = List.ListRecord.CACHE_LIST( table );
        if ( list === null )
            return item[attribute] ? item[attribute].toString() : "";

        var refItem = list.getItem( item[attribute], true );
        if ( refItem === null || refItem === undefined )
            return item[attribute] ? item[attribute].toString() : "";

        return list.getText( refItem );
    }

    /**
     * Protected method
     * Get the text describing the picture (here, nothing)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} nothing
     */
    getAttributTextPicture( item, attribute ) {
        return "";
    }

    /**
     * Protected method
     * Get the text of an enumerate value
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a label describing the enumerate value
     */
    getAttributTextEnumerate( item, attribute ) {
        if ( item === null || item === undefined )
            return "";

        var value = item[attribute];

        if ( value === null || value === undefined )
            return "";

        var element = element = List.ListEnumerable.Factory( item._table ? item._table : this.Table, attribute, GUI.Box.BoxRecord.ROOT_DIRECTORY ).getList()[value];

        if ( element === undefined || element === null || element.Label === undefined || element.Label === null )
            return "";

        return Language.Manager.Instance.interpolation( Helper.Label( element.Label ) );
    }

    /**
     * Get the text of an attribute (to filter the value)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {string} a string representing the value of the field
     */
    getAttributText( item, attribute ) {
        if ( item === null || item === undefined )
            return "";

        var value = item[attribute];
        if ( value === null || value === undefined )
            return "";

        switch ( typeof value ) {
            case "boolean":
                return value ? "1" : "0";

            case "number":
                return value.toString().replace(".", ",");

            case "string":
                return value;

            default:
                if ( Helper.IsLabel( value, true ) )
                    return Language.Manager.Instance.interpolation( value );

                if ( value instanceof Date )
                    return moment( value.toString() ).format( List.List.TEXT_FORMAT_DATE );

                if ( value instanceof moment )
                    return value.format( List.List.TEXT_FORMAT_DATE );

                return value.toString();
        }
    }

    /**
     * Get the value of an attribute (to sort it)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} value of the field
     */
    getAttributValue( item, attribute ) {
        if ( item === null || item === undefined )
            return null;

        var value = item[attribute];
        if ( value === null || value === undefined )
            return null;

        if ( Helper.IsLabel( value, true ) )
            value = Language.Manager.Instance.interpolation( value );

        if ( typeof value === "string" )
            return value.trim().toUpperCase();

        return value;
    }

    /**
     * Protected method
     * Check if the element referenced by the attribute is deleted or not (show if the reference is deleted)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @param {any} table table name
     * @returns {boolean} true if the reference of the property is deleted
     */
    isAttributDeletedReference( item, attribute, table ) {
        if ( item === null || item === undefined )
            return true;

        var list = List.ListRecord.CACHE_LIST( table );
        if ( list === null )
            return true;

        var refItem = list.getItem( item[attribute] );
        if ( refItem === null || refItem === undefined )
            return true;

        return list.isDeleted( refItem );
    }

    /**
     * Check if the element attached to the attribute is deleted or not (show if the reference is deleted)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {boolean} true if the reference of the property is deleted
     */
    isAttributDeleted( item, attribute ) {
        return false;
    }

    /**
     * Indicates if the item is visible in this list or not
     * @param {any} item record to check
     * @returns {boolean} true if the item is visible or not into the list
     */
    isVisible( item ) {
        return this._fnFilter ? this._fnFilter( item ) : true;
    }

    /**
     * Indicates if the item is visible in this list or not
     * @param {any} item record to check
     * @returns {boolean} true if the item is deleted
     */
    isDeleted( item ) {
        if ( item === null || item === undefined )
            return true;

        return item._deleted !== null && item._deleted !== undefined && item._deleted;
    }

    /**
     * True if the field is visible in a dialog box
     * @param {any} box      reference on the dialog box
     * @param {any} attribute column / property
     * @param {any} user     current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the field is allowed to be shown
     */
    isBoxFieldVisible( box, attribute, user, item ) {
        return true;
    }

    /**
     * False if the field can be updated in a dialog box
     * @param {any} box      reference on the dialog box
     * @param {any} attribute column / property
     * @param {any} user     current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the field can't be updated by the current user
     */
    isBoxFieldReadonly( box, attribute, user, item ) {
        return user.Profile === UserRecord.PROFILE_OTHER || user.Profile === UserRecord.PROFILE_NONE;
    }

    /**
     * True if the board is visible in a dialog box
     * @param {any} box      reference on the dialog box
     * @param {any} board board name
     * @param {any} user  current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the board is allowed to be shown
     */
    isBoxBoardVisible( box, board, user, item ) {
        return true;
    }

    /**
     * False if the board can be updated in a dialog box
     * @param {any} box      reference on the dialog box
     * @param {any} board board name
     * @param {any} user  current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the board can't be updated by the current user
     */
    isBoxBoardReadonly( box, board, user, item ) {
        return false;
    }

    /**
     * True if the panel is visible in a dialog box
     * @param {any} box      reference on the dialog box
     * @param {any} panel panel name
     * @param {any} user  current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the panel is allowed to be shown
     */
    isBoxPanelVisible( box, panel, user, item ) {
        return true;
    }

    /**
     * False if the panel can be updated in a dialog box
     * @param {any} box      reference on the dialog box
     * @param {any} panel panel name
     * @param {any} user  current user
     * @param {any} item  item handled by the current dialog box
     * @returns {boolean} true if the panel can't be updated by the current user
     */
    isBoxPanelReadonly( box, panel, user, item ) {
        return false;
    }

    /**
     * True if the field is visible in a board
     * @param {any} board    reference on the board
     * @param {any} attribute column / property
     * @param {any} user     current user
     * @param {any} item     item handled by the board (null for a column)
     * @returns {boolean} true if the field is allowed to be shown
     */
    isBoardFieldVisible( board, attribute, user, item ) {
        return true;
    }

    /**
     * False if the field can be updated in a board
     * @param {any} board    reference on the board
     * @param {any} attribute column / property
     * @param {any} user     current user
     * @param {any} item     item handled by the board
     * @returns {boolean} true if the field can't be updated by the current user
     */
    isBoardFieldReadonly( board, attribute, user, item ) {
        return false;
    }

    /**
     * True if the user can execute the event into a board
     * @param {any} board    reference on the board
     * @param {any} user     current user
     * @param {string} event event name
     * @param {any} item     item handled by the board (can be null or undefined)
     * @returns {boolean} true if the user can execute the event
     */
    isBoardAllowed( board, user, event, item ) {
        if ( event === "help" || event === "read" || event === "onSelectChange" )
            return true;

        return !board.Readonly && user.Profile !== UserRecord.PROFILE_OTHER && user.Profile !== UserRecord.PROFILE_NONE;
    }

    /**
     * Create the transaction
     * @param {any} label label of the transaction
     */
    beginTransaction( label ) {
    }

    /**
     * Close the transaction
     */
    endTransaction() {
    }

    /**
     * Commit current changes
     * @param {any} record not used (record concerned by the commit)
     */
    commit( record ) {
    }

    /**
     * Rollback current changes
     * @param {any} record not used (record concerned by the rollback)
     */
    rollback( record ) {
    }

    /**
     * Constructor
     */
    constructor() {
        this._defaultPicture = null;
        this._fnFilter = null;
        this._events = {};
        this._listeners = []; // List of listeners DB (to declare onOpen and to free onClose)
    }
};
