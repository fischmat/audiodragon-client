
export const appConfig = {
    backend: {
        protocol: window.location.protocol.replace(':', ''),
        host: window.location.hostname,
        port: window.location.port || (window.location.protocol === 'https:' ? '443' : '80'),
        apiPath: '',

        websocket: {
            endpoint: '/events'
        }
    }
}
