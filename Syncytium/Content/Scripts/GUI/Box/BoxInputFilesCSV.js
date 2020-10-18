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
 * Define a box to select a file and to upload it into the server
 */
GUI.Box.BoxInputFilesCSV = class extends GUI.Box.Box {
    /**
     * @returns {any} The list of files
     */
    get Value() {
        let value = [];

        for ( let item of this._value ) {
            if ( item.value === null || item.field === null || item.field.File === null ) {
                item.value["csv"] = null;
            } else if ( item.field.File !== null ) {
                item.value["csv"] = item.field.File.copy( item.value.name );
            }

            value.push( item.value );
        }

        return value;
    }

    /**
     * Set files data
     */
    set Value( value ) {
        this._value = [];

        // Set label and clean up every files

        for ( let i = 1; i <= this._nbFiles; i++ ) {
            let fieldId = "file_" + i;
            let field = this._fields[fieldId];

            if ( field === null || field === undefined ) {
                this._value.push( { value: null, field: null } );
                continue;
            }

            field.Label = null;
            field.Error = null;
            field.File = null;
            field.Message = null;

            // Retrieve the item attached to the value

            let item = null;
            if ( value !== null && value !== undefined )
                item = value[i - 1];

            if ( item === null || item === undefined ) {
                this._value.push( { value: null, field: null } );
                continue;
            }

            field.Label = item.label;
            field.Charset = item.charset;
            field.Separator = item.separator;
            this._value.push( { value:item, field: field } );
        }

        this.refresh();
    }

    /**
     * Define the list of buttons of the dialog box
     * @param {any} container zone having the list of buttons
     */
    drawButton ( container ) {
        super.drawButton( container );

        this.declareButton( GUI.Box.Box.BUTTON_OK );
        this.declareButton( GUI.Box.Box.BUTTON_CANCEL, "BTN_CANCEL" );
    }

    /**
     * Draw and show the content of the dialog box
     * @param {any} container zone having the content
     */
    drawContent( container ) {
        super.drawContent( container );

        for ( let i = 1; i <= this._nbFiles; i++ )
            this.declareField( new GUI.Field.FieldFileCSV( this, "file_" + i, null ) );

        container.show();
    }

    /**
     * Open the box
     */
    open() {
        super.open();
        this.firstFocus();
    }

    /**
     * Constructor
     * @param {string} name       name of the dialog box
     * @param {string} extensions list of extensions allowed separated by a coma (ex: ".gif,.png")
     * @param {int}    nbFiles    number of files to select
     */
    constructor( name, extensions, nbFiles ) {
        super( name, "box_inputfilescsv" );

        this._extensions = extensions ? extensions : ".csv";
        this._value = null;
        this._nbFiles = nbFiles;

        this.draw();

        this.Component.addClass( "inputfilescsv" + this._nbFiles );
    }

    /**
     * @param {int} nbFiles number of files to select
     * @returns {GUI.Box.BoxInputFilesCSV} a single instance of the dialog box
     */
    static Instance(nbFiles) {
        if ( !this._instance )
            this._instance = [];

        let instance = this._instance[nbFiles];
        if ( instance === undefined ) {
            instance = new GUI.Box.BoxInputFilesCSV( "inputfilescsv", null, nbFiles );
            this._instance[nbFiles] = instance;
        }

        return instance;
    }

    /**
     * Open the single screen choosen a file
     * @param {string}   title   multilingual label describing the title of the dialog box
     * @param {string}   message multilingual label describing the message
     * @param {array}    files   array of files { name, label }
     * @param {function} action  function to call on validating
     */
    static Open( title, message, files, action ) {
        function handleOK( action ) {
            return function ( value ) {
                if ( !action )
                    return;

                action( value );
            };
        }

        let instance = GUI.Box.BoxInputFilesCSV.Instance( files.length );

        instance.Title = title;
        instance.Message = message;
        instance.Error = null;
        instance.Value = files;
        instance.getButton( GUI.Box.Box.BUTTON_OK ).Action = handleOK( action );
        instance.open();
    }
};
