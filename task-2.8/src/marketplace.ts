export enum UserRole {
  BUYER = "buyer",
  SELLER = "seller",
  ADMIN = "admin",
}

export enum ProductStatus {
  AVAILABLE = "available",
  SOLD = "sold",
  HIDDEN = "hidden",
  DELETED = "deleted",
}

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export class User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  rating: number;
  reviewsCount: number;
  registeredAt: Date;
  isActive: boolean;

  constructor(
    id: number,
    username: string,
    email: string,
    role: UserRole = UserRole.BUYER,
  ) {
    if (!username || username.trim().length === 0) {
      throw new Error("Имя пользователя не может быть пустым");
    }
    if (!email || email.trim().length === 0 || !email.includes("@")) {
      throw new Error("Некорректный email");
    }

    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role;
    this.rating = 0;
    this.reviewsCount = 0;
    this.registeredAt = new Date();
    this.isActive = true;
  }

  updateRating(newRating: number): void {
    this.rating =
      (this.rating * this.reviewsCount + newRating) / (this.reviewsCount + 1);
    this.reviewsCount++;
  }
}

export class Product {
  id: number;
  sellerId: number;
  title: string;
  description: string;
  price: number;
  category: string;
  status: ProductStatus;
  images: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  views: number;
  favorites: number;

  constructor(
    id: number,
    sellerId: number,
    title: string,
    description: string,
    price: number,
    category: string,
  ) {
    if (!title || title.trim().length === 0) {
      throw new Error("Название товара не может быть пустым");
    }
    if (!description || description.trim().length === 0) {
      throw new Error("Описание товара не может быть пустым");
    }
    if (price <= 0) {
      throw new Error("Цена должна быть положительным числом");
    }
    if (!category || category.trim().length === 0) {
      throw new Error("Категория не может быть пустой");
    }

    this.id = id;
    this.sellerId = sellerId;
    this.title = title;
    this.description = description;
    this.price = price;
    this.category = category;
    this.status = ProductStatus.AVAILABLE;
    this.images = [];
    this.tags = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.views = 0;
    this.favorites = 0;
  }

  update(
    title: string,
    description: string,
    price: number,
    category: string,
  ): void {
    if (!title || title.trim().length === 0) {
      throw new Error("Название товара не может быть пустым");
    }
    if (!description || description.trim().length === 0) {
      throw new Error("Описание товара не может быть пустым");
    }
    if (price <= 0) {
      throw new Error("Цена должна быть положительным числом");
    }
    if (!category || category.trim().length === 0) {
      throw new Error("Категория не может быть пустой");
    }

    this.title = title;
    this.description = description;
    this.price = price;
    this.category = category;
    this.updatedAt = new Date();
  }

  addImage(imageUrl: string): void {
    this.images.push(imageUrl);
  }

  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  incrementViews(): void {
    this.views++;
  }

  incrementFavorites(): void {
    this.favorites++;
  }

  decrementFavorites(): void {
    if (this.favorites > 0) {
      this.favorites--;
    }
  }

  markAsSold(): void {
    this.status = ProductStatus.SOLD;
  }

  hide(): void {
    this.status = ProductStatus.HIDDEN;
  }

  show(): void {
    if (this.status === ProductStatus.HIDDEN) {
      this.status = ProductStatus.AVAILABLE;
    }
  }
}

export class Review {
  id: number;
  productId: number;
  authorId: number;
  targetUserId: number;
  rating: number;
  comment: string;
  createdAt: Date;
  isVerified: boolean;

  constructor(
    id: number,
    productId: number,
    authorId: number,
    targetUserId: number,
    rating: number,
    comment: string,
  ) {
    if (rating < 1 || rating > 5) {
      throw new Error("Рейтинг должен быть от 1 до 5");
    }
    if (!comment || comment.trim().length === 0) {
      throw new Error("Комментарий не может быть пустым");
    }

    this.id = id;
    this.productId = productId;
    this.authorId = authorId;
    this.targetUserId = targetUserId;
    this.rating = rating;
    this.comment = comment;
    this.createdAt = new Date();
    this.isVerified = false;
  }

  markAsVerified(): void {
    this.isVerified = true;
  }
}

export class Order {
  id: number;
  productId: number;
  buyerId: number;
  sellerId: number;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  shippingAddress: string;
  paymentMethod: string;

