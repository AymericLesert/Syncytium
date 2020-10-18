using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Error;
using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Models;
using Syncytium.Web.Areas.ViewModels;
using Syncytium.Web.Controllers;
using Syncytium.Web.Filters;
using System.Linq;
using System.Web.Mvc;

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

namespace Syncytium.Web.Areas.Administration.Controllers
{
    /// <summary>
    /// Handle the customer controller
    /// </summary>
    public class CustomerController : SyncytiumController
    {
        /// <summary>
        /// URL ~/Administration/Customer/Index
        /// </summary>
        /// <returns></returns>
        [RoleFilter(AllModules = false)]
        public ActionResult Index()
        {
            Debug("Get ~/Administration/Customer/Index()");

            // Only for administrator from the first customer (Syncytium)

            if (!(_userManager.GetById(int.Parse(HttpContext.User.Identity.Name)) is UserRecord user) || user.CustomerId != 1)
                return HttpNotFound();

            // load ressources before designing the screen fitted to the user's profile

            LanguageDictionary ressources = new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);
            ressources.Load(_userManager.Database, user.CustomerId);

            // load all existing customers

            CustomerViewModel viewModel = new CustomerViewModel(ressources, user);
            foreach (CustomerRecord customer in _userManager.Database.Customer)
                viewModel.Customers.Add(customer);

            return View("Index", viewModel);
        }

        /// <summary>
        /// URL ~/Administration/Customer/Add
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [RoleFilter(AllModules = false)]
        public ActionResult Add()
        {
            Debug($"Get ~/Administration/Customer/Add()");

            // Only for administrator from the first customer (Syncytium)

            if (!(_userManager.GetById(int.Parse(HttpContext.User.Identity.Name)) is UserRecord user) || user.CustomerId != 1)
                return HttpNotFound();

            // load ressources before designing the screen fitted to the user's profile

            LanguageDictionary ressources = new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);
            ressources.Load(_userManager.Database, user.CustomerId);

