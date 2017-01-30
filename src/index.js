'use strict';

// product class - use for create product items
function product(sku, name, description, price, year, camera, display, processor, internet) {
    this.sku = sku; // id (stock keeping unit)
    this.name = name;
    this.description = description;
    this.price = price;
    this.year = year;
    this.camera = camera;
    this.display = display;
    this.processor = processor;
    this.internet = internet;
}


// initial storage content
// main window methods (storeWindow)
function storeWindow() {
    this.products = [
        new product("Samsung - Galaxy S7 32GB - Black Onyx (Verizon)", 
            "Samsung - Galaxy S7 32GB - Black Onyx (Verizon)", 
            "Qualcomm Snapdragon 820 MSM8996 2.2GHz quad-core processor", 
            500, 
            2015, 
            12, 
            3.5, 
            "S3C6400", 
            "GPRS",
            5),
        new product("Motorola - Moto Z Droid 4G LTE with 32GB Memory", 
            "Motorola - Moto Z Droid 4G LTE with 32GB Memory Cell Phone", 
            "Qualcomm Snapdragon 820 2.2GHz quad-core processor", 
            600, 
            2015, 
            8, 
            3.5, 
            "S3C6400", 
            "3G",
            2),
        new product("Samsung - Galaxy S7 32GB - Black Onyx (AT&T)", 
            "Samsung - Galaxy S7 32GB - Black Onyx (AT&T)", 
            "Qualcomm Snapdragon 820 quad-core processor", 
            800, 
            2016, 
            8, 
            3.5, 
            "APL0398", 
            "3G+CDMA",
            3),
        new product("Apple - iPhone 7 Plus 128GB - Jet Black (AT&T)", 
            "Apple - iPhone 7 Plus 128GB - Jet Black (AT&T)", 
            "A10 Fusion chip with 64-bit architecture", 
            950, 
            2016, 
            15, 
            4, 
            "Apple A6", 
            "LTE",
            4),
    ]
}

storeWindow.prototype.getProdBySku = function (sku) {
    for (var i = 0; i < this.products.length; i++) {
        if (this.products[i].sku == sku)
            return this.products[i];
    }
    return null;
}

// shopping cart
function shopCart(cartName) {
    this.cartName = cartName;
    this.clearCart = false;
    this.checkoutParameters = {};
    this.items = [];

    // initialization - load items from local storage when
    this.loadItems();

    // save items to local storage when unloading
    var self = this;
    $(window).unload(function () {
        if (self.clearCart) {
            self.clearItems();
        }
        self.saveItems();
        self.clearCart = false;
    });
}

// load items from local storage
shopCart.prototype.loadItems = function () {
    var items = localStorage != null ? localStorage[this.cartName + "_items"] : null;
    if (items != null && JSON != null) {
        try {
            var items = JSON.parse(items);
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.sku != null && item.name != null && item.price != null && item.quantity != null) {
                    item = new cartItem(item.sku, item.name, item.price, item.quantity);
                    this.items.push(item);
                }
            }
        }
        catch (err) {
            // ignore errors while loading...
        }
    }
}

// save items to local storage
shopCart.prototype.saveItems = function () {
    if (localStorage != null && JSON != null) {
        localStorage[this.cartName + "_items"] = JSON.stringify(this.items);
    }
}

// adds an item to the cart
shopCart.prototype.addItem = function (sku, name, price, quantity) {
    quantity = this.toNumber(quantity);
    if (quantity != 0) {

        // update quantity for existing item in cart
        var found = false;
        for (var i = 0; i < this.items.length && !found; i++) {
            var item = this.items[i];
            if (item.sku == sku) {
                found = true;
                item.quantity = this.toNumber(item.quantity + quantity);
                if (item.quantity <= 0) {
                    this.items.splice(i, 1);
                }
            }
        }

        // add item
        if (!found) {
            var item = new cartItem(sku, name, price, quantity);
            this.items.push(item);
        }

        // save changes
        this.saveItems();
    }
}

// get total sum for
shopCart.prototype.getTotalSum = function (sku) {
    var total = 0;
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        if (sku == null || item.sku == sku) {
            total += this.toNumber(item.quantity * item.price);
        }
    }
    return total;
}

// get total quantity for all items in the cart
shopCart.prototype.getTotalCount = function (sku) {
    var count = 0;
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        if (sku == null || item.sku == sku) {
            count += this.toNumber(item.quantity);
        }
    }
    return count;
}

// clear the cart
shopCart.prototype.clearItems = function () {
    this.items = [];
    this.saveItems();
}

// utility methods
shopCart.prototype.addFormFields = function (form, data) {
    if (data != null) {
        $.each(data, function (name, value) {
            if (value != null) {
                var input = $("<input></input>").attr("type", "hidden").attr("name", name).val(value);
                form.append(input);
            }
        });
    }
}
shopCart.prototype.toNumber = function (value) {
    value = value * 1;
    return isNaN(value) ? 0 : value;
}

// items in the cart
function cartItem(sku, name, price, quantity) {
    this.sku = sku;
    this.name = name;
    this.price = price * 1;
    this.quantity = quantity * 1;
}

// angular module "Store" initialization
// routing setup
var storeApp = angular.module('Store', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/main', {
        templateUrl: './app/partials/main.html',
        controller: storeCntrl 
      }).
      when('/products/:productSku', {
        templateUrl: './app/partials/product-info.html',
        controller: storeCntrl
      }).
      when('/cart', {
        templateUrl: './app/partials/cart.html',
        controller: storeCntrl
      }).
      otherwise({
        redirectTo: '/main'
      });
}]);

// create store for cart
storeApp.factory("DataService", function () {

    // create cart
    var cart = new shopCart("Store");

    // create store
    var store = new storeWindow();

    // return object with created cart and store 
    return {
        store: store,
        cart: cart
    };
});

// the storeCntrl contains two objects: store (product list) & cart (cart object)
function storeCntrl($scope, $routeParams, DataService) {

    // get data from service
    $scope.store = DataService.store;
    $scope.cart = DataService.cart;

    // use routing for getting product
    if ($routeParams.productSku != null) {
        $scope.product = $scope.store.getProdBySku($routeParams.productSku);
    }
}
