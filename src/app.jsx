import React, { useState, useEffect } from 'react';

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
  const [currentTab, setCurrentTab] = useState('predictions');
  const [matchday, setMatchday] = useState(1);
  const [liveClockText, setLiveClockText] = useState('');
  const [countdownText, setCountdownText] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  // שמירה מקומית (Local Storage)
  const [predictions, setPredictions] = useState(() => JSON.parse(localStorage.getItem('predictions')) || {});
  const [tournament, setTournament] = useState(() => JSON.parse(localStorage.getItem('tournament')) || { champion: '', topScorer: '', topAssists: '', favoriteTeam: '' });
  const [jokers, setJokers] = useState(() => JSON.parse(localStorage.getItem('jokers')) || {});
  const [actualScores, setActualScores] = useState(() => JSON.parse(localStorage.getItem('actualScores')) || {});
  const [matchdayGoals, setMatchdayGoals] = useState(() => JSON.parse(localStorage.getItem('matchdayGoals')) || {});

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

  useEffect(() => { localStorage.setItem('predictions', JSON.stringify(predictions)); }, [predictions]);
  useEffect(() => { localStorage.setItem('tournament', JSON.stringify(tournament)); }, [tournament]);
  useEffect(() => { localStorage.setItem('jokers', JSON.stringify(jokers)); }, [jokers]);
  useEffect(() => { localStorage.setItem('actualScores', JSON.stringify(actualScores)); }, [actualScores]);
  useEffect(() => { localStorage.setItem('matchdayGoals', JSON.stringify(matchdayGoals)); }, [matchdayGoals]);

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
      if (prev[matchday] === gameId) {
        const updated = { ...prev }; delete updated[matchday]; return updated;
      }
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

    let liveGoalsPoints = 0;
    const currentScorer = tournament.topScorer || '';
    if (currentScorer.trim()) {
      Object.keys(matchdayGoals).forEach(key => {
        const parts = key.split('-');
        if (parts.length >= 2 && parts[1].trim() === currentScorer.trim()) {
          liveGoalsPoints += (matchdayGoals[key] || 0) * 2;
        }
      });
    }

    return { totalPoints: matchPoints + liveGoalsPoints };
  };

  const stats = getLiveStatistics();
  const userTeamSuffix = tournament.favoriteTeam ? ` (${tournament.favoriteTeam})` : '';

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 pb-24" style={{ direction: 'rtl' }}>
      
      <div className="sticky top-0 bg-gray-950/95 backdrop-blur-md pt-2 pb-3 z-50 max-w-md mx-auto border-b border-gray-900/50">
        <header className="text-center p-4 bg-gray-900 rounded-xl border-b border-yellow-500/30 shadow-lg">
          <h1 className="text-2xl font-extrabold text-yellow-500">🏆 10 חבר'ה - יוספטל</h1>
          <div className="text-sm text-white font-bold mt-2 bg-gray-800 inline-block px-4 py-1 rounded-full shadow-inner">
            {liveClockText}
          </div>
        </header>

        <nav className="grid grid-cols-5 gap-1 bg-gray-900 p-1 rounded-xl mt-3 border border-gray-800">
          <button type="button" onClick={() => setCurrentTab('predictions')} className={`py-2 text-[9px] font-black rounded-lg transition-all ${currentTab === 'predictions' ? 'bg-yellow-500 text-gray-950' : 'text-gray-400'}`}>⚽ משחקים</button>
          <button type="button" onClick={() => setCurrentTab('tournament')} className={`py-2 text-[9px] font-black rounded-lg transition-all ${currentTab === 'tournament' ? 'bg-yellow-500 text-gray-950' : 'text-gray-400'}`}>👑 הטורניר</button>
          <button type="button" onClick={() => setCurrentTab('stats')} className={`py-2 text-[9px] font-black rounded-lg transition-all ${currentTab === 'stats' ? 'bg-yellow-500 text-gray-950' : 'text-gray-400'}`}>📈 סטט'</button>
          <button type="button" onClick={() => setCurrentTab('leaderboard')} className={`py-2 text-[9px] font-black rounded-lg transition-all ${currentTab === 'leaderboard' ? 'bg-yellow-500 text-gray-950' : 'text-gray-400'}`}>📊 טבלה</button>
          <button type="button" onClick={() => setCurrentTab('rules')} className={`py-2 text-[9px] font-black rounded-lg transition-all ${currentTab === 'rules' ? 'bg-yellow-500 text-gray-950' : 'text-gray-400'}`}>ℹ️ חוקים</button>
        </nav>
      </div>

      <div className="max-w-md mx-auto mt-4">
        {currentTab === 'predictions' && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-xl space-y-2">
              <select value={matchday} onChange={(e) => setMatchday(Number(e.target.value))} className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:outline-none">
                {[...Array(36).keys()].map(i => <option key={i+1} value={i+1}>מחזור {i+1}</option>)}
              </select>
              {countdownText && <div className="p-2 rounded-lg text-center text-xs font-black bg-amber-950/30 border border-amber-900/60 text-amber-400">{countdownText}</div>}
            </div>

            {allFixtures[matchday]?.map(game => {
              const gameKey = `${matchday}-${game.id}`;
              const pred = predictions[gameKey] || { winner: '', homeScore: 0, awayScore: 0 };
              const actual = actualScores[gameKey] || { homeScore: 0, awayScore: 0, winner: 'X', isFinished: false };
              const isLocked = isGameLockedByDate(game.time) || actual.isFinished;
              const isJoker = jokers[matchday] === game.id;

              return (
                <div key={game.id} className={`border rounded-xl p-4 shadow-md space-y-3 ${isJoker ? 'bg-gradient-to-br from-gray-900 to-amber-950/40 border-yellow-600/60' : 'bg-gray-900 border-gray-800'}`}>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>{game.time}</span>
                    <button type="button" disabled={isLocked} onClick={() => toggleJoker(game.id, isLocked)} className={`px-2 py-0.5 rounded text-[10px] font-black border ${isJoker ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-950 text-gray-500'}`}>
                      {isJoker ? "🃏 ג'וקר פעיל!" : "🃏 סמן ג'וקר"}
                    </button>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-base w-5/12 text-right">{game.home}</span>
                    <span className="text-gray-600 text-xs font-black">VS</span>
                    <span className="font-bold text-base w-5/12 text-left">{game.away}</span>
                  </div>
                  {!isLocked ? (
                    <div className="flex justify-between items-center bg-gray-950 p-3 rounded-xl border border-gray-800" style={{ direction: 'ltr' }}>
                      <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
                        <button type="button" onClick={() => handleScoreChange(game.id, 'away', -1)} className="px-2 py-1 text-gray-400 font-bold">-</button>
                        <span className="px-3 py-1 font-black text-yellow-500 min-w-[24px] text-center">{pred.awayScore}</span>
                        <button type="button" onClick={() => handleScoreChange(game.id, 'away', 1)} className="px-2 py-1 text-gray-400 font-bold">+</button>
                      </div>
                      <span className="text-gray-600 font-black">:</span>
                      <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
                        <button type="button" onClick={() => handleScoreChange(game.id, 'home', -1)} className="px-2 py-1 text-gray-400 font-bold">-</button>
                        <span className="px-3 py-1 font-black text-yellow-500 min-w-[24px] text-center">{pred.homeScore}</span>
                        <button type="button" onClick={() => handleScoreChange(game.id, 'home', 1)} className="px-2 py-1 text-gray-400 font-bold">+</button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-950 p-2 text-center rounded-lg text-xs text-gray-400">הניחוש השמור: <span className="text-white font-bold">{pred.winner ? `${pred.homeScore}-${pred.awayScore}` : 'אין'}</span></div>
                  )}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {['1', 'X', '2'].map(o => (
                      <button key={o} type="button" disabled={isLocked} onClick={() => handlePredict(game.id, o)} className={`py-1.5 text-xs font-black rounded-lg border ${pred.winner === o ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-800 border-gray-700'}`}>{o === '1' ? '1' : o === 'X' ? 'X' : '2'}</button>
                    ))}
                  </div>
                </div>
              );
            })}
            <button type="button" onClick={() => alert('הניחושים נשמרו במכשיר בהצלחה!')} className="w-full bg-yellow-500 text-gray-950 font-black py-4 rounded-xl shadow-xl border border-yellow-600 text-sm">💾 שמור ניחושים</button>
          </div>
        )}

        {currentTab === 'tournament' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h2 className="text-lg font-black text-yellow-500 text-center mb-2">📝 הניחושים המיוחדים שלי</h2>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">🏆 הקבוצה האהודה שלי בארץ:</label>
              <select value={tournament.favoriteTeam} onChange={(e) => setTournament({...tournament, favoriteTeam: e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:outline-none text-sm">
                <option value="">-- בחר קבוצה --</option>
                {ISRAELI_TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">🏆 האלופה שלי:</label>
              <input type="text" value={tournament.champion} onChange={(e) => setTournament({...tournament, champion: e.target.value})} placeholder="הקלד את שם האלופה..." className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 text-sm focus:outline-none"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">👟 מלך השערים שלי:</label>
              <input type="text" value={tournament.topScorer} onChange={(e) => setTournament({...tournament, topScorer: e.target.value})} placeholder="הקלד את מלך השערים..." className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 text-sm focus:outline-none"/>
            </div>
            <button type="button" onClick={() => alert('הבחירות ארוכות הטווח עודכנו בהצלחה!')} className="w-full bg-yellow-500 text-gray-950 font-black py-3.5 rounded-xl border border-yellow-600 text-sm mt-2">💾 שמור שינויים</button>
          </div>
        )}

        {currentTab === 'leaderboard' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-xl">
            <h2 className="text-lg font-bold text-gray-200 mb-3">📊 מצב הטבלה הכללית</h2>
            <div className="overflow-hidden rounded-lg border border-gray-800">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-gray-400 text-xs">
                    <th className="p-3">מיקום</th>
                    <th className="p-3">שם המנחש</th>
                    <th className="p-3 text-center">נקודות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr className="bg-gray-900">
                    <td className="p-3 font-bold text-center text-xs text-gray-400 bg-gray-950/20">1</td>
                    <td className="p-3 font-medium text-gray-100">אייל אשכנזי{userTeamSuffix}</td>
                    <td className="p-3 text-center font-bold text-yellow-500 bg-gray-950/40">{stats.totalPoints}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentTab === 'rules' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-md text-sm leading-relaxed text-gray-300 space-y-3">
            <h2 className="text-yellow-500 font-black text-lg flex items-center gap-2">🎯 שיטת הניקוד המעודכנת</h2>
            <p>• ניחוש כיוון (1,X,2) נכון: מעניק <span className="text-white">2 נקודות</span>.</p>
            <p>• ניחוש תוצאה מדויקת נכון: מוסיף עוד <span className="text-yellow-500 font-bold">4 נק' בונוס</span> (סה"כ 6 נקודות).</p>
            <p>• <span className="text-yellow-500 font-bold">🃏 חוק הג'וקר:</span> משחק שסומן כג'וקר (אחד למחזור) מקבל כפל ניקוד.</p>
          </div>
        )}
      </div>

      <footer className="max-w-md mx-auto mt-12 text-center">
        <button type="button" onClick={loginAsAdmin} className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${isAdminMode ? 'bg-red-950 border-red-800 text-red-400' : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-white'}`}>
          {isAdminMode ? '🔒 צא ממצב מנהל' : '🔧 ניהול מערכת (הזנת תוצאות)'}
        </button>
      </footer>
    </div>
  );
}
