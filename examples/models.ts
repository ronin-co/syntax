import { blob, boolean, date, json, link, model, number, string } from '@/src/schema';

// @ts-expect-error This dependency must be added in the project.
import { add } from 'ronin';

export const Account = model({
  slug: 'account',

  fields: {
    name: string({ required: true }),
    admin: boolean(),
    followers: number(),
    avatar: blob(),
    birthday: date(),
  },

  indexes: [
    {
      fields: [{ slug: 'name', order: 'ASC', collation: 'BINARY' }],
      unique: true,
    },
  ],

  triggers: [
    {
      when: 'AFTER',
      action: 'INSERT',
      fields: [{ slug: 'name' }],
      // @ts-expect-error: The queries need to be adjusted in the TS client.
      effects: () => [add.member.to({ name: 'admin', email: 'admin@ronin.io' })],
    },
  ],
});

export const Profile = model({
  slug: 'profile',

  fields: {
    test: string(),
    account: link({
      target: 'account',
      actions: {
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
    }),
    bio: json(),
  },
});

export const Team = model({
  slug: 'team',

  fields: {
    // @ts-expect-error This field is already provided by default.
    id: string(),
  },
});

export const Member = model({
  slug: 'member',

  fields: {
    birthday: date(),
  },

  presets: {
    specificSpace: {
      with: {
        space: {
          being: 'spa_m9h8oha94helaji',
        },
      },
      selecting: ['name'],
    },
  },
});
