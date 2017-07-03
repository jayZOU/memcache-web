import express from 'express';
import bodyParser from 'body-parser';
import Pmccer from 'pmcc';

let app = express(),
	router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
//初始化memcacher
let pmccer = new Pmccer('127.0.0.1:11211');
let pmcc = pmccer.init();
let priMem = pmccer.primeval();

router.use(async (req, res, next) => {
	next();
})

// app.get('/memcacher', (req, res) => {

// })

router.get('/allData', async (req, res) => {
	try{
		// await pmcc.set('key1', 'value1', 100);
		// await pmcc.set('key2', 'value2', 100);
		// await pmcc.set('key3', 'value3', 100);

		// let key1 = await pmcc.get('key1');
		// let key2 = await pmcc.get('key2');
		// let key3 = await pmcc.get('key3');
		let result = [];
		// console.log(await pmcc.gets('key1'));

		let items = await pmcc.items();

		if(Object.keys(items[0]).length == 0){
			res.end(JSON.stringify({
				err_code: -1,
				err_msg: 'empty object'
			}))
			return 0;
		}
		// console.log(items[0]);

		let keys = Object.keys(items[0]);
	    	keys.pop();
        priMem.cachedump(items[0].server, keys[0] * 1, items[0][keys[0]].number, async (err, cache) => {
            if(err) console.log('err=', err);
            console.log('cache=',cache);
            if(!cache.length) cache = [cache];
            console.log('cache=',cache);
            let count = 0,
            	len = cache.length;
            cache.forEach(async (item) => {
                result.push({
                	key: item.key,
                	value: await pmcc.get(item.key)
                })
                ++count;
                if(len == count) res.end(JSON.stringify({err_code: 0,data:result}));
            })
            // console.log('result=',result);
            
        })
	    // console.log(keys);
	}catch(err){
		console.error('error=', err);
	}
});

router.delete('/del/:key', async(req, res) => {
	try{
		let key = req.params.key;
		let result = await pmcc.del(key);
		if(!result){
			res.end(JSON.stringify({
				err_code: -2,
				err_msg: 'empty key'
			}));
			return 0;
		}
		res.end(JSON.stringify({
			err_code: 0,
			err_msg: '',
		}))
		// console.log(result);
	}catch(err){
		console.log(err);
	}
})

router.post('/add/', async(req, res) => {
	try{
		let key = req.body.key;
		let value = req.body.value || '';
		let lifetime = req.body.lifetime * 1;

		if(typeof key !== 'string' && typeof lifetime !== 'number'){
			res.end(JSON.string({
				err_code: -3,
				err_msg: 'params type non-compliant'
			}))
			return 0;
		}

		let result = await pmcc.set(key, value, lifetime);
		if(!result){
			res.end(JSON.stringify({
				err_code: -4,
				err_msg: 'set catch is fail'
			}));
			return 0;
		}
		res.end(JSON.stringify({
			err_code: 0,
			err_msg: '',
		}))

	}catch(err){

	}
})


app.use('/memcacher', router);



// pro.set('foo', 'bar', 10)
// 	.then(() => {
// 		console.log(11);
// 	})
// 	.catch((err) => {
// 		console.log(err);
// 	})

// pmcc.set('foo', 'bar', 10)
// 	.then(() => {
// 		console.log(11);
// 	})
// 	.catch((err) => {
// 		console.log(err);
// 	})


// app.get('/allData', function(req, res) {
// 	let cacheData = [];
//     memcached.items(function(err, data) {
// 	    // console.log(data.foo);
// 	    data.forEach((items) => {
// 	    	let keys = Object.keys(items);
// 	    	keys.pop();

// 	    	keys.forEach((stats) => {
// 	    		memcached.cachedump(items.server, stats*1, items[stats].number, (err, cache) => {
// 	    			console.log(cache);
// 	    			cache.forEach((item) => {
// 	    				memcached.get(item.key, function (err, data) {
// 						  	console.log(`${item.key}=${data}`);
// 						  	cacheData.push({
// 						  		key: item.key,
// 						  		value: data
// 						  	})
// 						});
// 	    			})
// 	    		})
// 	    	})
// 	    })

// 	    res.end(JSON.stringify(cacheData))

// 	    // data.forEach((items) => {
// 	    // 	memcached.cachedump(items.server, )
// 	    // })

// 	    // res.end(JSON.stringify(data))

// 	    // console.log(data);

// 	});

// });


//设置监听端口
app.listen(12306);
console.log('12306 is the magic port');