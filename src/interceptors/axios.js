import axios from 'axios';

// axios.defaults.baseURL = import.meta.env.VITE_BASE_API || 'http://localhost:5000';
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.defaults.withCredentials = true;

export default axios;

// axios.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         console.log(error.status_code);
//     }
// );

// axios.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response.data.error_schema?.error_code === '400-03') {
//       await axios.post('/auth/refreshUser').then(
//         async () => {
//           const userStore = useUserStore()
//           const response2 = await axios.get('/user')
//           userStore.loggedIn(
//             response2.data.output_schema.user_id,
//             response2.data.output_schema.name,
//             response2.data.output_schema.role,
//             response2.data.output_schema.profile_picture
//           )
//           router.push('/')
//         },
//         () => {
//           document.cookie = 'jwtToken' + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
//           document.cookie = 'refreshJwtToken' + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
//           router.push('/login')
//         }
//       )
//     }
//     if (error.response.data.error_schema?.error_code === '400-02') {
//       const userStore = useUserStore()
//       userStore.loggedIn('', null, null, '')
//       userStore.addGitlabDevToken('')
//       userStore.addGitlabProdToken('')
//       await router.push('/login')
//     }
//     return Promise.reject(error)
//   }
// )
