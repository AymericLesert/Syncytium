/// <reference path="../../_references.js" />

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
 * Manage the differential synchronization database from the client side
 * This class describes the structure of a table
 */
class DSTable extends LoggerBaseObject {
    /**
     * Check if 2 properties have the same value
     * @param {any} value1 first value
     * @param {any} value2 second value
     * @eturns {boolean} true if the values are equals
     */
    static IsEqualProperties ( value1, value2 ) {
        if ( value1 === undefined || String.isEmptyOrWhiteSpaces( value1 ) )
            value1 = null;

        if ( value2 === undefined || String.isEmptyOrWhiteSpaces( value2 ) )
            value2 = null;

        if ( value1 === null && value2 === null )
            return true;

        if ( value1 === null || value2 === null )
            return false;

        if ( typeof value1 === "string" || typeof value1 === "number" || typeof value1 === "boolean" )
            return ( value1 === value2 );

        if ( value1 instanceof Date && value2 instanceof Date )
            return ( value1.toString() === value2.toString() );

        if ( value1 instanceof Date || value2 instanceof Date )
            return false;

        if ( value1 instanceof moment && value2 instanceof moment )
            return ( value1.toString() === value2.toString() );

        if ( value1 instanceof moment || value2 instanceof moment )
            return false;

        return false;
    };

    /**
     * Get the next sequence Id
     */
    get NextSequenceId () {
        return this._lastSequenceId++;
    }

    /**
     * Create an instance of the record strored into the table
     */
    get NewRow () {
        var newRecord = {};

        for ( var i = 0; i < this._columns.length; i++ )
            newRecord[this._columns[i].Property] = this._columns[i].DefaultValue;

        newRecord._table = this._name;

        return newRecord;
    }

    /**
     * Update the list of values from the unique constraint (to do after loading all tables)
     */
    updateUniqueValues () {
        var column = null;

        if ( this._columnUnique.length === 0 )
            return;

        for ( var i = 0; i < this._records.length; i++ ) {
            if ( this._records[i][this._indexDeleted] )
                continue;

            var clientId = this._identities[i][1];
            var currentRecord = this.getRow( null, this._records[i], this._identities[i] );

            for ( column in this._columnUnique )
                this._columnUnique[column].addValue( currentRecord );
        }

        // log the list of differents values for the unique column

        if ( this.IsVerbose )
            for ( column in this._columnUnique )
                this.verbose( "List of values for the column '" + this._columns[column].Property + "' = " + this._columnUnique[column].toListValues() );
    }

    /**
     * Update the list of foreign keys ... to store link towards the table attached to the link
     * @param {boolean} force true to initialize again the list of foreign keys
     */
    updateForeignKeys ( force ) {
        if ( this._columnForeign !== null && force !== true )
            return;

        this.info( "Declaring foreign key of the table '" + this._name + "' ..." );

        // build the list of foreign keys (done on setTable)

        try {
            this._columnForeign = [];

            var error = false;

            for ( var i = 0; i < this._columns.length; i++ ) {
                var foreignKeyTable = this._columns[i].ForeignKey;

                if ( foreignKeyTable === null )
                    continue;

                this.debug( "The column '" + this._columns[i].Property + "' is a foreign key on the table '" + foreignKeyTable.Table + "'" );

                if ( this._database.Tables[foreignKeyTable.Table] === null ||
                    this._database.Tables[foreignKeyTable.Table] === undefined ) {
                    this.error( "The table '" + foreignKeyTable.Table + "' doesn't exist in the schema" );
                    error = false;
                } else {
                    this._columnForeign.push( { index: i, table: this._database.Tables[foreignKeyTable.Table] } );
                }
            }

            if ( error ) {
                this.error( "Some errors occurs ..." );
                this._columnForeign = undefined;
                return;
            }

            this.info( this._columnForeign.length + " foreign keys are declared" );
        } catch ( e ) {
            this.exception( "An exception occurs on declaring foreign key of the table '" + this._name + "'", e );
            this._columnForeign = undefined;
        }
    }

    /**
     * @returns {boolean} true if the content of the table is loaded
     */
    get Loaded() {
        return this._loaded;
    }

    /**
     * Compare if 2 tables have the same structure (this and table)
     * Same columns and same types (constraints can be different)
     * @param {any} table table to check
     * @returns {boolean} true if the 2 tables are compatibles
     */
    hasSameStructure ( table ) {
        if ( this._columns.length !== table._columns.length )
            return false;

        var currentColumns = {};
        var tableColumns = {};

        var i = null;

        for ( i = 0; i < this._columns.length; i++ ) {
            currentColumns[this._columns[i].Property] = this._columns[i];
            tableColumns[table._columns[i].Property] = table._columns[i];
        }

        var column = null;
        for ( column in currentColumns ) {
            if ( tableColumns[column] === null || tableColumns[column] === undefined )
                return false;
        }

        for ( column in tableColumns ) {
            if ( currentColumns[column] === null || currentColumns[column] === undefined )
                return false;
        }

        for ( column in currentColumns ) {
            if ( !currentColumns[column].hasSameStructure( tableColumns[column] ) )
                return false;
        }

        return true;
    }

    /**
     * Change the reference on the database
     * @param {any} database new reference of the database
     */
    setDatabase( database ) {
        this._database = database;
    }

    /**
     * Set records into the current table
     * @param {any} records        list of records to load into the table
     * @param {any} lastSequenceId current last sequence id from the server
     * @returns {boolean} data are loaded and stored into the table
     */
    setTable ( records, lastSequenceId ) {
        this.info( "Loading table ..." );

        // check if the column index of the key is defined

        if ( this._indexKey === undefined ||
            this._indexTick === undefined ||
            this._indexDeleted === undefined ||
            this._columnForeign === undefined ) {
            this.error( "The initialization has failed!" );
            return false;
        }

        // initialize the table structure

        this._lastSequenceId = 1;
        this._records = [];
        this._identities = [];
        this._identitiesByServerId = [];
        this._identitiesByClientId = [];

        try {
            // set all indexes and sort them on different orders

            var column = null;
            var i = 0;

            var error = false;
            var errors = new Errors();

            for ( var rowIndex = 0; rowIndex < records.length; rowIndex++ ) {
                this._records[rowIndex] = [];

                // update the format of columns into the record

                for ( i = 0; i < this._columns.length; i++ ) {
                    errors.clear();

                    var newValue = this._columns[i].convertFromJSON( records[rowIndex][i], errors );

                    if ( errors.HasError ) {
                        this.error( "[" + rowIndex + "]: Conversion of the value '" + records[rowIndex][i].toString() + "' of the column '" + this._columns[i].Property + "' in the record '" + String.JSONStringify( records[rowIndex] ) + "' has failed" );
                        error = true;
                    }

                    this._records[rowIndex][i] = newValue;
                }
                this._records[rowIndex][this._indexTick] = records[rowIndex][this._indexTick];
                this._records[rowIndex][this._indexDeleted] = records[rowIndex][this._indexDeleted];

                if ( records[this._indexReplayClientId] !== null && this._indexReplayClientId !== undefined )
                    this._replayServerIds[records[this._indexReplayClientId]] = this._records[rowIndex][this._indexKey];

                // Set a new identity object

                var identity = [];
                identity[0] = rowIndex;
                identity[1] = this.NextSequenceId;

                i = 2;
                for ( var j = 0; j < this._columnForeign.length; i++ , j++ )
                    this._columnForeign[j].table.getIdentity( identity, i, this._records[rowIndex][this._columnForeign[j].index] );

                if ( this.IsDebug )
                    this.debug( "[" + rowIndex + "]: Row = " + String.JSONStringify( this._records[rowIndex] ) + ", Identity = " + String.JSONStringify( identity ) );

                // Update all other table waiting the id

                var serverId = this._records[rowIndex][this._indexKey];
                var clientId = identity[1];

                this.updateIdentity( serverId, clientId );

                // Sort indexes on different orders

                this._identities[rowIndex] = identity;
                this._identitiesByServerId[serverId] = identity;
                this._identitiesByClientId[clientId] = identity;
            }

            // update the last sequence id

            if ( lastSequenceId && lastSequenceId > 0 && this._lastSequenceId < lastSequenceId + 1 )
                this._lastSequenceId = lastSequenceId + 1;
            this.info( "The sequence Id starts at " + this._lastSequenceId );

            if ( error ) {
                this.error( "Errors occurs on loading table ..." );
                return false;
            }

            // data loaded

            this._loaded = true;
            this.info( "Table loaded with " + this._records.length + " records" );

            this._database.eventOnLoad( this._name );
            return true;
        } catch ( e ) {
            this.exception( "An exception occurs on loading the table '" + this._name + "'", e );
            this._loaded = false;
            return false;
        }
    }

    /**
     * Retrieve the client Id for the given Id into a foreign key
     * If the serverId is not yet know, the identity waits for the new value
     * @param {any} identity    identity structure
     * @param {any} columnIndex index of the column into the identity
     * @param {any} serverId    id of the record from server
     */
    getIdentity ( identity, columnIndex, serverId ) {
        if ( serverId === null || serverId === undefined ) {
            identity[columnIndex] = null;
            return;
        }

        var id = this._identitiesByServerId[serverId];

        // the id is already set ...

        if ( id !== undefined ) {
            identity[columnIndex] = id[1];
            return;
        }

        var queueElement = { identity: identity, index: columnIndex };
        identity[columnIndex] = null;

        if ( this.IsVerbose )
            this.verbose( "The identity '" + serverId + "' is not yet known by the table ... queueing (" + String.JSONStringify( queueElement ) + ")!" );

        // the id is not yet known ... get in touch and update it later

        if ( this._notYetKnown[serverId] === undefined )
            this._notYetKnown[serverId] = [];
        this._notYetKnown[serverId].push( queueElement );
    }

    /**
     * Update client Id of the record identify by its serverId
     * @param {any} serverId server id to associate
     * @param {any} clientId client id of the association
     */
    updateIdentity ( serverId, clientId ) {
        if ( this._notYetKnown[serverId] === undefined )
            return;

        if ( this.IsVerbose )
            this.verbose( this._notYetKnown[serverId].length + " identities of the serverId (" + serverId + ") from foreign key were waiting for the clientId (" + clientId + ")" );

        for ( var i = 0; i < this._notYetKnown[serverId].length; i++ ) {
            var currentIdentity = this._notYetKnown[serverId][i];

            if ( currentIdentity === null || currentIdentity === undefined )
                continue;

            if ( this.IsVerbose )
                this.verbose( String.JSONStringify( currentIdentity.identity ) + " => Ids[" + currentIdentity.index + "] =" + clientId );

            currentIdentity.identity[currentIdentity.index] = clientId;
        }

        delete this._notYetKnown[serverId];
    }

