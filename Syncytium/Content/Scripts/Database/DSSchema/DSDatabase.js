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
 * Manage the differential synchronization database from the client side
 * This class handles the exchange and the offline connection between itself and the server
 *
 * Status:
 *   - At the beginning                                                    : NotInitialized
 *   - As the connection is done to the server                             : Initializing
 *   - As the schema is loaded                                             : Loading
 *   - As the data are loaded                                              : Loaded
 *   - As all records stored during the initialization process are treated : Running
 *   - On case of disconnection/reconnection                               : ReadyToSynchronize
 *   - If the initialization process failed                                : Error:<code error>
 */
class DSDatabase extends LoggerBaseObject {
    static Heartbeat( db, delay ) {
        if ( this._interval === undefined )
            this._interval = null;

        // Stop the heartbeat ?

        if ( delay === null || delay === undefined || delay <= 0 ) {
            if ( this._interval !== null ) {
                window.clearInterval( this._interval );
                this._interval = null;
                Logger.Instance.info( "DB Heartbeat", "Heartbeat stopped" );
                return;
            }
        }

        if ( this._interval !== null )
            return;

        // Start the heartbeat

        Logger.Instance.info( "DB Heartbeat", "Heartbeat started" );

        this._interval = window.setInterval( async function () {
            Logger.Instance.info( "DB Heartbeat", "Heartbeat ..." );

            if ( Hub.Instance.IsRunning && !db._commitRunning ) {
                await db.sendRequests().then( () => {
                    if ( !Hub.Instance.IsStopped )
                        return;

                    Logger.Instance.info( "DB Heartbeat", "The server was disconnected during the committing process ... Trying to reconnect it ..." );
                    Hub.Instance.start();
                } );
                return;
            }

            if ( !Hub.Instance.IsStopped )
                return;

            Logger.Instance.info( "DB Heartbeat", "The server is disconnected ... Trying to reconnect it ..." );
            Hub.Instance.start();
        }, delay * 1000 );
    }

    /**
     * Execute a thread and notify the progression
     * @param {any} generator function to run
     * @param {any} onEvent function to call on each iteration
     */
    static async Thread( db, generator, onEvent ) {
        function treatment() {
            return new Promise( ( resolve, reject ) => {
                let runTreatment = true;

                try {
                    let result = generator.next();
                    runTreatment = !result.done;
                    if ( runTreatment && onEvent )
                        onEvent(db);
                } catch ( e ) {
                    Logger.Instance.exception( "DSDatabase", "Exception on running thread", e );
                    runTreatment = false;
                }

                setTimeout( runTreatment ? resolve : reject, 10 );
            } );
        }

        let loop = true;
        while ( loop ) {
            await treatment().catch( () => { loop = false; } );
        }
    }

    /**
     * Define the current area of the application (Administration, Customer, ...)
     * @param {any} area area of the application cliente
     */
    set Area( area ) {
        this._areaName = area.Module;
        this._areaInstance = area;
        this._areaModuleId = area.ModuleId;
    }

    /**
     * @returns {string} area of the application cliente
     */
    get Area() {
        return this._areaName;
    }

    /**
     * Get the next request Id
     */
    get NextRequestId () {
        return this._lastRequestId++;
    }

    /**
     * Get the next event listener key
     */
    get NextEventListenerKey () {
        return this._lastListenerKey++;
    }

    /**
     * Retrieve the current language of the application
     */
    get CurrentLanguage () {
        if ( this._selectedLanguage )
            return this._selectedLanguage;

        let currentUser = this.CurrentUser;
        if ( currentUser && currentUser.Language )
            return currentUser.Language;

        return this._defaultLanguage;
    }

    /**
     * Retrieve the current user of the application
     */
    get CurrentUser () {
        let record = {};

        if ( this._currentUserId === null || this._currentUserId === undefined )
            return null;

        if ( this._currentUserId === -1 ) {
            // Build the administrator user
            record.Id = -1;
            record.Login = "";
            record.Registration = "";
            record.Name = "";
            record.FactoryId = null;
            record.SectionId = null;
            record.WorkcentreId = null;
            record.Profile = UserRecord.PROFILE_ADMINISTRATOR;
            record.Email = "";
            record.FrequencyNotification = UserRecord.FREQUENCY_NONE;
            record.FrequencyReportSupervisor = UserRecord.FREQUENCY_NONE;
            record.FrequencyReportUser = UserRecord.FREQUENCY_NONE;
            record.CreationDate = new moment();
            record.EndDate = null;
            record.Language = this._defaultLanguage;
            record.Picture = null;
            record.CustomerId = 1;

            return record;
        }

        let currentUserId = this.getClientIdByServerId( "User", this._currentUserId );
        if ( currentUserId === null || currentUserId === undefined )
            return null;

        if ( this._listUsers === undefined )
            this._listUsers = UserRecord.List ? new UserRecord.List() : null;

        if ( this._listUsers !== null )
            record = this._listUsers.getItem( currentUserId, true );
        else
            record = this.getRowById( "User", currentUserId );
        record.Profile = this.CurrentModule.Profile;
        return record;
    }

    /**
     * Retrieve the current customer of the application
     */
    get CurrentModule() {
        let record = this.getRowById( "Module", this.getClientIdByServerId( "Module", this._currentModuleId ) );

        if ( record === null ) {
            // Build the customer current
            record = {};

            record.Id = 0;
            record.Name = "No module";
            record.Module = ModuleRecord.MODULE_NONE;
            record.Parameters = "";
            record.Profile = UserRecord.PROFILE_NONE;
            record.Description = "";
            record.Enable = false;
        }

        return record;
    }

    /**
     * Retrieve the current customer of the application
     */
    get CurrentCustomer () {
        let record = this.getRowById( "Customer", 1 );

        if ( record === null ) {
            // Build the customer current
            record = {};

            record.Id = 0;
            record.Name = "Syncytium Saint-Nazaire";
            record.Email = "";
            record.Address = "";
            record.Comment = "";
        }

        return record;
    }

    /**
     * @returns {array} list of tables into the schema
     */
    get Tables() {
        return this._tables;
    }

    /**
     * Set the current language shown in the screen (may be different than the user's language)
     * @param {any} value language selected to show it on the screen
     */
    set SelectedLanguage( value ) {
        this._selectedLanguage = value;
    }

    /**
     * @returns {any} list of parameters retrieved from the server
     */
    get Parameters() {
        return this._parameters;
    }

    // -------------------------------------- Events ------------------------------------

    /**
     * Notify the starting progress bar
     */
    onStartProgress() {
        if ( this._areaInstance && this._areaInstance.onStartProgress )
            this._areaInstance.onStartProgress();

        if ( this._hubMaster && this._hubMaster._areaInstance && this._hubMaster._areaInstance.onStartProgress )
            this._hubMaster._areaInstance.onStartProgress();
    }

    /**
     * Notify an update of the progression
     * @param {any} current
     * @param {any} total
     * @param {any} label
     */
    onProgress( current, total, label ) {
        if ( ( current !== null && current !== undefined ) ||
            ( total !== null && total !== undefined ) ) {
            if ( this._areaInstance && this._areaInstance.progressStatus )
                this._areaInstance.progressStatus( current, total, label );

            if ( this._hubMaster && this._hubMaster._areaInstance && this._hubMaster._areaInstance.progressStatus )
                this._hubMaster._areaInstance.progressStatus( current, total, label );
        } else {
            if ( this._areaInstance && this._areaInstance.progressStatus )
                this._areaInstance.progressStatus( current, total, label );
            else if ( this._hubMaster && this._hubMaster._areaInstance && this._hubMaster._areaInstance.progressStatus )
                this._hubMaster._areaInstance.progressStatus( current, total, label );
        }
    }

    /**
     * Notify an update of the memory consuption
     */
    onProgressMemory() {
        if ( this.IsVerbose )
            this.verbose( "Memory used : " + this._currentSize + " / " + this._maxSize );

        if ( this._areaInstance && this._areaInstance.progressMemory )
            this._areaInstance.progressMemory( this._currentSize, this._maxSize );

        if ( this._hubMaster && this._hubMaster._areaInstance && this._hubMaster._areaInstance.progressMemory )
            this._hubMaster._areaInstance.progressMemory( this._hubMaster.current, this._hubMaster._maxSize );
    }

    /**
     * Notify the closing progress bar
     * @param {boolean} endOfLoading true if the loading is correctly done
     */
    onStopProgress( endOfLoading ) {
        if ( this._areaInstance && this._areaInstance.onStopProgress )
            this._areaInstance.onStopProgress( endOfLoading );

        if ( this._hubMaster && this._hubMaster._areaInstance && this._hubMaster._areaInstance.onStopProgress )
            this._hubMaster._areaInstance.onStopProgress( endOfLoading );
    }

    // ------------------------------------- SEQUENCE -----------------------------------

    /**
     * Check if a sequence already exists 
     * @param {any} key key to check
     * @returns {boolean} true if a sequence already exists
     */
    hasSequence( key ) {
        if ( this._sequence[key] === null || this._sequence[key] === undefined )
            return false;

        return this._sequence[key].length > 0;
    }

    /**
     * Build a new sequence Id attached to the key
     * @param {any} key key of the sequence
     * @param {any} fn  function to call as the sequence number is available
     */
    async nextSequence( key, fn ) {
        function handleNextSequence( db ) {
            return function ( data ) {
                db.info( "New sequence '" + key + "' = " + String.JSONStringify( data ) );
                if ( !fn( data.Error !== null && data.Error !== undefined ? data : data.Result.Value ) ) {
                    db.debug( "Sequence (" + key + ") " + String.JSONStringify( data ) + " already exist ..." );
                } else {
                    ok = true;
                }
            };
        }

        if ( this._sequence[key] === null || this._sequence[key] === undefined )
            this._sequence[key] = [];

        var ok = false;
        while ( !ok ) {
            if ( this._sequence[key].length > 0 ) {
                if ( !fn( this._sequence[key].splice( 0, 1 )[0] ) ) {
                    db.debug( "Sequence (" + key + ") " + this._sequence[key].splice( 0, 1 )[0] + " already exist ..." );
                } else {
                    ok = true;
                }
            } else {
                await Hub.Instance.executeService( "Sequence", { Key: key }, null, true ).then( handleNextSequence( this ) );
            }
        }
    }

    /**
     * Update the sequence of a key
     * @param {any} key key of the sequence
     * @param {any} value max value known of the sequence
     */
    async setSequence( key, value ) {
        await Hub.Instance.executeService( "SetSequence", { Key: key, Value : value }, null, true );
    }

