const { GraphQLServer } = require('graphql-yoga');
const { prisma } = require('./generated/prisma-client');
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const User = require('./resolvers/User');
const Link = require('./resolvers/Link');
const Subscription = require('./resolvers/Subscription');
const Vote = require('./resolvers/Vote');

/*
    typeDefs 상수는 GraphQL 스키마를 정의한 것이다.
    여기서 정의한 것은 간단한 Query 타입으로, info라는 필드 하나를 갖는다.
    이 필드는 String! 타입이고, 느낌표가 붙는 것은 null이 될 수 없다는 의미다.

 const typeDefs = `
 type Query {
     info: String!
 }
 `;
*/

/*
    Link라는 새로운 타입을 정의했고, 이 타입은 Hacker News에 게시될 수 있는 링크를 나타낸다.
    각 Link는 id, description, url을 가질 수 있다.
    다음으로 Query 타입에 새로운 최상위 필드를 추가하면, 이제 Link 항목의 리스트를 반환할 수 있게 된다.
    두 개의 느낌표는 리스트는 절대로 null이 아님이 보장되고(적어도 빈 리스트),
    리스트에 포함된 항목 또한 null이 아님이 보장된다.
*/
/*
    schema.graphql 파일로 이동
const typeDefs = `
    type Query {
        info: String!
        feed: [Link!]!
    }
    
    type Mutation {
        post(url: String!, description: String!): Link!
    }

    type Link {
        id: ID!
        description: String!
        url: String!
    }
    `;
*/

/*
    DB에서 불러올 것으로 더이상 필요 X
let links = [
    {
        id: 'link-0',
        url: 'www.howtographql.com',
        description: 'Fullstack tutorial for GraphQL',
    },
];*/

/*
    resolvers 객체는 GraphQL 스키마의 실제 구현이다.
    스키마의 구조가 typeDefs : Query.info의 구조와 같다는 점을 주목

const resolvers = {
    Query: {
        info: () => `Hackernews Clone의 API입니다.`,
    },
};
*/

/*
    link 변수는 실행시간 중에 각 링크들을 저장하는 데에 사용되는 변수다.
    feed라는 최상위 필드를 위한 새로운 리졸버를 추가했다. 리졸버의 이름은 항상 스키마의 정의에 대응하는
    필드 이름과 항상 같아야 한다.
    스키마 정의에 따라 Link 타입의 각 필드에 대응하는 3가지 리졸버들을 새롭게 추가했다.
*/

// let idCount = links.length; // 새로 생성되는 Link 항목에 대한 고유한 ID 값으로 사용할 새로운 정수 변수를 추가.
const resolvers = {
    Query,
    Mutation,
    Subscription,
    User,
    Link,
    Vote,
    /*
    Query: {
        info: () => `This is the API of a Hackernews Clone`,
        feed: () => links,
    },
    */

    /*
    Query: {
        info: () => `This is the API of a Hackernews Clone`,
        feed: (root, args, context, info) => {
            return context.prisma.links();
        },
    },
    */
    /*
    Mutation: {
        // post 리졸버는 우선 새로운 link 객체를 생성하고, 이것을 기존의 links 리스트에 추가한 뒤 최종적으로 새로 생성된 link를 반환한다.
        post: (parent, args) => {
            const link = {
                id: `link-${idCount++}`,
                description: args.description,
                url: args.url,
            };
            links.push(link);
            return link;
        },
    },*/
    /*
    Mutation: {
        post: (root, args, context) => {
            return context.prisma.createLink({
                url: args.url,
                description: args.description,
            });
        },
    },*/

    /* Link 타입에 대하여 해야할 일을 스스로 추론해 낼 수 있으므로 제거.
    Link: {
        id: (parent) => parent.id,
        description: (parent) => parent.description,
        url: (parent) => parent.url,
    },*/
};

/*
    스키마와 리졸버를 묶어서 GraphQLServer에 전달했다.
    GraphQLServer는 graphql-yoga로부터 불러왔다. 이를 통하여
    서버가 어떤 API 동작을 수행할 수 있고 어떻게 리졸브할지를 정하게 된다.
*/
const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context: (request) => {
        return {
            ...request,
            prisma,
        };
    },
    // GraphQL 리졸버에서 사용되는 context 객체는 이 시점에 초기화된다.
    // context 객체에 prisma 클라이언트 인스턴스를 추가하므로, 리졸버에서 context.prisma에 접근할 수 있게 된다.
});
server.start(() => console.log(`http://localhost:4000에서 서버 가동중`));
