<script setup lang="js">
import { APITypePreferensi } from '@/service/TypePreferensiService';
import { Button, Column, DataTable, Dialog, useToast } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';

//data template
const dialogVisible = ref(false);
const dialogMessage = ref('');
const currentActionType = ref('');
const formVisible = ref(false);
const titlePage = ref('Daftar Tipe Preferensi');
const headerModal = ref('');
const isDeleteModal = ref(false);
const temporaryId = ref('');
const selectedValue = ref('');
const toast = useToast();
const isLoading = ref(false);

//data state
const listTypePreferensi = ref([]);
const inputTypePreferensi = ref('');
const listTypePreferensiWithNumber = computed(() =>
    listTypePreferensi.value.map((item, index) => ({
        ...item,
        no: index + 1
    }))
);

// Form validation
const errors = ref({
    TypePreferensi: ''
});
const actionType = {
    add: 'Tambah',
    edit: 'Edit',
    delete: 'Hapus'
};

onMounted(async () => {
    isLoading.value = true;
    try {
        await getAllTypePreferensi();
        console.log(listTypePreferensi.value);
        headerModal.value = '';
        temporaryId.value = '';
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Terjadi Kesalahan saat memproses aksi, silahkan hubungi tim IT', life: 3000 });
    }
    isLoading.value = false;
});

watch(inputTypePreferensi, (newValue) => {
    if (!newValue || newValue.trim() === '') {
        errors.value.TypePreferensi = 'Nama Type Preferensi harus diisi';
    } else if (newValue.length < 3) {
        errors.value.TypePreferensi = 'Nama Type Preferensi minimal 3 karakter';
    } else {
        errors.value.TypePreferensi = '';
    }
});

// Validation functions
function validateForm() {
    let isValid = true;
    errors.value = {
        TypePreferensi: ''
    };
    // Validate product name
    if (!inputTypePreferensi.value.trim()) {
        errors.value.TypePreferensi = 'Nama Type Preferensi harus diisi';
        isValid = false;
    } else if (inputTypePreferensi.value.length < 3) {
        errors.value.TypePreferensi = 'Nama Type Preferensi minimal 3 karakter';
        isValid = false;
    }
    return isValid;
}

//function
async function getAllTypePreferensi() {
    const response = await APITypePreferensi.getAllTypePreferensi();
    listTypePreferensi.value = response.data;
}

function formAddTypePreferensi() {
    formVisible.value = true;
    titlePage.value = 'Tambah Type Preferensi';
    clearErrors();
}

function formEditTypePreferensi(id) {
    const typePreferensi = listTypePreferensi.value.find((item) => item._id === id);
    formVisible.value = true;
    titlePage.value = 'Edit Type Preferensi';
    inputTypePreferensi.value = typePreferensi.type;
    temporaryId.value = id;
    clearErrors();
}

function clearErrors() {
    errors.value = {
        TypePreferensi: '',
        kategori: '',
        kategoriLainnya: ''
    };
}

function backFromForm() {
    formVisible.value = false;
    titlePage.value = 'Daftar Type Preferensi';
    inputTypePreferensi.value = '';
    temporaryId.value = '';
    clearErrors();
}

const showDialog = (type, value = null) => {
    currentActionType.value = type;
    selectedValue.value = value;
    const colorText = type === 'delete' ? '#ef4444 ' : '#0ea5e9';
    dialogMessage.value = `
    Apakah Anda yakin ingin 
    <span style="text-decoration: underline; font-weight: bold; color:${colorText};">${type}</span> 
    Type Preferensi 
    <span style="text-decoration: underline; font-weight: bold; color:${colorText};">    ${value.type}</span>  
    ini?`;
    dialogVisible.value = true;
};

function confirmDelete(id) {
    const product = listTypePreferensi.value.find((item) => item._id === id);
    headerModal.value = 'Konfirmasi Hapus Type Preferensi';
    isDeleteModal.value = true;
    temporaryId.value = id;
    showDialog('Hapus', product);
}

