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
     * Generic action to update a check box into the board
     * @param {any} board board to update
     * @param {any} nullable true if the property can be null
     */
    static handleClickBoolean( board, nullable ) {
        return async function ( id, item, attribute ) {
            let oldRecord = board.List.getItem( id, true );
            if ( oldRecord === null )
                return;

            let newRecord = DSRecord.Clone( oldRecord );

            // Update the field

            if ( nullable === true ) {
                if ( newRecord[attribute] === null )
                    newRecord[attribute] = true;
                else if ( newRecord[attribute] === true )
                    newRecord[attribute] = false;
                else
                    newRecord[attribute] = null;
            } else {
                if ( newRecord[attribute] === true )
                    newRecord[attribute] = false;
                else
                    newRecord[attribute] = true;
            }

            // notify the database that something has changed

            await board.updateItem( oldRecord, newRecord );
        };
    }

    /**
     * Generic action to update a text value into the board
     * @param {any} board board to update
     * @param {string} title dialog box title
     * @param {string} label dialog box label
     */
    static handleChangeText( board, title, label ) {
        return async function ( id, item, attribute ) {
            function onCheckValue( id ) {
                return async function ( newValue ) {
                    let oldRecord = board.List.getItem( id, true );
                    if ( oldRecord === null )
                        return;

                    let newRecord = DSRecord.Clone( oldRecord );
                    newRecord[attribute] = String.isEmptyOrWhiteSpaces( newValue ) ? null : newValue;

                    await board.updateItem( oldRecord, newRecord );
                    return true;
                };
            }

            GUI.Box.BoxInputText.Open( Helper.Label( title, board.List.getText( item ) ),
                label,
                item[attribute],
                false,
                onCheckValue( id ) );
        };
    }

    /**
     * Generic action to update a digit value into the board
     * @param {any} board board to update
     * @param {string} title dialog box title
     * @param {string} label dialog box label
     * @param {string} alignment digit value alignment ('center' by default)
     * @param {function} fnValue format the value
     */
    static handleChangeDigit( board, title, label, alignment, fnValue ) {
        return function ( id, item, attribute ) {
            function onCheckValue( id, digit ) {
                return async function ( newValue ) {
                    let oldRecord = board.List.getItem( id, true );
                    if ( oldRecord === null )
                        return;

                    let newRecord = DSRecord.Clone( oldRecord );
                    if ( fnValue === null || fnValue === undefined )
                        newRecord[attribute] = digit.Value;
                    else
                        newRecord[attribute] = fnValue( digit );

                    await board.updateItem( oldRecord, newRecord );
                    return true;
                };
            }

            // Update the value

            let format = null;
            let column = DSDatabase.Instance.getColumn( board.List.Table, attribute );
            if ( column !== null )
                format = column.DatetimeFormat;
            if ( column !== null && format === null )
                format = column.StringFormat;

            let digit = null;
            if ( format !== null )
                digit = Digits.Digits.Factory( format );

            if ( digit === null )
                digit = column.Digit;

            if ( digit === null ) {
                handleChangeText( board, title, label )( id, item, attribute );
                return;
            } else {
                digit.Value = item[attribute];

                GUI.Box.BoxInputDigit.Digit( Helper.Label( title, board.List.getText( item ) ),
                    label,
                    column.Unit,
                    digit,
                    alignment === null || alignment === undefined ? 'center' : alignment,
                    onCheckValue( id, digit ) );
            }
        };
    };

    /**
     * Generic action to update a reference value into the board
     * @param {any} board board to update
     * @param {string} title dialog box title
     * @param {string} label dialog box label
     * @param {List.List} list list of values
     * @param {boolean} allowNullValue false or undefined (no null value), else true
     * @param {function} fnValue format the value
     */
    static handleChangeSelect( board, title, label, list, allowNullValue, fnValue ) {
        return async function ( id, item, attribute ) {
            function onCheckValue( id, newValue ) {
                return async function () {
                    let oldRecord = board.List.getItem( id, true );
                    if ( oldRecord === null )
                        return;

                    let newRecord = DSRecord.Clone( oldRecord );
                    newRecord[attribute] = newValue;

                    await board.updateItem( oldRecord, newRecord );
                    return true;
                };
            }

            // List of enumerated values

            let choices = [];
            if ( allowNullValue === true )
                choices.push( { label: "SELECT_VALUE_NULL", fn: onCheckValue( id, null ) } );

            for ( let value of list.getListSorted() ) {
                if ( item[attribute] === list.getId( value ) )
                    continue;

                if ( fnValue !== null && fnValue !== undefined && !fnValue( id, item, attribute, value ) )
                    continue;

                choices.push( { label: list.getText( value ), fn: onCheckValue( id, list.getId( value ) ) } );
            }

            if ( choices.length > 0 )
                GUI.Box.BoxChoice.BoxChoices( Helper.Label( title, board.List.getText( item ) ), label, choices );
        };
    }

    /**
     * Generic action to update a reference value into the board
     * @param {any} board board to update
     * @param {string} title dialog box title
     * @param {string} label dialog box label
     * @param {List.List} list list of values
     * @param {function} filter function to filter items
     * @param {boolean} allowNullValue true if a null value is allowed for this attribute
     */
    static handleChangeSelectImage( board, title, label, list, filter, allowNullValue ) {
        return async function ( id, item, attribute ) {
            function onCheckValue( id ) {
                return async function ( newValue ) {
                    let oldRecord = board.List.getItem( id, true );
                    if ( oldRecord === null )
                        return;

                    let newRecord = DSRecord.Clone( oldRecord );
                    newRecord[attribute] = newValue;

                    await board.updateItem( oldRecord, newRecord );
                    return true;
                };
            }

            // Update the select image

            GUI.Box.BoxSelect.Open( Helper.Label( title, board.List.getText( item ) ),
                label,
                item[attribute],
                list,
                filter,
                onCheckValue( id ) );
            GUI.Box.BoxSelect.Instance.AllowNullValue = allowNullValue === true;
        };
    }

    /**
     * Handle the refreshing steps into the board on changing values from a table
     * @param {string} table table name
     * @param {string} attribute attribute into the item
     * @param {function} isRefreshed function describing the filter of a row into the board to update
     * @param {array} columns list of columns (or attribute) to update if the value has changed
     */
    handleUpdateRows( table, attribute, isRefreshed, columns ) {
        function handleAsyncFunction( board ) {
            return async function ( event, table, id, oldRecord, newRecord ) {
                function* fn( board ) {
                    let rows = [];

                    yield GUI.Box.Progress.Status( 0, 1, "MSG_REFRESHING" );

                    board.Webix.eachRow( row => {
                        let item = board.getItem( row );
                        if ( item === null || item === undefined || !item.item )
                            return;

                        if ( ( !isRefreshed && item.item[attribute] !== id ) ||
                            ( isRefreshed && !isRefreshed( item.item, id ) ) )
                            return;

                        rows.push( row );
                    } );

                    board.info( "Refreshing " + rows.length + " lines ..." );

                    yield GUI.Box.Progress.Status( 0, rows.length );

                    for ( let row of rows ) {
                        board.refreshRow( row, columns === undefined ? [attribute] : columns );
                        yield GUI.Box.Progress.Status();
                    }
                }

                if ( board.Webix === null || !board.isFieldVisible( attribute, DSDatabase.Instance.CurrentUser ) )
                    return;

                await GUI.Box.Progress.Thread( fn( board ), 1000, false, false );
            };
        }

        if ( !this._keepListEvents ) {
            this.addListener( DSDatabase.Instance.addEventListener( "onUpdate", table, "*", handleAsyncFunction( this ) ) );
            this.addListener( DSDatabase.Instance.addEventListener( "onDelete", table, "*", handleAsyncFunction( this ) ) );
        } else if ( !this._alreadyOpened ) {
            DSDatabase.Instance.addEventListener( "onUpdate", table, "*", handleAsyncFunction( this ) );
            DSDatabase.Instance.addEventListener( "onDelete", table, "*", handleAsyncFunction( this ) );
        }
    }

    /**
     * @returns {any} List of visible columns into the table
     */
    get ColumnsVisible() {
        if ( this.Webix === null )
            return [];

        let columns = [];

        for ( let column of Array.toIterable( this.Webix.config.columns ) ) {
            if ( !this.Webix.isColumnVisible( column.id ) )
                continue;

            columns.push( column.id );
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
     * @returns {Array or String} Column and order to sort by default
     */
    get ColumnSortedByDefault() {
        let columns = this.ColumnsVisible;
        if ( columns.length > 0 )
            return [columns[0], "asc"];
        return null;
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
     * Set the flag which keep always the listeners stored into the board
     */
    set KeepListEvents( value ) {
        this._keepListEvents = String.convertBoolean( value );
    }

    /**
     * @returns {boolean} the flag which keep always the listeners stored into the board
     */
    get KeepListEvents() {
        return this._keepListEvents;
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
     * show the board
     */
    async show() {
        await super.show();
        this._alreadyOpened = true;
    }

    /**
     * Build a HTML String of the value
     * @param {any} column
     * @param {any} user
     * @param {any} item
     * @returns {string} HTML component
     */
    getHTML( column, user, item ) {
        if ( column === GUI.Board.BoardTable.COLUMN_SELECT )
            return "<div class='" + GUI.Board.BoardTable.COLUMN_SELECT + "'>" + "<div class='" + ( item._select ? "selected" : "unselected" ) + "'></div>" + "</div>";

        let classes = '';
        let record = item.item !== undefined && item.item !== null ? item.item : this.List.getItem( item.id, true );

        if ( record === null || !this.isFieldVisible( column, user, record ) )
            return "";

        if ( this.List.isAttributDeleted( record, column ) )
            classes = "deleted";

        if ( this.isFieldReadonly( column, user, record ) )
            classes = classes + ( classes === '' ? '' : ' ' ) + "readonly";

        if ( item._select )
            classes = classes + ( classes === '' ? '' : ' ' ) + "selected";

        classes = classes + ( classes === '' ? '' : ' ' ) + column.toLowerCase();

        return "<div class='" + classes + "'>" + this.List.getAttributHTML( record, column ) + "</div>";
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
                for ( let column of columns ) {
                    if ( board._webixCacheValue[item1.id] === undefined )
                        board._webixCacheValue[item1.id] = {};

                    if ( board._webixCacheValue[item2.id] === undefined )
                        board._webixCacheValue[item2.id] = {};

                    let value1 = board._webixCacheValue[item1.id][column];
                    if ( value1 === undefined ) {
                        value1 = board.List.getAttributValue( board.List.getItem( item1.id ), column );
                        board._webixCacheValue[item1.id][column] = value1;
                    }

                    let value2 = board._webixCacheValue[item2.id][column];
                    if ( value2 === undefined ) {
                        value2 = board.List.getAttributValue( board.List.getItem( item2.id ), column );
                        board._webixCacheValue[item2.id][column] = value2;
                    }

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

                        for ( let j = 0; j < value1.length; j++ ) {
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
                if ( board._webixCacheHTML[item.id] === undefined )
                    board._webixCacheHTML[item.id] = {};

                let key = [item._select, column];
                if ( board._webixCacheHTML[item.id][key] !== undefined )
                    return board._webixCacheHTML[item.id][key];

                let value = String.internal( board.getHTML( column, user, item ) );
                board._webixCacheHTML[item.id][key] = value;
                return value;
            };
        }

        let column = {};
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

        let pdfColumn = { title: header, field: name, size: size, align: alignment ? alignment : 'left' };
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

        if ( this.List.ListParent === null || this.List.ListParent === undefined || this.List.ListParent.getListValues === undefined )
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
            return async function ( event, table ) {
                board.refresh();
                await board.populateWebix();
                await board.adjustWebix();
            };
        }

        super.onOpen();

        if ( !this._listEvents ) {
            this.List.on( "onCreate", handleOnCreate( this ) );
            this.List.on( "onUpdate", handleOnUpdate( this ) );
            this.List.on( "onDelete", handleOnDelete( this ) );
            this.List.on( "onLoad", handleOnLoad( this ) );

            this.List.onOpen();

            this._listEvents = true;
        }
    }

    /**
     * Method called on onClose of the box containing the field
     */
    onClose () {
        super.onClose();

        if ( !this._keepListEvents ) {
            this.List.unbind( "onCreate" );
            this.List.unbind( "onUpdate" );
            this.List.unbind( "onDelete" );
            this.List.unbind( "onLoad" );

            this.List.onClose();

            this._listEvents = false;
        }
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

        for ( let column of this._columns ) {
            let isVisible = this.isFieldVisible( column.id );

            if ( this.Webix.isColumnVisible( column.id ) !== isVisible && isVisible )
                this.showColumn( column.id );
        }

        // Hide all other columns

        for ( let column of this._columns ) {
            let isVisible = this.isFieldVisible( column.id );

            if ( this.Webix.isColumnVisible( column.id ) !== isVisible && !isVisible )
                this.hideColumn( column.id );
        }
    }

    /**
     * Method refreshing a row of the object
     * @param {int} id id of the record added
     * @param {any} columns list of columns to refresh (if undefined, refresh all)
     */
    refreshRow( id, columns ) {
        let item = this.getItem( id );
        if ( item === null || item === undefined || !item.item )
            return;

        if ( columns === undefined || columns === null ) {
            this._webixCacheHTML[id] = {};
            this._webixCacheValue[id] = {};
        } else {
            for ( let column of Array.toIterable( columns ) ) {
                if ( this._webixCacheValue[id] !== undefined )
                    this._webixCacheValue[id][column] = undefined;

                if ( this._webixCacheHTML[id] !== undefined ) {
                    for ( let select of [undefined, true, false] )
                        this._webixCacheHTML[id][[select, column]] = undefined;
                }
            }
        }

        if ( !this.Webix.isVisible() || !this.IsOpened )
            return;

        List.ListRecord.CleanUpExtendedFields( item.item );
        this.Webix.refresh( id );
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

        record = List.ListRecord.SetExtendedFields( this.List, record );

        if ( !this.List.isVisible( record ) )
            return;

        if (this.IsDebug)
            this.debug( "Add row (table = '" + table + "', id = " + id + ", record = " + String.JSONStringify(record) + ")" );

        let row = {};
        row.id = this.List.getId( record ).toString();
        row._select = false;

        this._webixCacheHTML[row.id] = {};
        this._webixCacheValue[row.id] = {};

        if ( !this.Webix.isVisible() || !this.IsOpened )
            return;

        this.Webix.blockEvent();
        this.Webix.add( row, -1 );
        this.Webix.unblockEvent();

        this.adjustWebix( row.id );

        let state = this.Webix.getState();
        if ( state && state.sort )
            this.sort( state.sort.id, state.sort.dir );

        let fnEvent = this.getEvent( "onUpdate" );
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

        oldRecord = List.ListRecord.SetExtendedFields( this.List, oldRecord );
        newRecord = List.ListRecord.SetExtendedFields( this.List, newRecord );

        let oldVisible = this.getItem( this.List.getId( oldRecord ).toString() ) !== undefined;
        let newVisible = this.List.isVisible( newRecord );

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

        let row = {};
        row.id = this.List.getId( oldRecord ).toString();
        let rowItem = this.getItem( row.id );
        if ( rowItem !== null )
            row._select = rowItem._select;
        else
            row._select = false;

        this._webixCacheHTML[row.id] = {};
        this._webixCacheValue[row.id] = {};

        if ( !this.Webix.isVisible() || !this.IsOpened )
            return;

        this.Webix.blockEvent();
        this.Webix.updateItem( row.id, row );
        this.Webix.unblockEvent();

        this.adjustWebix( row.id );

        let state = this.Webix.getState();
        if ( state && state.sort )
            this.sort( state.sort.id, state.sort.dir );

        let fnEvent = this.getEvent( "onUpdate" );
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

        let row = {};
        row.id = this.List.getId( record ).toString();
        row._select = false;

        this._webixCacheHTML[row.id] = {};
        this._webixCacheValue[row.id] = {};

        if ( !this.Webix.isVisible() || !this.IsOpened )
            return;

        this.Webix.blockEvent();
        this.Webix.remove( row.id );
        this.Webix.unblockEvent();

        let fnEvent = this.getEvent( "onUpdate" );
        if ( fnEvent )
            fnEvent();
    }

    /**
     * Adjust columns and lines of the table (async mode)
     * @param {any} rowId id of the row to adjust only
     */
    async adjustWebix( rowId ) {
        function processRow( board, columns, item ) {
            if ( item === null || item === undefined )
                return;

            let selected = board.Webix.isSelected( item.id );
            let firstCompute = true;
            let height = 1;

            for ( let i = 0; i < columns.length; i++ ) {
                let config = board.Webix.getColumnConfig( columns[i] );
                let htmlText = board.Webix.getText( item.id, config.id );
                let key = [selected, config.id, htmlText];

                let cacheHeight = board._webixCacheHeight[key];
                if ( cacheHeight === undefined ) {
                    if ( firstCompute ) {
                        if ( selected )
                            $( board._webixAdjustedZoneHTML ).addClass( "webix_row_select" );
                        else
                            $( board._webixAdjustedZoneHTML ).removeClass( "webix_row_select" );
                        firstCompute = false;
                    }

                    $( board._webixAdjustedZoneHTML ).css( 'width', config.width + "px" );
                    $( board._webixAdjustedZoneHTML ).css( 'height', "1px" );
                    board._webixAdjustedZoneHTML.innerHTML = htmlText;

                    cacheHeight = board._webixAdjustedZoneHTML.scrollHeight + 4;
                    board._webixCacheHeight[key] = cacheHeight;

                    board._webixAdjustedZoneHTML.innerHTML = "";
                }

                if ( height < cacheHeight )
                    height = cacheHeight;
            }

            item.$height = height;
        }

        function* fn( board ) {
            yield GUI.Box.Progress.Status( 0, 1, "MSG_REFRESHING" );

            board.verbose( "Getting rows to update ..." );

            let rows = [];
            board.Webix.data.each( row => rows.push( row ) );

            yield GUI.Box.Progress.Status( 1, rows.length + 1);
            board.verbose( "Updating " + rows.length + " rows ..." );

            let columnsVisible = board.ColumnsVisible;
            for ( let row of rows ) {
                processRow( board, columnsVisible, row );
                yield GUI.Box.Progress.Status();
            }

            board.verbose( "Refreshing Webix table ..." );

            board.Webix.refresh();
            board.Webix.unblockEvent();

            board.verbose( "End of adjusting Webix table ..." );
        }

        // Clean up cache ?

        if ( this.Webix !== null ) {
            let tableZone = this.TableZone;
            let width = Math.floor( tableZone.width() );
            let height = Math.floor( tableZone.height() );

            if ( width !== this._webix.config.width || height !== this._webix.config.height ) {
                this.debug( "Clean up webix cache to compute height" );
                this._webixCacheHeight = {};
            }
        }

        // Adjust

        if ( rowId === null || rowId === undefined )
            await super.adjustWebix();
        else
            this.verbose( "Adjust row : " + rowId.toString() );

        if ( this.Webix === null || !this._adjustWebixEnable )
            return;

        // Build the HTML component to compute the height

        if ( this._webixAdjustedZone === null ) {
            this._webixAdjustedZone = $( "<div class='webix_view webix_dtable'><div class='webix_ss_body'><div class='webix_ss_center'><div class='webix_ss_center_scroll'><div class='webix_column'><div class='webix_cell'></div></div></div></div></div></div>" );

            let cssClass = "webix_board";
            if ( this.CSSClass )
                cssClass += " " + ( "webix_" + this.CSSClass ).split( ' ' ).join( " webix_" );

            this._webixAdjustedZone.addClass( cssClass );

            this._webixAdjustedZone.css( 'visibility', 'hidden' );

            $( this.Webix.$view ).append( this._webixAdjustedZone );

            this._webixAdjustedZoneHTML = this._webixAdjustedZone.find( "> div > div > div > div > div" )[0];
        }

        this.Webix.blockEvent();
        if ( rowId !== null && rowId !== undefined ) {
            processRow( this, this.ColumnsVisible, this.getItem( rowId, false ) );
            this.Webix.refresh( rowId );
            this.Webix.unblockEvent();
        } else {
            await GUI.Box.Progress.Thread( fn( this ), 1000, false, false );
        }
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
     * Method to populate the webix object in async mode
     */
    async populateWebix() {
        function* fn( board ) {
            yield GUI.Box.Progress.Status( 0, 1, "MSG_LOADING" );

            let showTable = board.Webix.isVisible();

            board.verbose( "Cleaning Webix table ..." );

            board.Webix.blockEvent();
            board.Webix.hide();
            board.Webix.clearAll();

            // Prepare populating table

            let items = [];
            board.List.each( item => items.push( item ) );

            // Populate table

            board.verbose( "Adding " + items.length + " items and evaluating items (HTML and Value) ..." );

            yield GUI.Box.Progress.Status( 0, items.length + 2 );

            for ( let item of items ) {
                let row = {};
                row.id = board.List.getId( item );
                row.item = item;
                row._select = false;

                // Update cache

                for ( let column of board._columns ) {
                    if ( board._webixCacheHTML[row.id] === undefined )
                        board._webixCacheHTML[row.id] = {};
                    let key = [false, column.id];
                    if ( board._webixCacheHTML[row.id][key] === undefined )
                        board._webixCacheHTML[row.id][key] = String.internal( board.getHTML( column.id, DSDatabase.Instance.CurrentUser, row ) );

                    if ( board._webixCacheValue[row.id] === undefined )
                        board._webixCacheValue[row.id] = {};
                    if ( board._webixCacheValue[row.id][column.id] === undefined ) {
                        let value = board.List.getAttributValue( item, column.id );
                        board._webixCacheValue[row.id][column.id] = typeof value === 'string' ? String.internal( value ) : value;
                    }
                }

                // Update the board

                delete row.item;
                board.Webix.add( row, -1 );

                // Clean up the item

                List.ListRecord.CleanUpExtendedFields( item );

                yield GUI.Box.Progress.Status();
            }

            // Sort the table by default (first visible column)

            board.verbose( "Sorting Webix table ..." );

            let columnToSort = board.ColumnSortedByDefault;
            if ( typeof ( columnToSort ) === 'string' )
                board.sort( columnToSort );
            else if ( Array.isArray( columnToSort ) )
                board.sort( columnToSort[0], columnToSort[1] );

            yield GUI.Box.Progress.Status();

            // Show all elements

            board.verbose( "Showing Webix table ..." );

            board.Webix.unblockEvent();

            if ( showTable )
                board.Webix.show();

            board.Webix.showItemByIndex( 0 );

            board.verbose( "End of populate Webix table ..." );

            yield GUI.Box.Progress.Status();
        }

        await super.populateWebix();

        if ( this.Webix === null )
            return;

        await GUI.Box.Progress.Thread( fn( this ), 200, true, false );
    }

    /**
     * @param {any} container reference on the container having the webix component
     * @returns {any} Webix object representing the table
     */
    drawWebix ( container ) {
        function handleAdjust( board ) {
            return async function ( id, newWidth, oldWidth, userAction ) {
                if ( !board.Visible || !userAction )
                    return;

                board.debug( "Resizing column ..." );
                board._webixCacheHeight = {};
                await board.adjustWebix();
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

                let event = board.getEvent( "onClick" + id.column );
                if ( !event )
                    return;

                let item = board.getItem( id );
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
            return function ( row, common ) {
                let attribute = common.column.id === null || common.column.id === undefined ? "ToolTip" : common.column.id;

                if ( attribute === GUI.Board.BoardTable.COLUMN_SELECT && board._multiselect ) {
                    row = board.getSelectedItem();
                    if ( row === null )
                        return "";

                    return Language.Manager.Instance.interpolation( Helper.Label( "TABLE_" + ( row._select === true ? "SELECTED" : "UNSELECTED" ) ) );
                }

                if ( row === null || row === undefined || common === null || common === undefined )
                    return "";

                let currentItem = board.List.getItem( row.id, true );

                if ( currentItem === null || currentItem === undefined || common.column === null || common.column === undefined )
                    return "";

                let tooltip = board.List.getAttributToolTipHTML( currentItem, attribute );

                if ( typeof tooltip === "boolean" && tooltip === false )
                    return "";

                if ( Helper.IsLabel( tooltip, true ) )
                    return Helper.Span( tooltip );

                if ( !String.isEmptyOrWhiteSpaces( tooltip ) )
                    return tooltip;

                let text = null;
                let html = board.List.getAttributHTML( currentItem, attribute );

                if ( Helper.IsLabel( currentItem[attribute], true ) ) {
                    text = Helper.Span( currentItem[attribute] );
                } else {
                    text = board.List.getAttributText( currentItem, attribute );
                }

                return text === html || text === String.decode( html ) ? board.List.getAttributText( currentItem, "ToolTip" ) : text;
            };
        }

        function handleChangeLanguage( board ) {
            return function ( currentLanguage, language, key ) {
                let i, j;

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
                let item = null;

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

                    case "Delete":
                        event.stopImmediatePropagation();
                        board.onBoardDelete();
                        return false;

                    case " ":
                        event.stopImmediatePropagation();
                        if ( !board._multiselect )
                            return false;

                        item = board.getSelectedItem();
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
                let event = board.getEvent( "onSelectChange" );
                if ( !event )
                    return;

                let item = this.getItem( board.Webix.getSelectedId( true ) );

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

        let cssClass = "webix_board";
        if ( this.CSSClass )
            cssClass += " " + ( "webix_" + this.CSSClass ).split( ' ' ).join( " webix_" );

        // Retrieve the 'line-height' in the style of the element

        let adjustedZone = $( "<div class='" + cssClass + "'><div class='webix_cell'></div></div>" );
        $( "body > main" ).append( adjustedZone );
        let rowHeight = parseInt( adjustedZone.find( ".webix_cell" ).css( 'font-size' ) );
        adjustedZone.remove();

        // Add a listener into the language manager to be notified in case of changes

        Language.Manager.Instance.addListener( handleChangeLanguage( this ) );

        let webixColumns = [];
        for ( let column of this._columns )
            webixColumns.push( column );

        return new webix.ui( {
            view: "datatable",
            container: container[0],
            css: cssClass,
            scroll: "y",
            scrollAlignY: false,
            select: "row",
            tooltip: { template: handleToolTip( this ), css: cssClass + "_tooltip" },
            columns: webixColumns,
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
        let item = this.getItem( id );
        if ( item === null )
            return false;

        return item._select;
    }

    /**
     * Select the item 'id' 
     * @param {any} id id of the item to select
     */
    selectItem( id ) {
        let item = this.getItem( id );
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
        let item = this.getItem( id );
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
                let item = board.getItem( row );
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
     * Retrieve the selected item from the table
     * @returns {any} item currently selected (into the Webix Board)
     */
    getSelectedItem () {
        return this.getItem( this.Webix.getSelectedId() );
    }

    /**
     * Retrieve the item from the table on depends on {id}
     * @param {int} id id of the item (if undefined, retrieve the selected item)
     * @param {boolean} completeItem false if no complete item retrieve from the webix board
     * @returns {any} item currently selected (into the Webix Board)
     */
    getItem( id, completeItem ) {
        if ( id === undefined )
            id = this.Webix.getSelectedId();

        if ( String.isEmptyOrWhiteSpaces( id ) )
            return null;

        let row = this.Webix.getItem( id );
        if ( row === null || row === undefined )
            return null;

        return completeItem === false ? row : { id: row.id, item: this.List.getItem( row.id, true ), _select: row._select };
    }

    /**
     * Event raised on clicking on the icon of the board within the current item selected
     */
    onBoardIcon () {
        if ( !this.IsVisibleIcon )
            return;

        let event = this.getEvent( "board" );
        if ( event === null )
            return;

        let item = this.getSelectedItem();
        if ( item === null ) {
            if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "board" ) )
                return;

            event( null );
            return;
        }

        if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "board", item.item ) )
            return;

        event( item.id, item.item );
    }

    /**
     * Event raised on Add a new element into the board within the current item selected
     */
    onBoardAdd () {
        if ( !this.IsVisibleAdd )
            return;

        let event = this.getEvent( "add" );
        if ( event === null )
            return;

        let item = this.getSelectedItem();
        if ( item === null ) {
            if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "add", null ) )
                return;

            event( null );
            return;
        }

        if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "add", item.item ) )
            return;

        event( item.id, item.item );
    }

    /**
     * Event raised on Update an element selected into the board within the current item selected
     */
    onUpdate () {
        let item = this.getSelectedItem();

        if ( item === null )
            return;

        let event = this.getEvent( "update" );
        let dialogBox = GUI.Box.BoxRecord.CACHE_DIALOG_BOX( this.List.Table, null, this.List );

        if ( event === null && item !== null ) {
            if ( dialogBox !== null ) {
                if ( this.Readonly ) {
                    if ( this.isAllowed( DSDatabase.Instance.CurrentUser, "read", item.item ) )
                        dialogBox.readRecord( item.id );
                } else if ( this.isAllowed( DSDatabase.Instance.CurrentUser, "update", item.item ) )
                    dialogBox.updateRecord( item.id );
                else if ( this.isAllowed( DSDatabase.Instance.CurrentUser, "read", item.item ) )
                    dialogBox.readRecord( item.id );
            }

            return;
        }

        if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "update", item.item ) && dialogBox !== null ) {
            if ( this.isAllowed( DSDatabase.Instance.CurrentUser, "read", item.item ) ) {
                dialogBox.readRecord( item.id );
            }
            return;
        }

        if ( item === null ) {
            event( null );
        } else {
            event( item.id, item.item );
        }
    }

    /**
     * Event raised on Cancel an element selected into the board within the current item selected
     */
    onBoardCancel () {
        if ( !this.IsVisibleCancel )
            return;

        let event = this.getEvent( "cancel" );
        if ( event === null )
            return;

        let item = this.getSelectedItem();
        if ( item === null ) {
            if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "cancel" ) )
                return;

            event( null );
            return;
        }

        if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "cancel", item.item ) )
            return;

        event( item.id, item.item );
    }

    /**
     * Event raised on Delete a element selected into the board within the current item selected
     */
    onBoardDelete () {
        if ( !this.IsVisibleDelete )
            return;

        let event = this.getEvent( "delete" );
        if ( event === null )
            return;

        let item = this.getSelectedItem();
        if ( item === null ) {
            if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "delete" ) )
                return;

            event( null );
            return;
        }

        if ( !this.isAllowed( DSDatabase.Instance.CurrentUser, "delete", item.item ) )
            return;

        event( item.id, item.item );
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
                this.verbose( "Sorting table by '" + id + "' ..." );
                this.Webix.sort( column.sort, order === null || order === undefined ? "asc" : order );
                this.Webix.markSorting( id, order === null || order === undefined ? "asc" : order );
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
     */
    toPDF( docPDF ) {
        let columns = [];

        for ( let column of this._pdfColumns )
            if ( this.Webix.isColumnVisible( column.field ) )
                columns.push( column );

        docPDF.createTable( null, columns, this.List );

        return docPDF;
    }

    /**
     * Clear all cache values
     */
    clearWebixCache() {
        super.clearWebixCache();

        this._webixCacheHTML = {};
        this._webixCacheValue = {};
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

        this._webixCacheHTML = {};
        this._webixCacheValue = {};
        this._webixCacheHeight = {};

        this._alreadyOpened = false;
        this._listEvents = false;
        this._keepListEvents = false;
    }
};
