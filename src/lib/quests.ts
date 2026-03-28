export interface Quest {
  id: string;
  label: string;
  description: string;
  link?: string;
}

export const QUESTS: Quest[] = [
  {
    id: 'coworking',
    label: 'Spend a day at a co-working space',
    description: 'Pick one from our Spaces directory and spend a day there. Nothing beats showing up in person.'
  },
  {
    id: 'attend-event',
    label: 'Attend a local tech event',
    description: 'Meetups, happy hours, conferences — check the directory and put one on your calendar.'
  },
  {
    id: 'follow-ambassadors',
    label: 'Follow the ambassadors',
    description: 'These are the connectors of the ecosystem. Give them a follow and say hi.'
  },
  {
    id: 'join-community',
    label: 'Join a community',
    description: 'Find a group or meeting that matches your interests and introduce yourself.'
  },
  {
    id: 'announce-x',
    label: 'Announce yourself on X',
    description: 'Post that you\'re building in Miami. Tag #MiamiTech so we can find you.'
  }
];
