import Vue from 'vue'
import News from './Sort2.vue'
import VueFire from 'vuefire'

Vue.use(VueFire);

var vueinstance = new Vue({
  el: '#app',
  render: h => h(News)
})

console.log(vueinstance);

window.Vue = Vue;
