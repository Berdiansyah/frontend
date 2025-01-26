<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Sistem Penunjang Keputusan',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
            { label: 'Produk', icon: 'pi pi pi-box', to: '/produk' },
            { label: 'Bobot Produk', icon: 'pi pi pi-chart-bar', to: '/bobot-produk' },
            { label: 'Kriteria', icon: 'pi pi-sliders-h', to: '/kriteria' },
            { label: 'Sub Kriteria', icon: 'pi  pi-sitemap', to: '/sub-kriteria' },
            { label: 'Bobot Sub Kriteria', icon: 'pi pi-slack', to: '/bobot-sub-kriteria' },
            { label: 'Tipe Preferensi', icon: 'pi pi-objects-column', to: '/tipe-preferensi' },
            { label: 'Hasil', icon: 'pi pi-check-circle', to: '/hasil' },
            { label: 'User', icon: 'pi pi-users', to: '/user' }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
