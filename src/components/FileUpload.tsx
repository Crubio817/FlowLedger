/**
 * File Upload Component with resumable upload support
 * Part of Communication Hub enhanced features
 */

import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, Image, Video, File, AlertCircle, CheckCircle } from 'lucide-react';
import { useFileUpload } from '../hooks/useCommunicationHub.js';
import { Button } from '../ui/button.js';

export interface FileUploadProps {
  threadId?: number;
  principalId?: number;
  orgId?: number;
  onUploadComplete?: (fileUrl: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  threadId,
  principalId,
  orgId,
  onUploadComplete,
  onUploadError,
  accept,
  maxSizeMB = 100,
  multiple = false,
  className = ''
}) => {
  const { uploadState, uploadFile, resetUpload } = useFileUpload(threadId, principalId, orgId);
  const [dragActive, setDragActive] = useState(false);

  // Get file type icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    // Check file type if accept is specified
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const isAccepted = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
        }
        return file.type.match(acceptedType.replace('*', '.*'));
      });

      if (!isAccepted) {
        return `File type not supported. Accepted types: ${accept}`;
      }
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList) => {
    const file = files[0]; // For now, handle single file
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      onUploadError?.(validationError);
      return;
    }

    try {
      const session = await uploadFile(file);
      if (session?.blob_url) {
        onUploadComplete?.(session.blob_url, file.name);
      }
    } catch (error: any) {
      onUploadError?.(error.message || 'Upload failed');
    }
  }, [uploadFile, onUploadComplete, onUploadError, validateFile]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  // Render upload progress
  const renderProgress = () => {
    if (!uploadState.isUploading && !uploadState.session) return null;

    return (
      <div className="mt-4 p-4 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg">
        {uploadState.session && (
          <div className="flex items-center gap-3 mb-3">
            {getFileIcon(uploadState.session.mime_type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">
                {uploadState.session.filename}
              </p>
              <p className="text-xs text-zinc-400">
                {formatFileSize(uploadState.session.total_size_bytes)}
              </p>
            </div>
            {uploadState.error && (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            {uploadState.progress === 100 && !uploadState.error && (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            )}
          </div>
        )}

        {uploadState.isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Uploading...</span>
              <span className="text-zinc-300">{Math.round(uploadState.progress)}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div 
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
          </div>
        )}

        {uploadState.error && (
          <div className="mt-2 text-sm text-red-400">
            {uploadState.error}
          </div>
        )}

        {uploadState.completedUrl && (
          <div className="mt-2 text-sm text-emerald-400">
            Upload completed successfully!
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${dragActive 
            ? 'border-cyan-400 bg-cyan-400/10' 
            : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/20'
          }
          ${uploadState.isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (!uploadState.isUploading) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept || '*/*';
            input.multiple = multiple;
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              if (target.files && target.files.length > 0) {
                handleFileSelect(target.files);
              }
            };
            input.click();
          }
        }}
      >
        <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
        <p className="text-lg font-medium text-zinc-200 mb-1">
          {dragActive ? 'Drop files here' : 'Upload files'}
        </p>
        <p className="text-sm text-zinc-400 mb-3">
          Drag and drop files here, or click to browse
        </p>
        {accept && (
          <p className="text-xs text-zinc-500">
            Accepted types: {accept}
          </p>
        )}
        <p className="text-xs text-zinc-500">
          Maximum file size: {maxSizeMB}MB
        </p>
      </div>

      {/* Progress Display */}
      {renderProgress()}

      {/* Reset Button */}
      {(uploadState.error || uploadState.completedUrl) && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={resetUpload}
            className="text-zinc-400 border-zinc-700 hover:border-zinc-600"
          >
            Upload Another File
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
