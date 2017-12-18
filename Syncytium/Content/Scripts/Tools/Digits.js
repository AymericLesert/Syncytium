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

var Digits = {};

/**
 * Handle digit features
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

        match = format.match( /^\_*0+(\,0+){0,1}$/ );
        if ( match !== null )
            return new Digits.Decimal( match[0].length - ( match[1] === undefined ? 0 : match[1].length ), match[1] === undefined ? 0 : match[1].length - 1 );

        // Sequence

        match = format.match( /^\D+(0+)$/ );
        if ( match !== null )
            return new Digits.Sequence( match[0].substr( 0, match[0].length - match[1].length ), match[1].length );

        // Mask

        match = format.match( /^((\W*)([\_0]+))+$/ );
        if ( match !== null )
            return new Digits.Mask( format );

        // Date time

        let newDigit = new Digits.Datetime( format );
        if ( newDigit.IsDateTime )
            return newDigit;

        return null;
    }

    /**
     * @returns {string} the type of the current digit format
     */
    get Type() {
        return "digit";
    }

    /**
     * Set the format expected into the input digit box (0 or _ means numerical and any other characters fix values)
     * Ex: 000,00 - OF0000 - 00:00:00 - _____0,0
     * @param {string} format format to set (if null, restore the default format) -  (YYYY, MM, DD, HH, mm, ss, SSS)
     */
    set Format( format ) {
        format = String.isEmptyOrWhiteSpaces( format ) ? this._formatDefault : format;

        this._tokenFormat = [];

        // parse format

        let i = 0;
        while ( i < format.length ) {
            let newToken = { fix: "", format: "", type: "", digits: "", value: 0 };

            while ( i < format.length && format[i] !== '0' && format[i] !== '_' ) {
                newToken.fix += format[i];
                i++;
            }

            while ( i < format.length && ( format[i] === '0' || format[i] === '_' ) ) {
                newToken.format += format[i];
                i++;
            }

            this._tokenFormat.push( newToken );
        }

        this._indexToken = null;
        this._format = format;
    }

    /**
     * @returns {string} format expected
     */
    get Format() {
        return this._format;
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
        return String.isEmptyOrWhiteSpaces( this._value );
    }

    /**
     * @param {any} value value to set into the dialog box
     */
    set Value( value ) {
        this._tokenFormat = this.parseValue( value === null || value === undefined ? null : value );
        this._value = this.formatValue();

        if ( !this._raz ) {
            this._indexToken = null;
            this._undo = [];
        }
    }

    /**
     * @returns {any} value selected into the dialog box
     */
    get Value() {
        return this._value;
    }

    /**
     * @returns {boolean} true if the negative value is possible
     */
    get AllowNegativeValue() {
        return this._allowNegativeValue;
    }

    /**
     * @returns {string} value matching within the given format
     */
    toString() {
        return this._value;
    }

    /**
     * (Protected method) update the index token
     * @param {int} indexToken new value
     */
    set IndexToken( indexToken ) {
        indexToken = indexToken === null || indexToken === undefined ? 0 : indexToken;

        if ( indexToken < 0 || this._tokenFormat.length === 0 )
            this._indexToken = 0;
        else if ( indexToken >= this._tokenFormat.length )
            this._indexToken = this._tokenFormat.length - 1;
        else
            this._indexToken = indexToken;
    }

    /**
     * @returns {any} current index into the token
     */
    get IndexToken() {
        return this._indexToken;
    }

    /**
     * @returns {boolean} true if the undo stack is not empty
     */
    get HasUndo() {
        return this._undo.length > 0;
    }

    /**
     * @returns {string} null if nothing, else the fix value of the next token
     */
    get NextTokenFix() {
        return this._indexToken < this._tokenFormat.length - 1 ? this._tokenFormat[this._indexToken + 1].fix : null;
    }

    /**
     * (Virtual Method) update token from the value before formatting value as expected
     * @param {any} token list of tokens of the value setting
     * @param {any} tokenIndex current index of the token
     * @returns {{token: number, index: any}} token updated
     */
    updateToken( token ) {
        return token;
    }

    /**
     * (Private method) parse the value and build a list of tokens
     * @param {any} value value to parse before setting it to the dialog box
     * @returns {any} token updated
     */
    parseValue( value ) {
        let tokenFormat = [];
        let tokenValue = [];
        let i = 0;
        let j = 0;

        // Retrieve the current format

        for ( i = 0; i < this._tokenFormat.length; i++ )
            tokenFormat.push( { fix: this._tokenFormat[i].fix, format: this._tokenFormat[i].format, type: this._tokenFormat[i].type, digits: "", value: 0 } );

        // parse value

        if ( typeof value === "number" )
            value = value.toString();
        else
            value = String.isEmptyOrWhiteSpaces( value ) ? "" : value.toString();

        i = 0;
        while ( i < value.length ) {
            let newToken = { fix: "", digits: "" };

            while ( i < value.length && ( value[i] < '0' || value[i] > '9' ) ) {
                newToken.fix += value[i];
                i++;
            }

            while ( i < value.length && '0' <= value[i] && value[i] <= '9' ) {
                newToken.digits += value[i];
                i++;
            }

            tokenValue.push( newToken );
        }

        if ( tokenValue.length > 0 && String.isEmptyOrWhiteSpaces( tokenValue[0].fix ) )
            tokenValue[0].fix = this._tokenFormat[0].fix;

        // match format and value

        i = 0;
        j = 0;
        while ( i < tokenFormat.length && j < tokenValue.length ) {
            while ( i < tokenFormat.length && j < tokenValue.length && tokenFormat[i].fix !== tokenValue[j].fix ) {
                i++;
            }

            if ( i < tokenFormat.length && j < tokenValue.length ) {
                tokenFormat[j].digits = tokenValue[j].digits;
                tokenFormat[j].value = parseInt( String.isEmptyOrWhiteSpaces( tokenValue[j].digits ) ? "0" : tokenValue[j].digits );
            }

            i++;
            j++;
        }

        // update token on depends on the needs

        return this.updateToken( tokenFormat );
    }

    /**
     * Parse the value and format it on depends on the expected format
     * @param {any} value value to format
     * @returns {string} value formatted
     */
    formatValue( value ) {
        // update token on depends on the needs

        let tokenFormat = String.isEmptyOrWhiteSpaces( value ) ? this._tokenFormat : this.parseValue( value );

        // rebuild the format as expected

        value = "";
        for ( let i = 0; i < tokenFormat.length; i++ ) {
            if ( tokenFormat[i].format.length === 0 ) {
                value += tokenFormat[i].fix;
            } else {
                let digits = tokenFormat[i].value.toString();
                let prefix = "";

                if ( digits.length > tokenFormat[i].format.length ) {
                    digits = digits.substr( digits.length - tokenFormat[i].format.length, tokenFormat[i].format.length );
                } else {
                    for ( let j = 0; j < tokenFormat[i].format.length - digits.length; j++ )
                        prefix += tokenFormat[i].format[j] === '0' ? '0' : ' ';
                }

                value += tokenFormat[i].fix + prefix + digits;
            }
        }

        return value;
    }

    /**
     * Add the current tokens into the undo stack
     */
    pushUndo() {
        if ( this._indexToken === null ) {
            for ( this._indexToken = 0; this._indexToken < this._tokenFormat.length && this._tokenFormat[this._indexToken].digits.length === this._tokenFormat[this._indexToken].format.length; this._indexToken++ );
            if ( this._indexToken >= this._tokenFormat.length )
                this._indexToken = this._tokenFormat.length - 1;
        }

        let token = { indexToken: this._indexToken, tokens: [] };
        for ( let i = 0; i < this._tokenFormat.length; i++ )
            token.tokens.push( { fix: this._tokenFormat[i].fix, format: this._tokenFormat[i].format, type: this._tokenFormat[i].type, digits: this._tokenFormat[i].digits, value: this._tokenFormat[i].value } );

        if ( this._undo.length > 0 ) {
            let lastToken = this._undo[this._undo.length - 1];
            let isEqual = token.indexToken === lastToken.indexToken;

            for ( let i = 0; i < lastToken.tokens.length && isEqual; i++ ) {
                if ( lastToken.tokens[i].fix !== token.tokens[i].fix ||
                    lastToken.tokens[i].format !== token.tokens[i].format ||
                    lastToken.tokens[i].type !== token.tokens[i].type ||
                    lastToken.tokens[i].digits !== token.tokens[i].digits ||
                    lastToken.tokens[i].value !== token.tokens[i].value )
                    isEqual = false;
            }

            if ( isEqual )
                return;
        }

        this._undo.push( token );
    }

    /**
     * Restore the last value
     */
    popUndo() {
        if ( this._undo.length === 0 )
            return;

        let token = this._undo.pop();

        this._tokenFormat = [];
        for ( let i = 0; i < token.tokens.length; i++ )
            this._tokenFormat.push( { fix: token.tokens[i].fix, format: token.tokens[i].format, type: token.tokens[i].type, digits: token.tokens[i].digits, value: token.tokens[i].value } );

        this._value = this.formatValue();
        this._indexToken = token.indexToken;
    }

    /**
     * Update the value on depends on the key
     * @param {any} key key to implement ("undo", "next", or any other character)
     */
    addKey( key ) {
        if ( this._indexToken === null || key === "raz" ) {
            this.pushUndo();

            for ( let i = 0; i < this._tokenFormat.length; i++ ) {
                this._tokenFormat[i].digits = "";
                this._tokenFormat[i].value = 0;
            }

            this._indexToken = 0;
        }

        if ( key === "raz" ) {
            this._value = this.formatValue();
            return;
        }

        if ( key === "next" ||
            this._indexToken < this._tokenFormat.length - 1 && this._tokenFormat[this._indexToken + 1].fix === key ) {
            this.pushUndo();

            if ( this._indexToken < this._tokenFormat.length - 1 )
                this._indexToken++;

            this._value = this.formatValue();
            return;
        }

        if ( key === "undo" ) {
            this.popUndo();
            if ( this._undo.length === 0 )
                this.selectAll();
            return;
        }

        if ( key < '0' || key > '9' )
            return;

        let i = 0;
        for ( i = 0; i < this._tokenFormat.length && this._tokenFormat[i].format.length === this._tokenFormat[i].digits.length; i++ );
        if ( i === this._tokenFormat.length )
            return;

        this.pushUndo();

        this._tokenFormat[this._indexToken].digits += key;
        this._tokenFormat[this._indexToken].value = parseInt( String.isEmptyOrWhiteSpaces( this._tokenFormat[this._indexToken].digits ) ? "0" : this._tokenFormat[this._indexToken].digits );
        this.updateToken( this._tokenFormat );

        this._value = this.formatValue();
    }

    /**
     * The first key added, remove all existing values
     */
    selectAll() {
        this._tokenFormat = this.parseValue( this._value );
        this._value = this.formatValue();

        this._indexToken = null;
        this._undo = [];
    }

    /**
     * Clean up the content of the object
     */
    RAZ() {
        this.pushUndo();

        this._raz = true;
        this.Value = null;
        this._raz = false;

        this._indexToken = 0;
    }

    /**
     * Duplicate the digit object
     * @returns {any} a new instance of the current object
     */
    clone() {
        let newDigit = new Digits.Digits( this._formatDefault );
        newDigit.Value = this.Value;
        newDigit._allowNegativeValue = this._allowNegativeValue;
        return newDigit;
    }

    /**
     * Constructor
     * @param {string} format format of the digit to read
     */
    constructor( format ) {
        this._value = null;
        this._format = null;
        this._tokenFormat = null;
        this._indexToken = null;
        this._undo = [];
        this._formatDefault = String.isEmptyOrWhiteSpaces( format ) ? "000000000" : format;
        this._raz = false;
        this._allowNegativeValue = false;

        this.Format = this._formatDefault;
        this.Value = null;
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
     * @param {any} value
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
            value = value.trim();

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
     * @returns {boolean} true if the negative value is possible
     */
    get AllowNegativeValue() {
        return super.AllowNegativeValue;
    }

    /**
     * @param {boolean} value true if the negative value is possible
     */
    set AllowNegativeValue( value ) {
        this._allowNegativeValue = value === null || value === undefined || value === true;
    }

    /**
     * @returns {string} value matching within the given format
     */
    toString() {
        if ( this._value === null )
            return "";

        let components = this._value.trim().split( "," );
        let integerPart = parseInt( components[0] );

        let newValue = "";
        if ( integerPart >= 1000000 ) {
            newValue += ( ( integerPart - integerPart % 1000000 ) / 1000000).toString() + ".";
            integerPart = integerPart % 1000000;
            newValue += ( ( integerPart - integerPart % 1000 ) / 1000 ).toString().padStart( 3, "0" ) + ".";
            integerPart = integerPart % 1000;
            newValue += integerPart.toString().padStart( 3, "0" );
        } else if ( integerPart >= 1000 ) {
            newValue += ( ( integerPart - integerPart % 1000 ) / 1000 ).toString() + ".";
            integerPart = integerPart % 1000;
            newValue += integerPart.toString().padStart( 3, "0" );
        } else {
            newValue = integerPart.toString();
        }

        if ( components.length > 1 )
            newValue += "," + components[1];

        if ( this._negative )
            return "-" + newValue;

        return newValue;
    }

    /**
     * Update the value on depends on the key
     * @param {any} key key to implement ("undo", "next", or any other character)
     */
    addKey( key ) {
        if ( key === "minus" && this._allowNegativeValue ) {
            this._negative = !this._negative;
            return;
        }

        super.addKey( key === "." ? "," : key );
    }

    /**
     * Update token from the value before formatting value as expected
     * @param {any} token list of tokens of the value setting
     * @returns {any} token updated
     */
    updateToken( token ) {
        if ( token.length > 1 && this._nbDigitAfter !== undefined ) {
            let digit = token[1].digits.padEnd( this._nbDigitAfter, "0" );
            if ( digit.length > token[1].format.length ) {
                digit = digit.substr( 0, token[1].format.length );
                token[1].digits = digit;
            }
            token[1].value = parseInt( digit );
        }

        if ( token[0].digits.length > token[0].format.length ) {
            token[0].digits = token[0].digits.substr( token[0].digits.length - token[0].format.length, token[0].format.length );
            token[0].value = parseInt( token[0].digits );
        }

        return token;
    }

    /**
     * Add the current tokens into the undo stack
     */
    pushUndo() {
        super.pushUndo();

        if ( this._undo.length === 0 )
            return;

        let lastToken = this._undo[this._undo.length - 1];

        if ( lastToken.indexToken < lastToken.tokens.length - 1 || lastToken.tokens[lastToken.indexToken].digits.length < lastToken.tokens[lastToken.indexToken].format.length )
            return;

        this._undo.pop();
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

        let format = "";
        for ( let i = 0; i < nbDigitBefore - 1; i++ )
            format += "_";
        format += "0";
        if ( nbDigitAfter > 0 ) {
            format += ",";
            for ( let i = 0; i < nbDigitAfter; i++ )
                format += "0";
        }

        super( format );

        this._negative = false;
        this._nbDigitBefore = nbDigitBefore;
        this._nbDigitAfter = nbDigitAfter;
        this.Value = null;
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
     * @returns {boolean} true if the value stored into the digit is like NULL
     */
    get IsNull() {
        if ( super.IsNull )
            return true;

        return super.Value === this._formatDefault;
    }

    /**
     * @param {any} value value to set into the dialog box
     */
    set Value( value ) {
        if ( String.isEmptyOrWhiteSpaces( value ) ) {
            super.Value = value;
            return;
        }

        let newValue = "";
        for ( let i = 0; i < this._tokenFormat.length && value.length > 0; i++ ) {
            if ( this._tokenFormat[i].format.length > 0 ) {
                let digits = value.substr( 0, this._tokenFormat[i].format.length );
                value = value.substr( this._tokenFormat[i].format.length );
                newValue += this._tokenFormat[i].fix + digits;
            }
        }

        super.Value = newValue;
    }

    /**
     * @returns {any} value selected into the dialog box
     */
    get Value() {
        let value = "";

        for ( let i = 0; i < this._tokenFormat.length; i++ ) {
            if ( this._tokenFormat[i].format.length > 0 ) {
                let digits = this._tokenFormat[i].value.toString();
                let prefix = "";

                if ( digits.length > this._tokenFormat[i].format.length ) {
                    digits = digits.substr( digits.length - this._tokenFormat[i].format.length, this._tokenFormat[i].format.length );
                } else {
                    for ( let j = 0; j < this._tokenFormat[i].format.length - digits.length; j++ )
                        prefix += this._tokenFormat[i].format[j] === '0' ? '0' : ' ';
                }

                value += prefix + digits;
            }
        }

        return value;
    }

    /**
     * Update token from the value before formatting value as expected
     * @param {any} token list of tokens of the value setting
     * @returns {any} token updated
     */
    updateToken( token ) {
        let index = this.IndexToken;

        if ( index === null )
            return token;

        let currentToken = token[index];

        if ( currentToken.digits.length <= currentToken.format.length ) {
            currentToken.value = parseInt( currentToken.digits.padEnd( currentToken.format.length, "0" ) );
            return token;
        }

        let currentValue = currentToken.digits.substr( 0, currentToken.format.length );
        let nextValue = currentToken.digits.substr( currentToken.format.length );

        currentToken.digits = currentValue;
        currentToken.value = parseInt( currentValue );

        if ( index >= token.length - 1 )
            return token;

        currentToken = token[index + 1];

        currentToken.digits = nextValue;
        currentToken.value = parseInt( nextValue.padEnd( currentToken.format.length, "0" ) );

        this.IndexToken = index + 1;

        return token;
    }

    /**
     * Add the current tokens into the undo stack
     */
    pushUndo() {
        super.pushUndo();

        if ( this._undo.length === 0 )
            return;

        let lastToken = this._undo[this._undo.length - 1];

        if ( lastToken.indexToken < lastToken.tokens.length - 1 || lastToken.tokens[lastToken.indexToken].digits.length < lastToken.tokens[lastToken.indexToken].format.length )
            return;

        this._undo.pop();
    }

    /**
     * Duplicate the digit object
     * @returns {any} a new instance of the current object
     */
    clone() {
        let newDigit = new Digits.Mask( this._formatDefault );
        newDigit.Value = this.Value;
        return newDigit;
    }

    /**
     * Constructor
     * @param {any} format format to apply
     */
    constructor( format ) {
        super( format );
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
        super( key + "".padEnd( length, "0" ) );

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
        return "datetime";
    }

    /**
     * @returns {boolean} true if the current position in the digit is a calendar or not
     */
    get IsCalendar() {
        let index = this._indexToken === null ? 0 : this._indexToken;

        let token = this._tokenFormat[index];
        if ( token === null || token === undefined )
            return false;

        let type = this.CurrentType;
        return ( type === 'YYYY' || type === 'MM' || type === 'DD' ) && this.WebixType !== null;
    }

    /**
     * @returns {boolean} true if the format matches within a date or a time
     */
    get IsDateTime() {
        let types = ["YYYY", "MM", "DD", "HH", "mm", "ss", "SSS"];

        for ( let i = 0; i < this._tokenFormat.length; i++ ) {
            if ( types.indexOf( this._tokenFormat[i].type ) >= 0 )
                return true;
        }

        return false;
    }

    /**
     * Set the format expected into the input digit box (YYYY, MM, DD, HH, mm, ss, SSS)
     * @param {string} format format to set (if null, restore the default format)
     */
    set Format( format ) {
        let types = [ "YYYY", "MM", "DD", "HH", "mm", "ss", "SSS" ];

        format = String.isEmptyOrWhiteSpaces( format ) ? this._formatDefault : format;

        this._tokenFormat = [];

        // parse format

        let i = 0;
        let newToken = { fix: "", format: "", type: "", digits: "", value: 0 };
        while ( i < format.length ) {
            let j = 0;

            for ( j = 0; j < types.length && format.substr( i, types[j].length ) !== types[j]; j++ );

            if ( j < types.length ) {
                newToken.type = types[j];
                newToken.format = "".padEnd( types[j].length, "_" );
                i += types[j].length;
                this._tokenFormat.push( newToken );
                newToken = { fix: "", format: "", type: "", digits: "", value: 0 };
            } else {
                newToken.fix += format[i];
                i++;
            }
        }

        if ( !String.isEmptyOrWhiteSpaces( newToken.fix ) )
            this._tokenFormat.push( newToken );

        this._format = format;
        this._indexToken = null;
    }

    /**
     * @returns {string} format expected
     */
    get Format() {
        return this._format;
    }

    /**
     * @returns {string} format compatible within Webix component
     */
    get WebixFormat() {
        let types = ["YYYY", "MM", "DD", "HH", "mm", "ss", "SSS"];
        let webixType = ["%Y", "%m", "%d", "%H", "%i", "%s", "%S"];

        let format = "";
        for ( let i = 0; i < this._tokenFormat.length; i++ ) {
            format += this._tokenFormat[i].fix;

            let index = types.indexOf( this._tokenFormat[i].type );
            if ( index >= 0 ) {
                format += webixType[index];
            } else {
                format += "".padEnd(this._tokenFormat[i].format.length, " ");
            }
        }

        return format;
    }

    /**
     * @returns {string} type of the webix component
     */
    get WebixType() {
        let types = ["YYYY", "MM", "DD"];
        let webixType = [1, 2, 4];

        let type = 0;
        for ( let i = 0; i < this._tokenFormat.length; i++ ) {
            let index = types.indexOf( this._tokenFormat[i].type );
            if ( index >= 0 )
                type |= webixType[index];
        }

        if ( type === 1 )
            return "year";

        if ( type === 2 || type === 3 )
            return "month";

        if ( type === 6 || type === 7 )
            return "day";

        return null;
    }

    /**
     * @return {string} null or the type of the field into the current index
     */
    get CurrentType() {
        let index = this._indexToken === null ? 0 : this._indexToken;
        let token = index < this._tokenFormat.length ? this._tokenFormat[index] : null;

        if ( token === null )
            return null;

        if ( token.digits.length >= token.format.length && index < this._tokenFormat.length - 1 )
            token = this._tokenFormat[index + 1];

        return token.type;
    }

    /**
     * @param {any} value value to set into the dialog box
     */
    set Value( value ) {
        if ( value instanceof Date )
            value = moment( value.toString() ).format( this._format );

        if ( value instanceof moment )
            value = value.format( this._format );

        super.Value = value;
    }

    /**
     * @returns {any} value selected into the dialog box
     */
    get Value() {
        for ( let i = 0; i < this._tokenFormat.length; i++ ) {
            let token = this._tokenFormat[i];

            if ( ( token.type === 'YYYY' || token.type === 'MM' || token.type === 'DD' ) && token.digits.length !== token.format.length )
                return null;
        }

        let value = super.Value;

        if ( String.isEmptyOrWhiteSpaces( value ) )
            return null;

        let newDate = new moment( value, this._format, true );
        return newDate.isValid() ? newDate : null;
    }

    /**
     * @returns {string} Replace some '0' by '_' 
     */
    toString() {
        let value = "";

        for ( let i = 0; i < this._tokenFormat.length; i++ ) {
            if ( this._tokenFormat[i].format.length === 0 ) {
                value += this._tokenFormat[i].fix;
            } else {
                let digits = this._tokenFormat[i].digits;

                if ( digits.length > this._tokenFormat[i].format.length ) {
                    digits = digits.substr( 0, this._tokenFormat[i].format.length );
                } else {
                    digits = digits.padEnd( this._tokenFormat[i].format.length, "_" );
                }

                value += this._tokenFormat[i].fix + digits;
            }
        }

        return value;
    }

    /**
     * Parse the value and format it on depends on the expected format
     * @param {any} value value to format
     * @returns {string} value formatted
     */
    formatValue( value ) {
        // update token on depends on the needs

        let tokenFormat = String.isEmptyOrWhiteSpaces( value ) ? this._tokenFormat : this.parseValue( value );

        // rebuild the format as expected

        value = "";
        for ( let i = 0; i < tokenFormat.length; i++ ) {
            if ( tokenFormat[i].format.length === 0 ) {
                value += tokenFormat[i].fix;
            } else {
                let digits = tokenFormat[i].value.toString();
                let prefix = "";

                if ( digits.length > tokenFormat[i].format.length ) {
                    digits = digits.substr( digits.length - tokenFormat[i].format.length, tokenFormat[i].format.length );
                } else {
                    for ( let j = 0; j < tokenFormat[i].format.length - digits.length; j++ )
                        prefix += '0';
                }

                value += tokenFormat[i].fix + prefix + digits;
            }
        }

        return value;
    }

    /**
     * Set a value to a given type
     * @param {any} type   YYYY, MM, ....
     * @param {any} value  value to set
     * @param {any} minValue minimum value
     * @param {any} maxValue maximum value
     * @returns {number} the index token updated
     */
    setValue( type, value, minValue, maxValue ) {
        if ( value === null || value === undefined )
            return -1;

        for ( let i = 0; i < this._tokenFormat.length; i++ ) {
            if ( this._tokenFormat[i].type === type ) {
                if ( value < minValue )
                    value = minValue;
                if ( value > maxValue )
                    value = maxValue;
                this._tokenFormat[i].value = value;
                this._tokenFormat[i].digits = value.toString().padStart( this._tokenFormat[i].format.length, "0");
                return i;
            }
        }

        return -1;
    }

    /**
     * Set the date into the digits and put the token on the next element
     * @param {any} day new day of the month
     * @param {any} month new month
     * @param {any} year new year
     */
    setDate( day, month, year ) {
        let maxIndexToken = 0;
        let currentIndexToken = 0;
        let hasToken = false;

        this.pushUndo();

        if ( this._indexToken === null ) {
            for ( let i = 0; i < this._tokenFormat.length; i++ ) {
                this._tokenFormat[i].digits = "";
                this._tokenFormat[i].value = 0;
            }

            this._indexToken = 0;

            this.pushUndo();
        }

        currentIndexToken = this.setValue( "DD", day, 1, 31 );
        if ( currentIndexToken >= 0 )
            hasToken = true;
        if ( currentIndexToken > maxIndexToken )
            maxIndexToken = currentIndexToken;

        currentIndexToken = this.setValue( "MM", month, 1, 12 );
        if ( currentIndexToken >= 0 )
            hasToken = true;
        if ( currentIndexToken > maxIndexToken )
            maxIndexToken = currentIndexToken;

        if ( typeof year === "number" && year < 100 )
            year += 2000;
        currentIndexToken = this.setValue( "YYYY", year, 1900, 2099 );
        if ( currentIndexToken >= 0 )
            hasToken = true;
        if ( currentIndexToken > maxIndexToken )
            maxIndexToken = currentIndexToken;

        if ( !hasToken )
            return;

        this._tokenFormat = this.updateToken( this._tokenFormat );
        this._value = this.formatValue();

        if ( maxIndexToken > this.IndexToken )
            this.IndexToken = maxIndexToken;
    }

    /**
     * Set the time into the digits and put the token on the next element
     * @param {any} hour new hour
     * @param {any} minute new minute
     * @param {any} second new second
     * @param {any} millisecond new millisecond
     */
    setTime( hour, minute, second, millisecond ) {
        let maxIndexToken = 0;
        let currentIndexToken = 0;
        let hasToken = false;

        this.pushUndo();

        if ( this._indexToken === null ) {
            for ( let i = 0; i < this._tokenFormat.length; i++ ) {
                this._tokenFormat[i].digits = "";
                this._tokenFormat[i].value = 0;
            }

            this._indexToken = 0;

            this.pushUndo();
        }

        currentIndexToken = this.setValue( "HH", hour, 0, 23 );
        if ( currentIndexToken >= 0 )
            hasToken = true;
        if ( currentIndexToken > maxIndexToken )
            maxIndexToken = currentIndexToken;

        currentIndexToken = this.setValue( "mm", minute, 0, 59 );
        if ( currentIndexToken >= 0 )
            hasToken = true;
        if ( currentIndexToken > maxIndexToken )
            maxIndexToken = currentIndexToken;

        currentIndexToken = this.setValue( "ss", second, 0, 59 );
        if ( currentIndexToken >= 0 )
            hasToken = true;
        if ( currentIndexToken > maxIndexToken )
            maxIndexToken = currentIndexToken;

        currentIndexToken = this.setValue( "SSS", millisecond, 0, 999 );
        if ( currentIndexToken >= 0 )
            hasToken = true;
        if ( currentIndexToken > maxIndexToken )
            maxIndexToken = currentIndexToken;

        if ( !hasToken )
            return;

        this._tokenFormat = this.updateToken( this._tokenFormat );
        this._value = this.formatValue();

        if ( maxIndexToken > this.IndexToken )
            this.IndexToken = maxIndexToken;
    }

    /**
     * (Virtual Method) update token from the value before formatting value as expected
     * @param {any} token list of tokens of the value setting
     * @param {any} tokenIndex current index of the token
     * @returns {{token: number, index: any}} token updated
     */
    updateToken( token ) {
        let index = this.IndexToken;

        if ( index === null )
            return token;

        let currentToken = token[index];

        if ( currentToken.digits.length < currentToken.format.length )
            return token;

        if ( currentToken.digits.length > currentToken.format.length ) {
            let currentValue = currentToken.digits.substr( 0, currentToken.format.length );
            let nextValue = currentToken.digits.substr( currentToken.format.length );

            currentToken.digits = currentValue;
            currentToken.value = parseInt( currentValue );

            if ( index < token.length - 1 ) {
                currentToken = token[index + 1];

                currentToken.digits = nextValue;
                currentToken.value = parseInt( nextValue.padEnd( currentToken.format.length, "0" ) );

                this.IndexToken = index + 1;
            }
        }

        for ( let i = 0; i < token.length; i++ ) {
            switch ( token[i].type ) {
                case "YYYY":
                    break;
                case "MM":
                    if ( token[i].digits.length === 2 ) {
                        let value = token[i].value;
                        if ( value < 1 )
                            value = 1;
                        if ( value > 12 )
                            value = 12;
                        token[i].value = value;
                        token[i].digits = value.toString().padStart( 2, "0" );
                    }
                    break;
                case "DD":
                    if ( token[i].digits.length === 2 ) {
                        let value = token[i].value;
                        if ( value < 1 )
                            value = 1;
                        if ( value > 31 )
                            value = 31;
                        token[i].value = value;
                        token[i].digits = value.toString().padStart( 2, "0" );
                    }
                    break;
                case "HH":
                    if ( token[i].digits.length === 2 ) {
                        let value = token[i].value;
                        if ( value > 23 )
                            value = 23;
                        token[i].value = value;
                        token[i].digits = value.toString().padStart( 2, "0" );
                    }
                    break;
                case "mm":
                case "ss":
                    if ( token[i].digits.length === 2 ) {
                        let value = token[i].value;
                        if ( value > 59 )
                            value = 59;
                        token[i].value = value;
                        token[i].digits = value.toString().padStart( 2, "0" );
                    }
                    break;
                case "SSS":
                    break;
            }
        }

        return token;
    }

    /**
     * The first key added, remove all existing values
     */
    selectAll() {
        this._tokenFormat = this.parseValue( this.toString() );
        this._value = this.formatValue();

        this._indexToken = null;
        this._undo = [];
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

        super( formatConverted );

        this.Value = null;
    }
};
