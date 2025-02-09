<script setup lang="js">
import HamsterLoader from '@/components/HamsterLoader.vue';
import { APIHasil } from '@/service/HasilService';
import { APISubKriteria } from '@/service/SubKriteriaService';
import { Column, TreeTable } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';

// const selectedCategory = ref('');
// const listKategori = ref([]);
// const listPlainDataToCalculate = ref([]);
// const listTreeDataTable = ref([]);
// const isLoading = ref(false);
// const expandedKeys = ref({});
const selectedCategory = ref('');
const listKategori = ref([]);
const listPlainDataToCalculate = ref([]);
const listTreeDataTable = ref([]);
const isLoading = ref(false);
const expandedKeys = ref({});
const activeView = ref('data'); // 'data', 'calculation', 'results'
const showResults = ref(false);

onMounted(() => {
    isLoading.value = true;
    try {
        getKategori();
        getSubKriteria();
        getAllDataToCalculate();
    } catch (error) {
        console.error(error);
    }
    isLoading.value = false;
});

async function getKategori() {
    const response = await APIHasil.getKategori();
    listKategori.value = response.data;
}

async function getSubKriteria() {
    const response = await APISubKriteria.getAllSubKriteria();
    listTreeDataTable.value = response.data;
}

async function getAllDataToCalculate() {
    const response = await APIHasil.getAllDataToCalculate();
    listPlainDataToCalculate.value = response.data;
    console.log(listPlainDataToCalculate.value);
}

const expandAll = () => {
    const keys = {};
    const expandNode = (nodes) => {
        if (nodes) {
            nodes.forEach((node) => {
                keys[node.key] = true;
                if (node.children) {
                    expandNode(node.children);
                }
            });
        }
    };
    expandNode(listTreeDataTable.value);
    expandedKeys.value = keys;
};

// Call expandAll whenever data changes
watch(
    () => listTreeDataTable.value,
    () => {
        expandAll();
    },
    { immediate: true }
);

//calculate data using metode promethee
// Computed property to get normalized data
// const normalizedData = computed(() => {
//     if (!listPlainDataToCalculate.value.length) return [];

//     return listPlainDataToCalculate.value.map((product) => {
//         return {
//             id_produk: product.id_produk,
//             produk: product.produk,
//             kategori: product.kategori,
//             criteria: product.bobot_produk.map((criterion) => {
//                 return {
//                     id_kriteria: criterion.id_kriteria,
//                     kriteria: criterion.kriteria,
//                     value: parseFloat(criterion.sub_kriteria[0].nilai_bobot),
//                     min_max: criterion.sub_kriteria[0].min_max,
//                     type: criterion.sub_kriteria[0].type,
//                     p: parseFloat(criterion.sub_kriteria[0].p),
//                     q: parseFloat(criterion.sub_kriteria[0].q),
//                     s: parseFloat(criterion.sub_kriteria[0].s)
//                 };
//             })
//         };
//     });
// });

const normalizedData = computed(() => {
    if (!listPlainDataToCalculate.value.length) return [];

    return listPlainDataToCalculate.value.map((product) => {
        return {
            id_produk: product.id_produk,
            produk: product.produk,
            kategori: product.kategori,
            criteria: product.bobot_produk.map((criterion) => {
                return {
                    id_kriteria: criterion.id_kriteria,
                    kriteria: criterion.kriteria,
                    value: parseFloat(criterion.sub_kriteria[0].nilai_bobot),
                    min_max: criterion.sub_kriteria[0].min_max,
                    type: criterion.sub_kriteria[0].type,
                    p: parseFloat(criterion.sub_kriteria[0].p),
                    q: parseFloat(criterion.sub_kriteria[0].q),
                    s: parseFloat(criterion.sub_kriteria[0].s)
                };
            })
        };
    });
});

// Calculate preference function based on type
const calculatePreference = (d, type, p, q, s) => {
    switch (type) {
        case 'Usual':
            return d <= 0 ? 0 : 1;
        case 'Linear':
            if (d <= 0) return 0;
            if (d > p) return 1;
            return d / p;
        case 'Quasi':
            if (d <= q) return 0;
            return 1;
        case 'Level':
            if (d <= q) return 0;
            if (d > p) return 1;
            return 0.5;
        case 'Linear with indifference':
            if (d <= q) return 0;
            if (d > p) return 1;
            return (d - q) / (p - q);
        case 'Gaussian':
            if (d <= 0) return 0;
            return 1 - Math.exp(-(d * d) / (2 * s * s));
        default:
            return 0;
    }
};

