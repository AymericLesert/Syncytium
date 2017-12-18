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
 * Handle a webix chart into a board
 */
GUI.Board.BoardChart = class extends GUI.Board.Board {
    /**
     * @returns {any} array of legends included into the chart
     */
    get Legends() {
        return this._legends;
    }

    /**
     * Abstract method instanciating a webix chart
     * @returns {any} Webix component representing a chart
     */
    createChart () {
        return null;
    }

    /**
     * Draw the chart into a board
     */
    draw () {
        // declare all legends into the chart

        this.declareLegends();

        // get the color for each legends

        var defaultBodyColor = String.parseRGBToHEX( $( "body" ).css( 'color' ) );

        var div = $( "<webix id='" + this.Name + "' class='default_color'></webix>" );
        if ( !String.isEmptyOrWhiteSpaces( this.CSSClass ) )
            div.addClass( this.CSSClass );
        var element = div.appendTo( "body" );
        var defaultColor = String.parseRGBToHEX( div.css( 'color' ) );
        element.remove();

        for ( var i = 0; i < this._legends.length; i++ ) {
            var legend = this._legends[i];

            div = $( "<webix id='" + this.Name + "' class='color_" + legend.id + "'></webix>" );
            if ( !String.isEmptyOrWhiteSpaces( this.CSSClass ) )
                div.addClass( this.CSSClass );
            element = div.appendTo( "body" );

            var color = String.parseRGBToHEX( div.css( 'color' ) );
            element.remove();
            legend.color = color === defaultBodyColor ? defaultColor : color;
        }

        // draw the chart

        super.draw();

        // handle the changement of languages

        function handleChangeLanguage( board ) {
            return function ( currentLanguage, language, key ) {
                var i, j;

                if ( language !== undefined ) {
                    for ( i = 0; i < board._legends.length; i++ ) {
                        if ( board._legends[i].text === "" )
                            continue;

                        board._legends[i].text = $( board._legends[i].text ).each( Language.Manager.HandleReplacementKeyLabel( currentLanguage, language, key ) )[0].outerHTML;
                    }
                } else {
                    for ( i = 0; i < board._legends.length; i++ ) {
                        if ( board._legends[i].text === "" )
                            continue;

                        board._legends[i].text = $( board._legends[i].text ).each( Language.Manager.HandleReplacementLabel( currentLanguage ) )[0].outerHTML;
                    }
                }

                board.Webix = board.createChart();
                board.adjustWebix();
            };
        }

        // Add a listener into the language manager to be notified in case of changes

        Language.Manager.Instance.addListener( handleChangeLanguage( this ) );
    }

    /**
     * Adjust the webix tool into the board
     */
    adjustWebix () {
        super.adjustWebix();

        if ( this.Webix === null )
            return;

        this.Webix.adjust();
    }

    /**
     * Declare a new legend
     * @param {any} name  id of the legend
     * @param {any} label multilingual label of the legend
     * @param {any} type  type of chart "bar" or "line"
     */
    declareLegend ( name, label, type ) {
        this._legends.push( { id: name, text: Helper.Span( label ), label: Helper.Label( label ), color: null, type: type === undefined || type === null ? null : type } );
    }

    /**
     * Abstract method to define the list of legends into the table
     */
    declareLegends () {
    }

    /**
     * Virtual method to retrieve the value to show in the tooltip
     * @param {any} item      item concerned
     * @param {any} attribute property to retrieve the tooltip
     * @returns {string} value to show into a tooltip (value representing the attribute)
     */
    getTooltipValue ( item, attribute ) {
        return item[attribute].toString();
    }

    /**
     * Method to define the tooltip into the chart
     * @param {any} item   item concerned
     * @param {any} xaxis  absciss value
     * @param {any} legend legend concerned by the tooltip
     * @returns {string} HTML source code representing the tooltip to show on the mouse hover
     */
    getTooltip ( item, xaxis, legend ) {
        var i = 0;
        var content = "";

        if ( legend !== null && legend !== undefined ) {
            for ( i = 0; i < this._legends.length; i++ ) {
                if ( this._legends[i].id === legend )
                    return "<div style='color: " + this._legends[i].color + ";'>" + String.encode( item[xaxis] ) + " - " + this._legends[i].text + ": " + item[this._legends[i].id].toString() + "</div>";
            }

            return null;
        }

        switch ( this._legends.length ) {
            case 0:
                return null;
            case 1:
                return "<div style='color: " + this._legends[0].color + ";'>" + String.encode( item[xaxis] ) + " - " + this._legends[0].text + ": " + item[this._legends[0].id].toString() + "</div>";
        }

        content = "<table><tr><td colspan='2'><center><b>" + String.encode( item[xaxis] ) + "</b></center></td></tr>";
        for ( i = 0; i < this._legends.length; i++ )
            content += "<tr style='color: " + this._legends[i].color + ";'><td>" + this._legends[i].text + "</td><td>" + this.getTooltipValue( item, this._legends[i].id ) + "</td></tr>";

        return content + "</table>";
    }

    /**
     * @returns {int} maximum number of points into the chart
     */
    get NbPoints() {
        return Math.ceil( this.TableZone.width() / 10 ) + 1;
    };

    /**
     * @returns {any} a new indicator value on depends on legends
     */
    newIndicator () {
        var indicator = {};

        for ( var i = 0; i < this._legends.length; i++ )
            indicator[this._legends[i].id] = 0;

        return indicator;
    }

    /**
     * Abstract method
     * To draw the current chart into the canvas (before inserting into the PDF document)
     * @param {any} canvas  canvas which concerns the chart
     * @param {any} context conext 2D of the canvas
     */
    drawCanvas ( canvas, context ) {
    }
    /**     * Method called on onOpen of the board     * Handle the update of the board when something changes into one of the references     */    onOpen() {        super.onOpen();

        function handleEvent( board ) {
            return function () {
                board.refresh();
                board.populateWebix();
                board.adjustWebix(true);
            };
        }

        if ( !this.List.isEvent( "onCreate" ) &&
             !this.List.isEvent( "onUpdate" ) && 
             !this.List.isEvent( "onDelete" ) &&
             !this.List.isEvent( "onLoad" ) ) {
            this.List.on( "onCreate", handleEvent( this ) );
            this.List.on( "onUpdate", handleEvent( this ) );
            this.List.on( "onDelete", handleEvent( this ) );
            this.List.on( "onLoad", handleEvent( this ) );
        }

        this.List.onOpen();
    }
    /**
     * Method called on onClose of the box containing the field
     */
    onClose() {
        super.onClose();

        this.List.unbind( "onCreate" );
        this.List.unbind( "onUpdate" );
        this.List.unbind( "onDelete" );
        this.List.unbind( "onLoad" );

        this.List.onClose();
    }

    /**
     * Draw the chart into a canvas and add it into the PDF
     * @param {any} docPDF   docPDF to complete
     * @param {any} fnEnd    function to call if the document is complete and ok
     * @param {any} fnError  function to call if an exception occurs
     */
    toPDF ( docPDF, fnEnd, fnError ) {
        try {
            var width = PDF.MAX_WIDTH_A4 - docPDF.pageMargins[0] - docPDF.pageMargins[2];
            var height = Math.ceil( width / 2. );

            // define a canvas

            var canvas = $( "<canvas width='" + ( width * 2 ).toString() + "' height='" + ( height * 2 ).toString() + "' ></canvas>" );
            var context = canvas[0].getContext( "2d" );

            // draw the chart

            this.drawCanvas( canvas[0], context );

            // add the chart into the PDF file

            docPDF.content.push( { image: PDF.AddImage( docPDF, canvas[0].toDataURL( "image/png", 1 ) ), width: width, height: height, alignment: 'center' } );

            // End of insertion

            canvas.remove();
            fnEnd( docPDF );
        } catch ( ex ) {
            this.exception( "Unable to create PDF file", ex );
            fnError( "ERR_DOWNLOAD_PDF" );
        }
    }

    /**
     * constructor
     * @param {any} box      string describing the html container, an html object or a GUI.Box
     * @param {any} name     identify the board
     * @param {any} cssClass css class of the board
     * @param {any} title    string describing the title of the table (using Helper.Span)
     * @param {any} list     list of elements (See List.List)
     * @param {any} icons    icons expected into the table (See BOARD_ICON, BOARD_ADD, ...)
     */
    constructor( box, name, cssClass, title, list, icons ) {
        super( box, name, "board_chart " + cssClass, title, list, icons );

        this._legends = [];
    }
};
