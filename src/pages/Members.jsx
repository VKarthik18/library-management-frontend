import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/api";

function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [selectedMember, setSelectedMember] = useState(null);
  const [memberIssues, setMemberIssues] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/members");
      setMembers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

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
      name: "",
      email: "",
      phone: "",
    });

    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (member) => {
    setEditingId(member.id);

    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
    });

    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError("");

    setFormData({
      name: "",
      email: "",
      phone: "",
    });
  };

  const handleSaveMember = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Name is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setFormError("Phone must contain exactly 10 digits.");
      return;
    }

    try {
      setSaving(true);

      const memberData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
      };

      if (editingId) {
        await apiRequest(`/members/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(memberData),
        });
      } else {
        await apiRequest("/members", {
          method: "POST",
          body: JSON.stringify(memberData),
        });
      }

      closeForm();
      await fetchMembers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this member?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await apiRequest(`/members/${id}`, {
        method: "DELETE",
      });

      setMembers((previousMembers) =>
        previousMembers.filter((member) => member.id !== id)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewHistory = async (member) => {
    try {
      setSelectedMember(member);
      setHistoryLoading(true);
      setHistoryError("");

      const data = await apiRequest(
        `/members/${member.id}/issues`
      );

      setMemberIssues(data);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistory = () => {
    setSelectedMember(null);
    setMemberIssues([]);
    setHistoryError("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Members
            </h1>

            <p className="mt-2 text-gray-600">
              Manage library members.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800"
          >
            + Add Member
          </button>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <form
            onSubmit={handleSaveMember}
            className="mt-6 rounded-xl bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900">
              {editingId ? "Edit Member" : "Add New Member"}
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Member name"
                className="rounded-lg border border-gray-300 px-4 py-3"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                className="rounded-lg border border-gray-300 px-4 py-3"
              />

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit phone"
                maxLength="10"
                className="rounded-lg border border-gray-300 px-4 py-3"
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
                    ? "Update Member"
                    : "Add Member"}
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

        {/* Member History */}
        {selectedMember && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Borrowing History
                </h2>

                <p className="mt-1 text-gray-600">
                  {selectedMember.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeHistory}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Close
              </button>
            </div>

            {historyLoading && (
              <p className="mt-6 text-gray-600">
                Loading borrowing history...
              </p>
            )}

            {historyError && (
              <p className="mt-6 text-red-600">
                {historyError}
              </p>
            )}

            {!historyLoading && !historyError && (
              <>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Total Issues
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {memberIssues.length}
                    </p>
                  </div>

                  <div className="rounded-lg bg-yellow-50 p-4">
                    <p className="text-sm text-gray-500">
                      Currently Borrowed
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {
                        memberIssues.filter(
                          (issue) => !issue.returned
                        ).length
                      }
                    </p>
                  </div>

                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="text-sm text-gray-500">
                      Returned
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {
                        memberIssues.filter(
                          (issue) => issue.returned
                        ).length
                      }
                    </p>
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                          Issue ID
                        </th>

                        <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                          Book ID
                        </th>

                        <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                          Issue Date
                        </th>

                        <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                          Due Date
                        </th>

                        <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                          Return Date
                        </th>

                        <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {memberIssues.length > 0 ? (
                        memberIssues.map((issue) => (
                          <tr
                            key={issue.id}
                            className="border-b last:border-b-0"
                          >
                            <td className="px-4 py-3 text-gray-600">
                              {issue.id}
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                              {issue.bookId}
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                              {issue.issueDate}
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                              {issue.dueDate}
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                              {issue.returnDate || "-"}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-3 py-1 text-sm font-medium ${
                                  issue.returned
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {issue.returned
                                  ? "Returned"
                                  : "Active"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            No borrowing history found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p className="mt-8 text-gray-600">
            Loading members...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="mt-8 text-red-600">
            {error}
          </p>
        )}

        {/* Members Table */}
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
                      Name
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Email
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {members.length > 0 ? (
                    members.map((member) => (
                      <tr
                        key={member.id}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-gray-600">
                          {member.id}
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-900">
                          {member.name}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {member.email}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {member.phone}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleViewHistory(member)
                              }
                              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                            >
                              History
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(member)
                              }
                              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteMember(member.id)
                              }
                              disabled={
                                deletingId === member.id
                              }
                              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {deletingId === member.id
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
                        colSpan="5"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No members found.
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

export default Members;