    /**
     * Replace the serverId correspnding to the clientId by server
     * @param {any} table    table name
     * @param {any} clientId client id to associate
     * @param {any} serverId server id of the association
     */
    updateServerId ( table, clientId, serverId ) {
        var first = true;

        for ( var i = 0; i < this._columnForeign.length; i++ ) {
            if ( this._columnForeign[i].table.Name !== table )
                continue;

            if ( first ) {
                this.info( "Updating id refering the foreign key ('" + table + "', [" + clientId + "]) with the serverId [" + serverId + "] ..." );
                first = false;
            }

            var count = 0;
            for ( var j = 0; j < this._identities.length; j++ ) {
                if ( this._identities[j][i + 2] !== clientId )
                    continue;

                this._records[j][this._columnForeign[i].index] = serverId;
                count++;
            }

            this.debug( count + " Ids updated" );
        }
    }

    /**
     * Update the table having a foreign key towards the oldClientId and replace it by newClientId
     * This situation is possible when the acknowledge arrives after the creation of a new record (after a disconnection period)
     * @param {any} table        table name of the foreign key
     * @param {any} oldClientId  client identity of the record to replace
     * @param {any} newClientId  new client identity of the record
     */
    updateClientId ( table, oldClientId, newClientId ) {
        var first = true;

        for ( var i = 0; i < this._columnForeign.length; i++ ) {
            if ( this._columnForeign[i].table.Name !== table )
                continue;

            if ( first ) {
                this.info( "Updating id refering the foreign key ('" + table + "', [" + oldClientId + "]) with the clientId [" + newClientId + "] ..." );
                first = false;
            }

            var count = 0;
            for ( var j = 0; j < this._identities.length; j++ ) {
                if ( this._identities[j][i + 2] !== oldClientId )
                    continue;

                var oldRecord = this.getRow( j );

                // update the row

                this._identities[j][i + 2] = newClientId;
                count++;

                // notify the update

                this._database.eventOnUpdate( this._name, this._identities[j][1], oldRecord );
            }

            this.debug( count + " Ids updated" );
        }
    }

    /**
     * Retrieve a record from a table (private method)
     * @param {any} rowIndex index of the row
     * @param {any} row      if defined, replace the row defined by its index
     * @param {any} identity if defined, identity of the row
     * @returns {DSRecord} record corresponding to the row
     */
    getRow ( rowIndex, row, identity ) {
        if ( rowIndex !== null && rowIndex !== undefined ) {
            row = this._records[rowIndex];
            identity = this._identities[rowIndex];
        }

        // build a record

        var newRecord = {};
        var i = 0;
        for ( i = 0; i < this._columns.length; i++ ) {
            if ( row[i] instanceof moment )
                newRecord[this._columns[i].Property] = moment( row[i] );
            else if ( row[i] instanceof Date )
                newRecord[this._columns[i].Property] = moment( row[i].toISOString(), moment.ISO_8601 );
            else
                newRecord[this._columns[i].Property] = row[i];
        }
        newRecord._tick = row[i++];
        newRecord._deleted = row[i++];
        newRecord._table = this._name;

        // replace Id by the client identity

        if ( identity !== null && identity !== undefined ) {
            i = 0;
            newRecord._rowIndex = identity[i++];
            newRecord[this._columns[this._indexKey].Property] = identity[i++];

            for ( var j = 0; j < this._columnForeign.length; j++ , i++ )
                newRecord[this._columns[this._columnForeign[j].index].Property] = identity[i];
        }

        return newRecord;
    }

    /**
     * Retrieve all existing records of the table from the database
     * @returns {array} list of records containing into the table
     */
    getTable () {
        try {
            var records = [];

            for ( var rowIndex = 0; rowIndex < this._records.length; rowIndex++ ) {
                // select only rows not deleted

                if ( this._records[rowIndex][this._indexDeleted] )
                    continue;

                records.push( this.getRow( rowIndex ) );
            }

            return records;
        } catch ( e ) {
            this.exception( "An exception occurs on reading data from the table '" + this._name + "'", e );
            return [];
        }
    }

    /**
     * Execute a function on each row (not deleted) retrieved by the function getTable
     * @param {any} fnIteration function to call for each rows
     */
    each ( fnIteration ) {
        if ( fnIteration === null || fnIteration === undefined )
            return;

        for ( var rowIndex = 0; rowIndex < this._records.length; rowIndex++ ) {
            // select only rows not deleted

            if ( this._records[rowIndex][this._indexDeleted] )
                continue;

            fnIteration( this.getRow( rowIndex ) );
        }
    }

    /**
     * Retrieve the sequence description
     * @returns {{Property, Key, Length}} sequence description or null
     */
    get Sequence() {
        for (let i = 0; i < this._columns.length; i++) {
            let column = this._columns[i];

            if (column === null || column === undefined )
                continue;

            for (let j = 0; j < column.Formats.length; j++) {
                let format = column.Formats[j];
                if (format === null || format === undefined)
                    continue;

                if (format.Type === "Sequence")
                    return { Property: column.Property, Key: format.Key, Length: format.Length };
            }
        }

        return null;
    }

    /**
     * Retrieve the column
     * @param {any} column column name
     * @returns {any} description of the column or null
     */
    getColumn( column ) {
        // looking for the column

        var i = this._columnsByName[column];
        if ( i === undefined || i === null )
            return null;

        return this._columns[i];
    }

    /**
     * Retrieve the label (for multilingual dictionary) of the column
     * @param {any} column column name
     * @returns {any} multilingual label of the column
     */
    getColumnLabel ( column ) {
        // looking for the column

        var i = this._columnsByName[column];
        if ( i === undefined || i === null )
            return null;

        return this._columns[i].Field;
    }

    /**
     * Retrieve the default value of the column
     * @param {any} column column name
     * @returns {any} default value of the column
     */
    getDefaultValue ( column ) {
        // looking for the column

        var i = this._columnsByName[column];
        if ( i === undefined || i === null )
            return null;

        return this._columns[i].DefaultValue;
    }

    /**
     * Retrieve the history value for a given column
     * @param {any} column column name
     * @param {any} value current value
     * @returns {any} structure {Id, HistoryId} describing the field having a history property
     */
    getHistoryValue( column, value ) {
        // looking for the column

        var i = this._columnsByName[column];
        if ( i === undefined || i === null )
            return null;

        // Check if this column has a history reference or not

        var historyTable = this._database.Tables["History" + this._name];
        if ( historyTable === null || historyTable === undefined )
            return null;

        var historyColumnId = historyTable._columnsByName[column];
        if ( historyColumnId === null || historyColumnId === undefined )
            return null;

        var historyColumn = historyTable._columns[historyColumnId];
        if ( historyColumn === null || historyColumn === undefined )
            return null;

        // Retrieve the table referenced by historyColumn

        var historyForeignKey = historyColumn.ForeignKey;
        if ( historyForeignKey === null || historyForeignKey === undefined )
            return null;

        var historyForeignKeyTable = this._database.Tables[historyForeignKey.Table];
        if ( historyForeignKeyTable === null || historyForeignKeyTable === undefined )
            return null;

        var indexHistoryKey = 0;
        for ( indexHistoryKey = 0; indexHistoryKey < historyForeignKeyTable._columnForeign.length; indexHistoryKey++ ) {
            if ( historyForeignKeyTable._columns[historyForeignKeyTable._columnForeign[indexHistoryKey].index].Property === "HistoryId" )
                break;
        }

        if ( indexHistoryKey >= historyForeignKeyTable._columnForeign.length )
            return null;
        indexHistoryKey += 2;

        // Retrieve the max Id from the table referenced having HistoryId = value

        var historyValue = -1;
        for ( var id = historyForeignKeyTable._identitiesByClientId.length - 1; id >= 0; id-- ) {
            let identity = historyForeignKeyTable._identitiesByClientId[id];

            if ( identity === null || identity === undefined )
                continue;

            if ( identity[0] === null || identity[0] === undefined || historyForeignKeyTable._records[identity[0]][historyForeignKeyTable._indexDeleted] )
                continue;

            if ( identity[indexHistoryKey] !== value )
                continue;

            historyValue = id;
            break;
        }

        return { Id: value, HistoryId: historyValue };
    }

    /**
     * Retrieve the last history element within the id
     * @param {any} id id of the record to look for (max Id with HistoryId = id)
     * @returns {int} last history id known of the element
     */
    getLastHistoryId( id ) {
        // Looking for columns 

        var historyColumnId = this._columnsByName["HistoryId"];
        if ( historyColumnId === null || historyColumnId === undefined )
            return null;

        var indexHistoryKey = 0;
        for ( indexHistoryKey = 0; indexHistoryKey < this._columnForeign.length; indexHistoryKey++ ) {
            if ( this._columns[this._columnForeign[indexHistoryKey].index].Property === "HistoryId" )
                break;
        }

        if ( indexHistoryKey >= this._columnForeign.length )
            return null;
        indexHistoryKey += 2;

        // Retrieve the max Id from the table referenced having HistoryId = id

        for ( var clientId = this._identitiesByClientId.length - 1; clientId >= 0; clientId-- ) {
            let identity = this._identitiesByClientId[clientId];

            if ( identity === null || identity === undefined )
                continue;

            if ( identity[0] === null || identity[0] === undefined || this._records[identity[0]][this._indexDeleted] )
                continue;

            if ( identity[indexHistoryKey] !== id )
                continue;

            return clientId;
        }

        return null;
    }

    /**
     * Update all history properties on depends on the current value (ex: CopyArticleId = last history for the ArticleId)
     * @param {any} item  item to update
     * @returns {any} item updated
     */
    updateHistoryProperties( record ) {
        if ( this._hasCopy === false )
            return record;

        this._hasCopy = false;

        for ( let i = 0; i < this._columns.length; i++ ) {
            if ( !this._columns[i].Property.startsWith( "Copy" ) )
                continue;

            let copyAttribut = this._columns[i];

            // From CopyArticleId (Reference on HistoryArticle.Id) to ArticleId (Reference on Article.Id)

            let attribute = this._columns[this._columnsByName[copyAttribut.Property.substr( 4 )]];
            if ( attribute === null || attribute === undefined )
                continue;

            let foreignKey = copyAttribut.ForeignKey;
            if ( foreignKey === null || !foreignKey.Table.startsWith( "History" ) )
                continue;

            let foreignKeyAttribut = attribute.ForeignKey;
            if ( foreignKeyAttribut === null || foreignKey.Table.substr( 7 ) !== foreignKeyAttribut.Table )
                continue;

            this._hasCopy = true;

            // set CopyArticleId

            if ( record[attribute.Property] === null || record[attribute.Property] === undefined ) {
                record[attribute.Property] = null;
                record[copyAttribut.Property] = null;
                continue;
            }

            if ( typeof record[attribute.Property] === "string" && !isNaN( parseInt( record[attribute.Property] ) ) )
                record[attribute.Property] = parseInt( record[attribute.Property] );

            let lastHistoryId = this._database.getLastHistoryId( foreignKeyAttribut.Table, record[attribute.Property] );

            if ( record[copyAttribut.Property] === lastHistoryId )
                continue;

            if ( record[copyAttribut.Property] === null || record[copyAttribut.Property] === undefined ) {
                record[copyAttribut.Property] = lastHistoryId;
            } else {
                let historyRecord = this._database.getRowById( foreignKey.Table, record[copyAttribut.Property] );
                if ( historyRecord === null || historyRecord.HistoryId !== record[attribute.Property] )
                    record[copyAttribut.Property] = lastHistoryId;
            }
        }

        return record;
    }

