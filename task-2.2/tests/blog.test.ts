import { describe, beforeEach, test, expect } from "@jest/globals";
import { BlogPlatform, Post, Comment } from "../src/blog";

describe("Blog Platform Tests", () => {
  let blog: BlogPlatform;

  beforeEach(() => {
    blog = new BlogPlatform();
  });

  test("Тест 1: Создание поста", () => {
    const post = blog.createPost(
      "Мой первый пост",
      "Это содержание моего первого поста",
      "Иван Петров",
    );

    expect(post.id).toBe(1);
    expect(post.title).toBe("Мой первый пост");
    expect(post.content).toBe("Это содержание моего первого поста");
    expect(post.author).toBe("Иван Петров");
    expect(post.comments.length).toBe(0);
    expect(post.createdAt).toBeDefined();
    expect(post.updatedAt).toBeDefined();
  });

  test("Тест 2: Создание поста с ошибками валидации", () => {
    expect(() => {
      blog.createPost("", "Контент", "Автор");
    }).toThrow("Заголовок поста не может быть пустым");

    expect(() => {
      blog.createPost("Заголовок", "", "Автор");
    }).toThrow("Содержание поста не может быть пустым");

    expect(() => {
      blog.createPost("Заголовок", "Контент", "");
    }).toThrow("Автор не может быть пустым");
  });

  test("Тест 3: Получение всех постов", () => {
    blog.createPost("Пост 1", "Содержание 1", "Автор 1");
    blog.createPost("Пост 2", "Содержание 2", "Автор 2");
    blog.createPost("Пост 3", "Содержание 3", "Автор 1");

    const allPosts = blog.getAllPosts();

    expect(allPosts.length).toBe(3);
    expect(allPosts[0].title).toBe("Пост 1");
    expect(allPosts[1].title).toBe("Пост 2");
    expect(allPosts[2].title).toBe("Пост 3");
  });

  test("Тест 4: Поиск поста по ID", () => {
    const post1 = blog.createPost("Пост 1", "Содержание 1", "Автор 1");
    const post2 = blog.createPost("Пост 2", "Содержание 2", "Автор 2");

    const foundPost = blog.findPostById(post1.id);
    expect(foundPost).toBeDefined();
    expect(foundPost?.title).toBe("Пост 1");

    const notFoundPost = blog.findPostById(999);
    expect(notFoundPost).toBeUndefined();
  });

  test("Тест 5: Получение постов по автору", () => {
    blog.createPost("Пост 1", "Содержание 1", "Иван");
    blog.createPost("Пост 2", "Содержание 2", "Петр");
    blog.createPost("Пост 3", "Содержание 3", "Иван");
    blog.createPost("Пост 4", "Содержание 4", "Мария");

    const ivanPosts = blog.getPostsByAuthor("Иван");
    const petrPosts = blog.getPostsByAuthor("Петр");

    expect(ivanPosts.length).toBe(2);
    expect(petrPosts.length).toBe(1);
    expect(ivanPosts[0].title).toBe("Пост 1");
    expect(ivanPosts[1].title).toBe("Пост 3");
  });

  test("Тест 6: Редактирование поста", () => {
    const post = blog.createPost(
      "Старый заголовок",
      "Старое содержание",
      "Автор",
    );

    const updateResult = blog.updatePost(
      post.id,
      "Новый заголовок",
      "Новое содержание",
    );

    expect(updateResult).toBe(true);
    expect(post.title).toBe("Новый заголовок");
    expect(post.content).toBe("Новое содержание");
    expect(post.updatedAt).not.toBe(post.createdAt);
  });

  test("Тест 7: Редактирование несуществующего поста", () => {
    const updateResult = blog.updatePost(
      999,
      "Новый заголовок",
      "Новое содержание",
    );

    expect(updateResult).toBe(false);
  });

  test("Тест 8: Удаление поста", () => {
    blog.createPost("Пост 1", "Содержание 1", "Автор 1");
    const postToDelete = blog.createPost("Пост 2", "Содержание 2", "Автор 2");
    blog.createPost("Пост 3", "Содержание 3", "Автор 3");

    expect(blog.getAllPosts().length).toBe(3);

    const deleteResult = blog.deletePost(postToDelete.id);

    expect(deleteResult).toBe(true);
    expect(blog.getAllPosts().length).toBe(2);
    expect(blog.findPostById(postToDelete.id)).toBeUndefined();
  });

  test("Тест 9: Удаление несуществующего поста", () => {
    blog.createPost("Пост 1", "Содержание 1", "Автор 1");

    const deleteResult = blog.deletePost(999);

    expect(deleteResult).toBe(false);
    expect(blog.getAllPosts().length).toBe(1);
  });

  test("Тест 10: Добавление комментария к посту", () => {
    const post = blog.createPost("Пост", "Содержание", "Автор поста");

    const comment = blog.addCommentToPost(
      post.id,
      "Читатель Иван",
      "Отличный пост!",
    );

    expect(comment).not.toBeNull();
    expect(comment?.id).toBe(1);
    expect(comment?.postId).toBe(post.id);
    expect(comment?.author).toBe("Читатель Иван");
    expect(comment?.content).toBe("Отличный пост!");
    expect(post.getCommentsCount()).toBe(1);
  });

  test("Тест 11: Добавление комментария с ошибками валидации", () => {
    const post = blog.createPost("Пост", "Содержание", "Автор");

    expect(() => {
      blog.addCommentToPost(post.id, "", "Комментарий");
    }).toThrow("Автор комментария не может быть пустым");

    expect(() => {
      blog.addCommentToPost(post.id, "Автор", "");
    }).toThrow("Содержание комментария не может быть пустым");
  });

  test("Тест 12: Добавление комментария к несуществующему посту", () => {
    const comment = blog.addCommentToPost(999, "Автор", "Комментарий");

    expect(comment).toBeNull();
  });

  test("Тест 13: Получение всех комментариев поста", () => {
    const post = blog.createPost("Пост", "Содержание", "Автор");

    blog.addCommentToPost(post.id, "Иван", "Комментарий 1");
    blog.addCommentToPost(post.id, "Петр", "Комментарий 2");
    blog.addCommentToPost(post.id, "Мария", "Комментарий 3");

    const comments = blog.getCommentsForPost(post.id);

    expect(comments).not.toBeNull();
    expect(comments?.length).toBe(3);
    expect(comments?.[0].author).toBe("Иван");
    expect(comments?.[1].author).toBe("Петр");
    expect(comments?.[2].author).toBe("Мария");
  });

  test("Тест 14: Удаление комментария", () => {
    const post = blog.createPost("Пост", "Содержание", "Автор");

    blog.addCommentToPost(post.id, "Иван", "Комментарий 1");
    blog.addCommentToPost(post.id, "Петр", "Комментарий 2");
    const commentToDelete = blog.addCommentToPost(
      post.id,
      "Мария",
      "Комментарий 3",
    );

    expect(post.getCommentsCount()).toBe(3);

    const deleteResult = blog.removeCommentFromPost(
      post.id,
      commentToDelete!.id,
    );

    expect(deleteResult).toBe(true);
    expect(post.getCommentsCount()).toBe(2);
  });

  test("Тест 15: Удаление несуществующего комментария", () => {
    const post = blog.createPost("Пост", "Содержание", "Автор");
    blog.addCommentToPost(post.id, "Иван", "Комментарий");

    const deleteResult = blog.removeCommentFromPost(post.id, 999);

    expect(deleteResult).toBe(false);
    expect(post.getCommentsCount()).toBe(1);
  });

  test("Тест 16: Удаление комментария из несуществующего поста", () => {
    const deleteResult = blog.removeCommentFromPost(999, 1);

    expect(deleteResult).toBe(false);
  });

  test("Тест 17: Автоматическое присвоение ID постам", () => {
    const post1 = blog.createPost("Пост 1", "Содержание 1", "Автор 1");
    const post2 = blog.createPost("Пост 2", "Содержание 2", "Автор 2");
    const post3 = blog.createPost("Пост 3", "Содержание 3", "Автор 3");

    expect(post1.id).toBe(1);
    expect(post2.id).toBe(2);
    expect(post3.id).toBe(3);
  });

  test("Тест 18: Автоматическое присвоение ID комментариям", () => {
    const post = blog.createPost("Пост", "Содержание", "Автор");

    const comment1 = blog.addCommentToPost(post.id, "Иван", "Коммент 1");
    const comment2 = blog.addCommentToPost(post.id, "Петр", "Коммент 2");
    const comment3 = blog.addCommentToPost(post.id, "Мария", "Коммент 3");

    expect(comment1?.id).toBe(1);
    expect(comment2?.id).toBe(2);
    expect(comment3?.id).toBe(3);
  });

  test("Тест 19: Получение постов с количеством комментариев", () => {
    const post1 = blog.createPost("Пост 1", "Содержание 1", "Автор 1");
    const post2 = blog.createPost("Пост 2", "Содержание 2", "Автор 2");
    const post3 = blog.createPost("Пост 3", "Содержание 3", "Автор 3");

    blog.addCommentToPost(post1.id, "Иван", "Коммент 1");
    blog.addCommentToPost(post1.id, "Петр", "Коммент 2");
    blog.addCommentToPost(post2.id, "Мария", "Коммент 3");

    const postsWithComments = blog.getPostsWithComments();

    expect(postsWithComments.length).toBe(3);
    expect(postsWithComments[0].post.id).toBe(post1.id);
    expect(postsWithComments[0].commentsCount).toBe(2);
    expect(postsWithComments[1].commentsCount).toBe(1);
    expect(postsWithComments[2].commentsCount).toBe(0);
  });

  test("Тест 20: Негативные сценарии", () => {
    expect(blog.findPostById(999)).toBeUndefined();
    expect(blog.getPostsByAuthor("Несуществующий автор")).toEqual([]);
    expect(blog.updatePost(999, "Заголовок", "Содержание")).toBe(false);
    expect(blog.deletePost(999)).toBe(false);
    expect(blog.addCommentToPost(999, "Автор", "Комментарий")).toBeNull();
    expect(blog.getCommentsForPost(999)).toBeNull();
    expect(blog.removeCommentFromPost(999, 1)).toBe(false);
  });
});