import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
    const email = ref('');
    const name = ref('');
    const role = ref('');
    const isAuthenticated = ref(false);

    function loginIn(emailValue, nameValue, roleValue, isAuthenticatedValue) {
        email.value = emailValue;
        name.value = nameValue;
        role.value = roleValue;
        isAuthenticated.value = isAuthenticatedValue;
    }

    function logout() {
        email.value = '';
        name.value = '';
        role.value = '';
        isAuthenticated.value = false;
    }

    return {
        email,
        name,
        role,
        isAuthenticated,
        loginIn,
        logout
    };
});
