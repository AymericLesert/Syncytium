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
 * Build a PDF document
 */
class DocPDF extends LoggerBaseObject {
    /**
     * Root directory of the fonts files
     */
    static get ROOT_FONT() {
        return URL_ROOT + "Content/Fonts/";
    }

    /**
     * Root directory of the images files
     */
    static get ROOT_PICTURE() {
        return URL_ROOT + "Content/Images/";
    }

    /**
     * Name of the website
     */
    static get ROOT_WEBSITE() {
        return DSDatabase.Instance.Parameters['PDF.Web'];
    }

    /**
     * Contact of the website
     */
    static get ROOT_CONTACT() {
        return DSDatabase.Instance.Parameters['PDF.Contact'];
    }

    /**
     * Get the max width of the page
     */
    get MaxWidth() {
        switch ( this._pageSize ) {
            case 'A4':
                switch ( this._pageOrientation ) {
                    case 'portrait':
                        return Math.ceil( 8.27 * 72 ) - this._pageMargins[0] - this._pageMargins[2];

                    case 'landscape':
                        return Math.ceil( 11.69 * 72 ) - this._pageMargins[0] - this._pageMargins[2];
                }
                break;

            default:
                return 0;
        }
    }

    /**
     * Get the max height of the page
     */
    get MaxHeight() {
        switch ( this._pageSize ) {
            case 'A4':
                switch ( this._pageOrientation ) {
                    case 'portrait':
                        return Math.ceil( 11.69 * 72 ) - this._pageMargins[1] - this._pageMargins[3] - 1;

                    case 'landscape':
                        return Math.ceil( 8.27 * 72 ) - 6 - this._pageMargins[1] - this._pageMargins[3];
                }
                break;

            default:
                return 0;
        }
    }

    /**
     * Sample: "arial-unicode-ms", "dejavu", "dejavu-condensed", "dejavusans", "msyh", "opensans", "roboto"
     */
    get Fontname() {
        if ( String.isEmptyOrWhiteSpaces( this._fontname ) )
            return DSDatabase.Instance.Parameters['PDF.Font'];

        return this._fontname;
    }

    /**
     * Set the font name to use by the application
     * @param {string} value font name to set
     */
    set Fontname( value ) {
        this._fontname = value;
    }

    /**
     * Get the content of the PDF document
     */
    get Content() {
        if ( this._doc === null )
            return null;

        return this._doc.content;
    }

