export const getToken = () => {
  return localStorage.getItem("auth_token");
};

export const setToken = (token: string) => {
  localStorage.setItem("auth_token", token);
};

export const removeToken = () => {
  localStorage.removeItem("auth_token");
};

export const isAuthenticated = async () => {
  const token = getToken();
  if (!token) return false;

  try {
    const res = await fetch("http://localhost:3000/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      removeToken();
      return false;
    }

    return true;
  } catch {
    removeToken();
    return false;
  }
};
