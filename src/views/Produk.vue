<script setup lang="js">
import { APIProduk } from '@/service/ProdukService';
import { Button, Column, DataTable, Dialog, useToast } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';

//data
const dialogVisible = ref(false);
const dialogMessage = ref('');
const currentActionType = ref('');
const selectedProduct = ref(null);
const formVisible = ref(false);
const titleProduk = ref('Daftar Produk');
const listProduk = ref([]);
const selectedKategori = ref(null);
const headerModal = ref('');
const isDeleteModal = ref(false);
const temporaryId = ref('');
const inputProduk = ref('');
const selectedInputKategori = ref('');
const inputKategoriLainnya = ref('');
const toast = useToast();

// Form validation
const errors = ref({
    produk: '',
    kategori: '',
    kategoriLainnya: ''
});
const actionType = {
    add: 'add',
    edit: 'edit',
    delete: 'delete'
};

const kategoriFilter = computed(() => {
    const uniqueKategori = [...new Set(listProduk.value.map((item) => item.kategori))];
    return uniqueKategori.map((kategori) => ({ label: kategori, value: kategori }));
});

const kategoriForm = computed(() => {
    const uniqueKategori = [...new Set(listProduk.value.map((item) => item.kategori))];
    uniqueKategori.push('Kategori Lainnya');
    return uniqueKategori.map((kategori) => ({ label: kategori, value: kategori }));
});

const filteredProduk = computed(() => {
    if (!selectedKategori.value) {
        const listProdukWithNumber = listProduk.value.map((item, index) => ({
            ...item,
            no: index + 1
        }));
        return listProdukWithNumber;
    }
    const listFilterProduk = listProduk.value.filter((item) => item.kategori === selectedKategori.value.value);
    const listFilterProdukWithNumber = listFilterProduk.map((item, index) => ({
        ...item,
        no: index + 1
    }));
    return listFilterProdukWithNumber;
});

onMounted(async () => {
    await getAllProduk();
    headerModal.value = '';
    temporaryId.value = '';
});

watch(inputProduk, (newValue) => {
    if (!newValue || newValue.trim() === '') {
        errors.value.produk = 'Nama produk harus diisi';
    } else if (newValue.length < 3) {
        errors.value.produk = 'Nama produk minimal 3 karakter';
    } else {
        errors.value.produk = '';
    }
});

watch(selectedInputKategori, (newValue) => {
    if (!newValue) {
        errors.value.kategori = 'Kategori harus dipilih';
    } else {
        errors.value.kategori = '';
        if (newValue.label !== 'Kategori Lainnya') {
            errors.value.kategoriLainnya = '';
        }
    }
});

watch(inputKategoriLainnya, (newValue) => {
    if (selectedInputKategori.value?.label === 'Kategori Lainnya') {
        if (!newValue || newValue.trim() === '') {
            errors.value.kategoriLainnya = 'Kategori lainnya harus diisi';
        } else {
            errors.value.kategoriLainnya = '';
        }
    }
});

// Validation functions
function validateForm() {
    let isValid = true;
    errors.value = {
        produk: '',
        kategori: '',
        kategoriLainnya: ''
    };

    // Validate product name
    if (!inputProduk.value.trim()) {
        errors.value.produk = 'Nama produk harus diisi';
        isValid = false;
    } else if (inputProduk.value.length < 3) {
        errors.value.produk = 'Nama produk minimal 3 karakter';
        isValid = false;
    }

    // Validate category
    if (!selectedInputKategori.value) {
        errors.value.kategori = 'Kategori harus dipilih';
        isValid = false;
    }

    // Validate other category input if selected
    if (selectedInputKategori.value?.label === 'Kategori Lainnya' && !inputKategoriLainnya.value.trim()) {
        errors.value.kategoriLainnya = 'Kategori lainnya harus diisi';
        isValid = false;
    }

    return isValid;
}

//function
async function getAllProduk() {
    const response = await APIProduk.getAllProduk();
    listProduk.value = response.data;
}

function formAddProduk() {
    formVisible.value = true;
    titleProduk.value = 'Tambah Produk';
    clearErrors();
}

function formEditProduk(id) {
    const product = listProduk.value.find((item) => item._id === id);
    formVisible.value = true;
    titleProduk.value = 'Edit Produk';
    inputProduk.value = product.produk;
    temporaryId.value = id;
    selectedInputKategori.value = kategoriForm.value.find((item) => item.label === product.kategori);
    clearErrors();
}

function clearErrors() {
    errors.value = {
        produk: '',
        kategori: '',
        kategoriLainnya: ''
    };
}

function backFromForm() {
    formVisible.value = false;
    titleProduk.value = 'Daftar Produk';
    inputProduk.value = '';
    selectedInputKategori.value = '';
    temporaryId.value = '';
    inputKategoriLainnya.value = '';
    clearErrors();
}

const showDialog = (type, product = null) => {
    currentActionType.value = type;
    selectedProduct.value = product;
    const colorText = type === 'delete' ? '#ef4444 ' : '#0ea5e9';
    dialogMessage.value = `
    Apakah Anda yakin ingin 
    <span style="text-decoration: underline; font-weight: bold; color:${colorText};">${type}</span> 
    produk 
    <span style="text-decoration: underline; font-weight: bold; color:${colorText};">    ${product.produk}</span>  
    ini?`;
    dialogVisible.value = true;
};

