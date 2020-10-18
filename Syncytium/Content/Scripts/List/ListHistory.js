/// <reference path="../_references.js" />

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
 * Define a list representing the history
 */
List.ListHistory = class extends List.ListArray {
    /**
     * @returns {int} Nature Create of an history
     */
    static get CREATE() {
        return 0;
    }

    /**
     * @returns {int} Nature Update of an history
     */
    static get UPDATE() {
        return 1;
    }

    /**
     * @returns {int} Nature Delete of an history
     */
    static get DELETE() {
        return 2;
    }

    /**
     * Retrieve the details of the list
     */
    get IsDetails () {
        return this._details;
    }

    /**
     * Retrieve an instance of the list parent of the history
     */
    get List() {
        if ( this._list !== null )
            return this._list;

        if ( String.isEmptyOrWhiteSpaces( this._table ) )
            this._list = new List.ListRecord();
        else
            this._list = List.ListRecord.CACHE_LIST( this._table );
        return this._list;
    }

    /**
     * Clear the list
     */
    clear() {
        super.clear();
        this._currentId = 1;
    }

    /**
     * Add a new modification item into the list
     * @param {any} item        item added into the list
     * @param {any} description description of the change
     * @param {any} nature      nature of the change
     * @param {any} field       property of the item concerned by the changement
     * @param {any} oldValue    old value
     * @param {any} newValue    new value
     * @returns {any} new item added into the list
     */
    push ( item, description, nature, field, oldValue, newValue ) {
        let newItem = {
            Id: this._currentId++,
            UserId: item.HistoryUserId,
            Date: item.HistoryDate,
            Nature: Helper.Label( nature ),
            Description: description === null || description === undefined ? this.List.getText( item ) : description,
            Field: field === null || field === undefined ? null : Helper.Label( field ),
            OldValue: oldValue === null || oldValue === undefined ? null : oldValue,
            NewValue: newValue === null || newValue === undefined ? null : newValue,
            Item: item
        };
        this._array.push( newItem );
        return newItem;
    }

    /**
     * Sort elements in reverse order
     */
    sort () {
        this._array.sort( function ( h1, h2 ) { return h1.Id > h2.Id ? -1 : h1.Id < h2.Id ? 1 : 0; } );
    }

    /**
     * Extract a text value for a field
     * @param {any} value multilingual label or string
     * @returns {string} label or the string describing the value
     */
    getValueText ( value ) {
        if ( value === null || value === undefined )
            return "";

        if ( Helper.IsLabel( value, true ) )
            return value.label;

        return value.toString();
    }

    /**
     * Enable or disable the details of the list
     * @param {any} details show the details or just a few columns
     */
    setDetails ( details ) {
        this._details = details === null || details === undefined ? true : details;
    }

    /**
     * Get the Id of the item
     * @param {any} item item of the list
     * @returns {int} Id of the item
     */
    getId ( item ) {
        return item.Id;
    }

    /**
     * Get the text value of the item
     * @param {any} item record containing the label to retrieve
     * @returns {any} a string
     */
    getText( item ) {
        return this.List.getText( item );
    }

    /**
     * Get a multilingual label describing the item
     * @param {any} item record containing the label to retrieve
     * @returns {any} a string or a {label, language, parameters} structure
     */
    getLanguageLabel( item ) {
        return this.List.getLanguageLabel( item );
    }

    /**
     * Get the picture of the item (null if no picture)
     * @param {any} item record containing the picture to retrieve
     * @returns {any} a picture (base 64 or filename)
     */
    getPicture( item ) {
        return this.List.getPicture( item );
    }

    /**
     * Get the html content of an attribute (to show the attribute)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a HTML code describing the attribute or the value of the attribute
     */
    getAttributHTML ( item, attribute ) {
        let value = null;
        let user = null;

        switch ( attribute ) {
            case "Id":
                return "";

            case "User":
                value = item.UserId;
                if ( value === null || value === undefined )
                    return "";

                user = DSDatabase.Instance.getRowById( "User", value );
                if ( user === null || user === undefined )
                    return "";

                if ( String.isEmptyOrWhiteSpaces( user.Picture ) )
                    user.Picture = UserRecord.DEFAULT_PICTURE().picture;

                if ( String.isEmptyOrWhiteSpaces( user.Picture ) )
                    return "";

                return "<img class='user' src='" + user.Picture + "' />";

            case "OldValue":
            case "NewValue":
                if ( !Array.isArray( item[attribute] ) )
                    return super.getAttributHTML( item, attribute );

                return this.List.getAttributText( item[attribute][0], item[attribute][1] );

            default:
                return super.getAttributHTML( item, attribute );
        }
    }

    /**
     * Get the text of an attribute (to filter the value)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {string} a string representing the value of the field
     */
    getAttributText ( item, attribute ) {
        let value = null;
        let user = null;

        switch ( attribute ) {
            case "User":
                value = item.UserId;
                if ( value === null || value === undefined )
                    return "";

                user = DSDatabase.Instance.getRowById( "User", value );
                if ( user === null || user === undefined )
                    return "";

                return String.isEmptyOrWhiteSpaces( user.Name ) ? "" : user.Name;

            case "Date":
                value = item[attribute];
                if ( value === null || value === undefined )
                    return "";

                if ( value instanceof moment )
                    return value.format( "DD/MM/YYYY HH:mm:ss" );

                return super.getAttributText( item, attribute );

            case "OldValue":
            case "NewValue":
                if ( !Array.isArray( item[attribute] ) )
                    return super.getAttributText( item, attribute );

                return this.List.getAttributText( item[attribute][0], item[attribute][1] );

            default:
                return super.getAttributText( item, attribute );
        }
    }

    /**
     * Get the value of an attribute (to sort it)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} value of the field
     */
    getAttributValue ( item, attribute ) {
        let value = null;

        switch ( attribute ) {
            case "User":
            case "Nature":
            case "Field":
            case "Description":
                value = this.getAttributText( item, attribute );
                return value === null ? null : value.toUpperCase().trim();

            case "Date":
                return item.Id;

            case "OldValue":
            case "NewValue":
                if ( !Array.isArray( item[attribute] ) )
                    return super.getAttributValue( item, attribute );

                // Use Text to sort item

                return this.List.getAttributText( item[attribute][0], item[attribute][1] );

            default:
                return super.getAttributValue( item, attribute );
        }
    }

    /**
     * Check if the element attached to the attribute is deleted or not (show if the reference is deleted)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {boolean} true if the reference of the property is deleted
     */
    isAttributDeleted( item, attribute ) {
        switch ( attribute ) {
            case "OldValue":
            case "NewValue":
                if ( !Array.isArray( item[attribute] ) )
                    return super.isAttributDeleted( item, attribute );

                // Use Text to sort item

                return this.List.isAttributDeleted( item[attribute][0], item[attribute][1] );

            default:
                return super.isAttributDeleted( item, attribute );
        }
    }

    /**
     * @param {any} item record to check if it is visible or not
     * @returns {boolean} Indicates if the item is visible in this list or not
     */
    isVisible( item ) {
        return this._details || item.Field === null;
    }

    /**
     * Unable to create a new history
     * @returns {any} null
     */
    get NewItem () {
        return null;
    }

    /**
     * Check the validity of the item (not available)
     * @param {any} record record concerned by the check
     * @param {any} errors container of errors (not changed)
     * @param {any} force not used
     * @returns {boolean} true
     */
    checkItem ( record, errors, force ) {
        return true;
    }

    /**
     * Add a new item (not available)
     * @param {any} newItem record to add
     * @param {any} errors container of errors (not changed)
     * @returns {any} null
     */
    addItem ( newItem, errors ) {
        return null;
    }

    /**
     * Update an item (not available)
     * @param {any} id id of the record to update
     * @param {any} oldItem record to update
     * @param {any} newItem record to add
     * @param {any} errors container of errors (not changed)
     * @param {any} force not used
     * @returns {any} null
     */
    updateItem ( id, oldItem, newItem, errors, force ) {
        return null;
    }

    /**
     * Remove an item (not available)
     * @param {any} id id of the record to remove
     * @param {any} oldItem record to remove
     * @param {any} errors container of errors (not changed)
     * @returns {any} null
     */
    deleteItem ( id, oldItem, errors ) {
        return null;
    }

    /**
     * Comparison of 2 items by update date 
     * @param {any} item1 record of an history item
     * @param {any} item2 record of an history item
     * @returns {int} -1, 0 or 1 on depends on the order of the 2 items
     */
    compareRecord( item1, item2 ) {
        if ( item1.HistoryDate < item2.HistoryDate )
            return -1;

        if ( item1.HistoryDate > item2.HistoryDate )
            return 1;

        return 0;
    }

    /**
     * Extract the nature of the item update
     * @param {any} item record containing the nature
     * @returns {string} description of the item
     */
    getNature( item ) {
        if ( item === null || item === undefined || item.HistoryNature === null || item.HistoryNature === undefined )
            return "HISTORY_HISTORYNATURE_UPDATE";

        switch ( item.HistoryNature ) {
            case List.ListHistory.CREATE:
                return "HISTORY_HISTORYNATURE_CREATE";
            case List.ListHistory.UPDATE:
                return "HISTORY_HISTORYNATURE_UPDATE";
            case List.ListHistory.DELETE:
                return "HISTORY_HISTORYNATURE_DELETE";
        }

        return "HISTORY_HISTORYNATURE_UPDATE";
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
        return this.List.isBoxFieldVisible( box, attribute, user, item === null || item === undefined ? null : item.Item );
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
        return true;
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
        return this.List.isBoxBoardVisible( box, board, user, item === null || item === undefined ? null : item.Item );
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
        return true;
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
        if ( !this.List.isBoxPanelVisible( box, panel, user, item === null || item === undefined ? null : item.Item ) )
            return false;

        return panel !== "_history";
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
        return true;
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
        return this.List.isBoardFieldVisible( board, attribute, user, item === null || item === undefined ? null : item.Item );
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
        return true;
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
        return this.List.isBoardAllowed( board, user, event, item === null || item === undefined ? null : item.Item );
    }

    /**
     * Build a record by removing all unuseful fields to make a comparison as easier as possible
     * @param {any} record record to duplicate or to clean up
     * @returns {any} an history record clean and ready to make a comparison
     */
    getRecord( record ) {
        let newRecord = {};

        // TODO : Some lists as Attachments, Followers, Comments or History don't show in the history

        for ( let property in record ) {
            if ( property.startsWith( "_" ) ||
                property.startsWith( "Copy" ) ||
                property === "Attachments" ||
                property === "Followers" ||
                property === "Comments" ||
                property === "History" ||
                Array.isArray( record[property] ) )
                continue;

            // Replace properties by the text value

            newRecord[property] = record[property];
        }

        newRecord._deleted = record.HistoryNature === this.DELETE;
        newRecord._record = record;

        return newRecord;
    }

    /**
     * Check if 2 items from a list into the history are identic or not
     * @param {any} oldItem
     * @param {any} newItem
     * @returns {boolean} true if the items are the same
     */
    isEqualHistory( oldItem, newItem ) {
        if ( ( oldItem === null || oldItem === undefined ) && ( newItem !== null && newItem !== undefined ) )
            return false;

        if ( ( oldItem !== null && oldItem !== undefined ) && ( newItem === null || newItem === undefined ) )
            return false;

        if ( ( oldItem === null || oldItem === undefined ) && ( newItem === null || newItem === undefined ) )
            return true;

        for ( let property in newItem ) {
            if ( property.startsWith( "_" ) ||
                property.startsWith( "Copy" ) ||
                property === "Attachments" ||
                property === "Followers" ||
                property === "Comments" ||
                property === "History" ||
                property === "Id" ||
                property === "CustomerId" ||
                property.startsWith( "History" ) )
                continue;

            if ( !Object.prototype.hasOwnProperty.call( oldItem, property ) )
                return false;
        }

        for ( let property in oldItem ) {
            if ( property.startsWith( "_" ) ||
                property.startsWith( "Copy" ) ||
                property === "Attachments" ||
                property === "Followers" ||
                property === "Comments" ||
                property === "History" ||
                property === "Id" ||
                property === "CustomerId" ||
                property.startsWith( "History" ) )
                continue;

            if ( !Object.prototype.hasOwnProperty.call( newItem, property ) )
                return false;
        }

        for ( let property in oldItem ) {
            if ( property.startsWith( "_" ) ||
                property.startsWith( "Copy" ) ||
                property === "Attachments" ||
                property === "Followers" ||
                property === "Comments" ||
                property === "History" ||
                property === "Id" ||
                property === "CustomerId" ||
                property.startsWith( "History" ) )
                continue;

            let oldValue = oldItem[property];
            if ( Object.prototype.hasOwnProperty.call( oldItem, "History" + property ) )
                oldValue = oldItem["History" + property];

            let newValue = newItem[property];
            if ( Object.prototype.hasOwnProperty.call( newItem, "History" + property ) )
                newValue = newItem["History" + property];

            if ( !DSRecord.IsEqualValue( oldValue, newValue ) )
                return false;
        }

        // TODO : Check sub lists ?

        return true;
    }

    /**
     * Build the histories values on depends on a given record within History subList
     * @param {any} item item
     */
    set Item( item ) {
        this._item = item === null || item === undefined ? null : item;

        // Remove all histories values

        this.clear();
        if ( this._item === null )
            return;

        // Build histories values

        let history = [];

        for ( let currentHistory of Array.toIterable( this._item.History ) )
            history.push( this.getRecord( currentHistory ) );

        // sort all items by the date

        history.sort( this.compareRecord );

        // write the history of the item

        let previousElement = null;
        let currentElement = null;
        let firstActionUpdate = true;

        for ( let historyId in history ) {
            previousElement = currentElement;
            currentElement = history[historyId];

            if ( previousElement === null || currentElement._deleted ) {
                this.push( currentElement._record, this.List.getText( currentElement ), this.getNature( currentElement ) );
                continue;
            }

            firstActionUpdate = true;

            // difference fields by fields

            for ( let property in currentElement ) {
                if ( property.startsWith( "_" ) ||
                    property.startsWith( "Copy" ) ||
                    property.startsWith( "History" ) ||
                    property === "Id" ||
                    property === "CustomerId" )
                    continue;

                let oldValue = previousElement[property];
                if ( Object.prototype.hasOwnProperty.call( previousElement, "History" + property ) )
                    oldValue = previousElement["History" + property];

                let newValue = currentElement[property];
                if ( Object.prototype.hasOwnProperty.call( currentElement, "History" + property ) )
                    newValue = currentElement["History" + property];

                if ( DSRecord.IsEqualValue( oldValue, newValue ) === false ) {
                    this.push( currentElement._record,
                        this.List.getText( currentElement ),
                        this.getNature( currentElement ),
                        DSDatabase.Instance.getColumnLabel( this._table, property ),
                        [previousElement, property],
                        [currentElement, property] );
                    firstActionUpdate = false;
                }
            }

            if ( firstActionUpdate )
                this.push( currentElement._record, this.List.getText( currentElement ), this.getNature( currentElement ) );

            // Check difference for sub lists (composition)

            for ( let property in currentElement._record._subLists ) {
                let subList = currentElement._record._subLists[property];
                if ( subList.table === "History" || !subList.composition )
                    continue;

                let list = List.ListRecord.CACHE_LIST( subList.table.substr( 7 ) );
                let oldList = previousElement === null ? [] : previousElement._record[property];

                for ( let newItem of Array.toIterable( currentElement._record[property] ) ) {
                    let oldItem = null;
                    let labelProperty = ( currentElement._record._table + "_" + property ).toUpperCase();
                    if ( labelProperty.startsWith( "HISTORY" ) )
                        labelProperty = labelProperty.substr( 7 );

                    switch ( newItem.HistoryNature ) {
                        case List.ListHistory.CREATE:
                            this.push( currentElement._record, this.List.getText( currentElement ), "HISTORY_HISTORYNATURE_LISTCREATE", labelProperty, "", list.getText( newItem ) );
                            break;
                        case List.ListHistory.UPDATE:
                            for ( let oldListItem of Array.toIterable( oldList ) ) {
                                if ( oldListItem.HistoryId === newItem.HistoryId ) {
                                    oldItem = oldListItem;
                                    break;
                                }
                            }

                            // Show update if oldItem and newItem are different and show the difference ...

                            if ( this.isEqualHistory( oldItem, newItem ) )
                                break;

                            // TODO : If this item has sub lists ... notify the modification ?

                            this.push( currentElement._record, this.List.getText( currentElement ), "HISTORY_HISTORYNATURE_LISTUPDATE", labelProperty, list.getText( oldItem ), list.getText( newItem ) );

                            break;
                        case List.ListHistory.DELETE:
                            this.push( currentElement._record, this.List.getText( currentElement ), "HISTORY_HISTORYNATURE_LISTDELETE", labelProperty, "", list.getText( newItem ) );
                            break;
                    }
                }
            }
        }

        // sort history by date descendant before showing

        this.sort();
    }

    /**
     * Constructor
     * @param {string} table Table name of the item containing into the history list
     */
    constructor( table ) {
        super( [] );

        this._currentId = 0;
        this._details = true;
        this._item = null;

        this._table = table === null || table === undefined ? null : table;
        this._list = null;
    }
};
