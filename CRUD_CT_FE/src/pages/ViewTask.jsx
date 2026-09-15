import { useState, useEffect } from 'react'
import './ReportIssue.css' // Reuse form styles

function ViewTask({ taskId, onNavigate }) {
  const currentUser = 'wamika' // Mock current logged in user
  const [form, setForm] = useState(null)
  const [similarTasks, setSimilarTasks] = useState([])
  const [newWorkNote, setNewWorkNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    setLoading(true)
    fetch(`/api/v1/casetasks/${taskId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch task")
        return res.json()
      })
      .then(data => {
        // Handle both possible API response structures
        const taskData = data.data || data
        setForm({ ...taskData })
        
        // Fetch similar tasks using the number
        if (taskData.number) {
          fetch(`/api/v1/casetasks/${taskData.number}/similar`)
            .then(res => res.json())
            .then(simData => {
              if (simData.similarRecords) {
                setSimilarTasks(simData.similarRecords)
              }
            })
            .catch(err => console.error("Failed to fetch similar tasks:", err))
        }
        
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError(err.message)
        setLoading(false)
      })
  }, [taskId])

  if (!form) return <div className="container">Loading...</div>

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // If there is an unsaved worknote in the textarea, let's append it before saving (optional, but good UX)
    let finalForm = { ...form }
    
    // Crucial: Delete any legacy camelCase workNotesList so the backend doesn't mistakenly use it for appending
    delete finalForm.workNotesList

    if (newWorkNote.trim()) {
      const note = { note: newWorkNote.trim(), date: new Date().toLocaleDateString('en-CA'), author: currentUser }
      finalForm.work_notes_list = [note] // Backend appends incoming list to existing list
      setNewWorkNote('')
      setForm(prev => ({
        ...prev,
        ...finalForm,
        work_notes_list: [...(prev.work_notes_list || []), note]
      }))
    } else {
      delete finalForm.work_notes_list // Don't send anything if no new note, backend preserves existing
    }

    try {
      const response = await fetch(`/api/v1/casetasks/${finalForm.id || finalForm.number}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalForm)
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      alert('Task updated successfully')
      onNavigate('showcase-tasks')
    } catch (error) {
      console.error(error)
      alert('Error updating task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="report-page" id="view-task">
      <div className="container container--narrow">
        <header className="report-page__header">
          <button className="btn btn-secondary" onClick={() => onNavigate('showcase-tasks')} style={{marginBottom: '1rem'}}>
            ← Back to List
          </button>
          <div className="badge badge-primary">
            <span aria-hidden="true">📋</span> View Case Task
          </div>
          <h1 className="report-page__title">
            Task <span className="text-gradient">{form.number || form.taskNumber}</span>
          </h1>
        </header>

        {/* Similar Tasks Section */}
        {similarTasks && similarTasks.length > 0 && (
          <div className="similar-tasks-section" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Similar Case Tasks</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {similarTasks.map(task => (
                <div 
                  key={task.id} 
                  className="glass-card" 
                  style={{ 
                    padding: '0.6rem 1.2rem', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: '600',
                    color: 'var(--primary-color)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onClick={() => onNavigate('view-task', { id: task.id })}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
                  title={task.issue_summary}
                >
                  {task.number}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-card glass-card">
          <form className="issue-form" onSubmit={handleSubmit}>
            
            {/* Task Number (readonly) */}
            <div className="form-group form-group--valid">
              <label className="form-label">Number</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">🔢</span>
                <input type="text" className="form-input" value={form.number || form.task_number} readOnly />
              </div>
            </div>

            {/* Issue Summary */}
            <div className="form-group">
              <label className="form-label">Issue Summary</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">📝</span>
                <input 
                  name="issue_summary"
                  type="text" 
                  className="form-input" 
                  value={form.issue_summary || ''} 
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">🔖</span>
                <select name="status" className="form-input form-select" value={form.status} onChange={handleChange}>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">🚦</span>
                <select name="priority" className="form-input form-select" value={form.priority} onChange={handleChange}>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                  <option value="P4">P4</option>
                </select>
              </div>
            </div>

            {/* Assigned To */}
            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">👤</span>
                <select name="assigned_to" className="form-input form-select" value={form.assigned_to || ''} onChange={handleChange}>
                  <option value="wamika">wamika</option>
                  <option value="manoj">manoj</option>
                  <option value="wasim">wasim</option>
                  <option value="rahul">rahul</option>
                </select>
              </div>
            </div>

            {/* Created By */}
            <div className="form-group">
              <label className="form-label">Created By</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">✍️</span>
                <input type="text" className="form-input" value={form.created_by || 'Unknown'} readOnly />
              </div>
            </div>

            {/* Created Date */}
            {form.createdDate && (
              <div className="form-group">
                <label className="form-label">Created Date</label>
                <div className="form-input-wrapper">
                  <span className="form-input-icon">📅</span>
                  <input type="text" className="form-input" value={new Date(form.created_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} readOnly />
                </div>
              </div>
            )}

            {/* Issue Description */}
            <div className="form-group">
              <label className="form-label">Issue Description</label>
              <textarea 
                name="issue_description"
                className="form-textarea" 
                rows="4" 
                value={form.issue_description || ''}
                onChange={handleChange}
              />
            </div>

            {/* Release */}
            <div className="form-group">
              <label className="form-label">Release Version</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">🏷️</span>
                <input 
                  name="release_version"
                  type="text" 
                  className="form-input" 
                  value={form.release_version || ''} 
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Steps To Replicate */}
            <div className="form-group">
              <label className="form-label">Steps To Replicate</label>
              <textarea 
                name="steps_to_reproduce"
                className="form-textarea" 
                rows="4" 
                value={form.steps_to_reproduce || ''}
                onChange={handleChange}
              />
            </div>

            {/* Work Notes History */}
            <div className="form-group">
              <label className="form-label">Work Notes Log</label>
              <div className="work-notes-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {form.work_notes_list && form.work_notes_list.length > 0 ? (
                  form.work_notes_list.map((note, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: '1rem', fontSize: '0.9rem' }}>
                      <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>
                        {note.author ? `${note.author} - ` : ''}{note.date}
                      </p>
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{note.note || note.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="form-hint">No work notes yet.</p>
                )}
              </div>
            </div>

            {/* Add New Work Note */}
            <div className="form-group">
              <label className="form-label">Add Work Note</label>
              <textarea 
                className="form-textarea" 
                rows="3" 
                placeholder="Type your new work note here..."
                value={newWorkNote}
                onChange={(e) => setNewWorkNote(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="form-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => onNavigate('showcase-tasks')}>
                ← Back to List
              </button>
              <button type="submit" className={`btn btn-primary btn-lg ${loading ? 'btn--loading' : ''}`} disabled={loading}>
                {loading ? 'Updating...' : 'Update Task'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  )
}

export default ViewTask
