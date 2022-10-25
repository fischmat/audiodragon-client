import axios from 'axios'
import { appConfig } from '../Config'

export const apiBaseUrl = `${appConfig.backend.protocol}://${appConfig.backend.host}:${appConfig.backend.port}${appConfig.backend.apiPath}`

export const api = axios.create({
    baseURL: apiBaseUrl
})