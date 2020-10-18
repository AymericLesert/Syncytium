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

class CSV extends LoggerBaseObject {
    /**
     * @returns {string} identifier of the current csv file
     */
    get Name() {
        return this._name;
    }

    /**
     * @returns {string} charset of the file
     */
    get Charset() {
        return this._charset;
    }

    /**
     * @returns {string} separator between 2 fields
     */
    get Separator() {
        return this._separator;
    }

    /**
     * @returns {integer} number of rows into the CSV
     */
    get RowCount() {
        return this._rowCount;
    }

    /**
     * @returns {integer} current row number into the file
     */
    get RowCurrent() {
        return this._rowNumber;
    }

    /**
     * @returns {integer} number of rows added into the database
     */
    get RowAdded() {
        return this._rowAdded;
    }

    /**
     * @returns {integer} number of rows updated into the database
     */
    get RowUpdated() {
        return this._rowUpdated;
    }

    /**
     * @returns {integer} number of rows delted into the database
     */
    get RowDeleted() {
        return this._rowDeleted;
    }

    /**
     * @returns {boolean} indicates if csv must delete all lines not imported
     */
    get WillDeleteRows() {
        return this._willDeletedRows;
    }

    /**
     * Add a new line into the CSV file
     * @param {any} table table name of the property
     */
    addRow( table ) {
        this._row.push( { _table: table === undefined || table === null ? null : table } );
        this._rowCount++;
        this._rowNumber++;
    }

    /**
     * Add a list of headers attached to the table on depends on the content of the record
     * @param {any} table  columns for a given table
     * @param {any} record record containing the columns
     */
    addHeaderRecord( table, record ) {
        let addTableName = this._tablesByOrder.length > 1;

        // Add attributes

        for ( let attr in record ) {
            if ( attr.startsWith( "_" ) || attr === "Id" )
                continue;

            let ignore = attr === "CustomerId" || attr.startsWith( "Copy" );
            if ( !ignore && record._list !== null && record._list !== undefined && record._list.column === attr )
                ignore = true;

            table[attr] = { table: table._table, attribut: attr, label: ( addTableName ? ( table._table + "." ) : "" ) + attr, list: table._list, ignore: ignore };
            this._headers.push( table[attr] );
        }

        // Add sub lists

        if ( record._subLists === null || record._subLists === undefined )
            return;

        for ( let subListId in record._subLists ) {
            let subList = record._subLists[subListId];
            if ( subList === null || subList === undefined || !subList.composition )
                continue;

            table[subListId] = { table: table._table, attribut: subListId, label: ( addTableName ? ( table._table + "." ) : "" ) + subListId, list: table._list, ignore: false };
            this._headers.push( table[subListId] );
        }
    }

    /**
     * Add a list of headers
     * @param {any} table table name of the property
     * @param {any} list reference on the list ot use to show a column
     */
    writeHeaderFromList( table, list ) {
        if ( list === null || list === undefined )
            return;

        let currentTable = { _table: table, _list: list === null || list === undefined ? null : list };
        this._tablesByName[table] = currentTable;
        this._tablesByOrder.push( currentTable );

        // Add headers of the main record

        this.addHeaderRecord( currentTable, list.NewItem );
    }

    /**
     * Add a new value into the CSV file
     * @param {any} table table name of the property
     * @param {any} record record to show into the csv file
     * @param {any} list reference on the list ot use to show a column
     */
    writeRecordFromList( table, record, list ) {
        if ( record === null || record === undefined )
            return;

        this._row[this._rowCount - 1][table] = record === null || record === undefined ? null : record;

        let currentTable = this._tablesByName[table];
        if ( currentTable !== undefined ) {
            for ( let attr in record ) {
                if ( currentTable[attr] === null || currentTable[attr] === undefined || currentTable[attr].ignore )
                    continue;

                /* TODO: Handle export into CSV an attached file ?
                if ( typeof record[attr] === "string" && record[attr].startsWith( "data:image/" ) )
                    currentTable[attr].ignore = true; */
            }

            return;
        }

        if ( ( list === null || list === undefined ) && record._list !== undefined && record._list !== null )
            list = record._list;

        currentTable = { _table: table, _list: list === null || list === undefined ? null : list };
        this._tablesByName[table] = currentTable;
        this._tablesByOrder.push( currentTable );

        // Add headers of the current record

        this.addHeaderRecord( currentTable, record );
    }

