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

class CSV extends LoggerBaseObject {
    /**
     * @returns {any} list of headers into the csv file
     */
    get Headers() {
        return this._headers;
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
     * Add a new line into the CSV file
     * @param {any} table table name of the property
     */
    addLine( table ) {
        this._lines.push( { _table: table === undefined || table === null ? null : table } );
        this._lineNumber++;
    }

    /**
     * Add a new value into the CSV file
     * @param {any} table table name of the property
     * @param {any} record record to show into the csv file
     * @param {any} list reference on the list ot use to show a column
     */
    addRecord( table, record, list ) {
        if ( record === null || record === undefined )
            return;

        this._lines[this._lineNumber - 1][table] = record === null || record === undefined ? null : record;

        let currentTable = this._tablesByName[table];
        if ( currentTable !== undefined ) {
            for ( let attr in record ) {
                if ( attr.startsWith( "_" ) || currentTable[attr].ignore )
                    continue;

                if ( typeof record[attr] === "string" && record[attr].startsWith( "data:image/" ) )
                    currentTable[attr].ignore = true;
            }

            return;
        }

        if ( ( list === null || list === undefined ) && record._list !== undefined && record._list !== null )
            list = record._list;

        currentTable = { _table: table, _list: list === null || list === undefined ? null : list };
        this._tablesByName[table] = currentTable;
        this._tablesByOrder.push( currentTable );

        let attr = null;
        for ( attr in record ) {
            if ( attr !== "Id" )
                continue;

            currentTable[attr] = { table: table, attribut: attr, label: table + "." + attr, list: currentTable._list, ignore: false };
            this._headers.push( currentTable[attr] );
        }

        for ( attr in record ) {
            if ( attr.startsWith( "_" ) || attr === "Id" )
                continue;

            let ignore = attr === "CustomerId" || attr.startsWith( "Copy" );
            if ( !ignore && record._list !== null && record._list !== undefined && record._list.column === attr )
                ignore = true;

            currentTable[attr] = { table: table, attribut: attr, label: table + "." + attr, list: currentTable._list, ignore: ignore };
            this._headers.push( currentTable[attr] );
        }
    }

    /**
     * Add the content of a list and its sublists into the csv file
     * @param {any} list list to add into the csv file
     * @param {any} withAssociation clone also all sublists (composition or not)
     */
    addList( list, withAssociation ) {
        if ( list === null || list === undefined )
            return;

        withAssociation = withAssociation !== null && withAssociation !== undefined && withAssociation === true;

        function handleRead( csv, list, headers ) {
            return function ( record ) {
                csv.addLine( list.Table );
                for ( let id in headers )
                    csv.addRecord( headers[id].list.Table, headers[id].record, headers[id].list );
                csv.addRecord( list.Table, record, list );

                if ( record._subLists === null || record._subLists === undefined )
                    return;

                headers.push( { list: list, record: record } );

                for ( var subListId in record._subLists ) {
                    var subList = record._subLists[subListId];
                    if ( subList === null || subList === undefined || !subList.composition && !withAssociation )
                        continue;

                    let listToAdd = record[subListId];
                    for ( let id in listToAdd )
                        handleRead( csv, subList.list, headers )( listToAdd[id] );
                }

                headers.pop();
            };
        }

        list.each( handleRead( this, list, [] ) );
    }

    /**
     * Convert the CSV data into a file
     * @param {any} charset charset of the file
     * @param {any} separator separator betwen columns
     * @returns {any} a blob describing the CSV file to download
     */
    toBlob( charset, separator ) {
        let i = 0;
        let j = 0;
        let matrix = [];
        let currentRow = [];
        let file = "";

        this.info( "Building CSV file ..." );

        this._charset = charset;
        if ( String.isEmptyOrWhiteSpaces( this._charset ) )
            this._charset = "utf-8";

        this._separator = separator;
        if ( String.isEmptyOrWhiteSpaces( this._separator ) )
            this._separator = ";";

        // Header

        for ( i = 0; i < this._headers.length; i++ )
            if ( !this._headers[i].ignore )
                currentRow.push( this._headers[i].label );

        matrix.push( currentRow );

        // Data

        for ( i = 0; i < this._lines.length; i++ ) {
            let line = this._lines[i];

            currentRow = [];
            for ( j = 0; j < this._headers.length; j++ ) {
                let header = this._headers[j];
                if ( header.ignore )
                    continue;

                if ( header.table === null && header.attribut === "line" ) {
                    currentRow.push( i + 1 );
                    continue;
                }

                if ( header.table === null && header.attribut === "table" ) {
                    currentRow.push( line._table );
                    continue;
                }

                if ( header === null || header === undefined ) {
                    currentRow.push( null );
                    continue;
                }

                let record = line[header.table];

                if ( record === null || record === undefined ) {
                    currentRow.push( null );
                    continue;
                }

                let value = null;

                if ( header.list === null )
                    value = record[header.attribut];
                else
                    value = header.list.getAttributText( record, header.attribut );

                currentRow.push( value );
            }

            matrix.push( currentRow );
        }

        // Convert matrix to string

        file = this._charset.toLowerCase() === "iso-8859-15" ? "\ufeff" : "";
        for ( i = 0; i < matrix.length; i++ ) {
            currentRow = matrix[i];

            for ( j = 0; j < currentRow.length; j++ ) {
                file += String.convertCSV( currentRow[j], this._separator );

                if ( j < currentRow.length - 1 )
                    file += this._separator;
            }

            file += "\n";
        }

        this.info( "CSV file built" );

        return [file];
    }

    /**
     * Constructor
     */
    constructor() {
        super( "CSV" );

        this._charset = "utf-8";
        this._separator = ";";

        this._lineNumber = 0;
        this._lines = [];

        this._tablesByOrder = [];
        this._tablesByName = {};

        this._headers = [];
        this._headers.push( { table: null, attribut: "line", label: "line", list: null, ignore: false } );
        this._headers.push( { table: null, attribut: "table", label: "table", list: null, ignore: false } );
    }
}