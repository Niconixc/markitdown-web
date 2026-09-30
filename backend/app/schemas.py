from pydantic import BaseModel
from typing import Optional, List, Dict

class ZipEntry(BaseModel):
    path: str
    markdown: str
    status: str
    error_message: Optional[str] = None

class ConversionResult(BaseModel):
    filename: str
    title: Optional[str] = None
    markdown: str
    chars: int
    words: int
    estimated_tokens: Dict[str, int]
    is_zip: bool
    time_elapsed: float
    zip_entries: Optional[List[ZipEntry]] = None

class UrlRequest(BaseModel):
    url: str

class HealthResponse(BaseModel):
    status: str
    version: str
    supported_formats: List[str]
