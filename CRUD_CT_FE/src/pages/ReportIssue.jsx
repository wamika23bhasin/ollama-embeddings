import { useState } from 'react'
import './ReportIssue.css'

const getInitialForm = () => ({
  taskNumber: `CSTSK${Math.floor(1000 + Math.random() * 9000)}`,
  issueSummary: '',
  issueDescription: '',
  release: '',
  stepsToReplicate: '',
  status: 'open',
  priority: '',
  assignedTo: '',
  createdBy: '',
})

const INITIAL_ERRORS = {
  taskNumber: '',
  issueSummary: '',
  issueDescription: '',
  release: '',
  stepsToReplicate: '',
  status: '',
  priority: '',
  assignedTo: '',
  createdBy: '',
}

/**
 * ReportIssue Page
 * Form for reporting bugs/issues with validation and animated feedback
 */
function ReportIssue() {
  const [form, setForm] = useState(getInitialForm)
  const [errors, setErrors] = useState(INITIAL_ERRORS)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  // ── Validation ──
  const validate = (fields) => {
    const errs = { ...INITIAL_ERRORS }

    if (!fields.taskNumber) {
      errs.taskNumber = 'Task number is required.'
    }

    if (!fields.issueSummary.trim()) {
      errs.issueSummary = 'Issue summary is required.'
    } else if (fields.issueSummary.trim().length < 10) {
      errs.issueSummary = 'Summary must be at least 10 characters.'
    } else if (fields.issueSummary.trim().length > 150) {
      errs.issueSummary = 'Summary must be under 150 characters.'
    }

    if (!fields.issueDescription.trim()) {
      errs.issueDescription = 'Issue description is required.'
    } else if (fields.issueDescription.trim().length < 20) {
      errs.issueDescription = 'Description must be at least 20 characters.'
    }

    if (!fields.release) {
      errs.release = 'Please select the release version.'
    }

    if (!fields.stepsToReplicate.trim()) {
      errs.stepsToReplicate = 'Steps to replicate are required.'
    } else if (fields.stepsToReplicate.trim().length < 10) {
      errs.stepsToReplicate = 'Please provide more detail on the steps.'
    }

    if (!fields.status) {
      errs.status = 'Please select a status.'
    }

    if (!fields.priority) {
      errs.priority = 'Please select a priority.'
    }

    return errs
  }

  const isFormValid = (errs) => Object.values(errs).every((e) => e === '')

  // ── Handlers ──
  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedForm = { ...form, [name]: value }
    setForm(updatedForm)

    // Live validation if field has been touched
    if (touched[name]) {
      setErrors(validate(updatedForm))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors(validate(form))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({
      taskNumber: true,
      issueSummary: true,
      issueDescription: true,
      release: true,
      stepsToReplicate: true,
      status: true,
      priority: true,
      assignedTo: true,
      createdBy: true,
    })

    const validationErrors = validate(form)
    setErrors(validationErrors)

    if (!isFormValid(validationErrors)) return

    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/casetasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: form.taskNumber,
          issueSummary: form.issueSummary,
          issueDescription: form.issueDescription,
          releaseVersion: form.release,
          stepsToReproduce: form.stepsToReplicate,
          status: form.status,
          priority: form.priority.toLowerCase(),
          assignedTo: form.assignedTo,
          createdBy: form.createdBy,
          createdDate: new Date().toISOString(),
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit issue')
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting issue:', error)
      alert('Failed to submit issue. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm(getInitialForm())
    setErrors(INITIAL_ERRORS)
    setTouched({})
    setSubmitted(false)
  }

  const charCount = form.issueSummary.length

  // ── Success State ──
  if (submitted) {
    return (
      <main className="report-page" id="report-issue">
        <div className="container container--narrow">
          <div className="success-card glass-card">
            <div className="success-card__icon" aria-hidden="true">✅</div>
            <h2 className="success-card__title">Issue Reported!</h2>
            <p className="success-card__message">
              Thank you for submitting your report. Our team will review{' '}
              <strong>"{form.issueSummary}"</strong> and get back to you shortly.
            </p>
            <div className="success-card__meta">
              <span className="success-meta-item">
                <span aria-hidden="true">🏷️</span> {form.release}
              </span>
            </div>
            <button
              id="report-another-btn"
              className="btn btn-primary btn-lg"
              onClick={handleReset}
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ── Form ──
  return (
    <main className="report-page" id="report-issue">
      <div className="container container--narrow">

        {/* Page Header */}
        <header className="report-page__header">
          <div className="badge badge-primary">
            <span aria-hidden="true">🐛</span> Bug Tracker
          </div>
          <h1 className="report-page__title">
            Report an <span className="text-gradient">Issue</span>
          </h1>
          <p className="report-page__subtitle">
            Found a bug? Help us improve by describing what went wrong and how to reproduce it.
          </p>
        </header>

        {/* Form Card */}
        <div className="form-card glass-card">
          <form
            id="issue-report-form"
            className="issue-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Issue report form"
          >

            {/* ── Task Number ── */}
            <div className={`form-group ${touched.taskNumber && errors.taskNumber ? 'form-group--error' : touched.taskNumber && !errors.taskNumber ? 'form-group--valid' : ''}`}>
              <label className="form-label" htmlFor="taskNumber">
                Number
                <span className="form-label__required" aria-hidden="true">*</span>
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon" aria-hidden="true">🔢</span>
                <input
                  id="taskNumber"
                  name="taskNumber"
                  type="text"
                  className="form-input"
                  value={form.taskNumber}
                  readOnly
                  aria-required="true"
                  aria-describedby="taskNumber-error taskNumber-hint"
                  aria-invalid={!!(touched.taskNumber && errors.taskNumber)}
                />
                {touched.taskNumber && !errors.taskNumber && (
                  <span className="form-input-check" aria-hidden="true">✓</span>
                )}
              </div>
              <div className="form-row-meta">
                {touched.taskNumber && errors.taskNumber ? (
                  <p id="taskNumber-error" className="form-error" role="alert">
                    <span aria-hidden="true">⚠ </span>{errors.taskNumber}
                  </p>
                ) : (
                  <p id="taskNumber-hint" className="form-hint">
                    Auto-generated unique task number
                  </p>
                )}
              </div>
            </div>

            {/* ── Issue Summary ── */}
            <div className={`form-group ${touched.issueSummary && errors.issueSummary ? 'form-group--error' : touched.issueSummary && !errors.issueSummary ? 'form-group--valid' : ''}`}>
              <label className="form-label" htmlFor="issueSummary">
                Issue Summary
                <span className="form-label__required" aria-hidden="true">*</span>
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon" aria-hidden="true">📝</span>
                <input
                  id="issueSummary"
                  name="issueSummary"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Login button unresponsive on mobile Safari"
                  value={form.issueSummary}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={150}
                  autoComplete="off"
                  aria-required="true"
                  aria-describedby="issueSummary-error issueSummary-hint"
                  aria-invalid={!!(touched.issueSummary && errors.issueSummary)}
                />
                {touched.issueSummary && !errors.issueSummary && (
                  <span className="form-input-check" aria-hidden="true">✓</span>
                )}
              </div>
              <div className="form-row-meta">
                {touched.issueSummary && errors.issueSummary ? (
                  <p id="issueSummary-error" className="form-error" role="alert">
                    <span aria-hidden="true">⚠ </span>{errors.issueSummary}
                  </p>
                ) : (
                  <p id="issueSummary-hint" className="form-hint">
                    A short, descriptive title (10–150 characters)
                  </p>
                )}
                <span className={`form-char-count ${charCount > 130 ? 'form-char-count--warn' : ''}`}>
                  {charCount}/150
                </span>
              </div>
            </div>

            {/* ── Status ── */}
            <div className={`form-group ${touched.status && errors.status ? 'form-group--error' : touched.status && !errors.status ? 'form-group--valid' : ''}`}>
              <label className="form-label" htmlFor="status">
                Status
                <span className="form-label__required" aria-hidden="true">*</span>
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon" aria-hidden="true">🔖</span>
                <select
                  id="status"
                  name="status"
                  className="form-input form-select"
                  value={form.status}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-required="true"
                  aria-describedby="status-error status-hint"
                  aria-invalid={!!(touched.status && errors.status)}
                >
                  <option value="">— Select a status —</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
                {touched.status && !errors.status && (
                  <span className="form-input-check" aria-hidden="true">✓</span>
                )}
              </div>
              {touched.status && errors.status ? (
                <p id="status-error" className="form-error" role="alert">
                  <span aria-hidden="true">⚠ </span>{errors.status}
                </p>
              ) : (
                <p id="status-hint" className="form-hint">
                  Select the current status of this case task
                </p>
              )}
            </div>

            {/* ── Priority ── */}
            <div className={`form-group ${touched.priority && errors.priority ? 'form-group--error' : touched.priority && !errors.priority ? 'form-group--valid' : ''}`}>
              <label className="form-label" htmlFor="priority">
                Priority
                <span className="form-label__required" aria-hidden="true">*</span>
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon" aria-hidden="true">🚦</span>
                <select
                  id="priority"
                  name="priority"
                  className="form-input form-select"
                  value={form.priority}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-required="true"
                  aria-describedby="priority-error priority-hint"
                  aria-invalid={!!(touched.priority && errors.priority)}
                >
                  <option value="">— Select a priority —</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                  <option value="P4">P4</option>
                </select>
                {touched.priority && !errors.priority && (
                  <span className="form-input-check" aria-hidden="true">✓</span>
                )}
              </div>
              {touched.priority && errors.priority ? (
                <p id="priority-error" className="form-error" role="alert">
                  <span aria-hidden="true">⚠ </span>{errors.priority}
                </p>
              ) : (
                <p id="priority-hint" className="form-hint">
                  P1 = Critical, P2 = High, P3 = Medium, P4 = Low
                </p>
              )}
            </div>

            {/* ── Assigned To ── */}
            <div className={`form-group ${touched.assignedTo && errors.assignedTo ? 'form-group--error' : touched.assignedTo && !errors.assignedTo ? 'form-group--valid' : ''}`}>
              <label className="form-label" htmlFor="assignedTo">
                Assigned To (Optional)
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon" aria-hidden="true">👤</span>
                <select
                  id="assignedTo"
                  name="assignedTo"
                  className="form-input form-select"
                  value={form.assignedTo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-describedby="assignedTo-error assignedTo-hint"
                  aria-invalid={!!(touched.assignedTo && errors.assignedTo)}
                >
                  <option value="">— Select assigned to —</option>
                  <option value="wamika">wamika</option>
                  <option value="manoj">manoj</option>
                  <option value="wasim">wasim</option>
                  <option value="rahul">rahul</option>
                </select>
                {touched.assignedTo && !errors.assignedTo && (
                  <span className="form-input-check" aria-hidden="true">✓</span>
                )}
              </div>
              {touched.assignedTo && errors.assignedTo ? (
                <p id="assignedTo-error" className="form-error" role="alert">
                  <span aria-hidden="true">⚠ </span>{errors.assignedTo}
                </p>
              ) : (
                <p id="assignedTo-hint" className="form-hint">
                  Select the person assigned to this issue
                </p>
              )}
            </div>

            {/* ── Created By ── */}
            <div className={`form-group ${touched.createdBy && errors.createdBy ? 'form-group--error' : touched.createdBy && !errors.createdBy ? 'form-group--valid' : ''}`}>
              <label className="form-label" htmlFor="createdBy">
                Created By (Optional)
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon" aria-hidden="true">✍️</span>
                <select
                  id="createdBy"
                  name="createdBy"
                  className="form-input form-select"
                  value={form.createdBy}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-describedby="createdBy-error createdBy-hint"
                  aria-invalid={!!(touched.createdBy && errors.createdBy)}
                >
                  <option value="">— Select creator —</option>
                  <option value="wamika">wamika</option>
                  <option value="manoj">manoj</option>
                  <option value="wasim">wasim</option>
                  <option value="rahul">rahul</option>
                </select>
                {touched.createdBy && !errors.createdBy && (
                  <span className="form-input-check" aria-hidden="true">✓</span>
                )}
              </div>
              {touched.createdBy && errors.createdBy ? (
                <p id="createdBy-error" className="form-error" role="alert">
                  <span aria-hidden="true">⚠ </span>{errors.createdBy}
                </p>
              ) : (
                <p id="createdBy-hint" className="form-hint">
                  Select the person creating this issue
                </p>
              )}
            </div>

            {/* ── Issue Description ── */}
            <div className={`form-group ${touched.issueDescription && errors.issueDescription ? 'form-group--error' : touched.issueDescription && !errors.issueDescription ? 'form-group--valid' : ''}`}>
              <label className="form-label" htmlFor="issueDescription">
                Issue Description
                <span className="form-label__required" aria-hidden="true">*</span>
              </label>
              <textarea
                id="issueDescription"
                name="issueDescription"
                className="form-textarea"
                placeholder="Describe the issue in detail. Include what you expected vs. what actually happened, any error messages, browser/OS details, etc."
                value={form.issueDescription}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={5}
                aria-required="true"
                aria-describedby="issueDescription-error issueDescription-hint"
                aria-invalid={!!(touched.issueDescription && errors.issueDescription)}
              />
              {touched.issueDescription && errors.issueDescription ? (
                <p id="issueDescription-error" className="form-error" role="alert">
                  <span aria-hidden="true">⚠ </span>{errors.issueDescription}
                </p>
              ) : (
                <p id="issueDescription-hint" className="form-hint">
                  Include expected vs. actual behavior, error messages, and environment details
                </p>
              )}
            </div>

            {/* ── Release Version ── */}
            <div className={`form-group ${touched.release && errors.release ? 'form-group--error' : touched.release && !errors.release ? 'form-group--valid' : ''}`}>
              <label className="form-label" htmlFor="release">
                Release Version
                <span className="form-label__required" aria-hidden="true">*</span>
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon" aria-hidden="true">🏷️</span>
                <input
                  id="release"
                  name="release"
                  type="text"
                  className="form-input"
                  placeholder="e.g. v2.1.0, v3.0.0-beta, 2024.09"
                  value={form.release}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="off"
                  aria-required="true"
                  aria-describedby="release-error release-hint"
                  aria-invalid={!!(touched.release && errors.release)}
                />
                {touched.release && !errors.release && (
                  <span className="form-input-check" aria-hidden="true">✓</span>
                )}
              </div>
              {touched.release && errors.release ? (
                <p id="release-error" className="form-error" role="alert">
                  <span aria-hidden="true">⚠ </span>{errors.release}
                </p>
              ) : (
                <p id="release-hint" className="form-hint">
                  Enter the app version where this issue occurs (e.g. v2.1.0)
                </p>
              )}
            </div>

            {/* ── Steps To Replicate ── */}
            <div className={`form-group ${touched.stepsToReplicate && errors.stepsToReplicate ? 'form-group--error' : touched.stepsToReplicate && !errors.stepsToReplicate ? 'form-group--valid' : ''}`}>
              <label className="form-label" htmlFor="stepsToReplicate">
                Steps To Replicate
                <span className="form-label__required" aria-hidden="true">*</span>
              </label>
              <textarea
                id="stepsToReplicate"
                name="stepsToReplicate"
                className="form-textarea"
                placeholder={`1. Open the app and navigate to Settings\n2. Click on "Profile" section\n3. Attempt to upload a profile photo\n4. Observe the error message displayed`}
                value={form.stepsToReplicate}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={6}
                aria-required="true"
                aria-describedby="stepsToReplicate-error stepsToReplicate-hint"
                aria-invalid={!!(touched.stepsToReplicate && errors.stepsToReplicate)}
              />
              {touched.stepsToReplicate && errors.stepsToReplicate ? (
                <p id="stepsToReplicate-error" className="form-error" role="alert">
                  <span aria-hidden="true">⚠ </span>{errors.stepsToReplicate}
                </p>
              ) : (
                <p id="stepsToReplicate-hint" className="form-hint">
                  Number each step clearly so the team can reproduce the issue exactly
                </p>
              )}
            </div>

            {/* ── Actions ── */}
            <div className="form-actions">
              <button
                type="button"
                id="reset-form-btn"
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={loading}
              >
                Clear Form
              </button>
              <button
                type="submit"
                id="submit-issue-btn"
                className={`btn btn-primary btn-lg ${loading ? 'btn--loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">🚀</span>
                    Submit Issue Report
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Required note */}
        <p className="report-page__note">
          Fields marked with <span aria-hidden="true">*</span><span className="sr-only">an asterisk</span> are required.
        </p>

      </div>
    </main>
  )
}

export default ReportIssue
