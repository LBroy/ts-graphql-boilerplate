import "reflect-metadata";
import { GraphQLServer } from "graphql-yoga";
import { createConnection, getConnection } from "typeorm";
import { ResolverMap } from "./types/Resolvers";
import { User } from "./entity/User";
// ... or using `require()`
// const { GraphQLServer } = require('graphql-yoga')

const typeDefs = `
  type User {
    id: Int!
    firstName: String!
    lastName: String!
    age: Int!
    email: String!
  }

  type Query {
    hello(name: String): String!
    user(id: Int!): User!
    users: [User!]!
  }

  type Mutation {
    createUser(firstName: String!, lastName: String!, age: Int!, email: String!): User!
    updateUser(id: Int!, firstName: String, lastname: String, age: Int, email: String): Boolean!
    deleteUser(id: Int!): Boolean!
  }
`;

const resolvers: ResolverMap = {
  Query: {
    hello: (_: any, { name }: any) => `hello ${name || "World"}`,
    user: (_, { id }) => User.findOne(id),
    users: () => User.find()
  },

  Mutation: {
    createUser: (_, args) => {
      const user = User.create(args);
      return user.save();
    },
    updateUser: (_, { id, ...args }) => {
      try {
        User.update(id, args);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
    deleteUser: async (_, { id }) => {
      try {
        await getConnection()
          .createQueryBuilder()
          .delete()
          .from(User)
          .where("id = :id", { id: id })
          .execute();
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    }
  }
};

const server = new GraphQLServer({ typeDefs, resolvers });
createConnection().then(() => {
  server.start(() => console.log("Server is running on localhost:4000"));
});
