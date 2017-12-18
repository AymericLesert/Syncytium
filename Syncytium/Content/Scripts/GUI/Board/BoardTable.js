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
 * Handle a list of elements containing into a table
 */
GUI.Board.BoardTable = class extends GUI.Board.Board {
    /**
     * @returns {string} "_select"
     */
    static get COLUMN_SELECT() {
        return "_select";
    }

    /**
     * @returns {any} List of visible columns into the table
     */
    get ColumnsVisible() {
        if ( this.Webix === null )
            return [];

        var columns = [];

        for ( var id in this.Webix.config.columns ) {
            if ( !this.Webix.isColumnVisible( this.Webix.config.columns[id].id ) )
                continue;

            columns.push( this.Webix.config.columns[id].id );
        }

        return columns;
    }

    /**
     * @returns {any} List of columns declared into the table
     */
    get Columns() {
        return this._columns;
    }

    /**
     * @param {boolean} value true to enable the multi selection mode
     */
    set MultiSelection( value ) {
        this._multiselect = value !== null && value !== undefined && value;

        if ( this.Webix === null || this.Webix.isColumnVisible( GUI.Board.BoardTable.COLUMN_SELECT ) === this._multiselect )
            return;

        try {
            if ( this._multiselect )
                this.Webix.showColumn( GUI.Board.BoardTable.COLUMN_SELECT );
            else
                this.Webix.hideColumn( GUI.Board.BoardTable.COLUMN_SELECT );
        } catch ( e ) {
            if ( this.IsVerbose ) this.exception( "[Verbose] An exception occurs on showing the column", e );
        }
    }

    /**
     * @returns {boolean} the multiselection mode is enabled
     */
    get Multiselection() {
        return this._multiselect;
    }

    /**
     * Destructor
     */
    destructor () {
        super.destructor();

        if ( this._webixAdjustedZone !== null ) {
            this._webixAdjustedZone.remove();
            this._webixAdjustedZone = null;
            this._webixAdjustedZoneHTML = null;
        }
    }

    /**
     * Add a column into the table
     * - header is a label
     * - size of the column (see fillspace)
     * - alignment: left, center or right
     * - sort: true/false
     * @param {any} name      column name (identity)
     * @param {any} header    multilingual label of the header
     * @param {any} size      width of the column (proportional value)
     * @param {any} alignment "left", "right" or "center"
     * @param {any} sort      true/false, property, array of properties
     * @param {any} width     image width for the document PDF
     * @param {any} height    image height for the document PDF
     * @returns {any} column description added into the table
     */
    declareColumn ( name, header, size, alignment, sort, width, height ) {
        function handleSort( board, columns ) {
            return function ( item1, item2 ) {
                for ( var i in columns ) {
                    var value1 = board.List.getAttributValue( item1.item, columns[i] );
                    var value2 = board.List.getAttributValue( item2.item, columns[i] );

                    if ( value1 === null && value2 === null )
                        continue;

                    if ( value1 === null )
                        return -1;

                    if ( value2 === null )
                        return 1;

                    if ( Array.isArray( value1 ) && Array.isArray( value2 ) ) {
                        if ( value1.length < value2.length )
                            return -1;

                        if ( value1.length > value2.length )
                            return 1;

                        for ( var j = 0; j < value1.length; j++ ) {
                            if ( value1[j] === null && value2[j] === null )
                                continue;

                            if ( value1[j] === null )
                                return -1;

                            if ( value2[j] === null )
                                return 1;

                            if ( value1[j] > value2[j] )
                                return 1;

                            if ( value1[j] < value2[j] )
                                return -1;
                        }

                        continue;
                    }

                    if ( value1 > value2 )
                        return 1;

                    if ( value1 < value2 )
                        return -1;
                }

                return 0;
            };
        }

        function handleTemplate( board, column, user ) {
            return function ( item ) {
                if ( column === GUI.Board.BoardTable.COLUMN_SELECT )
                    return "<div class='" + GUI.Board.BoardTable.COLUMN_SELECT + "'>" + "<div class='" + ( item._select ? "selected" : "unselected" ) + "'></div>" + "</div>";

                let classes = '';

                if ( !board.isFieldVisible( column, user, item.item ) )
                    return "";

                if ( board.List.isAttributDeleted( item.item, column ) )
                    classes = 'deleted';

                if ( item._select )
                    classes = classes + ( classes === '' ? '' : ' ' ) + "selected";

                classes = classes + ( classes === '' ? '' : ' ' ) + column.toLowerCase();

                return "<div class='" + classes + "'>" + board.List.getAttributHTML( item.item, column ) + "</div>";
            };
        }

        var column = {};
        column.id = name;
        column.header = { header: header, text: Helper.Span( header ), height: 20 };
        column.fillspace = size;
        column.css = { 'text-align': alignment ? alignment : 'left' };
        column.template = handleTemplate( this, name, DSDatabase.Instance.CurrentUser );
        if ( sort === undefined || sort === null || typeof sort === "boolean" && sort )
            column.sort = handleSort( this, [name] );
        else if ( typeof sort === "string" )
            column.sort = handleSort( this, [name, sort] );
        else if ( Array.isArray( sort ) ) {
            column.sort = handleSort( this, [name].concat( sort ) );
        } else
            column.sort = false;
        this._columns.push( column );

        var pdfColumn = { title: header, field: name, size: size, align: alignment ? alignment : 'left' };
        if ( width !== null && width !== undefined && height !== null && height !== undefined ) {
            pdfColumn.width = width;
            pdfColumn.height = height;
        }
        this._pdfColumns.push( pdfColumn );

        this.debug( "Declare column '" + name + "'" );

        return column;
    }

    /**
     * Show a column into the table
     * @param {any} column identity of the column to show
     */
    showColumn ( column ) {
        if ( this.Webix === null || column === GUI.Board.BoardTable.COLUMN_SELECT )
            return;

        try { this.Webix.showColumn( column ); } catch ( e ) { if ( this.IsVerbose ) this.exception("[Verbose] An exception occurs on showing the column", e); }
    }

    /**
     * Hide a column into the table
     * @param {any} column identity of the column to hide
     */
    hideColumn ( column ) {
        if ( this.Webix === null || column === GUI.Board.BoardTable.COLUMN_SELECT )
            return;

        try { this.Webix.hideColumn( column ); } catch ( e ) { if ( this.IsVerbose ) this.exception( "[Verbose] An exception occurs on hiding the column", e ); }
    }

    /**
     * Set the focus on this GUI object (override it if necessary)
     * @returns {boolean} true if the focus is set on the component
     */
    focus() {
        this.verbose( "focus" );

        if ( this.Component === null || this._tabIndex === null || !this.Visible || this.Readonly )
            return false;

        if ( this.Webix === null || this.Webix === undefined )
            return false;

        if ( this.Webix.getFirstId() === undefined ) {
            this.Component.focus();
        } else {
            if ( !this.Webix.getSelectedItem() && this.Webix.getFirstId() )
                this.Webix.select( this.Webix.getFirstId() );

            webix.UIManager.setFocus( this.Webix );
        }

        return true;
    }

    /**
     * True if the field is visible in a board
     * @param {any} attribute column / property
     * @param {any} user     current user
     * @param {any} item     item handled by the board (null for a column)
     * @returns {boolean} true if the field is allowed to be shown
     */
    isFieldVisible( attribute, user, item ) {
        if ( !this.List.isBoardFieldVisible( this, attribute, user, item ) )
            return false;

        if ( this.List.ListParent === null || this.List.ListParent === undefined )
            return true;

        let subList = this.List.ListParent.getListValues( this.List.Column );
        if (subList === null)
            return this.List.isBoardFieldVisible( this, attribute, user, item );

        return attribute !== subList.column;
    }

    /**
     * False if the field can be updated in a board
     * @param {any} attribute column / property
     * @param {any} user     current user
     * @param {any} item     item handled by the board
     * @returns {boolean} true if the field can't be updated by the current user
     */
    isFieldReadonly( attribute, user, item ) {
        return this.List.isBoardFieldReadonly( this, attribute, user, item );
    }

    /**
     * True if the user can execute the event into a board
     * @param {any} user     current user
     * @param {string} event event name
     * @param {any} item     item handled by the board (can be null or undefined)
     * @returns {boolean} true if the user can execute the event
     */
    isAllowed( user, event, item ) {
        return this.List.isBoardAllowed( this, user, event, item );
    }

    /**
     * Method called on onOpen of the box containing the board
     */
    onOpen () {
        /*
         * Adding a new item into the list
         */
        function handleOnCreate( board ) {
            return function ( event, table, id, record ) {
                board.addRow( event, table, id, record );
            };
        }

        /*
         * Update of an item
         */
        function handleOnUpdate( board ) {
            return function ( event, table, id, oldRecord, newRecord ) {
                board.updateRow( event, table, id, oldRecord, newRecord );
            };
        }

        /*
         * Deletion of an item
         */
        function handleOnDelete( board ) {
            return function ( event, table, id, record ) {
                board.deleteRow( event, table, id, record );
            };
        }

        /*
         * Loading the list
         */
        function handleOnLoad( board ) {
            return function ( event, table ) {
                board.refresh();
                board.populateWebix();
                board.adjustWebix();
            };
        }

        super.onOpen();

        this.List.on( "onCreate", handleOnCreate( this ) );
        this.List.on( "onUpdate", handleOnUpdate( this ) );
        this.List.on( "onDelete", handleOnDelete( this ) );
        this.List.on( "onLoad", handleOnLoad( this ) );

        this.List.onOpen();
    }

    /**
     * Method called on onClose of the box containing the field
     */
    onClose () {
        super.onClose();

        this.List.unbind( "onCreate" );
        this.List.unbind( "onUpdate" );
        this.List.unbind( "onDelete" );
        this.List.unbind( "onLoad" );

        this.List.onClose();
    }

    /**
     * Method to refresh the table
     */
    refresh() {
        super.refresh();

        if ( this.Webix === null )
            return;

        if ( this.Webix.isColumnVisible( GUI.Board.BoardTable.COLUMN_SELECT ) !== this._multiselect ) {
            try {
                if ( this._multiselect )
                    this.Webix.showColumn( GUI.Board.BoardTable.COLUMN_SELECT );
                else
                    this.Webix.hideColumn( GUI.Board.BoardTable.COLUMN_SELECT );
            } catch ( e ) {
                if ( this.IsVerbose ) this.exception( "[Verbose] An exception occurs on showing the column", e );
            }
        }

        // Show all columns to show ...

        for ( let i in this._columns ) {
            let isVisible = this.isFieldVisible( this._columns[i].id );

            if ( this.Webix.isColumnVisible( this._columns[i].id ) !== isVisible && isVisible )
                this.showColumn( this._columns[i].id );
        }

        // Hide all other columns

        for ( let i in this._columns ) {
            let isVisible = this.isFieldVisible( this._columns[i].id );

            if ( this.Webix.isColumnVisible( this._columns[i].id ) !== isVisible && !isVisible )
                this.hideColumn( this._columns[i].id );
        }
    }

    /**
     * Method adding a new row into the webix object
     * @param {any} event  event name
     * @param {any} table  table name
     * @param {any} id     id of the record added
     * @param {any} record record added
     */
    addRow ( event, table, id, record ) {
        if ( this.Webix === null )
            return;

        if ( !this.List.isVisible( record ) )
            return;

        if (this.IsDebug)
            this.debug( "Add row (table = '" + table + "', id = " + id + ", record = " + String.JSONStringify(record) + ")" );

        var row = {};
        row.id = this.List.getId( record ).toString();
        row.item = record;
        row._select = false;

        this.Webix.blockEvent();
        this.Webix.add( row, -1 );
        this.Webix.unblockEvent();

        this.adjustWebix( row.id );

        var fnEvent = this.getEvent( "onUpdate" );
        if ( fnEvent )
            fnEvent();
    }

    /**
     * Method updating a row into the webix object
     * @param {any} event     event name
     * @param {any} table     table name
     * @param {any} id        id of the record updated
     * @param {any} oldRecord previous record value
     * @param {any} newRecord record updated
     */
    updateRow ( event, table, id, oldRecord, newRecord ) {
        if ( this.Webix === null )
            return;

        var oldVisible = this.List.isVisible( oldRecord );
        var newVisible = this.List.isVisible( newRecord );

        if ( !oldVisible && !newVisible )
            return;

        if ( oldVisible && !newVisible ) {
            this.deleteRow( event, table, id, oldRecord );
            return;
        }

        if ( !oldVisible && newVisible ) {
            this.addRow( event, table, id, newRecord );
            return;
        }

        if ( this.IsDebug )
            this.debug( "Update row (table = '" + table + "', id = " + id + ", record = " + String.JSONStringify( newRecord ) + ")" );

        var row = {};
        row.id = this.List.getId( oldRecord ).toString();
        row.item = newRecord;
        row._select = this.Webix.getItem( row.id )._select;

        this.Webix.blockEvent();
        this.Webix.updateItem( row.id, row );
        this.Webix.unblockEvent();

        this.adjustWebix( row.id );

        var fnEvent = this.getEvent( "onUpdate" );
        if ( fnEvent )
            fnEvent();
    }

    /**
     * Method deleting a row into the webix object
     * @param {any} event  event name
     * @param {any} table  table name
     * @param {any} id     id of the record deleted
     * @param {any} record record deleted
     */
    deleteRow ( event, table, id, record ) {
        if ( this.Webix === null )
            return;

        if ( this.IsDebug )
            this.debug( "Delete row (table = '" + table + "', id = " + id + ", record = " + String.JSONStringify( record ) + ")" );

        var row = {};
        row.id = this.List.getId( record ).toString();
        row.item = record;
        row._select = false;

        this.Webix.blockEvent();
        this.Webix.remove( row.id );
        this.Webix.unblockEvent();

        var fnEvent = this.getEvent( "onUpdate" );
        if ( fnEvent )
            fnEvent();
    }

    /**
     * Adjust columns and lines of the table
     * @param {any} rowId id of the row to adjust only
     */
    adjustWebix ( rowId ) {
        function processRow( board, columns, item ) {
            if ( item === null || item === undefined )
                return;

            if ( board.Webix.isSelected( item.id ) )
                $( board._webixAdjustedZoneHTML ).addClass( "webix_row_select" );
            else
                $( board._webixAdjustedZoneHTML ).removeClass( "webix_row_select" );

            var height = 1;

            for ( var i = 0; i < columns.length; i++ ) {
                var config = board.Webix.getColumnConfig( columns[i] );

                $( board._webixAdjustedZoneHTML ).css( 'width', config.width + "px" );
                $( board._webixAdjustedZoneHTML ).css( 'height', "1px" );
                board._webixAdjustedZoneHTML.innerHTML = board.Webix.getText( item.id, config.id );

                if ( height < board._webixAdjustedZoneHTML.scrollHeight )
                    height = board._webixAdjustedZoneHTML.scrollHeight;

                board._webixAdjustedZoneHTML.innerHTML = "";
            }

            item.$height = height;
        }

        function handleAdjustRow( board, columns ) {
            return function ( item ) {
                processRow( board, columns, item );
            };
        }

        if ( rowId === null || rowId === undefined )
            super.adjustWebix();
        else
            this.debug( "Adjust row : " + rowId.toString() );

        if ( this.Webix === null )
            return;

        if ( this._webixAdjustedZone === null ) {
            this._webixAdjustedZone = $( "<div class='webix_view webix_dtable'><div class='webix_ss_body'><div class='webix_ss_center'><div class='webix_ss_center_scroll'><div class='webix_column'><div class='webix_cell'></div></div></div></div></div></div>" );

            var cssClass = "webix_board";
            if ( this.CSSClass )
                cssClass += " " + ( "webix_" + this.CSSClass ).split( ' ' ).join( " webix_" );

            this._webixAdjustedZone.addClass( cssClass );

            this._webixAdjustedZone.css( 'visibility', 'hidden' );

            $( this.Webix.$view ).append( this._webixAdjustedZone );

            this._webixAdjustedZoneHTML = this._webixAdjustedZone.find( "> div > div > div > div > div" )[0];
        }

        var columns = this.ColumnsVisible;

        this.Webix.blockEvent();
        if ( rowId !== null && rowId !== undefined ) {
            processRow( this, columns, this.Webix.getItem( rowId ) );
            this.Webix.refresh( rowId );
        } else {
            this.Webix.data.each( handleAdjustRow( this, columns ) );
            this.Webix.refresh();
        }
        this.Webix.unblockEvent();
    }

    /**
     * Draw the table into the container
     */
    draw () {
        // declare all columns into the table

        this.declareColumn( GUI.Board.BoardTable.COLUMN_SELECT, null, 1, "center", false );
        this.declareColumns();

        // draw the table 

        super.draw();

        // Build the box record

        if ( !( this.List instanceof List.ListRecord ) && !( this.List instanceof List.ListArrayRecord ) )
            return;

        // Add an item

        function handleAddItem( board ) {
            return function () {
                GUI.Box.BoxRecord.CACHE_DIALOG_BOX( board.List.Table, null, board.List ).createRecord();
            };
        }

        this.on( "add", handleAddItem( this ) );

        // Delete an item

        function handleDeleteItem( board ) {
            return function ( record ) {
                if ( record === null )
                    return;

                GUI.Box.BoxRecord.CACHE_DIALOG_BOX( board.List.Table, null, board.List ).deleteRecord( record );
            };
        }

        this.on( "delete", handleDeleteItem( this ) );
    }

    /**
     * Method to populate the webix object
     */
    populateWebix () {
        super.populateWebix();

        if ( this.Webix === null )
            return;

        var showTable = this.Webix.isVisible();

        this.Webix.blockEvent();
        this.Webix.hide();
        this.Webix.clearAll();

        function handleReadItem( board ) {
            return function ( item ) {
                var row = {};
                row.id = board.List.getId( item );
                row.item = item;
                row._select = false;
                board.Webix.add( row, -1 );
            };
        }

        this.List.each( handleReadItem( this ) );

        // Show all elements

        this.Webix.unblockEvent();

        if ( showTable )
            this.Webix.show();

        this.Webix.showItemByIndex( 0 );
    }

    /**
     * @param {any} container reference on the container having the webix component
     * @returns {any} Webix object representing the table
     */
    drawWebix ( container ) {
        function handleAdjust( board ) {
            return function ( id, newWidth, oldWidth, userAction ) {
                if ( !board.Visible || !userAction )
                    return;

                board.debug( "Resizing column ..." );
                board.adjustWebix();
            };
        }

        function handleUpdate( board ) {
            return function ( id, event, htmlNode ) {
                board.onUpdate();
            };
        }

        function handleOnClick( board ) {
            return function ( id ) {
                if ( id.column === GUI.Board.BoardTable.COLUMN_SELECT && board._multiselect ) {
                    if ( board.isSelectedItem( id ))
                        board.unselectItem( id );
                    else
                        board.selectItem( id );
                    return;
                }

                if ( board.Readonly )
                    return;

                var event = board.getEvent( "onClick" + id.column );
                if ( !event )
                    return;

                var item = this.getItem( id );
                if ( !item )
                    return;

                let user = DSDatabase.Instance.CurrentUser;
                if ( !board.isAllowed( user, "onClick" + id.column, item.item) || board.isFieldReadonly( id.column, user, item.item ) )
                    return;

                board.debug( "Raise event(onClick" + id.column + "," + item.id + ")" );

                event( item.id, item.item, id.column );
            };
        }

        function handleToolTip( board ) {
            return function ( item, common ) {
                var attribute = common.column.id === null || common.column.id === undefined ? "ToolTip" : common.column.id;

                if ( attribute === GUI.Board.BoardTable.COLUMN_SELECT && board._multiselect ) {
                    var item = board.getSelectedItem();
                    if ( item === null )
                        return "";

                    return Language.Manager.Instance.interpolation( Helper.Label( "TABLE_" + ( item._select === true ? "SELECTED" : "UNSELECTED" ) ) );
                }

                if ( item === null || item === undefined || common === null || common === undefined )
                    return "";

                if ( item.item === null || item.item === undefined || common.column === null || common.column === undefined )
                    return "";

                var currentItem = item.item;

                var tooltip = board.List.getAttributToolTipHTML( currentItem, attribute );

                if ( typeof tooltip === "boolean" && tooltip === false )
                    return "";

                if ( !String.isEmptyOrWhiteSpaces( tooltip ) )
                    return tooltip;

                var text = null;
                var html = board.List.getAttributHTML( currentItem, attribute );

                if ( Helper.IsLabel( currentItem[attribute], true ) ) {
                    text = Helper.Span( currentItem[attribute] );
                } else {
                    text = board.List.getAttributText( currentItem, attribute );
                }

                return text === html || text === String.decode( html ) ? board.List.getAttributText( item.item, "ToolTip" ) : text;
            };
        }

        function handleChangeLanguage( board ) {
            return function ( currentLanguage, language, key ) {
                var i, j;

                if ( language !== undefined ) {
                    for ( i = 0; i < board._columns.length; i++ ) {
                        for ( j = 0; j < board._columns[i].header.length; j++ ) {
                            if ( board._columns[i].header[j].text === "" )
                                continue;

                            board._columns[i].header[j].text = $( board._columns[i].header[j].text ).each( Language.Manager.HandleReplacementKeyLabel( currentLanguage, language, key ) )[0].outerHTML;
                        }
                    }
                } else {
                    for ( i = 0; i < board._columns.length; i++ ) {
                        for ( j = 0; j < board._columns[i].header.length; j++ ) {
                            if ( board._columns[i].header[j].text === "" )
                                continue;

                            board._columns[i].header[j].text = $( board._columns[i].header[j].text ).each( Language.Manager.HandleReplacementLabel( currentLanguage ) )[0].outerHTML;
                        }
                    }
                }

                try { board.Webix.refreshColumns(); } catch ( e ) { if ( this.IsVerbose ) this.exception( "[Verbose] An exception occurs on refreshing columns", e ); }
            };
        }

        function handleKeypress( board ) {
            return function ( code, event ) {
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

                    case 32:
                        event.preventDefault();
                        if ( !board._multiselect )
                            return false;

                        var item = board.getSelectedItem();
                        if ( item === null )
                            return false;

                        if ( board.isSelectedItem( item.id ) )
                            board.unselectItem( item.id );
                        else
                            board.selectItem( item.id );
                        return false;
                }
            };
        }

        function handleChange( board ) {
            return function () {
                var event = board.getEvent( "onSelectChange" );
                if ( !event )
                    return;

                var item = this.getItem( board.Webix.getSelectedId( true ) );

                let user = DSDatabase.Instance.CurrentUser;
                if ( !board.isAllowed( user, "onSelectChange", !item ? null : item.item ) )
                    return;

                board.debug( "Raise event(onSelectChange," + (!item ? "" : item.id) + ")" );

                if ( !item )
                    event( );
                else
                    event( item.id, item.item );
            };
        }

        // build the table

        var cssClass = "webix_board";
        if ( this.CSSClass )
            cssClass += " " + ( "webix_" + this.CSSClass ).split( ' ' ).join( " webix_" );

        // Retrieve the 'line-height' in the style of the element

        let adjustedZone = $( "<div class='" + cssClass + "'><div class='webix_cell'></div></div>" );
        $( "body > main" ).append( adjustedZone );
        var rowHeight = parseInt( adjustedZone.find( ".webix_cell" ).css( 'font-size' ) );
        adjustedZone.remove();

        // Add a listener into the language manager to be notified in case of changes

        Language.Manager.Instance.addListener( handleChangeLanguage( this ) );

        return new webix.ui( {
            view: "datatable",
            container: container[0],
            css: cssClass,
            scroll: "y",
            scrollAlignY: false,
            select: "row",
            tooltip: { template: handleToolTip( this ), css: cssClass + "_tooltip" },
            columns: this._columns,
            resizeColumn: true,
            fixedRowHeight: false,
            rowLineHeight: rowHeight,
            rowHeight: rowHeight,
            navigation: true,
            editable: true,
            data: [],
            on: {
                onColumnResize: handleAdjust( this ),
                onItemDblClick: handleUpdate( this ),
                onItemClick: handleOnClick( this ),
                onKeyPress: handleKeypress( this ),
                onSelectChange: handleChange( this )
            }
        } );
    }

    /**
     * Check if the item id is selected or not
     * @param {any} id id of the item to check
     * @returns {boolean} true if the item is selected
     */
    isSelectedItem( id ) {
        let item = this.Webix.getItem( id );
        if ( item === null )
            return false;

        return item._select;
    }

    /**
     * Select the item 'id' 
     * @param {any} id id of the item to select
     */
    selectItem( id ) {
        let item = this.Webix.getItem( id );
        if ( item === null || item._select )
            return;

        item._select = true;
        this.Webix.refresh( item.id );
    }

    /**
     * Unselect the item 'id' 
     * @param {any} id id of the item to unselect
     */
    unselectItem( id ) {
        let item = this.Webix.getItem( id );
        if ( item === null || !item._select )
            return;

        item._select = false;
        this.Webix.refresh( item.id );
    }

    /**
     * Retrieve the list of selected items from the table
     * @returns {any} array of records
     */
    getSelectedItems() {
        function handleSelectedRow( board, selectedItems ) {
            return function ( row ) {
                var item = board.Webix.getItem( row );
                if ( item === null || item === undefined || !item.item )
                    return;

                if ( item._select )
                    selectedItems.push( item.item );
            };
        }

        let selectedItems = [];
        if ( this._multiselect ) {
            this.Webix.eachRow( handleSelectedRow( this, selectedItems ) );
            if ( selectedItems.length === 0 ) {
                let itemSelected = this.getSelectedItem();
                if ( itemSelected !== null && itemSelected.item !== null && itemSelected.item !== undefined )
                    selectedItems.push( itemSelected.item );
            }
        } else {
            let itemSelected = this.getSelectedItem();
            if ( itemSelected !== null && itemSelected.item !== null && itemSelected.item !== undefined )
                selectedItems.push( itemSelected.item );
        }
        return selectedItems;
    }

    /**
     * Retrieve the item from the table on depends on {id}
     * @param {any} id id of the item
     * @returns {any} item currently selected (into the Webix Board)
     */
    getSelectedItem ( id ) {
        if ( id === undefined )
            id = this.Webix.getSelectedId();

        if ( String.isEmptyOrWhiteSpaces( id ) )
            return null;

        return this.Webix.getItem( id );
    }

    /**
     * Event raised on clicking on the icon of the board within the current item selected
     */
    onBoard () {
        if ( !this.IsVisibleIcon )
            return;

        var event = this.getEvent( "board" );
        if ( event === null )
            return;

        var item = this.getSelectedItem();
        if ( item === null ) {
            if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "board" ) )
                return;

            event( null );
            return;
        }

        if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "board", item.item ) )
            return;

        event( this.List.getId( item.item ), item.item );
    }

    /**
     * Event raised on Add a new element into the board within the current item selected
     */
    onAdd () {
        if ( !this.IsVisibleAdd )
            return;

        var event = this.getEvent( "add" );
        if ( event === null )
            return;

        var item = this.getSelectedItem();
        if ( item === null ) {
            if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "add" ) )
                return;

            event( null );
            return;
        }

        if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "add", item.item ) )
            return;

        event( this.List.getId( item.item ), item.item );
    }

    /**
     * Event raised on Update an element selected into the board within the current item selected
     */
    onUpdate () {
        var item = this.getSelectedItem();

        if ( item === null )
            return;

        var event = this.getEvent( "update" );
        let dialogBox = GUI.Box.BoxRecord.CACHE_DIALOG_BOX( this.List.Table, null, this.List );

        if ( event === null && item !== null ) {
            if ( dialogBox !== null ) {
                if ( this.Readonly ) {
                    if ( this.isAllowed( DSDatabase.Instance.CurrentUser, "read", item.item ) )
                        dialogBox.readRecord( this.List.getId( item.item ) );
                } else if ( this.isAllowed( DSDatabase.Instance.CurrentUser, "update", item.item ) )
                    dialogBox.updateRecord( this.List.getId( item.item ) );
                else if ( this.isAllowed( DSDatabase.Instance.CurrentUser, "read", item.item ) )
                    dialogBox.readRecord( this.List.getId( item.item ) );
            }

            return;
        }

        if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "update", item.item ) && dialogBox !== null ) {
            if ( this.isAllowed( DSDatabase.Instance.CurrentUser, "read", item.item ) ) {
                dialogBox.readRecord( this.List.getId( item.item ) );
            }
            return;
        }

        if ( item === null ) {
            event( null );
        } else {
            event( this.List.getId( item.item ), item.item );
        }
    }

    /**
     * Event raised on Cancel an element selected into the board within the current item selected
     */
    onCancel () {
        if ( !this.IsVisibleCancel )
            return;

        var event = this.getEvent( "cancel" );
        if ( event === null )
            return;

        var item = this.getSelectedItem();
        if ( item === null ) {
            if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "cancel" ) )
                return;

            event( null );
            return;
        }

        if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "cancel", item.item ) )
            return;

        event( this.List.getId( item.item ), item.item );
    }

    /**
     * Event raised on Delete a element selected into the board within the current item selected
     */
    onDelete () {
        if ( !this.IsVisibleDelete )
            return;

        var event = this.getEvent( "delete" );
        if ( event === null )
            return;

        var item = this.getSelectedItem();
        if ( item === null ) {
            if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "delete" ) )
                return;

            event( null );
            return;
        }

        if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "delete", item.item ) )
            return;

        event( this.List.getId( item.item ), item.item );
    }

    /**
     * Sort the table by the name and the order
     * @param {any} id id of the column to sort
     * @param {any} order "asc" (by default) or "desc"
     */
    sort( id, order ) {
        if ( this.Webix === null )
            return;

        for ( let i = 0; i < this._columns.length; i++ ) {
            let column = this._columns[i];
            if ( column.id === id && column.sort !== false ) {
                this.Webix.sort( column.sort, order === null || order === undefined ? "asc" : order );
                return;
            }
        }
    }

    /**
     * Abstract method to define the list of columns into the table
     */
    declareColumns () {
    }

    /**
     * Add table into the PDF file
     * @param {any} docPDF   docPDF to complete
     * @param {any} fnEnd    function to call if the document is complete and ok
     * @param {any} fnError  function to call if an exception occurs
     */
    toPDF ( docPDF, fnEnd, fnError ) {
        try {
            let columns = [];
            let currentUser = DSDatabase.Instance.CurrentUser;

            for ( let id in this._pdfColumns ) {
                let column = this._pdfColumns[id];

                if ( column === null || column === undefined )
                    continue;

                if ( this.Webix.isColumnVisible( column.field ) )
                    columns.push( column );
            }

            PDF.CreateTable( docPDF, null, columns, this.List, this.List.getListSorted() );
            PDF.Finalize( docPDF, fnEnd, fnError );
        } catch ( ex ) {
            this.exception( "Unable to create PDF file", ex );
            fnError( "ERR_DOWNLOAD_PDF" );
        }
    }

    /**
     * Constructor
     * @param {any} box      string describing the html container, an html object or a GUI.Box
     * @param {any} name     identify the board
     * @param {any} title    string describing the title of the table (using Helper.Span)
     * @param {any} list     list of elements (See List.List)
     * @param {any} icons    icons expected into the table (See BOARD_ICON, BOARD_ADD, ...)
     */
    constructor( box, name, title, list, icons ) {
        super( box, name, "board_table", title, list, icons );

        this._webixAdjustedZone = null;
        this._webixAdjustedZoneHTML = null;
        this._columns = [];
        this._pdfColumns = [];
        this._multiselect = false;
    }
};
