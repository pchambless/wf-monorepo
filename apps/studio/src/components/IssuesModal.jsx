import React, { useState, useEffect } from 'react';

const IssuesModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [labels, setLabels] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    selectedLabels: []
  });

  const [filters, setFilters] = useState({
    state: 'open',
    labelFilter: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadLabels();
      if (activeTab === 'view') {
        loadIssues();
      }
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (isOpen && activeTab === 'view') {
      loadIssues();
    }
  }, [filters.state, filters.labelFilter]);

  const loadLabels = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/github/labels', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setLabels(data.labels);
      }
    } catch (err) {
      console.error('Error loading labels:', err);
    }
  };

  const loadIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        state: filters.state,
        ...(filters.labelFilter && { labels: filters.labelFilter })
      });

      const response = await fetch(`http://localhost:3002/api/github/issues?${params}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setIssues(data.issues);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3002/api/github/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          body: formData.body,
          labels: formData.selectedLabels
        })
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ title: '', body: '', selectedLabels: [] });
        alert(`Issue #${data.issue.number} created successfully!`);
        setActiveTab('view');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLabel = (labelName) => {
    setFormData(prev => ({
      ...prev,
      selectedLabels: prev.selectedLabels.includes(labelName)
        ? prev.selectedLabels.filter(l => l !== labelName)
        : [...prev.selectedLabels, labelName]
    }));
  };

  const loadComments = async (issueNumber) => {
    setLoadingComments(true);
    try {
      const response = await fetch(`http://localhost:3002/api/github/issues/${issueNumber}/comments`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleIssue = async (issue) => {
    if (expandedIssue?.number === issue.number) {
      setExpandedIssue(null);
      setComments([]);
    } else {
      setExpandedIssue(issue);
      await loadComments(issue.number);
    }
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();

        const file = item.getAsFile();
        const reader = new FileReader();

        reader.onload = async (event) => {
          const base64Image = event.target.result;

          // Show uploading indicator
          const uploadingText = '\n\n*[Uploading image...]*\n\n';
          setFormData(prev => ({ ...prev, body: prev.body + uploadingText }));

          try {
            const response = await fetch('http://localhost:3002/api/github/upload-image', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                image: base64Image,
                filename: file.name || `screenshot-${Date.now()}.png`
              })
            });

            const data = await response.json();

            if (data.success) {
              // Replace uploading text with markdown
              setFormData(prev => ({
                ...prev,
                body: prev.body.replace(uploadingText, `\n\n${data.markdown}\n\n`)
              }));
            } else {
              setFormData(prev => ({
                ...prev,
                body: prev.body.replace(uploadingText, '\n\n*[Image upload failed]*\n\n')
              }));
              setError('Image upload failed: ' + data.message);
            }
          } catch (err) {
            setFormData(prev => ({
              ...prev,
              body: prev.body.replace(uploadingText, '\n\n*[Image upload error]*\n\n')
            }));
            setError('Image upload error: ' + err.message);
          }
        };

        reader.readAsDataURL(file);
        break;
      }
    }
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '8px',
      width: '95%',
      maxWidth: '1400px',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    },
    header: {
      padding: '20px',
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      margin: 0,
      fontSize: '24px',
      fontWeight: '600'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#666'
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #e0e0e0',
      padding: '0 20px'
    },
    tab: {
      padding: '12px 24px',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      color: '#666',
      borderBottom: '3px solid transparent',
      transition: 'all 0.2s'
    },
    activeTab: {
      color: '#2196F3',
      borderBottom: '3px solid #2196F3'
    },
    content: {
      padding: '20px',
      overflowY: 'auto',
      flex: 1
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    label: {
      fontWeight: '600',
      marginBottom: '4px',
      display: 'block'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      fontSize: '14px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      fontSize: '14px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      minHeight: '120px',
      resize: 'vertical',
      boxSizing: 'border-box',
      fontFamily: 'monospace'
    },
    labelGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '8px'
    },
    labelChip: {
      padding: '6px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      cursor: 'pointer',
      border: '2px solid',
      transition: 'all 0.2s',
      textAlign: 'center'
    },
    button: {
      padding: '10px 20px',
      fontSize: '16px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      backgroundColor: '#2196F3',
      color: 'white',
      transition: 'background-color 0.2s'
    },
    issueCard: {
      padding: '16px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      marginBottom: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    issueTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#333'
    },
    issueNumber: {
      color: '#666',
      fontSize: '14px'
    },
    issueLabels: {
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap',
      marginTop: '8px'
    },
    filters: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px'
    },
    select: {
      padding: '8px 12px',
      fontSize: '14px',
      border: '1px solid #ccc',
      borderRadius: '4px'
    },
    error: {
      padding: '12px',
      backgroundColor: '#ffebee',
      color: '#c62828',
      borderRadius: '4px',
      marginBottom: '16px'
    },
    issueBody: {
      marginTop: '12px',
      padding: '12px',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px',
      fontSize: '14px',
      whiteSpace: 'pre-wrap',
      color: '#333'
    },
    commentsSection: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #e0e0e0'
    },
    commentCard: {
      padding: '12px',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px',
      marginBottom: '12px'
    },
    commentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
      fontSize: '12px',
      color: '#666'
    },
    commentBody: {
      fontSize: '14px',
      whiteSpace: 'pre-wrap',
      color: '#333'
    },
    commentImage: {
      maxWidth: '100%',
      marginTop: '8px',
      borderRadius: '4px'
    },
    expandButton: {
      marginTop: '8px',
      padding: '4px 8px',
      fontSize: '12px',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    githubLink: {
      marginTop: '8px',
      fontSize: '12px',
      color: '#2196F3',
      textDecoration: 'none'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>GitHub Issues</h2>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'create' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('create')}
          >
            Create Issue
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'view' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('view')}
          >
            View Issues
          </button>
        </div>

        <div style={styles.content}>
          {error && <div style={styles.error}>{error}</div>}

          {activeTab === 'create' && (
            <form style={styles.form} onSubmit={handleSubmit}>
              <div>
                <label style={styles.label}>Title *</label>
                <input
                  style={styles.input}
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Description (Paste images directly!)</label>
                <textarea
                  style={styles.textarea}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  onPaste={handlePaste}
                  placeholder="Detailed description... Paste screenshots directly or use markdown: ![alt](url)"
                />
              </div>

              <div>
                <label style={styles.label}>Labels</label>
                <div style={styles.labelGrid}>
                  {labels.map(label => (
                    <div
                      key={label.name}
                      style={{
                        ...styles.labelChip,
                        backgroundColor: formData.selectedLabels.includes(label.name)
                          ? `#${label.color}`
                          : 'white',
                        borderColor: `#${label.color}`,
                        color: formData.selectedLabels.includes(label.name)
                          ? 'white'
                          : `#${label.color}`
                      }}
                      onClick={() => toggleLabel(label.name)}
                    >
                      {label.name}
                    </div>
                  ))}
                </div>
              </div>

              <button
                style={styles.button}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Issue'}
              </button>
            </form>
          )}

          {activeTab === 'view' && (
            <>
              <div style={styles.filters}>
                <select
                  style={styles.select}
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="all">All</option>
                </select>

                <select
                  style={styles.select}
                  value={filters.labelFilter}
                  onChange={(e) => setFilters({ ...filters, labelFilter: e.target.value })}
                >
                  <option value="">All Labels</option>
                  {labels.map(label => (
                    <option key={label.name} value={label.name}>
                      {label.name}
                    </option>
                  ))}
                </select>

                <button
                  style={{...styles.button, padding: '8px 16px'}}
                  onClick={loadIssues}
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <p>Loading issues...</p>
              ) : (
                <div>
                  {issues.map(issue => {
                    const isExpanded = expandedIssue?.number === issue.number;
                    return (
                      <div
                        key={issue.number}
                        style={{
                          ...styles.issueCard,
                          backgroundColor: isExpanded ? '#f8f9fa' : 'white'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#666', minWidth: '50px' }}>
                            #{issue.number}
                          </div>
                          <div style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: issue.state === 'open' ? '#28a745' : '#6f42c1',
                            color: 'white',
                            whiteSpace: 'nowrap',
                            textTransform: 'uppercase'
                          }}>
                            {issue.state}
                          </div>
                          <div style={{ flex: 1, fontSize: '16px', fontWeight: '600', color: '#333' }}>
                            {issue.title}
                          </div>
                          {issue.labels.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {issue.labels.map(label => (
                                <span
                                  key={label.name}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    backgroundColor: `#${label.color}`,
                                    color: 'white',
                                    whiteSpace: 'nowrap'
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {label.name}
                                </span>
                              ))}
                            </div>
                          )}
                          <div style={{ fontSize: '13px', color: '#666', whiteSpace: 'nowrap' }}>
                            {issue.user.login}
                          </div>
                          <div style={{ fontSize: '13px', color: '#666', whiteSpace: 'nowrap' }}>
                            {new Date(issue.created_at).toLocaleDateString()}
                          </div>
                          <button
                            style={{
                              ...styles.expandButton,
                              margin: 0,
                              padding: '4px 12px',
                              fontSize: '11px'
                            }}
                            onClick={(e) => { e.stopPropagation(); toggleIssue(issue); }}
                          >
                            {isExpanded ? '▼' : '▶'}
                          </button>
                          <a
                            href={issue.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              ...styles.expandButton,
                              textDecoration: 'none',
                              display: 'inline-block',
                              backgroundColor: '#2196F3',
                              color: 'white',
                              border: '1px solid #2196F3',
                              margin: 0,
                              padding: '4px 12px',
                              fontSize: '11px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            🔗
                          </a>
                        </div>

                        {isExpanded && (
                          <>
                            {issue.body && (
                              <div
                                style={styles.issueBody}
                                dangerouslySetInnerHTML={{
                                  __html: issue.body_html || issue.body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; margin-top: 8px; border-radius: 4px;" />').replace(/<img /g, '<img style="max-width: 100%; margin-top: 8px; border-radius: 4px;" ')
                                }}
                              />
                            )}

                            <a
                              href={issue.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={styles.githubLink}
                              onClick={(e) => e.stopPropagation()}
                            >
                              🔗 View on GitHub
                            </a>

                            {loadingComments ? (
                              <div style={styles.commentsSection}>
                                <p>Loading comments...</p>
                              </div>
                            ) : comments.length > 0 ? (
                              <div style={styles.commentsSection}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                                  Comments ({comments.length})
                                </h4>
                                {comments.map(comment => (
                                  <div key={comment.id} style={styles.commentCard}>
                                    <div style={styles.commentHeader}>
                                      <span><strong>{comment.user.login}</strong></span>
                                      <span>{new Date(comment.created_at).toLocaleString()}</span>
                                    </div>
                                    <div
                                      style={styles.commentBody}
                                      dangerouslySetInnerHTML={{
                                        __html: comment.body_html || comment.body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; margin-top: 8px; border-radius: 4px;" />')
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={styles.commentsSection}>
                                <p style={{ fontSize: '14px', color: '#666' }}>No comments yet</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                  {issues.length === 0 && <p>No issues found</p>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssuesModal;
