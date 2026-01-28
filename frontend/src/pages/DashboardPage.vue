<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Upload Section -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="rounded-borders shadow-2">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6 text-weight-bold">Upload Medical Report</div>
            <div class="text-caption">The report will be linked to your profile</div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <q-uploader
              :url="uploadUrl"
              label="Select Health Report (PDF)"
              accept=".pdf"
              fieldName="file"
              :headers="uploadHeaders"
              @finish="onUploadFinish"
              @failed="onUploadFailed"
              auto-upload
              class="full-width"
              flat
              bordered
              style="border-radius: 12px"
            >
              <template v-slot:header="scope">
                <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
                  <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
                  <q-btn v-if="scope.canAddFiles" type="a" icon="add_box" @click="scope.pickFiles" round dense flat>
                    <q-uploader-add-trigger />
                  </q-btn>
                  <div class="col">
                    <div class="q-uploader__title">Upload Report</div>
                    <div class="q-uploader__subtitle">{{ scope.uploadSizeLabel }} / {{ scope.uploadProgressLabel }}</div>
                  </div>
                </div>
              </template>
            </q-uploader>
          </q-card-section>
        </q-card>
      </div>

      <!-- Chart Section -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="rounded-borders shadow-2">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6 text-weight-bold">Health Trends for {{ authStore.user?.name }}</div>
            <q-space />
            <q-btn flat icon="refresh" round @click="store.fetchReports" color="primary">
               <q-tooltip>Refresh Data</q-tooltip>
            </q-btn>
          </q-card-section>

          <q-card-section>
            <div v-if="store.loading && store.reports.length === 0" class="flex flex-center" style="min-height: 350px">
              <q-spinner-dots color="primary" size="4em" />
            </div>

            <apexchart
              v-else-if="store.reports.length > 0"
              width="100%"
              height="350"
              type="line"
              :options="chartOptions"
              :series="store.chartData.series"
            ></apexchart>

            <div v-else-if="store.error" class="text-center q-pa-xl">
              <q-icon name="error_outline" size="4em" color="negative" />
              <div class="text-h6 q-mt-md text-negative">{{ store.error }}</div>
              <q-btn unelevated color="primary" label="Retry" @click="store.fetchReports" class="q-mt-md" rounded />
            </div>

            <div v-else class="text-center q-pa-xl text-grey-6">
              <q-icon name="analytics" size="6em" class="q-mb-md opacity-2" />
              <div class="text-h5">No Analytics Data Yet</div>
              <p>Upload your first medical report to see your health progress.</p>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useReportStore } from 'stores/report-store';
import { useAuthStore } from 'stores/auth-store';
import { useQuasar } from 'quasar';

const store = useReportStore();
const authStore = useAuthStore();
const $q = useQuasar();

const uploadUrl = 'http://localhost:3000/upload';
const uploadHeaders = computed(() => ([
  { name: 'Authorization', value: `Bearer ${authStore.token}` }
]));

const chartOptions = computed(() => ({
  chart: {
    id: 'medical-chart',
    toolbar: { show: true },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    },
    fontFamily: 'Outfit, Roboto, Arial'
  },
  xaxis: {
    categories: store.chartData.categories || [],
    tooltip: { enabled: false }
  },
  stroke: {
    curve: 'smooth',
    width: 4
  },
  markers: {
    size: 6,
    hover: { size: 8 }
  },
  colors: ['#FF4560', '#008FFB', '#00E396'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 90, 100]
    }
  },
  grid: {
    borderColor: '#f1f1f1',
    padding: { bottom: 10 }
  },
  tooltip: {
    theme: 'dark',
    x: { format: 'DD MMM' }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right'
  }
}));

const onUploadFinish = () => {
  $q.notify({
    color: 'positive',
    message: 'Report analyzed and added to your profile!',
    position: 'top',
    icon: 'check_circle'
  });
  store.fetchReports();
};

const onUploadFailed = (info) => {
  let errorMessage = 'Upload failed';
  try {
    const response = JSON.parse(info.xhr.responseText);
    errorMessage = response.error || errorMessage;
  } catch {
    console.debug('No valid error response from server');
  }

  $q.notify({
    color: 'negative',
    message: errorMessage,
    position: 'top',
    icon: 'warning'
  });
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    store.fetchReports();
  }
});
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
.opacity-2 {
  opacity: 0.2;
}
</style>
