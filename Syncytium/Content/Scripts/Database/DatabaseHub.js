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
    updateStatus ( newStatus, errors ) {
        this.verbose( "Updating status '" + this._status + "' to '" + newStatus + "' ..." );

        if ( this._status === newStatus && newStatus !== "ReadyToSynchronize" )
            return;

        function handleUpdateStatus( hub, newStatus, errors ) {
            if ( errors !== undefined )
                hub.info( "The status becomes '" + newStatus + "' (" + String.JSONStringify( errors ) + ")" );
            else
                hub.info( "The status becomes '" + newStatus + "'" );
            hub._status = newStatus;
            Logger.Instance.status( hub._status );

            for ( var listener in hub._listeners ) {
                if ( hub._listeners[listener].onStatusChanged ) {
                    hub.debug( "Notify the listener '" + listener + "' about the status '" + newStatus + "'" );
                    hub._listeners[listener].onStatusChanged( newStatus, errors );
                }
            }
        }

        function handleAllowedStatus( hub, newStatus ) {
            return function ( allow ) {
                if ( allow.Error !== null && allow.Error !== undefined ) {
                    var errors = new Errors();
                    errors.setJSON( allow.Error );
                    hub.updateStatus( "Error", errors );
                } else if ( allow.Allow !== null && allow.Allow !== undefined && allow.Allow )
                    handleUpdateStatus( hub, newStatus );
                else {
                    hub.updateStatus( "Error", new Errors( "ERR_AUTHENTICATED_TWICE" ) );
                }
            };
        }

        if ( newStatus !== "ReadyToSynchronize" ) {
            handleUpdateStatus( this, newStatus, errors );
            return;
        }

        this.isAllowed( handleAllowedStatus( this, newStatus ) );
    }

    /**
     * Start the initialization connection
     * @param {any} area     area name
     * @param {any} moduleId Id of the current module (started within this screen)
     * @param {any} fn       function to call as the initialization is done
     * @param {any} fnError  function to call if the initialization has failed
     */
    initialize ( area, moduleId, fn, fnError ) {
        this.info( "Initializing for the area '" + area + "' (" + moduleId + ") ..." );
        $.connection.databaseHub.server.initialize( area, moduleId ).done( fn ).fail( fnError );
    }

    /**
     * Ask the content of a table
     * @param {any} table   table name to load
     * @param {any} fn      function to call as the records are ready
     * @param {any} fnError function to call if the loading has failed
     */
    loadTable ( table, fn, fnError ) {
        this.info( "Retrieving content of the table '" + table + "' ..." );
        $.connection.databaseHub.server.loadTable( table ).done( fn ).fail( fnError );
    }

    /**
     * Send a new request to the server
     * @param {any} requestId id of the request to execute
     * @param {any} label     code label description the request
     * @param {any} table     table name concerned by the request
     * @param {any} action    action corresponding to the request
     * @param {any} record    description of the request
     * @param {any} identity  client identity corresponding to the request
     * @param {any} fn        function to call as the request is executed by the server
     */
    executeRequest ( requestId, label, table, action, record, identity, fn ) {
        this.info( "Executing the request: [" + requestId + "] => { Label = '" + String.JSONStringify( label ) + "', Table = '" + table + "', Action = '" + action + "', Record = " + String.JSONStringify( record ) + ", Identity = " + String.JSONStringify( identity ) + "} ..." );
        $.connection.databaseHub.server.executeRequest( requestId, label, table, action, record, identity ).done( fn );
    }

    /**
     * Send a new transaction to the server
     * @param {any} requestId   id of the request to execute
     * @param {any} label       code label description the request
     * @param {any} transaction description of the transaction
     * @param {any} fn          function to call as the transaction is executed by the server
     */
    executeTransaction ( requestId, label, transaction, fn ) {
        this.info( "Executing the transaction: [" + requestId + "] => { Label = '" + String.JSONStringify( label ) + "', Transaction = '" + String.JSONStringify( transaction ) + "'} ..." );
        $.connection.databaseHub.server.executeTransaction( requestId, label, transaction ).done( fn );
    }

    /**
     * Send a service to the server
     * @param {any} service   service name to execute
     * @param {any} record    description of the service
     * @param {any} identity  client identity corresponding to the service
     * @param {any} fn        function to call as the service is executed by the server
     */
    executeService ( service, record, identity, fn ) {
        this.info( "Executing the service: { Service = '" + service + "', Record = " + String.JSONStringify( record ) + ", Identity = " + String.JSONStringify( identity ) + "} ..." );
        $.connection.databaseHub.server.executeService( service, record, identity ).done( fn );
    }

    /**
     * Receiving a begin notification from the server
     * @param {any} tick  tick of the begining of the notification
     * @param {any} label code label to show
     */
    beginNotification ( tick, label ) {
        // ignore all notifications received in case of "ReadyToSynchronize" status
        // In the synchronization process, we will receive all updated data .. so, notification is not mandatory

        if ( this._status === "ReadyToSynchronize" )
            return;

        for ( var listener in this._listeners ) {
            if ( this._listeners[listener].beginNotification ) {
                this.debug( "Notify the listener '" + listener + "' for the beginning of notification (" + tick.toString() + ", " + String.JSONStringify( label ) + ")" );
                this._listeners[listener].beginNotification( tick, label );
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
    notify ( userId, label, area, lot ) {
        // ignore all notifications received in case of "ReadyToSynchronize" status
        // In the synchronization process, we will receive all updated data .. so, notification is not mandatory

        if ( this._status === "ReadyToSynchronize" )
            return;

        for ( var listener in this._listeners ) {
            if ( this._listeners[listener].notify ) {
                this.debug( "Notify the listener '" + listener + "' about an update from the user '" + userId + "' for (" + String.JSONStringify( label ) + ", '" + area + "', " + String.JSONStringify( lot ) );

                for ( var i = 0; i < lot.length; i++ )
                    this._listeners[listener].notify( userId, label, area, lot[i].table, lot[i].record );
            }
        }
    }

    /**
     * Receiving an end notification from the server
     * @param {any} tick  tick of the ending of the notification
     * @param {any} label code label to show
     */
    endNotification ( tick, label ) {
        // ignore all notifications received in case of "ReadyToSynchronize" status
        // In the synchronization process, we will receive all updated data .. so, notification is not mandatory

        if ( this._status === "ReadyToSynchronize" )
            return;

        for ( var listener in this._listeners ) {
            if ( this._listeners[listener].endNotification ) {
                this.debug( "Notify the listener '" + listener + "' for the ending of notification (" + tick.toString() + ", " + String.JSONStringify( label ) + ")" );
                this._listeners[listener].endNotification( tick, label );
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
     */
    acknowledgeRequest ( requestId, area, table, action, record, identity ) {
        // do not ignore acknowledges from the server because it corresponds to a request sent

        for ( var listener in this._listeners ) {
            if ( this._listeners[listener].acknowledgeRequest ) {
                this.debug( "Notify the listener '" + listener + "' about an acknowledge from the request '" + requestId + "' for ('" + area + "', '" + table + "', '" + action + "', " + String.JSONStringify( record ) + ", " + String.JSONStringify( identity ) + ")" );
                this._listeners[listener].acknowledgeRequest( requestId, area, table, action, record, identity );
            }
        }
    }

    /**
     * Receiving an acknowledge from the server
     * @param {any} requestId   id of the transaction acknowledged
     * @param {any} area        area name
     * @param {any} transaction transaction acknowledged
     */
    acknowledgeTransaction ( requestId, area, transaction ) {
        // do not ignore acknowledges from the server because it corresponds to a request sent

        for ( var listener in this._listeners ) {
            if ( this._listeners[listener].acknowledgeTransaction ) {
                this.debug( "Notify the listener '" + listener + "' about an acknowledge from the transaction '" + requestId + "' for ('" + area + "', " + String.JSONStringify( transaction ) + ")" );
                this._listeners[listener].acknowledgeTransaction( requestId, area, transaction );
            }
        }
    }

    /**
     * Receiving an acknowledge from the server
     * @param {any} requestId id of the request acknowledged
     * @param {any} area      area name
     * @param {any} service   service
     * @param {any} record    description of the service
     * @param {any} identity  identity of the description
     */
    acknowledgeService ( requestId, area, service, record, identity ) {
        // do not ignore acknowledges from the server because it corresponds to a service sent

        for ( var listener in this._listeners ) {
            if ( this._listeners[listener].acknowledgeService ) {
                this.debug( "Notify the listener '" + listener + "' about an acknowledge from the service '" + requestId + "' for ('" + area + "', '" + service + "', " + String.JSONStringify( record ) + ", " + String.JSONStringify( identity ) + ")" );
                this._listeners[listener].acknowledgeService( requestId, area, service, record, identity );
            }
        }
    }

    /**
     * Start the hub service
     */
    start () {
        if ( this._status === "Started" ||
            this._status === "Starting" ||
            this._status === "ReadyToSynchronize" )
            return;

        if ( this._status === "NotInitialized" ) {
            this.updateStatus( "Starting" );

            $.connection.hub.start().done( function () {
                Hub.Instance.updateStatus( "Started" );
            } );
        } else {
            this.updateStatus( "Starting" );

            $.connection.hub.start().done( function () {
                Hub.Instance.updateStatus( "ReadyToSynchronize" );
            } );
        }
    }

    /**
     * Start the synchronization process into the hub service
     */
    synchronize () {
        if ( this._status !== "ReadyToSynchronize" )
            return;

        this.updateStatus( "Started" );
    }

    /**
     * Retrieve the status from the client (check if this application cliente is allowed to run)
     * @param {any} fn function to call as the status is known
     */
    isAllowed ( fn ) {
        function handleIsAllowed( hub, fn ) {
            return function ( allow ) {
                hub.info( "IsAllowed = " + String.JSONStringify( allow ) );
                window.clearInterval( hub._intervalHandler );
                hub._intervalHandler = null;
                fn( allow );
            };
        }

        function handleFailed( hub ) {
            return function () {
                hub.error( "IsAllowed = failed!" );
                window.clearInterval( hub._intervalHandler );
                hub._intervalHandler = null;
            };
        }

        function handleRunningIsAllowed( hub, fn ) {
            return function () {
                hub.verbose( "Running is allowed ..." );
                $.connection.databaseHub.server.isAllowed().done( handleIsAllowed( hub, fn ) ).fail( handleFailed( hub ) );
            };
        }

        this._intervalHandler = window.setInterval( handleRunningIsAllowed( this, fn ), 1000 );
    }

    /**
     * Stop the hub service
     * @param {any} force true, stop the connection even if the status is not stopped!
     */
    stop ( force ) {
        if ( force !== null && force !== undefined && force ) {
            $.connection.hub.stop();
            return;
        }

        if ( !this.IsRunning || this._status === "Stopping" )
            return;

        this.updateStatus( "Stopping" );

        var stop = $.connection.hub.stop();
        if ( stop.done )
            stop.done( function () { Hub.Instance.updateStatus( "Stopped" ); } );
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
     * Constructor
     */
    constructor() {
        super("HUB" );

        this._status = "NotInitialized";
        this._listeners = {};
        this._intervalHandler = null;

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

$.connection.databaseHub.client.beginNotification = function (tick, label) {
    Hub.Instance.beginNotification(tick, label);
};

$.connection.databaseHub.client.notify = function (userId, label, area, lot) {
    Hub.Instance.notify(userId, label, area, lot);
};

$.connection.databaseHub.client.endNotification = function (tick, label) {
    Hub.Instance.endNotification(tick, label);
};

$.connection.databaseHub.client.acknowledgeRequest = function (requestId, area, table, action, record, identity) {
    Hub.Instance.acknowledgeRequest(requestId, area, table, action, record, identity);
};

$.connection.databaseHub.client.acknowledgeTransaction = function (requestId, area, transaction) {
    Hub.Instance.acknowledgeTransaction(requestId, area, transaction);
};

$.connection.databaseHub.client.acknowledgeService = function (requestId, area, service, record, identity) {
    Hub.Instance.acknowledgeService(requestId, area, service, record, identity);
};

$.connection.databaseHub.client.stop = function () {
    Logger.Instance.info("HUB", "Stop");
    $.connection.hub.stop();
};

$.connection.databaseHub.client.ping = function () {
    Logger.Instance.info("HUB", "Ping");
    $.connection.databaseHub.server.ping();
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
