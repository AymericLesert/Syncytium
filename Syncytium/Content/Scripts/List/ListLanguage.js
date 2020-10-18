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
 * Define a list of languages (it's a list of string having language codes)
 */
List.ListLanguage = class extends List.List {
    /**
     * Get the language
     * @param {any} item language
     * @returns {any} language
     */
    getId ( item ) {
        return item;
    }

    /**
     * Get the language
     * @param {any} item language
     * @returns {any} language
     */
    getLanguageLabel ( item ) {
        return item;
    }

    /**
     * No text
     * @param {any} item language
     * @returns {any} null
     */
    getText ( item ) {
        return null;
    }

    /**
     * No picture
     * @param {any} item language
     * @returns {any} null
     */
    getPicture ( item ) {
        return null;
    }

    /**
     * @returns {any} list of languages
     */
    getList () {
        return Language.Manager.Instance.Languages;
    }

    /**
     * Constructor
     */
    constructor() {
        super();
    }
};
