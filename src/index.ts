import "reflect-metadata";
import { GraphQLServer } from "graphql-yoga";
import { createConnection, getConnection } from "typeorm";
import { ResolverMap } from "./types/Resolvers";
import { User } from "./entity/User";
import { Profile } from "./entity/Profile";
// ... or using `require()`
// const { GraphQLServer } = require('graphql-yoga')

const typeDefs = `
  type User {
    id: Int!
    firstName: String!
    profile: Profile!
  }

  type Query {
    hello(name: String): String!
    user(id: Int!): User!
    users: [User!]!
  }

  type Profile {
    favoriteColor: String!
  }

  input ProfileInput {
    favoriteColor: String!
  }

  type Mutation {
    createUser(firstName: String!, profile: ProfileInput): User!
    updateUser(id: Int!, firstName: String!): Boolean!
    deleteUser(id: Int!): Boolean!
  }
`;

const resolvers: ResolverMap = {
  Query: {
    hello: (_: any, { name }: any) => `hello ${name || "World"}`,
    user: async (_, { id }) => {
      const user = await User.findOne(id, { relations: ["profile"] });
      console.log(user);
      return user;
    },
    users: () => User.find()
  },

  Mutation: {
    createUser: async (_, args) => {
      const profile = await Profile.create({ ...args.profile });
      console.log(profile);
      await profile.save();

      const user = await User.create({
        firstName: args.firstName
      });

      user.profile = profile;

      await user.save();

      console.log(user);

      return user;
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
