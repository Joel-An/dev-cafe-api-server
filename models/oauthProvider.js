/* eslint-disable func-names */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const GithubSchema = new Schema({
  login: String,
});

const OauthProviderSchema = new Schema({
  github: GithubSchema,
});

exports.OauthProviderSchema = OauthProviderSchema;
