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

var Digits = {};

/**
 * This private class represents an elementary item of digits.
 * A digit is a character into a formatted string expected.
 * For example : "00.00.00.00.00" where "0" is a Digit (0..9)
 */
Digits.Digit = class {
    /**
     * @returns {string} The value of the item or the default value
     */
    get Value() {
        return this._value === null ? this._default : this._value;
    }

    /**
     * Set the value of the digit
     * @param {string} value value to set of the item
     */
    set Value( value ) {
        this._value = (value !== ' ' && String.isEmptyOrWhiteSpaces( value )) ? null : value;
    }

    /**
     * Set the current token - list of allowed characters
     * For example :
     *   - 'x'
     *   - '[0-9]'
     *   - '[0-9A-F]'
     * @param {string} token new token to set to this digit
     */
    set Token( token ) {
        this._range = [];
        this._value = null;
        this._default = ' ';

        if ( token.length === 1 ) {
            this._range.push( token );
            this._default = token;
        } else {
            let start = '', end = '', i = 0;
            for ( i = 1; i < token.length - 1; i++ ) {
                start = token[i];
                if ( token[i + 1] === '-' ) {
                    end = token[i + 2];
                    i += 2;
                } else {
                    end = start;
                }

                for ( let c = start.charCodeAt( 0 ); c <= end.charCodeAt( 0 ); c++ )
                    this._range.push( String.fromCharCode( c ) );
            }
        }
    }

    /**
     * @returns {string} default value of the digit
     */
    get DefaultValue() {
        return this._default;
    }

    /**
     * Set default value of the digit
     * @param {string} defaultValue new default value
     */
    set DefaultValue( defaultValue ) {
        this._default = defaultValue;
    }

    /**
     * @returns {string} character to show on the screen if the value is not defined
     */
    get Mark() {
        return this._mark;
    }

    /**
     * Set character to show on the screen if the value is not defined
     * @param {string} mark character
     */
    set Mark( mark ) {
        if ( this.IsStatic )
            this._mark = String.isEmptyOrWhiteSpaces( mark ) ? ' ' : mark;
        else
            this._mark = String.isEmptyOrWhiteSpaces( mark ) ? '_' : mark;
    }

    /**
     * @returns {boolean} Indicates if the token is only one character (no choice)
     */
    get IsStatic() {
        return this._range.length <= 1;
    }

    /**
     * @returns {boolean} Indicates if the token is only one character (no choice)
     */
    get IsNull() {
        return this._value === null;
    }

    /**
     * Check if the value is included into the list of allowed characters
     * @param {any} value value to check
     * @returns {boolean} true if the value is allowed
     */
    check( value ) {
        return this._range.includes( value );
    }

    /**
     * @returns {string} an HTML string
     */
    toHTML() {
        return this._value === null ? this._mark : this._value;
    }

    /**
     * Constructor
     */
    constructor() {
        this._range = [];
        this._value = null;
        this._default = ' ';
        this._mark = '_';
    }
};

/**
 * This class represents a string within a given format value
 * For example :
 *    "00.00.00.00.00" represents a phone number
 *    "__ __0,00" represents a numerical value
 *    "# ?? ?? ??" represents a hexadecimal value (color)
 *    "[A-F]____" represents a string begun by a character A, B, C, D, E or F and 4 values numerical
 */
