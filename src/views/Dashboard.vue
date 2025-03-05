<script setup lang="js">
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
import HamsterLoader from '@/components/HamsterLoader.vue';
import { APIUser } from '@/service/UserService';
import { useUserStore } from '@/store/UserStore';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const isLoading = ref(false);

onMounted(async () => {
    isLoading.value = true;
    try {
        const user = await APIUser.getUser();
        if (user) {
            userStore.loginIn(user.data.email, user.data.name, user.data.role, true);
        } else {
            router.push('/login');
        }
    } catch (error) {
        console.error(error);
    }
    isLoading.value = false;
});
</script>

<template>
    <HamsterLoader :is-loading="isLoading" />
    <div class="grid grid-cols-12 gap-8">
        <StatsWidget />

        <div class="col-span-12 xl:col-span-12">
            <div class="bg-white p-6 rounded-2xl shadow-lg">
                <h2 class="text-xl font-semibold text-gray-800 mb-4 text-center md:text-left">Sistem Penunjang Keputusan dengan Metode PROMETHEE</h2>
                <p class="text-gray-600 leading-relaxed mb-4 text-justify">
                    Sistem Penunjang Keputusan (SPK) adalah sebuah sistem berbasis komputer yang dirancang untuk membantu proses pengambilan keputusan, terutama dalam situasi yang kompleks dan memerlukan analisis multi-kriteria. Salah satu metode
                    populer dalam SPK adalah <strong>PROMETHEE</strong> (*Preference Ranking Organization Method for Enrichment Evaluation*).
                </p>
            </div>
        </div>
    </div>
</template>
