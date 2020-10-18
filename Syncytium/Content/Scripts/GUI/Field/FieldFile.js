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
 * Define an object having the ability to download a binary file
 */
GUI.Field.FieldFile = class extends GUI.Field.Field {
    /**
     * @returns {int} a new identity of the stack of box
     */
    static get Index() {
        if ( !this._fieldIndex )
            this._fieldIndex = 1;
        else
            this._fieldIndex++;

        return this._fieldIndex;
    }

    /**
     * Set a value to this field
     * @param {any} value new value
     */
    set Value( value ) {
        super.Value = value;
    }

    /**
     * @returns {any} Value (in a string) of this field
     */
    get Value() {
        return super.Value;
    }

    /**
     * Set a content of file loaded (overwrite this function if you have some treatment to do)
     * @param {any} content new content of the file loaded
     */
    set File( content ) {
        this._file = content;
    }

    /**
     * @returns {any} the content of the file
     */
    get File() {
        return this._file;
    }

    /**
     * @returns {string} the file name attached to this field
     */
    get Filename() {
        return this._filename;
    }

    /**
     * @returns {any} the file picture zone
     */
    get FileZone() {
        return this.Component.find( "label" );
    }

    /**
     * Set a list of extensions separated by ","
     * @param {string} extension new list of extensions
     */
    set Extension( extension ) {
        this._extension = String.isEmptyOrWhiteSpaces( extension ) ? null : extension;

        if ( this.Component === null )
            return;

        if ( this._extension !== null )
            this.Component.find( "input#file_" + this._index.toString() )[0].setAttribute( "accept", this._extension );
        else
            this.Component.find( "input#file_" + this._index.toString() )[0].removeAttribute( "accept" );
    }

    /**
     * @returns {string} the list of current extensions separated by ","
     */
    get Extension() {
        return this._extension;
    }

    /**
     * Draw the field having or modifying the value
     * @param {any} container zone having the field
     */
    drawField( container ) {
        let content = "<label for='file_" + this._index.toString() + "'>";
        content += "<img id='picture' />";
        content += "</label>";
        if ( this._extension === null )
            content += "<input id='file_" + this._index.toString() + "' type='file' style='display: none;' />";
        else
            content += "<input id='file_" + this._index.toString() + "' type='file' accept='" + this._extension + "' style='display: none;' />";

        container.append( content );
    }

    /**
     * Raise the click event
     */
    onMouseClick() {
        if ( this.Component === null )
            return;

        this.Component.find( "input" ).click();
    }

    /**
     * Load a file and assign it to the field
     * @param {any} filename filename
     */
    loadFile( filename, blob ) {
        function handleOnLoad( field ) {
            return function ( e ) {
                field.info( "File '" + field._filename + "' is loaded" );
                field.File = e.target.result;
                field.Message = field._filename;
                GUI.Box.Progress.Stop();
            };
        }

        function handleOnError( field ) {
            return function ( e ) {
                field.error( "File '" + field._filename + "' can't be loaded" );
                GUI.Box.Progress.Stop();
            };
        }

        function handleOnProgress( field ) {
            return function ( e ) {
                GUI.Box.Progress.SetStatus( e.loaded, e.total );
            };
        }

        this._filename = filename.split( /[\\/]/ ).pop();
        this.info( "Loading file '" + this._filename + "' ..." );

        // check if extension is allowed

        let currentExtension = filename.match( /\.([^.]+)$/ );
        if ( currentExtension.length === 0 ) {
            this.error( "Extension missing !" );
            return;
        }

        currentExtension = currentExtension[1];
        let found = false;
        for ( let extension of this._extension.split( "," ) ) {
            if ( extension.toUpperCase() === "." + currentExtension.toUpperCase() ) {
                found = true;
                break;
            }
        }

        if ( !found ) {
            this.error( "Extension '" + currentExtension + "' not allowed !" );
            return;
        }

        // load the picture

        this.Component.find( "form" )[0].reset();
        let file = new FileReader();

        file.onload = handleOnLoad( this );
        file.onerror = handleOnError( this );
        file.onprogress = handleOnProgress( this );

        GUI.Box.Progress.Start();
        GUI.Box.Progress.SetStatus( 0, 1, "MSG_LOADING" );
        file.readAsDataURL( blob );
    }

    /**
     * Called on onOpenning the field
     */
    onOpen() {
        function handleChangeFile( field ) {
            return function () {
                field.loadFile( this.value, this.files[0] );
            };
        }

        function handleKeydown( field ) {
            return function ( event ) {
                switch ( event.key ) {
                    case "Tab":
                        event.stopImmediatePropagation();
                        if ( event.shiftKey )
                            field.previousFocus();
                        else
                            field.nextFocus();
                        return false;

                    case "Enter":
                        event.stopImmediatePropagation();
                        field.onButtonOK();
                        return false;

                    case "Escape":
                        event.stopImmediatePropagation();
                        field.Box.onButtonCancel();
                        return false;

                    case " ":
                        event.stopImmediatePropagation();
                        field.onMouseClick();
                        return false;
                }
            };
        }

        function handleDragDropAndCo( field ) {
            return function ( e ) {
                e.preventDefault();
                e.stopPropagation();
            };
        }

        function handleDragEnter( field ) {
            return function () {
                if ( !Hub.Instance.IsRunning )
                    return;

                field.FileZone.addClass( 'is-dragover' );
            };
        }

        function handleDragEnd( field ) {
            return function ( e ) {
                field.FileZone.removeClass( 'is-dragover' );
            };
        }

        function handleDragDrop( field ) {
            return function ( e ) {
                if ( e.originalEvent.dataTransfer.files.length !== 1 )
                    return;

                field.loadFile( e.originalEvent.dataTransfer.files[0].name, e.originalEvent.dataTransfer.files[0] );
            };
        }

        super.onOpen();

        this.FileZone.on( 'drag dragstart dragend dragover dragenter dragleave drop', handleDragDropAndCo( this ) )
                     .on( 'dragover dragenter', handleDragEnter( this ) )
                     .on( 'dragleave dragend drop', handleDragEnd( this ) )
                     .on( 'drop', handleDragDrop( this ) );

        this.Component.find( "#file_" + this._index.toString() ).val( '' );
        this.Component.find( "#file_" + this._index.toString() ).on( 'change', handleChangeFile( this ) );
        this.Component.on( 'keydown', handleKeydown( this ) );
    }

    /**
     * Called on onClosing the field
     */
    onClose() {
        super.onClose();

        this.Component.find( "#file_" + this._index.toString() ).off( 'change' );
        this.Component.off( 'keydown' );
        this.FileZone.off( 'drag dragstart dragend dragover dragenter dragleave drop' );
    }

    /**
     * Refresh the field
     */
    refresh () {
        super.refresh();

        if ( this.Component === null )
            return;

        this.Component.find( "#file_" + this._index.toString() ).prop( 'disabled', this.Readonly );

        this.Component.find( ".value > .field > label > #picture" ).css( 'cursor', this.Readonly ? 'initial' : 'pointer' );
    }

    /**
     * Constructor
     * @param {any} box       reference on the box containing the component (inheritance of the readonly and visible flag)
     * @param {any} name      name of the component
     * @param {any} label     multilingual label of the field
     * @param {any} cssClass class name to add to the component
     * @param {any} extension list of extensions allowed (separated by ",")
     */
    constructor( box, name, label, cssClass, extension ) {
        super( box, name, label, "field_file " + cssClass );

        this._index = GUI.Field.FieldFile.Index;
        this._extension = extension;
        this._file = null;
        this._filename = null;

        this.draw();
    }
};
