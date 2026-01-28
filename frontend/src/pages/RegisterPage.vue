<template>
  <q-page class="flex flex-center bg-blue-grey-1">
    <q-card class="register-card shadow-24" style="width: 400px; border-radius: 20px;">
      <q-card-section class="text-center q-pt-xl">
        <div class="text-h4 text-primary text-weight-bolder">Create Account</div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">Join Curely Health Tracking</div>
      </q-card-section>

      <q-card-section class="q-pa-xl">
        <q-form @submit="handleSubmit" class="q-gutter-md">
           <q-input
            v-model="form.name"
            label="Full Name"
            outlined
            rounded
            required
            :rules="[val => !!val || 'Name is required']"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="form.email"
            label="Email Address"
            outlined
            rounded
            type="email"
            required
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
            :rules="[val => val.length >= 6 || 'Password must be at least 6 characters']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
          </q-input>

          <div class="q-mt-md">
            <q-btn
              label="Register"
              type="submit"
              color="primary"
              class="full-width text-weight-bold"
              size="lg"
              rounded
              :loading="authStore.loading"
              unelevated
            />
          </div>

          <div class="text-center q-mt-md">
            Already have an account?
            <router-link to="/login" class="text-primary text-weight-bold" style="text-decoration: none;">
              Login here
            </router-link>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from 'stores/auth-store';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();

const form = ref({
  name: '',
  email: '',
  password: ''
});

const handleSubmit = async () => {
  const success = await authStore.register(form.value);
  if (success) {
    $q.notify({
      color: 'positive',
      message: 'Registration successful! Please login.',
      position: 'top',
      icon: 'check'
    });
    router.push('/login');
  } else {
    $q.notify({
      color: 'negative',
      message: authStore.error || 'Registration failed',
      position: 'top',
      icon: 'error'
    });
  }
};
</script>

<style scoped>
.register-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
