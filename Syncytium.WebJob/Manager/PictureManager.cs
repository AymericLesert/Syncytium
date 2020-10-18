using Syncytium.Common.Database.DSSchema;
using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Models;
using Syncytium.Module.Customer.Models;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Web;

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

namespace Syncytium.WebJob.Manager
{
    /// <summary>
    /// Handle the list of pictures
    /// </summary>
    public class PictureManager 
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected virtual string MODULE => typeof(PictureManager).Name;

        /// <summary>
        /// Indicates if the verbose mode is enabled or not
        /// </summary>
        /// <returns></returns>
        protected bool IsVerbose() => Common.Logger.LoggerManager.Instance.IsVerbose;

        /// <summary>
        /// Log a verbose message
        /// </summary>
        /// <param name="message"></param>
        protected void Verbose(string message) => Common.Logger.LoggerManager.Instance.Verbose(MODULE, message);

        /// <summary>
        /// Indicates if the debug mode is enabled or not
        /// </summary>
        /// <returns></returns>
        protected bool IsDebug() => Common.Logger.LoggerManager.Instance.IsDebug;

        /// <summary>
        /// Log a debug message
        /// </summary>
        /// <param name="message"></param>
        protected void Debug(string message) => Common.Logger.LoggerManager.Instance.Debug(MODULE, message);

        /// <summary>
        /// Log an info message
        /// </summary>
        /// <param name="message"></param>
        protected void Info(string message) => Common.Logger.LoggerManager.Instance.Info(MODULE, message);

        /// <summary>
        /// Log a warn message
        /// </summary>
        /// <param name="message"></param>
        protected void Warn(string message) => Common.Logger.LoggerManager.Instance.Warn(MODULE, message);

        /// <summary>
        /// Log an error message
        /// </summary>
        /// <param name="message"></param>
        protected void Error(string message) => Common.Logger.LoggerManager.Instance.Error(MODULE, message);

        /// <summary>
        /// Log an exception message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        protected void Exception(string message, System.Exception ex) => Common.Logger.LoggerManager.Instance.Exception(MODULE, message, ex);

        #endregion

        #region Images

        /// <summary>
        /// Reference Convert the filename into a base64 picture
        /// </summary>
        /// <param name="filename"></param>
        /// <param name="width"></param>
        /// <param name="height"></param>
        /// <returns></returns>
        public Tuple<string, string> GetImage(string filename, int width, int height)
        {
            if (images.ContainsKey(filename))
                return Tuple.Create(filename, images[filename]);

            string image = "";
            string fullFilename = "";

            // look for png file

            try
            {
                fullFilename = ConfigurationManager.ServerHttpRootImages + filename + ".png";
                Debug($"Loading {fullFilename} ...");

                using (WebClient webClient = new WebClient())
                    image = Syncytium.Common.Picture.PictureManager.GetPngBase64(webClient.DownloadData(fullFilename), width, height);
            }
            catch (Exception)
            {
                try
                {
                    fullFilename = ConfigurationManager.ServerFileRootImages.Replace('/', '\\') + "\\" + filename.Replace('/', '\\') + ".png";
                    Debug($"Loading {fullFilename} ...");

                    image = Syncytium.Common.Picture.PictureManager.GetPngBase64(File.ReadAllBytes(fullFilename), width, height);
                }
                catch (Exception)
                {
                }
            }

            // look for svg file

            if (String.IsNullOrWhiteSpace(image))
            {
                try
                {
                    fullFilename = ConfigurationManager.ServerHttpRootImages + filename + ".svg";
                    Debug($"Loading {fullFilename} ...");

                    using (WebClient webClient = new WebClient())
                        image = Syncytium.Common.Picture.PictureManager.GetSvgBase64(webClient.DownloadData(fullFilename), width, height);
                }
                catch (Exception)
                {
                    try
                    {
                        fullFilename = ConfigurationManager.ServerFileRootImages.Replace('/', '\\') + "\\" + filename.Replace('/', '\\') + ".svg";
                        Debug($"Loading {fullFilename} ...");

                        image = Syncytium.Common.Picture.PictureManager.GetSvgBase64(File.ReadAllBytes(fullFilename), width, height);
                    }
                    catch (Exception)
                    {
                        Warn($"Unable to load {filename} (in svg or png)");
                    }
                }
            }

            images[filename] = image;
            Debug($"Image '{filename}' = {image}");
            return Tuple.Create(filename, image);
        }

