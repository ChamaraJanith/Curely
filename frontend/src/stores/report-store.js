import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth-store';

export const useReportStore = defineStore('report', {
  state: () => ({
    reports: [],
    loading: false,
    error: null
  }),
  actions: {
    getHeaders() {
      const authStore = useAuthStore();
      return {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      };
    },
    async fetchReports() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('http://localhost:3000/reports', this.getHeaders());
        this.reports = response.data;
      } catch (err) {
        this.error = err.response?.data?.details || err.response?.data?.error || err.message || 'Failed to fetch reports';
        console.error('Fetch reports error:', this.error);
      } finally {
        this.loading = false;
      }
    }
  },
  getters: {
    chartData: (state) => {
      const sortedReports = [...state.reports].sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
      const dates = sortedReports.map(r => new Date(r.uploadedAt).toLocaleString());
      const glucose = sortedReports.map(r => r.data.glucose);
      const systolic = sortedReports.map(r => r.data.systolic);
      const diastolic = sortedReports.map(r => r.data.diastolic);

      return {
        categories: dates,
        series: [
          { name: 'Glucose', data: glucose },
          { name: 'Systolic BP', data: systolic },
          { name: 'Diastolic BP', data: diastolic }
        ]
      };
    }
  }
});
