async function test() {
	console.log('Hello')
	console.log(new Date())
	await sleep(1000)
	console.log('world!')
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

var t = sleep(1000);
for(var i = 0; i < 10; i++) {
	t = t.then(test)
}