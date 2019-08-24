'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;
const should = chai.should();
const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogData() {
    let object = [];
    console.log('seeding blog data');
    for(let i = 0; i<10; i++) {
        object.push(generateBlogPostData());
    }
    return BlogPost.insertMany(object);
}

function tearDownDb() {
    console.warn('Deleting Database');
    return new Promise((resolve, reject)=>{
        console.warn('Deleting Database');
        mongoose.connection.dropDatabase()
        .then(result => resolve(result))
        .catch(err => reject(err));
    })
}



function generateBlogPostData() {
    return {
        author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        },
        title: faker.name.title(),
        content: faker.lorem.paragraphs(),
        created: faker.date.recent()
    }
};

describe('BlogPost API Resource', function() {
    before(()=>{
        return runServer(DATABASE_URL);
    });

    beforeEach(()=>{
        return seedBlogData();
    });

    afterEach(()=>{
        return tearDownDb();
    });

    after(()=>{
        return closeServer();
    });

    describe('GET Endpoint', ()=> { 
        it('should return all existing blog-posts', ()=>{

            let res;
            return chai.request(app)
            .get('/posts')
            .then(function(response){
                res = response;
                expect(res).to.have.status(200);
                expect(res.body).to.have.lengthOf.at.least(1);
                return BlogPost.count();
            })
            .then(function(count){
                expect(res.body).to.have.lengthOf(count);
            });
        });

        it('should return one blog post when given an id', ()=>{
            let res;
            let resPost;
            return chai.request(app)
            .get('/posts')
            .then(function(response) {
                res = response;
                expect(res).to.have.status(200);
                expect(res.body).to.have.lengthOf.at.least(1);
                res.body.forEach(function(post){
                    post.should.be.a('object');
                    post.should.include.keys('id','author','content','title','created');
                });
                resPost = res.body[0];
                return(resPost);
            })
            .then(function(post){
                post.title.should.equal(resPost.title);
                post.id.should.equal(resPost.id);
                post.author.should.equal(resPost.author);
                post.content.should.equal(resPost.content);
                post.created.should.equal(resPost.created);
            })
        })
    });

    describe('POST Endpoint', ()=> {
        it('should post a new blogPost accurately', ()=> {
            const newPost = {
                author: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName()
                },
                title: faker.name.title(),
                content: faker.lorem.paragraphs(),
                created: faker.date.recent()
            };
            return chai.request(app)
            .post('/posts')
            .send(newPost)
            .then(res=> {
                res.status.should.equal(201);
                res.body.should.be.a('object');
                res.body.author.should.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
                res.body.title.should.equal(newPost.title);
                res.body.content.should.equal(newPost.content);
                res.body.id.should.not.be.null;
                return res.body.id;
            })
            .then(id => {
                return chai.request(app)
                .get(`/posts/${id}`)
                .then(response => {
                    response.status.should.equal(200);
                    response.body.id.should.equal(id);
                    response.body.title.should.equal(newPost.title);
                    response.body.content.should.equal(newPost.content);
                    response.body.author.should.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
                });
            });
        });
    });

    describe('PUT Endpoint', ()=>{
        it('should update a post', ()=> {
            let updatedPost = {
                title: 'Super Mario',
                content: 'Super Cocaine Adventures with Mario',
                author: 'Nintendo'
            };
            let res;
            return chai.request(app)
            .get('/posts')
            .then(function(response){
                res = response;
                expect(res).to.have.status(200);
                expect(res.body).to.have.lengthOf.at.least(1);
                updatedPost.id = res.body[0].id;
                return res.body[0].id;
            })
            .then(id => {
                return chai.request(app)
                .put(`/posts/${id}`)
                .send(updatedPost)
                .then(res => {
                    res.should.have.status(204);
                    return BlogPost.findById(id)
                })
                .then(post => {
                    post.title.should.equal(updatedPost.title);
                    post.content.should.equal(updatedPost.content);
                    (post.author.toString()).should.equal(updatedPost.author);
                    post.id.should.equal(updatedPost.id);
                });
            });
        });
    });

    describe('Delete Endpoint', () => {
        it('should delete a post', () => {
            let res;
            return chai.request(app)
            .get('/posts')
            .then((response)=>{
                res = response;
                expect(res).to.have.status(200);
                expect(res.body).to.have.length.of.at.least(1);
                console.log('cleo');
                console.log(res.body[0].id);
                return(res.body[0].id);
            })
            .then(id => {
                return chai.request(app)
                .delete(`/${id}`)
                .then(response => {
                    expect(response).to.have.status(204);
                    // expect(response.body)
                    // return id;
                })
                // .then(deletedId => {
                //     return chai.request(app)
                //     .get(`posts/${deletedId}`)
                //     .then(response => {
                //         console.log('honorable');
                //         console.log(response.body);
                //         expect(response).to.have.status(404);
                //         expect(response.body.title).to.not.exist;
                //     })
                // })

            })

        })
    })

    


});
