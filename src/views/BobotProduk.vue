<script setup lang="js">
import HamsterLoader from '@/components/HamsterLoader.vue';
import { APIBobotProduk } from '@/service/BobotProdukService';
import { APIBobotSubKriteria } from '@/service/BobotSubKriteriaService';
import { APIKriteria } from '@/service/KriteriaService';
import { APIProduk } from '@/service/ProdukService';
import { APISubKriteria } from '@/service/SubKriteriaService';
import { Button, Column, Dialog, useToast } from 'primevue';
import { onMounted, ref, watch } from 'vue';

//data template
const dialogVisible = ref(false);
const dialogMessage = ref('');
const currentActionType = ref('');
const formVisible = ref(false);
const titlePage = ref('Daftar Bobot Produk');
const headerModal = ref('');
const isDeleteModal = ref(false);
const temporaryId = ref('');
const selectedValue = ref(null);
const toast = useToast();
const currentTree = ref(0);
const isLoading = ref(false);

//data state
const isExpanded = ref(false); // Status header dinamis
const listTreeDataTable = ref([]);
const listProduk = ref([]);
const listKriteria = ref([]);
const listSubKriteria = ref([]);
const listBobotSubKriteria = ref([]);
const selectedProduk = ref(null);
const oldProduk = ref('');
const selectedBobotSubKriteria = ref([]);

// Event expand untuk menampilkan header
const onRowExpand = () => {
    currentTree.value++;
    if (currentTree.value === 2) {
        isExpanded.value = true;
    }
};

// Event collapse untuk menyembunyikan header
const onRowCollapse = () => {
    currentTree.value--;
    if (currentTree.value < 2) {
        isExpanded.value = false;
    }
};

// Form validation
const errors = ref({
    selectedProduk: null,
    bobotSubKriteria: []
});
const actionType = {
    add: 'Tambah',
    edit: 'Edit',
    delete: 'Hapus'
};

onMounted(async () => {
    isLoading.value = true;
    try {
        await getAllBobotProduk();
        await getAllProduk();
        await getAllKriteria();
        await getAllSubKriteria();
        await getAllBobotSubKriteria();
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Terjadi Kesalahan saat memproses aksi, silahkan hubungi tim IT', life: 3000 });
    }
    isLoading.value = false;
});

watch(selectedProduk, (newValue) => {
    if (selectedProduk === null) {
        errors.value.selectedProduk = '*Produk harus dipilih!';
    } else {
        errors.value.selectedProduk = null;
    }
});

// Modify the watch for selectedBobotSubKriteria
// watch(
//     selectedBobotSubKriteria,
//     (newSelections) => {
//         // Reset error messages
//         // errors.value.bobotSubKriteria = [];

//         // Validate each sub-kriteria
//         if (selectedBobotSubKriteria.value.length == 0) {
//             listSubKriteria.value.forEach((subKriteria, index) => {
//                 // Check if a value has been selected for this sub-kriteria
//                 const selectedValue = newSelections[index];

//                 if (!selectedValue) {
//                     // Create an error message for unselected sub-kriteria
//                     errors.value.bobotSubKriteria.push({
//                         id: subKriteria._id,
//                         message: `*Bobot untuk ${subKriteria.nama_sub_kriteria} harus dipilih!`
//                     });
//                 }
//             });
//         }
//     },
//     { deep: true }
// );

// Validation functions
function validateForm() {
    let isValid = true;

    errors.value = {
        selectedProduk: '',
        bobotSubKriteria: []
    };

    // Validate selected product
    if (!selectedProduk.value) {
        errors.value.selectedProduk = '*Produk harus dipilih';
        isValid = false;
    }

    // Validate sub-kriteria selections
    if (selectedBobotSubKriteria.value.length == 0) {
        listSubKriteria.value.forEach((subKriteria, index) => {
            // Only validate if it's a relevant sub-kriteria for the selected kriteria
            const subKriteriaBobot = selectedBobotSubKriteria.value[index];

            if (!subKriteriaBobot) {
                errors.value.bobotSubKriteria.push({
                    id: subKriteria._id,
                    message: `*Bobot untuk ${subKriteria.nama_sub_kriteria} harus dipilih!`
                });
                isValid = false;
            }
        });
    }

    return isValid;
}

//function
async function getAllBobotProduk() {
    const response = await APIBobotProduk.getAllBobotProduk();
    listTreeDataTable.value = response.data;
}

async function getAllProduk() {
    const response = await APIProduk.getAllProduk();
    listProduk.value = response.data;
}

// async function getBobotProdukById(id) {
//     const response = await APIBobotProduk.getBobotProdukById(id);
//     listProduk.value = response.data;
// }

async function getAllKriteria() {
    const response = await APIKriteria.getAllKriteria();
    listKriteria.value = response.data;
}

async function getAllSubKriteria() {
    const response = await APISubKriteria.getAllSubKriteriaNonFormated();
    listSubKriteria.value = response.data;
}

