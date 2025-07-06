<script setup lang="js">
import { APIKriteria } from '@/service/KriteriaService';
import { APIProduk } from '@/service/ProdukService';
import { APISubKriteria } from '@/service/SubKriteriaService';
import { onMounted, ref } from 'vue';
import { APIHasil } from '@/service/HasilService';

const produk = ref([]);
const kriteria = ref([]);
const subKriteria = ref([]);
const hasil = ref([]);

onMounted(() => {
    getAllProduk();
    getAllKriteria();
    getAllSubKriteria();
    getAllHasil();
});

async function getAllProduk() {
    const response = await APIProduk.getAllProduk();
    produk.value = response.data;
}

async function getAllKriteria() {
    const response = await APIKriteria.getAllKriteria();
    kriteria.value = response.data;
}

async function getAllSubKriteria() {
    const response = await APISubKriteria.getAllSubKriteriaNonFormated();
    subKriteria.value = response.data;
}

async function getAllHasil() {
    const response = await APIHasil.getAllHasil();
    hasil.value = response.data;
}
</script>
<template>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Produk</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ produk.length }}</div>
                </div>
                <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi pi pi-box text-blue-500 !text-xl"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Kriteria</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ kriteria.length }}</div>
                </div>
                <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-sliders-h text-orange-500 !text-xl"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Sub Kriteria</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ subKriteria.length }}</div>
                </div>
                <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-sitemap text-cyan-500 !text-xl"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Hasil</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ hasil.length }}</div>
                </div>
                <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-check-circle text-purple-500 !text-xl"></i>
                </div>
            </div>
        </div>
    </div>
</template>