Digits.Digits = class {
    /**
     * build a digit by using its format
     * @param {any} format format to check
     * @returns {Digits.Digits} null or an instance of digits
     */
    static Factory( format ) {
        let match = null;

        if ( String.isEmptyOrWhiteSpaces( format ) || typeof format !== "string" )
            return null;

        // Decimal

        match = format.match( /^(((_{1,3}\.){0,1}(___\.)*(__0)((.0{3})+){0,1})|(_*0+)|((0{1,3}\.){0,1}(000\.)*(000)))((,0+){0,1}|)$/ );
        if ( match !== null ) {
            let newFormat = format.replace( /\./g, "" );
            let i = newFormat.indexOf( "," );
            return new Digits.Decimal(i, i < 0 ? 0 : (newFormat.length - i - 1));
        }

        // Sequence

        match = format.match( /^\D+(0+)$/ );
        if ( match !== null )
            return new Digits.Sequence( match[0].substr( 0, match[0].length - match[1].length ), match[1].length );

        // Date time

        if ( /^(date|time|datetime)$/.test( format.toLowerCase() ) )
            return new Digits.Datetime( format );

        if ( /^(.*(DD|MM|YYYY|HH|mm|ss|SSS))+.*$/.test( format ) )
            return new Digits.Datetime( format );

        // Mask

        return new Digits.Mask( format );
    }

    /**
     * @returns {string} the type of the current digit format
     */
    get Type() {
        return "digit";
    }

    /**
     * @returns {boolean} true if the last value is wrong
     */
    get HasError() {
        return this._error;
    }

    /**
     * @returns {boolean} true if the current position in the digit is a calendar or not
     */
    get IsCalendar() {
        return false;
    }

    /**
     * @returns {boolean} true if the value stored into the digit is like NULL
     */
    get IsNull() {
        return String.isEmptyOrWhiteSpaces( this.CurrentValue );
    }

    /**
     * @returns {boolean} true if the negative value is possible
     */
    get AllowNegativeValue() {
        return this._allowNegativeValue;
    }

    /**
     * @param {boolean} value true if the negative value is possible
     */
    set AllowNegativeValue( value ) {
        this._allowNegativeValue = value === null || value === undefined || value === true;
    }

    /**
     * @returns {string} the current mask format of the digit
     */
    getFormat() {
        return this._format;
    }

    /**
     * Update the mask format of the digit
     * @param {any} format new format
     * @param {any} separator separator between the parsing from the end to the begin and the begin to the end
     */
    setFormat( format, separator ) {
        this.cleanUndo();

        this._error = false;
        this._format = format;
        this._separator = separator;
        this._indexSeparator = -1;
        this._digits = [];

        let i = 0;
        while ( i < format.length ) {
            let digits = [ new Digits.Digit() ];
            i = this.getToken( digits, format, i );
            for ( let newDigit of digits ) {
                if ( newDigit.DefaultValue === separator && this._indexSeparator < 0 )
                    this._indexSeparator = this._digits.length;
                this._digits.push( newDigit );
            }
        }

        if ( separator === '\0' )
            this._indexSeparator = this._digits.length;

        this._selectStart = -1;
        this._selectEnd = -1;
        this._indexToken = this._indexSeparator;
        if ( this._indexToken < 0 ) {
            this._indexToken = 0;
            while ( this._indexToken < this._digits.length && this._digits[this._indexToken].IsStatic )
                this._indexToken++;
        }
    }

    /**
     * @returns {boolean} true if the undo stack is not empty
     */
    get HasUndo() {
        return this._undo.length > 0;
    }

    /**
     * Clean up the undo stack - not the current value
     */
    cleanUndo() {
        this._undo = [];
    }

    /**
     * Add the current value (if this value is different than the previous one) into the undo stack
     */
    pushUndo() {
        let value = this.CurrentValue;

        if ( !this._handleUndo || ( this._undo.length > 0 && this._undo[this._undo.length - 1][0] === value ) )
            return;

        this._undo.push( [value, this._indexToken] );
    }

    /**
     * Retrieve the value as the last value into the undo stack
     */
    popUndo() {
        if ( !this.HasUndo )
            return;

        this._handleUndo = false;
        let lastStatus = this._undo.pop();
        this.Value = lastStatus[0];
        this._indexToken = lastStatus[1];
        this._handleUndo = true;

        this._selectStart = -1;
        this._selectEnd = -1;
    }

    /**
     * @returns {string} the current value writing
     */
    get CurrentValue() {
        let value = '';

        for ( let digit of this._digits )
            if ( !digit.IsNull )
                value += digit.Value;

        return value;
    }

    /**
     * @returns {string} the current value of the Digits (without any static characters)
     */
    get Value() {
        let value = '';
        let firstSeparator = true;

        for ( let digit of this._digits ) {
            if ( !digit.IsStatic )
                value += digit.Value;
            else if ( digit.DefaultValue === this._separator && firstSeparator ) {
                firstSeparator = false;
                value += digit.Value;
            }
        }

        return value.trim();
    }

    /**
     * Parse the value and update the current value of the Digits
     * @param {string} value new value to set
     * 
     * The flag HasError is set to true if the value is not allowed but all characters allowed are set into the current value
     */
    set Value( value ) {
        let i = 0, j = 0;

        if ( typeof value === "number" ) {
            value = value.toString();
            if ( !String.isEmptyOrWhiteSpaces( this._separator ) )
                value = value.replace( '.', this._separator );
        } else
            value = String.isEmptyOrWhiteSpaces( value ) ? "" : value.toString();

        if ( value !== this.CurrentValue )
            this.pushUndo();

        this._selectStart = -1;
        this._selectEnd = -1;
        this._indexToken = 0;
        this._error = false;

        // Step 1 : forward from indexSeparator to 0

        let newToken = -1;
        if ( this._indexSeparator >= 0 ) {
            j = value.indexOf( this._separator );
            if ( j < 0 )
                j = value.length;

            this._indexToken = this._indexSeparator;
            for ( i = this._indexSeparator - 1, j--; i >= 0; i-- ) {
                let digit = this._digits[i];
                if ( String.isEmptyOrWhiteSpaces( value ) ) {
                    digit.Value = null;
                } else if ( j < 0 ) {
                    digit.Value = null;
                } else if ( digit.check( value[j] ) ) {
                    digit.Value = value[j];
                    j--;
                } else {
                    digit.Value = null;
                }
            }

            if ( j >= 0 )
                this._error = true;

            // Set the token on the separator character

            if ( this._separator !== '\0' ) {
                j = value.indexOf( this._separator );
                if ( j < 0 ) {
                    this._digits[this._indexSeparator].Value = null;
                    j = value.length - 1;
                } else {
                    this._digits[this._indexSeparator].Value = this._separator;
                    this._indexToken++;
                }
            } else {
                j = value.length - 1;
            }

            j++;
        } else {
            newToken = 0;
        }

        // Step 2 : from indexSeparator to the end

        for ( i = this._indexSeparator + 1; i < this._digits.length; i++ ) {
            let digit = this._digits[i];
            if ( String.isEmptyOrWhiteSpaces( value ) ) {
                digit.Value = null;
            } else if ( j >= value.length ) {
                digit.Value = null;
            } else if ( digit.check( value[j] ) ) {
                digit.Value = value[j];
                newToken = i + 1;
                j++;
            } else {
                digit.Value = null;
            }
        }

        if ( newToken >= 0 ) {
            while ( newToken < this._digits.length && this._digits[newToken].IsStatic )
                newToken++;
            this._indexToken = newToken;
        }

        if ( j < value.length )
            this._error = true;
    }

    /**
     * @returns {string} the string correctly formatted
     */
    toString() {
        let value = '';

        for ( let digit of this._digits )
            value += digit.Value;

        return value;
    }

    /**
     * @returns {string} the string html representing the current value
     */
    toHTML() {
        let value = '';
        let indexPointer = this._indexToken;
        if ( this._selectStart >= 0 )
            indexPointer = -1;

        for ( let i = 0; i < this._digits.length; i++ ) {
            if ( i === this._selectStart )
                value += "<span class='selected'>";
            if ( i === indexPointer )
                value += "<span class='pointer'>";
            value += this._digits[i].toHTML();
            if ( i === this._selectEnd || i === indexPointer )
                value += "</span>";
        }

        return value;
    }

    /**
     * (protected methode) Parse a token of the format
     * @param {Array}  digits array of tokens to set (the first one is already set)
     * @param {string} format format to parse
     * @param {int}    index  current position in the format to parse
     * @returns {int} the position of the next token
     */
    getToken( digits, format, index ) {
        let firstChar = ' ';
        let c = format[index];
        let i = 0;
        let token = '';
        let digit = digits[0];

        switch ( c ) {
            case '0':
                digit.Token = '[0-9]';
                digit.DefaultValue = '0';
                digit.Mark = '0';
                index++;
                break;
            case '_':
                digit.Token = '[0-9]';
                digit.DefaultValue = ' ';
                digit.Mark = '_';
                index++;
                break;
            case '?':
                digit.Token = '[0-9A-Fa-f]';
                digit.DefaultValue = '0';
                digit.Mark = '_';
                index++;
                break;
            case '[':
                token = '[';
                firstChar = format[index + 1];
                for ( i = index + 1; i < format.length; i++ ) {
                    c = format[i];
                    if ( c === ']' ) {
                        i++;
                        break;
                    }

                    if ( c === '\\' ) {
                        i++;
                        if ( i < format.length )
                            token += format[i];
                    } else {
                        token += c;
                    }
                }
                token += ']';
                digit.Token = token;
                digit.DefaultValue = firstChar;
                digit.Mark = '_';
                index = i;
                break;
            case '\\':
                index++;
                if ( index < format.length ) {
                    digit.Token = format[index];
                    digit.Mark = format[index];
                    index++;
                } else {
                    digit.Token = '\\';
                    digit.Mark = '\\';
                }
                break;
            default:
                digit.Token = c;
                digit.Mark = c;
                index++;
                break;
        }

        return index;
    }

    /**
     * @returns {string} null if nothing, else the fix value of the next token
     */
    get NextTokenFix() {
        return this._indexToken <= this._indexSeparator && this._indexSeparator < this._digits.length ? this._separator : null;
    }

    /**
     * Set the current position of the pointer
     * @param {int} indexToken new value
     */
    set IndexToken( indexToken ) {
        indexToken = indexToken === null || indexToken === undefined ? 0 : indexToken;

        if ( indexToken < 0 || this._digits.length === 0 )
            this._indexToken = 0;
        else if ( indexToken >= this._digits.length )
            this._indexToken = this._digits.length - 1;
        else
            this._indexToken = indexToken;
    }

    /**
     * @returns {any} current index of the pointer
     */
    get IndexToken() {
        if ( this._indexToken < 0 )
            return 0;

        if ( this._indexToken > this._digits.length - 1 )
            return this._digits.length - 1;

        return this._indexToken;
    }

    /**
     * Update the value on depends on the key
     * @param {any} key key to implement ("undo", "next", or any other character)
     */
    addKey( key ) {
        let i = 0;

        switch ( key ) {
            case "raz":
                this.Value = "";
                return this;
            case "next":
                if ( this._indexToken > this._indexSeparator || this._indexSeparator >= this._digits.length )
                    return this;

                key = this._separator;
                break;
            case "undo":
                this.popUndo();
                break;
        }

        // clean up all selected token

        if ( this._selectStart >= 0 ) {
            this._indexToken = this._selectStart;
            while ( this._indexToken < this._digits.length && this._digits[this._indexToken].IsStatic )
                this._indexToken++;
        }
        for ( i = this._selectStart; i <= this._selectEnd && i >= 0 && i < this._digits.length; i++ )
            this._digits[i].Value = null;
        this._selectStart = -1;
        this._selectEnd = -1;

        if ( key === "undo" )
            return this;

        // Add the new character

        this.Value = this.CurrentValue + key;

        // Handle the current error

        if ( this.HasError ) {
            // pushUndo is done in the setting Value on the previous line
            this.popUndo();
            this._error = false;
        }

        return this;
    }

    /**
     * The first key added, remove all existing values
     */
    selectAll() {
        this._selectStart = 0;
        this._selectEnd = this._digits.length - 1;
        if ( this._selectEnd < 0 )
            this._selectEnd = 0;
        this._indexToken = 0;
    }

    /**
     * Clean up the value of the digit
     */
    RAZ() {
        this._selectStart = -1;
        this._selectEnd = -1;
        this._indexToken = 0;
        this.Value = "";
    }

    /**
     * Duplicate the digit object
     * @returns {any} a new instance of the current object
     */
    clone() {
        let newDigit = new Digits.Digits( this._format, this._separator );
        newDigit._handleUndo = false;
        newDigit.Value = this.Value;
        newDigit._handleUndo = true;
        return newDigit;
    }

    /**
     * Constructor
     * @param {String} format    of the mask to parse and read
     * @param {String} separator separation of the left and right part
     */
    constructor( format, separator ) {
        format = String.isEmptyOrWhiteSpaces( format ) ? "" : format;

        this._format = format;
        this._digits = [];
        this._error = false;
        this._separator = separator;
        this._indexSeparator = -1;

        // Set the value

        this._allowNegativeValue = false;
        this._selectStart = -1;
        this._selectEnd = -1;
        this._indexToken = -1;

        // Undo stack

        this._undo = [];
        this._handleUndo = true;

        // Set the format

        this.setFormat( format, separator );
    }
};

