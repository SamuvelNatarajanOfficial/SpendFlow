import { appendRow, getSheetRows, updateRowByRowNumber } from '../sheets';
import { MissingSheetError } from '../errors';
import type { StoredCredentials } from '../../localAuth';

const SHEET_NAME = 'Auth';

export interface AuthConfig extends StoredCredentials {
  enabled: boolean;
}

/** Protection is off by default — this is what an empty or missing Auth tab means. */
export const PROTECTION_OFF: AuthConfig = {
  enabled: false,
  username: '',
  passwordHash: '',
  salt: '',
};

function fromRow(row: string[]): AuthConfig {
  const [enabled = '', username = '', passwordHash = '', salt = ''] = row;
  return {
    enabled: enabled.trim().toUpperCase() === 'TRUE',
    username,
    passwordHash,
    salt,
  };
}

function toRow(config: AuthConfig): string[] {
  return [
    config.enabled ? 'TRUE' : 'FALSE',
    config.username,
    config.passwordHash,
    config.salt,
    new Date().toISOString(),
  ];
}

/**
 * The Auth tab holds at most one data row. A missing tab or empty row means
 * "no protection" — the app opens without a login unless the user turned it on.
 */
async function get(): Promise<AuthConfig> {
  try {
    const { rows } = await getSheetRows(SHEET_NAME);
    if (rows.length === 0) return PROTECTION_OFF;
    return fromRow(rows[0]);
  } catch (error) {
    if (error instanceof MissingSheetError) return PROTECTION_OFF;
    throw error;
  }
}

async function save(config: AuthConfig): Promise<void> {
  const { rows } = await getSheetRows(SHEET_NAME);
  if (rows.length === 0) {
    await appendRow(SHEET_NAME, toRow(config));
  } else {
    await updateRowByRowNumber(SHEET_NAME, 2, toRow(config));
  }
}

export const authRepository = { get, save };
