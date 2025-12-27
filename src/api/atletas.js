import request from '@/utils/request'

export function getAtletas(params) {
  return request({
    url: '/atletas',
    method: 'get',
    params
  })
}

export function getAtletaById(id) {
  return request({
    url: `/atletas/${id}`,
    method: 'get'
  })
}
