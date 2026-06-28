import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';

// מאגר כל 36 מחזורי הליגה המלאים
const allFixtures = {
  1: [{ id: 1, home: 'מכבי פ"ת', away: 'הפועל ק"ש', time: '22/08/26' }, { id: 2, home: 'עירוני דורות טבריה', away: 'הפועל פ"ת', time: '22/08/26' }, { id: 3, home: 'הפועל י-ם', away: 'מכבי ת"א', time: '22/08/26' }, { id: 4, home: 'מכבי חיפה', away: 'הפועל ר"ג', time: '22/08/26' }, { id: 5, home: 'הפועל ב"ש', away: 'הפועל חיפה', time: '22/08/26' }, { id: 6, home: 'בית"ר י-ם', away: 'הפועל ת"א', time: '22/08/26' }, { id: 7, home: 'מכבי נתניה', away: 'בני סכנין', time: '22/08/26' }],
  2: [{ id: 1, home: 'בני סכנין', away: 'מכבי פ"ת', time: '29/08/26' }, { id: 2, home: 'מכבי נתניה', away: 'הפועל י-ם', time: '29/08/26' }, { id: 3, home: 'הפועל ת"א', away: 'מכבי חיפה', time: '29/08/26' }, { id: 4, home: 'הפועל ב"ש', away: 'הפועל ר"ג', time: '29/08/26' }, { id: 5, home: 'מכבי חיפה', away: 'מכבי ת"א', time: '29/08/26' }, { id: 6, home: 'הפועל פ"ת', away: 'בית"ר י-ם', time: '29/08/26' }, { id: 7, home: 'עירוני דורות טבריה', away: 'הפועל ק"ש', time: '29/08/26' }],
  3: [{ id: 1, home: 'מכבי פ"ת', away: 'עירוני דורות טבריה', time: '05/09/26' }, { id: 2, home: 'הפועל ק"ש', away: 'הפועל י-ם', time: '05/09/26' }, { id: 3, home: 'הפועל פ"ת', away: 'מכבי חיפה', time: '05/09/26' }, { id: 4, home: 'מכבי ת"א', away: 'הפועל ב"ש', time: '05/09/26' }, { id: 5, home: 'הפועל ר"ג', away: 'הפועל ת"א', time: '05/09/26' }, { id: 6, home: 'הפועל חיפה', away: 'מכבי נתניה', time: '05/09/26' }, { id: 7, home: 'בית"ר י-ם', away: 'בני סכנין', time: '05/09/26' }],
  4: [{ id: 1, home: 'בית"ר י-ם', away: 'מכבי פ"ת', time: '14/09/26' }, { id: 2, home: 'בני סכנין', away: 'הפועל חיפה', time: '14/09/26' }, { id: 3, home: 'מכבי נתניה', away: 'הפועל ר"ג', time: '14/09/26' }, { id: 4, home: 'הפועל ת"א', away: 'מכבי ת"א', time: '14/09/26' }, { id: 5, home: 'הפועל ב"ש', away: 'הפועל פ"ת', time: '14/09/26' }, { id: 6, home: 'מכבי חיפה', away: 'הפועל ק"ש', time: '14/09/26' }, { id: 7, home: 'הפועל י-ם', away: 'עירוני דורות טבריה', time: '14/09/26' }],
  5: [{ id: 1, home: 'מכבי פ"ת', away: 'הפועל י-ם', time: '19/09/26' }, { id: 2, home: 'מכבי חיפה', away: 'עירוני דורות טבריה', time: '19/09/26' }, { id: 3, home: 'הפועל ב"ש', away: 'הפועל ק"ש', time: '19/09/26' }, { id: 4, home: 'הפועל ת"א', away: 'הפועל פ"ת', time: '19/09/26' }, { id: 5, home: 'מכבי נתניה', away: 'מכבי ת"א', time: '19/09/26' }, { id: 6, home: 'בני סכנין', away: 'הפועל ר"ג', time: '19/09/26' }, { id: 7, home: 'בית"ר י-ם', away: 'הפועל חיפה', time: '19/09/26' }],
  6: [{ id: 1, home: 'הפועל חיפה', away: 'מכבי פ"ת', time: '10/10/26' }, { id: 2, home: 'הפועל ר"ג', away: 'בית"ר י-ם', time: '10/10/26' }, { id: 3, home: 'מכבי ת"א', away: 'בני סכנין', time: '10/10/26' }, { id: 4, home: 'הפועל פ"ת', away: 'מכבי נתניה', time: '10/10/26' }, { id: 5, home: 'הפועל ק"ש', away: 'הפועל ת"א', time: '10/10/26' }, { id: 6, home: 'עירוני דורות טבריה', away: 'הפועל ב"ש', time: '10/10/26' }, { id: 7, home: 'הפועל י-ם', away: 'מכבי חיפה', time: '10/10/26' }],
  7: [{ id: 1, home: 'מכבי פ"ת', away: 'מכבי חיפה', time: '17/10/26' }, { id: 2, home: 'הפועל ב"ש', away: 'הפועל י-ם', time: '17/10/26' }, { id: 3, home: 'הפועל ת"א', away: 'עירוני דורות טבריה', time: '17/10/26' }, { id: 4, home: 'מכבי נתניה', away: 'הפועל ק"ש', time: '17/10/26' }, { id: 5, home: 'בני סכנין', away: 'הפועל פ"ת', time: '17/10/26' }, { id: 6, home: 'בית"ר י-ם', away: 'מכבי ת"א', time: '17/10/26' }, { id: 7, home: 'הפועל חיפה', away: 'הפועל ר"ג', time: '17/10/26' }],
  8: [{ id: 1, home: 'הפועל ר"ג', away: 'מכבי פ"ת', time: '24/10/26' }, { id: 2, home: 'מכבי ת"א', away: 'הפועל חיפה', time: '24/10/26' }, { id: 3, home: 'הפועל פ"ת', away: 'בית"ר י-ם', time: '24/10/26' }, { id: 4, home: 'הפועל ק"ש', away: 'בני סכנין', time: '24/10/26' }, { id: 5, home: 'עירוני דורות טבריה', away: 'מכבי נתניה', time: '24/10/26' }, { id: 6, home: 'הפועל י-ם', away: 'הפועל ת"א', time: '24/10/26' }, { id: 7, home: 'מכבי חיפה', away: 'הפועל ב"ש', time: '24/10/26' }],
  9: [{ id: 1, home: 'מכבי פ"ת', away: 'הפועל ב"ש', time: '31/10/26' }, { id: 2, home: 'הפועל ת"א', away: 'מכבי חיפה', time: '31/10/26' }, { id: 3, home: 'מכבי נתניה', away: 'הפועל י-ם', time: '31/10/26' }, { id: 4, home: 'בני סכנין', away: 'עירוני דורות טבריה', time: '31/10/26' }, { id: 5, home: 'בית"ר י-ם', away: 'הפועל ק"ש', time: '31/10/26' }, { id: 6, home: 'הפועל חיפה', away: 'הפועל פ"ת', time: '31/10/26' }, { id: 7, home: 'הפועל ר"ג', away: 'מכבי ת"א', time: '31/10/26' }],
  10: [{ id: 1, home: 'מכבי ת"א', away: 'מכבי פ"ת', time: '07/11/26' }, { id: 2, home: 'הפועל פ"ת', away: 'הפועל ר"ג', time: '07/11/26' }, { id: 3, home: 'הפועל ק"ש', away: 'הפועל חיפה', time: '07/11/26' }, { id: 4, home: 'עירוני דורות טבריה', away: 'בית"ר י-ם', time: '07/11/26' }, { id: 5, home: 'הפועל י-ם', away: 'בני סכנין', time: '07/11/26' }, { id: 6, home: 'מכבי חיפה', away: 'מכבי נתניה', time: '07/11/26' }, { id: 7, home: 'הפועל ב"ש', away: 'הפועל ת"א', time: '07/11/26' }],
  11: [{ id: 1, home: 'מכבי פ"ת', away: 'הפועל ת"א', time: '28/11/26' }, { id: 2, home: 'מכבי נתניה', away: 'הפועל ב"ש', time: '28/11/26' }, { id: 3, home: 'בני סכנין', away: 'מכבי חיפה', time: '28/11/26' }, { id: 4, home: 'בית"ר י-ם', away: 'הפועל י-ם', time: '28/11/26' }, { id: 5, home: 'הפועל חיפה', away: 'עירוני דורות טבריה', time: '28/11/26' }, { id: 6, home: 'הפועל ר"ג', away: 'הפועל ק"ש', time: '28/11/26' }, { id: 7, home: 'מכבי ת"א', away: 'הפועל פ"ת', time: '28/11/26' }],
  12: [{ id: 1, home: 'מכבי פ"ת', away: 'הפועל פ"ת', time: '01/12/26' }, { id: 2, home: 'הפועל ק"ש', away: 'מכבי ת"א', time: '01/12/26' }, { id: 3, home: 'עירוני דורות טבריה', away: 'הפועל ר"ג', time: '01/12/26' }, { id: 4, home: 'הפועל י-ם', away: 'הפועל חיפה', time: '01/12/26' }, { id: 5, home: 'בית"ר י-ם', away: 'מכבי חיפה', time: '01/12/26' }, { id: 6, home: 'בני סכנין', away: 'הפועל ב"ש', time: '01/12/26' }, { id: 7, home: 'מכבי נתניה', away: 'הפועל ת"א', time: '01/12/26' }],
  13: [{ id: 1, home: 'מכבי נתניה', away: 'מכבי פ"ת', time: '05/12/26' }, { id: 2, home: 'בני סכנין', away: 'הפועל ת"א', time: '05/12/26' }, { id: 3, home: 'בית"ר י-ם', away: 'הפועל ב"ש', time: '05/12/26' }, { id: 4, home: 'הפועל חיפה', away: 'מכבי חיפה', time: '05/12/26' }, { id: 5, home: 'הפועל ר"ג', away: 'הפועל י-ם', time: '05/12/26' }, { id: 6, home: 'מכבי ת"א', away: 'עירוני דורות טבריה', time: '05/12/26' }, { id: 7, home: 'הפועל פ"ת', away: 'הפועל ק"ש', time: '05/12/26' }],
  14: [{ id: 1, home: 'הפועל ק"ש', away: 'מכבי פ"ת', time: '12/12/26' }, { id: 2, home: 'הפועל פ"ת', away: 'עירוני דורות טבריה', time: '12/12/26' }, { id: 3, home: 'מכבי ת"א', away: 'הפועל י-ם', time: '12/12/26' }, { id: 4, home: 'הפועל ר"ג', away: 'מכבי חיפה', time: '12/12/26' }, { id: 5, home: 'הפועל חיפה', away: 'הפועל ב"ש', time: '12/12/26' }, { id: 6, home: 'בית"ר י-ם', away: 'הפועל ת"א', time: '12/12/26' }, { id: 7, home: 'בני סכנין', away: 'מכבי נתניה', time: '12/12/26' }],
  15: [{ id: 1, home: 'מכבי פ"ת', away: 'בני סכנין', time: '19/12/26' }, { id: 2, home: 'מכבי נתניה', away: 'בית"ר י-ם', time: '19/12/26' }, { id: 3, home: 'הפועל ת"א', away: 'הפועל חיפה', time: '19/12/26' }, { id: 4, home: 'הפועל ב"ש', away: 'הפועל ר"ג', time: '19/12/26' }, { id: 5, home: 'מכבי חיפה', away: 'מכבי ת"א', time: '19/12/26' }, { id: 6, home: 'הפועל י-ם', away: 'הפועל פ"ת', time: '19/12/26' }, { id: 7, home: 'עירוני דורות טבריה', away: 'הפועל ק"ש', time: '19/12/26' }],
  16: [{ id: 1, home: 'עירוני דורות טבריה', away: 'מכבי פ"ת', time: '29/12/26' }, { id: 2, home: 'הפועל ק"ש', away: 'הפועל י-ם', time: '29/12/26' }, { id: 3, home: 'הפועל פ"ת', away: 'מכבי חיפה', time: '29/12/26' }, { id: 4, home: 'מכבי ת"א', away: 'הפועל ב"ש', time: '29/12/26' }, { id: 5, home: 'הפועל ר"ג', away: 'הפועל ת"א', time: '29/12/26' }, { id: 6, home: 'הפועל חיפה', away: 'מכבי נתניה', time: '29/12/26' }, { id: 7, home: 'בית"ר י-ם', away: 'בני סכנין', time: '29/12/26' }],
  17: [{ id: 1, home: 'מכבי פ"ת', away: 'בית"ר י-ם', time: '02/01/27' }, { id: 2, home: 'בני סכנין', away: 'הפועל חיפה', time: '02/01/27' }, { id: 3, home: 'מכבי נתניה', away: 'הפועל ר"ג', time: '02/01/27' }, { id: 4, home: 'הפועל ת"א', away: 'מכבי ת"א', time: '02/01/27' }, { id: 5, home: 'הפועל ב"ש', away: 'הפועל פ"ת', time: '02/01/27' }, { id: 6, home: 'מכבי חיפה', away: 'הפועל ק"ש', time: '02/01/27' }, { id: 7, home: 'הפועל י-ם', away: 'עירוני דורות טבריה', time: '02/01/27' }],
  18: [{ id: 1, home: 'הפועל י-ם', away: 'מכבי פ"ת', time: '09/01/27' }, { id: 2, home: 'עירוני דורות טבריה', away: 'מכבי חיפה', time: '09/01/27' }, { id: 3, home: 'הפועל ק"ש', away: 'הפועל ב"ש', time: '09/01/27' }, { id: 4, home: 'הפועל פ"ת', away: 'הפועל ת"א', time: '09/01/27' }, { id: 5, home: 'מכבי ת"א', away: 'מכבי נתניה', time: '09/01/27' }, { id: 6, home: 'הפועל ר"ג', away: 'בני סכנין', time: '09/01/27' }, { id: 7, home: 'בית"ר י-ם', away: 'הפועל חיפה', time: '09/01/27' }],
  19: [{ id: 1, home: 'מכבי פ"ת', away: 'הפועל חיפה', time: '16/01/27' }, { id: 2, home: 'בית"ר י-ם', away: 'הפועל ר"ג', time: '16/01/27' }, { id: 3, home: 'בני סכנין', away: 'מכבי ת"א', time: '16/01/27' }, { id: 4, home: 'מכבי נתניה', away: 'הפועל פ"ת', time: '16/01/27' }, { id: 5, home: 'הפועל ת"א', away: 'הפועל ק"ש', time: '16/01/27' }, { id: 6, home: 'הפועל ב"ש', away: 'עירוני דורות טבריה', time: '16/01/27' }, { id: 7, home: 'הפועל י-ם', away: 'מכבי חיפה', time: '16/01/27' }],
  20: [{ id: 1, home: 'מכבי חיפה', away: 'מכבי פ"ת', time: '23/01/27' }, { id: 2, home: 'הפועל י-ם', away: 'הפועל ב"ש', time: '23/01/27' }, { id: 3, home: 'עירוני דורות טבריה', away: 'הפועל ת"א', time: '23/01/27' }, { id: 4, home: 'הפועל ק"ש', away: 'מכבי נתניה', time: '23/01/27' }, { id: 5, home: 'הפועל פ"ת', away: 'בני סכנין', time: '23/01/27' }, { id: 6, home: 'בית"ר י-ם', away: 'מכבי ת"א', time: '23/01/27' }, { id: 7, home: 'הפועל חיפה', away: 'הפועל ר"ג', time: '23/01/27' }],
  21: [{ id: 1, home: 'מכבי פ"ת', away: 'הפועל ר"ג', time: '30/01/27' }, { id: 2, home: 'הפועל חיפה', away: 'מכבי ת"א', time: '30/01/27' }, { id: 3, home: 'בית"ר י-ם', away: 'הפועל פ"ת', time: '30/01/27' }, { id: 4, home: 'בני סכנין', away: 'הפועל ק"ש', time: '30/01/27' }, { id: 5, home: 'מכבי נתניה', away: 'עירוני דורות טבריה', time: '30/01/27' }, { id: 6, home: 'הפועל ת"א', away: 'הפועל י-ם', time: '30/01/27' }, { id: 7, home: 'הפועל ב"ש', away: 'מכבי חיפה', time: '30/01/27' }],
  22: [{ id: 1, home: 'הפועל ב"ש', away: 'מכבי פ"ת', time: '06/02/27' }, { id: 2, home: 'מכבי חיפה', away: 'הפועל ת"א', time: '06/02/27' }, { id: 3, home: 'הפועל י-ם', away: 'מכבי נתניה', time: '06/02/27' }, { id: 4, home: 'עירוני דורות טבריה', away: 'בני סכנין', time: '06/02/27' }, { id: 5, home: 'הפועל ק"ש', away: 'בית"ר י-ם', time: '06/02/27' }, { id: 6, home: 'הפועל פ"ת', away: 'הפועל חיפה', time: '06/02/27' }, { id: 7, home: 'מכבי ת"א', away: 'הפועל ר"ג', time: '06/02/27' }],
  23: [{ id: 1, home: 'מכבי פ"ת', away: 'מכבי ת"א', time: '13/02/27' }, { id: 2, home: 'הפועל ר"ג', away: 'הפועל פ"ת', time: '13/02/27' }, { id: 3, home: 'הפועל חיפה', away: 'הפועל ק"ש', time: '13/02/27' }, { id: 4, home: 'בית"ר י-ם', away: 'עירוני דורות טבריה', time: '13/02/27' }, { id: 5, home: 'בני סכנין', away: 'הפועל י-ם', time: '13/02/27' }, { id: 6, home: 'מכבי נתניה', away: 'מכבי חיפה', time: '13/02/27' }, { id: 7, home: 'הפועל ת"א', away: 'הפועל ב"ש', time: '13/02/27' }],
  24: [{ id: 1, home: 'הפועל ת"א', away: 'מכבי פ"ת', time: '20/02/27' }, { id: 2, home: 'הפועל ב"ש', away: 'מכבי נתניה', time: '20/02/27' }, { id: 3, home: 'מכבי חיפה', away: 'בני סכנין', time: '20/02/27' }, { id: 4, home: 'הפועל י-ם', away: 'בית"ר י-ם', time: '20/02/27' }, { id: 5, home: 'עירוני דורות טבריה', away: 'הפועל חיפה', time: '20/02/27' }, { id: 6, home: 'הפועל ק"ש', away: 'הפועל ר"ג', time: '20/02/27' }, { id: 7, home: 'מכבי ת"א', away: 'הפועל פ"ת', time: '20/02/27' }],
  25: [{ id: 1, home: 'הפועל פ"ת', away: 'מכבי פ"ת', time: '27/02/27' }, { id: 2, home: 'מכבי ת"א', away: 'הפועל ק"ש', time: '27/02/27' }, { id: 3, home: 'הפועל ר"ג', away: 'עירוני דורות טבריה', time: '27/02/27' }, { id: 4, home: 'הפועל חיפה', away: 'הפועל י-ם', time: '27/02/27' }, { id: 5, home: 'בית"ר י-ם', away: 'מכבי חיפה', time: '27/02/27' }, { id: 6, home: 'בני סכנין', away: 'הפועל ב"ש', time: '27/02/27' }, { id: 7, home: 'מכבי נתניה', away: 'הפועל ת"א', time: '27/02/27' }],
  26: [{ id: 1, home: 'מכבי נתניה', away: 'מכבי פ"ת', time: '06/03/27' }, { id: 2, home: 'בני סכנין', away: 'הפועל ת"א', time: '06/03/27' }, { id: 3, home: 'בית"ר י-ם', away: 'הפועל ב"ש', time: '06/03/27' }, { id: 4, home: 'הפועל חיפה', away: 'מכבי חיפה', time: '06/03/27' }, { id: 5, home: 'הפועל ר"ג', away: 'הפועל י-ם', time: '06/03/27' }, { id: 6, home: 'מכבי ת"א', away: 'עירוני דורות טבריה', time: '06/03/27' }, { id: 7, home: 'הפועל פ"ת', away: 'הפועל ק"ש', time: '06/03/27' }],
  27: [{ id: 1, home: 'מקום 1', away: 'מקום 6', time: '13/03/27' }, { id: 2, home: 'מקום 2', away: 'מקום 5', time: '13/03/27' }, { id: 3, home: 'מקום 3', away: 'מקום 4', time: '13/03/27' }, { id: 4, home: 'מקום 7', away: 'מקום 11', time: '13/03/27' }, { id: 5, home: 'מקום 8', away: 'מקום 13', time: '13/03/27' }, { id: 6, home: 'מקום 9', away: 'מקום 12', time: '13/03/27' }, { id: 7, home: 'מקום 10', away: 'מקום 14', time: '13/03/27' }],
  28: [{ id: 1, home: 'מקום 6', away: 'מקום 4', time: '20/03/27' }, { id: 2, home: 'מקום 5', away: 'מקום 3', time: '20/03/27' }, { id: 3, home: 'מקום 1', away: 'מקום 2', time: '20/03/27' }, { id: 4, home: 'מקום 11', away: 'מקום 14', time: '20/03/27' }, { id: 5, home: 'מקום 12', away: 'מקום 10', time: '20/03/27' }, { id: 6, home: 'מקום 13', away: 'מקום 9', time: '20/03/27' }, { id: 7, home: 'מקום 7', away: 'מקום 8', time: '20/03/27' }],
  29: [{ id: 1, home: 'מקום 2', away: 'מקום 6', time: '03/04/27' }, { id: 2, home: 'מקום 3', away: 'מקום 1', time: '03/04/27' }, { id: 3, home: 'מקום 4', away: 'מקום 5', time: '03/04/27' }, { id: 4, home: 'מקום 8', away: 'מקום 11', time: '03/04/27' }, { id: 5, home: 'מקום 9', away: 'מקום 7', time: '03/04/27' }, { id: 6, home: 'מקום 10', away: 'מקום 13', time: '03/04/27' }, { id: 7, home: 'מקום 14', away: 'מקום 12', time: '03/04/27' }],
  30: [{ id: 1, home: 'מקום 6', away: 'מקום 5', time: '10/04/27' }, { id: 2, home: 'מקום 1', away: 'מקום 4', time: '10/04/27' }, { id: 3, home: 'מקום 2', away: 'מקום 3', time: '10/04/27' }, { id: 4, home: 'מקום 11', away: 'מקום 12', time: '10/04/27' }, { id: 5, home: 'מקום 13', away: 'מקום 14', time: '10/04/27' }, { id: 6, home: 'מקום 7', away: 'מקום 10', time: '10/04/27' }, { id: 7, home: 'מקום 8', away: 'מקום 9', time: '10/04/27' }],
  31: [{ id: 1, home: 'מקום 3', away: 'מקום 6', time: '17/04/27' }, { id: 2, home: 'מקום 4', away: 'מקום 2', time: '17/04/27' }, { id: 3, home: 'מקום 5', away: 'מקום 1', time: '17/04/27' }, { id: 4, home: 'מקום 9', away: 'מקום 11', time: '17/04/27' }, { id: 5, home: 'מקום 10', away: 'מקום 8', time: '17/04/27' }, { id: 6, home: 'מקום 14', away: 'מקום 7', time: '17/04/27' }, { id: 7, home: 'מקום 12', away: 'מקום 13', time: '17/04/27' }],
  32: [{ id: 1, home: 'מקום 6', away: 'מקום 1', time: '24/04/27' }, { id: 2, home: 'מקום 5', away: 'מקום 2', time: '24/04/27' }, { id: 3, home: 'מקום 4', away: 'מקום 3', time: '24/04/27' }, { id: 4, home: 'מקום 11', away: 'מקום 13', time: '24/04/27' }, { id: 5, home: 'מקום 7', away: 'מקום 12', time: '24/04/27' }, { id: 6, home: 'מקום 8', away: 'מקום 14', time: '24/04/27' }, { id: 7, home: 'מקום 9', away: 'מקום 10', time: '24/04/27' }],
  33: [{ id: 1, home: 'מקום 4', away: 'מקום 6', time: '01/05/27' }, { id: 2, home: 'מקום 3', away: 'מקום 5', time: '01/05/27' }, { id: 3, home: 'מקום 2', away: 'מקום 1', time: '01/05/27' }, { id: 4, home: 'מקום 10', away: 'מקום 11', time: '01/05/27' }, { id: 5, home: 'מקום 14', away: 'מקום 9', time: '01/05/27' }, { id: 6, home: 'מקום 12', away: 'מקום 8', time: '01/05/27' }, { id: 7, home: 'מקום 13', away: 'מקום 7', time: '01/05/27' }],
  34: [{ id: 1, home: 'מקום 6', away: 'מקום 2', time: '08/05/27' }, { id: 2, home: 'מקום 1', away: 'מקום 3', time: '08/05/27' }, { id: 3, home: 'מקום 5', away: 'מקום 4', time: '08/05/27' }],
  35: [{ id: 1, home: 'מקום 5', away: 'מקום 6', time: '15/05/27' }, { id: 2, home: 'מקום 4', away: 'מקום 1', time: '15/05/27' }, { id: 3, home: 'מקום 3', away: 'מקום 2', time: '15/05/27' }],
  36: [{ id: 1, home: 'מקום 6', away: 'מקום 3', time: '22/05/27' }, { id: 2, home: 'מקום 2', away: 'מקום 4', time: '22/05/27' }, { id: 3, home: 'מקום 1', away: 'מקום 5', time: '22/05/27' }]
};