    /**
     * Free the sequence id and restore it as a new sequence
     * @param {any} key
     * @param {any} id
     */
    cancelSequence( key, id ) {
        if ( id === null || id === undefined || id <= 0 )
            return;

        if ( this._sequence[key] === null || this._sequence[key] === undefined )
            this._sequence[key] = [];

        this.info( "Cancel sequence '" + key + "' = " + id );

        this._sequence[key].push( id );
    }

    // ------------------------------------- TO HUB -------------------------------------

    /**
     * Check if the databse contains request to send to the server or waiting for an acknowledge
     */
    get IsEmpty () {
        return this._bufferRequest.length === 0 && this._bufferRequestSent.length === 0;
    }

    /**
     * Remove a request from memory
     * @param {any} requestId Id of the request to remove
     */
    deleteRequest ( requestId ) {
        let request = this._requestsByRequestId[requestId];
        if ( request === null || request === undefined )
            return;

        let currentSize = String.JSONStringify( request ).length;
        this.debug( "Remove the request (" + requestId + ") from the memory (" + currentSize + " octets)" );

        delete this._requestsByRequestId[requestId];
        this._currentSize -= currentSize;

        this.onProgressMemory();
    }

    /**
     * Rollback a request and restore the status of the database just before executing this request
     * @param {any} request request to rollback
     */
    rollbackRequest ( request ) {
        if ( request.transaction !== null && request.transaction !== undefined ) {
            this.info( "Rollbacking the transaction (" + request.requestId + ") ..." );

            // Rollback a transaction from the end to the begin

            let transaction = this.uncompressTransaction( request.transaction );
    
            for ( let i = transaction.length - 1; i >= 0; i-- ) {
                try {
                    this.rollbackRequest( transaction[i] );
                } catch ( ex ) {
                    this.exception( "Unable to rollback the request", ex );
                    this.warn( "ignore this exception and continue" );
                }
            }

            return;
        }

        // Rollback a request

        if ( request.requestId === undefined )
            this.info( "Rollbacking the request serverId:" + String.JSONStringify( request.record ) + " clientId:" + String.JSONStringify( request.identity ) + " into the table '" + request.table + "' if and only if the tick is '" + request.tick + "' ..." );
        else
            this.info( "Rollbacking the request (" + request.requestId + ") serverId:" + String.JSONStringify( request.record ) + " clientId:" + String.JSONStringify( request.identity ) + " into the table '" + request.table + "' if and only if the tick is '" + request.tick + "' ..." );

        // looking for the table

        let currentTable = this._tables[request.table];
        if ( currentTable === null || currentTable === undefined ) {
            this.error( "The table '" + request.table + "' doesn't exist!" );
            return;
        }

        // add a new row into the given table

        currentTable.rollback( request.action, request.record, request.identity, request.tick );
    }

    /**
     * Send all requests sent into the _bufferRequestSent to the server in asynchronous mode
     * @param {boolean} commit true if the requests correspond to a commit action
     */
    async sendRequests( commit ) {
        function handleExecutionRequest( db, request ) {
            return async function ( data ) {
                if ( db.IsVerboseAll ) {
                    if ( request.transaction !== null && request.transaction !== undefined )
                        db.verbose( "Transaction " + String.JSONStringify( request ) + " sent" );
                    else
                        db.verbose( "Request " + String.JSONStringify( request ) + " sent" );
                }

                // Notify the end of execution of the request

                if ( request.fnDone !== null && request.fnDone !== undefined ) {
                    if ( request.fnDone.constructor.name === "AsyncFunction" ) {
                        await request.fnDone( data.Record, data.Error );
                    } else {
                        request.fnDone( data.Record, data.Error );
                    }
                }

                // Analyze the result

                let errors = null;

                if ( data.Error !== null && data.Error !== undefined ) {
                    let dbRequest = db._requestsByRequestId[data.RequestId];

                    errors = new Errors();
                    errors.setJSON( data.Error );

                    // The request hasn't been executed ... an error occurs during the request execution

                    db.warn( "[" + data.RequestId + "] The request can't have been executed due to some errors (" + errors.toString() + ")" );

                    // Notify the user that something is wrong!

                    await db.eventOnNotify( "*", -1, dbRequest.label, errors );

                    // Data are updated into the DSDatabase and if an error occurs, Database hasn't been updated
                    // So, rollback data into DSDatabase to be synchronized with the database

                    db.rollbackRequest( dbRequest );
                    db.deleteRequest( data.RequestId );
                } else {
                    db.debug( "[" + data.RequestId + "] The request has been correctly executed" );
                    // the request is already deleted on the acknowledge event or will be deleted on the acknowledge event
                }

                if ( commit === true )
                    await db.eventOnValidation( "onCommit", ( errors && errors.HasError ) ? errors : null );
            };
        }

        if ( this._bufferRequestSent.length === 0 ) {
            this.debug( "No requests to send" );
            return;
        }

        this.info( "Sending all requests in waiting ..." );

        // the database is ready and the connection is up ...
        // Send the request to the server

        let nbRequests = 0;
        for ( let i = 0; i < this._bufferRequestSent.length; i++ )
            nbRequests += this._bufferRequestSent[i].length;

        if ( commit === true )
            await this.eventOnStartValidation( "onStartCommit", nbRequests );

        Hub.Instance.blockEvents();

        while ( this._bufferRequestSent.length > 0 ) {
            // Get the next request

            let request = this._bufferRequestSent[0][0];

            // Remove it from the request to send

            if ( request !== undefined && request !== null )
                this._requestsByRequestId[request.requestId] = request;

            this._bufferRequestSent[0].splice( 0, 1 );
            if ( this._bufferRequestSent[0].length === 0 )
                this._bufferRequestSent.splice( 0, 1 );

            // Execute the request

            if ( request !== undefined && request !== null ) {
                if ( request.transaction !== null && request.transaction !== undefined ) {
                    await Hub.Instance.executeTransaction( request.requestId, request.label, request.transaction, request.notify).then( handleExecutionRequest( this, request ) );
                } else {
                    await Hub.Instance.executeRequest( request.requestId, request.label, request.table, request.action, request.record, request.identity).then( handleExecutionRequest( this, request ) );
                }
            }
        }

        Hub.Instance.unblockEvents();

        if ( commit === true )
            await this.eventOnStopValidation( "onStopCommit" );
    }

    /**
     * Create a new group of requests having a common sense
     * If an error occurs on the transaction, all requests will be rollbacked
     * @param {any} label code label describing the transaction (used by the application to toast a message)
     * @param {any} notify true if the notification must be sent to the caller
     */
    beginTransaction ( label, notify ) {
        if ( this._bufferTransactionCount === 0 ) {
            this._bufferTransactionLabel = Helper.Label( label );
            this._bufferTransactionNotify = notify === true;
            this._bufferTransaction = [];
        }

        this._bufferTransactionCount++;
        this.debug( "Begin transaction [" + this._bufferTransactionCount.toString() + "]" );
    }

    /**
     * Internal method to compress the transaction into a request
     * @param {array} transaction transaction to compress
     * @returns {array} transaction compressed
     */
    compressTransaction( transaction ) {
        function addInArray( records, record, count ) {
            for ( let attr in record ) {
                if ( !Array.isArray( records[attr] ) ) {
                    records[attr] = [];
                    for ( let i = 0; i < count; i++ )
                        records[attr].push( undefined );
                }

                records[attr].push( record[attr] );
            }

            return records;
        }

        let newTransaction = [];
        let currentAction = null;
        let currentRequests = null;
        let lotIndex = 0;

        // Replace list of requests by request within a list of values

        for ( let request of transaction ) {
            if ( currentAction === null || currentAction !== request.action ) {
                lotIndex++;

                currentAction = request.action;
                currentRequests = {};
            }

            // Retrieve the lot size into the transaction

            let table = this._tables[request.table];
            let maxLotSize = table === undefined ? 1 : table._maxLotSize;
            maxLotSize = maxLotSize <= 1 ? 1 : maxLotSize;

            if ( maxLotSize === 1 ) {
                lotIndex++;

                // Strong dependencies between records into this table

                request._indexLot = lotIndex;
                request._indexTable = table === undefined ? 0 : table._indexTable;
                request._indexSubLot = 0;
                newTransaction.push( [ request ] );
                currentRequests = {};
                continue;
            }

            // Build the new transaction

            let currentTable = currentRequests[request.table];
            if ( currentTable === undefined ) {
                currentTable = [ {
                    table: request.table,
                    action: request.action,
                    record: request.action === "Update" ? { New: {}, Old: {} } : {},
                    identity: request.action === "Update" ? { New: {}, Old: {} } : {},
                    tick: [],
                    _request: request,
                    _indexLot: lotIndex,
                    _indexTable: table === undefined ? 0 : table._indexTable,
                    _indexSubLot: 0
                } ];

                currentRequests[request.table] = currentTable;
                newTransaction.push( currentTable );
            }
            let currentRequest = currentTable[currentTable.length - 1];

            // add request into the array

            let nb = currentRequest.tick.length;
            if ( request.action === "Update" ) {
                addInArray( currentRequest.record.New, request.record.New, nb );
                addInArray( currentRequest.record.Old, request.record.Old, nb );
                addInArray( currentRequest.identity.New, request.identity.New, nb );
                addInArray( currentRequest.identity.Old, request.identity.Old, nb );
            } else {
                addInArray( currentRequest.record, request.record, nb );
                addInArray( currentRequest.identity, request.identity, nb );
            }
            currentRequest.tick.push( request.tick );

            // max lot size reached

            if ( currentRequest.tick.length >= maxLotSize ) {
                currentTable.push( {
                    table: request.table,
                    action: request.action,
                    record: request.action === "Update" ? { New: {}, Old: {} } : {},
                    identity: request.action === "Update" ? { New: {}, Old: {} } : {},
                    tick: [],
                    _request: request,
                    _indexLot: lotIndex,
                    _indexTable: table === undefined ? 0 : table._indexTable,
                    _indexSubLot: currentTable.length
                } );
            }
        }

        // Remove alone records

        transaction = newTransaction;
        newTransaction = [];

        for ( let requests of transaction ) {
            for ( let request of requests ) {
                if ( !Array.isArray( request.tick ) ) {
                    newTransaction.push( request );
                    continue;
                }

                if ( Array.isEmpty( request.tick ) )
                    continue;

                if ( request.tick.length === 1 ) {
                    request.tick = request._request.tick;
                    request.record = request._request.record;
                    request.identity = request._request.identity;
                    delete request._request;
                    newTransaction.push( request );
                    continue;
                }

                newTransaction.push( request );
            }
        }

        // Sort new transaction by indexLot, indexTable and indexSubLot

        newTransaction.sort( ( a, b ) => {
            if ( a._indexLot < b._indexLot )
                return -1;

            if ( a._indexLot > b._indexLot )
                return 1;

            if ( a._indexTable < b._indexTable )
                return -1;

            if ( a._indexTable > b._indexTable )
                return 1;

            if ( a._indexSubLot < b._indexSubLot )
                return -1;

            return a._indexLot > b._indexLot ? 1 : 0;
        } );

        // Remove properties used to sort requests

        for ( let request of newTransaction ) {
            delete request._indexLot;
            delete request._indexTable;
            delete request._indexSubLot;
        };

        return newTransaction;
    }

