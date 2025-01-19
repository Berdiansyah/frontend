<script setup lang="js">
import { APIKriteria } from '@/service/KriteriaService';
import { APISubKriteria } from '@/service/SubKriteriaService';
import { APITypePreferensi } from '@/service/TypePreferensiService';
import { Button, Column, Dialog, TreeTable, useToast } from 'primevue';
import { onMounted, ref } from 'vue';

//data template
const dialogVisible = ref(false);
const dialogMessage = ref('');
const currentActionType = ref('');
const formVisible = ref(false);
const titlePage = ref('Daftar Sub Kriteria');
const headerModal = ref('');
const isDeleteModal = ref(false);
const temporaryId = ref('');
const selectedValue = ref('');
const toast = useToast();

//data state
const isExpanded = ref(false); // Status header dinamis
const listTreeDataTable = ref([]);
const inputKriteria = ref('');
const listKriteria = ref([]);
const listTypePreferensi = ref([]);
const selectedKriteria = ref('');
const selectedTypePreferensi = ref('');
const inputSubKriteria = ref('');
const selectedMinMax = ref('');
const inputThsP = ref('');
const inputThsQ = ref('');
const inputThsS = ref('');

const listMinMax = [
    { label: 'Min', value: 'min' },
    { label: 'Max', value: 'max' }
];

// Event expand untuk menampilkan header
const onRowExpand = () => {
    isExpanded.value = true;
};

// Event collapse untuk menyembunyikan header
const onRowCollapse = () => {
    isExpanded.value = false;
};

// Form validation
const errors = ref({
    kriteria: '',
    type: '',
    namaSubKriteria: '',
    min_max: '',
    thresholdP: '',
    thresholdQ: '',
    thresholdS: ''
});
const actionType = {
    add: 'Tambah',
    edit: 'Edit',
    delete: 'Hapus'
};

onMounted(async () => {
    await getAllSubKriteria();
    headerModal.value = '';
    temporaryId.value = '';
});

// watch(inputKriteria, (newValue) => {
//     if (!newValue || newValue.trim() === '') {
//         errors.value.Kriteria = 'Nama Kriteria harus diisi';
//     } else if (newValue.length < 3) {
//         errors.value.Kriteria = 'Nama Kriteria minimal 3 karakter';
//     } else {
//         errors.value.Kriteria = '';
//     }
// });

// Validation functions
function validateForm() {
    let isValid = true;
    errors.value = {
        kriteria: '',
        type: '',
        namaSubKriteria: '',
        min_max: '',
        thresholdP: '',
        thresholdQ: '',
        thresholdS: ''
    };
    // Validate product name
    // if (!inputKriteria.value.trim()) {
    //     errors.value.Kriteria = 'Nama Kriteria harus diisi';
    //     isValid = false;
    // } else if (inputKriteria.value.length < 3) {
    //     errors.value.Kriteria = 'Nama Kriteria minimal 3 karakter';
    //     isValid = false;
    // }
    return isValid;
}

//function
async function getAllSubKriteria() {
    const response = await APISubKriteria.getAllSubKriteria();
    listTreeDataTable.value = response.data;
}

async function showFormAddEdit(id = '') {
    try {
        // Fetch semua data Kriteria dan Type Preferensi
        const responseKriteria = await APIKriteria.getAllKriteria();
        listKriteria.value = responseKriteria.data;

        const responseTypePreferensi = await APITypePreferensi.getAllTypePreferensi();
        listTypePreferensi.value = responseTypePreferensi.data;

        // Jika ID diberikan (Edit Mode)
        if (id.length > 0) {
            const response = await APISubKriteria.getSubKriteriaById({ _id: id });
            const subKriteria = response.data;

            // Validasi apakah subKriteria ada
            if (!subKriteria || Object.keys(subKriteria).length === 0) {
                showError('Data Sub Kriteria tidak ditemukan.');
                return;
            }

            // Isi data untuk mode edit
            selectedKriteria.value = subKriteria.id_kriteria;
            selectedTypePreferensi.value = subKriteria.id_type;
            inputSubKriteria.value = subKriteria.nama_sub_kriteria;
            selectedMinMax.value = subKriteria.min_max;
            inputThsP.value = subKriteria.p;
            inputThsQ.value = subKriteria.q;
            inputThsS.value = subKriteria.s;

            formVisible.value = true;
            titlePage.value = 'Edit Sub Kriteria';
            temporaryId.value = id;
            clearErrors();
        } else {
            // Tambah Mode
            formVisible.value = true;
            titlePage.value = 'Tambah Sub Kriteria';
            clearErrors();
        }
    } catch (error) {
        // Menangani error secara global
        console.error('Error fetching data:', error);
        showError('Terjadi kesalahan saat memuat data.');
    }
}

