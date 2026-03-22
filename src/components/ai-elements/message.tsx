import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, HTMLAttributes } from "react";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      "group flex w-full items-end justify-end gap-2 py-4",
      from === "user" ? "is-user" : "is-assistant flex-row justify-start",
      className,
    )}
    {...props}
  />
);

const messageContentVariants = cva(
  "is-user:dark flex flex-col gap-2 overflow-hidden rounded-3xl text-sm relative",
  {
    variants: {
      variant: {
        contained: [
          "max-w-[70%] px-4 py-3",
          "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground group-[.is-user]:rounded-br-none group-[.is-user]:pr-6",
          "group-[.is-assistant]:bg-secondary group-[.is-assistant]:text-foreground group-[.is-assistant]:rounded-bl-none",
        ],
        flat: [
          "group-[.is-user]:max-w-[80%] group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground",
          "group-[.is-assistant]:text-foreground ",
        ],
      },
    },
    defaultVariants: {
      variant: "contained",
    },
  },
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof messageContentVariants>;

export const MessageContent = ({
  children,
  className,
  variant,
  ...props
}: MessageContentProps) => (
  <div className="relative w-full leading-6 group-[.is-user]:flex group-[.is-user]:justify-end">
    <div
      className={cn(messageContentVariants({ variant, className }))}
      {...props}
    >
      {children}
    </div>
    <div
      className={cn(
        "b-0 absolute bottom-0 z-50 border-r-[5px] border-l-[0px] border-transparent",

        "group-[.is-assistant]:border-secondary group-[.is-assistant]:-left-[5px] group-[.is-assistant]:border-t-[5px] group-[.is-assistant]:border-b-[0px] group-[.is-assistant]:border-t-transparent",

        "group-[.is-user]:border-primary group-[.is-user]:-right-[4px] group-[.is-user]:border-t-[0px] group-[.is-user]:border-b-[5px] group-[.is-user]:border-r-transparent",
      )}
      style={{
        width: 0,
        height: 0,
      }}
    ></div>
  </div>
);

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar className={cn("ring-border size-8 ring-1", className)} {...props}>
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback>{name?.slice(0, 2) ?? "ME"}</AvatarFallback>
  </Avatar>
);