    /**
     * Add the content of a list and its sublists into the csv file
     * @param {any} list list to add into the csv file
     * @param {any} withAssociation clone also all sublists (composition or not)
     * @param {Function} fnProgress function to call to notify the progression of the building CSV
     */
    writeFromList( list, withAssociation, fnProgress ) {
        if ( list === null || list === undefined )
            return;

        withAssociation = withAssociation !== null && withAssociation !== undefined && withAssociation === true;

        function handleRead( csv, list, headers ) {
            return function ( record ) {
                csv.addRow( list.Table );
                for ( let id in headers )
                    csv.writeRecordFromList( headers[id].list.Table, headers[id].record, headers[id].list );
                csv.writeRecordFromList( list.Table, record, list );

                if ( record._subLists === null || record._subLists === undefined )
                    return;

                headers.push( { list: list, record: record } );

                for ( let subListId in record._subLists ) {
                    let subList = record._subLists[subListId];
                    if ( subList === null || subList === undefined || !subList.composition && !withAssociation )
                        continue;

                    let listToAdd = record[subListId];
                    for ( let id in listToAdd )
                        handleRead( csv, subList.list, headers )( listToAdd[id] );
                }

                headers.pop();
            };
        }

        this._row = [];
        this._rowCount = 0;
        this._rowNumber = 0;

        this.writeHeaderFromList( list.Table, list );
        list.each( handleRead( this, list, [] ) );
    }

    /**
     * Convert the CSV data into a file
     * @param {Array} headers list of headers to add into the CSV file (null or undefined, set the default column)
     * @param {Function} fnProgress function to call to notify the progression of the building CSV
     * @returns {Blob} a blob describing the CSV file to download
     */
    toBlob( headers, fnProgress ) {
        let i = 0;
        let j = 0;
        let k = 0;
        let l = 0;
        let matrix = [];
        let previousRow = null;
        let currentRow = [];
        let file = "";

        this.info( "Building CSV file ..." );

        // Header

        if ( !Array.isArray(headers) ) {
            for ( i = 0; i < this._headers.length; i++ )
                if ( !this._headers[i].ignore )
                    currentRow.push( this._headers[i].label );
        } else {
            for ( i = 0; i < this._headers.length; i++ ) {
                let exist = false;

                if ( this._headers[i].ignore )
                    continue;

                for ( j = 0; j < headers.length && !exist; j++ ) {
                    if ( headers[j] === this._headers[i].label ) {
                        exist = true;
                    } else if ( Array.isArray( headers[j] ) && headers[j][0] === this._headers[i].label ) {
                        exist = true;
                        if ( typeof headers[j][1] === 'string' )
                            this._headers[i].label = headers[j][1];
                    }
                }

                this._headers[i].ignore = !exist;

                if ( exist )
                    currentRow.push( this._headers[i].label );
            }
        }

        matrix.push( currentRow );

        // Data

        if ( fnProgress )
            fnProgress( 0, 2 * this._row.length );

        for ( i = 0, k = 1; i < this._row.length; i++ ) {
            let sameRow = true;
            let line = this._row[i];

            previousRow = currentRow;
            currentRow = [];
            for ( j = 0, l = 0; j < this._headers.length; j++ ) {
                let header = this._headers[j];
                if ( header.ignore )
                    continue;

                if ( header.table === null && header.attribut === "line" ) {
                    currentRow.push( k );
                    l++;
                    continue;
                }

                if ( header.table === null && header.attribut === "table" ) {
                    currentRow.push( line._table );
                    l++;
                    continue;
                }

                if ( header === null || header === undefined ) {
                    if ( previousRow[l] !== null && previousRow[l] !== undefined )
                        sameRow = false;

                    currentRow.push( null );
                    l++;
                    continue;
                }

                let record = line[header.table];

                if ( record === null || record === undefined ) {
                    if ( previousRow[l] !== null && previousRow[l] !== undefined )
                        sameRow = false;

                    currentRow.push( null );
                    l++;
                    continue;
                }

                let value = null;

                if ( header.list === null )
                    value = record[header.attribut];
                else
                    value = header.list.getAttributCSV( record, header.attribut );

                if ( previousRow[l] !== value )
                    sameRow = false;

                currentRow.push( value );
                l++;
            }

            // Add the line if the current line is different than the previous one

            if ( !sameRow ) {
                matrix.push( currentRow );
                k++;
            }

            if ( fnProgress )
                fnProgress();
        }

        if ( fnProgress )
            fnProgress( this._row.length, this._row.length + matrix.length);

        // Convert matrix to string

        file = this._charset.toLowerCase() === "utf-8" ? "\ufeff" : "";
        for ( i = 0; i < matrix.length; i++ ) {
            currentRow = matrix[i];

            for ( j = 0; j < currentRow.length; j++ ) {
                file += String.convertCSV( currentRow[j], this._separator );

                if ( j < currentRow.length - 1 )
                    file += this._separator;
            }

            file += "\n";

            if ( fnProgress )
                fnProgress();
        }

        this.info( "CSV file built" );

        return new Blob( [file], { encoding: this.Charset, type: 'text/csv;charset=' + this.Charset } )
    }

