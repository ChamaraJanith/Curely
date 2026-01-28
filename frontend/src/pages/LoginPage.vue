<template>
  <q-page class="flex flex-center bg-blue-grey-1">
    <q-card class="login-card shadow-24" style="width: 400px; border-radius: 20px;">
      <q-card-section class="text-center q-pt-xl">
        <div class="text-h4 text-primary text-weight-bolder">Welcome Back</div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">Login to your Curely account</div>
      </q-card-section>

      <q-card-section class="q-pa-xl">
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.email"
            label="Email Address"
            outlined
            rounded
            type="email"
            required
            lazy-rules
            :rules="[val => !!val || 'Email is required']"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="form.password"
            label="Password"
            outlined
            rounded
            type="password"
            required
            :rules="[val => !!val || 'Password is required']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
          </q-input>

          <div class="q-mt-md">
            <q-btn
              label="Login"
              type="submit"
              color="primary"
              class="full-width text-weight-bold"
              size="lg"
              rounded
              :loading="authStore.loading"
              unelevated
            />
          </div>

          <div class="row items-center q-mt-md">
            <q-separator col-grow />
            <div class="q-px-sm text-grey-7">OR</div>
            <q-separator col-grow />
          </div>

          <div class="flex flex-center q-mt-md">
            <div id="google-login-btn"></div>
          </div>


          <div class="text-center q-mt-md">
            Don't have an account?
            <router-link to="/register" class="text-primary text-weight-bold" style="text-decoration: none;">
              Register here
            </router-link>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from 'stores/auth-store';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();

const form = ref({
  email: '',
  password: ''
});

const handleGoogleLogin = async (response) => {
  const success = await authStore.googleLogin(response.credential);
  if (success) {
    $q.notify({
      color: 'positive',
      message: 'Google Login successful!',
      position: 'top',
      icon: 'check'
    });
    router.push('/dashboard');
  } else {
    $q.notify({
      color: 'negative',
      message: authStore.error || 'Google Login failed',
      position: 'top',
      icon: 'error'
    });
  }
};

onMounted(() => {
  /* global google */
  if (typeof google !== 'undefined') {
    google.accounts.id.initialize({
      client_id: '820693173895-c29oqftjdl64hngn7o07bidlm4ge4vk0.apps.googleusercontent.com',
      callback: handleGoogleLogin
    });
    google.accounts.id.renderButton(
      document.getElementById('google-login-btn'),
      { theme: 'outline', size: 'large', shape: 'pill', width: 320 }
    );
  }
});


const handleSubmit = async () => {
  const success = await authStore.login(form.value);
  if (success) {
    $q.notify({
      color: 'positive',
      message: 'Login successful!',
      position: 'top',
      icon: 'check'
    });
    router.push('/');
  } else {
    $q.notify({
      color: 'negative',
      message: authStore.error || 'Login failed',
      position: 'top',
      icon: 'error'
    });
  }
};
</script>

<style scoped>
.login-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
