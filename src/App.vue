<script setup>
import { useUserStore } from './store/UserStore';
const userStore = useUserStore();
</script>

<template>
    <router-view />
</template>

<style scoped></style>
