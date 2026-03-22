import NextImage from "next/image";
import { cn } from "@/lib/utils";
import type { Experimental_GeneratedImage } from "ai";

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
};

export const Image = ({
  base64,
  _uint8Array,
  mediaType,
  ...props
}: Omit<ImageProps, "uint8Array"> & { _uint8Array?: Uint8Array }) => (
  <NextImage
    {...props}
    alt={props.alt ?? "Generated image"}
    width={512}
    height={512}
    unoptimized
    className={cn(
      "h-auto max-w-full overflow-hidden rounded-md",
      props.className,
    )}
    src={`data:${mediaType};base64,${base64}`}
  />
);
