import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/api";

function Issues() {
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bookId: "",
    memberId: "",
  });

  const [formError, setFormError] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [returningId, setReturningId] = useState(null);

  const fetchIssues = async (selectedFilter = filter) => {
    let endpoint = "/issues";

    if (selectedFilter === "active") {
      endpoint = "/issues/active";
    } else if (selectedFilter === "overdue") {
      endpoint = "/issues/overdue";
    }

    const data = await apiRequest(endpoint);
    setIssues(data);
  };

  const fetchBooks = async () => {
    const data = await apiRequest("/books");
    setBooks(data);
  };

  const fetchMembers = async () => {
    const data = await apiRequest("/members");
    setMembers(data);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchIssues(filter),
        fetchBooks(),
        fetchMembers(),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getBookName = (bookId) => {
    const book = books.find((book) => book.id === bookId);
    return book ? book.title : `Book #${bookId}`;
  };

  const getMemberName = (memberId) => {
    const member = members.find((member) => member.id === memberId);
    return member ? member.name : `Member #${memberId}`;
  };

  const handleFilterChange = async (newFilter) => {
    try {
      setFilter(newFilter);
      setLoading(true);
      setError("");

      await fetchIssues(newFilter);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openIssueForm = () => {
    setFormData({
      bookId: "",
      memberId: "",
    });

    setFormError("");
    setShowForm(true);
  };

  const closeIssueForm = () => {
    setShowForm(false);

    setFormData({
      bookId: "",
      memberId: "",
    });

    setFormError("");
  };

  const handleIssueBook = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!formData.bookId) {
      setFormError("Please select a book.");
      return;
    }

    if (!formData.memberId) {
      setFormError("Please select a member.");
      return;
    }

    try {
      setIssuing(true);

      await apiRequest("/issues", {
        method: "POST",
        body: JSON.stringify({
          bookId: Number(formData.bookId),
          memberId: Number(formData.memberId),
        }),
      });

      closeIssueForm();
      await loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIssuing(false);
    }
  };

  const handleReturnBook = async (issueId) => {
    const confirmed = window.confirm(
      "Are you sure you want to return this book?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setReturningId(issueId);
      setError("");

      await apiRequest(`/issues/${issueId}/return`, {
        method: "PUT",
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setReturningId(null);
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
              Issues & Returns
            </h1>

            <p className="mt-2 text-gray-600">
              Manage book issuing and returning.
            </p>
          </div>

          <button
            type="button"
            onClick={openIssueForm}
            className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800"
          >
            + Issue Book
          </button>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            ["all", "All Issues"],
            ["active", "Active"],
            ["returned", "Returned"],
            ["overdue", "Overdue"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => handleFilterChange(value)}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${
                filter === value
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Issue Form */}
        {showForm && (
          <form
            onSubmit={handleIssueBook}
            className="mt-6 rounded-xl bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900">
              Issue Book
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Select Book
                </label>

                <select
                  name="bookId"
                  value={formData.bookId}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                >
                  <option value="">
                    Select an available book
                  </option>

                  {books
                    .filter((book) => book.available)
                    .map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} — {book.author}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Select Member
                </label>

                <select
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                >
                  <option value="">
                    Select a member
                  </option>

                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} — {member.email}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {formError && (
              <p className="mt-4 text-sm text-red-600">
                {formError}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={issuing}
                className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white disabled:opacity-50"
              >
                {issuing ? "Issuing..." : "Issue Book"}
              </button>

              <button
                type="button"
                onClick={closeIssueForm}
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
            Loading issues...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="mt-8 text-red-600">
            {error}
          </p>
        )}

        {/* Table */}
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
                      Book
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Member
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Issue Date
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Due Date
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Return Date
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
                  {issues.length > 0 ? (
                    issues.map((issue) => (
                      <tr
                        key={issue.id}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-gray-600">
                          {issue.id}
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-900">
                          {getBookName(issue.bookId)}
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-900">
                          {getMemberName(issue.memberId)}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {issue.issueDate}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {issue.dueDate}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {issue.returnDate || "-"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${
                              issue.returned
                                ? "bg-green-100 text-green-700"
                                : issue.overdue
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {issue.returned
                              ? "Returned"
                              : issue.overdue
                                ? "Overdue"
                                : "Active"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {!issue.returned ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleReturnBook(issue.id)
                              }
                              disabled={returningId === issue.id}
                              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              {returningId === issue.id
                                ? "Returning..."
                                : "Return"}
                            </button>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No issues found.
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

export default Issues;