using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Exception;
using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Models;
using System;
using System.Linq;

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

namespace Syncytium.Module.Administration.Managers
{
    /// <summary>
    /// Handle the update of the table "User"
    /// </summary>
    public class UserManager : IUserManager
    {
        /// <summary>
        /// Instance of the current database manager
        /// </summary>
        public DatabaseContext Database;

        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static readonly string MODULE = typeof(UserManager).Name;

        /// <summary>
        /// Indicates if the all verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsVerboseAll() => Common.Logger.LoggerManager.Instance.IsVerboseAll;

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsVerbose() => Common.Logger.LoggerManager.Instance.IsVerbose;

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="message"></param>
        private void Verbose(string message) => Common.Logger.LoggerManager.Instance.Verbose(MODULE, message);

        /// <summary>
        /// Indicates if the debug mode is enabled or not
        /// </summary>
        /// <returns></returns>
        private bool IsDebug() => Common.Logger.LoggerManager.Instance.IsDebug;

        /// <summary>
        /// Log a debug message
        /// </summary>
        /// <param name="message"></param>
        private void Debug(string message) => Common.Logger.LoggerManager.Instance.Debug(MODULE, message);

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        private void Info(string message) => Common.Logger.LoggerManager.Instance.Info(MODULE, message);

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        private void Warn(string message) => Common.Logger.LoggerManager.Instance.Warn(MODULE, message);

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        private void Error(string message) => Common.Logger.LoggerManager.Instance.Error(MODULE, message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        private void Exception(string message, System.Exception ex) => Common.Logger.LoggerManager.Instance.Exception(MODULE, message, ex);

        #endregion

        /// <summary>
        /// Retrieve a user by its Id
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public IUser GetById(int userId)
        {
            IUser currentUser = Database.User.Find(userId);

            if (currentUser == null)
                return null;

            InformationRecord information = Database._Information.Find("User", currentUser.Id);

            if (information == null || !information.IsDeleted)
                return currentUser;

            return null;
        }

        /// <summary>
        /// Look for a user through its login
        /// </summary>
        /// <param name="login"></param>
        /// <param name="checkModule">true : user is retrieved by its login if a module is assigned to him</param>
        /// <returns>null if the user doesn't exist or if he can't get access (no modules)</returns>
        public UserRecord GetByLogin(string login, bool checkModule = true)
        {
            try
            {
                if (Database == null)
                    return null;

                bool userExists = false;

                foreach (UserRecord currentUser in (from user in Database.User
                                                   where user.Login.Equals(login)
                                                  select user).ToList())
                {
                    InformationRecord information = Database._Information.Find("User", currentUser.Id);

                    if ((information != null && information.IsDeleted) || !currentUser.IsEnable())
                        continue;

                    userExists = true;

                    if (currentUser.CustomerId == 1 || !checkModule)
                        return currentUser;

                    foreach (UserModuleRecord currentUserModule in (from userModule in Database.UserModule
                                                                   where userModule.UserId == currentUser.Id
                                                                  select userModule).ToList())
                    {
                        information = Database._Information.Find("UserModule", currentUserModule.Id);

                        if (information != null && information.IsDeleted)
                            continue;

                        ModuleRecord module = Database.Module.Find(currentUserModule.ModuleId);
                        if (module == null || !module.Enable)
                            continue;

                        return currentUser;
                    }
                }

                if (userExists)
                    Warn($"The user '{login}' exists but no module attached to him");

                return null;
            }
            catch (System.Exception ex)
            {
                Exception($"Unable to get the user '{login}'", ex);
            }

            return null;
        }

        /// <summary>
        /// Check if an administrator alive exists into the database
        /// </summary>
        /// <returns></returns>
        public bool ExistAdministrator()
        {
            try
            {
                if (Database == null)
                    return false;

                // Look for an enabled user within an enabled module in administrator mode !

                foreach (ModuleRecord currentModule in (from module in Database.Module
                                                       where module.Profile == UserProfile.EUserProfile.Administrator && module.Enable && module.Module == ModuleRecord.EModule.Administration
                                                      select module).ToList())
                {
                    InformationRecord information = Database._Information.Find("Module", currentModule.Id);

                    if (information != null && information.IsDeleted)
                        continue;

                    foreach (UserModuleRecord currentUserModule in (from userModule in Database.UserModule
                                                                     where userModule.ModuleId == currentModule.Id
                                                                     select userModule).ToList())
                    {
                        information = Database._Information.Find("UserModule", currentUserModule.Id);

                        if (information != null && information.IsDeleted)
                            continue;

                        UserRecord currentUser = Database.User.Find(currentUserModule.UserId);
                        if (currentUser == null || !currentUser.IsEnable())
                            continue;

                        information = Database._Information.Find("User", currentUser.Id);
                        if (information == null || !information.IsDeleted)
                            return true;
                    }
                }

                return false;
            }
            catch (System.Exception ex)
            {
                Exception($"Unable to check if an administrator is defined into the database", ex);
                return false;
            }
        }

        /// <summary>
        /// Check if login and password match to the database information
        /// </summary>
        /// <param name="login"></param>
        /// <param name="password"></param>
        /// <returns>Null if the user doesn't match or the user corresponding to the login</returns>
        public UserRecord Authenticate(string login, string password)
        {
            // The login of the user exists, check if the user is enable and if the password is expected

            UserRecord user = GetByLogin(login);
            if (user != null)
            {
                Debug($"User {login} exists and its password is encrypted like '{user.Password}' ...");
                if (!user.CheckPassword(password))
                {
                    Debug($"User {login} exists and password is not ok ...");
                    return null;
                }

                Debug($"User {login} exists and password ok ...");
                return user;
            }

            Debug($"User {login} doesn't exist ...");

            // The login doesn't exist, is it the administrator default login ?

            if (!ConfigurationManager.AdministratorLogin.Equals(login))
                return null;

            // Does it exist administrator enabled into the database ?

            if (ExistAdministrator())
                return null;

            // No administrator into the database, check the default password

            if (!ConfigurationManager.AdministratorPassword.Equals(password))
                return null;

            // Create a user admin before adding it

            Warn("Creation of the default administrator user ... Please check the database user configuration !");

            return UserRecord.CreateDefaultAdministrator();
        }

        /// <summary>
        /// Set a new password for a user
        /// </summary>
        /// <param name="login"></param>
        /// <param name="newPassword">If null or empty, the password is removed ... the user can't access to its account</param>
        public void SetNewPassword(string login, string newPassword)
        {
            if (Database == null)
                throw new ExceptionNotAuthorized("Data access layer towards user is disable ...");

            Info($"Set a new password to the user {login} ...");

            // Update the current user in the database

            UserRecord user = GetByLogin(login);
            if (user == null)
                throw new ExceptionNotFound($"The user '{login}' doesn't exist");

            if (String.IsNullOrWhiteSpace(newPassword))
                throw new ExceptionNotFound($"The user '{login}' has to set a new password");

            user.Password = UserRecord.EncryptPassword(newPassword);
            user.NewPasswordDate = null;
            user.NewPasswordKey = null;

            // Update the database

            Database.SaveChanges();
            Info("The user's password is updated");
        }

        /// <summary>
        /// Ask a new password and return the user
        /// </summary>
        /// <param name="login"></param>
        /// <returns></returns>
        public UserRecord AskNewPassword(string login)
        {
            if (Database == null)
                throw new ExceptionNotAuthorized("Data access layer towards user is disable ...");

            Info($"Ask a new password for the user {login} ...");

            // Update the current user in the database

            UserRecord user = GetByLogin(login, false);
            if (user == null)
                throw new ExceptionNotFound($"The user '{login}' doesn't exist");

            // Expiricy in "PasswordExpiricyDay" days

            string newPasswordKey = UserRecord.EncryptPassword($"{login}-{(new Random()).NextDouble()}");
            if (newPasswordKey.Length > 256)
                newPasswordKey = newPasswordKey.Substring(0, 256);
            user.NewPasswordKey = newPasswordKey;
            user.NewPasswordDate = DateTime.Now;
            Database.SaveChanges();

            Info($"The user {login} asks for a new password");

            return user;
        }

        /// <summary>
        /// Retrieve the module on depends on the settings and rights of the current user
        /// </summary>
        /// <param name="user"></param>
        /// <param name="moduleId"></param>
        /// <returns></returns>
        public IModule GetModule(IUser user, int moduleId)
        {
            try
            {
                if (Database == null || user == null)
                    return null;

                // Look for modules allowed for the current user

                UserModuleRecord userModuleFound = null;

                foreach (UserModuleRecord userModuleCurrent in (from userModule in Database.UserModule
                                                               where userModule.UserId == user.Id && userModule.ModuleId == moduleId
                                                              select userModule).ToList())
                {
                    InformationRecord information = Database._Information.Find("UserModule", userModuleCurrent.Id);

                    if (information == null || !information.IsDeleted)
                    {
                        userModuleFound = userModuleCurrent;
                        break;
                    }
                }

                if (userModuleFound == null)
                {
                    Warn($"No module '{moduleId}' found for the user '{user.Id}' ...");
                    return null;
                }

                // Look for the module

                ModuleRecord module = Database.Module.Find(userModuleFound.ModuleId);

                if (module == null)
                {
                    Error($"Database inconsistency due to the missing of the module '{userModuleFound.ModuleId}' ...");
                    return null;
                }

                if (!module.Enable)
                {
                    Warn($"The module '{module.Name}' is disabled!");
                    return null;
                }

                Info($"The module is '{module.Name}'");
                return module;
            }
            catch (System.Exception ex)
            {
                Exception($"Unable to retrieve the module '{moduleId}'", ex);
                return null;
            }
        }

        /// <summary>
        /// Retrieve the default module for the given user
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public ModuleRecord GetDefaultModule(UserRecord user)
        {
            try
            {
                if (Database == null || user == null)
                    return null;

                // Look for modules allowed for the current user

                UserModuleRecord userModuleFound = null;

                foreach (UserModuleRecord userModuleCurrent in (from userModule in Database.UserModule
                                                               where userModule.UserId == user.Id && userModule.Default
                                                              select userModule).ToList())
                {
                    InformationRecord information = Database._Information.Find("UserModule", userModuleCurrent.Id);

                    if (information == null || !information.IsDeleted)
                    {
                        userModuleFound = userModuleCurrent;
                        break;
                    }
                }

                if (userModuleFound == null)
                {
                    Warn($"No module by default for the user {user.Login} ... Set the first module defined for the user ...");

                    foreach (UserModuleRecord userModuleCurrent in (from userModule in Database.UserModule
                                                                   where userModule.UserId == user.Id
                                                                  select userModule).ToList())
                    {
                        InformationRecord information = Database._Information.Find("UserModule", userModuleCurrent.Id);

                        if (information == null || !information.IsDeleted)
                        {
                            userModuleFound = userModuleCurrent;
                            break;
                        }
                    }
                }

                if (userModuleFound == null)
                {
                    Warn($"No module found for the user {user.Login} ...");
                    return null;
                }

                // Look for the module

                ModuleRecord module = Database.Module.Find(userModuleFound.ModuleId);

                if (module == null)
                {
                    Error($"Database inconsistency due to the missing of the module '{userModuleFound.ModuleId}' ...");
                    return null;
                }

                if (!module.Enable)
                {
                    Warn($"The default module '{module.Name}' is disabled!");
                    return null;
                }

                Info($"The default module is '{module.Name}'");
                return module;
            }
            catch (System.Exception ex)
            {
                Exception($"Unable to retrieve the default module", ex);
                return null;
            }
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="databaseContext"></param>
        public UserManager(DatabaseContext databaseContext)
        {
            Database = databaseContext;
        }
    }
}