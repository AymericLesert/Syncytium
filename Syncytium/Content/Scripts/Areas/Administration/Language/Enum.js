/// <reference path="../../../_references.js" />

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
 * Define the language namespace
 */

var Language = {};

// List all labels to set in waiting to load data from database

Language.Default = {
    Labels: {
        'AREA_ADMINISTRATION': { 'FR': 'Administration', 'EN': 'Administration'  },
        'AREA_CUSTOMER': { 'FR': 'Customer', 'EN': 'Customer' },
        'BTN_CANCEL': { 'FR': 'Annuler', 'EN': 'Cancel' },
        'BTN_CLIPBOARD': { 'FR': 'Presse-papier', 'EN': 'Clipboard' },
        'BTN_CLOSE': { 'FR': 'Ferme', 'EN': 'Close' },
        'BTN_CONNECT': { 'FR': 'Connection', 'FR': 'Connect' },
        'BTN_OK': { 'FR': 'OK', 'EN': 'OK' },
        'BTN_RELOAD': { 'FR': 'RECHARGER', 'EN': 'RELOAD' },
        'ERR_CONNECTION': { 'FR': 'La connection vers le serveur est corrompue. Pouvez-vous recharger la page ?', 'EN': 'The connection toward server is corrupted. Please, reload the page ?' },
        'ERR_EXCEPTION_UNEXPECTED': { 'FR': 'Une exception inattendue est survenue durant le traitement de la requête', 'EN': 'Unexpected exception on running the request' },
        'ERR_INITIALISATION': { 'FR': 'L\'initialisation a rencontré un problème ...Si le problème persiste, contactez l\'équipe technique!', 'EN': 'Initialization has encountered an issue ... If the issue already exists, please contact the technical team!' },
        'ERR_NOCONNECTION': { 'FR': 'Non connecté!', 'EN': 'Not connected!' },
        'ERR_UNABLE_SYNCHRONIZATION': { 'FR': 'Impossible de synchroniser la base de données en raison d\'une mise à jour de la base de données. Rechargez la page!', 'EN': 'Unable to synchronize database. Reload the page!' },
        'ERR_UNAUTHENTICATED': { 'FR': 'Votre session est terminée ...Toutes vos modifications sont perdues !Veuillez vous authentifier à nouveau !', 'EN': 'Your session is over ... All modifications are lost! Please, reload the page !' },
        'ERR_UNAUTHORIZED': { 'FR': 'Requête non autorisée', 'EN': 'Request not allowed' },
        'ERR_UPLOAD_BROKEN': { 'FR': 'La connection a été rompue ...Essayez toute à l\'heure ...', 'EN': 'The connection is broken ... Try later ...' },
        'MSG_INITIALIZING': { 'FR': 'Initialisation en cours ...', 'EN': 'Initializing ...' },
        'MSG_LOADING': { 'FR': 'Chargement en cours ...', 'EN': 'Loading ...' },
        'MSG_SYNCHRONIZING': { 'FR': 'Synchronisation en cours ...', 'FR': 'Synchronizing ...' },
        'TITLE_EXIT': { 'FR': 'Sortie', 'FR': 'Exit' }
    }
};
