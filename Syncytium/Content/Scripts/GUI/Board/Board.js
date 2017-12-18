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
 * Handle a table of elements
 */
GUI.Board = {};

/**
 * Define the list of icons to represent into the table
 * Use a combination of icons
 */
GUI.Board.BOARD_ICON = 1;
GUI.Board.BOARD_ADD = 2;
GUI.Board.BOARD_CANCEL = 4;
GUI.Board.BOARD_DELETE = 8;
GUI.Board.BOARD_HELP = 16;

GUI.Board.BOARD_NONE = 0;
GUI.Board.BOARD_ALL = 255;

/**
 * The reference on the last export CSV file
 */
GUI.Board.ExportCSVFile = null;

/**
 * Abstract class handling a table of element
 */
GUI.Board.Board = class extends GUI.GUI {
    /**
     * Set the read only flag of the board
     * @param {boolean} value readonly of updatable
     */
    set Readonly( value ) {
        super.Readonly = value;

        if ( this.Component === null )
            return;

        if ( this.Readonly )
            this.Component.find( "> .title > .div" ).addClass( 'readonly' );
        else
            this.Component.find( "> .title > .div" ).removeClass( 'readonly' );
    }

    /**
     * @returns {boolean} true if the board is readonly
     */
    get Readonly() {
        return super.Readonly;
    }

    /**
     * @param {any} link string towards to the documentation, function to call on clicking on help
     */
    set Help( link ) {
        function handleHelp( board ) {
            return function () {
                if ( typeof board._link === "string" )
                    window.open( board._link, "_blank" );

                if ( typeof board._link === "function" )
                    board._link();
            };
        }

        this._link = link === null || link === undefined ? null : link;

        if ( this._link === null )
            this.off( "help" );
        else
            this.on( "help", handleHelp( this ) );
    }

    /**
     * Set a panel name to this board
     * @param {any} value panel name
     */
    set Panel( value ) {
        this._panel = value;
    }

    /**
     * @returns {any} panel name
     */
    get Panel() {
        return this._panel;
    }

    /**
     * @returns {boolean} if the icon (at the top of the left) is visible
     */
    get IsVisibleIcon() {
        return this._icons & GUI.Board.BOARD_ICON;
    }

    /**
     * @returns {boolean} if the icon "Add" (at the top of the right) is visible
     */
    get IsVisibleAdd() {
        return this._icons & GUI.Board.BOARD_ADD;
    }

    /**
     * @returns {boolean} if the icon "Cancel" (at the top of the right) is visible
     */
    get IsVisibleCancel() {
        return this._icons & GUI.Board.BOARD_CANCEL;
    }

    /**
     * @returns {boolean} if the icon "Delete" (at the top of the right) is visible
     */
    get IsVisibleDelete() {
        return this._icons & GUI.Board.BOARD_DELETE;
    }

    /**
     * @returns {boolean} if the icon "Help" (at the top of the right) is visible
     */
    get IsVisibleHelp() {
        return this._icons & GUI.Board.BOARD_HELP;
    }

    /**
     * @return {List.List} list of elements shown in this board
     */
    get List() {
        return this._list;
    }

    /**
     * @returns {any} jQuery of the table div into the component
     */
    get TableZone () {
        return this.Component.find( "> .table" );
    }

    /**
     * @returns {any} webix component managed by this board
     */
    get Webix() {
        return this._webix;
    }

    /**
     * Replace the webix component
     * @param {any} value new webix component
     */
    set Webix( value ) {
        if ( this._webix !== null )
            this._webix.destructor();
        this._webix = value;
    }

    /**
     * Destructor
     */
    destructor () {
        super.destructor();

        if ( this._webix !== null ) {
            this._webix.destructor();
            this._webix = null;
        }
    }

    /**
     * show the board
     */
    show () {
        if ( this.IsOpened )
            return;

        this.debug( "Show the board" );

        this.onOpen();
        this.refresh();
        this.Component.show();

        if ( this._webix !== null ) {
            this.populateWebix();
            this.adjustWebix();
        }
    }

    /**
     * Hide the board
     */
    hide () {
        if ( !this.IsOpened || !this.Visible )
            return;

        this.debug( "Hide the board" );

        this.onClose();
        this.Component.hide();
    }

    /**
     * Show a combination of icons
     * @param {any} icon    if it's a boolean, see Visible setter, else an integer representing a combination of icons
     * @param {any} visible true or false (show or mask)
     */
    setVisible( icon, visible ) {
        function updateIcons( board, value, icon, visible ) {
            if ( !( value & icon ) )
                return;

            if ( visible ) {
                if ( !( board._icons & icon ) )
                    board._icons += icon;
            } else {
                if ( board._icons & icon )
                    board._icons -= icon;
            }
        }

        if ( icon === null || icon === undefined )
            return;

        if ( typeof icon === "boolean" ) {
            super.Visible = icon;
            return;
        }

        updateIcons( this, icon, GUI.Board.BOARD_ICON, visible );
        updateIcons( this, icon, GUI.Board.BOARD_ADD, visible );
        updateIcons( this, icon, GUI.Board.BOARD_CANCEL, visible );
        updateIcons( this, icon, GUI.Board.BOARD_DELETE, visible );
        updateIcons( this, icon, GUI.Board.BOARD_HELP, visible );

        this.refreshIcon( "board", this.IsVisibleIcon );
        this.refreshIcon( "add", this.IsVisibleAdd );
        this.refreshIcon( "cancel", this.IsVisibleCancel );
        this.refreshIcon( "delete", this.IsVisibleDelete );
        this.refreshIcon( "help", this.IsVisibleHelp );
    }

    /**
     * Private mathode
     * Show or hide an icon of the board
     * @param {any} icon    name of the icon
     * @param {any} visible true or false
     */
    refreshIcon( icon, visible ) {
        function handleClick( table, icon ) {
            return function () {
                switch ( icon ) {
                    case "board":
                        table.onBoard();
                        break;

                    case "add":
                        table.onAdd();
                        break;

                    case "cancel":
                        table.onCancel();
                        break;

                    case "delete":
                        table.onDelete();
                        break;

                    case "help":
                        table.onHelp();
                        break;
                }
            };
        }

        if ( this.Component === null )
            return;

        var componentIcon = this.Component.find( "> .title > .icon." + icon );

        if ( visible ) {
            if ( componentIcon.hasClass( "hide" ) )
                componentIcon.removeClass( "hide" );
        }
        else {
            if ( !componentIcon.hasClass( "hide" ) )
                componentIcon.addClass( "hide" );
        }

        if ( componentIcon.hasClass( "disallowed" ) )
            componentIcon.removeClass( "disallowed" );

        if ( this.isEvent( icon ) && this.List.isBoardAllowed(this, DSDatabase.Instance.CurrentUser, icon) ) {
            componentIcon.css( 'cursor', 'pointer' );
            componentIcon.off( 'click' ).on( 'click', handleClick( this, icon ) );
        } else if ( !visible ) {
            componentIcon.css( 'cursor', 'initial' );
            componentIcon.off( 'click' );
        } else {
            componentIcon.addClass( "disallowed" );
            componentIcon.css( 'cursor', 'initial' );
            componentIcon.off( 'click' );
        }
    }

    /**
     * Method to refresh the table
     */
    refresh () {
        super.refresh();

        if ( this.Component === null || this._webix === null )
            return;

        // set title

        this.Component.find( "> .title > .title" ).html( Helper.Span( this._title ) );

        // set visibility and action

        this.refreshIcon( "board", this.IsVisibleIcon );
        this.refreshIcon( "add", this.IsVisibleAdd );
        this.refreshIcon( "cancel", this.IsVisibleCancel );
        this.refreshIcon( "delete", this.IsVisibleDelete );
        this.refreshIcon( "help", this.IsVisibleHelp );

        // set readonly

        if ( this.Readonly ) {
            this.Component.find( "> .title > div" ).addClass( 'readonly' );
        } else {
            this.Component.find( "> .title > div" ).removeClass( 'readonly' );
        }
    }

    /**
     * Abstract method to adjust thewebix object
     */
    adjustWebix () {
        this.debug( "Adjust webix" );

        // resize the webix object

        var tableZone = this.TableZone;
        var width = Math.floor( tableZone.width() );
        var height = Math.floor( tableZone.height() );

        if ( width !== this._webix.config.width || height !== this._webix.config.height ) {
            this._webix.config.width = width;
            this._webix.config.height = height;
            this._webix.resize();
        }
    }

    /**
     * Draw the table into the container
     */
    draw () {
        var content = "<board id='" + this.Name + "' class='" + this.Name + "'>";
        content += "<div class='title'>";
        content += "<div class='icon board'></div>";
        content += "<div class='title'></div>";
        content += "<div class='icon add'></div>";
        content += "<div class='icon cancel'></div>";
        content += "<div class='icon delete'></div>";
        content += "<div class='icon help'></div>";
        content += "</div>";
        content += "<div class='table'></div>";
        content += "</board>";

        super.draw( content );
        this._webix = this.drawWebix( this.TableZone );

        // handle the window resizing

        function handleResize( board ) {
            return function () {
                if ( !board.IsOpened )
                    return;

                // Add a throttling on resizing

                clearTimeout( board._throttle );
                board._throttle = setTimeout( function () {
                    board.debug( "Resizing window ..." );
                    board.adjustWebix();
                }, 100 );
            };
        }

        $( window ).on( 'resize', handleResize( this ) );
    }

    /**
     * Abstract method to populate the webix object
     */
    populateWebix () {
        this.debug( "Populate webix" );
    }

    /**
     * Virtual method
     * @param {any} container reference on the container having the webix component
     * @returns {any} Webix object representing the board
     */
    drawWebix ( container ) {
        return null;
    }

    /**
     * Called on onOpenning the field
     */
    onOpen() {
        function handleFocus( board ) {
            return function () {
                if ( board.Readonly )
                    return;

                if ( board.Box !== null )
                    board.Box.setFocus( board );
            };
        }

        function handleKeydown( board ) {
            return function ( event ) {
                let keyCode = event.which || event.keyCode;

                switch ( keyCode ) {
                    case 9:
                        event.preventDefault();
                        if ( event.shiftKey )
                            board.previousFocus();
                        else
                            board.nextFocus();
                        return false;

                    case 13:
                        event.preventDefault();
                        board.onUpdate();
                        return false;

                    case 27:
                        event.preventDefault();
                        board.onButtonCancel();
                        return false;
                }
            };
        }

        super.onOpen();

        this.Component.on( 'focus', handleFocus( this ) );
        this.Component.on( 'keydown', handleKeydown( this ) );
    }

    /**
     * Called on onClosing the field
     */
    onClose() {
        super.onClose();

        this.Component.off( 'focus keydown' );
    }

    /**
     * Private methode
     * Event raised on clicking on the right icon
     * @param {boolean} visible true if the icon corresponding to the event is visible
     * @param {string} event event name to raise
     */
    onEvent(visible, event) {
        if ( !visible )
            return;

        if ( !this.List.isBoardAllowed( this, DSDatabase.Instance.CurrentUser, event) )
            return;

        var fnEvent = this.getEvent( event );
        if ( fnEvent === null )
            return;

        fnEvent();
    }

    /**
     * Event raised on clicking on the icon of the board
     */
    onBoard() {
        this.onEvent( this.IsVisibleIcon, "board" );
    }

    /**
     * Event raised on Add a new element into the board
     */
    onAdd () {
        this.onEvent( this.IsVisibleAdd, "add" );
    }

    /**
     * Event raised on Cancel a element selected into the board
     */
    onCancel () {
        this.onEvent( this.IsVisibleCancel, "cancel" );
    }

    /**
     * Event raised on Delete a element selected into the board
     */
    onDelete () {
        this.onEvent( this.IsVisibleDelete, "delete" );
    }

    /**
     * Event raised on Help the board
     */
    onHelp() {
        this.onEvent( this.IsVisibleHelp , "help" );
    }

    /**
     * Add a new item into a transaction and commit it if necessary
     * @param {any} newRecord new record to add into the list
     * @param {any} list list of items
     */
    addItem( newRecord, list ) {
        function handleConfirmation( board, newRecord, list ) {
            return function () {
                // Run the validation again ...

                var errors = new Errors();

                if ( list.Table !== undefined )
                    list.beginTransaction( Helper.Label( list.Table.toUpperCase() + "_CREATED_TOAST", list.getText( newRecord ) ) );
                else
                    list.beginTransaction();

                var itemUpdated = list.addItem( newRecord, errors, true );

                list.endTransaction();

                if ( errors.HasError ) {
                    if ( window.administration === undefined )
                        list.rollback( oldRecord );

                    GUI.Box.Message.Error( "ERROR", errors );
                    return;
                }

                if ( window.administration === undefined )
                    list.commit( itemUpdated );
            };
        }

        var errors = new Errors();
        list = list === undefined || list === null ? this.List : list;

        if ( list.Table !== undefined )
            list.beginTransaction( Helper.Label( list.Table.toUpperCase() + "_CREATED_TOAST", list.getText( newRecord ) ) );
        else
            list.beginTransaction();

        var confirmation = list.addItem( newRecord, errors, false );

        list.endTransaction();

        if ( Helper.IsLabel( confirmation ) ) {
            // it's a message of confirmation

            GUI.Box.Message.Message( Helper.Label( list.Table === undefined ? this.Title : list.Table.toUpperCase() + "_CREATE", list.getText( newRecord ) ),
                                     confirmation,
                                     handleConfirmation( this, newRecord, list ) );

            return;
        }

        if ( errors.HasError ) {
            if ( window.administration === undefined )
                list.rollback( oldRecord );

            GUI.Box.Message.Error( "ERROR", errors );
            return;
        }

        if ( window.administration === undefined )
            list.commit( confirmation );
    }

    /**
     * Update an existing record into a transaction and commit it if necessary
     * @param {any} oldRecord record to update
     * @param {any} newRecord new record
     * @param {any} list list of items
     */
    updateItem( oldRecord, newRecord, list ) {
        function handleConfirmation( board, oldRecord, newRecord, list ) {
            return function () {
                // Run the validation again ...

                var errors = new Errors();

                if ( board.List.Table !== undefined )
                    board.List.beginTransaction( Helper.Label( board.List.Table.toUpperCase() + "_UPDATED_TOAST", board.List.getText( newRecord ) ) );
                else
                    board.List.beginTransaction();

                var itemUpdated = board.List.updateItem( oldRecord.Id, oldRecord, newRecord, errors, true );

                board.List.endTransaction();

                if ( errors.HasError ) {
                    if ( window.administration === undefined )
                        board.List.rollback( oldRecord );

                    GUI.Box.Message.Error( "ERROR", errors );
                    return;
                }

                if ( window.administration === undefined )
                    board.List.commit( itemUpdated );
            };
        }

        var errors = new Errors();
        list = list === undefined || list === null ? this.List : list;

        if ( list.Table !== undefined )
            list.beginTransaction( Helper.Label( list.Table.toUpperCase() + "_UPDATED_TOAST", list.getText( newRecord ) ) );
        else
            list.beginTransaction();

        var confirmation = list.updateItem( oldRecord.Id, oldRecord, newRecord, errors, false );

        list.endTransaction();

        if ( Helper.IsLabel( confirmation ) ) {
            // it's a message of confirmation

            GUI.Box.Message.Message( Helper.Label( list.Table === undefined ? this.Title : list.Table.toUpperCase() + "_UPDATE", list.getText( newRecord ) ),
                                     confirmation,
                                     handleConfirmation( this, oldRecord, newRecord, list ) );

            return;
        }

        if ( errors.HasError ) {
            if ( window.administration === undefined )
                list.rollback( oldRecord );

            GUI.Box.Message.Error( "ERROR", errors );
            return;
        }

        if ( window.administration === undefined )
            list.commit( confirmation );
    }

    /**
     * Update an existing record into a transaction and commit it if necessary
     * @param {any} oldRecord record to delete
     * @param {any} list list of items
     */
    deleteItem( oldRecord, list ) {
        var errors = new Errors();
        list = list === undefined || list === null ? this.List : list;

        if ( list.Table !== undefined )
            list.beginTransaction( Helper.Label( list.Table.toUpperCase() + "_DELETED_TOAST", list.getText( oldRecord ) ) );
        else
            list.beginTransaction();

        var itemDeleted = list.deleteItem( oldRecord.Id, oldRecord, errors );

        list.endTransaction();

        if ( errors.HasError ) {
            if ( window.administration === undefined )
                list.rollback( itemDeleted );

            GUI.Box.Message.Error( "ERROR", errors );
            return;
        }

        if ( window.administration === undefined )
            list.commit( itemDeleted );
    }

    /**
     * Export the content of the table into a CSV file
     * @param {string} filename filename of the CSV file (if undefined, it's the name of the board)
     * @return {boolean} true
     */
    exportCSV( filename ) {
        // Build CSV file

        let csv = new CSV();
        csv.addList( this.List );
        var urlBlob = new Blob( csv.toBlob( DSDatabase.Instance.Parameters["CSV.Charset"], DSDatabase.Instance.Parameters["CSV.Separator"]), { encoding: csv.Charset, type: 'text/csv;charset=' + csv.Charset } );

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.

        if ( GUI.Board.ExportCSVFile !== null )
            window.URL.revokeObjectURL( GUI.Board.ExportCSVFile );

        GUI.Board.ExportCSVFile = window.URL.createObjectURL( urlBlob );

        // automatic launch the downloading file

        filename = filename === undefined || filename === null ? this.Name + ".csv" : filename;

        let link = document.createElement( 'a' );
        link.setAttribute( 'download', filename );
        link.href = GUI.Board.ExportCSVFile;
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
     * Add board content into the PDF file
     * @param {any} docPDF   docPDF to complete
     * @param {any} fnEnd    function to call if the document is complete and ok
     * @param {any} fnError  function to call if an exception occurs
     */
    toPDF ( docPDF, fnEnd, fnError ) {
        fnEnd( docPDF );
    }

    /**
     * Export data from the board to PDF format
     */
    exportPDF () {
        if ( !Hub.Instance.IsOnline && !PDF.INITIALIZATION_DONE ) {
            GUI.Box.Message.Error( "ERROR", "ERR_UNABLE_PDF" );
            return;
        }

        this.info( "Exporting board into a PDF file ..." );

        GUI.Box.Progress.Start();
        GUI.Box.Progress.SetStatus( 0, 2, "MSG_PDF" );

        function initializePDF( board ) {
            return function () {
                var docPDF = PDF.Create( board._title );

                function handleCreatePDF( board ) {
                    return function ( docPDF ) {
                        try {
                            GUI.Box.Progress.Stop();
                            board.info( "PDF file : " + String.JSONStringify( docPDF ) );
                            pdfMake.createPdf( docPDF ).download( board.Name + ".pdf" );
                            board.info( "Export done into a PDF file" );
                        } catch ( ex ) {
                            GUI.Box.Progress.Stop();
                            board.exception( "Unable to create PDF file", ex );
                            GUI.Box.Message.Error( "ERROR", "ERR_DOWNLOAD_PDF" );
                        }
                    };
                }

                board.toPDF( docPDF, handleCreatePDF( board ), function ( error ) { GUI.Box.Progress.Stop(); GUI.Box.Message.Error( "ERROR", error ); } );
            };
        }

        PDF.Initialize( initializePDF( this ) );
    }

    /**
     * Constructor
     * @param {any} box      string describing the html container, an html object or a GUI.Box
     * @param {any} name     identify the board
     * @param {any} cssClass css class of the board
     * @param {any} title    string describing the title of the table (using Helper.Span)
     * @param {any} list     list of elements (See List.List)
     * @param {any} icons    icons expected into the table (See BOARD_ICON, BOARD_ADD, ...)
     */
    constructor( box, name, cssClass, title, list, icons ) {
        super( "board", box, name, "board " + cssClass ? cssClass : "" );

        this._panel = null;
        this._link = null;
        this._title = Helper.Label( title );
        this._list = list instanceof List.List ? list : new List.List();
        this._icons = icons !== null && icons !== undefined ? icons : GUI.Board.BOARD_ICON + GUI.Board.BOARD_ADD + GUI.Board.BOARD_CANCEL + GUI.Board.BOARD_DELETE;
        this._webix = null;
        this._CSVColumns = null;
    }
};
