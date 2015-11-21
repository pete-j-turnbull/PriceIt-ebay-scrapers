module.exports = {
    logger: {
        enabled: ['debug', 'info', 'warn', 'error']
    },
    redis: {
        host: '127.0.0.1',
        port: 6379
    },
    zerorpc: {
        bind: 'tcp://0.0.0.0:4242',
        connect: 'tcp://127.0.0.1:4242'
    }
};