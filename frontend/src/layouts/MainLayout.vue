<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="q-px-lg">
        <q-btn flat no-caps label="Curely" to="/" class="text-h5 text-weight-bolder" />

        <q-space />

        <div v-if="authStore.isAuthenticated" class="row items-center q-gutter-md">
          <q-btn flat icon="dashboard" label="Dashboard" to="/dashboard" rounded no-caps />

          <q-btn-dropdown flat rounded no-caps :label="authStore.user?.name || 'User'" icon="person">
            <q-list style="min-width: 150px">
              <q-item clickable v-ripple @click="handleLogout">
                <q-item-section side>
                  <q-icon name="logout" color="red" />
                </q-item-section>
                <q-item-section>
                  <div class="text-red">Logout</div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

        <div v-else class="q-gutter-sm">
          <q-btn flat label="Login" to="/login" rounded no-caps />
          <q-btn color="white" text-color="primary" label="Register" to="/register" rounded unelevated no-caps />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useAuthStore } from 'stores/auth-store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style>
.q-header {
  background: linear-gradient(90deg, #1976D2 0%, #0D47A1 100%) !important;
}
</style>