  constructor(
    id: number,
    productId: number,
    buyerId: number,
    sellerId: number,
    quantity: number,
    totalPrice: number,
    shippingAddress: string,
    paymentMethod: string,
  ) {
    if (quantity <= 0) {
      throw new Error("Количество должно быть положительным числом");
    }
    if (totalPrice <= 0) {
      throw new Error("Общая цена должна быть положительным числом");
    }
    if (!shippingAddress || shippingAddress.trim().length === 0) {
      throw new Error("Адрес доставки не может быть пустым");
    }
    if (!paymentMethod || paymentMethod.trim().length === 0) {
      throw new Error("Способ оплаты не может быть пустым");
    }

    this.id = id;
    this.productId = productId;
    this.buyerId = buyerId;
    this.sellerId = sellerId;
    this.quantity = quantity;
    this.totalPrice = totalPrice;
    this.status = OrderStatus.PENDING;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.shippingAddress = shippingAddress;
    this.paymentMethod = paymentMethod;
  }

  updateStatus(newStatus: OrderStatus): void {
    this.status = newStatus;
    this.updatedAt = new Date();
  }
}

export class Marketplace {
  private users: User[] = [];
  private products: Product[] = [];
  private reviews: Review[] = [];
  private orders: Order[] = [];

  private nextUserId: number = 1;
  private nextProductId: number = 1;
  private nextReviewId: number = 1;
  private nextOrderId: number = 1;

  registerUser(
    username: string,
    email: string,
    role: UserRole = UserRole.BUYER,
  ): User {
    if (this.users.some((u) => u.email === email)) {
      throw new Error("Пользователь с таким email уже существует");
    }
    if (this.users.some((u) => u.username === username)) {
      throw new Error("Пользователь с таким именем уже существует");
    }

    const user = new User(this.nextUserId++, username, email, role);
    this.users.push(user);
    return user;
  }

  findUserById(userId: number): User | undefined {
    return this.users.find((u) => u.id === userId);
  }

  getAllUsers(): User[] {
    return [...this.users];
  }

  getUsersByRole(role: UserRole): User[] {
    return this.users.filter((u) => u.role === role);
  }

  updateUserRole(userId: number, newRole: UserRole): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;

