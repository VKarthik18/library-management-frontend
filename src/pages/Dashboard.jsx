import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    totalMembers: 0,
    activeIssues: 0,
    overdueIssues: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        books,
        availableBooks,
        members,
        activeIssues,
        overdueIssues,
      ] = await Promise.all([
        apiRequest("/books"),
        apiRequest("/books/available"),
        apiRequest("/members"),
        apiRequest("/issues/active"),
        apiRequest("/issues/overdue"),
      ]);

      setStats({
        totalBooks: books.length,
        availableBooks: availableBooks.length,
        totalMembers: members.length,
        activeIssues: activeIssues.length,
        overdueIssues: overdueIssues.length,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const statCards = [
    {
      title: "Total Books",
      value: stats.totalBooks,
      description: "Books in library",
    },
    {
      title: "Available Books",
      value: stats.availableBooks,
      description: "Ready to issue",
    },
    {
      title: "Members",
      value: stats.totalMembers,
      description: "Registered members",
    },
    {
      title: "Active Issues",
      value: stats.activeIssues,
      description: "Currently borrowed",
    },
    {
      title: "Overdue",
      value: stats.overdueIssues,
      description: "Past due date",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome */}
        <div className="rounded-2xl bg-gray-900 p-8 text-white shadow-sm">
          <h1 className="text-3xl font-bold">
            Library Dashboard
          </h1>

          <p className="mt-2 text-gray-300">
            Manage books, members, issues and returns from one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/books"
              className="rounded-lg bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-gray-100"
            >
              Manage Books
            </Link>

            <Link
              to="/members"
              className="rounded-lg border border-gray-600 px-5 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Manage Members
            </Link>

            <Link
              to="/issues"
              className="rounded-lg border border-gray-600 px-5 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Manage Issues
            </Link>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <p className="mt-8 text-gray-600">
            Loading dashboard...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="mt-8 text-red-600">
            {error}
          </p>
        )}

        {/* Statistics */}
        {!loading && !error && (
          <>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {statCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-gray-900">
                    {card.value}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Availability Summary */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">
                  Book Availability
                </h2>

                <div className="mt-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Available
                    </span>

                    <span className="font-semibold text-gray-900">
                      {stats.availableBooks} / {stats.totalBooks}
                    </span>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{
                        width:
                          stats.totalBooks > 0
                            ? `${(stats.availableBooks / stats.totalBooks) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">
                  Issue Status
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-yellow-50 p-4">
                    <p className="text-sm text-gray-600">
                      Active
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {stats.activeIssues}
                    </p>
                  </div>

                  <div className="rounded-lg bg-red-50 p-4">
                    <p className="text-sm text-gray-600">
                      Overdue
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {stats.overdueIssues}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Actions */}
            <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Quick Actions
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3">

                <Link
                  to="/books"
                  className="rounded-lg border border-gray-200 p-5 hover:bg-gray-50"
                >
                  <h3 className="font-semibold text-gray-900">
                    Add or Edit Books
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Manage your library collection.
                  </p>
                </Link>

                <Link
                  to="/members"
                  className="rounded-lg border border-gray-200 p-5 hover:bg-gray-50"
                >
                  <h3 className="font-semibold text-gray-900">
                    Manage Members
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Add members and view their history.
                  </p>
                </Link>

                <Link
                  to="/issues"
                  className="rounded-lg border border-gray-200 p-5 hover:bg-gray-50"
                >
                  <h3 className="font-semibold text-gray-900">
                    Issue or Return
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Process borrowing and returns.
                  </p>
                </Link>

              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;