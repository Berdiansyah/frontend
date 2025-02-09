// src/components/PrometheeCalculation.vue
<template>
    <div class="container mx-auto p-4">
        <div class="mb-8">
            <h1 class="text-2xl font-bold mb-4">PROMETHEE Calculation Results</h1>

            <!-- Filter Section -->
            <div class="mb-6 bg-white p-4 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-3">Filters</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block mb-2">Category</label>
                        <select v-model="selectedCategory" class="w-full p-2 border rounded">
                            <option value="">All Categories</option>
                            <option v-for="category in categories" :key="category" :value="category">
                                {{ category }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Criteria Weights Table -->
            <div class="mb-6 bg-white p-4 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-3">Criteria Weights</h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full table-auto">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="px-4 py-2">Criteria</th>
                                <th class="px-4 py-2">Sub-Criteria</th>
                                <th class="px-4 py-2">Weight</th>
                                <th class="px-4 py-2">Preference Type</th>
                                <th class="px-4 py-2">Parameters</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="weight in criteriaWeights" :key="weight._id">
                                <td class="border px-4 py-2">{{ weight.kriteria }}</td>
                                <td class="border px-4 py-2">{{ weight.nama_sub_kriteria }}</td>
                                <td class="border px-4 py-2">{{ weight.nilai_bobot }}</td>
                                <td class="border px-4 py-2">{{ weight.type }}</td>
                                <td class="border px-4 py-2">p: {{ weight.p }}, q: {{ weight.q }}, s: {{ weight.s }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Evaluation Matrix -->
            <div class="mb-6 bg-white p-4 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-3">Evaluation Matrix</h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full table-auto">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="px-4 py-2">Product</th>
                                <th v-for="criteria in criteriaList" :key="criteria._id" class="px-4 py-2">
                                    {{ criteria.nama_sub_kriteria }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="product in evaluationMatrix" :key="product._id">
                                <td class="border px-4 py-2">{{ product.produk }}</td>
                                <td v-for="value in product.values" :key="value.criteria_id" class="border px-4 py-2">
                                    {{ value.value }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- PROMETHEE Results -->
            <div class="mb-6 bg-white p-4 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-3">PROMETHEE Rankings</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Leaving Flow -->
                    <div>
                        <h3 class="font-semibold mb-2">Positive Flow (Φ+)</h3>
                        <div v-for="(flow, index) in positiveFlows" :key="index" class="flex justify-between p-2 border-b">
                            <span>{{ flow.product }}</span>
                            <span>{{ flow.value.toFixed(4) }}</span>
                        </div>
                    </div>
                    <!-- Entering Flow -->
                    <div>
                        <h3 class="font-semibold mb-2">Negative Flow (Φ-)</h3>
                        <div v-for="(flow, index) in negativeFlows" :key="index" class="flex justify-between p-2 border-b">
                            <span>{{ flow.product }}</span>
                            <span>{{ flow.value.toFixed(4) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Net Flow -->
                <div class="mt-6">
                    <h3 class="font-semibold mb-2">Net Flow (Φ)</h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full table-auto">
                            <thead>
                                <tr class="bg-gray-100">
                                    <th class="px-4 py-2">Rank</th>
                                    <th class="px-4 py-2">Product</th>
                                    <th class="px-4 py-2">Net Flow</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(result, index) in finalRanking" :key="index">
                                    <td class="border px-4 py-2">{{ index + 1 }}</td>
                                    <td class="border px-4 py-2">{{ result.product }}</td>
                                    <td class="border px-4 py-2">{{ result.netFlow.toFixed(4) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'PrometheeCalculation',
    data() {
        return {
            selectedCategory: '',
            categories: [],
            criteriaWeights: [],
            criteriaList: [],
            evaluationMatrix: [],
            positiveFlows: [],
            negativeFlows: [],
            finalRanking: []
        };
    },
    async created() {
        await this.fetchData();
    },
    methods: {
        async fetchData() {
            try {
                // Fetch all required data
                const [categories, weights, products] = await Promise.all([this.fetchCategories(), this.fetchCriteriaWeights(), this.fetchProducts()]);

                this.categories = categories;
                this.criteriaWeights = weights;
                await this.calculatePromethee(products);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        async fetchCategories() {
            const response = await axios.get('/hasil/getKategori');
            return response.data.data;
        },
        async fetchCriteriaWeights() {
            const response = await axios.get('/hasil/getBobotKriteria');
            return response.data;
        },
        async fetchProducts() {
            const response = await axios.get('/hasil/getProduct');
            return response.data;
        },
        async calculatePromethee(products) {
            // Calculate preference indices
            const preferenceIndices = this.calculatePreferenceIndices(products);

            // Calculate positive and negative flows
            const flows = this.calculateFlows(preferenceIndices);
            this.positiveFlows = flows.positiveFlows;
            this.negativeFlows = flows.negativeFlows;

            // Calculate net flows and final ranking
            this.finalRanking = this.calculateNetFlows(flows);
        },
        calculatePreferenceIndices(products) {
            // Implementation of preference calculation based on PROMETHEE methodology
            // This would include the actual preference function calculations
            // Returns a matrix of preference indices
        },
        calculateFlows(preferenceIndices) {
            // Calculate leaving and entering flows
            // Returns object with positiveFlows and negativeFlows arrays
        },
        calculateNetFlows({ positiveFlows, negativeFlows }) {
            // Calculate net flows and sort for final ranking
            return positiveFlows
                .map((pf, index) => ({
                    product: pf.product,
                    netFlow: pf.value - negativeFlows[index].value
                }))
                .sort((a, b) => b.netFlow - a.netFlow);
        }
    },
    watch: {
        selectedCategory: {
            handler(newCategory) {
                this.fetchData();
            }
        }
    }
};
</script>
