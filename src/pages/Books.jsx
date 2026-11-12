import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/api";

function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("title");
  const [bookFilter, setBookFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
  });

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchBooks = async (
    searchTerm = "",
    type = searchType,
    filter = bookFilter
  ) => {
    try {
      setLoading(true);
      setError("");

      let data;

      if (searchTerm.trim()) {
        const encodedSearch = encodeURIComponent(
          searchTerm.trim()
        );

        if (type === "author") {
          data = await apiRequest(
            `/books/search/author?author=${encodedSearch}`
          );
        } else if (type === "isbn") {
          try {
            const book = await apiRequest(
              `/books/search/isbn?isbn=${encodedSearch}`
            );

            data = book ? [book] : [];
          } catch (err) {
            if (err.message.includes("404")) {
              data = [];
            } else {
              throw err;
            }
          }
        } else {
          data = await apiRequest(
            `/books/search?title=${encodedSearch}`
          );
        }
      } else if (filter === "available") {
        data = await apiRequest("/books/available");
      } else {
        data = await apiRequest("/books");

        if (filter === "issued") {
          data = data.filter((book) => !book.available);
        }
      }

      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchBooks(search, searchType, bookFilter);
  };

  const handleClear = () => {
    setSearch("");
    fetchBooks("", searchType, bookFilter);
  };

  const handleFilterChange = (newFilter) => {
    setBookFilter(newFilter);
    fetchBooks(search, searchType, newFilter);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingId(null);

    setFormData({
      title: "",
      author: "",
      isbn: "",
    });

    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (book) => {
    setEditingId(book.id);

    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
    });

    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError("");

    setFormData({
      title: "",
      author: "",
      isbn: "",
    });
  };

  const handleSaveBook = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!formData.title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!formData.author.trim()) {
      setFormError("Author is required.");
      return;
    }

    if (!/^\d{13}$/.test(formData.isbn)) {
      setFormError("ISBN must contain exactly 13 digits.");
      return;
    }

    try {
      setSaving(true);

      const existingBook = books.find(
        (book) => book.id === editingId
      );

      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn,
        available: editingId
          ? existingBook?.available ?? true
          : true,
      };

      if (editingId) {
        await apiRequest(`/books/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(bookData),
        });
      } else {
        await apiRequest("/books", {
          method: "POST",
          body: JSON.stringify(bookData),
        });
      }

      closeForm();

      await fetchBooks(search, searchType, bookFilter);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await apiRequest(`/books/${id}`, {
        method: "DELETE",
      });

      setBooks((previousBooks) =>
        previousBooks.filter((book) => book.id !== id)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Books
            </h1>

            <p className="mt-2 text-gray-600">
              Manage all books in the library.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800"
          >
            + Add Book
          </button>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mt-8 flex flex-col gap-3 lg:flex-row"
        >
          <select
            value={searchType}
            onChange={(event) =>
              setSearchType(event.target.value)
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-900"
          >
            <option value="title">Search by Title</option>
            <option value="author">Search by Author</option>
            <option value="isbn">Search by ISBN</option>
          </select>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder={`Search books by ${searchType}...`}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-900"
          />

          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800"
          >
            Search
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        </form>

        {/* Availability Filters */}
        <div className="mt-5 flex flex-wrap gap-3">
          {[
            ["all", "All Books"],
            ["available", "Available"],
            ["issued", "Issued"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => handleFilterChange(value)}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${
                bookFilter === value
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <form
            onSubmit={handleSaveBook}
            className="mt-6 rounded-xl bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900">
              {editingId ? "Edit Book" : "Add New Book"}
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Book title"
                className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />

              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Author"
                className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />

              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
                placeholder="13-digit ISBN"
                maxLength="13"
                className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            {formError && (
              <p className="mt-4 text-sm text-red-600">
                {formError}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Book"
                    : "Add Book"}
              </button>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <p className="mt-8 text-gray-600">
            Loading books...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="mt-8 text-red-600">
            {error}
          </p>
        )}

        {/* Books Table */}
        {!loading && !error && (
          <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      ID
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Title
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Author
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      ISBN
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {books.length > 0 ? (
                    books.map((book) => (
                      <tr
                        key={book.id}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-gray-600">
                          {book.id}
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-900">
                          {book.title}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {book.author}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {book.isbn}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${
                              book.available
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {book.available
                              ? "Available"
                              : "Issued"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(book)
                              }
                              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteBook(book.id)
                              }
                              disabled={
                                deletingId === book.id
                              }
                              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {deletingId === book.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No books found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default Books;