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
    /**
     * Check if the hub is available .. if not, it restarts!
     * @param {DSDatabase} database reference on the DSDatabase
     */
    static ReconnectHub( database ) {
        return function () {
            if ( Hub.Instance.IsRunning && !database._commitRunning )
                database.sendRequests();

            if ( !Hub.Instance.IsStopped )
                return;

            database.debug( "The server is disconnected ... Trying to reconnect it ..." );
            Hub.Instance.start();
        };
    }

    /**
     * Define the current area of the application (Administration, Stock, ...)
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

        var currentUser = this.CurrentUser;
        if ( currentUser && currentUser.Language )
            return currentUser.Language;

        return this._defaultLanguage;
    }

    /**
     * Retrieve the current user of the application
     */
    get CurrentUser () {
        var record = {};

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

        var currentUserId = this.getClientIdByServerId( "User", this._currentUserId );
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
        var record = this.getRowById( "Module", this.getClientIdByServerId( "Module", this._currentModuleId ) );

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
        var record = this.getRowById( "Customer", 1 );

        if ( record === null ) {
            // Build the customer current
            record = {};

            record.Id = 0;
            record.Name = "Syncytium Pontchateau";
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
    nextSequence( key, fn ) {
        function handleNextSequence( db, fnDone ) {
            return function ( data ) {
                db.info( "New sequence '" + key + "' = " + String.JSONStringify( data ) );
                fnDone( data.Error !== null && data.Error !== undefined ? data : data.Result.Value );
            };
        }

        if ( this._sequence[key] === null || this._sequence[key] === undefined )
            this._sequence[key] = [];

        if ( this._sequence[key].length > 0 ) {
            fn( this._sequence[key].splice( 0, 1 )[0] );
            return;
        }

        Hub.Instance.executeService( "Sequence", { Key: key }, null, handleNextSequence( this, fn ) );
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
     * Function called when the request is executed by the server
     * @param {any} requestId id of the request
     * @param {any} record    record updated
     * @param {any} errors    list of errors
     */
    handleExecutionRequest ( requestId, record, errors ) {
        var listOfErrors = null;
        var request = this._requestsByRequestId[requestId];

        if ( errors !== null && errors !== undefined ) {
            listOfErrors = new Errors();
            listOfErrors.setJSON( errors );

            // The request hasn't been executed ... an error occurs during the request execution

            var message = "[" + requestId + "] The request can't have been executed due to some errors (" + listOfErrors.toString() + ")";
            this.warn( message );

            // Notify the user that something is wrong!

            this.eventOnNotify( "*", -1, request.label, listOfErrors );

            // Data are updated into the DSDatabase and if an error occurs, Database hasn't been updated
            // So, rollback data into DSDatabase to be synchronized with the database

            this.rollbackRequest( request );

            this.deleteRequest( requestId );
        } else {
            this.debug( "[" + requestId + "] The request has been correctly executed" );
            // the request is already deleted on the acknowledge event
        }

        // Send a new request

        this.eventOnCommit(( listOfErrors && listOfErrors.HasError ) ? listOfErrors : null );
        this.sendRequests();
    }

    /**
     * Remove a request from memory
     * @param {any} requestId Id of the request to remove
     */
    deleteRequest ( requestId ) {
        var request = this._requestsByRequestId[requestId];
        if ( request === null || request === undefined )
            return;

        var currentSize = String.JSONStringify( request ).length;
        this.debug( "Remove the request (" + requestId + ") from the memory (" + currentSize + " octets)" );

        delete this._requestsByRequestId[requestId];
        this._currentSize -= currentSize;

        if ( this._areaInstance && this._areaInstance.progressMemory )
            this._areaInstance.progressMemory( this._currentSize, this._maxSize );
    }

    /**
     * Rollback a request and restore the status of the database just before executing this request
     * @param {any} request request to rollback
     */
    rollbackRequest ( request ) {
        if ( request.transaction !== null && request.transaction !== undefined ) {
            this.info( "Rollbacking the transaction (" + request.requestId + ") ..." );

            // Rollback a transaction from the end to the begin

            for ( var i = request.transaction.length - 1; i >= 0; i-- ) {
                try {
                    this.rollbackRequest( request.transaction[i] );
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

        var currentTable = this._tables[request.table];
        if ( currentTable === null || currentTable === undefined ) {
            this.error( "The table '" + request.table + "' doesn't exist!" );
            return;
        }

        // add a new row into the given table

        currentTable.rollback( request.action, request.record, request.identity, request.tick );
    }

    /**
     * Send all requests sent into the _bufferRequestSent to the server
     */
    sendRequests () {
        if ( this._bufferRequestSent.length === 0 ) {
            this.debug( "No requests to send" );
            this.eventOnStopCommit();
            return;
        }

        // Send all requests one by one

        this.info( "Sending all requests in waiting ..." );

        function handleExecutionRequest( db, request ) {
            return function ( data ) {
                if ( request.fnDone !== null && request.fnDone !== undefined )
                    request.fnDone( data.Record, data.Error );
                db.handleExecutionRequest( data.RequestId, data.Record, data.Error );
            };
        }

        // send the first request available

        var request = this._bufferRequestSent[0][0];

        if ( request !== undefined && request !== null ) {
            this._requestsByRequestId[request.requestId] = request;
        }

        this._bufferRequestSent[0].splice( 0, 1 );
        if ( this._bufferRequestSent[0].length === 0 )
            this._bufferRequestSent.splice( 0, 1 );

        if ( request !== undefined && request !== null ) {
            if ( request.transaction !== null && request.transaction !== undefined ) {
                Hub.Instance.executeTransaction( request.requestId, request.label, request.transaction, handleExecutionRequest( this, request ) );
                if ( this.IsDebug )
                    this.debug( "Transaction " + String.JSONStringify( request ) + " sent" );
            } else {
                Hub.Instance.executeRequest( request.requestId, request.label, request.table, request.action, request.record, request.identity, handleExecutionRequest( this, request ) );
                if ( this.IsDebug )
                    this.debug( "Request " + String.JSONStringify( request ) + " sent" );
            }
        }
    }

    /**
     * Create a new group of requests having a common sense
     * If an error occurs on the transaction, all requests will be rollbacked
     * @param {any} label code label describing the transaction (used by the application to toast a message)
     */
    beginTransaction ( label ) {
        if ( this._bufferTransactionCount=== 0 ) {
            this._bufferTransactionLabel = Helper.Label( label );
            this._bufferTransaction = [];
        }

        this._bufferTransactionCount++;
        this.debug( "Begin transaction [" + this._bufferTransactionCount.toString() + "]" );
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

        if ( this._bufferTransaction.length > 0 ) {
            var newRequest = {
                requestId: this.NextRequestId,
                label: this._bufferTransactionLabel,
                transaction: this._bufferTransaction,
                fnDone: fnDone
            };

            this._bufferRequest.push( newRequest );
            this.info( "The transaction " + String.JSONStringify( newRequest ) + " is buffering ..." );
        }

        this._bufferTransaction = null;
        this._bufferTransactionLabel = null;
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
        var newRequest = {
            table: table,
            action: action,
            record: record,
            identity: identity,
            tick: tick
        };

        if ( this._bufferTransaction !== null ) {
            this._bufferTransaction.push( newRequest );
        } else {
            newRequest.label = Helper.Label( table.toUpperCase() + "_" + action.toUpperCase() + "D_TOAST", action );
            newRequest.requestId = this.NextRequestId;
            newRequest.fnDone = fnDone;
            this._bufferRequest.push( newRequest );
        }

        var requestSize = String.JSONStringify( newRequest ).length;
        this._currentSize += requestSize;

        if ( this._currentSize > this._maxSize ) {
            this.error( "The request " + String.JSONStringify( newRequest ) + " can't be buffered into a transaction because the size '" + this._currentSize + " octets' exceeds '" + this._maxSize + " octets' ..." );
            this.rollbackRequest(newRequest);
            return false;
        }

        if ( this._bufferTransaction !== null )
            this.info( "The request " + String.JSONStringify( newRequest ) + " is buffering into a transaction (size: " + requestSize + " octets) ..." );
        else
            this.info( "The request " + String.JSONStringify( newRequest ) + " is buffering (size: " + requestSize + " octets) ..." );

        if ( this._areaInstance && this._areaInstance.progressMemory )
            this._areaInstance.progressMemory( this._currentSize, this._maxSize );

        return true;
    }

    /**
     * Commit all requests in waiting ... send but not executed ...
     */
    commit () {
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

        if ( !this._commitRunning ) {
            // the database is ready and the connection is up ... 
            // Send the request to the server

            var nbRequests = 0;
            for ( var i = 0; i < this._bufferRequestSent.length; i++ )
                nbRequests += this._bufferRequestSent[i].length;

            this.eventOnStartCommit( nbRequests );
            this.sendRequests();
        }
    }

    /**
     * Cancel all requests in waiting ...
     */
    rollback () {
        if ( this._bufferRequest.length === 0 ) {
            this.debug( "No rollback because the buffer is empty" );
            return;
        }

        this.info( "Rollbacking ..." );

        // rollback request from the end to the start

        var nbRequests = this._bufferRequest.length;
        for ( var i = this._bufferRequest.length - 1; i >= 0; i-- ) {
            var request = this._bufferRequest[i];
            var requestText = String.JSONStringify( request );
            var currentSize = requestText.length;

            this.debug( "Rollback the request " + requestText + " (" + currentSize + " octets)" );
            this.rollbackRequest( request );

            this._currentSize -= currentSize;
        }

        // cleaning up all existing requests

        this._lastRequestId -= nbRequests;
        this._bufferRequest = [];

        if ( this._areaInstance && this._areaInstance.progressMemory )
            this._areaInstance.progressMemory( this._currentSize, this._maxSize );

        this.info( nbRequests + " requests have been rollbacked" );
    }

    // ------------------------------------- FROM HUB -------------------------------------

    /**
     * Called on the connection or disconnection of the client to the server
     * @param {any} status new status of the connection
     * @param {any} errors list of errors during the connection process
     */
    onStatusChanged ( status, errors ) {
        function handleInitializing( db ) {
            return function ( schema ) {
                db.setSchema( schema );
            };
        }

        function handleError( db, retry ) {
            return function () {
                db.error( "Connexion error on initializing protocol" );
                db.updateStatus( "Error", new Errors( "ERR_CONNECTION" ), retry );
            };
        }

        if ( status === "Started" && this._status === "NotInitialized" ) {
            // The connection is done ... retrieve the database schema

            this.info( "The connection is done with the server ... retrieving the database schema ..." );
            this.updateStatus( "Initializing" );

            Hub.Instance.initialize( this._areaName, this._areaModuleId, handleInitializing( this ), handleError( this ) );
        } else if ( status === "Started" && this._status === "ReadyToSynchronize" ) {
            this.synchronize();
        } else if ( status === "ReadyToSynchronize" ) {
            this.info( "The server and the client were disconnected a while ... You can launch the synchronization process as you want ..." );
            this.updateStatus( "ReadyToSynchronize" );
        } else if ( status === "Error" ) {
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
     */
    acknowledgeRequest ( requestId, area, table, action, record, identity ) {
        if ( this._status !== "ReadyToSynchronize" && this._status !== "Running" ) {
            this.info( "The acknowledge of the request '" + requestId + "' for ('" + area + "', '" + table + "', '" + action + "', " + String.JSONStringify( record ) + ", " + String.JSONStringify( identity ) + ") is buffering because the database is not yet ready" );
            this._bufferNotifications.push( { requestId: requestId, area: area, table: table, action: action, record: record, identity: identity } );
            return;
        }

        this.info( "Acknowledging of the request '" + requestId + "' for ('" + area + "', '" + table + "', '" + action + "', " + String.JSONStringify( record ) + ", " + String.JSONStringify( identity ) + ")" );
        this.updateFromServer( table, record, action === "Update" ? identity.New : identity );
        this.deleteRequest( requestId );
    }

    /**
     * Called on acknowledging the transaction
     * @param {any} requestId   id of the request acknowledged
     * @param {any} area        area concerned by this request
     * @param {any} transaction transaction acknowledged
     */
    acknowledgeTransaction ( requestId, area, transaction ) {
        if ( this._status !== "ReadyToSynchronize" && this._status !== "Running" ) {
            this.info( "The acknowledge of the transaction '" + requestId + "' for ('" + area + "', " + String.JSONStringify( transaction ) + ") is buffering because the database is not yet ready" );
            this._bufferNotifications.push( { requestId: requestId, area: area, transaction: transaction } );
            return;
        }

        this.info( "Acknowledging of the transaction '" + requestId + "' for ('" + area + "', " + String.JSONStringify( transaction ) + ")" );
        for ( var i in transaction ) {
            var request = transaction[i];
            if ( request === null || request === undefined )
                continue;

            this.info( "Acknowledging of the request for ('" + area + "', '" + request.table + "', '" + request.action + "', " + String.JSONStringify( request.record ) + ", " + String.JSONStringify( request.identity ) + ")" );
            this.updateFromServer( request.table, request.record, request.action === "Update" ? request.identity.New : request.identity );
        }
        this.deleteRequest( requestId );
    }

    /**
     * Called on the beginning of notification
     * @param {any} tick  tick of the beginning of the notification
     * @param {any} label label to show to the end-user
     */
    beginNotification ( tick, label ) {
        if ( this._status !== "Running" )
            return;

        this.info( "Begin of notification (" + tick + ", " + String.JSONStringify( label ) + ")" );
        this.eventOnBeginNotification( tick, label );
    }

    /**
     * Called on a notification that something has changed
     * @param {any} userId id of the user having changed something
     * @param {any} label  label to show to the end-user to described the nature of the modification
     * @param {any} area   area concerned
     * @param {any} table  table name concerned
     * @param {any} record record updated
     */
    notify ( userId, label, area, table, record ) {
        if ( this._status !== "Running" ) {
            this.info( "The notification of the update from the user '" + userId + "' for ('" + area + "', '" + table + "', " + String.JSONStringify( record ) + " is buffering because the database is not yet ready" );
            this._bufferNotifications.push( { userId: userId, area: area, table: table, record: record } );
            return;
        }

        this.info( "Notifying an update from the user '" + userId + "' for ('" + area + "', '" + table + "', " + String.JSONStringify( record ) );
        this.eventOnNotify( table, record._tick, label );

        this.updateFromServer( table, record );
    }

    /**
     * Called on the ending of notification
     * @param {any} tick  tick of the ending of the notification
     * @param {any} label label to show to the end-user
     */
    endNotification ( tick, label ) {
        if ( this._status !== "Running" )
            return;

        this.info( "End of notification (" + tick + ", " + String.JSONStringify( label ) + ")" );
        this.eventOnEndNotification( tick, label );
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

        var oldStatus = this._status;
        this._status = newStatus;
        this._statusErrors = errors;

        if ( this._areaInstance && this._areaInstance.onStatusChanged )
            this._areaInstance.onStatusChanged( oldStatus, this._status, this._statusErrors );

        if ( this._hubMaster === null || this._status !== "Error" )
            return;

        // The synchronization process has failed

        this.warn( "The synchronization process has failed!" );

        if ( this._hubMaster._areaInstance && this._hubMaster._areaInstance.onStopProgress )
            this._hubMaster._areaInstance.onStopProgress();

        if ( retry === undefined )
            retry = false;

        if ( Hub.Instance.IsRunning ) {
            this.warn( "The server is up ..." );

            if ( !retry ) {
                this.error( "Unable to resolv the issue on launching again a new synchronization ... Reload the page!" );
                this._hubMaster.updateStatus( this._status, this._statusErrors );
                return;
            }

            this.warn( "On launching again a new synchronization, you can resolv the issue ... Try it again!" );
            Hub.Instance.updateStatus( "ReadyToSynchronize" );
        } else {
            this.warn( "The server is down ... The synchronization is not complete! Try it again!" );
        }

        this._hubMaster._hubDatabase = null;
        this._hubMaster._hubHandle = window.setInterval( DSDatabase.ReconnectHub( this._hubMaster ), this._hubMaster._hubInterval * 1000 );
    }

    /**
     * Replace the serverId corresponding to the clientId by server (on receiving the serverId after acknopwledging a creation)
     * @param {any} foreignKeyTable table name of the foreign key
     * @param {any} clientId        id of the record corresponding to the identity of the record from the client
     * @param {any} serverId        id of the record corresponding to the record from the server
     */
    updateServerId ( foreignKeyTable, clientId, serverId ) {
        this.info( "Updating all tables having a foreign key ('" + foreignKeyTable + "', [" + clientId + "]) by this new server Id [" + serverId + "] ..." );

        for ( var table in this._tables )
            this._tables[table].updateServerId( foreignKeyTable, clientId, serverId );
    }

    /**
     * Update all tables having a foreign key towards the oldClientId and replace it by newClientId
     * This situation is possible when the acknowledge arrives after the creation of a new record (after a disconnection period)
     * @param {any} foreignKeyTable table name of the foreign key
     * @param {any} oldClientId     client identity of the record to replace
     * @param {any} newClientId     new client identity of the record
     */
    updateClientId ( foreignKeyTable, oldClientId, newClientId ) {
        this.info( "Updating all tables having a foreign key ('" + foreignKeyTable + "', [" + oldClientId + "]) by this client Id [" + newClientId + "] ..." );

        for ( var table in this._tables )
            this._tables[table].updateClientId( foreignKeyTable, oldClientId, newClientId );
    }

    /**
     * Define the schema on depends on server response
     * @param {any} schema schema to instanciate defined by the server to the client
     */
    setSchema ( schema ) {
        var errors = null;
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
            var maxSize = parseInt( this._parameters["Hub.MaxSize"] );
            if ( !isNaN( maxSize ) && maxSize > 0 )
                this._maxSize = maxSize * 1024;
        }
        this.info( "Max size in the queue = " + this._maxSize + " octets" );

        if ( this._parameters["Hub.Interval"] !== null && this._parameters["Hub.Interval"] !== undefined ) {
            var interval = parseInt( this._parameters["Hub.Interval"] );
            if ( !isNaN( interval ) && interval > 0 )
                this._hubInterval = interval;
        }
        this.info( "Interval between 2 checks of reconnection = " + this._hubInterval + " secondes" );

        if ( this._parameters["PDF.Font"] !== null && this._parameters["PDF.Font"] !== undefined )
            PDF.FONT_NAME = this._parameters["PDF.Font"].toLowerCase();
        this.info( "PDF Font = '" + PDF.FONT_NAME + "'" );

        this._defaultLanguage = schema.DefaultLanguage;
        this.info( "Default language = " + this._defaultLanguage );

        this._currentUserId = schema.CurrentUserId;
        this.info( "Current user id = " + this._currentUserId );

        this._currentModuleId = schema.CurrentModuleId;
        this.info( "Current module id = " + this._currentModuleId );

        this._lastRequestId = schema.LastRequestId;
        this.info( "The last request Id treated by the server is " + this._lastRequestId );

        // declare all tables

        var table = null;
        var tableToLoad = [];
        for ( table in schema.Schema ) {
            this._tables[table] = new DSTable( this, schema.Schema[table] );
            tableToLoad.push( table );
        }

        // Foreign keys need the definition of all tables before looking for an external table

        for ( table in schema.Schema )
            this._tables[table].updateForeignKeys();

        // Loading records for each table

        this.updateStatus( "Loading" );

        if ( this._areaInstance ) {
            if ( this._areaInstance.progressStatus )
                this._areaInstance.progressStatus( 0, tableToLoad.length );

            if ( this._areaInstance.progressMemory )
                this._areaInstance.progressMemory( 0, this._maxSize );
        }

        if ( this._hubMaster !== null && this._hubMaster._areaInstance !== null && this._hubMaster._areaInstance.progressStatus )
            this._hubMaster._areaInstance.progressStatus( 0, 2 * tableToLoad.length + 4 );

        function handleErrorLoadingTable( db, retry ) {
            return function () {
                db.error( "Connexion error on loading data" );
                db.updateStatus( "Error", new Errors( "ERR_CONNECTION" ), retry );
            };
        }

        function handleLoadingTable( db, tables ) {
            return function ( data ) {
                db.setTable( data );
                tables.splice( 0, 1 );

                if ( tables.length > 0 )
                    Hub.Instance.loadTable( tables[0], handleLoadingTable( db, tables ), handleErrorLoadingTable( db, db._hubMaster !== null ) );
            };
        }

        if ( tableToLoad.length > 0 )
            Hub.Instance.loadTable( tableToLoad[0], handleLoadingTable( this, tableToLoad ), handleErrorLoadingTable( this, this._hubMaster !== null ) );
    }

    /**
     * Set records into a given table
     * @param {any} data JSON structure containing the list of records to put into the table
     */
    setTable ( data ) {
        var errors = null;

        // TODO: Load data per block

        this.info( "Data received: " + String.JSONStringify( data ) );

        // error ?

        if ( data.Error ) {
            errors = new Errors();
            errors.setJSON( data.Error );
            this.error( "The records can't be loaded due to " + errors.toString() );
            this.updateStatus( "Error", errors );
            return;
        }

        if ( !data.Records || !data.Table ) {
            this.error( "The records are missing" );
            errors = new Errors( "ERR_CONNECTION" );
            this.updateStatus( "Error", errors );
            return;
        }

        // update the list of records

        if ( !this._tables[data.Table].setTable( data.Records, data.LastSequenceId ) ) {
            this.error( "The table is not correctly loaded!" );
            errors = new Errors( "ERR_CONNECTION" );
            this.updateStatus( "Error", errors );
            return;
        }

        // check if all tables are loaded

        var table = null;
        var tableNotLoaded = false;
        for ( table in this._tables ) {
            if ( !this._tables[table].Loaded ) {
                tableNotLoaded = true;
                break;
            }
        }

        if ( this._areaInstance && this._areaInstance.progressStatus )
            this._areaInstance.progressStatus();

        if ( this._hubMaster && this._hubMaster._areaInstance && this._hubMaster._areaInstance.progressStatus )
            this._hubMaster._areaInstance.progressStatus();

        // wait for all tables loading before ending the database loading

        if ( tableNotLoaded )
            return;

        // Update the list of unique values

        for ( table in this._tables )
            this._tables[table].updateUniqueValues();

        // all tables are loaded ...

        this.updateStatus( "Loaded" );

        // enable the interval between 2 tries of reconnection

        var notification = null;
        var i = null;

        if ( this._hubMaster === null ) {
            // It's DSDatabase.Instance ...

            // Treat all notifications waiting initializing process

            if ( this._bufferNotifications.length > 0 ) {
                this.info( "Executing all acknowledges and notifications buffered during the initialization process ..." );

                for ( i = 0; i < this._bufferNotifications.length; i++ ) {
                    notification = this._bufferNotifications[i];
                    if ( notification === null || notification === undefined )
                        continue;

                    if ( notification.requestId !== null && notification.requestId !== undefined ) {
                        this.info( "Acknowledging of the request buffered '" + notification.requestId + "' for ('" + notification.area + "', '" + notification.table + "', '" + notification.action + "', " + String.JSONStringify( notification.record ) + ", " + String.JSONStringify( notification.identity ) );
                        this.updateFromServer( notification.table, notification.record, notification.action === "Update" ? notification.identity.New : notification.identity );
                    } else if ( notification.userId !== null && notification.userId !== undefined ) {
                        this.info( "Notifying an update buffered from the user '" + notification.userId + "' for ('" + notification.area + "', '" + notification.table + "', " + String.JSONStringify( notification.record ) );
                        this.updateFromServer( notification.table, notification.record );
                    }
                }

                this._bufferNotifications = [];
            }
        } else {
            this.finalizeSynchronization();
        }

        // all notifications are treated ... the application is ready

        this.updateStatus( "Running" );

        if ( this._hubMaster !== null ) {
            this._hubMaster.updateStatus( "Running" );
            this._hubMaster.sendRequests();
        }

        if ( this._areaInstance && this._areaInstance.onStopProgress )
            this._areaInstance.onStopProgress( true );

        if ( this._hubMaster !== null && this._hubMaster._areaInstance && this._hubMaster._areaInstance.onStopProgress )
            this._hubMaster._areaInstance.onStopProgress();

        if ( this._hubMaster !== null ) {
            if ( this._hubMaster._hubHandle !== null ) {
                window.clearInterval( this._hubMaster._hubHandle );
                this._hubMaster._hubHandle = null;
            }

            this._hubMaster._hubHandle = window.setInterval( DSDatabase.ReconnectHub( this._hubMaster ), this._hubInterval * 1000 );
        } else {
            if ( this._hubHandle !== null ) {
                window.clearInterval( this._hubHandle );
                this._hubHandle = null;
            }

            this._hubHandle = window.setInterval( DSDatabase.ReconnectHub( this ), this._hubInterval * 1000 );
        }
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

        var currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        var currentRecord = currentTable.NewRow;
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

        var currentTable = this._tables[table];
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

        var currentTable = this._tables[table];
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

        var currentTable = this._tables[table];
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

        var currentTable = this._tables[table];
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

        var currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        return currentTable.getColumn( column );
    }

    /**
     * Retrieve the label (for multilingual dictionary) of the column into the given table
     * @param {any} table  table name
     * @param {any} column column name
     * @returns {any} multilingual label of the column
     */
    getColumnLabel ( table, column ) {
        // looking for the table

        var currentTable = this._tables[table];
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

        var currentTable = this._tables[table];
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

        var currentTable = this._tables[table];
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

        var currentTable = this._tables[table];
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

        var currentTable = this._tables[table];
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

        var currentTable = this._tables["History" + table];
        if ( currentTable === null || currentTable === undefined )
            return null;

        return currentTable.getLastHistoryId( id );
    }

    /**
     * Update all history properties on depends on the current value
     * @param {any} table table name
     * @param {any} item  item to update
     * @returns {any} item updated
     */
    updateHistoryProperties( table, item ) {
        // looking for the table

        var currentTable = this._tables[table];
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

        var currentTable = this._tables[table];
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

        var currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined )
            return record;

        return currentTable.checkProperties( record, errors );
    }

    /**
     * Initialize the database manager
     */
    start () {
        if ( this._status !== "NotInitialized" )
            return;

        if ( this._areaInstance && this._areaInstance.onStartProgress )
            this._areaInstance.onStartProgress();

        if ( this._areaInstance && this._areaInstance.progressStatus )
            this._areaInstance.progressStatus( 0, 1 );

        this.info( "Connecting to the server ..." );
        Hub.Instance.addListener( this.Module, this );
        Hub.Instance.start();
    }

    /**
     * Add a new record into the given table from the client side
     * @param {any} table  table name
     * @param {any} record record to add
     * @param {any} errors container of errors in case of abnormal value into the record
     * @returns {DSRecord} record added
     */
    addFromClient ( table, record, errors ) {
        this.info( "Adding the record " + String.JSONStringify( record ) + " from the client into the table '" + table + "' ..." );

        // looking for the table

        var currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined ) {
            this.error( "The table '" + table + "' doesn't exist!" );
            errors.addGlobal( "ERR_REQUEST_UNKNOWN" );
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
    updateFromClient ( table, oldRecord, newRecord, errors ) {
        this.info( "Updating the record " + String.JSONStringify( oldRecord ) + " to " + String.JSONStringify( newRecord ) + " from the client into the table '" + table + "' ..." );

        // looking for the table

        var currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined ) {
            this.error( "The table '" + table + "' doesn't exist!" );
            errors.addGlobal( "ERR_REQUEST_UNKNOWN" );
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
    updateFromServer ( table, record, identity ) {
        this.info( "Updating the record " + String.JSONStringify( record ) + " from the server into the table '" + table + "' ..." );

        // looking for the table

        var currentTable = this._tables[table];
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
    deleteRowById ( table, id ) {
        this.info( "Deleting the row " + id.toString() + " from the client into the table '" + table + "' ..." );

        // looking for the table

        var currentTable = this._tables[table];
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
        this.info( "Deleting the record " + String.JSONStringify( record ) + " from the client into the table '" + table + "' ..." );

        // looking for the table

        var currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined ) {
            this.error( "The table '" + table + "' doesn't exist!" );
            errors.addGlobal( "ERR_REQUEST_UNKNOWN" );
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

        var newRecords = records === null || records === undefined ? [] : records;
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

        for ( var i = 0; i < records.length && !errors.HasError; i++ ) {
            var record = records[i];
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

        var currentTable = this._tables[table];
        if ( currentTable === null || currentTable === undefined ) {
            this.error( "The table '" + table + "' doesn't exist!" );
            errors.addGlobal( "ERR_REQUEST_UNKNOWN" );
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
        var key = this.NextEventListenerKey;

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
        var currentListener = this._listeners[key];

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
        var events = [];

        for ( var eventName in this._eventListeners ) {
            if ( eventName !== "*" && eventName !== event )
                continue;

            for ( var eventTable in this._eventListeners[eventName] ) {
                if ( eventTable !== "*" && eventTable !== table )
                    continue;

                for ( var eventId in this._eventListeners[eventName][eventTable] ) {
                    if ( eventId !== "*" && eventId !== id.toString() )
                        continue;

                    for ( var eventKey in this._eventListeners[eventName][eventTable][eventId] ) {
                        events.push( { key: parseInt( eventKey ), fn: this._eventListeners[eventName][eventTable][eventId][eventKey] } );
                    }
                }
            }
        }

        // order by key ... to respect the order of declaration

        events.sort( function ( a, b ) { return a.key < b.key ? -1 : a.key > b.key ? 1 : 0; } );

        var fnEvents = [];
        for ( var key in events )
            fnEvents.push( events[key].fn );

        return fnEvents;
    }

    /**
     * Raise onBeginNotification event on the database, the table within or without errors
     * @param {any} tick  tick of the begining of the notification
     * @param {any} label code label to show
     */
    eventOnBeginNotification ( tick, label ) {
        var events = this.getEvents( "onBeginNotification", "*", "*" );

        if ( events.length === 0 )
            return;

        for ( var eventKey in events )
            try {
                events[eventKey]( "onBeginNotification", "*", tick, label );
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
    eventOnNotify ( table, tick, label, errors ) {
        var events = this.getEvents( "onNotify", table, "*" );

        if ( events.length === 0 )
            return;

        for ( var eventKey in events )
            try {
                events[eventKey]( "onNotify", table, tick, label, errors );
            } catch ( e ) {
                this.exception( "Exception on raising the event 'onNotify'", e );
            }
    }

    /**
     * Raise onEndNotification event on the database, the table within or without errors
     * @param {any} tick  tick of the begining of the notification
     * @param {any} label code label to show
     */
    eventOnEndNotification ( tick, label ) {
        var events = this.getEvents( "onEndNotification", "*", "*" );

        if ( events.length === 0 )
            return;

        for ( var eventKey in events )
            try {
                events[eventKey]( "onEndNotification", "*", tick, label );
            } catch ( e ) {
                this.exception( "Exception on raising the event 'onEndNotification'", e );
            }
    }

    /**
     * Raise onCreate event on the database, the table or a given row
     * @param {any} table table name
     * @param {any} id    id of the record created
     */
    eventOnCreate ( table, id ) {
        var events = this.getEvents( "onCreate", table, id );

        if ( events.length === 0 )
            return;

        var record = this.getRowById( table, id );

        for ( var eventKey in events )
            try {
                events[eventKey]( "onCreate", table, id, record );
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
    eventOnUpdate ( table, id, oldRecord ) {
        var events = this.getEvents( "onUpdate", table, id );

        if ( events.length === 0 )
            return;

        var newRecord = this.getRowById( table, id );

        for ( var eventKey in events )
            try {
                events[eventKey]( "onUpdate", table, id, oldRecord, newRecord );
            } catch ( e ) {
                this.exception( "Exception on raising the event 'onUpdate'", e );
            }
    }

    /**
     * Raise onDelete event on the database, the table or a given row
     * @param {any} table table name
     * @param {any} id    id of the record deleted
     */
    eventOnDelete ( table, id ) {
        var events = this.getEvents( "onDelete", table, id );

        if ( events.length === 0 )
            return;

        var record = this.getRowById( table, id );

        for ( var eventKey in events )
            try {
                events[eventKey]( "onDelete", table, id, record );
            } catch ( e ) {
                this.exception( "Exception on raising the event 'onDelete'", e );
            }
    }

    /**
     * Raise onLoad event on the database or the table
     * @param {any} table table name loaded
     */
    eventOnLoad ( table ) {
        var events = this.getEvents( "onLoad", table, "*" );

        if ( events.length === 0 )
            return;

        for ( var eventKey in events )
            try {
                events[eventKey]( "onLoad", table );
            } catch ( e ) {
                this.exception( "Exception on raising the event 'onLoad'", e );
            }
    }

    /**
     * Raise onStartCommit event on the database or the table
     * @param {any} nbRequests number of requests under committing
     */
    eventOnStartCommit ( nbRequests ) {
        this._commitRunning = true;

        var events = this.getEvents( "onStartCommit", "*", "*" );

        if ( events.length === 0 )
            return;

        for ( var eventKey in events )
            try {
                events[eventKey]( "onStartCommit", nbRequests );
            } catch ( e ) {
                this.exception( "Exception on raising the event 'onStartCommit'", e );
            }
    }

    /**
     * Raise onCommit event on the database or the table
     * @param {any} error list of errors on committing
     */
    eventOnCommit ( error ) {
        if ( !this._commitRunning )
            return;

        var events = this.getEvents( "onCommit", "*", "*" );

        if ( events.length === 0 )
            return;

        for ( var eventKey in events )
            try {
                events[eventKey]( "onCommit", error );
            } catch ( e ) {
                this.exception( "Exception on raising the event 'onCommit'", e );
            }
    }

    /**
     * Raise onStopCommit event on the database or the table
     */
    eventOnStopCommit () {
        if ( !this._commitRunning )
            return;
        this._commitRunning = false;

        var events = this.getEvents( "onStopCommit", "*", "*" );

        if ( events.length === 0 )
            return;

        for ( var eventKey in events )
            try {
                events[eventKey]( "onStopCommit" );
            } catch ( e ) {
                this.exception( "Exception on raising the event 'onStopCommit'", e );
            }
    }

    // ------------------------------------- Synchronization process -------------------------------------

    /**
     * Start the synchronization process
     * Load data from server
     * Check if the structure between the current and the new one is compatible
     * Update it
     */
    synchronize () {
        function handleInitializing( db ) {
            return function ( schema ) {
                db.setSchema( schema );
            };
        }

        function handleError( db, retry ) {
            return function () {
                db.error( "Connexion error on synchronizing protocol" );
                db.updateStatus( "Error", new Errors( "ERR_CONNECTION" ), retry );
            };
        }

        this.info( "Starting the synchronization process ..." );

        if ( this._hubHandle !== null ) {
            window.clearInterval( this._hubHandle );
            this._hubHandle = null;
        }

        if ( this._areaInstance && this._areaInstance.onStartProgress )
            this._areaInstance.onStartProgress();

        if ( this._areaInstance && this._areaInstance.progressStatus )
            this._areaInstance.progressStatus( 0, 1, "MSG_SYNCHRONIZING" );

        // define a new database instance to make the synchronization

        this._hubDatabase = new DSDatabase( "DSSynchronization", this );
        this._hubDatabase._areaName = this._areaName;
        this._hubDatabase._areaModuleId = this._areaModuleId;

        Hub.Instance.initialize( this._hubDatabase._areaName, this._hubDatabase._areaModuleId, handleInitializing( this._hubDatabase ), handleError( this._hubDatabase, true ) );
    }

    /**
     * Replay a request (requestId, table, action, record, identity, tick)
     * @param {any} request request to replay on synchronization (update ids)
     * @returns {any} new request
     */
    replayRequest ( request ) {
        var newRequest = {};
        var errors = null;
        var currentTable = null;

        if ( request === null || request === undefined )
            return null;

        errors = new Errors();

        if ( request.transaction !== null && request.transaction !== undefined ) {
            var newTransaction = [];

            for ( var i = 0; i < request.transaction.length; i++ ) {
                var currentRequest = request.transaction[i];
                if ( currentRequest === null || currentRequest === undefined )
                    continue;

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
                    for ( i = newTransaction.length - 1; i >= 0; i-- )
                        this.rollbackRequest( newTransaction[i] );
                    return null;
                }

                newTransaction.push( newRequest );
            }

            newRequest = { requestId: null, label: request.label, transaction: newTransaction, fnDone: request.fnDone };
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

        var requestSize = String.JSONStringify( newRequest ).length;
        this._currentSize += requestSize;

        this.info( "The request " + String.JSONStringify( newRequest ) + " has been replayed (size: " + requestSize + " octets) ..." );

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

        var keys = [];
        for ( var requestId in from._requestsByRequestId )
            keys.push( requestId );
        keys.sort( function ( a, b ) { return a < b ? -1 : ( a > b ? 1 : 0 ); } );

        // Put the requests already sent into the list of requests to send

        var buffer = [];
        var i = 0, j = 0;
        var request = null;
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
            if ( from._bufferNotifications[i].transaction === undefined || from._bufferNotifications[i].transaction === null ) {
                request = [];

                for ( j = 0; j < from._bufferNotifications[i].transaction.length; j++ ) {
                    if ( from._bufferNotifications[i][j].identity === undefined || from._bufferNotifications[i][j].identity === null ) {
                        request.push( from._bufferNotifications[i][j] );
                        continue;
                    }
                }

                if ( request.lenth > 0 )
                    this._bufferNotifications.push( request );
            } else if ( from._bufferNotifications[i].identity === undefined || from._bufferNotifications[i].identity === null ) {
                this._bufferNotifications.push( from._bufferNotifications[i] );
                continue;
            }

            // Ignore all notifications from myself because the database already contains the update ...
        }

        this.info( this._bufferNotifications.length + " notifications waiting the end of initialization" );
    }

    /**
     * The existing schema and data are loaded ...
     * Replay all data updated since the last disconnection
     * Replace the DSDatabase.Instance by the new one
     */
    finalizeSynchronization() {
        var table = null;

        this.info( "The schema and tables are loaded ... Synchronizing database manager ..." );

        // Check if the database schema is the same as the database loaded

        for ( table in this._tables ) {
            if ( this._hubMaster._tables[table] === null || this._hubMaster._tables[table] === undefined ) {
                this.updateStatus( "Error", new Errors( "ERR_UNABLE_SYNCHRONIZATION" ) );
                return;
            }
        }

        for ( table in this._hubMaster._tables ) {
            if ( this._tables[table] === null || this._tables[table] === undefined ) {
                this.updateStatus( "Error", new Errors( "ERR_UNABLE_SYNCHRONIZATION" ) );
                return;
            }
        }

        for ( table in this._tables ) {
            if ( !this._tables[table].hasSameStructure( this._hubMaster._tables[table] ) ) {
                this.updateStatus( "Error", new Errors( "ERR_UNABLE_SYNCHRONIZATION" ) );
                return;
            }
        }

        this.info( "The database schema is compatible with the database synchronized" );
        this.info( "Now, replaying all requests into the database manager into the new database ..." );

        if ( this._hubMaster._areaInstance && this._hubMaster._areaInstance.progressStatus )
            this._hubMaster._areaInstance.progressStatus();

        // Replay requests and update requests (identity)

        this.replayRequests( this._hubMaster );

        if ( this._hubMaster._areaInstance && this._hubMaster._areaInstance.progressStatus )
            this._hubMaster._areaInstance.progressStatus();

        // Replace table data into the database manager

        for ( table in this._tables ) {
            this._hubMaster._tables[table] = this._tables[table];
            this._hubMaster._tables[table].setDatabase ( this._hubMaster );
            this._hubMaster._tables[table].updateForeignKeys( true );
        }

        if ( this._hubMaster._areaInstance && this._hubMaster._areaInstance.progressStatus )
            this._hubMaster._areaInstance.progressStatus();

        // Replace requests

        this._hubMaster._requestsByRequestId = this._requestsByRequestId;
        this._hubMaster._bufferRequestSent = this._bufferRequestSent;
        this._hubMaster._bufferRequest = this._bufferRequest;
        this._hubMaster._bufferNotifications = this._bufferNotifications;

        // Update some properties

        this._hubMaster._version = this._version;

        this._hubMaster._currentSize = this._currentSize;
        this._hubMaster._maxSize = this._maxSize;

        if ( this._hubMaster._areaInstance && this._hubMaster._areaInstance.progressMemory )
            this._hubMaster._areaInstance.progressMemory( this._hubMaster._currentSize, this._hubMaster._maxSize );

        this._hubMaster._parameters = this._parameters;
        this._hubMaster._defaultLanguage = this._defaultLanguage;
        this._hubMaster._currentUserId = this._currentUserId;

        // Reconnection setup

        this._hubMaster._hubInterval = this._hubInterval;

        // Destroy the database synchronized

        this._hubMaster._hubDatabase = null;

        // Treat all notifications waiting initializing process

        if ( this._hubMaster._bufferNotifications.length > 0 ) {
            this._hubMaster.info( "Executing all acknowledges and notifications buffered during the synchronization process ..." );

            for ( let i = 0; i < this._hubMaster._bufferNotifications.length; i++ ) {
                let notification = this._hubMaster._bufferNotifications[i];
                if ( notification === null || notification === undefined )
                    continue;

                if ( notification.requestId !== null && notification.requestId !== undefined ) {
                    this._hubMaster.info( "Acknowledging of the request buffered '" + notification.requestId + "' for ('" + notification.area + "', '" + notification.table + "', '" + notification.action + "', " + String.JSONStringify( notification.record ) + ", " + String.JSONStringify( notification.identity ) );
                    this._hubMaster.updateFromServer( notification.table, notification.record, notification.action === "Update" ? notification.identity.New : notification.identity );
                } else if ( notification.userId !== null && notification.userId !== undefined ) {
                    this._hubMaster.info( "Notifying an update buffered from the user '" + notification.userId + "' for ('" + notification.area + "', '" + notification.table + "', " + String.JSONStringify( notification.record ) );
                    this._hubMaster.updateFromServer( notification.table, notification.record );
                }
            }

            this._hubMaster._bufferNotifications = [];
        }

        // Raise onLoad on all tables

        for ( table in this._hubMaster._tables ) {
            this._hubMaster.eventOnLoad( table );

            if ( this._hubMaster._areaInstance && this._hubMaster._areaInstance.progressStatus )
                this._hubMaster._areaInstance.progressStatus();
        }
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

        this._defaultLanguage = "FR";
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
        this._bufferTransaction = null;
        this._bufferTransactionCount = 0;

        // Reconnection setup

        // As DSDatabase.Instance can be used as reference anywhere, we don't change its reference during the synchronization process and the synchronization will be done
        // within a sub DSDatabase.Instance and, as the synchronization is finished, all properties of DSDatabase.Instance is replace by the new one.

        this._hubMaster = master === undefined ? null : master; // reference on the main DSDatabase (this value is null for the DSDatabase.Instance and not null for the synchronization process)
        this._hubHandle = null;
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
