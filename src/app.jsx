import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentTab, setCurrentTab] = useState('predictions');
  const [matchday, setMatchday] = useState(1);
  const [liveClockText, setLiveClockText] = useState('');
  const [countdownText, setCountdownText] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [predictions, setPredictions] = useState(() => JSON.parse(localStorage.getItem('predictions')) || {});
  const [tournament, setTournament] = useState(() => JSON.parse(localStorage.getItem('tournament')) || { champion: '', topScorer: '', favoriteTeam: '' });
  const [jokers, setJokers] = useState(() => JSON.parse(localStorage.getItem('jokers')) || {});
  const [actualScores, setActualScores] = useState(() => JSON.parse(localStorage.getItem('actualScores')) || {});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { localStorage.setItem('predictions', JSON.stringify(predictions)); }, [predictions]);
  useEffect(() => { localStorage.setItem('tournament', JSON.stringify(tournament)); }, [tournament]);
  useEffect(() => { localStorage.setItem('jokers', JSON.stringify(jokers)); }, [jokers]);
  useEffect(() => { localStorage.setItem('actualScores', JSON.stringify(actualScores)); }, [actualScores]);

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
      const fixtures = allFixtures[matchday];
      if (!fixtures || fixtures.length === 0) { setCountdownText(''); return; }
      let earliestDeadline = null;
      fixtures.forEach(g => {
        const d = getGameLockDeadline(g.time);
        if (d && (!earliestDeadline || d < earliestDeadline)) earliestDeadline = d;
      });
      if (!earliestDeadline) { setCountdownText(''); return; }

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
  }, [matchday]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      if (err.code === 'auth/invalid-email') setAuthError('כתובת אימייל לא תקינה');
      else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') setAuthError('אימייל או סיסמה שגויים');
      else if (err.code === 'auth/email-already-in-use') setAuthError('האימייל הזה כבר רשום במערכת');
      else if (err.code === 'auth/weak-password') setAuthError('הסיסמה חלשה מדי (לפחות 6 תווים)');
      else setAuthError('שגיאה בהתחברות. נסה שוב.');
    }
  };

  const handleLogout = () => { signOut(auth); };
  const loginAsAdmin = () => {
    const pass = prompt('הכנס סיסמת מנהל:');
    if (pass === '2531') setIsAdminMode(!isAdminMode);
    else if (pass !== null) alert('סיסמה שגויה!');
  };

  const handlePredict = (gameId, value) => {
    setPredictions(prev => {
      const key = `${matchday}-${gameId}`;
      const current = prev[key] || { winner: '', homeScore: 0, awayScore: 0 };
      return { ...prev, [key]: { ...current, winner: value } };
    });
  };

  const handleScoreChange = (gameId, type, delta) => {
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
    if (isLocked) return;
    setJokers(prev => {
      if (prev[matchday] === gameId) { const updated = { ...prev }; delete updated[matchday]; return updated; }
      return { ...prev, [matchday]: gameId };
    });
  };

  const getLiveStatistics = () => {
    let matchPoints = 0;
    Object.keys(actualScores).forEach(key => {
      const actual = actualScores[key];
      const pred = predictions[key];
      if (actual && actual.isFinished && pred) {
        const [md, gameId] = key.split('-');
        let localPoints = 0;
        if (pred.winner === actual.winner) {
          localPoints += 2;
          if (Number(pred.homeScore) === Number(actual.homeScore) && Number(pred.awayScore) === Number(actual.awayScore)) localPoints += 4;
        }
        if (jokers[md] && String(jokers[md]) === String(gameId)) localPoints *= 2;
        matchPoints += localPoints;
      }
    });
    return { totalPoints: matchPoints };
  };

  if (isCheckingAuth) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-yellow-500 font-bold text-xl" style={{ direction: 'rtl' }}>טוען נתונים...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-white" style={{ direction: 'rtl', backgroundColor: '#0f172a', backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%), url("https://www.transparenttextures.com/patterns/cubes.png")' }}>
        <div className="bg-gray-900/90 border-2 border-yellow-500 rounded-2xl p-8 shadow-[0_0_30px_rgba(234,179,8,0.2)] max-w-sm w-full backdrop-blur-md">
          <h1 className="text-3xl font-black text-yellow-500 text-center mb-2">🏆 ליגת יוספטל</h1>
          <p className="text-gray-400 text-center text-sm mb-8 font-bold">התחבר כדי להתחיל לנחש</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1">אימייל:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:border-yellow-500 focus:outline-none" style={{ direction: 'ltr' }} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1">סיסמה (לפחות 6 תווים):</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:border-yellow-500 focus:outline-none" style={{ direction: 'ltr' }} />
            </div>
            {authError && <div className="text-red-500 text-sm font-bold text-center bg-red-950/50 p-2 rounded border border-red-800">{authError}</div>}
            <button type="submit" className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-gray-950 font-black py-3 rounded-xl shadow-lg border border-yellow-400 mt-4 transition-all">
              {isLoginMode ? 'כניסה למשחק ⚽' : 'הרשמה לליגה 📝'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-400">
            {isLoginMode ? 'עדיין לא רשום? ' : 'כבר יש לך חשבון? '}
            <button onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }} className="text-yellow-500 font-bold hover:underline">{isLoginMode ? 'לחץ כאן להרשמה' : 'לחץ כאן להתחברות'}</button>
          </div>
        </div>
      </div>
    );
  }

  const username = user.email.split('@')[0];
  const stats = getLiveStatistics();

  return (
    <div className="min-h-screen text-white p-4 pb-28" style={{ direction: 'rtl', backgroundColor: '#0f172a' }}>
      <div className="sticky top-0 pt-2 pb-3 z-50 max-w-md mx-auto" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(15, 23, 42, 0.85)' }}>
        <header className="text-center p-4 bg-gray-900 rounded-xl border-b-2 border-yellow-500 shadow-md relative">
          <button onClick={handleLogout} className="absolute top-4 left-4 text-xs font-bold bg-gray-800 text-gray-400 px-3 py-1.5 rounded-lg">התנתק</button>
          <h1 className="text-2xl font-extrabold text-yellow-500">🏆 ליגת יוספטל</h1>
          <p className="text-gray-300 text-sm mt-1 font-bold">שלום, <span className="text-yellow-500">{username}</span> 👋</p>
        </header>
        <nav className="grid grid-cols-5 gap-1 bg-gray-900/90 p-1 rounded-xl mt-3 border border-gray-800">
          <button onClick={() => setCurrentTab('predictions')} className={`py-2 text-[9px] font-black rounded-lg ${currentTab === 'predictions' ? 'bg-yellow-500 text-gray-950' : 'text-gray-400'}`}>⚽ משחקים</button>
          <button onClick={() => setCurrentTab('tournament')} className={`py-2 text-[9px] font-black rounded-lg ${currentTab === 'tournament' ? 'bg-yellow-500 text-gray-950' : 'text-gray-400'}`}>👑 הטורניר</button>
          <button onClick={() => setCurrentTab('stats')} className={`py-2 text-[9px] font-black rounded-lg ${currentTab === 'stats' ? 'bg-yellow-500 text-gray-950' : 'text-gray-400'}`}>📈 סטט'</button>
          <button onClick={() => setCurrentTab('leaderboard')} className={`py-2 text-[9px] font-black rounded-lg ${currentTab === 'leaderboard' ? 'bg-yellow-500 text-gray-950' : 'text-gray-400'}`}>📊 טבלה</button>
          <button onClick={() => setCurrentTab('rules')} className={`py-2 text-[9px] font-black rounded-lg ${currentTab === 'rules' ? 'bg-yellow-500 text-gray-950' : 'text-gray-400'}`}>ℹ️ חוקים</button>
        </nav>
      </div>

      <div className="max-w-md mx-auto mt-4 space-y-4">
        {currentTab === 'predictions' && (
          <div className="space-y-4">
            <select value={matchday} onChange={(e) => setMatchday(Number(e.target.value))} className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold">
              {[...Array(36).keys()].map(i => <option key={i+1} value={i+1}>מחזור {i+1}</option>)}
            </select>
            {allFixtures[matchday]?.map(game => {
              const gameKey = `${matchday}-${game.id}`;
              const pred = predictions[gameKey] || { winner: '', homeScore: 0, awayScore: 0 };
              const isLocked = isGameLockedByDate(game.time);
              return (
                <div key={game.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                  <div className="flex justify-between items-center text-sm font-bold border-b border-gray-700 pb-2">
                    <span>{game.home}</span>
                    <span className="text-yellow-500 font-black">VS</span>
                    <span>{game.away}</span>
                  </div>
                  <div className="flex justify-center gap-4 mt-3">
                    {['1', 'X', '2'].map(o => (
                      <button key={o} disabled={isLocked} onClick={() => handlePredict(game.id, o)} className={`px-4 py-2 rounded-lg font-bold ${pred.winner === o ? 'bg-yellow-500 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>{o}</button>
                    ))}
                  </div>
                </div>
              );
            })}
            <button type="button" onClick={() => alert('הנתונים נשמרו בהצלחה!')} className="w-full bg-yellow-500 text-gray-950 font-black py-4 rounded-xl">💾 שמור ניחושים</button>
          </div>
        )}
      </div>
    </div>
  );
}
