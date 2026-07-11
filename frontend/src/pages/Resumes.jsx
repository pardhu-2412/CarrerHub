import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const Resumes = () => {
  const { API_URL } = useAuth();
  const { addToast } = useToast();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [isDefault, setIsDefault] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Custom delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);

  const fetchResumes = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await axios.get(`${API_URL}/resumes`);
      setResumes(res.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch uploaded resumes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    // Validate type (PDF, DOCX, DOC)
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileName = selectedFile.name.toLowerCase();
    const matchesExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    const matchesMime = allowedTypes.includes(selectedFile.type);

    if (!matchesExtension && !matchesMime) {
      addToast('Invalid file type. Only PDF, DOC, and DOCX files are allowed.', 'error');
      setFile(null);
      return;
    }

    // Validate size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      addToast('File size exceeds the 5MB limit.', 'error');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      addToast('Please select or drop a file to upload.', 'warning');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isDefault', isDefault);

    try {
      await axios.post(`${API_URL}/resumes/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      addToast('Resume document uploaded successfully!', 'success');
      setFile(null);
      // Reset input element
      const fileInput = document.getElementById('resume-file-input');
      if (fileInput) fileInput.value = '';
      setIsDefault(false);
      fetchResumes(true);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data || 'Failed to upload resume document.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await axios.put(`${API_URL}/resumes/${id}/default`);
      addToast('Default resume updated successfully!', 'success');
      fetchResumes(true);
    } catch (err) {
      console.error(err);
      addToast('Failed to set default resume.', 'error');
    }
  };

  const openDeleteModal = (resume) => {
    setResumeToDelete(resume);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!resumeToDelete) return;
    try {
      await axios.delete(`${API_URL}/resumes/${resumeToDelete.id}`);
      addToast('Resume document deleted successfully.', 'info');
      setShowDeleteModal(false);
      setResumeToDelete(null);
      fetchResumes(true);
    } catch (err) {
      console.error(err);
      addToast('Failed to delete resume.', 'error');
    }
  };

  const handleDownload = async (id, fileName, fileType) => {
    try {
      const response = await axios.get(`${API_URL}/resumes/${id}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: fileType });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      addToast('Downloading resume...', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to download resume file.', 'error');
    }
  };

  // Human readable file size formatter
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="page-title">Resume Manager</h1>
        <p className="page-subtitle">Upload and map multiple versions of your resume to targeting recruitment roles.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Resumes List */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '1.15rem' }}>My Resumes</h3>

          {loading ? (
            <ListSkeleton count={3} />
          ) : resumes.length > 0 ? (
            <div className="resume-list" style={{ margin: 0 }}>
              {resumes.map(r => (
                <div key={r.id} className="resume-item">
                  <div className="resume-info" style={{ overflow: 'hidden' }}>
                    <span className="resume-icon">📄</span>
                    <div className="resume-meta" style={{ overflow: 'hidden' }}>
                      <span className="resume-name" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }} title={r.fileName}>
                          {r.fileName}
                        </span>
                        {r.default && <span className="badge-default">DEFAULT</span>}
                      </span>
                      <span className="resume-date">
                        Uploaded {new Date(r.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                    <button 
                      onClick={() => handleDownload(r.id, r.fileName, r.fileType)} 
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                      title="Download file"
                    >
                      📥 Download
                    </button>

                    {!r.default && (
                      <button 
                        onClick={() => handleSetDefault(r.id)} 
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Set Default
                      </button>
                    )}

                    <button 
                      onClick={() => openDeleteModal(r)} 
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                      title="Delete Resume"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon="📄"
              title="No resumes uploaded"
              description="Upload your placement resume on the right panel to map it to applications."
            />
          )}
        </div>

        {/* Upload Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '1.15rem' }}>Upload Resume</h3>

          <form onSubmit={handleUpload}>
            <div 
              className={`drag-drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                background: dragActive ? 'var(--color-primary-glow)' : 'transparent',
                borderColor: dragActive ? 'var(--color-primary)' : 'var(--border-color)',
                marginBottom: '1.5rem',
                position: 'relative'
              }}
              onClick={() => document.getElementById('resume-file-input').click()}
            >
              <input
                id="resume-file-input"
                type="file"
                style={{ display: 'none' }}
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
              />
              
              <div className="upload-prompt-icon" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                {file ? '✅' : '📤'}
              </div>
              
              {file ? (
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Ready for upload ({formatBytes(file.size)})
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    Drag & drop your file here
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    or click to browse from explorer (.pdf, .docx up to 5MB)
                  </div>
                </div>
              )}
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="checkbox"
                id="is-default-checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="is-default-checkbox" style={{ fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}>
                Set as default resume
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={uploading}>
              {uploading ? 'Uploading document...' : 'Upload Selected Document'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-primary-glow)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            <strong>💡 Discovery board mapping:</strong> CareerHub auto-attaches your <em>default</em> resume to any new jobs you apply for on the Discovery board.
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Delete Resume</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to delete the resume <strong>{resumeToDelete?.fileName}</strong>? Any linked job applications will lose this resume attachment.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1.5, background: 'var(--color-danger)', boxShadow: 'none' }} onClick={handleDelete}>Delete Document</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resumes;
