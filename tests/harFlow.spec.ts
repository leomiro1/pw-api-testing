import { test } from '../utils/fixtures';
import { expect } from '../utils/custom-expect';
import { faker } from '@faker-js/faker';
import articleRequestPayload from '../request-objects/POST-article.json' assert { type: 'json' };
import commentRequestPayload from '../request-objects/POST-comment.json' assert { type: 'json' };

test('HAR Flow - Article Lifecycle with Comments', async ({ api }) => {

    // Step 5: Create new article
    const randomTitle = faker.lorem.sentence(4);
    const randomDescription = faker.lorem.sentence(6);
    const randomBody = faker.lorem.paragraphs(2);
    
    const articleRequest = structuredClone(articleRequestPayload);
    articleRequest.article.title = randomTitle;
    articleRequest.article.description = randomDescription;
    articleRequest.article.body = randomBody;

    const createArticleResponse = await api
        .path('/articles')
        .body(articleRequest)
        .postRequest(201);
    await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles', true);
    expect(createArticleResponse.article.title).shouldEqual(randomTitle);
    expect(createArticleResponse.article.description).shouldEqual(randomDescription);
    
    const articleSlug = createArticleResponse.article.slug;

    // Step 6: Get the created article by slug
    const getArticleResponse = await api
        .path(`/articles/${articleSlug}`)
        .getRequest(200);
    await expect(getArticleResponse).shouldMatchSchema('articles', 'GET_article_detail', true);
    expect(getArticleResponse.article.slug).shouldEqual(articleSlug);
    expect(getArticleResponse.article.title).shouldEqual(randomTitle);

    // Step 7: Get comments for the article (should be empty initially)
    const getCommentsEmptyResponse = await api
        .path(`/articles/${articleSlug}/comments`)
        .getRequest(200);
    await expect(getCommentsEmptyResponse).shouldMatchSchema('articles', 'GET_article_comments', true);
    expect(getCommentsEmptyResponse.comments.length).shouldEqual(0);

    // Step 8: Create a comment on the article
    const commentBody = faker.lorem.sentence(10);
    const commentRequest = structuredClone(commentRequestPayload);
    commentRequest.comment.body = commentBody;

    const createCommentResponse = await api
        .path(`/articles/${articleSlug}/comments`)
        .body(commentRequest)
        .postRequest(200);
    await expect(createCommentResponse).shouldMatchSchema('articles', 'POST_article_comment', true);
    expect(createCommentResponse.comment.body).shouldEqual(commentBody);
    expect(createCommentResponse.comment.author.username).toBeDefined();

    const commentId = createCommentResponse.comment.id;

    // Step 9: Verify comment was added by getting comments again
    const getCommentsAfterResponse = await api
        .path(`/articles/${articleSlug}/comments`)
        .getRequest(200);
    await expect(getCommentsAfterResponse).shouldMatchSchema('articles', 'GET_article_comments');
    expect(getCommentsAfterResponse.comments.length).shouldEqual(1);
    expect(getCommentsAfterResponse.comments[0].id).shouldEqual(commentId);
    expect(getCommentsAfterResponse.comments[0].body).shouldEqual(commentBody);
});
