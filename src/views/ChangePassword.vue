<script setup lang="js">
import router from '@/router';
import { APIUser } from '@/service/UserService';
import { useUserStore } from '@/store/UserStore';
import { Button, Dialog, useToast } from 'primevue';
import { ref, watch } from 'vue';
import HamsterLoader from '@/components/HamsterLoader.vue';

const dialogVisible = ref(false);
const dialogMessage = ref('');
const currentActionType = ref('');
const titlePage = ref('Change Password');
const headerModal = ref('');
const toast = useToast();
const userStore = useUserStore();
const isLoading = ref(false);

const inputCurrentPassword = ref('');
const inputNewPassword = ref('');
const inputReNewPassword = ref('');
const showPassword = ref(false);
const showNewPassword = ref(false);
const showReNewPassword = ref(false);

const errors = ref({
    currentPassword: '',
    newPassword: '',
    reNewPassword: ''
});

watch(inputCurrentPassword, (newValue) => {
    errors.value.currentPassword = !newValue || newValue.trim() === '' ? '*Password harus diisi' : newValue.length < 6 ? '*Password minimal 6 karakter' : '';
});

watch(inputNewPassword, (newValue) => {
    errors.value.newPassword = !newValue || newValue.trim() === '' ? '*New Password harus diisi' : newValue.length < 6 ? '*New Password minimal 6 karakter' : '';

    // Validate re-password match
    errors.value.reNewPassword = inputReNewPassword.value && inputReNewPassword.value !== newValue ? '*New Password tidak cocok' : '';
});

watch(inputReNewPassword, (newValue) => {
    errors.value.reNewPassword = !newValue || newValue.trim() === '' ? '*Re-New Password harus diisi' : newValue !== inputNewPassword.value ? '*New Password tidak cocok' : '';
});

function validateForm() {
    let isValid = true;

    // Reset errors
    errors.value = {
        currentPassword: '',
        newPassword: '',
        reNewPassword: ''
    };

    // Validate current password
    if (!inputCurrentPassword.value || inputCurrentPassword.value.trim() === '') {
        errors.value.currentPassword = '*Password harus diisi';
        isValid = false;
    } else if (inputCurrentPassword.value.length < 6) {
        errors.value.currentPassword = '*Password minimal 6 karakter';
        isValid = false;
    }

    // Validate new password
    if (!inputNewPassword.value || inputNewPassword.value.trim() === '') {
        errors.value.newPassword = '*New Password harus diisi';
        isValid = false;
    } else if (inputNewPassword.value.length < 6) {
        errors.value.newPassword = '*New Password minimal 6 karakter';
        isValid = false;
    }

    // Validate re-new password
    if (!inputReNewPassword.value || inputReNewPassword.value.trim() === '') {
        errors.value.reNewPassword = '*Re-New Password harus diisi';
        isValid = false;
    } else if (inputReNewPassword.value !== inputNewPassword.value) {
        errors.value.reNewPassword = '*Password tidak cocok';
        isValid = false;
    }

    return isValid;
}

function confirmAddEdit() {
    if (!validateForm()) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Mohon lengkapi semua field yang diperlukan',
            life: 3000
        });
        return;
    }

    headerModal.value = 'Konfirmasi Ubah Password';
    showDialog('Mengubah', userStore.email);
}

function showDialog(type, value = null) {
    currentActionType.value = type;
    const colorText = type === 'Hapus' ? '#ef4444' : '#0ea5e9';
    dialogMessage.value = `
    Apakah Anda yakin ingin
    <span style="text-decoration: underline; font-weight: bold; color:${colorText};">${type}</span>
    Password User 
    <span style="text-decoration: underline; font-weight: bold; color:${colorText};"> ${value}</span>
    ini?`;
    dialogVisible.value = true;
}

async function confirmAction() {
    isLoading.value = true
    const data = {
        currentPassword: inputCurrentPassword.value,
        newPassword: inputNewPassword.value
    };
    try {
        await APIUser.changePassword(data);
        backFromForm();
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Password berhasil diubah',
            life: 3000
        });
        resetInput();
        dialogVisible.value = false;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Gagal mengubah password',
            life: 3000
        });
        dialogVisible.value = false;
    }
    isLoading.value = false
}

function backFromForm() {
    router.back();
}

function togglePassword(type) {
    switch (type) {
        case 'current':
            showPassword.value = !showPassword.value;
            break;
        case 'new':
            showNewPassword.value = !showNewPassword.value;
            break;
        case 're':
            showReNewPassword.value = !showReNewPassword.value;
            break;
    }
}

function resetInput() {
    inputCurrentPassword.value = '';
    inputNewPassword.value = '';
    inputReNewPassword.value = '';
}
</script>

<template>
    <HamsterLoader :is-loading="isLoading" />
    <!-- Template remains mostly the same, with minor adjustments to use new togglePassword function -->
    <div class="flex flex-col justify-between gap-9">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">{{ titlePage }}</h1>
            <Button label="Kembali" icon="pi pi-arrow-left" @click="backFromForm" severity="info" />
        </div>

        <div class="card flex flex-col gap-4">
            <div class="grid grid-cols-12 gap-2">
                <label class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Current Password</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2">
                        <div class="flex flex-col gap-2 relative w-full xl:w-[75%]">
                            <InputText v-model="inputCurrentPassword" :type="showPassword ? 'text' : 'password'" placeholder="Masukkan Password" :class="errors.currentPassword ? 'p-invalid' : ''" />
                            <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500" @click="togglePassword('current')"></i>
                        </div>
                        <small class="text-red-500" v-if="errors.currentPassword">{{ errors.currentPassword }}</small>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
                <label class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">New Password</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2 relative">
                        <div class="flex flex-col gap-2 relative w-full xl:w-[75%]">
                            <InputText v-model="inputNewPassword" :type="showNewPassword ? 'text' : 'password'" placeholder="Masukkan Password" :class="errors.newPassword ? 'p-invalid' : ''" />
                            <i :class="showNewPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500" @click="togglePassword('new')"></i>
                        </div>
                        <small class="text-red-500" v-if="errors.newPassword">{{ errors.newPassword }}</small>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
                <label class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Re-New Password</label>
                <div class="col-span-12 md:col-span-10">
                    <div class="flex flex-col gap-2 relative">
                        <div class="flex flex-col gap-2 relative w-full xl:w-[75%]">
                            <InputText v-model="inputReNewPassword" :type="showReNewPassword ? 'text' : 'password'" placeholder="Masukkan Ulang Password" :class="errors.reNewPassword ? 'p-invalid' : ''" />
                            <i :class="showReNewPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500" @click="togglePassword('re')"></i>
                        </div>
                        <small class="text-red-500" v-if="errors.reNewPassword">{{ errors.reNewPassword }}</small>
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
                <Button label="Tidak" severity="warn" icon="pi pi-times" @click="dialogVisible = false" class="p-button-text" />
                <Button label="Ya" severity="primary" icon="pi pi-check" @click="confirmAction" />
            </div>
        </div>
    </Dialog>
</template>
