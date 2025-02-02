<script setup lang="js">
import router from '@/router';
import { APIUser } from '@/service/UserService';
import { Button, Dialog, useToast } from 'primevue';
import { onMounted, ref, watch } from 'vue';
import HamsterLoader from '@/components/HamsterLoader.vue';

//data template
const dialogVisible = ref(false);
const dialogMessage = ref('');
const currentActionType = ref('');
const titlePage = ref('Profile User');
const headerModal = ref('');
const isDeleteModal = ref(false);
const temporaryId = ref('');
const selectedValue = ref('');
const toast = useToast();
const isLoading = ref(false);

//data state
const user = ref({});
const inputName = ref('');
const inputEmail = ref('');
const selectedRole = ref('');

const listRole = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' }
];

// Form validation
const errors = ref({
    name: ''
});

onMounted(async () => {
    isLoading.value = true;
    try {
        await getUser();
        console.log(user.value);
        headerModal.value = '';
        temporaryId.value = '';
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Terjadi Kesalahan saat memproses aksi, silahkan hubungi tim IT', life: 3000 });
    }
    isLoading.value = false;
});

watch(inputName, (newValue) => {
    if (!newValue || newValue.trim() === '') {
        errors.value.name = '*Nama User harus diisi';
    } else if (newValue.length < 3) {
        errors.value.name = 'Nama User minimal 3 karakter';
    } else {
        errors.value.name = '';
    }
});

// Validation functions
function validateForm() {
    let isValid = true;

    // Reset errors
    errors.value = {
        name: ''
    };

    // Validate name
    if (!inputName.value || inputName.value.trim() === '') {
        errors.value.name = '*Nama User harus diisi';
        isValid = false;
    } else if (inputName.value.length < 3) {
        errors.value.name = 'Nama User minimal 3 karakter';
        isValid = false;
    }

    return isValid;
}

//function
async function getUser() {
    const response = await APIUser.getUser();
    user.value = response.data;
    inputName.value = user.value.name;
    inputEmail.value = user.value.email;
    selectedRole.value = user.value.role;
}

function backFromRoute() {
    router.back();
}

const showDialog = (type, value = null) => {
    currentActionType.value = type;
    selectedValue.value = value;
    const colorText = type === 'Hapus' ? '#ef4444 ' : '#0ea5e9';
    dialogMessage.value = `
    Apakah Anda yakin ingin
    <span style="text-decoration: underline; font-weight: bold; color:${colorText};">${type}</span>
    User
    <span style="text-decoration: underline; font-weight: bold; color:${colorText};"> ${value}</span>
    ini?`;
    dialogVisible.value = true;
};

function confirmAddEdit() {
    if (!validateForm()) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Mohon lengkapi semua field yang diperlukan', life: 3000 });
        return;
    }

    headerModal.value = 'Konfirmasi Edit User';
    showDialog('Ubah', user.value.name);
}

async function confirmAction() {
    isLoading.value = true 
    const data = {
        _id: user.value._id,
        email: inputEmail.value,
        name: inputName.value,
        role: selectedRole.value
    };

    try {
        console.log(data);
        await APIUser.updateUser(data);
        getUser();
        dialogVisible.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: `User ${user.value.name} berhasil diubah`, life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.response.data.message, life: 3000 });
        dialogVisible.value = false;
    }
    isLoading.value = false
}
</script>

<template>
    <HamsterLoader :is-loading="isLoading" />
    <div class="flex flex-col justify-between gap-9">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">{{ titlePage }}</h1>
            <Button label="Kembali" icon="pi pi-arrow-left" @click="backFromRoute" severity="info" />
        </div>

        <div class="card flex flex-col gap-4">
            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Nama</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <InputText v-model="inputName" type="text" placeholder="Masukan nama akun" class="w-full xl:w-[75%]" :class="errors.name > 0 ? 'p-invalid' : ''" />
                        <small class="text-red-500" v-if="errors.name">{{ errors.name }}</small>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Email</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <InputText disabled v-model="inputEmail" type="text" placeholder="Masukan email pengguna" class="w-full xl:w-[75%]" :class="errors.email > 0 ? 'p-invalid' : ''" />
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Role</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <Dropdown disabled v-model="selectedRole" :options="listRole" optionLabel="label" optionValue="value" placeholder="Pilih Kategori" class="w-full xl:w-[75%]" :class="errors.role > 0 ? 'p-invalid' : ''" showClear />
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-4 mt-10">
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
