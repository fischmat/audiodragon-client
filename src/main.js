import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, FormInputPlugin, FormSelectPlugin, BootstrapVueIcons } from 'bootstrap-vue'
import VueKonva from 'vue-konva'
import { createPinia, PiniaVuePlugin } from 'pinia'
import VueCompositionAPI from '@vue/composition-api'
import Meta from 'vue-meta'

Vue.use(FormInputPlugin)
Vue.use(FormSelectPlugin)
Vue.use(BootstrapVueIcons)
Vue.use(BootstrapVue)
Vue.use(VueKonva)
Vue.use(Meta)

Vue.use(PiniaVuePlugin)
const pinia = createPinia()
Vue.use(VueCompositionAPI)

Vue.config.productionTip = false

new Vue({
  pinia,
  render: h => h(App)
}).$mount('#app')
