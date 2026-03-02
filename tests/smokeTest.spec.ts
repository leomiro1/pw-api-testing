import { test } from '../utils/fixtures';
import { expect } from '../utils/custom-expect';
import articleRequestPayload from '../request-objects/POST-article.json'
import { faker } from '@faker-js/faker'
import { getNewRandomArticle } from '../utils/data-generator';

test('Get Articles', async ({ api }) => {
    
    const response = await api
        .path("/articles")
        .params({limit:10, offset:0})
        .getRequest(200)
    await expect(response).shouldMatchSchema('articles','GET_articles'/*,true*/)
    expect(response.articles.length).shouldBeLessThanOrEqual(10)
    expect(response.articlesCount).shouldEqual(25)
})

test('Get Test tags', async ({ api }) => {

    const response = await api
        .path("/tags")
        .getRequest(200)
    await expect(response).shouldMatchSchema('tags','GET_tags'/*,true*/)    
    expect(response.tags[0]).shouldEqual('Test')
    expect(response.tags.length).shouldBeLessThanOrEqual(10)
})

test('Create & Delete Article', async ({ api }) => {
    const articleRequest = getNewRandomArticle()
    const createArticleResponse = await api
        .path("/articles")
        .body(articleRequest)
        .postRequest(201)
    await expect(createArticleResponse).shouldMatchSchema('articles','POST_articles'/*,true*/)
    expect(createArticleResponse.article.title).shouldEqual(articleRequest.article.title)
    const slugId = createArticleResponse.article.slug

    const articlesResponse = await api
        .path("/articles")
        .params({limit:10, offset:0})
        .getRequest(200)
    
    expect(articlesResponse.articles[0].title).shouldEqual(articleRequest.article.title)

    await api
        .path(`/articles/${slugId}`)
        .deleteRequest(204)

    const articlesResponseTwo = await api
        .path("/articles")
        .params({limit:10, offset:0})
        .getRequest(200)
    
    expect(articlesResponseTwo.articles[0].title).not.shouldEqual(articleRequest.article.title)    

})

test('Create, Update & Delete Article', async ({ api }) => {
    const articleTile = faker.lorem.sentence(5)
    const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload))
    articleRequest.article.title = articleTile   
    const createArticleResponse = await api
        .path("/articles")
        .body(articleRequest)
        .postRequest(201)

    expect(createArticleResponse.article.title).shouldEqual(articleTile)
    const slugId2 = createArticleResponse.article.slug

    const articleTileTwo = faker.lorem.sentence(5)
    articleRequest.article.title = articleTileTwo
    const updateArticleResponse = await api
        .path(`/articles/${slugId2}`)
        .body(articleRequest)
        .putRequest(200)
    
    expect(updateArticleResponse.article.title).shouldEqual(articleTileTwo)
    const newslugId = updateArticleResponse.article.slug

    const articlesResponse = await api
        .path("/articles")
        .params({limit:10, offset:0})
        .getRequest(200)
    
    expect(articlesResponse.articles[0].title).shouldEqual(articleTileTwo)

    await api
        .path(`/articles/${newslugId}`)
        .deleteRequest(204)

    const articlesResponseTwo = await api
        .path("/articles")
        .params({limit:10, offset:0})
        .getRequest(200)
    
    expect(articlesResponseTwo.articles[0].title).not.shouldEqual(articleTileTwo)    

})