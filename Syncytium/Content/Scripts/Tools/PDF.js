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

let _PDF_FONT_NAME = "roboto";
let _PDF_INITIALIZATION_DONE = false;

/**
 * Handle PDF features
 */
class PDF {
    /**
     * Number of pixel (8.27 inches / 72px per inch)
     */
    static get MAX_WIDTH_A4() {
        return Math.ceil( 8.27 * 72 );
    }

    /**
     * Number of pixel (11.69 inches / 72px per inch)
     */
    static get MAX_HEIGHT_A4() {
        return Math.ceil( 11.69 * 72 );
    }

    /**
     * Root directory of the fonts files
     */
    static get ROOT_DIRECTORY() {
        return URL_ROOT + "Content/Fonts/";
    }

    /**
     * Name of the website
     */
    static get ROOT_WEBSITE() {
        return "www.syncytium.fr";
    }

    /**
     * Sample: "arial-unicode-ms", "dejavu", "dejavu-condensed", "dejavusans", "msyh", "opensans", "roboto"
     */
    static get FONT_NAME() {
        return _PDF_FONT_NAME;
    }

    /**
     * Set the font name to use by the application
     * @param {string} value font name to set
     */
    static set FONT_NAME( value ) {
        _PDF_FONT_NAME = value;
    }

    /**
     * @returns {boolean} the initialization status : true when the PDF is initialized
     */
    static get INITIALIZATION_DONE() {
        return _PDF_INITIALIZATION_DONE;
    }

    /**
     * Set the initialization status of the PDF document
     * @param {boolean} value true if the initialization is done
     */
    static set INITIALIZATION_DONE( value ) {
        _PDF_INITIALIZATION_DONE = value;
    }

