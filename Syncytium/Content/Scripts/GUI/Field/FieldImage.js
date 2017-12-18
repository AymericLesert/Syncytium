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
 * Define an object having the ability to download and resize a picture
 */
GUI.Field.FieldImage = class extends GUI.Field.Field {
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
        if ( this.Component === null )
            return super.Value;

        var picture = this.Component.find( "#picture > label > #picture" )[0];
        if ( !picture )
            return super.Value;

        return picture.src.startsWith( "data:image" ) ? picture.src : null;
    }

    /**
     * @returns {any} the file picture zone
     */
    get FileZone() {
        return this.Component.find( "#picture" );
    }

    /**
     * Draw the field having or modifying the value
     * @param {any} container zone having the field
     */
    drawField( container ) {
        var content = "<label for='file_picture_" + this._index.toString() + "'>";
        content += "<img id='picture'";
        if ( this._image.picture !== null && this._image.picture !== undefined )
            content += " src='" + this._image.picture + "'";
        content += " />";
        content += "</label>";
        content += "<input id='file_picture_" + this._index.toString() + "' type='file' accept='" + this._image.extensions + "' style='display: none;' />";

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
     * Load a picture and assign it to the field
     * @param {any} filename filename
     */
    loadPicture( filename, blob ) {
        function handleOnLoad( field ) {
            return function ( e ) {
                Picture.resize( e.target.result, field._image.width, field._image.height, function ( picture ) {
                    field.Value = picture;
                    GUI.Box.Progress.Stop();
                } );
            };
        }

        // check if extension is allowed

        var currentExtension = filename.match( /\.([^\.]+)$/ );
        if ( currentExtension.length === 0 )
            return;

        currentExtension = currentExtension[1];
        var extensions = this._image.extensions.split( "," );
        var found = false;
        for ( var i = 0; i < extensions.length; i++ ) {
            if ( extensions[i].toUpperCase() === "." + currentExtension.toUpperCase() ) {
                found = true;
                break;
            }
        }

        if ( !found )
            return;

        // load the picture

        var file = new FileReader();

        file.onload = handleOnLoad(this);

        GUI.Box.Progress.Start();
        GUI.Box.Progress.SetStatus( 0, 1, "MSG_LOADING" );
        file.readAsDataURL( blob );
    }

    /**
     * Called on onOpenning the field
     */
    onOpen() {
        function handleChangePicture( field ) {
            return function () {
                field.loadPicture( this.value, this.files[0] );
            };
        }

        function handleKeydown( field ) {
            return function ( event ) {
                let keyCode = event.which || event.keyCode;

                switch ( keyCode ) {
                    case 9:
                        event.preventDefault();
                        if ( event.shiftKey )
                            field.previousFocus();
                        else
                            field.nextFocus();
                        return false;

                    case 13:
                        event.preventDefault();
                        field.onButtonOK();
                        return false;

                    case 27:
                        event.preventDefault();
                        field.Box.onButtonCancel();
                        return false;

                    case 32:
                        event.preventDefault();
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

                field.loadPicture( e.originalEvent.dataTransfer.files[0].name, e.originalEvent.dataTransfer.files[0] );
            };
        }

        super.onOpen();

        this.FileZone.on( 'drag dragstart dragend dragover dragenter dragleave drop', handleDragDropAndCo( this ) )
                     .on( 'dragover dragenter', handleDragEnter( this ) )
                     .on( 'dragleave dragend drop', handleDragEnd( this ) )
                     .on( 'drop', handleDragDrop( this ) );

        this.Component.find( "#file_picture_" + this._index.toString() ).val( '' );
        this.Component.find( "#file_picture_" + this._index.toString() ).on( 'change', handleChangePicture( this ) );
        this.Component.on( 'keydown', handleKeydown( this ) );
    }

    /**
     * Called on onClosing the field
     */
    onClose() {
        super.onClose();

        this.Component.find( "#file_picture_" + this._index.toString() ).off( 'change' );
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

        this.Component.find( "#file_picture_" + this._index.toString() ).prop( 'disabled', this.Readonly );

        this.Component.find( ".value > .field > label > #picture" ).css( 'cursor', this.Readonly ? 'initial' : 'pointer' );

        var picture = this._value === null ? this._image.picture : this._value;
        this.Component.find( ".value > .field > label > #picture" )[0].src = String.isEmptyOrWhiteSpaces( picture ) ? "" : picture;
    }

    /**
     * Constructor
     * @param {any} box    reference on the box containing the component (inheritance of the readonly and visible flag)
     * @param {any} name   name of the component
     * @param {any} label  multilingual label of the field
     * @param {any} image  description of the image to select and to show { extensions, picture, width, height }
     */
    constructor( box, name, label, image ) {
        super( box, name, label, "field_image" );

        this._index = GUI.Field.FieldImage.Index;
        this._image = { extensions: image.extensions, picture: image.picture, width: image.width, height: image.height };

        if ( this._image.extensions === undefined || this._image.extensions === null )
            this._image.extensions = ".gif,.png,.jpg,.bmp,.svg,.tif,.jpeg";

        if ( this._image.picture === undefined || this._image.picture === null )
            this._image.picture = null;

        if ( this._image.width === undefined || this._image.width === null )
            this._image.width = 100;

        if ( this._image.height === undefined || this._image.height === null )
            this._image.height = 100;

        this.draw();
    }
};