// Calculate preference indices
const preferenceIndices = computed(() => {
    const products = normalizedData.value;
    const n = products.length;
    const indices = Array(n)
        .fill()
        .map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                let sum = 0;
                const criteriaCount = products[i].criteria.length;

                products[i].criteria.forEach((criterion, k) => {
                    const d = criterion.min_max === 'max' ? criterion.value - products[j].criteria[k].value : products[j].criteria[k].value - criterion.value;

                    const pref = calculatePreference(d, criterion.type, criterion.p, criterion.q, criterion.s);

                    sum += pref / criteriaCount;
                });

                indices[i][j] = sum;
            }
        }
    }

    return indices;
});

// Calculate positive and negative flows
const flows = computed(() => {
    const indices = preferenceIndices.value;
    const n = indices.length;

    return normalizedData.value.map((product, i) => {
        let positiveFlow = 0;
        let negativeFlow = 0;

        for (let j = 0; j < n; j++) {
            if (i !== j) {
                positiveFlow += indices[i][j];
                negativeFlow += indices[j][i];
            }
        }

        positiveFlow /= n - 1;
        negativeFlow /= n - 1;

        return {
            product: product.produk,
            kategori: product.kategori,
            positiveFlow,
            negativeFlow,
            netFlow: positiveFlow - negativeFlow
        };
    });
});

// Sort products by net flow (final ranking)
const ranking = computed(() => {
    return [...flows.value].sort((a, b) => b.netFlow - a.netFlow);
});

const startCalculation = () => {
    activeView.value = 'calculation';
    showResults.value = true;
};

const showFinalResults = () => {
    activeView.value = 'results';
};

const resetCalculation = () => {
    activeView.value = 'data';
    showResults.value = false;
};
</script>
<template>
    <HamsterLoader :is-loading="isLoading" />
    <div class="container mx-auto p-4">
        <div class="mb-8">
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-2xl font-bold">Hasil Perhitungan Menggunakan PROMETHEE</h1>
                <div class="space-x-4">
                    <button @click="startCalculation" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" :disabled="activeView !== 'data'">Mulai Perhitungan</button>
                    <button v-if="showResults" @click="showFinalResults" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" :disabled="activeView === 'results'">Lihat Hasil Akhir</button>
                    <button v-if="showResults" @click="resetCalculation" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Reset</button>
                </div>
            </div>

            <!-- Data View -->
            <div v-if="activeView === 'data'" class="mb-6 bg-white p-4 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-3">Tabel Normalisasi Bobot Kriteria</h2>
                <div class="overflow-x-auto">
                    <TreeTable :value="listTreeDataTable" :expandedKeys="expandedKeys" :tableStyle="{ minWidth: '60rem' }">
                        <Column field="name" header="Nama Kriteria" expander></Column>
                        <Column field="type" header="Type"></Column>
                        <Column field="min_max" header="Min_Max"></Column>
                        <Column field="p" header="P"></Column>
                        <Column field="q" header="Q"></Column>
                        <Column field="s" header="S"></Column>
                    </TreeTable>
                </div>
            </div>

            <!-- Calculation Process View -->
            <div v-if="activeView === 'calculation'" class="space-y-6">
                <!-- Normalized Data -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h2 class="text-xl font-semibold mb-3">1. Data Ternormalisasi</h2>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                                    <th v-for="(criterion, index) in normalizedData[0]?.criteria" :key="index" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {{ criterion.kriteria }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-for="(product, index) in normalizedData" :key="index">
                                    <td class="px-6 py-4 whitespace-nowrap">{{ product.produk }}</td>
                                    <td v-for="(criterion, cIndex) in product.criteria" :key="cIndex" class="px-6 py-4 whitespace-nowrap">
                                        {{ criterion.value }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Preference Indices -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h2 class="text-xl font-semibold mb-3">2. Indeks Preferensi</h2>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th v-for="(product, index) in normalizedData" :key="index" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {{ product.produk }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-for="(indices, i) in preferenceIndices" :key="i">
                                    <td class="px-6 py-4 whitespace-nowrap">{{ normalizedData[i].produk }}</td>
                                    <td v-for="(value, j) in indices" :key="j" class="px-6 py-4 whitespace-nowrap">
                                        {{ value.toFixed(4) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Flows -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h2 class="text-xl font-semibold mb-3">3. Perhitungan Flow</h2>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Positive Flow</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Negative Flow</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Flow</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-for="(flow, index) in flows" :key="index">
                                    <td class="px-6 py-4 whitespace-nowrap">{{ flow.product }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ flow.positiveFlow.toFixed(4) }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ flow.negativeFlow.toFixed(4) }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">{{ flow.netFlow.toFixed(4) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Final Results View -->
            <div v-if="activeView === 'results'" class="bg-white p-4 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-3">Hasil Akhir Perankingan</h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Flow</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="(item, index) in ranking" :key="index">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    {{ index + 1 }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    {{ item.product }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    {{ item.kategori }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    {{ item.netFlow.toFixed(4) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
