export class Comment {
  id: number;
  postId: number;
  author: string;
  content: string;
  createdAt: Date;

  constructor(id: number, postId: number, author: string, content: string) {
    this.id = id;
    this.postId = postId;
    this.author = author;
    this.content = content;
    this.createdAt = new Date();
  }
}

export class Post {
  id: number;
  title: string;
  content: string;
  author: string;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;

  constructor(id: number, title: string, content: string, author: string) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.author = author;
    this.comments = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  update(title: string, content: string): void {
    this.title = title;
    this.content = content;
    this.updatedAt = new Date();
  }

  addComment(comment: Comment): void {
    this.comments.push(comment);
  }

  removeComment(commentId: number): boolean {
    const index = this.comments.findIndex((c) => c.id === commentId);
    if (index === -1) return false;
    this.comments.splice(index, 1);
    return true;
  }

  getComments(): Comment[] {
    return [...this.comments];
  }

  getCommentsCount(): number {
    return this.comments.length;
  }
}

export class BlogPlatform {
  private posts: Post[] = [];
  private nextPostId: number = 1;
  private nextCommentId: number = 1;

  createPost(title: string, content: string, author: string): Post {
    if (!title || title.trim().length === 0) {
      throw new Error("Заголовок поста не может быть пустым");
    }
    if (!content || content.trim().length === 0) {
      throw new Error("Содержание поста не может быть пустым");
    }
    if (!author || author.trim().length === 0) {
      throw new Error("Автор не может быть пустым");
    }

    const post = new Post(this.nextPostId++, title, content, author);
    this.posts.push(post);
    return post;
  }

  findPostById(postId: number): Post | undefined {
    return this.posts.find((post) => post.id === postId);
  }

  getAllPosts(): Post[] {
    return [...this.posts];
  }

  getPostsByAuthor(author: string): Post[] {
    return this.posts.filter((post) => post.author === author);
  }

  updatePost(postId: number, title: string, content: string): boolean {
    const post = this.findPostById(postId);
    if (!post) return false;

    post.update(title, content);
    return true;
  }

  deletePost(postId: number): boolean {
    const index = this.posts.findIndex((post) => post.id === postId);
    if (index === -1) return false;

    this.posts.splice(index, 1);
    return true;
  }

  addCommentToPost(
    postId: number,
    author: string,
    content: string,
  ): Comment | null {
    const post = this.findPostById(postId);
    if (!post) return null;

    if (!author || author.trim().length === 0) {
      throw new Error("Автор комментария не может быть пустым");
    }
    if (!content || content.trim().length === 0) {
      throw new Error("Содержание комментария не может быть пустым");
    }

    const comment = new Comment(this.nextCommentId++, postId, author, content);
    post.addComment(comment);
    return comment;
  }

  removeCommentFromPost(postId: number, commentId: number): boolean {
    const post = this.findPostById(postId);
    if (!post) return false;

    return post.removeComment(commentId);
  }

  getCommentsForPost(postId: number): Comment[] | null {
    const post = this.findPostById(postId);
    if (!post) return null;

    return post.getComments();
  }

  getPostsWithComments(): { post: Post; commentsCount: number }[] {
    return this.posts.map((post) => ({
      post: post,
      commentsCount: post.getCommentsCount(),
    }));
  }
}
