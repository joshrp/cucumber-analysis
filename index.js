var fs = require('fs'),
	path = process.argv[2]

var loadFiles = function (path) {
	var files = []
	var recurse = function (path) {
		if( fs.existsSync(path) ) {
			fs.readdirSync(path).forEach(function(file,index){
				var curPath = path + "/" + file;
				if(fs.lstatSync(curPath).isDirectory()) { // recurse
					recurse(curPath);
				} else if (file.match(/\.rb$/)) { // delete file
					files.push(curPath);
				}
			});
		}
		
	}
	recurse(path);	
	return files;
}

Object.defineProperty(String.prototype, 'isComment', {get: function () {
	return !!this.match(/^\s*#/);
}});

Object.defineProperty(String.prototype, 'isCrap', {
	get: function () {
		return this.trim().length == 0 || this.trim() == '\n';
	}
});

Object.defineProperty(String.prototype, 'isRequire', {
	get: function () {
		return this.match(/^\s*(require|include)/);
	}
});

Object.defineProperty(String.prototype, 'isSleep', {
	get: function () {
		return this.match(/^\s*(sleep)/);
	}
});

countLines = function (code) {
	step = /^\s*(Given|When|Then)/
	stepCount = 0;
	var lines = code.split('\n').filter(function (line) {
		if (line.match(step)) {
			stepCount++;
			return false;
		} else if (line.isComment || line.isCrap || line.isRequire) {
			return false;
		}
		
		return true;
	});
	return lines.length - stepCount
}

countSleeps = function (code) {
	var total = 0;
	code.split('\n').forEach(function (line) {
		if (line.isSleep) {
			total++;
		}
	});
	return total;
}

var analyseFiles = function (files) {
	counters = [
		{
			stat: 'Lines',
			func: countLines,
			count: 0
		},{
			stat: 'Count',
			func: countSleeps,
			count: 0
		}
	]

	files.map(function (path) {
		var contents = fs.readFileSync(path, 'utf-8')
		counters.forEach(function (stat) {
			stat.count += (stat.func)(contents);
		});
	});
	
	counters.forEach(function (stat) {
		console.log(stat.stat,'=',stat.count);
	});
}

var files = loadFiles(path);
// if (require.main === module) {
// 	module.exports = {}
// } else {
	analyseFiles(files);
// }