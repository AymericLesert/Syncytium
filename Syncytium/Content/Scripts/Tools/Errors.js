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

/**
 * Handle the list of errors
 */
class Errors {
    /**
     * Indicates if an error is stored into this class
     * @returns {boolean} true if the container has an error (global or field)
     */
    get HasError () {
        return Object.keys( this._fields ).length > 0 || Object.keys( this._errors ).length > 0 || this._global.length > 0;
    }

    /**
     * Clean up existing errors
     */
    clear() {
        this._errors = {};
        this._fields = {};
        this._global = [];
    }

    /**
     * Add a new error attached to a field
     * @param {any} component identification of the component having the error
     * @param {any} errors    list of errors attached to the component
     */
    addError( component, errors ) {
        if ( errors === null || errors === undefined || !errors.HasError )
            return;

        if ( !this._errors[component] )
            this._errors[component] = [];

        this._errors[component].push( errors );
    }

    /**
     * Add a new error attached to a field
     * @param {any} field      identification of the field having the error
     * @param {any} message    description of the error
     * @param {any} parameters list of parameters attached to the error
     */
    addField ( field, message, parameters ) {
        if ( !this._fields[field] )
            this._fields[field] = { ignore: false, errors: [] };

        this._fields[field].errors.push( { message: message, parameters: parameters } );
    }

    /**
     * Retrieve an array of multilingual labels
     * @param {any} field field name
     * @returns {any} array of multilingual label or null
     */
    getField( field ) {
        let currentField = this._fields[field];
        if ( currentField === null || currentField === undefined || Array.isEmpty(currentField.errors) )
            return null;

        var content = "<ul>";
        for ( let errorIdx in currentField.errors ) {
            let error = currentField.errors[errorIdx];
            content += "<li>";
            content += Helper.Span( error.message, error.parameters );
            content += "</li>";
        }
        content += "</ul>";

        return content;
    }

    /**
     * Ignore this field into the summary
     * @param {any} field field name to ignore
     */
    ignoreField( field ) {
        if ( !this._fields[field] )
            this._fields[field] = { ignore: true, errors: [] };

        this._fields[field].ignore = true;
    }

    /**
     * Add a global error
     * @param {any} message    description of the error
     * @param {any} parameters list of parameters attached to the error
     */
    addGlobal ( message, parameters ) {
        this._global.push( { message: message, parameters: parameters } );
    }

    /**
     * Set errors from JSON
     * @param {any} errors JSON format of a list of errors
     */
    setJSON ( errors ) {
        this.clear();

        var i = 0;
        for ( var field in errors.Fields ) {
            this._fields[field] = { ignore: false, errors: [] };
            for ( i = 0; i < errors.Fields[field].length; i++ )
                this._fields[field].errors.push( { message: errors.Fields[field][i].Message, parameters: errors.Fields[field][i].Parameters } );
        }

        for ( i = 0; i < errors.Globals.length; i++ )
            this._global.push( { message: errors.Globals[i].Message, parameters: errors.Globals[i].Parameters } );
    }

    /**
     * Retrieve the error context in html mode
     * @returns {string} HTML describing the list of errors
     */
    summary () {
        if ( !this.HasError )
            return "";

        var errorIdx = 0;
        var error = null;

        var content = "<ul>";
        var nbFieldsInSummary = 0;

        for ( var field in this._fields ) {
            if ( this._fields[field].ignore === true )
                continue;
            nbFieldsInSummary++;

            content += "<li>";
            content += String.encode( field );
            content += "<ul>";
            for ( errorIdx in this._fields[field].errors ) {
                error = this._fields[field].errors[errorIdx];
                content += "<li>";
                content += Helper.Span( error.message, error.parameters );
                content += "</li>";
            }
            content += "</ul>";
            content += "</li>";
        }

        for ( error in this._errors ) {
            nbFieldsInSummary++;

            content += "<li>";
            content += String.encode( error );
            content += "<ul>";
            for ( errorIdx in this._errors[error] ) {
                content += "<li>";
                content += this._errors[error][errorIdx].summary();
                content += "</li>";
            }
            content += "</ul>";
            content += "</li>";
        }

        if ( nbFieldsInSummary === 0 && this._global.length === 0 )
            return "";

        if ( nbFieldsInSummary === 0 && this._global.length === 1 )
            return Helper.Span( this._global[0].message, this._global[0].parameters );

        for ( errorIdx in this._global ) {
            error = this._global[errorIdx];
            content += "<li>";
            content += Helper.Span( error.message, error.parameters );
            content += "</li>";
        }

        return content + "</ul>";
    }

    /**
     * Convert a list of errors into a string
     * @param {string} language "FR" or anything else
     * @returns {string} String describing the list of errors
     */
    toString ( language ) {
        if ( !this.HasError )
            return "";

        if ( language === null || language === undefined )
            language = "FR";

        var errorIdx = 0;
        var error = null;

        var content = "";
        for ( var field in this._fields ) {
            if ( content.length !== 0 )
                content += ", ";

            content += field + ": {";
            for ( errorIdx in this._fields[field].errors ) {
                error = this._fields[field].errors[errorIdx];
                if ( errorIdx !== "0" )
                    content += ", ";
                content += Language.Manager.Instance.interpolation( error.message, error.parameters, language );
            }
            content += "}";
        }

        for ( error in this._errors ) {
            if ( content.length !== 0 )
                content += ", ";

            content += error + ": {";
            for ( errorIdx in this._errors[error] ) {
                content += this._errors[error][errorIdx].toString( language );
                if ( errorIdx !== "0" )
                    content += ", ";
            }
            content += "}";
        }

        for ( errorIdx in this._global ) {
            error = this._global[errorIdx];
            if ( content.length !== 0 )
                content += ", ";
            content += Language.Manager.Instance.interpolation( error.message, error.parameters, language );
        }

        return content;
    }

    /**
     * Create a new container of errors
     * @param {any} message    description of the error
     * @param {any} parameters list of parameters attached to the error
     */
    constructor( message, parameters ) {
        this._errors = {};
        this._fields = {};
        this._global = [];

        if ( message !== undefined )
            this.addGlobal( message, parameters );
    }
}