async function getAllBobotSubKriteria() {
    const response = await APIBobotSubKriteria.getAllBobotSubKriteria();
    listBobotSubKriteria.value = response.data;
}

async function showFormAddEdit(id) {
    if (id) {
        formVisible.value = true;
        const response = await APIBobotProduk.getBobotProdukById({ _id: id });
        const data = response.data;

        // Set selected product and weights
        temporaryId.value = data._id;
        oldProduk.value = data.id_produk;
        selectedProduk.value = data.id_produk;
        selectedBobotSubKriteria.value = data.id_bobot_sub_kriteria;

        titlePage.value = 'Edit Bobot Produk';
        clearErrors();
    } else {
        console.log('masuk');
        formVisible.value = true;
        titlePage.value = 'Tambah Bobot Produk';
    }
}

function clearErrors() {
    errors.value = {
        selectedProduk: '',
        bobotSubKriteria: []
    };
}

function backFromForm() {
    formVisible.value = false;
    titlePage.value = 'Daftar Bobot Produk';
    temporaryId.value = '';
    oldProduk.value = '';
    selectedProduk.value = null;
    selectedBobotSubKriteria.value = [];
    console.log(selectedValue.value);
    clearErrors();
}

const showDialog = (type, value = null) => {
    currentActionType.value = type;
    selectedValue.value = value;
    const colorText = type === 'Hapus' ? '#ef4444 ' : '#0ea5e9';
    dialogMessage.value = `
    Apakah Anda yakin ingin
    <span style="text-decoration: underline; font-weight: bold; color:${colorText};">${type}</span>
    Bobot Produk 
    <span style="text-decoration: underline; font-weight: bold; color:${colorText};">${value}</span>
    ini?`;
    dialogVisible.value = true;
};

async function confirmDelete(id) {
    const response = await APIBobotProduk.getBobotProdukById({ _id: id });
    const data = response.data;
    const produk = listProduk.value.find((item) => item._id === id);
    headerModal.value = 'Konfirmasi Hapus Bobot Produk';
    isDeleteModal.value = true;
    temporaryId.value = data._id;
    showDialog('Hapus', produk.produk);
}

function confirmAddEdit() {
    if (!validateForm()) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Mohon lengkapi semua field yang diperlukan', life: 3000 });
        return;
    }

    if (temporaryId.value.length > 0) {
        const produk = listProduk.value.find((item) => item._id === oldProduk.value);
        headerModal.value = 'Konfirmasi Edit Bobot Produk';
        showDialog('Edit', produk.produk);
    } else {
        const data = listProduk.value.find((item) => item._id === selectedProduk.value);
        headerModal.value = 'Konfirmasi Tambah Bobot Produk';
        showDialog('Tambah', data.produk);
    }
}

function clearState() {
    dialogVisible.value = false;
    dialogMessage.value = '';
    currentActionType.value = '';
    selectedValue.value = '';
    selectedProduk.value = '';
    selectedBobotSubKriteria.value = [];
    headerModal.value = '';
    isDeleteModal.value = false;
    temporaryId.value = '';
    oldProduk.value = '';
}

async function confirmAction() {
    isLoading.value = true;
    isLoading.value = true;
    let data;

    // Filter out null values from selectedBobotSubKriteria
    const filteredBobotSubKriteria = selectedBobotSubKriteria.value.filter((item) => item !== null);

    if (temporaryId.value.length > 0) {
        data = {
            _id: temporaryId.value,
            id_produk: selectedProduk.value,
            id_bobot_sub_kriteria: filteredBobotSubKriteria
        };
    } else {
        data = {
            id_produk: selectedProduk.value,
            id_bobot_sub_kriteria: filteredBobotSubKriteria
        };
    }

    if (currentActionType.value === actionType.delete) {
        try {
            await APIBobotProduk.deleteBobotProduk({ _id: data._id });
            await getAllBobotProduk();
            clearState();
            isLoading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: 'Bobot Produk berhasil dihapus', life: 3000 });
        } catch (e) {
            dialogVisible.value = false;
            isLoading.value = false;
            toast.add({ severity: 'error', summary: 'Error', detail: 'Terjadi kesalahan saat menghapus bobot produk ini, harap mencoba kembali', life: 3000 });
        }
    } else if (currentActionType.value === actionType.edit) {
        try {
            await APIBobotProduk.updateBobotProduk(data);
            await getAllBobotProduk();
            backFromForm();
            clearState();
            isLoading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: 'Bobot Produk berhasil diubah', life: 3000 });
        } catch (e) {
            dialogVisible.value = false;
            isLoading.value = false;
            toast.add({ severity: 'error', summary: 'Error', detail: e.response.data.message, life: 3000 });
        }
    } else {
        try {
            console.log(data);
            const produk = listProduk.value.find((item) => item._id === data.id_produk);
            await APIBobotProduk.addBobotProduk(data);
            await getAllBobotProduk();
            clearState();
            backFromForm();
            isLoading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: `Berhasil menambahkan Bobot Produk ${produk.produk}`, life: 3000 });
        } catch (e) {
            dialogVisible.value = false;
            isLoading.value = false;
            toast.add({ severity: 'error', summary: 'Error', detail: e.response.data.message, life: 3000 });
        }
    }
}
</script>

