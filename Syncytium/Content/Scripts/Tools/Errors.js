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
 * Handle the list of errors
 */
class Errors {
    /**
     * Indicates if an error is stored into this class
     * @returns {boolean} true if the container has an error (global or field)
     */
    get HasError() {
        if ( this._global.length > 0 || this._fatal.length > 0 )
            return true;

        for ( let i in this._fields )
            return true;

        for ( let i in this._errors )
            return true;

        return false;
    }

    /**
     * Indicates if a fatal error is stored into this class
     * @returns {boolean} true if the container has a fatal
     */
    get HasFatal() {
        if ( this._fatal.length > 0 )
            return true;

        for ( let error of Array.toIterable( this._errors ) )
            if ( error.HasFatal )
                return true;

        return false;
    }

    /**
     * Clean up existing errors
     */
    clear() {
        this._errors = {};
        this._fields = {};
        this._global = [];
        this._fatal = [];
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

        let content = "<ul>";
        for ( let error of currentField.errors ) {
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
     * Add a fatal error
     * @param {any} message    description of the error
     * @param {any} parameters list of parameters attached to the error
     */
    addFatal( message, parameters ) {
        this._fatal.push( { message: message, parameters: parameters } );
    }

    /**
     * Concat errors from an instance into the current instance
     * @param {Errors} errors instance to add
     */
    addErrors( errors ) {
        if ( !errors.HasError )
            return;

        for ( let field in errors._fields ) {
            if ( errors._fields[field].ignore === true )
                this.ignoreField( field );

            for ( let error of errors._fields[field].errors )
                this.addField( field, error.message, error.parameters );
        }

        for ( let error in errors._errors ) {
            for ( let detail of errors._errors[error] ) {
                this.addError( error, detail );
            }
        }

        for ( let error of errors._global )
            this.addGlobal( error.message, error.parameters );

        for ( let error of errors._fatal )
            this.addFatal( error.message, error.parameters );
    }

    /**
     * Set errors from JSON
     * @param {any} errors JSON format of a list of errors
     */
    setJSON ( errors ) {
        this.clear();

        if ( errors.Fatals !== null && errors.Fatals !== undefined ) {
            for ( let error of errors.Fatals )
                this._fatal.push( { message: error.Message, parameters: error.Parameters } );
        }

        if ( errors.Globals !== null && errors.Globals !== undefined ) {
            for ( let error of errors.Globals )
                this._global.push( { message: error.Message, parameters: error.Parameters } );
        }

        if ( errors.Fields !== null && errors.Fields !== undefined ) {
            for ( let field in errors.Fields ) {
                this._fields[field] = { ignore: false, errors: [] };
                for ( let error of errors.Fields[field] )
                    this._fields[field].errors.push( { message: error.Message, parameters: error.Parameters } );
            }
        }
    }

    /**
     * Retrieve the error context in html mode
     * @param {boolean} subSummary true if error is included into another error
     * @returns {string} HTML describing the list of errors
     */
    summary( subSummary ) {
        if ( !this.HasError )
            return "";

        if ( subSummary === null || subSummary === undefined ) {
            let nbFieldsInSummary = 0;
            for ( let field in this._fields )
                nbFieldsInSummary++;
            for ( let error in this._errors )
                nbFieldsInSummary++;

            if ( nbFieldsInSummary === 0 && this._global.length === 0 && this._fatal.length === 0 )
                return "";

            if ( nbFieldsInSummary === 0 && this._global.length === 0 && this._fatal.length === 1 )
                return Helper.Span( this._fatal[0].message, this._fatal[0].parameters );

            if ( nbFieldsInSummary === 0 && this._global.length === 1 && this._fatal.length === 0 )
                return Helper.Span( this._global[0].message, this._global[0].parameters );
        }

        let content = "<ul>";
        let vide = true;

        for ( let error of this._fatal ) {
            content += "<li>";
            content += Helper.Span( error.message, error.parameters );
            content += "</li>";
            vide = false;
        }

        for ( let error of this._global ) {
            content += "<li>";
            content += Helper.Span( error.message, error.parameters );
            content += "</li>";
            vide = false;
        }

        for ( let field in this._fields ) {
            if ( this._fields[field].ignore === true )
                continue;

            content += "<li>";
            content += String.encode( field );
            content += "<ul>";
            for ( let errorIdx in this._fields[field].errors ) {
                let error = this._fields[field].errors[errorIdx];
                content += "<li>";
                content += Helper.Span( error.message, error.parameters );
                content += "</li>";
            }
            content += "</ul>";
            content += "</li>";
            vide = false;
        }

        for ( let error in this._errors ) {
            content += "<li>";
            content += String.encode( error );
            for ( let detail of this._errors[error] )
                content += detail.summary( true );
            content += "</li>";
            vide = false;
        }

        return vide ? "" : ( content + "</ul>" );
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
            language = "EN";

        let content = "";

        for ( let error of this._fatal ) {
            if ( content.length !== 0 )
                content += ", ";
            content += Language.Manager.Instance.interpolation( error.message, error.parameters, language );
        }

        for ( let error of this._global ) {
            if ( content.length !== 0 )
                content += ", ";
            content += Language.Manager.Instance.interpolation( error.message, error.parameters, language );
        }

        for ( let field in this._fields ) {
            if ( content.length !== 0 )
                content += ", ";

            content += field + ": {";
            let first = true;
            for ( let error of this._fields[field].errors ) {
                if ( !first )
                    content += ", ";
                first = false;
                content += Language.Manager.Instance.interpolation( error.message, error.parameters, language );
            }
            content += "}";
        }

        for ( let error in this._errors ) {
            if ( content.length !== 0 )
                content += ", ";

            content += error + ": {";
            let first = true;
            for ( let detail of this._errors[error] ) {
                if ( !first )
                    content += ", ";
                first = false;
                content += detail.toString( language );
            }
            content += "}";
        }

        return content;
    }

    /**
     * Convert a list of errors into a string to copy into the Clipboard
     * @param {string} language "FR" or anything else
     * @param {string} indent string to set at the begin of line
     * @returns {string} String describing the list of errors
     */
    toClipboard( language, indent ) {
        if ( !this.HasError )
            return "";

        if ( language === null || language === undefined )
            language = "EN";

        if ( indent === null || indent === undefined )
            indent = "";

        let startLine = String.isEmptyOrWhiteSpaces( indent ) ? "" : (indent + " ");
        let content = "";

        for ( let error of this._fatal ) {
            if ( content.length !== 0 )
                content += "\n";
            content += startLine + Language.Manager.Instance.interpolation( error.message, error.parameters, language );
        }

        for ( let error of this._global ) {
            if ( content.length !== 0 )
                content += "\n";
            content += startLine + Language.Manager.Instance.interpolation( error.message, error.parameters, language );
        }

        for ( let field in this._fields ) {
            if ( content.length !== 0 )
                content += "\n";

            content += startLine + field + " :\n";
            let first = true;
            for ( let error of this._fields[field].errors ) {
                if ( !first )
                    content += "\n";
                first = false;
                content += indent + "* " + Language.Manager.Instance.interpolation( error.message, error.parameters, language );
            }
        }

        for ( let error in this._errors ) {
            if ( content.length !== 0 )
                content += "\n";

            content += startLine + error + " :\n";
            let first = true;
            for ( let detail of this._errors[error] ) {
                if ( !first )
                    content += "\n";
                first = false;
                content += detail.toClipboard( language, indent + "*" );
            }
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
        this._fatal = [];

        if ( message !== undefined )
            this.addGlobal( message, parameters );
    }
}
