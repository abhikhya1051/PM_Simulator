export const PLAYER_AVATARS = [
  {
    id: "sage",
    label: "Sage",
    background: "#e4ecdf",
    skin: "#9b634b",
    hair: "#302d2a",
    clothing: "#78977f",
    hairstyle: "curls",
  },
  {
    id: "clay",
    label: "Clay",
    background: "#f4e2d7",
    skin: "#f0c29e",
    hair: "#584238",
    clothing: "#c77e65",
    hairstyle: "waves",
  },
  {
    id: "dusk",
    label: "Dusk",
    background: "#e8e4ec",
    skin: "#b77c5e",
    hair: "#29282c",
    clothing: "#89839d",
    hairstyle: "crop",
  },
  {
    id: "amber",
    label: "Amber",
    background: "#f3ead1",
    skin: "#d89971",
    hair: "#45352d",
    clothing: "#c1a04f",
    hairstyle: "locs",
  },
] as const;

export type PlayerAvatarId = (typeof PLAYER_AVATARS)[number]["id"];

type PlayerAvatarProps = {
  id: PlayerAvatarId;
  size?: number;
  className?: string;
};

const hairstylePaths = {
  curls:
    "M19 39c-3-13 3-27 15-30 13-4 26 5 27 19l-4 13-5-8-2-11-10-4-13 4-3 12z",
  waves:
    "M19 43c-4-11-2-26 10-31 13-6 27 2 30 15 1 6-1 13-3 17l-5-6-2-13c-8 6-18 8-29 6l-1 12z",
  crop:
    "M20 34c-1-13 7-23 20-23 13 0 21 9 20 23l-5-5c-9 3-21 3-30-1z",
  locs:
    "M19 39c-2-14 5-27 18-29 14-2 25 8 24 24l-3 13-5-8-2-15-5 2-4-6-5 5-5-3-4 7-6-1z",
} as const;

export function PlayerAvatar({
  id,
  size = 56,
  className,
}: PlayerAvatarProps) {
  const avatar = PLAYER_AVATARS.find((option) => option.id === id) ?? PLAYER_AVATARS[0];

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="40" cy="40" r="39" fill={avatar.background} />
      <path
        d="M8 80c2-16 14-25 32-25s30 9 32 25H8Z"
        fill={avatar.clothing}
      />
      <path d="M33 49h14v13H33z" fill={avatar.skin} />
      <ellipse cx="40" cy="37" rx="18" ry="21" fill={avatar.skin} />
      <path d={hairstylePaths[avatar.hairstyle]} fill={avatar.hair} />
      <path
        d="M31 39h1m16 0h1"
        stroke="#42352e"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M36 48c2 2 6 2 8 0"
        stroke="#8e5748"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M29 63c4 4 18 4 22 0"
        stroke="#f6e9dd"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
