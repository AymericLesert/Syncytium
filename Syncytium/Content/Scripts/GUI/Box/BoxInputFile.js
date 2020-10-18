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
GUI.Box.BoxInputFile = class extends GUI.Box.Box {
    /**
     * @returns {int} the next file id of the input box
     */
    static get ID() {
        if ( !this._inputFileId )
            this._inputFileId = 1;
        else
            this._inputFileId++;

        return this._inputFileId;
    }

    /**
     * @returns {any} The list of files
     */
    get Value() {
        return this._value;
    }

    /**
     * @returns {any} the file picture zone
     */
    get FileZone() {
        return this.Component.find( ".content > #file" );
    }

    /**
     * Define the list of buttons of the dialog box
     * @param {any} container zone having the list of buttons
     */
    drawButton ( container ) {
        function handleCancel( box ) {
            return function ( value ) {
                box.deleteFile( value );
            };
        }

        super.drawButton( container );

        this.addFocus( this.FileZone );
        this.declareButton( GUI.Box.Box.BUTTON_OK );
        this.declareButton( GUI.Box.Box.BUTTON_CANCEL, "BTN_CANCEL" ).Action = handleCancel( this );
    }

    /**
     * Draw and show the content of the dialog box
     * @param {any} container zone having the content
     */
    drawContent( container ) {
        super.drawContent( container );

        container.append( '<input type="file" class="file" id="UploadFile_' + this._index.toString() + '" accept="' + this._extensions + '" />' );
        container.append( "<div id='file'></div>" );
        container.append( "<div id='filename'></div>" );
        container.show();
    }

    /**
     * Called on openning the box
     */
    onOpen () {
        function handleKeydown( box ) {
            return function ( event ) {
                switch ( event.key ) {
                    case "Tab":
                        event.stopImmediatePropagation();
                        if ( event.shiftKey )
                            box.previousFocus();
                        else
                            box.nextFocus();
                        return false;

                    case "Escape":
                        event.stopImmediatePropagation();
                        box.onButtonCancel();
                        return false;

                    case "Enter":
                    case " ":
                        event.stopImmediatePropagation();
                        box.onMouseClick();
                        return false;
                }
            };
        }

        super.onOpen();

        this.FileZone.on( 'keydown', handleKeydown( this ) );

        this.FileZone.removeClass( 'full' );
        this.Component.find( "#filename" ).html( '' );
        this.Component.find( "#UploadFile_" + this._index.toString() ).val( '' );
        this._value = null;

        function handleChangeFile( box ) {
            return function () {
                box.sendFiles( [{ name: this.value, file: this.files[0] }] );
            };
        }

        this.Component.find( "#UploadFile_" + this._index.toString() ).off('change').on('change', handleChangeFile( this ) );

        function handleSelectFile( box ) {
            return function () {
                box.Component.find( "#UploadFile_" + box._index.toString() ).click();
            };
        }
        this.FileZone.click( handleSelectFile( this ) );

        function handleDragDropAndCo( box ) {
            return function ( e ) {
                e.preventDefault();
                e.stopPropagation();
            };
        }

        function handleDragEnter( box ) {
            return function () {
                if ( !Hub.Instance.IsRunning )
                    return;

                box.FileZone.addClass( 'is-dragover' );
            };
        }

        function handleDragEnd( box ) {
            return function ( e ) {
                box.FileZone.removeClass( 'is-dragover' );
            };
        }

        function handleDragDrop( box ) {
            return function ( e ) {
                let droppedFiles = [];

                for ( let i = 0; i < e.originalEvent.dataTransfer.files.length; i++ )
                    droppedFiles.push( { name: e.originalEvent.dataTransfer.files[i].name, file: e.originalEvent.dataTransfer.files[i] } );

                box.sendFiles( droppedFiles );
            };
        }

        this.FileZone.on( 'drag dragstart dragend dragover dragenter dragleave drop', handleDragDropAndCo( this ) )
                     .on( 'dragover dragenter', handleDragEnter( this ) )
                     .on( 'dragleave dragend drop', handleDragEnd( this ) )
                     .on( 'drop', handleDragDrop( this ) );
    }

    /**
     * Open the box
     */
    open() {
        super.open();
        this.firstFocus();
    }

    /**
     * Called on closing the box
     */
    onClose() {
        super.onClose();

        this.FileZone.off( 'drag dragstart dragend dragover dragenter dragleave drop keydown' );
    }

    /**
     * Raise a click event on this button
     * @returns {boolean} true if the event click exists
     */
    onMouseClick() {
        if ( this.Readonly || this.Component === null )
            return;

        this.FileZone.click();
    }

    /**
     * Remove the file into the server
     * @param {any} files description of the list of files to remove on the server (if undefined, select the current file)
     */
    deleteFile ( files ) {
        if ( files === null || files === undefined )
            files = this._value;

        if ( files === null || files === undefined )
            return;

        if ( Hub.Instance.IsRunning ) {
            for ( let i = 0; i < files.length; i++ ) {
                let file = files[i];
                try {
                    $.ajax( {
                        type: "POST",
                        url: '/Administration/File/Remove',
                        data: String.JSONStringify( { id: file.id.toString(), filename: file.filename } ),
                        contentType: 'application/json',
                        processData: false
                    } );
                } catch ( e ) {
                    this.exception( "Unable to remove the file", e );
                }
            }
        }

        this._value = null;
        this.FileZone.removeClass( 'full' );
        this.Component.find( "#filename" ).html( '' );
    }

    /**
     * Private method
     * Send a list of files to the server
     * @param {any} files array of files {name, file}
     */
    sendFiles( files ) {
        if ( !Hub.Instance.IsRunning )
            return;

        let extensions = this._extensions.split( "," );
        let fileNotAllowed = [];

        // check if extension of files are allowed

        for ( let i = 0; i < files.length; i++ ) {
            let currentExtension = files[i].name.match( /\.([^.]+)$/ )[1];
            let found = false;
            for ( let j = 0; j < extensions.length; j++ ) {
                if ( extensions[j].toUpperCase() === "." + currentExtension.toUpperCase() ) {
                    found = true;
                    break;
                }
            }

            if ( !found )
                fileNotAllowed.push( files[i].name );
        }

        if ( fileNotAllowed.length > 0 ) {
            GUI.Box.Message.Error( "ERROR", Helper.Label( "ERR_UPLOAD_EXTENSION", [fileNotAllowed.join(", ")] ));
            return;
        }

        // upload the file

        let data = new FormData();
        for ( let i = 0; i < files.length; i++ )
            data.append( files[i].name, files[i].file );

        GUI.Box.Progress.Start();
        GUI.Box.Progress.SetStatus( 0, 1, "MSG_LOADING" );

        function handleSuccess( box ) {
            return function ( result ) {
                result = JSON.parse( result );

                if ( !box.FileZone.hasClass( 'full' ) )
                    box.FileZone.addClass( 'full' );

                let filenames = "";
                for ( let i = 0; i < result.files.length; i++ )
                    filenames = filenames + ( filenames === "" ? "" : "<br />" ) + String.encode( result.files[i].filename );

                box.Component.find( "#filename" ).html( filenames );
                box._value = result.files;
                GUI.Box.Progress.Stop();
            };
        }

        function handleError( box ) {
            return function ( xhr ) {
                box.FileZone.removeClass( 'full' );
                box.Component.find( "#UploadFile_" + box._index.toString() ).val( '' );
                box._value = null;

                GUI.Box.Progress.Stop();

                if ( xhr.status === 500 ) {
                    // file too big
                    GUI.Box.Message.Error( "ERROR", "ERR_UPLOAD_TOO_BIG" );
                    return;
                }

                if ( !Hub.Instance.IsRunning ) {
                    // The connection is broken
                    GUI.Box.Message.Error( "ERROR", "ERR_UPLOAD_BROKEN" );
                    return;
                }

                // error (not described)

                GUI.Box.Message.Error( "ERROR", new Errors( "ERR_UPLOAD_FAILED", [xhr.status.toString()] ) );
            };
        }

        // delete previous files

        this.deleteFile();

        // upload new files

        $.ajax( {
            type: "POST",
            url: '/Administration/File/Upload',
            contentType: false,
            processData: false,
            data: data,
            xhr: function () { // xhr qui traite la barre de progression
                let myXhr = $.ajaxSettings.xhr();
                if ( myXhr.upload ) { // vérifie si l'upload existe
                    myXhr.upload.addEventListener( 'progress', function ( e ) {
                        if ( e.lengthComputable )
                            GUI.Box.Progress.SetStatus( e.loaded, e.total, "MSG_LOADING" );
                    }, false );
                }
                return myXhr;
            },
            success: handleSuccess( this ),
            error: handleError( this )
        } );
    }

    /**
     * Constructor
     * @param {any} name       name of the dialog box
     * @param {any} extensions list of extensions allowed separated by a coma (ex: ".gif,.png")
     */
    constructor( name, extensions ) {
        super( name, "box_inputfile" );

        this._index = GUI.Box.BoxInputFile.ID;
        this._extensions = extensions ? extensions : ".gif,.png,.jpg,.bmp,.svg,.tif,.jpeg,.txt,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx";
        this._value = null;

        this.draw();
    }

    /**
     * @returns {GUI.Box.BoxInputFile} a single instance of the dialog box
     */
    static get Instance() {
        if ( !this._instance )
            this._instance = new GUI.Box.BoxInputFile( "inputfile" );

        return this._instance;
    }

    /**
     * Open the single screen choosen a file
     * @param {any} title   multilingual label describing the title of the dialog box
     * @param {any} message multilingual label describing the message
     * @param {any} action  function to call on validating
     */
    static Open( title, message, action ) {
        GUI.Box.BoxInputFile.Instance.Title = title;
        GUI.Box.BoxInputFile.Instance.Message = message;
        GUI.Box.BoxInputFile.Instance.Error = null;
        GUI.Box.BoxInputFile.Instance.getButton( GUI.Box.Box.BUTTON_OK ).Action = action;
        GUI.Box.BoxInputFile.Instance.open();
    }
};
