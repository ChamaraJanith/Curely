import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post('http://localhost:3000/login', credentials);
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        return true;
      } catch (err) {
        this.error = err.response?.data?.error || 'Login failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
    async googleLogin(idToken) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post('http://localhost:3000/google-login', { token: idToken });
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        return true;
      } catch (err) {
        this.error = err.response?.data?.error || 'Google login failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
    async register(userData) {

      this.loading = true;
      this.error = null;
      try {
        await axios.post('http://localhost:3000/register', userData);
        return true;
      } catch (err) {
        this.error = err.response?.data?.details || err.response?.data?.error || 'Registration failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});
