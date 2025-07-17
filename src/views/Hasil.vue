<script setup lang="js">
import HamsterLoader from '@/components/HamsterLoader.vue';
import { APIHasil } from '@/service/HasilService';
import { APISubKriteria } from '@/service/SubKriteriaService';
import { useUserStore } from '@/store/UserStore';
import { Column, Dialog, TreeTable, useToast } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';

const selectedCategory = ref('');
const listKategori = ref([]);
const listPlainDataToCalculate = ref([]);
const listTreeDataTable = ref([]);
const isLoading = ref(false);
const expandedKeys = ref({});
const activeView = ref('data'); // 'data', 'calculation', 'results'
const showResults = ref(false);
const subKriteriaLength = ref(0);
const saveModal = ref(false);
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const userStore = useUserStore();
const toast = useToast();
const listHasil = ref([]);
const showHasil = ref(false);
const temporaryId = ref('');
const deleteModal = ref(false);
const hasilDetail = ref({});
const detailHasilModal = ref(false);
const isDarkTheme = ref(false);

onMounted(() => {
    isLoading.value = true;
    try {
        getKategori();
        getSubKriteria();
        getAllDataToCalculate();
        getAllHasil();
        temporaryId.value = '';
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
    const response2 = await APISubKriteria.getSubKriteriLength();
    listTreeDataTable.value = response.data;
    subKriteriaLength.value = response2.data;
}

async function getAllDataToCalculate() {
    const response = await APIHasil.getAllDataToCalculate();
    listPlainDataToCalculate.value = response.data;
}

async function viewResult(id) {
    try {
        console.log('id ', id);
        console.log('hasilDetail.value ', hasilDetail.value);
        const response = await APIHasil.getDetailHasil({ _id: id });
        console.log('hasilDetail.value ', hasilDetail.value);
        hasilDetail.value = response.data;
        detailHasilModal.value = true;
        console.log("detailHasilModal.value ",detailHasilModal.value)
    } catch (error) {
        console.error(error);
    }
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
            if (d <= p) return (d - q) / (p - q);
            return 1;
        case 'Quasi':
            if (d <= q) return 0;
            return 1;
        case 'Level':
            if (d <= q) return 0;
            if (d <= p) return 0.5;
            return 1;
        case 'Linier Quasi':
            if (d <= q) return 0;
            if (d > p) return 1;
            return (d - q) / (p - q);
        case 'Gaussian':
            // if (d <= 0) return 0;
            return 1 - Math.exp(-(d * d) / (2 * s * s));
        default:
            return 0;
    }
};

// Calculate preference indices
// const preferenceIndices = computed(() => {
//     try {
//         const products = listPlainDataToCalculate.value;
//         const n = products.length;
//         const subKriteriaCount = subKriteriaLength.value;

//         return products.map((productI, i) => {
//             return products.map((productJ, j) => {
//                 if (i === j) return 0;

//                 let totalPreference = 0;
//                 let criteriaBreakdown = [];

//                 productI.bobot_produk.forEach((kriteria, kritIndex) => {
//                     let criteriaPreference = 0;

//                     kriteria.sub_kriteria.forEach((subKriteria) => {
//                         const subKriteriaJ = productJ.bobot_produk[kritIndex].sub_kriteria.find((sk) => sk.nama_sub_kriteria === subKriteria.nama_sub_kriteria);

//                         const d = parseFloat(subKriteria.nilai_bobot) - parseFloat(subKriteriaJ.nilai_bobot);

//                         const subPreference = calculatePreference(d, subKriteria.type, parseFloat(subKriteria.p), parseFloat(subKriteria.q), parseFloat(subKriteria.s));

//                         criteriaPreference += (1 / subKriteriaCount) * subPreference;

//                         criteriaBreakdown.push({
//                             subKriteria: subKriteria.nama_sub_kriteria,
//                             namaProduk: subKriteria.nama_bobot,
//                             nilaiProdukI: subKriteria.nilai_bobot,
//                             namaProdukJ: subKriteriaJ.nama_bobot,
//                             nilaiProdukJ: subKriteriaJ.nilai_bobot,
//                             d: d,
//                             subPreference: subPreference
//                         });
//                     });

//                     // eference: ${criteriaPreference}`);
//                     totalPreference += criteriaPreference;
//                 });

//                 return totalPreference;
//             });
//         });
//     } catch (error) {
//         console.error('Error umum pada preferenceIndices:', generalError);
//         toast.add({
//             severity: 'error',
//             summary: 'Error',
//             detail: 'Terjadi kesalahan saat memproses aksi, silahkan hubungi tim IT',
//             life: 3000
//         });
//         return [];
//     }
// });

const preferenceIndices = computed(() => {
    try {
        // Validasi data awal
        const products = listPlainDataToCalculate.value;

        if (!products || !Array.isArray(products)) {
            toast.add({
                severity: 'error',
                summary: 'Data Tidak Valid',
                detail: 'Data produk tidak ditemukan atau format tidak sesuai',
                life: 5000
            });
            activeView.value = 'data';
            showResults.value = false;
            return [];
        }

        if (products.length === 0) {
            toast.add({
                severity: 'warn',
                summary: 'Data Kosong',
                detail: 'Tidak ada produk untuk diproses',
                life: 5000
            });
            activeView.value = 'data';
            showResults.value = false;
            return [];
        }

        const subKriteriaCount = subKriteriaLength.value;
        if (!subKriteriaCount || subKriteriaCount <= 0) {
            toast.add({
                severity: 'error',
                summary: 'Konfigurasi Error',
                detail: 'Jumlah sub kriteria tidak valid',
                life: 5000
            });
            activeView.value = 'data';
            showResults.value = false;
            return [];
        }

        // Validasi struktur data sebelum pemrosesan
        const validationResult = validateProductsStructure(products);
        if (!validationResult.isValid) {
            toast.add({
                severity: 'error',
                summary: 'Tidak Berhasil Melakukan Perhitungan',
                detail: validationResult.message,
                life: 6000
            });
            activeView.value = 'data';
            showResults.value = false;
            return [];
        }

        // Jika semua validasi berhasil, lakukan perhitungan
        return products.map((productI, i) => {
            return products.map((productJ, j) => {
                if (i === j) return 0;

                let totalPreference = 0;
                let criteriaBreakdown = [];

                productI.bobot_produk.forEach((kriteria, kritIndex) => {
                    let criteriaPreference = 0;

                    kriteria.sub_kriteria.forEach((subKriteria) => {
                        const subKriteriaJ = productJ.bobot_produk[kritIndex].sub_kriteria.find((sk) => sk.nama_sub_kriteria === subKriteria.nama_sub_kriteria);

                        const d = parseFloat(subKriteria.nilai_bobot) - parseFloat(subKriteriaJ.nilai_bobot);
                        const subPreference = calculatePreference(d, subKriteria.type, parseFloat(subKriteria.p), parseFloat(subKriteria.q), parseFloat(subKriteria.s));

                        criteriaPreference += (1 / subKriteriaCount) * subPreference;

                        criteriaBreakdown.push({
                            subKriteria: subKriteria.nama_sub_kriteria,
                            namaProduk: subKriteria.nama_bobot,
                            nilaiProdukI: subKriteria.nilai_bobot,
                            namaProdukJ: subKriteriaJ.nama_bobot,
                            nilaiProdukJ: subKriteriaJ.nilai_bobot,
                            d: d,
                            subPreference: subPreference
                        });
                    });

                    totalPreference += criteriaPreference;
                });

                return totalPreference;
            });
        });
    } catch (error) {
        console.error('Error dalam preferenceIndices:', error);
        toast.add({
            severity: 'error',
            summary: 'Sistem Error',
            detail: 'Terjadi kesalahan sistem saat memproses data. Silahkan hubungi tim IT',
            life: 6000
        });
        return [];
    }
});

// Fungsi helper untuk validasi struktur data
function validateProductsStructure(products) {
    try {
        for (let i = 0; i < products.length; i++) {
            const product = products[i];

            // Validasi struktur produk
            if (!product || typeof product !== 'object') {
                return {
                    isValid: false,
                    message: `Produk ke-${i + 1} memiliki struktur yang tidak valid`
                };
            }

            // Validasi bobot_produk
            if (!product.bobot_produk || !Array.isArray(product.bobot_produk)) {
                return {
                    isValid: false,
                    message: `Produk ke-${i + 1} tidak memiliki data bobot produk yang valid`
                };
            }

            if (product.bobot_produk.length === 0) {
                return {
                    isValid: false,
                    message: `Produk ke-${i + 1} tidak memiliki kriteria penilaian`
                };
            }

            // Validasi setiap kriteria
            for (let j = 0; j < product.bobot_produk.length; j++) {
                const kriteria = product.bobot_produk[j];

                if (!kriteria || typeof kriteria !== 'object') {
                    return {
                        isValid: false,
                        message: `Kriteria ke-${j + 1} pada produk ke-${i + 1} tidak valid`
                    };
                }

                // Validasi sub_kriteria
                if (!kriteria.sub_kriteria || !Array.isArray(kriteria.sub_kriteria)) {
                    return {
                        isValid: false,
                        message: `Sub kriteria pada kriteria ke-${j + 1}, produk ke-${i + 1} tidak valid`
                    };
                }

                if (kriteria.sub_kriteria.length === 0) {
                    return {
                        isValid: false,
                        message: `Sub kriteria pada kriteria ke-${j + 1}, produk ke-${i + 1} tidak boleh kosong`
                    };
                }

                // Validasi setiap sub kriteria
                for (let k = 0; k < kriteria.sub_kriteria.length; k++) {
                    const subKriteria = kriteria.sub_kriteria[k];

                    if (!subKriteria || typeof subKriteria !== 'object') {
                        return {
                            isValid: false,
                            message: `Sub kriteria ke-${k + 1} pada kriteria ke-${j + 1}, produk ke-${i + 1} tidak valid`
                        };
                    }

                    // Validasi field wajib
                    if (!subKriteria.nama_sub_kriteria) {
                        return {
                            isValid: false,
                            message: `Nama sub kriteria tidak ditemukan pada kriteria ke-${j + 1}, produk ke-${i + 1}`
                        };
                    }

                    // Validasi nilai_bobot
                    if (subKriteria.nilai_bobot === null || subKriteria.nilai_bobot === undefined) {
                        return {
                            isValid: false,
                            message: `Nilai bobot tidak ditemukan untuk sub kriteria '${subKriteria.nama_sub_kriteria}' pada produk ke-${i + 1}`
                        };
                    }

                    const nilaiBobot = parseFloat(subKriteria.nilai_bobot);
                    if (isNaN(nilaiBobot)) {
                        return {
                            isValid: false,
                            message: `Nilai bobot tidak valid untuk sub kriteria '${subKriteria.nama_sub_kriteria}' pada produk ke-${i + 1}`
                        };
                    }

                    // Validasi parameter p, q, s
                    if (subKriteria.p === null || subKriteria.p === undefined || isNaN(parseFloat(subKriteria.p))) {
                        return {
                            isValid: false,
                            message: `Parameter 'p' tidak valid untuk sub kriteria '${subKriteria.nama_sub_kriteria}' pada produk ke-${i + 1}`
                        };
                    }

                    if (subKriteria.q === null || subKriteria.q === undefined || isNaN(parseFloat(subKriteria.q))) {
                        return {
                            isValid: false,
                            message: `Parameter 'q' tidak valid untuk sub kriteria '${subKriteria.nama_sub_kriteria}' pada produk ke-${i + 1}`
                        };
                    }

                    if (subKriteria.s === null || subKriteria.s === undefined || isNaN(parseFloat(subKriteria.s))) {
                        return {
                            isValid: false,
                            message: `Parameter 's' tidak valid untuk sub kriteria '${subKriteria.nama_sub_kriteria}' pada produk ke-${i + 1}`
                        };
                    }

                    // Validasi type
                    if (!subKriteria.type || typeof subKriteria.type !== 'string') {
                        return {
                            isValid: false,
                            message: `Tipe sub kriteria tidak valid untuk '${subKriteria.nama_sub_kriteria}' pada produk ke-${i + 1}`
                        };
                    }
                }
            }
        }

        // Validasi konsistensi antar produk
        const consistencyResult = validateProductsConsistency(products);
        if (!consistencyResult.isValid) {
            return consistencyResult;
        }

        return { isValid: true };
    } catch (error) {
        console.error('Error dalam validasi struktur:', error);
        return {
            isValid: false,
            message: 'Terjadi kesalahan saat memvalidasi struktur data'
        };
    }
}

// Fungsi helper untuk validasi konsistensi antar produk
function validateProductsConsistency(products) {
    try {
        if (products.length < 2) return { isValid: true };

        const baseProduct = products[0];
        const baseKriteriaCount = baseProduct.bobot_produk.length;

        for (let i = 1; i < products.length; i++) {
            const currentProduct = products[i];

            // Validasi jumlah kriteria sama
            if (currentProduct.bobot_produk.length !== baseKriteriaCount) {
                return {
                    isValid: false,
                    message: `Terdapat produk yang memiliki jumlah kriteria yang berbeda`
                };
            }

            // Validasi konsistensi setiap kriteria
            for (let j = 0; j < baseKriteriaCount; j++) {
                const baseKriteria = baseProduct.bobot_produk[j];
                const currentKriteria = currentProduct.bobot_produk[j];

                if (baseKriteria.sub_kriteria.length !== currentKriteria.sub_kriteria.length) {
                    return {
                        isValid: false,
                        message: `Produk ke-${i + 1} memiliki jumlah sub kriteria yang berbeda pada kriteria ke-${j + 1}`
                    };
                }

                // Validasi nama sub kriteria konsisten
                for (let k = 0; k < baseKriteria.sub_kriteria.length; k++) {
                    const baseSubKriteria = baseKriteria.sub_kriteria[k];
                    const matchingSubKriteria = currentKriteria.sub_kriteria.find((sk) => sk.nama_sub_kriteria === baseSubKriteria.nama_sub_kriteria);

                    if (!matchingSubKriteria) {
                        return {
                            isValid: false,
                            message: `Sub kriteria '${baseSubKriteria.nama_sub_kriteria}' tidak ditemukan pada produk ke-${i + 1}, kriteria ke-${j + 1}`
                        };
                    }
                }
            }
        }

        return { isValid: true };
    } catch (error) {
        console.error('Error dalam validasi konsistensi:', error);
        return {
            isValid: false,
            message: 'Terjadi kesalahan saat memvalidasi konsistensi data'
        };
    }
}

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
    temporaryId.value = '';
};

