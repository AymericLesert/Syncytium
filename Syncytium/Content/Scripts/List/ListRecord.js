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
 * Define a list within value included into a database table
 */
List.ListRecord = class extends List.List {
    /**
     * Build a new sequence Id for a sub list
     * @returns {int} new sequence
     */
    static get GetSubListNewSequence() {
        if ( !this._newSequenceId ) {
            this._newSequenceId = -2;
            return -2;
        }

        this._newSequenceId--;
        return this._newSequenceId;
    }

    /**
     * Handle a cache of lists (one per table)
     * @param {any} table table name
     * @returns {any} an instance of the list record attached to the table
     */
    static CACHE_LIST( table ) {
        if ( !this._cacheList )
            this._cacheList = {};

        let listReference = this._cacheList[table];
        if ( listReference !== null && listReference !== undefined )
            return listReference;

        // Look for an instance of the list dedicated to the given table

        try {
            let classList = eval( table + "Record.List" );
            listReference = new classList( true );
            Logger.Instance.verbose( "CACHE_LIST", "[1] : " + table );
            this._cacheList[table] = listReference;
            return listReference;
        } catch ( e ) {
            Logger.Instance.verbose( "CACHE_LIST", "[1] Unable to create list '" + table + "'" );
            listReference = null;
        }

        // Build a history list and its sub lists (based on the original class)

        if ( table.startsWith( "History" ) && table !== "History" ) {
            try {
                let classList = eval( table.substr( 7 ) + "Record.List" );
                listReference = new List.ListRecord( table, true );
                Logger.Instance.verbose( "CACHE_LIST", "[2] : " + table );
                this._cacheList[table] = listReference;

                let parentList = new classList( true );
                if ( parentList._subLists !== null && parentList._subLists !== undefined ) {
                    for ( let property in parentList._subLists ) {
                        if ( property === "History" )
                            continue;

                        let subList = parentList._subLists[property];

                        if ( !subList.composition ) {
                            listReference.declareListValues( property, subList.table, subList.column, false, null );
                            listReference._subLists[property].history = true;
                        } else {
                            listReference.declareListValues( property, "History" + subList.table, subList.column, false );
                        }
                    }
                }
                return listReference;
            } catch ( e ) {
                Logger.Instance.verbose( "CACHE_LIST", "[2] Unable to create list '" + table + "'" );
                listReference = null;
            }
        }

        // if not, build a default instance

        listReference = new List.ListRecord( table, true );
        Logger.Instance.verbose( "CACHE_LIST", "[3] : " + table );
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
        if ( subLists === undefined || subLists === null || item === null || item === undefined || item._subLists !== undefined )
            return item;

        item._subLists = {};

        for ( let subListId in subLists ) {
            let subList = subLists[subListId];
            if ( subList === null || subList === undefined )
                continue;

            item._subLists[subListId] = {
                list: subList.list,
                table: subList.table,
                column: subList.column,
                property: subListId,
                composition: subList.composition,
                history: subList.history,
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

                    if ( subList.list === null || this.Id < 0 )
                        return subList.values;

                    let keys = {};
                    keys[subList.column] = this.Id;
                    if ( subList.history && this.HistoryId !== null && this.HistoryId !== undefined )
                        keys[subList.column] = this.HistoryId;
                    for ( let value of Array.toIterable( subList.list.getListIndexed( subList.column, keys ) ) ) {
                        value._parent = this;
                        value._id = value.Id;
                        value._list = subList;
                        subList.values[value._id] = value;
                    }

                    return subList.values;
                }
            } );
        }

        return item;
    }

    /**
     * Add into the item every foreign keys assigned to this list
     * @param {any} foreignKeys list of foreign keys to add into the item ([key] = list representing the foreign table)
     * @param {any} item item to complete
     * @returns {any} item
     */
    static SetForeignKeys( foreignKeys, item ) {
        if ( foreignKeys === undefined || foreignKeys === null || item === null || item === undefined || item._foreignKeys !== undefined )
            return item;

        item._foreignKeys = {};

        for ( let foreignKeyId in foreignKeys ) {
            let foreignKey = foreignKeys[foreignKeyId];
            if ( foreignKey === null || foreignKey === undefined )
                continue;

            item._foreignKeys[foreignKeyId] = {
                field: foreignKey.field,
                table: foreignKey.table,
                list: foreignKey.list,
                id: null,
                value: null
            };

            // Enable Lazyloading of the foreign record ...

            Object.defineProperty( item, foreignKeyId, {
                enumerable: false,
                get: function () {
                    let foreignKey = this._foreignKeys[foreignKeyId];
                    let id = this[foreignKey.field];

                    if ( foreignKey.value !== null && foreignKey.value.Id >= 0 && foreignKey.id === id && foreignKey.value.Id === id )
                        return foreignKey.value;

                    if ( id === null || id === undefined ) {
                        foreignKey.id = null;
                        foreignKey.value = null;
                        return null;
                    }

                    let referenceRecord = null;

                    if ( id < 0 ) {
                        if ( this._id !== undefined && this._id !== null && this._id < 0 ) {
                            referenceRecord = this._parent;
                        } else {
                            referenceRecord = null;
                        }
                    } else {
                        referenceRecord = foreignKey.list.getItem( id, true );
                    }

                    if ( referenceRecord === null || referenceRecord === undefined ) {
                        foreignKey.id = null;
                        foreignKey.value = null;
                        return null;
                    }

                    foreignKey.id = referenceRecord.Id;
                    foreignKey.value = referenceRecord;
                    return referenceRecord;
                },
                set: function ( value ) {
                    let foreignKey = this._foreignKeys[foreignKeyId];

                    if ( value === null || value === undefined ) {
                        this[foreignKey.field] = null;
                        foreignKey.id = null;
                        foreignKey.value = null;
                        return;
                    }

                    let item = null;
                    if ( typeof value === "number" || typeof value === "string" ) {
                        item = foreignKey.list.getItem( id, true );
                    } else if ( value.Id !== null && value.Id !== undefined ) {
                        item = value;
                    }

                    if ( item === null ) {
                        this[foreignKey.field] = null;
                        foreignKey.id = null;
                        foreignKey.value = null;
                    } else {
                        this[foreignKey.field] = item.Id;
                        foreignKey.id = item.Id;
                        foreignKey.value = item;
                    }
                }
            } );
        }

        return item;
    }

    /**
     * Add into the item every list assigned to this list and every foreign keys to this list
     * @param {any} origin list or record containing references or subLists to set
     * @param {any} item item to complete
     * @returns {any} item
     */
    static SetExtendedFields( origin, item ) {
        item = List.ListRecord.SetListValues( origin._subLists, item );

        if ( origin instanceof List.ListRecord ) {
            if ( origin._foreignKeys === null ) {
                let foreignKeys = DSDatabase.Instance.getForeignKeys( origin.Table );

                origin._foreignKeys = {};
                for ( let foreignKeyId in foreignKeys ) {
                    let foreignKey = foreignKeys[foreignKeyId];

                    let fieldId = foreignKeyId;
                    if ( foreignKeyId === "HistoryId" )
                        foreignKeyId = "HistoryRef";
                    else if ( foreignKeyId.endsWith( "Id" ) )
                        foreignKeyId = foreignKeyId.substr( 0, foreignKeyId.length - 2 );
                    else
                        foreignKeyId += "Ref";

                    origin._foreignKeys[foreignKeyId] = {
                        field: fieldId,
                        table: foreignKey,
                        list: List.ListRecord.CACHE_LIST( foreignKey ),
                        id: null,
                        value: null
                    };
                }
            }
        }

        return List.ListRecord.SetForeignKeys( origin._foreignKeys, item );
    }

    /**
     * Reset reference on foreign keys and sub lists ... use to force reloading data
     * @param {any} item item to clean up
     * @returns {any} item
     */
    static CleanUpExtendedFields( item ) {
        if ( item === null || item === undefined )
            return item;

        if ( item._subLists !== null && item._subLists !== undefined ) {
            for ( let subList of Array.toIterable( item._subLists ) )
                subList.values = null;
        }

        if ( item._foreignKeys !== null && item._foreignKeys !== undefined ) {
            for ( let foreignKey of Array.toIterable( item._foreignKeys ) ) {
                foreignKey.id = null;
                foreignKey.value = null;
            }
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
     * On CSV file, replace each method by this array of items
     */
    set CSVList( list ) {
        this._csv_list = list;
    }

    /**
     * On CSV file, retrieve the array of items
     */
    get CSVList() {
        return this._csv_list;
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
            property: property,
            composition: composition !== null && composition !== undefined && composition === true,
            history: false
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
        function handleNextSequence( list ) {
            return function ( sequenceId ) {
                if ( typeof sequenceId === "number" ) {
                    let newKey = list._sequenceKey + sequenceId.toString().padStart( list._sequenceLength, "0" );

                    let keyItem = {};
                    keyItem[list._sequenceProperty] = newKey;

                    let records = list.getListIndexed( list._sequenceProperty, keyItem );
                    if ( records.length === 0 ) {
                        item._sequenceId = sequenceId;
                        item[list._sequenceProperty] = newKey;
                        fn();
                        return true;
                    } else {
                        // sequence already exists ... go to the next one
                        return false;
                    }
                } else {
                    fn();
                    return true;
                }
            };
        }

        if ( this._sequenceProperty === null ) {
            fn();
            return true;
        }

        if ( !Hub.Instance.IsRunning && !DSDatabase.Instance.hasSequence( this._sequenceKey) )
            return false;

        DSDatabase.Instance.nextSequence( this._sequenceKey, handleNextSequence( this ) );
        return true;
    }

    /**
     * If the new item must have a sequence
     * @param {any} item item to complete within the expected sequenceId
     * @param {any} fn function to call as the sequence is available
     */
    async createSequenceAsync( item ) {
        function handleNextSequence( list ) {
            return function ( sequenceId ) {
                if ( typeof sequenceId === "number" ) {
                    let newKey = list._sequenceKey + sequenceId.toString().padStart( list._sequenceLength, "0" );

                    let keyItem = {};
                    keyItem[list._sequenceProperty] = newKey;

                    let records = list.getListIndexed( list._sequenceProperty, keyItem );
                    if ( records.length === 0 ) {
                        item._sequenceId = sequenceId;
                        item[list._sequenceProperty] = newKey;
                        fn();
                        return true;
                    } else {
                        // sequence already exists ... go to the next one
                        return false;
                    }
                } else {
                    fn();
                    return true;
                }
            };
        }

        if ( this._sequenceProperty === null ) {
            fn();
            return true;
        }

        if ( !Hub.Instance.IsRunning && !DSDatabase.Instance.hasSequence( this._sequenceKey ) )
            return false;

        DSDatabase.Instance.nextSequence( this._sequenceKey, handleNextSequence( this ) );
        return true;
    }

    /**
     * Compare 2 items by the text describing the item
     * @param {any} item1 first item
     * @param {any} item2 second item
     * @returns {int} -1, 0 or 1 on depends on the order of the 2 elements
     */
    compare( item1, item2 ) {
        let id1 = this.getText( item1 );
        let id2 = this.getText( item2 );

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
                record = List.ListRecord.SetExtendedFields( list, record );

                if ( !list.isVisible( record ) )
                    return;

                fn( record );
            };
        }

        DSDatabase.Instance.each( this._table, handleReadList( this, fn ) );
    }

    /**
     * @returns {any} list of visible values containing into the table
     */
    getList() {
        let data = [];

        function handleReadList( list, array ) {
            return function ( item ) {
                item = List.ListRecord.SetExtendedFields( list, item );

                if ( !list.isVisible( item ) )
                    return;

                array.push( item );
            };
        }

        DSDatabase.Instance.each( this._table, handleReadList( this, data ) );
        return data;
    }

    /**
     * Retrieve the list of records matching within the keys
     * @param {any} column column name
     * @param {any} keys structure containing the list of keys and values looking for
     * @returns {Array} array of records
     */
    getListIndexed( column, keys ) {
        function handleRead( list, records, keys ) {
            return function ( record ) {
                if ( !list.isVisible( record ) )
                    return;

                for ( let attr in keys )
                    if ( record[attr] !== keys[attr] )
                        return;

                records.push( record );
            };
        }

        // Looking for ids from the index of the column

        let ids = DSDatabase.Instance.getIndex( this.Table, column, keys );
        let records = [];

        if ( ids === null ) {
            // Looking for the value by searching on all values line by line
            Logger.Instance.warn( "List[" + this._table + "]", "Index missing on the column '" + column + "' for keys " + String.JSONStringify( keys ) );
            console.warn( "List[" + this._table + "] : Index missing on the column '" + column + "' for keys " + String.JSONStringify( keys ) );

            this.each( handleRead( this, records, keys ) );
        } else {
            for ( let id of Array.toIterable( ids ) ) {
                let record = this.getItem( id );

                if ( !this.isVisible( record ) )
                    continue;

                records.push( record );
            }
        }

        return records;
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
                list.raise( event, table, id, record );
            };
        }

        /*
         * Update of an item
         */
        function handleOnUpdate( list ) {
            return function ( event, table, id, oldRecord, newRecord ) {
                list.raise( event, table, id, oldRecord, newRecord );
            };
        }

        /*
         * Deletion of an item
         */
        function handleOnDelete( list ) {
            return function ( event, table, id, record ) {
                list.raise( event, table, id, record );
            };
        }

        /*
         * Loading the list
         */
        function handleOnLoad( list ) {
            return function ( event, table ) {
                list.raise( event, table );
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

        let newRecord = List.ListRecord.SetExtendedFields( this, DSDatabase.Instance.getNewRow( this._table ) );

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
     * Create a new element from a sub list
     * Do not add the element into the sub list
     * @param {any} item     record containing the sub list to increase
     * @param {any} property name of the sub list
     * @returns {any} new record
     */
    createSubItem( item, property ) {
        List.ListRecord.SetExtendedFields( this, item );

        if ( item === null || item === undefined || item._subLists === null || item._subLists === undefined )
            return null;

        let subList = item._subLists[property];

        if ( subList === null || subList === undefined || subList.list === null )
            return null;

        let newSubItem = subList.list.NewItem;
        newSubItem[subList.column] = item.Id;
        newSubItem._parent = item;
        newSubItem._id = List.ListRecord.GetSubListNewSequence;
        newSubItem._list = subList;
        List.ListRecord.SetExtendedFields( subList.list, newSubItem );

        return newSubItem;
    }

    /**
     * Create and add a new element into a sub list and retrieve it
     * @param {any} item     record containing the sub list to increase
     * @param {any} property name of the sub list
     * @returns {any} new record
     */
    addSubItem( item, property ) {
        let newSubItem = this.createSubItem( item, property );
        item[property][newSubItem._id] = newSubItem;
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
        let item = null;

        if ( typeof id === "number" ) {
            item = DSDatabase.Instance.getRowById( this._table, id );
        } else if ( typeof id === "string" ) {
            item = DSDatabase.Instance.getRowById( this._table, parseInt( id ) );
        }

        if ( item === null )
            return null;

        item = List.ListRecord.SetExtendedFields( this, item );

        if ( force !== null && force !== undefined && force )
            return item;

        if ( item._deleted || !this.isVisible( item ) )
            return null;

        return item;
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
    getAttributText( item, attribute ) {
        let value = null;

        switch ( attribute ) {
            case "Picture":
                return "";

            case "ToolTip":
                if ( item.ToolTip === undefined )
                    return this.getAttributText( item, "Comment" );

                value = String.convertValue( item.ToolTip );
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
     * Check the validity of the properties of the item and its compositions
     * @param {any} item   record to check
     * @param {any} errors container of errors after checking
     * @param {any} force  true if the first step (warning is validated by the user)
     * @returns {any} null, undefined (ok if error is empty) or errors (error)
     */
    checkProperties( item, errors ) {
        let newItem = DSDatabase.Instance.checkProperties( this.Table, item, errors );

        if ( this._subLists === null )
            return null;

        for ( let subListId in this._subLists ) {
            let currentSubList = this._subLists[subListId];

            if ( currentSubList === null || currentSubList === undefined )
                continue;

            if ( currentSubList.list === null || currentSubList.list === undefined || !currentSubList.composition )
                continue;

            for ( let currentSubItem of Array.toIterable( newItem[subListId] ) ) {
                let errorItem = new Errors();
                currentSubList.list.checkProperties( currentSubItem, errorItem );

                if ( errorItem.HasError ) {
                    if ( currentSubItem._line === null || currentSubItem._line === undefined )
                        errors.addError( Language.Manager.Instance.interpolation( "ERR_ID", [subListId, currentSubItem._id] ), errorItem );
                    else
                        errors.addError( Language.Manager.Instance.interpolation( "ERR_LINE", [subListId, currentSubItem._line] ), errorItem );
                }
            }
        }

        if ( errors.HasError )
            return errors;

        return null;
    }

    /**
     * Check the validity of the item and its compositions
     * @param {any} item   record to check
     * @param {any} errors container of errors after checking
     * @param {any} force  true if the first step (warning is validated by the user)
     * @returns {any} null, undefined (ok if error is empty), Helper/string (warning and confirmation if error is empty) or errors (error)
     */
    checkItem( item, errors, force ) {
        let confirmation = null;

        if ( this._subLists === null )
            return null;

        for ( let subListId in this._subLists ) {
            let currentSubList = this._subLists[subListId];

            if ( currentSubList === null || currentSubList === undefined )
                continue;

            if ( currentSubList.list === null || currentSubList.list === undefined || !currentSubList.composition)
                continue;

            for ( let currentSubItem of Array.toIterable( item[subListId] ) ) {
                let errorItem = new Errors();
                let checkResult = currentSubList.list.checkItem( currentSubItem, errorItem, force );

                if ( errorItem.HasError ) {
                    if ( currentSubItem._line === null || currentSubItem._line === undefined )
                        errors.addError( Language.Manager.Instance.interpolation( "ERR_ID", [subListId, currentSubItem._id] ), errorItem );
                    else
                        errors.addError( Language.Manager.Instance.interpolation( "ERR_LINE", [subListId, currentSubItem._line] ), errorItem );
                }

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

        let subListHistory = this._subLists["History"];
        if ( subListHistory === undefined || subListHistory === null )
            return;

        // Clone the current item (not children)

        let historyItem = {};
        let item = newItem === null ? oldItem : newItem;
        for ( let attr in item ) {
            if ( attr.startsWith( "_" ) || parentColumn === attr )
                continue;

            let value = item[attr];

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

        let errors = new Errors();
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
            let confirmation = this.checkItem( newItem, errors, force );

            if ( errors.HasError )
                return errors;

            if ( Helper.IsLabel( confirmation ) )
                return confirmation;
        }

        let itemCreated = DSDatabase.Instance.addFromClient( this._table, newItem, errors );

        if ( errors.HasError )
            return errors;

        // list of compositions

        if ( this._subLists === null )
            return itemCreated;

        List.ListRecord.SetExtendedFields( this, itemCreated );

        for ( let subListId in this._subLists ) {
            let currentSubList = this._subLists[subListId];

            if ( currentSubList === null || currentSubList === undefined )
                continue;

            if ( currentSubList.list === null || currentSubList.list === undefined || !currentSubList.composition )
                continue;

            let newSubList = itemCreated._subLists[subListId];
            newSubList.values = [];

            for ( let subNewItem of Array.toIterable( newItem[subListId] ) ) {
                // Set the reference to the parent

                subNewItem[currentSubList.column] = itemCreated.Id;

                // Add the component into the database

                let errorItem = new Errors();
                let subItemCreated = currentSubList.list.addItem( subNewItem, errorItem, force, false );

                if ( errorItem.HasError ) {
                    if ( subNewItem._line === null || subNewItem._line === undefined )
                        errors.addError( Language.Manager.Instance.interpolation( "ERR_ID", [subListId, subNewItem._id] ), errorItem );
                    else
                        errors.addError( Language.Manager.Instance.interpolation( "ERR_LINE", [subListId, subNewItem._line] ), errorItem );
                }

                if ( subItemCreated === null )
                    continue;

                // Add the new component into the new item created

                subItemCreated._parent = itemCreated;
                subItemCreated.__id = subNewItem._id;
                subItemCreated._id = subItemCreated.Id;
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
            let confirmation = this.checkItem( newItem, errors, force );

            if ( errors.HasError )
                return errors;

            if ( Helper.IsLabel( confirmation ) )
                return confirmation;
        }

        // update the current item

        let itemUpdated = DSDatabase.Instance.updateFromClient( this._table, oldItem, newItem, errors );

        if ( errors.HasError )
            return errors;

        // update components

        if ( this._subLists === null )
            return itemUpdated;

        List.ListRecord.SetExtendedFields( this, itemUpdated );

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

                if ( errorItem.HasError ) {
                    if ( subItem._line === null || subItem._line === undefined )
                        errors.addError( Language.Manager.Instance.interpolation( "ERR_ID", [currentSubList.column, subItem._id] ), errorItem );
                    else
                        errors.addError( Language.Manager.Instance.interpolation( "ERR_LINE", [currentSubList.column, subItem._line] ), errorItem );
                }
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
                let subItemUpdated = currentSubList.list.updateItem( subItem.Id, oldListItems[id], subItem, errorItem, force, false );

                if ( errorItem.HasError ) {
                    if ( subItem._line === null || subItem._line === undefined )
                        errors.addError( Language.Manager.Instance.interpolation( "ERR_ID", [subListId, subItem._id] ), errorItem );
                    else
                        errors.addError( Language.Manager.Instance.interpolation( "ERR_LINE", [subListId, subItem._line] ), errorItem );
                }

                if ( subItemUpdated === null )
                    continue;

                // Add the new component into the item updated

                subItemUpdated._parent = itemUpdated;
                subItemUpdated.__id = subItem._id;
                subItemUpdated._id = subItemUpdated.Id;
                subItemUpdated._list = currentSubList;

                newSubList.values[subItemUpdated.Id] = subItemUpdated;
            }

            // Add new components

            for ( let subItem of Array.toIterable( newListItems ) ) {
                if ( subItem.Id !== -1 )
                    continue;

                // Set the reference to the parent

                subItem[currentSubList.column] = itemUpdated.Id;

                // Add the component into the database

                let errorItem = new Errors();
                let subItemCreated = currentSubList.list.addItem( subItem, errorItem, force, false );

                if ( errorItem.HasError ) {
                    if ( subItem._line === null || subItem._line === undefined )
                        errors.addError( Language.Manager.Instance.interpolation( "ERR_ID", [subListId, subItem._id] ), errorItem );
                    else
                        errors.addError( Language.Manager.Instance.interpolation( "ERR_LINE", [subListId, subItem._line] ), errorItem );
                }

                if ( subItemCreated === null )
                    continue;

                // Add the new component into the item updated

                subItemCreated._parent = itemUpdated;
                subItemCreated.__id = subItem._id;
                subItemCreated._id = subItemCreated.Id;
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

                for ( let currentSubItem of Array.toIterable( oldItem[subListId] ) ) {
                    // Delete the component into the database

                    let errorItem = new Errors();
                    currentSubList.list.deleteItem( currentSubItem.Id, currentSubItem, errorItem, false );

                    if ( errorItem.HasError ) {
                        if ( currentSubItem._line === null || currentSubItem._line === undefined )
                            errors.addError( Language.Manager.Instance.interpolation( "ERR_ID", [subListId, currentSubItem._id] ), errorItem );
                        else
                            errors.addError( Language.Manager.Instance.interpolation( "ERR_LINE", [subListId, currentSubItem._line] ), errorItem );
                    }
                }

                oldItem._subLists[subListId].values = [];
            }

            if ( errors.HasError )
                return errors;
        }

        // delete the item

        let itemDeleted = DSDatabase.Instance.deleteFromClient( this._table, oldItem, errors );

        if ( errors.HasError )
            return errors;

        if ( this._subLists === null )
            return itemDeleted;

        // clean up all components of the item

        itemDeleted = List.ListRecord.SetExtendedFields( this, itemDeleted );

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
                for ( let subItem of Array.toIterable( newListItems ) ) {
                    if ( subItem.Id !== -1 )
                        continue;

                    // Cancel the component into the list

                    let errorItem = new Errors();
                    currentSubList.list.cancelItem( subItem.Id, null, subItem, errorItem );

                    if ( errorItem.HasError ) {
                        if ( subItem._line === null || subItem._line === undefined )
                            errors.addError( Language.Manager.Instance.interpolation( "ERR_ID", [subListId, subItem._id] ), errorItem );
                        else
                            errors.addError( Language.Manager.Instance.interpolation( "ERR_LINE", [subListId, subItem._line] ), errorItem );
                    }
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

                    if ( errorItem.HasError ) {
                        if ( subItem._line === null || subItem._line === undefined )
                            errors.addError( Language.Manager.Instance.interpolation( "ERR_ID", [subListId, subItem._id] ), errorItem );
                        else
                            errors.addError( Language.Manager.Instance.interpolation( "ERR_LINE", [subListId, subItem._line] ), errorItem );
                    }
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

                    if ( errorItem.HasError ) {
                        if ( subItem._line === null || subItem._line === undefined )
                            errors.addError( Language.Manager.Instance.interpolation( "ERR_ID", [subListId, subItem._id] ), errorItem );
                        else
                            errors.addError( Language.Manager.Instance.interpolation( "ERR_LINE", [subListId, subItem._line] ), errorItem );
                    }
                }
            }
        }

        return !errors.HasError;
    }

    /**
     * Begin Transaction
     * @param {any} label label to show into the transaction
     * @param {any} notify true if the notification must be sent to the caller
     */
    beginTransaction( label, notify ) {
        super.beginTransaction( label, notify );
        DSDatabase.Instance.beginTransaction( label, notify );
    }

    /**
     * End Transaction
     */
    endTransaction() {
        DSDatabase.Instance.endTransaction();
        super.endTransaction();
    }

    /**
     * Commit current changes in asynchronous mode
     */
    async commitAsync() {
        await DSDatabase.Instance.commit();
    }

    /**
     * Rollback current changes
     */
    rollback () {
        DSDatabase.Instance.rollback();
    }

    /**
     * Rollback current changes in asynchronous mode
     * @param {any} record not used (record concerned by the rollback)
     */
    async rollbackAsync() {
        await DSDatabase.Instance.rollbackAsync();
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
     * Declare mainKey and otherKey as different keys into the file
     * @param {any} mainKey first column containing key
     * @param {any} otherKey second column having a key too
     */
    declareKeysCSV( mainKey, otherKey ) {
        super.declareKeysCSV( mainKey, otherKey );

        this._csv_keys.push( [mainKey, otherKey] );
    }

    /**
     * Declare an association between a property read from CSV file and a given table
     * @param {string} property name of the property identifying the expected value
     * @param {string} table    table name representing the list of foreign keys
     * @param {any} filter      function of elements to retrieve from the table
     * @param {any} buildingKey function of elements to retrieve from the key
     */
    declareForeignKeysCSV( property, table, filter, buildingKey ) {
        this._csv_foreignKeys[property] = { table: table, list: List.ListRecord.CACHE_LIST( table ), keys: {}, computed: false, filter: filter, buildingKey: buildingKey };
    }

    /**
     * Load key from Foreign keys to match value from CSV to Id
     * @param {CSV} csv CSV file to import
     */
    loadForeignKeysCSV( csv ) {
        function handleRead( foreignKey ) {
            return function ( record ) {
                if ( foreignKey.filter && !foreignKey.filter( record ) )
                    return;

                let key = foreignKey.buildingKey ? foreignKey.buildingKey( foreignKey.list, record ) : foreignKey.list.getKey( record );
                if ( !String.isEmptyOrWhiteSpaces( key ) )
                    foreignKey.keys[key] = foreignKey.list.getId( record );
            };
        }

        for ( let property in this._csv_foreignKeys ) {
            let foreignKey = this._csv_foreignKeys[property];
            if ( foreignKey.computed )
                continue;

            Logger.Instance.info( "List", "Reading values for the property '" + property + "' of the CSV file '" + csv.Name + "' ..." );

            foreignKey.list.each( handleRead( foreignKey ) );
            foreignKey.computed = true;
        }
    }

    /**
     * Retrieve the Id of the item matching within the foreign key
     * @param {string} property name of the property identifying the expected value
     * @param {string} value    value to convert
     * @param {any}    errors   container of errors after cancelling
     * @returns {number} Id of the item matching within the key or null
     */
    getForeignKeysIdCSV( property, value, errors ) {
        let foreignKey = this._csv_foreignKeys[property];
        if ( foreignKey === null || foreignKey === undefined ) {
            errors.addField( property, "ERR_CSV_MISSINGREFERENCE", [value, property] );
            return null;
        }

        let id = foreignKey.keys[value];
        if ( id === null || id === undefined ) {
            if ( String.isEmptyOrWhiteSpaces( value ) )
                return null;

            errors.addField( property, "ERR_CSV_MISSINGREFERENCE", [value, property] );
            return null;
        }

        return id;
    }

    /**
     * Notify the beginning of importing data from a file
     * @param {CSV} csv CSV file to import
     * @param {Errors} errors update the errors component if an abnormal situation is identified
     * @returns {boolean} true if the importing data from a file can start
     */
    startCSV( csv, errors ) {
        function handleRead( list, listKeys, errors ) {
            return function ( record ) {
                let key = list.getKey( record );

                // check if the records are differents ...

                if ( list._csv_recordIdsByKey[key] !== undefined ) {
                    if ( listKeys[key] === undefined ) {
                        listKeys[key] = key;
                        errors.addGlobal( "ERR_CSV_KEYDOUBLE_DB", key );
                    }
                } else {
                    let id = list.getId( record );
                    list._csv_recordIdsByKey[key] = id;
                    list._csv_recordsToDelete[key] = id;
                    list._csv_rowToDelete++;
                }
            };
        }

        if ( ! super.startCSV( csv, errors ) )
            return false;

        // Initialize the list of keys matching within Id

        this._csv_foreignKeys = {};

        // Read all records and map by id

        let errorsInReading = new Errors();

        this._csv_rowToDelete = 0;
        this._csv_recordKey = {};
        this._csv_recordIdsByKey = {};
        this._csv_recordsToDelete = {};
        if ( this._csv_list === null ) {
            this.each( handleRead( this, {}, errorsInReading ) );
        } else {
            let fn = handleRead( this, {}, errorsInReading );

            for ( let item of Array.toIterable( this._csv_list ) )
                fn( item );
        }

        if ( errorsInReading.HasError ) {
            errors.addErrors( errorsInReading );
            return false;
        }

        this._csv_transaction_opened = false;

        return true;
    }

    /**
     * Notify the beginning of preloading the content of files
     * @param {CSV} csv CSV file to import
     * @param {Errors} errors update the errors component if an abnormal situation is identified
     * @returns {boolean} true if the preloading data must be done, or false to skip this step
     */
    startPreloadingCSV( csv, errors ) {
        let result = super.startPreloadingCSV( csv, errors );
        this.loadForeignKeysCSV( csv );
        return result;
    }

    /**
     * Notify the beginning of checking the content of the file
     * @param {CSV} csv CSV file to import
     * @param {Errors} errors update the errors component if an abnormal situation is identified
     * @returns {boolean} true if the checking data must be done, or false to skip this step
     */
    startCheckingCSV( csv, errors ) {
        let result = super.startCheckingCSV( csv, errors );
        this.loadForeignKeysCSV( csv );
        return result;
    }

    /**
     * Retrieve the number of rows to delete concerned by the importing
     * @param {any} csv CSV file to import
     * @returns {integer} the number of rows into the table before importing data
     */
    getRowToDeleteCSV( csv ) {
        return this._csv_rowToDelete;
    }

    /**
     * Set in a record the value from 
     * @param {CSV} csv CSV file to import
     * @param {any} item record to complete within information from columns
     * @param {Array} columnsByOrder array of values by position into the CSV file
     * @param {Array} columnsByName map of values by the header name (first line of the CSV file)
     * @param {Errors} errors update the errors component if an abnormal situation is identified
     * @returns {any} record updated or null if the record must be ignored
     */
    getMappingRecordFromCSV( csv, item, columnsByOrder, columnsByName, errors ) {
        function getRandomKey( attribute ) {
            let newKey = String.random( attribute.maxLength );
            while ( attribute.tmpKeys[newKey] !== undefined )
                newKey = String.random( attribute.maxLength );
            attribute.tmpKeys[newKey] = true;
            return newKey;
        }

        // For checking data into the record, don't change the secondary key ...

        if ( this._csv_cache === null )
            return item;

        // For each mainKey, update other keys

        for ( let mainKey in this._csv_cache ) {
            let cache = this._csv_cache[mainKey];

            let key1 = this.getAttributText( item, mainKey );
            key1 = String.isEmptyOrWhiteSpaces( key1 ) ? "" : key1;

            // Other keys already computed ?

            let values = cache.values[key1];

            if ( values !== undefined && values._lastValues !== undefined ) {
                for ( let attributeOtherKey in cache.attributes )
                    item[attributeOtherKey] = values._lastValues[attributeOtherKey];
                continue;
            }

            // Update keys and store the result

            let lastValues = {};

            for ( let attributeOtherKey in cache.attributes ) {
                let key2 = this.getAttributText( item, attributeOtherKey );
                key2 = String.isEmptyOrWhiteSpaces( key2 ) ? "" : key2;

                let existingOtherKey = cache.attributes[attributeOtherKey].values[key2];

                // values (key1 existing ?) - existingOtherKey (key2 existing ?)

                if ( values !== undefined ) {
                    if ( existingOtherKey !== true ) {
                        // key2 doesn't exist ... you can create it directly
                        delete cache.values[key1][attributeOtherKey];
                    } else if ( values[attributeOtherKey][0] === key2 ) {
                        // key2 has the same value as before ... don't change anything
                        delete cache.values[key1][attributeOtherKey];
                    } else {
                        // key2 exists ... you have to go through a temporary key and you can consider than the old value is free
                        let valueAttr = values[attributeOtherKey];
                        valueAttr[1] = key2;
                        valueAttr[2] = getRandomKey( cache.attributes[attributeOtherKey] );
                        item[attributeOtherKey] = valueAttr[2];
                        delete cache.attributes[attributeOtherKey].values[valueAttr[0]];
                    }
                } else {
                    if ( existingOtherKey !== true ) {
                        // key2 doesn't exist ... you can create it directly
                    } else {
                        // key1 doesn't exist, key2 exists ... you have to go through a temporary key for creating a record

                        if ( cache.values[key1] === undefined )
                            cache.values[key1] = {};

                        cache.values[key1][attributeOtherKey] = [null, key2, getRandomKey( cache.attributes[attributeOtherKey] )];
                        item[attributeOtherKey] = cache.values[key1][attributeOtherKey][2];
                    }
                }

                lastValues[attributeOtherKey] = item[attributeOtherKey];
            }

            // Store the keys computed

            if ( values === null || cache.values[key1] === undefined )
                cache.values[key1] = {};

            cache.values[key1]._lastValues = lastValues;
        }

        return item;
    }

    /**
     * Check the content of the row (data, type, structure and references)
     * @param {CSV} csv CSV file to import
     * @param {Array} columnsByOrder array of values by position into the CSV file
     * @param {Array} columnsByName map of values by the header name (first line of the CSV file)
     * @param {Errors} errors update the errors component if an abnormal situation is identified
     * @returns {boolean} true if the checking data must be continued or false, to stop
     */
    checkRecordFromCSV( csv, columnsByOrder, columnsByName, errors ) {
        if ( ! super.checkRecordFromCSV( csv, columnsByOrder, columnsByName, errors ) )
            return false;

        // Check the record after migrating data

        let newRecord = this.getMappingRecordFromCSV( csv, this.NewItem, columnsByOrder, columnsByName, errors );
        if ( newRecord === null )
            return true;

        // check properties

        this.checkProperties( newRecord, errors );

        // check if the key is in double into the CSV file

        let key = this.getKey( newRecord );
        let existingKey = this._csv_recordKey[key];
        if ( existingKey !== null && existingKey !== undefined ) {
            // the key of the record is duplicated
            errors.addGlobal( "ERR_CSV_KEYDOUBLE_FILE", key );
        } else {
            this._csv_recordKey[key] = true;
        }

        // check the validity of the record

        this.checkItem( newRecord, errors, false );

        return true;
    }

    /**
     * Notify the ending of checking the content of the file
     * @param {CSV} csv CSV file to import
     * @param {Errors} errors update the errors component if an abnormal situation is identified
     * @returns {boolean} true if the checking data is correct, or stop reading CSV file
     */
    endCheckingCSV( csv, errors ) {
        if ( this._csv_transaction_opened ) {
            this._csv_transaction_opened = false;
            this.endTransactionCSV( csv );
        }

        return super.endCheckingCSV( csv, errors );
    }

    /**
     * Notify the beginning of importing the content of the file
     * @param {CSV} csv CSV file to import
     * @param {Errors} errors update the errors component if an abnormal situation is identified
     * @returns {boolean} true if the importing data must be done, or false to skip this step
     */
    startImportingCSV( csv, errors ) {
        function handleRead( list ) {
            return function ( record ) {
                for ( let mainKey in list._csv_cache ) {
                    let cache = list._csv_cache[mainKey];

                    let key1 = list.getAttributText( record, mainKey );
                    key1 = String.isEmptyOrWhiteSpaces( key1 ) ? "" : key1;

                    let values = {};
                    cache.values[key1] = values;

                    for ( let attributeOtherKey in cache.attributes ) {
                        let key2 = list.getAttributText( record, attributeOtherKey );
                        key2 = String.isEmptyOrWhiteSpaces( key2 ) ? "" : key2;

                        values[attributeOtherKey] = [key2, null, null];
                        cache.attributes[attributeOtherKey].values[key2] = true;
                    }
                }
            };
        }

        this._csv_cache = {};
        if ( this._csv_keys.length > 0 ) {
            // Build a cache for every keys

            for ( let key of Array.toIterable( this._csv_keys ) ) {
                let mainKey = key[0];
                let otherKeys = key[1];

                let cache = {
                    values: {},
                    attributes: {}
                };

                this._csv_cache[mainKey] = cache;

                for ( let otherKey of Array.toIterable( otherKeys ) ) {
                    let maxLengthKey = DSDatabase.Instance.getColumn( this.Table, otherKey ).StringMaxLength;
                    if ( maxLengthKey > 64 )
                        maxLengthKey = 64;

                    cache.attributes[otherKey] = {
                        maxLength: maxLengthKey,
                        tmpKeys: {},
                        values: {}
                    }
                }
            }

            // Read records and map existing keys

            if ( this._csv_list === null ) {
                this.each( handleRead( this ) );
            } else {
                let fn = handleRead( this );
                for ( let record of Array.toIterable( this._csv_list ) )
                    fn( record );
            }
        }

        this._csv_counter = 0;
        this._csv_counter_add = csv.RowAdded;
        this._csv_counter_update = csv.RowUpdated;
        this._csv_counter_delete = csv.RowDeleted;
        this._csv_counter_postUpdate = null;

        let result = super.startImportingCSV( csv, errors );
        this.loadForeignKeysCSV( csv );
        return result;
    }

    /**
     * Build a record within data ready to add into the content of the row (data, type, structure and references)
     * @param {CSV} csv CSV file to import
     * @param {Array} columnsByOrder array of values by position into the CSV file
     * @param {Array} columnsByName map of values by the header name (first line of the CSV file)
     * @param {Errors} errors update the errors component if an abnormal situation is identified
     * @returns {oldItem, newItem} record to add, update or delete (on depends on values into the element) - null if the line must be ignored
     */
    getRecordFromCSV( csv, columnsByOrder, columnsByName, errors ) {
        // If the parent class retrieves records, return them

        let result = super.getRecordFromCSV( csv, columnsByOrder, columnsByName, errors );
        if ( result !== null )
            return result;

        // Build a record within minimal information

        let newRecord = this.getMappingRecordFromCSV( csv, this.NewItem, columnsByOrder, columnsByName, errors );
        if ( newRecord === null )
            return null;

        this.checkProperties( newRecord, errors );

        // Look for an existing id record by its key (different than the id)

        let key = this.getKey( newRecord );
        let idExisting = this._csv_recordIdsByKey[key];
        if ( idExisting === null || idExisting === undefined ) {
            // it's a new record ... it doesn't exist

            return { oldItem: null, newItem: newRecord };
        }

        // mark this record to not delete

        if ( this._csv_recordsToDelete[key] !== undefined ) {
            delete this._csv_recordsToDelete[key];
            this._csv_rowToDelete--;
        }

        // update an existing record

        let oldRecord = null;
        if (this._csv_list === null) {
            oldRecord = this.getItem(idExisting, true);
        } else {
            oldRecord = this._csv_list[idExisting];
        }
        newRecord = this.getMappingRecordFromCSV( csv, DSRecord.Clone( oldRecord, false ), columnsByOrder, columnsByName, errors );
        if ( newRecord === null )
            return null;

        this.checkProperties( newRecord, errors );

        return { oldItem: oldRecord, newItem: newRecord };
    }

    /**
     * Start a transaction of update
     * @param {CSV} csv CSV file to import
     */
    beginTransactionCSV( csv ) {
        let label = undefined;
        let notify = false;

        // First line updated ...

        if ( this._csv_counter === 0 )
            label = Helper.Label( this.Table.toUpperCase() + "_IMPORTING_TOAST", [this._csv_counter_add, this._csv_counter_update, csv.WillDeleteRows ? this._csv_counter_delete : 0] );

        // Last line updated ...

        let total = this._csv_counter_add + this._csv_counter_update + ( csv.WillDeleteRows ? this._csv_counter_delete : 0 );
        this._csv_counter++;

        if ( ( this._csv_counter >= total || ( this._csv_counter % this._csv_lotsize ) === 0 ) && this._csv_transaction_opened ) {
            this._csv_transaction_opened = false;
            this.endTransactionCSV( csv );
        }

        if ( this._csv_counter >= total ) {
            if ( this._csv_counter_postUpdate === null )
                this._csv_counter_postUpdate = this.getItemsToPostUpdateCSV( csv, new Errors() ).length;

            if ( this._csv_counter === total + this._csv_counter_postUpdate ) {
                label = Helper.Label( this.Table.toUpperCase() + "_IMPORTED_TOAST", [this._csv_counter_add, this._csv_counter_update, csv.WillDeleteRows ? this._csv_counter_delete : 0] );
                notify = true;
            }
        }

        if ( !this._csv_transaction_opened ) {
            this.beginTransaction( label, notify );
            this._csv_transaction_opened = true;
        }
    }

    /**
     * Close a transaction of update
     * @param {CSV} csv CSV file to import
     */
    endTransactionCSV( csv ) {
        if ( this._csv_transaction_opened )
            return;

        this.endTransaction();
    }

    /**
     * Add a new item into the database and return the item created (included compositions of the item) - call done by CSV
     * @param {CSV} csv CSV file to import
     * @param {any} newItem item to add
     * @param {any} errors container of errors after adding
     * @param {any} force  true if the first step (warning is validated by the user)
     * @param {any} checkItem true if the item must be checked before adding (by default: true)
     * @returns {any} new item added into the list or errors
     */
    addItemCSV( csv, newItem, errors, force, checkItem ) {
        this.beginTransactionCSV( csv );
        let item = this.addItem( newItem, errors, force, checkItem );
        this.endTransactionCSV( csv );
        return item;
    }

    /**
     * Update an item into the database
     * @param {CSV} csv CSV file to import
     * @param {any} id id of the record updated
     * @param {any} oldItem item to update
     * @param {any} newItem item updated
     * @param {any} errors container of errors after updating
     * @param {any} force  true if the first step (warning is validated by the user)
     * @param {any} checkItem true if the item must be checked before adding (by default: true)
     * @returns {any} item updated into the list or errors
     */
    updateItemCSV( csv, id, oldItem, newItem, errors, force, checkItem ) {
        this.beginTransactionCSV( csv );
        let item = this.updateItem( id, oldItem, newItem, errors, force, checkItem );
        this.endTransactionCSV( csv );
        return item;
    }

    /**
     * Remove an item into the database
     * @param {CSV} csv CSV file to import
     * @param {any} id id of the record removed
     * @param {any} oldItem item to remove
     * @param {any} errors container of errors after updating
     * @param {any} checkItem true if the item must be checked before adding (by default: true)
     * @returns {any} item deleted or errors
     */
    deleteItemCSV( csv, id, oldItem, errors, checkItem ) {
        this.beginTransactionCSV( csv );
        let item = this.deleteItem( id, oldItem, errors, checkItem );
        this.endTransactionCSV( csv );
        return item;
    }

    /**
     * Get the list of records to delete into the table after updating list
     * @param {CSV} csv CSV file to import
     * @param {any} errors container of errors after getting value
     * @returns {array} list of records to delete
     */
    getItemsToDeleteCSV( csv, errors ) {
        let items = [];

        // Retrieve the list of items to delete

        for ( let id of Array.toIterable( this._csv_recordsToDelete ) ) {
            let record = this.getItem( id, true );
            if ( record !== null )
                items.push( record );
        }

        return items;
    }

    /**
     * Get the list of records to update at the end of updating table (change the key values)
     * @param {CSV} csv CSV file to import
     * @param {any} errors container of errors after getting value
     * @returns {array} list of records to update [0: old, 1: new]
     */
    getItemsToPostUpdateCSV( csv, errors ) {
        function handleUpdate( list, items ) {
            return function ( record ) {
                let newRecord = null;

                // update the record if a temporary key was set by the target key

                for ( let mainKey in list._csv_cache ) {
                    let cache = list._csv_cache[mainKey];

                    let key1 = list.getAttributText( record, mainKey );
                    key1 = String.isEmptyOrWhiteSpaces( key1 ) ? "" : key1;

                    let values = cache.values[key1];

                    if ( values === undefined )
                        continue;

                    for ( let attributeOtherKey in cache.attributes ) {
                        if ( values[attributeOtherKey] === undefined || values[attributeOtherKey][2] === null )
                            continue;

                        // Replace temporary key by the target key

                        if ( newRecord === null )
                            newRecord = DSRecord.Clone( record );

                        newRecord[attributeOtherKey] = values[attributeOtherKey][1];
                    }

                    delete cache.values[key1];
                }

                // update the new record

                if ( newRecord === null )
                    return;

                items.push( [record, newRecord] );
            };
        }

        let items = [];

        if ( this._csv_cache === null )
            return items;

        if ( this._csv_list === null ) {
            this.each( handleUpdate( this, items ) );
        } else {
            let fn = handleUpdate( this, items );
            for ( let record of Array.toIterable( this._csv_list ) )
                fn( record );
        }

        return items;
    }

    /**
     * Notify the ending of importing the content of the file
     * @param {CSV} csv CSV file to import
     * @param {Errors} errors update the errors component if an abnormal situation is identified
     * @returns {boolean} true if the importing data is correct, or stop reading CSV file
     */
    endImportingCSV( csv, errors ) {
        if ( this._csv_transaction_opened ) {
            this._csv_transaction_opened = false;
            this.endTransactionCSV( csv );
        }

        // clean up cache

        this._csv_cache = null;

        // end the processus

        return super.endImportingCSV( csv, errors );
    }

    /**
     * Notify the ending of importing data from a file
     * @param {CSV} csv CSV file to import
     * @param {Errors} errors update the errors component if an abnormal situation is identified
     * @returns {boolean} details of errors identified on ending the CSV file
     */
    endCSV( csv, errors ) {
        // Close lot size

        if ( this._csv_transaction_opened ) {
            this._csv_transaction_opened = false;
            this.endTransactionCSV( csv );
        }

        // clean up cache

        this._csv_recordKey = {};
        this._csv_recordIdsByKey = {};
        this._csv_recordsToDelete = {};
        this._csv_rowToDelete = 0;

        this._csv_foreignKeys = {};

        // end the csv file loading

        if ( ! super.endCSV( csv, errors ) )
            return false;

        return true;
    }

    /**
     * Constructor
     * @param {any} table      table name
     * @param {any} allRecords true : take into account the Enable property
     */
    constructor( table, allRecords ) {
        super();

        this._table = table;
        this._allRecords = allRecords === null || allRecords === undefined || allRecords === true ? true : false; // show records even if it's disabled

        let sequence = DSDatabase.Instance.getSequence(table);

        this._sequenceProperty = sequence === null ? null : sequence.Property;
        this._sequenceKey = sequence === null ? null : sequence.Key;
        this._sequenceLength = sequence === null ? null : sequence.Length;

        this._subLists = null;
        this._foreignKeys = null;

        this._csv_list = null; // If it's not null, Replace each() function from the current list
        this._csv_mapping = null;
        this._csv_recordKey = {};
        this._csv_recordIdsByKey = {};
        this._csv_recordsToDelete = {};
        this._csv_rowToDelete = 0;

        this._csv_foreignKeys = {};

        // multiple keys in the same file

        this._csv_cache = null;
        this._csv_keys = [];

        this._csv_counter = null;
        this._csv_counter_add = null;
        this._csv_counter_update = null;
        this._csv_counter_delete = null;
        this._csv_counter_postUpdate = null;

        this._csv_lotsize = DSDatabase.Instance.Tables[table] === undefined || DSDatabase.Instance.Tables[table] === null ? 1 : DSDatabase.Instance.Tables[table].LotSize;
        this._csv_transaction_opened = false;
    }
};
