/**
 * SpendFlow backend — a Google Apps Script web app bound to your spreadsheet.
 *
 * It reads and writes the sheet as YOU (the script owner), so the SpendFlow
 * app needs no Google sign-in. Setup: see docs/GOOGLE_SHEETS_SETUP.md.
 *
 * Protection: when the `Auth` tab has Enabled=TRUE, every action except
 * `authStatus` and `login` needs a session token from a successful `login`.
 * When protection is off (the default), anyone who has the web-app URL can
 * read and write the sheet — keep that URL private.
 */

var AUTH_SHEET = 'Auth';
var AUTH_HEADERS = ['Enabled', 'Username', 'PasswordHash', 'Salt', 'UpdatedAt'];
var SESSION_SECONDS = 6 * 60 * 60; // CacheService maximum
var MAX_FAILED_LOGINS = 10;
var LOCKOUT_SECONDS = 10 * 60;

function doPost(e) {
  try {
    var request = JSON.parse(e.postData.contents);
    return respond({ ok: true, data: handle(request) });
  } catch (err) {
    return respond({ ok: false, error: String(err.message || err), code: err.code || 'ERROR' });
  }
}

// Opening the URL in a browser is a quick way to check the deployment works.
function doGet() {
  return respond({ ok: true, data: 'SpendFlow script is running.' });
}

function respond(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function fail(code, message) {
  var err = new Error(message);
  err.code = code;
  return err;
}

function handle(req) {
  switch (req.action) {
    case 'authStatus':
      return { enabled: readAuth().enabled };
    case 'login':
      return login(req.username, req.password);
  }

  requireSession(req.token);

  switch (req.action) {
    case 'getRows':
      return getRows(req.sheet);
    case 'appendRow':
      return withLock(function () { sheetByName(req.sheet).appendRow(req.row); return true; });
    case 'updateRow':
      return withLock(function () {
        sheetByName(req.sheet).getRange(req.rowNumber, 1, 1, req.row.length).setValues([req.row]);
        return true;
      });
    case 'deleteRow':
      return withLock(function () { sheetByName(req.sheet).deleteRow(req.rowNumber); return true; });
    case 'getAuth':
      var auth = readAuth();
      return { enabled: auth.enabled, username: auth.username, hasPassword: !!auth.passwordHash };
    case 'setAuth':
      return withLock(function () { return setAuth(req); });
    default:
      throw fail('ERROR', 'Unknown action: ' + req.action);
  }
}

function withLock(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function sheetByName(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) {
    throw fail('MISSING_SHEET', 'The "' + name + '" tab was not found in the spreadsheet.');
  }
  return sheet;
}

function getRows(name) {
  var sheet = sheetByName(name);
  if (sheet.getLastRow() === 0) return [];
  return sheet.getDataRange().getDisplayValues();
}

// ---- Auth -----------------------------------------------------------------

function readAuth() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(AUTH_SHEET);
  var empty = { enabled: false, username: '', passwordHash: '', salt: '' };
  if (!sheet || sheet.getLastRow() < 2) return empty;
  var row = sheet.getRange(2, 1, 1, 4).getValues()[0];
  return {
    enabled: String(row[0]).toUpperCase() === 'TRUE',
    username: String(row[1]),
    passwordHash: String(row[2]),
    salt: String(row[3]),
  };
}

function hashPassword(password, salt) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    salt + ':' + password,
    Utilities.Charset.UTF_8
  );
  return bytes
    .map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); })
    .join('');
}

function login(username, password) {
  var cache = CacheService.getScriptCache();
  if (Number(cache.get('failed_logins') || 0) >= MAX_FAILED_LOGINS) {
    throw fail('ERROR', 'Too many failed attempts. Try again in a few minutes.');
  }

  var auth = readAuth();
  var ok =
    auth.enabled &&
    String(username).trim() === auth.username &&
    hashPassword(String(password), auth.salt) === auth.passwordHash;

  if (!ok) {
    cache.put('failed_logins', String(Number(cache.get('failed_logins') || 0) + 1), LOCKOUT_SECONDS);
    return { token: null };
  }
  return { token: newSession() };
}

function newSession() {
  var token = Utilities.getUuid() + Utilities.getUuid();
  CacheService.getScriptCache().put('session_' + token, '1', SESSION_SECONDS);
  return token;
}

function requireSession(token) {
  if (!readAuth().enabled) return;
  if (!token || !CacheService.getScriptCache().get('session_' + token)) {
    throw fail('UNAUTHORIZED', 'Not logged in.');
  }
}

function setAuth(req) {
  var current = readAuth();
  var username = String(req.username || '').trim();
  var password = String(req.password || '');
  var enabled = !!req.enabled;

  var salt = current.salt;
  var passwordHash = current.passwordHash;
  if (password) {
    salt = Utilities.getUuid();
    passwordHash = hashPassword(password, salt);
  }
  if (enabled && (!username || !passwordHash)) {
    throw fail('ERROR', 'A username and password are required to turn protection on.');
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(AUTH_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(AUTH_SHEET);
    sheet.appendRow(AUTH_HEADERS);
  }
  var row = [enabled ? 'TRUE' : 'FALSE', username, passwordHash, salt, new Date().toISOString()];
  sheet.getRange(2, 1, 1, row.length).setValues([row]);

  // Hand the person who just set this up a session so they aren't locked out
  // of the tab they're using.
  return { token: enabled ? newSession() : null };
}