/**
 * Handle formatting decimal values
 */
Digits.Decimal = class extends Digits.Digits {
    /**
     * @returns {number} Epsilon value
     */
    static get EPSILON() {
        return 0.00001;
    }

    /**
     * Check if the value is equal to 0 (include between -Epsilon and +Epsilon)
     * @param {float} value
     */
    static IsZero( value ) {
        return -Digits.Decimal.EPSILON < value && value < Digits.Decimal.EPSILON;
    }

    /**
     * @returns {string} the type of the current digit format
     */
    get Type() {
        return "decimal";
    }

    /**
     * @param {any} value value to set into the dialog box
     */
    set Value( value ) {
        if ( typeof value === "number" )
            value = value.toFixed( this._nbDigitAfter ).toString().replace( ".", "," );
        else if ( !String.isEmptyOrWhiteSpaces( value ) )
            value = value.trim().replace( /\./g, "" );
        else
            value = null;

        if ( value !== null && value.startsWith( "-" ) ) {
            this._negative = true;
            value = value.substr( 1 );
        } else {
            this._negative = false;
        }

        super.Value = value;
    }

    /**
     * @returns {any} value selected into the dialog box
     */
    get Value() {
        let value = super.Value;

        if ( value === null )
            return value;

        if ( this._negative )
            return - String.parseFloat( value.trim() );

        return String.parseFloat( value.trim() );
    }

    /**
     * @return {number} number of digits before the coma
     */
    get NbDigitBefore() {
        return this._nbDigitBefore;
    }

    /**
     * @return {number} number of digits after the coma
     */
    get NbDigitAfter() {
        return this._nbDigitAfter;
    }

    /**
     * @returns {string} value matching within the given format
     */
    toString() {
        let value = super.toString().replace( /^[ .]*/, "" ).replace( /,$/, "" );

        if ( this._negative )
            value = "-" + value;

        return value;
    }

    /**
     * Update the value on depends on the key
     * @param {any} key key to implement ("undo", "next", or any other character)
     */
    addKey( key ) {
        if ( key === "minus" && this.AllowNegativeValue ) {
            this._negative = !this._negative;
            return this;
        }

        return super.addKey( key === "." ? "," : key );
    }

    /**
     * Duplicate the digit object
     * @returns {any} a new instance of the current object
     */
    clone() {
        let newDigit = new Digits.Decimal( this._nbDigitBefore, this._nbDigitAfter );
        newDigit.Value = this.Value;
        return newDigit;
    }

    /**
     * Constructor
     * @param {any} nbDigitBefore number of digits just before the coma (by default 6)
     * @param {any} nbDigitAfter  number of digits just after the coma (by default 0)
     */
    constructor( nbDigitBefore, nbDigitAfter ) {
        nbDigitBefore = nbDigitBefore === null || nbDigitBefore === undefined || nbDigitBefore <= 0 ? 6 : nbDigitBefore;
        nbDigitAfter = nbDigitAfter === null || nbDigitAfter === undefined || nbDigitAfter <= 0 ? 0 : nbDigitAfter;

        // Create a format dedicated to a number

        let integerPart = "".padEnd( nbDigitBefore - 1, "_" ) + "0";
        let i = integerPart.length % 3;
        if ( i === 0 )
            i += 3;
        let format = integerPart.substr( 0, i );
        while ( i < integerPart.length ) {
            format += "." + integerPart.substr( i, 3 );
            i += 3;
        }
        if ( nbDigitAfter > 0 )
            format += ",".padEnd( nbDigitAfter + 1, "0" );

        super( format, nbDigitAfter > 0 ? "," : "\0" );

        this._negative = false;
        this._nbDigitBefore = nbDigitBefore;
        this._nbDigitAfter = nbDigitAfter;
    }
};