function confirmDelete(id) {
    const product = listProduk.value.find((item) => item._id === id);
    headerModal.value = 'Konfirmasi Hapus Produk';
    isDeleteModal.value = true;
    temporaryId.value = id;
    showDialog('delete', product);
}

function confirmAddEdit() {
    if (!validateForm()) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Mohon lengkapi semua field yang diperlukan', life: 3000 });
        return;
    }

    if (temporaryId.value.length > 0) {
        const product = listProduk.value.find((item) => item._id === temporaryId.value);
        headerModal.value = 'Konfirmasi Edit Produk';
        showDialog('edit', product);
    } else {
        const product = {
            produk: inputProduk.value,
            kategori: selectedInputKategori.value.label === 'Kategori Lainnya' ? inputKategoriLainnya.value : selectedInputKategori.value.label
        };
        headerModal.value = 'Konfirmasi Tambah Produk';
        showDialog('add', product);
    }
}

function clearState() {
    dialogVisible.value = false;
    dialogMessage.value = '';
    currentActionType.value = '';
    selectedProduct.value = null;
    headerModal.value = '';
    isDeleteModal.value = false;
    temporaryId.value = '';
}

async function confirmAction() {
    if (currentActionType.value === actionType.delete) {
        await APIProduk.deleteProduk({ _id: temporaryId.value });
        await getAllProduk();
        clearState();
        toast.add({ severity: 'success', summary: 'Success', detail: 'Produk berhasil dihapus', life: 3000 });
    } else if (currentActionType.value === actionType.edit) {
        const kategori = selectedInputKategori.value.label === 'Kategori Lainnya' ? inputKategoriLainnya.value : selectedInputKategori.value.label;
        await APIProduk.updateProduk({ _id: temporaryId.value, produk: inputProduk.value, kategori: kategori });
        await getAllProduk();
        backFromForm();
        clearState();
        toast.add({ severity: 'success', summary: 'Success', detail: 'Produk berhasil diubah', life: 3000 });
    } else {
        const kategori = selectedInputKategori.value.label === 'Kategori Lainnya' ? inputKategoriLainnya.value : selectedInputKategori.value.label;
        await APIProduk.addProduk({ produk: inputProduk.value, kategori: kategori });
        await getAllProduk();
        clearState();
        backFromForm();
        toast.add({ severity: 'success', summary: 'Success', detail: `Produk berhasil ditambahkan ${inputProduk.value}`, life: 3000 });
    }
}
</script>

<template>
    <div class="flex flex-col justify-between gap-9">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">{{ titleProduk }}</h1>
            <Button v-if="!formVisible" label="Tambah Produk" icon="pi pi-plus" @click="formAddProduk" />
            <Button v-if="formVisible" label="Kembali" icon="pi pi-arrow-left" @click="backFromForm" severity="info" />
        </div>

        <div v-if="!formVisible">
            <div class="mb-3">
                <h3 class="dropdown-title">Filter Produk By Kategori</h3>
                <div class="flex gap-2 items-center">
                    <Dropdown v-model="selectedKategori" :options="kategoriFilter" optionLabel="label" placeholder="Pilih Kategori" class="w-full xl:w-96" showClear />
                </div>
            </div>

            <DataTable :value="filteredProduk" paginator :rows="10">
                <Column field="no" header="No" />
                <Column field="produk" header="Nama Produk" />
                <Column field="kategori" header="Kategori Produk" />
                <Column header="Aksi">
                    <template #body="{ data }">
                        <div class="flex justify-center gap-2">
                            <Button label="Edit" icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-sm" @click="formEditProduk(data._id)" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" @click="confirmDelete(data._id)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <div class="card flex flex-col gap-4" v-if="formVisible">
            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Nama Produk</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <InputText v-model="inputProduk" type="text" placeholder="Masukan Nama Produk" class="w-full xl:w-[75%]" :class="errors.produk.length > 0 ? 'p-invalid' : ''" />
                        <small class="text-red-500" v-if="errors.produk">*{{ errors.produk }}</small>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label for="email3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Kategori</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <Dropdown v-model="selectedInputKategori" :options="kategoriForm" optionLabel="label" placeholder="Pilih Kategori" class="w-full xl:w-[75%]" :class="errors.kategori.length > 0 ? 'p-invalid' : ''" showClear />
                        <small class="text-red-500" v-if="errors.kategori">{{ errors.kategori }}</small>
                    </div>
                </div>
            </div>
            <div v-if="selectedInputKategori && selectedInputKategori.label === 'Kategori Lainnya'" class="grid grid-cols-12 gap-2">
                <label for="email3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Input Kategori Lainnya</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <InputText v-model="inputKategoriLainnya" id="email3" type="text" class="w-full xl:w-[75%]" :class="errors.kategoriLainnya.length > 0 ? 'p-invalid' : ''" />
                        <small class="text-red-500" v-if="errors.kategori">{{ errors.kategoriLainnya }}</small>
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
