import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import {
  changeType,
  MemberTypeQueryField,
  MemberTypesQueryField,
} from './queryFields/memberTypes';
import {
  changePost,
  createPost,
  PostQueryField,
  PostsQueryField,
} from './queryFields/posts';
import {
  changeProfile,
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
  changeUser,
} from './queryFields/users';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: createUser,
    changeUser: changeUser,
    addProfile: createProfile,
    changeProfile: changeProfile,
    addPost: createPost,
    changePost: changePost,
    changeType: changeType,
    subscribeToUser: subscribeToUser,
    unsubscribeFrom: unsubscribeFrom,
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
