using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Managers;
using System.Collections.Generic;
using System.IO;
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

namespace Syncytium.Module.Administration.Models
{
    /// <summary>
    /// Handle a multilingual dictionary (attached a message to a language within some parameters)
    /// </summary>
    public class LanguageDictionary
    {
        /// <summary>
        /// Reference on the directory into the server containing all images
        /// </summary>
        public static string DIRECTORY_IMAGE = "~/Content/Images/";

        /// <summary>
        /// List of default labels grouped by keys
        /// </summary>
        private Dictionary<string, LanguageLabel> _defaults { get; }

        /// <summary>
        /// List of labels grouped by keys
        /// </summary>
        private Dictionary<string, LanguageLabel> _labels { get; }

        /// <summary>
        /// Default language
        /// </summary>
        public string DefaultLanguage { get; }

        /// <summary>
        /// Retrieve the list of languages
        /// </summary>
        public List<string> ListOfLanguages => new List<string>() { "FR", "EN" };

        /// <summary>
        /// Retrieve the list of images containing into ~/Content/Images
        /// </summary>
        public List<string> ListOfImages { get; }

        /// <summary>
        /// Retrieve the list of images into a JSON format
        /// </summary>
        public string JsonListOfImages
        {
            get
            {
                string images = "";
                foreach (string image in ListOfImages)
                {
                    if ( image.StartsWith("Areas/") )
                        images += (images.Length == 0 ? "" : ",") + image.Substring(6);
                }
                return images;
            }
        }

        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        private static readonly string MODULE = typeof(LanguageDictionary).Name;

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

        #region Private methods

        /// <summary>
        /// Declare a new label into the multilingual dictionary (in the default dictionary)
        /// </summary>
        /// <param name="key"></param>
        /// <param name="FR"></param>
        /// <param name="EN"></param>
        /// <param name="comment"></param>
        private void DeclareDefaultLabel(string key, string FR, string EN, string comment)
        {
            if (key == null)
                return;

            LanguageLabel newLabel = new LanguageLabel(FR, EN, comment);
            _defaults[key.Trim()] = newLabel;
        }

        /// <summary>
        /// Set a list of labels by default
        /// </summary>
        private void LoadDefault()
        {
            DeclareDefaultLabel("AREA_ADMINISTRATION", "Administration", "Administration", "");

            DeclareDefaultLabel("BTN_CANCEL", "Annuler", "Cancel", "");
            DeclareDefaultLabel("BTN_CONNECT", "Connection", "Connect", "");
            DeclareDefaultLabel("BTN_FORGET_PASSWORD", "Mot de passe oublié ?", "Forgotten password", "");
            DeclareDefaultLabel("BTN_OK", "OK", "OK", "");
            DeclareDefaultLabel("BTN_REMEMBER_ME", "Se souvenir de moi", "Remember me", "");
            DeclareDefaultLabel("BTN_SEND_EMAIL", "Envoi un email", "Send email", "");
            DeclareDefaultLabel("BTN_SUBMIT", "Valider", "Submit", "");
            DeclareDefaultLabel("BTN_UPGRADE", "METTRE A JOUR", "Upgrade", "");

            DeclareDefaultLabel("ERR_FIELD_REQUIRED", "Le champ '{0}' est requis", "The field '{0}' is mandatory", "0: nom du champ");
            DeclareDefaultLabel("ERR_LOGIN_INCORRECT", "Identifiant et mot de passe incorrect", "Login and password incorrect", "");
            DeclareDefaultLabel("ERR_ALREADYCONNECTED", "Déjà connectée", "Already connected", "");
            DeclareDefaultLabel("ERR_EXCEPTION_UNEXPECTED", "Une exception inattendue est survenue durant le traitement de la requête", "Unexpected exception on treating request", "");

            DeclareDefaultLabel("UPGRADE", "Application mise à jour", "Application upgraded", "");
            DeclareDefaultLabel("UPGRADING", "Mise à jour de l\"application ...", "Upgrading the application", "");

            DeclareDefaultLabel("USER_LOGIN", "Identifiant", "Login", "");
            DeclareDefaultLabel("USER_PASSWORD", "Mot de passe", "Password", "");

            DeclareDefaultLabel("CUSTOMER", "Client", "Customer", "");
            DeclareDefaultLabel("CUSTOMER_ADDRESS", "Adresse du client", "Address", "");
            DeclareDefaultLabel("CUSTOMER_COMMENT", "Commentaire", "Comment", "");
            DeclareDefaultLabel("CUSTOMER_EMAIL", "Email du responsable", "Email", "");
            DeclareDefaultLabel("CUSTOMER_NAME", "Nom du client", "Name", "");

            DeclareDefaultLabel("FOOTER_ADMINISTRATION", "Mode Administration", "Administration mode", "");
            DeclareDefaultLabel("FOOTER_Syncytium", "Développé par Aymeric LESERT", "Written by Aymeric LESERT", "");
        }

        /// <summary>
        /// Load of images files into the given directory
        /// </summary>
        /// <param name="startString"></param>
        /// <param name="directory"></param>
        private void LoadDirectoryImages(int startString, string directory)
        {
            foreach (string filename in Directory.GetFiles(directory))
            {
                string file = filename.Substring(startString);
                if (file[0] == '\\')
                    file = file.Substring(1);

                if (!file.EndsWith(".txt"))
                    ListOfImages.Add(file.Replace('\\', '/'));
            }

            foreach (string subDirectory in Directory.GetDirectories(directory))
                LoadDirectoryImages(startString, subDirectory);
        }

        /// <summary>
        /// Load of images files into the given directory
        /// </summary>
        /// <param name="directory"></param>
        private void LoadImages(string directory)
        {
            if (directory == null)
                return;

            LoadDirectoryImages(directory.Length, directory);
        }

