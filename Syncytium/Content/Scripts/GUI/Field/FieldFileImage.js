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
 * Define an object having the ability to download and resize a picture
 */
GUI.Field.FieldFileImage = class extends GUI.Field.FieldFile {
    /**
     * @returns {any} Value (in a string) of this field
     */
    get Value() {
        if ( this.Component === null )
            return super.Value;

        let picture = this.Component.find( "#picture > label > #picture" )[0];
        if ( !picture )
            return super.Value;

        return picture.src.startsWith( "data:image" ) ? picture.src : null;
    }

    /**
     * Set a value to this field
     * @param {any} value new value
     */
    set Value( value ) {
        super.Value = value;
    }

    /**
     * Set a content of file loaded (overwrite this function if you have some treatment to do)
     * @param {any} content new content of the file loaded
     */
    set File( content ) {
        function handleOnLoad( field ) {
            return function ( picture ) {
                if ( picture !== undefined ) {
                    field.Value = picture;
                } else {
                    GUI.Box.Message.Error( "ERROR", Helper.Label( "ERR_DOWNLOAD_PICTURE", [field._filename] ) );
                }
            };
        }

        super.File = content;

        Picture.resize( content, this._image.width, this._image.height, handleOnLoad( this ) );
    }

    /**
     * @returns {any} the content of the file
     */
    get File() {
        return super.File;
    }

    /**
     * @param {any} value { width, height } image size expected
     */
    set Size( value ) {
        if ( value === null || value === undefined ) {
            this._image.width = 100;
            this._image.height = 100;
        } else {
            if ( value.width === undefined || value.width === null )
                this._image.width = 100;
            else
                this._image.width = value.width;

            if ( value.height === undefined || value.height === null )
                this._image.height = 100;
            else
                this._image.height = value.height;
        }
    }

    /**
     * @returns {any} { width, height } image size expected
     */
    get Size() {
        return { width: this._image.width, height: this._image.height };
    }

    /**
     * Refresh the field
     */
    refresh () {
        super.refresh();

        if ( this.Component === null )
            return;

        let picture = this._value === null ? this._image.picture : this._value;

        let label = this.Component.find( ".value > .field > label" );
        let component = this.Component.find( ".value > .field > label > #picture" );

        if ( label.width() > 0 ) {
            let maxWidth = label.width();
            let maxHeight = label.height();
            let width = this._image.width;
            let height = this._image.height;

            if ( width > maxWidth || height > maxHeight ) {
                let scaleWidth = maxWidth / width;
                let scaleHeight = maxHeight / height;

                if ( scaleHeight < scaleWidth ) {
                    height = Math.floor( height * scaleHeight );
                    width = Math.floor( width * scaleHeight );
                } else {
                    height = Math.floor( height * scaleWidth );
                    width = Math.floor( width * scaleWidth );
                }
            }

            component.css( 'width', width + 'px' );
            component.css( 'height', height + 'px' );
        }

        if ( String.isEmptyOrWhiteSpaces( picture ) ) {
            component.removeAttr( 'src' );
            component.hide();
        } else {
            component.attr( 'src', picture );
            component.show();
        }
    }

    /**
     * Constructor
     * @param {any} box    reference on the box containing the component (inheritance of the readonly and visible flag)
     * @param {any} name   name of the component
     * @param {any} label  multilingual label of the field
     * @param {any} image  description of the image to select and to show { extensions, picture, width, height }
     */
    constructor( box, name, label, image ) {
        super( box, name, label, "field_file_image" );

        if ( image === null || image === undefined )
            this._image = { extensions: null, picture: null, width: null, height: null };
        else
            this._image = { extensions: image.extensions, picture: image.picture, width: image.width, height: image.height };

        if ( this._image.extensions === undefined || this._image.extensions === null )
            this._image.extensions = ".gif,.png,.jpg,.bmp,.svg,.tif,.jpeg";

        if ( this._image.picture === undefined || this._image.picture === null )
            this._image.picture = null;

        if ( this._image.width === undefined || this._image.width === null )
            this._image.width = 100;

        if ( this._image.height === undefined || this._image.height === null )
            this._image.height = 100;

        this.Extension = this._image.extensions;
    }
};
