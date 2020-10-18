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

// ----------------------------------------------------------------------------------------------------
// GENERIC STRING TOOLS
// ----------------------------------------------------------------------------------------------------

String.HEX_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
String.RANDOM_VALUE = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
String._cache = {};

/*
 * Convert a string into an internal string
 */
String.internal = function ( value ) {
    let internalValue = String._cache[value];
    if ( internalValue !== undefined )
        return internalValue;

    String._cache[value] = value;
    return value;
};

/*
 * Encode a string into a html text
 */
String.encode = function (value) {
    return $('<div/>').text(value).html();
};

/*
 * Decode a html text into a string
 */
String.decode = function (value) {
    return $('<div/>').html(value).text();
};

/*
 * put '\\' before the char identified into the value
 */
String.protect = function (value, char) {
    return value.replace(new RegExp(char, "g"), "\\" + char);
};

/*
 * Similar as IsNullOrWhiteSpaces in C#
 */
String.isEmptyOrWhiteSpaces = function (str) {
    return str === null || str === undefined || typeof str === "string" && str.match(/^\s*$/) !== null;
};

/*
 * Check the validation of an email address
 */
String.isEmailValide = function (str) {
    return str && /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(str);
};

/*
 * Check the validation of a percentage value
 */
String.isPercentage = function ( str ) {
    return str && /^[0-9]+(\.[0-9]+|)%$/.test( str );
};

/*
 * Replace null or string with white spaces by ""
 */
String.getStringFromJSON = function (str) {
    return this.isEmptyOrWhiteSpaces(str) ? "" : str.trim();
};

/*
 * Add startsWith if this method doesn't exist
 */
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

/*
 * Add count if this method doesn't exist
 */
if ( !String.prototype.count ) {
    String.prototype.count = function ( c ) {
        let result = 0;
        for ( let i = 0; i < this.length; i++ )
            if ( this[i] === c )
                result++;
        return result;
    };
}

/*
 * Add padEnd if this method doesn't exist
 */
if (!String.prototype.padEnd) {
    String.prototype.padEnd = function (len, str) {
        if (!str || typeof str !== "string" || str.length === 0)
            return this;

        if (!len || typeof len !== "number" || len === 0 || str.length >= len)
            return this;

        let content = str;
        while (content.length < len)
            content += str;

        return (content + this).slice(-len);
    };
}

/*
 * Convert the value of the selection into a string value
 */
String.convertValue = function (value) {
    if (value === null || value === undefined)
        return null;

    if (typeof value === "boolean")
        return value ? "1" : "0";

    if (typeof value !== "string")
        value = value.toString();

    value = value.trim();

    return value === "" ? null : value;
};

/*
 * Convert a string to an integer
 */
String.parseInt = function (value) {
    if (/^(-|\+)?([0-9]+|Infinity)$/.test(value))
        return Number(value);
    return NaN;
};

/*
 * Convert a string to a float
 */
String.parseFloat = function (value) {
    if (/^(-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value))
        return Number(value);
    if ( /^(-|\+)?([0-9]+(,[0-9]+)?|Infinity)$/.test( value ) )
        return Number( value.replace(",", ".") );
    return NaN;
};

/*
 * Function to convert hex format to a rgb color
 */
String.parseRGBToHEX = function (rgb) {
    function hex(x) {
        return isNaN(x) ? "00" : String.HEX_DIGITS[(x - x % 16) / 16] + String.HEX_DIGITS[x % 16];
    }

    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
};

/*
 * Convert a value to a string included into a CSV file
 */
String.convertCSV = function (value, separator) {
    let string = "";

    if (value === null || value === undefined)
        return string;

    switch(typeof value) {
        case "string":
            string = value;
            break;
        case "number":
            string = value.toString().replace(".", ",");
            break;
        case "boolean":
            string = String.convertValue(value);
            break;
        default:
            if (value instanceof Date) {
                string = moment(value.toString()).format("YYYY/MM/DD HH:mm:ss.SSS");
            } else if (value instanceof moment) {
                string = moment(value).format("YYYY/MM/DD HH:mm:ss.SSS");
            } else {
                string = value.toString();
            }
            break;
    }

    if ( !String.isEmptyOrWhiteSpaces( string ) &&
        ( string.indexOf( separator ) > 0 || string.indexOf( '"' ) > 0 || isNaN( String.parseFloat( string ) ) || !isFinite( string ) ) )
        string = '"' + string.replace( /"/g, "'" ).replace( /\n/g, " " ) + '"';

    return string;
};

/*
 * Add cleanupCSV if this method doesn't exist (remove '"')
 */
String.cleanupCSV = function ( value ) {
    if ( value.length < 2 )
        return value;

    let i = 0;
    if ( value[0] === '"' && value[value.length - 1] === '"' )
        i = 1;

    let newValue = '';
    for ( let j = i; j < value.length - i; j++ ) {
        if ( value[j] === '\\' )
            continue;

        newValue += value[j];
    }

    return newValue;
};

/*
 * Convert a value into a boolean
 */
String.convertBoolean = function (value) {
    return typeof value === "string" && (value.toUpperCase() === "TRUE" || value.toUpperCase() === "OK" || value === "1") ||
           typeof value === "boolean" && value ||
           typeof value === "number" && value !== 0;
};

/*
 * Convert a percentage string value into a float
 */
String.convertPercentage = function ( value ) {
    if ( value === null || value === undefined )
        return 0.;

    if ( typeof value === "boolean" )
        return value ? 1 : 0;

    if ( typeof value === "string" ) {
        if ( value[value.length - 1] === "%" )
            return String.parseFloat( value.substr( 0, value.length - 1 ) ) / 100;

        return String.parseFloat( value );
    }

    return value;
};

/*
 * Compare 2 string values
 */
String.compare = function (str1, str2) {
    str1 = String.convertValue(str1);
    str1 = str1 === null ? "" : str1.toUpperCase();

    str2 = String.convertValue(str2);
    str2 = str2 === null ? "" : str2.toUpperCase();

    return str1 < str2 ? -1 : str1 > str2 ? 1 : 0;
};

/*
 * Check if str1 and str2 match (str2 must be a substring of str1)
 */
String.in = function ( str1, str2 ) {
    str1 = String.convertValue( str1 );
    str1 = str1 === null ? "" : str1.toUpperCase();

    str2 = String.convertValue( str2 );
    str2 = str2 === null ? "" : str2.toUpperCase();

    return str1.indexOf( str2 ) >= 0;
};

/*
 * String.JSONStringify
 */
String.JSONStringify = function ( record ) {
    return JSON.stringify( record, function ( key, value ) {
        return key === "_subLists" || key === "_list" || key === "_parent" || key === "_foreignKeys" ? undefined : value;
    } );
};

/*
 * Convert a string (base64) to UTF-8 (string)
 */
String.base64DecodeUnicode = function ( str ) {
    return decodeURIComponent( atob( str ).split( '' ).map( function ( c ) {
        return '%' + ( '00' + c.charCodeAt( 0 ).toString( 16 ) ).slice( -2 );
    } ).join( '' ) );
};

/*
 * Build a string random
 */
String.random = function ( length ) {
    let value = "";

    for ( let i = 0; i < length; i++ )
        value += String.RANDOM_VALUE[Math.round(Math.random()*(String.RANDOM_VALUE.length-1))];

    return value;
};