function confirmAddEdit() {
    if (!validateForm()) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Mohon lengkapi semua field yang diperlukan', life: 3000 });
        return;
    }

    if (temporaryId.value.length > 0) {
        const typePreferensi = listTypePreferensi.value.find((item) => item._id === temporaryId.value);
        headerModal.value = 'Konfirmasi Edit Type Preferensi';
        showDialog('Edit', typePreferensi);
    } else {
        const typePreferensi = {
            type: inputTypePreferensi.value
        };
        headerModal.value = 'Konfirmasi Tambah Type Preferensi';
        showDialog('Tambah', typePreferensi);
    }
}

function clearState() {
    dialogVisible.value = false;
    dialogMessage.value = '';
    currentActionType.value = '';
    selectedValue.value = '';
    headerModal.value = '';
    isDeleteModal.value = false;
    temporaryId.value = '';
}

async function confirmAction() {
    isLoading.value = true;
    if (currentActionType.value === actionType.delete) {
        try {
            await APITypePreferensi.deleteTypePreferensi({ _id: temporaryId.value });
            await getAllTypePreferensi();
            clearState();
            isLoading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: 'Type Preferensi berhasil dihapus', life: 3000 });
        } catch (error) {
            dialogVisible.value = false;
            console.log(error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Terjadi Kesalahan saat memproses aksi, silahkan hubungi tim IT', life: 3000 });
        }
    } else if (currentActionType.value === actionType.edit) {
        try {
            await APITypePreferensi.updateTypePreferensi({ _id: temporaryId.value, type: inputTypePreferensi.value });
            await getAllTypePreferensi();
            backFromForm();
            clearState();
            isLoading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: 'Type Preferensi berhasil diubah', life: 3000 });
        } catch (error) {
            dialogVisible.value = false;
            console.error(error);
            toast.add({ severity: 'error', summary: 'Error', detail: error.response.data.message, life: 3000 });
        }
    } else {
        try {
            await APITypePreferensi.addTypePreferensi({ type: inputTypePreferensi.value });
            await getAllTypePreferensi();
            clearState();
            backFromForm();
            isLoading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: `Type Preferensi berhasil ditambahkan ${inputTypePreferensi.value}`, life: 3000 });
        } catch (error) {
            dialogVisible.value = false;
            console.error(error);
            toast.add({ severity: 'error', summary: 'Error', detail: error.response.data.message, life: 3000 });
        }
    }
}
</script>

<template>
    <HamsterLoader :is-loading="isLoading" />
    <div class="flex flex-col justify-between gap-9">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">{{ titlePage }}</h1>
            <Button v-if="!formVisible" label="Tambah Type Preferensi" icon="pi pi-plus" @click="formAddTypePreferensi" />
            <Button v-if="formVisible" label="Kembali" icon="pi pi-arrow-left" @click="backFromForm" severity="info" />
        </div>

        <div v-if="!formVisible">
            <DataTable :value="listTypePreferensiWithNumber" paginator :rows="10">
                <Column field="no" header="No" />
                <Column field="type" header="Type Preferensi" />
                <Column header="Aksi">
                    <template #body="{ data }">
                        <div class="flex justify-center gap-2">
                            <Button label="Edit" icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-sm" @click="formEditTypePreferensi(data._id)" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" @click="confirmDelete(data._id)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <div class="card flex flex-col gap-4" v-if="formVisible">
            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Type Preferensi</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <InputText v-model="inputTypePreferensi" type="text" placeholder="Masukan Nama Type Preferensi" class="w-full xl:w-[75%]" :class="errors.TypePreferensi.length > 0 ? 'p-invalid' : ''" />
                        <small class="text-red-500" v-if="errors.TypePreferensi">*{{ errors.TypePreferensi }}</small>
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
