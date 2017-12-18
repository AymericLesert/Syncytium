using Syncytium.Common.Error;
using Syncytium.Common.Managers;
using Syncytium.Module.Administration;
using Syncytium.Module.Administration.Managers;
using Syncytium.Module.Administration.Models;
using Syncytium.Web.Areas.ViewModels;
using Syncytium.Web.Controllers;
using Syncytium.Web.Database;
using Syncytium.Web.Filters;
using Syncytium.Web.Managers;
using System;
using System.Linq;
using System.Net.Mail;
using System.Web.Mvc;
using System.Web.Security;

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

namespace Syncytium.Web.Areas.Administration.Controllers
{
    /// <summary>
    /// Handle the user controller
    /// </summary>
    public class UserController : SyncytiumController
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected override string MODULE => typeof(UserController).Name;

        #endregion

        /// <summary>
        /// URL ~/Administration/User/SignIn
        /// </summary>
        /// <param name="returnUrl"></param>
        /// <param name="error"></param>
        /// <returns></returns>
        public ActionResult SignIn(string returnUrl, string error)
        {
            Debug($"Get ~/Administration/User/SignIn({returnUrl}, {error})");

            if (StatusManager.Status == StatusManager.EStatus.STATUS_OK)
            {
                // if the user is authenticated, redirect to ~/Administration/User/Index

                if (HttpContext.User.Identity.IsAuthenticated)
                {
                    Debug($"The current user '{HttpContext.User.Identity.Name}' is already authenticated ... go directly to Index");
                    return RedirectToAction("Index");
                }

                // the user doesn't exist, create an empty user

                LanguageDictionary ressources = new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);
                ressources.Load(_userManager.Database, 1);

                if (!String.IsNullOrWhiteSpace(error))
                    SetModelState(ModelState, ressources, new Errors(error));

                // Show the SignIn screen

                return View(new UserViewModel(ressources,
                                              new UserRecord(),
                                              HttpContext.User.Identity.IsAuthenticated));
            }

            if (StatusManager.Status == StatusManager.EStatus.STATUS_UPGRADING)
            {
                // The database must be upgraded before continuing ... only the administrator defined into web.config has the ability to connect to the application

                if (HttpContext.User.Identity.IsAuthenticated && HttpContext.User.Identity.Name.Equals("-1"))
                {
                    Debug("A upgrading process must be run ...");

                    return View("Upgrading", new UserViewModel(new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage),
                                                               UserRecord.CreateDefaultAdministrator(),
                                                               true));
                }

                // If it's another user, sign out the current user ...

                if (HttpContext.User.Identity.IsAuthenticated)
                {
                    Debug($"The current user '{HttpContext.User.Identity.Name}' is already authenticated and its session can't be open due to the upgrading process");
                    FormsAuthentication.SignOut();
                }

                // Set ressources within default value for some screen

                Debug("Only the default administrator is allowed to connect to the application");