function clearErrors() {
    errors.value = {
        kriteria: '',
        type: '',
        namaSubKriteria: '',
        min_max: '',
        thresholdP: '',
        thresholdQ: '',
        thresholdS: ''
    };
}

function backFromForm() {
    formVisible.value = false;
    titlePage.value = 'Daftar Sub Kriteria';
    selectedKriteria.value = '';
    selectedTypePreferensi.value = '';
    inputSubKriteria.value = '';
    selectedMinMax.value = '';
    inputThsP.value = '';
    inputThsQ.value = '';
    inputThsS.value = '';
    temporaryId.value = '';
    onRowCollapse();
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
    Sub Kriteria 
    <span style="text-decoration: underline; font-weight: bold; color:${colorText};">${value}</span>  
    ini?`;
    dialogVisible.value = true;
};

function findDataById(treeData, targetId) {
    // Iterasi setiap node dalam tree
    for (const node of treeData) {
        // Cek apakah node memiliki children
        if (node.children && node.children.length > 0) {
            // Cari di children nodes
            const childData = node.children.find((child) => child.data._id === targetId);
            if (childData) {
                return childData.data;
            }
        }
    }
    return null;
}

function confirmDelete(id) {
    const subKriteria = findDataById(listTreeDataTable.value, id);
    headerModal.value = 'Konfirmasi Hapus Kriteria';
    isDeleteModal.value = true;
    temporaryId.value = id;
    showDialog('Hapus', subKriteria.name);
}

function confirmAddEdit() {
    if (!validateForm()) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Mohon lengkapi semua field yang diperlukan', life: 3000 });
        return;
    }

    if (temporaryId.value.length > 0) {
        console.log('Masuk engga ke dalam sini di dalam confirm add edit');
        headerModal.value = 'Konfirmasi Edit Sub Kriteria';
        showDialog('Edit', inputSubKriteria.value);
        console.log(currentActionType.value);
    } else {
        headerModal.value = 'Konfirmasi Tambah Sub Kriteria';
        showDialog('Tambah', inputSubKriteria.value);
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
    const data = {
        _id: temporaryId.value,
        id_kriteria: selectedKriteria.value,
        id_type: selectedTypePreferensi.value,
        nama_sub_kriteria: inputSubKriteria.value,
        min_max: selectedMinMax.value,
        p: inputThsP.value,
        q: inputThsQ.value,
        s: inputThsS.value
    };

    if (currentActionType.value === actionType.delete) {
        await APISubKriteria.deleteSubKriteria({ _id: temporaryId.value });
        await getAllSubKriteria();
        backFromForm();
        clearState();
        toast.add({ severity: 'success', summary: 'Success', detail: 'Kriteria berhasil dihapus', life: 3000 });
    } else if (currentActionType.value === actionType.edit) {
        console.log('Masuk engga ke dalam sini di dalam confirm confirm');
        await APISubKriteria.updateSubKriteria(data);
        await getAllSubKriteria();
        backFromForm();
        clearState();
        toast.add({ severity: 'success', summary: 'Success', detail: 'Kriteria berhasil diubah', life: 3000 });
    } else {
        await APISubKriteria.addSubKriteria(data);
        await getAllSubKriteria();
        clearState();
        backFromForm();
        toast.add({ severity: 'success', summary: 'Success', detail: `Kriteria berhasil ditambahkan ${inputKriteria.value}`, life: 3000 });
    }
}
</script>

<template>
    <div class="flex flex-col justify-between gap-9">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">{{ titlePage }}</h1>
            <Button v-if="!formVisible" label="Tambah Sub Kriteria" icon="pi pi-plus" @click="showFormAddEdit" />
            <Button v-if="formVisible" label="Kembali" icon="pi pi-arrow-left" @click="backFromForm" severity="info" />
        </div>

        <div v-if="!formVisible">
            <TreeTable :value="listTreeDataTable" :tableStyle="{ minWidth: '60rem' }" @node-expand="onRowExpand" @node-collapse="onRowCollapse">
                <!-- Kolom Nama Kategori -->
                <Column field="name" header="Nama Kriteria" expander></Column>

                <!-- Kolom dinamis -->
                <Column v-if="isExpanded" field="type" header="Type"></Column>
                <Column v-if="isExpanded" field="min_max" header="Min_Max"></Column>
                <Column v-if="isExpanded" field="p" header="P"></Column>
                <Column v-if="isExpanded" field="q" header="Q"></Column>
                <Column v-if="isExpanded" field="s" header="S"></Column>
                <Column v-if="isExpanded" header="Aksi">
                    <template #body="{ node }">
                        <!-- Tampilkan button hanya jika ini adalah child node (tidak memiliki children) -->
                        <div v-if="!node.children" class="flex justify-center gap-2">
                            <Button label="Edit" icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-sm" @click="showFormAddEdit(node.data._id)" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" @click="confirmDelete(node.data._id)" />
                        </div>
                    </template>
                </Column>
            </TreeTable>
        </div>

        <div class="card flex flex-col gap-4" v-if="formVisible">
            <div class="grid grid-cols-12 gap-2">
                <label for="email3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Kriteria</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <Dropdown v-model="selectedKriteria" :options="listKriteria" optionLabel="kriteria" optionValue="_id" placeholder="Pilih Kriteria" class="w-full xl:w-[75%]" showClear />
                        <small class="text-red-500" v-if="errors.kriteria">{{ errors.kriteria }}</small>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
                <label for="email3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Type Preferensi</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <Dropdown v-model="selectedTypePreferensi" :options="listTypePreferensi" optionLabel="type" optionValue="_id" placeholder="Pilih Type Preferensi" class="w-full xl:w-[75%]" showClear />
                        <small class="text-red-500" v-if="errors.kriteria">{{ errors.kriteria }}</small>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Nama Sub Kriteria</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <InputText v-model="inputSubKriteria" type="text" placeholder="Masukan Nama Sub Kriteria" class="w-full xl:w-[75%]" :class="errors.namaSubKriteria.length > 0 ? 'p-invalid' : ''" />
                        <small class="text-red-500" v-if="errors.namaSubKriteria">*{{ errors.namaSubKriteria }}</small>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
                <label for="email3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Min/Max</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <Dropdown v-model="selectedMinMax" :options="listMinMax" optionLabel="label" optionValue="value" placeholder="Pilih Nilai Min/Max" class="w-full xl:w-[75%]" :class="errors.min_max.length > 0 ? 'p-invalid' : ''" showClear />
                        <small class="text-red-500" v-if="errors.min_max">{{ errors.min_max }}</small>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Threshold P</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <InputNumber v-model="inputThsP" type="number" default-value="0" placeholder="Masukan Nilai Threshold P" class="w-full xl:w-[75%]" :class="errors.thresholdP.length > 0 ? 'p-invalid' : ''" />
                        <small class="text-red-500" v-if="errors.thresholdP">*{{ errors.thresholdP }}</small>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Threshold Q</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <InputNumber v-model="inputThsQ" type="number" default-value="0" placeholder="Masukan Nilai Threshold Q" class="w-full xl:w-[75%]" :class="errors.thresholdQ.length > 0 ? 'p-invalid' : ''" />
                        <small class="text-red-500" v-if="errors.thresholdQ">*{{ errors.thresholdQ }}</small>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Threshold S</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <InputNumber v-model="inputThsS" type="number" default-value="0" placeholder="Masukan Nilai Thresshold S" class="w-full xl:w-[75%]" :class="errors.thresholdS.length > 0 ? 'p-invalid' : ''" />
                        <small class="text-red-500" v-if="errors.thresholdS">*{{ errors.thresholdS }}</small>
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