    /**
     * Retrieve the list of enumerables values of a given column
     * @param {any} column column name
     * @param {any} value  defined if you want to have the enumerable value corresponding to the value, undefined if you want to have the list of enumerable values
     * @returns {any} the enumerable value or the list of enumerable values
     */
    getEnumerable ( column, value ) {
        // looking for the column

        var i = this._columnsByName[column];
        if ( i === undefined || i === null )
            return [];

        return this._columns[i].getEnumerable( value );
    }

    /**
     * Retrieve the date and time format of the column
     * @param {any} column column name
     * @returns {string} Date and time format string in Javascript
     */
    getDatetimeFormat ( column ) {
        // looking for the column

        var i = this._columnsByName[column];
        if ( i === undefined || i === null )
            return null;

        return this._columns[i].DatetimeFormat;
    }

    /**
     * Convert value into the type of the column
     * @param {any} column        column name
     * @param {any} value         value to convert
     * @param {any} nullableCheck check if the value is null or not
     * @returns {any} value converted to the type of the column
     */
    convertValue ( column, value, nullableCheck ) {
        if ( nullableCheck === undefined )
            nullableCheck = true;

        // looking for the column

        var i = this._columnsByName[column];
        if ( i === undefined || i === null )
            return value;

        var errors = new Errors();
        var newValue = this._columns[i].convertType( value, errors, nullableCheck );
        return errors.HasError ? value : newValue;
    }

    /**
     * Check properties set into the record on depends on the table definition
     * (no update database, just check and convert)
     * @param {any} record record to check
     * @param {any} errors container of errors in case of abnormal value into the record
     * @returns {DSRecord} record within all properties checked and converted
     */
    checkProperties ( record, errors ) {
        for ( var i = 0; i < this._columns.length; i++ ) {
            var currentColumn = this._columns[i];

            if ( record[currentColumn.Property] === undefined ) {
                this.error( "The property '" + currentColumn.Property + "' is missing into the record" );
                errors.addField( currentColumn.Property, "ERR_FIELD_MISSING", ["{" + currentColumn.Field + "}"] );
                record[currentColumn.Property] = null;
                continue;
            }

            // check property and set the value from the record

            record[currentColumn.Property] = currentColumn.checkProperties( record[currentColumn.Property], errors );
        }

        return record;
    }

    /**
     * Retrieve a record from a table by its client Id
     * @param {any} id    id of the record to retrieve
     * @returns {DSRecord} record corresponding to this id or null
     */
    getRowById ( id ) {
        // Retrieve the identity on depends on its id

        var identity = this._identitiesByClientId[id];

        if ( identity === null || identity === undefined )
            return null;

        return this.getRow( identity[0] );
    }

    /**
     * Retrieve the client Id of an object by its server id
     * @param {any} id identity of the record from the server
     * @returns {int} identity of the record from the client or null
     */
    getClientIdByServerId ( id ) {
        var identity = this._identitiesByServerId[id];

        if ( identity === null || identity === undefined )
            return null;

        return identity[1];
    }

    /**
     * Retrieve the server Id of an object by its client id
     * @param {any} id identity of the record from the client
     * @returns {int} identity of the record from the server or null
     */
    getServerIdByClientId ( id ) {
        var identity = this._identitiesByClientId[id];

        if ( identity === null || identity === undefined )
            return null;

        return this._records[identity[0]][this._indexKey];
    }

    /**
     * Convert a row of the table into a dictionary (key, value) ready to send to the server
     * Private methods
     * @param {any} row row of the table
     * @returns {DSRecord} record to send to the server or null
     */
    getRecordToServer ( row ) {
        var record = {};
        var errors = new Errors();

        for ( var i = 0; i < this._columns.length; i++ )
            record[this._columns[i].Property] = this._columns[i].convertToJSON( row[i], errors );

        if ( errors.HasError )
            this.warn( "Some errors occur during converting the record to a JSON object (" + errors.toString() + ")" );

        return record;
    }

    /**
     * Convert a row identity of the table into a dictionary (key, value) ready to send to the server
     * @param {any} identity identity to convert
     * @returns {any} structure within properties
     */
    getIdentityToServer ( identity ) {
        var record = {};

        record._rowIndex = identity[0];
        record[this._columns[this._indexKey].Property] = identity[1];

        for ( var j = 0, i = 2; j < this._columnForeign.length; j++ , i++ )
            record[this._columns[this._columnForeign[j].index].Property] = identity[i];

        return record;
    }

    // -------------------------------------------------------------
    // UPDATE FROM CLIENT
    // -------------------------------------------------------------

    /**
     * Add a new record into the table with data from Client (record is a dictionary key = value and Ids are defined as clientId)
     * @param {any} record record to add
     * @param {any} errors container of errors in case of abnormal value into the record
     * @returns {DSRecord} record added
     */
    addFromClient ( record, errors ) {
        try {
            this.info( "Adding the record " + String.JSONStringify( record ) + " from the client ..." );

            // 1. Build a new row

            var newRow = [];
            var currentColumn = null;
            var i = null;

            for ( i = 0; i < this._columns.length; i++ ) {
                currentColumn = this._columns[i];

                if ( record[currentColumn.Property] === undefined ) {
                    this.error( "The property '" + currentColumn.Property + "' is missing into the record" );
                    errors.addField( currentColumn.Property, "ERR_FIELD_MISSING", ["{" + currentColumn.Field + "}"] );
                    newRow[i] = null;
                    continue;
                }

                // check property and set the value from the record

                newRow[i] = currentColumn.checkProperties( record[currentColumn.Property], errors );
            }

            // it's a row to add into the table

            if ( newRow[this._indexKey] !== -1 ) {
                this.error( "A new record must have an Id equals to -1" );
                errors.addField( this._columns[this._indexKey].Property, "ERR_FIELD_BADFORMAT", ["{" + this._columns[this._indexKey].Field + "}"] );
            }

            // add _tick and deleted

            newRow[this._indexTick] = null;
            newRow[this._indexDeleted] = false;

            this.debug( "The new row containing clientId is " + String.JSONStringify( newRow ) );

            // 2. Check unique constraint 

            for ( i in this._columnUnique ) {
                var uniqueConstraint = this._columnUnique[i];
                currentColumn = this._columns[i];

                if ( !uniqueConstraint.existValue( this.getRow( null, newRow ) ) )
                    continue;

                this.error( "The value '" + newRow[i] + "' already exists for the column '" + currentColumn.Property + "'" );
                errors.addField( currentColumn.Property, uniqueConstraint.Error, ["{" + currentColumn.Field + "}"] );
            }

            // 3. Check foreign key constraint and build the identity

            var identity = [];

            i = 0;
            identity[i++] = -1; // rowIndex (not yet defined)
            identity[i++] = -1; // Id       (not yet defined too)

            for ( var j = 0; j < this._columnForeign.length; j++ , i++ ) {
                var foreignConstraint = this._columnForeign[j];
                currentColumn = this._columns[foreignConstraint.index];

                var index = newRow[foreignConstraint.index];

                if ( index === null || index === undefined ) {
                    identity[i] = null;
                    continue;
                }

                // Check if the index exists into the table

                var foreignIdentity = foreignConstraint.table._identitiesByClientId[index];
                if ( foreignIdentity === undefined ) {
                    this.error( "The index '" + index + "' (client) of the column '" + currentColumn.Property + "' doesn't exist into the table '" + this._columnForeign[j].table._name + "'" );
                    errors.addField( currentColumn.Property, currentColumn.ForeignKey.Error );
                    identity[i] = null;
                    continue;
                }

                // Update identity and replace the id into the record to add by the server Id

                identity[i] = index;
                newRow[foreignConstraint.index] = foreignConstraint.table._records[foreignIdentity[0]][foreignConstraint.table._indexKey];
            }

            if ( errors.HasError ) {
                this.error( "Unable to add the record due to some errors (" + errors.toString() + ")" );
                return null;
            }

            // update rowIndex and Id

            identity[0] = this._records.length;
            identity[1] = this.NextSequenceId;

            // 4. Add the row into the table

            this._records.push( newRow );
            this._identities.push( identity );
            this._identitiesByClientId[identity[1]] = identity;
            // this._identitiesByServerId is not updated because we haven't yet the id from the server

            // 5. Update unique values

            var currentRecord = this.getRow( null, newRow, identity );
            for ( i in this._columnUnique )
                this._columnUnique[i].addValue( currentRecord );

            this.info( "The row containing serverId " + String.JSONStringify( newRow ) + " and clientId " + String.JSONStringify( identity ) + " is added" );

            // 6. Send this record towards the server

            if ( !this._database.send( this._name, "Create", this.getRecordToServer( newRow ), this.getIdentityToServer( identity ), newRow[this._indexTick] ) ) {
                errors.addGlobal( "ERR_OUT_OF_MEMORY" );
                return null;
            }

            // 7. Notify the creation

            this._database.eventOnCreate( this._name, identity[1] );

            // 8. return the new record

            return currentRecord;
        } catch ( e ) {
            this.exception( "An exception occurs on adding data into the table '" + this._name + "'", e );
            errors.addGlobal( "ERR_EXCEPTION_UNEXPECTED" );
            return null;
        }
    }

