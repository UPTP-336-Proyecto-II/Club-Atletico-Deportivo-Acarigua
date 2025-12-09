import request from '@/utils/request'

export function getCategorias(params) {
  return request({
    url: '/categoria',
    method: 'get',
    params
  })
}

export function createCategoria(data) {
  return request({
    url: '/categoria',
    method: 'post',
    data
  })
}

export function updateCategoria(id, data) {
  return request({
    url: `/categoria/${id}`,
    method: 'put',
    data
  })
}

export function deleteCategoria(id) {
  return request({
    url: `/categoria/${id}`,
    method: 'delete'
  })
}

export function getPlantel(params) {
  return request({
    url: '/plantel',
    method: 'get',
    params
  })
}

export function getAtletas(params) {
  return request({
    url: '/atletas',
    method: 'get',
    params
  })
}
