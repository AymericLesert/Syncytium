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
 * Define a multilingual span tag
 */
class Helper {
    /**
     * Build a multilingual label on depends on label, parameters and language
     * @param {any} label      key of the label or a multilingual label
     * @param {any} parameters list of parameters included into the label
     * @param {any} language   language attached to the multilingual
     * @returns {label} a multilingual label
     */
    static Label ( label, parameters, language ) {
        var value = { label: null, parameters: null, language: null };

        if ( typeof label === "string" ) {
            value = { label: label, parameters: parameters ? parameters : null, language: language ? language : null };
        } else if ( label !== null && label !== undefined && typeof label === "object" ) {
            value = { label: label.label, parameters: label.parameters, language: label.language };
            value.parameters = parameters ? parameters : value.parameters;
            value.language = language ? language : value.language;
        }

        if ( value.parameters !== null && value.parameters !== undefined && !Array.isArray( value.parameters ) )
            value.parameters = [value.parameters];

        return value;
    }

    /**
     * Check if the label is a multilingual label
     * @param {any} label              multilingual label to check
     * @param {any} checkOnlyStructure true if the label is a structure (defined by Label)
     * @returns {boolean} true if the label is a multilingual label
     */
    static IsLabel ( label, checkOnlyStructure ) {
        if ( label === null || label === undefined )
            return false;

        if ( typeof label === "string" && !String.isEmptyOrWhiteSpaces( label ) && ( checkOnlyStructure === null || checkOnlyStructure === undefined || !checkOnlyStructure ) )
            return true;

        return label.label !== undefined && label.language !== undefined && label.parameters !== undefined;
    }

    /**
     * Convert a label into a HTML source (Span)
     * @param {any} klabel      multilingual label to convert
     * @param {any} kparameters list of parameters included into the label
     * @param {any} klanguage   language attached to the multilingual
     * @returns {string} a HTML source code describing the label into the page
     */
    static Span ( klabel, kparameters, klanguage ) {
        var label = Helper.Label( klabel, kparameters, klanguage );

        if ( String.isEmptyOrWhiteSpaces( label.label ) )
            return "";

        var span = "<span";

        if ( label.language !== null && label.language !== undefined )
            span += " k-language=\"" + label.language + "\"";

        if ( label.label !== null && label.label !== undefined )
            span += " k-label=\"" + label.label + "\"";

        if ( label.parameters !== null && label.parameters !== undefined && label.parameters.length > 0 ) {
            for ( var index in label.parameters ) {
                span += " k-label-" + index + "=\"" + label.parameters[index] + "\"";
            }
        }

        return span + ">" + String.encode( Language.Manager.Instance.interpolation( label ) ) + "</span>";
    }

    /**
     * Convert a label into a HTML source (Option)
     * @param {any} id          id of the option attached to this label
     * @param {any} klabel      multilingual label to convert
     * @param {any} kparameters list of parameters included into the label
     * @param {any} klanguage   language attached to the multilingual
     * @returns {string} a HTML source code describing the label into the page
     */
    static Option ( id, klabel, kparameters, klanguage ) {
        var label = Helper.Label( klabel, kparameters, klanguage );

        if ( String.isEmptyOrWhiteSpaces( label.label ) )
            return "";

        var option = "<option";

        if ( id !== null && id !== undefined )
            option += " value=\"" + id.toString() + "\"";

        if ( label.language !== null && label.language !== undefined )
            option += " k-language=\"" + label.language + "\"";

        if ( label.label !== null && label.label !== undefined )
            option += " k-label=\"" + label.label + "\"";

        if ( label.parameters !== null && label.parameters !== undefined && label.parameters.length > 0 ) {
            for ( var index in label.parameters ) {
                option += " k-label-" + index + "=\"" + label.parameters[index] + "\"";
            }
        }

        return option + ">" + String.encode( Language.Manager.Instance.interpolation( label ) ) + "</option>";
    }
}