    /**
     * Initialize PDFMake by settings fonts and by preparing the loading of fonts
     * @param {any} fnDone function to point out after the initialization of the PDF document
     */
    static Initialize ( fnDone ) {
        if ( PDF.INITIALIZATION_DONE ) {
            fnDone();
            return;
        }

        if ( pdfMake.tableLayouts === undefined || pdfMake.tableLayouts === null )
            pdfMake.tableLayouts = {};

        pdfMake.tableLayouts['tableLayout'] = {
            hLineWidth: function ( i, node ) {
                return i === node.table.body.length || i <= node.table.headerRows ? 1 : 0;
            },
            vLineWidth: function () { return 1; },
            hLineColor: function () { return '#666666'; },
            vLineColor: function () { return '#666666'; }
        };

        if ( pdfMake.fonts === undefined || pdfMake.fonts === null )
            pdfMake.fonts = {};

        var fontname = null;

        switch ( PDF.FONT_NAME ) {
            case 'arial-unicode-ms':
                pdfMake.fonts[PDF.FONT_NAME] = {
                    normal: 'arial-unicode-ms.ttf',
                    bold: 'arial-unicode-ms.ttf',
                    italics: 'arial-unicode-ms.ttf',
                    bolditalics: 'arial-unicode-ms.ttf'
                };
                fontname = 'arial-unicode-ms';
                break;
            case 'dejavu':
                pdfMake.fonts[PDF.FONT_NAME] = {
                    normal: 'DejaVuSans.ttf',
                    bold: 'DejaVuSans-Bold.ttf',
                    italics: 'DejaVuSans-Oblique.ttf',
                    bolditalics: 'DejaVuSans-BoldOblique.ttf'
                };
                fontname = 'dejavusans';
                break;
            case 'dejavu-condensed':
                pdfMake.fonts[PDF.FONT_NAME] = {
                    normal: 'DejaVuSansCondensed.ttf',
                    bold: 'DejaVuSansCondensed-Bold.ttf',
                    italics: 'DejaVuSansCondensed-Oblique.ttf',
                    bolditalics: 'DejaVuSansCondensed-BoldOblique.ttf'
                };
                fontname = 'dejavusans';
                break;
            case 'opensans':
                pdfMake.fonts[PDF.FONT_NAME] = {
                    normal: 'OpenSans-Regular.ttf',
                    bold: 'OpenSans-Bold.ttf',
                    italics: 'OpenSans-Italic.ttf',
                    bolditalics: 'OpenSans-BoldItalic.ttf'
                };
                fontname = 'opensans';
                break;
            case 'opensans-extra':
                pdfMake.fonts[PDF.FONT_NAME] = {
                    normal: 'OpenSans-Regular.ttf',
                    bold: 'OpenSans-ExtraBold.ttf',
                    italics: 'OpenSans-Italic.ttf',
                    bolditalics: 'OpenSans-ExtraBoldItalic.ttf'
                };
                fontname = 'opensans';
                break;
            case 'opensans-light':
                pdfMake.fonts[PDF.FONT_NAME] = {
                    normal: 'OpenSans-Light.ttf',
                    bold: 'OpenSans-Regular.ttf',
                    italics: 'OpenSans-LightItalic.ttf',
                    bolditalics: 'OpenSans-Italic.ttf'
                };
                fontname = 'opensans';
                break;
            case 'opensans-semi':
                pdfMake.fonts[PDF.FONT_NAME] = {
                    normal: 'OpenSans-Regular.ttf',
                    bold: 'OpenSans-Semibold.ttf',
                    italics: 'OpenSans-Italic.ttf',
                    bolditalics: 'OpenSans-SemiboldItalic.ttf'
                };
                fontname = 'opensans';
                break;
            case 'microsoft-yaihei':
                pdfMake.fonts[PDF.FONT_NAME] = {
                    normal: 'msyh.ttf',
                    bold: 'msyh.ttf',
                    italics: 'msyh.ttf',
                    bolditalics: 'msyh.ttf'
                };
                fontname = 'msyh';
                break;
            default:
                PDF.FONT_NAME = "roboto";
                pdfMake.fonts[PDF.FONT_NAME] = {
                    normal: 'Roboto-Regular.ttf',
                    bold: 'Roboto-Medium.ttf',
                    italics: 'Roboto-Italic.ttf',
                    bolditalics: 'Roboto-MediumItalic.ttf'
                };
                fontname = 'roboto';
                break;
        }

        if ( window.pdfMake !== null &&
            window.pdfMake !== undefined &&
            window.pdfMake.vfs !== null &&
            window.pdfMake.vfs !== undefined &&
            window.pdfMake.vfs[pdfMake.fonts[PDF.FONT_NAME].normal] !== null &&
            window.pdfMake.vfs[pdfMake.fonts[PDF.FONT_NAME].normal] !== undefined ) {
            PDF.INITIALIZATION_DONE = true;
            fnDone();
            return;
        }

        function handleLoadingSuccessFonts( fontName, fnDone ) {
            return function ( data, status ) {
                GUI.Box.Progress.SetStatus();

                Logger.Instance.info( "PDF", "Font '" + fontName + "' loaded with status: " + status );

                PDF.INITIALIZATION_DONE = true;
                fnDone();
            };
        }

        function handleLoadingFailedFonts( fontName, fnDone ) {
            return function ( jqxhr, status, exception ) {
                GUI.Box.Progress.SetStatus();

                Logger.Instance.error( "PDF", "Unable to load the font '" + fontName + "' due to " + status );

                PDF.INITIALIZATION_DONE = false;
                fnDone();
            };
        }

        $.ajax( {
            url: PDF.ROOT_DIRECTORY + "pdfmake-" + fontname + ".js",
            dataType: 'script',
            success: handleLoadingSuccessFonts( fontname, fnDone ),
            error: handleLoadingFailedFonts( fontname, fnDone )
        } );
    }