/**
 * Handle formatting numerical values (put space of special character ... but the value doesn't contain it)
 * For example : N° Securite Social : 0 00 00 00 000 000 00 (in reality, you need 13 digits ... not space)
 */
Digits.Mask = class extends Digits.Digits {
    /**
     * @returns {string} the type of the current digit format
     */
    get Type() {
        return "mask";
    }

    /**
     * Duplicate the digit object
     * @returns {any} a new instance of the current object
     */
    clone() {
        let newDigit = new Digits.Mask( this.getFormat(), this._separator );
        newDigit.Value = this.Value;
        return newDigit;
    }

    /**
     * Constructor
     * @param {any} format format to apply
     */
    constructor( format, separator ) {
        super( format, separator );
    }
};

/**
 * Handle a sequence value
 */
Digits.Sequence = class extends Digits.Digits {
    /**
     * @returns {string} the type of the current digit format
     */
    get Type() {
        return "sequence";
    }

    /**
     * Duplicate the digit object
     * @returns {any} a new instance of the current object
     */
    clone() {
        let newDigit = new Digits.Sequence( this._key, this._length );
        newDigit.Value = this.Value;
        return newDigit;
    }

    /**
     * Constructor
     * @param {any} key prefix of the value (ex: OF0001)
     * @param {any} length length of the sequence
     */
    constructor( key, length ) {
        super( key + "".padEnd( length, "0" ), "\0" );

        this._key = key;
        this._length = length;
    }
};

