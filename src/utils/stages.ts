import { ApplicationStage, ActivityType } from '../types';

export const stageConfig: Record<ApplicationStage, { label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' }> = {
  not_applied: { label: 'Not Applied', color: 'default' },
  applied: { label: 'Applied', color: 'primary' },
  phone_screen: { label: 'Phone Screen', color: 'info' },
  interviewing: { label: 'Interviewing', color: 'info' },
  final_round: { label: 'Final Round', color: 'warning' },
  offer: { label: 'Offer', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
  withdrawn: { label: 'Withdrawn', color: 'default' },
};

export const activityTypeConfig: Record<ActivityType, { label: string; icon: string }> = {
  created: { label: 'Created', icon: 'add_circle' },
  applied: { label: 'Applied', icon: 'send' },
  email_sent: { label: 'Email Sent', icon: 'mail' },
  email_received: { label: 'Email Received', icon: 'inbox' },
  phone_screen: { label: 'Phone Screen', icon: 'phone' },
  interview: { label: 'Interview', icon: 'groups' },
  follow_up: { label: 'Follow Up', icon: 'replay' },
  offer: { label: 'Offer', icon: 'celebration' },
  rejection: { label: 'Rejection', icon: 'cancel' },
  withdrawn: { label: 'Withdrawn', icon: 'exit_to_app' },
  note: { label: 'Note', icon: 'note' },
};

export const stageOrder: ApplicationStage[] = [
  'not_applied',
  'applied',
  'phone_screen',
  'interviewing',
  'final_round',
  'offer',
  'rejected',
  'withdrawn',
];