                return View("SignInAdministration", new UserViewModel(new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage),
                                                                      new UserRecord(),
                                                                      HttpContext.User.Identity.IsAuthenticated));
            }

            return HttpNotFound();
        }

        /// <summary>
        /// URL ~/Administration/User/SignIn (Form submit)
        /// </summary>
        /// <param name="login"></param>
        /// <param name="password"></param>
        /// <param name="rememberMe"></param>
        /// <param name="returnUrl"></param>
        /// <returns></returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult SignIn(string login, string password, bool? rememberMe, string returnUrl)
        {
            Debug($"Post ~/Administration/User/SignIn({login}, {rememberMe}, {returnUrl})");

            // check the value by itself

            Errors errors = new Errors();

            if (string.IsNullOrWhiteSpace(login) || string.IsNullOrWhiteSpace(password))
            {
                // no login set

                if (string.IsNullOrWhiteSpace(login))
                    errors.AddField("Login", "ERR_FIELD_REQUIRED", new object[] { "{USER_LOGIN}" });

                // no password set

                if (string.IsNullOrWhiteSpace(password))
                    errors.AddField("Password", "ERR_FIELD_REQUIRED", new object[] { "{USER_PASSWORD}" });
            }
            else if (StatusManager.Status == StatusManager.EStatus.STATUS_OK)
            {
                // authentication of the user

                UserRecord userAuthenticated = _userManager.Authenticate(login, password);

                if (userAuthenticated != null)
                {
                    FormsAuthentication.SetAuthCookie(userAuthenticated.Id.ToString(), (rememberMe != null && rememberMe.Value));

                    Debug("Authentication OK");

                    if (!string.IsNullOrWhiteSpace(returnUrl) && Url.IsLocalUrl(returnUrl))
                        return Redirect(returnUrl);

                    return RedirectToAction("Index");
                }

                errors.AddGlobal("ERR_LOGIN_INCORRECT");
            }
            else
            {
                // it is due to a upgrading process ... no error because StatusFilterAttribute has already rejected the action

                UserRecord administrator = UserRecord.CreateDefaultAdministrator();

                if (administrator.Login.Equals(login) && administrator.Password.Equals(password))
                {
                    FormsAuthentication.SetAuthCookie(administrator.Id.ToString(), false);
                    return View("Upgrading", new UserViewModel(new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage),
                                                               administrator,
                                                               true));
                }

                errors.AddGlobal("ERR_LOGIN_INCORRECT");
            }

            Debug("Authentication fail");

            // load multilingual dictionary

            LanguageDictionary ressources = new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);
            if (StatusManager.Status == StatusManager.EStatus.STATUS_OK)
            {
                using (DatabaseContext database = new DatabaseContext())
                    ressources.Load(database, 1);
            }

            // update ModelState on depends on errors

            SetModelState(ModelState, ressources, errors);

            // show the same screen until the user success

            if (StatusManager.Status == StatusManager.EStatus.STATUS_UPGRADING)
                return View("SignInAdministration", new UserViewModel(ressources,
                                                                      new UserRecord { Login = login, Password = password },
                                                                      false,
                                                                      null,
                                                                      rememberMe: rememberMe == null ? false : rememberMe.Value));

            return View(new UserViewModel(ressources,
                                      new UserRecord { Login = login, Password = password },
                                      false,
                                      null,
                                      rememberMe: rememberMe == null ? false : rememberMe.Value));
        }

        /// <summary>
        /// URL ~/Administration/User/Index
        /// </summary>
        /// <returns></returns>
        [RoleFilter]
        public ActionResult Index()
        {
            Debug("Get ~/Administration/User/Index()");

            // Retrieve the user

            UserRecord user = null;

            if (int.Parse(HttpContext.User.Identity.Name) == -1)
                user = UserRecord.CreateDefaultAdministrator();
            else
                user = _userManager.GetById(int.Parse(HttpContext.User.Identity.Name)) as UserRecord;

            // If the login doesn't exist, it is the administrator by default (due to RoleFilter)

            if (user == null)
            {
                FormsAuthentication.SignOut();
                return RedirectToAction("SignIn");
            }

            // load ressources before designing the screen fitted to the user's profile

            LanguageDictionary ressources = new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);
            ressources.Load(_userManager.Database, user.CustomerId);

            // the user exists, check if it's already connected
            // In case of reloading page, the connection can't be disconnected as quick as expected ...

            if (DatabaseHub.IsAlreadyConnected(user.Id))
            {
                FormsAuthentication.SignOut();
                Debug($"The user '{user.Id}' is already connected on another support");
                return View("AlreadyConnected", new UserViewModel(ressources, user, false));
            }

            // Show the screen on depends on the user's profile

            if (user.CustomerId == 1)
                return RedirectToAction("Index", "Customer");

            // Look for the default functional module for the current user

            ModuleRecord module = _userManager.GetDefaultModule(user);
            if ( module == null )
            {
                FormsAuthentication.SignOut();
                return RedirectToAction("SignIn");
            }

            return RedirectToAction("Index", module.Module.ToString(), new { area = module.Module.ToString(), moduleId = module.Id });
        }

        /// <summary>
        /// URL ~/Administration/User/SignOut
        /// </summary>
        /// <returns></returns>
        public ActionResult SignOut()
        {
            Debug("Get ~/Administration/User/SignOut()");

            FormsAuthentication.SignOut();

            return RedirectToAction("SignIn");
        }

        /// <summary>
        /// URL ~/Administration/User/ForgetPassword
        /// </summary>
        /// <returns></returns>
        public ActionResult ForgetPassword()
        {
            Debug("Get ~/Administration/User/ForgetPassword()");

            // if the user is authenticated, redirect to ~/Administration/User/Index

            if (HttpContext.User.Identity.IsAuthenticated)
            {
                Debug($"The current user '{HttpContext.User.Identity.Name}' is still authenticated ... go directly to Index");
                return RedirectToAction("Index");
            }

            // the user exists

            LanguageDictionary ressources = new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);
            ressources.Load(_userManager.Database, 1);

            return View(new UserViewModel(ressources, new UserRecord(), false));
        }

        /// <summary>
        /// Send an email on asking a new password
        /// </summary>
        /// <param name="login"></param>
        /// <returns></returns>
        public UserRecord SendNewPassword(string login)
        {
            // ask for a new password due to forget password

            try
            {
                UserRecord user = _userManager.AskNewPassword(login);

                // read the multilingual dictionary

                LanguageDictionary ressources = new LanguageDictionary(Server?.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);
                ressources.Load(_userManager.Database, user.CustomerId);

                // Send an email to the user within a link towards the new password page

                MailMessage message = new MailMessage();
                message.To.Add(new MailAddress(user.Email));
                message.Subject = ressources.GetLabel(user.Language, "USER_NEW_PASSWORD");
                message.Body = RenderManager.RenderView("~/Areas/Administration/Views/User/MailNewPassword.cshtml", new UserViewModel(ressources, user, false));
                message.BodyEncoding = System.Text.Encoding.GetEncoding("iso-8859-1");
                message.IsBodyHtml = true;

                using (var smtp = new SmtpClient())
                    smtp.Send(message);

                return user;

            }
            catch (System.Exception ex)
            {
                Exception($"An exception occurs on asking for a new password due to {ex.Message}", ex);
                return null;
            }
        }

        /// <summary>
        /// URL ~/Administration/User/ForgetPassword (Form submit)
        /// </summary>
        /// <param name="login"></param>
        /// <returns></returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ForgetPassword(string login)
        {
            Debug($"Post ~/Administration/User/ForgetPassword({login})");

            // check the value by itself

            Errors errors = new Errors();

            if (string.IsNullOrWhiteSpace(login))
                errors.AddField("Login", "ERR_FIELD_REQUIRED", new object[] { "{USER_LOGIN}" });

            if (errors.HasError)
            {
                // read the multilingual dictionary

                LanguageDictionary ressources = new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);
                ressources.Load(_userManager.Database, 1);

                SetModelState(ModelState, ressources, errors);
                return View(new UserViewModel(ressources, new UserRecord(), false));
            }

            // ask for a new password due to forget password

            SendNewPassword(login);

            // Go to SingIn

            return RedirectToAction("SignIn");
        }

        /// <summary>
        /// URL ~/Administration/User/NewPassword?key
        /// </summary>
        /// <param name="key">Key of the asking of changing password</param>
        /// <returns></returns>
        public ActionResult NewPassword(string key)
        {
            Debug($"Get ~/Administration/User/NewPassword({key})");

            if (key == null)
                return HttpNotFound();

            LanguageDictionary ressources = new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);

            // Look for the new password key

            UserRecord user = _userManager.Database.User.FirstOrDefault(u => u.NewPasswordKey.Equals(key));
            if (user == null)
                return HttpNotFound();

            if (user.NewPasswordDate == null)
            {
                Info($"No date for asking a new password for the key '{key}' ...");
                user.NewPasswordDate = null;
                _userManager.Database.SaveChanges();
                return HttpNotFound();
            }

            // Check if the max days expiricy is not reached

            if ((DateTime.Now - user.NewPasswordDate.Value).TotalDays > ConfigurationManager.ConnectionMaxWaiting)
            {
                Info($"The date for setting a new password has expired for the key '{key}' ...");
                user.NewPasswordDate = null;
                user.NewPasswordKey = null;
                _userManager.Database.SaveChanges();
                return HttpNotFound();
            }

            // Open the new password screen

            ressources.Load(_userManager.Database, 1);

            return View(new UserViewModel(ressources, new UserRecord(), false));
        }

        /// <summary>
        /// URL ~/Administration/User/NewPassword (Form submit)
        /// </summary>
        /// <param name="key"></param>
        /// <param name="login"></param>
        /// <param name="newPassword1"></param>
        /// <param name="newPassword2"></param>
        /// <returns></returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult NewPassword(string key, string login, string newPassword1, string newPassword2)
        {
            Debug($"Post ~/Administration/User/NewPassword({login}, {key})");

            bool loginIncorrect = false;

            // read the multilingual dictionary

            LanguageDictionary ressources = new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);
            ressources.Load(_userManager.Database, 1);

            // check the value by itself

            Errors errors = new Errors();

            if (string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(login))
            {
                errors.AddField("Login", "ERR_FIELD_REQUIRED", new object[] { "{USER_LOGIN}" });
            }
            else
            {
                // Check if the login exists ...

                UserRecord user = _userManager.GetByLogin(login);
                if (user == null || String.IsNullOrEmpty(user.NewPasswordKey) || !user.NewPasswordKey.Equals(key))
                {
                    loginIncorrect = true;
                    errors.AddGlobal("ERR_LOGIN_INCORRECT");
                }
            }

            if (string.IsNullOrWhiteSpace(newPassword1))
                errors.AddField("NewPassword1", "ERR_FIELD_REQUIRED", new object[] { "{USER_NEW_PASSWORD}" });

            if (string.IsNullOrWhiteSpace(newPassword2))
                errors.AddField("NewPassword2", "ERR_FIELD_REQUIRED", new object[] { "{USER_RETYPE_PASSWORD}" });

            if (!loginIncorrect &&
                !string.IsNullOrWhiteSpace(newPassword1) &&
                !string.IsNullOrWhiteSpace(newPassword2) &&
                !newPassword1.Equals(newPassword2))
                errors.AddGlobal("ERR_LOGIN_INCORRECT");

            if (errors.HasError)
            {
                SetModelState(ModelState, ressources, errors);
                return View(new UserViewModel(ressources, new UserRecord(), false));
            }

            // Update the password

            try
            {
                _userManager.SetNewPassword(login, newPassword1);
            }
            catch (System.Exception ex)
            {
                Error($"An exception occurs on updating the password: {ex.Message}");
            }

            // Sign out the user and resign the user

            FormsAuthentication.SignOut();
            return RedirectToAction("SignIn");
        }

        /// <summary>
        /// Constructor within a userManager defined
        /// </summary>
        public UserController(UserManager userContext) : base(userContext) { }

        /// <summary>
        /// Constructor by default
        /// </summary>
        public UserController() : base() { }
    }
}