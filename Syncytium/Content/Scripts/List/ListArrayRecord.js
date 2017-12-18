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

/**
 * Handling an array of record from the same list
 * In this list, you can add, update or delete a record but the database is not updated !
 */
List.ListArrayRecord = class extends List.ListArray {
    /**
     * Get the table name of the list record
     */
    get Table() {
        return this._listRecord.Table;
    }

    /**
     * @returns {string} column name in children assigned to the current list
     */
    get Column() {
        return this._column;
    }

    /**
     * @returns {any} reference on the list of records stored in the database
     */
    get ListRecord() {
        return this._listRecord;
    }

    /**
     * @returns {any} reference on the list of records stored in the database
     */
    get ListParent() {
        return this._listParent;
    }

    /**
     * @returns {any} DSRecord of the owner of the list
     */
    get Item() {
        return this._item;
    }

    /**
     * @param {any} item DSRecord of the owner of the list
     */
    set Item( item ) {
        this._array = [];

        this._item = item === undefined || item === null ? null : item;

        if ( this._item !== null && this._item[this._column] )
            this._array = this._item[this._column];
    }

    /**
     * Get the property having a sequence of this table
     */
    get SequenceProperty() {
        return this._listRecord._sequenceProperty;
    }

    /**
     * If the new item must have a sequence
     * @param {any} item item to complete within the expected sequenceId
     * @param {any} fn function to call as the sequence is available
     * @returns {any} a new sequence of the item
     */
    createSequence( item, fn ) {
        return this._listRecord.createSequence( item, fn );
    }

    /**
     * Compare 2 items by the text describing the item
     * @param {any} item1 first item
     * @param {any} item2 second item
     * @returns {int} -1, 0 or 1 on depends on the order of the 2 elements
     */
    compare( item1, item2 ) {
        return this._listRecord.compare( item1, item2 );
    }

    /**
     * Execute a function on each record
     * @param {any} fn function to call on each record
     */
    each( fn ) {
        for ( var id in this._array )
            fn( this._array[id] );
    }

    /**
     * @returns {any} list of values
     */
    getList() {
        var data = [];
        for ( var id in this._array )
            data.push( this._array[id] );
        return data;
    }

    /**
     * @returns {any} New record of the table
     */
    get NewItem() {
        return this._listRecord.createSubItem( this._item, this._column );
    }

    /**
     * Get the Id of the item
     * @param {any} item record containing the id to retrieve
     * @returns {int} id of the record
     */
    getId( item ) {
        if ( typeof item === "string" || typeof item === "number" || typeof item === "boolean" )
            return item;

        if ( item._id !== undefined )
            return item._id;

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
        var item = this._array[id];
        return item ? DSRecord.Clone( item ) : null;
    }

    /**
     * Get the text value of the item
     * @param {any} item record containing the label to retrieve
     * @returns {any} a string
     */
    getText( item ) {
        return this._listRecord.getText( item );
    }

    /**
     * Get a multilingual label describing the item
     * @param {any} item record containing the label to retrieve
     * @returns {any} a string or a {label, language, parameters} structure
     */
    getLanguageLabel( item ) {
        return this._listRecord.getLanguageLabel( item );
    }

    /**
     * Get the picture of the item (null if no picture)
     * @param {any} item record containing the picture to retrieve
     * @returns {any} a picture (base 64 or filename)
     */
    getPicture( item ) {
        return this._listRecord.getPicture( item );
    }

    /**
     * Get the html content of an attribute (to show the attribute)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a HTML code describing the attribute or the value of the attribute
     */
    getAttributHTML ( item, attribute ) {
        return this._listRecord.getAttributHTML( item, attribute );
    }

    /**
     * Get the html content of a tooltip for an attribute (to show the value into a board)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a HTML code describing the tooltip to show of the attribute
     */
    getAttributToolTipHTML( item, attribute ) {
        return this._listRecord.getAttributToolTipHTML( item, attribute );
    }

    /**
     * Get the text of an attribute (to filter the value)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {string} a string representing the value of the field
     */
    getAttributText ( item, attribute ) {
        return this._listRecord.getAttributText( item, attribute );
    }

    /**
     * Get the value of an attribute (to sort it)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} value of the field
     */
    getAttributValue( item, attribute ) {
        return this._listRecord.getAttributValue( item, attribute );
    }

    /**
     * Check if the element attached to the attribute is deleted or not (show if the reference is deleted)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {boolean} true if the reference of the property is deleted
     */
    isAttributDeleted( item, attribute ) {
        return this._listRecord.isAttributDeleted( item, attribute );
    }

    /**
     * Indicates if the item is visible in this list or not
     * @param {any} item record to check
     * @returns {boolean} true if the item is visible or not into the list
     */
    isVisible( item ) {
        return this._listRecord.isVisible( item );
    }

    /**
     * Indicates if the item is visible in this list or not
     * @param {any} item record to check
     * @returns {boolean} true if the item is deleted
     */
    isDeleted( item ) {
        return this._listRecord.isDeleted( item );
    }

    /**
     * Check the validity of the item
     * @param {any} item   record to check
     * @param {any} errors container of errors after checking
     * @param {any} force  true if the first step (warning is validated by the user)
     * @returns {any} null
     */
    checkItem ( item, errors, force ) {
        return this._listRecord.checkItem ( item, errors, force );
    }

    /**
     * Add a new item into the database and return a new id (or null, if no id available)
     * @param {any} newItem item to add
     * @param {any} errors container of errors after adding
     * @param {any} force  true if the first step (warning is validated by the user)
     * @returns {any} new item added into the list or errors
     */
    addItem ( newItem, errors, force ) {
        // Update link between some properties and its history

        let newItemHistory = DSDatabase.Instance.updateHistoryProperties( this.Table, newItem );
        if ( newItemHistory !== null )
            newItem = newItemHistory;

        // check properties of the newItem

        newItem = DSDatabase.Instance.checkProperties( this.Table, newItem, errors );

        if ( errors.HasError )
            return errors;

        // check properties

        var confirmation = this.checkItem( newItem, errors, force );

        if ( errors.HasError )
            return errors;

        if ( Helper.IsLabel( confirmation ) )
            return confirmation;

        // add the item into the list

        this._array[newItem._id] = newItem;

        // notify to the board that a new item is available

        var event = this.getEvent( "onCreate" );
        if ( event )
            event( "onCreate", this.Table, newItem.Id, newItem );

        return newItem;
    }

    /**
     * Update an item into the database
     * @param {any} id id of the record updated
     * @param {any} oldItem item to update
     * @param {any} newItem item updated
     * @param {any} errors container of errors after updating
     * @param {any} force  true if the first step (warning is validated by the user)
     * @returns {any} item updated into the list or errors
     */
    updateItem ( id, oldItem, newItem, errors, force ) {
        // Update link between some properties and its history

        let newItemHistory = DSDatabase.Instance.updateHistoryProperties( this.Table, newItem );
        if ( newItemHistory !== null )
            newItem = newItemHistory;

        // check properties of the newItem

        newItem = DSDatabase.Instance.checkProperties( this.Table, newItem, errors );

        if ( errors.HasError )
            return errors;

        // check properties

        var confirmation = this.checkItem( newItem, errors, force );

        if ( errors.HasError )
            return errors;

        if ( Helper.IsLabel( confirmation ) )
            return confirmation;

        // update the item into the list

        this._array[newItem._id] = newItem;

        // notify to the board that a new item is available

        var event = this.getEvent("onUpdate");
        if ( event )
            event( "onUpdate", this.Table, newItem.Id, oldItem, newItem );

        return newItem;
    }

    /**
     * Remove an item into the database
     * @param {any} id id of the record removed
     * @param {any} oldItem item to remove
     * @param {any} errors container of errors after updating
     * @returns {any} item deleted or errors
     */
    deleteItem ( id, oldItem, errors ) {
        // check if the item is described into the list

        var item = this._array[oldItem._id];
        if ( !item )
            return;

        // remove the item from the list

        delete this._array[oldItem._id];

        // notify to the board that an item is removed

        var event = this.getEvent("onDelete");
        if ( event )
            event( "onDelete", this.Table, item.Id, item );

        return item;
    }

    /**
     * Cancel the item into the database (revert the update)
     * @param {any} id id of the record updated
     * @param {any} oldItem item to update
     * @param {any} newItem item updated
     * @param {any} errors container of errors after cancelling
     * @returns {any} true if the item is cancelled
     */
    cancelItem ( id, oldItem, newItem, errors ) {
        return this._listRecord.cancelItem( id, oldItem, newItem, errors );
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
        return this._listRecord.isBoxFieldVisible( box, attribute, user, item );
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
        return this._listRecord.isBoxFieldReadonly( box, attribute, user, item );
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
        return this._listRecord.isBoxBoardVisible( box, board, user, item );
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
        return this._listRecord.isBoxBoardReadonly( box, board, user, item );
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
        return this._listRecord.isBoxPanelVisible( box, panel, user, item );
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
        return this._listRecord.isBoxPanelReadonly( box, panel, user, item );
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
        return this._listRecord.isBoardFieldVisible( board, attribute, user, item );
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
        return this._listRecord.isBoardFieldReadonly( board, attribute, user, item );
    }

    /**
     * True if the user can execute the event into a board
     * @param {any} board    reference on the board
     * @param {any} user     current user
     * @param {string} event event name "board", "add", "cancel", "delete" or "help"
     * @param {any} item     item handled by the board (can be null or undefined)
     * @returns {boolean} true if the user can execute the event
     */
    isBoardAllowed( board, user, event, item ) {
        return this._listRecord.isBoardAllowed( board, user, event, item );
    }

    /**
     * Constructor
     * @param {any} listParent instance of list having a sublist named column
     * @param {any} column name of the sub list into the container item
     * @param {any} listRecord reference on a list from the database
     */
    constructor( listParent, column, listRecord ) {
        super( [] );

        this._listParent = listParent === undefined || listParent === null ? null : listParent;
        this._listRecord = listRecord === undefined || listRecord === null ? null : listRecord;
        this._item = null;
        this._column = column;
    }
};
