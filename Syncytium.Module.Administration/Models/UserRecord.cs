using Syncytium.Common.Database.DSModel;
using Syncytium.Common.Database.DSAnnotation;
using Syncytium.Common.Database.DSAnnotation.DSConstraint;
using Syncytium.Common.Database.DSAnnotation.DSControl;
using Syncytium.Common.Database.DSAnnotation.DSFormat;
using Syncytium.Common.Managers;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Cryptography;
using System.Text;
using static Syncytium.Common.Database.DSModel.UserProfile;
using Newtonsoft.Json;
using Syncytium.Common.Logger;

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
    /// Describe the user's profil
    /// </summary>
    [Table("User")]
    [DSLot(Capacity = 16)]
    [DSRestricted(Area = DatabaseContext.AREA_NAME, Action = "*", Profile = EUserProfile.Administrator)]
    [DSRestricted(Area = "Customer", Action = "*", Profile = EUserProfile.Supervisor)]
    [DSRestricted(Area = "*", Action = "Read")]
    [DSRestricted(Area = "*", Action = "Update")]
    [DSRestricted(Area = "*", Action = "NewPassword")]
    public class UserRecord : DSRecordWithCustomerId, IUser
    {
        /// <summary>
        /// Login to sign in on the application (must be unique)
        /// </summary>
        [Required]
        [DSUnique(ForCustomer = false)]
        [DSString(Max = 40)]
        public string Login { get; set; } = String.Empty;

        /// <summary>
        /// Password crypted
        /// </summary>
        [JsonIgnore]
        [DSRestricted]
        public string Password { get; set; } = null;

        /// <summary>
        /// Registration field (identity to the company)
        /// </summary>
        [DSString(Max = 16)]
        public string Registration { get; set; } = String.Empty;

        /// <summary>
        /// Label to use for the user in the application
        /// </summary>
        [Required]
        [DSString(Max = 64)]
        public string Name { get; set; } = String.Empty;

        /// <summary>
        /// Email of the user (used to send notifications)
        /// </summary>
        [Required]
        [DSString(Max = 128)]
        [DSEmail]
        public string Email { get; set; } = String.Empty;

        /// <summary>
        /// Creation date of the profile
        /// </summary>
        [DSDateTime(Format = "YYYY-MM-DD")]
        [DSRestricted(Area = DatabaseContext.AREA_NAME)]
        [DSRestricted(Area = "Customer")]
        public DateTime? CreationDate { get; set; } = null;

        /// <summary>
        /// End date of the validation
        /// </summary>
        [DSDateTime(Format = "YYYY-MM-DD")]
        [DSRestricted(Area = DatabaseContext.AREA_NAME)]
        [DSRestricted(Area = "Customer")]
        [DSRestricted(Area = "*", Action = "Read")]
        public DateTime? EndDate { get; set; } = null;

        /// <summary>
        /// User's photo
        /// </summary>
        [DSFile]
        public byte[] Picture { get; set; } = null;

        /// <summary>
        /// Current language "EN", "FR" or "SP"
        /// </summary>
        [Required]
        [DSString(Max = 2, Min = 2)]
        public string Language { get; set; } = ConfigurationManager.DefaultLanguage;

        /// <summary>
        /// Password key crypted (link given to the user asking a new password)
        /// </summary>
        [JsonIgnore]
        [DSRestricted]
        public string NewPasswordKey { get; set; } = null;

        /// <summary>
        /// Date and time of the expiricy of the new password asking
        /// </summary>
        [DSRestricted]
        public DateTime? NewPasswordDate { get; set; } = null;

        /// <summary>
        /// Check if the password given corresponds to the password into the user description
        /// </summary>
        /// <param name="password"></param>
        /// <returns></returns>
        public bool CheckPassword(string password) => !String.IsNullOrWhiteSpace(password) && !String.IsNullOrWhiteSpace(Password) && EncryptPassword(password).Equals(Password);

        /// <summary>
        /// Check if the user is enable (endDate is null or current date &lt;= endDate)
        /// </summary>
        /// <returns></returns>
        public bool IsEnable() => (EndDate == null || DateTime.Now.CompareTo(EndDate.Value) <= 0);

        /// <summary>
        /// Encrypt the password 
        /// </summary>
        /// <param name="password"></param>
        /// <returns></returns>
        public static string EncryptPassword(string password)
        {
            using (SHA256Managed sha1 = new SHA256Managed())
            {
                var hash = sha1.ComputeHash(Encoding.UTF8.GetBytes(password));
                var sb = new StringBuilder(hash.Length * 2);

                foreach (byte b in hash)
                    sb.Append(b.ToString("X2"));

                LoggerManager.Instance.Debug("UserRecord", $"Encrypt password '{password}' => '{sb}'");
                return sb.ToString();
            }
        }

        #region static functions

        /// <summary>
        /// Check if the profile given in parameter is allowed for the current profile
        /// </summary>
        /// <param name="userProfile"></param>
        /// <param name="profile"></param>
        /// <returns></returns>
        public static bool IsInRole(EUserProfile userProfile, EUserProfile profile)
        {
            switch (userProfile)
            {
                case EUserProfile.Administrator:
                    return true;

                case EUserProfile.Supervisor:
                    return (profile == EUserProfile.Supervisor || profile == EUserProfile.User || profile == EUserProfile.Other || profile == EUserProfile.None);

                case EUserProfile.User:
                    return (profile == EUserProfile.User || profile == EUserProfile.Other || profile == EUserProfile.None);

                case EUserProfile.Other:
                    return (profile == EUserProfile.Other || profile == EUserProfile.None);

                case EUserProfile.None:
                    return false;
            }

            return false;
        }

        /// <summary>
        /// Create an administrator user by applying default properties
        /// </summary>
        /// <returns></returns>
        public static UserRecord CreateDefaultAdministrator()
        {
            UserRecord administrator = new UserRecord()
            {
                Login = ConfigurationManager.AdministratorLogin,
                Password = ConfigurationManager.AdministratorPassword,
                Name = "Administrator",
                CustomerId = 1
            };
            return administrator;
        }

        #endregion

        /// <summary>
        /// Constructor
        /// </summary>
        public UserRecord() : base() { }
    }
}