<template>
    <HamsterLoader :is-loading="isLoading" />
    <div class="flex flex-col justify-between gap-9">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">{{ titlePage }}</h1>
            <Button v-if="!formVisible" label="Tambah Bobot Produk" icon="pi pi-plus" @click="showFormAddEdit()" />
            <Button v-if="formVisible" label="Kembali" icon="pi pi-arrow-left" @click="backFromForm" severity="info" />
        </div>

        <div v-if="!formVisible">
            <TreeTable :value="listTreeDataTable" :tableStyle="{ minWidth: '60rem' }" @node-expand="onRowExpand" @node-collapse="onRowCollapse">
                <!-- Kolom Nama Kategori -->
                <Column field="name" header="Nama Produk" expander></Column>

                <!-- Kolom dinamis -->
                <Column v-if="isExpanded" field="nama_bobot" header="Nama Bobot"></Column>
                <Column v-if="isExpanded" field="nilai_bobot" header="Nilai Bobot"></Column>
                <Column header="Aksi">
                    <template #body="{ node, level }">
                        <!-- Tampilkan button hanya untuk parent utama (level 0) -->
                        <div v-if="level !== 0" class="flex justify-center gap-2">
                            <Button label="Edit" icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-sm" @click="showFormAddEdit(node.key)" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" @click="confirmDelete(node.key)" />
                        </div>
                    </template>
                </Column>
            </TreeTable>
        </div>

        <div class="card flex flex-col gap-4" v-if="formVisible">
            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Produk </label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col">
                        <Dropdown v-model="selectedProduk" :options="listProduk" optionLabel="produk" optionValue="_id" placeholder="Pilih Produk" class="w-full xl:w-[75%]" :class="errors.selectedProduk ? 'p-invalid' : ''" showClear />
                        <small class="text-red-500" v-if="errors.selectedProduk">*{{ errors.selectedProduk }}</small>
                    </div>
                </div>
            </div>
            <div v-for="(kriteria, index) in listKriteria" :key="index">
                <div class="grid grid-cols-12 gap-2">
                    <label v-if="listSubKriteria.some((data) => data.id_kriteria === kriteria._id)" for="email3" class="flex font-bold text-lg items-center col-span-12 mb-2 md:col-span-2 md:mb-0">{{ kriteria.kriteria }}</label>
                </div>
                <div v-for="(subKriteria, index) in listSubKriteria" :key="index" class="grid grid-cols-12 gap-2">
                    <label v-if="kriteria._id === subKriteria.id_kriteria" for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0 ml-2">{{ subKriteria.nama_sub_kriteria }} </label>
                    <div v-if="kriteria._id === subKriteria.id_kriteria" class="col-span-12 md:col-span-10">
                        <div class="flex flex-col gap-2 mb-4">
                            <Dropdown
                                v-model="selectedBobotSubKriteria[index]"
                                :options="listBobotSubKriteria.filter((data) => data.id_sub_kriteria === subKriteria._id)"
                                optionLabel="nama_bobot"
                                optionValue="_id"
                                :placeholder="`Pilih Bobot ${subKriteria.nama_sub_kriteria}`"
                                class="w-full xl:w-[75%]"
                                :class="errors.bobotSubKriteria.some((err) => err.id === subKriteria._id) ? 'p-invalid' : ''"
                                showClear
                            />
                            <small v-if="errors.bobotSubKriteria.some((err) => err.id === subKriteria._id)" class="text-red-500">
                                {{ errors.bobotSubKriteria.find((err) => err.id === subKriteria._id).message }}
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-4 mt-10">
                <Button label="Cancel" severity="warn" icon="pi pi-times-circle" @click="backFromForm" />
                <Button label="Simpan" severity="primary" icon="pi pi-save" @click="confirmAddEdit" />
            </div>
        </div>
    </div>

    <Dialog :header="headerModal" v-model:visible="dialogVisible" modal>
        <div class="flex flex-col gap-4 p-4 justify-between">
            <p class="text-2xl mb-10" v-html="dialogMessage"></p>
            <div class="flex justify-end gap-2">
                <Button v-if="!isDeleteModal" label="Tidak" severity="warn" icon="pi pi-times" @click="dialogVisible = false" class="p-button-text" />
                <Button v-if="!isDeleteModal" label="Ya" severity="primary" icon="pi pi-check" @click="confirmAction" />

                <!-- delete modal -->
                <Button v-if="isDeleteModal" label="Tidak" severity="primary" icon="pi pi-times" @click="(dialogVisible = false), (isDeleteModal = false), (temporaryId = '')" class="p-button-text" />
                <Button v-if="isDeleteModal" label="Ya" severity="danger" icon="pi pi-check" @click="confirmAction" />
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.dropdown-title {
    font-size: 15px;
    margin-bottom: 8px;
    font-weight: 500;
}

.p-invalid {
    border-color: #dc2626;
}
</style>