    /**
     * Update an existing record into the table with data from Client (oldRecord and newRecord are a dictionary key = value and Ids are defined as clientId)
     * @param {any} oldRecord record to update
     * @param {any} newRecord new record to update
     * @param {any} errors container of errors in case of abnormal value into the record
     * @returns {DSRecord} record updated
     */
    updateFromClient ( oldRecord, newRecord, errors ) {
        try {
            this.info( "Updating the record " + String.JSONStringify( oldRecord ) + " to " + String.JSONStringify( newRecord ) + " from the client ..." );

            // 1. Build rows corresponding to old and new records

            var oldRow = [];
            var newRow = [];
            var currentColumn = null;
            var i = null;

            for ( i = 0; i < this._columns.length; i++ ) {
                currentColumn = this._columns[i];

                if ( oldRecord[currentColumn.Property] === undefined || newRecord[currentColumn.Property] === undefined ) {
                    this.error( "The property '" + currentColumn.Property + "' is missing into the record" );
                    errors.addField( currentColumn.Property, "ERR_FIELD_MISSING", ["{" + currentColumn.Field + "}"] );
                    oldRow[i] = null;
                    newRow[i] = null;
                    continue;
                }

                // check property (only for new record) and set the value from the record

                oldRow[i] = currentColumn.convertType( oldRecord[currentColumn.Property], errors );
                newRow[i] = currentColumn.checkProperties( newRecord[currentColumn.Property], errors );
            }

            // it's a row to update into the table

            if ( oldRow[this._indexKey] < 0 || newRow[this._indexKey] < 0 ) {
                this.error( "An existing record must have an Id greater or equal to 0" );
                errors.addField( this._columns[this._indexKey].Property, "ERR_FIELD_BADFORMAT", ["{" + this._columns[this._indexKey].Field + "}"] );
            }

            if ( !errors.HasError && oldRow[this._indexKey] !== newRow[this._indexKey] ) {
                this.error( "New and old records must represent the same record!" );
                errors.addField( this._columns[this._indexKey].Property, "ERR_FIELD_BADFORMAT", ["{" + this._columns[this._indexKey].Field + "}"] );
            }

            if ( errors.HasError ) {
                this.error( "Unable to update the record due to some errors (" + errors.toString() + ")" );
                return null;
            }

            // add _tick and deleted properties

            oldRow[this._indexTick] = oldRecord._tick !== undefined ? oldRecord._tick : null;
            oldRow[this._indexDeleted] = oldRecord._deleted !== undefined ? oldRecord._deleted : false;

            newRow[this._indexTick] = oldRow[this._indexTick];
            newRow[this._indexDeleted] = oldRow[this._indexDeleted];

            if ( oldRow[this._indexDeleted] || newRow[this._indexDeleted] ) {
                this.error( "Unable to update a record already deleted!" );
                errors.addGlobal( "ERR_RECORD_DELETED" );
            }

            this.debug( "The rows containing clientId are old:" + String.JSONStringify( oldRow ) + " and new:" + String.JSONStringify( newRow ) );

            // 2. Check if the oldRecord matches to the existing record

            var existingRecord = this.getRowById( oldRow[this._indexKey] );
            if ( existingRecord === null || existingRecord === undefined ) {
                this.error( "New and old records must represent an existing record!" );
                errors.addField( this._columns[this._indexKey].Property, "ERR_FIELD_BADFORMAT", ["{" + this._columns[this._indexKey].Field + "}"] );
            } else {
                // if the oldRecord is different than the existing record, it means that data are updated from the server ...
                // so, we have decided to reject the update

                var different = false;

                for ( i = 0; i < this._columns.length; i++ ) {
                    if ( !DSTable.IsEqualProperties( oldRow[i], existingRecord[this._columns[i].Property] ) ) {
                        this.error( "Old (" + String.JSONStringify( oldRow ) + ") and existing (" + String.JSONStringify( existingRecord ) + ") records must represent the same record (" + this._columns[i].Property + " => old: '" + ( oldRow[i] === null ? "null" : oldRow[i].toString() ) + "' - existing: '" + ( existingRecord[this._columns[i].Property] === null ? "null" : existingRecord[this._columns[i].Property].toString() ) + "') !" );
                        errors.addGlobal( "ERR_RECORD_DIFFERENT" );
                        different = true;
                        break;
                    }
                }

                if ( !different &&
                    ( oldRow[this._indexTick] !== existingRecord._tick ||
                    oldRow[this._indexDeleted] !== existingRecord._deleted ) ) {
                    this.error( "Old (" + String.JSONStringify( oldRow ) + ") and existing (" + String.JSONStringify( existingRecord ) + ") records must represent the same record (tick or deleted flag)!" );
                    errors.addGlobal( "ERR_RECORD_DIFFERENT" );
                }
            }

            // 3. Check unique constraint 

            for ( i in this._columnUnique ) {
                var uniqueConstraint = this._columnUnique[i];
                currentColumn = this._columns[i];

                if ( !uniqueConstraint.existValue( this.getRow( null, newRow ) ) )
                    continue;

                this.error( "The value '" + newRow[i] + "' already exists for the column '" + currentColumn.Property + "'" );
                errors.addField( currentColumn.Property, uniqueConstraint.Error, ["{" + currentColumn.Field + "}"] );
            }

            // 4. Check foreign key constraint and build the identity

            var existingIdentity = this._identitiesByClientId[newRow[this._indexKey]];
            var newIdentity = [];

            i = 0;
            newIdentity[i++] = existingIdentity[0]; // _rowIndex
            newIdentity[i++] = existingIdentity[1]; // clientId
            newRow[this._indexKey] = this._records[existingIdentity[0]][this._indexKey]; // serverId

            for ( var j = 0; j < this._columnForeign.length; j++ , i++ ) {
                var foreignConstraint = this._columnForeign[j];
                currentColumn = this._columns[foreignConstraint.index];

                var index = newRow[foreignConstraint.index];

                if ( index === null || index === undefined ) {
                    newIdentity[i] = null;
                    continue;
                }

                // Check if the index exists into the table

                var foreignIdentity = foreignConstraint.table._identitiesByClientId[index];
                if ( foreignIdentity === undefined ) {
                    this.error( "The index '" + index + "' (client) of the column '" + currentColumn.Property + "' doesn't exist into the table '" + this._columnForeign[j].table._name + "'" );
                    errors.addField( currentColumn.Property, currentColumn.ForeignKey.Error );
                    newIdentity[i] = null;
                    continue;
                }

                // Update identity and replace the id into the record to add by the server Id

                newIdentity[i] = index;
                newRow[foreignConstraint.index] = foreignConstraint.table._records[foreignIdentity[0]][foreignConstraint.table._indexKey];
            }

            if ( errors.HasError ) {
                this.error( "Unable to update the record due to some errors (" + errors.toString() + ")" );
                return null;
            }

            // 5. Update the row into the table

            var existingRow = this._records[newIdentity[0]];

            var existingRecordToServer = this.getRecordToServer( existingRow );
            var existingIdentityToServer = this.getIdentityToServer( existingIdentity );

            for ( i = 0; i < existingRow.length; i++ )
                existingRow[i] = newRow[i];

            for ( i = 0; i < existingIdentity.length; i++ )
                existingIdentity[i] = newIdentity[i];

            // 6. Update unique values

            var recordToReturn = this.getRow( null, newRow, existingIdentity );

            for ( i in this._columnUnique ) {
                if ( oldRow[i] === newRow[i] )
                    continue;

                this._columnUnique[i].deleteValue( this.getRow( null, oldRow ) );
                this._columnUnique[i].addValue( recordToReturn );
            }

            this.info( "The row containing serverId " + String.JSONStringify( existingRow ) + " and clientId " + String.JSONStringify( existingIdentity ) + " is updated" );

            // 7. Send this record towards the server

            if (!this._database.send( this._name, "Update",
                                        { New: this.getRecordToServer( newRow ), Old: existingRecordToServer },
                                        { New: this.getIdentityToServer( existingIdentity ), Old: existingIdentityToServer },
                                        newRow[this._indexTick] ) ) {
                errors.addGlobal( "ERR_OUT_OF_MEMORY" );
                return null;
            }


            // 8. Notify the update

            this._database.eventOnUpdate( this._name, existingIdentity[1], existingRecord );

            // 9. return the new record

            return recordToReturn;
        } catch ( e ) {
            this.exception( "An exception occurs on updating data into the table '" + this._name + "'", e );
            errors.addGlobal( "ERR_EXCEPTION_UNEXPECTED" );
            return null;
        }
    }

