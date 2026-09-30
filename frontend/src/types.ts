export interface ZipEntry {
  path: string;
  markdown: string;
  status: 'converted' | 'skipped' | 'error';
  error_message: string | null;
}

export interface ConversionResult {
  filename: string;
  title: string | null;
  markdown: string;
  chars: number;
  words: number;
  estimated_tokens: {
    cl100k_base: number;
    claude: number;
  };
  is_zip: boolean;
  time_elapsed: number;
  zip_entries: ZipEntry[] | null;
}