    /**
     * Convert the CSV data into a file (using generator function)
     * @param {List.List} list list of items to export
     * @param {Array} headers list of headers to add into the CSV file (null or undefined, set the default column)
     * @yield {any} status of a progress bar
     */
    *toBlobFromList( list, headers ) {
        this._blob = null;

        this.info( "Building CSV file from a list ..." );
        yield GUI.Box.Progress.Status( 0, 1, Helper.Label( "MSG_EXPORT_WRITING", this.Name ) );

        // Getting the list of items

        let items = list.getList();

        // Progress bar

        this.info( "Exporting " + items.length + " lines into the CSV file ..." );
        yield GUI.Box.Progress.Status( 0, items.length + 1 );

        // Build the blob content

        let file = this._charset.toLowerCase() === "utf-8" ? "\ufeff" : "";

        // Set the header file

        let firstHeader = false;
        for ( let header of headers ) {
            if ( firstHeader )
                file += this._separator;
            firstHeader = true;

            if ( Array.isArray( header ) ) {
                file += String.convertCSV( header[1], this._separator );
            } else {
                file += String.convertCSV( header, this._separator );
            }
        }
        file += "\n";

        yield GUI.Box.Progress.Status();

        // Set data into the CSV file

        for ( let item of Array.toIterable( items ) ) {
            let firstHeader = false;

            for ( let header of headers ) {
                let attribute = Array.isArray( header ) ? header[0] : header;

                if ( firstHeader )
                    file += this._separator;
                firstHeader = true;

                file += String.convertCSV( list.getAttributCSV( item, attribute ), this._separator );
            }

            file += "\n";

            yield GUI.Box.Progress.Status();
        }

        this.info( "CSV file built" );

        this._blob = new Blob( [file], { encoding: this.Charset, type: 'text/csv;charset=' + this.Charset } )
    }

    /**
     * Retrieve the last blob generated
     */
    get Blob() {
        return this._blob;
    }

    /**
     * Check if the filename is in the list of files of csv
     * @param {string} filename name of the csv file concerned by this header
     */
    hasFile( filename ) {
        for ( let file of this._files ) {
            if ( file.name === filename )
                return true;
        }

        return false;
    }

    /**
     * Check if the name is the name of a header of the CSV file
     * @param {string} name name of the header to check
     * @param {string} filename name of the csv file concerned by this header
     */
    hasHeader( name, filename ) {
        if ( this._files.length === 0 )
            return false;

        if ( filename === null || filename === undefined )
            return this._files[0].headersByName[name] !== undefined;

        for ( let file of this._files ) {
            if ( file.name !== filename )
                continue;

            return file.headersByName[name] !== undefined;
        }

        return false;
    }

    /**
     * Execute a function on each row into the CSV file
     * @param {List.List} list list referencing the target content of the CSV file
     * @param {Errors} errors function to call to notify the progression of the parsing CSV
     * @param {any} labelPreloading label to write on preloading the content
     * @param {any} labelChecking label to write on checking the content
     * @param {any} labelImporting label to write on importing the content
     * @param {any} labelDeleting label to write on importing the content
     * @param {boolean} checking true if the checking part must be done
     * @param {boolean} importing true if the importing part must be done
     * @param {boolean} deleting true if the data to delete must be deleted
     * @param {array} files list of files to load after the main file (complete data within others files)
     * @yield {any} status of a progress bar
     */
    *toList( list, errors, labelPreloading, labelChecking, labelImporting, labelDeleting, checking, importing, deleting, files ) {
        let firstName = this._name;
        let rowCountTotal = 0;
        let columnsByOrder = [], columnsByName = {};

        // Initialize the loading csv files

        this._row = [];
        this._rowCount = 0;
        this._rowNumber = 0;

        checking = checking === null || checking === undefined || checking === true;
        importing = importing === null || importing === undefined || importing === true;
        deleting = deleting !== null && deleting !== undefined && deleting === true;

        this._willDeletedRows = deleting;

        if ( checking ) {
            this._rowAdded = 0;
            this._rowUpdated = 0;
            this._rowDeleted = 0;
        }

        // Build the list of contents into csv files

        this._files = [{
            name: this._name,
            content: this._content,
            startIndex: 0,
            size: 0,
            firstRow: 0,
            headers: [],
            headersByName: {},
            rowCount: 0
        }];
        if ( files !== null && files !== undefined && Array.isArray( files ) && files.length > 0 ) {
            for ( let file of Array.toIterable( files ) )
                this._files.push( {
                    name: file.name,
                    content: file.csv === null || file.csv === undefined || String.isEmptyOrWhiteSpaces( file.csv._content ) ? "" : file.csv._content,
                    startIndex: 0,
                    size: 0,
                    firstRow: 0,
                    headers: [],
                    headersByName: {},
                    rowCount: 0
                } );
        }

        try {
            // Step 1 - Read the headers into the CSV files and check if headers are corrects

            yield GUI.Box.Progress.Status( 0, this._files.length, labelPreloading );

            for ( let file of this._files ) {
                this._name = file.name;

                // Initialize the reading of the CSV file

                if ( String.isEmptyOrWhiteSpaces( file.content ) ) {
                    errors.addGlobal( "ERR_CSV_FILE_MISSING", [file.name] );
                    continue;
                }

                // Step 1 - Read the header into the CSV file

                file.size = file.content.length;

                // Has the file UTF-8 format ?

                file.startIndex = 0;
                if ( file.content[0] === "\ufeff" )
                    file.startIndex++;
                if ( file.content.length > 2 && file.content[0].charCodeAt() === 239 && file.content[1].charCodeAt() === 187 && file.content[2].charCodeAt() === 191 )
                    file.startIndex += 3;

                let i, j = 0, openBracelet = false;
                for ( i = file.startIndex; i < file.size && file.content[i] !== '\n' && file.content[i] !== '\r'; i++ ) {
                    let c = file.content[i];

                    if ( c === '"' ) {
                        openBracelet = !openBracelet;
                    } else if ( c === '\\' ) {
                        if ( i < file.size )
                            i++;
                    } else if ( c === this._separator && !openBracelet ) {
                        // read the header name

                        let headerName = String.cleanupCSV( file.content.substring( file.startIndex, i ) );

                        // check if the header is unique

                        if ( file.headersByName[headerName] !== undefined )
                            errors.addGlobal( "ERR_CSV_HEADERDOUBLE", [headerName, j, file.name] );

                        file.headers.push( headerName );
                        file.headersByName[headerName] = j;
                        file.startIndex = i + 1;
                        j++;
                    }
                }

                // if the end of line is not reached ...

                let headerName = String.cleanupCSV( file.content.substring( file.startIndex, i ) );

                // check if the header is unique

                if ( file.headersByName[headerName] !== undefined )
                    errors.addGlobal( "ERR_CSV_HEADERDOUBLE", [headerName, j, file.name] );

                file.headers.push( headerName );
                file.headersByName[headerName] = j;

                // Goto the first line

                for ( ; i <= file.size && ( file.content[i] === '\n' || file.content[i] === '\r' || file.content[i] === undefined ); i++ ) {
                    if ( file.content[i] === '\n' )
                        file.firstRow++;
                }

                file.startIndex = i;
                file.rowCount = file.content.count( '\n' );
                rowCountTotal += file.rowCount - file.firstRow;

                yield GUI.Box.Progress.Status();
            }

            if ( errors.HasError ) {
                this._files = [];
                return null;
            }

            // Start the reading CSV file

            this._name = firstName;

            if ( !list.startCSV( this, errors ) ) {
                if ( !errors.HasError )
                    errors.addGlobal( "CSV_ABORTED" );
                this._files = [];
                return null;
            }

            // Step 2 - Preloading files only if several files must be read

            if ( Array.isArray( files ) ) {
                yield GUI.Box.Progress.Status( 0, rowCountTotal);

                let stopReading = false;

                for ( let file of this._files ) {
                    // Set the current file

                    this._name = file.name;
                    this._rowNumber = file.firstRow;
                    this._rowCount = file.rowCount;
                    columnsByOrder = [];
                    columnsByName = {};

                    if ( !list.startPreloadingCSV( this, errors ) ) {
                        stopReading = true;
                        break;
                    }

                    // Parse the csv file and preload each line

                    let errorLine = new Errors();
                    let startIndex = file.startIndex;
                    for ( let i = startIndex, j = 0, openBracelet = false; i <= file.size && !stopReading; i++ ) {
                        let c = i === file.size ? '\n' : file.content[i];

                        if ( c === '"' ) {
                            openBracelet = !openBracelet;
                        } else if ( c === '\\' ) {
                            i++;
                        } else if ( c === this._separator && !openBracelet ) {
                            // read the current value

                            let value = String.cleanupCSV( file.content.substring( startIndex, i ) );

                            columnsByOrder[j] = value;
                            columnsByName[file.headers[j]] = value;
                            j++;

                            startIndex = i + 1;
                        } else if ( c === '\n' || c === '\r' ) {
                            // read the last value

                            let value = String.cleanupCSV( file.content.substring( startIndex, i ) );

                            columnsByOrder[j] = value;
                            columnsByName[file.headers[j]] = value;
                            j++;

                            // go to the next line (not empty)

                            for ( ; i < file.size && ( file.content[i] === '\n' || file.content[i] === '\r' ); i++ ) {
                                if ( file.content[i] === '\n' ) {
                                    this._rowNumber++;

                                    yield GUI.Box.Progress.Status();
                                }
                            }
                            startIndex = i;
                            if ( i < file.size ) i--;

                            // preload the line

                            if ( j !== file.headers.length ) {
                                errorLine.addGlobal( "ERR_CSV_COLUMN_MISSING", [j, file.headers.length] );
                            } else if ( !list.preloadRecordFromCSV( this, columnsByOrder, columnsByName, errorLine ) ) {
                                stopReading = true;
                            }

                            if ( errorLine.HasFatal )
                                stopReading = true;

                            if ( errorLine.HasError ) {
                                errors.addError( Language.Manager.Instance.interpolation( "ERR_LINE", [file.name, this.RowCurrent] ), errorLine );
                                errorLine = new Errors();
                            }

                            // start a new line

                            j = 0;
                            openBracelet = false;
                        }
                    }

                    stopReading = !list.endPreloadingCSV( this, errors ) || stopReading;
                    if ( stopReading && !errors.HasError )
                        errors.addGlobal( "CSV_ABORTED" );

                    if ( stopReading )
                        break;
                }

                if ( errors.HasError ) {
                    this._name = firstName;
                    list.endCSV( this, errors );
                    this._files = [];
                    return null;
                }
            }

            // Step 3 - Parse the CSV file and check if data are correct (only for the main file ... preloading file must have compose all files)

            this._name = firstName;
            columnsByOrder = [];
            columnsByName = {};

            if ( checking ) {
                let file = this._files[0];

                this._rowNumber = file.firstRow;
                this._rowCount = file.rowCount;

                yield GUI.Box.Progress.Status( this.RowCurrent, this.RowCount, labelChecking );

                if ( !list.startCheckingCSV( this, errors ) ) {
                    list.endCSV( this, errors );
                    if ( !errors.HasError )
                        errors.addGlobal( "CSV_ABORTED" );
                    this._files = [];
                    return null;
                }

                // Parse the csv file and check each line

                let stopReading = false;
                let errorLine = new Errors();
                let startIndex = file.startIndex;

                for ( let i = startIndex, j = 0, openBracelet = false; i <= file.size && !stopReading; i++ ) {
                    let c = i === file.size ? '\n' : file.content[i];

                    if ( c === '"' ) {
                        openBracelet = !openBracelet;
                    } else if ( c === '\\' ) {
                        i++;
                    } else if ( c === this._separator && !openBracelet ) {
                        // read the current value

                        let value = String.cleanupCSV( file.content.substring( startIndex, i ) );

                        columnsByOrder[j] = value;
                        columnsByName[file.headers[j]] = value;
                        j++;

                        startIndex = i + 1;
                    } else if ( c === '\n' || c === '\r' ) {
                        // read the last value

                        let value = String.cleanupCSV( file.content.substring( startIndex, i ) );

                        columnsByOrder[j] = value;
                        columnsByName[file.headers[j]] = value;
                        j++;

                        // go to the next line (not empty)

                        for ( ; i < file.size && ( file.content[i] === '\n' || file.content[i] === '\r' ); i++ ) {
                            if ( file.content[i] === '\n' ) {
                                this._rowNumber++;

                                yield GUI.Box.Progress.Status();
                            }
                        }
                        startIndex = i;
                        if ( i < file.size ) i--;

                        // check if the line is completed and check the content of the line

                        if ( j !== file.headers.length ) {
                            errorLine.addGlobal( "ERR_CSV_COLUMN_MISSING", [j, file.headers.length] );
                        } else if ( !list.checkRecordFromCSV( this, columnsByOrder, columnsByName, errorLine ) ) {
                            stopReading = true;
                        }

                        // Retrieve the record and add or update data into the table

                        if ( !stopReading && !errorLine.HasError ) {
                            let record = list.getRecordFromCSV( this, columnsByOrder, columnsByName, errorLine );

                            if ( record !== null && !errorLine.HasError ) {
                                if ( record.oldItem === null && record.newItem !== null ) {
                                    // Add a new line into the database
                                    this._rowAdded++;
                                } else if ( record.oldItem !== null && record.newItem !== null ) {
                                    // Update an existing line into the database only if they are different
                                    if ( !DSRecord.IsEqual( record.oldItem, record.newItem ) )
                                        this._rowUpdated++;
                                }
                            }
                        }

                        if ( errorLine.HasFatal )
                            stopReading = true;

                        if ( errorLine.HasError ) {
                            errors.addError( Language.Manager.Instance.interpolation( "ERR_LINE", [file.name, this.RowCurrent] ), errorLine );
                            errorLine = new Errors();
                        }

                        // start a new line

                        j = 0;
                        openBracelet = false;
                    }
                }

                stopReading = !list.endCheckingCSV( this, errors ) || stopReading;
                if ( stopReading && !errors.HasError )
                    errors.addGlobal( "CSV_ABORTED" );

                if ( errors.HasError ) {
                    list.endCSV( this, errors );
                    this._files = [];
                    return null;
                }

                this._rowDeleted = list.getRowToDeleteCSV( this );
            }

            // Step 3 - update data into the list or in the database

            if ( importing ) {
                let file = this._files[0];

                this._rowNumber = file.firstRow;
                this._rowCount = file.rowCount;

                yield GUI.Box.Progress.Status( this.RowCurrent, this.RowCount, labelImporting );

                if ( !list.startImportingCSV( this, errors ) ) {
                    list.endCSV( this, errors );
                    if ( !errors.HasError )
                        errors.addGlobal( "CSV_ABORTED" );
                    this._files = [];
                    return null;
                }

                // Parse the csv file and update each line

                this._rowAdded = 0;
                this._rowUpdated = 0;
                this._rowDeleted = 0;

                let stopReading = false;
                let errorLine = new Errors();
                let startIndex = file.startIndex;

                for ( let i = startIndex, j = 0, openBracelet = false; i <= file.size && !stopReading; i++ ) {
                    let c = i === file.size ? '\n' : file.content[i];

                    if ( c === '"' ) {
                        openBracelet = !openBracelet;
                    } else if ( c === '\\' ) {
                        i++;
                    } else if ( c === this._separator && !openBracelet ) {
                        // read the current value

                        let value = String.cleanupCSV( file.content.substring( startIndex, i ) );

                        columnsByOrder[j] = value;
                        columnsByName[file.headers[j]] = value;
                        j++;

                        startIndex = i + 1;
                    } else if ( c === '\n' || c === '\r' ) {
                        // read the last value

                        let value = String.cleanupCSV( file.content.substring( startIndex, i ) );

                        columnsByOrder[j] = value;
                        columnsByName[file.headers[j]] = value;
                        j++;

                        // go to the next line (not empty)

                        for ( ; i < file.size && ( file.content[i] === '\n' || file.content[i] === '\r' ); i++ ) {
                            if ( file.content[i] === '\n' ) {
                                this._rowNumber++;

                                yield GUI.Box.Progress.Status();
                            }
                        }
                        startIndex = i;
                        if ( i < file.size ) i--;

                        // Update the record and add or update data into the table

                        let record = list.getRecordFromCSV( this, columnsByOrder, columnsByName, errorLine );

                        if ( record !== null && !errorLine.HasError ) {
                            if ( record.oldItem === null && record.newItem !== null ) {
                                // Add a new line into the database
                                list.addItemCSV( this, record.newItem, errorLine, true, true );
                                this._rowAdded++;
                            } else if ( record.oldItem !== null && record.newItem !== null ) {
                                // Update an existing line into the database only if they are different
                                if ( !DSRecord.IsEqual( record.oldItem, record.newItem ) ) {
                                    list.updateItemCSV( this, list.getId( record.oldItem ), record.oldItem, record.newItem, errorLine, true, true );
                                    this._rowUpdated++;
                                }
                            }
                        }

                        if ( errorLine.HasFatal )
                            stopReading = true;

                        if ( errorLine.HasError ) {
                            errors.addError( Language.Manager.Instance.interpolation( "ERR_LINE", [file.name, this.RowCurrent] ), errorLine );
                            errorLine = new Errors();
                        }

                        // start a new line

                        j = 0;
                        openBracelet = false;
                    }
                }

                // Step 4 - Deleting all lines to delete

                if ( deleting && !stopReading && !errors.HasError ) {
                    // Getting the list of records to delete

                    yield GUI.Box.Progress.Status( 0, 1, labelDeleting );
                    let itemsToDelete = list.getItemsToDeleteCSV( this, errors );
                    yield GUI.Box.Progress.Status();

                    // Delete records

                    if ( !errors.HasError && itemsToDelete.length > 0 ) {
                        yield GUI.Box.Progress.Status( 0, itemsToDelete.length, labelDeleting );
                        for ( let i = 0; i < itemsToDelete.length; i++ ) {
                            let record = itemsToDelete[i];
                            list.deleteItemCSV( this, list.getId( record ), record, errors, false );
                            if ( errors.HasFatal )
                                break;
                            yield GUI.Box.Progress.Status();
                        }
                    }

                    if ( errors.HasError )
                        stopReading = true;
                }

                // Step 5 - Updating all temporary keys

                if ( !stopReading && !errors.HasError ) {
                    // Getting the list of records to update

                    yield GUI.Box.Progress.Status( 0, 1, labelImporting );
                    let itemsToUpdate = list.getItemsToPostUpdateCSV( this, errors );
                    yield GUI.Box.Progress.Status();

                    // Update records

                    if ( !errors.HasError && itemsToUpdate.length > 0 ) {
                        yield GUI.Box.Progress.Status( 0, itemsToUpdate.length, labelImporting );
                        for ( let i = 0; i < itemsToUpdate.length; i++ ) {
                            let oldRecord = itemsToUpdate[i][0];
                            let newRecord = itemsToUpdate[i][1];

                            list.updateItemCSV( this, list.getId( oldRecord ), oldRecord, newRecord, errors, true, true );
                            if ( errors.HasFatal )
                                break;

                            yield GUI.Box.Progress.Status();
                        }
                    }

                    if ( errors.HasError )
                        stopReading = true;
                }

                // Close the importing data

                stopReading = !list.endImportingCSV( this, errors ) || stopReading;
                if ( stopReading && !errors.HasError )
                    errors.addGlobal( "CSV_ABORTED" );

                if ( errors.HasError ) {
                    list.endCSV( this, errors );
                    this._files = [];
                    return null;
                }

                this._rowDeleted = list.getRowToDeleteCSV( this );
            }

            if ( !deleting )
                this._rowNumber = 0;

            list.endCSV( this, errors );
        } catch ( e ) {
            errors.addFatal( "ERR_CSV_UNEXPECTED", this.Name );
            this.exception( "Unable to load data due to an unexpected error", e );
        }

        this._name = firstName;
        this._files = [];
        return null;
    }