    /**
     * Create the pdf file and format
     * @param {any} title title of the document
     * @returns {docPDF} the structure of the PDF document
     */
    static Create ( title ) {
        return {
            pageSize: 'A4',
            pageOrientation: 'portrait',
            pageMargins: [20, 90, 20, 30],
            compress: false,
            header: function ( currentPage, pageCount ) {
                var header = {
                    columns: [
                        {
                            image: 'image_0',
                            width: 100,
                            height: 32,
                            margin: [15, 10, 0, 0]
                        },
                        {
                            image: 'image_1',
                            width: 345,
                            margin: [20, 26, 20, 0],
                            height: 1
                        },
                        {
                            text: PDF.ROOT_WEBSITE,
                            width: 150,
                            margin: [0, 22, 15, 0],
                            style: 'url'
                        }
                    ]
                };

                if ( currentPage > 1 && title !== null && title !== undefined )
                    header = [header, { text: Language.Manager.Instance.interpolation( title ).toUpperCase(), style: 'subtitle' }];

                return header;
            },
            content: [
                {
                    text: title !== null && title !== undefined ? Language.Manager.Instance.interpolation( title ).toUpperCase() : "",
                    decoration: 'underline',
                    decorationColor: '#7dc142',
                    style: 'title'
                }
            ],
            images: {
                'image_0': {
                    name: 'image_0',
                    src: URL_ROOT + 'Content/Images/PDF/Syncytium.png'
                },
                'image_1': {
                    name: 'image_1',
                    src: URL_ROOT + 'Content/Images/PDF/Line.png'
                }
            },
            styles: {
                url: {
                    fontSize: 10,
                    bold: false,
                    color: '#3a6bbb',
                    alignment: 'right'
                },
                title: {
                    fontSize: 26,
                    bold: false,
                    color: '#333333',
                    alignment: 'center',
                    margin: [0, 0, 0, 10]
                },
                subtitle: {
                    fontSize: 12,
                    bold: true,
                    color: '#333333',
                    alignment: 'left',
                    margin: [20, 15, 0, 10]
                },
                legend: {
                    fontSize: 6,
                    bold: false,
                    color: '#333333',
                    alignment: 'center',
                    italics: true,
                    margin: 0
                },
                boardTitle: {
                    fontSize: 22,
                    bold: false,
                    color: '#3a6bbb',
                    alignment: 'left',
                    margin: [0, 15, 0, 15]
                },
                tableHeader: {
                    fontSize: 6,
                    italics: true,
                    bold: true,
                    color: '#ffffff',
                    fillColor: '#bfbfbf',
                    margin: 0
                },
                tableCell: {
                    fontSize: 6,
                    italics: false,
                    bold: false,
                    fillColor: '#ffffff',
                    color: '#666666',
                    margin: [0, 0, 0, 0]
                },
                tableCellOdd: {
                    fontSize: 6,
                    italics: false,
                    bold: false,
                    color: '#666666',
                    fillColor: '#ebebeb',
                    margin: [0, 0, 0, 0]
                }
            },
            defaultStyle: {
                font: PDF.FONT_NAME
            },
            footer: function ( currentPage, pageCount ) {
                return {
                    text: Language.Manager.Instance.interpolation( "PDF_PAGE", [currentPage.toString(), pageCount.toString()], DSDatabase.Instance.CurrentLanguage ),
                    fontSize: 8,
                    alignment: 'center'
                };
            }
        };
    }

    /**
     * Add image into the PDF file and retrieve an internal code
     * @param {any} docPDF  docPDF having a new image
     * @param {any} picture new image to add
     * @returns {string} identity of the new image
     */
    static AddImage ( docPDF, picture ) {
        var k = 0;

        /* if ( picture.indexOf( '/Images/' ) >= 0 )
            picture = picture.replace( "/Images/", "/Images/PDF/" ); */

        for ( var name in docPDF.images ) {
            var image = docPDF.images[name];
            if ( image.src === picture )
                return image.name;
            k++;
        }

        name = 'image_' + k.toString();
        docPDF.images[name] = { name: name, src: picture };
        return name;
    }

