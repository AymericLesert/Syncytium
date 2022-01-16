/*
    Copyright (C) 2022 LESERT Aymeric - aymeric.lesert@concilium-lesert.fr

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

namespace Syncytium.Core.Common.Server.Managers
{
    /// <summary>
    /// Handle the randomization number
    /// </summary>
    public class RandomManager
    {
        /// <summary>
        /// Instance of the current random manager
        /// </summary>
        private static RandomManager? _instance = null;

        /// <summary>
        /// Generator
        /// </summary>
        private readonly Random _rnd = new(DateTime.Now.Millisecond);

        /// <summary>
        /// Return a random value
        /// </summary>
        /// <returns></returns>
        public int GetRandom()
        {
            return _rnd.Next(0, 999999);
        }

        /// <summary>
        /// Constructor of the random generator
        /// </summary>
        private RandomManager()
        {
        }

        /// <summary>
        /// Retrieve the current instance or define a new instanceof RandomManager
        /// </summary>
        public static RandomManager Instance
        {
            get
            {
                if (_instance == null)
                    _instance = new RandomManager();

                return _instance;
            }
        }
    }
}