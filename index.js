'use strict';

const Promise = require('bluebird');
const createAction = require('lard-codepipeline-custom-action').createAction;

const AWS = require('aws-sdk');
AWS.config.setPromisesDependency(Promise);

const lambda = new AWS.Lambda();

module.exports = createAction((job, input) => {
	console.log('Received input:', JSON.stringify(input, null, 2));
	return [
		job,
		Promise.all(
			Object.keys(input)
				.map(key => {
					if (input[key].match(/^arn:aws:lambda:[^:]+:\d+:function:[^:]+$/)) {
						console.log(`- Found function for ${key}: ${input[key]}`);
						return input[key];
					}
				})
				.filter(item => !!item)
				.map(functionArn => {
					console.log(`- Publishing version for ${functionArn}`);
					return lambda.publishVersion({ FunctionName: functionArn })
						.promise();
				})
		),
	];
});