    /**
     * Duplicate the content of the CSV file
     * @param {any} name name of the CSV component
     */
    copy( name ) {
        return new CSV( name, this, this._separator, this._charset );
    }

    /**
     * Constructor
     * @param {string} name name of the CSV component
     * @param {any} content content to decode as a CSV file (or a CSV instance)
     * @param {string} separator string describing the separator between 2 columns
     * @param {string} charset string describing the charset of the target file
     */
    constructor( name, content, separator, charset ) {
        super( "CSV" + ( name ? ( "." + name ) : "" ) );

        this._name = String.isEmptyOrWhiteSpaces( name ) ? "" : name;
        if ( content instanceof CSV )
            this._content = content._content;
        else
            this._content = ( String.isEmptyOrWhiteSpaces( content ) && !( typeof content === 'string' ) ) ? null : content;
        this._charset = String.isEmptyOrWhiteSpaces( charset ) ? "utf-8" : charset;
        this._separator = String.isEmptyOrWhiteSpaces( separator ) ? ";" : separator;

        this._blob = null;

        this._row = [];
        this._rowCount = 0;
        this._rowNumber = 0;
        this._rowAdded = 0;
        this._rowUpdated = 0;
        this._rowDeleted = 0;
        this._willDeletedRows = false;

        this._tablesByOrder = [];
        this._tablesByName = {};

        this._headers = [];
        this._headers.push( { table: null, attribut: "line", label: "line", list: null, ignore: false } );
        this._headers.push( { table: null, attribut: "table", label: "table", list: null, ignore: false } );

        this._files = [];
    }
}