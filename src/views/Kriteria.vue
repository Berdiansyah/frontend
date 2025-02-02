<script setup lang="js">
// import { APIKriteria } from '@/service/KriteriaService';
import HamsterLoader from '@/components/HamsterLoader.vue';
import { APIKriteria } from '@/service/KriteriaService';
import { Button, Column, DataTable, Dialog, useToast } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';

//data template
const dialogVisible = ref(false);
const dialogMessage = ref('');
const currentActionType = ref('');
const formVisible = ref(false);
const titlePage = ref('Daftar Kriteria');
const headerModal = ref('');
const isDeleteModal = ref(false);
const temporaryId = ref('');
const selectedValue = ref('');
const toast = useToast();
const isLoading = ref(false);

//data state
const listKriteria = ref([]);
const inputKriteria = ref('');
const listKriteriaWithNumber = computed(() =>
    listKriteria.value.map((item, index) => ({
        ...item,
        no: index + 1
    }))
);

// Form validation
const errors = ref({
    Kriteria: ''
});
const actionType = {
    add: 'Tambah',
    edit: 'Edit',
    delete: 'Hapus'
};

onMounted(async () => {
    isLoading.value = true;
    try {
        await getAllKriteria();
        console.log(listKriteria.value);
        headerModal.value = '';
        temporaryId.value = '';
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Terjadi Kesalahan saat memproses aksi, silahkan hubungi tim IT', life: 3000 });
    }
    isLoading.value = false;
});

watch(inputKriteria, (newValue) => {
    if (!newValue || newValue.trim() === '') {
        errors.value.Kriteria = 'Nama Kriteria harus diisi';
    } else if (newValue.length < 3) {
        errors.value.Kriteria = 'Nama Kriteria minimal 3 karakter';
    } else {
        errors.value.Kriteria = '';
    }
});

// Validation functions
function validateForm() {
    let isValid = true;
    errors.value = {
        Kriteria: ''
    };
    // Validate product name
    if (!inputKriteria.value.trim()) {
        errors.value.Kriteria = 'Nama Kriteria harus diisi';
        isValid = false;
    } else if (inputKriteria.value.length < 3) {
        errors.value.Kriteria = 'Nama Kriteria minimal 3 karakter';
        isValid = false;
    }
    return isValid;
}

//function
async function getAllKriteria() {
    const response = await APIKriteria.getAllKriteria();
    listKriteria.value = response.data;
}

function formAddKriteria() {
    formVisible.value = true;
    titlePage.value = 'Tambah Kriteria';
    clearErrors();
}

function formEditKriteria(id) {
    const Kriteria = listKriteria.value.find((item) => item._id === id);
    formVisible.value = true;
    titlePage.value = 'Edit Kriteria';
    inputKriteria.value = Kriteria.kriteria;
    temporaryId.value = id;
    console.log(Kriteria);
    console.log(temporaryId.value);
    clearErrors();
}

function clearErrors() {
    errors.value = {
        Kriteria: ''
    };
}

function backFromForm() {
    formVisible.value = false;
    titlePage.value = 'Daftar Kriteria';
    inputKriteria.value = '';
    temporaryId.value = '';
    clearErrors();
}

const showDialog = (type, value = null) => {
    currentActionType.value = type;
    selectedValue.value = value;
    console.log(selectedValue.value);
    const colorText = type === 'delete' ? '#ef4444 ' : '#0ea5e9';
    dialogMessage.value = `
    Apakah Anda yakin ingin 
    <span style="text-decoration: underline; font-weight: bold; color:${colorText};">${type}</span> 
    Kriteria 
    <span style="text-decoration: underline; font-weight: bold; color:${colorText};">    ${value.kriteria}</span>  
    ini?`;
    dialogVisible.value = true;
};

function confirmDelete(id) {
    const product = listKriteria.value.find((item) => item._id === id);
    headerModal.value = 'Konfirmasi Hapus Kriteria';
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
        console.log('Masuk engga ke dalam sini di dalam confirm add edit');
        const Kriteria = listKriteria.value.find((item) => item._id === temporaryId.value);
        headerModal.value = 'Konfirmasi Edit Kriteria';
        showDialog('Edit', Kriteria);
        console.log(currentActionType.value);
    } else {
        const Kriteria = {
            kriteria: inputKriteria.value
        };
        headerModal.value = 'Konfirmasi Tambah Kriteria';
        showDialog('Tambah', Kriteria);
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
            await APIKriteria.deleteKriteria({ _id: temporaryId.value });
            await getAllKriteria();
            clearState();
            isLoading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: 'Kriteria berhasil dihapus', life: 3000 });
        } catch (error) {
            dialogVisible.value = false
            console.error(error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Terjadi Kesalahan saat memproses aksi, silahkan hubungi tim IT', life: 3000 });
        }
    } else if (currentActionType.value === actionType.edit) {
        try {
            await APIKriteria.updateKriteria({ _id: temporaryId.value, kriteria: inputKriteria.value });
            await getAllKriteria();
            backFromForm();
            clearState();
            isLoading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: 'Kriteria berhasil diubah', life: 3000 });
        } catch (error) {
            dialogVisible.value = false
            console.error(error);
            toast.add({ severity: 'error', summary: 'Error', detail: error.response.data.message, life: 3000 });
        }
    } else {
        try {
            await APIKriteria.addKriteria({ kriteria: inputKriteria.value });
            await getAllKriteria();
            clearState();
            backFromForm();
            isLoading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: `Kriteria berhasil ditambahkan ${inputKriteria.value}`, life: 3000 });
        } catch (error) {
            dialogVisible.value = false
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
            <Button v-if="!formVisible" label="Tambah Kriteria" icon="pi pi-plus" @click="formAddKriteria" />
            <Button v-if="formVisible" label="Kembali" icon="pi pi-arrow-left" @click="backFromForm" severity="info" />
        </div>

        <div v-if="!formVisible">
            <DataTable :value="listKriteriaWithNumber" paginator :rows="10">
                <Column field="no" header="No" />
                <Column field="kriteria" header="Kriteria" />
                <Column header="Aksi">
                    <template #body="{ data }">
                        <div class="flex justify-center gap-2">
                            <Button label="Edit" icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-sm" @click="formEditKriteria(data._id)" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" @click="confirmDelete(data._id)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <div class="card flex flex-col gap-4" v-if="formVisible">
            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Kriteria</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <InputText v-model="inputKriteria" type="text" placeholder="Masukan Nama Kriteria" class="w-full xl:w-[75%]" :class="errors.Kriteria.length > 0 ? 'p-invalid' : ''" />
                        <small class="text-red-500" v-if="errors.Kriteria">*{{ errors.Kriteria }}</small>
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
