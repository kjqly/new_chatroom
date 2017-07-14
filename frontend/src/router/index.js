import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import login from '@/components/login/login'
import websocket from '@/components/websocket/websocket'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: login
    },
	{
		path:'/websocket',
		name:'websocket',
		component:websocket
	}
  ]
})
