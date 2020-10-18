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

var TestRecord = {};

/*
 * Define a dialog box handling a record
 */
TestRecord.Box = class extends GUI.Box.BoxRecord {
    /**
     * Draw and show the content of the dialog box
     * @param {any} container zone having the content
     */
    drawContent ( container ) {
        super.drawContent( container );

        // ------------------------------- Panel '_fields'

        this.declarePanel( "_fields1" );

        this.declareField( new GUI.Field.FieldCheckBox( this, "CheckBoxAvecLabel", "UNIT_VALUE", ["NULL", "OK", "KO" ] ) );
        this.declareField( new GUI.Field.FieldCheckBox( this, "CheckBoxSansLabel" ) );

        this.declareField( new GUI.Field.FieldInput( this, "InputAvecLabelAvecUnit", "UNIT_VALUE", GUI.Field.FieldInput.TYPE_INPUT, "Kg", 5 ) );
        this.declareField( new GUI.Field.FieldInput( this, "InputAvecLabelSansUnit", "UNIT_VALUE", GUI.Field.FieldInput.TYPE_INPUT ) );
        this.declareField( new GUI.Field.FieldInput( this, "InputSansLabelAvecUnit", null, GUI.Field.FieldInput.TYPE_INPUT, "Kg" ) );
        this.declareField( new GUI.Field.FieldInput( this, "InputSansLabelSansUnit", null, GUI.Field.FieldInput.TYPE_INPUT ) );
        this.declareField( new GUI.Field.FieldInput( this, "TextareaAvecLabel", "UNIT_VALUE", GUI.Field.FieldInput.TYPE_TEXTAREA ) );
        this.declareField( new GUI.Field.FieldInput( this, "TextareaSansLabel", null, GUI.Field.FieldInput.TYPE_TEXTAREA, null, 10 ) );

        this.declareField( new GUI.Field.FieldInputDigit( this, "DigitDecimalAvecLabelAvecUnit", "UNIT_VALUE", new Digits.Decimal( 6, 2 ), "Piece" ) );
        this.declareField( new GUI.Field.FieldInputDigit( this, "DigitDecimalAvecLabelSansUnit", "UNIT_VALUE", new Digits.Decimal( 6, 2 ) ) ).ShowKeyboard = true;
        this.declareField( new GUI.Field.FieldInputDigit( this, "DigitDecimalSansLabelAvecUnit", null, new Digits.Decimal( 6, 3 ), "Kg" ) );
        this.declareField( new GUI.Field.FieldInputDigit( this, "DigitDecimalSansLabelSansUnit", null, new Digits.Decimal( 6, 3 ) ));

        this.declarePanel( "_fields2" );

        this.declareField( new GUI.Field.FieldInputDigit( this, "DigitMaskAvecLabel", "UNIT_VALUE", new Digits.Mask( "0 000" ) ) );
        this.declareField( new GUI.Field.FieldInputDigit( this, "DigitMaskSansLabel", null, new Digits.Mask( "0-000-0000" ) ) );

        this.declareField( new GUI.Field.FieldInputDigit( this, "DigitSequenceAvecLabel", "UNIT_VALUE", new Digits.Sequence( "OF", 4 ) ) );
        this.declareField( new GUI.Field.FieldInputDigit( this, "DigitSequenceSansLabel", null, new Digits.Sequence( "OF" , 4 ) ) );

        this.declareField( new GUI.Field.FieldInputDigit( this, "DigitDatetimeAvecLabel", "UNIT_VALUE", new Digits.Datetime( "DD-MM-YYYY HH:mm" ) ) ).ShowKeyboard = true;
        this.declareField( new GUI.Field.FieldInputDigit( this, "DigitDatetimeSansLabel", null, new Digits.Datetime( "HH:mm:ss" ) ) );

        this.declareField( new GUI.Field.FieldInputWithBox( this, "BoxAvecLabelUser", "UNIT_VALUE", "User" ) ).AllowNullValue = true;
        this.declareField( new GUI.Field.FieldInputWithBox( this, "BoxAvecLabelDate", "UNIT_VALUE", "date" ) );
        this.declareField( new GUI.Field.FieldInputWithBox( this, "BoxAvecLabelDateTime", "UNIT_VALUE", "datetime" ) );
        this.declareField( new GUI.Field.FieldInputWithBox( this, "BoxAvecLabelTime", "UNIT_VALUE", "time" ) );
        this.declareField( new GUI.Field.FieldInputWithBox( this, "BoxAvecLabelHour", "UNIT_VALUE", "HH:mm:ss" ) );
        this.declareField( new GUI.Field.FieldInputWithBox( this, "BoxAvecLabelDigit", "UNIT_VALUE", "____0" ) );
        this.declareField( new GUI.Field.FieldInputWithBox( this, "BoxSansLabelUser", null, "User" ) );
        this.declareField( new GUI.Field.FieldInputWithBox( this, "BoxSansLabelDate", null, "DD-MM-YYYY" ) );
        this.declareField( new GUI.Field.FieldInputWithBox( this, "BoxSansLabelMinute", null, new Digits.Decimal(6,3) ) );
        this.declareField( new GUI.Field.FieldInputWithBox( this, "BoxSansLabelSeconde", null, "HH:mm:ss DD/MM/YYYY" ) );

        this.declareField( new GUI.Field.FieldSelect( this, "SelectAvecLabel", "UNIT_VALUE", new UserRecord.List() ) );
        this.declareField( new GUI.Field.FieldSelect( this, "SelectSansLabel", null, new UserRecord.List() ) );

        this.declareField( new GUI.Field.FieldSelectImage( this, "SelectImageAvecLabel", "UNIT_VALUE", "TITLE", new UserRecord.List() ) ).ShowLabel = true;
        this.declareField( new GUI.Field.FieldSelectImage( this, "SelectImageSansLabel", null, "TITLE", new UserRecord.List() ) ).Autovalidation = true;

        // ------------------------------- List of navigation panels

        this.declareNavigationPanels( [["_fields1", "_fields2"]] );
    }

    /**
     * Constructor
     * @param {any} list if undefined, UserRecord.List() or a reference on a UserRecord.List()
     */
    constructor() {
        super( "TestBox", new List.ListRecord("Unit") );

        this.draw();
    }
};