    /**
     * Internal method to uncompress the transaction into a request
     * @param {array} transaction transaction to uncompress
     * @returns {array} transaction uncompressed
     */
    uncompressTransaction( transaction ) {
        function getArrayIndex( records, i ) {
            let record = {};

            for ( let attr in records )
                record[attr] = records[attr][i];

            return record;
        }

        let newTransaction = [];

        for ( let request of transaction ) {
            if ( !Array.isArray( request.tick ) ) {
                newTransaction.push( request );
                continue;
            }

            for ( let i in request.tick ) {
                newTransaction.push( {
                    table: request.table,
                    action: request.action,
                    record: request.action === "Update" ? { New: getArrayIndex( request.record.New, i ), Old: getArrayIndex( request.record.Old, i ) } : getArrayIndex( request.record, i ),
                    identity: request.action === "Update" ? { New: getArrayIndex( request.identity.New, i ), Old: getArrayIndex( request.identity.Old, i ) } : getArrayIndex( request.identity, i ),
                    tick: request.tick[i]
                } );
            }
        }

        return newTransaction;
    }

    /**
     * Close the group of requests
     * @param {any} fnDone function to call when the transaction is done
     */
    endTransaction ( fnDone ) {
        if ( this._bufferTransactionCount< 0 ) {
            this._bufferTransactionCount= 0;
            return;
        }

        this.debug( "End transaction [" + this._bufferTransactionCount.toString() + "]" );
        this._bufferTransactionCount--;

        if ( this._bufferTransactionCount> 0 )
            return;

        // end of transaction, prepare the request into the buffer of request to send

        if ( this._bufferTransaction !== null && this._bufferTransaction.length > 0 ) {
            let newRequest = {
                requestId: this.NextRequestId,
                label: this._bufferTransactionLabel,
                transaction: this.compressTransaction( this._bufferTransaction ),
                fnDone: fnDone,
                notify: this._bufferTransactionNotify
            };

            this._bufferRequest.push( newRequest );
            this.info( "The transaction " + String.JSONStringify( newRequest ) + " is buffering ..." );

            let currentSize = String.JSONStringify( newRequest ).length;
            for ( let i = 0; i < this._bufferTransaction.length; i++ )
                currentSize -= String.JSONStringify( this._bufferTransaction[i] ).length;
            this._currentSize += currentSize;

            this.onProgressMemory();
        }

        this._bufferTransaction = null;
        this._bufferTransactionLabel = null;
        this._bufferTransactionNotify = false;
    }

    /**
     * The request is buffered in memory but not sent to the server
     * The commit will effectively send requests to the server
     * @param {any} table    table name
     * @param {any} action   action name "Create", "Update", "Delete", ...
     * @param {any} record   record to add in the buffer (the content depends on the action)
     * @param {any} identity identities of the record to add in the buffer (the content depends on the action)
     * @param {any} tick     reference on the tick of the action
     * @param {any} fnDone   function to call when the request is done
     * @returns {boolean} true if the request has been added into the buffer, false if out of memory ...
     */
    send ( table, action, record, identity, tick, fnDone ) {
        let newRequest = {
            table: table,
            action: action,
            record: record,
            identity: identity,
            tick: tick
        };

        if ( this._bufferTransaction !== null ) {
            this._bufferTransaction.push( newRequest );
        } else {
            newRequest.requestId = this.NextRequestId;
            newRequest.label = Helper.Label( table.toUpperCase() + "_" + action.toUpperCase() + "D_TOAST", newRequest.requestId );
            newRequest.fnDone = fnDone;
            this._bufferRequest.push( newRequest );
        }

        let requestSize = String.JSONStringify( newRequest ).length;
        this._currentSize += requestSize;

        if ( this._currentSize > this._maxSize ) {
            this.error( "The request " + String.JSONStringify( newRequest ) + " can't be buffered into a transaction because the size '" + this._currentSize + " octets' exceeds '" + this._maxSize + " octets' ..." );
            this.rollbackRequest( newRequest );
            return false;
        }

        if ( this._bufferTransaction !== null )
            this.verbose( "The request " + String.JSONStringify( newRequest ) + " is buffering into a transaction (size: " + requestSize + " octets) ..." );
        else
            this.info( "The request " + String.JSONStringify( newRequest ) + " is buffering (size: " + requestSize + " octets) ..." );

        this.onProgressMemory();

        return true;
    }

    /**
     * Commit all requests in waiting ... send but not executed ... in asynchronous mode
     */
    async commit() {
        if ( this._bufferRequest.length === 0 ) {
            this.debug( "No commit because the buffer is empty" );
            return;
        }

        this.info( "Committing ..." );

        this._bufferRequestSent.push( this._bufferRequest );
        this._bufferRequest = [];

        if ( this._status !== "Running" ) {
            // the database is not ready to send request to the server
            // Push these requests into a temporary buffer will be sent as soon as the connection is up and ready
            this.info( "The database is not ready ... Wait the availability of the database before sending requests to the server ..." );
            return;
        }

        if ( !Hub.Instance.IsRunning ) {
            // the server is disconnected ...
            // Push these requests into a temporary buffer until it will be sent as soon as the connection is up and ready
            this.info( "The server is disconnected ... Wait the end of resynchronizing with the server before sending requests to the server ..." );
            return;
        }

        if ( this._hubDatabase !== null ) {
            // synchronization is running ...
            // Push these requests into a temporary buffer until it will be sent as soon as the connection is up and ready
            this.info( "The synchronization process is running ... Wait the end of resynchronizing with the server before sending requests to the server ..." );
            return;
        }

        if ( this._commitRunning )
            return;

        await this.sendRequests( true );
    }

    /**
     * Generator to iterate on records to rollback
     * @yields {any} request item to rollback
     */
    *rollbackIterable() {
        // rollback request from the end to the start

        let nbRequests = this._bufferRequest.length;
        for ( let i = this._bufferRequest.length - 1; i >= 0; i-- ) {
            let request = this._bufferRequest[i];
            let requestText = String.JSONStringify( request );
            let currentSize = requestText.length;

            this.debug( "Rollback the request " + requestText + " (" + currentSize + " octets)" );
            this.rollbackRequest( request );

            this._currentSize -= currentSize;
            this.onProgressMemory();

            yield true;
        }

        // cleaning up all existing requests

        this._lastRequestId -= nbRequests;
        this._bufferRequest = [];

        this.info( nbRequests + " requests have been rollbacked" );
    }

    /**
     * Cancel all requests in waiting ...
     */
    rollback() {
        if ( this._bufferRequest.length === 0 ) {
            this.debug( "No rollback because the buffer is empty" );
            return;
        }

        this.info( "Rollbacking ..." );
        this.eventOnStartValidation( "onStartRollback", this._bufferRequest.length );
        try {
            for ( let value of this.rollbackIterable() )
                this.eventOnValidation( "onRollback" );
        } catch ( e ) {
            this.exception( "Unable to rollback the request", ex );
        }
        this.eventOnStopValidation( "onStopRollback" );
    }

    /**
     * Cancel all requests in waiting ... in asynchronous mode
     */
    async rollbackAsync() {
        function handleEndRollback( db ) {
            return function () {
                db.eventOnStopValidation( "onStopRollback" );
            };
        }

        if ( this._bufferRequest.length === 0 ) {
            this.debug( "No rollback because the buffer is empty" );
            return;
        }

        this.info( "Rollbacking ..." );

        await this.eventOnStartValidation( "onStartRollback", this._bufferRequest.length );
        await DSDatabase.Thread( this, this.rollbackIterable(), db => {
            db.eventOnValidation( "onRollback" );
        } ).then( handleEndRollback( this ) );
    }

    // ------------------------------------- FROM HUB -------------------------------------

    /**
     * Called on the connection or disconnection of the client to the server
     * @param {any} oldStatus old status of the connection
     * @param {any} newStatus new status of the connection
     * @param {any} errors list of errors during the connection process
     */
    async onStatusChanged ( oldStatus, newStatus, errors ) {
        function handleInitializing( db ) {
            return async function ( schema ) {
                await db.initialize( schema );
            };
        }

        function handleError( db, status ) {
            return function (e) {
                db.exception( "Connexion error on " + status + " protocol", e );
                db.updateStatus( "Error", new Errors( "ERR_CONNECTION" ), status === "synchronizing" );
            };
        }

        if ( newStatus === "Started" && this._status === "NotInitialized" ) {
            // The connection is done ... retrieve the database schema

            this.info( "The connection is done with the server ... retrieving the database schema ..." );
            this.updateStatus( "Initializing" );

            await Hub.Instance.initialize( this._areaName, this._areaModuleId ).then( handleInitializing( this ) ).catch( handleError( this, "initializing" ) );
        } else if ( newStatus === "Started" && this._status === "ReadyToSynchronize" ) {
            this.info( "Starting the synchronization process ..." );

            // Stop the heartbeat until the end of synchronization

            DSDatabase.Heartbeat();
            this.onStartProgress();
            this.onProgress( 0, 1, "MSG_SYNCHRONIZING" );

            // define a new database instance to make the synchronization

            this._hubDatabase = new DSDatabase( "DSSynchronization", this );
            this._hubDatabase._areaName = this._areaName;
            this._hubDatabase._areaModuleId = this._areaModuleId;

            await Hub.Instance.initialize( this._hubDatabase._areaName, this._hubDatabase._areaModuleId )
                .then( handleInitializing( this._hubDatabase ) )
                .catch( handleError( this._hubDatabase, "synchronizing", true ) );
        } else if ( newStatus === "ReadyToSynchronize" ) {
            this.info( "The server and the client were disconnected a while ... You can launch the synchronization process as you want ..." );
            this.updateStatus( "ReadyToSynchronize" );
        } else if ( newStatus === "Error" ) {
            this.error( "Connexion error on initializing protocol" );
            this.updateStatus( "Error", errors );
        }
    }

