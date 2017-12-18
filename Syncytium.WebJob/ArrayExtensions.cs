using System;

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

/// <summary>
/// Extension of the array objects
/// </summary>
public static class ArrayExtensions
{
    /// <summary>
    /// Remove some elements into the array
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="array"></param>
    /// <param name="idx"></param>
    /// <param name="len"></param>
    /// <returns></returns>
    public static T[] RemoveAt<T>(this T[] array, int idx, int len)
    {
        T[] newArray;

        if (len > 0)
        {
            if (idx + len > array.Length)
                len = array.Length - idx;

            newArray = new T[array.Length - len];
            if (idx > 0)
                Array.Copy(array, 0, newArray, 0, idx);

            if (idx < array.Length - 1)
                Array.Copy(array, idx + len, newArray, idx, array.Length - idx - len);
        }
        else
        {
            newArray = new T[array.Length + len];
            if (idx > 0)
                Array.Copy(array, 0, newArray, 0, idx + len);

            if (idx < array.Length - 1)
                Array.Copy(array, idx, newArray, idx + len, array.Length - idx);
        }

        return newArray;
    }
}
