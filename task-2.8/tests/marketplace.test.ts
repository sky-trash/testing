import { describe, beforeEach, test, expect } from "@jest/globals";
import {
  Marketplace,
  UserRole,
  ProductStatus,
  OrderStatus,
  User,
  Product,
  Review,
  Order,
} from "../src/marketplace";

describe("Marketplace Tests", () => {
  let marketplace: Marketplace;

  beforeEach(() => {
    marketplace = new Marketplace();
  });

  test("Тест 1: Регистрация пользователей", () => {
    const buyer = marketplace.registerUser(
      "john_buyer",
      "john@example.com",
      UserRole.BUYER,
    );

    expect(buyer.id).toBe(1);
    expect(buyer.username).toBe("john_buyer");
    expect(buyer.email).toBe("john@example.com");
    expect(buyer.role).toBe(UserRole.BUYER);
    expect(buyer.rating).toBe(0);
    expect(buyer.reviewsCount).toBe(0);
    expect(buyer.isActive).toBe(true);

    const seller = marketplace.registerUser(
      "alice_seller",
      "alice@example.com",
      UserRole.SELLER,
    );

    expect(seller.id).toBe(2);
    expect(seller.role).toBe(UserRole.SELLER);

    expect(marketplace.getAllUsers().length).toBe(2);

    const buyers = marketplace.getUsersByRole(UserRole.BUYER);
    expect(buyers.length).toBe(1);
    expect(buyers[0].id).toBe(buyer.id);

    const sellers = marketplace.getUsersByRole(UserRole.SELLER);
    expect(sellers.length).toBe(1);
    expect(sellers[0].id).toBe(seller.id);
  });

  test("Тест 2: Создание товара", () => {
    const seller = marketplace.registerUser(
      "alice_seller",
      "alice@example.com",
      UserRole.SELLER,
    );

    const product = marketplace.createProduct(
      seller.id,
      "iPhone 13",
      "Смартфон Apple iPhone 13, 128 ГБ, черный",
      65000,
      "Электроника",
    );

    expect(product.id).toBe(1);
    expect(product.sellerId).toBe(seller.id);
    expect(product.title).toBe("iPhone 13");
    expect(product.description).toBe(
      "Смартфон Apple iPhone 13, 128 ГБ, черный",
    );
    expect(product.price).toBe(65000);
    expect(product.category).toBe("Электроника");
    expect(product.status).toBe(ProductStatus.AVAILABLE);
    expect(product.images.length).toBe(0);
    expect(product.tags.length).toBe(0);
    expect(product.views).toBe(0);
    expect(product.favorites).toBe(0);

    expect(marketplace.getAllProducts().length).toBe(1);
    expect(marketplace.getAvailableProducts().length).toBe(1);
  });

  test("Тест 3: Создание товара с ошибками", () => {
    const seller = marketplace.registerUser(
      "alice_seller",
      "alice@example.com",
      UserRole.SELLER,
    );

    const buyer = marketplace.registerUser(
      "john_buyer",
      "john@example.com",
      UserRole.BUYER,
    );

    expect(() => {
      marketplace.createProduct(seller.id, "", "Описание", 1000, "Категория");
    }).toThrow("Название товара не может быть пустым");

    expect(() => {
      marketplace.createProduct(seller.id, "Товар", "", 1000, "Категория");
    }).toThrow("Описание товара не может быть пустым");

    expect(() => {
      marketplace.createProduct(
        seller.id,
        "Товар",
        "Описание",
        -100,
        "Категория",
      );
    }).toThrow("Цена должна быть положительным числом");

    expect(() => {
      marketplace.createProduct(seller.id, "Товар", "Описание", 1000, "");
    }).toThrow("Категория не может быть пустой");

    expect(() => {
      marketplace.createProduct(999, "Товар", "Описание", 1000, "Категория");
    }).toThrow("Продавец не найден");

    expect(() => {
      marketplace.createProduct(
        buyer.id,
        "Товар",
        "Описание",
        1000,
        "Категория",
      );
    }).toThrow("Только продавцы могут создавать товары");
  });

  test("Тест 4: Поиск и фильтрация товаров", () => {
    const seller = marketplace.registerUser(
      "alice_seller",
      "alice@example.com",
      UserRole.SELLER,
    );

    const product1 = marketplace.createProduct(
      seller.id,
      "iPhone 13",
      "Смартфон Apple",
      65000,
      "Электроника",
    );
    product1.addTag("смартфон");
    product1.addTag("apple");

    const product2 = marketplace.createProduct(
      seller.id,
      "Samsung TV",
      "Телевизор 4K",
      45000,
      "Электроника",
    );
    product2.addTag("телевизор");
    product2.addTag("samsung");

    const product3 = marketplace.createProduct(
      seller.id,
      "Книга JavaScript",
      "Учебник по программированию",
      1500,
      "Книги",
    );

    const searchResults = marketplace.searchProducts("iphone");
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].title).toBe("iPhone 13");

    const tagResults = marketplace.searchProducts("samsung");
    expect(tagResults.length).toBe(1);
    expect(tagResults[0].title).toBe("Samsung TV");

    const electronics = marketplace.getProductsByCategory("Электроника");
    expect(electronics.length).toBe(2);

    const books = marketplace.getProductsByCategory("Книги");
    expect(books.length).toBe(1);

    const sellerProducts = marketplace.getProductsBySeller(seller.id);
    expect(sellerProducts.length).toBe(3);
  });

  test("Тест 5: Добавление отзывов и рейтинг", () => {
    const seller = marketplace.registerUser(
      "alice_seller",
      "alice@example.com",
      UserRole.SELLER,
    );

    const buyer1 = marketplace.registerUser(
      "john_buyer",
      "john@example.com",
      UserRole.BUYER,
    );

    const buyer2 = marketplace.registerUser(
      "mary_buyer",
      "mary@example.com",
      UserRole.BUYER,
    );

    const product = marketplace.createProduct(
      seller.id,
      "iPhone 13",
      "Смартфон",
      65000,
      "Электроника",
    );

    const order = marketplace.createOrder(
      product.id,
      buyer1.id,
      1,
      "ул. Ленина, д. 10",
      "Карта",
    );

    if (order) {
      order.updateStatus(OrderStatus.DELIVERED);
    }

    const review = marketplace.addReview(
      product.id,
      buyer1.id,
      5,
      "Отличный телефон, все работает!",
    );

    expect(review).not.toBeNull();
    expect(review?.id).toBe(1);
    expect(review?.productId).toBe(product.id);
    expect(review?.authorId).toBe(buyer1.id);
    expect(review?.targetUserId).toBe(seller.id);
    expect(review?.rating).toBe(5);
    expect(review?.comment).toBe("Отличный телефон, все работает!");
    expect(review?.isVerified).toBe(true);

    const review2 = marketplace.addReview(
      product.id,
      buyer2.id,
      4,
      "Хороший телефон, но дороговато",
    );

    expect(review2).not.toBeNull();
    expect(review2?.isVerified).toBe(false);

    const productReviews = marketplace.getProductReviews(product.id);
    expect(productReviews.length).toBe(2);

    const sellerReviews = marketplace.getUserReviews(seller.id);
    expect(sellerReviews.length).toBe(2);

    const averageRating = marketplace.getAverageRatingForUser(seller.id);
    expect(averageRating).toBe(4.5);

    expect(seller.rating).toBe(4.5);
    expect(seller.reviewsCount).toBe(2);
  });

  test("Тест 6: Создание и управление заказами", () => {
    const seller = marketplace.registerUser(
      "alice_seller",
      "alice@example.com",
      UserRole.SELLER,
    );

    const buyer = marketplace.registerUser(
      "john_buyer",
      "john@example.com",
      UserRole.BUYER,
    );

    const product = marketplace.createProduct(
      seller.id,
      "iPhone 13",
      "Смартфон",
      65000,
      "Электроника",
    );

    const order = marketplace.createOrder(
      product.id,
      buyer.id,
      1,
      "ул. Ленина, д. 10, кв. 5",
      "Банковская карта",
    );

    expect(order).not.toBeNull();
    expect(order?.id).toBe(1);
    expect(order?.productId).toBe(product.id);
    expect(order?.buyerId).toBe(buyer.id);
    expect(order?.sellerId).toBe(seller.id);
    expect(order?.quantity).toBe(1);
    expect(order?.totalPrice).toBe(65000);
    expect(order?.status).toBe(OrderStatus.PENDING);
    expect(order?.shippingAddress).toBe("ул. Ленина, д. 10, кв. 5");
    expect(order?.paymentMethod).toBe("Банковская карта");

    expect(product.status).toBe(ProductStatus.SOLD);

    const userOrders = marketplace.getUserOrders(buyer.id);
    expect(userOrders.length).toBe(1);

    const buyerOrders = marketplace.getBuyerOrders(buyer.id);
    expect(buyerOrders.length).toBe(1);

    const sellerOrders = marketplace.getSellerOrders(seller.id);
    expect(sellerOrders.length).toBe(1);

    const updateResult = marketplace.updateOrderStatus(
      order!.id,
      seller.id,
      OrderStatus.PAID,
    );
    expect(updateResult).toBe(true);
    expect(order?.status).toBe(OrderStatus.PAID);

    expect(() => {
      marketplace.cancelOrder(order!.id, buyer.id);
    }).toThrow("Нельзя отменить заказ в текущем статусе");
  });

  test("Тест 7: Избранное и просмотры", () => {
    const seller = marketplace.registerUser(
      "alice_seller",
      "alice@example.com",
      UserRole.SELLER,
    );

    const buyer = marketplace.registerUser(
      "john_buyer",
      "john@example.com",
      UserRole.BUYER,
    );

    const product = marketplace.createProduct(
      seller.id,
      "iPhone 13",
      "Смартфон",
      65000,
      "Электроника",
    );

    const viewResult = marketplace.incrementProductViews(product.id);
    expect(viewResult).toBe(true);
    expect(product.views).toBe(1);

    marketplace.incrementProductViews(product.id);
    marketplace.incrementProductViews(product.id);
    expect(product.views).toBe(3);

    const addFavoriteResult = marketplace.addToFavorites(product.id);
    expect(addFavoriteResult).toBe(true);
    expect(product.favorites).toBe(1);

    marketplace.addToFavorites(product.id);
    expect(product.favorites).toBe(2);

    const removeFavoriteResult = marketplace.removeFromFavorites(product.id);
    expect(removeFavoriteResult).toBe(true);
    expect(product.favorites).toBe(1);

    const invalidView = marketplace.incrementProductViews(999);
    expect(invalidView).toBe(false);
  });

  test("Тест 8: Статистика продавца и площадки", () => {
    const seller = marketplace.registerUser(
      "alice_seller",
      "alice@example.com",
      UserRole.SELLER,
    );

    const buyer1 = marketplace.registerUser(
      "john_buyer",
      "john@example.com",
      UserRole.BUYER,
    );

    const buyer2 = marketplace.registerUser(
      "mary_buyer",
      "mary@example.com",
      UserRole.BUYER,
    );

    const product1 = marketplace.createProduct(
      seller.id,
      "iPhone 13",
      "Смартфон",
      65000,
      "Электроника",
    );

    const product2 = marketplace.createProduct(
      seller.id,
      "Samsung TV",
      "Телевизор",
      45000,
      "Электроника",
    );

    const product3 = marketplace.createProduct(
      seller.id,
      "Книга",
      "Учебник",
      1500,
      "Книги",
    );

    const order1 = marketplace.createOrder(
      product1.id,
      buyer1.id,
      1,
      "Адрес 1",
      "Карта",
    );
    order1?.updateStatus(OrderStatus.DELIVERED);

    const order2 = marketplace.createOrder(
      product2.id,
      buyer2.id,
      1,
      "Адрес 2",
      "Карта",
    );
    order2?.updateStatus(OrderStatus.DELIVERED);

    marketplace.addReview(product1.id, buyer1.id, 5, "Отлично!");
    marketplace.addReview(product2.id, buyer2.id, 4, "Хорошо");

    const sellerStats = marketplace.getSellerStatistics(seller.id);
    expect(sellerStats).not.toBeNull();
    expect(sellerStats?.totalProducts).toBe(3);
    expect(sellerStats?.availableProducts).toBe(1);
    expect(sellerStats?.soldProducts).toBe(2);
    expect(sellerStats?.totalOrders).toBe(2);
    expect(sellerStats?.totalRevenue).toBe(65000 + 45000);
    expect(sellerStats?.averageRating).toBe(4.5);

    const marketplaceStats = marketplace.getMarketplaceStatistics();
    expect(marketplaceStats.totalUsers).toBe(3);
    expect(marketplaceStats.totalSellers).toBe(1);
    expect(marketplaceStats.totalBuyers).toBe(2);
    expect(marketplaceStats.totalProducts).toBe(3);
    expect(marketplaceStats.availableProducts).toBe(1);
    expect(marketplaceStats.totalOrders).toBe(2);
    expect(marketplaceStats.totalReviews).toBe(2);
    expect(marketplaceStats.totalRevenue).toBe(110000);
  });
});
