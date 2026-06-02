import { useState, useEffect, useCallback } from 'react'
import {
  Header, Form, Button, Message, Tab, Table, Image, Modal,
  Segment, Checkbox, Loader, Confirm, Label
} from 'semantic-ui-react'
import adminAPI, { isAuthed, setToken, clearToken } from '../utils/adminAPI'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const errMessage = (error, fallback) => {
  const data = error?.response?.data
  if (data?.messages) return data.messages.join(', ')
  return data?.message || fallback
}

// ---------- Login gate ----------
const LoginGate = ({ onLogin }) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await adminAPI.login(password)
      setToken(res.data.token)
      onLogin()
    } catch (err) {
      setError(errMessage(err, 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Segment style={{ maxWidth: 400, margin: '40px auto' }}>
      <Header as='h2'>Admin Login</Header>
      <Form onSubmit={submit} error={Boolean(error)}>
        <Form.Field>
          <label>Password</label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </Form.Field>
        <Message error content={error} />
        <Button primary type='submit' loading={loading} disabled={loading || !password}>
          Log in
        </Button>
      </Form>
    </Segment>
  )
}

// ---------- Artwork form (used for add + edit) ----------
const emptyArt = {
  title: '', author: 'Sandy Calhoun', year: '', media: '',
  height: '', length: '', width: '', price: '', wallPiece: false,
}

const artToForm = (art) => ({
  _id: art._id,
  title: art.title || '',
  author: art.author || '',
  year: art.year ?? '',
  media: Array.isArray(art.media) ? art.media.join(', ') : (art.media || ''),
  height: art.size?.height ?? '',
  length: art.size?.length ?? '',
  width: art.size?.width ?? '',
  price: art.price ?? '',
  wallPiece: Boolean(art.wallPiece),
})

const ArtworkForm = ({ initial, isEdit, onSaved }) => {
  const [form, setForm] = useState(initial || emptyArt)
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const setField = (key) => (e, data) => {
    const value = data?.type === 'checkbox' ? data.checked : (data ? data.value : e.target.value)
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (f && !ACCEPTED_TYPES.includes(f.type)) {
      setError(`Unsupported file type: ${f.type}. Use JPG, PNG, GIF, or WEBP.`)
      setFile(null)
      return
    }
    setError('')
    setFile(f || null)
  }

  const buildPayload = (imageUrl) => {
    const payload = {
      title: form.title,
      author: form.author,
      year: form.year,
      media: form.media,
      size: { height: form.height, length: form.length, width: form.width },
      wallPiece: form.wallPiece,
    }
    if (form.price !== '') payload.price = form.price
    if (imageUrl) payload.imageUrl = imageUrl
    return payload
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('')
    setSaving(true)
    try {
      let imageUrl
      if (file) {
        setStatus('Requesting upload URL...')
        const { data } = await adminAPI.getUploadUrl(form.title, file.type)
        setStatus('Uploading image to S3...')
        await adminAPI.uploadToS3(data.uploadUrl, file)
        imageUrl = data.imageUrl
      }

      if (!isEdit && !imageUrl) {
        setError('An image file is required for a new artwork.')
        setSaving(false)
        return
      }

      setStatus('Saving artwork...')
      if (isEdit) {
        await adminAPI.updateArt(initial._id, buildPayload(imageUrl))
      } else {
        await adminAPI.createArt(buildPayload(imageUrl))
      }
      setStatus('Saved.')
      if (!isEdit) {
        setForm(emptyArt)
        setFile(null)
      }
      onSaved?.()
    } catch (err) {
      setError(errMessage(err, 'Failed to save artwork'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form onSubmit={submit} error={Boolean(error)}>
      <Form.Group widths='equal'>
        <Form.Input label='Title' value={form.title} onChange={setField('title')} required />
        <Form.Input label='Author' value={form.author} onChange={setField('author')} required />
        <Form.Input label='Year' type='number' value={form.year} onChange={setField('year')} required />
      </Form.Group>
      <Form.Input
        label='Media (comma-separated)'
        placeholder='porcelain, underglaze, high-fire glaze'
        value={form.media}
        onChange={setField('media')}
        required
      />
      <Form.Group widths='equal'>
        <Form.Input label='Height (in)' type='number' value={form.height} onChange={setField('height')} />
        <Form.Input label='Length (in)' type='number' value={form.length} onChange={setField('length')} />
        <Form.Input label='Width (in)' type='number' value={form.width} onChange={setField('width')} />
        <Form.Input label='Price ($)' type='number' value={form.price} onChange={setField('price')} />
      </Form.Group>
      <Form.Field>
        <Checkbox label='Wall piece' checked={form.wallPiece} onChange={setField('wallPiece')} />
      </Form.Field>
      <Form.Field>
        <label>{isEdit ? 'Replace image (optional)' : 'Image file (required)'}</label>
        <input type='file' accept={ACCEPTED_TYPES.join(',')} onChange={onFile} />
        {file && <Label basic style={{ marginTop: 8 }}>{file.name}</Label>}
      </Form.Field>
      <Message error content={error} />
      {status && !error && <Message info content={status} />}
      <Button primary type='submit' loading={saving} disabled={saving}>
        {isEdit ? 'Save changes' : 'Add artwork'}
      </Button>
    </Form>
  )
}

// ---------- Artwork tab ----------
const ArtworkTab = () => {
  const [art, setArt] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await adminAPI.listArt()
      setArt(data)
    } catch (err) {
      setError(errMessage(err, 'Failed to load artwork'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleDelete = async (item) => {
    try {
      if (item.deleted) {
        await adminAPI.restoreArt(item._id)
      } else {
        await adminAPI.deleteArt(item._id)
      }
      load()
    } catch (err) {
      setError(errMessage(err, 'Action failed'))
    }
  }

  return (
    <Tab.Pane>
      <Header as='h3'>Add a new artwork</Header>
      <ArtworkForm onSaved={load} />

      <Header as='h3' style={{ marginTop: 30 }}>Existing artwork</Header>
      {error && <Message error content={error} />}
      {loading ? <Loader active inline='centered' /> : (
        <Table compact celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Image</Table.HeaderCell>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Year</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {art.map((item) => (
              <Table.Row key={item._id} disabled={item.deleted}>
                <Table.Cell collapsing>
                  {item.imageUrl && (
                    <Image src={item.imageUrl} size='tiny' style={{ maxHeight: 60, width: 'auto' }} />
                  )}
                </Table.Cell>
                <Table.Cell>{item.title}</Table.Cell>
                <Table.Cell>{item.year}</Table.Cell>
                <Table.Cell>
                  {item.deleted
                    ? <Label color='red' size='tiny'>Hidden</Label>
                    : <Label color='green' size='tiny'>Visible</Label>}
                </Table.Cell>
                <Table.Cell>
                  <Button size='tiny' icon='edit' content='Edit' onClick={() => setEditing(item)} />
                  <Button
                    size='tiny'
                    color={item.deleted ? 'green' : 'red'}
                    icon={item.deleted ? 'undo' : 'hide'}
                    content={item.deleted ? 'Restore' : 'Hide'}
                    onClick={() => setConfirmId(item._id)}
                  />
                  <Confirm
                    open={confirmId === item._id}
                    content={item.deleted
                      ? `Restore "${item.title}" to the website?`
                      : `Hide "${item.title}" from the website?`}
                    onCancel={() => setConfirmId(null)}
                    onConfirm={() => { setConfirmId(null); toggleDelete(item) }}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)}>
        <Modal.Header>Edit: {editing?.title}</Modal.Header>
        <Modal.Content>
          {editing && (
            <ArtworkForm
              initial={artToForm(editing)}
              isEdit
              onSaved={() => { setEditing(null); load() }}
            />
          )}
        </Modal.Content>
      </Modal>
    </Tab.Pane>
  )
}

// ---------- Show form ----------
const emptyShow = {
  title: '', location: '', year: '', juror: '', awards: '',
  soloShow: false, isUpcoming: false, startDate: '', endDate: '',
  description: '', address: '', mapLink: '', imageUrl: '',
}

const showToForm = (s) => ({
  _id: s._id,
  title: s.title || '',
  location: s.location || '',
  year: s.year ?? '',
  juror: s.juror || '',
  awards: Array.isArray(s.awards) ? s.awards.join(', ') : (s.awards || ''),
  soloShow: Boolean(s.soloShow),
  isUpcoming: Boolean(s.isUpcoming),
  startDate: s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : '',
  endDate: s.endDate ? new Date(s.endDate).toISOString().slice(0, 10) : '',
  description: s.description || '',
  address: s.address || '',
  mapLink: s.mapLink || '',
  imageUrl: s.imageUrl || '',
})

const ShowForm = ({ initial, isEdit, onSaved }) => {
  const [form, setForm] = useState(initial || emptyShow)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  // Create a single object URL per selected file and revoke it on change/unmount
  // so we don't leak a new blob URL on every re-render.
  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const setField = (key) => (e, data) => {
    const value = data?.type === 'checkbox' ? data.checked : (data ? data.value : e.target.value)
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (f && !ACCEPTED_TYPES.includes(f.type)) {
      setError(`Unsupported file type: ${f.type}. Use JPG, PNG, GIF, or WEBP.`)
      setFile(null)
      return
    }
    setError('')
    setFile(f || null)
  }

  const buildPayload = (imageUrl) => {
    const payload = {
      title: form.title,
      location: form.location,
      year: form.year,
      soloShow: form.soloShow,
      isUpcoming: form.isUpcoming,
    }
    if (form.juror) payload.juror = form.juror
    if (form.awards) payload.awards = form.awards
    if (form.isUpcoming) {
      if (form.startDate) payload.startDate = form.startDate
      if (form.endDate) payload.endDate = form.endDate
      if (form.description) payload.description = form.description
      if (form.address) payload.address = form.address
      if (form.mapLink) payload.mapLink = form.mapLink
      const finalImageUrl = imageUrl || form.imageUrl
      if (finalImageUrl) payload.imageUrl = finalImageUrl
    }
    return payload
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('')
    setSaving(true)
    try {
      let imageUrl
      // Only upload when the image will actually be saved (upcoming shows),
      // otherwise we'd push an orphaned object to S3.
      if (file && form.isUpcoming) {
        setStatus('Requesting upload URL...')
        const { data } = await adminAPI.getUploadUrl(form.title, file.type, 'shows')
        setStatus('Uploading image to S3...')
        await adminAPI.uploadToS3(data.uploadUrl, file)
        imageUrl = data.imageUrl
      }

      setStatus('Saving show...')
      if (isEdit) {
        await adminAPI.updateShow(initial._id, buildPayload(imageUrl))
      } else {
        await adminAPI.createShow(buildPayload(imageUrl))
      }
      setStatus('Saved.')
      if (!isEdit) {
        setForm(emptyShow)
        setFile(null)
      }
      onSaved?.()
    } catch (err) {
      setError(errMessage(err, 'Failed to save show'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form onSubmit={submit} error={Boolean(error)}>
      <Form.Group widths='equal'>
        <Form.Input label='Title' value={form.title} onChange={setField('title')} required />
        <Form.Input label='Location' value={form.location} onChange={setField('location')} required />
        <Form.Input label='Year' type='number' value={form.year} onChange={setField('year')} />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Juror (optional)' value={form.juror} onChange={setField('juror')} />
        <Form.Input label='Awards (comma-separated)' value={form.awards} onChange={setField('awards')} />
      </Form.Group>
      <Form.Group inline>
        <Checkbox label='Solo show' checked={form.soloShow} onChange={setField('soloShow')} style={{ marginRight: 20 }} />
        <Checkbox label='Upcoming show' checked={form.isUpcoming} onChange={setField('isUpcoming')} />
      </Form.Group>
      {form.isUpcoming && (
        <Segment>
          <Form.Group widths='equal'>
            <Form.Input label='Start date' type='date' value={form.startDate} onChange={setField('startDate')} />
            <Form.Input label='End date' type='date' value={form.endDate} onChange={setField('endDate')} />
          </Form.Group>
          <Form.TextArea label='Description' value={form.description} onChange={setField('description')} />
          <Form.Group widths='equal'>
            <Form.Input label='Address' value={form.address} onChange={setField('address')} />
            <Form.Input label='Map link' value={form.mapLink} onChange={setField('mapLink')} />
          </Form.Group>
          <Form.Field>
            <label>{form.imageUrl ? 'Replace poster/flyer image (optional)' : 'Upload poster/flyer image'}</label>
            <input type='file' accept={ACCEPTED_TYPES.join(',')} onChange={onFile} />
            {file && <Label basic style={{ marginTop: 8 }}>{file.name}</Label>}
          </Form.Field>
          {(previewUrl || form.imageUrl) && (
            <Image
              src={previewUrl || form.imageUrl}
              size='medium'
              style={{ marginTop: 8 }}
            />
          )}
        </Segment>
      )}
      <Message error content={error} />
      {status && !error && <Message info content={status} />}
      <Button primary type='submit' loading={saving} disabled={saving}>
        {isEdit ? 'Save changes' : 'Add show'}
      </Button>
    </Form>
  )
}

// ---------- Shows / resume tab ----------
const buildResumeText = (shows) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Mirror the public resume: exclude shows that are still upcoming.
  const resumeShows = shows.filter((s) => {
    if (!s.isUpcoming) return true
    if (s.endDate && new Date(s.endDate) < today) return true
    return false
  })

  const withYear = resumeShows.map((s) => {
    if (!s.year && s.endDate) {
      return { ...s, year: new Date(s.endDate).getFullYear() }
    }
    return s
  })

  const sortFn = (a, b) => {
    const ya = a.year || 0
    const yb = b.year || 0
    if (yb !== ya) return yb - ya
    return (a.title || '').localeCompare(b.title || '')
  }

  const formatRow = (s) => {
    let line = `${s.year || '----'}  ${s.title}`
    if (s.location) line += ` — ${s.location}`
    if (s.juror) line += `, Juror: ${s.juror}`
    if (Array.isArray(s.awards) && s.awards.length > 0) {
      line += ` (Awards: ${s.awards.join(', ')})`
    }
    return line
  }

  const solo = withYear.filter((s) => s.soloShow).sort(sortFn)
  const group = withYear.filter((s) => !s.soloShow).sort(sortFn)

  const lines = []
  lines.push('SANDY CALHOUN — RESUME')
  lines.push(`Generated ${new Date().toLocaleDateString()}`)
  lines.push('')
  lines.push('SOLO SHOWS')
  lines.push('='.repeat(40))
  if (solo.length === 0) lines.push('(none)')
  solo.forEach((s) => lines.push(formatRow(s)))
  lines.push('')
  lines.push('GROUP SHOWS')
  lines.push('='.repeat(40))
  if (group.length === 0) lines.push('(none)')
  group.forEach((s) => lines.push(formatRow(s)))
  lines.push('')

  return lines.join('\n')
}

const ShowsTab = () => {
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await adminAPI.listShows()
      setShows(data)
    } catch (err) {
      setError(errMessage(err, 'Failed to load shows'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const remove = async (id) => {
    try {
      await adminAPI.deleteShow(id)
      load()
    } catch (err) {
      setError(errMessage(err, 'Delete failed'))
    }
  }

  const downloadResume = () => {
    const text = buildResumeText(shows)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sandy-calhoun-resume.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Tab.Pane>
      <Button
        floated='right'
        icon='download'
        content='Download resume (.txt)'
        onClick={downloadResume}
        disabled={shows.length === 0}
      />
      <Header as='h3'>Add a show / resume row</Header>
      <ShowForm onSaved={load} />

      <Header as='h3' style={{ marginTop: 30 }}>Existing shows</Header>
      {error && <Message error content={error} />}
      {loading ? <Loader active inline='centered' /> : (
        <Table compact celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Year</Table.HeaderCell>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Location</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {shows.map((s) => (
              <Table.Row key={s._id}>
                <Table.Cell>{s.year}</Table.Cell>
                <Table.Cell>{s.title}</Table.Cell>
                <Table.Cell>{s.location}</Table.Cell>
                <Table.Cell>
                  {s.isUpcoming && <Label color='blue' size='tiny'>Upcoming</Label>}
                  {s.soloShow
                    ? <Label color='purple' size='tiny'>Solo</Label>
                    : <Label size='tiny'>Group</Label>}
                </Table.Cell>
                <Table.Cell>
                  <Button size='tiny' icon='edit' content='Edit' onClick={() => setEditing(s)} />
                  <Button size='tiny' color='red' icon='trash' content='Delete' onClick={() => setConfirmId(s._id)} />
                  <Confirm
                    open={confirmId === s._id}
                    content={`Permanently delete "${s.title}"?`}
                    onCancel={() => setConfirmId(null)}
                    onConfirm={() => { setConfirmId(null); remove(s._id) }}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)}>
        <Modal.Header>Edit: {editing?.title}</Modal.Header>
        <Modal.Content>
          {editing && (
            <ShowForm
              initial={showToForm(editing)}
              isEdit
              onSaved={() => { setEditing(null); load() }}
            />
          )}
        </Modal.Content>
      </Modal>
    </Tab.Pane>
  )
}

// ---------- Admin root ----------
const Admin = () => {
  const [authed, setAuthed] = useState(isAuthed())

  const logout = () => {
    clearToken()
    setAuthed(false)
  }

  if (!authed) {
    return <LoginGate onLogin={() => setAuthed(true)} />
  }

  const panes = [
    { menuItem: 'Artworks', render: () => <ArtworkTab /> },
    { menuItem: 'Shows / Resume', render: () => <ShowsTab /> },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Header as='h1'>Admin Dashboard</Header>
        <Button basic icon='sign-out' content='Log out' onClick={logout} />
      </div>
      <Tab panes={panes} />
    </div>
  )
}

export default Admin
