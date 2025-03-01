<script setup lang="js">
import HamsterLoader from '@/components/HamsterLoader.vue';
import { APIUser } from '@/service/UserService';
import { Button, Column, DataTable, Dialog, useToast } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';

//data template
const dialogVisible = ref(false);
const dialogMessage = ref('');
const currentActionType = ref('');
const formVisible = ref(false);
const titlePage = ref('Daftar Users');
const headerModal = ref('');
const isDeleteModal = ref(false);
const temporaryId = ref('');
const selectedValue = ref('');
const toast = useToast();
const isLoading = ref(false);

//data state
const listUsers = ref([]);
const inputName = ref('');
const inputEmail = ref('');
const selectedRole = ref(null);
const inputPassword = ref('');
const inputRePassword = ref('');
const showPassword = ref(false);
const showRePassword = ref(false);

const listUsersWithNumber = computed(() =>
    listUsers.value.map((item, index) => ({
        ...item,
        no: index + 1
    }))
);

const listRole = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' }
];

// Form validation
const errors = ref({
    name: '',
    email: '',
    role: '',
    password: '',
    rePassword: ''
});
const actionType = {
    add: 'Tambah',
    edit: 'Edit',
    delete: 'Hapus'
};

onMounted(async () => {
    isLoading.value = true;
    try {
        await getAllUsers();
        console.log(listUsers.value);
        headerModal.value = '';
        temporaryId.value = '';
    } catch (error) {
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

watch(inputEmail, (newValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex untuk memvalidasi format email

    if (!newValue || newValue.trim() === '') {
        errors.value.email = '*Email harus diisi';
    } else if (!emailRegex.test(newValue)) {
        errors.value.email = 'Format email tidak valid';
    } else {
        errors.value.email = '';
    }
});

watch(selectedRole, (newValue) => {
    if (!newValue) {
        errors.value.role = '*Role harus dipilih';
    } else {
        errors.value.role = '';
    }
});

watch(inputPassword, (newValue) => {
    if (!newValue || newValue.trim() === '') {
        errors.value.password = '*Password harus diisi';
    } else if (newValue.length < 6) {
        errors.value.password = 'Password minimal 6 karakter';
    } else {
        errors.value.password = '';
    }

    // Re-check rePassword validation
    if (inputRePassword.value && inputRePassword.value !== newValue) {
        errors.value.rePassword = 'Password tidak cocok';
    } else {
        errors.value.rePassword = '';
    }
});

watch(inputRePassword, (newValue) => {
    if (!newValue || newValue.trim() === '') {
        errors.value.rePassword = '*Re-Password harus diisi';
    } else if (newValue !== inputPassword.value) {
        errors.value.rePassword = 'Password tidak cocok';
    } else {
        errors.value.rePassword = '';
    }
});

// Validation functions
function validateForm() {
    let isValid = true;

    // Reset errors
    errors.value = {
        name: '',
        email: '',
        role: '',
        password: '',
        rePassword: '',
        TypePreferensi: ''
    };

    // Validate name
    if (!inputName.value || inputName.value.trim() === '') {
        errors.value.name = '*Nama User harus diisi';
        isValid = false;
    } else if (inputName.value.length < 3) {
        errors.value.name = 'Nama User minimal 3 karakter';
        isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex untuk memvalidasi format email
    if (!inputEmail.value || inputEmail.value.trim() === '') {
        errors.value.email = '*Email harus diisi';
        isValid = false;
    } else if (!emailRegex.test(inputEmail.value)) {
        errors.value.email = 'Format email tidak valid';
        isValid = false;
    }

    // Validate role
    if (!selectedRole.value) {
        errors.value.role = '*Role harus dipilih';
        isValid = false;
    }

    // Validate password
    if (temporaryId.value.length === 0) {
        if (!inputPassword.value || inputPassword.value.trim() === '') {
            errors.value.password = '*Password harus diisi';
            isValid = false;
        } else if (inputPassword.value.length < 6) {
            errors.value.password = 'Password minimal 6 karakter';
            isValid = false;
        }

        // Validate re-password
        if (!inputRePassword.value || inputRePassword.value.trim() === '') {
            errors.value.rePassword = '*Re-Password harus diisi';
            isValid = false;
        } else if (inputRePassword.value !== inputPassword.value) {
            errors.value.rePassword = 'Password tidak cocok';
            isValid = false;
        }
    }

    return isValid;
}

//function
async function getAllUsers() {
    const response = await APIUser.getAllUser();
    listUsers.value = response.data;
}

function formAddEdit(id = '') {
    if (id.length > 0) {
        const user = listUsers.value.find((item) => item._id === id);
        formVisible.value = true;
        titlePage.value = 'Edit User';
        inputName.value = user.name;
        inputEmail.value = user.email;
        selectedRole.value = user.role;
        temporaryId.value = id;
        clearErrors();
    } else {
        formVisible.value = true;
        titlePage.value = 'Tambah User';
        console.log(temporaryId.value);
        clearErrors();
    }
}

function clearErrors() {
    errors.value = {
        name: '',
        email: '',
        role: '',
        password: '',
        rePassword: ''
    };
}

function backFromForm() {
    formVisible.value = false;
    titlePage.value = 'Daftar Type Preferensi';
    inputName.value = '';
    inputEmail.value = '';
    selectedRole.value = null;
    temporaryId.value = '';
    clearErrors();
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

function confirmDelete(id) {
    const product = listUsers.value.find((item) => item._id === id);
    headerModal.value = 'Konfirmasi Hapus Type Preferensi';
    isDeleteModal.value = true;
    temporaryId.value = id;
    showDialog('Hapus', product.name);
}

function confirmAddEdit() {
    if (!validateForm()) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Mohon lengkapi semua field yang diperlukan', life: 3000 });
        return;
    }

    if (temporaryId.value.length > 0) {
        const user = listUsers.value.find((item) => item._id === temporaryId.value);
        headerModal.value = 'Konfirmasi Edit User';
        showDialog('Edit', user.name);
    } else {
        headerModal.value = 'Konfirmasi Tambah User';
        showDialog('Tambah', inputName.value);
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
    let data;
    if (temporaryId.value.length > 0) {
        data = {
            _id: temporaryId.value,
            email: inputEmail.value,
            name: inputName.value,
            role: selectedRole.value
        };
    } else {
        data = {
            _id: temporaryId.value,
            email: inputEmail.value,
            password: inputRePassword.value,
            name: inputName.value,
            role: selectedRole.value
        };
    }
    if (currentActionType.value === actionType.delete) {
        try {
            const user = listUsers.value.find((data) => data._id === temporaryId.value);
            await APIUser.deleteUser({ _id: temporaryId.value });
            await getAllUsers();
            clearState();
            isLoading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: `User ${user.name} berhasil dihapus`, life: 3000 });
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: error.response.data.message, life: 3000 });
            dialogVisible.value = false;
        }
    } else if (currentActionType.value === actionType.edit) {
        try {
            console.log(data);
            const user = listUsers.value.find((data) => data._id === temporaryId.value);
            await APIUser.updateUser(data);
            await getAllUsers();
            backFromForm();
            clearState();
            isLoading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: `User ${user.name} berhasil diubah`, life: 3000 });
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: error.response.data.message, life: 3000 });
            dialogVisible.value = false;
        }
    } else {
        try {
            await APIUser.adduser(data);
            await getAllUsers();
            clearState();
            backFromForm();
            isLoading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: `User ${data.name} berhasil ditambahkan.`, life: 3000 });
        } catch (error) {
            console.error(error);
            toast.add({ severity: 'error', summary: 'Error', detail: error.response.data.message, life: 3000 });
            dialogVisible.value = false;
        }
    }
}

