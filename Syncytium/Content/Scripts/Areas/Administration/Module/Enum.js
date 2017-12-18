/// <reference path="../../../_references.js" />

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
 * Handle the list of functional modules
 */

var ModuleRecord = {};

ModuleRecord.MODULE_NONE = -1;
ModuleRecord.MODULE_ADMINISTRATION = 0;
ModuleRecord.MODULE_REFERENTIAL = 1;
ModuleRecord.MODULE_STOCK = 2;
ModuleRecord.MODULE_PROVIDER = 3;
ModuleRecord.MODULE_PRODUCTION = 4;
ModuleRecord.MODULE_SALES = 5;
ModuleRecord.MODULE_LOGISTIC = 6;
ModuleRecord.MODULE_COMPTABILITY = 7;
ModuleRecord.MODULE_HUMANRESSOURCES = 8;
ModuleRecord.MODULE_SAMPLE = 8;

ModuleRecord.USERPROFILE_ADMINISTRATOR = 0;
ModuleRecord.USERPROFILE_SUPERVISOR = 1;
ModuleRecord.USERPROFILE_USER = 2;
ModuleRecord.USERPROFILE_OTHER = 3;
ModuleRecord.USERPROFILE_NONE = 4;

/**
 * Retrieve the module name referencing the page associated to the module
 * @param {any} module module definition
 * @returns {string} name of the module
 */
ModuleRecord.GetModuleName = function ( module ) {
    if ( module === null || module === undefined )
        return "";

    if ( module.Module === null || module.Module === undefined )
        return "";

    switch ( module.Module ) {
        case ModuleRecord.MODULE_ADMINISTRATION:
            return "Administration";
        case ModuleRecord.MODULE_REFERENTIAL:
            return "Referential";
        case ModuleRecord.MODULE_STOCK:
            return "Stock";
        case ModuleRecord.MODULE_PROVIDER:
            return "Provider";
        case ModuleRecord.MODULE_PRODUCTION:
            return "Production";
        case ModuleRecord.MODULE_SALES:
            return "Sales";
        case ModuleRecord.MODULE_LOGISTIC:
            return "Logistic";
        case ModuleRecord.MODULE_COMPTABILITY:
            return "Comptability";
        case ModuleRecord.MODULE_HUMANRESSOURCES:
            return "HumanRessources";
        case ModuleRecord.MODULE_SAPLE:
            return "Sample";
    }

    return "";
};
