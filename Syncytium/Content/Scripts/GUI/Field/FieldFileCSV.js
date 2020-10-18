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
 * Define an object having the ability to download a CSV file
 */
GUI.Field.FieldFileCSV = class extends GUI.Field.FieldFile {
    /**
     * Retieve the charset expected for the file to load
     */
    get Charset() {
        return this._charset === null ? DSDatabase.Instance.Parameters["CSV.Charset"] : this._charset;
    }

    /**
     * @param {string} charset charset to set
     */
    set Charset( charset ) {
        this._charset = String.isEmptyOrWhiteSpaces( charset ) ? null : charset;
    }

    /**
     * Retieve the separator expected for the file to load
     */
    get Separator() {
        return this._separator === null ? DSDatabase.Instance.Parameters["CSV.Separator"] : this._separator;
    }

    /**
     * @param {string} separator separator to set
     */
    set Separator( separator ) {
        this._separator = String.isEmptyOrWhiteSpaces( separator ) ? null : separator;
    }

    /**
     * Set a content of file loaded (overwrite this function if you have some treatment to do)
     * @param {string} content new content of the file loaded
     */
    set File( content ) {
        // clean up the content ?

        if ( String.isEmptyOrWhiteSpaces( content ) ) {
            super.File = null;
            return;
        }

        // Is the content valid ?

        if ( !content.startsWith( "data:" ) || !content.includes( "base64,") ) {
            super.File = null;
            return;
        }

        // Convert the content of file into a UTF-8 stream text

        GUI.Box.Progress.SetStatus( 1, 2 );
        try {
            super.File = new CSV( this.Name,
                this.Charset.toLowerCase() === "utf-8" ? String.base64DecodeUnicode( content.substring( content.indexOf( "base64," ) + 7 ) ) : atob( content.substring( content.indexOf( "base64," ) + 7 ) ),
                this.Separator,
                this.Charset.toLowerCase() );
        } catch ( e ) {
            this.exception( "Exception on reading CSV file", e );
            this.Error = "ERR_CSV_BADFORMATED_FILE";
            super.File = null;
        }
        GUI.Box.Progress.SetStatus( 2, 3 );
    }

    /**
     * @returns {CSV} the content of the CSV file
     */
    get File() {
        return super.File;
    }

    /**
     * Constructor
     * @param {any} box    reference on the box containing the component (inheritance of the readonly and visible flag)
     * @param {any} name   name of the component
     * @param {any} label  multilingual label of the field
     */
    constructor( box, name, label ) {
        super( box, name, label, "field_file_csv", ".csv" );

        this._charset = null;
        this._separator = null;
    }
};
