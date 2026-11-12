const API_BASE_URL = "http://localhost:8080/api";

export const apiRequest = async (endpoint, options = {}) => {
  const savedAuth = localStorage.getItem("libraryAuth");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (savedAuth) {
    const auth = JSON.parse(savedAuth);

    headers.Authorization = `Basic ${auth.credentials}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.message ||
        `Request failed with status ${response.status}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};