'use strict';

module.exports = function (Deriveddataset) {
    var app = require('../../server/server');
    var utils = require('./utils');

    // filter on dataset type (raw, derived etc)
    Deriveddataset.observe('access', function (ctx, next) {
        var typeCondition = {
            type: 'derived'
        };
        if (!ctx.query.where) {
            ctx.query.where = typeCondition
        } else {
            ctx.query.where = {
                and: [ctx.query.where, typeCondition]
            }
        }
        // const scope = ctx.query.where ? JSON.stringify(ctx.query.where) : '<all records>';
        // console.log('%s: %s accessed %s:%s', new Date(), ctx.Model.modelName, scope);
        next()
    });

    Deriveddataset.observe('before save', function (ctx, next) {
        if(ctx.instance){
            ctx.instance.type = 'derived';
        }
        next();
    });

    Deriveddataset.beforeRemote('facet', function (ctx, userDetails, next) {
        if (!ctx.args.fields)
            ctx.args.fields = {};
        ctx.args.fields.type = 'derived';
        utils.handleOwnerGroups(ctx, userDetails, next);
        // const user = userId ? 'user#' + userId : '<anonymous>';

    })
};