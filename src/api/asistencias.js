import request from '@/utils/request'

export function getAsistencias(params) {
  return request({
    url: '/asistencias',
    method: 'get',
    params
  })
}

export function createAsistencia(data) {
  return request({
    url: '/asistencias',
    method: 'post',
    data
  })
}

export function updateAsistencia(id, data) {
  return request({
    url: `/asistencias/${id}`,
    method: 'put',
    data
  })
}

export function deleteAsistencia(id) {
  return request({
    url: `/asistencias/${id}`,
    method: 'delete'
  })
}

export function getAsistenciasByFecha(fecha) {
  return request({
    url: `/asistencias/fecha/${fecha}`,
    method: 'get'
  })
}
