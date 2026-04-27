export type AccountPlayer = {
  kind: 'account';
  clerk_id: string;
  display_name: string;
};

export type GuestPlayer = {
  kind: 'guest';
  display_name: string;
};

export type Player = AccountPlayer | GuestPlayer;

export type Seat = number;

export const playerLabel = (player: Player) => player.display_name;
