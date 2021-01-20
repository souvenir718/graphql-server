const { GraphQLServer } = require('graphql-yoga');

const typeDefs = `
type Query {
    info: String!
}
`;
