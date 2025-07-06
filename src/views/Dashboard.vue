<script setup lang="js">
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
import HamsterLoader from '@/components/HamsterLoader.vue';
import { useLayout } from '@/layout/composables/layout'; // Import the useLayout function
import { APIHasil } from '@/service/HasilService';
import { APIUser } from '@/service/UserService';
import { useUserStore } from '@/store/UserStore';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();
const isLoading = ref(false);
const hasil = ref({});
const showAllData = ref(false);
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// Use the layout composable
const { isDarkTheme, toggleDarkMode } = useLayout();

onMounted(async () => {
    isLoading.value = true;
    try {
        const user = await APIUser.getUser();
        if (user) {
            userStore.loginIn(user.data.email, user.data.name, user.data.role, true);
            getHasil();
        } else {
            router.push('/login');
        }
    } catch (error) {
        console.error(error);
    }
    isLoading.value = false;
});

async function getHasil() {
    isLoading.value = true;
    try {
        const date = new Date();
        const month = MONTHS[date.getMonth()];
        const response = await APIHasil.getHasilByMonth({ month: month });
        hasil.value = response.data;
        console.log(hasil.value);
    } catch (error) {
        console.error(error);
    }
    isLoading.value = false;
}

function toggleShowAll() {
    showAllData.value = !showAllData.value;
}

function getColorClass(netFlow) {
    if (isDarkTheme.value) {
        if (netFlow > 0) return 'bg-green-100 text-green-800';
        return 'bg-red-100 text-red-800';
    } else {
        if (netFlow > 0) return 'bg-green-100 text-green-800';
        return 'bg-red-100 text-red-800';
    }
}

function getCategoryColorClass(category) {
    if (isDarkTheme.value) {
        switch (category) {
            case 'Seafood':
                return 'bg-blue-900 text-blue-200';
            case 'Sosis':
                return 'bg-red-900 text-red-200';
            case 'Nugget':
                return 'bg-yellow-900 text-yellow-200';
            case 'Bakso':
                return 'bg-green-900 text-green-200';
            case 'Kentang':
                return 'bg-purple-900 text-purple-200';
            default:
                return 'bg-gray-900 text-gray-200';
        }
    } else {
        switch (category) {
            case 'Seafood':
                return 'bg-blue-100 text-blue-800';
            case 'Sosis':
                return 'bg-red-100 text-red-800';
            case 'Nugget':
                return 'bg-yellow-100 text-yellow-800';
            case 'Bakso':
                return 'bg-green-100 text-green-800';
            case 'Kentang':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }
}
</script>

<template>
    <HamsterLoader :is-loading="isLoading" />
    <div class="grid grid-cols-12 gap-8">
        <StatsWidget />

        <div class="col-span-12">
            <div :class="['card p-6 rounded-2xl shadow-lg transition-colors', isDarkTheme ? 'bg-gray-800' : 'bg-white']">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold mb-0 text-center md:text-left">Sistem Penunjang Keputusan dengan Metode PROMETHEE</h2>
                </div>

                <p :class="['leading-relaxed mb-6 text-justify', isDarkTheme ? 'text-gray-300' : 'text-gray-600']">
                    Sistem Penunjang Keputusan (SPK) adalah sebuah sistem berbasis komputer yang dirancang untuk membantu proses pengambilan keputusan, terutama dalam situasi yang kompleks dan memerlukan analisis multi-kriteria. Salah satu metode
                    populer dalam SPK adalah <strong>PROMETHEE</strong> (*Preference Ranking Organization Method for Enrichment Evaluation*).
                </p>

                <!-- Result Section -->
                <div v-if="hasil.data" class="mt-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 :class="['text-lg font-semibold', isDarkTheme ? 'text-white' : 'text-gray-800']">Top Ranking Produk {{ hasil.month }} {{ new Date().getFullYear() }}</h3>
                        <div :class="isDarkTheme ? 'text-gray-300' : 'text-gray-500'" class="text-sm">Dibuat oleh: {{ hasil.create_by }} ({{ hasil.create_date }})</div>
                    </div>

                    <!-- Top 5 Results Card -->
                    <div :class="['rounded-xl p-4 mb-6 transition-colors', isDarkTheme ? 'bg-gray-700' : 'surface-card']">
                        <div class="overflow-x-auto">
                            <DataTable :value="showAllData ? hasil.data : hasil.data.slice(0, 5)" responsiveLayout="scroll" class="p-datatable-sm" stripedRows>
                                <Column field="rank" header="Rank">
                                    <template #body="slotProps">
                                        <span :class="isDarkTheme ? 'text-white' : ''">{{ slotProps.data.rank }}</span>
                                    </template>
                                </Column>
                                <Column field="product" header="Produk">
                                    <template #body="slotProps">
                                        <span :class="isDarkTheme ? 'text-white' : ''">{{ slotProps.data.product }}</span>
                                    </template>
                                </Column>
                                <Column field="kategori" header="Kategori">
                                    <template #body="slotProps">
                                        <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getCategoryColorClass(slotProps.data.kategori)">{{ slotProps.data.kategori }}</span>
                                    </template>
                                </Column>
                                <Column field="netFlow" header="Net Flow">
                                    <template #body="slotProps">
                                        <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getColorClass(slotProps.data.netFlow)" severity="info">
                                            {{ slotProps.data.netFlow.toFixed(4) }}
                                        </span>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>

                        <!-- Show All/Show Less Button -->
                        <div class="mt-4 text-center">
                            <Button @click="toggleShowAll" :label="showAllData ? 'Lihat Top 5' : 'Lihat Semua Data'" class="p-button-sm" />
                        </div>
                    </div>

                    <!-- Legend -->
                    <div :class="['mt-4 p-4 rounded-lg transition-colors card', isDarkTheme ? 'bg-gray-700' : 'bg-white']">
                        <h4 :class="isDarkTheme ? 'text-gray-200' : 'text-gray-700'" class="text-sm font-medium mb-2">Kategori Produk:</h4>
                        <div class="flex flex-wrap gap-2">
                            <span :class="getCategoryColorClass('Seafood')">Seafood</span>
                            <span :class="getCategoryColorClass('Sosis')">Sosis</span>
                            <span :class="getCategoryColorClass('Nugget')">Nugget</span>
                            <span :class="getCategoryColorClass('Bakso')">Bakso</span>
                            <span :class="getCategoryColorClass('Kentang')">Kentang</span>
                        </div>
                    </div>
                </div>

                <!-- No Data State -->
                <div v-else :class="isDarkTheme ? 'text-gray-400' : 'text-gray-500'" class="text-center py-8">
                    <div class="mb-4">
                        <i class="pi pi-inbox text-4xl"></i>
                    </div>
                    <p>Data hasil perhitungan belum tersedia pada bulan {{ month }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
