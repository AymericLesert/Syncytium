using Syncytium.Common.Managers;
using Syncytium.Module.Administration.Models;
using Syncytium.WebJob.Manager;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Mail;
using System.Net.Mime;
using System.Windows.Forms.DataVisualization.Charting;

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

namespace Syncytium.WebJob.Module.Test
{
    /// <summary>
    /// Abstract class for a job using the database
    /// </summary>
    public class Job : Module.Job
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected override string MODULE => typeof(Job).Name;

        #endregion

        /// <summary>
        /// Method called to execute the request
        /// </summary>
        /// <param name="verbose"></param>
        /// <param name="area"></param>
        /// <param name="schema"></param>
        /// <param name="databaseContext"></param>
        /// <param name="args"></param>
        /// <returns></returns>
        public int Execute(bool verbose, string area, Common.Database.DSSchema.DSDatabase schema, Syncytium.Module.Administration.DatabaseContext databaseContext, string[] args)
        {
            // Retrieve the email of the main administrator of the database

            CustomerRecord mainAdministrator = databaseContext.Customer.Find(1);
            if (mainAdministrator == null)
            {
                Error("The customer (1) doesn't exist into the database!");
                return -1;
            }

            Info($"Sending an email 'Test ({area})' to {mainAdministrator.Email}...");

            try
            {
                // Create the email message

                MailMessage message = new MailMessage();
                message.To.Add(new MailAddress(mainAdministrator.Email));
                message.Subject = $"Test email for area '{area}' within pictures from instance '{ConfigurationManager.DatabaseSchema}' ...";

                // build the body of the email

                string body = "<html>";

                // define head

                body += "<head>";
                body += "</head>";

                // define body

                body += "<body>";
                body += "<div>Hello,<br />This is a test email containing all pictures of the application sending into an email:</div>";
                body += "<table>";
                body += "<tr><th>Picture</th><th>Name</th><th>Comment</th></tr>";

                // Add a chart

                Chart myChart = new Chart()
                {
                    Size = new System.Drawing.Size(640, 320)
                };
                myChart.ChartAreas.Add("ChatArea1");
                myChart.Legends.Add("legend1");

                myChart.Series.Add("sin");
                myChart.Series["sin"].LegendText = "Sin(x)";
                myChart.Series["sin"].ChartType = SeriesChartType.Spline;

                for (double x = 0; x < 2 * Math.PI; x += 0.01)
                    myChart.Series["sin"].Points.AddXY(x, Math.Sin(x));

                // convert chart into a picture

                MemoryStream myChartImage = new MemoryStream();
                myChart.SaveImage(myChartImage, ChartImageFormat.Png);
                myChartImage.Seek(0, SeekOrigin.Begin);

                // attach the picture into the email

                LinkedResource myChartLinkedResource = new LinkedResource(myChartImage, "image/png");

                body += $"<tr><td><img src='cid:{myChartLinkedResource.ContentId}' border='1' width='200' height='100'/></td><td></td><td>A chart</td></tr>";

                // List of users

                List<LinkedResource> listAttachmentFiles = new List<LinkedResource>();
                foreach (UserRecord currentUser in databaseContext.User)
                {
                    Tuple<string, LinkedResource> attachment = PictureManager.Instance.GetAttachmentFile(PictureManager.Instance.GetPicture(currentUser));

                    if (attachment == null)
                        continue;

                    if (attachment.Item2 != null)
                    {
                        listAttachmentFiles.Add(attachment.Item2);
                        body += $"<tr><td><img src='cid:{attachment.Item2.ContentId}' /></td><td>{attachment.Item1}</td><td>{currentUser.Login}</td></tr>";
                    }
                    else
                    {
                        body += $"<tr><td>#ERROR</td><td>{attachment.Item1}</td><td>{currentUser.Login}</td></tr>";
                    }
                }

                // list of enumerable values

                foreach (KeyValuePair<string, Common.Database.DSSchema.DSTable> table in schema.Tables)
                {
                    foreach(KeyValuePair<string, Common.Database.DSSchema.DSColumn> column in table.Value.ColumnsByName)
                    {
                        if (!column.Value.IsEnum())
                            continue;

                        string[] valueString = column.Value.Type.GetEnumNames();

                        foreach (int value in column.Value.Type.GetEnumValues())
                        {
                            Tuple<string, LinkedResource> attachment = PictureManager.Instance.GetAttachmentFile(PictureManager.Instance.GetImage(Common.Database.DSSchema.DSDatabase.GetDirectory(column.Value.Type) + valueString[value], 30, 30));

                            if (attachment == null)
                                continue;

                            if (attachment.Item2 != null)
                            {
                                listAttachmentFiles.Add(attachment.Item2);
                                body += $"<tr><td><img src='cid:{attachment.Item2.ContentId}' /></td><td>{attachment.Item1}</td><td>{table.Value.Name} / {column.Value.Field}</td></tr>";
                            }
                            else
                            {
                                body += $"<tr><td>#ERROR</td><td>{attachment.Item1}</td><td>{table.Value.Name} / {column.Value.Field}</td></tr>";
                            }
                        }
                    }
                }

                // End of the email

                body += "</table>";
                body += "</body>";
                body += "</html>";

                // Complete the email by attaching images

                AlternateView av = AlternateView.CreateAlternateViewFromString(body, null, MediaTypeNames.Text.Html);
                av.LinkedResources.Add(myChartLinkedResource);
                foreach (LinkedResource link in listAttachmentFiles)
                    av.LinkedResources.Add(link);
                message.AlternateViews.Add(av);

                if (IsVerbose())
                {
                    Verbose($"To: {mainAdministrator.Email}");
                    Verbose($"Subject: {message.Subject}");
                    Verbose($"Body: {body}");
                }

                // Send the email

                using (var smtp = new SmtpClient())
                    smtp.Send(message);
            }
            catch (Exception ex)
            {
                Exception($"An exception occurs on sending email for notification due to {ex.Message}", ex);
                return -1;
            }

            Info($"An email 'Test' is sent to {mainAdministrator.Email}");
            return 0;
        }

