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
 * Define a list within value included into a database table
 */
List.ListRecord = class extends List.List {
    /**
     * Handle a cache of lists (one per table)
     * @param {any} table table name
     * @returns {any} an instance of the list record attached to the table
     */
    static CACHE_LIST( table ) {
        if ( !this._cacheList )
            this._cacheList = {};

        var listReference = this._cacheList[table];
        if ( listReference !== null && listReference !== undefined )
            return listReference;

        // Look for an instance of the list dedicated to the given table

        try {
            listReference = eval( table + "Record.List" );
        } catch ( e ) {
            listReference = null;
        }

        // if not, build a default instance

        if ( listReference ) {
            listReference = new listReference( true );
        } else {
            listReference = new List.ListRecord( table, true );
        }

        this._cacheList[table] = listReference;
        return listReference;
    }

    /**
     * Add into the item every list assigned to this list
     * @param {any} subLists sub lists to add into the item
     * @param {any} item item to complete
     * @returns {any} item
     */
    static SetListValues( subLists, item ) {
        if ( subLists === undefined || subLists === null || item === null || item ===undefined || item._subLists !== undefined )
            return item;

        item._subLists = {};

        for ( let subListId in subLists ) {
            let subList = subLists[subListId];
            if ( subList === null || subList === undefined )
                continue;

            item._subLists[subListId] = {
                newSequenceId: -2,
                list: subList.list,
                table: subList.table,
                column: subList.column,
                composition: subList.composition,
                values: null
            };

            // Enable Lazyloading of the sub lists ... the sub list is computed only if it is gotten by the application

            Object.defineProperty( item, subListId, {
                enumerable: false,
                get: function () {
                    let subList = this._subLists[subListId];

                    if ( subList === null || subList === undefined ) {
                        subList.values = [];
                        return subList.values;
                    }

                    if ( subList.values !== null )
                        return subList.values;

                    subList.values = [];
                    subList.newSequenceId = -2;

                    if ( subList.list === null || this.Id < 0 )
                        return subList.values;

                    function handleReadList( parent, subList ) {
                        return function ( record ) {
                            if ( record[subList.column] === parent.Id ) {
                                record._parent = parent;
                                record._id = record.Id;
                                record._list = subList;
                                subList.values[record._id] = record;
                            }
                        };
                    }

                    subList.list.each( handleReadList( this, subList ) );

                    return subList.values;
                }
            } );
        }

        return item;
    }

    /**
     * Retrieve a record into the database by its path from an item
     * @param {any} table table of the item
     * @param {any} item  beginning item
     * @param {any} path  lsit of properties to get the expected record
     * @returns {any} record expected or null
     */
    static GetRecordByPath( table, item, path ) {
        if ( path === null || path === undefined )
            return item;

        if ( typeof path === "string" )
            path = [path];

        // Retrieve the item to look for

        for ( let i = 0; i < path.length; i++ ) {
            let id = item[path[i]];
            if ( id === null || id === undefined )
                return null;

            let column = DSDatabase.Instance.getColumn( table, path[i] );
            if ( column === null )
                return null;

            table = column.ForeignKey;
            if ( table === null )
                return null;
            table = table.Table;

            item = List.ListRecord.CACHE_LIST( table ).getItem( id, true );
            if ( item === null || item === undefined )
                return null;
        }

        return item;
    }

    /**
     * Get the table name of the list record
     */
    get Table() {
        return this._table;
    }

    /**
     * Get the property having a sequence of this table
     */
    get SequenceProperty() {
        return this._sequenceProperty;
    }

    /**
     * Destructor
     */
    destructor() {
        this._subLists = null;

        super.destructor();
    }

    /**
     * Assign a sub list attached to the current list, i.e. an aggregation or a composition attached to an item
     * For example: a user can get access to a list of modules
     * @param {string}  property    property name referencing the list of values
     * @param {string}  table       table name into the database manager
     * @param {string}  column      column name into the table to join within the item
     * @param {boolean} composition true if this list depends enterily of the current element (if the element is deleted all components are also deleted by cascade)
     * @param {any}     list        if defined, list building the sub list
     */
    declareListValues( property, table, column, composition, list ) {
        if ( this._subLists === null )
            this._subLists = { };

        this._subLists[property] = {
            list: list === null || list === undefined ? List.ListRecord.CACHE_LIST( table ) : list,
            table: table,
            column: column,
            composition: composition !== null && composition !== undefined && composition === true
        };
    }

    /**
     * Retrieve the properties of the list of values for a given property
     * @param {any} property property name referencing the list of values
     * @returns {any} list defined {list, table, column, composition} or null
     */
    getListValues( property ) {
        if ( this._subLists === null )
            return null;

        return this._subLists[property] === null || this._subLists[property] === undefined ? null : this._subLists[property];
    }

    /**
     * Declare a property as a sequence (starting with key within a given length)
     * @param {any} property property having the sequence
     * @param {any} key      prefix of the value (ex: OF0001)
     * @param {any} length   length of the sequence
     */
    declareSequence( property, key, length ) {
        this._sequenceProperty = property;
        this._sequenceKey = key;
        this._sequenceLength = length;
    }

    /**
     * If the new item must have a sequence
     * @param {any} item item to complete within the expected sequenceId
     * @param {any} fn function to call as the sequence is available
     */
    createSequence( item, fn ) {
        function handleNextSequence( list, item, fn ) {
            return function ( sequenceId ) {
                if ( typeof sequenceId === "number" ) {
                    item._sequenceId = sequenceId;
                    item[list._sequenceProperty] = list._sequenceKey + sequenceId.toString().padStart( list._sequenceLength - list._sequenceKey.length, "0" );
                }
                fn();
            };
        }

        if ( this._sequenceProperty === null ) {
            fn();
            return true;
        }

        if ( !Hub.Instance.IsRunning && !DSDatabase.Instance.hasSequence( this._sequenceKey) )
            return false;

        DSDatabase.Instance.nextSequence( this._sequenceKey, handleNextSequence( this, item, fn ) );
        return true;
    }

    /**
     * Compare 2 items by the text describing the item
     * @param {any} item1 first item
     * @param {any} item2 second item
     * @returns {int} -1, 0 or 1 on depends on the order of the 2 elements
     */
    compare( item1, item2 ) {
        var id1 = this.getText( item1 );
        var id2 = this.getText( item2 );

        if ( id1 === id2 )
            return 0;

        return id1 < id2 ? -1 : 1;
    }

    /**
     * Execute a function on each record visible
     * @param {any} fn function to call on each record
     */
    each( fn ) {
        function handleReadList( list, fn ) {
            return function ( record ) {
                if ( !list.isVisible( record ) )
                    return;

                fn( List.ListRecord.SetListValues( list._subLists, record ) );
            };
        }

        DSDatabase.Instance.each( this._table, handleReadList( this, fn ) );
    }

    /**
     * @returns {any} list of visible values containing into the table
     */
    getList() {
        var data = [];

        function handleReadList( list, array ) {
            return function ( item ) {
                if ( !list.isVisible( item ) )
                    return;

                array.push( List.ListRecord.SetListValues( list._subLists, item ) );
            };
        }

        DSDatabase.Instance.each( this._table, handleReadList( this, data ) );
        return data;
    }

    /**
     * this function is raised to follow the changement of the table
     */
    onOpen () {
        // handle events on updating the list from the database

        /*
         * Adding a new item into the list
         */
        function handleOnCreate( list ) {
            return function ( event, table, id, record ) {
                var fnEvent = list.getEvent( event );
                if ( !fnEvent )
                    return;

                fnEvent( event, table, id, record );
            };
        }

        /*
         * Update of an item
         */
        function handleOnUpdate( list ) {
            return function ( event, table, id, oldRecord, newRecord ) {
                var fnEvent = list.getEvent( event );
                if ( !fnEvent )
                    return;

                fnEvent( event, table, id, oldRecord, newRecord );
            };
        }

        /*
         * Deletion of an item
         */
        function handleOnDelete( list ) {
            return function ( event, table, id, record ) {
                var fnEvent = list.getEvent( event );
                if ( !fnEvent )
                    return;

                fnEvent( event, table, id, record );
            };
        }

        /*
         * Loading the list
         */
        function handleOnLoad( list ) {
            return function ( event, table ) {
                var fnEvent = list.getEvent( event );
                if ( !fnEvent )
                    return;

                fnEvent( event, table );
            };
        }

        super.onOpen();

        this.addListener( DSDatabase.Instance.addEventListener( "onCreate", this._table, "*", handleOnCreate( this ) ) );
        this.addListener( DSDatabase.Instance.addEventListener( "onUpdate", this._table, "*", handleOnUpdate( this ) ) );
        this.addListener( DSDatabase.Instance.addEventListener( "onDelete", this._table, "*", handleOnDelete( this ) ) );
        this.addListener( DSDatabase.Instance.addEventListener( "onLoad", this._table, "*", handleOnLoad( this ) ) );
    }

    /**
     * @returns {any} New record of the table
     */
    get NewItem() {
        if ( this._subLists === null )
            return DSDatabase.Instance.getNewRow( this._table );

        var newRecord = List.ListRecord.SetListValues( this._subLists, DSDatabase.Instance.getNewRow( this._table ) );

        if ( this._sequenceProperty !== null ) {
            newRecord._sequenceProperty = this._sequenceProperty;
            newRecord._sequenceKey = this._sequenceKey;
            newRecord._sequenceLength = this._sequenceLength;
            newRecord._sequenceId = null;
        }

        for ( let subListId in this._subLists ) {
            let subList = newRecord._subLists[subListId];

            if ( subList === null || subList === undefined )
                continue;

            subList.values = [];
        }

        return newRecord;
    }

    /**
     * Add a new element into a sub list and retrieve it
     * @param {any} item     record containing the sub list to increase
     * @param {any} property name of the sub list
     * @returns {any} new record
     */
    createSubItem( item, property ) {
        List.ListRecord.SetListValues( this._subLists, item );

        if ( item === null || item === undefined || item._subLists === null || item._subLists === undefined )
            return null;

        var subList = item._subLists[property];

        if ( subList === null || subList === undefined || subList.list === null )
            return null;

        var newSubItem = subList.list.NewItem;
        newSubItem[subList.column] = item.Id;
        newSubItem._id = subList.newSequenceId--;
        newSubItem._parent = item;
        newSubItem._list = subList;

        return newSubItem;
    }

    /**
     * Retrieve an item into the list by its id
     * If force is true, the filter is not applied to look for the id
     * @param {any} id    id of the record to look for
     * @param {any} force true if the record must be retrieved even if the record is not visible
     * @returns {any} item or null
     */
    getItem( id, force ) {
        var item = null;

        if ( typeof id === "number" ) {
            item = DSDatabase.Instance.getRowById( this._table, id );
        } else if ( typeof id === "string" ) {
            item = DSDatabase.Instance.getRowById( this._table, parseInt( id ) );
        }

        if ( item === null )
            return null;

        if ( force !== null && force !== undefined && force )
            return List.ListRecord.SetListValues( this._subLists, item );

        if ( item._deleted || !this.isVisible( item ) )
            return null;

        return List.ListRecord.SetListValues( this._subLists, item );
    }

    /**
     * Get the html content of an attribute (to show the attribute)
     * @param {any} item record containing the attribute to look for
     * @param {any} attribute property to retrieve
     * @returns {any} a HTML code describing the attribute or the value of the attribute
     */
    getAttributHTML ( item, attribute ) {
        switch ( attribute ) {
            case "Enable":
                return this.getAttributHTMLBoolean( item, attribute );

            case "Picture":
                return this.getAttributHTMLPicture( item, attribute );

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
        var record = null;

        switch ( attribute ) {
            case "Picture":
                return "";

            case "ToolTip":
                if ( item.ToolTip === undefined )
                    return this.getAttributText( item, "Comment" );

                var value = String.convertValue( item.ToolTip );
                return value === null ? "" : value;

            default:
                return super.getAttributText( item, attribute );
        }
    }

    /**
     * Indicates if the item is visible in this list or not
     * @param {any} item record to check
     * @returns {boolean} true if the record is visible or not into the list
     */
    isVisible( item ) {
        if ( !super.isVisible( item ) )
            return false;

        if ( this._allRecords )
            return true;

        return item.Enable !== undefined ? item.Enable : true;
    }

    /**
     * Check the validity of the item and its compositions
     * @param {any} item   record to check
     * @param {any} errors container of errors after checking
     * @param {any} force  true if the first step (warning is validated by the user)
     * @returns {any} null, undefined (ok if error is empty), Helper/string (warning and confirmation if error is empty) or errors (error)
     */
    checkItem( item, errors, force ) {
        var confirmation = null;

        if ( this._subLists === null )
            return null;

        for ( let subListId in this._subLists ) {
            let currentSubList = this._subLists[subListId];

            if ( currentSubList === null || currentSubList === undefined )
                continue;

            if ( currentSubList.list === null || currentSubList.list === undefined || !currentSubList.composition)
                continue;

            var list = item[subListId];

            for ( let i in list ) {
                let currentSubItem = list[i];
                if ( currentSubItem === null || currentSubItem === undefined )
                    continue;

                let errorItem = new Errors();
                let checkResult = currentSubList.list.checkItem( currentSubItem, errorItem, force );

                if ( errorItem.HasError )
                    errors.addError( subListId + "[" + currentSubItem._id + "]", errorItem );

                if ( confirmation === null && Helper.IsLabel( checkResult ) )
                    confirmation = checkResult;
            }
        }

        if ( errors.HasError )
            return errors;

        if ( Helper.IsLabel( confirmation ) )
            return confirmation;

        return null;
    }

    /**
     * Add a new history item (copy of the item and link towards items having history too)
     * @param {any} nature create (0), update (1) or delete (2)
     * @param {any} oldItem old item to add into the history
     * @param {any} newItem old item to add into the history
     * @param {any} parentColumn column name of the jointure
     * @param {any} parentValue value attached to the jointure
     * @returns {any} a new history item (copy of item)
     */
    addHistory( nature, oldItem, newItem, parentColumn, parentValue ) {
        if ( this._subLists === null )
            return;

        var subListHistory = this._subLists["History"];
        if ( subListHistory === undefined || subListHistory === null )
            return;

        // Clone the current item (not children)

        var historyItem = {};
        var item = newItem === null ? oldItem : newItem;
        for ( var attr in item ) {
            if ( attr.startsWith( "_" ) || parentColumn === attr )
                continue;

            var value = item[attr];

            if ( value === undefined )
                value = null;

            if ( value === null ) {
                historyItem[attr] = null;
                continue;
            }

            if ( typeof value === "function" )
                continue;

            if ( typeof value === "number" && attr !== "Id" && !attr.startsWith("Copy") ) {
                let historyValue = DSDatabase.Instance.getHistoryValue( this.Table, attr, value );
                if ( historyValue === null ) {
                    historyItem[attr] = value;
                } else {
                    historyItem["History" + attr] = historyValue.Id;
                    historyItem[attr] = historyValue.HistoryId;
                }
                continue;
            }

            if ( typeof value === "string" || typeof value === "number" || typeof value === "boolean" ) {
                historyItem[attr] = value;
                continue;
            }

            if ( value instanceof Date ) {
                historyItem[attr] = new Date( value );
                continue;
            }

            if ( value instanceof moment ) {
                historyItem[attr] = new moment( value );
                continue;
            }
        }

        // Set History properties

        historyItem.HistoryId = historyItem.Id;
        historyItem.Id = -1;
        historyItem.HistoryUserId = DSDatabase.Instance.CurrentUser.Id;
        historyItem.HistoryDate = new moment();
        historyItem.HistoryNature = nature;

        if ( parentColumn !== undefined && parentColumn !== null ) {
            historyItem["History" + parentColumn] = item[parentColumn];
            historyItem[parentColumn] = parentValue;
        }

        // Add item into the database

        var errors = new Errors();
        historyItem = DSDatabase.Instance.addFromClient( "History" + this.Table, historyItem, errors );

        if ( errors.HasError ) {
            Logger.Instance.warn( "List.ListRecord", "Errors occured during added history item (ignore it) : " + errors.toString() );
            return;
        }

        if ( this._subLists === null && this._subLists === undefined )
            return historyItem;

        // Add sub items into the history if the sub item is a composition

        for ( let subListId in this._subLists ) {
            let currentSubList = this._subLists[subListId];

            if ( currentSubList === null || currentSubList === undefined || subListId === "History" )
                continue;

            if ( currentSubList.list === null || currentSubList.list === undefined || !currentSubList.composition )
                continue;

            historyItem[subListId] = [];

            let list = List.ListRecord.CACHE_LIST( currentSubList.table );

            // Make the difference between old and new items

            let oldItems = oldItem === null ? [] : oldItem[subListId];
            let newItems = newItem === null ? [] : newItem[subListId];

            // New items

            for ( let i in newItems ) {
                let subNewItem = newItems[i];
                subNewItem = subNewItem === null || subNewItem === undefined ? null : subNewItem;

                let subOldItem = oldItems[i];
                subOldItem = subOldItem === null || subOldItem === undefined ? null : subOldItem;

                if ( subNewItem !== null && subOldItem === null )
                    historyItem[subListId].push( list.addHistory( List.ListHistory.CREATE, subOldItem, subNewItem, currentSubList.column, historyItem.Id ) );
            }

            // Update items

            for ( let i in newItems ) {
                let subNewItem = newItems[i];
                subNewItem = subNewItem === null || subNewItem === undefined ? null : subNewItem;

                let subOldItem = oldItems[i];
                subOldItem = subOldItem === null || subOldItem === undefined ? null : subOldItem;

                if ( subNewItem !== null && subOldItem !== null )
                    historyItem[subListId].push( list.addHistory( List.ListHistory.UPDATE, subOldItem, subNewItem, currentSubList.column, historyItem.Id ) );
            }

            // Delete items

            for ( let i in oldItems ) {
                let subNewItem = newItems[i];
                subNewItem = subNewItem === null || subNewItem === undefined ? null : subNewItem;

                let subOldItem = oldItems[i];
                subOldItem = subOldItem === null || subOldItem === undefined ? null : subOldItem;

                if ( subNewItem === null && subOldItem !== null )
                    historyItem[subListId].push( list.addHistory( List.ListHistory.DELETE, subOldItem, null, currentSubList.column, historyItem.Id ) );
            }
        }

        return historyItem;
    }

    /**
     * Add a new item into the database and return the item created (included compositions of the item)
     * @param {any} newItem item to add
     * @param {any} errors container of errors after adding
     * @param {any} force  true if the first step (warning is validated by the user)
     * @param {any} checkItem true if the item must be checked before adding (by default: true)
     * @returns {any} new item added into the list or errors
     */
    addItem( newItem, errors, force, checkItem ) {
        // Update link between some properties and its history

        newItem = DSDatabase.Instance.updateHistoryProperties( this.Table, newItem );

        // check the validity of the items

        if ( checkItem === null || checkItem === undefined || checkItem ) {
            var confirmation = this.checkItem( newItem, errors, force );

            if ( errors.HasError )
                return errors;

            if ( Helper.IsLabel( confirmation ) )
                return confirmation;
        }

        var itemCreated = DSDatabase.Instance.addFromClient( this._table, newItem, errors );

        if ( errors.HasError )
            return errors;

        // list of compositions

        if ( this._subLists === null )
            return itemCreated;

        List.ListRecord.SetListValues( this._subLists, itemCreated );

        for ( let subListId in this._subLists ) {
            let currentSubList = this._subLists[subListId];

            if ( currentSubList === null || currentSubList === undefined )
                continue;

            if ( currentSubList.list === null || currentSubList.list === undefined || !currentSubList.composition )
                continue;

            let newSubList = itemCreated._subLists[subListId];
            newSubList.values = [];

            var list = newItem[subListId];
            for ( let i in list ) {
                let subNewItem = list[i];
                if ( subNewItem === null || subNewItem === undefined )
                    continue;

                // Set the reference to the parent

                subNewItem[currentSubList.column] = itemCreated.Id;

                // Add the component into the database

                let errorItem = new Errors();
                let subItemCreated = currentSubList.list.addItem( subNewItem, errorItem, force, false );

                if ( errorItem.HasError )
                    errors.addError( subListId + "[" + subNewItem._id + "]", errorItem );

                if ( subItemCreated === null )
                    continue;

                // Add the new component into the new item created

                subItemCreated.__id = subNewItem._id;
                subItemCreated._id = subItemCreated.Id;
                subItemCreated._parent = itemCreated;
                subItemCreated._list = currentSubList;

                newSubList.values[subItemCreated.Id] = subItemCreated;
            }
        }

        if ( errors.HasError )
            return errors;

        if ( checkItem === null || checkItem === undefined || checkItem )
            this.addHistory( List.ListHistory.CREATE, null, itemCreated );

        return itemCreated;
    }

    /**
     * Update an item into the database
     * @param {any} id id of the record updated
     * @param {any} oldItem item to update
     * @param {any} newItem item updated
     * @param {any} errors container of errors after updating
     * @param {any} force  true if the first step (warning is validated by the user)
     * @param {any} checkItem true if the item must be checked before adding (by default: true)
     * @returns {any} item updated into the list or errors
     */
    updateItem( id, oldItem, newItem, errors, force, checkItem ) {
        // Update link between some properties and its history

        newItem = DSDatabase.Instance.updateHistoryProperties( this.Table, newItem );

        // check the validity of the items

        if ( checkItem === null || checkItem === undefined || checkItem ) {
            var confirmation = this.checkItem( newItem, errors, force );

            if ( errors.HasError )
                return errors;

            if ( Helper.IsLabel( confirmation ) )
                return confirmation;
        }

        // update the current item

        var itemUpdated = DSDatabase.Instance.updateFromClient( this._table, oldItem, newItem, errors );

        if ( errors.HasError )
            return errors;

        // update components

        if ( this._subLists === null )
            return itemUpdated;

        List.ListRecord.SetListValues( this._subLists, itemUpdated );

        for ( let subListId in this._subLists ) {
            let currentSubList = this._subLists[subListId];

            if ( currentSubList === null || currentSubList === undefined )
                continue;

            if ( currentSubList.list === null || currentSubList.list === undefined || !currentSubList.composition )
                continue;

            let oldListItems = oldItem[subListId];
            let newListItems = newItem[subListId];

            let newSubList = itemUpdated._subLists[subListId];
            newSubList.values = [];

            // Delete, Update and Add due to unicity constraint on identity into the sub element ...

            // Delete existing components

            for ( let id in oldListItems ) {
                let subItem = oldListItems[id];
                if ( subItem.Id === -1 || newListItems[id] )
                    continue;

                // Delete an existing item

                let errorItem = new Errors();
                currentSubList.list.deleteItem( subItem.Id, subItem, errorItem, false );

                if ( errorItem.HasError )
                    errors.addError( currentSubList.column + "[" + subItem._id + "]", errorItem );
            }

            // Update existing components

            for ( let id in newListItems ) {
                let subItem = newListItems[id];
                if ( subItem.Id === -1 )
                    continue;

                if ( DSRecord.IsEqual( subItem, oldListItems[id] ) ) {
                    newSubList.values[subItem.Id] = DSRecord.Clone(subItem);
                    newSubList.values[subItem.Id].__id = subItem._id;
                    continue;
                }

                // Update an existing item

                let errorItem = new Errors();
                var subItemUpdated = currentSubList.list.updateItem( subItem.Id, oldListItems[id], subItem, errorItem, force, false );

                if ( errorItem.HasError )
                    errors.addError( subListId + "[" + subItem._id + "]", errorItem );

                if ( subItemUpdated === null )
                    continue;

                // Add the new component into the item updated

                subItemUpdated.__id = subItem._id;
                subItemUpdated._id = subItemUpdated.Id;
                subItemUpdated._parent = itemUpdated;
                subItemUpdated._list = currentSubList;

                newSubList.values[subItemUpdated.Id] = subItemUpdated;
            }

            // Add new components

            for ( let id in newListItems ) {
                let subItem = newListItems[id];
                if ( subItem.Id !== -1 )
                    continue;

                // Set the reference to the parent

                subItem[currentSubList.column] = itemUpdated.Id;

                // Add the component into the database

                let errorItem = new Errors();
                let subItemCreated = currentSubList.list.addItem( subItem, errorItem, force, false );

                if ( errorItem.HasError )
                    errors.addError( subListId + "[" + subItem._id + "]", errorItem );

                if ( subItemCreated === null )
                    continue;

                // Add the new component into the item updated

                subItemCreated.__id = subItem._id;
                subItemCreated._id = subItemCreated.Id;
                subItemCreated._parent = itemUpdated;
                subItemCreated._list = currentSubList;

                newSubList.values[subItemCreated.Id] = subItemCreated;
            }
        }

        if ( errors.HasError )
            return errors;

        if ( checkItem === null || checkItem === undefined || checkItem )
            this.addHistory( List.ListHistory.UPDATE, oldItem, itemUpdated );

        return itemUpdated;
    }

    /**
     * Remove an item into the database
     * @param {any} id id of the record removed
     * @param {any} oldItem item to remove
     * @param {any} errors container of errors after updating
     * @param {any} checkItem true if the item must be checked before adding (by default: true)
     * @returns {any} item deleted or errors
     */
    deleteItem ( id, oldItem, errors, checkItem ) {

        if ( this._subLists !== null ) {
            // Delete the composition first

            for ( let subListId in this._subLists ) {
                let currentSubList = this._subLists[subListId];

                if ( currentSubList === null || currentSubList === undefined )
                    continue;

                if ( currentSubList.list === null || currentSubList.list === undefined || !currentSubList.composition )
                    continue;

                var list = oldItem[subListId];

                for ( let i in list ) {
                    let currentSubItem = list[i];
                    if ( currentSubItem === null || currentSubItem === undefined )
                        continue;

                    // Delete the component into the database

                    let errorItem = new Errors();
                    currentSubList.list.deleteItem( currentSubItem.Id, currentSubItem, errorItem, false );

                    if ( errorItem.HasError )
                        errors.addError( subListId + "[" + currentSubItem._id + "]", errorItem );
                }

                oldItem._subLists[subListId].values = [];
            }

            if ( errors.HasError )
                return errors;
        }

        // delete the item

        var itemDeleted = DSDatabase.Instance.deleteFromClient( this._table, oldItem, errors );

        if ( errors.HasError )
            return errors;

        if ( this._subLists === null )
            return itemDeleted;

        // clean up all components of the item

        itemDeleted = List.ListRecord.SetListValues( this._subLists, itemDeleted );

        for ( let subListId in this._subLists ) {
            let subList = itemDeleted._subLists[subListId];

            if ( subList === null || subList === undefined )
                continue;

            subList.values = [];
        }

        if ( checkItem === null || checkItem === undefined || checkItem )
            this.addHistory( List.ListHistory.DELETE, itemDeleted, null );

        return itemDeleted;
    }

    /**
     * Cancel the item into the database (revert the update)
     * @param {any} id id of the record updated
     * @param {any} oldItem item to update (null - cancel the creation)
     * @param {any} newItem item updated (null - cancel the deletion)
     * @param {any} errors container of errors after cancelling
     * @returns {any} true if the item is cancelled
     */
    cancelItem( id, oldItem, newItem, errors ) {
        if ( this._subLists === null )
            return true;

        if ( newItem !== null && newItem !== undefined && typeof newItem._sequenceId === "number" )
            DSDatabase.Instance.cancelSequence( newItem._sequenceKey, newItem._sequenceId );

        for ( let subListId in this._subLists ) {
            let currentSubList = this._subLists[subListId];

            if ( currentSubList === null || currentSubList === undefined )
                continue;

            if ( currentSubList.list === null || currentSubList.list === undefined || !currentSubList.composition )
                continue;

            let oldListItems = oldItem === null || oldItem === undefined ? null : oldItem[subListId];
            let newListItems = newItem === null || newItem === undefined ? null : newItem[subListId];

            // Cancel new components

            if ( newListItems !== null && newListItems !== undefined ) {
                for ( let id in newListItems ) {
                    let subItem = newListItems[id];
                    if ( subItem.Id !== -1 )
                        continue;

                    // Cancel the component into the list

                    let errorItem = new Errors();
                    currentSubList.list.cancelItem( subItem.Id, null, subItem, errorItem );

                    if ( errorItem.HasError )
                        errors.addError( subListId + "[" + subItem._id + "]", errorItem );
                }
            }

            // Cancel the updating of the existing components

            if ( newListItems !== null && newListItems !== undefined && oldListItems !== null && oldListItems !== undefined ) {
                for ( let id in newListItems ) {
                    let subItem = newListItems[id];
                    if ( subItem.Id === -1 )
                        continue;

                    if ( DSRecord.IsEqual( subItem, oldListItems[id] ) )
                        continue;

                    // Cancel the item updated

                    let errorItem = new Errors();
                    currentSubList.list.cancelItem( subItem.Id, oldListItems[id], subItem, errorItem );

                    if ( errorItem.HasError )
                        errors.addError( subListId + "[" + subItem._id + "]", errorItem );
                }
            }

            // Cancel the deletion of the existing components

            if ( oldListItems !== null && oldListItems !== undefined ) {
                for ( let id in oldListItems ) {
                    let subItem = oldListItems[id];
                    if ( subItem.Id === -1 || newListItems !== null && newListItems !== undefined && newListItems[id] )
                        continue;

                    // Delete an existing item

                    let errorItem = new Errors();
                    currentSubList.list.cancelItem( subItem.Id, subItem, null, errorItem );

                    if ( errorItem.HasError )
                        errors.addError( subListId + "[" + subItem._id + "]", errorItem );
                }
            }
        }

        return !errors.HasError;
    }

    /**
     * Begin Transaction
     * @param {any} label label to show into the transaction
     */
    beginTransaction( label ) {
        DSDatabase.Instance.beginTransaction( label );
    }

    /**
     * End Transaction
     */
    endTransaction() {
        DSDatabase.Instance.endTransaction();
    }

    /**
     * Commit current changes
     * @param {any} record not used (record concerned by the commit)
     */
    commit ( record ) {
        DSDatabase.Instance.commit();
    }

    /**
     * Rollback current changes
     * @param {any} record not used (record concerned by the rollback)
     */
    rollback ( record ) {
        DSDatabase.Instance.rollback();
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
        if ( super.isBoxFieldReadonly( box, attribute, user, item ) )
            return true;

        if ( this._sequenceProperty !== null && attribute === this._sequenceProperty )
            return true;

        return false;
    }

    /**
     * Constructor
     * @param {any} table      table name
     * @param {any} allRecords true : take into account the Enable property
     */
    constructor( table, allRecords ) {
        super();

        this._table = table;
        this._allRecords = allRecords === null || allRecords === undefined || allRecords ? true : false; // show records even if it's disabled

        let sequence = DSDatabase.Instance.getSequence(table);

        this._sequenceProperty = sequence === null ? null : sequence.Property;
        this._sequenceKey = sequence === null ? null : sequence.Key;
        this._sequenceLength = sequence === null ? null : sequence.Length;

        this._subLists = null;
    }
};
