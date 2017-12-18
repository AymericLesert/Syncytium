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
 * Handle the logger in the client side
 */
class Logger {
    /**
     * Filename of the log to download
     */
    static get LOG_FILENAME() {
        return "log.txt";
    }

    /**
     * Maximum number of lines into the log table
     */
    static get MAX_LINES() {
        return 100000;
    }

    /**
     * True if the log is in verbose mode
     */
    get IsVerbose () {
        return this._isVerbose;
    }

    /**
     * @param {boolean} value True if the log is set in verbose mode
     */
    set IsVerbose (value) {
        this._isVerbose = value === true;
        this._isDebug = this._isVerbose === true;
    }

    /**
     * True if the log is in debug mode
     */
    get IsDebug() {
        return this._isDebug;
    }

    /**
     * @param {boolean} value True if the log is set in debug mode
     */
    set IsDebug( value ) {
        this._isDebug = value === true;
    }

    /**
     * True if the log is on
     */
    get IsEnabled() {
        return this._isEnabled;
    }

    /**
     * @param {boolean} value True if the log must be on
     */
    set IsEnabled( value ) {
        this._isEnabled = value === true;
    }

    /**
     * @returns {boolean} true if the logtable is visible
     */
    get Visible() {
        return this._logTable ? this._logTable.isVisible() : false;
    }

    /**
     * Export the content of the log into a text file
     * @returns {boolean} always true
     */
    downloadLogFile () {
        if ( !this._logTable )
            return true;

        var data = [];

        function handleReadLog( table, data ) {
            return function ( row ) {
                var item = table.getItem( row );
                data.push( item.id.toString().padEnd( 8, " " ) + " " + item.date + " [" + item.level + "] " + String.decode( item.module ).padEnd( 48, " " ) + " " + item.allDescription );
            };
        }

        this._logTable.eachRow( handleReadLog( this._logTable, data ) );

        var urlBlob = new Blob( [data.join( '\n' )], { type: 'text/plain;charset=utf-8' } );

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.

        if ( this._logFile !== null )
            window.URL.revokeObjectURL( this._logFile );

        this._logFile = window.URL.createObjectURL( urlBlob );

        // automatic launch the downloading file

        var link = document.createElement( 'a' );
        link.setAttribute( 'download', Logger.LOG_FILENAME );
        link.href = this._logFile;
        document.getElementById( "log" ).appendChild( link );

        // wait for the link to be added to the document

        window.requestAnimationFrame( function () {
            var event = new MouseEvent( 'click' );
            link.dispatchEvent( event );
            document.getElementById( "log" ).removeChild( link );
        } );

        return true;
    }

    /**
     * Add a message into the log table
     * @param {any} level   character describing the level
     * @param {any} module  module name
     * @param {any} message message to add into the log file
     */
    write ( level, module, message ) {
        var newLine = { id: this._id, date: ( new Date() ).toISOString(), level: level, module: module, message: message };
        this._id++;

        this.define();

        if ( this._isEnabled && this._logTable ) {
            var allDescription = String.encode( newLine.message );
            var description = null;

            if ( allDescription.length > 4096 )
                description = allDescription.substring( 0, 4096 ) + "[...]";
            else
                description = allDescription;

            this._logTable.add( { id: this.id, date: newLine.date, level: newLine.level, module: String.encode( newLine.module ), description: description, allDescription: allDescription } );

            if ( this._logTable.count() > Logger.MAX_LINES )
                this._logTable.remove( this._logTable.getFirstId() );
        }
    }

    /**
     * Adjust row height of the table
     * @param {any} rowId if defined, it means the row number to update into the line of the table
     */
    adjustWebix ( rowId ) {
        function processRow( logger, columns, item ) {
            if ( item === null || item === undefined )
                return;

            var height = 1;

            for ( var i = 0; i < columns.length; i++ ) {
                var config = logger._logTable.getColumnConfig( columns[i] );

                $( logger._logAdjustedZoneHTML ).css( 'width', config.width + "px" );
                $( logger._logAdjustedZoneHTML ).css( 'height', "1px" );
                logger._logAdjustedZoneHTML.innerHTML = logger._logTable.getText( item.id, config.id );

                if ( height < logger._logAdjustedZoneHTML.scrollHeight )
                    height = logger._logAdjustedZoneHTML.scrollHeight;

                logger._logAdjustedZoneHTML.innerHTML = "";
            }

            item.$height = height;
        }

        function handleAdjustRow( logger, columns ) {
            return function ( item ) {
                processRow( logger, columns, item );
            };
        }

        if ( this._logTable === null )
            return;

        if ( this._logAdjustedZone === null ) {
            this._logAdjustedZone = $( "<div class='webix_view webix_dtable webix_log'><div class='webix_ss_body'><div class='webix_ss_center'><div class='webix_ss_center_scroll'><div class='webix_column'><div class='webix_cell'></div></div></div></div></div></div>" );
            this._logAdjustedZone.css( 'visibility', 'hidden' );

            $( this._logTable.$view ).append( this._logAdjustedZone );

            this._logAdjustedZoneHTML = this._logAdjustedZone.find( "> div > div > div > div > div" )[0];
        }

        var columns = [];

        for ( var id in this._logTable.config.columns )
            columns.push( this._logTable.config.columns[id].id );

        if ( rowId !== null && rowId !== undefined ) {
            processRow( this, columns, this._logTable.getItem( rowId ) );
            this._logTable.refresh( rowId );
        } else {
            this._logTable.data.each( handleAdjustRow( this, columns ) );
            this._logTable.refresh();
        }
    }