    /**
     * Build a table into the PDF file
     * @param {any} docPDF  docPDF having a new table
     * @param {any} title   title of the table
     * @param {any} columns list of columns and its properties
     * @param {any} list    list representing the item
     * @param {any} array   array of values
     */
    static CreateTable ( docPDF, title, columns, list, array ) {
        var i = 0, j = 0, k = 0;
        var totalWidth = 0;
        var coef = 1;

        // Define the table structure

        var table = {
            headerRows: 2,
            dontBreakRows: true,
            widths: [],
            body: []
        };

        // Resize all column size

        for ( i = 0; i < columns.length; i++ )
            totalWidth += columns[i].size;

        if ( totalWidth > 0 )
            coef = ( PDF.MAX_WIDTH_A4 - docPDF.pageMargins[0] - docPDF.pageMargins[2] - 10 * columns.length ) / totalWidth;

        // Build the header of table

        totalWidth = 0;

        if ( !String.isEmptyOrWhiteSpaces( title ) )
            table.body.push( [{ text: Language.Manager.Instance.interpolation( title ), colSpan: columns.length, style: 'boardTitle', border: [false, false, false, true] }] );

        table.body.push( [] );

        for ( i = 0; i < columns.length; i++ ) {
            var columnWidth = Math.ceil( columns[i].size * coef ) + 1;
            var titleTable = Language.Manager.Instance.interpolation( columns[i].title );
            titleTable = titleTable === null ? "" : titleTable.toUpperCase();

            if ( i === columns.length - 1 )
                columnWidth = PDF.MAX_WIDTH_A4 - docPDF.pageMargins[0] - docPDF.pageMargins[2] - 9 * columns.length - totalWidth + 1;

            table.widths.push( columnWidth );
            table.body[table.body.length - 1].push( { text: titleTable, alignment: 'center', style: 'tableHeader' } );
            if ( i > 0 && table.body.length > 1 )
                table.body[0].push( {} );

            totalWidth += columnWidth;
        }

        // Add value into the table

        for ( i in array ) {
            var item = array[i];
            if ( item === null || item === undefined || !list.isVisible( item ) )
                continue;

            var styleCell = k % 2 === 0 ? 'tableCell' : 'tableCellOdd';
            var line = [];

            for ( j = 0; j < columns.length; j++ ) {
                var text = list.getAttributText( item, columns[j].field );
                var html = list.getAttributHTML( item, columns[j].field );

                // set value

                if ( !String.isEmptyOrWhiteSpaces( text ) && !String.isEmptyOrWhiteSpaces( html ) && text === String.decode( html ) ) {
                    line.push( { text: text, alignment: columns[j].align, style: styleCell } );
                    continue;
                }

                var htmlImg = $( html );
                var htmlSrc = htmlImg.attr( 'src' );
                if ( htmlSrc === undefined ) {
                    line.push( { text: text, alignment: columns[j].align, style: styleCell } );
                    continue;
                }

                // look for the image into the dictionary

                var name = PDF.AddImage( docPDF, htmlSrc );
                if ( columns[j].legend !== null && columns[j].legend !== undefined && columns[j].legend && !String.isEmptyOrWhiteSpaces( text ) ) {
                    var image = null;
                    if ( columns[j].width !== undefined && columns[j].height !== undefined )
                        image = { image: name, width: columns[j].width, height: columns[j].height, alignment: columns[j].align };
                    else
                        image = { image: name, alignment: columns[j].align };
                    line.push( { stack: [image, { text: text, style: 'legend' }], style: styleCell } );
                } else {
                    if ( columns[j].width !== undefined && columns[j].height !== undefined )
                        line.push( { image: name, width: columns[j].width, height: columns[j].height, alignment: columns[j].align, style: styleCell } );
                    else
                        line.push( { image: name, alignment: columns[j].align, style: styleCell } );
                }

            }

            table.body.push( line );
            k++;
        }

        // Put title and table

        docPDF.content.push( { table: table, layout: 'tableLayout' } );
    }

    /**
     * Replace all images by the base 64
     * @param {any} docPDF  docPDF to finalize
     * @param {any} fnEnd   function to launch after the finalization
     * @param {any} fnError function to launch if an error occurs
     */
    static Finalize ( docPDF, fnEnd, fnError ) {
        function handleLoadingPicture( docPDF, name ) {
            return function ( image ) {
                try {
                    docPDF.images[name] = image;
                    i++;
                    if ( i === nbImages )
                        fnEnd( docPDF );
                } catch ( ex ) {
                    Logger.Instance.exception( "PDF", "Unable to create PDF file", ex );
                    fnError( "ERR_DOWNLOAD_PDF" );
                }
            };
        }

        try {
            var nbImages = 0;
            var name = null;
            var i = 0;

            for ( name in docPDF.images )
                nbImages++;

            if ( nbImages === 0 ) {
                fnEnd( docPDF );
                return;
            }

            for ( name in docPDF.images )
                Picture.loadSVG( docPDF.images[name].src, handleLoadingPicture( docPDF, name ) );
        } catch ( ex ) {
            Logger.Instance.exception( "PDF", "Unable to create PDF file", ex );
            fnError( "ERR_DOWNLOAD_PDF" );
        }
    }
}
