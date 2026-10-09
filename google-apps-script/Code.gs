/**
 * Victoria Finance - Utafiti wa Kuridhika kwa Wateja 2026
 * Hupokea majibu kutoka kwenye fomu (Vercel) na kuyaandika kwenye sheet hii.
 *
 * Jinsi ya kuweka:
 *  1. Fungua Google Sheet ya majibu > Extensions > Apps Script.
 *  2. Futa kilichopo, bandika faili hii yote.
 *  3. Badilisha SECRET hapa chini (liwe sawa na SHEET_SECRET kwenye Vercel).
 *  4. Deploy > New deployment > Web app
 *       Execute as: Me        Who has access: Anyone
 *  5. Nakili "Web app URL" (inaishia /exec) -> SHEET_WEBHOOK_URL kwenye Vercel.
 *
 * Ukibadilisha msimbo huu baadaye: Deploy > Manage deployments > Edit > Version: New version.
 */
var SECRET = 'BADILISHA-NENO-HILI-LA-SIRI';
var SHEET_NAME = 'Majibu';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (!data || data.secret !== SECRET) return json({ ok: false, error: 'unauthorized' });
    if (!Array.isArray(data.headers) || !Array.isArray(data.row) || data.headers.length !== data.row.length) {
      return json({ ok: false, error: 'bad payload' });
    }

    var lock = LockService.getScriptLock();
    lock.waitLock(20000); // two clients submitting at once must not overwrite each other
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
      var width = data.headers.length;

      if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, width).setValues([data.headers]).setFontWeight('bold').setWrap(true);
        sheet.setFrozenRows(1);
      }

      var rowNumber = sheet.getLastRow() + 1;

      // Phone numbers: keep as text so 0712... and +255... are not turned into numbers.
      (data.textCols || []).forEach(function (col) {
        sheet.getRange(rowNumber, col + 1).setNumberFormat('@');
      });

      var textCols = data.textCols || [];
      var row = data.row.map(function (value, i) {
        if (typeof value !== 'string') return value;
        if (textCols.indexOf(i) !== -1) return value;
        // Anything a client typed that starts like a formula is stored as plain text.
        return /^[=+\-@]/.test(value) ? "'" + value : value;
      });

      sheet.getRange(rowNumber, 1, 1, width).setValues([row]);
    } finally {
      lock.releaseLock();
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ ok: true, message: 'Survey endpoint is running.' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