    user.role = newRole;
    return true;
  }

  deactivateUser(userId: number): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;

    user.isActive = false;
    return true;
  }

  createProduct(
    sellerId: number,
    title: string,
    description: string,
    price: number,
    category: string,
  ): Product {
    const seller = this.findUserById(sellerId);
    if (!seller) {
      throw new Error("Продавец не найден");
    }
    if (seller.role !== UserRole.SELLER && seller.role !== UserRole.ADMIN) {
      throw new Error("Только продавцы могут создавать товары");
    }

    const product = new Product(
      this.nextProductId++,
      sellerId,
      title,
      description,
      price,
      category,
    );
    this.products.push(product);
    return product;
  }

  findProductById(productId: number): Product | undefined {
    return this.products.find((p) => p.id === productId);
  }

  getAllProducts(): Product[] {
    return [...this.products];
  }

  getAvailableProducts(): Product[] {
    return this.products.filter((p) => p.status === ProductStatus.AVAILABLE);
  }

  getProductsBySeller(sellerId: number): Product[] {
    return this.products.filter((p) => p.sellerId === sellerId);
  }

  getProductsByCategory(category: string): Product[] {
    return this.products.filter(
      (p) =>
        p.category.toLowerCase() === category.toLowerCase() &&
        p.status === ProductStatus.AVAILABLE,
    );
  }

  searchProducts(query: string): Product[] {
    const lowerQuery = query.toLowerCase();
    return this.products.filter(
      (p) =>
        (p.title.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery) ||
          p.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))) &&
        p.status === ProductStatus.AVAILABLE,
    );
  }

  updateProduct(
    productId: number,
    sellerId: number,
    title: string,
    description: string,
    price: number,
    category: string,
  ): boolean {
    const product = this.findProductById(productId);
    if (!product) return false;
    if (product.sellerId !== sellerId) {
      throw new Error("Только продавец может редактировать товар");
    }

    product.update(title, description, price, category);
    return true;
  }

  deleteProduct(productId: number, userId: number): boolean {
    const product = this.findProductById(productId);
    if (!product) return false;

    const user = this.findUserById(userId);
    if (!user) return false;

    if (product.sellerId !== userId && user.role !== UserRole.ADMIN) {
      throw new Error("Нет прав на удаление товара");
    }

    product.status = ProductStatus.DELETED;
    return true;
  }

  incrementProductViews(productId: number): boolean {
    const product = this.findProductById(productId);
    if (!product) return false;

    product.incrementViews();
    return true;
  }

  addToFavorites(productId: number): boolean {
    const product = this.findProductById(productId);
    if (!product) return false;

    product.incrementFavorites();
    return true;
  }

  removeFromFavorites(productId: number): boolean {
    const product = this.findProductById(productId);
    if (!product) return false;

    product.decrementFavorites();
    return true;
  }

  addReview(
    productId: number,
    authorId: number,
    rating: number,
    comment: string,
  ): Review | null {
    const product = this.findProductById(productId);
    if (!product) return null;

    const author = this.findUserById(authorId);
    if (!author) return null;
    const hasPurchased = this.orders.some(
      (o) =>
        o.productId === productId &&
        o.buyerId === authorId &&
        o.status === OrderStatus.DELIVERED,
    );

    const review = new Review(
      this.nextReviewId++,
      productId,
      authorId,
      product.sellerId,
      rating,
      comment,
    );

    if (hasPurchased) {
      review.markAsVerified();
    }

    this.reviews.push(review);

    const seller = this.findUserById(product.sellerId);
    if (seller) {
      seller.updateRating(rating);
    }

    return review;
  }

  getProductReviews(productId: number): Review[] {
    return this.reviews.filter((r) => r.productId === productId);
  }

  getUserReviews(userId: number): Review[] {
    return this.reviews.filter((r) => r.targetUserId === userId);
  }

  getAverageRatingForUser(userId: number): number {
    const userReviews = this.getUserReviews(userId);
    if (userReviews.length === 0) return 0;

    const sum = userReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / userReviews.length;
  }

  createOrder(
    productId: number,
    buyerId: number,
    quantity: number,
    shippingAddress: string,
    paymentMethod: string,
  ): Order | null {
    const product = this.findProductById(productId);
    if (!product) return null;

    const buyer = this.findUserById(buyerId);
    if (!buyer) return null;

    if (product.status !== ProductStatus.AVAILABLE) {
      throw new Error("Товар недоступен для покупки");
    }

    if (buyerId === product.sellerId) {
      throw new Error("Нельзя купить свой собственный товар");
    }

    const totalPrice = product.price * quantity;

    const order = new Order(
      this.nextOrderId++,
      productId,
      buyerId,
      product.sellerId,
      quantity,
      totalPrice,
      shippingAddress,
      paymentMethod,
    );

    this.orders.push(order);

    if (quantity === 1) {
      product.markAsSold();
    }

    return order;
  }

  findOrderById(orderId: number): Order | undefined {
    return this.orders.find((o) => o.id === orderId);
  }

  getUserOrders(userId: number): Order[] {
    return this.orders.filter(
      (o) => o.buyerId === userId || o.sellerId === userId,
    );
  }

  getBuyerOrders(buyerId: number): Order[] {
    return this.orders.filter((o) => o.buyerId === buyerId);
  }

  getSellerOrders(sellerId: number): Order[] {
    return this.orders.filter((o) => o.sellerId === sellerId);
  }

  updateOrderStatus(
    orderId: number,
    userId: number,
    newStatus: OrderStatus,
  ): boolean {
    const order = this.findOrderById(orderId);
    if (!order) return false;

    const user = this.findUserById(userId);
    if (!user) return false;
    if (order.sellerId !== userId && user.role !== UserRole.ADMIN) {
      throw new Error("Только продавец может изменять статус заказа");
    }

    order.updateStatus(newStatus);
    return true;
  }

  cancelOrder(orderId: number, userId: number): boolean {
    const order = this.findOrderById(orderId);
    if (!order) return false;

    if (order.buyerId !== userId) {
      throw new Error("Только покупатель может отменить заказ");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error("Нельзя отменить заказ в текущем статусе");
    }

    order.updateStatus(OrderStatus.CANCELLED);
    return true;
  }

  getSellerStatistics(sellerId: number): {
    totalProducts: number;
    availableProducts: number;
    soldProducts: number;
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
  } | null {
    const seller = this.findUserById(sellerId);
    if (!seller) return null;

    const sellerProducts = this.getProductsBySeller(sellerId);
    const sellerOrders = this.getSellerOrders(sellerId);

    const revenue = sellerOrders
      .filter((o) => o.status === OrderStatus.DELIVERED)
      .reduce((sum, o) => sum + o.totalPrice, 0);

    return {
      totalProducts: sellerProducts.length,
      availableProducts: sellerProducts.filter(
        (p) => p.status === ProductStatus.AVAILABLE,
      ).length,
      soldProducts: sellerProducts.filter(
        (p) => p.status === ProductStatus.SOLD,
      ).length,
      totalOrders: sellerOrders.length,
      totalRevenue: revenue,
      averageRating: seller.rating,
    };
  }

  getMarketplaceStatistics() {
    return {
      totalUsers: this.users.length,
      totalSellers: this.getUsersByRole(UserRole.SELLER).length,
      totalBuyers: this.getUsersByRole(UserRole.BUYER).length,
      totalProducts: this.products.length,
      availableProducts: this.getAvailableProducts().length,
      totalOrders: this.orders.length,
      totalReviews: this.reviews.length,
      totalRevenue: this.orders
        .filter((o) => o.status === OrderStatus.DELIVERED)
        .reduce((sum, o) => sum + o.totalPrice, 0),
    };
  }
}
