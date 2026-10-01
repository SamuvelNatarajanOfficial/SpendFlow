/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_SHEET_ID: string;
  readonly VITE_ALLOWED_GOOGLE_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