    /**
     * Called on acknowledging the request
     * @param {any} requestId id of the request acknowledged
     * @param {any} area      area concerned by this request
     * @param {any} table     table name
     * @param {any} action    action name "Create", "Update", "Delete", ...
     * @param {any} record    record acknowledged (the content depends on the action)
     * @param {any} identity  identities of the record acknowledged  (the content depends on the action)
     * @param {any} error     error status on the acknowledgment
     */
    async acknowledgeRequest( requestId, area, table, action, record, identity, error ) {
        // Analyze the result

        if ( error !== null && error !== undefined ) {
            let dbRequest = this._requestsByRequestId[requestId];

            let errors = new Errors();
            errors.setJSON( error.Error );

            // The request hasn't been executed ... an error occurs during the request execution

            this.warn( "[" + requestId + "] The request can't have been executed due to some errors (" + errors.toString() + ")" );

            // Notify the user that something is wrong!

            await this.eventOnNotify( "*", -1, dbRequest.label, errors );

            // Data are updated into the DSDatabase and if an error occurs, Database hasn't been updated
            // So, rollback data into DSDatabase to be synchronized with the database

            this.rollbackRequest( dbRequest );
            this.deleteRequest( requestId );
            return;
        }

        if ( this._status !== "ReadyToSynchronize" && this._status !== "Running" ) {
            this.info( "The acknowledge of the request '" + requestId + "' for ('" + area + "', '" + table + "', '" + action + "', " + String.JSONStringify( record ) + ", " + String.JSONStringify( identity ) + ") is buffering because the database is not yet ready" );
            this._bufferNotifications.push( { requestId: requestId, area: area, table: table, action: action, record: record, identity: identity } );
            return;
        }

        this.info( "Acknowledging of the request '" + requestId + "' for ('" + area + "', '" + table + "', '" + action + "', " + String.JSONStringify( record ) + ", " + String.JSONStringify( identity ) + ")" );
        this.updateFromServer( table, action === "Update" ? record.New : record, action === "Update" ? identity.New : identity );
        this.deleteRequest( requestId );
    }

    /**
     * Called on acknowledging the transaction
     * @param {any} requestId   id of the request acknowledged
     * @param {any} area        area concerned by this request
     * @param {any} transaction transaction acknowledged
     * @param {any} error     error status on the acknowledgment
     */
    async acknowledgeTransaction ( requestId, area, transaction, error ) {
        // Analyze the result

        if ( error !== null && error !== undefined ) {
            let dbRequest = this._requestsByRequestId[requestId];

            let errors = new Errors();
            errors.setJSON( error.Error );

            // The request hasn't been executed ... an error occurs during the request execution

            this.warn( "[" + requestId + "] The transaction can't have been executed due to some errors (" + errors.toString() + ")" );

            // Notify the user that something is wrong!

            await this.eventOnNotify( "*", -1, dbRequest.label, errors );

            // Data are updated into the DSDatabase and if an error occurs, Database hasn't been updated
            // So, rollback data into DSDatabase to be synchronized with the database

            this.rollbackRequest( dbRequest );
            this.deleteRequest( requestId );
            return;
        }

        transaction = this.uncompressTransaction( transaction );

        if ( this._status !== "ReadyToSynchronize" && this._status !== "Running" ) {
            this.info( "The acknowledge of the transaction '" + requestId + "' for ('" + area + "', " + String.JSONStringify( transaction ) + ") is buffering because the database is not yet ready" );
            this._bufferNotifications.push( { requestId: requestId, area: area, transaction: transaction } );
            return;
        }

        this.info( "Acknowledging of the transaction '" + requestId + "' for ('" + area + "', " + String.JSONStringify( transaction ) + ")" );

        function* transactionIterable( db, transaction ) {
            for ( let request of transaction ) {
                if ( db.IsVerboseAll )
                    db.verbose( "Acknowledging of the request for ('" + area + "', '" + request.table + "', '" + request.action + "', " + String.JSONStringify( request.record ) + ", " + String.JSONStringify( request.identity ) + ")" );

                db.updateFromServer( request.table,
                    request.action === "Update" ? request.record.New : request.record,
                    request.action === "Update" ? request.identity.New : request.identity );

                yield true;
            }
        }

        await DSDatabase.Thread( this, transactionIterable( this, transaction ) ).then( () => this.deleteRequest( requestId ) );
    }

    /**
     * Called on the beginning of notification
     * @param {any} tick  tick of the beginning of the notification
     * @param {any} label label to show to the end-user
     */
    async beginNotification ( tick, label ) {
        if ( this._status !== "Running" )
            return;

        this.info( "Begin of notification (" + tick + ", " + String.JSONStringify( label ) + ")" );
        await this.eventOnBeginNotification( tick, label );
    }

    /**
     * Called on a notification that something has changed
     * @param {any} userId id of the user having changed something
     * @param {any} label  label to show to the end-user to described the nature of the modification
     * @param {any} area   area concerned
     * @param {any} table  table name concerned
     * @param {any} record record updated
     */
    async notify ( userId, label, area, table, record ) {
        if ( this._status !== "Running" ) {
            this.info( "The notification of the update from the user '" + userId + "' for ('" + area + "', '" + table + "', " + String.JSONStringify( record ) + " is buffering because the database is not yet ready" );
            this._bufferNotifications.push( { userId: userId, area: area, table: table, record: record } );
            return;
        }

        this.info( "Notifying an update from the user '" + userId + "' for ('" + area + "', '" + table + "', " + String.JSONStringify( record ) );
        await this.eventOnNotify( table, record._tick, label );

        this.updateFromServer( table, record );
    }

    /**
     * Called on the ending of notification
     * @param {any} tick  tick of the ending of the notification
     * @param {any} label label to show to the end-user
     */
    async endNotification ( tick, label ) {
        if ( this._status !== "Running" )
            return;

        this.info( "End of notification (" + tick + ", " + String.JSONStringify( label ) + ")" );
        await this.eventOnEndNotification( tick, label );
    }

    // ------------------------------------- DatabaseManager -------------------------------------

    /**
     * Update the status of the DS Database and notify the listener
     * @param {any} newStatus new status of the connection
     * @param {any} errors    list of errors during the connection process
     * @param {any} retry     true or false describing if the reconnection must be done again
     */
    updateStatus ( newStatus, errors, retry ) {
        if ( this._status === "Error" )
            return;

        this.info( "The status becomes '" + newStatus + "'" );

        let oldStatus = this._status;
        this._status = newStatus;
        this._statusErrors = errors;

        if ( this._areaInstance && this._areaInstance.onStatusChanged )
            this._areaInstance.onStatusChanged( oldStatus, this._status, this._statusErrors );

        if ( this._hubMaster === null || this._status !== "Error" )
            return;

        // The synchronization process has failed

        this.warn( "The synchronization process has failed!" );

        if ( retry === undefined )
            retry = false;

        if ( Hub.Instance.IsRunning ) {
            this.warn( "The server is up ..." );

            if ( !retry ) {
                this.error( "Unable to fix the issue on launching again a new synchronization ... Reload the page!" );
                this._hubMaster.updateStatus( this._status, this._statusErrors );
                return;
            }

            this.warn( "On launching again a new synchronization, you can resolv the issue ... Try it again!" );
            Hub.Instance.updateStatus( "ReadyToSynchronize" );
        } else {
            this.warn( "The server is down ... The synchronization is not complete! Try it again!" );
        }

        this._hubMaster._hubDatabase = null;

        // Start the heartbeat

        DSDatabase.Heartbeat( this._hubMaster, this._hubMaster._hubInterval );
    }

    /**
     * Replace the serverId corresponding to the clientId by server (on receiving the serverId after acknopwledging a creation)
     * @param {any} foreignKeyTable table name of the foreign key
     * @param {any} clientId        id of the record corresponding to the identity of the record from the client
     * @param {any} serverId        id of the record corresponding to the record from the server
     */
    updateServerId( foreignKeyTable, clientId, serverId ) {
        if ( this.IsVerboseAll )
            this.verbose( "Updating all tables having a foreign key ('" + foreignKeyTable + "', [" + clientId + "]) by this new server Id [" + serverId + "] ..." );

        for ( let table of Array.toIterable( this._tables ) )
            table.updateServerId( foreignKeyTable, clientId, serverId );
    }

    /**
     * Update all tables having a foreign key towards the oldClientId and replace it by newClientId
     * This situation is possible when the acknowledge arrives after the creation of a new record (after a disconnection period)
     * @param {any} foreignKeyTable table name of the foreign key
     * @param {any} oldClientId     client identity of the record to replace
     * @param {any} newClientId     new client identity of the record
     */
    updateClientId ( foreignKeyTable, oldClientId, newClientId ) {
        if ( this.IsVerboseAll )
            this.verbose( "Updating all tables having a foreign key ('" + foreignKeyTable + "', [" + oldClientId + "]) by this client Id [" + newClientId + "] ..." );

        for ( let table of Array.toIterable( this._tables ) )
            table.updateClientId( foreignKeyTable, oldClientId, newClientId );
    }

