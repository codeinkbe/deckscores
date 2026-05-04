export type AccountPlayer = {
  kind: 'account';
  member_id: string;
  clerk_id: string;
  display_name: string;
};

export type GuestPlayer = {
  kind: 'guest';
  member_id: string;
  display_name: string;
};

export type Player = AccountPlayer | GuestPlayer;

export type Seat = number;

export const playerLabel = (player: Player) => player.display_name;
