const API_URL = "http://localhost:8000/auth";

export const authService = {
  async login(credentials) {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    const data = await response.json();
    return data;
  },

  async signup(userData) {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Signup failed");
    }

    const data = await response.json();
    return data;
  },

  async logout() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Logout failed");
    }

    localStorage.removeItem("token");
    return await response.json();
  },
};
