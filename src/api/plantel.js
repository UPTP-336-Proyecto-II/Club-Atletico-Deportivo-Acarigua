import request from '@/utils/request'

export function getPlantel(params) {
  return request({
    url: '/plantel',
    method: 'get',
    params
  })
}

export function getPlantelByRol(rol) {
  return request({
    url: `/plantel/rol/${rol}`,
    method: 'get'
  })
}
