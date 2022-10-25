
import SockJS from "sockjs-client"
import Stomp from "webstomp-client"
import { appConfig } from '../Config'
import PubSub from 'pubsub-js'

// Event IDs
// Generic:
const EVENT_ID_ERROR = 'error'
// Capture:
const EVENT_ID_CAPTURE_STARTED = 'captureStarted'
const EVENT_ID_CAPTURE_ENDED = 'captureEnded'
const EVENT_ID_CAPTURE_END_REQUESTED = 'captureEndRequested'
// Track
const EVENT_ID_TRACK_STARTED = 'trackStarted'
const EVENT_ID_TRACK_ENDED = 'trackEnded'
const EVENT_ID_TRACK_RECOGNIZED = 'trackRecognized'
// Metrics
const EVENT_ID_METRICS_RMS = 'metrics_rms'
const EVENT_ID_METRICS_FREQUENCIES = 'metrics_frequencies'
const EVENT_ID_METRICS_TRACK_TIME = 'metrics_track_time'
const EVENT_ID_METRICS_BUFFER_STATS = 'metrics_buffer_stats'
// Library
const EVENT_ID_LIBRARY_INIT = 'libraryInit'
const EVENT_ID_LIBRARY_REFRESHED = 'libraryRefreshed'

// Prefixes
const WS_TOPIC_CAPTURE = '/capture'
const WS_TOPIC_METRICS = '/metrics'
const WS_TOPIC_LIBRARY = '/library'

export const eventService = {
    
    /**
     * Connects this service with the backend.
     * This function must be initially called before any events can be processed.
     */
    connect() {
        if (this.connected) {
            console.debug("Event service already connected")
        }
        const wsEndpoint = `${appConfig.backend.protocol}://${appConfig.backend.host}:${appConfig.backend.port}${appConfig.backend.websocket.endpoint}`
        console.debug(`Connecting to websocket endpoint at ${wsEndpoint}`)
        const stompClient = Stomp.over(new SockJS(wsEndpoint))
        stompClient.connect(
            {},
            () => {
                stompClient.subscribe(WS_TOPIC_CAPTURE, (tick) => {
                    const event = JSON.parse(tick.body)
                    PubSub.publish(event.type, event)
                })
                stompClient.subscribe(WS_TOPIC_METRICS, (tick) => {
                    const event = JSON.parse(tick.body)
                    PubSub.publish(EVENT_ID_METRICS_RMS, event.rms)
                    PubSub.publish(EVENT_ID_METRICS_FREQUENCIES, event.frequencies)
                    PubSub.publish(EVENT_ID_METRICS_BUFFER_STATS, event.buffer)
                    PubSub.publish(EVENT_ID_METRICS_TRACK_TIME, event.trackTime)
                })
                stompClient.subscribe(WS_TOPIC_LIBRARY, (tick) => {
                    const event = JSON.parse(tick.body)
                    PubSub.publish(event.type, event)
                })
            },
            (error) => {
                console.log(error)
            }
        )
    },

    capture() {
        return {
            onStarted(callback) {
                PubSub.subscribe(EVENT_ID_CAPTURE_STARTED, (_, evt) => callback(evt))
            },
            onEnded(callback) {
                PubSub.subscribe(EVENT_ID_CAPTURE_ENDED, (_, evt) => callback(evt))
            },
            onEndRequested(callback) {
                PubSub.subscribe(EVENT_ID_CAPTURE_END_REQUESTED, (_, evt) => callback(evt))
            }
        }
    },

    track() {
        return {
            onStarted(callback) {
                PubSub.subscribe(EVENT_ID_TRACK_STARTED, (_, evt) => callback(evt))
            },
            onEnded(callback) {
                PubSub.subscribe(EVENT_ID_TRACK_ENDED, (_, evt) => callback(evt))
            },
            onRecognized(callback) {
                PubSub.subscribe(EVENT_ID_TRACK_RECOGNIZED, (_, evt) => callback(evt))
            }
        }
    },

    metrics() {
        return {
            rms(callback) {
                PubSub.subscribe(EVENT_ID_METRICS_RMS, (_, evt) => callback(evt))
            },
            frequencies(callback) {
                PubSub.subscribe(EVENT_ID_METRICS_FREQUENCIES, (_, evt) => callback(evt))
            },
            bufferStats(callback) {
                PubSub.subscribe(EVENT_ID_METRICS_BUFFER_STATS, (_, evt) => callback(evt))
            },
            trackTime(callback) {
                PubSub.subscribe(EVENT_ID_METRICS_TRACK_TIME, (_, evt) => callback(evt))
            },
        }
    },

    library() {
        return {
            initialized(callback) {
                PubSub.subscribe(EVENT_ID_LIBRARY_INIT, (_, evt) => callback(evt))
            },
            refreshed(callback) {
                PubSub.subscribe(EVENT_ID_LIBRARY_REFRESHED, (_, evt) => callback(evt))
            }
        }
    },

    onError(callback) {
        PubSub.subscribe(EVENT_ID_ERROR, (_, evt) => callback(evt))
    }
}