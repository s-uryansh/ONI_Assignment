'use client';

import { useState } from "react";
import toast from 'react-hot-toast';
import { useAuth } from "../components/Auth/Auth";

export default function BooksPage() {
  const [openAddBookForm, setOpenAddBookForm] = useState(false);
  const [openListBookForm, setOpenListBookForm] = useState(false);
  const [openAllBooks, setOpenAllBooks] = useState(false);
  const [openBorrowedBooks, setOpenBorrowedBooks] = useState(false);

  const [bookList, setBookList] = useState<any[]>([]);
  const [bookName, setBookName] = useState("");

  const [form, setForm] = useState({ title: "", author: "" });
  const { user } = useAuth();

  const [filters, setFilters] = useState<{ title: string; author: string; available?: boolean }>({
    title: "",
    author: "",
    available: undefined
  });

  const [editBookId, setEditBookId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", author: "" });

  const handleChange = (e: any) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditOpen = (book: any) => {
    setEditBookId(book.id);
    setEditForm({ title: book.title ?? "", author: book.author ?? "" });
  };

  const handleEditChange = (e: any) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) { toast.error("Login required"); return; } // require login
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/books`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to add book");
        return;
      }
      toast.success("Book added");
      setForm({ title: "", author: "" });
      setOpenAddBookForm(false);
    } catch {
      toast.error("Error adding book");
    }
  };

  const searchBooks = async (title: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/books/${encodeURIComponent(title)}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to fetch");
        return;
      }
      setBookList(Array.isArray(data) ? data : [data]);
    } catch {
      toast.error("Error fetching");
    }
  };

  const handleFindBook = async (e: any) => {
    e.preventDefault();
    if (!bookName) return toast.error("Enter a book title");
    await searchBooks(bookName);
    toast.success("Fetched");
  };

  const fetchBooks = async (params?: { title?: string; author?: string; available?: boolean }) => {
    try {
      const q = new URLSearchParams();
      const f = params ?? filters;

      if (f.title) q.append("title", f.title);
      if (f.author) q.append("author", f.author);
      if (typeof f.available === "boolean") {
        q.append("available", f.available ? "true" : "false");
      }

      const url = `${process.env.NEXT_PUBLIC_NEST_URL}/books/all?${q.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Fetch failed");
        return;
      }
      setBookList(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error fetching");
    }
  };

  const updateBook = async (id: number) => {
    console.log(user)
    if (!user?.id) { toast.error("Login required"); return; } 
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/books/${id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      console.log(data)
      if (!res.ok) {
        toast.error(data.error || "Failed update");
        return;
      }
      toast.success("Updated");
      setEditBookId(null);
      if (openAllBooks) fetchBooks(filters);
      if (openListBookForm && bookName) searchBooks(bookName);
    } catch {
      toast.error("Update error");
    }
  };

  const borrowBook = async (id: number) => {
    if (!user) return toast.error("Login required");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/books/borrow/${id}/${user.id}`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Borrow failed");
        return;
      }
      toast.success("Borrowed");
      if (openAllBooks) fetchBooks(filters);
      if (openListBookForm && bookName) searchBooks(bookName);
    } catch {
      toast.error("Borrow error");
    }
  };

  const returnBook = async (id: number) => {
    if (!user) { toast.error("Login required"); return; } // require login
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/books/return/${id}`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Return failed");
        return;
      }
      toast.success("Returned");
      if (openAllBooks) fetchBooks(filters);
      if (openListBookForm && bookName) searchBooks(bookName);
    } catch {
      toast.error("Return error");
    }
  };

  const fetchBorrowedBooks = async () => {
    if (!user) { toast.error("Login required"); return; } // require login
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/books/borrowed/user/${user?.id}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed");
        return;
      }
      setBookList(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error fetching borrowed");
    }
  };

  const deleteBook = async (id: number) => {
    if (!user) { toast.error("Login required"); return; } // require login
    if (!confirm("Delete book?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/books/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Delete failed");
        return;
      }
      toast.success("Deleted");
      if (openAllBooks) fetchBooks(filters);
      if (openListBookForm && bookName) searchBooks(bookName);
    } catch {
      toast.error("Delete error");
    }
  };

  return (
    <div style={{ width: 350, margin: "0 auto", paddingTop: 100, display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Borrowed Books */}
      <button onClick={() => {
        const on = !openBorrowedBooks;
        setOpenBorrowedBooks(on);
        if (on) fetchBorrowedBooks();
        else setBookList([]);
      }}>
        {user ? `Borrowed by ${user.fullName}` : "Login to view borrowed"}
      </button>

      {openBorrowedBooks && renderBookList()}

      {/* All Books */}
      <button onClick={() => {
        const on = !openAllBooks;
        setOpenAllBooks(on);
        if (on) fetchBooks(filters);
        else setBookList([]);
      }}>
        {openAllBooks ? "Close" : "All Books"}
      </button>

      {openAllBooks && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "#000", padding: 16, borderRadius: 8 }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              placeholder="Title"
              value={filters.title}
              onChange={e => setFilters({ ...filters, title: e.target.value })}
              style={{ padding: 8, borderRadius: 6 }}
            />
            <input
              placeholder="Author"
              value={filters.author}
              onChange={e => setFilters({ ...filters, author: e.target.value })}
              style={{ padding: 8, borderRadius: 6 }}
            />
            <select
              value={filters.available === undefined ? "any" : filters.available ? "true" : "false"}
              onChange={e =>
                setFilters({
                  ...filters,
                  available:
                    e.target.value === "any" ? undefined : e.target.value === "true"
                })
              }
              style={{ padding: 8, borderRadius: 6 }}
            >
              <option value="any">Any</option>
              <option value="true">Available</option>
              <option value="false">Borrowed</option>
            </select>

            <button onClick={() => fetchBooks(filters)}>Search</button>
          </div>

          {renderBookList()}
        </div>
      )}

      {/* Add Book */}
      <button onClick={() => setOpenAddBookForm(v => !v)}>
        {openAddBookForm ? "Close" : "Add Book"}
      </button>

      {openAddBookForm && renderAddBookForm()}

      {/* Find Book */}
      <button onClick={() => setOpenListBookForm(v => !v)}>
        {openListBookForm ? "Close" : "Find Book"}
      </button>

      {openListBookForm && renderFindBookForm()}
    </div>
  );

  // COMPONENT SUB-RENDERS
  function renderBookList() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "#000", padding: 16, borderRadius: 8 }}>
        {bookList.length === 0 ? (
          <p style={{ color: "#888" }}>No results</p>
        ) : (
          <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {bookList.map((b, idx) => (
              <li key={b.id ?? idx} style={{ padding: 10, background: "#111", borderRadius: 6 }}>
                {editBookId === b.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input name="title" value={editForm.title} onChange={handleEditChange} />
                    <input name="author" value={editForm.author} onChange={handleEditChange} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => updateBook(b.id)}>Save</button>
                      <button onClick={() => setEditBookId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, color: "#fff" }}>{b.title}</div>
                    <div style={{ color: "#aaa", fontSize: 13 }}>{b.author ?? "Unknown"}</div>
                    <div style={{ color: "#bbb", fontSize: 12 }}>{b.borrowedBy ? `Borrowed by ${b.borrowedBy}` : "Available"}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button onClick={() => handleEditOpen(b)}>Edit</button>
                      <button onClick={() => deleteBook(b.id)}>Delete</button>
                      {b.borrowedBy ? (
                        <button onClick={() => returnBook(b.id)}>Return</button>
                      ) : (
                        <button onClick={() => borrowBook(b.id)}>Borrow</button>
                      )}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  function renderAddBookForm() {
    return (
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, background: "#000", padding: 16, borderRadius: 8 }}>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" />
        <input name="author" value={form.author} onChange={handleChange} placeholder="Author" />
        <button type="submit">Submit</button>
      </form>
    );
  }

  function renderFindBookForm() {
    return (
      <form onSubmit={handleFindBook} style={{ display: "flex", flexDirection: "column", gap: 12, background: "#000", padding: 16, borderRadius: 8 }}>
        <input
          value={bookName}
          onChange={e => setBookName(e.target.value)}
          placeholder="Title"
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">Search</button>
          <button type="button" onClick={() => { setBookName(""); setBookList([]); }}>Clear</button>
        </div>
        {renderBookList()}
      </form>
    );
  }
}
