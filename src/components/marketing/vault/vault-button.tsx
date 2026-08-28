import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type VaultButtonVariant = "primary" | "secondary" | "subtle";
type VaultButtonSize = "md" | "sm";

const VARIANT_CLASSES: Record<VaultButtonVariant, string> = {
  primary: "font-semibold bg-vault-gold text-vault-bg hover:bg-vault-gold-light",
  secondary:
    "font-semibold border border-vault-ink/25 text-vault-ink hover:border-vault-ink/40 hover:bg-vault-ink/5",
  subtle: "font-medium text-vault-gold hover:text-vault-gold-light bg-vault-gold/10 hover:bg-vault-gold/18",
};

const SIZE_CLASSES: Record<VaultButtonSize, string> = {
  md: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-sm",
};

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-1.5 rounded-vault leading-none transition-colors";

type CommonProps = {
  variant?: VaultButtonVariant;
  size?: VaultButtonSize;
  className?: string;
  children: ReactNode;
};

type VaultLinkButtonProps = CommonProps & {
  href: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">;

type VaultNativeButtonProps = CommonProps & {
  href?: undefined;
} & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export type VaultButtonProps = VaultLinkButtonProps | VaultNativeButtonProps;

/**
 * The one CTA/link-button primitive for the Vault marketing site. Encodes
 * the 6px-radius rule and the three approved variants once, so pages can't
 * silently reintroduce pill buttons or one-off hex colors.
 */
export function VaultButton(props: VaultButtonProps) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className);

  if (props.href) {
    const { href, ...linkRest } = rest as Omit<VaultLinkButtonProps, "variant" | "size" | "className" | "children">;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ComponentPropsWithoutRef<"button">)}>
      {children}
    </button>
  );
}
