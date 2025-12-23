"""
File Upload Validation Utilities
Provides comprehensive validation for uploaded files to prevent security issues
"""
import hashlib
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException, status
import logging

logger = logging.getLogger(__name__)

# Allowed video MIME types
ALLOWED_VIDEO_MIME_TYPES = [
    "video/mp4",
    "video/x-msvideo",  # AVI
    "video/quicktime",  # MOV
]

# Allowed file extensions
ALLOWED_VIDEO_EXTENSIONS = ["mp4", "avi", "mov"]

# Maximum file size (100MB)
MAX_FILE_SIZE_MB = 100
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

# Dangerous file patterns to reject
DANGEROUS_PATTERNS = [
    b"<?php",  # PHP code
    b"<script",  # JavaScript
    b"#!/bin/",  # Shell scripts
]

# Video file signatures (magic bytes)
VIDEO_SIGNATURES = {
    # MP4 (ftyp atom at offset 4 or at beginning)
    b'ftyp': 'video/mp4',
    b'\x00\x00\x00\x18ftypmp4': 'video/mp4',
    b'\x00\x00\x00\x1cftypmp4': 'video/mp4',
    b'\x00\x00\x00\x20ftypisom': 'video/mp4',
    b'\x00\x00\x00\x18ftypisom': 'video/mp4',
    # AVI
    b'RIFF': 'video/x-msvideo',
    # MOV (also uses ftyp but with 'qt  ')
    b'moov': 'video/quicktime',
    b'free': 'video/quicktime',
    b'mdat': 'video/quicktime',
    b'wide': 'video/quicktime',
    b'pnot': 'video/quicktime',
}


