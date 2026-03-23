const FALLBACK_USER_NAME = "User";

export function getInitials(name?: string | null) {
  const normalizedName = name?.trim();

  if (!normalizedName) {
    return "U";
  }

  const parts = normalizedName.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    const [firstPart = FALLBACK_USER_NAME] = parts;
    return firstPart.slice(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function createAvatarUrl(name?: string | null) {
  const seed = name?.trim() || FALLBACK_USER_NAME;
  return `https://api.dicebear.com/9.x/big-smile/svg?accessories[]&accessoriesProbability=0&hair=wavyBob,straightHair,shortHair&mouth=teethSmile,openedSmile&skinColor=efcc9f,c99c62,a47539,e2ba87&seed=${encodeURIComponent(seed)}`;
}

export function resolveUserAvatarImage(
  name?: string | null,
  image?: string | null,
) {
  const normalizedImage = image?.trim();

  if (!normalizedImage) {
    return createAvatarUrl(name);
  }

  try {
    const url = new URL(normalizedImage);

    if (url.hostname === "avatar.iran.liara.run") {
      return createAvatarUrl(name);
    }
  } catch {
    return createAvatarUrl(name);
  }

  return normalizedImage;
}
