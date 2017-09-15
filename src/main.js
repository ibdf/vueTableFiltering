import Vue from 'vue'
import News from './Sort.vue'
import VueFire from 'vuefire'

Vue.use(VueFire);

new Vue({
  el: '#app',
  render: h => h(News)
})

window.Vue = Vue;