    /**
     * Create, update or delete a record into the table with data from server (record is a dictionary key = value and Ids are defined as serverId)
     * @param {any} record   record updated by the server
     * @param {any} identity identity of the record updated by the server
     * @returns {DSRecord} record updated
     */
    updateFromServer ( record, identity ) {
        try {
            var errors = new Errors();

            if ( identity !== null && identity !== undefined )
                this.info( "Acknowledging the record " + String.JSONStringify( record ) + " from the server within clientId " + String.JSONStringify( identity ) + " ..." );
            else
                this.info( "Updating the record " + String.JSONStringify( record ) + " from the server ..." );

            // 1. Build row corresponding to the record (do not check anything ...)

            var row = [];
            var currentColumn = null;
            var i = null;
            var j = null;
            var newIdentity = null;

            for ( i = 0; i < this._columns.length; i++ ) {
                currentColumn = this._columns[i];

                if ( record[currentColumn.Property] === undefined || record[currentColumn.Property] === undefined ) {
                    this.warn( "The property '" + currentColumn.Property + "' is missing into the record" );
                    row[i] = null;
                    continue;
                }

                // check property (only for new record) and set the value from the record

                row[i] = currentColumn.convertFromJSON( record[currentColumn.Property], errors );
            }

            // add _tick and deleted properties

            row[this._indexTick] = record._tick !== undefined ? record._tick : null;
            row[this._indexDeleted] = record._deleted !== undefined ? record._deleted : false;

            this.debug( "The row containing serverId is " + String.JSONStringify( row ) );

            // 2. Is it an acknowledge ?

            if ( identity !== null && identity !== undefined ) {
                // it's an acknowledge of a request from myself ... So, link serverId and clientId if this link doesn't exist yet

                var serverIdIdentity = this._identitiesByServerId[row[this._indexKey]];
                var clientIdIdentity = this._identitiesByClientId[identity[this._columns[this._indexKey].Property]];

                if ( ( serverIdIdentity === null || serverIdIdentity === undefined ) &&
                    clientIdIdentity !== null && clientIdIdentity !== undefined ) {
                    // if row of the serverId doesn't exist, it's an acknowledge of a creation

                    this.info( "Acknowledging a creation ..." );

                    this._identitiesByServerId[row[this._indexKey]] = clientIdIdentity;

                    // Update all tables having a foreign key towards this new server Id and set the serverId value on depends on the new value

                    this._database.updateServerId( this._name, clientIdIdentity[1], row[this._indexKey] );

                } else if ( clientIdIdentity === null || clientIdIdentity === undefined ) {
                    // if row of the clientId doesn't exist, it's an abnormal situation !

                    this.warn( "Identity information of the record is missing ... ignore this update!" );

                    return;
                } else if ( serverIdIdentity[0] !== clientIdIdentity[0] ) {
                    // if rowIndex of the serverId and rowIndex of the clientId are different, it means that an update of this record was already done
                    // In that case, the table contains 2 different lines ... So, merge it before updating it !
                    // The serverId row replaces the clientId row

                    this.info( "Acknowledging a creation but the record has been created before this action ... Merging rows [" + serverIdIdentity[0] + "] and [" + clientIdIdentity[0] + "] ..." );
                    this.debug( "Removing referencing to the clientId [" + clientIdIdentity[1] + "] ..." );

                    // Update all tables having a foreign key towards this server Id and replace the previous clientId by the clientId attached to the serverId

                    this._database.updateClientId( this._name, clientIdIdentity[1], serverIdIdentity[1] );

                    // remove all previous unique value from the list of unique values

                    for ( i in this._columnUnique )
                        this._columnUnique[i].deleteValue( this.getRow( null, this._records[clientIdIdentity[0]], clientIdIdentity ) );

                    // delete the clientId row

                    this.debug( "Deleting the row [" + clientIdIdentity[0] + "] ..." );
                    this._records[clientIdIdentity[0]][this._indexDeleted] = true;

                    // update identity and set the value from the last serverId update

                    this.debug( "The clientId [" + identity[this._columns[this._indexKey].Property] + "] is replaced by [" + serverIdIdentity[1] + "]" );
                    identity[this._columns[this._indexKey].Property] = serverIdIdentity[1];

                    // Notify the delete

                    this._database.eventOnDelete( this._name, clientIdIdentity[1] );
                }
            }

            // 3. Create a new record if the serverId is unknown ... In the previous step, we have attached the serverId to the existing clientId

            var existingIdentity = this._identitiesByServerId[row[this._indexKey]];
            if ( existingIdentity === null || existingIdentity === undefined ) {
                // the serverId is unknown ... create a new record like setTable
                this.debug( "This record is a new one ... create it!" );

                // add a new line into the table

                var rowIndex = this._records.length;
                this._records.push( row );

                // add a new identity object

                newIdentity = [];
                newIdentity[0] = rowIndex;
                newIdentity[1] = this.NextSequenceId;

                i = 2;
                for ( j = 0; j < this._columnForeign.length; i++ , j++ )
                    this._columnForeign[j].table.getIdentity( newIdentity, i, this._records[rowIndex][this._columnForeign[j].index] );

                if ( this.IsDebug )
                    this.debug( "[" + rowIndex + "]: Row = " + String.JSONStringify( this._records[rowIndex] ) + ", Identity = " + String.JSONStringify( newIdentity ) );

                // Update all other table waiting the id

                var serverId = this._records[rowIndex][this._indexKey];
                var clientId = newIdentity[1];

                this.updateIdentity( serverId, clientId );

                // Sort indexes on different orders

                this._identities[rowIndex] = newIdentity;
                this._identitiesByServerId[serverId] = newIdentity;
                this._identitiesByClientId[clientId] = newIdentity;

                // update the list of unique values

                if ( !this._records[rowIndex][this._indexDeleted] ) {
                    var currentRecord = this.getRow( null, this._records[rowIndex], this._identities[rowIndex] );
                    for ( let column in this._columnUnique )
                        this._columnUnique[column].addValue( currentRecord );
                }

                // Notify the creation

                if ( !this._records[rowIndex][this._indexDeleted] )
                    this._database.eventOnCreate( this._name, newIdentity[1] );

                return;
            }

            // 4. Update an existing record only and only if the record is newer than the existing row into the table

            var existingRow = this._records[existingIdentity[0]];

            if ( existingRow[this._indexTick] !== null && existingRow[this._indexTick] !== undefined &&
                row[this._indexTick] !== null && row[this._indexTick] !== undefined &&
                existingRow[this._indexTick] >= row[this._indexTick] ) {
                this.info( "The record stored into the table is newer than the record to update, ignore it!" );
                return;
            }

            var existingRecord = this.getRow( existingIdentity[0] );

            // update the identity of the current row

            for ( j = 0, i = 2; j < this._columnForeign.length; j++ , i++ )
                this._columnForeign[j].table.getIdentity( existingIdentity, i, row[this._columnForeign[j].index] );

            // remove values from the list of unique values of the previous record and add the new one

            for ( i in this._columnUnique ) {
                if ( existingRow[i] === row[i] && row[this._indexDeleted] === existingRow[this._indexDeleted] )
                    continue;

                this._columnUnique[i].deleteValue( this.getRow( null, existingRow, existingIdentity ) );
                if ( !row[this._indexDeleted] )
                    this._columnUnique[i].addValue( existingRecord );
            }

            // update the record into the table

            var alreadyDeleted = existingRow[this._indexDeleted];
            for ( i = 0; i < this._columns.length; i++ )
                existingRow[i] = row[i];
            existingRow[this._indexTick] = row[this._indexTick];
            existingRow[this._indexDeleted] = row[this._indexDeleted];

            this.info( "The row containing serverId " + String.JSONStringify( existingRow ) + " and clientId " + String.JSONStringify( existingIdentity ) + " is updated" );

            // Notify the update

            if ( existingRow[this._indexDeleted] === alreadyDeleted ) {
                if ( !alreadyDeleted )
                    this._database.eventOnUpdate( this._name, existingIdentity[1], existingRecord );
            } else if ( alreadyDeleted ) {
                this._database.eventOnCreate( this._name, existingIdentity[1] );
            } else {
                this._database.eventOnDelete( this._name, existingIdentity[1] );
            }
        } catch ( e ) {
            this.exception( "An exception occurs on updating data into the table '" + this._name + "'", e );
        }
    }

    /**
     * Delete a row into the database without sending the update to the server
     * @param {any} id id of the record to delete
     * @returns {DSRecord} record deleted
     */
    deleteRowById ( id ) {
        try {
            this.info( "Deleting the row " + id.toString() + " from the client ..." );

            // Retrieve the identity on depends on its id

            var identity = this._identitiesByClientId[id];
            if ( identity === null || identity === undefined )
                return false;

            // Set the flag "Deleted" in the row

            if ( this._records[identity[0]][this._indexDeleted] )
                return false;

            this._records[identity[0]][this._indexDeleted] = true;

            // Notify the deletion of the record

            this._database.eventOnDelete( this._name, identity[1] );
            return true;
        } catch ( e ) {
            this.exception( "An exception occurs on deleting row " + id.toString() + " into the table '" + this._name + "'", e );
            return false;
        }
    }

    /**
     * Delete an existing record into the table with data from Client (record is a dictionary key = value and Ids are defined as clientId)
     * @param {any} record record to delete
     * @param {any} errors container of errors in case of abnormal value into the record
     * @returns {DSRecord} record deleted
     */
    deleteFromClient ( record, errors ) {
        try {
            this.info( "Deleting the record " + String.JSONStringify( record ) + " from the client ..." );

            // 1. Build rows corresponding to old and new records

            var oldRow = [];
            var currentColumn = null;
            var i = null;

            for ( i = 0; i < this._columns.length; i++ ) {
                currentColumn = this._columns[i];

                if ( record[currentColumn.Property] === undefined ) {
                    this.error( "The property '" + currentColumn.Property + "' is missing into the record" );
                    errors.addField( currentColumn.Property, "ERR_FIELD_MISSING", ["{" + currentColumn.Field + "}"] );
                    oldRow[i] = null;
                    continue;
                }

                // set the value from the record

                oldRow[i] = currentColumn.convertType( record[currentColumn.Property], errors );
            }

            // it's a row to update into the table

            if ( oldRow[this._indexKey] < 0 ) {
                this.error( "An existing record must have an Id greater or equal to 0" );
                errors.addField( this._columns[this._indexKey].Property, "ERR_FIELD_BADFORMAT", ["{" + this._columns[this._indexKey].Field + "}"] );
            }

            // add _tick and deleted properties

            oldRow[this._indexTick] = record._tick !== undefined ? record._tick : null;
            oldRow[this._indexDeleted] = record._deleted !== undefined ? record._deleted : false;

            if ( oldRow[this._indexDeleted] ) {
                this.error( "Unable to delete a record already deleted!" );
                errors.addGlobal( "ERR_RECORD_DELETED" );
            }

            this.debug( "The row containing clientId is " + String.JSONStringify( oldRow ) );

            // 2. Check if the record matches to the existing record

            var existingRecord = this.getRowById( oldRow[this._indexKey] );
            if ( ( existingRecord === null || existingRecord === undefined ) && oldRow[this._indexKey] >= 0 ) {
                this.error( "Record must represent an existing record!" );
                errors.addField( this._columns[this._indexKey].Property, "ERR_FIELD_BADFORMAT", ["{" + this._columns[this._indexKey].Field + "}"] );
            } else if ( oldRow[this._indexKey] >= 0 ) {
                // if the record is different than the existing record, it means that data are updated from the server ...
                // so, we have decided to reject the update

                var different = false;

                for ( i = 0; i < this._columns.length; i++ ) {
                    if ( !DSTable.IsEqualProperties( oldRow[i], existingRecord[this._columns[i].Property] ) ) {
                        this.error( "Old (" + String.JSONStringify( oldRow ) + ") and existing (" + String.JSONStringify( existingRecord ) + ") records must represent the same record (" + this._columns[i].Property + " => old: '" + ( oldRow[i] === null ? "null" : oldRow[i].toString() ) + "' - existing: '" + ( existingRecord[this._columns[i].Property] === null ? "null" : existingRecord[this._columns[i].Property].toString() ) + "') !" );
                        errors.addGlobal( "ERR_RECORD_DIFFERENT" );
                        different = true;
                        break;
                    }
                }

                if ( !different &&
                    ( oldRow[this._indexTick] !== existingRecord._tick ||
                    oldRow[this._indexDeleted] !== existingRecord._deleted ) ) {
                    this.error( "Old (" + String.JSONStringify( oldRow ) + ") and existing (" + String.JSONStringify( existingRecord ) + ") records must represent the same record (tick or deleted flag)!" );
                    errors.addGlobal( "ERR_RECORD_DIFFERENT" );
                }
            }

            if ( errors.HasError ) {
                this.error( "Unable to delete the record due to some errors (" + errors.toString() + ")" );
                return null;
            }

            // 3. Delete the row into the table

            var existingIdentity = this._identitiesByClientId[oldRow[this._indexKey]];
            var existingRow = this._records[existingIdentity[0]];

            var existingRecordToServer = this.getRecordToServer( existingRow );
            var existingIdentityToServer = this.getIdentityToServer( existingIdentity );

            existingRow[this._indexDeleted] = true;

            // 4. Update unique values

            for ( i in this._columnUnique )
                this._columnUnique[i].deleteValue( this.getRow( null, oldRow ) );

            this.info( "The row containing serverId " + String.JSONStringify( existingRow ) + " and clientId " + String.JSONStringify( existingIdentity ) + " is deleted" );

            // 5. Send this record towards the server

            if ( !this._database.send( this._name, "Delete", existingRecordToServer, existingIdentityToServer, existingRow[this._indexTick] ) ) {
                errors.addGlobal( "ERR_OUT_OF_MEMORY" );
                return null;
            }

            // 6. Notify the delete

            this._database.eventOnDelete( this._name, existingIdentity[1] );

            // 7. return the new record

            return this.getRow( existingIdentity[0] );
        } catch ( e ) {
            this.exception( "An exception occurs on deleting data into the table '" + this._name + "'", e );
            errors.addGlobal( "ERR_EXCEPTION_UNEXPECTED" );
            return null;
        }
    }

