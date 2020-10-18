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
 * Handle the technical connection between the client and the server
 * Status of the connection and running or not
 *
 * List of status:
 * ---------------
 *
 * - NotInitialized
 * - Starting / Started
 * - Stopping / Stopped
 * - ReadyToSynchronize
 */
class Hub extends LoggerBaseObject {
    /**
     * Indicates if the hub is connected or not ...
     */
    get IsRunning () {
        return this._status === "Started";
    }

    /**
     * Indicates if the hub is connected or not ...
     */
    get IsOnline () {
        return this._status === "Started" ||
            this._status === "ReadyToSynchronize";
    }

    /**
     * Indicates if the hub is definitely stopped ...
     */
    get IsStopped () {
        return this._status === "Stopped";
    }

    /**
     * Update the status of the hub service and notify all listeners
     * @param {any} newStatus new status of the connection
     * @param {any} errors    list of errors retrieved during the connection
     */
    async updateStatus ( newStatus, errors ) {
        function handleUpdateStatus( hub, newStatus, errors ) {
            hub.info( "The status becomes '" + newStatus + "'" + ( errors !== undefined ? " (" + String.JSONStringify( errors ) + ")" : "" ) );

            let oldStatus = hub._status;
            hub._status = newStatus;
            Logger.Instance.status( hub._status );

            for ( let listener in hub._listeners ) {
                if ( hub._listeners[listener].onStatusChanged ) {
                    hub.debug( "Notify the listener '" + listener + "' about the status '" + newStatus + "'" );
                    hub._listeners[listener].onStatusChanged( oldStatus, newStatus, errors );
                }
            }
        }

        function handleIsAllowed( hub ) {
            return function ( allow ) {
                hub.info( "IsAllowed = " + String.JSONStringify( allow ) );

                if ( allow.Error !== null && allow.Error !== undefined ) {
                    let errors = new Errors();
                    errors.setJSON( allow.Error );
                    handleUpdateStatus( hub, "Error", errors );
                } else if ( allow.Allow !== null && allow.Allow !== undefined && allow.Allow )
                    handleUpdateStatus( hub, newStatus );
                else {
                    handleUpdateStatus( hub, "Error", new Errors( "ERR_AUTHENTICATED_TWICE" ) );
                }
            };
        }

        function handleFailed( hub ) {
            return function () {
                hub.error( "IsAllowed = failed!" );
                handleUpdateStatus( hub, "Error", new Errors( "ERR_AUTHENTICATED_TWICE" ) );
            };
        }

        this.verbose( "Updating status '" + this._status + "' to '" + newStatus + "' ..." );

        if ( this._status === newStatus && newStatus !== "ReadyToSynchronize" )
            return;

        if ( newStatus === "Started" )
            this.verbose( "Connected, transport = " + $.connection.hub.transport.name );

        if ( newStatus !== "ReadyToSynchronize" ) {
            handleUpdateStatus( this, newStatus, errors );
            return;
        }

        this.verbose( "Running is allowed ..." );

        await new Promise( ( resolve, reject ) => {
            $.connection.databaseHub.server.isAllowed().done( resolve ).fail( reject );
        } ).then( handleIsAllowed( this ) ).catch( handleFailed( this ) );
    }

    /**
     * Start the initialization connection in asynchronous mode
     * @param {any} area     area name
     * @param {any} moduleId Id of the current module (started within this screen)
     */
    async initialize( area, moduleId ) {
        this.info( "Initializing for the area '" + area + "' (" + moduleId + ") ..." );

        return new Promise( ( resolve, reject ) => {
            $.connection.databaseHub.server.initialize( area, moduleId ).done( resolve ).fail( reject );
        } );
    }

    /**
     * Handle the ping of the application (WebSocket & WebApplication)
     */
    ping() {
        function handleThrottle( hub ) {
            return function () {
                hub._timeout = null;

                hub.verbose( "Ping the server via HTTP" );
                let site = window.location.href.split( '/' )[2];
                if ( window.location.href.startsWith( 'http://localhost' ) ) {
                    protocol = 'http';
                } else {
                    protocol = window.location.href.split( ':' )[0];
                }

                if ( window.location.href.indexOf( '.syncytium.' ) >= 0 )
                    instance = window.location.href.split( '/' )[3];

                try {
                    $.ajax( {
                        type: "POST",
                        url: protocol + '://' + site + ( instance === null ? '' : ( '/' + instance ) ) + '/Administration/Ping/Ping',
                        contentType: false,
                        processData: false,
                        data: new FormData()
                    } );
                } catch ( e ) {
                    hub.exception( "Exception on ping access to HTTP", e );
                }
            };
        }

        let protocol = 'http';
        let instance = null;

        this.verbose( "Ping the server via WebService" );
        $.connection.databaseHub.server.ping();

        // Ping by HTTP to the server to maintain the connection (with a Throttle action)

        if ( this._timeoutPing !== null ) {
            window.clearTimeout( this._timeoutPing );
            this._timeoutPing = null;
        }

        this._timeoutPing = setTimeout( handleThrottle( this ), 500 );
    }

