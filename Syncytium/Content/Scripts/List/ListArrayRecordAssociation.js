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
 * Handling an array of records into an association between 2 tables
 *
 * For example : User - UserModule - Module
 * This kind of list handling the list of associations between User and Module
 *
 * In this list, you can add, update or delete a record but the database is not updated !
 */
List.ListArrayRecordAssociation = class extends List.ListArrayRecord {
    /**
     * @returns {any} DSRecord of the owner of the list
     */
    get Item() {
        return this._item;
    }

    /**
     * Set the item referenced by the current list
     * @param {any} item DSRecord of the owner of the list
     */
    set Item( item ) {
        super.Item = item;

        this._targetArray = this._array;

        // History values must show all values (included masked item)
        this._listAssociation._allRecords = item.HistoryId !== undefined ? true : this._listAssociationAllRecords;

        this.updateListItems();
    }

    /**
     * Compare 2 items by the text describing the item
     * @param {any} item1 first item
     * @param {any} item2 second item
     * @returns {int} -1, 0 or 1 on depends on the order of the 2 elements
     */
    compare( item1, item2 ) {
        let associationItem1 = this._listAssociation.getItem( item1[this._associationColumn], true );
        let associationItem2 = this._listAssociation.getItem( item2[this._associationColumn], true );

        return String.compare(this._listAssociation.getText( associationItem1 ), this._listAssociation.getText( associationItem2 ));
    }

    /**
     * Execute a function on each record
     * @param {any} fn function to call on each record
     */
    each( fn ) {
        let arraySorted = [];

        for ( let item of Array.toIterable( this._array ) )
            arraySorted.push( item );

        arraySorted.sort( (item1, item2) => this.compare( item1, item2 ) );

        for ( let item of arraySorted )
            fn( List.ListRecord.SetExtendedFields( this.ListRecord, item ) );
    }

    /**
     * private method to update the list of associations
     * @returns {Array} list of all items
     */
    updateListItems() {
        Logger.Instance.verbose("ListArrayRecordAssociation", "Updating the list of items ...");

        // Get the list of existing associations

        let targetArray = [];
        for (let association of Array.toIterable(this._targetArray)) {
            if (association.HistoryNature === List.ListHistory.DELETE)
                continue;

            targetArray[association[this._associationColumn]] = association;
        }

        // Associate items and list of items

        this._array = [];
        for ( let record of this._listAssociation.getListSorted() ) {
            let currentAssociationId = this._listAssociation.getId( record );
            let newAssociation = null;

            for ( let association of Array.toIterable( targetArray ) ) {
                if ( association[this._associationColumn] === currentAssociationId ) {
                    newAssociation = DSRecord.Clone( association );
                    newAssociation._selected = true;
                    delete targetArray[currentAssociationId];
                    break;
                }
            }

            if ( newAssociation === null ) {
                newAssociation = this.ListRecord.createSubItem( this._item, this.Column );
                newAssociation[this._associationColumn] = currentAssociationId;
                newAssociation._selected = false;
            }

            this._array[newAssociation._id] = newAssociation;
        }

        // Add items not included into the list of items

        for (let association of Array.toIterable(targetArray)) {
            let newAssociation = DSRecord.Clone(association);
            newAssociation._selected = true;
            this._array[newAssociation._id] = newAssociation;
        }

        return this._array;
    }

    /**
     * this function is raised to follow the changement of the table
     */
    onOpen() {
        /*
         * Update the list of items when a new item is added into the association table
         */
        function handleOnUpdate( list ) {
            return function ( event, table, legendId, oldRecord, newRecord ) {
                // Retrieve events

                let fnEventCreate = list.getEvent( "onCreate" );
                let fnEventUpdate = list.getEvent( "onUpdate" );
                let fnEventDelete = list.getEvent( "onDelete" );

                // Build the old list of current values within the associationId

                let oldList = [];
                let itemToRemove = [];
                for ( let item of Array.toIterable( list._array ) ) {
                    oldList[item[list._associationColumn]] = item;
                    itemToRemove[item[list._associationColumn]] = false;
                }

                // Update the list of values within the new association

                for ( let item of Array.toIterable( list._listAssociation.getList() ) ) {
                    let id = list._listAssociation.getId( item );

                    // Update the list 

                    if ( id in itemToRemove )
                        delete itemToRemove[id];

                    if ( id in oldList ) {
                        if ( id !== legendId )
                            continue;

                        // Update an existing item

                        let oldItem = oldList[id];

                        if ( fnEventUpdate ) {
                            try {
                                fnEventUpdate( "onUpdate", list.Table, id, oldItem, oldItem );
                            } catch ( e ) {
                                Logger.Instance.exception( list.Table, "Exception on updating item", e );
                            }
                        }

                        continue;
                    }

                    // Create a new item

                    let newItem = list.ListRecord.createSubItem( list._item, list.Column );
                    newItem[list._associationColumn] = id;
                    newItem._selected = false;
                    list._array[newItem._id] = newItem;

                    if ( fnEventCreate ) {
                        try {
                            fnEventCreate( "onCreate", list.Table, newItem._id, newItem );
                        } catch ( e ) {
                            Logger.Instance.exception( list.Table, "Exception on creating item", e );
                        }
                    }
                }

                // Delete item to remove

                for ( let i in itemToRemove ) {
                    // Remove the item

                    let item = oldList[i];
                    let id = list.getId( item );
                    delete list._array[id];
                    if ( id in list._targetArray )
                        delete list._targetArray[id];

                    // Notify the deleting item

                    if ( fnEventDelete ) {
                        try {
                            fnEventDelete( "onDelete", list.Table, id, item );
                        } catch ( e ) {
                            Logger.Instance.exception( list.Table, "Exception on deleting item", e );
                        }
                    }
                }
            };
        }

        /*
         * Update the list of items when a new item is added into the association table
         */
        function handleOnLoad( list ) {
            return function ( event, table ) {
                list.updateListItems();
                list.raise( "onLoad", table );
            };
        }

        super.onOpen();

        this._listAssociation.on( "onCreate", handleOnUpdate( this ) );
        this._listAssociation.on( "onUpdate", handleOnUpdate( this ) );
        this._listAssociation.on( "onDelete", handleOnUpdate( this ) );
        this._listAssociation.on( "onLoad", handleOnLoad( this ) );

        this._listAssociation.onOpen();
    }

    /**
     * this function is cancelled the following
     */
    onClose() {
        this._listAssociation.unbind( "onCreate" );
        this._listAssociation.unbind( "onUpdate" );
        this._listAssociation.unbind( "onDelete" );
        this._listAssociation.unbind( "onLoad" );

        this._listAssociation.onClose();

        super.onClose();
    }

    /**
     * Get the html content of an attribute (to show the attribute)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a HTML code describing the attribute or the value of the attribute
     */
    getAttributHTML( item, attribute ) {
        return attribute === "_selected" ? this.getAttributHTMLBoolean( item, attribute ) : super.getAttributHTML( item, attribute );
    }

    /**
     * Get the html content of a tooltip for an attribute (to show the value into a board)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a HTML code describing the tooltip to show of the attribute
     */
    getAttributToolTipHTML( item, attribute ) {
        return attribute === "_selected" ? "" : super.getAttributToolTipHTML( item, attribute );
    }

    /**
     * Get the text of an attribute (to filter the value)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {string} a string representing the value of the field
     */
    getAttributText( item, attribute ) {
        return attribute === "_selected" ? "" : super.getAttributText( item, attribute );
    }

    /**
     * Get the value of an attribute (to sort it)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} value of the field
     */
    getAttributValue( item, attribute ) {
        return attribute === "_selected" ? ( item._selected === true ) : super.getAttributText( item, attribute );
    }

    /**
     * Add a new association between the current item and an associated item selected
     * @param {any} newItem item to add
     * @param {any} errors container of errors after adding
     * @param {any} force  true if the first step (warning is validated by the user)
     * @returns {any} new item added into the list or errors
     */
    addItem( newItem, errors, force ) {
        // Update link between some properties and its history

        newItem = DSDatabase.Instance.updateHistoryProperties( this.Table, newItem );

        // check properties of the newItem

        newItem = DSDatabase.Instance.checkProperties( this.Table, newItem, errors );

        if ( errors.HasError )
            return errors;

        // check properties

        let confirmation = this.checkItem( newItem, errors, force );

        if ( errors.HasError )
            return errors;

        if ( Helper.IsLabel( confirmation ) )
            return confirmation;

        // update the _array list

        let currentAssociationId = newItem[this._associationColumn];
        let oldItem = null;

        newItem._selected = false;

        for ( let id in this._array ) {
            if ( this._array[id][this._associationColumn] === currentAssociationId ) {
                // update the current record and put it as selected

                oldItem = this._array[id];
                this._array[id] = newItem;

                newItem.Id = oldItem.Id;
                newItem._id = oldItem._id;
                newItem._selected = true;

                break;
            }
        }

        if ( !newItem._selected ) {
            Logger.Instance.error( "List.ListArrayRecordAssociation", "The list references an inexisting element ..." );
            errors.addFatal( "ERR_EXCEPTION_UNEXPECTED" );
            return errors;
        }

        // update the item into the list

        this._targetArray[newItem._id] = newItem;
        newItem._selected = true;

        // notify to the board that a new item is available

        this.raise( "onUpdate", this.Table, newItem.Id, oldItem, newItem );

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
    updateItem( id, oldItem, newItem, errors, force ) {
        return this.addItem( newItem, errors, force );
    }

    /**
     * Remove an association or unselect an association
     * @param {any} id id of the record removed
     * @param {any} oldItem item to remove
     * @param {any} errors container of errors after updating
     * @returns {any} item deleted or errors
     */
    deleteItem( id, oldItem, errors ) {

        // check if the oldItem is in _array list

        let currentAssociationId = oldItem[this._associationColumn];

        for ( let arrayId in this._array ) {
            if ( this._array[arrayId][this._associationColumn] === currentAssociationId ) {
                // update the current record and put it as unselected

                this._array[arrayId]._selected = false;

                // remove the item from the list

                delete this._targetArray[this._array[arrayId]._id];

                this.raise( "onUpdate", this.Table, id, oldItem, this._array[arrayId] );

                break;
            }
        }
    }

    /**
     * Constructor
     *
     * For example : User - UserModule - Module
     *   For a record from User, User[itemColumn] represents the list of items stored for the user
     *   For a record of the association (UserModule), UserModule[associationColumn] represents the reference on a record of Module
     *
     * @param {any} listParent instance of list having a sublist named column
     * @param {any} itemColumn name of the sub list into the container item
     * @param {any} listRecord reference on the list building a record describing the association
     * @param {any} associationColumn name of the column into the container item
     * @param {any} listAssociation reference on a list from the database
     */
    constructor( listParent, itemColumn, listRecord, associationColumn, listAssociation ) {
        super( listParent, itemColumn, listRecord );

        this._targetArray = [];
        this._associationColumn = associationColumn;
        this._listAssociation = listAssociation === undefined || listAssociation === null ? null : listAssociation;
        this._listAssociationAllRecords = this._listAssociation !== null ? this._listAssociation._allRecords : false;
    }
};