    /**
     * Define the log table
     */
    define () {
        function handleAdjustRow( logger ) {
            return function ( rowId ) {
                logger.adjustWebix( rowId );
            };
        }

        if ( !this._isEnabled || this._logTable )
            return;

        function handleTemplate( board, column ) {
            return function ( item ) {
                switch ( item.level ) {
                    case "V":
                        return "<span class='verbose'>" + item[column] + "</span>";
                    case "D":
                        return "<span class='debug'>" + item[column] + "</span>";
                    case "I":
                        return "<span class='info'>" + item[column] + "</span>";
                    case "W":
                        return "<span class='warning'>" + item[column] + "</span>";
                    case "E":
                        return "<span class='error'>" + item[column] + "</span>";

                    default:
                        return item[column];
                }
            };
        }

        this._logTable = new webix.ui( {
            view: "datatable",
            container: $( "log" )[0],
            css: "webix_log",
            scroll: "y",
            scrollAlignY: false,
            columns: [
                { id: "date", header: "Date", adjust: "data", fillspace: 2, css: { 'text-align': 'center' }, template: handleTemplate( this, "date" ) },
                { id: "level", header: "Level", adjust: "header", fillspace: 1, css: { 'text-align': 'center' }, template: handleTemplate( this, "level" ) },
                { id: "module", header: "Module", adjust: "data", fillspace: 2, css: { 'text-align': 'center' }, template: handleTemplate( this, "module" ) },
                { id: "description", header: "Description (<a href='#' onclick='javascript:Logger.Instance.downloadLogFile();'>client</a> - <a href='/Administration/Administration/Log?date=" + new moment().format( "YYYY-MM-DD" ) + "' target='_blank'>server</a>)", adjust: "data", fillspace: 15, css: { 'text-align': 'left' }, template: handleTemplate( this, "description" ) }
            ],
            resizeColumn: true,
            fixedRowHeight: false,
            rowLineHeight: 15,
            rowHeight: 15,
            on: {
                onItemDblClick: handleAdjustRow( this )
            }
        } );
        this._logTable.hide();

        // handle the window resizing

        function handleResize( logger ) {
            return function () {
                // Add a throttling on resizing

                clearTimeout( logger._throttle );
                logger._throttle = setTimeout( function () {
                    if ( logger._logTable.isVisible() )
                        logger._logTable.resize();
                }, 100 );
            };
        }

        $( window ).on( 'resize', handleResize( this ) );

        // message starting the log file

        this.write( "I", "Log", "-----------------------------------------------------" );
        this.write( "I", "Log", "Module : " + this._moduleArea );
        this.write( "I", "Log", "Version : " + this._moduleVersion );
        this.write( "I", "Log", "Parameters : " + window.location.search );
        this.write( "I", "Log", "-----------------------------------------------------" );
        this.id++;
    }

    /**
     * Declare the module of the application and it version
     * @param {any} module  module name of the application
     * @param {any} version version of the application
     */
    setModule ( module, version ) {
        this._moduleArea = module;
        this._moduleVersion = version;
    }

    /**
     * Show the log table
     */
    show () {
        this.define();

        if ( !this._logTable )
            return;

        $( 'page' ).hide();
        $( 'log' ).show();

        this._logTable.show();
    }

    /**
     * Hide the log table
     */
    hide () {
        this.define();

        if ( !this._logTable )
            return;

        this._logTable.hide();

        $( 'log' ).hide();
        $( 'page' ).show();
    }

    /**
     * Add a verbose message
     * @param {any} module  module name
     * @param {any} message message to add into the log file
     */
    verbose ( module, message ) {
        if ( !this._isVerbose )
            return;
        this.write( "V", module, message );
    }