        /// <summary>
        /// Reference Convert the data into a base64 picture and attach it to a virtual filename
        /// </summary>
        /// <param name="filename"></param>
        /// <param name="data"></param>
        /// <param name="width"></param>
        /// <param name="height"></param>
        /// <returns></returns>
        public Tuple<string, string> GetImage(string filename, byte[] data, int width, int height)
        {
            if (images.ContainsKey(filename))
                return Tuple.Create(filename, images[filename]);

            char[] chars = new char[data.Length / sizeof(char)];
            Buffer.BlockCopy(data, 0, chars, 0, data.Length);
            string strImage = new string(chars);
            string image = Syncytium.Common.Picture.PictureManager.GetPngBase64(Convert.FromBase64String(strImage.Substring(strImage.IndexOf(',')+1)), width, height);

            images[filename] = image;
            Debug($"Image '{filename}' = {image}");
            return Tuple.Create(filename, image);
        }

        #endregion

        /// <summary>
        /// List of images to put into the email
        /// </summary>
        private Dictionary<string, string> images = new Dictionary<string, string>();

        /// <summary>
        /// Retrieve the image attached to the enumerable value
        /// </summary>
        public Tuple<string, string> GetImageEnumeration<T>(T value) => GetImage(DSDatabase.GetDirectory(typeof(T)) + value.ToString(), 30, 30);

        /// <summary>
        /// Retrieve the picture of the user
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public Tuple<string, string> GetPicture(UserRecord user)
        {
            if (user == null || user.Picture == null)
                return GetImage("User", 30, 30);

            return GetImage("User/User_" + user.Id.ToString(), user.Picture, 30, 30);
        }

        /// <summary>
        /// Convert a Tuple string, string into an attachment file
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        public Tuple<string, LinkedResource> GetAttachmentFile(Tuple<string, string> file)
        {
            if (file == null)
                return null;

            LinkedResource linkedResource = null;

            if (String.IsNullOrWhiteSpace(file.Item2))
                return Tuple.Create(file.Item1, linkedResource);

            using (MemoryStream stream = new MemoryStream(Convert.FromBase64String(file.Item2)))
            {
                Image image = Image.FromStream(stream);
                Bitmap bitmap = new Bitmap(image);
                MemoryStream newStream = new MemoryStream();
                bitmap.Save(newStream, System.Drawing.Imaging.ImageFormat.Png);
                newStream.Seek(0, SeekOrigin.Begin);

                linkedResource = new LinkedResource(newStream, "image/png");
            }

            return Tuple.Create(file.Item1, linkedResource);
        }

        /// <summary>
        /// Remove all images from the cache to force the system to load agin the pictures
        /// </summary>
        public void Clear()
        {
            images.Clear();
        }

        /// <summary>
        /// Get the attachment file attached to the picture and store it into the list of attachment files
        /// </summary>
        /// <param name="listAttachmentFiles"></param>
        /// <param name="file"></param>
        /// <param name="label"></param>
        /// <returns></returns>
        public static string GetAttachmentFile(Dictionary<string, LinkedResource> listAttachmentFiles, Tuple<string, string> file, string label = null)
        {
            string image = null;

            if (file == null)
                return "";

            if (listAttachmentFiles == null)
            {
                image = "<img src='data:image/png;base64," + file.Item2 + "' alt=\"" + file.Item1 + "\" />";
            }
            else
            {
                if (!listAttachmentFiles.ContainsKey(file.Item1))
                {
                    Tuple<string, LinkedResource> newAttachment = PictureManager.Instance.GetAttachmentFile(file);
                    if (newAttachment != null)
                        listAttachmentFiles[file.Item1] = newAttachment.Item2;
                }

                if (!listAttachmentFiles.ContainsKey(file.Item1) || listAttachmentFiles[file.Item1] == null)
                    return HttpUtility.HtmlEncode(label ?? "");

                image = "<img src='cid:" + listAttachmentFiles[file.Item1].ContentId + "' alt=\"" + file.Item1 + "\" />";
            }

            if (!String.IsNullOrWhiteSpace(label))
                image += "<br />" + HttpUtility.HtmlEncode(label);

            return image;
        }

        /// <summary>
        /// Instance of the current instance
        /// </summary>
        private static PictureManager _instance;

        /// <summary>
        /// Constructor of the manager
        /// </summary>
        private PictureManager() { }

        /// <summary>
        /// Retrieve the current instance or define a new instance of manager
        /// </summary>
        public static PictureManager Instance
        {
            get
            {
                if (_instance == null)
                    _instance = new PictureManager();

                return _instance;
            }
        }
    }
}
