interface ImportMetaEnv {
    readonly NEXT_PUBLIC_API_URL: string;
    // Thêm các NEXT_PUBLIC_ khác nếu cần, e.g.:
    // readonly NEXT_PUBLIC_ANOTHER_VAR: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }