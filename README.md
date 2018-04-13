### Installing
```sh
npm install --save winston-huuminh-transport
```
### Usage

```javascript
const opts = {
	level: 'verbose',
    filename: 'huuminh.log',
    dirname: path.join(__dirname, "logs")
};

const logger = winston.createLogger({
    level: 'info',
    transports: [
        require('./modules/winston-huuminh-transport')(opts)
    ]
});
```