        /// <summary>
        /// Connection the job to the database and execute the job
        /// </summary>
        /// <param name="verbose"></param>
        /// <param name="args"></param>
        /// <returns></returns>
        public override int Run(bool verbose = false, string[] args = null)
        {
            // Check database connection

            int status = base.Run(verbose, args);
            if (status != 0)
                return status;

            // Administration Database connection

            using (Syncytium.Module.Administration.DatabaseContext adminDatabase = new Syncytium.Module.Administration.DatabaseContext())
            {
                // Open a connection to the database

                adminDatabase.Database.Connection.Open();

                // Build the database schema

                string area = Syncytium.Module.Administration.DatabaseContext.AREA_NAME;
                if (!ConfigurationManager.Schemas.ContainsKey(area))
                {
                    ConfigurationManager.Schemas[area] = new Common.Database.DSSchema.DSDatabase(typeof(Syncytium.Module.Administration.DatabaseContext), null);
                    Common.Logger.LoggerManager.Instance.Info(Common.Logger.LoggerManager.MODULE_NAME, $"Database schema[{area}] : '{ConfigurationManager.Schemas[area].ToString()}'");
                }

                // Executing the job

                try
                {
                    Execute(verbose, area, ConfigurationManager.Schemas[area], adminDatabase, args);
                }
                catch (Exception ex)
                {
                    Exception("Unable to execute the job", ex);
                    return -1;
                }
            }

            // Stock Database connection

            using (Syncytium.Module.Customer.DatabaseContext sampleDatabase = new Syncytium.Module.Customer.DatabaseContext())
            {
                // Open a connection to the database

                sampleDatabase.Database.Connection.Open();

                // Build the database schema

                string area = Syncytium.Module.Customer.DatabaseContext.AREA_NAME;
                if (!ConfigurationManager.Schemas.ContainsKey(area))
                {
                    ConfigurationManager.Schemas[area] = new Common.Database.DSSchema.DSDatabase(typeof(Syncytium.Module.Customer.DatabaseContext), null);
                    Common.Logger.LoggerManager.Instance.Info(Common.Logger.LoggerManager.MODULE_NAME, $"Database schema[{area}] : '{ConfigurationManager.Schemas[area].ToString()}'");
                }

                // Executing the job

                try
                {
                    Execute(verbose, area, ConfigurationManager.Schemas[area], sampleDatabase, args);
                }
                catch (Exception ex)
                {
                    Exception("Unable to execute the job", ex);
                    return -1;
                }
            }

            return 0;
        }
    }
}