    /**
     * Execution of a given request
     * @param {any} request request to send to the server
     * @param {any} record  record to execute
     * @param {any} errors  container of errors in case of abnormal value into the record
     * @param {any} fnDone  function to call on acknowledging the request
     * @returns {any} null
     */
    executeRequest ( request, record, errors, fnDone ) {
        try {
            this.info( "Executing the request '" + request + "' with the record " + String.JSONStringify( record ) + " from the client ..." );

            if ( this._name === "User" && request === "NewPassword" &&
                record !== null && record !== undefined &&
                record.Id !== null && record.Id !== undefined &&
                record.CustomerId !== null && record.CustomerId !== undefined ) {

                // Retrieve the current identity

                var identity = this._identitiesByClientId[record.Id];

                var customerId = this._database.getServerIdByClientId( "Customer", record.CustomerId );

                // Replace the userId client by the userId server

                if ( identity !== null || identity !== undefined ) {
                    if ( !this._database.send( this._name, request, { UserId: this._records[identity[0]][this._indexKey], CustomerId: customerId }, { UserId: record.Id, CustomerId: record.CustomerId }, null, fnDone ) ) {
                        errors.addGlobal( "ERR_OUT_OF_MEMORY" );
                        return null;
                    }

                    return null;
                }
            }

            errors.addGlobal( "ERR_REQUEST_UNKNOWN" );
            return null;
        } catch ( e ) {
            this.exception( "An exception occurs on executin a request into the table '" + this._name + "'", e );
            errors.addGlobal( "ERR_EXCEPTION_UNEXPECTED" );
            return null;
        }
    }

    /**
     * Rollback an action
     * @param {any} action   action of the request
     * @param {any} record   record added, updated or deleted
     * @param {any} identity identity of the request
     * @param {any} tick     reference on the tick of the action
     */
    rollback ( action, record, identity, tick ) {
        var newRecord = null;
        var oldRecord = null;

        this.info( "Rollbacking the request serverId:" + String.JSONStringify( record ) + " clientId:" + String.JSONStringify( identity ) + " if and only if the tick is '" + tick + "' ..." );

        // Retrieve the record to restore

        var recordToRollback = record;
        var identityToRollback = identity;
        if ( action === "Update" && record !== null && record !== undefined && identity !== null && identity !== undefined ) {
            recordToRollback = record.Old;
            identityToRollback = identity.Old;
        }

        if ( recordToRollback === null || recordToRollback === undefined ||
            identityToRollback === null || identityToRollback === undefined ) {
            this.error( "Unable to rollback due to a missing parameter!" );
            return;
        }

        var rowIndex = identityToRollback._rowIndex;
        var clientId = identityToRollback[this._columns[this._indexKey].Property];
        var identityByClientId = this._identitiesByClientId[clientId];

        if ( rowIndex === null || rowIndex === undefined ) {
            if ( identityByClientId === null || identityByClientId === undefined ) {
                this.error( "Unable to rollback due to a non-consitency information!" );
                return;
            }
            rowIndex = identityByClientId[0];
        } else if ( rowIndex !== identityByClientId[0] ) {
            this.error( "Unable to rollback due to a non-consitency information!" );
            return;
        }

        // Rollback rowIndex

        this.debug( "Rollback the row (" + rowIndex + ")" );

        var row = this._records[rowIndex];
        if ( row === null || row === undefined ) {
            this.error( "Unable to rollback due to a missing row!" );
            return;
        }

        if ( row[this._indexTick] !== tick ) {
            this.info( "Unable to rollback the row (" + rowIndex + ") because the row has been updated since sending the request" );
            return;
        }

        // The row must be restored as before sending the request

        var i = null;
        switch ( action ) {
            case "Create":
                this.debug( "Delete the row" );
                row[this._indexDeleted] = true;

                // Update unique values

                for ( i in this._columnUnique )
                    this._columnUnique[i].deleteValue( this.getRow( null, row, identityByClientId ) );

                // Notify the delete

                this._database.eventOnDelete( this._name, identityByClientId[1] );
                break;
            case "Update":
                this.debug( "Restore the row" );

                // Check if the recordToRollback and identityToRollback contain all mandatory fields

                for ( i = 0; i < this._columns.length; i++ )
                    if ( recordToRollback[this._columns[i].Property] === undefined ) {
                        this.error( "Unable to rollback due to a missing property!" );
                        return;
                    }

                for ( i = 0; i < this._columnForeign.length; i++ )
                    if ( identityToRollback[this._columns[this._columnForeign[i].index].Property] === undefined ) {
                        this.error( "Unable to rollback due to a missing identity!" );
                        return;
                    }

                // copy recordToRollback into row

                var errors = new Errors();
                var rowUpdate = [];
                for ( i = 0; i < this._columns.length; i++ )
                    rowUpdate[i] = this._columns[i].convertFromJSON( recordToRollback[this._columns[i].Property], errors );

                // Update unique value

                newRecord = this.getRow( null, rowUpdate, identityToRollback );
                for ( i in this._columnUnique ) {
                    if ( row[i] === rowUpdate[i] )
                        continue;

                    this._columnUnique[i].deleteValue( this.getRow( null, row, identityByClientId ) );
                    this._columnUnique[i].addValue( newRecord );
                }

                // save the existing record to sent it to the listeners

                var existingRecord = this.getRow( rowIndex );

                // copy recordToRollback into row

                for ( i = 0; i < this._columns.length; i++ )
                    row[i] = rowUpdate[i];

                // copy identityToRollback into identityByClientId

                i = 2;
                for ( var j = 0; j < this._columnForeign.length; i++ , j++ )
                    identityByClientId[i] = identityToRollback[this._columns[this._columnForeign[j].index].Property];

                // Notify the update

                this._database.eventOnUpdate( this._name, identityByClientId[1], existingRecord );
                break;
            case "Delete":
                this.debug( "Restore the row as undeleted" );
                row[this._indexDeleted] = false;

                // Update unique values

                newRecord = this.getRow( null, row, identityByClientId );
                for ( i in this._columnUnique )
                    this._columnUnique[i].addValue( newRecord );

                // Notify the creation

                this._database.eventOnCreate( this._name, identityByClientId[1] );
                break;
        }
    }

    // --------------------------------------------------------------
    // DS Synchronization
    // --------------------------------------------------------------

    /**
     * Convert a client Id from the last connection to the client Id of the new connection (synchronization process)
     * @param {any} foreignConstraint constraint corresponding to the foreign key
     * @param {any} serverId          id of the record from the server
     * @param {any} oldClientId       id of the record from the client
     * @param {any} errors            container of errors in case of abnormal value into the record
     * @returns {any} new id of the record from the client after synchronizing data
     */
    getNewClientId ( foreignConstraint, serverId, oldClientId, errors ) {
        if ( serverId === null || serverId === undefined )
            return null;

        var currentColumn = this._columns[foreignConstraint.index];
        var foreignIdentity = null;

        if ( serverId >= 0 ) {
            foreignIdentity = foreignConstraint.table._identitiesByServerId[serverId];

            if ( foreignIdentity === undefined ) {
                this.error( "The serverId '" + serverId + "' of the column '" + currentColumn.Property + "' doesn't exist into the table '" + foreignConstraint.table._name + "'" );
                errors.addField( currentColumn.Property, currentColumn.ForeignKey.Error );
                return null;
            }

            // the client Id of the new connection if the clientId of the record referenced by the serverId

            return foreignIdentity[1];
        }

        // index < 0 means that the record is not yet created into the database (look for into the foreign table to retrieve the right id) or already created but partially executed

        if ( oldClientId === null || oldClientId === undefined )
            return null;

        serverId = foreignConstraint.table._replayServerIds[oldClientId];

        if ( serverId !== null && serverId !== undefined && serverId >= 0 ) {
            foreignIdentity = foreignConstraint.table._identitiesByServerId[serverId];

            if ( foreignIdentity === undefined ) {
                this.error( "The serverId '" + serverId + "' of the column '" + currentColumn.Property + "' doesn't exist into the table '" + foreignConstraint.table._name + "'" );
                errors.addField( currentColumn.Property, currentColumn.ForeignKey.Error );
                return null;
            }

            // the client Id of the new connection if the clientId of the record referenced by the serverId

            return foreignIdentity[1];
        }

        var newClientId = foreignConstraint.table._replayClientIds[oldClientId];
        if ( newClientId === null || newClientId === undefined )
            return null;

        return newClientId;
    }

