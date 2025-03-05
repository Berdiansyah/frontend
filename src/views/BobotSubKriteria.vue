<script setup lang="js">
import { APIBobotSubKriteria } from '@/service/BobotSubKriteriaService';
import { APISubKriteria } from '@/service/SubKriteriaService';
import { Button, Column, DataTable, Dialog, TreeSelect, useToast } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';

//data template
const dialogVisible = ref(false);
const dialogMessage = ref('');
const currentActionType = ref('');
const formVisible = ref(false);
const titlePage = ref('Daftar Bobot Sub Kriteria');
const headerModal = ref('');
const isDeleteModal = ref(false);
const temporaryId = ref('');
const selectedValue = ref('');
const toast = useToast();
const isLoading = ref(false);

//data state
const listSubKriteria = ref([]);
const tempNamaBobot = ref('');
const selectedSubKriteria = ref(null);
const selectedSubKriteriaId = ref(null);
const inputNamaBobot = ref('');
const inputNilaiBobot = ref('');
const listBobotSubKriteria = ref([]);
const listBobotSubKriteriaWithNumber = computed(() =>
    listBobotSubKriteria.value.map((item, index) => ({
        ...item,
        no: index + 1,
        sub_kriteria_name: getSubKriteriaName(item.id_sub_kriteria)
    }))
);

// Fungsi untuk mengubah format data untuk TreeSelect
const formatSubKriteriaForTree = computed(() => {
    return listSubKriteria.value.map((item) => ({
        key: item.key,
        label: item.data.name,
        selectable: false,
        children:
            item.children?.map((child) => ({
                key: child.key,
                label: child.data.name,
                data: child.data, // Store complete child data
                selectable: true
            })) || []
    }));
});

const getSubKriteriaName = (id) => {
    for (const parent of listSubKriteria.value) {
        const child = parent.children?.find((child) => child.data._id === id);
        if (child) {
            return `${parent.data.name} - ${child.data.name}`;
        }
    }
    return '';
};

// Form validation
const errors = ref({
    subKriteria: '',
    namaBobot: '',
    nilaiBobot: ''
});
const actionType = {
    add: 'Tambah',
    edit: 'Edit',
    delete: 'Hapus'
};

onMounted(async () => {
    isLoading.value = true;
    try {
        await getAllBobotSubKriteria();
        await getAllSubKriteria();
        headerModal.value = '';
        temporaryId.value = '';
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Terjadi Kesalahan saat memproses aksi, silahkan hubungi tim IT', life: 3000 });
    }
    isLoading.value = false;
});

// Watch untuk selectedSubKriteria
watch(selectedSubKriteria, (newValue) => {
    if (newValue && Object.keys(newValue).length > 0) {
        const dynamicObject = selectedSubKriteria.value;
        Object.entries(dynamicObject).forEach(([key, value]) => {
            const selectedNode = findNode(key, formatSubKriteriaForTree.value);
            if (selectedNode && selectedNode.data) {
                const getSubKriteriaId = Object.values(selectedNode.data);
                selectedSubKriteriaId.value = getSubKriteriaId[0];
                errors.value.subKriteria = '';
            }
        });
    } else {
        selectedSubKriteriaId.value = null;
        if (!temporaryId.value) {
            // Only show error if not in edit mode
            errors.value.subKriteria = 'Sub Kriteria harus dipilih';
        }
    }
});

// Watch untuk inputNamaBobot
watch(inputNamaBobot, (newValue) => {
    if (!newValue || newValue.trim() === '') {
        errors.value.namaBobot = 'Nama Bobot harus diisi';
    } else if (newValue.length < 3) {
        errors.value.namaBobot = 'Nama Bobot minimal 3 karakter';
    } else {
        errors.value.namaBobot = '';
    }
});

// Watch untuk inputNilaiBobot
watch(inputNilaiBobot, (newValue) => {
    if (!newValue || newValue.trim() === '') {
        errors.value.nilaiBobot = 'Nilai Bobot harus diisi';
    } else if (isNaN(newValue)) {
        errors.value.nilaiBobot = 'Nilai Bobot harus berupa angka';
    } else if (parseFloat(newValue) < 0) {
        errors.value.nilaiBobot = 'Nilai Bobot tidak boleh negatif';
    } else {
        errors.value.nilaiBobot = '';
    }
});