    /**
     * Add a debug message
     * @param {any} module  module name
     * @param {any} message message to add into the log file
     */
    debug ( module, message ) {
        if ( !this._isDebug )
            return;
        this.write( "D", module, message );
    }

    /**
     * Add an info message
     * @param {any} module  module name
     * @param {any} message message to add into the log file
     */
    info ( module, message ) {
        this.write( "I", module, message );
    }

    /**
     * Add a warning message
     * @param {any} module  module name
     * @param {any} message message to add into the log file
     */
    warn ( module, message ) {
        this.write( "W", module, message );
    }

    /**
     * Add an error message
     * @param {any} module  module name
     * @param {any} message message to add into the log file
     */
    error ( module, message ) {
        this.write( "E", module, message );
    }

    /**
     * Add an exception message
     * @param {any} module  module name
     * @param {any} message message to add into the log file
     * @param {any} e       exception to log
     */
    exception ( module, message, e ) {
        if ( e.message )
            message += " : " + e.message;

        if ( e.stack )
            message += ' | stack: ' + e.stack;

        if ( typeof e === "string" )
            message += " : " + e;

        this.write( "E", module, message );
    }

    /**
     * Update the connection status of the application
     * @param {any} message new status of the connection
     */
    status( message ) {
        function handleStatusStarting( logger ) {
            return function () {
                if ( $( "header > ul > li.status" ).hasClass( "started" ) === true ) {
                    $( "header > ul > li.status" ).removeClass( "started" );
                    $( "header > ul > li.status" ).addClass( "stopped" );
                } else {
                    $( "header > ul > li.status" ).removeClass( "stopped" );
                    $( "header > ul > li.status" ).addClass( "started" );
                }

                /*
                if ( logger._intervalStatus !== null ) {
                    window.clearInterval( logger._intervalStatus );
                    logger._intervalStatus = window.setInterval( handleStatusStarting( logger ), 800 );
                }
                */
            };
        }

        this._currentStatus = message;
        let status = $( "header > ul > li.status" );

        status.unbind();
        var cssClass = null;
        var cssClasses = [ "starting", "started", "stopping", "stopped", "readytosynchronize" ];
        switch ( message ) {
            case "Starting":
                cssClass = "starting";
                this._currentStatus = "STATUS_STARTING";
                break;
            case "Started":
                cssClass = "started";
                this._currentStatus = "STATUS_STARTED";
                break;
            case "Stopping":
                cssClass = "stopping";
                this._currentStatus = "STATUS_STOPPING";
                break;
            case "Error":
            case "NotInitialized":
            case "Stopped":
                cssClass = "stopped";
                this._currentStatus = "STATUS_STOPPED";
                break;
            case "ReadyToSynchronize":
                cssClass = "readytosynchronize";
                this._currentStatus = "STATUS_READY";
                $( "header > ul > li.status" ).click( function () { Hub.Instance.synchronize(); } );
                break;
        }

        if ( this._intervalStatus !== null ) {
            window.clearInterval( this._intervalStatus );
            this._intervalStatus = null;
        }

        for ( let i = 0; i < cssClasses.length; i++ )
            status.removeClass( cssClasses[i] );

        if ( cssClass === "starting" || cssClass === "stopping" )
            this._intervalStatus = window.setInterval( handleStatusStarting( this ), 1000 );
        else if ( cssClass !== null )
            status.addClass( cssClass );

        status.hover( function () {
            $( '<p class="image webix_tooltip"></p>' ).html( Helper.Span( Logger.Instance._currentStatus ) ).appendTo( 'body' ).fadeIn( 'slow' );
        }, function () {
            $( '.image.webix_tooltip' ).remove();
        } ).mousemove( function ( e ) {
            var mousex = e.pageX + 10;
            var mousey = e.pageY;
            $( '.image.webix_tooltip' ).css( { top: mousey, left: mousex } );
        } );
    }

    /**
     * Constructor of the singleton
     */
    constructor() {
        this._isVerbose = false;
        this._isDebug = false;
        this._isEnabled = false;
        this._logTable = null;
        this._logAdjustedZone = null;
        this._logAdjustedZoneHTML = null;
        this._currentStatus = null;
        this._logFile = null;
        this._id = 0;
        this._moduleArea = "";
        this._moduleVersion = "";
        this._intervalStatus = null;
        this._throttle = null;
    }

    /**
     * @returns {Logger} the instance of the singleton
     */
    static get Instance() {
        if ( !this._instance )
            this._instance = new Logger();

        return this._instance;
    }
}
