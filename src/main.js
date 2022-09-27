import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, FormInputPlugin, FormSelectPlugin } from 'bootstrap-vue'
import VueKonva from 'vue-konva'
import { createPinia, PiniaVuePlugin } from 'pinia'
import VueCompositionAPI from '@vue/composition-api'

Vue.use(FormInputPlugin)
Vue.use(FormSelectPlugin)
Vue.use(BootstrapVue)
Vue.use(VueKonva)

import './app.css'

Vue.use(PiniaVuePlugin)
const pinia = createPinia()
Vue.use(VueCompositionAPI)

Vue.config.productionTip = false

new Vue({
  pinia,
  render: h => h(App)
}).$mount('#app')