class FileValidator:
    """Comprehensive file validation for security"""
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """
        Sanitize filename to prevent path traversal and other attacks
        
        Args:
            filename: Original filename
            
        Returns:
            Sanitized filename
        """
        # Remove path components
        filename = filename.split("/")[-1].split("\\")[-1]
        
        # Remove dangerous characters
        dangerous_chars = ['..', '<', '>', ':', '"', '|', '?', '*', '\0']
        for char in dangerous_chars:
            filename = filename.replace(char, '_')
        
        # Limit length
        if len(filename) > 255:
            name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
            filename = name[:250] + ('.' + ext if ext else '')
        
        return filename
    
    @staticmethod
    def validate_file_extension(filename: str) -> Tuple[bool, Optional[str]]:
        """
        Validate file extension
        
        Args:
            filename: Name of the file
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not filename:
            return False, "Filename is required"
        
        # Get extension
        if '.' not in filename:
            return False, "File must have an extension"
        
        extension = filename.rsplit('.', 1)[1].lower()
        
        if extension not in ALLOWED_VIDEO_EXTENSIONS:
            return False, f"Invalid file extension. Allowed: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        
        return True, None
    
    @staticmethod
    async def validate_file_size(file: UploadFile) -> Tuple[bool, Optional[str], int]:
        """
        Validate file size
        
        Args:
            file: Uploaded file
            
        Returns:
            Tuple of (is_valid, error_message, file_size)
        """
        # Read file to check size
        content = await file.read()
        file_size = len(content)
        
        # Reset file pointer
        await file.seek(0)
        
        if file_size > MAX_FILE_SIZE_BYTES:
            return False, f"File size exceeds maximum allowed size of {MAX_FILE_SIZE_MB}MB", file_size
        
        if file_size == 0:
            return False, "File is empty", file_size
        
        return True, None, file_size
    
    @staticmethod
    async def validate_mime_type(file: UploadFile) -> Tuple[bool, Optional[str]]:
        """
        Validate MIME type using file signatures (magic bytes)
        
        Args:
            file: Uploaded file
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            # Read first 32 bytes for magic number detection
            content = await file.read(32)
            await file.seek(0)
            
            # Check content-type header first
            if file.content_type and file.content_type in ALLOWED_VIDEO_MIME_TYPES:
                # Verify with file signature
                detected_type = None
                
                # Check for common video signatures
                for signature, mime_type in VIDEO_SIGNATURES.items():
                    if signature in content[:16]:
                        detected_type = mime_type
                        break
                
                # Also check at offset 4 for MP4 ftyp
                if detected_type is None and len(content) > 8:
                    if content[4:8] == b'ftyp':
                        detected_type = 'video/mp4'
                
                # AVI check (RIFF then AVI at offset 8)
                if detected_type is None and content[:4] == b'RIFF' and len(content) > 12:
                    if content[8:12] == b'AVI ':
                        detected_type = 'video/x-msvideo'
                
                if detected_type:
                    return True, None
                
                # If we have a valid content-type header but can't verify signature, allow it
                # Some video formats have variable headers
                return True, None
            
            # If no content-type, try to detect from file signature only
            detected_type = None
            
            # Check for common video signatures
            for signature, mime_type in VIDEO_SIGNATURES.items():
                if signature in content[:16]:
                    detected_type = mime_type
                    break
            
            # Check at offset 4 for MP4 ftyp
            if detected_type is None and len(content) > 8:
                if content[4:8] == b'ftyp':
                    detected_type = 'video/mp4'
            
            # AVI check
            if detected_type is None and content[:4] == b'RIFF' and len(content) > 12:
                if content[8:12] == b'AVI ':
                    detected_type = 'video/x-msvideo'
            
            if detected_type and detected_type in ALLOWED_VIDEO_MIME_TYPES:
                return True, None
            
            return False, "Invalid file type. File must be a video (mp4, avi, or mov)."
            
        except Exception as e:
            logger.error(f"Error validating MIME type: {str(e)}")
            # If validation fails, check extension as fallback
            if file.filename:
                ext = file.filename.rsplit('.', 1)[-1].lower()
                if ext in ALLOWED_VIDEO_EXTENSIONS:
                    return True, None
            return False, "Failed to validate file type"
    
    @staticmethod
    async def scan_for_malicious_content(file: UploadFile) -> Tuple[bool, Optional[str]]:
        """
        Scan file for malicious patterns
        
        Args:
            file: Uploaded file
            
        Returns:
            Tuple of (is_safe, error_message)
        """
        try:
            # Read first 8KB for pattern matching
            content = await file.read(8192)
            await file.seek(0)
            
            # Check for dangerous patterns
            for pattern in DANGEROUS_PATTERNS:
                if pattern in content:
                    logger.warning(f"Malicious pattern detected in file: {file.filename}")
                    return False, "File contains potentially malicious content"
            
            return True, None
            
        except Exception as e:
            logger.error(f"Error scanning file: {str(e)}")
            return False, "Failed to scan file for malicious content"
    
    @staticmethod
    async def calculate_file_hash(file: UploadFile) -> str:
        """
        Calculate SHA-256 hash of file for integrity verification
        
        Args:
            file: Uploaded file
            
        Returns:
            SHA-256 hash as hex string
        """
        sha256_hash = hashlib.sha256()
        
        # Read file in chunks
        chunk_size = 8192
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            sha256_hash.update(chunk)
        
        # Reset file pointer
        await file.seek(0)
        
        return sha256_hash.hexdigest()
    
    @staticmethod
    async def validate_video_file(file: UploadFile) -> dict:
        """
        Comprehensive validation for video file uploads
        
        Args:
            file: Uploaded file
            
        Returns:
            Dict with validation results and file metadata
            
        Raises:
            HTTPException: If validation fails
        """
        logger.info(f"Validating video file: {file.filename}")
        
        # Sanitize filename
        sanitized_filename = FileValidator.sanitize_filename(file.filename)
        
        # Validate extension
        is_valid, error = FileValidator.validate_file_extension(sanitized_filename)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error
            )
        
        # Validate file size
        is_valid, error, file_size = await FileValidator.validate_file_size(file)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=error
            )
        
        # Validate MIME type
        is_valid, error = await FileValidator.validate_mime_type(file)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error
            )
        
        # Scan for malicious content
        is_safe, error = await FileValidator.scan_for_malicious_content(file)
        if not is_safe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error
            )
        
        # Calculate file hash
        file_hash = await FileValidator.calculate_file_hash(file)
        
        logger.info(f"File validation passed: {sanitized_filename} ({file_size} bytes)")
        
        return {
            "original_filename": file.filename,
            "sanitized_filename": sanitized_filename,
            "file_size": file_size,
            "file_hash": file_hash,
            "validated": True
        }


# Singleton instance
file_validator = FileValidator()
