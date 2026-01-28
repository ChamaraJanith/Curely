<template>
  <q-page class="flex flex-center bg-light-blue-1 hero-section">
    <div class="container text-center q-pa-md">
      <q-icon name="health_and_safety" size="100px" color="primary" class="q-mb-lg floating-icon" />

      <h1 class="text-h2 text-weight-bolder text-primary q-my-sm">Curely</h1>
      <p class="text-h5 text-blue-grey-8 q-mx-auto" style="max-width: 600px">
        Intelligent Medical Report Analysis. Track your health trends with AI-powered data extraction from PDFs.
      </p>

      <div class="q-mt-xl q-gutter-md">
        <q-btn
          v-if="!authStore.isAuthenticated"
          color="primary"
          size="xl"
          label="Join Curely Now"
          to="/register"
          rounded
          unelevated
          no-caps
          padding="15px 40px"
          class="shadow-5 pulse-btn"
        />
        <q-btn
          v-else
          color="primary"
          size="xl"
          label="View My Dashboard"
          to="/dashboard"
          rounded
          unelevated
          no-caps
          icon="analytics"
          padding="15px 40px"
          class="shadow-5"
        />
        <q-btn
          outline
          color="primary"
          size="xl"
          label="How it works"
          rounded
          no-caps
          padding="15px 40px"
        />
      </div>

      <div class="row q-col-gutter-lg q-mt-xl justify-center">
        <div class="col-12 col-sm-4" v-for="feature in features" :key="feature.title">
          <q-card flat class="bg-transparent text-center">
            <q-card-section>
              <q-icon :name="feature.icon" size="50px" color="primary" class="q-mb-md" />
              <div class="text-h6 text-weight-bold">{{ feature.title }}</div>
              <div class="text-body2 text-grey-8">{{ feature.desc }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useAuthStore } from 'stores/auth-store';

const authStore = useAuthStore();

const features = [
  { icon: 'auto_fix_high', title: 'Data Extraction', desc: 'Automatically reads Glucose and BP from PDF reports.' },
  { icon: 'insights', title: 'Health Trends', desc: 'Visualizes your data over time to track progress.' },
  { icon: 'security', title: 'Secure & Private', desc: 'Your reports are uniquely linked to your secure profile.' }
];
</script>

<style scoped>
.hero-section {
  background: radial-gradient(circle at top right, #e3f2fd, #ffffff);
}
.floating-icon {
  animation: floating 3s ease-in-out infinite;
}
@keyframes floating {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}
.pulse-btn {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
}
</style>
