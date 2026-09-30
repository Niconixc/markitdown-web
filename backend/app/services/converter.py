import os
import zipfile
import tempfile
import time
from typing import Dict, List, Optional
from markitdown import MarkItDown
from backend.app.schemas import ConversionResult, ZipEntry

class MarkItDownService:
    def __init__(self):
        self.md = MarkItDown(enable_plugins=False)
        self.supported_formats = [
            ".pdf", ".pptx", ".docx", ".xlsx", ".csv",
            ".json", ".xml", ".html", ".jpg", ".png", ".zip"
        ]

    def _calc_stats(self, text: str) -> Dict:
        chars = len(text)
        words = len(text.split())
        return {
            "chars": chars,
            "words": words,
            "estimated_tokens": {
                "cl100k_base": int(chars / 4),
                "claude": int(chars / 3.5)
            }
        }

    def convert_file(self, file_path: str, filename: str) -> ConversionResult:
        start_time = time.time()
        result = self.md.convert(file_path)
        markdown = result.text_content
        title = result.title if hasattr(result, 'title') else None
        
        stats = self._calc_stats(markdown)
        time_elapsed = time.time() - start_time
        
        return ConversionResult(
            filename=filename,
            title=title,
            markdown=markdown,
            chars=stats["chars"],
            words=stats["words"],
            estimated_tokens=stats["estimated_tokens"],
            is_zip=False,
            time_elapsed=time_elapsed
        )

    def convert_url(self, url: str) -> ConversionResult:
        start_time = time.time()
        result = self.md.convert(url)
        markdown = result.text_content
        title = result.title if hasattr(result, 'title') else None
        
        stats = self._calc_stats(markdown)
        time_elapsed = time.time() - start_time
        
        return ConversionResult(
            filename=url,
            title=title,
            markdown=markdown,
            chars=stats["chars"],
            words=stats["words"],
            estimated_tokens=stats["estimated_tokens"],
            is_zip=False,
            time_elapsed=time_elapsed
        )

    def convert_zip(self, file_path: str, filename: str) -> ConversionResult:
        start_time = time.time()
        zip_entries: List[ZipEntry] = []
        combined_markdown = []
        
        with tempfile.TemporaryDirectory() as extract_dir:
            try:
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_dir)
                    
                    for root, _, files in os.walk(extract_dir):
                        for file in files:
                            extracted_path = os.path.join(root, file)
                            rel_path = os.path.relpath(extracted_path, extract_dir)
                            
                            try:
                                result = self.md.convert(extracted_path)
                                md_text = result.text_content
                                zip_entries.append(ZipEntry(
                                    path=rel_path,
                                    markdown=md_text,
                                    status='converted'
                                ))
                                combined_markdown.append(f"# {rel_path}\n\n{md_text}")
                            except Exception as e:
                                zip_entries.append(ZipEntry(
                                    path=rel_path,
                                    markdown="",
                                    status='error',
                                    error_message=str(e)
                                ))
            except zipfile.BadZipFile as e:
                raise ValueError(f"Invalid ZIP file: {str(e)}")
                
        full_markdown = "\n\n---\n\n".join(combined_markdown)
        stats = self._calc_stats(full_markdown)
        time_elapsed = time.time() - start_time
        
        return ConversionResult(
            filename=filename,
            title=None,
            markdown=full_markdown,
            chars=stats["chars"],
            words=stats["words"],
            estimated_tokens=stats["estimated_tokens"],
            is_zip=True,
            time_elapsed=time_elapsed,
            zip_entries=zip_entries
        )