    /**
     * Initialize PDFMake by settings fonts and by preparing the loading of fonts
     */
    async initialize() {
        return new Promise( ( resolv, reject ) => {
            if ( pdfMake.tableLayouts === undefined || pdfMake.tableLayouts === null )
                pdfMake.tableLayouts = {};

            if ( pdfMake.tableLayouts['tableLayout'] === undefined || pdfMake.tableLayouts['tableLayout'] === null ) {
                pdfMake.tableLayouts['tableLayout'] = {
                    hLineWidth: function ( i, node ) {
                        return i === node.table.body.length || i <= node.table.headerRows ? 1 : 0;
                    },
                    vLineWidth: function () { return 1; },
                    hLineColor: function () { return '#666666'; },
                    vLineColor: function () { return '#666666'; }
                };
            }

            if ( pdfMake.fonts === undefined || pdfMake.fonts === null )
                pdfMake.fonts = {};

            let fontname = this.Fontname;

            switch ( fontname ) {
                case 'arial-unicode-ms':
                    pdfMake.fonts[fontname] = {
                        normal: 'arial-unicode-ms.ttf',
                        bold: 'arial-unicode-ms.ttf',
                        italics: 'arial-unicode-ms.ttf',
                        bolditalics: 'arial-unicode-ms.ttf'
                    };
                    fontname = 'arial-unicode-ms';
                    break;
                case 'dejavu':
                    pdfMake.fonts[fontname] = {
                        normal: 'DejaVuSans.ttf',
                        bold: 'DejaVuSans-Bold.ttf',
                        italics: 'DejaVuSans-Oblique.ttf',
                        bolditalics: 'DejaVuSans-BoldOblique.ttf'
                    };
                    fontname = 'dejavusans';
                    break;
                case 'dejavu-condensed':
                    pdfMake.fonts[fontname] = {
                        normal: 'DejaVuSansCondensed.ttf',
                        bold: 'DejaVuSansCondensed-Bold.ttf',
                        italics: 'DejaVuSansCondensed-Oblique.ttf',
                        bolditalics: 'DejaVuSansCondensed-BoldOblique.ttf'
                    };
                    fontname = 'dejavusans';
                    break;
                case 'opensans':
                    pdfMake.fonts[fontname] = {
                        normal: 'OpenSans-Regular.ttf',
                        bold: 'OpenSans-Bold.ttf',
                        italics: 'OpenSans-Italic.ttf',
                        bolditalics: 'OpenSans-BoldItalic.ttf'
                    };
                    fontname = 'opensans';
                    break;
                case 'opensans-extra':
                    pdfMake.fonts[fontname] = {
                        normal: 'OpenSans-Regular.ttf',
                        bold: 'OpenSans-ExtraBold.ttf',
                        italics: 'OpenSans-Italic.ttf',
                        bolditalics: 'OpenSans-ExtraBoldItalic.ttf'
                    };
                    fontname = 'opensans';
                    break;
                case 'opensans-light':
                    pdfMake.fonts[fontname] = {
                        normal: 'OpenSans-Light.ttf',
                        bold: 'OpenSans-Regular.ttf',
                        italics: 'OpenSans-LightItalic.ttf',
                        bolditalics: 'OpenSans-Italic.ttf'
                    };
                    fontname = 'opensans';
                    break;
                case 'opensans-semi':
                    pdfMake.fonts[fontname] = {
                        normal: 'OpenSans-Regular.ttf',
                        bold: 'OpenSans-Semibold.ttf',
                        italics: 'OpenSans-Italic.ttf',
                        bolditalics: 'OpenSans-SemiboldItalic.ttf'
                    };
                    fontname = 'opensans';
                    break;
                case 'microsoft-yaihei':
                    pdfMake.fonts[fontname] = {
                        normal: 'msyh.ttf',
                        bold: 'msyh.ttf',
                        italics: 'msyh.ttf',
                        bolditalics: 'msyh.ttf'
                    };
                    fontname = 'msyh';
                    break;
                case 'montserrat':
                    pdfMake.fonts[fontname] = {
                        normal: 'montserrat.ttf',
                        bold: 'montserrat.ttf',
                        italics: 'montserrat.ttf',
                        bolditalics: 'montserrat.ttf'
                    };
                    fontname = 'montserrat';
                    break;
                default:
                    fontname = "roboto";
                    pdfMake.fonts[fontname] = {
                        normal: 'Roboto-Regular.ttf',
                        bold: 'Roboto-Medium.ttf',
                        italics: 'Roboto-Italic.ttf',
                        bolditalics: 'Roboto-MediumItalic.ttf'
                    };
                    break;
            }

            if ( window.pdfMake !== null &&
                window.pdfMake !== undefined &&
                window.pdfMake.vfs !== null &&
                window.pdfMake.vfs !== undefined &&
                window.pdfMake.vfs[pdfMake.fonts[fontname].normal] !== null &&
                window.pdfMake.vfs[pdfMake.fonts[fontname].normal] !== undefined ) {
                resolv();
                return;
            }

            if ( !Hub.Instance.IsOnline ) {
                reject();
                return;
            }

            $.ajax( {
                url: DocPDF.ROOT_FONT + "pdfmake-" + fontname + ".js",
                dataType: 'script',
                success: ( data, status ) => {
                    this.info( "Font '" + fontname + "' loaded with status: " + status );

                    if ( typeof window.pdfMake !== 'undefined' && typeof window.pdfMake.addVirtualFileSystem !== 'undefined' )
                        window.pdfMake.addVirtualFileSystem( window.pdfMake.vfs );

                    resolv();
                },
                error: ( jqxhr, status, exception ) => {
                    this.error( "Unable to load the font '" + fontname + "' due to " + status );
                    reject();
                }
            } );
        } );
    }

    /**
     * Create the pdf file and format
     * @param {string} title title of the document
     * @param {string} pageSize page size of the document ('A4' by default)
     * @param {string} pageOrientation page orientation of the document ('landscape' or 'portrait')
     * @param {any} pageMargins [left, top, right, bottom] ([20, 90, 20, 30] by default for portrait or [90, 20, 30, 20] by default for landscape)
     * @returns {docPDF} the structure of the PDF document
     */
    async create( title, pageSize, pageOrientation, pageMargins ) {
        if ( this._doc !== null )
            return;

        await this.initialize().then( () => {
            /* Set default properties */

            this._pageSize = String.isEmptyOrWhiteSpaces( pageSize ) ? 'A4' : pageSize;
            this._pageOrientation = String.isEmptyOrWhiteSpaces( pageOrientation ) ? 'portrait' : pageOrientation;
            if ( pageMargins === null || pageMargins === undefined )
                this._pageMargins = this._pageOrientation === 'portrait' ? [20, 90, 20, 30] : [90, 20, 30, 20];

            /* Create a pdf document */

            this._doc = {
                pageSize: this._pageSize,
                pageOrientation: this._pageOrientation,
                pageMargins: this._pageMargins,
                compress: false,
                header: function ( currentPage, pageCount ) {
                    let header = {
                        columns: [
                            {
                                image: 'image_0',
                                width: 80,
                                height: 30,
                                margin: [15, 10, 0, 0]
                            },
                            {
                                image: 'image_1',
                                width: 345,
                                margin: [20, 26, 20, 0],
                                height: 1
                            },
                            {
                                text: DocPDF.ROOT_CONTACT,
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
                        src: DocPDF.ROOT_PICTURE + 'PDF/Syncytium.png'
                    },
                    'image_1': {
                        name: 'image_1',
                        src: DocPDF.ROOT_PICTURE + 'PDF/Line.png'
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
                        color: '#eeeeee',
                        fillColor: '#bfbfbf',
                        margin: 0
                    },
                    tableCell: {
                        fontSize: 6,
                        italics: false,
                        bold: false,
                        fillColor: '#eeeeee',
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
                    font: this.Fontname
                },
                footer: function ( currentPage, pageCount ) {
                    return {
                        text: Language.Manager.Instance.interpolation( "PDF_PAGE", [currentPage.toString(), pageCount.toString()], DSDatabase.Instance.CurrentLanguage ),
                        fontSize: 8,
                        alignment: 'center'
                    };
                }
            };
        } );
    }

    /**
     * Add image into the PDF file and retrieve an internal code
     * @param {any} picture new image to add (source of image)
     * @returns {string} identity of the new image
     */
    addImage( picture ) {
        let k = 0;

        for ( let image of Array.toIterable( this._doc.images ) ) {
            if ( image.src === picture )
                return image.name;
            k++;
        }

        let name = 'image_' + k.toString();
        this._doc.images[name] = { name: name, src: picture };
        return name;
    }

    /**
     * Build a table into the PDF file
     * @param {any} title   title of the table
     * @param {any} columns list of columns and its properties
     * @param {any} list    list of items to set into the table
     */
    createTable( title, columns, list ) {
        let k = 0;
        let totalWidth = 0;
        let coef = 1;

        // Define the table structure

        let table = {
            headerRows: 2,
            dontBreakRows: true,
            widths: [],
            body: []
        };

        // Resize all column size

        for ( let i in columns )
            totalWidth += columns[i].size;

        if ( totalWidth > 0 )
            coef = ( this.MaxWidth - this._doc.pageMargins[0] - this._doc.pageMargins[2] - 10 * columns.length ) / totalWidth;

        // Build the header of table

        totalWidth = 0;

        if ( !String.isEmptyOrWhiteSpaces( title ) )
            table.body.push( [{ text: Language.Manager.Instance.interpolation( title ), colSpan: columns.length, style: 'boardTitle', border: [false, false, false, true] }] );

        table.body.push( [] );

        for ( let i = 0; i < columns.length; i++ ) {
            let columnWidth = Math.ceil( columns[i].size * coef ) + 1;
            let titleTable = Language.Manager.Instance.interpolation( columns[i].title );
            titleTable = titleTable === null ? "" : titleTable.toUpperCase();

            if ( i === columns.length - 1 )
                columnWidth = this.MaxWidth - this._doc.pageMargins[0] - this._doc.pageMargins[2] - 9 * columns.length - totalWidth + 1;

            table.widths.push( columnWidth );
            table.body[table.body.length - 1].push( { text: titleTable, alignment: 'center', style: 'tableHeader' } );
            if ( i > 0 && table.body.length > 1 )
                table.body[0].push( {} );

            totalWidth += columnWidth;
        }

        // Add value into the table

        list.each( ( item ) => {
            let styleCell = k % 2 === 0 ? 'tableCell' : 'tableCellOdd';
            let line = [];

            for ( let j = 0; j < columns.length; j++ ) {
                let text = list.getAttributText( item, columns[j].field );
                let html = list.getAttributHTML( item, columns[j].field );

                // set value

                if ( !String.isEmptyOrWhiteSpaces( text ) && !String.isEmptyOrWhiteSpaces( html ) && text === String.decode( html ) ) {
                    line.push( { text: text, alignment: columns[j].align, style: styleCell } );
                    continue;
                }

                let htmlImg = $( html );
                let htmlSrc = htmlImg.attr( 'src' );
                if ( htmlSrc === undefined ) {
                    line.push( { text: text, alignment: columns[j].align, style: styleCell } );
                    continue;
                }

                // look for the image into the dictionary

                let name = this.addImage( htmlSrc );
                if ( columns[j].legend !== null && columns[j].legend !== undefined && columns[j].legend && !String.isEmptyOrWhiteSpaces( text ) ) {
                    let image = null;
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
        } );

        // Put title and table

        this._doc.content.push( { table: table, layout: 'tableLayout' } );
    }

    /**
     * Replace all images by the base 64
     */
    async finalize() {
        for ( let name in this._doc.images ) {
            await Picture.loadSVGAsync( this._doc.images[name].src ).then( image => {
                this._doc.images[name] = image;
            } ).catch( ex => {
                this.exception( "Unable to load the picture '" + name + "'", ex );
                return;
            } );
        }
    }

    /**
     * Download the PDF document
     * @param {string} filename to download
     */
    download( filename ) {
        try {
            this.info( "PDF file : " + String.JSONStringify( this._doc) );
            pdfMake.createPdf( this._doc ).download( filename );
            this.info( "Export done into a PDF file" );
            return true;
        } catch ( ex ) {
            this.exception( "Unable to create PDF file '" + filename + "'", ex );
            return false;
        }
    }

   /**
     * Constructor
     * @param {string} fontname fontname to use
     */
    constructor( fontname ) {
        super( "PDF" );

        this._fontname = fontname;
        this._pageSize = null;
        this._pageOrientation = null;
        this._pageMargins = null;

        this._doc = null;
    }
}
