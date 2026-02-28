import client from './client'

export const authApi = {
  logout() {
    const refreshToken = localStorage.getItem('refreshToken')
    return client.post('/auth/logout', { refreshToken })
  },
}