/**
 * Handle formatting date time values
 */
Digits.Datetime = class extends Digits.Digits {
    /**
     * @returns {string} the type of the current digit format
     */
    get Type() {
        let date = /(.*(DD|MM|YYYY))+/.test( this._dateFormat );
        let time = /(.*(HH|mm|ss|SSS))+/.test( this._dateFormat );
        return ( date ? "date" : "" ) + ( time ? "time" : "" );
    }

    /**
     * @returns {boolean} true if the current position in the digit is a calendar or not
     */
    get IsCalendar() {
        for ( let groupBy of this._groupBy ) {
            if ( groupBy[2] <= this._indexToken && this._indexToken <= groupBy[2] + groupBy[1].length && ( groupBy[0] === 'YYYY' || groupBy[0] === 'MM' || groupBy[0] === 'DD' ) )
                return true;
        }

        return false;
    }

    /**
     * Set the format expected into the input digit box (YYYY, MM, DD, HH, mm, ss, SSS)
     * @param {string} format format to set (if null, restore the default format)
     */
    setFormat( format ) {
        this._groupBy = [];
        this._webixFormat = "";
        this._webixType = 0;
        super.setFormat( format );
    }

    /**
     * @returns {string} date time format expected
     */
    getFormat() {
        return String.isEmptyOrWhiteSpaces( this._dateFormat ) ? "DD/MM/YYYY HH:mm:ss" : this._dateFormat;
    }

    /**
     * @returns {string} format compatible within Webix component
     */
    get WebixFormat() {
        return this._webixFormat;
    }

    /**
     * @returns {string} type of the webix component
     */
    get WebixType() {
        switch ( this._webixType ) {
            case 1:
                return "year";

            case 2:
            case 3:
                return "month";

            case 6:
            case 7:
                return "day";
        }

        return null;
    }

    /**
     * @return {string} null or the type of the field into the current index
     */
    get CurrentType() {
        for ( let groupBy of this._groupBy ) {
            if ( groupBy[2] <= this._indexToken && this._indexToken < groupBy[2] + groupBy[1].length )
                return groupBy[0];
        }

        return null;
    }

    /**
     * @param {any} value value to set into the dialog box
     */
    set Value( value ) {
        if ( value instanceof Date )
            value = moment( value.toString() ).format( this._format );

        if ( value instanceof moment )
            value = value.format( this._dateFormat );

        // set the value

        super.Value = value;

        // update value to be in correct interval

        for ( let groupBy of this._groupBy ) {
            let value = "";
            let pos = groupBy[2];
            let j = 0;

            for ( j = 0; j < groupBy[1].length; j++, pos++ ) {
                let digit = groupBy[1][j];
                if ( !digit.IsNull )
                    value += digit.Value;
            }

            if ( ( value.length === j ) ||
                ( pos >= this._digits.length && !this._digits[this._digits.length - 1].IsNull ) ||
                ( pos < this._digits.length && !this._digits[pos].IsNull ) )
                this.setValue( groupBy, String.isEmptyOrWhiteSpaces( value ) ? 0 : String.parseInt( value ) );
        }
    }

    /**
     * @returns {any} value selected into the dialog box
     */
    get Value() {
        let value = this.toString();

        if ( String.isEmptyOrWhiteSpaces( value ) )
            return null;

        let newDate = new moment( value, this._dateFormat, true );
        if ( !newDate.isValid() ) {
            this._error = true;
            return null;
        }

        return newDate;
    }

    /**
     * Set a value to a given type
     * @param {any} groupBy [ (YYYY, MM, ....), digits[], posStart, [min ,max] ]
     * @param {int} value  value to set
     * @returns {boolean} true if the value is updated
     */
    setValue( groupBy, value ) {
        if ( value === null || value === undefined )
            return -1;

        let minValue = groupBy[3][0];
        let maxValue = groupBy[3][1];

        if ( value < minValue )
            value = minValue;
        if ( value > maxValue )
            value = maxValue;

        let str = value.toString().padStart( groupBy[1].length, "0" );

        for ( let i = 0; i < groupBy[1].length; i++ )
            groupBy[1][i].Value = str[i];

        return groupBy[2] + groupBy[1].length;
    }

    /**
     * Set the date into the digits and put the token on the next element
     * @param {any} day new day of the month
     * @param {any} month new month
     * @param {any} year new year
     */
    setDate( day, month, year ) {
        let index = 0;

        for ( let groupBy of this._groupBy ) {
            let newIndex = 0;

            switch ( groupBy[0] ) {
                case "DD":
                    newIndex = this.setValue( groupBy, day );
                    break;
                case "MM":
                    newIndex = this.setValue( groupBy, month );
                    break;
                case "YYYY":
                    newIndex = this.setValue( groupBy, year );
                    break;
            }

            if ( index < newIndex )
                index = newIndex;
        }

        this.IndexToken = index;
    }

    /**
     * Set the time into the digits and put the token on the next element
     * @param {any} hour new hour
     * @param {any} minute new minute
     * @param {any} second new second
     * @param {any} millisecond new millisecond
     */
    setTime( hour, minute, second, millisecond ) {
        let index = 0;

        for ( let groupBy of this._groupBy ) {
            let newIndex = 0;

            switch ( groupBy[0] ) {
                case "HH":
                    newIndex = this.setValue( groupBy, hour );
                    break;
                case "mm":
                    newIndex = this.setValue( groupBy, minute );
                    break;
                case "SS":
                    newIndex = this.setValue( groupBy, second );
                    break;
                case "sss":
                    newIndex = this.setValue( groupBy, millisecond );
                    break;
            }

            if ( index < newIndex )
                index = newIndex;
        }

        this.IndexToken = index;
    }

    /**
     * (protected methode) Parse a token of the format
     * @param {Array}  digits array of tokens to set (the first one is already set)
     * @param {string} format format to parse
     * @param {int}    index  current position in the format to parse
     * @returns {int} the position of the next token
     */
    getToken( digits, format, index ) {
        let types = ["YYYY", "MM", "DD", "HH", "mm", "ss", "SSS"];
        let webixType = ["%Y", "%m", "%d", "%H", "%i", "%s", "%S"];
        let webixCode = [1, 2, 4, 0, 0, 0, 0];
        let intervals = [[1900, 2099], [1, 12], [1, 31], [0, 23], [0, 59], [0, 59], [0, 999]];

        let i = types.indexOf( format.substr( index, 4 ) );
        if ( i < 0)
            i = types.indexOf( format.substr( index, 3 ) );
        if ( i < 0 )
            i = types.indexOf( format.substr( index, 2 ) );
        if ( i >= 0 ) {
            let digit = digits[0];

            // Build an array of digits

            digit.Token = '[0-9]';
            digit.Mark = '_';

            for ( let j = 1; j < types[i].length; j++ ) {
                let digit = new Digits.Digit();
                digits.push( digit );
                digit.Token = '[0-9]';
                digit.Mark = '_';
            }

            this._groupBy.push( [types[i], digits, this._digits.length, intervals[i]] );

            this._webixFormat += webixType[i];
            this._webixType |= webixCode[i];

            return index + types[i].length;
        }

        let result = super.getToken( digits, format, index );
        this._webixFormat += digits[0].DefaultValue;
        return result;
    }

    /**
     * Duplicate the digit object
     * @returns {any} a new instance of the current object
     */
    clone() {
        let newDigit = new Digits.Datetime( this._formatDefault );
        newDigit.Value = this.Value;
        return newDigit;
    }

    /**
     * Constructor
     * @param {any} format datetime format (YYYY, MM, DD, HH, mm, ss, SSS)
     */
    constructor( format ) {
        let formatConverted = String.isEmptyOrWhiteSpaces( format ) ? "DD/MM/YYYY HH:mm:ss" : format;

        switch ( formatConverted.toLowerCase() ) {
            case "date":
                formatConverted = "DD/MM/YYYY";
                break;
            case "time":
                formatConverted = "HH:mm";
                break;
            case "datetime":
                formatConverted = "DD/MM/YYYY HH:mm";
                break;
        }

        super( "" );

        this._dateFormat = formatConverted;
        this._groupBy = [];
        this._webixFormat = "";
        this._webixType = 0;

        this.setFormat( formatConverted );
    }
};