    /**
     * Ask the content of a table in asynchronous mode
     * @param {any} table   table name to load
     */
    async loadTable( table ) {
        function handleLoadingTable( hub, fn ) {
            return function ( data ) {
                if ( data.Error !== null && data.Error !== undefined ) {
                    fn( data );
                    return;
                }

                if ( hub._nbLots >= data.NbLots ) {
                    data.Records = hub._rows;
                    hub._rows = [];
                    fn( data );
                    return;
                }

                // waiting the reception on data.NbLots ...

                hub.info( "Waiting for all data of the table '" + table + "' before continuing ..." );

                hub._lastNbLots = hub._nbLots;
                hub._nbIntervalLoadTable = 0;
                hub._intervalLoadTable = setInterval(() => {
                    if (hub._lastNbLots !== hub._nbLots) {
                        // Initialize the counter of retries ...

                        hub.warn("Receiving data of the table '" + table + "' ...");
                        hub._nbIntervalLoadTable = 0;
                        hub._lastNbLots = hub._nbLots;
                        return;
                    }

                    if ( hub._nbLots < data.NbLots ) {
                        hub.warn( "Waiting for all data of the table '" + table + "' before continuing ..." );
                        hub._nbIntervalLoadTable++;

                        if ( hub._nbIntervalLoadTable > 10 ) {
                            hub.error( "Any response from the server ... the connection might be corrupted !" );

                            clearInterval( hub._intervalLoadTable );
                            hub._intervalLoadTable = null;
                            hub._nbIntervalLoadTable = 0;

                            data.Error = { Fatals: [{ Message: "ERR_CONNECTION", Parameters: [] }] };
                            fn( data );
                        }
                        return;
                    }

                    clearInterval( hub._intervalLoadTable );
                    hub._intervalLoadTable = null;
                    hub._nbIntervalLoadTable = 0;
                    hub._lastNbLots = 0;

                    data.Records = hub._rows;
                    hub._rows = [];
                    fn( data );
                }, 200 );
            };
        }

        this.info( "Retrieving content of the table '" + table + "' ..." );

        this._rows = [];
        this._nbLots = 0;
        return new Promise( ( resolve, reject ) => {
            $.connection.databaseHub.server.loadTable( table ).done( handleLoadingTable( this, resolve ) ).fail( reject );
        } );
    }

    /**
     * Send a new request to the server in asynchronous mode
     * @param {any} requestId id of the request to execute
     * @param {any} label     code label description the request
     * @param {any} table     table name concerned by the request
     * @param {any} action    action corresponding to the request
     * @param {any} record    description of the request
     * @param {any} identity  client identity corresponding to the request
     */
    async executeRequest( requestId, label, table, action, record, identity ) {
        if ( this.IsDebug )
            this.debug( "Executing the request: [" + requestId + "] => { Label = '" + String.JSONStringify( label ) + "', Table = '" + table + "', Action = '" + action + "', Record = " + String.JSONStringify( record ) + ", Identity = " + String.JSONStringify( identity ) + "} ..." );

        return new Promise( ( resolve, reject ) => {
            $.connection.databaseHub.server.executeRequest( requestId, label, table, action, record, identity ).done( resolve ).fail( reject );
        } );
    }

    /**
     * Send a new transaction to the server in asynchronous mode
     * @param {any} requestId   id of the request to execute
     * @param {any} label       code label description the request
     * @param {any} transaction description of the transaction
     * @param {any} notify true if the notification must be sent to the caller
     */
    async executeTransaction( requestId, label, transaction, notify ) {
        if ( this.IsDebug )
            this.debug( "Executing the transaction: [" + requestId + "] => { Label = '" + String.JSONStringify( label ) + "', Transaction = '" + String.JSONStringify( transaction ) + "'} ..." );

        return new Promise( ( resolve, reject ) => {
            $.connection.databaseHub.server.executeTransaction( requestId, label, transaction, notify ).done( resolve ).fail( reject );
        } );
    }

