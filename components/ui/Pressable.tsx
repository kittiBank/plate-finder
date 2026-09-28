import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

type LinkProps = { href: string } & Omit<ComponentProps<typeof Link>, "href">;
type ButtonProps = { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>;

/** Props shared by every pressable component: a link when `href` is set, otherwise a button. */
export type PressableProps = LinkProps | ButtonProps;

export function Pressable(props: PressableProps) {
  if (props.href !== undefined) {
    return <Link {...props} />;
  }
  const { type = "button", ...rest } = props;
  return <button type={type} {...rest} />;
}