    /**
     * Define the schema on depends on server response
     * @param {any} schema schema to instanciate defined by the server to the client
     */
    async initialize ( schema ) {
        let errors = null;
        this.info( "Schema received: " + String.JSONStringify( schema ) );

        // error ?

        if ( schema.Error ) {
            errors = new Errors();
            errors.setJSON( schema.Error );
            this.error( "The schema can't be loaded due to " + errors.toString() );
            this.updateStatus( "Error", errors );
            return;
        }

        if ( !schema.Schema ) {
            this.error( "The schema is missing" );
            errors = new Errors( "ERR_SCHEMA" );
            this.updateStatus( "Error", errors );
            return;
        }

        // no error ... read data and build the structure

        this._version = schema.Version;
        this.info( "Database version = " + this._version );

        if ( this._hubMaster !== null && this._hubMaster._version !== this._version ) {
            // In case of resynchronization, check if the database version is the same ...
            this.updateStatus( "Error", new Errors( "ERR_UNABLE_SYNCHRONIZATION" ) );
            return;
        }

        this._parameters = schema.Parameters;
        this.info( "Database parameters = " + String.JSONStringify( this._parameters ) );

        // extract some parameters information

        if ( this._parameters["Hub.MaxSize"] !== null && this._parameters["Hub.MaxSize"] !== undefined ) {
            let maxSize = parseInt( this._parameters["Hub.MaxSize"] );
            if ( !isNaN( maxSize ) && maxSize > 0 )
                this._maxSize = maxSize * 1024;
        }
        this.info( "Max size in the queue = " + this._maxSize + " octets" );

        if ( this._parameters["Hub.Timeout"] !== null && this._parameters["Hub.Timeout"] !== undefined ) {
            let timeout = parseInt( this._parameters["Hub.Timeout"] );
            if ( !isNaN( timeout ) && timeout > 0 )
                this._hubInterval = Math.floor((timeout / 5) * 3);
        }
        this.info( "Interval between 2 checks of reconnection = " + this._hubInterval + " secondes" );

        this._defaultLanguage = schema.DefaultLanguage;
        this.info( "Default language = " + this._defaultLanguage );

        this._currentUserId = schema.CurrentUserId;
        this.info( "Current user id = " + this._currentUserId );

        this._currentModuleId = schema.CurrentModuleId;
        this.info( "Current module id = " + this._currentModuleId );

        this._lastRequestId = schema.LastRequestId;
        this.info( "The last request Id treated by the server is " + this._lastRequestId );

        // declare all tables

        let tableToLoad = [];
        let indexTable = 0;
        for ( let table in schema.Schema ) {
            this._tables[table] = new DSTable( this, indexTable, schema.Schema[table] );
            tableToLoad.push( table );
            indexTable++;
        }

        // Foreign keys need the definition of all tables before looking for an external table

        for ( let table of Array.toIterable( this._tables ) )
            table.updateForeignKeys();

        // Loading records for each table in asynchronous mode

        this.updateStatus( "Loading" );

        // Load data for every tables + notify the loading for every data + 3 steps on resynchronizing process

        this.onProgress( 0, tableToLoad.length + ( this._hubMaster !== null ? 3 : 0 ) );
        this.onProgressMemory();

        // Update the table content

        function handleErrorLoadingTable( db, retry ) {
            return function () {
                db.error( "Connexion error on loading data" );
                db.updateStatus( "Error", new Errors( "ERR_CONNECTION" ), retry );
                return false;
            };
        }

        function handleLoadingTable( db ) {
            return async function ( data ) {
                let errors = null;

                if ( db.IsDebug )
                    db.debug( "Data received: " + String.JSONStringify( data ) );

                // error ?

                if ( data.Error ) {
                    errors = new Errors();
                    errors.setJSON( data.Error );
                    db.error( "The records can't be loaded due to " + errors.toString() );
                    db.updateStatus( "Error", errors );
                    return false;
                }

                if ( !data.Records || !data.Table ) {
                    db.error( "The records are missing" );
                    errors = new Errors( "ERR_CONNECTION" );
                    db.updateStatus( "Error", errors );
                    return false;
                }

                // update the list of records

                let result = await db._tables[data.Table].setTable( data.Records, data.LastSequenceId );
                if ( !result ) {
                    db.error( "The table is not correctly loaded!" );
                    errors = new Errors( "ERR_CONNECTION" );
                    db.updateStatus( "Error", errors );
                    return false;
                }

                // Update progress bar

                db.onProgress();
                return true;
            };
        }

        function launchHeartbeat( db, endOfLoading ) {
            return function () {
                db.onStopProgress( endOfLoading );
                DSDatabase.Heartbeat( db, db._hubInterval );
            };
        }

        function* fnOnLoading( db ) {
            db.onProgress( 0, db._tables.length, "MSG_LOADING" );
            yield true;

            for ( let table in db._tables ) {
                db.eventOnLoad( table );
                db.onProgress();
                yield true;
            }
        }

        function* fnSynchronizeStep1( db ) {
            db.info( "The database schema is compatible with the database synchronized" );
            db.info( "Now, replaying all requests into the database manager into the new database ..." );

            // Replay requests and update requests (identity)

            db.onProgress();
            yield true;

            db.replayRequests( db._hubMaster );
            yield true;

            db.onProgress();
            yield true;

            // Replace table data into the database manager

            db.info( "Replacing all existing data by the result of the synchronisation ..." );

            for ( let table in db._tables ) {
                db._hubMaster._tables[table] = db._tables[table];
                db._hubMaster._tables[table].setDatabase( db._hubMaster );
                db._hubMaster._tables[table].updateForeignKeys( true );
                yield true;
            }

            db.onProgress();
            yield true;
        }

        function* fnSynchronizeStep2( db ) {
            if ( db._hubMaster._bufferNotifications.length > 0 ) {
                db._hubMaster.info( "Executing all acknowledges and notifications buffered during the synchronization process ..." );

                let previousNotifications = db._hubMaster._bufferNotifications;
                db._hubMaster._bufferNotifications = [];

                for ( let notification of previousNotifications ) {
                    if ( notification.requestId !== null && notification.requestId !== undefined ) {
                        db._hubMaster.info( "Acknowledging of the request buffered '" + notification.requestId + "' for ('" + notification.area + "', '" + notification.table + "', '" + notification.action + "', " + String.JSONStringify( notification.record ) + ", " + String.JSONStringify( notification.identity ) );

                        db._hubMaster.updateFromServer( notification.table,
                            notification.action === "Update" ? notification.record.New : notification.record,
                            notification.action === "Update" ? notification.identity.New : notification.identity );

                    } else if ( notification.userId !== null && notification.userId !== undefined ) {
                        db._hubMaster.info( "Notifying an update buffered from the user '" + notification.userId + "' for ('" + notification.area + "', '" + notification.table + "', " + String.JSONStringify( notification.record ) );

                        db._hubMaster.updateFromServer( notification.table, notification.action === "Update" ? notification.record.New : notification.record );
                    }

                    yield true;
                }
            }

            // Raise onLoad on all tables

            for ( let table in db._hubMaster._tables ) {
                db._hubMaster.eventOnLoad( table );
                db.onProgress();
                yield true;
            }
        }

        let allLoaded = true;
        for ( let table of tableToLoad ) {
            let setTableOK = await Hub.Instance.loadTable( table )
                                        .then( handleLoadingTable( this ) )
                                        .catch( handleErrorLoadingTable( this, this._hubMaster !== null ) );

            if ( !setTableOK ) {
                allLoaded = false;
                break;
            }
        }

        // finalize the loading table

        if ( !allLoaded )
            return;

        // Update the list of unique values

        for ( let table of Array.toIterable( this._tables ) )
            table.updateUniqueAndIndexValues();

        // all tables are loaded ...

        this.updateStatus( "Loaded" );

        // enable the interval between 2 tries of reconnection

        if ( this._hubMaster === null ) {
            // It's DSDatabase.Instance ...

            // Treat all notifications waiting initializing process

            if ( this._bufferNotifications.length > 0 ) {
                this.info( "Executing all acknowledges and notifications buffered during the initialization process ..." );

                for ( let notification of this._bufferNotifications ) {
                    if ( notification.requestId !== null && notification.requestId !== undefined ) {
                        this.info( "Acknowledging of the request buffered '" + notification.requestId + "' for ('" + notification.area + "', '" + notification.table + "', '" + notification.action + "', " + String.JSONStringify( notification.record ) + ", " + String.JSONStringify( notification.identity ) );

                        this.updateFromServer( notification.table,
                            notification.action === "Update" ? notification.record.New : notification.record,
                            notification.action === "Update" ? notification.identity.New : notification.identity );

                    } else if ( notification.userId !== null && notification.userId !== undefined ) {
                        this.info( "Notifying an update buffered from the user '" + notification.userId + "' for ('" + notification.area + "', '" + notification.table + "', " + String.JSONStringify( notification.record ) );

                        this.updateFromServer( notification.table, notification.action === "Update" ? notification.record.New : notification.record );
                    }
                }

                this._bufferNotifications = [];
            }

            // all notifications are treated ... the application is ready

            launchHeartbeat( this, true )();

            // Raise onLoad on all tables

            await GUI.Box.Progress.Thread( fnOnLoading(this), 1, false, false );

            this.updateStatus( "Running" );
            return;
        } 

        this.info( "The schema and tables are loaded ... Synchronizing database manager ..." );

        // Check if the database schema is the same as the database loaded

        for ( let table in this._tables ) {
            if ( this._hubMaster._tables[table] === null || this._hubMaster._tables[table] === undefined ) {
                this.updateStatus( "Error", new Errors( "ERR_UNABLE_SYNCHRONIZATION" ) );
                return;
            }
        }

        for ( let table in this._hubMaster._tables ) {
            if ( this._tables[table] === null || this._tables[table] === undefined ) {
                this.updateStatus( "Error", new Errors( "ERR_UNABLE_SYNCHRONIZATION" ) );
                return;
            }
        }

        for ( let table in this._tables ) {
            if ( !this._tables[table].hasSameStructure( this._hubMaster._tables[table] ) ) {
                this.updateStatus( "Error", new Errors( "ERR_UNABLE_SYNCHRONIZATION" ) );
                return;
            }
        }

        // Synchronize the data

        await GUI.Box.Progress.Thread( fnSynchronizeStep1( this ), 1, false, false ).then( async () => {
            // Replace requests

            this._hubMaster._requestsByRequestId = this._requestsByRequestId;
            this._hubMaster._bufferRequestSent = this._bufferRequestSent;
            this._hubMaster._bufferRequest = this._bufferRequest;
            this._hubMaster._bufferNotifications = this._bufferNotifications;

            // Update some properties

            this._hubMaster._version = this._version;

            this._hubMaster._currentSize = this._currentSize;
            this._hubMaster._maxSize = this._maxSize;
            this._hubMaster._parameters = this._parameters;
            this._hubMaster._defaultLanguage = this._defaultLanguage;
            this._hubMaster._currentUserId = this._currentUserId;
            this._hubMaster._lastRequestId = this._lastRequestId;

            // Reconnection setup

            this._hubMaster._hubInterval = this._hubInterval;

            // Destroy the database synchronized

            this._hubMaster._hubDatabase = null;

            // Treat all notifications waiting initializing process

            await GUI.Box.Progress.Thread( fnSynchronizeStep2( this ), 1, false, false ).then( async () => {
                this._hubMaster.onProgressMemory();

                this._hubMaster.updateStatus( "Running" );

                await this._hubMaster.sendRequests().then( launchHeartbeat( this._hubMaster, true ) ).catch( launchHeartbeat( this._hubMaster, false ) );
            } );
        } );
    }

    /**
     * Retrieve all existing records of the table from the database
     * @param {any} table table name
     * @returns {array} array of records
     */
    getTable ( table ) {
        try {
            return this._tables[table].getTable();
        } catch ( e ) {
            this.exception( "An exception occurs on reading data from the table '" + table + "'", e );
            return [];
        }
    }

