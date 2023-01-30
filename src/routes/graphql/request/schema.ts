import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import {
  MemberTypeQueryField,
  MemberTypesQueryField,
} from './queryFields/memberTypes';
import { PostQueryField, PostsQueryField } from './queryFields/posts';
import { ProfileQueryField, ProfilesQueryField } from './queryFields/profiles';
import { UserQueryField, UsersQueryField } from './queryFields/users';

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
});