    /**
     * Send a service to the server in asynchronous mode
     * @param {any} service   service name to execute
     * @param {any} record    description of the service
     * @param {any} identity  client identity corresponding to the service
     * @param {boolean} synchronous true means that the service must be executed as soon as the request arrived in the server
     */
    async executeService( service, record, identity, synchronous ) {
        if ( this.IsDebug )
            this.debug( "Executing the service: { Service = '" + service + "', Record = " + String.JSONStringify( record ) + ", Identity = " + String.JSONStringify( identity ) + ", Synchronous = " + synchronous + "} ..." );

        return new Promise( ( resolve, reject ) => {
            $.connection.databaseHub.server.executeService( service, record, identity, synchronous ).done( resolve ).fail( reject );
        } );
    }

    /**
     * Receiving a package of rows to set into the table
     * @param {any} table tick of the begining of the notification
     * @param {any} records code label to show
     */
    loadTableFromServer( table, records ) {
        if ( this.IsVerboseAll )
            this.verbose( "Loading data for the table '" + table + "' : " + String.JSONStringify( records ) );

        for ( let record of Array.toIterable( records ) )
            this._rows.push( record );
        this._nbLots++;
    }

    /**
     * Receiving a begin notification from the server
     * @param {any} tick  tick of the begining of the notification
     * @param {any} label code label to show
     */
    async beginNotification ( tick, label ) {
        // ignore all notifications received in case of "ReadyToSynchronize" status
        // In the synchronization process, we will receive all updated data .. so, notification is not mandatory

        if ( this._status === "ReadyToSynchronize" )
            return;

        for ( let listener in this._listeners ) {
            if ( this._listeners[listener].beginNotification ) {
                this.debug( "Notify the listener '" + listener + "' for the beginning of notification (" + tick.toString() + ", " + String.JSONStringify( label ) + ")" );
                await this._listeners[listener].beginNotification( tick, label );
            }
        }
    }

    /**
     * Receiving a notification from the server
     * @param {any} userId id of the user having changed something
     * @param {any} label  code label of the notification
     * @param {any} area   area name
     * @param {any} lot    list of notifications
     */
    async notify ( userId, label, area, lot ) {
        // ignore all notifications received in case of "ReadyToSynchronize" status
        // In the synchronization process, we will receive all updated data .. so, notification is not mandatory

        if ( this._status === "ReadyToSynchronize" )
            return;

        for ( let listener in this._listeners ) {
            if ( this._listeners[listener].notify ) {
                this.debug( "Notify the listener '" + listener + "' about an update from the user '" + userId + "' for (" + String.JSONStringify( label ) + ", '" + area + "', " + String.JSONStringify( lot ) );

                for ( let i = 0; i < lot.length; i++ )
                    await this._listeners[listener].notify( userId, label, area, lot[i].table, lot[i].record );
            }
        }
    }

    /**
     * Receiving an end notification from the server
     * @param {any} tick  tick of the ending of the notification
     * @param {any} label code label to show
     */
    async endNotification ( tick, label ) {
        // ignore all notifications received in case of "ReadyToSynchronize" status
        // In the synchronization process, we will receive all updated data .. so, notification is not mandatory

        if ( this._status === "ReadyToSynchronize" )
            return;

        for ( let listener in this._listeners ) {
            if ( this._listeners[listener].endNotification ) {
                this.debug( "Notify the listener '" + listener + "' for the ending of notification (" + tick.toString() + ", " + String.JSONStringify( label ) + ")" );
                await this._listeners[listener].endNotification( tick, label );
            }
        }
    }

    /**
     * Receiving an acknowledge from the server
     * @param {any} requestId id of the request acknowldged
     * @param {any} area      area name
     * @param {any} table     table name concerned by the acknowldgement
     * @param {any} action    action corresponding to the acknowldgement
     * @param {any} record    description of the acknowldgement
     * @param {any} identity  client identity corresponding to the acknowldgement
     * @param {any} error     error status on the acknowledgment
     */
    async acknowledgeRequest ( requestId, area, table, action, record, identity, error ) {
        // do not ignore acknowledges from the server because it corresponds to a request sent

        for ( let listener in this._listeners ) {
            if ( this._listeners[listener].acknowledgeRequest ) {
                this.debug( "Notify the listener '" + listener + "' about an acknowledge from the request '" + requestId + "' for ('" + area + "', '" + table + "', '" + action + "', " + String.JSONStringify( record ) + ", " + String.JSONStringify( identity ) + ") with error (" + String.JSONStringify( error ) + ")" );
                await this._listeners[listener].acknowledgeRequest( requestId, area, table, action, record, identity, error );
            }
        }
    }