    /**
     * Replay the creation record
     * - (record, identity) corresponds to the message send to the server
     * @param {any} record   record created
     * @param {any} identity identity of the request
     * @param {any} tick     reference on the tick of the action
     * @param {any} errors   container of errors in case of abnormal value into the record
     * @returns {DSRecord} record synchronized
     */
    replayCreate ( record, identity, tick, errors ) {
        try {
            this.info( "Replaying the creation of the record " + String.JSONStringify( record ) + " ..." );

            // 1. Build a new row

            var newRow = [];
            var currentColumn = null;
            var i = null;

            for ( i = 0; i < this._columns.length; i++ ) {
                currentColumn = this._columns[i];

                if ( record[currentColumn.Property] === undefined ) {
                    this.error( "The property '" + currentColumn.Property + "' is missing into the record" );
                    errors.addField( currentColumn.Property, "ERR_FIELD_MISSING", ["{" + currentColumn.Field + "}"] );
                    newRow[i] = null;
                    continue;
                }

                // check property and set the value from the record

                newRow[i] = currentColumn.checkProperties( currentColumn.convertFromJSON( record[currentColumn.Property], errors ), errors );
            }

            // it's a row to add into the table

            if ( newRow[this._indexKey] !== -1 ) {
                this.error( "A new record must have an Id equals to -1" );
                errors.addField( this._columns[this._indexKey].Property, "ERR_FIELD_BADFORMAT", ["{" + this._columns[this._indexKey].Field + "}"] );
            }

            // add _tick and deleted

            newRow[this._indexTick] = null;
            newRow[this._indexDeleted] = false;

            this.debug( "The new row containing serverId is " + String.JSONStringify( newRow ) );

            // 2. Check unique constraint 

            for ( i in this._columnUnique ) {
                var uniqueConstraint = this._columnUnique[i];
                currentColumn = this._columns[i];

                if ( !uniqueConstraint.existValue( this.getRow( null, newRow ) ) )
                    continue;

                this.error( "The value '" + newRow[i] + "' already exists for the column '" + currentColumn.Property + "'" );
                errors.addField( currentColumn.Property, uniqueConstraint.Error, ["{" + currentColumn.Field + "}"] );
            }

            // 3. Check foreign key constraint and build the identity

            var newIdentity = [];

            i = 0;
            newIdentity[i++] = -1; // rowIndex (not yet defined)
            newIdentity[i++] = -1; // Id       (not yet defined too)

            for ( var j = 0; j < this._columnForeign.length; j++ , i++ ) {
                // Update identity to add by the client Id and server Id

                var foreignConstraint = this._columnForeign[j];
                var serverId = newRow[foreignConstraint.index];
                var oldClientId = identity[this._columns[foreignConstraint.index].Property];

                newIdentity[i] = this.getNewClientId( foreignConstraint, serverId, oldClientId, errors );
            }

            if ( errors.HasError )
                return null;

            // update rowIndex and Id

            newIdentity[0] = this._records.length;
            newIdentity[1] = this.NextSequenceId;
            this._replayClientIds[identity[this._columns[this._indexKey].Property]] = newIdentity[1];

            // 4. Add the row into the table

            this._records.push( newRow );
            this._identities.push( newIdentity );
            this._identitiesByClientId[newIdentity[1]] = newIdentity;
            // this._identitiesByServerId is not updated because we haven't yet the id from the server

            // 5. Update unique values

            var newRecord = this.getRow( null, newRow, newIdentity );
            for ( i in this._columnUnique )
                this._columnUnique[i].addValue( newRecord );

            this.info( "The row containing serverId " + String.JSONStringify( newRow ) + " and clientId " + String.JSONStringify( newIdentity ) + " is added" );

            // 6. Update the request

            return {
                requestId: null,
                table: this._name,
                action: "Create",
                record: this.getRecordToServer( newRow ),
                identity: this.getIdentityToServer( newIdentity ),
                tick: tick
            };
        } catch ( e ) {
            this.exception( "An exception occurs on replaying data into the table '" + this._name + "'", e );
            errors.addGlobal( "ERR_EXCEPTION_UNEXPECTED" );
            return null;
        }
    }

    /**
     * Replay the update record
     * @param {any} oldRecord   previous record updated
     * @param {any} oldIdentity identity of the record
     * @param {any} newRecord   record updated
     * @param {any} newIdentity identity of the request
     * @param {any} tick        reference on the tick of the action
     * @param {any} errors      container of errors in case of abnormal value into the record
     * @returns {DSRecord} record synchronized
     */
    replayUpdate ( oldRecord, oldIdentity, newRecord, newIdentity, tick, errors ) {
        try {
            this.info( "Replaying the update of the record " + String.JSONStringify( oldRecord ) + " within identities " + String.JSONStringify( oldIdentity ) + " to " + String.JSONStringify( newRecord ) + " within identities " + String.JSONStringify( newIdentity ) + " ..." );

            var i = null, j = null;
            var currentColumn = null;

            // 1. Build the oldRow from the oldRecord

            var oldRow = [];
            for ( i = 0; i < this._columns.length; i++ ) {
                currentColumn = this._columns[i];

                if ( oldRecord[currentColumn.Property] === undefined ) {
                    this.error( "The property '" + currentColumn.Property + "' is missing into the record" );
                    errors.addField( currentColumn.Property, "ERR_FIELD_MISSING", ["{" + currentColumn.Field + "}"] );
                    oldRow[i] = null;
                    continue;
                }

                // check property and set the value from the record

                oldRow[i] = this._columns[i].convertFromJSON( oldRecord[this._columns[i].Property], errors );
            }

            // add _tick and deleted properties

            oldRow[this._indexTick] = oldRecord._tick !== undefined ? oldRecord._tick : null;
            oldRow[this._indexDeleted] = oldRecord._deleted !== undefined ? oldRecord._deleted : false;

            if ( oldRow[this._indexDeleted] ) {
                this.error( "Unable to update a record already deleted!" );
                errors.addGlobal( "ERR_RECORD_DELETED" );
            }

            // 2. Rebuild the oldIdentity to reference the identity on the current database instance

            var oldServerId = oldRow[this._indexKey];
            var oldClientId = this.getNewClientId( { index: this._indexKey, table: this }, oldServerId, oldIdentity[this._columns[this._indexKey].Property], errors );
            if ( oldClientId === null )
                return null;

            var oldExistingIdentity = this._identitiesByClientId[oldClientId];
            if ( oldExistingIdentity === null || oldExistingIdentity === undefined ) {
                this.error( "Unable to retrieve the client Id [" + oldClientId + "] into the table" );
                errors.addGlobal( "ERR_EXCEPTION_UNEXPECTED" );
                return null;
            }

            var oldIdentityToReplay = [];
            oldIdentityToReplay[0] = oldExistingIdentity[0];
            oldIdentityToReplay[1] = oldExistingIdentity[1];

            for ( i = 2, j = 0; j < this._columnForeign.length; j++ , i++ ) {
                // Update identity to add by the client Id and server Id

                var oldForeignConstraint = this._columnForeign[j];
                var oldForeignServerId = oldRow[oldForeignConstraint.index];
                var oldForeignClientId = oldIdentity[this._columns[oldForeignConstraint.index].Property];

                oldIdentityToReplay[i] = this.getNewClientId( oldForeignConstraint, oldForeignServerId, oldForeignClientId, errors );
            }

            if ( errors.HasError )
                return null;

            // oldRow and oldIdentityToReplay replace oldRecord and oldIdentity

            this.debug( "The row of the record to update is " + String.JSONStringify( oldRow ) + " with identities " + String.JSONStringify( oldIdentityToReplay ) );

            // 3. Check if oldRow and oldIdentityToReplay matches within the existing row into the database

            var existingRecord = this.getRow( oldExistingIdentity[0] );
            if ( existingRecord === null || existingRecord === undefined ) {
                this.error( "New and old records must represent an existing record!" );
                errors.addField( this._columns[this._indexKey].Property, "ERR_FIELD_BADFORMAT", ["{" + this._columns[this._indexKey].Field + "}"] );
            } else {
                // if the oldRecord is different than the existing record, it means that data are updated from the server ...
                // so, we have decided to reject the update

                var oldRecordToCheck = this.getRow( null, oldRow, oldIdentityToReplay );

                var different = false;

                for ( i = 0; i < this._columns.length; i++ ) {
                    if ( !DSTable.IsEqualProperties( oldRecordToCheck[this._columns[i].Property], existingRecord[this._columns[i].Property] ) ) {
                        this.error( "Old (" + String.JSONStringify( oldRecordToCheck ) + ") and existing (" + String.JSONStringify( existingRecord ) + ") records must represent the same record (" + this._columns[i].Property + " => old: '" + ( oldRecordToCheck[this._columns[i].Property] === null ? "null" : oldRecordToCheck[this._columns[i].Property].toString() ) + "' - existing: '" + ( existingRecord[this._columns[i].Property] === null ? "null" : existingRecord[this._columns[i].Property].toString() ) + "') !" );
                        errors.addGlobal( "ERR_RECORD_DIFFERENT" );
                        different = true;
                        break;
                    }
                }

                if ( !different &&
                    ( ( oldRecordToCheck._tick !== existingRecord._tick && oldRecordToCheck._tick !== null && existingRecord._tick !== null ) ||
                        oldRecordToCheck._deleted !== existingRecord._deleted ) ) {
                    this.error( "Old (" + String.JSONStringify( oldRecordToCheck ) + ") and existing (" + String.JSONStringify( existingRecord ) + ") records must represent the same record (tick or deleted flag)!" );
                    errors.addGlobal( "ERR_RECORD_DIFFERENT" );
                }
            }

            if ( errors.HasError )
                return null;

            // oldRow and oldIdentityToReplay match with the current situation into the database

            // 4. Build the newRow from the newRecord

            var newRow = [];
            for ( i = 0; i < this._columns.length; i++ ) {
                currentColumn = this._columns[i];

                if ( newRecord[currentColumn.Property] === undefined ) {
                    this.error( "The property '" + currentColumn.Property + "' is missing into the record" );
                    errors.addField( currentColumn.Property, "ERR_FIELD_MISSING", ["{" + currentColumn.Field + "}"] );
                    newRow[i] = null;
                    continue;
                }

                // check property and set the value from the record

                newRow[i] = currentColumn.checkProperties( currentColumn.convertFromJSON( newRecord[currentColumn.Property], errors ), errors );
            }

            // add _tick and deleted properties

            newRow[this._indexTick] = newRecord._tick !== undefined ? newRecord._tick : null;
            newRow[this._indexDeleted] = newRecord._deleted !== undefined ? newRecord._deleted : false;

            if ( newRow[this._indexDeleted] ) {
                this.error( "Unable to update a record already deleted!" );
                errors.addGlobal( "ERR_RECORD_DELETED" );
            }

            // 5. Rebuild the newIdentity to reference the identity on the current database instance

            var newServerId = newRow[this._indexKey];

            if ( oldServerId !== newServerId ) {
                this.error( "New and old records must represent the same record!" );
                errors.addField( this._columns[this._indexKey].Property, "ERR_FIELD_BADFORMAT", ["{" + this._columns[this._indexKey].Field + "}"] );
            }

            var newClientId = this.getNewClientId( { index: this._indexKey, table: this }, newServerId, newIdentity[this._columns[this._indexKey].Property], errors );
            if ( newClientId === null )
                return null;

            if ( oldClientId !== newClientId ) {
                this.error( "New and old records must represent the same record!" );
                errors.addField( this._columns[this._indexKey].Property, "ERR_FIELD_BADFORMAT", ["{" + this._columns[this._indexKey].Field + "}"] );
            }

            var newIdentityToReplay = [];
            newIdentityToReplay[0] = oldExistingIdentity[0];
            newIdentityToReplay[1] = oldExistingIdentity[1];

            for ( i = 2, j = 0; j < this._columnForeign.length; j++ , i++ ) {
                // Update identity to add by the client Id and server Id

                var newForeignConstraint = this._columnForeign[j];
                var newForeignServerId = newRow[newForeignConstraint.index];
                var newForeignClientId = newIdentity[this._columns[newForeignConstraint.index].Property];

                newIdentityToReplay[i] = this.getNewClientId( newForeignConstraint, newForeignServerId, newForeignClientId, errors );
            }

            if ( errors.HasError )
                return null;

            // newRow and newIdentityToReplay replace newRecord and newIdentity

            this.debug( "The new row of the record is " + String.JSONStringify( newRow ) + " with identities " + String.JSONStringify( newIdentityToReplay ) );

            // 6. Check unique constraint 

            for ( i in this._columnUnique ) {
                var uniqueConstraint = this._columnUnique[i];
                currentColumn = this._columns[i];

                if ( !uniqueConstraint.existValue( this.getRow( null, newRow, newIdentityToReplay ) ) )
                    continue;

                this.error( "The value '" + newRow[i] + "' already exists for the column '" + currentColumn.Property + "'" );
                errors.addField( currentColumn.Property, uniqueConstraint.Error, ["{" + currentColumn.Field + "}"] );
            }

            if ( errors.HasError )
                return null;

            // 7. Update the row into the table

            var existingRow = this._records[newIdentityToReplay[0]];
            var existingIdentity = this._identities[newIdentityToReplay[0]];

            oldRecord = this.getRow( null, existingRow, existingIdentity );

            for ( i = 0; i < existingRow.length; i++ )
                existingRow[i] = newRow[i];

            for ( i = 0; i < existingIdentity.length; i++ )
                existingIdentity[i] = newIdentityToReplay[i];

            newRecord = this.getRow( null, existingRow, existingIdentity );

            // 8. Update unique values

            for ( i in this._columnUnique ) {
                if ( oldRow[i] === newRow[i] )
                    continue;

                this._columnUnique[i].deleteValue( oldRecord );
                this._columnUnique[i].addValue( newRecord );
            }

            // 9. Update the request

            return {
                requestId: null,
                table: this._name,
                action: "Update",
                record: { Old: this.getRecordToServer( oldRow ), New: this.getRecordToServer( newRow ) },
                identity: { Old: this.getIdentityToServer( oldIdentityToReplay ), New: this.getIdentityToServer( newIdentityToReplay ) },
                tick: tick
            };
        } catch ( e ) {
            this.exception( "An exception occurs on replaying the update data into the table '" + this._name + "'", e );
            errors.addGlobal( "ERR_EXCEPTION_UNEXPECTED" );
            return null;
        }
    }

