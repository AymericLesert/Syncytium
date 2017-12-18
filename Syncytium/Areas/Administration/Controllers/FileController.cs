using Syncytium.Common.Managers;
using Syncytium.Web.Controllers;
using Syncytium.Web.Filters;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Net;
using System.Web.Mvc;

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
    /// Handle the file uploading
    /// </summary>
    public class FileController : SyncytiumController
    {
        #region Logger

        /// <summary>
        /// Module name used into the log file
        /// </summary>
        protected override string MODULE => typeof(FileController).Name;

        #endregion

        /// <summary>
        /// Upload a file, save it into the server before validating
        /// Allow only 1 file
        /// </summary>
        /// <returns></returns>
        [RoleFilter]
        [HttpPost]
        public JObject Upload()
        {
            JObject result = new JObject();
            JArray files = new JArray();
            result["files"] = files;

            Debug("Post ~/Administration/File/Upload()");

            try
            {
                foreach (string file in Request.Files)
                {
                    int id = -1;
                    string filename = "";
                    long size = 0;

                    var fileContent = Request.Files[file];

                    if (fileContent == null || fileContent.ContentLength <= 0)
                        continue;

                    // Give a unique name to the target file

                    var stream = fileContent.InputStream;

                    id = RandomManager.Instance.GetRandom();
                    filename = Path.GetFileName(file);
                    string path = path = Path.Combine(Server.MapPath("~/App_Data"), id.ToString("D6") + "_" + filename);
                    while (System.IO.File.Exists(path))
                    {
                        id = RandomManager.Instance.GetRandom();
                        filename = Path.GetFileName(file);
                        path = Path.Combine(Server.MapPath("~/App_Data"), id.ToString("D6") + "_" + filename);
                    }

                    Debug($"Uploading the file '{fileContent.FileName}' and save it in '{path}' ...");

                    // Save the file into the server side

                    using (var fileStream = System.IO.File.Create(path))
                    {
                        stream.CopyTo(fileStream);
                        size = stream.Length;
                    }

                    JObject jsonFile = new JObject
                    {
                        ["filename"] = filename,
                        ["id"] = id,
                        ["size"] = size
                    };
                    files.Add(jsonFile);
                }
            }
            catch (System.Exception ex)
            {
                Exception("Unable to upload the file", ex);
                Response.StatusCode = (int)HttpStatusCode.BadRequest;
                return null;
            }

            return result;
        }

        /// <summary>
        /// Remove a file or a list of files on the server
        /// </summary>
        /// <param name="id"></param>
        /// <param name="filename"></param>
        /// <returns></returns>
        [RoleFilter]
        [HttpPost]
        public JsonResult Remove(int id, string filename)
        {
            Debug($"Post ~/Administration/File/Remove({id.ToString("D6")}, {filename})");

            try
            {
                string path = Path.Combine(Server.MapPath("~/App_Data"), id.ToString("D6") + "_" + filename);

                Debug($"Deleting the file '{path}' ...");

                if (System.IO.File.Exists(path))
                    System.IO.File.Delete(path);
            }
            catch (System.Exception ex)
            {
                Exception($"Unable to delete the file '{filename}'", ex);
                Response.StatusCode = (int)HttpStatusCode.BadRequest;
            }

            return Json("");
        }

        /// <summary>
        /// URL ~/Administration/File/Get?table=Action,tableId=999,fileId=999,filename=
        /// </summary>
        /// <param name="planId"></param>
        /// <param name="actionId"></param>
        /// <param name="taskId"></param>
        /// <param name="fileListId"></param>
        /// <param name="fileId"></param>
        /// <param name="filename"></param>
        /// <returns></returns>
        [RoleFilter]
        [HttpGet]
        public ActionResult Get(int? planId, int? actionId, int? taskId, string fileListId, int? fileId, string filename)
        {
            Debug($"Get ~/Administration/File/Get({planId}, {actionId}, {taskId}, {fileListId}, {fileId}, {filename})");

            /* TODO: Retrieve a list of files into a zip archive. To generalize this approach for all modules

            using (DatabaseContext database = new DatabaseContext())
            {
                if (fileId != null && filename != null)
                {
                    // Retrieve the current file attached to the element

                    AttachedFileRecord attachment = database.AttachedFile.FirstOrDefault(a => a.PlanId == planId && a.ActionId == actionId && a.TaskId == taskId && a.FileId == fileId && a.Filename.Equals(filename));
                    if (attachment == null)
                    {
                        // The file is not into the database ... the record can be not yet committed into the database
                        // So, check if the file is still into the directory

                        string path = Path.Combine(Server.MapPath("~/App_Data"), fileId.Value.ToString("D6") + "_" + filename);

                        if (!System.IO.File.Exists(path))
                            return HttpNotFound();

                        return File(System.IO.File.ReadAllBytes(path), System.Net.Mime.MediaTypeNames.Application.Octet, filename);
                    }

                    // attachment file deleted can't be retrieved

                    InformationRecord informationAttachment = database._Information.Find("AttachedFile", attachment.Id);
                    if (informationAttachment != null && informationAttachment.DeleteTick != null)
                        return HttpNotFound();

                    AttachedFileContentRecord content = database.AttachedFileContent.Find(attachment.FileId);
                    if (content == null)
                        return HttpNotFound();

                    return File(content.Content, System.Net.Mime.MediaTypeNames.Application.Octet, filename);
                }

                // Build the list of files to include into the zip file

                Dictionary<string, List<Tuple<int, string, AttachedFileRecord>>> attachments = new Dictionary<string, List<Tuple<int, string, AttachedFileRecord>>>();
                string currentFilename = "";

                if (fileListId == null)
                {
                    if (planId == null && actionId == null && taskId == null)
                        return HttpNotFound();

                    foreach (AttachedFileRecord file in database.AttachedFile.Where(a => a.PlanId == planId && a.ActionId == actionId && a.TaskId == taskId).ToList())
                    {
                        InformationRecord informationAttachment = database._Information.Find("AttachedFile", file.Id);
                        if (informationAttachment != null && informationAttachment.DeleteTick != null)
                            continue;

                        currentFilename = $"{file.FileId.ToString("D6")}_{file.Filename}";
                        if (!attachments.ContainsKey(currentFilename))
                            attachments[currentFilename] = new List<Tuple<int, string, AttachedFileRecord>>();
                        attachments[currentFilename].Add(Tuple.Create(file.FileId, file.Filename, file));
                    }
                }
                else
                {
                    string[] files = fileListId.Split(',');
                    foreach (string currentFile in files)
                    {
                        try
                        {
                            int currentFileId = int.Parse(currentFile);
                            bool exist = false;

                            AttachedFileRecord file = null;

                            if (planId != null || actionId != null || taskId != null)
                            {
                                file = database.AttachedFile.FirstOrDefault(a => a.PlanId == planId && a.ActionId == actionId && a.TaskId == taskId && a.FileId == currentFileId);
                            }
                            else
                            {
                                // look for the first element ... Within the same FileId, you have the same file!

                                file = database.AttachedFile.FirstOrDefault(a => a.FileId == currentFileId);
                            }

                            if (file != null)
                            {
                                InformationRecord informationAttachment = database._Information.Find("AttachedFile", file.Id);
                                if (informationAttachment != null && informationAttachment.DeleteTick != null)
                                    continue;

                                exist = true;
                                currentFilename = $"{file.FileId.ToString("D6")}_{file.Filename}";
                                if (!attachments.ContainsKey(currentFilename))
                                    attachments[currentFilename] = new List<Tuple<int, string, AttachedFileRecord>>();
                                attachments[currentFilename].Add(Tuple.Create(file.FileId, file.Filename, file));
                            }

                            if (!exist)
                            {
                                // Look for the attachment file into App_Data

                                foreach (string filePath in Directory.GetFiles(Server.MapPath("~/App_Data"), $"{currentFileId.ToString("D6")}_*.*"))
                                {
                                    currentFilename = Path.GetFileName(filePath);
                                    if (!attachments.ContainsKey(currentFilename))
                                        attachments[currentFilename] = new List<Tuple<int, string, AttachedFileRecord>>();
                                    attachments[currentFilename].Add(Tuple.Create(currentFileId, currentFilename.Substring(7), (AttachedFileRecord)null));
                                }
                            }
                        }
                        catch(System.Exception)
                        {
                            Warn($"Ignore the file '{currentFile}' because the element is not an integer!");
                        }
                    }
                }

                // Sort the list of files to include into the zip file

                List<Tuple<int, string, AttachedFileRecord>> listAttachments = new List<Tuple<int, string, AttachedFileRecord>>();
                foreach (KeyValuePair<string, List<Tuple<int, string, AttachedFileRecord>>> tuple in attachments)
                    listAttachments.AddRange(tuple.Value);

                // Load all attached files into a zip file

                MemoryStream compressedFileStream = new MemoryStream();

                // Create an archive and store the stream in memory

                using (var zipArchive = new ZipArchive(compressedFileStream, ZipArchiveMode.Update, false))
                {
                    string previousFilename = "";
                    int i = 1;

                    foreach (Tuple<int, string, AttachedFileRecord> file in listAttachments.OrderBy(a => a.Item2))
                    {
                        // Get the file

                        byte[] bytes = null;

                        if (file.Item3 != null)
                        {
                            AttachedFileContentRecord content = database.AttachedFileContent.Find(file.Item3.FileId);
                            if (content != null)
                                bytes = content.Content;
                        }
                        else
                        {
                            currentFilename = Path.Combine(Server.MapPath("~/App_Data"), $"{file.Item1.ToString("D6")}_{file.Item2}");
                            try
                            {
                                bytes = System.IO.File.ReadAllBytes(currentFilename);
                            }
                            catch (System.Exception ex)
                            {
                                Exception($"Ignore the file '{currentFilename}' due to an exception", ex);
                            }
                        }

                        if (bytes == null)
                            continue;

                        // Get the filename

                        string targetFilename = file.Item2;
                        if (file.Item2.Equals(previousFilename))
                        {
                            targetFilename = Path.GetFileNameWithoutExtension(targetFilename) + " (" + i.ToString() + ")" + Path.GetExtension(targetFilename);
                            i = i + 1;
                        }
                        else
                        {
                            previousFilename = targetFilename;
                            i = 1;
                        }

                        // Create a zip entry for each attachment

                        var zipEntry = zipArchive.CreateEntry(targetFilename);

                        // Get the stream of the attachment

                        using (var originalFileStream = new MemoryStream(bytes))
                        {
                            using (var zipEntryStream = zipEntry.Open())
                            {
                                //Copy the attachment stream to the zip entry stream
                                originalFileStream.CopyTo(zipEntryStream);
                            }
                        }
                    }
                }

                return File(compressedFileStream.ToArray(), "application/zip", "AttachmentFiles.zip");
            } */

            return null;
        }
    }
}