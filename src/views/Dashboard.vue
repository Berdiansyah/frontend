<script setup>
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
import { APIUser } from '@/service/UserService';
import { useUserStore } from '@/store/UserStore';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

onMounted(async () => {
    const user = await APIUser.getUser();
    if (user) {
        userStore.loginIn(user.data.email, user.data.name, user.data.role, true);
    } else {
        router.push('/login');
    }
});
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <StatsWidget />

        <div class="col-span-12 xl:col-span-12">
            <div class="bg-white p-6 rounded-2xl shadow-lg">
                <h2 class="text-xl font-semibold text-gray-800 mb-4 text-center md:text-left">Sistem Penunjang Keputusan dengan Metode PROMETHEE</h2>
                <p class="text-gray-600 leading-relaxed mb-4 text-justify">
                    Sistem Penunjang Keputusan (SPK) adalah sebuah sistem berbasis komputer yang dirancang untuk membantu proses pengambilan keputusan, terutama dalam situasi yang kompleks dan memerlukan analisis multi-kriteria. Salah satu metode
                    populer dalam SPK adalah <strong>PROMETHEE</strong> (*Preference Ranking Organization Method for Enrichment Evaluation*).
                </p>
                <h3 class="text-lg font-medium text-gray-700 mb-2">Apa itu PROMETHEE?</h3>
                <p class="text-gray-600 leading-relaxed mb-4 text-justify">
                    PROMETHEE adalah metode yang digunakan untuk melakukan perankingan alternatif berdasarkan kriteria tertentu. Metode ini cocok digunakan dalam berbagai kasus, seperti pemilihan supplier, evaluasi kinerja, atau pemilihan produk
                    terlaris. PROMETHEE memiliki keunggulan dalam menangani data kualitatif maupun kuantitatif dan memungkinkan pengambil keputusan untuk memberikan bobot pada setiap kriteria sesuai tingkat kepentingannya.
                </p>
                <h3 class="text-lg font-medium text-gray-700 mb-2">Bagaimana PROMETHEE Bekerja?</h3>
                <ul class="list-disc list-inside text-gray-600 leading-relaxed mb-4">
                    <li>Menentukan alternatif dan kriteria yang akan dievaluasi.</li>
                    <li>Memberikan bobot pada setiap kriteria sesuai dengan prioritas.</li>
                    <li>Menghitung nilai preferensi untuk setiap pasangan alternatif menggunakan fungsi preferensi.</li>
                    <li>Menghitung nilai <em>leaving flow</em> (keluar) dan <em>entering flow</em> (masuk) untuk masing-masing alternatif.</li>
                    <li>Melakukan perankingan berdasarkan nilai net flow (<code>leaving flow - entering flow</code>).</li>
                </ul>
                <h3 class="text-lg font-medium text-gray-700 mb-2">Keunggulan PROMETHEE</h3>
                <ul class="list-disc list-inside text-gray-600 leading-relaxed">
                    <li>Mudah dipahami dan diterapkan.</li>
                    <li>Dapat menangani berbagai jenis data (kualitatif atau kuantitatif).</li>
                    <li>Memberikan fleksibilitas dalam penentuan bobot kriteria.</li>
                    <li>Mampu menghasilkan hasil yang transparan dan logis.</li>
                </ul>
            </div>
        </div>
    </div>
</template>