function validateForm() {
    let isValid = true;
    errors.value = {
        subKriteria: '',
        namaBobot: '',
        nilaiBobot: ''
    };

    if (!selectedSubKriteriaId.value) {
        errors.value.subKriteria = 'Sub Kriteria harus dipilih';
        isValid = false;
    }

    if (!inputNamaBobot.value || !inputNamaBobot.value.trim()) {
        errors.value.namaBobot = 'Nama Bobot harus diisi';
        isValid = false;
    }

    if (!inputNilaiBobot.value || !inputNilaiBobot.value.trim()) {
        errors.value.nilaiBobot = 'Nilai Bobot harus diisi';
        isValid = false;
    }

    return isValid;
}

async function getAllBobotSubKriteria() {
    const response = await APIBobotSubKriteria.getAllBobotSubKriteria();
    listBobotSubKriteria.value = response.data;
}

async function getAllSubKriteria() {
    const response = await APISubKriteria.getAllSubKriteria();
    listSubKriteria.value = response.data;
}

function formAddBobotSubKriteria() {
    formVisible.value = true;
    titlePage.value = 'Tambah Bobot Sub Kriteria';
    clearErrors();
}

function findTreeNodeKeyById(id) {
    for (const parent of listSubKriteria.value) {
        const child = parent.children?.find((child) => child.data._id === id);
        if (child) {
            return child.key;
        }
    }
    return null;
}

async function formEditBobotSubKriteria(id, nama_bobot) {
    const bobotSubKriteria = listBobotSubKriteria.value.find((item) => item._id === id);
    if (bobotSubKriteria) {
        // Wait for sub kriteria data to be loaded if not already loaded
        if (listSubKriteria.value.length === 0) {
            await getAllSubKriteria();
        }

        // Find the tree node key for the selected sub kriteria
        const nodeKey = findTreeNodeKeyById(bobotSubKriteria.id_sub_kriteria);

        // Create the selected sub kriteria object structure expected by TreeSelect
        selectedSubKriteria.value = { [nodeKey]: true };
        selectedSubKriteriaId.value = bobotSubKriteria.id_sub_kriteria;

        // Set other form values
        inputNamaBobot.value = bobotSubKriteria.nama_bobot;
        inputNilaiBobot.value = bobotSubKriteria.nilai_bobot.toString();
    }

    tempNamaBobot.value = nama_bobot;
    formVisible.value = true;
    titlePage.value = 'Edit Bobot Sub Kriteria';
    temporaryId.value = id;
    clearErrors();
}

function clearErrors() {
    errors.value = {
        subKriteria: '',
        namaBobot: '',
        nilaiBobot: ''
    };
}

function backFromForm() {
    formVisible.value = false;
    titlePage.value = 'Daftar Bobot Sub Kriteria';
    temporaryId.value = '';
    selectedSubKriteria.value = null;
    inputNamaBobot.value = '';
    tempNamaBobot.value = '';
    inputNilaiBobot.value = '';
    clearErrors();
}

const showDialog = (type, value = null) => {
    currentActionType.value = type;
    selectedValue.value = value;
    const colorText = type === 'delete' ? '#ef4444 ' : '#0ea5e9';
    dialogMessage.value = `
    Apakah Anda yakin ingin
    <span style="text-decoration: underline; font-weight: bold; color:${colorText};">${type}</span>
    Bobot Sub Kriteria
    <span style="text-decoration: underline; font-weight: bold; color:${colorText};">${value}</span>
    ini?`;
    dialogVisible.value = true;
};

function confirmDelete(id) {
    const product = listBobotSubKriteria.value.find((item) => item._id === id);
    headerModal.value = 'Konfirmasi Hapus Bobot Sub Kriteria';
    isDeleteModal.value = true;
    temporaryId.value = id;
    showDialog('Hapus', product.nama_bobot);
}

function findNode(key, nodes) {
    for (const node of nodes) {
        if (node.key === key) {
            return node; // Node ditemukan
        }

        if (node.children) {
            const found = findNode(key, node.children);
            if (found) return found;
        }
    }

    return null; // Tidak ditemukan
}

