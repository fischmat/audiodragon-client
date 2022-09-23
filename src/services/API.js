import axios from 'axios'
import { appConfig } from '../Config'

export const api = axios.create({
    baseURL: `${appConfig.backend.protocol}://${appConfig.backend.host}:${appConfig.backend.port}${appConfig.backend.apiPath}`
})