        /// <summary>
        /// Retrieves the key on depends on the language
        /// </summary>
        /// <param name="language">"FR", "EN" or "ES"</param>
        /// <param name="key">Key of the label</param>
        /// <param name="parameters">list of parameters - null or empty if you want the label without parameters</param>
        /// <returns></returns>
        private string GetDefaultLabel(string language, string key, params object[] parameters)
        {
            if (!_defaults.ContainsKey(key.Trim()))
                return key.Trim();

            LanguageLabel currentLabel = _defaults[key.Trim()];
            if (currentLabel == null)
                return key;

            if (!currentLabel.Languages.ContainsKey(language.Trim()))
                return key;

            if (parameters == null || parameters.Count() == 0)
                return currentLabel.Languages[language.Trim()];

            return Interpolation(language, currentLabel.Languages[language.Trim()], parameters);
        }

        /// <summary>
        /// Replace parameters if necessary
        /// </summary>
        /// <param name="language"></param>
        /// <param name="label"></param>
        /// <param name="parameters"></param>
        /// <returns></returns>
        private string Interpolation(string language, string label, object[] parameters)
        {
            // convert parameters if necessary

            string[] currentParameters = new string[parameters.Length];
            for (int i = 0; i < parameters.Length; i++)
            {
                string strParameter = parameters[i].ToString();
                if (strParameter.StartsWith("{") && strParameter.EndsWith("}"))
                    strParameter = GetLabel(language, strParameter.Substring(1, strParameter.Length - 2));
                currentParameters[i] = strParameter;
            }

            return string.Format(label, currentParameters);
        }

        #endregion

        /// <summary>
        /// Remove all labels
        /// </summary>
        public void Clear()
        {
            _labels.Clear();
        }

        /// <summary>
        /// Declare a new label into the multilingual dictionary
        /// </summary>
        /// <param name="key"></param>
        /// <param name="FR"></param>
        /// <param name="EN"></param>
        /// <param name="comment"></param>
        public LanguageLabel DeclareLabel(string key, string FR, string EN, string comment)
        {
            if (key == null)
                return null;

            LanguageLabel newLabel = new LanguageLabel(FR, EN, comment);
            _labels[key.Trim()] = newLabel;
            return newLabel;
        }

        /// <summary>
        /// Retrieves the key on depends on the language
        /// </summary>
        /// <param name="language">"FR", "EN" or "ES"</param>
        /// <param name="key">Key of the label</param>
        /// <param name="parameters">list of parameters - null or empty if you want the label without parameters</param>
        /// <returns></returns>
        public string GetLabel(string language, string key, params object[] parameters)
        {
            if (key == null)
                return string.Empty;

            if (language == null)
                return GetLabel(DefaultLanguage, key, parameters);

            if (!_labels.ContainsKey(key.Trim()))
                return GetDefaultLabel(language, key, parameters);

            LanguageLabel currentLabel = _labels[key.Trim()];
            if (currentLabel == null)
                return GetDefaultLabel(language, key, parameters);

            if (!currentLabel.Languages.ContainsKey(language.Trim()))
                return key;

            if (parameters == null || parameters.Count() == 0)
                return currentLabel.Languages[language.Trim()];

            return Interpolation(language, currentLabel.Languages[language.Trim()], parameters);
        }

        /// <summary>
        /// Update or create a label into the dictionary
        /// </summary>
        /// <param name="language"></param>
        /// <param name="key"></param>
        /// <param name="label"></param>
        /// <param name="comment"></param>
        public void SetLabel(string language, string key, string label, string comment = "")
        {
            if (key == null || language == null)
                return;

            if (!_labels.ContainsKey(key.Trim()))
            {
                _labels[key.Trim()] = new LanguageLabel(comment);
                return;
            }

            LanguageLabel currentLabel = _labels[key.Trim()];
            if (currentLabel == null)
                return;

            currentLabel.SetLabel(language, label, comment);
        }

        /// <summary>
        /// Load once all languages and all labels
        /// </summary>
        /// <param name="database"></param>
        /// <param name="customerId"></param>
        public void Load(DatabaseContext database, int customerId)
        {
            if (database == null)
            {
                Error("No database defined ... unable to load all labels into the multilingual dictionary");
                return;
            }

            // Remove all existing labels

            if (_labels.Count > 0)
            {
                Debug("Reloading labels ...");
                _labels.Clear();
            }
            else
            {
                Debug("Loading labels ...");
            }

            // Load all labels and add it into the manager

            try
            {
                int i = 0;

                foreach (LanguageRecord label in LanguageManager.GetInstance(database, customerId).GetLabels(customerId))
                {
                    LanguageLabel newLabel = DeclareLabel(label.Key, label.FR, label.EN, label.Comment);

                    if (newLabel == null)
                        continue;

                    i++;
                }

                Debug($"{i} labels loaded");
            }
            catch (System.Exception ex)
            {
                Exception("Unable to load all labels", ex);
            }
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="directory"></param>
        public LanguageDictionary(string directory)
        {
            DefaultLanguage = "FR";
            _defaults = new Dictionary<string, LanguageLabel>();
            _labels = new Dictionary<string, LanguageLabel>();
            ListOfImages = new List<string>();

            LoadDefault();
            LoadImages(directory);
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="directory"></param>
        /// <param name="defaultLanguage"></param>
        public LanguageDictionary(string directory, string defaultLanguage)
        {
            DefaultLanguage = (defaultLanguage == null ? "FR" : defaultLanguage.Trim());
            _defaults = new Dictionary<string, LanguageLabel>();
            _labels = new Dictionary<string, LanguageLabel>();
            ListOfImages = new List<string>();

            LoadDefault();
            LoadImages(directory);
        }
    }
}