    /**
     * Execute a function on each row present into the table
     * @param {any} table       table name
     * @param {any} fnIteration function to call on each record
     * @returns {boolean} true if no exception raised while reading the table
     */
    each ( table, fnIteration ) {
        try {
            this._tables[table].each( fnIteration );
            return true;
        } catch ( e ) {
            return false;
        }
    }

    /**
     * Create a record within default value stored into the table
     * @param {any} table table name
     * @returns {DSRecord} an empty record within properties and default values
     */
    getNewRow ( table ) {
        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        let currentRecord = currentTable.NewRow;
        if ( currentRecord.CustomerId !== undefined )
            currentRecord.CustomerId = this.CurrentCustomer.Id;

        return currentRecord;
    }

    /**
     * Get the record corresponding to a given id into a table
     * @param {any} table table name
     * @param {any} id    id of the record to retrieve
     * @returns {DSRecord} record corresponding to this id or null
     */
    getRowById ( table, id ) {
        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        return currentTable.getRowById( id );
    }

    /**
     * Retrieve the client Id of an object by its server id
     * @param {any} table table name
     * @param {any} id    identity of the record from the server
     * @returns {int} identity of the record from the client or null
     */
    getClientIdByServerId ( table, id ) {
        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        return currentTable.getClientIdByServerId( id );
    }

    /**
     * Retrieve the server Id of an object by its client id
     * @param {any} table table name
     * @param {any} id    identity of the record from the client
     * @returns {int} identity of the record from the server or null
     */
    getServerIdByClientId ( table, id ) {
        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        return currentTable.getServerIdByClientId( id );
    }

    /**
     * Retrieve the sequence description
     * @param {any} table table name to look for
     * @returns {{Property, Key, Length}} sequence description or null
     */
    getSequence(table) {
        // looking for the table

        let currentTable = this._tables[table];
        if (currentTable === null || currentTable === undefined)
            return null;

        return currentTable.Sequence;
    }

    /**
     * Retrieve the column into the given table
     * @param {any} table  table name
     * @param {any} column column name
     * @returns {any} column description or null
     */
    getColumn( table, column ) {
        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        return currentTable.getColumn( column );
    }

    /**
     * Retrieve the list of foreign keys of a given table
     * @param {any} table name of the table to ask
     * @returns {any} list of fields having a foreign key [key] = 'table'
     */
    getForeignKeys( table ) {
        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return {};

        return currentTable.getForeignKeys();
    }

    /**
     * Retrieve the label (for multilingual dictionary) of the column into the given table
     * @param {any} table  table name
     * @param {any} column column name
     * @returns {any} multilingual label of the column
     */
    getColumnLabel ( table, column ) {
        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        return currentTable.getColumnLabel( column );
    }

    /**
     * Retrieve the list of enumerables values of a given column
     * @param {any} table  table name
     * @param {any} column column name
     * @param {any} value  defined if you want to have the enumerable value corresponding to the value, undefined if you want to have the list of enumerable values
     * @returns {any} the enumerable value or the list of enumerable values
     */
    getEnumerable ( table, column, value ) {
        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return value === undefined ? [] : value;

        return currentTable.getEnumerable( column, value );
    }

    /**
     * Retrieve the date and time format of the column
     * @param {any} table  table name
     * @param {any} column column name
     * @returns {string} Date and time format string in Javascript
     */
    getDatetimeFormat ( table, column ) {
        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        return currentTable.getDatetimeFormat( column );
    }

    /**
     * Retrieve the default value of a column
     * @param {any} table  table name
     * @param {any} column column name
     * @returns {any} default value of the given column
     */
    getDefaultValue ( table, column ) {
        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        return currentTable.getDefaultValue( column );
    }

    /**
     * Retrieve the history value for a given column
     * @param {any} table table name (without starting with History)
     * @param {any} column column name
     * @param {any} value current value
     * @returns {any} structure {Id, HistoryId} describing the field having a history property
     */
    getHistoryValue( table, column, value ) {
        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        return currentTable.getHistoryValue( column, value );
    }

    /**
     * Retrieve the last history element added into the database for an existing record
     * @param {any} table table of the element to look for
     * @param {any} id    id of the record to look for
     * @returns {int} last history id known of the element
     */
    getLastHistoryId( table, id ) {
        // looking for the table

        let currentTable = this._tables["History" + table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        return currentTable.getLastHistoryId( id );
    }

    /**
     * Retrieve the list of records Ids matching within the keys
     * @param {any} table table name
     * @param {any} column column name
     * @param {any} keys structure containing the list of keys and values looking for
     * @returns {Array} array of ids or null if the index doesn't exist
     */
    getIndex( table, column, keys ) {
        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        return currentTable.getIndex( column, keys );
    }

    /**
     * Retrieve the list of different values of this column
     * @param {any} table table name
     * @param {any} column column name
     * @returns {Array} list of different values
     */
    getValues( table, column ) {
        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        return currentTable.getValues( column );
    }

    /**
     * Update all history properties on depends on the current value
     * @param {any} table table name
     * @param {any} item  item to update
     * @returns {any} item updated
     */
    updateHistoryProperties( table, item ) {
        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        return currentTable.updateHistoryProperties( item );
    }

    /**
     * Convert value into the type of the column
     * @param {any} table         table name
     * @param {any} column        column name
     * @param {any} value         value to convert
     * @param {any} nullableCheck check if the value is null or not
     * @returns {any} value converted to the type of the column
     */
    convertValue ( table, column, value, nullableCheck ) {
        if ( nullableCheck === undefined )
            nullableCheck = true;

        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return value;

        return currentTable.convertValue( column, value, nullableCheck );
    }

    /**
     * Check properties set into the record on depends on the table definition
     * (no update database, just check and convert)
     * @param {any} table  table name
     * @param {any} record record to check
     * @param {any} errors container of errors in case of abnormal value into the record
     * @returns {DSRecord} record within all properties checked and converted
     */
    checkProperties ( table, record, errors ) {
        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return record;

        return currentTable.checkProperties( record, errors );
    }

    /**
     * Initialize the database manager
     */
    async start () {
        if ( this._status !== "NotInitialized" )
            return;

        this.onStartProgress();
        this.onProgress( 0, 1, "MSG_INITIALIZING" );

        this.info( "Connecting to the server ..." );
        Hub.Instance.addListener( this.Module, this );
        await Hub.Instance.start();
    }

    /**
     * Add a new record into the given table from the client side
     * @param {any} table  table name
     * @param {any} record record to add
     * @param {any} errors container of errors in case of abnormal value into the record
     * @returns {DSRecord} record added
     */
    addFromClient ( table, record, errors ) {
        if ( this.IsVerbose )
            this.verbose( "Adding the record " + String.JSONStringify( record ) + " from the client into the table '" + table + "' ..." );

        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined ) {
            this.error( "The table '" + table + "' doesn't exist!" );
            errors.addFatal( "ERR_REQUEST_UNKNOWN" );
            return null;
        }

        // add a new row into the given table

        return currentTable.addFromClient( record, errors );
    }

    /**
     * Update an existing record into the given table from the client side
     * @param {any} table     table name
     * @param {any} oldRecord record to update
     * @param {any} newRecord new record to update
     * @param {any} errors container of errors in case of abnormal value into the record
     * @returns {DSRecord} record updated
     */
    updateFromClient( table, oldRecord, newRecord, errors ) {
        if ( this.IsVerbose )
            this.verbose( "Updating the record " + String.JSONStringify( oldRecord ) + " to " + String.JSONStringify( newRecord ) + " from the client into the table '" + table + "' ..." );

        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined ) {
            this.error( "The table '" + table + "' doesn't exist!" );
            errors.addFatal( "ERR_REQUEST_UNKNOWN" );
            return null;
        }

        // update a row into the given table

