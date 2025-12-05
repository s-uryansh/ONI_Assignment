'use client';

import { useState } from "react";
import toast from 'react-hot-toast';
import { useAuth } from "../components/Auth/Auth";

export default function AuthorsPage() {
  const [openAddAuthorForm, setOpenAddAuthorForm] = useState(false);
  const [openAllAuthors, setOpenAllAuthors] = useState(false);
  const [openFindAuthorForm, setOpenFindAuthorForm] = useState(false);
  const [authorList, setAuthorList] = useState<any[]>([]);
  const [authorIdQuery, setAuthorIdQuery] = useState('');
  const [authorForm, setAuthorForm] = useState({ name: '' });
  const [editAuthorId, setEditAuthorId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '' });
  const { user } = useAuth();

  const fetchAllAuthors = async () => {
    if (!user) { toast.error('Login required'); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/authors/all`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to fetch authors.');
        return;
      }
      setAuthorList(Array.isArray(data) ? data : (data ? [data] : []));
      toast.success('Fetched all authors!');
    } catch (err) {
      toast.error('An error occurred while fetching authors.');
    }
  };

  const findAuthorById = async (name: string) => {
    if (!user) { toast.error('Login required'); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/authors/${name}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to fetch author.');
        return;
      }
      const normalized = Array.isArray(data) ? data : (data ? [data] : []);
      setAuthorList(normalized);
      toast.success('Author fetched!');
    } catch {
      toast.error('An error occurred while fetching the author.');
    }
  };

  const handleCreateAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Login required'); return; }
    if (!authorForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/authors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: authorForm.name }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to create author.');
        return;
      }
      toast.success('Author created');
      setAuthorForm({ name: '' });
      setOpenAddAuthorForm(false);
      if (openAllAuthors) fetchAllAuthors();
    } catch {
      toast.error('An error occurred while creating the author.');
    }
  };

  const handleUpdateAuthor = async (id: number) => {
    if (!user) { toast.error('Login required'); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/authors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update author.');
        return;
      }
      toast.success('Author updated');
      setEditAuthorId(null);
      if (openAllAuthors) fetchAllAuthors();
      else if (openFindAuthorForm && authorIdQuery) await findAuthorById(authorIdQuery);
    } catch {
      toast.error('An error occurred while updating the author.');
    }
  };

  const handleDeleteAuthor = async (id: number) => {
    if (!user) { toast.error('Login required'); return; }
    if (!confirm('Delete this author?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/authors/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete author.');
        return;
      }
      toast.success('Author deleted');
      if (openAllAuthors) fetchAllAuthors();
      else if (openFindAuthorForm && authorIdQuery) await findAuthorById(authorIdQuery);
      else setAuthorList(prev => prev.filter(a => a.id !== id));
    } catch {
      toast.error('An error occurred while deleting the author.');
    }
  };

  const openAllToggle = () => {
    const opening = !openAllAuthors;
    setOpenAllAuthors(opening);
    if (opening) fetchAllAuthors();
    else setAuthorList([]);
  };

  const handleFindSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await findAuthorById(authorIdQuery);
  };

  const startEdit = (author: any) => {
    setEditAuthorId(author.id);
    setEditForm({ name: author.name ?? '' });
  };

  return (
    <div style={{ width: '350px', margin: '0 auto', paddingTop: '100px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* All Authors */}
      <button onClick={openAllToggle}>{openAllAuthors ? 'Close' : 'All Authors'}</button>
      {openAllAuthors && (
        <div style={{ background: '#000', padding: 16, borderRadius: 8 }}>
          {authorList.length === 0 ? <p style={{ color: '#888' }}>No results</p> : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {authorList.map((a, idx) => (
                <li key={a.id ?? `${a.name}-${idx}`} style={{ padding: 10, background: '#111', borderRadius: 6 }}>
                  {editAuthorId === a.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input value={editForm.name} onChange={e => setEditForm({ name: e.target.value })} style={{ padding: 8, borderRadius: 6 }} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleUpdateAuthor(a.id)}>Save</button>
                        <button onClick={() => setEditAuthorId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{a.name}</div>
                      <div style={{ color: '#bbb', fontSize: 12, marginTop: 6 }}>id: {a.id}</div>
                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        <button onClick={() => startEdit(a)}>Edit</button>
                        <button onClick={() => handleDeleteAuthor(a.id)}>Delete</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Add Author */}
      <button onClick={() => setOpenAddAuthorForm(o => !o)}>{openAddAuthorForm ? 'Close' : 'Add Author'}</button>
      {openAddAuthorForm && (
        <form onSubmit={handleCreateAuthor} style={{ background: '#000', padding: 16, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="Name" value={authorForm.name} onChange={e => setAuthorForm({ name: e.target.value })} style={{ padding: 8, borderRadius: 6 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">Create</button>
            <button type="button" onClick={() => setOpenAddAuthorForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Find Author */}
      <button onClick={() => setOpenFindAuthorForm(o => !o)}>{openFindAuthorForm ? 'Close' : 'Find Author'}</button>

      {openFindAuthorForm && (
        <form onSubmit={handleFindSubmit} style={{ background: '#000', padding: 16, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="Author Name" value={authorIdQuery} onChange={e => setAuthorIdQuery(e.target.value)} style={{ padding: 8, borderRadius: 6 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">Search</button>
            <button type="button" onClick={() => { setAuthorIdQuery(''); setAuthorList([]); }}>Clear</button>
          </div>

          {authorList.length === 0 ? <p style={{ color: '#888' }}>No results</p> : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {authorList.map((a, idx) => (
                <li key={a.id ?? `${a.name}-${idx}`} style={{ padding: 10, background: '#111', borderRadius: 6 }}>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{a.name}</div>
                  <div style={{ color: '#bbb', fontSize: 12, marginTop: 6 }}>id: {a.id}</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button onClick={() => startEdit(a)}>Edit</button>
                    <button onClick={() => handleDeleteAuthor(a.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </form>
      )}
    </div>
  );
}