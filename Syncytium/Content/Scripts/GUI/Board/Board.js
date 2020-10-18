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
 * Handle a table of elements
 */
GUI.Board = {};

/**
 * Define the list of icons to represent into the table
 * Use a combination of icons
 */
GUI.Board.BOARD_ICON = 1;
GUI.Board.BOARD_ADD = 2;
GUI.Board.BOARD_EDIT = 4;
GUI.Board.BOARD_CANCEL = 8;
GUI.Board.BOARD_DELETE = 16;
GUI.Board.BOARD_HELP = 32;

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
     * Retrieve the board title
     */
    get Title() {
        return this._title;
    }

    /**
     * Update the board title
     */
    set Title( title ) {
        this._title = Helper.Label( title );
    }

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
                    window.open( Area.HTTP_ROOT_DOCUMENTATION + board._link, "_blank" );

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
     * @returns {boolean} if the icon "edit" (at the top of the right) is visible
     */
    get IsVisibleEdit() {
        return this._icons & GUI.Board.BOARD_EDIT;
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
    get TableZone() {
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
     * @returns {boolean} indicates if the height of the table must be adjusted on resizing
     */
    get AdjustWebixEnable() {
        return this._adjustWebixEnable;
    }

    /**
     * Enable or disable the auto-adjusted computation on resizing
     * @param {any} value true/false
     */
    set AdjustWebixEnable( value ) {
        this._adjustWebixEnable = value;
    }

    /**
     * Destructor
     */
    destructor() {
        super.destructor();

        if ( this._webix !== null ) {
            this._webix.destructor();
            this._webix = null;
        }
    }

    /**
     * show the board
     */
    async show() {
        if ( this.IsOpened )
            return;

        this.debug( "Show the board" );

        this.onOpen();
        this.refresh();
        this.Component.show();

        if ( this._webix !== null ) {
            await this.populateWebix();
            await this.adjustWebix();
        }
    }

    /**
     * Hide the board
     */
    hide() {
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

        updateIcons(this, icon, GUI.Board.BOARD_ICON, visible);
        updateIcons(this, icon, GUI.Board.BOARD_ADD, visible);
        updateIcons(this, icon, GUI.Board.BOARD_EDIT, visible);
        updateIcons(this, icon, GUI.Board.BOARD_CANCEL, visible);
        updateIcons(this, icon, GUI.Board.BOARD_DELETE, visible);
        updateIcons(this, icon, GUI.Board.BOARD_HELP, visible);

        this.refreshIcon("board", this.IsVisibleIcon);
        this.refreshIcon("add", this.IsVisibleAdd);
        this.refreshIcon("edit", this.IsVisibleEdit);
        this.refreshIcon("cancel", this.IsVisibleCancel);
        this.refreshIcon("delete", this.IsVisibleDelete);
        this.refreshIcon("help", this.IsVisibleHelp);
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
                        table.onBoardIcon();
                        break;

                    case "add":
                        table.onBoardAdd();
                        break;

                    case "edit":
                        table.onBoardEdit();
                        break;

                    case "cancel":
                        table.onBoardCancel();
                        break;

                    case "delete":
                        table.onBoardDelete();
                        break;

                    case "help":
                        table.onBoardHelp();
                        break;
                }
            };
        }

        if ( this.Component === null )
            return;

        let componentIcon = this.Component.find( "> .title > .icon." + icon );

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

        if ( this.isEvent( icon ) && this.List.isBoardAllowed( this, DSDatabase.Instance.CurrentUser, icon, undefined ) ) {
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
    refresh() {
        super.refresh();

        if ( this.Component === null )
            return;

        // set title

        this.Component.find( "> .title > .title" ).html( Helper.Span( this._title ) );

        // set visibility and action

        this.refreshIcon("board", this.IsVisibleIcon);
        this.refreshIcon("add", this.IsVisibleAdd);
        this.refreshIcon("edit", this.IsVisibleEdit);
        this.refreshIcon("cancel", this.IsVisibleCancel);
        this.refreshIcon("delete", this.IsVisibleDelete);
        this.refreshIcon("help", this.IsVisibleHelp);

        // set readonly

        if ( this.Readonly ) {
            this.Component.find( "> .title > div" ).addClass( 'readonly' );
        } else {
            this.Component.find( "> .title > div" ).removeClass( 'readonly' );
        }
    }

    /**
     * Abstract method to adjust the webix object in async mode
     */
    async adjustWebix() {
        this.debug( "Adjust webix (async)" );

        if ( this._webix === null || this._webix === undefined )
            return;

        // resize the webix object

        let tableZone = this.TableZone;
        let width = Math.floor( tableZone.width() );
        let height = Math.floor( tableZone.height() );

        if ( width !== this._webix.config.width || height !== this._webix.config.height ) {
            this._webix.config.width = width;
            this._webix.config.height = height;
            this._webix.resize();
        }
    }

    /**
     * Draw the table into the container
     */
    draw() {
        let content = "<board id='" + this.Name + "' class='" + this.Name + "'>";
        content += "<div class='title'>";
        content += "<div class='icon board'></div>";
        content += "<div class='title'></div>";
        content += "<div class='icon add'></div>";
        content += "<div class='icon edit'></div>";
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
                board._throttle = setTimeout( async function () {
                    board.debug( "Resizing window ..." );
                    await board.adjustWebix();
                }, 100 );
            };
        }

        $( window ).on( 'resize', handleResize( this ) );
    }

    /**
     * Abstract method to populate the webix object on async mode (for huge number of items)
     */
    async populateWebix() {
        this.debug( "Populate webix (async)" );
    }

    /**
     * Virtual method
     * @param {any} container reference on the container having the webix component
     * @returns {any} Webix object representing the board
     */
    drawWebix( container ) {
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
                switch ( event.key ) {
                    case "Tab":
                        event.stopImmediatePropagation();
                        if ( event.shiftKey )
                            board.previousFocus();
                        else
                            board.nextFocus();
                        return false;

                    case "Enter":
                        event.stopImmediatePropagation();
                        board.onUpdate();
                        return false;

                    case "Escape":
                        event.stopImmediatePropagation();
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
    onEvent( visible, event ) {
        if ( !visible )
            return;

        if ( !this.List.isBoardAllowed( this, DSDatabase.Instance.CurrentUser, event ) )
            return;

        let fnEvent = this.getEvent( event );
        if ( fnEvent === null )
            return;

        fnEvent();
    }

    /**
     * Event raised on clicking on the icon of the board
     */
    onBoardIcon() {
        this.onEvent( this.IsVisibleIcon, "board" );
    }

    /**
     * Event raised on Add a new element into the board
     */
    onBoardAdd() {
        this.onEvent( this.IsVisibleAdd, "add" );
    }

    /**
     * Event raised on Update a element selected into the board
     */
    onBoardEdit() {
        this.onEvent(this.IsVisibleEdit, "edit");
    }

    /**
     * Event raised on Cancel a element selected into the board
     */
    onBoardCancel() {
        this.onEvent( this.IsVisibleCancel, "cancel" );
    }

    /**
     * Event raised on Delete a element selected into the board
     */
    onBoardDelete() {
        this.onEvent( this.IsVisibleDelete, "delete" );
    }

    /**
     * Event raised on Help the board
     */
    onBoardHelp() {
        this.onEvent( this.IsVisibleHelp, "help" );
    }

    /**
     * Add a new item into a transaction and commit it if necessary
     * @param {any} newRecord new record to add into the list
     * @param {any} list list of items
     */
    async addItem( newRecord, list ) {
        function handleConfirmation( board, newRecord, list ) {
            return async function () {
                // Run the validation again ...

                let errors = new Errors();

                if ( list.Table !== undefined )
                    list.beginTransaction( Helper.Label( list.Table.toUpperCase() + "_CREATED_TOAST", list.getText( newRecord ) ) );
                else
                    list.beginTransaction();

                let itemUpdated = list.addItem( newRecord, errors, true );

                list.endTransaction();

                if ( errors.HasError ) {
                    await list.rollbackAsync().then( () => { GUI.Box.Message.Error( "ERROR", errors ); } );
                    return;
                }

                await list.commitAsync();
            };
        }

        let errors = new Errors();
        list = list === undefined || list === null ? this.List : list;

        if ( list.Table !== undefined )
            list.beginTransaction( Helper.Label( list.Table.toUpperCase() + "_CREATED_TOAST", list.getText( newRecord ) ) );
        else
            list.beginTransaction();

        let confirmation = list.addItem( newRecord, errors, false );

        list.endTransaction();

        if ( Helper.IsLabel( confirmation ) ) {
            // it's a message of confirmation

            GUI.Box.Message.Message( Helper.Label( list.Table === undefined ? this.Title : list.Table.toUpperCase() + "_CREATE", list.getText( newRecord ) ),
                confirmation,
                handleConfirmation( this, newRecord, list ) );

            return;
        }

        if ( errors.HasError ) {
            await list.rollbackAsync().then( () => { GUI.Box.Message.Error( "ERROR", errors ); } );
            return;
        }

        await list.commitAsync();
    }

    /**
     * Update an existing record into a transaction and commit it if necessary
     * @param {any} oldRecord record to update
     * @param {any} newRecord new record
     * @param {any} list list of items
     */
    async updateItem( oldRecord, newRecord, list ) {
        function handleConfirmation( board, oldRecord, newRecord, list ) {
            return async function () {
                // Run the validation again ...

                let errors = new Errors();

                if ( list.Table !== undefined )
                    list.beginTransaction( Helper.Label( list.Table.toUpperCase() + "_UPDATED_TOAST", list.getText( newRecord ) ) );
                else
                    list.beginTransaction();

                let itemUpdated = list.updateItem( oldRecord.Id, oldRecord, newRecord, errors, true );

                list.endTransaction();

                if ( errors.HasError ) {
                    await list.rollbackAsync().then( () => { GUI.Box.Message.Error( "ERROR", errors ); });
                    return;
                }

                await list.commitAsync();
            };
        }

        let errors = new Errors();
        list = list === undefined || list === null ? this.List : list;

        if ( list.Table !== undefined )
            list.beginTransaction( Helper.Label( list.Table.toUpperCase() + "_UPDATED_TOAST", list.getText( newRecord ) ) );
        else
            list.beginTransaction();

        let confirmation = list.updateItem( oldRecord.Id, oldRecord, newRecord, errors, false );

        list.endTransaction();

        if ( Helper.IsLabel( confirmation ) ) {
            // it's a message of confirmation

            GUI.Box.Message.Message( Helper.Label( list.Table === undefined ? this.Title : list.Table.toUpperCase() + "_UPDATE", list.getText( newRecord ) ),
                confirmation,
                handleConfirmation( this, oldRecord, newRecord, list ) );

            return;
        }

        if ( errors.HasError ) {
            await list.rollbackAsync().then( () => { GUI.Box.Message.Error( "ERROR", errors ); } );
            return;
        }

        await list.commitAsync();
    }

    /**
     * Delete an existing record into a transaction and commit it if necessary
     * @param {any} oldRecord record to delete
     * @param {any} list list of items
     */
    async deleteItem( oldRecord, list ) {
        let errors = new Errors();
        list = list === undefined || list === null ? this.List : list;

        if ( list.Table !== undefined )
            list.beginTransaction( Helper.Label( list.Table.toUpperCase() + "_DELETED_TOAST", list.getText( oldRecord ) ) );
        else
            list.beginTransaction();

        list.deleteItem( oldRecord.Id, oldRecord, errors );

        list.endTransaction();

        if ( errors.HasError ) {
            await list.rollbackAsync().then( () => { GUI.Box.Message.Error( "ERROR", errors ); } );
            return;
        }

        await list.commitAsync();
    }

    /**
     * Declare a CSV file to export from this board
     * @param {any} name identifier of the csv file to export
     * @param {any} list list of items to export
     * @param {any} label label to show in the dialog box selection
     * @param {any} headers headers to export
     * @param {any} filename filename
     */
    declareExportCSV( name, list, label, headers, filename, frequency ) {
        this._csvFiles[name] = {
            name: name,
            list: list,
            label: label,
            headers: headers,
            filename: filename,
            frequency: frequency === null || frequency === undefined ? 1000 : frequency
        };

        this._csvFilesSelections.push( this._csvFiles[name] );
    }

    /**
     * Export the content of the table into a CSV file
     * @param {Array} headers list of headers to add into the CSV file (null or undefined, set the default column)
     * @param {string} filename filename of the CSV file (if undefined, it's the name of the board)
     * @param {List.List} listItems list of items to export
     * @param {int} frequency frequency of refreshing screen
     * @return {boolean} true
     */
    async exportCSV( headers, filename, listItems, frequency ) {
        function handleExportFile( board, csvFile, frequency ) {
            return function () {
                board.exportCSV( csvFile.headers, csvFile.filename, csvFile.list, frequency );
            };
        }

        // Show a dialog box

        if ( headers === undefined && filename === undefined ) {
            if ( this._csvFilesSelections.length === 0 )
                return false;

            let choices = [];

            for ( let csvFile of this._csvFilesSelections )
                choices.push( { label: csvFile.label, fn: handleExportFile( this, csvFile, csvFile.frequency ) } );

            GUI.Box.BoxChoice.BoxChoices( "TITLE_CSV_EXPORT", null, choices );
            return true;
        }

        if ( listItems === null || listItems === undefined )
            listItems = this.List;

        // Build CSV file

        let status = false;
        filename = filename === undefined || filename === null ? this.Name + ".csv" : filename;
        let csv = new CSV( this.Name, null, DSDatabase.Instance.Parameters["CSV.Separator"], DSDatabase.Instance.Parameters["CSV.Charset"] );
        await GUI.Box.Progress.Thread( csv.toBlobFromList( listItems, headers ), frequency, true, true ).then( () => {
            if ( csv.Blob === null ) {
                status = false;
                return;
            }

            // If we are replacing a previously generated file we need to
            // manually revoke the object URL to avoid memory leaks.

            if ( GUI.Board.ExportCSVFile !== null )
                window.URL.revokeObjectURL( GUI.Board.ExportCSVFile );

            GUI.Board.ExportCSVFile = window.URL.createObjectURL( csv.Blob );

            // automatic launch the downloading file

            let link = document.createElement( 'a' );
            link.setAttribute( 'download', filename );
            link.href = GUI.Board.ExportCSVFile;
            document.getElementById( "log" ).appendChild( link );

            // wait for the link to be added to the document

            window.requestAnimationFrame( function () {
                let event = new MouseEvent( 'click' );
                link.dispatchEvent( event );
                document.getElementById( "log" ).removeChild( link );
            } );

            status = true;
        } );

        return status;
    }

    /**
     * Add board content into the PDF file
     * @param {any} docPDF   docPDF to complete
     */
    toPDF( docPDF ) {
        return docPDF;
    }

    /**
     * Export data from the board to PDF format
     */
    exportPDF() {
        this.info( "Exporting board into a PDF file ..." );

        GUI.Box.Progress.Start();
        GUI.Box.Progress.SetStatus( 0, 2, "MSG_PDF" );

        let docPDF = new DocPDF();
        docPDF.create( this._title )
            .then( () => {
                this.toPDF( docPDF ).finalize()
            } )
            .then( () => {
                docPDF.download( this.Name + '.pdf' );
                GUI.Box.Progress.Stop();
            } )
            .catch( error => {
                GUI.Box.Progress.Stop();
                GUI.Box.Message.Error( "ERROR", error );
            } );
    }

    /**
     * Clear all cache values
     */
    clearWebixCache() {
        this.debug( "Cleaning up the webix cache ..." );
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
        this._adjustWebixEnable = true;

        this._csvFiles = {};
        this._csvFilesSelections = [];
    }
};