function confirmAddEdit() {
    if (!validateForm()) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Mohon lengkapi semua field yang diperlukan', life: 3000 });
        return;
    }

    if (temporaryId.value.length > 0) {
        headerModal.value = 'Konfirmasi Edit Type Preferensi';
        showDialog('Edit', tempNamaBobot.value);
    } else {
        headerModal.value = 'Konfirmasi Tambah Type Preferensi';
        showDialog('Tambah', inputNamaBobot.value);
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
    const data = {
        _id: temporaryId.value,
        id_sub_kriteria: selectedSubKriteriaId.value,
        nama_bobot: inputNamaBobot.value,
        nilai_bobot: inputNilaiBobot.value
    };

    if (currentActionType.value === actionType.delete) {
        try {
            await APIBobotSubKriteria.deleteBobotSubKriteria({ _id: temporaryId.value });
            await getAllBobotSubKriteria();
            clearState();
            isLoading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: 'Bobot Sub Kriteria berhasil dihapus', life: 3000 });
        } catch (error) {
            dialogVisible.value = false;
            console.error(error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Terjadi Kesalahan saat memproses aksi, silahkan hubungi tim IT', life: 3000 });
            isLoading.value = false;
        }
    } else if (currentActionType.value === actionType.edit) {
        try {
            await APIBobotSubKriteria.updateBobotSubKriteria(data);
            await getAllBobotSubKriteria();
            backFromForm();
            clearState();
            isLoading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: 'Bobot Sub Kriteria berhasil diubah', life: 3000 });
        } catch (error) {
            dialogVisible.value = false;
            console.error(error);
            toast.add({ severity: 'error', summary: 'Error', detail: error.response.data.message, life: 3000 });
            isLoading.value = false;
        }
    } else {
        try {
            await APIBobotSubKriteria.addBobotSubKriteria(data);
            await getAllBobotSubKriteria();
            clearState();
            backFromForm();
            isLoading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: 'Bobot Sub Kriteria berhasil ditambahkan', life: 3000 });
        } catch (error) {
            dialogVisible.value = false;
            console.error(error);
            toast.add({ severity: 'error', summary: 'Error', detail: error.response.data.message, life: 3000 });
            isLoading.value = false;
        }
    }
}
</script>

<template>
    <HamsterLoader :is-loading="isLoading" />
    <div class="flex flex-col justify-between gap-9">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">{{ titlePage }}</h1>
            <Button v-if="!formVisible" label="Tambah Bobot" icon="pi pi-plus" @click="formAddBobotSubKriteria" />
            <Button v-if="formVisible" label="Kembali" icon="pi pi-arrow-left" @click="backFromForm" severity="info" />
        </div>

        <div v-if="!formVisible">
            <DataTable :value="listBobotSubKriteriaWithNumber" paginator :rows="10">
                <Column field="no" header="No" />
                <Column field="sub_kriteria_name" header="Sub Kriteria" />
                <Column field="nama_bobot" header="Nama Bobot" />
                <Column field="nilai_bobot" header="Nilai Bobot" />
                <Column header="Aksi">
                    <template #body="{ data }">
                        <div class="flex justify-center gap-2">
                            <Button label="Edit" icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-sm" @click="formEditBobotSubKriteria(data._id, data.nama_bobot)" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" @click="confirmDelete(data._id)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <div class="card flex flex-col gap-4" v-if="formVisible">
            <div class="grid grid-cols-12 gap-2">
                <label for="email3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Sub Kriteria</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <TreeSelect tree v-model="selectedSubKriteria" :options="formatSubKriteriaForTree" placeholder="Pilih Sub Kriteria" class="w-full xl:w-[75%]" :class="errors.subKriteria ? 'p-invalid' : ''" :metaKeySelection="false" />
                        <small class="text-red-500" v-if="errors.subKriteria"> *{{ errors.subKriteria }} </small>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Nama Bobot</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <InputText v-model="inputNamaBobot" type="text" placeholder="Masukan Nama Bobot" class="w-full xl:w-[75%]" :class="errors.namaBobot ? 'p-invalid' : ''" />
                        <small class="text-red-500" v-if="errors.namaBobot">*{{ errors.namaBobot }}</small>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Nilai Bobot</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <InputText v-model="inputNilaiBobot" type="text" placeholder="Masukan Nilai Bobot" class="w-full xl:w-[75%]" :class="errors.nilaiBobot ? 'p-invalid' : ''" />
                        <small class="text-red-500" v-if="errors.nilaiBobot">*{{ errors.nilaiBobot }}</small>
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