const groupedNormalizedData = computed(() => {
    const grouped = {};
    normalizedData.value.forEach((product) => {
        if (!grouped[product.kategori]) {
            grouped[product.kategori] = [];
        }
        grouped[product.kategori].push(product);
    });
    return grouped;
});

function showSaveModal() {
    saveModal.value = true;
}

async function saveHasil() {
    isLoading.value = true;
    const timestamp = new Date();
    const dataMounth = MONTHS[timestamp.getMonth()];

    // Buat objek Date dari timestamp
    const date = new Date(timestamp);

    // Ambil komponen waktu dan tanggal
    const hours = String(date.getHours()).padStart(2, '0'); // Jam (2 digit)
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Menit (2 digit)
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Detik (2 digit)
    const day = String(date.getDate()).padStart(2, '0'); // Tanggal (2 digit)
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan (2 digit, dimulai dari 0)
    const year = date.getFullYear(); // Tahun

    // Format ke dalam hh:mm:ss dd/mm/yyyy
    const formattedDate = `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;

    const listData = ranking.value.map((item, index) => {
        return {
            rank: index + 1,
            product: item.product,
            kategori: item.kategori,
            netFlow: item.netFlow
        };
    });

    const data = {
        create_by: userStore.name,
        create_date: formattedDate,
        month: dataMounth,
        data: listData
    };
    try {
        await APIHasil.addhasil(data).then(() => {
            saveModal.value = false;
            isLoading.value = false;
            resetCalculation();
            toast.add({ severity: 'success', summary: 'Success', detail: 'Berhasil menyimpan hasil perhitungan', life: 3000 });
            etAllHasil();
        });
    } catch (error) {
        console.error(error);
        saveModal.value = false;
        isLoading.value = false;
        toast.add({ severity: 'error', summary: 'Error', detail: `Gagal menyimpan hasil perhitungan, ${error.response.data.message}`, life: 3000 });
    }
}

async function getAllHasil() {
    const response = await APIHasil.getAllHasil();
    const listData = response.data;
    listData.map((item) => {
        item.create_date = new Date(item.create_date).toLocaleDateString();
        item.data = item.data.length;
        item.month = item.month;
        item.create_by = item.create_by;
    });
    listHasil.value = listData;
    console.log('listHasil ', listHasil.value);
}

function back() {
    activeView.value = 'calculation';
}

function showTableHasil() {
    showHasil.value = true;
}

function confirmDelete(id) {
    temporaryId.value = id;
    deleteModal.value = true;
}

async function deleteDataHasil() {
    isLoading.value = true;
    try {
        await APIHasil.deleteHasil({ _id: temporaryId.value }).then(() => {
            getAllHasil();
            isLoading.value = false;
            deleteModal.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: 'Berhasil menghapus data', life: 3000 });
        });
    } catch (error) {
        console.error(error);
        isLoading.value = false;
        deleteModal.value = false;
        toast.add({ severity: 'error', summary: 'Error', detail: `Gagal menghapus data, ${error.response.data.message}`, life: 3000 });
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

function getColorClass(netFlow) {
    if (isDarkTheme.value) {
        if (netFlow > 0) return 'bg-green-100 text-green-800';
        return 'bg-red-100 text-red-800';
    } else {
        if (netFlow > 0) return 'bg-green-100 text-green-800';
        return 'bg-red-100 text-red-800';
    }
}
</script>
<template>
    <HamsterLoader :is-loading="isLoading" />
    <div class="container mx-auto p-4">
        <div class="mb-8">
            <div class="flex items-center mb-4">
                <h1 class="text-2xl font-bold">Hasil Perhitungan Menggunakan PROMETHEE</h1>
            </div>

            <div class="flex justify-between mb-4">
                <div>
                    <button
                        v-if="showResults"
                        @click="resetCalculation"
                        class="px-6 py-2 bg-red-600 text-white rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        :disabled="activeView === 'results'"
                    >
                        <span class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fill-rule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            Reset
                        </span>
                    </button>
                </div>
                <div class="space-x-4 flex items-center">
                    <button
                        @click="startCalculation"
                        class="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                        v-if="activeView === 'data' && !showHasil"
                    >
                        <span class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
                            </svg>
                            Mulai Perhitungan
                        </span>
                    </button>

                    <button
                        @click="showHasil = false"
                        class="px-6 py-2 bg-teal-600 text-white rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                        v-if="activeView === 'data' && showHasil"
                    >
                        <span class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-11.707a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414l-3-3z" clip-rule="evenodd" />
                            </svg>
                            Kembali
                        </span>
                    </button>

                    <button
                        @click="showTableHasil"
                        class="px-6 py-2 bg-cyan-600 text-white rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
                        v-if="activeView === 'data'"
                    >
                        <span class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path
                                    fill-rule="evenodd"
                                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            List Hasil
                        </span>
                    </button>

                    <button
                        @click="back"
                        class="px-6 py-2 bg-slate-600 text-white rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50"
                        v-if="activeView === 'results'"
                    >
                        <span class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-11.707a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414l-3-3z" clip-rule="evenodd" />
                            </svg>
                            Back
                        </span>
                    </button>

                    <button
                        v-if="showResults"
                        @click="showFinalResults"
                        class="px-6 py-2 bg-sky-600 text-white rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
                        :disabled="activeView === 'results'"
                    >
                        <span class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                            Lihat Hasil Akhir
                        </span>
                    </button>

                    <button
                        v-if="showResults"
                        @click="showSaveModal"
                        class="px-6 py-2 bg-emerald-600 text-white rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
                    >
                        <span class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                                <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                            </svg>
                            Simpan
                        </span>
                    </button>
                </div>
            </div>

            <!-- Data View -->
            <div v-if="activeView === 'data' && !showHasil" class="mb-6 bg-white p-4 rounded-lg shadow">
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
            <div v-if="activeView === 'calculation' && !showHasil" class="space-y-6">
                <!-- Normalized Data -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h2 class="text-xl font-semibold mb-3">1. Data Ternormalisasi</h2>
                    <div v-for="(products, category) in groupedNormalizedData" :key="category" class="mb-6">
                        <h3 class="text-lg font-medium text-gray-700 mb-2">Kategori: {{ category }}</h3>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                                        <th v-for="(criterion, index) in products[0]?.criteria" :key="index" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div>{{ criterion.kriteria }}</div>
                                            <div class="text-xs text-gray-400 font-normal">{{ criterion.min_max }} | {{ criterion.type }}</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="(product, index) in products" :key="index" :class="{ 'bg-gray-50': index % 2 === 0 }">
                                        <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-700">
                                            {{ product.produk }}
                                        </td>
                                        <td v-for="(criterion, cIndex) in product.criteria" :key="cIndex" class="px-6 py-4 whitespace-nowrap text-gray-600">
                                            <span class="inline-block min-w-[60px] text-right">
                                                {{ criterion.value.toFixed(2) }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
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
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leaving Flow</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entering Flow</th>
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
            <div v-if="activeView === 'results' && !showHasil" class="bg-white p-4 rounded-lg shadow">
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
    <div v-if="showHasil">
        <DataTable :value="listHasil" tableStyle="min-width: 50rem">
            <Column field="create_by" header="Dibuat Oleh"></Column>
            <Column field="create_date" header="Tanggal"></Column>
            <Column field="month" header="Bulan"></Column>
            <Column field="data" header="Jumlah Data"></Column>
            <Column header="Aksi">
                <template #body="{ data }">
                    <div class="flex gap-2">
                        <Button label="Lihat Hasil" icon="pi pi-eye" class="p-button-rounded p-button-info p-button-sm" @click="viewResult(data._id)" />
                        <Button v-if="userStore.role === 'admin'" label="Delete" icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" @click="confirmDelete(data._id)" />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
    <Dialog modal header="Simpan Hasil" :visible="saveModal" @hide="saveModal = false">
        <p>Apakah anda yakin ingin menyimpan hasil perhitungan ini?</p>
        <template #footer>
            <Button label="Batal" icon="pi pi-times" class="p-button-text" @click="saveModal = false" />
            <Button label="Simpan" icon="pi pi-check" class="p-button-text" @click="saveHasil" />
        </template>
    </Dialog>

    <Dialog modal header="Simpan Hasil" :visible="deleteModal">
        <p>Apakah anda yakin ingin menghapus hasil perhitungan ini?</p>
        <template #footer>
            <Button label="Batal" icon="pi pi-times" class="p-button-text" @click="deleteModal = false" />
            <Button label="Hapus" icon="pi pi-trash" class="p-button-text" @click="deleteDataHasil" />
        </template>
    </Dialog>

    <Dialog modal header="Hasil Perhitungan" v-model:visible="detailHasilModal" closeable="true" :style="{width: '80vw', maxWidth: '800px'}" @hide="detailHasilModal = false">
        <div class="mt-6">
            <div class="flex justify-between mb-4 flex-col ">
                <h3 :class="['text-lg font-semibold', isDarkTheme ? 'text-white' : 'text-gray-800']">Top Ranking Produk {{ hasilDetail.month }} {{ new Date().getFullYear() }}</h3>
                <div :class="isDarkTheme ? 'text-gray-300' : 'text-gray-500'" class="text-sm">Dibuat oleh: {{ hasilDetail.create_by }}  ({{ hasilDetail.create_date }})</div>
            </div>

            <div :class="['rounded-xl p-4 mb-6 transition-colors', isDarkTheme ? 'bg-gray-700' : 'surface-card']">
                <div class="overflow-x-auto">
                    <DataTable :value="hasilDetail.data" responsiveLayout="scroll" class="p-datatable-sm" stripedRows>
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
    </Dialog>
</template>
