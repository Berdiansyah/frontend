import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const Login = () => import('@/views/Login.vue');
const Produk = () => import('@/views/Produk.vue');
const BobotProduk = () => import('@/views/BobotProduk.vue');
const TipePreferensi = () => import('@/views/TipePreferensi.vue');
const Kriteria = () => import('@/views/Kriteria.vue');
const SubKriteria = () => import('@/views/SubKriteria.vue');
const BobotSubKriteria = () => import('@/views/BobotSubKriteria.vue');
const User = () => import('@/views/User.vue');
const ChangePassword = () => import('@/views/ChangePassword.vue');
const Profile = () => import('@/views/Profile.vue');

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: {
                        requiresAuth: true
                    }
                },
                {
                    path: '/produk',
                    name: 'produk',
                    component: Produk
                },
                {
                    path: '/bobot-produk',
                    name: 'bobot-produk',
                    component: BobotProduk
                },
                {
                    path: '/kriteria',
                    name: 'kritearia',
                    component: Kriteria
                },
                {
                    path: '/sub-kriteria',
                    name: 'sub-kriteria',
                    component: SubKriteria
                },
                {
                    path: '/tipe-preferensi',
                    name: 'tipe-preferensi',
                    component: TipePreferensi
                },
                {
                    path: '/bobot-sub-kriteria',
                    name: 'bobot-sub-kriteria',
                    component: BobotSubKriteria
                },
                {
                    path: '/user',
                    name: 'user',
                    component: User
                },
                {
                    path: '/profile',
                    name: 'profile',
                    component: Profile
                },
                {
                    path: '/change-password',
                    name: 'change-password',
                    component: ChangePassword
                }
            ],
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        }
    ]
});

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        const token = localStorage.getItem('accessToken');
        if (token) {
            next();
        } else {
            next('/login');
        }
    } else {
        next();
    }
});

export default router;
