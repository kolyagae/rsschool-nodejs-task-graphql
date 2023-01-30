import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import {
  MemberTypeQueryField,
  MemberTypesQueryField,
} from './queryFields/memberTypes';
import {
  createPost,
  PostQueryField,
  PostsQueryField,
} from './queryFields/posts';
import {
  createProfile,
  ProfileQueryField,
  ProfilesQueryField,
} from './queryFields/profiles';
import {
  createUser,
  subscribeToUser,
  unsubscribeFrom,
  UserQueryField,
  UsersQueryField,
} from './queryFields/users';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    subscribeToUser: subscribeToUser,
    unsubscribeFrom: unsubscribeFrom,
    addUser: createUser,
    addProfile: createProfile,
    addPost: createPost,
  },
});

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    memberTypes: MemberTypesQueryField,
    posts: PostsQueryField,
    profiles: ProfilesQueryField,
    users: UsersQueryField,
    memberType: MemberTypeQueryField,
    post: PostQueryField,
    profile: ProfileQueryField,
    user: UserQueryField,
  },
});

export const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});