        return currentTable.updateFromClient( oldRecord, newRecord, errors );
    }

    /**
     * Create, update or delete a record notified by the server
     * @param {any} table    table name
     * @param {any} record   record updated by the server
     * @param {any} identity identity of the record updated by the server
     * @returns {DSRecord} record updated
     */
    updateFromServer( table, record, identity ) {
        if ( this.IsVerbose )
            this.verbose( "Updating the record " + String.JSONStringify( record ) + " from the server into the table '" + table + "' ..." );

        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined ) {
            this.error( "The table '" + table + "' doesn't exist!" );
            return null;
        }

        // update a row into the given table on depends on server record

        return currentTable.updateFromServer( record, identity );
    }

    /**
     * Delete a row into the database without sending the update to the server
     * @param {any} table table name
     * @param {any} id    id of the record to delete
     * @returns {DSRecord} record deleted
     */
    deleteRowById( table, id ) {
        if ( this.IsVerbose )
            this.verbose( "Deleting the row " + id.toString() + " from the client into the table '" + table + "' ..." );

        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined ) {
            this.error( "The table '" + table + "' doesn't exist!" );
            return null;
        }

        // delete a row into the given table

        return currentTable.deleteRowById( id );
    }

    /**
     * Delete an existing record into the given table from the client side
     * @param {any} table  table name
     * @param {any} record record to delete
     * @param {any} errors container of errors in case of abnormal value into the record
     * @returns {DSRecord} record deleted
     */
    deleteFromClient ( table, record, errors ) {
        if ( this.IsVerbose )
            this.verbose( "Deleting the record " + String.JSONStringify( record ) + " from the client into the table '" + table + "' ..." );

        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined ) {
            this.error( "The table '" + table + "' doesn't exist!" );
            errors.addFatal( "ERR_REQUEST_UNKNOWN" );
            return null;
        }

        // delete a row into the given table

        return currentTable.deleteFromClient( record, errors );
    }

    /**
     * Select all sub elements attached to another element (list of records having the column with the expected value)
     * @param {any} table    table name
     * @param {any} column   column name
     * @param {any} id       id of the record to look for
     * @param {any} records  list of previous records found
     * @returns {array} records and all records corresponding to the match
     */
    selectRecordsFromClient ( table, column, id, records ) {
        function handleReadRecord( records, table, column, id ) {
            return function ( record ) {
                if ( record[column] === id )
                    records.push( { table: table, field: column, record: record } );
            };
        }

        let newRecords = records === null || records === undefined ? [] : records;
        this.each( table, handleReadRecord( newRecords, table, column, id ) );
        return newRecords;
    }

    /**
     * Delete all sub elements attached to another element
     * @param {any} records (ex: from selectRecordsFromClient) list of records to delete
     * @param {any} errors  container of errors in case of abnormal value into the record
     */
    deleteRecordsFromClient ( records, errors ) {
        if ( errors.HasError || records === null || records === undefined )
            return;

        for ( let i = 0; i < records.length && !errors.HasError; i++ ) {
            let record = records[i];
            if ( record === null || record === undefined )
                return;

            this.deleteFromClient( record.table, record.record, errors );
        }
    }

    /**
     * Execution of a given request
     * @param {any} table   table name
     * @param {any} request request to send to the server
     * @param {any} record  record to execute
     * @param {any} errors  container of errors in case of abnormal value into the record
     * @param {any} fnDone  function to call on acknowledging the request
     * @returns {any} null
     */
    executeRequest ( table, request, record, errors, fnDone ) {
        this.info( "Executing the request '" + request + "' with the record " + String.JSONStringify( record ) + " from the client into the table '" + table + "' ..." );

        // looking for the table

        let currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined ) {
            this.error( "The table '" + table + "' doesn't exist!" );
            errors.addFatal( "ERR_REQUEST_UNKNOWN" );
            return null;
        }

        // execute the request into a table (and add customerId)

        if ( record.CustomerId === undefined || record.CustomerId === null )
            record.CustomerId = this.CurrentCustomer.Id;

        return currentTable.executeRequest( request, record, errors, fnDone );
    }

    // ------------------------------------- Listeners -------------------------------------

    /**
     * Add a new event listener (to be notified when something changes)
     * fn : on(event, table, id, record) where event can be "onLoad", "onCreate", "onUpdate" and "onDelete"
     * @param {any} event name of the event to raise the function
     * @param {any} table table name or "*" for all
     * @param {any} id    id of the record or "*" for all
     * @param {any} fn    function to raise on the event
     * @returns {string} key of the listener (used it to remove it)
     */
    addEventListener ( event, table, id, fn ) {
        let key = this.NextEventListenerKey;

        if ( event === null || event === undefined )
            event = "*";

        if ( table === null || table === undefined )
            table = "*";

        if ( id === null || id === undefined )
            id = "*";

        this.info( "Create a new listener [" + key + "] on ('" + event + "', '" + table + "', '" + id + "')" );

        // store the reference on the listener to remove it quickly

        this._listeners[key] = { table: table, id: id, event: event, key: key };

        if ( this._eventListeners[event] === null || this._eventListeners[event] === undefined )
            this._eventListeners[event] = {};

        if ( this._eventListeners[event][table] === null || this._eventListeners[event][table] === undefined )
            this._eventListeners[event][table] = {};

        if ( this._eventListeners[event][table][id] === null || this._eventListeners[event][table][id] === undefined )
            this._eventListeners[event][table][id] = {};

        if ( this._eventListeners[event][table][id][key] === null || this._eventListeners[event][table][id][key] === undefined )
            this._eventListeners[event][table][id][key] = fn;

        return key;
    }

    /**
     * Remove an existing event listener (key returned by addEventListener)
     * @param {any} key key of the listener to remove
     */
    removeEventListener ( key ) {
        let currentListener = this._listeners[key];

        if ( currentListener === null || currentListener === undefined )
            return;

        this.info( "Remove the listener [" + key + "] on ('" + currentListener.event + "', '" + currentListener.table + "', '" + currentListener.id + "')" );

        if ( this._eventListeners[currentListener.event] !== null && this._eventListeners[currentListener.event] !== undefined ) {
            if ( this._eventListeners[currentListener.event][currentListener.table] !== null && this._eventListeners[currentListener.event][currentListener.table] !== undefined ) {
                if ( this._eventListeners[currentListener.event][currentListener.table][currentListener.id] !== null && this._eventListeners[currentListener.event][currentListener.table][currentListener.id] !== undefined ) {
                    if ( this._eventListeners[currentListener.event][currentListener.table][currentListener.id][key] !== null && this._eventListeners[currentListener.event][currentListener.table][currentListener.id][key] !== undefined )
                        delete this._eventListeners[currentListener.event][currentListener.table][currentListener.id][key];

                    if ( $.isEmptyObject( this._eventListeners[currentListener.event][currentListener.table][currentListener.id] ) )
                        delete this._eventListeners[currentListener.event][currentListener.table][currentListener.id];
                }

                if ( $.isEmptyObject( this._eventListeners[currentListener.event][currentListener.table] ) )
                    delete this._eventListeners[currentListener.event][currentListener.table];
            }

            if ( $.isEmptyObject( this._eventListeners[currentListener.event] ) )
                delete this._eventListeners[currentListener.event];
        }

        delete this._listeners[key];
    }

    /**
     * Retrieve the list of events to raise on depends on event, table and id
     * @param {any} event event raised
     * @param {any} table table name concerned
     * @param {any} id    id of the record concerned
     * @returns {array} list of functions to call
     */
    getEvents ( event, table, id ) {
        let events = [];

        for ( let eventName in this._eventListeners ) {
            if ( eventName !== "*" && eventName !== event )
                continue;

            for ( let eventTable in this._eventListeners[eventName] ) {
                if ( eventTable !== "*" && eventTable !== table )
                    continue;

                for ( let eventId in this._eventListeners[eventName][eventTable] ) {
                    if ( eventId !== "*" && eventId !== id.toString() )
                        continue;

                    for ( let eventKey in this._eventListeners[eventName][eventTable][eventId] ) {
                        events.push( { key: parseInt( eventKey ), fn: this._eventListeners[eventName][eventTable][eventId][eventKey] } );
                    }
                }
            }
        }

        // order by key ... to respect the order of declaration

        events.sort( function ( a, b ) { return a.key < b.key ? -1 : a.key > b.key ? 1 : 0; } );

        let fnEvents = [];
        for ( let action of events )
            fnEvents.push( action.fn );

        return fnEvents;
    }

    /**
     * Raise onBeginNotification event on the database, the table within or without errors
     * @param {any} tick  tick of the begining of the notification
     * @param {any} label code label to show
     */
    async eventOnBeginNotification ( tick, label ) {
        let events = this.getEvents( "onBeginNotification", "*", "*" );

        for ( let action of events )
            try {
                if ( action.constructor.name === "AsyncFunction" ) {
                    await action( "onBeginNotification", "*", tick, label );
                } else {
                    action( "onBeginNotification", "*", tick, label );
                }
            } catch ( e ) {
                this.exception( "Exception on raising the event 'onBeginNotification'", e );
            }
    }

    /**
     * Raise onNotify event on the database, the table within or without errors
     * @param {any} table  table name
     * @param {any} tick   tick of the notification
     * @param {any} label  code label to show
     * @param {any} errors list of errors to notifiy
     */
    async eventOnNotify ( table, tick, label, errors ) {
        let events = this.getEvents( "onNotify", table, "*" );

        for ( let action of events )
            try {
                if ( action.constructor.name === "AsyncFunction" ) {
                    await action( "onNotify", table, tick, label, errors );
                } else {
                    action( "onNotify", table, tick, label, errors );
                }
            } catch ( e ) {
                this.exception( "Exception on raising the event 'onNotify'", e );
            }
    }

    /**
     * Raise onEndNotification event on the database, the table within or without errors
     * @param {any} tick  tick of the begining of the notification
     * @param {any} label code label to show
     */
    async eventOnEndNotification ( tick, label ) {
        let events = this.getEvents( "onEndNotification", "*", "*" );

        for ( let action of events )
            try {
                if ( action.constructor.name === "AsyncFunction" ) {
                    await action( "onEndNotification", "*", tick, label );
                } else {
                    action( "onEndNotification", "*", tick, label );
                }
            } catch ( e ) {
                this.exception( "Exception on raising the event 'onEndNotification'", e );
            }
    }

    /**
     * Raise onCreate event on the database, the table or a given row
     * @param {any} table table name
     * @param {any} id    id of the record created
     */
    async eventOnCreate ( table, id ) {
        let events = this.getEvents( "onCreate", table, id );

        if ( events.length === 0 )
            return;

        let record = this.getRowById( table, id );

        for ( let action of events )
            try {
                if ( action.constructor.name === "AsyncFunction" ) {
                    await action( "onCreate", table, id, record );
                } else {
                    action( "onCreate", table, id, record );
                }
            } catch ( e ) {
                this.exception( "Exception on raising the event 'onCreate'", e );
            }
    }

    /**
     * Raise onUpdate event on the database, the table or a given row
     * @param {any} table     table name
     * @param {any} id        id of the record updated
     * @param {any} oldRecord previous record updated
     */
    async eventOnUpdate ( table, id, oldRecord ) {
        let events = this.getEvents( "onUpdate", table, id );

        if ( events.length === 0 )
            return;

        let newRecord = this.getRowById( table, id );

        for ( let action of events )
            try {
                if ( action.constructor.name === "AsyncFunction" ) {
                    await action( "onUpdate", table, id, oldRecord, newRecord );
                } else {
                    action( "onUpdate", table, id, oldRecord, newRecord );
                }
            } catch ( e ) {
                this.exception( "Exception on raising the event 'onUpdate'", e );
            }
    }

    /**
     * Raise onDelete event on the database, the table or a given row
     * @param {any} table table name
     * @param {any} id    id of the record deleted
     */
    async eventOnDelete ( table, id ) {
        let events = this.getEvents( "onDelete", table, id );

        if ( events.length === 0 )
            return;

        let record = this.getRowById( table, id );

        for ( let action of events )
            try {
                if ( action.constructor.name === "AsyncFunction" ) {
                    await action( "onDelete", table, id, record );
                } else {
                    action( "onDelete", table, id, record );
                }
            } catch ( e ) {
                this.exception( "Exception on raising the event 'onDelete'", e );
            }
    }

    /**
     * Raise onLoad event on the database or the table
     * @param {any} table table name loaded
     */
    async eventOnLoad ( table ) {
        let events = this.getEvents( "onLoad", table, "*" );

        for ( let action of events )
            try {
                if ( action.constructor.name === "AsyncFunction" ) {
                    await action( "onLoad", table );
                } else {
                    action( "onLoad", table );
                }
            } catch ( e ) {
                this.exception( "Exception on raising the event 'onLoad'", e );
            }
    }

    /**
     * Raise {event} event on the database or the table
     * @param {any} event event to raise
     * @param {any} nbRequests number of requests under validation or rejection
     */
    async eventOnStartValidation( event, nbRequests ) {
        this._commitRunning = true;

        let events = this.getEvents( event, "*", "*" );

        for ( let action of events )
            try {
                if ( action.constructor.name === "AsyncFunction" ) {
                    await action( event, nbRequests );
                } else {
                    action( event, nbRequests );
                }
            } catch ( e ) {
                this.exception( "Exception on raising the event '" + event + "'", e );
            }
    }

    /**
     * Raise {event} event on the database or the table
     * @param {any} event event to raise
     * @param {any} error list of errors on committing or rejection
     */
    async eventOnValidation( event, error ) {
        if ( !this._commitRunning )
            return;

        let events = this.getEvents( event, "*", "*" );

        for ( let action of events )
            try {
                if ( action.constructor.name === "AsyncFunction" ) {
                    await action( event, error );
                } else {
                    action( event, error );
                }
            } catch ( e ) {
                this.exception( "Exception on raising the event '" + event + "'", e );
            }
    }

    /**
     * Raise {event} event on the database or the table
     * @param {any} event event to raise
     */
    async eventOnStopValidation( event ) {
        this._commitRunning = false;

        let events = this.getEvents( event, "*", "*" );

        for ( let action of events )
            try {
                if ( action.constructor.name === "AsyncFunction" ) {
                    await action( event );
                } else {
                    action( event );
                }
            } catch ( e ) {
                this.exception( "Exception on raising the event '" + event + "'", e );
            }
    }

    // ------------------------------------- Synchronization process -------------------------------------

    /**
     * Replay a request (requestId, table, action, record, identity, tick)
     * @param {any} request request to replay on synchronization (update ids)
     * @returns {any} new request
     */
    replayRequest ( request ) {
        let newRequest = {};
        let errors = null;
        let currentTable = null;

        if ( request === null || request === undefined )
            return null;

        errors = new Errors();

        if ( request.transaction !== null && request.transaction !== undefined ) {
            let newTransaction = [];
            let transaction = this.uncompressTransaction( request.transaction );

            for ( let currentRequest of transaction ) {
                currentTable = null;
                if ( currentRequest.table !== null && currentRequest.table !== undefined )
                    currentTable = this._tables[currentRequest.table];

                if ( currentTable === null || currentTable === undefined ) {
                    this.warn( "Unable to replay the request " + String.JSONStringify( currentRequest ) + " because the table doesn't exist" );
                    continue;
                }

                // replay the request into the database

                newRequest = null;
                switch ( currentRequest.action ) {
                    case "Create":
                        newRequest = currentTable.replayCreate( currentRequest.record, currentRequest.identity, currentRequest.tick, errors );
                        break;

                    case "Update":
                        newRequest = currentTable.replayUpdate( currentRequest.record.Old, currentRequest.identity.Old, currentRequest.record.New, currentRequest.identity.New, currentRequest.tick, errors );
                        break;

                    case "Delete":
                        newRequest = currentTable.replayDelete( currentRequest.record, currentRequest.identity, currentRequest.tick, errors );
                        break;

                    default:
                        newRequest = {
                            table: currentRequest.table,
                            action: currentRequest.action,
                            record: currentRequest.record,
                            identity: currentRequest.identity,
                            tick: currentRequest.tick
                        };
                        break;
                }

                // handle the request in case of errors

                if ( newRequest === null || errors.HasError ) {
                    this.warn( "Unable to replay the request " + String.JSONStringify( currentRequest ) + " due to " + errors.toString() );
                    for ( let i = newTransaction.length - 1; i >= 0; i-- )
                        this.rollbackRequest( newTransaction[i] );
                    return null;
                }

                newTransaction.push( newRequest );
            }

            newRequest = { requestId: null, label: request.label, transaction: this.compressTransaction( newTransaction ), notify: request.notify, fnDone: request.fnDone };
        } else {
            if ( request.table !== null && request.table !== undefined )
                currentTable = this._tables[request.table];

            if ( currentTable === null || currentTable === undefined ) {
                this.warn( "Unable to replay the request " + String.JSONStringify( request ) + " because the table doesn't exist" );
                return null;
            }

            // replay the request into the database

            switch ( request.action ) {
                case "Create":
                    newRequest = currentTable.replayCreate( request.record, request.identity, request.tick, errors );
                    break;

                case "Update":
                    newRequest = currentTable.replayUpdate( request.record.Old, request.identity.Old, request.record.New, request.identity.New, request.tick, errors );
                    break;

                case "Delete":
                    newRequest = currentTable.replayDelete( request.record, request.identity, request.tick, errors );
                    break;

                default:
                    newRequest = {
                        requestId: null,
                        table: request.table,
                        action: request.action,
                        record: request.record,
                        identity: request.identity,
                        tick: request.tick,
                        fnDone: request.fnDone
                    };
                    break;
            }

            if ( newRequest !== null && newRequest !== undefined )
                newRequest.label = request.label;
        }

        // handle the request in case of errors

        if ( newRequest === null || errors.HasError ) {
            this.warn( "Unable to replay the request " + String.JSONStringify( request ) + " due to " + errors.toString() );
            return null;
        }

        // the request is ok ... prepare to send it to the server

        newRequest.requestId = this.NextRequestId;

        let requestSize = String.JSONStringify( newRequest ).length;
        this._currentSize += requestSize;

        this.info( "The request " + String.JSONStringify( newRequest ) + " has been replayed (size: " + requestSize + " octets) ..." );
        this.onProgressMemory();

        return newRequest;
    }

    /**
     * All requests from "from" are replayed into the database
     * @param {any} from DSDatabase instance having a list of requests to replay
     */
    replayRequests ( from ) {
        this.info( "Replaying requests ..." );

        this._requestsByRequestId = {};
        this._bufferRequestSent = [];
        this._bufferRequest = [];
        this._bufferNotifications = [];

        // 1. Replay requests by requestId because this request was sent to the server and the client waiting for an acknowledge

        // Sort keys by ascending

        let keys = [];
        for ( let requestId in from._requestsByRequestId )
            keys.push( requestId );
        keys.sort( function ( a, b ) { return a < b ? -1 : ( a > b ? 1 : 0 ); } );

        // Put the requests already sent into the list of requests to send

        let buffer = [];
        let i = 0, j = 0;
        let request = null;
        for ( i = 0; i < keys.length; i++ ) {
            if ( keys[i] <= this._lastRequestId ) {
                this.info( "Ignore the request [" + keys[i] + "] because already treated by the server" );
                continue;
            }

            request = this.replayRequest( from._requestsByRequestId[keys[i]] );

            if ( request !== null && request !== undefined )
                buffer.push( request );
        }

        // 2. Replay requests in the buffer sent

        for ( i = 0; i < from._bufferRequestSent.length; i++ ) {
            for ( j = 0; j < from._bufferRequestSent[i].length; j++ ) {
                request = this.replayRequest( from._bufferRequestSent[i][j] );

                if ( request !== null && request !== undefined )
                    buffer.push( request );
            }
        }
        this._bufferRequestSent.push( buffer );

        this.info( buffer.length + " requests to send to the server" );

        // 3. Replay requests not yet send

        for ( i = 0; i < from._bufferRequest.length; i++ ) {
            request = this.replayRequest( from._bufferRequest[i] );

            if ( request !== null && request !== undefined )
                this._bufferRequest.push( request );
        }

        this.info( this._bufferRequest.length + " requests in waiting to send to the server" );

        // 4. Rebuild the notifications in case of identity

        // from._bufferNotifications doesn't contain the same structure as a previous request
        // from._bufferNotifications.push({ requestId: requestId, area: area, table: table, action: action, record: record, identity: identity });
        // from._bufferNotifications.push({ userId: userId, area: area, table: table, record: record });

        for ( i = 0; i < from._bufferNotifications.length; i++ ) {
            if ( from._bufferNotifications[i].transaction !== undefined && from._bufferNotifications[i].transaction !== null ) {
                request = [];

                for ( j = 0; j < from._bufferNotifications[i].transaction.length; j++ ) {
                    if ( from._bufferNotifications[i].transaction[j].identity !== undefined && from._bufferNotifications[i].transaction[j].identity !== null )
                        request.push( from._bufferNotifications[i].transaction[j] );
                }

                if ( request.lenth > 0 )
                    this._bufferNotifications.push( request );
            } else if ( from._bufferNotifications[i].identity !== undefined && from._bufferNotifications[i].identity !== null ) {
                this._bufferNotifications.push( from._bufferNotifications[i] );
                continue;
            }

            // Ignore all notifications from myself because the database already contains the update ...
        }

        this.info( this._bufferNotifications.length + " notifications waiting the end of initialization" );
    }

    /**
     * Constructor of the singleton
     * @param {any} logName module name into the log file (defined for DSSynchronization)
     * @param {any} master  reference on the DSDatabase instance "master" (defined for DSSynchronization)
     */
    constructor( logName, master ) {
        super( logName === undefined ? "DSDatabase" : logName );

        this._areaName = null;
        this._areaInstance = null;
        this._areaModuleId = -1;
        this._status = "NotInitialized";
        this._statusErrors = null;

        // database information and structure

        this._version = 0;
        this._tables = {};
        this._parameters = null;

        this._defaultLanguage = "EN";
        this._currentUserId = -1;
        this._currentModuleId = -1;
        this._selectedLanguage = null;
        this._listUsers = undefined;

        // Request information

        this._lastRequestId = 0;
        this._maxSize = 1024 * 1024; // Max Size = 1Mo by default
        this._currentSize = 0;
        this._bufferRequest = [];
        this._bufferRequestSent = [];
        this._requestsByRequestId = {};
        this._bufferNotifications = [];

        // Sequence

        this._sequence = {};

        // Listeners

        this._lastListenerKey = 0;
        this._listeners = {};
        this._eventListeners = {}; // per event, store a list of listeners
        this._commitRunning = false;

        // Transaction handling

        this._bufferTransactionLabel = null;
        this._bufferTransactionNotify = false;
        this._bufferTransaction = null;
        this._bufferTransactionCount = 0;

        // Reconnection setup

        // As DSDatabase.Instance can be used as reference anywhere, we don't change its reference during the synchronization process and the synchronization will be done
        // within a sub DSDatabase.Instance and, as the synchronization is finished, all properties of DSDatabase.Instance is replace by the new one.

        this._hubMaster = master === undefined ? null : master; // reference on the main DSDatabase (this value is null for the DSDatabase.Instance and not null for the synchronization process)
        this._hubInterval = 30;
        this._hubDatabase = null;
    }

    /**
     * @returns {DSDatabase} the instance of the singleton
     */
    static get Instance() {
        if ( !this._instance )
            this._instance = new DSDatabase();

        return this._instance;
    }
}
