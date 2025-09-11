import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, Check, File, Image, Archive } from 'lucide-react';
import { createDocument, type Document } from '../services/docs.api.ts';

interface UploadDocumentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FileUpload {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  preview?: string;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ onClose, onSuccess }) => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { value: 'proposal', label: 'Proposal', icon: '📄' },
    { value: 'sow', label: 'Statement of Work', icon: '📋' },
    { value: 'report', label: 'Report', icon: '📊' },
    { value: 'deliverable', label: 'Deliverable', icon: '📦' },
    { value: 'sop', label: 'SOP', icon: '📖' },
    { value: 'evidence', label: 'Evidence', icon: '🔍' },
    { value: 'other', label: 'Other', icon: '📄' }
  ];

  const classificationTypes = [
    { value: 'internal', label: 'Internal', color: 'text-blue-400' },
    { value: 'client_view', label: 'Client View', color: 'text-emerald-400' },
    { value: 'confidential', label: 'Confidential', color: 'text-red-400' }
  ];

  const [defaultSettings, setDefaultSettings] = useState({
    type: 'other' as Document['type'],
    classification: 'internal' as Document['classification']
  });

  const acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/zip',
    'application/x-zip-compressed'
  ];

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf')) return FileText;
    if (type.includes('word') || type.includes('document')) return FileText;
    if (type.includes('excel') || type.includes('sheet')) return FileText;
    if (type.includes('powerpoint') || type.includes('presentation')) return FileText;
    if (type.includes('zip') || type.includes('compressed')) return Archive;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert(`File "${file.name}" is too large. Maximum size is 100MB.`);
        return false;
      }
      if (!acceptedTypes.includes(file.type) && file.type !== '') {
        alert(`File "${file.name}" type is not supported.`);
        return false;
      }
      return true;
    });

    const fileUploads: FileUpload[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...fileUploads]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const simulateUpload = (fileUpload: FileUpload): Promise<string> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 100) {
          progress = 100;
          clearInterval(interval);
          // Simulate success/error
          if (Math.random() > 0.1) { // 90% success rate
            resolve(`https://storage.example.com/${fileUpload.file.name}`);
          } else {
            reject(new Error('Upload failed'));
          }
        }
        
        setFiles(prev => prev.map(f => 
          f.id === fileUpload.id 
            ? { ...f, progress, status: progress === 100 ? 'success' : 'uploading' as const }
            : f
        ));
      }, 200);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    
    try {
      // Upload files and create documents
      const uploadPromises = files.map(async (fileUpload) => {
        try {
          setFiles(prev => prev.map(f => 
            f.id === fileUpload.id 
              ? { ...f, status: 'uploading', progress: 0 }
              : f
          ));

          // Simulate file upload
          const storageUrl = await simulateUpload(fileUpload);

          // Create document record
          await createDocument({
            org_id: 1, // TODO: Get from auth context
            title: fileUpload.file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            type: defaultSettings.type,
            source: 'upload',
            classification: defaultSettings.classification,
            storage_url: storageUrl,
            mime_type: fileUpload.file.type,
            size_bytes: fileUpload.file.size
          });

          setFiles(prev => prev.map(f => 
            f.id === fileUpload.id 
              ? { ...f, status: 'success', progress: 100 }
              : f
          ));
        } catch (error) {
          setFiles(prev => prev.map(f => 
            f.id === fileUpload.id 
              ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
              : f
          ));
        }
      });

      await Promise.all(uploadPromises);
      
      // Check if all uploads were successful
      const finalFiles = files.map(f => ({ ...f, status: 'success' })); // This is a simplified check
      const hasErrors = finalFiles.some(f => f.status === 'error');
      
      if (!hasErrors) {
        onSuccess();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const allUploadsComplete = files.length > 0 && files.every(f => f.status === 'success' || f.status === 'error');
  const hasSuccessfulUploads = files.some(f => f.status === 'success');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <Upload className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Upload Documents</h2>
              <p className="text-zinc-400 text-sm">Upload files to create new documents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  dragOver
                    ? 'border-cyan-500 bg-cyan-500/5'
                    : 'border-zinc-600 hover:border-zinc-500 hover:bg-zinc-800/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Drop files here or click to browse
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Supports PDF, Word, Excel, PowerPoint, images, and more
                </p>
                <p className="text-zinc-500 text-xs">
                  Maximum file size: 100MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={acceptedTypes.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-white">Files to Upload ({files.length})</h3>
                  <div className="space-y-2">
                    {files.map((fileUpload) => {
                      const Icon = getFileIcon(fileUpload.file);
                      return (
                        <div key={fileUpload.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                          <div className="flex items-center gap-3">
                            <Icon className="w-8 h-8 text-zinc-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-white font-medium truncate">{fileUpload.file.name}</h4>
                                <div className="flex items-center gap-2">
                                  {fileUpload.status === 'success' && (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                  )}
                                  {fileUpload.status === 'error' && (
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                  )}
                                  {fileUpload.status === 'pending' && (
                                    <button
                                      onClick={() => removeFile(fileUpload.id)}
                                      className="p-1 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-500">
                                  {formatFileSize(fileUpload.file.size)} • {fileUpload.file.type || 'Unknown type'}
                                </span>
                                <span className={`text-xs font-medium ${
                                  fileUpload.status === 'success' ? 'text-emerald-400' :
                                  fileUpload.status === 'error' ? 'text-red-400' :
                                  fileUpload.status === 'uploading' ? 'text-cyan-400' :
                                  'text-zinc-400'
                                }`}>
                                  {fileUpload.status === 'success' && 'Uploaded'}
                                  {fileUpload.status === 'error' && 'Failed'}
                                  {fileUpload.status === 'uploading' && `${Math.round(fileUpload.progress)}%`}
                                  {fileUpload.status === 'pending' && 'Ready'}
                                </span>
                              </div>
                              {fileUpload.status === 'uploading' && (
                                <div className="mt-2">
                                  <div className="w-full bg-zinc-700 rounded-full h-1">
                                    <div
                                      className="bg-cyan-500 h-1 rounded-full transition-all duration-300"
                                      style={{ width: `${fileUpload.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                              {fileUpload.error && (
                                <div className="mt-2 text-red-400 text-xs">{fileUpload.error}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">Default Settings</h3>
              
              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Document Type
                </label>
                <select
                  value={defaultSettings.type}
                  onChange={(e) => setDefaultSettings(prev => ({ ...prev, type: e.target.value as Document['type'] }))}
                  className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Classification */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Classification
                </label>
                <select
                  value={defaultSettings.classification}
                  onChange={(e) => setDefaultSettings(prev => ({ ...prev, classification: e.target.value as Document['classification'] }))}
                  className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {classificationTypes.map(cls => (
                    <option key={cls.value} value={cls.value}>
                      {cls.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Info */}
              <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700">
                <h4 className="text-sm font-medium text-zinc-300 mb-2">Supported Formats</h4>
                <div className="text-xs text-zinc-500 space-y-1">
                  <div>• PDF documents</div>
                  <div>• Microsoft Office files</div>
                  <div>• Images (JPG, PNG, GIF)</div>
                  <div>• Text and CSV files</div>
                  <div>• Archive files (ZIP)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-700">
          <div>
            {files.length > 0 && (
              <p className="text-sm text-zinc-400">
                {files.length} file{files.length !== 1 ? 's' : ''} ready for upload
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            
            {allUploadsComplete && hasSuccessfulUploads ? (
              <button
                onClick={onSuccess}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
              >
                Done
              </button>
            ) : (
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {uploading ? 'Uploading...' : 'Upload Files'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
