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
 * Define the user record namespace
 */

var UserRecord = {};

UserRecord.DEFAULT_PICTURE = function () {
    return { picture: URL_ROOT + "Content/Images/Header/User.svg", width: 100, height: 100 };
};

UserRecord.PROFILE_ADMINISTRATOR = 0;
UserRecord.PROFILE_SUPERVISOR = 1;
UserRecord.PROFILE_USER = 2;
UserRecord.PROFILE_OTHER = 3;
UserRecord.PROFILE_NONE = 4;

UserRecord.FREQUENCY_NONE = 0;
UserRecord.FREQUENCY_ASAP = 1;
UserRecord.FREQUENCY_PERDAY = 2;
UserRecord.FREQUENCY_PERWEEK = 3;
UserRecord.FREQUENCY_PERMONTH = 4;

/*
 * Test if the current user has the rights of an administrator
 */
UserRecord.IsAdministrator = function (user) {
    var currentUser = user ? user : DSDatabase.Instance.CurrentUser;
    if (currentUser === null)
        return false;

    return currentUser.Profile !== null && currentUser.Profile !== undefined && currentUser.Profile === UserRecord.PROFILE_ADMINISTRATOR;
};

/*
 * Test if the current user has the rights of a responsible
 */
UserRecord.IsSupervisor = function (user) {
    var currentUser = user ? user : DSDatabase.Instance.CurrentUser;
    if (currentUser === null)
        return false;

    return currentUser.Profile !== null && currentUser.Profile !== undefined && currentUser.Profile === UserRecord.PROFILE_SUPERVISOR;
};

/*
 * Test if the current user has the rights of an operator
 */
UserRecord.IsUser = function (user) {
    var currentUser = user ? user : DSDatabase.Instance.CurrentUser;
    if (currentUser === null)
        return false;

    return currentUser.Profile !== null && currentUser.Profile !== undefined &&
          (currentUser.Profile === UserRecord.PROFILE_SUPERVISOR ||
           currentUser.Profile === UserRecord.PROFILE_USER);
};

/*
 * Test if the current user has the rights to read but not to modify
 */
UserRecord.IsOther = function (user) {
    var currentUser = user ? user : DSDatabase.Instance.CurrentUser;
    if (currentUser === null)
        return false;

    return currentUser.Profile !== null && currentUser.Profile !== undefined && currentUser.Profile === UserRecord.PROFILE_OTHER;
};

/*
 * Test if the current user has no rights
 */
UserRecord.IsNone = function (user) {
    var currentUser = user ? user : DSDatabase.Instance.CurrentUser;
    if (currentUser === null)
        return false;

    return currentUser.Profile !== null &&
           currentUser.Profile !== undefined &&
           currentUser.Profile !== UserRecord.PROFILE_ADMINISTRATOR &&
           currentUser.Profile !== UserRecord.PROFILE_SUPERVISOR &&
           currentUser.Profile !== UserRecord.PROFILE_USER &&
           currentUser.Profile !== UserRecord.PROFILE_OTHER;
};

/*
 * Check if a user is currently enabled (supervisor or user)
 */
UserRecord.IsEnabled = function (record, profile) {
    if (record === null || record === undefined)
        return false;

    if (record._deleted !== null && record._deleted !== undefined && record._deleted)
        return false;

    if ((profile === undefined || profile === null || profile) && record.Profile !== UserRecord.PROFILE_SUPERVISOR && record.Profile !== UserRecord.PROFILE_USER)
        return false;

    if (record.EndDate === null)
        return true;

    return record.EndDate >= new moment();
};
