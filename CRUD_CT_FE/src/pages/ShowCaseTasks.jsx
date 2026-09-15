import { useState, useMemo, useEffect } from "react"
import { PRIORITY_META, STATUS_META } from "../data/dummyData"
import "./ShowCaseTasks.css"

/**
 * Formats a date string to a human-readable format
 */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    
  })
}

/**
 * ShowCaseTasks Page
 * Displays a list of case tasks in a rich, filterable table/card layout
 */
function ShowCaseTasks({ onNavigate }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [filterAssignedTo, setFilterAssignedTo] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')

  
  useEffect(() => {
    fetch("/api/v1/casetasks")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch tasks")
        return res.json()
      })
      .then(data => {
        setTasks(data.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter(task => {
      const matchAssignedTo = filterAssignedTo ? task.assignedTo === filterAssignedTo : true
      const taskPriority = task.priority ? task.priority.toUpperCase() : ''
      const matchPriority = filterPriority ? taskPriority === filterPriority : true
      const matchStatus = filterStatus ? task.status === filterStatus : true
      return matchAssignedTo && matchPriority && matchStatus
    })

    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdDate || 0).getTime()
      const dateB = new Date(b.createdDate || 0).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })
  }, [tasks, filterAssignedTo, filterPriority, filterStatus, sortOrder])

  const uniqueAssignees = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.assignedTo))).filter(Boolean)
  }, [tasks])

  return (
    <main className="showcase-tasks" id="showcase-tasks">
      {/* ── Page Header ── */}
      <section className="showcase-tasks__header section">
        <div className="container">
          <div className="badge badge-primary showcase-tasks__badge">
            <span aria-hidden="true">📋</span>
            Case Management
          </div>
          <h1 className="showcase-tasks__title">
            Case <span className="text-gradient">Tasks</span>
          </h1>
          <p className="showcase-tasks__subtitle">
            A centralized view of all active, pending, and completed case tasks across your team.
          </p>

          {/* Summary Stats */}
          <div className="showcase-tasks__stats" role="list" aria-label="Task summary">
            {[
              { value: tasks.length,                                            label: 'Total Tasks' },
              { value: tasks.filter(t => t.status === 'pending' || t.status === 'open').length,        label: 'Open' },
              { value: tasks.filter(t => t.status === 'in-progress').length,    label: 'In Progress' },
            ].map((stat) => (
              <div key={stat.label} className="showcase-tasks__stat glass-card" role="listitem">
                <span className="showcase-tasks__stat-value">{stat.value}</span>
                <span className="showcase-tasks__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tasks List ── */}
      <section className="showcase-tasks__list-section section" aria-labelledby="tasks-list-heading">
        <div className="container">
          <div className="showcase-tasks__list-header">
            <h2 id="tasks-list-heading" className="showcase-tasks__list-title">
              All Tasks
            </h2>
            <span className="showcase-tasks__list-count">
              {filteredTasks.length} tasks
            </span>
          </div>

          {/* Filters */}
          <div className="showcase-tasks__filters" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <select
              className="form-input form-select"
              style={{ maxWidth: '200px' }}
              value={filterAssignedTo}
              onChange={(e) => setFilterAssignedTo(e.target.value)}
              aria-label="Filter by assigned to"
            >
              <option value="">Assignees</option>
              {uniqueAssignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>

            <select
              className="form-input form-select"
              style={{ maxWidth: '200px' }}
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              aria-label="Filter by priority"
            >
              <option value="">Priorities</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="P4">P4</option>
            </select>

            <select
              className="form-input form-select"
              style={{ maxWidth: '200px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              className="form-input form-select"
              style={{ maxWidth: '200px' }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              aria-label="Sort by date"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* Task Cards */}
          <div className="task-list" role="list" aria-label="Case task list">
            {filteredTasks.map((task, i) => {
              const priority = PRIORITY_META[task.priority?.toUpperCase()] || { label: task.priority, icon: '⚪', className: 'priority--low' }
              const status   = STATUS_META[task.status?.toLowerCase()] || { label: task.status, className: 'status--pending' }

              return (
                <article
                  key={task.id}
                  className="task-card glass-card"
                  style={{ animationDelay: `${i * 0.07}s`, cursor: 'pointer' }}
                  onClick={() => onNavigate && onNavigate('view-task', { id: task.id })}
                  role="listitem"
                  aria-label={`Task ${task.id}: ${task.title || task.issueSummary}`}
                >
                  {/* Card Top Row */}
                  <div className="task-card__top">
                    <div className="task-card__ids">
                      <span className="task-card__id">{task.number}</span>
                    </div>
                    <div className="task-card__badges">
                      <span className={`task-badge priority-badge ${priority.className}`} aria-label={`Priority: ${priority.label}`}>
                        <span aria-hidden="true">{priority.icon}</span>
                        {priority.label}
                      </span>
                      <span className={`task-badge status-badge ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="task-card__title">{task.title || task.issue_summary}</h3>

                  {/* Meta Row */}
                  <div className="task-card__meta">
                    <div className="task-card__meta-item">
                      <span className="task-card__meta-icon" aria-hidden="true">👤</span>
                      <span className="task-card__meta-label">Assigned to</span>
                      <span className="task-card__meta-value">{task.assigned_to || 'Unassigned'}</span>
                    </div>
                    {task.created_date && (
                      <div className="task-card__meta-item">
                        <span className="task-card__meta-icon" aria-hidden="true">📅</span>
                        <span className="task-card__meta-label">Created on</span>
                        <span className="task-card__meta-value">{formatDate(task.created_date)}</span>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}

export default ShowCaseTasks