function togglePassword() {
    showPassword.value = !showPassword.value;
}

function toggleRePassword() {
    showRePassword.value = !showRePassword.value;
}
</script>

<template>
    <HamsterLoader :is-loading="isLoading" />
    <div class="flex flex-col justify-between gap-9">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">{{ titlePage }}</h1>
            <Button v-if="!formVisible" label="Tambah User" icon="pi pi-plus" @click="formAddEdit" />
            <Button v-if="formVisible" label="Kembali" icon="pi pi-arrow-left" @click="backFromForm" severity="info" />
        </div>

        <div v-if="!formVisible">
            <DataTable :value="listUsersWithNumber" paginator :rows="10">
                <Column field="no" header="No" />
                <Column field="email" header="Email" />
                <Column field="name" header="Name" />
                <Column field="role" header="Role" />
                <Column header="Aksi">
                    <template #body="{ data }">
                        <div class="flex justify-center gap-2">
                            <Button label="Edit" icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-sm" @click="formAddEdit(data._id)" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" @click="confirmDelete(data._id)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <div class="card flex flex-col gap-4" v-if="formVisible">
            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Nama</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <InputText v-model="inputName" type="text" placeholder="Masukan nama akun" class="w-full xl:w-[75%]" :class="errors.name > 0 ? 'p-invalid' : ''" />
                        <small class="text-red-500" v-if="errors.name">*{{ errors.name }}</small>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Email</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <InputText v-model="inputEmail" type="text" placeholder="Masukan email pengguna" class="w-full xl:w-[75%]" :class="errors.email > 0 ? 'p-invalid' : ''" />
                        <small class="text-red-500" v-if="errors.email">*{{ errors.email }}</small>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Role</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <Dropdown v-model="selectedRole" :options="listRole" optionLabel="label" optionValue="value" placeholder="Pilih Kategori" class="w-full xl:w-[75%]" :class="errors.role > 0 ? 'p-invalid' : ''" showClear />
                        <small class="text-red-500" v-if="errors.role">*{{ errors.role }}</small>
                    </div>
                </div>
            </div>

            <div v-if="temporaryId.length == 0" class="grid grid-cols-12 gap-2">
                <label for="password" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Password</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2 relative">
                        <InputText v-model="inputPassword" :type="showPassword ? 'text' : 'password'" placeholder="Masukkan Password" class="w-full xl:w-[75%]" :class="errors.password ? 'p-invalid' : ''" />
                        <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 xl:w-[28%]" @click="togglePassword"></i>
                        <small class="text-red-500" v-if="errors.password">*{{ errors.password }}</small>
                    </div>
                </div>
            </div>

            <!-- Re-Password -->
            <div v-if="temporaryId.length == 0" class="grid grid-cols-12 gap-2">
                <label for="rePassword" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Re-Password</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2 relative">
                        <InputText v-model="inputRePassword" :type="showRePassword ? 'text' : 'password'" placeholder="Masukkan Ulang Password" class="w-full xl:w-[75%]" :class="errors.rePassword ? 'p-invalid' : ''" />
                        <i :class="showRePassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 xl:w-[28%]" @click="toggleRePassword"></i>
                        <small class="text-red-500" v-if="errors.rePassword">*{{ errors.rePassword }}</small>
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