            return View(new CustomerViewModel(ressources, user));
        }

        /// <summary>
        /// URL ~/Administration/Customer/Add (Form submit)
        /// </summary>
        /// <param name="name"></param>
        /// <param name="login"></param>
        /// <param name="email"></param>
        /// <param name="address"></param>
        /// <param name="comment"></param>
        /// <returns></returns>
        [HttpPost]
        [RoleFilter(AllModules = false)]
        public ActionResult Add(string name, string login, string email, string address, string comment)
        {
            Debug($"Get ~/Administration/Customer/Add(name={name}, login={login}, email={email}, address={address}, comment={comment})");

            // Only for administrator from the first customer (Syncytium)

            if (!(_userManager.GetById(int.Parse(HttpContext.User.Identity.Name)) is UserRecord user) || user.CustomerId != 1)
                return HttpNotFound();

            // check the value by itself

            Errors errors = new Errors();

            // no name set

            if (string.IsNullOrWhiteSpace(name))
                errors.AddField("Name", "ERR_FIELD_REQUIRED", new object[] { "{CUSTOMER_NAME}" });
            name = name.Trim();

            // no login set

            if (string.IsNullOrWhiteSpace(login))
                errors.AddField("Login", "ERR_FIELD_REQUIRED", new object[] { "{CUSTOMER_LOGIN}" });
            login = login.Trim();

            // no email set

            if (string.IsNullOrWhiteSpace(email))
                errors.AddField("Email", "ERR_FIELD_REQUIRED", new object[] { "{CUSTOMER_EMAIL}" });
            email = email.Trim();

            // check if the name already exists

            if (_userManager.Database.Customer.Where(c => c.Name.Equals(name)).Any())
                errors.AddField("Name", "ERR_FIELD_UNIQUE", new object[] { "{CUSTOMER_NAME}" });

            // check if the login already exists

            bool loginExist = false;
            foreach (UserRecord record in _userManager.Database.User.Where(u => u.Login.Equals(login)).ToList())
            {
                // User deleted ?

                InformationRecord information = _userManager.Database._Information.FirstOrDefault(info => info.Id == record.Id && info.Table.Equals("User"));
                if (information == null || information.DeleteTick == null)
                {
                    loginExist = true;
                    break;
                }
            }

            if (loginExist)
                errors.AddField("Name", "ERR_FIELD_UNIQUE", new object[] { "{CUSTOMER_LOGIN}" });

            // load ressources before designing the screen fitted to the user's profile

            LanguageDictionary ressources = new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);
            ressources.Load(_userManager.Database, user.CustomerId);

            if (errors.HasError)
            {
                // update ModelState on depends on errors

                SetModelState(ModelState, ressources, errors);
                return View(new CustomerViewModel(ressources, user));
            }

            // Create a new customer

            Info($"Creating of a new customer ('{name}', '{login}', '{email}', '{address}', '{comment}') ...");

            CustomerRecord newCustomer = new CustomerRecord()
            {
                Name = name,
                Login = login,
                Email = email,
                Address = address,
                Comment = comment
            };
            _userManager.Database.Customer.Add(newCustomer);
            _userManager.Database.SaveChanges();

            Info($"Customer created {newCustomer}");

            // Add the parameter "Language.Tick.<customerId>" into the parameter table

            _userManager.Database._Parameter.Add(new ParameterRecord() { Key = $"Language.Tick.{newCustomer.Id}", Value = "0" });

            // Duplicate multilanguage dictionary (from the customer 1 to the new one)

            Info($"Duplicating multilanguage labels ...");

            int nbLabels = 0;
            foreach (LanguageRecord languageRecord in _userManager.Database.Language.Where(l => l.CustomerId == 1).ToList())
            {
                LanguageRecord newLanguageRecord = LanguageRecord.Copy(languageRecord) as LanguageRecord;
                newLanguageRecord.CustomerId = newCustomer.Id;
                _userManager.Database.Language.Add(newLanguageRecord);
                nbLabels++;
            }

            Info($"{nbLabels} labels duplicated");

            // Create the administrator for this new customer

            UserRecord newUser = new UserRecord()
            {
                Login = login,
                Registration = name,
                Name = name,
                Email = email,
                Language = user.Language,
                CustomerId = newCustomer.Id
            };
            _userManager.Database.User.Add(newUser);
            _userManager.Database.SaveChanges();
            Info($"Creating a new user {newUser} ...");

            ModuleRecord newModule = new ModuleRecord()
            {
                Name = "Administration",
                Module = ModuleRecord.EModule.Administration,
                Profile = UserProfile.EUserProfile.Administrator,
                Enable = true,
                CustomerId = newCustomer.Id
            };
            _userManager.Database.Module.Add(newModule);
            _userManager.Database.SaveChanges();
            Info($"Module({newModule.Id}) created");

            UserModuleRecord newUserModule = new UserModuleRecord()
            {
                UserId = newUser.Id,
                ModuleId = newModule.Id,
                Default = true,
                CustomerId = newCustomer.Id
            };
            _userManager.Database.UserModule.Add(newUserModule);
            _userManager.Database.SaveChanges();
            Info($"UserModule({newUserModule.Id}) created");

            // send a mail for the new user

            Info($"Sending an email to create the password ...");

            using (UserController controller = new UserController(_userManager))
                controller.SendNewPassword(newUser.Login);

            Info($"Customer created ...");

            return RedirectToAction("Index");
        }

        /// <summary>
        /// URL ~/Administration/Customer/Update
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet]
        [RoleFilter(AllModules = false)]
        public ActionResult Update(int id)
        {
            Debug($"Get ~/Administration/Customer/Update(id={id})");

            // Only for administrator from the first customer (Syncytium)

            if (!(_userManager.GetById(int.Parse(HttpContext.User.Identity.Name)) is UserRecord user) || user.CustomerId != 1)
                return HttpNotFound();

            // load ressources before designing the screen fitted to the user's profile

            LanguageDictionary ressources = new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);
            ressources.Load(_userManager.Database, user.CustomerId);

            // get the current customer

            CustomerViewModel viewModel = new CustomerViewModel(ressources, user, _userManager.Database.Customer.Find(id));
            if (viewModel.Customer == null)
                return HttpNotFound();

            return View(viewModel);
        }

        /// <summary>
        /// URL ~/Administration/Customer/Update (Form submit)
        /// </summary>
        /// <param name="id"></param>
        /// <param name="name"></param>
        /// <param name="login"></param>
        /// <param name="email"></param>
        /// <param name="address"></param>
        /// <param name="comment"></param>
        /// <returns></returns>
        [HttpPost]
        [RoleFilter(AllModules = false)]
        public ActionResult Update(int id, string name, string login, string email, string address, string comment)
        {
            Debug($"Get ~/Administration/Customer/Update(id={id}, name={name}, login={login}, email={email}, address={address}, comment={comment})");

            // Only for administrator from the first customer (Syncytium)

            if (!(_userManager.GetById(int.Parse(HttpContext.User.Identity.Name)) is UserRecord user) || user.CustomerId != 1)
                return HttpNotFound();

            // The customer has to exist

            CustomerRecord customer = _userManager.Database.Customer.Find(id);
            if (customer == null)
                return HttpNotFound();

            // check the value by itself

            Errors errors = new Errors();

            // no name set

            if (string.IsNullOrWhiteSpace(name))
                errors.AddField("Name", "ERR_FIELD_REQUIRED", new object[] { "{CUSTOMER_NAME}" });
            name = name.Trim();

            // no login set

            if (string.IsNullOrWhiteSpace(login))
                errors.AddField("Login", "ERR_FIELD_REQUIRED", new object[] { "{CUSTOMER_LOGIN}" });
            login = login.Trim();

            // no email set

            if (string.IsNullOrWhiteSpace(email))
                errors.AddField("Email", "ERR_FIELD_REQUIRED", new object[] { "{CUSTOMER_EMAIL}" });
            email = email.Trim();

            // check if the name already exists

            if (_userManager.Database.Customer.Where(c => c.Name.Equals(name) && c.Id != customer.Id).Any())
                errors.AddField("Name", "ERR_FIELD_UNIQUE", new object[] { "{CUSTOMER_NAME}" });

            if (!customer.Login.Equals(login))
            {
                // check if the new login already exists

                bool loginExist = false;
                foreach (UserRecord record in _userManager.Database.User.Where(u => u.Login.Equals(login) && u.CustomerId != customer.Id).ToList())
                {
                    // User deleted ?

                    InformationRecord information = _userManager.Database._Information.FirstOrDefault(info => info.Id == record.Id && info.Table.Equals("User"));
                    if (information == null || information.DeleteTick == null)
                    {
                        loginExist = true;
                        break;
                    }
                }

                if (loginExist)
                    errors.AddField("Name", "ERR_FIELD_UNIQUE", new object[] { "{CUSTOMER_LOGIN}" });
            }

            // load ressources before designing the screen fitted to the user's profile

            LanguageDictionary ressources = new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);
            ressources.Load(_userManager.Database, user.CustomerId);

            if (errors.HasError)
            {
                // update ModelState on depends on errors

                SetModelState(ModelState, ressources, errors);
                return View(new CustomerViewModel(ressources, user, new CustomerRecord { Name = name, Login = login, Email = email, Address = address, Comment = comment }));
            }

            // Update the customer

            Info($"Updating the customer ({customer}) within ('{name}', '{login}', '{email}', '{address}', '{comment}') ...");

            // look for the administrator exists

            UserRecord administrator = null;
            foreach (UserRecord record in _userManager.Database.User.Where(u => u.Login.Equals(customer.Login) && u.CustomerId == customer.Id).ToList())
            {
                // User deleted ?

                InformationRecord information = _userManager.Database._Information.FirstOrDefault(info => info.Id == record.Id && info.Table.Equals("User"));
                if (information == null || information.DeleteTick == null)
                {
                    administrator = record;
                    break;
                }
            }

            bool sendEmail = false;
            if (administrator == null)
            {
                Info($"The administrator '{customer.Login}' was removed!");

                administrator = new UserRecord()
                {
                    Login = login,
                    Registration = name,
                    Name = name,
                    Email = email,
                    Language = user.Language,
                    CustomerId = customer.Id
                };
                Info($"Creating a new administrator {administrator} ...");

                _userManager.Database.User.Add(administrator);
                _userManager.Database.SaveChanges();

                sendEmail = true;
            }
            else if (!administrator.Login.Equals(login) || !administrator.Email.Equals(email))
            {
                Info($"The administrator '{administrator}' has to be updated!");

                if (!administrator.Login.Equals(login))
                    administrator.Login = login;

                if (administrator.Registration.Equals(customer.Name))
                    administrator.Registration = name;

                if (administrator.Name.Equals(customer.Name))
                    administrator.Name = name;

                if (!administrator.Email.Equals(email))
                {
                    administrator.Email = email;
                    sendEmail = administrator.Password == null;
                }

                _userManager.Database.SaveChanges();

                Info($"The administrator '{administrator}' is updated!");
            }
            else
            {
                Debug($"The administrator {administrator} doesn't change");
            }

            // check if the administration module is defined and assigned to the user

            ModuleRecord moduleAdministration = null;
            foreach (ModuleRecord record in _userManager.Database.Module.Where(m => m.Module == ModuleRecord.EModule.Administration &&
                                                                                    m.Profile == UserProfile.EUserProfile.Administrator && 
                                                                                    m.CustomerId == customer.Id).ToList())
            {
                // Module deleted ?

                InformationRecord information = _userManager.Database._Information.Find("Module", record.Id);

                if (information != null && information.IsDeleted)
                    continue;

                moduleAdministration = record;
                if (!moduleAdministration.Enable)
                {
                    Info($"The module administrator '{moduleAdministration}' is enabled!");
                    moduleAdministration.Enable = true;
                    _userManager.Database.SaveChanges();
                }
            }

            if (moduleAdministration == null)
            {
                Debug($"Creation of the module administrator");
                moduleAdministration = new ModuleRecord()
                {
                    Name = "Administration",
                    Module = ModuleRecord.EModule.Administration,
                    Profile = UserProfile.EUserProfile.Administrator,
                    Enable = true,
                    CustomerId = customer.Id
                };
                _userManager.Database.Module.Add(moduleAdministration);
                _userManager.Database.SaveChanges();
                Info($"Module({moduleAdministration.Id}) created");
            }

            // check if the module administration is assigned to the administrator

            UserModuleRecord userModuleAdministration = null;
            foreach (UserModuleRecord record in _userManager.Database.UserModule.Where(a => a.ModuleId == moduleAdministration.Id &&
                                                                                            a.UserId == administrator.Id && 
                                                                                            a.CustomerId == customer.Id).ToList())
            {
                // Module deleted ?

                InformationRecord information = _userManager.Database._Information.Find("UserModule", record.Id);

                if (information != null && information.IsDeleted)
                    continue;

                userModuleAdministration = record;
            }

            if (userModuleAdministration == null)
            {
                Debug($"Creation of the association between the user and the module administration");
                userModuleAdministration = new UserModuleRecord()
                {
                    ModuleId = moduleAdministration.Id,
                    UserId = administrator.Id,
                    CustomerId = customer.Id
                };
                _userManager.Database.UserModule.Add(userModuleAdministration);
                _userManager.Database.SaveChanges();
                Info($"UserModule({userModuleAdministration.Id}) created");
            }

            // update the customer

            customer.Name = name;
            customer.Login = login;
            customer.Email = email;
            customer.Address = address;
            customer.Comment = comment;

            _userManager.Database.SaveChanges();

            if (sendEmail)
            {
                // send a mail for the new user

                Info($"Sending an email to create the password ...");

                using (UserController controller = new UserController(_userManager))
                    controller.SendNewPassword(administrator.Login);
            }

            Info($"Customer updated ...");

            return RedirectToAction("Index");
        }

        /// <summary>
        /// URL ~/Administration/Customer/Delete
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet]
        [RoleFilter(AllModules = false)]
        public ActionResult Delete(int id)
        {
            Debug($"Get ~/Administration/Customer/Delete(id={id})");

            // Only for administrator from the first customer (Syncytium)

            if (!(_userManager.GetById(int.Parse(HttpContext.User.Identity.Name)) is UserRecord user) || user.CustomerId != 1)
                return HttpNotFound();

            // load ressources before designing the screen fitted to the user's profile

            LanguageDictionary ressources = new LanguageDictionary(Server.MapPath(LanguageDictionary.DIRECTORY_IMAGE), ConfigurationManager.DefaultLanguage);
            ressources.Load(_userManager.Database, user.CustomerId);

            // get the current customer

            CustomerViewModel viewModel = new CustomerViewModel(ressources, user, _userManager.Database.Customer.Find(id));
            if (viewModel.Customer == null)
                return HttpNotFound();

            return View(viewModel);
        }

        /// <summary>
        /// URL ~/Administration/Customer/Delete (Form submit)
        /// </summary>
        /// <param name="id"></param>
        /// <param name="name"></param>
        /// <param name="login"></param>
        /// <param name="email"></param>
        /// <param name="address"></param>
        /// <param name="comment"></param>
        /// <returns></returns>
        [HttpPost]
        [RoleFilter(AllModules = false)]
        public ActionResult Delete(int id, string name, string login, string email, string address, string comment)
        {
            Debug($"Get ~/Administration/Customer/Delete(id={id}, name={name}, login={login}, email={email}, address={address}, comment={comment})");

            // Only for administrator from the first customer (Syncytium)

            if (!(_userManager.GetById(int.Parse(HttpContext.User.Identity.Name)) is UserRecord user) || user.CustomerId != 1)
                return HttpNotFound();

            // The customer has to exist

            CustomerRecord customer = _userManager.Database.Customer.Find(id);
            if (customer == null)
                return HttpNotFound();

            // Delete the customer in all tables having DSRecordWithCustomerId into the Database context

            Info($"Deleting the customer ({customer}) within ('{name}', '{login}', '{email}', '{address}', '{comment}') ...");

            // Each table is described by a DbSet<> object

            using (Syncytium.Module.Customer.DatabaseContext database = new Syncytium.Module.Customer.DatabaseContext())
            {
                int nbLines = 0;

                // Données référentielles

                nbLines = database.Parameter.Where(r => r.CustomerId == id).Count();
                database.Parameter.RemoveRange(database.Parameter.Where(r => r.CustomerId == id));
                database.SaveChanges();
                Info($"{nbLines} records deleted into 'Parameter'");
            }

            using (Syncytium.Module.Administration.DatabaseContext database = new Syncytium.Module.Administration.DatabaseContext())
            {
                int nbLines = 0;

                // Administration

                nbLines = database.UserModule.Where(r => r.CustomerId == id).Count();
                database.UserModule.RemoveRange(database.UserModule.Where(r => r.CustomerId == id));
                database.SaveChanges();
                Info($"{nbLines} records deleted into 'UserModule'");

                nbLines = database.Module.Where(r => r.CustomerId == id).Count();
                database.Module.RemoveRange(database.Module.Where(r => r.CustomerId == id));
                database.SaveChanges();
                Info($"{nbLines} records deleted into 'Module'");

                database.Notification.RemoveRange(database.Notification.Where(r => r.CustomerId == id));
                database.SaveChanges();
                Info($"{nbLines} records deleted into 'Notification'");

                nbLines = database.User.Where(r => r.CustomerId == id).Count();
                database.User.RemoveRange(database.User.Where(r => r.CustomerId == id));
                database.SaveChanges();
                Info($"{nbLines} records deleted into 'User'");

                nbLines = database.Language.Where(r => r.CustomerId == id).Count();
                database.Language.RemoveRange(database.Language.Where(r => r.CustomerId == id));
                database.SaveChanges();
                Info($"{nbLines} records deleted into 'Language'");

                nbLines = database._Information.Where(r => r.CustomerId == id).Count();
                database._Information.RemoveRange(database._Information.Where(r => r.CustomerId == id));
                database.SaveChanges();
                Info($"{nbLines} records deleted into '_Information'");
            }

            _userManager.Database.Customer.RemoveRange(_userManager.Database.Customer.Where(c => c.Id == id));
            _userManager.Database.SaveChanges();

            Info($"Customer deleted ...");

            return RedirectToAction("Index");
        }
    }
}