const ISRAELI_TEAMS = ['מכבי ת"א', 'מכבי חיפה', 'בית"ר י-ם', 'הפועל ב"ש', 'הפועל ת"א', 'מכבי נתניה', 'הפועל חיפה', 'מכבי פ"ת', 'בני סכנין', 'עירוני דורות טבריה', 'הפועל ק"ש', 'הפועל פ"ת', 'הפועל ר"ג', 'הפועל י-ם'];

const getGameLockDeadline = (dateStr) => {
  if (!dateStr || dateStr === 'יעודכן בהמשך') return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = 2000 + parseInt(parts[2], 10);
  const gameDate = new Date(year, month, day);
  const lockDate = new Date(gameDate.getTime() - 24 * 60 * 60 * 1000);
  lockDate.setHours(0, 0, 0, 0);
  return lockDate;
};

const isGameLockedByDate = (dateStr) => {
  const deadline = getGameLockDeadline(dateStr);
  if (!deadline) return false;
  return new Date() >= deadline;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false); // *** מניעת הבהוב: הוספנו משתנה חדש
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [currentTab, setCurrentTab] = useState('predictions');
  const [matchday, setMatchday] = useState(1);
  const [liveClockText, setLiveClockText] = useState('');
  const [countdownText, setCountdownText] = useState('');

  // Global Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminMatchday, setAdminMatchday] = useState(1);
  const [adminMessage1, setAdminMessage1] = useState("");
  const [adminMessage2, setAdminMessage2] = useState("");
  const [actualScores, setActualScores] = useState({});
  const [lockedMatchdays, setLockedMatchdays] = useState({});
  const [isTournamentLocked, setIsTournamentLocked] = useState(false);
  const [seasonResults, setSeasonResults] = useState({ champion: '', topScorer: '' });
  const [playerGoals, setPlayerGoals] = useState({});
  const [newTrackedPlayer, setNewTrackedPlayer] = useState('');

  // User Local State
  const [predictions, setPredictions] = useState({});
  const [tournament, setTournament] = useState({ champion: '', topScorer: '', favoriteTeam: '' });
  const [jokers, setJokers] = useState({});
  
  // App Global State
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [allUsersData, setAllUsersData] = useState({}); 
  
  // פרופיל משתמש למודל הקופץ בטבלה
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  // האזנה למצב התחברות
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // האזנה בזמן אמת לנתונים מהענן
  useEffect(() => {
    const unsubGlobal = onSnapshot(doc(db, "league", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAdminMessage1(data.adminMessage1 || "");
        setAdminMessage2(data.adminMessage2 || "");
        setActualScores(data.actualScores || {});
        setLockedMatchdays(data.lockedMatchdays || {});
        setIsTournamentLocked(data.isTournamentLocked || false);
        setSeasonResults(data.seasonResults || { champion: '', topScorer: '' });
        setPlayerGoals(data.playerGoals || {});
      }
      setIsDataReady(true); // *** מניעת הבהוב: הוספנו פקודה שמעדכנת שהנתונים הגיעו
    });

    const unsubChat = onSnapshot(doc(db, "league", "chat"), (docSnap) => {
      if (docSnap.exists()) {
        setChatMessages(docSnap.data().messages || []);
      }
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersMap = {};
      snapshot.forEach(d => {
        usersMap[d.id] = d.data();
      });
      setAllUsersData(usersMap);
    });

    return () => {
      unsubGlobal();
      unsubChat();
      unsubUsers();
    };
  }, []);

  // שליפת הנתונים האישיים
  useEffect(() => {
    if (user) {
      getDoc(doc(db, "users", user.uid)).then(docSnap => {
        if (docSnap.exists()) {
          const d = docSnap.data();
          setPredictions(d.predictions || {});
          setTournament(d.tournament || { champion: '', topScorer: '', favoriteTeam: '' });
          setJokers(d.jokers || {});
        }
      });
    }
  }, [user]);

  // שעון וזמנים
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setLiveClockText(now.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' }) + ' • ' + now.toLocaleTimeString('he-IL'));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      if (lockedMatchdays[matchday]) {
        setCountdownText('🔒 מחזור זה נעול על ידי מנהל');
        return;
      }

      const fixtures = allFixtures[matchday];
      if (!fixtures || fixtures.length === 0) {
        setCountdownText('');
        return;
      }

      let earliestDeadline = null;
      fixtures.forEach(g => {
        const d = getGameLockDeadline(g.time);
        if (d && (!earliestDeadline || d < earliestDeadline)) earliestDeadline = d;
      });

      if (!earliestDeadline) {
        setCountdownText('');
        return;
      }

      const diff = earliestDeadline.getTime() - new Date().getTime();

      if (diff <= 0) {
        setCountdownText('🔒 מחזור זה נעול לניחושים!');
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setCountdownText(`⏱️ נעילת ניחושים בעוד: ${days} ימים, ${hours} שעות ו-${minutes} דקות`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [matchday, lockedMatchdays]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: nickname });
        await setDoc(doc(db, "users", userCredential.user.uid), {
           displayName: nickname,
           predictions: {},
           tournament: { champion: '', topScorer: '', favoriteTeam: '' },
           jokers: {}
        });
        setUser({ ...userCredential.user, displayName: nickname });
      }
    } catch (err) {
      if (err.code === 'auth/invalid-email') setAuthError('כתובת אימייל לא תקינה');
      else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') setAuthError('אימייל או סיסמה שגויים');
      else if (err.code === 'auth/email-already-in-use') setAuthError('האימייל הזה כבר רשום במערכת');
      else if (err.code === 'auth/weak-password') setAuthError('הסיסמה חלשה מדי (לפחות 6 תווים)');
      else setAuthError('שגיאה בהתחברות. נסה שוב.');
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleEditNickname = async () => {
    const currentName = user?.displayName || user?.email?.split('@')[0];
    const newName = prompt('הכנס כינוי חדש (השם שיופיע בצ\'אט ובטבלה):', currentName);
    
    if (newName && newName.trim() !== '' && newName !== currentName) {
      try {
        await updateProfile(auth.currentUser, { displayName: newName.trim() });
        setUser({ ...auth.currentUser, displayName: newName.trim() });
        await setDoc(doc(db, "users", user.uid), { displayName: newName.trim() }, { merge: true });
        alert('הכינוי שלך עודכן בהצלחה בענן!');
      } catch (err) {
        alert('שגיאה בעדכון הכינוי. נסה שוב מאוחר יותר.');
      }
    }
  };

  const loginAsAdmin = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
    } else {
      const pass = prompt('הכנס סיסמת מנהל:');
      if (pass === '2531') {
        setIsAdminMode(true);
      } else if (pass !== null) {
        alert('סיסמה שגויה!');
      }
    }
  };

  const handleSaveUserData = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        displayName: user.displayName || user.email.split('@')[0],
        predictions,
        tournament,
        jokers
      }, { merge: true });
      alert('הנתונים האישיים שלך נשמרו בענן בהצלחה! ☁️');
    } catch (e) {
      alert('שגיאה בשמירה לענן: ' + e.message);
    }
  };

  const handleSaveAdminData = async () => {
    try {
      await setDoc(doc(db, "league", "global"), {
        adminMessage1,
        adminMessage2,
        actualScores,
        lockedMatchdays,
        isTournamentLocked,
        seasonResults,
        playerGoals
      }, { merge: true });
      alert('כל נתוני המנהל סונכרנו לענן בהצלחה! ☁️');
    } catch (e) {
      alert('שגיאה בשמירת נתוני מנהל: ' + e.message);
    }
  };

  const toggleMatchdayLock = (md, shouldLock) => {
    setLockedMatchdays(prev => ({ ...prev, [md]: shouldLock }));
  };

  const addPlayerToTracker = () => {
    if (newTrackedPlayer.trim() && playerGoals[newTrackedPlayer.trim()] === undefined) {
      setPlayerGoals(prev => ({ ...prev, [newTrackedPlayer.trim()]: 0 }));
      setNewTrackedPlayer('');
    }
  };

  const handlePlayerGoalUpdate = (playerName, delta) => {
    setPlayerGoals(prev => {
      const current = prev[playerName] || 0;
      return { ...prev, [playerName]: Math.max(0, current + delta) };
    });
  };

  const handleActualScoreChange = (gameId, type, val) => {
    const score = parseInt(val) || 0;
    setActualScores(prev => {
      const key = `${adminMatchday}-${gameId}`;
      const current = prev[key] || { homeScore: 0, awayScore: 0, isFinished: false, winner: 'X' };
      const updated = { ...current, [type === 'home' ? 'homeScore' : 'awayScore']: score };
      if (updated.homeScore > updated.awayScore) updated.winner = '1';
      else if (updated.homeScore < updated.awayScore) updated.winner = '2';
      else updated.winner = 'X';
      return { ...prev, [key]: updated };
    });
  };

  const toggleGameFinished = (gameId) => {
    setActualScores(prev => {
      const key = `${adminMatchday}-${gameId}`;
      const current = prev[key] || { homeScore: 0, awayScore: 0, isFinished: false, winner: 'X' };
      return { ...prev, [key]: { ...current, isFinished: !current.isFinished } };
    });
  };

  // פונקציית דמה לחיבור עתידי ל-API אוטומטי
  const handleFetchLiveScoresAPI = () => {
    alert("🚀 בעתיד: כאן יתבצע חיבור ל-API חיצוני (כמו API-Football) לעדכון התוצאות באופן אוטומטי תוך כדי משחק!");
  };

  const handlePredict = (gameId, value) => {
    if (lockedMatchdays[matchday]) { alert('המחזור נעול ולא ניתן לעדכן ניחושים'); return; }
    setPredictions(prev => {
      const key = `${matchday}-${gameId}`;
      const current = prev[key] || { winner: '', homeScore: 0, awayScore: 0 };
      return { ...prev, [key]: { ...current, winner: value } };
    });
  };

  const handleScoreChange = (gameId, type, delta) => {
    if (lockedMatchdays[matchday]) { alert('המחזור נעול ולא ניתן לעדכן תוצאה'); return; }
    setPredictions(prev => {
      const key = `${matchday}-${gameId}`;
      const current = prev[key] || { winner: '', homeScore: 0, awayScore: 0 };
      let newScore = current[type === 'home' ? 'homeScore' : 'awayScore'] + delta;
      if (newScore < 0) newScore = 0;
      const updated = { ...current, [type === 'home' ? 'homeScore' : 'awayScore']: newScore };
      if (updated.homeScore > updated.awayScore) updated.winner = '1';
      else if (updated.homeScore < updated.awayScore) updated.winner = '2';
      else updated.winner = 'X';
      return { ...prev, [key]: updated };
    });
  };

  const toggleJoker = (gameId, isLocked) => {
    if (isLocked || lockedMatchdays[matchday]) return;
    setJokers(prev => {
      if (prev[matchday] === gameId) {
        const updated = { ...prev };
        delete updated[matchday];
        return updated;
      }
      return { ...prev, [matchday]: gameId };
    });
  };

  const displayUsername = user?.displayName || user?.email?.split('@')[0];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    const msg = {
      id: Date.now(),
      text: newChatMessage,
      sender: displayUsername,
      time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    };

    const newChatArray = [...chatMessages, msg];
    setChatMessages(newChatArray); 
    setNewChatMessage('');
    await setDoc(doc(db, "league", "chat"), { messages: newChatArray }, { merge: true });
  };

  const calculatePointsForUser = (userData) => {
    let pts = 0;
    const uPreds = userData.predictions || {};
    const uJokers = userData.jokers || {};
    const uTourn = userData.tournament || {};

    Object.keys(actualScores).forEach(key => {
      const actual = actualScores[key];
      const pred = uPreds[key];
      if (actual && actual.isFinished && pred) {
        const [md, gameId] = key.split('-');
        let localPts = 0;
        if (pred.winner === actual.winner) {
          localPts += 2;
          if (Number(pred.homeScore) === Number(actual.homeScore) && Number(pred.awayScore) === Number(actual.awayScore)) {
            localPts += 4;
          }
        }
        if (uJokers[md] && String(uJokers[md]) === String(gameId)) localPts *= 2;
        pts += localPts;
      }
    });

    if (seasonResults.champion && uTourn.champion === seasonResults.champion) pts += 50;
    if (seasonResults.topScorer && uTourn.topScorer === seasonResults.topScorer) pts += 30;
    if (uTourn.topScorer && playerGoals[uTourn.topScorer]) pts += (playerGoals[uTourn.topScorer] * 2);

    return pts;
  };

  const getMatchdayPointsForUser = (md, userData) => {
    let pts = 0;
    const uPreds = userData.predictions || {};
    const uJokers = userData.jokers || {};
    
    allFixtures[md]?.forEach(game => {
      const key = `${md}-${game.id}`;
      const actual = actualScores[key];
      const pred = uPreds[key];
      if (actual && actual.isFinished && pred) {
        let local = 0;
        if (pred.winner === actual.winner) {
          local += 2;
          if (Number(pred.homeScore) === Number(actual.homeScore) && Number(pred.awayScore) === Number(actual.awayScore)) {
            local += 4;
          }
        }
        if (uJokers[md] && String(uJokers[md]) === String(game.id)) local *= 2;
        pts += local;
      }
    });
    return pts;
  };

  // משיכת סטטיסטיקות עמוקות עבור כל משתמש בטבלה
  const getDetailedStatsForUser = (u) => {
    let exactHits = 0;
    let directionHits = 0;
    let totalFinished = 0;
    let loyaltyCount = 0;

    const uPreds = u.predictions || {};
    const uTeam = u.tournament?.favoriteTeam;

    Object.keys(actualScores).forEach(key => {
        const actual = actualScores[key];
        const pred = uPreds[key];
        if (actual && actual.isFinished && pred && pred.winner) {
            totalFinished++;
            if (pred.winner === actual.winner) {
                directionHits++;
                if (Number(pred.homeScore) === Number(actual.homeScore) && Number(pred.awayScore) === Number(actual.awayScore)) {
                    exactHits++;
                }
            }
        }
    });

    if (uTeam) {
        Object.keys(allFixtures).forEach(md => {
            allFixtures[md].forEach(game => {
                if (game.home === uTeam || game.away === uTeam) {
                    const gKey = `${md}-${game.id}`;
                    if (uPreds[gKey] && uPreds[gKey].winner) loyaltyCount++;
                }
            });
        });
    }

    const hitRatePct = totalFinished > 0 ? Math.round((directionHits / totalFinished) * 100) : 0;

    // חלוקת תגים (Badges) למשתמשים
    let badges = [];
    if (exactHits >= 3) badges.push({ icon: '🎯', title: 'צלף (3+ פגיעות בול)' });
    if (hitRatePct >= 50 && totalFinished >= 5) badges.push({ icon: '🔥', title: 'לוהט (מעל 50% הצלחה)' });
    if (loyaltyCount >= 5) badges.push({ icon: '🛡️', title: 'אוהד שרוף (5+ הימורים על הקבוצה)' });

    return { exactHits, directionHits, totalFinished, hitRatePct, loyaltyCount, badges };
  };

  // יצירת מערך הטבלה עם כל הנתונים, הסטטיסטיקות והתגים
  const leaderboardArr = Object.entries(allUsersData).map(([uid, u]) => {
     const stats = getDetailedStatsForUser(u);
     return {
        uid,
        name: u.displayName || 'משתמש',
        team: u.tournament?.favoriteTeam || '',
        points: calculatePointsForUser(u),
        stats,
        tournament: u.tournament || {}
     };
  }).sort((a, b) => b.points - a.points);

  // להוסיף כתר למקום הראשון
  if (leaderboardArr.length > 0 && leaderboardArr[0].points > 0) {
      leaderboardArr[0].stats.badges.unshift({ icon: '👑', title: 'מקום ראשון' });
  }

  const getMVP = () => {
    let maxPts = 0;
    let mvps = [];
    Object.values(allUsersData).forEach(u => {
      const pts = getMatchdayPointsForUser(matchday, u);
      if (pts > maxPts) { maxPts = pts; mvps = [u.displayName || 'משתמש']; }
      else if (pts === maxPts && pts > 0) { mvps.push(u.displayName || 'משתמש'); }
    });
    if (maxPts > 0) return `${mvps.join(', ')} עם ${maxPts} נק'! 🏆`;
    return `עדיין אין נתונים למחזור ${matchday}`;
  };

  // הסטטיסטיקות האישיות שלי (נמשכות מהפונקציה הכללית)
  const myDetailedStats = getDetailedStatsForUser({ predictions, tournament, jokers });
  const myStats = calculatePointsForUser({ predictions, tournament, jokers });

  let bestMatchday = 1;
  let maxMdPts = -1;
  for (let i = 1; i <= 36; i++) {
      const pts = getMatchdayPointsForUser(i, {predictions, jokers});
      if (pts > maxMdPts) {
          maxMdPts = pts;
          bestMatchday = i;
      }
  }

  // *** שינוי כאן: הוספנו תנאי שמוודא שגם אימות המשתמש וגם נתוני הענן מוכנים
  if (isCheckingAuth || !isDataReady) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-yellow-500 font-bold text-xl" style={{ direction: 'rtl' }}>טוען נתונים מהענן...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-white" style={{ direction: 'rtl', backgroundColor: '#0f172a', backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%), url("https://www.transparenttextures.com/patterns/cubes.png")' }}>
        <div className="bg-gray-900/90 border-2 border-yellow-500 rounded-2xl p-8 shadow-[0_0_30px_rgba(234,179,8,0.2)] max-w-sm w-full backdrop-blur-md">
          <h1 className="text-3xl font-black text-yellow-500 text-center mb-2">🏆 ליגת יוספטל</h1>
          <p className="text-gray-400 text-center text-sm mb-8 font-bold">התחבר כדי להתחיל לנחש (מחובר לענן ☁️)</p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1">אימייל:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:border-yellow-500 focus:outline-none" style={{ direction: 'ltr' }} />
            </div>

            {!isLoginMode && (
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">כינוי (חובה):</label>
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} required placeholder="איך תרצה שנקרא לך?" className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:border-yellow-500 focus:outline-none" style={{ direction: 'rtl' }} />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1">סיסמה:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:border-yellow-500 focus:outline-none" style={{ direction: 'ltr' }} />
            </div>

            {authError && <div className="text-red-500 text-sm font-bold text-center bg-red-950/50 p-2 rounded border border-red-800">{authError}</div>}

            <button type="submit" className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-gray-950 font-black py-3 rounded-xl shadow-lg border border-yellow-400 mt-4 transition-all transform hover:-translate-y-1">
              {isLoginMode ? 'כניסה למשחק ⚽' : 'הרשמה לליגה 📝'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {isLoginMode ? 'עדיין לא רשום? ' : 'כבר יש לך חשבון? '}
            <button onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }} className="text-yellow-500 font-bold hover:underline">
              {isLoginMode ? 'לחץ כאן להרשמה' : 'לחץ כאן להתחברות'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 pb-28" style={{ direction: 'rtl', backgroundColor: '#0f172a', backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%), url("https://www.transparenttextures.com/patterns/cubes.png")' }}>

      <div className="sticky top-0 pt-2 pb-3 z-50 max-w-md mx-auto" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(15, 23, 42, 0.85)' }}>
        <header className="text-center p-4 bg-gray-900 rounded-xl border-b-2 border-yellow-500 shadow-[0_4px_15px_-3px_rgba(234,179,8,0.2)] relative">
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="absolute top-4 right-4 bg-gray-800 text-gray-300 p-2 rounded-lg border border-gray-700 hover:text-white hover:bg-gray-700 transition-colors z-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute top-16 right-4 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-2 flex flex-col gap-1 z-[999] w-48 text-right">
              <button type="button" onClick={() => { setCurrentTab('predictions'); setIsMenuOpen(false); }} className={`px-3 py-2 text-sm font-bold rounded-lg transition-all ${currentTab === 'predictions' ? 'bg-yellow-500 text-gray-950' : 'text-gray-300 hover:bg-gray-700'}`}>⚽ משחקים</button>
              <button type="button" onClick={() => { setCurrentTab('tournament'); setIsMenuOpen(false); }} className={`px-3 py-2 text-sm font-bold rounded-lg transition-all ${currentTab === 'tournament' ? 'bg-yellow-500 text-gray-950' : 'text-gray-300 hover:bg-gray-700'}`}>👑 הטורניר</button>
              <button type="button" onClick={() => { setCurrentTab('leaderboard'); setIsMenuOpen(false); }} className={`px-3 py-2 text-sm font-bold rounded-lg transition-all ${currentTab === 'leaderboard' ? 'bg-yellow-500 text-gray-950' : 'text-gray-300 hover:bg-gray-700'}`}>📊 טבלה</button>
              <button type="button" onClick={() => { setCurrentTab('chat'); setIsMenuOpen(false); }} className={`px-3 py-2 text-sm font-bold rounded-lg transition-all ${currentTab === 'chat' ? 'bg-yellow-500 text-gray-950' : 'text-gray-300 hover:bg-gray-700'}`}>💬 צ'אט</button>
              <button type="button" onClick={() => { setCurrentTab('stats'); setIsMenuOpen(false); }} className={`px-3 py-2 text-sm font-bold rounded-lg transition-all ${currentTab === 'stats' ? 'bg-yellow-500 text-gray-950' : 'text-gray-300 hover:bg-gray-700'}`}>📈 סטט'</button>
              <button type="button" onClick={() => { setCurrentTab('rules'); setIsMenuOpen(false); }} className={`px-3 py-2 text-sm font-bold rounded-lg transition-all ${currentTab === 'rules' ? 'bg-yellow-500 text-gray-950' : 'text-gray-300 hover:bg-gray-700'}`}>ℹ️ חוקים</button>
              <button type="button" onClick={() => { setCurrentTab('public'); setIsMenuOpen(false); }} className={`px-3 py-2 text-sm font-bold rounded-lg transition-all ${currentTab === 'public' ? 'bg-yellow-500 text-gray-950' : 'text-gray-300 hover:bg-gray-700'}`}>👁️ ניחושי כולם</button>
              
              <div className="h-px bg-gray-700 my-1"></div>
              
              <button type="button" onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="px-3 py-2 text-sm font-bold rounded-lg transition-all text-red-400 hover:bg-gray-700 hover:text-red-300 text-right">🚪 התנתק</button>
            </div>
          )}

          <h1 className="text-2xl font-extrabold text-yellow-500 mt-2">🏆 ליגת יוספטל</h1>
          
          <div className="flex justify-center items-center gap-2 mt-1">
            <p className="text-gray-300 text-sm font-bold">שלום, <span className="text-yellow-500">{displayUsername}</span> 👋</p>
            <button onClick={handleEditNickname} className="text-[10px] bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-600 hover:bg-gray-700 hover:text-white transition-colors">✏️ ערוך כינוי</button>
          </div>
          
          <div className="text-sm text-white font-bold mt-2 bg-gray-800 inline-block px-4 py-1 rounded-full shadow-inner border border-gray-700">{liveClockText}</div>
        </header>
      </div>

      <div className="max-w-md mx-auto mt-2">

        {isAdminMode && (
          <div className="bg-gray-900 border-2 border-red-600 rounded-xl p-5 mb-4 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <h2 className="text-red-500 font-black text-xl mb-4 border-b border-red-800 pb-2">🔧 פאנל ניהול מערכת (ענן)</h2>

            <div className="mb-4">
               <button onClick={() => setIsTournamentLocked(!isTournamentLocked)} className={`w-full py-2 rounded font-bold ${isTournamentLocked ? 'bg-red-600' : 'bg-green-600'}`}>
                  {isTournamentLocked ? '🔓 פתח בחירות טורניר לשינויים' : '🔒 נעל בחירות טורניר למשתמשים'}
               </button>
            </div>

            <div className="space-y-4 mb-6 border-t border-red-900/50 pt-4">
              <h3 className="text-white font-bold text-sm">📣 ניהול הודעות:</h3>
              <div>
                <label className="text-gray-400 text-xs block mb-1">הודעת מנהל 1:</label>
                <input type="text" value={adminMessage1} onChange={(e) => setAdminMessage1(e.target.value)} className="w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-700 focus:border-red-500 outline-none text-sm" />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">הודעת מנהל 2:</label>
                <input type="text" value={adminMessage2} onChange={(e) => setAdminMessage2(e.target.value)} className="w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-700 focus:border-red-500 outline-none text-sm" />
              </div>
            </div>

            <div className="border-t border-red-900/50 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-bold text-sm">⚽ הזנת תוצאות אמת:</h3>
                <button onClick={handleFetchLiveScoresAPI} className="text-[10px] bg-blue-900/50 text-blue-300 px-2 py-1 rounded border border-blue-800 hover:bg-blue-800 hover:text-white transition-colors">
                  🔄 עדכן מ-API
                </button>
              </div>

              <select value={adminMatchday} onChange={(e) => setAdminMatchday(Number(e.target.value))} className="w-full bg-red-950/30 text-red-100 p-2 rounded-lg border border-red-800/50 mb-3 text-sm outline-none font-bold">
                {[...Array(36).keys()].map(i => <option key={i + 1} value={i + 1}>מחזור {i + 1}</option>)}
              </select>

              <div className="mb-4 bg-gray-950 border border-red-800 rounded-xl p-3 text-center">
                <div className={`text-sm font-black mb-3 ${lockedMatchdays[adminMatchday] ? 'text-red-400' : 'text-green-400'}`}>
                  {lockedMatchdays[adminMatchday] ? '🔒 מחזור נעול' : '🟢 מחזור פתוח'}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => toggleMatchdayLock(adminMatchday, true)} className="bg-red-600 hover:bg-red-500 text-white font-black py-2 rounded-lg text-sm">🔒 נעילת מחזור</button>
                  <button type="button" onClick={() => toggleMatchdayLock(adminMatchday, false)} className="bg-green-600 hover:bg-green-500 text-white font-black py-2 rounded-lg text-sm">🔓 פתיחת מחזור</button>
                </div>
              </div>

              <div className="space-y-2">
                {allFixtures[adminMatchday]?.map(game => {
                  const key = `${adminMatchday}-${game.id}`;
                  const actual = actualScores[key] || { homeScore: 0, awayScore: 0, isFinished: false, winner: 'X' };

                  return (
                    <div key={game.id} className={`flex items-center justify-between p-2 rounded-lg border ${actual.isFinished ? 'bg-red-950/20 border-red-800/50' : 'bg-gray-800 border-gray-700'}`}>
                      <span className="text-xs font-bold w-1/4 text-right truncate text-gray-300">{game.home}</span>

                      <div className="flex items-center justify-center space-x-1 space-x-reverse mx-1" style={{ direction: 'ltr' }}>
                        <input type="number" min="0" value={actual.awayScore} onChange={e => handleActualScoreChange(game.id, 'away', e.target.value)} className="w-10 text-center bg-gray-950 text-white border border-gray-600 rounded text-sm py-1 outline-none focus:border-red-500" disabled={actual.isFinished} />
                        <span className="text-gray-500 font-bold px-1">:</span>
                        <input type="number" min="0" value={actual.homeScore} onChange={e => handleActualScoreChange(game.id, 'home', e.target.value)} className="w-10 text-center bg-gray-950 text-white border border-gray-600 rounded text-sm py-1 outline-none focus:border-red-500" disabled={actual.isFinished} />
                      </div>

                      <span className="text-xs font-bold w-1/4 text-left truncate text-gray-300">{game.away}</span>

                      <button onClick={() => toggleGameFinished(game.id)} className={`text-[10px] font-black px-2 py-1.5 rounded-md mr-2 w-12 transition-colors ${actual.isFinished ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'}`}>
                        {actual.isFinished ? 'נעול' : 'פתוח'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-red-900/50 pt-4 mt-4">
              <h3 className="text-white font-bold text-sm mb-2">⚽ מעקב מלך השערים:</h3>
              <div className="flex gap-2 mb-4">
                 <input value={newTrackedPlayer} onChange={e => setNewTrackedPlayer(e.target.value)} placeholder="שם השחקן למעקב..." className="flex-1 bg-gray-800 text-white p-2 rounded-lg border border-gray-700 text-sm" />
                 <button onClick={addPlayerToTracker} className="bg-blue-600 px-3 rounded-lg text-sm font-bold">הוסף</button>
              </div>
              <div className="space-y-2">
                 {Object.keys(playerGoals).map(player => (
                    <div key={player} className="flex justify-between items-center bg-gray-800 p-2 rounded text-sm">
                       <span>{player}</span>
                       <div className="flex items-center gap-3" style={{direction: 'ltr'}}>
                          <button onClick={() => handlePlayerGoalUpdate(player, -1)} className="bg-gray-700 px-2 rounded">-</button>
                          <span className="font-bold w-4 text-center">{playerGoals[player]}</span>
                          <button onClick={() => handlePlayerGoalUpdate(player, 1)} className="bg-gray-700 px-2 rounded">+</button>
                       </div>
                    </div>
                 ))}
              </div>
            </div>

            <div className="border-t border-red-900/50 pt-4 mt-4">
               <h3 className="text-white font-bold text-sm mb-2">🏁 סיום עונה (קביעת תוצאות אמת):</h3>
               <div className="space-y-2">
                  <input placeholder="שם האלופה הסופית" value={seasonResults.champion} onChange={e => setSeasonResults({...seasonResults, champion: e.target.value})} className="w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-700 text-sm" />
                  <input placeholder="שם מלך השערים הסופי" value={seasonResults.topScorer} onChange={e => setSeasonResults({...seasonResults, topScorer: e.target.value})} className="w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-700 text-sm" />
               </div>
            </div>
            
            <button onClick={handleSaveAdminData} className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-lg border border-red-800 text-base transition-all">
               💾 שמור שינויי מנהל בענן
            </button>
          </div>
        )}

        {!isAdminMode && adminMessage1 && (
          <div className="mb-4 bg-gray-900 border border-yellow-500 rounded-xl p-4 shadow-lg text-right relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-yellow-500"></div>
            <h3 className="text-yellow-500 mt-0 text-lg font-bold mb-2">📣 הודעות מנהל:</h3>
            {adminMessage1 && <p className="m-1 text-sm text-gray-200">{adminMessage1}</p>}
            {adminMessage2 && <p className="m-1 text-sm text-gray-200">{adminMessage2}</p>}
          </div>
        )}

        {currentTab === 'public' && (
           <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 shadow-xl">
             <h2 className="text-xl font-bold text-yellow-500 mb-4">👁️ ניחושי כולם - מחזור {matchday}</h2>
             
             {!lockedMatchdays[matchday] ? (
               <div className="text-center py-8">
                 <div className="text-4xl mb-3">🔒</div>
                 <h3 className="text-lg font-bold text-gray-300">הניחושים חסויים!</h3>
                 <p className="text-sm text-gray-500 mt-2">כדי למנוע העתקות, הניחושים של כולם ייחשפו כאן רק לאחר שהמנהל ינעל את המחזור.</p>
               </div>
             ) : (
               <div>
                 <p className="text-sm text-gray-400 mb-4">המחזור נעול! להלן הניחושים של כל המשתתפים בליגה:</p>
                 {Object.keys(allUsersData).length === 0 && <p className="text-gray-500">אין נתונים עדיין.</p>}
                 {Object.keys(allUsersData).map(uid => {
                    const u = allUsersData[uid];
                    const mdPts = getMatchdayPointsForUser(matchday, u);
                    return (
                       <div key={uid} className="bg-gray-800 p-3 rounded-lg border border-gray-700 mb-3 shadow-sm">
                          <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
                             <span className="font-bold text-white">{u.displayName || 'משתמש'} {uid === user.uid ? '(אתה)' : ''}</span>
                             <span className="text-[10px] font-black text-yellow-500 bg-gray-900 px-2 py-1 rounded border border-yellow-900/30">נקודות המחזור: {mdPts}</span>
                          </div>
                          <div className="space-y-1 mt-2">
                             {allFixtures[matchday]?.map(game => {
                                const gKey = `${matchday}-${game.id}`;
                                const uPred = u.predictions?.[gKey];
                                const isJoker = u.jokers?.[matchday] === game.id;
                                if (!uPred || !uPred.winner) return null;
                                return (
                                   <div key={game.id} className="flex justify-between items-center text-xs bg-gray-900 p-1.5 rounded">
                                      <span className="text-gray-400 w-1/2">{game.home} - {game.away} {isJoker ? '🃏' : ''}</span>
                                      <span className="font-bold text-yellow-500 bg-gray-950 px-2 py-0.5 rounded">{uPred.homeScore}:{uPred.awayScore}</span>
                                   </div>
                                )
                             })}
                             {(!u.predictions || Object.keys(u.predictions).filter(k => k.startsWith(`${matchday}-`)).length === 0) && (
                               <div className="text-xs text-gray-500 text-center py-1">לא הוזנו ניחושים</div>
                             )}
                          </div>
                       </div>
                    );
                 })}
               </div>
             )}
           </div>
        )}

        {currentTab === 'predictions' && (
          <div className="space-y-4">
            <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 shadow-xl space-y-2 backdrop-blur-sm">
              <select value={matchday} onChange={(e) => setMatchday(Number(e.target.value))} className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:outline-none focus:border-yellow-500 transition-colors">
                {[...Array(36).keys()].map(i => <option key={i + 1} value={i + 1}>מחזור {i + 1}</option>)}
              </select>

              <div className={`p-2 rounded-lg text-center text-xs font-black border ${lockedMatchdays[matchday] ? 'bg-red-950/40 border-red-800 text-red-400' : 'bg-green-950/40 border-green-800 text-green-400'}`}>
                {lockedMatchdays[matchday] ? '🔒 מחזור נעול' : '🟢 מחזור פתוח'}
              </div>

              {countdownText && <div className="p-2 rounded-lg text-center text-xs font-black bg-amber-950/40 border border-amber-900/60 text-amber-400 shadow-inner">{countdownText}</div>}
            </div>

            {allFixtures[matchday]?.map(game => {
              const gameKey = `${matchday}-${game.id}`;
              const pred = predictions[gameKey] || { winner: '', homeScore: 0, awayScore: 0 };
              const actual = actualScores[gameKey] || { homeScore: 0, awayScore: 0, winner: 'X', isFinished: false };
              const isLocked = lockedMatchdays[matchday] || isGameLockedByDate(game.time) || actual.isFinished;
              const isJoker = jokers[matchday] === game.id;

              return (
                <div key={game.id} className={`border rounded-xl p-4 shadow-md space-y-3 transition-all ${isJoker ? 'bg-gradient-to-br from-gray-900 to-amber-950/40 border-yellow-600/60 shadow-[0_0_15px_rgba(217,119,6,0.15)]' : 'bg-gray-900/80 border-gray-800 hover:border-gray-700'}`}>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="bg-gray-950 px-2 py-1 rounded-md border border-gray-800">{game.time}</span>
                    <button type="button" disabled={isLocked} onClick={() => toggleJoker(game.id, isLocked)} className={`px-2 py-1 rounded-md text-[10px] font-black border transition-colors ${isJoker ? 'bg-yellow-500 text-black border-yellow-500 shadow-sm' : 'bg-gray-950 text-gray-500 border-gray-800 hover:bg-gray-800'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {isJoker ? "🃏 ג'וקר פעיל!" : "🃏 סמן ג'וקר"}
                    </button>
                  </div>

                  <div className="flex justify-between items-center py-2 border-y border-gray-800/50 mt-2 mb-1">
                    <span className="font-bold text-base w-5/12 text-right">{game.home}</span>
                    <span className="text-gray-500 text-xs font-black bg-gray-950 px-2 py-1 rounded-full">VS</span>
                    <span className="font-bold text-base w-5/12 text-left">{game.away}</span>
                  </div>

                  {!isLocked ? (
                    <div className="flex justify-between items-center bg-gray-950/80 p-3 rounded-xl border border-gray-800" style={{ direction: 'ltr' }}>
                      <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                        <button type="button" onClick={() => handleScoreChange(game.id, 'away', -1)} className="px-3 py-1.5 text-gray-400 font-bold hover:bg-gray-700 hover:text-white transition-colors">-</button>
                        <span className="px-3 py-1.5 font-black text-yellow-500 min-w-[30px] text-center bg-gray-900">{pred.awayScore}</span>
                        <button type="button" onClick={() => handleScoreChange(game.id, 'away', 1)} className="px-3 py-1.5 text-gray-400 font-bold hover:bg-gray-700 hover:text-white transition-colors">+</button>
                      </div>

                      <span className="text-gray-500 font-black">:</span>

                      <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                        <button type="button" onClick={() => handleScoreChange(game.id, 'home', -1)} className="px-3 py-1.5 text-gray-400 font-bold hover:bg-gray-700 hover:text-white transition-colors">-</button>
                        <span className="px-3 py-1.5 font-black text-yellow-500 min-w-[30px] text-center bg-gray-900">{pred.homeScore}</span>
                        <button type="button" onClick={() => handleScoreChange(game.id, 'home', 1)} className="px-3 py-1.5 text-gray-400 font-bold hover:bg-gray-700 hover:text-white transition-colors">+</button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-950 p-3 text-center rounded-lg text-sm text-gray-400 border border-gray-800/50">
                      {lockedMatchdays[matchday] ? '🔒 המחזור נעול. ' : ''}
                      הניחוש השמור:
                      <span className="text-yellow-500 font-bold ml-2 text-base">
                        {pred.winner ? `${pred.homeScore} - ${pred.awayScore}` : 'אין'}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {['1', 'X', '2'].map(o => (
                      <button key={o} type="button" disabled={isLocked} onClick={() => handlePredict(game.id, o)} className={`py-2 text-sm font-black rounded-lg border transition-all ${pred.winner === o ? 'bg-yellow-500 text-black border-yellow-500 shadow-md transform scale-[1.02]' : 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            <button type="button" onClick={handleSaveUserData} className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-gray-950 font-black py-4 rounded-xl shadow-lg border border-yellow-400 text-base transition-all transform hover:-translate-y-1">💾 שמור שינויים (ענן)</button>
          </div>
        )}

        {currentTab === 'chat' && (
          <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 shadow-xl backdrop-blur-sm flex flex-col h-[55vh]">
            <h2 className="text-xl font-bold text-yellow-500 mb-3 border-b border-gray-800 pb-2 flex items-center gap-2">💬 צ'אט הליגה (Live)</h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {chatMessages.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">אין עדיין הודעות. תהיה הראשון לכתוב!</p>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === displayUsername ? 'items-start' : 'items-end'}`}>
                    <span className="text-[10px] text-gray-500 mb-0.5 px-1">{msg.sender} • {msg.time}</span>
                    <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${msg.sender === displayUsername ? 'bg-yellow-500 text-gray-950 rounded-tr-sm' : 'bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="mt-3 flex gap-2 pt-2 border-t border-gray-800">
              <input type="text" value={newChatMessage} onChange={e => setNewChatMessage(e.target.value)} placeholder="כתוב הודעה..." className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-yellow-500" />
              <button type="submit" className="bg-yellow-500 text-gray-950 px-4 py-2 rounded-lg font-black text-sm hover:bg-yellow-400">שלח</button>
            </form>
          </div>
        )}

        {currentTab === 'tournament' && (
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 space-y-5 shadow-2xl backdrop-blur-sm">
            <h2 className="text-xl font-black text-yellow-500 text-center mb-4 border-b border-gray-800 pb-3">📝 הניחושים המיוחדים שלי</h2>
            
            {isTournamentLocked && <div className="text-red-500 font-bold text-center mb-2">🔒 בחירות הטורניר נעולות ולא ניתן לשנותן.</div>}

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">🏆 הקבוצה האהודה שלי בארץ:</label>
              <select value={tournament.favoriteTeam} disabled={isTournamentLocked} onChange={(e) => setTournament({ ...tournament, favoriteTeam: e.target.value })} className={`w-full bg-gray-800 p-3.5 rounded-lg text-white font-bold border border-gray-700 focus:outline-none ${isTournamentLocked ? 'opacity-50 cursor-not-allowed' : 'focus:border-yellow-500 transition-colors'}`}>
                <option value="">-- בחר קבוצה --</option>
                {ISRAELI_TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">🏆 האלופה שלי:</label>
              <input type="text" value={tournament.champion} disabled={isTournamentLocked} onChange={(e) => setTournament({ ...tournament, champion: e.target.value })} placeholder="הקלד את שם האלופה..." className={`w-full bg-gray-800 p-3.5 rounded-lg text-white font-bold border border-gray-700 focus:outline-none ${isTournamentLocked ? 'opacity-50 cursor-not-allowed' : 'focus:border-yellow-500 transition-colors'}`} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">👟 מלך השערים שלי:</label>
              <input type="text" value={tournament.topScorer} disabled={isTournamentLocked} onChange={(e) => setTournament({ ...tournament, topScorer: e.target.value })} placeholder="הקלד את מלך השערים..." className={`w-full bg-gray-800 p-3.5 rounded-lg text-white font-bold border border-gray-700 focus:outline-none ${isTournamentLocked ? 'opacity-50 cursor-not-allowed' : 'focus:border-yellow-500 transition-colors'}`} />
            </div>

            <button type="button" disabled={isTournamentLocked} onClick={handleSaveUserData} className={`w-full text-gray-950 font-black py-4 rounded-xl border text-base mt-4 transition-colors shadow-md ${isTournamentLocked ? 'bg-gray-600 border-gray-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-400 border-yellow-600'}`}>💾 שמור שינויים (ענן)</button>
          </div>
        )}

        {currentTab === 'leaderboard' && (
          <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-5 shadow-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-200 mb-4 border-b border-gray-800 pb-2">📊 מצב הטבלה הכללית (Live)</h2>
            <p className="text-xs text-gray-400 mb-4 text-center">לחץ על משתמש כדי לראות את הפרופיל והסטטיסטיקה שלו</p>
            <div className="overflow-hidden rounded-lg border border-gray-700 shadow-sm">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-gray-300 text-sm">
                    <th className="p-3 w-12 text-center">מקום</th>
                    <th className="p-3">שם המנחש</th>
                    <th className="p-3 text-center w-20">נקודות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {leaderboardArr.length === 0 ? (
                    <tr className="bg-gray-900"><td colSpan="3" className="p-4 text-center text-gray-500">אין נתונים עדיין</td></tr>
                  ) : (
                    leaderboardArr.map((u, i) => (
                      <tr key={u.uid} onClick={() => setSelectedUserProfile(u)} className={`cursor-pointer bg-gray-900 hover:bg-gray-800 transition-colors ${u.uid === user.uid ? 'bg-yellow-900/20' : ''}`}>
                        <td className="p-4 font-black text-center text-lg text-yellow-500 bg-gray-950/30">{i + 1}</td>
                        <td className="p-4 font-bold text-gray-100 flex flex-col justify-center gap-1">
                           <span className="flex items-center gap-2">
                             {u.name} {u.uid === user.uid ? '(אתה)' : ''}
                             <div className="flex gap-1 text-sm">
                               {u.stats.badges.map((b, idx) => <span key={idx} title={b.title}>{b.icon}</span>)}
                             </div>
                           </span>
                           {u.team && <span className="text-xs text-gray-500 font-normal">{u.team}</span>}
                        </td>
                        <td className="p-4 text-center font-black text-yellow-500 bg-gray-950/50 text-lg">{u.points}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentTab === 'stats' && (
          <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-5 shadow-xl backdrop-blur-sm space-y-6 text-right">
            <h2 className="text-xl font-bold text-yellow-500 mb-4 text-center">📈 סטטיסטיקה אישית עמוקה</h2>
            
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center shadow-inner">
               <p className="text-gray-400 text-sm mb-1">סך הנקודות שלך העונה:</p>
               <p className="text-5xl font-black text-yellow-500 drop-shadow-md">{myStats}</p>
            </div>

            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300 font-bold">🎯 אחוזי פגיעה כלליים:</span>
                <span className="text-yellow-500 font-black text-lg">{myDetailedStats.hitRatePct}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-l from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500" style={{ width: `${myDetailedStats.hitRatePct}%` }}></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs mt-2 border-t border-gray-800 pt-2">
                <div>
                  <p className="text-gray-500">בול פגיעה (מדויק)</p>
                  <p className="text-white font-bold">{myDetailedStats.exactHits} משחקים</p>
                </div>
                <div>
                  <p className="text-gray-500">ניחשו כיוון</p>
                  <p className="text-white font-bold">{myDetailedStats.directionHits} משחקים</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
                <p className="text-gray-400 text-[11px] mb-1">🃏 ג'וקרים שנוצלו</p>
                <p className="text-white font-black text-xl">{Object.keys(jokers).length} <span className="text-xs text-gray-500 font-normal">מתוך 36</span></p>
              </div>
              <div className="bg-gray-950 p-3 rounded-xl border border-yellow-900/30 text-center flex flex-col justify-center shadow-[0_0_10px_rgba(234,179,8,0.05)]">
                <p className="text-gray-400 text-[11px] mb-1">🔥 המחזור הכי חזק</p>
                <p className="text-yellow-500 font-black text-xl">מחזור {bestMatchday}</p>
                <p className="text-[10px] text-gray-500">{maxMdPts > 0 ? `${maxMdPts} נקודות` : 'עדיין אין נקודות'}</p>
              </div>
            </div>

            <div className="border border-gray-800 bg-gray-800/50 p-4 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-blue-500"></div>
              <p className="text-gray-300 text-sm mb-2 font-bold flex items-center gap-2">
                <span>⚽</span> נאמנות לקבוצה: <span className="text-white">{tournament.favoriteTeam || 'לא נבחרה קבוצה'}</span>
              </p>
              {tournament.favoriteTeam ? (
                <p className="text-xs text-gray-400 leading-relaxed">
                  הימרת על משחקים של הקבוצה שלך 
                  <span className="text-yellow-500 font-black mx-1 text-sm">{myDetailedStats.loyaltyCount}</span> 
                  פעמים העונה מתוך כלל המשחקים.
                </p>
              ) : (
                 <p className="text-xs text-gray-500">בחר קבוצה אהובה בלשונית הטורניר כדי לראות מעקב.</p>
              )}
            </div>
          </div>
        )}

        {currentTab === 'rules' && (
          <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-5 shadow-md text-base leading-relaxed text-gray-300 space-y-4 backdrop-blur-sm">
            <h2 className="text-yellow-500 font-black text-xl flex items-center gap-2 border-b border-gray-800 pb-2">🎯 שיטת הניקוד המעודכנת</h2>

            <p className="flex items-start gap-2"><span>•</span> <span>ניחוש כיוון נכון: <span className="text-white font-bold bg-gray-800 px-2 py-0.5 rounded">2 נקודות</span>.</span></p>
            <p className="flex items-start gap-2"><span>•</span> <span>ניחוש תוצאה מדויקת נכון: מוסיף עוד <span className="text-yellow-500 font-bold bg-gray-800 px-2 py-0.5 rounded">4 נקודות</span>.</span></p>

            <div className="bg-gray-950 p-3 rounded-lg border border-yellow-900/50 mt-2">
              <p><span className="text-yellow-500 font-bold">🃏 חוק הג'וקר:</span> משחק שסומן כג'וקר מקבל כפל ניקוד.</p>
            </div>

            <h2 className="text-yellow-500 font-black text-xl flex items-center gap-2 border-b border-gray-800 pb-2 mt-6">👑 חוקי טורניר ובונוסים</h2>
            <p className="flex items-start gap-2"><span>•</span> <span>ניחוש נכון של האלופה מעניק <span className="text-yellow-500 font-bold bg-gray-800 px-2 py-0.5 rounded">50 נקודות</span>.</span></p>

            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 mt-2 space-y-2">
              <p className="flex items-start gap-2"><span>•</span> <span>ניחוש נכון של מלך השערים מעניק <span className="text-yellow-500 font-bold bg-gray-800 px-2 py-0.5 rounded">30 נקודות</span>.</span></p>
              <p className="text-sm text-gray-400 font-bold pr-4">⚽ בנוסף, על כל שער שיבקיע השחקן שנבחר במהלך העונה, יקבל המנחש 2 נקודות.</p>
            </div>
          </div>
        )}
      </div>

      {/* פופ-אפ פרופיל משתמש (מופיע רק כשלוחצים על מישהו בטבלה) */}
      {selectedUserProfile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] p-4" style={{ direction: 'rtl' }}>
          <div className="bg-gray-900 border-2 border-yellow-500 rounded-2xl p-6 w-full max-w-sm text-right relative shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <button onClick={() => setSelectedUserProfile(null)} className="absolute top-4 left-4 bg-gray-800 text-gray-400 hover:text-white w-8 h-8 rounded-full font-black border border-gray-700 flex items-center justify-center">X</button>
            
            <h3 className="text-2xl font-black text-white mb-1">{selectedUserProfile.name}</h3>
            {selectedUserProfile.team && <p className="text-sm text-gray-400 mb-4">אוהד/ת {selectedUserProfile.team}</p>}
            
            <div className="flex gap-2 mb-4 bg-gray-800/50 p-2 rounded-lg border border-gray-800 flex-wrap">
               {selectedUserProfile.stats.badges.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-gray-950 px-2 py-1 rounded text-xs border border-gray-700" title={b.title}>
                     <span>{b.icon}</span> <span className="text-gray-300">{b.title}</span>
                  </div>
               ))}
               {selectedUserProfile.stats.badges.length === 0 && <span className="text-xs text-gray-500 p-1">עדיין אין תגים מיוחדים</span>}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-center">
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
                 <p className="text-[10px] text-gray-500">אחוזי פגיעה</p>
                 <p className="text-xl font-black text-yellow-500">{selectedUserProfile.stats.hitRatePct}%</p>
              </div>
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
                 <p className="text-[10px] text-gray-500">פגיעות בול</p>
                 <p className="text-xl font-black text-yellow-500">{selectedUserProfile.stats.exactHits}</p>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm">
               <p className="text-gray-400 font-bold border-b border-gray-700 pb-1 mb-2">בחירות טורניר:</p>
               <p className="flex justify-between text-gray-300 mb-1"><span>🏆 אלופה:</span> <span className="font-bold text-white">{selectedUserProfile.tournament?.champion || 'לא נבחר'}</span></p>
               <p className="flex justify-between text-gray-300"><span>👟 מלך שערים:</span> <span className="font-bold text-white">{selectedUserProfile.tournament?.topScorer || 'לא נבחר'}</span></p>
            </div>
          </div>
        </div>
      )}

      <footer className="max-w-md mx-auto mt-16 mb-8 text-center relative z-40">
        <button type="button" onClick={loginAsAdmin} className={`px-5 py-2.5 text-sm font-bold rounded-lg border transition-all ${isAdminMode ? 'bg-red-950/80 border-red-800 text-red-400 hover:bg-red-900' : 'bg-gray-900/80 border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-600'}`}>
          {isAdminMode ? '🔒 צא ממצב מנהל' : '🔧 ניהול מערכת'}
        </button>
      </footer>

      <div className="fixed bottom-0 left-0 w-full bg-gray-950/95 backdrop-blur-md border-t border-gray-800 p-3 text-center text-sm font-bold text-yellow-500 z-[1000] shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.5)]">
        🌟 MVP המחזור: {getMVP()}
      </div>
    </div>
  );
}
