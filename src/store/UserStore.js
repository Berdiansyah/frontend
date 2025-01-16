import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', {
    state: () => {
        return {
            eamil: ref(''),
            name: ref(''),
            role: ref(''),
            isAuthenticated: ref(false)
        };
    },

    actions: {
        login({ email, name, role, auth }) {
            // Login akan mengatur state berdasarkan data yang diterima
            this.email = email;
            this.name = name;
            this.role = role;
            this.isAuthenticated = auth;
        },

        logout() {
            // Logout akan menghapus semua data dan set status isAuthenticated ke false
            this.userEmail = '';
            this.userName = '';
            this.gender = '';
            this.role = '';
            this.isAuthenticated = false;
        }
    }
});