    /**
     * Receiving an acknowledge from the server
     * @param {any} requestId   id of the transaction acknowledged
     * @param {any} area        area name
     * @param {any} transaction transaction acknowledged
     * @param {any} error      error status on the acknowledgment
     */
    async acknowledgeTransaction ( requestId, area, transaction, error ) {
        // do not ignore acknowledges from the server because it corresponds to a request sent

        for ( let listener in this._listeners ) {
            if ( this._listeners[listener].acknowledgeTransaction ) {
                this.debug( "Notify the listener '" + listener + "' about an acknowledge from the transaction '" + requestId + "' for ('" + area + "', " + String.JSONStringify( transaction ) + ") with error (" + String.JSONStringify( error ) + ")" );
                await this._listeners[listener].acknowledgeTransaction( requestId, area, transaction, error );
            }
        }
    }

    /**
     * Receiving an acknowledge from the server
     * @param {any} area      area name
     * @param {any} service   service
     * @param {any} record    description of the service
     * @param {any} identity  identity of the description
     * @param {any} result    result of the service
     */
    async acknowledgeService ( area, service, record, identity, result ) {
        // do not ignore acknowledges from the server because it corresponds to a service sent

        for ( let listener in this._listeners ) {
            if ( this._listeners[listener].acknowledgeService ) {
                this.debug( "Notify the listener '" + listener + "' about an acknowledge from the service '" + service + "' for ('" + area + "', " + String.JSONStringify( record ) + ", " + String.JSONStringify( identity ) + ") => " + String.JSONStringify( result ) );
                await this._listeners[listener].acknowledgeService( area, service, record, identity, result );
            }
        }
    }

    /**
     * Start the hub service
     */
    async start () {
        function treatment( hub ) {
            return new Promise( ( resolve, reject ) => {
                let runTreatment = true;

                try {
                    hub.executeEvent();
                } catch ( e ) {
                    hub.exception( "Exception on handling events from server", e );
                    runTreatment = false;
                }

                setTimeout( runTreatment ? resolve : reject, 100 );
            } );
        }

        if ( this._status === "Started" ||
            this._status === "Starting" ||
            this._status === "ReadyToSynchronize" )
            return;

        let oldStatus = this._status;
        await this.updateStatus( "Starting" );

        await new Promise( ( resolve, reject ) => {
            $.connection.hub.start().done( resolve ).fail( reject );
        } ).then( async () => {
            await this.updateStatus( oldStatus === "NotInitialized" ? "Started" : "ReadyToSynchronize" );

            setTimeout( async () => {
                this.info( "Starting thread to handle events from server in asynchronous mode ..." );

                let loop = true;
                while ( loop ) {
                    await treatment( this ).then( () => { } ).catch( () => { } );
                }
            }, this._timeoutDelay * 1000 );
        } );
    }

    /**
     * Start the synchronization process into the hub service
     */
    async synchronize () {
        if ( this._status !== "ReadyToSynchronize" )
            return;

        await this.updateStatus( "Started" );
    }

    /**
     * Stop the hub service
     * @param {any} force true, stop the connection even if the status is not stopped!
     */
    async stop ( force ) {
        if ( force === null || force === undefined || force !== true ) {
            if ( !this.IsRunning || this._status === "Stopping" )
                return;
        }

        await this.updateStatus( "Stopping" );
        await new Promise( ( resolve, reject ) => {
            let stop = $.connection.hub.stop();
            if ( stop.done )
                stop.done( resolve ).fail( reject );
            else
                resolve();
        } ).then( () => Hub.Instance.updateStatus( "Stopped" ) );
    }

    /**
     * Add a new listener to this singleton
     * @param {any} name    listener name (identity)
     * @param {any} element instance attached to this listener
     */
    addListener ( name, element ) {
        this._listeners[name] = element;
        this.debug( "Listener '" + name + "' added" );
    }

    /**
     * Remove an existing listener to this singleton
     * @param {any} name listener name (identity)
     */
    removeListener ( name ) {
        delete this._listeners[name];
        this.debug( "Listener '" + name + "' removed" );
    }

