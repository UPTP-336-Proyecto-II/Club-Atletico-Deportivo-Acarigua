import request from '@/utils/request'

export function getCategorias(params) {
  return request({
    url: '/categoria',
    method: 'get',
    params
  })
}

export function getCategoriaById(id) {
  return request({
    url: `/categoria/${id}`,
    method: 'get'
  })
}