    /**
     * Replay the deletion of the record
     * - (record, identity) corresponds to the message send to the server
     * @param {any} record   record deleted
     * @param {any} identity identity of the request
     * @param {any} tick     reference on the tick of the action
     * @param {any} errors   container of errors in case of abnormal value into the record
     * @returns {DSRecord} record synchronized
     */
    replayDelete ( record, identity, tick, errors ) {
        try {
            this.info( "Replaying the deletion of the record " + String.JSONStringify( record ) + " within identities " + String.JSONStringify( identity ) + " ..." );

            var i = null, j = null;
            var currentColumn = null;

            // 1. Build the row from the record

            var row = [];
            for ( i = 0; i < this._columns.length; i++ ) {
                currentColumn = this._columns[i];

                if ( record[currentColumn.Property] === undefined ) {
                    this.error( "The property '" + currentColumn.Property + "' is missing into the record" );
                    errors.addField( currentColumn.Property, "ERR_FIELD_MISSING", ["{" + currentColumn.Field + "}"] );
                    row[i] = null;
                    continue;
                }

                // check property and set the value from the record

                row[i] = this._columns[i].convertFromJSON( record[this._columns[i].Property], errors );
            }

            // add _tick and _deleted properties

            row[this._indexTick] = record._tick !== undefined ? record._tick : null;
            row[this._indexDeleted] = record._deleted !== undefined ? record._deleted : false;

            if ( row[this._indexDeleted] ) {
                this.error( "Unable to delete a record already deleted!" );
                errors.addGlobal( "ERR_RECORD_DELETED" );
            }

            // 2. Rebuild the identity to reference the identity on the current database instance

            var serverId = row[this._indexKey];
            var clientId = this.getNewClientId( { index: this._indexKey, table: this }, serverId, identity[this._columns[this._indexKey].Property], errors );
            if ( clientId === null )
                return null;

            var existingIdentity = this._identitiesByClientId[clientId];
            if ( existingIdentity === null || existingIdentity === undefined ) {
                this.error( "Unable to retrieve the client Id [" + clientId + "] into the table" );
                errors.addGlobal( "ERR_EXCEPTION_UNEXPECTED" );
                return null;
            }

            var identityToReplay = [];
            identityToReplay[0] = existingIdentity[0];
            identityToReplay[1] = existingIdentity[1];

            for ( i = 2, j = 0; j < this._columnForeign.length; j++ , i++ ) {
                // Update identity to add by the client Id and server Id

                var oldForeignConstraint = this._columnForeign[j];
                var oldForeignServerId = row[oldForeignConstraint.index];
                var oldForeignClientId = identity[this._columns[oldForeignConstraint.index].Property];

                identityToReplay[i] = this.getNewClientId( oldForeignConstraint, oldForeignServerId, oldForeignClientId, errors );
            }

            if ( errors.HasError )
                return null;

            // row and identityToReplay replace record and identity

            this.debug( "The row of the record to delete is " + String.JSONStringify( row ) + " with identities " + String.JSONStringify( identityToReplay ) );

            // 3. Check if row and identityToReplay matches within the existing row into the database

            var existingRecord = this.getRow( existingIdentity[0] );
            if ( existingRecord === null || existingRecord === undefined ) {
                this.error( "Record must represent an existing record!" );
                errors.addField( this._columns[this._indexKey].Property, "ERR_FIELD_BADFORMAT", ["{" + this._columns[this._indexKey].Field + "}"] );
            } else {
                // if the record is different than the existing record, it means that data are non-synchronized with the server ...
                // so, we have decided to reject the delete

                var oldRecordToCheck = this.getRow( null, row, identityToReplay );

                var different = false;

                for ( i = 0; i < this._columns.length; i++ ) {
                    if ( !DSTable.IsEqualProperties( oldRecordToCheck[this._columns[i].Property], existingRecord[this._columns[i].Property] ) ) {
                        this.error( "Old (" + String.JSONStringify( oldRecordToCheck ) + ") and existing (" + String.JSONStringify( existingRecord ) + ") records must represent the same record (" + this._columns[i].Property + " => old: '" + ( oldRecordToCheck[this._columns[i].Property] === null ? "null" : oldRecordToCheck[this._columns[i].Property].toString() ) + "' - existing: '" + ( existingRecord[this._columns[i].Property] === null ? "null" : existingRecord[this._columns[i].Property].toString() ) + "') !" );
                        errors.addGlobal( "ERR_RECORD_DIFFERENT" );
                        different = true;
                        break;
                    }
                }

                if ( !different &&
                    ( ( oldRecordToCheck._tick !== existingRecord._tick && oldRecordToCheck._tick !== null && existingRecord._tick !== null ) ||
                        oldRecordToCheck._deleted !== existingRecord._deleted ) ) {
                    this.error( "Old (" + String.JSONStringify( oldRecordToCheck ) + ") and existing (" + String.JSONStringify( existingRecord ) + ") records must represent the same record (tick or deleted flag)!" );
                    errors.addGlobal( "ERR_RECORD_DIFFERENT" );
                }
            }

            if ( errors.HasError )
                return null;

            // row and identityToReplay match with the current situation into the database

            // 4. Update unique constraint 

            for ( i in this._columnUnique ) {
                this._columnUnique[i].deleteValue( this.getRow( null, row, identityToReplay ) );
            }

            // 5. Update the row into the table

            this._records[existingIdentity[0]][this._indexDeleted] = true;

            // 6. Update the request

            return {
                requestId: null,
                table: this._name,
                action: "Delete",
                record: this.getRecordToServer( row ),
                identity: this.getIdentityToServer( identityToReplay ),
                tick: tick
            };
        } catch ( e ) {
            this.exception( "An exception occurs on replaying the delete data into the table '" + this._name + "'", e );
            errors.addGlobal( "ERR_EXCEPTION_UNEXPECTED" );
            return null;
        }
    }

    /**
     * Constructor
     * @param {any} database    reference on the database attached to the table
     * @param {any} schemaTable description of the schema of this table
     */
    constructor( database, schemaTable ) {
        super( "DSTable[" + schemaTable.Name + "]" );

        // set table properties

        this._database = database;
        this._loaded = false;
        this._name = schemaTable.Name;
        this._areaName = schemaTable.Area;
        this._columns = [];              // Array of properties
        this._columnsByName = {};        // access the property and its index into _columns
        this._records = [];              // Id described here are Id from the server side [<properties>, _tick, _deleted]
        this._columnUnique = [];         // array of unique constraint
        this._hasCopy = null;

        // identities

        this._columnForeign = null;      // array of foreign key ({index, table})
        this._identities = [];           // Id described here are Id from the client side
        this._identitiesByServerId = []; // references on Identities sorted by ServerId
        this._identitiesByClientId = []; // references on Identities sorted by ClientId
        this._notYetKnown = [];          // When an Id from the server side is not yet known, the link towards the client element is stored and updated as the new value is received from the server

        this._replayClientIds = {};      // Attach an old clientId and a new clientId (in case of replay requests)
        this._replayServerIds = {};      // Attach an clientId already stored into the database and a new clientId (in case of replay requests)

        // sequence

        this._lastSequenceId = 0;

        // some indexes of columns

        this._indexKey = undefined;
        this._indexTick = undefined;
        this._indexDeleted = undefined;
        this._indexReplayClientId = undefined;

        this.info( "Declaring the table '" + this._name + "' ..." );

        // Declara all columns and update indexes

        try {
            this.info( "Declaring columns ..." );

            var i = 0;
            for ( i = 0; i < schemaTable.Columns.length; i++ ) {
                var newColumn = new DSColumn( this._name, schemaTable.Columns[i] );

                if ( newColumn.IsKey && this._indexKey === undefined )
                    this._indexKey = i;

                if ( newColumn.Unique ) {
                    this._columnUnique[i] = newColumn.Unique;
                    this._columnUnique[i].addField( newColumn.Property );
                }

                this._columns.push( newColumn );
                this._columnsByName[newColumn.Property] = i;
            }

            // Complete columnUnique by looking for the fieldId attached to it

            for ( var column in this._columnUnique ) {
                var uniqueColumn = this._columnUnique[column];

                this.debug( "The column '" + uniqueColumn.FieldName + "' has to be a unique value (list of Ids: " + uniqueColumn.FieldNames + ")" );
            }

            // looking for the column containing the key

            if ( this._indexKey === undefined ) {
                i = this._columnsByName["Id"];
                if ( i !== undefined )
                    this._indexKey = i;
            }
            this.debug( "IndexKey = " + this._indexKey );

            // Each record has 2 more columns (tick : last update - deleted : indicates that the record is deleted or not)

            this._indexTick = this._columns.length;
            this.debug( "IndexTick = " + this._indexTick );

            this._indexDeleted = this._columns.length + 1;
            this.debug( "IndexDeleted = " + this._indexDeleted );

            this._indexReplayClientId = this._columns.length + 2;

            this.info( this._columns.length + " columns declared" );
        } catch ( e ) {
            this.exception( "An exception occurs on declaring table '" + this._name + "'", e );
        }
    }
}
