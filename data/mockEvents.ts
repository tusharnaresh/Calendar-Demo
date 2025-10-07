export interface Event {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  startDateTime: string;
  endDateTime: string;
  type: 'EVENT' | 'SESSION' | 'APPOINTMENT' | 'OFF';
  location?: {
    videoType?: {
      link: string;
      id: string;
      type: string;
    }[];
    type?: string[];
  };
  service?: string[];
  isExternal?: boolean;
  externalSource?: 'google' | 'microsoft';
  label?: string;
  cost?: number;
  eventColor?: 'EVENT_COLOR_ONE' | 'EVENT_COLOR_TWO' | 'EVENT_COLOR_THREE' | 'EVENT_COLOR_FOUR' | 'EVENT_COLOR_FIVE' | 'EVENT_COLOR_SIX' | 'EVENT_COLOR_SEVEN' | 'EVENT_COLOR_EIGHT' | 'EVENT_COLOR_NINE' | 'EVENT_COLOR_TEN';
  colorScheme?: 
    | 'deep-blue' 
    | 'dark-green' 
    | 'green' 
    | 'yellow' 
    | 'gold'
    | 'grey'
    | 'orange' 
    | 'maroon'
    | 'red' 
    | 'violet' 
    | 'pink' 
    | 'light-pink'
    | 'internal-event'
    | 'external-event'
    | 'out-of-office';
  cardState?: 'subtle' | 'medium' | 'active';
}

