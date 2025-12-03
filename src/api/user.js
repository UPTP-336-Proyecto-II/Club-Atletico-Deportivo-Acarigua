import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/usuarios/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/usuarios/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/usuarios/logout',
    method: 'post'
  })
}
