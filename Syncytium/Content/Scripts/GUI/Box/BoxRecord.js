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
 * Define a dialog box handling a record
 */
GUI.Box.BoxRecord = class extends GUI.Box.Box {
    /**
     * @returns {string} Root directory of the pictures described into an enumerable type ("/Content/Images/Areas/")
     */
    static get ROOT_DIRECTORY() {
        return URL_ROOT + "Content/Images/Areas/";
    }

    /**
     * @returns {string} "Create"
     */
    static get MODE_CREATE() {
        return "Create";
    }

    /**
     * @returns {string} "Read"
     */
    static get MODE_READ() {
        return "Read";
    }

    /**
     * @returns {string} "Update"
     */
    static get MODE_UPDATE() {
        return "Update";
    }

    /**
     * @returns {string} "Delete"
     */
    static get MODE_DELETE() {
        return "Delete";
    }

    /**
     * @param {string} table table name
     * @param {string} key   key used to allow only one box open at time for this key (if null or undefined, no box)
     * @param {any} list  list to assign to the dialog box
     * @returns {GUI.Box.BoxRecord} a box record corresponding to a table
     */
    static CACHE_DIALOG_BOX( table, key, list ) {
        if ( !this._cacheDialogBox )
            this._cacheDialogBox = {};

        if ( table === null || table === undefined )
            return null;

        let name = table + (key === null || key === undefined ? "" : "." + key);
        let dialogBox = this._cacheDialogBox[name];

        if ( dialogBox !== null && dialogBox !== undefined ) {
            for ( let i = 0; i < dialogBox.length; i++ ) {
                if ( !dialogBox[i].IsOpened ) {
                    dialogBox[i].List = list;
                    dialogBox[i].OnClosed = null;
                    return dialogBox[i];
                }

                if ( key !== null && key !== undefined ) {
                    dialogBox[i].List = list;
                    dialogBox[i].OnClosed = null;
                    return dialogBox[i];
                }
            }
        }

        try {
            dialogBox = eval( table + "Record.Box" );
        } catch ( e ) {
            try {
                dialogBox = eval( table + ".Box" );
            } catch ( e ) {
                return null;
            }
        }

        if ( !dialogBox )
            return null;

        dialogBox = new dialogBox();
        dialogBox.List = list;
        dialogBox.Commit = true;
        if ( this._cacheDialogBox[name] === null || this._cacheDialogBox[name] === undefined )
            this._cacheDialogBox[name] = [];
        this._cacheDialogBox[name].push(dialogBox);
        return dialogBox;
    }

    /**
     * @returns {any} record updated into the dialog box
     */
    get Value() {
        let newRecord = DSRecord.Clone( this._currentRecord );

        for ( let fieldName in this.Fields ) {
            if ( this._currentRecord === null )
                continue;

            if ( this._currentRecord._list && fieldName === this._currentRecord._list.column )
                continue;

            newRecord[fieldName] = DSDatabase.Instance.convertValue( this._table, fieldName, this.Fields[fieldName].Value, false );
        }

        let fieldName = this._list.SequenceProperty;
        if ( fieldName !== null && fieldName !== undefined &&
            this.Fields[fieldName] !== null && this.Fields[fieldName] !== undefined && this._noSequence )
            newRecord[fieldName] = null;

        return newRecord;
    }

    /**
     * Set the error of the dialog box or string
     * @param {Errors} value error to show in the dialog box
     */
    set Error( value ) {
        super.Error = value;

        if ( this._initializing || this._refreshing )
            return;

        if ( this._panels === null || this._navigationPanels === null ) {
            this.refreshPanel();
        } else {
            this.gotoCurrentPanel();
        }
    }

    /**
     * @param {boolean} value Automatically commit all changes in the dialog box
     */
    set Commit ( value ) {
        this._commit = value !== null && value !== undefined && value;
    }

    /**
     * @returns {string} table name attached to the dialog box
     */
    get Table() {
        return this._table;
    }

    /**
     * @returns {List.List} list representing all ressources
     */
    get List() {
        return this._list;
    }

    /**
     * @param {any} list set a list to this box
     */
    set List( list ) {
        this._list = list ? list : new List.ListRecord( this._table );
    }

    /**
     * @returns {boolean} true if the box is never closed on "OK" (for Create mode only)
     */
    get LoopOnCreate() {
        return this._loopOnCreate;
    }

    /**
     * @param {boolean} loop true if the box is never closed on "OK" (for Create mode only)
     */
    set LoopOnCreate( loop ) {
        this._loopOnCreate = loop !== null && loop !== undefined && loop === true;
    }

    /**
     * @returns {any} a new record from the list
     */
    get NewRecord () {
        return this._list.NewItem;
    }

    /**
     * @returns {any} current record attached to the dialog box
     */
    get CurrentRecord() {
        return this._currentRecord;
    }

    /**
     * @returns {any} origin record attached to the dialog box
     */
    get OriginRecord() {
        return this._originRecord;
    }

    /**
     * Declare a field into the box
     * @param {any} field new field to add (if string, it's a field into the table or directly a GUI.Field.Field object)
     * @returns {GUI.Field.Field} field added into the box
     */
    declareField( field ) {
        if ( field === undefined || field === null )
            return;

        if ( field instanceof GUI.Field.Field )
            return super.declareField( field );

        if ( typeof field !== "string" )
            return;

        let column = DSDatabase.Instance.getColumn( this._table, field );
        let label = DSDatabase.Instance.getColumnLabel( this._table, field );
        let defaultValue = null;
        let enumerable = null;
        let path = null;
        let mask = null;
        let sequence = null;
        let foreignKey = null;

        if ( column === null )
            return super.declareField( new GUI.Field.FieldInput( this, field, label ) );

        let newField = null;
        switch ( column.Type ) {
            case "Int32":
                foreignKey = column.ForeignKey;
                if (foreignKey !== null) {
                    enumerable = null;
                    try {
                        enumerable = eval(foreignKey.Table + "Record.List");
                    } catch (e) {
                        enumerable = null;
                    }

                    if (enumerable) {
                        enumerable = new enumerable(false);
                    } else {
                        enumerable = new List.ListRecord(foreignKey.Table, false);
                    }

                    if ( DSDatabase.Instance.getColumn( foreignKey.Table, "Picture" ) !== null || DSDatabase.Instance.getColumn( foreignKey.Table, "Image" ) !== null ) {
                        newField = new GUI.Field.FieldSelectImage( this, field, label, this._table.toUpperCase() + "_SELECT_" + field.toUpperCase(), enumerable);
                        if (!column.IsRequired)
                            newField.setAllowNullValue(true, this._table.toUpperCase() + "_SELECT_" + field.toUpperCase() + "_NULL");
                        newField.Autovalidation = true;
                        newField.ShowLabel = true;
                    } else {
                        newField = new GUI.Field.FieldSelect(this, field, label, enumerable);
                        newField.AllowNullValue = !column.IsRequired;
                    }
                    break;
                }
                newField = new GUI.Field.FieldInputDigit( this, field, label, column.Digit, column.Unit );
                break;

            case "Double":
            case "Decimal":
                newField = new GUI.Field.FieldInputDigit(this, field, label, column.Digit, column.Unit);
                break;

            case "Boolean":
                newField = new GUI.Field.FieldCheckBox( this, field, label, [label + "_NULL", label + "_TRUE", label + "_FALSE"] );
                newField.AllowNullValue = !column.IsRequired;
                break;

            case "String":
                sequence = DSDatabase.Instance.getSequence( this._table );
                if (sequence !== null && field === sequence.Property) {
                    newField = new GUI.Field.FieldInputDigit( this, field, label, new Digits.Sequence( sequence.Key, sequence.Length ) );
                    newField.AsString = true;
                } else {
                    mask = column.StringFormat;
                    if (!String.isEmptyOrWhiteSpaces(mask)) {
                        newField = new GUI.Field.FieldInputDigit( this, field, label, new Digits.Mask( mask, "\0"));
                        newField.AsString = true;
                    } else if (column.IsEmail) {
                        newField = new GUI.Field.FieldInput(this, field, label, GUI.Field.FieldInput.TYPE_INPUT, null, column.StringMaxLength);
                    } else {
                        let maxLength = column.StringMaxLength;
                        maxLength = maxLength === null ? 2000 : maxLength;
                        newField = new GUI.Field.FieldInput(this, field, label, maxLength > 64 ? GUI.Field.FieldInput.TYPE_TEXTAREA : GUI.Field.FieldInput.TYPE_INPUT, null, maxLength);
                        newField.AllowRC = maxLength > 64;
                    }
                }
                break;

            case "Enum":
                path = column.PathEnumerable;
                enumerable = this.getListEnumerable( field );

                if ( String.isEmptyOrWhiteSpaces( path ) || !IMAGES_LOADED_FROM_SERVER.startsWith( path ) && IMAGES_LOADED_FROM_SERVER.indexOf( "," + path ) < 0 ) {
                    newField = new GUI.Field.FieldSelect( this, field, label, enumerable );
                    newField.AllowNullValue = !column.IsRequired;
                } else {
                    newField = new GUI.Field.FieldSelectImage( this, field, label, this._table.toUpperCase() + "_SELECT_" + field.toUpperCase(), enumerable);
                    newField.Autovalidation = true;
                    if ( !column.IsRequired )
                        newField.setAllowNullValue( true, this._table.toUpperCase() + "_SELECT_" + field.toUpperCase() + "_NULL" );
                }
                break;

            case "DateTime":
                mask = column.DatetimeFormat;
                newField = new GUI.Field.FieldInputWithBox( this, field, label, mask === null ? "datetime" : mask );
                newField.AllowNullValue = !column.IsRequired;
                break;

            case "Byte[]":
                try {
                    defaultValue = eval( this._table + "Record.DEFAULT_PICTURE" )();
                } catch ( e ) {
                    if ( this.IsVerbose )
                        this.exception( "[Verbose] An exception occurs on showing the column", e );
                }

                newField = new GUI.Field.FieldFileImage( this, field, label, defaultValue );
                if ( defaultValue !== null )
                    newField.DefaultPicture = defaultValue.picture;

                break;
        }

        if ( newField === null )
            return super.declareField( new GUI.Field.FieldInput( this, field, this._table.toUpperCase() + "_" + field.toUpperCase() ) );

        return super.declareField( newField );
    }

    /**
     * Define the list of buttons of the dialog box
     * @param {any} container zone having the list of buttons
     */
    drawButton ( container ) {
        super.drawButton( container );

        this._buttonFirst = this.declareButton(GUI.Box.Box.BUTTON_FIRST, "BTN_FIRST");
        this._buttonPrevious = this.declareButton(GUI.Box.Box.BUTTON_PREVIOUS, "BTN_PREVIOUS");
        this._buttonOK = this.declareButton(GUI.Box.Box.BUTTON_OK, "BTN_SUBMIT");

        this.drawAdditionalButton(container);

        this._buttonCancel = this.declareButton( GUI.Box.Box.BUTTON_CANCEL, "BTN_CANCEL" );
        this._buttonClose = this.declareButton( GUI.Box.Box.BUTTON_CLOSE, "BTN_CLOSE" );
        this._buttonSearch = this.declareButton(GUI.Box.Box.BUTTON_SEARCH, "BTN_SEARCH");
        this._buttonNext = this.declareButton(GUI.Box.Box.BUTTON_NEXT, "BTN_NEXT");
        this._buttonLast = this.declareButton(GUI.Box.Box.BUTTON_LAST, "BTN_LAST");
    }

    /**
     * Draw and show the content of the dialog box
     * @param {any} container zone having the content
     */
    drawContent ( container ) {
        super.drawContent( container );
        container.show();
    }

    /**
     * Virtual method to draw buttons of the dialog box between OK and CANCEL (for example: New password)
     * @param {any} container zone having the list of buttons
     */
    drawAdditionalButton ( container ) {
    }

    /**
     * Virtual method to check if the record is selected within the value or not
     * @param {any} item record into the list of items
     * @param {string} value value to check
     * @returns {boolean} true if the record is selected, else false
     */
    isSelectedRecord(item, value) {
        if (String.isEmptyOrWhiteSpaces(value))
            return true;

        return String.in(this.List.getText(item), value);
    }

    /**
     * Raise on first record enabled
     */
    onFirstRecord() {
        if (this._updatedRecords === null || this._updatedIndex <= 0)
            return;

        this.close();
        this.debug("Go to the first record");
        this._updatedIndex = 0;
        this.initialize(this._updatedRecords[this._updatedRecordsSelected[this._updatedIndex]], this.Mode, false);
        this.open();

        this._buttonFirst.Readonly = true;
        this._buttonPrevious.Readonly = true;
        this._buttonNext.Readonly = this._updatedIndex >= this._updatedRecordsSelected.length - 1;
        this._buttonLast.Readonly = this._updatedIndex >= this._updatedRecordsSelected.length - 1;
    }

    /**
     * Raise on previous record enabled
     */
    onPreviousRecord() {
        if (this._updatedRecords === null || this._updatedIndex <= 0)
            return;

        this.close();
        this.debug("Go to the previous record");
        this._updatedIndex--;
        this.initialize(this._updatedRecords[this._updatedRecordsSelected[this._updatedIndex]], this.Mode, false);
        this.open();

        this._buttonFirst.Readonly = this._updatedIndex <= 0;
        this._buttonPrevious.Readonly = this._updatedIndex <= 0;
        this._buttonNext.Readonly = this._updatedIndex >= this._updatedRecordsSelected.length - 1;
        this._buttonLast.Readonly = this._updatedIndex >= this._updatedRecordsSelected.length - 1;
    }

    /**
     * Raise on searching record (default function)
     */
    onSearchRecord() {
        if (this._updatedRecords === null)
            return;

        GUI.Box.BoxInputText.Open("TITLE_SEARCH", this.List.Table.toUpperCase() + "_SEARCH", this._updatedSearch, false, (value) => {
            // Select items matching within the label

            this.debug("Looking for a given record");
            this._updatedSearch = value;

            let oldArray = this._updatedRecordsSelected;
            let oldIndex = oldArray[this._updatedIndex];

            let i = 0;

            this._updatedRecordsSelected = [];
            for (i = 0; i < this._updatedRecords.length; i++) {
                if (this.isSelectedRecord(this.List.getItem(this._updatedRecords[i]), this._updatedSearch))
                    this._updatedRecordsSelected.push(i);
            }

            if (this._updatedRecordsSelected.length === 0)
                this._updatedRecordsSelected.push(oldIndex);

            this._updatedIndex = 0;
            for (i = 0; i < this._updatedRecordsSelected.length; i++) {
                this._updatedIndex = i;

                if (this._updatedRecordsSelected[i] >= oldIndex)
                    break;
            }

            if (oldIndex !== this._updatedRecordsSelected[this._updatedIndex]) {
                this.close();
                this.debug("Go to the first record found");
                this.initialize(this._updatedRecords[this._updatedRecordsSelected[this._updatedIndex]], this.Mode, false);
                this.open();
            }

            this._buttonFirst.Readonly = this._updatedIndex <= 0;
            this._buttonPrevious.Readonly = this._updatedIndex <= 0;
            this._buttonNext.Readonly = this._updatedIndex >= this._updatedRecordsSelected.length - 1;
            this._buttonLast.Readonly = this._updatedIndex >= this._updatedRecordsSelected.length - 1;
        });
    }

    /**
     * Raise on next record enabled
     */
    onNextRecord() {
        if (this._updatedRecords === null || this._updatedIndex >= this._updatedRecordsSelected.length - 1)
            return;

        this.close();
        this.debug("Go to the next record");
        this._updatedIndex++;
        this.initialize(this._updatedRecords[this._updatedRecordsSelected[this._updatedIndex]], this.Mode, false);
        this.open();

        this._buttonFirst.Readonly = this._updatedIndex <= 0;
        this._buttonPrevious.Readonly = this._updatedIndex <= 0;
        this._buttonNext.Readonly = this._updatedIndex >= this._updatedRecordsSelected.length - 1;
        this._buttonLast.Readonly = this._updatedIndex >= this._updatedRecordsSelected.length - 1;
    }

    /**
     * Raise on last record enabled
     */
    onLastRecord() {
        if (this._updatedRecords === null || this._updatedIndex >= this._updatedRecords.length - 1)
            return;

        this.close();
        this.debug("Go to the last record");
        this._updatedIndex = this._updatedRecordsSelected.length - 1;
        this.initialize(this._updatedRecords[this._updatedRecordsSelected[this._updatedIndex]], this.Mode, false);
        this.open();

        this._buttonFirst.Readonly = this._updatedIndex <= 0;
        this._buttonPrevious.Readonly = this._updatedIndex <= 0;
        this._buttonNext.Readonly = true;
        this._buttonLast.Readonly = true;
    }

    /**
     * Raise on key pressed on the box
     * @param {any} event keyboard events
     */
    onKeypressed(event) {
        if (this.Mode === GUI.Box.BoxRecord.MODE_UPDATE && this._updatedRecords !== null) {
            switch (event.key) {
                case "Home":
                    event.stopImmediatePropagation();
                    this._buttonFirst.onMouseClick();
                    return false;

                case "PageUp":
                    event.stopImmediatePropagation();
                    this._buttonPrevious.onMouseClick();
                    return false;

                case "PageDown":
                    event.stopImmediatePropagation();
                    this._buttonNext.onMouseClick();
                    return false;

                case "End":
                    event.stopImmediatePropagation();
                    this._buttonLast.onMouseClick();
                    return false;

                case "f":
                    if (!event.ctrlKey)
                        return false;
                    event.stopImmediatePropagation();
                    this._buttonNext.onMouseClick();
                    return false;
            }
        }

        return super.onKeypressed(event);
    }

    /**
     * @param {string} field field name to check
     * @returns {boolean} true if the current focus is focusable ...
     */
    isFocusable( field ) {
        if ( !super.isFocusable( field ) )
            return false;

        if ( field instanceof GUI.Field.Field ) {
            let user = DSDatabase.Instance.CurrentUser;
            let item = this.Value;

            if ( !this.isFieldVisible( field.Name, user, item ) || this.isFieldReadonly( field.Name, user, item ) )
                return false;

            if ( !this.isPanelVisible( field.Panel, user, item ) )
                return false;
        }

        return true;
    }

    /**
     * Initialize the box record
     * @param {any} record   record to set in the dialog box
     * @param {any} mode     "Create", "Read", "Update" or "Delete"
     * @param {any} readonly all fields in readonly mode
     */
    initialize( record, mode, readonly ) {
        this._initializing = true;

        this.Mode = mode;
        this._currentRecord = this.getRecord( record );
        this._originRecord = this.Mode === GUI.Box.BoxRecord.MODE_READ ? this._currentRecord : this.getRecord( this._list.getId( this._currentRecord ) );

        this.debug( "Initializing the box ('" + mode + "', " + ( readonly ? "Readonly" : "Not Readonly" ) + ") for the record [" + this._currentRecord.Id.toString() + "] ..." );

        this.Title = Helper.Label( this.Name.toUpperCase() + "_" + mode.toUpperCase(), this.getRecordLabel() );
        this.Message = null;
        this.Error = null;
        this.Readonly = readonly;

        this._initializing = false;
    }

    /**
     * Retrieve the list of values and pictures for a given column in a table into the database
     * @param {any} column column name into the table referenced into this dialog box
     * @returns {any} enumerable list
     */
    getListEnumerable ( column ) {
        return new List.ListArray( new List.ListEnumerable( this._table, column, GUI.Box.BoxRecord.ROOT_DIRECTORY ).getList() );
    }

    /**
     * Virtual method to get the label of the record
     * @returns {string} short description of the current record (take a field or a list of fields from the record)
     */
    getRecordLabel() {
        let title = this._list.getText( this.Value );

        if ( String.isEmptyOrWhiteSpaces(title) )
            return "{TITLE_NOT_DEFINED}";

        return title;
    }

    /**
     * Retrieve a record into the list on depends on its id or the current record
     * @param {any} id id of the record or the detail of the record to retrieve
     * @returns {any} record matching within the given id
     */
    getRecord ( id ) {
        let record = null;

        if ( typeof id === "number" || typeof id === "string" ) {
            record = DSRecord.Clone( this._list.getItem( id, true ) );
        } else {
            record = DSRecord.Clone( id );
        }

        if ( record === null )
            record = this.NewRecord;

        return record;
    }

    /**
     * Update record into the box by setting value one by one to the list of fields
     */
    updateFields() {
        super.updateFields();

        if ( this._currentRecord === null || this._currentRecord === undefined )
            return;

        for ( let fieldName in this.Fields ) {
            let field = this.Fields[fieldName];

            try {
                if ( field instanceof GUI.Field.FieldSelect )
                    field.ExcludeValueToFilter = this._currentRecord[fieldName];
                field.populate();
                field.Value = this._currentRecord[fieldName];
            } catch ( e ) {
                this.exception( `Unable to set the value of the field ${fieldName}`, e );
            }
        }
    }

    /**
     * Update record into the box by setting value one by one to the list of fields
     */
    async updateBoards() {
        super.updateBoards();

        for ( let board of Array.toIterable( this.Boards ) ) {
            try {
                board.clearWebixCache();
                await board.populateWebix();
                await board.adjustWebix();
            } catch ( e ) {
                this.exception( `Unable to populate the list ${board.Name}`, e );
            }
        }
    }

    /**
     * True if the field is visible
     * @param {any} attribute column / property
     * @param {any} user     current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the field is allowed to be shown
     */
    isFieldVisible( attribute, user, item ) {
        if ( !super.isFieldVisible( attribute, user, item ) )
            return false;

        return this._list.isBoxFieldVisible(this, attribute, user, item);
    }

    /**
     * False if the field can be updated
     * @param {any} attribute column / property
     * @param {any} user     current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the field can't be updated by the current user
     */
    isFieldReadonly( attribute, user, item ) {
        if ( super.isFieldReadonly( attribute, user, item ) )
            return true;

        return this._list.isBoxFieldReadonly( this, attribute, user, item );
    }

    /**
     * True if the board is visible
     * @param {any} board board name
     * @param {any} user  current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the board is allowed to be shown
     */
    isBoardVisible( board, user, item ) {
        if ( !super.isBoardVisible( board, user, item ) )
            return false;

        return this._list.isBoxBoardVisible( this, board, user, item );
    }

    /**
     * False if the board can be updated
     * @param {any} board board name
     * @param {any} user  current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the board can't be updated by the current user
     */
    isBoardReadonly( board, user, item ) {
        if ( super.isBoardReadonly( board, user, item ) )
            return true;

        return this._list.isBoxBoardReadonly( this, board, user, item );
    }

    /**
     * True if the panel is visible
     * @param {any} panel panel name
     * @param {any} user  current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the panel is allowed to be shown
     */
    isPanelVisible( panel, user, item ) {
        if ( !super.isPanelVisible( panel, user, item ) )
            return false;

        if ( panel === "_history" && this.Mode === GUI.Box.BoxRecord.MODE_CREATE )
            return false;

        return this._list.isBoxPanelVisible( this, panel, user, item );
    }

    /**
     * False if the panel can be updated
     * @param {any} panel panel name
     * @param {any} user  current user
     * @param {any} item  item handled by the current dialog box
     * @returns {boolean} true if the panel can't be updated by the current user
     */
    isPanelReadonly( panel, user, item ) {
        if ( super.isPanelReadonly( panel, user, item ) )
            return true;

        return this._list.isBoxPanelReadonly( this, panel, user, item );
    }

    /**
     * Open the dialog box
     */
    open() {
        this.verbose( "Openning box ..." );
        super.open();

        // Set a message under the sequence to notify that the sequence number can't be defined and will be updated as soon as the synchronization will be done

        let fieldName = this._list.SequenceProperty;
        if ( fieldName !== null && fieldName !== undefined &&
             this.Fields[fieldName] !== null && this.Fields[fieldName] !== undefined ) {
            if ( this._noSequence ) {
                this.Fields[fieldName].Component.find( "#field > .field" ).hide();
                this.Fields[fieldName].Message = Helper.Span( "ERR_SEQUENCE_" + this.Table.toUpperCase() );
            } else {
                this.Fields[fieldName].Component.find( "#field > .field" ).show();
                this.Fields[fieldName].Message = null;
            }
        }
    }

    /**
     * Close the dialog box
     */
    close() {
        super.close();
        this._noSequence = false;
    }

    /**
     * Open the dialog box for creating a new record
     * @param {any} record record to clone for a new one
     * @param {any} mode if defined, replace "Create"
     * @param {any} done if defined, raise a function on OK and commit
     */
    createRecord( record, mode, done ) {
        function handleOpen( box ) {
            return function () {
                box.open();

                box.debug( "Box record is opened for creating an item" );
            };
        }

        function handleConfirmCreationRecord( box ) {
            return async function () {
                // Run the validation again ...

                let errors = new Errors();

                box._list.beginTransaction( Helper.Label( box.Name.toUpperCase() + "_" + box.Mode.toUpperCase() + "D_TOAST", box.getRecordLabel() ) );

                let newItem = box._list.addItem( record, errors, true );

                box._list.endTransaction();

                if ( errors.HasError ) {
                    box.Error = errors;

                    if ( box._commit )
                        await box._list.rollbackAsync();

                    return;
                }

                if ( box._commit ) {
                    box._currentRecord = newItem;
                    await box._list.commitAsync();
                }

                if ( done )
                    done( newItem );

                if ( !box._loopOnCreate )
                    box.close();
            };
        }

        function handleCreateRecord( box ) {
            return async function ( record ) {
                let errors = new Errors();

                box._list.beginTransaction( Helper.Label( box.Name.toUpperCase() + "_" + box.Mode.toUpperCase() + "D_TOAST", box.getRecordLabel() ) );

                let confirmation = box._list.addItem( record, errors, false );

                box._list.endTransaction();

                if ( Helper.IsLabel( confirmation ) ) {
                    // it's a message of confirmation
                    GUI.Box.Message.Message( box.Title, confirmation, handleConfirmCreationRecord( box ) );
                    return false;
                }

                if ( errors.HasError ) {
                    if ( box._commit )
                        await box._list.rollbackAsync();

                    return errors;
                }

                if ( box._commit ) {
                    box._currentRecord = confirmation;
                    await box._list.commitAsync();
                }

                if ( done )
                    done( confirmation );

                return !box._loopOnCreate;
            };
        }

        function handleCancelRecord( box ) {
            return function ( record ) {
                box.debug( "Cancelling record ..." );

                let errors = new Errors();
                box._list.cancelItem( -1, null, box.Value, errors );
                box.close();

                return true;
            };
        }

        if ( this.IsOpened )
            return;

        this.debug( "Opening a box record for creating an item ..." );

        this._updatedRecords = null;
        this._updatedRecordsSelected = null;
        this._updatedIndex = null;
        this._updatedSearch = null;

        this.initialize( record === undefined || record === null ? null : record, mode ? mode : GUI.Box.BoxRecord.MODE_CREATE, false );

        this._buttonFirst.Visible = false;
        this._buttonPrevious.Visible = false;
        this._buttonOK.Visible = true;
        this._buttonOK.Action = handleCreateRecord( this );
        this._buttonCancel.Visible = true;
        this._buttonCancel.Action = handleCancelRecord( this );
        this._buttonClose.Visible = false;
        this._buttonSearch.Visible = false;
        this._buttonNext.Visible = false;
        this._buttonLast.Visible = false;

        if ( !this._list.createSequence( this._currentRecord, handleOpen( this ) ) ) {
            this._noSequence = true;
            handleOpen( this )();
        }
    }

    /**
     * Open the dialog box for reading an existing record
     * @param {any} record record to show in the dialog box
     */
    readRecord ( record ) {
        if ( this.IsOpened )
            return;

        this.debug( "Opening a box record for reading an item ..." );

        this._updatedRecords = null;
        this._updatedRecordsSelected = null;
        this._updatedIndex = null;
        this._updatedSearch = null;

        this.initialize( record, GUI.Box.BoxRecord.MODE_READ, true );

        this._buttonFirst.Visible = false;
        this._buttonPrevious.Visible = false;
        this._buttonOK.Visible = false;
        this._buttonOK.Action = null;
        this._buttonCancel.Visible = false;
        this._buttonClose.Visible = true;
        this._buttonSearch.Visible = false;
        this._buttonNext.Visible = false;
        this._buttonLast.Visible = false;

        this.open();

        this._buttonClose.focus();

        this.debug( "Box record is opened for reading an item" );
    }

    /**
     * Open the dialog box for updating a record
     * @param {any} record record to update (or array of records to update)
     * @param {any} mode if defined, replace "Update"
     * @param {any} done if defined, raise a function on OK and commit
     */
    updateRecord(record, mode, done) {
        function executeEvent(box, event) {
            if (box._updatedRecords === null || event === "ok")
                return true;

            switch (event) {
                case "first":
                    box.onFirstRecord();
                    break;

                case "previous":
                    box.onPreviousRecord();
                    break;

                case "search":
                    box.onSearchRecord();
                    break;

                case "next":
                    box.onNextRecord();
                    break;

                case "last":
                    box.onLastRecord();
                    break;
            }

            return false;
        }

        function handleConfirmUpdateRecord( box, event ) {
            return async function () {
                let oldRecord = box._originRecord;
                let newRecord = box.Value;

                // Run the validation again ...

                let errors = new Errors();

                box._list.beginTransaction( Helper.Label( box.Name.toUpperCase() + "_" + box.Mode.toUpperCase() + "D_TOAST", box.getRecordLabel() ) );

                let itemUpdated = box._list.updateItem( oldRecord.Id, oldRecord, newRecord, errors, true );
                
                box._list.endTransaction();

                if ( errors.HasError ) {
                    box.Error = errors;

                    if ( box._commit )
                        await box._list.rollbackAsync();
                    return;
                }

                if ( box._commit ) {
                    box._currentRecord = itemUpdated;
                    await box._list.commitAsync();
                }

                if ( done )
                    done( itemUpdated );

                if (executeEvent(box, event))
                    box.close();
            };
        }

        function handleUpdateRecord( box, event ) {
            return async function ( record ) {
                let oldRecord = box._originRecord;
                let newRecord = box.Value;

                if ( DSRecord.IsEqual( oldRecord, newRecord ) ) {
                    box.debug("Record unchanged");
                    return executeEvent(box, event);
                }
                box.debug( "Updating record ..." );

                let errors = new Errors();

                box._list.beginTransaction( Helper.Label( box.Name.toUpperCase() + "_" + box.Mode.toUpperCase() + "D_TOAST", box.getRecordLabel() ) );

                let confirmation = box._list.updateItem( oldRecord.Id, oldRecord, newRecord, errors, false );

                box._list.endTransaction();

                if ( Helper.IsLabel( confirmation ) ) {
                    // Rollback all previous updating done in database until the asking of confirmation

                    await box._list.rollbackAsync();

                    // it's a message of confirmation

                    GUI.Box.Message.Message( box.Title, confirmation, handleConfirmUpdateRecord( box, event ) );

                    return false;
                }

                if ( errors.HasError ) {
                    if ( box._commit )
                        await box._list.rollbackAsync();

                    return errors;
                }

                if ( box._commit ) {
                    box._currentRecord = confirmation;
                    await box._list.commitAsync();
                }

                if ( done )
                    done( confirmation );

                return executeEvent(box, event);
            };
        }

        function handleCancelRecord( box ) {
            return function ( record ) {
                box.debug( "Cancelling record ..." );

                let oldRecord = box._originRecord;
                let newRecord = box.Value;

                if ( DSRecord.IsEqual( oldRecord, newRecord ) )
                    return true;

                function handleClose() {
                    let errors = new Errors();
                    box._list.cancelItem( newRecord.Id, oldRecord, newRecord, errors );
                    if ( errors.HasError )
                        box.Error = errors;
                    else
                        box.close();
                }

                GUI.Box.Message.Message( box.Title, "MSG_CONFIRMATION_CANCEL", handleClose );

                return false;
            };
        }

        if ( this.IsOpened )
            return;

        this.debug("Opening a box record for updating an item ...");

        if (Array.isArray(record)) {
            let i = 0;

            this._updatedRecords = [];
            this._updatedRecordsSelected = [];

            for (let item of Array.toIterable(record)) {
                this._updatedRecords.push(this.List.getId(item));
                if (this.isSelectedRecord(item, this._updatedSearch))
                    this._updatedRecordsSelected.push(i);
                i++;
            }

            this._updatedSearch = null;
            this._updatedIndex = 0;

            this.initialize(this._updatedRecords[this._updatedRecordsSelected[this._updatedIndex]], mode ? mode : GUI.Box.BoxRecord.MODE_UPDATE, false);

            this._buttonFirst.Visible = true;
            this._buttonFirst.Readonly = this._updatedIndex <= 0;
            this._buttonFirst.Action = handleUpdateRecord(this, "first");
            this._buttonPrevious.Visible = true;
            this._buttonPrevious.Readonly = this._updatedIndex <= 0;
            this._buttonPrevious.Action = handleUpdateRecord(this, "previous");
            this._buttonSearch.Visible = true;
            this._buttonSearch.Readonly = false;
            this._buttonSearch.Action = handleUpdateRecord(this, "search");
            this._buttonNext.Visible = true;
            this._buttonNext.Readonly = this._updatedIndex >= this._updatedRecords.length - 1;
            this._buttonNext.Action = handleUpdateRecord(this, "next");
            this._buttonLast.Visible = true;
            this._buttonLast.Readonly = this._updatedIndex >= this._updatedRecords.length - 1;
            this._buttonLast.Action = handleUpdateRecord(this, "last");
        } else {
            this._updatedRecords = null;
            this._updatedRecordsSelected = null;
            this._updatedIndex = null;
            this._updatedSearch = null;

            this.initialize(record, mode ? mode : GUI.Box.BoxRecord.MODE_UPDATE, false);

            this._buttonFirst.Visible = false;
            this._buttonPrevious.Visible = false;
            this._buttonSearch.Visible = false;
            this._buttonNext.Visible = false;
            this._buttonLast.Visible = false;
        }

        this._buttonOK.Visible = true;
        this._buttonOK.Action = handleUpdateRecord(this, "ok");
        this._buttonCancel.Visible = true;
        this._buttonCancel.Action = handleCancelRecord( this );
        this._buttonClose.Visible = false;

        this.open();

        this.debug( "Box record is opened for updating an item" );
    }

    /**
     * Ask the validation of the deletion of a given record
     * @param {any} record record to delete
     */
    deleteRecord ( record ) {
        if ( this.IsOpened )
            return;

        this.debug( "Opening a box record for deleting an item ..." );

        this.initialize( record, GUI.Box.BoxRecord.MODE_DELETE, true );

        function handleDeleteRecord( box ) {
            return async function ( record ) {
                let errors = new Errors();

                box._list.beginTransaction( Helper.Label( box.Name.toUpperCase() + "_" + box.Mode.toUpperCase() + "D_TOAST", box.getRecordLabel() ) );
                box._list.deleteItem( box._originRecord.Id, box._originRecord, errors );
                box._list.endTransaction();

                if ( errors.HasError ) {
                    if ( box._commit )
                        await box._list.rollbackAsync();

                    return errors;
                }

                if ( box._commit )
                    await box._list.commitAsync();

                return true;
            };
        }

        this._updatedRecords = null;
        this._updatedRecordsSelected = null;
        this._updatedIndex = null;
        this._updatedSearch = null;

        this._buttonFirst.Visible = false;
        this._buttonPrevious.Visible = false;
        this._buttonOK.Visible = true;
        this._buttonOK.Action = handleDeleteRecord( this );
        this._buttonCancel.Visible = true;
        this._buttonClose.Visible = false;
        this._buttonSearch.Visible = false;
        this._buttonNext.Visible = false;
        this._buttonLast.Visible = false;

        this.open();

        this.debug( "Box record is opened for deleting an item" );
    }

    /**
     * Constructor
     * @param {any} table table name related to this dialog box (name of the dialog)
     * @param {any} list  list representing the list of records of the table
     */
    constructor( table, list ) {
        super( table, "box_record" );

        this._initializing = false;
        this._refreshing = false;

        this._noSequence = false;
        this._table = table;
        this._list = list ? list : new List.ListRecord( table );
        this._originRecord = null;
        this._currentRecord = null;
        this._commit = false;
        this._loopOnCreate = false;

        this._buttonFirst = null;
        this._buttonPrevious = null;
        this._buttonOK = null;
        this._buttonCancel = null;
        this._buttonClose = null;
        this._buttonSearch = null;
        this._buttonNext = null;
        this._buttonLast = null;

        this._updatedRecords = null;
        this._updatedRecordsSelected = null;
        this._updatedIndex = null;
        this._updatedSearch = null;
    }
};
