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

/**
 * Handle a picture (user or product) to show the element
 */
class Picture {
    /**
     * Resize a picture (picture can be URL or data)
     * @param {any} picture filename of the picture to resize
     * @param {any} width   width of the new image
     * @param {any} height  height of the new image
     * @param {any} fnDone  function called as the resizing is done
     */
    static resize ( picture, width, height, fnDone ) {
        var image = document.createElement( "img" );
        image.onload = function () {
            Logger.Instance.info( "Picture", "width: " + this.width + " x height: " + this.height + " => width: " + width + " x height: " + height );

            let canvas = document.createElement( "canvas" );

            let context2d = canvas.getContext( "2d" );
            canvas.width = width;
            canvas.height = height;
            if ( picture.indexOf( "image/svg" ) >= 0 ) {
                context2d.drawImage( this, 0, 0, width, height, 0, 0, canvas.width, canvas.height );
            } else {
                context2d.drawImage( this, 0, 0, this.width, this.height, 0, 0, canvas.width, canvas.height );
            }

            this.onload = null;
            fnDone( canvas.toDataURL( "image/png", 1 ) );
            canvas.remove();
            image.remove();
        };
        image.onerror = function () {
            fnDone();

            this.onload = null;
            this.onerror = null;
        }
        image.src = picture;
    }

    /**
     * Load a PNG file into a data base 64 bits (PNG mode)
     * @param {any} picture filename to load
     * @param {any} fnDone  function called as the loading is done
     */
    static loadPNG ( picture, fnDone ) {
        var image = new Image();
        image.onload = function () {
            Logger.Instance.info( "Picture", "width: " + this.width + " x height: " + this.height );

            let canvas = document.createElement( "canvas" );

            let context2d = canvas.getContext( "2d" );
            canvas.height = this.height;
            canvas.width = this.width;
            context2d.drawImage( this, 0, 0 );

            fnDone( canvas.toDataURL( "image/png", 1 ) );

            this.onload = null;
            canvas.remove();
            image.remove();
        };
        image.src = picture;
    }

    /**
     * Load a SVG file into a data base 64 bits (SVG mode)
     * @param {any} picture filename to load
     * @param {any} fnDone  function called as the loading is done
     */
    static loadSVG ( picture, fnDone ) {
        var image = new Image();
        image.onload = function () {
            Logger.Instance.info( "Picture", "width: " + this.width + " x height: " + this.height );

            let canvas = document.createElement( "canvas" );

            let context2d = canvas.getContext( "2d" );
            canvas.height = this.height;
            canvas.width = this.width;
            context2d.drawImage( this, 0, 0 );

            fnDone( canvas.toDataURL( "image/svg+xml" ) );

            this.onload = null;
            canvas.remove();
            image.remove();
        };
        image.src = picture;
    }

    /**
     * Load a SVG file into a data base 64 bits (SVG mode)
     * @param {any} picture filename to load
     */
    static async loadSVGAsync( picture ) {
        return new Promise( ( resolv, reject ) => {
            let image = new Image();

            image.onload = () => {
                try {
                    Logger.Instance.info( "Picture", "width: " + image.width + " x height: " + image.height );

                    let canvas = document.createElement( "canvas" );

                    let context2d = canvas.getContext( "2d" );
                    canvas.height = image.height;
                    canvas.width = image.width;
                    context2d.drawImage( image, 0, 0 );

                    let img = canvas.toDataURL( "image/svg+xml" );

                    this.onload = null;
                    canvas.remove();
                    image.remove();

                    Logger.Instance.debug( "Picture", "Success !" );
                    resolv( img );
                } catch ( e ) {
                    Logger.Instance.debug( "Picture", "Error !" );
                    reject( e );
                }
            }

            image.onerror = () => {
                Logger.Instance.debug( "Picture", "Error !" );
                reject();
            }

            Logger.Instance.debug( "Picture", "Loading file '" + picture + "' ..." );
            image.src = picture;
        } );
    }
}
