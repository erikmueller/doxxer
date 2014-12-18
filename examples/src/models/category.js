/*jslint node:true*/
var _ = require('lodash'),
    Bluebird = require('bluebird'),
    modelFactory = require('./model-factory');

/**
 *
 * @param guid
 * @param locale
 * @returns {Promise}
 */
module.exports = function (guid, locale) {
    'use strict';

    var model = modelFactory({
        parent: 'shop',
        locale: locale,

        getData: function (restClient) {
            model.shopName = restClient.shopName;

            return Bluebird.join(
                restClient.get('/rs/categories/' + (guid ? guid + '/' : ''), {
                    locale: locale
                }),

                restClient.get('/rs/products/', {
                    locale: locale,
                    categoryId: guid
                }),

                function (categoryData, productData) {
                    return {
                        category: _.extend(
                            {},
                            {products: model.parseProductsData(productData)},
                            model.parseCategoryData(categoryData))
                    };
                }
            );
        },

        /**
         * ## Get data for a specific category
         * @param  {String|Integer} guid    A category's GUID
         * @return {Object}                Name, parent and sub categories
         */
        parseCategoryData: function (category) {
            var result = {
                'name': category.name,
                'subCategories': []
            };

            // If we have a parent category, extend the results object with it's name and link
            _.extend(result, category.parent ? {
                'parent': {
                    'name': category.parent.title,
                    'href': '/' + model.shopName + '/category/' + model.slugify(category.parent.title, category.parent.href.split('/').pop())
                }
            } : {});

            // Add the category's sub categories to the respective array
            _.each(category.subCategories, function (subCategory) {
                result.subCategories.push({
                    'name': subCategory.title,
                    'href': '/' + model.shopName + '/category/' + model.slugify(subCategory.title, subCategory.href.split('/').pop())
                });
            });

            return result;
        },

        /**
         * ## Get products of a specific category
         * @param  {String|Integer} guid    A category's GUID
         * @return {Object}                Name, image href, price and short description
         */
        parseProductsData: function (products) {
            var result = [];

            // Parse the products and restructure the data to match the template
            _.each(products.items, function (item) {
                var productImage = {
                    'src': 'http://placehold.it/350x350',
                    'alt': 'Placeholder'
                };

                // Overwrite placeholder if our product has an image
                productImage = item.images[2] ? {
                    'src': item.images[2].url,
                    'alt': item.images[2].name
                } : productImage;

                result.push({
                    'name': item.name,
                    'image': productImage,
                    'href': '/' + model.shopName + '/product/' + model.slugify(item.name, item.productId),
                    'price': item.priceInfo.price ? item.priceInfo.price.formatted : null,
                    'shortDescription': item.shortDescription
                });
            });

            return result;
        }
    });

    return model;
};