// Mock events for October 3-10, 2025
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Calendar DSM',
    startTime: new Date('2025-10-03T06:00:00Z').getTime(),
    endTime: new Date('2025-10-03T06:30:00Z').getTime(),
    startDateTime: '2025-10-03T06:00:00Z',
    endDateTime: '2025-10-03T06:30:00Z',
    type: 'EVENT',
    location: {
      videoType: [
        {
          link: 'https://meet.google.com/uoa-xbbh-tvm',
          id: 'uoa-xbbh-tvm',
          type: 'google-meet',
        },
      ],
      type: ['videoType'],
    },
    isExternal: true,
    externalSource: 'google',
  },
  {
    id: '2',
    title: '@Tushar Naresh @Awdhesh Mishra',
    startTime: new Date('2025-10-03T06:45:00Z').getTime(),
    endTime: new Date('2025-10-03T07:15:00Z').getTime(),
    startDateTime: '2025-10-03T06:45:00Z',
    endDateTime: '2025-10-03T07:15:00Z',
    type: 'EVENT',
    location: {},
  },
  {
    id: '3',
    title: 'Switchboard DSM',
    startTime: new Date('2025-10-03T07:30:00Z').getTime(),
    endTime: new Date('2025-10-03T08:00:00Z').getTime(),
    startDateTime: '2025-10-03T07:30:00Z',
    endDateTime: '2025-10-03T08:00:00Z',
    type: 'EVENT',
    location: {
      videoType: [
        {
          link: 'https://meet.google.com/nqf-opdw-oru',
          id: 'nqf-opdw-oru',
          type: 'google-meet',
        },
      ],
      type: ['videoType'],
    },
    isExternal: true,
    externalSource: 'google',
  },
  {
    id: '4',
    title: "Women's Day Webinar",
    startTime: new Date('2025-10-03T08:30:00Z').getTime(),
    endTime: new Date('2025-10-03T09:15:00Z').getTime(),
    startDateTime: '2025-10-03T08:30:00Z',
    endDateTime: '2025-10-03T09:15:00Z',
    type: 'SESSION',
    service: ['b6b35b23-3837-48f1-96ca-e4ba9b14f270'],
    location: {
      videoType: [
        {
          link: 'https://meet.google.com/hvd-rajo-ikf',
          id: 'hvd-rajo-ikf',
          type: 'google-meet',
        },
      ],
      type: ['videoType'],
    },
    label: 'Paid',
    cost: 0,
  },
  {
    id: '5',
    title: 'Product Review Meeting',
    startTime: new Date('2025-10-03T11:00:00Z').getTime(),
    endTime: new Date('2025-10-03T11:42:00Z').getTime(),
    startDateTime: '2025-10-03T11:00:00Z',
    endDateTime: '2025-10-03T11:42:00Z',
    type: 'EVENT',
    service: ['ef58b8dc-e458-41af-a699-5c497f3dc7eb'],
    location: {
      videoType: [
        {
          link: 'https://meet.google.com/ioq-cgdt-bsb',
          id: 'ioq-cgdt-bsb',
          type: 'google-meet',
        },
      ],
      type: ['videoType'],
    },
    label: 'Paid',
    cost: 1,
    isExternal: true,
    externalSource: 'microsoft',
  },
  {
    id: '6',
    title: 'Review',
    startTime: new Date('2025-10-03T11:30:00Z').getTime(),
    endTime: new Date('2025-10-03T12:15:00Z').getTime(),
    startDateTime: '2025-10-03T11:30:00Z',
    endDateTime: '2025-10-03T12:15:00Z',
    type: 'SESSION',
    service: ['1504c57f-c8da-49e6-aa88-6fcb5e4ac72c'],
    location: {
      videoType: [
        {
          link: 'https://meet.google.com/azm-sdpo-ixi',
          id: 'azm-sdpo-ixi',
          type: 'google-meet',
        },
      ],
      type: ['videoType'],
    },
    label: 'No label',
    cost: 0,
  },
  {
    id: '7',
    title: '60 Minutes Meeting',
    startTime: new Date('2025-10-03T13:45:00Z').getTime(),
    endTime: new Date('2025-10-03T15:00:00Z').getTime(),
    startDateTime: '2025-10-03T13:45:00Z',
    endDateTime: '2025-10-03T15:00:00Z',
    type: 'APPOINTMENT',
    service: ['68521f90-23e1-4ccc-89e8-11e75949cd0e'],
    location: {
      videoType: [
        {
          link: 'https://meet.google.com/egt-wssw-bfu',
          id: 'egt-wssw-bfu',
          type: 'google-meet',
        },
      ],
      type: ['videoType'],
    },
    label: 'No label',
    cost: 0,
  },
  {
    id: '8',
    title: 'Sprint Planning | Calendar Component',
    startTime: new Date('2025-10-04T10:30:00Z').getTime(),
    endTime: new Date('2025-10-04T11:30:00Z').getTime(),
    startDateTime: '2025-10-04T10:30:00Z',
    endDateTime: '2025-10-04T11:30:00Z',
    type: 'EVENT',
    location: {
      videoType: [
        {
          link: 'https://meet.google.com/ojm-juof-qut',
          type: 'google-meet',
          id: 'ojm-juof-qut',
        },
      ],
      type: ['videoType'],
    },
  },
  {
    id: '9',
    title: 'All Hands | Setmore',
    startTime: new Date('2025-10-04T12:30:00Z').getTime(),
    endTime: new Date('2025-10-04T13:30:00Z').getTime(),
    startDateTime: '2025-10-04T12:30:00Z',
    endDateTime: '2025-10-04T13:30:00Z',
    type: 'EVENT',
    location: {
      videoType: [
        {
          link: 'https://meet.google.com/gqf-jtmx-cqi',
          id: 'gqf-jtmx-cqi',
          type: 'google-meet',
        },
      ],
      type: ['videoType'],
    },
    isExternal: true,
    externalSource: 'google',
  },
  {
    id: '10',
    title: 'Design System Review',
    startTime: new Date('2025-10-05T08:00:00Z').getTime(),
    endTime: new Date('2025-10-05T09:00:00Z').getTime(),
    startDateTime: '2025-10-05T08:00:00Z',
    endDateTime: '2025-10-05T09:00:00Z',
    type: 'EVENT',
    location: {
      videoType: [
        {
          link: 'https://teams.microsoft.com/l/meetup-join/19',
          id: 'teams-123',
          type: 'microsoft-teams',
        },
      ],
      type: ['videoType'],
    },
    isExternal: true,
    externalSource: 'microsoft',
  },
  {
    id: '11',
    title: 'Customer Onboarding',
    startTime: new Date('2025-10-05T14:00:00Z').getTime(),
    endTime: new Date('2025-10-05T15:00:00Z').getTime(),
    startDateTime: '2025-10-05T14:00:00Z',
    endDateTime: '2025-10-05T15:00:00Z',
    type: 'SESSION',
    service: ['service-123'],
    location: {
      videoType: [
        {
          link: 'https://meet.google.com/xyz-abc-def',
          id: 'xyz-abc-def',
          type: 'google-meet',
        },
      ],
      type: ['videoType'],
    },
  },
  {
    id: '12',
    title: 'Weekly Team Sync',
    startTime: new Date('2025-10-06T09:00:00Z').getTime(),
    endTime: new Date('2025-10-06T10:00:00Z').getTime(),
    startDateTime: '2025-10-06T09:00:00Z',
    endDateTime: '2025-10-06T10:00:00Z',
    type: 'EVENT',
    location: {
      videoType: [
        {
          link: 'https://meet.google.com/weekly-sync',
          id: 'weekly-sync',
          type: 'google-meet',
        },
      ],
      type: ['videoType'],
    },
  },
  {
    id: '13',
    title: 'Training Session - Advanced React',
    startTime: new Date('2025-10-06T15:30:00Z').getTime(),
    endTime: new Date('2025-10-06T17:00:00Z').getTime(),
    startDateTime: '2025-10-06T15:30:00Z',
    endDateTime: '2025-10-06T17:00:00Z',
    type: 'APPOINTMENT',
    service: ['training-react-001'],
    location: {
      videoType: [
        {
          link: 'https://meet.google.com/training-react',
          id: 'training-react',
          type: 'google-meet',
        },
      ],
      type: ['videoType'],
    },
    label: 'Paid',
    cost: 50,
  }
  ,
  {
    id: '14',
    title: 'Product Demo: New Feature',
    startTime: new Date('2025-10-07T10:00:00Z').getTime(),
    endTime: new Date('2025-10-07T11:00:00Z').getTime(),
    startDateTime: '2025-10-07T10:00:00Z',
    endDateTime: '2025-10-07T11:00:00Z',
    type: 'EVENT',
    location: {
      videoType: [
        {
          link: 'https://meet.google.com/product-demo',
          id: 'product-demo',
          type: 'google-meet',
        },
      ],
      type: ['videoType'],
    },
  },
  {
    id: '15',
    title: '1:1 with Manager',
    startTime: new Date('2025-10-08T13:00:00Z').getTime(),
    endTime: new Date('2025-10-08T13:30:00Z').getTime(),
    startDateTime: '2025-10-08T13:00:00Z',
    endDateTime: '2025-10-08T13:30:00Z',
    type: 'APPOINTMENT',
    location: {},
  },
  {
    id: '16',
    title: 'Marketing Sync',
    startTime: new Date('2025-10-09T09:30:00Z').getTime(),
    endTime: new Date('2025-10-09T10:30:00Z').getTime(),
    startDateTime: '2025-10-09T09:30:00Z',
    endDateTime: '2025-10-09T10:30:00Z',
    type: 'EVENT',
    location: {
      videoType: [
        {
          link: 'https://meet.google.com/marketing-sync',
          id: 'marketing-sync',
          type: 'google-meet',
        },
      ],
      type: ['videoType'],
    },
    isExternal: true,
    externalSource: 'google',
  },
  {
    id: '17',
    title: 'Sprint Retrospective',
    startTime: new Date('2025-10-10T16:00:00Z').getTime(),
    endTime: new Date('2025-10-10T17:00:00Z').getTime(),
    startDateTime: '2025-10-10T16:00:00Z',
    endDateTime: '2025-10-10T17:00:00Z',
    type: 'SESSION',
    service: ['retro-001'],
    location: {},
  },
  {
    id: '18',
    title: 'Morning Yoga',
    startTime: new Date('2025-10-11T08:00:00Z').getTime(),
    endTime: new Date('2025-10-11T09:00:00Z').getTime(),
    startDateTime: '2025-10-11T08:00:00Z',
    endDateTime: '2025-10-11T09:00:00Z',
    type: 'APPOINTMENT',
    location: {},
  },
  {
    id: '19',
    title: 'Weekend Workshop: Design Thinking',
    startTime: new Date('2025-10-12T18:00:00Z').getTime(),
    endTime: new Date('2025-10-12T19:30:00Z').getTime(),
    startDateTime: '2025-10-12T18:00:00Z',
    endDateTime: '2025-10-12T19:30:00Z',
    type: 'SESSION',
    location: {
      videoType: [
        {
          link: 'https://meet.google.com/weekend-workshop',
          id: 'weekend-workshop',
          type: 'google-meet',
        },
      ],
      type: ['videoType'],
    },
    label: 'Paid',
  }
];
