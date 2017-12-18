using System;
using System.Drawing;
using System.IO;

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

namespace Syncytium.Common.Picture
{
    /// <summary>
    /// Function building the conversion from a file (byte[]) to a string base64 (PNG) defining a picture into the application
    /// </summary>
    public static class PictureManager 
    {
        /// <summary>
        /// Convert a png file loaded to an image base64 (PNG)
        /// </summary>
        /// <param name="data"></param>
        /// <param name="width"></param>
        /// <param name="height"></param>
        /// <returns></returns>
        public static string GetPngBase64(byte[] data, int width, int height)
        {
            using (MemoryStream stream = new MemoryStream(data))
            {
                Image image = Image.FromStream(stream);
                Bitmap bitmap = new Bitmap(image, width, height);
                MemoryStream newStream = new MemoryStream();
                bitmap.Save(newStream, System.Drawing.Imaging.ImageFormat.Png);
                return Convert.ToBase64String(newStream.ToArray());
            }
        }

        /// <summary>
        /// Convert a svg file loaded to an image base64 (PNG)
        /// </summary>
        /// <param name="data"></param>
        /// <param name="width"></param>
        /// <param name="height"></param>
        /// <returns></returns>
        public static string GetSvgBase64(byte[] data, int width, int height)
        {
            using (MemoryStream stream = new MemoryStream(data))
            {
                Svg.SvgDocument image = Svg.SvgDocument.Open<Svg.SvgDocument>(stream);
                Bitmap bitmap = new Bitmap(image.Draw(), width, height);

                MemoryStream newStream = new MemoryStream();
                bitmap.Save(newStream, System.Drawing.Imaging.ImageFormat.Png);
                return Convert.ToBase64String(newStream.ToArray());
            }
        }
    }
}