    /**
     * Execute an event store into the queue of events stored
     */
    async executeEvent() {
        if ( this._events.length === 0 || this._eventBlocked )
            return false;

        try {
            let event = this._events[0];
            this._events.splice( 0, 1 );

            switch ( event[0] ) {
                case "beginNotification":
                    await this.beginNotification( ...event[1] );
                    break;
                case "notify":
                    await this.notify( ...event[1] );
                    break;
                case "endNotification":
                    await this.endNotification( ...event[1] );
                    break;
                case "acknowledgeRequest":
                    await this.acknowledgeRequest( ...event[1] );
                    break;
                case "acknowledgeTransaction":
                    await this.acknowledgeTransaction( ...event[1] );
                    break;
                case "acknowledgeService":
                    await this.acknowledgeService( ...event[1] );
                    break;
            }
        } catch ( e ) {
            this.exception( "Exception on executing an event from the server", e );
        }

        return true;
    }

    /**
     * Store the event from the server into the event before executing on the client side
     * @param {string} event event to store
     * @param {function} method function to launch on the event
     * @param {...any} parameters list of parameters of the events
     */
    pushEvent( event, ...parameters ) {
        this._events.push( [event, parameters] );
    }

    /**
     * Do not execute notifications from the server ... because a large treatment is running ...
     */
    blockEvents() {
        this.debug( "Blocking handling notifications from the server ..." );
        this._eventBlocked = true;
    }

    /**
     * Execute notifications from the server, now, because the large treatment is finished ...
     */
    unblockEvents() {
        this.debug( "Unblocking notifications from the server ..." );
        this._eventBlocked = false;
    }

    /**
     * Constructor
     */
    constructor() {
        super("HUB" );

        this._status = "NotInitialized";
        this._listeners = {};
        this._timeoutPing = null;

        this._nbLots = 0;
        this._lastNbLots = 0;
        this._rows = [];
        this._nbIntervalLoadTable = 0;
        this._intervalLoadTable = null;

        this._eventBlocked = false;
        this._events = [];
        this._timeoutDelay = 2;

        Logger.Instance.status( this._status );
    }

    /**
     * @returns {Hub} the instance of the singleton
     */
    static get Instance() {
        if ( !this._instance )
            this._instance = new Hub();

        return this._instance;
    }
}

$.connection.databaseHub.client.loadTable = function ( table, records ) {
    Hub.Instance.loadTableFromServer( table, records );
};

$.connection.databaseHub.client.beginNotification = function ( tick, label ) {
    Hub.Instance.pushEvent( "beginNotification", tick, label );
};

$.connection.databaseHub.client.notify = function (userId, label, area, lot) {
    Hub.Instance.pushEvent( "notify", userId, label, area, lot );
};

$.connection.databaseHub.client.endNotification = function (tick, label) {
    Hub.Instance.pushEvent( "endNotification", tick, label );
};

$.connection.databaseHub.client.acknowledgeRequest = function (requestId, area, table, action, record, identity, error) {
    Hub.Instance.pushEvent( "acknowledgeRequest", requestId, area, table, action, record, identity, error );
};

$.connection.databaseHub.client.acknowledgeTransaction = function ( requestId, area, transaction, error) {
    Hub.Instance.pushEvent( "acknowledgeTransaction", requestId, area, transaction, error );
};

$.connection.databaseHub.client.acknowledgeService = function (area, service, record, identity, result) {
    Hub.Instance.pushEvent( "acknowledgeService", area, service, record, identity, result );
};

$.connection.databaseHub.client.stop = function () {
    Logger.Instance.info("HUB", "Stop");
    $.connection.hub.stop();
};

$.connection.databaseHub.client.ping = function () {
    Logger.Instance.info( "HUB", "Ping" );
    Hub.Instance.ping();
};

$.connection.hub.reconnecting(function () {
    Hub.Instance.debug("Reconnecting ...");
    Hub.Instance.updateStatus("Starting");
});

$.connection.hub.reconnected(function () {
    Hub.Instance.debug("Reconnected!");
    Hub.Instance.updateStatus("ReadyToSynchronize");
});

$.connection.hub.disconnected(function () {
    Hub.Instance.debug("Disconnected!");
    Hub.Instance.updateStatus("Stopped");

    if ($.connection.hub.lastError)
        Hub.Instance.warn("Disconnected. Reason: " + $.connection.hub.lastError.message);
});
